import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSafeActivityCreateEvent,
  reserveStravaDetailSlot,
} from '../../api/_lib/strava-webhook-guard.js';

const valid = { object_type: 'activity', aspect_type: 'create', owner_id: 123, object_id: 456 };

test('solo acepta create de actividad con IDs positivos y exactos', () => {
  assert.equal(isSafeActivityCreateEvent(valid), true);
  for (const bad of [
    null,
    { ...valid, object_type: 'athlete' },
    { ...valid, aspect_type: 'update' },
    { ...valid, aspect_type: 'delete' },
    { ...valid, owner_id: 0 },
    { ...valid, owner_id: -1 },
    { ...valid, owner_id: '123' },
    { ...valid, object_id: Number.MAX_SAFE_INTEGER + 1 },
    { ...valid, object_id: 4.5 },
  ]) assert.equal(isSafeActivityCreateEvent(bad), false);
});

test('la cuota durable permite solo un true explícito', async () => {
  let calls = 0;
  const sb = { rpc: async (name, args) => {
    calls += 1;
    assert.equal(name, 'f182_take_strava_import_slot');
    assert.deepEqual(args, { p_user_id: 'user-1' });
    return { data: true, error: null };
  } };
  assert.equal(await reserveStravaDetailSlot(sb, 'user-1'), true);
  assert.equal(calls, 1);
});

test('la cuota falla cerrada ante límite, error, excepción o identidad inválida', async () => {
  assert.equal(await reserveStravaDetailSlot({ rpc: async () => ({ data: false, error: null }) }, 'u'), false);
  assert.equal(await reserveStravaDetailSlot({ rpc: async () => ({ data: true, error: new Error('db') }) }, 'u'), false);
  assert.equal(await reserveStravaDetailSlot({ rpc: async () => { throw new Error('db'); } }, 'u'), false);
  assert.equal(await reserveStravaDetailSlot({}, 'u'), false);
  assert.equal(await reserveStravaDetailSlot({ rpc: async () => ({ data: true, error: null }) }, ''), false);
});
