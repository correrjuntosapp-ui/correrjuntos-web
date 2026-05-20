-- ─────────────────────────────────────────────────────────────────────
-- Módulo Fuerza — v1.3.7
-- 20 may 2026
--
-- Schema completo para entrenamientos de fuerza compatibles con plan
-- running. Soporta casa + gym mediante variantes por equipo.
--
-- Reglas oro algoritmo strength-engine:
-- - NUNCA fuerza piernas día antes de tirada larga
-- - NUNCA fuerza pesada día después de series duras
-- - Core compatible con cualquier día
-- - Compensación post-larga (movilidad/recuperación) → domingo
-- ─────────────────────────────────────────────────────────────────────

-- ════════════════════════════
-- 1. Ejercicios maestros
-- ════════════════════════════
CREATE TABLE IF NOT EXISTS public.strength_exercises (
  id                BIGSERIAL PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,                              -- 'sentadilla-goblet'
  name_es           TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  category          TEXT NOT NULL CHECK (category IN (
                      'tren_inferior', 'core', 'gluteos', 'movilidad', 'tren_superior'
                    )),
  muscles_primary   TEXT[] NOT NULL DEFAULT '{}',                      -- ['cuadriceps', 'gluteos']
  muscles_secondary TEXT[] NOT NULL DEFAULT '{}',
  difficulty        INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),  -- 1=ppte, 2=interm, 3=avanz
  is_unilateral     BOOLEAN NOT NULL DEFAULT FALSE,                    -- afecta cómo se cuentan reps
  instructions_es   TEXT[] NOT NULL DEFAULT '{}',                      -- ['Sostén la pesa...', 'Baja como...', 'Sube empujando...']
  instructions_en   TEXT[] NOT NULL DEFAULT '{}',
  tip_es            TEXT,                                              -- Tip Coach Jose en español
  tip_en            TEXT,
  warnings_es       TEXT,                                              -- "Si te molestan las rodillas..."
  warnings_en       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strength_exercises_category
  ON public.strength_exercises (category);

CREATE INDEX IF NOT EXISTS idx_strength_exercises_difficulty
  ON public.strength_exercises (difficulty);

COMMENT ON TABLE  public.strength_exercises IS 'Catálogo maestro de ejercicios de fuerza (sin variante de equipo)';

