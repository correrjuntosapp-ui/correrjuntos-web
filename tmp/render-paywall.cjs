const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const html = path.resolve(__dirname, 'paywall-preview.html');
  const out  = path.resolve(__dirname, 'paywall-preview.png');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 540, height: 1500 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('file:///' + html.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`✓ ${out}`);
  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
