/**
 * fix-seo-blog-batch.cjs
 * Fixes 3 SEO issues across all blog articles:
 *   1. Adds " | CorrerJuntos" brand suffix to <title> tags that lack it
 *   2. Demotes structural H2s (TOC, newsletter, related) to <div> with same styling
 *   3. Adds og:image:width and og:image:height where missing
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');

let totalFiles = 0;
let brandFixed = 0;
let h2Fixed = 0;
let ogDimFixed = 0;

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // ── 1. Brand suffix in <title> ──
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch && !titleMatch[1].includes('CorrerJuntos')) {
    const oldTitle = titleMatch[0];
    const titleText = titleMatch[1].trim();
    // Remove trailing " |" or " -" if present
    const cleanTitle = titleText.replace(/\s*[\|\-]\s*$/, '');
    const newTitle = `<title>${cleanTitle} | CorrerJuntos</title>`;
    html = html.replace(oldTitle, newTitle);
    changed = true;
    brandFixed++;
  }

  // ── 2. Demote structural H2s ──
  // Pattern: <h2>Contenido</h2> → <div class="toc-title" role="heading" aria-level="3">Contenido</div>
  const structuralH2s = [
    { pattern: /<h2([^>]*)>Contenido<\/h2>/g, cls: 'toc-title' },
    { pattern: /<h2([^>]*)>Table of Contents<\/h2>/g, cls: 'toc-title' },
    { pattern: /<h2([^>]*)>Sigue leyendo<\/h2>/g, cls: 'related-title' },
    { pattern: /<h2([^>]*)>Keep reading<\/h2>/g, cls: 'related-title' },
    { pattern: /<h2([^>]*)>Tips de running en tu email<\/h2>/g, cls: 'newsletter-title' },
    { pattern: /<h2([^>]*)>Running tips in your email<\/h2>/g, cls: 'newsletter-title' },
    { pattern: /<h2([^>]*)>Running tips en tu email<\/h2>/g, cls: 'newsletter-title' },
    // Emoji variants
    { pattern: /<h2([^>]*)>En este art[^<]*<\/h2>/g, cls: 'toc-title' },
    { pattern: /<h2([^>]*)>In this article<\/h2>/g, cls: 'toc-title' },
    { pattern: /<h2([^>]*)>[📬🏃📩]\s*Tips de [Rr]unning[^<]*<\/h2>/g, cls: 'newsletter-title' },
    { pattern: /<h2([^>]*)>[📬🏃📩]\s*Running tips[^<]*<\/h2>/g, cls: 'newsletter-title' },
    { pattern: /<h2([^>]*)>[📚📖]\s*Art[^<]*relacionados<\/h2>/g, cls: 'related-title' },
    { pattern: /<h2([^>]*)>[📚📖]\s*Related[^<]*<\/h2>/g, cls: 'related-title' },
    { pattern: /<h2([^>]*)>Art[ií]culos relacionados<\/h2>/g, cls: 'related-title' },
    { pattern: /<h2([^>]*)>Related articles<\/h2>/g, cls: 'related-title' },
    { pattern: /<h2([^>]*)>[🏙️🏃]\s*Encuentra grupos[^<]*<\/h2>/g, cls: 'related-title' },
    { pattern: /<h2([^>]*)>[🏙️🏃]\s*Find running[^<]*<\/h2>/g, cls: 'related-title' },
    // CTA H2s that are not content headings
    { pattern: /<h2([^>]*)>¿Listo para correr[^<]*<\/h2>/g, cls: 'cta-title' },
    { pattern: /<h2([^>]*)>Ready to run[^<]*<\/h2>/g, cls: 'cta-title' },
    { pattern: /<h2([^>]*)>¿Preparado para[^<]*<\/h2>/g, cls: 'cta-title' },
    // Emoji newsletter - use [\s\S] for multi-byte emoji chars
    { pattern: /<h2([^>]*)>[\s\S]{1,4}\s*Tips de Running en tu Email<\/h2>/g, cls: 'newsletter-title' },
    { pattern: /<h2([^>]*)>[\s\S]{1,4}\s*Running Tips in Your Email<\/h2>/g, cls: 'newsletter-title' },
    { pattern: /<h2([^>]*)>[\s\S]{1,4}\s*Tips de running en tu email<\/h2>/gi, cls: 'newsletter-title' },
    // Generic catch-all for remaining structural CTA H2s
    { pattern: /<h2([^>]*)>Deja de buscar[^<]*<\/h2>/g, cls: 'cta-title' },
    { pattern: /<h2([^>]*)>Stop searching[^<]*<\/h2>/g, cls: 'cta-title' },
    { pattern: /<h2([^>]*)>Empieza a correr[^<]*<\/h2>/g, cls: 'cta-title' },
    { pattern: /<h2([^>]*)>Start running[^<]*<\/h2>/g, cls: 'cta-title' },
  ];

  for (const { pattern, cls } of structuralH2s) {
    const before = html;
    html = html.replace(pattern, (match, attrs) => {
      const text = match.replace(/<\/?h2[^>]*>/g, '');
      return `<div class="${cls} text-xl font-bold"${attrs} role="heading" aria-level="3">${text}</div>`;
    });
    if (html !== before) {
      changed = true;
      h2Fixed++;
    }
  }

  // ── 3. og:image dimensions ──
  if (html.includes('og:image') && !html.includes('og:image:width')) {
    // Add after the og:image line
    html = html.replace(
      /(<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>)/,
      '$1\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">'
    );
    changed = true;
    ogDimFixed++;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
  }
  totalFiles++;
}

// Process all blog articles recursively
function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'images') {
      walkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html') {
      processFile(fullPath);
    }
  }
}

walkDir(BLOG_DIR);

console.log('\n=== Blog SEO Batch Fix Results ===');
console.log(`Total articles processed: ${totalFiles}`);
console.log(`Brand suffix added: ${brandFixed}`);
console.log(`Structural H2s demoted: ${h2Fixed}`);
console.log(`og:image dimensions added: ${ogDimFixed}`);
