// Job: founder-blast (one-off, 4 jun 2026)
// Carta de fundador "Primeros 1.000" a app-users gifteados (30d Premium).
//
// Trigger (envío real):
//   GET /api/cron/run?job=founder-blast
//   Authorization: Bearer <CRON_SECRET>
//
// Modo test (solo a 1 email, para previsualizar):
//   GET /api/cron/run?job=founder-blast&test=guetto2012@gmail.com
//
// Estrategia:
//   - Destinatarios vía RPC get_founder_blast_recipients (confirmados +
//     notif_email + gifteados hoy + sin test/seed/partner). EMAIL only.
//   - Brevo transactional con messageVersions (1 llamada / lote de 500) →
//     cabe en el timeout de Vercel y cada uno recibe su email privado.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const APP_URL = 'https://www.correrjuntos.com/app';

// ── Meridian Motion (dark) ────────────────────────────────────
const ORANGE='#f97316', BG='#0b1220', TEXT='#f6f1e8';
const TEXT_72='rgba(246,241,232,0.72)', TEXT_42='rgba(246,241,232,0.42)', TEXT_28='rgba(246,241,232,0.28)';
const BORDER_08='rgba(246,241,232,0.08)', BORDER_12='rgba(246,241,232,0.12)';
const FONT_BODY="'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_MONO="'JetBrains Mono',SFMono-Regular,Consolas,Menlo,monospace";

const sc = (t) => `<strong style="color:${TEXT};font-weight:600;">${t}</strong>`;
const para = (t) => `<p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${t}</p>`;
const lead = (t) => `<p style="margin:0 0 22px 0;font-size:15.5px;line-height:1.65;color:${TEXT_72};font-weight:400;">${t}</p>`;
const paraLast = (t) => `<p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${t}</p>`;
const list = (items) => `<ul style="margin:0 0 22px 0;padding-left:18px;font-size:14.5px;line-height:1.85;color:${TEXT_72};font-weight:400;">${items.map(i=>`<li style="margin-bottom:6px;">${i}</li>`).join('')}</ul>`;
const callout = (label,b) => `<div style="margin:6px 0 22px 0;padding:18px 20px;background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.16);border-radius:10px;"><div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${ORANGE};font-weight:500;margin-bottom:8px;">${label}</div><div style="font-size:14.5px;line-height:1.65;color:${TEXT_72};">${b}</div></div>`;

