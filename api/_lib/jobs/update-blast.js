// Job: update-blast (one-off, 1 jun 2026)
// Push notification + Brevo blast pidiendo Android update a v1.3.19
//
// Trigger:
//   GET /api/cron/run?job=update-blast
//   Authorization: Bearer <CRON_SECRET>
//
// Strategy:
//   - Push Expo a TODOS los push_tokens válidos (29 actualmente)
//   - Brevo email a TODOS los auth.users con email confirmado
//     Mensaje split-platform: Android (actualiza ya) / iOS (esperando Apple)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';
const APP_STORE_URL  = 'https://apps.apple.com/app/correr-juntos/id6758505910';
const UPDATE_LANDING = 'https://www.correrjuntos.com/?ref=update-blast';

// ── Email template (Meridian Motion dark) ─────────────────────
const ORANGE='#f97316', BG='#0b1220', TEXT='#f6f1e8';
const TEXT_72='rgba(246,241,232,0.72)', TEXT_42='rgba(246,241,232,0.42)', TEXT_28='rgba(246,241,232,0.28)';
const BORDER_08='rgba(246,241,232,0.08)', BORDER_12='rgba(246,241,232,0.12)';
const FONT_BODY="'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_MONO="'JetBrains Mono',SFMono-Regular,Consolas,Menlo,monospace";

