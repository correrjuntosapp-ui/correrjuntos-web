/**
 * Renders tools/lead-magnet/plan-10k-preview.html to a multi-page A4 PDF
 * using Playwright's built-in PDF engine. Output lands in
 * public/downloads/plan-10k-correrjuntos-preview.pdf so it's served
 * statically by Vercel.
 *
 * Usage:
 *   node tools/lead-magnet/render-pdf.cjs
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve(__dirname, 'plan-10k-preview.html');
  const outDir = path.resolve(__dirname, '..', '..', 'public', 'downloads');
  const outPath = path.join(outDir, 'plan-10k-correrjuntos-preview.pdf');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
    await page.waitForTimeout(500);

    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    const size = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log('✓', path.relative(process.cwd(), outPath), '·', size, 'KB');
  } finally {
    await browser.close();
  }
})();
