#!/usr/bin/env node
// ============================================================
// P0 long_run_day (2/2) · el default no puede depender del dia de alta
//
// QUE PRUEBA: que el dia de tirada larga que asigna el servidor cuando el
// cliente no lo envia es SIEMPRE el mismo, sea cual sea el dia de la semana en
// que el usuario crea el plan, y que coincide con el que asigna el cliente
// corregido (AUTO_LONG_RUN_DAY = ultimo de AUTO_AVAILABLE_DAYS = viernes).
//
// POR QUE EXISTE: la primera regresion (test-long-run-day-postgres.mjs) daba
// verde con un stub que construia v_chrono con `ORDER BY d` (numerico). Las RPC
// reales lo ordenan por PROXIMIDAD a p_fecha_inicio:
//
//     ORDER BY ((d - v_iso_start) % 7 + 7) % 7
//
// Con esa diferencia, `v_chrono[v_num_dias]` no es "el ultimo dia de la semana":
// es el ultimo en llegar desde la fecha de inicio. Con [1,3,5] el default salia
// LUNES si el alta era martes o miercoles, y MIERCOLES si era jueves o viernes
// — 4 de 7 dias posibles, y con la tirada larga en el peor sitio. El stub tapaba
// justo el comportamiento que importaba: una prueba que no reproduce el codigo
// real no prueba nada.
//
// Aqui el stub replica el ORDER BY autentico y se barren los 7 dias de inicio,
// antes y despues de la segunda migracion.
//
//   node tools/test-long-run-day-weekday-postgres.mjs
//
// Si no hay binarios de PostgreSQL, SALTA con codigo 0 y lo dice: no finge PASS.
// ============================================================

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIG_1 = join(ROOT, 'supabase/migrations/20260904123439_long_run_day_default.sql');
const MIG_2 = join(ROOT, 'supabase/migrations/20260904132750_long_run_day_default_max_iso.sql');

