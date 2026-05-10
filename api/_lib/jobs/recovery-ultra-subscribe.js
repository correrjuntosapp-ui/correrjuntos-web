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
  const isEn = lang === 'en';
  const greet = isEn ? `Hi ${name || 'there'},` : `Hola ${name || ''}`;
  const body1 = isEn
    ? "You just signed up for the 10-day post-ultra recovery plan. Smart move — most runners skip recovery and pay the price 6 weeks later."
    : "Acabas de apuntarte al plan de recuperación 10 días post-ultra. Decisión inteligente — la mayoría se salta la recuperación y lo paga 6 semanas después.";
  const body2 = isEn
    ? "<strong>Tomorrow at 9am</strong> you'll get Day 1: rest + hydration + sleep. The body is being more rebuilt right now than at any other moment of the year."
    : "<strong>Mañana a las 9h</strong> recibes el Día 1: descanso + hidratación + sueño. Tu cuerpo se está reconstruyendo más ahora que en ningún otro momento del año.";
  const body3 = isEn
    ? "Today you only have one job: <strong>do nothing</strong>. Eat, hydrate, sleep deep. See you tomorrow."
    : "Hoy solo tienes una tarea: <strong>no hacer nada</strong>. Come, hidrátate, duerme profundo. Hasta mañana.";
  const sig = isEn
    ? "— Abraham, founder CorrerJuntos"
    : "— Abraham, fundador CorrerJuntos";

  // [10 may 2026] Visual style alineado con Brevo template #3 — dark bg
  // + brand naranja + card subtle, mismo lookfeel que email de welcome.
  const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif";
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CorrerJuntos</title></head><body style="margin:0;padding:0;background:#0b1220;font-family:${FONT}"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td style="text-align:center;padding:24px 0"><a href="https://www.correrjuntos.com" style="color:#f97316;font-size:1.4rem;font-weight:900;text-decoration:none;letter-spacing:-0.5px">CORRERJUNTOS</a></td></tr><tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:40px 32px"><h1 style="color:#f97316;font-size:1.6rem;font-weight:900;margin:0 0 18px 0;line-height:1.25;text-align:center">${greet}</h1><p style="color:#cbd5e1;font-size:1rem;line-height:1.7;margin:0 0 16px 0">${body1}</p><p style="color:#cbd5e1;font-size:1rem;line-height:1.7;margin:0 0 16px 0">${body2}</p><p style="color:#cbd5e1;font-size:1rem;line-height:1.7;margin:0 0 16px 0">${body3}</p><p style="color:#94a3b8;font-size:0.88rem;line-height:1.6;margin:24px 0 0 0">${sig}</p></td></tr><tr><td style="text-align:center;padding:24px 0;font-size:0.8rem;color:#475569">© 2026 CorrerJuntos - La comunidad runner</td></tr></table></td></tr></table></body></html>`;
}
