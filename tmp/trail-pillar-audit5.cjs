#!/usr/bin/env node
/**
 * Audit 5/9 — fixes solicitados por founder 18 may 2026
 *
 * 1. 🔴 Header con botón "Descarga app" persistente
 * 2. 🟡 Badge "Quedan X semanas" clickable → app con carrera preseleccionada
 * 3. 🟡 Social proof "+316 runners" en CTA superior
 * 4. 🟡 Tabla comparativa: anchor links visibles (hover + chevron)
 * 5. 🔵 Botones compartir WhatsApp/X/Telegram/copy link
 */

const fs = require('fs');

function apply(filePath, lang) {
  let html = fs.readFileSync(filePath, 'utf8');
  const es = lang === 'es';

  // ── 1. HEADER · botón naranja "📱 App" persistente ──
  // Insertar como el primer link de nav-links (más visible que al final)
  const headerOld = es
    ? '<div class="nav-links">\n      <a href="/">Inicio</a>'
    : '<div class="nav-links">\n      <a href="/en/">Home</a>';
  const headerNew = es
    ? `<div class="nav-links">
      <a href="/?utm_source=blog&utm_medium=trails-pillar-header&utm_campaign=trails-junio" style="background:#f97316;color:#fff;border-color:#f97316;font-weight:800">📱 Descarga la app</a>
      <a href="/">Inicio</a>`
    : `<div class="nav-links">
      <a href="/?utm_source=blog&utm_medium=trails-pillar-header&utm_campaign=trails-junio-en" style="background:#f97316;color:#fff;border-color:#f97316;font-weight:800">📱 Download app</a>
      <a href="/en/">Home</a>`;
  html = html.replace(headerOld, headerNew);

  // ── 2. Badge clickable + tipografía punzante ──
  const oldJs = es
    ? `    banner.style.cssText = 'background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.22);border-radius:10px;padding:8px 12px;margin:-6px 0 14px;font-size:.85rem;color:#ea580c;font-weight:700;display:flex;align-items:center;gap:8px';
    banner.innerHTML = '⏱️ Quedan <strong style="font-size:1rem">' + diffWeeks + ' semanas</strong> · ¿tienes plan?';
    body.insertBefore(banner, body.firstChild);`
    : `    banner.style.cssText = 'background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.22);border-radius:10px;padding:8px 12px;margin:-6px 0 14px;font-size:.85rem;color:#ea580c;font-weight:700;display:flex;align-items:center;gap:8px';
    banner.innerHTML = '⏱️ <strong style="font-size:1rem">' + diffWeeks + ' weeks</strong> left · do you have a plan?';
    body.insertBefore(banner, body.firstChild);`;

  const newJs = es
    ? `    const a = document.createElement('a');
    a.href = '/?utm_source=blog&utm_medium=trails-pillar-weeks&utm_campaign=trails-junio&race=' + card.id;
    a.style.cssText = 'background:linear-gradient(135deg,rgba(249,115,22,.12),rgba(249,115,22,.06));border:1px solid rgba(249,115,22,.35);border-radius:10px;padding:10px 14px;margin:-6px 0 14px;font-size:.88rem;color:#ea580c;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;text-decoration:none;transition:transform .15s,box-shadow .2s;cursor:pointer';
    a.onmouseover = function(){this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 16px rgba(249,115,22,.18)'};
    a.onmouseout = function(){this.style.transform='';this.style.boxShadow=''};
    a.innerHTML = '<span>⏱️ Quedan <strong style="font-size:1rem">' + diffWeeks + ' semanas</strong> · Crea tu plan</span><span style="font-size:1.1rem">→</span>';
    body.insertBefore(a, body.firstChild);`
    : `    const a = document.createElement('a');
    a.href = '/?utm_source=blog&utm_medium=trails-pillar-weeks&utm_campaign=trails-junio-en&race=' + card.id;
    a.style.cssText = 'background:linear-gradient(135deg,rgba(249,115,22,.12),rgba(249,115,22,.06));border:1px solid rgba(249,115,22,.35);border-radius:10px;padding:10px 14px;margin:-6px 0 14px;font-size:.88rem;color:#ea580c;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;text-decoration:none;transition:transform .15s,box-shadow .2s;cursor:pointer';
    a.onmouseover = function(){this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 16px rgba(249,115,22,.18)'};
    a.onmouseout = function(){this.style.transform='';this.style.boxShadow=''};
    a.innerHTML = '<span>⏱️ <strong style="font-size:1rem">' + diffWeeks + ' weeks</strong> left · Create your plan</span><span style="font-size:1.1rem">→</span>';
    body.insertBefore(a, body.firstChild);`;

  html = html.replace(oldJs, newJs);

  // ── 3. CTA superior · añadir social proof "+316 runners" ──
  const oldEyebrow = es
    ? '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.18em;color:#f97316;text-transform:uppercase;margin-bottom:6px">📱 App CorrerJuntos</div>'
    : '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.18em;color:#f97316;text-transform:uppercase;margin-bottom:6px">📱 CorrerJuntos App</div>';
  const newEyebrow = es
    ? `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.18em;color:#f97316;text-transform:uppercase;margin-bottom:6px">🏃 +316 runners ya en España · App gratis</div>`
    : `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.18em;color:#f97316;text-transform:uppercase;margin-bottom:6px">🏃 +316 runners in Spain · Free app</div>`;
  html = html.replace(oldEyebrow, newEyebrow);

  // ── 4. Tabla comparativa · anchor links con underline + chevron ──
  // Reemplazar el style text-decoration:none por dotted underline + añadir chevron tras nombre
  const tableLinkRegex = /<a href="#([a-z-]+)" style="color:#3d3229;font-weight:700;text-decoration:none">([^<]+)<\/a>/g;
  html = html.replace(tableLinkRegex, (match, id, name) =>
    `<a href="#${id}" style="color:#3d3229;font-weight:700;text-decoration:underline dotted rgba(249,115,22,.5);text-underline-offset:3px;display:inline-flex;align-items:center;gap:4px">${name}<span style="color:#f97316;font-size:.8em">↓</span></a>`
  );

  // ── 5. Botones compartir ──
  // Inserto un bloque "Compartir con tu grupo" justo después del banner descarga app top
  // (después del </div> que cierra el banner CTA top, antes del "<!-- ── 1. TRAVESERINA")
  const shareTitle = es ? '¿Conoces a alguien que quiera correr esto?' : 'Know someone running this?';
  const shareSub = es ? 'Compártelo en 1 toque · cada compartición ayuda al blog' : 'Share in 1 tap · each share helps the blog';
  const shareW = es ? 'WhatsApp' : 'WhatsApp';
  const shareX = 'X';
  const shareT = es ? 'Telegram' : 'Telegram';
  const shareCp = es ? 'Copiar link' : 'Copy link';
  const shareTxt = es
    ? 'Las 7 trails de junio en España con plan adaptativo gratis 👇'
    : 'Top 7 trails for June in Spain with free adaptive plan 👇';

  // Las URLs canónicas
  const canon = es
    ? 'https://www.correrjuntos.com/blog/mejores-trails-junio-2026-espana'
    : 'https://www.correrjuntos.com/blog/en/best-trail-races-june-2026-spain';
  const shareTxtEnc = encodeURIComponent(shareTxt + ' ');
  const canonEnc = encodeURIComponent(canon);

  const shareBlock = `
    <!-- ── COMPARTIR CON EL GRUPO ── -->
    <div style="background:#fff;border:1px solid #efe6db;border-radius:14px;padding:18px 22px;margin:8px 0 28px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between">
      <div style="flex:1;min-width:200px">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.18em;color:#f97316;text-transform:uppercase;margin-bottom:4px">📤 ${es ? 'Compartir' : 'Share'}</div>
        <div style="font-size:1rem;font-weight:800;color:#3d3229;line-height:1.3">${shareTitle}</div>
        <div style="font-size:.85rem;color:#64748b;margin-top:2px">${shareSub}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a href="https://wa.me/?text=${shareTxtEnc}${canonEnc}" target="_blank" rel="noopener" aria-label="${shareW}" style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#fff;padding:9px 14px;border-radius:10px;font-weight:700;text-decoration:none;font-size:.85rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
          ${shareW}
        </a>
        <a href="https://twitter.com/intent/tweet?text=${shareTxtEnc}&url=${canonEnc}" target="_blank" rel="noopener" aria-label="X" style="display:inline-flex;align-items:center;gap:6px;background:#0b1220;color:#fff;padding:9px 14px;border-radius:10px;font-weight:700;text-decoration:none;font-size:.85rem">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          ${shareX}
        </a>
        <a href="https://t.me/share/url?url=${canonEnc}&text=${shareTxtEnc}" target="_blank" rel="noopener" aria-label="${shareT}" style="display:inline-flex;align-items:center;gap:6px;background:#0088cc;color:#fff;padding:9px 14px;border-radius:10px;font-weight:700;text-decoration:none;font-size:.85rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          ${shareT}
        </a>
        <button onclick="navigator.clipboard.writeText('${canon}');this.innerHTML='✓ ${es ? 'Copiado' : 'Copied'}';setTimeout(()=>this.innerHTML=this.dataset.label,1800)" data-label="🔗 ${shareCp}" style="display:inline-flex;align-items:center;gap:6px;background:#f4f1ec;color:#3d3229;padding:9px 14px;border-radius:10px;font-weight:700;border:1px solid #efe6db;font-size:.85rem;font-family:inherit;cursor:pointer">
          🔗 ${shareCp}
        </button>
      </div>
    </div>

`;

  // Insert share block before race-card #1 (Traveserina). Anchor at the "<!-- 1. TRAVESERINA" comment area.
  // Look for the marker BEFORE the first race-card
  const insertMarker = '    <!-- ──────────────────────────────────────────────';
  if (html.indexOf(insertMarker) !== -1) {
    // Replace ONLY first occurrence
    html = html.replace(insertMarker, shareBlock + insertMarker);
  } else {
    console.warn(`  ⚠ share insert marker not found in ${lang.toUpperCase()}`);
  }

  fs.writeFileSync(filePath, html);
  console.log(`✓ ${lang.toUpperCase()} · 5 fixes aplicados`);
}

apply('blog/mejores-trails-junio-2026-espana.html', 'es');
apply('blog/en/best-trail-races-june-2026-spain.html', 'en');

console.log('\n═══════════════════════════════════════');
console.log('5 Audit Fixes aplicados (ES + EN)');
console.log('═══════════════════════════════════════');
console.log('1. ✓ Header app button orange');
console.log('2. ✓ Badge semanas → anchor + UTM race=<id>');
console.log('3. ✓ Top CTA eyebrow: +316 runners social proof');
console.log('4. ✓ Tabla: dotted underline + chevron ↓');
console.log('5. ✓ Bloque Compartir: WhatsApp + X + Telegram + Copy');
