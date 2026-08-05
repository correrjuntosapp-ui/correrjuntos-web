-- ============================================================
-- weekly_newsletter · bloques editoriales + nombre de campaña
-- Fecha: 2026-08-03
--
-- Aditiva y retrocompatible: ambas columnas son NULLABLE y sin DEFAULT.
-- Un pick antiguo (blocks NULL, campaign_name NULL) conserva exactamente
-- su estructura y comportamiento actuales.
--
-- NO EJECUTADA. Aplicar con apply_migration tras autorización.
-- ⚠️ No usar `supabase db push` (deriva de migraciones ajenas).
-- ============================================================

alter table public.weekly_newsletter
  add column if not exists blocks        jsonb,
  add column if not exists campaign_name text;

-- blocks debe ser NULL o un objeto JSON (nunca array, string, number ni bool).
alter table public.weekly_newsletter
  drop constraint if exists weekly_newsletter_blocks_is_object;

alter table public.weekly_newsletter
  add constraint weekly_newsletter_blocks_is_object
  check (blocks is null or jsonb_typeof(blocks) = 'object');

comment on column public.weekly_newsletter.blocks is
  'Bloques editoriales opcionales: {"version":1,"items":[{type,...}]}. Tipos admitidos: training, coach, race, tool. Sin HTML: todo se escapa al renderizar.';
comment on column public.weekly_newsletter.campaign_name is
  'Nombre de la campaña en Brevo. Si es NULL se usa el autogenerado.';
