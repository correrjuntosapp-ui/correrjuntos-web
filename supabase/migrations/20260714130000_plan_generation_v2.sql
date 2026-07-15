-- ============================================================================
-- 20260714130000_plan_generation_v2 — corrección de días/fechas de las sesiones
-- ============================================================================
-- [14 jul 2026] Funciones VERSIONADAS. Las v1 (generate_user_plan /
-- generate_user_plan_adaptive) quedan INTACTAS. Estas v2 se construyen a partir
-- de las definiciones REALES desplegadas en producción (recuperadas por
-- introspección de solo lectura: pg_get_functiondef de los OID 108970 y 108973),
-- NO de los ficheros desfasados 51/56 del repo.
--
-- Cambios respecto a v1 (y SOLO estos):
--   1. Día real correcto: la fecha de cada sesión se ancla al DÍA ISO de la
--      semana mediante ISODOW, no con el offset ciego (fecha_inicio + dia_real-1)
--      que sólo acertaba si fecha_inicio era lunes.
--   2. Asignación sesión↔fecha cronológica: las sesiones NO-larga de la plantilla
--      (en su orden pedagógico dia_orden) se reparten sobre las fechas de la
--      semana ordenadas ASC. dia_orden se CONSERVA (identidad de plantilla).
--   3. Tirada larga por día elegido: el workout tipo='long_run' se ancla al
--      p_long_run_day (nuevo parámetro). Si la semana no tiene long_run, o
--      p_long_run_day es NULL / no está en dias_disponibles → todo cronológico.
--
-- Convención de días: ISO 1=Lun … 7=Dom (igual que el cliente y user_plans).
-- dias_disponibles sigue siendo SOLO el conjunto de días (array de enteros ISO);
-- no transporta semántica de posición. race_day conserva dia_orden = 99.
--
-- NO se despliega desde aquí. Preparada para autorización de despliegue posterior.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- generate_user_plan_v2  (base: OID 108970, firma desplegada de 13 args)
-- ─────────────────────────────────────────────────────────────
-- Firmas SIN DEFAULT (decisión 14 jul): el cliente pasa SIEMPRE todos los
-- argumentos con nombre (supabase.rpc los envía explícitos, null incluido).
-- Evita ambigüedad de resolución de overloads y hace la intención explícita.
CREATE OR REPLACE FUNCTION public.generate_user_plan_v2(
  p_user_id uuid,
  p_template_slug text,
  p_ritmo_base numeric,
  p_ritmo_origen text,
  p_dias_disponibles jsonb,
  p_fecha_inicio date,
  p_fecha_carrera date,
  p_race_id text,
  p_race_nombre text,
  p_race_ciudad text,
  p_race_imagen_url text,
  p_race_distancia_principal text,
  p_race_hora time without time zone,
  p_long_run_day integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_plan_id UUID;
  v_template plan_templates%ROWTYPE;
  v_fecha_inicio DATE := p_fecha_inicio;
  v_fecha_fin DATE;
  v_fecha_semana DATE;
  v_fecha_workout DATE;
  v_ritmo NUMERIC;
  v_offset INT;
  v_num_dias INT;
  v_workout RECORD;
  v_week RECORD;
  -- [v2] aritmética de días ISO + asignación cronológica
  v_iso_start INT;
  v_chrono INT[];
  v_dias_norm JSONB;
  v_lrd INT;
  v_has_long BOOLEAN;
  v_nonlong INT[];
  v_nl_idx INT;
  v_dia_iso INT;
  v_template_has_long_run BOOLEAN;
BEGIN
  SELECT * INTO v_template FROM plan_templates WHERE slug = p_template_slug AND activo = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Template not found: %', p_template_slug; END IF;

  IF EXISTS (SELECT 1 FROM user_plans WHERE user_id = p_user_id AND estado = 'active') THEN
    RAISE EXCEPTION 'User already has an active plan';
  END IF;

  IF jsonb_array_length(p_dias_disponibles) < 1 THEN
    RAISE EXCEPTION 'p_dias_disponibles must contain at least one day';
  END IF;

  -- [v2 · Normalización determinista] dedupe + validación de rango. El orden
  -- del JSONB de entrada NO transporta semántica: [1,3,5] ≡ [5,1,3] ≡ [3,5,1].
  -- v_chrono = días únicos ordenados cronológicamente dentro de la ventana
  -- (constante en todas las semanas: cada ventana empieza el mismo weekday).
  v_iso_start := EXTRACT(ISODOW FROM p_fecha_inicio)::int;
  SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
    INTO v_chrono
    FROM (
      SELECT DISTINCT (p_dias_disponibles->>i)::int AS d
      FROM generate_series(0, jsonb_array_length(p_dias_disponibles) - 1) AS i
    ) s;
  IF EXISTS (SELECT 1 FROM unnest(v_chrono) AS d WHERE d IS NULL OR d < 1 OR d > 7) THEN
    RAISE EXCEPTION 'dias_disponibles_invalid: each day must be an integer 1..7';
  END IF;
  v_num_dias := array_length(v_chrono, 1);
  -- Forma canónica almacenada: array único ascendente (sólo conjunto de días).
  SELECT jsonb_agg(d ORDER BY d) INTO v_dias_norm FROM unnest(v_chrono) AS d;

  -- [v2 · CONTRATO tirada larga] Si la plantilla GENERA sesiones long_run
  -- (dado el nº de días elegidos), p_long_run_day es OBLIGATORIO, 1..7 y debe
  -- pertenecer a dias_disponibles. Toda esta validación ocurre ANTES del primer
  -- INSERT (ni user_plans ni user_workouts se han tocado todavía). Nunca se
  -- asigna la larga a un slot cronológico "por defecto" cuando falta el dato.
  SELECT EXISTS (
    SELECT 1 FROM plan_template_workouts w
    JOIN plan_template_weeks wk ON wk.id = w.week_id
    WHERE wk.template_id = v_template.id AND w.tipo = 'long_run'
      AND w.dia_orden <= v_num_dias AND (NOT w.es_opcional OR v_num_dias >= 5)
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
    v_lrd := NULL;  -- plantilla SIN long_run: se ignora p_long_run_day; nunca se inventa una larga
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
    v_fecha_inicio, v_fecha_fin, p_fecha_carrera,
    p_race_id, p_race_nombre, p_race_ciudad, p_race_imagen_url, p_race_distancia_principal, p_race_hora
  ) RETURNING id INTO v_plan_id;

  FOR v_week IN SELECT * FROM plan_template_weeks WHERE template_id = v_template.id ORDER BY semana_numero LOOP
    v_fecha_semana := v_fecha_inicio + ((v_week.semana_numero - 1) * 7);

    -- [v2] ¿esta semana usa una sesión long_run? + días no-larga en orden cronológico
    v_has_long := EXISTS (
      SELECT 1 FROM plan_template_workouts w
      WHERE w.week_id = v_week.id AND w.tipo = 'long_run'
        AND w.dia_orden <= v_num_dias AND (NOT w.es_opcional OR v_num_dias >= 5)
    );
    IF v_has_long AND v_lrd IS NOT NULL THEN
      SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
        INTO v_nonlong FROM unnest(v_chrono) AS d WHERE d <> v_lrd;
    ELSE
      v_nonlong := v_chrono;
    END IF;
    v_nl_idx := 1;

    FOR v_workout IN
      SELECT * FROM plan_template_workouts
      WHERE week_id = v_week.id AND (NOT es_opcional OR v_num_dias >= 5)
      ORDER BY dia_orden
    LOOP
      IF v_workout.dia_orden > v_num_dias THEN CONTINUE; END IF;

      IF v_workout.tipo = 'long_run' AND v_has_long AND v_lrd IS NOT NULL THEN
        v_dia_iso := v_lrd;
      ELSE
        v_dia_iso := v_nonlong[v_nl_idx];
        v_nl_idx := v_nl_idx + 1;
      END IF;
      v_fecha_workout := v_fecha_semana + (((v_dia_iso - v_iso_start) % 7 + 7) % 7);

      v_ritmo := NULL;
      IF v_workout.zona_ritmo IS NOT NULL THEN
        SELECT offset_seconds INTO v_offset FROM plan_pace_zones
        WHERE template_id = v_template.id AND zona = v_workout.zona_ritmo;
        IF FOUND THEN v_ritmo := p_ritmo_base + (v_offset::NUMERIC / 60.0); END IF;
      END IF;

      INSERT INTO user_workouts (
        plan_id, user_id, template_workout_id, fecha,
        semana_numero, dia_orden, tipo,
        titulo, titulo_en, descripcion, descripcion_en,
        distancia_target_km, duracion_target_min, zona_ritmo, ritmo_target, estado
      ) VALUES (
        v_plan_id, p_user_id, v_workout.id, v_fecha_workout,
        v_week.semana_numero, v_workout.dia_orden, v_workout.tipo,   -- dia_orden CONSERVADO
        v_workout.titulo, v_workout.titulo_en,
        v_workout.descripcion, v_workout.descripcion_en,
        v_workout.distancia_km, v_workout.duracion_min, v_workout.zona_ritmo, v_ritmo,
        'pending'
      );
    END LOOP;
  END LOOP;

  -- 🏁 RACE DAY workout (banner hero V3 en PlanScreen) — dia_orden 99 conservado
  IF p_fecha_carrera IS NOT NULL THEN
    INSERT INTO user_workouts (
      plan_id, user_id, fecha,
      semana_numero, dia_orden, tipo,
      titulo, titulo_en, descripcion, descripcion_en,
      distancia_target_km, estado
    ) VALUES (
      v_plan_id, p_user_id, p_fecha_carrera,
      v_template.duracion_semanas, 99, 'race_day',
      COALESCE(p_race_nombre, 'Día de carrera'),
      COALESCE(p_race_nombre, 'Race day'),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CASE p_race_distancia_principal
        WHEN '5K' THEN 5 WHEN '10K' THEN 10 WHEN '21K' THEN 21.0975 WHEN '42K' THEN 42.195
        WHEN 'Trail' THEN NULL ELSE NULL END,
      'pending'
    );
  END IF;

  RETURN v_plan_id;
END;
$function$;

-- ─────────────────────────────────────────────────────────────
-- generate_user_plan_adaptive_v2 (base: OID 108973, overload de 14 args con p_force)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_user_plan_adaptive_v2(
  p_user_id uuid,
  p_distancia text,
  p_fecha_inicio date,
  p_fecha_carrera date,
  p_ritmo_base numeric,
  p_ritmo_origen text,
  p_dias_disponibles jsonb,
  p_force boolean,
  p_race_id text,
  p_race_nombre text,
  p_race_ciudad text,
  p_race_imagen_url text,
  p_race_distancia_principal text,
  p_race_hora time without time zone,
  p_long_run_day integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_plan_id UUID;
  v_validation JSON;
  v_bounds plan_distance_bounds%ROWTYPE;
  v_template plan_templates%ROWTYPE;
  v_action TEXT;
  v_extra_count INT := 0;
  v_skip_count INT := 0;
  v_plan_weeks INT;
  v_first_base_week_id UUID;
  v_target_week_num INT;
  v_extra_idx INT;
  v_fecha_semana DATE;
  v_fecha_workout DATE;
  v_ritmo NUMERIC;
  v_offset INT;
  v_num_dias INT;
  v_workout RECORD;
  v_week RECORD;
  -- [v2] aritmética de días ISO + asignación cronológica
  v_iso_start INT;
  v_chrono INT[];
  v_dias_norm JSONB;
  v_lrd INT;
  v_has_long BOOLEAN;
  v_nonlong INT[];
  v_nl_idx INT;
  v_dia_iso INT;
  v_template_has_long_run BOOLEAN;
BEGIN
  v_validation := validate_plan_feasibility(p_distancia, p_fecha_inicio, p_fecha_carrera, p_force);
  IF (v_validation->>'feasible')::BOOLEAN = false THEN
    RAISE EXCEPTION 'Plan not feasible: %', v_validation->>'message';
  END IF;

  v_action     := v_validation->>'action';
  v_plan_weeks := (v_validation->>'plan_weeks')::INT;

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

  -- [v2 · Normalización determinista] Ver nota en generate_user_plan_v2.
  v_iso_start := EXTRACT(ISODOW FROM p_fecha_inicio)::int;
  SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
    INTO v_chrono
    FROM (
      SELECT DISTINCT (p_dias_disponibles->>i)::int AS d
      FROM generate_series(0, jsonb_array_length(p_dias_disponibles) - 1) AS i
    ) s;
  IF EXISTS (SELECT 1 FROM unnest(v_chrono) AS d WHERE d IS NULL OR d < 1 OR d > 7) THEN
    RAISE EXCEPTION 'dias_disponibles_invalid: each day must be an integer 1..7';
  END IF;
  v_num_dias := array_length(v_chrono, 1);
  SELECT jsonb_agg(d ORDER BY d) INTO v_dias_norm FROM unnest(v_chrono) AS d;
  -- [v2 · CONTRATO tirada larga] Validación ANTES del primer INSERT (ver nota
  -- en generate_user_plan_v2). Plantilla con long_run ⇒ p_long_run_day
  -- obligatorio, 1..7 y ∈ dias_disponibles; si no, excepción y ningún INSERT.
  SELECT EXISTS (
    SELECT 1 FROM plan_template_workouts w
    JOIN plan_template_weeks wk ON wk.id = w.week_id
    WHERE wk.template_id = v_template.id AND w.tipo = 'long_run'
      AND w.dia_orden <= v_num_dias AND (NOT w.es_opcional OR v_num_dias >= 5)
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
    v_lrd := NULL;  -- plantilla SIN long_run: se ignora; nunca se inventa una larga
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

  -- 5a. Extra base weeks (clone template week 1)
  IF v_extra_count > 0 THEN
    SELECT id INTO v_first_base_week_id FROM plan_template_weeks
    WHERE template_id = v_template.id ORDER BY semana_numero LIMIT 1;

    FOR v_extra_idx IN 1..v_extra_count LOOP
      v_fecha_semana := p_fecha_inicio + ((v_target_week_num - 1) * 7);

      v_has_long := EXISTS (
        SELECT 1 FROM plan_template_workouts w
        WHERE w.week_id = v_first_base_week_id AND w.tipo = 'long_run'
          AND w.dia_orden <= v_num_dias AND (NOT w.es_opcional OR v_num_dias >= 5)
      );
      IF v_has_long AND v_lrd IS NOT NULL THEN
        SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
          INTO v_nonlong FROM unnest(v_chrono) AS d WHERE d <> v_lrd;
      ELSE
        v_nonlong := v_chrono;
      END IF;
      v_nl_idx := 1;

      FOR v_workout IN
        SELECT * FROM plan_template_workouts
        WHERE week_id = v_first_base_week_id AND (NOT es_opcional OR v_num_dias >= 5)
        ORDER BY dia_orden
      LOOP
        IF v_workout.dia_orden > v_num_dias THEN CONTINUE; END IF;

        IF v_workout.tipo = 'long_run' AND v_has_long AND v_lrd IS NOT NULL THEN
          v_dia_iso := v_lrd;
        ELSE
          v_dia_iso := v_nonlong[v_nl_idx];
          v_nl_idx := v_nl_idx + 1;
        END IF;
        v_fecha_workout := v_fecha_semana + (((v_dia_iso - v_iso_start) % 7 + 7) % 7);

        v_ritmo := NULL;
        IF v_workout.zona_ritmo IS NOT NULL THEN
          SELECT offset_seconds INTO v_offset FROM plan_pace_zones
          WHERE template_id = v_template.id AND zona = v_workout.zona_ritmo;
          IF FOUND THEN v_ritmo := p_ritmo_base + (v_offset::NUMERIC / 60.0); END IF;
        END IF;

        INSERT INTO user_workouts (
          plan_id, user_id, template_workout_id, fecha,
          semana_numero, dia_orden, tipo,
          titulo, titulo_en, descripcion, descripcion_en,
          distancia_target_km, duracion_target_min, zona_ritmo, ritmo_target, estado
        ) VALUES (
          v_plan_id, p_user_id, v_workout.id, v_fecha_workout,
          v_target_week_num, v_workout.dia_orden, v_workout.tipo,   -- dia_orden CONSERVADO
          v_workout.titulo, v_workout.titulo_en,
          v_workout.descripcion, v_workout.descripcion_en,
          v_workout.distancia_km, v_workout.duracion_min, v_workout.zona_ritmo, v_ritmo,
          'pending'
        );
      END LOOP;
      v_target_week_num := v_target_week_num + 1;
    END LOOP;
  END IF;

  -- 5b. Canonical weeks (skipping first v_skip_count if compressing)
  FOR v_week IN
    SELECT * FROM plan_template_weeks
    WHERE template_id = v_template.id
    ORDER BY semana_numero
    OFFSET v_skip_count
  LOOP
    v_fecha_semana := p_fecha_inicio + ((v_target_week_num - 1) * 7);

    v_has_long := EXISTS (
      SELECT 1 FROM plan_template_workouts w
      WHERE w.week_id = v_week.id AND w.tipo = 'long_run'
        AND w.dia_orden <= v_num_dias AND (NOT w.es_opcional OR v_num_dias >= 5)
    );
    IF v_has_long AND v_lrd IS NOT NULL THEN
      SELECT array_agg(d ORDER BY ((d - v_iso_start) % 7 + 7) % 7)
        INTO v_nonlong FROM unnest(v_chrono) AS d WHERE d <> v_lrd;
    ELSE
      v_nonlong := v_chrono;
    END IF;
    v_nl_idx := 1;

    FOR v_workout IN
      SELECT * FROM plan_template_workouts
      WHERE week_id = v_week.id AND (NOT es_opcional OR v_num_dias >= 5)
      ORDER BY dia_orden
    LOOP
      IF v_workout.dia_orden > v_num_dias THEN CONTINUE; END IF;

      IF v_workout.tipo = 'long_run' AND v_has_long AND v_lrd IS NOT NULL THEN
        v_dia_iso := v_lrd;
      ELSE
        v_dia_iso := v_nonlong[v_nl_idx];
        v_nl_idx := v_nl_idx + 1;
      END IF;
      v_fecha_workout := v_fecha_semana + (((v_dia_iso - v_iso_start) % 7 + 7) % 7);

      v_ritmo := NULL;
      IF v_workout.zona_ritmo IS NOT NULL THEN
        SELECT offset_seconds INTO v_offset FROM plan_pace_zones
        WHERE template_id = v_template.id AND zona = v_workout.zona_ritmo;
        IF FOUND THEN v_ritmo := p_ritmo_base + (v_offset::NUMERIC / 60.0); END IF;
      END IF;

      INSERT INTO user_workouts (
        plan_id, user_id, template_workout_id, fecha,
        semana_numero, dia_orden, tipo,
        titulo, titulo_en, descripcion, descripcion_en,
        distancia_target_km, duracion_target_min, zona_ritmo, ritmo_target, estado
      ) VALUES (
        v_plan_id, p_user_id, v_workout.id, v_fecha_workout,
        v_target_week_num, v_workout.dia_orden, v_workout.tipo,   -- dia_orden CONSERVADO
        v_workout.titulo, v_workout.titulo_en,
        v_workout.descripcion, v_workout.descripcion_en,
        v_workout.distancia_km, v_workout.duracion_min, v_workout.zona_ritmo, v_ritmo,
        'pending'
      );
    END LOOP;
    v_target_week_num := v_target_week_num + 1;
  END LOOP;

  -- 🏁 RACE DAY workout — dia_orden 99 conservado
  IF p_fecha_carrera IS NOT NULL THEN
    INSERT INTO user_workouts (
      plan_id, user_id, fecha,
      semana_numero, dia_orden, tipo,
      titulo, titulo_en, descripcion, descripcion_en,
      distancia_target_km, estado
    ) VALUES (
      v_plan_id, p_user_id, p_fecha_carrera,
      v_target_week_num - 1, 99, 'race_day',
      COALESCE(p_race_nombre, 'Día de carrera'),
      COALESCE(p_race_nombre, 'Race day'),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CONCAT_WS(' · ', p_race_ciudad, p_race_distancia_principal, CASE WHEN p_race_hora IS NOT NULL THEN TO_CHAR(p_race_hora, 'HH24:MI') ELSE NULL END),
      CASE p_race_distancia_principal
        WHEN '5K' THEN 5 WHEN '10K' THEN 10 WHEN '21K' THEN 21.0975 WHEN '42K' THEN 42.195
        WHEN 'Trail' THEN NULL ELSE NULL END,
      'pending'
    );
  END IF;

  RETURN v_plan_id;
END;
$function$;

-- Permisos: mismos que las v1 desplegadas (SECURITY DEFINER, sin search_path —
-- se conserva la paridad de comportamiento con producción; el smell de
-- search_path es pre-existente y queda fuera de este bugfix).
GRANT EXECUTE ON FUNCTION public.generate_user_plan_v2(
  uuid, text, numeric, text, jsonb, date, date, text, text, text, text, text, time without time zone, integer
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.generate_user_plan_adaptive_v2(
  uuid, text, date, date, numeric, text, jsonb, boolean, text, text, text, text, text, time without time zone, integer
) TO authenticated;
