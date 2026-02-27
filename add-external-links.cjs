/**
 * add-external-links.cjs
 * Adds 2-3 external authority links per blog article for E-E-A-T SEO signals.
 * Uses category detection + keyword matching to place links contextually.
 */
const fs = require('fs');
const path = require('path');

const BASE = __dirname;

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together', 'categoria', 'autor', 'category', 'author'].includes(e.name)) continue;
      walk(p, files);
    } else if (e.name.endsWith('.html') && e.name !== 'index.html') {
      files.push(p);
    }
  }
  return files;
}

// Category → keyword-link pairs. Each link has ES and EN anchors.
const CATEGORY_LINKS = {
  // ── TRAINING ──
  'Entrenamiento': [
    { kw: /zona 2|zone 2|base aer[oó]bica|aerobic base/i, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5357260/', a: { es: 'según estudios científicos', en: 'according to research' } },
    { kw: /cadencia|cadence|180 pasos|180 steps|stride rate/i, url: 'https://www.runnersworld.com/training/a20824665/running-cadence/', a: { es: "Runner's World", en: "Runner's World" } },
    { kw: /VO2\s?max|umbral de lactato|lactate threshold/i, url: 'https://bjsm.bmj.com/', a: { es: 'British Journal of Sports Medicine', en: 'British Journal of Sports Medicine' } },
    { kw: /intervalos|intervals|fartlek|series|tempo/i, url: 'https://www.worldathletics.org/', a: { es: 'World Athletics', en: 'World Athletics' } },
  ],
  'Training': [
    { kw: /zone 2|aerobic base/i, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5357260/', a: { es: 'research studies', en: 'research studies' } },
    { kw: /cadence|180 steps|stride rate/i, url: 'https://www.runnersworld.com/training/a20824665/running-cadence/', a: { es: "Runner's World", en: "Runner's World" } },
    { kw: /VO2\s?max|lactate threshold/i, url: 'https://bjsm.bmj.com/', a: { es: 'BJSM', en: 'British Journal of Sports Medicine' } },
  ],
  // ── NUTRITION ──
  'Nutrici\u00f3n': [
    { kw: /hidratos|carbohidrat|glucógeno|glycogen/i, url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/carbohydrates/art-20045705', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /prote[ií]na|protein/i, url: 'https://pubmed.ncbi.nlm.nih.gov/22150425/', a: { es: 'PubMed', en: 'PubMed' } },
    { kw: /hidrataci[oó]n|hydration|electrolito|electrolyte/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
    { kw: /hierro|iron|anemia|ferritina|ferritin/i, url: 'https://www.who.int/health-topics/anaemia', a: { es: 'OMS', en: 'WHO' } },
  ],
  'Nutrition': [
    { kw: /carbohydrate|carb|glycogen/i, url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/carbohydrates/art-20045705', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /protein/i, url: 'https://pubmed.ncbi.nlm.nih.gov/22150425/', a: { es: 'PubMed', en: 'PubMed' } },
    { kw: /hydration|electrolyte/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
  ],
  // ── HEALTH / INJURIES ──
  'Salud': [
    { kw: /fascitis plantar|plantar fasciitis/i, url: 'https://www.mayoclinic.org/diseases-conditions/plantar-fasciitis/symptoms-causes/syc-20354846', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /rodilla|knee|corredor|runner/i, url: 'https://orthoinfo.aaos.org/en/diseases--conditions/patellofemoral-pain-syndrome/', a: { es: 'AAOS', en: 'AAOS' } },
    { kw: /tendinitis|tend[oó]n|achilles|aquiles/i, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3445147/', a: { es: 'National Institutes of Health', en: 'National Institutes of Health' } },
    { kw: /cardiovascular|coraz[oó]n|heart/i, url: 'https://www.heart.org/en/healthy-living/fitness', a: { es: 'American Heart Association', en: 'American Heart Association' } },
    { kw: /estiramient|stretch|flexibilidad|flexibility/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
  ],
  'Lesiones': [
    { kw: /fascitis|plantar/i, url: 'https://www.mayoclinic.org/diseases-conditions/plantar-fasciitis/symptoms-causes/syc-20354846', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /rodilla|knee/i, url: 'https://orthoinfo.aaos.org/en/diseases--conditions/patellofemoral-pain-syndrome/', a: { es: 'AAOS', en: 'AAOS' } },
    { kw: /periostitis|shin splint/i, url: 'https://www.mayoclinic.org/diseases-conditions/shin-splints/symptoms-causes/syc-20354105', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /tendinitis|tend[oó]n|achilles/i, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3445147/', a: { es: 'NIH', en: 'NIH' } },
  ],
  'Health': [
    { kw: /plantar fasciitis/i, url: 'https://www.mayoclinic.org/diseases-conditions/plantar-fasciitis/symptoms-causes/syc-20354846', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /knee|runner.s knee/i, url: 'https://orthoinfo.aaos.org/en/diseases--conditions/patellofemoral-pain-syndrome/', a: { es: 'AAOS', en: 'AAOS' } },
    { kw: /achilles|tendin/i, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3445147/', a: { es: 'NIH', en: 'NIH' } },
    { kw: /heart|cardiovascular/i, url: 'https://www.heart.org/en/healthy-living/fitness', a: { es: 'AHA', en: 'American Heart Association' } },
    { kw: /stretch|flexibility/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
  ],
  'Injuries': [
    { kw: /plantar fasciitis/i, url: 'https://www.mayoclinic.org/diseases-conditions/plantar-fasciitis/symptoms-causes/syc-20354846', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /knee/i, url: 'https://orthoinfo.aaos.org/en/diseases--conditions/patellofemoral-pain-syndrome/', a: { es: 'AAOS', en: 'AAOS' } },
    { kw: /shin splint/i, url: 'https://www.mayoclinic.org/diseases-conditions/shin-splints/symptoms-causes/syc-20354105', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
    { kw: /achilles|tendin/i, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3445147/', a: { es: 'NIH', en: 'NIH' } },
  ],
  // ── SHOES ──
  'Zapatillas': [
    { kw: /pronaci[oó]n|supinaci[oó]n|pisada|gait/i, url: 'https://www.asics.com/us/en-us/running-advice/pronation-guide', a: { es: 'ASICS', en: 'ASICS' } },
    { kw: /amortiguaci[oó]n|cushioning|drop|mediasuela|midsole/i, url: 'https://www.runnersworld.com/gear/a20842595/how-to-choose-running-shoes/', a: { es: "Runner's World", en: "Runner's World" } },
    { kw: /km de vida|durabilidad|mileage|durability/i, url: 'https://www.runnersworld.com/', a: { es: "Runner's World", en: "Runner's World" } },
  ],
  'Shoes': [
    { kw: /pronation|supination|gait/i, url: 'https://www.asics.com/us/en-us/running-advice/pronation-guide', a: { es: 'ASICS', en: 'ASICS' } },
    { kw: /cushioning|drop|midsole/i, url: 'https://www.runnersworld.com/gear/a20842595/how-to-choose-running-shoes/', a: { es: "Runner's World", en: "Runner's World" } },
  ],
  // ── TRAIL ──
  'Trail Running': [
    { kw: /seguridad|safety|emergencia|emergency/i, url: 'https://itra.run/', a: { es: 'ITRA', en: 'ITRA' } },
    { kw: /desnivel|elevation|terreno|terrain/i, url: 'https://www.worldathletics.org/', a: { es: 'World Athletics', en: 'World Athletics' } },
    { kw: /zapatilla|shoe|suela|outsole/i, url: 'https://www.runnersworld.com/', a: { es: "Runner's World", en: "Runner's World" } },
  ],
  'Trail': [
    { kw: /safety|emergency/i, url: 'https://itra.run/', a: { es: 'ITRA', en: 'ITRA' } },
    { kw: /elevation|terrain/i, url: 'https://www.worldathletics.org/', a: { es: 'World Athletics', en: 'World Athletics' } },
  ],
  // ── TECH ──
  'Tecnolog\u00eda': [
    { kw: /garmin/i, url: 'https://www.garmin.com/en-US/c/sports-fitness/running/', a: { es: 'Garmin', en: 'Garmin' } },
    { kw: /coros/i, url: 'https://www.coros.com/', a: { es: 'COROS', en: 'COROS' } },
    { kw: /polar/i, url: 'https://www.polar.com/', a: { es: 'Polar', en: 'Polar' } },
    { kw: /variabilidad|HRV|heart rate variability/i, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5624990/', a: { es: 'NIH', en: 'NIH' } },
    { kw: /strava/i, url: 'https://www.strava.com/', a: { es: 'Strava', en: 'Strava' } },
  ],
  'Relojes GPS': [
    { kw: /garmin/i, url: 'https://www.garmin.com/en-US/c/sports-fitness/running/', a: { es: 'Garmin', en: 'Garmin' } },
    { kw: /coros/i, url: 'https://www.coros.com/', a: { es: 'COROS', en: 'COROS' } },
    { kw: /polar/i, url: 'https://www.polar.com/', a: { es: 'Polar', en: 'Polar' } },
  ],
  'Technology': [
    { kw: /garmin/i, url: 'https://www.garmin.com/en-US/c/sports-fitness/running/', a: { es: 'Garmin', en: 'Garmin' } },
    { kw: /coros/i, url: 'https://www.coros.com/', a: { es: 'COROS', en: 'COROS' } },
    { kw: /polar/i, url: 'https://www.polar.com/', a: { es: 'Polar', en: 'Polar' } },
    { kw: /strava/i, url: 'https://www.strava.com/', a: { es: 'Strava', en: 'Strava' } },
  ],
  // ── EQUIPMENT ──
  'Equipamiento': [
    { kw: /conducci[oó]n [oó]sea|bone conduction|shokz/i, url: 'https://shokz.com/', a: { es: 'Shokz', en: 'Shokz' } },
    { kw: /gore-tex|impermeab|waterproof/i, url: 'https://www.gore-tex.com/', a: { es: 'Gore-Tex', en: 'Gore-Tex' } },
    { kw: /foam roller|liberaci[oó]n miofascial|myofascial/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
  ],
  'Accesorios Running': [
    { kw: /conducci[oó]n [oó]sea|bone conduction|shokz/i, url: 'https://shokz.com/', a: { es: 'Shokz', en: 'Shokz' } },
    { kw: /gore-tex|impermeab|waterproof/i, url: 'https://www.gore-tex.com/', a: { es: 'Gore-Tex', en: 'Gore-Tex' } },
  ],
  'Equipment': [
    { kw: /bone conduction|shokz/i, url: 'https://shokz.com/', a: { es: 'Shokz', en: 'Shokz' } },
    { kw: /gore-tex|waterproof/i, url: 'https://www.gore-tex.com/', a: { es: 'Gore-Tex', en: 'Gore-Tex' } },
  ],
  // ── ROUTES ──
  'Rutas': [
    { kw: /federaci[oó]n|federation|atletismo|athletics/i, url: 'https://www.rfea.es/', a: { es: 'RFEA', en: 'RFEA' } },
    { kw: /seguridad|safety|visib|reflectante/i, url: 'https://www.runnersworld.com/', a: { es: "Runner's World", en: "Runner's World" } },
  ],
  'Routes': [
    { kw: /federation|athletics/i, url: 'https://www.rfea.es/', a: { es: 'RFEA', en: 'RFEA' } },
    { kw: /safety|visibility/i, url: 'https://www.runnersworld.com/', a: { es: "Runner's World", en: "Runner's World" } },
  ],
  // ── COMMUNITY ──
  'Comunidad': [
    { kw: /endorfina|endorphin|bienestar|well-being/i, url: 'https://pubmed.ncbi.nlm.nih.gov/', a: { es: 'PubMed', en: 'PubMed' } },
    { kw: /motivaci[oó]n|motivation|psicolog[ií]a|psychology/i, url: 'https://bjsm.bmj.com/', a: { es: 'BJSM', en: 'BJSM' } },
  ],
  // ── BEGINNERS ──
  'Principiantes': [
    { kw: /calentamiento|warm.?up/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
    { kw: /lesi[oó]n|injury|prevenir|prevent/i, url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/running/art-20546886', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
  ],
  'Beginners': [
    { kw: /warm.?up/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
    { kw: /injury|prevent/i, url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/running/art-20546886', a: { es: 'Mayo Clinic', en: 'Mayo Clinic' } },
  ],
  // ── RACES ──
  'Carreras': [
    { kw: /marat[oó]n|marathon/i, url: 'https://www.worldathletics.org/', a: { es: 'World Athletics', en: 'World Athletics' } },
    { kw: /nutrici[oó]n|nutrition|gel|hidrataci[oó]n/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
  ],
  'Races': [
    { kw: /marathon/i, url: 'https://www.worldathletics.org/', a: { es: 'World Athletics', en: 'World Athletics' } },
    { kw: /nutrition|gel|hydration/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
  ],
};

// Universal fallback links (used when category has no matches or <2 links inserted)
const FALLBACK_LINKS = [
  { kw: /correr|running|run|carrera|race/i, url: 'https://www.worldathletics.org/', a: { es: 'World Athletics', en: 'World Athletics' } },
  { kw: /salud|health|beneficio|benefit/i, url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity', a: { es: 'OMS', en: 'WHO' } },
  { kw: /entren|train|ejercicio|exercise/i, url: 'https://www.acsm.org/', a: { es: 'ACSM', en: 'ACSM' } },
];

const MAX_LINKS = 3;

let totalFiles = 0;
let totalLinks = 0;
let filesWithLinks = 0;

const allFiles = walk(path.join(BASE, 'blog'));

allFiles.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf-8');
  const rel = path.relative(BASE, filePath).replace(/\\/g, '/');

  // Detect language
  const isEN = rel.includes('/en/') || html.includes('<html lang="en"');
  const lang = isEN ? 'en' : 'es';

  // Detect category
  const catMatch = html.match(/<span class="category">([^<]+)<\/span>/);
  if (!catMatch) return;
  const category = catMatch[1].trim();

  // Get keyword-link pairs for this category
  let links = CATEGORY_LINKS[category] || [];

  // Find the content area (between <div class="content"> and the CTA/share section)
  const contentStart = html.indexOf('<div class="content">');
  const contentEnd = html.indexOf('<div class="cta-box">') || html.indexOf('<div class="share-article">') || html.indexOf('<div class="newsletter">');
  if (contentStart < 0) return;

  const endIdx = contentEnd > contentStart ? contentEnd : html.length;
  let contentArea = html.substring(contentStart, endIdx);

  let insertedCount = 0;
  let insertedUrls = new Set();

  // Try category links
  for (const link of links) {
    if (insertedCount >= MAX_LINKS) break;
    if (insertedUrls.has(link.url)) continue;
    if (html.includes(link.url)) continue; // Already has this URL

    // Find a <p> containing the keyword in the content area
    const pRegex = /<p>([^]*?)<\/p>/g;
    let pMatch;
    let bestMatch = null;

    // Reset content area offset for searching
    const searchArea = html.substring(contentStart, endIdx);

    pMatch = pRegex.exec(searchArea);
    while (pMatch) {
      const pContent = pMatch[1];
      // Don't insert inside existing links
      if (link.kw.test(pContent) && !pContent.includes(link.url)) {
        bestMatch = { fullMatch: pMatch[0], content: pContent, index: pMatch.index };
        break;
      }
      pMatch = pRegex.exec(searchArea);
    }

    if (bestMatch) {
      const anchor = link.a[lang];
      const linkHtml = ` (<a href="${link.url}" target="_blank" rel="noopener">${anchor}</a>)`;

      // Insert before the last period in this paragraph
      const lastPeriod = bestMatch.content.lastIndexOf('.');
      if (lastPeriod > 0) {
        const newContent = bestMatch.content.substring(0, lastPeriod) + linkHtml + bestMatch.content.substring(lastPeriod);
        const newP = '<p>' + newContent + '</p>';
        html = html.replace(bestMatch.fullMatch, newP);
        insertedCount++;
        insertedUrls.add(link.url);
      }
    }
  }

  // Try fallback links if we still have < 2
  if (insertedCount < 2) {
    for (const link of FALLBACK_LINKS) {
      if (insertedCount >= MAX_LINKS) break;
      if (insertedUrls.has(link.url)) continue;
      if (html.includes(link.url)) continue;

      const searchArea = html.substring(contentStart, endIdx);
      const pRegex2 = /<p>([^]*?)<\/p>/g;
      let pMatch2;

      pMatch2 = pRegex2.exec(searchArea);
      while (pMatch2) {
        if (link.kw.test(pMatch2[1]) && !pMatch2[1].includes(link.url)) {
          const anchor = link.a[lang];
          const linkHtml = ` (<a href="${link.url}" target="_blank" rel="noopener">${anchor}</a>)`;
          const lastPeriod = pMatch2[1].lastIndexOf('.');
          if (lastPeriod > 0) {
            const newContent = pMatch2[1].substring(0, lastPeriod) + linkHtml + pMatch2[1].substring(lastPeriod);
            html = html.replace(pMatch2[0], '<p>' + newContent + '</p>');
            insertedCount++;
            insertedUrls.add(link.url);
            break;
          }
        }
        pMatch2 = pRegex2.exec(searchArea);
      }
    }
  }

  if (insertedCount > 0) {
    fs.writeFileSync(filePath, html, 'utf-8');
    filesWithLinks++;
    totalLinks += insertedCount;
  }

  totalFiles++;
});

console.log('=== External Links Results ===');
console.log(`Files processed: ${totalFiles}`);
console.log(`Files with links added: ${filesWithLinks}`);
console.log(`Total links inserted: ${totalLinks}`);
console.log(`Average links per file: ${(totalLinks / (filesWithLinks || 1)).toFixed(1)}`);
