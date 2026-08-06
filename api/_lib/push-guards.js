// [F104 · 6 ago 2026] Guardas PURAS compartidas por los crons de push
// (activation-push, workout-eve-push). Sin I/O: 100% testeables en Node.
//
// Principio rector: FAIL-CLOSED. Ante señal ausente o ambigua (tz desconocida,
// counts null, fechas inválidas) la respuesta es NO ENVIAR. Nunca se inventa
// actividad ni zona horaria.

// País (profiles.pais, ISO-2) → zona IANA. Solo mercados operados; países
// multi-zona (US, BR, CA) van a null a propósito → ventana segura.
export const COUNTRY_TZ = {
  ES: 'Europe/Madrid',
  PT: 'Europe/Lisbon',
  FR: 'Europe/Paris',
  GB: 'Europe/London',
  MX: 'America/Mexico_City',
  CL: 'America/Santiago',
  AR: 'America/Argentina/Buenos_Aires',
  CO: 'America/Bogota',
  PE: 'America/Lima',
  EC: 'America/Guayaquil',
  UY: 'America/Montevideo',
};

export function tzForCountry(pais) {
  if (!pais || typeof pais !== 'string') return null;
  return COUNTRY_TZ[pais.trim().toUpperCase()] || null;
}

export function localHour(date, tz) {
  try {
    const h = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(date);
    const n = parseInt(h, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

// Quiet hours: enviable SOLO entre las 09:00 y las 21:59 hora local.
export const SEND_WINDOW = { start: 9, end: 21 };

/**
 * ¿Se puede enviar AHORA a un usuario de `pais`?
 * - País mapeado → ventana 09-21 en SU zona.
 * - País desconocido/multi-zona → FAIL-CLOSED a la intersección diurna de los
 *   dos extremos del parque real (Madrid ∧ CDMX): solo se envía si es horario
 *   permitido en AMBAS. Nunca se asume una zona.
 */
export function canSendNow(now, pais) {
  const inWindow = (h) => h !== null && h >= SEND_WINDOW.start && h <= SEND_WINDOW.end;
  const tz = tzForCountry(pais);
  if (tz) return inWindow(localHour(now, tz));
  return inWindow(localHour(now, 'Europe/Madrid')) && inWindow(localHour(now, 'America/Mexico_City'));
}

/**
 * Guarda anti-planes-zombi del push de víspera: solo usuarios ACTIVADOS.
 * activated = ≥1 entreno completado (señal demostrada en BD), o alta reciente
 * (≤8 días: a esos los cubre la ventana de activación y avisarles la víspera
 * de su PRIMER entreno es exactamente el objetivo del experimento).
 * FAIL-CLOSED: completedCount null/undefined → false (no inventar actividad).
 */
export const EVE_NEW_USER_WINDOW_DAYS = 8;

export function isEveEligible({ completedCount, createdAt }, now = new Date()) {
  if (completedCount === null || completedCount === undefined) return false;
  if (typeof completedCount !== 'number' || Number.isNaN(completedCount)) return false;
  if (completedCount > 0) return true;
  if (!createdAt) return false;
  const ageMs = now - new Date(createdAt);
  if (Number.isNaN(ageMs) || ageMs < 0) return false;
  return ageMs / 86400000 <= EVE_NEW_USER_WINDOW_DAYS;
}

/** ¿Dos instantes caen en el mismo día local (para dedup entre crons)? */
export function sameLocalDay(a, b, tz = 'Europe/Madrid') {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    return fmt.format(new Date(a)) === fmt.format(new Date(b));
  } catch {
    return false; // fail-closed: si no se puede comparar, se asume "ya enviado"
  }
}

/**
 * Dedup entre crons: máximo UN push de crons por usuario y día local.
 * `otherCronSentAts` = timestamps de envíos del OTRO cron a este usuario.
 * true = suprimir este envío.
 */
export function pushedByOtherCronToday(otherCronSentAts, now, tz = 'Europe/Madrid') {
  if (!Array.isArray(otherCronSentAts)) return true; // fail-closed
  return otherCronSentAts.some((t) => t && sameLocalDay(t, now, tz));
}

/**
 * Inserta eventos de instrumentación del cron en analytics_events
 * (service role). Motivos de lista cerrada — nunca contenido libre ni tokens.
 * Best-effort: un fallo aquí no debe romper el envío.
 */
export async function insertPushEvents(supabase, rows) {
  if (!rows || rows.length === 0) return;
  try {
    await supabase.from('analytics_events').insert(
      rows.map((r) => ({
        user_id: r.user_id,
        event_name: r.event_name, // activation_push_eligible|sent|skipped
        params: r.params || null,
        platform: null,
        app_version: null,
        event_ts: new Date().toISOString(),
      }))
    );
  } catch {
    /* best-effort */
  }
}
