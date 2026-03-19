const fs = require('fs');
let xml = fs.readFileSync('sitemap-blog-en.xml','utf8');

const newSlugs = [
  'running-plan-lose-weight',
  'zone-2-running-burn-fat',
  'how-many-calories-burned-running',
  'what-to-eat-before-running',
  'what-to-eat-after-running',
  'gluten-free-foods-for-runners',
  'best-foods-for-runners',
  'how-to-stay-motivated-to-run',
  'how-to-build-running-habit',
  'running-improves-mental-health',
  'find-running-partners-near-you',
  'how-to-organize-running-meetups'
];

const entries = newSlugs.map(s => `  <url>
    <loc>https://www.correrjuntos.com/blog/en/${s}</loc>
    <lastmod>2026-03-16</lastmod>
  </url>`).join('\n');

xml = xml.replace('</urlset>', entries + '\n</urlset>');

fs.writeFileSync('sitemap-blog-en.xml', xml);
console.log(`Added ${newSlugs.length} URLs to sitemap-blog-en.xml`);
