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
//
// [F146.4] Instrumentación durable. Cada retorno deja una fila en
// `strava_linking_audit` porque los logs de Vercel no permiten reconstruir
// la ventana (21 líneas recuperables en 7 días frente a ~150 importaciones).
//
// La instrumentación NO decide: el margen ±30 %, el matcher, `dry_run` y la
// allowlist quedan exactamente como estaban, y `emparejar()` no se toca ni
// una línea. La granularidad extra de los motivos sale de datos que este
// orquestador YA tenía en la mano (cuántos planes, cuántas candidatas), no
// de cambiar lo que el matcher devuelve.
//
// Único cambio de comportamiento, y lo exige el encargo: en modo `on`, si la
// decisión no puede registrarse, NO se vincula (`auditoria_no_disponible`).
// Vincular sin dejar rastro es el fallo que esta ronda existe para impedir.
// En `dry` y en las puertas del canario el registro es best-effort y un
// fallo se traga, para no romper nunca el camino legacy.
// ============================================================

import { emparejar, MATCH } from './strava-plan-matcher.js';
import {
  MATCHER_VERSION, REASON, buildAuditRow, recordEvaluation,
  importLagMinutes, describeComparison, reasonFromMatch,
} from './strava-linking-audit.js';
// [F146.6A] `e.message` puede arrastrar identificadores; solo la clase.
import { logError, errorKind, errorCode } from './strava-log.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Durante el canario, como mucho DOS cuentas internas. */
export const MAX_ALLOWLIST = 2;

/** Vocabulario interno del orquestador → vocabulario del contrato de auditoría. */
const MODO_AUDIT = Object.freeze({ off: 'disabled', dry: 'dry', on: 'live' });

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
 * [F146.4] Por qué exactamente quedó este usuario fuera.
 *
 * `modoParaUsuario` colapsa en 'off' dos situaciones muy distintas: que el
 * canario esté apagado y que el usuario no esté en la allowlist. Para la
 * auditoría no es lo mismo, y distinguirlo aquí no cambia el modo devuelto.
 */
export function motivoDeExclusion(config, userId) {
  if (!config || config.ok !== true) return config?.motivo || REASON.CONFIG_EXCEPTION;
  if (config.enabled !== true) return REASON.DISABLED;
  const enLista = Boolean(userId) && config.allowlist.includes(userId);
  if (!enLista) return REASON.NOT_IN_ALLOWLIST;
  return REASON.DISABLED;
}

/**
 * @returns {Promise<{modo:string, resultado:string, escrito:boolean, motivo:string|null}>}
 *          Nunca rechaza.
 */
