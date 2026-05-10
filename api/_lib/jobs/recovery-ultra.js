// Job: recovery-ultra
// Sends Day 1-10 post-ultra recovery emails to subscribers.
// Was at api/cron/recovery-ultra.js — consolidated under api/cron/run.js.

const { createClient } = require('@supabase/supabase-js');
const { getEmailForDay } = require('../ultra-recovery-templates');

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SEND_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

module.exports = async function runRecoveryUltra(_req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const BREVO_API_KEY = env.BREVO_API_KEY;
  const SENDER_EMAIL = env.BREVO_SENDER_EMAIL || 'hola@correrjuntos.com';
  const SENDER_NAME = env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos';

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let completed = 0;
  const errors = [];

  const twelveDaysAgo = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString();

  const { data: subs, error: subsErr } = await supabase
    .from('ultra_recovery_subscribers')
    .select('id, email, nombre, lang, started_at, status, race_source')
    .eq('status', 'active')
    .gte('started_at', twelveDaysAgo);

  if (subsErr) {
    return res.status(500).json({ error: 'subs_query_failed', detail: subsErr.message });
  }

  const subIds = (subs || []).map((s) => s.id);
  let logsBySub = {};
  if (subIds.length > 0) {
    const { data: logs } = await supabase
      .from('ultra_recovery_email_log')
      .select('subscriber_id, day_n')
      .in('subscriber_id', subIds);
    if (logs) {
      logsBySub = logs.reduce((acc, l) => {
        if (!acc[l.subscriber_id]) acc[l.subscriber_id] = new Set();
        acc[l.subscriber_id].add(l.day_n);
        return acc;
      }, {});
    }
  }

  for (const sub of subs || []) {
    processed++;
    const startedAt = new Date(sub.started_at).getTime();
    const daysSince = Math.floor((Date.now() - startedAt) / (24 * 60 * 60 * 1000));
    const dayN = daysSince + 1;

    if (!SEND_DAYS.includes(dayN)) {
      const sentSet = logsBySub[sub.id] || new Set();
      if (sentSet.size >= 10) {
        await supabase.from('ultra_recovery_subscribers')
          .update({ status: 'completed' })
          .eq('id', sub.id);
        completed++;
      }
      skipped++;
      continue;
    }
    if (logsBySub[sub.id]?.has(dayN)) { skipped++; continue; }

    const tmpl = getEmailForDay(dayN, sub.lang || 'es', sub.nombre || '');
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
          to: [{ email: sub.email, name: sub.nombre || sub.email }],
          subject: tmpl.subject,
          htmlContent: tmpl.html,
          tags: ['ultra-recovery', `day-${dayN}`, sub.lang || 'es', `source-${sub.race_source || 'generic'}`],
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
        errors.push({ subscriber_id: sub.id, day_n: dayN, error: errorMsg });
      }
    } catch (e) {
      errorMsg = (e?.message || 'brevo_exception').slice(0, 500);
      errors.push({ subscriber_id: sub.id, day_n: dayN, error: errorMsg });
    }

    await supabase.from('ultra_recovery_email_log').insert({
      subscriber_id: sub.id,
      day_n: dayN,
      brevo_message_id: brevoMsgId,
      brevo_status: brevoStatus,
      error: errorMsg,
    });

    if (dayN === 10 && !errorMsg) {
      await supabase.from('ultra_recovery_subscribers')
        .update({ status: 'completed' })
        .eq('id', sub.id);
      completed++;
    }
  }

  return res.status(200).json({
    ok: true,
    job: 'recovery-ultra',
    timestamp: new Date().toISOString(),
    processed, sent, skipped, completed,
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
};
