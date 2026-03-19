/**
 * fix-sitemap-sync.cjs
 * Full sitemap synchronization:
 *   1. Scans all .html files on disk (blog, blog/en, cities, events, places, matching)
 *   2. Removes sitemap URLs that point to non-existent files
 *   3. Adds missing URLs for files that exist on disk
 *   4. Preserves main pages, lead-magnet, and other non-file URLs
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const SITEMAP = path.join(BASE_DIR, 'sitemap.xml');
const BASE_URL = 'https://www.correrjuntos.com';
const TODAY = new Date().toISOString().split('T')[0];

// ── 1. Collect all valid URLs from disk ──

const validUrls = new Map(); // url → { priority, section }

// Main pages (keep as-is)
const mainPages = [
  { url: '/', priority: '1.0' },
  { url: '/app/', priority: '0.9' },
  { url: '/app/en/', priority: '0.9' },
  { url: '/matching/', priority: '0.9' },
  { url: '/matching/en/', priority: '0.9' },
  { url: '/blog/', priority: '0.9' },
  { url: '/blog/en/', priority: '0.9' },
  { url: '/cities/', priority: '0.8' },
  { url: '/events/', priority: '0.8' },
  { url: '/places/', priority: '0.8' },
];
mainPages.forEach(p => validUrls.set(BASE_URL + p.url, { priority: p.priority, section: 'MAIN' }));

// Lead magnet pages
['lead-magnet/plan-0-5k/', 'lead-magnet/plan-0-5k/en/'].forEach(p => {
  const full = BASE_URL + '/' + p;
  if (fs.existsSync(path.join(BASE_DIR, p.replace(/\/$/, ''), 'index.html')) ||
      fs.existsSync(path.join(BASE_DIR, p.replace(/\/$/, '') + '.html'))) {
    validUrls.set(full, { priority: '0.7', section: 'LEAD MAGNET' });
  }
});

// Helper: scan directory for .html files
function scanDir(dir, urlPrefix, priority, section) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  files.forEach(f => {
    const slug = f.replace('.html', '');
    validUrls.set(`${BASE_URL}${urlPrefix}${slug}`, { priority, section });
  });
}

// Blog ES (root-level articles only, no subdirectories)
scanDir(path.join(BASE_DIR, 'blog'), '/blog/', '0.7', 'BLOG ES');

// Blog EN
scanDir(path.join(BASE_DIR, 'blog', 'en'), '/blog/en/', '0.7', 'BLOG EN');

// Blog subdirectory articles (e.g. /blog/entrenamiento/article.html)
const blogDir = path.join(BASE_DIR, 'blog');
const blogSubdirs = fs.readdirSync(blogDir).filter(f => {
  const fullPath = path.join(blogDir, f);
  return fs.statSync(fullPath).isDirectory() && f !== 'en' && f !== 'images';
});
blogSubdirs.forEach(subdir => {
  scanDir(path.join(blogDir, subdir), `/blog/${subdir}/`, '0.7', 'BLOG ES');
});

// Blog EN subdirectory articles
const blogEnDir = path.join(BASE_DIR, 'blog', 'en');
if (fs.existsSync(blogEnDir)) {
  const blogEnSubdirs = fs.readdirSync(blogEnDir).filter(f => {
    const fullPath = path.join(blogEnDir, f);
    return fs.statSync(fullPath).isDirectory();
  });
  blogEnSubdirs.forEach(subdir => {
    scanDir(path.join(blogEnDir, subdir), `/blog/en/${subdir}/`, '0.7', 'BLOG EN');
  });
}

// Cities
scanDir(path.join(BASE_DIR, 'cities'), '/cities/', '0.7', 'CITIES');

// Events
scanDir(path.join(BASE_DIR, 'events'), '/events/', '0.6', 'EVENTS');

// Places
scanDir(path.join(BASE_DIR, 'places'), '/places/', '0.6', 'PLACES');

// ── 2. Parse existing sitemap ──

const oldXml = fs.readFileSync(SITEMAP, 'utf-8');
const existingUrls = new Set();
const locRegex = /<loc>([^<]+)<\/loc>/g;
let match;
while ((match = locRegex.exec(oldXml)) !== null) {
  existingUrls.add(match[1]);
}

// ── 3. Find URLs to add and remove ──

const toAdd = [];
const toRemove = [];

// URLs on disk but not in sitemap
for (const [url, meta] of validUrls) {
  if (!existingUrls.has(url)) {
    toAdd.push({ url, ...meta });
  }
}

// URLs in sitemap but not on disk (and not a special URL)
const specialPatterns = [
  /\/c4f7e2a9b3d1\.txt/,  // IndexNow key file
  /\.(png|jpg|ico|json|txt)$/,
];
for (const url of existingUrls) {
  if (!validUrls.has(url)) {
    // Check if it's a special file we should keep
    const isSpecial = specialPatterns.some(p => p.test(url));
    if (!isSpecial) {
      toRemove.push(url);
    }
  }
}

// ── 4. Build new sitemap ──

// Group by section
const sections = {};
for (const [url, meta] of validUrls) {
  if (!sections[meta.section]) sections[meta.section] = [];
  sections[meta.section].push({ url, priority: meta.priority });
}

// Sort URLs within each section
for (const sec of Object.values(sections)) {
  sec.sort((a, b) => a.url.localeCompare(b.url));
}

// Build XML
const sectionOrder = ['MAIN', 'LEAD MAGNET', 'BLOG ES', 'BLOG EN', 'CITIES', 'EVENTS', 'PLACES'];
let newXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

for (const sectionName of sectionOrder) {
  const urls = sections[sectionName];
  if (!urls || urls.length === 0) continue;

  newXml += `\n  <!-- ====== ${sectionName} ====== -->`;
  for (const u of urls) {
    newXml += `
  <url>
    <loc>${u.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${u.priority}</priority>
  </url>`;
  }
  newXml += '\n';
}

newXml += `
</urlset>
`;

// ── 5. Write and report ──

fs.writeFileSync(SITEMAP, newXml, 'utf-8');

console.log('\n=== Sitemap Sync Results ===');
console.log(`Previous URLs: ${existingUrls.size}`);
console.log(`Valid URLs on disk: ${validUrls.size}`);
console.log(`URLs ADDED: ${toAdd.length}`);
if (toAdd.length > 0 && toAdd.length <= 20) {
  toAdd.forEach(u => console.log(`  + ${u.url}`));
} else if (toAdd.length > 20) {
  toAdd.slice(0, 10).forEach(u => console.log(`  + ${u.url}`));
  console.log(`  ... and ${toAdd.length - 10} more`);
}
console.log(`URLs REMOVED: ${toRemove.length}`);
if (toRemove.length > 0 && toRemove.length <= 20) {
  toRemove.forEach(u => console.log(`  - ${u}`));
} else if (toRemove.length > 20) {
  toRemove.slice(0, 10).forEach(u => console.log(`  - ${u}`));
  console.log(`  ... and ${toRemove.length - 10} more`);
}

// Section breakdown
console.log('\nSection breakdown:');
for (const sectionName of sectionOrder) {
  const count = (sections[sectionName] || []).length;
  if (count > 0) console.log(`  ${sectionName}: ${count}`);
}
console.log(`\nTotal URLs in new sitemap: ${validUrls.size}`);
