#!/usr/bin/env node
/**
 * submit-ios.cjs — Submit an iOS build from TestFlight to App Store Review
 * via the App Store Connect API v1.
 *
 * Why: Apple requires manual "Submit for Review" clicks in ASC. This script
 * does the equivalent end-to-end (create/reuse version → attach build →
 * update localized whatsNew → create review submission → submit).
 *
 * Usage:
 *   node tools/store-submit/submit-ios.cjs <buildNumber> [versionString]
 *
 * Example:
 *   node tools/store-submit/submit-ios.cjs 82 1.3.4
 *
 * Requires:
 *   - ~/Downloads/AuthKey_9Z7C38NQ22.p8 (App Store Connect API key)
 *   - Key rol: App Manager or Admin
 *
 * Docs: https://developer.apple.com/documentation/appstoreconnectapi
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');

// ── Config ──────────────────────────────────────────────────
const KEY_ID = process.env.ASC_KEY_ID || '9Z7C38NQ22';
const ISSUER_ID = '82269ea5-bead-4381-b767-3687965efa4b';
const KEY_PATH = path.join(os.homedir(), 'Downloads', `AuthKey_${KEY_ID}.p8`);
const APP_ID = '6758505910';  // ASC App ID for CorrerJuntos

const WHATS_NEW_ES = `Rediseño completo.

• Feed Strava-style con actividades de runners compatibles
• Mis estadísticas con mapa de consistencia, zapatillas y logros
• Nueva sección Privacidad
• Sistema de notificaciones funcional
• Registro más rápido y estable
• Mejoras de rendimiento`;

const WHATS_NEW_EN = `Complete redesign.

• Strava-style feed with activities from compatible runners
• Stats page with consistency heatmap, shoes and achievements
• New Privacy section
• Functional notifications system
• Faster, more stable signup flow
• Performance improvements`;

// ── CLI args ────────────────────────────────────────────────
const targetBuildNumber = String(process.argv[2] || '').trim();
const targetVersion = String(process.argv[3] || '').trim() || '1.3.4';
if (!targetBuildNumber) {
  console.error('❌ Missing buildNumber.');
  console.error('Usage: node submit-ios.cjs <buildNumber> [versionString]');
  process.exit(1);
}

// ── JWT ES256 with DER → IEEE P1363 conversion ──────────────
const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

/**
 * Node's crypto.sign with 'ES256' returns a DER-encoded signature,
 * but JWT ES256 requires raw r||s (IEEE P1363, 64 bytes). Convert.
 */
const derToP1363 = (der) => {
  // Minimal ASN.1 parse: SEQUENCE { INTEGER r, INTEGER s }
  let off = 0;
  if (der[off++] !== 0x30) throw new Error('DER: missing SEQUENCE');
  // length (can be short or long form)
  let len = der[off++];
  if (len & 0x80) {
    const numBytes = len & 0x7f;
    len = 0;
    for (let i = 0; i < numBytes; i++) len = (len << 8) | der[off++];
  }
  const readInt = () => {
    if (der[off++] !== 0x02) throw new Error('DER: missing INTEGER');
    let l = der[off++];
    if (l & 0x80) {
      const n = l & 0x7f;
      l = 0;
      for (let i = 0; i < n; i++) l = (l << 8) | der[off++];
    }
    let value = der.slice(off, off + l);
    off += l;
    // Strip leading zero padding
    while (value.length > 32 && value[0] === 0x00) value = value.slice(1);
    // Pad left to 32 bytes
    while (value.length < 32) value = Buffer.concat([Buffer.from([0x00]), value]);
    return value;
  };
  const r = readInt();
  const s = readInt();
  return Buffer.concat([r, s]);
};

