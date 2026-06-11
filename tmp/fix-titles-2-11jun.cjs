// [11 jun 2026 noche] Batch CTR fase 2: los 19 títulos restantes (66-70
// renderizados) → ≤65 keyword-first. Cierra el inventario de títulos largos.
const fs = require('fs');

const MAP = {
  'blog/grupos-running-madrid.html': 'Grupos de Running en Madrid: Los 15 Mejores [2026]',
  'blog/media-maraton-valencia-2026.html': 'Media Maratón Valencia 2026: La Más Rápida de España',
  'blog/primera-media-maraton-consejos.html': 'Tu Primera Media Maratón: 20 Consejos Reales [2026]',
  'blog/grupos-running-valencia.html': 'Grupos de Running en Valencia: Los Mejores 2026',
  'blog/mejores-bicicletas-estaticas-runners.html': 'Mejores Bicicletas Estáticas para Runners 2026: Top 10',
  'blog/plan-maraton-sub-4-horas.html': 'Plan Maratón Sub 4 Horas: 16 Semanas Probadas [2026]',
  'blog/primera-carrera-10k-consejos.html': 'Tu Primer 10K: 15 Consejos para el Día D [2026]',
  'blog/ritmo-umbral-running.html': 'Ritmo Umbral Running: 4 Métodos + Tabla [2026]',
  'blog/zapatillas-10k.html': 'Mejores Zapatillas para 10K 2026: Top Velocidad',
  'blog/carrera-de-la-mujer-2026.html': 'Carrera de la Mujer 2026: Calendario + Guía Valencia',
  'blog/correr-durante-menopausia.html': 'Correr en la Menopausia: Guía Real 2026 [Sofocos, Hueso]',
  'blog/plan-media-maraton-sub-1-30.html': 'Plan Media Maratón Sub 1h30: Alto Rendimiento [2026]',
  'blog/sobreentrenamiento-running-sintomas.html': 'Sobreentrenamiento Running: 12 Síntomas + Plan [2026]',
  'blog/en/transition-running-to-triathlon.html': 'Running to Triathlon: Transition Guide for Runners 2026',
  'blog/correr-mejora-salud-mental.html': 'Correr y Salud Mental: 7 Beneficios Probados [2026]',
  'blog/empezar-a-correr-despues-de-los-60.html': 'Empezar a Correr a los 60: Plan de 12 Semanas [2026]',
  'blog/guia-equipamiento-running-2026.html': 'Equipamiento Running 2026: 79 Análisis Reales',
  'blog/mejores-geles-energeticos-running.html': 'Mejores Geles Energéticos Running 2026: Top 10',
  'blog/plan-media-maraton-principiantes.html': 'Plan Media Maratón Principiantes: 12 Semanas [2026]',
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
}
console.log('títulos fase 2 reescritos:', n);
