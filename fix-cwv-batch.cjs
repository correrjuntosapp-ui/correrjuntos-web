/**
 * fix-cwv-batch.cjs
 * Batch script to fix Core Web Vitals issues across all blog HTML files.
 *
 * Fixes applied:
 *   1. Remove orphaned Google Fonts preconnect links (all files incl. index.html)
 *   2. Add fetchpriority="high" to hero images with loading="eager"
 *   3. Add width="1200" height="500" to hero Pexels images inside .hero-bg
 *   4. Add width="300" height="150" to city-links.js images
 *   5. Process blog/index.html and blog/en/index.html for preconnect removal
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BLOG_DIR = path.join(ROOT, 'blog');
const BLOG_EN_DIR = path.join(ROOT, 'blog', 'en');
const CITY_LINKS_JS = path.join(BLOG_DIR, 'city-links.js');

// Counters
const stats = {
  filesProcessed: 0,
  filesChanged: 0,
  preconnectRemoved: 0,
  fetchpriorityAdded: 0,
  heroWidthHeightAdded: 0,
  cityLinksFixed: 0,
};

/**
 * Collect all .html files from a directory (non-recursive).
 */
function getHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));
}

/**
 * Fix #1: Remove orphaned Google Fonts preconnect links.
 * Handles variations in whitespace and line placement.
 */
function removePreconnect(html) {
  let count = 0;
  // Remove <link rel="preconnect" href="https://fonts.googleapis.com">
  const re1 = /\s*<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.googleapis\.com["']\s*\/?>\s*/g;
  html = html.replace(re1, (match) => { count++; return '\n'; });

  // Remove <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  const re2 = /\s*<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.gstatic\.com["']\s+crossorigin\s*\/?>\s*/g;
  html = html.replace(re2, (match) => { count++; return '\n'; });

  return { html, count };
}

/**
 * Fix #2: Add fetchpriority="high" to hero images that have loading="eager"
 * but don't already have fetchpriority.
 */
function addFetchpriority(html) {
  let count = 0;
  // Match img tags with loading="eager" that do NOT already have fetchpriority
  // We look for loading="eager"> specifically (end of img tag attributes)
  html = html.replace(
    /(<img\s[^>]*?)loading="eager">/gi,
    (match, prefix) => {
      if (/fetchpriority/i.test(match)) return match; // already has it
      count++;
      return prefix + 'loading="eager" fetchpriority="high">';
    }
  );
  return { html, count };
}

/**
 * Fix #3: Add width="1200" height="500" to hero Pexels images inside .hero-bg divs.
 * Pattern: <div class="hero-bg"><img src="https://images.pexels.com/..." ... loading="eager">
 * Matches the entire hero-bg img tag and inserts width/height before the closing >.
 */
function addHeroWidthHeight(html) {
  let count = 0;
  // Match the full <div class="hero-bg"><img ... > tag with a Pexels src
  html = html.replace(
    /(<div\s+class="hero-bg">\s*<img\s+src="https:\/\/images\.pexels\.com\/[^"]*"[^>]*?)(>)/gi,
    (match, beforeClose, closing) => {
      if (/width=/i.test(match)) return match; // already has width
      count++;
      return beforeClose + ' width="1200" height="500"' + closing;
    }
  );
  return { html, count };
}

/**
 * Process a single HTML file with all applicable fixes.
 */
function processHtmlFile(filePath, isIndexFile) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  let localPreconnect = 0;
  let localFetchpriority = 0;
  let localHeroWH = 0;

  // Fix #1: Remove preconnect (all files including index.html)
  const r1 = removePreconnect(html);
  html = r1.html;
  localPreconnect = r1.count;

  // Fixes #2 and #3 only for article files (not index.html)
  if (!isIndexFile) {
    const r2 = addFetchpriority(html);
    html = r2.html;
    localFetchpriority = r2.count;

    const r3 = addHeroWidthHeight(html);
    html = r3.html;
    localHeroWH = r3.count;
  }

  stats.filesProcessed++;
  stats.preconnectRemoved += localPreconnect;
  stats.fetchpriorityAdded += localFetchpriority;
  stats.heroWidthHeightAdded += localHeroWH;

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    stats.filesChanged++;
    const fixes = [];
    if (localPreconnect > 0) fixes.push(`preconnect removed (${localPreconnect})`);
    if (localFetchpriority > 0) fixes.push(`fetchpriority added (${localFetchpriority})`);
    if (localHeroWH > 0) fixes.push(`hero width/height added (${localHeroWH})`);
    console.log(`  FIXED: ${path.relative(ROOT, filePath)} -- ${fixes.join(', ')}`);
  }
}

/**
 * Fix #4: Add width="300" height="150" to city-links.js img generation.
 */
function fixCityLinksJs() {
  if (!fs.existsSync(CITY_LINKS_JS)) {
    console.log('  SKIP: city-links.js not found');
    return;
  }

  let js = fs.readFileSync(CITY_LINKS_JS, 'utf8');
  const original = js;

  // The img tag in city-links.js looks like:
  // '<img class="city-link-img" src="..." alt="..." loading="lazy">'
  // We want to add width="300" height="150" before loading="lazy"
  if (/width="300"/.test(js)) {
    console.log('  SKIP: city-links.js already has width/height');
    return;
  }

  // Add width and height attributes to the img tag
  js = js.replace(
    /loading="lazy">/g,
    'loading="lazy" width="300" height="150">'
  );

  if (js !== original) {
    fs.writeFileSync(CITY_LINKS_JS, js, 'utf8');
    stats.cityLinksFixed = 1;
    console.log('  FIXED: blog/city-links.js -- added width="300" height="150" to img');
  }
}

// ──────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────
console.log('=== Core Web Vitals Batch Fix ===\n');

// Gather all article HTML files (excluding index.html)
const blogArticles = getHtmlFiles(BLOG_DIR).filter(f => path.basename(f) !== 'index.html');
const blogEnArticles = getHtmlFiles(BLOG_EN_DIR).filter(f => path.basename(f) !== 'index.html');

// Index files (for preconnect removal only)
const indexFiles = [
  path.join(BLOG_DIR, 'index.html'),
  path.join(BLOG_EN_DIR, 'index.html'),
].filter(f => fs.existsSync(f));

console.log(`Found ${blogArticles.length} Spanish articles`);
console.log(`Found ${blogEnArticles.length} English articles`);
console.log(`Found ${indexFiles.length} index files`);
console.log('');

// Process article files (all fixes)
console.log('--- Processing Spanish articles ---');
for (const f of blogArticles) {
  processHtmlFile(f, false);
}

console.log('--- Processing English articles ---');
for (const f of blogEnArticles) {
  processHtmlFile(f, false);
}

// Process index files (preconnect removal only)
console.log('--- Processing index files ---');
for (const f of indexFiles) {
  processHtmlFile(f, true);
}

// Fix #4: city-links.js
console.log('--- Processing city-links.js ---');
fixCityLinksJs();

// Summary
console.log('\n=== Summary ===');
console.log(`Files processed:         ${stats.filesProcessed}`);
console.log(`Files changed:           ${stats.filesChanged}`);
console.log(`Preconnect links removed:${stats.preconnectRemoved}`);
console.log(`fetchpriority added:     ${stats.fetchpriorityAdded}`);
console.log(`Hero width/height added: ${stats.heroWidthHeightAdded}`);
console.log(`city-links.js fixed:     ${stats.cityLinksFixed ? 'Yes' : 'No'}`);
console.log('\nDone!');
