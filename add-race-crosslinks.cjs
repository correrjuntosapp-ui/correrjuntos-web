/**
 * Add cross-linking block with city photos between the 5 race guide articles.
 * Each article gets cards to the OTHER 4 races.
 */
const fs = require('fs');
const path = require('path');

const RACES_ES = [
  { slug: 'maraton-valencia-guia', name: 'Maratón de Valencia', city: 'Valencia', date: 'Diciembre', dist: '42K', img: '2526878' },
  { slug: 'maraton-barcelona-guia', name: 'Maratón de Barcelona', city: 'Barcelona', date: 'Marzo', dist: '42K', img: '1388030' },
  { slug: 'maraton-sevilla-guia', name: 'Maratón de Sevilla', city: 'Sevilla', date: 'Febrero', dist: '42K', img: '16643958' },
  { slug: 'maraton-madrid-guia', name: 'Maratón de Madrid', city: 'Madrid', date: 'Abril', dist: '42K', img: '3757144' },
  { slug: 'san-silvestre-vallecana-guia', name: 'San Silvestre Vallecana', city: 'Madrid', date: '31 Dic', dist: '10K', img: '1387577' },
];

const RACES_EN = [
  { slug: 'valencia-marathon-guide', name: 'Valencia Marathon', city: 'Valencia', date: 'December', dist: '42K', img: '2526878' },
  { slug: 'barcelona-marathon-guide', name: 'Barcelona Marathon', city: 'Barcelona', date: 'March', dist: '42K', img: '1388030' },
  { slug: 'seville-marathon-guide', name: 'Seville Marathon', city: 'Seville', date: 'February', dist: '42K', img: '16643958' },
  { slug: 'madrid-marathon-guide', name: 'Madrid Marathon', city: 'Madrid', date: 'April', dist: '42K', img: '3757144' },
  { slug: 'san-silvestre-vallecana-guide', name: 'San Silvestre Vallecana', city: 'Madrid', date: 'Dec 31', dist: '10K', img: '1387577' },
];

function buildBlock(races, currentSlug, isEN) {
  const others = races.filter(r => r.slug !== currentSlug);
  const title = isEN ? 'More Popular Races in Spain' : 'Otras carreras populares en España';
  const readText = isEN ? 'Read guide →' : 'Ver guía →';
  const prefix = isEN ? '/blog/en/' : '/blog/';

  let cards = others.map(r => {
    return `        <a href="${prefix}${r.slug}" style="display:block;text-decoration:none;border-radius:16px;overflow:hidden;border:1px solid #efe6db;background:#fffcf9;transition:all .25s">
          <img src="https://images.pexels.com/photos/${r.img}/pexels-photo-${r.img}.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=70" alt="${r.name}" loading="lazy" width="400" height="200" style="width:100%;height:140px;object-fit:cover;display:block">
          <div style="padding:14px 16px">
            <span style="font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.5px">${r.city} · ${r.date} · ${r.dist}</span>
            <p style="font-size:.95rem;font-weight:700;color:#3d3229;margin:4px 0 6px;line-height:1.3">${r.name}</p>
            <span style="font-size:.8rem;color:#f97316;font-weight:600">${readText}</span>
          </div>
        </a>`;
  }).join('\n');

  return `
    <div style="margin:48px 0 32px;padding:32px 0 0;border-top:1px solid #efe6db">
      <h2 style="font-size:1.2rem;font-weight:800;color:#3d3229;margin:0 0 20px">🏅 ${title}</h2>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
${cards}
      </div>
    </div>
`;
}

let modified = 0;

// Process ES articles
for (const race of RACES_ES) {
  const file = path.join(process.cwd(), 'blog', race.slug + '.html');
  if (!fs.existsSync(file)) { console.log(`SKIP (not found): ${race.slug}`); continue; }
  let html = fs.readFileSync(file, 'utf8');

  if (html.includes('Otras carreras populares')) {
    console.log(`SKIP (already has block): ${race.slug}`);
    continue;
  }

  const block = buildBlock(RACES_ES, race.slug, false);
  html = html.replace('<div class="related">', block + '\n    <div class="related">');
  fs.writeFileSync(file, html, 'utf8');
  modified++;
  console.log(`ADDED: ${race.slug}`);
}

// Process EN articles
for (const race of RACES_EN) {
  const file = path.join(process.cwd(), 'blog', 'en', race.slug + '.html');
  if (!fs.existsSync(file)) { console.log(`SKIP (not found): ${race.slug}`); continue; }
  let html = fs.readFileSync(file, 'utf8');

  if (html.includes('More Popular Races')) {
    console.log(`SKIP (already has block): ${race.slug}`);
    continue;
  }

  const block = buildBlock(RACES_EN, race.slug, true);
  html = html.replace('<div class="related">', block + '\n    <div class="related">');
  fs.writeFileSync(file, html, 'utf8');
  modified++;
  console.log(`ADDED EN: ${race.slug}`);
}

console.log(`\nDone! Modified: ${modified}/10 files`);
