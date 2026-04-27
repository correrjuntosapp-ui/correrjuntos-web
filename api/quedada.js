// API Route: Public quedada landing page with OG tags for social sharing.
// GET /api/quedada?id=<uuid>  (mapped from /quedada/:id via vercel.json rewrite)
//
// Why this exists:
// - app share envía https://correrjuntos.com/quedada/[id]
// - Si receptor tiene la app → Universal Link la abre directamente (AASA)
// - Si NO la tiene → cae aquí: HTML público con OG tags para que WhatsApp/
//   Twitter/Instagram generen preview rico, + CTA App Store/Google Play

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const APP_STORE_URL = 'https://apps.apple.com/app/id6758505910';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';
const SITE_URL = 'https://www.correrjuntos.com';

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DOWS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const formatDateLong = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha + 'T00:00:00');
  return `${DOWS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
};

const formatTime = (hora) => (hora || '').substring(0, 5);

const getDaysUntil = (fecha) => {
  if (!fecha) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(fecha + 'T00:00:00'); target.setHours(0,0,0,0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return 'Pasado';
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return `Quedan ${diff} días`;
};

const sendNotFound = (res, ogTitle = 'Quedada no encontrada') => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(404).send(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8">
<title>${escapeHtml(ogTitle)} · CorrerJuntos</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="Esta quedada ya no está disponible. Descubre más en CorrerJuntos.">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:image" content="${SITE_URL}/icons/icon-512.png">
<meta name="twitter:card" content="summary_large_image">
<style>body{margin:0;background:#0b1220;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center}h1{font-size:22px;margin-bottom:12px}p{color:#94a3b8;margin-bottom:24px}a{display:inline-block;background:#f97316;color:#fff;padding:14px 28px;border-radius:12px;font-weight:700;text-decoration:none}</style>
</head><body>
<div>
  <h1>${escapeHtml(ogTitle)}</h1>
  <p>Esta quedada ya no está disponible o el enlace no es válido.</p>
  <a href="${SITE_URL}">Volver a CorrerJuntos</a>
</div>
</body></html>`);
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

  const { id } = req.query;
  if (!id || typeof id !== 'string') return sendNotFound(res, 'Enlace no válido');

  // UUID v4 sanity check
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return sendNotFound(res, 'Enlace no válido');
  }

  if (!SUPABASE_SERVICE_KEY) {
    return sendNotFound(res, 'Configuración faltante');
  }

  let quedada = null;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase
      .from('quedadas')
      .select('id, titulo, ciudad, fecha, hora, distancia_km, distancia, ritmo, nivel, ubicacion, direccion, descripcion, max_participantes, lat, lng, creador_id')
      .eq('id', id)
      .single();
    if (error || !data) return sendNotFound(res);
    quedada = data;
  } catch (e) {
    return sendNotFound(res);
  }

  // Build response
  const titulo = quedada.titulo || 'Quedada de running';
  const ciudad = quedada.ciudad || '';
  const fechaLarga = formatDateLong(quedada.fecha);
  const hora = formatTime(quedada.hora);
  // Las columnas reales: distancia_km (numeric) o distancia (texto legacy).
  // El punto de encuentro vive en `ubicacion` o `direccion` según versión.
  const distanciaKm = quedada.distancia_km
    ? `${quedada.distancia_km} km`
    : (quedada.distancia || '');
  const puntoEncuentro = quedada.ubicacion || quedada.direccion || '';
  const ritmo = quedada.ritmo ? `${quedada.ritmo} min/km` : '';
  const nivel = (quedada.nivel || '').toLowerCase();
  const nivelLabel = nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1) : '';
  const countdown = getDaysUntil(quedada.fecha);
  const isPast = countdown === 'Pasado';

  const ogTitle = `${titulo}${ciudad ? ' · ' + ciudad : ''}`;
  const ogDescParts = [];
  if (fechaLarga) ogDescParts.push(`${fechaLarga}${hora ? ' · ' + hora : ''}`);
  if (distanciaKm) ogDescParts.push(distanciaKm);
  if (ritmo) ogDescParts.push(`Ritmo ${ritmo}`);
  if (nivelLabel) ogDescParts.push(`Nivel ${nivelLabel.toLowerCase()}`);
  const ogDesc = ogDescParts.length ? ogDescParts.join(' · ') : 'Únete en CorrerJuntos';

  const canonical = `${SITE_URL}/quedada/${id}`;
  const ogImage = `${SITE_URL}/icons/icon-512.png`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(ogTitle)} · CorrerJuntos</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(ogDesc)}">
