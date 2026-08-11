-- ============================================================
-- weekly_newsletter · automatizacion semanal (prepare / preflight / send)
-- Fecha: 2026-08-11 (nombre 20260805 conservado: mantiene el orden tras
--        20260804 y no colisiona con ninguna migracion existente)
--
-- Aditiva y retrocompatible: todas las columnas son NULL-ables y los picks
-- antiguos siguen funcionando sin ellas. `status` es text NOT NULL sin CHECK
-- ni enum (verificado en information_schema), asi que admitir los nuevos
-- estados 'paused' y 'cancelled' NO exige tocar esa columna.
--
-- Maquina de estados completa:
--   draft -> ready -> sending -> sent
--   paused / cancelled  = frenos humanos; ningun job los sobrescribe.
--
-- NO EJECUTADA. Aplicar con apply_migration cuando se autorice el despliegue.
-- ============================================================

alter table public.weekly_newsletter
  add column if not exists selected_article text,
  add column if not exists category         text,
  add column if not exists auto_prepared    boolean not null default false,
  add column if not exists prepared_at      timestamptz,
  add column if not exists ready_at         timestamptz,
  add column if not exists test_campaign_id integer,
  add column if not exists test_sent_at     timestamptz,
  add column if not exists block_ids        jsonb;

-- ------------------------------------------------------------
-- PASO PREVIO OBLIGATORIO antes del indice unico (solo lectura):
--
--   select week_of, count(*)
--   from public.weekly_newsletter
--   group by week_of having count(*) > 1;
--
-- Si devuelve filas, NO aplicar el indice todavia. Que hacer entonces:
--   1. Mirar cada grupo duplicado y decidir a mano cual es la edicion buena
--      (normalmente la que tiene sent_at o brevo_campaign_id).
--   2. Marcar las demas como 'cancelled' o moverlas a otra week_of.
--   3. NO borrar ni fusionar filas de forma automatica: el historico de envios
--      es la unica prueba de que salio y a cuanta gente.
--   4. Repetir la consulta y, cuando devuelva vacio, aplicar el indice.
-- ------------------------------------------------------------

-- Una sola edicion por semana. Es la garantia estructural de que ni un cron
-- repetido ni dos ejecuciones simultaneas pueden crear dos picks para el mismo
-- lunes; el codigo comprueba antes, pero la ultima palabra la tiene la BD.
create unique index if not exists weekly_newsletter_week_of_key
  on public.weekly_newsletter (week_of);

comment on column public.weekly_newsletter.selected_article is
  'Slug elegido por el selector automatico. Alimenta el cooldown de 12 ediciones.';
comment on column public.weekly_newsletter.category is
  'Categoria del articulo, para no repetirla en semanas consecutivas.';
comment on column public.weekly_newsletter.auto_prepared is
  'true si la edicion la creo weekly-newsletter-prepare sin intervencion humana.';
comment on column public.weekly_newsletter.test_campaign_id is
  'Campana de PRUEBA en Brevo. Deliberadamente separada de brevo_campaign_id, que solo guarda la campana real del lunes.';
comment on column public.weekly_newsletter.test_sent_at is
  'Instante del ultimo sendTest aceptado por Brevo. Permite distinguir un draft que nunca llego a probarse de uno que si, y saber si una reanudacion reenviaria la prueba.';
comment on column public.weekly_newsletter.block_ids is
  'Identificadores de los bloques usados, para rotarlos y no repetirlos.';
