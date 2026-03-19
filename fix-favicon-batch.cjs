/**
 * Add favicon links to all blog HTML files that don't have them.
 * Inserts after <head> tag.
 */
const fs = require('fs');
const path = require('path');

const FAVICON_LINES = `
<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">`;

function walkHtml(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walkHtml(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

const files = walkHtml(path.join(process.cwd(), 'blog'));

let modified = 0;
let skipped = 0;

for (const file of files) {
  const full = file;
  let html = fs.readFileSync(full, 'utf8');

  // Skip if already has favicon
  if (html.includes('rel="icon"')) {
    // But check if it only has the old single-line version and upgrade it
    if (html.includes('icon-192.png') && !html.includes('icon.svg')) {
      // Replace old single favicon with full set
      html = html.replace(
        /<link rel="icon" type="image\/png" href="\/icons\/icon-192\.png">\n?/,
        FAVICON_LINES.trim() + '\n'
      );
      fs.writeFileSync(full, html, 'utf8');
      modified++;
      console.log(`UPGRADED: ${path.relative(process.cwd(), file)}`);
    } else {
      skipped++;
    }
    continue;
  }

  // Insert after <head>
  html = html.replace('<head>', '<head>' + FAVICON_LINES);
  fs.writeFileSync(full, html, 'utf8');
  modified++;
  console.log(`ADDED: ${path.relative(process.cwd(), file)}`);
}

console.log(`\nDone! Modified: ${modified}, Skipped: ${skipped}, Total: ${files.length}`);
