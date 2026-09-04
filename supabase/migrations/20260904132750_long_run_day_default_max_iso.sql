-- ============================================================================
-- P0 long_run_day (2/2) · el default debe ser DETERMINISTA
--
-- CORRIGE a 20260904123439_long_run_day_default.sql, que YA ESTA APLICADA en
-- produccion. Aquella migracion no se toca: esta la sustituye por delante.
--
-- EL PROBLEMA DE LA PRIMERA VERSION:
--   Usaba v_chrono[v_num_dias] como default, describiendolo como "el ultimo dia
--   de entrenamiento". Pero v_chrono NO esta ordenado por numero de dia: las RPC
--   lo construyen ordenado por PROXIMIDAD a p_fecha_inicio:
--
--     SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7) INTO v_chrono
--
--   Con los dias por defecto del onboarding [1,3,5], el ultimo elemento depende
--   del dia en que el usuario se registre:
--
--     inicio lunes     -> [1,3,5] -> 5 viernes    (coincide con el cliente)
--     inicio martes    -> [3,5,1] -> 1 LUNES      (no coincide)
--     inicio miercoles -> [3,5,1] -> 1 LUNES      (no coincide)
--     inicio jueves    -> [5,1,3] -> 3 MIERCOLES  (no coincide)
--     inicio viernes   -> [5,1,3] -> 3 MIERCOLES  (no coincide)
--     inicio sabado    -> [1,3,5] -> 5 viernes    (coincide)
--     inicio domingo   -> [1,3,5] -> 5 viernes    (coincide)
--
--   Es decir: en 4 de los 7 dias posibles de alta, el plan quedaba con la tirada
--   larga en un dia distinto al que asigna el cliente corregido (AUTO_LONG_RUN_DAY
--   = ultimo de AUTO_AVAILABLE_DAYS = viernes), y en dos de ellos caia en LUNES,
--   que ademas es la peor colocacion deportiva para una tirada larga.
--
--   El plan se creaba (el P0 quedaba resuelto: nadie se queda sin plan), pero el
--   resultado no era determinista ni coherente con el cliente.
--
-- EL FIX: usar el dia ISO MAYOR de los disponibles, que no depende de la fecha
-- de inicio. Con [1,3,5] da viernes SIEMPRE, en los 7 casos, exactamente igual
-- que AUTO_LONG_RUN_DAY del cliente. Ademas tiende al fin de semana (6 sabado,
-- 7 domingo son los ISO mas altos), que es donde corresponde una tirada larga.
--
-- POR QUE NO SE MODIFICA LA MIGRACION ANTERIOR: ya esta aplicada y registrada en
-- schema_migrations (20260904123439). Reescribirla dejaria el historial mintiendo
-- sobre lo que se ejecuto en produccion.
--
-- COMO SE DETECTO: la regresion original tenia un stub con `ORDER BY d`
-- (numerico) en vez del ORDER BY por proximidad de las RPC reales, asi que daba
-- verde tapando justo este comportamiento. tools/test-long-run-day-weekday-postgres.mjs
-- prueba ahora los 7 dias de inicio con el ORDER BY autentico.
-- ============================================================================

DO $migration$
DECLARE
  v_fn     text;
  v_def    text;
  v_new    text;
  v_hechas int := 0;
BEGIN
  FOREACH v_fn IN ARRAY ARRAY['generate_user_plan_v3', 'generate_user_plan_adaptive_v3'] LOOP

    SELECT pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = v_fn;

    IF v_def IS NULL THEN
      RAISE EXCEPTION 'long_run_day_default_max_iso: no existe public.%', v_fn;
    END IF;

    -- Sustituye la asignacion dependiente del orden cronologico por el maximo
    -- ISO, y actualiza el comentario que la describia mal.
    v_new := replace(
      v_def,
      '      -- dia de entrenamiento en orden cronologico. Mismo dia que elige' || E'\n'
      || '      -- el cliente corregido (AUTO_LONG_RUN_DAY).' || E'\n'
      || '      p_long_run_day := v_chrono[v_num_dias];',
      '      -- dia ISO MAS ALTO de los elegidos: no depende de p_fecha_inicio y' || E'\n'
      || '      -- coincide siempre con AUTO_LONG_RUN_DAY del cliente corregido.' || E'\n'
      || '      -- (v_chrono va ordenado por proximidad al inicio, no por numero,' || E'\n'
      || '      -- asi que su ultimo elemento variaba segun el dia de alta.)' || E'\n'
      || '      p_long_run_day := (SELECT max(d) FROM unnest(v_chrono) AS d);'
    );

    -- Guarda 1: el patron tenia que estar (la migracion anterior aplicada).
    IF v_new = v_def THEN
      RAISE EXCEPTION 'long_run_day_default_max_iso: patron no encontrado en % (ya migrada, o falta aplicar 20260904123439)', v_fn;
    END IF;

    -- Guarda 2: no puede quedar la asignacion dependiente del orden.
    IF position('v_chrono[v_num_dias]' IN v_new) > 0 THEN
      RAISE EXCEPTION 'long_run_day_default_max_iso: queda un v_chrono[v_num_dias] en %', v_fn;
    END IF;

    -- Guarda 3: tiene que existir exactamente una asignacion nueva.
    IF (SELECT count(*) FROM regexp_matches(v_new, 'p_long_run_day := \(SELECT max\(d\)', 'g')) <> 1 THEN
      RAISE EXCEPTION 'long_run_day_default_max_iso: esperaba 1 asignacion max() en %', v_fn;
    END IF;

    -- Guarda 4: las validaciones del dia explicito siguen intactas.
    IF position('long_run_day_invalid' IN v_new) = 0
       OR position('long_run_day_not_selected' IN v_new) = 0
       OR position('long_run_day_required' IN v_new) > 0 THEN
      RAISE EXCEPTION 'long_run_day_default_max_iso: contrato de validaciones roto en %', v_fn;
    END IF;

    EXECUTE v_new;
    v_hechas := v_hechas + 1;
    RAISE NOTICE 'long_run_day_default_max_iso: %() actualizada', v_fn;
  END LOOP;

  IF v_hechas <> 2 THEN
    RAISE EXCEPTION 'long_run_day_default_max_iso: esperaba 2 funciones, aplique %', v_hechas;
  END IF;
END
$migration$;
