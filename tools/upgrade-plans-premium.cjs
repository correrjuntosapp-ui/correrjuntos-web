#!/usr/bin/env node
/**
 * Upgrade all plan pages to premium design
 * - Google Fonts (Inter + Plus Jakarta Sans)
 * - Premium typography
 * - Glassmorphism stat cards (for pages with plan-hero)
 * - Prereq accent line + checkmarks
 * - Week block hover effects
 * - Km badge orange pill
 * - Tip hover animation
 * - FAQ hover effects
 * - Blur wall fix (opacity instead of filter blur)
 * - Plan-unlock dark navy CTA with official store logos
 * - CTA box dark navy with official store logos
 * - Newsletter premium white card
 * - Footer dark navy
 */

const fs = require('fs');
const path = require('path');

const planesDir = path.join(__dirname, '..', 'planes');

// Get all HTML files except index.html and maraton-sub-4.html (already done)
const files = fs.readdirSync(planesDir)
  .filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'maraton-sub-4.html');

console.log(`Found ${files.length} plan pages to upgrade:\n`);

// Official store badge SVGs
const APPLE_SVG = '<svg width="20" height="24" viewBox="0 0 814 1000" fill="currentColor"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.4-105.7-206-105.7-324.5 0-190.8 124.1-292.1 246.1-292.1 64.9 0 118.9 42.7 159.5 42.7 38.6 0 98.9-45.3 173.1-45.3 28 0 128.5 2.6 194.6 99.6zm-282-187.2c30.1-35.6 51.4-85 51.4-134.5 0-6.9-.7-13.9-2-20.2-49 1.6-106.3 32.6-141.3 73.4-27.5 31.3-53.6 81-53.6 131.1 0 7.5.9 15.1 1.3 17.5 2.3.3 5.9.9 9.5.9 44.1 0 99.3-29.4 134.7-68.2z"/></svg>';

const GOOGLE_SVG = '<svg width="20" height="22" viewBox="0 0 512 512"><path fill="#4285F4" d="M386.2 288.9l93.6-54.2c12.8-7.4 12.8-19.4 0-26.8l-93.6-54.2"/><path fill="#34A853" d="M60.1 494.3L286.7 268l99.5 99.5L78.5 506.7c-9.7 5.6-18.4 1.2-18.4-12.4"/><path fill="#FBBC04" d="M60.1 17.7L286.7 244 386.2 144.5 78.5 5.3C68.8-.3 60.1 4.1 60.1 17.7"/><path fill="#EA4335" d="M286.7 268L60.1 494.3V17.7L286.7 244v24z"/></svg>';

const GOOGLE_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">`;

