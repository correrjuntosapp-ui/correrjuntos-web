const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');

// Generate a slug from Spanish heading text
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-')         // spaces to hyphens
        .replace(/-+/g, '-')          // collapse multiple hyphens
        .replace(/^-|-$/g, '')        // trim hyphens
        .slice(0, 60);                // max length
}

// TOC CSS to inject if missing
const tocCSS = `.toc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-left:3px solid #f97316;border-radius:12px;padding:20px 24px;margin:0 0 32px}.toc h2{font-size:.95rem;color:#fff;margin:0 0 12px}.toc ul{list-style:none;margin:0;padding:0}.toc li{margin:4px 0}.toc a{color:#94a3b8;text-decoration:none;font-size:.88rem;transition:color .2s}.toc a:hover{color:#f97316}`;

let updated = 0;
let skipped = 0;
let alreadyHas = 0;

for (const file of files) {
    const filePath = path.join(blogDir, file);
    let html = fs.readFileSync(filePath, 'utf-8');

    // Skip if already has TOC
    if (html.includes('class="toc"')) {
        alreadyHas++;
        continue;
    }

    // Find the content area boundaries
    // Content H2s are those BEFORE the author-box, share-article, or cta-box
    let actualStart = html.indexOf('<div class="container content">');
    if (actualStart === -1) actualStart = html.indexOf('<div class="container"><div class="content">');
    if (actualStart === -1) {
        // Handle multiline: <div class="container">\n  <div class="content">
        const contentDivMatch = html.match(/<div class="content">/);
        if (contentDivMatch) {
            actualStart = html.indexOf(contentDivMatch[0]);
        }
    }

    if (actualStart === -1) {
        console.log(`[SKIP] No content container found in: ${file}`);
        skipped++;
        continue;
    }

    // Find end of content area (before author-box, share-article, or first cta-box)
    const authorBox = html.indexOf('class="author-box"', actualStart);
    const shareArticle = html.indexOf('class="share-article"', actualStart);
    const firstCtaBox = html.indexOf('class="cta-box"', actualStart);

    // Content ends at the earliest of these markers
    const markers = [authorBox, shareArticle, firstCtaBox].filter(m => m !== -1);
    if (markers.length === 0) {
        console.log(`[SKIP] No content boundary found in: ${file}`);
        skipped++;
        continue;
    }
    const contentEnd = Math.min(...markers);

    // Extract the content section
    const contentSection = html.slice(actualStart, contentEnd);

    // Find all H2s in the content section
    const h2Regex = /<h2([^>]*)>(.*?)<\/h2>/gi;
    const h2s = [];
    let match;
    while ((match = h2Regex.exec(contentSection)) !== null) {
        const attrs = match[1];
        const text = match[2].replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim(); // strip HTML tags and entities
        const idMatch = attrs.match(/id="([^"]+)"/);
        const existingId = idMatch ? idMatch[1] : null;
        h2s.push({
            fullMatch: match[0],
            attrs: attrs,
            text: text,
            existingId: existingId,
            offset: match.index
        });
    }

    if (h2s.length < 2) {
        console.log(`[SKIP] Only ${h2s.length} H2(s) in: ${file}`);
        skipped++;
        continue;
    }

    // Assign IDs to H2s that don't have them
    const usedIds = new Set();
    for (const h2 of h2s) {
        if (h2.existingId) {
            usedIds.add(h2.existingId);
            h2.id = h2.existingId;
        } else {
            let slug = slugify(h2.text);
            // Ensure uniqueness
            let finalSlug = slug;
            let counter = 2;
            while (usedIds.has(finalSlug)) {
                finalSlug = slug + '-' + counter;
                counter++;
            }
            usedIds.add(finalSlug);
            h2.id = finalSlug;
        }
    }

    // Build updated content with IDs on H2s
    let updatedHtml = html;

    // We need to replace H2s that lack IDs (work backwards to preserve offsets)
    const h2sToFix = h2s.filter(h => !h.existingId).reverse();
    for (const h2 of h2sToFix) {
        const globalOffset = actualStart + h2.offset;
        const oldH2 = h2.fullMatch;
        // Insert id attribute
        const newH2 = oldH2.replace('<h2', `<h2 id="${h2.id}"`);
        updatedHtml = updatedHtml.slice(0, globalOffset) + newH2 + updatedHtml.slice(globalOffset + oldH2.length);
    }

    // Build the TOC HTML
    const tocItems = h2s.map(h => `      <li><a href="#${h.id}">${h.text}</a></li>`).join('\n');
    const tocHTML = `
  <nav class="toc" aria-label="Tabla de contenidos">
    <h2>En este artículo</h2>
    <ul>
${tocItems}
    </ul>
  </nav>
`;

    // Find the first H2 position in the updated HTML to insert TOC before it
    // We need to re-find because offsets changed
    const firstH2InContent = updatedHtml.indexOf('<h2', actualStart);
    if (firstH2InContent === -1 || firstH2InContent >= contentEnd + 500) { // +500 buffer for added IDs
        console.log(`[SKIP] Could not find first H2 for TOC insertion in: ${file}`);
        skipped++;
        continue;
    }

    // Insert TOC before the first H2
    updatedHtml = updatedHtml.slice(0, firstH2InContent) + tocHTML + '\n' + updatedHtml.slice(firstH2InContent);

    // Add TOC CSS if not present
    if (!updatedHtml.includes('.toc{') && !updatedHtml.includes('.toc {')) {
        // Find the closing </style> tag and insert TOC CSS before it
        const styleClose = updatedHtml.lastIndexOf('</style>');
        if (styleClose !== -1) {
            updatedHtml = updatedHtml.slice(0, styleClose) + tocCSS + '\n' + updatedHtml.slice(styleClose);
        }
    }

    fs.writeFileSync(filePath, updatedHtml, 'utf-8');
    updated++;
    console.log(`[OK] Added TOC (${h2s.length} items) to: ${file}`);
}

console.log(`\nDone! TOC added to ${updated} files. Already had TOC: ${alreadyHas}. Skipped: ${skipped}.`);
