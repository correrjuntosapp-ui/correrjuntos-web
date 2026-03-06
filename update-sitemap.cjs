/**
 * update-sitemap.cjs
 * Adds missing URLs to sitemap.xml:
 *   - 59 individual city pages
 *   - /places/ index + 30 place pages
 *   - /events/ index + 15 event pages
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const SITEMAP = path.join(BASE_DIR, 'sitemap.xml');
const TODAY = new Date().toISOString().split('T')[0];

let xml = fs.readFileSync(SITEMAP, 'utf-8');

// ── Collect existing URLs ──
const existingUrls = new Set();
const locRegex = /<loc>([^<]+)<\/loc>/g;
let match;
while ((match = locRegex.exec(xml)) !== null) {
  existingUrls.add(match[1]);
}

// ── Collect new URLs ──
const newUrls = [];

function addUrl(loc, priority) {
  if (!existingUrls.has(loc)) {
    newUrls.push({ loc, priority });
  }
}

// 1. Individual city pages
const citiesDir = path.join(BASE_DIR, 'cities');
const cityFiles = fs.readdirSync(citiesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
cityFiles.forEach(f => {
  const slug = f.replace('.html', '');
  addUrl(`https://www.correrjuntos.com/cities/${slug}`, '0.7');
});

// 2. Places index + individual place pages
const placesDir = path.join(BASE_DIR, 'places');
if (fs.existsSync(placesDir)) {
  addUrl('https://www.correrjuntos.com/places/', '0.8');
  const placeFiles = fs.readdirSync(placesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  placeFiles.forEach(f => {
    const slug = f.replace('.html', '');
    addUrl(`https://www.correrjuntos.com/places/${slug}`, '0.6');
  });
}

// 3. Events index + individual event pages
const eventsDir = path.join(BASE_DIR, 'events');
if (fs.existsSync(eventsDir)) {
  addUrl('https://www.correrjuntos.com/events/', '0.8');
  const eventFiles = fs.readdirSync(eventsDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  eventFiles.forEach(f => {
    const slug = f.replace('.html', '');
    addUrl(`https://www.correrjuntos.com/events/${slug}`, '0.6');
  });
}

// ── Insert before closing </urlset> ──
if (newUrls.length > 0) {
  const newEntries = newUrls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('');

  const sections = `
  <!-- ====== CITIES (individual) ====== -->${newUrls.filter(u => u.loc.includes('/cities/')).map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('')}

  <!-- ====== PLACES ====== -->${newUrls.filter(u => u.loc.includes('/places/')).map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('')}

  <!-- ====== EVENTS ====== -->${newUrls.filter(u => u.loc.includes('/events/')).map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('')}`;

  xml = xml.replace('</urlset>', sections + '\n</urlset>');
  fs.writeFileSync(SITEMAP, xml, 'utf-8');
}

console.log('\n=== Sitemap Update Results ===');
console.log(`Existing URLs: ${existingUrls.size}`);
console.log(`New URLs added: ${newUrls.length}`);
console.log(`  Cities: ${newUrls.filter(u => u.loc.includes('/cities/')).length}`);
console.log(`  Places: ${newUrls.filter(u => u.loc.includes('/places/')).length}`);
console.log(`  Events: ${newUrls.filter(u => u.loc.includes('/events/')).length}`);
console.log(`Total URLs: ${existingUrls.size + newUrls.length}`);
