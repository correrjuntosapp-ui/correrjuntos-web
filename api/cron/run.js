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


const env = {
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME,
  // Interruptor de la newsletter automatica. Fail-closed: si no llega, los jobs
  // lo interpretan como apagado. Sin esta linea nunca llegaria a los handlers.
  WEEKLY_NEWSLETTER_AUTOMATION_ENABLED: process.env.WEEKLY_NEWSLETTER_AUTOMATION_ENABLED,
};
const CRON_SECRET = process.env.CRON_SECRET || '';

const JOBS = {
  'lifecycle-trial': () => import('../_lib/jobs/lifecycle-trial.js'),
  'recovery-ultra': () => import('../_lib/jobs/recovery-ultra.js'),
  'trial-push': () => import('../_lib/jobs/trial-push.js'),
  'partner-quedadas': () => import('../_lib/jobs/partner-quedadas.js'),
  'plan-drip': () => import('../_lib/jobs/plan-drip.js'),
  'recovery-finde': () => import('../_lib/jobs/recovery-finde.js'),
  'update-blast': () => import('../_lib/jobs/update-blast.js'),
  'weekly-newsletter': () => import('../_lib/jobs/weekly-newsletter.js'),
  'weekly-newsletter-prepare': () => import('../_lib/jobs/weekly-newsletter-prepare.js'),
  'weekly-newsletter-preflight': () => import('../_lib/jobs/weekly-newsletter-preflight.js'),
  'founder-blast': () => import('../_lib/jobs/founder-blast.js'),
  'activation-push': () => import('../_lib/jobs/activation-push.js'),
  'premium-expiry': () => import('../_lib/jobs/premium-expiry.js'),
  'workout-eve-push': () => import('../_lib/jobs/workout-eve-push.js'),
  'health-check': () => import('../_lib/jobs/health-check.js'),
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
  const loadJob = JOBS[job];
  if (!loadJob) {
    return res.status(400).json({
      error: 'unknown_job',
      job,
      available: Object.keys(JOBS),
    });
  }

  // Carga perezosa: solo se importa el modulo del job solicitado, ya
  // autenticado y validado. Asi un modulo roto afecta unicamente a ese job
  // y no tumba el dispatcher entero (antes los 13 imports de cabecera hacian
  // que un fallo de resolucion devolviera 500 en todas las peticiones).
  let jobFn;
  try {
    const mod = await loadJob();
    jobFn = mod?.default;
    if (typeof jobFn !== 'function') throw new Error('no default export');
  } catch (e) {
    console.error('[cron/run] no se pudo cargar el job ' + job);
    return res.status(500).json({ error: 'job_load_failed', job });
  }

  try {
    return await jobFn(req, res, env);
  } catch (e) {
    // El detalle se queda en los logs de Vercel. En la respuesta no viaja nada
    // del error: un mensaje puede llevar URLs con credenciales, rutas internas
    // o fragmentos de la consulta que lo provoco.
    // Ni en la respuesta ni en el log va el mensaje del error: puede llevar
    // URLs con credenciales, rutas internas o fragmentos de la consulta.
    console.error('[cron/run] job_threw', job);
    return res.status(500).json({ error: 'job_threw', job });
  }
}
