#!/usr/bin/env node
// ============================================================
// scrape-clubrunning.cjs (v1.3.18 31 may 2026)
// Scraper REUSABLE por comunidad para clubrunning.es
//
// Uso:
//   node tmp/scrape-clubrunning.cjs Extremadura
//   node tmp/scrape-clubrunning.cjs Cataluña
//   ...
//
// Output:
//   tmp/scraped-{comunidad-slug}.json  (raw scrape + enriched)
//   tmp/carteles-{comunidad-slug}/*.jpg  (carteles descargados)
//
// Pipeline:
//   1. Fetch listado comunidad → URLs únicas /carrera/.../NNNN
//   2. Para cada URL: fetch detail → parse meta description + og:image
//   3. Filtrar provincia ∈ provincias de esta comunidad
//   4. Geocode ciudad → lat/lng (Nominatim, rate 1 req/s)
//   5. Download cartel original → tmp/carteles-{X}/*.jpg
//   6. Enrich: plan_recomendado, tipo, slug
//   7. Output JSON listo para merge en carreras-2026.json
// ============================================================

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const COMUNIDAD = process.argv[2];
if (!COMUNIDAD) {
  console.error('Uso: node scrape-clubrunning.cjs <Comunidad>');
  console.error('Ej:  node scrape-clubrunning.cjs Extremadura');
  process.exit(1);
}

// Mapping comunidad → provincias (para filtrar carreras relacionadas que no pertenecen)
const COMUNIDAD_PROVINCIAS = {
  'Andalucía':        ['Almería','Cádiz','Córdoba','Granada','Huelva','Jaén','Málaga','Sevilla'],
  'Aragón':           ['Huesca','Teruel','Zaragoza'],
  'Asturias':         ['Asturias'],
  'Baleares':         ['Islas Baleares','Baleares'],
  'Canarias':         ['Las Palmas','Santa Cruz de Tenerife'],
  'Cantabria':        ['Cantabria'],
  'Castilla-La Mancha':['Albacete','Ciudad Real','Cuenca','Guadalajara','Toledo'],
  'Castilla y León':  ['Ávila','Burgos','León','Palencia','Salamanca','Segovia','Soria','Valladolid','Zamora'],
  'Cataluña':         ['Barcelona','Girona','Lleida','Tarragona'],
  'Extremadura':      ['Badajoz','Cáceres'],
  'Galicia':          ['A Coruña','Lugo','Ourense','Pontevedra'],
  'Madrid':           ['Madrid'],
  'Murcia':           ['Murcia'],
  'Navarra':          ['Navarra'],
  'País Vasco':       ['Álava','Guipúzcoa','Vizcaya'],
  'La Rioja':         ['La Rioja'],
  'Valencia':         ['Alicante','Castellón','Valencia'],
};

const PROVINCIAS = COMUNIDAD_PROVINCIAS[COMUNIDAD];
if (!PROVINCIAS) {
  console.error('Comunidad desconocida:', COMUNIDAD);
  console.error('Válidas:', Object.keys(COMUNIDAD_PROVINCIAS).join(', '));
  process.exit(1);
}

const SLUG_COMUNIDAD = COMUNIDAD.toLowerCase().replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').replace(/\s+/g,'-');
const TMPDIR = path.join(__dirname, `extremadura-data`);
const CARTELES_DIR = path.join(__dirname, `carteles-${SLUG_COMUNIDAD}`);
if (!fs.existsSync(TMPDIR)) fs.mkdirSync(TMPDIR, { recursive: true });
if (!fs.existsSync(CARTELES_DIR)) fs.mkdirSync(CARTELES_DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
};

