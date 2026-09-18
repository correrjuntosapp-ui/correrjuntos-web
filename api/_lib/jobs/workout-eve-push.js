// Job: workout-eve-push — "José te escribe la víspera"
//
// [11 jun 2026] EL gancho de retención nº1 (patrón Runna: "mi entrenador
// se acuerda de mí"). Cada tarde (cron 18:00 UTC = 20:00 Madrid) busca
// usuarios con plan activo cuyo PRÓXIMO entreno pendiente es MAÑANA y les
// envía un push de José con el título de la sesión + el foco de coach
// (las descripciones diferenciadas que metimos en BD el 11 jun).
//
//   "Mañana: Caminar/Correr 6x1min 👟"
//   "Foco: respiración — inhala 3 pasos, exhala 2. — José"
//
// Dedup: workout_eve_push_log (user_id, workout_id) UNIQUE → 1 push por
// entreno como máximo, aunque el cron corra dos veces.
// Deep link: data.screen='Plan' (el push handler de App.tsx ya lo mapea).
// Modo test: ?dry=1 → calcula audiencia y NO envía nada.

import { createClient } from '@supabase/supabase-js';
// [F104] Guardas puras: anti-planes-zombi (fail-closed), quiet hours por país
// y dedup entre crons (máx 1 push de crons por usuario y día local).
import { canSendNow, isEveEligible, pushedByOtherCronToday } from '../push-guards.js';
// [18 sep 2026] Selección PURA: solo sesiones del plan ACTIVO del usuario,
// idempotencia por usuario+fecha y fuente única (la app ≥ 1.3.29 programa el
// aviso localmente; el servidor solo es respaldo para versiones anteriores).
import { selectEveCandidates, latestVersionByUser } from '../eve-select.js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/** Fecha YYYY-MM-DD en Europe/Madrid con offset de días. */
function madridDate(plusDays = 0) {
  const d = new Date(Date.now() + plusDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Cuerpo del push: el foco de coach de la sesión, recortado con elegancia. */
function buildBody(descripcion) {
  const fallback = 'Prepara las zapatillas — repasa la sesión en la app. — José';
  if (!descripcion || typeof descripcion !== 'string') return fallback;
  let t = descripcion.trim();
  if (t.length > 140) {
    t = t.slice(0, 137).replace(/\s+\S*$/, '') + '…';
  }
  return `${t} — José`;
}

async function sendExpoPush(token, title, body, data) {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'accept-encoding': 'gzip, deflate',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ to: token, title, body, sound: 'default', priority: 'high', data: data || {} }),
  });
  const json = await res.json().catch(() => ({}));
  if (json.data?.status === 'ok') return { ok: true, receipt: json.data.id, status: res.status };
  return { ok: false, status: res.status, error: json.data?.message || json.errors?.[0]?.message || 'unknown' };
}

