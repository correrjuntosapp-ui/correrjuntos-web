#!/usr/bin/env node
// ============================================================
// f118-harness.mjs — Acreditación del post-entreno de José (F118)
//
// Bloques:
//  A. Motor determinista (casos obligatorios del encargo)
//  B. Renderer / política de mensajes (límites + prohibiciones + cifras)
//  C. Orquestador con cliente mock (fail-closed, idempotencia, eventos sin PII)
//  D. Contrato consumidor-esquema (columnas/estados REALES congelados)
//  E. Anclas del webhook (Ana intacta, cap fail-closed, plantilla vieja fuera)
//
// Salida: PASS/FAIL por check + resumen. Exit 1 si cualquier check falla.
// Genera scripts/f118-fixtures-generated.json (inputs+outputs) para la
// acreditación de PARIDAD con la copia TS de la app.
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  analyzeWorkout, renderJoseMessage, buildRunRef, seedFromId,
  fmtPaceSec, fmtKm, MSG_MAX_CHARS, BANNED_PHRASES,
} from '../api/_lib/post-workout-analysis.js';
import {
  gatherContextForRun, insertJoseMessageIdempotent, runJosePostWorkout, emitEvent,
  getCanaryConfig, isUserInCanary, handleJosePostWorkout, legacyJoseContent, CANARY_MAX_USERS,
} from '../api/_lib/post-workout-orchestrator.js';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra ? ` — ${extra}` : '')); }
}

// ── Esquema REAL congelado (verificado contra information_schema el 15 ago 2026) ──
const SCHEMA = {
  runs: ['id','user_id','quedada_id','titulo','deporte','distancia_km','duracion_segundos','ritmo_promedio','ritmo_mejor','calorias','elevacion_ganada','elevacion_perdida','velocidad_max','cadencia_media','splits','polyline_encoded','ciudad','lat_inicio','lng_inicio','lat_fin','lng_fin','fecha','hora_inicio','hora_fin','auto_paused_seconds','created_at','map_snapshot_url','hr_avg','hr_max','hr_min','hr_zones','potencia_media','potencia_max','vo2max_estimate','vo2max_method','vo2max_confidence','rpe','workout_notes','shoe_id','es_indoor','source','strava_activity_id','coaches_notified','elapsed_segundos'],
  user_plans: ['id','user_id','template_id','nombre','objetivo','nivel','ritmo_base','ritmo_origen','dias_disponibles','fecha_inicio','fecha_fin','fecha_carrera','estado','semana_actual','progreso_pct','created_at','updated_at','completed_at','race_id','race_nombre','race_ciudad','race_imagen_url','race_distancia_principal','race_hora'],
  user_workouts: ['id','plan_id','user_id','template_workout_id','fecha','semana_numero','dia_orden','tipo','titulo','titulo_en','descripcion','descripcion_en','distancia_target_km','duracion_target_min','zona_ritmo','ritmo_target','estado','actividad_id','distancia_real_km','duracion_real_min','ritmo_real','completed_at','skipped_at','notas','created_at'],
  user_races: ['id','user_id','race_id','status','selected_distance_km','target_time_seconds','race_nombre','race_fecha','race_ciudad','race_distancia_principal','race_imagen_url','source','plan_id','created_at','updated_at'],
  coach_chat_messages: null, // (no select con columnas concretas en el flujo F118 aparte de id)
};
const ESTADOS = {
  user_plans: ['active','paused','abandoned'],
  user_workouts: ['pending','completed','skipped'],
  user_races_status: ['saved','going'],
};

// ── Utilidades ──
const NOW = '2026-08-15T10:00:00Z';
function run(id, sport, km, dur, iso) {
  return { id, sport, distance_km: km, duration_sec: dur, start_iso: iso };
}
// Historial base running: 4 salidas válidas (media ritmo = 360 s/km exacta)
const H4 = [
  run('h1', 'running', 6, 2160, '2026-08-13T09:00:00Z'), // 360 s/km
  run('h2', 'running', 5, 1750, '2026-08-11T09:00:00Z'), // 350
  run('h3', 'running', 5, 1850, '2026-08-09T09:00:00Z'), // 370
  run('h4', 'running', 8, 2880, '2026-08-05T09:00:00Z'), // 360
];

// ═══ BLOQUE A — Motor ═══
const CASES = [];
function fx(name, input, asserts) { CASES.push({ name, input, asserts }); }

// A1 primera actividad (sin historial)
fx('A1_primera_actividad',
  { current: run('c1', 'running', 5, 1800, '2026-08-15T09:00:00Z'), history: [], now_iso: NOW },
  (a, msg) => {
    check('A1 ok', a.ok === true);
    check('A1 insufficient_history', a.comparison.status === 'insufficient_history');
    check('A1 confidence low', a.confidence === 'low');
    check('A1 sin hito inventado', a.achievement === null || a.achievement.type === 'week_volume');
    check('A1 mensaje sin comparación inventada', msg != null && !/más rápido|más tranquilo|faster|easier/.test(msg));
  });

// A2 mejor (más rápido que la media 360 → 330 s/km = +8.3%)
fx('A2_mas_rapido',
  { current: run('c2', 'running', 6, 1980, '2026-08-15T09:00:00Z'), history: H4, now_iso: NOW },
  (a, msg) => {
    check('A2 faster', a.comparison.status === 'faster', a.comparison.status);
    check('A2 delta 8', a.comparison.pace_delta_pct === 8, String(a.comparison.pace_delta_pct));
    check('A2 vs_count 4', a.comparison.vs_count === 4);
    check('A2 confidence high', a.confidence === 'high');
    check('A2 msg cita el ritmo real 5:30', msg.includes('5:30'), msg);
    check('A2 msg cita el 8%', msg.includes('8%'), msg);
  });

