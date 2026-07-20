// Tests del núcleo del pipeline lifecycle (decisiones puras).
// Ejecutar: node tools/tests/lifecycle-core.test.mjs
import assert from 'node:assert/strict';
import {
  decideTrialRegistry,
  selectMilestone,
  isCorrerJuntosPremiumEvent,
  planTypeFromProduct,
  SEND_DAYS,
  GRACE_DAYS,
} from '../../supabase/functions/revenucat-webhook/lifecycle-core.js';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.parse('2026-07-01T10:00:00Z');
const iso = (ms) => new Date(ms).toISOString();
let n = 0;
const test = (name, fn) => { fn(); n++; console.log(`ok ${String(n).padStart(2)} · ${name}`); };

const cjTrialEvent = (over = {}) => ({
  type: 'INITIAL_PURCHASE',
  period_type: 'TRIAL',
  environment: 'PRODUCTION',
  app_user_id: '11111111-2222-3333-4444-555555555555',
  product_id: 'com.correrjuntos.app.premium.yearly',
  entitlement_ids: ['Correr Juntos Pro'],
  store: 'APP_STORE',
  purchased_at_ms: T0,
  expiration_at_ms: T0 + 14 * DAY,
  event_timestamp_ms: T0,
  original_transaction_id: 'otx-abc-1',
  ...over,
});

// ── FASE 2 · decideTrialRegistry ─────────────────────────────
test('1 · trial nuevo de CJ → insert', () => {
  const d = decideTrialRegistry(cjTrialEvent(), null);
  assert.equal(d.action, 'insert');
  assert.equal(d.row.status, 'trial_active');
  assert.equal(d.row.plan_type, 'yearly');
  assert.equal(d.row.store_transaction_id, 'otx-abc-1');
  assert.equal(d.row.source, 'revenuecat');
  assert.equal(d.row.started_at, iso(T0));
  assert.equal(d.row.expires_at, iso(T0 + 14 * DAY));
});

test('2 · mismo evento dos veces → segunda converge en update (idempotente, cero duplicados)', () => {
  const first = decideTrialRegistry(cjTrialEvent(), null);
  assert.equal(first.action, 'insert');
  const existing = { id: 'r1', status: 'trial_active', started_at: iso(T0), completed_at: null };
  const second = decideTrialRegistry(cjTrialEvent(), existing);
  assert.equal(second.action, 'update'); // misma fila, no una nueva
});

test('3 · evento ANTIGUO tras estado final más reciente → noop (no degrada)', () => {
  const existing = { id: 'r1', status: 'paid', started_at: iso(T0), completed_at: iso(T0 + 5 * DAY) };
  const old = cjTrialEvent({ event_timestamp_ms: T0 + 1 * DAY });
  const d = decideTrialRegistry(old, existing);
  assert.equal(d.action, 'noop');
  assert.equal(d.reason, 'stale_vs_terminal');
});

test('4 · fila ya creada por el cliente → update con datos de servidor (prevalece servidor)', () => {
  const clientRow = { id: 'r1', status: 'trial_active', started_at: iso(T0 + 3600e3), completed_at: null, store_transaction_id: null, source: 'client' };
  const d = decideTrialRegistry(cjTrialEvent(), clientRow);
  assert.equal(d.action, 'update');
  assert.equal(d.row.started_at, iso(T0));             // fecha real de la tienda
  assert.equal(d.row.store_transaction_id, 'otx-abc-1'); // clave estable añadida
});

test('5 · evento de MisCalorías → ignorado', () => {
  const ev = cjTrialEvent({ entitlement_ids: ['MisCalorias Pro'], product_id: 'com.miscalorias.app.premium.monthly' });
  const d = decideTrialRegistry(ev, null);
  assert.equal(d.action, 'noop');
  assert.equal(d.reason, 'other_project');
  assert.equal(isCorrerJuntosPremiumEvent(ev), false);
});

