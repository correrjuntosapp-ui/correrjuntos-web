const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1160, height: 1400 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    const fileUrl = 'file:///' + path.resolve(__dirname, 'post-feed-nuevo.html').replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
    await page.waitForTimeout(500);

    const el = page.locator('#post');
    const out = path.resolve(__dirname, 'post-feed-nuevo-1080x1350.png');
    await el.screenshot({ path: out, omitBackground: false });
    console.log('✓', 'post-feed-nuevo-1080x1350.png (1080x1350 @2x)');

    await ctx.close();
  } finally {
    await browser.close();
  }
})();