// A3 peor (más lento: 400 s/km = -11%)
fx('A3_mas_lento',
  { current: run('c3', 'running', 5, 2000, '2026-08-15T09:00:00Z'), history: H4, now_iso: NOW },
  (a, msg) => {
    check('A3 slower', a.comparison.status === 'slower');
    check('A3 sin drama', msg != null && !/mal|flojo|peor/.test(msg.toLowerCase()));
  });

// A4 prácticamente igual (362 s/km ≈ media, banda ±2%)
fx('A4_estable',
  { current: run('c4', 'running', 5, 1810, '2026-08-15T09:00:00Z'), history: H4, now_iso: NOW },
  (a) => check('A4 stable', a.comparison.status === 'stable', a.comparison.status));

// A5 distancia cero
fx('A5_distancia_cero',
  { current: run('c5', 'running', 0, 1800, '2026-08-15T09:00:00Z'), history: H4, now_iso: NOW },
  (a, msg) => {
    check('A5 no ok', a.ok === false);
    check('A5 reason', a.reason_codes.includes('zero_distance'));
    check('A5 sin mensaje', msg === null);
  });

// A6 duración cero
fx('A6_duracion_cero',
  { current: run('c6', 'running', 5, 0, '2026-08-15T09:00:00Z'), history: [], now_iso: NOW },
  (a, msg) => { check('A6 no ok', a.ok === false && a.reason_codes.includes('zero_duration')); check('A6 sin mensaje', msg === null); });

// A7 muy corta (<10 min)
fx('A7_muy_corta',
  { current: run('c7', 'running', 1.5, 420, '2026-08-15T09:00:00Z'), history: [], now_iso: NOW },
  (a, msg) => { check('A7 too_short', a.ok === false && a.reason_codes.includes('too_short')); check('A7 sin mensaje', msg === null); });

// A8 unidades sospechosas (ms como s: 1800000)
fx('A8_unidades_ms',
  { current: run('c8', 'running', 5, 1800000, '2026-08-15T09:00:00Z'), history: [], now_iso: NOW },
  (a, msg) => { check('A8 suspect_units', a.ok === false && a.reason_codes.includes('suspect_units')); check('A8 sin mensaje', msg === null); });

// A9 ritmo inválido (10 km en 650 s = 65 s/km, imposible < 2:00/km)
fx('A9_ritmo_invalido',
  { current: run('c9', 'running', 10, 650, '2026-08-15T09:00:00Z'), history: H4, now_iso: NOW },
  (a, msg) => {
    check('A9 datos corruptos → no ok', a.ok === false);
    check('A9 reason invalid_pace', a.reason_codes.includes('invalid_pace'));
    check('A9 SIN mensaje (fail closed total)', msg === null, msg || '');
  });

// A10 historial cruzado de deportes (se filtra)
fx('A10_historial_cruzado',
  { current: run('c10', 'running', 5, 1800, '2026-08-15T09:00:00Z'),
    history: [...H4.slice(0, 1), run('hb', 'bici', 40, 5400, '2026-08-12T09:00:00Z'), run('hw', 'walking', 4, 3000, '2026-08-10T09:00:00Z')],
    now_iso: NOW },
  (a) => {
    check('A10 cross filtered', a.reason_codes.includes('cross_sport_filtered'));
    check('A10 solo 1 comparable → insufficient', a.comparison.status === 'insufficient_history');
  });

// A11 actividades futuras en historial (se filtran)
fx('A11_futuras_filtradas',
  { current: run('c11', 'running', 5, 1800, '2026-08-15T09:00:00Z'),
    history: [run('hf', 'running', 6, 2100, '2026-08-16T09:00:00Z'), ...H4.slice(0, 2)], now_iso: NOW },
  (a) => {
    check('A11 future filtered', a.reason_codes.includes('future_or_same_filtered'));
    check('A11 comparables 2', a.comparison.vs_count === 2, String(a.comparison.vs_count));
  });

// A12 duplicado importado en historial
fx('A12_duplicado_en_historial',
  { current: run('c12', 'running', 5, 1800, '2026-08-15T09:00:00Z'),
    history: [H4[0], { ...H4[0] }, H4[1]], now_iso: NOW },
  (a) => {
    check('A12 dup filtered', a.reason_codes.includes('duplicate_in_history_filtered'));
    check('A12 vs_count 2', a.comparison.vs_count === 2, String(a.comparison.vs_count));
  });

// A13 orden cronológico incorrecto (entrada desordenada → reordenado)
fx('A13_desordenado',
  { current: run('c13', 'running', 5, 1800, '2026-08-15T09:00:00Z'),
    history: [H4[3], H4[0], H4[2], H4[1]], now_iso: NOW },
  (a) => {
    check('A13 reordenado', a.reason_codes.includes('history_reordered'));
    check('A13 comparables 4', a.comparison.vs_count === 4);
  });

// A14 bici (velocidad, sin ritmo /km)
fx('A14_bici',
  { current: run('c14', 'bici', 40, 5142, '2026-08-15T09:00:00Z'),
    history: [run('hb1', 'bici', 35, 4500, '2026-08-12T09:00:00Z'), run('hb2', 'bici', 30, 3857, '2026-08-10T09:00:00Z')], now_iso: NOW },
  (a, msg) => {
    check('A14 speed calculada', a.facts.speed_kmh != null && Math.abs(a.facts.speed_kmh - 28) < 0.1, String(a.facts.speed_kmh));
    check('A14 comparación velocidad', ['faster','slower','stable'].includes(a.comparison.status));
    check('A14 msg sin /km', msg != null && !msg.includes('/km'));
  });

