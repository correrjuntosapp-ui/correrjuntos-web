// [18 sep 2026] Selección PURA de la audiencia del cron workout-eve-push.
// Sin I/O: 100 % testeable en Node (tests/unit/workout-eve-select.test.cjs).
//
// Por qué existe: el 18 sep el titular recibió «Mañana: Caminata rápida 20 min»
// de un plan ABANDONADO. El cron solo comprobaba que el usuario tuviera ALGÚN
// plan activo, no que la sesión perteneciera a ese plan; y los planes
// abandonados conservan sus sesiones pendientes. Ese día, 5 de 18 envíos
// salieron de planes no activos.
//
// Reglas (fail-closed):
//   1. Solo sesiones cuyo plan_id es un plan con estado 'active'. Abandonado,
//      pausado, completado, cancelado, caducado o desconocido → fuera.
//   2. Descansos y sesiones finalizadas → fuera.
//   3. Dos planes activos → la sesión del plan creado MÁS TARDE (el vigente).
//   4. Idempotencia por usuario + fecha + tipo de aviso: si ya hay un envío
//      registrado para CUALQUIER sesión de ese usuario en esa fecha, no se
//      repite (además de la UNIQUE (user_id, workout_id) de la tabla).
//   5. FUENTE ÚNICA: la app programa localmente el aviso de mañana desde la
//      versión LOCAL_REMINDER_MIN_VERSION (F158, runtime 1.3.29+, opt-in del
//      usuario). Para esos usuarios el servidor CALLA, tengan o no activado el
//      recordatorio: F158 decidió que quien no lo active no recibe avisos
//      viejos. El servidor queda como respaldo SOLO para versiones anteriores
//      (1.3.25 y anteriores) o desconocidas.

export const LOCAL_REMINDER_MIN_VERSION = '1.3.29';

const FINAL_STATES = new Set(['completed', 'skipped']);

/** "1.3.29" → [1,3,29]; inválido → null. */
export function parseVersion(v) {
  if (typeof v !== 'string') return null;
  const m = v.trim().match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function compareVersions(a, b) {
  const pa = parseVersion(a), pb = parseVersion(b);
  if (!pa || !pb) return null;
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  return 0;
}

/** true → la app de este usuario ya programa el aviso localmente. */
export function hasLocalReminder(appVersion, minVersion = LOCAL_REMINDER_MIN_VERSION) {
  const c = compareVersions(appVersion, minVersion);
  return c !== null && c >= 0;
}

/**
 * Última versión conocida por usuario a partir de filas de analytics_events
 * ({ user_id, app_version, created_at }). Ignora filas sin versión válida.
 */
export function latestVersionByUser(rows) {
  const out = new Map();
  for (const r of rows || []) {
    if (!r || !r.user_id || !parseVersion(r.app_version)) continue;
    const t = Date.parse(r.created_at || '') || 0;
    const cur = out.get(r.user_id);
    if (!cur || t > cur.t) out.set(r.user_id, { t, version: r.app_version });
  }
  const m = new Map();
  for (const [uid, v] of out) m.set(uid, v.version);
  return m;
}

/**
 * Decide, por usuario, qué sesión de mañana anunciar.
 *
 * @param {object} i
 * @param {Array}  i.workouts  sesiones de MAÑANA: { id, user_id, plan_id, titulo, descripcion, estado, tipo }
 * @param {Array}  i.plans     planes: { id, user_id, estado, created_at }
 * @param {Array}  i.logs      workout_eve_push_log: { user_id, workout_id }
 * @param {Map}    i.versionByUser  user_id → app_version (última conocida)
 * @param {string} [i.minLocalVersion]
 * @returns {{ candidates: Array<{userId, workout}>, skipped: Array<{userId, reason}> }}
 */
export function selectEveCandidates(i) {
  const workouts = Array.isArray(i.workouts) ? i.workouts : [];
  const plans = Array.isArray(i.plans) ? i.plans : [];
  const logs = Array.isArray(i.logs) ? i.logs : [];
  const versionByUser = i.versionByUser instanceof Map ? i.versionByUser : new Map();
  const minLocal = i.minLocalVersion || LOCAL_REMINDER_MIN_VERSION;

  const activePlanById = new Map();
  for (const p of plans) {
    if (p && p.id && p.estado === 'active') activePlanById.set(p.id, p);
  }

  // Sesiones de mañana → agrupadas por usuario, SOLO si su plan está activo.
  const byUser = new Map();
  const skippedReasons = new Map();
  const note = (uid, reason) => { if (!skippedReasons.has(uid)) skippedReasons.set(uid, reason); };

  for (const w of workouts) {
    if (!w || !w.user_id || !w.id) continue;
    if (FINAL_STATES.has(w.estado)) continue;
    if ((w.tipo || '') === 'rest') { note(w.user_id, 'rest'); continue; }
    const plan = activePlanById.get(w.plan_id);
    if (!plan) { note(w.user_id, 'plan_not_active'); continue; }
    if (plan.user_id && plan.user_id !== w.user_id) { note(w.user_id, 'plan_owner_mismatch'); continue; }
    const list = byUser.get(w.user_id) || [];
    list.push({ workout: w, planCreatedAt: Date.parse(plan.created_at || '') || 0 });
    byUser.set(w.user_id, list);
  }

  // Idempotencia por usuario + fecha (todas las sesiones de mañana del usuario).
  const tomorrowIdsByUser = new Map();
  for (const w of workouts) {
    if (!w || !w.user_id || !w.id) continue;
    const s = tomorrowIdsByUser.get(w.user_id) || new Set();
    s.add(w.id);
    tomorrowIdsByUser.set(w.user_id, s);
  }
  const sentTodayUsers = new Set();
  for (const l of logs) {
    if (!l || !l.user_id) continue;
    const ids = tomorrowIdsByUser.get(l.user_id);
    if (ids && ids.has(l.workout_id)) sentTodayUsers.add(l.user_id);
  }

  const candidates = [];
  const skipped = [];
  for (const [uid, list] of byUser) {
    // Dos planes activos → el creado más tarde (el vigente).
    list.sort((a, b) => b.planCreatedAt - a.planCreatedAt);
    const chosen = list[0].workout;
    if (sentTodayUsers.has(uid)) { skipped.push({ userId: uid, reason: 'already_sent_for_date' }); continue; }
    if (hasLocalReminder(versionByUser.get(uid), minLocal)) { skipped.push({ userId: uid, reason: 'local_reminder_authoritative' }); continue; }
    candidates.push({ userId: uid, workout: chosen });
  }
  for (const [uid, reason] of skippedReasons) {
    if (!byUser.has(uid)) skipped.push({ userId: uid, reason });
  }
  return { candidates, skipped };
}
