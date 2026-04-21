#!/usr/bin/env node
/**
 * convert-version.cjs — Repurposes a stuck App Store version by:
 *   1) Changing its versionString to a new value
 *   2) Attaching a new build
 *
 * Used to recover a version stuck in PENDING_DEVELOPER_RELEASE that can't
 * be deleted. If Apple allows both mutations, the version effectively
 * "becomes" the new release — we avoid wasting the approved review slot.
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');

const KEY_ID = process.env.ASC_KEY_ID || '9Z7C38NQ22';
const ISSUER_ID = '82269ea5-bead-4381-b767-3687965efa4b';
const KEY_PATH = path.join(os.homedir(), 'Downloads', `AuthKey_${KEY_ID}.p8`);
const APP_ID = '6758505910';

const versionId = process.argv[2];
const newVersionString = process.argv[3];
const buildNumber = process.argv[4];
if (!versionId || !newVersionString || !buildNumber) {
  console.error('Usage: node convert-version.cjs <versionId> <newVersionString> <buildNumber>');
  process.exit(1);
}

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

  console.log(`▶ Attempting to update version ${versionId} → versionString=${newVersionString}…`);
  try {
    await request('PATCH', `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${versionId}`, {
      data: {
        type: 'appStoreVersions',
        id: versionId,
        attributes: { versionString: newVersionString },
      },
    }, token);
    console.log('✓ versionString updated');
  } catch (e) {
    console.error(`❌ PATCH versionString failed: ${e.message}`);
    process.exit(1);
  }

  // Find build
  console.log(`▶ Looking up build ${buildNumber}…`);
  const builds = await request('GET',
    `https://api.appstoreconnect.apple.com/v1/builds?filter[app]=${APP_ID}&filter[version]=${buildNumber}&limit=5`,
    null, token);
  const build = (builds.data || [])[0];
  if (!build) { console.error(`Build ${buildNumber} not found`); process.exit(1); }
  console.log(`✓ Build: ${build.id}`);

  console.log(`▶ Attaching build ${build.id} to version ${versionId}…`);
  await request('PATCH',
    `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${versionId}/relationships/build`,
    { data: { type: 'builds', id: build.id } }, token);
  console.log('✓ Build attached');

  console.log(`\n🎉 Version ${versionId} is now ${newVersionString} with build ${buildNumber}. You can now run submit-ios.cjs on it.`);
})().catch((e) => { console.error(e); process.exit(1); });
