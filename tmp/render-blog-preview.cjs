const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
  const htmlPath = path.resolve('tmp/blog-draft-correr-sin-limites.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const repoRoot = process.cwd().replace(/\\/g, '/');
  html = html.replace(/src="\/public\//g, 'src="file:///' + repoRoot + '/public/');
  const tmpFile = path.resolve('tmp/blog-draft-preview.html');
  fs.writeFileSync(tmpFile, html);
  await page.goto('file:///' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tmp/blog-preview-full.png', fullPage: true });
  console.log('Saved tmp/blog-preview-full.png');
  await browser.close();
})();
