#!/usr/bin/env node
/**
 * SEO Quick Win #1 · Optimizar title + meta description (top 25 articles)
 *
 * Patrón Wirecutter/Outside/RTINGS:
 *   - Bracket con beneficio cuantificado → [12 Modelos], [Plan + Tabla]
 *   - Power words emocionales → Definitiva, Probada, Real, Lo que Nadie Dice
 *   - Promesa específica medible → "en 4 semanas", "para 60+"
 *   - Conserva keyword principal (no rompe SEO)
 *   - Año 2026 al final
 *
 * Meta description 150-160 chars con beneficio first + power words + CTA implícita.
 *
 * Esperado: CTR 0.7% → 2%+ (3x clicks en top 20 articles).
 *
 * Usage: node tools/seo-ctr-titles.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

const OPTIMIZATIONS = [
  // === AFFILIATE FUERTES (revenue drivers) ===
  {
    slug: 'mejores-zapatillas-running',
    title: 'Mejores Zapatillas Running 2026: Top 10 Probadas [Por Nivel] | CorrerJuntos',
    desc: 'Las 10 mejores zapatillas running 2026 probadas por corredores reales. Comparativa por nivel: principiante, intermedio, competición. Precios y marcas.'
  },
  {
    slug: 'mejores-relojes-gps-running',
    title: 'Mejores Relojes GPS Running 2026: Top 8 Reales [Comparativa] | CorrerJuntos',
    desc: 'Los 8 mejores relojes GPS para running 2026 comparados sin sponsors. Garmin, COROS, Polar y Apple Watch. Precios, batería, métricas y para qué corredor.'
  },
  {
    slug: 'mejores-bebidas-hidratacion-running',
    title: 'Mejores Bebidas Hidratación Running 2026: Top 10 [Test Real] | CorrerJuntos',
    desc: 'Las 10 mejores bebidas isotónicas para corredores 2026 probadas en tiradas largas. Por qué la mayoría falla en maratón y cuáles funcionan realmente.'
  },
  {
    slug: 'mejores-geles-energeticos-running',
    title: 'Mejores Geles Energéticos Running 2026: Top 10 [Real para 21K/42K] | CorrerJuntos',
    desc: 'Los 10 mejores geles energéticos 2026 para media maratón y maratón. SiS, Maurten, Crown, 226ERS comparados. Qué gel usar a qué hora de carrera.'
  },
  {
    slug: 'mejores-creatinas-running',
    title: 'Creatina para Corredores 2026: Top 7 Probadas [Sí Funciona] | CorrerJuntos',
    desc: 'Las 7 mejores creatinas 2026 para runners + cuánto tomar para mejorar fuerza, recuperación y series sin perder ligereza. Mitos derribados.'
  },
  {
    slug: 'mejores-recuperadores-running',
    title: 'Mejores Recuperadores Running 2026: Top 8 [Probado tras Tirada] | CorrerJuntos',
    desc: 'Los 8 mejores recuperadores 2026 para runners: proteína, BCAA, ZMA. Cuándo tomar y cuál funciona realmente tras tirada larga o serie dura.'
  },
  {
    slug: 'mejores-bicicletas-estaticas-runners',
    title: 'Mejores Bicicletas Estáticas para Corredores 2026: Top 10 [€99-€500] | CorrerJuntos',
    desc: 'Las 10 mejores bicis estáticas 2026 para entrenamiento cruzado de runners. Modelos €99-€500 testados. Por qué necesitas una si te lesionas.'
  },
  {
    slug: 'mejores-zapatillas-trail-running',
    title: 'Mejores Zapatillas Trail Running 2026: Top 10 [Por Terreno] | CorrerJuntos',
    desc: 'Las 10 mejores zapatillas de trail 2026 probadas en terreno real. Salomon, La Sportiva, Hoka, Altra comparadas. Por distancia y tipo de pista.'
  },
  {
    slug: 'mejores-zapatillas-running-mujer',
    title: 'Mejores Zapatillas Running Mujer 2026: Top 10 [Horma Real] | CorrerJuntos',
    desc: 'Las 10 mejores zapatillas running para mujer 2026 con horma adaptada. Por nivel y tipo de pisada. Sin colores rosas como único criterio.'
  },
  {
    slug: 'mejores-zapatillas-running-principiantes',
    title: 'Mejores Zapatillas Running Principiantes 2026: Top 10 [€60-€140] | CorrerJuntos',
    desc: 'Las 10 mejores zapatillas para empezar a correr 2026. €60-€140. Amortiguación, drop y horma explicados sin tecnicismos. Evita las trampas marketing.'
  },
  {
    slug: 'guia-equipamiento-running-2026',
    title: 'Guía Equipamiento Running 2026: 79 Análisis Reales [Por Categoría] | CorrerJuntos',
    desc: 'Guía completa equipamiento running 2026: zapatillas, relojes GPS, auriculares, hidratación, ropa, trail, nutrición. 79 análisis en 8 categorías.'
  },
  {
    slug: 'equipamiento-running-principiante-200-euros',
    title: 'Equipamiento Running Principiante 2026: Kit Completo por 200€ | CorrerJuntos',
    desc: 'Kit running completo para empezar 2026 por solo 200€: zapatillas + ropa + reloj básico + hidratación. Sin marcas trampa ni gastos innecesarios.'
  },
  // === PLANES Y TUTORIALES ===
  {
    slug: 'plan-maraton-sub-4-horas',
    title: 'Plan Maratón Sub 4 Horas 2026: 16 Semanas Probadas [Tirada + Series] | CorrerJuntos',
    desc: 'Plan maratón sub 4 horas en 16 semanas: tiradas largas, series VO2, ritmo objetivo 5:40/km y nutrición real. Probado por runners de la comunidad.'
  },
  {
    slug: 'plan-media-maraton-principiantes',
    title: 'Plan Media Maratón Principiantes 2026: 12 Semanas [Tu Primera 21K] | CorrerJuntos',
    desc: 'Plan media maratón para principiantes en 12 semanas. Cómo pasar de 10K a 21K sin lesionarse. Sesiones por semana, tirada larga y race-day.'
  },
  {
    slug: 'plan-media-maraton-sub-2-horas',
    title: 'Plan Media Maratón Sub 2 Horas 2026: 12 Semanas [Ritmo 5:40/km] | CorrerJuntos',
    desc: 'Plan media maratón sub 2 horas en 12 semanas: tiradas largas, ritmo umbral, series 1K. Estrategia race-day y nutrición para bajar el tiempo.'
  },
  {
    slug: 'ritmo-umbral-running',
    title: 'Ritmo Umbral Running 2026: 4 Métodos Reales [Tabla + Plan 4 Semanas] | CorrerJuntos',
    desc: 'Qué es el ritmo umbral, cómo calcularlo con 4 métodos (test, lactato, FC, percepción), tabla por nivel y plan inline de 4 semanas. Errores típicos.'
  },
  {
    slug: 'tirada-larga-running',
    title: 'Tirada Larga Running 2026: Cuánto y Cómo [La Base de tu Plan] | CorrerJuntos',
    desc: 'Cuánto debe durar tu tirada larga según objetivo (10K, 21K, 42K), a qué ritmo correrla y los 5 errores que la arruinan. Por qué es la sesión clave.'
  },
  {
    slug: 'vo2-max-running-como-mejorar',
    title: 'Cómo Mejorar tu VO2 Max Corriendo 2026: 8 Semanas Reales [Series + Tirada] | CorrerJuntos',
    desc: 'Cómo subir tu VO2 max en 8 semanas: series 800-1200m, tempo run, tiradas largas y recuperación. Test de campo para medir progreso real.'
  },
  {
    slug: 'carga-hidratos-maraton',
    title: 'Carga de Hidratos Maratón 2026: Protocolo 3 Días [60-90g/h en Carrera] | CorrerJuntos',
    desc: 'Protocolo real de carga de carbohidratos 3 días antes del maratón + estrategia de 60-90g/h en carrera. Por qué la pasta sola no funciona.'
  },
  // === SALUD / LIFESTYLE ===
  {
    slug: 'correr-mejora-salud-mental',
    title: 'Correr y Salud Mental 2026: 7 Beneficios Reales [Estudios Citados] | CorrerJuntos',
    desc: 'Los 7 beneficios probados de correr para ansiedad, depresión y autoestima. Estudios reales citados. Cuánto correr a la semana para notarlo.'
  },
  {
    slug: 'correr-durante-menopausia',
    title: 'Correr Durante la Menopausia 2026: Guía Real [Sofocos, Hueso, Peso] | CorrerJuntos',
    desc: 'Cómo correr durante la menopausia: efecto en sofocos, densidad ósea, peso y sueño. Qué cambiar en tu plan y errores típicos a esa edad.'
  },
  {
    slug: 'empezar-a-correr-despues-de-los-60',
    title: 'Empezar a Correr Después de los 60: Plan 12 Semanas [Sin Lesiones] | CorrerJuntos',
    desc: 'Cómo empezar a correr a partir de los 60 años: chequeo médico, intervalos caminar-correr y plan de 12 semanas seguro. Prevención de lesiones.'
  },
  // === BIG SEO BETS ===
  {
    slug: 'mejor-app-running-gratuita-2026',
    title: 'Mejor App Running Gratuita 2026: 5 Comparadas [Sin Sponsors] | CorrerJuntos',
    desc: 'Las 5 mejores apps de running gratis 2026 comparadas sin sponsors: Strava, Nike Run, Runna, CorrerJuntos y Garmin. Cuál es para ti según tu perfil.'
  },
  {
    slug: 'correrjuntos-vs-strava',
    title: 'CorrerJuntos vs Strava 2026: Comparativa Real [Para Quién Es Cada Una] | CorrerJuntos',
    desc: 'CorrerJuntos vs Strava 2026: comparativa honesta. Quién gana en social, plan adaptativo, coach IA y comunidad. Quién es para ti según tu perfil.'
  },
  {
    slug: '101-km-ronda-2026-guia-completa',
    title: '101 km de Ronda 2026: Guía Completa [Recorrido + Plan 16 Semanas] | CorrerJuntos',
    desc: 'Guía completa 101 km de Ronda 2026: recorrido por secciones, time cuts, equipamiento obligatorio, plan entrenamiento 16 semanas y nutrición real.'
  }
];

function updateTitleAndDesc(html, newTitle, newDesc) {
  let changed = 0;
  // Escape special HTML entities that may already exist
  const escTitle = newTitle.replace(/'/g, '&#39;');
  const escDesc = newDesc.replace(/"/g, '&quot;');

  const beforeTitle = html;
  html = html.replace(/<title>[^<]+<\/title>/, `<title>${escTitle}</title>`);
  if (html !== beforeTitle) changed++;

  const beforeDesc = html;
  html = html.replace(
    /<meta name="description" content="[^"]+"/,
    `<meta name="description" content="${escDesc}"`
  );
  if (html !== beforeDesc) changed++;

  // Also update og:title, og:description, twitter:title, twitter:description
  html = html.replace(
    /<meta property="og:title" content="[^"]+"/,
    `<meta property="og:title" content="${escTitle}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]+"/,
    `<meta property="og:description" content="${escDesc}"`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]+"/,
    `<meta name="twitter:title" content="${escTitle}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]+"/,
    `<meta name="twitter:description" content="${escDesc}"`
  );

  return { html, changed };
}

let summary = { processed: 0, updated: 0, skipped: 0, missing: [] };

for (const opt of OPTIMIZATIONS) {
  const filePath = path.join('blog', `${opt.slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`  · MISSING: ${opt.slug}.html`);
    summary.missing.push(opt.slug);
    continue;
  }
  summary.processed++;

  const original = fs.readFileSync(filePath, 'utf8');
  const { html, changed } = updateTitleAndDesc(original, opt.title, opt.desc);

  if (changed === 0) {
    console.log(`  · SKIP   : ${opt.slug}.html (no replaces matched)`);
    summary.skipped++;
    continue;
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  console.log(`  ${DRY_RUN ? '~' : '✓'} UPDATE : ${opt.slug}.html (${changed} replaces)`);
  summary.updated++;
}

console.log('');
console.log('═══ Summary ═══');
console.log(`  Processed: ${summary.processed}`);
console.log(`  Updated  : ${summary.updated}`);
console.log(`  Skipped  : ${summary.skipped}`);
console.log(`  Missing  : ${summary.missing.length}`);
if (DRY_RUN) console.log('\n  (DRY RUN — no files written)');
