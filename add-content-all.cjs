const fs = require('fs');
const path = require('path');
const baseDir = path.join('C:', 'Users', 'guett', 'OneDrive', 'Escritorio', 'correrjuntosV2', 'equipamiento');

// ========================================
// DATA PER PAGE
// ========================================
const pages = {
  'relojes-gps-running.html': {
    ratings: [9.4, 9.2, 9.1, 8.5, 8.8, 8.7, 8.4, 8.3, 8.0, 7.8],
    levels: ['intermedio','principiante','avanzado','avanzado','avanzado','principiante','avanzado','intermedio','principiante','intermedio'],
    specTypes: ['AMOLED','GPS multibanda','GPS dual','GPS','Wear OS','Titanio'],
    specUses: ['Mapas','Mapas offline','Barometro','Bioimpedancia','Potencia running'],
    table: [
      ['Garmin Forerunner 265','9.4','380€','Running diario'],
      ['COROS PACE 3','9.2','230€','Mejor precio'],
      ['Garmin Forerunner 965','9.1','550€','Tope de gama'],
      ['Apple Watch Ultra 2','8.5','850€','Ecosistema Apple'],
      ['Polar Vantage V3','8.8','500€','Métricas PRO']
    ],
    related: [
      {href:'/equipamiento/zapatillas-running.html',emoji:'👟',name:'Zapatillas Running',sub:'Hoka, Nike, ASICS, Brooks'},
      {href:'/equipamiento/auriculares-running.html',emoji:'🎧',name:'Auriculares Running',sub:'Shokz, Beats, JBL, Sony'},
      {href:'/equipamiento/accesorios-running.html',emoji:'🎽',name:'Accesorios Running',sub:'Cinturones, chalecos, frontales'}
    ]
  },
  'geles-energeticos-running.html': {
    ratings: [9.3, 9.1, 8.8, 8.7, 8.5, 8.2, 9.0, 8.0, 7.9, 8.3],
    levels: ['principiante','avanzado','principiante','principiante','principiante','intermedio','avanzado','principiante','principiante','intermedio'],
    specTypes: ['Isotonico','Hidrogel','Ciclodextrina','Maltodextrina'],
    specUses: ['Sin agua','Sin sabor','Con cafeina','Compacto','Liquido','Doble fuente','Cafeina + guarana','Rapida absorcion','Fructosa'],
    table: [
      ['SiS Go Isotonic Gel','9.3','30€/30ud','Más popular'],
      ['Maurten Gel 100','9.1','3.50€/ud','Élite'],
      ['SiS Beta Fuel Gel','9.0','3€/ud','Alta energía'],
      ['Crown Sport HyperGel','8.8','2€/ud','Marca española'],
      ['226ERS Energy Gel','8.7','2.50€/ud','Digestión fácil']
    ],
    related: [
      {href:'/equipamiento/bebidas-hidratacion-running.html',emoji:'🥤',name:'Bebidas Hidratación',sub:'Isotónicas y electrolitos'},
      {href:'/equipamiento/recuperadores-running.html',emoji:'💪',name:'Recuperadores',sub:'Proteínas y recuperación'},
      {href:'/equipamiento/zapatillas-running.html',emoji:'👟',name:'Zapatillas Running',sub:'Top 10 zapatillas 2026'}
    ]
  },
  'bebidas-hidratacion-running.html': {
    ratings: [9.2, 9.0, 9.1, 8.8, 8.7, 8.5, 8.3, 8.4, 8.2, 7.9],
    levels: ['principiante','intermedio','avanzado','principiante','avanzado','principiante','intermedio','principiante','principiante','intermedio'],
    specTypes: ['Isotonico','Hidrogel','Efervescente'],
    specUses: ['Electrolitos','Amilopectina','Sin calorias','Sin azucar','Bajo azucar','Polvo'],
    table: [
      ['Isostar Hydrate & Perform','9.2','15€/400g','Más popular'],
      ['Maurten Drink Mix 320','9.1','4€/sobre','Élite'],
      ['226ERS Isotonic Drink','9.0','18€/500g','Marca española'],
      ['SiS Go Electrolyte','8.8','20€/500g','Ciencia running'],
      ['Precision Hydration PH 1000','8.7','10€/tubo','Alta sudoración']
    ],
    related: [
      {href:'/equipamiento/geles-energeticos-running.html',emoji:'⚡',name:'Geles Energéticos',sub:'SiS, Maurten, 226ERS'},
      {href:'/equipamiento/recuperadores-running.html',emoji:'💪',name:'Recuperadores',sub:'Proteínas post-entreno'},
      {href:'/equipamiento/zapatillas-running.html',emoji:'👟',name:'Zapatillas Running',sub:'Top 10 zapatillas 2026'}
    ]
  },
  'recuperadores-running.html': {
    ratings: [9.3, 8.9, 8.8, 8.6, 8.5, 8.2, 8.7, 9.0, 8.4, 8.1],
    levels: ['intermedio','principiante','intermedio','intermedio','principiante','principiante','avanzado','intermedio','principiante','intermedio'],
    specTypes: ['Whey + creatina','Proteina aislada','Glutamina + BCAAs','Whey + caseina','Leucina','Cereza acida','Colageno'],
    specUses: ['Todo en uno','Vitaminas','Espanol','Clasico','Pro teams','Economica','Muchos sabores','Electrolitos'],
    table: [
      ['226ERS Recovery Drink','9.3','35€','Más popular'],
      ['ON Gold Standard Whey','9.0','55€','Más vendida mundial'],
      ['Victory Total Recovery','8.9','25€','Todo en uno'],
      ['Crown Sport Recuperador','8.8','30€','Marca española'],
      ['SiS Beta Recovery','8.7','35€','Nivel pro']
    ],
    related: [
      {href:'/equipamiento/geles-energeticos-running.html',emoji:'⚡',name:'Geles Energéticos',sub:'Energía durante la carrera'},
      {href:'/equipamiento/bebidas-hidratacion-running.html',emoji:'🥤',name:'Bebidas Hidratación',sub:'Isotónicas y electrolitos'},
      {href:'/equipamiento/zapatillas-running.html',emoji:'👟',name:'Zapatillas Running',sub:'Top 10 zapatillas 2026'}
    ]
  },
  'accesorios-running.html': {
    ratings: [9.0, 8.8, 8.5, 8.7, 9.1, 8.3, 8.2, 7.8, 8.0, 7.9],
    levels: ['intermedio','intermedio','principiante','principiante','intermedio','principiante','principiante','principiante','principiante','principiante'],
    specTypes: ['Compresion','Reflectante','Impermeable'],
    specUses: ['Soft flask 250ml','Botella 500ml','Transpirable','Ultraligero','Anti-ampollas','USB-C','Sensor movimiento','Hipoalergenicas','Tactil','Ajustable','Porta movil','360° visibilidad','Anti-sudor'],
    table: [
      ['Compressport Calcetines','9.1','15€','Referencia runners'],
      ['Cinturon Running + Flask','9.0','25€','Más completo'],
      ['Chaleco Hidratación','8.8','30€','Hidratación'],
      ['Linterna Frontal LED','8.7','15€','Correr de noche'],
      ['Chaleco Reflectante','8.5','15€','Seguridad']
    ],
    related: [
      {href:'/equipamiento/zapatillas-running.html',emoji:'👟',name:'Zapatillas Running',sub:'Hoka, Nike, ASICS, Brooks'},
      {href:'/equipamiento/relojes-gps-running.html',emoji:'⌚',name:'Relojes GPS',sub:'Garmin, COROS, Polar'},
      {href:'/equipamiento/ropa-running.html',emoji:'👕',name:'Ropa Running',sub:'Camisetas, mallas, shorts'}
    ]
  },
  'ropa-running.html': {
    ratings: [8.8, 9.0, 8.9, 8.5, 8.3, 8.2, 8.4, 8.6, 8.7, 8.1],
    levels: ['principiante','principiante','intermedio','principiante','intermedio','principiante','intermedio','principiante','principiante','principiante'],
    specTypes: ['Dri-FIT','HeatGear','Compresion'],
    specUses: ['Transpirable','Secado rapido','Ligeros','Ventilacion','Capa base','Elastico','Con bolsillo','Corte mujer','Comodos','Economica'],
    table: [
      ['Nike Dry Park VII','9.0','18€','Nike calidad'],
      ['UA HeatGear Shorts','8.9','25€','Compresión'],
      ['Joma Combi Camiseta','8.8','10€','Más vendida'],
      ['Joma Camiseta Mujer','8.7','10€','Running mujer'],
      ['July\'s Song Conjunto','8.6','22€','Conjunto mujer']
    ],
    related: [
      {href:'/equipamiento/zapatillas-running.html',emoji:'👟',name:'Zapatillas Running',sub:'Top 10 zapatillas 2026'},
      {href:'/equipamiento/accesorios-running.html',emoji:'🎽',name:'Accesorios Running',sub:'Cinturones, chalecos, frontales'},
      {href:'/equipamiento/relojes-gps-running.html',emoji:'⌚',name:'Relojes GPS',sub:'Garmin, COROS, Polar'}
    ]
  },
  'auriculares-running.html': {
    ratings: [9.4, 9.2, 8.9, 8.7, 8.5, 8.3, 8.6, 8.4, 8.1, 8.0],
    levels: ['intermedio','principiante','principiante','avanzado','principiante','principiante','intermedio','principiante','avanzado','principiante'],
    specTypes: ['Conduccion osea','Open-ear','TWS','ANC'],
    specUses: ['BT 5.3','Sensor cardiaco','Ganchos','Resistente agua','JBL Sound','Sony Sound','Modo ambiente','3 microfonos','Control tactil','Hi-Res','IP68 natacion','32GB MP3'],
    table: [
      ['Shokz OpenRun Pro 2','9.4','180€','Referencia running'],
      ['Shokz OpenRun','9.2','100€','Más popular'],
      ['Soundcore AeroFit 2','8.9','90€','Autonomía brutal'],
      ['Beats Powerbeats Pro 2','8.7','250€','Premium'],
      ['Sony WF-C700N','8.6','70€','Versátiles']
    ],
    related: [
      {href:'/equipamiento/relojes-gps-running.html',emoji:'⌚',name:'Relojes GPS Running',sub:'Garmin, COROS, Polar'},
      {href:'/equipamiento/accesorios-running.html',emoji:'🎽',name:'Accesorios Running',sub:'Cinturones, chalecos, frontales'},
      {href:'/equipamiento/zapatillas-running.html',emoji:'👟',name:'Zapatillas Running',sub:'Hoka, Nike, ASICS, Brooks'}
    ]
  }
};

