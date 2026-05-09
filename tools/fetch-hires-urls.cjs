// Fetch hiRes Amazon image URLs for a batch of ASINs (using curl)
const { execSync } = require('child_process');
const fs = require('fs');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

// Use spawnSync with array args to avoid shell escaping issues with special chars in UA / URL
const { spawnSync } = require('child_process');

function fetchPage(url) {
  const r = spawnSync('curl', ['-s', '--max-time', '15', '-A', UA, '-H', 'Accept-Language: es-ES,es', url], {
    maxBuffer: 50 * 1024 * 1024,
    encoding: 'utf8'
  });
  return r.stdout || '';
}

function checkSize(url) {
  const r = spawnSync('curl', ['-s', '--max-time', '8', '-o', '/dev/null', '-w', '%{size_download}', url], {
    encoding: 'utf8'
  });
  return parseInt(r.stdout, 10) || 0;
}

async function getHiRes(asin) {
  const html = fetchPage(`https://www.amazon.es/dp/${asin}`);
  if (!html) return { asin, url: null, error: 'fetch failed' };

  const matches = [...html.matchAll(/"hiRes":"([^"]+)"/g)];
  if (matches.length === 0) {
    return { asin, url: null, error: 'no hiRes in HTML' };
  }

  for (const m of matches.slice(0, 5)) {
    const url = m[1];
    const size = checkSize(url);
    if (size > 10000) return { asin, url, size };
  }
  return { asin, url: null, error: 'all hiRes <10KB' };
}

async function main() {
  const broken = JSON.parse(fs.readFileSync('broken-asin.json', 'utf8'));
  const uniqueAsins = [...new Set(broken.map((b) => b.asin).filter(Boolean))];
  console.error(`Fetching hiRes for ${uniqueAsins.length} unique ASINs...`);

  const map = {};
  for (const asin of uniqueAsins) {
    const result = await getHiRes(asin);
    if (result.url) {
      map[asin] = result.url;
      const short = result.url.match(/I\/[A-Za-z0-9+-]+/)?.[0] || result.url;
      console.error(`  ✓ ${asin} → ${short} (${result.size}B)`);
    } else {
      console.error(`  ✗ ${asin} → ${result.error}`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(JSON.stringify(map, null, 2));
}

main();
