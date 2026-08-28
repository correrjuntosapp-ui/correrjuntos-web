// ============================================================
// F146.4 · Pruebas de la observabilidad durable de F134
//
// Alcance: se prueba el ORQUESTADOR instrumentado y el módulo de auditoría
// contra un doble fiel de supabase-js, más el contrato estático de la
// migración. NO se toca ninguna base de datos remota.
//
// Lo que estas pruebas NO demuestran, y conviene no confundir:
//   · Que la migración aplique limpiamente en Postgres 17.6 — eso se
//     verifica al aplicarla, en el paso 2 del paquete de despliegue.
//   · Que RLS se comporte en runtime — aquí se comprueba que la migración
//     LO PIDE, leyendo su texto; no que Postgres lo haya hecho.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  vincularActividadConPlan, modoParaUsuario, motivoDeExclusion,
} from '../../api/_lib/strava-plan-linker.js';
import {
  MATCHER_VERSION, MATCHER_SHA256_PREFIX, REASON, ALLOWED_FIELDS,
  buildAuditRow, evaluationKey, describeComparison, reasonFromMatch,
  importLagMinutes,
} from '../../api/_lib/strava-linking-audit.js';
import { emparejar, TOLERANCIA } from '../../api/_lib/strava-plan-matcher.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const MIGRATION = readFileSync(
  join(ROOT, 'supabase/migrations/20260828120000_f146_4_strava_linking_audit.sql'), 'utf8');
const ROLLBACK = readFileSync(
  join(ROOT, 'supabase/migrations/20260828120000_f146_4_strava_linking_audit_rollback.sql'), 'utf8');

/**
 * Sentencias reales, sin comentarios. Sin esto las aserciones estaticas leen
 * la prosa del fichero: la primera version de este test daba por violado el
 * append-only porque la palabra "grants" aparecia en un comentario sobre por
 * que NO se concede DELETE.
 */
const sinComentarios = (sql) => sql.split('\n')
  .map((l) => l.replace(/--.*$/, ''))
  .join('\n');
const MIGRATION_SQL = sinComentarios(MIGRATION);
const ROLLBACK_SQL = sinComentarios(ROLLBACK);

const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const RUN = U(1), USER = U(2), PLAN = U(3), WORKOUT = U(4), OTHER_USER = U(9);

const baseRun = (over = {}) => ({
  id: RUN, user_id: USER, deporte: 'running', fecha: '2026-08-20',
  distancia_km: 10, duracion_segundos: 3000, hora_inicio: '2026-08-20T07:00:00.000Z',
  // Campos con PII que la fila de `runs` SÍ lleva y que jamás deben viajar:
  titulo: 'Carrera matutina por el Paseo', polyline_encoded: 'abcdef',
  lat_inicio: 37.2611, lng_inicio: -6.9447,
  ...over,
});

const workout = (over = {}) => ({
  id: WORKOUT, plan_id: PLAN, estado: 'pending', fecha: '2026-08-20',
  tipo: 'easy_run', actividad_id: null,
  distancia_target_km: 10, duracion_target_min: null, ...over,
});

