-- ============================================
-- SCRIPT PARA ACTIVAR BADGES DE ORGANIZADORES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Asegurar que existen las columnas en profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organizer_rating') THEN
        ALTER TABLE profiles ADD COLUMN organizer_rating DECIMAL(2,1) DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_reviews') THEN
        ALTER TABLE profiles ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_organized') THEN
        ALTER TABLE profiles ADD COLUMN total_organized INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_badge') THEN
        ALTER TABLE profiles ADD COLUMN verification_badge BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Calcular total_organized para cada usuario
UPDATE profiles p
SET total_organized = (
    SELECT COUNT(*)
    FROM quedadas q
    WHERE q.creador_id = p.id
    AND q.es_seed IS NOT TRUE
);

-- 3. Crear tabla de reseñas si no existe
CREATE TABLE IF NOT EXISTS organizer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quedada_id UUID REFERENCES quedadas(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, quedada_id)
);

-- Índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_organizer_reviews_organizer ON organizer_reviews(organizer_id);
CREATE INDEX IF NOT EXISTS idx_organizer_reviews_quedada ON organizer_reviews(quedada_id);

-- RLS para reseñas
ALTER TABLE organizer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all reviews" ON organizer_reviews;
CREATE POLICY "Users can view all reviews" ON organizer_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON organizer_reviews;
CREATE POLICY "Users can create reviews" ON organizer_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON organizer_reviews;
CREATE POLICY "Users can update own reviews" ON organizer_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON organizer_reviews;
CREATE POLICY "Users can delete own reviews" ON organizer_reviews
    FOR DELETE USING (auth.uid() = reviewer_id);

-- 4. Función para recalcular rating de organizador
CREATE OR REPLACE FUNCTION recalculate_organizer_rating()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    avg_rating DECIMAL(2,1);
    review_count INTEGER;
BEGIN
    -- Obtener el organizer_id según la operación
    IF TG_OP = 'DELETE' THEN
        org_id := OLD.organizer_id;
    ELSE
        org_id := NEW.organizer_id;
    END IF;

    -- Calcular promedio y total
    SELECT
        ROUND(AVG(rating)::DECIMAL, 1),
        COUNT(*)
    INTO avg_rating, review_count
    FROM organizer_reviews
    WHERE organizer_id = org_id;

    -- Actualizar perfil del organizador
    UPDATE profiles
    SET
        organizer_rating = avg_rating,
        total_reviews = review_count
    WHERE id = org_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Triggers para actualizar rating automáticamente
DROP TRIGGER IF EXISTS trigger_review_insert ON organizer_reviews;
CREATE TRIGGER trigger_review_insert
    AFTER INSERT ON organizer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_organizer_rating();

DROP TRIGGER IF EXISTS trigger_review_update ON organizer_reviews;
CREATE TRIGGER trigger_review_update
    AFTER UPDATE ON organizer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_organizer_rating();

DROP TRIGGER IF EXISTS trigger_review_delete ON organizer_reviews;
CREATE TRIGGER trigger_review_delete
    AFTER DELETE ON organizer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_organizer_rating();

-- 6. Función para actualizar total_organized cuando se crea/elimina quedada
CREATE OR REPLACE FUNCTION update_total_organized()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles
        SET total_organized = (
            SELECT COUNT(*) FROM quedadas WHERE creador_id = NEW.creador_id AND es_seed IS NOT TRUE
        )
        WHERE id = NEW.creador_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles
        SET total_organized = (
            SELECT COUNT(*) FROM quedadas WHERE creador_id = OLD.creador_id AND es_seed IS NOT TRUE
        )
        WHERE id = OLD.creador_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_total_organized ON quedadas;
CREATE TRIGGER trigger_update_total_organized
    AFTER INSERT OR DELETE ON quedadas
    FOR EACH ROW
    EXECUTE FUNCTION update_total_organized();

-- 7. Permisos
GRANT SELECT ON organizer_reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON organizer_reviews TO authenticated;

-- ============================================
-- VERIFICACIÓN: Ejecutar después para ver resultados
-- ============================================
-- SELECT id, nombre, total_organized, organizer_rating, total_reviews, verification_badge
-- FROM profiles
-- WHERE total_organized > 0
-- ORDER BY total_organized DESC;
