// ============================================================
// post-workout-analysis.js — Motor DETERMINISTA de análisis post-entreno (F118)
//
// Módulo PURO: sin I/O, sin Date.now, sin Math.random, sin dependencias.
// Toda la aleatoriedad aparente (variación de frases) es rotación
// determinista por semilla derivada de la identidad de la actividad.
//
// Contrato de diseño (encargo F118):
//  - La IA NUNCA calcula ritmos, porcentajes, rachas ni comparaciones.
//    Este módulo calcula los HECHOS; el renderer solo los redacta.
//    (v1: renderer también determinista — sin LLM en el camino crítico.)
//  - Fail closed: si faltan datos, no se inventan comparaciones.
//  - Copia espejo en la app: correr-juntos-app/src/services/postWorkoutAnalysis.ts
//    La paridad se acredita con f118-fixtures.json ejecutado por AMBOS harnesses
//    — si tocas una regla aquí, toca la copia y regenera expectativas.
// ============================================================

// ── Umbrales (todos con porqué) ──────────────────────────────
export const MIN_DURATION_SEC = 600;    // <10 min: sin valor de análisis (regla heredada del selector P0-A)
export const MAX_DURATION_SEC = 90000;  // >25 h: casi seguro ms en vez de s u otra corrupción de unidades
export const PACE_MIN_SEC_KM = 120;     // 2:00/km — más rápido que récord mundial ⇒ dato inválido
export const PACE_MAX_SEC_KM = 1200;    // 20:00/km — más lento que caminar despacio ⇒ dato inválido
export const SPEED_MIN_KMH = 5;         // bici por debajo ⇒ dato inválido
export const SPEED_MAX_KMH = 60;        // bici por encima ⇒ dato inválido (o moto)
export const COMPARABLE_N = 4;          // "últimas 4 comparables" del encargo
export const HISTORY_MAX = 6;           // historial máximo considerado
export const STABLE_BAND_PCT = 2;       // ±2% de la media = "estable" (ruido GPS normal)
export const MSG_MAX_CHARS = 420;

const KNOWN_SPORTS = new Set(['running', 'trail', 'walking', 'bici']);

export function normalizeSport(deporte) {
  const d = String(deporte || '').toLowerCase();
  if (KNOWN_SPORTS.has(d)) return d;
  if (d === 'walk' || d === 'caminata' || d === 'hike') return 'walking';
  if (d === 'run') return 'running';
  if (d === 'ride' || d === 'cycling' || d === 'bike') return 'bici';
  return 'running'; // mismo fallback que getSportConfig en la app
}

function num(v) {
  return typeof v === 'number' && isFinite(v) ? v : null;
}

function parseIso(v) {
  if (!v) return null;
  const t = Date.parse(v);
  return isNaN(t) ? null : t;
}

