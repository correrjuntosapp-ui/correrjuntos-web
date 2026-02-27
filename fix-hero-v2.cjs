/**
 * fix-hero-v2.cjs
 * Comprehensive fix: close the hero div before content in ALL blog articles.
 * Uses div counting (opens vs closes) between <div class="hero"> and
 * <div class="content"> to determine if hero is properly closed.
 * Also ensures text-align:left on .content CSS.
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

  // ── Fix 1: Close hero div before content ──
  const heroStart = html.indexOf('<div class="hero">');
  if (heroStart < 0) return;

  const contentStart = html.indexOf('<div class="content">', heroStart);
  if (contentStart < 0) return;

  const between = html.substring(heroStart, contentStart);
  const opens = (between.match(/<div[\s>]/g) || []).length;
  const closes = (between.match(/<\/div>/g) || []).length;

  if (opens > closes + 1) {
    // Hero is NOT closed before content — we need to insert </div>
    // Find the insertion point: right before <div class="container"> or <div class="content">
    // Look for the last </div> before contentStart that closes hero-content

    // Strategy: find what comes right before <div class="content">
    // Could be: <div class="container"> or just whitespace after hero-content </div>

    // Find the text right before contentStart and insert </div> to close hero
    // We want to insert </div> after the hero-content closing </div>

    // Find the closing </div> of hero-content (the last </div> before content)
    let searchArea = html.substring(heroStart, contentStart);

    // Find position of last </div> in the area between hero and content
    let lastCloseIdx = -1;
    let searchFrom = 0;
    while (true) {
      const idx = searchArea.indexOf('</div>', searchFrom);
      if (idx < 0) break;
      lastCloseIdx = idx;
      searchFrom = idx + 6;
    }

    if (lastCloseIdx >= 0) {
      // Insert </div> right after the last closing div (which closes hero-content)
      const insertPos = heroStart + lastCloseIdx + 6; // after "</div>"
      html = html.substring(0, insertPos) + '\n</div>' + html.substring(insertPos);
      heroFixed++;
      changed = true;
    }
  } else {
    alreadyOk++;
  }

  // ── Fix 2: Ensure text-align:left on .content CSS ──
  if (!html.includes('text-align:left') && !html.includes('text-align: left')) {
    // Find .content{ in CSS and add text-align:left
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

console.log('=== Hero Fix V2 Results ===');
console.log(`Hero divs closed: ${heroFixed}`);
console.log(`text-align:left added: ${textAlignFixed}`);
console.log(`Already OK: ${alreadyOk}`);
