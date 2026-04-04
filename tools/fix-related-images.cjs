/**
 * fix-related-images.cjs
 * Reemplaza rutas locales rotas /blog/img/* y /public/* en related.js
 * con URLs Pexels reales por slug/categoría
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'blog', 'related.js');

// Mapa slug → URL Pexels correcta (400x200, cropped, q60)
const FIXES = {
  // Salud
  'correr-en-ayunas':                  'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'prevenir-lesiones-running':          'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'empezar-a-correr-despues-de-los-50': 'https://images.pexels.com/photos/6551282/pexels-photo-6551282.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'flato-dolor-costado-al-correr':      'https://images.pexels.com/photos/3776816/pexels-photo-3776816.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'volver-a-correr-despues-de-lesion':  'https://images.pexels.com/photos/5037319/pexels-photo-5037319.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',

  // Zapatillas
  'como-elegir-zapatillas-running':     'https://images.pexels.com/photos/31381389/pexels-photo-31381389.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'new-balance-1080-vs-hoka-clifton':   'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'zapatillas-running-media-maraton':   'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'zapatillas-running-supinadores':     'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',

  // Equipamiento
  'cinturones-running':                 'https://images.pexels.com/photos/10226372/pexels-photo-10226372.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'foam-rollers-runners':               'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'mejores-auriculares-running':        'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'shokz-openrun-pro-2-review':         'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'diferencia-zapatillas-running-normales': 'https://images.pexels.com/photos/31381389/pexels-photo-31381389.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',

  // Trail
  'mejores-bastones-trail-running':     'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'ultra-trail-principiantes':          'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',

  // Rutas
  'correr-acompanado-cadiz':            'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-bilbao':              'https://images.pexels.com/photos/6293192/pexels-photo-6293192.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-malaga':              'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-valencia':            'https://images.pexels.com/photos/3776816/pexels-photo-3776816.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'grupos-running-zaragoza':            'https://images.pexels.com/photos/2928057/pexels-photo-2928057.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'mejores-rutas-correr-malaga':        'https://images.pexels.com/photos/2609459/pexels-photo-2609459.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'mejores-rutas-correr-sevilla':       'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'quedadas-correr-barcelona':          'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',

  // Suplementación
  'mejores-bebidas-hidratacion-running': 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'mejores-geles-energeticos-running':   'https://images.pexels.com/photos/2377164/pexels-photo-2377164.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'mejores-proteinas-running':           'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'mejores-recuperadores-running':       'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',

  // Atleta Híbrido
  'mejores-zapatillas-hyrox':           'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
  'zapatillas-deka-strong-atlas':       'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
};

let content = fs.readFileSync(FILE, 'utf8');
let count = 0;

for (const [slug, newUrl] of Object.entries(FIXES)) {
  // Match: {s:'SLUG',...,i:'LOCAL_PATH'} — replace only the i field value
  // Pattern: i:'/...jpg or i:'/...png or i:'/...webp
  const re = new RegExp(`(\\{s:'${slug.replace(/-/g,'\\-')}',.*?i:')(\/[^']+)(')`,'g');
  const before = content;
  content = content.replace(re, `$1${newUrl}$3`);
  if (content !== before) {
    console.log(`✅ Fixed: ${slug}`);
    count++;
  } else {
    // Try alternate quote style
    const re2 = new RegExp(`(\\{s:"${slug.replace(/-/g,'\\-')}",.*?i:")(\/[^"]+)(")`,'g');
    const before2 = content;
    content = content.replace(re2, `$1${newUrl}$3`);
    if (content !== before2) {
      console.log(`✅ Fixed (double quotes): ${slug}`);
      count++;
    } else {
      console.log(`⚠️  Not found or already fixed: ${slug}`);
    }
  }
}

fs.writeFileSync(FILE, content, 'utf8');
console.log(`\n✅ Total fixes applied: ${count}`);

// Verify no local paths remain
const remaining = content.match(/i:'\/[^']+'/g) || [];
const remaining2 = content.match(/i:"\/[^"]+"/g) || [];
const allRemaining = [...remaining, ...remaining2];
if (allRemaining.length > 0) {
  console.log(`\n⚠️  Still has local paths (${allRemaining.length}):`);
  allRemaining.forEach(r => console.log('  ', r));
} else {
  console.log('✅ No local image paths remaining in related.js');
}