test('6 · evento no-trial (NORMAL) → ignorado por el registro', () => {
  const d = decideTrialRegistry(cjTrialEvent({ period_type: 'NORMAL' }), null);
  assert.equal(d.action, 'noop');
  assert.equal(d.reason, 'not_trial_period');
});

test('7 · SANDBOX/TEST no contamina el funnel de emails', () => {
  assert.equal(decideTrialRegistry(cjTrialEvent({ environment: 'SANDBOX' }), null).reason, 'sandbox');
  assert.equal(decideTrialRegistry(cjTrialEvent({ type: 'TEST' }), null).reason, 'event_not_registry');
});

test('8 · monthly y yearly detectados por producto', () => {
  assert.equal(planTypeFromProduct('com.correrjuntos.app.premium.monthly'), 'monthly');
  assert.equal(planTypeFromProduct('com.correrjuntos.app.premium.yearly'), 'yearly');
  assert.equal(planTypeFromProduct('correrjuntos_premium_annual'), 'yearly');
  const d = decideTrialRegistry(cjTrialEvent({ product_id: 'correrjuntos_premium_monthly', entitlement_ids: [] }), null);
  assert.equal(d.action, 'insert');
  assert.equal(d.row.plan_type, 'monthly');
});

test('9 · App Store y Google Play — ambos registran', () => {
  assert.equal(decideTrialRegistry(cjTrialEvent({ store: 'APP_STORE' }), null).action, 'insert');
  assert.equal(decideTrialRegistry(cjTrialEvent({ store: 'PLAY_STORE' }), null).action, 'insert');
});

test('10 · app_user_id anónimo (alias RC sin logIn) → noop', () => {
  const d = decideTrialRegistry(cjTrialEvent({ app_user_id: '$RCAnonymousID:abc123' }), null);
  assert.equal(d.reason, 'anonymous_user');
});

test('11 · usuario cancela a los minutos: fila terminal se conserva; UNCANCELLATION posterior reactiva', () => {
  const cancelled = { id: 'r1', status: 'cancelled', started_at: iso(T0), completed_at: iso(T0 + 3 * 60e3) };
  // RENEWAL antiguo no reactiva:
  const oldRenewal = cjTrialEvent({ type: 'RENEWAL', event_timestamp_ms: T0 + 60e3 });
  assert.equal(decideTrialRegistry(oldRenewal, cancelled).action, 'noop');
  // UNCANCELLATION posterior sí:
  const unc = cjTrialEvent({ type: 'UNCANCELLATION', event_timestamp_ms: T0 + 10 * 60e3 });
  const d = decideTrialRegistry(unc, cancelled);
  assert.equal(d.action, 'update');
  assert.equal(d.reason, 'reactivated_after_terminal');
});

test('12 · conversión a pagado: RENEWAL NORMAL no toca el registro de trials (lo cierra el webhook aparte)', () => {
  const paidRenewal = cjTrialEvent({ type: 'RENEWAL', period_type: 'NORMAL' });
  assert.equal(decideTrialRegistry(paidRenewal, { id: 'r1', status: 'trial_active', started_at: iso(T0), completed_at: null }).reason, 'not_trial_period');
});

test('13 · trial expirado (estado terminal) + evento viejo → se conserva', () => {
  const expired = { id: 'r1', status: 'expired', started_at: iso(T0), completed_at: iso(T0 + 14 * DAY) };
  const d = decideTrialRegistry(cjTrialEvent({ event_timestamp_ms: T0 + 2 * DAY }), expired);
  assert.equal(d.action, 'noop');
});

// ── FASE 5 · selectMilestone ─────────────────────────────────
const base = (over = {}) => ({
  status: 'trial_active',
  startedAt: iso(T0),
  rowCreatedAt: iso(T0),
  sentDays: [],
  lastSentAt: null,
  ...over,
});

test('14 · cron en día exacto → envía el hito', () => {
  for (const m of SEND_DAYS) {
    const r = selectMilestone(base({ nowMs: T0 + m * DAY + 3600e3 }));
    assert.equal(r.day, m, `hito ${m}`);
  }
});

