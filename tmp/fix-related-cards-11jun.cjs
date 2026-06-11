// [11 jun 2026] Related-cards "Carreras Similares" con fotos genéricas que
// no coinciden (founder: Onupolis con "una chica" stock, Nocturna con otra
// ciudad). Fix sistemático: cada card usa el og:image REAL de la página de
// su carrera. Auto-consistente: si mañana mejora el hero de una página,
// re-ejecutar este script propaga el cambio a todas las cards.
const fs = require('fs');
const path = require('path');

const DIR = 'carreras';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

// 1. Mapa slug → og:image real de su página
const heroBySlug = {};
for (const f of files) {
  if (f === 'index.html') continue;
  const h = fs.readFileSync(path.join(DIR, f), 'utf8');
  const og = (h.match(/property="og:image" content="([^"]+)"/) || [])[1];
  if (og) heroBySlug[f.replace('.html', '')] = og;
}
console.log('heroes mapeados:', Object.keys(heroBySlug).length);
console.log('  onupolis →', heroBySlug['circuito-onupolis-huelva-2026']);
console.log('  nocturna →', heroBySlug['nocturna-guadalquivir-sevilla']);

// 2. Reemplazar img de cada related-card / race-card por el hero de su slug
let totalSwaps = 0;
for (const f of files) {
  const fp = path.join(DIR, f);
  let h = fs.readFileSync(fp, 'utf8');
  let swaps = 0;
  // anchor con href a /carreras/SLUG ... primer <img ... src="..."> dentro del bloque
  h = h.replace(
    /(<a [^>]*href="\/carreras\/([a-z0-9-]+)"[^>]*>[\s\S]{0,400}?<img[^>]*src=")([^"]+)(")/g,
    (m, pre, slug, src, post) => {
      const hero = heroBySlug[slug];
      if (!hero || src === hero) return m;
      // no tocar si la card ya usa una imagen self-hosted específica de ESA carrera
      if (src.includes(slug)) return m;
      swaps++;
      return pre + hero + post;
    }
  );
  if (swaps) {
    fs.writeFileSync(fp, h);
    totalSwaps += swaps;
    console.log(`  ${f}: ${swaps} cards`);
  }
}
console.log('TOTAL cards corregidas:', totalSwaps);
