/**
 * Rasterizes the two poster HTMLs to PNGs at their native sizes
 * using Playwright Chromium.
 */
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    const jobs = [
      { html: 'poster-story.html',  png: 'poster-story-1080x1920.png',  w: 1080, h: 1920 },
      { html: 'poster-square.html', png: 'poster-square-1080x1080.png', w: 1080, h: 1080 },
    ];
    for (const j of jobs) {
      const ctx = await browser.newContext({
        viewport: { width: j.w, height: j.h },
        deviceScaleFactor: 2, // retina-quality output for sharp typography
      });
      const page = await ctx.newPage();
      const fileUrl = 'file:///' + path.resolve(__dirname, j.html).replace(/\\/g, '/');
      await page.goto(fileUrl, { waitUntil: 'networkidle' });
      // Ensure web fonts have fully loaded before capturing
      await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
      await page.waitForTimeout(400);
      const out = path.resolve(__dirname, j.png);
      await page.locator('.canvas').screenshot({ path: out, omitBackground: false });
      console.log('✓', j.png, `(${j.w}x${j.h} @2x)`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
