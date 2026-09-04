#!/usr/bin/env node
// ============================================================
// P0 long_run_day · prueba de la migración sobre PostgreSQL REAL
//
// QUÉ REPRODUCE: el fallo exacto de producción. 55 eventos
// `plan_creation_failed` con error `long_run_day_required`, 43 usuarios
// afectados, 29 de ellos sin llegar a tener ningún plan. Ocurre cuando el
// cliente llama a la RPC sin p_long_run_day y la plantilla tiene sesiones de
// tirada larga (las cinco prep-*).
//
// POR QUÉ ESTA PRUEBA Y NO UNA DE TEXTO: la migración no reescribe el cuerpo de
// las funciones, hace una sustitución dirigida con regexp sobre la definición
// viva. Lo frágil es justo el regexp. Una primera versión de esta migración
// (descartada antes de escribirla) dejaba el RAISE dentro del ELSE y habría
// roto el caso normal — el que SÍ envía el día. Aquí se comprueba el EFECTO
// sobre un Postgres de verdad, no la forma del texto.
//
// LÍMITE HONESTO: un cluster virgen no tiene las RPC reales de producción
// (dependen de plan_templates, plan_template_workouts y _plan_v3_assign_days).
// Lo que se verifica aquí es la MECÁNICA de la migración sobre funciones que
// reproducen el bloque de guarda byte a byte. La verificación end-to-end contra
// generate_user_plan_v3 real requiere una rama de Supabase y queda pendiente de
// autorización del founder.
//
//   node tools/test-long-run-day-postgres.mjs
//
// Si no hay binarios de PostgreSQL, SALTA con código 0 y lo dice: no finge PASS.
// ============================================================

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATION = join(ROOT, 'supabase/migrations/20260904123439_long_run_day_default.sql');

