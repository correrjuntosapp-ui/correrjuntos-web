// [11 jun 2026] Recuento de títulos con longitud RENDERIZADA (entidades
// decodificadas) — el audit anterior contaba &eacute; como 8 chars.
const fs = require('fs');
const path = require('path');

const ENT = { aacute:'á', eacute:'é', iacute:'í', oacute:'ó', uacute:'ú', ntilde:'ñ', Aacute:'Á', Eacute:'É', Iacute:'Í', Oacute:'Ó', Uacute:'Ú', Ntilde:'Ñ', iquest:'¿', iexcl:'¡', amp:'&', quot:'"', uuml:'ü', middot:'·', rarr:'→', mdash:'—', ndash:'–' };
const decode = s => s.replace(/&(\w+);/g, (m, e) => ENT[e] ?? m).replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n));

const out = [];
for (const dir of ['blog', 'blog/en']) {
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html') && x !== 'index.html')) {
    const h = fs.readFileSync(path.join(dir, f), 'utf8');
    const raw = (h.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const clean = decode(raw.replace(/\s*\|\s*CorrerJuntos.*$/i, ''));
    if (clean.length > 65) out.push({ f: `${dir}/${f}`, len: clean.length, t: clean });
  }
}
out.sort((a, b) => b.len - a.len);
console.log('TITULOS REALMENTE >65 (renderizados):', out.length);
out.forEach(x => console.log(`  ${x.len}  ${x.f}\n      "${x.t}"`));
