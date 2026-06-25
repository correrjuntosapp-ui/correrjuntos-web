// Genera las 5 landings de planes (0-5k,5k,10k,maraton,trail) clonando el
// estilo de planes/media-maraton/index.html (ya validada) e inyectando el
// contenido real de cada plan. Honesto: 0-5k gratis, resto premium 14 días.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// CSS exacto reutilizado de la página de media maratón
const base = fs.readFileSync(path.join(ROOT, 'planes/media-maraton/index.html'), 'utf8');
const CSS = (base.match(/<style>[\s\S]*?<\/style>/) || ['<style></style>'])[0];

const APPLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>';
const GOOGLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464l.001 1z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg>';
const Q = String.fromCharCode(39);
const APP = 'https://apps.apple.com/app/correr-juntos/id6758505910';
const PLAY = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';

function appOnclick(slug, store) {
  return `onclick="if(typeof gtag===${Q}function${Q})gtag(${Q}event${Q},${Q}plan_app_click${Q},{store:${Q}${store}${Q},plan:${Q}${slug}${Q},page:location.pathname});${store === 'appstore' ? `if(/android/i.test(navigator.userAgent))this.href=${Q}${PLAY}${Q}` : ''}"`;
}
function appleBtn(slug, dark) {
  return `<a ${appOnclick(slug, 'appstore')} href="${APP}?ct=plan-${slug}" target="_blank" rel="noopener noreferrer" class="store-btn"${dark ? ' style="background:#15110d"' : ''}>
        ${APPLE_SVG}
        <span class="sb-text"><span class="sb-small">Descárgala en</span><span class="sb-big">App Store</span></span>
      </a>`;
}
function googleBtn(slug, dark) {
  return `<a ${appOnclick(slug, 'playstore')} href="${PLAY}&referrer=utm_source%3Dplanes%26utm_medium%3Dweb%26utm_campaign%3D${slug}" target="_blank" rel="noopener noreferrer" class="store-btn"${dark ? ' style="background:#15110d"' : ''}>
        ${GOOGLE_SVG}
        <span class="sb-text"><span class="sb-small">Disponible en</span><span class="sb-big">Google Play</span></span>
      </a>`;
}
function storeCta(slug, dark) { return `<div class="store-cta">\n      ${appleBtn(slug, dark)}\n      ${googleBtn(slug, dark)}\n    </div>`; }

// SVG iconos features
const IC = {
  coach: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  ana: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  gps: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  group: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
};
function defaultFeatures() {
  return [
    { ic: IC.coach, h: 'Coach José adaptativo', p: 'Ajusta el plan cada semana a tu progreso real, no una tabla fija que se queda corta o larga.' },
    { ic: IC.ana, h: 'Ana, nutrición IA', p: 'Qué comer antes y durante, cómo hidratarte y llegar a la carrera con energía.' },
    { ic: IC.gps, h: 'GPS y métricas', p: 'Controla splits, ritmo y distancia en cada sesión de calidad y en la tirada larga.' },
    { ic: IC.group, h: 'Quedadas y comunidad', p: 'Encuentra runners de tu zona y tu ritmo para entrenar acompañado.' }
  ];
}

function faqJsonLd(faq) {
  return faq.map(f => `        { "@type": "Question", "name": ${JSON.stringify(f.q)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(f.a)} } }`).join(',\n');
}
function howToJsonLd(fases) {
  return fases.map((f, i) => `        { "@type": "HowToStep", "position": ${i + 1}, "name": ${JSON.stringify(f.fase)}, "text": ${JSON.stringify(f.cont)} }`).join(',\n');
}

