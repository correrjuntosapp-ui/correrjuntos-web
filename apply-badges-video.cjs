const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'equipamiento');
const files = [
  'zapatillas-running.html',
  'relojes-gps-running.html',
  'auriculares-running.html',
  'ropa-running.html',
  'geles-energeticos-running.html',
  'bebidas-hidratacion-running.html',
  'recuperadores-running.html',
  'accesorios-running.html'
];

const cssToAdd = `
/* Price history badge */
.price-badge{position:absolute;top:12px;right:12px;font-size:.6rem;font-weight:700;padding:3px 8px;border-radius:999px;text-transform:uppercase;letter-spacing:.3px;z-index:2}
.price-low{color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25)}
.price-drop{color:#3b82f6;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25)}

/* YouTube video embed */
.video-section{margin:32px 0;padding:24px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;text-align:center}
.video-section h3{font-size:1.1rem;margin-bottom:16px;color:#fff}
.video-placeholder{position:relative;width:100%;padding-bottom:56.25%;background:rgba(255,255,255,.03);border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}
.video-placeholder iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px}
`;

const videoSection = `<div class="video-section">
  <h3>\uD83C\uDFAC V\u00EDdeo: Nuestras Recomendaciones en 60 Segundos</h3>
  <div class="video-placeholder">
    <!-- YouTube video coming soon -->
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:#64748b">
      <span style="font-size:3rem;display:block;margin-bottom:8px">\u25B6\uFE0F</span>
      <span style="font-size:.85rem">V\u00EDdeo pr\u00F3ximamente</span>
    </div>
  </div>
</div>

`;

let processed = 0;
let errors = [];

files.forEach(file => {
  const filePath = path.join(dir, file);

  try {
    let html = fs.readFileSync(filePath, 'utf8');

    // TASK 1: Add CSS before </style>
    if (html.includes('.price-badge')) {
      console.log(`[SKIP CSS] ${file} - already has price-badge CSS`);
    } else {
      html = html.replace('</style>', cssToAdd + '</style>');
      console.log(`[CSS] ${file} - added price badge and video CSS`);
    }

    // TASK 2: Add price badges to products 1, 2, 3
    // For product #1
    if (html.includes('price-badge price-low')) {
      console.log(`[SKIP BADGE] ${file} - already has price badges`);
    } else {
      // Add badge after product-rank 1
      html = html.replace(
        '<div class="product-rank">1</div>',
        '<div class="product-rank">1</div>\n      <span class="price-badge price-low">\uD83D\uDCB0 Precio m\u00EDnimo</span>'
      );

      // Add badge after product-rank 2
      html = html.replace(
        '<div class="product-rank">2</div>',
        '<div class="product-rank">2</div>\n      <span class="price-badge price-drop">\uD83D\uDCC9 -15% vs PVP</span>'
      );

      // Add badge after product-rank 3
      html = html.replace(
        '<div class="product-rank">3</div>',
        '<div class="product-rank">3</div>\n      <span class="price-badge price-drop">\uD83D\uDCC9 -10% vs PVP</span>'
      );

      console.log(`[BADGES] ${file} - added price badges to products 1, 2, 3`);
    }

    // TASK 3: Add video section before FAQ
    if (html.includes('video-section')) {
      console.log(`[SKIP VIDEO] ${file} - already has video section`);
    } else {
      html = html.replace(
        '  <div class="faq" id="faq">',
        '  ' + videoSection + '  <div class="faq" id="faq">'
      );
      console.log(`[VIDEO] ${file} - added video section before FAQ`);
    }

    fs.writeFileSync(filePath, html, 'utf8');
    processed++;
    console.log(`[DONE] ${file} - saved successfully\n`);

  } catch (err) {
    errors.push({ file, error: err.message });
    console.error(`[ERROR] ${file}: ${err.message}`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Processed: ${processed}/${files.length}`);
if (errors.length) {
  console.log('Errors:', errors);
}