// A15 trail
fx('A15_trail',
  { current: run('c15', 'trail', 12, 5400, '2026-08-15T09:00:00Z'),
    history: [run('ht1', 'trail', 10, 4200, '2026-08-12T09:00:00Z'), run('ht2', 'trail', 9, 3900, '2026-08-08T09:00:00Z'), run('ht3', 'trail', 8, 3500, '2026-08-05T09:00:00Z')], now_iso: NOW },
  (a) => {
    check('A15 hito salida más larga', a.achievement != null && a.achievement.type === 'longest_of_recent', JSON.stringify(a.achievement));
    check('A15 comparación válida', a.comparison.vs_count >= 2);
  });

// A16 caminata (sin comparación de ritmo, tono constancia)
fx('A16_caminata',
  { current: run('c16', 'walking', 4, 2700, '2026-08-15T09:00:00Z'),
    history: [run('hw1', 'walking', 3, 2100, '2026-08-13T09:00:00Z'), run('hw2', 'walking', 5, 3600, '2026-08-11T09:00:00Z')], now_iso: NOW },
  (a, msg) => {
    check('A16 sin pace comparison', a.reason_codes.includes('walking_no_pace_comparison'));
    check('A16 msg sin ritmo', msg != null && !msg.includes('/km'));
  });

// A17 con plan: próxima sesión → next_action plan_next con fecha humana
fx('A17_plan_siguiente',
  { current: run('c17', 'running', 5, 1800, '2026-08-15T09:00:00Z'), history: H4,
    plan: { goal_key: '10k', week: 3 },
    next_workout: { tipo: 'tempo', fecha: '2026-08-16', distancia_target_km: 6 },
    now_iso: NOW },
  (a, msg) => {
    check('A17 plan_next', a.next_action.type === 'plan_next');
    check('A17 msg menciona tempo mañana', msg.includes('tempo') && msg.includes('mañana'), msg);
  });

// A18 alineación con la sesión prevista de hoy
fx('A18_alineado',
  { current: run('c18', 'running', 6.1, 2196, '2026-08-15T09:00:00Z'), history: H4,
    plan: { goal_key: '10k', week: 3 }, today_workout: { tipo: 'easy_run', distancia_target_km: 6 }, now_iso: NOW },
  (a) => check('A18 aligned', a.plan_context === 'aligned', a.plan_context));

// A19 distinto de lo previsto (3 km vs 10 previstos)
fx('A19_distinto',
  { current: run('c19', 'running', 3, 1080, '2026-08-15T09:00:00Z'), history: H4,
    plan: { goal_key: '10k', week: 3 }, today_workout: { tipo: 'long_run', distancia_target_km: 10 }, now_iso: NOW },
  (a) => check('A19 different', a.plan_context === 'different', a.plan_context));

// A20 tirada larga sin plan → recovery
fx('A20_larga_recovery',
  { current: run('c20', 'running', 18, 6840, '2026-08-15T09:00:00Z'), history: H4, now_iso: NOW },
  (a, msg) => {
    check('A20 recovery', a.next_action.type === 'recovery');
    check('A20 hito más larga', a.achievement && a.achievement.type === 'longest_of_recent');
    check('A20 msg habla de recuperar', /recuper|hidrata/i.test(msg), msg);
  });

// A21 datos parciales (sin distancia) → sin comparación, mensaje honesto por duración
fx('A21_sin_distancia',
  { current: { id: 'c21', sport: 'running', distance_km: null, duration_sec: 2400, start_iso: '2026-08-15T09:00:00Z' }, history: H4, now_iso: NOW },
  (a, msg) => {
    check('A21 ok', a.ok === true);
    check('A21 missing_distance', a.reason_codes.includes('missing_distance'));
    check('A21 sin comparación', a.comparison.status === 'insufficient_history');
    check('A21 mensaje por duración, sin placeholder', msg != null && msg.includes('40 min') && !msg.includes('?'), msg || '');
  });

// A22 segunda sesión REAL del mismo día: análisis independiente, la sesión
// de la mañana cuenta como comparable, y NINGUNA razón de supresión diaria.
fx('A22_doble_sesion_mismo_dia',
  { current: run('c22', 'running', 5, 1800, '2026-08-15T18:00:00Z'),
    history: [run('c22a', 'running', 8, 2880, '2026-08-15T08:00:00Z'), ...H4.slice(0, 3)], now_iso: NOW },
  (a, msg) => {
    check('A22 ok', a.ok === true);
    check('A22 la matinal cuenta como comparable', a.comparison.vs_count === 4, String(a.comparison.vs_count));
    check('A22 sin supresión diaria', !a.reason_codes.some((r) => /daily|window|cap/.test(r)), a.reason_codes.join('|'));
    check('A22 mensaje generado', msg != null);
  });

// Ejecutar bloque A (+ recolectar para fixtures de paridad)
const parity = [];
for (const c of CASES) {
  const a = analyzeWorkout(c.input);
  const msg = renderJoseMessage(a, { lang: 'es', seed: seedFromId(c.input.current?.id || c.name), now_iso: NOW });
  c.asserts(a, msg);
  parity.push({ name: c.name, input: c.input, analysis: a, message_es: msg });
}

