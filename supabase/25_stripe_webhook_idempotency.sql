-- 25_stripe_webhook_idempotency.sql
-- P0 security: strict webhook idempotency storage

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type
  ON stripe_webhook_events (event_type);

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
