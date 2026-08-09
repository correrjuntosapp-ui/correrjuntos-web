// ============================================================================
// F108 · Rama EMAIL del job de activación (dry-run first)
//
// Vive DENTRO del job activation-push existente: no hay cron nuevo.
//
// Contratos innegociables (orden F108):
//   · user_id es la identidad canónica. NUNCA se deduplica por cadena de email.
//   · El email solo se considera si NO hay token push válido, y se REVERIFICA
//     dentro de la reserva: si aparece token, gana el push.
//   · Máx. 1 activación real por usuario y fecha local, entre email y push.
//   · Con dry_run=true es IMPOSIBLE alcanzar el endpoint de envío.
//   · Fail closed ante cualquier error (Supabase, Brevo, identidad, timezone).
//   · Cero PII en logs: motivos de supresión de lista cerrada.
// ============================================================================

import crypto from 'node:crypto';
import { canSendNow } from './push-guards.js';

export const EXPERIMENT = 'f107_first_workout_email_v1';

// ── Asignación determinista y estable ───────────────────────────────────────
// Depende SOLO de user_id + versión del experimento. No del canal, no de la
// fecha, no del orden de ejecución. Cambiar la versión reasigna hacia delante;
// el histórico queda congelado porque `arm` se persiste al reservar.
export function assignArm(userId, experiment = EXPERIMENT) {
  const h = crypto.createHash('sha256').update(`${userId}:${experiment}`).digest();
  const bucket = h.readUInt32BE(0) % 100;
  return bucket < 85 ? 'treatment' : 'holdout';
}

// ── Ventana 20-28 h ─────────────────────────────────────────────────────────
export function isInWindow(createdAt, now) {
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return false;            // fail closed
  const h = (now.getTime() - t) / 3600000;
  return h >= 20 && h <= 28;
}

// ── Fecha local del usuario (fail closed sin país fiable) ───────────────────
const TZ_BY_COUNTRY = {
  ES: 'Europe/Madrid', MX: 'America/Mexico_City', AR: 'America/Argentina/Buenos_Aires',
  CL: 'America/Santiago', CO: 'America/Bogota', PE: 'America/Lima',
  GB: 'Europe/London', FR: 'Europe/Paris', PT: 'Europe/Lisbon',
  IT: 'Europe/Rome', DE: 'Europe/Berlin', US: 'America/New_York', BR: 'America/Sao_Paulo',
};
export function localDateFor(now, pais) {
  const tz = TZ_BY_COUNTRY[String(pais || '').toUpperCase()] || 'Europe/Madrid';
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  } catch {
    return null;                                     // fail closed: sin fecha no se reserva
  }
}

// ── Lunes en franja del boletín (08:00 UTC) ─────────────────────────────────
export function isNewsletterWindow(now) {
  return now.getUTCDay() === 1 && now.getUTCHours() >= 7 && now.getUTCHours() < 10;
}

// ── Resolución de identidad: email → user_id, fail closed si es ambiguo ─────
export function resolveSingleUserId(rows) {
  if (!Array.isArray(rows) || rows.length !== 1) return null;
  return rows[0].id || null;
}

export const SUPPRESSION_REASONS = new Set([
  'optout', 'brevo_blocked', 'hard_bounce', 'complaint', 'push_took_priority',
  'trial_active', 'already_dispatched_today', 'no_active_plan', 'already_activated',
  'quiet_hours', 'email_unresolvable', 'credits_exhausted', 'kill_switch',
  'holdout', 'newsletter_window', 'daily_limit', 'brevo_lookup_failed',
]);

/**
 * Ejecuta la rama de email. `deps` inyecta todo lo externo para que el harness
 * pueda sustituirlo. `deps.sendEmail` NO se invoca jamás en dry-run.
 */
