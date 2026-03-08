const fs = require('fs');
const path = require('path');

// Hotlink replacements: old URL pattern → {newId, articles}
const replacements = [
  {
    // Garmin Forerunner image → smartwatch on wrist
    oldPattern: 'res.garmin.com/en/products/010-02810-00/v/cf-lg.jpg',
    newId: '4379289',
    esSlugs: ['smartwatch-vs-reloj-gps-running'],
    enSlugs: ['smartwatch-vs-gps-running-watch'],
  },
  {
    // Shokz OpenRun Pro 2 image → runner/fitness
    oldPattern: 'shokz.com/cdn/shop/files/OpenRun_Pro2_Sky_Blue_1.webp',
    newId: '1056251',
    esSlugs: ['shokz-openrun-pro-2-review'],
    enSlugs: ['shokz-openrun-pro-2-review'],
  },
  {
    // kwcdn running belt image → runner
    oldPattern: 'img.kwcdn.com/product/open/6334ea0b7bee43fdbee81b0aa46c7f5b-goods.jpeg',
    newId: '3771106',
    esSlugs: ['cinturones-running'],
    enSlugs: ['running-belts'],
  },
  {
    // kwcdn rain jacket image → runner in rain
    oldPattern: 'img-eu.kwcdn.com/local-goods-img/21a4884cc8/489f991f-8977-403f-9af9-fac4ce1067d1_1900x2533.jpeg.format.jpg',
    newId: '20234190',
    esSlugs: ['chubasqueros-running'],
    enSlugs: ['running-rain-jackets'],
  },
];

function pexelsUrl(id, w, h, q) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop&q=${q || 80}`;
}

// 1. Fix blog index files (card thumbnails use w=640&h=360)
const indexFiles = ['blog/index.html', 'blog/en/index.html'];
for (const file of indexFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;

  for (const r of replacements) {
    const escaped = r.oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the full img src containing the old URL (with any query params and width)
    const re = new RegExp(escaped + '[^"\']*', 'g');
    const newUrl = pexelsUrl(r.newId, 640, 360, 80);
    const count = (content.match(re) || []).length;
    if (count > 0) {
      content = content.replace(re, newUrl.replace('https://', ''));
      // Also fix the protocol if src has https://
      changes += count;
      console.log(`  ${file}: replaced ${r.oldPattern.split('/')[0]} → pexels ${r.newId} (${count}x)`);
    }
  }

  fs.writeFileSync(file, content);
  console.log(`${file}: ${changes} hotlink(s) fixed`);
}

// 2. Fix related.js (thumbnails use w=400&h=200&q=60)
let relContent = fs.readFileSync('blog/related.js', 'utf8');
let relChanges = 0;
for (const r of replacements) {
  const escaped = r.oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('https?://' + escaped + '[^"\']*', 'g');
  const newUrl = pexelsUrl(r.newId, 400, 200, 60);
  const count = (relContent.match(re) || []).length;
  if (count > 0) {
    relContent = relContent.replace(re, newUrl);
    relChanges += count;
    console.log(`  related.js: replaced ${r.oldPattern.split('/')[0]} → pexels ${r.newId} (${count}x)`);
  }
}
fs.writeFileSync('blog/related.js', relContent);
console.log(`blog/related.js: ${relChanges} hotlink(s) fixed`);

// 3. Fix individual article files (hero images, various sizes)
const blogDir = 'blog';
const blogEnDir = 'blog/en';

for (const r of replacements) {
  const escaped = r.oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // ES articles
  for (const slug of r.esSlugs) {
    const filePath = path.join(blogDir, slug + '.html');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const re = new RegExp('https?://' + escaped + '[^"\']*', 'g');
      const matches = content.match(re);
      if (matches && matches.length > 0) {
        // For hero images, use larger size
        const newUrl = pexelsUrl(r.newId, 1200, 630, 80);
        content = content.replace(re, newUrl);
        fs.writeFileSync(filePath, content);
        console.log(`  ${filePath}: replaced hero hotlink → pexels ${r.newId} (${matches.length}x)`);
      }
    }
  }

  // EN articles
  for (const slug of r.enSlugs) {
    const filePath = path.join(blogEnDir, slug + '.html');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const re = new RegExp('https?://' + escaped + '[^"\']*', 'g');
      const matches = content.match(re);
      if (matches && matches.length > 0) {
        const newUrl = pexelsUrl(r.newId, 1200, 630, 80);
        content = content.replace(re, newUrl);
        fs.writeFileSync(filePath, content);
        console.log(`  ${filePath}: replaced hero hotlink → pexels ${r.newId} (${matches.length}x)`);
      }
    }
  }
}

console.log('\nDone! All manufacturer hotlinks replaced with Pexels images.');
