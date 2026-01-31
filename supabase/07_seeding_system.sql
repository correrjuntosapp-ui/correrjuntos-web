-- ============================================
-- SEEDING SYSTEM - CorrerJuntos
-- Sistema para crear contenido ficticio inicial
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- PASO 1: Agregar columnas es_seed a las tablas
-- ============================================

-- Columna es_seed en quedadas
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS es_seed BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_quedadas_es_seed ON quedadas(es_seed);

-- Columna es_seed en participantes
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS es_seed BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_participantes_es_seed ON participantes(es_seed);

-- Columna es_seed en profiles (para usuarios ficticios)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS es_seed BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_profiles_es_seed ON profiles(es_seed);

-- ============================================
-- PASO 2: Crear usuarios seed en auth.users y profiles
-- Nota: Los usuarios seed se crean mediante la API de Supabase Admin
-- Este script crea los perfiles correspondientes
-- ============================================

-- Función para crear usuarios seed
CREATE OR REPLACE FUNCTION create_seed_users()
RETURNS void AS $$
DECLARE
    seed_users TEXT[][] := ARRAY[
        -- Formato: [nombre, apellidos, ciudad, nivel, seed_key]
        ARRAY['Carlos', 'García López', 'Madrid', 'Intermedio', 'carlos_runner'],
        ARRAY['Laura', 'Martínez Ruiz', 'Madrid', 'Avanzado', 'laura_runner'],
        ARRAY['Miguel', 'Fernández Castro', 'Madrid', 'Principiante', 'miguel_runner'],
        ARRAY['Ana', 'Rodríguez Sánchez', 'Madrid', 'Intermedio', 'ana_runner'],
        ARRAY['Pablo', 'López Hernández', 'Madrid', 'Avanzado', 'pablo_runner'],
        ARRAY['María', 'González Torres', 'Madrid', 'Principiante', 'maria_runner'],
        ARRAY['Javier', 'Díaz Moreno', 'Madrid', 'Intermedio', 'javier_runner'],
        ARRAY['Carmen', 'Muñoz Jiménez', 'Madrid', 'Avanzado', 'carmen_runner'],
        ARRAY['David', 'Romero Gil', 'Madrid', 'Principiante', 'david_runner'],
        ARRAY['Elena', 'Navarro Flores', 'Madrid', 'Intermedio', 'elena_runner'],
        ARRAY['Sergio', 'Alonso Herrera', 'Barcelona', 'Avanzado', 'sergio_runner'],
        ARRAY['Lucía', 'Molina Ortega', 'Barcelona', 'Intermedio', 'lucia_runner'],
        ARRAY['Raúl', 'Rubio Castro', 'Barcelona', 'Principiante', 'raul_runner'],
        ARRAY['Sofía', 'Domínguez Vega', 'Barcelona', 'Avanzado', 'sofia_runner'],
        ARRAY['Adrián', 'Torres Méndez', 'Barcelona', 'Intermedio', 'adrian_runner'],
        ARRAY['Paula', 'Vargas León', 'Barcelona', 'Principiante', 'paula_runner'],
        ARRAY['Daniel', 'Ramos Prieto', 'Valencia', 'Avanzado', 'daniel_runner'],
        ARRAY['Marta', 'Castro Blanco', 'Valencia', 'Intermedio', 'marta_runner'],
        ARRAY['Álvaro', 'Ortiz Serrano', 'Valencia', 'Principiante', 'alvaro_runner'],
        ARRAY['Nuria', 'Delgado Pascual', 'Valencia', 'Avanzado', 'nuria_runner'],
        ARRAY['Hugo', 'Iglesias Fuentes', 'Sevilla', 'Intermedio', 'hugo_runner'],
        ARRAY['Irene', 'Santos Cabrera', 'Sevilla', 'Principiante', 'irene_runner'],
        ARRAY['Marcos', 'Medina Rojas', 'Sevilla', 'Avanzado', 'marcos_runner'],
        ARRAY['Clara', 'Herrera Suárez', 'Bilbao', 'Intermedio', 'clara_runner'],
        ARRAY['Iván', 'Cortés Aguilar', 'Bilbao', 'Principiante', 'ivan_runner'],
        ARRAY['Teresa', 'Vidal Guerrero', 'Málaga', 'Avanzado', 'teresa_runner'],
        ARRAY['Rubén', 'Cano Montero', 'Málaga', 'Intermedio', 'ruben_runner'],
        ARRAY['Cristina', 'Prieto Nieto', 'Zaragoza', 'Principiante', 'cristina_runner'],
        ARRAY['Óscar', 'Márquez Pascual', 'Zaragoza', 'Avanzado', 'oscar_runner'],
        ARRAY['Rocío', 'Peña Campos', 'Lisboa', 'Intermedio', 'rocio_runner'],
        ARRAY['Alberto', 'Lozano Reyes', 'Lisboa', 'Principiante', 'alberto_runner'],
        ARRAY['Beatriz', 'Guerrero Soto', 'Porto', 'Avanzado', 'beatriz_runner'],
        ARRAY['Fernando', 'Mora Esteban', 'Porto', 'Intermedio', 'fernando_runner'],
        ARRAY['Silvia', 'Calvo Bravo', 'Madrid', 'Principiante', 'silvia_runner'],
        ARRAY['Jorge', 'Caballero Luna', 'Madrid', 'Avanzado', 'jorge_runner'],
        ARRAY['Patricia', 'Giménez Pastor', 'Barcelona', 'Intermedio', 'patricia_runner'],
        ARRAY['Alejandro', 'Ibáñez Crespo', 'Barcelona', 'Principiante', 'alejandro_runner'],
        ARRAY['Sara', 'Lorenzo Parra', 'Valencia', 'Avanzado', 'sara_runner'],
        ARRAY['Roberto', 'Sanz Gallego', 'Valencia', 'Intermedio', 'roberto_runner'],
        ARRAY['Andrea', 'Carrasco Rivas', 'Sevilla', 'Principiante', 'andrea_runner']
    ];
    user_data TEXT[];
