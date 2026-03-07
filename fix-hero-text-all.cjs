/**
 * Fix hero text readability on matching, places, and events pages
 * - Change .hero p color from dark (#5c4d3d) to light for overlay contrast
 * - Darken the hero overlay gradient
 */
const fs = require('fs');
const path = require('path');

const dirs = ['matching', 'places', 'events'];
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

      // Fix .hero p color
      if (html.includes('.hero p{') && html.includes('color:#5c4d3d')) {
        html = html.replace(
          /\.hero p\{([^}]*?)color:#5c4d3d/g,
          '.hero p{$1color:rgba(255,255,255,.85)'
        );
        changed = true;
      }

      // Darken the hero overlay
      if (html.includes('hero-bg::after{')) {
        html = html.replace(
          /\.hero-bg::after\{content:'';position:absolute;inset:0;background:linear-gradient\(to bottom,rgba\(11,18,32,\.5\) 0%,rgba\(11,18,32,\.8\) 60%/g,
          ".hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,18,32,.65) 0%,rgba(11,18,32,.88) 60%"
        );
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, html, 'utf8');
        totalUpdated++;
        console.log(`Updated: ${path.relative(__dirname, fullPath)}`);
      }
    }
  });
}

dirs.forEach(dir => processDir(path.join(__dirname, dir)));
console.log(`\nDone: ${totalUpdated} files updated`);
