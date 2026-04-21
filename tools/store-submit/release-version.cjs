#!/usr/bin/env node
/**
 * release-version.cjs — Force-releases a version stuck in
 * PENDING_DEVELOPER_RELEASE via App Store Connect API
 * (POST /v1/appStoreVersionReleaseRequests).
 *
 * Useful when Apple has approved a version but it was never manually
 * released, blocking new submissions.
 *
 * Usage: node tools/store-submit/release-version.cjs <versionId>
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
if (!versionId) { console.error('Usage: node release-version.cjs <versionId>'); process.exit(1); }

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
        err.body = parsed;
        reject(err);
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

(async () => {
  const token = buildJwt();
  console.log(`▶ Posting release request for version ${versionId}…`);
  try {
    const res = await request('POST',
      'https://api.appstoreconnect.apple.com/v1/appStoreVersionReleaseRequests',
      {
        data: {
          type: 'appStoreVersionReleaseRequests',
          relationships: {
            appStoreVersion: {
              data: { type: 'appStoreVersions', id: versionId },
            },
          },
        },
      }, token);
    console.log('✓ Release requested:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(`❌ POST release failed: ${e.message}`);
    process.exit(1);
  }
})();
