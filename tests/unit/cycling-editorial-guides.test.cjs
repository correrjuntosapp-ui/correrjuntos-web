const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const origin = 'https://www.correrjuntos.com';
const slugs = ['mejores-marchas-cicloturistas-espana', 'como-limpiar-lubricar-cadena-bicicleta'];
const articles = slugs.map(slug => ({ slug, html: read(`blog/ciclismo/${slug}.html`) }));
const graph = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => {
  const schema = JSON.parse(match[1]);
  return schema['@graph'] || [schema];
});
const normalize = text => text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

for (const { slug, html } of articles) {
  test(`${slug}: publication metadata and authorship`, () => {
    assert.match(html, /name="robots" content="index,follow,max-image-preview:large"/);
    assert.doesNotMatch(html, /noindex|nofollow|creativeWorkStatus|Vista local|Nuevo borrador|firma final pendientes/);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(html.includes(`rel="canonical" href="${origin}/blog/ciclismo/${slug}"`));
    assert.doesNotMatch(html, /hreflang="en"/);
    const article = graph(html).find(node => node['@type'] === 'BlogPosting');
    assert.equal(article.datePublished, '2026-09-20');
    assert.equal(article.dateModified, '2026-09-20');
    assert.equal(article.author['@id'], `${origin}/#organization`);
    assert.ok(graph(html).every(node => node['@type'] !== 'Event' && node['@type'] !== 'Person'));
    assert.match(html, /Imagen editorial generada con IA/);
  });

  test(`${slug}: FAQ matches the visible answers`, () => {
    const faq = graph(html).find(node => node['@type'] === 'FAQPage');
    const visible = [...html.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/gs)]
      .map(match => ({ question: normalize(match[1]), answer: normalize(match[2]) }));
    assert.equal(visible.length, 4);
    assert.deepEqual(visible, faq.mainEntity.map(question => ({ question: question.name, answer: question.acceptedAnswer.text })));
  });
}

test('ten marches retain route, registration and regional navigation contracts', () => {
  const html = articles[0].html;
  const list = graph(html).find(node => node['@type'] === 'ItemList');
  assert.equal(list.numberOfItems, 10);
  assert.equal(list.itemListElement.length, 10);
  for (const table of ['routes', 'registration']) {
    const body = html.match(new RegExp(`data-table="${table}"[\\s\\S]*?<tbody>([\\s\\S]*?)</tbody>`))[1];
    assert.equal([...body.matchAll(/<tr>/g)].length, 10);
  }
  const navigation = html.match(/<nav class="marchas-region-nav"[\s\S]*?<\/nav>/)[0];
  const anchors = [...navigation.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.equal(anchors.length, 10);
  for (const anchor of anchors) assert.ok(html.includes(`id="${anchor}"`));
  assert.match(html, /Pendiente de confirmar/i);
  assert.match(html, /referencia 2026; 2027 pendiente/);
  assert.match(html, /https:\/\/www\.desafiolagosdecovadonga\.com\/es/);
});

test('hub contains both guides in their cycling sections', () => {
  const html = read('blog/ciclismo/index.html');
  assert.doesNotMatch(html, /noindex|Borrador|draft-review-note/);
  const list = graph(html).find(node => node['@type'] === 'ItemList');
  assert.equal(list.itemListElement.length, 26);
  for (const slug of slugs) {
    assert.equal(list.itemListElement.filter(item => item.url === `${origin}/blog/ciclismo/${slug}`).length, 1);
    assert.ok(html.includes(`class="pillar" href="/blog/ciclismo/${slug}"`));
  }
  assert.doesNotMatch(articles[1].html, /siete formas/);
});

test('six editorial image variants match their provenance hashes', () => {
  const manifest = JSON.parse(read('public/blog-images/ciclismo/borradores-sep2026/manifest.json'));
  const variants = manifest.variants.flatMap(article => article.variants);
  assert.equal(variants.length, 6);
  for (const variant of variants) {
    const bytes = fs.readFileSync(path.join(root, variant.path.slice(1)));
    assert.equal(bytes.length, variant.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), variant.sha256);
  }
});

test('both canonical URLs occur once in the Spanish sitemap', () => {
  const sitemap = read('sitemap-blog-es.xml');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(locations).size, locations.length);
  for (const slug of slugs) {
    const url = `${origin}/blog/ciclismo/${slug}`;
    assert.equal(locations.filter(location => location === url).length, 1);
    const entry = [...sitemap.matchAll(/<url>[\s\S]*?<\/url>/g)].find(match => match[0].includes(`<loc>${url}</loc>`))[0];
    assert.match(entry, /<lastmod>2026-09-20<\/lastmod>/);
    assert.doesNotMatch(entry, /hreflang="en"/);
  }
});
