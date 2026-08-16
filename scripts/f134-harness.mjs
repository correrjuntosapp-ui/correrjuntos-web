#!/usr/bin/env node
/* F134 — harness permanente. Determinista, sin red, sin BD. */
import { emparejar, encaja, MATCH, TOLERANCIA } from '../api/_lib/strava-plan-matcher.js';
import { vincularActividadConPlan, leerConfig, modoParaUsuario, MAX_ALLOWLIST } from '../api/_lib/strava-plan-linker.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const R = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else fails.push(m); };

const PLAN = { id: 'plan-1', userId: 'u-1', estado: 'active' };
const HOY = '2026-08-15';

const sesion = (over = {}) => ({
  id: 'w-1', plan_id: 'plan-1', estado: 'pending', fecha: HOY, tipo: 'easy_run',
  actividad_id: null, distancia_target_km: 10, duracion_target_min: 50, ...over,
});
const act = (over = {}) => ({
  runId: 'run-1', userId: 'u-1', deporte: 'running', distanciaKm: 10, duracionMin: 50,
  fechaLocal: HOY, yaVinculada: false, ...over,
});
const ev = (a = {}, ws = [sesion()]) => emparejar({ actividad: act(a), plan: PLAN, candidatas: ws });

// ── 1 · Coincidencia única válida ───────────────────────────
{
  const r = ev();
  ok(r.resultado === MATCH.MATCHED, 'coincidencia unica valida');
  ok(r.workoutId === 'w-1', 'devuelve la sesion correcta');
  ok(r.criterio === 'distancia', 'criterio distancia cuando hay objetivo de distancia');
}

// ── 2 · Cero candidatos / dos candidatos ────────────────────
ok(ev({}, []).resultado === MATCH.NO_MATCH, 'cero sesiones → no_match');
{
  const dos = [sesion({ id: 'w-1' }), sesion({ id: 'w-2' })];
  const r = ev({}, dos);
  ok(r.resultado === MATCH.AMBIGUOUS, 'dos candidatas validas → ambiguous');
  ok(r.workoutId === null, 'ambiguous NO devuelve sesion');
}

// ── 3 · Sesión ya completada / ya vinculada ─────────────────
ok(ev({}, [sesion({ estado: 'completed' })]).resultado === MATCH.NO_MATCH, 'sesion completed nunca se toca');
ok(ev({}, [sesion({ estado: 'skipped' })]).resultado === MATCH.NO_MATCH, 'sesion skipped nunca se toca');
ok(ev({}, [sesion({ actividad_id: 'otra-run' })]).resultado === MATCH.NO_MATCH, 'sesion con actividad ya asociada');
ok(ev({ yaVinculada: true }).resultado === MATCH.ALREADY_LINKED, 'actividad ya usada no se reutiliza');

// ── 4 · Fecha local ─────────────────────────────────────────
ok(ev({ fechaLocal: '2026-08-14' }).resultado === MATCH.DATE_MISMATCH, 'dia distinto → date_mismatch');
ok(ev({ fechaLocal: '2026-08-16' }).resultado === MATCH.DATE_MISMATCH, 'dia siguiente → date_mismatch');
// España 00:30 → start_date_local dice día 15 aunque en UTC sea el 14
ok(ev({ fechaLocal: HOY }).resultado === MATCH.MATCHED, 'Espana 00:30 (local=15, UTC=14) empareja con el 15');
// México 23:30 → local día 15, UTC ya es 16
ok(ev({ fechaLocal: HOY }, [sesion({ fecha: HOY })]).resultado === MATCH.MATCHED, 'Mexico 23:30 (local=15, UTC=16) empareja con el 15');
// Webhook retrasado: la decisión no depende de cuándo llega
ok(ev({ fechaLocal: '2026-08-10' }, [sesion({ fecha: '2026-08-10' })]).resultado === MATCH.MATCHED,
  'webhook retrasado 5 dias sigue emparejando su dia real');
ok(!/toISOString|Date\.now|new Date\(\)/.test(readFileSync(join(R, 'api/_lib/strava-plan-matcher.js'), 'utf8')),
  'el matcher NO usa el reloj: imposible que dependa del dia del servidor');

