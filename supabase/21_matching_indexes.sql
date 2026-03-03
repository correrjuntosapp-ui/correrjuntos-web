-- =============================================
-- 21_matching_indexes.sql
-- Performance indexes for Runner Matching
-- =============================================

-- Index on ciudad (case-insensitive) for matching filter
CREATE INDEX IF NOT EXISTS idx_profiles_ciudad_lower
  ON profiles (lower(trim(ciudad)));

-- Index on matching_visible for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_matching_visible
  ON profiles (matching_visible)
  WHERE matching_visible = true;

-- Composite index for match_requests lookups
CREATE INDEX IF NOT EXISTS idx_match_requests_from_user
  ON match_requests (from_user_id, status);

CREATE INDEX IF NOT EXISTS idx_match_requests_to_user
  ON match_requests (to_user_id, status);
