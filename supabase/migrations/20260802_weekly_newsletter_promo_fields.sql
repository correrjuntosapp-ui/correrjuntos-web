-- ============================================================
-- weekly_newsletter · campos opcionales para campañas con contenido promocional
-- Fecha: 2026-08-02
--
-- Todas las columnas son NULLABLE y sin DEFAULT: las campañas existentes
-- (y cualquier pick que no las use) siguen generando exactamente el mismo
-- email que antes. El código las trata como opcionales:
--   subject      -> si es NULL usa title
--   utm_campaign -> si es NULL usa 'weekly'
--   preheader / promo_label / disclosure -> si son NULL no se renderiza el bloque
--
-- NO EJECUTADA. Aplicar con el MCP de Supabase (apply_migration) tras autorización.
-- ⚠️ No usar `supabase db push` (deriva de migraciones ajenas).
-- ============================================================

alter table public.weekly_newsletter
  add column if not exists subject      text,
  add column if not exists preheader    text,
  add column if not exists promo_label  text,
  add column if not exists disclosure   text,
  add column if not exists utm_campaign text,
  add column if not exists promo        jsonb;

comment on column public.weekly_newsletter.subject      is 'Asunto del email. Si es NULL se usa title.';
comment on column public.weekly_newsletter.preheader    is 'Texto de vista previa en la bandeja de entrada.';
comment on column public.weekly_newsletter.promo_label  is 'Etiqueta superior para envíos con enlaces promocionales.';
comment on column public.weekly_newsletter.disclosure   is 'Aviso legal al pie para envíos con enlaces promocionales.';
comment on column public.weekly_newsletter.utm_campaign is 'utm_campaign del enlace del CTA. Si es NULL se usa ''weekly''.';
comment on column public.weekly_newsletter.promo        is 'Bloque promocional opcional: {title,text,code,cta_label,url,note}.';
