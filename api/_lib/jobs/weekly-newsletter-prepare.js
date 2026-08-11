// ============================================================
// Job: weekly-newsletter-prepare  (viernes)
//
// Prepara la edicion del lunes siguiente SIN intervencion humana:
//   catalogo curado -> articulo -> bloques -> pick draft -> validaciones ->
//   test a la direccion de revision -> si todo pasa, status='ready'.
//
// Fail-closed en todo:
//   - el interruptor global debe decir SI explicitamente (ausente = apagado);
//   - cualquier duda deja el pick en 'draft' con un codigo de error controlado;
//   - nunca deja en 'ready' algo que no se haya podido validar;
//   - nunca envia a la lista: sendNow es exclusivo del job del lunes.
//
// Reanudacion: un 'draft' creado por este mismo job puede retomarse (el viernes
// siguiente o desde el preflight del domingo) sin crear una segunda fila ni una
// segunda campana de test. El id de la campana se persiste ANTES de usarla.
//
// Modo dry-run (?dry_run=1): recorre todo el camino de decision y validacion
// pero no escribe en Supabase, no crea campanas y no envia nada. Funciona con la
// automatizacion apagada, para verificar en produccion antes de encenderla.
// ============================================================

import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';
import { buildEmailHtml, brevo } from './weekly-newsletter.js';
import {
  nextMondayMadrid, selectArticle, selectBlocks, buildEdition,
} from '../newsletter-selection.js';

// require() estatico: @vercel/nft lo rastrea y empaqueta los JSON de data/.
const require = createRequire(import.meta.url);

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const REVIEW_EMAIL = 'guetto2012@gmail.com';
const HISTORY_LIMIT = 12;
const LOW_CATALOG_THRESHOLD = 4;

export const PREPARE_ERRORS = {
  DISABLED: 'automation_disabled',
  DATA_UNAVAILABLE: 'catalog_data_unavailable',
  QUERY_FAILED: 'query_failed',
  HISTORY_FAILED: 'history_query_failed',
  WEEK_TAKEN: 'week_already_prepared',
  MANUAL_DRAFT: 'manual_draft_present',
  ARTICLE_UNREACHABLE: 'article_unreachable',
  ARTICLE_METADATA: 'article_metadata_invalid',
  LINK_BROKEN: 'block_link_broken',
  RENDER_FAILED: 'render_failed',
  PICK_INSERT_FAILED: 'pick_insert_failed',
  TEST_CAMPAIGN_FAILED: 'test_campaign_create_failed',
  TEST_ID_PERSIST_FAILED: 'test_campaign_id_persist_failed',
  TEST_CLAIM_FAILED: 'test_campaign_claim_failed',
  TEST_FAILED: 'test_send_failed',
  READY_UPDATE_FAILED: 'ready_update_failed',
};

/**
 * Interruptor global, FAIL-CLOSED: solo se activa con un si explicito.
 * Ausente, vacio o cualquier valor desconocido = automatizacion apagada.
 */
