import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';
import test from 'node:test';
import { collectCommercialMetrics, isInternal } from '../../api/_lib/health-commercial.js';

const now = new Date('2026-09-20T08:45:00Z');
const yday = { start: '2026-09-19T00:00:00Z', end: '2026-09-20T00:00:00Z' };
const options = { now, yday };
const profile = (id, email = `${id}@customer.example.org`, es_seed = false) => ({ id, email, es_seed, created_at: '2026-09-19T01:00:00Z' });
const event = (id, event_name, extra = {}) => ({ id, event_name, user_id: 'customer', event_id: `evt-${id}`, session_id: 'session-1', event_ts: '2026-09-19T06:00:00Z', params: {}, ...extra });

// In-memory PostgREST contract; rejects every write and never uses the network.
function database(tables = {}, { failure, pageLimit = Infinity, hook } = {}) {
  const calls = [];
  const from = (table) => {
    let predicate = () => true, sort, slice, head = false;
    const add = (fn) => { const prev = predicate; predicate = (r) => prev(r) && fn(r); };
    const query = {
      select(columns, opts = {}) { head = opts.head; calls.push({ table, columns, opts }); return this; },
      in(col, values) { add((r) => values.includes(r[col])); return this; },
      eq(col, value) { add((r) => r[col] === value); return this; },
      gte(col, value) { add((r) => Date.parse(r[col]) >= Date.parse(value)); return this; },
      lt(col, value) { add((r) => Date.parse(r[col]) < Date.parse(value)); return this; },
      order(col) { sort = col; return this; },
      range(a, b) { slice = [a, Math.min(b + 1, a + pageLimit)]; return this; },
      insert() { throw new Error('WRITE FORBIDDEN'); }, update() { throw new Error('WRITE FORBIDDEN'); }, delete() { throw new Error('WRITE FORBIDDEN'); },
      then(resolve, reject) {
        return Promise.resolve().then(() => {
          if (failure === table) return { data: null, count: null, error: { message: 'test read failure' } };
          let rows = (tables[table] || []).filter(predicate);
          if (sort) rows = rows.sort((a, b) => a[sort] < b[sort] ? -1 : a[sort] > b[sort] ? 1 : 0);
          const result = { data: head ? null : (slice ? rows.slice(...slice) : rows), count: rows.length, error: null };
          return hook ? hook({ table, slice, result }) : result;
        }).then(resolve, reject);
      },
    };
    return query;
  };
  return { from, calls };
}
async function calculate(events = [], extra = {}, dbOptions) {
  const sb = database({ profiles: [profile('customer')], analytics_events: events, trial_starts: [], ...extra }, dbOptions);
  return { ...await collectCommercialMetrics(sb, options), sb };
}

