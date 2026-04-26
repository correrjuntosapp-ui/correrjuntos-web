#!/usr/bin/env node
/**
 * Generate Instagram carousel (5 slides) for CorrerJuntos
 *
 * Usage:
 *   node tools/instagram-content/generate-carousel.cjs --theme planes
 *   node tools/instagram-content/generate-carousel.cjs --theme coach-ia
 *   node tools/instagram-content/generate-carousel.cjs --theme quedadas
 *   node tools/instagram-content/generate-carousel.cjs --theme gps-audio
 *   node tools/instagram-content/generate-carousel.cjs --theme transformacion
 *   node tools/instagram-content/generate-carousel.cjs --theme blog-tips
 *
 * Output:
 *   tools/instagram-content/output/YYYY-MM-DD-{theme}/
 *     slide-1.png .. slide-5.png  (1080x1350 PNG each)
 *     caption.txt
 *     hashtags.txt
 *     instructions.md
 */
const fs = require('fs');
const path = require('path');

// Parse args
const args = process.argv.slice(2);
const themeIdx = args.indexOf('--theme');
if (themeIdx === -1 || !args[themeIdx + 1]) {
  console.error('Usage: node generate-carousel.cjs --theme <name>');
  console.error('Available themes: planes, coach-ia, quedadas, gps-audio, transformacion, blog-tips');
  process.exit(1);
}
const themeName = args[themeIdx + 1];

const ROOT = path.resolve(__dirname);
const themePath = path.join(ROOT, 'themes', `${themeName}.json`);
if (!fs.existsSync(themePath)) {
  console.error(`Theme not found: ${themePath}`);
  process.exit(1);
}

const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
const templateHTML = fs.readFileSync(path.join(ROOT, 'templates', 'slide.html'), 'utf8');

// === Build slide HTML by type ===
function buildSlideHTML(slide, pageNum, topicLabel) {
  let content = '';

  if (slide.type === 'hook' || slide.type === 'cta') {
    content = `
      ${slide.eyebrow ? `<div class="eyebrow">${escapeHtml(slide.eyebrow)}</div>` : ''}
      <h1 class="headline" ${!slide.eyebrow ? 'style="margin-top:auto"' : ''}>${escapeHtml(slide.headline || '')}<br><span class="ember">${escapeHtml(slide.headline_em || '')}</span></h1>
      ${slide.subline ? `<p class="subline">${escapeHtml(slide.subline)}</p>` : ''}
    `;
    if (slide.type === 'hook' && slide.stat_label) {
      content += `
        <div class="stat-box">
          <span class="stat-label">${escapeHtml(slide.stat_label)}</span>
          <span class="stat-value">${escapeHtml(slide.stat_value)}</span>
        </div>
      `;
    }
    if (slide.type === 'cta') {
      content += `
        <div class="stores">
          <a class="store">
            <svg viewBox="0 0 24 24" fill="#f6f1e8" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <div class="meta"><span class="small">Descargar en</span><span class="big">App Store</span></div>
          </a>
          <a class="store">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg>
            <div class="meta"><span class="small">Disponible en</span><span class="big">Google Play</span></div>
          </a>
        </div>
      `;
    }
  } else if (slide.type === 'feature') {
    content = `
      <div class="eyebrow">${escapeHtml(slide.eyebrow || '')}</div>
      <h2 class="title">${escapeHtml(slide.title || '')}</h2>
      <p class="subtitle">${escapeHtml(slide.subtitle || '')}</p>
      <div class="bullets">
        ${(slide.bullets || []).map(b => `<div class="bullet">${escapeHtml(b)}</div>`).join('\n')}
      </div>
    `;
  }

  return templateHTML
    .replace('__TOPIC_LABEL__', escapeHtml(topicLabel))
    .replace('__PAGE_NUM__', String(pageNum).padStart(2, '0'))
    .replace('__SLIDE_TYPE__', slide.type)
    .replace('__SLIDE_CONTENT__', content);
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// === Render with Puppeteer ===
async function renderSlides() {
  const puppeteer = require('puppeteer-core');

  // Find Chrome on Windows (most common path)
  const candidatePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH,
  ].filter(Boolean);

  let executablePath = candidatePaths.find(p => fs.existsSync(p));
  if (!executablePath) {
    console.error('Chrome no encontrado. Define CHROME_PATH env var o instala Chrome.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

  // Output dir
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.join(ROOT, 'output', `${today}-${theme.id}`);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n🎨 Generando carrusel: ${theme.id}`);
  console.log(`📁 Output: ${outDir}\n`);

  // Render each slide
  for (let i = 0; i < theme.slides.length; i++) {
    const slide = theme.slides[i];
    const html = buildSlideHTML(slide, i + 1, theme.topic_label);

    await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
    // Wait for fonts to be ready
    await page.evaluate(() => document.fonts.ready);
    // Small extra wait to ensure rendering settles
    await new Promise(r => setTimeout(r, 500));

    const filename = path.join(outDir, `slide-${i + 1}.png`);
    await page.screenshot({
      path: filename,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
    });
    console.log(`  ✓ slide-${i + 1}.png  (${slide.type})`);
  }

  await browser.close();

  // Write caption.txt
  fs.writeFileSync(path.join(outDir, 'caption.txt'), theme.caption, 'utf8');
  console.log(`  ✓ caption.txt`);

  // Write hashtags.txt
  fs.writeFileSync(path.join(outDir, 'hashtags.txt'), theme.hashtags, 'utf8');
  console.log(`  ✓ hashtags.txt`);

  // Write instructions
  const instructions = `# Instrucciones publicación Instagram — ${theme.id}

Generado: ${new Date().toISOString()}

## Pasos rápidos (60 segundos)

1. Abre Instagram → botón "+" → "Publicación"
2. Selecciona los 5 slides EN ORDEN: slide-1.png → slide-5.png
3. Pulsa "Siguiente" (sin filtros)
4. **Pega el caption** (archivo: caption.txt)
5. **Añade los hashtags** al final (archivo: hashtags.txt)
6. Ubicación: tu ciudad (opcional pero ayuda alcance local)
7. Etiqueta: @correrjuntosapp (cuando esté creada)
8. Publicar

## Mejor hora para publicar (España)

- Lunes-Viernes: 7-9h o 19-21h
- Sábado-Domingo: 10-12h

## Tip extra

Si publicas pasadas 3 horas de la "mejor hora", baja alcance.
Programa con Meta Business Suite si vas a salir a correr.

---
Carrusel: ${theme.topic_label}
Slides: ${theme.slides.length}
Tema id: ${theme.id}
`;
  fs.writeFileSync(path.join(outDir, 'instructions.md'), instructions, 'utf8');
  console.log(`  ✓ instructions.md`);

  console.log(`\n✅ Listo. ${theme.slides.length} slides + caption + hashtags en:`);
  console.log(`   ${outDir}\n`);
  console.log(`Subir a Instagram: 60 segundos manuales.\n`);
}

renderSlides().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
