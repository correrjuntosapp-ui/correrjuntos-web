/**
 * Add language-specific hreflang to city pages based on city's language region.
 * - English-speaking cities: add hreflang="en"
 * - Portuguese-speaking cities: add hreflang="pt"
 * - Latin American Spanish cities: add hreflang="es-419"
 */
const fs = require('fs');
const path = require('path');

const englishCities = [
  'austin', 'chicago', 'dublin', 'edinburgh', 'london',
  'los-angeles', 'manchester', 'melbourne', 'new-york',
  'san-francisco', 'singapore', 'sydney', 'toronto', 'vancouver'
];

const portugueseCities = ['lisbon', 'sao-paulo'];

const latamCities = [
  'bogota', 'buenos-aires', 'guadalajara', 'lima',
  'medellin', 'mexico-city', 'montevideo', 'quito', 'santiago'
];

const citiesDir = path.join(__dirname, 'cities');
let count = 0;

fs.readdirSync(citiesDir).filter(f => f.endsWith('.html') && f !== 'index.html').forEach(file => {
  const slug = file.replace('.html', '');
  const filePath = path.join(citiesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const url = `https://www.correrjuntos.com/cities/${file}`;

  let newTag = '';

  if (englishCities.includes(slug)) {
    if (html.includes('hreflang="en"')) return;
    newTag = `<link rel="alternate" hreflang="en" href="${url}">`;
  } else if (portugueseCities.includes(slug)) {
    if (html.includes('hreflang="pt"')) return;
    newTag = `<link rel="alternate" hreflang="pt" href="${url}">`;
  } else if (latamCities.includes(slug)) {
    if (html.includes('hreflang="es-419"')) return;
    newTag = `<link rel="alternate" hreflang="es-419" href="${url}">`;
  } else {
    return; // European cities already covered by es + x-default
  }

  // Insert after the x-default hreflang line
  html = html.replace(
    /(<link rel="alternate" hreflang="x-default"[^>]*>)/,
    `$1\n    ${newTag}`
  );

  fs.writeFileSync(filePath, html, 'utf8');
  count++;
  console.log(`  ${slug}: ${newTag.match(/hreflang="([^"]+)"/)[1]}`);
});

console.log(`\n✓ Added regional hreflang to ${count} city pages`);
