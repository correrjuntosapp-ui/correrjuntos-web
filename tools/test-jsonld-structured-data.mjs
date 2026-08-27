#!/usr/bin/env node
/**
 * Verificador determinista de datos estructurados JSON-LD.
 *
 * Comprueba, sobre el HTML del repositorio, las clases de defecto que Google
 * Search Console reporta como criticas y que ya nos han costado un aviso:
 * JSON invalido, comas colgantes, scripts descuadrados, referencias @id que no
 * resuelven, Article incompleto, mainEntityOfPage cruzado a otra URL, Offer sin
 * precio, AggregateOffer tratado como Offer y Review incompleto.
 *
 * Uso:
 *   node tools/test-jsonld-structured-data.mjs           audita el repositorio
 *   node tools/test-jsonld-structured-data.mjs --selftest   controles pos/neg
 *   node tools/test-jsonld-structured-data.mjs --json     salida legible por maquina
 *
 * Sin dependencias externas. Codigo de salida 1 si hay algun fallo.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', 'tmp', 'correr-juntos-app', 'tools', 'coverage', 'dist', 'playwright-report', 'test-results']);

/* ------------------------------------------------------------------ */
/* Reglas de Google que aplicamos                                      */
/* ------------------------------------------------------------------ */

// Tipos que Google acepta en itemReviewed de un fragmento de resena.
const VALID_ITEM_REVIEWED = new Set([
  'Book', 'Course', 'CreativeWorkSeason', 'CreativeWorkSeries', 'Episode', 'Event',
  'Game', 'HowTo', 'LocalBusiness', 'MediaObject', 'Movie', 'MusicPlaylist',
  'MusicRecording', 'Organization', 'Product', 'Recipe', 'SoftwareApplication',
  'MobileApplication', 'WebApplication', 'VideoGame', 'TVSeries', 'Restaurant',
  'Store', 'Service', 'SportsEvent',
]);

const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle']);
const ORG_TYPES = new Set(['Organization', 'SportsOrganization', 'NGO', 'Corporation', 'LocalBusiness']);

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const typesOf = (n) => {
  const t = n && n['@type'];
  return new Set(Array.isArray(t) ? t : t ? [t] : []);
};
const present = (n, k) => {
  const v = n[k];
  return v !== undefined && v !== null && v !== '' &&
    !(Array.isArray(v) && v.length === 0) &&
    !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
};
const isRef = (n) => n && typeof n === 'object' && !Array.isArray(n) &&
  Object.keys(n).length === 1 && '@id' in n;

