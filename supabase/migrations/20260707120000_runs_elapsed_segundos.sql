-- ============================================================
-- runs.elapsed_segundos — tiempo total transcurrido (incl. pausas)
-- ============================================================
-- Contexto: duracion_segundos representa el tiempo EN MOVIMIENTO
-- (moving_time en Strava). Para runs importadas de Strava con pausas
-- reales (semáforos, fotos, etc.) moving_time != elapsed_time, y
-- RunDetailScreen quiere poder mostrar "ritmo en movimiento vs total"
-- cuando difieren. Columna aditiva y nullable — no rompe nada
-- existente (runs sin este dato, tracker propio o imports antiguos,
-- quedan en NULL y la UI simplemente no muestra esa fila extra).
--
-- Aplicada en remoto vía Management API el 7 jul 2026 (ver sesión
-- "RunDetail nivel pro"). Este archivo documenta el cambio para que
-- `supabase db push`/`db diff` no lo vuelvan a proponer.
-- ============================================================

ALTER TABLE public.runs
  ADD COLUMN IF NOT EXISTS elapsed_segundos integer;

COMMENT ON COLUMN public.runs.elapsed_segundos IS
  'Tiempo total transcurrido (incluye pausas), en segundos. Poblado desde Strava elapsed_time en imports; duracion_segundos sigue representando el tiempo en movimiento (moving_time). NULL si no disponible.';

-- ── Rollback ──
-- ALTER TABLE public.runs DROP COLUMN IF EXISTS elapsed_segundos;
