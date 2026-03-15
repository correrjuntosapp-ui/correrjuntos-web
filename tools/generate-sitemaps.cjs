/**
 * generate-sitemaps.cjs
 * Generates optimized sitemap architecture for correrjuntos.com
 *
 * Output:
 *   sitemap-index.xml
 *   sitemap-blog-es.xml  (with hreflang)
 *   sitemap-blog-en.xml  (with hreflang)
 *   sitemap-cities.xml
 *   sitemap-places.xml
 *   sitemap-events.xml
 *   sitemap-equipamiento.xml
 *   sitemap-pages.xml
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = path.resolve(__dirname, '..');
const DOMAIN = 'https://www.correrjuntos.com';
const TODAY = new Date().toISOString().split('T')[0];

// ── Helpers ──────────────────────────────────────────────

function xmlHead(extra = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${extra}>\n`;
}
const XHTML_NS = ' xmlns:xhtml="http://www.w3.org/1999/xhtml"';
const IMAGE_NS = ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
const xmlTail = '</urlset>\n';

function urlEntry(loc, lastmod) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n`;
}

function urlEntryHreflang(loc, lastmod, alternates) {
  let xml = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n`;
  for (const { lang, href } of alternates) {
    xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>\n`;
  }
  xml += `  </url>\n`;
  return xml;
}

function getLastmod(filePath) {
  try {
    const rel = path.relative(BASE, filePath).replace(/\\/g, '/');
    const date = execSync(`git log -1 --format=%cd --date=short -- "${rel}"`, {
      cwd: BASE, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return date || TODAY;
  } catch { return TODAY; }
}

function isRedirectPage(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8').slice(0, 500);
    return html.includes('meta http-equiv="refresh"') || html.includes('window.location.replace');
  } catch { return false; }
}

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => f.replace('.html', ''));
}

function listHtmlDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'index.html')))
    .map(d => d.name);
}

function extractHreflang(filePath, lang) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const targetLang = lang === 'es' ? 'en' : 'es';
    const re = new RegExp(`hreflang="${targetLang}"[^>]+href="([^"]+)"`, 'i');
    const m = html.match(re);
    return m ? m[1] : null;
  } catch { return null; }
}

function writeSitemap(name, content) {
  const file = path.join(BASE, name);
  fs.writeFileSync(file, content, 'utf8');
  const urls = (content.match(/<url>/g) || []).length;
  console.log(`  ${name}: ${urls} URLs`);
  return urls;
}

// ── 1. Blog ES ──────────────────────────────────────────

function generateBlogES() {
  let xml = xmlHead(XHTML_NS);
  let count = 0;

  // Blog index
  const indexFile = path.join(BASE, 'blog', 'index.html');
  const indexMod = getLastmod(indexFile);
  xml += urlEntryHreflang(`${DOMAIN}/blog/`, indexMod, [
    { lang: 'es', href: `${DOMAIN}/blog/` },
    { lang: 'en', href: `${DOMAIN}/blog/en/` },
    { lang: 'x-default', href: `${DOMAIN}/blog/` },
  ]);
  count++;

  // Main blog articles
  const slugs = listHtmlFiles(path.join(BASE, 'blog'));
  for (const slug of slugs.sort()) {
    const file = path.join(BASE, 'blog', `${slug}.html`);
    const mod = getLastmod(file);
    const enUrl = extractHreflang(file, 'es');
    const loc = `${DOMAIN}/blog/${slug}`;
    const alternates = [
      { lang: 'es', href: loc },
      { lang: 'x-default', href: loc },
    ];
    if (enUrl) alternates.splice(1, 0, { lang: 'en', href: enUrl });
    xml += urlEntryHreflang(loc, mod, alternates);
    count++;
  }

  // Subdirectory articles (entrenamiento, equipamiento, running, zapatillas, atletas-hibridos)
  const subdirs = ['entrenamiento', 'equipamiento', 'running', 'zapatillas', 'atletas-hibridos'];
  for (const sub of subdirs) {
    const dir = path.join(BASE, 'blog', sub);
    if (!fs.existsSync(dir)) continue;

    // Index page of subdir
    const subIndex = path.join(dir, 'index.html');
    if (fs.existsSync(subIndex)) {
      xml += urlEntry(`${DOMAIN}/blog/${sub}/`, getLastmod(subIndex));
      count++;
    }

    // Articles in subdir (as html files)
    for (const slug of listHtmlFiles(dir).sort()) {
      const file = path.join(dir, `${slug}.html`);
      if (isRedirectPage(file)) continue;
      const loc = `${DOMAIN}/blog/${sub}/${slug}`;
      const mod = getLastmod(file);
      const enUrl = extractHreflang(file, 'es');
      const alternates = [
        { lang: 'es', href: loc },
        { lang: 'x-default', href: loc },
      ];
      if (enUrl) alternates.splice(1, 0, { lang: 'en', href: enUrl });
      xml += urlEntryHreflang(loc, mod, alternates);
      count++;
    }

    // Articles in subdir (as directories with index.html)
    // No trailing slash — matches canonical + vercel.json trailingSlash:false
    for (const slug of listHtmlDirs(dir).sort()) {
      const file = path.join(dir, slug, 'index.html');
      if (isRedirectPage(file)) continue;
      const loc = `${DOMAIN}/blog/${sub}/${slug}`;
      const mod = getLastmod(file);
      const enUrl = extractHreflang(file, 'es');
      const alternates = [
        { lang: 'es', href: loc },
        { lang: 'x-default', href: loc },
      ];
      if (enUrl) alternates.splice(1, 0, { lang: 'en', href: enUrl });
      xml += urlEntryHreflang(loc, mod, alternates);
      count++;
    }
  }

  // Author pages
  const autorDir = path.join(BASE, 'blog', 'autor');
  if (fs.existsSync(autorDir)) {
    for (const slug of listHtmlFiles(autorDir).sort()) {
      const file = path.join(autorDir, `${slug}.html`);
      xml += urlEntry(`${DOMAIN}/blog/autor/${slug}`, getLastmod(file));
      count++;
    }
  }

  // Category pages
  const catDir = path.join(BASE, 'blog', 'categoria');
  if (fs.existsSync(catDir)) {
    const catIndex = path.join(catDir, 'index.html');
    if (fs.existsSync(catIndex)) {
      xml += urlEntry(`${DOMAIN}/blog/categoria/`, getLastmod(catIndex));
      count++;
    }
    for (const slug of listHtmlFiles(catDir).sort()) {
      const file = path.join(catDir, `${slug}.html`);
      xml += urlEntry(`${DOMAIN}/blog/categoria/${slug}`, getLastmod(file));
      count++;
    }
    for (const slug of listHtmlDirs(catDir).sort()) {
      const file = path.join(catDir, slug, 'index.html');
      xml += urlEntry(`${DOMAIN}/blog/categoria/${slug}`, getLastmod(file));
      count++;
    }
  }

  xml += xmlTail;
  return writeSitemap('sitemap-blog-es.xml', xml);
}

// ── 2. Blog EN ──────────────────────────────────────────

function generateBlogEN() {
  let xml = xmlHead(XHTML_NS);
  let count = 0;

  // Blog EN index
  const indexFile = path.join(BASE, 'blog', 'en', 'index.html');
  const indexMod = getLastmod(indexFile);
  xml += urlEntryHreflang(`${DOMAIN}/blog/en/`, indexMod, [
    { lang: 'en', href: `${DOMAIN}/blog/en/` },
    { lang: 'es', href: `${DOMAIN}/blog/` },
    { lang: 'x-default', href: `${DOMAIN}/blog/` },
  ]);
  count++;

  // Main EN articles
  const slugs = listHtmlFiles(path.join(BASE, 'blog', 'en'));
  for (const slug of slugs.sort()) {
    const file = path.join(BASE, 'blog', 'en', `${slug}.html`);
    const mod = getLastmod(file);
    const esUrl = extractHreflang(file, 'en');
    const loc = `${DOMAIN}/blog/en/${slug}`;
    const alternates = [
      { lang: 'en', href: loc },
    ];
    if (esUrl) {
      alternates.push({ lang: 'es', href: esUrl });
      alternates.push({ lang: 'x-default', href: esUrl });
    }
    xml += urlEntryHreflang(loc, mod, alternates);
    count++;
  }

  // EN subdirectory articles
  const enSubdirs = ['categoria', 'category', 'equipment', 'hybrid-athletes', 'running-shoes', 'running', 'training'];
  for (const sub of enSubdirs) {
    const dir = path.join(BASE, 'blog', 'en', sub);
    if (!fs.existsSync(dir)) continue;

    const subIndex = path.join(dir, 'index.html');
    if (fs.existsSync(subIndex)) {
      xml += urlEntry(`${DOMAIN}/blog/en/${sub}/`, getLastmod(subIndex));
      count++;
    }
    for (const slug of listHtmlFiles(dir).sort()) {
      const file = path.join(dir, `${slug}.html`);
      if (isRedirectPage(file)) continue;
      const loc = `${DOMAIN}/blog/en/${sub}/${slug}`;
      const mod = getLastmod(file);
      const esUrl = extractHreflang(file, 'en');
      const alternates = [{ lang: 'en', href: loc }];
      if (esUrl) {
        alternates.push({ lang: 'es', href: esUrl });
        alternates.push({ lang: 'x-default', href: esUrl });
      }
      xml += urlEntryHreflang(loc, mod, alternates);
      count++;
    }
    // No trailing slash — matches canonical + vercel.json trailingSlash:false
    for (const slug of listHtmlDirs(dir).sort()) {
      const file = path.join(dir, slug, 'index.html');
      if (isRedirectPage(file)) continue;
      const loc = `${DOMAIN}/blog/en/${sub}/${slug}`;
      const mod = getLastmod(file);
      const esUrl = extractHreflang(file, 'en');
      const alternates = [{ lang: 'en', href: loc }];
      if (esUrl) {
        alternates.push({ lang: 'es', href: esUrl });
        alternates.push({ lang: 'x-default', href: esUrl });
      }
      xml += urlEntryHreflang(loc, mod, alternates);
      count++;
    }
  }

  // EN author pages
  const authorDir = path.join(BASE, 'blog', 'en', 'author');
  if (fs.existsSync(authorDir)) {
    for (const slug of listHtmlFiles(authorDir).sort()) {
      const file = path.join(authorDir, `${slug}.html`);
      xml += urlEntry(`${DOMAIN}/blog/en/author/${slug}`, getLastmod(file));
      count++;
    }
  }

  xml += xmlTail;
  return writeSitemap('sitemap-blog-en.xml', xml);
}

// ── 3. Cities ───────────────────────────────────────────

function generateCities() {
  let xml = xmlHead();
  const dir = path.join(BASE, 'cities');
  if (!fs.existsSync(dir)) { writeSitemap('sitemap-cities.xml', xml + xmlTail); return 0; }

  // Index pages
  for (const idx of ['index.html']) {
    const f = path.join(dir, idx);
    if (fs.existsSync(f)) {
      xml += urlEntry(`${DOMAIN}/cities/`, getLastmod(f));
    }
  }
  const enIdx = path.join(dir, 'en', 'index.html');
  if (fs.existsSync(enIdx)) {
    xml += urlEntry(`${DOMAIN}/cities/en/`, getLastmod(enIdx));
  }

  // City pages (flat .html files or directories with index.html)
  for (const slug of listHtmlFiles(dir).sort()) {
    const file = path.join(dir, `${slug}.html`);
    xml += urlEntry(`${DOMAIN}/cities/${slug}`, getLastmod(file));
  }
  for (const slug of listHtmlDirs(dir).sort()) {
    if (slug === 'en') continue;
    const file = path.join(dir, slug, 'index.html');
    xml += urlEntry(`${DOMAIN}/cities/${slug}/`, getLastmod(file));
  }

  // EN city pages
  const enDir = path.join(dir, 'en');
  if (fs.existsSync(enDir)) {
    for (const slug of listHtmlFiles(enDir).sort()) {
      const file = path.join(enDir, `${slug}.html`);
      xml += urlEntry(`${DOMAIN}/cities/en/${slug}`, getLastmod(file));
    }
    for (const slug of listHtmlDirs(enDir).sort()) {
      const file = path.join(enDir, slug, 'index.html');
      xml += urlEntry(`${DOMAIN}/cities/en/${slug}/`, getLastmod(file));
    }
  }

  xml += xmlTail;
  return writeSitemap('sitemap-cities.xml', xml);
}

// ── 4. Places ───────────────────────────────────────────

function generatePlaces() {
  let xml = xmlHead();
  const dir = path.join(BASE, 'places');
  if (!fs.existsSync(dir)) { writeSitemap('sitemap-places.xml', xml + xmlTail); return 0; }

  // Index
  const idx = path.join(dir, 'index.html');
  if (fs.existsSync(idx)) xml += urlEntry(`${DOMAIN}/places/`, getLastmod(idx));

  // Place pages (flat .html or directories)
  for (const slug of listHtmlFiles(dir).sort()) {
    const file = path.join(dir, `${slug}.html`);
    xml += urlEntry(`${DOMAIN}/places/${slug}`, getLastmod(file));
  }
  for (const slug of listHtmlDirs(dir).sort()) {
    const file = path.join(dir, slug, 'index.html');
    xml += urlEntry(`${DOMAIN}/places/${slug}/`, getLastmod(file));
  }

  xml += xmlTail;
  return writeSitemap('sitemap-places.xml', xml);
}

// ── 5. Events ───────────────────────────────────────────

function generateEvents() {
  let xml = xmlHead();
  const dir = path.join(BASE, 'events');
  if (!fs.existsSync(dir)) { writeSitemap('sitemap-events.xml', xml + xmlTail); return 0; }

  // Index
  const idx = path.join(dir, 'index.html');
  if (fs.existsSync(idx)) xml += urlEntry(`${DOMAIN}/events/`, getLastmod(idx));

  // Event pages (flat .html or directories)
  for (const slug of listHtmlFiles(dir).sort()) {
    const file = path.join(dir, `${slug}.html`);
    xml += urlEntry(`${DOMAIN}/events/${slug}`, getLastmod(file));
  }
  for (const slug of listHtmlDirs(dir).sort()) {
    const file = path.join(dir, slug, 'index.html');
    xml += urlEntry(`${DOMAIN}/events/${slug}/`, getLastmod(file));
  }

  xml += xmlTail;
  return writeSitemap('sitemap-events.xml', xml);
}

// ── 6. Equipamiento ─────────────────────────────────────

function generateEquipamiento() {
  let xml = xmlHead();
  const dir = path.join(BASE, 'equipamiento');
  if (!fs.existsSync(dir)) { writeSitemap('sitemap-equipamiento.xml', xml + xmlTail); return 0; }

  // Index
  const idx = path.join(dir, 'index.html');
  if (fs.existsSync(idx)) xml += urlEntry(`${DOMAIN}/equipamiento/`, getLastmod(idx));

  // Equipment pages (canonical uses .html extension)
  for (const slug of listHtmlFiles(dir).sort()) {
    const file = path.join(dir, `${slug}.html`);
    xml += urlEntry(`${DOMAIN}/equipamiento/${slug}.html`, getLastmod(file));
  }

  xml += xmlTail;
  return writeSitemap('sitemap-equipamiento.xml', xml);
}

// ── 7. Pages (institucional, legal, recursos, matching, app) ──

function generatePages() {
  let xml = xmlHead(XHTML_NS);

  // Homepage with hreflang
  xml += urlEntryHreflang(`${DOMAIN}/`, TODAY, [
    { lang: 'es', href: `${DOMAIN}/` },
    { lang: 'en', href: `${DOMAIN}/` },
    { lang: 'x-default', href: `${DOMAIN}/` },
  ]);

  // App pages
  if (fs.existsSync(path.join(BASE, 'app', 'index.html')))
    xml += urlEntry(`${DOMAIN}/app/`, getLastmod(path.join(BASE, 'app', 'index.html')));
  if (fs.existsSync(path.join(BASE, 'app', 'en', 'index.html')))
    xml += urlEntry(`${DOMAIN}/app/en/`, getLastmod(path.join(BASE, 'app', 'en', 'index.html')));

  // Matching pages
  if (fs.existsSync(path.join(BASE, 'matching', 'index.html')))
    xml += urlEntryHreflang(`${DOMAIN}/matching/`, getLastmod(path.join(BASE, 'matching', 'index.html')), [
      { lang: 'es', href: `${DOMAIN}/matching/` },
      { lang: 'en', href: `${DOMAIN}/matching/en/` },
      { lang: 'x-default', href: `${DOMAIN}/matching/` },
    ]);
  if (fs.existsSync(path.join(BASE, 'matching', 'en', 'index.html')))
    xml += urlEntryHreflang(`${DOMAIN}/matching/en/`, getLastmod(path.join(BASE, 'matching', 'en', 'index.html')), [
      { lang: 'en', href: `${DOMAIN}/matching/en/` },
      { lang: 'es', href: `${DOMAIN}/matching/` },
      { lang: 'x-default', href: `${DOMAIN}/matching/` },
    ]);

  // Recursos (lead magnets)
  if (fs.existsSync(path.join(BASE, 'recursos', 'plan-0-5k', 'index.html')))
    xml += urlEntryHreflang(`${DOMAIN}/recursos/plan-0-5k/`, getLastmod(path.join(BASE, 'recursos', 'plan-0-5k', 'index.html')), [
      { lang: 'es', href: `${DOMAIN}/recursos/plan-0-5k/` },
      { lang: 'en', href: `${DOMAIN}/recursos/en/couch-to-5k-plan/` },
      { lang: 'x-default', href: `${DOMAIN}/recursos/plan-0-5k/` },
    ]);
  if (fs.existsSync(path.join(BASE, 'recursos', 'en', 'couch-to-5k-plan', 'index.html')))
    xml += urlEntryHreflang(`${DOMAIN}/recursos/en/couch-to-5k-plan/`, getLastmod(path.join(BASE, 'recursos', 'en', 'couch-to-5k-plan', 'index.html')), [
      { lang: 'en', href: `${DOMAIN}/recursos/en/couch-to-5k-plan/` },
      { lang: 'es', href: `${DOMAIN}/recursos/plan-0-5k/` },
      { lang: 'x-default', href: `${DOMAIN}/recursos/plan-0-5k/` },
    ]);

  // Calculadora
  if (fs.existsSync(path.join(BASE, 'calculadora', 'index.html')))
    xml += urlEntry(`${DOMAIN}/calculadora/`, getLastmod(path.join(BASE, 'calculadora', 'index.html')));

  // Institucional
  const pages = [
    { file: 'sobre-nosotros.html', url: '/sobre-nosotros' },
    { file: 'inversores.html', url: '/inversores' },
    { file: 'patrocinadores.html', url: '/patrocinadores' },
    { file: 'media-kit.html', url: '/media-kit' },
  ];
  for (const { file, url } of pages) {
    const p = path.join(BASE, file);
    if (fs.existsSync(p)) xml += urlEntry(`${DOMAIN}${url}`, getLastmod(p));
  }

  // Legal
  const legal = [
    { file: 'legal/privacidad.html', url: '/legal/privacidad' },
    { file: 'legal/terminos.html', url: '/legal/terminos' },
    { file: 'legal/cookies.html', url: '/legal/cookies' },
  ];
  for (const { file, url } of legal) {
    const p = path.join(BASE, file);
    if (fs.existsSync(p)) xml += urlEntry(`${DOMAIN}${url}`, getLastmod(p));
  }

  // English legal (if exist as separate pages)
  const enLegal = [
    { file: 'privacy.html', url: '/privacy' },
    { file: 'terms.html', url: '/terms' },
  ];
  for (const { file, url } of enLegal) {
    const p = path.join(BASE, file);
    if (fs.existsSync(p)) xml += urlEntry(`${DOMAIN}${url}`, getLastmod(p));
  }

  xml += xmlTail;
  return writeSitemap('sitemap-pages.xml', xml);
}

// ── 8. Sitemap Index ────────────────────────────────────

function getMaxLastmod(sitemapFile) {
  try {
    const content = fs.readFileSync(path.join(BASE, sitemapFile), 'utf8');
    const dates = [...content.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map(m => m[1]);
    return dates.sort().pop() || TODAY;
  } catch { return TODAY; }
}

function generateIndex(counts) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const sitemaps = [
    'sitemap-blog-es.xml',
    'sitemap-blog-en.xml',
    'sitemap-cities.xml',
    'sitemap-places.xml',
    'sitemap-events.xml',
    'sitemap-equipamiento.xml',
    'sitemap-pages.xml',
  ];

  for (const name of sitemaps) {
    const lastmod = getMaxLastmod(name);
    xml += `  <sitemap>\n`;
    xml += `    <loc>${DOMAIN}/${name}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>\n`;
  fs.writeFileSync(path.join(BASE, 'sitemap-index.xml'), xml, 'utf8');
  console.log(`  sitemap-index.xml: ${sitemaps.length} sitemaps`);
}

// ── Main ────────────────────────────────────────────────

console.log('\nGenerating sitemaps...\n');

const counts = {};
counts.blogES = generateBlogES();
counts.blogEN = generateBlogEN();
counts.cities = generateCities();
counts.places = generatePlaces();
counts.events = generateEvents();
counts.equip = generateEquipamiento();
counts.pages = generatePages();
generateIndex(counts);

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`\n── Summary ──`);
console.log(`Total unique URLs: ${total}`);
console.log(`Sitemaps generated: 8 (7 content + 1 index)`);

// Remove old monolithic sitemap
const oldSitemap = path.join(BASE, 'sitemap.xml');
if (fs.existsSync(oldSitemap)) {
  fs.renameSync(oldSitemap, path.join(BASE, 'sitemap.xml.bak'));
  console.log(`\nOld sitemap.xml renamed to sitemap.xml.bak`);
}

// Also keep sitemap.xml as alias pointing to index (for backwards compat)
fs.copyFileSync(path.join(BASE, 'sitemap-index.xml'), path.join(BASE, 'sitemap.xml'));
console.log(`sitemap.xml now points to sitemap-index.xml content`);
console.log('\nDone! Update robots.txt to reference sitemap-index.xml only.');
