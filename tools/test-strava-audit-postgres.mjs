#!/usr/bin/env node
// ============================================================
// F146.4A · Prueba de la migración sobre PostgreSQL REAL
//
// Las pruebas estáticas leen el texto de la migración. Esta la EJECUTA sobre
// un Postgres de verdad, en un cluster desechable, y comprueba lo que de
// verdad importa después de aplicarla.
//
// POR QUÉ EXISTE: la primera versión de la migración terminaba con
//
//     REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
//
// escrito como cinturón y tirantes para la secuencia de identidad de la
// tabla nueva. Alcanzaba a TODAS las secuencias del esquema. En producción
// hay 18 tablas con `serial` donde la app inserta desde el cliente
// (run_points, maria_chat_messages, el módulo de Fuerza, workout_feedback,
// analytics_events...), y todas habrían empezado a fallar con
// "permission denied for sequence". Una prueba de texto puede olvidarse de
// un patrón nuevo; esta comprueba el EFECTO: los permisos de un objeto
// ajeno tienen que quedar byte a byte iguales.
//
//   node tools/test-strava-audit-postgres.mjs
//
// [F146.5A] Y POR QUE CASI NO SIRVE. La primera version creaba los tres roles
// pero NO replicaba los ALTER DEFAULT PRIVILEGES de Supabase, que un cluster
// virgen no trae. Con ellos, toda tabla nueva de `public` nace con ALL para
// anon, authenticated y service_role, y toda secuencia con rwU. Por eso la
// prueba daba verde mientras en produccion service_role conservaba
// UPDATE/DELETE/TRUNCATE sobre la tabla de auditoria. Ahora se replican antes
// de crear nada, y se aplican las DOS migraciones en orden.
//
// Requiere binarios de PostgreSQL en el sistema. Si no los encuentra, SALTA
// la prueba con codigo 0 y lo dice: no finge un PASS.
// ============================================================

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATION = join(ROOT, 'supabase/migrations/20260828120000_f146_4_strava_linking_audit.sql');
const ROLLBACK = join(ROOT, 'supabase/migrations/20260828120000_f146_4_strava_linking_audit_rollback.sql');
const FIX_ACL = join(ROOT, 'supabase/migrations/20260828140000_f146_5a_fix_strava_audit_acl.sql');

// ── Localizar binarios ────────────────────────────────────
function findBin() {
  const cands = ['/usr/lib/postgresql/16/bin', '/usr/lib/postgresql/15/bin',
    '/usr/lib/postgresql/14/bin', '/usr/local/pgsql/bin', '/usr/bin'];
  for (const d of cands) {
    if (existsSync(join(d, 'initdb')) && existsSync(join(d, 'pg_ctl'))) return d;
  }
  return null;
}
const BIN = findBin();
if (!BIN) {
  console.log('F146.4A · prueba PostgreSQL: SALTADA');
  console.log('  No hay binarios de PostgreSQL (initdb/pg_ctl) en este entorno.');
  console.log('  Las pruebas estaticas de tests/unit/strava-linking-audit.test.mjs SI cubren');
  console.log('  el contrato del texto; lo que no se verifica aqui es el efecto real.');
  process.exit(0);
}

const DIR = '/tmp/f1464-pgtest';
const DATA = join(DIR, 'data');
const SOCK = join(DIR, 'sock');
const asPostgres = process.getuid && process.getuid() === 0;

