-- ============================================
-- TABLA: subscriptions
-- Sistema de suscripciones Premium
-- ============================================

-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, canceled, past_due
    plan TEXT NOT NULL DEFAULT 'free', -- free, premium
    price_amount INTEGER DEFAULT 499, -- en céntimos (4.99€)
    currency TEXT DEFAULT 'eur',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver solo su suscripción
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Política: solo el sistema puede insertar/actualizar (via service_role)
CREATE POLICY "Service can manage subscriptions" ON subscriptions
    FOR ALL USING (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_timestamp
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_timestamp();

-- ============================================
-- Añadir columna is_premium a profiles (cache rápido)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_premium') THEN
        ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'premium_until') THEN
        ALTER TABLE profiles ADD COLUMN premium_until TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================
-- Función para verificar si usuario es premium
-- ============================================
CREATE OR REPLACE FUNCTION is_user_premium(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    premium_status BOOLEAN;
BEGIN
    SELECT (status = 'active' AND current_period_end > NOW())
    INTO premium_status
    FROM subscriptions
    WHERE user_id = check_user_id;

    RETURN COALESCE(premium_status, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT permisos
-- ============================================
GRANT SELECT ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO service_role;
