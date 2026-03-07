#!/usr/bin/env node
/**
 * fix-white-text-batch.cjs
 * Fixes remaining color:#fff issues on light-mode pages
 * (cities, matching, places, events)
 */
const fs = require('fs');
const path = require('path');

const DIRS = ['cities', 'matching', 'places', 'events'];

function getAllHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Text replacements for CSS rules with color:#fff that should be dark
const REPLACEMENTS = [
  // parkrun-card name (white on light card bg)
  ['.parkrun-card .name{font-weight:700;color:#fff', '.parkrun-card .name{font-weight:700;color:#3d3229'],
  // parkrun-card details (white on light card bg)
  ['.parkrun-card .details{color:#fff', '.parkrun-card .details{color:#5c4d3d'],
  // Footer heading divs (inline white on light bg)
  ['style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px"', 'style="color:#3d3229;font-weight:700;font-size:.9rem;margin-bottom:16px"'],
  // Footer logo JUNTOS span
  ['<span style="color:#fff">JUNTOS</span>', '<span style="color:#3d3229">JUNTOS</span>'],
  // Footer description (inline white)
  ['style="color:#fff;font-size:.85rem;line-height:1.6;margin-bottom:24px"', 'style="color:#8b7355;font-size:.85rem;line-height:1.6;margin-bottom:24px"'],
];

let updated = 0;
let skipped = 0;

for (const dirName of DIRS) {
  const dir = path.join(__dirname, dirName);
  const files = getAllHtmlFiles(dir);

  for (const filePath of files) {
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const original = content;

      for (const [search, replace] of REPLACEMENTS) {
        content = content.split(search).join(replace);
      }

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        updated++;
      } else {
        skipped++;
      }
    } catch (e) {
      console.error(`Error: ${filePath}: ${e.message}`);
    }
  }
}

console.log(`Done! Updated: ${updated}, Skipped: ${skipped}`);
