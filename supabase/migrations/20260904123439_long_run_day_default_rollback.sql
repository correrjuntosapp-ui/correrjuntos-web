-- ============================================================================
-- ROLLBACK de 20260904123439_long_run_day_default.sql
--
-- Copia LITERAL de las definiciones que tenian las dos funciones en produccion
-- inmediatamente ANTES de aplicar el default de long_run_day (4 sep 2026).
-- Aplicar este fichero devuelve el comportamiento anterior: p_long_run_day
-- NULL sobre una plantilla con long_run vuelve a lanzar `long_run_day_required`
-- (es decir, vuelve a fallar la creacion de plan desde el onboarding con
-- bundle embebido antiguo).
--
-- Fidelidad verificada por md5 contra pg_get_functiondef en el momento de la
-- extraccion:
--   generate_user_plan_v3           md5 232a2f3d0171270e17abec0f0e5a9c29  6373 bytes
--   generate_user_plan_adaptive_v3  md5 22d9448f49017e99580872e87928ad41  8801 bytes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_user_plan_v3(p_user_id uuid, p_template_slug text, p_ritmo_base numeric, p_ritmo_origen text, p_dias_disponibles jsonb, p_fecha_inicio date, p_fecha_carrera date, p_race_id text, p_race_nombre text, p_race_ciudad text, p_race_imagen_url text, p_race_distancia_principal text, p_race_hora time without time zone, p_long_run_day integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan_id UUID;
  v_template plan_templates%ROWTYPE;
  v_fecha_fin DATE;
  v_fecha_semana DATE;
  v_ritmo NUMERIC;
  v_offset INT;
  v_num_dias INT;
  v_week RECORD;
  v_iso_start INT;
  v_chrono INT[];
  v_dias_norm JSONB;
  v_lrd INT;
  v_template_has_long_run BOOLEAN;
  v_kept UUID[];
  v_assign RECORD;
  v_w plan_template_workouts%ROWTYPE;
BEGIN
  -- [Endurecimiento 18 jul 2026] Autorización de identidad obligatoria:
  -- solo el propio usuario autenticado puede generarse un plan. Sin sesión
  -- → authentication_required; UUID ajeno → user_mismatch. Sin bypass para
  -- service_role (sin necesidad operativa server-side documentada).
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'user_mismatch';
  END IF;

  SELECT * INTO v_template FROM plan_templates WHERE slug = p_template_slug AND activo = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Template not found: %', p_template_slug; END IF;

  IF EXISTS (SELECT 1 FROM user_plans WHERE user_id = p_user_id AND estado = 'active') THEN
    RAISE EXCEPTION 'User already has an active plan';
  END IF;

  IF jsonb_array_length(p_dias_disponibles) < 1 THEN
    RAISE EXCEPTION 'p_dias_disponibles must contain at least one day';
  END IF;

  v_iso_start := EXTRACT(ISODOW FROM p_fecha_inicio)::int;
  SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
    INTO v_chrono
    FROM (SELECT DISTINCT (p_dias_disponibles->>i)::int AS d
          FROM generate_series(0, jsonb_array_length(p_dias_disponibles) - 1) AS i) s;
  IF EXISTS (SELECT 1 FROM unnest(v_chrono) AS d WHERE d IS NULL OR d < 1 OR d > 7) THEN
    RAISE EXCEPTION 'dias_disponibles_invalid: each day must be an integer 1..7';
  END IF;
  v_num_dias := array_length(v_chrono, 1);
  SELECT jsonb_agg(d ORDER BY d) INTO v_dias_norm FROM unnest(v_chrono) AS d;

  -- [v3] CONTRATO tirada larga — SIN filtro de días: si la plantilla tiene
  -- CUALQUIER long_run, p_long_run_day es obligatorio y válido.
  SELECT EXISTS (
    SELECT 1 FROM plan_template_workouts w
    JOIN plan_template_weeks wk ON wk.id = w.week_id
    WHERE wk.template_id = v_template.id AND w.tipo = 'long_run'
  ) INTO v_template_has_long_run;

  IF v_template_has_long_run THEN
    IF p_long_run_day IS NULL THEN
      RAISE EXCEPTION 'long_run_day_required: template % has long_run sessions but p_long_run_day is NULL', p_template_slug;
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

  v_fecha_fin := COALESCE(p_fecha_carrera, p_fecha_inicio + (v_template.duracion_semanas * 7));

  INSERT INTO user_plans (
    user_id, template_id, nombre, objetivo, nivel,
    ritmo_base, ritmo_origen, dias_disponibles,
    fecha_inicio, fecha_fin, fecha_carrera,
    race_id, race_nombre, race_ciudad, race_imagen_url, race_distancia_principal, race_hora
  ) VALUES (
    p_user_id, v_template.id, v_template.nombre, v_template.objetivo, v_template.nivel,
    p_ritmo_base, p_ritmo_origen, v_dias_norm,
    p_fecha_inicio, v_fecha_fin, p_fecha_carrera,
    p_race_id, p_race_nombre, p_race_ciudad, p_race_imagen_url, p_race_distancia_principal, p_race_hora
  ) RETURNING id INTO v_plan_id;

  FOR v_week IN SELECT * FROM plan_template_weeks WHERE template_id = v_template.id ORDER BY semana_numero LOOP
    v_fecha_semana := p_fecha_inicio + ((v_week.semana_numero - 1) * 7);
    v_kept := public._plan_v3_select_week_sessions(v_week.id, v_num_dias);

    FOR v_assign IN SELECT * FROM public._plan_v3_assign_days(v_kept, v_chrono, v_lrd, v_iso_start) LOOP
      SELECT * INTO v_w FROM plan_template_workouts WHERE id = v_assign.workout_id;

      v_ritmo := NULL;
      IF v_w.zona_ritmo IS NOT NULL THEN
        SELECT offset_seconds INTO v_offset FROM plan_pace_zones
        WHERE template_id = v_template.id AND zona = v_w.zona_ritmo;
        IF FOUND THEN v_ritmo := p_ritmo_base + (v_offset::NUMERIC / 60.0); END IF;
      END IF;

      INSERT INTO user_workouts (
        plan_id, user_id, template_workout_id, fecha,
        semana_numero, dia_orden, tipo,
        titulo, titulo_en, descripcion, descripcion_en,
        distancia_target_km, duracion_target_min, zona_ritmo, ritmo_target, estado
      ) VALUES (
        v_plan_id, p_user_id, v_w.id,
        v_fecha_semana + (((v_assign.dia_iso - v_iso_start) % 7 + 7) % 7),
        v_week.semana_numero, v_w.dia_orden, v_w.tipo,
        v_w.titulo, v_w.titulo_en, v_w.descripcion, v_w.descripcion_en,
        v_w.distancia_km, v_w.duracion_min, v_w.zona_ritmo, v_ritmo, 'pending'
      );
    END LOOP;
  END LOOP;

  IF p_fecha_carrera IS NOT NULL THEN
    INSERT INTO user_workouts (
      plan_id, user_id, fecha, semana_numero, dia_orden, tipo,
      titulo, titulo_en, descripcion, descripcion_en, distancia_target_km, estado
    ) VALUES (
      v_plan_id, p_user_id, p_fecha_carrera,
      v_template.duracion_semanas, 99, 'race_day',
      COALESCE(p_race_nombre, 'Día de carrera'), COALESCE(p_race_nombre, 'Race day'),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CASE p_race_distancia_principal
        WHEN '5K' THEN 5 WHEN '10K' THEN 10 WHEN '21K' THEN 21.0975 WHEN '42K' THEN 42.195
        ELSE NULL END,
      'pending'
    );
  END IF;

  RETURN v_plan_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_user_plan_adaptive_v3(p_user_id uuid, p_distancia text, p_fecha_inicio date, p_fecha_carrera date, p_ritmo_base numeric, p_ritmo_origen text, p_dias_disponibles jsonb, p_force boolean, p_race_id text, p_race_nombre text, p_race_ciudad text, p_race_imagen_url text, p_race_distancia_principal text, p_race_hora time without time zone, p_long_run_day integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan_id UUID;
  v_validation JSON;
  v_bounds plan_distance_bounds%ROWTYPE;
  v_template plan_templates%ROWTYPE;
  v_action TEXT;
  v_extra_count INT := 0;
  v_skip_count INT := 0;
  v_first_base_week_id UUID;
  v_target_week_num INT;
  v_extra_idx INT;
  v_fecha_semana DATE;
  v_ritmo NUMERIC;
  v_offset INT;
  v_num_dias INT;
  v_week RECORD;
  v_iso_start INT;
  v_chrono INT[];
  v_dias_norm JSONB;
  v_lrd INT;
  v_template_has_long_run BOOLEAN;
  v_kept UUID[];
  v_assign RECORD;
  v_w plan_template_workouts%ROWTYPE;
BEGIN
  -- [Endurecimiento 18 jul 2026] Autorización de identidad obligatoria
  -- (ver generate_user_plan_v3): authentication_required / user_mismatch.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'user_mismatch';
  END IF;

  v_validation := public.validate_plan_feasibility_v2(p_distancia, p_fecha_inicio, p_fecha_carrera, p_force);
  IF (v_validation->>'feasible')::BOOLEAN = false THEN
    RAISE EXCEPTION 'Plan not feasible: %', v_validation->>'message';
  END IF;

  v_action := v_validation->>'action';
  IF v_action = 'compress_base' THEN
    v_skip_count := (v_validation->>'extra_or_compress')::INT;
  ELSIF v_action = 'extend_base' THEN
    v_extra_count := (v_validation->>'extra_or_compress')::INT;
  END IF;

  SELECT * INTO v_bounds FROM plan_distance_bounds WHERE distancia = p_distancia;
  SELECT * INTO v_template FROM plan_templates WHERE slug = v_bounds.template_slug AND activo = true;

  IF EXISTS (SELECT 1 FROM user_plans WHERE user_id = p_user_id AND estado = 'active') THEN
    RAISE EXCEPTION 'User already has an active plan';
  END IF;

  IF jsonb_array_length(p_dias_disponibles) < 1 THEN
    RAISE EXCEPTION 'p_dias_disponibles must contain at least one day';
  END IF;

  v_iso_start := EXTRACT(ISODOW FROM p_fecha_inicio)::int;
  SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
    INTO v_chrono
    FROM (SELECT DISTINCT (p_dias_disponibles->>i)::int AS d
          FROM generate_series(0, jsonb_array_length(p_dias_disponibles) - 1) AS i) s;
  IF EXISTS (SELECT 1 FROM unnest(v_chrono) AS d WHERE d IS NULL OR d < 1 OR d > 7) THEN
    RAISE EXCEPTION 'dias_disponibles_invalid: each day must be an integer 1..7';
  END IF;
  v_num_dias := array_length(v_chrono, 1);
  SELECT jsonb_agg(d ORDER BY d) INTO v_dias_norm FROM unnest(v_chrono) AS d;

  -- [v3] CONTRATO tirada larga — sin filtro de días (ver generate_user_plan_v3)
  SELECT EXISTS (
    SELECT 1 FROM plan_template_workouts w
    JOIN plan_template_weeks wk ON wk.id = w.week_id
    WHERE wk.template_id = v_template.id AND w.tipo = 'long_run'
  ) INTO v_template_has_long_run;

  IF v_template_has_long_run THEN
    IF p_long_run_day IS NULL THEN
      RAISE EXCEPTION 'long_run_day_required: distancia % has long_run sessions but p_long_run_day is NULL', p_distancia;
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

  INSERT INTO user_plans (
    user_id, template_id, nombre, objetivo, nivel,
    ritmo_base, ritmo_origen, dias_disponibles,
    fecha_inicio, fecha_fin, fecha_carrera,
    race_id, race_nombre, race_ciudad, race_imagen_url, race_distancia_principal, race_hora
  ) VALUES (
    p_user_id, v_template.id, v_template.nombre, v_template.objetivo, v_template.nivel,
    p_ritmo_base, p_ritmo_origen, v_dias_norm,
    p_fecha_inicio, p_fecha_carrera, p_fecha_carrera,
    p_race_id, p_race_nombre, p_race_ciudad, p_race_imagen_url, p_race_distancia_principal, p_race_hora
  ) RETURNING id INTO v_plan_id;

  v_target_week_num := 1;

  -- 5a. Semanas extra (extend_base): clona la semana 1 canónica
  IF v_extra_count > 0 THEN
    SELECT id INTO v_first_base_week_id FROM plan_template_weeks
    WHERE template_id = v_template.id ORDER BY semana_numero LIMIT 1;

    FOR v_extra_idx IN 1..v_extra_count LOOP
      v_fecha_semana := p_fecha_inicio + ((v_target_week_num - 1) * 7);
      v_kept := public._plan_v3_select_week_sessions(v_first_base_week_id, v_num_dias);
      FOR v_assign IN SELECT * FROM public._plan_v3_assign_days(v_kept, v_chrono, v_lrd, v_iso_start) LOOP
        SELECT * INTO v_w FROM plan_template_workouts WHERE id = v_assign.workout_id;
        v_ritmo := NULL;
        IF v_w.zona_ritmo IS NOT NULL THEN
          SELECT offset_seconds INTO v_offset FROM plan_pace_zones
          WHERE template_id = v_template.id AND zona = v_w.zona_ritmo;
          IF FOUND THEN v_ritmo := p_ritmo_base + (v_offset::NUMERIC / 60.0); END IF;
        END IF;
        INSERT INTO user_workouts (
          plan_id, user_id, template_workout_id, fecha, semana_numero, dia_orden, tipo,
          titulo, titulo_en, descripcion, descripcion_en,
          distancia_target_km, duracion_target_min, zona_ritmo, ritmo_target, estado
        ) VALUES (
          v_plan_id, p_user_id, v_w.id,
          v_fecha_semana + (((v_assign.dia_iso - v_iso_start) % 7 + 7) % 7),
          v_target_week_num, v_w.dia_orden, v_w.tipo,
          v_w.titulo, v_w.titulo_en, v_w.descripcion, v_w.descripcion_en,
          v_w.distancia_km, v_w.duracion_min, v_w.zona_ritmo, v_ritmo, 'pending'
        );
      END LOOP;
      v_target_week_num := v_target_week_num + 1;
    END LOOP;
  END IF;

  -- 5b. Semanas canónicas. [v3] Al comprimir se conserva SIEMPRE la S1
  -- (adaptación) y el salto se aplica desde la semana 2 (recorte de
  -- 2..skip+1). El taper queda conservado por construcción.
  FOR v_week IN
    SELECT * FROM plan_template_weeks
    WHERE template_id = v_template.id
      AND (v_skip_count = 0
           OR semana_numero = 1
           OR semana_numero > 1 + v_skip_count)
    ORDER BY semana_numero
  LOOP
    v_fecha_semana := p_fecha_inicio + ((v_target_week_num - 1) * 7);
    v_kept := public._plan_v3_select_week_sessions(v_week.id, v_num_dias);
    FOR v_assign IN SELECT * FROM public._plan_v3_assign_days(v_kept, v_chrono, v_lrd, v_iso_start) LOOP
      SELECT * INTO v_w FROM plan_template_workouts WHERE id = v_assign.workout_id;
      v_ritmo := NULL;
      IF v_w.zona_ritmo IS NOT NULL THEN
        SELECT offset_seconds INTO v_offset FROM plan_pace_zones
        WHERE template_id = v_template.id AND zona = v_w.zona_ritmo;
        IF FOUND THEN v_ritmo := p_ritmo_base + (v_offset::NUMERIC / 60.0); END IF;
      END IF;
      INSERT INTO user_workouts (
        plan_id, user_id, template_workout_id, fecha, semana_numero, dia_orden, tipo,
        titulo, titulo_en, descripcion, descripcion_en,
        distancia_target_km, duracion_target_min, zona_ritmo, ritmo_target, estado
      ) VALUES (
        v_plan_id, p_user_id, v_w.id,
        v_fecha_semana + (((v_assign.dia_iso - v_iso_start) % 7 + 7) % 7),
        v_target_week_num, v_w.dia_orden, v_w.tipo,
        v_w.titulo, v_w.titulo_en, v_w.descripcion, v_w.descripcion_en,
        v_w.distancia_km, v_w.duracion_min, v_w.zona_ritmo, v_ritmo, 'pending'
      );
    END LOOP;
    v_target_week_num := v_target_week_num + 1;
  END LOOP;

  IF p_fecha_carrera IS NOT NULL THEN
    INSERT INTO user_workouts (
      plan_id, user_id, fecha, semana_numero, dia_orden, tipo,
      titulo, titulo_en, descripcion, descripcion_en, distancia_target_km, estado
    ) VALUES (
      v_plan_id, p_user_id, p_fecha_carrera,
      v_target_week_num - 1, 99, 'race_day',
      COALESCE(p_race_nombre, 'Día de carrera'), COALESCE(p_race_nombre, 'Race day'),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CASE p_race_distancia_principal
        WHEN '5K' THEN 5 WHEN '10K' THEN 10 WHEN '21K' THEN 21.0975 WHEN '42K' THEN 42.195
        ELSE NULL END,
      'pending'
    );
  END IF;

  RETURN v_plan_id;
END;
$function$
;
