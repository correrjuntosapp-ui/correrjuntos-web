// [11 jun 2026] PATRÓN CANÓNICO páginas /carreras/ — byline de autoridad
// (E-E-A-T para SEO + da credibilidad) + cross-link a la guía de blog si
// existe. Founder: "lo veo pobre, sin autor, sin enlace — crear un patrón
// para TODOS los artículos de carreras". Idempotente: salta si ya tiene byline.
const fs = require('fs');
const path = require('path');

const DIR = 'carreras';
const MES = 'junio de 2026';

// Guías de blog conocidas por slug de carrera (cross-link bidireccional)
const guiaPorSlug = {};
for (const f of fs.readdirSync('blog').filter(x => x.endsWith('-guia.html'))) {
  guiaPorSlug[f.replace('-guia.html', '')] = '/blog/' + f.replace('.html', '');
}
// Slugs de carrera que comparten nombre con su guía
const extraGuias = {
  'maraton-valencia': '/blog/maraton-valencia-guia',
  'media-maraton-valencia': '/blog/media-maraton-valencia-2026',
  'volta-a-peu-valencia': '/blog/volta-a-peu-valencia-2026',
};

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
let done = 0, withGuide = 0;

for (const f of files) {
  const fp = path.join(DIR, f);
  let h = fs.readFileSync(fp, 'utf8');
  // [fix 11 jun noche] Guard también contra .byline (plantilla nueva, ej.
  // golf-runner) — sin esto el Golf Runner acabó con DOS autores.
  if (h.includes('race-byline') || h.includes('class="byline"')) continue;

  const slug = f.replace('.html', '');
  const guia = extraGuias[slug] || guiaPorSlug[slug] || null;
  // ciudad: del breadcrumb o título — fallback genérico
  const guiaLink = guia
    ? `<a href="${guia}" class="rb-guide">Gu&iacute;a de entrenamiento <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>`
    : '';
  if (guia) withGuide++;

  const byline = `
  <div class="race-byline" style="display:flex;align-items:center;gap:14px;margin:0 0 28px;padding:14px 0;border-bottom:1px solid #efe6db">
    <img src="/public/abraham.jpg" alt="Equipo CorrerJuntos" width="44" height="44" loading="lazy" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0">
    <div style="flex:1;min-width:0">
      <div style="font-weight:700;color:#3d3229;font-size:.92rem">Equipo CorrerJuntos</div>
      <div style="font-size:.8rem;color:#8b7355">Gu&iacute;a verificada &middot; Actualizada en ${MES}</div>
    </div>
    ${guiaLink}
  </div>`;

  h = h.replace('<main class="container content">', '<main class="container content">' + byline);
  fs.writeFileSync(fp, h);
  done++;
}

console.log(`bylines añadidos: ${done}/${files.length} · con cross-link a guía: ${withGuide}`);