BEGIN
    -- Esta función se usa como referencia para los datos de usuarios seed
    -- La creación real se hace mediante el script de inserción de profiles
    RAISE NOTICE 'Seed users data prepared for 40 users';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 3: Vista para obtener quedadas (filtrando seed según usuario)
-- ============================================

-- Función para verificar si un usuario es nuevo (< 7 días)
CREATE OR REPLACE FUNCTION is_new_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_created_at TIMESTAMPTZ;
BEGIN
    SELECT created_at INTO user_created_at
    FROM profiles
    WHERE id = user_uuid;

    IF user_created_at IS NULL THEN
        -- Si no hay perfil, considerarlo nuevo
        RETURN TRUE;
    END IF;

    -- Considerar nuevo si fue creado hace menos de 7 días
    RETURN (NOW() - user_created_at) < INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener quedadas con filtrado inteligente de seed
CREATE OR REPLACE FUNCTION get_quedadas_filtered(user_uuid UUID DEFAULT NULL)
RETURNS SETOF quedadas AS $$
BEGIN
    IF user_uuid IS NULL OR is_new_user(user_uuid) THEN
        -- Usuario nuevo o anónimo: mostrar TODAS las quedadas (seed + reales)
        RETURN QUERY
        SELECT * FROM quedadas
        WHERE fecha >= CURRENT_DATE
        ORDER BY fecha ASC, hora ASC;
    ELSE
        -- Usuario existente: mostrar SOLO quedadas reales
        RETURN QUERY
        SELECT * FROM quedadas
        WHERE fecha >= CURRENT_DATE
        AND es_seed = FALSE
        ORDER BY fecha ASC, hora ASC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 4: Función para limpiar seed cuando hay suficiente contenido real
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_seed_content()
RETURNS TABLE(ciudad TEXT, quedadas_eliminadas INTEGER, message TEXT) AS $$
DECLARE
    ciudad_record RECORD;
    real_count INTEGER;
    deleted_count INTEGER;
    threshold INTEGER := 15; -- Umbral: si hay más de 15 quedadas reales, eliminar seed