// CSS replacements (old -> new)
const cssReplacements = [
  // 1. Typography
  [
    `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;background:#fef7ed;color:#3d3229;line-height:1.7}`,
    `body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fef7ed;color:#3d3229;line-height:1.7}h1,h2,h3,.plan-hero-stat-value,.plan-unlock h3,.cta-box h2{font-family:'Plus Jakarta Sans','Inter',sans-serif}`
  ],
  // 2. Badge intermedio
  [
    `.badge-intermedio,.badge-intermediate{background:rgba(234,179,8,.12);color:#b45309;border:1px solid rgba(234,179,8,.2)}`,
    `.badge-intermedio,.badge-intermediate{background:rgba(249,115,22,.1);color:#fb923c;border:1px solid rgba(249,115,22,.3)}`
  ],
  // 3. Week block hover
  [
    `.week-block{margin-bottom:12px;border:1px solid #efe6db;border-radius:14px;overflow:hidden;background:#fffcf9}`,
    `.week-block{margin-bottom:12px;border:1px solid #efe6db;border-radius:14px;overflow:hidden;background:#fffcf9;transition:box-shadow .3s,border-color .3s}.week-block:hover{box-shadow:0 4px 20px rgba(0,0,0,.06);border-color:rgba(249,115,22,.2)}`
  ],
  // 4. Week km badge
  [
    `.week-km{font-size:.8rem;font-weight:600;color:#8b7355;margin-left:8px}`,
    `.week-km{font-size:.75rem;font-weight:700;color:#f97316;background:rgba(249,115,22,.08);padding:2px 10px;border-radius:999px;margin-left:10px}`
  ],
  // 5. Prerequisites
  [
    `.prereq{background:#fffcf9;border:1px solid #efe6db;border-left:3px solid #f97316;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0}.prereq ul{margin:8px 0 0 20px}.prereq li{color:#334155;margin-bottom:4px}`,
    `.prereq{background:#fff;border:1px solid #efe6db;border-left:4px solid;border-image:linear-gradient(to bottom,#f97316,#ea580c) 1;border-radius:0 16px 16px 0;padding:20px 24px;margin:24px 0;box-shadow:0 2px 12px rgba(0,0,0,.04)}.prereq ul{margin:8px 0 0 20px;list-style:none}.prereq li{color:#334155;margin-bottom:6px}.prereq li::before{content:'\\2713';color:#22c55e;font-weight:700;margin-right:8px}`
  ],
  // 6. Tips hover
  [
    `.tip{background:rgba(249,115,22,.06);border-left:3px solid #f97316;padding:16px 20px;border-radius:0 12px 12px 0;margin:16px 0}.tip strong{color:#f97316}`,
    `.tip{background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.1);border-left:3px solid #f97316;padding:16px 20px;border-radius:0 14px 14px 0;margin:12px 0;transition:transform .2s,border-color .2s,box-shadow .2s}.tip:hover{transform:translateX(4px);border-color:rgba(249,115,22,.3);box-shadow:0 2px 12px rgba(249,115,22,.08)}.tip strong{color:#f97316}`
  ],
  // 7. FAQ hover
  [
    `.faq-item{border:1px solid #efe6db;border-radius:12px;margin-bottom:10px;background:#fffcf9;overflow:hidden}`,
    `.faq-item{border:1px solid #efe6db;border-radius:14px;margin-bottom:10px;background:#fffcf9;overflow:hidden;transition:border-color .2s,box-shadow .2s}.faq-item:hover{border-color:rgba(249,115,22,.2);box-shadow:0 2px 12px rgba(0,0,0,.04)}`
  ],
  // 8. CTA box dark navy
  [
    `.cta-box{text-align:center;margin:48px 0;padding:40px 20px;background:rgba(249,115,22,.05);border:1px solid rgba(249,115,22,.15);border-radius:24px}.cta-box h2{margin-top:0}.cta-box p{color:#5c4d3d;margin-bottom:20px}`,
    `.cta-box{text-align:center;margin:48px 0;padding:48px 28px 40px;background:linear-gradient(135deg,#0c1829 0%,#132744 50%,#1a3258 100%);border:1px solid rgba(249,115,22,.15);border-radius:24px;position:relative;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.2)}.cta-box::before{content:'';position:absolute;bottom:-80px;left:-80px;width:220px;height:220px;background:radial-gradient(circle,rgba(249,115,22,.1) 0%,transparent 70%);pointer-events:none}.cta-box h2{margin-top:0;color:#fff}.cta-box p{color:#94a3b8;margin-bottom:24px}`
  ],
  // 9. Newsletter premium
  [
    `.newsletter-box{text-align:center;margin:40px 0;padding:32px 20px;background:rgba(249,115,22,.03);border:1px solid rgba(249,115,22,.1);border-radius:20px}.newsletter-box h3{color:#3d3229;margin-bottom:8px;font-size:1.1rem}`,
    `.newsletter-box{text-align:center;margin:40px 0;padding:36px 24px;background:#fff;border:1px solid #efe6db;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,.04)}.newsletter-box h3{color:#3d3229;margin-bottom:8px;font-size:1.1rem;font-weight:800}`
  ],
  // 10. Newsletter input
  [
    `.newsletter-box input[type="email"]{flex:1;min-width:200px;padding:12px 16px;background:#fffcf9;border:1px solid #efe6db;border-radius:12px;color:#3d3229;font-size:.9rem;outline:none}.newsletter-box input[type="email"]:focus{border-color:#f97316}`,
    `.newsletter-box input[type="email"]{flex:1;min-width:200px;padding:12px 16px;background:#fafafa;border:2px solid #efe6db;border-radius:12px;color:#3d3229;font-size:.9rem;outline:none;transition:border-color .2s,box-shadow .2s}.newsletter-box input[type="email"]:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.1)}`
  ],
  // 11. Footer dark navy
  [
    `/* Footer (warm light) */.footer{background:#fffcf9;border-top:1px solid #efe6db;padding:48px 20px 24px;margin-top:60px}`,
    `/* Footer (dark navy) */.footer{background:#0c1829;border-top:1px solid rgba(255,255,255,.06);padding:48px 20px 24px;margin-top:60px}`
  ],
  // 12. Footer colors
  [
    `.footer-brand{color:#f97316;font-weight:800;font-size:1.1rem;text-decoration:none;display:block;margin-bottom:16px}.footer-desc{color:#8b7355;font-size:.85rem;line-height:1.6}.footer-heading{color:#3d3229;font-weight:700;font-size:.9rem;margin-bottom:16px}.footer-link{color:#5c4d3d;text-decoration:none;font-size:.85rem;display:block;margin-bottom:8px;transition:color .2s}.footer-link:hover{color:#f97316}.footer-social{display:flex;gap:8px;margin-top:16px}.footer-social a{color:#8b7355;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(0,0,0,.04);border-radius:8px;transition:color .2s,background .2s}.footer-social a:hover{color:#f97316;background:rgba(249,115,22,.1)}`,
    `.footer-brand{color:#f97316;font-weight:800;font-size:1.1rem;text-decoration:none;display:block;margin-bottom:16px}.footer-desc{color:#64748b;font-size:.85rem;line-height:1.6}.footer-heading{color:#e2e8f0;font-weight:700;font-size:.9rem;margin-bottom:16px}.footer-link{color:#94a3b8;text-decoration:none;font-size:.85rem;display:block;margin-bottom:8px;transition:color .2s}.footer-link:hover{color:#f97316}.footer-social{display:flex;gap:8px;margin-top:16px}.footer-social a{color:#94a3b8;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,.06);border-radius:8px;transition:color .2s,background .2s}.footer-social a:hover{color:#f97316;background:rgba(249,115,22,.1)}`
  ],
  // 13. Footer bottom
  [
    `.footer-bottom{border-top:1px solid #efe6db;padding-top:24px;text-align:center}.footer-bottom p{color:#8b7355;font-size:.8rem}`,
    `.footer-bottom{border-top:1px solid rgba(255,255,255,.06);padding-top:24px;text-align:center}.footer-bottom p{color:#64748b;font-size:.8rem}`
  ],
  // 14. Blur wall fix
  [
    `.plan-locked{filter:blur(5px);user-select:none;pointer-events:none;max-height:600px;overflow:hidden}`,
    `.plan-locked{opacity:.2;user-select:none;pointer-events:none;max-height:500px;overflow:hidden;position:relative}`
  ],
  // 15. Blur wall fade
  [
    `.plan-locked::after{content:'';position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(to bottom,transparent,#fef7ed)}`,
    `.plan-locked::after{content:'';position:absolute;bottom:0;left:0;right:0;height:250px;background:linear-gradient(to bottom,transparent,#fef7ed);pointer-events:none}`
  ],
  // 16. Plan unlock dark navy
  [
    `.plan-unlock{position:relative;z-index:10;text-align:center;margin:-40px auto 40px;padding:40px 24px;background:rgba(254,247,237,.97);border:2px solid rgba(249,115,22,.3);border-radius:24px;max-width:540px;backdrop-filter:blur(8px)}html.dark .plan-unlock{background:rgba(11,18,32,.97);border-color:rgba(249,115,22,.4)}.plan-unlock h3{font-size:1.3rem;font-weight:800;color:#3d3229;margin-bottom:8px}html.dark .plan-unlock h3{color:#e2e8f0}.plan-unlock p{color:#5c4d3d;font-size:.95rem;margin-bottom:16px}html.dark .plan-unlock p{color:#94a3b8}.plan-unlock .unlock-badge{display:inline-block;background:rgba(34,197,94,.12);color:#16a34a;border:1px solid rgba(34,197,94,.2);padding:4px 14px;border-radius:999px;font-size:.8rem;font-weight:700;margin-bottom:16px}.plan-unlock .social-proof{font-size:.82rem;color:#8b7355;margin-top:12px}html.dark .plan-unlock .social-proof{color:#64748b}`,
    `.plan-unlock{position:relative;z-index:10;text-align:center;margin:-20px auto 40px;padding:48px 32px 40px;background:linear-gradient(135deg,#0c1829 0%,#132744 50%,#1a3258 100%);border:1px solid rgba(249,115,22,.2);border-radius:24px;max-width:560px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}.plan-unlock::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 70%);pointer-events:none}.plan-unlock h3{font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:10px}.plan-unlock p{color:#94a3b8;font-size:.95rem;margin-bottom:20px;line-height:1.6}.plan-unlock .unlock-badge{display:inline-block;background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.25);padding:5px 16px;border-radius:999px;font-size:.8rem;font-weight:700;margin-bottom:16px}.store-badges-unlock{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:4px}.store-badge-btn{display:inline-flex;align-items:center;gap:10px;padding:12px 24px;border-radius:14px;text-decoration:none;font-weight:700;font-size:.9rem;transition:transform .2s,box-shadow .2s}.store-badge-btn:hover{transform:translateY(-2px)}.store-badge-btn.apple{background:#000;color:#fff;border:1px solid rgba(255,255,255,.15);box-shadow:0 4px 20px rgba(0,0,0,.3)}.store-badge-btn.apple:hover{box-shadow:0 8px 28px rgba(0,0,0,.5);color:#fff}.store-badge-btn.google{background:#fff;color:#3d3229;border:1px solid rgba(0,0,0,.08);box-shadow:0 4px 20px rgba(0,0,0,.1)}.store-badge-btn.google:hover{box-shadow:0 8px 28px rgba(0,0,0,.15);color:#3d3229}.plan-unlock .social-proof{font-size:.82rem;color:#64748b;margin-top:16px}`
  ],
  // 17. Plan hero stat glassmorphism (for pages that have it)
  [
    `.plan-hero-stat{text-align:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px 24px;min-width:90px}`,
    `.plan-hero-stat{text-align:center;background:rgba(255,255,255,.07);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:20px 24px;min-width:90px;transition:transform .3s,box-shadow .3s,border-color .3s}.plan-hero-stat:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(249,115,22,.2);border-color:rgba(249,115,22,.4)}`
  ],
  // 18. Plan hero gradient
  [
    `.plan-hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:48px 0 40px;color:#fff}`,
    `.plan-hero{background:linear-gradient(135deg,#0c1829 0%,#132744 40%,#1a3258 100%);padding:48px 0 40px;color:#fff}`
  ],
  // 19. Plan hero stat label
  [
    `.plan-hero-stat-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-top:6px;font-weight:600}`,
    `.plan-hero-stat-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-top:6px;font-weight:600}`
  ],
  // 20. Progress bar label
  [
    `.plan-hero-progress-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;font-weight:600;margin-bottom:10px}`,
    `.plan-hero-progress-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600;margin-bottom:10px}`
  ],
];