// ── 5 · Distancia dentro/fuera del margen ───────────────────
ok(ev({ distanciaKm: 10 * (1 + TOLERANCIA) - 0.01 }).resultado === MATCH.MATCHED, 'justo dentro del margen alto');
ok(ev({ distanciaKm: 10 * (1 - TOLERANCIA) + 0.01 }).resultado === MATCH.MATCHED, 'justo dentro del margen bajo');
ok(ev({ distanciaKm: 14 }).resultado === MATCH.DISTANCE_MISMATCH, '+40 % fuera del margen');
ok(ev({ distanciaKm: 5 }).resultado === MATCH.DISTANCE_MISMATCH, '-50 % fuera del margen');
ok(ev({ distanciaKm: 0, duracionMin: 0 }).resultado === MATCH.INVALID_ACTIVITY, 'actividad sin magnitudes');
ok(ev({ distanciaKm: null, duracionMin: null }).resultado === MATCH.INVALID_ACTIVITY, 'magnitudes nulas');
ok(ev({ distanciaKm: NaN, duracionMin: NaN }).resultado === MATCH.INVALID_ACTIVITY, 'magnitudes NaN');
ok(ev({ distanciaKm: -5, duracionMin: -1 }).resultado === MATCH.INVALID_ACTIVITY, 'magnitudes negativas');

// ── 6 · Sesión SIN distancia objetivo → se usa duración ─────
{
  const wr = sesion({ tipo: 'walk_run', distancia_target_km: null, duracion_target_min: 25 });
  ok(ev({ duracionMin: 25 }, [wr]).criterio === 'duracion', 'walk_run empareja por duracion');
  ok(ev({ duracionMin: 25 }, [wr]).resultado === MATCH.MATCHED, 'walk_run se puede completar');
  ok(ev({ duracionMin: 60 }, [wr]).resultado === MATCH.DISTANCE_MISMATCH, 'duracion fuera de margen no empareja');
  // Sin NINGÚN objetivo → jamás
  const sinNada = sesion({ distancia_target_km: null, duracion_target_min: null });
  ok(ev({}, [sinNada]).resultado === MATCH.DISTANCE_MISMATCH, 'sesion sin objetivos NUNCA se completa');
  ok(encaja(act(), sinNada).criterio === 'sin_objetivo', 'criterio explicito sin_objetivo');
  ok(encaja(act(), sesion({ distancia_target_km: 0, duracion_target_min: 0 })).ok === false, 'objetivos a cero no valen');
}

// ── 7 · Deportes ────────────────────────────────────────────
ok(ev({ deporte: 'trail' }).resultado === MATCH.MATCHED, 'trail completa sesion de carrera');
ok(ev({ deporte: 'bici' }).resultado === MATCH.UNSUPPORTED_SPORT, 'bici NUNCA completa plan de carrera');
ok(ev({ deporte: 'swim' }).resultado === MATCH.UNSUPPORTED_SPORT, 'deporte desconocido → unsupported');
ok(ev({ deporte: '' }).resultado === MATCH.UNSUPPORTED_SPORT, 'deporte vacio → unsupported');
{
  const wr = [sesion({ tipo: 'walk_run', distancia_target_km: null, duracion_target_min: 25 })];
  ok(ev({ deporte: 'walking', duracionMin: 25 }, wr).resultado === MATCH.MATCHED, 'caminata completa walk_run');
  ok(ev({ deporte: 'walking' }).resultado === MATCH.UNSUPPORTED_SPORT, 'caminata NO completa easy_run');
}
ok(ev({}, [sesion({ tipo: 'rest' })]).resultado === MATCH.UNSUPPORTED_SPORT, 'dia de descanso NUNCA se completa corriendo');

// ── 8 · Plan ────────────────────────────────────────────────
ok(emparejar({ actividad: act(), plan: { ...PLAN, estado: 'paused' }, candidatas: [sesion()] }).resultado === MATCH.NO_MATCH, 'plan paused → no_match');
ok(emparejar({ actividad: act(), plan: { ...PLAN, estado: 'abandoned' }, candidatas: [sesion()] }).resultado === MATCH.NO_MATCH, 'plan abandoned → no_match');
ok(emparejar({ actividad: act(), plan: null, candidatas: [sesion()] }).resultado === MATCH.NO_MATCH, 'sin plan → no_match');
ok(emparejar({ actividad: act(), plan: { ...PLAN, userId: 'otro' }, candidatas: [sesion()] }).resultado === MATCH.NO_MATCH, 'plan de OTRO usuario → no_match');
ok(ev({}, [sesion({ plan_id: 'plan-ajeno' })]).resultado === MATCH.NO_MATCH, 'sesion de otro plan se ignora');

