// ============================================================
// F146.6A · Pruebas de privacidad de los logs del camino Strava
//
// MÉTODO. Se inyectan valores CENTINELA en el sitio de cada identificador
// real —user_id, run_id, atleta de Strava, actividad de Strava, token,
// correo— se captura TODO lo que el código escribe por consola y se exige que
// ningún centinela aparezca: ni en claro, ni parcialmente, ni hasheado, ni
// dentro de un mensaje de error, ni dentro de un stack o un payload
// serializado.
//
// El "ni hasheado" es la parte que obliga a comprobar de más: no basta con
// buscar el centinela: hay que buscar tambien sus hashes. Un hash
// determinista de un user_id sigue siendo un identificador estable, y por eso
// el contrato prohibe usarlo como sustituto.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  ALLOWED_LOG_FIELDS, sanitizeEvent, newTraceId, errorKind, errorCode,
  logEvent, logError,
} from '../../api/_lib/strava-log.js';
import { vincularActividadConPlan } from '../../api/_lib/strava-plan-linker.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const WEBHOOK = readFileSync(join(ROOT, 'api/strava-webhook.js'), 'utf8');
const LINKER = readFileSync(join(ROOT, 'api/_lib/strava-plan-linker.js'), 'utf8');
const MATCHER = readFileSync(join(ROOT, 'api/_lib/strava-plan-matcher.js'), 'utf8');
const AUDIT = readFileSync(join(ROOT, 'api/_lib/strava-linking-audit.js'), 'utf8');

// ── Centinelas ────────────────────────────────────────────
// Formas reales de cada identificador del camino.
const S = Object.freeze({
  userId:     'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',   // profiles.id
  runId:      '11111111-2222-4333-8444-555555555555',   // runs.id
  ownerId:    '134085206',                              // atleta de Strava
  activityId: '19933174301',                            // actividad de Strava
  token:      'ExponentPushToken_ZZZQQQ1234567890abcdef',
  email:      'centinela.persona@ejemplo.test',
  jwt:        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop',
});

/**
 * Formas DERIVADAS del centinela: lo que un sustituto "anonimizado" produciría.
 * Es lo que el saneador tiene que rechazar por sí solo.
 */
function derivados(valor) {
  const sha = createHash('sha256').update(valor).digest('hex');
  const md5 = createHash('md5').update(valor).digest('hex');
  return [
    valor,
    sha, sha.slice(0, 8), sha.slice(0, 12), sha.slice(0, 16),
    md5, md5.slice(0, 8),
    Buffer.from(valor).toString('base64'),
    valor.replace(/-/g, ''),
  ].filter((x) => x.length >= 6);
}

/**
 * Todo lo anterior MÁS trozos literales del centinela. Se usa contra la salida
 * REAL del código: ahí no puede aparecer ni un fragmento, aunque ese fragmento
 * suelto ('Exponent') no sea por sí mismo un identificador y no tenga sentido
 * exigirle al saneador que lo rechace fuera de contexto.
 */
function disfraces(valor) {
  const sha = createHash('sha256').update(valor).digest('hex');
  const md5 = createHash('md5').update(valor).digest('hex');
  return [
    valor,
    sha, sha.slice(0, 8), sha.slice(0, 12), sha.slice(0, 16),
    md5, md5.slice(0, 8),
    Buffer.from(valor).toString('base64'),
    valor.slice(0, 8), valor.slice(-8),          // prefijo y sufijo
    valor.replace(/-/g, ''),                      // sin guiones
  ].filter((x) => x.length >= 6);
}

/** Ejecuta `fn` capturando console.log/error/warn/info. */
async function capturar(fn) {
  const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
  const lineas = [];
  const cap = (...a) => lineas.push(a.map((x) => {
    if (typeof x === 'string') return x;
    try { return JSON.stringify(x); } catch { return String(x); }
  }).join(' '));
  console.log = cap; console.error = cap; console.warn = cap; console.info = cap;
  try { await fn(); } finally { Object.assign(console, orig); }
  return lineas.join('\n');
}

function assertSinCentinelas(salida, nombre) {
  for (const [clave, valor] of Object.entries(S)) {
    for (const forma of disfraces(valor)) {
      assert.ok(!salida.includes(forma),
        `${nombre}: el centinela ${clave} aparece en los logs como "${forma.slice(0, 24)}…"\n--- salida ---\n${salida}`);
    }
  }
}

// ══════════════════════════════════════════════════════════
// 1 · El saneador no deja pasar ningún centinela
// ══════════════════════════════════════════════════════════
test('sanitizeEvent redacta cualquier centinela bajo una clave PERMITIDA', () => {
  // El caso peligroso: la clave es válida, el valor es un identificador.
  for (const [clave, valor] of Object.entries(S)) {
    for (const campo of ['stage', 'outcome', 'reason', 'mode', 'error_code', 'sport']) {
      const out = sanitizeEvent({ [campo]: valor });
      assert.equal(out[campo], 'redactado',
        `${campo} = centinela ${clave} deberia redactarse, salio "${out[campo]}"`);
    }
  }
});

