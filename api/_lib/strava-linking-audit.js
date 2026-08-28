// ============================================================
// F146.4 · Registro durable de las decisiones de F134
//
// F134 decide bien pero solo se cuenta a sí mismo por console.log, y los
// logs de Vercel no llegan: en 7 días solo se recuperan 21 líneas frente a
// ~150 importaciones. Sin un registro durable no hay denominador auditable,
// y sin denominador no se puede empezar el piloto.
//
// Este módulo SOLO REGISTRA. No decide nada, no cambia el margen ±30 %, no
// toca el emparejador y no altera ningún retorno de la orquestación. Si se
// borra este fichero y sus llamadas, F134 se comporta exactamente igual.
//
// DOS GARANTÍAS OPUESTAS, deliberadamente:
//
//   · En dry-run y en las puertas del canario, registrar es best-effort:
//     un fallo aquí NUNCA puede impedir que la actividad se guarde ni
//     romper el camino legacy de José y Ana. Se traga y se sigue.
//
//   · En una escritura live, registrar es OBLIGATORIO Y PREVIO: si la
//     decisión no puede quedar anotada, NO se vincula. Vincular sin dejar
//     rastro es exactamente el fallo que esta ronda existe para impedir.
// ============================================================

/**
 * Versión del emparejador cuya lógica produjo la decisión.
 *
 * ⚠️ Si cambia `strava-plan-matcher.js` (margen, tipos compatibles, orden de
 * los guards…) hay que subir esto. Si no, las series históricas mezclan
 * decisiones de dos algoritmos distintos bajo la misma etiqueta y dejan de
 * significar nada. `tests/unit/strava-linking-audit.test.mjs` incluye un
 * contract-guard que compara el hash del matcher contra el declarado aquí y
 * falla si alguien cambia uno sin el otro.
 */
export const MATCHER_VERSION = 'f134.1';

/** Hash del matcher que corresponde a MATCHER_VERSION. Ver contract-guard. */
export const MATCHER_SHA256_PREFIX = 'd01c5aecfd6336c8';

/**
 * Motivos. Conjunto CERRADO y espejo exacto del CHECK de la migración: si
 * divergen, la inserción revienta en producción en vez de en los tests.
 * Ampliable con motivos nuevos; jamás reinterpretable un motivo existente.
 */
export const REASON = Object.freeze({
  // Puertas del canario
  DISABLED: 'disabled',
  CONFIG_MISSING: 'config_missing',
  CONFIG_QUERY_FAILED: 'config_query_failed',
  ALLOWLIST_TOO_BIG: 'allowlist_too_big',
  ALLOWLIST_INVALID: 'allowlist_invalid',
  CONFIG_EXCEPTION: 'config_exception',
  NOT_IN_ALLOWLIST: 'not_in_allowlist',
  // Estado del plan
  NO_ACTIVE_PLAN: 'no_active_plan',
  MULTIPLE_ACTIVE_PLANS: 'multiple_active_plans',
  // Estado de las sesiones del día
  NO_FREE_SESSION: 'no_free_session',
  UNSUPPORTED_SPORT: 'unsupported_sport',
  DATE_MISMATCH: 'date_mismatch',
  AMBIGUOUS: 'ambiguous',
  ALREADY_LINKED: 'already_linked',
  // Comparación de magnitud
  DISTANCE_MISMATCH: 'distance_mismatch',
  DURATION_MISMATCH: 'duration_mismatch',
  NO_TARGET: 'no_target',
  // Datos de la actividad
  INVALID_ACTIVITY: 'invalid_activity',
  INSUFFICIENT_DATA: 'insufficient_data',
  // Desenlaces
  WOULD_LINK: 'would_link',
  LINKED: 'linked',
  NO_CHANGES: 'no_changes',
  // Fallos
  QUERY_FAILED: 'query_failed',
  WRITE_FAILED: 'write_failed',
  AUDIT_FAILED: 'audit_failed',
  EXCEPTION: 'exception',
});

const REASONS = Object.freeze(new Set(Object.values(REASON)));
const MODES = Object.freeze(new Set(['disabled', 'dry', 'live']));
const DECISIONS = Object.freeze(new Set(['linked', 'would_link', 'skipped', 'error']));
const BASES = Object.freeze(new Set(['distance', 'duration', 'none']));

/**
 * Lista blanca de columnas. `buildAuditRow` construye la fila ÚNICAMENTE con
 * estas claves, de modo que es imposible que un campo con PII se cuele por
 * un spread accidental de la fila de `runs` (que sí lleva título, polyline y
 * coordenadas). Es la defensa que convierte "no guardamos PII" en una
 * propiedad del código y no en una promesa.
 */