// ── 9 · Entradas basura ─────────────────────────────────────
ok(ev({ runId: null }).resultado === MATCH.INVALID_ACTIVITY, 'sin runId');
ok(ev({ userId: null }).resultado === MATCH.INVALID_ACTIVITY, 'sin userId');
ok(ev({ fechaLocal: 'ayer' }).resultado === MATCH.INVALID_ACTIVITY, 'fecha ilegible');
ok(ev({ fechaLocal: '2026-8-5' }).resultado === MATCH.INVALID_ACTIVITY, 'fecha mal formateada');
ok(emparejar({ actividad: act(), plan: PLAN, candidatas: null }).resultado === MATCH.NO_MATCH, 'candidatas null');
ok(emparejar({ actividad: null, plan: PLAN, candidatas: [] }).resultado === MATCH.INVALID_ACTIVITY, 'actividad null');
ok(emparejar({ actividad: act(), plan: PLAN, candidatas: [null, sesion()] }).resultado === MATCH.MATCHED, 'filas nulas se ignoran sin romper');

// ══ Orquestador (con BD simulada) ═══════════════════════════
function fakeSb({ planes = [{ id: 'plan-1', user_id: 'u-1', estado: 'active' }],
                  workouts = [sesion()], yaUsada = [], rpc = { escrito: true, motivo: 'completada' },
                  errEn = null } = {}) {
  const llamadas = { rpc: 0 };
  let vueltaWorkouts = 0;
  return {
    llamadas,
    from(tabla) {
      const api = {
        select() { return api; }, eq() { return api; }, is() { return api; },
        limit: async () => run(), then: (r) => run().then(r),
      };
      const run = async () => {
        if (errEn === tabla) return { data: null, error: { message: 'boom' } };
        if (tabla === 'user_plans') return { data: planes, error: null };
        if (tabla === 'user_workouts') {
          vueltaWorkouts++;
          return { data: vueltaWorkouts === 1 ? workouts : yaUsada, error: null };
        }
        return { data: [], error: null };
      };
      return api;
    },
    async rpc() { llamadas.rpc++; return rpc.error ? { data: null, error: rpc.error } : { data: [rpc], error: null }; },
  };
}
const RUN = { id: 'run-1', user_id: 'u-1', deporte: 'running', distancia_km: 10, duracion_segundos: 3000, fecha: HOY };

{
  const sb = fakeSb();
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'on' });
  ok(r.escrito === true && r.resultado === 'completada', 'orquestador escribe en el caso feliz');
  ok(sb.llamadas.rpc === 1, 'una sola llamada a la RPC');
}
{
  const sb = fakeSb();
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'dry' });
  ok(r.escrito === false && r.resultado === 'matched_dry_run', 'dry-run decide pero NO escribe');
  ok(sb.llamadas.rpc === 0, 'dry-run no llama a la RPC');
}
{
  const sb = fakeSb();
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'off' });
  ok(r.resultado === 'desactivado' && sb.llamadas.rpc === 0, 'kill switch apagado no hace nada');
}
{
  // La RPC dice "sin_cambios" → otra ejecución ganó la carrera. No es error.
  const sb = fakeSb({ rpc: { escrito: false, motivo: 'sin_cambios' } });
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'on' });
  ok(r.escrito === false && r.resultado === 'sin_cambios', 'perder la carrera concurrente no escribe ni falla');
}
{
  // Reintento del mismo webhook: la actividad ya figura vinculada
  const sb = fakeSb({ yaUsada: [{ id: 'w-9' }] });
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'on' });
  ok(r.resultado === MATCH.ALREADY_LINKED && sb.llamadas.rpc === 0, 'reintento del webhook no reescribe');
}
{
  // Los ids importan: el primero SÍ casa con las sesiones del fixture, así que
  // si el orquestador cogiera "el primero" la vinculación se escribiría.
  const sb = fakeSb({ planes: [{ id: 'plan-1', user_id: 'u-1', estado: 'active' }, { id: 'plan-2', user_id: 'u-1', estado: 'active' }] });
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'on' });
  ok(r.resultado === MATCH.NO_MATCH && sb.llamadas.rpc === 0, 'dos planes activos → fail closed');
}
{
  const sb = fakeSb({ errEn: 'user_plans' });
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'on' });
  ok(r.resultado === 'error_consulta' && r.escrito === false, 'fallo de consulta no escribe');
}
{
  const sb = fakeSb({ rpc: { error: { message: 'x' } } });
  const r = await vincularActividadConPlan(sb, RUN, { modo: 'on' });
  ok(r.resultado === 'error_escritura' && r.escrito === false, 'fallo de escritura se reporta, no lanza');
}
{
  // Un `sb` roto no puede tumbar el webhook
  const r = await vincularActividadConPlan({ from() { throw new Error('caido'); } }, RUN, { modo: 'on' });
  ok(r.resultado === 'excepcion' && r.escrito === false, 'excepcion interna NUNCA se propaga');
}
{
  const r = await vincularActividadConPlan(fakeSb(), { id: null }, { modo: 'on' });
  ok(r.resultado === MATCH.INVALID_ACTIVITY, 'run sin id → invalid');
}

