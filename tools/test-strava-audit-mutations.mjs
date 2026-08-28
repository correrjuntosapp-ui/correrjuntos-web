#!/usr/bin/env node
// ============================================================
// F146.4 · Pruebas de mutación de la observabilidad de F134
//
// Una suite en verde solo demuestra que el código pasa la suite. Esto
// demuestra que la suite SIRVE: se rompe deliberadamente cada propiedad que
// decimos garantizar y se exige que algún test lo detecte.
//
// Un mutante que SOBREVIVE es un agujero en las pruebas, no un éxito.
//
// El control negativo es la otra mitad del experimento: un cambio inocuo
// que NO debe matar a nadie. Si muere, la suite está acoplada a detalles
// irrelevantes y sus resultados no significan lo que creemos.
//
//   node tools/test-strava-audit-mutations.mjs
// ============================================================

import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const LINKER = 'api/_lib/strava-plan-linker.js';
const AUDIT = 'api/_lib/strava-linking-audit.js';
const MATCHER = 'api/_lib/strava-plan-matcher.js';
const MIGRATION = 'supabase/migrations/20260828120000_f146_4_strava_linking_audit.sql';
const TEST = 'tests/unit/strava-linking-audit.test.mjs';
const ROLLBACK = 'supabase/migrations/20260828120000_f146_4_strava_linking_audit_rollback.sql';
const FIX_ACL = 'supabase/migrations/20260828140000_f146_5a_fix_strava_audit_acl.sql';
const PGTEST = 'tools/test-strava-audit-postgres.mjs';

const FILES = [LINKER, AUDIT, MATCHER, MIGRATION, ROLLBACK, FIX_ACL, TEST, PGTEST];

/**
 * Cada mutante rompe UNA propiedad concreta del contrato. `expect:'die'`
 * significa que la suite tiene que fallar; `expect:'survive'` es el control
 * negativo.
 */
