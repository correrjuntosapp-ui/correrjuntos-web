// ============================================================
// post-workout-orchestrator.js — Recolección de contexto + idempotencia +
// instrumentación del mensaje post-entreno de José (F118).
//
// Recibe el cliente Supabase INYECTADO (service role en producción, mock en
// el harness) — toda la lógica es testeable sin red.
//
// Reglas duras:
//  - FAIL CLOSED: un error de consulta NUNCA se convierte en [] silencioso.
//    Cada error suma un `data_gap`; el motor decide con lo que hay declarado.
//  - Idempotencia por IDENTIDAD (user + run_ref), jamás por texto generado.
//  - Sin PII en logs ni eventos: nada de email, nombre, contenido de chat.
//    (Los console.* de este fichero solo emiten códigos y contadores.)
// ============================================================

import { analyzeWorkout, renderJoseMessage, buildRunRef, seedFromId } from './post-workout-analysis.js';

// ── Contexto: cada consulta comprueba `error` y declara el hueco ──
export async function gatherContextForRun(sb, run, nowIso) {
  const gaps = [];

  // Últimas actividades del MISMO deporte, anteriores a la actual.
  let history = [];
  {
    const q = sb
      .from('runs')
      .select('id, deporte, distancia_km, duracion_segundos, hora_inicio')
      .eq('user_id', run.user_id)
      .eq('deporte', run.deporte)
      .lt('hora_inicio', run.hora_inicio)
      .order('hora_inicio', { ascending: false })
      .limit(8);
    const { data, error } = await q;
    if (error) gaps.push('history_query_failed');
    else if (Array.isArray(data)) {
      history = data
        .filter((r) => r.id !== run.id)
        .map((r) => ({ id: r.id, sport: r.deporte, distance_km: r.distancia_km, duration_sec: r.duracion_segundos, start_iso: r.hora_inicio }));
    } else gaps.push('history_query_failed');
  }

  // Plan activo real (estados reales: active | paused — NUNCA 'activo').
  let plan = null;
  {
    const { data, error } = await sb
      .from('user_plans')
      .select('id, objetivo, semana_actual, estado, race_nombre, fecha_carrera')
      .eq('user_id', run.user_id)
      .in('estado', ['active', 'paused'])
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error) gaps.push('plan_query_failed');
    else if (Array.isArray(data) && data.length > 0) {
      plan = { goal_key: data[0].objetivo || null, week: data[0].semana_actual ?? null, race_name: data[0].race_nombre || null, race_date: data[0].fecha_carrera || null, plan_id: data[0].id };
    }
  }

  // Sesión prevista para el día de la actividad + próxima pendiente.
  let todayWorkout = null;
  let nextWorkout = null;
  if (plan) {
    const runFecha = run.fecha || (run.hora_inicio ? String(run.hora_inicio).slice(0, 10) : null);
    if (runFecha) {
      const { data, error } = await sb
        .from('user_workouts')
        .select('tipo, fecha, distancia_target_km, estado')
        .eq('user_id', run.user_id)
        .eq('estado', 'pending')
        .gte('fecha', runFecha)
        .order('fecha', { ascending: true })
        .limit(3);
      if (error) gaps.push('workouts_query_failed');
      else if (Array.isArray(data)) {
        todayWorkout = data.find((w) => w.fecha === runFecha) || null;
        nextWorkout = data.find((w) => w.fecha > runFecha) || null;
      }
    }
  }

  // Carrera objetivo: primaria = la del plan; secundaria = user_races 'going'.
  let race = null;
  if (plan && plan.race_name && plan.race_date) {
    race = { nombre: plan.race_name, fecha: plan.race_date };
  } else {
    const today = nowIso ? String(nowIso).slice(0, 10) : null;
    if (today) {
      const { data, error } = await sb
        .from('user_races')
        .select('race_nombre, race_fecha, status')
        .eq('user_id', run.user_id)
        .eq('status', 'going')
        .gte('race_fecha', today)
        .order('race_fecha', { ascending: true })
        .limit(1);
      if (error) gaps.push('races_query_failed');
      else if (Array.isArray(data) && data.length > 0) race = { nombre: data[0].race_nombre, fecha: data[0].race_fecha };
    }
  }

  return { history, plan, todayWorkout, nextWorkout, race, gaps };
}

