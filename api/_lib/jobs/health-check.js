// Job: health-check — "latido diario" de la app
//
// Sentry solo ve crashes. Este job caza los fallos SILENCIOSOS: el registro
// roto, la creación de planes que falla por un cambio de BD, el cron de
// partner quedadas parado, la web caída. Nada de eso crashea la app — solo
// hace que los números caigan a cero.
//
// Comprueba las señales vitales de AYER (UTC) y compara con la media 7d:
//   1. Registros nuevos (excluye cuentas internas del founder)
//   2. Eventos de analytics (pulso general de la app)
//   3. Planes creados / apuntes a quedadas / compras (informativo)
//   4. Quedadas futuras en BD (si 0 → rotate_partner_quedadas roto)
//   5. Web home responde 200
//
// Solo envía email si hay algo EN ROJO (alerts.length > 0). El resto de
// días es silencioso — el JSON queda disponible para consulta manual:
//   /api/cron/run?job=health-check&token=CRON_SECRET
// Test de email sin alerta real: &test=1
//
// Cron: daily 08:45 UTC (antes de la tanda de crons de las 09:00).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const ALERT_TO = { email: 'correrjuntosapp@gmail.com', name: 'Abraham' };
const SENDER = { email: 'abraham.marquez@correrjuntos.com', name: 'CorrerJuntos · Latido' };

// Cuentas internas — nunca cuentan como actividad real
const INTERNAL = ['guetto2012', 'mundodefabulas11', 'review@', 'cloudtestlab', '@partners.correrjuntos.app', '@correrjuntos.com'];
const isInternal = (email) => INTERNAL.some((p) => (email || '').toLowerCase().includes(p));

function dayRangeUTC(daysAgo) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - (daysAgo - 1));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function countRange(sb, table, tsCol, start, end) {
  const { count, error } = await sb
    .from(table)
    .select('*', { count: 'exact', head: true })
    .gte(tsCol, start)
    .lt(tsCol, end);
  if (error) return { n: null, error: error.message };
  return { n: count ?? 0 };
}