// ── Doble de supabase-js ──────────────────────────────────
// Reproduce la forma de encadenado que usa el orquestador:
//   .from(t).select(c).eq(k,v).limit(n)        → thenable
//   .from(t).select(c).eq().eq().eq().is()     → thenable
//   .from(t).insert(row)                        → thenable
//   .rpc(name, args)                            → thenable
function makeSb(opts = {}) {
  const state = {
    audit: [],            // filas aceptadas en strava_linking_audit
    keys: new Set(),      // UNIQUE(evaluation_key)
    rpcCalls: [],
    auditAttempts: 0,
  };
  const results = {
    strava_linking_config: opts.config ?? {
      data: [{ enabled: true, dry_run: true, allowlist: [] }], error: null },
    user_plans: opts.plans ?? {
      data: [{ id: PLAN, user_id: USER, estado: 'active' }], error: null },
    user_workouts: opts.workouts ?? { data: [workout()], error: null },
  };

  function chain(table) {
    // `user_workouts` se consulta dos veces: candidatas (termina en .is) y
    // "ya vinculada" (termina en .limit). Se distinguen por el encadenado.
    let sawIs = false;
    const q = {
      select() { return q; },
      eq() { return q; },
      is() { sawIs = true; return q; },
      limit() { return q; },
      insert(row) {
        if (table !== 'strava_linking_audit') return Promise.resolve({ data: null, error: null });
        state.auditAttempts += 1;
        if (opts.auditFails) {
          return Promise.resolve({ data: null, error: { code: opts.auditFailCode || '42501' } });
        }
        if (state.keys.has(row.evaluation_key)) {
          return Promise.resolve({ data: null, error: { code: '23505' } });
        }
        state.keys.add(row.evaluation_key);
        state.audit.push(row);
        return Promise.resolve({ data: null, error: null });
      },
      then(res, rej) {
        let out;
        if (table === 'user_workouts') {
          out = sawIs ? results.user_workouts : (opts.yaUsada ?? { data: [], error: null });
        } else {
          out = results[table] ?? { data: [], error: null };
        }
        return Promise.resolve(out).then(res, rej);
      },
    };
    return q;
  }

  return {
    state,
    from: (table) => chain(table),
    rpc: (name, args) => {
      state.rpcCalls.push({ name, args });
      return Promise.resolve(opts.rpcResult ?? { data: [{ escrito: true, motivo: 'completada' }], error: null });
    },
  };
}

const only = (sb) => { assert.equal(sb.state.audit.length, 1); return sb.state.audit[0]; };

// ══════════════════════════════════════════════════════════
// 1 · dry_run nunca vincula y registra would_link
// ══════════════════════════════════════════════════════════
test('dry-run: registra would_link y NO llama a la RPC', async () => {
  const sb = makeSb();
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.modo, 'dry');
  assert.equal(r.resultado, 'matched_dry_run');
  assert.equal(r.escrito, false);
  assert.equal(sb.state.rpcCalls.length, 0, 'dry-run jamas puede llamar a la RPC');
  const a = only(sb);
  assert.equal(a.mode, 'dry');
  assert.equal(a.decision, 'would_link');
  assert.equal(a.reason, REASON.WOULD_LINK);
  assert.equal(a.workout_id, WORKOUT);
  assert.equal(a.matching_basis, 'distance');
  assert.equal(a.ratio, 1);
});

// ══════════════════════════════════════════════════════════
// 2 · allowlist en modo live vincula UNA sola vez
// ══════════════════════════════════════════════════════════
test('live: vincula una vez y deja reserva + desenlace', async () => {
  const sb = makeSb({ config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null } });
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.modo, 'on');
  assert.equal(r.resultado, 'completada');
  assert.equal(r.escrito, true);
  assert.equal(sb.state.rpcCalls.length, 1, 'exactamente una escritura');
  assert.deepEqual(sb.state.rpcCalls[0].args,
    { p_user_id: USER, p_run_id: RUN, p_workout_id: WORKOUT });
  assert.equal(sb.state.audit.length, 2, 'reserva + desenlace');
  assert.deepEqual(sb.state.audit.map((x) => x.decision), ['would_link', 'linked']);
  assert.ok(sb.state.audit.every((x) => x.mode === 'live'));
});

// ══════════════════════════════════════════════════════════
// 3 · usuario fuera de allowlist
// ══════════════════════════════════════════════════════════
test('allowlist vacia en dry: TODOS entran en dry', () => {
  const cfg = { ok: true, enabled: true, dryRun: true, allowlist: [] };
  assert.equal(modoParaUsuario(cfg, USER), 'dry');
  assert.equal(modoParaUsuario(cfg, OTHER_USER), 'dry');
});

test('live con allowlist: el de fuera queda off y se anota not_in_allowlist', async () => {
  const sb = makeSb({ config: { data: [{ enabled: true, dry_run: false, allowlist: [OTHER_USER] }], error: null } });
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.modo, 'off');
  assert.equal(r.resultado, 'desactivado');
  assert.equal(sb.state.rpcCalls.length, 0);
  const a = only(sb);
  assert.equal(a.mode, 'disabled');
  assert.equal(a.decision, 'skipped');
  assert.equal(a.reason, REASON.NOT_IN_ALLOWLIST);
});