function page(c) {
  const u = `https://www.correrjuntos.com/planes/${c.slug}`;
  const heroUrl = `https://www.correrjuntos.com/public/planes/${c.slug}-hero.jpg`;
  const enMap = { '0-5k': '0-5k', '5k': '5k', '10k': '10k', 'maraton': 'marathon', 'trail': 'trail', 'media-maraton': 'half-marathon' };
  const enUrl = `https://www.correrjuntos.com/planes/en/${enMap[c.slug] || c.slug}`;
  const offer = c.free
    ? `"isAccessibleForFree": true`
    : `"isAccessibleForFree": false`;
  const courseOffer = c.free
    ? `,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "description": "Gratis dentro de la app CorrerJuntos." }`
    : `,
      "offers": { "@type": "Offer", "price": "4.99", "priceCurrency": "EUR", "category": "subscription", "availability": "https://schema.org/InStock", "description": "Incluido en CorrerJuntos Premium. Prueba 14 días gratis." }`;
  const fasesRows = c.fases.map(f => `        <tr><td>${f.fase}</td><td>${f.sem}</td><td>${f.cont}</td></tr>`).join('\n');
  const weekRows = c.week.map(w => `      <div class="week-day"><span class="day">${w.d}</span><span class="activity">${w.a}</span></div>`).join('\n');
  const feats = (c.features || defaultFeatures()).map(f => `      <div class="feature-card"><span class="ic">${f.ic}</span><div><h4>${f.h}</h4><p>${f.p}</p></div></div>`).join('\n');
  const faqHtml = c.faq.map(f => `    <details class="faq-item"><summary>${f.q}</summary><div class="faq-answer">${f.a}</div></details>`).join('\n');
  const pills = c.related.map(r => `      <a href="${r.href}">${r.label}</a>`).join('\n');
  const pqList = c.paraQuien.map(li => `      <li>${li}</li>`).join('\n');

  return `<!DOCTYPE html>
<html lang="es-ES">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">
<meta name="apple-itunes-app" content="app-id=6758505910, app-argument=${u}">
<title>${c.title}</title>
<meta name="description" content="${c.metaDesc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${u}">
<link rel="alternate" hreflang="es" href="${u}">
<link rel="alternate" hreflang="en" href="${enUrl}">
<link rel="alternate" hreflang="x-default" href="${u}">
<meta property="og:title" content="${c.ogTitle}">
<meta property="og:description" content="${c.ogDesc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${u}">
<meta property="og:image" content="${heroUrl}">
<meta property="og:image:width" content="1600">
<meta property="og:image:height" content="900">
<meta property="og:locale" content="es_ES">
<meta property="al:ios:app_store_id" content="6758505910">
<meta property="al:ios:app_name" content="Correr Juntos">
<meta property="al:android:package" content="com.correrjuntos.app">
<meta property="al:android:app_name" content="Correr Juntos">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@CorrerJuntos">
<meta name="twitter:title" content="${c.ogTitle}">
<meta name="twitter:description" content="${c.ogDesc}">
<meta name="twitter:image" content="${heroUrl}">
<script>(function(){var t=localStorage.getItem('blog_theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')})()</script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
function loadGA4(){if(document.getElementById('ga4-script'))return;var s=document.createElement('script');s.id='ga4-script';s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-Z21L8G8FJC';document.head.appendChild(s);gtag('js',new Date());gtag('config','G-Z21L8G8FJC');}
if(localStorage.getItem('cj_cookie_consent')==='accepted'){loadGA4();}
function loadMetaPixel(){if(window.fbqLoaded)return;window.fbqLoaded=true;!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1466415711868158');fbq('track','PageView');}
if(localStorage.getItem('cj_cookie_consent')==='accepted'){loadMetaPixel();}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://www.correrjuntos.com/#organization", "name": "CorrerJuntos", "url": "https://www.correrjuntos.com/", "logo": { "@type": "ImageObject", "url": "https://www.correrjuntos.com/icons/icon-512.png" } },
    { "@type": "WebSite", "@id": "https://www.correrjuntos.com/#website", "url": "https://www.correrjuntos.com/", "name": "CorrerJuntos", "publisher": { "@id": "https://www.correrjuntos.com/#organization" }, "inLanguage": "es" },
    {
      "@type": "WebPage",
      "@id": "${u}#webpage",
      "url": "${u}",
      "name": ${JSON.stringify(c.title)},
      "description": ${JSON.stringify(c.metaDesc)},
      "isPartOf": { "@id": "https://www.correrjuntos.com/#website" },
      "inLanguage": "es-ES",
      "primaryImageOfPage": { "@type": "ImageObject", "url": "${heroUrl}" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.correrjuntos.com/" },
        { "@type": "ListItem", "position": 2, "name": "Planes", "item": "https://www.correrjuntos.com/planes/" },
        { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(c.breadcrumb)}, "item": "${u}" }
      ]
    },
    {
      "@type": "HowTo",
      "name": ${JSON.stringify(c.howToName)},
      "description": ${JSON.stringify(c.howToDesc)},
      "step": [
${howToJsonLd(c.fases)}
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
${faqJsonLd(c.faq)}
      ]
    },
    {
      "@type": "Course",
      "@id": "${u}#course",
      "name": ${JSON.stringify(c.courseName)},
      "description": ${JSON.stringify(c.courseDesc)},
      "provider": { "@type": "Organization", "name": "CorrerJuntos", "@id": "https://www.correrjuntos.com/#organization" },
      "url": "${u}",
      "educationalLevel": "${c.level}",
      "inLanguage": "es-ES",
      ${offer},
      "hasCourseInstance": { "@type": "CourseInstance", "courseMode": "Online", "instructor": { "@type": "Person", "name": "Coach José IA", "description": "Entrenador IA de running de CorrerJuntos" } }${courseOffer}
    }
  ]
}
</script>
${CSS}
</head>
<body>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1466415711868158&ev=PageView&noscript=1"/></noscript>

<header class="site-header" style="position:sticky;top:0;z-index:100;background:rgba(254,247,237,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.06)">
<nav style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px">
  <a href="/" style="text-decoration:none;font-weight:900;font-size:1.1rem;letter-spacing:-.02em"><span style="color:#3d3229">CORRER</span><span style="color:#f97316">JUNTOS</span></a>
  <div style="display:flex;gap:24px;align-items:center;font-size:.9rem;font-weight:600">
    <a href="/planes" style="color:#f97316;text-decoration:none">Planes</a>
    <a href="/blog" style="color:#3d3229;text-decoration:none">Blog</a>
    <a href="/carreras" style="color:#3d3229;text-decoration:none">Carreras</a>
    <a href="/#pricing" style="color:#3d3229;text-decoration:none">Precios</a>
    <a ${appOnclick(c.slug, 'appstore')} href="${APP}?ct=plan-${c.slug}" target="_blank" rel="noopener noreferrer" style="background:#f97316;color:#fff;padding:8px 20px;border-radius:100px;font-weight:700;font-size:.85rem;text-decoration:none">Descargar App</a>
  </div>
</nav>
</header>

<div class="container"><div class="breadcrumb"><a href="/">Inicio</a><span>/</span><a href="/planes">Planes</a><span>/</span>${c.breadcrumb}</div></div>

<header class="hero">
  <div class="hero-bg"><img src="/public/planes/${c.slug}-hero.jpg" alt="${c.heroAlt}" loading="eager" fetchpriority="high" width="1600" height="900"></div>
  <div class="hero-content">
    <span class="hero-eyebrow">${c.heroEyebrow}</span>
    <h1>${c.h1}</h1>
    <p class="subtitle">${c.subtitle}</p>
    <div class="hero-badges">
${c.heroBadges.map(b => `      <span class="hero-badge">${b}</span>`).join('\n')}
    </div>
    ${storeCta(c.slug, false)}
    <p class="hero-note">${c.heroNote}</p>
  </div>
</header>

<main class="container content">

  <div class="info-grid">
${c.info.map(i => `    <div class="info-card"><div class="info-num">${i.num}</div><div class="info-lab">${i.lab}</div></div>`).join('\n')}
  </div>

  <section class="section">
    <h2>Para quién es este plan</h2>
    <ul>
${pqList}
    </ul>
    <p style="font-size:.9rem;color:#8b7355">${c.paraQuienNote}</p>
  </section>

  <section class="section">
    <h2>Qué incluye el plan</h2>
    <p>${c.incluyeIntro}</p>
    <table class="phase-table">
      <thead><tr><th>Fase</th><th>Semanas</th><th>Contenido</th></tr></thead>
      <tbody>
${fasesRows}
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2>${c.weekHeading}</h2>
    <div class="week-example">
${weekRows}
    </div>
  </section>

  <div class="plan-cta-card">
    <div class="plan-phone"><img src="/public/screenshot-feed.png" alt="Plan de entrenamiento en la app CorrerJuntos: próxima sesión y semana de preparación" loading="lazy" width="1290" height="2796"></div>
    <div class="plan-cta-body">
      <h3>${c.planCardH3}</h3>
      <p>${c.planCardP}</p>
      <a ${appOnclick(c.slug, 'appstore')} href="${APP}?ct=plan-${c.slug}" target="_blank" rel="noopener noreferrer" class="cta-btn">${c.planCardCta} →</a>
    </div>
  </div>

  <section class="section">
    <h2>Por qué entrenar con CorrerJuntos</h2>
    <div class="features-grid">
${feats}
    </div>
  </section>

  <div class="app-cta-box">
    <img class="app-cta-icon" src="/icons/icon-512.png" alt="CorrerJuntos" width="62" height="62" loading="lazy">
    <div class="app-cta-eyebrow">CorrerJuntos · App gratis</div>
    <h2>${c.appBoxH2}</h2>
    <p>${c.appBoxP}</p>
    <div class="app-coaches">
      <div class="app-coach"><img src="/public/coach-jose.jpg" alt="Coach José, entrenador IA de CorrerJuntos" loading="lazy" width="50" height="50"><div><span class="ac-name">Coach José</span><span class="ac-role">Tu entrenador IA</span></div></div>
      <div class="app-coach ana"><img src="/public/coach-ana.jpg" alt="Ana, nutricionista IA de CorrerJuntos" loading="lazy" width="50" height="50"><div><span class="ac-name">Ana</span><span class="ac-role">Nutrición IA</span></div></div>
    </div>
    <div class="app-badges">
      ${appleBtn(c.slug, false)}
      ${googleBtn(c.slug, false)}
    </div>
  </div>

  <section class="section">
    <h2>Preguntas frecuentes</h2>
${faqHtml}
  </section>

  <div class="cta-box">
    <h2>${c.finalH2}</h2>
    <p>${c.finalP}</p>
    ${storeCta(c.slug, true)}
  </div>

  <section class="section" style="text-align:center">
    <h2 style="font-size:1.15rem">Otros planes de entrenamiento</h2>
    <div class="related-links">
${pills}
    </div>
  </section>

</main>

<div class="cookie-banner" id="cookie-banner"><div class="cookie-inner"><p>Usamos cookies propias y de análisis para mejorar tu experiencia. <a href="/legal/cookies">Más info</a></p><div class="cookie-btns"><button class="btn-reject" onclick="rejectCookies()">Rechazar</button><button class="btn-accept" onclick="acceptCookies()">Aceptar</button></div></div></div>
<script>
if(!localStorage.getItem('cj_cookie_consent')){document.getElementById('cookie-banner').style.display='block';}
function acceptCookies(){localStorage.setItem('cj_cookie_consent','accepted');document.getElementById('cookie-banner').style.display='none';loadGA4();loadMetaPixel();}
function rejectCookies(){localStorage.setItem('cj_cookie_consent','rejected');document.getElementById('cookie-banner').style.display='none';}
</script>

<footer class="footer">
<div class="footer-inner">
  <div>
    <a href="/" class="footer-brand">CorrerJuntos</a>
    <p class="footer-desc">Tu plan, tu coach IA, tu progreso. App gratis en iOS y Android.</p>
    <div class="footer-social">
      <a href="https://instagram.com/correrjuntosapp/" target="_blank" rel="noopener" aria-label="Instagram"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
      <a href="https://tiktok.com/@correrjuntosapp" target="_blank" rel="noopener" aria-label="TikTok"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg></a>
      <a href="https://es.pinterest.com/correrjuntos/" target="_blank" rel="noopener" aria-label="Pinterest"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg></a>
    </div>
  </div>
  <div><div class="footer-heading">Explora</div><a href="/cities" class="footer-link">Ciudades</a><a href="/places" class="footer-link">Lugares</a><a href="/events" class="footer-link">Eventos</a><a href="/planes" class="footer-link">Planes</a><a href="/carreras" class="footer-link">Carreras</a><a href="/blog" class="footer-link">Blog</a></div>
  <div><div class="footer-heading">Empresa</div><a href="/sobre-nosotros" class="footer-link">Sobre Nosotros</a><a href="/inversores" class="footer-link">Inversores</a><a href="mailto:abraham.marquez@correrjuntos.com" class="footer-link">Contacto</a></div>
  <div><div class="footer-heading">Legal</div><a href="/privacy" class="footer-link">Política de Privacidad</a><a href="/terms" class="footer-link">Términos de Uso</a><a href="/legal/cookies" class="footer-link">Política de Cookies</a></div>
</div>
<div class="footer-bottom"><p>&copy; 2026 CorrerJuntos. Todos los derechos reservados.</p></div>
</footer>

</body>
</html>`;
}

