'use strict';
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');

function findHtml(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...findHtml(fp));
    else if (e.name.endsWith('.html')) results.push(fp);
  }
  return results;
}

const dirs = ['blog', 'carreras', 'races', 'planes', 'plans', 'places', 'events', 'cities', 'matching'];
const allFiles = dirs.flatMap(d => findHtml(path.join(BASE, d)));

let updated = 0;

for (const fp of allFiles) {
  let content = fs.readFileSync(fp, 'utf-8');
  let changed = false;

  // 1. Remove "App" link from nav-links (various indentations)
  if (content.includes('/#app">App</a>')) {
    content = content.replace(/\s*<a href="\/#app">App<\/a>\s*/g, '\n    ');
    changed = true;
  }

  // 2. Remove entire nav-social div (the whole block with SVG icons)
  // Pattern: <div class="nav-social">...anything...</div> followed by newlines
  const socialRegex = /\s*<div class="nav-social">[\s\S]*?<\/div>\s*/;
  if (socialRegex.test(content)) {
    content = content.replace(socialRegex, '\n\n  ');
    changed = true;
  }

  // 3. Remove "Entrar"/"Login" link from nav-auth (keep theme toggle + Únete/Sign Up)
  // ES: <a href="/" style="color:#5c4d3d;...">Entrar</a>
  content = content.replace(/<a href="\/" style="color:#5c4d3d;[^"]*">Entrar<\/a>\s*/g, '');
  // EN: <a href="/" style="color:#5c4d3d;...">Login</a>
  content = content.replace(/<a href="\/" style="color:#5c4d3d;[^"]*">Login<\/a>\s*/g, '');

  // 4. Update logo to bicolor: CORRER (dark) + JUNTOS (orange)
  // Current patterns:
  //   <a href="/">CORRER<b>JUNTOS</b></a>  (blog articles - all orange via CSS)
  //   <a href="/" class="nav-logo">CORRER<b>JUNTOS</b></a>  (hub pages)
  // New: explicit inline colors for consistency
  const oldLogo1 = '<a href="/">CORRER<b>JUNTOS</b></a>';
  const oldLogo2 = '<a href="/" class="nav-logo">CORRER<b>JUNTOS</b></a>';
  const newLogo = '<a href="/" class="nav-logo" style="text-decoration:none;font-weight:900;font-size:1.1rem;letter-spacing:-0.02em"><span style="color:#3d3229">CORRER</span><span style="color:#f97316">JUNTOS</span></a>';

  if (content.includes(oldLogo1)) {
    content = content.replace(oldLogo1, newLogo);
    changed = true;
  } else if (content.includes(oldLogo2)) {
    content = content.replace(oldLogo2, newLogo);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, content, 'utf-8');
    updated++;
  }
}

console.log(`Updated: ${updated} files`);
console.log(`Total scanned: ${allFiles.length}`);
