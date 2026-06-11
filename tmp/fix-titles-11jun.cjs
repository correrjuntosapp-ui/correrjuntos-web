// [11 jun 2026 noche] Batch CTR fase 1: reescribir los <title> >70 chars
// renderizados (se truncan en Google). Keyword-first, ≤65, formato click.
// SOLO <title> — H1, og:title y contenido intactos. Sufijo | CorrerJuntos
// se conserva.
const fs = require('fs');

const MAP = {
  'blog/hidratacion-media-maraton.html': 'Hidratación en Media Maratón: Cuánto y Cuándo Beber [2026]',
  'blog/101-km-ronda-2026-guia-completa.html': '101 km de Ronda 2026: Guía del Ultra de la Legión',
  'blog/mejores-carreras-running-andalucia-2026.html': 'Mejores Carreras de Andalucía 2026: Mes a Mes (105)',
  'blog/plan-entrenamiento-5k-sub-25.html': 'Plan 5K Sub-25: 8 Semanas para Bajar de 25:00 [2026]',
  'blog/test-cooper-running.html': 'Test de Cooper: Tablas, Resultados y VO2max [2026]',
  'blog/estrategia-carrera-media-maraton.html': 'Estrategia de Carrera en Media Maratón: Ritmo y Pacing',
  'blog/calentamiento-media-maraton.html': 'Calentamiento para Media Maratón: Rutina de 20 Min',
  'blog/grupos-running-torre-del-mar-correr-sin-limites.html': 'Correr Sin Límites Torre del Mar: el Club del Paseo [2026]',
  'blog/mejores-trails-junio-2026-espana.html': 'Mejores Trails de Junio 2026 en España: 7 Pruebas',
  'blog/que-comer-antes-media-maraton.html': 'Qué Comer Antes de una Media Maratón [Noche y Día D]',
  'blog/correr-con-diabetes.html': 'Correr con Diabetes Tipo 1 y 2: Guía Completa 2026',
  'blog/vo2-max-running-como-mejorar.html': 'Cómo Mejorar tu VO2 Max Corriendo: Plan 8 Semanas [2026]',
  'blog/en/lactate-threshold-running.html': 'Lactate Threshold Running: The Key Session [2026]',
  'blog/en/running-with-diabetes-guide.html': 'Running with Diabetes: Type 1 & 2 Complete Guide (2026)',
  'blog/carreras-nocturnas-espana.html': 'Carreras Nocturnas en España 2026: Calendario Completo',
  'blog/ropa-media-maraton-que-llevar.html': 'Qué Ropa Llevar en una Media Maratón [Según el Tiempo]',
  'blog/ritmo-media-maraton-calculadora.html': 'Calculadora de Ritmo para Media Maratón [Min/Km]',
  'blog/correr-postparto-vuelta-al-running.html': 'Volver a Correr Tras el Parto: Plan Seguro de 8 Semanas',
  'blog/sujetador-deportivo-running.html': 'Mejores Sujetadores Deportivos Running 2026: Top 10',
  'blog/en/cooper-test-running-guide.html': 'Cooper Test: Results Tables & VO2max Calculator (2026)',
  'blog/carga-hidratos-maraton.html': 'Carga de Hidratos para Maratón: Protocolo de 3 Días',
  'blog/como-pasar-de-running-a-triatlon.html': 'De Running a Triatlón: Guía de Transición 2026',
  'blog/correrjuntos-vs-strava.html': 'CorrerJuntos vs Strava: Comparativa Real 2026',
  'blog/grupos-de-running-guia-completa.html': 'Grupos de Running: Cómo Encontrar tu Grupo Ideal 2026',
  'blog/grupos-running-barcelona.html': 'Grupos de Running en Barcelona: Los Mejores 2026',
};

let n = 0;
for (const [f, newTitle] of Object.entries(MAP)) {
  if (!fs.existsSync(f)) { console.log('  NO EXISTE:', f); continue; }
  let h = fs.readFileSync(f, 'utf8');
  const m = h.match(/<title>([^<]+)<\/title>/);
  if (!m) { console.log('  sin title:', f); continue; }
  const suffix = / \|\s*CorrerJuntos/i.test(m[1]) ? ' | CorrerJuntos' : '';
  h = h.replace(m[0], `<title>${newTitle}${suffix}</title>`);
  fs.writeFileSync(f, h);
  n++;
  console.log(`  ✓ (${newTitle.length}) ${f}`);
}
console.log('títulos reescritos:', n);
