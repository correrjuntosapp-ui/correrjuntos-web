#!/usr/bin/env node
/* F134 — mutaciones. Cada una reintroduce un fallo real de la vinculación.
   Todas deben morir. */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const R = join(dirname(fileURLToPath(import.meta.url)), '..');
const F = {
  m: join(R, 'api/_lib/strava-plan-matcher.js'),
  o: join(R, 'api/_lib/strava-plan-linker.js'),
  w: join(R, 'api/strava-webhook.js'),
  sql: join(R, 'sql/134-strava-plan-linking-preview.sql'),
};
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

const MUT = [
  // ── Unicidad ──
  ['M01 se retira la comprobacion de unicidad (ambiguo pasa)', F.m,
    (s) => s.replace("if (encajan.length > 1) {\n    return salida(MATCH.AMBIGUOUS, { candidatasEvaluadas: encajan.length });\n  }", '')],
  ['M02 con varios candidatos se coge el primero', F.m,
    (s) => s.replace('if (encajan.length > 1) {', 'if (false) {')],

  // ── Fecha ──
  ['M03 se usa la fecha del servidor en vez de la local', F.m,
    (s) => s.replace('const mismoDia = libres.filter((w) => w.fecha === a.fechaLocal);',
      "const hoy = new Date().toISOString().split('T')[0];\n  const mismoDia = libres.filter((w) => w.fecha === hoy);")],
  ['M04 se ignora la fecha por completo', F.m,
    (s) => s.replace('const mismoDia = libres.filter((w) => w.fecha === a.fechaLocal);', 'const mismoDia = libres;')],
  ['M05 la fecha acepta cualquier formato', F.m,
    (s) => s.replace("/^\\d{4}-\\d{2}-\\d{2}$/.test(s)", 'true')],

  // ── Deporte ──
  ['M06 se admite cualquier deporte', F.m,
    (s) => s.replace('const tiposPermitidos = COMPATIBILIDAD[String(a.deporte || \'\')];',
      'const tiposPermitidos = COMPATIBILIDAD[String(a.deporte || \'\')] || TIPOS_CARRERA;')],
  ['M07 la bici completa planes de carrera', F.m,
    (s) => s.replace('  walking: [\'walk_run\'],', '  walking: [\'walk_run\'],\n  bici: TIPOS_CARRERA,')],
  ['M08 la caminata completa cualquier sesion', F.m,
    (s) => s.replace("walking: ['walk_run'],", 'walking: TIPOS_CARRERA,')],
  ['M09 el dia de descanso se puede completar', F.m,
    (s) => s.replace("'intervals', 'fartlek', 'specific', 'activation', 'race', 'race_day',",
      "'intervals', 'fartlek', 'specific', 'activation', 'race', 'race_day', 'rest',")],

  // ── Reutilizacion / sobrescritura ──
  ['M10 una actividad se puede reutilizar', F.m,
    (s) => s.replace("if (a.yaVinculada === true) return salida(MATCH.ALREADY_LINKED);", '')],
  ['M11 se sobrescriben sesiones ya completadas', F.m,
    (s) => s.replace("(w) => w && w.plan_id === p.id && w.estado === 'pending' && !w.actividad_id",
      '(w) => w && w.plan_id === p.id')],
  ['M12 se permite doble vinculo (sesion con actividad ya puesta)', F.m,
    (s) => s.replace("w.estado === 'pending' && !w.actividad_id", "w.estado === 'pending'")],

  // ── Objetivos ──
  ['M13 sin objetivo se da por buena la coincidencia', F.m,
    (s) => s.replace("return { ok: false, criterio: 'sin_objetivo' };", "return { ok: true, criterio: 'sin_objetivo' };")],
  ['M14 el margen se dispara al 300 %', F.m, (s) => s.replace('export const TOLERANCIA = 0.30;', 'export const TOLERANCIA = 3.0;')],
  ['M15 el margen ignora el limite inferior', F.m,
    (s) => s.replace('return real >= objetivo * (1 - TOLERANCIA) && real <= objetivo * (1 + TOLERANCIA);',
      'return real <= objetivo * (1 + TOLERANCIA);')],
  // Nota: mutar `objetivo <= 0` dentro de `dentroDeMargen` resulta INERTE —
  // `encaja` ya filtra objetivos no positivos antes de llamar, así que esa
  // guarda es defensa redundante y ninguna prueba puede matarla. Se muta en su
  // lugar la guarda que sí es alcanzable: el saneado de números.
  ['M16 se aceptan magnitudes no finitas (NaN/Infinity)', F.m,
    (s) => s.replace("const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);",
      "const num = (v) => (typeof v === 'number' ? v : null);")],

  // ── Plan ──
  ['M17 un plan pausado o abandonado tambien vale', F.m,
    (s) => s.replace("if (!p.id || p.estado !== 'active') return salida(MATCH.NO_MATCH);", 'if (!p.id) return salida(MATCH.NO_MATCH);')],
  ['M18 el plan de otro usuario vale', F.m,
    (s) => s.replace('if (p.userId !== a.userId) return salida(MATCH.NO_MATCH);', '')],

  // ── Actividad invalida ──
  ['M19 se acepta una actividad sin magnitudes', F.m,
    (s) => s.replace('if ((dist == null || dist <= 0) && (dur == null || dur <= 0)) return salida(MATCH.INVALID_ACTIVITY);', '')],

  // ── Orquestador ──
  // ── F134.1 · puertas del canario ──
  ['M20 la config ausente abre en vez de cerrar', F.o,
    (s) => s.replace("if (!Array.isArray(data) || data.length === 0) return { ok: false, motivo: 'config_missing' };",
      "if (!Array.isArray(data) || data.length === 0) return { ok: true, enabled: true, dryRun: false, allowlist: [] };")],
  ['M21 un error de consulta de config abre', F.o,
    (s) => s.replace("if (error) return { ok: false, motivo: 'config_query_failed' };", '')],
  ['M42 allowlist VACIA + dry_run=false activa a todo el mundo', F.o,
    (s) => s.replace('return enLista ? \'on\' : \'off\';', "return config.allowlist.length === 0 || enLista ? 'on' : 'off';")],
  ['M43 se acepta una allowlist de mas de dos cuentas', F.o,
    (s) => s.replace("if (lista.length > MAX_ALLOWLIST) return { ok: false, motivo: 'allowlist_too_big' };", '')],
  ['M44 se acepta un correo en la allowlist', F.o,
    (s) => s.replace("if (!lista.every((u) => typeof u === 'string' && UUID_RE.test(u))) {\n      return { ok: false, motivo: 'allowlist_invalid' };\n    }", '')],
  ['M45 dry_run nulo desactiva el modo seguro', F.o,
    (s) => s.replace('dryRun: row.dry_run !== false,', 'dryRun: row.dry_run === true,')],
  ['M46 enabled=false ya no apaga', F.o,
    (s) => s.replace("if (!config || config.ok !== true || config.enabled !== true) return 'off';",
      "if (!config || config.ok !== true) return 'off';")],
  ['M47 en dry-run se ignora la allowlist y entra todo el mundo', F.o,
    (s) => s.replace("if (config.dryRun) return config.allowlist.length === 0 || enLista ? 'dry' : 'off';",
      "if (config.dryRun) return 'dry';")],
  ['M48 el orquestador ignora la config y escribe', F.o,
    (s) => s.replace("      const config = await leerConfig(sb);\n      modo = modoParaUsuario(config, run && run.user_id);",
      "      modo = 'on';")],
  ['M49 la config nace ENCENDIDA', F.sql,
    (s) => s.replace('enabled    boolean      NOT NULL DEFAULT false', 'enabled    boolean      NOT NULL DEFAULT true')],
  ['M50 la config nace escribiendo', F.sql,
    (s) => s.replace('dry_run    boolean      NOT NULL DEFAULT true', 'dry_run    boolean      NOT NULL DEFAULT false')],
  ['M51 la fila sembrada nace activa', F.sql,
    (s) => s.replace("VALUES (1, false, true, '{}'::uuid[])", "VALUES (1, true, false, '{}'::uuid[])")],
  ['M52 la BD deja de limitar la allowlist', F.sql,
    (s) => s.replace('CONSTRAINT slc_allowlist_max CHECK (array_length(allowlist, 1) IS NULL OR array_length(allowlist, 1) <= 2)',
      'CONSTRAINT slc_allowlist_max CHECK (true)')],
  ['M53 la allowlist pasa a texto (admitiria correos)', F.sql,
    (s) => s.replace("allowlist  uuid[]       NOT NULL DEFAULT '{}'::uuid[],", "allowlist  text[]       NOT NULL DEFAULT '{}'::text[],")],
  ['M54 la config queda expuesta a clientes', F.sql,
    (s) => s.replace('GRANT ALL ON public.strava_linking_config TO service_role;',
      'GRANT SELECT ON public.strava_linking_config TO anon;\nGRANT ALL ON public.strava_linking_config TO service_role;')],
  ['M22 el dry-run escribe igualmente', F.o,
    (s) => s.replace("if (modo === 'dry') return fuera('matched_dry_run', { motivo: decision.criterio });", '')],
  ['M23 se escribe aunque el resultado no sea matched', F.o,
    (s) => s.replace('if (decision.resultado !== MATCH.MATCHED) return fuera(decision.resultado);', '')],
  ['M24 con dos planes activos se coge el primero', F.o,
    (s) => s.replace('if (!planes || planes.length !== 1) return fuera(MATCH.NO_MATCH);', 'if (!planes || planes.length === 0) return fuera(MATCH.NO_MATCH);')],
  ['M25 un error de consulta se trata como coincidencia', F.o,
    (s) => s.replace("if (errPlan) return fuera('error_consulta', { motivo: 'user_plans' });", '')],
  ['M26 un error de escritura se reporta como escrito', F.o,
    (s) => s.replace("if (errRpc) return fuera('error_escritura', { motivo: errRpc.message ? 'rpc' : null });",
      'if (errRpc) return { modo, resultado: \'completada\', escrito: true, motivo: null };')],
  ['M27 se marca completada antes de confirmar la escritura', F.o,
    (s) => s.replace("resultado: fila?.escrito ? 'completada' : 'sin_cambios',\n      escrito: Boolean(fila?.escrito),",
      "resultado: 'completada',\n      escrito: true,")],
  ['M28 la excepcion se propaga y tumba el webhook', F.o,
    (s) => s.replace("  } catch (e) {\n    // Fail closed y silencioso hacia arriba: el flujo legacy continúa.\n    console.warn('[f134] vinculacion no aplicada:', e?.message || 'error');\n    return fuera('excepcion');\n  }",
      '  } catch (e) {\n    throw e;\n  }')],
  ['M29 no se comprueba si la actividad ya fue usada', F.o,
    (s) => s.replace('yaVinculada: Array.isArray(yaUsada) && yaUsada.length > 0,', 'yaVinculada: false,')],

  // ── Webhook ──
  ['M30 la vinculacion corre DESPUES de Jose', F.w,
    (s) => {
      const ini = s.indexOf('  // 5.5 [F134]');
      const fin = s.indexOf('  // 6. Mensajes in-app');
      if (ini < 0 || fin < 0 || fin <= ini) throw new Error('anclas no encontradas');
      const bloque = s.slice(ini, fin);
      const sinBloque = s.slice(0, ini) + s.slice(fin);
      return sinBloque.replace('  // 7. Push remota de José', bloque + '  // 7. Push remota de José');
    }],
  ['M31 la vinculacion manda su propia push', F.w,
    (s) => s.replace("    console.log('[strava-webhook] f134 vinculacion:', vinculo.modo, vinculo.resultado);",
      "    console.log('[strava-webhook] f134 vinculacion:', vinculo.modo, vinculo.resultado);\n    await sendExpoPush('x', 'Plan', 'Sesion completada', {});")],
  ['M32 Ana gana una insercion extra', F.w,
    (s) => s.replace("  // 6. Mensajes in-app de José y Ana.",
      "  await sb.from('maria_chat_messages').insert({ user_id: conn.user_id, role: 'assistant', content: 'x' });\n  // 6. Mensajes in-app de José y Ana.")],

  // ── SQL ──
  ['M33 la migracion queda con COMMIT', F.sql, (s) => s.replace('ROLLBACK;\n-- COMMIT;', 'COMMIT;')],
  ['M34 se pierde el indice unico', F.sql,
    (s) => s.replace('CREATE UNIQUE INDEX ux_user_workouts_actividad_unica', 'CREATE INDEX ux_user_workouts_actividad_unica')],
  ['M35 la RPC pierde search_path', F.sql, (s) => s.replace('SET search_path = public, pg_temp\n', '')],
  ['M36 la RPC queda expuesta a clientes', F.sql,
    (s) => s.replace('GRANT EXECUTE ON FUNCTION public.link_strava_run_to_workout(uuid, uuid, uuid) TO service_role;',
      'GRANT EXECUTE ON FUNCTION public.link_strava_run_to_workout(uuid, uuid, uuid) TO service_role, authenticated;')],
  ['M37 el guard de pending desaparece', F.sql, (s) => s.replace("AND w.estado        = 'pending'", 'AND true')],
  ['M38 el guard de actividad libre desaparece', F.sql, (s) => s.replace('AND w.actividad_id IS NULL', 'AND true')],
  ['M39 el guard de fecha desaparece', F.sql, (s) => s.replace('AND w.fecha         = r.fecha', 'AND true')],
  ['M40 el guard de plan activo desaparece', F.sql, (s) => s.replace("AND up.estado       = 'active'", 'AND true')],
  ['M41 completed_at vuelve a now()', F.sql, (s) => s.replace('completed_at     = v_fin,', 'completed_at     = now(),')],
];

