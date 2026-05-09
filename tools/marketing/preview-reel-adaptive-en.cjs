const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'reel-adaptive-plan-en.html');
  const outDir = path.resolve(__dirname, '.reel-adapt-en');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__capture = true; });
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(200);

  const peaks = [
    { n: '1-hook',     t: 1400 },
    { n: '2-prob',     t: 4600 },
    { n: '3-sol',      t: 8700 },
    { n: '4-fb',       t: 12700 },
    { n: '5-prom',     t: 15900 },
    { n: '6-cta',      t: 18400 },
  ];
  for (const f of peaks) {
    await page.evaluate((t) => window.renderAtTime(t), f.t);
    await page.locator('#stage').screenshot({ path: path.join(outDir, f.n + '.png') });
    console.log('ok', f.n);
  }
  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
