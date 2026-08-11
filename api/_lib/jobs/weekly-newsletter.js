// ============================================================
// Job: weekly-newsletter
// Envía "el artículo de la semana" (curado) a la lista Brevo los lunes.
// Cron lunes 08:00 UTC. SOLO envía si hay un pick status='ready' sin enviar.
//
// Seguridad / curado:
//   - status='draft' → NO envía (default al crear el pick)
//   - status='ready' → el cron del lunes lo envía y lo marca 'sent'
//   - status='sending' → envío en curso o interrumpido. El cron NUNCA reenvía:
//                        consulta Brevo y solo sincroniza si confirma 'sent'.
//   - ?test=email@x  → manda un TEST solo a ese email (cualquier status,
//                      NO marca enviado, NO toca la lista). Para aprobar antes.
//
// Tabla: public.weekly_newsletter (week_of, title, url, excerpt, image_url,
//        cta_label, status, sent_at, recipients, brevo_campaign_id)
//   + columnas opcionales (migración 2026-08-02, todas nullable):
//        subject       → asunto distinto del H1 del email
//        preheader     → texto de vista previa en la bandeja
//        promo_label   → etiqueta tipo "PUBLICIDAD"
//        disclosure    → aviso legal al pie
//        utm_campaign  → sustituye al valor fijo 'weekly'
//        promo (jsonb) → bloque promocional {title,text,code,cta_label,url,note}
//        blocks (jsonb)→ bloques editoriales {version:1,items:[{type,...}]}
//                        tipos: training | coach | race | tool. Sin HTML libre.
//        campaign_name → nombre de la campana en Brevo (si NULL, autogenerado)
//     Los picks antiguos siguen funcionando sin necesitar los campos nuevos y
//     mantienen la misma estructura visual y comportamiento de envío. Cambios
//     conocidos desde el parche: se añade utm_content=article, la imagen recibe
//     alt y todos los campos se escapan.
// Lista Brevo: BREVO_LIST_ID (default 3) — los suscriptores del blog.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { mondayOfWeekMadrid, isSendWindowMadrid } from '../newsletter-selection.js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const BREVO = 'https://api.brevo.com/v3';

// Escapa texto que viene de la BD antes de meterlo en el HTML del email.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Tipos admitidos y su utm_content. El utm_content se DERIVA del tipo:
// nunca se acepta un valor arbitrario venido de la base de datos.
const BLOCK_TYPES = {
  training: { utm: 'training' },
  coach: { utm: 'article' },
  race: { utm: 'race' },
  tool: { utm: 'tool' },
};

// Solo http(s). Cualquier otro esquema (javascript:, data:...) se descarta.
function safeUrl(u) {
  if (typeof u !== 'string') return null;
  try {
    const p = new URL(u);
    return (p.protocol === 'https:' || p.protocol === 'http:') ? u : null;
  } catch (e) { return null; }
}

function withUtm(url, campaign, content) {
  return url + (url.includes('?') ? '&' : '?')
    + 'utm_source=newsletter&utm_medium=email&utm_campaign=' + encodeURIComponent(campaign)
    + '&utm_content=' + encodeURIComponent(content);
}