test('allowlist vacia con dry_run=false significa APAGADO, no "todo el mundo"', () => {
  const cfg = { ok: true, enabled: true, dryRun: false, allowlist: [] };
  assert.equal(modoParaUsuario(cfg, USER), 'off');
});

// ══════════════════════════════════════════════════════════
// 4 · el reintento no duplica auditoría ni vínculo
// ══════════════════════════════════════════════════════════
test('reintento en dry: misma clave, una sola fila', async () => {
  const sb = makeSb();
  await vincularActividadConPlan(sb, baseRun(), { nowIso: '2026-08-20T08:00:00.000Z' });
  await vincularActividadConPlan(sb, baseRun(), { nowIso: '2026-08-20T08:05:00.000Z' });
  assert.equal(sb.state.auditAttempts, 2, 'se intenta las dos veces');
  assert.equal(sb.state.audit.length, 1, 'pero solo una fila persiste');
});

test('la clave de una misma evaluacion es estable entre invocaciones', () => {
  // Aserción directa sobre la propiedad, sin depender de que dos llamadas
  // caigan en instantes distintos: la clave no puede llevar reloj, contador
  // ni azar. La prueba de arriba comprueba el efecto; esta, la causa.
  const args = { runId: RUN, matcherVersion: MATCHER_VERSION, mode: 'dry',
    decision: 'would_link', reason: REASON.WOULD_LINK, workoutId: WORKOUT };
  const claves = new Set();
  for (let i = 0; i < 50; i += 1) claves.add(evaluationKey({ ...args }));
  assert.equal(claves.size, 1, 'la clave tiene que ser una funcion pura de sus argumentos');
  assert.equal([...claves][0], `${RUN}|${MATCHER_VERSION}|dry|would_link|would_link|${WORKOUT}`);
});

test('reintento en live: la RPC re-verifica y el segundo pase no vincula', async () => {
  // Segundo pase: la actividad ya vinculada → el matcher devuelve
  // already_linked y ni siquiera se llega a la RPC.
  const sb = makeSb({
    config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null },
    yaUsada: { data: [{ id: WORKOUT }], error: null },
  });
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.resultado, 'already_linked');
  assert.equal(sb.state.rpcCalls.length, 0, 'no se re-escribe una actividad ya usada');
  assert.equal(only(sb).reason, REASON.ALREADY_LINKED);
});

test('primero dry y despues live producen DOS filas distintas', async () => {
  const dry = makeSb();
  await vincularActividadConPlan(dry, baseRun());
  const live = makeSb({ config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null } });
  await vincularActividadConPlan(live, baseRun());
  assert.notEqual(dry.state.audit[0].evaluation_key, live.state.audit[0].evaluation_key,
    'el cambio de modo tiene que quedar visible, no colapsado');
});

// ══════════════════════════════════════════════════════════
// 5 · TODOS los early returns quedan registrados
// ══════════════════════════════════════════════════════════
const earlyReturns = [
  ['canario apagado', { config: { data: [{ enabled: false, dry_run: true, allowlist: [] }], error: null } },
    'desactivado', REASON.DISABLED],
  ['config ausente', { config: { data: [], error: null } }, 'desactivado', REASON.CONFIG_MISSING],
  ['config ilegible', { config: { data: null, error: { code: '42P01' } } }, 'desactivado', REASON.CONFIG_QUERY_FAILED],
  ['allowlist demasiado grande', { config: { data: [{ enabled: true, dry_run: true, allowlist: [U(5), U(6), U(7)] }], error: null } },
    'desactivado', REASON.ALLOWLIST_TOO_BIG],
  ['allowlist invalida', { config: { data: [{ enabled: true, dry_run: true, allowlist: ['a@b.com'] }], error: null } },
    'desactivado', REASON.ALLOWLIST_INVALID],
  ['error consultando planes', { plans: { data: null, error: { code: '42501' } } },
    'error_consulta', REASON.QUERY_FAILED],
  ['sin plan activo', { plans: { data: [], error: null } }, 'no_match', REASON.NO_ACTIVE_PLAN],
  ['varios planes activos', { plans: { data: [{ id: PLAN, user_id: USER, estado: 'active' }, { id: U(8), user_id: USER, estado: 'active' }], error: null } },
    'no_match', REASON.MULTIPLE_ACTIVE_PLANS],
  ['error consultando sesiones', { workouts: { data: null, error: { code: '42501' } } },
    'error_consulta', REASON.QUERY_FAILED],
  ['sin sesion libre ese dia', { workouts: { data: [], error: null } }, 'no_match', REASON.NO_FREE_SESSION],
  ['fuera de margen por distancia', { workouts: { data: [workout({ distancia_target_km: 3 })], error: null } },
    'distance_mismatch', REASON.DISTANCE_MISMATCH],
  ['fuera de margen por duracion', { workouts: { data: [workout({ distancia_target_km: null, duracion_target_min: 20 })], error: null } },
    'distance_mismatch', REASON.DURATION_MISMATCH],
  ['sesion sin objetivo', { workouts: { data: [workout({ distancia_target_km: null, duracion_target_min: null })], error: null } },
    'distance_mismatch', REASON.NO_TARGET],
  ['ya vinculada', { yaUsada: { data: [{ id: WORKOUT }], error: null } }, 'already_linked', REASON.ALREADY_LINKED],
];

