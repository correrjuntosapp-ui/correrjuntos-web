const fs = require('fs');
let xml = fs.readFileSync('sitemap-blog-es.xml','utf8');

const newSlugs = [
  'plan-running-perder-peso',
  'zona-2-running-quemar-grasa',
  'cuantas-calorias-se-queman-corriendo',
  'que-comer-despues-de-correr',
  'alimentos-sin-gluten-para-corredores',
  'mejores-alimentos-para-runners',
  'como-mantener-motivacion-para-correr',
  'como-crear-habito-de-correr',
  'correr-mejora-salud-mental',
  'encontrar-companeros-running-cerca',
  'como-organizar-quedadas-running'
];

const entries = newSlugs.map(s => `  <url>
    <loc>https://www.correrjuntos.com/blog/${s}</loc>
    <lastmod>2026-03-16</lastmod>
  </url>`).join('\n');

xml = xml.replace('</urlset>', entries + '\n</urlset>');

fs.writeFileSync('sitemap-blog-es.xml', xml);
console.log(`Added ${newSlugs.length} URLs to sitemap-blog-es.xml`);