function sh(cmd) {
  const full = asPostgres ? ['su', 'postgres', '-c', cmd] : ['sh', '-c', cmd];
  return spawnSync(full[0], full.slice(1), { encoding: 'utf8' });
}
/** Ejecuta SQL y devuelve stdout crudo. Lanza con el error de psql si falla. */
function psql(sql, { role = 'postgres', db = 'postgres', expectFail = false } = {}) {
  const f = join(DIR, `q-${Math.random().toString(36).slice(2)}.sql`);
  writeFileSync(f, sql);
  chmodSync(f, 0o644);
  // -q suprime las etiquetas de comando (SET, RESET, INSERT 0 1); sin ella
  // el valor devuelto llega mezclado con ellas y la asercion compara basura.
  const r = sh(`${BIN}/psql -q -h ${SOCK} -U ${role} -d ${db} -v ON_ERROR_STOP=1 -tAF'|' -f ${f}`);
  rmSync(f, { force: true });
  if (expectFail) {
    if (r.status === 0) throw new Error(`SE ESPERABA UN FALLO y no lo hubo:\n${sql}`);
    return (r.stderr || '').trim();
  }
  if (r.status !== 0) throw new Error(`psql fallo:\n${sql}\n---\n${r.stderr}`);
  return (r.stdout || '').trim();
}

let fallos = 0, pasadas = 0;
function ok(nombre, cond, detalle = '') {
  if (cond) { pasadas += 1; console.log(`  ✓ ${nombre}${detalle ? `  ${detalle}` : ''}`); }
  else { fallos += 1; console.log(`  ✗ ${nombre}${detalle ? `\n      ${detalle}` : ''}`); }
}

console.log('F146.4A · migracion sobre PostgreSQL real\n');

