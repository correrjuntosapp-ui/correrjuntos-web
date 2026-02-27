/**
 * fix-hero-structure.cjs
 * Fixes:
 *   1. Hero div not closed before .content div (~90 articles)
 *   2. Adds text-align:left to .content CSS (all articles)
 *   3. Fixes meta descriptions missing accents (tildes)
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together'].includes(entry.name)) continue;
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html') && fullPath !== path.join(BASE_DIR, 'index.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

let heroFixed = 0;
let textAlignFixed = 0;
let tildesFixed = 0;

const allFiles = getAllHtmlFiles(BASE_DIR);

allFiles.forEach(filePath => {
  const rel = path.relative(BASE_DIR, filePath).replace(/\\/g, '/');
  if (!/^blog\//.test(rel)) return;
  if (rel.includes('index.html') || rel.includes('categoria/') || rel.includes('autor/')) return;

  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // ── Fix 1: Close hero div before .content (without "container") ──
  // Pattern: hero-content closes, then content div opens inside hero
  // Match: </div>\n\n  <div class="content"> (various whitespace patterns)
  if (html.includes('<div class="hero-content">') && !html.includes('<div class="container content">')) {
    // The hero-content </div> is followed by content div still inside hero
    // We need to add </div> to close the hero before content opens
    const pattern = /(<\/div>)\s*\n(\s*<div class="content">)/;
    const match = html.match(pattern);
    if (match) {
      // Check this is after the hero-content (not some random div)
      const idx = html.indexOf(match[0]);
      const before = html.substring(Math.max(0, idx - 200), idx);
      if (before.includes('hero-content') || before.includes('class="meta"')) {
        html = html.replace(pattern, '$1\n</div>\n\n$2');
        heroFixed++;
        changed = true;
      }
    }
  }

  // ── Fix 2: Add text-align:left to .content CSS ──
  // Find the .content CSS rule and add text-align:left if missing
  if (html.includes('.content{') && !html.includes('text-align:left')) {
    html = html.replace(
      /\.content\{/,
      '.content{text-align:left;'
    );
    textAlignFixed++;
    changed = true;
  } else if (html.includes('.content {') && !html.includes('text-align:left') && !html.includes('text-align: left')) {
    html = html.replace(
      /\.content\s*\{/,
      '.content{text-align:left;'
    );
    textAlignFixed++;
    changed = true;
  }

  // ── Fix 3: Meta descriptions missing tildes ──
  const metaDescMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (metaDescMatch) {
    let desc = metaDescMatch[1];
    let newDesc = desc;
    // Common missing tildes in Spanish
    newDesc = newDesc.replace(/\bGuia\b/g, 'Guía');
    newDesc = newDesc.replace(/\bguia\b/g, 'guía');
    newDesc = newDesc.replace(/\bperdida\b/g, 'pérdida');
    newDesc = newDesc.replace(/\bmas\b/g, 'más');
    newDesc = newDesc.replace(/\bmas\./g, 'más.');
    newDesc = newDesc.replace(/\btecnica\b/g, 'técnica');
    newDesc = newDesc.replace(/\btecnicas\b/g, 'técnicas');
    newDesc = newDesc.replace(/\brapido\b/g, 'rápido');
    newDesc = newDesc.replace(/\brapida\b/g, 'rápida');
    newDesc = newDesc.replace(/\bfacil\b/g, 'fácil');
    newDesc = newDesc.replace(/\bfaciles\b/g, 'fáciles');
    newDesc = newDesc.replace(/\bbasico\b/g, 'básico');
    newDesc = newDesc.replace(/\bbasica\b/g, 'básica');
    newDesc = newDesc.replace(/\benergetico\b/g, 'energético');
    newDesc = newDesc.replace(/\benergeticos\b/g, 'energéticos');
    newDesc = newDesc.replace(/\bnutricion\b/gi, function(m){ return m[0] === 'N' ? 'Nutrición' : 'nutrición'; });
    newDesc = newDesc.replace(/\bhidratacion\b/gi, function(m){ return m[0] === 'H' ? 'Hidratación' : 'hidratación'; });
    newDesc = newDesc.replace(/\bcomparación\b/g, 'comparación'); // already correct, skip
    newDesc = newDesc.replace(/\bcomparacion\b/g, 'comparación');
    newDesc = newDesc.replace(/\bprevencion\b/g, 'prevención');
    newDesc = newDesc.replace(/\bPrevencion\b/g, 'Prevención');
    newDesc = newDesc.replace(/\blesion\b/g, 'lesión');
    newDesc = newDesc.replace(/\blesiones\b/g, 'lesiones'); // already correct
    newDesc = newDesc.replace(/\bplanificacion\b/g, 'planificación');
    newDesc = newDesc.replace(/\bque\b/g, 'qué'); // only "que" as standalone word

    // Undo false positives for "que" (articles like "que comer" should be "qué comer",
    // but "porque" etc should stay). Actually \bque\b is too aggressive.
    // Revert: only fix "que" at sentence start or after colon/comma
    // Let's undo this and be more careful
    // Actually, let's not touch "que" — too many false positives
    newDesc = newDesc.replace(/\bqué\b/g, 'que'); // revert
    // Only fix "Que" at start
    newDesc = newDesc.replace(/^Que\b/, 'Qué');

    if (newDesc !== desc) {
      html = html.replace(
        '<meta name="description" content="' + desc + '"',
        '<meta name="description" content="' + newDesc + '"'
      );
      tildesFixed++;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
  }
});

console.log('=== Hero Structure Fix Results ===');
console.log(`Hero divs closed: ${heroFixed}`);
console.log(`text-align:left added: ${textAlignFixed}`);
console.log(`Meta descriptions tildes fixed: ${tildesFixed}`);
