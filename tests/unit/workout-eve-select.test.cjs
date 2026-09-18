// Pruebas de la selección de audiencia del cron workout-eve-push (18 sep 2026).
// node --test tests/unit/workout-eve-select.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');

let mod;
test('carga el módulo puro (ESM)', async () => {
  mod = await import('../../api/_lib/eve-select.js');
  assert.equal(typeof mod.selectEveCandidates, 'function');
});

const U = 'user-1';
const plan = (id, estado, created_at = '2026-09-01T00:00:00Z', user_id = U) => ({ id, user_id, estado, created_at });
const w = (id, plan_id, extra = {}) => ({ id, user_id: U, plan_id, titulo: 'Sesión ' + id, descripcion: 'x', estado: 'pending', tipo: 'easy_run', ...extra });
const run = (o) => mod.selectEveCandidates({ workouts: [], plans: [], logs: [], versionByUser: new Map(), ...o });

test('solo se anuncia la sesión del plan ACTIVO', () => {
  const r = run({
    plans: [plan('p-active', 'active'), plan('p-aband', 'abandoned')],
    workouts: [w('w-aband', 'p-aband', { titulo: 'Caminata rápida 20 min' }), w('w-active', 'p-active', { titulo: 'Fartlek 7km' })],
  });
  assert.equal(r.candidates.length, 1);
  assert.equal(r.candidates[0].workout.id, 'w-active');
});

for (const estado of ['abandoned', 'paused', 'completed', 'cancelled', 'expired', 'archived', null, undefined]) {
  test(`plan en estado «${estado}» → no se envía nada`, () => {
    const r = run({ plans: [plan('p1', estado)], workouts: [w('w1', 'p1')] });
    assert.equal(r.candidates.length, 0);
    assert.deepEqual(r.skipped, [{ userId: U, reason: 'plan_not_active' }]);
  });
}

test('sesión de un plan que no existe en la tabla de planes → fuera', () => {
  const r = run({ plans: [plan('p1', 'active')], workouts: [w('w1', 'p-huerfano')] });
  assert.equal(r.candidates.length, 0);
});

test('el caso real del 18 sep: 6 planes abandonados con sesiones y un plan activo sin sesión mañana → silencio', () => {
  const plans = [plan('p-new', 'active', '2026-09-18T10:00:00Z')];
  const workouts = [];
  for (let k = 0; k < 6; k++) {
    plans.push(plan('p-old-' + k, 'abandoned', '2026-09-12T10:00:00Z'));
    workouts.push(w('w-old-' + k, 'p-old-' + k, { titulo: 'Caminata rápida 20 min', tipo: 'walk_run' }));
  }
  const r = run({ plans, workouts });
  assert.equal(r.candidates.length, 0, 'no debe anunciar la sesión de un plan abandonado');
});

test('descanso → fuera; sesión completada o saltada → fuera', () => {
  const r = run({ plans: [plan('p1', 'active')], workouts: [w('w1', 'p1', { tipo: 'rest' }), w('w2', 'p1', { estado: 'completed' }), w('w3', 'p1', { estado: 'skipped' })] });
  assert.equal(r.candidates.length, 0);
});

test('dos planes activos → la sesión del plan creado más tarde', () => {
  const r = run({
    plans: [plan('p-viejo', 'active', '2026-08-01T00:00:00Z'), plan('p-nuevo', 'active', '2026-09-15T00:00:00Z')],
    workouts: [w('w-viejo', 'p-viejo'), w('w-nuevo', 'p-nuevo')],
  });
  assert.equal(r.candidates.length, 1);
  assert.equal(r.candidates[0].workout.id, 'w-nuevo');
});

test('un plan activo de OTRO usuario no vale para esta sesión', () => {
  const r = run({ plans: [plan('p1', 'active', '2026-09-01T00:00:00Z', 'user-2')], workouts: [w('w1', 'p1')] });
  assert.equal(r.candidates.length, 0);
});

test('idempotencia por usuario + fecha: ya se envió otra sesión de mañana → no se repite', () => {
  const r = run({
    plans: [plan('p1', 'active'), plan('p2', 'active', '2026-09-10T00:00:00Z')],
    workouts: [w('w1', 'p1'), w('w2', 'p2')],
    logs: [{ user_id: U, workout_id: 'w1' }],
  });
  assert.equal(r.candidates.length, 0);
  assert.deepEqual(r.skipped, [{ userId: U, reason: 'already_sent_for_date' }]);
});

test('un envío de OTRA fecha (sesión que no es de mañana) no bloquea', () => {
  const r = run({ plans: [plan('p1', 'active')], workouts: [w('w1', 'p1')], logs: [{ user_id: U, workout_id: 'w-ayer' }] });
  assert.equal(r.candidates.length, 1);
});

test('fuente única: app ≥ 1.3.29 programa el aviso localmente → el servidor calla', () => {
  for (const v of ['1.3.29', '1.3.30', '1.3.31', '1.4.0', '2.0.0']) {
    const r = run({ plans: [plan('p1', 'active')], workouts: [w('w1', 'p1')], versionByUser: new Map([[U, v]]) });
    assert.equal(r.candidates.length, 0, v);
    assert.equal(r.skipped[0].reason, 'local_reminder_authoritative');
  }
});

test('respaldo: app anterior a 1.3.29 o versión desconocida → el servidor envía', () => {
  for (const v of ['1.3.25', '1.3.28', '1.2.99', undefined, null, 'garbage']) {
    const r = run({ plans: [plan('p1', 'active')], workouts: [w('w1', 'p1')], versionByUser: new Map([[U, v]]) });
    assert.equal(r.candidates.length, 1, String(v));
  }
});

test('latestVersionByUser: se queda con la fila más reciente con versión válida', () => {
  const m = mod.latestVersionByUser([
    { user_id: U, app_version: '1.3.25', created_at: '2026-09-01T00:00:00Z' },
    { user_id: U, app_version: '1.3.30', created_at: '2026-09-17T00:00:00Z' },
    { user_id: U, app_version: null, created_at: '2026-09-18T00:00:00Z' },
    { user_id: 'user-2', app_version: '1.3.25', created_at: '2026-09-18T00:00:00Z' },
  ]);
  assert.equal(m.get(U), '1.3.30');
  assert.equal(m.get('user-2'), '1.3.25');
});

test('compareVersions', () => {
  assert.equal(mod.compareVersions('1.3.29', '1.3.29'), 0);
  assert.equal(mod.compareVersions('1.3.30', '1.3.29'), 1);
  assert.equal(mod.compareVersions('1.3.9', '1.3.29'), -1);
  assert.equal(mod.compareVersions('x', '1.3.29'), null);
});

test('entradas no-array → sin candidatos, sin excepción', () => {
  const r = mod.selectEveCandidates({ workouts: null, plans: undefined, logs: 'x', versionByUser: {} });
  assert.deepEqual(r, { candidates: [], skipped: [] });
});
