/**
 * Batch: Add light mode (day mode) as default + social icons in nav + theme toggle
 * Applies to blog/en/index.html AND all blog articles (~344 files)
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');

// Social icons HTML block (inserted after nav-links closing div)
const NAV_SOCIAL_HTML = `
  <div class="nav-social">
    <a href="https://instagram.com/correrjuntosapp/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
    <a href="https://tiktok.com/@correrjuntosapp" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg></a>
    <a href="https://x.com/CorrerJuntos" target="_blank" rel="noopener" aria-label="X"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
    <a href="https://youtube.com/@correrjuntos" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
    <a href="https://strava.com/clubs/correrjuntos" target="_blank" rel="noopener" aria-label="Strava"><svg viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg></a>
  </div>
`;

const THEME_TOGGLE_BUTTON = '<button class="theme-toggle" onclick="toggleBlogTheme()" aria-label="Cambiar tema">\u2600\uFE0F</button>';

const FOUC_SCRIPT = `<script>(function(){var s=localStorage.getItem('blog_theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark-mode')})()</script>`;

// Dark mode CSS block to append (works for both index pages and articles)
const DARK_MODE_CSS = `
.nav-social{display:flex;gap:6px;align-items:center;margin:0 8px}
.nav-social a{color:#64748b;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;transition:color .2s;text-decoration:none}
.nav-social a:hover{color:#f97316}
.nav-social svg{width:16px;height:16px;fill:currentColor}
@media(max-width:768px){.nav-social{display:none}}
.dark-mode{background:#0b1220;color:#fff}
.dark-mode .nav-wrapper{background:rgba(11,18,32,.97);border-bottom-color:rgba(255,255,255,.06)}
.dark-mode .nav-links{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
.dark-mode .nav-links a{color:#94a3b8;background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)}
.dark-mode .nav-links a.active{color:#fff}
.dark-mode .nav-social a{color:#94a3b8}
.dark-mode .hero::before{background:linear-gradient(180deg,rgba(11,18,32,.88) 0%,rgba(11,18,32,.92) 40%,rgba(11,18,32,.96) 100%),radial-gradient(ellipse 80% 60% at 30% 20%,rgba(249,115,22,.15),transparent 60%),radial-gradient(ellipse 60% 50% at 70% 30%,rgba(234,88,12,.1),transparent 50%)}
.dark-mode .hero p,.dark-mode .hero-content p{color:#cbd5e1}
.dark-mode .search-wrap input{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#fff}
.dark-mode .search-wrap input:focus{background:rgba(255,255,255,.07)}
.dark-mode .filter-panel-btn{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08);color:#94a3b8}
.dark-mode .filter-panel-btn:hover{border-color:rgba(255,255,255,.2);color:#fff;background:rgba(255,255,255,.07)}
.dark-mode .article-card,.dark-mode .most-read-card,.dark-mode .explore-card{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.06)}
.dark-mode .article-card:hover{box-shadow:0 20px 48px rgba(0,0,0,.3)}
.dark-mode .article-card.featured{background:rgba(255,255,255,.03);border-color:rgba(249,115,22,.2)}
.dark-mode .card-img::after{background:linear-gradient(transparent,rgba(11,18,32,.6))}
.dark-mode .card-body h2,.dark-mode .featured-content h2,.dark-mode .most-read-info h3,.dark-mode .category-separator h3,.dark-mode .author-bio-info h3{color:#fff}
.dark-mode .card-body p,.dark-mode .featured-content p,.dark-mode .newsletter-section>p,.dark-mode .cta-box p{color:#94a3b8}
.dark-mode .featured-img::after{background:linear-gradient(135deg,rgba(11,18,32,.3),transparent 60%)}
.dark-mode .most-read-card:hover{box-shadow:0 12px 32px rgba(0,0,0,.2)}
.dark-mode .category-separator .sep-line,.dark-mode .end-line{background:rgba(255,255,255,.08)}
.dark-mode .explore-cards{border-top-color:rgba(255,255,255,.06)}
.dark-mode .explore-card:hover{background:rgba(255,255,255,.05)}
.dark-mode .explore-card-label{color:#cbd5e1}
.dark-mode .newsletter-section{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.dark-mode .cta-box{background:rgba(249,115,22,.04);border-color:rgba(249,115,22,.12)}
.dark-mode .cross-links{border-top-color:rgba(255,255,255,.06)}
.dark-mode .cross-link{color:#94a3b8;border-color:rgba(255,255,255,.08)}
.dark-mode .load-more-btn{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#94a3b8}
.dark-mode .author-bio{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.dark-mode .author-bio-info .author-cred{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)}
.dark-mode .mobile-bottom-nav{background:rgba(11,18,32,.97);border-top-color:rgba(249,115,22,.15)}
.dark-mode .mobile-bottom-nav a{color:#94a3b8}
.dark-mode footer{background:rgba(255,255,255,.03)!important;border-top-color:rgba(255,255,255,.06)!important}
.dark-mode .footer-heading{color:#fff!important}
.dark-mode footer a[aria-label]{background:rgba(255,255,255,.06)!important}
.dark-mode .breadcrumb{color:#64748b}
.dark-mode h2{color:#fff}
.dark-mode .content{background:rgba(255,255,255,.025)}
.dark-mode p{color:#cbd5e1}
.dark-mode .tip{background:rgba(249,115,22,.08)}
.dark-mode .toc{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.dark-mode .toc a{color:#94a3b8}
.dark-mode .product-card{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.dark-mode .faq-item{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.dark-mode .newsletter{background:rgba(249,115,22,.04);border-color:rgba(249,115,22,.12)}
.dark-mode .newsletter input{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff}
.dark-mode .related{border-top-color:rgba(255,255,255,.06)}
.dark-mode .spec-item{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)}
.dark-mode .spec-item .spec-value{color:#fff}
.dark-mode .comparison-table th{background:rgba(249,115,22,.12)}
.dark-mode .comparison-table td{color:#cbd5e1;border-bottom-color:rgba(255,255,255,.06)}
.dark-mode .comparison-table td:first-child{color:#fff}
.dark-mode .cookie-banner{background:rgba(11,18,32,.97);border-top-color:rgba(255,255,255,.1)}
.dark-mode .btn-reject{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1)}
`;

// CSS replacements: [search, replace] — applied to the <style> block content
const CSS_REPLACEMENTS = [
  // Body
  ['background:#0b1220', 'background:#f8f9fa'],
  ['color:#fff;line-height:1.7', 'color:#1a1a2e;line-height:1.7'],
  // Nav wrapper
  ['background:rgba(11,18,32,.97);backdrop-filter', 'background:rgba(248,249,250,.97);backdrop-filter'],
  ['border-bottom:1px solid rgba(255,255,255,.06)', 'border-bottom:1px solid rgba(0,0,0,.06)'],
  // Nav links
  ['background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)', 'background:rgba(0,0,0,.04);padding:4px;border-radius:999px;border:1px solid rgba(0,0,0,.08)'],
  ['color:#94a3b8;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)', 'color:#475569;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(0,0,0,.03);border:1px solid rgba(0,0,0,.06)'],
  // Hero overlay — make bottom fade to light bg
  ['rgba(11,18,32,.88) 0%,rgba(11,18,32,.92) 40%,rgba(11,18,32,.96) 100%)', 'rgba(11,18,32,.85) 0%,rgba(11,18,32,.82) 50%,rgba(248,249,250,1) 100%)'],
  // Article hero overlay variation (articles use slightly different pattern sometimes)
  ['rgba(11,18,32,.45) 0%,rgba(11,18,32,.75) 60%,#0b1220 100%', 'rgba(11,18,32,.45) 0%,rgba(11,18,32,.65) 50%,rgba(248,249,250,.95) 100%'],
  // Hero p color
  ['color:#cbd5e1;max-width:640px', 'color:#e2e8f0;max-width:640px'],
  // Search input
  ['background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;color:#fff', 'background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:14px;color:#1a1a2e'],
  ['border-color:rgba(249,115,22,.4);background:rgba(255,255,255,.07)', 'border-color:rgba(249,115,22,.4);background:#fff'],
  // Filter panel buttons
  ['border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#94a3b8;font-size:.78rem', 'border:1px solid rgba(0,0,0,.08);background:#fff;color:#475569;font-size:.78rem'],
  ['border-color:rgba(255,255,255,.2);color:#fff;background:rgba(255,255,255,.07)', 'border-color:rgba(0,0,0,.15);color:#1a1a2e;background:rgba(0,0,0,.03)'],
  // Cards
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:20px', 'background:#fff;border:1px solid #e2e8f0;border-radius:20px'],
  ['box-shadow:0 20px 48px rgba(0,0,0,.3)', 'box-shadow:0 20px 48px rgba(0,0,0,.08)'],
  // Featured card
  ['border:1px solid rgba(249,115,22,.2);background:rgba(255,255,255,.03);border-radius:24px', 'border:1px solid rgba(249,115,22,.15);background:#fff;border-radius:24px'],
  // Card image gradient
  ['background:linear-gradient(transparent,rgba(11,18,32,.6))', 'background:linear-gradient(transparent,rgba(255,255,255,.6))'],
  // Featured image gradient
  ['background:linear-gradient(135deg,rgba(11,18,32,.3),transparent 60%)', 'background:linear-gradient(135deg,rgba(0,0,0,.15),transparent 60%)'],
  // Card body text
  ['font-weight:800;color:#fff;line-height:1.3', 'font-weight:800;color:#1a1a2e;line-height:1.3'],
  ['color:#94a3b8;line-height:1.6;flex-grow', 'color:#475569;line-height:1.6;flex-grow'],
  // Featured content text
  ['font-weight:800;line-height:1.2;color:#fff', 'font-weight:800;line-height:1.2;color:#1a1a2e'],
  ['color:#94a3b8;line-height:1.6}', 'color:#475569;line-height:1.6}'],
  // Most read cards
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:16px', 'background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px'],
  ['box-shadow:0 12px 32px rgba(0,0,0,.2)', 'box-shadow:0 12px 32px rgba(0,0,0,.08)'],
  ['font-weight:700;color:#fff;line-height:1.3;margin-bottom:2px', 'font-weight:700;color:#1a1a2e;line-height:1.3;margin-bottom:2px'],
  // Newsletter
  ['background:rgba(255,255,255,.03);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:28px', 'background:#fff;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(0,0,0,.08);border-radius:28px'],
  ['color:#94a3b8;margin-bottom:24px;font-size:1rem', 'color:#475569;margin-bottom:24px;font-size:1rem'],
  // CTA box
  ['background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.12)', 'background:rgba(249,115,22,.03);border:1px solid rgba(249,115,22,.15)'],
  ['color:#94a3b8;margin-bottom:20px', 'color:#475569;margin-bottom:20px'],
  // Cross links
  ['border-top:1px solid rgba(255,255,255,.06)}', 'border-top:1px solid rgba(0,0,0,.06)}'],
  ['color:#94a3b8;text-decoration:none;padding:8px 18px;border:1px solid rgba(255,255,255,.08)', 'color:#475569;text-decoration:none;padding:8px 18px;border:1px solid rgba(0,0,0,.08)'],
  // End line
  ['height:1px;background:rgba(255,255,255,.06)', 'height:1px;background:rgba(0,0,0,.06)'],
  // Load more
  ['background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:12px 32px', 'background:#fff;border:1px solid rgba(0,0,0,.1);color:#475569;padding:12px 32px'],
  // Category separator
  ['font-weight:700;color:#fff;white-space:nowrap', 'font-weight:700;color:#1a1a2e;white-space:nowrap'],
  ['height:1px;background:rgba(255,255,255,.08)', 'height:1px;background:rgba(0,0,0,.08)'],
  // Explore cards
  ['border-top:1px solid rgba(255,255,255,.06)}', 'border-top:1px solid rgba(0,0,0,.06)}'],
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px', 'background:#fff;border:1px solid #e2e8f0;border-radius:14px'],
  ['background:rgba(255,255,255,.05)}', 'background:rgba(249,115,22,.04)}'],
  ['color:#cbd5e1;text-align:center', 'color:#475569;text-align:center'],
  // Author bio
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;margin', 'background:#fff;border:1px solid #e2e8f0;border-radius:20px;margin'],
  ['font-weight:800;color:#fff;margin-bottom:4px', 'font-weight:800;color:#1a1a2e;margin-bottom:4px'],
  ['background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:999px', 'background:rgba(0,0,0,.03);border:1px solid rgba(0,0,0,.06);border-radius:999px'],
  // Footer class
  ['border-top:1px solid rgba(255,255,255,.06);font-size:.85rem', 'border-top:1px solid rgba(0,0,0,.06);font-size:.85rem'],
  // Mobile bottom nav
  ['background:rgba(11,18,32,.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid rgba(249,115,22,.15)', 'background:rgba(248,249,250,.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid rgba(0,0,0,.08)'],
  // Mobile nav link color
  ['transition:all .2s;color:#94a3b8}', 'transition:all .2s;color:#64748b}'],
  // Article-specific styles
  // Content bg
  ['background:rgba(255,255,255,.025);border-radius:20px', 'background:rgba(0,0,0,.015);border-radius:20px'],
  // Article h2
  ['margin:40px 0 16px;color:#fff', 'margin:40px 0 16px;color:#1a1a2e'],
  // Article h3
  ['margin:24px 0 8px;color:#f97316', 'margin:24px 0 8px;color:#ea580c'],
  // Article p
  ['margin-bottom:16px;color:#cbd5e1', 'margin-bottom:16px;color:#334155'],
  // Article li
  ['margin-bottom:8px;color:#cbd5e1', 'margin-bottom:8px;color:#334155'],
  // Tip
  ['background:rgba(249,115,22,.08);border-left:3px', 'background:rgba(249,115,22,.06);border-left:3px'],
  // Product card
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px', 'background:#fff;border:1px solid #e2e8f0;border-radius:16px'],
  // TOC
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px', 'background:#f8f9fa;border:1px solid rgba(0,0,0,.08);border-radius:16px;padding:20px'],
  // TOC a
  ['color:#94a3b8;text-decoration:none;font-size:.9rem', 'color:#475569;text-decoration:none;font-size:.9rem'],
  // FAQ item
  ['background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px 20px', 'background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px'],
  // Newsletter form
  ['background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.12);border-radius:20px', 'background:rgba(249,115,22,.03);border:1px solid rgba(249,115,22,.12);border-radius:20px'],
  // Newsletter input
  ['background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff', 'background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:12px;color:#1a1a2e'],
  // Related border
  ['border-top:1px solid rgba(255,255,255,.06)}.related', 'border-top:1px solid rgba(0,0,0,.06)}.related'],
  // Spec item
  ['background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px', 'background:#f8f9fa;border:1px solid rgba(0,0,0,.06);border-radius:10px'],
  // Spec value
  ['color:#fff;font-weight:700;font-size:.9rem', 'color:#1a1a2e;font-weight:700;font-size:.9rem'],
  // Comparison table
  ['border-bottom:1px solid rgba(255,255,255,.06)', 'border-bottom:1px solid rgba(0,0,0,.06)'],
  ['background:rgba(249,115,22,.12);color:#f97316', 'background:rgba(249,115,22,.1);color:#ea580c'],
  // Cookie banner
  ['background:rgba(11,18,32,.97);border-top:1px solid rgba(255,255,255,.1)', 'background:rgba(255,255,255,.97);border-top:1px solid rgba(0,0,0,.1)'],
  ['background:rgba(255,255,255,.06);color:#94a3b8;border:1px solid rgba(255,255,255,.1)', 'background:rgba(0,0,0,.04);color:#475569;border:1px solid rgba(0,0,0,.1)'],
  // search clear hover
  ['.search-wrap .search-clear:hover{color:#fff}', '.search-wrap .search-clear:hover{color:#1a1a2e}'],
  // btn-reject hover
  ['.btn-reject:hover{color:#fff}', '.btn-reject:hover{color:#1a1a2e}'],
];

// Footer inline style replacements (outside <style> block)
const HTML_REPLACEMENTS = [
  // Footer bg
  ['background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06);padding:48px', 'background:#f1f5f9;border-top:1px solid rgba(0,0,0,.06);padding:48px'],
  // Footer heading colors
  ['style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px"', 'style="color:#1a1a2e;font-weight:700;font-size:.9rem;margin-bottom:16px" class="footer-heading"'],
  // Footer social icon backgrounds
  ['background:rgba(255,255,255,.06);border-radius:8px', 'background:rgba(0,0,0,.06);border-radius:8px'],
  // Footer bottom divider
  ['border-top:1px solid rgba(255,255,255,.06);padding-top:24px', 'border-top:1px solid rgba(0,0,0,.06);padding-top:24px'],
  // Nav auth "Entrar" button color (for light mode readability)
  ['style="color:#94a3b8;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">Entrar', 'style="color:#64748b;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">Entrar'],
  ['style="color:#94a3b8;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">Login', 'style="color:#64748b;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">Login'],
];

function collectFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip autor directories and non-blog subdirs
      if (entry.name === 'autor' || entry.name === 'node_modules') continue;
      collectFiles(fullPath, files);
    } else if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
      files.push(fullPath);
    }
  }
  return files;
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Skip if already processed
  if (html.includes('nav-social') || html.includes('toggleBlogTheme') || html.includes('blog_theme')) {
    return { path: filePath, status: 'skipped', reason: 'already processed' };
  }

  // 1. Add FOUC script before </head>
  if (html.includes('</head>') && !html.includes('blog_theme')) {
    html = html.replace('</head>', FOUC_SCRIPT + '\n</head>');
    changed = true;
  }

  // 2. Add social icons after nav-links closing div
  // Pattern: </div> followed by whitespace/newline then <div class="nav-auth"
  const navAuthPattern = /(<\/div>\s*)\n(\s*<div class="nav-auth")/;
  if (navAuthPattern.test(html) && !html.includes('nav-social')) {
    html = html.replace(navAuthPattern, '$1\n' + NAV_SOCIAL_HTML + '\n$2');
    changed = true;
  }

  // 3. Add theme toggle button inside nav-auth (before first <a>)
  if (!html.includes('theme-toggle')) {
    html = html.replace(
      /(<div class="nav-auth"[^>]*>)\s*\n\s*(<a )/,
      '$1\n    ' + THEME_TOGGLE_BUTTON + '\n    $2'
    );
    changed = true;
  }

  // 4. Apply CSS replacements in <style> block
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    let css = styleMatch[1];
    for (const [search, replace] of CSS_REPLACEMENTS) {
      if (css.includes(search)) {
        css = css.split(search).join(replace);
        changed = true;
      }
    }
    // Append dark-mode CSS block before closing </style>
    if (!css.includes('.dark-mode{')) {
      css = css + '\n' + DARK_MODE_CSS;
      changed = true;
    }
    html = html.replace(styleMatch[0], '<style>' + css + '</style>');
  }

  // 5. Apply HTML replacements (footer, nav-auth inline styles)
  for (const [search, replace] of HTML_REPLACEMENTS) {
    if (html.includes(search)) {
      html = html.split(search).join(replace);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
    return { path: filePath, status: 'updated' };
  }
  return { path: filePath, status: 'no-changes' };
}

// Collect all article files
const articleFiles = collectFiles(BLOG_DIR);
// Also include blog/en/index.html
const enIndex = path.join(BLOG_DIR, 'en', 'index.html');
if (fs.existsSync(enIndex)) {
  articleFiles.unshift(enIndex);
}

console.log(`Processing ${articleFiles.length} files...`);

let updated = 0, skipped = 0, noChanges = 0, errors = 0;

for (const file of articleFiles) {
  try {
    const result = processFile(file);
    if (result.status === 'updated') {
      updated++;
      console.log(`  ✓ ${path.relative(BLOG_DIR, file)}`);
    } else if (result.status === 'skipped') {
      skipped++;
    } else {
      noChanges++;
    }
  } catch (err) {
    errors++;
    console.error(`  ✗ ${path.relative(BLOG_DIR, file)}: ${err.message}`);
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, No changes: ${noChanges}, Errors: ${errors}`);
