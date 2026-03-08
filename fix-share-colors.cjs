#!/usr/bin/env node
/**
 * Fix share section light-mode colors across blog articles.
 * - "Copiar link" button: dark-mode colors → light-mode
 * - "Compartir:" label: light grey → warm brown
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');
let updated = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!entry.name.endsWith('.html')) continue;

    let html = fs.readFileSync(full, 'utf8');
    const orig = html;

    // 1. Fix "Copiar link" / "Copy link" button colors
    html = html.replace(
      /background:rgba\(255,255,255,\.08\);color:#cbd5e1;border:1px solid rgba\(255,255,255,\.12\)/g,
      'background:rgba(0,0,0,.05);color:#5c4d3d;border:1px solid rgba(0,0,0,.1)'
    );

    // 2. Fix "Compartir:" label color
    html = html.replace(
      /color:#94a3b8;font-size:\.85rem;font-weight:600">(Compartir:|Share:)/g,
      'color:#5c4d3d;font-size:.85rem;font-weight:600">$1'
    );

    if (html !== orig) {
      fs.writeFileSync(full, html, 'utf8');
      updated++;
      console.log('Fixed:', path.relative(__dirname, full));
    }
  }
}

walk(BLOG_DIR);
console.log(`\nDone — updated ${updated} files`);
