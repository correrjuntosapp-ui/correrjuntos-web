/**
 * Render flow preview — 4 phones side by side
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
  await page.setViewport({ width: 1920, height: 1200, deviceScaleFactor: 1.5 });

  const filePath = 'file://' + path.resolve(__dirname, 'flow-preview.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  const out = path.resolve(__dirname, 'flow-preview.png');
  // Get full canvas height
  const height = await page.evaluate(() => document.querySelector('.canvas').scrollHeight);
  await page.setViewport({ width: 1920, height: height + 60, deviceScaleFactor: 1.5 });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved:', out);

  await browser.close();
})();
