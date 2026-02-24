const fs = require('fs');
const path = require('path');

const CITIES_DIR = path.join(__dirname, 'cities');
const INDEX_FILE = path.join(CITIES_DIR, 'index.html');

// Step 1: Extract city-to-image mapping from index.html
const indexHtml = fs.readFileSync(INDEX_FILE, 'utf8');
const cityMap = {};
const cardRegex = /href="\/cities\/([^"]+)\.html"[^>]*>.*?src="([^"]+)".*?class="city-flag">([^<]+)<.*?class="city-name">([^<]+)</gs;
let match;
while ((match = cardRegex.exec(indexHtml)) !== null) {
  cityMap[match[1]] = {
    imageUrl: match[2],
    flag: match[3],
    cityName: match[4]
  };
}
console.log(`Extracted ${Object.keys(cityMap).length} cities from index.html`);

// Step 2: New CSS for city pages (minified, one line)
const NEW_CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;background:#0b1220;color:#fff;line-height:1.7}.nav-wrapper{position:sticky;top:0;z-index:100;background:rgba(11,18,32,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}.container{max-width:1100px;margin:0 auto;padding:0 20px}.nav{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto}.nav>a{color:#f97316;text-decoration:none;font-weight:700;font-size:1.1rem}.nav-links{display:flex;gap:6px;font-size:.85rem}.nav-links a{color:#94a3b8;text-decoration:none;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);transition:all .2s}.nav-links a:hover{color:#f97316;background:rgba(249,115,22,.08);border-color:rgba(249,115,22,.2)}.nav-links a.active{color:#f97316;background:rgba(249,115,22,.1);border-color:rgba(249,115,22,.25)}.breadcrumb{padding:16px 0;font-size:.85rem;color:#64748b}.breadcrumb a{color:#f97316;text-decoration:none}.breadcrumb span{margin:0 8px}.hero{text-align:center;padding:0;position:relative;overflow:hidden;min-height:320px;display:flex;align-items:center;justify-content:center;flex-direction:column}.hero-bg{position:absolute;inset:0;z-index:0}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,18,32,.5) 0%,rgba(11,18,32,.8) 60%,#0b1220 100%)}.hero-content{position:relative;z-index:1;padding:60px 20px 40px;max-width:800px}.hero h1{font-size:2.5rem;font-weight:900;color:#f97316;margin-bottom:12px;line-height:1.1}.hero p{font-size:1.15rem;color:#cbd5e1;max-width:640px;margin:0 auto}.cta{display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;text-decoration:none;font-size:1.05rem;margin-top:24px;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 24px rgba(249,115,22,.25)}.cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(249,115,22,.35)}.content{padding:40px 0 60px}h2{font-size:1.7rem;font-weight:800;margin:40px 0 16px;color:#fff}h3{font-size:1.2rem;font-weight:700;margin:0 0 8px;color:#f97316}p{margin-bottom:16px;color:#cbd5e1}ul{margin:0 0 24px 20px}li{margin-bottom:8px;color:#cbd5e1}li strong{color:#fff}.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin:32px 0}.feature{background:rgba(255,255,255,.04);border:1px solid rgba(249,115,22,.15);border-radius:16px;padding:24px}.cta-box{text-align:center;margin:48px 0;padding:40px 20px;background:rgba(249,115,22,.05);border:1px solid rgba(249,115,22,.15);border-radius:24px}.cta-box p{color:#94a3b8;margin-bottom:20px}.other-cities-section{margin:40px 0 0;padding:24px 0;border-top:1px solid rgba(255,255,255,.06)}.other-cities-section h2{font-size:1.2rem;margin-bottom:16px;font-weight:800;color:#fff}.other-cities-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.other-city-card{position:relative;height:100px;border-radius:12px;overflow:hidden;text-decoration:none;color:#fff;display:flex;align-items:flex-end;border:1px solid rgba(255,255,255,.06);transition:transform .2s,border-color .2s}.other-city-card:hover{transform:translateY(-3px);border-color:rgba(249,115,22,.4)}.other-city-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .4s}.other-city-card:hover img{transform:scale(1.08)}.other-city-card::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent 60%);z-index:1}.other-city-card span{position:relative;z-index:2;padding:8px 12px;font-size:.85rem;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.5)}.footer{text-align:center;padding:32px 20px;border-top:1px solid rgba(255,255,255,.06);font-size:.85rem;color:#475569;margin-top:20px}.footer a{color:#f97316;text-decoration:none}@media(max-width:640px){.hero{min-height:260px}.hero h1{font-size:1.8rem}.hero p{font-size:1rem}.hero-content{padding:40px 20px 30px}.features{grid-template-columns:1fr}.other-cities-grid{grid-template-columns:repeat(3,1fr)}}`;

// Step 3: New nav HTML
const NEW_NAV = `<div class="nav-wrapper">
<nav class="nav">
  <a href="/">CORRER<b>JUNTOS</b></a>
  <div class="nav-links">
    <a href="/cities/" class="active">Ciudades</a>
    <a href="/blog/">Blog</a>
    <a href="/equipamiento/">Equipamiento</a>
    <a href="/#app">App</a>
  </div>
</nav>
</div>`;

// Step 4: New footer HTML
const NEW_FOOTER = `<footer class="footer">
  <p><a href="/">CorrerJuntos</a> &mdash; La comunidad running global y gratuita</p>
  <p style="margin-top:8px"><a href="/privacy.html">Privacidad</a> &middot; <a href="/terms.html">Terminos</a> &middot; <a href="/blog/">Blog</a> &middot; <a href="/equipamiento/">Equipamiento</a></p>
</footer>`;

// Step 5: Process each city file
const files = fs.readdirSync(CITIES_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
let processed = 0;
let errors = [];

files.forEach(file => {
  const slug = file.replace('.html', '');
  const filePath = path.join(CITIES_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const cityData = cityMap[slug];

  if (!cityData) {
    errors.push(`No image data for: ${slug}`);
    return;
  }

  // 5a: Replace CSS line (line 28 - the minified CSS line)
  const lines = html.split('\n');
  const cssLineIdx = lines.findIndex(l => l.trim().startsWith('*{margin:0;padding:0'));
  if (cssLineIdx !== -1) {
    lines[cssLineIdx] = NEW_CSS;
    html = lines.join('\n');
  } else {
    errors.push(`CSS line not found: ${slug}`);
  }

  // 5b: Replace nav block
  html = html.replace(
    /<nav class="nav">\s*<a href="\/">CORRERJUNTOS<\/a>\s*<div class="nav-links">\s*<a href="\/cities\/">(Cities|Ciudades)<\/a>\s*<a href="\/blog\/">Blog<\/a>\s*<a href="\/#app">App<\/a>\s*<\/div>\s*<\/nav>/,
    NEW_NAV
  );

  // 5c: Fix breadcrumb to Spanish
  html = html.replace(
    /<a href="\/">Home<\/a>/,
    '<a href="/">Inicio</a>'
  );
  html = html.replace(
    /<a href="\/cities\/">Cities<\/a>/,
    '<a href="/cities/">Ciudades</a>'
  );

  // 5d: Add hero image
  // Build hero image URL (wider for hero)
  const heroImageUrl = cityData.imageUrl.replace('w=480&h=320&q=75', 'w=1200&h=600&q=80');
  const heroRegex = /<div class="hero">\s*(<h1>[\s\S]*?<\/a>)\s*<\/div>/;
  const heroMatch = html.match(heroRegex);
  if (heroMatch) {
    const heroContent = heroMatch[1];
    html = html.replace(heroMatch[0],
      `<div class="hero">\n  <div class="hero-bg"><img src="${heroImageUrl}" alt="Running en ${cityData.cityName}" loading="eager"></div>\n  <div class="hero-content">\n    ${heroContent}\n  </div>\n</div>`
    );
  }

  // 5e: Replace "Otras ciudades" section
  const otrasCiudadesRegex = /<div style="margin:40px 0 0;padding:24px 0;border-top:1px solid rgba\(255,255,255,\.06\)">\s*<h2 style="font-size:1\.1rem;margin-bottom:16px">(Otras ciudades populares|Other popular cities)<\/h2>\s*<div style="display:flex;flex-wrap:wrap;gap:8px">([\s\S]*?)<\/div>\s*<\/div>/;
  const otrasMatch = html.match(otrasCiudadesRegex);

  if (otrasMatch) {
    // Parse existing city links
    const linkRegex = /href="\/cities\/([^"]+)\.html"[^>]*>([^<]+)<\/a>/g;
    const linkedCities = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(otrasMatch[2])) !== null) {
      linkedCities.push({ slug: linkMatch[1], name: linkMatch[2] });
    }

    // Build mini-cards
    let cardsHtml = '';
    linkedCities.forEach(city => {
      const data = cityMap[city.slug];
      if (data) {
        const imgUrl = data.imageUrl.replace('w=480&h=320', 'w=300&h=200');
        cardsHtml += `      <a href="/cities/${city.slug}.html" class="other-city-card">\n        <img src="${imgUrl}" alt="${data.cityName}" loading="lazy">\n        <span>${data.flag} ${data.cityName}</span>\n      </a>\n`;
      }
    });

    const newOtrasSection = `<div class="other-cities-section">\n    <h2>Otras ciudades populares</h2>\n    <div class="other-cities-grid">\n${cardsHtml}    </div>\n  </div>`;

    html = html.replace(otrasMatch[0], newOtrasSection);
  }

  // 5f: Replace footer
  html = html.replace(
    /<footer class="footer">\s*<p>[\s\S]*?<\/p>\s*(<p[\s\S]*?<\/p>\s*)?<\/footer>/,
    NEW_FOOTER
  );

  fs.writeFileSync(filePath, html, 'utf8');
  processed++;
  console.log(`\u2713 ${file}`);
});

console.log(`\nDone! Processed ${processed}/${files.length} files.`);
if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach(e => console.log('  - ' + e));
}