// ══ Puertas del canario (F134.1) ════════════════════════════
const U1 = '11111111-2222-3333-4444-555555555555';
const U2 = '66666666-7777-8888-9999-aaaaaaaaaaaa';
const cfgSb = (row, error = null) => ({
  from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: row ? [row] : [], error }) }) }) }),
});

// — Lectura fail-closed —
{
  ok((await leerConfig(cfgSb(null))).motivo === 'config_missing', 'fila ausente → fail closed');
  ok((await leerConfig(cfgSb(null, { message: 'x' }))).motivo === 'config_query_failed', 'error de consulta → fail closed');
  ok((await leerConfig({ from() { throw new Error('x'); } })).motivo === 'config_exception', 'excepcion → fail closed');
  ok((await leerConfig(cfgSb({ enabled: true, dry_run: true, allowlist: [U1, U2, U1] }))).motivo === 'allowlist_too_big',
    `allowlist con mas de ${MAX_ALLOWLIST} → fail closed`);
  ok((await leerConfig(cfgSb({ enabled: true, dry_run: true, allowlist: ['abraham@correrjuntos.com'] }))).motivo === 'allowlist_invalid',
    'un CORREO en la allowlist → fail closed');
  ok((await leerConfig(cfgSb({ enabled: true, dry_run: true, allowlist: ['no-es-uuid'] }))).motivo === 'allowlist_invalid',
    'entrada que no es UUID → fail closed');
  const buena = await leerConfig(cfgSb({ enabled: true, dry_run: false, allowlist: [U1] }));
  ok(buena.ok === true && buena.enabled === true && buena.dryRun === false, 'config valida se lee bien');
  ok((await leerConfig(cfgSb({ enabled: true, dry_run: null, allowlist: [] }))).dryRun === true,
    'dry_run nulo → se mantiene el modo seguro');
}

// — Resolución del modo por usuario —
{
  const m = (c, u) => modoParaUsuario(c, u);
  ok(m({ ok: false, motivo: 'x' }, U1) === 'off', 'config invalida → off');
  ok(m({ ok: true, enabled: false, dryRun: true, allowlist: [] }, U1) === 'off', 'enabled=false → off');
  ok(m({ ok: true, enabled: true, dryRun: true, allowlist: [] }, U1) === 'dry', 'dry-run global con allowlist vacia');
  ok(m({ ok: true, enabled: true, dryRun: true, allowlist: [U1] }, U1) === 'dry', 'dry-run dentro de la allowlist');
  ok(m({ ok: true, enabled: true, dryRun: true, allowlist: [U1] }, U2) === 'off', 'dry-run con allowlist: fuera → off');
  ok(m({ ok: true, enabled: true, dryRun: false, allowlist: [U1] }, U1) === 'on', 'canario real dentro de la allowlist');
  ok(m({ ok: true, enabled: true, dryRun: false, allowlist: [U1] }, U2) === 'off', 'canario real: fuera → off');
  // LA regla de seguridad: escribir en global exige allowlist explícita.
  ok(m({ ok: true, enabled: true, dryRun: false, allowlist: [] }, U1) === 'off',
    'allowlist VACIA + dry_run=false NO activa globalmente');
  ok(m({ ok: true, enabled: true, dryRun: false, allowlist: [] }, U2) === 'off',
    'allowlist vacia + escritura: NADIE entra');
  ok(m(null, U1) === 'off' && m(undefined, U1) === 'off', 'config nula → off');
  ok(m({ ok: true, enabled: true, dryRun: false, allowlist: [U1] }, null) === 'off', 'sin usuario → off');
}

// — Integración: el orquestador lee la config si no le dan modo —
{
  const sbOff = { ...fakeSb(), from: (t) => (t === 'strava_linking_config'
    ? { select: () => ({ eq: () => ({ limit: async () => ({ data: [], error: null }) }) }) }
    : fakeSb().from(t)) };
  const r = await vincularActividadConPlan(sbOff, RUN);
  ok(r.modo === 'off' && r.resultado === 'desactivado' && r.motivo === 'config_missing',
    'sin config desplegada → apagado, con motivo');
}

