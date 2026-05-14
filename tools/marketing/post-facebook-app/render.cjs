const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch();
  const baseDir = __dirname;
  const outDir = path.resolve(baseDir, 'png');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const formats = [
    { name: 'fb-ig', width: 1080, height: 1350 },
    { name: 'fb-square', width: 1080, height: 1080 },
  ];

  for (const fmt of formats) {
    const fmtDir = path.resolve(outDir, fmt.name);
    if (!fs.existsSync(fmtDir)) fs.mkdirSync(fmtDir, { recursive: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: fmt.width, height: fmt.height });
    await page.goto(pathToFileURL(path.join(baseDir, 'slide-features.html')).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const outputPath = path.join(fmtDir, 'slide-features.png');
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    await page.close();
    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`OK ${fmt.name}/slide-features.png  ${sizeKB} KB`);
  }

  await browser.close();
})();
