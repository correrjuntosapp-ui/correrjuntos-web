// ============================================================
// LIFECYCLE CORE — decisiones puras del pipeline de trials.
// Un único fichero JS plano importado por:
//   · supabase/functions/revenucat-webhook/index.ts  (Deno)
//   · api/_lib/jobs/lifecycle-trial.js               (Node/Vercel)
//   · tools/tests/lifecycle-core.test.mjs            (Node, tests)
// Sin dependencias. Sin I/O. Sin datos personales.
// ============================================================

export const SEND_DAYS = [1, 3, 7, 11, 14];

// Ventana de recuperación del cron: un hito se puede enviar hasta GRACE_DAYS
// después de su día exacto. 1 día cubre exactamente UNA ejecución diaria
// perdida; más sería enviar contenido caducado (los hitos van a >=2 días de
// distancia, así que grace=1 nunca colisiona con el hito siguiente).
export const GRACE_DAYS = 1;

// Separación mínima entre dos lifecycle emails del mismo trial.
export const MIN_SEPARATION_MS = 20 * 60 * 60 * 1000; // 20h: impide dobles envíos pero tolera el jitter del cron diario (~09:21 ± segundos)

const DAY_MS = 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// Identificación de proyecto/entitlement CorrerJuntos.
// El webhook solo recibe eventos del proyecto RC de CJ (la URL se configura
// por proyecto), pero se comprueba además el contenido del evento:
// MisCalorías u otro proyecto jamás debe crear filas de trial.
// ─────────────────────────────────────────────────────────────
const CJ_ENTITLEMENT = 'Correr Juntos Pro';
const CJ_PRODUCT_RE = /^(com\.correrjuntos\.app\.premium|correrjuntos_premium)/;

export function isCorrerJuntosPremiumEvent(event) {
  const ents = Array.isArray(event.entitlement_ids)
    ? event.entitlement_ids
    : (event.entitlement_id ? [event.entitlement_id] : []);
  if (ents.includes(CJ_ENTITLEMENT)) return true;
  const product = String(event.product_id || event.product_identifier || '');
  return CJ_PRODUCT_RE.test(product);
}

export function planTypeFromProduct(productId) {
  const p = String(productId || '').toLowerCase();
  return (p.includes('yearly') || p.includes('annual')) ? 'yearly' : 'monthly';
}

// ─────────────────────────────────────────────────────────────
// decideTrialRegistry — red de seguridad server-side.
// Decide qué hacer en trial_starts ante un evento RevenueCat.
// event: payload RC (campos usados: type, period_type, environment,
//        app_user_id, product_id, store, purchased_at_ms, expiration_at_ms,
//        original_transaction_id, event_timestamp_ms)
// existingRow: fila activa actual del usuario en trial_starts (o null).
//              Campos usados: id, status, started_at, completed_at,
//              store_transaction_id, source.
// Devuelve { action: 'insert'|'update'|'noop', reason, row? }.
// El servidor PREVALECE sobre el cliente en fechas/producto/store/estado.
// ─────────────────────────────────────────────────────────────
export function decideTrialRegistry(event, existingRow) {
  const type = String(event.type || '');
  const periodType = String(event.period_type || 'NORMAL');

  // Solo eventos de concesión con periodo TRIAL crean/actualizan registro.
  const TRIAL_REGISTRY_EVENTS = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE'];
  if (!TRIAL_REGISTRY_EVENTS.includes(type)) return { action: 'noop', reason: 'event_not_registry' };
  if (periodType !== 'TRIAL') return { action: 'noop', reason: 'not_trial_period' };

  // Aislamiento de proyecto: MisCalorías u otros no entran al funnel.
  if (!isCorrerJuntosPremiumEvent(event)) return { action: 'noop', reason: 'other_project' };

  // SANDBOX no contamina el funnel de emails de producción. (El espejo
  // premium sí procesa sandbox — decisión previa del webhook — pero los
  // EMAILS a compradores de prueba serían ruido para cuentas internas.)
  if (String(event.environment || '') === 'SANDBOX') return { action: 'noop', reason: 'sandbox' };

  const userId = String(event.app_user_id || '');
  if (!userId || userId.startsWith('$RCAnonymousID')) return { action: 'noop', reason: 'anonymous_user' };

  const startedAt = event.purchased_at_ms ? new Date(Number(event.purchased_at_ms)).toISOString() : null;
  const expiresAt = event.expiration_at_ms ? new Date(Number(event.expiration_at_ms)).toISOString() : null;
  const eventTs = Number(event.event_timestamp_ms) || 0;

  const serverRow = {
    user_id: userId,
    plan_type: planTypeFromProduct(event.product_id),
    status: 'trial_active',
    reference: String(event.product_id || ''),
    store_transaction_id: event.original_transaction_id ? String(event.original_transaction_id) : null,
    started_at: startedAt,
    expires_at: expiresAt,
    source: 'revenuecat',
  };

  if (!existingRow) return { action: 'insert', reason: 'new_trial', row: serverRow };

  // Ya existe fila (del cliente o de un evento anterior).
  // Mismo linaje (o fila activa del mismo usuario): converger en UNA fila.
  const terminal = ['paid', 'expired', 'cancelled'].includes(String(existingRow.status));
  if (terminal) {
    // No degradar un estado final MÁS RECIENTE con un evento antiguo.
    const completedMs = existingRow.completed_at ? Date.parse(existingRow.completed_at) : 0;
    if (eventTs && completedMs && eventTs <= completedMs) {
      return { action: 'noop', reason: 'stale_vs_terminal' };
    }
    // Evento posterior al cierre (p. ej. UNCANCELLATION tras cancelar
    // durante el trial): reactivar con datos de servidor.
    if (type === 'UNCANCELLATION') {
      return { action: 'update', reason: 'reactivated_after_terminal', row: serverRow };
    }
    return { action: 'noop', reason: 'terminal_state_kept' };
  }

  // Fila activa: el servidor completa/corrige los campos que el cliente no
  // tiene (fechas reales, otx, store) sin duplicar.
  return { action: 'update', reason: 'server_enrich', row: serverRow };
}

