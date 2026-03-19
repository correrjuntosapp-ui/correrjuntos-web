#!/usr/bin/env node
/**
 * add-sports-event-schema.cjs
 * Adds SportsEvent schema entries to all event pages in /events/*.html
 * Parses the races-table, skips parkrun entries, and inserts into the @graph array.
 */

const fs = require('fs');
const path = require('path');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

const MONTH_MAP = {
  'enero': '01-15',
  'febrero': '02-15',
  'marzo': '03-15',
  'abril': '04-15',
  'mayo': '05-15',
  'junio': '06-15',
  'julio': '07-15',
  'agosto': '08-15',
  'septiembre': '09-15',
  'octubre': '10-15',
  'noviembre': '11-15',
  'diciembre': '12-15',
  // English month names
  'january': '01-15',
  'february': '02-15',
  'march': '03-15',
  'april': '04-15',
  'may': '05-15',
  'june': '06-15',
  'july': '07-15',
  'august': '08-15',
  'september': '09-15',
  'october': '10-15',
  'november': '11-15',
  'december': '12-15',
};

const COUNTRY_MAP = {
  'madrid': 'ES', 'barcelona': 'ES', 'valencia': 'ES', 'sevilla': 'ES', 'malaga': 'ES',
  'london': 'GB', 'manchester': 'GB',
  'paris': 'FR',
  'berlin': 'DE', 'munich': 'DE',
  'amsterdam': 'NL',
  'rome': 'IT', 'milan': 'IT',
  'new-york': 'US', 'los-angeles': 'US', 'chicago': 'US', 'san-francisco': 'US', 'austin': 'US',
  'dublin': 'IE',
  'lisbon': 'PT',
  'buenos-aires': 'AR',
  'mexico-city': 'MX',
};

function cityNameFromFile(filename) {
  const slug = filename.replace('.html', '');
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseParticipants(text) {
  if (!text) return null;
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '').trim();
  // "30.000+" or "40,000+" or "15000"
  const cleaned = text.replace(/[+~]/g, '').replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

function parseDateField(text) {
  if (!text) return null;
  text = text.replace(/<[^>]+>/g, '').trim().toLowerCase();

  // Special case: "31 diciembre" or "31 december"
  if (/31\s*diciembre/.test(text) || /31\s*december/.test(text)) {
    return '12-31';
  }

  // Try to find a month name
  for (const [month, dateStr] of Object.entries(MONTH_MAP)) {
    if (text.includes(month)) {
      return dateStr;
    }
  }

  return null;
}

function extractRacesFromTable(html) {
  // Find the races-table tbody
  const tableMatch = html.match(/<table\s+class="races-table"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tableMatch) return [];

  const tbody = tableMatch[1];
  const rows = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = rowRegex.exec(tbody)) !== null) {
    const cells = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cm;
    while ((cm = cellRegex.exec(m[1])) !== null) {
      cells.push(cm[1].replace(/<[^>]+>/g, '').trim());
    }
    if (cells.length >= 2) {
      rows.push({
        name: cells[0],
        date: cells[1],
        distance: cells[2] || '',
        participants: cells[3] || '',
      });
    }
  }
  return rows;
}

function processFile(filePath) {
  const filename = path.basename(filePath);
  if (filename === 'index.html') return { file: filename, skipped: true, reason: 'index' };

  const slug = filename.replace('.html', '');
  const cityName = cityNameFromFile(filename);
  const country = COUNTRY_MAP[slug] || 'ES';

  let html = fs.readFileSync(filePath, 'utf8');

  // Check if SportsEvent already exists
  if (html.includes('"@type": "SportsEvent"') || html.includes('"@type":"SportsEvent"')) {
    return { file: filename, skipped: true, reason: 'SportsEvent already exists' };
  }

  // Extract races from table
  const races = extractRacesFromTable(html);
  if (races.length === 0) {
    return { file: filename, skipped: true, reason: 'no races-table found' };
  }

  // Filter out parkrun entries
  const filteredRaces = races.filter(r => !r.name.toLowerCase().includes('parkrun'));
  if (filteredRaces.length === 0) {
    return { file: filename, skipped: true, reason: 'all races are parkrun' };
  }

  // Build SportsEvent entries
  const sportsEvents = [];
  for (const race of filteredRaces) {
    const dateStr = parseDateField(race.date);
    if (!dateStr) continue; // skip if we can't parse the date

    const event = {
      '@type': 'SportsEvent',
      'name': race.name,
      'sport': 'Running',
      'startDate': `2026-${dateStr}`,
      'location': {
        '@type': 'Place',
        'name': cityName,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': cityName,
          'addressCountry': country,
        },
      },
      'eventStatus': 'https://schema.org/EventScheduled',
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'organizer': {
        '@type': 'Organization',
        'name': 'CorrerJuntos',
        'url': 'https://www.correrjuntos.com',
      },
    };

    const participants = parseParticipants(race.participants);
    if (participants) {
      event['maximumAttendeeCapacity'] = participants;
    }

    sportsEvents.push(event);
  }

  if (sportsEvents.length === 0) {
    return { file: filename, skipped: true, reason: 'no valid dates parsed' };
  }

  // Find the JSON-LD block and parse it
  const jsonLdRegex = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/;
  const jsonLdMatch = html.match(jsonLdRegex);
  if (!jsonLdMatch) {
    return { file: filename, skipped: true, reason: 'no JSON-LD found' };
  }

  let schema;
  try {
    schema = JSON.parse(jsonLdMatch[2]);
  } catch (e) {
    return { file: filename, skipped: true, reason: `JSON parse error: ${e.message}` };
  }

  if (!schema['@graph'] || !Array.isArray(schema['@graph'])) {
    return { file: filename, skipped: true, reason: 'no @graph array' };
  }

  // Find the BreadcrumbList index to insert before it
  const graph = schema['@graph'];
  let insertIndex = graph.length; // default: end
  for (let i = 0; i < graph.length; i++) {
    if (graph[i]['@type'] === 'BreadcrumbList') {
      insertIndex = i;
      break;
    }
  }

  // Insert SportsEvent entries before BreadcrumbList
  graph.splice(insertIndex, 0, ...sportsEvents);

  // Serialize back
  const newJsonLd = JSON.stringify(schema, null, 2);
  html = html.replace(jsonLdRegex, `$1\n${newJsonLd}\n$3`);

  fs.writeFileSync(filePath, html, 'utf8');

  return {
    file: filename,
    success: true,
    eventsAdded: sportsEvents.length,
    races: sportsEvents.map(e => e.name),
  };
}

// Main
const files = fs.readdirSync(EVENTS_DIR).filter(f => f.endsWith('.html'));
console.log(`Found ${files.length} HTML files in events/\n`);

let totalAdded = 0;
for (const file of files) {
  const result = processFile(path.join(EVENTS_DIR, file));
  if (result.skipped) {
    console.log(`SKIP ${result.file}: ${result.reason}`);
  } else {
    console.log(`OK   ${result.file}: +${result.eventsAdded} SportsEvent(s) — ${result.races.join(', ')}`);
    totalAdded += result.eventsAdded;
  }
}

console.log(`\nDone. Added ${totalAdded} SportsEvent entries across ${files.length} files.`);
