#!/usr/bin/env node
/**
 * warm-colors-batch.cjs
 * Updates blog articles from cold light colors to warm cream tones
 * Also removes YouTube icon from nav-social and footer
 */
const fs = require('fs');
const path = require('path');

// Glob all HTML files in blog/ (excluding index.html which was done manually)
const blogDir = path.join(__dirname, 'blog');

function getAllHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
      results.push(fullPath);
    } else if (entry.name === 'index.html' && dir.includes(path.join('blog', 'en'))) {
      // Include blog/en/index.html
      results.push(fullPath);
    }
  }
  return results;
}

// Color replacements: cold → warm
const CSS_REPLACEMENTS = [
  // Body bg
  ['background:#f8f9fa', 'background:#fef7ed'],
  ['background: #f8f9fa', 'background: #fef7ed'],
  // Nav bg
  ['rgba(248,249,250,.97)', 'rgba(254,247,237,.97)'],
  ['rgba(248,249,250, .97)', 'rgba(254,247,237,.97)'],
  // Nav border
  ['border-bottom:1px solid rgba(0,0,0,.06)', 'border-bottom:1px solid #efe6db'],
  // Nav links bg/border
  ['background:rgba(0,0,0,.04);padding:4px;border-radius:999px;border:1px solid rgba(0,0,0,.08)', 'background:rgba(0,0,0,.03);padding:4px;border-radius:999px;border:1px solid #efe6db'],
  // Nav link color
  ['color:#475569;font-weight:600;padding:6px 14px', 'color:#5c4d3d;font-weight:600;padding:6px 14px'],
  // Nav link bg/border
  ['background:rgba(0,0,0,.03);border:1px solid rgba(0,0,0,.06)', 'background:rgba(0,0,0,.02);border:1px solid #efe6db'],
  // Text primary color
  ['color:#1a1a2e', 'color:#3d3229'],
  // Text secondary
  ['color:#475569', 'color:#5c4d3d'],
  // Cards bg
  ['background:#fff;', 'background:#fffcf9;'],
  ['background:#fff }', 'background:#fffcf9 }'],
  // Card border
  ['border:1px solid #e2e8f0', 'border:1px solid #efe6db'],
  ['border-color:#e2e8f0', 'border-color:#efe6db'],
  // Card border alternate
  ['border:1px solid rgba(0,0,0,.08)', 'border:1px solid #efe6db'],
  ['border:1px solid rgba(0,0,0,.1)', 'border:1px solid #e8ddd0'],
  // Borders
  ['border-top:1px solid rgba(0,0,0,.06)', 'border-top:1px solid #efe6db'],
  ['border-bottom:1px solid rgba(0,0,0,.08)', 'border-bottom:1px solid #efe6db'],
  // Search input
  ['background:#fff;border:1px solid rgba(0,0,0,.1)', 'background:#fffcf9;border:1px solid #e8ddd0'],
  // Hero gradient bottom (fade to warm)
  ['rgba(248,249,250,1)', 'rgba(254,247,237,1)'],
  // Card image overlay
  ['rgba(255,255,255,.6)', 'rgba(255,252,249,.6)'],
  // Footer bg
  ['background:#f1f5f9', 'background:#fef9f3'],
  // Mobile bottom nav
  ['background:rgba(248,249,250,.95)', 'background:rgba(254,247,237,.95)'],
  // Nav social icon color
  ['.nav-social a{color:#64748b', '.nav-social a{color:#8b7355'],
];

// Footer inline HTML replacements
const HTML_REPLACEMENTS = [
  // Footer headings
  ['color:#1a1a2e;font-weight:700', 'color:#3d3229;font-weight:700'],
  // Footer description
  ['color:#64748b;font-size:.85rem;line-height:1.6', 'color:#8b7355;font-size:.85rem;line-height:1.6'],
  // Footer links
  ['color:#94a3b8;text-decoration:none;font-size:.85rem', 'color:#8b7355;text-decoration:none;font-size:.85rem'],
  // Footer social icons
  ['color:#94a3b8;text-decoration:none;display:inline-flex', 'color:#8b7355;text-decoration:none;display:inline-flex'],
  // Footer copyright
  ['color:#64748b;font-size:.8rem', 'color:#8b7355;font-size:.8rem'],
  // Footer border
  ['border-top:1px solid rgba(0,0,0,.06);padding-top:24px', 'border-top:1px solid #efe6db;padding-top:24px'],
  // Entrar link in nav
  ['color:#64748b;font-size:.85rem;font-weight:600;padding:6px 14px', 'color:#5c4d3d;font-size:.85rem;font-weight:600;padding:6px 14px'],
];

// YouTube icon removal patterns
const YOUTUBE_NAV_PATTERN = /\s*<a href="https:\/\/youtube\.com\/@correrjuntos"[^<]*<svg[^<]*<path[^/]*\/><\/svg><\/a>\n?/g;
const YOUTUBE_FOOTER_PATTERN = /\s*<a href="https:\/\/youtube\.com\/@correrjuntos"[^<]*<svg[^<]*<path[^/]*\/><\/svg><\/a>\n?/g;

let updated = 0;
let skipped = 0;
let errors = 0;

const files = getAllHtmlFiles(blogDir);
console.log(`Found ${files.length} HTML files to process`);

for (const filePath of files) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Skip if already warm (check for #fef7ed)
    if (content.includes('#fef7ed') && !content.includes('#f8f9fa')) {
      skipped++;
      continue;
    }

    // Apply CSS replacements
    for (const [search, replace] of CSS_REPLACEMENTS) {
      content = content.split(search).join(replace);
    }

    // Apply HTML replacements
    for (const [search, replace] of HTML_REPLACEMENTS) {
      content = content.split(search).join(replace);
    }

    // Remove YouTube from nav-social
    content = content.replace(YOUTUBE_NAV_PATTERN, '');

    // Remove YouTube from footer (same pattern works)
    // Already handled by the regex above since it matches all YouTube links

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      updated++;
    } else {
      skipped++;
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e.message}`);
    errors++;
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
