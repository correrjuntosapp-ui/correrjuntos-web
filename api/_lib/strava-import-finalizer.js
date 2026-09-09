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

// Campos canónicos que la verificación persiste (los que usan plan, progreso y
// resúmenes). Se construyen SIEMPRE a partir de la actividad devuelta por Strava,
// nunca de la fila existente.
export function canonicalEnduranceFromRow(row, athleteId) {
  const num = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));
  return {
    strava_activity_id: num(row?.strava_activity_id),
    athlete_id: num(athleteId),
    deporte: row?.deporte ?? null,
    distancia_km: num(row?.distancia_km),
    duracion_segundos: num(row?.duracion_segundos),
    elapsed_segundos: num(row?.elapsed_segundos),
    ritmo_promedio: row?.ritmo_promedio ?? null,
    fecha: row?.fecha ?? null,
    hora_inicio: row?.hora_inicio ?? null,
    hora_fin: row?.hora_fin ?? null,
    hr_avg: num(row?.hr_avg), hr_max: num(row?.hr_max),
    elevacion_ganada: num(row?.elevacion_ganada), cadencia_media: num(row?.cadencia_media),
    potencia_media: num(row?.potencia_media), potencia_max: num(row?.potencia_max),
    calorias: num(row?.calorias), velocidad_max: num(row?.velocidad_max),
    es_indoor: row?.es_indoor === true,
    strava_sport_type: row?.strava_sport_type ?? null,
    titulo: row?.titulo ?? null,
  };
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
