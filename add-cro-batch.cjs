#!/usr/bin/env node
/**
 * Add cro.js to cities, places, and events pages that don't have it yet.
 * Inserts <script src="/blog/cro.js" defer></script> before </body>.
 */
const fs = require('fs');
const path = require('path');

const dirs = ['cities', 'places', 'events'];
let updated = 0;
let skipped = 0;

for (const dir of dirs) {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) { console.log(`  ⚠ ${dir}/ not found`); continue; }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf8');

    if (html.includes('cro.js')) {
      skipped++;
      continue;
    }

    // Insert before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', '<script src="/blog/cro.js" defer></script>\n</body>');
      fs.writeFileSync(filePath, html, 'utf8');
      updated++;
      console.log(`  ✓ ${dir}/${file}`);
    } else {
      console.log(`  ⚠ No </body> in ${dir}/${file}`);
    }
  }
}

console.log(`\nDone: ${updated} files updated, ${skipped} already had cro.js`);
