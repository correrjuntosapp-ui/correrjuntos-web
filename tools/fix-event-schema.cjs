/**
 * fix-event-schema.cjs
 * Añade Event schema (image + offers) a todas las páginas /events/*.html
 * Soluciona las advertencias de Google Search Console
 */
const fs = require('fs');
const path = require('path');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

// Datos por ciudad: evento principal del año con image, offers y location
const CITY_DATA = {
  'madrid': {
    event: 'Maratón Rock \'n\' Roll Madrid',
    description: 'Carrera de 42K y 10K por las calles de Madrid con 30.000+ participantes.',
    startDate: '2026-04-26T09:00:00',
    endDate: '2026-04-26T15:00:00',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Madrid Río, Madrid',
    locality: 'Madrid', country: 'ES',
    price: '55', currency: 'EUR',
    offerUrl: 'https://www.runrocknroll.com/es/madrid',
    organizer: 'Rock \'n\' Roll Running Series'
  },
  'barcelona': {
    event: 'Zurich Maratón de Barcelona',
    description: 'Maratón internacional de Barcelona, uno de los más rápidos de Europa con 20.000+ corredores.',
    startDate: '2026-03-15T08:30:00',
    endDate: '2026-03-15T14:30:00',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Plaça Espanya, Barcelona',
    locality: 'Barcelona', country: 'ES',
    price: '65', currency: 'EUR',
    offerUrl: 'https://www.zurichmaratobarcelona.es/',
    organizer: 'RocaCorp'
  },
  'valencia': {
    event: 'Valencia Maratón Trinidad Alfonso',
    description: 'Maratón élite en Valencia, curso rápido y plano ideal para récords personales.',
    startDate: '2026-12-06T09:00:00',
    endDate: '2026-12-06T16:00:00',
    image: 'https://images.unsplash.com/photo-1599207876610-d1f1c9f2e45e?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Alameda, Valencia',
    locality: 'Valencia', country: 'ES',
    price: '70', currency: 'EUR',
    offerUrl: 'https://www.valenciamarathon.es/',
    organizer: 'SD Correcaminos'
  },
  'sevilla': {
    event: 'Zurich Maratón de Sevilla',
    description: 'El maratón más rápido de España por las calles históricas de Sevilla.',
    startDate: '2026-02-22T09:00:00',
    endDate: '2026-02-22T15:00:00',
    image: 'https://images.unsplash.com/photo-1636060823063-fe90cc147c06?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Paseo de las Delicias, Sevilla',
    locality: 'Sevilla', country: 'ES',
    price: '60', currency: 'EUR',
    offerUrl: 'https://www.maratondesevilla.es/',
    organizer: 'Atletismo Sevilla'
  },
  'malaga': {
    event: 'Maratón Costa del Sol Málaga',
    description: 'Maratón y media maratón por el paseo marítimo de Málaga con vistas al Mediterráneo.',
    startDate: '2026-12-13T09:00:00',
    endDate: '2026-12-13T15:00:00',
    image: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Paseo del Parque, Málaga',
    locality: 'Málaga', country: 'ES',
    price: '40', currency: 'EUR',
    offerUrl: 'https://www.maratondecostadelsol.es/',
    organizer: 'Club Atletismo Málaga'
  },
  'london': {
    event: 'TCS London Marathon',
    description: 'One of the world\'s six Major marathons through iconic London landmarks.',
    startDate: '2026-04-26T09:00:00',
    endDate: '2026-04-26T17:00:00',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Blackheath, London',
    locality: 'London', country: 'GB',
    price: '50', currency: 'GBP',
    offerUrl: 'https://www.tcslondonmarathon.com/',
    organizer: 'London Marathon Events Ltd'
  },
  'paris': {
    event: 'Schneider Electric Marathon de Paris',
    description: 'Marathon de Paris passing through the Champs-Élysées and Bois de Boulogne.',
    startDate: '2026-04-05T08:00:00',
    endDate: '2026-04-05T15:00:00',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Avenue des Champs-Élysées, Paris',
    locality: 'Paris', country: 'FR',
    price: '145', currency: 'EUR',
    offerUrl: 'https://www.schneiderelectricparismarathon.com/',
    organizer: 'Amaury Sport Organisation'
  },
  'berlin': {
    event: 'BMW Berlin Marathon',
    description: 'World Marathon Major through Berlin\'s historic landmarks, world record course.',
    startDate: '2026-09-27T09:15:00',
    endDate: '2026-09-27T18:00:00',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Brandenburger Tor, Berlin',
    locality: 'Berlin', country: 'DE',
    price: '130', currency: 'EUR',
    offerUrl: 'https://www.bmw-berlin-marathon.com/',
    organizer: 'SCC Events'
  },
  'amsterdam': {
    event: 'TCS Amsterdam Marathon',
    description: 'Flat and fast marathon through Amsterdam\'s canals and Vondelpark.',
    startDate: '2026-10-18T:09:30:00',
    endDate: '2026-10-18T16:00:00',
    image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Olympisch Stadion, Amsterdam',
    locality: 'Amsterdam', country: 'NL',
    price: '90', currency: 'EUR',
    offerUrl: 'https://www.tcsamsterdammarathon.nl/',
    organizer: 'Le Champion'
  },
  'rome': {
    event: 'Acea Run Rome The Marathon',
    description: 'Marathon through Rome\'s historic monuments including the Colosseum and Circus Maximus.',
    startDate: '2026-03-22T08:30:00',
    endDate: '2026-03-22T16:00:00',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Via dei Fori Imperiali, Rome',
    locality: 'Rome', country: 'IT',
    price: '65', currency: 'EUR',
    offerUrl: 'https://www.runromethemarathon.com/',
    organizer: 'Run Rome'
  },
  'dublin': {
    event: 'Dublin City Marathon',
    description: 'Ireland\'s largest marathon through the streets of Dublin city centre.',
    startDate: '2026-10-25T09:00:00',
    endDate: '2026-10-25T17:00:00',
    image: 'https://images.unsplash.com/photo-1564959130747-897a8b079f73?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Fitzwilliam Street, Dublin',
    locality: 'Dublin', country: 'IE',
    price: '80', currency: 'EUR',
    offerUrl: 'https://www.dublincitymarathon.ie/',
    organizer: 'Dublin City Marathon Ltd'
  },
  'lisbon': {
    event: 'EDP Maratona de Lisboa',
    description: 'Point-to-point marathon from Cascais to Lisbon with stunning Atlantic views.',
    startDate: '2026-10-18T09:00:00',
    endDate: '2026-10-18T16:00:00',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Cascais, Lisboa',
    locality: 'Lisbon', country: 'PT',
    price: '55', currency: 'EUR',
    offerUrl: 'https://www.maratonadelisboa.com/',
    organizer: 'Sport Lisboa e Benfica'
  },
  'new-york': {
    event: 'TCS New York City Marathon',
    description: 'The world\'s largest marathon through all five boroughs of New York City.',
    startDate: '2026-11-01T08:00:00',
    endDate: '2026-11-01T18:00:00',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Fort Wadsworth, Staten Island, New York',
    locality: 'New York', country: 'US',
    price: '255', currency: 'USD',
    offerUrl: 'https://www.nyrr.org/tcsnycmarathon',
    organizer: 'New York Road Runners'
  },
  'mexico-city': {
    event: 'Maratón CDMX',
    description: 'Maratón de la Ciudad de México, la carrera más grande de América Latina con 30.000+ participantes.',
    startDate: '2026-08-30T06:00:00',
    endDate: '2026-08-30T14:00:00',
    image: 'https://images.unsplash.com/photo-1518659526054-190340b32735?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Museo Nacional de Antropología, Ciudad de México',
    locality: 'Ciudad de México', country: 'MX',
    price: '900', currency: 'MXN',
    offerUrl: 'https://maratoncdmx.com/',
    organizer: 'Gobierno de la Ciudad de México'
  },
  'buenos-aires': {
    event: 'Maratón de Buenos Aires',
    description: 'La maratón más grande de Argentina por los barrios porteños de Buenos Aires.',
    startDate: '2026-10-11T08:00:00',
    endDate: '2026-10-11T16:00:00',
    image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&h=600&q=80',
    locationName: 'Parque 3 de Febrero, Buenos Aires',
    locality: 'Buenos Aires', country: 'AR',
    price: '0', currency: 'ARS',
    offerUrl: 'https://maratonbuenosaires.com/',
    organizer: 'Gobierno de la Ciudad de Buenos Aires'
  }
};

