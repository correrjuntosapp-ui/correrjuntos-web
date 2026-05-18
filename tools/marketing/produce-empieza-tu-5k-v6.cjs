#!/usr/bin/env node
/**
 * produce-empieza-tu-5k-v6.cjs — Reel V6 "Empieza Tu 5K"
 *
 * Footage 100% NUEVO vs V5 (4 clips legacy NO usados antes en V5):
 *   solo-deciding   → guy alone on phone in park (HOOK · duda interna)
 *   group-runners   → urban interracial couple jogging (COMPAÑÍA)
 *   group-track     → 2 women on red running track (ENTRENAMIENTO real)
 *   solo-runner     → runner solo into golden sunset (LIBERTAD · payoff)
 *
 * Storyboard narrativo (~17.5s):
 *   1. 0.0-3.0s   solo-deciding (silent hook — duda)
 *   2. 3.0-6.0s   solo-deciding cont + "¿Quieres empezar a correr?"
 *   3. 6.0-9.0s   group-runners + "No tienes que hacerlo solo"
 *   4. 9.0-12.0s  group-track + "Plan gratis · 8 semanas"
 *   5. 12.0-15.5s solo-runner sunset + "Empieza este lunes"
 *   6. 15.5-18.0s CLOSING "APÚNTATE · correrjuntos.com"
 *
 * Diferencia clave vs V5: arco DUDA→COMPAÑÍA→TRAIN→LIBERTAD.
 * V5 era "fiesta grupal" sin progresión.
 *
 * Output: tools/marketing/reel-empieza-tu-5k-v6.mp4 (1080x1920 silent)
 */

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG = require('ffmpeg-static');
const ROOT = path.resolve(__dirname, '..', '..');
const FOOTAGE = path.join(ROOT, 'tools', 'marketing', 'footage');
const OUT_DIR = path.join(ROOT, 'tools', 'marketing');
const TMP = path.join(ROOT, 'tmp', 'reel-v6b-segments');
fs.mkdirSync(TMP, { recursive: true });

const FONT_INTER = 'C\\:/Windows/Fonts/segoeuib.ttf';

const SEGMENTS = [
  // HOOK silencioso — duda interna
  { id: 1, file: 'solo-deciding.mp4', trimStart: 0.5, duration: 3.0, text: null },
  // Texto hook sobre el mismo clip continuado
  { id: 2, file: 'solo-deciding.mp4', trimStart: 4.0, duration: 3.0, text: { line: '¿Quieres empezar a correr?', pos: 'top', size: 78 } },
  // COMPAÑÍA — pareja urbana
  { id: 3, file: 'group-runners.mp4', trimStart: 2.0, duration: 3.0, text: { line: 'No tienes que hacerlo solo', pos: 'bottom', size: 68 } },
  // ENTRENAMIENTO — pista
  { id: 4, file: 'group-track.mp4', trimStart: 2.0, duration: 3.0, text: { line: 'Plan gratis · 8 semanas', pos: 'bottom', size: 70 } },
  // PAYOFF — sunset solo runner
  { id: 5, file: 'solo-runner.mp4', trimStart: 8.0, duration: 3.5, text: { line: 'Empieza este lunes', pos: 'top', size: 84 } },
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
console.log('🎬 Reel V6 · Empieza Tu 5K (narrative arc)');
console.log('═══════════════════════════════════════');

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
  filter += `[fg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[fgcrop];`;
  filter += `[bgblur][fgcrop]overlay=0:0`;

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

    filter += `,drawtext=fontfile='${FONT_INTER}':text='${txt}':fontsize=${seg.text.size}:fontcolor=black@0.65:x=(w-text_w)/2+4:y=${y}+4:alpha='${alphaExpr}'`;
    filter += `,drawtext=fontfile='${FONT_INTER}':text='${txt}':fontsize=${seg.text.size}:fontcolor=white:x=(w-text_w)/2:y=${y}:shadowcolor=black@0.85:shadowx=0:shadowy=3:borderw=2:bordercolor=black@0.55:alpha='${alphaExpr}'`;
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

// ── Closing card ──
const closingDur = 2.5;
const closingPath = path.join(TMP, 'seg-6-closing.mp4');
const closingFilter =
  `color=c=0x0b1220:s=1080x1920:d=${closingDur},fps=30,format=yuv420p,` +
  `drawtext=fontfile='${FONT_INTER}':text='PLAN 0 A 5K GRATIS':fontsize=42:fontcolor=0xf97316:x=(w-text_w)/2:y=h/2-220,` +
  `drawtext=fontfile='${FONT_INTER}':text='APÚNTATE':fontsize=160:fontcolor=0xf6f1e8:x=(w-text_w)/2:y=h/2-120,` +
  `drawtext=fontfile='${FONT_INTER}':text='correrjuntos.com':fontsize=72:fontcolor=0xf97316:x=(w-text_w)/2:y=h/2+60,` +
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

// ── Concat con xfade ──
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

console.log(`\n→ Concat ${segPaths.length} segmentos · xfade ${XFADE}s · ${curDur.toFixed(1)}s total`);

const finalOut = path.join(OUT_DIR, 'reel-empieza-tu-5k-v6.mp4');
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
console.log(`✅  Reel V6 v2 producido (NUEVO footage)`);
console.log(`   Path:     ${finalOut}`);
console.log(`   Tamaño:   ${(size / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Duración: ~${curDur.toFixed(1)}s`);
console.log(`   Storyboard: DUDA → COMPAÑÍA → TRAIN → LIBERTAD → APÚNTATE`);
console.log('═══════════════════════════════════════');