export default async function runHealthCheck(req, res, env) {
  const sb = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const qp = (k) => {
    if (req?.query?.[k]) return req.query[k];
    try { return new URL(req.url, 'http://x').searchParams.get(k); } catch { return null; }
  };
  const forceEmail = qp('test') === '1';

  const yday = dayRangeUTC(1);
  const week = { start: dayRangeUTC(8).start, end: yday.start }; // 7 días previos a ayer

  const alerts = [];
  const metrics = {};

  // 1. Registros ayer (filtrando cuentas internas) + media 7d
  const { data: signupsRaw, error: sErr } = await sb
    .from('profiles').select('email')
    .gte('created_at', yday.start).lt('created_at', yday.end);
  const { data: signupsWeekRaw } = await sb
    .from('profiles').select('email')
    .gte('created_at', week.start).lt('created_at', week.end);
  if (sErr) {
    alerts.push(`No se pudo leer profiles: ${sErr.message}`);
  } else {
    const signups = (signupsRaw || []).filter((r) => !isInternal(r.email)).length;
    const weekAvg = ((signupsWeekRaw || []).filter((r) => !isInternal(r.email)).length) / 7;
    metrics.registros_ayer = signups;
    metrics.registros_media_7d = Math.round(weekAvg * 10) / 10;
    if (signups === 0) alerts.push('CERO registros ayer (media 7d: ' + metrics.registros_media_7d + '/día). ¿Signup roto?');
    else if (weekAvg >= 4 && signups < weekAvg * 0.25) alerts.push(`Registros desplomados: ${signups} ayer vs media ${metrics.registros_media_7d}/día.`);
  }

  // 2. Pulso de la app: eventos analytics ayer
  const ev = await countRange(sb, 'analytics_events', 'event_ts', yday.start, yday.end);
  metrics.eventos_app_ayer = ev.n;
  if (ev.error) alerts.push(`No se pudo leer analytics_events: ${ev.error}`);
  else if (ev.n === 0) alerts.push('CERO eventos de analytics ayer. ¿App o pipeline de eventos roto?');

  // 3. Informativo: planes, apuntes a quedadas, compras
  const plans = await countRange(sb, 'user_plans', 'created_at', yday.start, yday.end);
  metrics.planes_creados_ayer = plans.n;
  const joins = await countRange(sb, 'participantes', 'created_at', yday.start, yday.end);
  metrics.apuntes_quedadas_ayer = joins.n;
  const { data: purch } = await sb
    .from('analytics_events').select('event_name')
    .ilike('event_name', 'purchase%')
    .gte('event_ts', yday.start).lt('event_ts', yday.end);
  metrics.compras_ok_ayer = (purch || []).filter((e) => !/fail|cancel/i.test(e.event_name)).length;
  metrics.compras_fallidas_ayer = (purch || []).filter((e) => /fail|cancel/i.test(e.event_name)).length;

  // 4. Quedadas futuras — si 0, el cron rotate_partner_quedadas está roto
  const { count: futureQ, error: qErr } = await sb
    .from('quedadas').select('*', { count: 'exact', head: true })
    .gte('fecha_hora', new Date().toISOString());
  metrics.quedadas_futuras = qErr ? null : (futureQ ?? 0);
  if (qErr) alerts.push(`No se pudo leer quedadas: ${qErr.message}`);
  else if ((futureQ ?? 0) === 0) alerts.push('CERO quedadas futuras en BD. ¿rotate_partner_quedadas roto?');

  // 5. Web viva
  try {
    const web = await fetch('https://www.correrjuntos.com/', { redirect: 'follow' });
    metrics.web_status = web.status;
    if (web.status !== 200) alerts.push(`La web devuelve ${web.status} en lugar de 200.`);
  } catch (e) {
    metrics.web_status = 0;
    alerts.push(`La web no responde: ${(e?.message || '').slice(0, 120)}`);
  }

  // 6. Embudo de revenue (ventana 7d) — caza fallos silenciosos de
  //    monetización. [8 jul 2026: el bug del enum de trial eligibility
  //    vivió 30+ días con 0 trials sin que nada crashease. Este check lo
  //    habría cantado en 3 días.]
  const d7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const count7 = async (name) => {
    const { count } = await sb
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', name).gte('event_ts', d7);
    return count ?? 0;
  };
  const paywall7 = await count7('paywall_opened');
  const guard7 = await count7('purchase_pkg_guard');
  const { count: trials7 } = await sb
    .from('trial_starts')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', d7);
  // purchase_failed sin contar cancelaciones del usuario (esas son normales)
  const { data: pfRows } = await sb
    .from('analytics_events').select('params')
    .eq('event_name', 'purchase_failed').gte('event_ts', d7);
  const pfReal = (pfRows || []).filter((r) => !/cancel/i.test(r.params?.error || '')).length;
  metrics.paywall_7d = paywall7;
  metrics.trials_7d = trials7 ?? 0;
  metrics.compras_fallidas_reales_7d = pfReal;
  if (paywall7 >= 15 && (trials7 ?? 0) === 0) {
    alerts.push(`Embudo trial posiblemente ROTO: ${paywall7} aperturas de paywall en 7 días y 0 trials iniciados. Revisar elegibilidad RevenueCat / ofertas de tienda / trial_starts.`);
  }
  if (pfReal >= 3) {
    alerts.push(`Compras fallando: ${pfReal} purchase_failed reales (sin cancelaciones) en 7 días. Mirar params.error en analytics_events y Sentry.`);
  }
  if (guard7 >= 1) {
    alerts.push(`El guard de compra saltó ${guard7} vez/veces en 7 días (purchase_pkg_guard). Mirar params.rescued y qué pantalla genera paquetes sin presentedOfferingContext.`);
  }

  // 7. Webhook Strava — si normalmente entran runs y llevan 48h a cero
  const d2 = new Date(Date.now() - 2 * 864e5).toISOString();
  const { count: strava48 } = await sb
    .from('runs').select('*', { count: 'exact', head: true })
    .eq('source', 'strava').gte('created_at', d2);
  const { count: strava7w } = await sb
    .from('runs').select('*', { count: 'exact', head: true })
    .eq('source', 'strava').gte('created_at', d7);
  metrics.runs_strava_48h = strava48 ?? 0;
  if ((strava48 ?? 0) === 0 && (strava7w ?? 0) >= 5) {
    alerts.push(`0 runs de Strava en 48h (con ${strava7w} en la semana). ¿Webhook Strava caído? Revisar api/strava-webhook y la suscripción 360173.`);
  }

  // Email solo si hay rojo (o test=1)
  let emailed = false;
  if (alerts.length > 0 || forceEmail) {
    const fecha = yday.start.slice(0, 10);
    const rows = Object.entries(metrics)
      .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#94a3b8;font-size:14px;">${k.replace(/_/g, ' ')}</td><td style="padding:6px 0;color:#f6f1e8;font-size:14px;font-weight:600;">${v ?? '—'}</td></tr>`)
      .join('');
    const alertList = alerts.length
      ? alerts.map((a) => `<li style="margin-bottom:8px;color:#fca5a5;font-size:15px;line-height:1.5;">${a}</li>`).join('')
      : '<li style="color:#86efac;font-size:15px;">Todo en verde (email de prueba).</li>';
    const html = `<!DOCTYPE html><html><body style="margin:0;background:#0b1220;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;padding:40px 16px;">
<div style="max-width:560px;margin:0 auto;background:#0b1220;border:1px solid rgba(246,241,232,0.08);border-radius:20px;padding:36px 40px;">
<div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#f97316;font-family:monospace;margin-bottom:24px;">&bull;&nbsp;&nbsp;Latido diario &middot; ${fecha}</div>
<h1 style="margin:0 0 24px;font-size:32px;font-weight:200;color:#f6f1e8;letter-spacing:-0.03em;">${alerts.length} señal${alerts.length === 1 ? '' : 'es'} en <strong style="font-weight:700;color:${alerts.length ? '#ef4444' : '#22c55e'};">${alerts.length ? 'rojo' : 'verde'}</strong></h1>
<ul style="margin:0 0 28px;padding-left:18px;">${alertList}</ul>
<div style="border-top:1px solid rgba(246,241,232,0.12);padding-top:20px;">
<div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(246,241,232,0.42);font-family:monospace;margin-bottom:12px;">Señales vitales de ayer</div>
<table style="border-collapse:collapse;">${rows}</table>
</div>
<div style="margin-top:28px;font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#f6f1e8;">Correr<em style="font-style:normal;color:#f97316;">Juntos</em></div>
</div></body></html>`;

    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: SENDER,
        to: [ALERT_TO],
        subject: alerts.length
          ? `⚠️ CorrerJuntos: ${alerts.length} señal${alerts.length === 1 ? '' : 'es'} en rojo (${fecha})`
          : `✅ CorrerJuntos: latido de prueba OK (${fecha})`,
        htmlContent: html,
        tags: ['health-check'],
      }),
    });
    emailed = resp.ok;
  }

  return res.status(200).json({ ok: true, date: yday.start.slice(0, 10), alerts, metrics, emailed });
}
