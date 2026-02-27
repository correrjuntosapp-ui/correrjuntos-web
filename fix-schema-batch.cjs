/**
 * fix-schema-batch.cjs
 * Fixes two Schema issues across all blog articles:
 *   A) Author Schema URL mismatch (Jose Marquez → /autor/jose-marquez)
 *   B) JSON-LD image field (generic og-image.png → actual hero image from og:image meta)
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// ── File traversal (same pattern as fix-hero-html.cjs) ──
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

// ── Counters ──
let authorFixed = 0;
let authorNameFixed = 0;
let jobTitleFixed = 0;
let imageFixed = 0;
let skipped = 0;

const allFiles = getAllHtmlFiles(BASE_DIR);

allFiles.forEach(filePath => {
  const rel = path.relative(BASE_DIR, filePath).replace(/\\/g, '/');

  // Only process blog articles (not index, categoria, autor pages)
  if (!/^blog\//.test(rel)) return;
  if (rel.includes('index.html') || rel.includes('categoria/') || rel.includes('autor/')) return;

  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // ── Detect author from meta tag ──
  const authorMatch = html.match(/<meta\s+name="author"\s+content="([^"]+)"/i);
  const author = authorMatch ? authorMatch[1].trim() : '';

  // ── Fix A: Author Schema URL ──
  if (author === 'Jose Marquez' || author === 'José Márquez') {
    // Fix URL: carlos-ruiz → jose-marquez (only in JSON-LD context)
    if (html.includes('"url":"https://www.correrjuntos.com/blog/autor/carlos-ruiz"') ||
        html.includes('"url": "https://www.correrjuntos.com/blog/autor/carlos-ruiz"')) {
      html = html.replace(
        /("url"\s*:\s*"https:\/\/www\.correrjuntos\.com\/blog\/autor\/)carlos-ruiz(")/g,
        '$1jose-marquez$2'
      );
      authorFixed++;
      changed = true;
    }

    // Fix HTML-encoded name → proper UTF-8
    if (html.includes('Jos&eacute; M&aacute;rquez') || html.includes('Jos\\u00e9 M\\u00e1rquez')) {
      html = html.replace(/Jos&eacute; M&aacute;rquez/g, 'José Márquez');
      html = html.replace(/Jos\\u00e9 M\\u00e1rquez/g, 'José Márquez');
      authorNameFixed++;
      changed = true;
    }

    // Fix jobTitle for Jose Marquez
    if (html.includes('"jobTitle":"Fundador y Editor de Running"') ||
        html.includes('"jobTitle": "Fundador y Editor de Running"')) {
      html = html.replace(
        /("jobTitle"\s*:\s*")Fundador y Editor de Running(")/g,
        '$1Fundador de CorrerJuntos$2'
      );
      jobTitleFixed++;
      changed = true;
    }
  } else if (author === 'Carlos Ruiz') {
    // Fix jobTitle for Carlos Ruiz
    if (html.includes('"jobTitle":"Fundador y Editor de Running"') ||
        html.includes('"jobTitle": "Fundador y Editor de Running"')) {
      html = html.replace(
        /("jobTitle"\s*:\s*")Fundador y Editor de Running(")/g,
        '$1Periodista Deportivo y Editor$2'
      );
      jobTitleFixed++;
      changed = true;
    }
  }

  // ── Fix B: JSON-LD image field ──
  // Extract the actual hero image from og:image meta tag
  const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const ogImage = ogMatch ? ogMatch[1] : null;

  if (ogImage && !ogImage.includes('og-image.png') && html.includes('"image":"https://www.correrjuntos.com/icons/og-image.png?v=2"')) {
    html = html.replace(
      '"image":"https://www.correrjuntos.com/icons/og-image.png?v=2"',
      '"image":"' + ogImage + '"'
    );
    imageFixed++;
    changed = true;
  }
  // Also handle spaced variant
  if (ogImage && !ogImage.includes('og-image.png') && html.includes('"image": "https://www.correrjuntos.com/icons/og-image.png?v=2"')) {
    html = html.replace(
      '"image": "https://www.correrjuntos.com/icons/og-image.png?v=2"',
      '"image": "' + ogImage + '"'
    );
    imageFixed++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
  } else {
    skipped++;
  }
});

console.log('=== Schema Batch Fix Results ===');
console.log(`Author URLs fixed (jose-marquez): ${authorFixed}`);
console.log(`Author names fixed (HTML entities): ${authorNameFixed}`);
console.log(`Job titles fixed: ${jobTitleFixed}`);
console.log(`JSON-LD images fixed: ${imageFixed}`);
console.log(`Skipped (no changes needed): ${skipped}`);
