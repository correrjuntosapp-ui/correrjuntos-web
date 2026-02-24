/**
 * Add twitter:site to all pages that have twitter:card but missing twitter:site
 */
const fs = require('fs');
const path = require('path');

const dirs = ['blog', 'cities', 'equipamiento'];
let count = 0;

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) return;
  fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).forEach(file => {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('twitter:card') && !html.includes('twitter:site')) {
      html = html.replace(
        /<meta\s+name="twitter:card"\s+content="[^"]*">/,
        match => match + '\n    <meta name="twitter:site" content="@CorrerJuntos">'
      );
      fs.writeFileSync(filePath, html, 'utf8');
      count++;
    }
  });
});
console.log(`✓ twitter:site added to ${count} pages`);