export function fmtPaceSec(secPerKm) {
  if (!secPerKm || secPerKm <= 0) return null;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  if (s === 60) return `${m + 1}:00`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtKm(km) {
  if (km == null) return null;
  const r = Math.round(km * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function fmtDur(totalSec) {
  if (!totalSec || totalSec <= 0) return null;
  const h = Math.floor(totalSec / 3600);
  const m = Math.round((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m} min`;
}

// Semilla determinista para la variación de frases (djb2 sobre la identidad).
export function seedFromId(id) {
  const s = String(id || '');
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

// Identidad estable de la actividad para idempotencia de mensajes.
// NUNCA derivada del texto generado (regla F118-2).
export function buildRunRef(run) {
  if (run && run.strava_activity_id != null) return `strava:${run.strava_activity_id}`;
  if (run && run.id) return `run:${run.id}`;
  return null;
}

// ── analyzeWorkout ───────────────────────────────────────────
// input = {
//   current:  { id, sport, distance_km, duration_sec, start_iso },
//   history:  [{ id, sport, distance_km, duration_sec, start_iso }, ...] (anteriores, cualquier orden),
//   plan:     { goal_key, week, total_weeks, race_name, race_date } | null,
//   next_workout:  { tipo, fecha, distancia_target_km } | null,   (próxima sesión pendiente)
//   today_workout: { tipo, distancia_target_km } | null,          (sesión prevista para el día de la actividad)
//   race:     { nombre, fecha } | null,
//   now_iso:  string (instante de referencia inyectado — nunca Date.now interno)
// }
export function analyzeWorkout(input) {
  const reasons = [];
  const out = {
    ok: false,
    facts: null,
    comparison: { status: 'insufficient_history', pace_delta_pct: null, vs_count: 0 },
    plan_context: 'unknown',
    achievement: null,
    next_action: { type: 'neutral', detail: null },
    confidence: 'low',
    reason_codes: reasons,
  };

  const cur = input && input.current;
  if (!cur) { reasons.push('missing_current'); return out; }

  const sport = normalizeSport(cur.sport);
  if (!KNOWN_SPORTS.has(String(cur.sport || '').toLowerCase())) reasons.push('unknown_sport_as_running');

  const km = num(cur.distance_km);
  const dur = num(cur.duration_sec);
  const startTs = parseIso(cur.start_iso);
  const nowTs = parseIso(input.now_iso);

  // ── Validación fail-closed de la actividad actual ──
  if (km == null && dur == null) { reasons.push('no_data'); return out; }
  if (km != null && km <= 0) { reasons.push('zero_distance'); return out; }
  if (dur == null || dur <= 0) { reasons.push('zero_duration'); return out; }
  if (dur < MIN_DURATION_SEC) { reasons.push('too_short'); return out; }
  if (dur > MAX_DURATION_SEC) { reasons.push('suspect_units'); return out; }
  if (startTs == null) reasons.push('missing_start_time');

  // Ritmo / velocidad con validación de rango.
  // Una combinación físicamente imposible (p.ej. 10 km en 11 min) delata
  // datos corruptos: distancia Y duración dejan de ser fiables → FAIL CLOSED
  // total, sin mensaje (no citamos cifras que no nos creemos).
  let paceSecKm = null;
  let speedKmh = null;
  if (km != null && km > 0) {
    if (sport === 'bici') {
      const v = km / (dur / 3600);
      if (v >= SPEED_MIN_KMH && v <= SPEED_MAX_KMH) speedKmh = Math.round(v * 10) / 10;
      else { reasons.push('invalid_speed'); return out; }
    } else if (sport === 'walking') {
      // caminata: no usamos ritmo, pero un imposible (> velocidad de correr)
      // también invalida los datos
      const p = dur / km;
      if (p < PACE_MIN_SEC_KM) { reasons.push('invalid_pace'); return out; }
    } else {
      const p = dur / km;
      if (p >= PACE_MIN_SEC_KM && p <= PACE_MAX_SEC_KM) paceSecKm = p;
      else { reasons.push('invalid_pace'); return out; }
    }
  } else {
    reasons.push('missing_distance');
  }

  // ── Higiene del historial (defensiva, con constancia en reason_codes) ──
  const rawHist = Array.isArray(input.history) ? input.history : [];
  const seenIds = new Set();
  const seenIdentity = new Set();
  let droppedCrossSport = 0, droppedFuture = 0, droppedInvalid = 0, droppedDup = 0;
  const clean = [];
  for (const h of rawHist) {
    if (!h) { droppedInvalid++; continue; }
    if (normalizeSport(h.sport) !== sport) { droppedCrossSport++; continue; }
    const hKm = num(h.distance_km);
    const hDur = num(h.duration_sec);
    const hTs = parseIso(h.start_iso);
    if (hKm == null || hKm <= 0 || hDur == null || hDur < MIN_DURATION_SEC || hDur > MAX_DURATION_SEC) { droppedInvalid++; continue; }
    // "Anteriores" de verdad: nada del futuro respecto a la actividad actual
    if (startTs != null && hTs != null && hTs >= startTs) { droppedFuture++; continue; }
    if (h.id != null) {
      if (seenIds.has(h.id)) { droppedDup++; continue; }
      seenIds.add(h.id);
    }
    const identity = `${hTs ?? 'x'}|${hKm.toFixed(2)}`;
    if (seenIdentity.has(identity)) { droppedDup++; continue; }
    seenIdentity.add(identity);
    clean.push({ km: hKm, dur: hDur, ts: hTs, pace: (sport !== 'bici' && hKm > 0) ? hDur / hKm : null, speed: (sport === 'bici' && hKm > 0) ? hKm / (hDur / 3600) : null });
  }
  if (droppedCrossSport > 0) reasons.push('cross_sport_filtered');
  if (droppedFuture > 0) reasons.push('future_or_same_filtered');
  if (droppedInvalid > 0) reasons.push('invalid_history_filtered');
  if (droppedDup > 0) reasons.push('duplicate_in_history_filtered');

  // Orden cronológico descendente defensivo
  const beforeSort = clean.map((c) => c.ts).join(',');
  clean.sort((a, b) => (b.ts ?? -Infinity) - (a.ts ?? -Infinity));
  if (clean.map((c) => c.ts).join(',') !== beforeSort) reasons.push('history_reordered');
  const history = clean.slice(0, HISTORY_MAX);
  const comparables = history.slice(0, COMPARABLE_N);

  // ── Semana (mismo deporte): sesiones y km en los 7 días previos incluida la actual ──
  let weekSessions = null, weekKm = null;
  if (startTs != null) {
    const weekAgo = startTs - 7 * 86400000;
    const inWeek = history.filter((h) => h.ts != null && h.ts >= weekAgo);
    weekSessions = inWeek.length + 1;
    weekKm = Math.round((inWeek.reduce((s, h) => s + h.km, 0) + (km || 0)) * 10) / 10;
  }

  out.facts = {
    sport,
    km: km != null ? Math.round(km * 100) / 100 : null,
    duration_sec: dur,
    pace_sec_km: paceSecKm != null ? Math.round(paceSecKm) : null,
    speed_kmh: speedKmh,
    week_sessions: weekSessions,
    week_km: weekKm,
    history_count: history.length,
  };

  // ── Comparación (ritmo/velocidad vs media de comparables) ──
  // La comparación describe HECHOS ("más rápido/lento que tu media"), no
  // juicios de valor — una salida más rápida no es necesariamente "mejor".
  if (sport === 'walking') {
    reasons.push('walking_no_pace_comparison');
  } else if (sport === 'bici') {
    const withSpeed = comparables.filter((c) => c.speed != null && c.speed >= SPEED_MIN_KMH && c.speed <= SPEED_MAX_KMH);
    if (speedKmh != null && withSpeed.length >= 2) {
      const avg = withSpeed.reduce((s, c) => s + c.speed, 0) / withSpeed.length;
      const delta = ((speedKmh - avg) / avg) * 100;
      out.comparison = {
        status: Math.abs(delta) <= STABLE_BAND_PCT ? 'stable' : (delta > 0 ? 'faster' : 'slower'),
        pace_delta_pct: Math.round(Math.abs(delta)),
        vs_count: withSpeed.length,
      };
    }
  } else {
    const withPace = comparables.filter((c) => c.pace != null && c.pace >= PACE_MIN_SEC_KM && c.pace <= PACE_MAX_SEC_KM);
    if (paceSecKm != null && withPace.length >= 2) {
      const avg = withPace.reduce((s, c) => s + c.pace, 0) / withPace.length;
      const delta = ((avg - paceSecKm) / avg) * 100; // positivo = más rápido que la media
      out.comparison = {
        status: Math.abs(delta) <= STABLE_BAND_PCT ? 'stable' : (delta > 0 ? 'faster' : 'slower'),
        pace_delta_pct: Math.round(Math.abs(delta)),
        vs_count: withPace.length,
      };
    }
  }

  // ── Hito real (solo desde datos; jamás inventado) ──
  if (history.length >= 3 && km != null) {
    const maxKm = Math.max(...history.map((h) => h.km));
    if (km > maxKm) {
      out.achievement = { type: 'longest_of_recent', vs_count: history.length };
    } else if (sport !== 'walking' && sport !== 'bici' && paceSecKm != null && km >= 3) {
      const paces = history.filter((h) => h.pace != null && h.km >= 3).map((h) => h.pace);
      if (paces.length >= 3 && paceSecKm < Math.min(...paces)) {
        out.achievement = { type: 'best_pace_of_recent', vs_count: paces.length };
      }
    }
  }
  if (!out.achievement && weekSessions != null && weekSessions >= 3) {
    out.achievement = { type: 'week_volume', vs_count: weekSessions };
  }

  // ── Contexto de plan ──
  const plan = input.plan || null;
  const todayW = input.today_workout || null;
  if (!plan) {
    out.plan_context = 'unknown';
  } else if (todayW && num(todayW.distancia_target_km) != null && km != null) {
    const target = num(todayW.distancia_target_km);
    out.plan_context = (target > 0 && Math.abs(km - target) / target <= 0.2) ? 'aligned' : 'different';
  } else {
    out.plan_context = 'unknown';
  }

  // ── Siguiente acción ──
  const nextW = input.next_workout || null;
  if (nextW && nextW.tipo) {
    out.next_action = { type: 'plan_next', detail: { tipo: String(nextW.tipo), fecha: nextW.fecha || null } };
  } else if ((km != null && km >= 15) || dur >= 4500) {
    out.next_action = { type: 'recovery', detail: null };
  } else {
    out.next_action = { type: 'neutral', detail: null };
  }

  // ── Confianza ──
  const suspect = reasons.some((r) => r === 'invalid_pace' || r === 'invalid_speed' || r === 'missing_distance' || r === 'missing_start_time');
  if (!suspect && out.comparison.vs_count >= COMPARABLE_N) out.confidence = 'high';
  else if (!suspect && out.comparison.vs_count >= 2) out.confidence = 'medium';
  else out.confidence = 'low';

  out.ok = true;
  return out;
}

// ── Renderer — política de mensajes de José (F118 FASE 4) ────
// 2-4 frases · ≤420 chars · 1-3 datos · interpretación respaldada ·
// siguiente acción · variación por semilla SIN alterar hechos.
// PROHIBIDO (verificado por harness): prometer análisis no hecho,
// inventar progreso, hablar de adaptación del plan, vender premium,
// consejo médico.

const TIPO_H = {
  es: { easy_run: 'rodaje suave', tempo: 'tempo', intervals: 'series', long_run: 'tirada larga', race: 'carrera', fuerza: 'fuerza', other: 'entreno' },
  en: { easy_run: 'easy run', tempo: 'tempo', intervals: 'intervals', long_run: 'long run', race: 'race', fuerza: 'strength', other: 'workout' },
};

const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fechaHumana(fechaIso, nowIso, lang) {
  const t = parseIso(fechaIso);
  const now = parseIso(nowIso);
  if (t == null || now == null) return null;
  const dayDiff = Math.round((new Date(t).setUTCHours(0, 0, 0, 0) - new Date(now).setUTCHours(0, 0, 0, 0)) / 86400000);
  if (dayDiff === 0) return lang === 'en' ? 'today' : 'hoy';
  if (dayDiff === 1) return lang === 'en' ? 'tomorrow' : 'mañana';
  const d = new Date(t).getUTCDay();
  return lang === 'en' ? `on ${DIAS_EN[d]}` : `el ${DIAS_ES[d]}`;
}

export function renderJoseMessage(analysis, opts) {
  if (!analysis || analysis.ok !== true || !analysis.facts) return null;
  const lang = (opts && opts.lang) === 'en' ? 'en' : 'es';
  const seed = (opts && typeof opts.seed === 'number') ? opts.seed : 0;
  const nowIso = (opts && opts.now_iso) || null;
  const f = analysis.facts;
  const pick = (arr, slot) => arr[(seed + slot) % arr.length];

  const km = fmtKm(f.km);
  const pace = fmtPaceSec(f.pace_sec_km);
  const dur = fmtDur(f.duration_sec);

  // S1 — apertura (varía por deporte/hito, nunca cambia hechos)
  let s1;
  if (analysis.achievement && analysis.achievement.type === 'longest_of_recent') {
    s1 = pick(lang === 'en'
      ? ['Big one.', 'That was a serious outing.', 'Strong session.']
      : ['Ojo al dato.', 'Sesión seria la de hoy.', 'Buen golpe de kilómetros.'], 0);
  } else if (f.sport === 'walking') {
    s1 = pick(lang === 'en'
      ? ['Walk logged.', 'Good walk.', 'That counts too.']
      : ['Caminata registrada.', 'Buena caminata.', 'Eso también cuenta.'], 0);
  } else if (f.sport === 'bici') {
    s1 = pick(lang === 'en'
      ? ['Good ride.', 'Ride logged.', 'Nice one on the bike.']
      : ['Buena salida en bici.', 'Ruta registrada.', 'Bien esa bici.'], 0);
  } else {
    s1 = pick(lang === 'en'
      ? ['Good work.', 'Session done.', 'Solid training.']
      : ['Buen entreno.', 'Hecho.', 'Bien ahí.'], 0);
  }

  // S2 — datos + interpretación respaldada (solo si la comparación existe)
  let s2;
  const comp = analysis.comparison;
  if (f.sport === 'walking') {
    s2 = km && dur
      ? (lang === 'en' ? `You covered ${km} km in ${dur}.` : `Has hecho ${km} km en ${dur}.`)
      : (lang === 'en' ? `You got ${dur} of movement in.` : `Has sumado ${dur} de movimiento.`);
  } else if (f.sport === 'bici') {
    const base = km && dur
      ? (lang === 'en' ? `${km} km on the bike in ${dur}` : `${km} km de bici en ${dur}`)
      : (lang === 'en' ? `${dur} on the bike` : `${dur} de bici`);
    let clause = '';
    if (comp.status === 'faster') clause = lang === 'en' ? `, ${comp.pace_delta_pct}% quicker than your recent average` : `, un ${comp.pace_delta_pct}% más rápida que tu media reciente`;
    else if (comp.status === 'slower') clause = lang === 'en' ? `, an easier pace than your recent average` : `, a un ritmo más tranquilo que tu media reciente`;
    else if (comp.status === 'stable') clause = lang === 'en' ? `, right on your usual rhythm` : `, clavada en tu ritmo habitual`;
    s2 = `${base}${clause}.`;
  } else {
    const base = km && pace
      ? (lang === 'en' ? `You completed ${km} km at ${pace}/km` : `Has completado ${km} km a ${pace}/km`)
      : (lang === 'en' ? `You logged ${dur} of running` : `Has sumado ${dur} de carrera`);
    let clause = '';
    if (comp.status === 'faster') clause = lang === 'en' ? `, ${comp.pace_delta_pct}% faster than your average over the last ${comp.vs_count} runs` : `, un ${comp.pace_delta_pct}% más rápido que tu media de las últimas ${comp.vs_count} salidas`;
    else if (comp.status === 'slower') clause = lang === 'en' ? `, ${comp.pace_delta_pct}% easier than your recent average — easy days build the base` : `, un ${comp.pace_delta_pct}% más tranquilo que tu media reciente — los días suaves también construyen`;
    else if (comp.status === 'stable') clause = lang === 'en' ? `, right on your usual pace` : `, clavado en tu ritmo habitual`;
    s2 = `${base}${clause}.`;
  }

  // S3 — contexto: hito real > semana (se omite si no hay datos o si excede límite)
  let s3 = null;
  if (analysis.achievement) {
    const a = analysis.achievement;
    if (a.type === 'longest_of_recent') s3 = lang === 'en' ? `That's your longest outing of the last ${a.vs_count}.` : `Es tu salida más larga de las últimas ${a.vs_count}.`;
    else if (a.type === 'best_pace_of_recent') s3 = lang === 'en' ? `Best recent pace at this distance.` : `Tu mejor ritmo reciente en esta distancia.`;
    else if (a.type === 'week_volume' && f.week_sessions != null && f.week_km != null) s3 = lang === 'en' ? `That's ${f.week_sessions} sessions and ${fmtKm(f.week_km)} km in the last 7 days.` : `Llevas ${f.week_sessions} salidas y ${fmtKm(f.week_km)} km en los últimos 7 días.`;
  } else if (f.week_sessions != null && f.week_sessions >= 2 && f.week_km != null) {
    s3 = lang === 'en' ? `${f.week_sessions} sessions and ${fmtKm(f.week_km)} km in the last 7 days.` : `${f.week_sessions} salidas y ${fmtKm(f.week_km)} km en los últimos 7 días.`;
  }

  // S4 — siguiente acción concreta
  let s4;
  const na = analysis.next_action;
  if (na.type === 'plan_next' && na.detail) {
    const tipo = TIPO_H[lang][na.detail.tipo] || TIPO_H[lang].other;
    const cuando = fechaHumana(na.detail.fecha, nowIso, lang);
    s4 = cuando
      ? (lang === 'en' ? `Next up in your plan: ${tipo} ${cuando}.` : `Próxima sesión del plan: ${tipo} ${cuando}.`)
      : (lang === 'en' ? `Next up in your plan: ${tipo}.` : `Próxima sesión del plan: ${tipo}.`);
  } else if (na.type === 'recovery') {
    s4 = pick(lang === 'en'
      ? ['Now recover properly: hydrate, eat within the hour, and keep tomorrow very easy.', 'Recovery is part of the training: hydrate, refuel soon, easy day tomorrow.']
      : ['Ahora toca recuperar de verdad: hidrata, come algo en la próxima hora y mañana muy suave.', 'La recuperación también es entreno: hidrata, repón pronto y mañana día fácil.'], 1);
  } else {
    s4 = pick(lang === 'en'
      ? ['Keep showing up — consistency is what moves the needle.', 'If you head out tomorrow, keep it easy.', 'Rest well tonight; that is where the gains settle.']
      : ['Sigue apareciendo — la constancia es lo que te hace mejorar.', 'Si mañana sales, que sea suave.', 'Descansa bien esta noche: ahí se asienta la mejora.'], 1);
  }

  // Ensamblado con presupuesto de caracteres (2-4 frases, ≤420)
  let msg = [s1, s2, s3, s4].filter(Boolean).join(' ');
  if (msg.length > MSG_MAX_CHARS && s3) msg = [s1, s2, s4].join(' ');
  if (msg.length > MSG_MAX_CHARS) msg = [s2, s4].join(' ');
  if (msg.length > MSG_MAX_CHARS) msg = s2;
  return msg;
}

// Frases prohibidas por política (el harness escanea renderer + plantillas).
export const BANNED_PHRASES = [
  'he analizado', 'he echado un vistazo', 'analicé tus', // análisis no hecho
  'plan se ha adaptado', 'he adaptado tu plan', 'ajustado tu plan', // adaptación sin evidencia
  'premium', 'descuento', 'oferta', // venta
  'aunque duela', 'entrena con dolor', 'ignora el dolor', // consejo médico peligroso
  'récord personal', // solo permitido vía achievement real (no lo usamos textualmente)
];
