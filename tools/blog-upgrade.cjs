#!/usr/bin/env node
/**
 * Blog Upgrade Script: Dark → Light mode + missing scripts + nav update
 * Transforms 18 articles from dark CSS to light CSS (matching sobreentrenamiento reference)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES = [
  'blog/duatlon-principiantes-guia.html',
  'blog/running-y-suelo-pelvico.html',
  'blog/cadencia-running-ideal.html',
  'blog/correr-con-diabetes.html',
  'blog/test-cooper-running.html',
  'blog/correr-con-70-anos.html',
  'blog/carreras-nocturnas-espana.html',
  'blog/plan-entrenamiento-5k-sub-25.html',
  'blog/como-pasar-de-running-a-triatlon.html',
  'blog/en/duathlon-beginners-guide.html',
  'blog/en/running-pelvic-floor-guide.html',
  'blog/en/ideal-running-cadence.html',
  'blog/en/running-with-diabetes-guide.html',
  'blog/en/cooper-test-running-guide.html',
  'blog/en/running-at-70-years-old.html',
  'blog/en/night-races-spain-2026.html',
  'blog/en/5k-sub-25-training-plan.html',
  'blog/en/transition-running-to-triathlon.html',
];

// === CSS REPLACEMENTS (dark → light) ===
const CSS_REPLACEMENTS = [
  // Body
  ['background:#0b1220;color:#fff', 'background:#fef7ed;color:#3d3229'],
  // Nav wrapper
  ['background:rgba(11,18,32,.97)', 'background:rgba(254,247,237,.97)'],
  ['border-bottom:1px solid rgba(255,255,255,.06)', 'border-bottom:1px solid #efe6db'],
  // Nav links container
  ['background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)', 'background:rgba(0,0,0,.03);padding:4px;border-radius:999px;border:1px solid #efe6db'],
  // Nav links
  ['color:#94a3b8;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)', 'color:#5c4d3d;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(0,0,0,.02);border:1px solid #efe6db'],
  // Hero gradient overlay
  ['background:linear-gradient(to bottom,rgba(11,18,32,.45) 0%,rgba(11,18,32,.75) 60%,#0b1220 100%)', 'background:linear-gradient(to bottom,rgba(11,18,32,.45) 0%,rgba(11,18,32,.65) 50%,rgba(248,249,250,.95) 100%)'],
  // Hero subtitle
  ['color:#cbd5e1;max-width:640px', 'color:#e2e8f0;max-width:640px'],
  // Content block
  ['background:rgba(255,255,255,.025);border-radius:20px', 'background:rgba(0,0,0,.015);border-radius:20px'],
  // Headings
  ['margin:40px 0 16px;color:#fff}', 'margin:40px 0 16px;color:#3d3229}'],
  // H3 color
  ['color:#f97316}h3{font-size', 'color:#3d3229}h3{font-size'],  // h2 then h3
  ['margin:24px 0 8px;color:#f97316', 'margin:24px 0 8px;color:#ea580c'],
  // Paragraphs
  ['margin-bottom:16px;color:#cbd5e1', 'margin-bottom:16px;color:#334155'],
  // Lists
  ['margin-bottom:8px;color:#cbd5e1', 'margin-bottom:8px;color:#334155'],
  ['li strong{color:#fff}', 'li strong{color:#ea580c}'],
  // Tip box
  ['background:rgba(249,115,22,.08);border-left', 'background:rgba(249,115,22,.06);border-left'],
  // Product card
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px', 'background:#fffcf9;border:1px solid #efe6db;border-radius:16px'],
  // Spec item
  ['background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px', 'background:#fffcf9;border:1px solid #efe6db;border-radius:10px'],
  // Spec label
  ['.spec-label{display:block;color:#64748b', '.spec-label{display:block;color:#8b7355'],
  // Spec value
  ['.spec-value{color:#fff;font-weight', '.spec-value{color:#3d3229;font-weight'],
  // Table header
  ['background:rgba(249,115,22,.12);color:#f97316', 'background:rgba(249,115,22,.08);color:#ea580c'],
  // Table row hover
  ['background:rgba(255,255,255,.02)', 'background:rgba(249,115,22,.03)'],
  // Table td
  ['.comparison-table td{color:#cbd5e1', '.comparison-table td{color:#334155'],
  ['.comparison-table td:first-child{color:#fff', '.comparison-table td:first-child{color:#3d3229'],
  // Table borders
  ['border-bottom:1px solid rgba(255,255,255,.06)', 'border-bottom:1px solid #efe6db'],
  // FAQ item
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px', 'background:#fffcf9;border:1px solid #efe6db;border-radius:12px'],
  // CTA box paragraph
  ['.cta-box p{color:#94a3b8', '.cta-box p{color:#5c4d3d'],
  // Newsletter
  ['.newsletter{margin:40px 0;padding:32px;background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.12)', '.newsletter{margin:40px 0;padding:32px;background:#fffcf9;border:1px solid #efe6db'],
  ['.newsletter p{color:#94a3b8', '.newsletter p{color:#5c4d3d'],
  ['.newsletter input{flex:1;min-width:200px;padding:10px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff', '.newsletter input{flex:1;min-width:200px;padding:10px 16px;background:#fff;border:1px solid #efe6db;border-radius:12px;color:#3d3229'],
  ['.newsletter input:focus{border-color:#f97316', '.newsletter input:focus{border-color:#f97316'],
  // Related
  ['.related{margin:40px 0 0;padding:24px 0;border-top:1px solid rgba(255,255,255,.06)', '.related{margin:40px 0 0;padding:24px 0;border-top:1px solid #efe6db'],
  // TOC
  ['.toc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px 24px', '.toc{background:#fffcf9;border:1px solid #efe6db;border-left:3px solid #f97316;border-radius:12px;padding:20px 24px'],
  ['.toc h2{font-size:1rem;margin:0 0 12px;color:#f97316', '.toc h2{font-size:.95rem;margin:0 0 12px;color:#3d3229'],
  ['.toc a{color:#94a3b8;text-decoration:none;font-size:.9rem', '.toc a{color:#5c4d3d;text-decoration:none;font-size:.88rem'],
  // Cookie banner
  ['.cookie-banner{position:fixed;bottom:0;left:0;right:0;background:rgba(11,18,32,.97);border-top:1px solid rgba(255,255,255,.1)', '.cookie-banner{position:fixed;bottom:0;left:0;right:0;background:rgba(254,247,237,.97);border-top:1px solid #efe6db'],
  ['.cookie-inner p{font-size:.85rem;color:#94a3b8', '.cookie-inner p{font-size:.85rem;color:#5c4d3d'],
  ['.btn-reject{background:rgba(255,255,255,.06);color:#94a3b8;border:1px solid rgba(255,255,255,.1)', '.btn-reject{background:#fff;color:#5c4d3d;border:1px solid #efe6db'],
  ['.btn-reject:hover{color:#fff}', '.btn-reject:hover{color:#3d3229}'],
  // Product image bg
  ['.product-img{text-align:center;padding:16px;background:rgba(255,255,255,.95)', '.product-img{text-align:center;padding:16px;background:#fff'],
  // Plan week
  ['.plan-week{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)', '.plan-week{background:#fffcf9;border:1px solid #efe6db'],
];

// === FOOTER COLOR REPLACEMENTS (inline styles) ===
const FOOTER_REPLACEMENTS = [
  // Footer heading colors
  ['style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px"', 'style="color:#3d3229;font-weight:700;font-size:.9rem;margin-bottom:16px" class="footer-heading"'],
  // Footer link colors
  ['style="color:#94a3b8;text-decoration:none;font-size:.85rem"', 'style="color:#8b7355;text-decoration:none;font-size:.85rem"'],
  // Footer bottom border
  ['style="border-top:1px solid rgba(255,255,255,.06);padding-top:24px;text-align:center"', 'style="border-top:1px solid #efe6db;padding-top:24px;text-align:center"'],
  // Footer copyright
  ['style="color:#64748b;font-size:.8rem"', 'style="color:#8b7355;font-size:.8rem"'],
  // Fix heart emoji (some have "amor" instead of heart)
  ['Hecho con amor para runners.', 'Hecho con &#10084;&#65039; para runners.'],
];

// === NAV UPDATE ===
const NAV_OLD = `<div class="nav-links">
      <a href="/matching/">Matching</a>
      <a href="/cities/">Ciudades</a>
      <a href="/blog/" class="active">Blog</a>
      <a href="/#app">App</a>
    </div>`;

const NAV_NEW = `<div class="nav-links">
      <a href="/matching/">Matching</a>
      <a href="/planes/">Planes</a>
      <a href="/carreras/">Carreras</a>
      <a href="/blog/" class="active">Blog</a>
    </div>`;

// === NAV LOGO UPDATE ===
const LOGO_OLD = '<a href="/">CORRER<b>JUNTOS</b></a>';
const LOGO_NEW = '<a href="/" class="nav-logo" style="text-decoration:none;font-weight:900;font-size:1.1rem;letter-spacing:-0.02em"><span style="color:#3d3229">CORRER</span><span style="color:#f97316">JUNTOS</span></a>';

// === NAV AUTH UPDATE (add theme toggle) ===
const AUTH_OLD_ES = `<div class="nav-auth" style="display:flex;gap:8px;align-items:center">
    <a href="/" style="color:#94a3b8;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">Entrar</a>
    <a href="/" style="background:#f97316;color:#fff;font-size:.85rem;font-weight:700;padding:6px 16px;border-radius:999px;text-decoration:none">Únete</a>
  </div>`;

const AUTH_NEW_ES = `<div class="nav-auth" style="display:flex;gap:8px;align-items:center">
    <button class="theme-toggle" onclick="toggleBlogTheme()" aria-label="Cambiar tema">&#9728;&#65039;</button>
    <a href="/" style="background:#f97316;color:#fff;font-size:.85rem;font-weight:700;padding:6px 16px;border-radius:999px;text-decoration:none">&Uacute;nete</a>
  </div>`;

// EN version may have "Sign In" / "Join"
const AUTH_OLD_EN = `<div class="nav-auth" style="display:flex;gap:8px;align-items:center">
    <a href="/" style="color:#94a3b8;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">Sign In</a>
    <a href="/" style="background:#f97316;color:#fff;font-size:.85rem;font-weight:700;padding:6px 16px;border-radius:999px;text-decoration:none">Join Free</a>
  </div>`;

const AUTH_NEW_EN = `<div class="nav-auth" style="display:flex;gap:8px;align-items:center">
    <button class="theme-toggle" onclick="toggleBlogTheme()" aria-label="Toggle theme">&#9728;&#65039;</button>
    <a href="/" style="background:#f97316;color:#fff;font-size:.85rem;font-weight:700;padding:6px 16px;border-radius:999px;text-decoration:none">Join Free</a>
  </div>`;

// === DARK MODE CSS + THEME SCRIPT (to inject before </style></head>) ===
const DARK_MODE_CSS = `
.toc{background:#fffcf9;border:1px solid #efe6db;border-left:3px solid #f97316;border-radius:12px;padding:20px 24px;margin:0 0 32px}.toc h2{font-size:.95rem;color:#3d3229;margin:0 0 12px}.toc ul{list-style:none;margin:0;padding:0}.toc li{margin:4px 0}.toc a{color:#5c4d3d;text-decoration:none;font-size:.88rem;transition:color .2s}.toc a:hover{color:#f97316}
.nav-social{display:flex;gap:6px;align-items:center;margin:0 8px}
.nav-social a{color:#8b7355;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;transition:color .2s;text-decoration:none}
.nav-social a:hover{color:#f97316}
.nav-social svg{width:16px;height:16px;fill:currentColor}
@media(max-width:768px){.nav-social{display:none}}
.dark-mode{background:#0b1220;color:#fff}
.dark-mode .nav-wrapper{background:rgba(11,18,32,.97);border-bottom-color:rgba(255,255,255,.06)}
.dark-mode .nav-links{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
.dark-mode .nav-links a{color:#94a3b8;background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)}
.dark-mode .nav-links a.active{color:#fff}
.dark-mode .nav-social a{color:#94a3b8}
.dark-mode .hero-bg::after{background:linear-gradient(to bottom,rgba(11,18,32,.55) 0%,rgba(11,18,32,.75) 50%,rgba(11,18,32,.95) 100%)}
.dark-mode .hero p,.dark-mode .hero-content p{color:#cbd5e1}
.dark-mode .breadcrumb{color:#64748b}
.dark-mode h2{color:#fff}
.dark-mode .content{background:rgba(255,255,255,.025)}
.dark-mode p{color:#cbd5e1}
.dark-mode .tip{background:rgba(249,115,22,.08)}
.dark-mode .toc{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.dark-mode .toc a{color:#94a3b8}
.dark-mode .faq-item{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.dark-mode .newsletter{background:rgba(249,115,22,.04);border-color:rgba(249,115,22,.12)}
.dark-mode .newsletter input{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff}
.dark-mode .related{border-top-color:rgba(255,255,255,.06)}
.dark-mode .cta-box{background:rgba(249,115,22,.04);border-color:rgba(249,115,22,.12)}
.dark-mode .cookie-banner{background:rgba(11,18,32,.97);border-top-color:rgba(255,255,255,.1)}
.dark-mode .btn-reject{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1)}`;

const THEME_SCRIPT = `<script>(function(){var s=localStorage.getItem('blog_theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark-mode')})()</script>`;

// === FAVICONS + PRECONNECT (to add at start of <head>) ===
const HEAD_ADDITIONS = `<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">`;

const PRECONNECT = '<link rel="preconnect" href="https://images.pexels.com" crossorigin>';

// === CRO.JS SCRIPT ===
const CRO_SCRIPT = '<script src="/blog/cro.js" defer></script>';

// === GA4 ID FIX ===
// Some articles may have wrong GA4 ID
const GA4_WRONG = 'G-Z21L8G8FJC';
const GA4_CORRECT = 'G-RQYYGNC12T';

let stats = { processed: 0, cssFixed: 0, navFixed: 0, croAdded: 0, errors: [] };

for (const relPath of FILES) {
  const filePath = path.join(ROOT, relPath);
  try {
    let html = fs.readFileSync(filePath, 'utf-8');
    const origLen = html.length;
    const isEN = relPath.includes('/en/');

    // 1. CSS color replacements
    for (const [dark, light] of CSS_REPLACEMENTS) {
      html = html.split(dark).join(light);
    }

    // 2. Footer inline style replacements
    for (const [old, rep] of FOOTER_REPLACEMENTS) {
      html = html.split(old).join(rep);
    }

    // 3. Nav update
    html = html.split(NAV_OLD).join(NAV_NEW);

    // 4. Logo update
    html = html.split(LOGO_OLD).join(LOGO_NEW);

    // 5. Auth section update
    if (isEN) {
      html = html.split(AUTH_OLD_EN).join(AUTH_NEW_EN);
    } else {
      html = html.split(AUTH_OLD_ES).join(AUTH_NEW_ES);
    }

    // 6. Add favicons + preconnect if missing
    if (!html.includes('icon.svg')) {
      html = html.replace('<meta charset="UTF-8">', HEAD_ADDITIONS + '\n<meta charset="UTF-8">');
    }
    if (!html.includes('preconnect')) {
      html = html.replace('<meta charset="UTF-8">', PRECONNECT + '\n<meta charset="UTF-8">');
    }

    // 7. Add dark mode CSS + theme script before </head>
    if (!html.includes('.dark-mode{')) {
      // Insert before the closing </style> that's right before </head>
      html = html.replace('</style>\n</head>', DARK_MODE_CSS + '\n</style>\n' + THEME_SCRIPT + '\n</head>');
      // Try alternate format
      if (!html.includes('.dark-mode{')) {
        html = html.replace('</style></head>', DARK_MODE_CSS + '</style>' + THEME_SCRIPT + '</head>');
      }
    }

    // 8. Add cro.js if missing
    if (!html.includes('cro.js')) {
      html = html.replace('<script src="/blog/city-links.js" defer></script>', '<script src="/blog/city-links.js" defer></script>\n' + CRO_SCRIPT);
      // If city-links not found, add after enhance.js
      if (!html.includes('cro.js')) {
        html = html.replace('<script src="/blog/enhance.js" defer></script>', '<script src="/blog/enhance.js" defer></script>\n' + CRO_SCRIPT);
      }
      stats.croAdded++;
    }

    // 9. Fix GA4 ID if wrong
    html = html.split(GA4_WRONG).join(GA4_CORRECT);

    if (html.length !== origLen) {
      stats.cssFixed++;
    }

    fs.writeFileSync(filePath, html, 'utf-8');
    stats.processed++;
    console.log(`OK ${relPath} (${origLen} -> ${html.length} bytes)`);

  } catch (err) {
    stats.errors.push(`${relPath}: ${err.message}`);
    console.error(`ERROR ${relPath}: ${err.message}`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Processed: ${stats.processed}/${FILES.length}`);
console.log(`CSS fixed: ${stats.cssFixed}`);
console.log(`CRO.js added: ${stats.croAdded}`);
if (stats.errors.length) {
  console.log(`Errors: ${stats.errors.join(', ')}`);
}
