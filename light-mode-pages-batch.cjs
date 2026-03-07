#!/usr/bin/env node
/**
 * light-mode-pages-batch.cjs
 * Converts cities/, matching/, places/, events/ pages from dark-first to light-first (warm tones)
 * Adds dark-mode toggle, FOUC script, social icons, theme JS
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIRS = ['cities', 'matching', 'matching/en', 'places', 'events'];

function getAllHtmlFiles() {
  let results = [];
  for (const dir of DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        results.push(path.join(fullDir, entry.name));
      }
    }
  }
  return results;
}

// FOUC prevention script
const FOUC_SCRIPT = `<script>(function(){var s=localStorage.getItem('blog_theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark-mode')})()</script>`;

// Theme toggle JS (inline for pages without enhance.js)
const THEME_JS = `<script>
if(document.documentElement.classList.contains('dark-mode')){document.body.classList.add('dark-mode');}
window.toggleBlogTheme=function(){document.body.classList.toggle('dark-mode');document.documentElement.classList.toggle('dark-mode');var d=document.body.classList.contains('dark-mode');localStorage.setItem('blog_theme',d?'dark':'light');document.querySelectorAll('.theme-toggle').forEach(function(b){b.textContent=d?'🌙':'☀️';});};
document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.theme-toggle').forEach(function(b){b.textContent=document.body.classList.contains('dark-mode')?'🌙':'☀️';});});
</script>`;

// Social icons HTML (no YouTube)
const NAV_SOCIAL_HTML = `<div class="nav-social">
    <a href="https://instagram.com/correrjuntosapp/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
    <a href="https://tiktok.com/@correrjuntosapp" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg></a>
    <a href="https://x.com/CorrerJuntos" target="_blank" rel="noopener" aria-label="X"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
    <a href="https://strava.com/clubs/correrjuntos" target="_blank" rel="noopener" aria-label="Strava"><svg viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg></a>
  </div>`;

const THEME_TOGGLE_BTN = `<button class="theme-toggle" onclick="toggleBlogTheme()" aria-label="Cambiar tema" style="background:none;border:1px solid #efe6db;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:1rem;display:inline-flex;align-items:center;justify-content:center">☀️</button>`;

// Nav social + theme toggle CSS
const NAV_SOCIAL_CSS = `.nav-social{display:flex;gap:6px;align-items:center;margin:0 8px}.nav-social a{color:#8b7355;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;transition:color .2s;text-decoration:none}.nav-social a:hover{color:#f97316}.nav-social svg{width:16px;height:16px;fill:currentColor}@media(max-width:768px){.nav-social{display:none}}`;

// Dark mode CSS overrides
const DARK_MODE_CSS = `
.dark-mode{background:#0b1220!important;color:#fff!important}
.dark-mode .nav-wrapper{background:rgba(11,18,32,.97)!important;border-bottom-color:rgba(255,255,255,.06)!important}
.dark-mode .nav-links{background:rgba(255,255,255,.04)!important;border-color:rgba(255,255,255,.08)!important}
.dark-mode .nav-links a{color:#94a3b8!important}
.dark-mode .nav-links a.active{color:#fff!important}
.dark-mode .nav-social a{color:#94a3b8!important}
.dark-mode .theme-toggle{border-color:rgba(255,255,255,.1)!important}
.dark-mode .breadcrumb{color:#64748b!important}
.dark-mode .hero-bg::after{background:linear-gradient(to bottom,rgba(11,18,32,.5) 0%,rgba(11,18,32,.8) 60%,#0b1220 100%)!important}
.dark-mode h2{color:#fff!important}
.dark-mode h3{color:#f97316!important}
.dark-mode p{color:#cbd5e1!important}
.dark-mode li{color:#cbd5e1!important}
.dark-mode li strong{color:#fff!important}
.dark-mode .feature{background:rgba(255,255,255,.04)!important;border-color:rgba(249,115,22,.15)!important}
.dark-mode .cta-box{background:rgba(249,115,22,.05)!important;border-color:rgba(249,115,22,.15)!important}
.dark-mode .cta-box p{color:#94a3b8!important}
.dark-mode .other-cities-section{border-top-color:rgba(255,255,255,.06)!important}
.dark-mode .other-cities-section h2{color:#fff!important}
.dark-mode .other-city-card{border-color:rgba(255,255,255,.06)!important}
.dark-mode .other-places-section{border-top-color:rgba(255,255,255,.06)!important}
.dark-mode .other-places-section h2{color:#fff!important}
.dark-mode .place-card{border-color:rgba(255,255,255,.06)!important}
.dark-mode .info-card{background:rgba(255,255,255,.04)!important;border-color:rgba(255,255,255,.08)!important}
.dark-mode .info-card .label{color:#64748b!important}
.dark-mode .info-card .value{color:#fff!important}
.dark-mode .footer{border-top-color:rgba(255,255,255,.06)!important;color:#475569!important}
.dark-mode .step{background:rgba(255,255,255,.03)!important;border-color:rgba(255,255,255,.06)!important}
.dark-mode .step h3{color:#fff!important}
.dark-mode .step p{color:#94a3b8!important}
.dark-mode .match-card{background:rgba(255,255,255,.04)!important;border-color:rgba(249,115,22,.2)!important}
.dark-mode .match-card .name{color:#fff!important}
.dark-mode .match-card .detail{color:#94a3b8!important}
.dark-mode .match-card .bio{color:#64748b!important;background:rgba(255,255,255,.03)!important}
.dark-mode .compare .row:nth-child(even){background:rgba(255,255,255,.03)!important}
.dark-mode .compare .row.head{background:rgba(255,255,255,.06)!important}
.dark-mode .compare .row .free{color:#64748b!important}
.dark-mode .faq-item{background:rgba(255,255,255,.03)!important;border-color:rgba(255,255,255,.06)!important}
.dark-mode .faq-q{color:#fff!important}
.dark-mode .faq-a{color:#94a3b8!important}
.dark-mode .races-table th{color:#64748b!important;border-bottom-color:rgba(255,255,255,.1)!important}
.dark-mode .races-table td{border-bottom-color:rgba(255,255,255,.04)!important;color:#cbd5e1!important}
.dark-mode .races-table td:first-child{color:#fff!important}
.dark-mode .races-table tr:hover td{background:rgba(255,255,255,.02)!important}
.dark-mode .parkrun-card{background:rgba(255,255,255,.04)!important;border-color:rgba(255,255,255,.08)!important}
.dark-mode .parkrun-card .name{color:#fff!important}
.dark-mode .parkrun-card .details{color:#94a3b8!important}
.dark-mode .event-city-card{border-color:rgba(255,255,255,.06)!important}
`;

// CSS replacements: dark-first → light-first (warm tones)
const CSS_REPLACEMENTS = [
  // Body
  ['background:#0b1220;color:#fff', 'background:#fef7ed;color:#3d3229'],
  // Nav
  ['background:rgba(11,18,32,.97)', 'background:rgba(254,247,237,.97)'],
  ['border-bottom:1px solid rgba(255,255,255,.06)', 'border-bottom:1px solid #efe6db'],
  // Nav links
  ['background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)', 'background:rgba(0,0,0,.03);padding:4px;border-radius:999px;border:1px solid #efe6db'],
  ['color:#94a3b8;text-decoration:none;font-weight:600;padding:7px 16px', 'color:#5c4d3d;text-decoration:none;font-weight:600;padding:7px 16px'],
  // Hero gradient bottom
  [',#0b1220 100%)', ',#fef7ed 100%)'],
  // Headings
  ['color:#fff}', 'color:#3d3229}'],
  // Body text
  ['color:#cbd5e1', 'color:#5c4d3d'],
  // Muted text
  ['color:#94a3b8', 'color:#8b7355'],
  // Feature cards
  ['background:rgba(255,255,255,.04);border:1px solid rgba(249,115,22,.15)', 'background:#fffcf9;border:1px solid rgba(249,115,22,.15)'],
  ['background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)', 'background:#fffcf9;border:1px solid #efe6db'],
  ['background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)', 'background:#fffcf9;border:1px solid #efe6db'],
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)', 'background:#fffcf9;border:1px solid #efe6db'],
  // CTA box
  ['background:rgba(249,115,22,.05);border:1px solid rgba(249,115,22,.15)', 'background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.12)'],
  // Borders
  ['border-top:1px solid rgba(255,255,255,.06)', 'border-top:1px solid #efe6db'],
  ['border:1px solid rgba(255,255,255,.06)', 'border:1px solid #efe6db'],
  ['border:1px solid rgba(255,255,255,.08)', 'border:1px solid #efe6db'],
  ['border-bottom:1px solid rgba(255,255,255,.1)', 'border-bottom:1px solid #efe6db'],
  ['border-bottom:1px solid rgba(255,255,255,.04)', 'border-bottom:1px solid rgba(0,0,0,.04)'],
  // li strong
  ['li strong{color:#fff}', 'li strong{color:#3d3229}'],
  // Compare table
  ['background:rgba(255,255,255,.03)', 'background:rgba(0,0,0,.02)'],
  ['background:rgba(255,255,255,.06)', 'background:rgba(0,0,0,.04)'],
  ['background:rgba(255,255,255,.02)', 'background:rgba(0,0,0,.015)'],
  // Footer
  ['font-size:.85rem;color:#475569', 'font-size:.85rem;color:#8b7355'],
];

let updated = 0, skipped = 0, errors = 0;

const files = getAllHtmlFiles();
console.log(`Found ${files.length} HTML files to process`);

for (const filePath of files) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Skip if already converted
    if (content.includes('toggleBlogTheme') || content.includes('#fef7ed')) {
      skipped++;
      continue;
    }

    // 1. Apply CSS replacements in <style> block
    for (const [search, replace] of CSS_REPLACEMENTS) {
      content = content.split(search).join(replace);
    }

    // 2. Add nav-social CSS before </style>
    content = content.replace('</style>', NAV_SOCIAL_CSS + DARK_MODE_CSS + '</style>');

    // 3. Add FOUC script before </head>
    content = content.replace('</head>', FOUC_SCRIPT + '\n</head>');

    // 4. Add theme JS before </body>
    content = content.replace('</body>', THEME_JS + '\n</body>');

    // 5. Add nav-social icons after nav-links closing div
    // Pattern: find the nav-links closing, then insert social icons
    // Nav structure: <div class="nav-links">...</div> ... <div class="nav-auth" or just auth links
    const navLinksCloseRegex = /(<\/div>\s*)((?:<div class="nav-auth"|<div style="display:flex;gap:8px;align-items:center">|<a href="\/" style="color:))/;
    const navLinksMatch = content.match(navLinksCloseRegex);
    if (navLinksMatch) {
      content = content.replace(navLinksCloseRegex, '$1' + NAV_SOCIAL_HTML + '\n  $2');
    }

    // 6. Add theme toggle button before "Entrar" link in nav
    // Look for the auth area
    const entrarRegex = /(<a href="\/" style="color:[^"]*;font-size:\.85rem;font-weight:600)/;
    if (content.match(entrarRegex)) {
      content = content.replace(entrarRegex, THEME_TOGGLE_BTN + '\n    $1');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      updated++;
    } else {
      skipped++;
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e.message}`);
    errors++;
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
