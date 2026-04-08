#!/usr/bin/env node
/**
 * Add Smart App Banner meta tag + Universal Link deep links to plan pages
 * - Adds <meta name="apple-itunes-app"> with app-argument pointing to /planes
 * - Keeps store badges as they are (direct store links still work best for conversion)
 */
const fs = require('fs');
const path = require('path');

const planesDir = path.join(__dirname, '..', 'planes');

// All plan detail HTML files (not subdirectories)
const planFiles = fs.readdirSync(planesDir)
  .filter(f => f.endsWith('.html') && f !== 'index.html');

// Landing pages in subdirectories
const landingDirs = ['0-5k', '5k', '10k', 'trail', 'media-maraton', 'maraton'];
const landingFiles = landingDirs
  .map(d => path.join(planesDir, d, 'index.html'))
  .filter(f => fs.existsSync(f));

const allFiles = [
  ...planFiles.map(f => path.join(planesDir, f)),
  ...landingFiles
];

let updated = 0;

for (const filePath of allFiles) {
  let html = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(planesDir, filePath);

  // Skip if already has apple-itunes-app meta
  if (html.includes('apple-itunes-app')) {
    console.log(`  SKIP (already has meta): ${fileName}`);
    continue;
  }

  // Add Smart App Banner meta tag after <meta name="viewport" ...>
  const viewportMatch = html.match(/<meta name="viewport"[^>]*>/);
  if (viewportMatch) {
    const insertAfter = viewportMatch[0];
    const metaTag = '\n<meta name="apple-itunes-app" content="app-id=6758505910, app-argument=https://www.correrjuntos.com/planes">';
    html = html.replace(insertAfter, insertAfter + metaTag);
    updated++;
    console.log(`  ✓ Added Smart App Banner: ${fileName}`);
  } else {
    console.log(`  ✗ No viewport meta found: ${fileName}`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`\nDone! Updated ${updated} files.`);
