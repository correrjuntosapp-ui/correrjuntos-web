/**
 * Máquina de estados draft→ready→sending→sent y recuperación fail-closed.
 * Brevo y Supabase están simulados: NO se hace ninguna llamada real.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
let SEL;

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'api/_lib/jobs/weekly-newsletter.js');

// Carga el módulo ESM como función, inyectando createClient y fetch simulados.
function loadJob(createClient, fetchImpl) {
  let src = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n')
    .replace(/^import .*$/gm, '').replace(/^export {[^}]*};$/gm, '')
    .replace('export default async function runWeeklyNewsletter', 'async function runWeeklyNewsletter');
  // Las funciones de fecha vienen del módulo de selección, ya probado aparte.
  return new Function('createClient', 'fetch', 'mondayOfWeekMadrid', 'isSendWindowMadrid',
    src + '\nreturn runWeeklyNewsletter;')(createClient, fetchImpl, SEL.mondayOfWeekMadrid, SEL.isSendWindowMadrid);
}

// --- dobles -----------------------------------------------------------------

/**
 * Doble de Supabase. Dos modos:
 *  - `pick` + `updateResults`: respuestas de update prefijadas (casos de fallo).
 *  - `row`: fila mutable compartida. El update solo prospera si TODOS los
 *    filtros siguen casando, igual que en Postgres. Permite simular concurrencia
 *    real pasando el mismo objeto `row` a dos clientes distintos.
 */
function makeSupabase({ pick, row, updateResults = [] }) {
  const updates = [];
  const filtersLog = [];
  const queue = updateResults.slice();
  const source = () => row || pick;

  const applies = (filters) => filters.every(([op, col, val]) =>
    op === 'is' ? row[col] == null : op === 'eq' ? row[col] === val : true);

  const chain = (kind, payload) => {
    const filters = [];
    const o = {};
    for (const m of ['select', 'order', 'limit']) o[m] = () => o;
    for (const m of ['eq', 'is', 'in']) o[m] = (col, val) => { filters.push([m, col, val]); return o; };
    o.then = (resolve, reject) => Promise.resolve().then(() => {
      const src = source();
      if (kind === 'query') return { data: src ? [{ ...src }] : [], error: null };
      updates.push(payload);
      filtersLog.push(filters);
      if (queue.length) return queue.shift();
      if (row) {
        if (!applies(filters)) return { data: [], error: null };  // otra ejecución ganó
        Object.assign(row, payload);
        return { data: [{ id: row.id }], error: null };
      }
      return { data: [{ id: 1 }], error: null };
    }).then(resolve, reject);
    return o;
  };

  return {
    updates, filtersLog,
    from: () => ({ select: () => chain('query'), update: (p) => chain('update', p) }),
  };
}

