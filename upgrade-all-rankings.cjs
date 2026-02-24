const fs = require('fs');
const path = require('path');

const baseDir = path.join('C:', 'Users', 'guett', 'OneDrive', 'Escritorio', 'correrjuntosV2', 'equipamiento');

// Read the CSS from zapatillas as reference
const zapatillasHtml = fs.readFileSync(path.join(baseDir, 'zapatillas-running.html'), 'utf8');

// Extract the new CSS block (from nav-wrapper to the closing responsive media query)
const cssMatch = zapatillasHtml.match(/<style>([\s\S]*?)<\/style>/);
const newCSS = cssMatch[1];

const files = [
  'relojes-gps-running.html',
  'geles-energeticos-running.html',
  'bebidas-hidratacion-running.html',
  'recuperadores-running.html',
  'accesorios-running.html',
  'ropa-running.html',
  'auriculares-running.html'
];

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Replace CSS block entirely
  html = html.replace(/<style>[\s\S]*?<\/style>/, `<style>${newCSS}</style>`);

  // 2. Wrap nav in nav-wrapper (if not already)
  if (!html.includes('nav-wrapper')) {
    html = html.replace(
      /<nav class="nav">([\s\S]*?)<\/nav>/,
      `<div class="nav-wrapper">\n<nav class="nav">$1</nav>\n</div>`
    );
  }

  // 3. Change all "~XX€" to "Desde XX€" with tooltip
  html = html.replace(/<span class="product-price">~(\d+)€<\/span>/g,
    '<span class="product-price" title="Precio orientativo en Amazon">Desde $1€</span>');
  // Also handle prices like ~X,XX€ or ~XX.XX€
  html = html.replace(/<span class="product-price">~([\d,.]+)€<\/span>/g,
    '<span class="product-price" title="Precio orientativo en Amazon">Desde $1€</span>');

  // 4. Add product IDs
  for (let i = 1; i <= 10; i++) {
    html = html.replace(
      new RegExp(`<div class="product-card">\\s*<div class="product-rank">${i}</div>`),
      `<div class="product-card" id="product-${i}">\n      <div class="product-rank">${i}</div>`
    );
  }

  // 5. Add back-link before FAQ if not present
  if (!html.includes('back-link')) {
    html = html.replace('  </div>\n\n  <!-- FAQ -->', '  </div>\n\n  <a href="/equipamiento/" class="back-link">← Volver a todas las categorías</a>\n\n  <!-- FAQ -->');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Updated: ${file}`);
});

console.log('\nDone! CSS + nav + prices + IDs + back-link applied to all 7 files.');
