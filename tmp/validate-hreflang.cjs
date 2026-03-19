const fs = require('fs');

function parseSitemap(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const entries = [];
  const urlBlocks = xml.split('<url>').slice(1);
  for (const block of urlBlocks) {
    const locM = block.match(/<loc>([^<]+)<\/loc>/);
    if (locM === null) continue;
    const loc = locM[1];
    const alts = [...block.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)];
    const alternates = {};
    for (const [, lang, href] of alts) alternates[lang] = href;
    if (Object.keys(alternates).length > 0) entries.push({ loc, alternates });
  }
  return entries;
}

const es = parseSitemap('sitemap-blog-es.xml');
const en = parseSitemap('sitemap-blog-en.xml');
const all = [...es, ...en];
const map = {};
for (const e of all) map[e.loc] = e.alternates;

let errors = 0;
let checked = 0;

for (const e of all) {
  const loc = e.loc;
  for (const [lang, href] of Object.entries(e.alternates)) {
    if (lang === 'x-default') continue;
    if (href === loc) continue; // self-ref
    checked++;
    const target = map[href];
    if (target) {
      const selfLang = loc.includes('/blog/en/') ? 'en' : 'es';
      const backRef = target[selfLang];
      if (backRef !== loc) {
        console.log('RECIPROCITY FAIL:');
        console.log('  ' + loc + ' -> [' + lang + '] ' + href);
        console.log('  back: [' + selfLang + '] ' + (backRef || 'MISSING'));
        errors++;
      }
    }
  }
}

console.log('\nChecked ' + checked + ' cross-references');
console.log('Reciprocity errors: ' + errors);
console.log('Entries with hreflang: ES=' + es.length + ', EN=' + en.length);
