-- ============================================
-- SOCIAL SYSTEM - CorrerJuntos
-- Sistema de seguidores, feed de actividad y rankings
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- PASO 1: Tabla de seguidores
-- ============================================

CREATE TABLE IF NOT EXISTS seguidores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indices para busquedas rapidas
CREATE INDEX IF NOT EXISTS idx_seguidores_follower ON seguidores(follower_id);
CREATE INDEX IF NOT EXISTS idx_seguidores_following ON seguidores(following_id);
CREATE INDEX IF NOT EXISTS idx_seguidores_created ON seguidores(created_at DESC);

-- RLS
ALTER TABLE seguidores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all followers" ON seguidores;
CREATE POLICY "Users can view all followers" ON seguidores
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON seguidores;
CREATE POLICY "Users can follow others" ON seguidores
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON seguidores;
CREATE POLICY "Users can unfollow" ON seguidores
    FOR DELETE USING (auth.uid() = follower_id);

GRANT SELECT, INSERT, DELETE ON seguidores TO authenticated;

-- ============================================
-- PASO 2: Tabla de actividad (feed)
-- ============================================

CREATE TABLE IF NOT EXISTS actividad_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'crear_quedada', 'unirse_quedada', 'badge', 'nivel', 'seguir'
    titulo TEXT NOT NULL,
    descripcion TEXT,
    referencia_id UUID, -- ID de quedada, badge, etc
    referencia_tipo TEXT, -- 'quedada', 'badge', 'user'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actividad_user ON actividad_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_actividad_created ON actividad_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actividad_tipo ON actividad_feed(tipo);

-- RLS
ALTER TABLE actividad_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activity" ON actividad_feed;
CREATE POLICY "Users can view activity" ON actividad_feed
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert activity" ON actividad_feed;
CREATE POLICY "System can insert activity" ON actividad_feed
    FOR INSERT WITH CHECK (true);

GRANT SELECT ON actividad_feed TO authenticated;
GRANT INSERT ON actividad_feed TO authenticated;

-- ============================================
-- PASO 3: Actualizar profiles con contadores sociales
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seguidores_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS siguiendo_count INTEGER DEFAULT 0;

-- ============================================
-- PASO 4: Funcion para seguir usuario
-- ============================================

