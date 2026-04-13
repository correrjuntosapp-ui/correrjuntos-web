#!/usr/bin/env node
/**
 * fix-blog-nav.cjs
 * Replaces old nav-wrapper nav in ALL blog HTML files with unified site-header nav.
 * Also patches enhance.js compatibility by adding a hidden nav-auth div.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');

// Unified nav replacement for ES blog articles
const UNIFIED_NAV_ES = `<header class="site-header" style="position:sticky;top:0;z-index:100;background:rgba(254,247,237,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.06)">
<nav style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px">
  <a href="/" style="text-decoration:none;font-weight:900;font-size:1.1rem;letter-spacing:-.02em"><span style="color:#3d3229">CORRER</span><span style="color:#f97316">JUNTOS</span></a>
  <div style="display:flex;gap:24px;align-items:center;font-size:.9rem;font-weight:600">
    <a href="/planes/" style="color:#3d3229;text-decoration:none">Planes</a>
    <a href="/blog/" style="color:#f97316;text-decoration:none">Blog</a>
    <a href="/carreras/" style="color:#3d3229;text-decoration:none">Carreras</a>
    <a href="/#pricing" style="color:#3d3229;text-decoration:none">Precios</a>
    <a href="https://apps.apple.com/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer" style="background:#f97316;color:#fff;padding:8px 20px;border-radius:100px;font-weight:700;font-size:.85rem;text-decoration:none">Descargar App</a>
  </div>
  <div class="nav-auth" style="display:none"></div>
</nav>
</header>`;

// Same nav for EN blog articles
const UNIFIED_NAV_EN = `<header class="site-header" style="position:sticky;top:0;z-index:100;background:rgba(254,247,237,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.06)">
<nav style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px">
  <a href="/" style="text-decoration:none;font-weight:900;font-size:1.1rem;letter-spacing:-.02em"><span style="color:#3d3229">CORRER</span><span style="color:#f97316">JUNTOS</span></a>
  <div style="display:flex;gap:24px;align-items:center;font-size:.9rem;font-weight:600">
    <a href="/planes/" style="color:#3d3229;text-decoration:none">Planes</a>
    <a href="/blog/" style="color:#f97316;text-decoration:none">Blog</a>
    <a href="/carreras/" style="color:#3d3229;text-decoration:none">Carreras</a>
    <a href="/#pricing" style="color:#3d3229;text-decoration:none">Precios</a>
    <a href="https://apps.apple.com/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer" style="background:#f97316;color:#fff;padding:8px 20px;border-radius:100px;font-weight:700;font-size:.85rem;text-decoration:none">Descargar App</a>
  </div>
  <div class="nav-auth" style="display:none"></div>
</nav>
</header>`;

function getAllHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Regex to match the old nav-wrapper block
// It starts with <div class="nav-wrapper"> and ends with the closing </div> of the wrapper
// The nav-wrapper contains: <nav class="nav"> ... </nav> then closing </div>
const NAV_WRAPPER_REGEX = /<div class="nav-wrapper">[\s\S]*?<\/nav>\s*<\/div>/g;

let modified = 0;
let skipped = 0;
let alreadyDone = 0;
let errors = [];

const files = getAllHtmlFiles(BLOG_DIR);
console.log(`Found ${files.length} HTML files in blog/`);

for (const filePath of files) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip files that already have site-header
    if (content.includes('class="site-header"')) {
      alreadyDone++;
      continue;
    }

    // Check if it has the old nav-wrapper
    if (!content.includes('class="nav-wrapper"')) {
      skipped++;
      continue;
    }

    // Determine if EN or ES
    const isEN = filePath.includes(path.sep + 'en' + path.sep) || filePath.includes('/en/');
    const replacement = isEN ? UNIFIED_NAV_EN : UNIFIED_NAV_ES;

    const newContent = content.replace(NAV_WRAPPER_REGEX, replacement);

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modified++;
    } else {
      // Try alternate pattern - some files might have slightly different structure
      // Try a more lenient regex
      const altRegex = /<div class="nav-wrapper">[\s\S]*?<\/div>\s*(?=\n*<div class="container">|<\!--|<div class="hero"|<main|<section|<article)/;
      const newContent2 = content.replace(altRegex, replacement + '\n');
      if (newContent2 !== content) {
        fs.writeFileSync(filePath, newContent2, 'utf8');
        modified++;
      } else {
        errors.push(filePath);
      }
    }
  } catch (err) {
    errors.push(`${filePath}: ${err.message}`);
  }
}

console.log(`\nResults:`);
console.log(`  Modified: ${modified}`);
console.log(`  Already had site-header: ${alreadyDone}`);
console.log(`  No nav-wrapper found: ${skipped}`);
if (errors.length > 0) {
  console.log(`  Errors/unmatched: ${errors.length}`);
  errors.slice(0, 10).forEach(e => console.log(`    - ${e}`));
  if (errors.length > 10) console.log(`    ... and ${errors.length - 10} more`);
}
console.log(`\nTotal files processed: ${files.length}`);
