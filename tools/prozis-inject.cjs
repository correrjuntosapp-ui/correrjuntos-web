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
const PROZIS_URL = ''; // link de afiliado que mande Luís (con nuestro tracking)
const PROZIS_CUPON = 'CORRERJUNTOS'; // confirmar que es el definitivo
// ═════════════════════════════════════════════════

const DRY = process.argv.includes('--dry');

if (!DRY && !PROZIS_URL) {
  console.error('Falta PROZIS_URL — rellena la constante con el link del alta antes de ejecutar sin --dry.');
  process.exit(1);
}

const box = (lang) => {
  const es = lang !== 'en';
  return `<!-- Prozis · código ${PROZIS_CUPON} · afiliado -->
    <div style="margin:36px 0 24px 0;padding:28px;background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:2px solid #f97316;border-radius:18px;box-shadow:0 12px 32px rgba(249,115,22,0.18)">
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <div style="flex:1;min-width:240px">
          <div style="font-family:'JetBrains Mono','SFMono-Regular',monospace;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#ea580c;font-weight:700;margin-bottom:8px">
            <span style="display:inline-block;width:8px;height:8px;background:#f97316;border-radius:999px;vertical-align:middle;margin-right:8px"></span>Prozis &middot; ${es ? '10% de descuento exclusivo' : 'Exclusive 10% off'}
          </div>
          <div style="font-size:1.85rem;font-weight:800;color:#0b1220;letter-spacing:.02em;font-family:'JetBrains Mono','SFMono-Regular',monospace;line-height:1">${PROZIS_CUPON}</div>
          <div style="font-size:.92rem;color:#475569;margin-top:10px;line-height:1.5">${es
            ? 'Nutrici&oacute;n deportiva que usamos y probamos. Aplica el c&oacute;digo al pagar en <strong style="color:#0b1220">prozis.com</strong>.'
            : 'Sports nutrition we use and test. Apply the code at checkout on <strong style="color:#0b1220">prozis.com</strong>.'}</div>
        </div>
        <a href="${PROZIS_URL}" target="_blank" rel="nofollow sponsored noopener" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:16px 28px;border-radius:12px;font-weight:700;text-decoration:none;font-size:1rem;letter-spacing:.02em;box-shadow:0 10px 24px rgba(249,115,22,.35)">${es ? 'Comprar en Prozis' : 'Shop Prozis'} &rarr;</a>
      </div>
    </div>`;
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

const files = [...walk('blog'), ...walk('carreras')];
let crownSwapped = 0, slotsFilled = 0;

for (const fp of files) {
  let h = fs.readFileSync(fp, 'utf8');
  const lang = fp.includes(path.join('blog', 'en')) ? 'en' : 'es';
  let touched = false;

  // A) Caja Crown completa: del comentario que la precede hasta su </div> de cierre.
  //    Patrón: comentario "Crown Sport Nutrition" + div contenedor (2 niveles).
  const crownRe = /\s*<!-- Crown Sport Nutrition[^>]*-->\s*<div style="margin:36px[\s\S]*?<\/div>\s*<\/div>/g;
  if (crownRe.test(h)) {
    const n = (h.match(crownRe) || []).length;
    if (!DRY) h = h.replace(crownRe, '\n\n    ' + box(lang) + '\n');
    crownSwapped += n;
    touched = true;
    console.log(`${DRY ? '[dry] ' : ''}${fp}: ${n} caja(s) Crown -> Prozis`);
  }

  // B) Slots — tope de 2 cajas Prozis por artículo (contando la sustitución
  //    de Crown). Los slots que sobren se eliminan sin dejar rastro.
  const slotRe = /<!-- PROZIS_SLOT: [a-z]+ -->/g;
  const slots = h.match(slotRe) || [];
  if (slots.length) {
    const boxesSoFar = (h.includes('crownsportnutrition') || h.includes(`código ${PROZIS_CUPON}`)) ? 1 : 0;
    let budget = Math.max(0, 2 - boxesSoFar);
    let filled = 0, removed = 0;
    if (!DRY) {
      h = h.replace(slotRe, () => {
        if (filled < budget) { filled++; return box(lang); }
        removed++; return '';
      });
    } else {
      filled = Math.min(slots.length, budget);
      removed = slots.length - filled;
    }
    slotsFilled += filled;
    touched = true;
    console.log(`${DRY ? '[dry] ' : ''}${fp}: ${filled} slot(s) rellenado(s)${removed ? `, ${removed} sobrante(s) eliminado(s)` : ''}`);
  }

  if (touched && !DRY) fs.writeFileSync(fp, h);
}

console.log(`\n${DRY ? '[DRY RUN] ' : ''}Total: ${crownSwapped} cajas Crown sustituidas, ${slotsFilled} slots rellenados.`);
if (!DRY) console.log('Siguiente: revisar 1-2 en local, commit, push, IndexNow ping de los URLs tocados.');