export default async function runWorkoutEvePush(req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const dry = req?.query?.dry === '1';

  const tomorrow = madridDate(1);

  // 1. Entrenos pendientes de MAÑANA (cualquier estado no-final)
  const { data: workouts, error: wErr } = await supabase
    .from('user_workouts')
    .select('id, user_id, plan_id, titulo, descripcion, fecha, estado, tipo')
    .eq('fecha', tomorrow)
    .not('estado', 'in', '("completed","skipped")');

  if (wErr) {
    return res.status(500).json({ error: 'workouts_query_failed', detail: wErr.message });
  }
  if (!workouts || workouts.length === 0) {
    return res.status(200).json({ ok: true, job: 'workout-eve-push', tomorrow, processed: 0, sent: 0, note: 'no_workouts_tomorrow' });
  }

  // 2. Planes ACTIVOS de esos usuarios (con id: la sesión debe pertenecer a
  //    un plan activo, no basta con que el usuario tenga alguno) + envíos ya
  //    hechos a esos usuarios + última versión de app conocida (fuente única).
  const allUserIds = [...new Set(workouts.map((w) => w.user_id).filter(Boolean))];
  if (allUserIds.length === 0) {
    return res.status(200).json({ ok: true, job: 'workout-eve-push', tomorrow, processed: 0, sent: 0, note: 'no_workouts_tomorrow' });
  }
  const [{ data: plans, error: pErr }, { data: logs, error: lErr }, { data: versionRows }] = await Promise.all([
    supabase.from('user_plans').select('id, user_id, estado, created_at').in('user_id', allUserIds),
    supabase.from('workout_eve_push_log').select('user_id, workout_id').in('user_id', allUserIds),
    supabase.from('analytics_events').select('user_id, app_version, created_at')
      .in('user_id', allUserIds).not('app_version', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }).limit(5000),
  ]);
  if (pErr || lErr) {
    // Fail-closed: sin planes o sin registro de envíos no se envía nada.
    return res.status(500).json({ error: 'plans_or_log_query_failed', detail: (pErr || lErr).message });
  }

  const selection = selectEveCandidates({
    workouts,
    plans: plans || [],
    logs: logs || [],
    versionByUser: latestVersionByUser(versionRows || []),
  });
  const byUser = new Map(selection.candidates.map((c) => [c.userId, c.workout]));
  const userIds = [...byUser.keys()];
  if (userIds.length === 0) {
    return res.status(200).json({
      ok: true, job: 'workout-eve-push', tomorrow, processed: 0, sent: 0,
      note: 'no_candidates', skipped_reasons: countReasons(selection.skipped),
    });
  }

  // 3. Perfiles alcanzables + señales F104/F105
  const [{ data: profiles }, doneRes, { data: activationLogs }] = await Promise.all([
    supabase.from('profiles').select('id, push_token, notifications_enabled, pais').in('id', userIds),
    // [F104] señal de activación real (guarda anti-zombi, fail-closed)
    supabase.from('user_workouts').select('user_id').eq('estado', 'completed').in('user_id', userIds),
    // [F104] dedup entre crons: envíos de activación de HOY
    supabase.from('activation_push_log').select('user_id, sent_at').in('user_id', userIds),
  ]);

  // [F104] Conteo de completados por usuario. Si la query de la señal FALLÓ,
  // el mapa queda con null → isEveEligible fail-closed (no se envía a nadie
  // sin señal demostrada; nunca se inventa actividad).
  const completedCountByUser = new Map();
  if (doneRes.error) {
    for (const uid of userIds) completedCountByUser.set(uid, null);
  } else {
    for (const uid of userIds) completedCountByUser.set(uid, 0);
    for (const r of doneRes.data || []) {
      completedCountByUser.set(r.user_id, (completedCountByUser.get(r.user_id) || 0) + 1);
    }
  }

  const activationSentAts = {};
  (activationLogs || []).forEach((l) => {
    if (!activationSentAts[l.user_id]) activationSentAts[l.user_id] = [];
    activationSentAts[l.user_id].push(l.sent_at);
  });

  const profileById = new Map((profiles || []).map((p) => [p.id, p]));
  const alreadySent = new Set((logs || []).map((l) => `${l.user_id}:${l.workout_id}`));

  let processed = 0;
  let sent = 0;
  let skipped = selection.skipped.length;
  const errors = [];
  const wouldSend = [];

  for (const [userId, w] of byUser) {
    processed++;
    const prof = profileById.get(userId);
    if (
      !prof ||
      typeof prof.push_token !== 'string' ||
      !prof.push_token.startsWith('ExponentPushToken') ||
      prof.notifications_enabled === false
    ) { skipped++; continue; }
    if (alreadySent.has(`${userId}:${w.id}`)) { skipped++; continue; }

    // [F105] POBLACIÓN VÍSPERA (excluyente con activación): SOLO usuarios con
    // ≥1 entreno completado demostrado en BD (fail-closed). Sin sustitutos:
    // el alta reciente sin completar pertenece a la población de activación.
    if (!isEveEligible({ completedCount: completedCountByUser.get(userId) })) {
      skipped++;
      continue;
    }

    // [F104] Dedup entre crons: si activación ya le escribió hoy, hoy no más.
    if (pushedByOtherCronToday(activationSentAts[userId] || [], new Date())) {
      skipped++;
      continue;
    }

    // [F104] Quiet hours por país (fail-closed sin tz fiable).
    if (!canSendNow(new Date(), prof.pais)) {
      skipped++;
      continue;
    }

    const title = `Mañana: ${w.titulo || 'tu entreno'} 👟`;
    const body = buildBody(w.descripcion);

    if (dry) {
      wouldSend.push({ user_id: userId, workout_id: w.id, title, body });
      continue;
    }

    const result = await sendExpoPush(prof.push_token, title, body, {
      type: 'workout_eve',
      screen: 'Plan',
      source: 'workout_eve_push',
      workout_id: w.id,
    });

    await supabase.from('workout_eve_push_log').insert({
      user_id: userId,
      workout_id: w.id,
      push_status: result.status,
      push_receipt_id: result.receipt || null,
      error: result.ok ? null : (result.error || '').slice(0, 500),
    });

    if (result.ok) sent++;
    else errors.push({ user_id: userId, error: result.error });
  }

  return res.status(200).json({
    ok: true,
    job: 'workout-eve-push',
    timestamp: new Date().toISOString(),
    tomorrow,
    dry,
    processed,
    sent,
    skipped,
    would_send: dry ? wouldSend.slice(0, 20) : undefined,
    would_send_count: dry ? wouldSend.length : undefined,
    skipped_reasons: countReasons(selection.skipped),
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
}

/** Resumen de motivos de exclusión (solo conteos: nada identificable). */
function countReasons(skipped) {
  const out = {};
  for (const s of skipped || []) out[s.reason] = (out[s.reason] || 0) + 1;
  return out;
}
