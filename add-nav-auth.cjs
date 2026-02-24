/**
 * Add Entrar/Registrarse buttons to all navs across the site.
 * Targets: blog articles, blog/index.html, cities/index.html, equipamiento pages,
 * cities individual pages, author pages.
 */

const fs = require('fs');
const path = require('path');

const authButtons = `
  <div class="nav-auth" style="display:flex;gap:8px;align-items:center">
    <a href="/" style="color:#94a3b8;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">Entrar</a>
    <a href="/" style="background:#f97316;color:#fff;font-size:.85rem;font-weight:700;padding:6px 16px;border-radius:999px;text-decoration:none">Registrarse</a>
  </div>`;

// Collect all HTML files to process
const dirs = [
  path.join(__dirname, 'blog'),
  path.join(__dirname, 'blog', 'autor'),
  path.join(__dirname, 'cities'),
  path.join(__dirname, 'equipamiento'),
];

let updated = 0;
let skipped = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf-8');

    // Skip if already has auth buttons
    if (html.includes('nav-auth')) {
      skipped++;
      continue;
    }

    // Pattern 1: </div>\n</nav> (nav-wrapper style with closing div for nav-links)
    // We want to insert before </nav>

    // Find the nav closing tag - insert auth buttons before it
    // Handle both patterns:
    // Pattern A: </div>\n</nav> (standard blog articles)
    // Pattern B: </div>\n</nav>\n</div> (nav-wrapper wrapped)

    let changed = false;

    // Try to insert before </nav> but after the nav-links div closes
    if (html.includes('class="nav-links"') || html.includes("class='nav-links'")) {
      // Find the closing </nav> and insert before it
      const navCloseIndex = html.indexOf('</nav>');
      if (navCloseIndex !== -1) {
        html = html.slice(0, navCloseIndex) + authButtons + '\n' + html.slice(navCloseIndex);
        changed = true;
      }
    } else if (html.includes('nav-links')) {
      // Some files might have inline nav-links
      const navCloseIndex = html.indexOf('</nav>');
      if (navCloseIndex !== -1) {
        html = html.slice(0, navCloseIndex) + authButtons + '\n' + html.slice(navCloseIndex);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, html, 'utf-8');
      updated++;
    } else {
      skipped++;
    }
  }
}

// Also process sobre-nosotros.html and inversores.html in root
const rootFiles = ['sobre-nosotros.html', 'inversores.html'];
for (const file of rootFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf-8');

  if (html.includes('nav-auth')) {
    skipped++;
    continue;
  }

  if (html.includes('</nav>')) {
    const navCloseIndex = html.indexOf('</nav>');
    html = html.slice(0, navCloseIndex) + authButtons + '\n' + html.slice(navCloseIndex);
    fs.writeFileSync(filePath, html, 'utf-8');
    updated++;
  } else {
    skipped++;
  }
}

console.log(`✓ Auth buttons added: ${updated} files updated, ${skipped} skipped`);