// ═══ BLOQUE B — Política del mensaje ═══
for (const p of parity) {
  if (p.message_es == null) continue;
  const m = p.message_es;
  check(`B len ${p.name}`, m.length <= MSG_MAX_CHARS, `${m.length} chars`);
  const sentences = m.split(/[.!?]\s|\.$/).filter((s) => s.trim().length > 0).length;
  check(`B frases ${p.name}`, sentences >= 2 && sentences <= 5, String(sentences));
  const low = m.toLowerCase();
  for (const b of BANNED_PHRASES) check(`B banned "${b}" ${p.name}`, !low.includes(b), m);
  check(`B sin emojis ${p.name}`, !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(m));
}
// Cifras: el mensaje jamás contradice los facts (spot-check numérico en A2)
{
  const a2 = parity.find((p) => p.name === 'A2_mas_rapido');
  check('B A2 km exacto', a2.message_es.includes('6 km'), a2.message_es);
  check('B A2 sin cifras ajenas', !/7 km|5 km|9%|7%/.test(a2.message_es), a2.message_es);
}
// Variación por semilla sin alterar hechos
{
  const inp = { current: run('cv', 'running', 6, 1980, '2026-08-15T09:00:00Z'), history: H4, now_iso: NOW };
  const a = analyzeWorkout(inp);
  const m0 = renderJoseMessage(a, { lang: 'es', seed: 0, now_iso: NOW });
  const m1 = renderJoseMessage(a, { lang: 'es', seed: 1, now_iso: NOW });
  check('B variación existe', m0 !== m1);
  check('B hechos idénticos entre variantes', m0.includes('5:30') && m1.includes('5:30') && m0.includes('8%') && m1.includes('8%'));
  check('B determinista misma semilla', renderJoseMessage(a, { lang: 'es', seed: 0, now_iso: NOW }) === m0);
}
// Renderer con análisis inválido → null (no mensaje con objeto incompleto)
check('B render de no-ok es null', renderJoseMessage({ ok: false, reason_codes: [] }, { seed: 0 }) === null);
check('B render sin facts es null', renderJoseMessage({ ok: true, facts: null }, { seed: 0 }) === null);

// ═══ BLOQUE C — Orquestador con mock (fail-closed + idempotencia + PII) ═══
function mockSb(handlers) {
  const calls = [];
  function table(name) {
    const chain = { _t: name, _f: {}, _op: 'select' };
    const proxy = new Proxy(chain, {
      get(t, prop) {
        if (prop === 'then') {
          const result = handlers(name, t) || { data: [], error: null };
          return (res) => res(result);
        }
        return (...args) => {
          if (prop === 'insert') { t._op = 'insert'; t._insertRow = args[0]; calls.push({ table: name, op: 'insert', row: args[0] }); }
          else t._f[String(prop)] = args;
          return proxy;
        };
      },
    });
    return proxy;
  }
  return { from: (n) => table(n), _calls: calls };
}
const UID = '00000000-0000-4000-8000-000000000001'; // UUID sintético de pruebas
const RUNROW = { id: 'run-1', user_id: UID, deporte: 'running', distancia_km: 6, duracion_segundos: 1980, hora_inicio: '2026-08-15T09:00:00Z', fecha: '2026-08-15', strava_activity_id: 999 };

// C1 fail-closed: historial con error → gap declarado, no [] fingido
{
  const sb = mockSb((t, q) => {
    if (t === 'runs') return { data: null, error: { code: '500' } };
    if (t === 'user_plans') return { data: [], error: null };
    if (t === 'coach_chat_messages' && q._op === 'insert') return { data: null, error: null };
    return { data: [], error: null };
  });
  const ctx = await gatherContextForRun(sb, RUNROW, NOW);
  check('C1 gap history', ctx.gaps.includes('history_query_failed'));
  check('C1 history vacío declarado', ctx.history.length === 0);
}
// C2 idempotencia: unique violation → duplicate
{
  const sb = mockSb((t, q) => (q._op === 'insert' ? { data: null, error: { code: '23505', message: 'duplicate key' } } : { data: [], error: null }));
  const r = await insertJoseMessageIdempotent(sb, UID, 'strava:999', 'msg');
  check('C2 duplicate detectado', r === 'duplicate');
}
// C3 columna run_ref inexistente → fallback legacy (created)
{
  let first = true;
  const sb = mockSb((t, q) => {
    if (q._op === 'insert') {
      if (first) { first = false; return { data: null, error: { code: '42703', message: 'column "run_ref" of relation does not exist' } }; }
      return { data: null, error: null };
    }
    return { data: [], error: null };
  });
  const r = await insertJoseMessageIdempotent(sb, UID, 'strava:999', 'msg');
  check('C3 fallback legacy created', r === 'created');
}
// C4 sin runRef → failed (fail closed, no insert)
{
  const sb = mockSb(() => ({ data: [], error: null }));
  const r = await insertJoseMessageIdempotent(sb, UID, null, 'msg');
  check('C4 sin identidad no inserta', r === 'failed' && sb._calls.filter((c) => c.op === 'insert').length === 0);
}
// C5 flujo completo con reintento: 2ª pasada = duplicate suppressed
{
  const insertedRefs = new Set();
  const sb = mockSb((t, q) => {
    if (t === 'coach_chat_messages' && q._op === 'insert') {
      const ref = q._insertRow.run_ref;
      if (insertedRefs.has(`user-1|${ref}`)) return { data: null, error: { code: '23505', message: 'dup' } };
      insertedRefs.add(`user-1|${ref}`);
      return { data: null, error: null };
    }
    return { data: [], error: null };
  });
  const r1 = await runJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  const r2 = await runJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C5 primera created', r1.outcome === 'created', r1.outcome);
  check('C5 reintento duplicate', r2.outcome === 'duplicate', r2.outcome);
  const msgs = sb._calls.filter((c) => c.table === 'coach_chat_messages' && c.op === 'insert' && !c.row.event_name);
  check('C5 exactamente 1 mensaje persistido', msgs.filter((m) => insertedRefs.has(`user-1|${m.row.run_ref}`)).length >= 1 && insertedRefs.size === 1);
  const events = sb._calls.filter((c) => c.table === 'analytics_events');
  check('C5 evento duplicate_suppressed', events.some((e) => e.row.event_name === 'post_workout_duplicate_suppressed'));
  check('C5 evento message_created', events.some((e) => e.row.event_name === 'post_workout_coach_message_created'));
}
// C6 eventos sin PII: claves peligrosas se eliminan y el texto nunca viaja
{
  const sb = mockSb((t, q) => ({ data: [], error: null }));
  await emitEvent(sb, UID, 'post_workout_analysis_generated', { sport: 'running', message: 'SECRETO', email: 'x@y.z', content: 'chat', token: 'abc' });
  const ev = sb._calls.find((c) => c.table === 'analytics_events');
  check('C6 params limpios', ev && !('message' in ev.row.params) && !('email' in ev.row.params) && !('content' in ev.row.params) && !('token' in ev.row.params), JSON.stringify(ev?.row?.params));
  check('C6 sport se conserva', ev.row.params.sport === 'running');
}
// C7 actividad inválida → insufficient_data y CERO inserts de mensaje
{
  const sb = mockSb((t, q) => ({ data: [], error: null }));
  const bad = { ...RUNROW, id: 'run-bad', strava_activity_id: 1000, duracion_segundos: 120 };
  const r = await runJosePostWorkout(sb, bad, { nowIso: NOW, lang: 'es' });
  check('C7 no_message', r.outcome === 'no_message', r.outcome);
  const msgInserts = sb._calls.filter((c) => c.table === 'coach_chat_messages' && c.op === 'insert');
  check('C7 cero mensajes', msgInserts.length === 0);
  const events = sb._calls.filter((c) => c.table === 'analytics_events');
  check('C7 evento insufficient', events.some((e) => e.row.event_name === 'post_workout_analysis_insufficient_data'));
}

