/**
 * Render the live quedada landing page (production) to PNG
 * for design verification.
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

  // iPhone viewport for realistic mobile preview
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const url = 'https://www.correrjuntos.com/quedada/76ee875c-1174-4105-9338-2b4c3cdebb5c?nocache=' + Date.now();
  console.log('Loading:', url);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));

  // Get full document height
  const fullHeight = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  await page.setViewport({ width: 390, height: fullHeight, deviceScaleFactor: 2, isMobile: true });
  await new Promise(r => setTimeout(r, 300));

  const out = path.resolve(__dirname, 'quedada-landing-live.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved:', out);
  console.log('Page height:', fullHeight, 'px');

  await browser.close();
})();
