/**
 * Fix light-mode color issues across all blog articles
 * Several CSS rules have dark-mode colors (#fff, #cbd5e1) in the base styles,
 * making text invisible/unreadable on the cream (#fef7ed) background.
 *
 * Fixes:
 * 1. li strong{color:#fff} → li strong{color:#ea580c} (orange)
 * 2. .comparison-table td{color:#cbd5e1} → .comparison-table td{color:#334155}
 * 3. .comparison-table td:first-child{color:#fff} → .comparison-table td:first-child{color:#ea580c}
 * 4. .newsletter h3{color:#fff} → .newsletter h3{color:#3d3229}
 */
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
let totalUpdated = 0;
let totalFiles = 0;

const replacements = [
  // li strong: white → orange (readable on cream bg)
  { find: 'li strong{color:#fff}', replace: 'li strong{color:#ea580c}' },
  // Table cells: light grey → dark grey
  { find: '.comparison-table td{color:#cbd5e1}', replace: '.comparison-table td{color:#334155}' },
  // Table first col: white → orange
  { find: '.comparison-table td:first-child{color:#fff}', replace: '.comparison-table td:first-child{color:#ea580c}' },
  // Newsletter h3: white → dark brown
  { find: '.newsletter h3{color:#fff}', replace: '.newsletter h3{color:#3d3229}' },
];

function processDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      totalFiles++;
      let html = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      replacements.forEach(({ find, replace }) => {
        if (html.includes(find)) {
          html = html.split(find).join(replace);
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(fullPath, html, 'utf8');
        totalUpdated++;
        console.log(`Updated: ${path.relative(__dirname, fullPath)}`);
      }
    }
  });
}

processDir(blogDir);
console.log(`\nDone: ${totalUpdated} files updated out of ${totalFiles} scanned`);
