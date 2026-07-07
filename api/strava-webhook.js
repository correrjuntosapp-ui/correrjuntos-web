// ============================================================
// /api/strava-webhook — Strava Webhook Events API (6 jul 2026)
//
// El salto de client-side a server-side para el import de actividades:
// el usuario termina de correr → su reloj sube a Strava → Strava nos
// manda el evento aquí → importamos la actividad a `runs` EN SERVIDOR
// → mensajes in-app de José/Ana + PUSH REMOTA (Expo) a su móvil.
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
// Ana +30min server-side NO es viable en Vercel Hobby (crons solo
// diarios) — su mensaje in-app se inserta al momento (timing correcto:
// el webhook llega minutos después de acabar el entreno). El push de
// Ana sigue siendo client-side para runs del tracker propio.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { waitUntil } from '@vercel/functions';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const STRAVA_API = 'https://www.strava.com/api/v3';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CALLBACK_URL = 'https://www.correrjuntos.com/api/strava-webhook';
// No es un secreto: solo verifica el handshake GET de la suscripción.
const VERIFY_TOKEN = 'cj-strava-webhook-v1';

// Solo actividades A PIE — mismo criterio que useStrava.ts.
const ALLOWED = new Set(['Run', 'TrailRun', 'Walk', 'Hike']);

function mapDeporte(a) {
  const t = a.sport_type || a.type || '';
  if (t === 'TrailRun') return 'trail';
  if (t === 'Walk' || t === 'Hike') return 'walking';
  return 'running';
}

