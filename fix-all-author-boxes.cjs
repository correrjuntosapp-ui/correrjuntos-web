/**
 * fix-all-author-boxes.cjs
 * Comprehensive fix for ALL author-boxes across ALL blog articles.
 *
 * Problems fixed:
 * 1. CR articles with orange colors (should be blue)
 * 2. JM articles with CR author-box (wrong author)
 * 3. CSS-based author-boxes with wrong gradient color
 * 4. Visible "Por" text mismatches
 * 5. Backslash paths in src/href (\icons\ → /icons/)
 * 6. Schema author mismatches
 */

const fs = require('fs');
const path = require('path');

// ── Author-box templates with CORRECT colors ──

const JM_BOX = `<!-- Author Box -->
    <div class="author-box" style="display:flex;gap:16px;align-items:flex-start;padding:24px;background:rgba(0,0,0,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin:40px 0">
      <img src="/icons/autor-jose-marquez.svg" alt="Jos\u00e9 M\u00e1rquez" width="64" height="64" loading="lazy" style="border-radius:50%;flex-shrink:0;border:2px solid rgba(249,115,22,.3)">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a href="/blog/autor/jose-marquez" style="color:#3d3229;font-weight:700;font-size:1rem;text-decoration:none">Jos\u00e9 M\u00e1rquez</a>
          <span style="font-size:.75rem;padding:2px 8px;background:rgba(249,115,22,.15);color:#f97316;border-radius:6px">Fundador</span>
        </div>
        <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin:0">Corredor desde 2012 y maratoniano sub-3:30. Fund\u00f3 CorrerJuntos con una idea simple: que ning\u00fan runner tenga que entrenar solo. Escribe sobre entrenamiento, carreras y la comunidad runner.</p>
        <div style="display:flex;gap:12px;margin-top:8px">
          <a href="https://www.strava.com/athletes/correrjuntos" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Strava">\ud83c\udfc3 Strava</a>
          <a href="https://www.instagram.com/correrjuntos.app" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Instagram">\ud83d\udcf8 Instagram</a>
          <a href="https://x.com/correrjuntosapp" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="X/Twitter">\ud835\udd4f Twitter</a>
        </div>
      </div>
    </div>`;

const CR_BOX = `<!-- Author Box -->
    <div class="author-box" style="display:flex;gap:16px;align-items:flex-start;padding:24px;background:rgba(0,0,0,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin:40px 0">
      <img src="/icons/autor-carlos-ruiz.svg" alt="Carlos Ruiz" width="64" height="64" loading="lazy" style="border-radius:50%;flex-shrink:0;border:2px solid rgba(59,130,246,.3)">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a href="/blog/autor/carlos-ruiz" style="color:#3d3229;font-weight:700;font-size:1rem;text-decoration:none">Carlos Ruiz</a>
          <span style="font-size:.75rem;padding:2px 8px;background:rgba(59,130,246,.15);color:#3b82f6;border-radius:6px">Editor</span>
        </div>
        <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin:0">Periodista deportivo y corredor popular con m\u00e1s de 10 a\u00f1os de experiencia. Especializado en an\u00e1lisis de zapatillas, relojes GPS, nutrici\u00f3n deportiva y todo lo que un runner necesita para mejorar.</p>
        <div style="display:flex;gap:12px;margin-top:8px">
          <a href="https://www.strava.com/athletes/correrjuntos" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Strava">\ud83c\udfc3 Strava</a>
          <a href="https://www.instagram.com/correrjuntos.app" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Instagram">\ud83d\udcf8 Instagram</a>
          <a href="https://x.com/correrjuntosapp" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="X/Twitter">\ud835\udd4f Twitter</a>
        </div>
      </div>
    </div>`;

// ── Walk helper ──
function walk(dir, ext) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'autor' && e.name !== 'js' && e.name !== 'node_modules') {
      results.push(...walk(p, ext));
    } else if (e.isFile() && e.name.endsWith(ext)) {
      results.push(p);
    }
  }
  return results;
}

