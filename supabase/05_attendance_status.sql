-- ============================================
-- TABLA: participantes - Añadir estado de asistencia
-- Estados: interested (interesado), confirmed (confirmado), maybe (posiblemente)
-- ============================================

-- Añadir columna de estado a participantes
ALTER TABLE participantes
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed'
CHECK (status IN ('interested', 'confirmed', 'maybe'));

-- Crear índice para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_participantes_status ON participantes(status);

-- Actualizar registros existentes a 'confirmed' (ya estaban apuntados = confirmados)
UPDATE participantes SET status = 'confirmed' WHERE status IS NULL;
