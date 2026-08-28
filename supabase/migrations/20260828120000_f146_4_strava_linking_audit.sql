-- ============================================================
-- F146.4 · Observabilidad durable de F134
--
-- Problema que resuelve: F134 lleva desde el 16 ago 2026 evaluando cada
-- importación de Strava en dry-run y emitiendo su decisión SOLO por
-- console.log. Los logs de Vercel no permiten reconstruir la ventana (21
-- líneas recuperables en 7 días frente a ~150 importaciones), así que el
-- rendimiento del emparejador no es auditable y el piloto no puede empezar.
--
-- Esta migración NO cambia el emparejador, ni el margen ±30 %, ni dry_run,
-- ni la allowlist. Solo añade el sitio donde escribir lo que ya se decide.
--
-- Naturaleza de la tabla:
--   · APPEND-ONLY  — service_role recibe INSERT y SELECT, nunca UPDATE,
--                    DELETE ni TRUNCATE. La retención la ejecuta el
--                    propietario, deliberadamente (ver al final).
--   · SIN PII      — el contrato de columnas no admite correos, nombres,
--                    títulos libres, coordenadas, polyline, tokens ni rutas.
--                    Solo identificadores opacos y magnitudes numéricas.
--   · SERVICE-ROLE ONLY — anon y authenticated no reciben ningún grant.
--                    RLS + FORCE RLS sin políticas como segunda defensa,
--                    espejo exacto de strava_linking_config (F134).
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.strava_linking_audit (
  id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evaluated_at         timestamptz NOT NULL DEFAULT now(),

  -- Identidad. Opaca: UUIDs, nunca correo ni nombre.
  run_id               uuid NOT NULL,
  workout_id           uuid NULL,
  user_id              uuid NOT NULL,

  -- Qué modo estaba vigente para ESTE usuario en ESTE momento.
  mode                 text NOT NULL,
  -- Qué se hizo.
  decision             text NOT NULL,
  -- Por qué. Enum estable: ampliable, nunca reinterpretable.
  reason               text NOT NULL,

  -- Versión del emparejador que produjo la decisión. Si cambia la lógica
  -- del matcher sin bumpear esto, las series históricas mienten.
  matcher_version      text NOT NULL,

  -- Sobre qué magnitud se comparó.
  matching_basis       text NOT NULL,
  actual_distance_km   numeric NULL,
  target_distance_km   numeric NULL,
  actual_duration_min  numeric NULL,
  target_duration_min  numeric NULL,
  ratio                numeric NULL,

  -- Retraso entre el inicio real de la actividad y su evaluación. Distingue
  -- importación fresca de catch-up sin volver a cruzar con runs.
  import_lag_minutes   integer NULL,

  -- Camino que originó la evaluación. Hoy solo existe el webhook.
  source_path          text NOT NULL DEFAULT 'webhook',

  -- Etapa concreta cuando decision='error'.
  error_stage          text NULL,

  -- Clave lógica de la evaluación. Ver FASE 3 del encargo: hace que un
  -- reintento del webhook no duplique la auditoría, pero que un cambio real
  -- (de modo, de decisión, de sesión objetivo) sí quede registrado aparte.
  evaluation_key       text NOT NULL,

  CONSTRAINT strava_linking_audit_mode_chk
    CHECK (mode IN ('disabled','dry','live')),
  CONSTRAINT strava_linking_audit_decision_chk
    CHECK (decision IN ('linked','would_link','skipped','error')),
  CONSTRAINT strava_linking_audit_basis_chk
    CHECK (matching_basis IN ('distance','duration','none')),
  CONSTRAINT strava_linking_audit_source_chk
    CHECK (source_path IN ('webhook')),
  CONSTRAINT strava_linking_audit_reason_chk
    CHECK (reason IN (
      -- puertas del canario
      'disabled', 'config_missing', 'config_query_failed',
      'allowlist_too_big', 'allowlist_invalid', 'config_exception',
      'not_in_allowlist',
      -- estado del plan
      'no_active_plan', 'multiple_active_plans',
      -- estado de las sesiones del día
      'no_free_session', 'unsupported_sport', 'date_mismatch',
      'ambiguous', 'already_linked',
      -- comparación de magnitud
      'distance_mismatch', 'duration_mismatch', 'no_target',
      -- datos de la actividad
      'invalid_activity', 'insufficient_data',
      -- desenlaces
      'would_link', 'linked', 'no_changes',
      -- fallos
      'query_failed', 'write_failed', 'audit_failed', 'exception'
    )),
  -- El error debe declarar su etapa, y sólo el error puede declararla.
  CONSTRAINT strava_linking_audit_error_stage_chk
    CHECK ((decision = 'error') = (error_stage IS NOT NULL)),
  -- Una decisión que vincula (o vincularía) tiene que decir a qué sesión.
  CONSTRAINT strava_linking_audit_workout_chk
    CHECK (decision NOT IN ('linked','would_link') OR workout_id IS NOT NULL),
  -- Idempotencia.
  CONSTRAINT strava_linking_audit_evaluation_key_uk UNIQUE (evaluation_key)
);