function makeFetch(routes) {
  const calls = [];
  const impl = async (url, opts) => {
    const method = (opts && opts.method) || 'GET';
    calls.push({ url: String(url), method });
    for (const r of routes) {
      if (String(url).includes(r.match) && (!r.method || r.method === method)) {
        return { ok: r.ok !== false, status: r.status || 200, text: async () => JSON.stringify(r.body || {}) };
      }
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };
  impl.calls = calls;
  return impl;
}

const makeRes = () => ({ code: 0, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
// Fail-closed: el envío automático exige un sí explícito en el entorno.
const ENV = { SUPABASE_SERVICE_KEY: 'x', BREVO_API_KEY: 'x', BREVO_SENDER_EMAIL: 'hola@correrjuntos.com', WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: 'true' };
const BASE = { id: 42, week_of: '2026-08-10', title: 'T', subject: 'S', url: 'https://www.correrjuntos.com/blog/x', excerpt: 'E' };
const READY = { ...BASE, status: 'ready' };
const CREATE_OK = { match: '/emailCampaigns', method: 'POST', body: { id: 777 } };

const sendNowCalls = (f) => f.calls.filter(c => c.url.includes('/sendNow'));
// Lunes 17 ago 2026, 10:00 Madrid: dentro de la ventana de envio.
const IN_WINDOW = new Date('2026-08-17T08:00:00Z');
const run = (sb, f, query = {}) => loadJob(() => sb, f)({ query }, makeRes(), ENV, { now: IN_WINDOW });

// --- pruebas ----------------------------------------------------------------

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('live: persiste sending ANTES de llamar a sendNow', async () => {
  const sb = makeSupabase({ pick: READY });
  const f = makeFetch([CREATE_OK]);
  await run(sb, f);
  assert.strictEqual(sb.updates[0].status, 'sending');
  assert.ok(sb.updates[0].sending_at, 'sending_at debe quedar registrado');
  assert.strictEqual(sb.updates[0].brevo_campaign_id, 777);
  // El primer update ocurre antes de la petición de envío.
  assert.strictEqual(sendNowCalls(f).length, 1);
});

test('live: sendNow se ejecuta exactamente una vez y termina en sent', async () => {
  const sb = makeSupabase({ pick: READY });
  const f = makeFetch([CREATE_OK]);
  const res = await run(sb, f);
  assert.strictEqual(sendNowCalls(f).length, 1);
  assert.strictEqual(sb.updates[sb.updates.length - 1].status, 'sent');
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.sent, 1);
});

test('live: si Supabase no confirma el sending, NO se envía', async () => {
  const sb = makeSupabase({ pick: READY, updateResults: [{ data: null, error: { message: 'boom' } }] });
  const f = makeFetch([CREATE_OK]);
  const res = await run(sb, f);
  assert.strictEqual(sendNowCalls(f).length, 0, 'no debe llamarse a sendNow');
  assert.strictEqual(res.code, 500);
  assert.strictEqual(res.body.error, 'sending_state_persist_failed');
  assert.strictEqual(res.body.sent, 0);
});

test('live: cero filas actualizadas → pick_already_claimed, sin envío', async () => {
  const sb = makeSupabase({ pick: READY, updateResults: [{ data: [], error: null }] });
  const f = makeFetch([CREATE_OK]);
  const res = await run(sb, f);
  assert.strictEqual(sendNowCalls(f).length, 0);
  assert.strictEqual(res.body.error, 'pick_already_claimed');
  assert.strictEqual(res.body.orphan_campaign_id, 777, 'la campaña huérfana se reporta para limpieza manual');
});

test('live: sendNow falla → queda sending con last_error, sin reintento', async () => {
  const sb = makeSupabase({ pick: READY });
  // La ruta específica va primero: /sendNow también contiene /emailCampaigns.
  const f = makeFetch([{ match: '/sendNow', ok: false, status: 400, body: { code: 'x' } }, CREATE_OK]);
  const res = await run(sb, f);
  assert.strictEqual(res.body.error, 'send_failed');
  assert.strictEqual(res.body.sent, 0);
  assert.strictEqual(sb.updates[sb.updates.length - 1].last_error, 'send_failed');
  // No se revierte a 'ready': nadie debe reenviarlo automáticamente.
  assert.ok(!sb.updates.some(u => u.status === 'ready'));
});

test('live: envío hecho pero update final falla → sent_update_failed', async () => {
  const sb = makeSupabase({ pick: READY, updateResults: [{ data: [{ id: 42 }], error: null }, { data: null, error: { message: 'boom' } }] });
  const f = makeFetch([CREATE_OK]);
  const res = await run(sb, f);
  assert.strictEqual(res.body.error, 'sent_update_failed');
  assert.strictEqual(res.body.sent, 1, 'el correo salió: hay que decirlo');
  assert.strictEqual(sendNowCalls(f).length, 1);
});

test('recuperación: Brevo dice sent → sincroniza sin reenviar', async () => {
  const sb = makeSupabase({ pick: { ...BASE, status: 'sending', brevo_campaign_id: 777 } });
  const f = makeFetch([{ match: '/emailCampaigns/777', method: 'GET', body: { status: 'sent', sentDate: '2026-08-10T08:00:00Z' } }]);
  const res = await run(sb, f);
  assert.strictEqual(sendNowCalls(f).length, 0);
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.synced, true);
  assert.strictEqual(sb.updates[0].status, 'sent');
  assert.strictEqual(sb.updates[0].sent_at, '2026-08-10T08:00:00Z');
  assert.strictEqual(sb.updates[0].last_error, null);
});

test('recuperación: draft → conserva sending y exige revisión manual', async () => {
  const sb = makeSupabase({ pick: { ...BASE, status: 'sending', brevo_campaign_id: 777 } });
  const f = makeFetch([{ match: '/emailCampaigns/777', method: 'GET', body: { status: 'draft' } }]);
  const res = await run(sb, f);
  assert.strictEqual(sendNowCalls(f).length, 0);
  assert.ok(!f.calls.some(c => c.method === 'POST'), 'no debe crearse una segunda campaña');
  assert.strictEqual(res.body.error, 'manual_recovery_required');
  assert.ok(!sb.updates.some(u => u.status), 'el status no se toca');
});

test('recuperación: estado desconocido → se detiene igualmente', async () => {
  for (const st of ['queued', 'inProcess', 'suspended', 'loquesea']) {
    const sb = makeSupabase({ pick: { ...BASE, status: 'sending', brevo_campaign_id: 777 } });
    const f = makeFetch([{ match: '/emailCampaigns/777', method: 'GET', body: { status: st } }]);
    const res = await run(sb, f);
    assert.strictEqual(sendNowCalls(f).length, 0, st);
    assert.strictEqual(res.body.error, 'manual_recovery_unknown_state', st);
    assert.strictEqual(res.body.sent, 0, st);
  }
});

test('recuperación: Brevo no responde → error controlado, sin envío', async () => {
  const sb = makeSupabase({ pick: { ...BASE, status: 'sending', brevo_campaign_id: 777 } });
  const f = makeFetch([{ match: '/emailCampaigns/777', method: 'GET', ok: false, status: 500, body: { m: 'down' } }]);
  const res = await run(sb, f);
  assert.strictEqual(sendNowCalls(f).length, 0);
  assert.strictEqual(res.code, 502);
  assert.strictEqual(res.body.error, 'recovery_status_unavailable');
});

test('recuperación: sending sin campaign_id → revisión manual, sin tocar Brevo', async () => {
  const sb = makeSupabase({ pick: { ...BASE, status: 'sending', brevo_campaign_id: null } });
  const f = makeFetch([]);
  const res = await run(sb, f);
  assert.strictEqual(f.calls.length, 0, 'no se llama a Brevo');
  assert.strictEqual(res.body.error, 'manual_recovery_required');
});

test('last_error solo contiene códigos internos, nunca payloads', async () => {
  const src = fs.readFileSync(SRC, 'utf8');
  const allowed = ['send_failed', 'sent_update_failed', 'manual_recovery_required', 'manual_recovery_unknown_state', 'recovery_status_unavailable'];
  for (const m of src.match(/last_error: [^,\n}]+/g) || []) {
    const v = m.slice('last_error: '.length).trim();
    assert.ok(v === 'null' || v === 'code' || allowed.some(a => v.includes(a)), 'valor sospechoso en last_error: ' + v);
  }
  // Y ningún volcado de la respuesta de Brevo.
  assert.ok(!/last_error:.*(detail|json|raw|stack|message)/.test(src));
});

