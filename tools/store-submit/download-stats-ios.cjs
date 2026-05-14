#!/usr/bin/env node
/**
 * download-stats-ios.cjs — Fetches daily download stats from App Store
 * Connect Sales Reports API.
 *
 * Returns a CSV with Units (= downloads including redownloads) per
 * country per product per day.
 *
 * Usage:
 *   node tools/store-submit/download-stats-ios.cjs [YYYY-MM-DD]
 *
 * If no date given, defaults to yesterday (Apple's most recent
 * available report — reports are 1 day behind).
 *
 * Requires:
 *   - ~/Downloads/AuthKey_9Z7C38NQ22.p8
 *   - Vendor number (7-8 digit numeric id, shown in ASC top-left when
 *     you're on the Sales & Trends page). Set ASC_VENDOR env var.
 *
 * Docs: https://developer.apple.com/documentation/appstoreconnectapi/download_sales_and_trends_reports
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const KEY_ID = process.env.ASC_KEY_ID || '9Z7C38NQ22';
const ISSUER_ID = process.env.ASC_ISSUER_ID || '82269ea5-bead-4381-b767-3687965efa4b';
const KEY_PATH = path.join(os.homedir(), 'Downloads', `AuthKey_${KEY_ID}.p8`);
const VENDOR = process.env.ASC_VENDOR;

if (!VENDOR) {
  console.error('❌ Missing ASC_VENDOR env var.');
  console.error('   Find it at appstoreconnect.apple.com > Sales & Trends (top-left, 7-8 digits)');
  console.error('   Example: export ASC_VENDOR=12345678');
  process.exit(1);
}

// Default: yesterday (Apple reports are 1 day behind)
const dateArg = process.argv[2];
const reportDate = dateArg || (() => {
  const d = new Date(Date.now() - 86400000);
  return d.toISOString().slice(0, 10);
})();

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const buildJwt = () => {
  const pkcs8 = fs.readFileSync(KEY_PATH, 'utf8');
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER_ID, iat: now - 60, exp: now + 15 * 60, aud: 'appstoreconnect-v1' };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = crypto.sign('SHA256', Buffer.from(signingInput), { key: pkcs8, dsaEncoding: 'ieee-p1363' });
  return `${signingInput}.${b64url(sig)}`;
};

const fetchReport = (url, token) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      method: 'GET', hostname: u.hostname, path: u.pathname + u.search,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/a-gzip' },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString('utf8')}`));
        }
        const gz = Buffer.concat(chunks);
        try {
          const tsv = zlib.gunzipSync(gz).toString('utf8');
          resolve(tsv);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

(async () => {
  console.log(`▶ iOS Sales Report — date: ${reportDate}, vendor: ${VENDOR}`);
  const token = buildJwt();
  const url = `https://api.appstoreconnect.apple.com/v1/salesReports?` +
    `filter[frequency]=DAILY` +
    `&filter[reportType]=SALES` +
    `&filter[reportSubType]=SUMMARY` +
    `&filter[vendorNumber]=${VENDOR}` +
    `&filter[reportDate]=${reportDate}` +
    `&filter[version]=1_1`;

  const tsv = await fetchReport(url, token);
  const lines = tsv.split('\n').filter(Boolean);
  const header = lines[0].split('\t');
  const iTitle = header.indexOf('Title');
  const iSKU = header.indexOf('SKU');
  const iUnits = header.indexOf('Units');
  const iCountry = header.indexOf('Country Code');
  const iProductType = header.indexOf('Product Type Identifier');

  // Product Type: '1' = app download, '1F' = app download universal,
  // '3' = iPad-specific, '7' = update, 'IA1' = IAP purchase
  let totalDownloads = 0;
  const byCountry = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const title = cols[iTitle];
    const type = cols[iProductType];
    const units = parseInt(cols[iUnits] || '0', 10);
    const country = cols[iCountry];
    // Only count app installs (not updates, not IAPs)
    if (title && /correr juntos/i.test(title) && ['1', '1F', '3', '1T', '1E'].includes(type)) {
      totalDownloads += units;
      byCountry[country] = (byCountry[country] || 0) + units;
    }
  }

  console.log(`\n📱 iOS Downloads on ${reportDate}: ${totalDownloads}`);
  if (Object.keys(byCountry).length > 0) {
    console.log('\nBy country:');
    Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([c, n]) => console.log(`  ${c}: ${n}`));
  } else {
    console.log('\n(No app install units on this day)');
  }
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