// Renderiza los bloques editoriales. Estructura esperada:
//   { version: 1, items: [ {type, ...}, ... ] }
// Un bloque desconocido o incompleto se ignora en silencio: el email sale igual.
// Nada de HTML libre: todo texto pasa por esc().
function renderBlocks(blocks, campaign) {
  if (!blocks || typeof blocks !== 'object' || Array.isArray(blocks)) return '';
  if (blocks.version !== 1 || !Array.isArray(blocks.items)) return '';

  const S_TITLE = 'margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fb923c';
  const S_TEXT = 'margin:0 0 10px;font-size:15px;line-height:1.65;color:rgba(246,241,232,.78)';
  const S_LI = 'font-size:15px;line-height:1.6;color:rgba(246,241,232,.78);margin-bottom:5px';
  const S_META = 'margin:0 0 10px;font-size:13px;line-height:1.5;color:rgba(246,241,232,.5)';
  const S_LINK = 'color:#fb923c;font-size:15px;font-weight:700;text-decoration:underline';

  const out = [];
  for (const b of blocks.items) {
    if (!b || typeof b !== 'object' || Array.isArray(b)) continue;
    const spec = BLOCK_TYPES[b.type];
    if (!spec) continue;

    const title = typeof b.title === 'string' ? b.title.trim() : '';
    const text = typeof b.text === 'string' ? b.text.trim() : '';
    const meta = typeof b.meta === 'string' ? b.meta.trim() : '';
    const url = safeUrl(b.url);
    const linkText = typeof b.link_text === 'string' ? b.link_text.trim() : '';
    const items = Array.isArray(b.items)
      ? b.items.filter(function (x) { return typeof x === 'string' && x.trim(); }).map(function (x) { return x.trim(); })
      : [];

    // Un bloque sin nada que mostrar no se pinta.
    if (!title && !text && !items.length && !url) continue;

    let html = '';
    if (title) html += '<p style="' + S_TITLE + '">' + esc(title) + '</p>';
    if (text) html += '<p style="' + S_TEXT + '">' + esc(text) + '</p>';
    if (items.length) {
      html += '<ul style="margin:0 0 10px;padding-left:20px">';
      for (const it of items) html += '<li style="' + S_LI + '">' + esc(it) + '</li>';
      html += '</ul>';
    }
    if (meta) html += '<p style="' + S_META + '">' + esc(meta) + '</p>';
    if (url) {
      html += '<p style="margin:0"><a href="' + esc(withUtm(url, campaign, spec.utm))
        + '" style="' + S_LINK + '">' + esc(linkText || 'Ver más') + ' &rarr;</a></p>';
    }

    out.push('<tr><td style="padding:0 8px 26px">' + html + '</td></tr>');
  }
  return out.join('');
}

