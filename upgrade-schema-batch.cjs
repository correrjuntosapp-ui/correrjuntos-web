/**
 * upgrade-schema-batch.cjs
 * Upgrades JSON-LD schema across all blog articles per SEO audit:
 *   1. Adds WebPage node with @id, isPartOf → #website
 *   2. Adds @id to BlogPosting, BreadcrumbList, FAQPage
 *   3. Extracts Person as independent node with @id
 *   4. Adds mainEntityOfPage to BlogPosting linking to WebPage
 *   5. References Person by @id from author field
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// HTML entity decoder for common Spanish entities
function decodeEntities(str) {
  if (!str) return '';
  return str.replace(/&[a-z]+;/gi, m => {
    const map = {
      '&oacute;':'ó','&aacute;':'á','&eacute;':'é','&iacute;':'í','&uacute;':'ú','&ntilde;':'ñ',
      '&Oacute;':'Ó','&Aacute;':'Á','&Eacute;':'É','&Iacute;':'Í','&Uacute;':'Ú','&Ntilde;':'Ñ',
      '&amp;':'&','&quot;':'"','&lt;':'<','&gt;':'>','&middot;':'·'
    };
    return map[m.toLowerCase()] || m;
  });
}

// Traverse blog directory
function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together', 'tools'].includes(entry.name)) continue;
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

let upgraded = 0;
let skipped = 0;
let errors = 0;

const blogDir = path.join(BASE_DIR, 'blog');
const allFiles = getAllHtmlFiles(blogDir);

allFiles.forEach(filePath => {
  const rel = path.relative(BASE_DIR, filePath).replace(/\\/g, '/');

  // Skip non-article pages
  if (rel.includes('index.html') || rel.includes('categoria/') || rel.includes('autor/')) return;

  let html = fs.readFileSync(filePath, 'utf-8');

  // Extract the JSON-LD block
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!jsonLdMatch) {
    console.log(`SKIP (no JSON-LD): ${rel}`);
    skipped++;
    return;
  }

  let schema;
  try {
    schema = JSON.parse(jsonLdMatch[1]);
  } catch (e) {
    console.log(`ERROR (invalid JSON): ${rel} — ${e.message}`);
    errors++;
    return;
  }

  const graph = schema['@graph'];
  if (!graph || !Array.isArray(graph)) {
    console.log(`SKIP (no @graph): ${rel}`);
    skipped++;
    return;
  }

  // Already upgraded?
  if (graph.some(n => n['@type'] === 'WebPage')) {
    console.log(`SKIP (already upgraded): ${rel}`);
    skipped++;
    return;
  }

  // ── Extract metadata from HTML ──
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonicalMatch) { console.log(`ERROR (no canonical): ${rel}`); errors++; return; }
  const canonicalUrl = canonicalMatch[1];

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const pageTitle = titleMatch ? decodeEntities(titleMatch[1]) : '';

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const metaDesc = descMatch ? decodeEntities(descMatch[1]) : '';

  const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const ogImage = ogImgMatch ? ogImgMatch[1] : '';

  const langMatch = html.match(/<html\s+lang="([^"]+)"/i);
  const lang = langMatch ? langMatch[1] : 'es-ES';

  // ── Find the article node ──
  const articleIdx = graph.findIndex(n => n['@type'] === 'BlogPosting' || n['@type'] === 'Article');
  if (articleIdx === -1) {
    console.log(`SKIP (no article node): ${rel}`);
    skipped++;
    return;
  }
  const article = graph[articleIdx];

  // ── Extract Person ──
  let personNode = null;
  if (article.author && article.author['@type'] === 'Person') {
    const a = article.author;
    const authorUrl = a.url || 'https://www.correrjuntos.com/blog/autor/jose-marquez';
    personNode = {
      '@type': 'Person',
      '@id': authorUrl + '#author',
      name: a.name,
      url: authorUrl,
      jobTitle: a.jobTitle,
      sameAs: a.sameAs || []
    };
  }

  // ── Build new @graph ──
  const newGraph = [];

  // 1. WebPage
  const webPage = {
    '@type': 'WebPage',
    '@id': canonicalUrl + '#webpage',
    url: canonicalUrl,
    name: pageTitle,
    description: metaDesc,
    isPartOf: { '@id': 'https://www.correrjuntos.com/#website' },
    about: { '@id': 'https://www.correrjuntos.com/#organization' },
    inLanguage: lang
  };
  if (ogImage) {
    webPage.primaryImageOfPage = { '@type': 'ImageObject', url: ogImage };
  }
  newGraph.push(webPage);

  // 2. Person (standalone)
  if (personNode) newGraph.push(personNode);

  // 3. BlogPosting / Article (clean property order)
  const updatedArticle = {};
  updatedArticle['@type'] = article['@type'];
  updatedArticle['@id'] = canonicalUrl + '#article';
  updatedArticle.mainEntityOfPage = { '@id': canonicalUrl + '#webpage' };
  updatedArticle.headline = article.headline;
  updatedArticle.description = article.description;
  updatedArticle.url = article.url;
  updatedArticle.datePublished = article.datePublished;
  updatedArticle.dateModified = article.dateModified;
  updatedArticle.author = personNode ? { '@id': personNode['@id'] } : article.author;
  updatedArticle.publisher = { '@id': 'https://www.correrjuntos.com/#organization' };
  if (article.image) updatedArticle.image = article.image;
  if (article.articleSection) updatedArticle.articleSection = article.articleSection;
  updatedArticle.inLanguage = article.inLanguage;
  newGraph.push(updatedArticle);

  // 4. BreadcrumbList (with @id)
  const breadcrumbIdx = graph.findIndex(n => n['@type'] === 'BreadcrumbList');
  if (breadcrumbIdx !== -1) {
    const bc = { ...graph[breadcrumbIdx] };
    bc['@id'] = canonicalUrl + '#breadcrumbs';
    newGraph.push(bc);
  }

  // 5. FAQPage (with @id, only if it has questions)
  const faqIdx = graph.findIndex(n => n['@type'] === 'FAQPage');
  if (faqIdx !== -1) {
    const faq = graph[faqIdx];
    if (faq.mainEntity && Array.isArray(faq.mainEntity) && faq.mainEntity.length > 0) {
      const updatedFaq = { ...faq };
      updatedFaq['@id'] = canonicalUrl + '#faq';
      newGraph.push(updatedFaq);
    }
  }

  // 6. Any other nodes (e.g. ItemList for product articles)
  for (let i = 0; i < graph.length; i++) {
    if (i === articleIdx || i === breadcrumbIdx || i === faqIdx) continue;
    newGraph.push(graph[i]);
  }

  // ── Write back ──
  const newSchema = { '@context': 'https://schema.org', '@graph': newGraph };
  const newJsonLd = JSON.stringify(newSchema, null, 2);
  const newBlock = `<script type="application/ld+json">\n${newJsonLd}\n</script>`;

  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, newBlock);
  fs.writeFileSync(filePath, html, 'utf-8');
  upgraded++;
});

console.log('\n=== Schema Upgrade Results ===');
console.log(`Upgraded: ${upgraded}`);
console.log(`Skipped:  ${skipped}`);
console.log(`Errors:   ${errors}`);
console.log(`Total:    ${upgraded + skipped + errors}`);
