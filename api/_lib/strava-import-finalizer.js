// Finalización mínima y fail-closed del import servidor de Strava.
//
// Las dos RPC son SECURITY DEFINER con EXECUTE revocado a clientes. Bloquean
// la fila por dueño, resuelven el vínculo permitido y solo después cambian el
// pipeline v1→v2; ese cambio despierta una única pareja José/Ana.
async function runFinalizer(sb, rpcName, args) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await sb.rpc(rpcName, args);
    if (!error && data?.ok === true) return true;
  }
  return false;
}

export async function finalizeStravaEnduranceImport(sb, { runId, userId }) {
  if (typeof runId !== 'string' || runId.length === 0
      || typeof userId !== 'string' || userId.length === 0) return false;
  return runFinalizer(sb, 'f182_finalize_strava_endurance_import', {
    p_user_id: userId,
    p_run_id: runId,
  });
}

export async function finalizeStravaStrengthImport(sb, { runId, userId }) {
  if (typeof runId !== 'string' || runId.length === 0
      || typeof userId !== 'string' || userId.length === 0) return false;
  return runFinalizer(sb, 'f182_finalize_strava_strength_import', {
    p_user_id: userId,
    p_run_id: runId,
    // Strava no acredita ejercicios, series ni cargas: no inventamos la
    // sesión del plan a partir de fecha y duración.
    p_planned_session_id: null,
  });
}

// Claves EXACTAS del objeto canónico que persiste f182_verify_strava_endurance_import
// (20260907052100). Contrato compartido con strength-engine (_workout.ts): cada clave
// viaja siempre; la ausencia es null (nunca se conserva el dato antiguo de la fila).
//   a) canónicos del proveedor (sustituidos siempre), b) derivados con cálculo permitido
//   (ritmo_promedio, splits, ritmo_mejor), c) titulo = metadato personal (solo si vacío).
export const STRAVA_CANONICAL_KEYS = [
  'strava_activity_id', 'athlete_id', 'deporte', 'strava_sport_type',
  'distancia_km', 'duracion_segundos', 'elapsed_segundos', 'ritmo_promedio', 'ritmo_mejor',
  'fecha', 'hora_inicio', 'hora_fin', 'calorias', 'elevacion_ganada', 'velocidad_max',
  'cadencia_media', 'hr_avg', 'hr_max', 'potencia_media', 'potencia_max', 'es_indoor',
  'polyline_encoded', 'lat_inicio', 'lng_inicio', 'lat_fin', 'lng_fin', 'splits', 'titulo',
];

// Mejor parcial (menor s/km entre los parciales con ritmo), como hace el registro propio.
export function bestSplitPace(splits) {
  if (!Array.isArray(splits) || splits.length === 0) return null;
  const withPace = splits.filter((sp) => Number(sp?.seconds) > 0);
  if (withPace.length === 0) return null;
  const best = withPace.reduce((acc, sp) => (Number(sp.seconds) < Number(acc.seconds) ? sp : acc), withPace[0]);
  return typeof best.time === 'string' && best.time !== '--:--' ? best.time : null;
}

// Objeto canónico que la RPC de verificación persiste: SIEMPRE construido desde la
// fila derivada de la actividad real de Strava (mapActivityToRun), nunca de la fila
// existente, con EXACTAMENTE las claves de STRAVA_CANONICAL_KEYS. Lo que Strava no
// entrega viaja como null y la RPC lo persiste como ausencia.
export function canonicalEnduranceFromRow(row, athleteId) {
  const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
  const text = (v, max) => (typeof v === 'string' && v.trim() !== '' ? v.trim().slice(0, max) : null);
  const splits = Array.isArray(row?.splits) && row.splits.length > 0
    ? row.splits.map((sp) => ({
      km: num(sp?.km), time: text(sp?.time, 8), seconds: num(sp?.seconds),
      elevation_gain: num(sp?.elevation_gain), hr_avg: num(sp?.hr_avg),
    })).filter((sp) => sp.km != null)
    : null;
  const canonical = {
    strava_activity_id: num(row?.strava_activity_id), athlete_id: num(athleteId),
    deporte: row?.deporte ?? null, strava_sport_type: text(row?.strava_sport_type, 40),
    distancia_km: num(row?.distancia_km), duracion_segundos: num(row?.duracion_segundos),
    elapsed_segundos: num(row?.elapsed_segundos), ritmo_promedio: text(row?.ritmo_promedio, 8),
    ritmo_mejor: text(row?.ritmo_mejor, 8) ?? bestSplitPace(splits),
    fecha: row?.fecha ?? null, hora_inicio: row?.hora_inicio ?? null, hora_fin: row?.hora_fin ?? null,
    calorias: num(row?.calorias), elevacion_ganada: num(row?.elevacion_ganada), velocidad_max: num(row?.velocidad_max),
    cadencia_media: num(row?.cadencia_media), hr_avg: num(row?.hr_avg), hr_max: num(row?.hr_max),
    potencia_media: num(row?.potencia_media), potencia_max: num(row?.potencia_max),
    es_indoor: row?.es_indoor === true,
    polyline_encoded: text(row?.polyline_encoded, 100000),
    lat_inicio: num(row?.lat_inicio), lng_inicio: num(row?.lng_inicio),
    lat_fin: num(row?.lat_fin), lng_fin: num(row?.lng_fin),
    splits: splits && splits.length > 0 ? splits : null,
    titulo: text(row?.titulo, 160),
  };
  // Coordenadas: o el par completo o nada (nunca media coordenada).
  if (canonical.lat_inicio == null || canonical.lng_inicio == null) { canonical.lat_inicio = null; canonical.lng_inicio = null; }
  if (canonical.lat_fin == null || canonical.lng_fin == null) { canonical.lat_fin = null; canonical.lng_fin = null; }
  for (const key of STRAVA_CANONICAL_KEYS) if (!(key in canonical)) canonical[key] = null;
  return canonical;
}

// Verificación de servidor: la RPC contrasta identidad de actividad y atleta con
// los datos del servidor, valida la modalidad y persiste las métricas canónicas.
// Sin esta verificación la finalización rechaza la fila (strava_import_unverified).
export async function verifyStravaEnduranceImport(sb, { runId, userId, activity }) {
  if (typeof runId !== 'string' || runId.length === 0
      || typeof userId !== 'string' || userId.length === 0
      || !activity || typeof activity !== 'object') return false;
  if (!Number.isSafeInteger(Number(activity.athlete_id)) || Number(activity.athlete_id) <= 0) return false;
  if (!Number.isSafeInteger(Number(activity.strava_activity_id)) || Number(activity.strava_activity_id) <= 0) return false;
  return runFinalizer(sb, 'f182_verify_strava_endurance_import', {
    p_user_id: userId,
    p_run_id: runId,
    p_activity: activity,
  });
}