for (const [nombre, opts, resultadoEsperado, motivoEsperado] of earlyReturns) {
  test(`early return registrado — ${nombre}`, async () => {
    const sb = makeSb(opts);
    const r = await vincularActividadConPlan(sb, baseRun());
    assert.equal(r.resultado, resultadoEsperado, 'el desenlace no cambia');
    assert.equal(r.escrito, false);
    assert.equal(sb.state.rpcCalls.length, 0);
    assert.equal(sb.state.audit.length, 1, 'exactamente una fila de auditoria');
    assert.equal(sb.state.audit[0].reason, motivoEsperado);
  });
}

test('deporte incompatible queda registrado', async () => {
  const sb = makeSb({ workouts: { data: [workout({ tipo: 'easy_run' })], error: null } });
  const r = await vincularActividadConPlan(sb, baseRun({ deporte: 'walking' }));
  assert.equal(r.resultado, 'unsupported_sport');
  assert.equal(only(sb).reason, REASON.UNSUPPORTED_SPORT);
});

test('actividad sin magnitudes queda registrada como invalid_activity', async () => {
  const sb = makeSb();
  const r = await vincularActividadConPlan(sb, baseRun({ distancia_km: 0, duracion_segundos: 0 }));
  assert.equal(r.resultado, 'invalid_activity');
  assert.equal(only(sb).reason, REASON.INVALID_ACTIVITY);
});

test('la RPC que no escribe queda registrada como no_changes', async () => {
  const sb = makeSb({
    config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null },
    rpcResult: { data: [{ escrito: false, motivo: 'sin_cambios' }], error: null },
  });
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.resultado, 'sin_cambios');
  assert.equal(r.escrito, false);
  assert.deepEqual(sb.state.audit.map((x) => x.reason), [REASON.WOULD_LINK, REASON.NO_CHANGES]);
});

test('el fallo de la RPC queda registrado como write_failed', async () => {
  const sb = makeSb({
    config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null },
    rpcResult: { data: null, error: { message: 'boom' } },
  });
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.resultado, 'error_escritura');
  const last = sb.state.audit.at(-1);
  assert.equal(last.decision, 'error');
  assert.equal(last.reason, REASON.WRITE_FAILED);
  assert.equal(last.error_stage, 'rpc');
});

// ══════════════════════════════════════════════════════════
// 6 · un fallo de auditoría BLOQUEA la escritura live
// ══════════════════════════════════════════════════════════
test('live: si la auditoria falla NO se vincula', async () => {
  const sb = makeSb({
    config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null },
    auditFails: true,
  });
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.resultado, 'auditoria_no_disponible');
  assert.equal(r.escrito, false);
  assert.equal(sb.state.rpcCalls.length, 0,
    'sin registro no puede haber vinculo: fail closed');
});

test('dry: si la auditoria falla el camino legacy sigue intacto', async () => {
  const sb = makeSb({ auditFails: true });
  const r = await vincularActividadConPlan(sb, baseRun());
  assert.equal(r.resultado, 'matched_dry_run', 'el desenlace legacy no se altera');
  assert.equal(r.escrito, false);
});