// HTML replacements for store badges
const OLD_UNLOCK_CTA = `      <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" class="cta" style="margin:0 8px">App Store</a>
      <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" class="cta" style="margin:0 8px;background:linear-gradient(135deg,#34A853,#0d7a3e)">Google Play</a>`;

const NEW_UNLOCK_CTA = `      <div class="store-badges-unlock">
        <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" class="store-badge-btn apple" target="_blank" rel="noopener">
          ${APPLE_SVG}
          App Store
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" class="store-badge-btn google" target="_blank" rel="noopener">
          ${GOOGLE_SVG}
          Google Play
        </a>
      </div>`;

// Old CTA box store badges (the generic ones)
const OLD_CTA_STORE = `    <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" class="cta">Descargar gratis</a>
    <div class="store-badges">
  <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
    App Store
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" target="_blank" rel="noopener noreferrer">
    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464l.001 1z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg>
    Google Play
  </a>
</div>`;

const NEW_CTA_STORE = `    <div class="store-badges-unlock">
      <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" class="store-badge-btn apple" target="_blank" rel="noopener">
        ${APPLE_SVG}
        App Store
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" class="store-badge-btn google" target="_blank" rel="noopener">
        ${GOOGLE_SVG}
        Google Play
      </a>
    </div>`;

let totalUpdated = 0;

files.forEach(file => {
  const filePath = path.join(planesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 1. Add Google Fonts (after apple-touch-icon line)
  if (!html.includes('fonts.googleapis.com')) {
    html = html.replace(
      '<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">',
      '<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">\n' + GOOGLE_FONTS
    );
    changes++;
  }

  // 2. Apply CSS replacements
  cssReplacements.forEach(([oldCSS, newCSS]) => {
    if (html.includes(oldCSS)) {
      html = html.replace(oldCSS, newCSS);
      changes++;
    }
  });

  // 3. Replace unlock CTA buttons with official logos
  if (html.includes(OLD_UNLOCK_CTA)) {
    html = html.replace(OLD_UNLOCK_CTA, NEW_UNLOCK_CTA);
    changes++;
  }

  // 4. Replace bottom CTA store badges with official logos
  if (html.includes(OLD_CTA_STORE)) {
    html = html.replace(OLD_CTA_STORE, NEW_CTA_STORE);
    changes++;
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✅ ${file} — ${changes} changes`);
    totalUpdated++;
  } else {
    console.log(`  ⏭️  ${file} — already up to date`);
  }
});

console.log(`\n✅ Done! Updated ${totalUpdated}/${files.length} files.`);
