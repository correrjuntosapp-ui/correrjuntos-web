-- ============================================
-- CRON JOB: Limpieza automática de quedadas pasadas
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- PASO 1: Habilitar pg_cron si no está habilitado
-- Ve a Dashboard > Database > Extensions > busca "pg_cron" y actívalo

-- PASO 2: Crear función SQL para limpiar quedadas pasadas
-- (Esta función es más eficiente que llamar a Edge Function)

CREATE OR REPLACE FUNCTION cleanup_quedadas_pasadas()
RETURNS TABLE(
    deleted_count INTEGER,
    deleted_ids UUID[]
) AS $$
DECLARE
    ids_to_delete UUID[];
    count_deleted INTEGER;
BEGIN
    -- Obtener IDs de quedadas donde fecha+hora ya pasaron
    SELECT ARRAY_AGG(id) INTO ids_to_delete
    FROM quedadas
    WHERE (fecha + hora) < NOW();

    -- Si no hay nada que borrar, retornar 0
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

    -- Retornar resultado
    RETURN QUERY SELECT count_deleted, ids_to_delete;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION cleanup_quedadas_pasadas() TO service_role;

-- ============================================
-- PASO 3: Programar el cron job
-- ============================================

-- Opción A: Ejecutar cada hora (recomendado para producción)
SELECT cron.schedule(
    'cleanup-quedadas-hourly',      -- nombre único del job
    '0 * * * *',                    -- cada hora en punto
    $$SELECT * FROM cleanup_quedadas_pasadas()$$
);

-- Opción B: Ejecutar cada 30 minutos (más frecuente)
-- SELECT cron.schedule(
--     'cleanup-quedadas-30min',
--     '*/30 * * * *',
--     $$SELECT * FROM cleanup_quedadas_pasadas()$$
-- );

-- Opción C: Ejecutar cada día a las 3:00 AM UTC
-- SELECT cron.schedule(
--     'cleanup-quedadas-daily',
--     '0 3 * * *',
--     $$SELECT * FROM cleanup_quedadas_pasadas()$$
-- );

-- ============================================
-- COMANDOS ÚTILES
-- ============================================

-- Ver todos los jobs programados:
-- SELECT * FROM cron.job;

-- Ver historial de ejecuciones:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- Ejecutar limpieza manualmente:
-- SELECT * FROM cleanup_quedadas_pasadas();

-- Eliminar el cron job:
-- SELECT cron.unschedule('cleanup-quedadas-hourly');

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Después de ejecutar este script, verifica que el job está activo:
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname LIKE 'cleanup-quedadas%';
