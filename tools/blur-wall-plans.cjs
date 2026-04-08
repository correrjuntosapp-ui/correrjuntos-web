#!/usr/bin/env node
/**
 * Apply blur wall to training plan pages.
 * Shows first 3 weeks, blurs the rest with CTA overlay.
 * Skips beginner/open plans and already-processed plans.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Plans that get blur wall (excluding maraton-sub-4 which is already done)
const BLUR_PLANS = [
  { file: 'planes/5k-sub-25.html', totalWeeks: 9 },
  { file: 'planes/velocidad.html', totalWeeks: 9 },
  { file: 'planes/despues-de-lesion.html', totalWeeks: 9 },
  { file: 'planes/10k-sub-50.html', totalWeeks: 11 },
  { file: 'planes/10k-sub-45.html', totalWeeks: 11 },
  { file: 'planes/resistencia.html', totalWeeks: 11 },
  { file: 'planes/trail-principiantes.html', totalWeeks: 11 },
  { file: 'planes/perder-peso.html', totalWeeks: 13 },
  { file: 'planes/media-maraton-principiantes.html', totalWeeks: 13 },
  { file: 'planes/media-maraton-sub-1-45.html', totalWeeks: 13 },
  { file: 'planes/media-maraton-sub-1-30.html', totalWeeks: 15 },
  { file: 'planes/maraton-principiantes.html', totalWeeks: 17 },
  { file: 'planes/maraton-sub-3-30.html', totalWeeks: 19 },
  { file: 'planes/maraton-sub-3.html', totalWeeks: 19 },
];

const FREE_WEEKS = 3;

// CSS to inject (same as maraton-sub-4)
const BLUR_CSS = `/* Blur wall */.plan-locked-wrapper{position:relative}.plan-locked{filter:blur(5px);user-select:none;pointer-events:none;max-height:600px;overflow:hidden}.plan-locked::after{content:'';position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(to bottom,transparent,#fef7ed)}html.dark .plan-locked::after{background:linear-gradient(to bottom,transparent,#0b1220)}.plan-unlock{position:relative;z-index:10;text-align:center;margin:-40px auto 40px;padding:40px 24px;background:rgba(254,247,237,.97);border:2px solid rgba(249,115,22,.3);border-radius:24px;max-width:540px;backdrop-filter:blur(8px)}html.dark .plan-unlock{background:rgba(11,18,32,.97);border-color:rgba(249,115,22,.4)}.plan-unlock h3{font-size:1.3rem;font-weight:800;color:#3d3229;margin-bottom:8px}html.dark .plan-unlock h3{color:#e2e8f0}.plan-unlock p{color:#5c4d3d;font-size:.95rem;margin-bottom:16px}html.dark .plan-unlock p{color:#94a3b8}.plan-unlock .unlock-badge{display:inline-block;background:rgba(34,197,94,.12);color:#16a34a;border:1px solid rgba(34,197,94,.2);padding:4px 14px;border-radius:999px;font-size:.8rem;font-weight:700;margin-bottom:16px}.plan-unlock .social-proof{font-size:.82rem;color:#8b7355;margin-top:12px}html.dark .plan-unlock .social-proof{color:#64748b}`;

let processed = 0;

for (const plan of BLUR_PLANS) {
  const filePath = path.join(ROOT, plan.file);
  let html = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has blur wall
  if (html.includes('plan-locked')) {
    console.log(`SKIP ${plan.file} (already has blur wall)`);
    continue;
  }

  // 1. Inject blur CSS before /* Responsive */
  if (html.includes('/* Responsive */')) {
    html = html.replace('/* Responsive */', BLUR_CSS + '/* Responsive */');
  }

  // 2. Find the 4th week-block (after 3 free weeks)
  // We need to find the closing </details> of week 3 and the opening of week 4
  let weekCount = 0;
  let insertPos = -1;
  let searchFrom = 0;

  while (weekCount < FREE_WEEKS) {
    const detailsStart = html.indexOf('<details class="week-block"', searchFrom);
    if (detailsStart === -1) {
      // Try with open attribute (first week)
      const detailsOpen = html.indexOf('<details class="week-block" open', searchFrom);
      if (detailsOpen === -1) break;
      searchFrom = detailsOpen + 1;
    } else {
      // Check if there's an "open" version before this one
      const detailsOpen = html.indexOf('<details class="week-block" open', searchFrom);
      if (detailsOpen !== -1 && detailsOpen < detailsStart) {
        searchFrom = detailsOpen + 1;
      } else {
        searchFrom = detailsStart + 1;
      }
    }
    weekCount++;
  }

  // Now find the closing </details> of the 3rd week
  // searchFrom is right after the start of week 3, find its </details>
  const week3End = html.indexOf('</details>', searchFrom);
  if (week3End === -1) {
    console.log(`ERROR ${plan.file}: couldn't find week 3 end`);
    continue;
  }
  insertPos = week3End + '</details>'.length;

  // 3. Find where the weeks section ends (last </details> before Consejos or FAQ)
  // Look for the closing </div> of weeks-section or the next <h2>
  const afterWeeks = html.indexOf('<h2>Consejos</h2>', insertPos) ||
                     html.indexOf('<h2>Tips</h2>', insertPos) ||
                     html.indexOf('<div class="faq-section">', insertPos) ||
                     html.indexOf('<h2>Preguntas', insertPos);

  // Find the last </details> before that point
  let lastDetailsEnd = insertPos;
  let searchPos = insertPos;
  while (true) {
    const next = html.indexOf('</details>', searchPos);
    if (next === -1 || (afterWeeks > 0 && next > afterWeeks)) break;
    lastDetailsEnd = next + '</details>'.length;
    searchPos = next + 1;
  }

  if (lastDetailsEnd <= insertPos) {
    console.log(`ERROR ${plan.file}: couldn't find end of weeks`);
    continue;
  }

  const lockedWeeks = plan.totalWeeks - FREE_WEEKS;

  // 4. Build the CTA + blur wrapper
  const unlockCTA = `

    <!-- BLUR WALL: Semanas ${FREE_WEEKS + 1}-${plan.totalWeeks} bloqueadas -->
    <div class="plan-unlock">
      <span class="unlock-badge">Plan completo GRATIS en la app</span>
      <h3>Desbloquea las ${lockedWeeks} semanas restantes</h3>
      <p>Sigue este plan con tracking de progreso, recordatorios de sesi&oacute;n y runners cerca de ti haciendo el mismo plan.</p>
      <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" class="cta" style="margin:0 8px">App Store</a>
      <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" class="cta" style="margin:0 8px;background:linear-gradient(135deg,#34A853,#0d7a3e)">Google Play</a>
      <p class="social-proof">+1.200 runners ya entrenan con este plan en la app</p>
    </div>

    <div class="plan-locked-wrapper">
    <div class="plan-locked">
`;

  const closingDivs = `
    </div><!-- /.plan-locked -->
    </div><!-- /.plan-locked-wrapper -->
`;

  // 5. Insert the blur wall
  html = html.substring(0, insertPos) +
         unlockCTA +
         html.substring(insertPos, lastDetailsEnd) +
         closingDivs +
         html.substring(lastDetailsEnd);

  fs.writeFileSync(filePath, html, 'utf-8');
  processed++;
  console.log(`OK ${plan.file} (${FREE_WEEKS} free, ${lockedWeeks} locked)`);
}

console.log(`\n=== Done: ${processed} plans processed ===`);
