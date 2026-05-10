// ============================================================
// Cron: lifecycle-trial.js
// Runs daily at 09:00 UTC. Sends day 1/3/7/11/14 emails to users
// in their trial period.
//
// Idempotent: each (trial_id, day_n) pair has UNIQUE constraint in
// trial_email_log so duplicate runs same day = no duplicate sends.
//
// Authentication:
//   Vercel cron hits this endpoint with a secret header that we
//   compare against CRON_SECRET. Manual triggers from outside Vercel
//   require ?token=<CRON_SECRET>.
//
// What gets sent:
//   For each trial_starts row where status='trial_active':
//     - days_since_start = floor((NOW() - started_at) / 1 day)
//     - if days_since_start ∈ {1,3,7,11,14} AND not already in
//       trial_email_log → send + record
//
// Returns JSON summary { processed, sent, skipped, errors }.
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const { getEmailForDay } = require('../_lib/trial-email-templates');

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET || '';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'hola@correrjuntos.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos';

// Days at which we send
const SEND_DAYS = [1, 3, 7, 11, 14];

module.exports = async function handler(req, res) {
  // Auth: Vercel cron sends "x-vercel-cron-signature" or the cron URL
  // contains a query token. Local/manual: ?token=<secret>.
  const isVercelCron = req.headers['x-vercel-cron'] === '1' ||
                       req.headers['user-agent']?.includes('vercel-cron');
  const tokenMatch = (req.query?.token || '') === CRON_SECRET && CRON_SECRET.length > 0;
  const authHeader = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  const headerMatch = authHeader === CRON_SECRET && CRON_SECRET.length > 0;

  if (!isVercelCron && !tokenMatch && !headerMatch) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!SUPABASE_SERVICE_KEY || !BREVO_API_KEY) {
    return res.status(500).json({
      error: 'misconfigured',
      have_supabase: !!SUPABASE_SERVICE_KEY,
      have_brevo: !!BREVO_API_KEY,
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  const errors = [];

  // Fetch all active trials with started_at within the last 16 days
  // (max send day is 14; +2 day buffer in case cron missed a day).
  const sixteenDaysAgo = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString();

  const { data: trials, error: trialsErr } = await supabase
    .from('trial_starts')
    .select('id, user_id, email, nombre, lang, started_at, plan_type, status')
    .eq('status', 'trial_active')
    .gte('started_at', sixteenDaysAgo);

  if (trialsErr) {
    return res.status(500).json({ error: 'trials_query_failed', detail: trialsErr.message });
  }

  // Pull existing log to avoid duplicates
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

    if (!SEND_DAYS.includes(daysSince)) {
      skipped++;
      continue;
    }

    const alreadySent = logsByTrial[trial.id]?.has(daysSince);
    if (alreadySent) {
      skipped++;
      continue;
    }

    const tmpl = getEmailForDay(daysSince, trial.lang || 'es', trial.nombre || '');
    if (!tmpl) {
      skipped++;
      continue;
    }

    // Send via Brevo
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

    // Always log (success or failure) — failures with non-NULL error column
    // so we can retry on next run if needed.
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
    timestamp: new Date().toISOString(),
    processed,
    sent,
    skipped,
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
};
