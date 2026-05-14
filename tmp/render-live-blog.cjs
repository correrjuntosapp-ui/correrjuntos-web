const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  // Network idle to ensure cro.js has time to inject if it does
  await page.goto('https://www.correrjuntos.com/blog/grupos-running-torre-del-mar-correr-sin-limites?bust=' + Date.now(), {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  await page.waitForTimeout(2500);
  // Full page screenshot
  await page.screenshot({ path: 'tmp/blog-live-full.png', fullPage: true });
  // Map area screenshot
  try {
    const map = page.locator('.map-card').first();
    await map.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await map.screenshot({ path: 'tmp/blog-live-map.png' });
    console.log('Saved map crop');
  } catch(e) { console.log('Map not found:', e.message); }
  console.log('Saved blog-live-full.png');
  await browser.close();
})();
