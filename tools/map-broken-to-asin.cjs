// Map broken Amazon CDN image URLs → ASIN by reading HTML context
const fs = require('fs');

const audit = JSON.parse(fs.readFileSync('audit-tmp.json', 'utf8'));
const result = [];

for (const item of audit.brokenList) {
  const file = item.files[0]; // First affected file
  const html = fs.readFileSync(file, 'utf8');
  const idx = html.indexOf(item.url);
  if (idx < 0) {
    result.push({ url: item.url, file, asin: null });
    continue;
  }
  // Look for amazon.es/dp/{ASIN} in 1500 chars before the image (the <a> wrapping it)
  const before = html.slice(Math.max(0, idx - 1500), idx);
  const after = html.slice(idx, idx + 500);
  let asinMatch = null;
  // Try to find the LAST /dp/ reference before the URL (closest)
  const beforeMatches = [...before.matchAll(/amazon\.es\/dp\/([A-Z0-9]{10})/g)];
  if (beforeMatches.length > 0) asinMatch = beforeMatches[beforeMatches.length - 1][1];
  // Or after
  if (!asinMatch) {
    const afterMatch = after.match(/amazon\.es\/dp\/([A-Z0-9]{10})/);
    if (afterMatch) asinMatch = afterMatch[1];
  }
  // Try alt= for product name
  const altCtx = html.slice(idx, idx + 200).match(/alt="([^"]{5,80})"/);
  result.push({
    url: item.url,
    file,
    asin: asinMatch,
    alt: altCtx ? altCtx[1] : null,
    files: item.files
  });
}

console.log(JSON.stringify(result, null, 2));
