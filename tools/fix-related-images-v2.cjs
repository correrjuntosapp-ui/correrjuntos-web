/**
 * fix-related-images-v2.cjs
 * Reemplaza TODAS las rutas locales rotas en related.js
 * con URLs Pexels reales — enfoque por filename
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'blog', 'related.js');

// Mapa filename → URL Pexels (sin importar slug)
const FILE_MAP = {
  'wall-ball-hero.jpg':            'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'sandbag-hero.jpg':              'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'kettlebell-hero.jpg':           'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'skierg-hero.jpg':               'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'roller-hero.jpg':               'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'geles-energeticos-running.jpg': 'https://images.pexels.com/photos/2377164/pexels-photo-2377164.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'bebidas-hidratacion-running.jpg': 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'proteinas-running.jpg':         'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'recuperadores-running.jpg':     'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'zapatillas-media-maraton.webp': 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'zapatillas-supinadores.jpg':    'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'shokz-openrun-pro-2.png':       'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'rutas-correr-malaga.webp':      'https://images.pexels.com/photos/2609459/pexels-photo-2609459.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'rutas-correr-sevilla.jpg':      'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'correr-ayunas-hero.png':        'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'elegir-zapatillas-running.jpg': 'https://images.pexels.com/photos/31381389/pexels-photo-31381389.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'prevenir-lesiones-running.jpg': 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'cinturon-running.jpg':          'https://images.pexels.com/photos/10226372/pexels-photo-10226372.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'quedadas-barcelona.png':        'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'correr-cadiz.jpg':              'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'volver-correr-lesion.jpg':      'https://images.pexels.com/photos/5037319/pexels-photo-5037319.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'flato-correr.jpg':              'https://images.pexels.com/photos/3776816/pexels-photo-3776816.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'empezar-correr-50.jpg':         'https://images.pexels.com/photos/6551282/pexels-photo-6551282.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-bilbao.webp':    'https://images.pexels.com/photos/6293192/pexels-photo-6293192.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-malaga.jpg':     'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-zaragoza.webp':  'https://images.pexels.com/photos/2928057/pexels-photo-2928057.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'bastones-anykuu.jpg':           'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'foam-runners-hero.jpg':         'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'ultra-trail-principiantes.jpg': 'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'nb-1080-vs-hoka-clifton.jpg':   'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'puma-pwrframe-hyrox.jpg':       'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'deka-hero.jpg':                 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-valencia.jpg':   'https://images.pexels.com/photos/3776816/pexels-photo-3776816.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
};

let content = fs.readFileSync(FILE, 'utf8');
let count = 0;

for (const [filename, newUrl] of Object.entries(FILE_MAP)) {
  // Escape dots in filename for regex
  const escaped = filename.replace(/\./g, '\\.').replace(/-/g, '\\-');
  // Match any path ending with this filename (single or double quotes)
  const re = new RegExp(`(i:')[^']*${escaped}(')`, 'g');
  const before = content;
  content = content.replace(re, `$1${newUrl}$2`);
  if (content !== before) {
    const matches = (before.match(re) || []).length;
    console.log(`✅ ${filename} → fixed ${matches} occurrence(s)`);
    count += matches;
  }
  // Double quotes variant
  const re2 = new RegExp(`(i:")[^"]*${escaped}(")`, 'g');
  const before2 = content;
  content = content.replace(re2, `$1${newUrl}$2`);
  if (content !== before2) {
    const matches2 = (before2.match(re2) || []).length;
    console.log(`✅ ${filename} (dq) → fixed ${matches2} occurrence(s)`);
    count += matches2;
  }
}

fs.writeFileSync(FILE, content, 'utf8');
console.log(`\n✅ Total fixes applied: ${count}`);

// Verify
const remaining = content.match(/i:'\/[^']+'/g) || [];
const remaining2 = content.match(/i:"\/[^"]+"/g) || [];
const allRemaining = [...remaining, ...remaining2];
if (allRemaining.length > 0) {
  console.log(`\n⚠️  Still has local paths (${allRemaining.length}):`);
  allRemaining.forEach(r => console.log('  ', r));
} else {
  console.log('✅ No local image paths remaining in related.js');
}
