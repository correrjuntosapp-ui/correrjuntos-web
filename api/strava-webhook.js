// ============================================================
// /api/strava-webhook — Strava Webhook Events API (6 jul 2026)
//
// El salto de client-side a server-side para el import de actividades:
// el usuario termina de correr → su reloj sube a Strava → Strava nos
// manda el evento aquí → importamos resistencia a `runs` y fuerza a
// `strength_workout_runs` → la cola F174 programa a José y Ana.
// Todo sin que el usuario abra la app.
//
// El import client-side (useStrava.importActivities) SIGUE existiendo
// como fallback/catch-up — el dedup por strava_activity_id hace que
// convivan sin duplicar.
//
// GET  → 2 usos:
//   1. Validación de suscripción de Strava (hub.challenge echo).
//   2. ?setup=1 → crea/inspecciona la suscripción usando los env
//      STRAVA_CLIENT_ID/SECRET (idempotente: Strava solo permite UNA
//      suscripción por app; si ya existe, la lista y no crea nada).
// POST → evento de Strava {object_type, aspect_type, object_id, owner_id}.
//   Respondemos 200 INMEDIATAMENTE (Strava exige <2s) y seguimos
//   procesando en la misma invocación.
//
// Seguridad: Strava NO firma los eventos (cualquiera podría POSTear un
// evento falso). Mitigación estándar de su documentación: tratar el
// evento como una PISTA — siempre re-consultamos la actividad real a la
// API de Strava con el token guardado del atleta. Un object_id inventado
// devuelve 404 y se ignora. El VERIFY_TOKEN de abajo no es un secreto
// (solo se usa en el handshake de validación de la suscripción).
//
// El webhook NO genera mensajes ni pushes: esa responsabilidad vive en la
// cola persistente F174, procesada por Supabase Cron aun con la app cerrada.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { waitUntil } from '@vercel/functions';
// [F134] Vinculación Strava → sesión del plan (informe 133). Nace apagada.
import { vincularActividadConPlan } from './_lib/strava-plan-linker.js';
// [F146.6A] Logs estructurados sin identificadores personales. Ver el modulo:
// nada de hashes —un hash determinista de un user_id sigue siendo un
// identificador estable—, solo una allowlist de campos y un trace_id
// aleatorio por invocacion.
import { logEvent, logError, newTraceId, errorKind, errorCode } from './_lib/strava-log.js';
import { classifyStravaActivity, mapDeporte, sportType } from './_lib/strava-activity-types.js';

const LOG = '[strava-webhook]';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const STRAVA_API = 'https://www.strava.com/api/v3';
const CALLBACK_URL = 'https://www.correrjuntos.com/api/strava-webhook';
// No es un secreto: solo verifica el handshake GET de la suscripción.
const VERIFY_TOKEN = 'cj-strava-webhook-v1';