test('15 · cron con UN día de retraso (ventana de gracia) → aún envía', () => {
  const r = selectMilestone(base({ sentDays: [1], nowMs: T0 + (3 + GRACE_DAYS) * DAY + 3600e3 }));
  assert.equal(r.day, 3);
});

test('16 · cron VARIOS días tarde → hito obsoleto NO se envía (stale)', () => {
  const r = selectMilestone(base({ sentDays: [1], nowMs: T0 + 6 * DAY + 3600e3 })); // día 3 hace 3 días, día 7 aún no
  assert.equal(r.skip, 'stale');
});

test('17 · varios hitos pendientes → SOLO el más reciente permitido, uno por ejecución', () => {
  // día 8: pendientes 1,3,7 — solo 7 entra en gracia; se elige 7 y nada más.
  const r = selectMilestone(base({ nowMs: T0 + 8 * DAY }));
  assert.equal(r.day, 7);
});

test('18 · separación mínima 24h entre emails del mismo trial', () => {
  const r = selectMilestone(base({
    sentDays: [1],
    lastSentAt: iso(T0 + 3 * DAY - 3600e3), // enviado hace 1h
    nowMs: T0 + 3 * DAY,
  }));
  assert.equal(r.skip, 'min_separation');
});

test('19 · dedup por trial+day_n: hito ya enviado no se repite', () => {
  const r = selectMilestone(base({ sentDays: [1, 3], nowMs: T0 + 3 * DAY + 3600e3 }));
  assert.equal(r.skip, 'not_due');
});

test('19b · nunca un hito anterior a otro ya enviado', () => {
  const r = selectMilestone(base({ sentDays: [7], nowMs: T0 + 7 * DAY + 3600e3 })); // 1 y 3 sin enviar
  assert.equal(r.skip, 'newer_milestone_sent');
});

test('20 · status distinto de trial_active → nunca envía (cancelado/convertido/expirado)', () => {
  for (const s of ['cancelled', 'paid', 'expired']) {
    assert.equal(selectMilestone(base({ status: s, nowMs: T0 + 3 * DAY })).skip, 'status_changed');
  }
});

// ── FASE 4 · backfill sin ráfagas ────────────────────────────
test('21 · backfill idempotente: segunda pasada converge sin duplicar (via decide)', () => {
  const row = { id: 'r1', status: 'trial_active', started_at: iso(T0), completed_at: null, store_transaction_id: 'otx-abc-1', source: 'revenuecat' };
  const d = decideTrialRegistry(cjTrialEvent(), row);
  assert.equal(d.action, 'update'); // misma fila; el índice único impide otra
});

test('22a · huérfano b39ca1df (backfill en día 8): días 1/3/7 renunciados, próximo = 11', () => {
  // fila creada en día 8 del trial → hitos < 8 quedan renunciados
  const created = iso(T0 + 8 * DAY);
  // en día 8 no envía nada (7 renunciado por pre-fila):
  let r = selectMilestone(base({ rowCreatedAt: created, nowMs: T0 + 8 * DAY + 3600e3 }));
  assert.equal(r.skip, 'forfeited_prebackfill');
  // en día 11 envía SOLO el 11:
  r = selectMilestone(base({ rowCreatedAt: created, nowMs: T0 + 11 * DAY + 3600e3 }));
  assert.equal(r.day, 11);
});

test('22b · huérfano c8aef6b4 (backfill en día 2): sin ráfaga día 1, próximo = 3', () => {
  const created = iso(T0 + 2 * DAY);
  let r = selectMilestone(base({ rowCreatedAt: created, nowMs: T0 + 2 * DAY + 3600e3 }));
  assert.equal(r.skip, 'forfeited_prebackfill'); // día 1 renunciado, día 3 aún no
  r = selectMilestone(base({ rowCreatedAt: created, nowMs: T0 + 3 * DAY + 3600e3 }));
  assert.equal(r.day, 3); // un solo email, el hito futuro válido
});

console.log(`\n${n} tests OK`);
