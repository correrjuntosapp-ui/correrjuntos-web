/**
 * fix-images-batch.cjs
 * Replaces ALL dead Unsplash image URLs with verified working Pexels URLs.
 * Affects: ~170 blog HTML files (hero img, og:image, twitter:image, JSON-LD image)
 *          + blog/related.js (CAT_IMGS + DEFAULT_IMG)
 *          + fix-hero-html.cjs (HERO_IMAGES map)
 *          + fix-design-batch.cjs (HERO_IMAGES map)
 *
 * Pexels images are free for commercial use, no attribution required.
 * All URLs verified HTTP 200 with Content-Type: image/jpeg.
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// ── Old Unsplash photo IDs → New Pexels URLs ──
// Map from Unsplash photo ID fragment to Pexels base URL
const REPLACEMENTS = {
  // training
  'photo-1552674605-db6ffd4facb5': 'images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg',
  // nutrition
  'photo-1490645935967-10de6ba17061': 'images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  // shoes
  'photo-1542291026-7eec264c27ff': 'images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg',
  // tech
  'photo-1510017803434-a899b55cbf07': 'images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg',
  // trail
  'photo-1551698618-1dfe5d97d256': 'images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg',
  // health
  'photo-1571019613454-1cb2f99b2d8b': 'images.pexels.com/photos/4056832/pexels-photo-4056832.jpeg',
  // routes
  'photo-1476480862126-209bfaa8edc8': 'images.pexels.com/photos/4652250/pexels-photo-4652250.jpeg',
  // group
  'photo-1571008887538-b36bb32f4571': 'images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg',
  // race
  'photo-1513593771513-7b58b6c4af38': 'images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg',
  // general / equipment fallback
  'photo-1461896836934-bd45ba0c3530': 'images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg'
};

// ── File traversal ──
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together'].includes(entry.name)) continue;
      getAllFiles(fullPath, files);
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.js') || entry.name.endsWith('.cjs')) {
      files.push(fullPath);
    }
  }
  return files;
}

let filesChanged = 0;
let totalReplacements = 0;

const allFiles = getAllFiles(BASE_DIR);

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  let fileReplacements = 0;

  for (const [oldId, newBase] of Object.entries(REPLACEMENTS)) {
    // Match any URL containing this Unsplash photo ID with any query params
    // Pattern: https://images.unsplash.com/{oldId}?...params...
    const regex = new RegExp(
      'https://images\\.unsplash\\.com/' + oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?[^"\'\\s)]+',
      'g'
    );

    const matches = content.match(regex);
    if (matches) {
      matches.forEach(oldUrl => {
        // Extract the query params to determine the size
        let w = '1200', h = '500', q = '70';
        const wMatch = oldUrl.match(/w=(\d+)/);
        const hMatch = oldUrl.match(/h=(\d+)/);
        const qMatch = oldUrl.match(/q=(\d+)/);
        if (wMatch) w = wMatch[1];
        if (hMatch) h = hMatch[1];
        if (qMatch) q = qMatch[1];

        const newUrl = `https://${newBase}?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop&q=${q}`;
        content = content.split(oldUrl).join(newUrl);
        fileReplacements++;
      });
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesChanged++;
    totalReplacements += fileReplacements;
    const rel = path.relative(BASE_DIR, filePath).replace(/\\/g, '/');
    if (fileReplacements > 3) {
      console.log(`  ${rel}: ${fileReplacements} URLs replaced`);
    }
  }
});

console.log('=== Image URL Replacement Results ===');
console.log(`Files modified: ${filesChanged}`);
console.log(`Total URL replacements: ${totalReplacements}`);
console.log('Old: images.unsplash.com (404)');
console.log('New: images.pexels.com (verified 200)');