function paceFromDistanceTime(meters, seconds) {
  if (!meters || meters <= 0 || !seconds || seconds <= 0) return null;
  const secPerKm = seconds / (meters / 1000);
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

// Parciales por km (splits) desde el detalle de la actividad Strava
// (splits_metric SOLO viene en el GET /activities/{id} detallado, no en
// el listado /athlete/activities — por eso esto vive únicamente aquí y
// no en el import client-side de useStrava.ts). Shape espejo del que ya
// genera el tracker propio (km, time, seconds) + 2 campos extra que
// RunDetailScreen ya sabía leer (elevation_gain) o que añadimos ahora
// (hr_avg) para el desglose "Parciales" estilo Strava.
function buildSplitsFromStrava(a) {
  const raw = Array.isArray(a.splits_metric) ? a.splits_metric : null;
  if (!raw || raw.length === 0) return null;
  const splits = raw
    .map((sm) => {
      const movingForPace = sm.moving_time || sm.elapsed_time || 0;
      const secondsPerKm = sm.distance > 0 && movingForPace > 0
        ? Math.round(movingForPace / (sm.distance / 1000))
        : null;
      return {
        km: sm.split != null ? sm.split : null,
        time: paceFromDistanceTime(sm.distance || 0, movingForPace) || '--:--',
        seconds: secondsPerKm,
        elevation_gain: sm.elevation_difference != null ? Math.round(sm.elevation_difference * 10) / 10 : null,
        hr_avg: sm.average_heartrate ? Math.round(sm.average_heartrate) : null,
      };
    })
    .filter((s) => s.km != null);
  return splits.length > 0 ? splits : null;
}

// Espejo de mapStravaActivityToRun (useStrava.ts) — mantener en sync.
// (splits SOLO se rellenan aquí — ver comentario de buildSplitsFromStrava).
function mapActivityToRun(a, userId) {
  const distanciaKm = a.distance ? Math.round((a.distance / 1000) * 1000) / 1000 : 0;
  const duracionSegundos = Math.round(a.moving_time || a.elapsed_time || 0);
  const elapsedSegundos = a.elapsed_time != null ? Math.round(a.elapsed_time) : null;
  const deporte = mapDeporte(a);

  // Strava expone 2 campos de fecha con una trampa muy conocida de su API:
  //  - start_date: instante UTC real (Z correcto).
  //  - start_date_local: la hora de RELOJ DE PARED en el sitio de la
  //    actividad, pero serializada TAMBIÉN con sufijo "Z" como si fuera
  //    UTC — no lo es. Antes usábamos start_date_local para construir
  //    hora_inicio: al mostrarlo luego convertido a la zona horaria LOCAL
  //    del dispositivo (RunDetailScreen), el offset se aplicaba DOS
  //    VECES y la hora mostrada quedaba desplazada (una carrera de las
  //    18:52 se veía a las 20:52). Fix: start_date (UTC real) para el
  //    instante que se guarda — así el resto de la app lo trata igual
  //    que las runs del tracker propio (que siempre guardan un instante
  //    UTC real). start_date_local solo se usa para la fecha de
  //    calendario (evita que una carrera que cruza medianoche local
  //    caiga en el día UTC equivocado).
  const localRaw = a.start_date_local || a.start_date;
  const utcRaw = a.start_date || a.start_date_local;
  const localDateForCalendar = localRaw ? new Date(localRaw) : new Date();
  const trueStartDate = utcRaw ? new Date(utcRaw) : new Date();
  const valid = !isNaN(localDateForCalendar.getTime()) && !isNaN(trueStartDate.getTime());
  const fecha = valid ? localDateForCalendar.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const horaInicio = valid ? trueStartDate.toISOString() : new Date().toISOString();
  // Fin real de reloj = inicio + tiempo TOTAL transcurrido (incl. pausas),
  // no solo el tiempo en movimiento — si no, una run con paradas largas
  // muestra una hora de fin anterior a la real.
  const totalElapsedForEnd = elapsedSegundos || duracionSegundos;
  const horaFin = valid
    ? new Date(trueStartDate.getTime() + totalElapsedForEnd * 1000).toISOString()
    : new Date().toISOString();
  // Bici: el ritmo min/km y los splits de carrera no tienen sentido → null.
  const sinRitmo = deporte === 'walking' || deporte === 'bici';
  const ritmo = sinRitmo ? null : paceFromDistanceTime(a.distance || 0, duracionSegundos);
  const splits = sinRitmo ? null : buildSplitsFromStrava(a);

  return {
    user_id: userId,
    titulo: a.name || (deporte === 'walking' ? 'Caminata Strava' : deporte === 'bici' ? 'Bici Strava' : deporte === 'trail' ? 'Trail Strava' : 'Carrera Strava'),
    deporte,
    distancia_km: distanciaKm,
    duracion_segundos: duracionSegundos,
    elapsed_segundos: elapsedSegundos,
    ritmo_promedio: ritmo,
    splits,
    calorias: a.calories ? Math.round(a.calories) : null,
    elevacion_ganada: a.total_elevation_gain != null ? Math.round(a.total_elevation_gain * 10) / 10 : null,
    velocidad_max: a.max_speed ? Math.round(a.max_speed * 3.6 * 10) / 10 : null,
    // Strava reporta cadencia de una pierna en running — se dobla (ver cliente).
    cadencia_media: a.average_cadence ? Math.round(a.average_cadence * 2) : null,
    polyline_encoded: (a.map && a.map.summary_polyline) || null,
    lat_inicio: a.start_latlng ? a.start_latlng[0] : null,
    lng_inicio: a.start_latlng ? a.start_latlng[1] : null,
    lat_fin: a.end_latlng ? a.end_latlng[0] : null,
    lng_fin: a.end_latlng ? a.end_latlng[1] : null,
    fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    hr_avg: a.average_heartrate ? Math.round(a.average_heartrate) : null,
    hr_max: a.max_heartrate ? Math.round(a.max_heartrate) : null,
    es_indoor: !!a.trainer,
    source: 'strava',
    strava_activity_id: a.id,
    strava_sport_type: sportType(a),
    coach_pipeline_version: 2,
    // Las builds antiguas no deben disparar además su ruta client-side.
    coaches_notified: true,
  };
}

function mapActivityToStrength(a, userId) {
  const localRaw = a.start_date_local || a.start_date;
  const utcRaw = a.start_date || a.start_date_local;
  const localDate = localRaw ? new Date(localRaw) : new Date();
  const start = utcRaw ? new Date(utcRaw) : new Date();
  const valid = !Number.isNaN(localDate.getTime()) && !Number.isNaN(start.getTime());
  const safeStart = valid ? start : new Date();
  const moving = Math.min(86400, Math.max(0, Math.round(a.moving_time || a.elapsed_time || 0)));
  const elapsed = Math.min(86400, Math.max(moving, Math.round(a.elapsed_time || moving)));
  const externalTitle = String(a.name || '').trim().slice(0, 160) || 'Fuerza Strava';
  return {
    user_id: userId,
    client_run_ref: `strava:${a.id}`,
    source: 'imported',
    planned_session_id: null,
    scheduled_date: valid ? localDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: 'completed',
    started_at: safeStart.toISOString(),
    completed_at: new Date(safeStart.getTime() + elapsed * 1000).toISOString(),
    active_duration_seconds: moving,
    total_duration_seconds: elapsed,
    calories_kcal: null,
    calories_source: null,
    calories_confidence: null,
    external_provider: 'strava',
    external_activity_id: String(a.id),
    external_title: externalTitle,
    external_sport_type: sportType(a),
    coach_pipeline_version: 2,
  };
}

async function refreshTokenIfNeeded(sb, conn, traceId) {
  const nowSec = Math.floor(Date.now() / 1000);
  if (conn.expires_at - nowSec > 300) return conn; // >5 min de margen
  const resp = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: conn.refresh_token,
    }),
  });
  if (!resp.ok) {
    logError(LOG, { stage: 'token_refresh', outcome: 'failed', status: resp.status, trace_id: traceId });
    return null;
  }
  const data = await resp.json();
  if (!data.access_token) return null;
  await sb.from('strava_connections').update({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    updated_at: new Date().toISOString(),
  }).eq('user_id', conn.user_id);
  return { ...conn, access_token: data.access_token };
}

