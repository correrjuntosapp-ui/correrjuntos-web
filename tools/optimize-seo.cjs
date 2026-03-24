#!/usr/bin/env node
// ============================================================
// optimize-seo.js — Batch SEO title/meta optimizer using Claude API
// Usage:
//   node tools/optimize-seo.js --dry-run --limit=5
//   node tools/optimize-seo.js --lang=en --limit=50
//   node tools/optimize-seo.js --lang=es --limit=50 --skip-done
// ============================================================

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

// ── Config ──
const BLOG_DIRS = [
  { dir: 'blog', lang: 'es' },
  { dir: 'blog/en', lang: 'en' },
  { dir: 'equipamiento', lang: 'es' },
];
const LOG_FILE = path.join(__dirname, '..', 'seo-optimization-log.json');
const DELAY_MS = 500;
const ROOT = path.join(__dirname, '..');

// ── Parse CLI args ──
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipDone = args.includes('--skip-done');
const langFilter = args.find(a => a.startsWith('--lang='))?.split('=')[1] || null;
const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1];
const limit = limitArg ? parseInt(limitArg, 10) : 50;
const fromSlug = args.find(a => a.startsWith('--from='))?.split('=')[1] || null;

// ── Load or init log ──
function loadLog() {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  }
  return {
    last_run: null,
    total_processed: 0,
    articles: [],
  };
}

function saveLog(log) {
  log.last_run = new Date().toISOString().split('T')[0];
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

// ── Extract meta from HTML ──
function extractMeta(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/s);
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/s);
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/s);

  return {
    title: titleMatch?.[1]?.trim() || '',
    meta: metaMatch?.[1]?.trim() || '',
    h1: h1Match?.[1]?.replace(/<[^>]+>/g, '').trim() || '',
    ogTitle: ogTitleMatch?.[1]?.trim() || '',
  };
}

// ── Scan all HTML articles ──
function scanArticles() {
  const articles = [];

  for (const { dir, lang } of BLOG_DIRS) {
    if (langFilter && lang !== langFilter) continue;

    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html') && f !== 'index.html');

    for (const file of files) {
      const slug = file.replace('.html', '');
      const filePath = path.join(fullDir, file);
      const relativePath = path.relative(ROOT, filePath).replace(/\\/g, '/');

      articles.push({ slug, lang, filePath, relativePath });
    }
  }

  return articles;
}

// ── Call Claude API ──
async function optimizeWithClaude(client, article, currentMeta) {
  const prompt = `You are an SEO expert specialized in running, triathlon and fitness content.

Article:
- Slug: ${article.slug}
- Language: ${article.lang}
- Current title: ${currentMeta.title}
- Current meta description: ${currentMeta.meta}
- H1: ${currentMeta.h1}

Generate an optimized SEO title and meta description.

TITLE RULES:
- Maximum 60 characters (STRICT — count carefully)
- Primary keyword at the beginning
- Add year 2026 if evergreen content
- Add number if it's a list article
- Clear promise or benefit
- Language: ${article.lang === 'es' ? 'Spanish' : 'English'}
- Do NOT include "| CorrerJuntos" — I'll add that myself

META DESCRIPTION RULES:
- Maximum 150 characters (STRICT — count carefully)
- Include primary keyword
- CTA at the end
- Don't repeat the title
- If relevant, mention CorrerJuntos app
- Language: ${article.lang === 'es' ? 'Spanish' : 'English'}

Respond ONLY with valid JSON, nothing else:
{"title": "new title here", "meta": "new meta description here"}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  // Extract JSON from response (handle possible markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Invalid response: ${text}`);

  const result = JSON.parse(jsonMatch[0]);

  // Validate lengths
  if (result.title.length > 60) {
    result.title = result.title.substring(0, 57) + '...';
  }
  if (result.meta.length > 155) {
    result.meta = result.meta.substring(0, 152) + '...';
  }

  return result;
}