BEGIN
    FOR ciudad_record IN
        SELECT DISTINCT q.ciudad
        FROM quedadas q
        WHERE q.ciudad IS NOT NULL
    LOOP
        -- Contar quedadas reales futuras en esta ciudad
        SELECT COUNT(*) INTO real_count
        FROM quedadas
        WHERE quedadas.ciudad = ciudad_record.ciudad
        AND es_seed = FALSE
        AND fecha >= CURRENT_DATE;

        IF real_count >= threshold THEN
            -- Eliminar participaciones seed de esta ciudad
            DELETE FROM participantes
            WHERE es_seed = TRUE
            AND quedada_id IN (
                SELECT id FROM quedadas
                WHERE quedadas.ciudad = ciudad_record.ciudad
                AND es_seed = TRUE
            );

            -- Eliminar quedadas seed de esta ciudad
            DELETE FROM quedadas
            WHERE quedadas.ciudad = ciudad_record.ciudad
            AND es_seed = TRUE;

            GET DIAGNOSTICS deleted_count = ROW_COUNT;

            ciudad := ciudad_record.ciudad;
            quedadas_eliminadas := deleted_count;
            message := format('Ciudad %s tiene %s quedadas reales. Eliminadas %s seed.',
                             ciudad_record.ciudad, real_count, deleted_count);
            RETURN NEXT;
        END IF;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 5: Función para regenerar seed quedadas
-- (Útil para mantener fechas futuras actualizadas)
-- ============================================

CREATE OR REPLACE FUNCTION regenerate_seed_dates()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    days_offset INTEGER;
BEGIN
    -- Actualizar fechas de quedadas seed para que sean futuras
    UPDATE quedadas
    SET fecha = CURRENT_DATE + (floor(random() * 14) + 1)::INTEGER,
        updated_at = NOW()
    WHERE es_seed = TRUE
    AND fecha < CURRENT_DATE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 6: Estadísticas de seed vs real
-- ============================================

CREATE OR REPLACE FUNCTION get_seed_stats()
RETURNS TABLE(
    ciudad TEXT,
    quedadas_reales BIGINT,
    quedadas_seed BIGINT,
    participantes_reales BIGINT,
    participantes_seed BIGINT,
    porcentaje_real NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(q.ciudad, 'Sin ciudad') as ciudad,
        COUNT(*) FILTER (WHERE q.es_seed = FALSE) as quedadas_reales,
        COUNT(*) FILTER (WHERE q.es_seed = TRUE) as quedadas_seed,
        (SELECT COUNT(*) FROM participantes p
         JOIN quedadas q2 ON p.quedada_id = q2.id
         WHERE q2.ciudad = q.ciudad AND p.es_seed = FALSE) as participantes_reales,
        (SELECT COUNT(*) FROM participantes p
         JOIN quedadas q2 ON p.quedada_id = q2.id
         WHERE q2.ciudad = q.ciudad AND p.es_seed = TRUE) as participantes_seed,
        ROUND(
            COUNT(*) FILTER (WHERE q.es_seed = FALSE)::NUMERIC /
            NULLIF(COUNT(*)::NUMERIC, 0) * 100,
            2
        ) as porcentaje_real
    FROM quedadas q
    WHERE q.fecha >= CURRENT_DATE
    GROUP BY q.ciudad
    ORDER BY quedadas_reales DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PERMISOS
-- ============================================

-- Permitir a usuarios autenticados usar las funciones
GRANT EXECUTE ON FUNCTION is_new_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_quedadas_filtered(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_quedadas_filtered(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_seed_stats() TO authenticated;

-- Solo service_role puede limpiar/regenerar seed
GRANT EXECUTE ON FUNCTION cleanup_seed_content() TO service_role;
GRANT EXECUTE ON FUNCTION regenerate_seed_dates() TO service_role;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON COLUMN quedadas.es_seed IS 'Indica si es una quedada ficticia para seeding inicial';
COMMENT ON COLUMN participantes.es_seed IS 'Indica si es una participación ficticia para seeding inicial';
COMMENT ON COLUMN profiles.es_seed IS 'Indica si es un usuario ficticio para seeding inicial';
COMMENT ON FUNCTION is_new_user(UUID) IS 'Verifica si un usuario fue creado hace menos de 7 días';
COMMENT ON FUNCTION get_quedadas_filtered(UUID) IS 'Obtiene quedadas filtrando seed según antigüedad del usuario';
COMMENT ON FUNCTION cleanup_seed_content() IS 'Elimina contenido seed en ciudades con suficiente contenido real';
COMMENT ON FUNCTION regenerate_seed_dates() IS 'Actualiza fechas de quedadas seed para mantenerlas futuras';
COMMENT ON FUNCTION get_seed_stats() IS 'Muestra estadísticas de contenido seed vs real por ciudad';
