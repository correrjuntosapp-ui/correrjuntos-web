#!/usr/bin/env node
// F182 · Comportamiento REAL de processActivityEvent (api/strava-webhook.js) con
// respuestas controladas de Strava y un doble de supabase-js en memoria.
// Contrato: una fila `runs` sin sello de servidor NUNCA se finaliza sin releer la
// actividad en Strava (identidad + modalidad) y sin persistir las métricas
// canónicas mediante f182_verify_strava_endurance_import; una fila ya verificada
// no vuelve a consultar; los fallos del proveedor no producen efectos parciales.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { register } from 'node:module';

// Los paquetes externos se sustituyen por dobles inertes: processActivityEvent recibe el
// cliente Supabase por parámetro y no usa waitUntil (solo el handler HTTP). Así la prueba
// también puede ejecutar copias del webhook (HEAD, mutantes) fuera de node_modules.
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === '@vercel/functions') return { url: 'data:text/javascript,export const waitUntil = (p) => p;', shortCircuit: true };
  if (spec === '@supabase/supabase-js') return { url: 'data:text/javascript,export const createClient = () => { throw new Error("createClient no debe usarse en la prueba"); };', shortCircuit: true };
  return next(spec, ctx);
}`));

const root = path.resolve(import.meta.dirname, '..');
const webhookPath = process.env.F182_WEBHOOK_PATH || path.join(root, 'api/strava-webhook.js');
process.env.STRAVA_CLIENT_ID ??= 'test-client';
process.env.STRAVA_CLIENT_SECRET ??= 'test-secret';
process.env.SUPABASE_SERVICE_KEY ??= 'test-service-key';
const { processActivityEvent } = await import(pathToFileURL(webhookPath).href + `?t=${Date.now()}`);
assert.equal(typeof processActivityEvent, 'function', 'processActivityEvent exportada para pruebas');

const OWNER = 4201, USER = 'u-1', ACT = 987654;
function activity(over = {}) {
  const start = new Date(Date.now() - 3600_000).toISOString();
  return { id: ACT, athlete: { id: OWNER }, sport_type: 'Run', type: 'Run', name: 'Rodaje real', distance: 12500, moving_time: 4000, elapsed_time: 4100, start_date: start, start_date_local: start, total_elevation_gain: 40, average_heartrate: 148, ...over };
}
// Doble de supabase-js: tablas en memoria, RPC registradas, sin red.
function makeSb(state) {
  const builder = (table) => {
    const st = { filters: [], op: 'select', payload: null, mode: 'list', limit: null };
    const get = (r, k) => r[k];
    const rows = () => (state.tables[table] ??= []);
    const sel = () => rows().filter((r) => st.filters.every(([k, v]) => String(get(r, k)) === String(v)));
    const finish = (list) => st.mode === 'single' ? { data: list[0] ?? null, error: list.length ? null : { code: 'PGRST116' } } : st.mode === 'maybeSingle' ? { data: list[0] ?? null, error: null } : { data: st.limit != null ? list.slice(0, st.limit) : list, error: null };
    const exec = () => {
      if (st.op === 'insert') {
        if (table === 'runs' && state.raceWinner) { const w = state.raceWinner; state.raceWinner = null; rows().push(w); state.writes.push({ table, op: 'race_insert_by_client', id: w.id }); return { data: null, error: { code: '23505', message: 'duplicate' } }; }
        const row = { id: `${table}-${rows().length + 1}`, strava_server_verified: false, ...st.payload };
        if (table === 'runs' && rows().some((r) => String(r.strava_activity_id) === String(row.strava_activity_id))) return { data: null, error: { code: '23505', message: 'duplicate' } };
        rows().push(row); state.writes.push({ table, op: 'insert', row }); return finish([row]);
      }
      if (st.op === 'update') { const list = sel(); for (const r of list) Object.assign(r, st.payload); state.writes.push({ table, op: 'update', n: list.length }); return finish(list); }
      return finish(sel());
    };
    const b = new Proxy({}, { get(_, prop) {
      if (prop === 'then') return (res, rej) => Promise.resolve().then(exec).then(res, rej);
      if (prop === 'select') return () => b;
      if (prop === 'insert') return (p) => { st.op = 'insert'; st.payload = p; return b; };
      if (prop === 'update') return (p) => { st.op = 'update'; st.payload = p; return b; };
      if (prop === 'eq') return (k, v) => { st.filters.push([k, v]); return b; };
      if (prop === 'limit') return (n) => { st.limit = n; return b; };
      if (prop === 'single') return () => { st.mode = 'single'; return b; };
      if (prop === 'maybeSingle') return () => { st.mode = 'maybeSingle'; return b; };
      return () => b;
    } });
    return b;
  };
  return {
    from: (table) => builder(table),
    rpc: async (name, args) => {
      state.rpc.push({ name, args });
      if (name === 'f182_take_strava_import_slot') return state.quota ?? { data: true, error: null };
      if (name === 'f182_verify_strava_endurance_import') {
        if (state.verifyResult) return state.verifyResult;
        const run = state.tables.runs?.find((r) => r.id === args.p_run_id && r.user_id === args.p_user_id);
        if (!run) return { data: null, error: { message: 'strava_run_not_found' } };
        const a = args.p_activity;
        if (Number(a?.strava_activity_id) !== Number(run.strava_activity_id)) return { data: null, error: { message: 'strava_activity_mismatch' } };
        if (Number(a?.athlete_id) !== OWNER) return { data: null, error: { message: 'strava_owner_mismatch' } };
        Object.assign(run, { deporte: a.deporte, distancia_km: a.distancia_km, duracion_segundos: a.duracion_segundos, fecha: a.fecha, strava_server_verified: true });
        state.writes.push({ table: 'runs', op: 'verify', id: run.id });
        return { data: { ok: true }, error: null };
      }
      if (name === 'f182_finalize_strava_endurance_import') {
        const run = state.tables.runs?.find((r) => r.id === args.p_run_id && r.user_id === args.p_user_id);
        if (!run) return { data: null, error: { message: 'strava_run_not_found' } };
        if (run.strava_server_verified !== true) return { data: null, error: { message: 'strava_import_unverified' } };
        run.coach_pipeline_version = 2; state.writes.push({ table: 'runs', op: 'finalize', id: run.id });
        return { data: { ok: true, outcome: 'no_match' }, error: null };
      }
      if (name === 'f182_finalize_strava_strength_import') { state.writes.push({ table: 'strength_workout_runs', op: 'finalize' }); return { data: { ok: true }, error: null }; }
      return { data: null, error: null };
    },
  };
}
function baseState(over = {}) {
  return {
    tables: { strava_connections: [{ user_id: USER, strava_athlete_id: OWNER, access_token: 'tok', refresh_token: 'r', expires_at: Math.floor(Date.now() / 1000) + 7200 }], runs: [], strength_workout_runs: [] },
    rpc: [], writes: [], fetch: [], ...over,
  };
}
async function run(state, fetchImpl) {
  const prior = globalThis.fetch;
  globalThis.fetch = async (url, init) => { state.fetch.push(String(url)); return fetchImpl(String(url), init); };
  try { await processActivityEvent(makeSb(state), OWNER, ACT, 'trace-test'); } finally { globalThis.fetch = prior; }
}
const okFetch = (over) => async () => ({ ok: true, status: 200, json: async () => activity(over) });
const stravaCalls = (state) => state.fetch.filter((u) => u.includes('/activities/')).length;
const rpcCount = (state, name) => state.rpc.filter((r) => r.name === name).length;
const unverifiedRow = (over = {}) => ({ id: 'run-client', user_id: USER, source: 'strava', strava_activity_id: ACT, coach_pipeline_version: 1, strava_server_verified: false, distancia_km: 5, duracion_segundos: 1500, deporte: 'running', fecha: '2026-09-01', ...over });

const results = [];
async function check(name, fn) { try { await fn(); results.push(true); console.log(`PASS ${name}`); } catch (e) { results.push(false); console.error(`FAIL ${name}: ${e.message}`); } }

await check('fila antigua sin verificar: consulta obligatoria a Strava, verificación con métricas canónicas y solo después finalización', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow()] } });
  await run(state, okFetch());
  assert.equal(stravaCalls(state), 1, 'una consulta a Strava');
  assert.equal(rpcCount(state, 'f182_take_strava_import_slot'), 1, 'cuota consumida');
  const verify = state.rpc.find((r) => r.name === 'f182_verify_strava_endurance_import');
  assert.ok(verify, 'verificación invocada');
  assert.equal(verify.args.p_run_id, 'run-client'); assert.equal(verify.args.p_user_id, USER);
  assert.equal(verify.args.p_activity.distancia_km, 12.5); assert.equal(verify.args.p_activity.duracion_segundos, 4000); assert.equal(verify.args.p_activity.athlete_id, OWNER); assert.equal(verify.args.p_activity.strava_activity_id, ACT);
  const order = state.writes.map((w) => w.op); assert.deepEqual(order, ['verify', 'finalize'], 'verificar antes de finalizar');
  const row = state.tables.runs[0]; assert.equal(row.distancia_km, 12.5); assert.equal(row.strava_server_verified, true); assert.equal(row.coach_pipeline_version, 2);
  assert.equal(state.tables.runs.length, 1, 'sin duplicados');
});
await check('fila ya verificada e íntegra (v1 tras un corte): finaliza sin otra consulta ni cuota', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow({ id: 'run-ok', strava_server_verified: true, distancia_km: 12.5 })] } });
  await run(state, async () => { throw new Error('no debería consultar Strava'); });
  assert.equal(stravaCalls(state), 0); assert.equal(rpcCount(state, 'f182_take_strava_import_slot'), 0); assert.equal(rpcCount(state, 'f182_verify_strava_endurance_import'), 0);
  assert.equal(rpcCount(state, 'f182_finalize_strava_endurance_import'), 1); assert.equal(state.tables.runs[0].coach_pipeline_version, 2);
});
await check('fila sin verificar pero con pipeline=2: NO cuenta como verificada; consulta a Strava y verificación', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow({ coach_pipeline_version: 2 })] } });
  await run(state, okFetch());
  assert.equal(stravaCalls(state), 1); assert.equal(rpcCount(state, 'f182_verify_strava_endurance_import'), 1);
  assert.equal(state.tables.runs[0].strava_server_verified, true);
});
await check('actividad inexistente (404): sin verificación, sin finalización, fila sin tocar', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow()] } });
  await run(state, async () => ({ ok: false, status: 404, json: async () => ({}) }));
  assert.equal(stravaCalls(state), 1); assert.equal(rpcCount(state, 'f182_verify_strava_endurance_import'), 0); assert.equal(rpcCount(state, 'f182_finalize_strava_endurance_import'), 0);
  assert.equal(state.tables.runs[0].strava_server_verified, false); assert.equal(state.tables.runs[0].distancia_km, 5); assert.equal(state.writes.length, 0);
});
await check('actividad de otro propietario o con otro id: sin verificación ni finalización', async () => {
  for (const over of [{ athlete: { id: 777 } }, { id: 111 }]) {
    const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow()] } });
    await run(state, okFetch(over));
    assert.equal(rpcCount(state, 'f182_verify_strava_endurance_import'), 0, JSON.stringify(over)); assert.equal(rpcCount(state, 'f182_finalize_strava_endurance_import'), 0); assert.equal(state.writes.length, 0);
  }
});
await check('modalidad incompatible (Strava dice fuerza, la fila dice resistencia): sin verificación ni importación', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow()] } });
  await run(state, okFetch({ sport_type: 'WeightTraining', type: 'WeightTraining' }));
  assert.equal(rpcCount(state, 'f182_verify_strava_endurance_import'), 0); assert.equal(rpcCount(state, 'f182_finalize_strava_endurance_import'), 0);
  assert.equal(state.tables.strength_workout_runs.length, 0); assert.equal(state.writes.length, 0);
});
await check('429 de Strava, timeout y fallo de red: sin efectos parciales', async () => {
  const cases = [async () => ({ ok: false, status: 429, json: async () => ({}) }), async () => { throw new Error('ETIMEDOUT'); }, async () => { throw new TypeError('fetch failed'); }];
  for (const impl of cases) {
    const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow()] } });
    let threw = false;
    try { await run(state, impl); } catch { threw = true; }
    assert.equal(rpcCount(state, 'f182_verify_strava_endurance_import'), 0); assert.equal(rpcCount(state, 'f182_finalize_strava_endurance_import'), 0); assert.equal(state.writes.length, 0); assert.equal(state.tables.runs[0].strava_server_verified, false);
    void threw; // el webhook puede propagar el error de red al handler: sin efectos es lo que se exige
  }
});
await check('cuota denegada: no se consulta Strava ni se verifica', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow()] }, quota: { data: false, error: null } });
  await run(state, okFetch());
  assert.equal(stravaCalls(state), 0); assert.equal(rpcCount(state, 'f182_verify_strava_endurance_import'), 0); assert.equal(state.writes.length, 0);
});
await check('conflicto 23505 con el catch-up del cliente: la fila ganadora se verifica con las métricas canónicas antes de finalizar', async () => {
  const state = baseState();
  const winner = unverifiedRow({ id: 'run-winner' });
  // el dedup no ve nada; el catch-up del cliente gana la inserción justo antes que el webhook (23505)
  state.raceWinner = winner;
  await run(state, okFetch());
  assert.equal(stravaCalls(state), 1);
  const order = state.writes.map((w) => `${w.op}:${w.id ?? ''}`);
  assert.deepEqual(order, ['race_insert_by_client:run-winner', 'verify:run-winner', 'finalize:run-winner']);
  assert.equal(winner.distancia_km, 12.5); assert.equal(winner.strava_server_verified, true); assert.equal(winner.coach_pipeline_version, 2);
  assert.equal(state.tables.runs.length, 1);
});
await check('verificación rechazada por la RPC (identidad/canónico): no se finaliza', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow()] }, verifyResult: { data: null, error: { message: 'strava_owner_mismatch' } } });
  await run(state, okFetch());
  assert.equal(rpcCount(state, 'f182_finalize_strava_endurance_import'), 0); assert.equal(state.tables.runs[0].coach_pipeline_version, 1);
});
await check('importación nueva con verificación rechazada por la RPC: la fila queda sin sello y NO se finaliza', async () => {
  const state = baseState({ verifyResult: { data: null, error: { message: 'strava_canonical_invalid' } } });
  await run(state, okFetch());
  assert.equal(state.tables.runs.length, 1); assert.ok(rpcCount(state, 'f182_verify_strava_endurance_import') >= 1, 'verificación intentada (con los reintentos del finalizador)'); assert.equal(rpcCount(state, 'f182_finalize_strava_endurance_import'), 0);
  assert.equal(state.tables.runs[0].strava_server_verified, false); assert.equal(state.tables.runs[0].coach_pipeline_version, 1);
});
await check('importación nueva del servidor: insertar → verificar → finalizar, una sola actividad', async () => {
  const state = baseState();
  await run(state, okFetch());
  assert.equal(state.tables.runs.length, 1);
  assert.deepEqual(state.writes.map((w) => w.op), ['insert', 'verify', 'finalize']);
  assert.equal(state.tables.runs[0].strava_server_verified, true); assert.equal(state.tables.runs[0].coach_pipeline_version, 2);
});
await check('dos eventos simultáneos de la misma actividad: una fila y efectos finales no duplicados', async () => {
  const shared = baseState();
  const sbState = shared;
  const prior = globalThis.fetch;
  globalThis.fetch = okFetch();
  try {
    await Promise.all([processActivityEvent(makeSb(sbState), OWNER, ACT, 't1'), processActivityEvent(makeSb(sbState), OWNER, ACT, 't2')]);
  } finally { globalThis.fetch = prior; }
  assert.equal(sbState.tables.runs.length, 1, 'una sola fila');
  assert.equal(sbState.tables.runs[0].coach_pipeline_version, 2);
  assert.equal(sbState.writes.filter((w) => w.op === 'insert').length, 1);
});
await check('reintento tras un fallo intermedio (verificación hecha, finalización caída): recupera sin otra consulta', async () => {
  const state = baseState({ tables: { ...baseState().tables, runs: [unverifiedRow({ strava_server_verified: true, distancia_km: 12.5 })] } });
  await run(state, async () => { throw new Error('no debería consultar Strava'); });
  assert.equal(state.tables.runs[0].coach_pipeline_version, 2); assert.equal(stravaCalls(state), 0);
});

const failed = results.filter((r) => !r).length;
console.log(`F182 webhook verificación (comportamiento real): ${results.length - failed}/${results.length}`);
process.exit(failed ? 1 : 0);
