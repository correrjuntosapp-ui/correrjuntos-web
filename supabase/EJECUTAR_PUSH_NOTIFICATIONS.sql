-- ============================================
-- SCRIPT COMPLETO PARA NOTIFICACIONES PUSH
-- Ejecutar este archivo completo en Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABLA: push_subscriptions
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subscription" ON push_subscriptions;
CREATE POLICY "Users can manage own subscription" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can read all subscriptions" ON push_subscriptions;
CREATE POLICY "Service can read all subscriptions" ON push_subscriptions
    FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_push_subscription_timestamp ON push_subscriptions;
CREATE TRIGGER trigger_update_push_subscription_timestamp
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscription_timestamp();

GRANT ALL ON push_subscriptions TO authenticated;
GRANT SELECT ON push_subscriptions TO service_role;

-- ============================================
-- 2. TABLA: notificacion_preferencias
-- ============================================
CREATE TABLE IF NOT EXISTS notificacion_preferencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recordatorio_24h BOOLEAN DEFAULT true,
    recordatorio_1h BOOLEAN DEFAULT true,
    participante_se_une BOOLEAN DEFAULT true,
    nueva_quedada_ciudad BOOLEAN DEFAULT true,
    quedada_cancelada BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_notificacion_preferencias_user_id
ON notificacion_preferencias(user_id);

CREATE OR REPLACE FUNCTION update_notificacion_preferencias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notificacion_preferencias_updated_at ON notificacion_preferencias;
CREATE TRIGGER trigger_notificacion_preferencias_updated_at
    BEFORE UPDATE ON notificacion_preferencias
    FOR EACH ROW
    EXECUTE FUNCTION update_notificacion_preferencias_updated_at();

ALTER TABLE notificacion_preferencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification preferences" ON notificacion_preferencias;
CREATE POLICY "Users can view own notification preferences"
    ON notificacion_preferencias
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notificacion_preferencias;
CREATE POLICY "Users can insert own notification preferences"
    ON notificacion_preferencias
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON notificacion_preferencias;
CREATE POLICY "Users can update own notification preferences"
    ON notificacion_preferencias
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notification preferences" ON notificacion_preferencias;
CREATE POLICY "Users can delete own notification preferences"
    ON notificacion_preferencias
    FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can read all notification preferences" ON notificacion_preferencias;
CREATE POLICY "Service role can read all notification preferences"
    ON notificacion_preferencias
    FOR SELECT
    TO service_role
    USING (true);

GRANT ALL ON notificacion_preferencias TO authenticated;
GRANT SELECT ON notificacion_preferencias TO service_role;

-- ============================================
-- 3. TABLA: notificaciones_enviadas (auditoria)
-- ============================================
CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    cuerpo TEXT,
    quedada_id UUID,
    estado TEXT DEFAULT 'enviado',
    error_mensaje TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_enviadas_user_id
ON notificaciones_enviadas(user_id);

CREATE INDEX IF NOT EXISTS idx_notificaciones_enviadas_tipo
ON notificaciones_enviadas(tipo);

CREATE INDEX IF NOT EXISTS idx_notificaciones_enviadas_created_at
ON notificaciones_enviadas(created_at DESC);

ALTER TABLE notificaciones_enviadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification history" ON notificaciones_enviadas;
CREATE POLICY "Users can view own notification history"
    ON notificaciones_enviadas
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON notificaciones_enviadas;
CREATE POLICY "Service role can insert notifications"
    ON notificaciones_enviadas
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read all notifications" ON notificaciones_enviadas;
CREATE POLICY "Service role can read all notifications"
    ON notificaciones_enviadas
    FOR SELECT
    TO service_role
    USING (true);

GRANT SELECT ON notificaciones_enviadas TO authenticated;
GRANT ALL ON notificaciones_enviadas TO service_role;

-- ============================================
-- FIN - Todas las tablas creadas
-- ============================================
