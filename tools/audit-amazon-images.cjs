#!/usr/bin/env node
// ============================================================
// audit-amazon-images.cjs
//
// Escanea todos los articles del blog buscando URLs de imágenes
// Amazon CDN y verifica que cada una:
//   1. Devuelva HTTP 200
//   2. Tenga tamaño > 5KB (detecta placeholders silenciosos
//      de Amazon que devuelven 200 OK pero solo 43 bytes)
//
// Por qué importa: Amazon rota URLs de imágenes cuando el seller
// actualiza la galería del producto. Las URLs viejas devuelven
// 404 silenciosamente o un placeholder vacío. Sentry no se entera
// (recurso externo) → bug invisible que daña conversión y SEO.
//
// Uso:
//   node tools/audit-amazon-images.cjs
//   node tools/audit-amazon-images.cjs --json    (output JSON)
//   node tools/audit-amazon-images.cjs --quiet   (solo broken)
//   node tools/audit-amazon-images.cjs blog/specific-article.html
//
// Exit codes:
//   0 → todas las imágenes OK
//   1 → al menos una rota
//   2 → error ejecutando script
// ============================================================

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Config ──────────────────────────────────────────────
const PLACEHOLDER_THRESHOLD = 5000; // bytes — bajo esto se considera placeholder
const CONCURRENCY = 10; // requests paralelos máx
const TIMEOUT_MS = 8000;
const BLOG_DIR = 'blog';
const URL_REGEX = /https:\/\/m\.media-amazon\.com\/images\/[A-Za-z0-9._/+-]+\.(?:jpg|jpeg|png)/g;

// ─── Args parsing ────────────────────────────────────────
const args = process.argv.slice(2);
const opts = {
  json: args.includes('--json'),
  quiet: args.includes('--quiet'),
  files: args.filter((a) => !a.startsWith('--'))
};

// ─── Helpers ─────────────────────────────────────────────

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.html')) files.push(p);
  }
  return files;
}

// HEAD + size check — devuelve { url, status, size, ok, reason }
function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: TIMEOUT_MS }, (res) => {
      const status = res.statusCode;

      if (status !== 200) {
        // No-200 → consume + skip
        res.resume();
        return resolve({ url, status, size: 0, ok: false, reason: `HTTP ${status}` });
      }

      // 200 → leer hasta PLACEHOLDER_THRESHOLD bytes para detectar placeholder
      let received = 0;
      const chunks = [];
      res.on('data', (chunk) => {
        received += chunk.length;
        chunks.push(chunk);
        if (received > PLACEHOLDER_THRESHOLD * 2) {
          // Suficiente para confirmar que NO es placeholder, abort
          req.destroy();
          resolve({ url, status: 200, size: received, ok: true, reason: 'ok' });
        }
      });
      res.on('end', () => {
        const finalSize = received;
        const isPlaceholder = finalSize < PLACEHOLDER_THRESHOLD;
        resolve({
          url,
          status: 200,
          size: finalSize,
          ok: !isPlaceholder,
          reason: isPlaceholder ? `placeholder ${finalSize}B (<${PLACEHOLDER_THRESHOLD}B)` : 'ok'
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 0, size: 0, ok: false, reason: 'timeout' });
    });
    req.on('error', (e) => {
      resolve({ url, status: 0, size: 0, ok: false, reason: `err: ${e.message}` });
    });
  });
}

// Pool de requests con concurrencia limitada
async function pool(items, limit, fn) {
  const results = [];
  let idx = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  const targetFiles = opts.files.length > 0 ? opts.files : walk(BLOG_DIR);

  if (!opts.quiet && !opts.json) {
    console.log(`🔍 Auditando imágenes Amazon en ${targetFiles.length} articles...\n`);
  }

  // Construir mapa URL → [archivos donde aparece]
  const urlToFiles = new Map();
  for (const f of targetFiles) {
    const txt = fs.readFileSync(f, 'utf8');
    const matches = txt.match(URL_REGEX);
    if (!matches) continue;
    for (const url of new Set(matches)) {
      if (!urlToFiles.has(url)) urlToFiles.set(url, []);
      urlToFiles.get(url).push(f);
    }
  }

  const allUrls = [...urlToFiles.keys()];
  if (!opts.quiet && !opts.json) {
    console.log(`   ${allUrls.length} URLs únicas. Verificando ${CONCURRENCY} en paralelo...`);
  }

  // Verificar
  const results = await pool(allUrls, CONCURRENCY, checkUrl);
  const broken = results.filter((r) => !r.ok);

  // Output
  if (opts.json) {
    console.log(JSON.stringify({
      scanned: allUrls.length,
      ok: results.filter((r) => r.ok).length,
      broken: broken.length,
      brokenList: broken.map((r) => ({
        url: r.url,
        reason: r.reason,
        files: urlToFiles.get(r.url)
      }))
    }, null, 2));
  } else {
    if (broken.length === 0) {
      console.log(`\n✅ Todas las imágenes OK (${allUrls.length}/${allUrls.length})`);
    } else {
      console.log(`\n❌ ${broken.length} de ${allUrls.length} imágenes rotas:\n`);
      for (const r of broken) {
        const files = urlToFiles.get(r.url);
        const short = r.url.match(/(I|P)\/[A-Za-z0-9.+-]+\.(?:jpg|jpeg|png)/);
        console.log(`  ${r.reason.padEnd(30)} ${short ? short[0] : r.url}`);
        for (const f of files) console.log(`    ↳ ${f}`);
      }
      console.log('');
      console.log('Tip: para auto-arreglar, scrape Amazon page del ASIN y usa hiRes URL.');
    }
  }

  process.exit(broken.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(2);
});
