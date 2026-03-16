/**
 * generate-plans.cjs
 * Generates training plan HTML pages from plans-data.json
 * Usage:
 *   node tools/plans-generator/generate-plans.cjs          # generates all (ES+EN) + hubs + sitemap
 *   node tools/plans-generator/generate-plans.cjs 5k-sub-25  # generates single plan (both ES+EN)
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..', '..');
const PLANES_DIR = path.join(BASE_DIR, 'planes');
const PLANS_DIR = path.join(BASE_DIR, 'plans');
const DATA_FILE = path.join(__dirname, 'plans-data.json');
const SITEMAP_FILE = path.join(BASE_DIR, 'sitemap-plans.xml');
const DOMAIN = 'https://www.correrjuntos.com';
const TODAY = '2026-03-16';

if (!fs.existsSync(PLANES_DIR)) fs.mkdirSync(PLANES_DIR, { recursive: true });
if (!fs.existsSync(PLANS_DIR)) fs.mkdirSync(PLANS_DIR, { recursive: true });

const plans = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
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
.hero{text-align:center;padding:0;position:relative;overflow:hidden;min-height:340px;display:flex;align-items:center;justify-content:center;flex-direction:column}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,18,32,.45) 0%,rgba(11,18,32,.65) 50%,rgba(254,247,237,.95) 100%)}
.hero-content{position:relative;z-index:1;padding:60px 20px 40px;max-width:800px}
.hero h1{font-size:2.2rem;font-weight:900;color:#f97316;margin-bottom:12px;line-height:1.15}
.hero p{font-size:1.1rem;color:#e2e8f0;max-width:640px;margin:0 auto}

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

/* Plan info cards */
.plan-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:24px 0 32px}
.info-card{background:#fffcf9;border:1px solid #efe6db;border-radius:14px;padding:16px;text-align:center}
.info-card .icon{font-size:1.5rem;margin-bottom:6px}
.info-card .label{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#8b7355;font-weight:600}
.info-card .value{font-size:1.2rem;font-weight:800;color:#3d3229;margin-top:4px}

/* Level badges */
.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
.badge-principiante,.badge-beginner{background:rgba(34,197,94,.12);color:#16a34a;border:1px solid rgba(34,197,94,.2)}
.badge-intermedio,.badge-intermediate{background:rgba(234,179,8,.12);color:#b45309;border:1px solid rgba(234,179,8,.2)}
.badge-avanzado,.badge-advanced{background:rgba(239,68,68,.12);color:#dc2626;border:1px solid rgba(239,68,68,.2)}

/* Weekly table */
.weeks-section{margin:32px 0}
.week-block{margin-bottom:12px;border:1px solid #efe6db;border-radius:14px;overflow:hidden;background:#fffcf9}
.week-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;user-select:none;font-weight:700;color:#3d3229;background:rgba(249,115,22,.03);transition:background .2s}
.week-header:hover{background:rgba(249,115,22,.08)}
.week-header .arrow{transition:transform .3s;font-size:.8rem;color:#8b7355}
.week-block[open] .week-header .arrow{transform:rotate(180deg)}
.week-body{padding:0}
.session-table{width:100%;border-collapse:collapse}
.session-table th{text-align:left;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#8b7355;padding:10px 16px;border-bottom:1px solid #efe6db;background:rgba(0,0,0,.02)}
.session-table td{padding:10px 16px;border-bottom:1px solid rgba(239,230,219,.5);color:#334155;font-size:.9rem}
.session-table tr:last-child td{border-bottom:none}
.session-table tr:nth-child(even) td{background:rgba(249,115,22,.015)}
.session-table td:first-child{font-weight:600;color:#3d3229;white-space:nowrap;width:100px}

/* Prerequisites */
.prereq{background:#fffcf9;border:1px solid #efe6db;border-left:3px solid #f97316;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0}
.prereq ul{margin:8px 0 0 20px}
.prereq li{color:#334155;margin-bottom:4px}

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
.plan-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin:20px 0 40px}
.plan-card{background:#fffcf9;border:1px solid #efe6db;border-radius:16px;padding:20px;text-decoration:none;color:#3d3229;transition:transform .2s,box-shadow .2s,border-color .2s}
.plan-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.06);border-color:rgba(249,115,22,.3)}
.plan-card h3{font-size:1rem;font-weight:800;color:#3d3229;margin:0 0 8px}
.plan-card .card-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:.78rem;color:#8b7355;margin-bottom:10px}
.plan-card .card-meta span{background:rgba(0,0,0,.03);padding:2px 8px;border-radius:6px}

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
html.dark .week-block{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
html.dark .week-header{background:rgba(255,255,255,.02);color:#e2e8f0}
html.dark .week-header:hover{background:rgba(249,115,22,.08)}
html.dark .week-header .arrow{color:#64748b}
html.dark .session-table th{color:#64748b;border-bottom-color:rgba(255,255,255,.08);background:rgba(255,255,255,.02)}
html.dark .session-table td{color:#cbd5e1;border-bottom-color:rgba(255,255,255,.04)}
html.dark .session-table td:first-child{color:#e2e8f0}
html.dark .session-table tr:nth-child(even) td{background:rgba(255,255,255,.02)}
html.dark .prereq{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);border-left-color:#f97316}
html.dark .prereq li{color:#cbd5e1}
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
html.dark .plan-card{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
html.dark .plan-card:hover{box-shadow:0 12px 32px rgba(0,0,0,.3);border-color:rgba(249,115,22,.3)}
html.dark .plan-card h3{color:#e2e8f0}
html.dark .plan-card .card-meta{color:#64748b}
html.dark .plan-card .card-meta span{background:rgba(255,255,255,.06)}
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
  .hero{min-height:260px}
  .hero h1{font-size:1.6rem}
  h2{font-size:1.3rem}
  .plan-info{grid-template-columns:repeat(2,1fr)}
  .session-table{font-size:.82rem}
  .session-table th,.session-table td{padding:8px 10px}
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
// Social SVG icons (shared)
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

function levelBadge(level, lang) {
  const map = {
    principiante: { en: 'beginner', cls: 'principiante', labelEs: 'Principiante', labelEn: 'Beginner' },
    intermedio: { en: 'intermediate', cls: 'intermedio', labelEs: 'Intermedio', labelEn: 'Intermediate' },
    avanzado: { en: 'advanced', cls: 'avanzado', labelEs: 'Avanzado', labelEn: 'Advanced' }
  };
  const m = map[level] || map.intermedio;
  const label = lang === 'en' ? m.labelEn : m.labelEs;
  const cls = lang === 'en' ? m.en : m.cls;
  return `<span class="badge badge-${cls}">${label}</span>`;
}

// ────────────────────────────────────────────
// Nav
// ────────────────────────────────────────────
function buildNav(lang) {
  if (lang === 'en') {
    return `<div class="nav-wrapper">
<nav class="nav">
  <a href="/" class="nav-logo">CORRER<b>JUNTOS</b></a>
  <div class="nav-links">
    <a href="/matching/en/">Matching</a>
    <a href="/plans/" class="active">Plans</a>
    <a href="/blog/en/">Blog</a>
    <a href="/#app">App</a>
  </div>
</nav>
</div>`;
  }
  return `<div class="nav-wrapper">
<nav class="nav">
  <a href="/" class="nav-logo">CORRER<b>JUNTOS</b></a>
  <div class="nav-links">
    <a href="/matching/">Matching</a>
    <a href="/planes/" class="active">Planes</a>
    <a href="/blog/">Blog</a>
    <a href="/#app">App</a>
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
  const legal = 'Legal';
  const desc = isEn
    ? 'The most active running community in the world. Run together, improve together.'
    : 'La comunidad de running m&aacute;s activa del mundo. Corre acompa&ntilde;ado, mejora juntos.';
  const aboutLabel = isEn ? 'About Us' : 'Sobre Nosotros';
  const investorsLabel = isEn ? 'Investors' : 'Inversores';
  const contactLabel = isEn ? 'Contact' : 'Contacto';
  const privacyLabel = isEn ? 'Privacy Policy' : 'Pol&iacute;tica de Privacidad';
  const termsLabel = isEn ? 'Terms of Use' : 'T&eacute;rminos de Uso';
  const cookiesLabel = isEn ? 'Cookie Policy' : 'Pol&iacute;tica de Cookies';
  const rights = isEn ? 'All rights reserved.' : 'Todos los derechos reservados.';
  const citiesLabel = isEn ? 'Cities' : 'Ciudades';
  const placesLabel = isEn ? 'Places' : 'Lugares';
  const eventsLabel = isEn ? 'Events' : 'Eventos';
  const plansLabel = isEn ? 'Plans' : 'Planes';
  const plansHref = isEn ? '/plans/' : '/planes/';

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
    <a href="/cities/" class="footer-link">${citiesLabel}</a>
    <a href="/places/" class="footer-link">${placesLabel}</a>
    <a href="/events/" class="footer-link">${eventsLabel}</a>
    <a href="${plansHref}" class="footer-link">${plansLabel}</a>
    <a href="${isEn ? '/blog/en/' : '/blog/'}" class="footer-link">Blog</a>
    <a href="/#app" class="footer-link">App</a>
  </div>
  <div>
    <div class="footer-heading">${company}</div>
    <a href="/sobre-nosotros.html" class="footer-link">${aboutLabel}</a>
    <a href="/inversores.html" class="footer-link">${investorsLabel}</a>
    <a href="mailto:hola@correrjuntos.com" class="footer-link">${contactLabel}</a>
  </div>
  <div>
    <div class="footer-heading">${legal}</div>
    <a href="/privacy.html" class="footer-link">${privacyLabel}</a>
    <a href="/terms.html" class="footer-link">${termsLabel}</a>
    <a href="/legal/cookies.html" class="footer-link">${cookiesLabel}</a>
  </div>
</div>
<div class="footer-bottom">
  <p>&copy; 2026 CorrerJuntos. ${rights}</p>
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
  const isEn = lang === 'en';
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
// Schema JSON-LD (per plan page)
// ────────────────────────────────────────────
function buildSchema(plan, lang) {
  const isEn = lang === 'en';
  const slug = isEn ? plan.slugEn : plan.slugEs;
  const dir = isEn ? 'plans' : 'planes';
  const canonical = `${DOMAIN}/${dir}/${slug}`;
  const title = isEn ? plan.titleEn : plan.titleEs;
  const desc = isEn ? plan.metaDescriptionEn : plan.metaDescriptionEs;
  const locale = isEn ? 'en' : 'es';

  const steps = (plan.weeks || []).map(w => ({
    '@type': 'HowToStep',
    name: `${isEn ? 'Week' : 'Semana'} ${w.weekNum} — ${isEn ? w.titleEn : w.titleEs}`,
    text: (w.sessions || []).map(s => `${isEn ? s.dayEn : s.dayEs}: ${isEn ? s.descEn : s.descEs}`).join('. ')
  }));

  const faqItems = (isEn ? plan.faqEn : plan.faqEs) || [];

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
      inLanguage: locale
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: `${title} | CorrerJuntos`,
      description: desc,
      isPartOf: { '@id': `${DOMAIN}/#website` },
      about: { '@id': `${DOMAIN}/#organization` },
      inLanguage: isEn ? 'en-US' : 'es-ES'
    },
    {
      '@type': 'HowTo',
      '@id': `${canonical}#howto`,
      name: title,
      description: desc,
      totalTime: plan.totalTime || `PT${(plan.durationWeeks || 8) * 7}D`,
      step: steps
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: `${DOMAIN}/` },
        { '@type': 'ListItem', position: 2, name: isEn ? 'Training Plans' : 'Planes', item: `${DOMAIN}/${dir}/` },
        { '@type': 'ListItem', position: 3, name: title }
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
// Generate a single plan page
// ────────────────────────────────────────────
function generatePlanPage(plan, lang) {
  const isEn = lang === 'en';
  const slug = isEn ? plan.slugEn : plan.slugEs;
  const dir = isEn ? 'plans' : 'planes';
  const outDir = isEn ? PLANS_DIR : PLANES_DIR;
  const canonical = `${DOMAIN}/${dir}/${slug}`;
  const altDir = isEn ? 'planes' : 'plans';
  const altSlug = isEn ? plan.slugEs : plan.slugEn;
  const altCanonical = `${DOMAIN}/${altDir}/${altSlug}`;
  const title = isEn ? plan.titleEn : plan.titleEs;
  const subtitle = isEn ? plan.subtitleEn : plan.subtitleEs;
  const metaDesc = isEn ? plan.metaDescriptionEn : plan.metaDescriptionEs;
  const overview = isEn ? plan.overviewEn : plan.overviewEs;
  const prerequisites = isEn ? plan.prerequisitesEn : plan.prerequisitesEs;
  const tips = isEn ? plan.tipsEn : plan.tipsEs;
  const faq = isEn ? plan.faqEn : plan.faqEs;
  const relatedBlog = isEn ? plan.relatedBlogEn : plan.relatedBlogEs;
  const locale = isEn ? 'en-US' : 'es-ES';
  const ogLocale = isEn ? 'en_US' : 'es_ES';
  const schema = buildSchema(plan, lang);

  // Labels
  const L = isEn ? {
    home: 'Home', plans: 'Training Plans', duration: 'Duration', weeks: 'weeks',
    daysWeek: 'Days/week', level: 'Level', distance: 'Distance',
    prerequisites: 'Prerequisites', weekLabel: 'Week', day: 'Day',
    session: 'Session', tips: 'Tips', faq: 'FAQ', relatedPlans: 'Related Plans',
    relatedArticles: 'Related Articles', ctaTitle: 'Ready to start?',
    ctaDesc: 'Find running partners in your city to follow this plan together.',
    ctaBtn: 'Join Free', nlTitle: 'Get plans and tips in your email',
    nlPlaceholder: 'your@email.com', nlBtn: 'Subscribe', nlPrivacy: 'We respect your privacy. Cancel anytime.',
    overview: 'Overview', training: 'Training Plan Week by Week'
  } : {
    home: 'Inicio', plans: 'Planes de Entrenamiento', duration: 'Duraci&oacute;n', weeks: 'semanas',
    daysWeek: 'D&iacute;as/semana', level: 'Nivel', distance: 'Distancia',
    prerequisites: 'Requisitos previos', weekLabel: 'Semana', day: 'D&iacute;a',
    session: 'Sesi&oacute;n', tips: 'Consejos', faq: 'Preguntas Frecuentes', relatedPlans: 'Planes Relacionados',
    relatedArticles: 'Art&iacute;culos Relacionados', ctaTitle: '&iquest;Listo para empezar?',
    ctaDesc: 'Encuentra compa&ntilde;eros de running en tu ciudad para seguir este plan juntos.',
    ctaBtn: 'Unirme Gratis', nlTitle: 'Recibe planes y consejos en tu email',
    nlPlaceholder: 'tu@email.com', nlBtn: 'Suscribirme', nlPrivacy: 'Respetamos tu privacidad. Cancela cuando quieras.',
    overview: 'Resumen', training: 'Plan de Entrenamiento Semana a Semana'
  };

  // ── Prerequisites HTML ──
  const prereqHtml = (prerequisites && prerequisites.length > 0) ? `
  <div class="prereq">
    <strong>${L.prerequisites}:</strong>
    <ul>${prerequisites.map(p => `<li>${p}</li>`).join('')}</ul>
  </div>` : '';

  // ── Plan info cards ──
  const infoHtml = `
  <div class="plan-info">
    <div class="info-card"><div class="icon">&#128197;</div><div class="label">${L.duration}</div><div class="value">${plan.durationWeeks} ${L.weeks}</div></div>
    <div class="info-card"><div class="icon">&#127939;</div><div class="label">${L.daysWeek}</div><div class="value">${plan.daysPerWeek}</div></div>
    <div class="info-card"><div class="icon">&#127942;</div><div class="label">${L.level}</div><div class="value">${levelBadge(plan.level, lang)}</div></div>
    <div class="info-card"><div class="icon">&#128207;</div><div class="label">${L.distance}</div><div class="value">${plan.distance}</div></div>
  </div>`;

  // ── Weeks HTML (details/summary for expand-collapse) ──
  const weeksHtml = (plan.weeks || []).map((w, idx) => {
    const wTitle = isEn ? w.titleEn : w.titleEs;
    const wSummary = isEn ? w.summaryEn : w.summaryEs;
    const rows = (w.sessions || []).map(s => {
      const dayStr = isEn ? s.dayEn : s.dayEs;
      const descStr = isEn ? s.descEn : s.descEs;
      return `        <tr><td>${dayStr}</td><td>${descStr}</td></tr>`;
    }).join('\n');
    const openAttr = idx === 0 ? ' open' : '';
    return `
    <details class="week-block"${openAttr}>
      <summary class="week-header">
        <span>${L.weekLabel} ${w.weekNum} &mdash; ${wTitle}</span>
        <span class="arrow">&#9660;</span>
      </summary>
      <div class="week-body">
        ${wSummary ? `<p style="padding:10px 18px 0;font-size:.9rem;color:#5c4d3d">${wSummary}</p>` : ''}
        <div style="overflow-x:auto">
          <table class="session-table">
            <thead><tr><th>${L.day}</th><th>${L.session}</th></tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
      </div>
    </details>`;
  }).join('');

  // ── Tips HTML ──
  const tipsHtml = (tips && tips.length > 0) ? `
  <h2>${L.tips}</h2>
  ${tips.map(t => `<div class="tip"><strong>&#128161;</strong> ${t}</div>`).join('\n')}` : '';

  // ── FAQ HTML ──
  const faqHtml = (faq && faq.length > 0) ? `
  <div class="faq-section">
    <h2>${L.faq}</h2>
    ${faq.map(f => `
    <details class="faq-item">
      <summary>${esc(f.q)}</summary>
      <div class="faq-answer"><p>${f.a}</p></div>
    </details>`).join('')}
  </div>` : '';

  // ── Related plans ──
  const relatedPlanSlugs = plan.relatedPlanSlugs || [];
  const relatedPlansHtml = relatedPlanSlugs.length > 0 ? `
  <div class="related">
    <h3>${L.relatedPlans}</h3>
    <div class="related-links">
      ${relatedPlanSlugs.map(rs => {
        const rp = plans[rs];
        if (!rp) return '';
        const rpSlug = isEn ? rp.slugEn : rp.slugEs;
        const rpTitle = isEn ? rp.titleEn : rp.titleEs;
        return `<a href="/${dir}/${rpSlug}">${rpTitle}</a>`;
      }).filter(Boolean).join('\n      ')}
    </div>
  </div>` : '';

  // ── Related blog articles ──
  const relatedBlogHtml = (relatedBlog && relatedBlog.length > 0) ? `
  <div class="related">
    <h3>${L.relatedArticles}</h3>
    <div class="related-links">
      ${relatedBlog.map(url => {
        const name = url.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `<a href="${url}">${name}</a>`;
      }).join('\n      ')}
    </div>
  </div>` : '';

  // ── Full HTML ──
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">
<title>${esc(title)} | CorrerJuntos</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="es" href="${DOMAIN}/planes/${plan.slugEs}">
<link rel="alternate" hreflang="en" href="${DOMAIN}/plans/${plan.slugEn}">
<link rel="alternate" hreflang="x-default" href="${DOMAIN}/planes/${plan.slugEs}">
<meta property="og:title" content="${esc(title)} | CorrerJuntos">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${plan.heroImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@CorrerJuntos">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(metaDesc)}">
<meta name="twitter:image" content="${plan.heroImage}">
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
    <a href="/${dir}/">${L.plans}</a>
    <span>/</span>
    ${esc(title)}
  </div>
</div>

<div class="hero">
  <div class="hero-bg"><img src="${plan.heroImage}" alt="${esc(title)}" loading="eager" fetchpriority="high" width="1200" height="600"></div>
  <div class="hero-content">
    <h1>${title}</h1>
    <p>${subtitle}</p>
  </div>
</div>

<div class="container content">

  <h2>${L.overview}</h2>
  <p>${overview}</p>

  ${prereqHtml}

  ${infoHtml}

  <h2>${L.training}</h2>
  <div class="weeks-section">
    ${weeksHtml}
  </div>

  ${tipsHtml}

  ${faqHtml}

  ${relatedPlansHtml}

  ${relatedBlogHtml}

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
  const dir = isEn ? 'plans' : 'planes';
  const outDir = isEn ? PLANS_DIR : PLANES_DIR;
  const canonical = `${DOMAIN}/${dir}/`;
  const locale = isEn ? 'en-US' : 'es-ES';
  const ogLocale = isEn ? 'en_US' : 'es_ES';
  const allPlans = Object.values(plans);

  const L = isEn ? {
    title: 'Training Plans',
    metaTitle: 'Free Training Plans for Runners | CorrerJuntos',
    metaDesc: 'Free training plans for 5K, 10K, Half Marathon and Marathon. From beginner to advanced. Follow step by step and improve your times.',
    heroDesc: 'Free training plans from 5K to Marathon. Choose your distance and level, and start progressing today.',
    home: 'Home',
    filterAll: 'All', filterDistance: '5K', filter10K: '10K', filterHalf: 'Half Marathon', filterMarathon: 'Marathon', filterGoal: 'By Goal', filterSpecial: 'Specialized',
    weeks: 'wk', days: 'd/wk',
    groupLabels: { '5K': '5K Plans', '10K': '10K Plans', 'Media Marat\u00f3n': 'Half Marathon Plans', 'Marat\u00f3n': 'Marathon Plans', 'Objetivo': 'By Goal', 'Especializado': 'Specialized' }
  } : {
    title: 'Planes de Entrenamiento',
    metaTitle: 'Planes de Entrenamiento Gratis para Runners | CorrerJuntos',
    metaDesc: 'Planes de entrenamiento gratuitos para 5K, 10K, Media Marat&oacute;n y Marat&oacute;n. Desde principiante hasta avanzado. Sigue paso a paso y mejora tus tiempos.',
    heroDesc: 'Planes de entrenamiento gratuitos desde 5K hasta Marat&oacute;n. Elige tu distancia y nivel, y empieza a progresar hoy.',
    home: 'Inicio',
    filterAll: 'Todos', filterDistance: '5K', filter10K: '10K', filterHalf: 'Media Marat&oacute;n', filterMarathon: 'Marat&oacute;n', filterGoal: 'Por Objetivo', filterSpecial: 'Especializados',
    weeks: 'sem', days: 'd&iacute;as/sem',
    groupLabels: { '5K': 'Planes 5K', '10K': 'Planes 10K', 'Media Marat\u00f3n': 'Planes Media Marat\u00f3n', 'Marat\u00f3n': 'Planes Marat\u00f3n', 'Objetivo': 'Por Objetivo', 'Especializado': 'Especializados' }
  };

  // Group plans by distance category
  const groups = {};
  const groupOrder = ['5K', '10K', 'Media Marat\u00f3n', 'Marat\u00f3n', 'Objetivo', 'Especializado'];
  for (const g of groupOrder) groups[g] = [];
  for (const p of allPlans) {
    const cat = p.category === 'distancia' ? p.distance : (p.category === 'objetivo' ? 'Objetivo' : 'Especializado');
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  }

  function renderCard(p) {
    const slug = isEn ? p.slugEn : p.slugEs;
    const t = isEn ? p.titleEn : p.titleEs;
    return `
      <a href="/${dir}/${slug}" class="plan-card" data-distance="${p.distance}" data-category="${p.category}">
        <h3>${t}</h3>
        <div class="card-meta">
          <span>${p.durationWeeks} ${L.weeks}</span>
          <span>${p.daysPerWeek} ${L.days}</span>
          <span>${levelBadge(p.level, lang)}</span>
        </div>
      </a>`;
  }

  function renderGroup(label, items) {
    if (items.length === 0) return '';
    return `
    <h2>${label}</h2>
    <div class="plan-grid">
      ${items.map(renderCard).join('')}
    </div>`;
  }

  const groupsHtml = groupOrder
    .map(g => renderGroup(L.groupLabels[g] || g, groups[g] || []))
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
          itemListElement: allPlans.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: isEn ? p.titleEn : p.titleEs,
            url: `${DOMAIN}/${dir}/${isEn ? p.slugEn : p.slugEs}`
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
<link rel="alternate" hreflang="es" href="${DOMAIN}/planes/">
<link rel="alternate" hreflang="en" href="${DOMAIN}/plans/">
<link rel="alternate" hreflang="x-default" href="${DOMAIN}/planes/">
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
    <button class="filter-btn active" onclick="filterPlans('all')">${L.filterAll}</button>
    <button class="filter-btn" onclick="filterPlans('5K')">${L.filterDistance}</button>
    <button class="filter-btn" onclick="filterPlans('10K')">${L.filter10K}</button>
    <button class="filter-btn" onclick="filterPlans('Media Marat\u00f3n')">${L.filterHalf}</button>
    <button class="filter-btn" onclick="filterPlans('Marat\u00f3n')">${L.filterMarathon}</button>
    <button class="filter-btn" onclick="filterPlans('objetivo')">${L.filterGoal}</button>
    <button class="filter-btn" onclick="filterPlans('especializado')">${L.filterSpecial}</button>
  </div>

  ${groupsHtml}

  <div class="cta-box">
    <h2>${isEn ? 'Train with company' : 'Entrena con compa&ntilde;&iacute;a'}</h2>
    <p>${isEn ? 'Download the app and find running partners to follow your plan together.' : 'Descarga la app y encuentra compa&ntilde;eros de running para seguir tu plan juntos.'}</p>
    <a href="/#app" class="cta">${isEn ? 'Download Free' : 'Descargar Gratis'}</a>
    ${storeBadges(lang)}
  </div>

</div>

${buildFooter(lang)}

<script>
function filterPlans(cat){
  var btns=document.querySelectorAll('.filter-btn');
  btns.forEach(function(b){b.classList.remove('active')});
  event.target.classList.add('active');
  var cards=document.querySelectorAll('.plan-card');
  cards.forEach(function(c){
    if(cat==='all'){c.style.display='';return}
    var d=c.getAttribute('data-distance');
    var ct=c.getAttribute('data-category');
    if(d===cat||ct===cat.toLowerCase()){c.style.display=''}
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
  const allPlans = Object.values(plans);
  const urls = [];

  // Hub pages
  urls.push({ loc: `${DOMAIN}/planes/`, priority: '0.8' });
  urls.push({ loc: `${DOMAIN}/plans/`, priority: '0.8' });

  // Individual plan pages
  for (const p of allPlans) {
    urls.push({ loc: `${DOMAIN}/planes/${p.slugEs}`, priority: '0.7' });
    urls.push({ loc: `${DOMAIN}/plans/${p.slugEn}`, priority: '0.7' });
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
const allPlans = Object.values(plans);

if (slugArg) {
  // Single plan mode
  const plan = plans[slugArg];
  if (!plan) {
    console.error(`Plan "${slugArg}" not found in plans-data.json.`);
    console.error(`Available slugs: ${Object.keys(plans).join(', ')}`);
    process.exit(1);
  }
  const esPath = generatePlanPage(plan, 'es');
  const enPath = generatePlanPage(plan, 'en');
  console.log(`Generated ES: ${path.relative(BASE_DIR, esPath)}`);
  console.log(`Generated EN: ${path.relative(BASE_DIR, enPath)}`);
} else {
  // Full generation mode
  let generated = 0;
  for (const plan of allPlans) {
    generatePlanPage(plan, 'es');
    generatePlanPage(plan, 'en');
    generated++;
  }
  generateHub('es');
  generateHub('en');
  const sitemapCount = generateSitemap();

  console.log(`\n=== Plans Generation Results ===`);
  console.log(`Plans generated: ${generated} (${generated} ES + ${generated} EN = ${generated * 2} pages)`);
  console.log(`Hub pages: 2 (planes/index.html + plans/index.html)`);
  console.log(`Sitemap: sitemap-plans.xml (${sitemapCount} URLs)`);
  console.log(`Total files: ${generated * 2 + 2 + 1}`);
}