// ── Apply changes to HTML file ──
function applyChanges(filePath, newTitle, newMeta) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const fullTitle = `${newTitle} | CorrerJuntos`;

  // Update <title>
  html = html.replace(/<title>.*?<\/title>/s, `<title>${fullTitle}</title>`);

  // Update meta description
  html = html.replace(
    /(<meta\s+name=["']description["']\s+content=["']).*?(["'])/s,
    `$1${newMeta}$2`
  );

  // Update og:title
  html = html.replace(
    /(<meta\s+property=["']og:title["']\s+content=["']).*?(["'])/s,
    `$1${newTitle}$2`
  );

  // Update og:description
  html = html.replace(
    /(<meta\s+property=["']og:description["']\s+content=["']).*?(["'])/s,
    `$1${newMeta}$2`
  );

  // Update twitter:title if exists
  html = html.replace(
    /(<meta\s+(?:name|property)=["']twitter:title["']\s+content=["']).*?(["'])/s,
    `$1${newTitle}$2`
  );

  // Update twitter:description if exists
  html = html.replace(
    /(<meta\s+(?:name|property)=["']twitter:description["']\s+content=["']).*?(["'])/s,
    `$1${newMeta}$2`
  );

  // Update dateModified in schema
  html = html.replace(
    /("dateModified"\s*:\s*")[\d-]+(")/,
    `$1${new Date().toISOString().split('T')[0]}$2`
  );

  fs.writeFileSync(filePath, html);
}

// ── Main ──
async function main() {
  console.log('\n🔍 CorrerJuntos SEO Optimizer');
  console.log(`   Mode: ${isDryRun ? '🧪 DRY RUN' : '🚀 REAL'}`);
  console.log(`   Lang: ${langFilter || 'all'}`);
  console.log(`   Limit: ${limit}`);
  console.log(`   Skip done: ${skipDone}`);
  if (fromSlug) console.log(`   From: ${fromSlug}`);
  console.log('');

  const client = new Anthropic();
  const log = loadLog();
  const doneSlus = new Set(log.articles.filter(a => a.status === 'done').map(a => `${a.slug}-${a.lang}`));

  // Scan articles
  const allArticles = scanArticles();
  console.log(`📂 Found ${allArticles.length} articles\n`);

  // Filter
  let articles = allArticles;
  if (skipDone) {
    articles = articles.filter(a => !doneSlus.has(`${a.slug}-${a.lang}`));
  }
  if (fromSlug) {
    const idx = articles.findIndex(a => a.slug === fromSlug);
    if (idx > 0) articles = articles.slice(idx);
  }
  articles = articles.slice(0, limit);

  console.log(`📝 Processing ${articles.length} articles\n`);
  console.log('─'.repeat(90));
  console.log(`${'Slug'.padEnd(45)} ${'Title (chars)'.padEnd(20)} ${'Meta (chars)'.padEnd(15)} Status`);
  console.log('─'.repeat(90));

  let processed = 0;
  let errors = 0;
  const startTime = Date.now();

  for (const article of articles) {
    try {
      const html = fs.readFileSync(article.filePath, 'utf-8');
      const current = extractMeta(html);

      // Call Claude API
      const optimized = await optimizeWithClaude(client, article, current);

      const titleChars = optimized.title.length;
      const metaChars = optimized.meta.length;
      const titleOk = titleChars <= 60;
      const metaOk = metaChars <= 155;
      const status = titleOk && metaOk ? '✅' : '⚠️';

      console.log(
        `${article.slug.padEnd(45)} ${(optimized.title.substring(0, 18) + '..').padEnd(20)} ${(`${titleChars}c / ${metaChars}c`).padEnd(15)} ${status}`
      );

      if (!isDryRun) {
        applyChanges(article.filePath, optimized.title, optimized.meta);
      }

      // Update log
      const existing = log.articles.findIndex(a => a.slug === article.slug && a.lang === article.lang);
      const entry = {
        slug: article.slug,
        lang: article.lang,
        path: article.relativePath,
        processed_at: new Date().toISOString().split('T')[0],
        title_before: current.title,
        title_after: `${optimized.title} | CorrerJuntos`,
        meta_before: current.meta,
        meta_after: optimized.meta,
        title_chars: titleChars,
        meta_chars: metaChars,
        status: isDryRun ? 'dry-run' : 'done',
      };

      if (existing >= 0) {
        log.articles[existing] = entry;
      } else {
        log.articles.push(entry);
      }

      processed++;

      // Rate limit delay
      if (processed < articles.length) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    } catch (err) {
      console.log(`${article.slug.padEnd(45)} ${'ERROR'.padEnd(20)} ${err.message.substring(0, 30)}`);
      errors++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log.total_processed = log.articles.filter(a => a.status === 'done').length;
  saveLog(log);

  console.log('─'.repeat(90));
  console.log(`\n📊 Summary:`);
  console.log(`   Processed this run: ${processed}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total done: ${log.total_processed}/${allArticles.length}`);
  console.log(`   Pending: ${allArticles.length - log.total_processed}`);
  console.log(`   API cost: ~$${(processed * 0.001).toFixed(3)}`);
  console.log(`   Time: ${elapsed}s`);
  console.log(`   Log saved: ${LOG_FILE}`);
  if (isDryRun) console.log(`\n   ⚠️  DRY RUN — no files were modified`);
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