export async function runActivationEmailBranch(deps) {
  const {
    supabase, now, sendEmail, brevoLookup, config,
    log = () => {},
  } = deps;

  const counters = {
    candidatos: 0, treatment: 0, holdout: 0, simulados: 0, enviados: 0,
    brevo_get: 0, brevo_send_calls: 0, errores: 0,
    excluidos: {},
  };
  const bump = (r) => { counters.excluidos[r] = (counters.excluidos[r] || 0) + 1; };

  if (!config || config.enabled !== true) { counters.kill_switch = true; return counters; }
  const dryRun = config.dry_run !== false;   // por defecto SIMULA (fail closed)

  // 1 · Candidatos: SIN token de push, alta en ventana 20-28 h
  const from = new Date(now.getTime() - 29 * 3600000).toISOString();
  const to = new Date(now.getTime() - 19 * 3600000).toISOString();
  const { data: cands, error: candErr } = await supabase
    .from('profiles')
    .select('id, created_at, push_token, notifications_enabled, pais')
    .gte('created_at', from).lte('created_at', to)
    .is('push_token', null);
  if (candErr) { counters.errores++; return counters; }   // fail closed

  const inWindow = (cands || []).filter((p) => isInWindow(p.created_at, now));
  counters.candidatos = inWindow.length;

  // Límite fail-closed de volumen diario
  if (counters.candidatos > (config.max_candidates_day ?? 8)) {
    counters.abort_limite = 'max_candidates_day';
    await supabase.from('activation_email_config').update({ enabled: false, note: 'F108 auto-off: max_candidates_day superado' }).eq('id', 1);
    return counters;
  }
  if (isNewsletterWindow(now)) { inWindow.forEach(() => bump('newsletter_window')); return counters; }

  const ids = inWindow.map((p) => p.id);
  if (ids.length === 0) return counters;

  // 2 · Estado en lote (una sola pasada; el recheck real va en la reserva)
  const [{ data: plans }, { data: done }, { data: runs }, { data: trials }, { data: outs }] = await Promise.all([
    supabase.from('user_plans').select('user_id').eq('estado', 'active').in('user_id', ids),
    supabase.from('user_workouts').select('user_id').eq('estado', 'completed').in('user_id', ids),
    supabase.from('runs').select('user_id').in('user_id', ids),
    supabase.from('trial_starts').select('user_id').in('user_id', ids),
    supabase.from('activation_email_optout').select('user_id').in('user_id', ids),
  ]);
  const S = (rows) => new Set((rows || []).map((r) => r.user_id));
  const planSet = S(plans), doneSet = S(done), runSet = S(runs), trialSet = S(trials), outSet = S(outs);

  let sentThisRun = 0;

  for (const p of inWindow) {
    const arm = assignArm(p.id);
    const localDate = localDateFor(now, p.pais);
    if (!localDate) { bump('quiet_hours'); continue; }          // sin tz fiable: fail closed
    if (!canSendNow(now, p.pais)) { bump('quiet_hours'); continue; }
    if (!planSet.has(p.id)) { bump('no_active_plan'); continue; }
    if (doneSet.has(p.id) || runSet.has(p.id)) { bump('already_activated'); continue; }
    if (trialSet.has(p.id)) { bump('trial_active'); continue; }
    if (outSet.has(p.id)) { bump('optout'); continue; }
    if (p.notifications_enabled === false) { bump('optout'); continue; }

    arm === 'treatment' ? counters.treatment++ : counters.holdout++;

    // 3 · ¿Ya hay una activación REAL hoy (push u otro email)?
    const { data: realRow, error: realErr } = await supabase
      .from('activation_dispatch_log').select('id')
      .eq('user_id', p.id).eq('local_date', localDate).eq('mode', 'real').maybeSingle();
    if (realErr) { counters.errores++; bump('brevo_lookup_failed'); continue; }
    if (realRow) { bump('already_dispatched_today'); continue; }

    // 4 · RESERVA — en dry-run se reserva en el espacio 'dry_run', que NO
    //     consume la oportunidad real (índices únicos parciales).
    const mode = dryRun ? 'dry_run' : 'real';
    const { data: resv, error: resvErr } = await supabase
      .from('activation_dispatch_log')
      .insert({ user_id: p.id, local_date: localDate, mode, channel: 'email', day_n: 1, experiment: EXPERIMENT, arm })
      .select('id');
    if (resvErr) { bump('already_dispatched_today'); continue; }  // choque = ya reservado
    if (!resv || resv.length === 0) { bump('already_dispatched_today'); continue; }

    // 5 · RECHECK dentro de la reserva (el token puede haber aparecido)
    const { data: fresh, error: freshErr } = await supabase
      .from('profiles').select('push_token').eq('id', p.id).single();
    if (freshErr) { counters.errores++; await logRow(supabase, p.id, arm, dryRun, 'brevo_lookup_failed'); continue; }
    if (fresh && fresh.push_token) {
      await supabase.from('activation_dispatch_log').delete().eq('id', resv[0].id);
      await logRow(supabase, p.id, arm, dryRun, 'push_took_priority');
      bump('push_took_priority');
      continue;
    }

    if (arm === 'holdout') { await logRow(supabase, p.id, arm, dryRun, 'holdout'); continue; }

    // 6 · DRY-RUN: decisión simulada. NO se toca el endpoint de envío.
    if (dryRun) {
      counters.simulados++;
      await logRow(supabase, p.id, arm, true, null, 'dry_run');
      continue;
    }

    // ── A partir de aquí solo se llega con dry_run=false (no autorizado en F108)
    if (sentThisRun >= (config.max_per_run ?? 6)) { bump('daily_limit'); continue; }
    if (typeof brevoLookup === 'function') {
      counters.brevo_get++;
      const sup = await brevoLookup(p.id);
      if (sup === null) { await logRow(supabase, p.id, arm, false, 'brevo_lookup_failed'); continue; }
      if (sup === true) { await logRow(supabase, p.id, arm, false, 'brevo_blocked'); continue; }
    } else {
      await logRow(supabase, p.id, arm, false, 'brevo_lookup_failed');
      continue;
    }
    counters.brevo_send_calls++;
    const res = await sendEmail(p.id);
    sentThisRun++;
    counters.enviados++;
    await logRow(supabase, p.id, arm, false, null, res && res.ok ? 'sent' : 'failed');
  }

  log(`[activation-email] ${JSON.stringify(counters)}`);
  return counters;
}

async function logRow(supabase, userId, arm, dryRun, reason, statusOverride) {
  const status = statusOverride || (reason ? 'suppressed' : (dryRun ? 'dry_run' : 'reserved'));
  const safeReason = reason && SUPPRESSION_REASONS.has(reason) ? reason : null;
  await supabase.from('activation_email_log').insert({
    user_id: userId, day_n: 1, experiment: EXPERIMENT, arm,
    status: dryRun && !statusOverride && !reason ? 'dry_run' : status,
    suppressed_reason: safeReason,
  });
}
