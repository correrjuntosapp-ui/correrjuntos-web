const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const html = path.resolve(__dirname, 'race-meetups-preview.html');
  const out  = path.resolve(__dirname, 'race-meetups-preview.png');
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 1300 }, deviceScaleFactor: 1.5 });
  const p = await c.newPage();
  await p.goto('file:///' + html.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await p.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await p.waitForTimeout(400);
  await p.screenshot({ path: out, fullPage: true });
  console.log('✓', out);
  await c.close(); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