const buildJwt = () => {
  if (!fs.existsSync(KEY_PATH)) {
    throw new Error(`ASC key not found at ${KEY_PATH}`);
  }
  const pkcs8 = fs.readFileSync(KEY_PATH, 'utf8');
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER_ID,
    // iat back 60s to absorb any clock skew between our machine and Apple —
    // otherwise Apple occasionally returns 401 ("token in the future").
    iat: now - 60,
    exp: now + 15 * 60,  // max 20 min per Apple; 15 leaves safety margin
    aud: 'appstoreconnect-v1',
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  // Use 'ieee-p1363' directly (Node 14+) — skips the error-prone DER→P1363 conversion.
  // Apple requires the raw r||s 64-byte signature that JWT ES256 spec mandates.
  const sig = crypto.sign('SHA256', Buffer.from(signingInput), {
    key: pkcs8,
    dsaEncoding: 'ieee-p1363',
  });
  return `${signingInput}.${b64url(sig)}`;
};

// ── HTTPS helper ────────────────────────────────────────────
const request = (method, url, body, token) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
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

const REUSABLE_STATES = new Set([
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'METADATA_REJECTED',
  'REJECTED',
  'INVALID_BINARY',
]);

// ── Main ────────────────────────────────────────────────────
(async () => {
  console.log(`▶ App: ${APP_ID} · build: ${targetBuildNumber} · version: ${targetVersion}`);
  console.log('▶ Generating JWT (ES256)…');
  const token = buildJwt();
  const api = (p) => `https://api.appstoreconnect.apple.com${p}`;

  // 1) Find the build
  console.log(`▶ Looking up build ${targetBuildNumber}…`);
  const buildsRes = await request(
    'GET',
    api(`/v1/builds?filter[app]=${APP_ID}&filter[version]=${targetBuildNumber}&limit=10`),
    null,
    token
  );
  const builds = buildsRes.data || [];
  if (builds.length === 0) throw new Error(`Build ${targetBuildNumber} not found on ASC`);
  const build = builds[0];
  const buildId = build.id;
  const processingState = build.attributes?.processingState;
  console.log(`✓ Build ID: ${buildId} · state: ${processingState}`);
  if (processingState !== 'VALID') {
    console.warn(`⚠️  Build is not VALID yet (state: ${processingState}). Apple may reject the submission.`);
  }

  // 2) Find or (re)use App Store version
  console.log(`▶ Looking for App Store version ${targetVersion}…`);
  const versionsRes = await request(
    'GET',
    api(`/v1/apps/${APP_ID}/appStoreVersions?limit=20`),
    null,
    token
  );
  const allVersions = versionsRes.data || [];
  let existing = allVersions.find((v) => (v.attributes?.versionString || '').trim() === targetVersion);

  let versionId;
  if (existing) {
    const state = existing.attributes?.appStoreState;
    console.log(`✓ Version exists (id: ${existing.id}, state: ${state})`);
    if (!REUSABLE_STATES.has(state)) {
      throw new Error(
        `Version ${targetVersion} is in state "${state}" — not reusable. ` +
        `Expected one of: ${Array.from(REUSABLE_STATES).join(', ')}`
      );
    }
    versionId = existing.id;
  } else {
    console.log(`▶ Creating new App Store version ${targetVersion}…`);
    const created = await request(
      'POST',
      api('/v1/appStoreVersions'),
      {
        data: {
          type: 'appStoreVersions',
          attributes: {
            platform: 'IOS',
            versionString: targetVersion,
          },
          relationships: {
            app: { data: { type: 'apps', id: APP_ID } },
          },
        },
      },
      token
    );
    versionId = created.data.id;
    console.log(`✓ Created version ${versionId}`);
  }

  // 3) Attach build to version
  console.log(`▶ Attaching build ${buildId} to version ${versionId}…`);
  await request(
    'PATCH',
    api(`/v1/appStoreVersions/${versionId}/relationships/build`),
    { data: { type: 'builds', id: buildId } },
    token
  );
  console.log('✓ Build attached');

  // 4) Update whatsNew on existing localizations only (never create new ones)
  console.log('▶ Updating whatsNew on existing localizations…');
  const locsRes = await request(
    'GET',
    api(`/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=50`),
    null,
    token
  );
  const locs = locsRes.data || [];
  console.log(`  Found ${locs.length} localization(s)`);

  for (const loc of locs) {
    const locale = loc.attributes?.locale;
    let whatsNew = null;
    if (locale === 'es-ES' || locale?.startsWith('es')) whatsNew = WHATS_NEW_ES;
    else if (locale === 'en-US' || locale?.startsWith('en')) whatsNew = WHATS_NEW_EN;

    if (!whatsNew) {
      console.log(`  · ${locale} → skipped (no translation)`);
      continue;
    }

    await request(
      'PATCH',
      api(`/v1/appStoreVersionLocalizations/${loc.id}`),
      {
        data: {
          type: 'appStoreVersionLocalizations',
          id: loc.id,
          attributes: { whatsNew },
        },
      },
      token
    );
    console.log(`  ✓ ${locale} whatsNew updated`);
  }

  // 5) Cancel any open review submissions before creating a new one
  console.log('▶ Checking open review submissions…');
  const openSubs = await request(
    'GET',
    api(`/v1/apps/${APP_ID}/reviewSubmissions?filter[state]=UNRESOLVED_ISSUES,READY_FOR_REVIEW,WAITING_FOR_REVIEW,IN_REVIEW&limit=5`),
    null,
    token
  ).catch(() => ({ data: [] }));

  for (const sub of openSubs.data || []) {
    const subState = sub.attributes?.state;
    console.log(`  Found open submission ${sub.id} (state: ${subState}) — canceling…`);
    await request(
      'PATCH',
      api(`/v1/reviewSubmissions/${sub.id}`),
      {
        data: {
          type: 'reviewSubmissions',
          id: sub.id,
          attributes: { canceled: true },
        },
      },
      token
    ).catch((e) => console.warn(`  ⚠️  Could not cancel ${sub.id}: ${e.message}`));
  }

  // 6) Create review submission
  console.log('▶ Creating review submission…');
  const submission = await request(
    'POST',
    api('/v1/reviewSubmissions'),
    {
      data: {
        type: 'reviewSubmissions',
        attributes: { platform: 'IOS' },
        relationships: {
          app: { data: { type: 'apps', id: APP_ID } },
        },
      },
    },
    token
  );
  const submissionId = submission.data.id;
  console.log(`✓ Submission ID: ${submissionId}`);

  // 7) Attach the version
  console.log('▶ Attaching version to submission…');
  await request(
    'POST',
    api('/v1/reviewSubmissionItems'),
    {
      data: {
        type: 'reviewSubmissionItems',
        relationships: {
          reviewSubmission: { data: { type: 'reviewSubmissions', id: submissionId } },
          appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } },
        },
      },
    },
    token
  );
  console.log('✓ Version attached');

  // 8) Submit for review
  console.log('▶ Submitting for review…');
  await request(
    'PATCH',
    api(`/v1/reviewSubmissions/${submissionId}`),
    {
      data: {
        type: 'reviewSubmissions',
        id: submissionId,
        attributes: { submitted: true },
      },
    },
    token
  );

  console.log('\n🎉 DONE.');
  console.log(`   Version ${targetVersion} (build ${targetBuildNumber}) submitted to App Store Review.`);
  console.log('   Apple review typically takes 24–48h.');
  console.log(`   Track: https://appstoreconnect.apple.com/apps/${APP_ID}/distribution/ios`);
})().catch((e) => {
  console.error('\n❌ FAILED:');
  console.error(e.message || e);
  if (e.body?.errors) {
    for (const err of e.body.errors) {
      console.error(`   · ${err.code}: ${err.title} — ${err.detail || ''}`);
    }
  }
  process.exit(1);
});
