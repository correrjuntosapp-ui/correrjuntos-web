// Job: activation-push
// Day 1 / 3 / 7 push to NEW users who have not yet activated (no completed
// workout, no recorded run). This is the #1 leak: of ~200 signups/30d only
// ~25 create a plan and almost none complete a first workout.
//
// Why push (server-side, no app build):
//   - Re-engages new users in the critical first week before they churn.
//   - Mirrors trial-push.js pattern (direct Expo Push API + dedup log).
//
// Targets (signed up <= 8d ago, has valid Expo token, notifications not
// explicitly disabled, and NOT yet active):
//   - Day 1: nudge the first session today
//   - Day 3: "still in time" — lower the bar
//   - Day 7: gentle "let's pick it up" before they're gone
//
// Copy varies by whether the user already created a plan (hasPlan).
// Deep link: data.type='activation' → tapping opens the app (Plan/Home).
//
// Dedup: activation_push_log (user_id, day_n) unique. Service-role only.
//
// NOTE (9 jun 2026): audience grows as push tokens flow in (the plan-creation
// soft-ask pre-prompt shipped via OTA on runtime 1.3.18). Until then this job
// runs cheaply with processed/sent counts near 0 — by design, no-op safe.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const SEND_DAYS = [1, 3, 7];

// Short, action-oriented, no spam. Variant by hasPlan.
const TEMPLATES = {
  es: {
    1: {
      plan:   { title: 'Tu primer entreno te espera 👟', body: 'Hoy bastan 20 min suaves. Coach José te guía paso a paso.' },
      noplan: { title: '¿Empezamos hoy? 👟', body: 'Cuéntale a José tu objetivo y te armo el plan en 1 minuto.' },
    },
    3: {
      plan:   { title: 'El primer paso es el difícil', body: 'Tu plan sigue aquí. 20 min hoy y arrancas de verdad.' },
      noplan: { title: 'Tu plan está a 1 toque', body: 'Aún estás a tiempo. Crea tu plan gratis y sal a correr hoy.' },
    },
    7: {
      plan:   { title: '¿Lo retomamos?', body: 'Un entreno corto hoy y vuelves al ritmo. Sin presión.' },
      noplan: { title: 'Sigues a tiempo de empezar', body: 'Crea tu plan gratis y da el primer paso esta semana.' },
    },
  },
  en: {
    1: {
      plan:   { title: 'Your first session awaits 👟', body: 'Just 20 easy minutes today. Coach José guides you step by step.' },
      noplan: { title: 'Start today? 👟', body: 'Tell José your goal and I\'ll build your plan in 1 minute.' },
    },
    3: {
      plan:   { title: 'The first step is the hard one', body: 'Your plan is still here. 20 min today and you\'re moving.' },
      noplan: { title: 'Your plan is one tap away', body: 'Still time. Create your free plan and head out today.' },
    },
    7: {
      plan:   { title: 'Shall we pick it up?', body: 'A short session today and you\'re back on track. No pressure.' },
      noplan: { title: 'Still time to start', body: 'Create your free plan and take the first step this week.' },
    },
  },
};

async function sendExpoPush(token, title, body, data) {
  const payload = {
    to: token,
    title,
    body,
    sound: 'default',
    priority: 'high',
    badge: 1,
    data: data || {},
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

  const json = await res.json().catch(() => ({}));
  if (json.data?.status === 'ok') {
    return { ok: true, receipt: json.data.id, status: res.status };
  }
  return {
    ok: false,
    status: res.status,
    error: json.data?.message || json.errors?.[0]?.message || 'unknown',
  };
}

export default async function runActivationPush(_req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  const errors = [];

  // New signups within the Day-7 window (+1 day buffer).
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error: candErr } = await supabase
    .from('profiles')
    .select('id, push_token, idioma, created_at, notifications_enabled')
    .gte('created_at', eightDaysAgo)
    .not('push_token', 'is', null);

  if (candErr) {
    return res.status(500).json({ error: 'profiles_query_failed', detail: candErr.message });
  }

  // Keep only reachable Expo tokens, not explicitly opted out.
  const reachable = (candidates || []).filter(
    (p) =>
      typeof p.push_token === 'string' &&
      p.push_token.startsWith('ExponentPushToken') &&
      p.notifications_enabled !== false
  );

  if (reachable.length === 0) {
    return res.status(200).json({
      ok: true,
      job: 'activation-push',
      timestamp: new Date().toISOString(),
      processed: 0,
      sent: 0,
      skipped: 0,
      note: 'no_reachable_new_users_with_token',
    });
  }

  const userIds = reachable.map((p) => p.id);

  // Active = completed >=1 workout OR recorded >=1 run → don't nag them.
  const [{ data: doneWk }, { data: doneRuns }, { data: plans }, { data: logs }] = await Promise.all([
    supabase.from('user_workouts').select('user_id').eq('estado', 'completed').in('user_id', userIds),
    supabase.from('runs').select('user_id').in('user_id', userIds),
    supabase.from('user_plans').select('user_id').in('user_id', userIds),
    supabase.from('activation_push_log').select('user_id, day_n').in('user_id', userIds),
  ]);

  const activeSet = new Set();
  (doneWk || []).forEach((r) => activeSet.add(r.user_id));
  (doneRuns || []).forEach((r) => activeSet.add(r.user_id));

  const hasPlanSet = new Set();
  (plans || []).forEach((r) => hasPlanSet.add(r.user_id));

  const sentByUser = {};
  (logs || []).forEach((l) => {
    if (!sentByUser[l.user_id]) sentByUser[l.user_id] = new Set();
    sentByUser[l.user_id].add(l.day_n);
  });

  const now = Date.now();

  for (const p of reachable) {
    processed++;

    // Already activated → skip (no nagging).
    if (activeSet.has(p.id)) { skipped++; continue; }

    const daysSince = Math.floor((now - new Date(p.created_at).getTime()) / (24 * 60 * 60 * 1000));
    if (!SEND_DAYS.includes(daysSince)) { skipped++; continue; }

    // Already sent this day's push?
    if (sentByUser[p.id]?.has(daysSince)) { skipped++; continue; }

    const lang = p.idioma === 'en' ? 'en' : 'es';
    const hasPlan = hasPlanSet.has(p.id);
    const tmpl = TEMPLATES[lang][daysSince][hasPlan ? 'plan' : 'noplan'];

    const data = {
      type: 'activation',
      screen: hasPlan ? 'Plan' : 'Home',
      source: 'activation_push',
      day_n: daysSince,
    };

    const result = await sendExpoPush(p.push_token, tmpl.title, tmpl.body, data);

    await supabase.from('activation_push_log').insert({
      user_id: p.id,
      day_n: daysSince,
      push_status: result.status,
      push_receipt_id: result.receipt || null,
      error: result.ok ? null : (result.error || '').slice(0, 500),
    });

    if (result.ok) sent++;
    else errors.push({ user_id: p.id, day_n: daysSince, error: result.error });
  }

  return res.status(200).json({
    ok: true,
    job: 'activation-push',
    timestamp: new Date().toISOString(),
    processed,
    sent,
    skipped,
    errors_count: errors.length,
    errors: errors.slice(0, 10),
  });
}