async function processActivityEvent(sb, ownerId, activityId, traceId) {
  // 1. Conexión del atleta
  const { data: conn } = await sb
    .from('strava_connections')
    .select('user_id, access_token, refresh_token, expires_at')
    .eq('strava_athlete_id', ownerId)
    .single();
  if (!conn) { logEvent(LOG, { stage: 'connection', outcome: 'not_found', trace_id: traceId }); return; }

  // 2. Dedup temprano en las dos tablas. Un update de Strava no puede crear
  // otra actividad aunque el tipo sea fuerza y no viva en `runs`.
  const [{ data: existingRun }, { data: existingStrength }] = await Promise.all([
    sb.from('runs').select('id').eq('user_id', conn.user_id)
      .eq('source', 'strava').eq('strava_activity_id', activityId).limit(1),
    sb.from('strength_workout_runs').select('id').eq('user_id', conn.user_id)
      .eq('external_provider', 'strava').eq('external_activity_id', String(activityId)).limit(1),
  ]);
  if ((existingRun?.length ?? 0) > 0 || (existingStrength?.length ?? 0) > 0) {
    logEvent(LOG, { stage: 'dedup', outcome: 'already_imported', trace_id: traceId });
    return;
  }

  // 3. Token fresco + fetch de la actividad REAL (los eventos son pistas)
  const fresh = await refreshTokenIfNeeded(sb, conn, traceId);
  if (!fresh) return;
  const actRes = await fetch(`${STRAVA_API}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${fresh.access_token}` },
  });
  if (!actRes.ok) { logEvent(LOG, { stage: 'activity_fetch', outcome: 'failed', status: actRes.status, trace_id: traceId }); return; }
  const activity = await actRes.json();

  // 4. Clasificación cerrada y compartida con sus pruebas: resistencia o
  // fuerza. No se mete una sesión de gimnasio en la tabla de GPS.
  const activityKind = classifyStravaActivity(activity);
  if (!activityKind) {
    logEvent(LOG, { stage: 'sport_filter', outcome: 'not_importable', sport: sportType(activity), trace_id: traceId });
    return;
  }

  if (activityKind === 'strength') {
    const strengthRow = mapActivityToStrength(activity, conn.user_id);
    const { error: strengthError } = await sb.from('strength_workout_runs').insert(strengthRow);
    if (strengthError) {
      logEvent(LOG, { stage: 'strength_insert', outcome: 'skipped', error_code: errorCode(strengthError), error_kind: errorKind(strengthError), trace_id: traceId });
      return;
    }
    logEvent(LOG, { stage: 'strength_insert', outcome: 'imported', sport: sportType(activity), trace_id: traceId });
    return; // el trigger F174 ya dejó José + Ana en la cola
  }

  // 5. Resistencia: el índice único parcial protege la carrera concurrente
  // con el catch-up del cliente.
  const row = mapActivityToRun(activity, conn.user_id);
  const { data: inserted, error: insErr } = await sb.from('runs').insert(row).select('id').single();
  // El mensaje de Postgres incluye valores de columna (el detalle de una
  // clave duplicada trae el strava_activity_id): solo el codigo controlado.
  if (insErr) { logEvent(LOG, { stage: 'run_insert', outcome: 'skipped', error_code: errorCode(insErr), error_kind: errorKind(insErr), trace_id: traceId }); return; }
  logEvent(LOG, { stage: 'run_insert', outcome: 'imported', sport: row.deporte, trace_id: traceId });

  // 5.5 [F134] Vincular la actividad con la sesión del plan del mismo día.
  //     Nace APAGADO (env STRAVA_PLAN_LINKING); nunca lanza, y un fallo aquí
  //     no altera el camino legacy de José ni de Ana. No emite ningún
  //     mensaje ni notificación propia.
  const vinculo = await vincularActividadConPlan(sb, { ...row, id: inserted.id });
  if (vinculo.modo !== 'off') {
    logEvent(LOG, { stage: 'f134_linking', mode: vinculo.modo, outcome: vinculo.resultado, reason: vinculo.motivo, trace_id: traceId });
  }
  // José y Ana no se generan aquí. El trigger F174 ya creó dos trabajos
  // idempotentes: José elegible ahora y Ana diez minutos después.
}

