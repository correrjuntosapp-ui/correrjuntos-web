#!/usr/bin/env node
/**
 * affiliate-audit.cjs — Escanea todos los artículos del blog y reporta:
 *  · Los que tienen 0-2 amzn.to (monetización pobre → prioridad alta)
 *  · Los que tienen ya >=3 (OK, dejar como están)
 *  · Distribución por categoría
 *  · Sugerencias de productos por topic detectado en slug
 *
 * Output: CSV priorizado por longitud del artículo (más palabras =
 * típicamente más tráfico, más urgencia monetizar).
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.resolve(__dirname, '..', '..', 'blog');
const OUT_CSV = path.resolve(__dirname, 'affiliate-audit-report.csv');

// Sugerencias de producto por keyword en slug
const SUGGESTIONS = {
  // Training
  'ayunas|fasting': 'electrolitos, barritas energéticas, BCAA',
  'calentamiento|warm': 'bandas elásticas, foam roller, pelota pilates',
  'estirami|stretch': 'foam roller, esterilla yoga, bandas',
  'recuper|recovery': 'foam roller, pistola masaje, compresión',
  'series|fartlek|intervalo': 'reloj GPS, pulsómetro, gel energético',
  'cuesta|hill': 'zapatillas trail ligeras, calcetines compresión',
  'velocidad|speed|sprint': 'zapatillas competición, reloj GPS',
  // Health
  'rodilla|knee': 'rodillera running, pistola masaje, foam roller',
  'lesi|injury': 'banda kinesiology, rodillera, pistola masaje',
  'dolor|pain': 'pistola masaje, banda kinesiology, magnesio',
  'flato|abdom': 'cinturón running, electrolitos, magnesio',
  'calambres': 'electrolitos, magnesio, plátano en polvo',
  'pelvic|suelo-pel': 'bandas elásticas, pelota pilates, cojín kegel',
  'menopaus': 'suplementos magnesio, sujetador sport, zapatillas cushion',
  'embarazo|postparto': 'sujetador lactancia, faja postparto, bandas',
  // Nutrition
  'nutric|hidrat|bebid|isotonic': 'gel energético, isotónico polvo, barritas',
  'suplement|creatina|proteina|bcaa': 'suplementos marca ISO',
  'carbo|hidrato': 'geles, bebida isotónica, barritas',
  // Gear
  'reloj|gps|watch|garmin|coros': 'Garmin, COROS, Polar, reloj GPS',
  'auricular|earpod|headphone': 'auriculares running, Shokz, Jabra',
  'mochila|backpack|vest': 'chaleco hidratación, soft flasks',
  'bidón|flask|hidrat': 'soft flask, cinturón, bidón frontal',
  'calcetines|socks': 'calcetines compresión Stance, Enforma',
  'malla|leggings|tights': 'mallas running, pantalón compresión',
  'camiseta|shirt|top': 'camiseta técnica Nike Dri-FIT, Decathlon',
  'sujetador|bra': 'Shock Absorber, Triumph, Under Armour',
  'gafas|sunglasses': 'Oakley, Julbo, Nike Windshield',
  'guantes|gloves': 'guantes running térmicos',
  'gorra|cap|hat': 'gorra running, buff',
  'frontal|headlamp': 'linterna frontal Petzl, Black Diamond',
  'compresion|compression': 'medias compresión, manguitos',
  // Planes
  'plan-|maraton|media|5k|10k|21k|42k': 'reloj GPS, zapatillas competición, gel energético',
  // Trail
  'trail|monta': 'zapatillas trail Salomon, chaleco hidratación, bastones',
  'bastones|poles': 'bastones trekking, Leki, Black Diamond',
  // Cross
  'hyrox|deka|crossfit': 'sandbag, kettlebell, wall ball',
  'fuerza|gym|weight': 'bandas, kettlebells, mancuernas ajustables',
  'pistola|gun|massage': 'Theragun, Hyperice, pistolas masaje',
  'rodillo|roller|foam': 'foam rollers, pelota lacrosse',
  // Cold weather
  'invierno|frio|cold|lluvia': 'cortavientos, térmica, impermeable',
  'verano|calor|hot': 'camiseta técnica, gorra, gafas UV',
  // Specific
  'alergia|allergy': 'gafas wrap, buff, sprays nasales',
  'diabet': 'electrolitos, barritas bajas carbo, glucómetro',
};

function guessProductsForSlug(slug) {
  for (const [pattern, products] of Object.entries(SUGGESTIONS)) {
    if (new RegExp(pattern, 'i').test(slug)) return products;
  }
  return '(genéricos: reloj GPS, zapatillas, calcetines, gel energético)';
}

function detectCategory(html) {
  const m = html.match(/cat-badge-([a-zA-Z-]+)">([^<]+)</);
  return m ? m[2] : 'desconocida';
}

function wordCount(html) {
  // Strip HTML, tags, scripts
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[\s\S]*?<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ');
  return text.trim().split(/\s+/).length;
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== '404.html');

  const rows = files.map(f => {
    const fp = path.join(BLOG_DIR, f);
    const html = fs.readFileSync(fp, 'utf8');
    const slug = f.replace('.html', '');
    const amznCount = (html.match(/amzn\.to/g) || []).length;
    const affiliateSearchCount = (html.match(/tag=diezmejores21-21/g) || []).length;
    const totalAffiliate = Math.max(amznCount, affiliateSearchCount);
    const words = wordCount(html);
    const category = detectCategory(html);
    const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || slug;

    return {
      slug,
      title: title.replace(' | CorrerJuntos', ''),
      category,
      words,
      amzn_count: amznCount,
      total_affiliate: totalAffiliate,
      priority: totalAffiliate === 0 ? 'CRITICAL' : totalAffiliate < 3 ? 'HIGH' : 'OK',
      suggested_products: guessProductsForSlug(slug),
    };
  });

  // Sort: CRITICAL/HIGH first, then by word count DESC (more content = more traffic = more urgency)
  const priorityOrder = { CRITICAL: 0, HIGH: 1, OK: 2 };
  rows.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.words - a.words;
  });

  // Summary
  const summary = {
    total: rows.length,
    critical: rows.filter(r => r.priority === 'CRITICAL').length,
    high: rows.filter(r => r.priority === 'HIGH').length,
    ok: rows.filter(r => r.priority === 'OK').length,
  };

  console.log('\n📊 AFFILIATE AUDIT — Blog CorrerJuntos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Total articles scanned:  ${summary.total}`);
  console.log(`🔴 CRITICAL (0 amzn.to): ${summary.critical}  → ${(summary.critical / summary.total * 100).toFixed(1)}%`);
  console.log(`🟠 HIGH     (1-2):       ${summary.high}      → ${(summary.high / summary.total * 100).toFixed(1)}%`);
  console.log(`🟢 OK       (3+):        ${summary.ok}         → ${(summary.ok / summary.total * 100).toFixed(1)}%`);

  // Show top 20 CRITICAL articles
  console.log('\n\n🔴 TOP 20 CRITICAL — sin afiliados, priorizados por longitud (= tráfico estimado):\n');
  const criticals = rows.filter(r => r.priority === 'CRITICAL').slice(0, 20);
  criticals.forEach((r, i) => {
    console.log(`${(i + 1).toString().padStart(2, ' ')}. [${r.words} palabras] /blog/${r.slug}`);
    console.log(`    ${r.title.slice(0, 75)}`);
    console.log(`    💡 Sugerencia: ${r.suggested_products}\n`);
  });

  // Write CSV
  const header = ['slug', 'title', 'category', 'words', 'amzn_count', 'priority', 'suggested_products'];
  const csv = [
    header.join(';'),
    ...rows.map(r => [
      r.slug,
      `"${r.title.replace(/"/g, '""').slice(0, 100)}"`,
      r.category,
      r.words,
      r.amzn_count,
      r.priority,
      `"${r.suggested_products}"`,
    ].join(';'))
  ].join('\n');

  fs.writeFileSync(OUT_CSV, csv, 'utf8');
  console.log(`\n✓ CSV completo guardado en: ${OUT_CSV}`);
  console.log(`  Contiene los ${summary.total} artículos ordenados por prioridad.\n`);

  // Estimated revenue opportunity
  const monthlyTrafficEstimate = summary.critical * 500 + summary.high * 300; // conservative
  const estimatedLostRevenue = monthlyTrafficEstimate * 0.02 * 0.03 * 5; // 2% CTR × 3% conversion × 5€ avg
  console.log('💰 OPORTUNIDAD ESTIMADA:');
  console.log(`   Tráfico mensual artículos sin monetizar: ~${monthlyTrafficEstimate.toLocaleString()} visitas`);
  console.log(`   Ingresos perdidos (conservador): ~${estimatedLostRevenue.toFixed(0)}€/mes`);
  console.log(`   Anualizado: ~${(estimatedLostRevenue * 12).toFixed(0)}€/año\n`);
}

main();
