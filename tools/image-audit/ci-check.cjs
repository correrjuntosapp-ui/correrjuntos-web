/**
 * ci-check.cjs - CI guardrail for blog image reuse limits
 *
 * Checks:
 * 1. No Pexels image used in more than 6 files total (ES + EN)
 * 2. No Pexels image used in more than 3 topics
 *    (topic = unique article subject; ES/EN pair counts as 1 topic)
 * 3. Blog index card images match their corresponding article hero images
 *
 * Exit code 0 = all OK, exit code 1 = violations found
 *
 * Usage: node tools/image-audit/ci-check.cjs
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const MAX_FILES = 6;
const MAX_TOPICS = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scanDir(dir, lang) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  const results = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const idMatch = html.match(/photos\/(\d+)\/pexels/);
    if (idMatch) {
      results.push({ file, id: idMatch[1], lang });
    }
  }
  return results;
}

function countTopics(articles) {
  const esCount = articles.filter(a => a.lang === 'ES').length;
  const enCount = articles.filter(a => a.lang === 'EN').length;
  return Math.max(esCount, enCount);
}

// ---------------------------------------------------------------------------
// 1. Scan articles
// ---------------------------------------------------------------------------

const es = scanDir(path.join(rootDir, 'blog'), 'ES');
const en = scanDir(path.join(rootDir, 'blog', 'en'), 'EN');
const all = [...es, ...en];

const byId = {};
for (const a of all) {
  if (!byId[a.id]) byId[a.id] = [];
  byId[a.id].push(a);
}

// ---------------------------------------------------------------------------
// 2. Check limits
// ---------------------------------------------------------------------------

let violations = 0;
const fileViolations = [];
const topicViolations = [];

for (const [id, articles] of Object.entries(byId)) {
  const totalFiles = articles.length;
  const topics = countTopics(articles);

  if (totalFiles > MAX_FILES) {
    fileViolations.push({ id, totalFiles, articles });
    violations++;
  }
  if (topics > MAX_TOPICS) {
    topicViolations.push({ id, topics, articles });
    violations++;
  }
}

// ---------------------------------------------------------------------------
// 3. Index card desync check
// ---------------------------------------------------------------------------

function checkIndexSync(indexPath, articlesDir, lang) {
  if (!fs.existsSync(indexPath)) {
    console.log('  [SKIP] ' + indexPath + ' not found');
    return [];
  }

  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Build article -> photo map
  const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  const articlePhotoMap = {};
  for (const file of articleFiles) {
    const html = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const m = html.match(/photos\/(\d+)\/pexels/);
    if (m) articlePhotoMap[file.replace('.html', '')] = m[1];
  }

  // Find all card links and their images in the index
  const blogPrefix = lang === 'ES' ? '/blog/' : '/blog/en/';
  const escapedPrefix = blogPrefix.replace(/\//g, '\\/');
  const linkRegex = new RegExp('href="' + escapedPrefix + '([a-z0-9-]+)"', 'g');
  const mismatches = [];
  let match;

  while ((match = linkRegex.exec(indexHtml)) !== null) {
    const slug = match[1];
    const articlePhoto = articlePhotoMap[slug];
    if (!articlePhoto) continue;

    // Find the card block (from link to closing </a> tag)
    const blockStart = match.index;
    const block = indexHtml.substring(blockStart, blockStart + 2000);
    const closingA = block.indexOf("</a>");
    if (closingA === -1) continue;
    const cardBlock = block.substring(0, closingA);

    // Find pexels image in the card block
    const cardImgMatch = cardBlock.match(/photos\/(\d+)\/pexels/);
    if (cardImgMatch && cardImgMatch[1] !== articlePhoto) {
      mismatches.push({
        slug,
        lang,
        cardImage: cardImgMatch[1],
        articleImage: articlePhoto
      });
    }
  }

  return mismatches;
}

const esMismatches = checkIndexSync(
  path.join(rootDir, 'blog', 'index.html'),
  path.join(rootDir, 'blog'),
  'ES'
);

const enMismatches = checkIndexSync(
  path.join(rootDir, 'blog', 'en', 'index.html'),
  path.join(rootDir, 'blog', 'en'),
  'EN'
);

const allMismatches = [...esMismatches, ...enMismatches];
if (allMismatches.length > 0) violations += allMismatches.length;

// ---------------------------------------------------------------------------
// 4. Report
// ---------------------------------------------------------------------------

const sorted = Object.entries(byId).sort((a, b) => b[1].length - a[1].length);

console.log('');
console.log('IMAGE CI CHECK');
console.log('='.repeat(60));
console.log('Total articles: ES ' + es.length + ' | EN ' + en.length);
console.log('Unique images: ' + sorted.length);
console.log('Max files per image: ' + MAX_FILES + ' | Max topics per image: ' + MAX_TOPICS);
console.log('');

// File limit violations
if (fileViolations.length > 0) {
  console.log('FAIL: Images exceeding file limit (>' + MAX_FILES + ' files):');
  for (const v of fileViolations) {
    console.log('  PHOTO ' + v.id + ' -> ' + v.totalFiles + ' files');
    for (const a of v.articles) {
      console.log('    [' + a.lang + '] ' + a.file);
    }
  }
  console.log('');
} else {
  console.log('PASS: No image exceeds ' + MAX_FILES + ' files.');
}

// Topic limit violations
if (topicViolations.length > 0) {
  console.log('FAIL: Images exceeding topic limit (>' + MAX_TOPICS + ' topics):');
  for (const v of topicViolations) {
    const esCount = v.articles.filter(a => a.lang === 'ES').length;
    const enCount = v.articles.filter(a => a.lang === 'EN').length;
    console.log('  PHOTO ' + v.id + ' -> ' + v.topics + ' topics (ES:' + esCount + ' EN:' + enCount + ')');
    for (const a of v.articles) {
      console.log('    [' + a.lang + '] ' + a.file);
    }
  }
  console.log('');
} else {
  console.log('PASS: No image exceeds ' + MAX_TOPICS + ' topics.');
}

// Index card sync
if (allMismatches.length > 0) {
  console.log('FAIL: Index card images do not match article hero images:');
  for (const m of allMismatches) {
    console.log('  [' + m.lang + '] ' + m.slug + ': card=' + m.cardImage + ' article=' + m.articleImage);
  }
  console.log('');
} else {
  console.log('PASS: All index card images match article hero images.');
}

// Summary
console.log('');
console.log('-'.repeat(60));

// Top 10 most-used images (informational)
console.log('Top 10 most-used images:');
for (const [id, articles] of sorted.slice(0, 10)) {
  const esCount = articles.filter(a => a.lang === 'ES').length;
  const enCount = articles.filter(a => a.lang === 'EN').length;
  const topics = countTopics(articles);
  const flags = [];
  if (articles.length > MAX_FILES) flags.push('FILES');
  if (topics > MAX_TOPICS) flags.push('TOPICS');
  const flagStr = flags.length > 0 ? ' *** ' + flags.join('+') : '';
  console.log('  ' + id + ': ' + articles.length + ' files (ES:' + esCount + ' EN:' + enCount + ') ' + topics + ' topics' + flagStr);
}

console.log('');
if (violations === 0) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ' + violations + ' VIOLATION(S) FOUND');
  process.exit(1);
}