// ─────────────────────────────────────────────────────────────
// selectMilestone — selección tolerante a una ejecución perdida.
// Reglas:
//  · hitos [1,3,7,11,14] con ventana de gracia GRACE_DAYS;
//  · máximo UN hito por trial y ejecución: el pendiente MÁS RECIENTE;
//  · nunca un hito anterior a otro ya enviado;
//  · nunca hitos que ya eran pasado cuando la FILA se creó (backfill
//    tardío no dispara ráfagas históricas);
//  · separación mínima MIN_SEPARATION_MS respecto al último envío;
//  · solo status trial_active.
// Devuelve { day } o { skip: reason }.
// ─────────────────────────────────────────────────────────────
export function selectMilestone({ status, startedAt, rowCreatedAt, sentDays, lastSentAt, nowMs, expiresAt }) {
  if (status !== 'trial_active') return { skip: 'status_changed' };
  // Trial ya vencido por fecha real de tienda (aunque el EXPIRATION aun no
  // haya llegado): jamas enviar (p.ej. dia 14 tras expires_at).
  if (expiresAt) {
    const expMs = Date.parse(expiresAt);
    if (Number.isFinite(expMs) && (Number(nowMs) || Date.now()) >= expMs) return { skip: 'expired_window' };
  }

  const startMs = Date.parse(startedAt);
  if (!Number.isFinite(startMs)) return { skip: 'invalid_start' };
  const now = Number(nowMs) || Date.now();

  const daysSince = Math.floor((now - startMs) / DAY_MS);
  const createdMs = rowCreatedAt ? Date.parse(rowCreatedAt) : startMs;
  const daysAtCreation = Math.max(0, Math.floor((createdMs - startMs) / DAY_MS));

  const sent = new Set(sentDays || []);
  const maxSent = Math.max(0, ...sent);

  if (lastSentAt) {
    const lastMs = Date.parse(lastSentAt);
    if (Number.isFinite(lastMs) && now - lastMs < MIN_SEPARATION_MS) {
      return { skip: 'min_separation' };
    }
  }

  const candidates = SEND_DAYS.filter((m) =>
    !sent.has(m) &&
    m <= daysSince &&                 // ya vencido
    daysSince - m <= GRACE_DAYS &&    // dentro de la ventana de gracia
    m > maxSent &&                    // nunca por detrás de uno ya enviado
    m >= daysAtCreation               // hitos pre-fila quedan renunciados
  );

  if (candidates.length > 0) return { day: Math.max(...candidates) };

  // Razones explícitas para observabilidad (sin datos personales):
  const pendientes = SEND_DAYS.filter((m) => !sent.has(m) && m <= daysSince);
  if (pendientes.some((m) => m <= maxSent)) return { skip: 'newer_milestone_sent' };
  if (pendientes.some((m) => m < daysAtCreation)) return { skip: 'forfeited_prebackfill' };
  if (pendientes.some((m) => daysSince - m > GRACE_DAYS)) return { skip: 'stale' };
  return { skip: 'not_due' };
}