const orig = {}; const hashes = {};
for (const p of Object.values(F)) { orig[p] = readFileSync(p, 'utf8'); hashes[p] = sha(p); }

try { execSync('node scripts/f134-harness.mjs', { cwd: R, stdio: 'pipe' }); }
catch { console.error('ABORTADO: el harness no esta verde antes de mutar'); process.exit(1); }

let muertas = 0; const vivas = [];
for (const [nombre, fichero, fn] of MUT) {
  let mutado;
  try { mutado = fn(orig[fichero]); } catch { console.error(`MUTACION ROTA: ${nombre}`); process.exit(1); }
  if (mutado === orig[fichero]) { console.error(`MUTACION INERTE: ${nombre}`); process.exit(1); }
  writeFileSync(fichero, mutado);
  let fallo = false;
  try { execSync('node scripts/f134-harness.mjs', { cwd: R, stdio: 'pipe' }); } catch { fallo = true; }
  writeFileSync(fichero, orig[fichero]);
  if (sha(fichero) !== hashes[fichero]) { console.error(`INTEGRIDAD ROTA tras ${nombre}`); process.exit(1); }
  if (fallo) { muertas++; console.log(`  muerta   ${nombre}`); }
  else { vivas.push(nombre); console.log(`  VIVA     ${nombre}`); }
}

try { execSync('node scripts/f134-harness.mjs', { cwd: R, stdio: 'pipe' }); }
catch { console.error('El harness no vuelve a verde tras restaurar'); process.exit(1); }

console.log(`\nF134 mutaciones: ${muertas}/${MUT.length} muertas · ${vivas.length} supervivientes`);
if (vivas.length) process.exit(1);
