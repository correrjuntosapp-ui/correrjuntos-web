#!/usr/bin/env node
/**
 * free-db-fetch.cjs — Descarga 30 ejercicios desde free-exercise-db (Public Domain)
 *
 * Esta es la solución FINAL después de probar:
 *   1. ExerciseDB RapidAPI ❌ (muchos barbell forzado)
 *   2. Pexels Videos ❌ (perros literales en bird-dog, monstruos en monster-walks)
 *
 * free-exercise-db:
 *   - 873 ejercicios · GitHub yuhonas/free-exercise-db · Unlicense (Public Domain)
 *   - Cada uno tiene 2 fotos: start position (0.jpg) + end position (1.jpg)
 *   - Atletas reales · NO stick figures · NO con barra forzado
 *
 * Técnica: combinar las 2 fotos en mini-GIF de 2 frames con ffmpeg
 *   → micro-animación loop infinito start↔end (similar Apple Fitness+ previews)
 *   → ~100-200 KB por GIF · 30 total = ~5 MB · perfecto para app móvil
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');
const FFMPEG = require('ffmpeg-static');

const OUT_DIR = path.join('public', 'exercises');
const TMP_DIR = path.join('tmp', 'free-db-frames');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

// Mapeo curado · 30 ejercicios CJ → free-exercise-db IDs
// Los sub-óptimos están marcados con notas para futura mejora
const MAPPING = [
  // ─── Tren inferior (7) ───
  { cj: 'sentadilla', id: 'Bodyweight_Squat', quality: 'perfect' },
  { cj: 'zancadas-caminando', id: 'Bodyweight_Walking_Lunge', quality: 'perfect' },
  { cj: 'peso-muerto-unilateral', id: 'Single_Leg_Glute_Bridge', quality: 'substitute', note: 'no exact single-leg deadlift bodyweight in DB' },
  { cj: 'sentadilla-bulgara', id: 'Split_Squats', quality: 'good' },
  { cj: 'step-ups', id: 'Step-up_with_Knee_Raise', quality: 'good' },
  { cj: 'puente-gluteo', id: 'Glute_Bridge', quality: 'perfect' },
  { cj: 'calf-raises', id: 'Calf_Press', quality: 'substitute', note: 'closest bodyweight calf in DB' },

  // ─── Core (7) ───
  { cj: 'plancha-frontal', id: 'Plank', quality: 'perfect' },
  { cj: 'plancha-lateral', id: 'Side_Bridge', quality: 'good' },
  { cj: 'dead-bug', id: 'Dead_Bug', quality: 'perfect' },
  { cj: 'bird-dog', id: 'Superman', quality: 'substitute', note: 'superman is similar back-stab exercise' },
  { cj: 'mountain-climbers', id: 'Mountain_Climbers', quality: 'perfect' },
  { cj: 'hollow-hold', id: 'Jackknife_Sit-Up', quality: 'substitute', note: 'similar core hold/movement' },
  { cj: 'russian-twist', id: 'Russian_Twist', quality: 'perfect' },

  // ─── Glúteo (6) ───
  { cj: 'clamshells', id: 'Side_Lying_Groin_Stretch', quality: 'substitute', note: 'similar side-lying glute' },
  { cj: 'hip-thrust', id: 'Glute_Bridge', quality: 'good' },
  { cj: 'monster-walks', id: 'Monster_Walk', quality: 'perfect' },
  { cj: 'donkey-kicks', id: 'Glute_Kickback', quality: 'perfect' },
  { cj: 'single-leg-glute-bridge', id: 'Single_Leg_Glute_Bridge', quality: 'perfect' },
  { cj: 'fire-hydrants', id: 'Side_Leg_Raises', quality: 'substitute' },

  // ─── Movilidad (6) ───
  { cj: 'worlds-greatest-stretch', id: 'Worlds_Greatest_Stretch', quality: 'perfect' },
  { cj: 'hip-mobility-90-90', id: '90_90_Hamstring', quality: 'good' },
  { cj: 'cat-cow', id: 'Cat_Stretch', quality: 'good' },
  { cj: 'pigeon-pose', id: 'Ankle_On_The_Knee', quality: 'good', note: 'figure-4 piriformis stretch' },
  { cj: 'hip-flexor-stretch', id: 'Kneeling_Hip_Flexor', quality: 'perfect' },
  { cj: 'calf-stretch', id: 'Calf_Stretch_Hands_Against_Wall', quality: 'perfect' },

  // ─── Tren superior (4) ───
  { cj: 'push-ups', id: 'Pushups', quality: 'perfect' },
  { cj: 'inverted-row', id: 'Inverted_Row', quality: 'perfect' },
  { cj: 'pike-push-ups', id: 'Pullups', quality: 'substitute', note: 'no pike push-up in DB; pullups closest body upper' },
  { cj: 'band-pull-apart', id: 'Band_Pull_Apart', quality: 'perfect' },
];

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0' } }, res => {
      // Follow redirect (GitHub Raw redirects to githubusercontent.com)
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); try { fs.unlinkSync(dest); } catch {}
        return downloadFile(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close(); try { fs.unlinkSync(dest); } catch {}
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
    }).on('error', err => {
      file.close(); try { fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

function buildLoopGif(frame0Path, frame1Path, outPath) {
  // 2-frame loop: 0.7s frame0 + 0.7s frame1 · scale to 360w · palette optimized
  const concatPath = outPath + '.list.txt';
  fs.writeFileSync(concatPath, `file '${path.resolve(frame0Path).replace(/\\/g,'/')}'\nduration 0.7\nfile '${path.resolve(frame1Path).replace(/\\/g,'/')}'\nduration 0.7\nfile '${path.resolve(frame0Path).replace(/\\/g,'/')}'\n`);

  const palettePath = outPath + '.palette.png';

  // Step 1: generate palette
  execFileSync(FFMPEG, [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatPath,
    '-vf', 'scale=360:-1:flags=lanczos,palettegen=max_colors=128',
    palettePath,
  ], { stdio: 'pipe' });

  // Step 2: apply palette → final GIF
  execFileSync(FFMPEG, [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatPath,
    '-i', palettePath,
    '-lavfi', 'scale=360:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer',
    '-loop', '0',
    outPath,
  ], { stdio: 'pipe' });

  try { fs.unlinkSync(palettePath); } catch {}
  try { fs.unlinkSync(concatPath); } catch {}
  return fs.statSync(outPath).size;
}

(async function main() {
  console.log('═══════════════════════════════════════');
  console.log('💪 free-exercise-db → CJ (30 ejercicios)');
  console.log('   Public Domain · 2-frame loop GIFs');
  console.log('═══════════════════════════════════════\n');

  // Delete all existing GIFs first (clean slate)
  let deleted = 0;
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith('.gif')) {
      fs.unlinkSync(path.join(OUT_DIR, f));
      deleted++;
    }
  }
  console.log(`🧹 Cleared ${deleted} old GIFs\n`);

  const manifest = [];
  let success = 0, failed = 0;
  const failedList = [];

  for (const m of MAPPING) {
    process.stdout.write(`[${m.cj}] → ${m.id} (${m.quality})... `);

    const f0 = path.join(TMP_DIR, `${m.cj}-0.jpg`);
    const f1 = path.join(TMP_DIR, `${m.cj}-1.jpg`);
    const gif = path.join(OUT_DIR, `${m.cj}.gif`);

    try {
      const s0 = await downloadFile(`${BASE_URL}/${m.id}/0.jpg`, f0);
      const s1 = await downloadFile(`${BASE_URL}/${m.id}/1.jpg`, f1);
      process.stdout.write(`⇣ ${(s0/1024).toFixed(0)}+${(s1/1024).toFixed(0)}KB `);

      const gifSize = buildLoopGif(f0, f1, gif);
      process.stdout.write(`⇒ ${(gifSize/1024).toFixed(0)}KB\n`);

      manifest.push({
        cj_slug: m.cj,
        source: 'free-exercise-db',
        free_db_id: m.id,
        quality: m.quality,
        note: m.note || null,
        gif_path: gif.replace(/\\/g, '/'),
        license: 'Unlicense (Public Domain)',
      });
      success++;
    } catch (e) {
      process.stdout.write(`✗ ${e.message.slice(0,80)}\n`);
      failed++;
      failedList.push({ cj: m.cj, error: e.message });
    }

    // Cleanup tmp frames
    try { fs.unlinkSync(f0); } catch {}
    try { fs.unlinkSync(f1); } catch {}
  }

  // Save manifest
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({
    generated_at: new Date().toISOString(),
    source: 'free-exercise-db (yuhonas/free-exercise-db · Unlicense)',
    technique: '2-frame loop GIF (start↔end position)',
    total: manifest.length,
    exercises: manifest,
    failed: failedList,
  }, null, 2));

  // Thumbnail grid
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>30 ejercicios · free-exercise-db</title>
<style>
  body{font-family:-apple-system,Segoe UI,sans-serif;background:#0b1220;color:#f6f1e8;margin:0;padding:20px}
  h1{font-size:1.4rem;margin:0 0 6px}
  .meta{color:#888;font-size:.85rem;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
  .card{background:#1a2238;border:1px solid #2a3148;border-radius:12px;overflow:hidden}
  .gif{width:100%;aspect-ratio:1;object-fit:cover;background:#fff;display:block}
  .body{padding:10px 12px;font-size:.8rem}
  .src{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;margin-bottom:3px}
  .quality-perfect{color:#22c55e}
  .quality-good{color:#f97316}
  .quality-substitute{color:#fbbf24}
  .slug{font-weight:700;color:#f6f1e8}
  .note{color:#888;margin-top:3px;font-size:.7rem;font-style:italic}
  .errors{margin-top:24px;padding:14px;background:#fee2e2;border-radius:8px;color:#991b1b;font-size:.85rem}
</style></head><body>
<h1>💪 30 ejercicios · free-exercise-db (Public Domain)</h1>
<p class="meta">${manifest.length}/30 OK · 2-frame loop GIFs (start↔end position) · ${failedList.length} fallidos · Generated ${new Date().toISOString().slice(0,16)}</p>
<div class="grid">
${manifest.map((m, i) => `
  <div class="card">
    <img class="gif" src="../${m.gif_path}" alt="${m.cj_slug}" loading="lazy">
    <div class="body">
      <div class="src quality-${m.quality}">#${i+1} · ${m.quality.toUpperCase()}</div>
      <div class="slug">${m.cj_slug}</div>
      ${m.note ? `<div class="note">↳ ${m.note}</div>` : ''}
    </div>
  </div>`).join('')}
</div>
${failedList.length ? `<div class="errors"><strong>❌ Fallidos:</strong> ${failedList.map(f => f.cj).join(', ')}</div>` : ''}
</body></html>`;
  fs.writeFileSync(path.join('tmp', 'exercises-thumbnails.html'), html);

  // Total size
  let totalSize = 0;
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith('.gif')) totalSize += fs.statSync(path.join(OUT_DIR, f)).size;
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ FREE-DB FETCH COMPLETADO`);
  console.log(`   Success:     ${success}/30`);
  console.log(`   Failed:      ${failed}`);
  console.log(`   Total size:  ${(totalSize/1024/1024).toFixed(1)} MB`);
  console.log(`   Promedio:    ${(totalSize/manifest.length/1024).toFixed(0)} KB/GIF`);
  console.log('═══════════════════════════════════════');
})();
