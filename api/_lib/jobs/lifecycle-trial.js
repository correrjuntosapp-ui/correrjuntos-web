// Job: lifecycle-trial
// Sends Day 1/3/7/11/14 emails to trial subscribers.
// Was at api/cron/lifecycle-trial.js — moved here to dedupe under
// the api/cron/run.js dispatcher (Vercel Hobby 12-function limit).

import { createClient } from '@supabase/supabase-js';
import { getEmailForDay } from '../trial-email-templates.js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';

const SEND_DAYS = [1, 3, 7, 11, 14];

export default async function runLifecycleTrial(_req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const BREVO_API_KEY = env.BREVO_API_KEY;
  const SENDER_EMAIL = env.BREVO_SENDER_EMAIL || 'hola@correrjuntos.com';
  const SENDER_NAME = env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos';

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  const errors = [];

  const sixteenDaysAgo = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString();

  const { data: trials, error: trialsErr } = await supabase
    .from('trial_starts')
    .select('id, user_id, email, nombre, lang, started_at, plan_type, status')
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
      .select('trial_id, day_n')
      .in('trial_id', trialIds);
    if (logs) {
      logsByTrial = logs.reduce((acc, l) => {
        if (!acc[l.trial_id]) acc[l.trial_id] = new Set();
        acc[l.trial_id].add(l.day_n);
        return acc;
      }, {});
    }
  }

  for (const trial of trials || []) {
    processed++;
    const startedAt = new Date(trial.started_at).getTime();
    const daysSince = Math.floor((Date.now() - startedAt) / (24 * 60 * 60 * 1000));

    if (!SEND_DAYS.includes(daysSince)) { skipped++; continue; }
    if (logsByTrial[trial.id]?.has(daysSince)) { skipped++; continue; }

    const tmpl = getEmailForDay(daysSince, trial.lang || 'es', trial.nombre || '');
    if (!tmpl) { skipped++; continue; }

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
          tags: ['lifecycle-trial', `day-${daysSince}`, trial.lang || 'es'],
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
        errors.push({ trial_id: trial.id, day_n: daysSince, error: errorMsg });
      }
    } catch (e) {
      errorMsg = (e?.message || 'brevo_exception').slice(0, 500);
      errors.push({ trial_id: trial.id, day_n: daysSince, error: errorMsg });
    }

    await supabase.from('trial_email_log').insert({
      trial_id: trial.id,
      day_n: daysSince,
      brevo_message_id: brevoMsgId,
      brevo_status: brevoStatus,
      error: errorMsg,
    });
  }

  return res.status(200).json({
    ok: true,
    job: 'lifecycle-trial',
    timestamp: new Date().toISOString(),
    processed, sent, skipped,
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
}