const MUTANTS = [
  {
    id: 'M1',
    nombre: 'Retirar FORCE RLS de la tabla de auditoria',
    rompe: 'Segunda defensa: sin FORCE RLS el propietario esquiva las politicas',
    file: MIGRATION,
    from: 'ALTER TABLE public.strava_linking_audit FORCE ROW LEVEL SECURITY;',
    to: '-- (mutante M1) FORCE RLS retirado',
    expect: 'die',
  },
  {
    id: 'M2',
    nombre: 'Conceder SELECT a authenticated',
    rompe: 'Aislamiento: cualquier usuario logueado podria leer la auditoria entera',
    file: MIGRATION,
    from: 'GRANT INSERT, SELECT ON public.strava_linking_audit TO service_role;',
    to: 'GRANT INSERT, SELECT ON public.strava_linking_audit TO service_role;\n'
      + 'GRANT SELECT ON public.strava_linking_audit TO authenticated;',
    expect: 'die',
  },
  {
    id: 'M3',
    nombre: 'Omitir el registro de un early return (sin plan activo)',
    rompe: 'Cobertura: un camino de salida deja de quedar registrado',
    file: LINKER,
    from: `      await anotar('skipped', (planes && planes.length > 1)
        ? REASON.MULTIPLE_ACTIVE_PLANS
        : REASON.NO_ACTIVE_PLAN);
`,
    to: '',
    expect: 'die',
  },
  {
    id: 'M4',
    nombre: 'Permitir el vinculo aunque falle la auditoria',
    rompe: 'Fail-closed: se escribiria en produccion sin dejar rastro',
    file: LINKER,
    from: `    if (!reserva.ok) {
      return fuera('auditoria_no_disponible', { motivo: reserva.error || 'audit_failed' });
    }
`,
    to: '',
    expect: 'die',
  },
  {
    id: 'M5',
    nombre: 'Clave de evaluacion no determinista (duplica en reintento)',
    rompe: 'Idempotencia: cada reintento del webhook inflaria el denominador',
    file: AUDIT,
    // Contador monotono, NO Date.now(): dos llamadas seguidas pueden caer en
    // el mismo milisegundo y el mutante sobreviviria por azar, no por un
    // agujero real en la suite. Un mutante que muere a veces no mide nada.
    from: 'export function evaluationKey({',
    to: 'let __mut = 0;\nexport function evaluationKey({',
    extra: {
      file: AUDIT,
      from: "    workoutId || '-',\n  ].join('|');",
      to: "    workoutId || '-',\n    String(__mut += 1),\n  ].join('|');",
    },
    expect: 'die',
  },
  {
    id: 'M6',
    nombre: 'Ensanchar el margen de ±30 % a ±35 %',
    rompe: 'La ronda prohibe tocar el margen; F146.3 concluyo NO CAMBIARLO',
    file: MATCHER,
    from: 'export const TOLERANCIA = 0.30;',
    to: 'export const TOLERANCIA = 0.35;',
    expect: 'die',
  },
  {
    id: 'M7',
    nombre: 'Registrar el titulo y las coordenadas de la actividad',
    rompe: 'Cero PII: la tabla dejaria de ser segura de conservar 90 dias',
    file: AUDIT,
    from: "  'import_lag_minutes', 'source_path', 'error_stage', 'evaluation_key',\n]);",
    to: "  'import_lag_minutes', 'source_path', 'error_stage', 'evaluation_key',\n"
      + "  'titulo', 'lat_inicio', 'lng_inicio',\n]);",
    // El mutante tambien tiene que hacer que esos campos LLEGUEN a la fila,
    // porque ALLOWED_FIELDS solo recorta.
    extra: {
      file: AUDIT,
      from: '  const row = {\n    run_id: runId,',
      to: '  const row = {\n    titulo: input.titulo ?? null,\n'
        + '    lat_inicio: input.lat_inicio ?? null,\n    lng_inicio: input.lng_inicio ?? null,\n'
        + '    run_id: runId,',
    },
    expect: 'die',
  },
  {
    id: 'M8',
    nombre: 'Descomentar el DROP TABLE del rollback',
    rompe: 'El rollback debe preservar los datos salvo autorizacion explicita',
    file: ROLLBACK,
    from: '--   DROP TABLE IF EXISTS public.strava_linking_audit;',
    to: 'DROP TABLE IF EXISTS public.strava_linking_audit;',
    expect: 'die',
  },
  {
    id: 'M9',
    nombre: 'Reintroducir el REVOKE ALL ON ALL SEQUENCES IN SCHEMA public',
    rompe: 'Alcance: retiraria USAGE a 18 tablas ajenas y rompería sus INSERT',
    file: MIGRATION,
    from: '\nCOMMIT;',
    to: '\nREVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;\nCOMMIT;',
    expect: 'die',
  },
  {
    id: 'M10',
    nombre: 'Eliminar la revocacion inicial a service_role (F146.5A)',
    rompe: 'Append-only: service_role conservaria UPDATE/DELETE/TRUNCATE por default privileges',
    file: FIX_ACL,
    from: 'REVOKE ALL PRIVILEGES ON TABLE public.strava_linking_audit FROM service_role;',
    to: '-- (mutante M10) revocacion inicial eliminada',
    // Muere por COMPORTAMIENTO, no por texto: sin la revocacion, los default
    // privileges de Supabase dejan a service_role con ALL sobre la tabla.
    suite: 'postgres',
    expect: 'die',
  },
  {
    id: 'M11',
    nombre: 'Eliminar la revocacion sobre la secuencia de identidad (F146.5A)',
    rompe: 'anon, authenticated y service_role conservarian rwU sobre la secuencia',
    file: FIX_ACL,
    from: "    'REVOKE ALL PRIVILEGES ON SEQUENCE %s FROM PUBLIC, anon, authenticated, service_role',\n    v_seq);",
    to: "    'SELECT 1 FROM %s',\n    v_seq);",
    suite: 'postgres',
    expect: 'die',
  },
  {
    id: 'M12',
    nombre: 'Colar un ALL SEQUENCES IN SCHEMA public en la correctiva',
    rompe: 'Alcance: la correctiva solo puede tocar objetos de F146.4',
    file: FIX_ACL,
    from: '\nCOMMIT;',
    to: '\nREVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;\nCOMMIT;',
    expect: 'die',
  },
  {
    id: 'CN',
    nombre: 'CONTROL NEGATIVO · reformular un comentario',
    rompe: 'Nada. Si esto mata, la suite mide prosa en vez de comportamiento',
    file: LINKER,
    from: '    // Descripción de la magnitud comparada. Puramente informativa.',
    to: '    // Magnitud comparada, solo para la auditoria. No decide nada.',
    expect: 'survive',
  },
];

