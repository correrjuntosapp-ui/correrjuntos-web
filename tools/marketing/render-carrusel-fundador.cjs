// ============================================================
// render-carrusel-fundador.cjs
// Renderiza los 16 HTML del carrusel founder a PNG con dimensiones
// nativas de cada plataforma (IG 1080x1350, TikTok 1080x1920).
// Output: tools/marketing/carrusel-fundador/png/{ig,tt}-{1..8}.png
// Uso: node tools/marketing/render-carrusel-fundador.cjs
// ============================================================

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch();
  const baseDir = path.resolve(__dirname, 'carrusel-fundador');
  const outDir = path.resolve(baseDir, 'png');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targets = [
    // Instagram carrusel — 1080x1350 (4:5 portrait)
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
      file: `ig-${n}.html`,
      out: `ig-${n}.png`,
      width: 1080,
      height: 1350,
    })),
    // TikTok / Reels — 1080x1920 (9:16 vertical)
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
      file: `tt-${n}.html`,
      out: `tt-${n}.png`,
      width: 1080,
      height: 1920,
    })),
  ];

  console.log(`Renderizando ${targets.length} slides...`);

  for (const t of targets) {
    const inputPath = path.join(baseDir, t.file);
    const outputPath = path.join(outDir, t.out);

    if (!fs.existsSync(inputPath)) {
      console.log(`  SKIP ${t.file} (no existe)`);
      continue;
    }

    const page = await browser.newPage();
    await page.setViewportSize({ width: t.width, height: t.height });
    // deviceScaleFactor 2 → output @2x, mejor calidad upload
    // (Instagram comprime, partir de mayor calidad evita pixelado)
    await page.evaluate(() => { /* noop, just to ensure context ready */ });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: 'networkidle' });
    // Espera extra para Google Fonts (Inter + JetBrains Mono cargan async)
    await page.waitForTimeout(1000);
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    await page.close();

    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  OK ${t.out.padEnd(10)} ${t.width}x${t.height}  ${sizeKB} KB`);
  }

  await browser.close();
  console.log('---');
  console.log(`Output: ${outDir}`);
  console.log('Done. Ya puedes subir los PNG a Instagram/TikTok.');
})();
