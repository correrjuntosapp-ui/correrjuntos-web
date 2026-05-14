// Render carrusel "0→5K en 6 semanas" para TikTok + Instagram
// Uso: node tools/marketing/carrusel-0-5k/render.cjs

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch();
  const baseDir = __dirname;

  const formats = [
    { name: 'tiktok', width: 1080, height: 1920, dir: 'png/tiktok' },
    { name: 'instagram', width: 1080, height: 1350, dir: 'png/instagram' },
  ];

  const slides = [
    'slide-1-hook',
    'slide-2-method',
    'slide-3-week',
    'slide-4-proof',
    'slide-5-cta',
  ];

  console.log('Renderizando carrusel 0→5K...\n');

  for (const fmt of formats) {
    const outDir = path.resolve(baseDir, fmt.dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    console.log(`Format: ${fmt.name} (${fmt.width}x${fmt.height})`);

    for (const name of slides) {
      const inputPath = path.join(baseDir, `${name}.html`);
      const outputPath = path.join(outDir, `${name}.png`);
      if (!fs.existsSync(inputPath)) { console.log(`  SKIP ${name}.html`); continue; }

      const page = await browser.newPage();
      await page.setViewportSize({ width: fmt.width, height: fmt.height });
      await page.goto(pathToFileURL(inputPath).href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
      await page.close();

      const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`  OK ${name}.png  ${sizeKB} KB`);
    }
    console.log('');
  }

  await browser.close();
  console.log('Done. Outputs in:', path.resolve(baseDir, 'png'));
})();
