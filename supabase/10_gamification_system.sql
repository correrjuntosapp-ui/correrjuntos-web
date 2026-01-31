-- ============================================
-- GAMIFICATION SYSTEM - CorrerJuntos
-- Sistema de puntos, niveles y badges
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- PASO 1: Añadir columnas de gamificación a profiles
-- ============================================

-- Puntos totales y nivel
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS puntos_totales INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nivel_gamificacion TEXT DEFAULT 'Novato';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS racha_dias INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ultima_actividad DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quedadas_creadas INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quedadas_asistidas INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS valoraciones_dadas INTEGER DEFAULT 0;

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_puntos ON profiles(puntos_totales DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_nivel ON profiles(nivel_gamificacion);

-- ============================================
-- PASO 2: Tabla de historial de puntos
-- ============================================

CREATE TABLE IF NOT EXISTS puntos_historial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    puntos INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- 'crear_quedada', 'asistir', 'valorar', 'racha', 'badge'
    descripcion TEXT,
    referencia_id UUID, -- ID de la quedada o badge relacionado
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puntos_historial_user ON puntos_historial(user_id);
CREATE INDEX IF NOT EXISTS idx_puntos_historial_fecha ON puntos_historial(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_puntos_historial_tipo ON puntos_historial(tipo);

-- RLS para puntos_historial
ALTER TABLE puntos_historial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own points history" ON puntos_historial;
CREATE POLICY "Users can view own points history" ON puntos_historial
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert points" ON puntos_historial;
CREATE POLICY "System can insert points" ON puntos_historial
    FOR INSERT WITH CHECK (true);

GRANT SELECT ON puntos_historial TO authenticated;
GRANT INSERT ON puntos_historial TO authenticated;

-- ============================================
-- PASO 3: Tabla de badges/logros
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    icono TEXT DEFAULT '🏅',
    puntos_bonus INTEGER DEFAULT 0,
    requisito_tipo TEXT, -- 'quedadas_creadas', 'quedadas_asistidas', 'puntos', 'racha', 'valoraciones'
    requisito_valor INTEGER,
    categoria TEXT DEFAULT 'general', -- 'general', 'creador', 'social', 'constancia'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar badges predefinidos
INSERT INTO badges (codigo, nombre, descripcion, icono, puntos_bonus, requisito_tipo, requisito_valor, categoria) VALUES
-- Badges de creador
('primera_quedada', 'Organizador Novato', 'Crea tu primera quedada', '🎯', 50, 'quedadas_creadas', 1, 'creador'),
('cinco_quedadas', 'Organizador Activo', 'Crea 5 quedadas', '🎪', 100, 'quedadas_creadas', 5, 'creador'),
('diez_quedadas', 'Organizador Experto', 'Crea 10 quedadas', '🏟️', 200, 'quedadas_creadas', 10, 'creador'),
('veinticinco_quedadas', 'Líder de la Comunidad', 'Crea 25 quedadas', '👑', 500, 'quedadas_creadas', 25, 'creador'),

-- Badges de asistencia
('primera_asistencia', 'Runner Social', 'Asiste a tu primera quedada', '👟', 50, 'quedadas_asistidas', 1, 'social'),
('cinco_asistencias', 'Compañero Fiel', 'Asiste a 5 quedadas', '🤝', 100, 'quedadas_asistidas', 5, 'social'),
('diez_asistencias', 'Alma del Grupo', 'Asiste a 10 quedadas', '💪', 200, 'quedadas_asistidas', 10, 'social'),
('veinticinco_asistencias', 'Leyenda Runner', 'Asiste a 25 quedadas', '🏆', 500, 'quedadas_asistidas', 25, 'social'),

-- Badges de puntos
('cien_puntos', 'Centenario', 'Alcanza 100 puntos', '💯', 25, 'puntos', 100, 'general'),
('quinientos_puntos', 'Medio Millar', 'Alcanza 500 puntos', '🌟', 50, 'puntos', 500, 'general'),
('mil_puntos', 'Milenario', 'Alcanza 1000 puntos', '⭐', 100, 'puntos', 1000, 'general'),
('cinco_mil_puntos', 'Élite Runner', 'Alcanza 5000 puntos', '🔥', 250, 'puntos', 5000, 'general'),

-- Badges de racha
('racha_tres', 'Constante', '3 días seguidos activo', '📅', 30, 'racha', 3, 'constancia'),
('racha_siete', 'Semana Perfecta', '7 días seguidos activo', '🗓️', 75, 'racha', 7, 'constancia'),
('racha_treinta', 'Mes Imparable', '30 días seguidos activo', '📆', 300, 'racha', 30, 'constancia'),

-- Badges de valoraciones
('primera_valoracion', 'Crítico Constructivo', 'Da tu primera valoración', '📝', 25, 'valoraciones', 1, 'social'),
('diez_valoraciones', 'Evaluador Experto', 'Da 10 valoraciones', '🎖️', 100, 'valoraciones', 10, 'social')

ON CONFLICT (codigo) DO NOTHING;

-- RLS para badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges
    FOR SELECT USING (true);

GRANT SELECT ON badges TO authenticated;
GRANT SELECT ON badges TO anon;

-- ============================================
-- PASO 4: Tabla de badges desbloqueados por usuario
-- ============================================

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    notificado BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);

-- RLS para user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage user badges" ON user_badges;
CREATE POLICY "System can manage user badges" ON user_badges
    FOR ALL USING (true);

GRANT SELECT ON user_badges TO authenticated;
GRANT INSERT, UPDATE ON user_badges TO authenticated;

-- ============================================
-- PASO 5: Configuración de puntos
-- ============================================

-- Puntos por acción:
-- Crear quedada: 20 puntos
-- Asistir a quedada: 10 puntos
-- Dar valoración: 5 puntos
-- Racha diaria: 5 puntos por día
-- Bonus por badge: variable

-- ============================================
-- PASO 6: Función para calcular nivel según puntos
-- ============================================

CREATE OR REPLACE FUNCTION calcular_nivel(puntos INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN puntos < 100 THEN 'Novato'
        WHEN puntos < 300 THEN 'Principiante'
        WHEN puntos < 600 THEN 'Corredor'
        WHEN puntos < 1000 THEN 'Atleta'
        WHEN puntos < 2000 THEN 'Veterano'
        WHEN puntos < 5000 THEN 'Experto'
        WHEN puntos < 10000 THEN 'Maestro'
        ELSE 'Leyenda'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- PASO 7: Función para otorgar puntos
-- ============================================

CREATE OR REPLACE FUNCTION otorgar_puntos(
    p_user_id UUID,
    p_puntos INTEGER,
    p_tipo TEXT,
    p_descripcion TEXT DEFAULT NULL,
    p_referencia_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    nuevos_puntos INTEGER;
BEGIN
    -- Insertar en historial
    INSERT INTO puntos_historial (user_id, puntos, tipo, descripcion, referencia_id)
    VALUES (p_user_id, p_puntos, p_tipo, p_descripcion, p_referencia_id);

    -- Actualizar puntos totales y nivel
    UPDATE profiles
    SET
        puntos_totales = puntos_totales + p_puntos,
        nivel_gamificacion = calcular_nivel(puntos_totales + p_puntos),
        ultima_actividad = CURRENT_DATE
    WHERE id = p_user_id
    RETURNING puntos_totales INTO nuevos_puntos;

    -- Verificar badges de puntos
    PERFORM verificar_badges_puntos(p_user_id);

    RETURN nuevos_puntos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 8: Función para verificar y otorgar badges
-- ============================================

CREATE OR REPLACE FUNCTION verificar_badges_puntos(p_user_id UUID)
RETURNS void AS $$
DECLARE
    profile_record RECORD;
    badge_record RECORD;
BEGIN
    -- Obtener stats del usuario
    SELECT
        puntos_totales,
        quedadas_creadas,
        quedadas_asistidas,
        racha_dias,
        valoraciones_dadas
    INTO profile_record
    FROM profiles
    WHERE id = p_user_id;

    -- Verificar cada badge
    FOR badge_record IN SELECT * FROM badges LOOP
        -- Si el usuario ya tiene este badge, saltar
        IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = badge_record.id) THEN
            CONTINUE;
        END IF;

        -- Verificar si cumple el requisito
        IF (badge_record.requisito_tipo = 'puntos' AND profile_record.puntos_totales >= badge_record.requisito_valor) OR
           (badge_record.requisito_tipo = 'quedadas_creadas' AND profile_record.quedadas_creadas >= badge_record.requisito_valor) OR
           (badge_record.requisito_tipo = 'quedadas_asistidas' AND profile_record.quedadas_asistidas >= badge_record.requisito_valor) OR
           (badge_record.requisito_tipo = 'racha' AND profile_record.racha_dias >= badge_record.requisito_valor) OR
           (badge_record.requisito_tipo = 'valoraciones' AND profile_record.valoraciones_dadas >= badge_record.requisito_valor) THEN

            -- Otorgar badge
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (p_user_id, badge_record.id)
            ON CONFLICT (user_id, badge_id) DO NOTHING;

            -- Otorgar puntos bonus del badge
            IF badge_record.puntos_bonus > 0 THEN
                INSERT INTO puntos_historial (user_id, puntos, tipo, descripcion, referencia_id)
                VALUES (p_user_id, badge_record.puntos_bonus, 'badge', 'Badge: ' || badge_record.nombre, badge_record.id);

                UPDATE profiles
                SET puntos_totales = puntos_totales + badge_record.puntos_bonus
                WHERE id = p_user_id;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 9: Trigger para puntos al crear quedada
-- ============================================

CREATE OR REPLACE FUNCTION trigger_puntos_crear_quedada()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo para quedadas no-seed
    IF NEW.es_seed = FALSE OR NEW.es_seed IS NULL THEN
        -- Otorgar 20 puntos
        PERFORM otorgar_puntos(
            NEW.creador_id,
            20,
            'crear_quedada',
            'Crear quedada: ' || NEW.titulo,
            NEW.id
        );

        -- Incrementar contador
        UPDATE profiles
        SET quedadas_creadas = quedadas_creadas + 1
        WHERE id = NEW.creador_id;

        -- Verificar badges
        PERFORM verificar_badges_puntos(NEW.creador_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_puntos_crear_quedada ON quedadas;
CREATE TRIGGER trigger_puntos_crear_quedada
    AFTER INSERT ON quedadas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_puntos_crear_quedada();

-- ============================================
-- PASO 10: Trigger para puntos al unirse a quedada
-- ============================================

CREATE OR REPLACE FUNCTION trigger_puntos_unirse_quedada()
RETURNS TRIGGER AS $$
DECLARE
    es_quedada_seed BOOLEAN;
BEGIN
    -- Verificar si la quedada es seed
    SELECT es_seed INTO es_quedada_seed
    FROM quedadas
    WHERE id = NEW.quedada_id;

    -- Solo para participaciones no-seed en quedadas no-seed
    IF (NEW.es_seed = FALSE OR NEW.es_seed IS NULL) AND (es_quedada_seed = FALSE OR es_quedada_seed IS NULL) THEN
        -- Otorgar 10 puntos
        PERFORM otorgar_puntos(
            NEW.user_id,
            10,
            'asistir',
            'Unirse a quedada',
            NEW.quedada_id
        );

        -- Incrementar contador
        UPDATE profiles
        SET quedadas_asistidas = quedadas_asistidas + 1
        WHERE id = NEW.user_id;

        -- Verificar badges
        PERFORM verificar_badges_puntos(NEW.user_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_puntos_unirse_quedada ON participantes;
CREATE TRIGGER trigger_puntos_unirse_quedada
    AFTER INSERT ON participantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_puntos_unirse_quedada();

-- ============================================
-- PASO 11: Trigger para puntos al dar valoración
-- ============================================

CREATE OR REPLACE FUNCTION trigger_puntos_valoracion()
RETURNS TRIGGER AS $$
BEGIN
    -- Otorgar 5 puntos al que da la valoración
    PERFORM otorgar_puntos(
        NEW.reviewer_id,
        5,
        'valorar',
        'Dar valoración',
        NEW.id
    );

    -- Incrementar contador
    UPDATE profiles
    SET valoraciones_dadas = valoraciones_dadas + 1
    WHERE id = NEW.reviewer_id;

    -- Verificar badges
    PERFORM verificar_badges_puntos(NEW.reviewer_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_puntos_valoracion ON organizer_reviews;
CREATE TRIGGER trigger_puntos_valoracion
    AFTER INSERT ON organizer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_puntos_valoracion();

-- ============================================
-- PASO 12: Función para obtener ranking semanal
-- ============================================

CREATE OR REPLACE FUNCTION get_ranking_semanal(limite INTEGER DEFAULT 10)
RETURNS TABLE(
    posicion BIGINT,
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    puntos_semana BIGINT,
    puntos_totales INTEGER,
    nivel TEXT,
    ciudad TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ph.puntos), 0) DESC) as posicion,
        p.id as user_id,
        p.nombre,
        p.apellidos,
        p.photo_url,
        COALESCE(SUM(ph.puntos), 0) as puntos_semana,
        p.puntos_totales,
        p.nivel_gamificacion as nivel,
        p.ciudad
    FROM profiles p
    LEFT JOIN puntos_historial ph ON p.id = ph.user_id
        AND ph.created_at >= NOW() - INTERVAL '7 days'
    WHERE p.es_seed = FALSE OR p.es_seed IS NULL
    GROUP BY p.id, p.nombre, p.apellidos, p.photo_url, p.puntos_totales, p.nivel_gamificacion, p.ciudad
    ORDER BY puntos_semana DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 13: Función para obtener stats de usuario
-- ============================================

CREATE OR REPLACE FUNCTION get_user_gamification_stats(p_user_id UUID)
RETURNS TABLE(
    puntos_totales INTEGER,
    nivel TEXT,
    quedadas_creadas INTEGER,
    quedadas_asistidas INTEGER,
    valoraciones_dadas INTEGER,
    racha_dias INTEGER,
    badges_count BIGINT,
    posicion_ranking BIGINT,
    puntos_semana BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.puntos_totales,
        p.nivel_gamificacion as nivel,
        p.quedadas_creadas,
        p.quedadas_asistidas,
        p.valoraciones_dadas,
        p.racha_dias,
        (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = p_user_id) as badges_count,
        (SELECT pos FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY puntos_totales DESC) as pos
            FROM profiles WHERE es_seed = FALSE OR es_seed IS NULL
        ) ranked WHERE id = p_user_id) as posicion_ranking,
        (SELECT COALESCE(SUM(ph.puntos), 0) FROM puntos_historial ph
         WHERE ph.user_id = p_user_id AND ph.created_at >= NOW() - INTERVAL '7 days') as puntos_semana
    FROM profiles p
    WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 14: Función para obtener badges del usuario
-- ============================================

CREATE OR REPLACE FUNCTION get_user_badges(p_user_id UUID)
RETURNS TABLE(
    badge_id UUID,
    codigo TEXT,
    nombre TEXT,
    descripcion TEXT,
    icono TEXT,
    categoria TEXT,
    unlocked BOOLEAN,
    unlocked_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id as badge_id,
        b.codigo,
        b.nombre,
        b.descripcion,
        b.icono,
        b.categoria,
        (ub.id IS NOT NULL) as unlocked,
        ub.unlocked_at
    FROM badges b
    LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = p_user_id
    ORDER BY
        CASE WHEN ub.id IS NOT NULL THEN 0 ELSE 1 END,
        ub.unlocked_at DESC,
        b.requisito_valor ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PERMISOS
-- ============================================

GRANT EXECUTE ON FUNCTION calcular_nivel(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION otorgar_puntos(UUID, INTEGER, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_badges_puntos(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ranking_semanal(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ranking_semanal(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_user_gamification_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_badges(UUID) TO authenticated;

-- ============================================
-- INICIALIZAR PUNTOS PARA USUARIOS EXISTENTES
-- ============================================

-- Calcular puntos retroactivos para quedadas creadas
UPDATE profiles p
SET quedadas_creadas = (
    SELECT COUNT(*) FROM quedadas q
    WHERE q.creador_id = p.id AND (q.es_seed = FALSE OR q.es_seed IS NULL)
);

-- Calcular puntos retroactivos para asistencias
UPDATE profiles p
SET quedadas_asistidas = (
    SELECT COUNT(*) FROM participantes pa
    JOIN quedadas q ON pa.quedada_id = q.id
    WHERE pa.user_id = p.id
    AND (pa.es_seed = FALSE OR pa.es_seed IS NULL)
    AND (q.es_seed = FALSE OR q.es_seed IS NULL)
);

-- Calcular puntos totales iniciales
UPDATE profiles
SET puntos_totales = (quedadas_creadas * 20) + (quedadas_asistidas * 10),
    nivel_gamificacion = calcular_nivel((quedadas_creadas * 20) + (quedadas_asistidas * 10))
WHERE es_seed = FALSE OR es_seed IS NULL;

-- Verificar badges para todos los usuarios existentes
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM profiles WHERE es_seed = FALSE OR es_seed IS NULL LOOP
        PERFORM verificar_badges_puntos(user_record.id);
    END LOOP;
END $$;
