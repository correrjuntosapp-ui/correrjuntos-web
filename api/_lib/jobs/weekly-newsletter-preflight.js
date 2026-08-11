// ============================================================
// Job: weekly-newsletter-preflight  (domingo)
//
// Ultima red de seguridad antes del lunes. Comprueba que existe exactamente un
// pick en 'ready' para el lunes siguiente y que su articulo sigue en pie.
// Si falta, intenta preparar UNA vez. Si tampoco puede, avisa por correo.
//
// Este job NUNCA envia la newsletter a la lista. Solo verifica, repara y avisa.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { brevo } from './weekly-newsletter.js';
import { nextMondayMadrid } from '../newsletter-selection.js';
import runPrepare, { automationEnabled, validateEdition } from './weekly-newsletter-prepare.js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const ALERT_EMAIL = 'guetto2012@gmail.com';

export const PREFLIGHT_STATES = {
  DISABLED: 'automation_disabled',
  READY_OK: 'ready_ok',
  HELD: 'edition_held',              // paused / cancelled: decision humana, no es fallo
  RECOVERED: 'recovered_by_prepare',
  RESUMED: 'resumed_auto_draft',
  RESUME_FAILED: 'resume_failed',
  DUPLICATE: 'duplicate_picks',
  BROKEN_READY: 'ready_pick_broken',
  NOT_READY: 'pick_not_ready',
  PREPARE_FAILED: 'prepare_failed',
};

// Aviso operativo. Texto plano y saneado: sin claves, rutas internas ni datos
// personales mas alla del destinatario, que es el propio responsable.
export async function sendAlert(env, weekOf, state, detail, brevoImpl = brevo) {
  const sender = { email: env.BREVO_SENDER_EMAIL || 'hola@correrjuntos.com', name: env.BREVO_SENDER_NAME || 'CorrerJuntos' };
  const safe = String(detail || '').replace(/[^a-z0-9_\-. ]/gi, '').slice(0, 120);
  return brevoImpl('/smtp/email', env, 'POST', {
    sender,
    to: [{ email: ALERT_EMAIL }],
    subject: `[CorrerJuntos] Newsletter ${weekOf}: revision necesaria`,
    textContent:
      `La comprobacion del domingo no ha podido dejar lista la edicion del ${weekOf}.\n\n` +
      `Estado: ${state}\nDetalle: ${safe || 'sin detalle'}\n\n` +
      `El lunes no saldra nada salvo que exista un pick en 'ready' para esa semana.\n` +
      `Revisa la tabla weekly_newsletter y el runbook antes de las 10:00.`,
  });
}

const done = (res, code, body) => res.status(code).json(body);

