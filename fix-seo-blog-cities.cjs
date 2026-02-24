/**
 * SEO Fix Script:
 * - #11: Change blog author schema from Organization to Person
 * - #12: Add hreflang="es" to city pages and blog posts that only have x-default
 * - #8: Add specific og:image for city pages using their Unsplash hero images
 * - #7: Add font preload to blog/cities/equipamiento pages
 */
const fs = require('fs');
const path = require('path');

// === #11: Fix blog author schema ===
const blogDir = path.join(__dirname, 'blog');
const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');

let authorFixed = 0;
blogFiles.forEach(file => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Change author from Organization to Person
  const oldAuthor = `"author": {
        "@type": "Organization",
        "name": "CorrerJuntos",
        "url": "https://www.correrjuntos.com"
      }`;
  const newAuthor = `"author": {
        "@type": "Person",
        "name": "Carlos Ruiz",
        "url": "https://www.correrjuntos.com/blog/",
        "jobTitle": "Editor de Running"
      }`;

  if (html.includes('"@type": "Organization"') && html.includes('"author"')) {
    // More flexible replacement
    html = html.replace(
      /"author"\s*:\s*\{\s*"@type"\s*:\s*"Organization"\s*,\s*"name"\s*:\s*"CorrerJuntos"\s*,\s*"url"\s*:\s*"https:\/\/www\.correrjuntos\.com"\s*\}/g,
      `"author": {\n        "@type": "Person",\n        "name": "Carlos Ruiz",\n        "url": "https://www.correrjuntos.com/blog/",\n        "jobTitle": "Editor de Running"\n      }`
    );
    authorFixed++;
  }

  // Also update the visible "Por Equipo CorrerJuntos" text
  html = html.replace(
    /Por Equipo CorrerJuntos/g,
    'Por Carlos Ruiz'
  );

  fs.writeFileSync(filePath, html, 'utf8');
});
console.log(`✓ #11: Author schema fixed in ${authorFixed} blog articles`);

// Also fix blog index "Por Equipo CorrerJuntos" references
const blogIndex = path.join(blogDir, 'index.html');
let blogIdxHtml = fs.readFileSync(blogIndex, 'utf8');
blogIdxHtml = blogIdxHtml.replace(/Por Equipo CorrerJuntos/g, 'Por Carlos Ruiz');
// Fix author in schema if present
blogIdxHtml = blogIdxHtml.replace(
  /"author"\s*:\s*\{\s*"@type"\s*:\s*"Organization"\s*,\s*"name"\s*:\s*"CorrerJuntos"\s*,\s*"url"\s*:\s*"https:\/\/www\.correrjuntos\.com"\s*\}/g,
  `"author": {\n        "@type": "Person",\n        "name": "Carlos Ruiz",\n        "url": "https://www.correrjuntos.com/blog/",\n        "jobTitle": "Editor de Running"\n      }`
);
fs.writeFileSync(blogIndex, blogIdxHtml, 'utf8');

// === #12: Fix hreflang in city pages ===
const citiesDir = path.join(__dirname, 'cities');
const cityFiles = fs.readdirSync(citiesDir).filter(f => f.endsWith('.html'));

