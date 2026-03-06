/**
 * add-global-schema-batch.cjs
 * Adds Organization and WebSite entities to the @graph of all blog articles
 * so that @id references resolve within each document (not cross-document).
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

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

const ORG_NODE = {
  '@type': 'Organization',
  '@id': 'https://www.correrjuntos.com/#organization',
  name: 'CorrerJuntos',
  url: 'https://www.correrjuntos.com/',
  logo: { '@type': 'ImageObject', url: 'https://www.correrjuntos.com/icons/icon-512.png' },
  sameAs: [
    'https://www.instagram.com/correrjuntosapp/',
    'https://x.com/CorrerJuntos',
    'https://www.tiktok.com/@correrjuntosapp'
  ]
};

const WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': 'https://www.correrjuntos.com/#website',
  url: 'https://www.correrjuntos.com/',
  name: 'CorrerJuntos',
  publisher: { '@id': 'https://www.correrjuntos.com/#organization' },
  inLanguage: 'es'
};

let upgraded = 0;
let skipped = 0;
let errors = 0;

const blogDir = path.join(BASE_DIR, 'blog');
const allFiles = getAllHtmlFiles(blogDir);

allFiles.forEach(filePath => {
  const rel = path.relative(BASE_DIR, filePath).replace(/\\/g, '/');
  if (rel.includes('index.html') || rel.includes('categoria/') || rel.includes('autor/')) return;

  let html = fs.readFileSync(filePath, 'utf-8');

  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!jsonLdMatch) { skipped++; return; }

  let schema;
  try { schema = JSON.parse(jsonLdMatch[1]); } catch (e) { errors++; return; }

  const graph = schema['@graph'];
  if (!graph || !Array.isArray(graph)) { skipped++; return; }

  // Already has Organization?
  if (graph.some(n => n['@type'] === 'Organization')) {
    skipped++;
    return;
  }

  // Add Organization and WebSite at the beginning of @graph
  graph.unshift(WEBSITE_NODE);
  graph.unshift(ORG_NODE);

  const newJsonLd = JSON.stringify(schema, null, 2);
  const newBlock = `<script type="application/ld+json">\n${newJsonLd}\n</script>`;
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, newBlock);

  fs.writeFileSync(filePath, html, 'utf-8');
  upgraded++;
});

console.log('\n=== Add Global Schema Results ===');
console.log(`Upgraded: ${upgraded}`);
console.log(`Skipped:  ${skipped}`);
console.log(`Errors:   ${errors}`);
