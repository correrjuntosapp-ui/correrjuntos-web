/**
 * render-carrusel.cjs — Rasterizes the 6 slides of the carousel to PNGs
 * at 1080x1350 (Instagram carousel portrait 4:5) @2x.
 */
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
    const fileUrl = 'file:///' + path.resolve(__dirname, 'carrusel-errores.html').replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
    await page.waitForTimeout(500);

    const slides = [
      { id: 'slide1', name: 'slide-1-cover' },
      { id: 'slide2', name: 'slide-2-error-01' },
      { id: 'slide3', name: 'slide-3-error-02' },
      { id: 'slide4', name: 'slide-4-error-03' },
      { id: 'slide5', name: 'slide-5-error-04' },
      { id: 'slide6', name: 'slide-6-cta' },
    ];

    for (const s of slides) {
      const el = page.locator(`#${s.id}`);
      const out = path.resolve(__dirname, `${s.name}.png`);
      await el.screenshot({ path: out, omitBackground: false });
      console.log('✓', `${s.name}.png`, '(1080x1350 @2x)');
    }

    await ctx.close();
  } finally {
    await browser.close();
  }
})();
