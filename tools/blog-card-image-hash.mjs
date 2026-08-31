#!/usr/bin/env node
/**
 * Hash perceptual (dHash) de las fotos de las tarjetas del blog.
 *
 * Comparar la URL no basta: dos tarjetas pueden enseñar la MISMA foto en dos
 * tamaños (`1640777-640` y `1640777-1200`) o dos fotos DISTINTAS del mismo
 * reportaje (`4426517` y `4428993`: la misma modelo, la misma pose, el mismo
 * parque). Las dos cosas se leen como "la misma tarjeta".
 *
 * dHash: se reduce la imagen a 9x8 en escala de grises y se compara cada píxel
 * con el de su derecha; salen 64 bits. Dos fotos con distancia de Hamming baja
 * son visualmente parecidas.
 *
 * Uso:
 *   node tools/blog-card-image-hash.mjs            # informe
 *   node tools/blog-card-image-hash.mjs --json     # salida JSON
 *   node tools/blog-card-image-hash.mjs --umbral 8 # ajustar sensibilidad
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const UMBRAL = Number((args[args.indexOf('--umbral') + 1]) || 12);

const CARD_RE = /<a\b([^>]*class="article-card(?:\s+featured)?"[^>]*)>([\s\S]*?)<\/a>/g;

function tarjetas(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  return [...html.matchAll(CARD_RE)].map((m) => ({
    href: (m[1].match(/href="([^"]+)"/) || [])[1] || null,
    cat: (m[1].match(/data-category="([^"]+)"/) || [])[1] || null,
    img: (m[2].match(/<img[^>]*\bsrc="([^"]*)"/) || [])[1] || null,
  })).filter((c) => c.href && c.img);
}

export async function dhash(file) {
  const raw = await sharp(file).grayscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
  let bits = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits += raw[y * 9 + x] > raw[y * 9 + x + 1] ? '1' : '0';
    }
  }
  return bits;
}

export function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

const informe = { generado: null, indices: {} };

for (const [lang, file] of [['ES', 'blog/index.html'], ['EN', 'blog/en/index.html']]) {
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  const cards = tarjetas(file);
  const locales = cards.filter((c) => c.img.startsWith('/'));
  const remotas = cards.filter((c) => !c.img.startsWith('/'));

  const conHash = [];
  for (const c of locales) {
    const abs = path.join(ROOT, c.img.replace(/^\//, ''));
    if (!fs.existsSync(abs)) continue;
    try { conHash.push({ ...c, hash: await dhash(abs) }); }
    catch { /* archivo ilegible: se ignora, no es cometido de este script */ }
  }

  const parejas = [];
  for (let i = 0; i < conHash.length; i++) {
    for (let j = i + 1; j < conHash.length; j++) {
      const d = hamming(conHash[i].hash, conHash[j].hash);
      if (d <= UMBRAL) parejas.push({ d, a: conHash[i], b: conHash[j] });
    }
  }
  parejas.sort((x, y) => x.d - y.d);

  informe.indices[lang] = {
    tarjetas: cards.length,
    conFotoLocal: conHash.length,
    remotas: remotas.length,
    parejas: parejas.map((p) => ({
      distancia: p.d,
      mismaCategoria: p.a.cat === p.b.cat,
      a: { href: p.a.href, cat: p.a.cat, img: p.a.img },
      b: { href: p.b.href, cat: p.b.cat, img: p.b.img },
    })),
  };

  if (!JSON_OUT) {
    console.log('\n══ ' + lang + ' — ' + conHash.length + ' fotos analizadas de ' + cards.length + ' tarjetas'
      + (remotas.length ? '  (' + remotas.length + ' remotas sin analizar)' : ''));
    console.log('   parejas con distancia <= ' + UMBRAL + ': ' + parejas.length);
    for (const p of parejas) {
      console.log('\n   distancia ' + String(p.d).padStart(2) + (p.a.cat === p.b.cat ? '   [MISMA CATEGORÍA: ' + p.a.cat + ']' : '   [' + p.a.cat + ' / ' + p.b.cat + ']'));
      console.log('      ' + p.a.href + '\n         ' + p.a.img);
      console.log('      ' + p.b.href + '\n         ' + p.b.img);
    }
  }
}

if (JSON_OUT) console.log(JSON.stringify(informe, null, 2));
