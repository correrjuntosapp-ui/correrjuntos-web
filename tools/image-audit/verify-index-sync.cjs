/**
 * verify-index-sync.cjs — Verify blog index card images match article hero images
 * Also checks for images appearing in too many cards (>3)
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');

function verifyIndex(indexPath, articlesDir, lang) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${lang} INDEX: ${path.basename(indexPath)}`);
  console.log(`${'='.repeat(60)}`);

  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Build article photo map
  const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  const articlePhotoMap = {};
  for (const file of articleFiles) {
    const html = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const m = html.match(/photos\/(\d+)\/pexels/);
    if (m) articlePhotoMap[file.replace('.html', '')] = m[1];
  }

  // Find all pexels images with their alt text
  const imgMatches = [...indexHtml.matchAll(/photos\/(\d+)\/pexels-photo-\d+\.jpeg[^"]*"[^>]*alt="([^"]*)"/g)];
  const byId = {};
  for (const m of imgMatches) {
    if (!byId[m[1]]) byId[m[1]] = [];
    byId[m[1]].push(m[2]);
  }

  const sorted = Object.entries(byId).sort((a, b) => b[1].length - a[1].length);

  console.log('\nImages with 3+ cards:');
  let overLimit = 0;
  for (const [id, alts] of sorted) {
    if (alts.length >= 3) {
      overLimit++;
      console.log(`  PHOTO ${id} (${alts.length} cards):`);
      for (const a of alts) console.log(`    - ${a}`);
    }
  }
  if (overLimit === 0) console.log('  None! All within limit.');

  console.log('\nImages with 2 cards:');
  let atTwo = 0;
  for (const [id, alts] of sorted) {
    if (alts.length === 2) {
      atTwo++;
      console.log(`  ${id}: ${alts.join(' | ')}`);
    }
  }

  const single = sorted.filter(([, a]) => a.length === 1).length;
  console.log(`\nSummary: ${overLimit} over limit (3+) | ${atTwo} at 2 | ${single} unique`);

  // Check mismatches
  const blogPrefix = lang === 'ES' ? '/blog/' : '/blog/en/';
  const linkRegex = new RegExp(`href="${blogPrefix.replace(/\//g, '\\/')}([a-z0-9-]+)"`, 'g');
  let match;
  let mismatches = 0;

  while ((match = linkRegex.exec(indexHtml)) !== null) {
    const slug = match[1];
    const articlePhoto = articlePhotoMap[slug];
    if (!articlePhoto) continue;

    // Check if the card block has this photo
    const blockStart = match.index;
    const block = indexHtml.substring(blockStart, blockStart + 2000);
    const closingA = block.indexOf('</a>');
    if (closingA === -1) continue;
    const cardBlock = block.substring(0, closingA);

    const cardImgMatch = cardBlock.match(/photos\/(\d+)\/pexels/);
    if (cardImgMatch && cardImgMatch[1] !== articlePhoto) {
      mismatches++;
      console.log(`\nMISMATCH: ${slug}`);
      console.log(`  Card: ${cardImgMatch[1]} | Article: ${articlePhoto}`);
    }
  }

  if (mismatches === 0) {
    console.log('\nAll cards match their article hero images!');
  } else {
    console.log(`\n${mismatches} mismatches found!`);
  }
}

verifyIndex(
  path.join(rootDir, 'blog', 'index.html'),
  path.join(rootDir, 'blog'),
  'ES'
);

verifyIndex(
  path.join(rootDir, 'blog', 'en', 'index.html'),
  path.join(rootDir, 'blog', 'en'),
  'EN'
);
