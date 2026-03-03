-- ============================================================
-- delete_user_account RPC
-- Fully deletes a user account and all associated data
-- Required by Apple App Store Review Guidelines §5.1.1(v)
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Delete comments on quedadas
  DELETE FROM quedada_comments WHERE user_id = _uid;

  -- 2. Delete match requests (sent or received)
  DELETE FROM match_requests WHERE sender_id = _uid OR receiver_id = _uid;

  -- 3. Delete participations
  DELETE FROM participantes WHERE usuario_id = _uid;

  -- 4. Delete follows (both directions)
  DELETE FROM seguidores WHERE follower_id = _uid OR followed_id = _uid;

  -- 5. Delete quedadas created by user
  DELETE FROM participantes WHERE quedada_id IN (
    SELECT id FROM quedadas WHERE creador_id = _uid
  );
  DELETE FROM quedada_comments WHERE quedada_id IN (
    SELECT id FROM quedadas WHERE creador_id = _uid
  );
  DELETE FROM quedadas WHERE creador_id = _uid;

  -- 6. Delete profile
  DELETE FROM profiles WHERE id = _uid;

  -- 7. Delete auth user (requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = _uid;
END;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
