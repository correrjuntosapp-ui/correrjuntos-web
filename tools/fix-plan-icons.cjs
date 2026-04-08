#!/usr/bin/env node
/**
 * Replace emoji icons in plan info-cards with clean SVG icons
 * Targets: &#128197; (calendar), &#127939; (runner), &#127942; (trophy), &#128207; (ruler)
 */

const fs = require('fs');
const path = require('path');
const glob = require('path');

// SVG icons - clean, minimal, stroke-based, 24x24
const ICONS = {
  // Calendar - duration
  '&#128197;': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="3" height="3" rx="0.5" fill="#f97316" stroke="none"/></svg>',
  // Runner - days/week
  '&#127939;': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4" r="2"/><path d="M5.2 16.8l3.5-2.2 2.3 2.4 4-5.5 2.5 3"/><path d="M18 20l-2.5-3-4 5.5"/><path d="M8.7 14.6L5 22"/><path d="M13 7l-3.5 4.5"/></svg>',
  // Trophy/medal - level
  '&#127942;': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 0 12 0 6 6 0 0 0-12 0z"/><path d="M12 15v4"/><path d="M8 21h8"/><path d="M9 6l3 3 3-3"/></svg>',
  // Ruler/route - distance
  '&#128207;': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V2"/><path d="M5 12H2"/><path d="M10 7H7"/><path d="M10 17H7"/><path d="M22 12h-3"/><path d="M17 7h-3"/><path d="M17 17h-3"/></svg>'
};

// Find all plan HTML files
const planesDir = path.join(__dirname, '..', 'planes');

function findHtmlFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (item.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = findHtmlFiles(planesDir);
let totalUpdated = 0;

files.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  for (const [emoji, svg] of Object.entries(ICONS)) {
    if (html.includes(emoji)) {
      html = html.replaceAll(emoji, svg);
      changes++;
    }
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✅ ${relPath} — ${changes} icons replaced`);
    totalUpdated++;
  }
});

console.log(`\n✅ Done! Updated ${totalUpdated} files.`);
