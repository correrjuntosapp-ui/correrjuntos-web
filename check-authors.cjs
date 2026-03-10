const fs = require('fs');
const path = require('path');

function walk(dir, ext) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'autor' && e.name !== 'js' && e.name !== 'node_modules') {
      results.push(...walk(p, ext));
    } else if (e.isFile() && e.name.endsWith(ext)) {
      results.push(p);
    }
  }
  return results;
}

const files = walk('blog', '.html');
let jmMeta = 0, crMeta = 0, noMeta = 0;
let jmWithCRbox = [];
let crWithJMbox = [];
let hasStaticBox = 0, noStaticBox = 0;
let hasDynAuthorJS = 0;

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');

  // Meta author
  const metaM = c.match(/meta name="author" content="([^"]+)"/);
  if (!metaM) { noMeta++; continue; }
  const author = metaM[1];
  if (author === 'Jose Marquez') jmMeta++;
  else crMeta++;

  // Static author-box
  const boxM = c.match(/autor-(carlos-ruiz|jose-marquez)\.svg/);
  if (boxM) {
    hasStaticBox++;
    const boxAuthor = boxM[1];
    if (author === 'Jose Marquez' && boxAuthor === 'carlos-ruiz') {
      jmWithCRbox.push(path.basename(f));
    }
    if (author === 'Carlos Ruiz' && boxAuthor === 'jose-marquez') {
      crWithJMbox.push(path.basename(f));
    }
  } else {
    noStaticBox++;
  }

  // Dynamic author.js
  if (c.includes('author.js')) hasDynAuthorJS++;
}

console.log('=== AUTHOR AUDIT ===');
console.log(`Total articles: ${files.length}`);
console.log(`Meta JM (José Márquez): ${jmMeta}`);
console.log(`Meta CR (Carlos Ruiz): ${crMeta}`);
console.log(`No meta author: ${noMeta}`);
console.log(`Has static author-box: ${hasStaticBox}`);
console.log(`No static author-box: ${noStaticBox}`);
console.log(`Has author.js: ${hasDynAuthorJS}`);
console.log(`\n--- MISMATCHES ---`);
console.log(`JM articles with CR box: ${jmWithCRbox.length}`);
jmWithCRbox.forEach(f => console.log(`  ❌ ${f}`));
console.log(`CR articles with JM box: ${crWithJMbox.length}`);
crWithJMbox.forEach(f => console.log(`  ❌ ${f}`));
