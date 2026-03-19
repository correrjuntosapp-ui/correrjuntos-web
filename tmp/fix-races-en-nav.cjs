'use strict';
const fs = require('fs');
const path = require('path');

const RACES_DIR = path.resolve(__dirname, '..', 'races');
const PLANS_DIR = path.resolve(__dirname, '..', 'plans');

// Individual race EN pages — old 4-item nav
const OLD = `  <div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/races/" class="active">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW = `  <div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/plans/">Plans</a>
    <a href="/races/" class="active">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

// Individual plan EN pages
const OLD_PLAN = `  <div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/plans/" class="active">Plans</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

const NEW_PLAN = `  <div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/plans/" class="active">Plans</a>
    <a href="/races/">Races</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>`;

let updated = 0;

for (const dir of [RACES_DIR, PLANS_DIR]) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.html')) continue;
    const fp = path.join(dir, f);
    let content = fs.readFileSync(fp, 'utf-8');
    let changed = false;
    if (content.includes(OLD)) { content = content.replace(OLD, NEW); changed = true; }
    if (content.includes(OLD_PLAN)) { content = content.replace(OLD_PLAN, NEW_PLAN); changed = true; }
    if (changed) { fs.writeFileSync(fp, content, 'utf-8'); updated++; }
  }
}
console.log(`Fixed ${updated} EN race/plan pages`);
