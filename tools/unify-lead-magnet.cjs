/**
 * Unify lead magnet CTAs across the blog.
 *
 * Strategy: rather than trying to match each bespoke CTA block (many
 * different styles), do targeted replacements:
 *
 *   1. Redirect all href="/recursos/plan-0-5k/" → "/blog/descarga-plan-10k/"
 *      (the 0-5K landing was a pseudo-lead-magnet; the real one is now 10K)
 *
 *   2. Tweak the most common button labels and descriptions:
 *        "Descargar plan gratuito"      → "Descargar PDF"
 *        "Descargar plan 0-5K gratis"   → "Descargar PDF"
 *        "plan gratuito de 0 a 5K"      → "Plan 10K (PDF gratis, 2 semanas)"
 *        "plan de 0 a 5K gratuito"      → "Plan 10K (PDF gratis, 2 semanas)"
 *
 * Keeps intact: editorial prose mentions that link to /planes/0-5k/
 * (the SEO landing page, not a lead magnet). Those contextual mentions
 * are fine where they are.
 *
 * Usage:
 *   node tools/unify-lead-magnet.cjs           # dry-run
 *   node tools/unify-lead-magnet.cjs --apply   # write
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const REPLACEMENTS = [
  // Main href redirect — covers 99% of CTAs
  { from: /href="\/recursos\/plan-0-5k\/"/g,            to: 'href="/blog/descarga-plan-10k/"' },
  { from: /href="\\recursos\\plan-0-5k\\"/g,            to: 'href="/blog/descarga-plan-10k/"' },  // escaped-backslash variant
  { from: /href="\/recursos\/plan-0-5k"/g,              to: 'href="/blog/descarga-plan-10k/"' },  // no trailing slash

  // Button / CTA labels
  { from: />Descargar plan gratuito</g,                 to: '>Descargar PDF<' },
  { from: />Descargar plan 0-5K gratis</g,              to: '>Descargar PDF<' },
  { from: />Descargar plan gratis</g,                   to: '>Descargar PDF<' },
  { from: />Descarga el plan gratuito</g,               to: '>Descargar PDF<' },

  // Lead-magnet descriptor phrasing (when used as CTA, not inline editorial)
  { from: /plan gratuito de 0 a 5K/g,                   to: 'Plan 10K (PDF gratis, 2 semanas)' },
  { from: /plan de 0 a 5K gratuito/g,                   to: 'Plan 10K (PDF gratis, 2 semanas)' },
  { from: /plan de 0 a 5K en 8 semanas/g,               to: 'Plan 10K &mdash; primeras 2 semanas en PDF' },
  { from: /nuestro plan de 0 a 5K/g,                    to: 'nuestro Plan 10K en PDF' },
  { from: /Plan de 0 a 5K sin lesiones/g,               to: 'Plan 10K &mdash; primeras 2 semanas' },
];

function walk(dir, out) {
  out = out || [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(path.join(ROOT, 'blog'));

let touchedFiles = 0;
const touched = [];

for (const f of files) {
  // Skip the Plan 10K thank-you page itself
  if (f.includes('descarga-plan-10k')) continue;

  let html = fs.readFileSync(f, 'utf8');
  const before = html;
  let localCount = 0;

  for (const { from, to } of REPLACEMENTS) {
    const matches = html.match(from);
    if (matches) {
      html = html.replace(from, to);
      localCount += matches.length;
    }
  }

  if (html !== before) {
    touchedFiles++;
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    touched.push({ rel, count: localCount });
    if (APPLY) fs.writeFileSync(f, html);
  }
}

console.log(`\n=== Unify lead magnet (${APPLY ? 'APPLIED' : 'DRY RUN'}) ===`);
console.log(`Scanned ${files.length} blog HTML files\n`);
if (touched.length === 0) {
  console.log('  (no legacy CTAs found)');
} else {
  touched.forEach(t => console.log(`  ✓ ${t.rel}  (${t.count} repl.)`));
}
console.log(`\nFiles changed: ${touchedFiles}`);
if (!APPLY) console.log(`\n(Dry run — re-run with --apply to persist.)\n`);
