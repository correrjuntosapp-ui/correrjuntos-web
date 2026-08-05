-- ============================================================
-- weekly_newsletter · estado intermedio 'sending' (anti-duplicado)
-- Fecha: 2026-08-03
--
-- Aditiva. `status` es text NOT NULL DEFAULT 'draft' SIN CHECK ni enum
-- (verificado en information_schema), asi que admitir 'sending' no exige
-- tocar esa columna.
--
--   sending_at  -> permite detectar picks atascados en 'sending'. Sin ella
--                  el estado no tiene edad y no se puede alertar.
--   last_error  -> deja constancia en la fila de un fallo posterior a la
--                  persistencia. Solo CODIGOS internos controlados: nunca
--                  respuestas completas, secretos ni stack traces.
--
-- Maquina de estados: draft -> ready -> sending -> sent
--
-- NO EJECUTADA. Aplicar con apply_migration tras autorizacion.
-- ============================================================

alter table public.weekly_newsletter
  add column if not exists sending_at timestamptz,
  add column if not exists last_error text;

comment on column public.weekly_newsletter.sending_at is
  'Instante en que el pick paso a status=sending, justo antes de sendNow. Sirve para detectar envios atascados.';
comment on column public.weekly_newsletter.last_error is
  'Codigo interno del ultimo fallo (p.ej. manual_recovery_required, sendnow_failed). Nunca payloads, secretos ni stack traces.';
