// Consolidación del clúster «encontrar gente para correr» + higiene de sitemap.
// Ensayo por defecto; escribe solo con --apply.
//
// 1. Declara en sitemap 13 artículos reales que estaban fuera (1.097 clics ya
//    los genera Google sin conocerlos por sitemap).
// 2. Tres redirecciones 301 inequívocas (sinónimo puro / duplicado literal).
// 3. Reapunta los enlaces internos a la página que se queda.
// 4. Saca del sitemap las dos que pasan a redirigir.
// 5. Arregla hreflang de páginas VIVAS que apuntaban a URLs ya redirigidas.
const fs = require('fs');
const path = require('path');
const APLICAR = process.argv.includes('--apply');
const HOY = '2026-08-16';
const BASE = 'https://www.correrjuntos.com';

const err = [];
const hecho = [];

// ── 1+4. Sitemaps ───────────────────────────────────────────────────────────
// Sin `como-organizar-quedadas-running`: pasa a redirigir, debe quedar fuera.
const ADD_ES = ['bastones-trail-running', 'mejores-auriculares-baratos-running',
  'mejores-relojes-gps-baratos-running', 'mejores-zapatillas-running-asfalto',
  'mejores-zapatillas-running-baratas', 'proteinas-para-runners', 'volta-a-peu-valencia-2026'];
const ADD_EN = ['best-running-routes-barcelona', 'best-running-routes-malaga',
  'best-running-routes-sevilla', 'best-running-routes-valencia',
  'start-trail-running', 'trail-vs-road-running'];
const QUITAR = ['/blog/encontrar-runners-malaga', '/blog/en/find-runners-malaga'];

// El hreflang de cada entrada se copia del propio HTML: es la fuente de verdad.
function alternatesDe(fichero) {
  const h = fs.readFileSync(fichero, 'utf8');
  const out = [];
  for (const m of h.match(/<link rel="alternate" hreflang="[a-z-]+" href="[^"]+"/g) || []) {
    const lang = m.match(/hreflang="([a-z-]+)"/)[1];
    const href = m.match(/href="([^"]+)"/)[1];
    out.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`);
  }
  return out;
}

function entrada(url, fichero) {
  const alt = alternatesDe(fichero);
  if (!alt.length) err.push(`sin hreflang en ${fichero} (no lo declaro a ciegas)`);
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${HOY}</lastmod>\n${alt.join('\n')}\n  </url>`;
}

function tocarSitemap(mapa, añadir, prefijo, dirHtml) {
  let t = fs.readFileSync(mapa, 'utf8');
  const antes = (t.match(/<url>/g) || []).length;

  // quitar las que pasan a redirigir
  for (const u of QUITAR) {
    const re = new RegExp(`\\s*<url>\\s*<loc>${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${u}</loc>[\\s\\S]*?</url>`, 'g');
    if (re.test(t)) { t = t.replace(re, ''); hecho.push(`sitemap − ${u}`); }
  }

  // añadir las huérfanas, insertando en orden alfabético por <loc>
  for (const slug of añadir) {
    const url = `${BASE}${prefijo}${slug}`;
    if (t.includes(`<loc>${url}</loc>`)) { err.push(`ya estaba: ${url}`); continue; }
    const fichero = path.join(dirHtml, slug + '.html');
    if (!fs.existsSync(fichero)) { err.push(`no existe ${fichero}`); continue; }
    const bloque = entrada(url, fichero);
    // localizar el primer <url> cuyo loc sea alfabéticamente posterior
    const locs = [...t.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)];
    const post = locs.find((m) => m[1] > url);
    if (post) {
      const i = t.lastIndexOf('  <url>', post.index + 7);
      t = t.slice(0, i) + bloque + '\n' + t.slice(i);
    } else {
      t = t.replace('</urlset>', bloque + '\n</urlset>');
    }
    hecho.push(`sitemap + ${url}`);
  }

  const despues = (t.match(/<url>/g) || []).length;
  if ((t.match(/<url>/g) || []).length !== (t.match(/<\/url>/g) || []).length) err.push(`${mapa}: <url> desbalanceado`);
  console.log(`  ${mapa}: ${antes} -> ${despues} entradas`);
  if (APLICAR) fs.writeFileSync(mapa, t);
}

console.log('== sitemaps ==');
tocarSitemap('sitemap-blog-es.xml', ADD_ES, '/blog/', 'blog');
tocarSitemap('sitemap-blog-en.xml', ADD_EN, '/blog/en/', 'blog/en');