-- ════════════════════════════
-- 2. Variantes por equipo
-- ════════════════════════════
CREATE TABLE IF NOT EXISTS public.strength_exercise_variants (
  id                BIGSERIAL PRIMARY KEY,
  exercise_id       BIGINT NOT NULL REFERENCES public.strength_exercises(id) ON DELETE CASCADE,
  slug              TEXT NOT NULL,                                     -- 'sentadilla-goblet-mancuerna'
  variant_name_es   TEXT NOT NULL,                                     -- 'Con mancuerna'
  variant_name_en   TEXT NOT NULL,
  equipment         TEXT NOT NULL CHECK (equipment IN (
                      'bodyweight', 'mancuerna', 'banda', 'barra',
                      'maquina', 'kettlebell', 'silla_sofa', 'cajon', 'pared'
                    )),
  location          TEXT NOT NULL CHECK (location IN ('casa', 'gym', 'ambos')),
  gif_url           TEXT,                                              -- URL MuscleWiki/ExerciseDB · puede ser NULL si solo descripción
  gif_source        TEXT DEFAULT 'musclewiki' CHECK (gif_source IN ('musclewiki', 'exercisedb', 'self', 'placeholder')),
  is_default        BOOLEAN NOT NULL DEFAULT FALSE,                    -- variante mostrada si user no tiene preferencia
  difficulty_modifier INT DEFAULT 0,                                   -- -1 más fácil, +1 más difícil que la difficulty del ejercicio
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exercise_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_variants_exercise
  ON public.strength_exercise_variants (exercise_id);

CREATE INDEX IF NOT EXISTS idx_variants_location
  ON public.strength_exercise_variants (location);

COMMENT ON TABLE public.strength_exercise_variants IS 'Variantes por equipo (bodyweight/mancuerna/barra/máquina) de cada ejercicio';

-- ════════════════════════════
-- 3. Sesiones pre-cargadas
-- ════════════════════════════
CREATE TABLE IF NOT EXISTS public.strength_sessions (
  id                BIGSERIAL PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name_es           TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  description_es    TEXT,
  description_en    TEXT,
  category          TEXT NOT NULL CHECK (category IN (
                      'anti_lesion_piernas',     -- A/B/C tren inferior runner
                      'core',                    -- Core express + completo
                      'gluteos',                 -- Glúteos clave
                      'cuerpo_entero',           -- Compatible pre-larga
                      'compensacion',            -- Post-larga · movilidad
                      'warm_up'                  -- Activación pre-run
                    )),
  duration_min      INT NOT NULL,                                     -- 8, 15, 20, 25, 35
  difficulty        INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  -- Compatibilidad con días de plan running:
  ok_pre_long_run   BOOLEAN NOT NULL DEFAULT FALSE,                   -- True = se puede el día antes de tirada larga
  ok_post_long_run  BOOLEAN NOT NULL DEFAULT FALSE,                   -- True = se puede el día después de tirada larga
  ok_post_intervals BOOLEAN NOT NULL DEFAULT TRUE,                    -- True = se puede el día después de series duras
  ok_any_day        BOOLEAN NOT NULL DEFAULT FALSE,                   -- True (core suele serlo) = compatible cualquier día
  recommended_when  TEXT,                                             -- 'martes_o_jueves' · 'domingo' · 'cualquier_dia'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strength_sessions_category
  ON public.strength_sessions (category);

COMMENT ON TABLE public.strength_sessions IS 'Sesiones de fuerza pre-cargadas con reglas compatibilidad runner';

-- ════════════════════════════
-- 4. Ejercicios dentro de cada sesión
-- ════════════════════════════
CREATE TABLE IF NOT EXISTS public.strength_session_items (
  id                BIGSERIAL PRIMARY KEY,
  session_id        BIGINT NOT NULL REFERENCES public.strength_sessions(id) ON DELETE CASCADE,
  exercise_id       BIGINT NOT NULL REFERENCES public.strength_exercises(id) ON DELETE CASCADE,
  order_idx         INT NOT NULL,                                    -- 1, 2, 3...
  sets              INT NOT NULL DEFAULT 3,
  reps              TEXT NOT NULL,                                   -- '12' · '10 cada pierna' · '30s' · '15-20'
  rest_seconds      INT NOT NULL DEFAULT 60,
  notes_es          TEXT,                                            -- 'Bajar despacio, controlar la fase excéntrica'
  notes_en          TEXT,
  UNIQUE (session_id, order_idx)
);

CREATE INDEX IF NOT EXISTS idx_session_items_session
  ON public.strength_session_items (session_id, order_idx);

-- ════════════════════════════
-- 5. Tracking — sesiones completadas por user
-- ════════════════════════════
CREATE TABLE IF NOT EXISTS public.strength_completions (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id        BIGINT NOT NULL REFERENCES public.strength_sessions(id),
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds  INT,                                             -- duración real (puede diferir de la teórica)
  difficulty_felt   INT CHECK (difficulty_felt BETWEEN 1 AND 5),     -- "¿cómo te ha ido?" 1=muy fácil, 5=imposible
  notes             TEXT,                                            -- nota libre user
  exercises_done    JSONB                                            -- [{exercise_id: 1, sets_done: 3, reps_done: [12,12,10]}]
);

CREATE INDEX IF NOT EXISTS idx_strength_completions_user_date
  ON public.strength_completions (user_id, completed_at DESC);

-- ════════════════════════════
-- 6. Preferencias user
-- ════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_strength_preferences (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  location_pref     TEXT NOT NULL DEFAULT 'casa' CHECK (location_pref IN (
                      'casa',         -- Solo bodyweight + cosas que tengo
                      'casa_equipped',-- Casa con mancuernas + banda
                      'mixto',        -- Alterno casa + gym
                      'gym'           -- Solo gym (con barras, máquinas)
                    )),
  level             INT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 3),  -- ppte/interm/avanz
  sessions_per_week INT NOT NULL DEFAULT 2 CHECK (sessions_per_week BETWEEN 0 AND 5),
  has_dumbbells     BOOLEAN NOT NULL DEFAULT FALSE,
  has_band          BOOLEAN NOT NULL DEFAULT FALSE,
  has_kettlebell    BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_days    INT[] NOT NULL DEFAULT '{2,4}',                  -- 0=Dom, 1=Lun, 2=Mar... (martes y jueves default)
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_strength_preferences IS 'Preferencias del user sobre fuerza (lugar, nivel, frecuencia, equipo disponible)';

-- ════════════════════════════
-- 7. RLS Policies
-- ════════════════════════════

-- strength_exercises, strength_exercise_variants, strength_sessions, strength_session_items
-- son catálogo público — LECTURA libre para todos los usuarios autenticados, escritura solo service_role
ALTER TABLE public.strength_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_exercise_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_session_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "strength_exercises_select_all"
  ON public.strength_exercises FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "strength_exercise_variants_select_all"
  ON public.strength_exercise_variants FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "strength_sessions_select_all"
  ON public.strength_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "strength_session_items_select_all"
  ON public.strength_session_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- strength_completions: user solo ve/modifica los suyos
ALTER TABLE public.strength_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "strength_completions_select_own"
  ON public.strength_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "strength_completions_insert_own"
  ON public.strength_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "strength_completions_update_own"
  ON public.strength_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "strength_completions_delete_own"
  ON public.strength_completions FOR DELETE
  USING (auth.uid() = user_id);

-- user_strength_preferences: user solo ve/modifica las suyas
ALTER TABLE public.user_strength_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_strength_preferences_select_own"
  ON public.user_strength_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_strength_preferences_insert_own"
  ON public.user_strength_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_strength_preferences_update_own"
  ON public.user_strength_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ════════════════════════════
-- 8. Función helper — obtener variante recomendada para user
-- ════════════════════════════
CREATE OR REPLACE FUNCTION public.get_variant_for_user(
  p_exercise_id BIGINT,
  p_user_id UUID
) RETURNS TABLE (
  variant_id        BIGINT,
  slug              TEXT,
  variant_name_es   TEXT,
  variant_name_en   TEXT,
  equipment         TEXT,
  location          TEXT,
  gif_url           TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_location_pref TEXT;
  v_has_dumbbells BOOLEAN;
  v_has_band BOOLEAN;
BEGIN
  -- Obtener preferencias del user
  SELECT location_pref, has_dumbbells, has_band
  INTO v_location_pref, v_has_dumbbells, v_has_band
  FROM public.user_strength_preferences
  WHERE user_id = p_user_id;

  -- Default: casa sin equipo
  v_location_pref := COALESCE(v_location_pref, 'casa');
  v_has_dumbbells := COALESCE(v_has_dumbbells, FALSE);
  v_has_band := COALESCE(v_has_band, FALSE);

  -- Retornar variante apropiada con prioridad:
  -- 1. Si gym: prefer variant gym
  -- 2. Si casa_equipped + has_dumbbells: prefer mancuerna
  -- 3. Si casa_equipped + has_band: prefer banda
  -- 4. Default: bodyweight
  RETURN QUERY
  SELECT v.id, v.slug, v.variant_name_es, v.variant_name_en, v.equipment, v.location, v.gif_url
  FROM public.strength_exercise_variants v
  WHERE v.exercise_id = p_exercise_id
    AND (
      (v_location_pref = 'gym' AND v.location IN ('gym', 'ambos'))
      OR (v_location_pref = 'mixto')
      OR (v_location_pref IN ('casa', 'casa_equipped') AND v.location IN ('casa', 'ambos'))
    )
    AND (
      v.equipment = 'bodyweight'
      OR (v.equipment IN ('silla_sofa', 'cajon', 'pared'))
      OR (v.equipment = 'mancuerna' AND v_has_dumbbells)
      OR (v.equipment = 'banda' AND v_has_band)
      OR (v.equipment IN ('barra', 'maquina', 'kettlebell') AND v_location_pref IN ('gym', 'mixto'))
    )
  ORDER BY
    CASE
      WHEN v_location_pref = 'gym' AND v.equipment IN ('barra', 'mancuerna', 'maquina') THEN 1
      WHEN v_has_dumbbells AND v.equipment = 'mancuerna' THEN 2
      WHEN v_has_band AND v.equipment = 'banda' THEN 3
      WHEN v.is_default THEN 4
      ELSE 5
    END
  LIMIT 1;
END;
$$;

-- ════════════════════════════
-- 9. Comentarios documentación
-- ════════════════════════════
COMMENT ON FUNCTION public.get_variant_for_user(BIGINT, UUID) IS
  'Devuelve la variante de ejercicio más apropiada para el user según su location_pref y equipo disponible';