test('cliente roto desde el principio: lo absorbe leerConfig, sin lanzar', async () => {
  // `leerConfig` tiene su propio try/catch, asi que un cliente que revienta
  // al leer la configuracion NO llega al catch exterior: sale por la puerta
  // del canario. Es el comportamiento correcto y preexistente.
  const roto = { from() { throw new Error('down'); }, rpc() { throw new Error('down'); } };
  const r = await vincularActividadConPlan(roto, baseRun());
  assert.equal(r.resultado, 'desactivado');
  assert.equal(r.motivo, 'config_exception');
  assert.equal(r.escrito, false);
});

test('cliente que revienta DESPUES de la config sale por el catch exterior', async () => {
  // Aqui si se ejercita el catch de `vincularActividadConPlan`: la config se
  // lee bien y es la consulta de planes la que lanza.
  let n = 0;
  const roto = {
    from(t) {
      if (t === 'strava_linking_config') {
        const q = { select: () => q, eq: () => q, limit: () => q,
          then: (res) => Promise.resolve({ data: [{ enabled: true, dry_run: true, allowlist: [] }], error: null }).then(res) };
        return q;
      }
      n += 1;
      throw new Error('down');
    },
    rpc() { throw new Error('down'); },
  };
  const r = await vincularActividadConPlan(roto, baseRun());
  assert.equal(r.resultado, 'excepcion');
  assert.equal(r.escrito, false);
  assert.ok(n > 0, 'se llego a intentar la consulta que lanza');
});

// ══════════════════════════════════════════════════════════
// 7 · cero PII
// ══════════════════════════════════════════════════════════
const PII_FIELDS = ['titulo', 'polyline_encoded', 'lat_inicio', 'lng_inicio', 'lat_fin',
  'lng_fin', 'email', 'nombre', 'apellidos', 'access_token', 'refresh_token', 'splits'];

test('ninguna fila de auditoria contiene campos con PII', async () => {
  for (const opts of [{}, { config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null } },
    { plans: { data: [], error: null } }, { workouts: { data: [], error: null } }]) {
    const sb = makeSb(opts);
    await vincularActividadConPlan(sb, baseRun());
    for (const fila of sb.state.audit) {
      for (const k of Object.keys(fila)) {
        assert.ok(ALLOWED_FIELDS.includes(k), `columna no declarada: ${k}`);
        assert.ok(!PII_FIELDS.includes(k), `PII filtrada: ${k}`);
      }
      const texto = JSON.stringify(fila);
      assert.ok(!texto.includes('Paseo'), 'el titulo de la actividad se ha colado');
      assert.ok(!texto.includes('37.26') && !texto.includes('-6.94'), 'coordenadas filtradas');
      assert.ok(!texto.includes('abcdef'), 'polyline filtrada');
    }
  }
});

test('buildAuditRow descarta cualquier campo no declarado', () => {
  const row = buildAuditRow({
    runId: RUN, userId: USER, workoutId: WORKOUT, mode: 'dry',
    decision: 'would_link', reason: REASON.WOULD_LINK,
    titulo: 'Carrera matutina', lat_inicio: 37.26, polyline_encoded: 'abc',
  });
  assert.ok(row);
  assert.deepEqual(Object.keys(row).filter((k) => !ALLOWED_FIELDS.includes(k)), []);
  assert.equal(row.titulo, undefined);
  assert.equal(row.lat_inicio, undefined);
});

test('la migracion no declara ninguna columna con PII', () => {
  for (const campo of ['titulo', 'polyline', 'lat_', 'lng_', 'email', 'nombre', 'token', 'ruta ']) {
    assert.ok(!MIGRATION.toLowerCase().includes(`\n  ${campo}`),
      `la migracion declara una columna con PII: ${campo}`);
  }
});

// ══════════════════════════════════════════════════════════
// 8 · RLS y grants correctos (contrato estático de la migración)
// ══════════════════════════════════════════════════════════
test('la migracion habilita RLS y FORCE RLS', () => {
  assert.match(MIGRATION_SQL, /ALTER TABLE public\.strava_linking_audit ENABLE ROW LEVEL SECURITY/);
  assert.match(MIGRATION_SQL, /ALTER TABLE public\.strava_linking_audit FORCE ROW LEVEL SECURITY/);
});