// ── 2. Redirecciones ────────────────────────────────────────────────────────
const REDIRECTS = [
  // sinónimo puro, probado con el cruce consulta->página en GSC
  { source: '/blog/encontrar-runners-malaga', destination: '/blog/grupos-running-malaga', permanent: true },
  { source: '/blog/en/find-runners-malaga', destination: '/blog/en/running-groups-malaga', permanent: true },
  // duplicado literal: el mismo artículo con el slug invertido
  { source: '/blog/como-organizar-quedadas-running', destination: '/blog/quedadas-running-como-organizar', permanent: true },
];
console.log('\n== redirects ==');
const vj = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const yaHay = new Set(vj.redirects.map((r) => r.source));
for (const r of REDIRECTS) {
  if (yaHay.has(r.source)) { err.push(`redirect duplicado: ${r.source}`); continue; }
  // un destino que a su vez redirige encadenaría saltos
  if (yaHay.has(r.destination)) { err.push(`destino ya redirigido (cadena): ${r.destination}`); continue; }
  if (!fs.existsSync('.' + r.destination + '.html')) { err.push(`destino inexistente: ${r.destination}`); continue; }
  vj.redirects.push(r);
  hecho.push(`301 ${r.source} -> ${r.destination}`);
  console.log(`  + ${r.source}  ->  ${r.destination}`);
}
console.log(`  total redirects: ${vj.redirects.length}`);
if (APLICAR) fs.writeFileSync('vercel.json', JSON.stringify(vj, null, 2) + '\n');

// ── 3. Enlaces internos ─────────────────────────────────────────────────────
console.log('\n== enlaces internos ==');
const MAPA_ENLACES = REDIRECTS.map((r) => [r.source, r.destination]);
let ficherosTocados = 0, enlacesTocados = 0;
(function recorrer(d) {
  for (const it of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', 'tmp', 'correr-juntos-app', '.claude', '.github'].includes(it.name)) continue;
    const p = path.join(d, it.name);
    if (it.isDirectory()) recorrer(p);
    else if (/\.html$/i.test(it.name)) {
      let h = fs.readFileSync(p, 'utf8');
      const orig = h;
      for (const [de, a] of MAPA_ENLACES) {
        // solo el href exacto; no tocar hreflang (se arregla aparte) ni texto
        const re = new RegExp(`(href=")(${BASE})?${de}(")`, 'g');
        h = h.replace(re, (m, p1, dom, p3) => { enlacesTocados++; return p1 + (dom || '') + a + p3; });
      }
      if (h !== orig) { ficherosTocados++; if (APLICAR) fs.writeFileSync(p, h); }
    }
  }
})('.');
console.log(`  ${enlacesTocados} enlaces reapuntados en ${ficherosTocados} ficheros`);

// ── 5. hreflang de páginas vivas que apuntaban a URLs redirigidas ───────────
console.log('\n== hreflang roto (solo páginas vivas) ==');
const redMap = new Map(vj.redirects.map((r) => [r.source, r.destination]));
const ARREGLAR = ['blog/grupos-running-zaragoza.html', 'blog/en/running-groups-barcelona.html', 'blog/en/best-running-shoes.html'];
for (const f of ARREGLAR) {
  if (redMap.has('/' + f.replace(/\.html$/, ''))) { err.push(`${f} está redirigida, no la toco`); continue; }
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;
  h = h.replace(/(<link rel="alternate" hreflang="[a-z-]+" href=")([^"]+)(")/g, (m, a, href, c) => {
    const rel = href.replace(BASE, '').replace(/\/$/, '');
    const dest = redMap.get(rel);
    if (!dest) return m;
    console.log(`  ${f}: ${rel} -> ${dest}`);
    return a + BASE + dest + c;
  });
  if (h !== orig) { hecho.push(`hreflang ${f}`); if (APLICAR) fs.writeFileSync(f, h); }
}

// ── cierre ──────────────────────────────────────────────────────────────────
console.log('\n' + (APLICAR ? '[APLICADO]' : '[ENSAYO]') + ` ${hecho.length} cambios`);
if (err.length) { console.log('\nAVISOS:'); err.forEach((e) => console.log('  ! ' + e)); }
process.exitCode = err.some((e) => /desbalanceado|inexistente|cadena/.test(e)) ? 1 : 0;
