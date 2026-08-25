#!/usr/bin/env node
// ============================================================
// f118-mutations.cjs — Matriz de mutaciones del post-entreno de José (F118)
//
// Protocolo (idéntico a F109/F111):
//  0. Baseline VERDE obligatorio (harness 0 FAIL) antes de mutar.
//  1. Por mutación: aplicar → correr harness → DEBE fallar (mutante muerto)
//     → restaurar → verificar hash byte a byte del fichero.
//  2. Un harness que CRASHEA con la mutación cuenta como mutante muerto
//     (la mutación rompió un invariante), pero se registra como 'crash'.
//  3. Cualquier mutante SUPERVIVIENTE = FAIL global del runner.
// ============================================================
const { execSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const ENGINE = 'api/_lib/post-workout-analysis.js';
const ORCH = 'api/_lib/post-workout-orchestrator.js';
const COACH = 'supabase/functions/ai-coach/index.ts';
const HOOK = 'api/strava-webhook.js';

// CRLF-safe: los anchors se definen en LF; normalizamos al aplicar.
function readNorm(f) { return readFileSync(join(ROOT, f), 'utf8').replace(/\r\n/g, '\n'); }
function sha(f) { return createHash('sha256').update(readFileSync(join(ROOT, f))).digest('hex'); }

const MUTATIONS = [
  { id: 'M01', clase: 'columna incorrecta reintroducida (runs EN)', file: COACH,
    find: "select('deporte, distancia_km, duracion_segundos, rpe, vo2max_estimate, created_at')",
    repl: "select('deporte, distance_km, duration_sec, rpe, vo2max_estimate, created_at')" },
  { id: 'M02', clase: "estado 'activo' reintroducido", file: COACH,
    find: ".in('estado', ['active', 'paused'])\n    .order('updated_at', { ascending: false })\n    .limit(1);\n  if (planErr)",
    repl: ".eq('estado', 'activo')\n    .order('updated_at', { ascending: false })\n    .limit(1);\n  if (planErr)" },
  { id: 'M03', clase: 'ignorar error de Supabase (chat runs)', file: COACH,
    find: "if (recentRunsErr) { console.error('[ai-coach] chat runs query failed:', recentRunsErr.code || 'err'); dataGaps.push('recent_runs_unavailable'); }",
    repl: "/* error ignorado */" },
  { id: 'M04', clase: 'segundos confundidos con milisegundos', file: ENGINE,
    find: 'const dur = num(cur.duration_sec);',
    repl: 'const dur = num(cur.duration_sec) != null ? num(cur.duration_sec) * 1000 : null;' },
  { id: 'M05', clase: 'cálculo de ritmo invertido', file: ENGINE,
    find: '      const p = dur / km;\n      if (p >= PACE_MIN_SEC_KM && p <= PACE_MAX_SEC_KM) paceSecKm = p;',
    repl: '      const p = km / dur;\n      if (p >= PACE_MIN_SEC_KM && p <= PACE_MAX_SEC_KM) paceSecKm = p;' },
  { id: 'M06', clase: 'comparar deportes distintos', file: ENGINE,
    find: "if (normalizeSport(h.sport) !== sport) { droppedCrossSport++; continue; }",
    repl: "if (false) { droppedCrossSport++; continue; }" },
  { id: 'M07', clase: 'usar actividades futuras', file: ENGINE,
    find: 'if (startTs != null && hTs != null && hTs >= startTs) { droppedFuture++; continue; }',
    repl: 'if (false) { droppedFuture++; continue; }' },
  { id: 'M08', clase: 'idempotencia basada en el texto generado', file: ORCH,
    find: '    content,\n    is_proactive: true,\n    run_ref: runRef,\n  });\n  if (!error) return \'created\';',
    repl: '    content,\n    is_proactive: true,\n    run_ref: String(content).slice(0, 32),\n  });\n  if (!error) return \'created\';' },
  { id: 'M09', clase: 'reintento crea dos mensajes (23505 ignorado)', file: ORCH,
    find: "if (error.code === '23505') return 'duplicate';",
    repl: "if (false) return 'duplicate';" },
  { id: 'M10', clase: 'inventar mejora sin historial', file: ENGINE,
    find: 'if (paceSecKm != null && withPace.length >= 2) {',
    repl: 'if (paceSecKm != null && withPace.length >= 0) {' },
  { id: 'M11', clase: 'renderer acepta objeto incompleto', file: ENGINE,
    find: "if (!analysis || analysis.ok !== true || !analysis.facts) return null;",
    repl: "if (!analysis) return null;" },
  { id: 'M12', clase: 'renderer altera cifras', file: ENGINE,
    find: '? (lang === \'en\' ? `You completed ${km} km at ${pace}/km` : `Has completado ${km} km a ${pace}/km`)',
    repl: '? (lang === \'en\' ? `You completed ${Number(km) + 1} km at ${pace}/km` : `Has completado ${Number(km) + 1} km a ${pace}/km`)' },
  { id: 'M13', clase: 'consejo médico peligroso', file: ENGINE,
    find: "'Ahora toca recuperar de verdad: hidrata, come algo en la próxima hora y mañana muy suave.'",
    repl: "'Ahora toca recuperar: entrena mañana aunque duela, el dolor es debilidad saliendo.'" },
  { id: 'M14', clase: 'log con PII', file: ORCH,
    find: "console.log('[post-workout] event insert failed:', eventName, error.code || 'err');",
    repl: "console.log('[post-workout] event insert failed:', eventName, params.email, error.code || 'err');" },
  { id: 'M15', clase: 'afirmar que el plan se adaptó sin evidencia', file: ENGINE,
    find: "? (lang === 'en' ? `Next up in your plan: ${tipo} ${cuando}.` : `Próxima sesión del plan: ${tipo} ${cuando}.`)",
    repl: "? (lang === 'en' ? `I adapted your plan: ${tipo} ${cuando}.` : `He adaptado tu plan: ${tipo} ${cuando}.`)" },
  { id: 'M16', clase: "estado 'pendiente' fantasma en next workout", file: COACH,
    find: "      .eq('estado', 'pending')\n      .gte('fecha', todayStr)",
    repl: "      .eq('estado', 'pendiente')\n      .gte('fecha', todayStr)" },
  { id: 'M17', clase: 'cap legacy fail-open (count con error ignorado)', file: ORCH,
    find: "if (capErr) return { outcome: 'legacy_cap_check_failed' };",
    repl: "if (false) return { outcome: 'legacy_cap_check_failed' };" },
  { id: 'M18', clase: 'distancia cero aceptada', file: ENGINE,
    find: "if (km != null && km <= 0) { reasons.push('zero_distance'); return out; }",
    repl: "if (km != null && km < 0) { reasons.push('zero_distance'); return out; }" },
  // ── F118.1 — mutaciones del canario y de la política de dedup ──
  { id: 'M19', clase: 'cap diario REINTRODUCIDO en el camino del motor', file: ORCH,
    find: '  const r = await runJosePostWorkout(sb, runRow, opts);\n  return { ...r, path: \'canary_live\' };',
    repl: '  { const t0 = new Date(); t0.setHours(0, 0, 0, 0); const { count: ccap } = await sb.from(\'coach_chat_messages\').select(\'id\', { count: \'exact\', head: true }).eq(\'user_id\', runRow.user_id).eq(\'is_proactive\', true).gte(\'created_at\', t0.toISOString()); if (ccap && ccap > 0) return { outcome: \'capped\', path: \'canary_live\' }; }\n  const r = await runJosePostWorkout(sb, runRow, opts);\n  return { ...r, path: \'canary_live\' };' },
  { id: 'M20', clase: 'unicidad por FECHA en vez de por actividad', file: ENGINE,
    find: 'if (run && run.strava_activity_id != null) return `strava:${run.strava_activity_id}`;',
    repl: "if (run && run.strava_activity_id != null) return `strava:${String(run.hora_inicio || '').slice(0, 10)}`;" },
  { id: 'M21', clase: 'envío FUERA de la allowlist', file: ORCH,
    find: '    && config.allowlist.includes(userId));',
    repl: '    && true);' },
  { id: 'M22', clase: 'sistema activado por defecto (enabled forzado)', file: ORCH,
    find: "return { ok: true, enabled: row.enabled === true, dryRun: row.dry_run !== false, allowlist: list };",
    repl: "return { ok: true, enabled: true, dryRun: row.dry_run !== false, allowlist: list };" },
  { id: 'M23', clase: 'continuar ante configuración AUSENTE', file: ORCH,
    find: "if (error || !Array.isArray(data) || data.length === 0) return { ok: false, reason: error ? 'config_query_failed' : 'config_missing' };",
    repl: "if (error || !Array.isArray(data) || data.length === 0) return { ok: true, enabled: true, dryRun: false, allowlist: ['00000000-0000-4000-8000-000000000001'] };" },
  { id: 'M24', clase: 'acoplar el despliegue a la Edge Function del chat', file: ORCH,
    find: "const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;",
    repl: "const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\nconst COUPLED_ENDPOINT = 'functions/v1/ai-coach';\nvoid COUPLED_ENDPOINT;" },
  { id: 'M25', clase: 'romper la paridad JS/TS (deriva del motor)', file: ENGINE,
    find: 'export const STABLE_BAND_PCT = 2;',
    repl: 'export const STABLE_BAND_PCT = 3;' },
  // ── F118.1-bis — semántica fail-closed del usuario canario ──
  { id: 'M26', clase: 'error del motor cae a LEGACY (prohibido en canario)', file: ORCH,
    find: "    await emitEvent(sb, runRow.user_id, 'post_workout_analysis_insufficient_data', baseParams);\n    return { outcome: 'no_message', analysis };",
    repl: "    await emitEvent(sb, runRow.user_id, 'post_workout_analysis_insufficient_data', baseParams);\n    return { ...(await legacyJoseMessage(sb, runRow)), analysis };" },
  { id: 'M27', clase: 'fallback básico inventa una comparación', file: ENGINE,
    find: "      : (lang === 'en' ? `You logged ${dur} of running` : `Has sumado ${dur} de carrera`);\n    let clause = '';",
    repl: "      : (lang === 'en' ? `You logged ${dur} of running` : `Has sumado ${dur} de carrera`);\n    let clause = ', un 5% más rápido que tu media reciente';" },
  { id: 'M28', clase: 'plantilla legacy alterada (no-canario debe quedar intacto)', file: ORCH,
    find: 'Buen trabajo — he echado un vistazo a los números y los tienes en tu resumen.',
    repl: 'Buen trabajo — los números los tienes en tu resumen.' },
  { id: 'M29', clase: 'dry-run envía mensajes reales', file: ORCH,
    find: '  if (config.dryRun) {',
    repl: '  if (false) {' },
];

function runHarness() {
  try {
    execSync('node scripts/f118-harness.mjs', { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
    return { ok: true };
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    return { ok: false, crashed: !out.includes('F118 harness:') };
  }
}

// 0. Baseline verde
const base = runHarness();
if (!base.ok) { console.error('BASELINE ROJO — no se puede mutar sobre un harness que ya falla.'); process.exit(2); }
console.log('Baseline verde ✔');

let dead = 0; const survivors = []; const crashes = [];
for (const m of MUTATIONS) {
  const original = readFileSync(join(ROOT, m.file));
  const hashBefore = createHash('sha256').update(original).digest('hex');
  const norm = readNorm(m.file);
  if (!norm.includes(m.find)) { console.error(`${m.id} ANCHOR NO ENCONTRADO en ${m.file}`); survivors.push(m.id + ' (anchor)'); continue; }
  writeFileSync(join(ROOT, m.file), norm.replace(m.find, m.repl));
  const r = runHarness();
  writeFileSync(join(ROOT, m.file), original);
  if (sha(m.file) !== hashBefore) { console.error(`${m.id} RESTAURACIÓN FALLIDA`); process.exit(3); }
  if (r.ok) { survivors.push(`${m.id} — ${m.clase}`); console.log(`${m.id} SUPERVIVIENTE ✗ (${m.clase})`); }
  else { dead++; if (r.crashed) crashes.push(m.id); console.log(`${m.id} muerto ✔${r.crashed ? ' (crash)' : ''} — ${m.clase}`); }
}

// Verificación final: harness verde tras restaurar todo
const fin = runHarness();
console.log(`\nMutaciones: ${dead}/${MUTATIONS.length} muertas · supervivientes: ${survivors.length} · harness final: ${fin.ok ? 'VERDE' : 'ROJO'}`);
if (crashes.length) console.log('Muertes por crash (válidas, registradas):', crashes.join(', '));
if (survivors.length || !fin.ok) { survivors.forEach((s) => console.log('  ✗ ' + s)); process.exit(1); }
