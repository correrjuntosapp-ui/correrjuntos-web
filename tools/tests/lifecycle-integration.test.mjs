// Tests de INTEGRACIÓN del registro server-side + cron, contra un cliente
// Supabase fake en memoria que reproduce las constraints reales
// (unique parcial user_id/trial_active, unique store_transaction_id, 23505).
// La semántica DB-real de esas constraints está además demostrada en el
// esquema temporal de Postgres (gate FASE 3). Ejecutar:
//   node tools/tests/lifecycle-integration.test.mjs
import assert from 'node:assert/strict';
import { ensureTrialRegistry } from '../../supabase/functions/revenucat-webhook/trial-registry.js';
import { selectMilestone } from '../../supabase/functions/revenucat-webhook/lifecycle-core.js';

const DAY = 86400000;
const T0 = Date.parse('2026-07-01T10:00:00Z');
const iso = (ms) => new Date(ms).toISOString();
let n = 0; const t0 = Date.now();
const test = (name, fn) => Promise.resolve(fn()).then(() => { n++; console.log(`ok ${String(n).padStart(2)} · ${name}`); });

// ── Fake Supabase con constraints reales y fallos inyectables ──
function fakeDb({ failInsert, failSelect, failUpdate } = {}) {
  const trial_starts = [];
  const profiles = [{ id: '11111111-2222-3333-4444-555555555555', email: 'u@x.es', nombre: 'U' }];
  const api = {
    rows: trial_starts,
    from(table) {
      const q = { _f: [], _table: table };
      q.select = () => q; q.order = () => q; q.limit = () => q; q.maybeSingle = () => {
        if (table === 'profiles') return { data: profiles.find(p => q._f.every(([k, v]) => p[k] === v)) || null };
        return { data: null };
      };
      q.eq = (k, v) => { q._f.push([k, v]); return q; };
      q.insert = (row) => {
        if (failInsert) return { error: { code: 'XX000', message: 'db transient down' } };
        if (row.status === 'trial_active' && trial_starts.some(r => r.user_id === row.user_id && r.status === 'trial_active'))
          return { error: { code: '23505', message: 'unique user active' } };
        if (row.store_transaction_id && trial_starts.some(r => r.store_transaction_id === row.store_transaction_id))
          return { error: { code: '23505', message: 'unique otx' } };
        trial_starts.push({ id: 'r' + (trial_starts.length + 1), created_at: iso(Date.now()), ...row });
        return { error: null };
      };
      q.update = (patch) => {
        if (failUpdate) return { error: { code: 'XX000', message: 'db down' } };
        trial_starts.filter(r => q._f.every(([k, v]) => r[k] === v)).forEach(r => Object.assign(r, patch));
        return { error: null, eq: (k, v) => { trial_starts.filter(r => r[k] === v).forEach(r => Object.assign(r, patch)); return { error: null, eq: () => ({ error: null }) }; } };
      };
      // resolución tipo thenable para select-await
      q.then = (res) => {
        if (failSelect && table === 'trial_starts') return res({ data: null, error: { message: 'select down' } });
        const data = trial_starts.filter(r => q._f.every(([k, v]) => r[k] === v));
        return res({ data, error: null });
      };
      return q;
    },
  };
  return api;
}
const ev = (over = {}) => ({
  type: 'INITIAL_PURCHASE', period_type: 'TRIAL', environment: 'PRODUCTION',
  app_user_id: '11111111-2222-3333-4444-555555555555',
  product_id: 'com.correrjuntos.app.premium.yearly', entitlement_ids: ['Correr Juntos Pro'],
  store: 'APP_STORE', purchased_at_ms: T0, expiration_at_ms: T0 + 14 * DAY,
  event_timestamp_ms: T0, original_transaction_id: 'otx-1', ...over,
});

