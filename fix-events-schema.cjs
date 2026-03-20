#!/usr/bin/env node
/**
 * Remove all SportsEvent entries from events pages JSON-LD.
 * Keeps: SportsOrganization, WebSite, WebPage, ItemList, BreadcrumbList
 * Removes: SportsEvent (causes GSC warnings for missing endDate, performer, offers, organizer.url)
 */
const fs = require('fs');
const path = require('path');

const eventsDir = path.join(__dirname, 'events');
const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.html'));
let updated = 0;

for (const file of files) {
  const filePath = path.join(eventsDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Extract JSON-LD block
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ldMatch) {
    console.log(`  ⚠ No JSON-LD in ${file}`);
    continue;
  }

  try {
    const schema = JSON.parse(ldMatch[1]);
    if (!schema['@graph']) {
      console.log(`  ⚠ No @graph in ${file}`);
      continue;
    }

    const before = schema['@graph'].length;
    // Filter out SportsEvent entries
    schema['@graph'] = schema['@graph'].filter(item => item['@type'] !== 'SportsEvent');
    const after = schema['@graph'].length;

    if (before === after) {
      console.log(`  - ${file}: no SportsEvent found`);
      continue;
    }

    // Replace JSON-LD in HTML
    const newJsonLd = JSON.stringify(schema, null, 2);
    html = html.replace(ldMatch[0], '<script type="application/ld+json">\n' + newJsonLd + '\n</script>');
    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    console.log(`  ✓ ${file}: removed ${before - after} SportsEvent entries`);
  } catch (e) {
    console.log(`  ✗ ${file}: JSON parse error — ${e.message}`);
  }
}

console.log(`\nDone: ${updated} files updated`);
