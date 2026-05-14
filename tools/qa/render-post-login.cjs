/**
 * Render post-login mockup to PNG (iPhone 14 size: 390x844)
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

  const filePath = 'file://' + path.resolve(__dirname, 'post-login-mockup.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 500));

  const out = path.resolve(__dirname, 'post-login-preview.png');
  await page.screenshot({ path: out, fullPage: false, clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log('Saved:', out);

  await browser.close();
})();
