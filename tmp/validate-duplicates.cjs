const fs = require('fs');
const allUrls = [];
const sitemaps = [
  'sitemap-blog-es.xml', 'sitemap-blog-en.xml', 'sitemap-cities.xml',
  'sitemap-places.xml', 'sitemap-events.xml', 'sitemap-equipamiento.xml', 'sitemap-pages.xml'
];
for (const file of sitemaps) {
  const xml = fs.readFileSync(file, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  for (const url of locs) allUrls.push({ url, file });
}
const seen = {};
let dupes = 0;
for (const { url, file } of allUrls) {
  if (seen[url]) {
    console.log('DUPLICATE: ' + url);
    console.log('  in: ' + seen[url] + ' AND ' + file);
    dupes++;
  }
  seen[url] = file;
}
// Check trailing slash consistency for blog article URLs
let slashIssues = 0;
for (const { url } of allUrls) {
  if (url.match(/\/blog\/.+\/.+/) && url.endsWith('/') && !url.includes('categoria') && !url.includes('category')) {
    console.log('TRAILING SLASH on article: ' + url);
    slashIssues++;
  }
}
console.log('\nTotal URLs: ' + allUrls.length);
console.log('Duplicates: ' + dupes);
console.log('Article trailing slash issues: ' + slashIssues);
