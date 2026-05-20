#!/usr/bin/env node
/**
 * update-strength-seed.cjs — Patch strength_seed_data.sql con paths locales
 *
 * Después de bajar los 30 GIFs con download-exercisedb.cjs, este script
 * actualiza el seed SQL para que apunte a /public/exercises/{slug}.gif
 * en vez de las URLs media.musclewiki.com fake (que devolvían 404).
 *
 * Idempotente · puedes correrlo múltiples veces.
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = 'supabase/migrations/20260520150100_strength_seed_data.sql';
const MANIFEST_PATH = 'public/exercises/manifest.json';

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ Manifest no existe. Run first: node tools/exercises/download-exercisedb.cjs');
  process.exit(1);
}
if (!fs.existsSync(SEED_PATH)) {
  console.error('❌ Seed SQL no existe en ' + SEED_PATH);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
let sql = fs.readFileSync(SEED_PATH, 'utf8');
const before = sql.length;

let replaced = 0;
let notFound = 0;

// Replace gif_url for each variant
for (const ex of manifest.exercises) {
  const localPath = `/${ex.gif_path}`; // → /public/exercises/sentadilla.gif
  // Pattern: any URL pointing to musclewiki or exercisedb for this slug variant
  // The seed SQL has variants like:
  //   ('{slug}-no-weight', ..., 'https://media.musclewiki.com/...-front.gif', ...)
  // We replace ALL gif_url for this slug
  const regex = new RegExp(
    `('${ex.cj_slug}[^']*',\\s*'[^']*',\\s*'[^']*',\\s*'[^']*',\\s*'(?:casa|gym|ambos)',\\s*)'[^']*'(,\\s*(?:TRUE|FALSE))`,
    'g'
  );
  const matches = sql.match(regex);
  if (matches) {
    sql = sql.replace(regex, `$1'${localPath}'$2`);
    replaced += matches.length;
    console.log(`✓ ${ex.cj_slug} → ${localPath} (${matches.length} variants)`);
  } else {
    notFound++;
    console.warn(`⚠ ${ex.cj_slug}: pattern not found in SQL`);
  }
}

// Also update the comment header to reflect ExerciseDB source
sql = sql.replace(
  /-- URLs MuscleWiki: usamos slugs canonical[^\n]*\n-- Patrón: https:\/\/media\.musclewiki\.com[^\n]*\n--\n-- \(Si decides migrar a ExerciseDB API: solo cambias gif_source \+ URLs\)/,
  `-- GIFs auto-downloaded desde ExerciseDB (RapidAPI) y self-hosted
-- Paths: /public/exercises/{slug}.gif (manifest en public/exercises/manifest.json)
-- Atribución: ExerciseDB via RapidAPI · free tier`
);

if (sql.length === before) {
  console.log('\n⚠ Nothing changed in SQL · verify regex');
} else {
  fs.writeFileSync(SEED_PATH, sql);
  console.log(`\n✅ SQL patched · ${replaced} URLs reemplazadas · ${notFound} slugs not found`);
  console.log(`   ${SEED_PATH}`);
  console.log(`   Bytes: ${before} → ${sql.length}`);
}
