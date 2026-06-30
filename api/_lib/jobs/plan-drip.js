// ============================================================
// Job: plan-drip
// Drip campaign 4 emails post-signup landing /plan
// Day 0  → welcome (enviado en plan-subscribe.js, no aquí)
// Day 1  → "Cómo va a ser tu primera semana"
// Day 3  → "El error #1 que comete el 80%"
// Day 7  → "¿Ya descargaste la app?"
// Day 14 → "Última: 14 días gratis si activas hoy"
//
// Cron daily @ 09:10 UTC. Para cada subscriber `active`, calcula el
// próximo email pendiente y lo manda si está due.
// emails_sent counter: 0 = ningún drip enviado, solo welcome
//                       1 = day 1 enviado
//                       2 = day 3 enviado
//                       ...
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const DRIP_DELAYS_DAYS = [1, 3, 7, 14]; // días desde created_at para emails 1..4

export default async function runPlanDrip(req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  // Obtén subscribers activos con drip pendiente (emails_sent < 4)
  const cutoffMs = Date.now() - 1 * 24 * 3600 * 1000; // signed up al menos 1 día
  const { data: subs, error } = await supabase
    .from('plan_subscribers')
    .select('id, email, nombre, lang, carrera_nombre, carrera_fecha, carrera_ciudad, plan_slug, created_at, emails_sent')
    .eq('status', 'active')
    .lt('emails_sent', 4)
    .lte('created_at', new Date(cutoffMs).toISOString())
    .limit(200);

  if (error) {
    return res.status(500).json({ error: 'query_failed', msg: error.message });
  }

  if (!subs || subs.length === 0) {
    return res.status(200).json({ ok: true, processed: 0, sent: 0 });
  }

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const sub of subs) {
    processed += 1;
    const signupDate = new Date(sub.created_at);
    const daysSince = (Date.now() - signupDate.getTime()) / (24 * 3600 * 1000);
    const nextEmailIdx = sub.emails_sent; // 0=>day1, 1=>day3, etc
    const dueDays = DRIP_DELAYS_DAYS[nextEmailIdx];

    if (daysSince < dueDays) {
      skipped += 1;
      continue;
    }

    const subject = subjectFor(sub.lang, nextEmailIdx, sub);
    const htmlContent = htmlFor(sub.lang, nextEmailIdx, sub);

    if (!subject || !htmlContent) {
      skipped += 1;
      continue;
    }

    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            email: env.BREVO_SENDER_EMAIL || 'abraham.marquez@correrjuntos.com',
            name: env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos',
          },
          to: [{ email: sub.email, name: sub.nombre || sub.email }],
          subject,
          htmlContent,
          tags: ['plan-landing', 'drip', `day-${DRIP_DELAYS_DAYS[nextEmailIdx]}`, sub.lang, sub.plan_slug || 'unknown'],
        }),
      });

      // Update counter
      await supabase
        .from('plan_subscribers')
        .update({
          emails_sent: nextEmailIdx + 1,
          last_email_sent_at: new Date().toISOString(),
        })
        .eq('id', sub.id);

      sent += 1;
    } catch (e) {
      console.error(`[plan-drip] send failed for ${sub.email}:`, e?.message || e);
      failed += 1;
    }
  }

  return res.status(200).json({ ok: true, processed, sent, skipped, failed });
}

// ───────────────────────────────────────────────────────────────
// Email subjects per day + lang
// ───────────────────────────────────────────────────────────────
function subjectFor(lang, idx, sub) {
  const isEn = lang === 'en';
  const carrera = sub.carrera_nombre || (isEn ? 'your race' : 'tu carrera');
  switch (idx) {
    case 0: // Day 1
      return isEn
        ? 'Your first week (and the most important one)'
        : 'Tu primera semana (y la más importante)';
    case 1: // Day 3
      return isEn
        ? 'The mistake 80% of runners make'
        : 'El error que comete el 80% de los runners';
    case 2: // Day 7
      return isEn
        ? `Did you start your plan for ${carrera}?`
        : `¿Has empezado tu plan para ${carrera}?`;
    case 3: // Day 14
      return isEn
        ? '14 days free if you activate today'
        : 'Última: 14 días gratis si activas hoy';
    default:
      return null;
  }
}

