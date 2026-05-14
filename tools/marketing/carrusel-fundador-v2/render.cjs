// Render carrusel v2 — versión Instagram (1080x1350) + TikTok (1080x1920).
// 5 slides cada formato = 10 PNG totales.
// Output: png/{tt,ig}/slide-N-NAME.png
// Uso: node tools/marketing/carrusel-fundador-v2/render.cjs

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch();
  const baseDir = __dirname;
  const ttDir = path.resolve(baseDir, 'png', 'tt');
  const igDir = path.resolve(baseDir, 'png', 'ig');
  if (!fs.existsSync(ttDir)) fs.mkdirSync(ttDir, { recursive: true });
  if (!fs.existsSync(igDir)) fs.mkdirSync(igDir, { recursive: true });

  const slides = [
    { name: 'slide-1-hook'     },
    { name: 'slide-2-pain'     },
    { name: 'slide-3-quedadas' },
    { name: 'slide-4-proof'    },
    { name: 'slide-5-cta'      },
  ];

  // ── TikTok / Reels (1080x1920) ──
  console.log('Renderizando TikTok 1080x1920...');
  for (const s of slides) {
    const inputPath  = path.join(baseDir, `${s.name}.html`);
    const outputPath = path.join(ttDir, `${s.name}.png`);
    if (!fs.existsSync(inputPath)) { console.log(`  SKIP ${s.name}.html`); continue; }
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    await page.close();
    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  OK tt/${s.name}.png  ${sizeKB} KB`);
  }

  // ── Instagram (1080x1350) ──
  console.log('Renderizando Instagram 1080x1350...');
  for (const s of slides) {
    const inputPath  = path.join(baseDir, `${s.name}-ig.html`);
    const outputPath = path.join(igDir, `${s.name}.png`);
    if (!fs.existsSync(inputPath)) { console.log(`  SKIP ${s.name}-ig.html`); continue; }
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1350 });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    await page.close();
    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  OK ig/${s.name}.png  ${sizeKB} KB`);
  }

  await browser.close();
  console.log('---');
  console.log(`Output: ${path.resolve(baseDir, 'png')}`);
  console.log('Subir tt/ a TikTok · Subir ig/ a Instagram.');
})();
