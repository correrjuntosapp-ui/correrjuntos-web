const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'reel-despensa-runner.html');
  const outDir = path.resolve(__dirname, '.reel-despensa-preview');
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

  // Mid-hold of each scene = scene_in + ((scene_out - scene_in) / 2)
  const peaks = [
    { name: '1-hook',         t: 1400  },
    { name: '2-five-basics',  t: 5100  },
    { name: '3-oats-feature', t: 9350  },
    { name: '4-stats-80pc',   t: 12850 },
    { name: '5-promise',      t: 15950 },
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