test('la migracion revoca a PUBLIC, anon y authenticated', () => {
  assert.match(MIGRATION_SQL, /REVOKE ALL ON public\.strava_linking_audit FROM PUBLIC/);
  assert.match(MIGRATION_SQL, /REVOKE ALL ON public\.strava_linking_audit FROM anon/);
  assert.match(MIGRATION_SQL, /REVOKE ALL ON public\.strava_linking_audit FROM authenticated/);
});

test('solo service_role recibe grants, y solo INSERT y SELECT', () => {
  const grants = MIGRATION_SQL.match(/GRANT[^;]+;/g) || [];
  assert.equal(grants.length, 1, 'un unico GRANT');
  assert.match(grants[0], /GRANT INSERT, SELECT ON public\.strava_linking_audit TO service_role/);
  assert.ok(!/GRANT[^;]*\b(UPDATE|DELETE|TRUNCATE)\b[^;]*strava_linking_audit/i.test(MIGRATION_SQL),
    'append-only: nunca UPDATE, DELETE ni TRUNCATE');
  assert.ok(!/GRANT[^;]*strava_linking_audit[^;]*TO[^;]*\b(anon|authenticated|PUBLIC)\b/i.test(MIGRATION_SQL),
    'anon y authenticated no reciben nada');
});

test('no se crea ninguna politica RLS ni se expone RPC al cliente', () => {
  assert.ok(!/CREATE POLICY/i.test(MIGRATION_SQL), 'sin politicas: el acceso es solo service_role');
  assert.ok(!/SECURITY DEFINER/i.test(MIGRATION_SQL), 'esta migracion no crea funciones');
});

// ── F146.4A · la migracion no puede tocar objetos ajenos ──
// Contexto: la primera version terminaba con
//   REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
// que alcanzaba a las 20 secuencias del esquema. En produccion habria
// retirado el USAGE del que dependen 18 tablas con `serial` donde la app
// inserta desde el cliente (run_points, maria_chat_messages, el modulo de
// Fuerza, workout_feedback...). Cada INSERT habria fallado con
// "permission denied for sequence".

/**
 * Devuelve las violaciones de alcance de un SQL ya libre de comentarios.
 *
 * Son DOS reglas complementarias, y hacen falta las dos: la sentencia
 * culpable nombra el esquema a secas (`IN SCHEMA public`), no un objeto
 * cualificado, asi que la regla de objetos ajenos por si sola NO la ve. La
 * autocomprobacion de mas abajo es justamente lo que destapo ese hueco.
 */
function violacionesDeAlcance(sql) {
  const v = [];
  // Codigos estables, no el regex serializado: una asercion que compare
  // contra `${patron}` compara contra "/ALL\\s+SEQUENCES/i", donde \s es un
  // backslash literal y no un espacio. Eso ya me costo un falso rojo.
  const GLOBALES = [
    ['ALL SEQUENCES', /ALL\s+SEQUENCES/i],
    ['ALL TABLES', /ALL\s+TABLES/i],
    ['ALL FUNCTIONS', /ALL\s+FUNCTIONS/i],
    ['IN SCHEMA', /IN\s+SCHEMA/i],
  ];
  for (const [codigo, patron] of GLOBALES) {
    if (patron.test(sql)) v.push(`alcance_global:${codigo}`);
  }
  const objetos = [...new Set((sql.match(/public\.[a-z_]+/gi) || []).map((o) => o.toLowerCase()))];
  for (const o of objetos) {
    if (o !== 'public.strava_linking_audit') v.push(`objeto_ajeno:${o}`);
  }
  return v;
}

test('la migracion no tiene violaciones de alcance', () => {
  // Se evalua sobre SENTENCIAS, no sobre prosa: el fichero explica en un
  // comentario por que NO se hace esto, y un grep crudo daria falso positivo.
  assert.deepEqual(violacionesDeAlcance(MIGRATION_SQL), []);
});

test('el rollback no tiene violaciones de alcance', () => {
  assert.deepEqual(violacionesDeAlcance(ROLLBACK_SQL), []);
});

