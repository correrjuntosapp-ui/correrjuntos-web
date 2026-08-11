// ============================================================
// Seleccion editorial de la newsletter automatica.
//
// TODO lo de este modulo es PURO: sin red, sin BD, sin reloj propio (la fecha
// entra como parametro). Asi la decision de "que se envia el lunes" es
// reproducible y auditable, y las pruebas no necesitan simular nada.
//
// Regla que no se negocia: la autorizacion editorial es la lista blanca
// (data/newsletter-catalog.json). Aqui NO se deduce que un articulo sea seguro
// a partir de su HTML ni de ninguna otra senal.
// ============================================================

export const SELECTION_ERRORS = {
  CATALOG_INVALID: 'catalog_invalid',
  CATALOG_EMPTY: 'catalog_empty',
  NO_ELIGIBLE_ARTICLE: 'no_eligible_article',
  LIBRARY_INVALID: 'library_invalid',
  BLOCKS_UNAVAILABLE: 'blocks_unavailable',
  DUPLICATE_RESERVATION: 'duplicate_reservation',
  RESERVED_INELIGIBLE: 'reserved_article_ineligible',
};

const SITE_ORIGIN = 'https://www.correrjuntos.com';

// Las paginas del blog declaran og:image con ruta relativa (/public/...). En un
// correo eso no resuelve: hay que absolutizarlo o la imagen sale rota.
export function absoluteUrl(u, origin = SITE_ORIGIN) {
  if (typeof u !== 'string' || !u.trim()) return null;
  const s = u.trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return 'https:' + s;
  if (s.startsWith('/')) return origin + s;
  return null;   // esquemas raros (javascript:, data:) fuera
}

// --- fechas en Europe/Madrid -------------------------------------------------

const MADRID = 'Europe/Madrid';
const DOW = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

// Descompone un instante en la fecha/hora LOCAL de Madrid. Usar Intl evita
// tener que saber si estamos en CET o CEST: el navegador/Node ya lo sabe.
export function madridParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MADRID, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
  }).formatToParts(date).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: parseInt(parts.hour, 10) % 24,
    minute: parseInt(parts.minute, 10),
    weekday: parts.weekday,
    dow: DOW[parts.weekday] || 0,
  };
}

// Suma dias a una fecha civil YYYY-MM-DD sin tocar husos.
function addDays(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Lunes de la semana en curso, en calendario de Madrid.
export function mondayOfWeekMadrid(date) {
  const p = madridParts(date);
  return addDays(p.date, -(p.dow - 1));
}

// Proximo lunes ESTRICTAMENTE futuro. Si hoy ya es lunes, devuelve el de la
// semana siguiente: prepare nunca debe rehacer la edicion que ya esta en curso.
export function nextMondayMadrid(date) {
  const p = madridParts(date);
  const delta = (8 - p.dow) % 7 || 7;
  return addDays(p.date, delta);
}

// Ventana de envio: lunes, HORA LOCAL 10 completa (10:00-10:59) en Madrid.
//
// Por que la hora entera y no 15 minutos: en el plan Hobby de Vercel los cron no
// se ejecutan al minuto exacto, pueden correrse dentro de su hora. Una ventana
// de 15 minutos perderia esos envios. No he podido verificar que el proyecto sea
// Pro, asi que se disena para el caso peor.
//
// Sigue actuando un solo disparo: de los dos cron (08:00 y 09:00 UTC) solo uno
// cae en la hora 10 local, segun sea CEST (verano) o CET (invierno). Y aunque
// ambos entrasen, la toma atomica del pick impediria el segundo envio.
export function isSendWindowMadrid(date) {
  const p = madridParts(date);
  return p.dow === 1 && p.hour === 10;
}

// --- utilidades deterministas ------------------------------------------------

// Hash estable (FNV-1a). Misma semana -> mismo resultado, siempre.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function rotate(list, seed) {
  if (!list.length) return null;
  return list[hash(seed) % list.length];
}

