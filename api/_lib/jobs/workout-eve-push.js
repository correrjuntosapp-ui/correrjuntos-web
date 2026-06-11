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

  // Días de descanso no merecen push — el silencio también es coaching.
  const realWorkouts = workouts.filter((w) => w.tipo !== 'rest');

  // 1 entreno por usuario (si hubiera dos mañana, el primero)
  const byUser = new Map();
  for (const w of realWorkouts) {
    if (!byUser.has(w.user_id)) byUser.set(w.user_id, w);
  }
  const userIds = [...byUser.keys()];
  if (userIds.length === 0) {
    return res.status(200).json({ ok: true, job: 'workout-eve-push', tomorrow, processed: 0, sent: 0, note: 'only_rest_days' });
  }

  // 2. Solo planes ACTIVOS + perfiles alcanzables + dedup
  const [{ data: plans }, { data: profiles }, { data: logs }] = await Promise.all([
    supabase.from('user_plans').select('user_id, estado').in('user_id', userIds).eq('estado', 'active'),
    supabase.from('profiles').select('id, push_token, notifications_enabled').in('id', userIds),
    supabase.from('workout_eve_push_log').select('user_id, workout_id').in('user_id', userIds),
  ]);

  const activePlanSet = new Set((plans || []).map((p) => p.user_id));
  const profileById = new Map((profiles || []).map((p) => [p.id, p]));
  const alreadySent = new Set((logs || []).map((l) => `${l.user_id}:${l.workout_id}`));

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  const errors = [];
  const wouldSend = [];

  for (const [userId, w] of byUser) {
    processed++;
    if (!activePlanSet.has(userId)) { skipped++; continue; }
    const prof = profileById.get(userId);
    if (
      !prof ||
      typeof prof.push_token !== 'string' ||
      !prof.push_token.startsWith('ExponentPushToken') ||
      prof.notifications_enabled === false
    ) { skipped++; continue; }
    if (alreadySent.has(`${userId}:${w.id}`)) { skipped++; continue; }

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
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
}
