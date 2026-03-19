'use strict';
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');

function findHtml(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...findHtml(fp));
    else if (e.name.endsWith('.html')) results.push(fp);
  }
  return results;
}

const dirs = ['blog', 'carreras', 'races', 'planes', 'plans', 'places', 'events', 'cities', 'matching'];
const allFiles = dirs.flatMap(d => findHtml(path.join(BASE, d)));

let updated = 0;

for (const fp of allFiles) {
  let content = fs.readFileSync(fp, 'utf-8');
  let changed = false;

  // Strategy: find any <a> linking to /cities/ with text Ciudades or Cities, and replace with Planes+Carreras or Plans+Races
  // Only if the page doesn't already have Planes/Plans links

  if (content.includes('Ciudades</a>') && !content.includes('/planes/">Planes</a>')) {
    // ES: Replace the Ciudades link with Planes + Carreras links
    content = content.replace(
      /<a href="\/cities\/">Ciudades<\/a>/g,
      '<a href="/planes/">Planes</a>\n      <a href="/carreras/">Carreras</a>'
    );
    changed = true;
  }

  if (content.includes('Cities</a>') && !content.includes('/plans/">Plans</a>')) {
    // EN: Replace the Cities link with Plans + Races links
    content = content.replace(
      /<a href="\/cities\/">Cities<\/a>/g,
      '<a href="/plans/">Plans</a>\n      <a href="/races/">Races</a>'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, content, 'utf-8');
    updated++;
  }
}

console.log(`Fixed: ${updated} files`);

// Verify
let remaining = 0;
for (const fp of allFiles) {
  const content = fs.readFileSync(fp, 'utf-8');
  if (content.includes('Ciudades</a>') || content.includes('/cities/">Cities</a>')) {
    remaining++;
  }
}
console.log(`Remaining with Ciudades/Cities: ${remaining}`);