try {
  // ── Cluster desechable ──────────────────────────────────
  rmSync(DIR, { recursive: true, force: true });
  mkdirSync(DATA, { recursive: true });
  mkdirSync(SOCK, { recursive: true });
  if (asPostgres) execFileSync('chown', ['-R', 'postgres:postgres', DIR]);

  let r = sh(`${BIN}/initdb -D ${DATA} -A trust --no-locale -E UTF8`);
  if (r.status !== 0) throw new Error(`initdb fallo: ${r.stderr}`);
  r = sh(`${BIN}/pg_ctl -D ${DATA} -o "-k ${SOCK} -c listen_addresses=''" -l ${DIR}/log.txt start -w -t 30`);
  if (r.status !== 0) throw new Error(`arranque fallo: ${readFileSync(join(DIR, 'log.txt'), 'utf8')}`);
  const version = psql('SELECT version();').split(' ')[1];
  console.log(`  cluster efimero PostgreSQL ${version}\n`);

  // ── Roles equivalentes a los de Supabase ────────────────
  // service_role tiene BYPASSRLS igual que en produccion, que es lo que le
  // permite escribir en una tabla con FORCE RLS y cero politicas.
  psql(`
    CREATE ROLE anon           NOLOGIN;
    CREATE ROLE authenticated  NOLOGIN;
    CREATE ROLE service_role   NOLOGIN BYPASSRLS;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  `);

  // ── Privilegios por defecto de Supabase ─────────────────
  // Esto es lo que hace que la prueba se parezca a produccion. Sin ello, la
  // tabla nueva nace limpia y el defecto de F146.4 resulta invisible.
  psql(`
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
  `);

  // ── Objeto de control: una tabla ajena con `serial`, ────
  //    igual que las 18 que hay en produccion.
  psql(`
    CREATE TABLE public.tabla_de_control (
      id serial PRIMARY KEY,
      texto text NOT NULL
    );
    GRANT SELECT, INSERT ON public.tabla_de_control TO anon, authenticated;
    GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.tabla_de_control_id_seq
      TO anon, authenticated;
  `);

  const aclAntes = psql(
    `SELECT array_to_string(relacl,E'\\n') FROM pg_class
      WHERE oid='public.tabla_de_control_id_seq'::regclass;`);
  const usageAntes = psql(
    `SELECT has_sequence_privilege('authenticated','public.tabla_de_control_id_seq','USAGE');`);

  // ── APLICAR LA MIGRACION ────────────────────────────────
  const migracion = readFileSync(MIGRATION, 'utf8');
  const f = join(DIR, 'migracion.sql');
  writeFileSync(f, migracion);
  chmodSync(f, 0o644);
  r = sh(`${BIN}/psql -h ${SOCK} -U postgres -d postgres -v ON_ERROR_STOP=1 -f ${f}`);
  ok('la migracion F146.4 aplica sin errores', r.status === 0, r.status !== 0 ? r.stderr.trim() : '');
  if (r.status !== 0) throw new Error('la migracion no aplica; el resto no tiene sentido');

  // ── El defecto de F146.4 se reproduce ───────────────────
  // Si esto dejara de cumplirse, la prueba habria dejado de parecerse a
  // produccion y su verde no significaria nada.
  const srUpdateAntes = psql(
    `SELECT has_table_privilege('service_role','public.strava_linking_audit','UPDATE');`);
  ok('se REPRODUCE el defecto: service_role nace con UPDATE',
    srUpdateAntes === 't', `UPDATE=${srUpdateAntes} (si es 'f', la prueba ya no imita a produccion)`);
  const seqAntes = psql(
    `SELECT bool_or(has_sequence_privilege(r,'public.strava_linking_audit_id_seq',p))
       FROM (VALUES ('anon'),('authenticated')) x(r),
            (VALUES ('USAGE'),('SELECT'),('UPDATE')) y(p);`);
  ok('se REPRODUCE el defecto: la secuencia nace accesible a los clientes',
    seqAntes === 't', `accesible=${seqAntes}`);

  // ── APLICAR LA MIGRACION CORRECTIVA F146.5A ─────────────
  const fFix = join(DIR, 'fix-acl.sql');
  writeFileSync(fFix, readFileSync(FIX_ACL, 'utf8'));
  chmodSync(fFix, 0o644);
  r = sh(`${BIN}/psql -h ${SOCK} -U postgres -d postgres -v ON_ERROR_STOP=1 -f ${fFix}`);
  ok('la migracion correctiva F146.5A aplica sin errores', r.status === 0,
    r.status !== 0 ? r.stderr.trim() : '');
  if (r.status !== 0) throw new Error('la correctiva no aplica');

  // ── 1 · El objeto ajeno NO ha cambiado ──────────────────
  const aclDespues = psql(
    `SELECT array_to_string(relacl,E'\\n') FROM pg_class
      WHERE oid='public.tabla_de_control_id_seq'::regclass;`);
  const usageDespues = psql(
    `SELECT has_sequence_privilege('authenticated','public.tabla_de_control_id_seq','USAGE');`);

  ok('los ACL de la secuencia de control son IDENTICOS',
    aclAntes === aclDespues,
    aclAntes === aclDespues ? '' : `antes:\n${aclAntes}\n      despues:\n${aclDespues}`);
  ok('authenticated conserva USAGE sobre la secuencia ajena',
    usageAntes === 't' && usageDespues === 't', `antes=${usageAntes} despues=${usageDespues}`);

  // El efecto que de verdad importa: que el cliente pueda seguir insertando.
  psql(`SET ROLE authenticated;
        INSERT INTO public.tabla_de_control (texto) VALUES ('sigo funcionando');
        RESET ROLE;`);
  const filasControl = psql('SELECT count(*) FROM public.tabla_de_control;');
  ok('authenticated sigue pudiendo INSERTAR en la tabla ajena', filasControl === '1',
    `filas=${filasControl}`);

  // ── 2 · service_role escribe y obtiene id generado ──────
  const idGenerado = psql(`
    SET ROLE service_role;
    INSERT INTO public.strava_linking_audit
      (run_id, user_id, workout_id, mode, decision, reason, matcher_version,
       matching_basis, evaluation_key)
    VALUES ('00000000-0000-4000-8000-000000000001',
            '00000000-0000-4000-8000-000000000002',
            '00000000-0000-4000-8000-000000000004',
            'dry','would_link','would_link','f134.1','distance','k1')
    RETURNING id;
    RESET ROLE;`);
  ok('service_role puede INSERTAR y recibe un id generado',
    /^\d+$/.test(idGenerado), `id=${idGenerado}`);

  const leidas = psql(`SET ROLE service_role;
                       SELECT count(*) FROM public.strava_linking_audit;
                       RESET ROLE;`);
  ok('service_role puede LEER lo que escribio', leidas === '1', `filas=${leidas}`);

  // ── 3 · anon y authenticated no pueden acceder ──────────
  for (const rol of ['anon', 'authenticated']) {
    const eSel = psql(`SET ROLE ${rol}; SELECT * FROM public.strava_linking_audit;`,
      { expectFail: true });
    ok(`${rol} NO puede leer la tabla de auditoria`,
      /permission denied/i.test(eSel), eSel.split('\n')[0]);

    const eIns = psql(`SET ROLE ${rol};
      INSERT INTO public.strava_linking_audit
        (run_id,user_id,workout_id,mode,decision,reason,matcher_version,matching_basis,evaluation_key)
      VALUES ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002',
              '00000000-0000-4000-8000-000000000004','dry','would_link','would_link',
              'f134.1','distance','intruso');`, { expectFail: true });
    ok(`${rol} NO puede escribir en la tabla de auditoria`,
      /permission denied/i.test(eIns), eIns.split('\n')[0]);
  }

  // ── 4 · Sin privilegios sobre la secuencia de identidad ─
  const seqIdentidad = psql(`
    SELECT s.relname FROM pg_class s
    JOIN pg_depend d ON d.objid = s.oid AND d.classid='pg_class'::regclass
    JOIN pg_class t ON t.oid = d.refobjid
    WHERE s.relkind='S' AND t.relname='strava_linking_audit';`);
  ok('la tabla tiene una secuencia de identidad interna', seqIdentidad.length > 0, seqIdentidad);
  if (seqIdentidad) {
    for (const rol of ['anon', 'authenticated', 'service_role']) {
      const priv = psql(`SELECT has_sequence_privilege('${rol}','public.${seqIdentidad}','USAGE')
                         OR has_sequence_privilege('${rol}','public.${seqIdentidad}','SELECT')
                         OR has_sequence_privilege('${rol}','public.${seqIdentidad}','UPDATE');`);
      ok(`${rol} no tiene privilegios sobre la secuencia de identidad`, priv === 'f', `priv=${priv}`);
    }
    // La secuencia se resuelve como lo hace la migracion, no por su nombre.
    const resuelta = psql(
      `SELECT pg_get_serial_sequence('public.strava_linking_audit','id');`);
    ok('pg_get_serial_sequence resuelve la secuencia esperada',
      resuelta === 'public.strava_linking_audit_id_seq', resuelta);
  }

  // ── 5 · RLS, FORCE RLS y ausencia de politicas ──────────
  const rls = psql(`SELECT relrowsecurity, relforcerowsecurity
                    FROM pg_class WHERE oid='public.strava_linking_audit'::regclass;`);
  ok('RLS y FORCE RLS activos', rls === 't|t', `relrowsecurity|relforce=${rls}`);
  const pol = psql(`SELECT count(*) FROM pg_policies
                    WHERE schemaname='public' AND tablename='strava_linking_audit';`);
  ok('cero politicas RLS', pol === '0', `politicas=${pol}`);

  // ── 6 · Append-only y contrato exacto de service_role ───
  // MAINTAIN solo existe desde PostgreSQL 17; en 16 la funcion lanza. Se
  // comprueba solo donde aplica, en vez de fingir que se ha verificado.
  const mayor = Number(psql('SHOW server_version_num;')) >= 170000;
  const PROHIBIDOS = ['UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']
    .concat(mayor ? ['MAINTAIN'] : []);
  for (const priv of PROHIBIDOS) {
    const tiene = psql(`SELECT has_table_privilege('service_role',
                          'public.strava_linking_audit','${priv}');`);
    ok(`service_role NO tiene ${priv}`, tiene === 'f', `${priv}=${tiene}`);
  }
  if (!mayor) {
    console.log('    (MAINTAIN no se comprueba: solo existe desde PostgreSQL 17;'
      + ` este cluster es ${psql('SHOW server_version;')})`);
  }
  // El ACL literal, que es la forma mas dificil de enganar.
  const aclTabla = psql(`SELECT array_to_string(relacl,' ') FROM pg_class
                         WHERE oid='public.strava_linking_audit'::regclass;`);
  ok('el ACL de la tabla concede a service_role exactamente "ar"',
    /service_role=ar\//.test(aclTabla), aclTabla);
  const aclSeq = psql(`SELECT array_to_string(relacl,' ') FROM pg_class
                       WHERE oid='public.strava_linking_audit_id_seq'::regclass;`);
  ok('el ACL de la secuencia no nombra a PUBLIC, anon, authenticated ni service_role',
    !/(^|\s)=|anon=|authenticated=|service_role=/.test(aclSeq), aclSeq);

  // ── 7 · Idempotencia: el UNIQUE de evaluation_key ───────
  const eDup = psql(`SET ROLE service_role;
    INSERT INTO public.strava_linking_audit
      (run_id,user_id,workout_id,mode,decision,reason,matcher_version,matching_basis,evaluation_key)
    VALUES ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002',
            '00000000-0000-4000-8000-000000000004','dry','would_link','would_link',
            'f134.1','distance','k1');`, { expectFail: true });
  ok('una clave de evaluacion repetida es rechazada (23505)',
    /duplicate key|unique/i.test(eDup), eDup.split('\n')[0]);

  // ── 8 · Los CHECK del contrato se aplican de verdad ─────
  const casos = [
    ['mode invalido', `'produccion','would_link','would_link'`],
    ['decision invalida', `'dry','quiza','would_link'`],
    ['reason fuera del enum', `'dry','skipped','porque_si'`],
  ];
  for (const [nombre, vals] of casos) {
    const e = psql(`SET ROLE service_role;
      INSERT INTO public.strava_linking_audit
        (run_id,user_id,workout_id,mode,decision,reason,matcher_version,matching_basis,evaluation_key)
      VALUES ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002',
              '00000000-0000-4000-8000-000000000004',${vals},'f134.1','distance','k-${Math.random()}');`,
      { expectFail: true });
    ok(`CHECK rechaza: ${nombre}`, /violates check constraint/i.test(e), e.split('\n')[0]);
  }

  // ── 9 · El rollback preserva los datos ──────────────────
  const rb = join(DIR, 'rollback.sql');
  writeFileSync(rb, readFileSync(ROLLBACK, 'utf8'));
  chmodSync(rb, 0o644);
  r = sh(`${BIN}/psql -h ${SOCK} -U postgres -d postgres -v ON_ERROR_STOP=1 -f ${rb}`);
  ok('el rollback aplica sin errores', r.status === 0, r.status !== 0 ? r.stderr.trim() : '');
  const trasRollback = psql('SELECT count(*) FROM public.strava_linking_audit;');
  ok('el rollback CONSERVA las filas ya registradas', trasRollback === '1', `filas=${trasRollback}`);
  const insertTrasRollback = psql(`SELECT has_table_privilege('service_role',
                                     'public.strava_linking_audit','INSERT');`);
  ok('el rollback congela la escritura (service_role pierde INSERT)',
    insertTrasRollback === 'f', `INSERT=${insertTrasRollback}`);
  const aclFinal = psql(
    `SELECT array_to_string(relacl,E'\\n') FROM pg_class
      WHERE oid='public.tabla_de_control_id_seq'::regclass;`);
  ok('el rollback tampoco toca la secuencia ajena', aclFinal === aclAntes);
} catch (e) {
  fallos += 1;
  console.log(`\n  ERROR: ${e.message}`);
} finally {
  sh(`${BIN}/pg_ctl -D ${DATA} stop -m immediate`);
  rmSync(DIR, { recursive: true, force: true });
}

console.log(`\n${pasadas} comprobaciones en verde${fallos ? `, ${fallos} EN ROJO` : ''}`);
if (fallos) {
  console.log('\nRESULTADO: la migracion no se comporta como dice comportarse.');
  process.exit(1);
}
console.log('\nRESULTADO: la migracion solo toca su propia tabla y respeta los permisos ajenos.');
