// Latido commercial telemetry, not a ledger of store transactions or revenue.
// Read-only, paginated, with a fixed cutoff. Never report failed reads as zero.
const INTERNAL = ['guetto2012', 'mundodefabulas11', 'review@', 'cloudtestlab', '@partners.correrjuntos.app', '@correrjuntos.com', '@example.invalid'];
export const isInternal = (email) => INTERNAL.some((part) => String(email || '').toLowerCase().includes(part));

const EVENTS = [
  'paywall_opened', 'paywall_view_eligible_trial', 'paywall_view_no_trial',
  'purchase_cta_clicked', 'purchase_started', 'purchase_cancelled',
  'purchase_success', 'purchase_failed', 'purchase_restored',
  'purchase_pkg_guard', 'entitlement_activated',
];
const METRICS = [
  'compras_ok_ayer', 'compras_fallidas_ayer', 'compras_canceladas_ayer', 'compras_restauradas_ayer',
  'paywall_7d', 'paywall_con_trial_7d', 'paywall_sin_trial_7d',
  'paywall_usuarios_unicos_elegibles_7d', 'paywall_sesiones_elegibles_7d',
  'cta_taps_7d', 'purchase_started_7d', 'purchase_cancelled_7d', 'purchase_success_7d',
  'trials_7d', 'entitlement_activated_7d', 'compras_fallidas_reales_7d',
  'eventos_internos_excluidos_7d', 'eventos_sandbox_excluidos_7d',
  'trials_internos_excluidos_7d', 'eventos_duplicados_excluidos_7d',
  'sesiones_elegibles_con_cta_7d', 'sesiones_elegibles_con_inicio_7d',
  'sesiones_elegibles_canceladas_7d', 'sesiones_elegibles_con_exito_7d',
  'eventos_sin_sesion_7d',
];
const PAGE_SIZE = 500;
const MAX_ROWS = 20000;
class MetricsReadError extends Error {}

async function readPages(makeQuery, source) {
  const rows = [];
  let expected;
  do {
    const { data, count, error } = await makeQuery().range(rows.length, rows.length + PAGE_SIZE - 1);
    if (error || !Array.isArray(data) || !Number.isInteger(count) || count < 0) {
      throw new MetricsReadError(`${source}: lectura no disponible`);
    }
    if (count > MAX_ROWS || (expected !== undefined && expected !== count)) {
      throw new MetricsReadError(`${source}: lectura incompleta o recuento cambiante`);
    }
    expected = count;
    if ((!data.length && rows.length < expected) || rows.length + data.length > expected) {
      throw new MetricsReadError(`${source}: página incompleta`);
    }
    rows.push(...data);
  } while (rows.length < expected);
  if (new Set(rows.map((row) => row.id)).size !== rows.length || rows.some((row) => row.id == null)) {
    throw new MetricsReadError(`${source}: paginación inconsistente`);
  }
  return rows;
}

const isSandbox = (params) => String(params?.environment || params?.store_environment || '').toUpperCase() === 'SANDBOX'
  || params?.is_sandbox === true || params?.isSandbox === true;

// Historical clients sent cancellations as purchase_failed; current clients
// emit purchase_cancelled. Check both old error and current error_key fields.
export const isCancellation = (event) => event.event_name === 'purchase_cancelled'
  || (event.event_name === 'purchase_failed'
    && /cancel/i.test([event.params?.error, event.params?.error_key].filter(Boolean).join(' ')));
const isFailure = (event) => event.event_name === 'purchase_failed' && !isCancellation(event);
const n = (rows, name) => rows.filter((row) => row.event_name === name).length;
const sessionKey = (row) => row.user_id && row.session_id ? JSON.stringify([row.user_id, row.session_id]) : null;