function prepararCopia() {
  const dir = mkdtempSync(join(tmpdir(), 'f1464-mut-'));
  for (const rel of FILES) {
    const dest = join(dir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(join(ROOT, rel), dest);
  }
  return dir;
}

function aplicar(dir, { file, from, to }) {
  const p = join(dir, file);
  const antes = readFileSync(p, 'utf8');
  if (!antes.includes(from)) {
    return { ok: false, error: `patron no encontrado en ${file}` };
  }
  if (antes.split(from).length - 1 !== 1) {
    return { ok: false, error: `patron ambiguo en ${file} (aparece mas de una vez)` };
  }
  writeFileSync(p, antes.replace(from, to));
  return { ok: true };
}

/**
 * Ejecuta la suite que corresponda al mutante.
 *
 * 'unit'     → contrato estatico y comportamiento del orquestador (rapido).
 * 'postgres' → aplica las migraciones sobre un cluster real. Hace falta para
 *              los mutantes de permisos: quitar un REVOKE no cambia ninguna
 *              cadena que un test de texto pudiera vigilar, solo cambia el
 *              ACL resultante. Matarlos con una asercion de texto seria
 *              vigilar la prosa en vez del efecto.
 */
function correrSuite(dir, suite = 'unit') {
  const cmd = suite === 'postgres'
    ? [join(dir, PGTEST)]
    : ['--test', join(dir, TEST)];
  const r = spawnSync(process.execPath, cmd, { encoding: 'utf8', timeout: 300000 });
  return { verde: r.status === 0, salida: `${r.stdout || ''}${r.stderr || ''}` };
}

function fallosDe(salida) {
  const unit = [...salida.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1]);
  const pg = [...salida.matchAll(/^ {2}✗ (.+?)(?:  |$)/gm)].map((m) => m[1].trim());
  return unit.concat(pg);
}

// ── Linea base ────────────────────────────────────────────
console.log('F146.4 · mutaciones de la observabilidad de F134\n');
const base = prepararCopia();
const baseline = correrSuite(base);
rmSync(base, { recursive: true, force: true });
if (!baseline.verde) {
  console.error('LINEA BASE EN ROJO. Sin baseline verde las mutaciones no significan nada.');
  console.error(baseline.salida.slice(-3000));
  process.exit(2);
}
const nBase = (baseline.salida.match(/^# pass (\d+)/m) || [])[1] || '?';
console.log(`Linea base: ${nBase} pruebas en verde.\n`);

// ── Mutantes ──────────────────────────────────────────────
let muertos = 0, vivos = 0, rotos = 0;
for (const m of MUTANTS) {
  const dir = prepararCopia();
  try {
    let ap = aplicar(dir, m);
    if (ap.ok && m.extra) ap = aplicar(dir, m.extra);
    if (!ap.ok) {
      console.log(`  ⚠ ${m.id}  ${m.nombre}\n      NO APLICABLE: ${ap.error}`);
      rotos += 1;
      continue;
    }
    const { verde, salida } = correrSuite(dir, m.suite);
    const murio = !verde;
    const correcto = m.expect === 'die' ? murio : !murio;

    if (m.expect === 'die') {
      if (murio) {
        muertos += 1;
        const f = fallosDe(salida);
        console.log(`  ✓ ${m.id}  MUERTO   ${m.nombre}`);
        console.log(`      rompe: ${m.rompe}`);
        console.log(`      lo detecta: ${f.slice(0, 3).join(' · ') || '(fallo sin nombre)'}`
          + (f.length > 3 ? ` · +${f.length - 3} mas` : ''));
      } else {
        vivos += 1;
        console.log(`  ✗ ${m.id}  SOBREVIVE  ${m.nombre}`);
        console.log(`      AGUJERO: nadie detecta que se rompa "${m.rompe}"`);
      }
    } else {
      if (murio) {
        vivos += 1;
        console.log(`  ✗ ${m.id}  CONTROL NEGATIVO MUERTO  ${m.nombre}`);
        console.log(`      La suite reacciona a un cambio inocuo: ${fallosDe(salida).join(' · ')}`);
      } else {
        muertos += 1;
        console.log(`  ✓ ${m.id}  SOBREVIVE (correcto)  ${m.nombre}`);
      }
    }
    if (!correcto) process.exitCode = 1;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`\n${muertos}/${MUTANTS.length} con el resultado esperado`
  + (vivos ? ` · ${vivos} INCORRECTOS` : '')
  + (rotos ? ` · ${rotos} no aplicables` : ''));

if (rotos) process.exitCode = 1;
if (process.exitCode) {
  console.log('\nRESULTADO: la suite NO protege lo que dice proteger.');
} else {
  console.log('\nRESULTADO: cada propiedad declarada tiene al menos una prueba que la defiende,');
  console.log('y la suite no reacciona a cambios inocuos.');
}