COMMENT ON TABLE public.strava_linking_audit IS
  'F146.4 · Append-only. Una fila por evaluacion de F134. Sin PII: prohibido '
  'anadir columnas con correo, nombre, titulo libre, coordenadas, polyline, '
  'tokens o rutas. Solo service_role, solo INSERT y SELECT.';

-- ── Índices ───────────────────────────────────────────────
-- Únicamente los tres que pide el encargo. Cualquier índice adicional debe
-- justificarse contra una consulta real: esta tabla se escribe en el camino
-- caliente del webhook y cada índice es coste por importación.

-- Ventana temporal (la consulta de observación es siempre "últimos N días").
CREATE INDEX IF NOT EXISTS ix_strava_linking_audit_evaluated_at
  ON public.strava_linking_audit (evaluated_at DESC);

-- Embudo por desenlace y motivo.
CREATE INDEX IF NOT EXISTS ix_strava_linking_audit_decision_reason
  ON public.strava_linking_audit (decision, reason, evaluated_at DESC);

-- Traza de una actividad concreta.
CREATE INDEX IF NOT EXISTS ix_strava_linking_audit_run
  ON public.strava_linking_audit (run_id);

-- ── Seguridad ─────────────────────────────────────────────
-- Espejo de strava_linking_config: RLS + FORCE RLS y CERO políticas. El
-- acceso llega solo por service_role, que tiene BYPASSRLS. Cualquier fuga
-- futura vía PostgREST con anon/authenticated choca primero con la ausencia
-- de grants y despues con RLS sin politicas.
ALTER TABLE public.strava_linking_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strava_linking_audit FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.strava_linking_audit FROM PUBLIC;
REVOKE ALL ON public.strava_linking_audit FROM anon;
REVOKE ALL ON public.strava_linking_audit FROM authenticated;

-- Append-only: ni UPDATE ni DELETE ni TRUNCATE, tampoco para service_role.
GRANT INSERT, SELECT ON public.strava_linking_audit TO service_role;

-- La secuencia de la identidad no necesita grant explicito con
-- GENERATED ALWAYS AS IDENTITY, pero se cierra igualmente por si acaso.
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

COMMIT;

-- ============================================================
-- RETENCIÓN — 90 días. NO se instala aquí ningún cron ni trigger.
--
-- Motivo: la tabla es append-only por grants, y darle DELETE a service_role
-- para poder purgar destruiria esa propiedad. La purga la ejecuta el
-- propietario de la base, deliberadamente, con esta sentencia:
--
--   DELETE FROM public.strava_linking_audit
--    WHERE evaluated_at < now() - interval '90 days';
--
-- Volumen esperado: ~280 evaluaciones cada 12 días (medido en F146.3), es
-- decir del orden de 2.000 filas por trimestre. No hay urgencia de purga;
-- 90 días es una politica de privacidad, no de espacio.
-- ============================================================