function buildEventSchema(cityKey, data) {
  return {
    '@type': 'Event',
    '@id': `https://www.correrjuntos.com/events/${cityKey}#main-event`,
    'name': data.event,
    'description': data.description,
    'startDate': data.startDate,
    'endDate': data.endDate,
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'image': [data.image],
    'location': {
      '@type': 'Place',
      'name': data.locationName,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': data.locality,
        'addressCountry': data.country
      }
    },
    'offers': {
      '@type': 'Offer',
      'url': data.offerUrl,
      'price': data.price,
      'priceCurrency': data.currency,
      'availability': 'https://schema.org/InStock',
      'validFrom': '2025-10-01'
    },
    'organizer': {
      '@type': 'Organization',
      'name': data.organizer,
      'url': data.offerUrl
    },
    'url': `https://www.correrjuntos.com/events/${cityKey}`
  };
}

let processed = 0;
let skipped = 0;

for (const [cityKey, cityData] of Object.entries(CITY_DATA)) {
  const filePath = path.join(EVENTS_DIR, `${cityKey}.html`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No encontrado: ${cityKey}.html`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Encontrar el bloque JSON-LD
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ldMatch) {
    console.log(`⚠️  Sin JSON-LD: ${cityKey}.html`);
    skipped++;
    continue;
  }

  let ldJson;
  try {
    ldJson = JSON.parse(ldMatch[1]);
  } catch (e) {
    console.log(`❌ JSON inválido en ${cityKey}.html: ${e.message}`);
    skipped++;
    continue;
  }

  // Verificar si ya tiene un Event schema
  const graph = ldJson['@graph'] || [];
  const alreadyHasEvent = graph.some(item => item['@type'] === 'Event');
  if (alreadyHasEvent) {
    console.log(`✅ Ya tiene Event: ${cityKey}.html`);
    processed++;
    continue;
  }

  // Construir el nuevo Event schema
  const eventSchema = buildEventSchema(cityKey, cityData);

  // Añadir al @graph (antes del BreadcrumbList)
  const breadcrumbIdx = graph.findIndex(item => item['@type'] === 'BreadcrumbList');
  if (breadcrumbIdx >= 0) {
    graph.splice(breadcrumbIdx, 0, eventSchema);
  } else {
    graph.push(eventSchema);
  }

  // Serializar y reemplazar en el HTML
  const newLd = JSON.stringify(ldJson, null, 2);
  const newScriptTag = `<script type="application/ld+json">\n${newLd}\n</script>`;
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, newScriptTag);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Actualizado: ${cityKey}.html — Event "${cityData.event}"`);
  processed++;
}

console.log(`\n✅ Procesados: ${processed} | ⚠️  Saltados: ${skipped}`);
