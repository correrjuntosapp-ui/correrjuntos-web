/**
 * Render EventDetails Tier 1 mockup to PNG.
 * Uses full-page screenshot since the layout is taller than 844px.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const candidatePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH,
  ].filter(Boolean);
  const executablePath = candidatePaths.find(p => fs.existsSync(p));
  if (!executablePath) { console.error('Chrome not found'); process.exit(1); }

  const browser = await puppeteer.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  const filePath = 'file://' + path.resolve(__dirname, 'event-details-tier1-mockup.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 500));

  // Get full document height
  const fullHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 390, height: fullHeight, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 200));

  const out = path.resolve(__dirname, 'event-details-tier1-preview.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved:', out);
  console.log('Full height:', fullHeight, 'px');

  await browser.close();
})();
