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

  const htmlPath = path.resolve(__dirname, 'reel-3-clubs-madrid.html');
  const url = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(300);

  const frames = [
    { t: 1700,  name: 'frame-clubs-01.png' },
    { t: 5300,  name: 'frame-clubs-02.png' },
    { t: 9300,  name: 'frame-clubs-03.png' },
    { t: 13300, name: 'frame-clubs-04.png' },
    { t: 16600, name: 'frame-clubs-05.png' },
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
