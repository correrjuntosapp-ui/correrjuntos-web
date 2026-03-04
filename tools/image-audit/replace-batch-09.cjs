/**
 * BATCH #9 — Fix 3 topic violations found by ci-check.cjs
 *
 * 1640777: 4→3 topics — Move protein-for-runners EN → 616404 (ES pair already there)
 * 3621168: 4→3 topics — Move motivacion-para-correr ES → 3838389 (motivation EN already there)
 * 6456141: 5→3 topics — Move bilbao ES → 8612041, valencia ES → 8613089
 *
 * After:
 *   1640777: 5 files, 3 topics (correr-antes-o-despues pair + nutricion pair + post-recovery EN)
 *   616404: 4 files, 2 topics (proteinas pair + protein-for-runners EN)
 *   3621168: 5 files, 3 topics (digestivos pair + embarazada pair + correr-solo ES)
 *   3838389: 4 files, 2 topics (gym pair + motivacion ES + motivation EN)
 *   6456141: 4 files, 3 topics (social pair + sevilla ES + zaragoza ES)
 *   8612041: 5 files, 3 topics (acompanado ES + find-partners/seville/why-group EN + bilbao ES)
 *   8613089: 5 files, 3 topics (conocer-gente ES + join/near-me/meet EN + valencia ES)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const blogDir = path.join(rootDir, 'blog');
const blogEnDir = path.join(rootDir, 'blog', 'en');

const replacements = [
  // 1640777 fix: protein-for-runners EN → 616404 (where proteinas-para-runners ES already is)
  ['protein-for-runners.html', blogEnDir, '1640777', '616404', 'protein-EN→protein-pair'],

  // 3621168 fix: motivacion ES → 3838389 (where running-motivation-tips EN already is)
  ['motivacion-para-correr.html', blogDir, '3621168', '3838389', 'motivacion→gym-motivation'],

  // 6456141 fix: bilbao → 8612041 (community, 4→5), valencia → 8613089 (community, 4→5)
  ['grupos-running-bilbao.html', blogDir, '6456141', '8612041', 'bilbao→community-1'],
  ['grupos-running-valencia.html', blogDir, '6456141', '8613089', 'valencia→community-2'],
];

let updated = 0;
let errors = 0;

console.log('BATCH #9 — Fix topic violations');
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
console.log(`BATCH #9: ${updated} updated, ${errors} errors`);
console.log('1640777: 4→3 topics | 3621168: 4→3 topics | 6456141: 5→3 topics');
