/**
 * Add/upgrade favicon links on ALL non-blog HTML pages.
 * Covers: cities, events, places, matching, lead-magnet, and root pages.
 */
const fs = require('fs');
const path = require('path');

const FAVICON_FULL = [
  '<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">',
  '<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">',
  '<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">'
].join('\n');

const DIRS = ['cities', 'events', 'places', 'matching', 'lead-magnet'];

function walkHtml(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walkHtml(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

let modified = 0, skipped = 0;

const files = DIRS.flatMap(d => walkHtml(path.join(process.cwd(), d)));

for (const full of files) {
  let html = fs.readFileSync(full, 'utf8');
  const rel = path.relative(process.cwd(), full);

  if (html.includes('icon.svg')) {
    skipped++;
    continue;
  }

  // Upgrade old single favicon
  if (html.includes('rel="icon"')) {
    html = html.replace(
      /<link rel="icon" type="image\/png" href="\/icons\/icon-192\.png">\n?/,
      FAVICON_FULL + '\n'
    );
    fs.writeFileSync(full, html, 'utf8');
    modified++;
    console.log(`UPGRADED: ${rel}`);
    continue;
  }

  // No favicon at all — insert after <head>
  html = html.replace('<head>', '<head>\n' + FAVICON_FULL);
  fs.writeFileSync(full, html, 'utf8');
  modified++;
  console.log(`ADDED: ${rel}`);
}

console.log(`\nDone! Modified: ${modified}, Skipped: ${skipped}, Total: ${files.length}`);
