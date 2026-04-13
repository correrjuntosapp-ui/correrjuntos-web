#!/usr/bin/env node
/**
 * fix-nav-all.cjs
 * Unifies the navigation bar and footer social links across ALL HTML files
 * in: /planes/, /carreras/, /events/, /matching/, /cities/, /places/
 *
 * Does NOT touch /blog/ files or index.html
 *
 * Usage: node tools/fix-nav-all.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Directories to process
const TARGET_DIRS = [
  'planes',
  'carreras',
  'events',
  'matching',
  'cities',
  'places',
];

// ─── Unified nav HTML generator ─────────────────────────────────────────
function getUnifiedNav(activeSection) {
  const links = [
    { href: '/planes/', label: 'Planes', section: 'planes' },
    { href: '/blog/', label: 'Blog', section: 'blog' },
    { href: '/carreras/', label: 'Carreras', section: 'carreras' },
    { href: '/#pricing', label: 'Precios', section: 'pricing' },
  ];

  const linkItems = links.map(l => {
    const color = (l.section === activeSection) ? '#f97316' : '#3d3229';
    return `    <a href="${l.href}" style="color:${color};text-decoration:none">${l.label}</a>`;
  }).join('\n');

  return `<header class="site-header" style="position:sticky;top:0;z-index:100;background:rgba(254,247,237,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.06)">
<nav style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px">
  <a href="/" style="text-decoration:none;font-weight:900;font-size:1.1rem;letter-spacing:-.02em"><span style="color:#3d3229">CORRER</span><span style="color:#f97316">JUNTOS</span></a>
  <div style="display:flex;gap:24px;align-items:center;font-size:.9rem;font-weight:600">
${linkItems}
    <a href="https://apps.apple.com/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer" style="background:#f97316;color:#fff;padding:8px 20px;border-radius:100px;font-weight:700;font-size:.85rem;text-decoration:none">Descargar App</a>
  </div>
</nav>
</header>`;
}

// ─── Unified footer social links ────────────────────────────────────────
const UNIFIED_SOCIAL = `<div class="footer-social">
      <a href="https://instagram.com/correrjuntosapp/" target="_blank" rel="noopener" aria-label="Instagram"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
      <a href="https://tiktok.com/@correrjuntosapp" target="_blank" rel="noopener" aria-label="TikTok"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg></a>
      <a href="https://es.pinterest.com/correrjuntos/" target="_blank" rel="noopener" aria-label="Pinterest"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg></a>
    </div>`;

// ─── Detect section from file path ──────────────────────────────────────
function detectSection(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel.startsWith('planes/')) return 'planes';
  if (rel.startsWith('carreras/')) return 'carreras';
  if (rel.startsWith('events/')) return 'events';
  if (rel.startsWith('matching/')) return 'matching';
  if (rel.startsWith('cities/')) return 'cities';
  if (rel.startsWith('places/')) return 'places';
  return '';
}

// ─── Collect all HTML files recursively ─────────────────────────────────
function collectHtmlFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── Replace nav ────────────────────────────────────────────────────────
function replaceNav(html, section) {
  const newNav = getUnifiedNav(section);

  // Strategy: find the first <div class="nav-wrapper"> ... </nav> ... </div> block
  // OR find <nav ... </nav> if no nav-wrapper
  // Then replace it with the unified header

  // Pattern 1: <div class="nav-wrapper">...<nav...>...</nav>...</div>
  // We need to match the nav-wrapper div that wraps the nav
  const navWrapperRegex = /<div\s+class="nav-wrapper"[^>]*>[\s\S]*?<nav[\s\S]*?<\/nav>[\s\S]*?<\/div>/i;
  const navWrapperMatch = html.match(navWrapperRegex);

  if (navWrapperMatch) {
    return html.replace(navWrapperMatch[0], newNav);
  }

  // Pattern 2: standalone <nav ...>...</nav>
  const navRegex = /<nav[\s\S]*?<\/nav>/i;
  const navMatch = html.match(navRegex);

  if (navMatch) {
    return html.replace(navMatch[0], newNav);
  }

  // No nav found — skip
  return null;
}

// ─── Remove "Volver al Blog" links outside /blog/ ──────────────────────
function removeVolverAlBlog(html) {
  // Remove links/elements containing "Volver al Blog"
  // Various patterns: <a ...>Volver al Blog</a>, <a ...>← Volver al Blog</a>
  const pattern = /<a[^>]*>[^<]*Volver al Blog[^<]*<\/a>/gi;
  return html.replace(pattern, '');
}

// ─── Replace footer social links ────────────────────────────────────────
function replaceFooterSocial(html) {
  // Pattern 1: <div class="footer-social">...</div>
  const footerSocialRegex = /<div\s+class="footer-social"[^>]*>[\s\S]*?<\/div>/i;
  const match = html.match(footerSocialRegex);
  if (match) {
    return html.replace(match[0], UNIFIED_SOCIAL);
  }

  return html;
}

// ─── Main ───────────────────────────────────────────────────────────────
function main() {
  let totalFiles = 0;
  let modifiedFiles = 0;
  let navReplaced = 0;
  let socialReplaced = 0;
  let volverRemoved = 0;
  const errors = [];
  const skipped = [];

  console.log('=== fix-nav-all.cjs ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no files will be written)' : 'LIVE'}`);
  console.log(`Root: ${ROOT}\n`);

  for (const dir of TARGET_DIRS) {
    const dirPath = path.join(ROOT, dir);
    const files = collectHtmlFiles(dirPath);

    console.log(`[${dir}/] Found ${files.length} HTML files`);

    for (const filePath of files) {
      totalFiles++;
      const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');

      try {
        let html = fs.readFileSync(filePath, 'utf-8');
        const originalHtml = html;
        let changed = false;

        // 1. Detect section
        const section = detectSection(filePath);

        // 2. Replace nav
        const navResult = replaceNav(html, section);
        if (navResult !== null) {
          if (navResult !== html) {
            html = navResult;
            navReplaced++;
            changed = true;
          }
        } else {
          skipped.push(`${relPath} (no nav found)`);
        }

        // 3. Remove "Volver al Blog" links
        const beforeVolver = html;
        html = removeVolverAlBlog(html);
        if (html !== beforeVolver) {
          volverRemoved++;
          changed = true;
        }

        // 4. Replace footer social links
        const beforeSocial = html;
        html = replaceFooterSocial(html);
        if (html !== beforeSocial) {
          socialReplaced++;
          changed = true;
        }

        // 5. Write file if changed
        if (changed) {
          if (!DRY_RUN) {
            fs.writeFileSync(filePath, html, 'utf-8');
          }
          modifiedFiles++;
          console.log(`  [OK] ${relPath}`);
        }
      } catch (err) {
        errors.push(`${relPath}: ${err.message}`);
        console.error(`  [ERROR] ${relPath}: ${err.message}`);
      }
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total HTML files scanned: ${totalFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Nav bars replaced: ${navReplaced}`);
  console.log(`Footer social replaced: ${socialReplaced}`);
  console.log(`"Volver al Blog" links removed: ${volverRemoved}`);

  if (skipped.length > 0) {
    console.log(`\nSkipped (no nav found): ${skipped.length}`);
    skipped.forEach(s => console.log(`  - ${s}`));
  }

  if (errors.length > 0) {
    console.log(`\nErrors: ${errors.length}`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log(`\nDone.${DRY_RUN ? ' (dry run - no files written)' : ''}`);
}

main();