const files = walk('blog', '.html');
const stats = {
  replacedCRbox: 0,
  replacedJMbox: 0,
  addedCRbox: 0,
  addedJMbox: 0,
  fixedCSSavatar: 0,
  fixedBackslash: 0,
  fixedPorText: 0,
  fixedSchema: 0,
  skipped: 0,
};

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  const basename = path.basename(f);

  // Skip index pages
  if (basename === 'index.html') continue;

  // Get meta author
  const metaM = c.match(/meta name="author" content="([^"]+)"/);
  if (!metaM) { stats.skipped++; continue; }
  const author = metaM[1];
  const isJM = author === 'Jose Marquez';
  const isCR = author === 'Carlos Ruiz';
  const correctBox = isJM ? JM_BOX : CR_BOX;

  // ── Fix 1: Replace backslash paths everywhere ──
  const beforeBackslash = c;
  c = c.replace(/src="\\icons\\/g, 'src="/icons/');
  c = c.replace(/href="\\blog\\/g, 'href="/blog/');
  if (c !== beforeBackslash) {
    stats.fixedBackslash++;
    changed = true;
  }

  // ── Fix 2: Replace ANY existing author-box with correct one ──
  // Match various author-box patterns (SVG-based, webp-based, CSS-based)

  // Pattern A: SVG/webp inline-styled author-box (from fix-author-boxes or fix-authors)
  const inlineBoxRegex = /(?:<!-- Author Box -->\s*)?<div class="author-box"[^>]*style="[^"]*display:flex[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  if (inlineBoxRegex.test(c)) {
    const currentBox = c.match(inlineBoxRegex)[0];

    // Check if this box is already correct
    const hasCorrectSVG = isJM
      ? currentBox.includes('autor-jose-marquez.svg') && currentBox.includes('Fundador') && !currentBox.includes('3b82f6')
      : currentBox.includes('autor-carlos-ruiz.svg') && currentBox.includes('Editor') && currentBox.includes('3b82f6');

    if (!hasCorrectSVG) {
      c = c.replace(inlineBoxRegex, correctBox);
      if (isJM) stats.replacedJMbox++;
      else stats.replacedCRbox++;
      changed = true;
    }
  }

  // Pattern B: CSS-class based author-box (older articles like agujetas-despues-de-correr.html)
  const cssBoxRegex = /<div class="author-box">\s*<div class="author-avatar">[A-Z]{2}<\/div>[\s\S]*?<\/div>\s*<\/div>/;
  if (cssBoxRegex.test(c)) {
    c = c.replace(cssBoxRegex, correctBox);
    if (isJM) stats.replacedJMbox++;
    else stats.replacedCRbox++;
    changed = true;

    // Also fix the .author-avatar CSS in <style> to match the correct color
    if (isCR && c.includes('.author-avatar{')) {
      c = c.replace(
        /\.author-avatar\{([^}]*?)background:linear-gradient\(135deg,#f97316,#ea580c\)/,
        '.author-avatar{$1background:linear-gradient(135deg,#3b82f6,#2563eb)'
      );
      stats.fixedCSSavatar++;
    }
  }

  // Pattern C: If NO author-box exists at all, add one
  if (!c.includes('class="author-box"')) {
    const insertPoints = [
      { regex: /(<!-- Community CTA -->)/i, label: 'before community CTA' },
      { regex: /(<!-- CTA -->)/i, label: 'before CTA comment' },
      { regex: /(<div[^>]*class="[^"]*cta-box[^"]*")/i, label: 'before cta-box' },
      { regex: /(<!-- NEWSLETTER -->)/i, label: 'before newsletter comment' },
      { regex: /(<section[^>]*class="[^"]*newsletter)/i, label: 'before newsletter section' },
      { regex: /(<\/article>)/i, label: 'before /article' },
      { regex: /(<footer)/i, label: 'before footer' },
    ];

    let inserted = false;
    for (const ip of insertPoints) {
      if (ip.regex.test(c)) {
        c = c.replace(ip.regex, correctBox + '\n$1');
        if (isJM) stats.addedJMbox++;
        else stats.addedCRbox++;
        inserted = true;
        changed = true;
        break;
      }
    }
    if (!inserted) {
      stats.skipped++;
    }
  }

  // ── Fix 3: Fix visible "Por" text in meta div ──
  // cuanto-tardo-en-correr-5km.html has "Por Carlos Ruiz" but meta says Jose Marquez
  if (isJM) {
    const porCR = /Por Carlos Ruiz/;
    if (porCR.test(c)) {
      c = c.replace(porCR, 'Por Jos\u00e9 M\u00e1rquez');
      stats.fixedPorText++;
      changed = true;
    }
  }
  if (isCR) {
    const porJM = /Por Jos[eé] M[aá]rquez/;
    if (porJM.test(c)) {
      c = c.replace(porJM, 'Por Carlos Ruiz');
      stats.fixedPorText++;
      changed = true;
    }
  }

  // ── Fix 4: Fix schema author name mismatch ──
  if (isJM) {
    // Schema says Carlos Ruiz but should say José Márquez for JM articles
    const schemaNameWrong = /"author"\s*:\s*\{[^}]*"name"\s*:\s*"Carlos Ruiz"[^}]*\}/;
    if (schemaNameWrong.test(c)) {
      c = c.replace(
        /"name"\s*:\s*"Carlos Ruiz"/,
        '"name": "Jos\u00e9 M\u00e1rquez"'
      );
      c = c.replace(
        /\/blog\/autor\/carlos-ruiz/g,
        '/blog/autor/jose-marquez'
      );
      stats.fixedSchema++;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
    console.log('  Fixed: ' + basename);
  }
}

console.log('\n=== FIX RESULTS ===');
console.log('CR boxes replaced (orange->blue):', stats.replacedCRbox);
console.log('JM boxes replaced (wrong->correct):', stats.replacedJMbox);
console.log('CR boxes added:', stats.addedCRbox);
console.log('JM boxes added:', stats.addedJMbox);
console.log('CSS avatars fixed:', stats.fixedCSSavatar);
console.log('Backslash paths fixed:', stats.fixedBackslash);
console.log('Visible "Por" text fixed:', stats.fixedPorText);
console.log('Schema author fixed:', stats.fixedSchema);
console.log('Skipped:', stats.skipped);
console.log('Total files:', files.length);
