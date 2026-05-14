// Render 3 carruseles (errores, strava-vs-cj, comunidad)
// 2 formatos: TikTok (1080x1920) + Instagram (1080x1350)
// Uso: node tools/marketing/render-3-carruseles.cjs

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
      folder: 'carrusel-5-errores',
      slides: ['slide-1-hook', 'slide-2-error1', 'slide-3-error2', 'slide-4-error3', 'slide-5-error4y5', 'slide-6-cta'],
    },
    {
      folder: 'carrusel-strava-vs-cj',
      slides: ['slide-1-hook', 'slide-2-strava', 'slide-3-cj', 'slide-4-tabla', 'slide-5-cta'],
    },
    {
      folder: 'carrusel-comunidad',
      slides: ['slide-1-hook', 'slide-2-mapa', 'slide-3-quedadas', 'slide-4-perfil', 'slide-5-cta'],
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
  console.log('\nDone. 3 carruseles · 2 formatos cada uno');
})();
