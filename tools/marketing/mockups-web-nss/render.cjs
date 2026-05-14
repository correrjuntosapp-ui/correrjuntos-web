// Render mockups NSS web a PNG (1080x1920 vertical phone).
// Uso: node tools/marketing/mockups-web-nss/render.cjs

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch();
  const baseDir = __dirname;
  const outDir = path.resolve(baseDir, 'png');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const slides = [
    'mockup-1-hero',
    'mockup-2-crear',
    'mockup-3-spots',
    'mockup-4-medusas',
    'mockup-5-eventos',
  ];

  console.log('Renderizando mockups NSS 1080x1920...');
  for (const name of slides) {
    const inputPath  = path.join(baseDir, `${name}.html`);
    const outputPath = path.join(outDir, `${name}.png`);
    if (!fs.existsSync(inputPath)) { console.log(`  SKIP ${name}.html (no existe aún)`); continue; }

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    await page.close();

    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  OK ${name}.png  ${sizeKB} KB`);
  }

  await browser.close();
  console.log(`\nOutput: ${outDir}`);
})();
