/**
 * BATCH #7 — Wellness (3621168: 10→6) + Misc (3621185: 8→6) + Trail (8949023: 8→6)
 *           + Small fixes: 1571939 (7→6), 1640777 (7→6), 4652250 (7→6)
 * Total: ~11 files moved
 *
 * New images:
 *   34712191 — Two adults resting after running (wellness/motivation)
 *   2330502 — Woman trail running in hills (trail)
 *   33944102 — Man trail running rugged mountain (trail)
 * Existing:
 *   1093038 (1 file, vegetarian-diet EN → nutrition wellness)
 *   3838389 (2 files, gym+running → training mix)
 *   2116475 (2 files, ultra-trail → trail)
 *   2421467 (2 files, primera-quedada/first-meetup → community)
 *   1578750 (1 file, nutricion-trail ES → nutrition)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // ===== WELLNESS 3621168 (10→6) — Keep: problemas-digestivos/stomach, embarazada/pregnant, correr-solo/alone =====
  // (Keep 3 topics with most diversity)

  // Dieta vegetariana ES → 1093038 (vegetarian-diet EN already uses it, 1→2 same topic)
  ['dieta-vegetariana-runner.html', blogDir, '3621168', '1093038', 'veg-diet→veg-diet-EN'],

  // Geles energéticos ES / energy gels EN → 34712191 (resting after run, nutrition context)
  ['mejores-geles-energeticos-running.html', blogDir, '3621168', '34712191', 'gels→resting-runners'],
  ['best-energy-gels-running.html', blogEnDir, '3621168', '34712191', 'gels→resting-runners'],

  // Recuperadores ES → 34712191 (recovery)
  ['mejores-recuperadores-running.html', blogDir, '3621168', '34712191', 'recovery→resting-runners'],

  // ===== MISC 3621185 (8→6) — Keep: flato/side-stitch, seguridad/safety, zapatillas-carbono/carbon-plate =====

  // Motivation EN → 3838389 (gym+running, motivation themed, 2→3)
  ['running-motivation-tips.html', blogEnDir, '3621185', '3838389', 'motivation→gym-running'],

  // Supinators EN → 1464625 (neutral shoes, 2→3 shoe themed)
  ['best-running-shoes-supinators.html', blogEnDir, '3621185', '1464625', 'supinators→neutral-shoes'],

  // ===== TRAIL 8949023 (8→6) — Keep: empezar-trail/start-trail, carreras-trail/trail-races, diferencias/trail-vs-road =====

  // Material trail ES / trail gear EN → 2330502 (woman trail running hills)
  ['material-trail-running.html', blogDir, '8949023', '2330502', 'trail-gear→trail-hills'],
  ['trail-running-gear.html', blogEnDir, '8949023', '2330502', 'trail-gear→trail-hills'],

  // ===== SMALL FIXES =====

  // 1571939 (7→6): Move 1 file — de-cero-a-5k has no natural pair here
  ['de-cero-a-5k.html', blogDir, '1571939', '3764554', 'couch-to-5k→beginners'],
  // 3764554 (empezar-a-correr-40/50) has 4 files → 5, 3 topics (still under limit)

  // 1640777 (7→6): Move 1 file — correr-antes-o-despues has EN pair running-before-or-after on same image
  // So move the EN partner too... but that makes 5 which is still over. Need to move a standalone.
  // nutrition-for-runners EN has no ES pair on 1640777 (nutricion-para-runners IS on 1640777)
  // Move protein pair since it's the most generic
  ['proteinas-para-runners.html', blogDir, '1640777', '616404', 'protein→protein-img'],
  // 616404 (mejores-proteinas pair, 2→3 same theme!)

  // 4652250 (7→6): Move running-groups-seville EN (only non-routes article)
  ['running-groups-seville.html', blogEnDir, '4652250', '6456141', 'seville-EN→social'],
  // 6456141 will have: running-social(ES) + grupos-sevilla(ES) + bilbao + valencia + zaragoza + seville-EN
  // That's too many! 6456141 after batch 6 = 6 files. Can't add more.
  // Use 8612041 instead (community, after batch 6 = 3 files → 4)
];

// Fix: running-groups-seville should go to 8612041 not 6456141
replacements[replacements.length - 1] = ['running-groups-seville.html', blogEnDir, '4652250', '8612041', 'seville-EN→community'];

let updated = 0;
let errors = 0;

console.log('BATCH #7 — Wellness + Misc + Trail + Small fixes');
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
console.log(`BATCH #7: ${updated} updated, ${errors} errors`);
console.log('3621168: 10→6 | 3621185: 8→6 | 8949023: 8→6');
console.log('1571939: 7→6 | 1640777: 7→6 | 4652250: 7→6');
