/**
 * Automatizacion semanal: seleccion, prepare, preflight, ventana horaria.
 * Brevo, Supabase y la red estan simulados: NO se hace ninguna llamada real.
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..');
const url = (p) => 'file:///' + path.join(ROOT, p).replace(/\\/g, '/');

const CATALOG = require(path.join(ROOT, 'data/newsletter-catalog.json'));
const LIBRARY = require(path.join(ROOT, 'data/newsletter-block-library.json'));

// --- dobles -----------------------------------------------------------------

function makeSupabase({ existing = [], history = [], historyError = null, insertResult, updateResults = [], rowState = null } = {}) {
  const calls = { inserts: [], updates: [], updateFilters: [], selects: [] };
  const upQueue = updateResults.slice();
  const chain = (kind, payload) => {
    const filters = [];
    const o = {};
    for (const m of ['select', 'order', 'limit']) o[m] = () => o;
    for (const m of ['eq', 'is', 'in', 'lt']) o[m] = (c, v) => { filters.push([m, c, v]); return o; };
    o.then = (resolve, reject) => Promise.resolve().then(() => {
      if (kind === 'insert') { calls.inserts.push(payload); return insertResult || { data: [{ id: 7, week_of: payload.week_of, status: 'draft' }], error: null }; }
      if (kind === 'update') {
        calls.updates.push(payload); calls.updateFilters.push(filters);
        if (upQueue.length) return upQueue.shift();
        // rowState: la fila real. El update solo prospera si TODOS los filtros
        // siguen casando, como en Postgres. Sirve para simular carreras.
        if (rowState) {
          const casa = filters.every(([op, col, val]) =>
            op === 'is' ? rowState[col] == null : op === 'eq' ? rowState[col] === val : true);
          if (!casa) return { data: [], error: null };
          Object.assign(rowState, payload);
          return { data: [{ id: rowState.id, status: rowState.status }], error: null };
        }
        return { data: [{ id: 7, status: payload.status || 'x' }], error: null };
      }
      calls.selects.push(filters);
      // select: si hay filtro lt -> historico; si no -> fila de esa semana
      if (filters.some(f => f[0] === 'lt')) return { data: historyError ? null : history, error: historyError };
      if (filters.some(f => f[0] === 'in')) return { data: existing.filter(r => ['paused', 'cancelled'].includes(r.status)), error: null };
      return { data: existing, error: null };
    }).then(resolve, reject);
    return o;
  };
  return { calls, from: () => ({ select: () => chain('select'), insert: (p) => chain('insert', p), update: (p) => chain('update', p) }) };
}

const HTML_OK = '<html><head><title>Crear el Hábito de Correr: De 0 a Rutina | CorrerJuntos</title>'
  + '<meta name="description" content="Cómo construir el hábito de correr y sostenerlo más allá de la primera semana de motivación.">'
  + '<meta property="og:image" content="https://www.correrjuntos.com/public/blog-images/habito/portada.jpg"></head><body>x</body></html>';

const makeFetch = (routes = {}) => {
  const calls = [];
  const f = async (u) => {
    calls.push(String(u));
    const r = routes[String(u)] ?? routes.default ?? { ok: true, body: HTML_OK };
    return { ok: r.ok !== false, status: r.status || (r.ok === false ? 404 : 200), text: async () => r.body || HTML_OK };
  };
  f.calls = calls;
  return f;
};

const makeBrevo = ({ createOk = true, testOk = true, campaignId = 900 } = {}) => {
  const calls = [];
  const b = async (p) => {
    calls.push(p);
    if (p === '/emailCampaigns') return { ok: createOk, status: createOk ? 201 : 400, json: createOk ? { id: campaignId } : {} };
    if (p.endsWith('/sendTest')) return { ok: testOk, status: testOk ? 204 : 400, json: {} };
    return { ok: true, status: 200, json: {} };
  };
  b.calls = calls;
  return b;
};

const makeRes = () => ({ code: 0, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
// La automatizacion es fail-closed: hay que encenderla explicitamente.
const ENV = { SUPABASE_SERVICE_KEY: 'x', BREVO_API_KEY: 'x', BREVO_SENDER_EMAIL: 'hola@correrjuntos.com', WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: 'true' };
const DATA = { catalog: CATALOG, library: LIBRARY };
const WEEK = '2026-08-17';        // reservada explicitamente
const LIBRE = '2026-08-24';       // sin reserva: aplican cooldown/categoria/estacion

// --- pruebas ----------------------------------------------------------------

const tests = [];
const test = (n, f) => tests.push([n, f]);
let SEL, PREP, PRE;

// ---- catalogo y elegibilidad ----

test('solo entran articulos de la lista blanca, y ninguno afiliado', () => {
  const el = SEL.eligibleArticles(CATALOG);
  assert.strictEqual(el.length, 16, 'catalogo ampliado a 16 verificados');
  for (const a of el) {
    assert.strictEqual(a.affiliate, false);
    assert.strictEqual(a.promotional, false);
    assert.strictEqual(a.draft, false);
    assert.strictEqual(a.language, 'es');
  }
  assert.ok(!el.some(a => a.slug === 'correr-en-verano-calor'), 'el articulo afiliado no puede colarse');
});

test('el articulo afiliado esta registrado como tal, no oculto', () => {
  const c = CATALOG.articles.find(a => a.slug === 'correr-en-verano-calor');
  assert.strictEqual(c.affiliate, true, 'nunca marcarlo falsamente como limpio');
  assert.strictEqual(c.enabled, false);
  assert.ok(c.exclusionReason && c.exclusionReason.length > 30);
});

test('cada bandera por separado excluye', () => {
  const base = SEL.eligibleArticles(CATALOG)[0];
  for (const [k, v] of [['enabled', false], ['affiliate', true], ['promotional', true], ['draft', true], ['language', 'en']]) {
    assert.strictEqual(SEL.isEligible({ ...base, [k]: v }), false, k);
  }
});

test('un campo ausente hace inelegible (nunca se asume seguro)', () => {
  const base = SEL.eligibleArticles(CATALOG)[0];
  for (const f of ['slug', 'enabled', 'affiliate', 'promotional', 'draft', 'language', 'category']) {
    const copy = { ...base }; delete copy[f];
    assert.strictEqual(SEL.isEligible(copy), false, 'sin ' + f);
  }
});

test('la biblioteca no contiene publicidad ni afiliacion', () => {
  // Solo el contenido que viaja en el correo. La nota de cabecera menciona
  // "Amazon"/"Prozis" precisamente para prohibirlos, y no se envia a nadie.
  const raw = JSON.stringify([LIBRARY.trainings, LIBRARY.tips, LIBRARY.races, LIBRARY.tools]).toLowerCase();
  for (const bad of ['amazon', 'prozis', 'diezmejores', 'amzn.to', 'cupon', 'descuento', 'patrocin']) {
    assert.ok(!raw.includes(bad), 'aparece ' + bad);
  }
  assert.ok(!raw.includes('coach jos'), 'no se atribuye nada al Coach Jose');
});

// ---- seleccion ----

test('cooldown: no repite un slug usado en las ultimas 12 ediciones', () => {
  const el = SEL.eligibleArticles(CATALOG);
  const history = el.slice(0, 10).map((a, i) => ({ week_of: '2026-0' + (i % 9 + 1) + '-01', selected_article: a.slug, category: a.category }));
  const r = SEL.selectArticle({ catalog: CATALOG, weekOf: LIBRE, history });
  assert.ok(r.article, 'debe quedar alguno');
  assert.ok(!history.some(h => h.selected_article === r.article.slug), 'no puede repetir');
});

test('no repite la categoria de la edicion anterior', () => {
  const r = SEL.selectArticle({ catalog: CATALOG, weekOf: LIBRE, history: [{ week_of: '2026-08-10', selected_article: 'x', category: 'motivacion' }] });
  assert.notStrictEqual(r.article.category, 'motivacion');
});

test('catalogo agotado: no inventa, devuelve error', () => {
  const history = SEL.eligibleArticles(CATALOG).map((a, i) => ({ week_of: '2026-0' + (i % 9 + 1) + '-01', selected_article: a.slug, category: a.category }));
  const r = SEL.selectArticle({ catalog: CATALOG, weekOf: LIBRE, history, historyLimit: 50 });
  assert.strictEqual(r.error, SEL.SELECTION_ERRORS.NO_ELIGIBLE_ARTICLE);
  assert.ok(!r.article);
});

test('catalogo invalido o vacio falla de forma segura', () => {
  assert.strictEqual(SEL.selectArticle({ catalog: null, weekOf: WEEK }).error, SEL.SELECTION_ERRORS.CATALOG_INVALID);
  assert.strictEqual(SEL.selectArticle({ catalog: { version: 1, articles: [] }, weekOf: WEEK }).error, SEL.SELECTION_ERRORS.CATALOG_EMPTY);
});

test('la seleccion es determinista para una misma semana', () => {
  const a = SEL.selectArticle({ catalog: CATALOG, weekOf: WEEK });
  const b = SEL.selectArticle({ catalog: CATALOG, weekOf: WEEK });
  assert.strictEqual(a.article.slug, b.article.slug);
  const c = SEL.selectBlocks({ library: LIBRARY, article: a.article, weekOf: WEEK });
  const d = SEL.selectBlocks({ library: LIBRARY, article: a.article, weekOf: WEEK });
  assert.deepStrictEqual(c.usedIds, d.usedIds);
});

test('la primera edicion automatica es el 2026-08-17 y elige el habito', () => {
  // Viernes 14 de agosto de 2026, 09:00 Madrid.
  assert.strictEqual(SEL.nextMondayMadrid(new Date('2026-08-14T07:00:00Z')), '2026-08-17');
  const r = SEL.selectArticle({ catalog: CATALOG, weekOf: '2026-08-17', history: [] });
  assert.strictEqual(r.article.slug, 'como-crear-habito-de-correr');
});

test('los cuatro bloques salen completos y con las URL previstas', () => {
  const art = CATALOG.articles.find(a => a.slug === 'como-crear-habito-de-correr');
  const b = SEL.selectBlocks({ library: LIBRARY, article: art, weekOf: WEEK });
  assert.deepStrictEqual(b.blocks.items.map(i => i.type), ['training', 'coach', 'race', 'tool']);
  assert.strictEqual(b.blocks.items[2].url, 'https://www.correrjuntos.com/carreras');
  assert.ok(b.blocks.items[3].url.startsWith('https://www.correrjuntos.com/'));
});

// ---- ventana horaria ----

test('CEST (verano): envia el disparo de las 08:00 UTC, no el de las 09:00', () => {
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-08-17T08:00:00Z')), true, '10:00 Madrid');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-08-17T09:00:00Z')), false, '11:00 Madrid');
});

test('CET (invierno): envia el disparo de las 09:00 UTC, no el de las 08:00', () => {
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-12-14T09:00:00Z')), true, '10:00 Madrid');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-12-14T08:00:00Z')), false, '09:00 Madrid');
});

test('la ventana abre la hora local 10 completa, solo los lunes', () => {
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-08-18T08:00:00Z')), false, 'martes');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-08-17T08:47:00Z')), true, '10:47 local: cron Hobby retrasado');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-08-17T08:59:00Z')), true, '10:59 local');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-08-17T09:00:00Z')), false, '11:00 local, fuera');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-08-17T07:59:00Z')), false, '09:59 local, fuera');
});

test('en invierno el disparo bueno es el de las 09:00 UTC, incluso retrasado', () => {
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-12-14T09:40:00Z')), true, '10:40 local en CET');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-12-14T08:40:00Z')), false, '09:40 local');
  assert.strictEqual(SEL.isSendWindowMadrid(new Date('2026-12-14T10:00:00Z')), false, '11:00 local');
});

test('en ningún momento de la semana hay dos disparos válidos a la vez', () => {
  for (const dia of ['2026-08-17', '2026-12-14']) {
    const validos = [8, 9].filter(h => SEL.isSendWindowMadrid(new Date(`${dia}T0${h}:00:00Z`)));
    assert.strictEqual(validos.length, 1, dia + ': exactamente un disparo dentro de ventana');
  }
});

test('nextMonday nunca devuelve la semana en curso', () => {
  assert.strictEqual(SEL.nextMondayMadrid(new Date('2026-08-17T08:00:00Z')), '2026-08-24', 'un lunes apunta al siguiente');
  assert.strictEqual(SEL.mondayOfWeekMadrid(new Date('2026-08-19T10:00:00Z')), '2026-08-17');
});

// ---- prepare ----

const runPrep = (deps, env = ENV) => { const r = makeRes(); return PREP.default({ query: {} }, r, env, { data: DATA, weekOf: WEEK, now: new Date('2026-08-14T07:00:00Z'), ...deps }).then(() => r); };

test('prepare: test aceptado -> ready automatico, sin intervencion humana', async () => {
  const sb = makeSupabase(); const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.ok, true);
  assert.strictEqual(r.body.status, 'ready');
  assert.strictEqual(r.body.selected_article, 'como-crear-habito-de-correr');
  assert.strictEqual(r.body.test_to, 'guetto2012@gmail.com');
  assert.strictEqual(sb.calls.inserts[0].status, 'draft', 'nace en draft');
  assert.ok(sb.calls.updates.some(u => u.status === 'ready'));
});

test('prepare: el test fallido deja el pick en draft', async () => {
  const sb = makeSupabase();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: makeBrevo({ testOk: false }) });
  assert.strictEqual(r.body.ok, false);
  assert.strictEqual(r.body.status, 'draft');
  assert.strictEqual(r.body.error, 'test_send_failed');
  assert.ok(!sb.calls.updates.some(u => u.status === 'ready'), 'jamas promociona');
});

test('prepare: la campana de test NO se guarda como campana real', async () => {
  const sb = makeSupabase();
  await runPrep({ supabase: sb, fetch: makeFetch(), brevo: makeBrevo() });
  const all = [...sb.calls.inserts, ...sb.calls.updates];
  assert.ok(all.some(u => u.test_campaign_id === 900), 'se guarda como test_campaign_id');
  assert.ok(!all.some(u => 'brevo_campaign_id' in u), 'nunca toca brevo_campaign_id');
});

test('prepare: articulo 404 aborta antes de crear nada', async () => {
  const sb = makeSupabase(); const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch({ default: { ok: false, status: 404 } }), brevo: bv });
  assert.strictEqual(r.body.error, 'article_unreachable');
  assert.strictEqual(sb.calls.inserts.length, 0, 'no crea pick');
  assert.strictEqual(bv.calls.length, 0, 'no toca Brevo');
});

test('prepare: metadatos incompletos abortan', async () => {
  const sb = makeSupabase();
  const r = await runPrep({ supabase: sb, fetch: makeFetch({ default: { ok: true, body: '<html><head><title>Solo titulo aqui</title></head></html>' } }) });
  assert.strictEqual(r.body.error, 'article_metadata_invalid');
  assert.strictEqual(sb.calls.inserts.length, 0);
});

test('prepare: un enlace de bloque roto aborta antes del pick', async () => {
  const sb = makeSupabase(); const bv = makeBrevo();
  const f = makeFetch({ 'https://www.correrjuntos.com/carreras': { ok: false, status: 404 } });
  const r = await runPrep({ supabase: sb, fetch: f, brevo: bv });
  assert.strictEqual(r.body.error, 'block_link_broken');
  assert.strictEqual(sb.calls.inserts.length, 0);
  assert.strictEqual(bv.calls.length, 0);
});

test('prepare: idempotente, si ya hay fila esa semana no crea otra', async () => {
  const sb = makeSupabase({ existing: [{ id: 1, status: 'ready' }] });
  const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.prepared, 0);
  assert.strictEqual(r.body.reason, 'week_already_prepared');
  assert.strictEqual(sb.calls.inserts.length, 0);
  assert.strictEqual(bv.calls.length, 0);
});

test('prepare: respeta paused y cancelled, no los pisa', async () => {
  for (const st of ['paused', 'cancelled']) {
    const sb = makeSupabase({ existing: [{ id: 1, status: st }] });
    const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: makeBrevo() });
    assert.strictEqual(r.body.current_status, st);
    assert.strictEqual(sb.calls.updates.length, 0, st + ': no escribe');
    assert.strictEqual(sb.calls.inserts.length, 0);
  }
});

test('prepare: si otro proceso pisa el draft, no se promociona a ready', async () => {
  // 1er update: guardar test_campaign_id (ok). 2º: promocionar, devuelve 0 filas.
  const sb = makeSupabase({ updateResults: [{ data: [{ id: 7 }], error: null }, { data: [], error: null }] });
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: makeBrevo() });
  assert.strictEqual(r.body.error, 'ready_update_failed');
  assert.strictEqual(r.body.status, 'draft');
});

test('prepare: concurrencia, dos ejecuciones -> un solo pick y un solo test', async () => {
  let inserted = false;
  const shared = () => makeSupabase({ existing: inserted ? [{ id: 7, status: 'draft' }] : [] });
  const bvA = makeBrevo(); const bvB = makeBrevo();
  const a = await runPrep({ supabase: (() => { const s = shared(); inserted = true; return s; })(), fetch: makeFetch(), brevo: bvA });
  const b = await runPrep({ supabase: shared(), fetch: makeFetch(), brevo: bvB });
  const creados = [a, b].filter(r => r.body.prepared === 1).length;
  assert.strictEqual(creados, 1, 'solo una edicion');
  assert.strictEqual(bvA.calls.filter(c => c.endsWith('/sendTest')).length + bvB.calls.filter(c => c.endsWith('/sendTest')).length, 1);
});

test('prepare: el interruptor global lo detiene todo', async () => {
  const sb = makeSupabase(); const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv }, { ...ENV, WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: 'false' });
  assert.strictEqual(r.body.reason, 'automation_disabled');
  assert.strictEqual(sb.calls.inserts.length, 0);
  assert.strictEqual(bv.calls.length, 0);
});

test('prepare: nunca reutiliza la fila del 10 de agosto', async () => {
  const sb = makeSupabase({ history: [{ week_of: '2026-08-10', selected_article: 'correr-en-verano-calor', category: 'prevencion' }] });
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: makeBrevo() });
  assert.strictEqual(sb.calls.inserts.length, 1, 'crea una fila NUEVA');
  assert.strictEqual(sb.calls.inserts[0].week_of, '2026-08-17');
  assert.notStrictEqual(r.body.selected_article, 'correr-en-verano-calor');
  assert.ok(!sb.calls.updateFilters.some(f => f.some(x => x[2] === '2026-08-10')), 'no toca esa semana');
});

// ---- preflight ----

const runPre = (deps, env = ENV) => { const r = makeRes(); return PRE.default({ query: {} }, r, env, { weekOf: WEEK, now: new Date('2026-08-16T07:00:00Z'), ...deps }).then(() => r); };

test('preflight: con un ready valido no hace nada', async () => {
  const sb = makeSupabase({ existing: [{ id: 7, status: 'ready', url: 'https://www.correrjuntos.com/blog/x' }] });
  const bv = makeBrevo();
  const r = await runPre({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.state, 'ready_ok');
  assert.strictEqual(bv.calls.length, 0, 'ni avisa ni envia');
});

test('preflight: sin pick, lo prepara una vez', async () => {
  let llamadas = 0;
  const prepare = async (q, res) => { llamadas++; res.status(200).json({ ok: true, status: 'ready', pick_id: 9, selected_article: 'como-crear-habito-de-correr' }); };
  const r = await runPre({ supabase: makeSupabase({ existing: [] }), prepare, brevo: makeBrevo(), fetch: makeFetch() });
  assert.strictEqual(llamadas, 1, 'exactamente un intento');
  assert.strictEqual(r.body.state, 'recovered_by_prepare');
});

test('preflight: si prepare tampoco puede, avisa y no envia', async () => {
  const bv = makeBrevo();
  const prepare = async (q, res) => res.status(200).json({ ok: false, error: 'no_eligible_article' });
  const r = await runPre({ supabase: makeSupabase({ existing: [] }), prepare, brevo: bv, fetch: makeFetch() });
  assert.strictEqual(r.body.state, 'prepare_failed');
  assert.strictEqual(r.body.alert, true);
  assert.ok(bv.calls.includes('/smtp/email'), 'manda alerta operativa');
  assert.ok(!bv.calls.some(c => c.includes('sendNow')), 'nunca envia a la lista');
});

test('preflight: enlace roto el domingo -> alerta, sin envio', async () => {
  const bv = makeBrevo();
  const sb = makeSupabase({ existing: [{ id: 7, status: 'ready', url: 'https://www.correrjuntos.com/blog/x' }] });
  const r = await runPre({ supabase: sb, fetch: makeFetch({ default: { ok: false, status: 404 } }), brevo: bv });
  assert.strictEqual(r.body.state, 'ready_pick_broken');
  assert.ok(bv.calls.includes('/smtp/email'));
});

test('preflight: paused/cancelled se respetan y no generan alerta', async () => {
  for (const st of ['paused', 'cancelled']) {
    const bv = makeBrevo();
    const sb = makeSupabase({ existing: [{ id: 7, status: st, url: null }] });
    const r = await runPre({ supabase: sb, fetch: makeFetch(), brevo: bv });
    assert.strictEqual(r.body.state, 'edition_held', st);
    assert.strictEqual(bv.calls.length, 0, st + ': sin alerta');
  }
});

test('preflight: nunca llama a sendNow bajo ningun camino', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-preflight.js'), 'utf8');
  assert.ok(!src.includes('sendNow'), 'el preflight no puede mencionar sendNow');
  // Se mira el código, no los comentarios: prepare menciona sendNow para decir
  // justamente que no lo usa.
  const sinComentarios = (t) => t.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const prep = sinComentarios(fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-prepare.js'), 'utf8'));
  assert.ok(!prep.includes('sendNow'), 'prepare tampoco lo invoca');
});

test('las alertas van saneadas, sin claves ni rutas', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-preflight.js'), 'utf8');
  assert.ok(src.includes("replace(/[^a-z0-9_\\-. ]/gi, '')"), 'el detalle se sanea');
  assert.ok(!/API_KEY|SERVICE_KEY|CRON_SECRET/.test(src.replace(/SUPABASE_SERVICE_KEY/g, '')), 'sin secretos en el texto');
});

// ---- envio del lunes ----

test('el job de envio tiene guarda de ventana y de interruptor', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter.js'), 'utf8');
  assert.ok(src.includes('outside_send_window'));
  assert.ok(src.includes('automation_disabled'));
  assert.ok(src.includes('skipped_paused'));
  assert.ok(src.includes('skipped_no_pick'));
  assert.ok(src.includes('isSendWindowMadrid'), 'usa la guarda Europe/Madrid');
  assert.ok(src.includes('mondayOfWeekMadrid'), 'la semana se calcula en Madrid');
});

test('los dos cron del lunes estan registrados, y prepare/preflight tambien', () => {
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const send = v.crons.filter(c => c.path.endsWith('job=weekly-newsletter'));
  assert.strictEqual(send.length, 2, 'dos disparos UTC');
  assert.deepStrictEqual(send.map(c => c.schedule).sort(), ['0 8 * * 1', '0 9 * * 1']);
  assert.ok(v.crons.some(c => c.path.includes('weekly-newsletter-prepare') && c.schedule === '0 7 * * 5'));
  assert.ok(v.crons.some(c => c.path.includes('weekly-newsletter-preflight') && c.schedule === '0 8 * * 0'));
  const run = fs.readFileSync(path.join(ROOT, 'api/cron/run.js'), 'utf8');
  assert.ok(run.includes("'weekly-newsletter-prepare'") && run.includes("'weekly-newsletter-preflight'"));
});

// ---- render y seguridad ----

test('render: la edicion construida produce HTML valido y escapado', async () => {
  const art = CATALOG.articles.find(a => a.slug === 'como-crear-habito-de-correr');
  const blk = SEL.selectBlocks({ library: LIBRARY, article: art, weekOf: WEEK });
  const ed = SEL.buildEdition({ article: art, blocks: blk.blocks, weekOf: WEEK, articleMeta: { title: 'T<script>', description: 'D&D', image: 'https://x/y.jpg' } });
  const mod = await import(url('api/_lib/jobs/weekly-newsletter.js'));
  const html = mod.buildEmailHtml(ed);
  assert.ok(html.includes('&lt;script&gt;'), 'el titulo se escapa');
  assert.ok(!html.includes('<script>T'), 'no inyecta');
  assert.ok(html.includes('utm_campaign=weekly-2026-08-17-como-crear'));
});

test('render: los picks antiguos sin bloques siguen funcionando', async () => {
  const mod = await import(url('api/_lib/jobs/weekly-newsletter.js'));
  const viejo = { week_of: '2026-06-08', title: 'Antiguo', url: 'https://www.correrjuntos.com/blog/x', excerpt: 'y' };
  const html = mod.buildEmailHtml(viejo);
  assert.ok(html.length > 500);
  assert.ok(html.includes('El artículo del lunes'), 'mantiene el eyebrow clasico');
});

test('URLs no http(s) en un bloque se descartan', async () => {
  const mod = await import(url('api/_lib/jobs/weekly-newsletter.js'));
  const pick = { week_of: WEEK, title: 'T', url: 'https://www.correrjuntos.com/blog/x', excerpt: 'e',
    blocks: { version: 1, items: [{ type: 'tool', title: 'X', text: 't', url: 'javascript:alert(1)', link_text: 'ir' }] } };
  const html = mod.buildEmailHtml(pick);
  assert.ok(!html.includes('javascript:'), 'esquema peligroso descartado');
});

// ---- interruptor global fail-closed ----

test('el interruptor solo se activa con un sí explícito', () => {
  for (const v of ['true', '1', 'on', 'yes', 'TRUE', ' On ']) {
    assert.strictEqual(PREP.automationEnabled({ WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: v }), true, JSON.stringify(v));
  }
  for (const v of [undefined, null, '', ' ', 'false', '0', 'off', 'no', 'maybe', 'enabled', 'sí']) {
    assert.strictEqual(PREP.automationEnabled({ WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: v }), false, JSON.stringify(v));
  }
  assert.strictEqual(PREP.automationEnabled({}), false, 'ausente = apagado');
});

test('el dispatcher real pasa la variable a los jobs', () => {
  const run = fs.readFileSync(path.join(ROOT, 'api/cron/run.js'), 'utf8');
  assert.ok(/WEEKLY_NEWSLETTER_AUTOMATION_ENABLED:\s*process\.env\.WEEKLY_NEWSLETTER_AUTOMATION_ENABLED/.test(run),
    'sin esta línea el interruptor nunca llega al handler');
  // Y llega de verdad: se construye el env igual que el dispatcher y se prueba.
  const m = run.match(/const env = \{[\s\S]*?\n\};/);
  const envReal = new Function('process', 'return (' + m[0].replace('const env = ', '') .replace(/;$/, '') + ')')({ env: { WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: 'true' } });
  assert.strictEqual(PREP.automationEnabled(envReal), true);
  const envVacio = new Function('process', 'return (' + m[0].replace('const env = ', '').replace(/;$/, '') + ')')({ env: {} });
  assert.strictEqual(PREP.automationEnabled(envVacio), false, 'sin variable, apagado');
});

test('con la automatización apagada, prepare no escribe ni llama a Brevo', async () => {
  const sb = makeSupabase(); const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv }, { ...ENV, WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: undefined });
  assert.strictEqual(r.body.reason, 'automation_disabled');
  assert.strictEqual(sb.calls.inserts.length + sb.calls.updates.length, 0);
  assert.strictEqual(bv.calls.length, 0);
});

// ---- histórico y rotación ----

test('el histórico pide block_ids y los excluye de la rotación', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-prepare.js'), 'utf8');
  assert.ok(src.includes("'week_of, selected_article, category, block_ids'"), 'block_ids en el select');

  const art = CATALOG.articles.find(a => a.slug === 'como-crear-habito-de-correr');
  const sin = SEL.selectBlocks({ library: LIBRARY, article: art, weekOf: WEEK });
  const con = SEL.selectBlocks({ library: LIBRARY, article: art, weekOf: WEEK, recentBlockIds: sin.usedIds });
  for (const id of con.usedIds) {
    // Solo se permite repetir si el artículo no tiene otra opción compatible.
    if (sin.usedIds.includes(id)) {
      const tipo = ['trainings', 'tips', 'races', 'tools'].find(k => LIBRARY[k].some(b => b.id === id));
      assert.ok(LIBRARY[tipo].length === 1 || (art.trainingLibraryKeys || []).length <= 1 || tipo === 'races',
        'repite ' + id + ' teniendo alternativa');
    }
  }
  assert.notDeepStrictEqual(con.usedIds, sin.usedIds, 'la rotación cambia algo');
});

test('si el histórico falla, no se selecciona a ciegas', async () => {
  const sb = makeSupabase({ historyError: { message: 'boom' } });
  const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.error, 'history_query_failed');
  assert.strictEqual(sb.calls.inserts.length, 0, 'no crea nada');
  assert.strictEqual(bv.calls.length, 0);
});

// ---- reserva de semana ----

test('el 17 se elige por reserva explícita, no por prioridad', () => {
  const hist = [{ week_of: '2026-08-10', selected_article: 'beneficios-correr-en-grupo', category: 'motivacion' }];
  const r = SEL.selectArticle({ catalog: CATALOG, weekOf: '2026-08-17', history: hist });
  assert.strictEqual(r.article.slug, 'como-crear-habito-de-correr');
  assert.strictEqual(r.reserved, true);
  // Y se impone a la regla de no repetir categoría.
  assert.strictEqual(r.article.category, 'motivacion');
});

test('dos reservas para la misma semana = error fail-closed', () => {
  const c = JSON.parse(JSON.stringify(CATALOG));
  c.articles.find(a => a.slug === 'cadencia-running-ideal').scheduledWeeks = ['2026-08-17'];
  const r = SEL.selectArticle({ catalog: c, weekOf: '2026-08-17', history: [] });
  assert.strictEqual(r.error, SEL.SELECTION_ERRORS.DUPLICATE_RESERVATION);
  assert.ok(!r.article);
});

test('una reserva no puede saltarse las banderas de seguridad', () => {
  for (const [k, v] of [['affiliate', true], ['promotional', true], ['draft', true], ['enabled', false]]) {
    const c = JSON.parse(JSON.stringify(CATALOG));
    Object.assign(c.articles.find(a => a.slug === 'como-crear-habito-de-correr'), { [k]: v });
    const r = SEL.selectArticle({ catalog: c, weekOf: '2026-08-17', history: [] });
    assert.strictEqual(r.error, SEL.SELECTION_ERRORS.RESERVED_INELIGIBLE, k);
  }
});

test('reservar un artículo afiliado no lo cuela', () => {
  const c = JSON.parse(JSON.stringify(CATALOG));
  c.articles.find(a => a.slug === 'como-crear-habito-de-correr').scheduledWeeks = [];
  c.articles.find(a => a.slug === 'correr-en-verano-calor').scheduledWeeks = ['2026-08-17'];
  const r = SEL.selectArticle({ catalog: c, weekOf: '2026-08-17', history: [] });
  assert.strictEqual(r.error, SEL.SELECTION_ERRORS.RESERVED_INELIGIBLE);
});

// ---- catálogo suficiente ----

test('rotación de 20 semanas: siempre hay candidato con cooldown 12', () => {
  const history = [];
  const usados = [];
  for (let i = 0; i < 20; i++) {
    const d = new Date('2026-08-17T00:00:00Z'); d.setUTCDate(d.getUTCDate() + i * 7);
    const week = d.toISOString().slice(0, 10);
    const r = SEL.selectArticle({ catalog: CATALOG, weekOf: week, history, historyLimit: 12 });
    assert.ok(r.article, 'semana ' + week + ' sin candidato: ' + r.error);
    usados.push(r.article.slug);
    history.unshift({ week_of: week, selected_article: r.article.slug, category: r.article.category });
  }
  // Ningún slug repetido dentro de una ventana de 12.
  for (let i = 0; i < usados.length; i++) {
    const ventana = usados.slice(Math.max(0, i - 11), i);
    assert.ok(!ventana.includes(usados[i]), 'repite ' + usados[i] + ' dentro del cooldown');
  }
  assert.strictEqual(usados[0], 'como-crear-habito-de-correr', 'la primera es la reservada');
});

// ---- recuperación de draft automático ----

test('draft automático interrumpido: se reanuda sin crear otra fila', async () => {
  const sb = makeSupabase({ existing: [{ id: 7, status: 'draft', auto_prepared: true, test_campaign_id: null, title: 'T', subject: 'S', url: 'https://www.correrjuntos.com/blog/x', excerpt: 'e', week_of: WEEK }] });
  const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.ok, true);
  assert.strictEqual(r.body.status, 'ready');
  assert.strictEqual(r.body.resumed, true);
  assert.strictEqual(sb.calls.inserts.length, 0, 'no crea una segunda fila');
});

test('al reanudar se reutiliza la campaña de test, no se crea otra', async () => {
  const sb = makeSupabase({ existing: [{ id: 7, status: 'draft', auto_prepared: true, test_campaign_id: 555, title: 'T', subject: 'S', url: 'https://www.correrjuntos.com/blog/x', excerpt: 'e', week_of: WEEK }] });
  const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.test_campaign_id, 555);
  assert.ok(!bv.calls.includes('/emailCampaigns'), 'no crea una segunda campaña');
  assert.ok(bv.calls.includes('/emailCampaigns/555/sendTest'));
});

test('el id de la campaña de test se persiste ANTES de enviarla', async () => {
  const sb = makeSupabase(); const bv = makeBrevo();
  await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  const idxGuardado = sb.calls.updates.findIndex(u => u.test_campaign_id === 900);
  assert.ok(idxGuardado >= 0, 'se guarda el id');
  const idxTest = bv.calls.indexOf('/emailCampaigns/900/sendTest');
  assert.ok(idxTest >= 0);
  // El primer update (guardar id) ocurre antes del sendTest: si no se confirma,
  // no se envía. Se comprueba por el orden de los efectos registrados.
  assert.strictEqual(sb.calls.updates[0].test_campaign_id, 900, 'el primer write es el id');
});

test('si la escritura del id de test falla, no se envía la prueba', async () => {
  const sb = makeSupabase({ updateResults: [{ data: null, error: { message: 'boom' } }] });
  const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.error, 'test_campaign_id_persist_failed');
  assert.ok(!bv.calls.some(c => c.endsWith('/sendTest')), 'no manda la prueba');
});

test('un draft escrito a mano no se toca, solo se avisa', async () => {
  const sb = makeSupabase({ existing: [{ id: 7, status: 'draft', auto_prepared: false }] });
  const bv = makeBrevo();
  const r = await runPrep({ supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(r.body.error, 'manual_draft_present');
  assert.strictEqual(r.body.alert, true);
  assert.strictEqual(sb.calls.updates.length, 0);
  assert.strictEqual(bv.calls.length, 0);
});

test('preflight reanuda el draft automático una sola vez', async () => {
  let veces = 0;
  const prepare = async (q, res) => { veces++; res.status(200).json({ ok: true, status: 'ready', pick_id: 7, revalidated: true }); };
  const sb = makeSupabase({ existing: [{ id: 7, status: 'draft', auto_prepared: true, url: null }] });
  const bv = makeBrevo();
  const r = await runPre({ supabase: sb, prepare, brevo: bv, fetch: makeFetch() });
  assert.strictEqual(veces, 1);
  assert.strictEqual(r.body.state, 'resumed_auto_draft');
  assert.strictEqual(bv.calls.length, 0, 'sin alerta si se recupera');
});

test('preflight: si la reanudación falla, avisa y no envía', async () => {
  const prepare = async (q, res) => res.status(200).json({ ok: false, error: 'test_send_failed' });
  const sb = makeSupabase({ existing: [{ id: 7, status: 'draft', auto_prepared: true, url: null }] });
  const bv = makeBrevo();
  const r = await runPre({ supabase: sb, prepare, brevo: bv, fetch: makeFetch() });
  assert.strictEqual(r.body.state, 'resume_failed');
  assert.ok(bv.calls.includes('/smtp/email'));
});

// ---- dry-run ----

test('dry-run: ni escribe ni llama a Brevo, y funciona apagado', async () => {
  const sb = makeSupabase(); const bv = makeBrevo();
  const res = makeRes();
  await PREP.default({ query: { dry_run: '1' } }, res, { ...ENV, WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: 'false' },
    { data: DATA, weekOf: WEEK, now: new Date('2026-08-14T07:00:00Z'), supabase: sb, fetch: makeFetch(), brevo: bv });
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.dry_run, true);
  assert.strictEqual(res.body.prepared, 0);
  assert.strictEqual(sb.calls.inserts.length, 0, 'cero inserts');
  assert.strictEqual(sb.calls.updates.length, 0, 'cero updates');
  assert.strictEqual(bv.calls.length, 0, 'cero llamadas a Brevo');
  assert.ok(res.body.html_bytes > 500, 'ha renderizado de verdad');
  assert.ok(res.body.links_checked >= 4, 'ha comprobado los enlaces');
  assert.strictEqual(res.body.selected_article, 'como-crear-habito-de-correr');
});

test('dry-run: devuelve resumen saneado, sin payloads externos', async () => {
  const sb = makeSupabase(); const res = makeRes();
  await PREP.default({ query: { dry_run: '1' } }, res, ENV,
    { data: DATA, weekOf: WEEK, now: new Date('2026-08-14T07:00:00Z'), supabase: sb, fetch: makeFetch(), brevo: makeBrevo() });
  const raw = JSON.stringify(res.body);
  assert.ok(!raw.includes('<html'), 'no devuelve el HTML');
  assert.ok(!/SERVICE_KEY|API_KEY|apikey/i.test(raw));
});

// ---- errores saneados ----

test('ningún job devuelve payloads de Brevo ni mensajes de Supabase', () => {
  for (const f of ['weekly-newsletter.js', 'weekly-newsletter-prepare.js', 'weekly-newsletter-preflight.js']) {
    const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs', f), 'utf8');
    assert.ok(!/detail:\s*(created|test|sendNow|got)\.json/.test(src), f + ': devuelve json de Brevo');
    assert.ok(!/msg:\s*\w*[Ee]rror\.message/.test(src), f + ': devuelve message de Supabase');
    assert.ok(!/error\.message/.test(src.replace(/\/\/.*$/gm, '')), f + ': filtra message');
  }
});

// ---- imagen absoluta ----

test('la og:image relativa del blog se convierte en absoluta', () => {
  assert.strictEqual(SEL.absoluteUrl('/public/pexels/4944978-1200.webp'),
    'https://www.correrjuntos.com/public/pexels/4944978-1200.webp');
  assert.strictEqual(SEL.absoluteUrl('https://x/y.jpg'), 'https://x/y.jpg');
  assert.strictEqual(SEL.absoluteUrl('javascript:alert(1)'), null);
  assert.strictEqual(SEL.absoluteUrl(''), null);
  const art = CATALOG.articles.find(a => a.slug === 'como-crear-habito-de-correr');
  const blk = SEL.selectBlocks({ library: LIBRARY, article: art, weekOf: WEEK });
  const ed = SEL.buildEdition({ article: art, blocks: blk.blocks, weekOf: WEEK, articleMeta: { title: 'T', description: 'D', image: '/public/pexels/x.webp' } });
  assert.ok(ed.image_url.startsWith('https://'), 'en el correo la imagen debe ser absoluta');
});

// ---- concurrencia real ----

test('concurrencia real: dos ejecuciones simultáneas, un solo pick y un solo test', async () => {
  // Fila compartida + índice único simulado: el segundo insert falla.
  const tabla = { row: null };
  const mk = () => {
    const calls = { inserts: [], updates: [] };
    const chain = (kind, payload) => {
      const filters = []; const o = {};
      for (const m of ['select', 'order', 'limit']) o[m] = () => o;
      for (const m of ['eq', 'is', 'in', 'lt']) o[m] = (c, v) => { filters.push([m, c, v]); return o; };
      o.then = (r) => Promise.resolve().then(() => {
        if (kind === 'insert') {
          calls.inserts.push(payload);
          if (tabla.row) return { data: null, error: { code: '23505' } };   // unique violation
          tabla.row = { id: 7, ...payload };
          return { data: [{ id: 7, status: 'draft' }], error: null };
        }
        if (kind === 'update') { calls.updates.push(payload); if (tabla.row) Object.assign(tabla.row, payload); return { data: [{ id: 7 }], error: null }; }
        if (filters.some(f => f[0] === 'lt')) return { data: [], error: null };
        return { data: tabla.row ? [tabla.row] : [], error: null };
      }).then(r);
      return o;
    };
    return { calls, from: () => ({ select: () => chain('select'), insert: (p) => chain('insert', p), update: (p) => chain('update', p) }) };
  };
  const sbA = mk(), sbB = mk(); const bvA = makeBrevo(), bvB = makeBrevo({ campaignId: 901 });
  const [a, b] = await Promise.all([
    runPrep({ supabase: sbA, fetch: makeFetch(), brevo: bvA }),
    runPrep({ supabase: sbB, fetch: makeFetch(), brevo: bvB }),
  ]);
  const insertsOk = sbA.calls.inserts.length + sbB.calls.inserts.length;
  assert.ok(insertsOk <= 2, 'ambas lo intentan');
  assert.strictEqual(tabla.row ? 1 : 0, 1, 'solo una fila existe');
  const ganadoras = [a, b].filter(r => r.body.prepared === 1).length;
  assert.strictEqual(ganadoras, 1, 'solo una promociona a ready');
  const tests = bvA.calls.filter(c => c.endsWith('/sendTest')).length + bvB.calls.filter(c => c.endsWith('/sendTest')).length;
  assert.strictEqual(tests, 1, 'una sola prueba enviada');
});

// ---- defectos de la auditoría del 11 de agosto ----

test('DEFECTO 1: el dry-run REAL (sin deps.supabase) consulta el histórico', async () => {
  // Camino de producción: el handler construye su propio cliente. Solo se le
  // pasa la fábrica, nunca una instancia ya montada.
  const sb = makeSupabase({ history: [{ week_of: '2026-08-10', selected_article: 'como-crear-habito-de-correr', category: 'motivacion', block_ids: ['base-conversacional'] }] });
  const res = makeRes();
  await PREP.default({ query: { dry_run: '1' } }, res, { ...ENV, WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: 'false' },
    { createClient: () => sb, data: DATA, weekOf: LIBRE, now: new Date('2026-08-14T07:00:00Z'), fetch: makeFetch(), brevo: makeBrevo() });

  const consultoHistorico = sb.calls.selects.some(f => f.some(x => x[0] === 'lt' && x[1] === 'week_of'));
  assert.ok(consultoHistorico, 'el dry-run debe leer el histórico real');
  assert.strictEqual(res.body.history_size, 1, 'y usarlo, no tratarlo como vacío');
  // El artículo del histórico queda excluido por cooldown.
  assert.notStrictEqual(res.body.selected_article, 'como-crear-habito-de-correr');
  assert.strictEqual(sb.calls.inserts.length + sb.calls.updates.length, 0, 'cero escrituras');
});

test('DEFECTO 1: el dry-run real aborta si el histórico falla', async () => {
  const sb = makeSupabase({ historyError: { message: 'boom' } });
  const res = makeRes();
  await PREP.default({ query: { dry_run: '1' } }, res, ENV,
    { createClient: () => sb, data: DATA, weekOf: LIBRE, now: new Date('2026-08-14T07:00:00Z'), fetch: makeFetch(), brevo: makeBrevo() });
  assert.strictEqual(res.body.error, 'history_query_failed');
});

test('DEFECTO 1: el select del histórico pide los cuatro campos', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-prepare.js'), 'utf8');
  assert.ok(src.includes("'week_of, selected_article, category, block_ids'"));
  assert.ok(!/if \(!dryRun \|\| deps\.supabase\)/.test(src), 'la guarda que saltaba el histórico ya no existe');
});

// DEFECTO 2: revalidación al reanudar

const DRAFT_AUTO = {
  id: 7, status: 'draft', auto_prepared: true, test_campaign_id: null, week_of: WEEK,
  title: 'T', subject: 'S', excerpt: 'e',
  url: 'https://www.correrjuntos.com/blog/como-crear-habito-de-correr',
  image_url: 'https://www.correrjuntos.com/public/pexels/x.webp',
  blocks: { version: 1, items: [
    { type: 'race', title: 'C', text: 't', url: 'https://www.correrjuntos.com/carreras', link_text: 'ir' },
    { type: 'tool', title: 'H', text: 't', url: 'https://www.correrjuntos.com/planes', link_text: 'ir' },
  ] },
};

for (const [nombre, rota] of [
  ['el artículo', 'https://www.correrjuntos.com/blog/como-crear-habito-de-correr'],
  ['la imagen', 'https://www.correrjuntos.com/public/pexels/x.webp'],
  ['un enlace de bloque', 'https://www.correrjuntos.com/carreras'],
]) {
  test(`DEFECTO 2: al reanudar, si ${nombre} está roto no se manda prueba ni se promociona`, async () => {
    const sb = makeSupabase({ existing: [DRAFT_AUTO] });
    const bv = makeBrevo();
    const r = await runPrep({ supabase: sb, brevo: bv, fetch: makeFetch({ [rota]: { ok: false, status: 404 } }) });
    assert.strictEqual(r.body.error, 'block_link_broken', nombre);
    assert.strictEqual(bv.calls.length, 0, nombre + ': cero llamadas a Brevo');
    assert.ok(!sb.calls.updates.some(u => u.status === 'ready'), nombre + ': no promociona');
    assert.ok(sb.calls.updates.some(u => u.last_error === 'block_link_broken'), nombre + ': deja código');
  });
}

test('DEFECTO 2: una reanudación válida marca revalidated', async () => {
  const sb = makeSupabase({ existing: [DRAFT_AUTO] });
  const r = await runPrep({ supabase: sb, brevo: makeBrevo(), fetch: makeFetch() });
  assert.strictEqual(r.body.ok, true);
  assert.strictEqual(r.body.revalidated, true);
});

test('DEFECTO 2: preflight no acepta una reanudación sin revalidar', async () => {
  const prepare = async (q, res) => res.status(200).json({ ok: true, status: 'ready' });  // sin revalidated
  const sb = makeSupabase({ existing: [{ id: 7, status: 'draft', auto_prepared: true, url: null }] });
  const bv = makeBrevo();
  const r = await runPre({ supabase: sb, prepare, brevo: bv, fetch: makeFetch() });
  assert.strictEqual(r.body.state, 'resume_failed', 'sin la marca, no se da por bueno');
  assert.ok(bv.calls.includes('/smtp/email'));
});

// DEFECTO 3: toma atómica de la campaña de test

for (const estado of ['paused', 'cancelled']) {
  test(`DEFECTO 3: si alguien pone ${estado} mientras se crea la campaña, no se manda la prueba`, async () => {
    // La fila arranca en draft (pasa el primer SELECT) y una persona la cambia
    // justo antes del UPDATE que reclama el id.
    const row = { ...DRAFT_AUTO, week_of: WEEK };
    const sb = makeSupabase({ existing: [{ ...row }], rowState: row });
    row.status = estado;                                  // la carrera
    const bv = makeBrevo();
    const r = await runPrep({ supabase: sb, brevo: bv, fetch: makeFetch(), weekOf: WEEK });
    assert.strictEqual(r.body.error, 'test_campaign_claim_failed', estado);
    assert.ok(!bv.calls.some(c => c.endsWith('/sendTest')), estado + ': cero sendTest');
    assert.strictEqual(row.status, estado, estado + ': no se pisa el estado humano');
    assert.strictEqual(r.body.orphan_test_campaign_id, 900, 'la campaña huérfana se reporta');
  });
}

test('DEFECTO 3: la toma del id exige las cinco condiciones', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-prepare.js'), 'utf8');
  const bloque = src.slice(src.indexOf('Toma ATOMICA'), src.indexOf('const test = await brevoImpl'));
  for (const c of [".eq('id', pickId)", ".eq('week_of', weekOf)", ".eq('status', 'draft')", ".eq('auto_prepared', true)", ".is('test_campaign_id', null)"]) {
    assert.ok(bloque.includes(c), 'falta ' + c);
  }
});

test('DEFECTO 3: la promoción a ready exige también el id de test usado', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-prepare.js'), 'utf8');
  const bloque = src.slice(src.indexOf("update({ status: 'ready'"));
  for (const c of [".eq('week_of', weekOf)", ".eq('status', 'draft')", ".eq('auto_prepared', true)", ".eq('test_campaign_id', testCampaignId)"]) {
    assert.ok(bloque.includes(c), 'falta ' + c);
  }
});

// DEFECTO 4: dispatcher

test('DEFECTO 4: el dispatcher no devuelve el mensaje del error', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/cron/run.js'), 'utf8');
  assert.ok(!/json\(\{[^}]*message:/.test(src), 'no debe viajar message en la respuesta');
  assert.ok(/json\(\{ error: 'job_threw', job \}\)/.test(src), 'respuesta mínima');
  // El log sí puede tenerlo.
  assert.ok(src.includes('console.error'), 'el detalle queda en logs');
});

// DEFECTO 5 y 6: runbook y fechas

test('DEFECTO 5: el runbook no contradice la operación automática', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/weekly-newsletter-runbook.md'), 'utf8');
  assert.ok(!doc.includes('11 artículos'), 'ya son 16');
  assert.ok(!doc.includes('La aprobación humana del domingo'));
  assert.ok(!doc.includes('Qué hay que dar cada semana'));
  assert.ok(doc.includes('Cómo ampliar el catálogo'));
  assert.ok(doc.includes('No existe aprobación semanal'));
  assert.ok(doc.includes('16 artículos'));
});

test('DEFECTO 6: las fechas están al día', () => {
  assert.strictEqual(CATALOG.updated, '2026-08-11');
  assert.strictEqual(LIBRARY.updated, '2026-08-11');
  const sql = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260805_weekly_newsletter_automation.sql'), 'utf8');
  assert.ok(sql.includes('2026-08-11'), 'la migración lleva la fecha real');
});

// ---- fase 0: validador común y preflight sobre un ready roto ----

test('FASE0: el dispatcher no registra el mensaje del error en el log', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/cron/run.js'), 'utf8');
  assert.ok(!/console\.error\([^)]*e[?.]*\.?message/.test(src), 'ni en logs va el mensaje');
  assert.ok(src.includes("console.error('[cron/run] job_threw', job)"), 'solo código y job');
});

test('FASE0: existe un único validador, compartido por reanudación y preflight', () => {
  const prep = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-prepare.js'), 'utf8');
  const pre = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter-preflight.js'), 'utf8');
  assert.ok(prep.includes('export async function validateEdition'), 'el validador se exporta');
  assert.ok(prep.includes('await validateEdition(pick, fetchImpl)'), 'lo usa la reanudación');
  assert.ok(pre.includes('validateEdition'), 'lo usa el preflight');
  // Y no queda el validador antiguo del preflight.
  assert.ok(!pre.includes('let alive = false'), 'sin segundo validador');
});

test('FASE0: validateEdition detecta artículo, imagen, bloque y render', async () => {
  const base = { url: 'https://a/art', image_url: 'https://a/img.jpg', title: 'T', excerpt: 'e',
    blocks: { version: 1, items: [{ type: 'race', title: 'C', text: 't', url: 'https://a/carreras', link_text: 'x' }] } };
  assert.strictEqual(await PREP.validateEdition(base, makeFetch()), null, 'todo bien');
  for (const rota of ['https://a/art', 'https://a/img.jpg', 'https://a/carreras']) {
    const r = await PREP.validateEdition(base, makeFetch({ [rota]: { ok: false, status: 404 } }));
    assert.strictEqual(r, 'block_link_broken', rota);
  }
  // La plantilla es resistente: un pick escueto sigue superando los 500 bytes.
  // La guarda de render existe para excepciones reales, no para contenido pobre.
  const explota = { url: 'https://a/art', get title() { throw new Error('boom'); } };
  assert.strictEqual(await PREP.validateEdition(explota, makeFetch()), 'render_failed');
});

test('FASE0: un ready roto el domingo se pausa atómicamente y alerta', async () => {
  const row = { id: 7, week_of: WEEK, status: 'ready', url: 'https://a/art', image_url: 'https://a/img.jpg',
    title: 'T', excerpt: 'e', blocks: { version: 1, items: [] } };
  const sb = makeSupabase({ existing: [{ ...row }], rowState: row });
  const bv = makeBrevo();
  const r = await runPre({ supabase: sb, brevo: bv, fetch: makeFetch({ 'https://a/art': { ok: false, status: 404 } }) });
  assert.strictEqual(r.body.state, 'ready_pick_broken');
  assert.strictEqual(r.body.paused, true, 'la transición se confirmó');
  assert.strictEqual(row.status, 'paused', 'ready → paused');
  assert.strictEqual(row.last_error, 'block_link_broken');
  assert.ok(bv.calls.includes('/smtp/email'), 'avisa');
  assert.ok(!bv.calls.some(c => c.includes('sendNow')), 'nunca envía');
});

test('FASE0: la pausa exige id, week_of y status=ready, y nunca cancela', async () => {
  const row = { id: 7, week_of: WEEK, status: 'ready', url: 'https://a/art', title: 'T', excerpt: 'e' };
  const sb = makeSupabase({ existing: [{ ...row }], rowState: row });
  await runPre({ supabase: sb, brevo: makeBrevo(), fetch: makeFetch({ 'https://a/art': { ok: false, status: 404 } }) });
  const f = sb.calls.updateFilters[0].map(([op, c, v]) => op + ':' + c + '=' + v);
  for (const cond of ['eq:id=7', 'eq:week_of=' + WEEK, 'eq:status=ready']) assert.ok(f.includes(cond), 'falta ' + cond);
  assert.ok(!sb.calls.updates.some(u => u.status === 'cancelled'), 'nunca cancela');
});

test('FASE0: un ready sano pasa el preflight sin tocar nada', async () => {
  const row = { id: 7, week_of: WEEK, status: 'ready', url: 'https://a/art', image_url: 'https://a/img.jpg',
    title: 'T', excerpt: 'e', blocks: { version: 1, items: [] } };
  const sb = makeSupabase({ existing: [row], rowState: row });
  const bv = makeBrevo();
  const r = await runPre({ supabase: sb, brevo: bv, fetch: makeFetch() });
  assert.strictEqual(r.body.state, 'ready_ok');
  assert.strictEqual(sb.calls.updates.length, 0);
  assert.strictEqual(bv.calls.length, 0);
});

// --- runner -----------------------------------------------------------------

(async () => {
  SEL = await import(url('api/_lib/newsletter-selection.js'));
  PREP = await import(url('api/_lib/jobs/weekly-newsletter-prepare.js'));
  PRE = await import(url('api/_lib/jobs/weekly-newsletter-preflight.js'));
  let bad = 0;
  for (const [name, fn] of tests) {
    try { await fn(); console.log('  OK     ' + name); }
    catch (e) { bad++; console.log('  FALLA  ' + name + '\n         ' + e.message); }
  }
  console.log(bad ? `\n${bad} FALLOS de ${tests.length}` : `\nTODAS OK (${tests.length})`);
  process.exit(bad ? 1 : 0);
})();
