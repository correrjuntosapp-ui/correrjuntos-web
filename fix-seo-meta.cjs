/**
 * SEO Fix Script:
 * 1. Add <meta name="robots" content="index, follow"> to all pages missing it
 * 2. Truncate meta descriptions over 155 characters
 * 3. Remove emojis from meta descriptions
 */
const fs = require('fs');
const path = require('path');
const glob = require('path');

const dirs = ['blog', 'cities', 'equipamiento', 'legal', 'stats'];
const rootFiles = ['index.html'];

function getHtmlFiles(dir) {
  const fullDir = path.join(__dirname, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(fullDir, f));
}

const files = [];
dirs.forEach(d => files.push(...getHtmlFiles(d)));
// Don't add root index.html (already has robots)

let robotsAdded = 0;
let descFixed = 0;

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(__dirname, file);
  let changed = false;

  // 1. Add meta robots if missing
  if (!/<meta\s+name=["']robots["']/i.test(html)) {
    // Insert after <meta name="description" ...> or after <meta charset
    const descMatch = html.match(/<meta\s+name=["']description["'][^>]*>/i);
    if (descMatch) {
      const insertAfter = descMatch[0];
      html = html.replace(insertAfter, insertAfter + '\n    <meta name="robots" content="index, follow">');
      robotsAdded++;
      changed = true;
    }
  }

  // 2. Fix meta descriptions over 155 chars
  const descRegex = /(<meta\s+name=["']description["']\s+content=["'])([^"']+)(["'][^>]*>)/i;
  const match = html.match(descRegex);
  if (match) {
    let desc = match[2];
    const origLen = desc.length;

    // Remove emojis
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FFFF}]\s*/gu;
    desc = desc.replace(emojiRegex, '').trim();

    // Truncate to 155 chars at word boundary
    if (desc.length > 155) {
      let truncated = desc.substring(0, 155);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 120) {
        truncated = truncated.substring(0, lastSpace);
      }
      // Remove trailing punctuation fragments
      truncated = truncated.replace(/[,\s]+$/, '');
      // Add period if doesn't end with one
      if (!/[.!?]$/.test(truncated)) truncated += '.';
      desc = truncated;
    }

    if (desc !== match[2]) {
      html = html.replace(descRegex, `${match[1]}${desc}${match[3]}`);
      console.log(`  ${rel}: ${origLen} → ${desc.length} chars`);
      descFixed++;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
  }
});

console.log(`\n✓ Meta robots added to ${robotsAdded} files`);
console.log(`✓ Meta descriptions fixed in ${descFixed} files`);
