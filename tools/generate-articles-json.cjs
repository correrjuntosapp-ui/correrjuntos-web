#!/usr/bin/env node
// ============================================================
// generate-articles-json.cjs
// Parses blog/related.js to extract DB_ES and DB_EN arrays,
// then writes data/articles.json for the mobile Tips screen.
// Usage: node tools/generate-articles-json.cjs
// ============================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RELATED_JS = path.join(__dirname, '..', 'blog', 'related.js');
const OUTPUT = path.join(__dirname, '..', 'data', 'articles.json');

// Read the source file
const src = fs.readFileSync(RELATED_JS, 'utf8');

// Extract array between "var <NAME>=[" and matching "];"
function extractArraySource(source, varName) {
  const startMarker = `var ${varName}=[`;
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Could not find ${varName} in related.js`);

  const arrayStart = startIdx + startMarker.length - 1; // include the [
  let depth = 0;
  let endIdx = -1;

  for (let i = arrayStart; i < source.length; i++) {
    if (source[i] === '[') depth++;
    if (source[i] === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  if (endIdx === -1) throw new Error(`Could not find closing ] for ${varName}`);
  return source.substring(arrayStart, endIdx);
}

// Use Node vm to safely evaluate the JS array literal
function parseArray(arraySource) {
  const sandbox = {};
  vm.runInNewContext(`result = ${arraySource}`, sandbox);
  return sandbox.result;
}

const dbES = parseArray(extractArraySource(src, 'DB_ES'));
const dbEN = parseArray(extractArraySource(src, 'DB_EN'));

// Categories with transactional/affiliate content
const AFFILIATE_CATEGORIES = [
  'Zapatillas', 'Equipamiento', 'Tecnología',
  'Suplementación', 'Atleta Híbrido',
];

// Partner articles (paid partnerships surfaced in the app with a badge and
// pinned at the top of the list). Two flavours:
//   - "collaboration": product WAS CEDED for review. Badge: "Colaboración".
//   - "affiliate":     product BOUGHT by CJ; article has affiliate code+link
//                      and CJ earns a commission. Badge: "Afiliado".
// Both variants MUST keep affiliate:false so ArticleReaderScreen does NOT
// inject unrelated Amazon products on top of the partner's own CTAs.
const PARTNER_ARTICLES = {
  'sizen-6-plus-opiniones': {
    partner: 'Sizen', brand: 'Sizen', campaign: 'sizen_6_plus_pilot',
    relationship: 'collaboration', collaboration: true,
  },
  'prozis-supreme-whey-opiniones': {
    partner: 'Prozis', brand: 'Prozis',
    relationship: 'affiliate', collaboration: false,
  },
};

// Map to clean article objects
function mapArticles(arr) {
  return arr.map(a => {
    const partner = PARTNER_ARTICLES[a.s];
    const base = {
      slug: a.s,
      title: a.t,
      category: a.c,
      image: a.i,
    };
    if (partner) {
      const extra = {
        affiliate: false, // never inject Amazon on top of a partner article
        collaboration: partner.collaboration,
        relationship: partner.relationship,
        featuredPartner: true,
        partner: partner.partner,
        brand: partner.brand,
      };
      if (partner.campaign) extra.campaign = partner.campaign;
      return { ...base, ...extra };
    }
    return AFFILIATE_CATEGORIES.includes(a.c)
      ? { ...base, affiliate: true }
      : base;
  });
}

const esArticles = mapArticles(dbES);
const enArticles = mapArticles(dbEN);

// Extract unique categories (preserving order of first appearance)
function uniqueCategories(articles) {
  const seen = new Set();
  return articles.reduce((acc, a) => {
    if (!seen.has(a.category)) {
      seen.add(a.category);
      acc.push(a.category);
    }
    return acc;
  }, []);
}

// English category display names
const categoryNameEN = {
  'Entrenamiento': 'Training',
  'Nutrición': 'Nutrition',
  'Equipamiento': 'Gear',
  'Tecnología': 'Technology',
  'Zapatillas': 'Running Shoes',
  'Salud': 'Health',
  'Rutas': 'Routes',
  'Trail': 'Trail',
  'Suplementación': 'Supplements',
  'Atleta Híbrido': 'Hybrid Athlete',
};

const esCats = uniqueCategories(esArticles);
const enCats = uniqueCategories(enArticles);

const output = {
  version: 1,
  generated: new Date().toISOString(),
  es: esArticles,
  en: enArticles,
  categories: {
    es: esCats,
    en: enCats.map(c => categoryNameEN[c] || c),
  },
  categoryMap: categoryNameEN,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output), 'utf8');

const sizeKB = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1);
console.log(`✅ articles.json generated: ${esArticles.length} ES + ${enArticles.length} EN articles (${sizeKB} KB)`);
console.log(`   Categories ES: ${esCats.join(', ')}`);
console.log(`   Categories EN: ${enCats.join(', ')}`);
console.log(`   Output: ${OUTPUT}`);
