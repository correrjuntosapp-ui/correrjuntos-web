#!/usr/bin/env node
/**
 * MEGA FIX: Convert ALL remaining dark-mode inline styles to light-mode
 * across every blog article. Covers:
 *   1. Table <td> text: color:#cbd5e1 → #5c4d3d
 *   2. Table first-col <td>: color:#fff;font-weight:600 → #3d3229
 *   3. Author name <a>: color:#fff;font-weight:700;font-size:1rem → #3d3229
 *   4. Author bio <p>: color:#94a3b8;font-size:.85rem;line-height:1.5 → #5c4d3d
 *   5. Newsletter subtitle <p>: color:#94a3b8;margin-bottom → #5c4d3d
 *   6. Table background: rgba(255,255,255,.03) → rgba(0,0,0,.02)
 *   7. Table border: rgba(255,255,255,.08) → rgba(0,0,0,.08)
 *   8. Table row border: rgba(255,255,255,.06) → rgba(0,0,0,.06)
 *   9. Table alt-row bg: rgba(255,255,255,.015) → rgba(0,0,0,.015)
 *  10. TOC heading: .toc h2 color:#fff → #3d3229 (base CSS, not .dark-mode)
 *  11. TOC links: .toc a{color:#94a3b8 → #5c4d3d
 *  12. Newsletter CSS: .newsletter p{color:#94a3b8 → #5c4d3d
 *  13. Nav "Entrar" link: color:#94a3b8 → #5c4d3d
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');
let totalUpdated = 0;

const replacements = [
  // --- INLINE STYLE FIXES (inside style="...") ---

  // 1. Table cell text color:#cbd5e1 (inline)
  { pattern: /style="([^"]*?)color:#cbd5e1/g, replacement: 'style="$1color:#5c4d3d', label: 'table-td-cbd5e1' },

  // 2. Table first-col cells: color:#fff;font-weight:600 (inline td)
  { pattern: /padding:10px 16px;color:#fff;font-weight:600/g, replacement: 'padding:10px 16px;color:#3d3229;font-weight:600', label: 'table-td-fff-fw600' },

  // 3. Author name link: color:#fff;font-weight:700;font-size:1rem;text-decoration:none
  { pattern: /color:#fff;font-weight:700;font-size:1rem;text-decoration:none/g, replacement: 'color:#3d3229;font-weight:700;font-size:1rem;text-decoration:none', label: 'author-name-fff' },

  // 4. Author bio paragraph: color:#94a3b8;font-size:.85rem;line-height:1.5
  { pattern: /color:#94a3b8;font-size:\.85rem;line-height:1\.5/g, replacement: 'color:#5c4d3d;font-size:.85rem;line-height:1.5', label: 'author-bio-94a3b8' },

  // 5. Newsletter subtitle: color:#94a3b8;margin-bottom
  { pattern: /color:#94a3b8;margin-bottom/g, replacement: 'color:#5c4d3d;margin-bottom', label: 'newsletter-sub-94a3b8' },

  // 6. Nav "Entrar" link: color:#94a3b8;font-size:.85rem (inline)
  { pattern: /style="color:#94a3b8;font-size:\.85rem;/g, replacement: 'style="color:#5c4d3d;font-size:.85rem;', label: 'nav-entrar-94a3b8' },

  // --- TABLE STRUCTURE (inline) ---

  // 7. Table background (not inside .dark-mode)
  { pattern: /style="([^"]*?)background:rgba\(255,255,255,\.03\)/g, replacement: 'style="$1background:rgba(0,0,0,.02)', label: 'table-bg-03' },

  // 8. Table border (inline)
  { pattern: /border:1px solid rgba\(255,255,255,\.08\)/g, replacement: 'border:1px solid rgba(0,0,0,.08)', label: 'table-border-08' },

  // 9. Table row border-bottom (inline)
  { pattern: /style="([^"]*?)border-bottom:1px solid rgba\(255,255,255,\.06\)/g, replacement: 'style="$1border-bottom:1px solid rgba(0,0,0,.06)', label: 'table-row-border-06' },

  // 10. Table alt-row background (inline)
  { pattern: /background:rgba\(255,255,255,\.015\)/g, replacement: 'background:rgba(0,0,0,.015)', label: 'table-alt-bg-015' },

  // --- BASE CSS FIXES (NOT inside .dark-mode blocks) ---
  // These are trickier — we need to only replace in non-.dark-mode CSS context

  // 11. TOC heading: '.toc h2{...color:#fff' or '.toc h2{...color:#e2e8f0'
  //     Only the base (non .dark-mode) version. We look for the pattern that starts the toc CSS.
  { pattern: /\.toc\{[^}]*?background:#1e293b/g, replacement: (m) => m.replace('background:#1e293b', 'background:#fffcf9'), label: 'toc-bg-dark' },
  { pattern: /\.toc h2\{[^}]*?color:#fff/g, replacement: (m) => m.replace('color:#fff', 'color:#3d3229'), label: 'toc-h2-fff' },
  { pattern: /\.toc h2\{[^}]*?color:#e2e8f0/g, replacement: (m) => m.replace('color:#e2e8f0', 'color:#3d3229'), label: 'toc-h2-e2e8f0' },

  // 12. TOC links: .toc a{color:#94a3b8 → #5c4d3d (base CSS, NOT .dark-mode)
  { pattern: /\.toc a\{color:#94a3b8/g, replacement: '.toc a{color:#5c4d3d', label: 'toc-link-94a3b8' },

  // 13. TOC border: .toc{...border:1px solid rgba(255,255,255,.1)
  { pattern: /\.toc\{([^}]*?)border:1px solid rgba\(255,255,255,\.1\)/g, replacement: '.toc{$1border:1px solid #efe6db', label: 'toc-border' },

  // 14. Newsletter CSS p color
  { pattern: /\.newsletter-box p\{color:#94a3b8/g, replacement: '.newsletter-box p{color:#5c4d3d', label: 'newsletter-p-94a3b8' },
  { pattern: /\.newsletter p\{color:#94a3b8/g, replacement: '.newsletter p{color:#5c4d3d', label: 'newsletter-p2-94a3b8' },

  // 15. Cookie banner text
  { pattern: /\.cookie-inner p\{([^}]*?)color:#94a3b8/g, replacement: '.cookie-inner p{$1color:#5c4d3d', label: 'cookie-94a3b8' },

  // 16. Table header th with color:#f97316 but on dark bg — keep orange text but fix border
  { pattern: /border-bottom:2px solid rgba\(255,255,255,\.08\)/g, replacement: 'border-bottom:2px solid rgba(0,0,0,.1)', label: 'th-border-08' },
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!entry.name.endsWith('.html')) continue;

    let html = fs.readFileSync(full, 'utf8');
    const orig = html;

    for (const r of replacements) {
      if (typeof r.replacement === 'function') {
        html = html.replace(r.pattern, r.replacement);
      } else {
        html = html.replace(r.pattern, r.replacement);
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