function buildEmailHtml(pick) {
  // Campos opcionales: si son null, el pick antiguo mantiene la misma
  // estructura visual y comportamiento de envío.
  const campaign = pick.utm_campaign || 'weekly';
  const url = pick.url + (pick.url.includes('?') ? '&' : '?')
    + 'utm_source=newsletter&utm_medium=email&utm_campaign=' + encodeURIComponent(campaign)
    + '&utm_content=article';
  // Valores seguros para atributos HTML (href/src).
  const urlAttr = esc(url);
  const imgAttr = esc(pick.image_url);

  const preheader = pick.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(pick.preheader)}</div>`
      + `<div style="display:none;max-height:0;overflow:hidden">&#8199;&#65279;&nbsp;</div>`
    : '';

  const promoLabel = pick.promo_label
    ? `<tr><td style="padding:0 8px 12px"><span style="display:inline-block;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#0b1220;background:#fb923c;border-radius:999px;padding:5px 12px">${esc(pick.promo_label)}</span></td></tr>`
    : '';

  // Bloque promocional opcional (código + CTA de afiliado).
  let promoBlock = '';
  const p = pick.promo;
  if (p && p.title) {
    const purl = esc(p.url || '');
    promoBlock = `<tr><td style="padding:0 8px 26px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.28);border-radius:14px">
      <tr><td style="padding:20px">
        <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#f6f1e8">${esc(p.title)}</p>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:rgba(246,241,232,.75)">${esc(p.text || '')}</p>
        ${p.code ? `<p style="margin:0 0 14px"><span style="display:inline-block;font:800 17px/1.2 Consolas,monospace;letter-spacing:.06em;color:#0b1220;background:#fb923c;border-radius:8px;padding:9px 16px">${esc(p.code)}</span></p>` : ''}
        ${purl ? `<p style="margin:0 0 8px"><a href="${purl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 22px;border-radius:9px">${esc(p.cta_label || 'Ver oferta')}</a></p>` : ''}
        ${p.note ? `<p style="margin:0;font-size:11px;color:rgba(246,241,232,.5)">${esc(p.note)}</p>` : ''}
      </td></tr>
    </table>
  </td></tr>`;
  }

  // Bloques editoriales opcionales (NULL en picks antiguos -> cadena vacia).
  const editorialBlocks = renderBlocks(pick.blocks, campaign);

  // El eyebrow se DERIVA de si hay bloques renderizables. Sin columna nueva:
  // con blocks validos -> "CorrerJuntos Semanal"; si no, el texto de siempre,
  // asi los picks antiguos no cambian visualmente.
  const eyebrow = editorialBlocks ? "CorrerJuntos Semanal" : "El artículo del lunes";

  const disclosure = pick.disclosure
    ? `<tr><td style="padding:0 8px 18px"><p style="margin:0;font-size:12px;line-height:1.6;color:rgba(246,241,232,.55)">${esc(pick.disclosure)}</p></td></tr>`
    : '';
  const img = pick.image_url
    ? `<tr><td style="padding:0"><a href="${urlAttr}"><img src="${imgAttr}" width="600" alt="${esc(pick.title)}" style="width:100%;max-width:600px;height:auto;display:block;border-radius:14px"></a></td></tr><tr><td style="height:22px"></td></tr>`
    : '';
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#0b1220;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0b1220">
  <tr><td style="padding:0 8px 24px">
    <span style="font-size:22px;font-weight:800;color:#f6f1e8;letter-spacing:-.02em">Correr<span style="color:#f97316">Juntos</span></span>
  </td></tr>
  ${promoLabel}
  <tr><td style="padding:0 8px 8px">
    <div style="font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#fb923c">${esc(eyebrow)}</div>
  </td></tr>
  <tr><td style="padding:0 8px 18px">
    <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:800;color:#f6f1e8;letter-spacing:-.02em">${esc(pick.title)}</h1>
  </td></tr>
  ${img ? '<tr><td style="padding:0 8px">' + img.replace(/<\/?tr>|<\/?td[^>]*>/g, '') + '</td></tr>' : ''}
  <tr><td style="padding:0 8px 22px">
    <p style="margin:0;font-size:15px;line-height:1.65;color:rgba(246,241,232,.75)">${esc(pick.excerpt || '')}</p>
  </td></tr>
  <tr><td style="padding:0 8px 32px">
    <a href="${urlAttr}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 30px;border-radius:10px">${esc(pick.cta_label || 'Leer el artículo')} &rarr;</a>
  </td></tr>
  ${editorialBlocks}
  ${promoBlock}
  ${disclosure}
  <tr><td style="padding:20px 8px 0;border-top:1px solid rgba(246,241,232,.12)">
    <p style="margin:0 0 6px;font-size:12px;color:rgba(246,241,232,.5)">Lo recibes porque te suscribiste en correrjuntos.com. Un email a la semana, sin spam.</p>
    <p style="margin:0;font-size:12px;color:rgba(246,241,232,.42)"><a href="{{ unsubscribe }}" style="color:#fb923c;text-decoration:underline">Darte de baja</a> &middot; CorrerJuntos &middot; Huelva, España</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

