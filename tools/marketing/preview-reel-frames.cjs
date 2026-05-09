// Snapshots de frames clave de reel-busca-tu-carrera.html para validar diseño
// antes de generar el MP4 completo.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'reel-busca-tu-carrera.html');
  const outDir = path.resolve(__dirname, '.reel-preview');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__capture = true; });
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(200);

  // Frame at the visual peak of each scene (mid-point)
  const peaks = [
    { name: '01-hook', t: 1500 },
    { name: '02-races', t: 4900 },
    { name: '03-stat', t: 8800 },
    { name: '04-features', t: 12400 },
    { name: '05-arrival', t: 15700 },
    { name: '06-cta', t: 18200 },
  ];

  const stage = page.locator('#stage');
  for (const f of peaks) {
    await page.evaluate((ms) => window.renderAtTime(ms), f.t);
    const out = path.join(outDir, `${f.name}.png`);
    await stage.screenshot({ path: out });
    console.log(`✓ ${f.name} @ t=${f.t}ms → ${out}`);
  }

  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
