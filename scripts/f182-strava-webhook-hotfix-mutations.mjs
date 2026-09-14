import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const gateRel = 'scripts/f174-strava-webhook-gate.mjs';
const webhookRel = 'api/strava-webhook.js';
const guardRel = 'api/_lib/strava-webhook-guard.js';
const finalizerRel = 'api/_lib/strava-import-finalizer.js';

function copyFixture() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'f182-webhook-mut-'));
  for (const rel of [gateRel, webhookRel, guardRel, finalizerRel, 'api/_lib/strava-activity-types.js']) {
    const dest = path.join(fixture, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(root, rel), dest);
  }
  return fixture;
}

function mutate(fixture, from, to, expected = 1, rel = webhookRel) {
  const file = path.join(fixture, rel);
  const source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const count = source.split(from).length - 1;
  assert.equal(count, expected, `ancla inesperada ${JSON.stringify(from)} (${count})`);
  fs.writeFileSync(file, source.replaceAll(from, to));
}

function mutateNth(fixture, from, to, occurrence, rel = webhookRel) {
  const file = path.join(fixture, rel);
  const source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const positions = [];
  let cursor = 0;
  while ((cursor = source.indexOf(from, cursor)) >= 0) {
    positions.push(cursor);
    cursor += from.length;
  }
  assert.ok(occurrence >= 1 && occurrence <= positions.length,
    `ocurrencia inesperada ${occurrence}/${positions.length} para ${JSON.stringify(from)}`);
  const at = positions[occurrence - 1];
  fs.writeFileSync(file, source.slice(0, at) + to + source.slice(at + from.length));
}

function runGate(fixture) {
  return spawnSync(process.execPath, [path.join(fixture, gateRel)], {
    cwd: fixture, encoding: 'utf8', timeout: 20_000,
  });
}

assert.equal(runGate(root).status, 0, 'el control real no pasa');
const mutants = [
  ['cadencia de trail deja de convertirse a pasos', "Math.round(deporte !== 'bici' ? a.average_cadence * 2 : a.average_cadence)", "Math.round(deporte === 'running' ? a.average_cadence * 2 : a.average_cadence)"],
  ['cadencia de caminar deja de convertirse a pasos', "Math.round(deporte !== 'bici' ? a.average_cadence * 2 : a.average_cadence)", "Math.round((deporte === 'running' || deporte === 'trail') ? a.average_cadence * 2 : a.average_cadence)"],
  ['cadencia de bici se duplica por error', "Math.round(deporte !== 'bici' ? a.average_cadence * 2 : a.average_cadence)", "Math.round(a.average_cadence * 2)"],
  ['potencia media estimada vuelve a persistirse', 'a.device_watts === true && a.average_watts > 0', 'a.average_watts > 0'],
  ['potencia máxima estimada vuelve a persistirse', 'a.device_watts === true && a.max_watts > 0', 'a.max_watts > 0'],
  ['resistencia activa coaches antes del enlace', 'coach_pipeline_version: 1', 'coach_pipeline_version: 2', 1, webhookRel, 1],
  ['fuerza activa coaches desde el INSERT', 'coach_pipeline_version: 1', 'coach_pipeline_version: 2', 1, webhookRel, 2],
  ['finalización deja de estar acotada', 'attempt < 3', 'attempt < 30', 1, finalizerRel],
  ['resistencia pierde el dueño', 'p_user_id: userId', 'p_user_id: undefined', 1, finalizerRel, 1],
  ['fuerza pierde el dueño', 'p_user_id: userId', 'p_user_id: undefined', 1, finalizerRel, 2],
  ['se deja de verificar el id de actividad devuelto', "String(activity?.id ?? '') !== String(activityId)", "String(activity?.id ?? '') === String(activityId)"],
  ['se deja de verificar el dueño devuelto', "String(activity?.athlete?.id ?? '') !== String(ownerId)", "String(activity?.athlete?.id ?? '') === String(ownerId)"],
  ['se aceptan updates sin contrato real', "event.aspect_type === 'create'", "event.aspect_type !== 'delete'", 1, guardRel],
  ['se aceptan owner ids no seguros', 'Number.isSafeInteger(event.owner_id)', 'Number.isFinite(event.owner_id)', 1, guardRel],
  ['se aceptan activity ids no seguros', 'Number.isSafeInteger(event.object_id)', 'Number.isFinite(event.object_id)', 1, guardRel],
  ['se elimina la cuota durable', "'f182_take_strava_import_slot'", "'f182_take_strava_import_slot_disabled'", 1, guardRel],
  ['un error de cuota deja pasar la reserva', 'return !error && data === true;', 'return !error || data === true;', 1, guardRel],
  ['resistencia deja de usar el finalizador transaccional', "'f182_finalize_strava_endurance_import'", "'f182_finalize_endurance_disabled'", 1, finalizerRel],
  ['fuerza deja de usar el finalizador transaccional', "'f182_finalize_strava_strength_import'", "'f182_finalize_strength_disabled'", 1, finalizerRel],
  ['fuerza inventa una sesión del plan', 'p_planned_session_id: null', 'p_planned_session_id: 1', 1, finalizerRel],
  ['fuerza nueva no espera su finalización', 'await finalizeStravaStrengthImport(sb, { runId: insertedStrength.id, userId: conn.user_id })', 'true'],
  ['dedup deja una fuerza v1 dormida', 'await finalizeStravaStrengthImport(sb, { runId: pendingStrength.id, userId: conn.user_id })', 'true'],
  ['23505 deja una fuerza v1 dormida', 'await finalizeStravaStrengthImport(sb, { runId: raced.id, userId: conn.user_id })', 'true'],
  ['resistencia nueva no espera su finalización', 'await finalizeStravaEnduranceImport(sb, {', 'await noFinalizeStravaEnduranceImport(sb, {', 1, webhookRel, 4],
  ['dedup deja una resistencia v1 dormida', 'await finalizeStravaEnduranceImport(sb, { runId: pendingRun.id, userId: conn.user_id })', 'true'],
  ['23505 deja una resistencia v1 dormida', 'await finalizeStravaEnduranceImport(sb, { runId: raced.id, userId: conn.user_id })', 'true'],
];

let killed = 0;
for (const [name, from, to, expected, rel, occurrence] of mutants) {
  const fixture = copyFixture();
  try {
    if (occurrence) mutateNth(fixture, from, to, occurrence, rel ?? webhookRel);
    else mutate(fixture, from, to, expected ?? 1, rel ?? webhookRel);
    const result = runGate(fixture);
    assert.notEqual(result.status, 0, `mutante sobrevivió: ${name}\n${result.stdout}\n${result.stderr}`);
    killed += 1;
    console.log(`MUERTO ${name}`);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

const negative = copyFixture();
try {
  mutate(negative, '// Se activa después de que strava-plan-linker haya terminado.', '// Se activa después de que strava-plan-linker haya terminado. Control negativo.');
  assert.equal(runGate(negative).status, 0, 'el control negativo debe sobrevivir');
} finally {
  fs.rmSync(negative, { recursive: true, force: true });
}

console.log(`F182 webhook mutations: ${killed}/${mutants.length} muertos · control negativo vivo`);
