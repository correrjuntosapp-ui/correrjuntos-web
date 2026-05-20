#!/usr/bin/env node
/**
 * update-mockup-catalog.cjs — Patch mockup strength-catalog HTML con GIFs reales
 *
 * Después de bajar los 30 GIFs, este script reemplaza los SVG stick-figure
 * inline del mockup por <img src="/public/exercises/{slug}.gif"> reales.
 *
 * Idempotente · seguro de correr múltiples veces.
 */

const fs = require('fs');

const MOCKUP_PATH = 'tmp/strength-catalog-2026-05-20.html';
const MANIFEST_PATH = 'public/exercises/manifest.json';

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ Manifest no existe. Run first: node tools/exercises/download-exercisedb.cjs');
  process.exit(1);
}
if (!fs.existsSync(MOCKUP_PATH)) {
  console.error('❌ Mockup HTML no existe en ' + MOCKUP_PATH);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
let html = fs.readFileSync(MOCKUP_PATH, 'utf8');
const before = html.length;

// Approach: for each exercise card div, find the inline SVG and replace with <img>
// Cards have structure:
//   <div class="exercise-card">
//     <div class="card-thumb">
//       <div class="ex-num">XX</div>
//       <div class="difficulty ...">YYY</div>
//       <svg class="figure" ...>...inline stick figure...</svg>
//     </div>
//     <div class="card-body">
//       <div class="card-title">{Title in Spanish}</div>
//       ...
//
// We match by card-title to determine which slug it is, then replace its <svg class="figure">.

// Build name → slug lookup from the seed SQL (already in our extractor)
// For simplicity: use the manifest gif_path + match by Spanish name from cj-exercises-30.txt

const cjMap = {};
const cjList = fs.readFileSync('tmp/cj-exercises-30.txt', 'utf8').split('\n').filter(Boolean);
for (const line of cjList) {
  const [slug, name] = line.split('|');
  cjMap[name.trim()] = slug;
}

let patched = 0;
let notFound = 0;

// For each manifest entry, find the matching card by title text and replace SVG
for (const ex of manifest.exercises) {
  // Find Spanish title - look up backward via cjMap (where slug→name)
  const slug = ex.cj_slug;
  // Find which Spanish name corresponds to this slug
  const spanishName = Object.keys(cjMap).find(name => cjMap[name] === slug);
  if (!spanishName) {
    console.warn(`⚠ ${slug}: no Spanish name found`);
    notFound++;
    continue;
  }

  // Find the card by title and replace its <svg class="figure">...</svg>
  // Title can be partially in the card (e.g., "World" for "worlds-greatest-stretch")
  const titleEscape = spanishName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cardRegex = new RegExp(
    `(<div class="card-thumb">[\\s\\S]*?)(<svg class="figure"[\\s\\S]*?</svg>)([\\s\\S]*?<div class="card-title">\\s*${titleEscape})`,
    'g'
  );

  const replacement = `$1<img class="gif" src="../${ex.gif_path}" alt="${spanishName}" loading="lazy" style="width:100%;height:100%;object-fit:contain;background:#fff;border-radius:8px">$3`;

  if (cardRegex.test(html)) {
    cardRegex.lastIndex = 0; // reset
    html = html.replace(cardRegex, replacement);
    console.log(`✓ ${slug} (${spanishName}) → ${ex.gif_path}`);
    patched++;
  } else {
    console.warn(`⚠ ${slug}: card with title "${spanishName}" not found`);
    notFound++;
  }
}

// Also add a small attribution at the top
if (!html.includes('ExerciseDB attribution')) {
  html = html.replace(
    /<style>/,
    `<!-- ExerciseDB attribution: GIFs by ExerciseDB via RapidAPI -->
<style>`
  );
}

if (html.length === before) {
  console.log('\n⚠ Nothing changed in mockup · all cards may already be patched');
} else {
  fs.writeFileSync(MOCKUP_PATH, html);
  console.log(`\n✅ Mockup patched · ${patched} cards · ${notFound} not found`);
  console.log(`   ${MOCKUP_PATH}`);
  console.log(`   Bytes: ${before} → ${html.length}`);
  console.log(`\n👀 Abre el mockup para validar:`);
  console.log(`   start tmp/strength-catalog-2026-05-20.html`);
}
