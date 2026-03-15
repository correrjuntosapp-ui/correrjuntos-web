/**
 * add-internal-links-batch.cjs
 * Adds contextual internal links between blog articles.
 * Max 5 links per article, first occurrence only, only in <p> tags.
 */
const fs = require('fs');
const path = require('path');

const BASE = __dirname;

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together', 'categoria', 'autor', 'category', 'author', 'screenshots', 'tmp'].includes(e.name)) continue;
      walk(p, files);
    } else if (e.name.endsWith('.html') && e.name !== 'index.html') {
      files.push(p);
    }
  }
  return files;
}

const ES_LINKS = [
  { kw: /(?:errores?\s+comunes?|errores?\s+(?:de|al)\s+corr)/i, slug: 'errores-comunes-corredores', anchor: 'errores comunes de corredores' },
  { kw: /(?:elegir\s+zapatillas|zapatillas?\s+(?:de\s+)?running)/i, slug: 'como-elegir-zapatillas-running', anchor: 'cómo elegir zapatillas de running' },
  { kw: /(?:plan\s+(?:de\s+)?(?:entrenamiento\s+)?10\s?k)/i, slug: 'plan-entrenamiento-10k', anchor: 'plan de entrenamiento 10K' },
  { kw: /(?:series\s+(?:de\s+)?(?:velocidad|intervalos)|fartlek)/i, slug: 'entrenamiento-series-fartlek', anchor: 'series y fartlek' },
  { kw: /(?:periodizaci[oó]n|macrociclo|mesociclo)/i, slug: 'periodizacion-entrenamiento-running', anchor: 'periodización del entrenamiento' },
  { kw: /(?:tapering|semana\s+previa\s+(?:a\s+)?(?:la\s+)?carrera)/i, slug: 'tapering-semana-previa-carrera', anchor: 'tapering y semana previa' },
  { kw: /(?:nutrici[oó]n\s+(?:para\s+)?(?:runners?|corredores?)|qu[eé]\s+comer\s+(?:antes|despu[eé]s))/i, slug: 'nutricion-para-runners', anchor: 'nutrición para runners' },
  { kw: /(?:estiramientos?\s+(?:despu[eé]s|post|tras))/i, slug: 'estiramientos-despues-de-correr', anchor: 'estiramientos después de correr' },
  { kw: /(?:hidrataci[oó]n|cu[aá]nta?\s+agua\s+beber)/i, slug: 'hidratacion-running', anchor: 'hidratación en running' },
  { kw: /(?:calentar|calentamiento)\s+(?:antes|previo)/i, slug: 'como-calentar-antes-de-correr', anchor: 'cómo calentar antes de correr' },
  { kw: /(?:c[oó]mo\s+)?respirar?\s+(?:al|mientras|corriendo)/i, slug: 'como-respirar-al-correr', anchor: 'cómo respirar al correr' },
  { kw: /(?:empezar\s+a\s+correr|principiantes?\s+running)/i, slug: 'empezar-a-correr-guia-principiantes', anchor: 'empezar a correr desde cero' },
  { kw: /(?:reloj\s+(?:GPS|deportivo)|puls[oó]metro)/i, slug: 'como-elegir-reloj-gps-running', anchor: 'elegir un reloj GPS para running' },
  { kw: /(?:plan\s+(?:de\s+)?media\s+marat[oó]n|entrenar\s+(?:para\s+)?(?:un\s+)?21\s?k)/i, slug: 'plan-entrenamiento-media-maraton', anchor: 'plan de entrenamiento media maratón' },
  { kw: /(?:marat[oó]n\s+sub\s+3[:.]?30|bajar?\s+de\s+3[:.]?30)/i, slug: 'plan-maraton-sub-3-30', anchor: 'plan maratón sub 3:30' },
  { kw: /(?:beneficios?\s+de\s+correr)/i, slug: 'beneficios-de-correr', anchor: 'beneficios de correr' },
  { kw: /(?:correr\s+en\s+grupo|grupo\s+(?:de\s+)?running)/i, slug: 'beneficios-correr-en-grupo', anchor: 'correr en grupo' },
  { kw: /(?:de\s+cero\s+a\s+5\s?k|couch\s+to\s+5\s?k)/i, slug: 'de-cero-a-5k', anchor: 'plan de cero a 5K' },
];

