-- =============================================
-- 20_runner_matching.sql
-- Runner Matching — find compatible running partners
-- =============================================

-- A. Add matching fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ritmo_min TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ritmo_max TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dias_preferidos TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS horario_preferido TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_matching TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS matching_visible BOOLEAN DEFAULT true;

-- B. Create match_requests table
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own requests" ON match_requests;
CREATE POLICY "Users see own requests" ON match_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users create own requests" ON match_requests;
CREATE POLICY "Users create own requests" ON match_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users update received requests" ON match_requests;
CREATE POLICY "Users update received requests" ON match_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

GRANT SELECT, INSERT, UPDATE ON match_requests TO authenticated;

-- C. Helper: convert pace text "5:30" to total seconds
CREATE OR REPLACE FUNCTION pace_to_seconds(p TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF p IS NULL OR p = '' THEN RETURN 0; END IF;
  RETURN (split_part(p, ':', 1)::INTEGER * 60) + COALESCE(split_part(p, ':', 2)::INTEGER, 0);
EXCEPTION WHEN OTHERS THEN RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- D. Helper: nivel to numeric rank
CREATE OR REPLACE FUNCTION nivel_to_rank(n TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE lower(coalesce(n,''))
    WHEN 'principiante' THEN 1
    WHEN 'intermedio' THEN 2
    WHEN 'avanzado' THEN 3
    ELSE 2
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- E. Main RPC: find_compatible_runners
CREATE OR REPLACE FUNCTION find_compatible_runners(p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
  user_id UUID,
  nombre TEXT,
  photo_url TEXT,
  ciudad TEXT,
  nivel TEXT,
  ritmo_min TEXT,
  ritmo_max TEXT,
  dias_preferidos TEXT[],
  horario_preferido TEXT,
  objetivo TEXT,
  bio_matching TEXT,
  quedadas_asistidas INTEGER,
  verification_badge BOOLEAN,
  score INTEGER
) AS $$
DECLARE
  v_uid UUID;
  v_city TEXT;
  v_rmin INTEGER;
  v_rmax INTEGER;
  v_dias TEXT[];
  v_horario TEXT;
  v_nivel_rank INTEGER;
  v_objetivo TEXT;
BEGIN
  v_uid := auth.uid();

  -- Load caller's matching profile
  SELECT p.ciudad, pace_to_seconds(p.ritmo_min), pace_to_seconds(p.ritmo_max),
         p.dias_preferidos, p.horario_preferido, nivel_to_rank(p.nivel), p.objetivo
  INTO v_city, v_rmin, v_rmax, v_dias, v_horario, v_nivel_rank, v_objetivo
  FROM profiles p WHERE p.id = v_uid;

  -- If caller has no city, return empty
  IF v_city IS NULL OR v_city = '' THEN RETURN; END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT
      p.id AS cand_id,
      p.nombre AS cand_nombre,
      p.photo_url AS cand_photo,
      p.ciudad AS cand_ciudad,
      p.nivel AS cand_nivel,
      p.ritmo_min AS cand_ritmo_min,
      p.ritmo_max AS cand_ritmo_max,
      p.dias_preferidos AS cand_dias,
      p.horario_preferido AS cand_horario,
      p.objetivo AS cand_objetivo,
      p.bio_matching AS cand_bio,
      COALESCE(p.quedadas_asistidas, 0) AS cand_asistidas,
      COALESCE(p.verification_badge, false) AS cand_verified,
      -- Pace score (30%): overlap of pace ranges
      CASE
        WHEN v_rmin = 0 OR pace_to_seconds(p.ritmo_min) = 0 THEN 15
        ELSE GREATEST(0, 30 - (
          ABS(pace_to_seconds(p.ritmo_min) - v_rmin) +
          ABS(pace_to_seconds(p.ritmo_max) - v_rmax)
        ) / 10)
      END AS pace_score,
      -- Schedule score (25%): matching days + same horario
      CASE
        WHEN v_dias IS NULL OR p.dias_preferidos IS NULL THEN 12
        ELSE LEAST(25, (
          (SELECT COUNT(*) FROM unnest(v_dias) d WHERE d = ANY(p.dias_preferidos))::INTEGER * 3
          + CASE WHEN v_horario = p.horario_preferido THEN 10 ELSE 0 END
        ))
      END AS schedule_score,
      -- Level score (25%): same=25, ±1=15, ±2=5
      CASE
        WHEN ABS(nivel_to_rank(p.nivel) - v_nivel_rank) = 0 THEN 25
        WHEN ABS(nivel_to_rank(p.nivel) - v_nivel_rank) = 1 THEN 15
        ELSE 5
      END AS level_score,
      -- Goal score (10%)
      CASE WHEN v_objetivo IS NOT NULL AND p.objetivo = v_objetivo THEN 10 ELSE 0 END AS goal_score,
      -- Activity bonus (10%): normalized
      LEAST(10, COALESCE(p.quedadas_asistidas, 0)) AS activity_score
    FROM profiles p
    WHERE p.id != v_uid
      AND lower(trim(p.ciudad)) = lower(trim(v_city))
      AND COALESCE(p.matching_visible, true) = true
      AND p.nombre IS NOT NULL
      AND p.id NOT IN (
        SELECT mr.to_user_id FROM match_requests mr WHERE mr.from_user_id = v_uid
        UNION
        SELECT mr.from_user_id FROM match_requests mr WHERE mr.to_user_id = v_uid AND mr.status = 'rejected'
      )
  )
  SELECT
    c.cand_id,
    c.cand_nombre,
    c.cand_photo,
    c.cand_ciudad,
    c.cand_nivel,
    c.cand_ritmo_min,
    c.cand_ritmo_max,
    c.cand_dias,
    c.cand_horario,
    c.cand_objetivo,
    c.cand_bio,
    c.cand_asistidas,
    c.cand_verified,
    (c.pace_score + c.schedule_score + c.level_score + c.goal_score + c.activity_score)::INTEGER AS total_score
  FROM candidates c
  ORDER BY (c.pace_score + c.schedule_score + c.level_score + c.goal_score + c.activity_score) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION find_compatible_runners(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION pace_to_seconds(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION nivel_to_rank(TEXT) TO authenticated;
