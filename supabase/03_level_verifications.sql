-- ============================================
-- TABLA: level_verifications
-- Sistema de verificacion de nivel de usuarios
-- ============================================

-- Crear tabla de verificaciones de nivel
CREATE TABLE IF NOT EXISTS level_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL, -- 'strava_screenshot', 'race_photo', 'strava_link'
    evidence_url TEXT, -- URL de imagen subida o link de Strava
    claimed_level TEXT NOT NULL, -- Nivel que el usuario reclama (Principiante, Intermedio, Avanzado, Elite)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_level_verifications_user_id ON level_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_level_verifications_status ON level_verifications(status);

-- RLS (Row Level Security)
ALTER TABLE level_verifications ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios pueden ver sus propias verificaciones
CREATE POLICY "Users can view own verifications" ON level_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Politica: usuarios pueden crear verificaciones para si mismos
CREATE POLICY "Users can create own verifications" ON level_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politica: servicio puede gestionar todas las verificaciones
CREATE POLICY "Service can manage all verifications" ON level_verifications
    FOR ALL USING (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_level_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_level_verification_timestamp
    BEFORE UPDATE ON level_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_level_verification_timestamp();

-- ============================================
-- Anadir columnas de verificacion a profiles
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified_level') THEN
        ALTER TABLE profiles ADD COLUMN verified_level TEXT DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_badge') THEN
        ALTER TABLE profiles ADD COLUMN verification_badge BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ============================================
-- GRANT permisos
-- ============================================
GRANT ALL ON level_verifications TO authenticated;
GRANT SELECT ON level_verifications TO service_role;
