/**
 * BATCH #3 — Image deduplication: 4397831 equipment rest + training + health + nutrition + general
 * Moves 20 more articles from 4397831 (now 31 files) to verified images
 *
 * New images:
 *   7869580 — Man stretching outdoors in park (training/warmup)
 *   373984 — Woman tying shoes in winter gear on bridge (winter running)
 * Existing library:
 *   4793250 — Sports gear flat lay (from batch 2, currently 4 files → 5)
 *   3771071 — Agujetas pair (health, currently 2 files → 4)
 *   3760275 — Return after injury pair (injury, currently 2 files → 4)
 *   437037 — Apple Watch close-up (smartwatch/tech, currently 0 → 2)
 *   2377164 — Meal timing/recipes (nutrition, currently 4 → 5)
 *   2611917 — Post-training nutrition (currently 2 → 3)
 *   1346155 — Hydration drinks (currently 5 → 6)
 *   1099680 — Breakfasts/pre-run food (currently 5 → 6)
 *   5038820 — Couple jogging in park (general, currently 2 → 4)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // === EQUIPMENT REST (3 files) ===
  // Winter running pair → 373984 (woman tying shoes in winter)
  ['correr-en-invierno.html', blogDir, '4397831', '373984', 'winter→winter-bridge'],
  ['running-in-winter.html', blogEnDir, '4397831', '373984', 'winter→winter-bridge'],
  // Hydration vests EN → 4793250 (gear flat lay, adding 3rd topic)
  ['running-hydration-vests.html', blogEnDir, '4397831', '4793250', 'hydration-vests→gear-flatlay'],

  // === TRAINING CLUSTER (5 files → 7869580) ===
  ['como-calentar-antes-de-correr.html', blogDir, '4397831', '7869580', 'warmup→stretching'],
  ['como-correr-mas-rapido.html', blogDir, '4397831', '7869580', 'speed→stretching'],
  ['how-to-run-faster.html', blogEnDir, '4397831', '7869580', 'speed→stretching'],
  ['como-respirar-al-correr.html', blogDir, '4397831', '7869580', 'breathing→stretching'],
  ['how-to-breathe-while-running.html', blogEnDir, '4397831', '7869580', 'breathing→stretching'],

  // === HEALTH CLUSTER (6 files) ===
  // Benefits pair → 3771071 (health/soreness themed)
  ['beneficios-de-correr.html', blogDir, '4397831', '3771071', 'benefits→health'],
  ['benefits-of-running.html', blogEnDir, '4397831', '3771071', 'benefits→health'],
  // Injury articles → 3760275 (return after injury themed)
  ['periostitis-tibial-running.html', blogDir, '4397831', '3760275', 'shin-splints→injury'],
  ['prevent-running-injuries.html', blogEnDir, '4397831', '3760275', 'prevent-injuries→injury'],
  // HRV/tech pair → 437037 (Apple Watch)
  ['variabilidad-cardiaca-running.html', blogDir, '4397831', '437037', 'hrv→smartwatch'],
  ['heart-rate-variability-running.html', blogEnDir, '4397831', '437037', 'hrv→smartwatch'],

  // === NUTRITION EN-ONLY (4 files) ===
  ['intermittent-fasting-running.html', blogEnDir, '4397831', '2377164', 'fasting→meal-timing'],
  ['runner-diet-what-to-eat.html', blogEnDir, '4397831', '2611917', 'diet→post-nutrition'],
  ['running-hydration-complete-guide.html', blogEnDir, '4397831', '1346155', 'hydration→hydration-drinks'],
  ['what-to-eat-before-running.html', blogEnDir, '4397831', '1099680', 'pre-run→breakfasts'],

  // === GENERAL (2 files) ===
  ['errores-comunes-corredores.html', blogDir, '4397831', '5038820', 'mistakes→couple-jogging'],
  ['common-running-mistakes.html', blogEnDir, '4397831', '5038820', 'mistakes→couple-jogging'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #3 — Image Deduplication: 4397831 Training + Health + Nutrition + General');
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
console.log(`BATCH #3 COMPLETE: ${updated} files updated, ${errors} errors`);
console.log('');
console.log('POST-BATCH STATUS for 4397831: 31 → 11 files');
