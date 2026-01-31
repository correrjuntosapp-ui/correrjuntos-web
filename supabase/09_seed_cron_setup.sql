-- ============================================
-- SEED CRON JOB SETUP - CorrerJuntos
-- Configuración de tareas programadas para seeding
-- ============================================

-- ============================================
-- OPCIÓN 1: Usar pg_cron (recomendado)
-- Nota: pg_cron debe estar habilitado en tu proyecto Supabase
-- Dashboard > Database > Extensions > pg_cron
-- ============================================

-- Habilitar extensión pg_cron (ejecutar como superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar limpieza diaria a las 2:00 AM UTC
-- Este job llama a la función SQL directamente (más eficiente)
/*
SELECT cron.schedule(
    'cleanup-seed-daily',           -- nombre del job
    '0 2 * * *',                    -- cron expression: 2:00 AM todos los días
    $$SELECT cleanup_seed_content()$$
);
*/

-- Programar regeneración de fechas cada 3 días a las 3:00 AM UTC
/*
SELECT cron.schedule(
    'regenerate-seed-dates',
    '0 3 */3 * *',                  -- cada 3 días a las 3:00 AM
    $$SELECT regenerate_seed_dates()$$
);
*/

-- Ver jobs programados
-- SELECT * FROM cron.job;

-- Eliminar un job
-- SELECT cron.unschedule('cleanup-seed-daily');

-- ============================================
-- OPCIÓN 2: Llamar Edge Function via HTTP
-- Usar con servicios externos (GitHub Actions, etc.)
-- ============================================

-- Para llamar la Edge Function cleanup-seed:
-- curl -X POST https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/cleanup-seed \
--   -H "Authorization: Bearer YOUR_ANON_KEY" \
--   -H "Content-Type: application/json"

-- ============================================
-- OPCIÓN 3: GitHub Actions Workflow
-- ============================================

-- Crear archivo .github/workflows/seed-cleanup.yml:
/*
name: Seed Cleanup Cron
on:
  schedule:
    - cron: '0 2 * * *'  # 2:00 AM UTC daily
  workflow_dispatch:     # permite ejecución manual

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/cleanup-seed" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
*/

-- ============================================
-- FUNCIONES AUXILIARES PARA MONITOREO
-- ============================================

-- Función para ver estadísticas de seed actuales
CREATE OR REPLACE FUNCTION get_seed_summary()
RETURNS TABLE(
    metric TEXT,
    value BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_quedadas_seed'::TEXT, COUNT(*)
    FROM quedadas WHERE es_seed = TRUE AND fecha >= CURRENT_DATE
    UNION ALL
    SELECT 'total_quedadas_reales'::TEXT, COUNT(*)
    FROM quedadas WHERE es_seed = FALSE AND fecha >= CURRENT_DATE
    UNION ALL
    SELECT 'total_usuarios_seed'::TEXT, COUNT(*)
    FROM profiles WHERE es_seed = TRUE
    UNION ALL
    SELECT 'total_participaciones_seed'::TEXT, COUNT(*)
    FROM participantes WHERE es_seed = TRUE
    UNION ALL
    SELECT 'ciudades_con_seed'::TEXT, COUNT(DISTINCT ciudad)
    FROM quedadas WHERE es_seed = TRUE AND fecha >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_seed_summary() TO authenticated;

-- ============================================
-- COMANDOS ÚTILES PARA ADMINISTRACIÓN
-- ============================================

-- Ver resumen rápido
-- SELECT * FROM get_seed_summary();

-- Ver estadísticas por ciudad
-- SELECT * FROM get_seed_stats();

-- Ejecutar limpieza manualmente
-- SELECT * FROM cleanup_seed_content();

-- Regenerar fechas manualmente
-- SELECT regenerate_seed_dates();

-- Eliminar TODO el contenido seed (cuidado!)
/*
DELETE FROM participantes WHERE es_seed = TRUE;
DELETE FROM quedadas WHERE es_seed = TRUE;
DELETE FROM profiles WHERE es_seed = TRUE;
*/

-- Verificar contenido seed existente
/*
SELECT
    'quedadas' as tabla,
    ciudad,
    COUNT(*) as total_seed
FROM quedadas
WHERE es_seed = TRUE
GROUP BY ciudad
ORDER BY total_seed DESC;
*/
