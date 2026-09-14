#!/usr/bin/env node
// F182 · Mutantes del webhook de Strava frente al gate de COMPORTAMIENTO
// (scripts/f182-strava-webhook-verification-gate.mjs). Cada mutante relaja un
// punto del contrato de verificación; el gate debe morir. Un control negativo
// (cambio inocuo en un texto de log) debe sobrevivir.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const gate = path.join(root, 'scripts/f182-strava-webhook-verification-gate.mjs');
const webhookRel = 'api/strava-webhook.js';
const libRel = 'api/_lib/strava-import-finalizer.js';

function copyFixture() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'f182-webhook-verif-mut-'));
  for (const rel of [webhookRel, ...fs.readdirSync(path.join(root, 'api/_lib')).filter((n) => n.endsWith('.js')).map((n) => `api/_lib/${n}`)]) {
    const dest = path.join(fixture, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n'));
  }
  fs.writeFileSync(path.join(fixture, 'package.json'), '{"type":"module"}\n');
  return fixture;
}
function mutate(fixture, from, to, rel = webhookRel) {
  const file = path.join(fixture, rel);
  const source = fs.readFileSync(file, 'utf8');
  const count = source.split(from).length - 1;
  assert.equal(count, 1, `ancla inesperada ${JSON.stringify(from)} (${count})`);
  fs.writeFileSync(file, source.replace(from, to));
}
function runGate(fixture) {
  const r = spawnSync(process.execPath, [gate], {
    cwd: root, encoding: 'utf8',
    env: { ...process.env, F182_WEBHOOK_PATH: path.join(fixture, webhookRel) },
  });
  const tail = (r.stdout + r.stderr).split('\n').filter((l) => /^(FAIL|F182 webhook)/.test(l)).join(' | ');
  return { ok: r.status === 0, tail };
}

