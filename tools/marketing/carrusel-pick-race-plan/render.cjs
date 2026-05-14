// Render carrusel-pick-race-plan — TikTok 1080x1920.
// 5 slides → 5 PNG en png/tt/.
// Uso: node tools/marketing/carrusel-pick-race-plan/render.cjs

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch();
  const baseDir = __dirname;
  const ttDir = path.resolve(baseDir, 'png', 'tt');
  if (!fs.existsSync(ttDir)) fs.mkdirSync(ttDir, { recursive: true });

  const slides = [
    { name: 'slide-1-hook' },
    { name: 'slide-2-problema' },
    { name: 'slide-3-flow' },
    { name: 'slide-4-stats' },
    { name: 'slide-5-cta' },
  ];

  console.log('Renderizando TikTok 1080x1920...');
  for (const s of slides) {
    const inputPath = path.join(baseDir, `${s.name}.html`);
    const outputPath = path.join(ttDir, `${s.name}.png`);
    if (!fs.existsSync(inputPath)) {
      console.log(`  SKIP ${s.name}.html (no existe)`);
      continue;
    }
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    await page.close();
    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  OK tt/${s.name}.png  ${sizeKB} KB`);
  }

  await browser.close();
  console.log('---');
  console.log(`Output: ${path.resolve(baseDir, 'png', 'tt')}`);
})();
