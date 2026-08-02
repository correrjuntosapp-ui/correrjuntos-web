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
// Auth: SOLO secreto compartido via `Authorization: Bearer <CRON_SECRET>`.
// Las cabeceras x-vercel-cron y User-Agent NO autorizan: son falsificables.
// ?token= se mantiene por retrocompatibilidad pero está desaconsejado.
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
import runWeeklyNewsletter from '../_lib/jobs/weekly-newsletter.js';
import runFounderBlast from '../_lib/jobs/founder-blast.js';
import runActivationPush from '../_lib/jobs/activation-push.js';
import runPremiumExpiry from '../_lib/jobs/premium-expiry.js';
import runWorkoutEvePush from '../_lib/jobs/workout-eve-push.js';
import runHealthCheck from '../_lib/jobs/health-check.js';

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
  'weekly-newsletter': runWeeklyNewsletter,
  'founder-blast': runFounderBlast,
  'activation-push': runActivationPush,
  'premium-expiry': runPremiumExpiry,
  'workout-eve-push': runWorkoutEvePush,
  'health-check': runHealthCheck,
};

export default async function handler(req, res) {
  // Autenticación: SOLO secreto compartido.
  //
  // Antes se aceptaba `x-vercel-cron: 1` o un User-Agent que contuviera
  // 'vercel-cron'. Ambas son cabeceras de petición que cualquiera puede
  // falsificar con un curl, así que cualquier persona en internet podía
  // disparar los jobs (incluido el envío real de la newsletter). Eliminado.
  //
  // Los cron de Vercel se configuran con la cabecera Authorization, así que
  // siguen funcionando. Nunca se registra ni se devuelve el secreto.
  const hasSecret = typeof CRON_SECRET === 'string' && CRON_SECRET.length > 0;
  const bearer = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  const headerMatch = hasSecret && bearer.length === CRON_SECRET.length && bearer === CRON_SECRET;
  // Retrocompatibilidad temporal: ?token=. Desaconsejado — queda registrado en
  // logs de acceso y en el historial de URLs. Migrar a Authorization Bearer.
  const tokenMatch = hasSecret && (req.query?.token || '') === CRON_SECRET;

  if (!headerMatch && !tokenMatch) {
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
