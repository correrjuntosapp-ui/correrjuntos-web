const fs = require('fs');
const basePath = 'C:/Users/guett/OneDrive/Escritorio/correrjuntosV2';

function parseSitemap(content) {
  const entries = [];
  const urlBlocks = content.split('<url>').slice(1);
  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) continue;
    const loc = locMatch[1];
    const hreflangs = {};
    const linkRegex = /xhtml:link[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g;
    let m;
    while ((m = linkRegex.exec(block)) !== null) {
      hreflangs[m[1]] = m[2];
    }
    entries.push({ loc, hreflangs });
  }
  return entries;
}

const esEntries = parseSitemap(fs.readFileSync(basePath + '/sitemap-blog-es.xml', 'utf8'));
const enEntries = parseSitemap(fs.readFileSync(basePath + '/sitemap-blog-en.xml', 'utf8'));

const esMap = new Map();
const enMap = new Map();
esEntries.forEach(e => esMap.set(e.loc, e));
enEntries.forEach(e => enMap.set(e.loc, e));

const esWithH = esEntries.filter(e => Object.keys(e.hreflangs).length > 0);
const esNoH = esEntries.filter(e => Object.keys(e.hreflangs).length === 0);
const enWithH = enEntries.filter(e => Object.keys(e.hreflangs).length > 0);
const enNoH = enEntries.filter(e => Object.keys(e.hreflangs).length === 0);

console.log('=== TOTALS ===');
console.log('ES sitemap: ' + esEntries.length + ' URLs (' + esWithH.length + ' with hreflang, ' + esNoH.length + ' without)');
console.log('EN sitemap: ' + enEntries.length + ' URLs (' + enWithH.length + ' with hreflang, ' + enNoH.length + ' without)');

// CHECK 1: ES->EN reciprocity
console.log('\n=== CHECK 1: ES->EN RECIPROCITY ===');
const c1Fails = [];
const c1Orphans = [];
for (const entry of esWithH) {
  const enUrl = entry.hreflangs['en'];
  if (!enUrl) continue;
  const enEntry = enMap.get(enUrl);
  if (!enEntry) {
    c1Orphans.push(entry.loc + ' -> ' + enUrl);
    continue;
  }
  const backEs = enEntry.hreflangs['es'];
  if (backEs !== entry.loc) {
    c1Fails.push(entry.loc + ' -> ' + enUrl + ' -> back: ' + (backEs || '(none)'));
  }
}
console.log('ES with EN alternate: ' + esWithH.filter(e => e.hreflangs['en']).length);
console.log('Reciprocity failures: ' + c1Fails.length);
c1Fails.forEach(f => console.log('  FAIL: ' + f));
console.log('Orphans (EN URL not in EN sitemap): ' + c1Orphans.length);
c1Orphans.forEach(o => console.log('  ORPHAN: ' + o));

// CHECK 2: EN->ES reciprocity
console.log('\n=== CHECK 2: EN->ES RECIPROCITY ===');
const c2Fails = [];
const c2Orphans = [];
for (const entry of enWithH) {
  const esUrl = entry.hreflangs['es'];
  if (!esUrl) continue;
  const esEntry = esMap.get(esUrl);
  if (!esEntry) {
    c2Orphans.push(entry.loc + ' -> ' + esUrl);
    continue;
  }
  const backEn = esEntry.hreflangs['en'];
  if (backEn !== entry.loc) {
    c2Fails.push(entry.loc + ' -> ' + esUrl + ' -> back: ' + (backEn || '(none)'));
  }
}
console.log('EN with ES alternate: ' + enWithH.filter(e => e.hreflangs['es']).length);
console.log('Reciprocity failures: ' + c2Fails.length);
c2Fails.forEach(f => console.log('  FAIL: ' + f));
console.log('Orphans (ES URL not in ES sitemap): ' + c2Orphans.length);
c2Orphans.forEach(o => console.log('  ORPHAN: ' + o));

// CHECK 3: Self-referencing
console.log('\n=== CHECK 3: SELF-REFERENCING HREFLANG ===');
const esMissingSelf = esWithH.filter(e => e.hreflangs['es'] !== e.loc);
const enMissingSelf = enWithH.filter(e => e.hreflangs['en'] !== e.loc);
console.log('ES missing self-ref: ' + esMissingSelf.length);
esMissingSelf.forEach(e => console.log('  ' + e.loc + ' (es=' + (e.hreflangs['es'] || 'none') + ')'));
console.log('EN missing self-ref: ' + enMissingSelf.length);
enMissingSelf.forEach(e => console.log('  ' + e.loc + ' (en=' + (e.hreflangs['en'] || 'none') + ')'));

