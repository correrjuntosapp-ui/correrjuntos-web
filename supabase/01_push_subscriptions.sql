-- ============================================
-- TABLA: push_subscriptions
-- Almacena las suscripciones Push de los usuarios
-- ============================================

-- Crear tabla
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índice para búsquedas por user_id
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver/editar solo su suscripción
CREATE POLICY "Users can manage own subscription" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Política: el servicio puede leer todas las suscripciones (para enviar notificaciones)
CREATE POLICY "Service can read all subscriptions" ON push_subscriptions
    FOR SELECT USING (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_subscription_timestamp
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscription_timestamp();

-- ============================================
-- OPCIONAL: Añadir columna lat/lng a profiles si no existe
-- Para buscar usuarios "cerca" de la quedada
-- ============================================

-- Verificar y añadir columnas de ubicación a profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lat') THEN
        ALTER TABLE profiles ADD COLUMN lat DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lng') THEN
        ALTER TABLE profiles ADD COLUMN lng DOUBLE PRECISION;
    END IF;
END $$;

-- Índice espacial básico
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- ============================================
-- GRANT permisos
-- ============================================
GRANT ALL ON push_subscriptions TO authenticated;
GRANT SELECT ON push_subscriptions TO service_role;
