-- ============================================================
-- 18. Email Cron Jobs
-- Programa envio automatico de emails transaccionales
-- ============================================================

-- Asegurar que pg_cron y pg_net estan habilitados
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Reactivacion + Post-quedada: diario a las 10:00 UTC (11:00 CET)
SELECT cron.schedule(
    'email-cron-daily',
    '0 10 * * *',  -- Cada dia a las 10:00 UTC
    $$
    SELECT net.http_post(
        url := 'https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/email-cron',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := '{"type": "all"}'::jsonb
    );
    $$
);

-- Verificar cron jobs activos
SELECT jobid, schedule, command FROM cron.job ORDER BY jobid;
