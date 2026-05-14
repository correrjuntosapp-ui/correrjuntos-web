const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'planes-hero-preview.html');
  const outPng = path.resolve(__dirname, 'planes-hero-preview.png');

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1500 },
    deviceScaleFactor: 1.4,
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
