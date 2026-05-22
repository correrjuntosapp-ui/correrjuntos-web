#!/usr/bin/env node
/**
 * SEO Quick Win #2 · Refresh dateModified + visible "Actualizado mayo 2026"
 *
 * - Update "dateModified":"YYYY-MM-DD" in JSON-LD → 2026-05-22
 * - Update intro "Actualizado YYYY" / "Actualizado X 2026" → "Actualizado mayo 2026"
 *   (if not present, append "Actualizado mayo 2026" to first <p> after <h1>)
 *
 * Why this works: Google promueve freshness · re-crawl detecta dateModified
 * actualizado + cambio visible real = posición +1-3 en 14-30 días.
 *
 * Usage: node tools/seo-refresh-dates.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const TODAY = '2026-05-22';
const VISIBLE_LABEL_ES = 'Actualizado mayo 2026';
const VISIBLE_LABEL_EN = 'Updated May 2026';

const ARTICLES_ES = [
  // Affiliate fuertes
  'mejores-zapatillas-running',
  'mejores-relojes-gps-running',
  'mejores-bebidas-hidratacion-running',
  'mejores-geles-energeticos-running',
  'mejores-creatinas-running',
  'mejores-recuperadores-running',
  'mejores-bicicletas-estaticas-runners',
  'mejores-zapatillas-trail-running',
  'mejores-zapatillas-running-mujer',
  'mejores-zapatillas-running-principiantes',
  'guia-equipamiento-running-2026',
  'equipamiento-running-principiante-200-euros',
  // Planes y tutoriales
  'plan-maraton-sub-4-horas',
  'plan-media-maraton-principiantes',
  'plan-media-maraton-sub-2-horas',
  'ritmo-umbral-running',
  'tirada-larga-running',
  'vo2-max-running-como-mejorar',
  'carga-hidratos-maraton',
  // Salud / lifestyle
  'correr-mejora-salud-mental',
  'correr-durante-menopausia',
  'empezar-a-correr-despues-de-los-60',
  // Big SEO bets
  'mejor-app-running-gratuita-2026',
  'correrjuntos-vs-strava',
  '101-km-ronda-2026-guia-completa',
];

const DRY_RUN = process.argv.includes('--dry-run');

function refreshDate(html, lang = 'es') {
  let changed = false;
  const visibleLabel = lang === 'en' ? VISIBLE_LABEL_EN : VISIBLE_LABEL_ES;
  const updatedPattern = lang === 'en' ? /Updated \w+ 20\d{2}/g : /Actualizado \w+ 20\d{2}/g;
  const updatedShort = lang === 'en' ? /Updated 20\d{2}/g : /Actualizado 20\d{2}/g;

  // 1. Update JSON-LD dateModified
  const beforeJsonLd = html;
  html = html.replace(/"dateModified":"[\d-]+"/g, `"dateModified":"${TODAY}"`);
  if (html !== beforeJsonLd) changed = true;

  // 2. Update intro paragraph "Actualizado X 2026" or "Actualizado 2026" → "Actualizado mayo 2026"
  const beforeIntro = html;
  html = html.replace(updatedPattern, visibleLabel);
  html = html.replace(updatedShort, visibleLabel);
  if (html !== beforeIntro) {
    changed = true;
  } else {
    // 3. If no "Actualizado" mention in intro, inject after first <p> following <h1>
    const introInjectRegex = /(<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>[^<]*?)(<\/p>)/;
    const match = html.match(introInjectRegex);
    if (match && !match[1].includes(visibleLabel)) {
      html = html.replace(introInjectRegex, `$1 ${visibleLabel}.$2`);
      changed = true;
    }
  }

  return { html, changed };
}

let summary = { processed: 0, updated: 0, skipped: 0, missing: [] };

for (const slug of ARTICLES_ES) {
  const filePath = path.join('blog', `${slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`  · MISSING: ${slug}.html`);
    summary.missing.push(slug);
    continue;
  }
  summary.processed++;

  const original = fs.readFileSync(filePath, 'utf8');
  const { html, changed } = refreshDate(original, 'es');

  if (!changed) {
    console.log(`  · SKIP   : ${slug}.html (no changes)`);
    summary.skipped++;
    continue;
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  console.log(`  ${DRY_RUN ? '~' : '✓'} UPDATE : ${slug}.html`);
  summary.updated++;

  // EN version (if exists)
  const enFile = path.join('blog', 'en', `${slug}.html`);
  // Try common EN slug variants
  const enSlugCandidates = [
    slug,
    slug.replace('mejores-', 'best-'),
    slug.replace('plan-', 'plan-'),
    slug.replace('-running', '-running'),
  ];
  // Skip EN auto-detection for simplicity in v1 — operator can do later
}

console.log('');
console.log('═══ Summary ═══');
console.log(`  Processed: ${summary.processed}`);
console.log(`  Updated  : ${summary.updated}`);
console.log(`  Skipped  : ${summary.skipped}`);
console.log(`  Missing  : ${summary.missing.length}`);
if (summary.missing.length) {
  console.log(`  Missing list: ${summary.missing.join(', ')}`);
}
if (DRY_RUN) console.log('\n  (DRY RUN — no files written)');
