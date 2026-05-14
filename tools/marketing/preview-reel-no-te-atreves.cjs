const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__capture = true; });

  const htmlPath = path.resolve(__dirname, 'reel-no-te-atreves.html');
  const url = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(300);

  const frames = [
    { t: 1700,  name: 'frame-01-hook.png' },
    { t: 5000,  name: 'frame-02-problem.png' },
    { t: 8900,  name: 'frame-03-stats.png' },
    { t: 12800, name: 'frame-04-quote.png' },
    { t: 16200, name: 'frame-05-grupo.png' },
    { t: 18800, name: 'frame-06-cta.png' },
  ];

  for (const { t, name } of frames) {
    await page.evaluate((ms) => window.renderAtTime(ms), t);
    await page.locator('#stage').screenshot({
      path: path.resolve(__dirname, name),
    });
    console.log('saved', name);
  }

  await ctx.close();
  await browser.close();
})();
