#!/usr/bin/env node
// ============================================================
// audit-breadcrumb-schema.cjs
//
// Audita BreadcrumbList JSON-LD en todos los HTMLs del sitio.
// Reporta los que tienen `itemListElement` sin campo `item` (error
// crítico Google Search Console).
//
// Estructura correcta esperada:
//   { "@type": "ListItem", "position": 1, "name": "X", "item": "URL" }
//
// Uso: node tools/audit-breadcrumb-schema.cjs
//      node tools/audit-breadcrumb-schema.cjs --fix  (auto-fix where possible)
// ============================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIX_MODE = process.argv.includes('--fix');
const BASE_URL = 'https://www.correrjuntos.com';

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

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push({ raw: m[1].trim(), start: m.index, length: m[0].length });
  }
  return blocks;
}

function checkBreadcrumb(data, results, file) {
  if (!data || typeof data !== 'object') return;
  if (Array.isArray(data)) {
    data.forEach(d => checkBreadcrumb(d, results, file));
    return;
  }
  if (data['@type'] === 'BreadcrumbList' && Array.isArray(data.itemListElement)) {
    data.itemListElement.forEach((el, i) => {
      if (!el.item || typeof el.item !== 'string') {
        results.push({ file, position: el.position || i + 1, name: el.name || '(no name)', has_item: !!el.item });
      }
    });
  }
  // Recurse into @graph or nested structures
  if (Array.isArray(data['@graph'])) {
    data['@graph'].forEach(d => checkBreadcrumb(d, results, file));
  }
}

function getCanonicalUrl(html, file) {
  // 1. Prefer <link rel="canonical" href="...">
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (m) return m[1];
  // 2. Prefer og:url
  const og = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
  if (og) return og[1];
  // 3. Fallback: inferir desde filename
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const slug = rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return `${BASE_URL}/${slug}`;
}

function inferItemUrl(file, position, name, html) {
  // Position 1 = home, 2 = section (Blog, Cities, etc), 3+ = la página actual
  if (position === 1 && /inicio|home|portada/i.test(name)) return BASE_URL + '/';
  if (position === 2 && /^blog$/i.test(name)) return BASE_URL + '/blog/';
  if (position === 2 && /ciudades|cities/i.test(name)) return BASE_URL + '/cities/';
  if (position === 2 && /lugares|places/i.test(name)) return BASE_URL + '/places/';
  if (position === 2 && /eventos|events/i.test(name)) return BASE_URL + '/events/';
  // Para la última posición (suele ser la página actual), usar canonical
  return getCanonicalUrl(html, file);
}

const files = walk(ROOT);
const issues = [];
let parseErrors = 0;
let fixed = 0;

for (const f of files) {
  let html;
  try {
    html = fs.readFileSync(f, 'utf8');
  } catch (e) {
    continue;
  }
  const blocks = extractJsonLd(html);
  if (blocks.length === 0) continue;

  let fileChanged = false;
  let newHtml = html;

  for (const block of blocks) {
    let data;
    try {
      data = JSON.parse(block.raw);
    } catch (e) {
      parseErrors++;
      continue;
    }

    const before = issues.length;
    checkBreadcrumb(data, issues, f);
    const found = issues.slice(before);

    if (FIX_MODE && found.length > 0) {
      // Auto-fix: traverse and add item where missing
      const fixSchema = (d) => {
        if (Array.isArray(d)) { d.forEach(fixSchema); return; }
        if (d && typeof d === 'object') {
          if (d['@type'] === 'BreadcrumbList' && Array.isArray(d.itemListElement)) {
            d.itemListElement.forEach((el, i) => {
              if (!el.item) {
                el.item = inferItemUrl(f, el.position || i + 1, el.name || '', html);
                fixed++;
              }
            });
          }
          if (Array.isArray(d['@graph'])) d['@graph'].forEach(fixSchema);
        }
      };
      fixSchema(data);
      const newJson = JSON.stringify(data, null, 2);
      newHtml = newHtml.slice(0, block.start) +
        `<script type="application/ld+json">\n${newJson}\n</script>` +
        newHtml.slice(block.start + block.length);
      fileChanged = true;
    }
  }

  if (fileChanged) fs.writeFileSync(f, newHtml);
}

// Group by file
const byFile = {};
for (const i of issues) {
  byFile[i.file] = byFile[i.file] || [];
  byFile[i.file].push(i);
}

const fileCount = Object.keys(byFile).length;

console.log(`\n═══ BreadcrumbList Audit ═══`);
console.log(`Files scanned: ${files.length}`);
console.log(`Parse errors: ${parseErrors}`);
console.log(`Files with issues: ${fileCount}`);
console.log(`Total missing 'item' fields: ${issues.length}`);

if (FIX_MODE) {
  console.log(`Auto-fixed: ${fixed} entries`);
}

if (fileCount > 0 && fileCount <= 50) {
  console.log(`\nFiles affected:`);
  for (const [file, list] of Object.entries(byFile)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    console.log(`  ${rel}  →  ${list.length} missing`);
    list.slice(0, 3).forEach(l => console.log(`     pos=${l.position} name="${l.name}"`));
  }
}

process.exit(fileCount > 0 && !FIX_MODE ? 1 : 0);
