#!/usr/bin/env node
/**
 * fix-titles-metas.cjs
 * Batch fix for blog titles >65 chars and meta descriptions >160 chars.
 * Strategy:
 *   1. Titles: remove "| CorrerJuntos" / "- CorrerJuntos" suffix if that brings it <=65
 *   2. Titles still >65: apply shortening rules (remove year, simplify phrases)
 *   3. Metas: truncate at ~155 chars at natural word boundary + "..."
 *   4. Also updates og:title and twitter:title to match
 */

const fs = require('fs');
const path = require('path');

const TITLE_MAX = 65;
const META_MAX = 155;
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

function decode(str) {
  return str
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&iquest;/g, '¿').replace(/&iexcl;/g, '¡');
}

// Title shortening rules (applied in order)
function shortenTitle(title) {
  let t = title;

  // Rule 1: Remove brand suffix
  t = t.replace(/\s*[\|–—-]\s*CorrerJuntos\s*$/, '').trim();

  if (decode(t).length <= TITLE_MAX) return t;

  // Rule 2: Remove bracketed tags like [Comparativa], [Ciencia], etc.
  t = t.replace(/\s*\[[^\]]+\]\s*/g, ' ').trim();
  if (decode(t).length <= TITLE_MAX) return t;

  // Rule 3: Remove year in parentheses like (2026)
  t = t.replace(/\s*\(2026\)/g, '').trim();
  if (decode(t).length <= TITLE_MAX) return t;

  // Rule 4: Remove standalone year at end
  t = t.replace(/\s+2026\s*$/, '').trim();
  if (decode(t).length <= TITLE_MAX) return t;

  // Rule 5: Simplify "Guía Completa" → "Guía"
  t = t.replace(/Gu[ií]a Completa/gi, 'Guía').replace(/Guia Completa/gi, 'Guía').trim();
  if (decode(t).length <= TITLE_MAX) return t;

  // Rule 6: Simplify "para Runners" → "para Corredores" (shorter? no, same)
  // Rule 6b: Remove ", Tratamiento y Prevención" → ": Guía"
  t = t.replace(/:\s*Causas,\s*Tratamiento\s*y\s*Prevenci[oó]n/g, ': Causas y Soluciones').trim();
  if (decode(t).length <= TITLE_MAX) return t;

  // Rule 7: Remove "Resistentes al Sudor y Seguros" → shorter qualifiers
  t = t.replace(/:\s*Resistentes al Sudor y Seguros/g, ' para Correr').trim();
  if (decode(t).length <= TITLE_MAX) return t;

  // Rule 8: Shorten long colon subtitles - only if before colon is >=40 chars (meaningful)
  // and result is <=65
  const decoded = decode(t);
  const colonIdx = decoded.indexOf(':');
  if (colonIdx >= 40 && colonIdx <= TITLE_MAX) {
    return t.substring(0, t.indexOf(':')).trim();
  }

  // If still too long, just return what we have (don't over-truncate)
  return t;
}

// Meta description shortening
function shortenMeta(meta) {
  const decoded = decode(meta);
  if (decoded.length <= META_MAX) return meta;

  // Find a good truncation point at word boundary before META_MAX
  let cutoff = META_MAX - 3; // room for "..."
  const words = decoded.split(' ');
  let result = '';
  for (const w of words) {
    if ((result + ' ' + w).trim().length > cutoff) break;
    result = (result + ' ' + w).trim();
  }

  // Re-encode back to HTML entities for the meta tag
  return encodeForHtml(result + '...');
}

function encodeForHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/á/g, '&aacute;').replace(/é/g, '&eacute;').replace(/í/g, '&iacute;')
    .replace(/ó/g, '&oacute;').replace(/ú/g, '&uacute;').replace(/ñ/g, '&ntilde;')
    .replace(/Á/g, '&Aacute;').replace(/É/g, '&Eacute;').replace(/Í/g, '&Iacute;')
    .replace(/Ó/g, '&Oacute;').replace(/Ú/g, '&Uacute;').replace(/Ñ/g, '&Ntilde;')
    .replace(/¿/g, '&iquest;').replace(/¡/g, '&iexcl;');
}

