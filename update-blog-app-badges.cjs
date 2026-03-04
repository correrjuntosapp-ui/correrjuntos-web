#!/usr/bin/env node
/**
 * Batch script: Update blog article CTA boxes
 * - Replaces disabled Android "mar 2026" span with active Google Play link
 * - Uses the same style as the iOS App Store badge
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';

// The old Android span pattern (grayed out, disabled)
// Matches both "Android mar 2026" (ES) and "Android Mar 2026" (EN)
const OLD_ANDROID_REGEX = /<span style="display:inline-flex;align-items:center;gap:8px;background:rgba\(255,255,255,\.04\);color:#64748b;padding:10px 20px;border-radius:12px;font-size:\.85rem;border:1px solid rgba\(255,255,255,\.08\)"><svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="#94a3b8"><path d="M17\.6 11\.4c0-\.6-\.5-1-1-1s-1 \.5-1 1 \.5 1 1 1 1-\.5 1-1m-10\.2 0c0-\.6-\.5-1-1-1s-1 \.5-1 1 \.5 1 1 1 1-\.5 1-1m10\.5-3\.7l1\.8-3\.1c\.1-\.2 0-\.4-\.2-\.5-\.2-\.1-\.4 0-\.5\.2l-1\.8 3\.1c-1\.4-\.6-3-1-4\.6-1s-3\.2\.4-4\.6 1L6\.2 4\.3c-\.1-\.2-\.3-\.3-\.5-\.2-\.2\.1-\.3\.3-\.2\.5l1\.8 3\.1C4\.5 9\.4 2\.5 12\.4 2 16h20c-\.5-3\.6-2\.5-6\.6-5\.1-8\.3"\/><\/svg> Android [Mm]ar 2026<\/span>/g;

// New Android badge: active link with Google Play SVG (same style as App Store badge)
const NEW_ANDROID_BADGE = `<a href="${PLAY_STORE_URL}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#000;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:600;font-size:.9rem;border:1px solid rgba(255,255,255,.2);transition:transform .2s"><svg style="width:20px;height:20px" viewBox="0 0 24 24"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464l.001 1z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg> Google Play</a>`;

function getAllHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
      results.push(fullPath);
    }
  }
  return results;
}

let updated = 0;
let skipped = 0;
let errors = 0;

const files = getAllHtmlFiles(BLOG_DIR);
console.log(`Found ${files.length} HTML files in blog/`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf-8');

    if (!OLD_ANDROID_REGEX.test(content)) {
      // Reset regex lastIndex for global flag
      OLD_ANDROID_REGEX.lastIndex = 0;
      skipped++;
      continue;
    }

    OLD_ANDROID_REGEX.lastIndex = 0;
    const newContent = content.replace(OLD_ANDROID_REGEX, NEW_ANDROID_BADGE);

    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf-8');
      updated++;
      const rel = path.relative(__dirname, file);
      console.log(`  ✅ ${rel}`);
    } else {
      skipped++;
    }
  } catch (err) {
    errors++;
    console.error(`  ❌ ${path.relative(__dirname, file)}: ${err.message}`);
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