const MUTANTS = [
  ['pipeline=2 se acepta como prueba de verificación',
    (f) => mutate(f, "const unverifiedRun = existingRun?.find((row) => row.strava_server_verified !== true) ?? null;",
      "const unverifiedRun = existingRun?.find((row) => row.strava_server_verified !== true && Number(row.coach_pipeline_version) !== 2) ?? null;")],
  ['cualquier fila existente se trata como verificada (no se consulta Strava)',
    (f) => mutate(f, "const hasVerifiedRun = (existingRun?.length ?? 0) > 0 && !unverifiedRun;", "const hasVerifiedRun = (existingRun?.length ?? 0) > 0;")],
  ['fila antigua: se salta la verificación con la actividad real',
    (f) => mutate(f, "const verified = await verifyStravaEnduranceImport(sb, { runId: unverifiedRun.id, userId: conn.user_id, activity: canonical });", "const verified = true;")],
  ['fila antigua: la verificación rechazada no detiene la finalización',
    (f) => mutate(f, "    if (!verified) {\n      logEvent(LOG, { stage: 'activity_verification', outcome: 'failed', trace_id: traceId });\n      return;\n    }",
      "    if (!verified) {\n      logEvent(LOG, { stage: 'activity_verification', outcome: 'failed', trace_id: traceId });\n    }")],
  ['identidad del atleta no se contrasta con el detalle de Strava',
    (f) => mutate(f, "      || String(activity?.athlete?.id ?? '') !== String(ownerId)) {", "      || false) {")],
  ['identidad de la actividad no se contrasta con el detalle de Strava',
    (f) => mutate(f, "  if (String(activity?.id ?? '') !== String(activityId)\n", "  if (false\n")],
  ['Strava dice fuerza pero la fila antigua de resistencia se ignora y se importa fuerza',
    (f) => mutate(f, "  if (activityKind === 'strength') {\n    if (unverifiedRun) {", "  if (activityKind === 'strength') {\n    if (false) {")],
  ['conflicto 23505: la fila ganadora del cliente se finaliza sin verificar',
    (f) => mutate(f, "        : raced ? await verifyStravaEnduranceImport(sb, { runId: raced.id, userId: conn.user_id, activity: canonical }) : false;", "        : raced ? true : false;")],
  ['importación nueva: se finaliza sin verificar',
    (f) => mutate(f, "const insertedVerified = await verifyStravaEnduranceImport(sb, { runId: inserted.id, userId: conn.user_id, activity: canonical });", "const insertedVerified = true;")],
  ['importación nueva: la verificación rechazada no detiene la finalización',
    (f) => mutate(f, "  if (!insertedVerified) {\n    logEvent(LOG, { stage: 'activity_verification', outcome: 'failed', trace_id: traceId });\n    return;\n  }",
      "  if (!insertedVerified) {\n    logEvent(LOG, { stage: 'activity_verification', outcome: 'failed', trace_id: traceId });\n  }")],
  ['la RPC de verificación no recibe la actividad canónica',
    (f) => mutate(f, "    p_activity: activity,", "    p_activity: null,", libRel)],
  ['el canónico pierde al atleta (la RPC no puede contrastar al dueño)',
    (f) => mutate(f, "strava_activity_id: num(row?.strava_activity_id), athlete_id: num(athleteId),", "strava_activity_id: num(row?.strava_activity_id), athlete_id: null,", libRel)],
  ['el canónico pierde las métricas reales (distancia del cliente conservada)',
    (f) => mutate(f, "distancia_km: num(row?.distancia_km), duracion_segundos", "distancia_km: null, duracion_segundos", libRel)],
  ['los parciales de Strava no se derivan (splits siempre null)',
    (f) => mutate(f, "  const splits = sinRitmo ? null : buildSplitsFromStrava(a);", "  const splits = null;")],
  ['el mejor parcial no se deriva',
    (f) => mutate(f, "    ritmo_mejor: text(row?.ritmo_mejor, 8) ?? bestSplitPace(splits),", "    ritmo_mejor: null,", libRel)],
  ['el canónico omite la ruta (polyline nunca sustituida)',
    (f) => mutate(f, "    polyline_encoded: text(row?.polyline_encoded, 100000),", "    polyline_encoded: null,", libRel)],
  ['el canónico omite las coordenadas de inicio',
    (f) => mutate(f, "    lat_inicio: num(row?.lat_inicio), lng_inicio: num(row?.lng_inicio),", "    lat_inicio: null, lng_inicio: null,", libRel)],
  ['el contrato de claves se desalinea (se pierde splits del objeto canónico)',
    (f) => mutate(f, "    splits: splits && splits.length > 0 ? splits : null,\n    titulo: text(row?.titulo, 160),\n  };", "    titulo: text(row?.titulo, 160),\n  };", libRel)],
  ['el canónico envía claves ajenas del proveedor',
    (f) => mutate(f, "    titulo: text(row?.titulo, 160),\n  };", "    titulo: text(row?.titulo, 160),\n    kudos_count: 3,\n  };", libRel)],
  ['indoor se pierde (es_indoor siempre false)',
    (f) => mutate(f, "    es_indoor: row?.es_indoor === true,\n    polyline_encoded", "    es_indoor: false,\n    polyline_encoded", libRel)],
  ['redondeo «4:60» reintroducido en paceFromDistanceTime del webhook',
    (f) => mutate(f, "  const total = Math.round(seconds / (meters / 1000));\n  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;", "  const secPerKm = seconds / (meters / 1000);\n  return `${Math.floor(secPerKm / 60)}:${String(Math.round(secPerKm % 60)).padStart(2, '0')}`;")],
  ['la cuota de detalle no se respeta',
    (f) => mutate(f, "  if (!await reserveStravaDetailSlot(sb, conn.user_id)) {", "  if (false) {")],
];

const results = [];
for (const [name, apply] of MUTANTS) {
  const fixture = copyFixture();
  try {
    apply(fixture);
    const r = runGate(fixture);
    results.push(!r.ok);
    console.log(`${!r.ok ? 'MUERE' : 'VIVE '} ${name}${!r.ok ? '' : ' :: ' + r.tail}`);
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
}
// Control negativo: un texto de log distinto no debe matar el gate.
{
  const fixture = copyFixture();
  try {
    mutate(fixture, "outcome: repaired ? 'verified_existing' : 'coach_activation_failed'", "outcome: repaired ? 'verified_existing_ok' : 'coach_activation_failed'");
    const r = runGate(fixture);
    results.push(r.ok);
    console.log(`${r.ok ? 'VIVE ' : 'MUERE'} control negativo (texto de log) — debe VIVIR${r.ok ? '' : ' :: ' + r.tail}`);
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
}
const killed = results.slice(0, MUTANTS.length).filter(Boolean).length;
const controlAlive = results[results.length - 1];
console.log(`F182 webhook verificación mutantes: ${killed}/${MUTANTS.length} muertos · control ${controlAlive ? 'vivo' : 'MUERTO'}`);
process.exit(killed === MUTANTS.length && controlAlive ? 0 : 1);
