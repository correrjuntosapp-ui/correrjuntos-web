// Job: premium-expiry
// Secuencia "tu Premium termina" para la cohorte regalo "primeros 1.000"
// (779 perfiles con premium_until = 2026-07-04, gifteados el 4 jun).
//
// Etapas (ventanas relativas a premium_until, con margen por el cap Brevo):
//   d7 → days_to_expiry 4..8   (26-30 jun)  email
//   d2 → days_to_expiry 1..3   (1-3 jul)    email + push
//   d0 → days_to_expiry -3..0  (4-7 jul)    email + push (copy hoy/terminó)
//
// Brevo gratis = 300 emails/día → presupuesto diario EMAIL_BUDGET (280,
// override ?budget=N). Prioridad d0 > d2 > d7; el resto queda pendiente y
// sale al día siguiente (dedup vía premium_expiry_log user+stage+channel).
// Push no tiene cap (Expo).
//
// Cron: daily 09:15 UTC (vercel.json). Fuera de ventana = no-op seguro.
// Test:    /api/cron/run?job=premium-expiry&test=EMAIL&stage=d7|d2|d0
// Dry-run: /api/cron/run?job=premium-expiry&dry=1  (cuenta, no envía)
//
// Excluye: seeds (es_seed), cuentas partner (@partners.correrjuntos.app),
// notif_email=false. Si el user compra (RC mueve premium_until a 2027) sale
// solo de la cohorte → no se le molesta.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const APP_URL = 'https://www.correrjuntos.com/app';
const EMAIL_BUDGET_DEFAULT = 280;

// ── Meridian Motion (dark) — mismo sistema que founder-blast ──
const ORANGE = '#f97316', BG = '#0b1220', TEXT = '#f6f1e8';
const TEXT_72 = 'rgba(246,241,232,0.72)', TEXT_42 = 'rgba(246,241,232,0.42)', TEXT_28 = 'rgba(246,241,232,0.28)';
const BORDER_08 = 'rgba(246,241,232,0.08)', BORDER_12 = 'rgba(246,241,232,0.12)';
const FONT_BODY = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_MONO = "'JetBrains Mono',SFMono-Regular,Consolas,Menlo,monospace";

const sc = (t) => `<strong style="color:${TEXT};font-weight:600;">${t}</strong>`;
const para = (t) => `<p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${t}</p>`;
const lead = (t) => `<p style="margin:0 0 22px 0;font-size:15.5px;line-height:1.65;color:${TEXT_72};font-weight:400;">${t}</p>`;
const paraLast = (t) => `<p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${t}</p>`;
const list = (items) => `<ul style="margin:0 0 22px 0;padding-left:18px;font-size:14.5px;line-height:1.85;color:${TEXT_72};font-weight:400;">${items.map((i) => `<li style="margin-bottom:6px;">${i}</li>`).join('')}</ul>`;
const callout = (label, b) => `<div style="margin:6px 0 22px 0;padding:18px 20px;background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.16);border-radius:10px;"><div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${ORANGE};font-weight:500;margin-bottom:8px;">${label}</div><div style="font-size:14.5px;line-height:1.65;color:${TEXT_72};">${b}</div></div>`;

