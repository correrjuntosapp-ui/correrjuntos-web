/**
 * upgrade-city-schema.cjs
 * Upgrades JSON-LD schema across all 59 city pages:
 *   1. Adds Organization + WebSite (self-contained @id resolution)
 *   2. Adds isPartOf/about to WebPage
 *   3. Replaces SportsClub with City entity
 *   4. Adds CollectionPage + ItemList (only for cities with places/events)
 *   5. Adds @id to BreadcrumbList, FAQPage
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const CITIES_DIR = path.join(BASE_DIR, 'cities');

// ── City → Places mapping (slugs of places that belong to each city) ──
const CITY_PLACES = {
  madrid: ['retiro', 'casa-de-campo', 'madrid-rio', 'parque-juan-carlos', 'parque-del-oeste'],
  barcelona: ['montjuic', 'serra-de-collserola', 'parc-de-la-ciutadella'],
  valencia: ['parque-del-turia'],
  sevilla: ['parque-del-alamillo', 'parque-de-maria-luisa'],
  'new-york': ['central-park'],
  london: ['hyde-park', 'regents-park'],
  'san-francisco': ['golden-gate-park'],
  amsterdam: ['vondelpark'],
  paris: ['bois-de-boulogne'],
  berlin: ['tiergarten'],
  copenhagen: ['botanisk-have'],
  rome: ['villa-borghese'],
  munich: ['englischer-garten'],
  dublin: ['phoenix-park'],
  'los-angeles': ['griffith-park'],
  vancouver: ['stanley-park'],
  'sao-paulo': ['ibirapuera'],
  'mexico-city': ['chapultepec'],
  quito: ['parque-carolina'],
  'buenos-aires': ['parque-del-este'],
  melbourne: ['kings-park'],
  singapore: ['gardens-by-the-bay']
};

// ── Cities that will have /events/ pages ──
const CITIES_WITH_EVENTS = [
  'madrid', 'barcelona', 'valencia', 'sevilla', 'malaga',
  'london', 'new-york', 'paris', 'berlin', 'amsterdam',
  'rome', 'dublin', 'mexico-city', 'buenos-aires', 'lisbon'
];

// ── Global schema nodes ──
const ORG_NODE = {
  '@type': 'SportsOrganization',
  '@id': 'https://www.correrjuntos.com/#organization',
  name: 'CorrerJuntos',
  url: 'https://www.correrjuntos.com/',
  sport: 'Running',
  logo: { '@type': 'ImageObject', url: 'https://www.correrjuntos.com/icons/icon-512.png' },
  sameAs: [
    'https://www.instagram.com/correrjuntosapp/',
    'https://x.com/CorrerJuntos',
    'https://www.tiktok.com/@correrjuntosapp'
  ]
};

const WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': 'https://www.correrjuntos.com/#website',
  url: 'https://www.correrjuntos.com/',
  name: 'CorrerJuntos',
  publisher: { '@id': 'https://www.correrjuntos.com/#organization' },
  inLanguage: 'es'
};

let upgraded = 0;
let skipped = 0;
let errors = 0;

const files = fs.readdirSync(CITIES_DIR)
  .filter(f => f.endsWith('.html') && f !== 'index.html');

files.forEach(fileName => {
  const filePath = path.join(CITIES_DIR, fileName);
  const citySlug = fileName.replace('.html', '');

  let html = fs.readFileSync(filePath, 'utf-8');

  // Extract JSON-LD block
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!jsonLdMatch) {
    console.log(`SKIP (no JSON-LD): ${fileName}`);
    skipped++;
    return;
  }

  let schema;
  try {
    schema = JSON.parse(jsonLdMatch[1]);
  } catch (e) {
    console.log(`ERROR (invalid JSON): ${fileName} — ${e.message}`);
    errors++;
    return;
  }

  const graph = schema['@graph'];
  if (!graph || !Array.isArray(graph)) {
    console.log(`SKIP (no @graph): ${fileName}`);
    skipped++;
    return;
  }

  // Already upgraded?
  if (graph.some(n => n['@type'] === 'City')) {
    console.log(`SKIP (already upgraded): ${fileName}`);
    skipped++;
    return;
  }

  // ── Extract existing entities ──
  const webPage = graph.find(n => n['@type'] === 'WebPage');
  const breadcrumb = graph.find(n => n['@type'] === 'BreadcrumbList');
  const sportsClub = graph.find(n => n['@type'] === 'SportsClub');
  const faqPage = graph.find(n => n['@type'] === 'FAQPage');

  if (!webPage || !sportsClub) {
    console.log(`SKIP (missing WebPage or SportsClub): ${fileName}`);
    skipped++;
    return;
  }

  // Extract canonical URL
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : `https://www.correrjuntos.com/cities/${citySlug}`;

  // Extract city data from SportsClub
  const addressLocality = sportsClub.address?.addressLocality || citySlug;
  const addressCountry = sportsClub.address?.addressCountry || 'ES';

  // ── Build new @graph ──
  const newGraph = [];

  // 1. Organization
  newGraph.push(ORG_NODE);

  // 2. WebSite
  newGraph.push(WEBSITE_NODE);

  // 3. WebPage (enhanced)
  const enhancedWebPage = { ...webPage };
  enhancedWebPage['@id'] = canonicalUrl + '#webpage';
  enhancedWebPage.isPartOf = { '@id': 'https://www.correrjuntos.com/#website' };
  enhancedWebPage.about = { '@id': 'https://www.correrjuntos.com/#organization' };
  newGraph.push(enhancedWebPage);

  // 4. City (replaces SportsClub)
  newGraph.push({
    '@type': 'City',
    name: addressLocality,
    address: {
      '@type': 'PostalAddress',
      addressLocality: addressLocality,
      addressCountry: addressCountry
    }
  });

  // 5. CollectionPage + ItemList (only if city has places or events)
  const places = CITY_PLACES[citySlug] || [];
  const hasEvents = CITIES_WITH_EVENTS.includes(citySlug);

  if (places.length > 0 || hasEvents) {
    const itemListElements = [];
    let pos = 1;

    places.forEach(placeSlug => {
      itemListElements.push({
        '@type': 'ListItem',
        position: pos++,
        name: placeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        url: `https://www.correrjuntos.com/places/${placeSlug}`
      });
    });

    if (hasEvents) {
      itemListElements.push({
        '@type': 'ListItem',
        position: pos++,
        name: `Eventos de running en ${addressLocality}`,
        url: `https://www.correrjuntos.com/events/${citySlug}`
      });
    }

    newGraph.push({
      '@type': 'CollectionPage',
      name: `Running en ${addressLocality}`,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: itemListElements
      }
    });
  }

  // 6. BreadcrumbList (with @id)
  if (breadcrumb) {
    const bc = { ...breadcrumb };
    bc['@id'] = canonicalUrl + '#breadcrumbs';
    newGraph.push(bc);
  }

  // 7. FAQPage (with @id, only if has questions)
  if (faqPage && faqPage.mainEntity && Array.isArray(faqPage.mainEntity) && faqPage.mainEntity.length > 0) {
    const faq = { ...faqPage };
    faq['@id'] = canonicalUrl + '#faq';
    newGraph.push(faq);
  }

  // ── Write back ──
  const newSchema = { '@context': 'https://schema.org', '@graph': newGraph };
  const newJsonLd = JSON.stringify(newSchema, null, 2);
  const newBlock = `<script type="application/ld+json">\n${newJsonLd}\n</script>`;

  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, newBlock);
  fs.writeFileSync(filePath, html, 'utf-8');
  upgraded++;
  console.log(`OK: ${fileName} (${places.length} places, events: ${hasEvents})`);
});

console.log('\n=== City Schema Upgrade Results ===');
console.log(`Upgraded: ${upgraded}`);
console.log(`Skipped:  ${skipped}`);
console.log(`Errors:   ${errors}`);
console.log(`Total:    ${upgraded + skipped + errors}`);