const EN_LINKS = [
  { kw: /(?:common\s+(?:running\s+)?mistakes)/i, slug: 'common-running-mistakes', anchor: 'common running mistakes' },
  { kw: /(?:choose?\s+running\s+shoes|running\s+shoe\s+guide)/i, slug: 'how-to-choose-running-shoes', anchor: 'how to choose running shoes' },
  { kw: /(?:10\s?k\s+training\s+plan)/i, slug: '10k-training-plan', anchor: '10K training plan' },
  { kw: /(?:interval\s+training|fartlek)/i, slug: 'interval-fartlek-training', anchor: 'interval training and fartlek' },
  { kw: /(?:periodiz(?:ation|e)|macrocycle|mesocycle)/i, slug: 'running-training-periodization', anchor: 'training periodization' },
  { kw: /(?:tapering|race\s+week|taper\s+(?:plan|phase))/i, slug: 'tapering-race-week-guide', anchor: 'tapering guide' },
  { kw: /(?:nutrition\s+(?:for\s+)?runners?|what\s+to\s+eat)/i, slug: 'runner-nutrition-guide', anchor: 'runner nutrition guide' },
  { kw: /(?:stretching?\s+(?:after|post))/i, slug: 'stretching-after-running', anchor: 'stretching after running' },
  { kw: /(?:hydration|how\s+much\s+water)/i, slug: 'hydration-while-running', anchor: 'hydration while running' },
  { kw: /(?:warm\s+up\s+(?:before|routine))/i, slug: 'how-to-warm-up-before-running', anchor: 'how to warm up before running' },
  { kw: /(?:how\s+to\s+breathe?\s+(?:while|when)\s+running)/i, slug: 'how-to-breathe-while-running', anchor: 'how to breathe while running' },
  { kw: /(?:start\s+running|beginner(?:s)?\s+(?:running\s+)?guide)/i, slug: 'how-to-start-running-beginners-guide', anchor: 'how to start running' },
  { kw: /(?:GPS\s+(?:running\s+)?watch|running\s+watch)/i, slug: 'how-to-choose-gps-running-watch', anchor: 'GPS running watch guide' },
  { kw: /(?:half\s+marathon\s+(?:training\s+)?plan)/i, slug: 'half-marathon-training-plan', anchor: 'half marathon training plan' },
  { kw: /(?:marathon\s+sub\s+3[:.]?30)/i, slug: 'marathon-sub-3-30-plan', anchor: 'marathon sub 3:30 plan' },
  { kw: /(?:benefits?\s+of\s+running)/i, slug: 'benefits-of-running', anchor: 'benefits of running' },
  { kw: /(?:running\s+(?:with\s+)?(?:a\s+)?group|group\s+running)/i, slug: 'benefits-of-group-running', anchor: 'running with a group' },
  { kw: /(?:couch\s+to\s+5\s?k|zero\s+to\s+5\s?k)/i, slug: 'couch-to-5k-plan', anchor: 'couch to 5K plan' },
];

const MAX_LINKS = 5;

function addLinksToFile(filePath, linkMap, basePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(filePath, '.html');
  let added = 0;

  for (const { kw, slug: targetSlug, anchor } of linkMap) {
    if (added >= MAX_LINKS) break;
    if (slug === targetSlug) continue; // never link to self

    const href = basePath + targetSlug;
    // Skip if link already exists in the file
    if (html.includes('href="' + href + '"') || html.includes("href='" + href + "'")
      || html.includes('href="' + href + '.html"') || html.includes("href='" + href + ".html'")) continue;

    // Find <p> tags and try to match the keyword
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pMatch;
    let replaced = false;

    while ((pMatch = pRegex.exec(html)) !== null) {
      const pFull = pMatch[0];
      const pContent = pMatch[1];

      // Skip if this <p> already contains a link to the target
      if (pContent.includes(href)) continue;

      // Reset lastIndex on the keyword regex for fresh search
      kw.lastIndex = 0;
      const kwMatch = kw.exec(pContent);
      if (!kwMatch) continue;

      // Check it's not inside an existing <a> tag
      const before = pContent.substring(0, kwMatch.index);
      const openA = (before.match(/<a[\s>]/gi) || []).length;
      const closeA = (before.match(/<\/a>/gi) || []).length;
      if (openA > closeA) continue; // inside an <a> tag

      // Build replacement
      const linkedText = '<a href="' + href + '" style="color:#f97316">' + anchor + '</a>';
      const newPContent = pContent.substring(0, kwMatch.index) + linkedText + pContent.substring(kwMatch.index + kwMatch[0].length);

      // Reconstruct the <p> tag (preserve attributes)
      const pOpenTag = pFull.substring(0, pFull.indexOf('>') + 1);
      const newPFull = pOpenTag + newPContent + '</p>';

      html = html.substring(0, pMatch.index) + newPFull + html.substring(pMatch.index + pFull.length);

      added++;
      replaced = true;
      break; // move to next keyword
    }
  }

  if (added > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  + ${path.relative(BASE, filePath).replace(/\\/g, '/')}: +${added} links`);
  }
  return added;
}

// ── Main ──
const blogDir = path.join(BASE, 'blog');
const allFiles = walk(blogDir);

let totalFiles = 0;
let totalLinks = 0;
let modifiedFiles = 0;

for (const f of allFiles) {
  const rel = path.relative(BASE, f).replace(/\\/g, '/');
  const isEN = rel.startsWith('blog/en/');
  const linkMap = isEN ? EN_LINKS : ES_LINKS;
  const basePath = isEN ? '/blog/en/' : '/blog/';

  totalFiles++;
  const added = addLinksToFile(f, linkMap, basePath);
  if (added > 0) {
    totalLinks += added;
    modifiedFiles++;
  }
}

console.log('\n── Summary ──');
console.log(`Files scanned:  ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
console.log(`Links added:    ${totalLinks}`);
