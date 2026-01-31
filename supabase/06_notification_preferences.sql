-- ============================================
-- Preferencias de notificaciones en profiles
-- ============================================

-- Añadir columnas de preferencias de notificación
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_distance_km INTEGER DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_levels TEXT[] DEFAULT ARRAY['Todos'];

-- Índice para búsquedas por preferencias
CREATE INDEX IF NOT EXISTS idx_profiles_notif_distance ON profiles(notif_distance_km);