// ── Evento de analítica sin PII (best-effort, nunca rompe el flujo) ──
export async function emitEvent(sb, userId, eventName, params) {
  try {
    const safe = params && typeof params === 'object' ? params : {};
    // Blindaje: jamás texto libre ni claves sospechosas en params.
    for (const k of Object.keys(safe)) {
      if (/message|content|email|name|nombre|token/i.test(k)) delete safe[k];
    }
    const { error } = await sb.from('analytics_events').insert({
      user_id: userId,
      event_name: eventName,
      params: safe,
      platform: 'server',
      event_ts: new Date().toISOString(),
    });
    if (error) console.log('[post-workout] event insert failed:', eventName, error.code || 'err');
  } catch {
    // best-effort
  }
}

// ── Inserción idempotente del mensaje de José ──
// Devuelve: 'created' | 'duplicate' | 'failed'
export async function insertJoseMessageIdempotent(sb, userId, runRef, content) {
  if (!runRef) return 'failed'; // sin identidad no hay inserción (fail closed)
  // Camino preferente: columna run_ref + índice único (migración F118, preview
  // en sql/f118-preview-coach-run-ref.sql). La violación de unicidad ES la
  // señal de duplicado — atómica frente a reintentos concurrentes del webhook.
  const { error } = await sb.from('coach_chat_messages').insert({
    user_id: userId,
    role: 'assistant',
    content,
    is_proactive: true,
    run_ref: runRef,
  });
  if (!error) return 'created';
  if (error.code === '23505') return 'duplicate';
  // Migración aún no aplicada (columna inexistente): fallback legacy SIN
  // idempotencia por identidad — se conserva el comportamiento actual
  // (cap diario del caller) y se deja constancia para el despliegue.
  const msg = String(error.message || '');
  if (error.code === '42703' || (msg.includes('run_ref') && msg.includes('column'))) {
    const { error: legacyErr } = await sb.from('coach_chat_messages').insert({
      user_id: userId,
      role: 'assistant',
      content,
      is_proactive: true,
    });
    return legacyErr ? 'failed' : 'created';
  }
  return 'failed';
}

// ── Punto de entrada único de la vía servidor (webhook Strava) ──
// runRow = fila ya insertada en `runs` (shape de mapActivityToRun + id).
// Devuelve { outcome, analysis } para logging del caller.
export async function runJosePostWorkout(sb, runRow, opts) {
  const nowIso = (opts && opts.nowIso) || new Date().toISOString();
  const lang = (opts && opts.lang) || 'es';

  const ctx = await gatherContextForRun(sb, runRow, nowIso);

  const analysis = analyzeWorkout({
    current: {
      id: runRow.id,
      sport: runRow.deporte,
      distance_km: runRow.distancia_km,
      duration_sec: runRow.duracion_segundos,
      start_iso: runRow.hora_inicio,
    },
    history: ctx.history,
    plan: ctx.plan,
    next_workout: ctx.nextWorkout,
    today_workout: ctx.todayWorkout,
    race: ctx.race,
    now_iso: nowIso,
  });
  for (const g of ctx.gaps) analysis.reason_codes.push(g);

  const baseParams = {
    via: 'strava',
    sport: analysis.facts ? analysis.facts.sport : String(runRow.deporte || 'unknown'),
    status: analysis.comparison ? analysis.comparison.status : 'n/a',
    confidence: analysis.confidence,
    reasons: analysis.reason_codes.join('|'),
    has_plan: !!ctx.plan,
    data_gaps: ctx.gaps.length,
  };

  if (!analysis.ok) {
    await emitEvent(sb, runRow.user_id, 'post_workout_analysis_insufficient_data', baseParams);
    return { outcome: 'no_message', analysis };
  }
  await emitEvent(sb, runRow.user_id, 'post_workout_analysis_generated', baseParams);

  const runRef = buildRunRef(runRow);
  const content = renderJoseMessage(analysis, { lang, seed: seedFromId(runRef || runRow.id), now_iso: nowIso });
  if (!content) {
    await emitEvent(sb, runRow.user_id, 'post_workout_coach_generation_failed', baseParams);
    return { outcome: 'render_failed', analysis };
  }

  const inserted = await insertJoseMessageIdempotent(sb, runRow.user_id, runRef, content);
  if (inserted === 'duplicate') {
    await emitEvent(sb, runRow.user_id, 'post_workout_duplicate_suppressed', baseParams);
    return { outcome: 'duplicate', analysis };
  }
  if (inserted === 'failed') {
    await emitEvent(sb, runRow.user_id, 'post_workout_coach_generation_failed', baseParams);
    return { outcome: 'insert_failed', analysis };
  }
  await emitEvent(sb, runRow.user_id, 'post_workout_coach_message_created', baseParams);
  return { outcome: 'created', analysis, content };
}

