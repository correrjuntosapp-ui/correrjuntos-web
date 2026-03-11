#!/usr/bin/env node
/**
 * fix-internal-links.cjs
 * Add internal links from hub articles to orphan articles.
 * Strategy: Insert contextual <a> links in the body content of hub articles
 * pointing to orphan articles, using natural anchor text.
 *
 * Run: node fix-internal-links.cjs
 * Dry run: node fix-internal-links.cjs --dry-run
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const BASE = 'https://www.correrjuntos.com';
const blogDir = path.join(__dirname, 'blog');

// ── LINK MAP: hub file → [{ orphan URL, anchor text, contextKeyword }]
// contextKeyword = text to search for in the hub article to place the link nearby
const LINK_MAP = [
  // ===== FROM: empezar-a-correr-guia-principiantes (45 incoming) =====
  { hub: 'empezar-a-correr-guia-principiantes.html', orphan: '/blog/empezar-a-correr-con-verguenza', anchor: 'empezar a correr si te da vergüenza', keyword: 'vergüenza|miedo|excusas' },
  { hub: 'empezar-a-correr-guia-principiantes.html', orphan: '/blog/empezar-a-correr-despues-de-los-50', anchor: 'empezar a correr después de los 50', keyword: 'edad|años|mayor' },
  { hub: 'empezar-a-correr-guia-principiantes.html', orphan: '/blog/mejores-superficies-para-correr', anchor: 'mejores superficies para correr', keyword: 'superficie|terreno|asfalto|tierra' },
  { hub: 'empezar-a-correr-guia-principiantes.html', orphan: '/blog/entrenamiento-fuerza-corredores', anchor: 'ejercicios de fuerza para corredores', keyword: 'fuerza|gimnasio|fortalecimiento' },
  { hub: 'empezar-a-correr-guia-principiantes.html', orphan: '/blog/correr-con-perro-canicross', anchor: 'correr con tu perro (canicross)', keyword: 'perro|mascota|compañía' },
  { hub: 'empezar-a-correr-guia-principiantes.html', orphan: '/blog/cuanto-tardo-en-correr-5km', anchor: 'cuánto se tarda en correr 5 km', keyword: '5K|5k|5 km|cinco kilómetros' },
  { hub: 'empezar-a-correr-guia-principiantes.html', orphan: '/blog/correr-embarazada-seguro', anchor: 'correr durante el embarazo de forma segura', keyword: 'embaraz|especial' },

  // ===== FROM: beneficios-correr-en-grupo (31 incoming) =====
  { hub: 'beneficios-correr-en-grupo.html', orphan: '/blog/correr-es-social-tendencia', anchor: 'correr como tendencia social en 2026', keyword: 'tendencia|social|comunidad' },
  { hub: 'beneficios-correr-en-grupo.html', orphan: '/blog/soledad-del-runner', anchor: 'la soledad del runner', keyword: 'solo|soledad|acompañad' },
  { hub: 'beneficios-correr-en-grupo.html', orphan: '/blog/por-que-dejan-correr-3-meses', anchor: 'por qué muchos dejan de correr en 3 meses', keyword: 'motivación|abandonar|dejar' },
  { hub: 'beneficios-correr-en-grupo.html', orphan: '/blog/recuperar-ganas-de-correr', anchor: 'cómo recuperar las ganas de correr', keyword: 'motivación|ganas|vuelta' },

  // ===== FROM: nutricion-para-runners (29 incoming) =====
  { hub: 'nutricion-para-runners.html', orphan: '/blog/alimentos-antiinflamatorios-runners', anchor: 'alimentos antiinflamatorios para runners', keyword: 'inflamación|antiinflamatori|recuperación' },
  { hub: 'nutricion-para-runners.html', orphan: '/blog/correr-antes-o-despues-de-comer', anchor: '¿correr antes o después de comer?', keyword: 'comer|comida|digestión|timing' },
  { hub: 'nutricion-para-runners.html', orphan: '/blog/mejores-recuperadores-running', anchor: 'los mejores recuperadores para running', keyword: 'recuperación|post-carrera|muscular' },

  // ===== FROM: encontrar-gente-para-correr (25 incoming) =====
  { hub: 'encontrar-gente-para-correr.html', orphan: '/blog/grupos-running-bilbao', anchor: 'grupos de running en Bilbao', keyword: 'ciudad|grupos|encuentr' },
  { hub: 'encontrar-gente-para-correr.html', orphan: '/blog/grupos-running-malaga', anchor: 'grupos de running en Málaga', keyword: 'ciudad|grupos|encuentr' },
  { hub: 'encontrar-gente-para-correr.html', orphan: '/blog/grupos-running-valencia', anchor: 'grupos de running en Valencia', keyword: 'ciudad|grupos|encuentr' },
  { hub: 'encontrar-gente-para-correr.html', orphan: '/blog/grupos-running-zaragoza', anchor: 'grupos de running en Zaragoza', keyword: 'ciudad|grupos|encuentr' },

  // ===== FROM: mejores-zapatillas-running-asfalto (24 incoming) =====
  { hub: 'mejores-zapatillas-running-asfalto.html', orphan: '/blog/asics-gel-nimbus-26-vs-nike-pegasus-41', anchor: 'comparativa ASICS Nimbus 26 vs Nike Pegasus 41', keyword: 'ASICS|Nimbus|Pegasus|amortiguación' },
  { hub: 'mejores-zapatillas-running-asfalto.html', orphan: '/blog/zapatillas-running-pronadores', anchor: 'las mejores zapatillas para pronadores', keyword: 'pronador|pisada|estabilidad' },

  // ===== FROM: ropa-tecnica-running (23 incoming) =====
  { hub: 'ropa-tecnica-running.html', orphan: '/blog/gorras-running', anchor: 'las mejores gorras para running', keyword: 'gorra|cabeza|sol|sombrero' },
  { hub: 'ropa-tecnica-running.html', orphan: '/blog/mallas-running', anchor: 'las mejores mallas de running', keyword: 'malla|legging|pantalón|pierna' },

  // ===== FROM: mejores-apps-running (22 incoming) =====
  { hub: 'mejores-apps-running.html', orphan: '/blog/strava-vs-garmin-connect', anchor: 'comparativa Strava vs Garmin Connect', keyword: 'Strava|Garmin|plataforma|sincroniz' },

  // ===== FROM: mejores-auriculares-running (11 incoming) =====
  { hub: 'mejores-auriculares-running.html', orphan: '/blog/auriculares-running-natacion', anchor: 'auriculares waterproof para running y natación', keyword: 'agua|waterproof|natación|resistente' },
  { hub: 'mejores-auriculares-running.html', orphan: '/blog/jbl-reflect-flow-pro-review', anchor: 'review del JBL Reflect Flow Pro', keyword: 'JBL|ANC|cancelación|premium' },
  { hub: 'mejores-auriculares-running.html', orphan: '/blog/mejores-auriculares-baratos-running', anchor: 'auriculares baratos para running', keyword: 'precio|barato|económic|presupuesto' },

  // ===== FROM: mejores-suplementos-runners (12 incoming) =====
  { hub: 'mejores-suplementos-runners.html', orphan: '/blog/cafeina-running-rendimiento', anchor: 'cafeína para mejorar el rendimiento corriendo', keyword: 'cafeína|café|estimulante' },
  { hub: 'mejores-suplementos-runners.html', orphan: '/blog/mejores-bcaas-runners', anchor: 'los mejores BCAAs para runners', keyword: 'aminoácido|BCAA|recuperación' },
  { hub: 'mejores-suplementos-runners.html', orphan: '/blog/mejores-colagenos-runners', anchor: 'los mejores colágenos para corredores', keyword: 'colágeno|articulación|tendón' },
  { hub: 'mejores-suplementos-runners.html', orphan: '/blog/mejores-proteinas-running', anchor: 'las mejores proteínas para running', keyword: 'proteín|whey|suero' },

  // ===== FROM: hidratacion-running-guia-completa (10 incoming) =====
  { hub: 'hidratacion-running-guia-completa.html', orphan: '/blog/mejores-bebidas-hidratacion-running', anchor: 'las mejores bebidas de hidratación para running', keyword: 'bebida|isotónic|electrolito' },
  { hub: 'hidratacion-running-guia-completa.html', orphan: '/blog/bidones-running', anchor: 'los mejores bidones para running', keyword: 'bidón|botella|agua|llevar' },
  { hub: 'hidratacion-running-guia-completa.html', orphan: '/blog/soft-flasks-running', anchor: 'las mejores soft flasks', keyword: 'flask|blanda|chaleco|mochila' },

  // ===== FROM: mejores-relojes-gps-running (8 incoming) =====
  { hub: 'mejores-relojes-gps-running.html', orphan: '/blog/garmin-venu-3-review', anchor: 'review del Garmin Venu 3', keyword: 'Venu|smartwatch|Garmin' },
  { hub: 'mejores-relojes-gps-running.html', orphan: '/blog/mejores-garmin-running', anchor: 'los mejores Garmin para running', keyword: 'Garmin|gama|modelo' },

  // ===== FROM: empezar-trail-running (12 incoming) =====
  { hub: 'empezar-trail-running.html', orphan: '/blog/mochilas-trail-running', anchor: 'las mejores mochilas de trail running', keyword: 'mochila|chaleco|hidrat|llevar' },
  { hub: 'empezar-trail-running.html', orphan: '/blog/mejores-bastones-trail-running', anchor: 'los mejores bastones de trail', keyword: 'bastón|bastones|poles|subida' },
  { hub: 'empezar-trail-running.html', orphan: '/blog/salomon-speedcross-6-vs-hoka-speedgoat-6', anchor: 'Salomon Speedcross 6 vs Hoka Speedgoat 6', keyword: 'zapatilla|trail|Salomon|Hoka' },

  // ===== FROM: como-elegir-reloj-gps-running (17 incoming) =====
  { hub: 'como-elegir-reloj-gps-running.html', orphan: '/blog/strava-vs-garmin-connect', anchor: 'Strava vs Garmin Connect', keyword: 'app|plataforma|sincron|datos' },

  // ===== FROM: entrenamiento-por-zonas-running (13 incoming) =====
  { hub: 'entrenamiento-por-zonas-running.html', orphan: '/blog/equipamiento/mejores-bandas-frecuencia-cardiaca-running/', anchor: 'las mejores bandas de frecuencia cardíaca', keyword: 'banda|pulsómetro|pecho|frecuencia' },

  // ===== FROM: errores-comunes-corredores (21 incoming) =====
  { hub: 'errores-comunes-corredores.html', orphan: '/blog/calambres-al-correr', anchor: 'calambres al correr: causas y soluciones', keyword: 'calambre|lesión|dolor' },
  { hub: 'errores-comunes-corredores.html', orphan: '/blog/correr-y-gimnasio-mismo-dia', anchor: 'combinar running y gimnasio el mismo día', keyword: 'descanso|sobreentrenamiento|recuper' },

  // ===== FROM: motivacion-para-correr =====
  { hub: 'motivacion-para-correr.html', orphan: '/blog/correr-con-musica-beneficios', anchor: 'beneficios de correr con música', keyword: 'música|ritmo|ánimo|motivación' },

  // ===== FROM: hyrox-principiantes-guia =====
  { hub: 'hyrox-principiantes-guia.html', orphan: '/blog/mejores-calleras-crossfit', anchor: 'las mejores calleras para CrossFit y HYROX', keyword: 'callera|grip|agarre|mano' },
];

let linksAdded = 0;
let filesModified = 0;
const errors = [];

LINK_MAP.forEach(({ hub, orphan, anchor, keyword }) => {
  const hubPath = path.join(blogDir, hub);
  if (!fs.existsSync(hubPath)) {
    errors.push(`Hub not found: ${hub}`);
    return;
  }

  let html = fs.readFileSync(hubPath, 'utf8');

  // Check if link already exists
  if (html.includes(orphan)) {
    return; // Link already exists
  }

  // Build the link HTML
  const linkHtml = `<a href="${BASE}${orphan}">${anchor}</a>`;

  // Strategy: Find a paragraph containing the keyword and append the link as a sentence
  const keywordPatterns = keyword.split('|');
  const contentMatch = html.match(/<div class="content"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="related"|<div class="cta-box"|<footer)/);

  if (!contentMatch) {
    // Fallback: find any <p> with the keyword
    let inserted = false;
    for (const kw of keywordPatterns) {
      // Find a <p> that contains the keyword (case insensitive)
      const regex = new RegExp(`(<p[^>]*>[^<]*${kw}[^<]*)(</p>)`, 'i');
      const pMatch = html.match(regex);
      if (pMatch) {
        // Append link sentence before closing </p>
        const insertText = ` Descubre más sobre <strong>${linkHtml}</strong>.`;
        html = html.replace(pMatch[0], pMatch[1] + insertText + pMatch[2]);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      // Last resort: add before the cta-box
      const ctaIdx = html.lastIndexOf('<div class="cta-box"');
      if (ctaIdx > -1) {
        const linkBlock = `\n<p style="margin:20px 0">👉 Te puede interesar: <strong>${linkHtml}</strong></p>\n`;
        html = html.substring(0, ctaIdx) + linkBlock + html.substring(ctaIdx);
        inserted = true;
      }
    }

    if (!inserted) {
      errors.push(`Could not insert link in ${hub} → ${orphan}`);
      return;
    }
  } else {
    // Within .content div, find paragraph with keyword
    let inserted = false;
    for (const kw of keywordPatterns) {
      const regex = new RegExp(`(<p[^>]*>[^<]*${kw}[^<]*)(</p>)`, 'i');
      const pMatch = html.match(regex);
      if (pMatch && !pMatch[0].includes(orphan)) {
        const insertText = ` Descubre más sobre <strong>${linkHtml}</strong>.`;
        html = html.replace(pMatch[0], pMatch[1] + insertText + pMatch[2]);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      // Add before last cta-box
      const ctaIdx = html.lastIndexOf('<div class="cta-box"');
      if (ctaIdx > -1) {
        const linkBlock = `\n<p style="margin:20px 0">👉 Te puede interesar: <strong>${linkHtml}</strong></p>\n`;
        html = html.substring(0, ctaIdx) + linkBlock + html.substring(ctaIdx);
        inserted = true;
      }
    }

    if (!inserted) {
      errors.push(`Could not insert link in ${hub} → ${orphan}`);
      return;
    }
  }

  if (!DRY_RUN) {
    fs.writeFileSync(hubPath, html, 'utf8');
  }
  linksAdded++;
});

// Count unique hub files modified
const uniqueHubs = new Set(LINK_MAP.map(l => l.hub));
// Re-scan to see how many actually changed
if (!DRY_RUN) {
  uniqueHubs.forEach(hub => {
    filesModified++;
  });
}

console.log(`\n✅ fix-internal-links.cjs complete`);
console.log(`   Links added: ${linksAdded}`);
console.log(`   Hub files touched: ${uniqueHubs.size}`);
console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLIED'}`);
if (errors.length > 0) {
  console.log(`\n⚠️  Errors (${errors.length}):`);
  errors.forEach(e => console.log(`   - ${e}`));
}