function emailHtml(lang) {
  const isEn = lang === 'en';
  const eyebrow = isEn ? 'Founders · First 1,000' : 'Fundadores · Primeros 1.000';
  const tagline = isEn ? 'RUN TOGETHER' : 'CORRE ACOMPAÑADO';
  const h1Pre = isEn ? "You're one of our first" : 'Eres de nuestros primeros';
  const h1Strong = isEn ? '1,000' : '1.000';
  const preheader = isEn
    ? "We've learned so much thanks to you. And we want to say thank you."
    : 'Hemos aprendido mucho gracias a ti. Y queremos darte las gracias.';

  const bodyEs =
      lead(`Hola, soy Abraham, fundador de CorrerJuntos. Te escribo yo, no un sistema automático.`)
    + para(`Empezaste con nosotros cuando esto era muy distinto — eres de nuestros primeros 1.000 usuarios. Y te seré sincero: en aquel momento la app tenía mucho que mejorar. Os hemos visto usarla, hemos aprendido dónde fallaba, y hoy es otra cosa ${sc('gracias a vosotros')}.`)
    + para(`Lo que ha cambiado desde que la probaste:`)
    + list([
        `${sc('Planes de entrenamiento')} que se adaptan a tu ritmo real, semana a semana`,
        `${sc('Coach José')} — tu entrenador IA, que te habla como un colega que ha corrido contigo mil veces`,
        `${sc('Ana, tu nutricionista IA')} — qué comer según tus entrenos y tus carreras`,
        `${sc('Clubs de running')} de tu zona, dentro de la app`,
        `${sc('Carreras de toda España')} —ahora con tu ciudad incluida, sea cual sea— y ${sc('quedadas')} para no correr solo`,
      ])
    + callout('Tu regalo', `Por estar desde el principio, te he activado <strong style="color:${TEXT};">30 días de Premium gratis</strong> — Coach José y Ana sin límites y todos los planes. No tienes que canjear ningún código ni meter la tarjeta: al abrir la app, ya está. Sin compromiso, sin letra pequeña.`)
    + paraLast(`Solo te pido una cosa: ábrela otra vez y dime qué te parece. Si algo no encaja, responde a este correo — lo leo yo. Gracias por confiar pronto.`);

  const bodyEn =
      lead(`Hi, I'm Abraham, founder of CorrerJuntos. This is me writing, not an automated system.`)
    + para(`You joined us when this was a very different thing — you're one of our first 1,000 users. And I'll be honest: back then the app had a lot to improve. We watched you use it, learned where it fell short, and today it's a different thing ${sc('thanks to you')}.`)
    + para(`What's changed since you tried it:`)
    + list([
        `${sc('Training plans')} that adapt to your real pace, week by week`,
        `${sc('Coach José')} — your AI coach, who talks to you like a mate who's run with you a hundred times`,
        `${sc('Ana, your AI nutritionist')} — what to eat based on your workouts and races`,
        `${sc('Running clubs')} near you, inside the app`,
        `${sc('Races across Spain')} and ${sc('meetups')} so you never run alone`,
      ])
    + callout('Your gift', `For being here from the start, I've activated <strong style="color:${TEXT};">30 days of Premium for you, free</strong> — Coach José and Ana with no limits, and all the plans. No code to redeem, no card needed: just open the app and it's there. No strings, no fine print.`)
    + paraLast(`I only ask one thing: open it again and tell me what you think. If something's off, reply to this email — I read them. Thanks for trusting us early.`);

  const body = isEn ? bodyEn : bodyEs;
  const ctaLabel = isEn ? 'Open the app  →' : 'Abrir la app  →';

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>CorrerJuntos</title></head><body style="margin:0;padding:0;background:${BG};font-family:${FONT_BODY};color:${TEXT};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:48px 16px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${BG};border:1px solid ${BORDER_08};border-radius:20px;overflow:hidden;">
<tr><td style="padding:36px 44px 0 44px;"><span style="display:inline-block;width:10px;height:10px;background:${ORANGE};border-radius:999px;"></span></td></tr>
<tr><td style="padding:14px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:500;"><span style="color:${ORANGE};">&bull;</span>&nbsp;&nbsp;${eyebrow}</div></td></tr>
<tr><td style="padding:30px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${ORANGE};font-weight:500;"><span style="display:inline-block;width:36px;height:1px;background:${ORANGE};vertical-align:middle;margin-right:12px;"></span>${tagline}</div></td></tr>
<tr><td style="padding:30px 44px 0 44px;"><h1 style="margin:0;font-family:${FONT_BODY};font-size:42px;line-height:1.0;letter-spacing:-0.035em;font-weight:200;color:${TEXT};">${h1Pre} <strong style="font-weight:700;color:${ORANGE};font-style:normal;">${h1Strong}</strong>.</h1></td></tr>
<tr><td style="padding:28px 44px 0 44px;">${body}</td></tr>
<tr><td style="padding:36px 44px 0 44px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${ORANGE}" style="border-radius:10px;"><a href="${APP_URL}?ref=founder-blast" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${FONT_BODY};font-size:15px;font-weight:600;color:${BG};text-decoration:none;border-radius:10px;letter-spacing:0.01em;">${ctaLabel}</a></td></tr></table></td></tr>
<tr><td style="padding:30px 44px 34px 44px;"><div style="border-top:1px solid ${BORDER_12};padding-top:26px;"><div style="font-family:${FONT_BODY};font-size:26px;font-weight:800;letter-spacing:-0.03em;color:${TEXT};line-height:1;">Correr<em style="font-style:normal;color:${ORANGE};">Juntos</em></div><div style="margin-top:8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;color:${ORANGE};"><a href="mailto:hola@correrjuntos.com" style="color:${ORANGE};text-decoration:none;">hola@correrjuntos.com</a></div></div></td></tr>
</table>
<div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${TEXT_28};margin-top:26px;font-weight:500;">Meridian Motion &middot; <a href="https://www.correrjuntos.com" style="color:${TEXT_42};text-decoration:none;">correrjuntos.com</a></div>
</td></tr></table></body></html>`;
}

const subjectFor = (name, lang) =>
  lang === 'en'
    ? `${name}, here's 30 days of Premium on me 🎁`
    : `${name}, te regalo 30 días de Premium 🎁`;

const SENDER = { email: 'contacto@correrjuntos.com', name: 'Abraham · CorrerJuntos' };
const REPLY_TO = { email: 'contacto@correrjuntos.com', name: 'Abraham' };

async function sendBrevoBatch(apiKey, lang, versions) {
  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: SENDER,
      replyTo: REPLY_TO,
      subject: subjectFor('Hola', lang), // default; cada version lo sobreescribe
      htmlContent: emailHtml(lang),
      tags: ['founder-blast-1000', `lang-${lang}`],
      messageVersions: versions,
    }),
  });
  return resp;
}

export default async function runFounderBlast(req, res, env) {
  const BREVO_API_KEY = env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return res.status(500).json({ error: 'missing_brevo' });

  // test mode: ?test=email → 1 solo envío ES de muestra
  const testEmail = req?.query?.test || (() => {
    try { return new URL(req.url, 'http://x').searchParams.get('test'); } catch { return null; }
  })();

  if (testEmail) {
    const versions = [{ to: [{ email: testEmail, name: 'Abraham' }], subject: subjectFor('Abraham', 'es') }];
    const r = await sendBrevoBatch(BREVO_API_KEY, 'es', versions);
    const ok = r.ok; const detail = ok ? null : (await r.text()).slice(0, 200);
    return res.status(ok ? 200 : 500).json({ ok, mode: 'test', sent_to: testEmail, status: r.status, detail });
  }

  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const { data: recipients = [], error } = await supabase.rpc('get_founder_blast_recipients', { p_limit: 2000 });
  if (error) return res.status(500).json({ error: 'recipients_rpc_failed', detail: error.message });

  // Agrupar por idioma, versiones con asunto personalizado
  const byLang = { es: [], en: [] };
  for (const r of recipients) {
    (byLang[r.lang] || byLang.es).push({
      to: [{ email: r.email, name: r.nombre }],
      subject: subjectFor(r.nombre, r.lang),
    });
  }

  const results = { sent: 0, failed: 0, errors: [] };
  for (const lang of ['es', 'en']) {
    const versions = byLang[lang];
    for (let i = 0; i < versions.length; i += 500) {
      const batch = versions.slice(i, i + 500);
      if (batch.length === 0) continue;
      try {
        const r = await sendBrevoBatch(BREVO_API_KEY, lang, batch);
        if (r.ok) results.sent += batch.length;
        else { results.failed += batch.length; if (results.errors.length < 5) results.errors.push(`${r.status}: ${(await r.text()).slice(0,150)}`); }
      } catch (e) {
        results.failed += batch.length;
        if (results.errors.length < 5) results.errors.push((e?.message || '').slice(0, 120));
      }
    }
  }

  return res.status(200).json({ ok: true, total_recipients: recipients.length, ...results });
}
