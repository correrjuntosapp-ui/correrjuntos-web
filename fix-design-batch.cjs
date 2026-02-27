const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// ── File collection (same pattern as update-nav-global.cjs) ──
function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together'].includes(entry.name)) continue;
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html') && fullPath !== path.join(BASE_DIR, 'index.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

// ── Hero images by category ──
const HERO_IMAGES = {
  training: 'https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  nutrition: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  shoes: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  tech: 'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  trail: 'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  health: 'https://images.pexels.com/photos/4056832/pexels-photo-4056832.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  routes: 'https://images.pexels.com/photos/4652250/pexels-photo-4652250.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  group: 'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  race: 'https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  general: 'https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70'
};

function getCategoryFromFilename(filename) {
  const f = filename.toLowerCase();
  if (/zapatilla|shoe|nike|adidas|hoka|asics|saucony|new.balance|brooks|pegasus|vaporfly|ultraboost|gel-nimbus|gel-kayano|novablast|clifton|bondi|mach/.test(f)) return 'shoes';
  if (/nutri|dieta|alimento|comida|comer|food|protein|hidrat|ayuno|breakfast|carbohidrat|hierro|magnesio|suplemento|desayuno|antiinflam|vitamina|cafeina|caffeine|electrolito/.test(f)) return 'nutrition';
  if (/trail|montana|mountain|ultra/.test(f)) return 'trail';
  if (/lesion|injury|dolor|pain|rodilla|knee|estiram|stretch|calambr|recuper|fascitis|tendin|shin|splint|tobillo|ankle|physio|fisio|sobreentren|overtraining/.test(f)) return 'health';
  if (/ruta|route|circuito|parque|park|mejor.*correr/.test(f)) return 'routes';
  if (/apple.watch|garmin|coros|polar|gps|tech|reloj|watch|strava|app.*running|wearable|smartwatch|suunto|fitbit/.test(f)) return 'tech';
  if (/grupo|group|comunidad|community|social|partner|compa.ero|juntos|motivaci|amigo|club/.test(f)) return 'group';
  if (/maraton|marathon|carrera|race|competicion|media.marat|10k|5k|42k|21k|preparar.*carrera|primera.*carrera/.test(f)) return 'race';
  if (/plan|entren|train|interval|fartlek|tempo|ritmo|pace|vo2|cadencia|velocidad|kilometr|principiante|beginner|correr.*empezar|empezar.*correr|start.*running|running.*plan|warm.?up|calentamiento|series|repeticion/.test(f)) return 'training';
  return 'general';
}

// ── Path helpers ──
function normPath(p) { return p.replace(/\\/g, '/'); }

function getPageType(filePath) {
  const np = normPath(filePath);
  const isEN = np.includes('/en/') || np.includes('/en\\');
  const rel = normPath(path.relative(BASE_DIR, filePath));

  // Blog article (not index, not categoria, not autor)
  if (/^blog\//.test(rel) && !rel.includes('index.html') && !rel.includes('categoria/') && !rel.includes('autor/')) {
    return { type: 'blogArticle', isEN, activeNav: 'blog' };
  }
  // Blog index/categoria
  if (/^blog\//.test(rel) && (rel.includes('index.html') || rel.includes('categoria/'))) {
    return { type: 'blogIndex', isEN, activeNav: 'blog' };
  }
  // Blog autor
  if (/^blog\/autor\//.test(rel)) {
    return { type: 'blogAutor', isEN: false, activeNav: 'blog' };
  }
  // Cities
  if (/^cities\//.test(rel)) {
    return { type: 'city', isEN: false, activeNav: 'cities' };
  }
  // Equipamiento
  if (/^equipamiento\//.test(rel)) {
    return { type: 'equipamiento', isEN: false, activeNav: 'blog' };
  }
  // Matching
  if (/^matching\//.test(rel)) {
    return { type: 'matching', isEN, activeNav: 'matching' };
  }
  // Root pages
  return { type: 'root', isEN: false, activeNav: '' };
}

