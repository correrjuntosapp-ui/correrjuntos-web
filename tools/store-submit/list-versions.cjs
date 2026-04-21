#!/usr/bin/env node
/**
 * list-versions.cjs — Lists all App Store versions for CorrerJuntos to
 * diagnose submission state conflicts. Read-only.
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

const request = (method, url, token) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ method, hostname: u.hostname, path: u.pathname + u.search,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); } catch { resolve(chunks); }
      });
    });
    req.on('error', reject);
    req.end();
  });

(async () => {
  const token = buildJwt();
  console.log('▶ Listing all App Store versions…');
  const versions = await request('GET', `https://api.appstoreconnect.apple.com/v1/apps/${APP_ID}/appStoreVersions?limit=50`, token);
  console.log(`Found ${versions.data?.length || 0} version(s):\n`);
  for (const v of versions.data || []) {
    const a = v.attributes;
    console.log(`  · ${v.id} | v${a.versionString} | platform=${a.platform} | state=${a.appStoreState} | created=${a.createdDate}`);
  }

  console.log('\n▶ Listing review submissions…');
  const subs = await request('GET', `https://api.appstoreconnect.apple.com/v1/apps/${APP_ID}/reviewSubmissions?limit=20&include=items`, token);
  console.log(`Found ${subs.data?.length || 0} submission(s):\n`);
  for (const s of subs.data || []) {
    console.log(`  · ${s.id} | platform=${s.attributes.platform} | state=${s.attributes.state} | submitted=${s.attributes.submittedDate || '—'}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