// --- catalogo ----------------------------------------------------------------

const REQUIRED = ['slug', 'enabled', 'affiliate', 'promotional', 'draft', 'language', 'category'];

// Un articulo es elegible SOLO si declara explicitamente todos los campos y
// todos dicen que si. Un campo ausente = no elegible (nunca se asume seguro).
export function isEligible(a) {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return false;
  for (const f of REQUIRED) if (!(f in a)) return false;
  return a.enabled === true
    && a.affiliate === false
    && a.promotional === false
    && a.draft === false
    && a.language === 'es'
    && typeof a.slug === 'string' && a.slug.length > 0
    && typeof a.category === 'string' && a.category.length > 0;
}

export function eligibleArticles(catalog) {
  if (!catalog || catalog.version !== 1 || !Array.isArray(catalog.articles)) return null;
  return catalog.articles.filter(isEligible);
}

/**
 * Elige el articulo de la semana.
 *
 * @param catalog        contenido de newsletter-catalog.json
 * @param weekOf         lunes objetivo, 'YYYY-MM-DD'
 * @param history        ediciones anteriores, mas reciente primero:
 *                       [{ week_of, selected_article, category }]
 * @param historyLimit   cuantas ediciones cuentan para el cooldown (12)
 */
export function selectArticle({ catalog, weekOf, history = [], historyLimit = 12 }) {
  const eligible = eligibleArticles(catalog);
  if (eligible === null) return { error: SELECTION_ERRORS.CATALOG_INVALID };
  if (!eligible.length) return { error: SELECTION_ERRORS.CATALOG_EMPTY };

  const recent = history.slice(0, historyLimit);
  const lastCategory = history.length ? history[0].category : null;

  // Reserva explicita para una semana concreta (scheduledWeeks). Se mira sobre
  // TODO el catalogo, tambien lo deshabilitado: una reserva mal puesta sobre un
  // articulo afiliado tiene que dar error, no pasar desapercibida.
  const reserved = catalog.articles.filter(a =>
    a && Array.isArray(a.scheduledWeeks) && a.scheduledWeeks.includes(weekOf));
  if (reserved.length > 1) {
    return { error: SELECTION_ERRORS.DUPLICATE_RESERVATION, week_of: weekOf, count: reserved.length };
  }
  if (reserved.length === 1) {
    // La reserva se impone a estacionalidad, categoria y cooldown: es una
    // decision humana explicita. NUNCA a las banderas de seguridad.
    if (!isEligible(reserved[0])) {
      return { error: SELECTION_ERRORS.RESERVED_INELIGIBLE, week_of: weekOf, slug: reserved[0].slug };
    }
    const usedBefore = new Set(recent.map(h => h && h.selected_article).filter(Boolean));
    return {
      article: reserved[0],
      reserved: true,
      seasonal: Array.isArray(reserved[0].seasonMonths)
        && reserved[0].seasonMonths.includes(parseInt(weekOf.slice(5, 7), 10)),
      poolSize: eligible.length,
      remainingAfter: eligible.filter(a => !usedBefore.has(a.slug) && a.slug !== reserved[0].slug).length,
    };
  }

  // Cooldown: fuera todo lo usado en las ultimas N ediciones.
  const usedSlugs = new Set(recent.map(h => h && h.selected_article).filter(Boolean));
  let pool = eligible.filter(a => !usedSlugs.has(a.slug));
  if (!pool.length) return { error: SELECTION_ERRORS.NO_ELIGIBLE_ARTICLE, exhausted: true };

  // No repetir la categoria de la semana anterior, salvo que no quede otra.
  const byCategory = lastCategory ? pool.filter(a => a.category !== lastCategory) : pool;
  if (byCategory.length) pool = byCategory;

  // Estacionalidad: preferencia, nunca permiso.
  const month = parseInt(weekOf.slice(5, 7), 10);
  const seasonal = pool.filter(a => Array.isArray(a.seasonMonths) && a.seasonMonths.includes(month));
  const tier = seasonal.length ? seasonal : pool;

  // Dentro del tramo elegido, mayor priority; empates resueltos por hash de la
  // semana, que es estable pero no siempre el mismo articulo.
  const top = Math.max(...tier.map(a => Number(a.priority) || 0));
  const finalists = tier.filter(a => (Number(a.priority) || 0) === top);
  const chosen = finalists.length === 1 ? finalists[0] : rotate(finalists, weekOf);

  return {
    article: chosen,
    seasonal: seasonal.length > 0,
    poolSize: pool.length,
    remainingAfter: pool.length - 1,
  };
}