// Collect files
const blogDir = path.join(__dirname, 'blog');
const files = [];

fs.readdirSync(blogDir).forEach(f => {
  if (f.endsWith('.html') && f !== 'index.html') files.push(path.join(blogDir, f));
});

['entrenamiento', 'nutricion', 'equipamiento', 'tecnologia', 'zapatillas', 'salud',
 'rutas', 'trail', 'running', 'atleta-hibrido', 'atletas-hibridos'].forEach(sub => {
  const dir = path.join(blogDir, sub);
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      const fp = path.join(dir, f);
      if (f.endsWith('.html') && f !== 'index.html' && fs.statSync(fp).isFile()) files.push(fp);
    });
  }
});

// Also process EN articles
const enDir = path.join(blogDir, 'en');
if (fs.existsSync(enDir)) {
  fs.readdirSync(enDir).forEach(f => {
    if (f.endsWith('.html') && f !== 'index.html') files.push(path.join(enDir, f));
  });
  ['training', 'running', 'nutrition', 'equipment', 'technology', 'health',
   'routes', 'trail', 'running-shoes', 'hybrid-athletes'].forEach(sub => {
    const dir = path.join(enDir, sub);
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(f => {
        const fp = path.join(dir, f);
        if (f.endsWith('.html') && f !== 'index.html' && fs.statSync(fp).isFile()) files.push(fp);
      });
    }
  });
}

let titlesFixed = 0, metasFixed = 0, filesModified = 0;

files.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fname = path.relative(__dirname, filePath);

  // Fix title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    const rawTitle = titleMatch[1];
    const decodedLen = decode(rawTitle).trim().length;

    if (decodedLen > TITLE_MAX) {
      const shortened = shortenTitle(rawTitle);
      const newLen = decode(shortened).trim().length;

      if (newLen < decodedLen) {
        html = html.replace(`<title>${rawTitle}</title>`, `<title>${shortened}</title>`);

        // Also update og:title
        const ogMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
        if (ogMatch) {
          html = html.replace(ogMatch[0], `<meta property="og:title" content="${shortened}"`);
        }

        // Also update twitter:title
        const twMatch = html.match(/<meta\s+name="twitter:title"\s+content="([^"]+)"/);
        if (twMatch) {
          html = html.replace(twMatch[0], `<meta name="twitter:title" content="${shortened}"`);
        }

        titlesFixed++;
        modified = true;
        if (VERBOSE) console.log(`  TITLE [${decodedLen}→${newLen}] ${fname}`);
      }
    }
  }

  // Fix meta description
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (metaMatch) {
    const rawMeta = metaMatch[1];
    const decodedLen = decode(rawMeta).trim().length;

    if (decodedLen > 160) {
      const shortened = shortenMeta(rawMeta);
      const newLen = decode(shortened).trim().length;

      if (newLen < decodedLen) {
        html = html.replace(metaMatch[0], `<meta name="description" content="${shortened}"`);

        // Also update og:description
        const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/);
        if (ogDescMatch && decode(ogDescMatch[1]).length > 160) {
          html = html.replace(ogDescMatch[0], `<meta property="og:description" content="${shortened}"`);
        }

        metasFixed++;
        modified = true;
        if (VERBOSE) console.log(`  META  [${decodedLen}→${newLen}] ${fname}`);
      }
    }
  }

  if (modified && !DRY_RUN) {
    fs.writeFileSync(filePath, html, 'utf8');
    filesModified++;
  }
});

console.log(`\n✅ fix-titles-metas.cjs complete`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Titles fixed: ${titlesFixed}`);
console.log(`   Metas fixed: ${metasFixed}`);
console.log(`   Files modified: ${DRY_RUN ? '0 (dry run)' : filesModified}`);