export const ALLOWED_FIELDS = Object.freeze([
  'evaluated_at', 'run_id', 'workout_id', 'user_id',
  'mode', 'decision', 'reason', 'matcher_version', 'matching_basis',
  'actual_distance_km', 'target_distance_km',
  'actual_duration_min', 'target_duration_min', 'ratio',
  'import_lag_minutes', 'source_path', 'error_stage', 'evaluation_key',
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
/** Redondea a 3 decimales; las magnitudes de auditoría no necesitan más. */
const r3 = (v) => (v == null ? null : Math.round(v * 1000) / 1000);

/**
 * Clave lógica de la evaluación (FASE 3 del encargo).
 *
 * Une la actividad, la versión del algoritmo y el CONTENIDO de la decisión.
 * Consecuencias, que son las que el encargo pide aclarar:
 *
 *   · El webhook llega dos veces con el mismo resultado → misma clave, la
 *     segunda inserción choca contra el UNIQUE y se descarta. Una fila.
 *   · Primero dry y después live → `mode` distinto → dos filas. Correcto:
 *     son dos evaluaciones distintas y la transición es justo lo que
 *     queremos poder ver.
 *   · Cambia la sesión objetivo → `workout_id` distinto → fila nueva.
 *   · El enlace ya existe → el matcher devuelve already_linked, que es una
 *     decisión distinta de la que lo creó → fila nueva, sin pisar la
 *     original.
 *   · Sube MATCHER_VERSION → todo se reevalúa bajo clave nueva y las series
 *     de un algoritmo no se mezclan con las del otro.
 */
export function evaluationKey({ runId, matcherVersion, mode, decision, reason, workoutId }) {
  return [
    runId || '-',
    matcherVersion || '-',
    mode || '-',
    decision || '-',
    reason || '-',
    workoutId || '-',
  ].join('|');
}

/**
 * Construye la fila. Puro: no toca red ni base de datos.
 * Devuelve `null` si la fila no es válida — nunca una fila a medias, porque
 * una fila inválida haría fallar el INSERT y, en live, abortaría un vínculo
 * legítimo.
 */
export function buildAuditRow(input) {
  const {
    runId, userId, workoutId = null, mode, decision, reason,
    matchingBasis = 'none', actualDistanceKm = null, targetDistanceKm = null,
    actualDurationMin = null, targetDurationMin = null, ratio = null,
    importLagMinutes = null, errorStage = null,
    matcherVersion = MATCHER_VERSION, evaluatedAt = null,
  } = input || {};

  if (!UUID_RE.test(String(runId || ''))) return null;
  if (!UUID_RE.test(String(userId || ''))) return null;
  if (workoutId != null && !UUID_RE.test(String(workoutId))) return null;
  if (!MODES.has(mode)) return null;
  if (!DECISIONS.has(decision)) return null;
  if (!REASONS.has(reason)) return null;
  if (!BASES.has(matchingBasis)) return null;
  // Espejo de los CHECK de la migración: fallar aquí es más barato que en
  // producción, y en live un INSERT rechazado aborta el vínculo.
  if ((decision === 'error') !== (errorStage != null)) return null;
  if ((decision === 'linked' || decision === 'would_link') && workoutId == null) return null;

  const row = {
    run_id: runId,
    user_id: userId,
    workout_id: workoutId,
    mode,
    decision,
    reason,
    matcher_version: matcherVersion,
    matching_basis: matchingBasis,
    actual_distance_km: r3(num(actualDistanceKm)),
    target_distance_km: r3(num(targetDistanceKm)),
    actual_duration_min: r3(num(actualDurationMin)),
    target_duration_min: r3(num(targetDurationMin)),
    ratio: r3(num(ratio)),
    import_lag_minutes: num(importLagMinutes) == null ? null : Math.round(importLagMinutes),
    source_path: 'webhook',
    error_stage: errorStage,
    evaluation_key: evaluationKey({
      runId, matcherVersion, mode, decision, reason, workoutId,
    }),
  };
  if (evaluatedAt) row.evaluated_at = evaluatedAt;

  // Cinturón y tirantes: recorta a la lista blanca. Si alguien añade un
  // campo al objeto de arriba sin declararlo en ALLOWED_FIELDS, no viaja.
  const safe = {};
  for (const k of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(row, k)) safe[k] = row[k];
  }
  return safe;
}

/** Minutos entre el inicio real de la actividad y su evaluación. */
export function importLagMinutes(horaInicio, nowIso) {
  const t0 = horaInicio ? Date.parse(horaInicio) : NaN;
  const t1 = nowIso ? Date.parse(nowIso) : Date.now();
  if (Number.isNaN(t0) || Number.isNaN(t1)) return null;
  return Math.round((t1 - t0) / 60000);
}

/**
 * Deriva la magnitud comparada para UNA sesión candidata, replicando la
 * prioridad de `encaja()` del matcher (distancia si la hay, si no duración).
 *
 * NO decide nada: solo describe, para que la fila de auditoría diga contra
 * qué se comparó y con qué ratio. Con cero o varias candidatas devuelve
 * basis 'none', porque no hay una comparación única que describir.
 */
export function describeComparison(actividad, candidatas) {
  const vacio = {
    matchingBasis: 'none', targetDistanceKm: null, targetDurationMin: null, ratio: null,
    actualDistanceKm: num(actividad?.distanciaKm),
    actualDurationMin: num(actividad?.duracionMin),
  };
  const lista = Array.isArray(candidatas) ? candidatas : [];
  if (lista.length !== 1) return vacio;

  const w = lista[0];
  const dt = num(w?.distancia_target_km);
  const ut = num(w?.duracion_target_min);
  const dr = num(actividad?.distanciaKm);
  const ur = num(actividad?.duracionMin);

  if (dt != null && dt > 0) {
    return { ...vacio, matchingBasis: 'distance', targetDistanceKm: dt,
      ratio: dr == null ? null : dr / dt };
  }
  if (ut != null && ut > 0) {
    return { ...vacio, matchingBasis: 'duration', targetDurationMin: ut,
      ratio: ur == null ? null : ur / ut };
  }
  return vacio;
}

/**
 * Traduce el resultado del matcher a un motivo del enum, afinándolo con lo
 * que el ORQUESTADOR ya sabe (cuántas candidatas había, si tenían objetivo).
 *
 * Esta función es la razón de que el matcher no se toque: toda la
 * granularidad extra sale de datos que el linker ya tenía en la mano, no de
 * cambiar lo que el matcher devuelve.
 */
export function reasonFromMatch(resultado, candidatas) {
  const lista = Array.isArray(candidatas) ? candidatas : [];
  switch (resultado) {
    case 'matched':          return REASON.WOULD_LINK;
    case 'ambiguous':        return REASON.AMBIGUOUS;
    case 'already_linked':   return REASON.ALREADY_LINKED;
    case 'invalid_activity': return REASON.INVALID_ACTIVITY;
    case 'unsupported_sport':return REASON.UNSUPPORTED_SPORT;
    case 'date_mismatch':    return REASON.DATE_MISMATCH;
    case 'distance_mismatch': {
      // El matcher usa un único código para "ninguna candidata encajó", pero
      // la causa real importa: una sesión sin objetivo NUNCA puede encajar y
      // eso no es lo mismo que quedarse fuera del ±30 %.
      if (lista.length === 1) {
        const w = lista[0];
        const dt = num(w?.distancia_target_km);
        const ut = num(w?.duracion_target_min);
        if (dt != null && dt > 0) return REASON.DISTANCE_MISMATCH;
        if (ut != null && ut > 0) return REASON.DURATION_MISMATCH;
        return REASON.NO_TARGET;
      }
      return REASON.DISTANCE_MISMATCH;
    }
    case 'no_match':
      return lista.length === 0 ? REASON.NO_FREE_SESSION : REASON.NO_ACTIVE_PLAN;
    default:
      return REASON.EXCEPTION;
  }
}

/**
 * Inserta la fila. NUNCA lanza.
 *
 * @returns {Promise<{ok:boolean, duplicate?:boolean, error?:string}>}
 *          `ok:true` también cuando la fila ya existía (idempotencia): la
 *          decisión está registrada, que es lo único que importa a quien
 *          llama para decidir si puede seguir adelante en modo live.
 */
export async function recordEvaluation(sb, row) {
  if (!row) return { ok: false, error: 'invalid_row' };
  try {
    const { error } = await sb.from('strava_linking_audit').insert(row);
    if (!error) return { ok: true };
    // 23505 = unique_violation → ya estaba registrada. Es éxito.
    if (error.code === '23505') return { ok: true, duplicate: true };
    return { ok: false, error: error.code || 'insert_failed' };
  } catch (e) {
    return { ok: false, error: e?.code || 'exception' };
  }
}