function emailHtml(name, lang = 'es') {
  const isEn = lang === 'en';
  const eyebrow = isEn ? 'New version · v1.3.19' : 'Nueva versión · v1.3.19';
  const tagline = isEn ? 'RUN TOGETHER' : 'CORRE ACOMPAÑADO';
  const h1Pre   = isEn ? 'Big' : 'Hay';
  const h1Strong= isEn ? 'update' : 'novedades';
  const h1Post  = isEn ? `, ${name}.` : `, ${name}.`;

  const bodyEs = `
    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">Acabamos de subir <strong style="color:${TEXT};font-weight:600;">CorrerJuntos 1.3.19</strong> con 3 cambios pensados específicamente para acabar con la fricción del wizard de planes:</p>
    <ul style="margin:0 0 22px 0;padding-left:18px;font-size:14.5px;line-height:1.85;color:${TEXT_72};font-weight:400;">
      <li style="margin-bottom:6px;"><strong style="color:${TEXT};font-weight:600;">1 tap → tu plan 0→5K</strong> · adiós 5 pasos</li>
      <li style="margin-bottom:6px;">Fotos reales de carreras en los 7 planes</li>
      <li style="margin-bottom:6px;">Coach José insight post-entreno · fix widget tiempo</li>
    </ul>
    <div style="margin:24px 0;padding:20px;background:rgba(34,197,94,0.10);border:1px solid rgba(34,197,94,0.30);border-radius:12px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#22c55e;font-weight:700;margin-bottom:8px;">Si tienes Android</div>
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;color:${TEXT};">Ya está en Google Play. Abre la app y toca <strong>actualizar</strong>, o entra a Play Store:</p>
      <a href="${PLAY_STORE_URL}" target="_blank" style="display:inline-block;background:${ORANGE};color:${BG};padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;">Abrir Google Play  →</a>
    </div>
    <div style="margin:0 0 22px 0;padding:18px;background:rgba(246,241,232,0.04);border:1px solid ${BORDER_08};border-radius:12px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:700;margin-bottom:8px;">Si tienes iPhone</div>
      <p style="margin:0;font-size:14px;line-height:1.5;color:${TEXT_72};">Apple está revisando v1.3.19. Aprobación esperada esta semana. Te avisamos en cuanto esté disponible.</p>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.65;color:${TEXT_72};font-weight:400;">Responde a este email si algo no funciona — lo lee Abraham, fundador.</p>
  `;
  const bodyEn = `
    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">We just shipped <strong style="color:${TEXT};font-weight:600;">CorrerJuntos 1.3.19</strong> with 3 changes specifically aimed at killing the plan wizard friction:</p>
    <ul style="margin:0 0 22px 0;padding-left:18px;font-size:14.5px;line-height:1.85;color:${TEXT_72};font-weight:400;">
      <li style="margin-bottom:6px;"><strong style="color:${TEXT};font-weight:600;">1 tap → your 0→5K plan</strong> · no more 5 steps</li>
      <li style="margin-bottom:6px;">Real race photos on all 7 plans</li>
      <li style="margin-bottom:6px;">Coach José post-workout insight · weather widget fix</li>
    </ul>
    <div style="margin:24px 0;padding:20px;background:rgba(34,197,94,0.10);border:1px solid rgba(34,197,94,0.30);border-radius:12px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#22c55e;font-weight:700;margin-bottom:8px;">If you're on Android</div>
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;color:${TEXT};">It's live on Google Play. Open the app and tap <strong>update</strong>, or open Play Store:</p>
      <a href="${PLAY_STORE_URL}" target="_blank" style="display:inline-block;background:${ORANGE};color:${BG};padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;">Open Google Play  →</a>
    </div>
    <div style="margin:0 0 22px 0;padding:18px;background:rgba(246,241,232,0.04);border:1px solid ${BORDER_08};border-radius:12px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:700;margin-bottom:8px;">If you're on iPhone</div>
      <p style="margin:0;font-size:14px;line-height:1.5;color:${TEXT_72};">Apple is reviewing v1.3.19. Expected approval this week. We'll let you know as soon as it's available.</p>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.65;color:${TEXT_72};font-weight:400;">Reply to this email if something doesn't work — it's read by Abraham, founder.</p>
  `;

  const body = isEn ? bodyEn : bodyEs;
  const preheader = isEn ? `${name}, v1.3.19 is on Google Play — 1 tap = your plan.` : `${name}, v1.3.19 ya en Google Play — 1 tap = tu plan.`;

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>CorrerJuntos v1.3.19</title></head><body style="margin:0;padding:0;background:${BG};font-family:${FONT_BODY};color:${TEXT};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:48px 16px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${BG};border:1px solid ${BORDER_08};border-radius:20px;overflow:hidden;">
<tr><td style="padding:36px 44px 0 44px;"><span style="display:inline-block;width:10px;height:10px;background:${ORANGE};border-radius:999px;"></span></td></tr>
<tr><td style="padding:14px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:500;"><span style="color:${ORANGE};">&bull;</span>&nbsp;&nbsp;${eyebrow}</div></td></tr>
<tr><td style="padding:30px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${ORANGE};font-weight:500;"><span style="display:inline-block;width:36px;height:1px;background:${ORANGE};vertical-align:middle;margin-right:12px;"></span>${tagline}</div></td></tr>
<tr><td style="padding:30px 44px 0 44px;"><h1 style="margin:0;font-family:${FONT_BODY};font-size:44px;line-height:0.96;letter-spacing:-0.035em;font-weight:200;color:${TEXT};">${h1Pre} <strong style="font-weight:700;color:${ORANGE};font-style:normal;">${h1Strong}</strong>${h1Post}</h1></td></tr>
<tr><td style="padding:28px 44px 0 44px;">${body}</td></tr>
<tr><td style="padding:30px 44px 34px 44px;"><div style="border-top:1px solid ${BORDER_12};padding-top:26px;"><div style="font-family:${FONT_BODY};font-size:26px;font-weight:800;letter-spacing:-0.03em;color:${TEXT};line-height:1;">Correr<em style="font-style:normal;color:${ORANGE};">Juntos</em></div><div style="margin-top:8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;color:${ORANGE};"><a href="mailto:hola@correrjuntos.com" style="color:${ORANGE};text-decoration:none;">hola@correrjuntos.com</a></div></div></td></tr>
</table>
<div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${TEXT_28};margin-top:26px;font-weight:500;">Meridian Motion &middot; <a href="https://www.correrjuntos.com" style="color:${TEXT_42};text-decoration:none;">correrjuntos.com</a></div>
</td></tr></table></body></html>`;
}

const SUBJECT_ES = (name) => `${name}, v1.3.19 ya está disponible (Android)`;
const SUBJECT_EN = (name) => `${name}, v1.3.19 is now available (Android)`;

export default async function runUpdateBlast(_req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const BREVO_API_KEY = env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return res.status(500).json({ error: 'missing_brevo' });

  const SENDER_EMAIL = 'contacto@correrjuntos.com';
  const SENDER_NAME  = 'Abraham · CorrerJuntos';

  const results = { push: { sent: 0, failed: 0, errors: [] }, email: { sent: 0, failed: 0, errors: [] } };

  // ─── 1) PUSH NOTIFICATIONS to all users with push_token ────────
  const { data: pushUsers } = await supabase
    .from('profiles')
    .select('id, nombre, push_token')
    .not('push_token', 'is', null)
    .neq('push_token', '');

  const messages = (pushUsers || []).filter(u => u.push_token && u.push_token.startsWith('ExponentPushToken')).map(u => ({
    to: u.push_token,
    sound: 'default',
    title: 'Nueva versión · v1.3.19',
    body: `${u.nombre || ''}${u.nombre ? ', ' : ''}1 tap = tu plan 0→5K. Actualiza en Play Store`.trim(),
    data: { screen: 'PlayStore', url: PLAY_STORE_URL, ref: 'update-blast' },
    priority: 'high',
    channelId: 'default',
  }));

  if (messages.length > 0) {
    // Expo accepts up to 100 messages per request
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      try {
        const resp = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
        });
        const json = await resp.json();
        const data = json?.data || [];
        for (const ticket of data) {
          if (ticket?.status === 'ok') results.push.sent++;
          else { results.push.failed++; if (results.push.errors.length < 5) results.push.errors.push(ticket?.message || JSON.stringify(ticket).slice(0, 100)); }
        }
      } catch (e) {
        results.push.failed += batch.length;
        results.push.errors.push((e?.message || '').slice(0, 100));
      }
    }
  }

  // ─── 2) EMAIL BLAST via Brevo to all confirmed auth.users ──────
  // We hit /api/cron/run?job=update-blast (not paginated for one-off).
  // Limit: take 300 most recent registered to stay within Brevo daily quota.
  const { data: emailUsers } = await supabase
    .from('profiles')
    .select('id, nombre')
    .order('created_at', { ascending: false })
    .limit(300);

  // Join with auth.users to get email + email_confirmed_at + locale hint
  const userIds = (emailUsers || []).map(u => u.id);
  let authData = { users: [] };
  if (userIds.length > 0) {
    // Single-shot fetch via admin API (service role)
    const { data: adminPage } = await supabase.auth.admin.listUsers({ perPage: 500 });
    authData = adminPage || { users: [] };
  }
  const authMap = new Map((authData.users || []).map(u => [u.id, u]));

  const recipients = (emailUsers || [])
    .map(p => {
      const a = authMap.get(p.id);
      if (!a || !a.email || !a.email_confirmed_at) return null;
      const lang = (a.user_metadata?.locale || a.user_metadata?.lang || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
      const nombre = (p.nombre || a.user_metadata?.full_name || a.email.split('@')[0] || '').split(' ')[0];
      return { email: a.email, nombre, lang };
    })
    .filter(Boolean);

  for (const r of recipients) {
    const html = emailHtml(r.nombre, r.lang);
    const subject = r.lang === 'en' ? SUBJECT_EN(r.nombre) : SUBJECT_ES(r.nombre);
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': BREVO_API_KEY },
        body: JSON.stringify({
          sender: { email: SENDER_EMAIL, name: SENDER_NAME },
          replyTo: { email: SENDER_EMAIL, name: 'Abraham' },
          to: [{ email: r.email, name: r.nombre }],
          subject,
          htmlContent: html,
          tags: ['update-blast-1.3.19', `lang-${r.lang}`],
        }),
      });
      if (brevoRes.ok) results.email.sent++;
      else {
        results.email.failed++;
        if (results.email.errors.length < 5) {
          const body = await brevoRes.text();
          results.email.errors.push(`${brevoRes.status}: ${body.slice(0, 150)}`);
        }
      }
    } catch (e) {
      results.email.failed++;
      if (results.email.errors.length < 5) results.email.errors.push((e?.message || '').slice(0, 100));
    }
  }

  return res.status(200).json({
    ok: true,
    push: results.push,
    email: results.email,
    total_users_with_token: (pushUsers || []).length,
    total_email_recipients: recipients.length,
  });
}
