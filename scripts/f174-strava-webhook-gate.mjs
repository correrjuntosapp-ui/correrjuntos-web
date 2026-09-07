import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const webhook = readFileSync(new URL('api/strava-webhook.js', root), 'utf8');
const types = readFileSync(new URL('api/_lib/strava-activity-types.js', root), 'utf8');
const ingress = readFileSync(new URL('api/_lib/strava-webhook-guard.js', root), 'utf8');
const importFinalizer = readFileSync(new URL('api/_lib/strava-import-finalizer.js', root), 'utf8');
const checks = [
  ['incluye VirtualRun', types.includes("'VirtualRun'")],
  ['incluye las 8 modalidades de bici', (types.match(/Ride|Handcycle|Velomobile/g) || []).length >= 8],
  ['incluye 4 modalidades de fuerza', ['WeightTraining', 'Workout', 'Crossfit', 'HighIntensityIntervalTraining'].every(v => types.includes(`'${v}'`))],
  ['fuerza va a tabla fuerza', webhook.includes("from('strength_workout_runs').insert(strengthRow)")],
  ['resistencia va a runs', webhook.includes("from('runs').insert(row)")],
  ['conserva sport_type', webhook.includes('strava_sport_type: sportType(a)')],
  ['resistencia y fuerza nacen diferidas en pipeline v1', (webhook.match(/coach_pipeline_version: 1/g) || []).length === 2],
  ['fuerza nunca despierta coaches desde el INSERT',
    /function mapActivityToStrength[\s\S]*?coach_pipeline_version: 1,[\s\S]*?\n\}/.test(webhook)
      && !/function mapActivityToStrength[\s\S]*?coach_pipeline_version: 2,[\s\S]*?\n\}/.test(webhook)],
  ['cadencia se duplica en modalidades a pie y conserva rpm de bici', /Math\.round\(deporte !== 'bici' \? a\.average_cadence \* 2 : a\.average_cadence\)/.test(webhook)],
  ['vatios solo cuando Strava confirma potenciómetro', (webhook.match(/a\.device_watts === true && a\.(?:average_watts|max_watts) > 0/g) || []).length === 2],
  ['ambas modalidades finalizan con las RPC canónicas',
    importFinalizer.includes("'f182_finalize_strava_endurance_import'")
      && importFinalizer.includes("'f182_finalize_strava_strength_import'")
      && !webhook.includes('vincularActividadConPlan')
      && !webhook.includes('activateCoachPipeline')],
  ['finalización acotada y fail-closed',
    (importFinalizer.match(/attempt < 3;/g) || []).length === 1
      && importFinalizer.includes("if (!error && data?.ok === true) return true;")
      && importFinalizer.includes('return false;')],
  ['los finalizadores reciben dueño y actividad exactos',
    (importFinalizer.match(/p_user_id: userId/g) || []).length === 2
      && (importFinalizer.match(/p_run_id: runId/g) || []).length === 2],
  ['fuerza finaliza sin inventar sesión de plan',
    importFinalizer.includes('p_planned_session_id: null')],
  ['fuerza activa coaches solo después del finalizador', (() => {
    const branch = webhook.slice(webhook.indexOf("if (activityKind === 'strength')"), webhook.indexOf('// 6. Resistencia'));
    const insertedCall = 'await finalizeStravaStrengthImport(sb, { runId: insertedStrength.id, userId: conn.user_id })';
    const finalize = branch.indexOf(insertedCall);
    const imported = branch.indexOf("stage: 'strength_insert', outcome: 'imported'");
    return finalize >= 0
      && /insertedStrength\s*\?\s*await finalizeStravaStrengthImport\(sb, \{ runId: insertedStrength\.id, userId: conn\.user_id \}\)/.test(branch)
      && imported > finalize && !branch.includes('activateCoachPipeline(');
  })()],
  ['reintento deduplicado repara fuerza dormida sin consumir cuota', (() => {
    const dedupRepair = webhook.indexOf('const pendingStrength = existingStrength?.find');
    const dedupLog = webhook.indexOf("stage: 'dedup'");
    const quota = webhook.indexOf('await reserveStravaDetailSlot');
    return dedupRepair >= 0
      && webhook.includes('await finalizeStravaStrengthImport(sb, { runId: pendingStrength.id, userId: conn.user_id })')
      && dedupLog > dedupRepair && quota > dedupLog;
  })()],
  ['reintento deduplicado repara resistencia dormida sin consumir cuota', (() => {
    const dedupRepair = webhook.indexOf('const pendingRun = existingRun?.find');
    const dedupLog = webhook.indexOf("stage: 'dedup'");
    const quota = webhook.indexOf('await reserveStravaDetailSlot');
    return dedupRepair >= 0
      && webhook.includes('await finalizeStravaEnduranceImport(sb, { runId: pendingRun.id, userId: conn.user_id })')
      && dedupLog > dedupRepair && quota > dedupLog;
  })()],
  ['carrera concurrente de fuerza también finaliza la fila ganadora', (() => {
    const branch = webhook.slice(webhook.indexOf("if (activityKind === 'strength')"), webhook.indexOf('// 6. Resistencia'));
    const race = branch.indexOf("String(strengthError.code) === '23505'");
    const reload = branch.indexOf(".eq('external_activity_id', String(activityId)).maybeSingle()", race);
    const finalize = branch.indexOf('await finalizeStravaStrengthImport(sb, { runId: raced.id, userId: conn.user_id })', race);
    return race >= 0 && reload > race && finalize > reload;
  })()],
  ['carrera concurrente de resistencia también finaliza la fila ganadora', (() => {
    const branch = webhook.slice(webhook.indexOf('// 6. Resistencia'), webhook.indexOf('// ── Setup'));
    const race = branch.indexOf("String(insErr.code) === '23505'");
    const reload = branch.indexOf(".eq('source', 'strava').eq('strava_activity_id', activityId).maybeSingle()", race);
    const finalize = branch.indexOf('await finalizeStravaEnduranceImport(sb, { runId: raced.id, userId: conn.user_id })', race);
    return race >= 0 && reload > race && finalize > reload;
  })()],
  ['resistencia nueva finaliza antes de declararse importada', (() => {
    const branch = webhook.slice(webhook.indexOf('// 6. Resistencia'), webhook.indexOf('// ── Setup'));
    const finalize = branch.indexOf('runId: inserted.id');
    const imported = branch.indexOf("stage: 'run_insert', outcome: 'imported'");
    return finalize >= 0
      && /await finalizeStravaEnduranceImport\(sb, \{\s*runId: inserted\.id,\s*userId: conn\.user_id,?\s*\}\)/.test(branch)
      && imported > finalize;
  })()],
  ['no genera mensajes directos', !webhook.includes('handleJosePostWorkout') && !webhook.includes("from('maria_chat_messages')")],
  ['no envía push directo', !webhook.includes('sendExpoPush') && !webhook.includes('EXPO_PUSH_URL')],
  ['dedup en ambas tablas', webhook.includes(".eq('external_activity_id', String(activityId))")],
  ['webhook espera el trabajo', webhook.includes('waitUntil(work)')],
  ['verifica actividad contra Strava', webhook.includes('`${STRAVA_API}/activities/${activityId}`')],
  ['verifica id y atleta de la respuesta antes de persistir',
    webhook.includes("String(activity?.id ?? '') !== String(activityId)")
      && webhook.includes("String(activity?.athlete?.id ?? '') !== String(ownerId)")
      && webhook.indexOf("stage: 'activity_identity'") < webhook.indexOf('const activityKind = classifyStravaActivity(activity)')],
  ['contrato honesto: solo create; update/delete no se fingen sincronizados',
    ingress.includes("event.aspect_type === 'create'")
      && webhook.includes('if (!isSafeActivityCreateEvent(event)) return;')],
  ['IDs malformados se descartan antes de crear el cliente', (() => {
    const ids = webhook.indexOf('if (!isSafeActivityCreateEvent(event)) return;');
    const client = webhook.lastIndexOf('createClient(SUPABASE_URL');
    return ids >= 0 && client > ids
      && ingress.includes('Number.isSafeInteger(event.owner_id)')
      && ingress.includes('Number.isSafeInteger(event.object_id)');
  })()],
  ['cuota durable se consume tras dedup y antes de refrescar/fetch', (() => {
    const dedup = webhook.indexOf("stage: 'dedup'");
    const quota = webhook.indexOf('await reserveStravaDetailSlot');
    const refresh = webhook.indexOf('await refreshTokenIfNeeded');
    return dedup >= 0 && quota > dedup && refresh > quota
      && webhook.includes("stage: 'activity_throttle'")
      && ingress.includes("'f182_take_strava_import_slot'")
      && ingress.includes('return !error && data === true;');
  })()],
];
for (const [name, ok] of checks) {
  assert.equal(ok, true, name);
  console.log(`PASS ${name}`);
}
console.log(`F174 webhook gate: ${checks.length}/0 PASS`);