function normalizeUrl(u) {
  if (typeof u !== 'string') return null;
  try {
    const p = new URL(u, 'https://www.correrjuntos.com');
    return (p.host + p.pathname).replace(/\/$/, '').replace(/\.html$/, '');
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* Analisis de una pagina                                              */
/* ------------------------------------------------------------------ */

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

export function analyzeHtml(html, label = '(memoria)', ownKey = null) {
  const findings = [];
  const push = (code, detail) => findings.push({ file: label, code, detail });

  // Scripts descuadrados: contamos aperturas y cierres en bruto.
  const opens = (html.match(/<script\b/gi) || []).length;
  const closes = (html.match(/<\/script\s*>/gi) || []).length;
  if (opens !== closes) push('script_unbalanced', `<script>=${opens} </script>=${closes}`);

  const blocks = [];
  SCRIPT_RE.lastIndex = 0;
  let m;
  while ((m = SCRIPT_RE.exec(html)) !== null) {
    if (!/type\s*=\s*["']application\/ld\+json["']/i.test(m[1])) continue;
    blocks.push(m[2]);
  }

  const nodes = [];          // todos los nodos con contenido
  const defined = new Map(); // @id -> nodo definido
  const refs = [];           // { id, key }

  for (const raw of blocks) {
    let doc;
    try {
      doc = JSON.parse(raw);
    } catch (err) {
      // Distinguimos la coma colgante porque es el fallo que mas veces
      // introducimos al borrar una propiedad a mano.
      const trailing = /,\s*[}\]]/.test(raw);
      push(trailing ? 'json_trailing_comma' : 'json_invalid', String(err.message).slice(0, 120));
      continue;
    }
    const visit = (n, key) => {
      if (Array.isArray(n)) { n.forEach((x) => visit(x, key)); return; }
      if (!n || typeof n !== 'object') return;
      if (isRef(n)) { refs.push({ id: n['@id'], key }); return; }
      if (typeof n['@id'] === 'string') defined.set(n['@id'], n);
      nodes.push({ node: n, key });
      for (const [k, v] of Object.entries(n)) visit(v, k);
    };
    visit(doc, null);
  }

  // Referencias @id locales (con fragmento) que no resuelven en la misma pagina.
  for (const { id, key } of refs) {
    if (typeof id !== 'string' || !id.includes('#')) continue;
    if (!defined.has(id)) push('dangling_id_ref', `${id} (como ${key})`);
  }

  // Identidad de la pagina. Se usa su propia URL (derivada de la ruta del fichero
  // cuando se conoce, o de la canonica en su defecto). Comparar contra la canonica
  // marcaria como defectuosas las paginas alias, que canonicalizan a un slug
  // preferido de forma deliberada y cuyo grafo si describe su propia URL.
  // Identidad valida de la pagina: su propia URL o su canonica. Ambas son
  // legitimas. Una pagina alias que canonicaliza a un slug preferido puede
  // describir la entidad canonica, y eso es correcto: Google consolida en la
  // canonica. Solo es defecto apuntar a una URL que no es ninguna de las dos,
  // que es como se cuela el grafo de OTRO articulo al copiar y pegar.
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const canonKey = canon ? normalizeUrl(canon[1]) : null;
  const identities = new Set([ownKey, canonKey].filter(Boolean));
  const foreign = (k) => k && identities.size > 0 && !identities.has(k);
  const idList = () => [...identities].join(' | ');

  const resolve = (v) => (isRef(v) ? defined.get(v['@id']) : v);

  for (const { node } of nodes) {
    const T = typesOf(node);

    /* --- Article / BlogPosting --- */
    if ([...T].some((t) => ARTICLE_TYPES.has(t))) {
      for (const k of ['image', 'author', 'publisher', 'headline', 'datePublished']) {
        if (!present(node, k)) push(`article_missing_${k}`, node.headline || node['@id'] || '');
      }
      const pub = resolve(node.publisher);
      if (node.publisher !== undefined && pub) {
        const pt = typesOf(pub);
        if (pt.size && ![...pt].some((t) => ORG_TYPES.has(t))) {
          push('publisher_not_organization', [...pt].join(','));
        }
      }
    }

    /* --- mainEntityOfPage no puede apuntar a otra URL --- */
    if (node.mainEntityOfPage !== undefined && identities.size) {
      const meop = node.mainEntityOfPage;
      const target = isRef(meop) ? meop['@id'] : (typeof meop === 'string' ? meop : meop && meop['@id']);
      const tKey = normalizeUrl(typeof target === 'string' ? target.split('#')[0] : null);
      if (foreign(tKey)) push('mainentityofpage_cross_url', `${tKey} no es ${idList()}`);
    }

    /* --- El WebPage no puede llevar la identidad de otro articulo --- */
    if (T.has('WebPage') && typeof node['@id'] === 'string') {
      const k = normalizeUrl(node['@id'].split('#')[0]);
      if (foreign(k)) push('webpage_id_cross_url', `${k} no es ${idList()}`);
    }

    /* --- Review --- */
    if (T.has('Review')) {
      if (!present(node, 'reviewRating')) push('review_missing_reviewRating', node['@id'] || '');
      if (!present(node, 'author')) push('review_missing_author', node['@id'] || '');
      const ir = resolve(node.itemReviewed);
      if (ir) {
        const it = typesOf(ir);
        if (it.size && ![...it].some((t) => VALID_ITEM_REVIEWED.has(t))) {
          push('itemreviewed_invalid_type', [...it].join(','));
        }
      }
    }
    if (T.has('Rating') && !present(node, 'ratingValue')) {
      push('rating_missing_ratingValue', node['@id'] || '');
    }

    /* --- Ofertas: AggregateOffer NUNCA se juzga como Offer --- */
    if (T.has('AggregateOffer')) {
      for (const k of ['lowPrice', 'priceCurrency']) {
        if (!present(node, k)) push(`aggregateoffer_missing_${k}`, node['@id'] || '');
      }
    } else if (T.has('Offer')) {
      if (!present(node, 'priceSpecification')) {
        for (const k of ['price', 'priceCurrency']) {
          if (!present(node, k)) push(`offer_missing_${k}`, node.url || node['@id'] || '');
        }
      }
    }
  }

  /* --- Un Review no puede quedar huerfano en el @graph --- */
  const referenced = new Set(refs.map((r) => r.id));
  for (const { node, key } of nodes) {
    if (!typesOf(node).has('Review')) continue;
    const nested = key === 'review' || key === 'reviews';
    const pointed = typeof node['@id'] === 'string' && referenced.has(node['@id']);
    if (!nested && !pointed) push('review_orphan', node['@id'] || '(sin @id)');
  }

  return { findings, blockCount: blocks.length };
}

/* ------------------------------------------------------------------ */
/* Autocomprobacion: controles positivos y negativos                   */
/* ------------------------------------------------------------------ */

const wrap = (json, extraHead = '') =>
  `<html><head><link rel="canonical" href="https://www.correrjuntos.com/p">${extraHead}` +
  `</head><body><script type="application/ld+json">${json}</script></body></html>`;

const ARTICLE_OK = {
  '@type': 'BlogPosting', '@id': 'https://www.correrjuntos.com/p#article',
  headline: 'T', image: 'https://www.correrjuntos.com/i.jpg', datePublished: '2026-01-01',
  author: { '@type': 'Person', name: 'A' },
  publisher: { '@type': 'Organization', '@id': 'https://www.correrjuntos.com/#organization', name: 'CorrerJuntos' },
  mainEntityOfPage: { '@id': 'https://www.correrjuntos.com/p#webpage' },
};
const WEBPAGE_OK = { '@type': 'WebPage', '@id': 'https://www.correrjuntos.com/p#webpage', url: 'https://www.correrjuntos.com/p' };

const POSITIVE = [
  ['JSON invalido', 'json_invalid',
    wrap('{"@type":"WebPage" "url":"x"}')],
  ['coma colgante', 'json_trailing_comma',
    wrap('{"@type":"WebPage","url":"x",}')],
  ['script descuadrado', 'script_unbalanced',
    '<html><head><link rel="canonical" href="https://www.correrjuntos.com/p"></head><body>' +
    '<script type="application/ld+json">{"@type":"WebPage"}</script><script>var a=1;</body></html>'],
  ['@id local sin definicion', 'dangling_id_ref',
    wrap(JSON.stringify({ '@graph': [{ '@type': 'WebPage', '@id': 'https://www.correrjuntos.com/p#webpage', isPartOf: { '@id': 'https://www.correrjuntos.com/#website' } }] }))],
  ['Article sin author', 'article_missing_author',
    wrap(JSON.stringify({ '@graph': [WEBPAGE_OK, { ...ARTICLE_OK, author: undefined }] }))],
  ['Article sin image', 'article_missing_image',
    wrap(JSON.stringify({ '@graph': [WEBPAGE_OK, { ...ARTICLE_OK, image: undefined }] }))],
  ['Article sin publisher', 'article_missing_publisher',
    wrap(JSON.stringify({ '@graph': [WEBPAGE_OK, { ...ARTICLE_OK, publisher: undefined }] }))],
  ['mainEntityOfPage cruzado', 'mainentityofpage_cross_url',
    wrap(JSON.stringify({ '@graph': [WEBPAGE_OK, { ...ARTICLE_OK, mainEntityOfPage: 'https://www.correrjuntos.com/otra-pagina' }] }))],
  ['Offer sin price', 'offer_missing_price',
    wrap(JSON.stringify({ '@type': 'SportsEvent', name: 'C', startDate: '2026-01-01', location: 'X', offers: { '@type': 'Offer', priceCurrency: 'EUR', url: 'https://x' } }))],
  ['Offer sin priceCurrency', 'offer_missing_priceCurrency',
    wrap(JSON.stringify({ '@type': 'SportsEvent', name: 'C', startDate: '2026-01-01', location: 'X', offers: { '@type': 'Offer', price: '30', url: 'https://x' } }))],
  ['AggregateOffer sin lowPrice', 'aggregateoffer_missing_lowPrice',
    wrap(JSON.stringify({ '@type': 'SportsEvent', name: 'C', offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR' } }))],
  ['Review sin reviewRating', 'review_missing_reviewRating',
    wrap(JSON.stringify({ '@type': 'Product', name: 'P', review: { '@type': 'Review', author: { '@type': 'Person', name: 'A' } } }))],
  ['Review huerfano', 'review_orphan',
    wrap(JSON.stringify({ '@graph': [WEBPAGE_OK, { '@type': 'Review', '@id': 'https://www.correrjuntos.com/p#review', author: { '@type': 'Person', name: 'A' }, reviewRating: { '@type': 'Rating', ratingValue: 9 } }] }))],
  ['itemReviewed con tipo invalido', 'itemreviewed_invalid_type',
    wrap(JSON.stringify({ '@type': 'Product', name: 'P', review: { '@type': 'Review', author: { '@type': 'Person', name: 'A' }, reviewRating: { '@type': 'Rating', ratingValue: 9 }, itemReviewed: { '@type': 'Thing', name: 'X' } } }))],
];

const ALIAS = '<html><head><link rel="canonical" href="https://www.correrjuntos.com/slug-preferido">' +
  '</head><body><script type="application/ld+json">' +
  JSON.stringify({ '@graph': [
    { '@type': 'WebPage', '@id': 'https://www.correrjuntos.com/p#webpage', url: 'https://www.correrjuntos.com/p' },
    { ...ARTICLE_OK, mainEntityOfPage: { '@id': 'https://www.correrjuntos.com/p#webpage' } },
  ] }) + '</script></body></html>';

const ALIAS_CANON = '<html><head><link rel="canonical" href="https://www.correrjuntos.com/slug-preferido">' +
  '</head><body><script type="application/ld+json">' +
  JSON.stringify({ '@graph': [
    { '@type': 'WebPage', '@id': 'https://www.correrjuntos.com/slug-preferido#webpage', url: 'https://www.correrjuntos.com/slug-preferido' },
    { ...ARTICLE_OK, '@id': 'https://www.correrjuntos.com/slug-preferido#article',
      mainEntityOfPage: { '@id': 'https://www.correrjuntos.com/slug-preferido#webpage' } },
  ] }) + '</script></body></html>';

const CROSS = wrap(JSON.stringify({ '@graph': [
  { '@type': 'WebPage', '@id': 'https://www.correrjuntos.com/otro-articulo#webpage', url: 'https://www.correrjuntos.com/otro-articulo' },
] }));

POSITIVE.push(['WebPage con la identidad de otro articulo', 'webpage_id_cross_url', CROSS]);

const NEGATIVE = [
  ['pagina alias con grafo de su propia URL', ALIAS, 'www.correrjuntos.com/p'],
  ['pagina alias con grafo de su canonica', ALIAS_CANON, 'www.correrjuntos.com/p'],
  ['AggregateOffer valido con lowPrice',
    wrap(JSON.stringify({ '@type': 'SportsEvent', name: 'C', startDate: '2026-01-01', location: 'X', offers: { '@type': 'AggregateOffer', lowPrice: '55', highPrice: '90', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' } }))],
  ['SportsEvent sin offers',
    wrap(JSON.stringify({ '@type': 'SportsEvent', name: 'C', startDate: '2026-01-01', location: 'X' }))],
  ['HowToStep sin text (deuda conocida)',
    wrap(JSON.stringify({ '@type': 'HowTo', name: 'Plan', step: [{ '@type': 'HowToStep', position: 1, name: 'Paso' }] }))],
  ['@id duplicado compatible',
    wrap(JSON.stringify({ '@graph': [
      { '@type': 'Organization', '@id': 'https://www.correrjuntos.com/#organization', name: 'CorrerJuntos', url: 'https://www.correrjuntos.com/' },
      { '@type': 'Organization', '@id': 'https://www.correrjuntos.com/#organization', name: 'CorrerJuntos' },
    ] }))],
  ['Review anidado y completo',
    wrap(JSON.stringify({ '@type': 'Product', name: 'P', review: { '@type': 'Review', author: { '@type': 'Person', name: 'A' }, reviewRating: { '@type': 'Rating', ratingValue: 8.7, bestRating: 10 }, itemReviewed: { '@type': 'Product', name: 'P' } } }))],
  ['Article completo',
    wrap(JSON.stringify({ '@graph': [WEBPAGE_OK, ARTICLE_OK] }))],
];

function selftest() {
  let pass = 0, fail = 0;
  console.log('CONTROLES POSITIVOS (el test DEBE detectar el defecto)');
  for (const [name, code, html] of POSITIVE) {
    const codes = analyzeHtml(html).findings.map((f) => f.code);
    const ok = codes.includes(code);
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}  -> ${code}${ok ? '' : `  (obtenido: ${codes.join(',') || 'nada'})`}`);
    ok ? pass++ : fail++;
  }
  console.log('\nCONTROLES NEGATIVOS (el test NO debe dar ningun fallo)');
  for (const [name, html, ownKey] of NEGATIVE) {
    const codes = analyzeHtml(html, '(memoria)', ownKey || null).findings.map((f) => f.code);
    const ok = codes.length === 0;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  (falsos positivos: ${codes.join(',')})`}`);
    ok ? pass++ : fail++;
  }
  console.log(`\n${pass} PASS · ${fail} FAIL`);
  return fail === 0;
}

/* ------------------------------------------------------------------ */
/* Auditoria del repositorio                                           */
/* ------------------------------------------------------------------ */

function audit() {
  const files = walkHtml(ROOT);
  const all = [];
  let blocks = 0;
  for (const f of files) {
    const rel = relative(ROOT, f).split(sep).join('/');
    const own = normalizeUrl('/' + rel.replace(/index\.html$/, '').replace(/\.html$/, ''));
    const { findings, blockCount } = analyzeHtml(readFileSync(f, 'utf8'), rel, own);
    blocks += blockCount;
    all.push(...findings);
  }
  return { files: files.length, blocks, findings: all };
}

/* ------------------------------------------------------------------ */

// Solo actua como CLI cuando se ejecuta directamente. Al importarlo (por
// ejemplo para verificar HTML servido en produccion) exporta analyzeHtml sin
// auditar el repositorio.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (!isMain) { /* importado como modulo */ } else {

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) process.exit(selftest() ? 0 : 1);

const r = audit();
if (argv.includes('--json')) {
  console.log(JSON.stringify(r, null, 2));
} else {
  console.log(`ficheros HTML analizados : ${r.files}`);
  console.log(`bloques JSON-LD          : ${r.blocks}`);
  console.log(`hallazgos                : ${r.findings.length}`);
  const by = new Map();
  for (const f of r.findings) by.set(f.code, [...(by.get(f.code) || []), f]);
  for (const [code, items] of [...by].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n[${code}] ${items.length} en ${new Set(items.map((i) => i.file)).size} ficheros`);
    for (const i of items.slice(0, 10)) console.log(`   ${i.file}${i.detail ? `  -> ${i.detail}` : ''}`);
    if (items.length > 10) console.log(`   ... +${items.length - 10}`);
  }
}
process.exit(r.findings.length === 0 ? 0 : 1);

}
