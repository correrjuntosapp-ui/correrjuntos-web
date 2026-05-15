const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'reel-planificar-semana.html');
  const outDir = path.resolve(__dirname, '.reel-planificar-preview');
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

  const peaks = [
    { name: '1-hook',         t: 1400  },
    { name: '2-problem',      t: 4600  },
    { name: '3-five-rules',   t: 9700  },
    { name: '4-compare-stat', t: 14200 },
    { name: '5-promise',      t: 16450 },
    { name: '6-cta',          t: 18400 },
  ];

  const stage = page.locator('#stage');
  for (const f of peaks) {
    await page.evaluate((ms) => window.renderAtTime(ms), f.t);
    await stage.screenshot({ path: path.join(outDir, `${f.name}.png`) });
    console.log(`✓ ${f.name} @ t=${f.t}ms`);
  }

  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
