// Job: plan-subscribe
// Lead capture para landing /plan ("Tú eliges la carrera. Yo preparo el plan.")
// Visitante NO autenticado mete email + carrera elegida → guarda en
// plan_subscribers + envía welcome email con plan preview + meta para drip.
//
// ESM-compatible: brevo-subscribe.js usa `import` al top y este export es ESM
// también. NO usar require() aquí.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';

export default async function handlePlanSubscribe(req, res, env) {
  const {
    email,
    nombre,
    lang,
    carrera_id,
    carrera_nombre,
    carrera_fecha,
    carrera_ciudad,
    carrera_distancia_km,
    plan_slug,
    source,
    utm_source,
    utm_medium,
    utm_campaign,
  } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const safeLang = lang === 'en' ? 'en' : 'es';
  const safeName = (nombre || '').toString().slice(0, 100);

  if (!env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'misconfigured' });
  }

  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  // Upsert: si email ya existe, actualizar con nueva carrera elegida
  try {
    const { data: existing } = await supabase
      .from('plan_subscribers')
      .select('id, status')
      .ilike('email', email)
      .maybeSingle();

    const payload = {
      email,
      nombre: safeName || null,
      lang: safeLang,
      carrera_id: (carrera_id || '').toString().slice(0, 100) || null,
      carrera_nombre: (carrera_nombre || '').toString().slice(0, 200) || null,
      carrera_fecha: carrera_fecha || null,
      carrera_ciudad: (carrera_ciudad || '').toString().slice(0, 100) || null,
      carrera_distancia_km: typeof carrera_distancia_km === 'number' ? carrera_distancia_km : null,
      plan_slug: (plan_slug || '').toString().slice(0, 50) || null,
      source: (source || 'landing').toString().slice(0, 50),
      utm_source: (utm_source || '').toString().slice(0, 100) || null,
      utm_medium: (utm_medium || '').toString().slice(0, 100) || null,
      utm_campaign: (utm_campaign || '').toString().slice(0, 100) || null,
      status: 'active',
      unsubscribed_at: null,
    };

    if (existing) {
      await supabase
        .from('plan_subscribers')
        .update(payload)
        .eq('id', existing.id);
    } else {
      await supabase.from('plan_subscribers').insert(payload);
    }
  } catch (e) {
    console.error('[plan-subscribe] supabase error:', e);
    return res.status(500).json({ error: 'storage_failed' });
  }

  // Welcome email con preview del plan
  if (env.BREVO_API_KEY) {
    const SENDER_EMAIL = env.BREVO_SENDER_EMAIL || 'hola@correrjuntos.com';
    const SENDER_NAME = env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos';
    const welcomeHtml = welcomeEmail({
      lang: safeLang,
      name: safeName,
      carreraNombre: carrera_nombre || (safeLang === 'en' ? 'your race' : 'tu carrera'),
      carreraFecha: carrera_fecha,
      carreraCiudad: carrera_ciudad,
      carreraDistanciaKm: carrera_distancia_km,
      planSlug: plan_slug || 'prep-10k',
    });
    const subject = safeLang === 'en'
      ? `✓ Your plan for ${carrera_nombre || 'your race'} is on the way`
      : `✓ Tu plan para ${carrera_nombre || 'tu carrera'} ya está en camino`;
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
          tags: ['plan-landing', 'welcome', safeLang, plan_slug || 'unknown'],
        }),
      });
    } catch (e) {
      console.warn('[plan-subscribe] welcome send failed (non-blocking):', e?.message || e);
    }
  }

  return res.status(201).json({ status: 'ok' });
}

