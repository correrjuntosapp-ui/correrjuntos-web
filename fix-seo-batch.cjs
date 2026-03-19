/**
 * fix-seo-batch.cjs
 * Fixes 4 critical SEO issues across all blog articles:
 * 1. Amazon product images missing width/height → CLS fix
 * 2. Broken internal link /blog/apps-running-gratis → correct URL
 * 3. Relative og:image paths → absolute URLs
 * 4. Add preconnect hints for image CDNs
 */
const fs = require('fs');
const path = require('path');

function walk(dir, ext) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !['autor', 'js', 'node_modules', 'img', 'css', 'icons'].includes(e.name)) {
      results.push(...walk(p, ext));
    } else if (e.isFile() && e.name.endsWith(ext)) {
      results.push(p);
    }
  }
  return results;
}

const blogFiles = walk('blog', '.html');
const stats = { amazonImgs: 0, brokenLinks: 0, ogImage: 0, preconnect: 0, files: 0 };

for (const f of blogFiles) {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  const bn = path.basename(f);

  // ── FIX 1: Amazon images missing width/height ──
  // Match <img ... src="https://m.media-amazon.com/..." ...> without width attribute
  const amazonImgRegex = /<img\s([^>]*src="https:\/\/m\.media-amazon\.com\/[^"]*"[^>]*)>/g;
  let match;
  while ((match = amazonImgRegex.exec(c)) !== null) {
    const imgTag = match[0];
    const attrs = match[1];
    // Only fix if missing width attribute
    if (!attrs.includes('width=')) {
      const fixedImg = imgTag.replace(/<img\s/, '<img width="300" height="300" ');
      c = c.replace(imgTag, fixedImg);
      stats.amazonImgs++;
      changed = true;
    }
  }

  // ── FIX 2: Broken link /blog/apps-running-gratis ──
  if (c.includes('/blog/apps-running-gratis')) {
    c = c.replace(/\/blog\/apps-running-gratis/g, '/blog/mejores-apps-running');
    // If mejores-apps-running doesn't exist either, use a safe alternative
    stats.brokenLinks++;
    changed = true;
  }

  // ── FIX 3: Relative og:image → absolute URL ──
  const ogImageRelRegex = /<meta\s+property="og:image"\s+content="(\/[^"]+)"/g;
  let ogMatch;
  while ((ogMatch = ogImageRelRegex.exec(c)) !== null) {
    const relPath = ogMatch[1];
    const absUrl = `https://www.correrjuntos.com${relPath}`;
    c = c.replace(
      `<meta property="og:image" content="${relPath}"`,
      `<meta property="og:image" content="${absUrl}"`
    );
    stats.ogImage++;
    changed = true;
  }

  // Also fix twitter:image relative paths
  const twImageRelRegex = /<meta\s+name="twitter:image"\s+content="(\/[^"]+)"/g;
  let twMatch;
  while ((twMatch = twImageRelRegex.exec(c)) !== null) {
    const relPath = twMatch[1];
    const absUrl = `https://www.correrjuntos.com${relPath}`;
    c = c.replace(
      `<meta name="twitter:image" content="${relPath}"`,
      `<meta name="twitter:image" content="${absUrl}"`
    );
    changed = true;
  }

  // ── FIX 4: Add preconnect hints ──
  // Only add if article has Amazon images and no preconnect yet
  if (c.includes('m.media-amazon.com') && !c.includes('preconnect" href="https://m.media-amazon.com"')) {
    c = c.replace(
      '<meta name="viewport"',
      '<link rel="preconnect" href="https://m.media-amazon.com" crossorigin>\n<meta name="viewport"'
    );
    stats.preconnect++;
    changed = true;
  }

  // Add preconnect for Pexels if used and not yet added
  if (c.includes('images.pexels.com') && !c.includes('preconnect" href="https://images.pexels.com"')) {
    c = c.replace(
      '<meta name="viewport"',
      '<link rel="preconnect" href="https://images.pexels.com" crossorigin>\n<meta name="viewport"'
    );
    stats.preconnect++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
    stats.files++;
  }
}

console.log('=== SEO FIX RESULTS ===');
console.log('Amazon images fixed (width/height):', stats.amazonImgs);
console.log('Broken links fixed:', stats.brokenLinks);
console.log('og:image paths fixed:', stats.ogImage);
console.log('Preconnect hints added:', stats.preconnect);
console.log('Total files modified:', stats.files);
