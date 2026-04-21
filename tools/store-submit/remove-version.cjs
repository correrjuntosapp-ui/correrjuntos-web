#!/usr/bin/env node
/**
 * remove-version.cjs — Removes an App Store version that's blocking new
 * submissions. Useful when a previous version is stuck in
 * PENDING_DEVELOPER_RELEASE and you want to ship a newer one.
 *
 * Usage: node tools/store-submit/remove-version.cjs <versionId>
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');

const KEY_ID = process.env.ASC_KEY_ID || '9Z7C38NQ22';
const ISSUER_ID = '82269ea5-bead-4381-b767-3687965efa4b';
const KEY_PATH = path.join(os.homedir(), 'Downloads', `AuthKey_${KEY_ID}.p8`);

const versionId = process.argv[2];
if (!versionId) { console.error('Usage: node remove-version.cjs <versionId>'); process.exit(1); }

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

const request = (method, url, body, token) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      method, hostname: u.hostname, path: u.pathname + u.search,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        const parsed = chunks ? (() => { try { return JSON.parse(chunks); } catch { return chunks; } })() : null;
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
        const err = new Error(`HTTP ${res.statusCode}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
        err.statusCode = res.statusCode;
        reject(err);
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

(async () => {
  const token = buildJwt();
  console.log(`▶ Attempting DELETE on version ${versionId}…`);
  try {
    await request('DELETE', `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${versionId}`, null, token);
    console.log('✓ Version removed');
    return;
  } catch (e) {
    console.warn(`  DELETE failed: ${e.message}`);
  }

  // Fallback: try removing the build relationship
  console.log(`▶ Trying to detach build from version ${versionId}…`);
  try {
    await request('PATCH', `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${versionId}/relationships/build`,
      { data: null }, token);
    console.log('✓ Build detached (this may transition version to DEVELOPER_REMOVED_FROM_SALE)');
  } catch (e) {
    console.error(`❌ PATCH build relationship failed: ${e.message}`);
    console.error('\nManual path required:');
    console.error('  1) Open https://appstoreconnect.apple.com');
    console.error('  2) My Apps → CorrerJuntos → App Store tab');
    console.error('  3) Find v1.3.2 (Pending Developer Release) → click "Remove This Version from Review" or "Cancel Release"');
    console.error('  4) Re-run submit-ios.cjs');
  }
})();