// ============================================================
// F118.1 — CANARIO CERRADO POR DEFECTO + CAMINO LEGACY INTACTO
//
// Regla de oro: fuera de la allowlist NADA cambia respecto a producción
// (plantilla legacy + su cap diario). Dentro: motor nuevo SIN cap diario
// (dos sesiones reales el mismo día = dos análisis; la deduplicación es
// run_ref, es decir, la ACTIVIDAD). dry_run genera y mide pero NO inserta.
// Fail closed: config ausente/errónea/allowlist>5 ⇒ camino legacy.
// Kill switch: UPDATE coach_canary_config SET enabled=false (sin deploy).
// PROHIBIDO acoplar este flujo a la Edge Function del chat del coach
// (unidad de despliegue separada — verificado por harness).
// ============================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CANARY_MAX_USERS = 5;

// Lee la config del canario. ok:false ante CUALQUIER anomalía (error de
// consulta, fila ausente, allowlist inválida o >5) — el caller cae a legacy.
export async function getCanaryConfig(sb) {
  try {
    const { data, error } = await sb
      .from('coach_canary_config')
      .select('enabled, dry_run, allowlist')
      .eq('id', 1)
      .limit(1);
    if (error || !Array.isArray(data) || data.length === 0) return { ok: false, reason: error ? 'config_query_failed' : 'config_missing' };
    const row = data[0];
    const list = Array.isArray(row.allowlist) ? row.allowlist : [];
    if (list.length > CANARY_MAX_USERS) return { ok: false, reason: 'allowlist_too_big' };
    if (!list.every((u) => typeof u === 'string' && UUID_RE.test(u))) return { ok: false, reason: 'allowlist_invalid' };
    return { ok: true, enabled: row.enabled === true, dryRun: row.dry_run !== false, allowlist: list };
  } catch {
    return { ok: false, reason: 'config_exception' };
  }
}

export function isUserInCanary(config, userId) {
  return !!(config && config.ok === true && config.enabled === true
    && typeof userId === 'string' && UUID_RE.test(userId)
    && config.allowlist.includes(userId));
}

