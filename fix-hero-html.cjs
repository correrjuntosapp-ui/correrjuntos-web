const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content', 'swim-together'].includes(entry.name)) continue;
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html') && fullPath !== path.join(BASE_DIR, 'index.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const HERO_IMAGES = {
  training: 'https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  nutrition: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  shoes: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  tech: 'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  trail: 'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  health: 'https://images.pexels.com/photos/4056832/pexels-photo-4056832.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  routes: 'https://images.pexels.com/photos/4652250/pexels-photo-4652250.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  group: 'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  race: 'https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70',
  general: 'https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70'
};

function getCategoryFromFilename(filename) {
  const f = filename.toLowerCase();
  if (/zapatilla|shoe|nike|adidas|hoka|asics|saucony|new.balance|brooks|pegasus|vaporfly|ultraboost|gel-nimbus|gel-kayano|novablast|clifton|bondi|mach/.test(f)) return 'shoes';
  if (/nutri|dieta|alimento|comida|comer|food|protein|hidrat|ayuno|breakfast|carbohidrat|hierro|magnesio|suplemento|desayuno|antiinflam|vitamina|cafeina|caffeine|electrolito/.test(f)) return 'nutrition';
  if (/trail|montana|mountain|ultra/.test(f)) return 'trail';
  if (/lesion|injury|dolor|pain|rodilla|knee|estiram|stretch|calambr|recuper|fascitis|tendin|shin|splint|tobillo|ankle|physio|fisio|sobreentren|overtraining/.test(f)) return 'health';
  if (/ruta|route|circuito|parque|park|mejor.*correr/.test(f)) return 'routes';
  if (/apple.watch|garmin|coros|polar|gps|tech|reloj|watch|strava|app.*running|wearable|smartwatch|suunto|fitbit/.test(f)) return 'tech';
  if (/grupo|group|comunidad|community|social|partner|compa.ero|juntos|motivaci|amigo|club/.test(f)) return 'group';
  if (/maraton|marathon|carrera|race|competicion|media.marat|10k|5k|42k|21k|preparar.*carrera|primera.*carrera/.test(f)) return 'race';
  if (/plan|entren|train|interval|fartlek|tempo|ritmo|pace|vo2|cadencia|velocidad|kilometr|principiante|beginner|correr.*empezar|empezar.*correr|start.*running|running.*plan|warm.?up|calentamiento|series|repeticion/.test(f)) return 'training';
  return 'general';
}

function normPath(p) { return p.replace(/\\/g, '/'); }

const files = getAllHtmlFiles(BASE_DIR);
let count = 0;

files.forEach(filePath => {
  const rel = normPath(path.relative(BASE_DIR, filePath));

  // Only blog articles (not index, not categoria, not autor)
  if (!/^blog\//.test(rel)) return;
  if (rel.includes('index.html') || rel.includes('categoria/') || rel.includes('autor/')) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if hero-bg HTML already exists (check for the actual HTML tag, not CSS)
  if (html.includes('<div class="hero-bg">')) return;
  // Must have a hero div
  if (!html.includes('<div class="hero">')) return;

  const filename = path.basename(filePath, '.html');
  const category = getCategoryFromFilename(filename);
  const imageUrl = HERO_IMAGES[category];

  const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
  const altText = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').substring(0, 80) : 'Running';

  // Step 1: Replace opening hero div
  html = html.replace(
    '<div class="hero">',
    '<div class="hero">\n  <div class="hero-bg"><img src="' + imageUrl + '" alt="' + altText + '" loading="eager"></div>\n  <div class="hero-content">'
  );

  // Step 2: Close hero-content before the hero closing div
  // The pattern is: </div> (closing meta) then </div> (closing hero) then <div class="container content">
  // Use a simple approach: find the meta div line and the following </div>
  html = html.replace(
    /(<div class="meta">[\s\S]*?<\/div>)\s*\n<\/div>\s*\n+<div class="container content">/,
    '$1\n  </div>\n</div>\n\n<div class="container content">'
  );

  // Step 3: Update og:image and twitter:image
  html = html.replace(
    /content="https:\/\/www\.correrjuntos\.com\/icons\/og-image\.png\?v=2"/g,
    'content="' + imageUrl + '"'
  );

  fs.writeFileSync(filePath, html, 'utf8');
  count++;
  console.log('  ✓ ' + rel + ' [' + category + ']');
});

console.log('\nDone! Fixed hero HTML in ' + count + ' files');
