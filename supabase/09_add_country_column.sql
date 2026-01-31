-- ============================================
-- ADD COUNTRY COLUMN TO QUEDADAS
-- Para hacer la app mundial con filtrado por país
-- ============================================

-- Añadir columna pais a la tabla quedadas
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'ES';

-- Crear índice para búsquedas rápidas por país
CREATE INDEX IF NOT EXISTS idx_quedadas_pais ON quedadas(pais);

-- Actualizar quedadas existentes (todas son de España actualmente)
UPDATE quedadas SET pais = 'ES' WHERE pais IS NULL;

-- Comentario para documentación
COMMENT ON COLUMN quedadas.pais IS 'Código de país ISO 2 letras (ES, MX, AR, CO, PE, CL, etc.)';
