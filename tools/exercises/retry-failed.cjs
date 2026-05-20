#!/usr/bin/env node
/**
 * retry-failed.cjs — Retry los 11 ejercicios que fallaron con search terms alternativos
 *
 * ExerciseDB no encontró match para algunos nombres exactos. Probamos
 * sinónimos / variantes ortográficas hasta encontrar match.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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
const HOST = 'exercisedb.p.rapidapi.com';
const OUT_DIR = path.join('public', 'exercises');

// 11 ejercicios fallidos · search alternativos por orden de preferencia
const RETRIES = [
  { cj: 'bird-dog', alts: ['bird', 'quadruped', 'opposite arm leg raise', 'cross body extension'] },
  { cj: 'hollow-hold', alts: ['hollow body', 'hollow', 'boat', 'sit up hold'] },
  { cj: 'clamshells', alts: ['clamshell', 'lying clam', 'side lying hip', 'side lying leg lift'] },
  { cj: 'donkey-kicks', alts: ['donkey', 'kneeling kickback', 'glute kickback', 'kickback'] },
  { cj: 'single-leg-glute-bridge', alts: ['single leg bridge', 'one leg bridge', 'unilateral glute', 'single leg hip raise'] },
  { cj: 'fire-hydrants', alts: ['hip abduction', 'side leg raise', 'lateral leg raise', 'standing side leg'] },
  { cj: 'hip-mobility-90-90', alts: ['90 90 stretch', '90-90 stretch', 'figure 4', 'hip rotation stretch'] },
  { cj: 'cat-cow', alts: ['cat camel', 'cat stretch', 'spinal flexion', 'kneeling back stretch'] },
  { cj: 'pigeon-pose', alts: ['pigeon stretch', 'figure four stretch', 'piriformis stretch', 'hip opener'] },
  { cj: 'pike-push-ups', alts: ['pike push up', 'pike pushup', 'inverted shoulder press', 'pike press'] },
  { cj: 'band-pull-apart', alts: ['band pull', 'resistance band pull', 'shoulder band', 'rear delt fly band'] },
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

function downloadFile(url, dest, headers) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers }, res => {
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

(async function main() {
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const headers = { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': HOST };

  let recovered = 0;
  let stillFailed = 0;
  const stillFailedList = [];

  for (const r of RETRIES) {
    console.log(`\n[${r.cj}] retrying...`);
    let matched = null;
    let matchedTerm = null;

    for (const term of r.alts) {
      try {
        const url = `https://${HOST}/exercises/name/${encodeURIComponent(term)}`;
        const results = await httpGet(url, headers);
        if (Array.isArray(results) && results.length > 0) {
          // Prefer body weight
          matched = results.find(x => x.equipment === 'body weight') || results[0];
          matchedTerm = term;
          break;
        }
        process.stdout.write(`  "${term}": no results · `);
      } catch (e) {
        process.stdout.write(`  "${term}": ${e.message} · `);
      }
      await new Promise(rr => setTimeout(rr, 200));
    }

    if (!matched) {
      console.log(`\n  ❌ all alts failed`);
      stillFailed++;
      stillFailedList.push(r.cj);
      continue;
    }

    console.log(`\n  ✓ "${matchedTerm}" → ${matched.id} (${matched.name})`);

    const dest = path.join(OUT_DIR, `${r.cj}.gif`);
    const gifUrl = `https://${HOST}/image?exerciseId=${matched.id}&resolution=360`;
    try {
      const size = await downloadFile(gifUrl, dest, headers);
      console.log(`  ⇣ ${(size/1024).toFixed(0)} KB`);
      recovered++;
      existing.exercises.push({
        cj_slug: r.cj,
        exercisedb_id: matched.id,
        name_en: matched.name,
        target: matched.target,
        body_part: matched.bodyPart,
        equipment: matched.equipment,
        gif_path: dest.replace(/\\/g, '/'),
        original_gif_url: gifUrl,
        attribution: 'ExerciseDB via RapidAPI',
        matched_via: matchedTerm,
      });
    } catch (e) {
      console.log(`  ✗ download failed: ${e.message}`);
      stillFailed++;
      stillFailedList.push(r.cj);
    }
    await new Promise(rr => setTimeout(rr, 200));
  }

  // Update manifest
  existing.errors = existing.errors.filter(e => !RETRIES.find(r => r.cj === e.cj && stillFailedList.indexOf(r.cj) < 0));
  existing.total = existing.exercises.length;
  fs.writeFileSync(manifestPath, JSON.stringify(existing, null, 2));

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ RETRY DONE`);
  console.log(`   Recovered:   ${recovered}`);
  console.log(`   Still failed: ${stillFailed}`);
  console.log(`   Total now:   ${existing.exercises.length}/30`);
  if (stillFailedList.length) {
    console.log(`\n⚠ Manual handling needed:`);
    stillFailedList.forEach(s => console.log(`  · ${s}`));
  }
  console.log('═══════════════════════════════════════');
})();
