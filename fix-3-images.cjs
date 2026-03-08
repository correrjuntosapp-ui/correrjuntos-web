const fs = require('fs');
const changes = [
  {
    esSlugs: ['gorras-running'],
    enSlugs: ['running-caps'],
    oldPexelsId: '3039888',
    newPexelsId: '704857',
  },
];

function replaceInFile(file, oldId, newId) {
  if (!fs.existsSync(file)) return 0;
  let c = fs.readFileSync(file, 'utf8');
  const re = new RegExp('photos/' + oldId + '/pexels-photo-' + oldId, 'g');
  const count = (c.match(re) || []).length;
  if (!count) return 0;
  c = c.replace(re, 'photos/' + newId + '/pexels-photo-' + newId);
  fs.writeFileSync(file, c);
  return count;
}

const indexFiles = ['blog/index.html', 'blog/en/index.html'];
for (const file of indexFiles) {
  let content = fs.readFileSync(file, 'utf8');
  for (const ch of changes) {
    for (const slug of [...ch.esSlugs, ...ch.enSlugs]) {
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(
        '(href=["\'][^"\']*' + escaped + '["\'][\\s\\S]{0,500}?photos/)(\\d+)(/pexels-photo-)(\\d+)', 'g'
      );
      content = content.replace(re, (m, before, old1, mid, old2) => {
        if (old1 === ch.newPexelsId) return m;
        console.log(`  ${file}: ${slug} ${old1} → ${ch.newPexelsId}`);
        return before + ch.newPexelsId + mid + ch.newPexelsId;
      });
    }
  }
  fs.writeFileSync(file, content);
}

let rel = fs.readFileSync('blog/related.js', 'utf8');
for (const ch of changes) {
  for (const slug of [...ch.esSlugs, ...ch.enSlugs]) {
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
      "(s:[\"']" + escaped + "[\"'][\\s\\S]{0,300}?photos/)(\\d+)(/pexels-photo-)(\\d+)", 'g'
    );
    rel = rel.replace(re, (m, before, old1, mid, old2) => {
      console.log(`  related.js: ${slug} ${old1} → ${ch.newPexelsId}`);
      return before + ch.newPexelsId + mid + ch.newPexelsId;
    });
  }
}
fs.writeFileSync('blog/related.js', rel);

for (const ch of changes) {
  for (const slug of ch.esSlugs) {
    const n = replaceInFile('blog/' + slug + '.html', ch.oldPexelsId, ch.newPexelsId);
    if (n) console.log(`  blog/${slug}.html: ${n}`);
  }
  for (const slug of ch.enSlugs) {
    const n = replaceInFile('blog/en/' + slug + '.html', ch.oldPexelsId, ch.newPexelsId);
    if (n) console.log(`  blog/en/${slug}.html: ${n}`);
  }
}
console.log('Done!');