// ── Contrato del webhook: cero mensajes nuevos, orden correcto ──
{
  const wh = readFileSync(join(R, 'api/strava-webhook.js'), 'utf8');
  const iVinculo = wh.indexOf('vincularActividadConPlan(sb');
  const iJose = wh.indexOf('handleJosePostWorkout(sb');
  const iAna = wh.indexOf('maria_chat_messages');
  ok(iVinculo > 0 && iJose > 0 && iVinculo < iJose, 'la vinculacion corre ANTES de Jose');
  ok(iVinculo < iAna, 'la vinculacion corre ANTES de Ana');
  ok((wh.match(/sendExpoPush\(/g) || []).length === 2, 'sigue habiendo UNA definicion y UNA llamada de push');
  ok((wh.match(/maria_chat_messages/g) || []).length === 2, 'Ana no gana inserciones nuevas');
  ok(!/f134[\s\S]{0,200}(sendExpoPush|insert\()/i.test(wh.slice(iVinculo, iJose)), 'el bloque F134 no manda mensajes ni inserta');
}

// ── El SQL nace inaplicado ──────────────────────────────────
{
  const sql = readFileSync(join(R, 'sql/134-strava-plan-linking-preview.sql'), 'utf8');
  ok(/ROLLBACK;/.test(sql) && !/^\s*COMMIT;/m.test(sql), 'la migracion termina en ROLLBACK');
  ok(/CREATE UNIQUE INDEX ux_user_workouts_actividad_unica/.test(sql), 'crea el indice unico');
  ok(/enabled\s+boolean\s+NOT NULL DEFAULT false/.test(sql), 'la config nace con enabled=false');
  ok(/dry_run\s+boolean\s+NOT NULL DEFAULT true/.test(sql), 'la config nace con dry_run=true');
  ok(/allowlist\s+uuid\[\]\s+NOT NULL DEFAULT '\{\}'/.test(sql), 'la allowlist nace vacia');
  ok(/array_length\(allowlist, 1\) <= 2/.test(sql), 'la BD limita la allowlist a 2');
  ok(/VALUES \(1, false, true, '\{\}'::uuid\[\]\)/.test(sql), 'la fila sembrada nace inofensiva');
  ok(/uuid\[\]/.test(sql) && !/allowlist\s+text/.test(sql), 'la allowlist es uuid[]: un correo ni siquiera entra en la tabla');
  const grantsCfg = (sql.match(/GRANT [^;]*strava_linking_config[^;]*;/g) || []).join(' ');
  ok(/TO service_role\s*;/.test(grantsCfg), 'service_role puede leer la config');
  ok(!/\b(anon|authenticated|PUBLIC)\b/.test(grantsCfg), 'NINGUN cliente puede leer la config del canario');
  ok(/SET search_path = public, pg_temp/.test(sql), 'la RPC fija search_path');
  const grants = (sql.match(/GRANT EXECUTE[^;]*;/g) || []).join(' ');
  ok(/TO service_role\s*;/.test(grants), 'service_role puede ejecutar la RPC');
  ok(!/\b(authenticated|anon|PUBLIC)\b/.test(grants), 'NINGUN cliente puede ejecutar la RPC');
  ok(/w\.estado\s*=\s*'pending'/.test(sql), 'guard: solo sesiones pending');
  ok(/w\.actividad_id IS NULL/.test(sql), 'guard: solo sesiones sin actividad');
  ok(/w\.fecha\s*=\s*r\.fecha/.test(sql), 'guard: misma fecha local');
  ok(/up\.estado\s*=\s*'active'/.test(sql), 'guard: solo plan activo');
  // `completed_at` = fin REAL de la actividad. Un webhook puede llegar horas
  // tarde; con now() se corrompería la métrica de primer entrenamiento.
  const asignaciones = sql.match(/completed_at\s*=\s*[^,\n]+/g) || [];
  ok(asignaciones.length === 1, 'completed_at se asigna una sola vez');
  ok(/=\s*v_fin/.test(asignaciones[0] || ''), 'completed_at usa el fin real de la actividad');
  ok(!/now\(\)/.test(asignaciones[0] || ''), 'completed_at NUNCA usa now()');
}

console.log(`F134 harness: ${pass} PASS · ${fails.length} FAIL`);
if (fails.length) { fails.forEach((f) => console.log('  FAIL ' + f)); process.exit(1); }
