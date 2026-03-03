-- =============================================
-- 22_hardening.sql
-- Security hardening: anti-duplicates, enhanced RLS, rate limiting
-- =============================================

-- ============================================================
-- A. MATCHING: Anti-duplicate constraint (prevent A→B if B→A exists)
-- ============================================================

-- Function to normalize pair (always smaller UUID first)
CREATE OR REPLACE FUNCTION match_pair_key(a UUID, b UUID)
RETURNS TEXT AS $$
BEGIN
  IF a < b THEN RETURN a::TEXT || ':' || b::TEXT;
  ELSE RETURN b::TEXT || ':' || a::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add generated column for unique pair (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_requests' AND column_name = 'pair_key'
  ) THEN
    ALTER TABLE match_requests
      ADD COLUMN pair_key TEXT GENERATED ALWAYS AS (match_pair_key(from_user_id, to_user_id)) STORED;

    -- Unique index: only one active (pending/accepted) request per pair
    CREATE UNIQUE INDEX IF NOT EXISTS idx_match_requests_unique_pair
      ON match_requests (pair_key)
      WHERE status IN ('pending', 'accepted');
  END IF;
END $$;

-- ============================================================
-- B. MATCHING: Rate limiting — max 10 requests per day per user
-- ============================================================

CREATE OR REPLACE FUNCTION check_match_request_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM match_requests
  WHERE from_user_id = NEW.from_user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 10 match requests per 24 hours';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_request_rate_limit ON match_requests;
CREATE TRIGGER trg_match_request_rate_limit
  BEFORE INSERT ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION check_match_request_rate_limit();

-- ============================================================
-- C. COMMENTS: Enhanced RLS — creador de quedada can also delete
-- ============================================================

-- Drop existing delete policy and create enhanced one
DROP POLICY IF EXISTS "comments_delete_own" ON quedada_comments;

CREATE POLICY "comments_delete_owner_or_creator" ON quedada_comments
  FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() = (
      SELECT creador_id FROM quedadas WHERE id = quedada_comments.quedada_id
    )
  );

-- ============================================================
-- D. COMMENTS: Server-side premium enforcement on INSERT
-- Only users with es_premium = true can create comments
-- Sync: RevenueCat → syncPremiumToSupabase() sets profiles.es_premium
-- Sync: Stripe webhook also sets profiles.es_premium
-- ============================================================

DROP POLICY IF EXISTS "comments_insert_own" ON quedada_comments;

CREATE POLICY "comments_insert_premium" ON quedada_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.es_premium = true
    )
  );

-- ============================================================
-- E. COMMENTS: Rate limiting — max 20 comments per hour per user
-- ============================================================

CREATE OR REPLACE FUNCTION check_comment_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM quedada_comments
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 20 comments per hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comment_rate_limit ON quedada_comments;
CREATE TRIGGER trg_comment_rate_limit
  BEFORE INSERT ON quedada_comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_rate_limit();

-- ============================================================
-- F. MATCHING: Prevent self-matching
-- ============================================================

ALTER TABLE match_requests
  DROP CONSTRAINT IF EXISTS no_self_match;

ALTER TABLE match_requests
  ADD CONSTRAINT no_self_match CHECK (from_user_id != to_user_id);
