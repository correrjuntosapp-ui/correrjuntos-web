/**
 * Add loading="lazy" to all product images in equipamiento pages.
 * Skip hero/above-fold images (none in product grids).
 */
const fs = require('fs');
const path = require('path');

const dirs = ['equipamiento'];
let count = 0;

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) return;
  fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).forEach(file => {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Add loading="lazy" to <img> tags that don't have it
    html = html.replace(/<img\b([^>]*?)>/g, (match, attrs) => {
      if (/loading=/.test(attrs)) return match; // Already has loading
      count++;
      changed = true;
      return `<img${attrs} loading="lazy">`;
    });

    if (changed) {
      fs.writeFileSync(filePath, html, 'utf8');
    }
  });
});

console.log(`✓ Added loading="lazy" to ${count} images in equipamiento`);
