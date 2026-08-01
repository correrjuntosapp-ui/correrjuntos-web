#!/usr/bin/env node
/**
 * PROZIS INJECT — ejecutar cuando Luís mande el alta (link afiliado + cupón).
 *
 * 1. Rellenar PROZIS_URL y PROZIS_CUPON abajo.
 * 2. node tools/prozis-inject.cjs --dry   (ver qué tocaría)
 * 3. node tools/prozis-inject.cjs          (aplicar)
 *
 * Hace dos cosas:
 *  A) Sustituye las cajas de Crown Sport Nutrition (crownsportnutrition.com)
 *     por la caja Prozis en los 8 artículos que las tienen (4 ES + 4 EN).
 *     Crown solo daba 11% de descuento al lector, 0€ para nosotros —
 *     Prozis da 10% al lector + comisión. Exclusividad Prozis exige quitarlas.
 *  B) Reemplaza los comentarios <!-- PROZIS_SLOT: categoria --> por la caja
 *     Prozis en todos los artículos que los tengan.
 *
 * NO tocar el diseño de la caja sin mirar cómo renderiza la de Crown antes
 * (mismo patrón visual, ya validado en producción).
 */

const fs = require('fs');
const path = require('path');

// ══════════ RELLENAR AL RECIBIR EL ALTA ══════════
const PROZIS_URL = 'https://prozis.com/1XBDL'; // URL personal portada (ot=AFFES3177) — generada 28 jul desde la cuenta del founder
const PROZIS_CUPON = 'CORRERJUNTOS'; // confirmado por Luís 28 jul — oficial desde 1 ago
// ═════════════════════════════════════════════════

const DRY = process.argv.includes('--dry');

if (!DRY && !PROZIS_URL) {
  console.error('Falta PROZIS_URL — rellena la constante con el link del alta antes de ejecutar sin --dry.');
  process.exit(1);
}

// Texto visible revisado (1 ago 2026):
//  - sin "exclusivo" (Prozis no ha confirmado exclusividad del descuento)
//  - sin "que usamos y probamos" (solo se han probado los geles, no toda la gama)
//  - la transparencia de afiliado es VISIBLE dentro de la caja, no solo en el
//    comentario HTML y el rel="sponsored" (que el lector no ve).
const box = (lang) => {
  const es = lang !== 'en';
  return `<!-- Prozis · código ${PROZIS_CUPON} · afiliado -->
    <div style="margin:36px 0 24px 0;padding:28px;background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:2px solid #f97316;border-radius:18px;box-shadow:0 12px 32px rgba(249,115,22,0.18)">
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <div style="flex:1;min-width:240px">
          <div style="font-family:'JetBrains Mono','SFMono-Regular',monospace;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#ea580c;font-weight:700;margin-bottom:8px">
            <span style="display:inline-block;width:8px;height:8px;background:#f97316;border-radius:999px;vertical-align:middle;margin-right:8px"></span>Prozis &middot; ${es ? '10% de descuento con nuestro c&oacute;digo' : '10% off with our code'}
          </div>
          <div style="font-size:1.85rem;font-weight:800;color:#0b1220;letter-spacing:.02em;font-family:'JetBrains Mono','SFMono-Regular',monospace;line-height:1">${PROZIS_CUPON}</div>
          <div style="font-size:.92rem;color:#475569;margin-top:10px;line-height:1.5">${es
            ? 'Ahorra un 10% en productos elegibles de Prozis al pagar.'
            : 'Save 10% on eligible Prozis products at checkout.'}</div>
          <div style="font-size:.82rem;color:#64748b;margin-top:8px;line-height:1.45">${es
            ? 'Enlace afiliado: podemos recibir una comisi&oacute;n sin coste adicional para ti.'
            : 'Affiliate link: we may earn a commission at no extra cost to you.'}</div>
        </div>
        <a href="${PROZIS_URL}" target="_blank" rel="nofollow sponsored noopener" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:16px 28px;border-radius:12px;font-weight:700;text-decoration:none;font-size:1rem;letter-spacing:.02em;box-shadow:0 10px 24px rgba(249,115,22,.35)">${es ? 'Comprar en Prozis' : 'Shop Prozis'} &rarr;</a>
      </div>
    </div>`;
};