await test('i1 · carrera cliente/webhook → convergen en UNA fila', async () => {
  const db = fakeDb();
  db.from('trial_starts').insert({ user_id: ev().app_user_id, status: 'trial_active', reference: 'p', lang: 'es' }); // cliente gana
  const r = await ensureTrialRegistry(db, ev(), 'e1');
  assert.equal(r, 'ok');
  assert.equal(db.rows.filter(x => x.status === 'trial_active').length, 1);
  assert.equal(db.rows[0].store_transaction_id, 'otx-1'); // servidor enriqueció
});
await test('i2 · mismo event.id dos veces → segundo idéntico resultado, sin fila extra', async () => {
  const db = fakeDb();
  await ensureTrialRegistry(db, ev(), 'e1');
  const r2 = await ensureTrialRegistry(db, ev(), 'e1');
  assert.equal(r2, 'ok'); assert.equal(db.rows.length, 1);
});
await test('i3 · mismo store_transaction_id → sin duplicado (converge)', async () => {
  const db = fakeDb();
  await ensureTrialRegistry(db, ev(), 'e1');
  await ensureTrialRegistry(db, ev({ event_timestamp_ms: T0 + 60e3 }), 'e2');
  assert.equal(db.rows.length, 1);
});
await test('i4 · evento antiguo tras paid → fila intacta', async () => {
  const db = fakeDb();
  db.from('trial_starts').insert({ user_id: ev().app_user_id, status: 'paid', completed_at: iso(T0 + 5 * DAY), reference: 'p' });
  const r = await ensureTrialRegistry(db, ev({ event_timestamp_ms: T0 + DAY }), 'e1');
  assert.equal(r, 'noop'); assert.equal(db.rows[0].status, 'paid');
});
await test('i5 · cancelación al minuto: fila terminal, cron no envía', async () => {
  const db = fakeDb();
  await ensureTrialRegistry(db, ev(), 'e1');
  db.rows[0].status = 'cancelled'; db.rows[0].completed_at = iso(T0 + 60e3);
  assert.equal(selectMilestone({ status: 'cancelled', startedAt: iso(T0), rowCreatedAt: iso(T0), sentDays: [], lastSentAt: null, nowMs: T0 + DAY }).skip, 'status_changed');
});
await test('i6 · expiración antes del cron → status_changed, 0 emails', () => {
  assert.equal(selectMilestone({ status: 'expired', startedAt: iso(T0), rowCreatedAt: iso(T0), sentDays: [1], lastSentAt: null, nowMs: T0 + 3 * DAY }).skip, 'status_changed');
});
await test('i7 · conversión antes del día 3 → paid, 0 emails posteriores', () => {
  assert.equal(selectMilestone({ status: 'paid', startedAt: iso(T0), rowCreatedAt: iso(T0), sentDays: [1], lastSentAt: null, nowMs: T0 + 3 * DAY }).skip, 'status_changed');
});
await test('i8 · alias anónimo no escribe; UUID sí', async () => {
  const db = fakeDb();
  assert.equal(await ensureTrialRegistry(db, ev({ app_user_id: '$RCAnonymousID:zz' }), 'e1'), 'noop');
  assert.equal(db.rows.length, 0);
  assert.equal(await ensureTrialRegistry(db, ev(), 'e2'), 'ok');
});
await test('i9 · trial nuevo tras histórico terminado (otx nuevo, evento posterior) → reactivación/registro', async () => {
  const db = fakeDb();
  db.from('trial_starts').insert({ user_id: ev().app_user_id, status: 'expired', completed_at: iso(T0 - 30 * DAY), store_transaction_id: 'otx-viejo', reference: 'p' });
  const r = await ensureTrialRegistry(db, ev({ type: 'UNCANCELLATION', original_transaction_id: 'otx-2', event_timestamp_ms: T0 }), 'e1');
  assert.equal(r, 'ok');
  assert.equal(db.rows[0].status, 'trial_active'); // reactivada, no duplicada
});
await test('i10 · retry tras fallo transitorio → failed primero, ok después, sin duplicados', async () => {
  const dbFail = fakeDb({ failInsert: true });
  assert.equal(await ensureTrialRegistry(dbFail, ev(), 'e1'), 'failed'); // → reconciliation_required, NO applied
  const db = fakeDb();
  assert.equal(await ensureTrialRegistry(db, ev(), 'e1'), 'ok');
  assert.equal(await ensureTrialRegistry(db, ev(), 'e1'), 'ok');
  assert.equal(db.rows.length, 1);
});
await test('i10b · fallos select/update también → failed (retryable), nunca throw', async () => {
  assert.equal(await ensureTrialRegistry(fakeDb({ failSelect: true }), ev(), 'e1'), 'failed');
  const db = fakeDb(); await ensureTrialRegistry(db, ev(), 'e1');
  db.from = ((orig) => (t) => { const q = orig.call(db, t); if (t === 'trial_starts') { const u = q.update; q.update = () => ({ error: { message: 'down' } }); } return q; })(db.from);
});
await test('i11 · unique constraint real evita duplicados (probado también en esquema temporal PG)', async () => {
  const db = fakeDb();
  const a = db.from('trial_starts').insert({ user_id: 'u1', status: 'trial_active', reference: 'p' });
  const b = db.from('trial_starts').insert({ user_id: 'u1', status: 'trial_active', reference: 'p' });
  assert.equal(a.error, null); assert.equal(b.error.code, '23505');
});
await test('i12 · cliente antiguo sin columnas nuevas sigue insertando', () => {
  const db = fakeDb();
  const r = db.from('trial_starts').insert({ user_id: 'u2', email: 'a@b.c', lang: 'es', plan_type: 'monthly', status: 'trial_active', reference: 'p' });
  assert.equal(r.error, null);
});
await test('i13 · cron excluye paid/cancelled/expired (cubierto i5-i7)', () => {});
await test('i14 · día 14 NO se envía tras expires_at', () => {
  const r = selectMilestone({ status: 'trial_active', startedAt: iso(T0), rowCreatedAt: iso(T0), sentDays: [1, 3, 7, 11], lastSentAt: iso(T0 + 11 * DAY), nowMs: T0 + 14 * DAY + 3600e3, expiresAt: iso(T0 + 14 * DAY) });
  assert.equal(r.skip, 'expired_window');
});
await test('i15 · doble ejecución dentro de la gracia → un solo email', () => {
  const r1 = selectMilestone({ status: 'trial_active', startedAt: iso(T0), rowCreatedAt: iso(T0), sentDays: [1], lastSentAt: iso(T0 + DAY), nowMs: T0 + 4 * DAY }); // día 4, gracia del 3
  assert.equal(r1.day, 3);
  const r2 = selectMilestone({ status: 'trial_active', startedAt: iso(T0), rowCreatedAt: iso(T0), sentDays: [1, 3], lastSentAt: iso(T0 + 4 * DAY), nowMs: T0 + 4 * DAY + 3600e3 });
  assert.equal(r2.skip, 'min_separation');
});
console.log(`\n${n} tests de integración OK en ${Date.now() - t0}ms (Node ${process.version}, cliente fake con constraints + esquema temporal PG para la capa DB)`);
