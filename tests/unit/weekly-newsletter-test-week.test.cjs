/**
 * Modo test con seleccion explicita de semana (test_week_of).
 * Brevo y Supabase simulados: NO se hace ninguna llamada real.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
let SEL;

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'api/_lib/jobs/weekly-newsletter.js');

function loadJob(createClient, fetchImpl) {
  const src = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n')
    .replace(/^import .*$/gm, '').replace(/^export \{[^}]*\};$/gm, '')
    .replace('export default async function runWeeklyNewsletter', 'async function runWeeklyNewsletter');
  return new Function('createClient', 'fetch', 'mondayOfWeekMadrid', 'isSendWindowMadrid',
    src + '\nreturn runWeeklyNewsletter;')(createClient, fetchImpl, SEL.mondayOfWeekMadrid, SEL.isSendWindowMadrid);
}

// --- dobles -----------------------------------------------------------------

// Tabla en memoria. El SELECT aplica los filtros de verdad, así que la prueba
// comprueba la consulta real y no una respuesta prefabricada.
function makeSupabase(filas, opts = {}) {
  const calls = { updates: [], selects: [] };
  const tabla = filas.map(f => ({ ...f }));
  let nUpd = 0;
  const chain = (kind, payload) => {
    const filtros = [];
    const o = {};
    o.select = () => o; o.order = () => o; o.limit = (n) => { filtros.push(['limit', n]); return o; };
    for (const m of ['eq', 'is', 'in']) o[m] = (c, v) => { filtros.push([m, c, v]); return o; };
    o.then = (resolve, reject) => Promise.resolve().then(() => {
      const casa = (row) => filtros.every(([op, c, v]) =>
        op === 'limit' ? true
          : op === 'is' ? row[c] == null
            : op === 'in' ? v.includes(row[c])
              : row[c] === v);
      if (kind === 'select') {
        calls.selects.push(filtros);
        if (opts.selectError) return { data: null, error: { message: 'x' } };
        let r = tabla.filter(casa);
        const lim = filtros.find(f => f[0] === 'limit');
        if (lim) r = r.slice(0, lim[1]);
        return { data: r.map(x => ({ ...x })), error: null };
      }
      calls.updates.push({ payload, filtros });
      nUpd++;
      if (opts.updateEmptyAt === nUpd) return { data: [], error: null };
      if (opts.updateError) return { data: null, error: { message: 'x' } };
      const afectadas = tabla.filter(casa);
      afectadas.forEach(r => Object.assign(r, payload));
      return { data: afectadas.map(r => ({ id: r.id })), error: null };
    }).then(resolve, reject);
    return o;
  };
  return { calls, tabla, from: () => ({ select: () => chain('select'), update: (p) => chain('update', p) }) };
}

function makeBrevo(opts = {}) {
  const calls = [];
  const impl = async (url, o) => {
    calls.push({ url: String(url), method: (o && o.method) || 'GET' });
    if (opts.testFails && String(url).includes('sendTest')) return { ok: false, status: 400, text: async () => "{}" };
    return { ok: true, status: 200, text: async () => JSON.stringify({ id: 500 + calls.length }) };
  };
  impl.calls = calls;
  return impl;
}
const campanas = (f) => f.calls.filter(c => c.url.includes('/emailCampaigns') && !c.url.includes('sendTest'));
const pruebas = (f) => f.calls.filter(c => c.url.includes('sendTest'));

const makeRes = () => ({ code: 0, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
const ENV = { SUPABASE_SERVICE_KEY: 'x', BREVO_API_KEY: 'x', BREVO_SENDER_EMAIL: 'hola@correrjuntos.com', WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: 'true' };
const MAIL = 'guetto2012@gmail.com';
const LUNES_ENVIO = new Date('2026-09-14T08:00:00Z');   // lunes 10:00 Madrid

// Réplica de la situación real: el pick 7 en ready y los tres borradores.
const TABLA = () => ([
  { id: 7, week_of: '2026-09-07', status: 'ready', title: 'Sizen', sent_at: null, test_campaign_id: 29, url: 'https://x/a', excerpt: 'e' },
  { id: 8, week_of: '2026-09-14', status: 'draft', title: 'Supreme Whey', sent_at: null, test_campaign_id: null, url: 'https://x/b', excerpt: 'e' },
  { id: 9, week_of: '2026-09-21', status: 'draft', title: 'Pacific', sent_at: null, test_campaign_id: null, url: 'https://x/c', excerpt: 'e' },
  { id: 10, week_of: '2026-09-28', status: 'draft', title: 'Preentrenos', sent_at: null, test_campaign_id: null, url: 'https://x/d', excerpt: 'e' },
]);

const run = (sb, bv, query, now = LUNES_ENVIO) => {
  const res = makeRes();
  return loadJob(() => sb, bv)({ query }, res, ENV, { now }).then(() => res);
};
const test_ = (week) => ({ test: MAIL, test_week_of: week });

// --- pruebas ----------------------------------------------------------------

const tests = [];
const test = (n, f) => tests.push([n, f]);

for (const [week, id, titulo] of [['2026-09-14', 8, 'Supreme Whey'], ['2026-09-21', 9, 'Pacific'], ['2026-09-28', 10, 'Preentrenos']]) {
  test(`test_week_of=${week} selecciona el pick id ${id}`, async () => {
    const sb = makeSupabase(TABLA()); const bv = makeBrevo();
    const r = await run(sb, bv, test_(week));
    assert.strictEqual(r.body.ok, true, JSON.stringify(r.body));
    assert.strictEqual(r.body.mode, 'test');
    assert.strictEqual(r.body.pick.week_of, week);
    assert.strictEqual(r.body.pick.title, titulo);
    assert.strictEqual(r.body.test_to, MAIL);
    assert.strictEqual(pruebas(bv).length, 1, 'una sola prueba');
    // Y el id de campaña queda anotado en ESE pick.
    assert.ok(sb.tabla.find(x => x.id === id).test_campaign_id, 'guarda test_campaign_id');
  });
}

test('la consulta con test_week_of no usa limit y filtra draft + sin enviar', async () => {
  const sb = makeSupabase(TABLA());
  await run(sb, makeBrevo(), test_('2026-09-21'));
  const sel = sb.calls.selects[0].map(([op, c, v]) => op + ':' + c + '=' + v);
  assert.ok(sel.includes('eq:week_of=2026-09-21'), 'filtra la semana');
  assert.ok(sel.includes('eq:status=draft'), 'exige draft');
  assert.ok(sel.includes('is:sent_at=null'), 'exige sin enviar');
  assert.ok(!sb.calls.selects[0].some(f => f[0] === 'limit'), 'sin limit(1)');
});

test('formato inválido -> 400 y cero llamadas a Brevo', async () => {
  for (const mala of ['2026-9-14', '14-09-2026', 'lunes', '2026-09-14T00:00:00Z']) {
    const sb = makeSupabase(TABLA()); const bv = makeBrevo();
    const r = await run(sb, bv, test_(mala));
    assert.strictEqual(r.code, 400, mala);
    assert.strictEqual(r.body.error, 'invalid_test_week_of_format', mala);
    assert.strictEqual(bv.calls.length, 0, mala + ': sin Brevo');
    assert.strictEqual(sb.calls.updates.length, 0, mala + ': sin escrituras');
  }
});

test('fecha real pero no lunes -> 400', async () => {
  const sb = makeSupabase(TABLA()); const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-09-15'));   // martes
  assert.strictEqual(r.code, 400);
  assert.strictEqual(r.body.error, 'test_week_of_not_monday');
  assert.strictEqual(bv.calls.length, 0);
});

test('fecha inexistente en el calendario -> 400', async () => {
  const r = await run(makeSupabase(TABLA()), makeBrevo(), test_('2026-02-30'));
  assert.strictEqual(r.code, 400);
  assert.strictEqual(r.body.error, 'invalid_test_week_of_date');
});

test('semana sin borrador -> 404 y cero llamadas a Brevo', async () => {
  const sb = makeSupabase(TABLA()); const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-10-05'));
  assert.strictEqual(r.code, 404);
  assert.strictEqual(r.body.error, 'test_pick_not_found');
  assert.strictEqual(bv.calls.length, 0);
  assert.strictEqual(sb.calls.updates.length, 0);
});

test('una semana en ready no es elegible en modo test dirigido -> 404', async () => {
  // El pick 7 está en 'ready': el contrato exige draft.
  const sb = makeSupabase(TABLA()); const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-09-07'));
  assert.strictEqual(r.code, 404);
  assert.strictEqual(bv.calls.length, 0);
});

test('varias filas para la misma semana -> fail-closed, sin campaña', async () => {
  const filas = TABLA();
  filas.push({ id: 11, week_of: '2026-09-14', status: 'draft', title: 'Duplicado', sent_at: null, test_campaign_id: null, url: 'https://x/e', excerpt: 'e' });
  const sb = makeSupabase(filas); const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-09-14'));
  assert.strictEqual(r.code, 409);
  assert.strictEqual(r.body.error, 'test_pick_ambiguous');
  assert.strictEqual(r.body.count, 2);
  assert.strictEqual(bv.calls.length, 0, 'no crea campaña');
});

test('test sin test_week_of con varios pendientes -> test_week_required', async () => {
  const sb = makeSupabase(TABLA()); const bv = makeBrevo();
  const r = await run(sb, bv, { test: MAIL });
  assert.strictEqual(r.code, 400);
  assert.strictEqual(r.body.error, 'test_week_required');
  assert.strictEqual(r.body.pending, 3, "solo cuenta borradores");
  assert.strictEqual(bv.calls.length, 0, 'no adivina: no llama a Brevo');
});

test('test sin test_week_of con un solo pendiente sigue funcionando', async () => {
  const sb = makeSupabase([TABLA()[1]]); const bv = makeBrevo();
  const r = await run(sb, bv, { test: MAIL });
  assert.strictEqual(r.body.ok, true);
  assert.strictEqual(r.body.pick.week_of, '2026-09-14');
  assert.strictEqual(pruebas(bv).length, 1);
});

test('test_week_of sin test -> 400, no altera nada', async () => {
  const sb = makeSupabase(TABLA()); const bv = makeBrevo();
  const r = await run(sb, bv, { test_week_of: '2026-09-14' });
  assert.strictEqual(r.code, 400);
  assert.strictEqual(r.body.error, 'test_week_of_requires_test');
  assert.strictEqual(bv.calls.length, 0);
});

test('el flujo live ignora test_week_of y mantiene su selección', async () => {
  // Lunes 14 en ventana: live debe buscar SU semana, no la que diga el parámetro.
  const filas = TABLA();
  filas.find(f => f.id === 8).status = 'ready';
  const sb = makeSupabase(filas); const bv = makeBrevo();
  const r = await run(sb, bv, { test_week_of: '2026-09-28' });
  // Sin ?test= el parámetro se rechaza antes de nada: el live nunca lo usa.
  assert.strictEqual(r.body.error, 'test_week_of_requires_test');
  assert.strictEqual(bv.calls.length, 0);

  // Y sin el parámetro, el live elige el de su propia semana.
  const sb2 = makeSupabase(filas); const bv2 = makeBrevo();
  const r2 = await run(sb2, bv2, {});
  assert.strictEqual(r2.body.sent, 1);
  const sel = sb2.calls.selects[0].map(([op, c, v]) => op + ':' + c + '=' + v);
  assert.ok(sel.includes('eq:week_of=2026-09-14'), 'live filtra por SU semana');
});

test('el modo test no toca status, sent_at, brevo_campaign_id, recipients ni sending_at', async () => {
  const sb = makeSupabase(TABLA()); const bv = makeBrevo();
  await run(sb, bv, test_('2026-09-14'));
  const fila = sb.tabla.find(x => x.id === 8);
  assert.strictEqual(fila.status, 'draft');
  assert.strictEqual(fila.sent_at, null);
  assert.strictEqual(fila.brevo_campaign_id, undefined);
  assert.strictEqual(fila.recipients, undefined);
  assert.strictEqual(fila.sending_at, undefined);
  for (const u of sb.calls.updates) {
    for (const k of ['status', 'sent_at', 'brevo_campaign_id', 'recipients', 'sending_at']) {
      assert.ok(!(k in u.payload), 'el modo test escribió ' + k);
    }
  }
});

test('dos pruebas concurrentes del mismo pick crean como máximo una campaña útil', async () => {
  const sb = makeSupabase(TABLA());
  const bvA = makeBrevo(), bvB = makeBrevo();
  const [a, b] = await Promise.all([
    run(sb, bvA, test_('2026-09-14')),
    run(sb, bvB, test_('2026-09-14')),
  ]);
  const ok = [a, b].filter(r => r.body.ok === true).length;
  const rechazadas = [a, b].filter(r => r.body.error === 'test_campaign_already_exists').length;
  assert.strictEqual(ok, 1, 'solo una prospera');
  assert.strictEqual(rechazadas, 1, 'la otra se detiene por la toma atómica');
  assert.strictEqual(pruebas(bvA).length + pruebas(bvB).length, 1, 'una sola prueba enviada');
  assert.ok([a, b].find(r => r.body.orphan_test_campaign_id), 'la huérfana se reporta');
});

test('los tres picks siguen en draft tras probar los tres', async () => {
  const sb = makeSupabase(TABLA());
  const bv = makeBrevo();   // el mismo doble: así los ids de campaña avanzan, como en Brevo
  for (const w of ['2026-09-14', '2026-09-21', '2026-09-28']) await run(sb, bv, test_(w));
  for (const id of [8, 9, 10]) {
    const f = sb.tabla.find(x => x.id === id);
    assert.strictEqual(f.status, 'draft', 'pick ' + id);
    assert.strictEqual(f.sent_at, null, 'pick ' + id);
    assert.ok(f.test_campaign_id, 'pick ' + id + ' con su campaña de prueba');
  }
  // Y cada uno recibió un id distinto.
  const ids = [8, 9, 10].map(id => sb.tabla.find(x => x.id === id).test_campaign_id);
  assert.strictEqual(new Set(ids).size, 3, 'tres campañas distintas');
});

test('las respuestas no exponen correos, secretos ni rutas internas', () => {
  const src = fs.readFileSync(SRC, 'utf8');
  const errores = [...src.matchAll(/json\(\{\s*error:[^}]*\}\)/g)].map(m => m[0]);
  for (const e of errores) {
    assert.ok(!/message|detail:|\.json\b|stack|SERVICE_KEY|API_KEY/.test(e), 'respuesta con payload: ' + e.slice(0, 80));
  }
});

// ---- v2: solo borradores, y test_sent_at solo tras un envío bueno ----

for (const estado of ['paused', 'cancelled', 'ready', 'sending']) {
  test(`un único pick en ${estado} no se selecciona sin fecha explícita`, async () => {
    const sb = makeSupabase([{ id: 20, week_of: '2026-10-05', status: estado, title: 'T', sent_at: null, test_campaign_id: null, url: 'https://x/z', excerpt: 'e' }]);
    const bv = makeBrevo();
    const r = await run(sb, bv, { test: MAIL });
    // Responde ok con sent:0 — no es un fallo, simplemente no hay candidato.
    assert.notStrictEqual(r.body.mode, 'test', estado + ': no debe llegar a modo test');
    assert.strictEqual(bv.calls.length, 0, estado + ': cero llamadas a Brevo');
    assert.strictEqual(sb.calls.updates.length, 0, estado + ': cero escrituras');
  });
}

test('sendTest falla: guarda test_campaign_id y deja test_sent_at en NULL', async () => {
  const sb = makeSupabase(TABLA());
  const bv = makeBrevo({ testFails: true });
  const r = await run(sb, bv, test_('2026-09-14'));
  assert.strictEqual(r.code, 500);
  assert.strictEqual(r.body.error, 'test_send_failed');
  assert.notStrictEqual(r.body.ok, true, 'nunca afirma éxito');
  const fila = sb.tabla.find(x => x.id === 8);
  assert.ok(fila.test_campaign_id, 'el id queda guardado');
  assert.strictEqual(fila.test_sent_at, undefined, 'test_sent_at sigue sin escribirse');
});

test('sendTest bueno: test_sent_at se escribe DESPUÉS de la llamada', async () => {
  const sb = makeSupabase(TABLA()); const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-09-14'));
  assert.strictEqual(r.body.ok, true);
  assert.ok(sb.tabla.find(x => x.id === 8).test_sent_at, 'queda constancia');
  // Orden: el primer update reclama el id, el segundo sella la fecha.
  assert.ok('test_campaign_id' in sb.calls.updates[0].payload, 'primero se reclama el id');
  assert.ok(!('test_sent_at' in sb.calls.updates[0].payload), 'la reclamación no sella la fecha');
  assert.ok('test_sent_at' in sb.calls.updates[1].payload, 'la fecha llega en el segundo update');
  // Y ese último exige las cinco condiciones.
  const f = sb.calls.updates[1].filtros.map(([op, c, v]) => op + ':' + c + '=' + v);
  for (const cond of ['eq:id=8', 'eq:week_of=2026-09-14', 'eq:status=draft', 'eq:test_campaign_id=501', 'is:sent_at=null']) {
    assert.ok(f.includes(cond), 'falta ' + cond + ' en ' + JSON.stringify(f));
  }
});

test('si no se puede sellar test_sent_at, no se afirma éxito', async () => {
  // El segundo update (el que sella la fecha) no afecta a ninguna fila.
  const sb = makeSupabase(TABLA(), { updateEmptyAt: 2 });
  const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-09-14'));
  assert.strictEqual(r.code, 500);
  assert.strictEqual(r.body.error, 'test_sent_state_persist_failed');
  assert.notStrictEqual(r.body.ok, true);
  assert.strictEqual(pruebas(bv).length, 1, 'la prueba sí salió: no se reenvía');
});

test('pick con campaña Y fecha de prueba -> test_already_sent, sin crear otra', async () => {
  const filas = TABLA();
  Object.assign(filas.find(f => f.id === 8), { test_campaign_id: 777, test_sent_at: '2026-09-04T10:00:00Z' });
  const sb = makeSupabase(filas); const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-09-14'));
  assert.strictEqual(r.code, 409);
  assert.strictEqual(r.body.error, 'test_already_sent');
  assert.strictEqual(r.body.test_campaign_id, 777);
  assert.strictEqual(bv.calls.length, 0, 'ni crea ni envía');
  assert.strictEqual(sb.calls.updates.length, 0);
});

test('pick con campaña pero SIN fecha -> test_delivery_unconfirmed para revisión manual', async () => {
  const filas = TABLA();
  filas.find(f => f.id === 8).test_campaign_id = 777;
  const sb = makeSupabase(filas); const bv = makeBrevo();
  const r = await run(sb, bv, test_('2026-09-14'));
  assert.strictEqual(r.code, 409);
  assert.strictEqual(r.body.error, 'test_delivery_unconfirmed');
  assert.strictEqual(r.body.test_campaign_id, 777, 'devuelve el id para recuperarlo a mano');
  assert.strictEqual(bv.calls.length, 0, 'no crea otra campaña ni reenvía');
  assert.strictEqual(sb.calls.updates.length, 0);
  // Y no filtra nada más que el id.
  assert.ok(!('test_to' in r.body) && !JSON.stringify(r.body).includes('@'), 'sin direcciones');
});

// --- runner -----------------------------------------------------------------

(async () => {
  SEL = await import('file:///' + path.join(ROOT, 'api/_lib/newsletter-selection.js').replace(/\\/g, '/'));
  let bad = 0;
  for (const [name, fn] of tests) {
    try { await fn(); console.log('  OK     ' + name); }
    catch (e) { bad++; console.log('  FALLA  ' + name + '\n         ' + e.message); }
  }
  console.log(bad ? `\n${bad} FALLOS de ${tests.length}` : `\nTODAS OK (${tests.length})`);
  process.exit(bad ? 1 : 0);
})();
