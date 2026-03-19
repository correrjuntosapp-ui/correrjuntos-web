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

  // Detect language from path
  const isEn = fp.includes('/en/') || fp.includes('\\en\\') ||
               fp.includes('/races/') || fp.includes('\\races\\') ||
               fp.includes('/plans/') || fp.includes('\\plans\\');

  // Check if still has old nav (Ciudades/Cities without Planes/Plans)
  if (content.includes('/cities/">Ciudades</a>') && !content.includes('Planes</a>')) {
    // ES page with Ciudades — replace with Planes + Carreras
    content = content.replace(
      /(<a href="\/cities\/">Ciudades<\/a>\s*\n\s*<a href="\/blog\/")/,
      '<a href="/planes/">Planes</a>\n      <a href="/carreras/">Carreras</a>\n      <a href="/blog/"'
    );
    // Remove the Ciudades link
    content = content.replace(/\s*<a href="\/cities\/">Ciudades<\/a>\s*\n/, '\n');
    fs.writeFileSync(fp, content, 'utf-8');
    updated++;
  } else if (content.includes('/cities/">Cities</a>') && !content.includes('Plans</a>')) {
    // EN page with Cities — replace with Plans + Races
    content = content.replace(
      /(<a href="\/cities\/">Cities<\/a>\s*\n\s*<a href="\/blog\/en\/")/,
      '<a href="/plans/">Plans</a>\n      <a href="/races/">Races</a>\n      <a href="/blog/en/"'
    );
    content = content.replace(/\s*<a href="\/cities\/">Cities<\/a>\s*\n/, '\n');
    fs.writeFileSync(fp, content, 'utf-8');
    updated++;
  }
}

console.log(`Fixed: ${updated} files`);
console.log(`Total scanned: ${allFiles.length}`);
