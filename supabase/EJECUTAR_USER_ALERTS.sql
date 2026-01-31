-- ============================================
-- SCRIPT PARA CREAR TABLA DE ALERTAS DE USUARIO
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Crear tabla de alertas
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}',
    notifications JSONB NOT NULL DEFAULT '{"push": true, "email": false}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_triggered TIMESTAMPTZ
);

-- 2. Índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_active ON user_alerts(is_active) WHERE is_active = true;

-- 3. RLS (Row Level Security)
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view own alerts" ON user_alerts;
CREATE POLICY "Users can view own alerts" ON user_alerts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own alerts" ON user_alerts;
CREATE POLICY "Users can create own alerts" ON user_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON user_alerts;
CREATE POLICY "Users can update own alerts" ON user_alerts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON user_alerts;
CREATE POLICY "Users can delete own alerts" ON user_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Permisos
GRANT ALL ON user_alerts TO authenticated;

-- ============================================
-- VERIFICACIÓN: Ejecutar para ver estructura
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_alerts';
