const fs = require('fs');
const newUrl = '/blog/img/proteinas-running.jpg';
const esSlugs = ['mejores-proteinas-running'];
const enSlugs = ['best-protein-running'];
const allSlugs = [...esSlugs, ...enSlugs];

let rel = fs.readFileSync('blog/related.js', 'utf8');
allSlugs.forEach(slug => {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp("(s:[\"']" + escaped + "[\"'][\\s\\S]{0,300}?i:[\"'])[^\"']+([\"'])", 'g');
  rel = rel.replace(re, (m, before, quote) => {
    console.log('  related.js: ' + slug + ' -> local');
    return before + newUrl + quote;
  });
});
fs.writeFileSync('blog/related.js', rel);

['blog/index.html', 'blog/en/index.html'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  allSlugs.forEach(slug => {
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(href=["\'][^"\']*' + escaped + '["\'][\\s\\S]{0,500}?img src=")[^"]+(")', 'g');
    c = c.replace(re, (m, before, quote) => {
      console.log('  ' + file + ': ' + slug + ' -> local');
      return before + newUrl + quote;
    });
  });
  fs.writeFileSync(file, c);
});

const oldPatterns = [
  /https:\/\/images\.pexels\.com\/photos\/616404\/pexels-photo-616404\.jpeg[^"']*/g,
];

esSlugs.forEach(slug => {
  const f = 'blog/' + slug + '.html';
  let c = fs.readFileSync(f, 'utf8');
  let count = 0;
  oldPatterns.forEach(p => { count += (c.match(p) || []).length; c = c.replace(p, newUrl); });
  fs.writeFileSync(f, c);
  console.log('  ' + f + ': ' + count + ' replacement(s)');
});

enSlugs.forEach(slug => {
  const f = 'blog/en/' + slug + '.html';
  let c = fs.readFileSync(f, 'utf8');
  let count = 0;
  oldPatterns.forEach(p => { count += (c.match(p) || []).length; c = c.replace(p, newUrl); });
  fs.writeFileSync(f, c);
  console.log('  ' + f + ': ' + count + ' replacement(s)');
});

console.log('Done!');