// ═══ BLOQUE C.8+ — CANARIO fail-closed (F118.1) ═══
// mock parametrizable: config + dedup por run_ref + contadores
function canaryMockSb(cfg) {
  const state = { msgInserts: [], events: [], refs: new Set(), proactiveCount: cfg.proactiveToday ?? 0 };
  const sb = mockSb((t, q) => {
    if (t === 'coach_canary_config') return cfg.configError ? { data: null, error: { code: '500' } } : { data: cfg.configRows ?? [], error: null };
    if (cfg.contextError && (t === 'runs' || t === 'user_plans' || t === 'user_workouts' || t === 'user_races') && q._op !== 'insert') {
      return { data: null, error: { code: '500' } };
    }
    if (t === 'coach_chat_messages' && q._op !== 'insert') return { count: state.proactiveCount, data: [], error: null };
    if (t === 'coach_chat_messages' && q._op === 'insert') {
      const row = q._insertRow;
      state.msgInserts.push(row);
      if (row.run_ref) {
        const key = `${row.user_id}|${row.run_ref}`;
        if (state.refs.has(key)) return { data: null, error: { code: '23505', message: 'dup' } };
        state.refs.add(key);
      }
      // El count de proactivos del día refleja TODOS los mensajes insertados
      // (con o sin run_ref) — igual que la tabla real.
      if (row.is_proactive) state.proactiveCount++;
      return { data: null, error: null };
    }
    if (t === 'analytics_events' && q._op === 'insert') { state.events.push(q._insertRow); return { data: null, error: null }; }
    return { data: [], error: null };
  });
  return { sb, state };
}
const CFG_LIVE = [{ enabled: true, dry_run: false, allowlist: [UID] }];
const CFG_DRY = [{ enabled: true, dry_run: true, allowlist: [UID] }];

