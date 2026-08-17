// Segunda tanda: Barcelona y las genéricas «encontrar gente».
// Aquí sí hay que mover hreflang, porque las páginas van emparejadas ES<->EN
// y no basta con redirigir un idioma. Ensayo por defecto; --apply escribe.
const fs = require('fs');
const path = require('path');
const APLICAR = process.argv.includes('--apply');
const BASE = 'https://www.correrjuntos.com';
const err = [];

// ── decisiones editoriales de esta tanda ────────────────────────────────────
const REDIRECTS = [
  // Barcelona: "meetups" y "groups" son la misma búsqueda (probado en GSC).
  { source: '/blog/en/running-meetups-barcelona', destination: '/blog/en/running-groups-barcelona', permanent: true },
  // Genéricas EN: tres títulos para la misma intención literal.
  { source: '/blog/en/find-people-to-run-with', destination: '/blog/en/find-running-partners', permanent: true },
  { source: '/blog/en/find-running-partners-near-you', destination: '/blog/en/find-running-partners', permanent: true },
  // Genérica ES equivalente (keeper: más clics y mejor posición, riqueza pareja).
  { source: '/blog/encontrar-companeros-running-cerca', destination: '/blog/encontrar-gente-para-correr', permanent: true },
];

// Parejas ES<->EN que quedan tras la consolidación. Se escriben en el HTML y
// luego el sitemap se re-sincroniza desde el HTML, para que no se separen.
// Barcelona: el par temático del keeper EN es quedadas-correr-barcelona, NO
// /cities/barcelona (que es marketplace, otra naturaleza). Esto corrige el
// apaño del PR #73, que se limitó a seguir el redirect.
const PAREJAS = [
  { es: '/blog/quedadas-correr-barcelona', en: '/blog/en/running-groups-barcelona' },
  { es: '/blog/encontrar-gente-para-correr', en: '/blog/en/find-running-partners' },
];

// ── 1. redirects ────────────────────────────────────────────────────────────
const vj = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const yaHay = new Set(vj.redirects.map((r) => r.source));
console.log('== redirects ==');
for (const r of REDIRECTS) {
  if (yaHay.has(r.source)) { err.push(`ya existe: ${r.source}`); continue; }
  if (yaHay.has(r.destination)) { err.push(`cadena: ${r.destination} ya redirige`); continue; }
  if (!fs.existsSync('.' + r.destination + '.html')) { err.push(`destino inexistente: ${r.destination}`); continue; }
  vj.redirects.push(r);
  console.log(`  + ${r.source}  ->  ${r.destination}`);
}
console.log(`  total: ${vj.redirects.length}`);
if (APLICAR) fs.writeFileSync('vercel.json', JSON.stringify(vj, null, 2) + '\n');

// ── 2. hreflang de las parejas supervivientes ──────────────────────────────
console.log('\n== hreflang de las parejas ==');
function fijarPareja(es, en) {
  for (const [fichero, propio] of [[('.' + es + '.html'), es], [('.' + en + '.html'), en]]) {
    if (!fs.existsSync(fichero)) { err.push(`no existe ${fichero}`); continue; }
    let h = fs.readFileSync(fichero, 'utf8');
    const orig = h;
    h = h.replace(/<link rel="alternate" hreflang="([a-z-]+)" href="[^"]+"/g, (m, lang) => {
      const destino = lang === 'en' ? en : es; // es y x-default -> versión ES
      return `<link rel="alternate" hreflang="${lang}" href="${BASE}${destino}"`;
    });
    if (h !== orig) { console.log(`  ${fichero.replace('./', '')}: pareja fijada`); if (APLICAR) fs.writeFileSync(fichero, h); }
    else console.log(`  ${fichero.replace('./', '')}: ya correcta`);
  }
}
for (const p of PAREJAS) fijarPareja(p.es, p.en);

// ── 3. sitemaps: quitar las redirigidas y re-sincronizar los keepers ───────
console.log('\n== sitemaps ==');
function alternatesDe(rutaHtml) {
  const h = fs.readFileSync(rutaHtml, 'utf8');
  return (h.match(/<link rel="alternate" hreflang="[a-z-]+" href="[^"]+"/g) || []).map((m) => {
    const lang = m.match(/hreflang="([a-z-]+)"/)[1];
    const href = m.match(/href="([^"]+)"/)[1];
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;
  });
}
for (const mapa of ['sitemap-blog-es.xml', 'sitemap-blog-en.xml']) {
  let t = fs.readFileSync(mapa, 'utf8');
  const antes = (t.match(/<url>/g) || []).length;
  for (const r of REDIRECTS) {
    const re = new RegExp(`\\s*<url>\\s*<loc>${(BASE + r.source).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>`, 'g');
    if (re.test(t)) { t = t.replace(re, ''); console.log(`  ${mapa} − ${r.source}`); }
  }
  // re-sincronizar los hreflang de los keepers desde su HTML
  for (const p of PAREJAS) for (const u of [p.es, p.en]) {
    const re = new RegExp(`(<url>\\s*<loc>${(BASE + u).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*<lastmod>[^<]*</lastmod>)[\\s\\S]*?(</url>)`);
    if (re.test(t)) {
      t = t.replace(re, (m, cab, fin) => cab + '\n' + alternatesDe('.' + u + '.html').join('\n') + '\n  ' + fin);
      console.log(`  ${mapa} ~ ${u} (hreflang re-sincronizado)`);
    }
  }
  const despues = (t.match(/<url>/g) || []).length;
  if ((t.match(/<url>/g) || []).length !== (t.match(/<\/url>/g) || []).length) err.push(`${mapa} desbalanceado`);
  console.log(`  ${mapa}: ${antes} -> ${despues}`);
  if (APLICAR) fs.writeFileSync(mapa, t);
}

// ── 4. enlaces internos ─────────────────────────────────────────────────────
console.log('\n== enlaces internos ==');
let nF = 0, nE = 0;
(function recorrer(d) {
  for (const it of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', 'tmp', 'correr-juntos-app', '.claude', '.github'].includes(it.name)) continue;
    const p = path.join(d, it.name);
    if (it.isDirectory()) recorrer(p);
    else if (/\.html$/i.test(it.name)) {
      let h = fs.readFileSync(p, 'utf8'), orig = h;
      for (const r of REDIRECTS) {
        // href exactos; los hreflang ya se fijaron arriba y no se tocan aquí
        h = h.replace(new RegExp(`(href=")(${BASE})?${r.source}(")`, 'g'), (m, a, dom, c) => {
          if (m.includes('alternate')) return m;
          nE++; return a + (dom || '') + r.destination + c;
        });
      }
      if (h !== orig) { nF++; if (APLICAR) fs.writeFileSync(p, h); }
    }
  }
})('.');
console.log(`  ${nE} enlaces en ${nF} ficheros`);

console.log('\n' + (APLICAR ? '[APLICADO]' : '[ENSAYO]'));
if (err.length) { console.log('AVISOS:'); err.forEach((e) => console.log('  ! ' + e)); }
process.exitCode = err.length ? 1 : 0;