function paceFromDistanceTime(meters, seconds) {
  if (!meters || meters <= 0 || !seconds || seconds <= 0) return null;
  const secPerKm = seconds / (meters / 1000);
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function fmtDuration(totalSec) {
  if (!totalSec) return null;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m} min`;
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
  const ritmo = deporte === 'walking' ? null : paceFromDistanceTime(a.distance || 0, duracionSegundos);
  const splits = deporte === 'walking' ? null : buildSplitsFromStrava(a);

  return {
    user_id: userId,
    titulo: a.name || (deporte === 'walking' ? 'Caminata Strava' : deporte === 'trail' ? 'Trail Strava' : 'Carrera Strava'),
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
    // Server-side ya deja los mensajes de José/Ana insertados → el cliente
    // no debe re-disparar sobre esta fila.
    coaches_notified: true,
  };
}

// ── Copy de José/Ana (ES — la base es español-first; TODO i18n) ──
function joseInAppContent(run) {
  const km = run.distancia_km > 0 ? run.distancia_km.toFixed(2) : null;
  const parts = [];
  if (km) parts.push(`${km} km`);
  if (run.ritmo_promedio && run.deporte !== 'walking') parts.push(`a ${run.ritmo_promedio}`);
  const dur = fmtDuration(run.duracion_segundos);
  if (dur) parts.push(dur);
  const resumen = parts.length ? parts.join(' · ') : 'entreno completado';
  if (run.deporte === 'walking') {
    return `¡Buena caminata! ${resumen}. Caminar también suma: activa la recuperación y construye base aeróbica. Si quieres, mañana te preparo algo suave de carrera.`;
  }
  return `¡Entreno registrado! ${resumen}. Buen trabajo — he echado un vistazo a los números y los tienes en tu resumen. Si notaste algo raro (molestias, fatiga excesiva), cuéntamelo y lo miramos juntos.`;
}

function anaInAppContent(run) {
  if (run.deporte === 'walking') {
    return 'Después de caminar, hidrátate bien y no te saltes la siguiente comida — algo de proteína y verdura te viene perfecto.';
  }
  return 'Hora de reponer: en la próxima hora, hidratos + algo de proteína (por ejemplo, plátano con yogur, o arroz con huevo). Y agua en pequeños sorbos. Tu recuperación empieza ahora.';
}

function josePushText(run) {
  const km = run.distancia_km > 0 ? run.distancia_km.toFixed(2) : null;
  const parts = [];
  if (km) parts.push(`${km} km`);
  if (run.ritmo_promedio && run.deporte !== 'walking') parts.push(`a ${run.ritmo_promedio}`);
  const dur = fmtDuration(run.duracion_segundos);
  if (dur) parts.push(dur);
  const resumen = parts.length ? parts.join(' · ') : 'Entreno completado';
  return { title: 'Coach José', body: `Entreno registrado — ${resumen}. Toca para ver tu resumen.` };
}

async function refreshTokenIfNeeded(sb, conn) {
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
    console.error('[strava-webhook] token refresh failed', resp.status);
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

async function sendExpoPush(token, title, body, data) {
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ to: token, title, body, sound: 'default', priority: 'high', badge: 1, data }),
    });
    const json = await res.json().catch(() => ({}));
    return json?.data?.status === 'ok';
  } catch (e) {
    console.error('[strava-webhook] expo push failed:', e?.message);
    return false;
  }
}

async function processActivityEvent(sb, ownerId, activityId) {
  // 1. Conexión del atleta
  const { data: conn } = await sb
    .from('strava_connections')
    .select('user_id, access_token, refresh_token, expires_at')
    .eq('strava_athlete_id', ownerId)
    .single();
  if (!conn) { console.log('[strava-webhook] atleta sin conexión:', ownerId); return; }

  // 2. Dedup temprano (barato) — si ya está, nada que hacer
  const { data: existing } = await sb
    .from('runs')
    .select('id')
    .eq('user_id', conn.user_id)
    .eq('source', 'strava')
    .eq('strava_activity_id', activityId)
    .limit(1);
  if (existing && existing.length > 0) { console.log('[strava-webhook] ya importada:', activityId); return; }

  // 3. Token fresco + fetch de la actividad REAL (los eventos son pistas)
  const fresh = await refreshTokenIfNeeded(sb, conn);
  if (!fresh) return;
  const actRes = await fetch(`${STRAVA_API}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${fresh.access_token}` },
  });
  if (!actRes.ok) { console.log('[strava-webhook] activity fetch', actRes.status, activityId); return; }
  const activity = await actRes.json();

  // 4. Solo a pie
  if (!(ALLOWED.has(activity.sport_type || '') || ALLOWED.has(activity.type || ''))) {
    console.log('[strava-webhook] tipo no importable:', activity.sport_type || activity.type);
    return;
  }

  // 5. Insert (dedup fino: el índice único parcial protege contra carreras
  //    concurrentes con el import client-side)
  const row = mapActivityToRun(activity, conn.user_id);
  const { data: inserted, error: insErr } = await sb.from('runs').insert(row).select('id').single();
  if (insErr) { console.log('[strava-webhook] insert skip/err:', insErr.message); return; }
  console.log('[strava-webhook] run importada', inserted.id, row.distancia_km + 'km', 'user', conn.user_id);

  // 6. Mensajes in-app de José y Ana — dedup diario CONTRA LA PROPIA TABLA
  //    (cubre también los que insertó el cliente hoy por otra run)
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const { count: joseToday } = await sb
    .from('coach_chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', conn.user_id)
    .eq('is_proactive', true)
    .gte('created_at', todayStart.toISOString());
  let joseSpoke = false;
  if (!joseToday || joseToday === 0) {
    const { error } = await sb.from('coach_chat_messages').insert({
      user_id: conn.user_id, role: 'assistant', content: joseInAppContent(row), is_proactive: true,
    });
    joseSpoke = !error;
  }
  const { count: anaToday } = await sb
    .from('maria_chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', conn.user_id)
    .eq('is_proactive', true)
    .gte('created_at', todayStart.toISOString());
  if (!anaToday || anaToday === 0) {
    await sb.from('maria_chat_messages').insert({
      user_id: conn.user_id, role: 'assistant', content: anaInAppContent(row), is_proactive: true,
    });
  }

  // 7. Push remota de José (solo si José "habló" hoy por primera vez —
  //    mismo criterio 1/día que el resto del sistema)
  if (joseSpoke) {
    const { data: prof } = await sb
      .from('profiles')
      .select('push_token')
      .eq('id', conn.user_id)
      .single();
    if (prof?.push_token) {
      const { title, body } = josePushText(row);
      const ok = await sendExpoPush(prof.push_token, title, body, {
        type: 'post_workout_jose', runId: inserted.id,
      });
      console.log('[strava-webhook] push José:', ok ? 'enviada' : 'falló');
    } else {
      console.log('[strava-webhook] user sin push_token');
    }
  }
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
  const work = (async () => {
    try {
      if (event.object_type !== 'activity') return; // athlete deauth etc. → ignorar (v1)
      if (event.aspect_type !== 'create' && event.aspect_type !== 'update') return;
      const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      await processActivityEvent(supabase, event.owner_id, event.object_id);
    } catch (e) {
      console.error('[strava-webhook] processing error:', e?.message || e);
    }
  })();
  waitUntil(work);
  return res.status(200).json({ received: true });
}
