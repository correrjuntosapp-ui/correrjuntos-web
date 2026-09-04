-- ============================================================
-- F146.5A · Corrección de los permisos de la tabla de auditoría de F134
--
-- La migración 20260828120000 se aplicó correctamente pero la tabla NO quedó
-- con el contrato que declara. Se conserva intacta como registro fiel de lo
-- que se ejecutó; esta migración posterior corrige el estado.
--
-- CAUSA. Supabase tiene ALTER DEFAULT PRIVILEGES en el esquema `public` que
-- conceden, sobre CADA objeto nuevo:
--     tablas     → anon, authenticated y service_role reciben arwdDxtm (ALL)
--     secuencias → anon, authenticated y service_role reciben rwU
-- La migración original revocaba a PUBLIC, anon y authenticated —eso funcionó,
-- ningún cliente puede tocar la tabla— pero nunca revocaba nada a
-- service_role, y su `GRANT INSERT, SELECT` solo reafirmaba privilegios que ya
-- estaban concedidos. Resultado en produccion:
--
--     tabla     postgres=arwdDxtm/postgres  service_role=arwdDxtm/postgres
--     secuencia postgres=rwU  anon=rwU  authenticated=rwU  service_role=rwU
--
-- CONSECUENCIA. `service_role` es la clave con la que escribe el webhook, y
-- con UPDATE/DELETE/TRUNCATE podia modificar o borrar filas de auditoria. Eso
-- destruye la propiedad append-only, que es justamente lo que hace que este
-- registro sirva de evidencia. No hubo exposicion de datos en ningun momento:
-- anon y authenticated nunca tuvieron acceso a la tabla.
--
-- POR QUE NO SE DETECTO ANTES. La prueba sobre PostgreSQL efimero creaba los
-- tres roles pero no replicaba los ALTER DEFAULT PRIVILEGES de Supabase, que
-- un cluster virgen no trae. En `tools/test-strava-audit-postgres.mjs` ya se
-- reproducen, y tres mutantes nuevos cubren cada revocacion de este fichero.
--
-- ALCANCE. Solo `public.strava_linking_audit` y la secuencia de identidad de
-- su columna `id`, resuelta en tiempo de ejecucion con pg_get_serial_sequence
-- y verificada antes de tocarla. Nada de ALL TABLES, ALL SEQUENCES,
-- ALL FUNCTIONS ni IN SCHEMA public.
--
-- FUERA DE ALCANCE, ANOTADO COMO RIESGO. Los ALTER DEFAULT PRIVILEGES
-- globales de Supabase siguen como estaban: toda tabla nueva de `public`
-- seguira naciendo con ALL para anon, authenticated y service_role, y toda
-- secuencia nueva con rwU. Esta migracion NO los cambia — corregirlos afecta
-- a todo el esquema y merece una auditoria propia.
-- ============================================================

BEGIN;

-- 1 · Retirar a service_role todo lo que los default privileges le dieron.
REVOKE ALL PRIVILEGES ON TABLE public.strava_linking_audit FROM service_role;

-- 2 · Devolverle exactamente lo que necesita, y nada mas.
GRANT INSERT, SELECT ON TABLE public.strava_linking_audit TO service_role;

-- 3 · La secuencia de identidad no la necesita NADIE de forma directa.
--
--     Se resuelve con pg_get_serial_sequence en vez de escribir el nombre a
--     mano: si algun dia la columna cambiara de secuencia, este bloque falla
--     en vez de revocar sobre un objeto equivocado.
--
--     `id` es GENERATED ALWAYS AS IDENTITY: Postgres avanza la secuencia
--     internamente, sin comprobar privilegios del usuario que inserta. Por eso
--     service_role puede seguir insertando y recibiendo su id despues de esta
--     revocacion. Es distinto de `serial`, donde el DEFAULT nextval() lo
--     ejecuta el cliente y si necesita USAGE.
DO $$
DECLARE
  v_seq text;
BEGIN
  v_seq := pg_get_serial_sequence('public.strava_linking_audit', 'id');

  IF v_seq IS NULL THEN
    RAISE EXCEPTION
      'F146.5A: no se puede resolver la secuencia de identidad de '
      'public.strava_linking_audit.id; se aborta sin tocar permisos';
  END IF;

  IF v_seq <> 'public.strava_linking_audit_id_seq' THEN
    RAISE EXCEPTION
      'F146.5A: la secuencia resuelta (%) no es la esperada '
      '(public.strava_linking_audit_id_seq); se aborta sin tocar permisos', v_seq;
  END IF;

  EXECUTE format(
    'REVOKE ALL PRIVILEGES ON SEQUENCE %s FROM PUBLIC, anon, authenticated, service_role',
    v_seq);
END $$;

COMMIT;

-- ============================================================
-- ESTADO ESPERADO DESPUES DE APLICAR
--
--   tabla     postgres=arwdDxtm/postgres  service_role=ar/postgres
--   secuencia postgres=rwU/postgres
--
--   service_role: INSERT y SELECT = true
--                 UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER = false
--                 (y MAINTAIN = false en PostgreSQL 17+)
--   anon y authenticated: sin privilegios ni en la tabla ni en la secuencia
--   RLS y FORCE RLS activos, cero politicas, restricciones intactas
--
-- ROLLBACK. No se entrega fichero de reversion: deshacer esto significaria
-- devolver a service_role la capacidad de alterar el registro de auditoria,
-- que es exactamente el defecto que se esta corrigiendo. Si hiciera falta por
-- alguna razon operativa, la sentencia seria
--     GRANT ALL ON TABLE public.strava_linking_audit TO service_role;
-- y deberia justificarse por escrito antes de ejecutarla.
-- ============================================================
