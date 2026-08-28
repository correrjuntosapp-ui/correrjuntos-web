#!/usr/bin/env node
// ============================================================
// F146.4 · Equivalencia contractual del orquestador de F134
//
// La instrumentación no puede cambiar lo que F134 decide. Este control lo
// demuestra ejecutando el orquestador DESPLEGADO EN PRODUCCIÓN y el
// instrumentado contra los mismos escenarios, y exigiendo que devuelvan
// objetos idénticos byte a byte.
//
// La línea base sale de git (no de una copia a mano), así que no puede
// quedarse obsoleta en silencio.
//
//   node tools/test-strava-linker-equivalence.mjs [sha-base]
//
// Única divergencia legítima y esperada: `auditoria_no_disponible`, que solo
// existe en modo live cuando no se puede registrar la decisión. El original
// no podía alcanzar ese estado porque no registraba nada.
// ============================================================

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_SHA = process.argv[2] || '29b5ed12a2ac5433fc954858f5ed04d1348a32a8';
const LINKER = 'api/_lib/strava-plan-linker.js';

let baseSrc;
try {
  baseSrc = execFileSync('git', ['show', `${BASE_SHA}:${LINKER}`],
    { cwd: ROOT, encoding: 'utf8' });
} catch {
  console.error(`No se puede leer ${LINKER} en ${BASE_SHA}. ¿Falta el objeto en este clon?`);
  process.exit(2);
}

const dir = mkdtempSync(join(tmpdir(), 'f1464-equiv-'));
try {
  mkdirSync(join(dir, 'api/_lib'), { recursive: true });
  writeFileSync(join(dir, LINKER), baseSrc);
  // El matcher es compartido y byte-idéntico; se copia el del árbol actual.
  cpSync(join(ROOT, 'api/_lib/strava-plan-matcher.js'), join(dir, 'api/_lib/strava-plan-matcher.js'));
  // El original no importa el módulo de auditoría, pero si alguna vez lo
  // hiciera, este enlace evita un fallo de resolución opaco.
  cpSync(join(ROOT, 'api/_lib/strava-linking-audit.js'), join(dir, 'api/_lib/strava-linking-audit.js'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }));

  const { vincularActividadConPlan: VIEJO } = await import(join(dir, LINKER));
  const { vincularActividadConPlan: NUEVO } = await import(join(ROOT, LINKER));

  const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  const RUN = U(1), USER = U(2), PLAN = U(3), WORKOUT = U(4), OTHER = U(9);
  const run = (o = {}) => ({ id: RUN, user_id: USER, deporte: 'running', fecha: '2026-08-20',
    distancia_km: 10, duracion_segundos: 3000, hora_inicio: '2026-08-20T07:00:00.000Z', ...o });
  const wk = (o = {}) => ({ id: WORKOUT, plan_id: PLAN, estado: 'pending', fecha: '2026-08-20',
    tipo: 'easy_run', actividad_id: null, distancia_target_km: 10, duracion_target_min: null, ...o });

  function sb(opts = {}) {
    const R = {
      strava_linking_config: opts.config ?? { data: [{ enabled: true, dry_run: true, allowlist: [] }], error: null },
      user_plans: opts.plans ?? { data: [{ id: PLAN, user_id: USER, estado: 'active' }], error: null },
      user_workouts: opts.workouts ?? { data: [wk()], error: null },
    };
    return {
      from(t) {
        let is = false;
        const q = { select: () => q, eq: () => q, is() { is = true; return q; }, limit: () => q,
          insert: () => Promise.resolve({ data: null, error: null }),
          then(r, j) {
            const o = t === 'user_workouts'
              ? (is ? R.user_workouts : (opts.yaUsada ?? { data: [], error: null }))
              : (R[t] ?? { data: [], error: null });
            return Promise.resolve(o).then(r, j);
          } };
        return q;
      },
      rpc: () => Promise.resolve(opts.rpcResult ?? { data: [{ escrito: true, motivo: 'completada' }], error: null }),
    };
  }

  const LIVE = { config: { data: [{ enabled: true, dry_run: false, allowlist: [USER] }], error: null } };
  const ESCENARIOS = [
    ['dry · match', {}, run()],
    ['canario apagado', { config: { data: [{ enabled: false, dry_run: true, allowlist: [] }], error: null } }, run()],
    ['config ausente', { config: { data: [], error: null } }, run()],
    ['config ilegible', { config: { data: null, error: { code: '42P01' } } }, run()],
    ['allowlist demasiado grande', { config: { data: [{ enabled: true, dry_run: true, allowlist: [U(5), U(6), U(7)] }], error: null } }, run()],
    ['allowlist invalida', { config: { data: [{ enabled: true, dry_run: true, allowlist: ['a@b.com'] }], error: null } }, run()],
    ['fuera de allowlist en live', { config: { data: [{ enabled: true, dry_run: false, allowlist: [OTHER] }], error: null } }, run()],
    ['error consultando planes', { plans: { data: null, error: { code: '42501' } } }, run()],
    ['sin plan activo', { plans: { data: [], error: null } }, run()],
    ['varios planes activos', { plans: { data: [{ id: PLAN, user_id: USER, estado: 'active' }, { id: U(8), user_id: USER, estado: 'active' }], error: null } }, run()],
    ['error consultando sesiones', { workouts: { data: null, error: { code: '42501' } } }, run()],
    ['sin sesion libre', { workouts: { data: [], error: null } }, run()],
    ['fuera de margen por distancia', { workouts: { data: [wk({ distancia_target_km: 3 })], error: null } }, run()],
    ['fuera de margen por duracion', { workouts: { data: [wk({ distancia_target_km: null, duracion_target_min: 20 })], error: null } }, run()],
    ['sesion sin objetivo', { workouts: { data: [wk({ distancia_target_km: null, duracion_target_min: null })], error: null } }, run()],
    ['ya vinculada', { yaUsada: { data: [{ id: WORKOUT }], error: null } }, run()],
    ['deporte incompatible', {}, run({ deporte: 'walking' })],
    ['actividad sin magnitudes', {}, run({ distancia_km: 0, duracion_segundos: 0 })],
    ['ambigua', { workouts: { data: [wk(), wk({ id: U(11) })], error: null } }, run()],
    ['live · completada', LIVE, run()],
    ['live · sin cambios', { ...LIVE, rpcResult: { data: [{ escrito: false, motivo: 'sin_cambios' }], error: null } }, run()],
    ['live · error de rpc', { ...LIVE, rpcResult: { data: null, error: { message: 'boom' } } }, run()],
  ];

  console.log(`F146.4 · equivalencia contractual del orquestador\nBase: ${BASE_SHA.slice(0, 8)}\n`);
  let dif = 0;
  for (const [nombre, opts, r] of ESCENARIOS) {
    const a = await VIEJO(sb(opts), r, { nowIso: '2026-08-20T08:00:00.000Z' });
    const b = await NUEVO(sb(opts), r, { nowIso: '2026-08-20T08:00:00.000Z' });
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      dif += 1;
      console.log(`  ✗ ${nombre}\n      base:  ${JSON.stringify(a)}\n      nuevo: ${JSON.stringify(b)}`);
    } else {
      console.log(`  ✓ ${nombre.padEnd(30)} ${JSON.stringify(a)}`);
    }
  }
  console.log(`\n${ESCENARIOS.length - dif}/${ESCENARIOS.length} contractualmente identicos`);
  if (dif) {
    console.log('\nLa instrumentacion ha cambiado una decision. Eso NO esta permitido en esta ronda.');
    process.exitCode = 1;
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
