/**
 * update-footer-links.cjs
 * Adds /places/ and /events/ links to the Explora column in footer
 * across all city pages and blog articles.
 * Places and events pages already have these links (from generators).
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
let updated = 0;
let skipped = 0;

// Use regex to handle both \r\n and \n line endings, and any indentation
// Match: Ciudades link, then Blog link, then Equipamiento link, then App link
const OLD_RE = /(<a href="\/cities\/"[^>]*>Ciudades<\/a>)\s*(<a href="\/blog\/"[^>]*>Blog<\/a>)\s*(<a href="\/equipamiento\/"[^>]*>Equipamiento<\/a>)\s*(<a href="\/#app"[^>]*>App<\/a>)/;

function updateFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has /places/ and /events/ links
  if (html.includes('href="/places/"') && html.includes('href="/events/"')) {
    skipped++;
    return;
  }

  // Detect line ending style
  const eol = html.includes('\r\n') ? '\r\n' : '\n';

  if (OLD_RE.test(html)) {
    html = html.replace(OLD_RE, (match, ciudades, blog, equip, app) => {
      const indent = '      ';
      return `${indent}<a href="/cities/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Ciudades</a>${eol}${indent}<a href="/places/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Lugares</a>${eol}${indent}<a href="/events/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Eventos</a>${eol}${indent}<a href="/blog/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Blog</a>${eol}${indent}<a href="/#app" style="color:#94a3b8;text-decoration:none;font-size:.85rem">App</a>`;
    });
    fs.writeFileSync(filePath, html, 'utf-8');
    updated++;
  } else {
    skipped++;
  }
}

// Process city pages
const citiesDir = path.join(BASE_DIR, 'cities');
fs.readdirSync(citiesDir).filter(f => f.endsWith('.html')).forEach(f => {
  updateFile(path.join(citiesDir, f));
});

// Process blog articles
const blogDir = path.join(BASE_DIR, 'blog');
fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => {
  updateFile(path.join(blogDir, f));
});

// Process blog/en/ articles
const blogEnDir = path.join(BASE_DIR, 'blog', 'en');
if (fs.existsSync(blogEnDir)) {
  fs.readdirSync(blogEnDir).filter(f => f.endsWith('.html')).forEach(f => {
    updateFile(path.join(blogEnDir, f));
  });
}

// Process other top-level pages
const topLevel = ['index.html', 'sobre-nosotros.html', 'inversores.html', 'privacy.html', 'terms.html'];
topLevel.forEach(f => {
  const fp = path.join(BASE_DIR, f);
  if (fs.existsSync(fp)) updateFile(fp);
});

// Process matching pages
['matching/index.html', 'matching/en/index.html'].forEach(f => {
  const fp = path.join(BASE_DIR, f);
  if (fs.existsSync(fp)) updateFile(fp);
});

// Process app pages
['app/index.html', 'app/en/index.html'].forEach(f => {
  const fp = path.join(BASE_DIR, f);
  if (fs.existsSync(fp)) updateFile(fp);
});

console.log('\n=== Footer Update Results ===');
console.log(`Updated: ${updated}`);
console.log(`Skipped (already has links or pattern not found): ${skipped}`);