test('autocomprobacion: el caso defectuoso EXACTO se detecta', () => {
  // Control del propio control. Sin esto, una asercion mal escrita pasaria en
  // verde sin proteger nada.
  const defectuoso = MIGRATION_SQL.replace('COMMIT;',
    'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;\nCOMMIT;');
  const v = violacionesDeAlcance(defectuoso);
  assert.ok(v.length > 0, 'el guard no detecta la sentencia que rompio la ronda anterior');
  assert.ok(v.includes('alcance_global:ALL SEQUENCES'),
    `detectado, pero por el motivo equivocado: ${v.join(' · ')}`);
});

test('autocomprobacion: tambien se detecta un objeto ajeno cualificado', () => {
  const defectuoso = MIGRATION_SQL.replace('COMMIT;',
    'REVOKE ALL ON public.run_points FROM anon;\nCOMMIT;');
  assert.ok(violacionesDeAlcance(defectuoso).includes('objeto_ajeno:public.run_points'));
});

test('solo los tres indices autorizados', () => {
  const idx = MIGRATION_SQL.match(/CREATE INDEX[^;]+;/g) || [];
  assert.equal(idx.length, 3);
  assert.ok(idx.some((s) => s.includes('evaluated_at')));
  assert.ok(idx.some((s) => s.includes('decision, reason')));
  assert.ok(idx.some((s) => s.includes('(run_id)')));
});

test('la retencion esta documentada a 90 dias', () => {
  assert.match(MIGRATION, /90 days/);
});

test('el rollback preserva los datos y deja el DROP comentado', () => {
  assert.match(ROLLBACK_SQL, /REVOKE INSERT ON public\.strava_linking_audit FROM service_role/);
  const dropActivo = /DROP TABLE/i.test(ROLLBACK_SQL);
  assert.equal(dropActivo, false, 'el DROP no puede estar activo');
});

test('el enum de motivos del codigo y el CHECK de la migracion coinciden', () => {
  const bloque = MIGRATION_SQL.match(/reason IN \(([\s\S]*?)\)\)/);
  assert.ok(bloque, 'no se encuentra el CHECK de reason');
  const enSql = new Set([...bloque[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]));
  const enJs = new Set(Object.values(REASON));
  assert.deepEqual([...enJs].filter((r) => !enSql.has(r)), [], 'motivos en JS que el CHECK rechazaria');
  assert.deepEqual([...enSql].filter((r) => !enJs.has(r)), [], 'motivos en SQL que el codigo no usa');
});

// ══════════════════════════════════════════════════════════
// 9 · el ±30 % permanece idéntico
// ══════════════════════════════════════════════════════════
test('la tolerancia sigue siendo exactamente 0,30', () => {
  assert.equal(TOLERANCIA, 0.30);
});

test('los bordes del margen no se mueven', () => {
  const evalua = (dr, dt) => emparejar({
    actividad: { runId: RUN, userId: USER, deporte: 'running', distanciaKm: dr,
      duracionMin: 50, fechaLocal: '2026-08-20', yaVinculada: false },
    plan: { id: PLAN, userId: USER, estado: 'active' },
    candidatas: [workout({ distancia_target_km: dt })],
  }).resultado;
  assert.equal(evalua(7.0, 10), 'matched', '0,70x entra');
  assert.equal(evalua(13.0, 10), 'matched', '1,30x entra');
  assert.equal(evalua(6.99, 10), 'distance_mismatch', '0,699x queda fuera');
  assert.equal(evalua(13.01, 10), 'distance_mismatch', '1,301x queda fuera');
});

// ══════════════════════════════════════════════════════════
// 10 · el matcher es byte-idéntico al desplegado
// ══════════════════════════════════════════════════════════
test('contract-guard: el matcher no ha cambiado sin bumpear MATCHER_VERSION', () => {
  const sha = createHash('sha256')
    .update(readFileSync(join(ROOT, 'api/_lib/strava-plan-matcher.js')))
    .digest('hex').slice(0, 16);
  assert.equal(sha, MATCHER_SHA256_PREFIX,
    `El matcher cambio. Si es deliberado, sube MATCHER_VERSION (hoy ${MATCHER_VERSION}) ` +
    `y actualiza MATCHER_SHA256_PREFIX a ${sha}. Si no lo es, revierte el cambio.`);
});

