-- ============================================================
-- F146.4 · ROLLBACK de la observabilidad durable de F134
--
-- PRINCIPIO: el rollback PRESERVA LOS DATOS. Deshacer la instrumentación no
-- puede destruir la única evidencia de qué decidió el sistema — que es
-- justamente lo que esta ronda existe para conservar.
--
-- Por eso el rollback por defecto se limita a RETIRAR EL ACCESO DE ESCRITURA:
-- el código deja de poder insertar, la tabla queda congelada y legible por
-- el propietario, y nada se pierde.
--
-- El DROP está escrito pero COMENTADO a propósito. Descomentarlo requiere
-- autorización explícita del founder, igual que en el rollback de F145.6.
-- ============================================================

BEGIN;

-- 1 · Congelar la tabla: el webhook ya no puede escribir en ella.
--     Basta con esto para que un deploy revertido no falle: el módulo de
--     auditoría trata el fallo de INSERT como 'audit_failed' y, en dry-run,
--     no altera el camino legacy. En live, falla cerrado y NO vincula, que
--     es el comportamiento correcto si no hay dónde registrar la decisión.
REVOKE INSERT ON public.strava_linking_audit FROM service_role;

-- 2 · Se conserva el SELECT para poder seguir leyendo lo ya registrado.
--     GRANT SELECT ON public.strava_linking_audit TO service_role;  -- ya vigente

COMMIT;

-- ------------------------------------------------------------
-- DESTRUCTIVO — NO EJECUTAR SIN AUTORIZACIÓN EXPLÍCITA.
--
-- Borra la tabla y todo su historial de decisiones. Solo tiene sentido si
-- se decide que la observabilidad de F134 no se quiere en absoluto.
-- Antes de ejecutarlo, exportar:
--   \copy (SELECT * FROM public.strava_linking_audit) TO 'f134-audit.csv' CSV HEADER
--
-- BEGIN;
--   DROP INDEX IF EXISTS public.ix_strava_linking_audit_run;
--   DROP INDEX IF EXISTS public.ix_strava_linking_audit_decision_reason;
--   DROP INDEX IF EXISTS public.ix_strava_linking_audit_evaluated_at;
--   DROP TABLE IF EXISTS public.strava_linking_audit;
-- COMMIT;
-- ------------------------------------------------------------
