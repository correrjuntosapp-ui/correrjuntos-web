/**
 * Fix remaining light-mode color issues (rules with extra properties after color)
 * - .comparison-table td:first-child{color:#fff;font-weight:600} → color:#ea580c
 * - .newsletter h3{color:#fff; → color:#3d3229;
 */
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
let totalUpdated = 0;

const replacements = [
  // Table first-child with font-weight (base light mode)
  {
    find: '.comparison-table td:first-child{color:#fff;font-weight',
    replace: '.comparison-table td:first-child{color:#ea580c;font-weight'
  },
  // Newsletter h3 (base light mode) — NOT dark-mode (which has .dark-mode prefix)
  {
    find: '}.newsletter h3{color:#fff',
    replace: '}.newsletter h3{color:#3d3229'
  },
];

function processDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
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
      }
    }
  });
}

processDir(blogDir);
console.log(`Fixed: ${totalUpdated} files`);
