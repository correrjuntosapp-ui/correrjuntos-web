// Job: trial-push
// Sends Day 12/14/15 push notifications to trial users via Expo Push API.
// Captures trials about to expire silently (highest conversion-recovery point).
// Cron schedule: daily 10:00 UTC (1h after lifecycle-trial email cron).
//
// Why push (not email):
//   - Lifecycle emails (Brevo) already fire Day 1/3/7/11/14
//   - Push has 5-10× higher open rate (vs email open ~25-30%)
//   - Direct interrupt: phone alert vs inbox scroll
//   - Industry data: trial-save push conversion 3-8%
//
// Push targets:
//   - Day 12: "Quedan 2 días gratis" → gentle reminder
//   - Day 14 (last day): "Trial acaba HOY 9pm · sigue con Premium"
//   - Day 15 (just expired): "Trial terminó · 50% descuento si vuelves hoy"
//
// Deep link: data.screen = 'Paywall' → app navigates straight to checkout.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const SEND_DAYS = [12, 14, 15];

// Push message templates — keep short, action-oriented, time-bound.
const TEMPLATES = {
  es: {
    12: {
      title: 'Quedan 2 días gratis',
      body: 'Tu trial Premium acaba el {date}. ¿Sigues con el plan?',
    },
    14: {
      title: 'Tu trial acaba HOY',
      body: 'Última oportunidad · sigue con Premium sin perder tu plan',
    },
    15: {
      title: 'Trial terminó · 50% descuento',
      body: '¿Vuelves? Recupera Premium con 50% off el primer mes',
    },
  },
  en: {
    12: {
      title: '2 days left of free trial',
      body: 'Your Premium trial ends {date}. Keep your plan?',
    },
    14: {
      title: 'Your trial ends TODAY',
      body: 'Last chance · keep Premium without losing your plan',
    },
    15: {
      title: 'Trial ended · 50% off',
      body: 'Coming back? Recover Premium with 50% off first month',
    },
  },
};

function formatDate(d, lang = 'es') {
  const date = new Date(d);
  const days = lang === 'es'
    ? ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
    : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return `${days[date.getDay()]} ${date.getDate()}`;
}

async function sendExpoPush(token, title, body, data) {
  const payload = {
    to: token,
    title,
    body,
    sound: 'default',
    priority: 'high',
    badge: 1,
    data: data || { screen: 'Paywall' },
  };

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'accept-encoding': 'gzip, deflate',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body_ = await res.json().catch(() => ({}));
  // Expo returns { data: { status: 'ok', id: '...' } } or { data: { status: 'error', message: '...' } }
  if (body_.data?.status === 'ok') {
    return { ok: true, receipt: body_.data.id, status: res.status };
  }
  return {
    ok: false,
    status: res.status,
    error: body_.data?.message || body_.errors?.[0]?.message || 'unknown',
  };
}

export default async function runTrialPush(_req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  const errors = [];

  // Look at trials started in last 16 days (Day 15 window + 1 day buffer)
  const sixteenDaysAgo = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString();

  // Trial users active + recently expired
  // [NOTE] We include status='expired' for Day 15 (post-expiration recovery push).
  // Day 12 and Day 14 only apply to status='trial_active'.
  const { data: trials, error: trialsErr } = await supabase
    .from('trial_starts')
    .select('id, user_id, email, nombre, lang, started_at, status')
    .in('status', ['trial_active', 'expired'])
    .gte('started_at', sixteenDaysAgo);

  if (trialsErr) {
    return res.status(500).json({ error: 'trials_query_failed', detail: trialsErr.message });
  }

  if (!trials || trials.length === 0) {
    return res.status(200).json({
      ok: true,
      job: 'trial-push',
      timestamp: new Date().toISOString(),
      processed: 0,
      sent: 0,
      skipped: 0,
      note: 'no_active_or_recent_trials',
    });
  }

  // Get push tokens for these users
  const userIds = trials.map((t) => t.user_id).filter(Boolean);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, push_token, push_provider')
    .in('id', userIds);

  const tokensByUser = {};
  if (profiles) {
    profiles.forEach((p) => {
      if (p.push_token) tokensByUser[p.id] = p.push_token;
    });
  }

  // Get push log to avoid duplicates
  const trialIds = trials.map((t) => t.id);
  const { data: pushLogs } = await supabase
    .from('trial_push_log')
    .select('trial_id, day_n')
    .in('trial_id', trialIds);

  const sentByTrial = {};
  if (pushLogs) {
    pushLogs.forEach((l) => {
      if (!sentByTrial[l.trial_id]) sentByTrial[l.trial_id] = new Set();
      sentByTrial[l.trial_id].add(l.day_n);
    });
  }

  for (const trial of trials) {
    processed++;
    const startedAt = new Date(trial.started_at).getTime();
    const daysSince = Math.floor((Date.now() - startedAt) / (24 * 60 * 60 * 1000));

    // Determine which push (if any) applies today
    let dayN = null;
    if (daysSince === 12 && trial.status === 'trial_active') dayN = 12;
    else if (daysSince === 14 && trial.status === 'trial_active') dayN = 14;
    else if (daysSince === 15) dayN = 15;

    if (!dayN) { skipped++; continue; }

    // Already sent?
    if (sentByTrial[trial.id]?.has(dayN)) { skipped++; continue; }

    const token = tokensByUser[trial.user_id];
    if (!token) {
      // User has no push token registered — skip silently
      // (lifecycle-trial email cron handles them via email channel)
      skipped++;
      continue;
    }
    if (!token.startsWith('ExponentPushToken')) {
      // Not a valid Expo token — skip (might be FCM/APNS raw)
      skipped++;
      continue;
    }

    const lang = trial.lang === 'en' ? 'en' : 'es';
    const tmpl = TEMPLATES[lang][dayN];
    const trialEnd = new Date(startedAt + 14 * 24 * 60 * 60 * 1000);
    const body = tmpl.body.replace('{date}', formatDate(trialEnd, lang));

    const data = { screen: 'Paywall', source: 'trial_push', day_n: dayN };
    const result = await sendExpoPush(token, tmpl.title, body, data);

    await supabase.from('trial_push_log').insert({
      trial_id: trial.id,
      day_n: dayN,
      push_status: result.status,
      push_receipt_id: result.receipt || null,
      error: result.ok ? null : (result.error || '').slice(0, 500),
    });

    if (result.ok) {
      sent++;
    } else {
      errors.push({ trial_id: trial.id, day_n: dayN, error: result.error });
    }
  }

  return res.status(200).json({
    ok: true,
    job: 'trial-push',
    timestamp: new Date().toISOString(),
    processed,
    sent,
    skipped,
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
}
