// ============================================================
// Cron dispatcher — single endpoint that branches by ?job=...
//
// Vercel Hobby plan limit: max 12 serverless functions per deploy.
// Consolidating cron jobs into one dispatcher to stay under limit.
//
// Schedules in vercel.json:
//   /api/cron/run?job=lifecycle-trial   → daily 09:00 UTC
//   /api/cron/run?job=recovery-ultra    → daily 09:05 UTC
//
// Auth: Vercel cron sends `x-vercel-cron` header, or pass ?token=
// matching CRON_SECRET env var, or `Authorization: Bearer <secret>`.
//
// [11 may 2026] Converted to ESM (package.json has "type":"module").
// Top-level `require` was crashing with ReferenceError.
// ============================================================

import runLifecycleTrial from '../_lib/jobs/lifecycle-trial.js';
import runRecoveryUltra from '../_lib/jobs/recovery-ultra.js';
import runTrialPush from '../_lib/jobs/trial-push.js';
import runPartnerQuedadas from '../_lib/jobs/partner-quedadas.js';
import runPlanDrip from '../_lib/jobs/plan-drip.js';
import runRecoveryFinde from '../_lib/jobs/recovery-finde.js';
import runUpdateBlast from '../_lib/jobs/update-blast.js';

const env = {
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME,
};
const CRON_SECRET = process.env.CRON_SECRET || '';

const JOBS = {
  'lifecycle-trial': runLifecycleTrial,
  'recovery-ultra': runRecoveryUltra,
  'trial-push': runTrialPush,
  'partner-quedadas': runPartnerQuedadas,
  'plan-drip': runPlanDrip,
  'recovery-finde': runRecoveryFinde,
  'update-blast': runUpdateBlast,
};

export default async function handler(req, res) {
  const isVercelCron = req.headers['x-vercel-cron'] === '1' ||
                       req.headers['user-agent']?.includes('vercel-cron');
  const tokenMatch = (req.query?.token || '') === CRON_SECRET && CRON_SECRET.length > 0;
  const authHeader = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  const headerMatch = authHeader === CRON_SECRET && CRON_SECRET.length > 0;

  if (!isVercelCron && !tokenMatch && !headerMatch) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!env.SUPABASE_SERVICE_KEY || !env.BREVO_API_KEY) {
    return res.status(500).json({
      error: 'misconfigured',
      have_supabase: !!env.SUPABASE_SERVICE_KEY,
      have_brevo: !!env.BREVO_API_KEY,
    });
  }

  const job = (req.query?.job || '').toString();
  const jobFn = JOBS[job];
  if (!jobFn) {
    return res.status(400).json({
      error: 'unknown_job',
      job,
      available: Object.keys(JOBS),
    });
  }

  try {
    return await jobFn(req, res, env);
  } catch (e) {
    console.error(`[cron/run] ${job} failed:`, e?.message || e);
    return res.status(500).json({ error: 'job_threw', job, message: (e?.message || '').slice(0, 500) });
  }
}
