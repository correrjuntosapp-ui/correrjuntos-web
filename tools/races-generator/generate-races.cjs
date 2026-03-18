/**
 * generate-races.cjs
 * Generates race/event HTML pages from races-data.json
 * Usage:
 *   node tools/races-generator/generate-races.cjs              # generates all (ES+EN) + hubs + sitemap
 *   node tools/races-generator/generate-races.cjs maraton-valencia  # generates single race (ES + EN if hasEn)
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..', '..');
const CARRERAS_DIR = path.join(BASE_DIR, 'carreras');
const RACES_DIR = path.join(BASE_DIR, 'races');
const DATA_FILE = path.join(__dirname, 'races-data.json');
const SITEMAP_FILE = path.join(BASE_DIR, 'sitemap-races.xml');
const DOMAIN = 'https://www.correrjuntos.com';
const TODAY = '2026-03-17';

if (!fs.existsSync(CARRERAS_DIR)) fs.mkdirSync(CARRERAS_DIR, { recursive: true });
if (!fs.existsSync(RACES_DIR)) fs.mkdirSync(RACES_DIR, { recursive: true });

const races = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const slugArg = process.argv[2];

// ────────────────────────────────────────────
// CSS — Warm light theme (blog style) + dark mode
// ────────────────────────────────────────────
const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;background:#fef7ed;color:#3d3229;line-height:1.7}
.container{max-width:1000px;margin:0 auto;padding:0 20px}

/* Nav */
.nav-wrapper{position:sticky;top:0;z-index:100;background:rgba(254,247,237,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid #efe6db}
.nav{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto}
.nav-logo{color:#f97316;text-decoration:none;font-weight:700;font-size:1.1rem}
.nav-logo b{font-weight:900}
.nav-links{display:flex;gap:4px;font-size:.85rem;background:rgba(0,0,0,.03);padding:4px;border-radius:999px;border:1px solid #efe6db}
.nav-links a{color:#5c4d3d;text-decoration:none;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(0,0,0,.02);border:1px solid #efe6db;transition:all .2s}
.nav-links a:hover{color:#f97316;background:rgba(249,115,22,.12)}
.nav-links a.active{color:#fff;background:rgba(249,115,22,.9);font-weight:700;border-color:transparent}

/* Breadcrumb */
.breadcrumb{padding:16px 0;font-size:.85rem;color:#8b7355}
.breadcrumb a{color:#f97316;text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.breadcrumb span{margin:0 8px}

/* Hero */
.hero{text-align:center;padding:0;position:relative;overflow:hidden;min-height:360px;display:flex;align-items:center;justify-content:center;flex-direction:column}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,18,32,.35) 0%,rgba(11,18,32,.65) 50%,rgba(254,247,237,.95) 100%)}
.hero-content{position:relative;z-index:1;padding:60px 20px 40px;max-width:800px}
.hero h1{font-size:2.2rem;font-weight:900;color:#f97316;margin-bottom:12px;line-height:1.15}
.hero p{font-size:1.1rem;color:#e2e8f0;max-width:640px;margin:0 auto}
.hero-badges{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);color:#fff;padding:8px 16px;border-radius:999px;font-size:.85rem;font-weight:600;border:1px solid rgba(255,255,255,.15)}

/* Content */
.content{padding:40px 0 60px}
h2{font-size:1.5rem;font-weight:800;margin:40px 0 16px;color:#3d3229}
h3{font-size:1.15rem;font-weight:700;margin:24px 0 8px;color:#ea580c}
p{margin-bottom:16px;color:#334155}
ul,ol{margin:0 0 24px 20px}
li{margin-bottom:8px;color:#334155}
li strong{color:#ea580c}
a{color:#f97316}

/* CTA */
.cta{display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:14px 32px;border-radius:50px;font-weight:700;text-decoration:none;font-size:1rem;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 24px rgba(249,115,22,.25)}
.cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(249,115,22,.35);color:#fff}

/* Race info cards */
.race-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:24px 0 32px}
.info-card{background:#fffcf9;border:1px solid #efe6db;border-radius:14px;padding:16px;text-align:center}
.info-card .icon{font-size:1.5rem;margin-bottom:6px}
.info-card .label{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#8b7355;font-weight:600}
.info-card .value{font-size:1.1rem;font-weight:800;color:#3d3229;margin-top:4px}

/* Distance badges */
.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
.badge-maraton{background:rgba(239,68,68,.12);color:#dc2626;border:1px solid rgba(239,68,68,.2)}
.badge-media{background:rgba(234,179,8,.12);color:#b45309;border:1px solid rgba(234,179,8,.2)}
.badge-10k{background:rgba(34,197,94,.12);color:#16a34a;border:1px solid rgba(34,197,94,.2)}
.badge-popular{background:rgba(59,130,246,.12);color:#2563eb;border:1px solid rgba(59,130,246,.2)}
.badge-trail{background:rgba(168,85,247,.12);color:#9333ea;border:1px solid rgba(168,85,247,.2)}

/* Second image */
.race-photo{margin:32px 0;border-radius:16px;overflow:hidden;border:1px solid #efe6db}
.race-photo img{width:100%;height:auto;display:block}

/* Tips */
.tip{background:rgba(249,115,22,.06);border-left:3px solid #f97316;padding:16px 20px;border-radius:0 12px 12px 0;margin:16px 0}
.tip strong{color:#f97316}

/* FAQ */
.faq-section{margin:40px 0}
.faq-item{border:1px solid #efe6db;border-radius:12px;margin-bottom:10px;background:#fffcf9;overflow:hidden}
.faq-item summary{padding:14px 18px;font-weight:700;color:#3d3229;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:'+';font-size:1.2rem;color:#f97316;font-weight:400;transition:transform .2s}
.faq-item[open] summary::after{transform:rotate(45deg)}
.faq-item .faq-answer{padding:0 18px 16px;color:#334155;font-size:.95rem;line-height:1.7}

/* Related */
.related{margin:40px 0 0;padding:24px 0;border-top:1px solid #efe6db}
.related h3{font-size:1rem;margin-bottom:12px;color:#3d3229;font-weight:700}
.related-links{display:flex;flex-wrap:wrap;gap:8px}
.related-links a{color:#f97316;text-decoration:none;padding:6px 14px;border:1px solid rgba(249,115,22,.2);border-radius:999px;font-size:.85rem;white-space:nowrap;transition:background .2s}
.related-links a:hover{background:rgba(249,115,22,.1)}

/* CTA box */
.cta-box{text-align:center;margin:48px 0;padding:40px 20px;background:rgba(249,115,22,.05);border:1px solid rgba(249,115,22,.15);border-radius:24px}
.cta-box h2{margin-top:0}
.cta-box p{color:#5c4d3d;margin-bottom:20px}

/* Newsletter */
.newsletter-box{text-align:center;margin:40px 0;padding:32px 20px;background:rgba(249,115,22,.03);border:1px solid rgba(249,115,22,.1);border-radius:20px}
.newsletter-box h3{color:#3d3229;margin-bottom:8px;font-size:1.1rem}
.newsletter-box form{display:flex;gap:8px;max-width:420px;margin:12px auto 0;flex-wrap:wrap;justify-content:center}
.newsletter-box input[type="email"]{flex:1;min-width:200px;padding:12px 16px;background:#fffcf9;border:1px solid #efe6db;border-radius:12px;color:#3d3229;font-size:.9rem;outline:none}
.newsletter-box input[type="email"]:focus{border-color:#f97316}
.newsletter-box .privacy{font-size:.72rem;color:#8b7355;margin-top:8px}

/* Store badges */
.store-badges{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px}
.store-badges a{display:inline-flex;align-items:center;gap:8px;background:#000;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:600;font-size:.9rem;border:1px solid rgba(255,255,255,.2);transition:transform .2s}
.store-badges a:hover{transform:translateY(-2px);color:#fff}

/* Footer (warm light) */
.footer{background:#fffcf9;border-top:1px solid #efe6db;padding:48px 20px 24px;margin-top:60px}
.footer-inner{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px;margin-bottom:32px}
.footer-brand{color:#f97316;font-weight:800;font-size:1.1rem;text-decoration:none;display:block;margin-bottom:16px}
.footer-desc{color:#8b7355;font-size:.85rem;line-height:1.6}
.footer-heading{color:#3d3229;font-weight:700;font-size:.9rem;margin-bottom:16px}
.footer-link{color:#5c4d3d;text-decoration:none;font-size:.85rem;display:block;margin-bottom:8px;transition:color .2s}
.footer-link:hover{color:#f97316}
.footer-social{display:flex;gap:8px;margin-top:16px}
.footer-social a{color:#8b7355;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(0,0,0,.04);border-radius:8px;transition:color .2s,background .2s}
.footer-social a:hover{color:#f97316;background:rgba(249,115,22,.1)}
.footer-social svg{width:18px;height:18px;fill:currentColor}
.footer-bottom{border-top:1px solid #efe6db;padding-top:24px;text-align:center}
.footer-bottom p{color:#8b7355;font-size:.8rem}

/* Hub cards */
.race-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin:20px 0 40px}
.race-card{background:#fffcf9;border:1px solid #efe6db;border-radius:16px;overflow:hidden;text-decoration:none;color:#3d3229;transition:transform .2s,box-shadow .2s,border-color .2s}
.race-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.06);border-color:rgba(249,115,22,.3)}
.race-card-img{height:160px;overflow:hidden}
.race-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.race-card:hover .race-card-img img{transform:scale(1.05)}
.race-card-body{padding:16px 20px}
.race-card h3{font-size:1rem;font-weight:800;color:#3d3229;margin:0 0 8px}
.race-card .card-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:.78rem;color:#8b7355;margin-bottom:6px}
.race-card .card-meta span{background:rgba(0,0,0,.03);padding:2px 8px;border-radius:6px}
.race-card .card-city{font-size:.82rem;color:#5c4d3d}

/* Filter buttons */
.filters{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 8px}
.filter-btn{padding:6px 16px;border-radius:999px;border:1px solid #efe6db;background:#fffcf9;color:#5c4d3d;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s}
.filter-btn:hover,.filter-btn.active{background:rgba(249,115,22,.9);color:#fff;border-color:transparent}

/* Hub hero */
.hub-hero{text-align:center;padding:60px 20px 40px;background:linear-gradient(135deg,rgba(249,115,22,.06),rgba(249,115,22,.02))}
.hub-hero h1{font-size:2.2rem;font-weight:900;color:#3d3229;margin-bottom:12px}
.hub-hero p{font-size:1.1rem;color:#5c4d3d;max-width:640px;margin:0 auto}

/* ─── Dark mode ─── */
html.dark body{background:#0b1220;color:#e2e8f0}
html.dark .nav-wrapper{background:rgba(11,18,32,.97);border-bottom-color:rgba(255,255,255,.06)}
html.dark .nav-links{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
html.dark .nav-links a{color:#94a3b8;background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)}
html.dark .nav-links a.active{color:#fff}
html.dark .breadcrumb{color:#64748b}
html.dark .hero-bg::after{background:linear-gradient(to bottom,rgba(11,18,32,.5) 0%,rgba(11,18,32,.8) 60%,#0b1220 100%)}
html.dark h2{color:#e2e8f0}
html.dark h3{color:#f97316}
html.dark p{color:#cbd5e1}
html.dark li{color:#cbd5e1}
html.dark a{color:#f97316}
html.dark .info-card{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
html.dark .info-card .label{color:#64748b}
html.dark .info-card .value{color:#e2e8f0}
html.dark .race-photo{border-color:rgba(255,255,255,.08)}
html.dark .tip{background:rgba(249,115,22,.08)}
html.dark .faq-item{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
html.dark .faq-item summary{color:#e2e8f0}
html.dark .faq-item .faq-answer{color:#cbd5e1}
html.dark .related{border-top-color:rgba(255,255,255,.06)}
html.dark .related-links a{color:#f97316;border-color:rgba(249,115,22,.2)}
html.dark .cta-box{background:rgba(249,115,22,.04);border-color:rgba(249,115,22,.12)}
html.dark .cta-box p{color:#94a3b8}
html.dark .newsletter-box{background:rgba(249,115,22,.04);border-color:rgba(249,115,22,.12)}
html.dark .newsletter-box h3{color:#e2e8f0}
html.dark .newsletter-box input[type="email"]{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#e2e8f0}
html.dark .newsletter-box .privacy{color:#64748b}
html.dark .footer{background:rgba(255,255,255,.03);border-top-color:rgba(255,255,255,.06)}
html.dark .footer-brand{color:#f97316}
html.dark .footer-desc{color:#64748b}
html.dark .footer-heading{color:#e2e8f0}
html.dark .footer-link{color:#94a3b8}
html.dark .footer-social a{color:#94a3b8;background:rgba(255,255,255,.06)}
html.dark .footer-bottom{border-top-color:rgba(255,255,255,.06)}
html.dark .footer-bottom p{color:#64748b}
html.dark .race-card{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
html.dark .race-card:hover{box-shadow:0 12px 32px rgba(0,0,0,.3);border-color:rgba(249,115,22,.3)}
html.dark .race-card h3{color:#e2e8f0}
html.dark .race-card .card-meta{color:#64748b}
html.dark .race-card .card-meta span{background:rgba(255,255,255,.06)}
html.dark .race-card .card-city{color:#94a3b8}
html.dark .hub-hero{background:linear-gradient(135deg,rgba(249,115,22,.06),rgba(11,18,32,1))}
html.dark .hub-hero h1{color:#e2e8f0}
html.dark .hub-hero p{color:#94a3b8}
html.dark .filter-btn{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:#94a3b8}
html.dark .filter-btn:hover,.dark .filter-btn.active{background:rgba(249,115,22,.9);color:#fff;border-color:transparent}

/* Responsive */
@media(max-width:768px){
  .nav{flex-wrap:wrap;padding:12px 16px}
  .nav-links{order:3;width:100%;justify-content:center;margin-top:4px}
  .nav-links a{font-size:.78rem;padding:5px 12px;white-space:nowrap}
}
@media(max-width:640px){
  .hero{min-height:280px}
  .hero h1{font-size:1.6rem}
  h2{font-size:1.3rem}
  .race-info{grid-template-columns:repeat(2,1fr)}
  .race-grid{grid-template-columns:1fr}
}
`.replace(/\n/g, '').replace(/  +/g, ' ');

// ────────────────────────────────────────────
// Theme detection script (head inline)
// ────────────────────────────────────────────
const THEME_SCRIPT = `(function(){var t=localStorage.getItem('blog_theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')})()`;

// ────────────────────────────────────────────
// GA4 + Meta Pixel (consent-gated)
// ────────────────────────────────────────────
const ANALYTICS = `<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
function loadGA4(){if(document.getElementById('ga4-script'))return;var s=document.createElement('script');s.id='ga4-script';s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-RQYYGNC12T';document.head.appendChild(s);gtag('js',new Date());gtag('config','G-RQYYGNC12T');}
if(localStorage.getItem('cj_cookie_consent')==='accepted'){loadGA4();}
</script>`;

// ────────────────────────────────────────────
// Social SVG icons
// ────────────────────────────────────────────
const ICON_IG = '<svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';
const ICON_TT = '<svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>';
const ICON_X = '<svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
const ICON_STRAVA = '<svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>';

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function distanceBadge(cat) {
  const map = {
    maraton: { cls: 'maraton', label: 'Maratón' },
    media: { cls: 'media', label: 'Media Maratón' },
    '10k': { cls: '10k', label: '10K' },
    popular: { cls: 'popular', label: 'Popular' },
    trail: { cls: 'trail', label: 'Trail' }
  };
  const m = map[cat] || map['10k'];
  return `<span class="badge badge-${m.cls}">${m.label}</span>`;
}

function monthName(num, lang) {
  const esMonths = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const enMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return lang === 'en' ? enMonths[num - 1] : esMonths[num - 1];
}

// ────────────────────────────────────────────
// Nav
// ────────────────────────────────────────────
function buildNav(lang) {
  const logo = '<a href="/" class="nav-logo" style="text-decoration:none;font-weight:900;font-size:1.1rem;letter-spacing:-0.02em"><span style="color:#3d3229">CORRER</span><span style="color:#f97316">JUNTOS</span></a>';
  if (lang === 'en') {
    return `<div class="nav-wrapper">
<nav class="nav">
  ${logo}
  <div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/plans/">Plans</a>
    <a href="/races/" class="active">Races</a>
    <a href="/blog/en/">Blog</a>
  </div>
</nav>
</div>`;
  }
  return `<div class="nav-wrapper">
<nav class="nav">
  ${logo}
  <div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/planes/">Planes</a>
    <a href="/carreras/" class="active">Carreras</a>
    <a href="/blog/">Blog</a>
  </div>
</nav>
</div>`;
}

// ────────────────────────────────────────────
// Footer (warm light version)
// ────────────────────────────────────────────
function buildFooter(lang) {
  const isEn = lang === 'en';
  const explore = isEn ? 'Explore' : 'Explora';
  const company = isEn ? 'Company' : 'Empresa';
  const desc = isEn
    ? 'The most active running community in the world. Run together, improve together.'
    : 'La comunidad de running m&aacute;s activa del mundo. Corre acompa&ntilde;ado, mejora juntos.';

  return `<footer class="footer">
<div class="footer-inner">
  <div>
    <a href="/" class="footer-brand">CorrerJuntos</a>
    <p class="footer-desc">${desc}</p>
    <div class="footer-social">
      <a href="https://instagram.com/correrjuntosapp/" target="_blank" rel="noopener" aria-label="Instagram">${ICON_IG}</a>
      <a href="https://tiktok.com/@correrjuntosapp" target="_blank" rel="noopener" aria-label="TikTok">${ICON_TT}</a>
      <a href="https://twitter.com/CorrerJuntos" target="_blank" rel="noopener" aria-label="X">${ICON_X}</a>
      <a href="https://www.strava.com/athletes/correrjuntos" target="_blank" rel="noopener" aria-label="Strava">${ICON_STRAVA}</a>
    </div>
  </div>
  <div>
    <div class="footer-heading">${explore}</div>
    <a href="/cities/" class="footer-link">${isEn ? 'Cities' : 'Ciudades'}</a>
    <a href="/places/" class="footer-link">${isEn ? 'Places' : 'Lugares'}</a>
    <a href="/events/" class="footer-link">${isEn ? 'Events' : 'Eventos'}</a>
    <a href="${isEn ? '/plans/' : '/planes/'}" class="footer-link">${isEn ? 'Plans' : 'Planes'}</a>
    <a href="${isEn ? '/races/' : '/carreras/'}" class="footer-link">${isEn ? 'Races' : 'Carreras'}</a>
    <a href="${isEn ? '/blog/en/' : '/blog/'}" class="footer-link">Blog</a>
    <a href="/#app" class="footer-link">App</a>
  </div>
  <div>
    <div class="footer-heading">${company}</div>
    <a href="/sobre-nosotros.html" class="footer-link">${isEn ? 'About Us' : 'Sobre Nosotros'}</a>
    <a href="/inversores.html" class="footer-link">${isEn ? 'Investors' : 'Inversores'}</a>
    <a href="mailto:hola@correrjuntos.com" class="footer-link">${isEn ? 'Contact' : 'Contacto'}</a>
  </div>
  <div>
    <div class="footer-heading">Legal</div>
    <a href="/privacy.html" class="footer-link">${isEn ? 'Privacy Policy' : 'Pol&iacute;tica de Privacidad'}</a>
    <a href="/terms.html" class="footer-link">${isEn ? 'Terms of Use' : 'T&eacute;rminos de Uso'}</a>
    <a href="/legal/cookies.html" class="footer-link">${isEn ? 'Cookie Policy' : 'Pol&iacute;tica de Cookies'}</a>
  </div>
</div>
<div class="footer-bottom">
  <p>&copy; 2026 CorrerJuntos. ${isEn ? 'All rights reserved.' : 'Todos los derechos reservados.'}</p>
</div>
</footer>`;
}

// ────────────────────────────────────────────
// Newsletter JS
// ────────────────────────────────────────────
function nlScript(lang) {
  const isEn = lang === 'en';
  const success = isEn ? 'Check your email to confirm!' : 'Revisa tu email para confirmar.';
  const error = isEn ? 'Error, please try again.' : 'Error, int&eacute;ntalo de nuevo.';
  const sending = isEn ? 'Sending...' : 'Enviando...';
  const btnText = isEn ? 'Subscribe' : 'Suscribirme';
  return `<script>
(function(){
  var form=document.getElementById('nlForm');
  if(!form)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var email=document.getElementById('nlEmail').value;
    var btn=form.querySelector('button');
    var msg=document.getElementById('nlMsg');
    btn.textContent='${sending}';btn.disabled=true;
    fetch('/api/brevo-subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,lang:'${lang}'})})
    .then(function(r){return r.json()})
    .then(function(d){msg.style.display='block';msg.style.color='#16a34a';msg.textContent='${success}';form.reset()})
    .catch(function(){msg.style.display='block';msg.style.color='#dc2626';msg.textContent='${error}'})
    .finally(function(){btn.textContent='${btnText}';btn.disabled=false});
  });
})();
</script>`;
}

// ────────────────────────────────────────────
// Store badges
// ────────────────────────────────────────────
function storeBadges(lang) {
  return `<div class="store-badges">
  <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
    App Store
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" target="_blank" rel="noopener noreferrer">
    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464l.001 1z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg>
    Google Play
  </a>
</div>`;
}

// ────────────────────────────────────────────
// Schema JSON-LD (per race page — SportsEvent)
// ────────────────────────────────────────────
function buildSchema(race, lang) {
  const isEn = lang === 'en';
  const slug = isEn ? race.slugEn : race.slugEs;
  const dir = isEn ? 'races' : 'carreras';
  const canonical = `${DOMAIN}/${dir}/${slug}`;
  const name = isEn ? race.nameEn : race.nameEs;
  const desc = isEn ? race.metaDescriptionEn : race.metaDescriptionEs;
  const locale = isEn ? 'en-US' : 'es-ES';
  const faqItems = (isEn ? race.faqEn : race.faqEs) || [];

  const graph = [
    {
      '@type': 'SportsOrganization',
      '@id': `${DOMAIN}/#organization`,
      name: 'CorrerJuntos',
      url: `${DOMAIN}/`,
      sport: 'Running',
      logo: { '@type': 'ImageObject', url: `${DOMAIN}/icons/icon-512.png` },
      sameAs: [
        'https://www.instagram.com/correrjuntosapp/',
        'https://x.com/CorrerJuntos',
        'https://www.tiktok.com/@correrjuntosapp'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${DOMAIN}/#website`,
      url: `${DOMAIN}/`,
      name: 'CorrerJuntos',
      publisher: { '@id': `${DOMAIN}/#organization` },
      inLanguage: isEn ? 'en' : 'es'
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: `${name} | CorrerJuntos`,
      description: desc,
      isPartOf: { '@id': `${DOMAIN}/#website` },
      about: { '@id': `${DOMAIN}/#organization` },
      inLanguage: locale
    },
    {
      '@type': 'SportsEvent',
      '@id': `${canonical}#event`,
      name: `${name} 2026`,
      description: desc,
      startDate: race.startDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: race.city,
        address: {
          '@type': 'PostalAddress',
          addressLocality: race.city,
          addressRegion: race.region,
          addressCountry: race.country
        }
      },
      organizer: {
        '@type': 'Organization',
        name: name
      },
      offers: {
        '@type': 'Offer',
        price: race.priceRange.split('-')[0],
        priceCurrency: race.currency,
        availability: 'https://schema.org/InStock'
      },
      maximumAttendeeCapacity: race.maxParticipants,
      image: race.heroImage
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: `${DOMAIN}/` },
        { '@type': 'ListItem', position: 2, name: isEn ? 'Races' : 'Carreras', item: `${DOMAIN}/${dir}/` },
        { '@type': 'ListItem', position: 3, name: name }
      ]
    }
  ];

  if (faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: faqItems.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ────────────────────────────────────────────
// Generate a single race page
// ────────────────────────────────────────────
function generateRacePage(race, lang) {
  const isEn = lang === 'en';
  const slug = isEn ? race.slugEn : race.slugEs;
  const dir = isEn ? 'races' : 'carreras';
  const outDir = isEn ? RACES_DIR : CARRERAS_DIR;
  const canonical = `${DOMAIN}/${dir}/${slug}`;
  const name = isEn ? race.nameEn : race.nameEs;
  const metaDesc = isEn ? race.metaDescriptionEn : race.metaDescriptionEs;
  const description = isEn ? race.descriptionEn : race.descriptionEs;
  const route = isEn ? race.routeEn : race.routeEs;
  const tips = isEn ? race.tipsEn : race.tipsEs;
  const faq = isEn ? race.faqEn : race.faqEs;
  const elevation = isEn ? race.elevationEn : race.elevationEs;
  const dateText = isEn ? race.dateText2026En : race.dateText2026Es;
  const distLabel = isEn ? (race.distanceLabelEn || race.distance) : (race.distanceLabel || race.distance);
  const locale = isEn ? 'en-US' : 'es-ES';
  const ogLocale = isEn ? 'en_US' : 'es_ES';
  const schema = buildSchema(race, lang);

  // Labels
  const L = isEn ? {
    home: 'Home', races: 'Races', date: 'Date', distance: 'Distance',
    price: 'Price', participants: 'Participants', elevation: 'Elevation',
    city: 'City', route: 'Route &amp; Course', tips: 'Tips',
    faq: 'FAQ', relatedPlans: 'Train for this Race', relatedRaces: 'Similar Races',
    ctaTitle: 'Find training partners', ctaDesc: 'Train with other runners preparing for this race.',
    ctaBtn: 'Join Free', nlTitle: 'Get race info and tips in your email',
    nlPlaceholder: 'your@email.com', nlBtn: 'Subscribe',
    nlPrivacy: 'We respect your privacy. Cancel anytime.',
    about: 'About the Race', prepareTitle: 'Prepare for this Race'
  } : {
    home: 'Inicio', races: 'Carreras', date: 'Fecha', distance: 'Distancia',
    price: 'Precio', participants: 'Participantes', elevation: 'Desnivel',
    city: 'Ciudad', route: 'Recorrido', tips: 'Consejos',
    faq: 'Preguntas Frecuentes', relatedPlans: 'Prepara esta Carrera', relatedRaces: 'Carreras Similares',
    ctaTitle: 'Encuentra compa&ntilde;eros de entrenamiento',
    ctaDesc: 'Entrena con otros runners que preparan esta carrera.',
    ctaBtn: 'Unirme Gratis', nlTitle: 'Recibe info de carreras y consejos en tu email',
    nlPlaceholder: 'tu@email.com', nlBtn: 'Suscribirme',
    nlPrivacy: 'Respetamos tu privacidad. Cancela cuando quieras.',
    about: 'Sobre la Carrera', prepareTitle: 'Prepara esta Carrera'
  };

  // Info cards
  const infoHtml = `
  <div class="race-info">
    <div class="info-card"><div class="icon">&#128197;</div><div class="label">${L.date}</div><div class="value">${dateText}</div></div>
    <div class="info-card"><div class="icon">&#127939;</div><div class="label">${L.distance}</div><div class="value">${distLabel}</div></div>
    <div class="info-card"><div class="icon">&#128176;</div><div class="label">${L.price}</div><div class="value">${race.priceRange}&euro;</div></div>
    <div class="info-card"><div class="icon">&#128101;</div><div class="label">${L.participants}</div><div class="value">${race.maxParticipants.toLocaleString()}</div></div>
    <div class="info-card"><div class="icon">&#9968;</div><div class="label">${L.elevation}</div><div class="value">${elevation}</div></div>
    <div class="info-card"><div class="icon">&#128205;</div><div class="label">${L.city}</div><div class="value">${race.city}</div></div>
  </div>`;

  // Second photo
  const secondPhotoHtml = race.secondImage ? `
  <div class="race-photo">
    <img src="${race.secondImage}" alt="${esc(name)} - ${isEn ? 'atmosphere' : 'ambiente'}" loading="lazy" width="1200" height="800">
  </div>` : '';

  // Tips
  const tipsHtml = (tips && tips.length > 0) ? `
  <h2>${L.tips}</h2>
  ${tips.map(t => `<div class="tip"><strong>&#128161;</strong> ${t}</div>`).join('\n')}` : '';

  // FAQ
  const faqHtml = (faq && faq.length > 0) ? `
  <div class="faq-section">
    <h2>${L.faq}</h2>
    ${faq.map(f => `
    <details class="faq-item">
      <summary>${esc(f.q)}</summary>
      <div class="faq-answer"><p>${f.a}</p></div>
    </details>`).join('')}
  </div>` : '';

  // Related plans
  const relatedPlans = race.relatedPlans || [];
  // Load plans data for titles
  let plansData = {};
  const plansFile = path.join(BASE_DIR, 'tools', 'plans-generator', 'plans-data.json');
  if (fs.existsSync(plansFile)) {
    try { plansData = JSON.parse(fs.readFileSync(plansFile, 'utf-8')); } catch(e) {}
  }
  const relatedPlansHtml = relatedPlans.length > 0 ? `
  <div class="related">
    <h3>${L.prepareTitle}</h3>
    <div class="related-links">
      ${relatedPlans.map(rs => {
        const rp = plansData[rs];
        const planDir = isEn ? 'plans' : 'planes';
        const rpSlug = rp ? (isEn ? rp.slugEn : rp.slugEs) : rs;
        const rpTitle = rp ? (isEn ? rp.titleEn : rp.titleEs) : rs.replace(/-/g, ' ');
        return `<a href="/${planDir}/${rpSlug}">${rpTitle}</a>`;
      }).join('\n      ')}
    </div>
  </div>` : '';

  // Related races (same category)
  const allRaces = Object.values(races);
  const sameCategory = allRaces
    .filter(r => r.distanceCategory === race.distanceCategory && r.slugEs !== race.slugEs)
    .slice(0, 4);
  const relatedRacesHtml = sameCategory.length > 0 ? `
  <div class="related">
    <h3>${L.relatedRaces}</h3>
    <div class="related-links">
      ${sameCategory.map(r => {
        const rSlug = isEn ? r.slugEn : r.slugEs;
        const rName = isEn ? r.nameEn : r.nameEs;
        return `<a href="/${dir}/${rSlug}">${rName}</a>`;
      }).join('\n      ')}
    </div>
  </div>` : '';

  // Hreflang
  let hreflangHtml;
  if (race.hasEn) {
    hreflangHtml = `<link rel="alternate" hreflang="es" href="${DOMAIN}/carreras/${race.slugEs}">
<link rel="alternate" hreflang="en" href="${DOMAIN}/races/${race.slugEn}">
<link rel="alternate" hreflang="x-default" href="${DOMAIN}/carreras/${race.slugEs}">`;
  } else {
    hreflangHtml = `<link rel="alternate" hreflang="es" href="${DOMAIN}/carreras/${race.slugEs}">
<link rel="alternate" hreflang="x-default" href="${DOMAIN}/carreras/${race.slugEs}">`;
  }

  // Events link
  const eventsLink = race.relatedEvents ? `
  <p style="margin-top:16px"><a href="/events/${race.relatedEvents}">${isEn ? 'See all events in' : 'Ver todos los eventos en'} ${race.city} &rarr;</a></p>` : '';

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">
<title>${esc(name)} 2026 — ${isEn ? 'Registration, Route & Tips' : 'Inscripci&oacute;n, Recorrido y Consejos'} | CorrerJuntos</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
${hreflangHtml}
<meta property="og:title" content="${esc(name)} 2026 | CorrerJuntos">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${race.heroImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@CorrerJuntos">
<meta name="twitter:title" content="${esc(name)} 2026">
<meta name="twitter:description" content="${esc(metaDesc)}">
<meta name="twitter:image" content="${race.heroImage}">
<script>${THEME_SCRIPT}</script>
${ANALYTICS}
<style>${CSS}</style>
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
</head>
<body>
${buildNav(lang)}

<div class="container">
  <div class="breadcrumb">
    <a href="/">${L.home}</a>
    <span>/</span>
    <a href="/${dir}/">${L.races}</a>
    <span>/</span>
    ${esc(name)}
  </div>
</div>

<div class="hero">
  <div class="hero-bg"><img src="${race.heroImage}" alt="${esc(name)}" loading="eager" fetchpriority="high" width="1200" height="600"></div>
  <div class="hero-content">
    <h1>${name}</h1>
    <div class="hero-badges">
      <span class="hero-badge">&#128197; ${dateText}</span>
      <span class="hero-badge">&#127939; ${distLabel}</span>
      <span class="hero-badge">&#128205; ${race.city}</span>
    </div>
  </div>
</div>

<div class="container content">

  ${infoHtml}

  <h2>${L.about}</h2>
  ${description.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('\n  ')}

  ${secondPhotoHtml}

  <h2>${L.route}</h2>
  ${route.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('\n  ')}

  ${eventsLink}

  ${tipsHtml}

  ${faqHtml}

  ${relatedPlansHtml}

  ${relatedRacesHtml}

  <div class="cta-box">
    <h2>${L.ctaTitle}</h2>
    <p>${L.ctaDesc}</p>
    <a href="/#app" class="cta">${L.ctaBtn}</a>
    ${storeBadges(lang)}
  </div>

  <div class="newsletter-box">
    <h3>&#128231; ${L.nlTitle}</h3>
    <form id="nlForm" onsubmit="return false">
      <input type="email" id="nlEmail" placeholder="${L.nlPlaceholder}" required>
      <button type="submit" class="cta" style="padding:12px 24px;font-size:.9rem">${L.nlBtn}</button>
    </form>
    <p id="nlMsg" style="display:none"></p>
    <p class="privacy">${L.nlPrivacy}</p>
  </div>

</div>

${buildFooter(lang)}
${nlScript(lang)}
<script src="/blog/enhance.js" defer></script>
</body>
</html>`;

  const outPath = path.join(outDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  return outPath;
}

// ────────────────────────────────────────────
// Generate hub / index page
// ────────────────────────────────────────────
function generateHub(lang) {
  const isEn = lang === 'en';
  const dir = isEn ? 'races' : 'carreras';
  const outDir = isEn ? RACES_DIR : CARRERAS_DIR;
  const canonical = `${DOMAIN}/${dir}/`;
  const locale = isEn ? 'en-US' : 'es-ES';
  const ogLocale = isEn ? 'en_US' : 'es_ES';
  const allRaces = Object.values(races);
  const hubRaces = isEn ? allRaces.filter(r => r.hasEn) : allRaces;

  const L = isEn ? {
    title: 'Popular Races in Spain',
    metaTitle: 'Popular Running Races in Spain 2026 | CorrerJuntos',
    metaDesc: 'Complete guide to the 50 most popular running races in Spain 2026. Marathons, half marathons, 10K and trail. Dates, registration, routes and tips.',
    heroDesc: 'The most popular running races in Spain. Find your next challenge, from local 10Ks to legendary marathons and ultra-trails.',
    home: 'Home',
    filterAll: 'All', filterMarathon: 'Marathon', filterHalf: 'Half Marathon',
    filter10K: '10K', filterPopular: 'Populares', filterTrail: 'Trail'
  } : {
    title: 'Carreras Populares de Espa&ntilde;a',
    metaTitle: 'Carreras Populares de Espa&ntilde;a 2026 | CorrerJuntos',
    metaDesc: 'Gu&iacute;a completa de las 50 carreras populares m&aacute;s buscadas de Espa&ntilde;a 2026. Maratones, medias, 10K y trail. Fechas, inscripci&oacute;n, recorridos y consejos.',
    heroDesc: 'Las carreras populares m&aacute;s buscadas de Espa&ntilde;a. Encuentra tu pr&oacute;ximo reto, desde 10K locales hasta maratones legendarios y ultra-trails.',
    home: 'Inicio',
    filterAll: 'Todas', filterMarathon: 'Maratones', filterHalf: 'Medias Marat&oacute;n',
    filter10K: '10K', filterPopular: 'Populares', filterTrail: 'Trail'
  };

  // Group by category
  const catOrder = ['maraton', 'media', '10k', 'popular', 'trail'];
  const catLabels = isEn
    ? { maraton: 'Marathons', media: 'Half Marathons', '10k': '10K Races', popular: 'Popular Classics', trail: 'Trail &amp; Mountain' }
    : { maraton: 'Maratones', media: 'Medias Marat&oacute;n', '10k': 'Carreras 10K', popular: 'Populares y Cl&aacute;sicas', trail: 'Trail y Monta&ntilde;a' };

  const groups = {};
  for (const c of catOrder) groups[c] = [];
  for (const r of hubRaces) {
    const cat = r.distanceCategory || '10k';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  }

  function renderCard(r) {
    const slug = isEn ? r.slugEn : r.slugEs;
    const rName = isEn ? r.nameEn : r.nameEs;
    const dateText = isEn ? r.dateText2026En : r.dateText2026Es;
    return `
      <a href="/${dir}/${slug}" class="race-card" data-category="${r.distanceCategory}" data-month="${r.dateMonth}">
        <div class="race-card-img"><img src="${r.heroImage}" alt="${esc(rName)}" loading="lazy" width="600" height="320"></div>
        <div class="race-card-body">
          <h3>${rName}</h3>
          <div class="card-meta">
            <span>${r.distance}</span>
            <span>${dateText}</span>
            <span>${distanceBadge(r.distanceCategory)}</span>
          </div>
          <div class="card-city">&#128205; ${r.city}</div>
        </div>
      </a>`;
  }

  function renderGroup(label, items) {
    if (items.length === 0) return '';
    return `
    <h2>${label}</h2>
    <div class="race-grid">
      ${items.map(renderCard).join('')}
    </div>`;
  }

  const groupsHtml = catOrder
    .map(c => renderGroup(catLabels[c] || c, groups[c] || []))
    .filter(Boolean)
    .join('');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsOrganization',
        '@id': `${DOMAIN}/#organization`,
        name: 'CorrerJuntos', url: `${DOMAIN}/`, sport: 'Running',
        logo: { '@type': 'ImageObject', url: `${DOMAIN}/icons/icon-512.png` }
      },
      {
        '@type': 'WebSite',
        '@id': `${DOMAIN}/#website`,
        url: `${DOMAIN}/`, name: 'CorrerJuntos',
        publisher: { '@id': `${DOMAIN}/#organization` }, inLanguage: isEn ? 'en' : 'es'
      },
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: L.metaTitle,
        description: L.metaDesc,
        isPartOf: { '@id': `${DOMAIN}/#website` },
        about: { '@id': `${DOMAIN}/#organization` },
        inLanguage: locale,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: hubRaces.map((r, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: isEn ? r.nameEn : r.nameEs,
            url: `${DOMAIN}/${dir}/${isEn ? r.slugEn : r.slugEs}`
          }))
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: L.home, item: `${DOMAIN}/` },
          { '@type': 'ListItem', position: 2, name: L.title }
        ]
      }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">
<title>${L.metaTitle}</title>
<meta name="description" content="${L.metaDesc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="es" href="${DOMAIN}/carreras/">
<link rel="alternate" hreflang="en" href="${DOMAIN}/races/">
<link rel="alternate" hreflang="x-default" href="${DOMAIN}/carreras/">
<meta property="og:title" content="${L.metaTitle}">
<meta property="og:description" content="${L.metaDesc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${DOMAIN}/icons/og-image.png?v=2">
<meta property="og:locale" content="${ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@CorrerJuntos">
<script>${THEME_SCRIPT}</script>
${ANALYTICS}
<style>${CSS}</style>
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
</head>
<body>
${buildNav(lang)}

<div class="container">
  <div class="breadcrumb">
    <a href="/">${L.home}</a>
    <span>/</span>
    ${L.title}
  </div>
</div>

<div class="hub-hero">
  <h1>${L.title}</h1>
  <p>${L.heroDesc}</p>
</div>

<div class="container">

  <div class="filters">
    <button class="filter-btn active" onclick="filterRaces('all')">${L.filterAll}</button>
    <button class="filter-btn" onclick="filterRaces('maraton')">${L.filterMarathon}</button>
    <button class="filter-btn" onclick="filterRaces('media')">${L.filterHalf}</button>
    <button class="filter-btn" onclick="filterRaces('10k')">${L.filter10K}</button>
    <button class="filter-btn" onclick="filterRaces('popular')">${L.filterPopular}</button>
    <button class="filter-btn" onclick="filterRaces('trail')">${L.filterTrail}</button>
  </div>

  ${groupsHtml}

  <div class="cta-box">
    <h2>${isEn ? 'Train with company' : 'Entrena con compa&ntilde;&iacute;a'}</h2>
    <p>${isEn ? 'Download the app and find running partners to train for your next race together.' : 'Descarga la app y encuentra compa&ntilde;eros de running para preparar tu pr&oacute;xima carrera juntos.'}</p>
    <a href="/#app" class="cta">${isEn ? 'Download Free' : 'Descargar Gratis'}</a>
    ${storeBadges(lang)}
  </div>

</div>

${buildFooter(lang)}

<script>
function filterRaces(cat){
  var btns=document.querySelectorAll('.filter-btn');
  btns.forEach(function(b){b.classList.remove('active')});
  event.target.classList.add('active');
  var cards=document.querySelectorAll('.race-card');
  cards.forEach(function(c){
    if(cat==='all'){c.style.display='';return}
    var d=c.getAttribute('data-category');
    if(d===cat){c.style.display=''}
    else{c.style.display='none'}
  });
}
</script>
<script src="/blog/enhance.js" defer></script>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
}

// ────────────────────────────────────────────
// Generate sitemap
// ────────────────────────────────────────────
function generateSitemap() {
  const allRaces = Object.values(races);
  const urls = [];

  // Hub pages
  urls.push({ loc: `${DOMAIN}/carreras/`, priority: '0.8' });
  urls.push({ loc: `${DOMAIN}/races/`, priority: '0.8' });

  // Individual race pages
  for (const r of allRaces) {
    urls.push({ loc: `${DOMAIN}/carreras/${r.slugEs}`, priority: '0.7' });
    if (r.hasEn) {
      urls.push({ loc: `${DOMAIN}/races/${r.slugEn}`, priority: '0.7' });
    }
  }

  const entries = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  fs.writeFileSync(SITEMAP_FILE, xml, 'utf-8');
  return urls.length;
}

// ────────────────────────────────────────────
// Main
// ────────────────────────────────────────────
const allRaces = Object.values(races);

if (slugArg) {
  const race = races[slugArg];
  if (!race) {
    console.error(`Race "${slugArg}" not found in races-data.json.`);
    console.error(`Available slugs: ${Object.keys(races).join(', ')}`);
    process.exit(1);
  }
  const esPath = generateRacePage(race, 'es');
  console.log(`Generated ES: ${path.relative(BASE_DIR, esPath)}`);
  if (race.hasEn) {
    const enPath = generateRacePage(race, 'en');
    console.log(`Generated EN: ${path.relative(BASE_DIR, enPath)}`);
  }
} else {
  let esCount = 0;
  let enCount = 0;
  for (const race of allRaces) {
    generateRacePage(race, 'es');
    esCount++;
    if (race.hasEn) {
      generateRacePage(race, 'en');
      enCount++;
    }
  }
  generateHub('es');
  generateHub('en');
  const sitemapCount = generateSitemap();

  console.log(`\n=== Races Generation Results ===`);
  console.log(`ES pages: ${esCount} races + 1 hub = ${esCount + 1}`);
  console.log(`EN pages: ${enCount} races + 1 hub = ${enCount + 1}`);
  console.log(`Total HTML files: ${esCount + enCount + 2}`);
  console.log(`Sitemap: sitemap-races.xml (${sitemapCount} URLs)`);
}