// ══════════ EXTRACCIÓN DE LA CAJA CROWN (balanceada) ══════════
// [FIX 1 ago 2026] El regex anterior (`[\s\S]*?</div>\s*</div>`) era NO-greedy y
// cortaba en los DOS PRIMEROS </div> consecutivos — el del bloque de texto y el
// del contenedor flex:1 — dejando huérfanos el <a> "Comprar en Crown" y dos
// cierres </div>. Resultado: botón del competidor visible bajo la caja Prozis +
// HTML desbalanceado. Ahora se localiza el comentario y se recorre el div
// contenedor contando aperturas/cierres hasta cerrar a nivel 0.
// [FIX 2 · 1 ago 2026] El comentario debe llevar la FIRMA de la caja promocional
// (`código`/`descuento`). En blog/index.html existe un `<!-- Crown Sport Nutrition -->`
// que etiqueta la TARJETA del artículo /blog/crown-sport-nutrition-opiniones-guia:
// no es una caja y no debe tocarse. Además se exige que lo que sigue al comentario
// sea el div contenedor de la caja (`margin:36px`), no un <a> de tarjeta.
// Firmas reales: ES `· código CORRERJUNTOS · descuento exclusivo lectores`
//                EN `· code CORRERJUNTOS · exclusive reader discount`
//                index.html (tarjeta de artículo, NO tocar) → solo `Crown Sport Nutrition`
const CROWN_COMMENT = /<!-- Crown Sport Nutrition[^>]*(?:c[oó]digo|code|descuento|discount)[^>]*-->/gi;
const BOX_SIGNATURE = 'margin:36px';

