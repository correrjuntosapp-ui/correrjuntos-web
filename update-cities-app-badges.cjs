/**
 * Batch script: Add app download badges to all city pages
 * Adds badges in hero section (after CTA) and in cta-box (after CTA)
 * Also injects the CSS styles needed for the badges
 */
const fs = require('fs');
const path = require('path');

const citiesDir = path.join(__dirname, 'cities');

// Badge HTML for hero section
const heroBadgesHTML = `
  <div class="hero-badges">
    <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/><path fill="#fff" d="M15.3 2c.06 1.18-.43 2.35-1.14 3.2-.72.86-1.89 1.52-3.04 1.43-.07-1.15.46-2.34 1.15-3.13C13 2.63 14.22 2.04 15.3 2"/></svg>
      <div><div class="badge-label">Descargar en</div><div class="badge-store">App Store</div></div>
    </a>
    <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464l.001 1z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg>
      <div><div class="badge-label">Descargar en</div><div class="badge-store">Google Play</div></div>
    </a>
  </div>`;

// CSS for badges
const badgesCSS = `.hero-badges{display:flex;justify-content:center;gap:12px;margin-top:20px}.hero-badges a{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.6);color:#fff;padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.2);text-decoration:none;font-size:.82rem;font-weight:600;transition:all .2s;backdrop-filter:blur(8px)}.hero-badges a:hover{border-color:rgba(249,115,22,.5);transform:translateY(-1px);box-shadow:0 4px 16px rgba(249,115,22,.2)}.hero-badges a svg{width:20px;height:20px;flex-shrink:0}.hero-badges .badge-label{font-size:.6rem;opacity:.7;line-height:1}.hero-badges .badge-store{font-size:.85rem;font-weight:700;line-height:1.1}.cta-badges{display:flex;justify-content:center;gap:12px;margin-top:16px}.cta-badges a{display:flex;align-items:center;gap:8px;background:#000;color:#fff;padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.15);text-decoration:none;font-size:.82rem;font-weight:600;transition:all .2s}.cta-badges a:hover{border-color:rgba(249,115,22,.5);transform:translateY(-1px)}.cta-badges a svg{width:20px;height:20px;flex-shrink:0}.cta-badges .badge-label{font-size:.6rem;opacity:.7;line-height:1}.cta-badges .badge-store{font-size:.85rem;font-weight:700;line-height:1.1}`;

// Badge HTML for cta-box section
const ctaBadgesHTML = `
    <div class="cta-badges">
      <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/><path fill="#fff" d="M15.3 2c.06 1.18-.43 2.35-1.14 3.2-.72.86-1.89 1.52-3.04 1.43-.07-1.15.46-2.34 1.15-3.13C13 2.63 14.22 2.04 15.3 2"/></svg>
        <div><div class="badge-label">Descargar en</div><div class="badge-store">App Store</div></div>
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464l.001 1z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg>
        <div><div class="badge-label">Descargar en</div><div class="badge-store">Google Play</div></div>
      </a>
    </div>`;

let updated = 0;
let skipped = 0;
let errors = 0;

const files = fs.readdirSync(citiesDir).filter(f => f.endsWith('.html') && f !== 'index.html');

for (const file of files) {
  const filePath = path.join(citiesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has badges
  if (html.includes('hero-badges')) {
    skipped++;
    console.log(`SKIP (already has badges): ${file}`);
    continue;
  }

  let changed = false;

  // 1. Inject CSS before closing </style>
  const styleCloseIdx = html.lastIndexOf('</style>');
  if (styleCloseIdx !== -1) {
    html = html.slice(0, styleCloseIdx) + badgesCSS + '\n' + html.slice(styleCloseIdx);
    changed = true;
  }

  // 2. Add badges after CTA in hero-content (after <a href="/#app" class="cta">...</a>)
  // Pattern: <a href="/#app" class="cta">...</a>\n  </div>\n</div>
  const heroCtaRegex = /(<a href="\/#app" class="cta">[^<]+<\/a>)\s*\n(\s*<\/div>\s*\n<\/div>)/;
  if (heroCtaRegex.test(html)) {
    html = html.replace(heroCtaRegex, `$1${heroBadgesHTML}\n$2`);
    changed = true;
  }

  // 3. Add badges after CTA in cta-box
  // Pattern: <a href="/#app" class="cta">Comenzar Gratis</a>\n  </div>
  const ctaBoxRegex = /(<a href="\/#app" class="cta">(?:Comenzar Gratis|Start Free|Join Free)<\/a>)\s*\n(\s*<\/div>)/;
  if (ctaBoxRegex.test(html)) {
    html = html.replace(ctaBoxRegex, `$1${ctaBadgesHTML}\n$2`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    console.log(`UPDATED: ${file}`);
  } else {
    errors++;
    console.log(`ERROR (pattern not found): ${file}`);
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