// ── HTTP helper que soporta gzip/br/deflate ──
function fetchHtml(url, referer = '') {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = { ...HEADERS };
    if (referer) headers['Referer'] = referer;
    https.get({
      hostname: u.hostname, path: u.pathname + u.search, headers,
    }, (res) => {
      // Redirects manuales
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location, url).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`${res.statusCode} ${url}`));
      const chunks = [];
      let stream = res;
      const enc = res.headers['content-encoding'];
      if (enc === 'gzip') stream = res.pipe(require('zlib').createGunzip());
      else if (enc === 'br') stream = res.pipe(require('zlib').createBrotliDecompress());
      else if (enc === 'deflate') stream = res.pipe(require('zlib').createInflate());
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', reject);
    }).on('error', reject);
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({
      hostname: u.hostname, path: u.pathname + u.search, headers: HEADERS,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBinary(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`${res.statusCode} ${url}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ── Parsers ──
function extractMeta(html, prop) {
  const re = new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]+)"`, 'i');
  const re2 = new RegExp(`<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="${prop}"`, 'i');
  return (html.match(re) || html.match(re2) || [])[1] || null;
}

// Spanish month names
const MONTHS = { enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,octubre:10,noviembre:11,diciembre:12 };

function parseSpanishDate(text) {
  // "Domingo, 14 de febrero de 2027" → "2027-02-14"
  const m = text.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = MONTHS[m[2].toLowerCase()];
  const year = parseInt(m[3], 10);
  if (!month) return null;
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function parseMetaDescription(desc) {
  // "Nombre se celebra el Día, DD de mes de YYYY en Ciudad, Provincia. Tipo de XX km. ..."
  if (!desc) return null;
  const fecha = parseSpanishDate(desc);
  const m = desc.match(/en\s+([^,]+),\s+([^\.]+?)\.\s+([\wáéíóúÁÉÍÓÚ\s]+?)\s+de\s+([\d.,]+)\s*km/i);
  if (!m) return { fecha, ciudad: null, provincia: null, tipo: null, km: null };
  return {
    fecha,
    ciudad: m[1].trim(),
    provincia: m[2].trim(),
    tipo: m[3].trim(),
    km: parseFloat(m[4].replace(',','.')),
  };
}

// Distance label → plan slug + distancia_principal
function inferPlan(tipo, km) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('trail')) return { plan: 'prep-trail', distancia: 'Trail' };
  if (t.includes('maratón') || t.includes('maraton')) {
    if (km >= 30) return { plan: 'prep-42k', distancia: 'Maratón' };
    return { plan: 'prep-21k', distancia: 'Media Maratón' };
  }
  if (t.includes('media')) return { plan: 'prep-21k', distancia: 'Media Maratón' };
  if (km >= 35) return { plan: 'prep-42k', distancia: 'Maratón' };
  if (km >= 18 && km <= 25) return { plan: 'prep-21k', distancia: 'Media Maratón' };
  if (km >= 8 && km <= 13) return { plan: 'prep-10k', distancia: '10K' };
  if (km >= 4 && km <= 7) return { plan: 'prep-5k', distancia: '5K' };
  return { plan: 'prep-10k', distancia: km ? `${km}K` : '10K' };
}

