-- ============================================
-- Tabla: notificaciones_enviadas
-- Registro de auditoría de todas las notificaciones enviadas
-- ============================================

CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Información de la notificación
    tipo TEXT NOT NULL,  -- recordatorio_24h, recordatorio_1h, participante_se_une, etc.
    titulo TEXT NOT NULL,
    cuerpo TEXT,

    -- Contexto relacionado
    quedada_id UUID REFERENCES quedadas(id) ON DELETE SET NULL,

    -- Estado del envío
    estado TEXT DEFAULT 'enviado',  -- enviado, fallido, pendiente
    error_mensaje TEXT,

    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas comunes
CREATE INDEX IF NOT EXISTS idx_notificaciones_enviadas_user_id
ON notificaciones_enviadas(user_id);

CREATE INDEX IF NOT EXISTS idx_notificaciones_enviadas_tipo
ON notificaciones_enviadas(tipo);

CREATE INDEX IF NOT EXISTS idx_notificaciones_enviadas_quedada_id
ON notificaciones_enviadas(quedada_id);

CREATE INDEX IF NOT EXISTS idx_notificaciones_enviadas_created_at
ON notificaciones_enviadas(created_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE notificaciones_enviadas ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver su historial de notificaciones
CREATE POLICY "Users can view own notification history"
    ON notificaciones_enviadas
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: service role puede insertar (para la edge function)
CREATE POLICY "Service role can insert notifications"
    ON notificaciones_enviadas
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Política: service role puede leer todas
CREATE POLICY "Service role can read all notifications"
    ON notificaciones_enviadas
    FOR SELECT
    TO service_role
    USING (true);

-- ============================================
-- Función para limpiar notificaciones antiguas (>30 días)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notificaciones_enviadas
    WHERE created_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
