// ============================================================
// F134 · Emparejador puro Strava → sesión del plan
//
// Corrige el defecto del informe 133: el webhook guardaba la actividad en
// `runs` pero jamás tocaba `user_workouts`, así que el 97 % del volumen de
// entrenamiento no completaba ninguna sesión del plan (1,2 % frente al 100 %
// de la vía nativa).
//
// Este módulo SOLO DECIDE. No lee ni escribe en base de datos, no llama a
// Strava, no manda mensajes. Así se pueden probar las veinte formas de
// equivocarse sin tocar producción.
//
// PRINCIPIO RECTOR: fail closed. Ante cero candidatos, más de uno, o
// cualquier duda, NO se completa nada. Es preferible dejar una sesión sin
// marcar (el usuario puede hacerlo a mano) que dar por hecho un
// entrenamiento que no ocurrió.
// ============================================================

/** Resultados posibles. Conjunto cerrado: no hay más salidas que éstas. */
export const MATCH = Object.freeze({
  MATCHED: 'matched',
  NO_MATCH: 'no_match',
  AMBIGUOUS: 'ambiguous',
  INVALID_ACTIVITY: 'invalid_activity',
  ALREADY_LINKED: 'already_linked',
  UNSUPPORTED_SPORT: 'unsupported_sport',
  DATE_MISMATCH: 'date_mismatch',
  DISTANCE_MISMATCH: 'distance_mismatch',
});

/**
 * Margen del emparejador nativo ya en producción
 * (`api.ts:findTodaysPendingWorkout`, ±30 %). Se replica tal cual para no
 * introducir un criterio nuevo sin acreditar.
 */
export const TOLERANCIA = 0.30;

/**
 * Tipos de sesión que una actividad a pie puede completar.
 * `rest` queda FUERA a propósito: un día de descanso no se "completa"
 * saliendo a correr.
 */
export const TIPOS_CARRERA = Object.freeze([
  'walk_run', 'easy_run', 'long_run', 'tempo',
  'intervals', 'fartlek', 'specific', 'activation', 'race', 'race_day',
]);

/**
 * Compatibilidad deporte → tipos de sesión.
 *
 * `walking` sólo puede completar `walk_run` (el plan 0→5K alterna andar y
 * correr; es un contrato real del propio tipo de sesión, no una suposición).
 * La bici NO completa sesiones de un plan de carrera: no hay contrato que lo
 * respalde y el encargo lo prohíbe explícitamente.
 */
const COMPATIBILIDAD = Object.freeze({
  running: TIPOS_CARRERA,
  trail: TIPOS_CARRERA,
  walking: ['walk_run'],
});

const esFechaISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function dentroDeMargen(real, objetivo) {
  if (real == null || objetivo == null || objetivo <= 0) return false;
  return real >= objetivo * (1 - TOLERANCIA) && real <= objetivo * (1 + TOLERANCIA);
}

/**
 * ¿Esta actividad encaja con esta sesión concreta?
 *
 * Prioridad de la señal:
 *  1. Si la sesión tiene distancia objetivo → se compara la distancia.
 *  2. Si no, pero tiene duración objetivo → se compara la duración.
 *     (El 52 % de las sesiones son `walk_run`, que NUNCA llevan distancia
 *     objetivo pero SIEMPRE llevan duración. Sin esta rama el arreglo dejaría
 *     fuera justo a los principiantes, que son el caso que nos importa.)
 *  3. Si no tiene ninguno de los dos objetivos → NO se empareja jamás.
 *     No se inventa una coincidencia por ausencia de criterio.
 */
export function encaja(actividad, sesion) {
  const distObjetivo = num(sesion.distancia_target_km);
  if (distObjetivo != null && distObjetivo > 0) {
    return { ok: dentroDeMargen(num(actividad.distanciaKm), distObjetivo), criterio: 'distancia' };
  }
  const durObjetivo = num(sesion.duracion_target_min);
  if (durObjetivo != null && durObjetivo > 0) {
    return { ok: dentroDeMargen(num(actividad.duracionMin), durObjetivo), criterio: 'duracion' };
  }
  return { ok: false, criterio: 'sin_objetivo' };
}