function findBin() {
  const cands = ['/usr/lib/postgresql/16/bin', '/usr/lib/postgresql/15/bin',
    '/usr/lib/postgresql/14/bin', '/usr/local/pgsql/bin', '/usr/bin'];
  const home = (process.env.USERPROFILE || process.env.HOME || '').replace(/\\/g, '/');
  if (home) cands.unshift(home + '/scoop/apps/postgresql/current/bin');
  for (const v of ['18', '17', '16', '15', '14']) cands.push('C:/Program Files/PostgreSQL/' + v + '/bin');
  for (const d of cands) {
    const exe = process.platform === 'win32' ? '.exe' : '';
    if (existsSync(join(d, 'initdb' + exe)) && existsSync(join(d, 'pg_ctl' + exe))) {
      return d.replace(/^([A-Za-z]):\//, (_m, l) => '/' + l.toLowerCase() + '/');
    }
  }
  return null;
}
const BIN = findBin();
if (!BIN) {
  console.log('P0 long_run_day (dias de la semana) · prueba PostgreSQL: SALTADA');
  console.log('  No hay binarios de PostgreSQL (initdb/pg_ctl) en este entorno.');
  console.log('  Sin esta prueba la migracion NO esta verificada: no la apliques.');
  process.exit(0);
}

const WIN = process.platform === 'win32';
const DIR = WIN ? 'C:/tmp/longrun-wd-pgtest' : '/tmp/longrun-wd-pgtest';
const DATA = join(DIR, 'data');
const SOCK = join(DIR, 'sock');
const toSh = (p) => String(p).replace(/\\/g, '/').replace(/^([A-Za-z]):\//, (_m, l) => '/' + l.toLowerCase() + '/');
const PORT = 55434;
const USER = WIN ? (process.env.USERNAME || 'postgres') : 'postgres';
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
  const r = sh(BIN + '/psql -q -w ' + CONN + ' -U ' + USER + ' -d postgres -v ON_ERROR_STOP=1 -tA -f ' + toSh(f));
  rmSync(f, { force: true });
  if (expectFail) {
    if (r.status === 0) throw new Error('SE ESPERABA UN FALLO y no lo hubo:\n' + sql);
    return (r.stderr || '').trim();
  }
  if (r.status !== 0) throw new Error('psql fallo:\n' + sql + '\n---\n' + r.stderr);
  return (r.stdout || '').trim();
}
function aplicarFichero(ruta) {
  const f = join(DIR, 'mig-' + Math.random().toString(36).slice(2) + '.sql');
  writeFileSync(f, readFileSync(ruta, 'utf8'));
  if (!WIN) chmodSync(f, 0o644);
  const r = sh(BIN + '/psql -w ' + CONN + ' -U ' + USER + ' -d postgres -v ON_ERROR_STOP=1 -f ' + toSh(f));
  rmSync(f, { force: true });
  if (r.status !== 0) throw new Error('migracion fallo (' + ruta + '):\n' + r.stderr);
}

let fallos = 0, pasadas = 0;
function ok(nombre, cond, detalle) {
  if (cond) { pasadas += 1; console.log('  OK   ' + nombre + (detalle ? '  ' + detalle : '')); }
  else { fallos += 1; console.log('  FAIL ' + nombre + (detalle ? '\n       ' + detalle : '')); }
}

const DIAS = ['', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Stub FIEL a las RPC reales: v_chrono ordenado por proximidad a la fecha de
// inicio, no por numero de dia. p_iso_start simula EXTRACT(ISODOW FROM p_fecha_inicio).
const STUB = `
CREATE OR REPLACE FUNCTION public.generate_user_plan_v3(p_dias_disponibles jsonb, p_long_run_day integer, p_iso_start integer)
RETURNS integer LANGUAGE plpgsql AS $fn$
DECLARE
  v_chrono INT[];
  v_num_dias INT;
  v_lrd INT;
  v_iso_start INT := p_iso_start;
  v_template_has_long_run BOOLEAN := TRUE;
BEGIN
  SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
    INTO v_chrono
    FROM (SELECT DISTINCT (p_dias_disponibles->>i)::int AS d
          FROM generate_series(0, jsonb_array_length(p_dias_disponibles) - 1) AS i) s;
  IF EXISTS (SELECT 1 FROM unnest(v_chrono) AS d WHERE d IS NULL OR d < 1 OR d > 7) THEN
    RAISE EXCEPTION 'dias_disponibles_invalid: each day must be an integer 1..7';
  END IF;
  v_num_dias := array_length(v_chrono, 1);

  IF v_template_has_long_run THEN
    IF p_long_run_day IS NULL THEN
      RAISE EXCEPTION 'long_run_day_required: template % has long_run sessions but p_long_run_day is NULL', 'prep-10k';
    END IF;
    IF p_long_run_day < 1 OR p_long_run_day > 7 THEN
      RAISE EXCEPTION 'long_run_day_invalid: p_long_run_day must be 1..7 (got %)', p_long_run_day;
    END IF;
    IF NOT (v_chrono @> ARRAY[p_long_run_day]) THEN
      RAISE EXCEPTION 'long_run_day_not_selected: p_long_run_day % must be one of p_dias_disponibles', p_long_run_day;
    END IF;
    v_lrd := p_long_run_day;
  ELSE
    v_lrd := NULL;
  END IF;

  RETURN v_lrd;
END
$fn$;`;

console.log('P0 long_run_day (2/2) · el default no puede depender del dia de alta\n');

try {
  rmSync(DIR, { recursive: true, force: true });
  mkdirSync(DATA, { recursive: true });
  if (!WIN) mkdirSync(SOCK, { recursive: true });
  if (asPostgres) execFileSync('chown', ['-R', 'postgres:postgres', DIR]);

  let r = sh(BIN + '/initdb -D ' + toSh(DATA) + ' -A trust --no-locale -E UTF8');
  if (r.status !== 0) throw new Error('initdb fallo: ' + r.stderr);
  const opts = WIN
    ? '-p ' + PORT + ' -c listen_addresses=127.0.0.1'
    : '-k ' + toSh(SOCK) + " -c listen_addresses=''";
  // Sin -w: en Git Bash `pg_ctl start -w` no devuelve el control aunque el
  // servidor arranque, y el proceso se queda colgado para siempre. Se arranca
  // en segundo plano y se sondea con psql hasta que acepte conexiones.
  // La salida se redirige a /dev/null: si el proceso de fondo conserva los
  // pipes heredados, spawnSync se queda esperando a que se cierren y el
  // arranque nunca retorna.
  sh(BIN + '/pg_ctl -D ' + toSh(DATA) + ' -o "' + opts + '" -l ' + toSh(DIR) + '/log.txt start > /dev/null 2>&1 &');
  const dormir = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  let listo = false;
  for (let intento = 0; intento < 30 && !listo; intento += 1) {
    const ping = sh(BIN + '/psql -q -w ' + CONN + ' -U ' + USER + ' -d postgres -tA -c "SELECT 1"');
    if (ping.status === 0) { listo = true; break; }
    dormir(1000);
  }
  if (!listo) {
    const log = existsSync(join(DIR, 'log.txt')) ? readFileSync(join(DIR, 'log.txt'), 'utf8') : '';
    throw new Error('el cluster no acepto conexiones en 30 s:\n' + log);
  }
  console.log('  cluster efimero PostgreSQL ' + psql('SELECT version();').split(' ')[1] + '\n');

  // Las dos RPC: las migraciones recorren ambas y fallan si alguna no existe.
  psql(STUB);
  psql(STUB.replace(/generate_user_plan_v3/g, 'generate_user_plan_adaptive_v3')
           .replace("'prep-10k'", "'10K'")
           .replace('long_run_day_required: template %', 'long_run_day_required: distancia %'));

  // ── Con solo la migracion 1: el default DEPENDE del dia de alta ──
  aplicarFichero(MIG_1);
  console.log('  Con 20260904123439 (la aplicada en produccion): dias [1,3,5]');
  const conM1 = [];
  for (let iso = 1; iso <= 7; iso += 1) {
    const d = parseInt(psql(`SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, NULL, ${iso});`), 10);
    conM1.push(d);
    console.log(`     alta en ${DIAS[iso].padEnd(10)} -> tirada larga en ${DIAS[d]}`);
  }
  const distintos = new Set(conM1).size;
  ok('queda demostrado que el default variaba con el dia de alta', distintos > 1,
    `dias distintos obtenidos: ${distintos} (${[...new Set(conM1)].map((d) => DIAS[d]).join(', ')})`);
  ok('y no siempre coincidia con el cliente (viernes)', conM1.some((d) => d !== 5),
    `${conM1.filter((d) => d !== 5).length} de 7 dias de alta daban otro dia`);

  // ── Con la migracion 2: determinista ──
  aplicarFichero(MIG_2);
  console.log('\n  Con 20260904132750 (la correccion): dias [1,3,5]');
  const conM2 = [];
  for (let iso = 1; iso <= 7; iso += 1) {
    const d = parseInt(psql(`SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, NULL, ${iso});`), 10);
    conM2.push(d);
    console.log(`     alta en ${DIAS[iso].padEnd(10)} -> tirada larga en ${DIAS[d]}`);
  }
  ok('los 7 dias de alta dan VIERNES', conM2.every((d) => d === 5),
    `obtenido: [${conM2.join(',')}]`);
  ok('coincide con AUTO_LONG_RUN_DAY del cliente', conM2.every((d) => d === 5));

  // ── Otras combinaciones de dias, tambien en los 7 inicios ──
  const combos = [
    { dias: '[2,4,6,7]', esperado: 7 },
    { dias: '[1,2,3,4,5]', esperado: 5 },
    { dias: '[3]', esperado: 3 },
    { dias: '[6,7]', esperado: 7 },
  ];
  console.log('');
  for (const c of combos) {
    const res = [];
    for (let iso = 1; iso <= 7; iso += 1) {
      res.push(parseInt(psql(`SELECT public.generate_user_plan_v3('${c.dias}'::jsonb, NULL, ${iso});`), 10));
    }
    ok(`dias ${c.dias.padEnd(12)} -> ${DIAS[c.esperado]} en los 7 inicios`,
      res.every((d) => d === c.esperado), `obtenido: [${res.join(',')}]`);
  }

  // ── El dia explicito y las validaciones no se tocan ──
  console.log('');
  const expl = [];
  for (let iso = 1; iso <= 7; iso += 1) {
    expl.push(parseInt(psql(`SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, 3, ${iso});`), 10));
  }
  ok('dia explicito 3 se respeta en los 7 inicios', expl.every((d) => d === 3), `[${expl.join(',')}]`);
  ok('sigue rechazando dia fuera de 1..7',
    /long_run_day_invalid/.test(psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, 9, 1);", { expectFail: true })));
  ok('sigue rechazando dia no elegido',
    /long_run_day_not_selected/.test(psql("SELECT public.generate_user_plan_v3('[1,3,5]'::jsonb, 4, 1);", { expectFail: true })));
  ok('no queda ningun long_run_day_required',
    psql("SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'generate_user_plan%' AND pg_get_functiondef(p.oid) LIKE '%long_run_day_required%';") === '0');

  // ── Re-aplicar la 2 debe fallar sin corromper ──
  let reaplicar = null;
  try { aplicarFichero(MIG_2); } catch (e) { reaplicar = e.message; }
  ok('re-aplicar la correccion falla en vez de corromper',
    reaplicar !== null && /patron no encontrado/.test(reaplicar));

} catch (e) {
  fallos += 1;
  console.log('\n  ERROR: ' + e.message);
} finally {
  sh(BIN + '/pg_ctl -D ' + toSh(DATA) + ' stop -m immediate');
  rmSync(DIR, { recursive: true, force: true });
}

console.log('\n  ' + pasadas + ' pasadas, ' + fallos + ' fallos');
process.exit(fallos === 0 ? 0 : 1);
