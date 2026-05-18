#!/usr/bin/env node
/**
 * produce-apuntate-5k-v6.cjs — Reel V6 Event-Promo (estilo Runna First-to-Fast 5K)
 *
 * Adaptación del estilo Runna's signup-style ad pero para Plan 0→5K Gratis.
 * Cinematic B-roll grupos + texto event-promo punzante + closing CTA fuerte.
 *
 * Storyboard (20s total):
 *   1. 0.0-3.0s   8644210  group running (hook silencioso)
 *   2. 3.0-5.5s   8533914  feet rhythm + "¿TU PRIMER 5K?"
 *   3. 5.5-8.5s   8380733  friends fun + "Plan gratis · 8 semanas"
 *   4. 8.5-11.5s  12510396 marathon front + "Sin gym · Sin gadgets"
 *   5. 11.5-14.5s 8380523  talking jogging + "Empieza este lunes"
 *   6. 14.5-17.5s 8637185  elderly beach + "Para todos"
 *   7. 17.5-20.0s CLOSING  "APÚNTATE · correrjuntos.com"
 *
 * Output: tools/marketing/reel-apuntate-5k-v6.mp4 (1080x1920 portrait, silent)
 */

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG = require('ffmpeg-static');
const ROOT = path.resolve(__dirname, '..', '..');
const FOOTAGE = path.join(ROOT, 'tools', 'marketing', 'footage', 'v5');
const OUT_DIR = path.join(ROOT, 'tools', 'marketing');
const TMP = path.join(ROOT, 'tmp', 'reel-v6-segments');
fs.mkdirSync(TMP, { recursive: true });

const FONT_INTER = 'C\\:/Windows/Fonts/segoeuib.ttf';

const SEGMENTS = [
  { id: 1, file: 'clip-8644210.mp4', trimStart: 1.0, duration: 3.0, text: null },
  { id: 2, file: 'clip-8533914.mp4', trimStart: 1.0, duration: 2.5, text: { line: '¿TU PRIMER 5K?', pos: 'top', size: 96, color: 'white' } },
  { id: 3, file: 'clip-8380733.mp4', trimStart: 0.5, duration: 3.0, text: { line: 'Plan gratis · 8 semanas', pos: 'bottom', size: 70, color: 'white' } },
  { id: 4, file: 'clip-12510396.mp4', trimStart: 12.0, duration: 3.0, text: { line: 'Sin gym · Sin gadgets', pos: 'bottom', size: 70, color: 'white' } },
  { id: 5, file: 'clip-8380523.mp4', trimStart: 2.0, duration: 3.0, text: { line: 'Empieza este lunes', pos: 'bottom', size: 76, color: 'white' } },
  { id: 6, file: 'clip-8637185.mp4', trimStart: 5.0, duration: 3.0, text: { line: 'Para todos · todas las edades', pos: 'bottom', size: 62, color: 'white' } },
];

function ffmpegRun(args, label) {
  console.log(`\n→ ${label}`);
  try {
    execFileSync(FFMPEG, args, { stdio: 'pipe' });
    console.log(`  ✓ ${label} OK`);
  } catch (e) {
    console.error(`  ✗ ${label} FAILED:`);
    console.error(e.stderr?.toString().slice(-2000) || e.message);
    process.exit(1);
  }
}

console.log('═══════════════════════════════════════');
console.log('🎬 Reel V6 · Apúntate al Plan 5K (event-promo)');
console.log('═══════════════════════════════════════');

