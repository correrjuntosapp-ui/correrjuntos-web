// ============================================================
// F146.6A · Registro estructurado y sin identificadores del camino Strava
//
// PROBLEMA. Los logs del webhook imprimían identificadores personales
// persistentes en claro: `runs.id`, `profiles.id`, el ID de atleta de Strava
// y el ID de actividad de Strava. Los logs de Vercel no tienen RLS ni grants
// —cualquiera con acceso al proyecto los lee— y esos valores son
// correlacionables con la base de datos. Además, tres sentencias imprimían
// `error.message` en crudo: los errores de Postgres incluyen valores de
// columna (el detalle de una clave duplicada trae el `strava_activity_id`), y
// los de Expo pueden traer el push token.
//
// ENFOQUE. Nada de hashes. Un hash determinista de un user_id sigue siendo un
// identificador estable: permite contar, agrupar y seguir a la misma persona
// entre peticiones y días. Cambia quién puede resolverlo, no que exista. Por
// eso aquí los identificadores no se transforman: NO SE REGISTRAN.
//
// Para poder seguir una ejecución concreta se emite un `trace_id` aleatorio
// por invocación: no deriva de ningún dato del usuario, no se persiste en
// Supabase y no se reutiliza entre peticiones. Correlaciona líneas de UN
// webhook y muere con él.
//
// DOBLE DEFENSA, porque una allowlist de claves no basta. Si alguien escribe
// `logEvent({ stage: 'x', reason: run.user_id })`, la clave es válida y el
// valor es un UUID. Por eso cada valor pasa además por una comprobación de
// FORMA: lo que parezca UUID, correo, JWT, token, o una tirada larga de hex o
// base64 se sustituye por 'redactado', esté donde esté.
// ============================================================

import { randomBytes } from 'node:crypto';

/**
 * Claves admitidas. Cualquier otra se descarta en silencio: es imposible
 * ampliar el log sin ampliar antes esta lista, que es justo el punto de
 * control donde alguien tiene que pararse a pensar.
 */
export const ALLOWED_LOG_FIELDS = Object.freeze([
  'stage',           // en qué punto del camino
  'outcome',         // cómo terminó
  'mode',            // disabled | dry | live
  'reason',          // motivo del enum de F146.4
  'candidate_count', // cuántas sesiones candidatas había
  'duration_ms',     // cuánto tardó
  'trace_id',        // correlación técnica, aleatoria por invocación
  'status',          // código HTTP
  'sport',           // tipo de actividad de Strava (enum suyo)
  'error_kind',      // nombre de la clase del error, nunca su mensaje
  'error_code',      // código controlado (p. ej. SQLSTATE)
  'count',           // contadores agregados
]);

/** Etiquetas cortas y sin datos: minúsculas, dígitos y separadores. */
const ETIQUETA_OK = /^[a-z0-9][a-z0-9_.:-]{0,39}$/i;

/**
 * Formas que NUNCA pueden salir en un log, aunque vengan bajo una clave
 * permitida. El orden importa poco; basta con que alguna dispare.
 */
const FORMAS_PROHIBIDAS = [
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, // UUID
  /@/,                                                             // correo
  /\beyJ[A-Za-z0-9_-]{5,}/,                                        // JWT
  // Tirada de hex de 8 o más: cubre un hash completo (32/40/64) Y sus
  // prefijos cortos, que es como se cuela un "sustituto" de identificador.
  // Ocho es el umbral porque un prefijo de 8 ya es estable y correlacionable.
  /[0-9a-f]{8,}/i,
  /[A-Za-z0-9_-]{40,}/,                                            // token largo
  /\b\d{7,}\b/,                                                    // id numérico largo (atleta/actividad Strava)
];

/**
 * Base64 corto, que las reglas de arriba no ven: 'MTM0MDg1MjA2' es el ID de
 * atleta codificado. Heurística deliberadamente estrecha —mezcla de mayúsculas,
 * minúsculas y dígitos en 10+ caracteres— para no tocar los tipos de deporte
 * de Strava, que son largos pero no llevan dígitos ('HighIntensityIntervalTraining').
 */
const pareceBase64 = (s) => s.length >= 10
  && /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s) && /^[A-Za-z0-9+/=_-]+$/.test(s);

/** Valor textual seguro, o 'redactado'. Nunca devuelve el original dudoso. */
function textoSeguro(v) {
  const s = String(v);
  for (const forma of FORMAS_PROHIBIDAS) if (forma.test(s)) return 'redactado';
  if (pareceBase64(s)) return 'redactado';
  return ETIQUETA_OK.test(s) ? s : 'redactado';
}

/**
 * El `trace_id` es legítimamente 12 caracteres hex, justo la forma que
 * `textoSeguro` prohíbe. Tiene su propia validación exacta: o es el formato
 * que emite `newTraceId`, o no sale.
 */
const TRACE_OK = /^[0-9a-f]{12}$/;

/**
 * Deja el evento en solo claves permitidas y valores seguros.
 * Puro y exportado para poder probarlo con centinelas.
 */
export function sanitizeEvent(evt) {
  const salida = {};
  if (!evt || typeof evt !== 'object') return salida;
  for (const clave of ALLOWED_LOG_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(evt, clave)) continue;
    const v = evt[clave];
    if (v === null || v === undefined) continue;
    if (typeof v === 'number') {
      // Los contadores y duraciones son números; nada que redactar salvo que
      // no sean finitos. No pasan por FORMAS_PROHIBIDAS a propósito: un
      // duration_ms de 1234567 no es un identificador.
      if (Number.isFinite(v)) salida[clave] = v;
      continue;
    }
    if (typeof v === 'boolean') { salida[clave] = v; continue; }
    if (clave === 'trace_id') {
      salida[clave] = TRACE_OK.test(String(v)) ? String(v) : 'redactado';
      continue;
    }
    salida[clave] = textoSeguro(v);
  }
  return salida;
}

/**
 * Identificador de correlación para UNA invocación.
 * Aleatorio, no derivado de nada del usuario, no persistido.
 */
export function newTraceId() {
  return randomBytes(6).toString('hex');
}

/**
 * Clase del error, nunca su mensaje ni su stack. Un `TypeError` dice lo
 * suficiente para depurar sin arrastrar el contenido que lo provocó.
 */
export function errorKind(e) {
  if (!e) return 'desconocido';
  const n = e?.constructor?.name;
  return typeof n === 'string' && ETIQUETA_OK.test(n) ? n : 'desconocido';
}

/** Código controlado del error (SQLSTATE, código de Supabase...), si lo hay. */
export function errorCode(e) {
  const c = e?.code;
  if (c === null || c === undefined) return undefined;
  return textoSeguro(c);
}

const emitir = (fn, prefijo, evt) => {
  const limpio = sanitizeEvent(evt);
  fn(prefijo, JSON.stringify(limpio));
  return limpio;
};

/** Evento informativo. Devuelve lo emitido, para poder afirmarlo en tests. */
export function logEvent(prefijo, evt) {
  return emitir(console.log, prefijo, evt);
}

/** Evento de error. Mismo contrato: ni mensaje, ni stack, ni payload. */
export function logError(prefijo, evt) {
  return emitir(console.error, prefijo, evt);
}