async function brevo(path, env, method, body) {
  const r = await fetch(BREVO + path, {
    method,
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': env.BREVO_API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  let json; try { json = txt ? JSON.parse(txt) : {}; } catch { json = { raw: txt }; }
  return { ok: r.ok, status: r.status, json };
}

// Códigos internos que pueden acabar en weekly_newsletter.last_error.
// SOLO estos valores: nunca respuestas de Brevo, payloads, secretos ni stack traces.
const ERR_CODES = {
  SEND_FAILED: 'send_failed',                      // sendNow falló tras persistir 'sending'
  SENT_UPDATE_FAILED: 'sent_update_failed',        // envío hecho, no se pudo marcar 'sent'
  MANUAL_RECOVERY: 'manual_recovery_required',     // pick en 'sending' que exige revisión humana
  RECOVERY_UNKNOWN: 'manual_recovery_unknown_state', // Brevo devolvió un estado no contemplado
  RECOVERY_UNAVAILABLE: 'recovery_status_unavailable', // no se pudo consultar la campaña
};

// Marca la fila sin romper el flujo si la escritura falla: es telemetría, no control.
async function noteError(supabase, id, code) {
  try {
    await supabase.from('weekly_newsletter').update({ last_error: code }).eq('id', id);
  } catch (e) { /* la respuesta HTTP ya lleva el código */ }
}

// Confirma que Supabase escribió de verdad: sin fila devuelta, no hay confirmación.
async function updatePick(supabase, id, patch) {
  const { data, error } = await supabase
    .from('weekly_newsletter').update(patch).eq('id', id).select('id');
  return { ok: !error && Array.isArray(data) && data.length === 1, error };
}

// Un pick en 'sending' significa que ya se pudo haber enviado. NUNCA se llama a
// sendNow desde aquí: solo se consulta Brevo y, si confirma 'sent' de forma
// inequívoca, se sincroniza la base de datos. Cualquier otro caso se detiene
// y queda para revisión manual. Preferimos no duplicar antes que garantizar el envío.
async function recoverSendingPick(supabase, pick, res, env) {
  const campaignId = pick.brevo_campaign_id;

  if (!campaignId) {
    await noteError(supabase, pick.id, ERR_CODES.MANUAL_RECOVERY);
    return res.status(409).json({
      ok: false, mode: 'recovery', sent: 0, error: ERR_CODES.MANUAL_RECOVERY,
      reason: 'sending_without_campaign_id', week_of: pick.week_of,
    });
  }

  const got = await brevo(`/emailCampaigns/${campaignId}`, env, 'GET');
  if (!got.ok) {
    await noteError(supabase, pick.id, ERR_CODES.RECOVERY_UNAVAILABLE);
    return res.status(502).json({
      ok: false, mode: 'recovery', sent: 0, error: ERR_CODES.RECOVERY_UNAVAILABLE,
      campaign_id: campaignId, week_of: pick.week_of,
    });
  }

  const brevoStatus = typeof got.json?.status === 'string' ? got.json.status.slice(0, 32) : null;

  // Único caso que cierra el ciclo: Brevo dice, literalmente, 'sent'.
  if (brevoStatus === 'sent') {
    const sentAt = typeof got.json?.sentDate === 'string' ? got.json.sentDate : new Date().toISOString();
    const upd = await updatePick(supabase, pick.id, {
      status: 'sent', sent_at: sentAt, brevo_campaign_id: campaignId, last_error: null,
    });
    if (!upd.ok) {
      return res.status(500).json({
        ok: false, mode: 'recovery', sent: 0, error: ERR_CODES.SENT_UPDATE_FAILED,
        campaign_id: campaignId, week_of: pick.week_of,
      });
    }
    return res.status(200).json({
      ok: true, mode: 'recovery', sent: 0, synced: true, campaign_id: campaignId,
      brevo_status: brevoStatus, week_of: pick.week_of,
    });
  }

  // 'draft': la campaña existe y NO consta enviada. Aun así no se reenvía ni se
  // reutiliza automáticamente — no hay forma de descartar un envío parcial previo.
  const code = brevoStatus === 'draft' ? ERR_CODES.MANUAL_RECOVERY : ERR_CODES.RECOVERY_UNKNOWN;
  await noteError(supabase, pick.id, code);
  return res.status(409).json({
    ok: false, mode: 'recovery', sent: 0, error: code,
    campaign_id: campaignId, brevo_status: brevoStatus, week_of: pick.week_of,
  });
}

// Reutilizados por weekly-newsletter-prepare y -preflight. Export aditivo:
// no cambia el comportamiento de este job ni la firma del handler.
export { buildEmailHtml, brevo };

export default async function runWeeklyNewsletter(req, res, env, deps = {}) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const testEmail = (req.query?.test || '').trim();
  const isTest = testEmail.length > 3 && testEmail.includes('@');
  const listId = parseInt(process.env.BREVO_LIST_ID || '3', 10);
  const now = deps.now || new Date();

  // Interruptor global: apaga la automatizacion sin tocar codigo ni borrar cron.
  // Fail-closed: solo un si explicito activa el envio automatico. Ausente,
  // vacio o cualquier valor desconocido = apagado.
  const autoFlag = (env.WEEKLY_NEWSLETTER_AUTOMATION_ENABLED != null ? String(env.WEEKLY_NEWSLETTER_AUTOMATION_ENABLED) : '').trim().toLowerCase();
  const autoOn = autoFlag === 'true' || autoFlag === '1' || autoFlag === 'on' || autoFlag === 'yes';
  if (!isTest && !autoOn) {
    return res.status(200).json({ ok: true, sent: 0, outcome: 'automation_disabled' });
  }

  // Ventana de envio: lunes 10:00-10:15 en Europe/Madrid. Hay dos disparos cron
  // (08:00 y 09:00 UTC) porque el desfase cambia entre CET y CEST; solo el que
  // cae dentro de la ventana local continua. El otro sale por aqui.
  if (!isTest && !isSendWindowMadrid(now)) {
    return res.status(200).json({ ok: true, sent: 0, outcome: 'outside_send_window' });
  }

  // Lunes de la semana en curso en calendario de Madrid. En live solo se envia
  // el pick de ESTA semana: un 'ready' olvidado de otra semana nunca sale solo.
  const mondayOfThisWeek = mondayOfWeekMadrid(now);

  // Pick: en test, el último pendiente (cualquier status). En live, el de ESTA
  // semana en 'ready' (envío normal) o en 'sending' (recuperación fail-closed).
  let q = supabase.from('weekly_newsletter').select('*').is('sent_at', null).order('week_of', { ascending: false }).limit(1);
  if (!isTest) q = q.in('status', ['ready', 'sending']).eq('week_of', mondayOfThisWeek);
  const { data: rows, error } = await q;
  // Sin mensaje de Supabase: puede llevar nombres de columnas o fragmentos SQL.
  if (error) return res.status(500).json({ error: 'query_failed' });

  let pick = rows && rows[0];
  if (!pick && !isTest) {
    // Distinguir "no hay nada" de "alguien lo paro a proposito".
    const { data: held } = await supabase.from('weekly_newsletter')
      .select('status').eq('week_of', mondayOfThisWeek)
      .in('status', ['paused', 'cancelled']).limit(1);
    if (held && held.length) {
      return res.status(200).json({ ok: true, sent: 0, outcome: 'skipped_paused', status: held[0].status, week_of: mondayOfThisWeek });
    }
  }
  if (!pick) {
    return res.status(200).json({
      ok: true, sent: 0,
      outcome: isTest ? 'no_pick_pending' : 'skipped_no_pick',
      reason: isTest ? 'no_pick_pending' : 'no_ready_pick_this_week',
    });
  }

  // Un pick en 'sending' nunca vuelve a enviarse: solo se consulta y se sincroniza.
  // Se comprueba ANTES de crear nada en Brevo, para no duplicar la campaña.
  if (!isTest && pick.status === 'sending') {
    return recoverSendingPick(supabase, pick, res, env);
  }

  // Asunto opcional e independiente del H1. Si es null usa el título.
  const subject = pick.subject || pick.title;
  const htmlContent = buildEmailHtml(pick);
  const sender = { email: env.BREVO_SENDER_EMAIL || 'abraham.marquez@correrjuntos.com', name: env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos' };

  // 1) Crear campaña (draft)
  const created = await brevo('/emailCampaigns', env, 'POST', {
    // Nombre en Brevo: el del pick si existe; si es NULL, el autogenerado.
    name: (pick.campaign_name || `Weekly · ${pick.week_of} · ${pick.title}`).slice(0, 90),
    subject,
    sender,
    htmlContent,
    recipients: { listIds: [listId] },
    inlineImageActivation: false,
  });
  if (!created.ok || !created.json?.id) {
    return res.status(500).json({ error: 'campaign_create_failed', http_status: created.status });
  }
  const campaignId = created.json.id;

  // 2a) TEST: enviar solo al email indicado, no marcar enviado
  if (isTest) {
    const test = await brevo(`/emailCampaigns/${campaignId}/sendTest`, env, 'POST', { emailTo: [testEmail] });
    return res.status(test.ok ? 200 : 500).json({
      ok: test.ok, mode: 'test', test_to: testEmail, campaign_id: campaignId,
      pick: { week_of: pick.week_of, status: pick.status, title: pick.title },
      http_status: test.ok ? undefined : test.status,
    });
  }

  // 2b) LIVE. Orden deliberado: primero se deja constancia de que vamos a enviar
  // y solo después se envía. Si el proceso muere entre medias, el pick queda en
  // 'sending' con su campaign_id y la siguiente ejecución NO reenvía.
  // La toma del pick es atómica: el UPDATE solo prospera si la fila SIGUE
  // exactamente como la leímos. Si dos ejecuciones concurrentes leyeron el mismo
  // 'ready', la segunda actualiza cero filas y no envía. Es la condición de
  // carrera que resuelve la base de datos, no nosotros.
  const { data: claimed, error: claimError } = await supabase
    .from('weekly_newsletter')
    .update({
      status: 'sending', sending_at: new Date().toISOString(),
      brevo_campaign_id: campaignId, last_error: null,
    })
    .eq('id', pick.id)
    .eq('week_of', pick.week_of)
    .eq('status', 'ready')
    .is('sent_at', null)
    .is('brevo_campaign_id', null)
    .select('id');

  // Fallo de escritura: no sabemos si la fila quedó tomada. No se envía.
  if (claimError) {
    return res.status(500).json({
      ok: false, mode: 'live', sent: 0, error: 'sending_state_persist_failed',
      campaign_id: campaignId, week_of: pick.week_of,
    });
  }

  // Cero filas: otra ejecución se lo llevó. La campaña recién creada queda como
  // borrador huérfano en Brevo; NO se borra automáticamente (ver runbook).
  if (!Array.isArray(claimed) || claimed.length !== 1) {
    return res.status(409).json({
      ok: false, mode: 'live', sent: 0, error: 'pick_already_claimed',
      orphan_campaign_id: campaignId, week_of: pick.week_of,
    });
  }

  const sendNow = await brevo(`/emailCampaigns/${campaignId}/sendNow`, env, 'POST', {});
  if (!sendNow.ok) {
    // No se revierte a 'ready': no sabemos si Brevo llegó a encolarlo. Revisión manual.
    await noteError(supabase, pick.id, ERR_CODES.SEND_FAILED);
    return res.status(500).json({
      ok: false, mode: 'live', sent: 0, error: ERR_CODES.SEND_FAILED,
      campaign_id: campaignId, week_of: pick.week_of,
    });
  }

  const done = await updatePick(supabase, pick.id, {
    status: 'sent', sent_at: new Date().toISOString(),
    brevo_campaign_id: campaignId, last_error: null,
  });
  if (!done.ok) {
    // El correo YA salió. Que la fila no lo refleje es un problema de registro,
    // no de envío: se avisa y se deja en 'sending' para que nadie lo reenvíe.
    await noteError(supabase, pick.id, ERR_CODES.SENT_UPDATE_FAILED);
    return res.status(500).json({
      ok: false, mode: 'live', sent: 1, error: ERR_CODES.SENT_UPDATE_FAILED,
      campaign_id: campaignId, week_of: pick.week_of,
    });
  }

  return res.status(200).json({ ok: true, mode: 'live', sent: 1, list_id: listId, campaign_id: campaignId, title: pick.title });
}
