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
