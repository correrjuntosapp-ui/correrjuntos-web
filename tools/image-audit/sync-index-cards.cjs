/**
 * sync-index-cards.cjs — Sync blog index card images with article hero images
 * Ensures every card in blog/index.html uses the same Pexels photo as its article.
 * Also syncs blog/en/index.html with EN articles.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');

function syncIndex(indexPath, articlesDir, lang) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SYNCING: ${lang} index (${path.basename(indexPath)})`);
  console.log(`${'='.repeat(60)}`);

  let indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Build map: slug → photo ID from articles
  const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  const articlePhotoMap = {};
  for (const file of articleFiles) {
    const html = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const m = html.match(/photos\/(\d+)\/pexels/);
    if (m) {
      const slug = file.replace('.html', '');
      articlePhotoMap[slug] = m[1];
    }
  }

  // Find all card links in the index that reference articles and have pexels images
  // Pattern: href="/blog/SLUG" or href="/blog/en/SLUG" ... <img src="...photos/ID/pexels..."
  let fixed = 0;
  let already = 0;
  let notFound = 0;

  // Process each pexels image in the index, find its associated article link
  // Strategy: find all <a href="/blog/...SLUG..."...> blocks and update images within them
  const blogPrefix = lang === 'ES' ? '/blog/' : '/blog/en/';

  // Find all article links and their image references
  const linkRegex = new RegExp(`href="${blogPrefix.replace(/\//g, '\\/')}([a-z0-9-]+)"`, 'g');
  let match;
  const slugsInIndex = [];
  while ((match = linkRegex.exec(indexHtml)) !== null) {
    slugsInIndex.push({ slug: match[1], pos: match.index });
  }

  // For each slug found in the index, find any pexels image nearby and update it
  for (const { slug, pos } of slugsInIndex) {
    const articlePhotoId = articlePhotoMap[slug];
    if (!articlePhotoId) {
      continue; // Article not found
    }

    // Find the enclosing <a>...</a> block (up to 2000 chars after the href)
    const blockEnd = Math.min(pos + 2000, indexHtml.length);
    const block = indexHtml.substring(pos, blockEnd);

    // Find the next </a> to limit our search
    const closingA = block.indexOf('</a>');
    if (closingA === -1) continue;

    const cardBlock = block.substring(0, closingA);

    // Find pexels image references in this card
    const imgRegex = /photos\/(\d+)\/pexels-photo-\1/g;
    let imgMatch;
    const idsInCard = new Set();
    while ((imgMatch = imgRegex.exec(cardBlock)) !== null) {
      idsInCard.add(imgMatch[1]);
    }

    for (const cardPhotoId of idsInCard) {
      if (cardPhotoId === articlePhotoId) {
        already++;
        continue;
      }

      // Replace this specific occurrence
      const oldUrl = `photos/${cardPhotoId}/pexels-photo-${cardPhotoId}`;
      const newUrl = `photos/${articlePhotoId}/pexels-photo-${articlePhotoId}`;

      // Only replace within this card's block range
      const absoluteStart = pos;
      const absoluteEnd = pos + closingA;
      const before = indexHtml.substring(0, absoluteStart);
      const cardContent = indexHtml.substring(absoluteStart, absoluteEnd);
      const after = indexHtml.substring(absoluteEnd);

      if (cardContent.includes(oldUrl)) {
        const updatedCard = cardContent.split(oldUrl).join(newUrl);
        indexHtml = before + updatedCard + after;
        fixed++;
        console.log(`  FIXED: ${slug} (${cardPhotoId} → ${articlePhotoId})`);
      }
    }
  }

  // Also fix the hero background if it uses a pexels image
  // (leave as-is since it's a design choice, not article-specific)

  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log(`\nDone: ${fixed} fixed, ${already} already correct`);
  return fixed;
}

const esFixed = syncIndex(
  path.join(rootDir, 'blog', 'index.html'),
  path.join(rootDir, 'blog'),
  'ES'
);

const enFixed = syncIndex(
  path.join(rootDir, 'blog', 'en', 'index.html'),
  path.join(rootDir, 'blog', 'en'),
  'EN'
);

console.log(`\n${'='.repeat(60)}`);
console.log(`TOTAL: ${esFixed + enFixed} card images synced`);
