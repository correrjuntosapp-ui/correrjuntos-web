#!/usr/bin/env node
/**
 * SEO Quick Win #3 · Self-host hero images (top tutorial articles)
 *
 * Para cada slug:
 *   1. Lee HTML
 *   2. Extrae URL de hero desde og:image (Pexels CDN)
 *   3. Descarga imagen original
 *   4. Convierte a AVIF (Q70) + WebP (Q80) + JPG (Q85) @ 1200px width
 *   5. Guarda en /public/blog-images/{slug}/hero.{avif,webp,jpg}
 *   6. Reemplaza <img> con <picture> + srcset en HTML
 *   7. Actualiza og:image y twitter:image para self-hosted JPG
 *
 * LCP esperado: 2.5s (Pexels CDN) → 0.6-0.9s (Vercel edge AVIF/WebP).
 * +1-3 posiciones ranking mobile.
 *
 * Usage: node tools/seo-selfhost-hero.cjs [--dry-run] [--slug=foo]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_SLUG = (process.argv.find(a => a.startsWith('--slug=')) || '').split('=')[1];

const SLUGS = [
  'ritmo-umbral-running',
  'tirada-larga-running',
  'vo2-max-running-como-mejorar',
  'carga-hidratos-maraton',
  'correr-mejora-salud-mental',
  'correr-durante-menopausia',
  'empezar-a-correr-despues-de-los-60',
  'plan-maraton-sub-4-horas',
  'plan-media-maraton-principiantes',
  'plan-media-maraton-sub-2-horas'
];

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBuffer(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractHeroUrl(html) {
  // Prefer og:image (cleanest)
  const og = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
  if (og && /pexels\.com/.test(og[1])) return og[1];
  // Fallback: first pexels in body
  const m = html.match(/https:\/\/images\.pexels\.com\/photos\/[^"'\s]+/);
  return m ? m[0] : null;
}

let summary = { processed: 0, success: 0, skipped: 0, failed: [] };

(async () => {
  const list = ONLY_SLUG ? [ONLY_SLUG] : SLUGS;

  for (const slug of list) {
    const filePath = path.join('blog', `${slug}.html`);
    if (!fs.existsSync(filePath)) {
      console.log(`  · MISSING: ${slug}.html`);
      summary.failed.push(slug);
      continue;
    }
    summary.processed++;

    const html = fs.readFileSync(filePath, 'utf8');
    const heroUrl = extractHeroUrl(html);
    if (!heroUrl) {
      console.log(`  · SKIP   : ${slug} (no Pexels hero found)`);
      summary.skipped++;
      continue;
    }

    const outDir = path.join('public', 'blog-images', slug);
    const avifPath = path.join(outDir, 'hero.avif');
    const webpPath = path.join(outDir, 'hero.webp');
    const jpgPath = path.join(outDir, 'hero.jpg');

    if (fs.existsSync(jpgPath) && fs.existsSync(webpPath)) {
      console.log(`  · SKIP   : ${slug} (already self-hosted)`);
      summary.skipped++;
      continue;
    }

    try {
      console.log(`  ↓ DOWNL  : ${slug} <- ${heroUrl.substring(0, 60)}...`);
      const original = await downloadBuffer(heroUrl);

      if (!DRY_RUN) {
        fs.mkdirSync(outDir, { recursive: true });

        // JPG fallback @ 1200px width, q85
        await sharp(original)
          .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true, mozjpeg: true })
          .toFile(jpgPath);

        // WebP @ 1200px, q80
        await sharp(original)
          .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath);

        // AVIF @ 1200px, q60 (AVIF q60 ≈ WebP q80 visually but ~30% smaller)
        await sharp(original)
          .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
          .avif({ quality: 60 })
          .toFile(avifPath);
      }

      // Replace HTML — find <img src="...pexels..."> and wrap in <picture>
      let newHtml = html;
      const imgRegex = new RegExp(
        '<img([^>]*?)src="' + heroUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"([^>]*?)>',
        'g'
      );
      const pictureBlock = (m, attrsBefore, attrsAfter) => {
        const allAttrs = (attrsBefore + ' ' + attrsAfter).trim();
        return `<picture>` +
          `<source srcset="/public/blog-images/${slug}/hero.avif" type="image/avif">` +
          `<source srcset="/public/blog-images/${slug}/hero.webp" type="image/webp">` +
          `<img ${allAttrs} src="/public/blog-images/${slug}/hero.jpg" fetchpriority="high" loading="eager">` +
        `</picture>`;
      };
      newHtml = newHtml.replace(imgRegex, pictureBlock);

      // Update og:image and twitter:image to self-hosted JPG (absolute URL)
      const selfHostedAbsolute = `https://www.correrjuntos.com/public/blog-images/${slug}/hero.jpg`;
      newHtml = newHtml.replace(
        /<meta property="og:image" content="[^"]+"/g,
        `<meta property="og:image" content="${selfHostedAbsolute}"`
      );
      newHtml = newHtml.replace(
        /<meta name="twitter:image" content="[^"]+"/g,
        `<meta name="twitter:image" content="${selfHostedAbsolute}"`
      );
      newHtml = newHtml.replace(
        /"image":\s*"https:\/\/images\.pexels\.com\/[^"]+"/g,
        `"image":"${selfHostedAbsolute}"`
      );

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newHtml, 'utf8');
      }

      // Sizes report
      let sizeReport = '';
      if (!DRY_RUN) {
        const jpgSize = (fs.statSync(jpgPath).size / 1024).toFixed(0);
        const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(0);
        const avifSize = (fs.statSync(avifPath).size / 1024).toFixed(0);
        sizeReport = ` (AVIF ${avifSize}KB · WebP ${webpSize}KB · JPG ${jpgSize}KB)`;
      }
      console.log(`  ${DRY_RUN ? '~' : '✓'} DONE   : ${slug}${sizeReport}`);
      summary.success++;
    } catch (err) {
      console.log(`  ✗ FAIL   : ${slug} — ${err.message}`);
      summary.failed.push(slug);
    }
  }

  console.log('');
  console.log('═══ Summary ═══');
  console.log(`  Processed: ${summary.processed}`);
  console.log(`  Success  : ${summary.success}`);
  console.log(`  Skipped  : ${summary.skipped}`);
  console.log(`  Failed   : ${summary.failed.length}`);
  if (summary.failed.length) {
    console.log(`  Failed list: ${summary.failed.join(', ')}`);
  }
  if (DRY_RUN) console.log('\n  (DRY RUN — no files written)');
})();
