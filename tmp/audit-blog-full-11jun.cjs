// [11 jun 2026] Auditoría integral blog: ROI afiliados + imágenes + SEO + app CTAs
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const dirs = ['blog', 'blog/en'];
const report = {
  files: 0,
  searchLinks: [],        // /s?k= (conversión -30-50%)
  shortLinks: [],         // amzn.to (drift risk)
  missingTag: [],         // amazon.es sin tag afiliado
  badRel: [],             // afiliado sin rel sponsored
  brokenLocalImg: [],     // src local que no existe en disco
  noAppCta: [],           // sin link a stores NI cro.js
  noCanonical: [],
  noDescription: [],
  longTitle: [],          // >65 chars
  noNewsletterJs: [],
  noCroJs: [],
  heroAltMismatch: [],    // alt del hero sin relación con el title
  amazonImgCount: 0,      // imágenes CDN amazon (riesgo rotación)
};

const stop = new Set(['2026','para','running','correr','guia','mejores','los','las','del','de','en','con','que','tu','el','la','y','por','un','una','como','blog','correrjuntos']);
const tokens = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stop.has(w));

for (const dir of dirs) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  for (const f of fs.readdirSync(full)) {
    if (!f.endsWith('.html') || f === 'index.html') continue;
    const fp = path.join(full, f);
    const h = fs.readFileSync(fp, 'utf8');
    const rel = `${dir}/${f}`;
    report.files++;

    // ── A. Afiliados / ROI ──
    const sk = (h.match(/amazon\.es\/s\?k=/g) || []).length;
    if (sk) report.searchLinks.push(`${rel} (${sk})`);
    const sl = (h.match(/amzn\.to\//g) || []).length;
    if (sl) report.shortLinks.push(`${rel} (${sl})`);
    const amzHrefs = h.match(/href="https?:\/\/(?:www\.)?amazon\.es\/[^"]*"/g) || [];
    const noTag = amzHrefs.filter(u => !u.includes('tag=diezmejores21-21')).length;
    if (noTag) report.missingTag.push(`${rel} (${noTag})`);
    // rel check: anchor tags with amazon href lacking sponsored
    const anchorRe = /<a\b[^>]*href="https?:\/\/(?:www\.)?amazon\.es\/[^"]*"[^>]*>/g;
    let am, bad = 0;
    while ((am = anchorRe.exec(h)) !== null) { if (!/rel="[^"]*sponsored/.test(am[0])) bad++; }
    if (bad) report.badRel.push(`${rel} (${bad})`);
    report.amazonImgCount += (h.match(/m\.media-amazon\.com\/images/g) || []).length;

    // ── B. Imágenes locales rotas ──
    const imgs = h.match(/src="(\/[^"]+\.(?:jpg|jpeg|png|webp))"/g) || [];
    for (const tag of imgs) {
      const src = tag.slice(5, -1);
      const diskPath = path.join(ROOT, src.replace(/^\//, '').split('?')[0]);
      if (!fs.existsSync(diskPath)) report.brokenLocalImg.push(`${rel} → ${src}`);
    }

    // ── C. App CTA ──
    const hasStore = h.includes('apps.apple.com/app') || h.includes('play.google.com/store');
    const hasCro = h.includes('cro.js');
    if (!hasStore && !hasCro) report.noAppCta.push(rel);
    if (!hasCro) report.noCroJs.push(rel);
    if (!h.includes('newsletter.js')) report.noNewsletterJs.push(rel);

    // ── D. SEO mecánico ──
    if (!h.includes('rel="canonical"')) report.noCanonical.push(rel);
    if (!/<meta name="description"/.test(h)) report.noDescription.push(rel);
    const t = (h.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const tClean = t.replace(/\s*\|\s*CorrerJuntos.*$/i, '');
    if (tClean.length > 65) report.longTitle.push(`${rel} (${tClean.length})`);

    // ── E. Hero alt vs title (proxy de "foto no coincide") ──
    const heroM = h.match(/<img[^>]*(?:fetchpriority="high"|class="[^"]*hero[^"]*")[^>]*>/) ||
                  h.match(/<header[^>]*>[\s\S]{0,800}?<img[^>]*>/);
    if (heroM) {
      const alt = (heroM[0].match(/alt="([^"]*)"/) || [])[1] || '';
      const tT = tokens(tClean), aT = new Set(tokens(alt));
      const overlap = tT.filter(w => aT.has(w)).length;
      if (alt === '' || (tT.length >= 2 && overlap === 0)) {
        report.heroAltMismatch.push(`${rel} | title:"${tClean.slice(0, 45)}" alt:"${alt.slice(0, 45)}"`);
      }
    }
  }
}

const show = (k, arr, max = 12) => {
  console.log(`\n## ${k}: ${arr.length}`);
  arr.slice(0, max).forEach(x => console.log('  -', x));
  if (arr.length > max) console.log(`  ... +${arr.length - max} más`);
};

console.log(`ARCHIVOS AUDITADOS: ${report.files} · imgs Amazon CDN: ${report.amazonImgCount}`);
show('A1 Search links /s?k= (ROI -30-50%)', report.searchLinks);
show('A2 Shortlinks amzn.to (drift)', report.shortLinks);
show('A3 Amazon sin tag afiliado', report.missingTag);
show('A4 Afiliado sin rel=sponsored', report.badRel);
show('B Imagenes locales ROTAS (404)', report.brokenLocalImg, 20);
show('C1 SIN app CTA (ni stores ni cro.js)', report.noAppCta);
show('C2 Sin cro.js', report.noCroJs, 6);
show('C3 Sin newsletter.js', report.noNewsletterJs, 6);
show('D1 Sin canonical', report.noCanonical);
show('D2 Sin meta description', report.noDescription);
show('D3 Title >65 chars', report.longTitle, 6);
show('E Hero alt no coincide con title', report.heroAltMismatch, 20);

fs.writeFileSync(path.join(__dirname, 'audit-blog-11jun.json'), JSON.stringify(report, null, 2));
console.log('\nJSON completo: tmp/audit-blog-11jun.json');
