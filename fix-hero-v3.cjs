/**
 * fix-hero-v3.cjs
 * Final fix using depth tracking to close hero div.
 * Handles ALL content div patterns including <div class="container content">.
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together'].includes(e.name)) continue;
      walk(p, files);
    } else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}

let heroFixed = 0;
let textAlignFixed = 0;
let alreadyOk = 0;

walk(path.join(BASE_DIR, 'blog')).forEach(f => {
  const rel = path.relative(BASE_DIR, f).replace(/\\/g, '/');
  if (rel.includes('index.html') || rel.includes('categoria/') || rel.includes('autor/')) return;

  let html = fs.readFileSync(f, 'utf-8');
  let changed = false;

  const heroStart = html.indexOf('<div class="hero">');
  if (heroStart < 0) return;

  // Find FIRST content div (either pattern)
  const pat1 = html.indexOf('<div class="content">', heroStart);
  const pat2 = html.indexOf('<div class="container content">', heroStart);
  let contentStart = -1;
  if (pat1 >= 0 && pat2 >= 0) contentStart = Math.min(pat1, pat2);
  else if (pat1 >= 0) contentStart = pat1;
  else if (pat2 >= 0) contentStart = pat2;
  if (contentStart < 0) return;

  // Walk through section tracking depth to see if hero closes
  const section = html.substring(heroStart, contentStart);
  const events = [];
  let re, m;

  re = /<div[\s>]/g;
  while ((m = re.exec(section)) !== null) {
    events.push({ pos: m.index, type: 'open' });
  }
  re = /<\/div>/g;
  while ((m = re.exec(section)) !== null) {
    events.push({ pos: m.index, type: 'close' });
  }
  events.sort((a, b) => a.pos - b.pos);

  let depth = 0;
  let heroClosed = false;
  let lastClosePos = -1;
  for (const ev of events) {
    if (ev.type === 'open') {
      depth++;
    } else {
      depth--;
      lastClosePos = ev.pos;
      if (depth === 0) {
        heroClosed = true;
        break;
      }
    }
  }

  if (!heroClosed && lastClosePos >= 0) {
    // Insert </div> after the last closing div to close hero
    const insertPos = heroStart + lastClosePos + 6; // after "</div>"
    html = html.substring(0, insertPos) + '\n</div>' + html.substring(insertPos);
    heroFixed++;
    changed = true;
    console.log(`  Fixed: ${rel}`);
  } else {
    alreadyOk++;
  }

  // Fix 2: Ensure text-align:left on .content CSS
  if (!html.includes('text-align:left') && !html.includes('text-align: left')) {
    if (html.includes('.content{')) {
      html = html.replace('.content{', '.content{text-align:left;');
      textAlignFixed++;
      changed = true;
    } else if (html.includes('.content {')) {
      html = html.replace('.content {', '.content{text-align:left;');
      textAlignFixed++;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(f, html, 'utf-8');
  }
});

console.log('\n=== Hero Fix V3 Results ===');
console.log(`Hero divs closed: ${heroFixed}`);
console.log(`text-align:left added: ${textAlignFixed}`);
console.log(`Already OK: ${alreadyOk}`);