function shell({ eyebrow, h1Pre, h1Strong, h1Post, preheader, body, ctaLabel, ctaRef }) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>CorrerJuntos</title></head><body style="margin:0;padding:0;background:${BG};font-family:${FONT_BODY};color:${TEXT};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:48px 16px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${BG};border:1px solid ${BORDER_08};border-radius:20px;overflow:hidden;">
<tr><td style="padding:36px 44px 0 44px;"><span style="display:inline-block;width:10px;height:10px;background:${ORANGE};border-radius:999px;"></span></td></tr>
<tr><td style="padding:14px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:500;"><span style="color:${ORANGE};">&bull;</span>&nbsp;&nbsp;${eyebrow}</div></td></tr>
<tr><td style="padding:30px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${ORANGE};font-weight:500;"><span style="display:inline-block;width:36px;height:1px;background:${ORANGE};vertical-align:middle;margin-right:12px;"></span>CORRE ACOMPA&Ntilde;ADO</div></td></tr>
<tr><td style="padding:30px 44px 0 44px;"><h1 style="margin:0;font-family:${FONT_BODY};font-size:42px;line-height:1.0;letter-spacing:-0.035em;font-weight:200;color:${TEXT};">${h1Pre} <strong style="font-weight:700;color:${ORANGE};font-style:normal;">${h1Strong}</strong>${h1Post || '.'}</h1></td></tr>
<tr><td style="padding:28px 44px 0 44px;">${body}</td></tr>
<tr><td style="padding:36px 44px 0 44px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${ORANGE}" style="border-radius:10px;"><a href="${APP_URL}?ref=${ctaRef}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${FONT_BODY};font-size:15px;font-weight:600;color:${BG};text-decoration:none;border-radius:10px;letter-spacing:0.01em;">${ctaLabel}</a></td></tr></table></td></tr>
<tr><td style="padding:30px 44px 34px 44px;"><div style="border-top:1px solid ${BORDER_12};padding-top:26px;"><div style="font-family:${FONT_BODY};font-size:26px;font-weight:800;letter-spacing:-0.03em;color:${TEXT};line-height:1;">Correr<em style="font-style:normal;color:${ORANGE};">Juntos</em></div><div style="margin-top:8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;color:${ORANGE};"><a href="mailto:hola@correrjuntos.com" style="color:${ORANGE};text-decoration:none;">hola@correrjuntos.com</a></div></div></td></tr>
</table>
<div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${TEXT_28};margin-top:26px;font-weight:500;">Meridian Motion &middot; <a href="https://www.correrjuntos.com" style="color:${TEXT_42};text-decoration:none;">correrjuntos.com</a></div>
</td></tr></table></body></html>`;
}

// ── Copy por etapa (ES — la cohorte es ES-first) ──────────────
function emailFor(stage, expired) {
  if (stage === 'd7') {
    return {
      subject: (n) => `${n}, tu Premium gratis termina el 4 de julio`,
      html: shell({
        eyebrow: 'Premium · 7 días',
        h1Pre: 'Tu Premium termina en una', h1Strong: 'semana',
        preheader: 'El 4 de julio acaba tu mes de regalo. Así lo mantienes.',
        body:
            lead(`Hola, soy Abraham. Hace un mes te activé ${sc('30 días de Premium gratis')} por ser de nuestros primeros 1.000. El ${sc('sábado 4 de julio')} se acaba — y prefiero avisarte yo a que desaparezca sin más.`)
          + para('Lo que vuelve a quedar limitado ese día:')
          + list([
              `${sc('Coach José y Ana')} vuelven al límite gratis (5 mensajes al día)`,
              `Los ${sc('planes Premium')} (10K, media maratón, maratón, trail) se bloquean`,
              `Tu progreso ${sc('no se pierde')} — queda guardado por si vuelves`,
            ])
          + callout('Quédatelo', `Premium anual: <strong style="color:${TEXT};">29,99&euro;/a&ntilde;o</strong> — menos de 2,50&euro; al mes. O 4,99&euro; mes a mes. Se activa en un minuto desde la app, sin códigos.`)
          + paraLast('Y si no te encaja, no pasa nada: la app sigue gratis con quedadas, clubs, carreras y tu plan 0→5K. Si algo de Premium no te convenció, respóndeme y cuéntamelo — lo leo yo.'),
        ctaLabel: 'Seguir con Premium &rarr;', ctaRef: 'premium-expiry-d7',
      }),
    };
  }
  if (stage === 'd2') {
    return {
      subject: (n) => `${n}, 2 días — luego José vuelve al modo gratis`,
      html: shell({
        eyebrow: 'Premium · 2 días',
        h1Pre: 'Dos días y vuelve a', h1Strong: 'gratis',
        preheader: 'El sábado 4 de julio tu Premium de regalo se apaga.',
        body:
            lead(`El ${sc('sábado')} se acaba tu mes de Premium de regalo. Dos días.`)
          + para(`Si José te ha estado guiando o tienes un plan en marcha: al caducar, el chat vuelve a 5 mensajes/día y los planes Premium se bloquean. Tu progreso ${sc('queda guardado')}.`)
          + callout('Antes de que se apague', `Anual <strong style="color:${TEXT};">29,99&euro;</strong> (&asymp;2,50&euro;/mes) o mensual 4,99&euro;. Un toque desde la app y sigues sin cortes.`)
          + paraLast('Y si decides no seguir, gracias igualmente por probarlo — me sirve hasta el «no».'),
        ctaLabel: 'Seguir con Premium &rarr;', ctaRef: 'premium-expiry-d2',
      }),
    };
  }
  // d0 — copy adaptativo: hoy vs terminó
  if (!expired) {
    return {
      subject: () => 'Tu Premium termina hoy',
      html: shell({
        eyebrow: 'Premium · Último día',
        h1Pre: 'Tu Premium termina', h1Strong: 'hoy',
        preheader: 'Hasta esta noche puedes mantenerlo sin cortes.',
        body:
            lead(`Hoy es el último día de tu mes de Premium de regalo. Esta noche ${sc('José y Ana vuelven al modo gratis')} y los planes Premium se bloquean.`)
          + para(`Todo tu progreso queda guardado. Pero si quieres seguir sin cortes — mismo plan, mismo José — es un toque:`)
          + callout('Hoy decide', `Anual <strong style="color:${TEXT};">29,99&euro;/a&ntilde;o</strong> (&asymp;2,50&euro;/mes) o mensual 4,99&euro;.`)
          + paraLast('Gracias por haberlo probado este mes. Sea cual sea tu decisión, nos vemos corriendo.'),
        ctaLabel: 'Mantener Premium &rarr;', ctaRef: 'premium-expiry-d0',
      }),
    };
  }
  return {
    subject: () => '¿Lo recuperamos? Tu Premium terminó',
    html: shell({
      eyebrow: 'Premium · Terminado',
      h1Pre: 'Tu Premium se ha', h1Strong: 'apagado',
      preheader: 'Tu plan y tu progreso siguen ahí. Reactivar tarda 1 minuto.',
      body:
          lead(`Tu mes de Premium de regalo terminó. José y Ana están en modo gratis (5 mensajes/día) y los planes Premium, bloqueados.`)
        + para(`La buena noticia: ${sc('todo sigue donde lo dejaste')} — tu plan, tu historial, tus rachas. Reactivar tarda un minuto.`)
        + callout('Recupéralo', `Anual <strong style="color:${TEXT};">29,99&euro;/a&ntilde;o</strong> (&asymp;2,50&euro;/mes) o mensual 4,99&euro;.`)
        + paraLast('Y si lo tuyo es seguir en gratis, perfecto también: quedadas, clubs, carreras y tu 0→5K no se van a ninguna parte.'),
      ctaLabel: 'Reactivar Premium &rarr;', ctaRef: 'premium-expiry-d0r',
    }),
  };
}

function pushFor(stage, expired) {
  if (stage === 'd2') {
    return { title: 'Te quedan 2 días de Premium', body: 'El sábado José y tus planes vuelven al modo gratis. Síguelo por ≈2,50€/mes.' };
  }
  if (!expired) {
    return { title: 'Tu Premium termina hoy', body: 'Mantén a José, Ana y tu plan — un toque para seguir.' };
  }
  return { title: 'Tu Premium se apagó', body: 'Tu plan y tu progreso siguen ahí. Reactívalo en 1 minuto.' };
}

const SENDER = { email: 'contacto@correrjuntos.com', name: 'Abraham · CorrerJuntos' };
const REPLY_TO = { email: 'contacto@correrjuntos.com', name: 'Abraham' };

async function sendBrevoBatch(apiKey, stage, expired, versions) {
  const tpl = emailFor(stage, expired);
  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: SENDER,
      replyTo: REPLY_TO,
      subject: tpl.subject('Hola'),
      htmlContent: tpl.html,
      tags: ['premium-expiry', `stage-${stage}`],
      messageVersions: versions,
    }),
  });
  return resp;
}

async function sendExpoPush(token, title, body, data) {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { accept: 'application/json', 'accept-encoding': 'gzip, deflate', 'content-type': 'application/json' },
    body: JSON.stringify({ to: token, title, body, sound: 'default', priority: 'high', badge: 1, data }),
  });
  const json = await res.json().catch(() => ({}));
  if (json.data?.status === 'ok') return { ok: true, status: res.status };
  return { ok: false, status: res.status, error: json.data?.message || 'unknown' };
}

// stage aplicable según días hasta caducar (la más urgente gana)
function stageFor(daysTo) {
  if (daysTo >= -3 && daysTo <= 0) return 'd0';
  if (daysTo >= 1 && daysTo <= 3) return 'd2';
  if (daysTo >= 4 && daysTo <= 8) return 'd7';
  return null;
}
const STAGE_RANK = { d0: 0, d2: 1, d7: 2 };

export default async function runPremiumExpiry(req, res, env) {
  const BREVO_API_KEY = env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return res.status(500).json({ error: 'missing_brevo' });

  const qp = (k) => {
    if (req?.query?.[k]) return req.query[k];
    try { return new URL(req.url, 'http://x').searchParams.get(k); } catch { return null; }
  };

  // ── Modo test: previsualizar una etapa en tu correo ──
  const testEmail = qp('test');
  if (testEmail) {
    const stage = ['d7', 'd2', 'd0', 'd0r'].includes(qp('stage')) ? qp('stage') : 'd7';
    const expired = stage === 'd0r';
    const realStage = stage === 'd0r' ? 'd0' : stage;
    const tpl = emailFor(realStage, expired);
    const r = await sendBrevoBatch(BREVO_API_KEY, realStage, expired, [
      { to: [{ email: testEmail, name: 'Abraham' }], subject: tpl.subject('Abraham') },
    ]);
    return res.status(r.ok ? 200 : 500).json({ ok: r.ok, mode: 'test', stage, sent_to: testEmail, status: r.status });
  }

  const dry = qp('dry') === '1';
  const budget = Math.max(1, Math.min(300, parseInt(qp('budget') || '', 10) || EMAIL_BUDGET_DEFAULT));
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  // Cohorte regalo: caducan exactamente el 4 jul 2026. Si compran, RC mueve
  // premium_until → salen solos. Excluir seeds/partners/notif_email=false.
  const { data: cohort, error: cohErr } = await supabase
    .from('profiles')
    .select('id, email, nombre, push_token, premium_until, notif_email, es_seed')
    .eq('es_premium', true)
    .gte('premium_until', '2026-07-03T00:00:00Z')
    .lte('premium_until', '2026-07-05T23:59:59Z');
  if (cohErr) return res.status(500).json({ error: 'cohort_query_failed', detail: cohErr.message });

  const today = new Date();
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  const eligible = (cohort || []).filter((p) =>
    p.email &&
    !p.email.toLowerCase().endsWith('@partners.correrjuntos.app') &&
    !p.email.toLowerCase().endsWith('@correrjuntos.com') &&
    p.es_seed !== true &&
    p.notif_email !== false
  ).map((p) => {
    const pu = new Date(p.premium_until);
    const puDay = Date.UTC(pu.getUTCFullYear(), pu.getUTCMonth(), pu.getUTCDate());
    const daysTo = Math.round((puDay - utcToday) / 86400000);
    return { ...p, daysTo, stage: stageFor(daysTo) };
  }).filter((p) => p.stage);

  if (eligible.length === 0) {
    return res.status(200).json({ ok: true, job: 'premium-expiry', dry, processed: 0, emails_sent: 0, push_sent: 0, note: 'no_users_in_window' });
  }

  // Dedup: qué se envió ya. ⚠️ NO usar .in(ids) con cientos de UUIDs → la URL
  // se pasa del límite y la lectura falla en silencio (sentSet vacío → reenvía
  // a diario). La tabla es pequeña (≤ cohorte×3×2): leemos todo y filtramos en JS.
  const { data: logs } = await supabase
    .from('premium_expiry_log')
    .select('user_id, stage, channel');
  const sentSet = new Set((logs || []).map((l) => `${l.user_id}|${l.stage}|${l.channel}`));

  // Pendientes de email, priorizados por urgencia, capados por presupuesto
  const pendingEmail = eligible
    .filter((p) => !sentSet.has(`${p.id}|${p.stage}|email`))
    .sort((a, b) => (STAGE_RANK[a.stage] - STAGE_RANK[b.stage]) || a.email.localeCompare(b.email));
  const toEmail = pendingEmail.slice(0, budget);

  // Pendientes de push (solo d2/d0, token Expo)
  const pendingPush = eligible.filter((p) =>
    (p.stage === 'd2' || p.stage === 'd0') &&
    typeof p.push_token === 'string' && p.push_token.startsWith('ExponentPushToken') &&
    !sentSet.has(`${p.id}|${p.stage}|push`)
  );

  if (dry) {
    const byStage = {};
    for (const p of eligible) byStage[p.stage] = (byStage[p.stage] || 0) + 1;
    return res.status(200).json({
      ok: true, job: 'premium-expiry', dry: true, budget,
      eligible: eligible.length, by_stage: byStage,
      would_email_today: toEmail.length, email_backlog: pendingEmail.length - toEmail.length,
      would_push_today: pendingPush.length,
    });
  }

  let emailsSent = 0, pushSent = 0;
  const errors = [];

  // ── Emails: agrupar por (stage, expired) y mandar en lotes ──
  const groups = {};
  for (const p of toEmail) {
    const key = `${p.stage}|${p.daysTo < 0 ? 1 : 0}`;
    (groups[key] = groups[key] || []).push(p);
  }
  for (const key of Object.keys(groups)) {
    const [stage, exp] = key.split('|');
    const expired = exp === '1';
    const tpl = emailFor(stage, expired);
    const people = groups[key];
    for (let i = 0; i < people.length; i += 300) {
      const slice = people.slice(i, i + 300);
      const versions = slice.map((p) => ({
        to: [{ email: p.email, name: p.nombre || 'Runner' }],
        subject: tpl.subject(p.nombre || 'Hola'),
      }));
      try {
        const r = await sendBrevoBatch(BREVO_API_KEY, stage, expired, versions);
        const ok = r.ok;
        if (!ok && errors.length < 5) errors.push(`brevo ${r.status}: ${(await r.text()).slice(0, 120)}`);
        // log por persona (status del batch)
        await supabase.from('premium_expiry_log').insert(
          slice.map((p) => ({ user_id: p.id, stage, channel: 'email', status: r.status, error: ok ? null : 'batch_failed' }))
        );
        if (ok) emailsSent += slice.length;
      } catch (e) {
        if (errors.length < 5) errors.push((e?.message || '').slice(0, 120));
      }
    }
  }

  // ── Push (d2/d0) ──
  for (const p of pendingPush) {
    const expired = p.daysTo < 0;
    const msg = pushFor(p.stage, expired);
    const r = await sendExpoPush(p.push_token, msg.title, msg.body, {
      screen: 'Paywall', source: 'premium_expiry', stage: p.stage,
    });
    await supabase.from('premium_expiry_log').insert({
      user_id: p.id, stage: p.stage, channel: 'push', status: r.status, error: r.ok ? null : (r.error || '').slice(0, 300),
    });
    if (r.ok) pushSent++;
  }

  return res.status(200).json({
    ok: true, job: 'premium-expiry',
    timestamp: new Date().toISOString(),
    eligible: eligible.length, budget,
    emails_sent: emailsSent, email_backlog: Math.max(0, pendingEmail.length - toEmail.length),
    push_sent: pushSent,
    errors_count: errors.length, errors,
  });
}
