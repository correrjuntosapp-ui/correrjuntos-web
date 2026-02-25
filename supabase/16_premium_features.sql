-- ============================================================
-- PREMIUM FEATURES: Nuevas columnas para funciones Premium
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Quedadas privadas
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS access_code text;

-- 2. Quedadas recurrentes
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS recurrence text; -- 'weekly', 'biweekly', 'monthly'
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS recurrence_parent_id uuid REFERENCES quedadas(id) ON DELETE SET NULL;

-- 3. Ruta GPS (array de coordenadas para polyline en mapa)
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS ruta_coords jsonb; -- [{lat: number, lng: number}]

-- 4. Post-run tracking (registro después de la quedada)
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS ritmo_real text;
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS distancia_real numeric;
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS valoracion_esfuerzo integer CHECK (valoracion_esfuerzo >= 1 AND valoracion_esfuerzo <= 10);
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS notas_post text;
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- 5. Alertas de nuevas quedadas (preferencias en perfil)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alert_new_quedadas boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alert_radius_km integer DEFAULT 25;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_quedadas_is_private ON quedadas(is_private) WHERE is_private = true;
CREATE INDEX IF NOT EXISTS idx_quedadas_recurrence ON quedadas(recurrence) WHERE recurrence IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_participantes_completed ON participantes(completed_at) WHERE completed_at IS NOT NULL;

-- RLS: Las quedadas privadas solo son visibles para participantes o con código
-- (La lógica de filtrado se hace en el frontend para simplificar)

-- Actualizar la función de limpieza para no borrar recurrentes
-- (Las quedadas recurrentes generan nuevas instancias automáticamente)

COMMENT ON COLUMN quedadas.is_private IS 'Premium: Quedada solo accesible con código de acceso';
COMMENT ON COLUMN quedadas.access_code IS 'Código para unirse a quedadas privadas';
COMMENT ON COLUMN quedadas.recurrence IS 'Frecuencia de repetición: weekly, biweekly, monthly';
COMMENT ON COLUMN quedadas.ruta_coords IS 'Coordenadas GPS de la ruta [{lat, lng}]';
COMMENT ON COLUMN participantes.ritmo_real IS 'Ritmo real registrado post-quedada (ej: 5:30 min/km)';
COMMENT ON COLUMN participantes.distancia_real IS 'Distancia real en km registrada post-quedada';
COMMENT ON COLUMN participantes.valoracion_esfuerzo IS 'Esfuerzo percibido 1-10';
COMMENT ON COLUMN participantes.notas_post IS 'Notas del runner post-quedada';