// ── Camino LEGACY (comportamiento de producción actual, byte a byte) ──
function legacyFmtDuration(totalSec) {
  if (!totalSec) return null;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m} min`;
}

// BYTE-IDÉNTICA a la plantilla de producción actual (verificado contra
// mensajes reales de BD del 15 ago — harness C16). Conserva DELIBERADAMENTE
// la frase-promesa vieja: el encargo F118.1 §1 ordena que fuera de la
// allowlist NADA cambie durante el canario. Esta plantilla desaparece al
// pasar el canario a 100% (paso de ramp-up del informe). El usuario CANARIO
// jamás la recibe: sus errores terminan en silencio honesto (§4).
export function legacyJoseContent(run) {
  const km = run.distancia_km > 0 ? run.distancia_km.toFixed(2) : null;
  const parts = [];
  if (km) parts.push(`${km} km`);
  if (run.ritmo_promedio && run.deporte !== 'walking' && run.deporte !== 'bici') parts.push(`a ${run.ritmo_promedio}`);
  const dur = legacyFmtDuration(run.duracion_segundos);
  if (dur) parts.push(dur);
  const resumen = parts.length ? parts.join(' · ') : 'entreno completado';
  if (run.deporte === 'walking') {
    return `¡Buena caminata! ${resumen}. Caminar también suma: activa la recuperación y construye base aeróbica. Si quieres, mañana te preparo algo suave de carrera.`;
  }
  if (run.deporte === 'bici') {
    return `¡Buena ruta en bici! ${resumen}. El ciclismo construye base aeróbica sin impacto — piernas más frescas para tu próximo entreno de carrera. Si quieres, lo tengo en cuenta al planificar tu semana.`;
  }
  return `¡Entreno registrado! ${resumen}. Buen trabajo — he echado un vistazo a los números y los tienes en tu resumen. Si notaste algo raro (molestias, fatiga excesiva), cuéntamelo y lo miramos juntos.`;
}

// Legacy conserva SU cap diario histórico (semántica de producción intacta
// para los usuarios fuera del canario). Fail closed si el count falla.
async function legacyJoseMessage(sb, runRow) {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const { count, error: capErr } = await sb
    .from('coach_chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', runRow.user_id)
    .eq('is_proactive', true)
    .gte('created_at', todayStart.toISOString());
  if (capErr) return { outcome: 'legacy_cap_check_failed' };
  if (count && count > 0) return { outcome: 'legacy_capped' };
  const { error } = await sb.from('coach_chat_messages').insert({
    user_id: runRow.user_id, role: 'assistant', content: legacyJoseContent(runRow), is_proactive: true,
  });
  return { outcome: error ? 'legacy_failed' : 'legacy_sent' };
}

// ── ENTRADA ÚNICA del webhook (decide canario/dry-run/legacy) ──
export async function handleJosePostWorkout(sb, runRow, opts) {
  const config = await getCanaryConfig(sb);
  if (!isUserInCanary(config, runRow.user_id)) {
    // Fuera del canario (o config inválida): producción actual sin cambios.
    const r = await legacyJoseMessage(sb, runRow);
    await emitEvent(sb, runRow.user_id, 'post_workout_canary_skipped', {
      via: 'strava', reason: config.ok ? (config.enabled ? 'not_in_allowlist' : 'canary_disabled') : config.reason,
      legacy_outcome: r.outcome,
    });
    return { ...r, path: 'legacy' };
  }

  if (config.dryRun) {
    // DRY-RUN: analiza y mide, CERO inserciones de mensaje, CERO push.
    const nowIso = (opts && opts.nowIso) || new Date().toISOString();
    const ctx = await gatherContextForRun(sb, runRow, nowIso);
    const analysis = analyzeWorkout({
      current: { id: runRow.id, sport: runRow.deporte, distance_km: runRow.distancia_km, duration_sec: runRow.duracion_segundos, start_iso: runRow.hora_inicio },
      history: ctx.history, plan: ctx.plan, next_workout: ctx.nextWorkout, today_workout: ctx.todayWorkout, race: ctx.race, now_iso: nowIso,
    });
    for (const g of ctx.gaps) analysis.reason_codes.push(g);
    await emitEvent(sb, runRow.user_id, analysis.ok ? 'post_workout_analysis_generated' : 'post_workout_analysis_insufficient_data', {
      via: 'strava', dry_run: true, sport: analysis.facts ? analysis.facts.sport : String(runRow.deporte || 'unknown'),
      status: analysis.comparison ? analysis.comparison.status : 'n/a', confidence: analysis.confidence,
      reasons: analysis.reason_codes.join('|'), has_plan: !!ctx.plan,
    });
    return { outcome: 'dry_run', path: 'canary_dry', analysis };
  }

  const r = await runJosePostWorkout(sb, runRow, opts);
  return { ...r, path: 'canary_live' };
}
