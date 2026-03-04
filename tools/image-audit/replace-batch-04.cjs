/**
 * BATCH #4 — Image deduplication: 4397831 final cleanup
 * Moves last 5 articles from 4397831 (now 11 files) → target 6 files (3 topics)
 *
 * Existing library:
 *   437037 — Apple Watch (from batch 3, currently 2 → 4)
 *   33921585 — Creatine supplements (currently 2 → 4)
 *   3912944 — Running group apps (currently 2 → 3)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // Running power pair → 437037 (Apple Watch / tech)
  ['potencia-en-running.html', blogDir, '4397831', '437037', 'power→smartwatch'],
  ['running-power.html', blogEnDir, '4397831', '437037', 'power→smartwatch'],

  // Creatine pair → 33921585 (creatine supplements)
  ['creatina-para-runners.html', blogDir, '4397831', '33921585', 'creatine→creatine-supp'],
  ['creatine-for-runners.html', blogEnDir, '4397831', '33921585', 'creatine→creatine-supp'],

  // Best running apps EN → 3912944 (running group apps)
  ['best-running-apps.html', blogEnDir, '4397831', '3912944', 'apps→group-apps'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #4 — Image Deduplication: 4397831 Final Cleanup');
console.log('='.repeat(60));
console.log('');

for (const [file, dir, oldId, newId, label] of replacements) {
  const filePath = path.join(dir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`ERROR: File not found: ${file}`);
    errors++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  const oldPattern = `photos/${oldId}/pexels-photo-${oldId}`;
  if (!html.includes(oldPattern)) {
    console.log(`ERROR: Pattern not found in ${file} (expected ${oldId})`);
    errors++;
    continue;
  }

  const newPattern = `photos/${newId}/pexels-photo-${newId}`;
  html = html.split(oldPattern).join(newPattern);

  fs.writeFileSync(filePath, html, 'utf8');
  updated++;

  const lang = dir === blogEnDir ? 'EN' : 'ES';
  console.log(`[${String(updated).padStart(2)}] ${lang} ${file}`);
  console.log(`     ${oldId} → ${newId} (${label})`);
  console.log('');
}

console.log('='.repeat(60));
console.log(`BATCH #4 COMPLETE: ${updated} files updated, ${errors} errors`);
console.log('');
console.log('FINAL STATUS for 4397831: 51 → 6 files (3 topics)');
console.log('  Kept: mejores-auriculares-running, jbl-reflect-flow-pro-review, shokz-openrun-pro-2-review');