CREATE OR REPLACE FUNCTION seguir_usuario(p_following_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_follower_id UUID;
BEGIN
    v_follower_id := auth.uid();

    -- No seguirse a si mismo
    IF v_follower_id = p_following_id THEN
        RETURN FALSE;
    END IF;

    -- Insertar seguimiento
    INSERT INTO seguidores (follower_id, following_id)
    VALUES (v_follower_id, p_following_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    -- Actualizar contadores
    UPDATE profiles SET siguiendo_count = siguiendo_count + 1 WHERE id = v_follower_id;
    UPDATE profiles SET seguidores_count = seguidores_count + 1 WHERE id = p_following_id;

    -- Registrar actividad
    INSERT INTO actividad_feed (user_id, tipo, titulo, descripcion, referencia_id, referencia_tipo)
    SELECT
        v_follower_id,
        'seguir',
        'Nuevo seguidor',
        (SELECT nombre FROM profiles WHERE id = v_follower_id) || ' ahora sigue a ' || (SELECT nombre FROM profiles WHERE id = p_following_id),
        p_following_id,
        'user';

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 5: Funcion para dejar de seguir
-- ============================================

CREATE OR REPLACE FUNCTION dejar_de_seguir(p_following_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_follower_id UUID;
BEGIN
    v_follower_id := auth.uid();

    -- Eliminar seguimiento
    DELETE FROM seguidores
    WHERE follower_id = v_follower_id AND following_id = p_following_id;

    IF FOUND THEN
        -- Actualizar contadores
        UPDATE profiles SET siguiendo_count = GREATEST(0, siguiendo_count - 1) WHERE id = v_follower_id;
        UPDATE profiles SET seguidores_count = GREATEST(0, seguidores_count - 1) WHERE id = p_following_id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 6: Funcion para obtener feed de amigos
-- ============================================

CREATE OR REPLACE FUNCTION get_feed_amigos(p_limite INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    user_nombre TEXT,
    user_photo TEXT,
    tipo TEXT,
    titulo TEXT,
    descripcion TEXT,
    referencia_id UUID,
    referencia_tipo TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        af.id,
        af.user_id,
        p.nombre as user_nombre,
        p.photo_url as user_photo,
        af.tipo,
        af.titulo,
        af.descripcion,
        af.referencia_id,
        af.referencia_tipo,
        af.metadata,
        af.created_at
    FROM actividad_feed af
    JOIN profiles p ON af.user_id = p.id
    WHERE af.user_id IN (
        SELECT following_id FROM seguidores WHERE follower_id = auth.uid()
    )
    OR af.user_id = auth.uid()
    ORDER BY af.created_at DESC
    LIMIT p_limite
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 7: Funcion para obtener seguidores de un usuario
-- ============================================

CREATE OR REPLACE FUNCTION get_seguidores(p_user_id UUID, p_limite INTEGER DEFAULT 50)
RETURNS TABLE(
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    nivel TEXT,
    ciudad TEXT,
    is_following BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as user_id,
        p.nombre,
        p.apellidos,
        p.photo_url,
        p.nivel_gamificacion as nivel,
        p.ciudad,
        EXISTS(SELECT 1 FROM seguidores s2 WHERE s2.follower_id = auth.uid() AND s2.following_id = p.id) as is_following,
        s.created_at
    FROM seguidores s
    JOIN profiles p ON s.follower_id = p.id
    WHERE s.following_id = p_user_id
    ORDER BY s.created_at DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 8: Funcion para obtener a quien sigue un usuario
-- ============================================

CREATE OR REPLACE FUNCTION get_siguiendo(p_user_id UUID, p_limite INTEGER DEFAULT 50)
RETURNS TABLE(
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    nivel TEXT,
    ciudad TEXT,
    is_following BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as user_id,
        p.nombre,
        p.apellidos,
        p.photo_url,
        p.nivel_gamificacion as nivel,
        p.ciudad,
        TRUE as is_following,
        s.created_at
    FROM seguidores s
    JOIN profiles p ON s.following_id = p.id
    WHERE s.follower_id = p_user_id
    ORDER BY s.created_at DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 9: Ranking mensual
-- ============================================

CREATE OR REPLACE FUNCTION get_ranking_mensual(p_limite INTEGER DEFAULT 20)
RETURNS TABLE(
    posicion BIGINT,
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    puntos_mes BIGINT,
    puntos_totales INTEGER,
    nivel TEXT,
    ciudad TEXT,
    quedadas_mes BIGINT,
    es_premium BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ph.puntos), 0) DESC) as posicion,
        p.id as user_id,
        p.nombre,
        p.apellidos,
        p.photo_url,
        COALESCE(SUM(ph.puntos), 0) as puntos_mes,
        p.puntos_totales,
        p.nivel_gamificacion as nivel,
        p.ciudad,
        (SELECT COUNT(*) FROM participantes pa
         JOIN quedadas q ON pa.quedada_id = q.id
         WHERE pa.user_id = p.id
         AND pa.created_at >= DATE_TRUNC('month', NOW())
         AND (q.es_seed = FALSE OR q.es_seed IS NULL)) as quedadas_mes,
        COALESCE(p.es_premium, FALSE) as es_premium
    FROM profiles p
    LEFT JOIN puntos_historial ph ON p.id = ph.user_id
        AND ph.created_at >= DATE_TRUNC('month', NOW())
    WHERE (p.es_seed = FALSE OR p.es_seed IS NULL)
    GROUP BY p.id, p.nombre, p.apellidos, p.photo_url, p.puntos_totales, p.nivel_gamificacion, p.ciudad, p.es_premium
    HAVING COALESCE(SUM(ph.puntos), 0) > 0
    ORDER BY puntos_mes DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 10: Ranking global (all-time)
-- ============================================

CREATE OR REPLACE FUNCTION get_ranking_global(p_limite INTEGER DEFAULT 20)
RETURNS TABLE(
    posicion BIGINT,
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    puntos_totales INTEGER,
    nivel TEXT,
    ciudad TEXT,
    quedadas_totales BIGINT,
    es_premium BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY p.puntos_totales DESC) as posicion,
        p.id as user_id,
        p.nombre,
        p.apellidos,
        p.photo_url,
        p.puntos_totales,
        p.nivel_gamificacion as nivel,
        p.ciudad,
        (p.quedadas_creadas + p.quedadas_asistidas)::BIGINT as quedadas_totales,
        COALESCE(p.es_premium, FALSE) as es_premium
    FROM profiles p
    WHERE (p.es_seed = FALSE OR p.es_seed IS NULL)
    AND p.puntos_totales > 0
    ORDER BY p.puntos_totales DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 11: Triggers para registrar actividad
-- ============================================

-- Trigger al crear quedada
CREATE OR REPLACE FUNCTION trigger_actividad_crear_quedada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_seed = FALSE OR NEW.es_seed IS NULL THEN
        INSERT INTO actividad_feed (user_id, tipo, titulo, descripcion, referencia_id, referencia_tipo, metadata)
        VALUES (
            NEW.creador_id,
            'crear_quedada',
            'Nueva quedada creada',
            NEW.titulo,
            NEW.id,
            'quedada',
            jsonb_build_object('ciudad', NEW.ciudad, 'fecha', NEW.fecha_hora, 'distancia', NEW.distancia_km)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_actividad_crear_quedada ON quedadas;
CREATE TRIGGER trigger_actividad_crear_quedada
    AFTER INSERT ON quedadas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actividad_crear_quedada();

-- Trigger al unirse a quedada
CREATE OR REPLACE FUNCTION trigger_actividad_unirse_quedada()
RETURNS TRIGGER AS $$
DECLARE
    v_quedada RECORD;
BEGIN
    SELECT * INTO v_quedada FROM quedadas WHERE id = NEW.quedada_id;

    IF (NEW.es_seed = FALSE OR NEW.es_seed IS NULL) AND (v_quedada.es_seed = FALSE OR v_quedada.es_seed IS NULL) THEN
        INSERT INTO actividad_feed (user_id, tipo, titulo, descripcion, referencia_id, referencia_tipo, metadata)
        VALUES (
            NEW.user_id,
            'unirse_quedada',
            'Se unio a una quedada',
            v_quedada.titulo,
            NEW.quedada_id,
            'quedada',
            jsonb_build_object('ciudad', v_quedada.ciudad, 'fecha', v_quedada.fecha_hora)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_actividad_unirse_quedada ON participantes;
CREATE TRIGGER trigger_actividad_unirse_quedada
    AFTER INSERT ON participantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actividad_unirse_quedada();

-- Trigger al obtener badge
CREATE OR REPLACE FUNCTION trigger_actividad_badge()
RETURNS TRIGGER AS $$
DECLARE
    v_badge RECORD;
BEGIN
    SELECT * INTO v_badge FROM badges WHERE id = NEW.badge_id;

    INSERT INTO actividad_feed (user_id, tipo, titulo, descripcion, referencia_id, referencia_tipo, metadata)
    VALUES (
        NEW.user_id,
        'badge',
        'Nuevo badge desbloqueado!',
        v_badge.nombre || ': ' || v_badge.descripcion,
        NEW.badge_id,
        'badge',
        jsonb_build_object('icono', v_badge.icono, 'categoria', v_badge.categoria)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_actividad_badge ON user_badges;
CREATE TRIGGER trigger_actividad_badge
    AFTER INSERT ON user_badges
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actividad_badge();

-- ============================================
-- PASO 12: Buscar usuarios para seguir
-- ============================================

CREATE OR REPLACE FUNCTION buscar_usuarios(p_query TEXT, p_limite INTEGER DEFAULT 20)
RETURNS TABLE(
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    nivel TEXT,
    ciudad TEXT,
    puntos_totales INTEGER,
    is_following BOOLEAN,
    seguidores_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as user_id,
        p.nombre,
        p.apellidos,
        p.photo_url,
        p.nivel_gamificacion as nivel,
        p.ciudad,
        p.puntos_totales,
        EXISTS(SELECT 1 FROM seguidores s WHERE s.follower_id = auth.uid() AND s.following_id = p.id) as is_following,
        p.seguidores_count
    FROM profiles p
    WHERE (p.es_seed = FALSE OR p.es_seed IS NULL)
    AND p.id != auth.uid()
    AND (
        p.nombre ILIKE '%' || p_query || '%'
        OR p.apellidos ILIKE '%' || p_query || '%'
        OR p.ciudad ILIKE '%' || p_query || '%'
    )
    ORDER BY p.puntos_totales DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 13: Usuarios sugeridos para seguir
-- ============================================

CREATE OR REPLACE FUNCTION get_usuarios_sugeridos(p_limite INTEGER DEFAULT 10)
RETURNS TABLE(
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    nivel TEXT,
    ciudad TEXT,
    puntos_totales INTEGER,
    seguidores_count INTEGER,
    razon TEXT
) AS $$
DECLARE
    v_user_city TEXT;
BEGIN
    -- Obtener ciudad del usuario actual
    SELECT ciudad INTO v_user_city FROM profiles WHERE id = auth.uid();

    RETURN QUERY
    SELECT DISTINCT ON (p.id)
        p.id as user_id,
        p.nombre,
        p.apellidos,
        p.photo_url,
        p.nivel_gamificacion as nivel,
        p.ciudad,
        p.puntos_totales,
        p.seguidores_count,
        CASE
            WHEN p.ciudad = v_user_city THEN 'En tu ciudad'
            WHEN p.puntos_totales > 500 THEN 'Top runner'
            ELSE 'Popular'
        END as razon
    FROM profiles p
    WHERE (p.es_seed = FALSE OR p.es_seed IS NULL)
    AND p.id != auth.uid()
    AND NOT EXISTS(SELECT 1 FROM seguidores s WHERE s.follower_id = auth.uid() AND s.following_id = p.id)
    ORDER BY p.id,
        CASE WHEN p.ciudad = v_user_city THEN 0 ELSE 1 END,
        p.seguidores_count DESC,
        p.puntos_totales DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PERMISOS
-- ============================================

GRANT EXECUTE ON FUNCTION seguir_usuario(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION dejar_de_seguir(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feed_amigos(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_seguidores(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_siguiendo(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ranking_mensual(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ranking_global(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION buscar_usuarios(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_usuarios_sugeridos(INTEGER) TO authenticated;

-- Permitir a usuarios anonimos ver rankings
GRANT EXECUTE ON FUNCTION get_ranking_mensual(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_ranking_global(INTEGER) TO anon;

-- ============================================
-- INICIALIZAR CONTADORES
-- ============================================

-- Actualizar contadores de seguidores existentes (por si acaso)
UPDATE profiles p
SET seguidores_count = (SELECT COUNT(*) FROM seguidores s WHERE s.following_id = p.id);

UPDATE profiles p
SET siguiendo_count = (SELECT COUNT(*) FROM seguidores s WHERE s.follower_id = p.id);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
