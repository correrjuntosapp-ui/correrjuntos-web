/**
 * WebP batch conversion.
 *
 * Converts every .jpg/.jpeg/.png in blog/img/ and public/blog/ to .webp
 * (keeping originals intact as fallback), then rewrites references in
 * HTML files to point to the .webp version.
 *
 * Quality: 82 (sweet spot for photographic content — smaller than JPG
 * at visually identical quality per Cloudflare's image-optimization docs).
 *
 * Usage:
 *   node tools/webp-batch.cjs              # dry-run (list what would convert)
 *   node tools/webp-batch.cjs --convert    # convert images only
 *   node tools/webp-batch.cjs --rewrite    # rewrite HTML references only
 *   node tools/webp-batch.cjs --apply      # both
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const IMG_DIRS = ['blog/img', 'public/blog'];
const HTML_GLOBS = ['blog', 'blog/en', 'public/blog'];  // dirs to scan for HTML

const args = process.argv.slice(2);
const DO_CONVERT = args.includes('--convert') || args.includes('--apply');
const DO_REWRITE = args.includes('--rewrite') || args.includes('--apply');
const DRY_RUN = !DO_CONVERT && !DO_REWRITE;
const QUALITY = 82;

function walk(dir, filterFn) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full, filterFn));
    else if (filterFn(full)) out.push(full);
  }
  return out;
}

async function convertOne(srcAbs) {
  const ext = path.extname(srcAbs).toLowerCase();
  const webpAbs = srcAbs.replace(new RegExp(ext + '$', 'i'), '.webp');
  if (fs.existsSync(webpAbs)) return { srcAbs, webpAbs, skipped: 'already exists' };
  const srcBytes = fs.statSync(srcAbs).size;
  await sharp(srcAbs).webp({ quality: QUALITY, effort: 4 }).toFile(webpAbs);
  const webpBytes = fs.statSync(webpAbs).size;
  return { srcAbs, webpAbs, srcBytes, webpBytes, saved: srcBytes - webpBytes };
}

async function doConvert() {
  const images = [];
  for (const dir of IMG_DIRS) {
    images.push(...walk(path.join(ROOT, dir), p => /\.(jpe?g|png)$/i.test(p)));
  }
  console.log(`\n=== WebP conversion ===`);
  console.log(`Found ${images.length} source images in ${IMG_DIRS.join(', ')}`);
  if (DRY_RUN) {
    console.log(`(Dry run — re-run with --convert to apply.)\n`);
    return;
  }
  let totalSaved = 0, converted = 0, skipped = 0, errors = 0;
  for (const src of images) {
    try {
      const r = await convertOne(src);
      if (r.skipped) { skipped++; continue; }
      converted++;
      totalSaved += r.saved;
      const pct = ((r.saved / r.srcBytes) * 100).toFixed(1);
      const rel = path.relative(ROOT, r.srcAbs).replace(/\\/g, '/');
      console.log(`  ✓ ${rel}  ${(r.srcBytes/1024).toFixed(0)}KB → ${(r.webpBytes/1024).toFixed(0)}KB  (-${pct}%)`);
    } catch (e) {
      errors++;
      console.log(`  ✗ ${src}  ${e.message}`);
    }
  }
  console.log(`\nConverted ${converted} · Skipped ${skipped} · Errors ${errors}`);
  console.log(`Total saved: ${(totalSaved/1024/1024).toFixed(2)} MB\n`);
}

/* -------------------------------------------------------- */
/* HTML rewrite: swap <img src="…jpg"> for .webp references */
/* -------------------------------------------------------- */

function buildWebpMap() {
  // For every local jpg/png that has a sibling .webp, build { jpgPath: webpPath }
  // Works with both absolute-from-root refs (/blog/img/foo.jpg) and full URLs.
  const map = {};
  for (const dir of IMG_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const src of walk(abs, p => /\.(jpe?g|png)$/i.test(p))) {
      const webp = src.replace(/\.(jpe?g|png)$/i, '.webp');
      if (!fs.existsSync(webp)) continue;
      // Reference as absolute-from-root with forward slashes
      const fromRoot = '/' + path.relative(ROOT, src).replace(/\\/g, '/');
      const toRoot   = '/' + path.relative(ROOT, webp).replace(/\\/g, '/');
      map[fromRoot] = toRoot;
    }
  }
  return map;
}

async function doRewrite() {
  const webpMap = buildWebpMap();
  const pairs = Object.keys(webpMap);
  console.log(`\n=== HTML rewrite ===`);
  console.log(`${pairs.length} webp pairs available for substitution`);
  if (pairs.length === 0) { console.log(`(Run --convert first to create .webp files.)\n`); return; }

  const htmlFiles = [];
  for (const dir of HTML_GLOBS) {
    const abs = path.join(ROOT, dir);
    htmlFiles.push(...walk(abs, p => p.endsWith('.html')));
  }
  console.log(`Scanning ${htmlFiles.length} HTML files...`);

  let filesChanged = 0, totalReplaces = 0;
  for (const file of htmlFiles) {
    let html = fs.readFileSync(file, 'utf8');
    const before = html;
    let localReplaces = 0;
    for (const [jpg, webp] of Object.entries(webpMap)) {
      // Replace both absolute-from-root and www.correrjuntos.com/… variants
      const escaped = jpg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped.replace(/^\//, '\\/?'), 'g');
      const next = html.replace(new RegExp(escaped, 'g'), webp);
      if (next !== html) {
        localReplaces += (html.match(new RegExp(escaped, 'g')) || []).length;
        html = next;
      }
    }
    if (html !== before) {
      filesChanged++;
      totalReplaces += localReplaces;
      if (!DRY_RUN) fs.writeFileSync(file, html);
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      console.log(`  ✓ ${rel}  (${localReplaces} refs)`);
    }
  }
  console.log(`\nFiles changed: ${filesChanged} · Total ref substitutions: ${totalReplaces}`);
  if (DRY_RUN) console.log(`(Dry run — re-run with --rewrite or --apply to persist.)`);
  console.log();
}

(async () => {
  if (DO_CONVERT || DRY_RUN) await doConvert();
  if (DO_REWRITE) await doRewrite();
})();
