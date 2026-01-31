-- ============================================
-- RANKING POR PAIS - CorrerJuntos
-- Actualizar funciones de ranking para filtrar por país
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- Primero asegurarse de que profiles tiene columna pais
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'ES';

-- Actualizar get_ranking_mensual para soportar filtro por país
CREATE OR REPLACE FUNCTION get_ranking_mensual(p_limite INTEGER DEFAULT 20, p_pais TEXT DEFAULT NULL)
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
    pais TEXT,
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
        p.pais,
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
    AND (p_pais IS NULL OR p.pais = p_pais)
    GROUP BY p.id, p.nombre, p.apellidos, p.photo_url, p.puntos_totales, p.nivel_gamificacion, p.ciudad, p.pais, p.es_premium
    HAVING COALESCE(SUM(ph.puntos), 0) > 0
    ORDER BY puntos_mes DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar get_ranking_global para soportar filtro por país
CREATE OR REPLACE FUNCTION get_ranking_global(p_limite INTEGER DEFAULT 20, p_pais TEXT DEFAULT NULL)
RETURNS TABLE(
    posicion BIGINT,
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    photo_url TEXT,
    puntos_totales INTEGER,
    nivel TEXT,
    ciudad TEXT,
    pais TEXT,
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
        p.pais,
        (p.quedadas_creadas + p.quedadas_asistidas)::BIGINT as quedadas_totales,
        COALESCE(p.es_premium, FALSE) as es_premium
    FROM profiles p
    WHERE (p.es_seed = FALSE OR p.es_seed IS NULL)
    AND p.puntos_totales > 0
    AND (p_pais IS NULL OR p.pais = p_pais)
    ORDER BY p.puntos_totales DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
GRANT EXECUTE ON FUNCTION get_ranking_mensual(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ranking_global(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ranking_mensual(INTEGER, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_ranking_global(INTEGER, TEXT) TO anon;