// ──────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────
const files = getAllHtmlFiles(BASE_DIR);
console.log(`Found ${files.length} HTML files to process\n`);

let stats = { nav: 0, breadcrumb: 0, footer: 0, hero: 0, articleCSS: 0, navWrapper: 0, registrarse: 0, skipped: 0 };

files.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(BASE_DIR, filePath);
  let changed = false;

  // Skip files without nav-links (e.g., privacy.html bare pages)
  if (!html.includes('nav-links') && !html.includes('class="nav"')) {
    stats.skipped++;
    return;
  }

  const { type, isEN, activeNav } = getPageType(filePath);

  // ════════════════════════════════════════
  // 1. NAV: Replace entire nav-links block
  // ════════════════════════════════════════
  const navLinksRegex = /<div class="nav-links">[\s\S]*?<\/div>/;
  const match = html.match(navLinksRegex);
  if (match) {
    let newNav;
    if (isEN) {
      newNav = `<div class="nav-links">
      <a href="/matching/en/"${activeNav === 'matching' ? ' class="active"' : ''}>Matching</a>
      <a href="/cities/"${activeNav === 'cities' ? ' class="active"' : ''}>Cities</a>
      <a href="/blog/en/"${activeNav === 'blog' ? ' class="active"' : ''}>Blog</a>
      <a href="/#app">App</a>
    </div>`;
    } else {
      newNav = `<div class="nav-links">
      <a href="/matching/"${activeNav === 'matching' ? ' class="active"' : ''}>Matching</a>
      <a href="/cities/"${activeNav === 'cities' ? ' class="active"' : ''}>Ciudades</a>
      <a href="/blog/"${activeNav === 'blog' ? ' class="active"' : ''}>Blog</a>
      <a href="/#app">App</a>
    </div>`;
    }
    html = html.replace(navLinksRegex, newNav);
    changed = true;
    stats.nav++;
  }

  // ════════════════════════════════════════
  // 2. REGISTRARSE → Únete / Sign up
  // ════════════════════════════════════════
  if (html.includes('>Registrarse</a>')) {
    html = html.replace(/>Registrarse<\/a>/g, '>Únete</a>');
    changed = true;
    stats.registrarse++;
  }
  if (html.includes('>Sign up</a>')) {
    html = html.replace(/>Sign up<\/a>/g, '>Join</a>');
    changed = true;
  }

  // ════════════════════════════════════════
  // 3. NAV-WRAPPER: Add to blog articles that lack it
  // ════════════════════════════════════════
  if (!html.includes('nav-wrapper') && html.includes('<nav class="nav">')) {
    // Add nav-wrapper CSS rule
    const navWrapperCSS = '.nav-wrapper{position:sticky;top:0;z-index:100;background:rgba(11,18,32,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}';
    // Insert before .nav{ in the style block
    if (html.includes('.nav{')) {
      html = html.replace('.nav{', navWrapperCSS + '.nav{');
    }
    // Remove border-bottom from .nav since nav-wrapper handles it
    html = html.replace(
      /\.nav\{([^}]*?)border-bottom:1px solid rgba\(255,255,255,\.06\);([^}]*?)\}/,
      '.nav{$1$2}'
    );
    // Wrap <nav> in <div class="nav-wrapper">
    html = html.replace(
      '<nav class="nav">',
      '<div class="nav-wrapper">\n<nav class="nav">'
    );
    // Close nav-wrapper after </nav>
    html = html.replace(
      /(<\/nav>)\s*\n\s*\n\s*<div class="container">/,
      '$1\n</div>\n\n<div class="container">'
    );
    changed = true;
    stats.navWrapper++;
  }

  // ════════════════════════════════════════
  // 4. BREADCRUMB: Remove emojis
  // ════════════════════════════════════════
  const breadcrumbEmojis = [
    [/✍️\s*Blog/g, 'Blog'],
    [/🏙️\s*Ciudades/g, 'Ciudades'],
    [/👟\s*Equipamiento/g, 'Equipamiento'],
    [/📱\s*App/g, 'App'],
    [/🤝\s*Matching/g, 'Matching'],
    [/📝\s*Blog/g, 'Blog'],
  ];
  breadcrumbEmojis.forEach(([regex, replacement]) => {
    if (regex.test(html)) {
      html = html.replace(regex, replacement);
      changed = true;
      stats.breadcrumb++;
    }
  });

  // ════════════════════════════════════════
  // 5. FOOTER: Remove emojis + add Matching link
  // ════════════════════════════════════════
  const footerReplacements = [
    // Explora section
    [/>🏙️ Ciudades<\/a>/g, '>Ciudades</a>'],
    [/>🏙️\s*Ciudades<\/a>/g, '>Ciudades</a>'],
    [/>✍️ Blog<\/a>/g, '>Blog</a>'],
    [/>✍️\s*Blog<\/a>/g, '>Blog</a>'],
    [/>👟 Equipamiento<\/a>/g, '>Equipamiento</a>'],
    [/>👟\s*Equipamiento<\/a>/g, '>Equipamiento</a>'],
    [/>📱 App<\/a>/g, '>App</a>'],
    [/>📱\s*App<\/a>/g, '>App</a>'],
    // Empresa section
    [/>👥 Sobre Nosotros<\/a>/g, '>Sobre Nosotros</a>'],
    [/>👥\s*Sobre Nosotros<\/a>/g, '>Sobre Nosotros</a>'],
    [/>📊 Inversores<\/a>/g, '>Inversores</a>'],
    [/>📊\s*Inversores<\/a>/g, '>Inversores</a>'],
    [/>✉️ Contacto<\/a>/g, '>Contacto</a>'],
    [/>✉️\s*Contacto<\/a>/g, '>Contacto</a>'],
    [/>🤝 Patrocinadores<\/a>/g, '>Patrocinadores</a>'],
    [/>🤝\s*Patrocinadores<\/a>/g, '>Patrocinadores</a>'],
    [/>📊 Media Kit<\/a>/g, '>Media Kit</a>'],
    [/>📊\s*Media Kit<\/a>/g, '>Media Kit</a>'],
    // EN footer
    [/>🏙️ Cities<\/a>/g, '>Cities</a>'],
    [/>✍️\s*Blog<\/a>/g, '>Blog</a>'],
    [/>👟 Gear<\/a>/g, '>Gear</a>'],
    [/>📱\s*App<\/a>/g, '>App</a>'],
    [/>👥 About Us<\/a>/g, '>About Us</a>'],
    [/>📊 Investors<\/a>/g, '>Investors</a>'],
    [/>✉️ Contact<\/a>/g, '>Contact</a>'],
    [/>🤝 Sponsors<\/a>/g, '>Sponsors</a>'],
    [/>📊 Media Kit<\/a>/g, '>Media Kit</a>'],
  ];
  footerReplacements.forEach(([regex, replacement]) => {
    if (regex.test(html)) {
      html = html.replace(regex, replacement);
      changed = true;
      stats.footer++;
    }
  });

  // Add Matching link to footer Explora (if not already there)
  if (html.includes('Explora') && !html.includes('href="/matching/"') ||
      (html.includes('href="/matching/"') && !html.includes('footer') && html.includes('Explora'))) {
    // Check if Matching is NOT already in the footer Explora section
    const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);
    if (footerMatch && !footerMatch[0].includes('/matching/')) {
      // Add Matching before Ciudades in footer
      const cityFooterLink = '<a href="/cities/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Ciudades</a>';
      const cityFooterLinkEN = '<a href="/cities/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Cities</a>';
      const matchingLink = isEN
        ? '      <a href="/matching/en/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Matching</a>\n      '
        : '      <a href="/matching/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Matching</a>\n      ';

      if (html.includes(cityFooterLink)) {
        html = html.replace(cityFooterLink, matchingLink + cityFooterLink);
        changed = true;
      } else if (html.includes(cityFooterLinkEN)) {
        html = html.replace(cityFooterLinkEN, matchingLink + cityFooterLinkEN);
        changed = true;
      }
    }
  }

  // ════════════════════════════════════════
  // 6. BLOG ARTICLE: Hero image + reading CSS
  // ════════════════════════════════════════
  if (type === 'blogArticle') {
    const filename = path.basename(filePath, '.html');
    const category = getCategoryFromFilename(filename);
    const imageUrl = HERO_IMAGES[category];

    // Extract title for alt text
    const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
    const altText = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').substring(0, 80) : 'Running';

    // 6a. Transform hero CSS
    const oldHeroCSS = '.hero{text-align:center;padding:60px 20px 40px;background:radial-gradient(ellipse at 30% 0%,rgba(249,115,22,.1),transparent 60%)}';
    const newHeroCSS = '.hero{text-align:center;padding:0;position:relative;overflow:hidden;min-height:340px;display:flex;align-items:center;justify-content:center;flex-direction:column}.hero-bg{position:absolute;inset:0;z-index:0}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-bg::after{content:\'\';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,18,32,.45) 0%,rgba(11,18,32,.75) 60%,#0b1220 100%)}.hero-content{position:relative;z-index:1;padding:60px 20px 40px;max-width:800px}';

    if (html.includes(oldHeroCSS)) {
      html = html.replace(oldHeroCSS, newHeroCSS);
      changed = true;
      stats.hero++;
    }

    // 6b. Transform hero HTML — inject bg image + content wrapper
    if (html.includes('<div class="hero">') && !html.includes('hero-bg')) {
      html = html.replace(
        '<div class="hero">',
        `<div class="hero">\n  <div class="hero-bg"><img src="${imageUrl}" alt="${altText}" loading="eager"></div>\n  <div class="hero-content">`
      );
      // Close hero-content before the hero's closing div
      // Pattern: meta div → closing hero div → container content
      html = html.replace(
        /(<div class="meta">.*?<\/div>)\s*<\/div>\s*\n\s*<div class="container content">/s,
        '$1\n  </div>\n</div>\n\n<div class="container content">'
      );
      changed = true;
    }

    // 6c. Update og:image and twitter:image
    if (html.includes('og-image.png')) {
      html = html.replace(
        /content="https:\/\/www\.correrjuntos\.com\/icons\/og-image\.png\?v=2"/g,
        `content="${imageUrl}"`
      );
      changed = true;
    }

    // 6d. Article reading improvements: narrower width + larger font + subtle bg
    const oldContentCSS = '.content{padding:40px 0 60px}';
    const newContentCSS = '.content{padding:40px 32px 60px;max-width:720px;margin:0 auto;font-size:1.08rem;line-height:1.8;background:rgba(255,255,255,.025);border-radius:20px}';

    if (html.includes(oldContentCSS)) {
      html = html.replace(oldContentCSS, newContentCSS);
      changed = true;
      stats.articleCSS++;
    }

    // 6e. Mobile hero responsive
    if (html.includes('@media(max-width:640px){.hero h1{font-size:1.6rem}') && !html.includes('.hero{min-height:260px}')) {
      html = html.replace(
        '@media(max-width:640px){.hero h1{font-size:1.6rem}',
        '@media(max-width:640px){.hero{min-height:260px}.hero h1{font-size:1.6rem}'
      );
      changed = true;
    }
  }

  // ════════════════════════════════════════
  // WRITE
  // ════════════════════════════════════════
  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✓ ${relPath} [${type}${isEN ? '/EN' : ''}]`);
  }
});

console.log('\n── Summary ──');
console.log(`Nav updated: ${stats.nav}`);
console.log(`Nav-wrapper added: ${stats.navWrapper}`);
console.log(`Registrarse→Únete: ${stats.registrarse}`);
console.log(`Breadcrumb emojis: ${stats.breadcrumb}`);
console.log(`Footer emojis: ${stats.footer}`);
console.log(`Blog hero images: ${stats.hero}`);
console.log(`Article CSS improved: ${stats.articleCSS}`);
console.log(`Skipped (no nav): ${stats.skipped}`);
console.log('\nDone!');