let hreflangFixed = 0;
cityFiles.forEach(file => {
  const filePath = path.join(citiesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const slug = file.replace('.html', '');
  const baseUrl = file === 'index.html'
    ? 'https://www.correrjuntos.com/cities/'
    : `https://www.correrjuntos.com/cities/${file}`;

  // Check if missing es hreflang
  if (!/<link[^>]+hreflang="es"/.test(html)) {
    // Add es hreflang before x-default
    const xDefaultMatch = html.match(/<link[^>]+hreflang="x-default"[^>]*>/);
    if (xDefaultMatch) {
      html = html.replace(
        xDefaultMatch[0],
        `<link rel="alternate" hreflang="es" href="${baseUrl}">\n    ${xDefaultMatch[0]}`
      );
      hreflangFixed++;
    }
  }

  fs.writeFileSync(filePath, html, 'utf8');
});
console.log(`✓ #12: Hreflang 'es' added to ${hreflangFixed} city pages`);

// Fix hreflang in blog posts too
let blogHreflangFixed = 0;
const allBlogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
allBlogFiles.forEach(file => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const baseUrl = file === 'index.html'
    ? 'https://www.correrjuntos.com/blog/'
    : `https://www.correrjuntos.com/blog/${file}`;

  // If no hreflang at all, add both es and x-default after canonical
  if (!/<link[^>]+hreflang=/.test(html)) {
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]*>/);
    if (canonical) {
      html = html.replace(
        canonical[0],
        `${canonical[0]}\n    <link rel="alternate" hreflang="es" href="${baseUrl}">\n    <link rel="alternate" hreflang="x-default" href="${baseUrl}">`
      );
      blogHreflangFixed++;
    }
  } else if (!/<link[^>]+hreflang="es"/.test(html)) {
    // Has x-default but missing es
    const xDefault = html.match(/<link[^>]+hreflang="x-default"[^>]*>/);
    if (xDefault) {
      html = html.replace(
        xDefault[0],
        `<link rel="alternate" hreflang="es" href="${baseUrl}">\n    ${xDefault[0]}`
      );
      blogHreflangFixed++;
    }
  }

  fs.writeFileSync(filePath, html, 'utf8');
});
console.log(`✓ #12: Hreflang added to ${blogHreflangFixed} blog posts`);

// === #8: Add og:image for city pages using Unsplash images ===
// Read cities/index.html to get image mapping
const citiesIndex = fs.readFileSync(path.join(citiesDir, 'index.html'), 'utf8');
const imgMap = {};
const cardRegex = /href="([^"]+\.html)"[^>]*>[\s\S]*?url\('(https:\/\/images\.unsplash\.com\/[^']+)'\)/g;
let m;
while ((m = cardRegex.exec(citiesIndex)) !== null) {
  const cityFile = m[1].replace('./', '');
  // Use a wider crop for OG image (1200x630 is standard)
  const imgUrl = m[2].replace(/w=\d+/, 'w=1200').replace(/h=\d+/, 'h=630').replace(/q=\d+/, 'q=80');
  imgMap[cityFile] = imgUrl;
}

let ogFixed = 0;
cityFiles.forEach(file => {
  if (file === 'index.html') return;
  const filePath = path.join(citiesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const img = imgMap[file];
  if (!img) return;

  // Replace generic og:image with city-specific one
  const ogImgRegex = /<meta\s+property="og:image"\s+content="[^"]*">/;
  if (ogImgRegex.test(html)) {
    html = html.replace(ogImgRegex,
      `<meta property="og:image" content="${img}">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">`
    );
    ogFixed++;
  }

  // Also fix twitter:image
  const twImgRegex = /<meta\s+(name|property)="twitter:image"\s+content="[^"]*">/;
  if (twImgRegex.test(html)) {
    html = html.replace(twImgRegex, `<meta name="twitter:image" content="${img}">`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
});
console.log(`✓ #8: City-specific OG images set for ${ogFixed} city pages`);

// === #7: Add font preload to blog/cities/equipamiento pages ===
const allDirs = ['blog', 'cities', 'equipamiento'];
let preloadAdded = 0;

allDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has preconnect to fonts
    if (html.includes('preconnect') && html.includes('fonts.googleapis.com')) return;

    // Add preconnect before the first <link> or <style> tag
    const insertPoint = html.match(/<link\s+rel="canonical"/);
    if (insertPoint) {
      html = html.replace(
        insertPoint[0],
        `<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    ${insertPoint[0]}`
      );
      preloadAdded++;
    }

    fs.writeFileSync(filePath, html, 'utf8');
  });
});
console.log(`✓ #7: Font preconnect added to ${preloadAdded} pages`);