test('sanitizeEvent redacta tambien los sustitutos derivados de un centinela', () => {
  // Esta es la prueba que impide "anonimizar" con un hash: ni el hash completo
  // ni sus prefijos cortos pueden salir. Un prefijo de 8 hex ya es estable y
  // correlacionable, asi que sigue siendo un identificador.
  for (const valor of Object.values(S)) {
    for (const forma of derivados(valor)) {
      const out = sanitizeEvent({ reason: forma });
      assert.equal(out.reason, 'redactado',
        `un sustituto derivado ("${forma.slice(0, 24)}…") no puede salir tal cual`);
    }
  }
});

test('el trace_id legitimo sobrevive pero cualquier otro hex no', () => {
  // trace_id son 12 hex: justo la forma que el saneador prohibe en el resto de
  // campos. Tiene validacion propia, y nada mas pasa por ella.
  const t = newTraceId();
  assert.equal(sanitizeEvent({ trace_id: t }).trace_id, t);
  assert.equal(sanitizeEvent({ trace_id: S.userId }).trace_id, 'redactado');
  assert.equal(sanitizeEvent({ trace_id: createHash('sha256').update(S.userId).digest('hex') }).trace_id, 'redactado');
});

test('los tipos de deporte de Strava NO se redactan por error', () => {
  // Control negativo del saneador: si redactara todo, no filtraria nada pero
  // tampoco serviria para nada.
  for (const d of ['Run', 'TrailRun', 'VirtualRide', 'HighIntensityIntervalTraining', 'WeightTraining']) {
    assert.equal(sanitizeEvent({ sport: d }).sport, d, `${d} no deberia redactarse`);
  }
  assert.equal(sanitizeEvent({ reason: 'no_active_plan' }).reason, 'no_active_plan');
  assert.equal(sanitizeEvent({ error_code: '23505' }).error_code, '23505');
});

test('sanitizeEvent descarta cualquier clave fuera de la allowlist', () => {
  const out = sanitizeEvent({
    stage: 'ok', user_id: S.userId, run_id: S.runId, email: S.email,
    payload: { todo: S.token }, message: 'algo', stack: 'algo',
  });
  assert.deepEqual(Object.keys(out), ['stage']);
});

test('todas las claves emitidas pertenecen a la allowlist', () => {
  const out = sanitizeEvent({
    stage: 'a', outcome: 'b', mode: 'dry', reason: 'c', candidate_count: 2,
    duration_ms: 12, trace_id: 'abc123', status: 404, sport: 'Run',
    error_kind: 'TypeError', error_code: '23505', count: 1,
  });
  for (const k of Object.keys(out)) assert.ok(ALLOWED_LOG_FIELDS.includes(k), `clave no permitida: ${k}`);
  assert.equal(Object.keys(out).length, 12);
});

test('los numeros pasan y los no finitos no', () => {
  assert.equal(sanitizeEvent({ duration_ms: 1234567 }).duration_ms, 1234567);
  assert.equal(sanitizeEvent({ count: NaN }).count, undefined);
  assert.equal(sanitizeEvent({ status: 404 }).status, 404);
});

// ══════════════════════════════════════════════════════════
// 2 · trace_id
// ══════════════════════════════════════════════════════════
test('el trace_id cambia entre invocaciones', () => {
  const vistos = new Set();
  for (let i = 0; i < 500; i += 1) vistos.add(newTraceId());
  assert.equal(vistos.size, 500, 'debe ser distinto en cada invocacion');
});

test('el trace_id no depende de ningun dato de usuario', () => {
  // Es una funcion sin argumentos: no puede derivar de nada.
  assert.equal(newTraceId.length, 0);
  const t = newTraceId();
  assert.match(t, /^[0-9a-f]{12}$/);
  for (const valor of Object.values(S)) {
    for (const forma of disfraces(valor)) assert.notEqual(t, forma);
  }
});

// ══════════════════════════════════════════════════════════
// 3 · Errores: ni mensaje, ni stack, ni payload
// ══════════════════════════════════════════════════════════
test('errorKind devuelve la clase, nunca el mensaje', () => {
  const e = new TypeError(`fallo con ${S.userId} y token ${S.token}`);
  assert.equal(errorKind(e), 'TypeError');
  assert.ok(!errorKind(e).includes(S.userId));
});

test('errorCode solo deja pasar codigos controlados', () => {
  assert.equal(errorCode({ code: '23505' }), '23505');
  assert.equal(errorCode({ code: S.userId }), 'redactado');
  assert.equal(errorCode({}), undefined);
});

