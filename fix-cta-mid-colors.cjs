#!/usr/bin/env node
/**
 * Fix cta-mid light-mode colors across blog articles.
 * - Heading "Encuentra tu grupo..." / "Find your running...": #fff → #3d3229
 * - Subtitle "5.000+ runners...": #94a3b8 → #5c4d3d
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

    // 1. Fix cta-mid heading color: color:#fff → #3d3229 (only in cta-mid context)
    html = html.replace(
      /color:#fff;font-weight:700;font-size:\.95rem;margin:0 0 4px/g,
      'color:#3d3229;font-weight:700;font-size:.95rem;margin:0 0 4px'
    );

    // 2. Fix cta-mid subtitle color: #94a3b8 in the 5000+ runners line
    html = html.replace(
      /color:#94a3b8;font-size:\.85rem;margin:0">(5[\.\,]000\+)/g,
      'color:#5c4d3d;font-size:.85rem;margin:0">$1'
    );

    if (html !== orig) {
      fs.writeFileSync(full, html, 'utf8');
      updated++;
    }
  }
}

walk(BLOG_DIR);
console.log(`Done — updated ${updated} files`);
