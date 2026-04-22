const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
  const p = await c.newPage();
  const file = 'file:///' + path.resolve('tools/lead-magnet/plan-10k-preview.html').replace(/\\/g, '/');
  await p.goto(file, { waitUntil: 'networkidle' });
  await p.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await p.waitForTimeout(500);
  // Cover (page 1) is at top
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: 'tools/lead-magnet/preview-p1.png' });
  // Page 3 (week 1) — page height is 297mm ≈ 1123px at 96dpi
  await p.evaluate(() => window.scrollTo(0, 1123 * 2));
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'tools/lead-magnet/preview-p3.png' });
  // Page 8 (final CTA)
  await p.evaluate(() => window.scrollTo(0, 1123 * 7));
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'tools/lead-magnet/preview-p8.png' });
  await b.close();
  console.log('✓ previews generated');
})();