export function automationEnabled(env) {
  const v = (env && env.WEEKLY_NEWSLETTER_AUTOMATION_ENABLED != null
    ? String(env.WEEKLY_NEWSLETTER_AUTOMATION_ENABLED) : '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'on' || v === 'yes';
}

export function loadData() {
  try {
    return {
      catalog: require('../../../data/newsletter-catalog.json'),
      library: require('../../../data/newsletter-block-library.json'),
    };
  } catch (e) {
    return null;
  }
}

// Descarga la pagina y extrae los metadatos. No propaga el cuerpo de la respuesta.
export async function fetchArticleMeta(url, fetchImpl = fetch) {
  let r;
  try {
    r = await fetchImpl(url, { headers: { 'user-agent': 'CorrerJuntosNewsletterBot/1.0', accept: 'text/html' } });
  } catch (e) { return { error: PREPARE_ERRORS.ARTICLE_UNREACHABLE }; }
  if (!r.ok) return { error: PREPARE_ERRORS.ARTICLE_UNREACHABLE, http_status: r.status };

  const html = await r.text();
  const grab = (re) => { const m = html.match(re); return m ? m[1].trim() : ''; };
  const decode = (s) => s.replace(/&amp;/g, '&').replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

  const title = decode(grab(/<title>([^<]{5,})<\/title>/i)).replace(/\s*\|\s*CorrerJuntos\s*$/i, '');
  const description = decode(grab(/<meta\s+name="description"\s+content="([^"]{20,})"/i));
  const image = grab(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (!title || !description || !image) return { error: PREPARE_ERRORS.ARTICLE_METADATA };
  return { title, description, image };
}

// Comprueba que cada enlace responde 200. Devuelve el primero roto, o null.
async function checkLinks(urls, fetchImpl = fetch) {
  for (const u of urls) {
    if (!u) continue;
    try {
      const r = await fetchImpl(u, { method: 'GET', headers: { 'user-agent': 'CorrerJuntosNewsletterBot/1.0' } });
      if (!r.ok) return u;
    } catch (e) { return u; }
  }
  return null;
}

/**
 * Validador UNICO de una edicion ya guardada. Lo usan la reanudacion de un draft
 * y el preflight del domingo: un solo validador evita que dos caminos apliquen
 * criterios distintos a lo mismo.
 *
 * Comprueba articulo, imagen, enlaces de los bloques y que el correo renderiza.
 * Devuelve null si todo esta bien, o el codigo interno del fallo.
 */
export async function validateEdition(pick, fetchImpl = fetch) {
  const blockUrls = (pick && pick.blocks && Array.isArray(pick.blocks.items))
    ? pick.blocks.items.map(i => i && i.url).filter(Boolean) : [];
  const broken = await checkLinks([pick.url, pick.image_url, ...blockUrls], fetchImpl);
  if (broken) return PREPARE_ERRORS.LINK_BROKEN;
  try {
    const html = buildEmailHtml(pick);
    if (!html || html.length < 500) return PREPARE_ERRORS.RENDER_FAILED;
  } catch (e) { return PREPARE_ERRORS.RENDER_FAILED; }
  return null;
}

const done = (res, code, body) => res.status(code).json(body);
const fail = (res, code, error, weekOf, extra = {}) =>
  done(res, code, { ok: false, prepared: 0, week_of: weekOf, error, alert: true, ...extra });

export default async function runPrepare(req, res, env, deps = {}) {
  const fetchImpl = deps.fetch || fetch;
  const now = deps.now || new Date();
  // deps.createClient permite ejercitar el camino de produccion en pruebas: sin
  // deps.supabase, el handler construye su propio cliente igual que en Vercel.
  const clientFactory = deps.createClient || createClient;
  const supabase = deps.supabase || clientFactory(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const brevoImpl = deps.brevo || brevo;
  const dryRun = String(req.query?.dry_run || '') === '1';

  // El dry-run es de solo lectura, asi que puede correr con todo apagado.
  if (!dryRun && !automationEnabled(env)) {
    return done(res, 200, { ok: true, prepared: 0, reason: PREPARE_ERRORS.DISABLED });
  }

  const data = deps.data || loadData();
  if (!data) return fail(res, 500, PREPARE_ERRORS.DATA_UNAVAILABLE, null);

  const weekOf = deps.weekOf || nextMondayMadrid(now);

  // --- 1) Fila existente para esa semana ------------------------------------
  let existingRow = null;
  if (!dryRun) {
    const { data: rows, error: exErr } = await supabase
      .from('weekly_newsletter')
      .select('id, status, auto_prepared, test_campaign_id, week_of, title, subject, url, excerpt, image_url, cta_label, preheader, utm_campaign, blocks, campaign_name, selected_article, category')
      .eq('week_of', weekOf).limit(1);
    if (exErr) return fail(res, 500, PREPARE_ERRORS.QUERY_FAILED, weekOf);
    existingRow = rows && rows[0];
  }

  if (existingRow) {
    const st = existingRow.status;
    // Estados intocables: decision humana o envio ya en marcha.
    if (['ready', 'sending', 'sent', 'paused', 'cancelled'].includes(st)) {
      return done(res, 200, { ok: true, prepared: 0, week_of: weekOf, reason: PREPARE_ERRORS.WEEK_TAKEN, current_status: st });
    }
    // Un borrador escrito a mano no se toca: no sabemos que pretendia su autor.
    if (st === 'draft' && existingRow.auto_prepared !== true) {
      return done(res, 200, { ok: false, prepared: 0, week_of: weekOf, error: PREPARE_ERRORS.MANUAL_DRAFT, current_status: st, alert: true });
    }
    // Draft automatico interrumpido: se reanuda desde donde se quedo.
    if (st === 'draft') {
      return resumeDraft({ supabase, brevoImpl, env, res, now, pick: existingRow, weekOf, fetchImpl });
    }
    return done(res, 200, { ok: false, prepared: 0, week_of: weekOf, error: PREPARE_ERRORS.WEEK_TAKEN, current_status: st, alert: true });
  }

  // --- 2) Historico: cooldown, categoria y rotacion de bloques --------------
  // SIEMPRE se consulta, tambien en dry-run: es solo lectura, y un dry-run que
  // seleccionara con el historico vacio mentiria sobre lo que hara el viernes.
  const { data: hist, error: hErr } = await supabase
    .from('weekly_newsletter')
    .select('week_of, selected_article, category, block_ids')
    .lt('week_of', weekOf).order('week_of', { ascending: false }).limit(HISTORY_LIMIT);
  // Sin historico fiable NO se elige: hacerlo como si estuviera vacio repetiria
  // articulos y bloques recien enviados.
  if (hErr) return fail(res, 500, PREPARE_ERRORS.HISTORY_FAILED, weekOf);
  const history = hist || [];

  // --- 3) Articulo: SOLO de la lista blanca ---------------------------------
  const sel = selectArticle({ catalog: data.catalog, weekOf, history, historyLimit: HISTORY_LIMIT });
  if (sel.error) return fail(res, 200, sel.error, weekOf);

  // --- 4) El articulo existe y trae metadatos utiles ------------------------
  const url = `https://www.correrjuntos.com/blog/${sel.article.slug}`;
  const meta = await fetchArticleMeta(url, fetchImpl);
  if (meta.error) return fail(res, 200, meta.error, weekOf, { slug: sel.article.slug, http_status: meta.http_status });

  // --- 5) Bloques deterministas, sin repetir los recientes ------------------
  const recentIds = history.flatMap(h => (Array.isArray(h.block_ids) ? h.block_ids : []));
  const blk = selectBlocks({ library: data.library, article: sel.article, weekOf, recentBlockIds: recentIds });
  if (blk.error) return fail(res, 200, blk.error, weekOf);

  const edition = buildEdition({ article: sel.article, blocks: blk.blocks, weekOf, articleMeta: meta, reserved: !!sel.reserved });

  // --- 6) Todos los enlaces del correo, comprobados -------------------------
  const blockUrls = blk.blocks.items.map(i => i.url).filter(Boolean);
  const broken = await checkLinks([url, edition.image_url, ...blockUrls], fetchImpl);
  if (broken) return fail(res, 200, PREPARE_ERRORS.LINK_BROKEN, weekOf);

  // --- 7) El correo tiene que renderizar antes de crear nada ----------------
  let html;
  try {
    html = buildEmailHtml(edition);
    if (!html || html.length < 500) throw new Error('short');
  } catch (e) {
    return fail(res, 200, PREPARE_ERRORS.RENDER_FAILED, weekOf);
  }

  const lowCatalog = sel.remainingAfter < LOW_CATALOG_THRESHOLD;

  // --- DRY-RUN: hasta aqui y sin tocar nada --------------------------------
  if (dryRun) {
    return done(res, 200, {
      ok: true, dry_run: true, prepared: 0, week_of: weekOf,
      selected_article: sel.article.slug, category: sel.article.category,
      reserved: !!sel.reserved, seasonal: !!sel.seasonal,
      subject: edition.subject, preheader: edition.preheader,
      image_url: edition.image_url, block_ids: blk.usedIds,
      links_checked: [url, edition.image_url, ...blockUrls].filter(Boolean).length,
      html_bytes: html.length,
      history_size: history.length,
      low_catalog: lowCatalog, remaining_articles: sel.remainingAfter,
    });
  }

  // --- 8) Pick en draft. Nace bloqueado ------------------------------------
  const { data: inserted, error: insErr } = await supabase
    .from('weekly_newsletter')
    .insert({ ...edition, prepared_at: new Date(now).toISOString(), block_ids: blk.usedIds })
    .select('id, week_of, status');
  if (insErr || !inserted || inserted.length !== 1) {
    // Puede ser el indice unico de week_of: otra ejecucion gano la carrera.
    return fail(res, 500, PREPARE_ERRORS.PICK_INSERT_FAILED, weekOf);
  }

  return finishWithTest({
    supabase, brevoImpl, env, res, now, weekOf,
    pickId: inserted[0].id, html, subject: edition.subject,
    campaignName: edition.campaign_name, testCampaignId: null, revalidated: true,
    extra: {
      selected_article: sel.article.slug, category: sel.article.category,
      reserved: !!sel.reserved, seasonal: !!sel.seasonal, block_ids: blk.usedIds,
      low_catalog: lowCatalog, remaining_articles: sel.remainingAfter,
    },
  });
}

/**
 * Reanuda un draft creado por este job. Idempotente: reutiliza la campana de
 * test si ya existe y jamas crea una segunda fila.
 */
async function resumeDraft({ supabase, brevoImpl, env, res, now, pick, weekOf, fetchImpl }) {
  const marca = { pick_id: pick.id, resumed: true };

  // Revalidacion COMPLETA con el validador comun. Entre el viernes y ahora el
  // articulo puede haberse movido o la imagen desaparecido: no se reenvia una
  // prueba a ciegas ni se promociona algo que ya no se sostiene.
  const problema = await validateEdition(pick, fetchImpl);
  if (problema) {
    await supabase.from('weekly_newsletter').update({ last_error: problema }).eq('id', pick.id);
    return fail(res, 200, problema, weekOf, marca);
  }
  const html = buildEmailHtml(pick);

  return finishWithTest({
    supabase, brevoImpl, env, res, now, weekOf,
    pickId: pick.id, html, subject: pick.subject || pick.title,
    campaignName: pick.campaign_name || `Weekly · ${weekOf}`,
    testCampaignId: pick.test_campaign_id || null,
    revalidated: true,
    extra: { resumed: true, revalidated: true, selected_article: pick.selected_article, category: pick.category },
  });
}

/**
 * Tramo comun: campana de test -> sendTest -> promocion a ready.
 *
 * El id de la campana de test se PERSISTE Y SE CONFIRMA antes de usarla, para
 * que un reintento la reutilice en vez de crear otra. Si el proceso muere justo
 * despues del sendTest, el reintento reenviara la prueba: el propietario puede
 * recibir dos correos de prueba. Es el precio aceptado, y solo afecta a la
 * prueba interna — el envio a la lista sigue protegido por la maquina de
 * estados del lunes y no puede duplicarse.
 */
async function finishWithTest({ supabase, brevoImpl, env, res, now, weekOf, pickId, html, subject, campaignName, testCampaignId, revalidated = false, extra = {} }) {
  const base = { week_of: weekOf, pick_id: pickId, ...extra };

  if (!testCampaignId) {
    const sender = {
      email: env.BREVO_SENDER_EMAIL || 'hola@correrjuntos.com',
      name: env.BREVO_SENDER_NAME || 'Abraham · CorrerJuntos',
    };
    const created = await brevoImpl('/emailCampaigns', env, 'POST', {
      name: `TEST · ${campaignName}`.slice(0, 90),
      subject, sender, htmlContent: html,
      recipients: { listIds: [parseInt(process.env.BREVO_LIST_ID || '3', 10)] },
      inlineImageActivation: false,
    });
    if (!created.ok || !created.json?.id) {
      await supabase.from('weekly_newsletter').update({ last_error: PREPARE_ERRORS.TEST_CAMPAIGN_FAILED }).eq('id', pickId);
      return done(res, 200, { ok: false, prepared: 0, status: 'draft', error: PREPARE_ERRORS.TEST_CAMPAIGN_FAILED, http_status: created.status, alert: true, ...base });
    }
    testCampaignId = created.json.id;

    // Toma ATOMICA del id. El UPDATE exige que la fila siga siendo exactamente
    // la que creamos: si alguien la puso en paused/cancelled mientras se creaba
    // la campana, actualiza cero filas y NO se envia la prueba.
    const { data: saved, error: saveErr } = await supabase
      .from('weekly_newsletter').update({ test_campaign_id: testCampaignId })
      .eq('id', pickId)
      .eq('week_of', weekOf)
      .eq('status', 'draft')
      .eq('auto_prepared', true)
      .is('test_campaign_id', null)
      .select('id');
    if (saveErr) {
      return done(res, 200, { ok: false, prepared: 0, status: 'draft', error: PREPARE_ERRORS.TEST_ID_PERSIST_FAILED, test_campaign_id: testCampaignId, alert: true, ...base });
    }
    if (!saved || saved.length !== 1) {
      // La campana recien creada queda como borrador huerfano en Brevo. No se
      // borra automaticamente (ver runbook): borrar por id equivocado si seria
      // irreversible. Y no se toca el estado que la persona haya puesto.
      return done(res, 200, {
        ok: false, prepared: 0, error: PREPARE_ERRORS.TEST_CLAIM_FAILED,
        orphan_test_campaign_id: testCampaignId, alert: true, ...base,
      });
    }
  }

  const test = await brevoImpl(`/emailCampaigns/${testCampaignId}/sendTest`, env, 'POST', { emailTo: [REVIEW_EMAIL] });
  if (!test.ok) {
    await supabase.from('weekly_newsletter').update({ last_error: PREPARE_ERRORS.TEST_FAILED }).eq('id', pickId);
    return done(res, 200, { ok: false, prepared: 0, status: 'draft', error: PREPARE_ERRORS.TEST_FAILED, http_status: test.status, test_campaign_id: testCampaignId, alert: true, ...base });
  }

  // Brevo acepto el test y todo esta validado: a 'ready' sin esperar a nadie.
  // La condicion status='draft' evita pisar un paused/cancelled puesto a mano.
  const { data: promoted, error: upErr } = await supabase
    .from('weekly_newsletter')
    .update({ status: 'ready', ready_at: new Date(now).toISOString(), test_sent_at: new Date(now).toISOString(), last_error: null })
    .eq('id', pickId)
    .eq('week_of', weekOf)
    .eq('status', 'draft')
    .eq('auto_prepared', true)
    .eq('test_campaign_id', testCampaignId)
    .select('id, status');
  if (upErr || !promoted || promoted.length !== 1) {
    return done(res, 200, { ok: false, prepared: 0, status: 'draft', error: PREPARE_ERRORS.READY_UPDATE_FAILED, test_campaign_id: testCampaignId, alert: true, ...base });
  }

  return done(res, 200, {
    ok: true, prepared: 1, status: 'ready', revalidated,
    test_campaign_id: testCampaignId, test_to: REVIEW_EMAIL, ...base,
  });
}
