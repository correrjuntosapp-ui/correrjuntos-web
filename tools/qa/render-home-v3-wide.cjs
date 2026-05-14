const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    // Render a wide desktop-friendly version: 2 side-by-side phone views
    // Top half on the left, bottom half on the right.
    const html = `
<!doctype html>
<html><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1a1a; font-family: -apple-system, sans-serif; color: #fff; padding: 40px; }
  .wrap { display: flex; gap: 30px; justify-content: center; align-items: flex-start; }
  .col { display: flex; flex-direction: column; align-items: center; }
  .label {
    font-size: 13px; text-transform: uppercase; letter-spacing: 2px;
    color: #f97316; font-weight: 700; margin-bottom: 16px;
  }
  .phone {
    width: 540px; border-radius: 32px; overflow: hidden;
    border: 8px solid #222;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  }
  img { display: block; width: 540px; height: auto; }
  .caption { font-size: 11px; color: #aaa; margin-top: 10px; }
</style>
</head><body>
<div class="wrap">
  <div class="col">
    <div class="label">◆ Parte superior</div>
    <div class="phone">
      <img src="home-v3-preview.png" style="margin-top: 0;">
    </div>
    <div class="caption">Header · Hero quedada · Streak · Primera actividad</div>
  </div>
  <div class="col">
    <div class="label">◆ Parte inferior</div>
    <div class="phone">
      <div style="width: 540px; height: 1100px; overflow: hidden; position: relative;">
        <img src="home-v3-preview.png" style="position: absolute; top: -1050px;">
      </div>
    </div>
    <div class="caption">Cards Luis · Carmen · Quedadas cerca</div>
  </div>
</div>
</body></html>`;

    const wrapHtmlPath = path.resolve(__dirname, 'home-v3-wide.html');
    require('fs').writeFileSync(wrapHtmlPath, html);

    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 1400 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto('file:///' + wrapHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const out = path.resolve(__dirname, 'home-v3-wide.png');
    await page.screenshot({ path: out, fullPage: false });
    console.log('✓ home-v3-wide.png (1280x1400 @2x desktop-friendly)');
    await ctx.close();
  } finally {
    await browser.close();
  }
})();