function slugify(s) {
  return (s || '').toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// ── Geocode Nominatim (rate-limited 1 req/s) ──
async function geocode(ciudad, provincia) {
  const query = encodeURIComponent(`${ciudad}, ${provincia}, España`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=es`;
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${query}&format=json&limit=1&countrycodes=es`,
      headers: { 'User-Agent': 'CorrerJuntos race scraper (correrjuntosapp@gmail.com)' },
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (Array.isArray(json) && json[0]) {
            resolve({ lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) });
          } else resolve({ lat: null, lng: null });
        } catch (e) { resolve({ lat: null, lng: null }); }
      });
    }).on('error', () => resolve({ lat: null, lng: null }));
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Main ──
(async () => {
  const listingUrl = `https://www.clubrunning.es/calendario/comunidad/${encodeURIComponent(COMUNIDAD)}?comunidad=${encodeURIComponent(COMUNIDAD)}`;
  console.log(`📡 Listing: ${listingUrl}`);
  const listingHtml = await fetchHtml(listingUrl);
  console.log(`  size: ${listingHtml.length} bytes`);

  // Extract unique race URLs
  const urls = [...new Set(
    [...listingHtml.matchAll(/href="([^"]*\/carrera\/[a-z0-9\-]+\/[0-9]+)"/g)]
      .map(m => m[1].startsWith('http') ? m[1] : 'https://www.clubrunning.es' + m[1])
  )];
  console.log(`  ${urls.length} URLs únicas de carreras`);

  const races = [];
  let i = 0;
  for (const url of urls) {
    i++;
    process.stdout.write(`\r[${i}/${urls.length}] ${url.split('/').slice(-2,-1)[0].slice(0,50)}`);
    try {
      const html = await fetchHtml(url, listingUrl);
      const desc = extractMeta(html, 'description');
      const ogImage = extractMeta(html, 'og:image');
      const ogTitle = extractMeta(html, 'og:title');
      const parsed = parseMetaDescription(desc);
      if (!parsed || !parsed.provincia) continue;
      // Filtrar por provincia (descartar carreras relacionadas de otras CCAA)
      const provNorm = parsed.provincia.trim();
      if (!PROVINCIAS.some(p => provNorm.toLowerCase() === p.toLowerCase())) {
        // No es de esta comunidad, skip
        continue;
      }
      const planInfo = inferPlan(parsed.tipo, parsed.km);
      const slugCarrera = url.match(/\/carrera\/([a-z0-9\-]+)/)[1];
      const idNum = url.match(/\/(\d+)$/)[1];
      // nombre limpio del og:title (sin la fecha sufijo)
      const nombre = ((ogTitle || '').split(' · ')[0]).trim() || slugCarrera;

      races.push({
        id: `${slugCarrera}-${SLUG_COMUNIDAD}-${idNum}`,
        nombre,
        fecha: parsed.fecha,
        hora: null,
        ciudad: parsed.ciudad,
        provincia: parsed.provincia,
        comunidad: COMUNIDAD,
        pais: 'España',
        lat: null,  // geocoded después
        lng: null,
        distancia_principal: planInfo.distancia,
        distancias_km: [parsed.km],
        plan_recomendado: planInfo.plan,
        imagen_url: ogImage || null,
        url_inscripcion: url,
        tipo: (parsed.tipo || '').toLowerCase().includes('trail') ? 'trail'
            : (parsed.tipo || '').toLowerCase().includes('maratón') && parsed.km >= 30 ? 'maraton'
            : (parsed.tipo || '').toLowerCase().includes('media') ? 'media'
            : 'popular',
        clubrunning_slug: slugCarrera,
      });
      await sleep(400); // throttle entre detail fetches
    } catch (e) {
      // skip
    }
  }
  console.log(`\n✅ ${races.length} carreras de ${COMUNIDAD} (filtradas por provincia)`);

  // Geocode únicas ciudades para reducir requests
  const cityKey = (r) => `${r.ciudad}|${r.provincia}`;
  const uniqueCities = [...new Set(races.map(cityKey))];
  console.log(`📍 Geocoding ${uniqueCities.length} ciudades únicas (Nominatim, 1 req/s)...`);
  const geocodeCache = {};
  for (const key of uniqueCities) {
    const [ciudad, provincia] = key.split('|');
    process.stdout.write(`\r  ${ciudad}, ${provincia}`);
    geocodeCache[key] = await geocode(ciudad, provincia);
    await sleep(1100); // Nominatim TOS: 1 req/s
  }
  for (const r of races) {
    const g = geocodeCache[cityKey(r)] || {};
    r.lat = g.lat;
    r.lng = g.lng;
  }
  console.log(`\n✅ Geocoded`);

  // Download carteles
  console.log(`🎨 Downloading carteles a ${CARTELES_DIR}...`);
  for (const r of races) {
    if (!r.imagen_url) continue;
    const out = path.join(CARTELES_DIR, `${r.id}.jpg`);
    try {
      const buf = await fetchBinary(r.imagen_url);
      fs.writeFileSync(out, buf);
      process.stdout.write(`\r  ${Math.round(buf.length/1024)}KB · ${r.id.slice(0,60)}`);
      // Cambia imagen_url al path self-hosted (la app final lo cargará así)
      r.imagen_url = `https://www.correrjuntos.com/public/carreras/auto/${r.id}.jpg`;
      await sleep(200);
    } catch (e) {
      console.warn(`\n⚠️  No se pudo bajar cartel: ${r.id}`);
    }
  }
  console.log(`\n✅ Carteles bajados`);

  // Save JSON output
  const outFile = path.join(__dirname, `scraped-${SLUG_COMUNIDAD}.json`);
  fs.writeFileSync(outFile, JSON.stringify(races, null, 2));
  console.log(`\n📦 Output: ${outFile}`);
  console.log(`   ${races.length} carreras · ${uniqueCities.length} ciudades · ${fs.readdirSync(CARTELES_DIR).length} carteles\n`);

  // Resumen por tipo
  const byTipo = {};
  races.forEach(r => { byTipo[r.distancia_principal] = (byTipo[r.distancia_principal]||0) + 1; });
  console.log('Por distancia:', byTipo);
})();
