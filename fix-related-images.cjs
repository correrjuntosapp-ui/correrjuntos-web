#!/usr/bin/env node
/**
 * Extract og:image from each blog article and add it to related.js DB entries.
 * Also fix dark-mode card colors to light-mode.
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');
const RELATED_JS = path.join(BLOG_DIR, 'related.js');

// 1. Build a map: slug → og:image URL (thumbnail version)
const imageMap = {};

function extractImages(dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name === 'en') {
      extractImages(path.join(dir, 'en'), 'en/');
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;
    const slug = entry.name.replace('.html', '');
    const fullSlug = prefix ? prefix + slug : slug;
    const html = fs.readFileSync(path.join(dir, entry.name), 'utf8');

    const match = html.match(/og:image["']\s+content=["']([^"']+)/);
    if (match) {
      // Convert to thumbnail size (400x200) for cards
      let url = match[1];
      url = url.replace(/w=\d+/, 'w=400').replace(/h=\d+/, 'h=200').replace(/q=\d+/, 'q=60');
      imageMap[slug] = url;
    }
  }
}

extractImages(BLOG_DIR, '');
console.log(`Extracted ${Object.keys(imageMap).length} og:image URLs`);

// 2. Update related.js — add `i` field to each DB entry
let js = fs.readFileSync(RELATED_JS, 'utf8');

// Add image field to ES entries
let esUpdated = 0;
js = js.replace(/\{s:'([^']+)',t:'([^']*)',c:'([^']*)'\}/g, (match, slug, title, cat) => {
  const img = imageMap[slug];
  if (img) {
    esUpdated++;
    return `{s:'${slug}',t:'${title}',c:'${cat}',i:'${img}'}`;
  }
  return match;
});
console.log(`Updated ${esUpdated} ES entries with images`);

// Add image field to EN entries (same pattern)
let enUpdated = 0;
// EN entries that already had `i` field won't be double-matched because the regex above already handled them

// 3. Fix card CSS colors (dark-mode → light-mode defaults)
// Card background
js = js.replace(
  "'.related-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);",
  "'.related-card{background:#fffcf9;border:1px solid #efe6db;"
);
// Card hover
js = js.replace(
  "'.related-card:hover{background:rgba(255,255,255,.06);border-color:rgba(249,115,22,.3);",
  "'.related-card:hover{background:rgba(249,115,22,.04);border-color:rgba(249,115,22,.3);"
);
// Card title color
js = js.replace(
  "'.related-card-title{font-size:.9rem;font-weight:700;color:#cbd5e1;",
  "'.related-card-title{font-size:.9rem;font-weight:700;color:#3d3229;"
);
// Card title hover
js = js.replace(
  "'.related-card:hover .related-card-title{color:#fff}',",
  "'.related-card:hover .related-card-title{color:#f97316}',"
);
// Section border
js = js.replace(
  "'.related-section{margin:40px 0 32px;padding:32px 0 0;border-top:1px solid rgba(255,255,255,.06)}',",
  "'.related-section{margin:40px 0 32px;padding:32px 0 0;border-top:1px solid #efe6db}',"
);

// 4. Update card rendering to use per-article image if available
js = js.replace(
  "var img = CAT_IMGS[p.c] || DEFAULT_IMG;",
  "var img = p.i || CAT_IMGS[p.c] || DEFAULT_IMG;"
);

// 5. Fix section heading color and other text if dark-mode
js = js.replace(
  /color:#fff;font-weight:800;font-size:1\.15rem/g,
  "color:#3d3229;font-weight:800;font-size:1.15rem"
);
// Category badge
js = js.replace(
  "'.related-cat{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#f97316;margin:0 0 6px}',",
  "'.related-cat{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#ea580c;margin:0 0 6px}',"
);
// Arrow
js = js.replace(
  "'.related-arrow{font-size:.8rem;color:#64748b;font-weight:600;margin:8px 0 0}',",
  "'.related-arrow{font-size:.8rem;color:#f97316;font-weight:600;margin:8px 0 0}',"
);

fs.writeFileSync(RELATED_JS, js, 'utf8');
console.log('related.js updated with images + light-mode colors');
