/**
 * Meta description audit for blog articles.
 *
 * Scans every blog/*.html and blog/en/*.html file and flags:
 *   · too-short    — under 120 chars (Google may rewrite them)
 *   · too-long     — over 160 chars (gets truncated in SERP)
 *   · generic      — contains boilerplate phrases ("envío", "al mejor precio"…)
 *   · duplicates   — exact same meta across multiple articles
 *
 * Outputs a sortable CSV to tools/meta-audit-report.csv prioritized
 * by severity.
 *
 * Usage:
 *   node tools/meta-audit.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(__dirname, 'meta-audit-report.csv');

const GENERIC_PATTERNS = [
  /env[íi]o en espa[ñn]a/i,
  /al mejor precio/i,
  /compra al mejor/i,
  /an[áa]lisis completo/i,
  /gu[íi]a completa 2026/i,  // not the phrase itself — just 2026-suffix without distinctive content
  /mejor precio en amazon/i,
  /descubre todo/i,
  /todo lo que necesitas saber/i,
  /la mejor gu[íi]a/i,
];

const MIN = 120;
const MAX = 160;

function walk(dir, filterFn) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && name !== 'entrenamiento' && name !== 'zapatillas' && name !== 'atletas-hibridos') {
      // skip rewrite; these subfolders are legacy content clones — audit root only
      out.push(...walk(full, filterFn));
    } else if (stat.isDirectory()) {
      out.push(...walk(full, filterFn));
    } else if (filterFn(full)) out.push(full);
  }
  return out;
}

function extractMeta(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  return m ? m[1] : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function classify(meta) {
  const issues = [];
  const len = meta.length;
  if (len === 0)      issues.push('MISSING');
  else if (len < MIN) issues.push('TOO_SHORT');
  else if (len > MAX) issues.push('TOO_LONG');
  for (const re of GENERIC_PATTERNS) {
    if (re.test(meta)) { issues.push('GENERIC'); break; }
  }
  return issues;
}

function priority(issues, len) {
  // higher = worse. MISSING > TOO_LONG > TOO_SHORT > GENERIC > DUPLICATE
  let p = 0;
  if (issues.includes('MISSING'))   p += 1000;
  if (issues.includes('TOO_LONG'))  p += 100 + (len - MAX);
  if (issues.includes('TOO_SHORT')) p += 50  + (MIN - len);
  if (issues.includes('GENERIC'))   p += 30;
  if (issues.includes('DUPLICATE')) p += 20;
  return p;
}

const files = [
  ...walk(path.join(ROOT, 'blog'),    f => f.endsWith('.html') && !f.includes(path.sep + 'en' + path.sep)),
  ...walk(path.join(ROOT, 'blog', 'en'), f => f.endsWith('.html')),
];

const records = [];
const metaToFiles = {};

for (const f of files) {
  const slug = path.relative(path.join(ROOT, 'blog'), f).replace(/\\/g, '/').replace(/\.html$/, '');
  if (slug === 'index' || slug === 'en/index') continue;  // skip listing pages
  const html = fs.readFileSync(f, 'utf8');
  const meta = extractMeta(html);
  const title = extractTitle(html);
  const lang = f.includes(path.sep + 'en' + path.sep) ? 'en' : 'es';
  const issues = classify(meta);
  metaToFiles[meta] = metaToFiles[meta] || [];
  metaToFiles[meta].push(slug);
  records.push({ slug, lang, title, meta, len: meta.length, issues });
}

// Mark duplicates
for (const rec of records) {
  if (metaToFiles[rec.meta].length > 1) rec.issues.push('DUPLICATE');
  rec.p = priority(rec.issues, rec.len);
}

records.sort((a, b) => b.p - a.p);

// Write CSV
const csv = ['slug,lang,length,issues,title,meta'];
for (const r of records) {
  if (r.issues.length === 0) continue;
  const esc = s => `"${String(s).replace(/"/g, '""')}"`;
  csv.push([esc(r.slug), r.lang, r.len, r.issues.join('|'), esc(r.title), esc(r.meta)].join(','));
}
fs.writeFileSync(OUT, csv.join('\n'));

// Console summary
const total = records.length;
const problems = records.filter(r => r.issues.length > 0);
const counts = {};
for (const r of problems) for (const i of r.issues) counts[i] = (counts[i] || 0) + 1;

console.log(`\n=== Meta description audit ===`);
console.log(`Scanned: ${total} articles (${records.filter(r => r.lang === 'es').length} ES + ${records.filter(r => r.lang === 'en').length} EN)`);
console.log(`With issues: ${problems.length}`);
console.log();
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(12)} ${v}`);
}
console.log();
console.log(`Top 10 worst offenders:`);
problems.slice(0, 10).forEach(r => {
  console.log(`  [${r.issues.join('|').padEnd(25)}] ${r.slug} (${r.len}ch)`);
});
console.log(`\nFull report: ${path.relative(ROOT, OUT)}`);
