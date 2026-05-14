const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const htmlPath = path.resolve('tmp/blog-draft-correr-sin-limites.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const repoRoot = process.cwd().replace(/\\/g, '/');
  html = html.replace(/src="\/public\//g, 'src="file:///' + repoRoot + '/public/');
  const tmpFile = path.resolve('tmp/blog-draft-preview.html');
  fs.writeFileSync(tmpFile, html);
  await page.goto('file:///' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Scroll to mid-article to show sticky TOC + floating share
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tmp/blog-preview-desktop-mid.png', fullPage: false });
  console.log('Saved tmp/blog-preview-desktop-mid.png');
  await browser.close();
})();