test('a click and a start followed by cancellation are zero completed purchases', async () => {
  const { metrics: m } = await calculate(['purchase_cta_clicked', 'purchase_started', 'purchase_cancelled'].map((name, i) => event(i, name)));
  assert.equal(m.compras_ok_ayer, 0); assert.equal(m.compras_fallidas_ayer, 0); assert.equal(m.compras_canceladas_ayer, 1);
});
test('only exact success counts; restoration and guard are separate', async () => {
  const { metrics: m } = await calculate(['purchase_cta_clicked', 'purchase_started', 'purchase_success', 'purchase_restored', 'purchase_pkg_guard'].map((name, i) => event(i, name)));
  assert.equal(m.compras_ok_ayer, 1); assert.equal(m.compras_restauradas_ayer, 1); assert.equal(m.purchase_success_7d, 1);
});
test('QA, internal domains, invalid QA addresses and seed profiles are excluded from every commercial metric', async () => {
  const profiles = [profile('customer'), profile('qa', 'Guetto2012+test@gmail.com'), profile('seed', undefined, true), profile('review', 'review@example.org'), profile('invalid', 'qa@example.invalid')];
  const events = profiles.flatMap((p, i) => ['paywall_opened', 'paywall_view_eligible_trial', 'purchase_cta_clicked', 'purchase_started', 'purchase_cancelled', 'purchase_success', 'purchase_failed', 'purchase_restored', 'purchase_pkg_guard', 'entitlement_activated'].map((name, j) => event(i * 10 + j, name, { user_id: p.id })));
  const { metrics: m } = await calculate(events, { profiles, trial_starts: profiles.map((p, i) => ({ id: i, user_id: p.id, started_at: '2026-09-19T06:00:00Z' })) });
  for (const key of ['paywall_7d', 'paywall_con_trial_7d', 'cta_taps_7d', 'purchase_started_7d', 'purchase_cancelled_7d', 'purchase_success_7d', 'trials_7d', 'entitlement_activated_7d', 'compras_fallidas_reales_7d', 'compras_ok_ayer', 'compras_restauradas_ayer']) assert.equal(m[key], 1, key);
  assert.equal(m.eventos_internos_excluidos_7d, 40); assert.equal(m.trials_internos_excluidos_7d, 4);
});
test('existing internal patterns remain case-insensitive', () => {
  for (const email of ['guetto2012+qa@gmail.com', 'MUNDODEFABULAS11@gmail.com', 'REVIEW@test.org', 'cloudtestlab@test.org', 'qa@partners.correrjuntos.app', 'staff@correrjuntos.com']) assert.ok(isInternal(email));
  assert.equal(isInternal('real@customer.example.org'), false);
});
test('explicit sandbox events are excluded; missing environment is not called verified revenue', async () => {
  const events = [{ environment: 'SANDBOX' }, { store_environment: 'sandbox' }, { is_sandbox: true }, { isSandbox: true }, {}].map((params, i) => event(i, 'purchase_success', { params }));
  const { metrics: m } = await calculate(events);
  assert.equal(m.purchase_success_7d, 1); assert.equal(m.eventos_sandbox_excluidos_7d, 4);
  assert.match(m.alcance_compras, /no cobros confirmados/);
});
test('legacy cancellation error/error_key is not a technical failure', async () => {
  const { metrics: m } = await calculate([
    event(1, 'purchase_failed', { params: { error: 'User cancelled' } }),
    event(2, 'purchase_failed', { params: { error_key: 'purchase_cancelled' } }),
    event(3, 'purchase_failed', { params: { error_key: 'network_error' } }),
    event(4, 'purchase_failed'), event(5, 'purchase_cancelled'),
  ]);
  assert.equal(m.compras_canceladas_ayer, 3); assert.equal(m.compras_fallidas_ayer, 2); assert.equal(m.compras_fallidas_reales_7d, 2);
});
test('exact event IDs deduplicate by owner; legacy missing IDs remain distinct', async () => {
  const { metrics: m } = await calculate([event(1, 'purchase_success'), event(2, 'purchase_success', { event_id: 'evt-1' }), event(3, 'purchase_success', { user_id: 'b', event_id: 'evt-1' }), event(4, 'purchase_success', { event_id: null }), event(5, 'purchase_success', { event_id: null })], { profiles: [profile('customer'), profile('b')] });
  assert.equal(m.purchase_success_7d, 4); assert.equal(m.eventos_duplicados_excluidos_7d, 1);
});
test('entitlement metric is the actual event, never trials plus successes', async () => {
  const { metrics: m } = await calculate([event(1, 'purchase_success'), event(2, 'entitlement_activated')], { trial_starts: [{ id: 1, user_id: 'customer', started_at: '2026-09-19T01:00:00Z' }] });
  assert.equal(m.entitlement_activated_7d, 1); assert.equal(m.entitlement_proxy_7d, undefined);
});
test('eligible-session steps join user AND session, not global purchase totals', async () => {
  const { metrics: m } = await calculate([
    event(1, 'paywall_view_eligible_trial'), event(2, 'purchase_started'), event(3, 'purchase_cancelled'),
    event(4, 'purchase_success', { user_id: 'b' }),
    event(5, 'purchase_started', { session_id: 'other' }), event(6, 'purchase_started', { session_id: null }),
  ], { profiles: [profile('customer'), profile('b')] });
  assert.equal(m.purchase_started_7d, 3); assert.equal(m.sesiones_elegibles_con_inicio_7d, 1);
  assert.equal(m.sesiones_elegibles_canceladas_7d, 1); assert.equal(m.sesiones_elegibles_con_exito_7d, 0); assert.equal(m.eventos_sin_sesion_7d, 1);
});
test('fixed cutoff excludes future events and start boundary is inclusive', async () => {
  const { metrics: m } = await calculate([
    event(1, 'purchase_success', { event_ts: '2026-09-13T08:44:59Z' }),
    event(2, 'purchase_success', { event_ts: '2026-09-13T08:45:00Z' }),
    event(3, 'purchase_success', { event_ts: '2026-09-20T08:45:00Z' }),
    event(4, 'purchase_success', { event_ts: '2026-09-20T09:00:00Z' }),
  ]);
  assert.equal(m.purchase_success_7d, 1); assert.equal(m.compras_ok_ayer, 0);
});
test('yesterday boundaries work with PostgREST timezone suffixes', async () => {
  const { metrics: m } = await calculate([event(1, 'purchase_success', { event_ts: '2026-09-19T00:00:00+00:00' }), event(2, 'purchase_success', { event_ts: '2026-09-20T00:00:00+00:00' })]);
  assert.equal(m.compras_ok_ayer, 1);
});
test('all event pages are read, including server limits smaller than requested', async () => {
  const { metrics: m } = await calculate(Array.from({ length: 1103 }, (_, i) => event(i, 'purchase_success')), {}, { pageLimit: 200 });
  assert.equal(m.purchase_success_7d, 1103);
});
test('trial pagination and profile batches do not truncate distinct users', async () => {
  const profiles = Array.from({ length: 603 }, (_, i) => profile(`user-${i}`));
  const { metrics: m } = await calculate([], { profiles, trial_starts: profiles.map((p, i) => ({ id: i, user_id: p.id, started_at: '2026-09-19T06:00:00Z' })) }, { pageLimit: 40 });
  assert.equal(m.trials_7d, 603);
});
for (const source of ['analytics_events', 'trial_starts', 'profiles']) {
  test(`${source} read failure is unknown, not zero, and no conversion alarm is fabricated`, async () => {
    const { metrics: m, alerts } = await calculate([event(1, 'purchase_success')], {}, { failure: source });
    assert.equal(m.compras_ok_ayer, null); assert.equal(m.trials_7d, null);
    assert.equal(m.estado_datos_comerciales, 'no_disponibles'); assert.equal(alerts.length, 1); assert.match(alerts[0], /NO DISPONIBLES/);
  });
}
for (const mode of ['missing_count', 'empty_page', 'too_many', 'duplicate_page', 'changing_count']) {
  test(`incomplete pagination (${mode}) never returns a partial total`, async () => {
    const { metrics: m } = await calculate(Array.from({ length: 600 }, (_, i) => event(i, 'purchase_success')), {}, { hook: ({ table, slice, result }) => {
      if (table !== 'analytics_events') return result;
      if (mode === 'missing_count') return { ...result, count: null };
      if (mode === 'too_many') return { ...result, count: 20001 };
      if (slice?.[0] > 0) {
        if (mode === 'empty_page') return { ...result, data: [] };
        if (mode === 'duplicate_page') return { ...result, data: result.data.map((r) => ({ ...r, id: 1 })) };
        if (mode === 'changing_count') return { ...result, count: 601 };
      }
      return result;
    } });
    assert.equal(m.purchase_success_7d, null); assert.equal(m.estado_datos_comerciales, 'no_disponibles');
  });
}
test('missing profile or email cannot silently classify an unknown owner as a customer', async () => {
  for (const profiles of [[], [profile('customer', '')]]) {
    const { metrics: m } = await calculate([event(1, 'purchase_success')], { profiles });
    assert.equal(m.purchase_success_7d, null);
  }
});
test('unexpected provider rejection cannot leak raw messages into the alert email', async () => {
  const { metrics: m, alerts } = await calculate([event(1, 'purchase_success')], {}, { hook: () => { throw new Error('<script>private-provider-payload</script>'); } });
  assert.equal(m.purchase_success_7d, null);
  assert.match(alerts[0], /fallo inesperado/);
  assert.doesNotMatch(alerts[0], /script|private-provider/);
});
test('no data after valid reads is a real zero and needs no profile lookup', async () => {
  const { metrics: m, alerts, sb } = await calculate();
  assert.equal(m.purchase_success_7d, 0); assert.equal(m.trials_7d, 0); assert.deepEqual(alerts, []);
  assert.equal(sb.calls.some((c) => c.table === 'profiles'), false);
});
test('trial alert remains honest and uses the eligible cohort', async () => {
  const events = Array.from({ length: 15 }, (_, i) => event(i, 'paywall_opened'));
  events.push(...Array.from({ length: 10 }, (_, i) => event(i + 20, 'paywall_view_eligible_trial', { session_id: `session-${i}` })));
  events.push(event(40, 'purchase_started'), event(41, 'purchase_cancelled'));
  const { alerts } = await calculate(events);
  assert.match(alerts[0], /inicios 1, cancelaciones 1, éxitos 0/);
  assert.match(alerts[0], /no demuestra un fallo/);
});

