// ============================================================
// TRIAL REMINDER CRON — Edge Function
//
// Runs daily (scheduled via pg_cron at 10:00 Europe/Madrid).
// For each user with an active trial:
//   - 2 days before trial_ends_at → send "trial-ends-in-2-days" push + email
//   - Same day (≤24h before) → send "trial-ends-today" push + email
//
// Idempotent: stamps profiles.trial_reminder_d12_at /
// profiles.trial_reminder_d14_at to prevent duplicate sends.
//
// Triggered manually for testing:
//   curl -X POST <fn_url> -H "Authorization: Bearer <anon_key>"
//
// To schedule daily (run AFTER reviewing copy with founder):
//   SELECT cron.schedule(
//     'trial-reminder-daily',
//     '15 10 * * *',  -- 10:15 Madrid daily (UTC offset auto)
//     $$SELECT net.http_post(
//       url:='https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/trial-reminder-cron',
//       headers:='{"Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb
//     )$$
//   );
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Profile {
  id: string
  nombre: string | null
  email: string | null
  trial_ends_at: string
  trial_reminder_d12_at: string | null
  trial_reminder_d14_at: string | null
  push_token: string | null
  notif_push: boolean | null
  idioma: string | null
}

const COPY = {
  es: {
    d12_push_title: 'Tu prueba Premium acaba en 2 días',
    d12_push_body: 'Si quieres mantener tu plan adaptativo y tus matches ilimitados, aprovecha el 40% de descuento anual.',
    d14_push_title: 'Tu prueba Premium acaba hoy',
    d14_push_body: 'Última oportunidad para guardar tu plan. Cancela en cualquier momento desde Ajustes.',
    d12_email_subject: 'Tu prueba Premium acaba en 2 días — guarda tu plan adaptativo',
    d14_email_subject: 'Última llamada — tu prueba Premium acaba hoy',
  },
  en: {
    d12_push_title: 'Your Premium trial ends in 2 days',
    d12_push_body: 'Keep your adaptive plan and unlimited matches — annual is 40% off.',
    d14_push_title: 'Your Premium trial ends today',
    d14_push_body: 'Last chance to keep your training plan. Cancel anytime from Settings.',
    d12_email_subject: 'Your Premium trial ends in 2 days — save your adaptive plan',
    d14_email_subject: 'Last call — your Premium trial ends today',
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = Deno.env.get('SUPABASE_URL')!
  const key = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
  const supabase = createClient(url, key)

  try {
    const now = new Date()

    // Window 1: trial ends in 36-60h (~2 days). Targets 2-day reminder.
    const d12Lower = new Date(now.getTime() + 36 * 60 * 60 * 1000)
    const d12Upper = new Date(now.getTime() + 60 * 60 * 60 * 1000)

    // Window 2: trial ends in 0-30h (~today/tomorrow). Targets last-day reminder.
    const d14Upper = new Date(now.getTime() + 30 * 60 * 60 * 1000)

    // Pull candidates for both windows.
    const { data: candidates, error } = await supabase
      .from('profiles')
      .select('id, nombre, email, trial_ends_at, trial_reminder_d12_at, trial_reminder_d14_at, push_token, notif_push, idioma')
      .not('trial_ends_at', 'is', null)
      .gte('trial_ends_at', now.toISOString())
      .lte('trial_ends_at', d12Upper.toISOString())

    if (error) throw error

    const sent: { user: string; reminder: 'd12' | 'd14' }[] = []
    const skipped: { user: string; reason: string }[] = []

    for (const p of (candidates || []) as Profile[]) {
      const trialEnds = new Date(p.trial_ends_at)
      const lang = (p.idioma || 'es') as 'es' | 'en'
      const copy = COPY[lang] || COPY.es

      // Decide which reminder applies
      let reminderType: 'd12' | 'd14' | null = null
      if (trialEnds <= d14Upper && !p.trial_reminder_d14_at) {
        reminderType = 'd14'
      } else if (trialEnds >= d12Lower && trialEnds <= d12Upper && !p.trial_reminder_d12_at) {
        reminderType = 'd12'
      }

      if (!reminderType) {
        skipped.push({ user: p.id, reason: 'already_sent_or_out_of_window' })
        continue
      }

      const pushTitle = reminderType === 'd14' ? copy.d14_push_title : copy.d12_push_title
      const pushBody  = reminderType === 'd14' ? copy.d14_push_body  : copy.d12_push_body
      const emailSubject = reminderType === 'd14' ? copy.d14_email_subject : copy.d12_email_subject

      // Send push (best-effort — doesn't block the email)
      if (p.push_token && p.notif_push !== false) {
        try {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: p.push_token,
              sound: 'default',
              title: pushTitle,
              body: pushBody,
              data: { screen: 'Paywall', source: 'trial_reminder', day: reminderType },
            }),
          })
        } catch (e) {
          console.warn('push send failed', p.id, e)
        }
      }

      // Send email via Brevo (transactional — separate template would be ideal, simple fallback here)
      if (p.email) {
        try {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': Deno.env.get('BREVO_API_KEY') || '',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: 'CorrerJuntos', email: 'hola@correrjuntos.com' },
              to: [{ email: p.email, name: p.nombre || undefined }],
              subject: emailSubject,
              htmlContent: buildEmailHtml(lang, reminderType, p.nombre || ''),
            }),
          })
        } catch (e) {
          console.warn('email send failed', p.id, e)
        }
      }

      // Stamp the profile so we never double-send
      const stampField = reminderType === 'd14' ? 'trial_reminder_d14_at' : 'trial_reminder_d12_at'
      await supabase
        .from('profiles')
        .update({ [stampField]: now.toISOString() })
        .eq('id', p.id)

      sent.push({ user: p.id, reminder: reminderType })
    }

    return new Response(
      JSON.stringify({
        ok: true,
        sent_count: sent.length,
        skipped_count: skipped.length,
        sent,
        skipped,
        ran_at: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('trial-reminder-cron error', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function buildEmailHtml(lang: 'es' | 'en', day: 'd12' | 'd14', name: string): string {
  const isEs = lang === 'es'
  const greeting = isEs ? `Hola${name ? `, ${name}` : ''}` : `Hi${name ? `, ${name}` : ''}`
  const headline = day === 'd14'
    ? (isEs ? 'Tu prueba Premium acaba hoy' : 'Your Premium trial ends today')
    : (isEs ? 'Tu prueba Premium acaba en 2 días' : 'Your Premium trial ends in 2 days')
  const body = day === 'd14'
    ? (isEs
        ? 'Si quieres conservar tu plan adaptativo, tus matches ilimitados y el resto de funciones Premium, no hace falta que hagas nada — la suscripción se activará automáticamente. Si prefieres cancelar, hazlo desde Ajustes en cualquier momento.'
        : 'If you want to keep your adaptive plan, unlimited matches and the rest of Premium features, you don\'t need to do anything — your subscription will activate automatically. To cancel, go to Settings anytime.')
    : (isEs
        ? 'Tu plan adaptativo, los matches ilimitados y el resto de funciones Premium están a tu disposición durante 2 días más. Si decides quedarte, el plan anual te ahorra un 40% (29,99€/año vs 4,99€/mes).'
        : 'Your adaptive plan, unlimited matches and other Premium features are yours for 2 more days. If you stay, the annual plan saves you 40% ($29.99/yr vs $4.99/mo).')
  const cta = isEs ? 'Abrir CorrerJuntos' : 'Open CorrerJuntos'
  const footer = isEs
    ? 'Cancela en cualquier momento desde Ajustes → Suscripción.'
    : 'Cancel anytime from Settings → Subscription.'

  return `<!doctype html><html><body style="margin:0;padding:32px;background:#fafaf7;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#0f0e0c">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid rgba(0,0,0,.06)">
      <p style="font-size:14px;color:#78716c;margin:0 0 8px">${greeting}</p>
      <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.025em;line-height:1.15;margin:0 0 16px;color:#0f0e0c">${headline}</h1>
      <p style="font-size:15px;line-height:1.55;color:#292524;margin:0 0 24px">${body}</p>
      <a href="https://correrjuntos.com" style="display:inline-block;background:#0f0e0c;color:#fff;text-decoration:none;padding:13px 28px;border-radius:12px;font-weight:700;font-size:14px">${cta}</a>
      <p style="margin-top:32px;font-size:12px;color:#78716c">${footer}</p>
    </div>
    <p style="text-align:center;font-size:11px;color:#a8a29e;margin:24px 0 0">CorrerJuntos · hola@correrjuntos.com</p>
  </body></html>`
}
