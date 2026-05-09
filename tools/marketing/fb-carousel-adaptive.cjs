// Render 5 carousel slides 1080x1080 for Facebook groups
// Reuses the existing kinetic palette + reel-plan-adaptativo content
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const slides = [
  {
    name: 'slide-1-hook',
    body: `
      <div class="card">
        <div class="eyebrow">PARA RUNNERS · TEMA QUE DA RABIA</div>
        <h1>¿Tu plan acaba<br>3 semanas <span class="ember">antes</span><br>de tu carrera?</h1>
        <div class="sub">Eso es lo que pasa cuando el plan dura "12 semanas porque sí"<br>en vez de las semanas que faltan hasta tu fecha.</div>
      </div>
    `,
  },
  {
    name: 'slide-2-problem',
    body: `
      <div class="card">
        <div class="eyebrow bad">EL PROBLEMA · PLAN FIJO</div>
        <h2>5K · carrera el <span class="ember">26 jul</span></h2>
        <div class="tl-block">
          <div class="tl-row">
            <div class="tl-mark start">11 may</div>
            <div class="tl-mark early-end" style="left: 73%;">5 jul · acaba</div>
            <div class="tl-mark race-top">26 jul</div>
            <div class="tl-track">
              <div class="tl-seg seg-base"  style="left: 0%;  width: 27%;"></div>
              <div class="tl-seg seg-build" style="left: 27%; width: 27%;"></div>
              <div class="tl-seg seg-peak"  style="left: 54%; width: 13%;"></div>
              <div class="tl-seg seg-taper" style="left: 67%; width: 6%;"></div>
              <div class="tl-seg seg-gap"   style="left: 73%; width: 27%;"></div>
            </div>
            <div class="tl-gap-label" style="left: 75%;">3 SEM</div>
            <div class="tl-mark race-tag" style="right: 0;">CARRERA</div>
          </div>
        </div>
        <div class="sub">Pierdes forma justo cuando más la necesitas.</div>
      </div>
    `,
  },
  {
    name: 'slide-3-solution',
    body: `
      <div class="card">
        <div class="eyebrow">LA SOLUCIÓN · PLAN ADAPTATIVO</div>
        <h2>5K · carrera el <span class="ember">26 jul</span></h2>
        <div class="tl-block">
          <div class="tl-row">
            <div class="tl-mark start">11 may</div>
            <div class="tl-mark race-top">26 jul</div>
            <div class="tl-track">
              <div class="tl-seg seg-base"  style="left: 0%;  width: 46%;"></div>
              <div class="tl-seg seg-build" style="left: 46%; width: 27%;"></div>
              <div class="tl-seg seg-peak"  style="left: 73%; width: 18%;"></div>
              <div class="tl-seg seg-taper" style="left: 91%; width: 9%;"></div>
            </div>
            <div class="tl-mark race-tag" style="right: 0;">CARRERA</div>
          </div>
        </div>
        <div class="sub">11 semanas. La última en taper. Termina exactamente el día de la salida.</div>
      </div>
    `,
  },
  {
    name: 'slide-4-algorithm',
    body: `
      <div class="card">
        <div class="eyebrow">CÓMO FUNCIONA</div>
        <ul class="algo-list">
          <li><span class="num">1.</span><span class="txt">Eliges tu carrera y su fecha.</span></li>
          <li><span class="num">2.</span><span class="txt">Calculamos las semanas que faltan.</span></li>
          <li><span class="num">3.</span><span class="txt">Generamos un plan de <em>esa duración exacta</em>.</span></li>
          <li><span class="num">4.</span><span class="txt">Si no llegas, sugerimos distancia menor.</span></li>
        </ul>
        <div class="sub">Las fases de calidad (intervalos, tempo, race-pace, taper) <strong>siempre se conservan</strong>. Solo escalamos la base.</div>
      </div>
    `,
  },
  {
    name: 'slide-5-question',
    body: `
      <div class="card">
        <div class="eyebrow">PREGUNTA PARA EL GRUPO</div>
        <h1>¿Cuántas semanas<br><span class="ember">dejáis vosotros</span><br>antes de la carrera?</h1>
        <div class="sub">Os leo en comentarios.<br><br>— Abraham, fundador de CorrerJuntos</div>
      </div>
    `,
  },
];

