#!/usr/bin/env node
/**
 * promote-android.cjs — Promote an AAB from "internal" to "production" on
 * Google Play via the Android Publisher API v3.
 *
 * Why: `eas submit --track production` refuses to resubmit a versionCode
 * that's already on Play (our AAB lives in internal after `--auto-submit`).
 * This script talks to the Play Dev API directly, runs the edit/commit
 * transaction, and completes the rollout — no console clicks.
 *
 * Usage:
 *   node tools/store-submit/promote-android.cjs <versionCode> [rolloutFraction]
 *
 * Examples:
 *   node tools/store-submit/promote-android.cjs 81            # full rollout
 *   node tools/store-submit/promote-android.cjs 81 0.1        # staged 10%
 *
 * Requires:
 *   - correr-juntos-app/correrjuntos-8187a2854893.json (GCP service account)
 *   - Service account has "Release Manager" role on the Play Console project.
 *
 * Docs: https://developers.google.com/android-publisher/api-ref/rest
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ──────────────────────────────────────────────────
const SA_KEY_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'correr-juntos-app',
  'correrjuntos-8187a2854893.json'
);
const PACKAGE_NAME = 'com.correrjuntos.app';
const RELEASE_NAME = '1.3.4 (81)';
const RELEASE_NOTES_ES = `v1.3.4 — Rediseño completo

• Nuevo feed Strava-style con actividades de runners compatibles
• Pantalla "Mis estadísticas" con mapa de consistencia, zapatillas y logros
• Nueva sección Privacidad en Ajustes
• Sistema de notificaciones mejorado
• Flujo de registro más rápido y estable
• Múltiples mejoras de rendimiento y diseño`;
const RELEASE_NOTES_EN = `v1.3.4 — Complete redesign

• Strava-style feed with activities from compatible runners
• New Stats page with consistency heatmap, shoes and achievements
• Privacy section in Settings
• Functional notifications system
• Faster, more stable signup flow
• Multiple performance improvements`;

// ── CLI args ────────────────────────────────────────────────
const versionCode = parseInt(process.argv[2], 10);
const rolloutFraction = process.argv[3] ? parseFloat(process.argv[3]) : 1.0;

if (!versionCode || Number.isNaN(versionCode)) {
  console.error('❌ Missing versionCode.');
  console.error('Usage: node promote-android.cjs <versionCode> [rolloutFraction]');
  process.exit(1);
}
if (rolloutFraction <= 0 || rolloutFraction > 1) {
  console.error('❌ Rollout fraction must be in (0, 1].');
  process.exit(1);
}

const isStaged = rolloutFraction < 1;
const RELEASE_STATUS = isStaged ? 'inProgress' : 'completed';

// ── JWT helpers (RS256) ─────────────────────────────────────
const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const buildJwt = (sa) => {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(signingInput), sa.private_key);
  return `${signingInput}.${b64url(sig)}`;
};

// ── Simple HTTPS JSON helper ────────────────────────────────
const request = (method, url, body, headers = {}) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
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

// ── Main flow ───────────────────────────────────────────────
(async () => {
  console.log('▶ Reading service account key…');
  if (!fs.existsSync(SA_KEY_PATH)) {
    throw new Error(`Service account key not found at ${SA_KEY_PATH}`);
  }
  const sa = JSON.parse(fs.readFileSync(SA_KEY_PATH, 'utf8'));

  console.log('▶ Requesting OAuth token…');
  const jwt = buildJwt(sa);
  const tokenRes = await request(
    'POST',
    'https://oauth2.googleapis.com/token',
    `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    { 'Content-Type': 'application/x-www-form-urlencoded' }
  );
  const accessToken = tokenRes.access_token;
  if (!accessToken) throw new Error('No access_token in Google response');
  console.log('✓ Got access token');

  const auth = { Authorization: `Bearer ${accessToken}` };
  const api = (p) =>
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(PACKAGE_NAME)}${p}`;

  console.log(`▶ Opening edit transaction for ${PACKAGE_NAME}…`);
  const edit = await request('POST', api('/edits'), {}, auth);
  const editId = edit.id;
  console.log(`✓ Edit ID: ${editId}`);

  // 1) Put versionCode on production track
  console.log(
    `▶ Promoting versionCode ${versionCode} to production (${isStaged ? (rolloutFraction * 100) + '% staged' : '100% full rollout'})…`
  );
  const productionReleases = [
    {
      name: RELEASE_NAME,
      versionCodes: [String(versionCode)],
      status: RELEASE_STATUS,
      ...(isStaged ? { userFraction: rolloutFraction } : {}),
      releaseNotes: [
        { language: 'es-ES', text: RELEASE_NOTES_ES },
        { language: 'en-US', text: RELEASE_NOTES_EN },
      ],
    },
  ];
  await request('PUT', api(`/edits/${editId}/tracks/production`), {
    track: 'production',
    releases: productionReleases,
  }, auth);
  console.log('✓ Production track updated');

  // 2) Remove versionCode from internal so Play doesn't complain about
  // "this version is already on two tracks". Internal keeps older builds.
  console.log('▶ Cleaning internal track (removing promoted versionCode)…');
  const internal = await request('GET', api(`/edits/${editId}/tracks/internal`), null, auth);
  const remainingReleases = (internal.releases || []).map((rel) => ({
    ...rel,
    versionCodes: (rel.versionCodes || []).filter((vc) => String(vc) !== String(versionCode)),
  })).filter((rel) => (rel.versionCodes || []).length > 0);

  await request('PUT', api(`/edits/${editId}/tracks/internal`), {
    track: 'internal',
    releases: remainingReleases,
  }, auth);
  console.log(`✓ Internal track cleaned (${remainingReleases.length} releases remain)`);

  // 3) Commit
  console.log('▶ Committing edit…');
  const commit = await request('POST', api(`/edits/${editId}:commit`), {}, auth);
  console.log(`✓ Commit ID: ${commit.id}`);

  console.log('\n🎉 DONE.');
  console.log(`   versionCode ${versionCode} promoted to production on Google Play.`);
  console.log('   Google review typically takes 2–7 days. Users auto-update within 24–72h after approval.');
  console.log(`   Track: https://play.google.com/console/u/0/developers/-/app/-/tracks/production`);
})().catch((e) => {
  console.error('\n❌ FAILED:');
  console.error(e.message || e);
  console.error('\nTroubleshooting:');
  console.error('  · If "The caller does not have permission": add "Release Manager" role to the service account in Play Console → Users & permissions.');
  console.error('  · If "Version code X is not valid": the AAB with that versionCode may not be uploaded yet. Run `eas build --platform android` first.');
  process.exit(1);
});