function findBin() {
  const cands = ['/usr/lib/postgresql/16/bin', '/usr/lib/postgresql/15/bin',
    '/usr/lib/postgresql/14/bin', '/usr/local/pgsql/bin', '/usr/bin'];
  // Windows (scoop / instalador oficial): binarios con extension .exe.
  // Las rutas se normalizan a POSIX porque el shell es Git Bash: una ruta con
  // backslashes se convierte en "C:Usersguett..." al interpolarla en el comando.
  const home = (process.env.USERPROFILE || process.env.HOME || '').replace(/\\/g, '/');
  if (home) cands.unshift(home + '/scoop/apps/postgresql/current/bin');
  for (const v of ['17', '16', '15', '14']) cands.push('C:/Program Files/PostgreSQL/' + v + '/bin');
  for (const d of cands) {
    const exe = process.platform === 'win32' ? '.exe' : '';
    if (existsSync(join(d, 'initdb' + exe)) && existsSync(join(d, 'pg_ctl' + exe))) {
      // "C:/x" -> "/c/x" para Git Bash; en Unix se devuelve tal cual.
      return d.replace(/^([A-Za-z]):\//, (_m, l) => '/' + l.toLowerCase() + '/');
    }
  }
  return null;
}
const BIN = findBin();
if (!BIN) {
  console.log('P0 long_run_day · prueba PostgreSQL: SALTADA');
  console.log('  No hay binarios de PostgreSQL (initdb/pg_ctl) en este entorno.');
  console.log('  Sin esta prueba la migracion NO esta verificada: no la apliques.');
  process.exit(0);
}

const WIN = process.platform === 'win32';
const DIR = WIN ? 'C:/tmp/longrun-pgtest' : '/tmp/longrun-pgtest';
const DATA = join(DIR, 'data');
const SOCK = join(DIR, 'sock');
// El shell es Git Bash tambien en Windows: necesita las rutas en POSIX.
const toSh = (p) => String(p).replace(/\\/g, '/').replace(/^([A-Za-z]):\//, (_m, l) => '/' + l.toLowerCase() + '/');
// Windows no tiene sockets de dominio Unix: alli el cluster escucha en TCP.
const PORT = 55432;
const CONN = WIN ? '-h 127.0.0.1 -p ' + PORT : '-h ' + toSh(SOCK);
const asPostgres = !WIN && process.getuid && process.getuid() === 0;

function sh(cmd) {
  const full = asPostgres ? ['su', 'postgres', '-c', cmd] : ['sh', '-c', cmd];
  return spawnSync(full[0], full.slice(1), { encoding: 'utf8' });
}

function psql(sql, { expectFail = false } = {}) {
  const f = join(DIR, 'q-' + Math.random().toString(36).slice(2) + '.sql');
  writeFileSync(f, sql);
  if (!WIN) chmodSync(f, 0o644);
  // -tA sin separador de campos: todas las consultas devuelven un solo valor.
  // (Un -F'|' aqui lo interpretaria Git Bash como tuberia y psql se quedaria
  // esperando stdin para siempre.) -w: nunca pedir contrasena de forma
  // interactiva; si la pidiera, preferimos fallar a colgarnos.
  const r = sh(BIN + '/psql -q -w ' + CONN + ' -U postgres -d postgres -v ON_ERROR_STOP=1 -tA -f ' + toSh(f));
  rmSync(f, { force: true });
  if (expectFail) {
    if (r.status === 0) throw new Error('SE ESPERABA UN FALLO y no lo hubo:\n' + sql);
    return (r.stderr || '').trim();
  }
  if (r.status !== 0) throw new Error('psql fallo:\n' + sql + '\n---\n' + r.stderr);
  return (r.stdout || '').trim();
}

let fallos = 0, pasadas = 0;
function ok(nombre, cond, detalle) {
  if (cond) { pasadas += 1; console.log('  OK  ' + nombre + (detalle ? '  ' + detalle : '')); }
  else { fallos += 1; console.log('  FAIL ' + nombre + (detalle ? '\n       ' + detalle : '')); }
}

// Reproduce el bloque de guarda de las RPC reales (lineas 66-79 de
// generate_user_plan_v3) byte a byte. Devuelve el dia elegido para observarlo.
function fnStub(nombre, mensajeRequired, tieneLongRun) {
  return [
    'CREATE OR REPLACE FUNCTION public.' + nombre + '(p_dias_disponibles jsonb, p_long_run_day integer)',
    'RETURNS integer LANGUAGE plpgsql AS $fn$',
    'DECLARE',
    '  v_chrono INT[];',
    '  v_num_dias INT;',
    '  v_lrd INT;',
    '  v_template_has_long_run BOOLEAN := ' + tieneLongRun + ';',
    'BEGIN',
    '  SELECT array_agg(d ORDER BY d) INTO v_chrono',
    '    FROM (SELECT DISTINCT (p_dias_disponibles->>i)::int AS d',
    '          FROM generate_series(0, jsonb_array_length(p_dias_disponibles) - 1) AS i) s;',
    '  IF EXISTS (SELECT 1 FROM unnest(v_chrono) AS d WHERE d IS NULL OR d < 1 OR d > 7) THEN',
    "    RAISE EXCEPTION 'dias_disponibles_invalid: each day must be an integer 1..7';",
    '  END IF;',
    '  v_num_dias := array_length(v_chrono, 1);',
    '',
    '  IF v_template_has_long_run THEN',
    '    IF p_long_run_day IS NULL THEN',
    "      RAISE EXCEPTION '" + mensajeRequired + "';",
    '    END IF;',
    '    IF p_long_run_day < 1 OR p_long_run_day > 7 THEN',
    "      RAISE EXCEPTION 'long_run_day_invalid: p_long_run_day must be 1..7 (got %)', p_long_run_day;",
    '    END IF;',
    '    IF NOT (v_chrono @> ARRAY[p_long_run_day]) THEN',
    "      RAISE EXCEPTION 'long_run_day_not_selected: p_long_run_day % must be one of p_dias_disponibles', p_long_run_day;",
    '    END IF;',
    '    v_lrd := p_long_run_day;',
    '  ELSE',
    '    v_lrd := NULL;',
    '  END IF;',
    '',
    '  RETURN v_lrd;',
    'END',
    '$fn$;',
  ].join('\n');
}

console.log('P0 long_run_day · migracion sobre PostgreSQL real\n');

try {
  rmSync(DIR, { recursive: true, force: true });
  mkdirSync(DATA, { recursive: true });
  mkdirSync(SOCK, { recursive: true });
  if (asPostgres) execFileSync('chown', ['-R', 'postgres:postgres', DIR]);
  if (!WIN) mkdirSync(SOCK, { recursive: true });

  let r = sh(BIN + '/initdb -D ' + toSh(DATA) + ' -A trust --no-locale -E UTF8');
  if (r.status !== 0) throw new Error('initdb fallo: ' + r.stderr);
  // En Windows las comillas simples llegarian literales al parametro y
  // PostgreSQL intentaria resolver el host "'127.0.0.1'".
  const opts = WIN
    ? '-p ' + PORT + ' -c listen_addresses=127.0.0.1'
    : '-k ' + toSh(SOCK) + " -c listen_addresses=''";
  r = sh(BIN + '/pg_ctl -D ' + toSh(DATA) + ' -o "' + opts + '" -l ' + toSh(DIR) + '/log.txt start -w -t 30');
  if (r.status !== 0) {
    const log = existsSync(join(DIR, 'log.txt')) ? readFileSync(join(DIR, 'log.txt'), 'utf8') : (r.stderr || '');
    throw new Error('arranque fallo: ' + log);
  }
  console.log('  cluster efimero PostgreSQL ' + psql('SELECT version();').split(' ')[1] + '\n');

  // Las dos RPC reales (con sus mensajes distintos) + una plantilla sin long_run.
  psql(fnStub('generate_user_plan_v3',
    'long_run_day_required: template X has long_run sessions but p_long_run_day is NULL', 'TRUE'));
  psql(fnStub('generate_user_plan_adaptive_v3',
    'long_run_day_required: distancia X has long_run sessions but p_long_run_day is NULL', 'TRUE'));
  psql(fnStub('plantilla_sin_long_run', 'long_run_day_required: nunca', 'FALSE'));

  // -- ANTES: el fallo de produccion se reproduce --------------------
  console.log('  ANTES de la migracion');
  const eAntes = psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, NULL);", { expectFail: true });
  ok('reproduce el fallo exacto de produccion', /long_run_day_required/.test(eAntes),
    eAntes.split('\n')[0].slice(0, 90));
  ok('dia explicito funcionaba',
    psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, 3);") === '3');
  ok('plantilla sin long_run funcionaba',
    psql("SELECT coalesce(public.plantilla_sin_long_run('[1,3,5]'::jsonb, NULL)::text, 'NULL');") === 'NULL');

  // -- Aplicar migracion --------------------------------------------
  console.log('\n  aplicando migracion...');
  const fm = join(DIR, 'migracion.sql');
  writeFileSync(fm, readFileSync(MIGRATION, 'utf8'));
  if (!WIN) chmodSync(fm, 0o644);
  r = sh(BIN + '/psql -w ' + CONN + ' -U postgres -d postgres -v ON_ERROR_STOP=1 -f ' + toSh(fm));
  if (r.status !== 0) throw new Error('la migracion fallo:\n' + r.stderr);

  // -- DESPUES -------------------------------------------------------
  console.log('\n  DESPUES de la migracion');

  const d1 = psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, NULL);");
  ok('EL FALLO DESAPARECE: NULL -> viernes (ultimo dia)', d1 === '5', '-> ' + d1);

  const d2 = psql("SELECT public.generate_user_plan_adaptive_v3('[1,3,5]'::jsonb, NULL);");
  ok('idem en la RPC adaptive', d2 === '5', '-> ' + d2);

  const d3 = psql("SELECT public.generate_user_plan_v3('[2,4,6,7]'::jsonb, NULL);");
  ok('otros dias: [2,4,6,7] -> domingo', d3 === '7', '-> ' + d3);

  const d4 = psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, 3);");
  ok('NO CAMBIA el dia explicito', d4 === '3', '-> ' + d4);

  const d5 = psql("SELECT coalesce(public.plantilla_sin_long_run('[1,3,5]'::jsonb, NULL)::text, 'NULL');");
  ok('NO CAMBIA la plantilla sin long_run', d5 === 'NULL', '-> ' + d5);

  const e1 = psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, 9);", { expectFail: true });
  ok('sigue rechazando dia fuera de 1..7', /long_run_day_invalid/.test(e1));

  const e2 = psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, 4);", { expectFail: true });
  ok('sigue rechazando dia no elegido', /long_run_day_not_selected/.test(e2));

  const quedan = psql("SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace "
    + "WHERE n.nspname='public' AND p.proname LIKE 'generate_user_plan%' "
    + "AND pg_get_functiondef(p.oid) LIKE '%long_run_day_required%';");
  ok('ya no queda ningun long_run_day_required', quedan === '0', '-> ' + quedan);

  // -- Re-aplicarla debe FALLAR con mensaje claro, no corromper -------
  const r2 = sh(BIN + '/psql -w ' + CONN + ' -U postgres -d postgres -v ON_ERROR_STOP=1 -f ' + toSh(fm));
  ok('re-aplicarla falla en vez de corromper',
    r2.status !== 0 && /patron no encontrado/.test(r2.stderr || ''),
    ((r2.stderr || '').split('\n').find(function (l) { return l.indexOf('patron') >= 0; }) || ''));

} catch (e) {
  fallos += 1;
  console.log('\n  ERROR: ' + e.message);
} finally {
  sh(BIN + '/pg_ctl -D ' + toSh(DATA) + ' stop -m immediate');
  rmSync(DIR, { recursive: true, force: true });
}

console.log('\n  ' + pasadas + ' pasadas, ' + fallos + ' fallos');
process.exit(fallos === 0 ? 0 : 1);
