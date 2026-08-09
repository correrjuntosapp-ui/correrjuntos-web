#!/usr/bin/env node
/* F108 · Matriz de mutaciones sobre la rama EMAIL.
 * Cada mutación rompe UNA guarda del código real; el harness debe FALLAR.
 * Si el harness pasa con la guarda rota, la mutación SOBREVIVE = la guarda no
 * está demostrada. Hashes restaurados tras cada mutación (verificado).
 *
 *   node scripts/f108-activation-email-mutations.cjs
 */
const fs = require('node:fs');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const SRC = 'api/_lib/activation-email.js';
const HARNESS = 'scripts/f108-activation-email-harness.cjs';
const original = fs.readFileSync(SRC, 'utf8');
const originalHash = crypto.createHash('sha256').update(original).digest('hex');

// [anclaje exacto, sustitución] — el anclaje DEBE existir o la mutación se
// declara INVÁLIDA (no cuenta como muerta).
const MUTATIONS = [
  ['M1  tratamiento cambia entre ejecuciones',
    'const bucket = h.readUInt32BE(0) % 100;', 'const bucket = Math.floor(Math.random() * 100);'],
  ['M2  holdout recibe email',
    "if (arm === 'holdout') { await logRow(supabase, p.id, arm, dryRun, 'holdout'); continue; }", ''],
  ['M3  usuario con push entra en email',
    ".is('push_token', null);", ';'],
  ['M4  token posterior a la selección igualmente reserva',
    'if (fresh && fresh.push_token) {', 'if (false) {'],
  ['M5  trial no excluido',
    "if (trialSet.has(p.id)) { bump('trial_active'); continue; }", ''],
  ['M6  plan cancelado entra',
    "if (!planSet.has(p.id)) { bump('no_active_plan'); continue; }", ''],
  ['M7  workout completado entra',
    "if (doneSet.has(p.id) || runSet.has(p.id)) { bump('already_activated'); continue; }", ''],
  ['M10 unsubscribe ignorada',
    "if (outSet.has(p.id)) { bump('optout'); continue; }", ''],
  ['M12 email como identidad canónica (ambiguo aceptado)',
    'if (!Array.isArray(rows) || rows.length !== 1) return null;', 'if (!Array.isArray(rows) || rows.length === 0) return null;'],
  ['M13 dry-run llama al endpoint de envío',
    '      counters.simulados++;', '      counters.simulados++; await sendEmail(p.id);'],
  ['M14 dry-run consume la reserva real',
    "const mode = dryRun ? 'dry_run' : 'real';", "const mode = 'real';"],
  // M15: las dos líneas forman UNA sola guarda lógica (error de inserción y
  // resultado vacío son la misma condición de choque). Se mutan juntas: dejar
  // una en pie haría sobrevivir la mutación por redundancia, no por cobertura.
  ['M15 segunda pasada duplica la decisión',
    "    if (resvErr) { bump('already_dispatched_today'); continue; }  // choque = ya reservado\n    if (!resv || resv.length === 0) { bump('already_dispatched_today'); continue; }",
    '    if (false) { continue; }\n    const _ignored = resv;'],
  ['M16 timezone desconocida inventada',
    '    return null;                                     // fail closed: sin fecha no se reserva',
    "    return '1970-01-01';"],
  ['M17 se supera el límite diario sin apagar',
    'if (counters.candidatos > (config.max_candidates_day ?? 8)) {', 'if (false) {'],
  ['M18 colisión con despacho previo (lifecycle/push) ignorada',
    "if (realRow) { bump('already_dispatched_today'); continue; }", ''],
  ['M19 datos personales en logs',
    'suppressed_reason: safeReason,', "suppressed_reason: safeReason, experiment: 'correo@ejemplo.com',"],
  ['M20 enabled=false se ignora',
    "if (!config || config.enabled !== true) { counters.kill_switch = true; return counters; }", ''],
];

// Mutaciones que esta fase NO puede matar, declaradas explícitamente.
const NO_APLICABLES = [
  ['M8  suppression de Brevo ignorada', 'solo alcanzable con dry_run=false (envío real). No autorizado en F108.'],
  ['M9  complaint ignorada', 'idem M8: la consulta a Brevo solo ocurre en la rama de envío real.'],
  ['M11 fallo de Brevo permite continuar', 'idem M8: brevoLookup no se invoca en dry-run.'],
];

let MUERTAS = 0, SUPERVIVIENTES = 0, INVALIDAS = 0;
const filas = [];

for (const [nombre, ancla, reemplazo] of MUTATIONS) {
  if (!original.includes(ancla)) {
    INVALIDAS++; filas.push(['INVÁLIDA', nombre, 'ancla inexistente']);
    continue;
  }
  fs.writeFileSync(SRC, original.replace(ancla, reemplazo));
  let salida = '', codigo = 0;
  try {
    salida = execFileSync('node', [HARNESS], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    codigo = e.status || 1;
    salida = String(e.stdout || '') + String(e.stderr || '');
  } finally {
    fs.writeFileSync(SRC, original);
    const h = crypto.createHash('sha256').update(fs.readFileSync(SRC, 'utf8')).digest('hex');
    if (h !== originalHash) { console.error('FATAL: hash no restaurado tras', nombre); process.exit(2); }
  }
  const huboFallo = /FAIL \d+/.test(salida) && !/FAIL 0/.test(salida);
  const crash = codigo !== 0 && !/PASS \d+ · FAIL/.test(salida);
  if (crash) { INVALIDAS++; filas.push(['INVÁLIDA', nombre, 'crash/sintaxis — no cuenta como muerta']); }
  else if (huboFallo) { MUERTAS++; filas.push(['MUERTA', nombre, (salida.match(/FAIL\s+(\S.*)/) || [, ''])[1].slice(0, 48)]); }
  else { SUPERVIVIENTES++; filas.push(['SOBREVIVE', nombre, '⚠ guarda NO demostrada']); }
}

console.log('\n─── F108 · MATRIZ DE MUTACIONES ───');
for (const f of filas) console.log(f[0].padEnd(10), f[1].padEnd(48), f[2] || '');
console.log('\n─── No aplicables en esta fase (declaradas, no ocultadas) ───');
for (const n of NO_APLICABLES) console.log('N/A       ', n[0].padEnd(48), n[1]);
console.log(`\nMUERTAS ${MUERTAS} · SOBREVIVEN ${SUPERVIVIENTES} · INVÁLIDAS ${INVALIDAS} · N/A ${NO_APLICABLES.length}`);
console.log('hash del fuente restaurado:', crypto.createHash('sha256').update(fs.readFileSync(SRC, 'utf8')).digest('hex') === originalHash ? 'SÍ' : 'NO');
process.exit(SUPERVIVIENTES === 0 && INVALIDAS === 0 ? 0 : 1);
