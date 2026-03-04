/**
 * BATCH #6 — Beginners (3756042: 14→6) + Injuries (4056832: 13→6) + Community (2526878: 12→6)
 * Total: ~21 files moved
 *
 * New images:
 *   7880090 — Man stretching in sunny park (stretching/training)
 *   4426456 — Sportswoman stretching legs (stretching/recovery)
 *   7298421 — Man massaging calf, muscle pain (injury)
 * Existing used:
 *   7869580 (5 files, stretching → add warm-up EN = 6)
 *   3760275 (4 files, injury → add prevenir-lesiones + shin-splints = 6)
 *   3771071 (4 files, health → add fascitis = 5)
 *   8612041 (2 files, community → add find-partners EN = 3)
 *   8613089 (2 files, community → add join-group + near-me EN = 4)
 *   6456141 (3 files, city groups → add bilbao + valencia + zaragoza = 6)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // ===== BEGINNERS 3756042 (14→6) — Keep: empezar-a-correr/start-running, correr-con-musica/music, cuantas-veces/how-many-days =====

  // Zone training pair → 7880090 (man stretching park — training themed)
  ['entrenamiento-por-zonas-running.html', blogDir, '3756042', '7880090', 'zones→park-stretch'],
  ['zone-training-running.html', blogEnDir, '3756042', '7880090', 'zones→park-stretch'],
  // Groups Madrid pair → 7880090
  ['grupos-running-madrid-principiantes.html', blogDir, '3756042', '7880090', 'madrid-groups→park-stretch'],
  ['beginner-running-groups-madrid.html', blogEnDir, '3756042', '7880090', 'madrid-groups→park-stretch'],

  // Basic pack pair → 4793250 (gear flat lay — wait, at limit 5 files 3 topics)
  // Use 29300647 instead? Also at limit. Use NEW 7880186 (man pausing during run, earbuds, park)
  // Actually let's use 373984 (winter runner tying shoes, currently 2 files, 1 topic → 3 files 2 topics)
  ['pack-basico-running-principiantes.html', blogDir, '3756042', '373984', 'basic-pack→winter-runner'],
  ['basic-running-pack-beginners.html', blogEnDir, '3756042', '373984', 'basic-pack→winter-runner'],

  // Warm-up EN only → 7869580 (stretching, 5→6 files, same topic as como-calentar)
  ['how-to-warm-up-before-running.html', blogEnDir, '3756042', '7869580', 'warmup→stretching-man'],

  // Plantar fasciitis EN only → 3771071 (health, 4→5 files)
  ['plantar-fasciitis-runners.html', blogEnDir, '3756042', '3771071', 'fasciitis→health'],

  // ===== INJURIES 4056832 (13→6) — Keep: dolor-rodilla/knee-pain, rodilla-corredor/runners-knee, tendinitis/achilles =====

  // Stretching before/after pair → 4426456 (sportswoman stretching legs)
  ['estiramientos-antes-despues-correr.html', blogDir, '4056832', '4426456', 'stretching→sportswoman'],
  ['stretching-before-after-running.html', blogEnDir, '4056832', '4426456', 'stretching→sportswoman'],
  // Post-run stretches pair → 4426456
  ['estiramientos-post-carrera.html', blogDir, '4056832', '4426456', 'post-stretch→sportswoman'],
  ['post-run-stretches.html', blogEnDir, '4056832', '4426456', 'post-stretch→sportswoman'],

  // Fascitis plantar ES only → 7298421 (man massaging calf, injury)
  ['fascitis-plantar-corredores.html', blogDir, '4056832', '7298421', 'fasciitis-ES→calf-massage'],

  // Prevenir lesiones ES only → 3760275 (injury theme, 4→5 as ES pair of prevent-injuries)
  ['prevenir-lesiones-running.html', blogDir, '4056832', '3760275', 'prevent→injury-theme'],

  // Shin splints EN only → 7298421 (injury, 0→2)
  ['shin-splints-running.html', blogEnDir, '4056832', '7298421', 'shin-splints→calf-massage'],

  // ===== COMMUNITY 2526878 (12→6) — Keep: encontrar-gente/find-people, aumentar-resistencia/endurance, zapatillas-trail/trail-shoes =====

  // Find running partners EN → 8612041 (community pair, 2→3)
  ['find-running-partners.html', blogEnDir, '2526878', '8612041', 'partners→community'],
  // Join running group EN → 8613089 (meet-people pair, 2→3)
  ['how-to-join-running-group.html', blogEnDir, '2526878', '8613089', 'join-group→meet-people'],
  // Running groups near me EN → 8613089 (2→4)
  ['running-groups-near-me.html', blogEnDir, '2526878', '8613089', 'near-me→meet-people'],

  // City groups → 6456141 (running social + sevilla, 3→6)
  ['grupos-running-bilbao.html', blogDir, '2526878', '6456141', 'bilbao→social'],
  ['grupos-running-valencia.html', blogDir, '2526878', '6456141', 'valencia→social'],
  ['grupos-running-zaragoza.html', blogDir, '2526878', '6456141', 'zaragoza→social'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #6 — Beginners + Injuries + Community');
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
console.log(`BATCH #6: ${updated} updated, ${errors} errors`);
console.log('3756042: 14→6 | 4056832: 13→6 | 2526878: 12→6');
