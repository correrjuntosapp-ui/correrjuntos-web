/**
 * IndexNow API — Notifies Bing, Yandex, Seznam & Naver of new/updated URLs.
 *
 * Usage:
 *   GET  /api/indexnow              → submits all URLs in the hardcoded batch
 *   POST /api/indexnow  { urls: [] } → submits custom URL list
 *
 * Protected by a simple bearer token (env: INDEXNOW_SECRET).
 * IndexNow key file lives at /c4f7e2a9b3d1.txt
 */

const INDEXNOW_KEY = 'c4f7e2a9b3d1';
const HOST = 'www.correrjuntos.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

/* ── Default batch: 40 new long-tail articles (2026-03-02) ── */
const DEFAULT_URLS = [
  // ES articles
  '/blog/flato-dolor-costado-al-correr',
  '/blog/puedo-correr-todos-los-dias',
  '/blog/empezar-a-correr-despues-de-los-40',
  '/blog/correr-en-verano-calor',
  '/blog/ritmo-para-principiantes-running',
  '/blog/diferencia-zapatillas-running-normales',
  '/blog/correr-en-cinta-vs-calle',
  '/blog/agujetas-despues-de-correr',
  '/blog/correr-por-la-noche-consejos',
  '/blog/correr-y-gimnasio-mismo-dia',
  '/blog/correr-con-musica-beneficios',
  '/blog/cuanto-tardo-en-correr-5km',
  '/blog/correr-antes-o-despues-de-comer',
  '/blog/empezar-a-correr-despues-de-los-50',
  '/blog/como-aumentar-resistencia-corriendo',
  '/blog/correr-con-perro-canicross',
  '/blog/correr-embarazada-seguro',
  '/blog/volver-a-correr-despues-de-lesion',
  '/blog/mejores-superficies-para-correr',
  '/blog/ropa-correr-segun-temperatura',
  // EN articles
  '/blog/en/side-stitch-while-running',
  '/blog/en/is-it-ok-to-run-every-day',
  '/blog/en/start-running-after-40',
  '/blog/en/running-in-summer-heat',
  '/blog/en/running-pace-for-beginners',
  '/blog/en/running-shoes-vs-regular-shoes',
  '/blog/en/treadmill-vs-outdoor-running',
  '/blog/en/sore-muscles-after-running',
  '/blog/en/running-at-night-safety-tips',
  '/blog/en/running-and-gym-same-day',
  '/blog/en/running-with-music-benefits',
  '/blog/en/average-5k-time-by-age',
  '/blog/en/running-before-or-after-eating',
  '/blog/en/start-running-after-50',
  '/blog/en/how-to-build-running-endurance',
  '/blog/en/running-with-your-dog-canicross',
  '/blog/en/running-while-pregnant-guide',
  '/blog/en/return-to-running-after-injury',
  '/blog/en/best-surfaces-for-running',
  '/blog/en/what-to-wear-running-by-temperature',
  // Also ping sitemap + blog indexes
  '/sitemap.xml',
  '/blog/',
  '/blog/en/',
];

export default async function handler(req, res) {
  /* Auth check */
  const secret = process.env.INDEXNOW_SECRET;
  if (secret) {
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  /* Build URL list */
  let urls;
  if (req.method === 'POST' && req.body && req.body.urls) {
    urls = req.body.urls.map(u => u.startsWith('http') ? u : `https://${HOST}${u}`);
  } else {
    urls = DEFAULT_URLS.map(u => `https://${HOST}${u}`);
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  /* Submit to IndexNow (Bing endpoint — shares with Yandex, Seznam, Naver) */
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    let body = '';
    try { body = await response.text(); } catch (_) {}

    return res.status(200).json({
      success: status >= 200 && status < 300,
      indexnow_status: status,
      indexnow_response: body || 'OK',
      urls_submitted: urls.length,
      urls_sample: urls.slice(0, 5),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
