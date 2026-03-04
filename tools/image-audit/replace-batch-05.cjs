/**
 * BATCH #5 — Shoes (1027130: 22→6) + Watches (4679246: 21→6)
 * Total: 31 files moved
 *
 * SHOES — New images:
 *   4065509 — Sneaker on treadmill close-up
 *   3763869 — Woman tying shoes on running track
 *   1040427 — Athlete tying sneakers on street
 * Existing: 1456706 (1 file, drop-explained), 1464625 (2 files, neutral-shoes)
 *
 * WATCHES — New images:
 *   5037319 — Man adjusting smartwatch, fitness
 *   3999644 — Smartwatch showing running stats on wrist
 * Existing: 437037 (4 files, Apple Watch), 4379294 (smartwatch on wrist during fitness)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // ===== SHOES 1027130 (22→6) — Keep: asfalto/road, principiantes/beginners, mujer/womens =====

  // Budget shoes pair → 4065509 (sneaker treadmill)
  ['mejores-zapatillas-running-baratas.html', blogDir, '1027130', '4065509', 'budget-shoes→treadmill'],
  ['best-budget-running-shoes.html', blogEnDir, '1027130', '4065509', 'budget-shoes→treadmill'],
  // Overweight shoes pair → 4065509
  ['mejores-zapatillas-running-sobrepeso.html', blogDir, '1027130', '4065509', 'overweight-shoes→treadmill'],
  ['best-running-shoes-overweight.html', blogEnDir, '1027130', '4065509', 'overweight-shoes→treadmill'],
  // Pronators pair → 4065509
  ['zapatillas-running-pronadores.html', blogDir, '1027130', '4065509', 'pronators→treadmill'],
  ['running-shoes-overpronators.html', blogEnDir, '1027130', '4065509', 'pronators→treadmill'],

  // By level pair → 3763869 (woman tying shoes on track)
  ['que-zapatillas-running-comprar-segun-nivel.html', blogDir, '1027130', '3763869', 'by-level→tying-track'],
  ['which-running-shoes-by-level.html', blogEnDir, '1027130', '3763869', 'by-level→tying-track'],
  // ASICS vs Nike pair → 3763869
  ['asics-gel-nimbus-26-vs-nike-pegasus-41.html', blogDir, '1027130', '3763869', 'asics-vs-nike→tying-track'],
  ['asics-gel-nimbus-26-vs-nike-pegasus-41.html', blogEnDir, '1027130', '3763869', 'asics-vs-nike→tying-track'],
  // Hoka Clifton vs Bondi pair → 3763869
  ['hoka-clifton-9-vs-bondi-8.html', blogDir, '1027130', '3763869', 'hoka-vs-hoka→tying-track'],
  ['hoka-clifton-9-vs-bondi-8.html', blogEnDir, '1027130', '3763869', 'hoka-vs-hoka→tying-track'],

  // Nike vs Brooks pair → 1040427 (athlete tying on street)
  ['nike-pegasus-41-vs-brooks-ghost-16.html', blogDir, '1027130', '1040427', 'nike-vs-brooks→street'],
  ['nike-pegasus-41-vs-brooks-ghost-16.html', blogEnDir, '1027130', '1040427', 'nike-vs-brooks→street'],
  // Salomon vs Hoka (trail) → 1040427
  ['salomon-speedcross-6-vs-hoka-speedgoat-6.html', blogDir, '1027130', '1040427', 'salomon-vs-hoka→street'],
  ['salomon-speedcross-6-vs-hoka-speedgoat-6.html', blogEnDir, '1027130', '1040427', 'salomon-vs-hoka→street'],

  // ===== WATCHES 4679246 (21→6) — Keep: forerunner-265-vs-coros, forerunner-55, como-elegir/how-to-choose =====

  // Apple Watch pair → 437037 (Apple Watch close-up, currently 4→6)
  ['apple-watch-running-review.html', blogDir, '4679246', '437037', 'apple-watch→apple-watch'],
  ['apple-watch-running-review.html', blogEnDir, '4679246', '437037', 'apple-watch→apple-watch'],

  // COROS PACE 3 pair → 5037319 (man adjusting smartwatch)
  ['coros-pace-3-review.html', blogDir, '4679246', '5037319', 'coros→smartwatch-adj'],
  ['coros-pace-3-review.html', blogEnDir, '4679246', '5037319', 'coros→smartwatch-adj'],
  // Garmin Venu 3 pair → 5037319
  ['garmin-venu-3-review.html', blogDir, '4679246', '5037319', 'venu→smartwatch-adj'],
  ['garmin-venu-3-review.html', blogEnDir, '4679246', '5037319', 'venu→smartwatch-adj'],
  // Best value GPS pair → 5037319
  ['mejor-reloj-gps-running-calidad-precio.html', blogDir, '4679246', '5037319', 'best-value→smartwatch-adj'],
  ['best-value-gps-running-watch.html', blogEnDir, '4679246', '5037319', 'best-value→smartwatch-adj'],

  // Polar Pacer Pro pair → 3999644 (smartwatch running stats)
  ['polar-pacer-pro-review.html', blogDir, '4679246', '3999644', 'polar→running-stats'],
  ['polar-pacer-pro-review.html', blogEnDir, '4679246', '3999644', 'polar→running-stats'],
  // Smartwatch vs GPS pair → 3999644
  ['smartwatch-vs-reloj-gps-running.html', blogDir, '4679246', '3999644', 'sw-vs-gps→running-stats'],
  ['smartwatch-vs-gps-watch-running.html', blogEnDir, '4679246', '3999644', 'sw-vs-gps→running-stats'],
  // Strava vs Garmin pair → 3999644
  ['strava-vs-garmin-connect.html', blogDir, '4679246', '3999644', 'strava-vs-garmin→running-stats'],
  ['strava-vs-garmin-connect.html', blogEnDir, '4679246', '3999644', 'strava-vs-garmin→running-stats'],

  // Mejores apps (ES only) → 3912944 (running group apps, currently 3→4)
  ['mejores-apps-running.html', blogDir, '4679246', '3912944', 'apps→group-apps'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #5 — Shoes (1027130: 22→6) + Watches (4679246: 21→6)');
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
console.log(`BATCH #5: ${updated} updated, ${errors} errors`);
console.log('1027130: 22→6 | 4679246: 21→6');
