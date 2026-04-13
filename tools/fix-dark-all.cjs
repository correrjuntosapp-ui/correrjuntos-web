const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const files = execSync('grep -rl "prefers-color-scheme" blog/ || true', { cwd: ROOT, encoding: 'utf-8' }).trim().split('\n').filter(f => f.endsWith('.html'));

const OLD = "(function(){var s=localStorage.getItem('blog_theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark-mode')})()";
const NEW = "(function(){if(localStorage.getItem('blog_theme')==='dark')document.documentElement.classList.add('dark-mode')})()";

let fixed = 0;
for (const f of files) {
  const fp = path.join(ROOT, f);
  let html = fs.readFileSync(fp, 'utf-8');
  if (html.includes(OLD)) {
    html = html.replace(OLD, NEW);
    fs.writeFileSync(fp, html, 'utf-8');
    fixed++;
  }
}
console.log(`Fixed: ${fixed}/${files.length} files`);
