// Job: lifecycle-trial
// Sends Day 1/3/7/11/14 emails to trial subscribers.
// Was at api/cron/lifecycle-trial.js — moved here to dedupe under
// the api/cron/run.js dispatcher (Vercel Hobby 12-function limit).
//
// [21 jul 2026] Selección de hito delegada en lifecycle-core.js (compartido
// con el webhook de RevenueCat y los tests):
//  · ventana de gracia de 1 día — una ejecución diaria perdida ya no
//    pierde el hito para siempre (antes: daysSince ∈ [1,3,7,11,14] exacto);
//  · máximo UN hito por trial y ejecución — el más reciente permitido;
//  · nunca un hito anterior a otro ya enviado, ni hitos que ya eran pasado
//    cuando la fila se creó (backfills no disparan ráfagas históricas);
//  · separación mínima de 24h entre emails del mismo trial;
//  · razones de skip explícitas para observabilidad (sin datos personales).

import { createClient } from '@supabase/supabase-js';
import { getEmailForDay } from '../trial-email-templates.js';
import { selectMilestone } from '../../../supabase/functions/revenucat-webhook/lifecycle-core.js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';

export default async function runLifecycleTrial(_req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const BREVO_API_KEY = env.BREVO_API_KEY;
  const SENDER_EMAIL = env.BREVO_SENDER_EMAIL || 'abraham.marquez@correrjuntos.com';
  const SENDER_NAME = env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos';

  let processed = 0;
  let sent = 0;
  const skippedBy = {};
  const errors = [];

  const sixteenDaysAgo = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString();

  const { data: trials, error: trialsErr } = await supabase
    .from('trial_starts')
    .select('id, user_id, email, nombre, lang, started_at, created_at, expires_at, plan_type, status')
    .eq('status', 'trial_active')
    .gte('started_at', sixteenDaysAgo);

  if (trialsErr) {
    return res.status(500).json({ error: 'trials_query_failed', detail: trialsErr.message });
  }

  const trialIds = (trials || []).map((t) => t.id);
  let logsByTrial = {};
  if (trialIds.length > 0) {
    const { data: logs } = await supabase
      .from('trial_email_log')
      .select('trial_id, day_n, sent_at, brevo_status')
      .in('trial_id', trialIds);
    if (logs) {
      logsByTrial = logs.reduce((acc, l) => {
        if (!acc[l.trial_id]) acc[l.trial_id] = { days: new Set(), lastSentAt: null };
        // Solo cuentan como "enviados" los aceptados por Brevo (2xx).
        if (l.brevo_status >= 200 && l.brevo_status < 300) {
          acc[l.trial_id].days.add(l.day_n);
          if (!acc[l.trial_id].lastSentAt || l.sent_at > acc[l.trial_id].lastSentAt) {
            acc[l.trial_id].lastSentAt = l.sent_at;
          }
        }
        return acc;
      }, {});
    }
  }

  for (const trial of trials || []) {
    processed++;
    const logInfo = logsByTrial[trial.id] || { days: new Set(), lastSentAt: null };

    const pick = selectMilestone({
      status: trial.status,
      startedAt: trial.started_at,
      rowCreatedAt: trial.created_at,
      sentDays: [...logInfo.days],
      lastSentAt: logInfo.lastSentAt,
      nowMs: Date.now(),
      expiresAt: trial.expires_at || null,
    });

    if (pick.skip) {
      skippedBy[pick.skip] = (skippedBy[pick.skip] || 0) + 1;
      continue;
    }

    const dayN = pick.day;
    const tmpl = getEmailForDay(dayN, trial.lang || 'es', trial.nombre || '');
    if (!tmpl) {
      skippedBy.template_missing = (skippedBy.template_missing || 0) + 1;
      continue;
    }

    let brevoStatus = 0;
    let brevoMsgId = null;
    let errorMsg = null;
    try {
      const resBrevo = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { email: SENDER_EMAIL, name: SENDER_NAME },
          to: [{ email: trial.email, name: trial.nombre || trial.email }],
          subject: tmpl.subject,
          htmlContent: tmpl.html,
          tags: ['lifecycle-trial', `day-${dayN}`, trial.lang || 'es'],
        }),
      });
      brevoStatus = resBrevo.status;
      if (resBrevo.ok || resBrevo.status === 201) {
        const body = await resBrevo.json().catch(() => ({}));
        brevoMsgId = body.messageId || null;
        sent++;
      } else {
        const errBody = await resBrevo.json().catch(() => ({}));
        errorMsg = (errBody.message || errBody.code || 'brevo_send_failed').slice(0, 500);
        errors.push({ trial_id: trial.id, day_n: dayN, error: errorMsg });
      }
    } catch (e) {
      errorMsg = (e?.message || 'brevo_exception').slice(0, 500);
      errors.push({ trial_id: trial.id, day_n: dayN, error: errorMsg });
    }

    await supabase.from('trial_email_log').insert({
      trial_id: trial.id,
      day_n: dayN,
      brevo_message_id: brevoMsgId,
      brevo_status: brevoStatus,
      error: errorMsg,
    });

    // Observabilidad sanitizada: trial anonimizado, sin email ni nombre.
    console.log(JSON.stringify({
      scope: 'lifecycle-trial',
      trial: String(trial.user_id).slice(0, 8),
      day_n: dayN,
      brevo_status: brevoStatus,
      result: errorMsg ? 'provider_error' : 'accepted',
    }));
  }

  return res.status(200).json({
    ok: true,
    job: 'lifecycle-trial',
    timestamp: new Date().toISOString(),
    processed, sent,
    skipped: Object.values(skippedBy).reduce((a, b) => a + b, 0),
    skipped_by: skippedBy,
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
}
