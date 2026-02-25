-- ============================================================
-- RECURRING QUEDADAS: Auto-generación de quedadas recurrentes
-- Ejecutar en Supabase SQL Editor
-- ============================================================
-- Requisito: pg_cron habilitado (Dashboard > Database > Extensions)
-- ============================================================

-- PASO 1: Función que genera la siguiente instancia de quedadas recurrentes
CREATE OR REPLACE FUNCTION generate_next_recurring_quedadas()
RETURNS TABLE(created_count INTEGER, created_ids UUID[]) AS $$
DECLARE
    rec RECORD;
    new_fecha DATE;
    new_id UUID;
    ids_created UUID[] := ARRAY[]::UUID[];
    count_created INTEGER := 0;
BEGIN
    -- Buscar quedadas recurrentes cuya fecha ya pasó
    -- y que NO tengan ya una hija futura generada
    FOR rec IN
        SELECT q.*
        FROM quedadas q
        WHERE q.recurrence IS NOT NULL
          AND q.recurrence IN ('weekly', 'biweekly', 'monthly')
          AND q.fecha < CURRENT_DATE
          AND NOT EXISTS (
              -- No generar si ya existe una quedada hija futura
              SELECT 1 FROM quedadas child
              WHERE child.recurrence_parent_id = q.id
                AND child.fecha >= CURRENT_DATE
          )
    LOOP
        -- Calcular nueva fecha según frecuencia
        CASE rec.recurrence
            WHEN 'weekly' THEN
                new_fecha := rec.fecha + INTERVAL '7 days';
                -- Si la nueva fecha ya pasó, avanzar hasta la próxima futura
                WHILE new_fecha < CURRENT_DATE LOOP
                    new_fecha := new_fecha + INTERVAL '7 days';
                END LOOP;
            WHEN 'biweekly' THEN
                new_fecha := rec.fecha + INTERVAL '14 days';
                WHILE new_fecha < CURRENT_DATE LOOP
                    new_fecha := new_fecha + INTERVAL '14 days';
                END LOOP;
            WHEN 'monthly' THEN
                new_fecha := rec.fecha + INTERVAL '1 month';
                WHILE new_fecha < CURRENT_DATE LOOP
                    new_fecha := new_fecha + INTERVAL '1 month';
                END LOOP;
        END CASE;

        -- Crear nueva quedada con los mismos datos
        INSERT INTO quedadas (
            titulo, ciudad, ubicacion, direccion, lat, lng,
            fecha, hora, nivel, distancia, ritmo, descripcion,
            creador_id, pais, max_participantes,
            is_private, access_code, recurrence, ruta_coords,
            recurrence_parent_id
        ) VALUES (
            rec.titulo, rec.ciudad, rec.ubicacion, rec.direccion, rec.lat, rec.lng,
            new_fecha, rec.hora, rec.nivel, rec.distancia, rec.ritmo, rec.descripcion,
            rec.creador_id, rec.pais, rec.max_participantes,
            rec.is_private, rec.access_code, rec.recurrence, rec.ruta_coords,
            rec.id  -- apunta a la quedada padre
        )
        RETURNING id INTO new_id;

        -- Auto-inscribir al creador como participante
        INSERT INTO participantes (quedada_id, user_id)
        VALUES (new_id, rec.creador_id)
        ON CONFLICT DO NOTHING;

        ids_created := array_append(ids_created, new_id);
        count_created := count_created + 1;

        RAISE NOTICE 'Generada quedada recurrente: % -> nueva fecha: %', rec.titulo, new_fecha;
    END LOOP;

    RETURN QUERY SELECT count_created, ids_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
GRANT EXECUTE ON FUNCTION generate_next_recurring_quedadas() TO service_role;

-- ============================================================
-- PASO 2: Programar cron job — cada día a las 4:00 AM UTC
-- (Antes de cleanup_quedadas que corre a la hora en punto)
-- ============================================================

SELECT cron.schedule(
    'generate-recurring-quedadas-daily',
    '0 4 * * *',
    $$SELECT * FROM generate_next_recurring_quedadas()$$
);

-- ============================================================
-- PASO 3: Actualizar cleanup para NO borrar plantillas recurrentes
-- ============================================================
-- Las quedadas con recurrence IS NOT NULL se mantienen como plantilla
-- hasta que la siguiente instancia se genere. Después, el cleanup
-- puede borrar la vieja porque ya existe la nueva.

-- Actualizar función de limpieza para excluir recurrentes sin hija
CREATE OR REPLACE FUNCTION cleanup_quedadas_pasadas()
RETURNS TABLE(
    deleted_count INTEGER,
    deleted_ids UUID[]
) AS $$
DECLARE
    ids_to_delete UUID[];
    count_deleted INTEGER;
BEGIN
    -- Obtener IDs de quedadas pasadas, EXCLUYENDO:
    -- 1. Quedadas recurrentes que aún no tienen hija futura
    SELECT ARRAY_AGG(id) INTO ids_to_delete
    FROM quedadas q
    WHERE (q.fecha::timestamp + q.hora) < NOW()
      AND NOT (
          q.recurrence IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM quedadas child
              WHERE child.recurrence_parent_id = q.id
                AND child.fecha >= CURRENT_DATE
          )
      );

    IF ids_to_delete IS NULL OR array_length(ids_to_delete, 1) IS NULL THEN
        RETURN QUERY SELECT 0::INTEGER, ARRAY[]::UUID[];
        RETURN;
    END IF;

    -- Borrar participantes primero (foreign key)
    DELETE FROM participantes
    WHERE quedada_id = ANY(ids_to_delete);

    -- Borrar quedadas pasadas
    DELETE FROM quedadas
    WHERE id = ANY(ids_to_delete);

    GET DIAGNOSTICS count_deleted = ROW_COUNT;

    RETURN QUERY SELECT count_deleted, ids_to_delete;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMANDOS ÚTILES
-- ============================================================

-- Ejecutar generación manualmente:
-- SELECT * FROM generate_next_recurring_quedadas();

-- Ver todos los cron jobs:
-- SELECT jobid, jobname, schedule, command FROM cron.job;

-- Ver historial de ejecuciones:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- Eliminar el cron job:
-- SELECT cron.unschedule('generate-recurring-quedadas-daily');

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname LIKE '%recurring%' OR jobname LIKE '%cleanup%';
