/**
 * BATCH #1 — Image deduplication replacements
 * Replaces overused Pexels photo IDs with existing library images
 * Target: 20 article files
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

// Replacement map: [file, directory, oldPhotoId, newPhotoId, reason]
const replacements = [
  // === FROM 1640777 (nutrition cluster, 19→6 files) ===
  // 1-2: alimentos-antiinflamatorios pair → 3683074 (omega-3, anti-inflammatory fit)
  ['alimentos-antiinflamatorios-runners.html', blogDir, '1640777', '3683074', '1640777→3683074'],
  ['anti-inflammatory-foods-runners.html', blogEnDir, '1640777', '3683074', '1640777→3683074'],

  // 3-4: cafeina pair → 3683056 (supplements image)
  ['cafeina-running-rendimiento.html', blogDir, '1640777', '3683056', '1640777→3683056'],
  ['caffeine-running-performance.html', blogEnDir, '1640777', '3683056', '1640777→3683056'],

  // 5-6: nutricion-dia-carrera pair → 1346155 (hydration drinks)
  ['nutricion-dia-de-carrera.html', blogDir, '1640777', '1346155', '1640777→1346155'],
  ['race-day-nutrition.html', blogEnDir, '1640777', '1346155', '1640777→1346155'],

  // 7: ayuno-intermitente ES only → 2377164 (recipes/meal timing)
  ['ayuno-intermitente-running.html', blogDir, '1640777', '2377164', '1640777→2377164'],

  // 8: carga-hidratos ES only → 1099680 (breakfasts/pre-run food)
  ['carga-hidratos-maraton.html', blogDir, '1640777', '1099680', '1640777→1099680'],

  // 9: chalecos-hidratacion ES only → 1346155 (hydration drinks)
  ['chalecos-hidratacion-running.html', blogDir, '1640777', '1346155', '1640777→1346155'],

  // 10: dieta-runner ES only → 2377164 (recipes/food)
  ['dieta-runner-que-comer.html', blogDir, '1640777', '2377164', '1640777→2377164'],

  // 11: hidratacion ES only → 2611917 (post-training nutrition)
  ['hidratacion-running-guia-completa.html', blogDir, '1640777', '2611917', '1640777→2611917'],

  // 12: que-comer-antes ES only → 1099680 (breakfasts)
  ['que-comer-antes-de-correr.html', blogDir, '1640777', '1099680', '1640777→1099680'],

  // === FROM 3601094 (race training cluster, 9→6 files) ===
  // 13-14: que-gel-energetico pair → 1640774 (energy snacks)
  ['que-gel-energetico-usar-maraton.html', blogDir, '3601094', '1640774', '3601094→1640774'],
  ['what-energy-gel-marathon.html', blogEnDir, '3601094', '1640774', '3601094→1640774'],

  // 15: marathon-carb-loading EN → 1099680 (match carga-hidratos ES)
  ['marathon-carb-loading.html', blogEnDir, '3601094', '1099680', '3601094→1099680'],

  // === FROM 4652250 (city routes cluster, 12→7 files) ===
  // 16-17: rutas-malaga pair → 2387418 (Cadiz running city)
  ['mejores-rutas-correr-malaga.html', blogDir, '4652250', '2387418', '4652250→2387418'],
  ['best-running-routes-malaga.html', blogEnDir, '4652250', '2387418', '4652250→2387418'],

  // 18-19: rutas-sevilla pair → 6551174 (Barcelona meetups/city running)
  ['mejores-rutas-correr-sevilla.html', blogDir, '4652250', '6551174', '4652250→6551174'],
  ['best-running-routes-sevilla.html', blogEnDir, '4652250', '6551174', '4652250→6551174'],

  // 20: grupos-sevilla ES → 6456141 (social running trend)
  ['grupos-correr-sevilla.html', blogDir, '4652250', '6456141', '4652250→6456141'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #1 — Image Deduplication Replacements');
console.log('=' .repeat(60));
console.log('');

for (const [file, dir, oldId, newId, label] of replacements) {
  const filePath = path.join(dir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`ERROR: File not found: ${file}`);
    errors++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Check that old ID exists in file
  const oldPattern = `photos/${oldId}/pexels-photo-${oldId}`;
  if (!html.includes(oldPattern)) {
    console.log(`ERROR: Pattern not found in ${file} (expected ${oldId})`);
    errors++;
    continue;
  }

  const newPattern = `photos/${newId}/pexels-photo-${newId}`;

  // Count occurrences before replacement
  const occurrences = (html.match(new RegExp(oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

  // Replace all occurrences of the photo ID pattern
  html = html.split(`photos/${oldId}/pexels-photo-${oldId}`).join(`photos/${newId}/pexels-photo-${newId}`);

  fs.writeFileSync(filePath, html, 'utf8');
  updated++;

  const lang = dir === blogEnDir ? 'EN' : 'ES';
  console.log(`[${String(updated).padStart(2)}] ${lang} ${file}`);
  console.log(`     BEFORE: pexels-photo-${oldId} (${label.split('→')[0]})`);
  console.log(`     AFTER:  pexels-photo-${newId} (${label})`);
  console.log('');
}

console.log('=' .repeat(60));
console.log(`BATCH #1 COMPLETE: ${updated} files updated, ${errors} errors`);
console.log('');
console.log('POST-BATCH STATUS:');
console.log('  1640777: 19 → 6 files (3 topics: nutricion-para-runners, correr-antes-despues, proteinas)');
console.log('  3601094:  9 → 6 files (3 topics: primera-5k, plan-10k, plan-media-maraton)');
console.log('  4652250: 12 → 7 files (4 topics: rutas-madrid, rutas-barcelona, rutas-valencia, groups-seville-EN)');
