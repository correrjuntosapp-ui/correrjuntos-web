/**
 * scan-images.cjs — Blog image usage inventory
 * Scans all blog articles (ES + EN) and reports Pexels photo ID usage
 * grouped by photo ID, sorted by usage count (descending).
 *
 * Usage: node tools/image-audit/scan-images.cjs [--top N]
 *   --top N   Show only top N images (default: all)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const topN = process.argv.includes('--top')
  ? parseInt(process.argv[process.argv.indexOf('--top') + 1], 10)
  : Infinity;

function scanDir(dir, lang) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  const results = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const idMatch = html.match(/photos\/(\d+)\/pexels/);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const catMatch = html.match(/class="breadcrumb-item"[^>]*>[^<]*<\/[^>]+>\s*<li class="breadcrumb-item"[^>]*>([^<]+)<\/li>/);
    if (idMatch) {
      results.push({
        file: file,
        id: idMatch[1],
        title: titleMatch ? titleMatch[1].replace(/ \| Correr Juntos$/, '').replace(/ \| Run Together$/, '').replace(/ - CorrerJuntos$/, '').replace(/ \| CorrerJuntos$/, '') : 'N/A',
        category: catMatch ? catMatch[1].trim() : 'N/A',
        lang: lang
      });
    }
  }
  return results;
}

const es = scanDir(path.join(rootDir, 'blog'), 'ES');
const en = scanDir(path.join(rootDir, 'blog', 'en'), 'EN');
const all = [...es, ...en];

// Group by photo ID
const byId = {};
for (const a of all) {
  if (!byId[a.id]) byId[a.id] = [];
  byId[a.id].push(a);
}

// Sort by usage count
const sorted = Object.entries(byId).sort((a, b) => b[1].length - a[1].length);
const overLimit = sorted.filter(([, arts]) => arts.length > 6).length;

console.log('BLOG IMAGE SCAN');
console.log('=' .repeat(60));
console.log('Total ES:', es.length, '| Total EN:', en.length, '| Unique IDs:', sorted.length);
console.log('Over limit (>6 files / >3 topics):', overLimit);
console.log('');

const display = topN === Infinity ? sorted : sorted.slice(0, topN);

for (const [id, articles] of display) {
  const esCount = articles.filter(a => a.lang === 'ES').length;
  const enCount = articles.filter(a => a.lang === 'EN').length;
  const flag = articles.length > 6 ? ' *** OVER LIMIT' : '';
  console.log('PHOTO ' + id + ' | TOTAL: ' + articles.length + ' (ES:' + esCount + ' EN:' + enCount + ')' + flag);
  for (const a of articles) {
    console.log('  [' + a.lang + '] ' + a.file + ' | ' + a.title);
  }
  console.log('');
}
