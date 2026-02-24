/**
 * Add contextual CTAs to blog articles based on category/topic
 *
 * Strategy:
 * 1. Detect article category from filename/content
 * 2. For city-specific articles → "Encuentra tu grupo en [Ciudad]"
 * 3. For other categories → topic-specific CTA messaging
 * 4. Replace the main community CTA (not newsletter, not Amazon)
 * 5. Update newsletter CTA heading to match category
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');

// City mapping for rutas articles
const cityMap = {
  'madrid': 'Madrid',
  'barcelona': 'Barcelona',
  'valencia': 'Valencia',
  'sevilla': 'Sevilla',
  'malaga': 'Málaga',
  'bilbao': 'Bilbao',
  'zaragoza': 'Zaragoza',
};

// Category detection from filename patterns
const categoryPatterns = [
  { pattern: /rutas-correr-([\w-]+)/, category: 'rutas', extractCity: true },
  { pattern: /zapatillas|nike-pegasus|asics-gel|hoka-clifton|hoka-speedgoat|salomon-speedcross|brooks-ghost|pronadores/, category: 'zapatillas' },
  { pattern: /garmin-forerunner|garmin-venu|coros-pace|polar-pacer|apple-watch|reloj-gps|smartwatch/, category: 'relojes' },
  { pattern: /auriculares|shokz|jbl-reflect|conduccion-osea/, category: 'auriculares' },
  { pattern: /trail|senderos/, category: 'trail' },
  { pattern: /strava|potencia-en-running|variabilidad-cardiaca|entrenamiento-por-zonas|apps-running/, category: 'tecnologia' },
  { pattern: /nutricion|dieta|proteinas|cafeina|ayuno|hidratacion|hidratos|alimentos-antiinflamatorios|gel-energetico|suplementos/, category: 'nutricion' },
  { pattern: /plan-entrenamiento|errores-comunes|correr-en-invierno/, category: 'entrenamiento' },
  { pattern: /empezar-a-correr|principiantes|primera-carrera/, category: 'principiantes' },
  { pattern: /estiramientos|recupera|foam-roller/, category: 'recuperacion' },
  { pattern: /beneficios-correr-en-grupo|comunidad/, category: 'comunidad' },
  { pattern: /ropa-tecnica|mallas|chubasqueros|gorras|calcetines|pack-basico/, category: 'ropa' },
  { pattern: /chalecos-hidratacion|cinturones|lamparas-frontales/, category: 'accesorios' },
  { pattern: /equipamiento/, category: 'equipamiento' },
];

// Contextual CTA content by category
const ctaContent = {
  rutas: (city) => ({
    h2: `¿Buscas compañía para correr en ${city}?`,
    p: `Únete a quedadas de running en ${city}. Grupos para todos los niveles, totalmente gratis.`,
    btn: `Encontrar grupos en ${city}`,
    href: '/',
    nlH2: `Rutas y quedadas runner en tu email`,
    nlP: `Descubre nuevas rutas y encuentra compañeros de running. Sin spam.`,
  }),
  zapatillas: () => ({
    h2: 'Estrena tus zapatillas corriendo en grupo',
    p: 'Encuentra runners cerca de ti y pon a prueba tus zapatillas nuevas. Quedadas gratuitas, todos los niveles.',
    btn: 'Buscar quedadas cerca de mí',
    href: '/',
    nlH2: 'Reviews de zapatillas runner en tu email',
    nlP: 'Comparativas, análisis y ofertas de zapatillas de running. Sin spam.',
  }),
  relojes: () => ({
    h2: 'Pon a prueba tu reloj corriendo en grupo',
    p: 'Compara datos con otros runners y descubre todo lo que puede hacer tu reloj GPS en una quedada real.',
    btn: 'Buscar grupos de running',
    href: '/',
    nlH2: 'Reviews de tecnología runner en tu email',
    nlP: 'Análisis de relojes GPS, wearables y tecnología para correr. Sin spam.',
  }),
  auriculares: () => ({
    h2: 'Corre con música y en buena compañía',
    p: 'Encuentra grupos de running en tu ciudad y disfruta de tus auriculares mientras corres acompañado.',
    btn: 'Buscar quedadas de running',
    href: '/',
    nlH2: 'Reviews de auriculares y tecnología runner en tu email',
    nlP: 'Análisis de auriculares, gadgets y tecnología para runners. Sin spam.',
  }),
  nutricion: () => ({
    h2: 'Mejora tu nutrición corriendo con otros',
    p: 'Comparte consejos de alimentación y descubre qué toman otros runners. Únete a una quedada gratuita.',
    btn: 'Buscar grupos de running',
    href: '/',
    nlH2: 'Consejos de nutrición runner en tu email',
    nlP: 'Recetas, estrategias nutricionales y suplementación para runners. Sin spam.',
  }),
  entrenamiento: () => ({
    h2: 'Entrena acompañado, progresa más rápido',
    p: 'Encuentra runners de tu nivel y entrena en grupo. La motivación que necesitas, sin coste.',
    btn: 'Buscar quedadas de entrenamiento',
    href: '/',
    nlH2: 'Planes de entrenamiento en tu email',
    nlP: 'Rutinas, consejos y planes de entrenamiento para mejorar tus marcas. Sin spam.',
  }),
  principiantes: () => ({
    h2: '¿Empezando a correr? Hazlo acompañado',
    p: 'Encuentra grupos de running para principiantes en tu ciudad. Gratis, sin compromiso y a tu ritmo.',
    btn: 'Buscar grupos para principiantes',
    href: '/',
    nlH2: 'Tips para empezar a correr en tu email',
    nlP: 'Guías, consejos y motivación para runners que empiezan. Sin spam.',
  }),
  trail: () => ({
    h2: 'Descubre el trail corriendo con otros',
    p: 'Encuentra grupos de trail running cerca de ti. Comparte senderos, experiencias y aventuras.',
    btn: 'Buscar grupos de trail',
    href: '/',
    nlH2: 'Rutas y consejos de trail en tu email',
    nlP: 'Senderos, material y técnica de trail running. Sin spam.',
  }),
  tecnologia: () => ({
    h2: 'Compara tus datos con otros runners',
    p: 'Únete a grupos de running y comparte entrenamientos con corredores de tu nivel. Gratis.',
    btn: 'Buscar grupos de running',
    href: '/',
    nlH2: 'Tecnología y datos runner en tu email',
    nlP: 'Apps, métricas y gadgets para mejorar tu running. Sin spam.',
  }),
  recuperacion: () => ({
    h2: 'Recupera mejor corriendo suave en grupo',
    p: 'Rodajes de recuperación, estiramientos en compañía. Encuentra runners cerca de ti.',
    btn: 'Buscar quedadas de running',
    href: '/',
    nlH2: 'Tips de recuperación runner en tu email',
    nlP: 'Estiramientos, foam rolling y estrategias de recuperación. Sin spam.',
  }),
  comunidad: () => ({
    h2: '¿Listo para correr en compañía?',
    p: 'Encuentra tu grupo de running. Quedadas gratuitas para todos los niveles en tu ciudad.',
    btn: 'Buscar grupos cerca de mí',
    href: '/',
    nlH2: 'La comunidad runner en tu email',
    nlP: 'Historias, eventos y quedadas de running cerca de ti. Sin spam.',
  }),
  ropa: () => ({
    h2: 'Estrena tu ropa técnica corriendo en grupo',
    p: 'Encuentra runners cerca de ti y pon a prueba tu equipamiento en buena compañía. Gratis.',
    btn: 'Buscar quedadas de running',
    href: '/',
    nlH2: 'Tips de equipamiento runner en tu email',
    nlP: 'Ropa técnica, ofertas y novedades para corredores. Sin spam.',
  }),
  accesorios: () => ({
    h2: 'Prueba tus accesorios corriendo en grupo',
    p: 'Únete a una quedada de running y estrena tu material con otros corredores. Gratis.',
    btn: 'Buscar quedadas cerca de mí',
    href: '/',
    nlH2: 'Accesorios y equipamiento runner en tu email',
    nlP: 'Chalecos, cinturones, frontales y más accesorios para correr. Sin spam.',
  }),
  equipamiento: () => ({
    h2: 'Prueba tu equipamiento corriendo en grupo',
    p: 'Encuentra runners cerca de ti y pon a prueba tu material nuevo en buena compañía.',
    btn: 'Buscar quedadas de running',
    href: '/',
    nlH2: 'Equipamiento y ofertas runner en tu email',
    nlP: 'Reviews, comparativas y ofertas de material de running. Sin spam.',
  }),
};

// Default fallback
const defaultCta = {
  h2: 'Corre acompañado con CorrerJuntos',
  p: 'Encuentra grupos de running en tu ciudad. Quedadas gratuitas para todos los niveles.',
  btn: 'Buscar quedadas cerca de mí',
  href: '/',
  nlH2: 'Tips de running en tu email',
  nlP: 'Consejos, guías y motivación para corredores. Sin spam.',
};

function detectCategory(filename) {
  const base = path.basename(filename, '.html');

  for (const { pattern, category, extractCity } of categoryPatterns) {
    const match = base.match(pattern);
    if (match) {
      if (extractCity && match[1]) {
        const cityKey = match[1].toLowerCase();
        const cityName = cityMap[cityKey] || match[1].charAt(0).toUpperCase() + match[1].slice(1);
        return { category, city: cityName };
      }
      return { category };
    }
  }

  return { category: null };
}

function getCta(category, city) {
  if (category === 'rutas' && city) {
    return ctaContent.rutas(city);
  }
  if (category && ctaContent[category]) {
    return ctaContent[category]();
  }
  return defaultCta;
}

function buildCommunityCta(cta) {
  return `<div class="cta-box">
      <h2>${cta.h2}</h2>
      <p>${cta.p}</p>
      <a href="${cta.href}" class="cta">${cta.btn}</a>
      <p style="margin-top:12px;font-size:.85rem;color:#64748b">iOS disponible &middot; Android en marzo 2026</p>
    </div>`;
}

function buildNewsletterCta(cta) {
  return `<div class="cta-box">
      <h2>${cta.nlH2}</h2>
      <p>${cta.nlP}</p>
      <form id="newsletter-form" onsubmit="submitNL(event)" style="display:flex;flex-direction:column;gap:12px;max-width:400px;margin:0 auto">
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          <input type="email" id="nl-email" required placeholder="tu@email.com" style="flex:1;min-width:200px;padding:12px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:.9rem;outline:none">
          <button type="submit" id="nl-btn" class="cta" style="padding:12px 24px;font-size:.9rem">Suscribirme</button>
        </div>
        <p style="font-size:.75rem;color:#64748b;margin:0">Cancela cuando quieras. Cero spam.</p>
      </form>
    </div>`;
}

// Count CTA boxes in a file - determine which is community CTA and which is newsletter
function processCtas(html, cta) {
  // Find all cta-box blocks
  const ctaBoxRegex = /<div class="cta-box">([\s\S]*?)<\/div>\s*(?=\n)/g;
  let match;
  const ctaBoxes = [];

  while ((match = ctaBoxRegex.exec(html)) !== null) {
    ctaBoxes.push({
      fullMatch: match[0],
      content: match[1],
      index: match.index,
      isNewsletter: match[1].includes('newsletter-form') || match[1].includes('nl-email') || match[1].includes('submitNL'),
      isAmazon: match[1].includes('amzn.to') || match[1].includes('amazon'),
    });
  }

  let modified = html;
  let changes = 0;

  for (const box of ctaBoxes) {
    if (box.isAmazon) {
      // Skip Amazon CTAs — keep them as-is
      continue;
    }

    if (box.isNewsletter) {
      // Replace newsletter CTA
      const newNlCta = buildNewsletterCta(cta);
      modified = modified.replace(box.fullMatch, newNlCta);
      changes++;
    } else {
      // Replace community CTA
      const newCommCta = buildCommunityCta(cta);
      modified = modified.replace(box.fullMatch, newCommCta);
      changes++;
    }
  }

  return { modified, changes };
}

// Main
function main() {
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');

  let totalChanges = 0;
  let filesModified = 0;
  const summary = [];

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const html = fs.readFileSync(filePath, 'utf-8');

    const { category, city } = detectCategory(file);
    const cta = getCta(category, city);

    const { modified, changes } = processCtas(html, cta);

    if (changes > 0) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      totalChanges += changes;
      filesModified++;
      summary.push(`  ${file}: ${category || 'default'}${city ? ` (${city})` : ''} → ${changes} CTAs updated`);
    } else {
      summary.push(`  ${file}: ${category || 'default'} → no CTA boxes found (skipped)`);
    }
  }

  console.log(`\n✓ Contextual CTAs updated`);
  console.log(`  Files modified: ${filesModified}/${files.length}`);
  console.log(`  Total CTA changes: ${totalChanges}`);
  console.log(`\nDetails:`);
  summary.forEach(s => console.log(s));
}

main();