test('modo test: no toca el estado ni llama a sendNow', async () => {
  const sb = makeSupabase({ pick: { ...BASE, status: 'draft' } });
  const f = makeFetch([CREATE_OK, { match: '/sendTest', method: 'POST', body: {} }]);
  const res = await run(sb, f, { test: 'guetto2012@gmail.com' });
  assert.strictEqual(sendNowCalls(f).length, 0);
  assert.strictEqual(sb.updates.length, 0, 'el test no escribe en la BD');
  assert.strictEqual(res.body.mode, 'test');
});

test('ninguna ruta de recuperación llama a sendNow', async () => {
  const src = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
  const i = src.indexOf('async function recoverSendingPick');
  const j = src.indexOf('\nexport default');
  assert.ok(i > 0 && j > i);
  assert.ok(!src.slice(i, j).includes('sendNow'), 'recoverSendingPick no puede mencionar sendNow');
});

test('la toma del pick exige las cinco condiciones a la vez', async () => {
  const sb = makeSupabase({ pick: READY });
  await run(sb, makeFetch([CREATE_OK]));
  const claim = sb.filtersLog[0].map(([op, col, val]) => op + ':' + col + '=' + val);
  for (const cond of ['eq:id=42', 'eq:week_of=2026-08-10', 'eq:status=ready', 'is:sent_at=null', 'is:brevo_campaign_id=null']) {
    assert.ok(claim.includes(cond), 'falta la condición ' + cond + ' en ' + JSON.stringify(claim));
  }
});

test('concurrencia: dos ejecuciones sobre el mismo ready → un solo envío', async () => {
  // Una única fila compartida: quien primero la actualice, se la lleva.
  const row = { ...READY };
  const sbA = makeSupabase({ row });
  const sbB = makeSupabase({ row });
  const fA = makeFetch([CREATE_OK]);
  const fB = makeFetch([{ match: '/emailCampaigns', method: 'POST', body: { id: 888 } }]);

  // Ambas leen el mismo 'ready' antes de que ninguna escriba.
  const [resA, resB] = await Promise.all([run(sbA, fA), run(sbB, fB)]);

  const winners = [resA, resB].filter(r => r.body.sent === 1 && r.body.ok);
  const losers = [resA, resB].filter(r => r.body.error === 'pick_already_claimed');
  assert.strictEqual(winners.length, 1, 'solo una ejecución debe enviar');
  assert.strictEqual(losers.length, 1, 'la otra debe abortar por pick_already_claimed');

  // Lo que de verdad importa: una sola llamada de envío en total.
  assert.strictEqual(sendNowCalls(fA).length + sendNowCalls(fB).length, 1);
  assert.strictEqual(row.status, 'sent');
});