// ── Setup de la suscripción (idempotente) ─────────────────────
async function handleSetup(res) {
  const cid = process.env.STRAVA_CLIENT_ID;
  const secret = process.env.STRAVA_CLIENT_SECRET;
  if (!cid || !secret) return res.status(500).json({ error: 'missing_strava_env' });

  const listRes = await fetch(
    `${STRAVA_API}/push_subscriptions?client_id=${cid}&client_secret=${secret}`
  );
  const existing = await listRes.json().catch(() => []);
  if (Array.isArray(existing) && existing.length > 0) {
    return res.status(200).json({
      status: 'already_subscribed',
      subscriptions: existing.map((s) => ({ id: s.id, callback_url: s.callback_url })),
    });
  }

  const form = new URLSearchParams({
    client_id: cid,
    client_secret: secret,
    callback_url: CALLBACK_URL,
    verify_token: VERIFY_TOKEN,
  });
  const createRes = await fetch(`${STRAVA_API}/push_subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const created = await createRes.json().catch(() => ({}));
  return res.status(createRes.ok ? 200 : 502).json({
    status: createRes.ok ? 'created' : 'create_failed',
    http: createRes.status,
    result: created,
  });
}

export default async function handler(req, res) {
  // ── GET: validación de Strava o setup ──
  if (req.method === 'GET') {
    const challenge = req.query['hub.challenge'];
    const verify = req.query['hub.verify_token'];
    if (challenge) {
      if (verify !== VERIFY_TOKEN) return res.status(403).json({ error: 'bad_verify_token' });
      // Echo EXACTO que exige Strava para validar el callback
      return res.status(200).json({ 'hub.challenge': challenge });
    }
    if (req.query.setup === '1') {
      return handleSetup(res);
    }
    return res.status(200).json({ ok: true, service: 'strava-webhook' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const event = req.body || {};
  // 200 inmediato (Strava exige respuesta <2s). El procesado va en
  // waitUntil: Vercel CONGELA la lambda en cuanto respondes, así que un
  // "seguir después del res.json()" a secas nunca llega a ejecutarse
  // (verificado en el primer despliegue de este endpoint — el evento
  // llegaba pero no insertaba nada). waitUntil mantiene viva la
  // invocación hasta que la promesa resuelva.
  // Aleatorio por invocacion: permite seguir las lineas de ESTE webhook sin
  // derivar de ningun dato del usuario y sin persistirse en ningun sitio.
  const traceId = newTraceId();
  const work = (async () => {
    try {
      if (event.object_type !== 'activity') return; // athlete deauth etc. → ignorar (v1)
      if (event.aspect_type !== 'create' && event.aspect_type !== 'update') return;
      const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      await processActivityEvent(supabase, event.owner_id, event.object_id, traceId);
    } catch (e) {
      // Ni mensaje ni stack ni payload: cualquiera de los tres puede
      // arrastrar identificadores o el cuerpo entero del evento.
      logError(LOG, { stage: 'processing', outcome: 'exception', error_kind: errorKind(e), error_code: errorCode(e), trace_id: traceId });
    }
  })();
  waitUntil(work);
  return res.status(200).json({ received: true });
}
