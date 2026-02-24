const fs = require('fs');
const path = require('path');

const citiesDir = path.join(__dirname, 'cities');

// LATAM cities -> hreflang code mapping
const latamHreflang = {
  'mexico-city': 'es-MX',
  'buenos-aires': 'es-AR',
  'bogota': 'es-CO',
  'medellin': 'es-CO',
  'lima': 'es-PE',
  'quito': 'es-EC',
  'santiago': 'es-CL',
  'montevideo': 'es-UY',
  'guadalajara': 'es-MX',
  'sao-paulo': 'pt-BR',
  'lisbon': 'pt-PT',
  'cordoba': 'es-AR',
};

// Spanish cities that need es-ES hreflang
const spainCities = [
  'madrid', 'barcelona', 'sevilla', 'valencia', 'bilbao', 'malaga',
  'granada', 'alicante', 'murcia', 'zaragoza', 'cadiz', 'oviedo',
  'palma', 'pamplona', 'san-sebastian', 'santander', 'salamanca',
  'coruna', 'vigo', 'tenerife', 'las-palmas',
];

// Read all .html files in cities/ except index.html
const files = fs.readdirSync(citiesDir).filter(f => f.endsWith('.html') && f !== 'index.html');

console.log(`Found ${files.length} city files to process.\n`);

let totalChanges = 0;

files.forEach(file => {
  const filePath = path.join(citiesDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');
  const originalHtml = html;
  const slug = file.replace('.html', '');
  const changes = [];

  // 1. Fix canonical URL: remove .html
  const canonicalRegex = /(<link\s+rel="canonical"\s+href="https:\/\/www\.correrjuntos\.com\/cities\/[^"]+?)\.html(")/;
  if (canonicalRegex.test(html)) {
    html = html.replace(canonicalRegex, '$1$2');
    changes.push('Fixed canonical URL (removed .html)');
  }

  // 2. Fix hreflang URLs: remove .html from all hreflang href values in /cities/
  const hreflangRegex = /(<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="https:\/\/www\.correrjuntos\.com\/cities\/[^"]+?)\.html(")/g;
  const hreflangBefore = html;
  html = html.replace(hreflangRegex, '$1$2');
  if (html !== hreflangBefore) {
    changes.push('Fixed hreflang URLs (removed .html)');
  }

  // 3. Fix breadcrumb schema URLs: remove .html from last BreadcrumbList item
  // Match the pattern in JSON-LD where a ListItem has item with .html in /cities/
  const breadcrumbRegex = /("item":\s*"https:\/\/www\.correrjuntos\.com\/cities\/[^"]+?)\.html(")/g;
  const breadcrumbBefore = html;
  html = html.replace(breadcrumbRegex, '$1$2');
  if (html !== breadcrumbBefore) {
    changes.push('Fixed breadcrumb schema URL (removed .html)');
  }

  // 4. Fix WebPage @id and url: remove .html
  // @id
  const webpageIdRegex = /("@id":\s*"https:\/\/www\.correrjuntos\.com\/cities\/[^"]+?)\.html(")/g;
  const idBefore = html;
  html = html.replace(webpageIdRegex, '$1$2');
  if (html !== idBefore) {
    changes.push('Fixed WebPage @id (removed .html)');
  }

  // url
  const webpageUrlRegex = /("url":\s*"https:\/\/www\.correrjuntos\.com\/cities\/[^"]+?)\.html(")/g;
  const urlBefore = html;
  html = html.replace(webpageUrlRegex, '$1$2');
  if (html !== urlBefore) {
    changes.push('Fixed WebPage url (removed .html)');
  }

  // 5. Upgrade Schema: SportsActivityLocation -> SportsClub
  if (html.includes('"@type": "SportsActivityLocation"')) {
    html = html.replace('"@type": "SportsActivityLocation"', '"@type": "SportsClub"');
    changes.push('Upgraded schema @type: SportsActivityLocation -> SportsClub');
  }

  // 6. Add LATAM-specific hreflang (before existing hreflang="es")
  if (latamHreflang[slug]) {
    const hreflangCode = latamHreflang[slug];
    const canonicalUrl = `https://www.correrjuntos.com/cities/${slug}`;
    const newTag = `<link rel="alternate" hreflang="${hreflangCode}" href="${canonicalUrl}">`;

    // Check if this specific hreflang already exists
    if (!html.includes(`hreflang="${hreflangCode}"`)) {
      // Insert before the existing hreflang="es" line
      const esHreflangPattern = /(<link\s+rel="alternate"\s+hreflang="es"\s+href="[^"]*">)/;
      if (esHreflangPattern.test(html)) {
        html = html.replace(esHreflangPattern, newTag + '\n$1');
        changes.push(`Added LATAM hreflang="${hreflangCode}"`);
      }
    } else {
      changes.push(`LATAM hreflang="${hreflangCode}" already exists (skipped)`);
    }
  }

  // 7. Add Spain-specific hreflang="es-ES" (before existing hreflang="es")
  if (spainCities.includes(slug)) {
    const canonicalUrl = `https://www.correrjuntos.com/cities/${slug}`;
    const newTag = `<link rel="alternate" hreflang="es-ES" href="${canonicalUrl}">`;

    if (!html.includes('hreflang="es-ES"')) {
      const esHreflangPattern = /(<link\s+rel="alternate"\s+hreflang="es"\s+href="[^"]*">)/;
      if (esHreflangPattern.test(html)) {
        html = html.replace(esHreflangPattern, newTag + '\n$1');
        changes.push('Added Spain hreflang="es-ES"');
      }
    } else {
      changes.push('Spain hreflang="es-ES" already exists (skipped)');
    }
  }

  // Write file if changed
  if (html !== originalHtml) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[UPDATED] ${file}:`);
    changes.forEach(c => console.log(`  - ${c}`));
    totalChanges += changes.length;
  } else {
    console.log(`[NO CHANGES] ${file}`);
  }
});

console.log(`\nDone! Total changes made across ${files.length} files: ${totalChanges}`);
