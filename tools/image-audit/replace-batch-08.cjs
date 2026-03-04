/**
 * BATCH #8 — Optional optimization: 4397831 (6→4) within auriculares category
 * Move JBL Reflect Flow Pro review pair → 3757954 (gym headphones, 2→4)
 *
 * After this:
 *   4397831: 4 files (mejores-auriculares + shokz-openrun-pro-2, ES+EN)
 *   3757954: 4 files (auriculares-baratos + jbl-reflect-flow-pro, ES+EN)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // JBL Reflect Flow Pro pair → 3757954 (woman on gym machine with earphones)
  ['jbl-reflect-flow-pro-review.html', blogDir, '4397831', '3757954', 'jbl-ES→gym-headphones'],
  ['jbl-reflect-flow-pro-review.html', blogEnDir, '4397831', '3757954', 'jbl-EN→gym-headphones'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #8 — 4397831 Optimization (6→4)');
console.log('='.repeat(60));

for (const [file, dir, oldId, newId, label] of replacements) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) { console.log(`ERROR: Not found: ${file}`); errors++; continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  const oldPattern = `photos/${oldId}/pexels-photo-${oldId}`;
  if (!html.includes(oldPattern)) { console.log(`ERROR: Pattern missing in ${file} (${oldId})`); errors++; continue; }
  html = html.split(oldPattern).join(`photos/${newId}/pexels-photo-${newId}`);
  fs.writeFileSync(filePath, html, 'utf8');
  updated++;
  const lang = dir === blogEnDir ? 'EN' : 'ES';
  console.log(`[${String(updated).padStart(2)}] ${lang} ${file} → ${newId} (${label})`);
}

console.log('');
console.log('='.repeat(60));
console.log(`BATCH #8: ${updated} updated, ${errors} errors`);
console.log('4397831: 6→4 | 3757954: 2→4');
