#!/usr/bin/env node
/**
 * FIX: Dark-mode colors in embedded <style> CSS rules (NOT inline style="" attrs).
 * Previous script fixed inline styles; this fixes CSS rules in <style> blocks.
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');
let totalUpdated = 0;

const replacements = [
  // 1. Table cell text: td{...color:#cbd5e1} (63 files)
  { find: 'td{padding:10px 12px;border-bottom:1px solid #efe6db;color:#cbd5e1}',
    replace: 'td{padding:10px 12px;border-bottom:1px solid #efe6db;color:#5c4d3d}' },

  // 2. Table hover: tr:hover td{background:rgba(255,255,255,.02)} (160 files)
  { find: 'tr:hover td{background:rgba(255,255,255,.02)}',
    replace: 'tr:hover td{background:rgba(0,0,0,.02)}' },

  // 3. FAQ/Details background (14 files)
  { find: 'details{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)',
    replace: 'details{background:#fffcf9;border:1px solid #efe6db' },

  // 4. FAQ summary white text (29 files)
  { find: 'summary{padding:16px 20px;cursor:pointer;font-weight:700;color:#fff',
    replace: 'summary{padding:16px 20px;cursor:pointer;font-weight:700;color:#3d3229' },

  // 5. Details div text color:#cbd5e1 (14 files)
  { find: 'details div{padding:0 20px 16px;color:#cbd5e1',
    replace: 'details div{padding:0 20px 16px;color:#5c4d3d' },

  // 6. TOC dark background remaining
  { find: '.toc{background:rgba(255,255,255,.03);border:1px solid rgba(0,0,0,.08)',
    replace: '.toc{background:#fffcf9;border:1px solid #efe6db' },
  { find: '.toc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1)',
    replace: '.toc{background:#fffcf9;border:1px solid #efe6db' },

  // 7. TOC heading color:#fff / #e2e8f0 in CSS
  { find: '.toc h2{font-size:.95rem;color:#fff',
    replace: '.toc h2{font-size:.95rem;color:#3d3229' },
  { find: '.toc h2{font-size:1rem;color:#fff',
    replace: '.toc h2{font-size:1rem;color:#3d3229' },
  { find: '.toc h2{font-size:.95rem;color:#e2e8f0',
    replace: '.toc h2{font-size:.95rem;color:#3d3229' },

  // 8. TOC link color:#94a3b8 in CSS
  { find: '.toc a{color:#94a3b8',
    replace: '.toc a{color:#5c4d3d' },

  // 9. Cookie banner text (if in CSS)
  { find: '.cookie-banner{position:fixed;bottom:0;left:0;right:0;background:rgba(254,247,237,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,.1)',
    replace: '.cookie-banner{position:fixed;bottom:0;left:0;right:0;background:rgba(254,247,237,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid #efe6db' },

  // 10. Cookie banner text color
  { find: 'font-size:.85rem;color:#94a3b8}.cookie-banner a',
    replace: 'font-size:.85rem;color:#5c4d3d}.cookie-banner a' },

  // 11. Cookie reject button
  { find: '.cookie-banner .btn-reject{background:rgba(255,255,255,.08);color:#94a3b8}',
    replace: '.cookie-banner .btn-reject{background:rgba(0,0,0,.05);color:#5c4d3d}' },

  // 12. Newsletter input dark colors
  { find: 'background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff',
    replace: 'background:#fffcf9;border:1px solid #efe6db;border-radius:12px;color:#3d3229' },

  // 13. Footer color fixes
  { find: '.footer{text-align:center;padding:32px 20px;border-top:1px solid rgba(255,255,255,.06)',
    replace: '.footer{text-align:center;padding:32px 20px;border-top:1px solid #efe6db' },
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!entry.name.endsWith('.html')) continue;

    let html = fs.readFileSync(full, 'utf8');
    const orig = html;

    for (const r of replacements) {
      // Use simple string replacement (not regex) for exact CSS patterns
      while (html.includes(r.find)) {
        html = html.replace(r.find, r.replace);
      }
    }

    if (html !== orig) {
      fs.writeFileSync(full, html, 'utf8');
      totalUpdated++;
    }
  }
}

walk(BLOG_DIR);
console.log(`Done — updated ${totalUpdated} files`);
