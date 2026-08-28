-- ============================================================
-- F146.4 · Consultas de observación de strava_linking_audit
--
-- Se ejecutan a partir del paso 4 del paquete de despliegue, con dry_run
-- todavía en true y la allowlist vacía. Todas son de SOLO LECTURA.
-- ============================================================

-- ── Q1 · Embudo por motivo, últimos 7 días ────────────────
-- La consulta principal. Es el equivalente durable del embudo que en F146.3
-- hubo que reconstruir a mano reproduciendo el código en SQL.
SELECT
  decision,
  reason,
  count(*)                        AS evaluaciones,
  count(DISTINCT user_id)         AS usuarios,
  count(DISTINCT run_id)          AS actividades,
  round(100.0 * count(*) / NULLIF(sum(count(*)) OVER (), 0), 1) AS pct
FROM public.strava_linking_audit
WHERE evaluated_at >= now() - interval '7 days'
GROUP BY decision, reason
ORDER BY evaluaciones DESC;

-- ── Q2 · Frescas vs catch-up ──────────────────────────────
-- Sin esto, un backfill de tres usuarios contamina el denominador, que es
-- exactamente el error que F146.3 tuvo que corregir a posteriori.
SELECT
  CASE WHEN import_lag_minutes IS NULL THEN 'sin_dato'
       WHEN import_lag_minutes <= 2880 THEN 'fresca'
       ELSE 'catch_up' END        AS tipo_importacion,
  count(*)                        AS evaluaciones,
  count(DISTINCT user_id)         AS usuarios,
  count(*) FILTER (WHERE decision IN ('linked','would_link')) AS vinculables,
  round(percentile_cont(0.5) WITHIN GROUP (ORDER BY import_lag_minutes)::numeric, 1) AS retraso_mediano_min
FROM public.strava_linking_audit
WHERE evaluated_at >= now() - interval '7 days'
GROUP BY 1 ORDER BY 1;

-- ── Q3 · Distribución del ratio en los rechazos por magnitud ──
-- Alimenta directamente la decisión sobre el margen sin volver a reproducir
-- el emparejador en SQL.
SELECT
  matching_basis,
  reason,
  count(*) AS n,
  round(percentile_cont(0.10) WITHIN GROUP (ORDER BY ratio)::numeric, 2) AS p10,
  round(percentile_cont(0.50) WITHIN GROUP (ORDER BY ratio)::numeric, 2) AS mediana,
  round(percentile_cont(0.90) WITHIN GROUP (ORDER BY ratio)::numeric, 2) AS p90,
  count(*) FILTER (WHERE ratio < 0.7) AS demasiado_corta,
  count(*) FILTER (WHERE ratio > 1.3) AS demasiado_larga
FROM public.strava_linking_audit
WHERE evaluated_at >= now() - interval '30 days'
  AND ratio IS NOT NULL
GROUP BY matching_basis, reason
ORDER BY n DESC;

-- ── Q4 · Reconciliación contra las importaciones reales ───
-- Paso 5 del despliegue. Toda carrera de Strava importada tras el epoch de
-- la instrumentación debe tener al menos una evaluación. Si aparece alguna
-- sin auditar, la instrumentación tiene un agujero.
--
-- ⚠️ Sustituir el epoch por el instante REAL del deploy antes de usarla.
WITH epoch AS (SELECT timestamptz '2026-08-29 00:00:00+00' AS t0),
importadas AS (
  SELECT r.id, r.user_id
  FROM public.runs r
  WHERE r.source = 'strava'
    AND r.created_at >= (SELECT t0 FROM epoch)
    AND r.deporte IN ('running','trail','walking')   -- la bici no la evalua F134
)
SELECT
  (SELECT count(*) FROM importadas)                                    AS importadas_aptas,
  (SELECT count(DISTINCT run_id) FROM public.strava_linking_audit
     WHERE evaluated_at >= (SELECT t0 FROM epoch))                     AS actividades_auditadas,
  (SELECT count(*) FROM importadas i
     WHERE NOT EXISTS (SELECT 1 FROM public.strava_linking_audit a WHERE a.run_id = i.id))
                                                                       AS SIN_AUDITAR;

-- ── Q5 · Integridad del propio registro ───────────────────
-- Contradicciones que no deberían poder existir nunca. Todas deben dar 0.
SELECT
  count(*) FILTER (WHERE decision IN ('linked','would_link') AND workout_id IS NULL) AS vinculo_sin_sesion,
  count(*) FILTER (WHERE (decision = 'error') <> (error_stage IS NOT NULL))          AS error_sin_etapa,
  count(*) FILTER (WHERE mode = 'dry'      AND decision = 'linked')                  AS dry_que_vinculo,
  count(*) FILTER (WHERE mode = 'disabled' AND decision <> 'skipped')                AS apagado_que_actuo,
  count(*) - count(DISTINCT evaluation_key)                                          AS claves_duplicadas
FROM public.strava_linking_audit;

-- ── Q6 · Coherencia con el estado real del plan ───────────
-- Paso 6, ya con el piloto en marcha: cada 'linked' debe corresponderse con
-- una sesión realmente completada por esa actividad, y solo una.
SELECT
  a.id, a.evaluated_at, a.run_id, a.workout_id,
  w.estado                    AS estado_sesion,
  (w.actividad_id = a.run_id) AS apunta_a_la_actividad,
  (SELECT count(*) FROM public.user_workouts w2 WHERE w2.actividad_id = a.run_id) AS sesiones_con_esa_actividad
FROM public.strava_linking_audit a
LEFT JOIN public.user_workouts w ON w.id = a.workout_id
WHERE a.decision = 'linked'
ORDER BY a.evaluated_at DESC;

-- ── Q7 · Volumen y retención ──────────────────────────────
SELECT count(*) AS filas,
       min(evaluated_at) AS desde,
       max(evaluated_at) AS hasta,
       count(*) FILTER (WHERE evaluated_at < now() - interval '90 days') AS purgables,
       pg_size_pretty(pg_total_relation_size('public.strava_linking_audit')) AS tamano
FROM public.strava_linking_audit;