test('concurrencia: la ejecución perdedora deja una campaña huérfana, no la borra', async () => {
  const row = { ...READY };
  const sbA = makeSupabase({ row });
  const sbB = makeSupabase({ row });
  const fA = makeFetch([CREATE_OK]);
  const fB = makeFetch([{ match: '/emailCampaigns', method: 'POST', body: { id: 888 } }]);
  const [resA, resB] = await Promise.all([run(sbA, fA), run(sbB, fB)]);

  const loser = [resA, resB].find(r => r.body.error === 'pick_already_claimed');
  assert.ok(loser.body.orphan_campaign_id, 'el id huérfano se reporta para limpieza manual');
  // Nunca se borra ni se cancela nada en Brevo automáticamente.
  const all = [...fA.calls, ...fB.calls];
  assert.ok(!all.some(c => c.method === 'DELETE'), 'no se borra la campaña huérfana');
  assert.ok(!all.some(c => c.url.includes('/status')), 'no se cancela la campaña huérfana');
});

test('concurrencia: la perdedora no escribe el estado final', async () => {
  const row = { ...READY };
  const sbA = makeSupabase({ row });
  const sbB = makeSupabase({ row });
  await Promise.all([run(sbA, makeFetch([CREATE_OK])), run(sbB, makeFetch([{ match: '/emailCampaigns', method: 'POST', body: { id: 888 } }]))]);
  const loser = sbA.updates.some(u => u.status === 'sent') ? sbB : sbA;
  assert.ok(!loser.updates.some(u => u.status === 'sent'), 'la perdedora no marca sent');
  assert.strictEqual(row.brevo_campaign_id, 777, 'la fila conserva la campaña de la ganadora');
});

test('doble disparo: el que cae fuera de la ventana no envía nada', async () => {
  const sb = makeSupabase({ pick: READY });
  const f = makeFetch([CREATE_OK]);
  // 09:00 UTC en agosto son las 11:00 en Madrid: fuera de ventana.
  const res = await loadJob(() => sb, f)({ query: {} }, makeRes(), ENV, { now: new Date('2026-08-17T09:00:00Z') });
  assert.strictEqual(res.body.outcome, 'outside_send_window');
  assert.strictEqual(res.body.sent, 0);
  assert.strictEqual(f.calls.length, 0, 'no toca Brevo');
  assert.strictEqual(sb.updates.length, 0, 'no escribe en la BD');
});

test('en invierno el disparo válido es el de las 09:00 UTC', async () => {
  const sb = makeSupabase({ pick: READY });
  const f = makeFetch([CREATE_OK]);
  const res = await loadJob(() => sb, f)({ query: {} }, makeRes(), ENV, { now: new Date('2026-12-14T09:00:00Z') });
  assert.strictEqual(res.body.sent, 1, '10:00 Madrid en CET');
  assert.strictEqual(sendNowCalls(f).length, 1);
});

test('el interruptor global detiene el envío del lunes', async () => {
  const sb = makeSupabase({ pick: READY });
  const f = makeFetch([CREATE_OK]);
  const res = await loadJob(() => sb, f)({ query: {} }, makeRes(),
    { ...ENV, WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: undefined }, { now: IN_WINDOW });
  assert.strictEqual(res.body.outcome, 'automation_disabled');
  assert.strictEqual(f.calls.length, 0);
});

test('una edición pausada se informa como tal y no se envía', async () => {
  // Sin pick seleccionable, pero con una fila paused esa semana.
  const sb = makeSupabase({ pick: { ...BASE, status: 'paused' } });
  sb.from = () => ({
    select: () => { const o = {}; for (const m of ['select', 'order', 'limit', 'eq', 'is', 'in']) o[m] = () => o;
      o.then = (r) => Promise.resolve({ data: [{ status: 'paused' }], error: null }).then(r); return o; },
    update: () => { throw new Error('no debe escribir'); },
  });
  let calls = 0;
  const orig = sb.from;
  sb.from = () => (calls++ === 0
    ? (() => { const o = {}; for (const m of ['select', 'order', 'limit', 'eq', 'is', 'in']) o[m] = () => o;
        o.then = (r) => Promise.resolve({ data: [], error: null }).then(r); return { select: () => o }; })()
    : orig());
  const f = makeFetch([CREATE_OK]);
  const res = await loadJob(() => sb, f)({ query: {} }, makeRes(), ENV, { now: IN_WINDOW });
  assert.strictEqual(res.body.outcome, 'skipped_paused');
  assert.strictEqual(f.calls.length, 0, 'no se crea campaña');
});

// --- runner -----------------------------------------------------------------

(async () => {
  SEL = await import('file:///' + path.join(ROOT, 'api/_lib/newsletter-selection.js').replace(/\\/g, '/'));
  let bad = 0;
  for (const [name, fn] of tests) {
    try { await fn(); console.log('  OK     ' + name); }
    catch (e) { bad++; console.log('  FALLA  ' + name + '\n         ' + e.message); }
  }
  console.log(bad ? `\n${bad} FALLOS` : '\nTODAS OK (' + tests.length + ')');
  process.exit(bad ? 1 : 0);
})();
