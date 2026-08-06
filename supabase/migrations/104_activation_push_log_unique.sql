-- [F104/F105 · 6 ago 2026] Idempotencia REAL del cron de activación.
-- ORDEN: aplicar ANTES de desplegar api/_lib/jobs/activation-push.js
-- (que pasa de insert a upsert onConflict user_id,day_n).
-- Aplicar vía MCP apply_migration (NUNCA supabase db push).
--
-- POLÍTICA (decisión FASE 105): esta migración NO borra ni modifica datos.
-- Si existen pares (user_id, day_n) duplicados, ABORTA con excepción y el
-- caso se resuelve manualmente con autorización expresa.

DO $$
DECLARE dupes int;
BEGIN
  SELECT count(*) INTO dupes FROM (
    SELECT user_id, day_n
    FROM public.activation_push_log
    GROUP BY user_id, day_n
    HAVING count(*) > 1
  ) d;
  IF dupes > 0 THEN
    RAISE EXCEPTION 'F105 DETENTE: % pares (user_id,day_n) duplicados en activation_push_log — esta migración no limpia datos; resolver manualmente con autorización', dupes;
  END IF;
END $$;

ALTER TABLE public.activation_push_log
  ADD CONSTRAINT activation_push_log_user_day_key UNIQUE (user_id, day_n);

-- Rollback independiente (documentado, no ejecutar aquí):
--   ALTER TABLE public.activation_push_log DROP CONSTRAINT activation_push_log_user_day_key;
