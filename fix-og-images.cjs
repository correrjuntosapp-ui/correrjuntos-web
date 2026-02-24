/**
 * Fix OG images for city pages - use their Unsplash hero images
 */
const fs = require('fs');
const path = require('path');

const citiesDir = path.join(__dirname, 'cities');
const citiesIndex = fs.readFileSync(path.join(citiesDir, 'index.html'), 'utf8');

// Extract city -> image mapping from index
// Format: href="/cities/madrid.html" ... <img src="https://images.unsplash.com/photo-XXX?..."
const imgMap = {};
const regex = /href="\/cities\/([^"]+)"[^>]*><img src="(https:\/\/images\.unsplash\.com\/[^"]+)"/g;
let m;
while ((m = regex.exec(citiesIndex)) !== null) {
  const cityFile = m[1];
  // Reformat for OG: 1200x630 for social cards
  let imgUrl = m[2]
    .replace(/w=\d+/, 'w=1200')
    .replace(/h=\d+/, 'h=630')
    .replace(/q=\d+/, 'q=80');
  imgMap[cityFile] = imgUrl;
}

console.log(`Found ${Object.keys(imgMap).length} city→image mappings`);

let ogFixed = 0;
const cityFiles = fs.readdirSync(citiesDir).filter(f => f.endsWith('.html') && f !== 'index.html');

cityFiles.forEach(file => {
  const filePath = path.join(citiesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const img = imgMap[file];
  if (!img) {
    console.log(`  ⚠ No image found for ${file}`);
    return;
  }

  // Replace generic og:image with city-specific one
  const ogImgRegex = /<meta\s+property="og:image"\s+content="[^"]*">/;
  if (ogImgRegex.test(html)) {
    html = html.replace(ogImgRegex,
      `<meta property="og:image" content="${img}">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">`
    );
    ogFixed++;
  }

  // Also fix twitter:image
  const twImgRegex = /<meta\s+(name|property)="twitter:image"\s+content="[^"]*">/;
  if (twImgRegex.test(html)) {
    html = html.replace(twImgRegex, `<meta name="twitter:image" content="${img}">`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
});

console.log(`\n✓ OG images updated for ${ogFixed} city pages`);
