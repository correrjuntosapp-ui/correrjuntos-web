#!/usr/bin/env node
/**
 * download-exercisedb.cjs — Bajar 30 GIFs de ExerciseDB RapidAPI
 *
 * Reemplaza stick figures SVG del catálogo strength por GIFs animados
 * profesionales. Self-host en public/exercises/ para eliminar dependencia
 * del CDN externo (que podría rotar o caer).
 *
 * Uso:
 *   1. Founder se registra en https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 *   2. Free tier: 500 requests/mes (más que suficiente para 30 ejercicios)
 *   3. Añade RAPIDAPI_KEY=xxx en .env (gitignored)
 *   4. node tools/exercises/download-exercisedb.cjs
 *
 * Output:
 *   - public/exercises/{cj-slug}.gif (30 archivos)
 *   - public/exercises/manifest.json (catálogo final con paths + attribution)
 *   - tmp/exercises-thumbnails.html (grid validación visual)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Load .env manually (no dotenv dep) ──
function loadEnv() {
  if (!fs.existsSync('.env')) return;
  const lines = fs.readFileSync('.env', 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const KEY = process.env.RAPIDAPI_KEY;
if (!KEY) {
  console.error('❌ Missing RAPIDAPI_KEY en .env');
  console.error('   Add line: RAPIDAPI_KEY=tu_key_aqui');
  process.exit(1);
}

const HOST = 'exercisedb.p.rapidapi.com';

// ── Mapping CJ slug → ExerciseDB search term + preferences ──
// `prefer.equipment`: si hay variantes, prefiere esta
// `prefer.bodyPart`: filtro adicional si el search devuelve mucho ruido
const EXERCISES = [
  // TREN INFERIOR (7)
  { cj: 'sentadilla', search: 'squat', prefer: { equipment: 'body weight' } },
  { cj: 'zancadas-caminando', search: 'walking lunge', prefer: { equipment: 'body weight' } },
  { cj: 'peso-muerto-unilateral', search: 'single leg deadlift', prefer: {} },
  { cj: 'sentadilla-bulgara', search: 'split squat', prefer: {} },
  { cj: 'step-ups', search: 'step-up', prefer: { equipment: 'body weight' } },
  { cj: 'puente-gluteo', search: 'glute bridge', prefer: { equipment: 'body weight' } },
  { cj: 'calf-raises', search: 'standing calf raise', prefer: {} },
  // CORE (7)
  { cj: 'plancha-frontal', search: 'plank', prefer: { equipment: 'body weight' } },
  { cj: 'plancha-lateral', search: 'side plank', prefer: {} },
  { cj: 'dead-bug', search: 'dead bug', prefer: {} },
  { cj: 'bird-dog', search: 'bird dog', prefer: {} },
  { cj: 'mountain-climbers', search: 'mountain climber', prefer: {} },
  { cj: 'hollow-hold', search: 'hollow hold', prefer: {} },
  { cj: 'russian-twist', search: 'russian twist', prefer: {} },
  // GLÚTEO (5)
  { cj: 'clamshells', search: 'clam', prefer: {} },
  { cj: 'hip-thrust', search: 'hip thrust', prefer: {} },
  { cj: 'monster-walks', search: 'monster walk', prefer: {} },
  { cj: 'donkey-kicks', search: 'donkey kick', prefer: {} },
  { cj: 'single-leg-glute-bridge', search: 'single leg glute bridge', prefer: {} },
  { cj: 'fire-hydrants', search: 'fire hydrant', prefer: {} },
  // MOVILIDAD (5)
  { cj: 'worlds-greatest-stretch', search: 'world greatest stretch', prefer: {} },
  { cj: 'hip-mobility-90-90', search: '90 90 hip', prefer: {} },
  { cj: 'cat-cow', search: 'cat cow', prefer: {} },
  { cj: 'pigeon-pose', search: 'pigeon', prefer: {} },
  { cj: 'hip-flexor-stretch', search: 'hip flexor stretch', prefer: {} },
  { cj: 'calf-stretch', search: 'calf stretch', prefer: {} },
  // TREN SUPERIOR (4)
  { cj: 'push-ups', search: 'push-up', prefer: { equipment: 'body weight' } },
  { cj: 'inverted-row', search: 'inverted row', prefer: {} },
  { cj: 'pike-push-ups', search: 'pike push-up', prefer: {} },
  { cj: 'band-pull-apart', search: 'band pull apart', prefer: {} },
];

const OUT_DIR = path.join('public', 'exercises');
const THUMB_HTML = path.join('tmp', 'exercises-thumbnails.html');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync('tmp', { recursive: true });

// ── HTTPS helper with API key ──
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0', ...headers } }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return downloadFileWithHeaders(url, dest, {});
}

function downloadFileWithHeaders(url, dest, extraHeaders) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0', ...extraHeaders } }, res => {
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
    }).on('error', err => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

// ── Pick best match for a search ──
function pickBestMatch(results, prefer) {
  if (!Array.isArray(results) || results.length === 0) return null;
  // Filter by preferred equipment if specified
  let pool = results;
  if (prefer.equipment) {
    const filtered = pool.filter(r => r.equipment === prefer.equipment);
    if (filtered.length) pool = filtered;
  }
  if (prefer.bodyPart) {
    const filtered = pool.filter(r => r.bodyPart === prefer.bodyPart);
    if (filtered.length) pool = filtered;
  }
  // Return first (ExerciseDB sorts by relevance)
  return pool[0];
}

(async function main() {
  console.log('═══════════════════════════════════════');
  console.log('💪 ExerciseDB → CJ self-host (30 ejercicios)');
  console.log('═══════════════════════════════════════');

  const manifest = [];
  let downloaded = 0;
  let failed = 0;
  const errors = [];

  for (const ex of EXERCISES) {
    process.stdout.write(`\n[${ex.cj}] search "${ex.search}"... `);

    let results;
    try {
      const searchUrl = `https://${HOST}/exercises/name/${encodeURIComponent(ex.search)}`;
      results = await httpGet(searchUrl, {
        'X-RapidAPI-Key': KEY,
        'X-RapidAPI-Host': HOST,
      });
    } catch (e) {
      process.stdout.write(`✗ search failed: ${e.message}\n`);
      failed++;
      errors.push({ cj: ex.cj, error: e.message });
      continue;
    }

    const match = pickBestMatch(results, ex.prefer);
    if (!match) {
      process.stdout.write(`✗ no match\n`);
      failed++;
      errors.push({ cj: ex.cj, error: 'no match in ' + (results?.length || 0) + ' results' });
      continue;
    }

    process.stdout.write(`✓ ${match.id} (${match.name})\n`);

    // Download GIF
    const dest = path.join(OUT_DIR, `${ex.cj}.gif`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      process.stdout.write(`  ⏭ ya existe (${(fs.statSync(dest).size/1024).toFixed(0)} KB)\n`);
    } else {
      // ExerciseDB GIF endpoint: /image?exerciseId={id}&resolution=360
      const gifUrl = `https://${HOST}/image?exerciseId=${match.id}&resolution=360`;
      try {
        const size = await downloadFileWithHeaders(gifUrl, dest, {
          'X-RapidAPI-Key': KEY,
          'X-RapidAPI-Host': HOST,
        });
        process.stdout.write(`  ⇣ ${(size/1024).toFixed(0)} KB\n`);
        downloaded++;
      } catch (e) {
        process.stdout.write(`  ✗ download failed: ${e.message}\n`);
        failed++;
        errors.push({ cj: ex.cj, error: 'download: ' + e.message });
        continue;
      }
    }

    manifest.push({
      cj_slug: ex.cj,
      exercisedb_id: match.id,
      name_en: match.name,
      target: match.target,
      body_part: match.bodyPart,
      equipment: match.equipment,
      gif_path: dest.replace(/\\/g, '/'),
      original_gif_url: `https://${HOST}/image?exerciseId=${match.id}&resolution=360`,
      attribution: 'ExerciseDB via RapidAPI',
    });

    // Sleep 200ms para respetar rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  // ── Save manifest ──
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    source: 'ExerciseDB (RapidAPI)',
    license: 'Free tier · attribution required',
    total: manifest.length,
    exercises: manifest,
    errors,
  }, null, 2));

  // ── Generate thumbnail HTML grid for visual validation ──
  const thumbHtml = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Exercises grid · ${manifest.length} GIFs · ${new Date().toISOString().slice(0,10)}</title>
<style>
  body{font-family:-apple-system,Segoe UI,sans-serif;background:#0b1220;color:#f6f1e8;margin:0;padding:20px}
  h1{font-size:1.4rem;margin:0 0 6px}
  .meta{color:#888;font-size:.85rem;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
  .card{background:#1a2238;border:1px solid #2a3148;border-radius:12px;overflow:hidden}
  .gif{width:100%;aspect-ratio:1;object-fit:contain;background:#fff;display:block}
  .body{padding:10px 12px;font-size:.8rem}
  .tag{font-family:'JetBrains Mono',monospace;font-size:9px;color:#f97316;letter-spacing:.18em;text-transform:uppercase;font-weight:700;margin-bottom:4px}
  .id{font-weight:700;color:#f6f1e8}
  .meta-row{color:#888;margin-top:2px;font-size:.7rem}
  .errors{margin-top:24px;padding:14px;background:#fee2e2;border-radius:8px;color:#991b1b;font-size:.85rem}
</style></head><body>
<h1>💪 ExerciseDB · ${manifest.length}/${EXERCISES.length} GIFs descargados</h1>
<p class="meta">Self-host en public/exercises/ · Atribución: ExerciseDB via RapidAPI · Generated ${new Date().toISOString().slice(0,16)}</p>
<div class="grid">
${manifest.map((m, i) => `
  <div class="card">
    <img class="gif" src="../${m.gif_path}" alt="${m.name_en}" loading="lazy">
    <div class="body">
      <div class="tag">#${i+1} · ${m.cj_slug}</div>
      <div class="id">${m.name_en}</div>
      <div class="meta-row">${m.target} · ${m.equipment}</div>
    </div>
  </div>`).join('')}
</div>
${errors.length ? `<div class="errors"><strong>❌ ${errors.length} fallaron:</strong><ul>${errors.map(e => `<li>${e.cj}: ${e.error}</li>`).join('')}</ul></div>` : ''}
</body></html>`;

  fs.writeFileSync(THUMB_HTML, thumbHtml);

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ DESCARGA COMPLETADA`);
  console.log(`   Descargados:    ${downloaded}`);
  console.log(`   Skipped:        ${manifest.length - downloaded} (already existed)`);
  console.log(`   Failed:         ${failed}`);
  console.log(`   Total manifest: ${manifest.length}/${EXERCISES.length}`);
  console.log(`   Carpeta:        ${OUT_DIR}/`);
  console.log(`   Manifest:       ${manifestPath}`);
  console.log(`   Thumbnail grid: ${THUMB_HTML}`);
  console.log('═══════════════════════════════════════');
  if (failed > 0) {
    console.log('\n⚠ Failures to review:');
    errors.forEach(e => console.log(`  · ${e.cj}: ${e.error}`));
  }
})();
