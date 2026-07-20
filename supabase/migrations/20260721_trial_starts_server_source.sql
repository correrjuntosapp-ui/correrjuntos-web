-- [21 jul 2026] trial_starts: red de seguridad server-side (webhook RevenueCat)
-- ADITIVA e IDEMPOTENTE (IF NOT EXISTS en columnas e índice; el check se crea
-- solo si no existe). NO borra datos, NO reescribe filas existentes: las filas
-- históricas solo reciben el default de `source` ('client', su procedencia
-- real). El cliente antiguo (iap.ts) sigue insertando sin conocer las columnas
-- nuevas: todas son NULLables o con default.
--
-- Clave de convergencia cliente/servidor: YA existe y no se toca —
--   trial_starts_user_active_idx UNIQUE (user_id) WHERE status='trial_active'

alter table public.trial_starts
  add column if not exists store_transaction_id text,
  add column if not exists expires_at timestamptz,
  add column if not exists source text not null default 'client';

-- Procedencia acotada (client = iap.ts, revenuecat = webhook, backfill =
-- operación manual auditada). NOT VALID: no re-escanea filas existentes
-- (todas cumplen por default); se valida solo para filas nuevas.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trial_starts_source_check'
  ) then
    alter table public.trial_starts
      add constraint trial_starts_source_check
      check (source in ('client', 'revenuecat', 'backfill')) not valid;
  end if;
end $$;

-- Un linaje de compra (original_transaction_id de RevenueCat) = un trial.
-- Parcial sobre no-nulos: las filas del cliente (sin otx) no colisionan.
-- Tabla de 5 filas: creación instantánea, sin riesgo de lock.
create unique index if not exists trial_starts_store_tx_idx
  on public.trial_starts (store_transaction_id)
  where store_transaction_id is not null;
