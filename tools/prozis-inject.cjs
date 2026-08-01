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

// ══════════ DISEÑO EDITORIAL DE LA CAJA (1 ago 2026, v2) ══════════
// Reemplaza la caja "bloque naranja" inicial por un acabado editorial:
// dos columnas en escritorio, apilado y CTA a ancho completo en móvil,
// módulo de código con botón "Copiar" y aviso de afiliado VISIBLE.
//
// Reglas que NO se pueden romper:
//  - el título de la caja es un <p>, nunca h2/h3: no altera el esquema de
//    encabezados del artículo ni su SEO;
//  - los estilos van UNA vez por página (marcador PROZIS_OFFER_STYLES);
//  - el script de copia va UNA vez por página (marcador PROZIS_COPY_SCRIPT)
//    y usa delegación de eventos, así vale para 1 o 2 cajas sin IDs;
//  - sin recursos externos ni logotipo oficial de Prozis.
const OFFER_STYLES = `<!-- PROZIS_OFFER_STYLES -->
<style>
.prozis-offer{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) 216px;gap:26px;align-items:center;margin:32px 0;padding:24px 26px 24px 30px;border:1px solid rgba(234,88,12,.24);border-radius:20px;background:radial-gradient(circle at 100% 0%,rgba(251,146,60,.14),transparent 38%),linear-gradient(135deg,#fff 0%,#fffaf4 100%);box-shadow:0 14px 38px rgba(124,45,18,.08),0 2px 6px rgba(17,24,39,.04);color:#111827;font-family:inherit}
.prozis-offer::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:linear-gradient(180deg,#fb923c,#f65a0a)}
.prozis-offer p{margin:0!important}
.pz-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:8px!important;color:#c2410c;font-size:.72rem;font-weight:800;letter-spacing:.11em;line-height:1.3;text-transform:uppercase}
.pz-kicker::before{content:"";width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#f65a0a;box-shadow:0 0 0 4px rgba(246,90,10,.11)}
.pz-title{font-size:clamp(1.28rem,3.3vw,1.7rem);font-weight:800;line-height:1.14;letter-spacing:-.03em;color:#111827}
.pz-desc{margin:7px 0 15px!important;max-width:46ch;color:#5f6877;font-size:.93rem;line-height:1.55}
.pz-code{display:flex;align-items:stretch;width:min(100%,376px);border:1px solid rgba(234,88,12,.28);border-radius:14px;background:#fff}
.pz-code-value{min-width:0;flex:1;padding:9px 14px}
.pz-code-label{display:block;margin-bottom:1px;color:#8a4a23;font-size:.62rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.pz-code-value code{padding:0;border:0;background:none;color:#111827;font:800 1.05rem/1.2 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.035em}
.pz-copy-btn{min-width:96px;min-height:44px;margin:5px;padding:0 13px;border:0;border-radius:10px;background:#fff3e4;color:#c2410c;font:inherit;font-size:.8rem;font-weight:800;cursor:pointer;transition:background .18s ease,transform .18s ease}
.pz-copy-btn:hover{background:#ffe4c5}
.pz-copy-btn:active{transform:translateY(1px)}
.pz-copy-btn:focus-visible,.pz-cta:focus-visible{outline:3px solid rgba(59,130,246,.45);outline-offset:3px}
.pz-live{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.pz-actions{display:grid;gap:9px;align-content:center}
.pz-cta{display:inline-flex;min-height:50px;align-items:center;justify-content:center;padding:12px 18px;border-radius:13px;background:linear-gradient(135deg,#c2410c,#9a3412);box-shadow:0 10px 22px rgba(154,52,18,.25);color:#fff!important;font-size:.9rem;font-weight:800;line-height:1.3;text-align:center;text-decoration:none!important;white-space:nowrap;transition:box-shadow .18s ease,transform .18s ease}
.pz-cta:hover{box-shadow:0 13px 26px rgba(246,90,10,.32);transform:translateY(-1px)}
.pz-note{color:#5f6877;font-size:.75rem;line-height:1.45;text-align:center}
@media(max-width:720px){.prozis-offer{grid-template-columns:1fr;gap:18px;padding:22px 18px 22px 22px;border-radius:18px}.pz-code{width:100%}.pz-cta{width:100%}.pz-desc{margin-bottom:14px!important}}
@media(max-width:400px){.pz-code{display:grid}.pz-copy-btn{margin:0 5px 5px}}
@media(prefers-reduced-motion:reduce){.pz-copy-btn,.pz-cta{transition:none}}
</style>`;

