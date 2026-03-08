/**
 * Fix: restore dark-mode comparison-table first-child color back to #fff
 * The previous script accidentally changed .dark-mode rules too
 */
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
let totalUpdated = 0;

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

      // Fix dark-mode table first-child: should be #fff (white on dark bg)
      if (html.includes('.dark-mode .comparison-table td:first-child{color:#ea580c}')) {
        html = html.replace(
          '.dark-mode .comparison-table td:first-child{color:#ea580c}',
          '.dark-mode .comparison-table td:first-child{color:#fff}'
        );
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, html, 'utf8');
        totalUpdated++;
      }
    }
  });
}

processDir(blogDir);
console.log(`Fixed dark-mode table colors: ${totalUpdated} files`);
