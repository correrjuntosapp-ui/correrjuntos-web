/**
 * Add "image" field to Article schema in all blog articles.
 * Uses the og-image.png as fallback since articles don't have unique featured images.
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');

let updated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');

  // Check if Article schema exists but lacks image field
  if (html.includes('"@type":"Article"') || html.includes('"@type": "Article"')) {
    // Check if image already exists in the Article schema
    // Look for "image" near the Article type definition
    const articleMatch = html.match(/"@type"\s*:\s*"Article"[\s\S]*?"publisher"/);
    if (articleMatch && articleMatch[0].includes('"image"')) {
      skipped++;
      continue;
    }

    // Add image field after inLanguage or after dateModified
    // Pattern: add after "inLanguage":"es-ES" or "inLanguage": "es-ES"
    const patterns = [
      {
        find: /"inLanguage"\s*:\s*"es-ES"/,
        replace: (match) => `${match},\n      "image":"https://www.correrjuntos.com/icons/og-image.png"`
      },
      {
        find: /"dateModified"\s*:\s*"([^"]+)"/,
        replace: (match) => `${match},\n      "image":"https://www.correrjuntos.com/icons/og-image.png"`
      }
    ];

    let changed = false;
    for (const p of patterns) {
      if (p.find.test(html) && !changed) {
        // Only add if not already present near the Article schema
        const beforeReplace = html;
        html = html.replace(p.find, p.replace);
        if (html !== beforeReplace) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, html, 'utf-8');
      updated++;
    } else {
      skipped++;
    }
  } else {
    skipped++;
  }
}

console.log(`Schema image field added: ${updated} files updated, ${skipped} skipped`);