// CHECK 4: x-default
console.log('\n=== CHECK 4: X-DEFAULT ===');
const esMissingXD = esWithH.filter(e => !e.hreflangs['x-default']);
const esWrongXD = esWithH.filter(e => e.hreflangs['x-default'] && e.hreflangs['x-default'] !== e.loc);
const enMissingXD = enWithH.filter(e => !e.hreflangs['x-default']);
const enWrongXD = enWithH.filter(e => e.hreflangs['x-default'] && e.hreflangs['x-default'] !== e.hreflangs['es']);
console.log('ES missing x-default: ' + esMissingXD.length);
esMissingXD.forEach(e => console.log('  ' + e.loc));
console.log('ES wrong x-default (should = own loc): ' + esWrongXD.length);
esWrongXD.forEach(e => console.log('  ' + e.loc + ' x-default=' + e.hreflangs['x-default']));
console.log('EN missing x-default: ' + enMissingXD.length);
enMissingXD.forEach(e => console.log('  ' + e.loc));
console.log('EN wrong x-default (should = ES url): ' + enWrongXD.length);
enWrongXD.forEach(e => console.log('  ' + e.loc + ' x-default=' + e.hreflangs['x-default'] + ' es=' + e.hreflangs['es']));

// CHECK 5: ES subdirectory without hreflang
console.log('\n=== CHECK 5: ES SUBDIRECTORY ENTRIES WITHOUT HREFLANG ===');
const esSubdirs = ['entrenamiento/', 'equipamiento/', 'running/', 'zapatillas/', 'atletas-hibridos/'];
let totalEsSub = 0;
for (const sd of esSubdirs) {
  const matches = esNoH.filter(e => e.loc.includes('/blog/' + sd));
  if (matches.length > 0) {
    console.log('  ' + sd + ': ' + matches.length + ' URLs');
    matches.forEach(m => console.log('    ' + m.loc));
    totalEsSub += matches.length;
  }
}
const esOther = esNoH.filter(e => !esSubdirs.some(sd => e.loc.includes('/blog/' + sd)));
console.log('Total ES subdirectory without hreflang: ' + totalEsSub);
if (esOther.length) {
  console.log('ES non-subdirectory without hreflang: ' + esOther.length);
  esOther.forEach(e => console.log('  ' + e.loc));
}

// CHECK 6: EN subdirectory without hreflang
console.log('\n=== CHECK 6: EN SUBDIRECTORY ENTRIES WITHOUT HREFLANG ===');
const enSubdirs = ['categoria/', 'category/', 'equipment/', 'hybrid-athletes/', 'running-shoes/', 'running/'];
let totalEnSub = 0;
for (const sd of enSubdirs) {
  const matches = enNoH.filter(e => e.loc.includes('/blog/en/' + sd));
  if (matches.length > 0) {
    console.log('  ' + sd + ': ' + matches.length + ' URLs');
    matches.forEach(m => console.log('    ' + m.loc));
    totalEnSub += matches.length;
  }
}
const enOther = enNoH.filter(e => !enSubdirs.some(sd => e.loc.includes('/blog/en/' + sd)));
console.log('Total EN subdirectory without hreflang: ' + totalEnSub);
if (enOther.length) {
  console.log('EN non-subdirectory without hreflang: ' + enOther.length);
  enOther.forEach(e => console.log('  ' + e.loc));
}

// FINAL SUMMARY
console.log('\n========== FINAL SUMMARY ==========');
console.log('Total URLs audited: ' + (esEntries.length + enEntries.length));
console.log('ES sitemap: ' + esEntries.length + ' (' + esWithH.length + ' hreflang, ' + esNoH.length + ' bare)');
console.log('EN sitemap: ' + enEntries.length + ' (' + enWithH.length + ' hreflang, ' + enNoH.length + ' bare)');
console.log('---');
console.log('ES->EN reciprocity failures: ' + c1Fails.length);
console.log('EN->ES reciprocity failures: ' + c2Fails.length);
console.log('ES->EN orphans: ' + c1Orphans.length);
console.log('EN->ES orphans: ' + c2Orphans.length);
console.log('Missing self-ref ES: ' + esMissingSelf.length);
console.log('Missing self-ref EN: ' + enMissingSelf.length);
console.log('Missing x-default ES: ' + esMissingXD.length);
console.log('Missing x-default EN: ' + enMissingXD.length);
console.log('Wrong x-default ES: ' + esWrongXD.length);
console.log('Wrong x-default EN: ' + enWrongXD.length);
console.log('ES subdirectory bare (no hreflang): ' + totalEsSub);
console.log('EN subdirectory bare (no hreflang): ' + totalEnSub);
