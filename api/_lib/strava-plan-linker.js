// ============================================================
// F134 · Orquestador: aplica el emparejador y escribe, si procede.
//
// Separado del matcher puro a propósito: aquí vive todo lo que toca el
// mundo exterior (BD, entorno), y nada de la lógica de decisión.
//
// GARANTÍA INNEGOCIABLE: esta función NUNCA lanza. Un fallo aquí no puede
// impedir que la actividad se guarde ni romper el camino legacy de José y
// Ana. El peor caso es que la sesión se quede pendiente, exactamente como
// hoy.
// ============================================================

import { emparejar, MATCH } from './strava-plan-matcher.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Durante el canario, como mucho DOS cuentas internas. */
export const MAX_ALLOWLIST = 2;

/**
 * Puertas del canario, en BD (espejo del patrón ya acreditado en F118).
 * Kill switch = un solo UPDATE, sin deploy y sin OTA.
 *
 * FAIL CLOSED ante CUALQUIER anomalía: fila ausente, error de consulta,
 * allowlist con más de dos entradas o con algo que no sea un UUID (por
 * ejemplo un correo). En todos esos casos, camino legacy exacto.
 */
export async function leerConfig(sb) {
  try {
    const { data, error } = await sb
      .from('strava_linking_config')
      .select('enabled, dry_run, allowlist')
      .eq('id', 1)
      .limit(1);
    if (error) return { ok: false, motivo: 'config_query_failed' };
    if (!Array.isArray(data) || data.length === 0) return { ok: false, motivo: 'config_missing' };
    const row = data[0];
    const lista = Array.isArray(row.allowlist) ? row.allowlist : [];
    if (lista.length > MAX_ALLOWLIST) return { ok: false, motivo: 'allowlist_too_big' };
    // Rechaza correos y cualquier cosa que no sea un UUID.
    if (!lista.every((u) => typeof u === 'string' && UUID_RE.test(u))) {
      return { ok: false, motivo: 'allowlist_invalid' };
    }
    return {
      ok: true,
      enabled: row.enabled === true,
      // Sólo un `false` explícito desactiva el dry-run. Un null o un valor
      // raro dejan el modo seguro.
      dryRun: row.dry_run !== false,
      allowlist: lista,
    };
  } catch {
    return { ok: false, motivo: 'config_exception' };
  }
}

/**
 * Decide el modo para ESTE usuario.
 *
 *   'off' → no se hace nada (camino legacy).
 *   'dry' → se evalúa y se registra, pero NO se escribe.
 *   'on'  → se evalúa y se escribe.
 *
 * REGLA DE SEGURIDAD CLAVE: con `dry_run=false` sólo entran las cuentas de la
 * allowlist. Una allowlist vacía con dry_run desactivado NO significa "todo el
 * mundo" — significa APAGADO. Así es imposible activar globalmente por
 * descuido: hace falta un cambio deliberado y separado.
 *
 * En dry-run sí se permite la evaluación global (allowlist vacía), porque no
 * escribe nada y es justo lo que queremos observar.
 */
export function modoParaUsuario(config, userId) {
  if (!config || config.ok !== true || config.enabled !== true) return 'off';
  const enLista = Boolean(userId) && config.allowlist.includes(userId);
  if (config.dryRun) return config.allowlist.length === 0 || enLista ? 'dry' : 'off';
  return enLista ? 'on' : 'off';
}

/**
 * @returns {Promise<{modo:string, resultado:string, escrito:boolean, motivo:string|null}>}
 *          Nunca rechaza.
 */
export async function vincularActividadConPlan(sb, run, opciones = {}) {
  let modo = opciones.modo || null;
  const fuera = (resultado, extra = {}) => ({ modo, resultado, escrito: false, motivo: null, ...extra });

  try {
    if (!modo) {
      const config = await leerConfig(sb);
      modo = modoParaUsuario(config, run && run.user_id);
      if (modo === 'off') {
        return { modo, resultado: 'desactivado', escrito: false, motivo: config.ok ? null : config.motivo };
      }
    }
    if (modo === 'off') return fuera('desactivado');

    if (!run || !run.id || !run.user_id) return fuera(MATCH.INVALID_ACTIVITY);

    // 1 · Plan activo del usuario. Si tiene varios (no debería), fail closed.
    const { data: planes, error: errPlan } = await sb
      .from('user_plans')
      .select('id, user_id, estado')
      .eq('user_id', run.user_id)
      .eq('estado', 'active')
      .limit(2);
    if (errPlan) return fuera('error_consulta', { motivo: 'user_plans' });
    if (!planes || planes.length !== 1) return fuera(MATCH.NO_MATCH);
    const plan = { id: planes[0].id, userId: planes[0].user_id, estado: planes[0].estado };

    // 2 · Candidatas: sólo las del día LOCAL de la actividad, pendientes y
    //     libres. La fecha sale de `runs.fecha`, que ya se calcula desde
    //     `start_date_local` de Strava — no del reloj del servidor.
    const { data: candidatas, error: errW } = await sb
      .from('user_workouts')
      .select('id, plan_id, estado, fecha, tipo, actividad_id, distancia_target_km, duracion_target_min')
      .eq('plan_id', plan.id)
      .eq('fecha', run.fecha)
      .eq('estado', 'pending')
      .is('actividad_id', null);
    if (errW) return fuera('error_consulta', { motivo: 'user_workouts' });

    // 3 · ¿Esta actividad ya completó alguna sesión? (reintento del webhook)
    const { data: yaUsada, error: errU } = await sb
      .from('user_workouts')
      .select('id')
      .eq('actividad_id', run.id)
      .limit(1);
    if (errU) return fuera('error_consulta', { motivo: 'ya_vinculada' });

    // 4 · Decisión pura
    const decision = emparejar({
      actividad: {
        runId: run.id,
        userId: run.user_id,
        deporte: run.deporte,
        distanciaKm: typeof run.distancia_km === 'number' ? run.distancia_km : null,
        duracionMin: typeof run.duracion_segundos === 'number' ? run.duracion_segundos / 60 : null,
        fechaLocal: run.fecha,
        yaVinculada: Array.isArray(yaUsada) && yaUsada.length > 0,
      },
      plan,
      candidatas: candidatas || [],
    });

    if (decision.resultado !== MATCH.MATCHED) return fuera(decision.resultado);
    if (modo === 'dry') return fuera('matched_dry_run', { motivo: decision.criterio });

    // 5 · Escritura atómica. Todos los guards se re-verifican dentro de la
    //     RPC, así que perder una carrera concurrente no escribe ni falla.
    const { data: res, error: errRpc } = await sb.rpc('link_strava_run_to_workout', {
      p_user_id: run.user_id,
      p_run_id: run.id,
      p_workout_id: decision.workoutId,
    });
    if (errRpc) return fuera('error_escritura', { motivo: errRpc.message ? 'rpc' : null });

    const fila = Array.isArray(res) ? res[0] : res;
    return {
      modo,
      resultado: fila?.escrito ? 'completada' : 'sin_cambios',
      escrito: Boolean(fila?.escrito),
      motivo: fila?.motivo ?? null,
    };
  } catch (e) {
    // Fail closed y silencioso hacia arriba: el flujo legacy continúa.
    console.warn('[f134] vinculacion no aplicada:', e?.message || 'error');
    return fuera('excepcion');
  }
}
