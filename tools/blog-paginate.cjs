/**
 * Generate static pagination for /blog/ and /blog/en/.
 *
 * Extracts the article-card elements from blog/index.html, sorts them by
 * data-date (newest first), splits them into pages of N cards, and emits:
 *   blog/page/2/index.html
 *   blog/page/3/index.html
 *   ...
 * Each page is a lightweight HTML with:
 *   · canonical pointing to itself
 *   · rel="prev" and rel="next" Link tags
 *   · All the cards for that page (crawlable by Google)
 *   · Minimal styling (inherits from the main blog stylesheet)
 *   · Pagination UI at the bottom
 *
 * The purpose is SEO crawl coverage — users still use the main /blog/
 * which has the dynamic SPA. These static pages let Googlebot follow
 * links into every article without JavaScript.
 *
 * Usage:
 *   node tools/blog-paginate.cjs           # dry-run (count + first page preview)
 *   node tools/blog-paginate.cjs --apply   # write files to disk
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGE_SIZE = 20;
const APPLY = process.argv.includes('--apply');

const CONFIGS = [
  {
    src:  path.join(ROOT, 'blog', 'index.html'),
    outDir: path.join(ROOT, 'blog', 'page'),
    baseUrl: 'https://www.correrjuntos.com/blog/',
    lang: 'es-ES',
    locale: 'es_ES',
    title: 'Blog de Running | CorrerJuntos',
    desc: 'Tips, rutas y guías para corredores de todos los niveles. Aprende, mejora y corre en compañía.',
    labels: { page: 'Página', prev: '← Anterior', next: 'Siguiente →', of: 'de', home: 'Blog' },
  },
  {
    src:  path.join(ROOT, 'blog', 'en', 'index.html'),
    outDir: path.join(ROOT, 'blog', 'en', 'page'),
    baseUrl: 'https://www.correrjuntos.com/blog/en/',
    lang: 'en',
    locale: 'en_US',
    title: 'Running Blog | CorrerJuntos',
    desc: 'Tips, routes and guides for runners of all levels.',
    labels: { page: 'Page', prev: '← Previous', next: 'Next →', of: 'of', home: 'Blog' },
  },
];

function extractCards(html) {
  // Grab every <a class="article-card" …>…</a>, skipping the `article-card featured` hero
  // (we let the featured card stay on page 1 only).
  const re = /<a\s+href="\/blog\/[^"]+"\s+class="article-card(?:\s+featured)?"[^>]*>[\s\S]*?<\/a>/g;
  const matches = html.match(re) || [];
  // Parse out a date from data-date="YYYY-MM-DD" for sorting
  return matches.map(card => {
    const date = (card.match(/data-date="([^"]+)"/) || [])[1] || '1900-01-01';
    return { html: card, date };
  });
}

function buildPage({ cfg, pageNum, totalPages, cards }) {
  const canonical = pageNum === 1 ? cfg.baseUrl : `${cfg.baseUrl}page/${pageNum}/`;
  const prevUrl   = pageNum === 2 ? cfg.baseUrl : (pageNum > 2 ? `${cfg.baseUrl}page/${pageNum - 1}/` : null);
  const nextUrl   = pageNum < totalPages ? `${cfg.baseUrl}page/${pageNum + 1}/` : null;
  const L = cfg.labels;
  const pageTitle = pageNum === 1 ? cfg.title : `${cfg.title} — ${L.page} ${pageNum}`;
  // Unique meta per page: cite the article range + total pages to avoid DUPLICATE flag
  const firstArticleIdx = (pageNum - 1) * 20 + 1;
  const lastArticleIdx  = firstArticleIdx + cards.length - 1;
  const pageDesc = pageNum === 1
    ? cfg.desc
    : (cfg.lang === 'en'
        ? `Page ${pageNum} of our running blog — articles ${firstArticleIdx}-${lastArticleIdx} of the full archive. Guides, reviews and training plans for runners of all levels.`
        : `Página ${pageNum} del blog de running — artículos ${firstArticleIdx}-${lastArticleIdx} del archivo completo. Guías, reviews y planes de entrenamiento para corredores de todos los niveles.`);

  return `<!DOCTYPE html>
<html lang="${cfg.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}</title>
<meta name="description" content="${pageDesc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
${prevUrl ? `<link rel="prev" href="${prevUrl}">` : ''}
${nextUrl ? `<link rel="next" href="${nextUrl}">` : ''}
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${pageDesc}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${cfg.locale}">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="/icons/icon-192.png">
<style>
* { margin: 0; padding: 0; box-sizing: border-box }
body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #fef7ed; color: #3d3229; line-height: 1.6 }
.nav-wrapper { position: sticky; top: 0; z-index: 100; background: rgba(254,247,237,.97); backdrop-filter: blur(12px); border-bottom: 1px solid #efe6db }
nav { padding: 16px 20px; max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between }
nav > a { color: #f97316; text-decoration: none; font-weight: 700; font-size: 1.1rem }
nav .links { display: flex; gap: 16px; font-size: .9rem }
nav .links a { color: #5c4d3d; text-decoration: none; font-weight: 600 }
nav .links a:hover { color: #f97316 }
.container { max-width: 1100px; margin: 0 auto; padding: 32px 20px 60px }
.page-head { margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #e8ddd1 }
.page-head h1 { font-size: 1.5rem; font-weight: 800; color: #3d3229; letter-spacing: -.015em }
.page-head .sub { font-size: .78rem; letter-spacing: .2em; text-transform: uppercase; color: #b5a797; margin-top: 6px; font-weight: 600 }
.articles { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px }
.article-card { background: #fffcf9; border: 1px solid #efe6db; border-radius: 14px; overflow: hidden; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: border-color .2s, box-shadow .2s, transform .2s }
.article-card:hover { border-color: #f97316; box-shadow: 0 8px 24px rgba(61,50,41,.08); transform: translateY(-2px) }
.article-card .card-img { position: relative; aspect-ratio: 16/9; overflow: hidden; background: #f0ebe3 }
.article-card .card-img img { width: 100%; height: 100%; object-fit: cover }
.article-card .badge-new { position: absolute; top: 10px; left: 10px; background: #f97316; color: #fff; font-size: .65rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; letter-spacing: .04em; text-transform: uppercase }
.article-card .card-body { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; gap: 6px }
.article-card .category { display: inline-block; font-size: .68rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; text-transform: uppercase; letter-spacing: .05em; align-self: flex-start; margin-bottom: 2px }
.cat-badge-entrenamiento { color: #9a3412; background: #fff4ee }
.cat-badge-nutricion { color: #065f46; background: #f0fdf4 }
.cat-badge-equipamiento { color: #1e40af; background: #eff6ff }
.cat-badge-tecnologia { color: #5b21b6; background: #f5f3ff }
.cat-badge-zapatillas { color: #9f1239; background: #fff1f2 }
.cat-badge-salud { color: #134e4a; background: #f0fdfa }
.cat-badge-rutas { color: #78350f; background: #fffbeb }
.cat-badge-trail { color: #292524; background: #fafaf9 }
.cat-badge-suplementacion { color: #701a75; background: #fdf4ff }
.cat-badge-atleta-hibrido { color: #1e293b; background: #f8fafc }
.cat-badge-carreras { color: #991b1b; background: #fef2f2 }
.cat-badge-comunidad { color: #ea580c; background: #fff4ee }
.article-card h2 { font-size: 1.05rem; font-weight: 700; line-height: 1.3; color: #3d3229 }
.article-card p { font-size: .88rem; color: #6b5c4d; line-height: 1.5; flex: 1 }
.article-card .author { font-size: .76rem; color: #9a8e7f }
.article-card .card-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 10px; border-top: 1px solid #f0ebe3 }
.article-card .meta { font-size: .76rem; color: #9a8e7f }
.article-card .card-arrow { font-size: .82rem; color: #f97316; font-weight: 600 }

.pagination { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8ddd1 }
.pagination a { padding: 10px 18px; border: 1.5px solid #e8ddd1; background: #fff; border-radius: 8px; text-decoration: none; color: #3d3229; font-size: .85rem; font-weight: 600; transition: all .18s }
.pagination a:hover { border-color: #f97316; color: #f97316; background: #fff8f4 }
.pagination .info { color: #9a8e7f; font-size: .78rem; letter-spacing: .06em; text-transform: uppercase; font-weight: 500 }
.pagination .disabled { opacity: .35; pointer-events: none }
.all-pages { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 6px; justify-content: center }
.all-pages a { padding: 6px 12px; border: 1px solid #e8ddd1; background: #fff; border-radius: 6px; text-decoration: none; color: #6b5c4d; font-size: .78rem; font-weight: 600 }
.all-pages a.current { background: #f97316; border-color: #f97316; color: #fff }
.all-pages a:hover:not(.current) { border-color: #f97316; color: #f97316 }

footer { text-align: center; padding: 24px 20px; color: #9a8e7f; font-size: .78rem; border-top: 1px solid #efe6db }
</style>
</head>
<body>

<div class="nav-wrapper">
<nav>
  <a href="/">CorrerJuntos</a>
  <div class="links">
    <a href="${cfg.baseUrl}">${L.home}</a>
    <a href="/calculadora/">${cfg.lang === 'en' ? 'Pace Calculator' : 'Calculadora'}</a>
  </div>
</nav>
</div>

<div class="container">
  <div class="page-head">
    <div class="sub">${L.page} ${pageNum} ${L.of} ${totalPages}</div>
    <h1>${cfg.title}</h1>
  </div>

  <div class="articles">
    ${cards.map(c => c.html).join('\n    ')}
  </div>

  <nav class="pagination" aria-label="pagination">
    ${prevUrl
      ? `<a href="${prevUrl}" rel="prev">${L.prev}</a>`
      : `<span class="disabled"><a>${L.prev}</a></span>`}
    <span class="info">${L.page} ${pageNum} ${L.of} ${totalPages}</span>
    ${nextUrl
      ? `<a href="${nextUrl}" rel="next">${L.next}</a>`
      : `<span class="disabled"><a>${L.next}</a></span>`}
  </nav>

  <div class="all-pages">
    ${Array.from({ length: totalPages }, (_, i) => {
      const n = i + 1;
      const url = n === 1 ? cfg.baseUrl : `${cfg.baseUrl}page/${n}/`;
      const cls = n === pageNum ? ' class="current"' : '';
      return `<a href="${url}"${cls}>${n}</a>`;
    }).join('\n    ')}
  </div>
</div>

<footer>&copy; 2026 CorrerJuntos.</footer>

</body>
</html>
`;
}

function processConfig(cfg) {
  if (!fs.existsSync(cfg.src)) { console.log(`  skip (source missing): ${cfg.src}`); return 0; }
  const html = fs.readFileSync(cfg.src, 'utf8');
  const cards = extractCards(html);
  // Sort by date descending — most-recent first
  cards.sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(cards.length / PAGE_SIZE);
  console.log(`  ${path.relative(ROOT, cfg.src).replace(/\\/g, '/')}: ${cards.length} cards → ${totalPages} pages (page 1 is the existing index)`);

  if (!APPLY) return totalPages;

  // Page 1 already exists as the real index — only emit 2..N
  let written = 0;
  for (let n = 2; n <= totalPages; n++) {
    const pageCards = cards.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE);
    const html = buildPage({ cfg, pageNum: n, totalPages, cards: pageCards });
    const dir = path.join(cfg.outDir, String(n));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    written++;
  }
  console.log(`  → wrote ${written} static pages to ${path.relative(ROOT, cfg.outDir).replace(/\\/g, '/')}/{2..${totalPages}}/index.html`);
  return totalPages;
}

console.log(`\n=== Blog static pagination ===`);
console.log(`Page size: ${PAGE_SIZE} · Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);
for (const cfg of CONFIGS) processConfig(cfg);
if (!APPLY) console.log(`\n(Dry run — re-run with --apply to write files.)`);
console.log();
