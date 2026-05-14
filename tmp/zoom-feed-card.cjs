const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'app-activation-redesign-mockup.html');
  const out = path.resolve(__dirname, 'feed-card-zoom.png');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 600, height: 1300 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(400);
  // Click into first feed-card area
  const card = page.locator('.feed-card').first();
  await card.screenshot({ path: out });
  console.log('✓ Saved', out);
  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
