#!/usr/bin/env node
// audit-product-offers.cjs
// Find Product/Offer schemas without `price` or `priceSpecification.price`.
// Optional --fix removes incomplete offers entirely (safer than fake prices).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIX_MODE = process.argv.includes('--fix');

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    if (entry.name === 'correr-juntos-app' || entry.name === 'public') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

function extractBlocks(html) {
  const blocks = [];
  const re = /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push({ raw: m[1].trim(), start: m.index, length: m[0].length });
  }
  return blocks;
}

function hasPrice(offer) {
  if (offer.price !== undefined && offer.price !== null && offer.price !== '') return true;
  if (offer.priceSpecification?.price !== undefined && offer.priceSpecification?.price !== null) return true;
  return false;
}

function walkSchema(data, results, file, opts = { fix: false }) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    const cleaned = data.map(d => walkSchema(d, results, file, opts));
    return cleaned;
  }
  // Detect Product with bad offers
  if (data['@type'] === 'Product' && data.offers) {
    const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
    const bad = offers.filter(o => !hasPrice(o));
    if (bad.length > 0) {
      results.push({ file, type: 'Product', missing: 'price/priceSpecification.price', name: data.name || '(no name)' });
      if (opts.fix) {
        // Remove offers entirely to satisfy validator (safer than fake price)
        delete data.offers;
      }
    }
  }
  // Detect standalone Offer
  if (data['@type'] === 'Offer' && !hasPrice(data)) {
    results.push({ file, type: 'Offer', missing: 'price/priceSpecification.price', name: data.name || data.url || '(no name)' });
    // Can't delete in place here without parent context; flag only.
  }
  // Detect ItemList with Product items missing price (Merchant)
  if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
    for (const item of data.itemListElement) {
      walkSchema(item, results, file, opts);
    }
  }
  // Recurse @graph
  if (Array.isArray(data['@graph'])) {
    data['@graph'] = data['@graph'].map(d => walkSchema(d, results, file, opts));
  }
  // Recurse common nested arrays
  for (const k of Object.keys(data)) {
    const v = data[k];
    if (Array.isArray(v) || (v && typeof v === 'object' && v['@type'])) {
      walkSchema(v, results, file, opts);
    }
  }
  return data;
}

const files = walk(ROOT);
const issues = [];
let fixedFiles = 0;

for (const f of files) {
  let html;
  try { html = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
  const blocks = extractBlocks(html);
  if (blocks.length === 0) continue;

  let fileChanged = false;
  let newHtml = html;

  for (const block of blocks) {
    let data;
    try { data = JSON.parse(block.raw); } catch (e) { continue; }
    const before = issues.length;
    walkSchema(data, issues, f, { fix: FIX_MODE });
    const found = issues.slice(before);
    if (FIX_MODE && found.length > 0) {
      const newJson = JSON.stringify(data, null, 2);
      newHtml = newHtml.slice(0, block.start) +
        `<script type="application/ld+json">\n${newJson}\n</script>` +
        newHtml.slice(block.start + block.length);
      fileChanged = true;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(f, newHtml);
    fixedFiles++;
  }
}

const byFile = {};
for (const i of issues) {
  byFile[i.file] = byFile[i.file] || [];
  byFile[i.file].push(i);
}

console.log(`\n═══ Product/Offer Audit ═══`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files with issues: ${Object.keys(byFile).length}`);
console.log(`Total issues: ${issues.length}`);
if (FIX_MODE) console.log(`Files fixed: ${fixedFiles}`);

if (Object.keys(byFile).length > 0 && Object.keys(byFile).length <= 30) {
  console.log(`\nAffected files:`);
  for (const [file, list] of Object.entries(byFile)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    console.log(`  ${rel}`);
    list.slice(0, 5).forEach(l => console.log(`     [${l.type}] "${l.name}" missing ${l.missing}`));
  }
}
