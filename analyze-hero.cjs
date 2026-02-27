/**
 * analyze-hero.cjs — diagnose hero nesting using depth tracking
 * Walks through div opens/closes to check if hero div returns to depth 0
 * before the content div starts.
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

let ok = 0;
let broken = [];

walk(path.join(BASE_DIR, 'blog')).forEach(f => {
  const rel = path.relative(BASE_DIR, f).replace(/\\/g, '/');
  if (rel.includes('index.html') || rel.includes('categoria/') || rel.includes('autor/')) return;

  const html = fs.readFileSync(f, 'utf-8');
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

  // Walk through the section from heroStart to contentStart tracking depth
  const section = html.substring(heroStart, contentStart);

  // Find all div opens and closes with their positions
  const events = [];
  let re;

  re = /<div[\s>]/g;
  let m;
  while ((m = re.exec(section)) !== null) {
    events.push({ pos: m.index, type: 'open' });
  }

  re = /<\/div>/g;
  while ((m = re.exec(section)) !== null) {
    events.push({ pos: m.index, type: 'close' });
  }

  // Sort by position
  events.sort((a, b) => a.pos - b.pos);

  // Track depth starting from 0
  let depth = 0;
  let heroClosed = false;
  for (const ev of events) {
    if (ev.type === 'open') {
      depth++;
    } else {
      depth--;
      if (depth === 0) {
        heroClosed = true;
        break;
      }
    }
  }

  if (heroClosed) {
    ok++;
  } else {
    broken.push({ file: rel, finalDepth: depth });
  }
});

console.log('OK (hero closed before content):', ok);
console.log('BROKEN (content inside hero):', broken.length);
if (broken.length > 0) {
  console.log('\nBroken files:');
  broken.forEach(b => {
    console.log(`  ${b.file} (depth at content: ${b.finalDepth})`);
  });
}