export default async function runPreflight(req, res, env, deps = {}) {
  const now = deps.now || new Date();
  const supabase = deps.supabase || createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const fetchImpl = deps.fetch || fetch;
  const validate = deps.validate || validateEdition;
  const brevoImpl = deps.brevo || brevo;
  const prepareImpl = deps.prepare || runPrepare;

  if (!automationEnabled(env)) {
    return done(res, 200, { ok: true, state: PREFLIGHT_STATES.DISABLED, sent: 0 });
  }

  const weekOf = deps.weekOf || nextMondayMadrid(now);

  const { data: rows, error } = await supabase
    .from('weekly_newsletter').select('id, status, url, image_url, blocks, title, subject, excerpt, cta_label, preheader, utm_campaign, week_of, auto_prepared, test_campaign_id').eq('week_of', weekOf);
  if (error) return done(res, 500, { ok: false, state: 'query_failed', week_of: weekOf });

  const picks = rows || [];

  // Mas de una fila para la misma semana: nunca deberia pasar. No se toca nada.
  if (picks.length > 1) {
    await sendAlert(env, weekOf, PREFLIGHT_STATES.DUPLICATE, `${picks.length} filas`, brevoImpl);
    return done(res, 409, { ok: false, state: PREFLIGHT_STATES.DUPLICATE, week_of: weekOf, count: picks.length, alert: true });
  }

  const pick = picks[0];

  // Sin pick: un unico intento de preparacion.
  if (!pick) {
    const captured = { code: 0, body: null };
    const fakeRes = { status(c) { captured.code = c; return this; }, json(b) { captured.body = b; return this; } };
    await prepareImpl(req, fakeRes, env, { ...deps, weekOf });

    if (captured.body && captured.body.ok && captured.body.status === 'ready') {
      return done(res, 200, { ok: true, state: PREFLIGHT_STATES.RECOVERED, week_of: weekOf, pick_id: captured.body.pick_id, selected_article: captured.body.selected_article });
    }
    const detail = (captured.body && captured.body.error) || 'sin_pick';
    await sendAlert(env, weekOf, PREFLIGHT_STATES.PREPARE_FAILED, detail, brevoImpl);
    return done(res, 200, { ok: false, state: PREFLIGHT_STATES.PREPARE_FAILED, week_of: weekOf, detail, alert: true });
  }

  // paused / cancelled son decisiones humanas: se respetan y no se avisa.
  if (pick.status === 'paused' || pick.status === 'cancelled') {
    return done(res, 200, { ok: true, state: PREFLIGHT_STATES.HELD, week_of: weekOf, status: pick.status });
  }

  // Draft AUTOMATICO: el viernes se quedo a medias. Un unico intento de
  // reanudacion antes de dar la voz de alarma. prepare reutiliza la campana de
  // test si ya existe, asi que reintentar no duplica nada.
  if (pick.status === 'draft' && pick.auto_prepared === true) {
    const captured = { body: null };
    const fakeRes = { status() { return this; }, json(b) { captured.body = b; return this; } };
    await prepareImpl(req, fakeRes, env, { ...deps, weekOf });

    // No basta con que diga 'ready': se exige la marca de que la reanudacion
    // paso la revalidacion completa (articulo, imagen, enlaces y render).
    if (captured.body && captured.body.ok && captured.body.status === 'ready' && captured.body.revalidated === true) {
      return done(res, 200, { ok: true, state: PREFLIGHT_STATES.RESUMED, week_of: weekOf, pick_id: pick.id });
    }
    const detail = (captured.body && captured.body.error) || 'resume_failed';
    await sendAlert(env, weekOf, PREFLIGHT_STATES.RESUME_FAILED, detail, brevoImpl);
    return done(res, 200, { ok: false, state: PREFLIGHT_STATES.RESUME_FAILED, week_of: weekOf, pick_id: pick.id, detail, alert: true });
  }

  if (pick.status !== 'ready') {
    // Incluye el draft escrito a mano: no se toca, solo se avisa.
    await sendAlert(env, weekOf, PREFLIGHT_STATES.NOT_READY, pick.status, brevoImpl);
    return done(res, 200, { ok: false, state: PREFLIGHT_STATES.NOT_READY, week_of: weekOf, status: pick.status, alert: true });
  }

  // Revalidacion COMPLETA del 'ready' con el MISMO validador que usa la
  // reanudacion: articulo, imagen, enlaces de los bloques y render. Entre el
  // viernes y el domingo el articulo puede haberse movido.
  const problema = await validate(pick, fetchImpl);
  if (problema) {
    // Transicion atomica ready -> paused, condicionada a que la fila siga tal
    // cual. Se pausa, nunca se cancela ni se borra: el lunes no puede salir
    // contenido roto, pero la edicion sigue ahi para arreglarla a mano.
    const { data: pausado } = await supabase
      .from('weekly_newsletter')
      .update({ status: 'paused', last_error: problema })
      .eq('id', pick.id).eq('week_of', weekOf).eq('status', 'ready')
      .select('id');
    const pausedOk = Array.isArray(pausado) && pausado.length === 1;
    await sendAlert(env, weekOf, PREFLIGHT_STATES.BROKEN_READY, problema, brevoImpl);
    return done(res, 200, {
      ok: false, state: PREFLIGHT_STATES.BROKEN_READY, week_of: weekOf,
      pick_id: pick.id, detail: problema, paused: pausedOk, alert: true,
    });
  }

  return done(res, 200, { ok: true, state: PREFLIGHT_STATES.READY_OK, week_of: weekOf, pick_id: pick.id });
}
