/**
 * Records tiktok-kinetic.html as a 1080x1920 MP4 suitable for TikTok / Reels / Shorts.
 *
 * The HTML exposes `window.renderAtTime(ms)` — a pure function of timeline
 * position. We call it once per frame, screenshot, advance. No browser
 * clocks or CSS @keyframes are involved, so capture time is completely
 * decoupled from animation time. Every frame is pixel-exact for its
 * nominal timestamp no matter how slow the screenshot I/O is.
 */

const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const ffmpegPath = require('ffmpeg-static');

const W = 1080;
const H = 1920;
const FPS = 30;
const FRAME_MS = 1000 / FPS;
// Duration is read from the HTML's window.TOTAL_MS at runtime so each
// variant (17s full, 15s ad cut, 9s punchy) can define its own length
// without touching this script.

// Usage: node record-tiktok.cjs [basename]
//   default basename = "tiktok-kinetic" → reads tiktok-kinetic.html, writes tiktok-kinetic.mp4
//   e.g.  node record-tiktok.cjs tiktok-kinetic-spain
const basename = (process.argv[2] || 'tiktok-kinetic').replace(/\.html?$/i, '');

(async () => {
  const htmlPath = path.resolve(__dirname, `${basename}.html`);
  const framesDir = path.resolve(__dirname, `.frames-${basename}`);
  const outMp4 = path.resolve(__dirname, `${basename}.mp4`);

  if (!fs.existsSync(htmlPath)) {
    console.error(`✗  HTML not found: ${htmlPath}`);
    process.exit(1);
  }

  if (fs.existsSync(framesDir)) {
    for (const f of fs.readdirSync(framesDir)) fs.unlinkSync(path.join(framesDir, f));
  } else {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  // Tell the page to skip its rAF preview loop — we'll drive renderAtTime.
  await page.addInitScript(() => { window.__capture = true; });

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Fonts MUST be ready before frame 0, otherwise the thin Inter 200 weight
  // falls back to a system font mid-capture and the video jitters visually.
  await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  await page.waitForTimeout(200);

  // Each HTML variant exposes its own window.TOTAL_MS. Falling back to 17000
  // keeps this recorder compatible with the original full-length template.
  const DURATION_MS = await page.evaluate(() => (window.TOTAL_MS || 17000));
  const TOTAL_FRAMES = Math.round(DURATION_MS / FRAME_MS);

  const stage = page.locator('#stage');
  console.log(`📸  Capturing ${TOTAL_FRAMES} frames @ ${FPS}fps (${DURATION_MS}ms, time-driven)…`);

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = i * FRAME_MS;
    await page.evaluate((ms) => window.renderAtTime(ms), t);
    const name = String(i).padStart(5, '0') + '.png';
    await stage.screenshot({ path: path.join(framesDir, name), omitBackground: false });

    if (i % FPS === 0) {
      process.stdout.write(`  frame ${i}/${TOTAL_FRAMES} (t=${(t / 1000).toFixed(1)}s)\n`);
    }
  }

  await ctx.close();
  await browser.close();

  console.log('🎬  Encoding MP4 with ffmpeg…');

  // -pix_fmt yuv420p   → TikTok / iOS / Android compatible
  // -crf 17            → near-visually-lossless; preserves thin Inter 200
  // -movflags +faststart → metadata at head for instant web playback
  execFileSync(
    ffmpegPath,
    [
      '-y',
      '-framerate', String(FPS),
      '-i', path.join(framesDir, '%05d.png'),
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-pix_fmt', 'yuv420p',
      '-crf', '17',
      '-preset', 'slow',
      '-movflags', '+faststart',
      '-r', String(FPS),
      outMp4,
    ],
    { stdio: 'inherit' }
  );

  // Cleanup
  for (const f of fs.readdirSync(framesDir)) fs.unlinkSync(path.join(framesDir, f));
  fs.rmdirSync(framesDir);

  const stat = fs.statSync(outMp4);
  console.log(`\n✅  ${path.relative(process.cwd(), outMp4)}  (${(stat.size / 1024 / 1024).toFixed(2)} MB, ${W}×${H}, ${DURATION_MS / 1000}s, ${FPS}fps)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
