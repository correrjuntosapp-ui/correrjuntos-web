-- ============================================================================
-- P0 · long_run_day_required — default seguro en vez de excepción
--
-- PROBLEMA (demostrado con analytics_events el 31 ago 2026):
--   55 eventos `plan_creation_failed` con error `long_run_day_required`,
--   43 usuarios afectados, 29 de ellos NUNCA llegaron a tener un plan.
--   El 100 % de esos eventos llevan el payload ANTERIOR al fix de cliente F137
--   (commit 87e0625, 16 ago): ninguno salió del bundle corregido. Motivo: el
--   onboarding crea el plan en la PRIMERA apertura, cuando la app corre por
--   fuerza el bundle EMBEBIDO del binario (app.json no define
--   fallbackToCacheTimeout → Expo usa 0 ms y aplica la OTA en el siguiente
--   arranque). Un fix de cliente NO puede alcanzar ese momento por OTA; sólo
--   un fix server-side llega a los binarios ya instalados.
--
-- FIX MÍNIMO (una línea por función):
--   Si la plantilla tiene sesiones `long_run` y p_long_run_day llega NULL, en
--   vez de abortar se asigna el ÚLTIMO día de la semana de entrenamiento en
--   orden cronológico: v_chrono[v_num_dias]. Con los días por defecto del
--   onboarding [1,3,5] da viernes = exactamente AUTO_LONG_RUN_DAY del cliente
--   corregido, así que cliente viejo y cliente nuevo producen el MISMO plan.
--   El usuario puede reasignar sus días después desde PlanScreen.
--
-- POR QUÉ ES SEGURO:
--   · El default sale de v_chrono, que ya se validó (1..7, sin nulos) y que
--     por definición son los días elegidos → las dos validaciones siguientes
--     (rango y pertenencia) lo aceptan por construcción.
--   · Plantillas SIN long_run (empezar-0-5k, empieza-a-moverte): el cambio vive
--     dentro de `IF v_template_has_long_run THEN`, que para ellas es FALSE →
--     rama inalcanzable, comportamiento idéntico.
--   · Llamadas con día explícito: intactas. Siguen lanzando
--     `long_run_day_invalid` (fuera de 1..7) y `long_run_day_not_selected`
--     (día que no está entre los elegidos).
--
-- MÉTODO: sustitución dirigida sobre la definición viva, para no reescribir el
-- cuerpo completo de dos funciones grandes (6,4 KB y 8,8 KB) ni arriesgar
-- divergencias. Si el patrón no aparece, la migración FALLA en vez de aplicar
-- un cambio parcial. Verificado por simulación (regexp_replace en SELECT, sin
-- EXECUTE) antes de escribirse: delta de 79 y 76 bytes, una línea sustituida.
-- ============================================================================

DO $migration$
DECLARE
  v_fn       text;
  v_def      text;
  v_new      text;
  v_hechas   int := 0;
BEGIN
  FOREACH v_fn IN ARRAY ARRAY['generate_user_plan_v3', 'generate_user_plan_adaptive_v3'] LOOP

    SELECT pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = v_fn;

    IF v_def IS NULL THEN
      RAISE EXCEPTION 'long_run_day_default: no existe public.%', v_fn;
    END IF;

    v_new := regexp_replace(
      v_def,
      -- OJO con el escapado: dentro de una E-string, \s se come el backslash y
      -- \n se convierte en un salto REAL. El patron necesita \\s y \\n para que
      -- lleguen al motor de regexp como tales. (Una version anterior de esta
      -- migracion tenia un solo backslash: buscaba literalmente "THENs*" y no
      -- casaba nunca. Lo cazo tools/test-long-run-day-postgres.mjs.)
      E'IF p_long_run_day IS NULL THEN\\s*\\n\\s*RAISE EXCEPTION ''long_run_day_required:[^;]*;',
      E'IF p_long_run_day IS NULL THEN\n'
      || E'      -- [P0 4 sep 2026] Cliente que no envia el dia (bundle embebido\n'
      || E'      -- anterior a F137, inalcanzable por OTA). Default seguro: ultimo\n'
      || E'      -- dia de entrenamiento en orden cronologico. Mismo dia que elige\n'
      || E'      -- el cliente corregido (AUTO_LONG_RUN_DAY).\n'
      || E'      p_long_run_day := v_chrono[v_num_dias];',
      'g'
    );

    -- Guarda 1: el patrón tenía que estar.
    IF v_new = v_def THEN
      RAISE EXCEPTION 'long_run_day_default: patron no encontrado en % (ya migrada o cuerpo cambiado)', v_fn;
    END IF;

    -- Guarda 2: el RAISE de long_run_day_required debe desaparecer del todo.
    IF position('long_run_day_required' IN v_new) > 0 THEN
      RAISE EXCEPTION 'long_run_day_default: queda un long_run_day_required en %', v_fn;
    END IF;

    -- Guarda 3: las otras dos validaciones NO se tocan.
    IF position('long_run_day_invalid' IN v_new) = 0
       OR position('long_run_day_not_selected' IN v_new) = 0 THEN
      RAISE EXCEPTION 'long_run_day_default: se perdio una validacion en %', v_fn;
    END IF;

    EXECUTE v_new;
    v_hechas := v_hechas + 1;
    RAISE NOTICE 'long_run_day_default: %() actualizada', v_fn;
  END LOOP;

  IF v_hechas <> 2 THEN
    RAISE EXCEPTION 'long_run_day_default: esperaba 2 funciones, aplique %', v_hechas;
  END IF;
END
$migration$;