/**
 * Evalúa una actividad de Strava contra las sesiones pendientes del plan.
 *
 * @param {object} entrada
 * @param {object} entrada.actividad  { runId, userId, deporte, distanciaKm, duracionMin, fechaLocal, yaVinculada }
 * @param {object} entrada.plan       { id, userId, estado }
 * @param {Array}  entrada.candidatas filas de `user_workouts` del plan
 * @returns {{ resultado: string, workoutId: string|null, criterio: string|null, candidatasEvaluadas: number }}
 */
export function emparejar({ actividad, plan, candidatas }) {
  const salida = (resultado, extra = {}) => ({
    resultado, workoutId: null, criterio: null, candidatasEvaluadas: 0, ...extra,
  });

  // ── 1 · La actividad debe ser utilizable ──
  const a = actividad || {};
  if (!a.runId || !a.userId) return salida(MATCH.INVALID_ACTIVITY);
  if (!esFechaISO(a.fechaLocal)) return salida(MATCH.INVALID_ACTIVITY);
  const dist = num(a.distanciaKm);
  const dur = num(a.duracionMin);
  // Sin ninguna magnitud positiva no hay nada que comparar.
  if ((dist == null || dist <= 0) && (dur == null || dur <= 0)) return salida(MATCH.INVALID_ACTIVITY);

  // ── 2 · Una actividad no se reutiliza NUNCA ──
  if (a.yaVinculada === true) return salida(MATCH.ALREADY_LINKED);

  // ── 3 · Deporte compatible ──
  const tiposPermitidos = COMPATIBILIDAD[String(a.deporte || '')];
  if (!tiposPermitidos) return salida(MATCH.UNSUPPORTED_SPORT);

  // ── 4 · El plan debe estar activo y ser del mismo usuario ──
  const p = plan || {};
  if (!p.id || p.estado !== 'active') return salida(MATCH.NO_MATCH);
  if (p.userId !== a.userId) return salida(MATCH.NO_MATCH);

  const todas = Array.isArray(candidatas) ? candidatas : [];

  // ── 5 · Sólo sesiones libres: pendientes y sin actividad ya asociada ──
  // Una sesión ya completada no se toca jamás.
  const libres = todas.filter(
    (w) => w && w.plan_id === p.id && w.estado === 'pending' && !w.actividad_id
  );
  if (libres.length === 0) return salida(MATCH.NO_MATCH);

  // ── 6 · Fecha LOCAL de la actividad, no la del servidor ──
  // `runs.fecha` ya viene de `start_date_local` de Strava, así que un webhook
  // que llegue horas tarde o un reproceso siguen apuntando al día correcto.
  const mismoDia = libres.filter((w) => w.fecha === a.fechaLocal);
  if (mismoDia.length === 0) return salida(MATCH.DATE_MISMATCH);

  // ── 7 · Tipo de sesión compatible con el deporte ──
  const compatibles = mismoDia.filter((w) => tiposPermitidos.includes(String(w.tipo || '')));
  if (compatibles.length === 0) return salida(MATCH.UNSUPPORTED_SPORT);

  // ── 8 · Magnitud dentro del margen ──
  const encajan = [];
  for (const w of compatibles) {
    const r = encaja(a, w);
    if (r.ok) encajan.push({ w, criterio: r.criterio });
  }
  if (encajan.length === 0) {
    return salida(MATCH.DISTANCE_MISMATCH, { candidatasEvaluadas: compatibles.length });
  }

  // ── 9 · Exactamente una, o nada ──
  if (encajan.length > 1) {
    return salida(MATCH.AMBIGUOUS, { candidatasEvaluadas: encajan.length });
  }

  return salida(MATCH.MATCHED, {
    workoutId: encajan[0].w.id,
    criterio: encajan[0].criterio,
    candidatasEvaluadas: 1,
  });
}