// ---- Configs por plan (datos reales extraídos de las páginas actuales + tabla CLAUDE.md) ----
const premiumNote = 'La app es gratis. Este plan forma parte de Premium — 14 días de prueba, luego 4,99€/mes o 29,99€/año.';
const premiumFaqFree = { q: '¿El plan es gratis?', a: 'La app es gratis e incluye GPS, comunidad, quedadas y el plan 0-5K sin coste. Este plan forma parte de CorrerJuntos Premium, que puedes probar 14 días gratis. Después, Premium cuesta 4,99€/mes o 29,99€/año, y cancelas cuando quieras.' };
const accesoFaq = (dist) => ({ q: '¿Dónde accedo al plan de entrenamiento?', a: `Dentro de la app CorrerJuntos. Descárgala gratis en App Store o Google Play, crea tu perfil, pon tu fecha de carrera y activa el plan de ${dist} en la sección Planes de Entrenamiento.` });

const plans = [
  {
    slug: '0-5k', free: true, breadcrumb: 'Plan 0 a 5K',
    title: 'Plan 0 a 5K Gratis — De Cero a tus Primeros 5K | CorrerJuntos',
    metaDesc: 'Plan gratuito para empezar a correr de cero y completar tus primeros 5K. Método caminar/correr, adaptativo de 4 a 12 semanas, sin experiencia previa. Gratis en la app CorrerJuntos.',
    ogTitle: 'Plan 0 a 5K Gratis — De Cero a tus Primeros 5K',
    ogDesc: 'Plan gratuito para empezar a correr de cero y completar tus primeros 5K. Método caminar/correr, adaptativo, sin experiencia previa.',
    heroAlt: 'Persona empezando a correr en un parque al atardecer',
    heroEyebrow: 'Plan 0 a 5K · Gratis',
    h1: 'Empieza de cero y cruza tu primer 5K',
    subtitle: 'De no haber corrido nunca a completar tus primeros 5K. Pones tu fecha y el plan se adapta de 4 a 12 semanas con el método caminar/correr. Sin experiencia previa.',
    heroBadges: ['4-12 semanas adaptativas', '24 sesiones', 'Coach José IA', '100% gratis'],
    heroNote: 'Gratis de verdad: sin suscripción y sin prueba que caduca. Descarga la app y empieza.',
    info: [{ num: '4-12', lab: 'Semanas adaptadas' }, { num: '24', lab: 'Sesiones' }, { num: '3', lab: 'Días / semana' }, { num: '5K', lab: 'Objetivo' }],
    paraQuien: [
      '<strong>No has corrido nunca</strong> o llevas mucho tiempo sin hacer ejercicio y quieres empezar.',
      '<strong>Quieres completar tus primeros 5K</strong> sin pararte a caminar.',
      '<strong>Puedes dedicar 3 días por semana:</strong> sesiones de 30-40 minutos con descanso entre ellas.',
      '<strong>Prefieres ir poco a poco:</strong> el método caminar/correr evita lesiones y hace el proceso llevadero.'
    ],
    paraQuienNote: '¿Ya corres 5K sin parar? Da el salto al <a href="/planes/5k">plan 5K</a> para bajar tu marca, o al <a href="/planes/10k">plan 10K</a>.',
    incluyeIntro: 'El plan es <strong>adaptativo</strong> y usa el método <strong>caminar/correr</strong>: alternas tramos de trote suave y caminata, y vas reduciendo la caminata semana a semana hasta correr los 5K de forma continua.',
    fases: [
      { fase: 'Arranque', sem: '1-2', cont: 'Caminar/correr: tramos de 1 min de trote suave y 2 min de caminata. 3 sesiones por semana.' },
      { fase: 'Progresión', sem: '3-5', cont: 'Aumentan los tramos de trote (2-3 min) y se reduce la caminata. Primeros 20-25 min en movimiento.' },
      { fase: 'Continuidad', sem: '6-8', cont: 'Trote continuo cada vez más largo, con caminatas cortas solo si las necesitas. Acercándote a los 5K.' },
      { fase: '5K', sem: '9-12', cont: 'Consolidas la carrera continua y completas tus primeros 5K. Última semana suave antes del objetivo.' }
    ],
    weekHeading: 'Una semana tipo (ejemplo, semana 3)',
    week: [
      { d: 'Lunes', a: 'Descanso' },
      { d: 'Martes', a: '5 min caminando + 6×(2 min trote / 1 min caminata)' },
      { d: 'Miércoles', a: 'Descanso o caminata suave' },
      { d: 'Jueves', a: '5 min caminando + 6×(2 min trote / 1 min caminata)' },
      { d: 'Viernes', a: 'Descanso' },
      { d: 'Sábado', a: 'Descanso o estiramientos' },
      { d: 'Domingo', a: '5 min caminando + 5×(3 min trote / 1 min caminata)' }
    ],
    planCardH3: 'Tu plan, sesión a sesión, en el bolsillo',
    planCardP: 'Cada día sabes exactamente qué toca: cuánto caminar, cuánto trotar y cuándo descansar. Coach José ajusta el ritmo a cómo vayas, sin agobios. Y es gratis.',
    planCardCta: 'Empezar gratis en la app',
    appBoxH2: 'Tu primer 5K empieza en la app',
    appBoxP: 'Descarga CorrerJuntos gratis, pon tu fecha objetivo y activa el plan 0 a 5K. Coach José te guía sesión a sesión y Ana te ayuda con la alimentación. Sin coste.',
    faq: [
      { q: '¿Puedo empezar a correr con sobrepeso?', a: 'Sí, este plan está diseñado para cualquier persona independientemente de su peso. Los intervalos de caminata y carrera permiten una adaptación progresiva. Te recomendamos unas zapatillas con buena amortiguación y consultar con tu médico antes de empezar.' },
      { q: '¿Cuántos días a la semana tengo que entrenar?', a: 'El plan requiere 3 sesiones por semana con días de descanso entre ellas. Esto permite que tu cuerpo se recupere y se adapte. Los días libres puedes caminar o hacer estiramientos suaves.' },
      { q: '¿Qué zapatillas necesito para empezar a correr?', a: 'Lo más importante es una zapatilla de running con buena amortiguación. No necesitas el modelo más caro: unas zapatillas neutras de gama media serán perfectas para empezar. Ve a una tienda especializada si puedes.' },
      { q: '¿Qué hago si no puedo correr ni 1 minuto seguido?', a: 'Sin problema. Empieza caminando rápido las primeras sesiones y añade tramos de trote suave de 30 segundos. El plan se adapta a tu nivel: la clave es la constancia, no la velocidad.' },
      { q: '¿El plan 0 a 5K es realmente gratis?', a: 'Sí, al 100%. El plan 0 a 5K está disponible gratis dentro de la app CorrerJuntos, sin suscripción ni prueba que caduque. Solo descarga la app, crea tu perfil y actívalo.' },
      accesoFaq('0 a 5K')
    ],
    finalH2: 'Empieza a correr hoy, gratis',
    finalP: 'Tu plan 0 a 5K te espera dentro de la app, adaptado a tu fecha y a tu nivel. Sin coste y sin experiencia previa.',
    related: [{ href: '/planes/5k', label: 'Plan 5K' }, { href: '/planes/10k', label: 'Plan 10K' }, { href: '/planes/media-maraton', label: 'Plan Media Maratón (21K)' }],
    howToName: 'Plan para empezar a correr de 0 a 5K (caminar/correr)',
    howToDesc: 'Plan progresivo de caminar/correr para pasar de no correr a completar 5K, adaptativo de 4 a 12 semanas.',
    courseName: 'Plan 0 a 5K (Gratis)', courseDesc: 'Plan gratuito de caminar/correr para completar tus primeros 5K, guiado por Coach José IA.', level: 'Beginner'
  },
  {
    slug: '5k', free: false, breadcrumb: 'Plan 5K',
    title: 'Plan 5K — Prepara o Mejora tu Marca en 5K | CorrerJuntos',
    metaDesc: 'Plan de 8 semanas para correr tu primer 5K cronometrado o bajar tu marca: series, tempo y ritmo objetivo, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    ogTitle: 'Plan 5K — Prepara o Mejora tu Marca en 5K',
    ogDesc: 'Plan de 8 semanas con series, tempo y ritmo objetivo, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    heroAlt: 'Dos personas corriendo en un parque al amanecer',
    heroEyebrow: 'Plan 5K',
    h1: 'Corre tu 5K más rápido que nunca',
    subtitle: 'Ya completas 5K y quieres cronometrarlos o bajar tu marca. 8 semanas de series, tempo y ritmo objetivo, ajustadas a tu nivel por Coach José.',
    heroBadges: ['8 semanas', '32 sesiones', 'Coach José IA', 'Prueba 14 días gratis'],
    heroNote: premiumNote,
    info: [{ num: '8', lab: 'Semanas' }, { num: '32', lab: 'Sesiones' }, { num: '3-4', lab: 'Días / semana' }, { num: '5K', lab: 'Objetivo' }],
    paraQuien: [
      '<strong>Ya corres 5K sin pararte:</strong> tienes una base mínima y quieres ir a más.',
      '<strong>Buscas tu primer 5K cronometrado</strong> o bajar tu marca actual.',
      '<strong>Puedes entrenar 3-4 días por semana,</strong> incluyendo alguna sesión de calidad (series).',
      '<strong>Quieres correr más rápido</strong> sin lesionarte, con un plan estructurado.'
    ],
    paraQuienNote: '¿Empiezas de cero? Mejor el <a href="/planes/0-5k">plan 0 a 5K (gratis)</a>. ¿Ya dominas el 5K? Da el salto al <a href="/planes/10k">plan 10K</a>.',
    incluyeIntro: 'El plan es <strong>adaptativo</strong>: pones tu fecha y Coach José reparte las fases para que llegues a tu test o carrera de 5K en tu mejor momento. Esta es la estructura (8 semanas):',
    fases: [
      { fase: 'Base aeróbica', sem: '1-2', cont: 'Rodajes suaves de 30-40 min a ritmo conversacional. Construir base y acumular kilómetros.' },
      { fase: 'Series cortas', sem: '3-4', cont: 'Series de 200-400 m a ritmo fuerte. Se mantiene un rodaje largo de 8-10 km el fin de semana.' },
      { fase: 'Ritmo 5K', sem: '5-6', cont: 'Bloques de 1 km a ritmo objetivo de carrera. Tempo de 20 min. Mayor intensidad específica.' },
      { fase: 'Carga', sem: '7', cont: 'Semana de mayor volumen e intensidad. Sesión clave: 5×1 km a ritmo 5K.' },
      { fase: 'Tapering', sem: '8', cont: 'Reducción de volumen un 40%. Piernas frescas para tu test o carrera de 5K.' }
    ],
    weekHeading: 'Una semana tipo (ejemplo, semana 5)',
    week: [
      { d: 'Lunes', a: 'Descanso' },
      { d: 'Martes', a: '35 min rodaje suave + 6 rectas de 100 m' },
      { d: 'Miércoles', a: 'Descanso o core / fuerza' },
      { d: 'Jueves', a: '8×400 m a ritmo fuerte (rec. 90 s trote)' },
      { d: 'Viernes', a: 'Descanso' },
      { d: 'Sábado', a: '30 min rodaje suave' },
      { d: 'Domingo', a: 'Tirada larga 9 km a ritmo cómodo' }
    ],
    planCardH3: 'Tu plan, sesión a sesión, en el bolsillo',
    planCardP: 'Cada día sabes qué toca: el calentamiento, las series con sus ritmos y el descanso. Coach José ajusta la carga según cómo vayas, y Ana te ayuda con la nutrición. Empieza con 14 días de prueba.',
    planCardCta: 'Empezar mi plan en la app',
    appBoxH2: 'Tu coach y tu nutricionista, dentro de la app',
    appBoxP: 'Descarga CorrerJuntos gratis, pon tu fecha de carrera y activa el plan 5K. Coach José y Ana te acompañan en cada sesión. Prueba Premium 14 días gratis.',
    faq: [
      { q: '¿Qué es un buen tiempo en 5K?', a: 'Para un corredor popular, bajar de 30 minutos es un gran objetivo, y bajar de 25 minutos (5:00 min/km) ya es un nivel intermedio sólido. Lo importante es comparar contra tu propia marca anterior: mejorar tu tiempo personal es el verdadero éxito.' },
      { q: '¿Cuántos días a la semana necesito entrenar?', a: 'Este plan se basa en 3-4 sesiones por semana: una o dos de calidad (series/tempo), un rodaje suave y la tirada larga. Los días de descanso son parte del plan: es cuando el cuerpo asimila el trabajo.' },
      { q: '¿Puedo hacer este plan sin experiencia previa?', a: 'Conviene tener una base mínima: poder correr 5K sin pararte. Si todavía no llegas, empieza con el plan 0 a 5K (gratis) y vuelve a por este cuando completes la distancia.' },
      { q: '¿Cómo calculo mi ritmo objetivo de 5K?', a: 'Una forma sencilla es hacer un test de 5K o de 3 km a tope y usar ese tiempo como referencia. Dentro de la app, Coach José ajusta los ritmos de tus series y tempos a partir de tus carreras reales.' },
      premiumFaqFree,
      accesoFaq('5K')
    ],
    finalH2: 'Pon tu fecha y empieza a entrenar',
    finalP: 'Tu plan 5K te espera dentro de la app, adaptado a tu calendario y a tu nivel. Pruébalo 14 días gratis.',
    related: [{ href: '/planes/0-5k', label: 'Plan 0 a 5K (gratis)' }, { href: '/planes/10k', label: 'Plan 10K' }, { href: '/planes/media-maraton', label: 'Plan Media Maratón (21K)' }],
    howToName: 'Plan de entrenamiento de 5K en 8 semanas', howToDesc: 'Plan de 8 semanas con base, series, ritmo objetivo y tapering para tu 5K.',
    courseName: 'Plan 5K (8 semanas)', courseDesc: 'Plan de 8 semanas con 32 sesiones para correr o mejorar tu 5K, guiado por Coach José IA.', level: 'Beginner'
  },
  {
    slug: '10k', free: false, breadcrumb: 'Plan 10K',
    title: 'Plan 10K — Prepara o Mejora tu Marca en 10K | CorrerJuntos',
    metaDesc: 'Plan de 12 semanas para tu primer 10K o bajar tu marca: base, series, tempo y ritmo objetivo, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    ogTitle: 'Plan 10K — Prepara o Mejora tu Marca en 10K',
    ogDesc: 'Plan de 12 semanas con base, series, tempo y ritmo objetivo, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    heroAlt: 'Corredora entrenando a buen ritmo por la calle',
    heroEyebrow: 'Plan 10K',
    h1: 'Conquista los 10K, a tu ritmo',
    subtitle: 'Tu primer 10K o una marca nueva. 12 semanas de base, series y ritmo específico que Coach José adapta a tu nivel y a tu fecha de carrera.',
    heroBadges: ['12 semanas', '48 sesiones', 'Coach José IA', 'Prueba 14 días gratis'],
    heroNote: premiumNote,
    info: [{ num: '12', lab: 'Semanas' }, { num: '48', lab: 'Sesiones' }, { num: '4', lab: 'Días / semana' }, { num: '10K', lab: 'Objetivo' }],
    paraQuien: [
      '<strong>Completas 5K cómodo</strong> y quieres dar el salto a los 10K.',
      '<strong>Corres unos 20-25 km por semana</strong> de forma regular.',
      '<strong>Puedes entrenar 4 días por semana,</strong> con sesiones de calidad y una tirada larga.',
      '<strong>Tu objetivo:</strong> terminar tu primer 10K o bajar tu marca actual en la distancia.'
    ],
    paraQuienNote: '¿Aún no corres 5K seguidos? Empieza con el <a href="/planes/0-5k">plan 0 a 5K (gratis)</a>. ¿Listo para más? Apunta a la <a href="/planes/media-maraton">media maratón</a>.',
    incluyeIntro: 'El plan es <strong>adaptativo</strong>: pones tu fecha y Coach José reparte las fases para que llegues al 10K en tu mejor momento. Esta es la estructura (12 semanas):',
    fases: [
      { fase: 'Base', sem: '1-3', cont: 'Rodajes de 40-50 min a ritmo suave. Construir base aeróbica sólida. Tirada larga de 12 km.' },
      { fase: 'Series / Tempo', sem: '4-6', cont: 'Series de 400-1000 m y tempo de 20-30 min. Mejora de VO2máx y umbral anaeróbico.' },
      { fase: 'Específico 10K', sem: '7-9', cont: 'Bloques a ritmo objetivo de 10K. Simulaciones parciales. Tirada larga 14-16 km.' },
      { fase: 'Choque', sem: '10-11', cont: 'Semanas de mayor carga. Supercompensación. Sesión clave: 3×3 km a ritmo 10K.' },
      { fase: 'Tapering', sem: '12', cont: 'Reducción del 40% del volumen. Activaciones cortas. Piernas frescas para la carrera.' }
    ],
    weekHeading: 'Una semana tipo (ejemplo, semana 8)',
    week: [
      { d: 'Lunes', a: 'Descanso' },
      { d: 'Martes', a: '45 min rodaje suave + 8 rectas de 100 m' },
      { d: 'Miércoles', a: 'Descanso o fuerza / core' },
      { d: 'Jueves', a: '5×1 km a ritmo 10K (rec. 2 min trote)' },
      { d: 'Viernes', a: 'Descanso' },
      { d: 'Sábado', a: '35 min rodaje suave' },
      { d: 'Domingo', a: 'Tirada larga 14 km progresivo (últimos 3 km a ritmo 10K)' }
    ],
    planCardH3: 'Tu plan, sesión a sesión, en el bolsillo',
    planCardP: 'Cada día sabes qué toca: el calentamiento, las series con sus ritmos, la tirada larga y el descanso. Coach José ajusta la carga según cómo vayas, y Ana te ayuda con la nutrición. Empieza con 14 días de prueba.',
    planCardCta: 'Empezar mi plan en la app',
    appBoxH2: 'Tu coach y tu nutricionista, dentro de la app',
    appBoxP: 'Descarga CorrerJuntos gratis, pon tu fecha de carrera y activa el plan 10K. Coach José y Ana te acompañan en cada sesión. Prueba Premium 14 días gratis.',
    faq: [
      { q: '¿Cuánto puedo mejorar mi marca en 10K?', a: 'Con un plan estructurado de 12 semanas, un corredor con algo de base puede mejorar varios minutos respecto a correr "por libre". Las mayores mejoras llegan al principiante; cuanto más entrenado estás, más cuesta cada segundo, pero el trabajo de series y umbral sigue dando resultados.' },
      { q: '¿Cuál es un buen ritmo para 10K?', a: 'Bajar de 1 hora (6:00 min/km) es un buen objetivo para empezar. Un nivel intermedio ronda los 50-55 min, y bajar de 45 min (4:30 min/km) ya es un nivel avanzado para corredor popular. Tu ritmo de 10K suele ser algo más lento que tu ritmo de 5K.' },
      { q: '¿Cuántos días a la semana entreno?', a: 'El plan se basa en 4 sesiones por semana: dos de calidad (series y tempo), un rodaje suave y la tirada larga. Los días de descanso forman parte del plan y son cuando se produce la mejora.' },
      { q: '¿Puedo combinar este plan con gimnasio?', a: 'Sí, y es recomendable. El trabajo de fuerza (1-2 sesiones por semana) ayuda a prevenir lesiones y mejora la economía de carrera. Colócalo en días de rodaje suave o de descanso, evitando justo antes de las sesiones de calidad.' },
      premiumFaqFree,
      accesoFaq('10K')
    ],
    finalH2: 'Pon tu fecha y empieza a entrenar',
    finalP: 'Tu plan 10K te espera dentro de la app, adaptado a tu calendario y a tu nivel. Pruébalo 14 días gratis.',
    related: [{ href: '/planes/5k', label: 'Plan 5K' }, { href: '/planes/media-maraton', label: 'Plan Media Maratón (21K)' }, { href: '/planes/0-5k', label: 'Plan 0 a 5K (gratis)' }],
    howToName: 'Plan de entrenamiento de 10K en 12 semanas', howToDesc: 'Plan de 12 semanas con base, series, específico y tapering para tu 10K.',
    courseName: 'Plan 10K (12 semanas)', courseDesc: 'Plan de 12 semanas con 48 sesiones para correr o mejorar tu 10K, guiado por Coach José IA.', level: 'Intermediate'
  },
  {
    slug: 'maraton', free: false, breadcrumb: 'Plan Maratón',
    title: 'Plan Maratón (42K) Adaptativo con Coach José IA | CorrerJuntos',
    metaDesc: 'Plan de maratón de 18 semanas: base profunda, volumen, tiradas de 30-35 km, nutrición y tapering, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    ogTitle: 'Plan Maratón (42K) Adaptativo con Coach José IA',
    ogDesc: 'Plan de maratón de 18 semanas con tiradas largas, nutrición y tapering, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    heroAlt: 'Pelotón de corredores de maratón en carrera por carretera',
    heroEyebrow: 'Plan Maratón · 42K',
    h1: 'Llega a los 42K entero, no a sobrevivir',
    subtitle: 'El maratón no se improvisa. 18 semanas de base profunda, volumen, tiradas largas y nutrición que Coach José adapta a tu nivel y a tu fecha de carrera.',
    heroBadges: ['18 semanas', '90 sesiones', 'Coach José IA', 'Prueba 14 días gratis'],
    heroNote: premiumNote,
    info: [{ num: '18', lab: 'Semanas' }, { num: '90', lab: 'Sesiones' }, { num: '5-6', lab: 'Días / semana' }, { num: '42K', lab: 'Objetivo' }],
    paraQuien: [
      '<strong>Has corrido una media maratón</strong> (o tienes una base sólida de fondo).',
      '<strong>Corres 40-50 km por semana</strong> de forma regular y sin molestias.',
      '<strong>Puedes entrenar 5-6 días por semana,</strong> incluyendo tiradas largas de fin de semana.',
      '<strong>Tu objetivo:</strong> terminar tu primer maratón o bajar tu marca en los 42K.'
    ],
    paraQuienNote: '¿Todavía no has hecho una media? Prepárala primero con el <a href="/planes/media-maraton">plan media maratón (21K)</a> y vuelve a por el maratón con base.',
    incluyeIntro: 'El plan es <strong>adaptativo</strong>: pones tu fecha y Coach José reparte las fases para que llegues a los 42K en tu mejor momento. Esta es la estructura (18 semanas):',
    fases: [
      { fase: 'Base profunda', sem: '1-4', cont: 'Rodajes de 50-70 min. Tirada larga hasta 22 km. Construir una base aeróbica sólida. 50-60 km/semana.' },
      { fase: 'Volumen', sem: '5-8', cont: 'Aumentar a 65-75 km/semana. Tirada larga hasta 28 km. Tempo de 30-40 min. Series largas.' },
      { fase: 'Específico maratón', sem: '9-12', cont: 'Bloques a ritmo maratón. Tiradas de 30-35 km. Práctica de nutrición e hidratación.' },
      { fase: 'Choque / Pico', sem: '13-15', cont: 'Pico de volumen: 75-85 km semanales. Últimas tiradas largas de 32-35 km. Máxima carga.' },
      { fase: 'Tapering', sem: '16-17', cont: 'Reducción progresiva: -20% semana 16, -40% semana 17. Rodajes suaves con activaciones.' },
      { fase: 'Carrera', sem: '18', cont: 'Semana de carrera: activación lunes/miércoles, descanso jueves-sábado, maratón domingo.' }
    ],
    weekHeading: 'Una semana tipo (ejemplo, semana 11)',
    week: [
      { d: 'Lunes', a: 'Descanso o rodaje regenerativo 30 min' },
      { d: 'Martes', a: '55 min rodaje medio + 8 rectas de 100 m' },
      { d: 'Miércoles', a: '3×4 km a ritmo maratón (rec. 2 min)' },
      { d: 'Jueves', a: '45 min rodaje suave + fuerza / core' },
      { d: 'Viernes', a: 'Descanso' },
      { d: 'Sábado', a: '40 min rodaje suave' },
      { d: 'Domingo', a: 'Tirada larga 32 km (12 km centrales a ritmo maratón)' }
    ],
    planCardH3: 'Tu plan, sesión a sesión, en el bolsillo',
    planCardP: 'Cada día sabes qué toca: rodajes, series, las tiradas largas con su nutrición y los descansos. Coach José ajusta la carga para que llegues entero, y Ana te prepara la estrategia de geles e hidratación. Empieza con 14 días de prueba.',
    planCardCta: 'Empezar mi plan en la app',
    appBoxH2: 'Tu coach y tu nutricionista, dentro de la app',
    appBoxP: 'Descarga CorrerJuntos gratis, pon tu fecha de maratón y activa el plan de 42K. Coach José y Ana te acompañan en cada sesión y en la estrategia de carrera. Prueba Premium 14 días gratis.',
    faq: [
      { q: '¿Cuánto tiempo necesito para preparar un maratón?', a: 'Lo recomendable son 16-18 semanas si ya tienes una base de fondo (haber corrido una media maratón). Si partes de menos, necesitarás una fase previa de construcción de base. El maratón requiere tiempo: no conviene acortarlo, es la distancia donde más pesa la preparación.' },
      { q: '¿Qué pasa si me lesiono durante la preparación?', a: 'Lo primero es no forzar: una molestia ignorada puede arruinar meses de trabajo. El plan es adaptativo y, dentro de la app, Coach José reajusta la carga si necesitas parar unos días. Ante un dolor que no cede, consulta con un fisioterapeuta.' },
      { q: '¿Cuál debe ser mi tirada larga máxima?', a: 'En la mayoría de planes populares, la tirada larga máxima ronda los 32-35 km, 3-4 semanas antes del maratón. No es necesario llegar a 42 km en entrenamiento: el objetivo es acostumbrar al cuerpo a muchas horas en movimiento, no dejar las piernas vacías antes de tiempo.' },
      { q: '¿Cómo gestiono la nutrición durante el maratón?', a: 'La clave es practicar la nutrición en las tiradas largas, no improvisar el día de la carrera. En general se toman 30-60 g de carbohidratos por hora (geles, bebida) y se empieza a comer pronto, antes de tener hambre. Ana, dentro de la app, te ayuda a montar tu plan de geles e hidratación.' },
      premiumFaqFree,
      accesoFaq('Maratón')
    ],
    finalH2: 'Pon tu fecha y empieza a entrenar',
    finalP: 'Tu plan de maratón te espera dentro de la app, adaptado a tu calendario y a tu nivel. Pruébalo 14 días gratis.',
    related: [{ href: '/planes/media-maraton', label: 'Plan Media Maratón (21K)' }, { href: '/planes/10k', label: 'Plan 10K' }, { href: '/planes/trail', label: 'Plan Trail' }],
    howToName: 'Plan de entrenamiento de maratón en 18 semanas', howToDesc: 'Plan de 18 semanas con base profunda, volumen, específico, pico y tapering para tu maratón.',
    courseName: 'Plan Maratón (18 semanas)', courseDesc: 'Plan de 18 semanas con 90 sesiones para tu maratón, guiado por Coach José IA.', level: 'Advanced'
  },
  {
    slug: 'trail', free: false, breadcrumb: 'Plan Trail',
    title: 'Plan Trail Running — Prepara tu Primera Carrera de Montaña | CorrerJuntos',
    metaDesc: 'Plan de trail running de 10 semanas: cuestas, técnica de bajada, fuerza y tiradas por montaña, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    ogTitle: 'Plan Trail Running — Prepara tu Primera Carrera de Montaña',
    ogDesc: 'Plan de trail de 10 semanas con cuestas, técnica de bajada, fuerza y tiradas por montaña, guiado por Coach José IA. Prueba Premium 14 días gratis.',
    heroAlt: 'Corredor de trail por un sendero de montaña verde',
    heroEyebrow: 'Plan Trail Running',
    h1: 'Da el salto del asfalto a la montaña',
    subtitle: 'Prepara tu primera carrera de trail con cuestas, técnica de bajada y fuerza específica. 10 semanas que Coach José adapta a tu nivel y al desnivel de tu carrera.',
    heroBadges: ['10 semanas', '40 sesiones', 'Coach José IA', 'Prueba 14 días gratis'],
    heroNote: premiumNote,
    info: [{ num: '10', lab: 'Semanas' }, { num: '40', lab: 'Sesiones' }, { num: '4', lab: 'Días / semana' }, { num: 'Trail', lab: 'Objetivo' }],
    paraQuien: [
      '<strong>Ya corres en asfalto</strong> y quieres pasarte a la montaña, o preparas tu primera carrera de trail.',
      '<strong>Tienes una base de carrera:</strong> corres con regularidad y aguantas tiradas de más de una hora.',
      '<strong>Puedes entrenar 4 días por semana,</strong> incluyendo cuestas y fuerza específica.',
      '<strong>Tu objetivo:</strong> terminar tu primera carrera de trail con seguridad en subidas y bajadas.'
    ],
    paraQuienNote: '¿Aún te falta base de carrera? Constrúyela primero con el <a href="/planes/10k">plan 10K</a> y vuelve al trail con fondo.',
    incluyeIntro: 'El trail es distinto del asfalto: importa el <strong>desnivel</strong>, la <strong>técnica de bajada</strong> y la <strong>fuerza</strong>. El plan es adaptativo y reparte las fases según tu fecha. Esta es la estructura (10 semanas):',
    fases: [
      { fase: 'Adaptación', sem: '1-2', cont: 'Rodajes por caminos y senderos fáciles. Adaptación de tobillos y propiocepción. Fuerza básica.' },
      { fase: 'Cuestas', sem: '3-4', cont: 'Series en cuesta de 200-500 m. Técnica de subida eficiente. Fortalecimiento específico.' },
      { fase: 'Tiradas trail', sem: '5-7', cont: 'Tiradas largas de 15-22 km por montaña. Técnica de bajada. Gestión de hidratación y nutrición.' },
      { fase: 'Simulación', sem: '8-9', cont: 'Entrenamientos que replican la carrera: desnivel acumulado, avituallamientos, gestión del esfuerzo.' },
      { fase: 'Tapering', sem: '10', cont: 'Reducción de volumen. Rodajes suaves y activación. Llegar fresco a tu primera carrera de trail.' }
    ],
    weekHeading: 'Una semana tipo (ejemplo, semana 6)',
    week: [
      { d: 'Lunes', a: 'Descanso' },
      { d: 'Martes', a: '45 min rodaje por caminos + 6× cuesta 300 m (rec. bajando)' },
      { d: 'Miércoles', a: 'Fuerza trail: sentadillas, zancadas, pliometría (40 min)' },
      { d: 'Jueves', a: 'Descanso' },
      { d: 'Viernes', a: '40 min rodaje suave por sendero + técnica de bajada' },
      { d: 'Sábado', a: 'Descanso' },
      { d: 'Domingo', a: 'Tirada larga 16 km de trail con 600 m de desnivel positivo' }
    ],
    planCardH3: 'Tu plan, sesión a sesión, en el bolsillo',
    planCardP: 'Cada día sabes qué toca: las cuestas, la fuerza, las tiradas por montaña y la técnica de bajada. Coach José ajusta la carga al desnivel de tu carrera, y Ana te ayuda con la hidratación y los avituallamientos. Empieza con 14 días de prueba.',
    planCardCta: 'Empezar mi plan en la app',
    appBoxH2: 'Tu coach y tu nutricionista, dentro de la app',
    appBoxP: 'Descarga CorrerJuntos gratis, pon tu fecha de carrera y activa el plan de trail. Coach José y Ana te acompañan en cada sesión, las cuestas y la estrategia de avituallamiento. Prueba Premium 14 días gratis.',
    features: [
      { ic: IC.coach, h: 'Coach José adaptativo', p: 'Ajusta la carga al desnivel de tu carrera y a tu progreso real, semana a semana.' },
      { ic: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 18 9 11 13 15 22 6"/><polyline points="16 6 22 6 22 12"/></svg>', h: 'Cuestas y técnica', p: 'Series en cuesta, fuerza específica y técnica de bajada para moverte seguro por montaña.' },
      { ic: IC.gps, h: 'GPS, ritmo y desnivel', p: 'Controla distancia, desnivel acumulado y tiempo en cada sendero y tirada larga.' },
      { ic: IC.group, h: 'Quedadas y comunidad', p: 'Encuentra trail runners de tu zona para entrenar la montaña acompañado.' }
    ],
    faq: [
      { q: '¿Qué zapatillas necesito para trail running?', a: 'Necesitas zapatillas de trail con suela de tacos (agarre en terreno suelto) y algo más de protección que las de asfalto. Para empezar, un modelo de tacos medios sirve para la mayoría de senderos; deja las suelas muy agresivas para barro y montaña técnica.' },
      { q: '¿Cuál es la diferencia entre trail y asfalto?', a: 'En trail importa más el desnivel que el ritmo: se sube andando muchas veces y se baja con técnica. El terreno irregular trabaja tobillos y core, el esfuerzo es más variable y la nutrición/hidratación cobra más peso por la duración. Por eso este plan incluye cuestas, fuerza y técnica de bajada.' },
      { q: '¿Puedo entrenar trail sin montaña cerca?', a: 'Sí, en buena parte. Las cuestas puedes hacerlas en cualquier rampa o incluso en cinta con inclinación, la fuerza en casa o gimnasio, y los rodajes por parques o caminos. Lo ideal es hacer alguna tirada larga en terreno real antes de la carrera para adaptarte a las bajadas.' },
      { q: '¿Qué material necesito llevar en trail?', a: 'Para carreras cortas, basta con zapatillas de trail y algo de hidratación. A medida que sube la distancia, conviene chaleco o cinturón con agua, geles, un cortavientos y el material obligatorio que indique la organización (manta, móvil, silbato). Revisa siempre el reglamento de tu carrera.' },
      premiumFaqFree,
      accesoFaq('Trail')
    ],
    finalH2: 'Pon tu fecha y empieza a entrenar',
    finalP: 'Tu plan de trail te espera dentro de la app, adaptado a tu calendario y al desnivel de tu carrera. Pruébalo 14 días gratis.',
    related: [{ href: '/planes/10k', label: 'Plan 10K' }, { href: '/planes/media-maraton', label: 'Plan Media Maratón (21K)' }, { href: '/planes/maraton', label: 'Plan Maratón (42K)' }],
    howToName: 'Plan de entrenamiento de trail running en 10 semanas', howToDesc: 'Plan de 10 semanas con adaptación, cuestas, tiradas por montaña, simulación y tapering para tu carrera de trail.',
    courseName: 'Plan Trail Running (10 semanas)', courseDesc: 'Plan de 10 semanas con 40 sesiones para tu primera carrera de trail, guiado por Coach José IA.', level: 'Intermediate'
  }
];

let out = [];
for (const c of plans) {
  const dir = path.join(ROOT, 'planes', c.slug);
  fs.mkdirSync(dir, { recursive: true });
  const html = page(c);
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  out.push(`${c.slug}: ${(html.length/1024).toFixed(0)}KB | free=${c.free} | fases=${c.fases.length} | faq=${c.faq.length}`);
}
console.log(out.join('\n'));
