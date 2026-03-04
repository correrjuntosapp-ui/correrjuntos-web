/**
 * verify-image-usage.cjs — Quick verification of image usage counts
 * Shows top images sorted by file count and flags those over the limit.
 *
 * Usage: node tools/image-audit/verify-image-usage.cjs [--top N]
 *   --top N   Show top N images (default: 20)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const topN = process.argv.includes('--top')
  ? parseInt(process.argv[process.argv.indexOf('--top') + 1], 10)
  : 20;

function scanDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  const results = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const m = html.match(/photos\/(\d+)\/pexels/);
    if (m) results.push(m[1]);
  }
  return results;
}

const es = scanDir(path.join(rootDir, 'blog'));
const en = scanDir(path.join(rootDir, 'blog', 'en'));
const all = [...es, ...en];
const counts = {};
for (const id of all) counts[id] = (counts[id] || 0) + 1;
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

const overLimit = sorted.filter(([, c]) => c > 6).length;
const atLimit = sorted.filter(([, c]) => c >= 4 && c <= 6).length;
const healthy = sorted.filter(([, c]) => c <= 3).length;

console.log('IMAGE USAGE VERIFICATION');
console.log('=' .repeat(60));
console.log('Total articles: ' + all.length + ' (ES: ' + es.length + ' | EN: ' + en.length + ')');
console.log('Unique images: ' + sorted.length);
console.log('Over limit (>6 files): ' + overLimit);
console.log('At limit (4-6 files): ' + atLimit);
console.log('Healthy (1-3 files): ' + healthy);
console.log('');

console.log('TOP ' + topN + ':');
for (const [id, count] of sorted.slice(0, topN)) {
  const bar = '#'.repeat(Math.min(count, 50));
  const flag = count > 6 ? ' OVER' : count >= 4 ? ' ~OK' : '';
  console.log('  ' + id + ': ' + String(count).padStart(3) + ' ' + bar + flag);
}

if (overLimit === 0) {
  console.log('\nAll images within limit!');
} else {
  console.log('\n' + overLimit + ' images still over limit. Run scan for details.');
}