export async function collectCommercialMetrics(sb, { now, yday }) {
  const end = now.toISOString();
  const start = new Date(now.getTime() - 7 * 864e5).toISOString();
  const metrics = Object.fromEntries(METRICS.map((key) => [key, null]));
  Object.assign(metrics, {
    ventana_embudo_utc: `${start} → ${end}`,
    ambito_embudo: 'Sin cuentas internas/QA conocidas ni perfiles seed; sandbox explícito excluido.',
    alcance_compras: 'Eventos de la app, no cobros confirmados. Sin entorno de tienda no se certifica una venta real.',
    alcance_trials: 'Registros de trial_starts; esta tabla no acredita el entorno de tienda.',
  });
  try {
    const [rawEvents, rawTrials] = await Promise.all([
      readPages(() => sb.from('analytics_events')
        .select('id,user_id,event_name,event_id,session_id,params,event_ts', { count: 'exact' })
        .in('event_name', EVENTS).gte('event_ts', start).lt('event_ts', end).order('id'), 'analytics_events'),
      readPages(() => sb.from('trial_starts')
        .select('id,user_id,started_at', { count: 'exact' })
        .gte('started_at', start).lt('started_at', end).order('id'), 'trial_starts'),
    ]);
    const ids = [...new Set([...rawEvents, ...rawTrials].map((row) => row.user_id))];
    if (ids.some((id) => !id)) throw new MetricsReadError('Embudo: hay registros sin propietario identificable');
    const profiles = new Map();
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      const rows = await readPages(() => sb.from('profiles')
        .select('id,email,es_seed', { count: 'exact' }).in('id', batch).order('id'), 'profiles');
      for (const row of rows) profiles.set(row.id, row);
    }
    if (ids.some((id) => !profiles.get(id)?.email?.trim())) {
      throw new MetricsReadError('Embudo: faltan perfiles o datos para excluir cuentas internas');
    }
    const internal = (row) => profiles.get(row.user_id).es_seed === true || isInternal(profiles.get(row.user_id).email);
    let internalEvents = 0, sandboxEvents = 0, duplicates = 0;
    const seen = new Set();
    const events = rawEvents.filter((row) => {
      if (internal(row)) { internalEvents++; return false; }
      if (isSandbox(row.params)) { sandboxEvents++; return false; }
      const key = row.event_id ? JSON.stringify([row.user_id, row.event_id]) : `row:${row.id}`;
      if (seen.has(key)) { duplicates++; return false; }
      seen.add(key);
      return true;
    });
    const trials = rawTrials.filter((row) => !internal(row));
    const daily = events.filter((row) => Date.parse(row.event_ts) >= Date.parse(yday.start) && Date.parse(row.event_ts) < Date.parse(yday.end));
    const eligible = events.filter((row) => row.event_name === 'paywall_view_eligible_trial');
    const eligibleKeys = new Set(eligible.map(sessionKey).filter(Boolean));
    const cohort = (predicate) => new Set(events.filter((row) => eligibleKeys.has(sessionKey(row)) && predicate(row)).map(sessionKey)).size;
    const contaminated = Date.parse(start) < Date.parse('2026-08-14T05:34:37Z');
    Object.assign(metrics, {
      compras_ok_ayer: n(daily, 'purchase_success'),
      compras_fallidas_ayer: daily.filter(isFailure).length,
      compras_canceladas_ayer: daily.filter(isCancellation).length,
      compras_restauradas_ayer: n(daily, 'purchase_restored'),
      paywall_7d: n(events, 'paywall_opened'),
      paywall_con_trial_7d: eligible.length,
      paywall_sin_trial_7d: n(events, 'paywall_view_no_trial'),
      paywall_usuarios_unicos_elegibles_7d: new Set(eligible.map((row) => row.user_id)).size,
      paywall_sesiones_elegibles_7d: eligibleKeys.size,
      cta_taps_7d: n(events, 'purchase_cta_clicked'),
      purchase_started_7d: n(events, 'purchase_started'),
      purchase_cancelled_7d: events.filter(isCancellation).length,
      purchase_success_7d: n(events, 'purchase_success'),
      trials_7d: trials.length,
      entitlement_activated_7d: n(events, 'entitlement_activated'),
      compras_fallidas_reales_7d: events.filter(isFailure).length,
      eventos_internos_excluidos_7d: internalEvents,
      eventos_sandbox_excluidos_7d: sandboxEvents,
      trials_internos_excluidos_7d: rawTrials.length - trials.length,
      eventos_duplicados_excluidos_7d: duplicates,
      sesiones_elegibles_con_cta_7d: cohort((row) => row.event_name === 'purchase_cta_clicked'),
      sesiones_elegibles_con_inicio_7d: cohort((row) => row.event_name === 'purchase_started'),
      sesiones_elegibles_canceladas_7d: cohort(isCancellation),
      sesiones_elegibles_con_exito_7d: cohort((row) => row.event_name === 'purchase_success'),
      eventos_sin_sesion_7d: events.filter((row) => row.event_name !== 'entitlement_activated' && !sessionKey(row)).length,
      ventana_paywall: contaminated ? 'CONTAMINADA por P0 onboarding; no concluir sobre copy' : 'Posterior al fix P0; no certifica cobros ni ausencia de QA desconocida',
      estado_datos_comerciales: 'disponibles',
    });
    const alerts = [];
    if (metrics.paywall_7d >= 15 && trials.length === 0) {
      if (contaminated) {
        alerts.push('0 registros de trial en una ventana contaminada por P0 onboarding. NO concluir sobre copy ni conversión.');
      } else if (eligible.length >= 10) {
        alerts.push(`0 registros de trial, excluidas cuentas internas/QA conocidas: ${metrics.paywall_usuarios_unicos_elegibles_7d} usuarios y ${eligibleKeys.size} sesiones elegibles. En esas sesiones: CTA ${metrics.sesiones_elegibles_con_cta_7d}, inicios ${metrics.sesiones_elegibles_con_inicio_7d}, cancelaciones ${metrics.sesiones_elegibles_canceladas_7d}, éxitos ${metrics.sesiones_elegibles_con_exito_7d}. Revisar conversión y registro; esto no demuestra un fallo de compra ni mide cobros reales.`);
      } else if (eligible.length === 0 && metrics.paywall_sin_trial_7d >= 10) {
        alerts.push('Ninguna vista con trial elegible y 0 registros de trial, sin cuentas internas. Revisar elegibilidad y ofertas antes de atribuirlo a un fallo.');
      } else {
        alerts.push('0 registros de trial con actividad de paywall, sin cuentas internas. Revisar elegibilidad, conversión y registro; causa sin confirmar.');
      }
    }
    if (metrics.compras_fallidas_reales_7d >= 3) alerts.push(`Compras fallando: ${metrics.compras_fallidas_reales_7d} errores técnicos registrados en 7 días, sin cancelaciones. Revisar error_key/error y Sentry.`);
    const guard = n(events, 'purchase_pkg_guard');
    if (guard) alerts.push(`El guard de compra saltó ${guard} vez/veces en 7 días, sin cuentas internas/QA conocidas.`);
    return { metrics, alerts };
  } catch (error) {
    metrics.estado_datos_comerciales = 'no_disponibles';
    const reason = error instanceof MetricsReadError ? error.message : 'fallo inesperado durante la lectura';
    return { metrics, alerts: [`Datos comerciales NO DISPONIBLES: ${reason}. No interpretar como cero compras o cero trials.`] };
  }
}
