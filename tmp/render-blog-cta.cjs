const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1200 } });
  const tmpFile = path.resolve('tmp/blog-draft-preview.html');
  await page.goto('file:///' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // Scroll to CTA box and screenshot it
  const cta = await page.locator('.cta-box').first();
  await cta.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await cta.screenshot({ path: 'tmp/blog-preview-cta.png' });
  console.log('Saved tmp/blog-preview-cta.png');
  await browser.close();
})();
