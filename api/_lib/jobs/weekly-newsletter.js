// ============================================================
// Job: weekly-newsletter
// Envía "el artículo de la semana" (curado) a la lista Brevo los lunes.
// Cron lunes 08:00 UTC. SOLO envía si hay un pick status='ready' sin enviar.
//
// Seguridad / curado:
//   - status='draft' → NO envía (default al crear el pick)
//   - status='ready' → el cron del lunes lo envía y lo marca 'sent'
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
//     Los picks antiguos siguen funcionando sin necesitar los campos nuevos y
//     mantienen la misma estructura visual y comportamiento de envío. Cambios
//     conocidos desde el parche: se añade utm_content=article, la imagen recibe
//     alt y todos los campos se escapan.
// Lista Brevo: BREVO_LIST_ID (default 3) — los suscriptores del blog.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const BREVO = 'https://api.brevo.com/v3';

// Escapa texto que viene de la BD antes de meterlo en el HTML del email.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
    <div style="font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#fb923c">El artículo del lunes</div>
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

export default async function runWeeklyNewsletter(req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const testEmail = (req.query?.test || '').trim();
  const isTest = testEmail.length > 3 && testEmail.includes('@');
  const listId = parseInt(process.env.BREVO_LIST_ID || '3', 10);

  // Lunes (UTC) de la semana en curso. En live sólo se envía el pick de ESTA
  // semana: evita que un 'ready' olvidado de una semana anterior salga solo.
  const mondayOfThisWeek = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  })();

  // Pick: en test, el último pick pendiente (cualquier status). En live, solo 'ready'.
  let q = supabase.from('weekly_newsletter').select('*').is('sent_at', null).order('week_of', { ascending: false }).limit(1);
  if (!isTest) q = q.eq('status', 'ready').eq('week_of', mondayOfThisWeek);
  const { data: rows, error } = await q;
  if (error) return res.status(500).json({ error: 'query_failed', msg: error.message });

  const pick = rows && rows[0];
  if (!pick) {
    return res.status(200).json({ ok: true, sent: 0, reason: isTest ? 'no_pick_pending' : 'no_ready_pick_this_week' });
  }

  // Asunto opcional e independiente del H1. Si es null usa el título.
  const subject = pick.subject || pick.title;
  const htmlContent = buildEmailHtml(pick);
  const sender = { email: env.BREVO_SENDER_EMAIL || 'abraham.marquez@correrjuntos.com', name: env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos' };

  // 1) Crear campaña (draft)
  const created = await brevo('/emailCampaigns', env, 'POST', {
    name: `Weekly · ${pick.week_of} · ${pick.title}`.slice(0, 90),
    subject,
    sender,
    htmlContent,
    recipients: { listIds: [listId] },
    inlineImageActivation: false,
  });
  if (!created.ok || !created.json?.id) {
    return res.status(500).json({ error: 'campaign_create_failed', status: created.status, detail: created.json });
  }
  const campaignId = created.json.id;

  // 2a) TEST: enviar solo al email indicado, no marcar enviado
  if (isTest) {
    const test = await brevo(`/emailCampaigns/${campaignId}/sendTest`, env, 'POST', { emailTo: [testEmail] });
    return res.status(test.ok ? 200 : 500).json({
      ok: test.ok, mode: 'test', test_to: testEmail, campaign_id: campaignId,
      pick: { week_of: pick.week_of, status: pick.status, title: pick.title },
      detail: test.ok ? undefined : test.json,
    });
  }

  // 2b) LIVE: enviar ya a la lista + marcar enviado
  const sendNow = await brevo(`/emailCampaigns/${campaignId}/sendNow`, env, 'POST', {});
  if (!sendNow.ok) {
    return res.status(500).json({ error: 'send_failed', campaign_id: campaignId, detail: sendNow.json });
  }
  await supabase.from('weekly_newsletter')
    .update({ status: 'sent', sent_at: new Date().toISOString(), brevo_campaign_id: campaignId })
    .eq('id', pick.id);

  return res.status(200).json({ ok: true, mode: 'live', sent: 1, list_id: listId, campaign_id: campaignId, title: pick.title });
}
