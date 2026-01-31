-- ============================================
-- TABLA: quedadas
-- Políticas RLS para la tabla de quedadas
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- Si la tabla ya existe, solo habilitamos RLS y creamos políticas
-- Si no existe, la creamos primero

-- Crear tabla quedadas (si no existe)
CREATE TABLE IF NOT EXISTS quedadas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    ciudad TEXT,
    ubicacion TEXT,
    direccion TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    nivel TEXT DEFAULT 'Todos los niveles',
    distancia TEXT,
    ritmo TEXT,
    descripcion TEXT,
    creador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla participantes (si no existe)
CREATE TABLE IF NOT EXISTS participantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quedada_id UUID NOT NULL REFERENCES quedadas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quedada_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quedadas_fecha ON quedadas(fecha);
CREATE INDEX IF NOT EXISTS idx_quedadas_creador ON quedadas(creador_id);
CREATE INDEX IF NOT EXISTS idx_quedadas_ciudad ON quedadas(ciudad);
CREATE INDEX IF NOT EXISTS idx_quedadas_location ON quedadas(lat, lng);
CREATE INDEX IF NOT EXISTS idx_participantes_quedada ON participantes(quedada_id);
CREATE INDEX IF NOT EXISTS idx_participantes_user ON participantes(user_id);

-- ============================================
-- RLS (Row Level Security) para QUEDADAS
-- ============================================
ALTER TABLE quedadas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Anyone can view quedadas" ON quedadas;
DROP POLICY IF EXISTS "Authenticated users can create quedadas" ON quedadas;
DROP POLICY IF EXISTS "Users can update own quedadas" ON quedadas;
DROP POLICY IF EXISTS "Users can delete own quedadas" ON quedadas;

-- Política: Cualquiera puede ver quedadas (lectura pública)
CREATE POLICY "Anyone can view quedadas" ON quedadas
    FOR SELECT USING (true);

-- Política: Usuarios autenticados pueden crear quedadas
CREATE POLICY "Authenticated users can create quedadas" ON quedadas
    FOR INSERT WITH CHECK (auth.uid() = creador_id);

-- Política: Solo el creador puede actualizar su quedada
CREATE POLICY "Users can update own quedadas" ON quedadas
    FOR UPDATE USING (auth.uid() = creador_id);

-- Política: Solo el creador puede eliminar su quedada
CREATE POLICY "Users can delete own quedadas" ON quedadas
    FOR DELETE USING (auth.uid() = creador_id);

-- ============================================
-- RLS (Row Level Security) para PARTICIPANTES
-- ============================================
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Anyone can view participants" ON participantes;
DROP POLICY IF EXISTS "Authenticated users can join quedadas" ON participantes;
DROP POLICY IF EXISTS "Users can leave quedadas" ON participantes;
DROP POLICY IF EXISTS "Creators can manage participants" ON participantes;

-- Política: Cualquiera puede ver participantes
CREATE POLICY "Anyone can view participants" ON participantes
    FOR SELECT USING (true);

-- Política: Usuarios autenticados pueden apuntarse a quedadas
CREATE POLICY "Authenticated users can join quedadas" ON participantes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios pueden desapuntarse de quedadas
CREATE POLICY "Users can leave quedadas" ON participantes
    FOR DELETE USING (auth.uid() = user_id);

-- Política: El creador de la quedada puede gestionar participantes
CREATE POLICY "Creators can manage participants" ON participantes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM quedadas q
            WHERE q.id = participantes.quedada_id
            AND q.creador_id = auth.uid()
        )
    );

-- ============================================
-- GRANT permisos
-- ============================================
GRANT ALL ON quedadas TO authenticated;
GRANT SELECT ON quedadas TO anon;
GRANT ALL ON participantes TO authenticated;
GRANT SELECT ON participantes TO anon;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_quedada_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_quedada_timestamp ON quedadas;
CREATE TRIGGER trigger_update_quedada_timestamp
    BEFORE UPDATE ON quedadas
    FOR EACH ROW
    EXECUTE FUNCTION update_quedada_timestamp();
