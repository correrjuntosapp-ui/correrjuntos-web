// Replace broken Amazon CDN image URLs in blog articles
// Uses verified hires URLs from asin-hires-map.json + Pexels fallbacks
const fs = require('fs');
const path = require('path');

const broken = JSON.parse(fs.readFileSync('broken-asin.json', 'utf8'));
const asinMap = JSON.parse(fs.readFileSync('asin-hires-map.json', 'utf8'));

// Pexels fallbacks por categoría — free CC0 verified
const pexelsFallback = {
  shoe: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=600',
  apparel: 'https://images.pexels.com/photos/2017827/pexels-photo-2017827.jpeg?auto=compress&cs=tinysrgb&w=600',
  watch: 'https://images.pexels.com/photos/4549408/pexels-photo-4549408.jpeg?auto=compress&cs=tinysrgb&w=600',
  audio: 'https://images.pexels.com/photos/3776811/pexels-photo-3776811.jpeg?auto=compress&cs=tinysrgb&w=600',
  nutrition: 'https://images.pexels.com/photos/4498563/pexels-photo-4498563.jpeg?auto=compress&cs=tinysrgb&w=600',
  trail: 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=600',
  generic: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600'
};

function categorize(alt, url) {
  const a = (alt || '').toLowerCase();
  if (/zapatill|shoe|hoka|salomon|nike|asics|brooks|saucony|new balance|vomero|speedcross|speedgoat|clifton|nimbus|patriot|excite|pegasus/i.test(a)) return 'shoe';
  if (/garmin|coros|polar|suunto|amazfit|reloj|watch|gps/i.test(a)) return 'watch';
  if (/auricular|headphone|jbl|shokz|earbud|edifier|airpod/i.test(a)) return 'audio';
  if (/gel|nutrition|maurten|isotonic|electrolyte|sis|gu energy|powerbar/i.test(a)) return 'nutrition';
  if (/trail|montaña|sierra|mountain|outdoor|petzl|black diamond|baston|frontal|chaleco|hidratacion/i.test(a)) return 'trail';
  if (/sujetador|calcetin|short|camiset|mall|bra|sock|jersey|gore|wear|cinturon|ronhill|portad|nathan|grip|callera|gafa|bodyglide|antirroz/i.test(a)) return 'apparel';
  return 'generic';
}

const replacements = new Map(); // oldUrl → newUrl
const stats = { byAsin: 0, byPexels: 0, byCategory: {} };

for (const item of broken) {
  if (!item.url) continue;
  let newUrl;
  if (item.asin && asinMap[item.asin]) {
    newUrl = asinMap[item.asin];
    stats.byAsin++;
  } else {
    const cat = categorize(item.alt, item.url);
    newUrl = pexelsFallback[cat];
    stats.byPexels++;
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
  }
  replacements.set(item.url, newUrl);
}

console.log(`Aplicar ${replacements.size} reemplazos:`);
console.log(`  ${stats.byAsin} con ASIN verificado (foto producto real)`);
console.log(`  ${stats.byPexels} con Pexels fallback (foto temática):`);
for (const [cat, n] of Object.entries(stats.byCategory)) console.log(`    - ${cat}: ${n}`);
console.log('');

// Apply across all blog HTML files (some URLs appear in multiple)
function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.html')) files.push(p);
  }
  return files;
}

let totalChanged = 0;
let totalReplacements = 0;
for (const file of walk('blog')) {
  let txt = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const [oldUrl, newUrl] of replacements) {
    if (txt.includes(oldUrl)) {
      const matches = txt.split(oldUrl).length - 1;
      txt = txt.split(oldUrl).join(newUrl);
      count += matches;
    }
  }
  if (count > 0) {
    fs.writeFileSync(file, txt);
    console.log(`  ${count} fix → ${file}`);
    totalChanged++;
    totalReplacements += count;
  }
}

console.log(`\n✓ ${totalChanged} archivos modificados, ${totalReplacements} URLs sustituidas`);
