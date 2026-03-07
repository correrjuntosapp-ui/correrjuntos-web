/**
 * Fix hero text readability on city pages
 * - Change .hero p color from dark (#5c4d3d) to light (rgba(255,255,255,.85)) for overlay contrast
 * - Darken the hero overlay gradient for better text visibility
 */
const fs = require('fs');
const path = require('path');

const citiesDir = path.join(__dirname, 'cities');
const files = fs.readdirSync(citiesDir).filter(f => f.endsWith('.html'));

let updated = 0;

files.forEach(file => {
  const filePath = path.join(citiesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Fix .hero p color: dark brown -> light white for overlay readability
  if (html.includes('.hero p{') && html.includes('color:#5c4d3d')) {
    // Replace .hero p color
    html = html.replace(
      /\.hero p\{([^}]*?)color:#5c4d3d/g,
      '.hero p{$1color:rgba(255,255,255,.85)'
    );
    changed = true;
  }

  // 2. Darken the hero overlay for better contrast
  // Old: rgba(11,18,32,.5) 0%, rgba(11,18,32,.8) 60%
  // New: rgba(11,18,32,.65) 0%, rgba(11,18,32,.85) 60%
  if (html.includes('hero-bg::after{')) {
    html = html.replace(
      /\.hero-bg::after\{content:'';position:absolute;inset:0;background:linear-gradient\(to bottom,rgba\(11,18,32,\.5\) 0%,rgba\(11,18,32,\.8\) 60%/g,
      ".hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,18,32,.65) 0%,rgba(11,18,32,.88) 60%"
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`\nDone: ${updated} files updated out of ${files.length}`);
