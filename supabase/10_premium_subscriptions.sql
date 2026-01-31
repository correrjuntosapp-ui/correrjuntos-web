-- Tabla para guardar suscripciones Premium de In-App Purchase (iOS/Android)
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  product_id TEXT NOT NULL,
  transaction_id TEXT,
  receipt TEXT,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_active ON premium_subscriptions(is_active);

-- Añadir columnas a profiles si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'es_premium') THEN
    ALTER TABLE profiles ADD COLUMN es_premium BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'premium_since') THEN
    ALTER TABLE profiles ADD COLUMN premium_since TIMESTAMPTZ;
  END IF;
END $$;

-- RLS Policies
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions"
  ON premium_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar/actualizar sus propias suscripciones
CREATE POLICY "Users can manage own subscriptions"
  ON premium_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_premium_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_premium_subscriptions_updated_at ON premium_subscriptions;
CREATE TRIGGER trigger_premium_subscriptions_updated_at
  BEFORE UPDATE ON premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_premium_subscription_updated_at();
