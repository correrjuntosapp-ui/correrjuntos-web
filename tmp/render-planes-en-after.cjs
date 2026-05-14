const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const slugs = ['0-5k', '5k', '10k', 'half-marathon', 'marathon', 'trail'];
const root = path.resolve(__dirname, '..', 'planes', 'en');
const outDir = path.resolve(__dirname, 'planes-en-after');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1100, height: 800 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();

  for (const slug of slugs) {
    const html = path.join(root, slug, 'index.html');
    const url = 'file:///' + html.replace(/\\/g, '/');
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
    await page.waitForTimeout(300);
    const out = path.join(outDir, `${slug}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1100, height: 750 } });
    console.log(`✓ ${slug}`);
  }
  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
