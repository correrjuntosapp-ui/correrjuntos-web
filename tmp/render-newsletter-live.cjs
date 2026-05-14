const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  // Use first-time visitor (clean storage) to see all components fire
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await ctx.newPage();
  await page.goto('https://www.correrjuntos.com/blog/grupos-running-torre-del-mar-correr-sin-limites?nl_preview=' + Date.now(), { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  // 1. Sticky bar top
  await page.screenshot({ path: 'tmp/nl-live-sticky.png', clip: { x: 0, y: 0, width: 1280, height: 200 } });
  console.log('Saved sticky bar');

  // 2. Inline mid-article — scroll to find it
  await page.evaluate(() => {
    const inline = document.querySelector('.cj-nl-inline');
    if(inline) inline.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tmp/nl-live-inline.png', fullPage: false });
  console.log('Saved inline');

  // 3. End of article CTA
  await page.evaluate(() => {
    const end = document.querySelector('.cj-nl-end');
    if(end) end.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tmp/nl-live-end.png', fullPage: false });
  console.log('Saved end CTA');

  // 4. Exit intent — back to top, then trigger
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  // Move mouse to top of viewport to trigger mouseleave
  await page.mouse.move(640, 100);
  await page.waitForTimeout(200);
  await page.mouse.move(640, 0);
  await page.waitForTimeout(200);
  // Dispatch a real mouseleave event on document
  await page.evaluate(() => {
    document.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, clientY: 0 }));
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'tmp/nl-live-exit.png', fullPage: false });
  console.log('Saved exit-intent');

  await browser.close();
})();
