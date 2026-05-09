// Reemplaza Jose Marquez (todas variantes) → Abraham Márquez Rodríguez
// en meta tags + schema.org de los articles del blog.
// Mantiene URL /blog/autor/abraham-marquez (renombramos jose-marquez)
// para coherencia con el author.js.

const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.html')) files.push(p);
  }
  return files;
}

const repl = [
  // Meta name="author" content="..."
  ['content="Jose Marquez"', 'content="Abraham Márquez Rodríguez"'],
  ['content="Jos&eacute; M&aacute;rquez"', 'content="Abraham M&aacute;rquez Rodr&iacute;guez"'],
  ['content="José Márquez"', 'content="Abraham Márquez Rodríguez"'],

  // Schema.org Person.name (varias formas de espaciado)
  ['"name": "Jose Marquez"', '"name": "Abraham Márquez Rodríguez"'],
  ['"name":"Jose Marquez"', '"name":"Abraham Márquez Rodríguez"'],
  ['"name": "José Márquez"', '"name": "Abraham Márquez Rodríguez"'],
  ['"name":"José Márquez"', '"name":"Abraham Márquez Rodríguez"'],
  ['"name": "Jos&eacute; M&aacute;rquez"', '"name": "Abraham M&aacute;rquez Rodr&iacute;guez"'],
  ['"name":"Jos&eacute; M&aacute;rquez"', '"name":"Abraham M&aacute;rquez Rodr&iacute;guez"'],

  // URL canónica del autor (página perfil)
  ['/blog/autor/jose-marquez', '/blog/autor/abraham-marquez'],

  // Visible byline en .meta line ("Por José Márquez · 10 min lectura")
  ['Por Jose Marquez', 'Por Abraham Márquez Rodríguez'],
  ['Por José Márquez', 'Por Abraham Márquez Rodríguez'],
  ['Por Jos&eacute; M&aacute;rquez', 'Por Abraham M&aacute;rquez Rodr&iacute;guez'],

  // Static author-box anchor text (>...< )
  ['>José Márquez<', '>Abraham Márquez Rodríguez<'],
  ['>Jose Marquez<', '>Abraham Márquez Rodríguez<'],
  ['>Jos&eacute; M&aacute;rquez<', '>Abraham M&aacute;rquez Rodr&iacute;guez<'],

  // Static author-box img alt + the SVG icon path
  ['alt="José Márquez"', 'alt="Abraham Márquez Rodríguez"'],
  ['alt="Jose Marquez"', 'alt="Abraham Márquez Rodríguez"'],
  ['alt="Jos&eacute; M&aacute;rquez"', 'alt="Abraham M&aacute;rquez Rodr&iacute;guez"'],
  ['/icons/autor-jose-marquez.svg', '/public/abraham.jpg'],

  // OG profile + page title fallbacks
  ['property="og:title" content="José Márquez', 'property="og:title" content="Abraham Márquez Rodríguez'],
  ['property="og:title" content="Jose Marquez', 'property="og:title" content="Abraham Márquez Rodríguez'],

  // English bylines
  ['By Jose Marquez', 'By Abraham Márquez Rodríguez'],
  ['By José Márquez', 'By Abraham Márquez Rodríguez'],
  ['By Jos&eacute; M&aacute;rquez', 'By Abraham M&aacute;rquez Rodr&iacute;guez'],

  // Spanish byline sin "Por" (· José Márquez ·)
  ['&middot; José Márquez &middot;', '&middot; Abraham Márquez Rodríguez &middot;'],
  ['&middot; Jose Marquez &middot;', '&middot; Abraham Márquez Rodríguez &middot;'],
  ['&middot; Jos&eacute; M&aacute;rquez &middot;', '&middot; Abraham M&aacute;rquez Rodr&iacute;guez &middot;'],
  // Variantes con bullet · normal Unicode
  [' · José Márquez · ', ' · Abraham Márquez Rodríguez · '],
  [' · Jose Marquez · ', ' · Abraham Márquez Rodríguez · '],

  // <h4>...</h4> heading (página autor preview)
  ['<h4>José Márquez', '<h4>Abraham Márquez Rodríguez'],
  ['<h4>Jose Marquez', '<h4>Abraham Márquez Rodríguez'],

  // Inline quote: "José Márquez, running coach"
  ['Jos&eacute; M&aacute;rquez, running coach', 'Abraham M&aacute;rquez Rodr&iacute;guez, running coach'],
  ['José Márquez, running coach', 'Abraham Márquez Rodríguez, running coach'],
  ['Jose Marquez, running coach', 'Abraham Márquez Rodríguez, running coach'],

  // Final aggressive: cualquier ocurrencia restante
  // (Jose y José los reemplazamos completos — son el mismo founder)
  ['Jos&eacute; M&aacute;rquez', 'Abraham M&aacute;rquez Rodr&iacute;guez'],
  ['José Márquez', 'Abraham Márquez Rodríguez'],
  ['Jose Marquez', 'Abraham Márquez Rodríguez'],
];

let filesChanged = 0;
let totalReplacements = 0;

for (const f of walk('blog')) {
  let txt = fs.readFileSync(f, 'utf8');
  let modCount = 0;
  for (const [from, to] of repl) {
    if (txt.includes(from)) {
      const matches = txt.split(from).length - 1;
      txt = txt.split(from).join(to);
      modCount += matches;
    }
  }
  if (modCount > 0) {
    fs.writeFileSync(f, txt);
    filesChanged++;
    totalReplacements += modCount;
  }
}

console.log(`✓ Files changed: ${filesChanged}`);
console.log(`✓ Total replacements: ${totalReplacements}`);