const jobSource = readFileSync(new URL('../../api/_lib/jobs/health-check.js', import.meta.url), 'utf8');
const helperSource = readFileSync(new URL('../../api/_lib/health-commercial.js', import.meta.url), 'utf8');
async function invokeJob({ query = { dry: '1' }, events = [], failure } = {}) {
  const sb = database({ profiles: [profile('customer')], analytics_events: events, trial_starts: [], quedadas: [{ fecha_hora: '2026-09-21T09:00:00Z' }] }, { failure });
  const fetches = [];
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now.toISOString()])); } static now() { return now.getTime(); } }
  const context = createContext({ Date: Clock, URL, console, fetch: async (url, init) => { fetches.push({ url, init }); return { ok: true, status: 200 }; } });
  const helper = new SourceTextModule(helperSource, { context });
  const client = new SyntheticModule(['createClient'], function () { this.setExport('createClient', () => sb); }, { context });
  const job = new SourceTextModule(jobSource, { context });
  await job.link((specifier) => {
    if (specifier === '@supabase/supabase-js') return client;
    if (specifier === '../health-commercial.js') return helper;
    throw new Error(`Unexpected import ${specifier}`);
  });
  await job.evaluate();
  let status, body;
  await job.namespace.default({ query }, { status(v) { status = v; return this; }, json(v) { body = JSON.parse(JSON.stringify(v)); return this; } }, { SUPABASE_SERVICE_KEY: 'FAKE', BREVO_API_KEY: 'FAKE' });
  return { status, body, fetches };
}
test('real job dry=1 never sends mail, even with test=1 and read failures', async () => {
  const result = await invokeJob({ query: { dry: '1', test: '1' }, failure: 'trial_starts' });
  assert.equal(result.status, 200); assert.equal(result.body.emailed, false);
  assert.equal(result.body.metrics.trials_7d, null);
  assert.deepEqual(result.fetches.map((r) => r.url), ['https://www.correrjuntos.com/']);
});
test('real job incorporates corrected daily totals', async () => {
  const result = await invokeJob({ events: ['purchase_cta_clicked', 'purchase_started', 'purchase_cancelled'].map((name, i) => event(i, name)) });
  assert.equal(result.body.metrics.compras_ok_ayer, 0); assert.equal(result.body.metrics.compras_canceladas_ayer, 1);
});
test('email mock labels missing data and scopes without changing recipient or sending policy', async () => {
  const result = await invokeJob({ query: { test: '1' }, failure: 'trial_starts' });
  const mail = result.fetches.find((r) => r.url.includes('api.brevo.com'));
  assert.ok(mail); const payload = JSON.parse(mail.init.body);
  assert.match(payload.htmlContent, /No disponible/); assert.match(payload.htmlContent, /no cobros confirmados/);
  assert.match(payload.htmlContent, /últimos 7 días/); assert.match(payload.htmlContent, /compras completadas ayer \(eventos\)/);
  assert.equal(payload.to[0].email, 'correrjuntosapp@gmail.com');
});

