const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // Use the article TDM with our newsletter.js
  const htmlPath = path.resolve('blog/grupos-running-torre-del-mar-correr-sin-limites.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const repoRoot = process.cwd().replace(/\\/g, '/');
  html = html.replace(/src="\/public\//g, 'src="file:///' + repoRoot + '/public/');
  // Also rewrite newsletter.js script path to local
  html = html.replace('/blog/newsletter.js', 'file:///' + repoRoot + '/blog/newsletter.js');
  const tmpFile = path.resolve('tmp/article-newsletter-preview.html');
  fs.writeFileSync(tmpFile, html);
  await page.goto('file:///' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Screenshot full page with sticky bar visible
  await page.screenshot({ path: 'tmp/newsletter-sticky-top.png', fullPage: false });
  console.log('Saved sticky bar top view');

  // 2. Scroll to mid-article — should show inline form
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'tmp/newsletter-inline.png', fullPage: false });
  console.log('Saved inline mid-article view');

  // 3. Scroll to end — should show end-of-article CTA
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1200));
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'tmp/newsletter-end.png', fullPage: false });
  console.log('Saved end-of-article CTA view');

  // 4. Trigger exit intent manually via JS
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const event = new MouseEvent('mouseleave', { bubbles: true, cancelable: true, clientY: 0 });
    document.dispatchEvent(event);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'tmp/newsletter-exit-intent.png', fullPage: false });
  console.log('Saved exit-intent popup view');

  await browser.close();
})();
