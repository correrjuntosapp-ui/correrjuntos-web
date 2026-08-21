#!/usr/bin/env node
/**
 * QA predeploy del vertical de ciclismo.
 * Comprueba que hub, archivos, sitemap y servidor cuentan exactamente el mismo inventario,
 * y valida on-page básico (canonical, H1 único, metas, OG, schema, breadcrumbs, robots).
 *
 * Uso:  node tools/validate-ciclismo.cjs [--base http://localhost:3400] [--no-http]
 * Exit code 1 si hay errores.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 ? args[baseIdx + 1] : 'http://localhost:3400';
const DO_HTTP = !args.includes('--no-http');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'blog', 'ciclismo');
const CANON = 'https://www.correrjuntos.com';

const errors = [];
const warns = [];
const err = (m) => { errors.push(m); console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);
const warn = (m) => { warns.push(m); console.log('  ⚠ ' + m); };

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// URL canónica (sin .html, index → directorio) de un archivo
function urlOf(file) {
  let rel = path.relative(ROOT, file).replace(/\\/g, '/');
  rel = rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return '/' + rel;
}

function fetchUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 0, body: '', error: e.message }));
    req.setTimeout(10000, () => { req.destroy(); resolve({ status: 0, body: '', error: 'timeout' }); });
  });
}

(async () => {
  console.log('== QA vertical ciclismo ==\n');

  // 1. Inventario de archivos
  const files = walk(DIR);
  const fileUrls = new Set(files.map(urlOf));
  console.log('[1] Archivos HTML: ' + files.length);
  fileUrls.forEach((u) => console.log('    ' + u));

  // 2. Sitemap
  console.log('\n[2] Sitemap');
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap-blog-es.xml'), 'utf8');
  const smUrls = new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1].replace(CANON, ''))
      .filter((u) => u.startsWith('/blog/ciclismo'))
  );
  for (const u of fileUrls) {
    if (!smUrls.has(u)) err(`Archivo sin entrada en sitemap: ${u}`);
  }
  for (const u of smUrls) {
    if (!fileUrls.has(u)) err(`Sitemap apunta a URL sin archivo: ${u}`);
  }
  if (errors.length === 0) ok(`Sitemap ↔ archivos: ${smUrls.size} URLs coinciden`);

  // 3. Hub enlaza solo a páginas existentes, y todas las páginas son alcanzables desde el hub
  console.log('\n[3] Enlaces del hub');
  const hub = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const hubLinks = new Set(
    [...hub.matchAll(/href="(\/blog\/ciclismo[^"#?]*)"/g)]
      .map((m) => m[1].replace(/\/$/, ''))
      .filter((l) => !/\.(css|js|webp|jpg|png|svg|xml)$/.test(l))
  );
  for (const l of hubLinks) {
    if (!fileUrls.has(l)) err(`Hub enlaza a página inexistente: ${l}`);
  }
  for (const u of fileUrls) {
    if (u === '/blog/ciclismo') continue;
    if (!hubLinks.has(u)) warn(`Página no enlazada desde el hub: ${u}`);
  }
  ok(`Hub enlaza ${hubLinks.size} URLs internas del cluster`);

  // 4. On-page por archivo
  console.log('\n[4] On-page');
  for (const file of files) {
    const u = urlOf(file);
    const h = fs.readFileSync(file, 'utf8');
    const canonical = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (!canonical) err(`${u}: sin canonical`);
    else if (canonical !== CANON + u) err(`${u}: canonical no coincide (${canonical})`);
    const h1s = h.match(/<h1[\s>]/g) || [];
    if (h1s.length !== 1) err(`${u}: ${h1s.length} etiquetas H1 (debe ser 1)`);
    if (!/<meta name="description" content="[^"]{40,}"/.test(h)) err(`${u}: meta description ausente o demasiado corta`);
    if (!/<meta property="og:title"/.test(h)) err(`${u}: falta og:title`);
    if (!/<meta property="og:image"/.test(h)) err(`${u}: falta og:image`);
    if (!/<meta name="twitter:card"/.test(h)) err(`${u}: falta twitter:card`);
    if (/<meta name="robots"[^>]*noindex/.test(h)) warn(`${u}: marcada noindex`);
    if (!/BreadcrumbList/.test(h)) err(`${u}: sin schema BreadcrumbList`);
    if (!/hreflang="es"/.test(h)) err(`${u}: sin hreflang es`);
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]); } catch (e) { err(`${u}: JSON-LD inválido (${e.message.slice(0, 60)})`); }
    }
    // Afiliados: tag presente en todo /dp/
    for (const m of h.matchAll(/amazon\.es\/dp\/[A-Z0-9]{10}(\?[^"']*)?/g)) {
      if (!(m[1] || '').includes('diezmejores21-21')) { err(`${u}: enlace /dp/ sin tag de afiliado`); break; }
    }
    // Disclosure antes del primer enlace comercial del cuerpo
    const bodyStart = h.indexOf('<body');
    const firstDp = h.indexOf('amazon.es/dp/', bodyStart);
    if (firstDp > -1) {
      const note = h.indexOf('affiliate-note', bodyStart);
      if (note === -1 || note > firstDp) err(`${u}: aviso de afiliación ausente o posterior al primer enlace comercial`);
    }
    // Assets locales referenciados existen
    for (const m of h.matchAll(/(?:src|href)="\/public\/([^"]+\.(?:webp|jpg|png|svg))"/g)) {
      if (!fs.existsSync(path.join(ROOT, 'public', m[1]))) err(`${u}: asset inexistente /public/${m[1]}`);
    }
  }
  ok('On-page revisado en ' + files.length + ' páginas');

  // 5. Enlaces internos fuera del cluster → deben existir como archivo
  console.log('\n[5] Enlaces internos al resto del blog');
  const seen = new Set();
  for (const file of files) {
    const h = fs.readFileSync(file, 'utf8');
    for (const m of h.matchAll(/href="(\/blog\/(?!ciclismo)[a-z0-9-]+)"/g)) {
      const l = m[1];
      if (seen.has(l)) continue;
      seen.add(l);
      const target = path.join(ROOT, l.slice(1) + '.html');
      const targetDir = path.join(ROOT, l.slice(1), 'index.html');
      if (!fs.existsSync(target) && !fs.existsSync(targetDir)) err(`Enlace interno roto: ${l} (desde ${urlOf(file)})`);
    }
  }
  ok(`${seen.size} destinos internos comprobados`);

  // 6. HTTP 200 contra el servidor
  if (DO_HTTP) {
    console.log('\n[6] HTTP contra ' + BASE);
    for (const u of [...fileUrls].sort()) {
      const r = await fetchUrl(BASE + u);
      if (r.status !== 200) err(`${u} → HTTP ${r.status}${r.error ? ' (' + r.error + ')' : ''}`);
    }
    ok('Respuestas HTTP comprobadas');
  } else {
    console.log('\n[6] HTTP omitido (--no-http)');
  }

  console.log(`\n== Resultado: ${errors.length} errores, ${warns.length} avisos ==`);
  process.exit(errors.length ? 1 : 0);
})();
