const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'app-activation-redesign-mockup.html');
  const out = path.resolve(__dirname, 'app-activation-redesign-preview.png');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 2250, height: 1100 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, fullPage: true });
  console.log('✓ Saved', out);
  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