const css = `
  :root {
    --ink: #0b1220; --paper: #f6f1e8;
    --ember: #f97316; --bad: #ef4444;
    --ash: rgba(246, 241, 232, 0.55);
    --soft: rgba(246, 241, 232, 0.10);
    --good-base:  rgba(34, 197, 94, 0.7);
    --good-build: rgba(96, 165, 250, 0.7);
    --good-peak:  rgba(245, 158, 11, 0.85);
    --good-taper: rgba(249, 115, 22, 0.95);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: var(--ink); font-family: 'Inter', sans-serif;
    color: var(--paper); -webkit-font-smoothing: antialiased;
  }
  .stage {
    width: 1080px; height: 1080px;
    position: relative; background: var(--ink); overflow: hidden;
  }
  .stage::before {
    content: ""; position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, rgba(249,115,22,.09) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(249,115,22,.09) 1px, transparent 1px);
    background-size: 80px 80px;
  }
  .card {
    position: relative; z-index: 2;
    padding: 90px 80px;
    height: 100%;
    display: flex; flex-direction: column;
    justify-content: center;
  }
  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--ember);
    margin-bottom: 36px;
    display: inline-flex; align-items: center; gap: 14px;
  }
  .eyebrow::before, .eyebrow::after {
    content: ""; width: 36px; height: 1px;
    background: var(--ember); display: inline-block;
  }
  .eyebrow.bad { color: var(--bad); }
  .eyebrow.bad::before, .eyebrow.bad::after { background: var(--bad); }
  h1 {
    font-size: 96px; line-height: 0.96;
    letter-spacing: -0.04em; font-weight: 200;
    margin-bottom: 28px;
  }
  h2 {
    font-size: 56px; line-height: 1.1;
    letter-spacing: -0.025em; font-weight: 600;
    margin-bottom: 32px;
  }
  .ember { color: var(--ember); font-weight: 700; }
  .sub {
    font-size: 26px; line-height: 1.5;
    color: var(--ash); font-weight: 300;
    max-width: 880px;
    margin-top: 20px;
  }
  .sub strong { color: var(--paper); font-weight: 600; }

  /* Timeline (slides 2 + 3) */
  .tl-block { width: 100%; margin: 24px 0; }
  .tl-row { position: relative; padding: 32px 0 60px; }
  .tl-track {
    height: 16px; border-radius: 8px;
    background: rgba(246, 241, 232, 0.08); position: relative;
  }
  .tl-seg { position: absolute; top: 0; height: 100%; }
  .seg-base   { background: var(--good-base);  border-radius: 8px 0 0 8px; }
  .seg-build  { background: var(--good-build); }
  .seg-peak   { background: var(--good-peak); }
  .seg-taper  { background: var(--good-taper); border-radius: 0 8px 8px 0; }
  .seg-gap {
    background: repeating-linear-gradient(45deg, rgba(239, 68, 68, 0.55) 0 8px, transparent 8px 16px);
    border-top: 2px dashed rgba(239, 68, 68, 0.7);
    border-bottom: 2px dashed rgba(239, 68, 68, 0.7);
  }
  .tl-mark {
    position: absolute; transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px; letter-spacing: 0.08em;
    color: var(--ash); white-space: nowrap;
  }
  .tl-mark.start    { left: 0; transform: none; top: -36px; }
  .tl-mark.race-top { right: 0; transform: none; top: -36px; color: var(--ember); font-weight: 600; }
  .tl-mark.early-end { top: -36px; color: var(--bad); }
  .tl-mark.race-tag {
    bottom: -48px; transform: none;
    color: var(--ember); text-transform: uppercase;
    font-weight: 700; letter-spacing: 0.12em; font-size: 18px;
  }
  .tl-mark.race-tag::before {
    content: ""; display: block;
    width: 2px; height: 18px; background: var(--ember);
    margin: 0 auto 6px;
  }
  .tl-gap-label {
    position: absolute; bottom: -48px;
    transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px; letter-spacing: 0.08em;
    color: var(--bad); text-transform: uppercase;
    font-weight: 600; white-space: nowrap;
  }

  /* Algorithm list (slide 4) */
  .algo-list { list-style: none; margin: 24px 0; }
  .algo-list li {
    font-size: 38px; font-weight: 300;
    letter-spacing: -0.015em; line-height: 1.4;
    padding: 14px 0;
    border-top: 1px solid var(--soft);
    display: flex; gap: 24px;
    align-items: baseline;
  }
  .algo-list li > span.num { flex: 0 0 80px; }
  .algo-list li > span.txt { flex: 1; }
  .algo-list li:last-child { border-bottom: 1px solid var(--soft); }
  .algo-list .num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 32px; color: var(--ember);
    font-weight: 700;
  }
  .algo-list em { font-style: normal; color: var(--ember); font-weight: 600; }
`;

(async () => {
  const outDir = path.resolve(__dirname, 'fb-carousel');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const s of slides) {
    const html = `<!doctype html><html lang="es"><head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
      <style>${css}</style>
    </head><body>
      <div class="stage" id="stage">${s.body}</div>
    </body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
    await page.waitForTimeout(150);
    const out = path.join(outDir, `${s.name}.png`);
    await page.locator('#stage').screenshot({ path: out });
    console.log(`✓ ${s.name}`);
  }

  await ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
