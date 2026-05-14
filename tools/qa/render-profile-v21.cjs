const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1080, height: 3800 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    const fileUrl = 'file:///' + path.resolve(__dirname, 'profile-v21-mockup.html').replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
    await page.waitForTimeout(800);
    const out = path.resolve(__dirname, 'profile-v21-preview.png');
    await page.locator('.canvas').screenshot({ path: out });
    console.log('✓ profile-v21-preview.png');
    await ctx.close();
  } finally {
    await browser.close();
  }
})();
