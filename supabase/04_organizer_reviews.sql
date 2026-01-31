-- ============================================
-- TABLA: organizer_reviews
-- Sistema de resenas y confianza de organizadores
-- ============================================

-- Crear tabla de resenas de organizadores
CREATE TABLE IF NOT EXISTS organizer_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quedada_id UUID NOT NULL REFERENCES quedadas(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quedada_id, reviewer_id) -- Solo una resena por quedada por usuario
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_organizer_reviews_organizer_id ON organizer_reviews(organizer_id);
CREATE INDEX IF NOT EXISTS idx_organizer_reviews_reviewer_id ON organizer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_organizer_reviews_quedada_id ON organizer_reviews(quedada_id);

-- RLS (Row Level Security)
ALTER TABLE organizer_reviews ENABLE ROW LEVEL SECURITY;

-- Politica: todos pueden ver las resenas (son publicas)
CREATE POLICY "Anyone can view reviews" ON organizer_reviews
    FOR SELECT USING (true);

-- Politica: usuarios autenticados pueden crear resenas
CREATE POLICY "Authenticated users can create reviews" ON organizer_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Politica: usuarios pueden eliminar sus propias resenas
CREATE POLICY "Users can delete own reviews" ON organizer_reviews
    FOR DELETE USING (auth.uid() = reviewer_id);

-- ============================================
-- Anadir columnas de rating a profiles
-- ============================================
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
END $$;

-- ============================================
-- Funcion para recalcular rating del organizador
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_organizer_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(2,1);
    review_count INTEGER;
BEGIN
    -- Calcular promedio y conteo para el organizador
    SELECT
        ROUND(AVG(rating)::numeric, 1),
        COUNT(*)
    INTO avg_rating, review_count
    FROM organizer_reviews
    WHERE organizer_id = COALESCE(NEW.organizer_id, OLD.organizer_id);

    -- Actualizar el perfil del organizador
    UPDATE profiles
    SET
        organizer_rating = avg_rating,
        total_reviews = review_count
    WHERE id = COALESCE(NEW.organizer_id, OLD.organizer_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar rating despues de INSERT
CREATE TRIGGER trigger_recalculate_rating_insert
    AFTER INSERT ON organizer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_organizer_rating();

-- Trigger para actualizar rating despues de UPDATE
CREATE TRIGGER trigger_recalculate_rating_update
    AFTER UPDATE ON organizer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_organizer_rating();

-- Trigger para actualizar rating despues de DELETE
CREATE TRIGGER trigger_recalculate_rating_delete
    AFTER DELETE ON organizer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_organizer_rating();

-- ============================================
-- Funcion para contar quedadas organizadas
-- Se ejecuta cuando se crea una nueva quedada
-- ============================================
CREATE OR REPLACE FUNCTION update_total_organized()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles
        SET total_organized = (
            SELECT COUNT(*) FROM quedadas WHERE creador_id = NEW.creador_id
        )
        WHERE id = NEW.creador_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles
        SET total_organized = (
            SELECT COUNT(*) FROM quedadas WHERE creador_id = OLD.creador_id
        )
        WHERE id = OLD.creador_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para contar quedadas organizadas
CREATE TRIGGER trigger_update_total_organized
    AFTER INSERT OR DELETE ON quedadas
    FOR EACH ROW
    EXECUTE FUNCTION update_total_organized();

-- ============================================
-- GRANT permisos
-- ============================================
GRANT ALL ON organizer_reviews TO authenticated;
GRANT SELECT ON organizer_reviews TO anon;