/** Devuelve [{start,end}] de cada caja Crown COMPLETA (comentario + div balanceado). */
const findCrownBlocks = (h) => {
  const blocks = [];
  CROWN_COMMENT.lastIndex = 0;
  let m;
  while ((m = CROWN_COMMENT.exec(h)) !== null) {
    const divStart = h.indexOf('<div', m.index + m[0].length);
    if (divStart === -1) continue;
    // Entre el comentario y el div solo puede haber espacios en blanco…
    if (h.slice(m.index + m[0].length, divStart).trim() !== '') continue;
    // …y el div debe ser el contenedor de la caja promocional.
    const divTag = h.slice(divStart, h.indexOf('>', divStart) + 1);
    if (!divTag.includes(BOX_SIGNATURE)) continue;
    // Recorre etiquetas div contando profundidad hasta volver a 0.
    const tagRe = /<div\b|<\/div>/g;
    tagRe.lastIndex = divStart;
    let depth = 0, t, end = -1;
    while ((t = tagRe.exec(h)) !== null) {
      depth += t[0] === '</div>' ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    if (end === -1) continue; // div sin cerrar: no tocar el archivo
    blocks.push({ start: m.index, end });
  }
  return blocks;
};

/** Validación estructural: balance de <div> y ausencia de residuos de Crown. */
const validate = (fp, before, after, expectedBoxes) => {
  const errs = [];
  const count = (s, re) => (s.match(re) || []).length;
  const balBefore = count(before, /<div\b/g) - count(before, /<\/div>/g);
  const balAfter = count(after, /<div\b/g) - count(after, /<\/div>/g);
  if (balBefore !== balAfter) errs.push(`balance <div> alterado: ${balBefore} -> ${balAfter}`);
  if (/crownsportnutrition/i.test(after)) errs.push('queda el dominio crownsportnutrition');
  if (/Comprar en Crown|Shop Crown/i.test(after)) errs.push('queda el botón antiguo de Crown');
  if (/<!-- PROZIS_SLOT:/.test(after)) errs.push('quedan slots PROZIS_SLOT sin resolver');
  const boxes = count(after, new RegExp(`<!-- Prozis · código ${PROZIS_CUPON}`, 'g'));
  if (boxes > expectedBoxes) errs.push(`${boxes} cajas Prozis (máximo ${expectedBoxes})`);
  // Menciones editoriales de Crown (nombre de producto) deben sobrevivir.
  const edBefore = count(before, /crown/gi) - count(before, /crownsportnutrition/gi) * 2 - count(before, /Comprar en Crown|Shop Crown/gi);
  const edAfter = count(after, /crown/gi);
  if (edAfter < edBefore) errs.push(`menciones editoriales de Crown perdidas: ${edBefore} -> ${edAfter}`);
  return errs;
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

// ══════════ POLÍTICA DE ALCANCE (1 ago 2026) ══════════
// Prozis se coloca ÚNICAMENTE en las 9 páginas españolas canónicas autorizadas.
// Todo lo demás queda excluido con su motivo documentado.
const EXCLUDE = new Map([
  // — Separación de marcas: las reviews de Crown son contenido editorial
  //   independiente (sin cupón ni CTA) y nunca reciben caja de Prozis.
  ['blog/crown-sport-nutrition-opiniones-guia.html', 'separación de marcas (review editorial Crown)'],
  ['blog/en/crown-sport-nutrition-review-guide.html', 'separación de marcas (review editorial Crown)'],
  // — Índices: tarjetas de listado, no llevan cajas comerciales.
  ['blog/index.html', 'índice de blog'],
  ['blog/en/index.html', 'índice de blog'],
  // — TEMPORAL: sin confirmación escrita de Prozis de que el cupón CORRERJUNTOS
  //   aplique el 10% y atribuya comisión en mercados internacionales. Estas 4
  //   páginas quedan sin promoción de suplementación hasta autorización expresa.
  //   NO reintroducir sin ese permiso por escrito.
  ['blog/en/best-creatine-running.html', 'EN pendiente de autorización internacional'],
  ['blog/en/best-energy-gels-running.html', 'EN pendiente de autorización internacional'],
  ['blog/en/best-hydration-drinks-running.html', 'EN pendiente de autorización internacional'],
  ['blog/en/best-recovery-drinks-running.html', 'EN pendiente de autorización internacional'],
  // — Redirección 301 declarada en vercel.json → /blog/media-maraton-valencia-2026.
  //   La caja no tendría visibilidad real; la canónica ya lleva la suya.
  ['carreras/media-maraton-valencia.html', 'URL redirigida 301 (sin visibilidad propia)'],
]);
// Salvaguarda adicional: ninguna página bajo blog/en/ recibe caja mientras no
// haya autorización internacional, aunque no esté listada arriba.
const EN_PAUSED = true;
const reasonFor = (fp) => {
  const rel = fp.split(path.sep).join('/');
  if (EXCLUDE.has(rel)) return EXCLUDE.get(rel);
  if (EN_PAUSED && rel.startsWith('blog/en/')) return 'EN en pausa (autorización internacional pendiente)';
  return null;
};

const files = [...walk('blog'), ...walk('carreras')].filter((fp) => {
  const why = reasonFor(fp);
  if (!why) return true;
  // Solo se registra si el archivo era candidato real (tenía caja Crown o slot).
  const h = fs.readFileSync(fp, 'utf8');
  if (/<!-- Crown Sport Nutrition[^>]*(?:c[oó]digo|code|descuento|discount)[^>]*-->|<!-- PROZIS_SLOT:/.test(h)) {
    console.log(`${DRY ? '[dry] ' : ''}— excluido (${why}): ${fp.split(path.sep).join('/')}`);
  }
  return false;
});

// Tope de cajas comerciales por archivo. Las páginas informativas de carrera
// llevan UNA sola (dos resultan excesivas en contenido no-comercial).
const MAX_BOXES_DEFAULT = 2;
const MAX_BOXES_OVERRIDE = {
  'blog/media-maraton-valencia-2026.html': 1,
  'carreras/media-maraton-valencia.html': 1,
};
const budgetFor = (fp) => MAX_BOXES_OVERRIDE[fp.split(path.sep).join('/')] ?? MAX_BOXES_DEFAULT;

let crownSwapped = 0, slotsFilled = 0, slotsRemoved = 0, filesTouched = 0, errorFiles = 0;

for (const fp of files) {
  const original = fs.readFileSync(fp, 'utf8');
  let h = original;
  const lang = fp.includes(path.join('blog', 'en')) ? 'en' : 'es';
  const budget = budgetFor(fp);
  const notes = [];
  let boxesInFile = 0;

  // A) Caja Crown COMPLETA (comentario + div balanceado, incluido su <a>).
  //    Se sustituye de atrás hacia delante para no invalidar los índices.
  const crownBlocks = findCrownBlocks(h);
  if (crownBlocks.length) {
    for (let i = crownBlocks.length - 1; i >= 0; i--) {
      const { start, end } = crownBlocks[i];
      h = h.slice(0, start) + box(lang) + h.slice(end);
    }
    crownSwapped += crownBlocks.length;
    boxesInFile += crownBlocks.length;
    notes.push(`${crownBlocks.length} caja(s) Crown -> Prozis`);
  }

  // B) Slots sembrados — se rellenan hasta agotar el presupuesto del archivo;
  //    los sobrantes se eliminan sin dejar rastro.
  const slotRe = /<!-- PROZIS_SLOT: [a-z]+ -->/g;
  const slots = h.match(slotRe) || [];
  if (slots.length) {
    let filled = 0, removed = 0;
    h = h.replace(slotRe, () => {
      if (boxesInFile + filled < budget) { filled++; return box(lang); }
      removed++; return '';
    });
    boxesInFile += filled;
    slotsFilled += filled;
    slotsRemoved += removed;
    notes.push(`${filled} slot(s) rellenado(s)${removed ? `, ${removed} sobrante(s) eliminado(s)` : ''}`);
  }

  if (!notes.length) continue;
  filesTouched++;

  // C) VALIDACIÓN — se ejecuta SIEMPRE, también en dry-run: la transformación
  //    se aplica en memoria y se comprueba el HTML resultante (el dry-run
  //    anterior solo contaba coincidencias y no detectó el corte del regex).
  const errs = validate(fp, original, h, budget);
  const tag = DRY ? '[dry] ' : '';
  if (errs.length) {
    errorFiles++;
    console.log(`${tag}✘ ${fp}: ${notes.join(' · ')}`);
    errs.forEach((e) => console.log(`${tag}     ERROR: ${e}`));
  } else {
    console.log(`${tag}✔ ${fp}: ${notes.join(' · ')} [${boxesInFile}/${budget} cajas · HTML OK]`);
  }

  if (!DRY && !errs.length) fs.writeFileSync(fp, h);
  if (!DRY && errs.length) console.log(`${tag}     ARCHIVO NO ESCRITO por validación fallida.`);
}

console.log(`\n${DRY ? '[DRY RUN] ' : ''}Total: ${crownSwapped} cajas Crown sustituidas, ${slotsFilled} slots rellenados` +
  `${slotsRemoved ? `, ${slotsRemoved} slot(s) sobrante(s) eliminado(s)` : ''} — ${crownSwapped + slotsFilled} colocaciones en ${filesTouched} archivos.`);
if (errorFiles) {
  console.log(`⚠️  ${errorFiles} archivo(s) con validación FALLIDA. Revisar antes de aplicar.`);
  process.exitCode = 1;
} else {
  console.log('Validación estructural: OK en todos los archivos.');
}
if (!DRY) console.log('Siguiente: revisar 1-2 en local, commit, push, IndexNow ping de los URLs tocados.');