const COPY_SCRIPT = `<!-- PROZIS_COPY_SCRIPT -->
<script>
(function(){
  if(window.__pzCopyBound)return;window.__pzCopyBound=true;
  var RESET=1800;
  function announce(box,msg){var l=box&&box.querySelector('.pz-live');if(l)l.textContent=msg;}
  function legacyCopy(text){
    var ta=document.createElement('textarea');
    ta.value=text;ta.setAttribute('readonly','');
    ta.style.cssText='position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy');}catch(e){ok=false;}
    document.body.removeChild(ta);return ok;
  }
  document.addEventListener('click',function(ev){
    var btn=ev.target&&ev.target.closest?ev.target.closest('.pz-copy-btn'):null;
    if(!btn)return;
    var code=btn.getAttribute('data-pz-copy')||'';
    var box=btn.closest('.prozis-offer');
    function done(ok){
      btn.textContent=ok?'Copiado \\u2713':code;
      announce(box,ok?('C\\u00f3digo '+code+' copiado al portapapeles'):('Selecciona y copia el c\\u00f3digo '+code));
      window.setTimeout(function(){btn.textContent='Copiar';announce(box,'');},RESET);
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(function(){done(true);},function(){done(legacyCopy(code));});
    }else{done(legacyCopy(code));}
  });
})();
</script>`;

const box = (lang) => {
  const es = lang !== 'en';
  const t = es ? {
    aria: `Ventaja para la comunidad: 10 % de descuento en Prozis con el c&oacute;digo ${PROZIS_CUPON}`,
    kicker: 'Ventaja para la comunidad',
    title: 'Consigue un 10 % de descuento en Prozis',
    desc: 'Usa nuestro c&oacute;digo al finalizar tu compra en productos elegibles.',
    label: 'C&oacute;digo de descuento',
    copy: 'Copiar',
    copyAria: `Copiar el c&oacute;digo ${PROZIS_CUPON}`,
    cta: 'Comprar en Prozis &rarr;',
    note: 'Enlace de afiliado. Podemos recibir una comisi&oacute;n sin coste adicional para ti.',
  } : {
    aria: `Community perk: 10% off at Prozis with the code ${PROZIS_CUPON}`,
    kicker: 'Community perk',
    title: 'Get 10% off at Prozis',
    desc: 'Use our code at checkout on eligible products.',
    label: 'Discount code',
    copy: 'Copy',
    copyAria: `Copy the code ${PROZIS_CUPON}`,
    cta: 'Shop Prozis &rarr;',
    note: 'Affiliate link. We may earn a commission at no extra cost to you.',
  };
  return `<!-- Prozis · código ${PROZIS_CUPON} · afiliado -->
    <aside class="prozis-offer" aria-label="${t.aria}">
      <div class="pz-main">
        <p class="pz-kicker">${t.kicker}</p>
        <p class="pz-title">${t.title}</p>
        <p class="pz-desc">${t.desc}</p>
        <div class="pz-code">
          <span class="pz-code-value">
            <span class="pz-code-label">${t.label}</span>
            <code>${PROZIS_CUPON}</code>
          </span>
          <button class="pz-copy-btn" type="button" data-pz-copy="${PROZIS_CUPON}" aria-label="${t.copyAria}">${t.copy}</button>
        </div>
        <span class="pz-live" role="status" aria-live="polite"></span>
      </div>
      <div class="pz-actions">
        <a class="pz-cta" href="${PROZIS_URL}" target="_blank" rel="nofollow sponsored noopener">${t.cta}</a>
        <p class="pz-note">${t.note}</p>
      </div>
    </aside>`;
};

/** Inserta CSS y script una sola vez por página. */
const ensureAssets = (h) => {
  if (!h.includes('<!-- PROZIS_OFFER_STYLES -->')) h = h.replace('</head>', OFFER_STYLES + '\n</head>');
  if (!h.includes('<!-- PROZIS_COPY_SCRIPT -->')) h = h.replace(/<\/body>/, COPY_SCRIPT + '\n</body>');
  return h;
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
  // CSS + script de copia, una sola vez por página.
  if (boxesInFile > 0) h = ensureAssets(h);

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
