const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
  const tmpFile = path.resolve('tmp/blog-draft-preview.html');
  await page.goto('file:///' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'tmp/blog-preview-top.png', fullPage: false });
  console.log('Saved tmp/blog-preview-top.png (1200x1400 top viewport)');
  await browser.close();
})();