// ───────────────────────────────────────────────────────────────
// HTML per email (Meridian Motion editorial)
// ───────────────────────────────────────────────────────────────
function htmlFor(lang, idx, sub) {
  const isEn = lang === 'en';
  const name = sub.nombre || '';
  const carrera = sub.carrera_nombre || (isEn ? 'your race' : 'tu carrera');
  const planSlug = sub.plan_slug || 'prep-10k';

  // Common tokens
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

  let eyebrow, h1Pre, h1Strong, preheader, body, ctaLabel;

  if (idx === 0) {
    // Day 1
    eyebrow = isEn ? 'Plan · Day 01' : 'Plan · Día 01';
    h1Pre = isEn ? 'Your ' : 'Tu ';
    h1Strong = isEn ? 'first week.' : 'primera semana.';
    preheader = isEn
      ? 'The most important week of your whole plan.'
      : 'La semana más importante de todo tu plan.';
    body = `
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">${name ? name + ', t' : 'T'}u <strong style="color:${TEXT};">primera semana</strong> es la más importante de todo el plan. No por intensidad. <strong style="color:${TEXT};">Por hábito.</strong></p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">El 60% de los planes mueren la primera semana. Si la pasas, has ganado la guerra mental. El resto es ajustar.</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">Esta semana tienes <strong style="color:${TEXT};">3 sesiones suaves</strong>. Nada épico. Solo plantar el hábito en tu calendario.</p>
      <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">¿Cuándo es tu primera salida esta semana? Te recomendamos el <strong style="color:${TEXT};">martes o miércoles</strong>. Dos días de margen para descansar antes y después.</p>
    `;
    if (isEn) {
      body = `
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">${name ? name + ', y' : 'Y'}our <strong style="color:${TEXT};">first week</strong> is the most important of the whole plan. Not because of intensity. <strong style="color:${TEXT};">Because of habit.</strong></p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">60% of training plans die in the first week. If you make it past, you've won the mental war. The rest is just adjustments.</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">This week you have <strong style="color:${TEXT};">3 easy sessions</strong>. Nothing epic. Just plant the habit in your calendar.</p>
        <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">When is your first run this week? We recommend <strong style="color:${TEXT};">Tuesday or Wednesday</strong>. Two days of buffer before and after.</p>
      `;
    }
    ctaLabel = isEn ? 'Activate my plan in the app →' : 'Activar mi plan en la app →';
  } else if (idx === 1) {
    // Day 3
    eyebrow = isEn ? 'Plan · Day 03' : 'Plan · Día 03';
    h1Pre = isEn ? 'The mistake ' : 'El error ';
    h1Strong = isEn ? '80% make.' : 'del 80%.';
    preheader = isEn
      ? 'Going too fast on easy days. The science behind it.'
      : 'Correr demasiado rápido los días suaves. Te lo explico.';
    body = `
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};"><strong style="color:${TEXT};">80% de los runners amateur corren los días suaves demasiado rápido.</strong> Y los días de calidad demasiado lento. Resultado: nunca mejoran.</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">La regla es simple: <strong style="color:${TEXT};">80% del volumen a ritmo conversacional</strong> (puedes hablar). 20% en zona dura.</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">Si vas tan rápido el lunes que no puedes hablar, vas demasiado rápido. Frena. El cuerpo se adapta corriendo lento mucho tiempo, no rápido poco tiempo.</p>
      <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">En la app, <strong style="color:${TEXT};">Coach Jose te avisa</strong> si vas más rápido del ritmo objetivo. Sin él, lo más probable es que vayas un 15-20% por encima.</p>
    `;
    if (isEn) {
      body = `
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};"><strong style="color:${TEXT};">80% of amateur runners go too fast on easy days.</strong> And too slow on quality days. Result: they never improve.</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">The rule is simple: <strong style="color:${TEXT};">80% of volume at conversational pace</strong> (you can talk). 20% in hard zone.</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">If you go so fast on Monday you can't talk, you're going too fast. Slow down. The body adapts by running slow for a long time, not fast for a short time.</p>
        <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">In the app, <strong style="color:${TEXT};">Coach Jose tells you</strong> if you're going faster than the target pace. Without it, you're probably going 15-20% over.</p>
      `;
    }
    ctaLabel = isEn ? 'Open the app + Coach Jose →' : 'Abrir la app + Coach Jose →';
  } else if (idx === 2) {
    // Day 7
    eyebrow = isEn ? 'Plan · Day 07' : 'Plan · Día 07';
    h1Pre = isEn ? '7 days ' : '7 días ';
    h1Strong = isEn ? 'in.' : 'dentro.';
    preheader = isEn
      ? `How's your training for ${carrera} going?`
      : `¿Cómo va tu entrenamiento para ${carrera}?`;
    body = `
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">Llevas una semana. ¿Has empezado tu plan para <strong style="color:${TEXT};">${carrera}</strong>?</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">Si no, no pasa nada. Pero <strong style="color:${TEXT};">cada día que pasas sin entrenar es un día menos de adaptación</strong>. Tu cuerpo no progresa leyendo el plan.</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">Lo que necesitas para empezar:</p>
      <ul style="margin:0 0 18px 18px;padding:0;font-size:15px;line-height:1.7;color:${TEXT_72};">
        <li>Zapatillas (cualquier par sirve para empezar)</li>
        <li>30 minutos de tu semana</li>
        <li>La app instalada (recordatorios + Coach IA)</li>
      </ul>
      <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">Si la app no te convence, escríbenos a <a href="mailto:abraham.marquez@correrjuntos.com" style="color:${ORANGE};">abraham.marquez@correrjuntos.com</a> y vemos.</p>
    `;
    if (isEn) {
      body = `
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">It's been 7 days. Have you started your plan for <strong style="color:${TEXT};">${carrera}</strong>?</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">If not, no judgment. But <strong style="color:${TEXT};">every day without training is a day of lost adaptation</strong>. Your body doesn't progress by reading the plan.</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">What you need to start:</p>
        <ul style="margin:0 0 18px 18px;padding:0;font-size:15px;line-height:1.7;color:${TEXT_72};">
          <li>Shoes (any pair works to start)</li>
          <li>30 min of your week</li>
          <li>The app installed (reminders + Coach AI)</li>
        </ul>
        <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">If the app isn't your thing, email us at <a href="mailto:abraham.marquez@correrjuntos.com" style="color:${ORANGE};">abraham.marquez@correrjuntos.com</a> and let's chat.</p>
      `;
    }
    ctaLabel = isEn ? 'Install the app →' : 'Instalar la app →';
  } else if (idx === 3) {
    // Day 14
    eyebrow = isEn ? 'Plan · Day 14' : 'Plan · Día 14';
    h1Pre = isEn ? 'Last one. ' : 'Última. ';
    h1Strong = isEn ? '14 days free.' : '14 días gratis.';
    preheader = isEn
      ? 'No card. No commitment. Activate today.'
      : 'Sin tarjeta. Sin compromiso. Activa hoy.';
    body = `
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">Llevas <strong style="color:${TEXT};">14 días con el plan</strong> en tu inbox. No te he molestado más.</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">Si <strong style="color:${TEXT};">${carrera}</strong> es real y quieres llegar bien, esta es probablemente la última oportunidad de activar tu plan a tiempo.</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};"><strong style="color:${TEXT};">14 días gratis</strong> · sin tarjeta hasta el día 14 · cancela cuando quieras. Si no te convence, te olvidas y nada más.</p>
      <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">A partir de aquí, no te escribiré más sobre este plan. Si quieres seguir, descarga la app. Si no, te dejo en paz. <strong style="color:${TEXT};">Tú decides.</strong></p>
    `;
    if (isEn) {
      body = `
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">It's been <strong style="color:${TEXT};">14 days with the plan</strong> in your inbox. I haven't bothered you more.</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};">If <strong style="color:${TEXT};">${carrera}</strong> is real and you want to arrive in shape, this is probably your last chance to activate in time.</p>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};"><strong style="color:${TEXT};">14 days free</strong> · no card until day 14 · cancel anytime. If you don't love it, just forget it and move on.</p>
        <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};">From here, I won't write about this plan again. If you want to continue, download the app. If not, I'll leave you alone. <strong style="color:${TEXT};">You decide.</strong></p>
      `;
    }
    ctaLabel = isEn ? 'Activate 14 days free →' : 'Activar 14 días gratis →';
  }

  const ctaUrl = `https://www.correrjuntos.com/install?utm_source=plan_drip&utm_medium=email&utm_campaign=day_${DRIP_DELAYS_DAYS[idx]}&plan=${planSlug}`;
  const unsubUrl = `https://www.correrjuntos.com/plan?action=unsubscribe&email=${encodeURIComponent(sub.email)}`;
  const tagline = isEn ? 'RUN TOGETHER' : 'CORRE ACOMPAÑADO';

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>CorrerJuntos</title></head><body style="margin:0;padding:0;background:${BG};font-family:${FONT_BODY};color:${TEXT};-webkit-font-smoothing:antialiased;">
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
      <h1 style="margin:0;font-family:${FONT_BODY};font-size:44px;line-height:0.96;letter-spacing:-0.035em;font-weight:200;color:${TEXT};">${h1Pre}<strong style="font-weight:700;color:${ORANGE};font-style:normal;">${h1Strong}</strong></h1>
    </td></tr>
    <tr><td style="padding:28px 44px 0 44px;">${body}</td></tr>
    <tr><td style="padding:32px 44px 0 44px;">
      <a href="${ctaUrl}" style="display:inline-block;background:${ORANGE};color:#0b1220;font-family:${FONT_BODY};font-size:15px;font-weight:600;text-decoration:none;padding:14px 26px;border-radius:10px;letter-spacing:0.01em;">${ctaLabel}</a>
    </td></tr>
    <tr><td style="padding:30px 44px 34px 44px;">
      <div style="border-top:1px solid ${BORDER_12};padding-top:26px;">
        <div style="font-family:${FONT_BODY};font-size:26px;font-weight:800;letter-spacing:-0.03em;color:${TEXT};line-height:1;">Correr<em style="font-style:normal;color:${ORANGE};">Juntos</em></div>
        <div style="margin-top:8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;color:${ORANGE};"><a href="mailto:abraham.marquez@correrjuntos.com" style="color:${ORANGE};text-decoration:none;">abraham.marquez@correrjuntos.com</a></div>
      </div>
    </td></tr>
  </table>
  <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${TEXT_28};margin-top:26px;font-weight:500;">
    Meridian Motion &middot; <a href="https://www.correrjuntos.com" style="color:${TEXT_42};text-decoration:none;">correrjuntos.com</a>
  </div>
  <div style="margin-top:18px;font-family:${FONT_MONO};font-size:10px;color:${TEXT_28};">
    <a href="${unsubUrl}" style="color:${TEXT_42};text-decoration:underline;">${isEn ? 'Unsubscribe' : 'Cancelar suscripción'}</a>
  </div>
</td></tr>
</table>
</body></html>`;
}
