// [11 jun 2026 noche] Enlazar la calculadora desde el cluster de
// ritmo/entrenamiento — anchor con keyword (transfiere autoridad).
// Inserta un párrafo-CTA tras el primer </p> del primer H2 de contenido.
const fs = require('fs');

const targets = [
  ['blog/ritmo-umbral-running.html', 'calcula tu ritmo umbral y todas tus zonas'],
  ['blog/cadencia-running-ideal.html', 'calcula tus ritmos de entrenamiento por zonas'],
  ['blog/vo2-max-running-como-mejorar.html', 'calculadora de ritmo y predicción de marca'],
  ['blog/cuantos-km-semana-correr.html', 'calcula tus ritmos de entrenamiento'],
  ['blog/como-correr-mas-rapido.html', 'calculadora de ritmo running con predicción de marca'],
  ['blog/como-aumentar-resistencia-corriendo.html', 'calcula tus zonas de entrenamiento'],
  ['blog/tirada-larga-running.html', 'calcula tu ritmo de tirada larga'],
  ['blog/plan-media-maraton-sub-1-30.html', 'calculadora de ritmos para tu objetivo'],
  ['blog/como-preparar-primera-carrera-5k.html', 'calcula tu ritmo objetivo de 5K'],
  ['blog/calentamiento-media-maraton.html', 'calcula tus ritmos de competición'],
];

let n = 0;
for (const [f, anchor] of targets) {
  if (!fs.existsSync(f)) { console.log('  skip (no existe):', f); continue; }
  let h = fs.readFileSync(f, 'utf8');
  if (h.includes('/calculadora-ritmo-running')) { console.log('  ya enlaza:', f); continue; }

  const cta = `\n<p style="background:rgba(249,115,22,.06);border-left:3px solid #f97316;padding:12px 16px;border-radius:0 10px 10px 0"><strong>Herramienta gratis:</strong> <a href="/calculadora-ritmo-running">${anchor}</a> en 10 segundos — predicción de 5K a maratón con la fórmula de Riegel.</p>\n`;

  // tras el primer </p> que siga al primer <h2 de contenido
  const h2 = h.search(/<h2[^>]*>(?!.*?(Tabla de contenidos|Índice))/i);
  if (h2 === -1) { console.log('  skip (sin h2):', f); continue; }
  const pEnd = h.indexOf('</p>', h2);
  if (pEnd === -1) { console.log('  skip (sin p):', f); continue; }
  h = h.substring(0, pEnd + 4) + cta + h.substring(pEnd + 4);
  fs.writeFileSync(f, h);
  n++;
  console.log('  +', f);
}
console.log('enlaces a calculadora añadidos:', n);