export async function vincularActividadConPlan(sb, run, opciones = {}) {
  let modo = opciones.modo || null;
  const fuera = (resultado, extra = {}) => ({ modo, resultado, escrito: false, motivo: null, ...extra });

  const nowIso = opciones.nowIso || new Date().toISOString();
  const lag = importLagMinutes(run && run.hora_inicio, nowIso);

  /**
   * Registra una evaluación. Best-effort por defecto; devuelve el resultado
   * para que el camino live pueda fallar cerrado si no pudo anotarse.
   */
  const anotar = async (decision, reason, extra = {}) => {
    const fila = buildAuditRow({
      runId: run && run.id,
      userId: run && run.user_id,
      workoutId: extra.workoutId ?? null,
      mode: MODO_AUDIT[modo] || 'disabled',
      decision,
      reason,
      matcherVersion: MATCHER_VERSION,
      importLagMinutes: lag,
      errorStage: extra.errorStage ?? null,
      evaluatedAt: nowIso,
      ...(extra.comparison || {}),
    });
    return recordEvaluation(sb, fila);
  };

  try {
    if (!modo) {
      const config = await leerConfig(sb);
      modo = modoParaUsuario(config, run && run.user_id);
      if (modo === 'off') {
        await anotar('skipped', motivoDeExclusion(config, run && run.user_id));
        return { modo, resultado: 'desactivado', escrito: false, motivo: config.ok ? null : config.motivo };
      }
    }
    if (modo === 'off') {
      await anotar('skipped', REASON.DISABLED);
      return fuera('desactivado');
    }

    if (!run || !run.id || !run.user_id) {
      // Sin identidad no hay fila que escribir: `buildAuditRow` la rechaza y
      // `anotar` devuelve ok:false. Se intenta igual por si sólo falta uno.
      await anotar('skipped', REASON.INVALID_ACTIVITY);
      return fuera(MATCH.INVALID_ACTIVITY);
    }

    // 1 · Plan activo del usuario. Si tiene varios (no debería), fail closed.
    const { data: planes, error: errPlan } = await sb
      .from('user_plans')
      .select('id, user_id, estado')
      .eq('user_id', run.user_id)
      .eq('estado', 'active')
      .limit(2);
    if (errPlan) {
      await anotar('error', REASON.QUERY_FAILED, { errorStage: 'user_plans' });
      return fuera('error_consulta', { motivo: 'user_plans' });
    }
    if (!planes || planes.length !== 1) {
      // Mismo desenlace que siempre; la auditoría sí separa las dos causas.
      await anotar('skipped', (planes && planes.length > 1)
        ? REASON.MULTIPLE_ACTIVE_PLANS
        : REASON.NO_ACTIVE_PLAN);
      return fuera(MATCH.NO_MATCH);
    }
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
    if (errW) {
      await anotar('error', REASON.QUERY_FAILED, { errorStage: 'user_workouts' });
      return fuera('error_consulta', { motivo: 'user_workouts' });
    }

    // 3 · ¿Esta actividad ya completó alguna sesión? (reintento del webhook)
    const { data: yaUsada, error: errU } = await sb
      .from('user_workouts')
      .select('id')
      .eq('actividad_id', run.id)
      .limit(1);
    if (errU) {
      await anotar('error', REASON.QUERY_FAILED, { errorStage: 'ya_vinculada' });
      return fuera('error_consulta', { motivo: 'ya_vinculada' });
    }

    // 4 · Decisión pura
    const actividad = {
      runId: run.id,
      userId: run.user_id,
      deporte: run.deporte,
      distanciaKm: typeof run.distancia_km === 'number' ? run.distancia_km : null,
      duracionMin: typeof run.duracion_segundos === 'number' ? run.duracion_segundos / 60 : null,
      fechaLocal: run.fecha,
      yaVinculada: Array.isArray(yaUsada) && yaUsada.length > 0,
    };
    const decision = emparejar({ actividad, plan, candidatas: candidatas || [] });

    // Descripción de la magnitud comparada. Puramente informativa.
    const comparison = describeComparison(actividad, candidatas);

    if (decision.resultado !== MATCH.MATCHED) {
      await anotar('skipped', reasonFromMatch(decision.resultado, candidatas), { comparison });
      return fuera(decision.resultado);
    }

    if (modo === 'dry') {
      await anotar('would_link', REASON.WOULD_LINK, {
        workoutId: decision.workoutId, comparison,
      });
      return fuera('matched_dry_run', { motivo: decision.criterio });
    }

    // ── Camino live ────────────────────────────────────────
    // RESERVA: se anota la intención ANTES de escribir. Si no se puede
    // registrar, se aborta sin llamar a la RPC — nada se vincula y nada
    // queda silencioso. Es el único punto donde la instrumentación puede
    // cambiar el desenlace, y sólo en modo `on`.
    const reserva = await anotar('would_link', REASON.WOULD_LINK, {
      workoutId: decision.workoutId, comparison,
    });
    if (!reserva.ok) {
      return fuera('auditoria_no_disponible', { motivo: reserva.error || 'audit_failed' });
    }

    // 5 · Escritura atómica. Todos los guards se re-verifican dentro de la
    //     RPC, así que perder una carrera concurrente no escribe ni falla.
    const { data: res, error: errRpc } = await sb.rpc('link_strava_run_to_workout', {
      p_user_id: run.user_id,
      p_run_id: run.id,
      p_workout_id: decision.workoutId,
    });
    if (errRpc) {
      // El fallo del desenlace es best-effort: la fila de reserva ya prueba
      // que la decisión se tomó, así que nunca queda silenciosa.
      await anotar('error', REASON.WRITE_FAILED, { errorStage: 'rpc', comparison });
      return fuera('error_escritura', { motivo: errRpc.message ? 'rpc' : null });
    }

    const fila = Array.isArray(res) ? res[0] : res;
    if (fila?.escrito) {
      await anotar('linked', REASON.LINKED, { workoutId: decision.workoutId, comparison });
    } else {
      await anotar('skipped', REASON.NO_CHANGES, { comparison });
    }
    return {
      modo,
      resultado: fila?.escrito ? 'completada' : 'sin_cambios',
      escrito: Boolean(fila?.escrito),
      motivo: fila?.motivo ?? null,
    };
  } catch (e) {
    // Fail closed y silencioso hacia arriba: el flujo legacy continúa.
    logError('[f134]', {
      stage: 'linking', outcome: 'not_applied',
      error_kind: errorKind(e), error_code: errorCode(e),
      trace_id: opciones.traceId,
    });
    try { await anotar('error', REASON.EXCEPTION, { errorStage: 'exception' }); } catch { /* nunca lanza */ }
    return fuera('excepcion');
  }
}
