// Job: recovery-ultra-subscribe
// Lead capture for the post-ultra recovery 10-day drip.
// Was at api/recovery-ultra-subscribe.js — consolidated into
// brevo-subscribe.js with `?type=ultra-recovery` to stay under
// Vercel Hobby 12-function limit.
//
// [10 may 2026] ESM-compatible: brevo-subscribe.js uses `import` at
// top so Vercel treats it as ESM. Dynamic `require()` from an ESM
// file throws 'require is not defined'. We export ESM here so the
// caller can use static `import handleUltraRecoverySubscribe from`.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';

export default async function handleUltraRecoverySubscribe(req, res, env) {
  const { email, nombre, lang, race_source } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const safeLang = lang === 'en' ? 'en' : 'es';
  const safeRaceSource = (race_source || 'generic').toString().slice(0, 50);
  const safeName = (nombre || '').toString().slice(0, 100);

  if (!env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'misconfigured' });
  }

  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  try {
    const { data: existing } = await supabase
      .from('ultra_recovery_subscribers')
      .select('id, status')
      .ilike('email', email)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('ultra_recovery_subscribers')
        .update({
          nombre: safeName || null,
          lang: safeLang,
          race_source: safeRaceSource,
          started_at: new Date().toISOString(),
          status: 'active',
          unsubscribed_at: null,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('ultra_recovery_subscribers').insert({
        email,
        nombre: safeName || null,
        lang: safeLang,
        race_source: safeRaceSource,
      });
    }
  } catch (e) {
    console.error('[ultra-recovery-subscribe] supabase error:', e);
    return res.status(500).json({ error: 'storage_failed' });
  }

  if (env.BREVO_API_KEY) {
    const SENDER_EMAIL = env.BREVO_SENDER_EMAIL || 'hola@correrjuntos.com';
    const SENDER_NAME = env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos';
    const welcomeHtml = welcomeEmail(safeLang, safeName);
    const subject = safeLang === 'en'
      ? "✓ You're in — your 10-day recovery plan starts tomorrow"
      : '✓ Confirmado — tu plan de recuperación 10 días empieza mañana';
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { email: SENDER_EMAIL, name: SENDER_NAME },
          to: [{ email, name: safeName || email }],
          subject,
          htmlContent: welcomeHtml,
          tags: ['ultra-recovery', 'welcome', safeLang, `source-${safeRaceSource}`],
        }),
      });
    } catch (e) {
      console.warn('[ultra-recovery-subscribe] welcome send failed (non-blocking):', e?.message || e);
    }
  }

  return res.status(201).json({ status: 'ok' });
}

function welcomeEmail(lang, name) {
  // [10 may 2026 v3] Visual: Meridian Motion editorial system — same as
  // Supabase Auth "Confirm signup" template (eyebrow + tagline + light
  // h1 with strong highlight + dark text on orange CTA + JetBrains Mono
  // mono micro-text + Correr*Juntos* logo signature).
  const isEn = lang === 'en';

  const ORANGE = '#f97316';
  const BG = '#0b1220';
  const TEXT = '#f6f1e8';
  const TEXT_72 = 'rgba(246,241,232,0.72)';
  const TEXT_42 = 'rgba(246,241,232,0.42)';
  const TEXT_28 = 'rgba(246,241,232,0.28)';
  const BORDER_08 = 'rgba(246,241,232,0.08)';
  const BORDER_12 = 'rgba(246,241,232,0.12)';
  const FONT_BODY = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const FONT_MONO = "'JetBrains Mono',SFMono-Regular,Consolas,Menlo,monospace";

  const eyebrow = isEn ? 'Recovery · Día 00' : 'Recuperación · Día 00';
  const tagline = isEn ? 'RUN TOGETHER' : 'CORRE ACOMPAÑADO';
  const h1Pre = isEn ? `${name ? name + ', y' : 'Y'}ou're` : `${name ? name + ', e' : 'E'}stás`;
  const h1Strong = isEn ? 'in' : 'dentro';
  const h1Post = '.';
  const preheader = isEn
    ? "Smart move. Day 1 starts tomorrow at 9am."
    : 'Decisión inteligente. Día 1 mañana a las 9h.';
  const body1 = isEn
    ? "You just signed up for the 10-day post-ultra recovery plan. Most runners skip recovery and pay the price 6 weeks later."
    : `Acabas de apuntarte al plan de recuperación 10 días post-ultra. La mayoría se salta la recuperación y lo paga 6 semanas después.`;
  const body2 = isEn
    ? `<strong style="color:${TEXT};font-weight:600;">Tomorrow at 9am</strong> you'll get Day 1: rest + hydration + sleep. The body is being more rebuilt right now than at any other moment of the year.`
    : `<strong style="color:${TEXT};font-weight:600;">Mañana a las 9h</strong> recibes el Día 1: descanso + hidratación + sueño. Tu cuerpo se está reconstruyendo más ahora que en ningún otro momento del año.`;
  const body3 = isEn
    ? `Today you only have one job: <strong style="color:${TEXT};font-weight:600;">do nothing</strong>. Eat, hydrate, sleep deep. See you tomorrow.`
    : `Hoy solo tienes una tarea: <strong style="color:${TEXT};font-weight:600;">no hacer nada</strong>. Come, hidrátate, duerme profundo. Hasta mañana.`;

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>CorrerJuntos</title></head><body style="margin:0;padding:0;background:${BG};font-family:${FONT_BODY};color:${TEXT};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:48px 16px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${BG};border:1px solid ${BORDER_08};border-radius:20px;overflow:hidden;">
    <tr><td style="padding:36px 44px 0 44px;"><span style="display:inline-block;width:10px;height:10px;background:${ORANGE};border-radius:999px;"></span></td></tr>
    <tr><td style="padding:14px 44px 0 44px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:500;">
        <span style="color:${ORANGE};">&bull;</span>&nbsp;&nbsp;${eyebrow}
      </div>
    </td></tr>
    <tr><td style="padding:30px 44px 0 44px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${ORANGE};font-weight:500;">
        <span style="display:inline-block;width:36px;height:1px;background:${ORANGE};vertical-align:middle;margin-right:12px;"></span>${tagline}
      </div>
    </td></tr>
    <tr><td style="padding:30px 44px 0 44px;">
      <h1 style="margin:0;font-family:${FONT_BODY};font-size:44px;line-height:0.96;letter-spacing:-0.035em;font-weight:200;color:${TEXT};">${h1Pre} <strong style="font-weight:700;color:${ORANGE};font-style:normal;">${h1Strong}</strong>${h1Post}</h1>
    </td></tr>
    <tr><td style="padding:28px 44px 0 44px;">
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${body1}</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${body2}</p>
      <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${body3}</p>
    </td></tr>
    <tr><td style="padding:30px 44px 34px 44px;">
      <div style="border-top:1px solid ${BORDER_12};padding-top:26px;">
        <div style="font-family:${FONT_BODY};font-size:26px;font-weight:800;letter-spacing:-0.03em;color:${TEXT};line-height:1;">Correr<em style="font-style:normal;color:${ORANGE};">Juntos</em></div>
        <div style="margin-top:8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;color:${ORANGE};"><a href="mailto:hola@correrjuntos.com" style="color:${ORANGE};text-decoration:none;">hola@correrjuntos.com</a></div>
      </div>
    </td></tr>
  </table>
  <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${TEXT_28};margin-top:26px;font-weight:500;">
    Meridian Motion &middot; <a href="https://www.correrjuntos.com" style="color:${TEXT_42};text-decoration:none;">correrjuntos.com</a>
  </div>
</td></tr>
</table>
</body></html>`;
}
