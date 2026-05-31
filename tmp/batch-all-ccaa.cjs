#!/usr/bin/env node
// ============================================================
// batch-all-ccaa.cjs (v1.3.18 31 may 2026)
// Scrape TODAS las CCAA restantes de clubrunning.es en serie.
// Al terminar: copia carteles a public/, merge en carreras-2026.json,
// genera reporte stats para commit + OTA.
// ============================================================
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCRAPER = path.join(__dirname, 'scrape-clubrunning.cjs');
const JSON_FILE = path.join(ROOT, 'correr-juntos-app/src/data/carreras-2026.json');
const PUBLIC_CARTELES = path.join(ROOT, 'public/carreras/auto');

// 14 CCAA restantes (Madrid + Andalucía + Extremadura ya integradas)
const CCAA = [
  'Cataluña',
  'Valencia',
  'Galicia',
  'Castilla y León',
  'Castilla-La Mancha',
  'País Vasco',
  'Aragón',
  'Asturias',
  'Murcia',
  'Canarias',
  'Baleares',
  'Cantabria',
  'Navarra',
  'La Rioja',
];

const t0 = Date.now();
const results = [];
const errors = [];

console.log(`🚀 Batch scrape ${CCAA.length} CCAA empezando ${new Date().toISOString()}`);
console.log(`   Carteles → ${PUBLIC_CARTELES}`);
console.log(`   JSON     → ${JSON_FILE}\n`);

// Load JSON base (con Extremadura ya integrada)
let json = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
const carrerasAntes = json.carreras.length;

for (let i = 0; i < CCAA.length; i++) {
  const ccaa = CCAA[i];
  const slug = ccaa.toLowerCase().replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').replace(/\s+/g,'-');
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[${i+1}/${CCAA.length}] ${ccaa}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const tStart = Date.now();

  // Ejecutar scraper
  const result = spawnSync('node', [SCRAPER, ccaa], { stdio: 'inherit', encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`❌ Falló scraper ${ccaa}`);
    errors.push({ ccaa, error: 'scraper exit !=0' });
    continue;
  }

  // Leer output JSON
  const scrapedFile = path.join(__dirname, `scraped-${slug}.json`);
  if (!fs.existsSync(scrapedFile)) {
    console.error(`❌ No se generó scraped-${slug}.json`);
    errors.push({ ccaa, error: 'no scraped json' });
    continue;
  }
  const scraped = JSON.parse(fs.readFileSync(scrapedFile, 'utf8'));

  // Copiar carteles a public/carreras/auto/
  const cartelesDir = path.join(__dirname, `carteles-${slug}`);
  let copied = 0;
  if (fs.existsSync(cartelesDir)) {
    for (const f of fs.readdirSync(cartelesDir)) {
      if (!f.endsWith('.jpg')) continue;
      const src = path.join(cartelesDir, f);
      const dst = path.join(PUBLIC_CARTELES, f);
      fs.copyFileSync(src, dst);
      copied++;
    }
  }

  // Merge en JSON (dedup por id, preservar _meta + ciudades + provincias)
  const carrerasNuevas = scraped.map(r => { const x = {...r}; delete x.clubrunning_slug; return x; });
  const idsExistentes = new Set(json.carreras.map(c => c.id));
  const sinDup = carrerasNuevas.filter(c => !idsExistentes.has(c.id));
  json.carreras.push(...sinDup);
  if (!json.ciudades_a_comunidad) json.ciudades_a_comunidad = {};
  if (!json.provincias_a_comunidad) json.provincias_a_comunidad = {};
  for (const r of sinDup) {
    if (r.ciudad)   json.ciudades_a_comunidad[r.ciudad] = r.comunidad;
    if (r.provincia) json.provincias_a_comunidad[r.provincia] = r.comunidad;
  }

  const elapsed = Math.round((Date.now() - tStart) / 1000);
  results.push({
    ccaa, scraped: scraped.length, merged: sinDup.length,
    carteles_copied: copied, elapsed_s: elapsed,
  });
  console.log(`✅ ${ccaa}: ${scraped.length} scraped · ${sinDup.length} mergeed · ${copied} carteles · ${elapsed}s`);
}

// Save JSON
if (json._meta) {
  json._meta.last_updated = '2026-05-31';
  json._meta.note = (json._meta.note || '') + ` Batch 14 CCAA clubrunning.es 31 may.`;
}
fs.writeFileSync(JSON_FILE, JSON.stringify(json, null, 2));

const carrerasDespues = json.carreras.length;
const totalSec = Math.round((Date.now() - t0) / 1000);

// Reporte final
console.log(`\n\n╔═══════════════════════════════════════════════════════════════╗`);
console.log(`║              BATCH COMPLETO · ${totalSec}s (${Math.round(totalSec/60)}min)            ║`);
console.log(`╚═══════════════════════════════════════════════════════════════╝`);
console.log(`Catálogo: ${carrerasAntes} → ${carrerasDespues} (+${carrerasDespues-carrerasAntes})`);
console.log(`ciudades_a_comunidad: ${Object.keys(json.ciudades_a_comunidad).length}`);
console.log(`provincias_a_comunidad: ${Object.keys(json.provincias_a_comunidad).length}`);
console.log(``);
console.log(`Por CCAA:`);
results.forEach(r => console.log(`  ${r.ccaa.padEnd(22)} ${String(r.scraped).padStart(3)} scraped · ${String(r.merged).padStart(3)} merged · ${String(r.carteles_copied).padStart(3)} carteles · ${r.elapsed_s}s`));
if (errors.length) {
  console.log(`\n❌ Errores (${errors.length}):`);
  errors.forEach(e => console.log(`  ${e.ccaa}: ${e.error}`));
}

// Distribución por comunidad final
const byCC = {};
json.carreras.forEach(c => { byCC[c.comunidad || '?'] = (byCC[c.comunidad || '?'] || 0) + 1; });
console.log(`\nDistribución final del catálogo:`);
Object.entries(byCC).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${String(v).padStart(3)} ${k}`));

// Write summary log para que main loop lo lea al recibir notif
fs.writeFileSync(path.join(__dirname, 'batch-ccaa-summary.json'), JSON.stringify({
  finished_at: new Date().toISOString(),
  total_seconds: totalSec,
  catalog_before: carrerasAntes,
  catalog_after: carrerasDespues,
  by_ccaa: results,
  errors,
  distribution: byCC,
}, null, 2));
console.log(`\n📝 Summary: tmp/batch-ccaa-summary.json\n`);
