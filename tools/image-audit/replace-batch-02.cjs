/**
 * BATCH #2 — Image deduplication: 4397831 headphones + equipment clusters
 * Moves 20 articles from overused 4397831 (51 files) to verified Pexels images
 *
 * New images:
 *   8380433 — White wireless earbuds in case (headphones)
 *   3757954 — Woman on gym machine with earphones (headphones/fitness)
 *   29300647 — Hoka shoe + Garmin watch on pavement (gear/accessories)
 *   4793250 — Sports gear flat lay: headphones, bottle, shoes (accessories)
 * Existing library:
 *   8454900 — Runner on track in jacket/tights (clothing) — currently 2 files
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // === HEADPHONES CLUSTER (6 files) ===
  // Bone conduction / waterproof pair → 8380433 (earbuds close-up)
  ['auriculares-conduccion-osea-vs-in-ear-running.html', blogDir, '4397831', '8380433', 'bone-conduction→earbuds'],
  ['bone-conduction-vs-in-ear-running.html', blogEnDir, '4397831', '8380433', 'bone-conduction→earbuds'],
  ['auriculares-running-natacion.html', blogDir, '4397831', '8380433', 'waterproof-headphones→earbuds'],
  ['waterproof-headphones-running-swimming.html', blogEnDir, '4397831', '8380433', 'waterproof-headphones→earbuds'],

  // Budget headphones pair → 3757954 (gym earphones)
  ['mejores-auriculares-baratos-running.html', blogDir, '4397831', '3757954', 'budget-headphones→gym'],
  ['best-budget-running-headphones.html', blogEnDir, '4397831', '3757954', 'budget-headphones→gym'],

  // === EQUIPMENT CLOTHING (4 files → 8454900) ===
  ['calcetines-running.html', blogDir, '4397831', '8454900', 'socks→runner-clothing'],
  ['running-socks.html', blogEnDir, '4397831', '8454900', 'socks→runner-clothing'],
  ['mallas-running.html', blogDir, '4397831', '8454900', 'tights→runner-clothing'],
  ['running-tights.html', blogEnDir, '4397831', '8454900', 'tights→runner-clothing'],

  // === EQUIPMENT GEAR (6 files → 29300647) ===
  ['cinturones-running.html', blogDir, '4397831', '29300647', 'belts→hoka-garmin'],
  ['running-belts.html', blogEnDir, '4397831', '29300647', 'belts→hoka-garmin'],
  ['lamparas-frontales-running.html', blogDir, '4397831', '29300647', 'headlamps→hoka-garmin'],
  ['running-headlamps.html', blogEnDir, '4397831', '29300647', 'headlamps→hoka-garmin'],
  ['foam-rollers-runners.html', blogDir, '4397831', '29300647', 'foam-rollers→hoka-garmin'],
  ['foam-rollers-runners.html', blogEnDir, '4397831', '29300647', 'foam-rollers→hoka-garmin'],

  // === EQUIPMENT ACCESSORIES (4 files → 4793250) ===
  ['chubasqueros-running.html', blogDir, '4397831', '4793250', 'rain-jackets→gear-flatlay'],
  ['running-rain-jackets.html', blogEnDir, '4397831', '4793250', 'rain-jackets→gear-flatlay'],
  ['gorras-running.html', blogDir, '4397831', '4793250', 'caps→gear-flatlay'],
  ['running-caps.html', blogEnDir, '4397831', '4793250', 'caps→gear-flatlay'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #2 — Image Deduplication: 4397831 Headphones + Equipment');
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
console.log(`BATCH #2 COMPLETE: ${updated} files updated, ${errors} errors`);
console.log('');
console.log('POST-BATCH STATUS for 4397831:');
console.log('  51 → 31 files (kept: mejores-auriculares, jbl-review, shokz-review + remaining)');
console.log('');
console.log('NEW IMAGE USAGE:');
console.log('  8380433: 0 → 4 files (2 topics: bone-conduction, waterproof)');
console.log('  3757954: 0 → 2 files (1 topic: budget-headphones)');
console.log('  8454900: 2 → 6 files (3 topics: ropa-tecnica + socks + tights)');
console.log('  29300647: 0 → 6 files (3 topics: belts + headlamps + foam-rollers)');
console.log('  4793250: 0 → 4 files (2 topics: rain-jackets + caps)');