// ── PASO 1: Segmentos con texto event-promo ──
for (const seg of SEGMENTS) {
  const input = path.join(FOOTAGE, seg.file);
  const output = path.join(TMP, `seg-${seg.id}.mp4`);
  if (!fs.existsSync(input)) {
    console.error(`Missing: ${input}`);
    process.exit(1);
  }

  let filter = '';
  filter += `[0:v]trim=start=${seg.trimStart}:duration=${seg.duration},setpts=PTS-STARTPTS,fps=30,split=2[bg][fg];`;
  filter += `[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:4,eq=brightness=-0.12[bgblur];`;
  filter += `[fg]scale=1080:-1:force_original_aspect_ratio=decrease[fgscale];`;
  filter += `[bgblur][fgscale]overlay=(W-w)/2:(H-h)/2`;

  if (seg.text) {
    let y;
    if (seg.text.pos === 'top') y = 'h*0.10';
    else if (seg.text.pos === 'center') y = '(h-text_h)/2';
    else if (seg.text.pos === 'bottom') y = 'h*0.78';
    else y = 'h*0.20';

    const txt = seg.text.line.replace(/'/g, "\\'").replace(/:/g, '\\:');
    const fadeIn = 0.35;
    const fadeOut = 0.4;
    const fadeOutStart = seg.duration - fadeOut;
    const alphaExpr = `if(lt(t,${fadeIn}),t/${fadeIn},if(gt(t,${fadeOutStart}),(${seg.duration}-t)/${fadeOut},1))`;

    // Double-shadow stack for readability without pill (drawbox doesn't support text_w)
    filter += `,drawtext=fontfile='${FONT_INTER}':text='${txt}':fontsize=${seg.text.size}:fontcolor=black@0.65:x=(w-text_w)/2+4:y=${y}+4:alpha='${alphaExpr}'`;
    filter += `,drawtext=fontfile='${FONT_INTER}':text='${txt}':fontsize=${seg.text.size}:fontcolor=${seg.text.color}:x=(w-text_w)/2:y=${y}:shadowcolor=black@0.85:shadowx=0:shadowy=3:borderw=2:bordercolor=black@0.55:alpha='${alphaExpr}'`;
  }

  filter += `[out]`;

  ffmpegRun([
    '-y',
    '-i', input,
    '-filter_complex', filter,
    '-map', '[out]',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-an',
    output,
  ], `Segment ${seg.id}: ${seg.file} (${seg.duration}s${seg.text ? ' + text' : ''})`);
}

// ── PASO 2: Closing card event-promo style ──
const closingDur = 2.5;
const closingPath = path.join(TMP, 'seg-7-closing.mp4');
const closingFilter =
  `color=c=0x0b1220:s=1080x1920:d=${closingDur},fps=30,format=yuv420p,` +
  // Eyebrow mono
  `drawtext=fontfile='${FONT_INTER}':text='PLAN 0 A 5K GRATIS':fontsize=42:fontcolor=0xf97316:x=(w-text_w)/2:y=h/2-220,` +
  // Big CTA verb
  `drawtext=fontfile='${FONT_INTER}':text='APÚNTATE':fontsize=160:fontcolor=0xf6f1e8:x=(w-text_w)/2:y=h/2-120,` +
  // URL prominent
  `drawtext=fontfile='${FONT_INTER}':text='correrjuntos.com':fontsize=72:fontcolor=0xf97316:x=(w-text_w)/2:y=h/2+60,` +
  // Handle subtle
  `drawtext=fontfile='${FONT_INTER}':text='@correrjuntosapp':fontsize=40:fontcolor=0xf6f1e8@0.55:x=(w-text_w)/2:y=h/2+170`;

ffmpegRun([
  '-y',
  '-f', 'lavfi',
  '-i', closingFilter,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-t', String(closingDur),
  closingPath,
], 'Closing card APÚNTATE');

// ── PASO 3: Concat con xfade ──
const segPaths = SEGMENTS.map(s => path.join(TMP, `seg-${s.id}.mp4`));
segPaths.push(closingPath);
const allDurations = [...SEGMENTS.map(s => s.duration), closingDur];

const XFADE = 0.4;
let filterChain = '';
let curLabel = '0:v';
let curDur = allDurations[0];

for (let i = 1; i < segPaths.length; i++) {
  const nextDur = allDurations[i];
  const offset = curDur - XFADE;
  const outLabel = i === segPaths.length - 1 ? 'vout' : `v${i}`;
  filterChain += `[${curLabel}][${i}:v]xfade=transition=fade:duration=${XFADE}:offset=${offset}[${outLabel}];`;
  curLabel = outLabel;
  curDur = curDur + nextDur - XFADE;
}
filterChain = filterChain.replace(/;$/, '');

console.log(`\n→ Concatenando ${segPaths.length} segmentos con xfade ${XFADE}s...`);
console.log(`  Duración final estimada: ${curDur.toFixed(1)}s`);

const finalOut = path.join(OUT_DIR, 'reel-apuntate-5k-v6.mp4');
const inputArgs = [];
for (const p of segPaths) inputArgs.push('-i', p);

ffmpegRun([
  '-y',
  ...inputArgs,
  '-filter_complex', filterChain,
  '-map', '[vout]',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  finalOut,
], 'Concat final con xfades');

const size = fs.statSync(finalOut).size;
console.log('');
console.log('═══════════════════════════════════════');
console.log(`✅  Reel V6 producido`);
console.log(`   Path:     ${finalOut}`);
console.log(`   Tamaño:   ${(size / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Duración: ~${curDur.toFixed(1)}s`);
console.log(`   Formato:  1080×1920 portrait (silent)`);
console.log('');
console.log('Next: subir SIN audio a TikTok/IG (algoritmo prefiere audio nativo)');
console.log('═══════════════════════════════════════');