// ========================================
// PROCESS EACH FILE
// ========================================
const levelLabels = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };

Object.entries(pages).forEach(([filename, data]) => {
  const filePath = path.join(baseDir, filename);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. ADD RATINGS after each product-name
  const nameRegex = /<div class="product-name">([^<]+)<\/div>/g;
  let nameIndex = 0;
  html = html.replace(nameRegex, (match, name) => {
    const rating = data.ratings[nameIndex];
    if (rating === undefined) return match;
    const pct = Math.round(rating * 10);
    nameIndex++;
    return `${match}\n      <div class="product-rating"><span class="rating-score">${rating}</span><div class="rating-bar"><div class="rating-fill" style="width:${pct}%"></div></div><span class="rating-label">/10</span></div>`;
  });

  // 2. ADD LEVEL BADGES after product-tag
  const tagRegex = /<span class="product-tag">([^<]+)<\/span>/g;
  let tagIndex = 0;
  html = html.replace(tagRegex, (match) => {
    const level = data.levels[tagIndex];
    if (level === undefined) return match;
    tagIndex++;
    return `${match}\n        <span class="level-badge level-${level}">${levelLabels[level]}</span>`;
  });

  // 3. COLOR SPEC TAGS
  data.specTypes.forEach(spec => {
    const escaped = spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`<span class="product-spec">${escaped}</span>`, 'g'),
      `<span class="product-spec spec-type">${spec}</span>`);
  });
  data.specUses.forEach(spec => {
    const escaped = spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`<span class="product-spec">${escaped}</span>`, 'g'),
      `<span class="product-spec spec-use">${spec}</span>`);
  });
  // Weight specs (Xg pattern)
  html = html.replace(/<span class="product-spec">(\d+g)<\/span>/g, '<span class="product-spec spec-weight">$1</span>');

  // 4. ADD COMPARISON TABLE after intro-guide
  const tableRows = data.table.map((row, i) => {
    return `        <tr><td><span class="table-rank">${i+1}</span></td><td><a href="#product-${i+1}">${row[0]}</a></td><td class="table-score">${row[1]}</td><td>Desde ${row[2]}</td><td>${row[3]}</td></tr>`;
  }).join('\n');

  const tableHTML = `\n  <!-- Tabla comparativa rápida -->\n  <div class="comparison-table">\n    <table>\n      <thead>\n        <tr><th>#</th><th>Modelo</th><th>Puntuación</th><th>Precio</th><th>Para quién</th></tr>\n      </thead>\n      <tbody>\n${tableRows}\n      </tbody>\n    </table>\n  </div>\n`;

  // Insert table before products-grid
  html = html.replace('  <div class="products-grid">', tableHTML + '\n  <div class="products-grid">');

  // 5. REPLACE RELATED SECTION
  // Find existing related section patterns
  // Pattern 1: related div with class (most pages)
  const relatedPatterns = [
    /<div class="related"[\s\S]*?<\/div>\s*<\/div>/,
    /<div style="margin:48px[\s\S]*?Tambien te puede interesar[\s\S]*?<\/div>/
  ];

  const relatedHTML = `<div class="related-section">
    <h3>También te puede interesar</h3>
    <div class="related-grid">
${data.related.map(r => `      <a href="${r.href}" class="related-card">
        <span class="related-emoji">${r.emoji}</span>
        <div class="related-info"><span>${r.name}</span><small>${r.sub}</small></div>
        <span class="related-arrow">→</span>
      </a>`).join('\n')}
    </div>
  </div>`;

  let replaced = false;
  for (const pattern of relatedPatterns) {
    if (pattern.test(html)) {
      html = html.replace(pattern, relatedHTML);
      replaced = true;
      break;
    }
  }

  // If no pattern matched, try to find "Tambien te puede interesar" section more broadly
  if (!replaced) {
    const broadPattern = /<!-- Related[\s\S]*?<\/div>\s*\n/;
    if (broadPattern.test(html)) {
      // Find the section from "Tambien" heading to the closing div
      const startIdx = html.indexOf('Tambien te puede interesar');
      if (startIdx > -1) {
        // Find the containing div (go back to find its opening)
        let searchBack = startIdx;
        while (searchBack > 0 && html.substring(searchBack - 30, searchBack).indexOf('<div') === -1) {
          searchBack--;
        }
        // Find the parent div opening
        const divStart = html.lastIndexOf('<div', startIdx);
        // Find the closing - count divs to find matching close
        let depth = 0;
        let pos = divStart;
        let divEnd = -1;
        while (pos < html.length) {
          if (html.substring(pos, pos + 4) === '<div') depth++;
          if (html.substring(pos, pos + 6) === '</div>') {
            depth--;
            if (depth === 0) { divEnd = pos + 6; break; }
          }
          pos++;
        }
        if (divEnd > -1) {
          html = html.substring(0, divStart) + relatedHTML + html.substring(divEnd);
          replaced = true;
        }
      }
    }
  }

  if (!replaced) {
    console.log(`  WARNING: Could not replace related section in ${filename}`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✓ ${filename}: ratings, levels, specs, table, related`);
});

console.log('\nDone! All 7 pages updated with specific content.');
