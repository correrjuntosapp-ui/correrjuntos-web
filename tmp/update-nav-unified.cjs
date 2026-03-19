'use strict';
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');

// ── Nav replacements ──
// Pattern A: Blog ES articles — old nav-links block
const OLD_NAV_ES_BLOG = `<div class="nav-links">
      <a href="/matching/">Matching</a>
      <a href="/cities/">Ciudades</a>
      <a href="/blog/" class="active">Blog</a>
      <a href="/#app">App</a>
    </div>`;

const NEW_NAV_ES_BLOG = `<div class="nav-links">
      <a href="/matching/">Matching</a>
      <a href="/planes/">Planes</a>
      <a href="/carreras/">Carreras</a>
      <a href="/blog/" class="active">Blog</a>
      <a href="/#app">App</a>
    </div>`;

// Pattern B: Blog EN articles
const OLD_NAV_EN_BLOG = `<div class="nav-links">
      <a href="/matching/en/">Matching</a>
      <a href="/cities/">Cities</a>
      <a href="/blog/en/" class="active">Blog</a>
      <a href="/#app">App</a>
    </div>`;

const NEW_NAV_EN_BLOG = `<div class="nav-links">
      <a href="/matching/en/">Matching</a>
      <a href="/plans/">Plans</a>
      <a href="/races/">Races</a>
      <a href="/blog/en/" class="active">Blog</a>
      <a href="/#app">App</a>
    </div>`;

// Pattern C: Hub pages ES (places, events, cities) — with Ciudades, no active on blog
const OLD_NAV_ES_HUB_CIUDADES = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/cities/">Ciudades</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_ES_HUB = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/planes/">Planes</a>
    <a href="/carreras/">Carreras</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Pattern D: Carreras hub ES — Carreras active
const OLD_NAV_CARRERAS = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/carreras/" class="active">Carreras</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_CARRERAS = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/planes/">Planes</a>
    <a href="/carreras/" class="active">Carreras</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Pattern E: Races hub EN — Races active
const OLD_NAV_RACES = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/races/" class="active">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_RACES = `<div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/plans/">Plans</a>
    <a href="/races/" class="active">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Pattern F: Planes hub ES — Planes active
const OLD_NAV_PLANES = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/planes/" class="active">Planes</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_PLANES = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/planes/" class="active">Planes</a>
    <a href="/carreras/">Carreras</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Pattern G: Plans hub EN — Plans active
const OLD_NAV_PLANS = `<div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/plans/" class="active">Plans</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_PLANS = `<div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/plans/" class="active">Plans</a>
    <a href="/races/">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Pattern H: Events/Places EN hub
const OLD_NAV_EN_HUB = `<div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/cities/">Cities</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_EN_HUB = `<div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/plans/">Plans</a>
    <a href="/races/">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Pattern I: Matching ES
const OLD_NAV_MATCHING_ES = `<div class="nav-links">
    <a href="/matching/" class="active">Matching</a>
    <a href="/cities/">Ciudades</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_MATCHING_ES = `<div class="nav-links">
    <a href="/matching/" class="active">Matching</a>
    <a href="/planes/">Planes</a>
    <a href="/carreras/">Carreras</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Pattern J: Matching EN
const OLD_NAV_MATCHING_EN = `<div class="nav-links">
    <a href="/matching/en/" class="active">Matching</a>
    <a href="/cities/">Cities</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_NAV_MATCHING_EN = `<div class="nav-links">
    <a href="/matching/en/" class="active">Matching</a>
    <a href="/plans/">Plans</a>
    <a href="/races/">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// ── Collect all HTML files ──
function findFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...findFiles(fp, ext));
    else if (e.name.endsWith(ext)) results.push(fp);
  }
  return results;
}

const allFiles = [
  ...findFiles(path.join(BASE, 'blog'), '.html'),
  ...findFiles(path.join(BASE, 'carreras'), '.html'),
  ...findFiles(path.join(BASE, 'races'), '.html'),
  ...findFiles(path.join(BASE, 'planes'), '.html'),
  ...findFiles(path.join(BASE, 'plans'), '.html'),
  ...findFiles(path.join(BASE, 'places'), '.html'),
  ...findFiles(path.join(BASE, 'events'), '.html'),
  ...findFiles(path.join(BASE, 'cities'), '.html'),
  ...findFiles(path.join(BASE, 'matching'), '.html'),
];

const replacements = [
  [OLD_NAV_ES_BLOG, NEW_NAV_ES_BLOG],
  [OLD_NAV_EN_BLOG, NEW_NAV_EN_BLOG],
  [OLD_NAV_ES_HUB_CIUDADES, NEW_NAV_ES_HUB],
  [OLD_NAV_CARRERAS, NEW_NAV_CARRERAS],
  [OLD_NAV_RACES, NEW_NAV_RACES],
  [OLD_NAV_PLANES, NEW_NAV_PLANES],
  [OLD_NAV_PLANS, NEW_NAV_PLANS],
  [OLD_NAV_EN_HUB, NEW_NAV_EN_HUB],
  [OLD_NAV_MATCHING_ES, NEW_NAV_MATCHING_ES],
  [OLD_NAV_MATCHING_EN, NEW_NAV_MATCHING_EN],
];

let totalUpdated = 0;
let totalSkipped = 0;

for (const fp of allFiles) {
  let content = fs.readFileSync(fp, 'utf-8');
  let changed = false;

  for (const [oldNav, newNav] of replacements) {
    if (content.includes(oldNav)) {
      content = content.replace(oldNav, newNav);
      changed = true;
      break; // Only one pattern per file
    }
  }

  if (changed) {
    fs.writeFileSync(fp, content, 'utf-8');
    totalUpdated++;
  } else {
    totalSkipped++;
  }
}

console.log(`Updated: ${totalUpdated} files`);
console.log(`Skipped: ${totalSkipped} files (no matching nav pattern)`);
console.log(`Total scanned: ${allFiles.length} files`);
