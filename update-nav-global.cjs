const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// Collect all HTML files (excluding root index.html which uses Tailwind)
function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.claude', 'correr-juntos-app', 'social-content'].includes(entry.name)) continue;
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html') && fullPath !== path.join(BASE_DIR, 'index.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllHtmlFiles(BASE_DIR);
console.log(`Found ${files.length} HTML files to process\n`);

let cssUpdated = 0;
let htmlUpdated = 0;
let skipped = 0;

files.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(BASE_DIR, filePath);
  let changed = false;

  // Skip files without nav-links
  if (!html.includes('nav-links')) {
    skipped++;
    return;
  }

  // === CSS UPDATES ===

  // 1. Update .nav-links rule: add container styling
  // Old: .nav-links{display:flex;gap:6px;font-size:.85rem}
  // New: .nav-links{display:flex;gap:4px;font-size:.85rem;background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)}
  if (html.includes('.nav-links{display:flex;gap:6px;font-size:.85rem}')) {
    html = html.replace(
      '.nav-links{display:flex;gap:6px;font-size:.85rem}',
      '.nav-links{display:flex;gap:4px;font-size:.85rem;background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)}'
    );
    changed = true;
    cssUpdated++;
  }

  // Also handle the formatted version (cities/index.html has formatted CSS)
  if (html.includes('.nav-links{display:flex;gap:6px;font-size:.85rem}') === false &&
      html.includes('gap:6px;font-size:.85rem')) {
    html = html.replace(
      /\.nav-links\{display:flex;gap:6px;font-size:\.85rem\}/g,
      '.nav-links{display:flex;gap:4px;font-size:.85rem;background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)}'
    );
    changed = true;
    cssUpdated++;
  }

  // Handle formatted CSS (like in cities/index.html with indentation)
  html = html.replace(
    /\.nav-links\{display:flex;gap:6px;font-size:\.85rem\}/g,
    '.nav-links{display:flex;gap:4px;font-size:.85rem;background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)}'
  );

  // 2. Update .nav-links a rule: remove individual borders, transparent bg
  // Various patterns found across files
  const oldNavLinkPatterns = [
    '.nav-links a{color:#94a3b8;text-decoration:none;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);transition:all .2s}',
    '.nav-links a{color:#94a3b8;font-weight:600;text-decoration:none;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);transition:all .2s}'
  ];
  const newNavLink = '.nav-links a{color:#94a3b8;text-decoration:none;font-weight:600;padding:7px 16px;border-radius:999px;background:transparent;border:none;transition:all .2s}';

  oldNavLinkPatterns.forEach(pattern => {
    if (html.includes(pattern)) {
      html = html.replace(pattern, newNavLink);
      changed = true;
    }
  });

  // 3. Update hover state
  const oldHoverPatterns = [
    '.nav-links a:hover{color:#f97316;background:rgba(249,115,22,.08);border-color:rgba(249,115,22,.2)}',
    '.nav-links a:hover{color:#f97316;border-color:rgba(249,115,22,.2);background:rgba(249,115,22,.08)}'
  ];
  const newHover = '.nav-links a:hover{color:#f97316;background:rgba(249,115,22,.12)}';

  oldHoverPatterns.forEach(pattern => {
    if (html.includes(pattern)) {
      html = html.replace(pattern, newHover);
      changed = true;
    }
  });

  // 4. Update active state
  const oldActivePatterns = [
    '.nav-links a.active{color:#f97316;background:rgba(249,115,22,.1);border-color:rgba(249,115,22,.25)}',
    '.nav-links a.active{color:#f97316;border-color:rgba(249,115,22,.25);background:rgba(249,115,22,.1)}'
  ];
  const newActive = '.nav-links a.active{color:#fff;background:rgba(249,115,22,.9);font-weight:700}';

  oldActivePatterns.forEach(pattern => {
    if (html.includes(pattern)) {
      html = html.replace(pattern, newActive);
      changed = true;
    }
  });

  // === HTML UPDATES: Add icons to nav links ===

  // Only add icons if not already present (check for emoji)
  if (!html.includes('\uD83C\uDFD9') && html.includes('nav-links')) { // 🏙️
    // Add icons to nav link text
    html = html.replace(/>Ciudades<\/a>/g, '>\uD83C\uDFD9\uFE0F Ciudades</a>');
    html = html.replace(/>Blog<\/a>/g, '>\u270D\uFE0F Blog</a>');
    html = html.replace(/>Equipamiento<\/a>/g, '>\uD83D\uDC5F Equipamiento</a>');
    html = html.replace(/>App<\/a>/g, '>\uD83D\uDCF1 App</a>');
    changed = true;
    htmlUpdated++;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('\u2713 ' + relPath);
  }
});

console.log(`\nDone! CSS updated in ~${cssUpdated} files, HTML icons added in ${htmlUpdated} files, ${skipped} skipped (no nav-links).`);
