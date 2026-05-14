const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 480, height: 600 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('file:///' + path.resolve(__dirname, 'feed-card-standalone.html').replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve(__dirname, 'feed-card-zoom.png'), fullPage: true });
  await ctx.close();
  await browser.close();
  console.log('✓ done');
})();
