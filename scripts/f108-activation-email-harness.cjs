#!/usr/bin/env node
/* F108 · Harness funcional de la rama EMAIL de activación.
 * Ejecuta contra el CÓDIGO REAL (import dinámico del módulo ESM) con un
 * Supabase simulado en memoria. Cero red, cero base de datos, cero envíos.
 *
 *   node scripts/f108-activation-email-harness.cjs
 */
const assert = require('node:assert');

let PASS = 0, FAIL = 0;
const results = [];
function check(name, fn) {
  return Promise.resolve().then(fn).then(() => { PASS++; results.push(['PASS', name]); })
    .catch((e) => { FAIL++; results.push(['FAIL', name, e.message]); });
}

// ── Supabase simulado ───────────────────────────────────────────────────────
function makeDb(seed) {
  const T = {
    profiles: seed.profiles || [],
    user_plans: seed.user_plans || [],
    user_workouts: seed.user_workouts || [],
    runs: seed.runs || [],
    trial_starts: seed.trial_starts || [],
    activation_email_optout: seed.optout || [],
    activation_dispatch_log: seed.dispatch || [],
    activation_email_log: [],
    activation_email_config: [seed.config],
  };
  const fail = seed.failOn || {};
  let seq = 1;
  function from(table) {
    const q = { table, filters: [], _single: false };
    const rows = () => {
      let r = T[table] || [];
      for (const f of q.filters) {
        if (f.op === 'eq') r = r.filter((x) => x[f.col] === f.val);
        if (f.op === 'in') r = r.filter((x) => f.val.includes(x[f.col]));
        if (f.op === 'is-null') r = r.filter((x) => x[f.col] === null || x[f.col] === undefined);
        if (f.op === 'gte') r = r.filter((x) => x[f.col] >= f.val);
        if (f.op === 'lte') r = r.filter((x) => x[f.col] <= f.val);
      }
      return r;
    };
    const api = {
      select() { return api; },
      eq(c, v) { q.filters.push({ op: 'eq', col: c, val: v }); return api; },
      in(c, v) { q.filters.push({ op: 'in', col: c, val: v }); return api; },
      is(c) { q.filters.push({ op: 'is-null', col: c }); return api; },
      gte(c, v) { q.filters.push({ op: 'gte', col: c, val: v }); return api; },
      lte(c, v) { q.filters.push({ op: 'lte', col: c, val: v }); return api; },
      maybeSingle() { if (fail[table]) return Promise.resolve({ data: null, error: { message: 'boom' } }); const r = rows(); return Promise.resolve({ data: r[0] || null, error: null }); },
      single() { if (fail[table]) return Promise.resolve({ data: null, error: { message: 'boom' } }); const r = rows(); return Promise.resolve({ data: r[0] || null, error: null }); },
      insert(v) {
        const arr = Array.isArray(v) ? v : [v];
        // Índices únicos parciales replicados
        for (const row of arr) {
          if (table === 'activation_dispatch_log') {
            const clash = T[table].some((x) => x.user_id === row.user_id && x.local_date === row.local_date && x.mode === row.mode);
            if (clash) return { select: () => Promise.resolve({ data: null, error: { message: 'duplicate' } }), then: (r) => r({ data: null, error: { message: 'duplicate' } }) };
          }
          if (table === 'activation_email_log') {
            const real = row.status !== 'dry_run';
            const clash = T[table].some((x) => x.user_id === row.user_id && x.day_n === row.day_n && ((x.status !== 'dry_run') === real));
            if (clash) return { select: () => Promise.resolve({ data: null, error: { message: 'duplicate' } }), then: (r) => r({ data: null, error: { message: 'duplicate' } }) };
          }
          row.id = seq++;
          T[table].push(row);
        }
        const out = { data: arr, error: null };
        return { select: () => Promise.resolve(out), then: (r) => r(out) };
      },
      update(v) { return { eq: (c, val) => { (T[table] || []).forEach((x) => { if (x[c] === val) Object.assign(x, v); }); return Promise.resolve({ error: null }); } }; },
      delete() { return { eq: (c, v) => { T[table] = T[table].filter((x) => x[c] !== v); return Promise.resolve({ error: null }); } }; },
      then(res) { if (fail[table]) return res({ data: null, error: { message: 'boom' } }); return res({ data: rows(), error: null }); },
    };
    return api;
  }
  return { from, _T: T };
}

