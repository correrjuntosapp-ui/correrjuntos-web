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
const SRC2 = 'api/_lib/brevo-contactability.js';
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
    "if (trialSet.has(p.id)) { counters.excluded_trial++; bump('trial_active'); continue; }", ''],
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

// F108.1 · Las tres antes declaradas «no aplicables» YA son demostrables:
// la contactabilidad se comprueba dentro del dry-run, antes de asignar brazo.
const MUTATIONS_CONTACT = [
  ['M8  suppression de Brevo ignorada', SRC,
    "      else if (estado === 'brevo_blocked') { counters.excluded_suppression++; bump('brevo_blocked'); }",
    "      else if (estado === 'brevo_blocked') { counters.contactable++; }"],
  ['M9  complaint/unsubscribe ignoradas', SRC,
    "      if (estado === 'unsubscribed') { counters.excluded_unsubscribe++; bump('brevo_blocked'); }",
    "      if (estado === 'unsubscribed') { counters.contactable++; }"],
  ['M11 continuar si Brevo falla', SRC,
    "      else { counters.excluded_brevo_error++; bump('brevo_lookup_failed'); }\n      continue;",
    "      else { counters.excluded_brevo_error++; }"],
  ['M21 asignar brazo ANTES de comprobar contactabilidad', SRC,
    "    counters.contactable++;\n\n    arm === 'treatment' ? counters.treatment++ : counters.holdout++;",
    "    counters.contactable++;"],
  ['M22 incluir suprimidos en el holdout', SRC,
    "    const estado = await contactability.check(email);\n    if (estado !== 'ok') {",
    "    const estado = await contactability.check(email);\n    if (false) {"],
  ['M23 convertir 429 en contactable', SRC2,
    "    if (r.status !== 200) return CONTACT_STATUS.ERROR;",
    "    if (r.status === 429) return CONTACT_STATUS.OK;\n    if (r.status !== 200) return CONTACT_STATUS.ERROR;"],
  ['M24 cambiar GET por POST', SRC2,
    "const ALLOWED_METHOD = 'GET';", "const ALLOWED_METHOD = 'POST';"],
  ['M25 aceptar respuesta malformada como contactable', SRC2,
    "    if (!c || typeof c !== 'object') return CONTACT_STATUS.ERROR;   // malformada → fail closed",
    "    if (!c || typeof c !== 'object') return CONTACT_STATUS.OK;"],
  ['M26 exponer una función de envío en el adaptador', SRC2,
    "  return { check, CONTACT_STATUS };",
    "  return { check, CONTACT_STATUS, sendEmail: async () => ({ ok: true }) };"],
  ['M27 imprimir el email o la respuesta de Brevo', SRC,
    "    const estado = await contactability.check(email);",
    "    const estado = await contactability.check(email); log('contacto ' + email);"],
  ['M28 persistir el email en el log', SRC,
    'suppressed_reason: safeReason,', "suppressed_reason: safeReason, experiment: email,"],
  // F108.2 · Reintroduce la falsa exclusión que dejaba la rama email vacía.
  // Debe morir por N1/N2: notifications_enabled es permiso de PUSH.
  ['M30 reintroducir el filtro notifications_enabled en email', SRC,
    "    if (outSet.has(p.id)) { bump('optout'); continue; }",
    "    if (outSet.has(p.id)) { bump('optout'); continue; }\n    if (p.notifications_enabled === false) { bump('optout'); continue; }"],
  ['M29 reutilizar la respuesta de un usuario para otro', SRC,
    "    const estado = await contactability.check(email);",
    "    const estado = (globalThis.__cache = globalThis.__cache || await contactability.check(email));"],
];

const original2 = fs.readFileSync(SRC2, 'utf8');
const originalHash2 = crypto.createHash('sha256').update(original2).digest('hex');
const BASE = { [SRC]: original, [SRC2]: original2 };
const HASH = { [SRC]: originalHash, [SRC2]: originalHash2 };

let MUERTAS = 0, SUPERVIVIENTES = 0, INVALIDAS = 0;
const filas = [];

// Unifica: [nombre, fichero, ancla, reemplazo]
const TODAS = MUTATIONS.map(([n, a, r]) => [n, SRC, a, r]).concat(MUTATIONS_CONTACT);

for (const [nombre, fichero, ancla, reemplazo] of TODAS) {
  const base = BASE[fichero];
  if (!base.includes(ancla)) {
    INVALIDAS++; filas.push(['INVÁLIDA', nombre, 'ancla inexistente en ' + fichero]);
    continue;
  }
  fs.writeFileSync(fichero, base.replace(ancla, reemplazo));
  let salida = '', codigo = 0;
  try {
    salida = execFileSync('node', [HARNESS], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    codigo = e.status || 1;
    salida = String(e.stdout || '') + String(e.stderr || '');
  } finally {
    fs.writeFileSync(fichero, base);
    for (const f of [SRC, SRC2]) {
      const h = crypto.createHash('sha256').update(fs.readFileSync(f, 'utf8')).digest('hex');
      if (h !== HASH[f]) { console.error('FATAL: hash no restaurado en', f, 'tras', nombre); process.exit(2); }
    }
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

console.log(`\nMUERTAS ${MUERTAS} · SOBREVIVEN ${SUPERVIVIENTES} · INVÁLIDAS ${INVALIDAS} `);
console.log('hash del fuente restaurado:', (crypto.createHash('sha256').update(fs.readFileSync(SRC,'utf8')).digest('hex')===originalHash && crypto.createHash('sha256').update(fs.readFileSync(SRC2,'utf8')).digest('hex')===originalHash2) ? 'SÍ (ambos ficheros)' : 'NO');
process.exit(SUPERVIVIENTES === 0 && INVALIDAS === 0 ? 0 : 1);
