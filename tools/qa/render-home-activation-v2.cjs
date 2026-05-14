const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const candidatePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const exePath = candidatePaths.find(p => fs.existsSync(p));
  const browser = await puppeteer.launch({ executablePath: exePath, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  const fileUrl = 'file://' + path.resolve(__dirname, 'home-activation-mockup-v2.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 600));
  const fullH = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 390, height: fullH, deviceScaleFactor: 2, isMobile: true });
  await new Promise(r => setTimeout(r, 200));
  const out = path.resolve(__dirname, 'home-activation-v2-preview.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved:', out);
  await browser.close();
})();
