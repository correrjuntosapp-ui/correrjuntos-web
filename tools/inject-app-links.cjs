#!/usr/bin/env node
/**
 * inject-app-links.cjs
 * Injects al:ios, al:android, al:web App Links Protocol meta tags
 * into all blog HTML files (and other public pages).
 *
 * These tags tell WhatsApp, Instagram, Telegram, X (Twitter), and Facebook
 * to open the native app instead of the browser when someone taps a shared link.
 *
 * Usage: node tools/inject-app-links.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');
// No external dependencies — uses native fs for file discovery

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.resolve(__dirname, '..');

// App constants
const APP_STORE_ID = '6758505910';
const APP_NAME = 'Correr Juntos';
const ANDROID_PACKAGE = 'com.correrjuntos.app';
const BASE_URL = 'https://www.correrjuntos.com';

// Marker to detect if already injected
const MARKER = 'al:ios:app_store_id';

/**
 * Generate the App Links meta tags for a given page URL
 */
function generateAppLinksTags(pageUrl) {
  return [
    '',
    '<!-- App Links Protocol — Deep linking from social apps -->',
    `<meta property="al:ios:app_store_id" content="${APP_STORE_ID}">`,
    `<meta property="al:ios:app_name" content="${APP_NAME}">`,
    `<meta property="al:ios:url" content="${pageUrl}">`,
    `<meta property="al:android:package" content="${ANDROID_PACKAGE}">`,
    `<meta property="al:android:app_name" content="${APP_NAME}">`,
    `<meta property="al:android:url" content="${pageUrl}">`,
    `<meta property="al:web:url" content="${pageUrl}">`,
  ].join('\n');
}

/**
 * Extract the canonical URL from HTML content
 */
function extractCanonicalUrl(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Extract the og:url from HTML content (fallback)
 */
function extractOgUrl(html) {
  const match = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Inject App Links tags into an HTML file
 * Inserts after the last twitter: meta tag, before JSON-LD script
 */
function injectIntoFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has App Links tags
  if (html.includes(MARKER)) {
    return { status: 'skipped', reason: 'already has app links' };
  }

  // Get page URL from canonical or og:url
  const pageUrl = extractCanonicalUrl(html) || extractOgUrl(html);
  if (!pageUrl) {
    return { status: 'skipped', reason: 'no canonical/og:url found' };
  }

  const tags = generateAppLinksTags(pageUrl);

  // Strategy 1: Insert after last twitter: meta tag
  const twitterPattern = /<meta\s+name="twitter:image"[^>]*>/;
  const twitterMatch = html.match(twitterPattern);

  if (twitterMatch) {
    const insertPos = html.indexOf(twitterMatch[0]) + twitterMatch[0].length;
    const newHtml = html.slice(0, insertPos) + tags + html.slice(insertPos);

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
    }
    return { status: 'injected', url: pageUrl };
  }

  // Strategy 2: Insert after og:locale meta tag
  const ogLocalePattern = /<meta\s+property="og:locale"[^>]*>/;
  const ogLocaleMatch = html.match(ogLocalePattern);

  if (ogLocaleMatch) {
    const insertPos = html.indexOf(ogLocaleMatch[0]) + ogLocaleMatch[0].length;
    const newHtml = html.slice(0, insertPos) + tags + html.slice(insertPos);

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
    }
    return { status: 'injected', url: pageUrl };
  }

  // Strategy 3: Insert before first <script type="application/ld+json">
  const jsonLdPattern = /<script\s+type="application\/ld\+json">/;
  const jsonLdMatch = html.match(jsonLdPattern);

  if (jsonLdMatch) {
    const insertPos = html.indexOf(jsonLdMatch[0]);
    const newHtml = html.slice(0, insertPos) + tags + '\n' + html.slice(insertPos);

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
    }
    return { status: 'injected', url: pageUrl };
  }

  return { status: 'skipped', reason: 'no insertion point found' };
}

/**
 * Recursively find HTML files
 */
function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Recurse into subdirectories (en/, etc.)
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

// ── Main ──
console.log(`\n🔗 App Links Injector ${DRY_RUN ? '(DRY RUN)' : ''}`);
console.log('─'.repeat(50));

// Directories to process
const directories = [
  path.join(ROOT, 'blog'),
  path.join(ROOT, 'planes'),
  path.join(ROOT, 'cities'),
  path.join(ROOT, 'places'),
  path.join(ROOT, 'events'),
  path.join(ROOT, 'equipamiento'),
  path.join(ROOT, 'matching'),
  path.join(ROOT, 'recursos'),
];

let totalFiles = 0;
let injectedCount = 0;
let skippedCount = 0;
let errorCount = 0;

for (const dir of directories) {
  if (!fs.existsSync(dir)) {
    continue;
  }

  const files = findHtmlFiles(dir);
  const dirName = path.relative(ROOT, dir);

  console.log(`\n📁 ${dirName}/ — ${files.length} files`);

  for (const file of files) {
    totalFiles++;
    try {
      const result = injectIntoFile(file);
      const relPath = path.relative(ROOT, file);

      if (result.status === 'injected') {
        injectedCount++;
        if (DRY_RUN || injectedCount <= 5) {
          console.log(`  ✅ ${relPath}`);
        }
      } else {
        skippedCount++;
        if (DRY_RUN) {
          console.log(`  ⏭  ${relPath} — ${result.reason}`);
        }
      }
    } catch (err) {
      errorCount++;
      console.error(`  ❌ ${path.relative(ROOT, file)} — ${err.message}`);
    }
  }
}

console.log('\n' + '─'.repeat(50));
console.log(`📊 Total: ${totalFiles} files`);
console.log(`   ✅ Injected: ${injectedCount}`);
console.log(`   ⏭  Skipped: ${skippedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
if (DRY_RUN) {
  console.log('\n⚠️  DRY RUN — no files were modified. Run without --dry-run to apply.');
}
console.log('');