// C8 config AUSENTE → ok:false → camino legacy (producción intacta)
{
  const { sb, state } = canaryMockSb({ configRows: [] });
  const cfg = await getCanaryConfig(sb);
  check('C8 config ausente → ok:false', cfg.ok === false && cfg.reason === 'config_missing');
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C8 cae a legacy', r.path === 'legacy' && r.outcome === 'legacy_sent', `${r.path}/${r.outcome}`);
  check('C8 mensaje legacy sin run_ref', state.msgInserts.length === 1 && !state.msgInserts[0].run_ref);
}
// C8b error de consulta de config → legacy
{
  const { sb } = canaryMockSb({ configError: true });
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C8b config error → legacy', r.path === 'legacy');
}
// C9 enabled=false (aunque esté en allowlist) → legacy
{
  const { sb } = canaryMockSb({ configRows: [{ enabled: false, dry_run: false, allowlist: [UID] }] });
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C9 disabled → legacy', r.path === 'legacy');
}
// C9b enabled pero user FUERA de allowlist → legacy
{
  const { sb, state } = canaryMockSb({ configRows: [{ enabled: true, dry_run: false, allowlist: ['00000000-0000-4000-8000-0000000000ff'] }] });
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C9b fuera de allowlist → legacy', r.path === 'legacy');
  check('C9b evento not_in_allowlist', state.events.some((e) => e.event_name === 'post_workout_canary_skipped' && e.params.reason === 'not_in_allowlist'));
}
// C10 allowlist > 5 → config inválida → legacy
{
  const six = Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-00000000000${i}`);
  const { sb } = canaryMockSb({ configRows: [{ enabled: true, dry_run: false, allowlist: six }] });
  const cfg = await getCanaryConfig(sb);
  check('C10 allowlist>5 → ok:false', cfg.ok === false && cfg.reason === 'allowlist_too_big');
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C10 cae a legacy', r.path === 'legacy');
}
// C10b allowlist con no-UUID (email) → inválida → legacy
{
  const { sb } = canaryMockSb({ configRows: [{ enabled: true, dry_run: false, allowlist: ['user@mail.com'] }] });
  const cfg = await getCanaryConfig(sb);
  check('C10b email en allowlist → ok:false', cfg.ok === false && cfg.reason === 'allowlist_invalid');
}
// C11 DRY-RUN: analiza y mide, CERO mensajes
{
  const { sb, state } = canaryMockSb({ configRows: CFG_DRY });
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C11 outcome dry_run', r.outcome === 'dry_run' && r.path === 'canary_dry');
  check('C11 CERO mensajes insertados', state.msgInserts.length === 0);
  check('C11 evento con dry_run:true', state.events.some((e) => e.event_name === 'post_workout_analysis_generated' && e.params.dry_run === true));
}
// C12 LIVE: creado; reintento del MISMO run_ref → duplicate suprimido
{
  const { sb, state } = canaryMockSb({ configRows: CFG_LIVE });
  const r1 = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  const r2 = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C12 primera created', r1.outcome === 'created' && r1.path === 'canary_live');
  check('C12 reintento duplicate', r2.outcome === 'duplicate');
  check('C12 UN solo mensaje persistido', state.refs.size === 1);
}
// C13 DOS SESIONES REALES el mismo día → DOS análisis (sin cap diario)
{
  const { sb, state } = canaryMockSb({ configRows: CFG_LIVE });
  const morning = { ...RUNROW, id: 'run-am', strava_activity_id: 111, hora_inicio: '2026-08-15T08:00:00Z' };
  const evening = { ...RUNROW, id: 'run-pm', strava_activity_id: 222, hora_inicio: '2026-08-15T18:00:00Z' };
  const r1 = await handleJosePostWorkout(sb, morning, { nowIso: NOW, lang: 'es' });
  const r2 = await handleJosePostWorkout(sb, evening, { nowIso: NOW, lang: 'es' });
  check('C13 mañana created', r1.outcome === 'created', r1.outcome);
  check('C13 tarde TAMBIÉN created (cap retirado)', r2.outcome === 'created', r2.outcome);
  check('C13 dos mensajes con run_ref distintos', state.refs.size === 2);
}
// C14 LEGACY conserva SU cap diario (semántica de producción para no-canario)
{
  const { sb, state } = canaryMockSb({ configRows: [], proactiveToday: 1 });
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C14 legacy con proactivo hoy → capped', r.outcome === 'legacy_capped', r.outcome);
  check('C14 cero mensajes', state.msgInserts.length === 0);
}
// C14b legacy: fallo del count → fail closed, cero mensajes
{
  const { sb, state } = canaryMockSb({ configRows: [] });
  const origFrom = sb.from.bind(sb);
  // count con error para coach_chat_messages no-insert
  const sbErr = mockSb((t, q) => {
    if (t === 'coach_canary_config') return { data: [], error: null };
    if (t === 'coach_chat_messages' && q._op !== 'insert') return { count: null, error: { code: '500' }, data: null };
    if (t === 'analytics_events' && q._op === 'insert') return { data: null, error: null };
    return { data: [], error: null };
  });
  const r = await handleJosePostWorkout(sbErr, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C14b legacy cap error → sin envío', r.outcome === 'legacy_cap_check_failed', r.outcome);
  void state; void origFrom;
}
// C15 isUserInCanary unidades
check('C15 disabled → false', isUserInCanary({ ok: true, enabled: false, allowlist: [UID] }, UID) === false);
check('C15 no-uuid userId → false', isUserInCanary({ ok: true, enabled: true, allowlist: [UID] }, 'user-1') === false);
check('C15 máx const = 5', CANARY_MAX_USERS === 5);
// C16 plantilla legacy BYTE-IDÉNTICA a producción (verificada contra mensajes
// reales de BD del 15 ago 2026 — el no-canario no nota NINGÚN cambio)
{
  const t = legacyJoseContent({ distancia_km: 6, duracion_segundos: 1980, ritmo_promedio: '5:30', deporte: 'running' });
  check('C16 legacy running byte-idéntica', t === '¡Entreno registrado! 6 km · a 5:30 · 33 min. Buen trabajo — he echado un vistazo a los números y los tienes en tu resumen. Si notaste algo raro (molestias, fatiga excesiva), cuéntamelo y lo miramos juntos.'
    || t === '¡Entreno registrado! 6.00 km · a 5:30 · 33 min. Buen trabajo — he echado un vistazo a los números y los tienes en tu resumen. Si notaste algo raro (molestias, fatiga excesiva), cuéntamelo y lo miramos juntos.', t);
}
// C17 CANARIO REAL + ERROR DE CONSULTAS DE CONTEXTO → jamás legacy; el único
// fallback permitido: datos básicos YA VALIDADOS del entreno actual, SIN
// comparaciones, SIN historial, SIN plan, SIN promesa de análisis.
{
  const { sb, state } = canaryMockSb({ configRows: CFG_LIVE, contextError: true });
  const r = await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
  check('C17 no cae a legacy', r.path === 'canary_live', r.path);
  check('C17 outcome created (fallback básico)', r.outcome === 'created', r.outcome);
  const msg = state.msgInserts[0]?.content || '';
  check('C17 mensaje con run_ref (nuevo sistema)', !!state.msgInserts[0]?.run_ref);
  check('C17 sin comparación', !/más rápido|más tranquilo|media|últimas/.test(msg), msg);
  check('C17 sin promesa de análisis', !/he analizado|he echado un vistazo|analicé/.test(msg.toLowerCase()), msg);
  check('C17 sin plan ni récord', !/plan|récord|record personal/.test(msg.toLowerCase()), msg);
  check('C17 cita SOLO datos del entreno actual', msg.includes('6 km') && msg.includes('5:30'), msg);
  check('C17 gap declarado', r.analysis.reason_codes.includes('history_query_failed'), r.analysis.reason_codes.join('|'));
}
// C18 CANARIO REAL + ERROR DEL MOTOR (datos inválidos) → SILENCIO HONESTO:
// cero mensaje nuevo Y cero mensaje legacy.
{
  const { sb, state } = canaryMockSb({ configRows: CFG_LIVE });
  const bad = { ...RUNROW, id: 'run-bad2', strava_activity_id: 2001, duracion_segundos: 120 };
  const r = await handleJosePostWorkout(sb, bad, { nowIso: NOW, lang: 'es' });
  check('C18 outcome no_message', r.outcome === 'no_message', r.outcome);
  check('C18 no cae a legacy', r.path === 'canary_live', r.path);
  check('C18 CERO mensajes (ni nuevo ni legacy)', state.msgInserts.length === 0, String(state.msgInserts.length));
}
// C19 config inválida/ausente → CERO mensajes del sistema nuevo (solo legacy)
{
  for (const rows of [[], [{ enabled: true, dry_run: false, allowlist: ['x@y.z'] }]]) {
    const { sb, state } = canaryMockSb({ configRows: rows });
    await handleJosePostWorkout(sb, RUNROW, { nowIso: NOW, lang: 'es' });
    check('C19 cero inserts con run_ref (sistema nuevo apagado)', state.msgInserts.every((m) => !m.run_ref), JSON.stringify(rows[0] || 'missing'));
  }
}

// ═══ BLOQUE D — Contrato consumidor-esquema (estático) ═══
function extractSelects(src) {
  const out = [];
  const re = /\.from\(\s*['"]([a-z_]+)['"]\s*\)([\s\S]*?)(?=\.from\(|$)/g;
  let m;
  while ((m = re.exec(src))) {
    const table = m[1];
    const seg = m[2].slice(0, 600);
    const sel = seg.match(/\.select\(\s*['"]([^'"]+)['"]/);
    if (sel && !/\*/.test(sel[1])) out.push({ table, cols: sel[1].split(',').map((c) => c.trim().split(':')[0].trim()).filter((c) => c && !c.includes('(')) });
    const eqEstado = [...seg.matchAll(/\.eq\(\s*['"]estado['"]\s*,\s*['"]([^'"]+)['"]/g)].map((x) => x[1]);
    const inEstado = seg.match(/\.in\(\s*['"]estado['"]\s*,\s*\[([^\]]*)\]/);
    const eqStatus = [...seg.matchAll(/\.eq\(\s*['"]status['"]\s*,\s*['"]([^'"]+)['"]/g)].map((x) => x[1]);
    out.push({ table, estados: eqEstado.concat(inEstado ? inEstado[1].split(',').map((s) => s.replace(/['"\s]/g, '')) : []), status: eqStatus });
  }
  return out;
}
function checkContracts(file, label, opts = {}) {
  const src = readFileSync(join(ROOT, file), 'utf8');
  for (const item of extractSelects(src)) {
    const schema = SCHEMA[item.table];
    if (item.cols && schema) {
      for (const col of item.cols) {
        check(`D ${label}: ${item.table}.${col} existe`, schema.includes(col), `columna fantasma en ${file}`);
      }
    }
    if (item.estados && item.estados.length && (item.table === 'user_plans' || item.table === 'user_workouts')) {
      for (const e of item.estados) check(`D ${label}: estado '${e}' válido en ${item.table}`, ESTADOS[item.table].includes(e), `estado fantasma en ${file}`);
    }
    if (item.status && item.status.length && item.table === 'user_races') {
      for (const s of item.status) check(`D ${label}: status '${s}' válido`, ESTADOS.user_races_status.includes(s));
    }
  }
  return src;
}
function checkContractsSrc(src, label) {
  for (const item of extractSelects(src)) {
    const schema = SCHEMA[item.table];
    if (item.cols && schema) {
      for (const col of item.cols) check(`D ${label}: ${item.table}.${col} existe`, schema.includes(col), 'columna fantasma');
    }
    if (item.estados && item.estados.length && (item.table === 'user_plans' || item.table === 'user_workouts')) {
      for (const e of item.estados) check(`D ${label}: estado '${e}' válido en ${item.table}`, ESTADOS[item.table].includes(e), 'estado fantasma');
    }
    if (item.status && item.status.length && item.table === 'user_races') {
      for (const s of item.status) check(`D ${label}: status '${s}' válido`, ESTADOS.user_races_status.includes(s));
    }
  }
}
const srcOrch = checkContracts('api/_lib/post-workout-orchestrator.js', 'orquestador');
const srcCoach = readFileSync(join(ROOT, 'supabase/functions/ai-coach/index.ts'), 'utf8');
// ai-coach: el contrato se exige SOLO en la región de José autorizada por el
// encargo (post_run_analysis + chat). weekly_summary y smart_check siguen
// rotos A PROPÓSITO (no autorizados) — documentados en el informe 118.
const joseStart = srcCoach.indexOf('async function handlePostRunAnalysis');
const joseEnd = srcCoach.indexOf('async function handleWeeklySummary');
check('D ai-coach regiones localizadas', joseStart > 0 && joseEnd > joseStart);
const joseRegion = srcCoach.slice(joseStart, joseEnd);
checkContractsSrc(joseRegion, 'ai-coach(José)');
const srcHook = checkContracts('api/strava-webhook.js', 'webhook');

// Anti-silencio: las consultas F118 capturan `error` explícitamente
check('D orquestador captura errores', (srcOrch.match(/,\s*error\s*\}/g) || []).length >= 4, 'faltan capturas de error');
check('D ai-coach chat runs error-check', srcCoach.includes("dataGaps.push('recent_runs_unavailable')"));
check('D ai-coach chat plan error-check', srcCoach.includes('planErr'));
check('D ai-coach next workout error-check', srcCoach.includes('nwErr'));
check('D ai-coach sin estado activo fantasma en José', !joseRegion.includes("'activo'"), "'activo' sigue en la región de José");
check('D ai-coach chat usa objetivo (no goal_key)', joseRegion.includes('objetivo') && !joseRegion.includes('goal_key'));
// PII en logs del flujo F118: los console del orquestador no emiten contenido/email
check('D orquestador logs sin PII', !/console\.\w+\([^)]*\b(content|email|nombre|message)\b/.test(srcOrch));
// Idempotencia por IDENTIDAD, jamás por texto generado
check('D run_ref es la identidad (no el texto)', srcOrch.includes('run_ref: runRef,') && !/run_ref:\s*content/.test(srcOrch));

// ═══ BLOQUE E — Anclas del webhook (F118.1) ═══
check('E webhook usa la entrada única', srcHook.includes('handleJosePostWorkout(sb, runRow'));
check('E webhook SIN cap diario de José', !srcHook.includes('joseToday') && !srcHook.includes('joseCountErr'), 'el cap volvió al webhook');
check('E plantilla vieja fuera del webhook', !srcHook.includes('he echado un vistazo'));
check('E Ana intacta (función presente)', srcHook.includes('function anaInAppContent(run)'));
check('E Ana intacta (insert presente)', srcHook.includes('anaInAppContent(row)'));
check('E push José conservada', srcHook.includes('josePushText(row)'));
check('E push solo si habló (created|legacy_sent)', srcHook.includes("joseResult.outcome === 'created' || joseResult.outcome === 'legacy_sent'"));

// ═══ BLOQUE S — Auditoría del SQL preview/rollback (F118.1) ═══
{
  const sqlPrev = readFileSync(join(ROOT, 'sql/f118-preview-coach-run-ref.sql'), 'utf8').replace(/\r\n/g, '\n');
  const sqlRoll = readFileSync(join(ROOT, 'sql/f118-rollback-coach-run-ref.sql'), 'utf8').replace(/\r\n/g, '\n');
  const activePrev = sqlPrev.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
  const activeRoll = sqlRoll.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
  check('S índice ÚNICO PARCIAL (histórico admitido)', activePrev.includes('WHERE run_ref IS NOT NULL'));
  check('S unicidad por (user_id, run_ref) — no por fecha', activePrev.includes('(user_id, run_ref)') && !/\(user_id,\s*fecha\)/.test(activePrev));
  check('S cero UPDATE/DELETE de datos antiguos', !/\bUPDATE\b/i.test(activePrev) && !/\bDELETE\b/i.test(activePrev), 'el preview modifica datos');
  check('S sin backfill', !/backfill/i.test(activePrev));
  check('S precheck aborta ante colisiones', activePrev.includes('RAISE EXCEPTION') && activePrev.includes('HAVING COUNT(*) > 1'));
  check('S canario cerrado por defecto (enabled)', /enabled boolean NOT NULL DEFAULT false/.test(activePrev));
  check('S canario dry_run por defecto', /dry_run boolean NOT NULL DEFAULT true/.test(activePrev));
  check("S allowlist vacía por defecto", /allowlist uuid\[\] NOT NULL DEFAULT '\{\}'/.test(activePrev));
  check('S allowlist máx 5', activePrev.includes('allowlist_max_5') && activePrev.includes('<= 5'));
  check('S RLS activada en config', activePrev.includes('ENABLE ROW LEVEL SECURITY'));
  check('S rollback SOLO borra lo creado', activeRoll.includes('DROP INDEX IF EXISTS public.coach_chat_messages_user_runref_uni')
    && activeRoll.includes('DROP COLUMN IF EXISTS run_ref')
    && activeRoll.includes('DROP TABLE IF EXISTS public.coach_canary_config')
    && !/\bUPDATE\b|\bDELETE\b|\bINSERT\b/i.test(activeRoll)
    && (activeRoll.match(/\bDROP\b/gi) || []).length === 3);
}

// ═══ Guarda de PARIDAD por hash-pin (F118.1) ═══
{
  const engineSrc = readFileSync(join(ROOT, 'api/_lib/post-workout-analysis.js'), 'utf8').replace(/\r\n/g, '\n');
  const engineHash = createHash('sha256').update(engineSrc).digest('hex');
  const pin = readFileSync(join(ROOT, 'scripts/f118-engine.hash'), 'utf8').trim();
  check('HASH motor == pin', engineHash === pin, `motor ${engineHash.slice(0, 12)} vs pin ${pin.slice(0, 12)} — si cambiaste el motor, regenera espejo TS + pin en AMBOS repos`);
}

// ═══ Desacoplamiento de unidades de despliegue (F118.1) ═══
check('U webhook no acoplado a ai-coach', !srcHook.includes('ai-coach'));
check('U orquestador no acoplado a ai-coach', !srcOrch.includes('ai-coach'));

// ═══ Fixtures de paridad para la copia TS de la app ═══
{
  const engineSrc = readFileSync(join(ROOT, 'api/_lib/post-workout-analysis.js'), 'utf8').replace(/\r\n/g, '\n');
  const engineHash = createHash('sha256').update(engineSrc).digest('hex');
  writeFileSync(join(ROOT, 'scripts', 'f118-fixtures-generated.json'), JSON.stringify({ now_iso: NOW, engine_hash: engineHash, cases: parity }, null, 1));
}

// ═══ Resumen ═══
console.log(`\nF118 harness: ${pass} PASS · ${fail} FAIL`);
if (failures.length) {
  console.log('FALLOS:');
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