const HOURS = 3600000;
const NOW = new Date('2026-08-12T10:00:00Z');           // martes, fuera de franja boletín
const bornHoursAgo = (h) => new Date(NOW.getTime() - h * HOURS).toISOString();

function baseSeed(over = {}) {
  return Object.assign({
    profiles: [{ id: 'u1', created_at: bornHoursAgo(24), push_token: null, notifications_enabled: true, pais: 'ES' }],
    user_plans: [{ user_id: 'u1', estado: 'active' }],
    user_workouts: [], runs: [], trial_starts: [], optout: [], dispatch: [],
    config: { id: 1, enabled: true, dry_run: true, max_per_run: 6, max_candidates_day: 8 },
  }, over);
}

const THROWING_SENDER = async () => { throw new Error('ENVIO INVOCADO — prohibido en dry-run'); };

(async () => {
  const mod = await import('../api/_lib/activation-email.js');
  const { runActivationEmailBranch, assignArm, isInWindow, localDateFor, isNewsletterWindow } = mod;

  const run = (seed, extra = {}) => {
    const db = makeDb(seed);
    return runActivationEmailBranch(Object.assign({
      supabase: db, now: NOW, config: seed.config,
      sendEmail: THROWING_SENDER, brevoLookup: null,
    }, extra)).then((c) => ({ c, db }));
  };

  // ── BASELINE ──────────────────────────────────────────────────────────────
  await check('B1 · candidato válido produce decisión simulada', async () => {
    const { c, db } = await run(baseSeed());
    assert.strictEqual(c.candidatos, 1);
    assert.strictEqual(c.simulados + c.holdout, 1);
    assert.strictEqual(c.enviados, 0);
    assert.strictEqual(db._T.activation_dispatch_log.filter((r) => r.mode === 'real').length, 0);
  });

  await check('B2 · dry-run NO consume la reserva real', async () => {
    const { db } = await run(baseSeed());
    const dry = db._T.activation_dispatch_log.filter((r) => r.mode === 'dry_run');
    const real = db._T.activation_dispatch_log.filter((r) => r.mode === 'real');
    assert.ok(dry.length >= 0 && real.length === 0, 'no debe existir fila real');
  });

  await check('B3 · asignación estable entre ejecuciones', async () => {
    const a = assignArm('usuario-x'), b = assignArm('usuario-x'), d = assignArm('usuario-x');
    assert.strictEqual(a, b); assert.strictEqual(b, d);
  });

  await check('B4 · reparto ~85/15 sobre 5.000 ids', async () => {
    let t = 0; for (let i = 0; i < 5000; i++) if (assignArm('u' + i) === 'treatment') t++;
    const pct = (t / 5000) * 100;
    assert.ok(pct > 82 && pct < 88, 'reparto fuera de rango: ' + pct.toFixed(1));
  });

  await check('B5 · ventana 20-28 h', async () => {
    assert.ok(isInWindow(bornHoursAgo(24), NOW));
    assert.ok(!isInWindow(bornHoursAgo(12), NOW));
    assert.ok(!isInWindow(bornHoursAgo(40), NOW));
    assert.ok(!isInWindow('no-es-fecha', NOW));
  });

  await check('B6 · segunda pasada no duplica la decisión', async () => {
    const seed = baseSeed();
    const db = makeDb(seed);
    const deps = { supabase: db, now: NOW, config: seed.config, sendEmail: THROWING_SENDER, brevoLookup: null };
    await runActivationEmailBranch(deps);
    const n1 = db._T.activation_dispatch_log.length + db._T.activation_email_log.length;
    await runActivationEmailBranch(deps);
    const n2 = db._T.activation_dispatch_log.length + db._T.activation_email_log.length;
    assert.strictEqual(n1, n2, 'la segunda pasada creó filas nuevas');
  });

  // ── GUARDAS ───────────────────────────────────────────────────────────────
  const guard = (nombre, seed, razon) => check(nombre, async () => {
    const { c } = await run(seed);
    assert.ok(c.excluidos[razon] >= 1, `esperado excluido por ${razon}, obtenido ${JSON.stringify(c.excluidos)}`);
    assert.strictEqual(c.enviados, 0);
  });

  await guard('G1 · plan cancelado → no_active_plan', baseSeed({ user_plans: [{ user_id: 'u1', estado: 'cancelled' }] }), 'no_active_plan');
  await guard('G2 · ya entrenó → already_activated', baseSeed({ user_workouts: [{ user_id: 'u1', estado: 'completed' }] }), 'already_activated');
  await guard('G3 · trial iniciado → trial_active', baseSeed({ trial_starts: [{ user_id: 'u1' }] }), 'trial_active');
  await guard('G4 · baja → optout', baseSeed({ optout: [{ user_id: 'u1' }] }), 'optout');
  await guard('G5 · push ya despachado hoy → already_dispatched_today',
    baseSeed({ dispatch: [{ user_id: 'u1', local_date: localDateFor(NOW, 'ES'), mode: 'real', channel: 'push' }] }), 'already_dispatched_today');

  await check('G6 · token aparece entre selección y reserva → gana el push', async () => {
    const seed = baseSeed();
    const db = makeDb(seed);
    // el perfil "fresco" ya tiene token: simula la aparición durante la pasada
    const orig = db.from;
    db.from = (t) => {
      const api = orig(t);
      if (t === 'profiles') {
        const s = api.single.bind(api);
        api.single = () => Promise.resolve({ data: { push_token: 'ExponentPushToken[x]' }, error: null });
        void s;
      }
      return api;
    };
    const c = await runActivationEmailBranch({ supabase: db, now: NOW, config: seed.config, sendEmail: THROWING_SENDER, brevoLookup: null });
    assert.ok(c.excluidos['push_took_priority'] >= 1, JSON.stringify(c.excluidos));
    assert.strictEqual(db._T.activation_dispatch_log.length, 0, 'la reserva debió revertirse');
  });

  await check('G7 · kill switch enabled=false detiene todo', async () => {
    const seed = baseSeed({ config: { id: 1, enabled: false, dry_run: true, max_per_run: 6, max_candidates_day: 8 } });
    const { c, db } = await run(seed);
    assert.strictEqual(c.kill_switch, true);
    assert.strictEqual(db._T.activation_email_log.length, 0);
  });

  await check('G8 · exceso de candidatos apaga el sistema (fail closed)', async () => {
    const profiles = Array.from({ length: 12 }, (_, i) => ({ id: 'u' + i, created_at: bornHoursAgo(24), push_token: null, notifications_enabled: true, pais: 'ES' }));
    const seed = baseSeed({ profiles, user_plans: profiles.map((p) => ({ user_id: p.id, estado: 'active' })) });
    const { c, db } = await run(seed);
    assert.strictEqual(c.abort_limite, 'max_candidates_day');
    assert.strictEqual(db._T.activation_email_config[0].enabled, false, 'debió autoapagarse');
    assert.strictEqual(db._T.activation_email_log.length, 0);
  });

  await check('G9 · error de Supabase → fail closed, cero envíos', async () => {
    const seed = baseSeed(); seed.failOn = { profiles: true };
    const { c, db } = await run(seed);
    assert.strictEqual(c.enviados, 0);
    assert.strictEqual(db._T.activation_email_log.length, 0);
  });

  await check('G10 · timezone desconocida no se inventa', async () => {
    assert.strictEqual(localDateFor(NOW, 'ES'), '2026-08-12');
    assert.strictEqual(localDateFor(NOW, 'ZZ'), localDateFor(NOW, 'ES'), 'país desconocido cae a Madrid, no inventa');
    assert.strictEqual(localDateFor(new Date('x'), 'ES'), null, 'fecha inválida debe dar null (fail closed)');
  });

  await check('G11 · lunes en franja de boletín no envía', async () => {
    const lunes = new Date('2026-08-10T08:00:00Z');
    assert.ok(isNewsletterWindow(lunes));
    assert.ok(!isNewsletterWindow(NOW));
  });

  await check('G12 · el endpoint de envío es inalcanzable en dry-run', async () => {
    // El sender lanza si se invoca. 30 candidatos válidos, ninguna llamada.
    const profiles = Array.from({ length: 6 }, (_, i) => ({ id: 'v' + i, created_at: bornHoursAgo(23), push_token: null, notifications_enabled: true, pais: 'ES' }));
    const seed = baseSeed({ profiles, user_plans: profiles.map((p) => ({ user_id: p.id, estado: 'active' })) });
    const { c } = await run(seed);
    assert.strictEqual(c.brevo_send_calls, 0, 'hubo llamadas de envío');
    assert.strictEqual(c.enviados, 0);
  });

  await check('G13 · holdout nunca recibe', async () => {
    // buscar un id cuyo brazo sea holdout
    let hid = null;
    for (let i = 0; i < 500 && !hid; i++) if (assignArm('h' + i) === 'holdout') hid = 'h' + i;
    assert.ok(hid, 'no se encontró id holdout');
    const seed = baseSeed({
      profiles: [{ id: hid, created_at: bornHoursAgo(24), push_token: null, notifications_enabled: true, pais: 'ES' }],
      user_plans: [{ user_id: hid, estado: 'active' }],
    });
    const { c, db } = await run(seed);
    assert.strictEqual(c.holdout, 1);
    assert.strictEqual(c.simulados, 0, 'el holdout no debe producir decisión de envío');
    const row = db._T.activation_email_log[0];
    assert.strictEqual(row.suppressed_reason, 'holdout');
  });

  await check('G14 · ningún log contiene PII', async () => {
    const { db } = await run(baseSeed());
    const blob = JSON.stringify(db._T.activation_email_log) + JSON.stringify(db._T.activation_dispatch_log);
    assert.ok(!/@/.test(blob), 'aparece un @ (posible email) en los logs');
    for (const r of db._T.activation_email_log) {
      if (r.suppressed_reason) assert.ok(mod.SUPPRESSION_REASONS.has(r.suppressed_reason), 'motivo fuera de lista cerrada');
    }
  });

  await check('G16 · un usuario CON token de push jamás entra en la cohorte email', async () => {
    // La selección debe filtrar por push_token nulo. Si el filtro desaparece,
    // este usuario entraría y sería tratado como candidato de email.
    const seed = baseSeed({
      profiles: [
        { id: 'conToken', created_at: bornHoursAgo(24), push_token: 'ExponentPushToken[zzz]', notifications_enabled: true, pais: 'ES' },
      ],
      user_plans: [{ user_id: 'conToken', estado: 'active' }],
    });
    const { c } = await run(seed);
    assert.strictEqual(c.candidatos, 0, 'un usuario con token no puede ser candidato de email');
    assert.strictEqual(c.treatment + c.holdout, 0);
  });

  await check('G17 · choque de reserva no produce segunda decisión', async () => {
    // Ya existe una reserva dry_run para hoy: la pasada debe abortar ese
    // usuario por colisión, sin crear una segunda fila de decisión.
    const seed = baseSeed({
      dispatch: [{ user_id: 'u1', local_date: localDateFor(NOW, 'ES'), mode: 'dry_run', channel: 'email' }],
    });
    const { c, db } = await run(seed);
    assert.ok(c.excluidos['already_dispatched_today'] >= 1, JSON.stringify(c.excluidos));
    assert.strictEqual(db._T.activation_dispatch_log.length, 1, 'no debe añadirse una segunda reserva');
    assert.strictEqual(c.simulados, 0);
  });

  await check('G15 · identidad canónica: resolución ambigua falla cerrado', async () => {
    assert.strictEqual(mod.resolveSingleUserId([{ id: 'a' }, { id: 'b' }]), null);
    assert.strictEqual(mod.resolveSingleUserId([]), null);
    assert.strictEqual(mod.resolveSingleUserId([{ id: 'a' }]), 'a');
  });

  // ── Resultado ─────────────────────────────────────────────────────────────
  console.log('\n─── F108 · HARNESS rama email ───');
  for (const r of results) console.log(r[0].padEnd(5), r[1], r[2] ? '→ ' + r[2] : '');
  console.log(`\nPASS ${PASS} · FAIL ${FAIL}`);
  process.exit(FAIL === 0 ? 0 : 1);
})();
