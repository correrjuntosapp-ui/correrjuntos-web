// Render preview-adaptive-plans.html → 1500x1200 PNG
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'preview-adaptive-plans.html');
  const outPng = path.resolve(__dirname, 'adaptive-plans-preview.png');

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1500, height: 1200 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(300);

  await page.screenshot({ path: outPng, fullPage: true });
  console.log(`✓ ${outPng}`);

  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
