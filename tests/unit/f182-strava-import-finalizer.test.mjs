import assert from 'node:assert/strict';
import test from 'node:test';

import {
  finalizeStravaEnduranceImport,
  finalizeStravaStrengthImport,
} from '../../api/_lib/strava-import-finalizer.js';

test('resistencia finaliza con dueño y actividad exactos', async () => {
  const calls = [];
  const sb = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { ok: true, outcome: 'linked' }, error: null };
  } };
  assert.equal(await finalizeStravaEnduranceImport(sb, {
    runId: 'run-1', userId: 'user-1',
  }), true);
  assert.deepEqual(calls, [{
    name: 'f182_finalize_strava_endurance_import',
    args: { p_user_id: 'user-1', p_run_id: 'run-1' },
  }]);
});

test('fuerza finaliza sin inventar sesión', async () => {
  const calls = [];
  const sb = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { ok: true, outcome: 'no_match' }, error: null };
  } };
  assert.equal(await finalizeStravaStrengthImport(sb, {
    runId: 'run-2', userId: 'user-2',
  }), true);
  assert.deepEqual(calls, [{
    name: 'f182_finalize_strava_strength_import',
    args: { p_user_id: 'user-2', p_run_id: 'run-2', p_planned_session_id: null },
  }]);
});

test('reintenta de forma acotada y falla cerrada', async () => {
  let attempts = 0;
  const sb = { rpc: async () => { attempts += 1; return { data: null, error: { code: 'x' } }; } };
  assert.equal(await finalizeStravaStrengthImport(sb, {
    runId: 'run-3', userId: 'user-3',
  }), false);
  assert.equal(attempts, 3);
});

test('rechaza identificadores vacíos sin tocar la base', async () => {
  let called = false;
  const sb = { rpc: async () => { called = true; return { data: { ok: true }, error: null }; } };
  assert.equal(await finalizeStravaEnduranceImport(sb, { runId: '', userId: 'user-4' }), false);
  assert.equal(await finalizeStravaStrengthImport(sb, { runId: 'run-4', userId: '' }), false);
  assert.equal(called, false);
});