// ══════════════════════════════════════════════════════════
// Contrato del módulo de auditoría
// ══════════════════════════════════════════════════════════
test('buildAuditRow rechaza filas que el CHECK rechazaria', () => {
  const ok = { runId: RUN, userId: USER, mode: 'dry', decision: 'skipped', reason: REASON.DISABLED };
  assert.ok(buildAuditRow(ok));
  assert.equal(buildAuditRow({ ...ok, runId: 'no-uuid' }), null);
  assert.equal(buildAuditRow({ ...ok, mode: 'produccion' }), null);
  assert.equal(buildAuditRow({ ...ok, decision: 'quiza' }), null);
  assert.equal(buildAuditRow({ ...ok, reason: 'porque_si' }), null);
  assert.equal(buildAuditRow({ ...ok, decision: 'error' }), null, 'error exige error_stage');
  assert.equal(buildAuditRow({ ...ok, errorStage: 'x' }), null, 'solo el error declara etapa');
  assert.equal(buildAuditRow({ ...ok, decision: 'linked' }), null, 'linked exige workout_id');
});

test('evaluationKey separa modo, decision, motivo y sesion', () => {
  const b = { runId: RUN, matcherVersion: 'f134.1', mode: 'dry', decision: 'would_link',
    reason: 'would_link', workoutId: WORKOUT };
  assert.equal(evaluationKey(b), evaluationKey({ ...b }));
  assert.notEqual(evaluationKey(b), evaluationKey({ ...b, mode: 'live' }));
  assert.notEqual(evaluationKey(b), evaluationKey({ ...b, workoutId: U(7) }));
  assert.notEqual(evaluationKey(b), evaluationKey({ ...b, matcherVersion: 'f134.2' }));
});

test('describeComparison solo describe cuando hay UNA candidata', () => {
  const act = { distanciaKm: 10, duracionMin: 50 };
  assert.equal(describeComparison(act, []).matchingBasis, 'none');
  assert.equal(describeComparison(act, [workout(), workout()]).matchingBasis, 'none');
  const d = describeComparison(act, [workout({ distancia_target_km: 8 })]);
  assert.equal(d.matchingBasis, 'distance');
  assert.equal(d.ratio, 1.25);
  const u = describeComparison(act, [workout({ distancia_target_km: null, duracion_target_min: 40 })]);
  assert.equal(u.matchingBasis, 'duration');
  assert.equal(u.ratio, 1.25);
});

test('reasonFromMatch afina sin cambiar la decision del matcher', () => {
  assert.equal(reasonFromMatch('no_match', []), REASON.NO_FREE_SESSION);
  assert.equal(reasonFromMatch('no_match', [workout()]), REASON.NO_ACTIVE_PLAN);
  assert.equal(reasonFromMatch('distance_mismatch', [workout()]), REASON.DISTANCE_MISMATCH);
  assert.equal(reasonFromMatch('distance_mismatch',
    [workout({ distancia_target_km: null, duracion_target_min: 30 })]), REASON.DURATION_MISMATCH);
  assert.equal(reasonFromMatch('distance_mismatch',
    [workout({ distancia_target_km: null, duracion_target_min: null })]), REASON.NO_TARGET);
});

test('importLagMinutes distingue fresca de catch-up', () => {
  assert.equal(importLagMinutes('2026-08-20T07:00:00Z', '2026-08-20T08:03:00Z'), 63);
  assert.equal(importLagMinutes(null, '2026-08-20T08:00:00Z'), null);
  assert.ok(importLagMinutes('2026-07-01T07:00:00Z', '2026-08-20T08:00:00Z') > 48 * 60);
});

test('motivoDeExclusion separa apagado de fuera-de-lista', () => {
  assert.equal(motivoDeExclusion({ ok: true, enabled: false, allowlist: [] }, USER), REASON.DISABLED);
  assert.equal(motivoDeExclusion({ ok: true, enabled: true, allowlist: [OTHER_USER] }, USER),
    REASON.NOT_IN_ALLOWLIST);
  assert.equal(motivoDeExclusion({ ok: false, motivo: 'config_missing' }, USER), REASON.CONFIG_MISSING);
});
