/**
 * Fix author consistency across all blog articles:
 * 1. Replace all author schema blocks with unified Carlos Ruiz + sameAs + proper URL
 * 2. Add <meta name="author"> tag
 * 3. Add visual author box before newsletter/footer
 * 4. Update visible "Por X" text in .meta divs
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');

// Unified author schema block
const authorSchema = `"author": {
        "@type": "Person",
        "name": "Carlos Ruiz",
        "url": "https://www.correrjuntos.com/blog/autor/carlos-ruiz",
        "jobTitle": "Fundador y Editor de Running",
        "sameAs": [
          "https://www.strava.com/athletes/correrjuntos",
          "https://www.instagram.com/correrjuntos.app",
          "https://x.com/correrjuntosapp"
        ]
      }`;

// Inline author schema (for compact/inline schema articles)
const authorSchemaInline = `"author": {"@type": "Person", "name": "Carlos Ruiz", "url": "https://www.correrjuntos.com/blog/autor/carlos-ruiz", "jobTitle": "Fundador y Editor de Running", "sameAs": ["https://www.strava.com/athletes/correrjuntos", "https://www.instagram.com/correrjuntos.app", "https://x.com/correrjuntosapp"]}`;

// Visual author box HTML
const authorBox = `
    <!-- Author Box -->
    <div class="author-box" style="display:flex;gap:16px;align-items:flex-start;padding:24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin:40px 0">
      <img src="/icons/autor-carlos-ruiz.webp" alt="Carlos Ruiz" width="64" height="64" loading="lazy" style="border-radius:50%;flex-shrink:0;border:2px solid rgba(249,115,22,.3)">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a href="/blog/autor/carlos-ruiz" style="color:#fff;font-weight:700;font-size:1rem;text-decoration:none">Carlos Ruiz</a>
          <span style="font-size:.75rem;padding:2px 8px;background:rgba(249,115,22,.15);color:#f97316;border-radius:6px">Fundador</span>
        </div>
        <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin:0">Corredor desde 2015. 3 maratones, 15+ medias maratones. Fundador de CorrerJuntos. Pruebo cada producto que recomendamos y corro cada ruta que publicamos.</p>
        <div style="display:flex;gap:12px;margin-top:8px">
          <a href="https://www.strava.com/athletes/correrjuntos" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Strava">🏃 Strava</a>
          <a href="https://www.instagram.com/correrjuntos.app" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Instagram">📸 Instagram</a>
          <a href="https://x.com/correrjuntosapp" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="X/Twitter">𝕏 Twitter</a>
        </div>
      </div>
    </div>`;

let stats = { schemaFixed: 0, metaAdded: 0, authorBoxAdded: 0, metaTextFixed: 0 };

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // ===== 1. FIX SCHEMA AUTHOR BLOCK =====

  // Pattern A: Multi-line author block
  const multiLinePattern = /"author"\s*:\s*\{\s*\n\s*"@type"\s*:\s*"Person"\s*,\s*\n\s*"name"\s*:\s*"[^"]+"\s*,\s*\n\s*"url"\s*:\s*"[^"]+"\s*,\s*\n\s*"jobTitle"\s*:\s*"[^"]+"\s*\n\s*\}/;
  if (multiLinePattern.test(html)) {
    html = html.replace(multiLinePattern, authorSchema);
    stats.schemaFixed++;
    changed = true;
  }

  // Pattern B: Inline author block
  const inlinePattern = /"author"\s*:\s*\{\s*"@type"\s*:\s*"Person"\s*,\s*"name"\s*:\s*"[^"]+"\s*,\s*"url"\s*:\s*"[^"]+"\s*,\s*"jobTitle"\s*:\s*"[^"]+"\s*\}/;
  if (!changed && inlinePattern.test(html)) {
    html = html.replace(inlinePattern, authorSchemaInline);
    stats.schemaFixed++;
    changed = true;
  }

  // ===== 2. ADD META AUTHOR TAG =====
  if (!html.includes('name="author"')) {
    // Insert after <meta name="viewport">
    const viewportPattern = /<meta name="viewport"[^>]*>/;
    if (viewportPattern.test(html)) {
      html = html.replace(viewportPattern, (match) => `${match}\n<meta name="author" content="Carlos Ruiz">`);
      stats.metaAdded++;
      changed = true;
    }
  }

  // ===== 3. ADD VISUAL AUTHOR BOX =====
  if (!html.includes('author-box')) {
    // Insert before the first community CTA or newsletter section
    // Try several insertion points
    const insertionPatterns = [
      /(\s*<!-- Community CTA -->)/,
      /(\s*<!-- CTA -->)/,
      /(\s*<!-- NEWSLETTER -->)/,
      /(\s*<!-- Newsletter -->)/,
      /(\s*<div class="cta-box">(?![\s\S]*<div class="cta-box">))/,  // last cta-box
    ];

    let inserted = false;
    for (const pattern of insertionPatterns) {
      if (pattern.test(html) && !inserted) {
        html = html.replace(pattern, `${authorBox}\n$1`);
        stats.authorBoxAdded++;
        inserted = true;
        changed = true;
        break;
      }
    }

    // Fallback: insert before </div>\s*</div>\s*<footer if no CTA found
    if (!inserted) {
      const footerPattern = /(\s*<footer)/;
      if (footerPattern.test(html)) {
        html = html.replace(footerPattern, `${authorBox}\n$1`);
        stats.authorBoxAdded++;
        changed = true;
      }
    }
  }

  // ===== 4. FIX VISIBLE AUTHOR TEXT =====
  // Replace "Por Diario de un Corredor" with "Por Carlos Ruiz" in visible text
  if (html.includes('Por Diario de un Corredor')) {
    html = html.replace(/Por Diario de un Corredor/g, 'Por Carlos Ruiz');
    stats.metaTextFixed++;
    changed = true;
  }
  // Also handle "Diario de un Corredor" standalone in meta divs
  if (html.includes('>Diario de un Corredor<')) {
    html = html.replace(/>Diario de un Corredor</g, '>Carlos Ruiz<');
    stats.metaTextFixed++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
  }
}

// Also fix blog/index.html author references
const indexPath = path.join(blogDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');
if (indexHtml.includes('Diario de un Corredor')) {
  indexHtml = indexHtml.replace(/Diario de un Corredor/g, 'Carlos Ruiz');
  fs.writeFileSync(indexPath, indexHtml, 'utf-8');
  console.log('  blog/index.html: Updated author references');
}

console.log('\n✓ Author fixes applied');
console.log(`  Schema blocks unified: ${stats.schemaFixed}`);
console.log(`  Meta[author] tags added: ${stats.metaAdded}`);
console.log(`  Author boxes inserted: ${stats.authorBoxAdded}`);
console.log(`  Visible text fixed: ${stats.metaTextFixed}`);
