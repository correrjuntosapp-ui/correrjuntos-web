#!/usr/bin/env node
/**
 * fetch-product-images.cjs
 * Descarga las fotos hiRes de productos Amazon de un batch JSON y las
 * self-hostea, siguiendo el playbook del CLAUDE.md (sección 12):
 *   - Página /dp/{ASIN} con UA Safari + Accept-Language es
 *   - Extraer "hiRes" (fallback "large"); NUNCA inventar URLs de CDN
 *   - Verificar tamaño >10KB (placeholders silenciosos miden ~43 bytes)
 *   - Delay entre peticiones para no disparar el rate-limit
 *
 * Pensado para ejecutarse en GitHub Actions (el sandbox de agentes no
 * tiene salida a Amazon). La verificación VISUAL de cada imagen sigue
 * siendo obligatoria antes de usarlas en cards/heroes.
 *
 * Uso: node tools/fetch-product-images.cjs tools/product-image-batches/batch-X.json
 * Batch: [{ "asin": "B0FQCHZD7T", "dest": "public/blog-images/ciclismo/productos" }, ...]
 */
const fs = require('fs');
const path = require('path');

const UAS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
];
// La pagina desktop y la movil (/gp/aw/d/) responden a bloqueos distintos.
const ENDPOINTS = ['https://www.amazon.es/dp/', 'https://www.amazon.es/gp/aw/d/'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, ua) {
  const res = await fetch(url, {
    headers: { 'User-Agent': ua, 'Accept-Language': 'es-ES,es;q=0.9', Accept: 'text/html' },
    redirect: 'follow',
  });
  return { status: res.status, body: await res.text() };
}

async function fetchImage(url, ua) {
  const res = await fetch(url, { headers: { 'User-Agent': ua }, redirect: 'follow' });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

function extractImageUrl(html) {
  // hiRes primero (playbook); si no, large. Solo URLs presentes en la página.
  const hi = html.match(/"hiRes":"(https:[^"]+)"/);
  if (hi) return hi[1];
  const lg = html.match(/"large":"(https:[^"]+)"/);
  if (lg) return lg[1];
  return null;
}

(async () => {
  const batchPath = process.argv[2];
  if (!batchPath) { console.error('Falta el batch JSON'); process.exit(1); }
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  const summary = [];

  for (const item of batch) {
    const { asin, dest } = item;
    const out = path.join(dest, asin + '.jpg');
    if (fs.existsSync(out)) { summary.push({ asin, status: 'ya-existia' }); continue; }
    let ok = false, reason = '';
    for (let attempt = 0; attempt < 6 && !ok; attempt++) {
      const ua = UAS[attempt % UAS.length];
      const endpoint = ENDPOINTS[attempt % ENDPOINTS.length];
      try {
        const page = await fetchText(endpoint + asin, ua);
        // La pagina movil legitima es mas corta: umbral menor para /gp/aw/d/
        const minLen = endpoint.includes('/gp/aw/') ? 40000 : 100000;
        if (page.status !== 200 || page.body.length < minLen) {
          reason = 'pagina bloqueada/corta (' + page.status + ', ' + page.body.length + 'B)';
          await sleep(20000 + attempt * 8000); // backoff creciente entre intentos
          continue;
        }
        const imgUrl = extractImageUrl(page.body);
        if (!imgUrl) { reason = 'sin hiRes/large en la pagina'; await sleep(15000); continue; }
        const buf = await fetchImage(imgUrl, ua);
        if (!buf || buf.length < 10240) {
          reason = 'imagen invalida (' + (buf ? buf.length : 0) + 'B <10KB)';
          break;
        }
        fs.mkdirSync(dest, { recursive: true });
        fs.writeFileSync(out, buf);
        summary.push({ asin, status: 'ok', bytes: buf.length, url: imgUrl.substring(0, 90) });
        ok = true;
      } catch (e) {
        reason = e.message;
      }
    }
    if (!ok) summary.push({ asin, status: 'FALLO', reason });
    await sleep(8000 + Math.floor(Math.random() * 5000)); // anti rate-limit
  }

  console.log(JSON.stringify(summary, null, 2));
  const fallos = summary.filter((s) => s.status === 'FALLO').length;
  console.log('Total:', summary.length, '| ok:', summary.filter((s) => s.status === 'ok').length, '| fallos:', fallos);
  // No fallar el job por fallos parciales: lo descargado se commitea igual.
})();
