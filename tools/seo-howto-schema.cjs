#!/usr/bin/env node
/**
 * SEO Quick Win #4 · Inyectar HowTo JSON-LD en articles tipo tutorial/plan
 *
 * Google muestra los `step.name` como pasos numerados desplegables debajo
 * del title en SERP → ocupa ~3x más espacio visual → +30-60% CTR.
 *
 * Schema HowTo es complementario a BlogPosting (Google los procesa juntos).
 *
 * Usage: node tools/seo-howto-schema.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

// Curated HowTo schemas — 5 articles más obvios "cómo X"
const HOWTO_ARTICLES = [
  {
    slug: 'plan-maraton-sub-4-horas',
    name: 'Cómo correr maratón en menos de 4 horas',
    description: 'Plan de 16 semanas con tiradas largas, series VO2 max, ritmo objetivo y nutrición para terminar tu maratón en sub-4h.',
    totalTime: 'PT16W',
    steps: [
      { name: 'Establece tu base aeróbica', text: 'Semanas 1-4: rodajes suaves 5-6 días/semana a ritmo conversacional (zona 2). Volumen progresivo 30 km → 50 km/semana.' },
      { name: 'Introduce el ritmo objetivo', text: 'Semanas 5-8: añade 1 sesión semanal a ritmo maratón (5:40/km). Tiradas largas 18-24 km los domingos.' },
      { name: 'Mejora tu VO2 max con series', text: 'Semanas 9-12: 1 sesión semanal de series cortas 800-1000m a ritmo 5K. Tiradas largas hasta 30 km.' },
      { name: 'Pico de carga: tirada larga 32-34 km', text: 'Semanas 13-14: máximo volumen, simulacro race-pace 25 km a ritmo objetivo + 3 km final fuerte.' },
      { name: 'Tapering 2 semanas', text: 'Semanas 15-16: reduce volumen 40% y 60%. Mantén intensidad. Carga de hidratos 3 días antes.' },
      { name: 'Día de carrera: ejecución', text: 'Sal 5-10 seg/km más lento del objetivo en los primeros 5 km. Gel cada 30 min desde km 8. Hidrata cada avituallamiento.' }
    ]
  },
  {
    slug: 'plan-media-maraton-principiantes',
    name: 'Cómo correr tu primera media maratón',
    description: 'Plan de 12 semanas para principiantes que han corrido un 10K y quieren completar 21K con seguridad.',
    totalTime: 'PT12W',
    steps: [
      { name: 'Confirma tu base: correr 10 km cómodo', text: 'Antes de empezar el plan, debes poder correr 10 km sin parar a ritmo conversacional. Si no, dedica 4-6 semanas a construir esa base.' },
      { name: 'Construye volumen progresivo', text: 'Semanas 1-4: 3 sesiones/semana. Tirada larga sube de 8 km a 12 km los domingos.' },
      { name: 'Añade calidad: rodajes a ritmo', text: 'Semanas 5-8: introduce 1 sesión semanal a ritmo objetivo de carrera. Tirada larga 14-16 km.' },
      { name: 'Tiradas largas de 18-20 km', text: 'Semanas 9-10: pico de volumen. Tirada larga 18 km y 20 km los domingos. Practica nutrición en carrera.' },
      { name: 'Tapering y race-day', text: 'Semanas 11-12: reduce volumen 40%. Última semana solo trotes cortos. Día de carrera: empieza más lento del ritmo objetivo.' }
    ]
  },
  {
    slug: 'vo2-max-running-como-mejorar',
    name: 'Cómo mejorar tu VO2 max corriendo',
    description: 'Métodos validados para subir tu VO2 max en 8-12 semanas: series cortas, ritmo umbral, tiradas largas y recuperación.',
    totalTime: 'PT8W',
    steps: [
      { name: 'Mide tu VO2 max actual', text: 'Usa un test de campo: 2 km a tope tras calentamiento, o el test Cooper de 12 minutos. Reloj GPS con HR da estimación.' },
      { name: 'Programa 1 sesión de series por semana', text: 'Series 800-1200m al 95-100% VO2 max (ritmo 3-5K), 4-6 repeticiones con recuperación trotando 2-3 min entre series.' },
      { name: 'Mantén ritmo umbral 1 vez por semana', text: 'Tempo run 20-40 min al 85-90% FCmáx (ritmo que podrías mantener 1 hora en carrera).' },
      { name: 'Tirada larga aeróbica los domingos', text: 'Construye base aeróbica con 90-120 min a ritmo conversacional. Esto eleva el techo aeróbico que el VO2 max puede explotar.' },
      { name: 'Recupera bien entre sesiones intensas', text: 'Mínimo 48h entre sesiones de calidad. Días suaves a zona 2 estricto. Sueño 7-8h y nutrición rica en carbohidratos.' }
    ]
  },
  {
    slug: 'ritmo-umbral-running',
    name: 'Cómo calcular y entrenar el ritmo umbral',
    description: 'Cuatro métodos para calcular tu ritmo umbral + plan inline 4 semanas + tabla por nivel + 5 errores comunes a evitar.',
    totalTime: 'PT4W',
    steps: [
      { name: 'Calcula tu ritmo umbral', text: 'Método rápido: ritmo que podrías mantener 1 hora en carrera. Métodos precisos: test de 30 min a tope, lactato sangre, FC al 85-90% máx.' },
      { name: 'Programa el tempo run semanal', text: '1 sesión semanal: 20 min calentamiento + 20-40 min a ritmo umbral + 10 min vuelta a la calma. Empieza con 20 min, sube 5 min cada 2 semanas.' },
      { name: 'Alterna formato continuo y fraccionado', text: 'Semana A: tempo continuo 30 min. Semana B: cruise intervals 4x8 min a ritmo umbral con 1 min trote entre series.' },
      { name: 'Evita los 5 errores típicos', text: 'No correrlo demasiado rápido (más cerca del 10K que del 5K). No saltar el calentamiento. No hacerlo en colina. No solo plano. No olvidar la recuperación.' }
    ]
  },
  {
    slug: 'empezar-a-correr-despues-de-los-60',
    name: 'Cómo empezar a correr después de los 60',
    description: 'Guía progresiva para empezar a correr a partir de 60 años: 12 semanas, intervalos caminar-correr, prevención de lesiones.',
    totalTime: 'PT12W',
    steps: [
      { name: 'Chequeo médico previo', text: 'Antes de empezar, consulta con tu médico — especialmente si tienes hipertensión, diabetes o lesiones previas en rodillas.' },
      { name: 'Semanas 1-4: caminar progresivo', text: '30-40 min de caminata diaria a ritmo enérgico. Suma 5 min cada semana. Esto prepara articulaciones y sistema cardiovascular sin estrés.' },
      { name: 'Semanas 5-8: intervalos caminar-correr', text: 'Sesiones 3-4 días/semana. Empieza con 1 min trote + 4 min caminar × 6. Cada semana aumenta el tiempo de trote.' },
      { name: 'Semanas 9-12: correr continuo', text: 'Llega a correr 20-30 min continuos a ritmo muy suave (poder hablar mientras corres). Mejor 4 sesiones cortas que 2 largas.' },
      { name: 'Cuida la recuperación y la fuerza', text: 'Día de descanso entre sesiones de correr. 2 sesiones de fuerza semanal (sentadillas, puentes, plancha) protegen rodillas y caderas.' }
    ]
  }
];

function buildHowToJsonLd(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.name,
    description: article.description,
    totalTime: article.totalTime,
    step: article.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text
    }))
  };
}

let summary = { processed: 0, injected: 0, skipped: 0, missing: [] };

for (const article of HOWTO_ARTICLES) {
  const filePath = path.join('blog', `${article.slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`  · MISSING: ${article.slug}.html`);
    summary.missing.push(article.slug);
    continue;
  }
  summary.processed++;

  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has HowTo schema
  if (/"@type":\s*"HowTo"/.test(html)) {
    console.log(`  · SKIP   : ${article.slug}.html (HowTo schema already present)`);
    summary.skipped++;
    continue;
  }

  // Build JSON-LD block
  const jsonLd = buildHowToJsonLd(article);
  const scriptTag = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

  // Insert just before </head>
  if (!/<\/head>/i.test(html)) {
    console.log(`  · SKIP   : ${article.slug}.html (no </head> tag)`);
    summary.skipped++;
    continue;
  }
  html = html.replace(/<\/head>/i, `${scriptTag}\n</head>`);

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  console.log(`  ${DRY_RUN ? '~' : '✓'} INJECT : ${article.slug}.html (${article.steps.length} steps)`);
  summary.injected++;
}

console.log('');
console.log('═══ Summary ═══');
console.log(`  Processed: ${summary.processed}`);
console.log(`  Injected : ${summary.injected}`);
console.log(`  Skipped  : ${summary.skipped}`);
console.log(`  Missing  : ${summary.missing.length}`);
if (DRY_RUN) console.log('\n  (DRY RUN — no files written)');