<link rel="canonical" href="${canonical}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${escapeHtml(ogDesc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:site_name" content="CorrerJuntos">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(ogTitle)}">
<meta name="twitter:description" content="${escapeHtml(ogDesc)}">
<meta name="twitter:image" content="${ogImage}">

<!-- Apple smart banner para iOS detect app -->
<meta name="apple-itunes-app" content="app-id=6758505910, app-argument=${canonical}">

<!-- App stores schema -->
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: titulo,
  startDate: quedada.fecha + 'T' + (hora || '00:00') + ':00',
  location: {
    '@type': 'Place',
    name: ciudad || 'CorrerJuntos',
    address: puntoEncuentro || ciudad,
  },
  url: canonical,
  organizer: { '@type': 'Organization', name: 'CorrerJuntos', url: SITE_URL },
  sport: 'Running',
})}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">

<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
  body{
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'SF Pro',sans-serif;
    background:#0b1220;
    color:#fff;
    min-height:100vh;
    line-height:1.5;
  }
  .container{max-width:560px;margin:0 auto;padding:24px 20px}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:8px 0 24px}
  .brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:#fff}
  .brand-logo{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px}
  .brand-name{font-size:16px;font-weight:700;letter-spacing:-0.2px}

  .hero{
    background:linear-gradient(180deg,rgba(249,115,22,0.12) 0%,rgba(11,18,32,0) 100%);
    border:1px solid rgba(249,115,22,0.18);
    border-radius:24px;
    padding:28px 24px;
    margin-bottom:20px;
  }
  ${isPast ? `.hero{filter:saturate(0.4);opacity:0.7}` : ''}
  .countdown{
    display:inline-flex;align-items:center;gap:6px;
    background:rgba(249,115,22,0.16);
    color:#fb923c;
    padding:6px 12px;
    border-radius:14px;
    font-size:11px;
    font-weight:700;
    letter-spacing:0.6px;
    text-transform:uppercase;
    margin-bottom:12px;
  }
  .titulo{font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1.15;margin-bottom:8px}
  .meta-line{color:#94a3b8;font-size:14px;font-weight:500;margin-bottom:20px}
  .meta-line strong{color:#cbd5e1;font-weight:600}

  .info-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin-bottom:8px;
  }
  .info-cell{
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:12px;
    padding:14px;
  }
  .info-label{color:#64748b;font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;margin-bottom:4px}
  .info-value{color:#fff;font-size:16px;font-weight:700;letter-spacing:-0.2px}
  .info-cell.full{grid-column:1/-1}

  .nivel-tag{
    display:inline-block;
    padding:4px 10px;
    border-radius:8px;
    font-size:11px;
    font-weight:700;
    text-transform:capitalize;
    background:rgba(245,158,11,0.14);
    color:#fbbf24;
    border:1px solid rgba(245,158,11,0.3);
    margin-top:6px;
  }

  .descripcion{
    color:#cbd5e1;
    font-size:14px;
    margin-top:14px;
    padding-top:14px;
    border-top:1px solid rgba(255,255,255,0.06);
    line-height:1.55;
  }

  .cta-block{
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:20px;
    padding:24px 20px;
    text-align:center;
  }
  .cta-title{font-size:20px;font-weight:800;letter-spacing:-0.3px;margin-bottom:6px}
  .cta-sub{color:#94a3b8;font-size:14px;margin-bottom:18px}
  .open-app-btn{
    display:flex;align-items:center;justify-content:center;
    width:100%;height:54px;border-radius:14px;
    background:#f97316;color:#fff;
    font-size:16px;font-weight:700;
    text-decoration:none;
    margin-bottom:14px;
    box-shadow:0 6px 20px rgba(249,115,22,0.25);
  }
  .stores{display:flex;gap:10px}
  .store-btn{
    flex:1;
    display:flex;align-items:center;justify-content:center;gap:8px;
    height:54px;border-radius:12px;
    background:#0f172a;
    border:1px solid rgba(255,255,255,0.08);
    color:#fff;
    font-size:13px;font-weight:600;
    text-decoration:none;
  }
  .store-btn svg{width:22px;height:22px;flex-shrink:0}
  .store-btn small{display:block;font-size:9px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;line-height:1}
  .store-btn .store-name{font-size:13px;font-weight:700;line-height:1.1;margin-top:2px}

  .footer{margin-top:32px;text-align:center;color:#475569;font-size:12px}
  .footer a{color:#94a3b8;text-decoration:none}

  @media (min-width:560px){
    .titulo{font-size:32px}
  }
</style>
</head>
<body>
<div class="container">

  <nav class="nav">
    <a class="brand" href="${SITE_URL}">
      <div class="brand-logo">CJ</div>
      <span class="brand-name">CorrerJuntos</span>
    </a>
  </nav>

  <section class="hero">
    ${countdown && !isPast ? `<div class="countdown">⏱ ${escapeHtml(countdown)}</div>` : ''}
    ${isPast ? `<div class="countdown" style="background:rgba(148,163,184,0.18);color:#94a3b8">Quedada pasada</div>` : ''}
    <h1 class="titulo">${escapeHtml(titulo)}</h1>
    ${ciudad ? `<div class="meta-line"><strong>${escapeHtml(ciudad)}</strong></div>` : ''}

    <div class="info-grid">
      ${fechaLarga ? `
      <div class="info-cell">
        <div class="info-label">Fecha</div>
        <div class="info-value">${escapeHtml(fechaLarga)}</div>
      </div>` : ''}
      ${hora ? `
      <div class="info-cell">
        <div class="info-label">Hora</div>
        <div class="info-value">${escapeHtml(hora)}</div>
      </div>` : ''}
      ${distanciaKm ? `
      <div class="info-cell">
        <div class="info-label">Distancia</div>
        <div class="info-value">${escapeHtml(distanciaKm)}</div>
      </div>` : ''}
      ${ritmo ? `
      <div class="info-cell">
        <div class="info-label">Ritmo</div>
        <div class="info-value">${escapeHtml(ritmo)}</div>
      </div>` : ''}
      ${puntoEncuentro ? `
      <div class="info-cell full">
        <div class="info-label">Punto de encuentro</div>
        <div class="info-value">${escapeHtml(puntoEncuentro)}</div>
      </div>` : ''}
    </div>

    ${nivelLabel ? `<span class="nivel-tag">${escapeHtml(nivelLabel)}</span>` : ''}

    ${quedada.descripcion ? `<p class="descripcion">${escapeHtml(quedada.descripcion)}</p>` : ''}
  </section>

  <section class="cta-block">
    <h2 class="cta-title">${isPast ? 'Quedada finalizada' : 'Únete a esta quedada'}</h2>
    <p class="cta-sub">${isPast ? 'Encuentra otras quedadas activas en la app' : 'Descarga la app y apúntate gratis'}</p>

    <a class="open-app-btn" href="correrjuntos://quedada/${id}" id="openAppBtn">Abrir en la app</a>

    <div class="stores">
      <a class="store-btn" href="${APP_STORE_URL}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
        <div><small>Descarga en</small><div class="store-name">App Store</div></div>
      </a>
      <a class="store-btn" href="${PLAY_STORE_URL}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5a1 1 0 0 1 1.55-.83l13.4 8.5a1 1 0 0 1 0 1.66l-13.4 8.5A1 1 0 0 1 3 20.5z"/></svg>
        <div><small>Disponible en</small><div class="store-name">Google Play</div></div>
      </a>
    </div>
  </section>

  <div class="footer">
    <a href="${SITE_URL}">correrjuntos.com</a> · La app para correr en grupo
  </div>
</div>

<script>
  // Si tiene la app instalada, el Universal Link la abrirá directamente.
  // Si no, este botón intenta el custom scheme y cae al store si nada responde.
  (function(){
    var btn = document.getElementById('openAppBtn');
    if (!btn) return;
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var ua = navigator.userAgent || '';
      var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      var isAndroid = /Android/.test(ua);
      var fallback = isAndroid ? '${PLAY_STORE_URL}' : '${APP_STORE_URL}';
      var t = setTimeout(function(){ window.location.href = fallback; }, 1500);
      window.location.href = 'correrjuntos://quedada/${id}';
      // Si el usuario vuelve a la página (la app no se abrió), evitamos redirect
      window.addEventListener('pagehide', function(){ clearTimeout(t); });
      window.addEventListener('blur', function(){ clearTimeout(t); });
    });
  })();
</script>
</body>
</html>`);
}
