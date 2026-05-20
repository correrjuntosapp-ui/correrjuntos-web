#!/usr/bin/env node
/**
 * pexels-fetch-exercises.cjs — Re-fetch 24 ejercicios sub-óptimos desde Pexels
 *
 * Mantiene los 6 GIFs OK de ExerciseDB (push-up, walking-lunge, plank,
 * mountain-climber, dead-bug, glute-bridge) y reemplaza el resto + descarga
 * los 4 missing con videos Pexels convertidos a GIFs optimizados.
 *
 * Pipeline:
 *   1. Search Pexels Videos por exercise (4 queries fallback por slug)
 *   2. Download video portrait (preferred) o landscape
 *   3. ffmpeg convert → GIF 6s, 360px wide, 15fps, palette-optimized
 *   4. Save to public/exercises/{slug}.gif
 *   5. Update manifest.json
 *
 * Requires:
 *   - PEXELS_API_KEY in .env (ya configurado)
 *   - ffmpeg-static (ya instalado)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');
const FFMPEG = require('ffmpeg-static');

function loadEnv() {
  if (!fs.existsSync('.env')) return;
  const lines = fs.readFileSync('.env', 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const PEXELS_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_KEY) {
  console.error('❌ Missing PEXELS_API_KEY in .env');
  process.exit(1);
}

const OUT_DIR = path.join('public', 'exercises');
const TMP_DIR = path.join('tmp', 'pexels-videos');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

// 6 GIFs OK ExerciseDB · MANTENER (skip download)
const KEEP_EXERCISEDB = new Set([
  'zancadas-caminando',       // walking lunge
  'puente-gluteo',            // low glute bridge
  'plancha-frontal',          // front plank
  'dead-bug',                  // dead bug
  'mountain-climbers',        // mountain climber
  'push-ups',                  // clock push-up
]);

// 24 ejercicios a re-buscar en Pexels · queries por preferencia
const TO_FETCH = [
  // Sub-óptimos a re-buscar
  { cj: 'sentadilla', queries: ['bodyweight squat exercise', 'squat workout', 'air squat', 'squat exercise'] },
  { cj: 'peso-muerto-unilateral', queries: ['single leg deadlift', 'one leg deadlift', 'deadlift exercise', 'romanian deadlift'] },
  { cj: 'sentadilla-bulgara', queries: ['bulgarian split squat', 'split squat exercise', 'rear foot elevated split squat'] },
  { cj: 'step-ups', queries: ['step up exercise', 'box step up', 'step ups workout'] },
  { cj: 'calf-raises', queries: ['calf raise exercise', 'calf raises', 'standing calf raise'] },
  { cj: 'plancha-lateral', queries: ['side plank exercise', 'side plank workout', 'side plank pose'] },
  { cj: 'bird-dog', queries: ['bird dog exercise', 'quadruped exercise', 'core stability exercise'] },
  { cj: 'hollow-hold', queries: ['hollow body hold', 'hollow hold exercise', 'core hold exercise'] },
  { cj: 'russian-twist', queries: ['russian twist exercise', 'russian twist workout', 'oblique twist'] },
  { cj: 'clamshells', queries: ['clamshell exercise', 'hip clam exercise', 'clamshell glute'] },
  { cj: 'hip-thrust', queries: ['hip thrust exercise', 'glute hip thrust', 'barbell hip thrust'] },
  { cj: 'monster-walks', queries: ['monster walk exercise', 'lateral band walk', 'band walk glute'] },
  { cj: 'donkey-kicks', queries: ['donkey kick exercise', 'glute kickback', 'kneeling kick exercise'] },
  { cj: 'single-leg-glute-bridge', queries: ['single leg glute bridge', 'one leg bridge exercise', 'single leg hip bridge'] },
  { cj: 'fire-hydrants', queries: ['fire hydrant exercise', 'hip abduction exercise', 'side hip lift'] },
  { cj: 'worlds-greatest-stretch', queries: ['world greatest stretch', 'spider lunge stretch', 'lunge with rotation'] },
  { cj: 'hip-mobility-90-90', queries: ['90 90 hip stretch', 'hip mobility exercise', 'hip rotation stretch'] },
  { cj: 'cat-cow', queries: ['cat cow pose', 'cat cow yoga', 'cat camel stretch'] },
  { cj: 'pigeon-pose', queries: ['pigeon pose yoga', 'pigeon stretch', 'hip flexor stretch yoga'] },
  { cj: 'hip-flexor-stretch', queries: ['hip flexor stretch', 'kneeling hip flexor', 'hip stretch exercise'] },
  { cj: 'calf-stretch', queries: ['calf stretch', 'wall calf stretch', 'calf flexibility'] },
  { cj: 'inverted-row', queries: ['inverted row exercise', 'australian pull up', 'bodyweight row'] },
  { cj: 'pike-push-ups', queries: ['pike push up', 'pike push-up exercise', 'pike pushup workout'] },
  { cj: 'band-pull-apart', queries: ['resistance band pull apart', 'band pull apart shoulder', 'band external rotation'] },
];

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0,200)}`));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0' } }, res => {
      if (res.statusCode !== 200) {
        file.close(); try { fs.unlinkSync(dest); } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
    }).on('error', err => {
      file.close(); try { fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

// Pick best video variant from Pexels (prefer hd, smaller size, sd_540 sweet spot)
function pickBestVideo(video) {
  const files = video.video_files || [];
  // Prefer 720p portrait or HD landscape
  let target = files.find(f => f.height >= 700 && f.height <= 1280 && f.size < 20 * 1024 * 1024);
  if (!target) target = files.find(f => f.width >= 540 && f.size < 15 * 1024 * 1024);
  if (!target) target = files[0];
  return target;
}

function convertToGif(videoPath, gifPath) {
  // 2-pass ffmpeg: generate palette + apply palette for better quality
  const palettePath = videoPath + '.palette.png';

  // Step 1: trim to 6s, scale to 360w, generate palette
  execFileSync(FFMPEG, [
    '-y',
    '-i', videoPath,
    '-t', '6',
    '-vf', 'fps=15,scale=360:-1:flags=lanczos,palettegen=max_colors=64',
    palettePath,
  ], { stdio: 'pipe' });

  // Step 2: apply palette
  execFileSync(FFMPEG, [
    '-y',
    '-i', videoPath,
    '-i', palettePath,
    '-t', '6',
    '-lavfi', 'fps=15,scale=360:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer',
    gifPath,
  ], { stdio: 'pipe' });

  try { fs.unlinkSync(palettePath); } catch {}
  return fs.statSync(gifPath).size;
}

(async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🎬 Pexels exercises (24 a re-fetch · GIF 6s 360px)');
  console.log('═══════════════════════════════════════');

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const newExercises = existing.exercises.filter(e => KEEP_EXERCISEDB.has(e.cj_slug));
  console.log(`Keeping ${newExercises.length} GIFs OK de ExerciseDB`);

  // Delete the 20 incorrect ExerciseDB GIFs
  let deleted = 0;
  for (const ex of existing.exercises) {
    if (!KEEP_EXERCISEDB.has(ex.cj_slug)) {
      try {
        const p = path.join(OUT_DIR, `${ex.cj_slug}.gif`);
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
          deleted++;
        }
      } catch {}
    }
  }
  console.log(`Deleted ${deleted} GIFs incorrectos`);

  let recovered = 0;
  let stillFailed = 0;
  const stillFailedList = [];

  for (const item of TO_FETCH) {
    console.log(`\n[${item.cj}]`);
    let matched = null;
    let matchedQuery = null;

    for (const q of item.queries) {
      try {
        const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=5&orientation=portrait`;
        const r = await httpGet(url, { Authorization: PEXELS_KEY });
        if (r.videos && r.videos.length) {
          // Score: prefer shorter videos (3-15s ideal), prefer with "exercise"/"workout" in url
          const scored = r.videos.map(v => {
            let score = 0;
            if (v.duration >= 3 && v.duration <= 20) score += 10;
            else if (v.duration <= 30) score += 5;
            if (v.url && /(exercise|workout|fitness|training)/i.test(v.url)) score += 5;
            return { v, score };
          }).sort((a, b) => b.score - a.score);
          matched = scored[0].v;
          matchedQuery = q;
          console.log(`  "${q}" → video ${matched.id} (${matched.duration}s · score ${scored[0].score})`);
          break;
        }
        process.stdout.write(`  "${q}": 0 results · `);
      } catch (e) {
        process.stdout.write(`  "${q}": ${e.message.slice(0,50)} · `);
      }
      await new Promise(r => setTimeout(r, 150));
    }

    if (!matched) {
      console.log(`\n  ❌ all queries failed`);
      stillFailed++;
      stillFailedList.push(item.cj);
      continue;
    }

    const videoFile = pickBestVideo(matched);
    if (!videoFile) {
      console.log(`  ❌ no video file`);
      stillFailed++;
      stillFailedList.push(item.cj);
      continue;
    }

    // Download video to tmp
    const videoPath = path.join(TMP_DIR, `${item.cj}.mp4`);
    try {
      const size = await downloadFile(videoFile.link, videoPath);
      console.log(`  ⇣ video ${(size/1024/1024).toFixed(1)} MB`);
    } catch (e) {
      console.log(`  ✗ download: ${e.message}`);
      stillFailed++;
      stillFailedList.push(item.cj);
      continue;
    }

    // Convert to GIF
    const gifPath = path.join(OUT_DIR, `${item.cj}.gif`);
    try {
      const gifSize = convertToGif(videoPath, gifPath);
      console.log(`  ⇒ gif ${(gifSize/1024).toFixed(0)} KB`);
      recovered++;
      newExercises.push({
        cj_slug: item.cj,
        source: 'pexels',
        pexels_video_id: matched.id,
        author: matched.user.name,
        author_url: matched.user.url,
        video_url: matched.url,
        gif_path: gifPath.replace(/\\/g, '/'),
        duration_video: matched.duration,
        matched_query: matchedQuery,
        attribution: 'Pexels',
      });
    } catch (e) {
      console.log(`  ✗ convert: ${e.message.slice(0,100)}`);
      stillFailed++;
      stillFailedList.push(item.cj);
    }

    // Cleanup video file
    try { fs.unlinkSync(videoPath); } catch {}
    await new Promise(r => setTimeout(r, 200));
  }

  // Save updated manifest
  const newManifest = {
    generated_at: new Date().toISOString(),
    sources: ['ExerciseDB (6 ejercicios)', 'Pexels (resto)'],
    total: newExercises.length,
    exercises: newExercises,
    failed: stillFailedList,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));

  // Regenerate thumbnail grid
  const thumbHtml = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>30 ejercicios · GIFs reales · ${new Date().toISOString().slice(0,10)}</title>
<style>
  body{font-family:-apple-system,Segoe UI,sans-serif;background:#0b1220;color:#f6f1e8;margin:0;padding:20px}
  h1{font-size:1.4rem;margin:0 0 6px}
  .meta{color:#888;font-size:.85rem;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
  .card{background:#1a2238;border:1px solid #2a3148;border-radius:12px;overflow:hidden}
  .gif{width:100%;aspect-ratio:1;object-fit:cover;background:#fff;display:block}
  .body{padding:10px 12px;font-size:.8rem}
  .src{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;margin-bottom:3px}
  .src.pexels{color:#22c55e}
  .src.exercisedb{color:#f97316}
  .slug{font-weight:700;color:#f6f1e8}
  .author{color:#888;margin-top:3px;font-size:.7rem}
  .errors{margin-top:24px;padding:14px;background:#fee2e2;border-radius:8px;color:#991b1b;font-size:.85rem}
</style></head><body>
<h1>💪 30 ejercicios · híbrido ExerciseDB + Pexels</h1>
<p class="meta">${newExercises.length}/30 con GIF real · ${stillFailedList.length} sin GIF · Generated ${new Date().toISOString().slice(0,16)}</p>
<div class="grid">
${newExercises.map((m, i) => {
  const src = m.source === 'pexels' ? 'pexels' : 'exercisedb';
  const srcLabel = m.source === 'pexels' ? 'PEXELS' : 'EXERCISEDB';
  const author = m.author || m.name_en || '';
  return `  <div class="card">
    <img class="gif" src="../${m.gif_path}" alt="${m.cj_slug}" loading="lazy">
    <div class="body">
      <div class="src ${src}">#${i+1} · ${srcLabel}</div>
      <div class="slug">${m.cj_slug}</div>
      <div class="author">${author}</div>
    </div>
  </div>`;
}).join('\n')}
</div>
${stillFailedList.length ? `<div class="errors"><strong>❌ ${stillFailedList.length} sin GIF (grabar nosotros):</strong> ${stillFailedList.join(', ')}</div>` : ''}
</body></html>`;
  fs.writeFileSync(path.join('tmp', 'exercises-thumbnails.html'), thumbHtml);

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ PEXELS FETCH COMPLETADO`);
  console.log(`   Recovered:    ${recovered}`);
  console.log(`   Still failed: ${stillFailed}`);
  console.log(`   Total final:  ${newExercises.length}/30`);
  if (stillFailedList.length) {
    console.log(`\n⚠ Sin GIF · grabar nosotros:`);
    stillFailedList.forEach(s => console.log(`  · ${s}`));
  }
  console.log('═══════════════════════════════════════');
})();
