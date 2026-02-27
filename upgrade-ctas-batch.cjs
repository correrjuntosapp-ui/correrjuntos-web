/**
 * upgrade-ctas-batch.cjs
 * Part A: Add App Store/Android badges + social proof to CTA box
 * Part B: Insert mid-article CTA after 3rd content H2
 */
const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const APP_STORE_URL = 'https://apps.apple.com/us/app/correr-juntos/id6758505910';

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together', 'categoria', 'autor', 'category', 'author'].includes(e.name)) continue;
      walk(p, files);
    } else if (e.name.endsWith('.html') && e.name !== 'index.html') {
      files.push(p);
    }
  }
  return files;
}

const APPLE_SVG = '<svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>';

const ANDROID_SVG = '<svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="#94a3b8"><path d="M17.6 11.4c0-.6-.5-1-1-1s-1 .5-1 1 .5 1 1 1 1-.5 1-1m-10.2 0c0-.6-.5-1-1-1s-1 .5-1 1 .5 1 1 1 1-.5 1-1m10.5-3.7l1.8-3.1c.1-.2 0-.4-.2-.5-.2-.1-.4 0-.5.2l-1.8 3.1c-1.4-.6-3-1-4.6-1s-3.2.4-4.6 1L6.2 4.3c-.1-.2-.3-.3-.5-.2-.2.1-.3.3-.2.5l1.8 3.1C4.5 9.4 2.5 12.4 2 16h20c-.5-3.6-2.5-6.6-5.1-8.3"/></svg>';

let ctaUpgraded = 0;
let midCtaAdded = 0;

const allFiles = walk(path.join(BASE, 'blog'));

allFiles.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf-8');
  const rel = path.relative(BASE, filePath).replace(/\\/g, '/');
  const isEN = rel.includes('/en/') || html.includes('<html lang="en"');
  let changed = false;

  // ── Part A: Upgrade CTA box with App Store badges ──
  // Find the old pattern: <a href="/" class="cta">...</a> followed by iOS disponible text
  const oldBtnRegex = /<a href="\/" class="cta">[^<]+<\/a>\s*<p style="margin-top:12px;font-size:\.85rem;color:#64748b">[^<]*<\/p>/;

  if (oldBtnRegex.test(html)) {
    const socialProof = isEN
      ? '<p style="font-size:.9rem;color:#f97316;font-weight:700;margin:0 0 12px">Join 5,000+ runners</p>'
      : '<p style="font-size:.9rem;color:#f97316;font-weight:700;margin:0 0 12px">&Uacute;nete a 5.000+ runners</p>';

    const badges = `${socialProof}
  <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center">
    <a href="${APP_STORE_URL}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#000;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:600;font-size:.9rem;border:1px solid rgba(255,255,255,.2);transition:transform .2s">${APPLE_SVG} App Store</a>
    <span style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);color:#64748b;padding:10px 20px;border-radius:12px;font-size:.85rem;border:1px solid rgba(255,255,255,.08)">${ANDROID_SVG} Android ${isEN ? 'Mar' : 'mar'} 2026</span>
  </div>`;

    html = html.replace(oldBtnRegex, badges);
    ctaUpgraded++;
    changed = true;
  }

  // ── Part B: Mid-article CTA after 3rd content H2 ──
  if (!html.includes('cta-mid')) {
    // Find content area
    const contentStart = html.indexOf('<div class="content">');
    if (contentStart < 0) {
      // Try container content pattern
      const altStart = html.indexOf('<div class="container content">');
      if (altStart < 0) {
        if (changed) fs.writeFileSync(filePath, html, 'utf-8');
        return;
      }
    }

    const actualStart = html.indexOf('<div class="content">') >= 0
      ? html.indexOf('<div class="content">')
      : html.indexOf('<div class="container content">');

    // Find H2 tags in the content area, skip TOC and FAQ
    const skipH2 = /Contenido|Contents|En este|In this|Preguntas frecuentes|Frequently|FAQ|Tips de Running|Running Tips|Sigue leyendo|Keep reading|email/i;

    const h2Regex = /<h2[^>]*>[^<]*<\/h2>/g;
    let h2Match;
    let h2Count = 0;
    let insertPos = -1;

    // Only search in content area
    const searchFrom = actualStart;
    const ctaBoxPos = html.indexOf('<div class="cta-box">', searchFrom);
    const searchEnd = ctaBoxPos > searchFrom ? ctaBoxPos : html.length;

    h2Regex.lastIndex = searchFrom;

    while ((h2Match = h2Regex.exec(html)) !== null) {
      if (h2Match.index > searchEnd) break;
      const h2Text = h2Match[0].replace(/<[^>]+>/g, '');
      if (skipH2.test(h2Text)) continue;
      h2Count++;

      if (h2Count === 3) {
        // Find the end of the first <p> after this H2
        const afterH2 = html.indexOf('</p>', h2Match.index + h2Match[0].length);
        if (afterH2 > 0) {
          insertPos = afterH2 + 4;
        }
        break;
      }
    }

    if (insertPos > 0) {
      const midCta = isEN
        ? `\n<div class="cta-mid" style="margin:32px 0;padding:20px 24px;background:linear-gradient(135deg,rgba(249,115,22,.08),rgba(249,115,22,.03));border:1px solid rgba(249,115,22,.15);border-radius:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><p style="color:#fff;font-weight:700;font-size:.95rem;margin:0 0 4px">Find your running group</p><p style="color:#94a3b8;font-size:.85rem;margin:0">5,000+ runners already train together. Free on iOS.</p></div><a href="${APP_STORE_URL}" target="_blank" rel="noopener" class="cta" style="padding:10px 20px;font-size:.85rem;white-space:nowrap">Download free</a></div>\n`
        : `\n<div class="cta-mid" style="margin:32px 0;padding:20px 24px;background:linear-gradient(135deg,rgba(249,115,22,.08),rgba(249,115,22,.03));border:1px solid rgba(249,115,22,.15);border-radius:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><p style="color:#fff;font-weight:700;font-size:.95rem;margin:0 0 4px">Encuentra tu grupo de running</p><p style="color:#94a3b8;font-size:.85rem;margin:0">5.000+ runners ya entrenan juntos. Gratis en iOS.</p></div><a href="${APP_STORE_URL}" target="_blank" rel="noopener" class="cta" style="padding:10px 20px;font-size:.85rem;white-space:nowrap">Descargar gratis</a></div>\n`;

      html = html.substring(0, insertPos) + midCta + html.substring(insertPos);
      midCtaAdded++;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
  }
});

console.log('=== CTA Upgrade Results ===');
console.log(`CTA boxes upgraded (badges + social proof): ${ctaUpgraded}`);
console.log(`Mid-article CTAs inserted: ${midCtaAdded}`);