// ──────────────────────────────────────────────────────────────────
// Welcome email — Meridian Motion editorial system (same as Supabase
// Auth + recovery-ultra). Eyebrow + tagline + huge headline + dark text
// on orange CTA + body with plan preview.
// ──────────────────────────────────────────────────────────────────
function welcomeEmail({ lang, name, carreraNombre, carreraFecha, carreraCiudad, carreraDistanciaKm, planSlug }) {
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

  // Plan friendly names
  const PLAN_NAMES = {
    'prep-5k':       { es: 'Preparación 5K',      en: 'Prep 5K',              weeks: 8 },
    'prep-10k':      { es: 'Preparación 10K',     en: 'Prep 10K',             weeks: 12 },
    'prep-21k':      { es: 'Media Maratón',       en: 'Half Marathon',        weeks: 16 },
    'prep-42k':      { es: 'Maratón',             en: 'Marathon',             weeks: 18 },
    'prep-trail':    { es: 'Trail Running',       en: 'Trail Running',        weeks: 10 },
    'empezar-0-5k':  { es: 'Empezar a correr 0→5K', en: 'Start Running 0→5K', weeks: 8 },
  };
  const plan = PLAN_NAMES[planSlug] || PLAN_NAMES['prep-10k'];
  const planName = isEn ? plan.en : plan.es;

  // Format fecha
  let fechaFmt = '';
  if (carreraFecha) {
    try {
      const d = new Date(carreraFecha + 'T00:00:00');
      const meses = isEn
        ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        : ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      fechaFmt = `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
    } catch {}
  }

  // Calc weeks until race
  let weeksUntil = null;
  if (carreraFecha) {
    try {
      const now = new Date();
      const raceD = new Date(carreraFecha + 'T00:00:00');
      weeksUntil = Math.max(1, Math.ceil((raceD.getTime() - now.getTime()) / (7 * 24 * 3600 * 1000)));
    } catch {}
  }

  const distKm = carreraDistanciaKm ? `${carreraDistanciaKm} km` : '';

  const eyebrow = isEn ? 'Plan · Day 00' : 'Plan · Día 00';
  const tagline = isEn ? 'RUN TOGETHER' : 'CORRE ACOMPAÑADO';
  const h1Pre = isEn ? `${name ? name + ', y' : 'Y'}our plan is` : `${name ? name + ', t' : 'T'}u plan está`;
  const h1Strong = isEn ? 'ready' : 'listo';
  const h1Post = '.';
  const preheader = isEn
    ? `Plan for ${carreraNombre}. Download the app to start.`
    : `Plan para ${carreraNombre}. Descarga la app para empezar.`;

  // iter#24 fix: copy natural si no hay carrera específica (founder hizo
  // signup sin seleccionar carrera y el email decía "Has elegido tu carrera"
  // en negrita como si fuera el nombre — feo). Cuando no hay carrera real
  // usamos copy general que se siente custom.
  const hasRace = carreraNombre && carreraNombre !== 'Mi carrera (no listada)' && carreraNombre !== 'your race' && carreraNombre !== 'tu carrera';
  const intro = hasRace
    ? (isEn
      ? `You picked <strong style="color:${TEXT};font-weight:600;">${carreraNombre}</strong>${fechaFmt ? ` on ${fechaFmt}` : ''}${carreraCiudad ? ` in ${carreraCiudad}` : ''}. We've put together a <strong style="color:${TEXT};font-weight:600;">${planName}</strong>${weeksUntil ? ` covering the ${weeksUntil} weeks until race day` : ''}.`
      : `Has elegido <strong style="color:${TEXT};font-weight:600;">${carreraNombre}</strong>${fechaFmt ? ` el ${fechaFmt}` : ''}${carreraCiudad ? ` en ${carreraCiudad}` : ''}. Hemos preparado un <strong style="color:${TEXT};font-weight:600;">${planName}</strong>${weeksUntil ? ` adaptado a las ${weeksUntil} semanas hasta la carrera` : ''}.`)
    : (isEn
      ? `Here's <strong style="color:${TEXT};font-weight:600;">${planName}</strong> — our most popular plan to get race-ready. Once you tell us which race you're aiming for, we adapt the volume and intensity automatically.`
      : `Aquí tienes <strong style="color:${TEXT};font-weight:600;">${planName}</strong> — el plan más usado para llegar a una carrera en forma. En cuanto nos digas qué carrera tienes en mente, ajustamos volumen e intensidad automáticamente.`);

  const body1 = isEn
    ? `The plan adapts each week to how you're rinding. Coach Jose (AI) is there 24/7 — ask anything: "what if I slept badly?", "can I swap a session?", "is this pace right?".`
    : `El plan se adapta cada semana a cómo vas rindiendo. Coach Jose (IA) está 24/7 — pregúntale lo que necesites: "¿y si dormí mal?", "¿puedo cambiar una sesión?", "¿este ritmo es correcto?".`;

  const body2 = isEn
    ? `<strong style="color:${TEXT};font-weight:600;">Download the app to activate your plan</strong> — it's free, no card needed, cancel anytime. Your plan, your race, your community.`
    : `<strong style="color:${TEXT};font-weight:600;">Descarga la app para activar tu plan</strong> — gratis, sin tarjeta, cancela cuando quieras. Tu plan, tu carrera, tu comunidad.`;

  const ctaLabel = isEn ? 'Activate my plan →' : 'Activar mi plan →';

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
      <p style="margin:0 0 22px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${intro}</p>
    </td></tr>
    <tr><td style="padding:14px 44px 0 44px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);border-radius:12px;">
        <tr><td style="padding:18px 22px;">
          <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${ORANGE};font-weight:700;margin-bottom:8px;">${isEn ? 'YOUR PLAN' : 'TU PLAN'}</div>
          <div style="font-size:20px;font-weight:800;color:${TEXT};letter-spacing:-0.3px;margin-bottom:4px;">${planName}</div>
          <div style="font-family:${FONT_MONO};font-size:12px;color:${TEXT_72};letter-spacing:0.04em;">
            ${plan.weeks} ${isEn ? 'weeks' : 'semanas'}${weeksUntil ? ` &middot; ${weeksUntil} ${isEn ? 'wk until race' : 'sem hasta carrera'}` : ''}${distKm ? ` &middot; ${distKm}` : ''}
          </div>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 44px 0 44px;">
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${body1}</p>
      <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${body2}</p>
    </td></tr>
    <tr><td style="padding:32px 44px 0 44px;">
      <a href="https://www.correrjuntos.com/install?utm_source=email&utm_medium=plan_welcome&utm_campaign=${planSlug}"
         style="display:inline-block;background:${ORANGE};color:#0b1220;font-family:${FONT_BODY};font-size:15px;font-weight:600;text-decoration:none;padding:14px 26px;border-radius:10px;letter-spacing:0.01em;">${ctaLabel}</a>
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