test('un error con centinelas en mensaje y stack no filtra nada', async () => {
  const e = new Error(`duplicate key (strava_activity_id)=(${S.activityId}) user ${S.userId}`);
  e.stack = `Error: ${S.email}\n    at ${S.token}`;
  const salida = await capturar(async () => {
    logError('[x]', { stage: 'processing', outcome: 'exception', error_kind: errorKind(e), error_code: errorCode(e) });
  });
  assertSinCentinelas(salida, 'logError con error contaminado');
  assert.ok(salida.includes('"error_kind":"Error"'));
});

// ══════════════════════════════════════════════════════════
// 4 · El camino real: el orquestador con datos centinela
// ══════════════════════════════════════════════════════════
function sbQueRevienta() {
  return {
    from(t) {
      if (t === 'strava_linking_config') {
        const q = { select: () => q, eq: () => q, limit: () => q,
          then: (r) => Promise.resolve({ data: [{ enabled: true, dry_run: true, allowlist: [] }], error: null }).then(r) };
        return q;
      }
      // Un error cuyo mensaje arrastra centinelas, como los de Postgres.
      const err = new Error(`duplicate key (user_id)=(${S.userId}) run ${S.runId} mail ${S.email}`);
      err.code = '23505';
      throw err;
    },
    rpc() { throw new Error(S.token); },
  };
}

test('el orquestador no filtra centinelas al capturar una excepcion', async () => {
  const run = {
    id: S.runId, user_id: S.userId, deporte: 'running', fecha: '2026-08-20',
    distancia_km: 10, duracion_segundos: 3000, hora_inicio: '2026-08-20T07:00:00.000Z',
    titulo: `Carrera de ${S.email}`, polyline_encoded: S.token,
  };
  let resultado;
  const salida = await capturar(async () => {
    resultado = await vincularActividadConPlan(sbQueRevienta(), run, { traceId: 'aabbccddeeff' });
  });
  assert.equal(resultado.resultado, 'excepcion', 'el contrato de salida no cambia');
  assertSinCentinelas(salida, 'orquestador');
  assert.ok(salida.includes('"stage":"linking"'));
  assert.ok(salida.includes('"error_kind":"Error"'));
});

// ══════════════════════════════════════════════════════════
// 5 · Contrato estatico del camino completo
// ══════════════════════════════════════════════════════════
test('no queda ningun console.* directo en el webhook ni en el orquestador', () => {
  // Todo pasa por el modulo con allowlist. Un console.log suelto seria una
  // puerta trasera sin saneado.
  assert.equal((WEBHOOK.match(/console\./g) || []).length, 0);
  assert.equal((LINKER.match(/console\./g) || []).length, 0);
});

test('el matcher y el modulo de auditoria siguen sin escribir logs', () => {
  const sinComentarios = (s) => s.split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
  assert.equal((sinComentarios(MATCHER).match(/console\./g) || []).length, 0);
  assert.equal((sinComentarios(AUDIT).match(/console\./g) || []).length, 0);
});

test('ninguna llamada de log del webhook pasa un identificador', () => {
  const llamadas = WEBHOOK.match(/log(?:Event|Error)\([^;]*?\);/gs) || [];
  assert.ok(llamadas.length >= 12, `esperaba al menos 12 llamadas, hay ${llamadas.length}`);
  const PROHIBIDO = /(conn\.user_id|inserted\.id|\bownerId\b|\bactivityId\b|\.message|push_token|\.email|row\.distancia_km)/;
  for (const c of llamadas) {
    assert.ok(!PROHIBIDO.test(c), `una llamada de log pasa un identificador:\n${c}`);
  }
});

test('el webhook no imprime message ni stack en ningun sitio', () => {
  assert.ok(!/log(Event|Error)\([^;]*\.message/s.test(WEBHOOK));
  assert.ok(!/log(Event|Error)\([^;]*\.stack/s.test(WEBHOOK));
  assert.ok(!/log(Event|Error)\([^;]*\.stack/s.test(LINKER));
});

test('el trace_id se genera en el handler y se propaga', () => {
  assert.match(WEBHOOK, /const traceId = newTraceId\(\);/);
  assert.match(WEBHOOK, /processActivityEvent\(supabase, event\.owner_id, event\.object_id, traceId\)/);
});

test('autocomprobacion: el defecto original SERIA detectado', () => {
  // Control del propio control. Se reconstruye la linea culpable y se exige
  // que la regla de arriba la marque; sin esto, una asercion mal escrita
  // pasaria en verde sin proteger nada.
  const defectuoso = "logEvent(LOG, { stage: 'run_insert', id: inserted.id, user: conn.user_id });";
  const PROHIBIDO = /(conn\.user_id|inserted\.id|\bownerId\b|\bactivityId\b|\.message|push_token|\.email|row\.distancia_km)/;
  assert.ok(PROHIBIDO.test(defectuoso), 'la regla no detecta el defecto que motivo la ronda');
});
