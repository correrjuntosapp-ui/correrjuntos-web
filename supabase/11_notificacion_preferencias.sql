-- ============================================
-- Tabla: notificacion_preferencias
-- Almacena preferencias granulares de notificaciones por usuario
-- ============================================

CREATE TABLE IF NOT EXISTS notificacion_preferencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Preferencias de tipos de notificación
    recordatorio_24h BOOLEAN DEFAULT true,
    recordatorio_1h BOOLEAN DEFAULT true,
    participante_se_une BOOLEAN DEFAULT true,
    nueva_quedada_ciudad BOOLEAN DEFAULT true,
    quedada_cancelada BOOLEAN DEFAULT true,

    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Un registro por usuario
    UNIQUE(user_id)
);

-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_notificacion_preferencias_user_id
ON notificacion_preferencias(user_id);

-- Trigger para actualizar updated_at
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

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE notificacion_preferencias ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver sus propias preferencias
CREATE POLICY "Users can view own notification preferences"
    ON notificacion_preferencias
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: usuarios pueden insertar sus propias preferencias
CREATE POLICY "Users can insert own notification preferences"
    ON notificacion_preferencias
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: usuarios pueden actualizar sus propias preferencias
CREATE POLICY "Users can update own notification preferences"
    ON notificacion_preferencias
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: usuarios pueden eliminar sus propias preferencias
CREATE POLICY "Users can delete own notification preferences"
    ON notificacion_preferencias
    FOR DELETE
    USING (auth.uid() = user_id);

-- Política: service role puede leer todas (para envío de notificaciones)
CREATE POLICY "Service role can read all notification preferences"
    ON notificacion_preferencias
    FOR SELECT
    TO service_role
    USING (true);

-- ============================================
-- Función para crear preferencias por defecto al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificacion_preferencias (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: crear preferencias automáticamente cuando se crea un usuario
DROP TRIGGER IF EXISTS trigger_create_notification_preferences ON auth.users;
CREATE TRIGGER trigger_create_notification_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();
