/**
 * fix-author-boxes.cjs
 * Fixes mismatched author-box: where meta author = Jose Marquez
 * but static author-box shows Carlos Ruiz avatar/name/bio.
 * Also ensures Carlos Ruiz articles have correct box.
 */
const fs = require('fs');
const path = require('path');

// Author-box templates
const JM_BOX = `<div class="author-box" style="display:flex;gap:16px;align-items:flex-start;padding:24px;background:rgba(0,0,0,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin:40px 0">
  <img src="/icons/autor-jose-marquez.svg" alt="Jos\u00e9 M\u00e1rquez" width="64" height="64" loading="lazy" style="border-radius:50%;flex-shrink:0;border:2px solid rgba(249,115,22,.3)">
  <div>
    <a href="/blog/autor/jose-marquez" style="font-weight:700;font-size:1.05rem;color:#f97316;text-decoration:none">Jos\u00e9 M\u00e1rquez</a>
    <span style="display:block;font-size:.82rem;color:#94a3b8;margin:2px 0 8px">Fundador de CorrerJuntos &middot; Marat\u00f3n sub-3:30</span>
    <p style="font-size:.88rem;color:#94a3b8;line-height:1.6;margin:0">Corredor desde 2012 y maratoniano sub-3:30. Fund\u00f3 CorrerJuntos con una idea simple: que ning\u00fan runner tenga que entrenar solo.</p>
  </div>
</div>`;

const CR_BOX = `<div class="author-box" style="display:flex;gap:16px;align-items:flex-start;padding:24px;background:rgba(0,0,0,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin:40px 0">
  <img src="/icons/autor-carlos-ruiz.svg" alt="Carlos Ruiz" width="64" height="64" loading="lazy" style="border-radius:50%;flex-shrink:0;border:2px solid rgba(249,115,22,.3)">
  <div>
    <a href="/blog/autor/carlos-ruiz" style="font-weight:700;font-size:1.05rem;color:#3b82f6;text-decoration:none">Carlos Ruiz</a>
    <span style="display:block;font-size:.82rem;color:#94a3b8;margin:2px 0 8px">Editor de Running y Equipamiento &middot; Periodista deportivo</span>
    <p style="font-size:.88rem;color:#94a3b8;line-height:1.6;margin:0">Periodista deportivo y corredor popular con m\u00e1s de 10 a\u00f1os de experiencia. Especializado en an\u00e1lisis de zapatillas, relojes GPS y nutrici\u00f3n deportiva.</p>
  </div>
</div>`;

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
let fixedJM = 0, fixedCR = 0, addedBox = 0, skipped = 0;

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  const metaM = c.match(/meta name="author" content="([^"]+)"/);
  if (!metaM) { skipped++; continue; }

  const author = metaM[1];
  const isJM = author === 'Jose Marquez';
  const isCR = author === 'Carlos Ruiz';
  const correctBox = isJM ? JM_BOX : CR_BOX;

  // Find existing author-box and replace it
  const boxRegex = /<div class="author-box"[\s\S]*?<\/div>\s*<\/div>/;
  const hasBox = boxRegex.test(c);

  if (hasBox) {
    // Check if it's the wrong author
    const hasWrongAuthor = (isJM && c.includes('autor-carlos-ruiz.svg')) ||
                           (isCR && c.includes('autor-jose-marquez.svg'));

    if (hasWrongAuthor) {
      c = c.replace(boxRegex, correctBox);
      fs.writeFileSync(f, c, 'utf8');
      if (isJM) fixedJM++;
      else fixedCR++;
      console.log(`  ✅ Fixed: ${path.basename(f)} (${author})`);
    }
  } else {
    // No author-box at all — add one before .cta-box or before </article> or before newsletter
    const insertPoints = [
      { regex: /(<div[^>]*class="[^"]*cta-box[^"]*")/i, label: 'before cta-box' },
      { regex: /(<section[^>]*class="[^"]*newsletter)/i, label: 'before newsletter' },
      { regex: /(<\/article>)/i, label: 'before /article' },
    ];

    let inserted = false;
    for (const ip of insertPoints) {
      if (ip.regex.test(c)) {
        c = c.replace(ip.regex, correctBox + '\n$1');
        fs.writeFileSync(f, c, 'utf8');
        addedBox++;
        inserted = true;
        console.log(`  ➕ Added box: ${path.basename(f)} (${author}) ${ip.label}`);
        break;
      }
    }
    if (!inserted) {
      skipped++;
    }
  }
}

console.log('\n=== RESULTS ===');
console.log(`Fixed JM articles (had CR box): ${fixedJM}`);
console.log(`Fixed CR articles (had JM box): ${fixedCR}`);
console.log(`Added missing boxes: ${addedBox}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total processed: ${files.length}`);