// --- bloques -----------------------------------------------------------------

function chooseBlock(list, allowedIds, weekOf, salt, recentIds) {
  if (!Array.isArray(list) || !list.length) return null;
  let cand = Array.isArray(allowedIds) && allowedIds.length
    ? list.filter(b => allowedIds.includes(b.id))
    : list.slice();
  if (!cand.length) cand = list.slice();
  const fresh = cand.filter(b => !recentIds.has(b.id));
  return rotate(fresh.length ? fresh : cand, weekOf + '|' + salt);
}

/**
 * Construye los cuatro bloques. Determinista para una semana dada.
 * @param recentBlockIds ids usados en ediciones recientes (para no repetir).
 */
export function selectBlocks({ library, article, weekOf, recentBlockIds = [] }) {
  if (!library || library.version !== 1) return { error: SELECTION_ERRORS.LIBRARY_INVALID };
  const recent = new Set(recentBlockIds);

  const training = chooseBlock(library.trainings, article.trainingLibraryKeys, weekOf, 'training', recent);
  const tip = chooseBlock(library.tips, article.tipLibraryKeys, weekOf, 'tip', recent);
  const race = chooseBlock(library.races, null, weekOf, 'race', recent);
  const tool = chooseBlock(library.tools, article.toolKeys, weekOf, 'tool', recent);
  if (!training || !tip || !race || !tool) return { error: SELECTION_ERRORS.BLOCKS_UNAVAILABLE };

  const items = [
    { type: 'training', title: training.title, items: training.items, meta: training.meta },
    { type: 'coach', title: tip.title, text: tip.text },
    { type: 'race', title: race.title, text: race.text, url: race.url, link_text: race.link_text },
    { type: 'tool', title: tool.title, text: tool.text, url: tool.url, link_text: tool.link_text },
  ];
  return { blocks: { version: 1, items }, usedIds: [training.id, tip.id, race.id, tool.id] };
}

// --- edicion completa --------------------------------------------------------

const SITE = 'https://www.correrjuntos.com';

/** Campos del pick, listos para insertar. No toca BD ni red. */
export function buildEdition({ article, blocks, weekOf, articleMeta = {}, reserved = false }) {
  const subjects = Array.isArray(article.subjectTemplates) ? article.subjectTemplates : [];
  // En una semana reservada el asunto es el primero de la lista: lo ha elegido
  // una persona. En el resto rota por hash de la semana.
  const subject = subjects.length
    ? (reserved ? subjects[0] : rotate(subjects, weekOf))
    : (articleMeta.title || article.slug);
  const slugTag = article.slug.split('-').slice(0, 2).join('-');

  return {
    week_of: weekOf,
    status: 'draft',
    campaign_name: `Weekly · ${weekOf} · ${articleMeta.title || article.slug}`.slice(0, 90),
    subject,
    preheader: article.preheader || '',
    title: articleMeta.title || article.slug,
    excerpt: articleMeta.description || '',
    url: `${SITE}/blog/${article.slug}`,
    // og:image llega relativa desde el blog: en un correo hay que absolutizarla.
    image_url: absoluteUrl(articleMeta.image),
    cta_label: 'Leer el artículo completo',
    utm_campaign: `weekly-${weekOf}-${slugTag}`,
    blocks,
    selected_article: article.slug,
    category: article.category,
    auto_prepared: true,
  };
}
