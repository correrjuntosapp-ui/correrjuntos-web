import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const webhook = readFileSync(new URL('api/strava-webhook.js', root), 'utf8');
const types = readFileSync(new URL('api/_lib/strava-activity-types.js', root), 'utf8');
const checks = [
  ['incluye VirtualRun', types.includes("'VirtualRun'")],
  ['incluye las 8 modalidades de bici', (types.match(/Ride|Handcycle|Velomobile/g) || []).length >= 8],
  ['incluye 4 modalidades de fuerza', ['WeightTraining', 'Workout', 'Crossfit', 'HighIntensityIntervalTraining'].every(v => types.includes(`'${v}'`))],
  ['fuerza va a tabla fuerza', webhook.includes("from('strength_workout_runs').insert(strengthRow)")],
  ['resistencia va a runs', webhook.includes("from('runs').insert(row)")],
  ['conserva sport_type', webhook.includes('strava_sport_type: sportType(a)')],
  ['marca pipeline v2', (webhook.match(/coach_pipeline_version: 2/g) || []).length === 2],
  ['no genera mensajes directos', !webhook.includes('handleJosePostWorkout') && !webhook.includes("from('maria_chat_messages')")],
  ['no envía push directo', !webhook.includes('sendExpoPush') && !webhook.includes('EXPO_PUSH_URL')],
  ['dedup en ambas tablas', webhook.includes(".eq('external_activity_id', String(activityId))")],
  ['webhook espera el trabajo', webhook.includes('waitUntil(work)')],
  ['verifica actividad contra Strava', webhook.includes('`${STRAVA_API}/activities/${activityId}`')],
];
for (const [name, ok] of checks) {
  assert.equal(ok, true, name);
  console.log(`PASS ${name}`);
}
console.log(`F174 webhook gate: ${checks.length}/0 PASS`);
