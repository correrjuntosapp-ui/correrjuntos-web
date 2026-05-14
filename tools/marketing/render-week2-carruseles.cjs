// Render 4 carruseles semana próxima: Huelva, Coach José, 6 razones grupo, primera 5K
// Uso: node tools/marketing/render-week2-carruseles.cjs

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch();
  const baseDir = __dirname;

  const formats = [
    { name: 'tiktok', width: 1080, height: 1920 },
    { name: 'instagram', width: 1080, height: 1350 },
  ];

  const carruseles = [
    {
      folder: 'carrusel-quedada-huelva',
      slides: ['slide-1-hook', 'slide-2-detalles', 'slide-3-quien', 'slide-4-mapa', 'slide-5-cta'],
    },
    {
      folder: 'carrusel-metodo-coach',
      slides: ['slide-1-hook', 'slide-2-input', 'slide-3-process', 'slide-4-output', 'slide-5-chat', 'slide-6-cta'],
    },
    {
      folder: 'carrusel-6-razones-grupo',
      slides: ['slide-1-hook', 'slide-2-razones1-3', 'slide-3-razones4-6', 'slide-4-cta'],
    },
    {
      folder: 'carrusel-primera-5k',
      slides: ['slide-1-hook', 'slide-2-equipamiento', 'slide-3-plan6sem', 'slide-4-nutricion', 'slide-5-dia-d', 'slide-6-cta'],
    },
  ];

  for (const car of carruseles) {
    console.log(`\n=== Carrusel: ${car.folder} ===`);
    for (const fmt of formats) {
      const outDir = path.resolve(baseDir, car.folder, 'png', fmt.name);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      console.log(`  Format: ${fmt.name} (${fmt.width}x${fmt.height})`);

      for (const name of car.slides) {
        const inputPath = path.join(baseDir, car.folder, `${name}.html`);
        const outputPath = path.join(outDir, `${name}.png`);
        if (!fs.existsSync(inputPath)) { console.log(`    SKIP ${name}.html`); continue; }

        const page = await browser.newPage();
        await page.setViewportSize({ width: fmt.width, height: fmt.height });
        await page.goto(pathToFileURL(inputPath).href, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
        await page.close();

        const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
        console.log(`    OK ${name}.png  ${sizeKB} KB`);
      }
    }
  }

  await browser.close();
  console.log('\nDone. 4 carruseles semana próxima · 2 formatos cada uno');
})();
