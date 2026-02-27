/**
 * fix-link-colors.cjs
 * Add color:#f97316 to all external authority links (target="_blank" rel="noopener")
 * inside .content that don't already have an inline color style.
 */
const fs = require('fs');
const path = require('path');

const BASE = __dirname;

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together', 'categoria', 'autor', 'category', 'author'].includes(e.name)) continue;
      walk(p, files);
    } else if (e.name.endsWith('.html') && e.name !== 'index.html') {
      files.push(p);
    }
  }
  return files;
}

let fixed = 0;
let linksColored = 0;

const allFiles = walk(path.join(BASE, 'blog'));

allFiles.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Find external links without inline color style
  // Pattern: <a href="..." target="_blank" rel="noopener"> without style="...color..."
  const regex = /<a href="(https?:\/\/[^"]+)" target="_blank" rel="noopener"(?![^>]*style=)/g;

  const newHtml = html.replace(regex, (match, url) => {
    linksColored++;
    changed = true;
    return `<a href="${url}" target="_blank" rel="noopener" style="color:#f97316"`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newHtml, 'utf-8');
    fixed++;
  }
});

console.log(`=== Link Color Fix ===`);
console.log(`Files fixed: ${fixed}`);
console.log(`Links colored: ${linksColored}`);
