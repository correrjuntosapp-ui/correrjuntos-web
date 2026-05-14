#!/usr/bin/env node
/**
 * list-android-tracks.cjs — Read-only: shows releases on each Play Console
 * track (internal/alpha/beta/production) with versionCodes and state.
 *
 * Uses a read-only edit (never committed) so it doesn't affect anything.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SA_KEY_PATH = path.resolve(__dirname, '..', '..', 'correr-juntos-app', 'correrjuntos-8187a2854893.json');
const PACKAGE_NAME = 'com.correrjuntos.app';

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const buildJwt = (sa) => {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(signingInput), sa.private_key);
  return `${signingInput}.${b64url(sig)}`;
};

const request = (method, url, body, headers = {}) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const req = https.request({
      method, hostname: u.hostname, path: u.pathname + u.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        const parsed = chunks ? (() => { try { return JSON.parse(chunks); } catch { return chunks; } })() : null;
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
        reject(new Error(`HTTP ${res.statusCode}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`));
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

(async () => {
  const sa = JSON.parse(fs.readFileSync(SA_KEY_PATH, 'utf8'));
  const jwt = buildJwt(sa);
  const tokenRes = await request('POST', 'https://oauth2.googleapis.com/token',
    `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    { 'Content-Type': 'application/x-www-form-urlencoded' });
  const accessToken = tokenRes.access_token;
  const auth = { Authorization: `Bearer ${accessToken}` };
  const api = (p) =>
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(PACKAGE_NAME)}${p}`;

  console.log(`▶ Opening read-only edit for ${PACKAGE_NAME}…`);
  const edit = await request('POST', api('/edits'), {}, auth);
  const editId = edit.id;

  for (const track of ['production', 'beta', 'alpha', 'internal']) {
    try {
      const data = await request('GET', api(`/edits/${editId}/tracks/${track}`), null, auth);
      console.log(`\n● ${track.toUpperCase()}`);
      for (const rel of (data.releases || [])) {
        const vcs = (rel.versionCodes || []).join(', ');
        const frac = rel.userFraction ? ` · userFraction=${rel.userFraction}` : '';
        console.log(`  · [${rel.status}] ${rel.name || '(no name)'} — versionCodes=[${vcs}]${frac}`);
      }
      if (!data.releases?.length) console.log('  (no releases)');
    } catch (e) {
      console.log(`\n● ${track.toUpperCase()} — not configured (${e.message.slice(0, 60)}…)`);
    }
  }

  // Delete the read-only edit (no commit)
  await request('DELETE', api(`/edits/${editId}`), null, auth).catch(() => {});
  console.log('\n▶ Edit discarded (read-only).');
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
