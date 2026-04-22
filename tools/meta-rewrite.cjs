/**
 * meta-rewrite.cjs
 * 
 * Rewrites meta descriptions for 29 articles identified in meta-audit-report.csv
 * Fixes: GENERIC (2), MISSING (4), TOO_SHORT (17), TOO_LONG (6)
 * All rewrites: 120-155 chars, keyword-first, no boilerplate
 * 
 * Usage: node tools/meta-rewrite.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// ── REWRITE MAP: slug (relative to blog/) → new meta ──
const REWRITES = {
  // GENERIC fixes
  'mejores-zapatillas-running-asfalto.html': 'Las 10 mejores zapatillas running para asfalto en 2026: comparativa por nivel, pisada y presupuesto. Pros, contras y precio real de cada modelo.',
  'cursa-de-la-merce-2026.html': 'Cursa de la Mercè 2026 Barcelona: fecha, recorrido, inscripción y consejos para terminar la 10K más festiva de Catalunya. Todo lo que necesitas saber.',
  // MISSING meta
  'motivacion-para-correr.html': '10 trucos para mantener la motivación para correr en 2026. Psicología del deporte, rutinas antipereza y cómo superar el muro mental del corredor.',
  'no-tengo-con-quien-correr.html': '¿No tienes con quién correr? 5 soluciones reales: apps, grupos locales, quedadas y cómo encontrar compañeros de entreno en tu ciudad en 2026.',
  // TOO_SHORT / truncated EN
  'en/best-budget-running-shoes.html': 'Best budget running shoes 2026 under $100: 8 tested picks with real pros, cons and who each model is best for. No filler, no sponsored rankings.',
  'en/runners-knee.html': "Stop runner's knee with this 2026 guide: causes, diagnosis, 6-week recovery plan and exercises to prevent it from coming back.",
  'en/best-womens-running-shoes.html': "Top 10 women's running shoes 2026 ranked by cushioning, stability and value. From Nike to Hoka — tested picks for every foot type and budget.",
  'en/madrid-marathon-guide.html': 'Madrid Marathon 2026: registration dates, course map, elevation profile, pacers and expert tips to finish strong. Complete guide updated April 2026.',
  'en/best-running-apps.html': "We tested 12 running apps in 2026 so you don't have to. Best for GPS tracking, training plans, social running and free options compared.",
  'en/runner-diet-what-to-eat.html': "Runner's diet 2026: what to eat before, during and after runs. Meal timing, carb loading, hydration and foods that actually improve performance.",
  'en/how-to-start-running-beginners-guide.html': 'How to start running in 2026: beginner guide with 8-week plan, gear checklist, pace tips and common mistakes to avoid. No experience needed.',
  'en/running-with-your-dog-canicross.html': 'Start canicross with your dog using this complete 2026 beginner guide. Gear, training, safety rules and how to build distance gradually.',
  'en/best-running-shoes-overweight.html': 'Best running shoes for overweight runners 2026: extra cushioning, stability and durability tested. Top picks from Brooks, Asics, Hoka and New Balance.',
  'en/how-to-avoid-stomach-issues-running.html': 'Stop stomach issues while running: 9 proven fixes for cramps, nausea and GI problems. Covers nutrition timing, hydration and race-day protocols.',
  'en/iron-for-runners.html': 'Iron deficiency in runners: symptoms, blood test values, best food sources and when to supplement. Prevent anemia before it kills your performance.',
  'en/san-silvestre-vallecana-guide.html': "San Silvestre Vallecana 2026: registration, 10K route map, cut-off times and race-day tips. Madrid's most iconic New Year's Eve race guide.",
  // TOO_SHORT ES (index pages)
  'zapatillas/index.html': 'Guías y comparativas de zapatillas de running 2026: trail, asfalto, pronación, carbono y más. Encuentra el modelo ideal para tu pisada y presupuesto.',
  'atletas-hibridos/index.html': 'Guías para atletas híbridos 2026: combina running con HYROX, CrossFit y fuerza. Planes, ejercicios y estrategia para rendir en todas las disciplinas.',
  'entrenamiento/index.html': 'Guías de entrenamiento running 2026: planes para maratón, media maratón, 10K, series, fartlek y zonas de FC. Para principiantes y avanzados.',
  // TOO_LONG EN
  'en/transition-running-to-triathlon.html': 'How to transition from running to triathlon in 2026: formats, swim/bike basics, T1/T2 technique, 16-week plan and essential gear checklist.',
  // TOO_LONG ES
  'como-pasar-de-running-a-triatlon.html': 'Cómo pasar de running a triatlón en 2026: formatos, natación, ciclismo, transiciones T1/T2, plan 16 semanas y material imprescindible para debutar.',
  'primera-carrera-10k-consejos.html': '15 consejos para tu primera carrera de 10K: qué llevar, cómo salir, dónde colocarte y cómo controlar los nervios el día de la carrera.',
  'sujetador-deportivo-running.html': '10 mejores sujetadores deportivos para correr 2026: Shock Absorber, Nike, Triumph y más. Guía de tallas, niveles de impacto y cómo elegir el tuyo.',
  'maraton-valencia-guia.html': 'Maratón Valencia 2026: fecha, inscripción, recorrido plano y récords. Por qué es el maratón más rápido de España y cómo prepararte para batir tu marca.',
  'que-comer-antes-media-maraton.html': 'Qué comer antes de una media maratón: cena la noche previa, desayuno según hora de salida y qué evitar siempre. Guía definitiva de nutrición pre-carrera.',
  'en/best-running-sports-bras.html': '10 best running sports bras 2026: Shock Absorber, Nike, Under Armour and more compared. Size guide, impact levels and how to choose for your body type.',
  'correr-postparto-vuelta-al-running.html': 'Volver a correr tras el parto: cuándo es seguro, test de diástasis, plan 8 semanas semana a semana, equipamiento esencial y señales de alarma.',
  'correr-con-alergia-primaveral.html': 'Correr con alergia al polen en 2026: horarios según AEMET, protocolo pre y post-entreno, mascarilla, gafas y antihistamínicos compatibles con el deporte.',
  'hidratacion-media-maraton.html': 'Hidratación en media maratón: cuánto beber antes, durante y después. Estrategia de avituallamientos y cómo evitar la hiponatremia sin perder tiempo.'
};

// ── HELPERS ──
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

function unescapeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&[a-z]+;/g, (entity) => {
      const map = { '&ntilde;': 'ñ', '&Ntilde;': 'Ñ', '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú', '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú', '&uuml;': 'ü', '&iuml;': 'ï', '&ucirc;': 'û', '&quot;': '"', '&amp;': '&', '&middot;': '·', '&laquo;': '«', '&raquo;': '»' };
      return map[entity] || entity;
    });
}

// ── MAIN ──
let updated = 0;
let skipped = 0;
let errors = 0;

for (const [relPath, newMeta] of Object.entries(REWRITES)) {
  const filePath = path.join(ROOT, 'blog', relPath);

  if (!fs.existsSync(filePath)) {
    console.warn('  ⚠️  FILE NOT FOUND: ' + relPath);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Match existing meta description tag (handles encoded chars, varying whitespace)
  const metaRegex = /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i;
  const altMetaRegex = /<meta\s+content="([^"]*)"\s+name="description"\s*\/?>/i;

  const hasMatch = metaRegex.test(html) || altMetaRegex.test(html);

  if (!hasMatch) {
    // Insert after <title> if no meta description found
    const titleMatch = html.indexOf('</title>');
    if (titleMatch !== -1) {
      const insertPos = titleMatch + '</title>'.length;
      const metaTag = '\n    <meta name="description" content="' + escapeHtml(newMeta) + '">';
      if (DRY_RUN) {
        console.log('  + INSERT [' + relPath + ']: ' + newMeta.length + ' chars');
      } else {
        html = html.substring(0, insertPos) + metaTag + html.substring(insertPos);
        fs.writeFileSync(filePath, html, 'utf8');
        console.log('  ✅ INSERT [' + relPath + ']: ' + newMeta.length + ' chars');
      }
      updated++;
    } else {
      console.error('  ❌ NO TITLE TAG: ' + relPath);
      errors++;
    }
    continue;
  }

  // Replace existing meta description
  const newTag = '<meta name="description" content="' + escapeHtml(newMeta) + '">';
  let newHtml = html.replace(metaRegex, newTag);
  if (newHtml === html) {
    newHtml = html.replace(altMetaRegex, newTag);
  }

  if (newHtml === html) {
    console.error('  ❌ REPLACE FAILED: ' + relPath);
    errors++;
    continue;
  }

  if (DRY_RUN) {
    const oldMeta = (html.match(metaRegex) || html.match(altMetaRegex) || ['', ''])[1];
    const oldLen = unescapeHtml(oldMeta).length;
    console.log('  ~ UPDATE [' + relPath + ']: ' + oldLen + ' → ' + newMeta.length + ' chars');
  } else {
    fs.writeFileSync(filePath, newHtml, 'utf8');
    console.log('  ✅ UPDATE [' + relPath + ']: ' + newMeta.length + ' chars');
  }
  updated++;
}

console.log('\n' + (DRY_RUN ? '[DRY RUN] ' : '') + 'Done: ' + updated + ' updated, ' + skipped + ' skipped, ' + errors + ' errors');
