#!/usr/bin/env node
/**
 * fix-remaining-titles.cjs
 * Manual rewrite of 23 titles still >65 chars after batch shortening.
 * Each new title preserves primary keywords and fits within 65 chars.
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const blogDir = path.join(__dirname, 'blog');

function decode(str) {
  return str
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&iquest;/g, '¿').replace(/&iexcl;/g, '¡');
}

// Map of file (relative to blogDir) → new title (in HTML-entity form matching the file)
const REWRITES = [
  // 87 → 62
  { file: 'material-trail-running.html',
    newTitle: 'Material Trail Running: Equipamiento Esencial para Monta&ntilde;a' },
  // 78 → 50
  { file: 'entrenamiento/correr-durante-menstruacion-guia-completa-runners.html',
    newTitle: 'Correr durante la Menstruaci&oacute;n: Gu&iacute;a para Runners' },
  // 77 → 56
  { file: 'en/best-trail-running-shoes.html',
    newTitle: '10 Best Trail Running Shoes 2026: Top Models Compared' },
  // 75 → 57
  { file: 'en/best-hydration-drinks-running.html',
    newTitle: '10 Best Electrolyte Drinks for Runners 2026 (Sugar-Free)' },
  // 75 → 58
  { file: 'mejores-recuperadores-running.html',
    newTitle: 'Recuperaci&oacute;n Muscular para Runners: Nutrici&oacute;n Post-Carrera' },
  // 73 → 59
  { file: 'hidratacion-running-guia-completa.html',
    newTitle: 'Hidrataci&oacute;n Running: Cu&aacute;nto Beber Antes, Durante y Despu&eacute;s' },
  // 72 → 51
  { file: 'en/running-power.html',
    newTitle: 'Running Power: How to Measure and Train with Watts' },
  // 71 → 56
  { file: 'en/garmin-forerunner-55-review.html',
    newTitle: 'Garmin Forerunner 55 Review: Best Entry-Level GPS Watch' },
  // 71 → 56
  { file: 'mejores-apps-running.html',
    newTitle: '10 Mejores Apps para Correr en Grupo 2026 (An&aacute;lisis)' },
  // 70 → 60
  { file: 'correr-con-musica-beneficios.html',
    newTitle: 'Correr con M&uacute;sica: Beneficios y C&oacute;mo Elegir el Ritmo Ideal' },
  // 69 → 60
  { file: 'rodillo-vs-pistola-masaje-recuperacion.html',
    newTitle: 'Rodillo vs Pistola de Masaje: Cu&aacute;l Elegir para Recuperarte' },
  // 68 → 51
  { file: 'en/jbl-reflect-flow-pro-review.html',
    newTitle: 'JBL Reflect Flow Pro Review: ANC &amp; IP68 for Runners' },
  // 68 → 56
  { file: 'potencia-en-running.html',
    newTitle: 'Potencia en Running: Qu&eacute; Es, C&oacute;mo Medirla y Entrenar' },
  // 67 → 56
  { file: 'como-aumentar-resistencia-corriendo.html',
    newTitle: 'Aumentar Resistencia Corriendo: 7 Estrategias Efectivas' },
  // 67 → 59
  { file: 'empezar-a-correr-despues-de-los-50.html',
    newTitle: 'Empezar a Correr Despu&eacute;s de los 50: Gu&iacute;a para Hacerlo Bien' },
  // 67 → 57
  { file: 'entrenamiento-por-zonas-running.html',
    newTitle: 'Entrenamiento por Zonas en Running: FC, Ritmo y Potencia' },
  // 67 → 52
  { file: 'grupos-running-malaga.html',
    newTitle: 'Grupos de Running en M&aacute;laga 2026: Clubes y Quedadas' },
  // 67 → 51
  { file: 'pack-basico-running-principiantes.html',
    newTitle: 'Pack B&aacute;sico de Running: Todo para Empezar a Correr' },
  // 66 → 59
  { file: 'en/why-people-quit-running-3-months.html',
    newTitle: 'Why Most People Quit Running in 3 Months (How to Avoid It)' },
  // 66 → 55
  { file: 'mejores-auriculares-baratos-running.html',
    newTitle: '8 Mejores Auriculares Baratos para Running 2026 (&lt;60&euro;)' },
  // 66 → 55
  { file: 'mejores-zapatillas-running-principiantes.html',
    newTitle: 'Mejores Zapatillas para Empezar a Correr 2026: Gu&iacute;a' },
  // 66 → 54
  { file: 'seguridad-correr-con-desconocidos.html',
    newTitle: '&iquest;Es Seguro Correr con Desconocidos? Gu&iacute;a para Runners' },
  // 66 → 55
  { file: 'tendinitis-aquiles-running.html',
    newTitle: 'Tendinitis de Aquiles en Runners: Causas y Tratamiento' },
];

let fixed = 0;

REWRITES.forEach(({ file, newTitle }) => {
  const filePath = path.join(blogDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  NOT FOUND: ${file}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const newLen = decode(newTitle).length;

  if (newLen > 65) {
    console.log(`  ❌ STILL TOO LONG (${newLen}): ${file} → ${decode(newTitle)}`);
    return;
  }

  // Extract current title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (!titleMatch) {
    console.log(`  ⚠️  NO TITLE TAG: ${file}`);
    return;
  }

  const oldTitle = titleMatch[1];

  // Replace <title>
  html = html.replace(`<title>${oldTitle}</title>`, `<title>${newTitle}</title>`);

  // Replace og:title
  const ogMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
  if (ogMatch) {
    html = html.replace(ogMatch[0], `<meta property="og:title" content="${newTitle}"`);
  }

  // Replace twitter:title
  const twMatch = html.match(/<meta\s+name="twitter:title"\s+content="([^"]+)"/);
  if (twMatch) {
    html = html.replace(twMatch[0], `<meta name="twitter:title" content="${newTitle}"`);
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  console.log(`  ✅ [${decode(oldTitle).length}→${newLen}] ${file}`);
  fixed++;
});

console.log(`\n✅ fix-remaining-titles.cjs complete`);
console.log(`   Titles rewritten: ${fixed}/${REWRITES.length}`);
console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLIED'}`);