test('ten deliberate regressions are detected, not silently accepted', async (t) => {
  const qaData = { profiles: [profile('customer'), profile('qa', 'guetto2012+qa@gmail.com')], analytics_events: [event(1, 'purchase_success', { user_id: 'qa' })] };
  const trialData = { profiles: qaData.profiles, trial_starts: [{ id: 1, user_id: 'qa', started_at: '2026-09-19T01:00:00Z' }] };
  const cases = [
    { name: 'start counted as success', from: "compras_ok_ayer: n(daily, 'purchase_success')", to: "compras_ok_ayer: n(daily, 'purchase_started')", data: { analytics_events: [event(1, 'purchase_started')] }, key: 'compras_ok_ayer', expected: 0 },
    { name: 'QA included', from: 'if (internal(row))', to: 'if (false)', data: qaData, key: 'purchase_success_7d', expected: 0 },
    { name: 'sandbox included', from: 'if (isSandbox(row.params))', to: 'if (false)', data: { analytics_events: [event(1, 'purchase_success', { params: { environment: 'SANDBOX' } })] }, key: 'purchase_success_7d', expected: 0 },
    { name: 'cancellation called failure', from: "event.event_name === 'purchase_failed' && !isCancellation(event)", to: "event.event_name === 'purchase_failed'", data: { analytics_events: [event(1, 'purchase_failed', { params: { error_key: 'purchase_cancelled' } })] }, key: 'compras_fallidas_ayer', expected: 0 },
    { name: 'duplicate success', from: 'if (seen.has(key))', to: 'if (false)', data: { analytics_events: [event(1, 'purchase_success'), event(2, 'purchase_success', { event_id: 'evt-1' })] }, key: 'purchase_success_7d', expected: 1 },
    { name: 'query failure becomes zero', from: '[key, null]', to: '[key, 0]', failure: 'analytics_events', key: 'purchase_success_7d', expected: null },
    { name: 'only first page', from: '} while (rows.length < expected);', to: '} while (false);', data: { analytics_events: Array.from({ length: 501 }, (_, i) => event(i, 'purchase_success')) }, key: 'purchase_success_7d', expected: 501 },
    { name: 'cross-account session collision', from: 'JSON.stringify([row.user_id, row.session_id])', to: 'row.session_id', data: { profiles: [profile('customer'), profile('b')], analytics_events: [event(1, 'paywall_view_eligible_trial'), event(2, 'purchase_started', { user_id: 'b' })] }, key: 'sesiones_elegibles_con_inicio_7d', expected: 0 },
    { name: 'QA trial included', from: 'rawTrials.filter((row) => !internal(row))', to: 'rawTrials', data: trialData, key: 'trials_7d', expected: 0 },
    { name: 'fabricated entitlement proxy', from: "entitlement_activated_7d: n(events, 'entitlement_activated')", to: "entitlement_activated_7d: trials.length + n(events, 'purchase_success')", data: { analytics_events: [event(1, 'purchase_success')] }, key: 'entitlement_activated_7d', expected: 0 },
  ];
  for (const c of cases) await t.test(c.name, async () => {
    const data = { profiles: [profile('customer')], analytics_events: [], trial_starts: [], ...c.data };
    const baseline = await collectCommercialMetrics(database(data, { failure: c.failure }), options);
    assert.equal(baseline.metrics[c.key], c.expected);
    const changed = helperSource.replace(c.from, c.to);
    assert.notEqual(changed, helperSource, 'mutation must actually edit the source');
    const module = new SourceTextModule(changed, { context: createContext({ console }) });
    await module.link(() => { throw new Error('Unexpected import'); }); await module.evaluate();
    const mutated = await module.namespace.collectCommercialMetrics(database(data, { failure: c.failure }), options);
    assert.notEqual(mutated.metrics[c.key], c.expected, c.name);
  });
});
