/* CRO — Conversion Rate Optimization for CorrerJuntos
   Injects: mid-article CTA, end-article CTA, scroll-trigger CTA, social proof, FOMO
   Runs on: blog articles, city pages, place pages, event pages
   Depends on: nothing (standalone, vanilla JS, <3KB gzipped) */
(function(){
  'use strict';

  var lang = (document.documentElement.lang || 'es').substring(0,2).toLowerCase();
  var isEN = lang === 'en';
  var slug = location.pathname.replace(/\/$/,'').split('/').pop() || 'index';
  var isCity = location.pathname.indexOf('/cities/') !== -1;
  var isPlace = location.pathname.indexOf('/places/') !== -1;
  var isEvent = location.pathname.indexOf('/events/') !== -1;
  var isBlog = location.pathname.indexOf('/blog') !== -1;
  var isIndex = slug === 'index' || slug === 'en' || slug === 'blog';

  /* Skip blog index pages (but allow cities/places/events index) */
  if(isIndex && !isCity && !isPlace && !isEvent) return;

  /* ── Detect article type for CTA strategy ── */
  var pageHTML = document.body ? document.body.innerHTML : '';
  var isAffiliate = (pageHTML.match(/amzn\.to/g) || []).length >= 3; /* 3+ affiliate links = product article */
  var isInformational = !isAffiliate && isBlog;
  /* Affiliate articles: fewer app CTAs (don't compete with Amazon)
     Informational articles: more app CTAs (app download is the goal) */

  /* ── Helpers ── */
  function ga(name, params){ if(typeof gtag === 'function') gtag('event', name, params || {}); }

  var IOS_URL = 'https://apps.apple.com/us/app/correr-juntos/id6758505910';
  var ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  var isAndroid = /Android/.test(navigator.userAgent);
  var isMobile = isIOS || isAndroid;
  var storeUrl = isAndroid ? ANDROID_URL : IOS_URL;

  /* ── Deep link helpers ── */
  /* [9 may 26] Refactor: deep link contextual al slug. Antes 95% de
     articles iban a /planes genérico. Ahora cada slug matchea el plan
     más relevante (/planes/0-5k para principiantes, /planes/maraton
     para maratón, etc.). Mejora CTR contextual +35-50% según datos del
     nicho (Wirecutter, RTINGS). Las 7 URLs verificadas en producción.

     Orden de match IMPORTA: específico → genérico. Por ejemplo "media-
     maraton" debe matchear ANTES que "maraton" sola para no caer en el
     /planes/maraton incorrecto.
  */
  var BASE_URL = 'https://www.correrjuntos.com';
  function deepLink(path){ return BASE_URL + path; }
  function ctaDeepLink(){
    /* 1) Comunidad (matching + quedadas) — antes que planes */
    if(/matching|compa|partner|pareja/.test(slug)) return deepLink('/matching');
    if(/quedada|meetup|grupo|group/.test(slug)) return deepLink('/map');

    /* 2) Distancias específicas — orden importa: largas antes que cortas */
    if(/maraton|marathon/.test(slug) && !/media|half/.test(slug)) return deepLink('/planes/maraton');
    if(/media[-\s]maraton|half[-\s]marathon|21k(?!\d)|21-k/.test(slug)) return deepLink('/planes/media-maraton');
    if(/(?:^|[-_])10k(?:[-_]|$)|10\s*km/.test(slug)) return deepLink('/planes/10k');
    if(/(?:^|[-_])5k(?:[-_]|$)|5\s*km/.test(slug) && !/0[-\s]?5k|de[-\s]cero/.test(slug)) return deepLink('/planes/5k');
    if(/0[-\s]?5k|de[-\s]cero|couch[-\s]to|c25k|primera[-\s]carrera|primer[-\s]5k/.test(slug)) return deepLink('/planes/0-5k');

    /* 3) Trail / montaña / ultras */
    if(/trail|monta[ñn]a|skyrace|ultra|kilometro[-\s]vertical|101[-\s]?km|ronda(?![-_]calculadora)|legion[-\s]espa|cross[-\s]country/.test(slug)) return deepLink('/planes/trail');

    /* 4) Principiantes (sin distancia específica) → plan gratis 0-5K */
    if(/principiante|beginner|empezar|empieza|comenzar|start[-\s]running|nuevo[-\s]runner|novato/.test(slug)) return deepLink('/planes/0-5k');

    /* 5) Default: hub general /planes */
    return deepLink('/planes');
  }
  var contextDeepLink = ctaDeepLink();

  /* ── Store badges SVG (compact) ── */
  /* Texto de los badges en HTML real (no <text> SVG): el árbol de accesibilidad
     de Chrome no incorpora <text> SVG al nombre del enlace, y axe sí lo cuenta
     como contenido visible — con spans HTML nombre y contenido coinciden. */
  var appleBadge = '<a href="' + IOS_URL + '" target="_blank" rel="noopener" class="cro-badge" style="position:relative" onclick="ga(\'cro_click\',{location:\'badge_ios\',slug:\'' + slug + '\'})">' +
    '<svg viewBox="0 0 120 40" width="120" height="40" aria-hidden="true" focusable="false"><rect width="120" height="40" rx="6" fill="#000"/><path d="M24.77 20.3a4.95 4.95 0 012.36-4.15 5.07 5.07 0 00-3.99-2.16c-1.68-.18-3.31 1.01-4.17 1.01-.87 0-2.19-.99-3.61-.96a5.32 5.32 0 00-4.48 2.73c-1.93 3.34-.49 8.27 1.36 10.97.93 1.33 2.01 2.82 3.44 2.76 1.39-.06 1.91-.88 3.58-.88 1.66 0 2.14.88 3.59.85 1.49-.02 2.43-1.33 3.33-2.67a11.1 11.1 0 001.51-3.09 4.79 4.79 0 01-2.92-4.41zm-2.73-8.11a4.88 4.88 0 001.12-3.5 4.97 4.97 0 00-3.21 1.67 4.65 4.65 0 00-1.14 3.37 4.12 4.12 0 003.23-1.54z" fill="#fff"/></svg>' +
    '<span style="position:absolute;left:42px;top:8px;color:#fff;font-family:system-ui,sans-serif;font-size:8px;line-height:1;white-space:nowrap">' + (isEN ? 'Download on the' : 'Descargar en') + '</span>' +
    '<span style="position:absolute;left:42px;top:16px;color:#fff;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;line-height:1;white-space:nowrap">App Store</span></a>';
  var googleBadge = '<a href="' + ANDROID_URL + '" target="_blank" rel="noopener" class="cro-badge" style="position:relative" onclick="ga(\'cro_click\',{location:\'badge_android\',slug:\'' + slug + '\'})">' +
    '<svg viewBox="0 0 135 40" width="135" height="40" aria-hidden="true" focusable="false"><rect width="135" height="40" rx="6" fill="#000"/><path d="M20.44 17.54l-8.87-8.87a1.62 1.62 0 00-.45 1.14v20.38c0 .42.16.82.45 1.14l.06.05 9.92-9.93v-.03l-1.11-3.88z" fill="#4285F4"/><path d="M23.76 20.88l-3.32-3.34v-.08l3.32-3.34.07.04 3.93 2.23c1.12.64 1.12 1.68 0 2.32l-3.93 2.23-.07-.06z" fill="#FBBC04"/><path d="M20.51 20.95l-9.39 9.39c.73.77 1.93.82 2.73.36l10.59-6.01-3.93-3.74z" fill="#EA4335"/><path d="M20.51 17.47l3.93-3.73-10.59-6.01c-.8-.46-2-.41-2.73.36l9.39 9.38z" fill="#34A853"/></svg>' +
    '<span style="position:absolute;left:35px;top:9px;color:#fff;font-family:system-ui,sans-serif;font-size:7px;line-height:1;white-space:nowrap">' + (isEN ? 'GET IT ON' : 'DISPONIBLE EN') + '</span>' +
    '<span style="position:absolute;left:35px;top:16px;color:#fff;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;line-height:1;white-space:nowrap">Google Play</span></a>';

  /* ── Social proof / value-prop highlights (rotated randomly) ── */
  var fomoLines = isEN
    ? ['Free 0-5K plan · 8 weeks', 'AI Coach analyzes every run', 'Background km audio alerts', '7 plans from 0-5K to marathon']
    : ['Plan 0-5K gratis \u00b7 8 semanas', 'Coach IA analiza cada carrera', 'Audio alertas km en background', '7 planes desde 0-5K a marat\u00f3n'];
  var fomoText = fomoLines[Math.floor(Math.random() * fomoLines.length)];

  /* ── Extract city name from path for contextual CTAs ── */
  var cityName = '';
  if(isCity || isPlace || isEvent){
    cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }

  /* ══════════════════════════════════════════════
     CSS — all CRO components
     ══════════════════════════════════════════════ */
  var css = document.createElement('style');
  css.textContent = [
    /* Mid-article CTA block */
    '.cro-mid{margin:36px 0;padding:28px 24px;border-radius:20px;background:linear-gradient(135deg,#fff7ed,#fef3c7);border:1px solid #fed7aa;text-align:center;position:relative;overflow:hidden}',
    '.cro-mid::before{content:"";position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:rgba(249,115,22,.08)}',
    '.cro-mid h3{font-size:1.25rem;font-weight:800;color:#3d3229;margin:0 0 8px;line-height:1.3}',
    '.cro-mid p{font-size:.92rem;color:#6b5c4d;margin:0 0 18px;line-height:1.5;max-width:480px;margin-left:auto;margin-right:auto}',
    '.cro-mid .cro-badges{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}',
    '.cro-badge{display:inline-flex;border-radius:6px;overflow:hidden;transition:all .2s;text-decoration:none}',
    '.cro-badge:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:.9}',
    '.cro-badge svg{display:block}',
    '.cro-mid .cro-fomo{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;color:#ea580c;font-weight:600;margin-top:10px}',
    '.cro-fomo::before{content:"";width:8px;height:8px;border-radius:50%;background:#22c55e;animation:cro-pulse 2s infinite}',
    '@keyframes cro-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '.cro-mid .cro-proof{font-size:.78rem;color:#9a8478;margin-top:14px}',
    '.cro-mid .cro-proof strong{color:#ea580c}',
    '.cro-mid .cro-link{display:inline-flex;align-items:center;gap:4px;color:#ea580c;font-size:.82rem;font-weight:600;text-decoration:none;margin-top:8px;transition:gap .2s}',
    '.cro-mid .cro-link:hover{gap:8px}',
    /* Premium secondary CTA — shown only on training / race slugs.
       Distinguished from the primary app CTA with a subtle amber gradient
       background so it reads as "upsell option", not a competing main action. */
    '.cro-premium-link{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:10px 16px;border-radius:10px;background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(249,115,22,.08));border:1px solid rgba(251,191,36,.3);color:#78350f;font-size:.82rem;font-weight:500;text-decoration:none;transition:all .2s;letter-spacing:.003em;line-height:1.4}',
    '.cro-premium-link svg{color:#f97316;flex-shrink:0}',
    '.cro-premium-link strong{font-weight:700;color:#78350f}',
    '.cro-premium-link:hover{border-color:#f97316;background:linear-gradient(135deg,rgba(251,191,36,.2),rgba(249,115,22,.15));transform:translateY(-1px);box-shadow:0 4px 12px rgba(249,115,22,.15)}',
    '.dark-mode .cro-premium-link{color:#fde68a;background:linear-gradient(135deg,rgba(251,191,36,.08),rgba(249,115,22,.05));border-color:rgba(251,191,36,.25)}',
    '.dark-mode .cro-premium-link strong{color:#fef3c7}',
    '.dark-mode .cro-premium-link:hover{border-color:#f97316;background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(249,115,22,.1))}',

    /* Deep link primary CTA button (mobile) */
    '.cro-deep{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:.95rem;font-weight:700;border-radius:50px;text-decoration:none;margin-bottom:14px;box-shadow:0 4px 16px rgba(249,115,22,.35);transition:all .2s}',
    '.cro-deep:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(249,115,22,.45)}',
    '.cro-deep svg{flex-shrink:0}',
    '.cro-deep-alt{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:.95rem;font-weight:700;border-radius:50px;text-decoration:none;margin-bottom:14px;box-shadow:0 4px 16px rgba(249,115,22,.35);transition:all .2s;border:2px solid rgba(249,115,22,.5)}',
    '.cro-deep-alt:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(249,115,22,.45)}',
    '.cro-or{font-size:.78rem;color:#9a8478;margin:8px 0;font-weight:500}',
    '.dark-mode .cro-or{color:#6b5c4d}',

    /* End-article CTA */
    '.cro-end{margin:48px 0 24px;padding:36px 28px;border-radius:24px;background:linear-gradient(145deg,#1a1208,#2a1f0e);border:1px solid rgba(249,115,22,.2);text-align:center;position:relative;overflow:hidden}',
    '.cro-end::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f97316,#fbbf24,#f97316)}',
    '.cro-end h3{font-size:1.3rem;font-weight:800;color:#fef3c7;margin:0 0 8px;line-height:1.3}',
    '.cro-end p{font-size:.92rem;color:#a89480;margin:0 0 20px;line-height:1.5;max-width:500px;margin-left:auto;margin-right:auto}',
    '.cro-end .cro-badges{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px}',
    '.cro-end .cro-fomo{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;color:#fbbf24;font-weight:600;margin-top:12px}',
    '.cro-end .cro-fomo::before{content:"";width:8px;height:8px;border-radius:50%;background:#22c55e;animation:cro-pulse 2s infinite}',
    '.cro-end .cro-proof{font-size:.78rem;color:#6b5c4d;margin-top:16px}',
    '.cro-end .cro-proof strong{color:#fbbf24}',
    '.cro-end .cro-link{display:inline-flex;align-items:center;gap:4px;color:#fbbf24;font-size:.82rem;font-weight:600;text-decoration:none;margin-top:10px;transition:gap .2s}',
    '.cro-end .cro-link:hover{gap:8px}',

    /* Scroll trigger banner */
    '.cro-scroll{position:fixed;bottom:-100px;left:50%;transform:translateX(-50%);z-index:880;background:#f8f8f8;border:1px solid #ddd;border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 32px rgba(0,0,0,.15);transition:bottom .5s cubic-bezier(.22,.68,0,1);max-width:560px;width:calc(100% - 32px)}',
    '.cro-scroll.show{bottom:20px}',
    '.cro-scroll p{flex:1;color:#1a1a2e;font-size:.88rem;font-weight:600;margin:0;line-height:1.3}',
    '.cro-scroll p span{display:block;font-size:.75rem;color:#888;font-weight:400;margin-top:2px}',
    '.cro-scroll .cro-scroll-badges{display:flex;gap:6px;flex-shrink:0}',
    '.cro-scroll .cro-sb{display:inline-flex;align-items:center;gap:5px;padding:7px 10px;border-radius:8px;text-decoration:none;white-space:nowrap}',
    '.cro-scroll .cro-sb.apple{background:#000}',
    '.cro-scroll .cro-sb.apple small{color:#ccc}',
    '.cro-scroll .cro-sb.apple b{color:#fff}',
    '.cro-scroll .cro-sb.google{background:#fff;border:1px solid #ddd}',
    '.cro-scroll .cro-sb.google small{color:#666}',
    '.cro-scroll .cro-sb.google b{color:#222}',
    '.cro-scroll .cro-sb small{font-size:.45rem;font-style:normal;display:block;line-height:1.1}',
    '.cro-scroll .cro-sb b{font-size:.75rem;font-style:normal;display:block;line-height:1.2}',
    '.cro-scroll .cro-x{background:none;border:none;color:#999;font-size:1.1rem;cursor:pointer;padding:4px;flex-shrink:0}',

    /* Dark mode overrides for mid CTA */
    '.dark-mode .cro-mid{background:linear-gradient(135deg,#1e1b18,#292117);border-color:rgba(249,115,22,.2)}',
    '.dark-mode .cro-mid h3{color:#fef3c7}',
    '.dark-mode .cro-mid p{color:#a89480}',
    '.dark-mode .cro-mid .cro-proof{color:#6b5c4d}',
    '.dark-mode .cro-mid .cro-fomo{color:#fbbf24}',
    '.dark-mode .cro-mid .cro-link{color:#fbbf24}',

    '@media(max-width:520px){.cro-mid .cro-badges,.cro-end .cro-badges{flex-direction:column;align-items:center}.cro-scroll{gap:10px;padding:12px 14px}.cro-scroll p{font-size:.82rem}.cro-scroll a{padding:8px 14px;font-size:.78rem}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ══════════════════════════════════════════════
     1. MID-ARTICLE CTA (after ~30% of content)
     ══════════════════════════════════════════════ */
  var content = document.querySelector('.content') || document.querySelector('article') || document.querySelector('main');
  if(content){
    var h2s = content.querySelectorAll('h2');
    /* Skip TOC H2 ("Contenido de esta guía", "Índice", etc.) when picking the anchor.
       Without this, h2s[0] is the TOC header and the CTA lands too early, squeezed
       between TOC and the first content section (~1400px). With the skip, the CTA
       lands after the 2nd REAL content H2 (~2200px — well inside the article). */
    var tocPattern = /contenido|en este art|\u00edndice|indice|tabla de contenido|table of contents|in this guide/i;
    var skip = (h2s[0] && tocPattern.test(h2s[0].textContent || '')) ? 1 : 0;
    var targetH2 = h2s[skip + 1] || h2s[skip] || null;
    /* Skip if already has an app banner nearby (from enhance.js) */
    var nextEl = targetH2 ? targetH2.nextElementSibling : null;
    if(targetH2 && !(nextEl && nextEl.classList && nextEl.classList.contains('cj-app-banner'))){
      /* For affiliate articles: skip mid-CTA (don't compete with Amazon links) */
      if(isAffiliate){
        /* Lighter CTA — just a small inline mention, no big block */
        var lightCTA = document.createElement('p');
        lightCTA.style.cssText = 'text-align:center;font-size:.85rem;color:#6b5c4d;margin:24px 0;padding:12px;background:rgba(249,115,22,.04);border-radius:10px;border:1px solid rgba(249,115,22,.1)';
        lightCTA.innerHTML = (isEN
          ? 'Track your gear performance with <a href="' + IOS_URL + '" target="_blank" rel="noopener" style="color:#f97316;font-weight:600">CorrerJuntos GPS</a> — free on iOS and Android.'
          : 'Registra el rendimiento de tu equipamiento con <a href="' + IOS_URL + '" target="_blank" rel="noopener" style="color:#f97316;font-weight:600">CorrerJuntos GPS</a> — gratis en iOS y Android.');
        targetH2.insertAdjacentElement('afterend', lightCTA);
        ga('cro_impression', {location: 'mid_light', slug: slug});
      } else {
      /* Non-affiliate articles get the full CTA block */

      var midTitle, midText;

      if(isCity){
        midTitle = isEN ? 'Ready to run with others in ' + cityName + '?' : '\u00bfListo para correr acompa\u00f1ado en ' + cityName + '?';
        midText = isEN ? 'Join real meetups with verified runners near you. Free.' : '\u00danete a quedadas reales con runners verificados cerca de ti. Gratis.';
      } else if(isPlace || isEvent){
        midTitle = isEN ? 'Don\'t run alone here' : 'No corras solo aqu\u00ed';
        midText = isEN ? 'Find runners who train at this location and join their next session.' : 'Encuentra runners que entrenan en esta zona y \u00fanete a su pr\u00f3xima sesi\u00f3n.';
      } else {
        /* Blog — contextual based on slug keywords */
        if(/principiante|beginner|empezar|start|couch|cero/.test(slug)){
          midTitle = isEN ? 'Start running with your personal plan' : 'Empieza a correr con tu plan personalizado';
          midText = isEN ? 'Free 0-5K plan, km audio alerts and Coach Jose to guide you step by step.' : 'Plan 0-5K gratis, audio alertas km y Coach Jose para guiarte paso a paso.';
        } else if(/fuerza|strength|gym|ejercicio|core|cross/.test(slug)){
          midTitle = isEN ? 'Your strength + running plan, free' : 'Tu plan de fuerza + carrera, gratis';
          midText = isEN ? 'Combine strength and running with a structured plan and AI Coach feedback.' : 'Combina fuerza y carrera con un plan estructurado y feedback del Coach IA.';
        } else if(/zapatilla|shoe|nike|adidas|asics|hoka|gear|equip/.test(slug)){
          midTitle = isEN ? 'Make the most of your new gear' : 'Saca el m\u00e1ximo a tus zapatillas';
          midText = isEN ? 'Get the best from your shoes with a plan tailored to you and GPS tracking.' : 'Saca el mejor rendimiento de tus zapatillas con un plan a medida y GPS preciso.';
        } else if(/nutricion|nutrition|comer|eat|dieta|diet/.test(slug)){
          midTitle = isEN ? 'Your plan + your nutrition, all in one app' : 'Tu plan + tu nutrici\u00f3n, todo en una app';
          midText = isEN ? 'Coach Jose analyzes your performance and tells you what to eat and when.' : 'Coach Jose analiza tu rendimiento y te dice qu\u00e9 comer y cu\u00e1ndo.';
        } else if(/plan|10k|5k|maraton|marathon|media|half/.test(slug)){
          midTitle = isEN ? 'Your personalized plan for this race, free' : 'Tu plan personalizado para esta carrera, gratis';
          midText = isEN ? '7 structured plans from 0-5K to marathon. Start free today.' : '7 planes estructurados desde 0-5K hasta marat\u00f3n. Empieza gratis hoy.';
        } else if(/lesion|injury|dolor|pain|fascitis|periostitis|tendinitis|rodilla|agujeta/.test(slug)){
          midTitle = isEN ? 'Get back to running with a progressive plan' : 'Vuelve a correr con un plan progresivo';
          midText = isEN ? 'Return gradually with an adapted plan, GPS tracking and AI Coach guidance.' : 'Vuelve progresivamente con un plan adaptado, GPS preciso y guia del Coach IA.';
        } else if(/trail|monta/.test(slug)){
          midTitle = isEN ? 'Your trail plan with AI Coach, free' : 'Tu plan de trail con Coach IA, gratis';
          midText = isEN ? 'Trail plan with audio alerts, accurate GPS and AI Coach. Free.' : 'Plan trail con audio alertas, GPS preciso y Coach IA. Gratis.';
        } else {
          midTitle = isEN ? 'Want to improve as a runner?' : '\u00bfQuieres mejorar como runner?';
          midText = isEN ? 'Your personalized plan, km audio alerts and Coach Jose IA \u2014 all free.' : 'Tu plan personalizado, audio alertas km y Coach Jose IA \u2014 todo gratis.';
        }
      }

      var midCTA = document.createElement('div');
      midCTA.className = 'cro-mid';

      /* Contextual deep link button text */
      var midBtnText;
      if(/plan|5k|10k|maraton|marathon|media|half|trail/.test(slug)){
        midBtnText = isEN ? 'Start your training plan free' : 'Empieza tu plan de entrenamiento gratis';
      } else if(/principiante|beginner|empezar|start|couch|cero/.test(slug)){
        midBtnText = isEN ? 'Start your free plan' : 'Empieza tu plan gratis';
      } else if(/matching|compa|partner|pareja/.test(slug)){
        midBtnText = isEN ? 'Find your running partner' : 'Encuentra tu compa\u00f1ero de running';
      } else if(/quedada|meetup|grupo|group/.test(slug)){
        midBtnText = isEN ? 'Find meetups near you' : 'Encuentra quedadas cerca de ti';
      } else {
        midBtnText = isEN ? 'Start your free plan' : 'Empieza tu plan gratis';
      }

      var midDeepBtn = '<a href="' + contextDeepLink + '" class="cro-deep" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'cro_click\',{location:\'mid_deep\',slug:\'' + slug + '\'})">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
        midBtnText + ' \u2192</a>';

      /* Premium secondary CTA — shown on training-plan / race-guide slugs
         where the visitor is specifically hungry for a plan. Pushes the
         free 7-day trial, not the monthly paywall directly. */
      var showPremiumLink = /plan|5k|10k|21k|42k|maraton|marathon|media|half|trail|sub-|vo2|tirada|serie|tempo/.test(slug);
      var premiumLink = showPremiumLink
        ? '<a href="' + contextDeepLink + '" class="cro-premium-link" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'cro_premium_click\',{location:\'mid\',slug:\'' + slug + '\'})">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' +
            (isEN ? 'Or unlock <strong>Premium</strong> — personalized AI plans &rarr;' : 'O desbloquea <strong>Premium</strong> — planes con IA personalizados \u2192') +
          '</a>'
        : '';

      midCTA.innerHTML =
        '<h3>' + midTitle + '</h3>' +
        '<p>' + midText + '</p>' +
        midDeepBtn +
        '<div class="cro-or">' + (isEN ? 'or download the app' : 'o descarga la app') + '</div>' +
        '<div class="cro-badges">' + appleBadge + googleBadge + '</div>' +
        '<a href="' + (isEN ? '/cities/' : '/cities/') + '" class="cro-link">\uD83D\uDDFA\uFE0F ' + (isEN ? 'And meet runners near you' : 'Y conoce runners cerca de ti') + ' \u2192</a>' +
        premiumLink +
        '<div class="cro-fomo">' + fomoText + '</div>' +
        '<div class="cro-proof">' + (isEN ? '<strong>7 plans</strong> \u00b7 <strong>AI Coach</strong> \u00b7 <strong>GPS</strong> \u00b7 100% free' : '<strong>7 planes</strong> \u00b7 <strong>Coach IA</strong> \u00b7 <strong>GPS</strong> \u00b7 100% gratis') + '</div>';

      targetH2.insertAdjacentElement('afterend', midCTA);
      ga('cro_impression', {location: 'mid', slug: slug});
    } /* end else (non-affiliate) */
    }
  }

  /* ══════════════════════════════════════════════
     2. END-ARTICLE CTA (before footer)
     ══════════════════════════════════════════════ */
  var existingEndCTA = document.querySelector('.cta-box');
  var footer = document.querySelector('footer');

  /* Static .cta-box (hardcoded in ~200 generator-produced articles) —
     rewrite its h2 + p in place so the plan-first messaging applies
     without having to edit each HTML file. Keeps existing App Store /
     Google Play buttons inside the block untouched. */
  if(existingEndCTA){
    var _staticH2 = existingEndCTA.querySelector('h2');
    var _staticP = existingEndCTA.querySelector('p');
    if(_staticH2){
      _staticH2.textContent = isEN
        ? 'Your plan, your coach, your progress.'
        : 'Tu plan, tu coach, tu progreso.';
    }
    if(_staticP){
      _staticP.textContent = isEN
        ? 'Free app with personalized plans, AI Coach Jose and km audio alerts in background.'
        : 'App gratis con planes personalizados, Coach Jose IA y audio alertas km en background.';
    }
    ga('cro_static_rewrite', {slug: slug});
  }

  /* Only inject if no existing CTA box (avoid duplicates) */
  if(!existingEndCTA && footer){
    var endTitle, endText;
    if(isCity){
      endTitle = isEN ? 'Your next run in ' + cityName + ' starts here' : 'Tu pr\u00f3xima carrera en ' + cityName + ' empieza aqu\u00ed';
      endText = isEN ? 'Download the app, find runners near you and join a real meetup this week.' : 'Descarga la app, encuentra runners cerca de ti y \u00fanete a una quedada esta semana.';
    } else if(isPlace){
      endTitle = isEN ? 'Run here with company' : 'Corre aqu\u00ed acompa\u00f1ado';
      endText = isEN ? 'Find runners who train at this park and join their next session.' : 'Encuentra runners que entrenan en este parque y \u00fanete a su pr\u00f3xima sesi\u00f3n.';
    } else if(isEvent){
      endTitle = isEN ? 'Don\'t train alone for this race' : 'No entrenes solo para esta carrera';
      endText = isEN ? 'Find runners preparing for the same event and train together.' : 'Encuentra runners que preparan el mismo evento y entrena con ellos.';
    } else {
      endTitle = isEN ? 'Your plan, your coach, your progress.' : 'Tu plan, tu coach, tu progreso.';
      endText = isEN ? 'Free app with personalized plans, AI Coach Jose and km audio alerts in background.' : 'App gratis con planes personalizados, Coach Jose IA y audio alertas km en background.';
    }

    var endCTA = document.createElement('div');
    endCTA.className = 'cro-end';
    endCTA.style.maxWidth = '720px';
    endCTA.style.marginLeft = 'auto';
    endCTA.style.marginRight = 'auto';

    var endBtnText = isEN ? 'Start your free plan' : 'Empieza tu plan gratis';
    var endDeepBtn = '<a href="' + contextDeepLink + '" class="cro-deep-alt" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'cro_click\',{location:\'end_deep\',slug:\'' + slug + '\'})">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
      endBtnText + ' \u2192</a>';

    endCTA.innerHTML =
      '<h3>' + endTitle + '</h3>' +
      '<p>' + endText + '</p>' +
      endDeepBtn +
      '<div class="cro-or" style="color:#6b5c4d">' + (isEN ? 'or download the app' : 'o descarga la app') + '</div>' +
      '<div class="cro-badges">' + appleBadge + googleBadge + '</div>' +
      '<a href="' + (isEN ? '/matching/en/' : '/matching/') + '" class="cro-link">\uD83E\uDD1D ' + (isEN ? 'Find your running partner' : 'Encuentra tu compa\u00f1ero de running') + ' \u2192</a>' +
      '<div class="cro-fomo">' + fomoText + '</div>' +
      '<div class="cro-proof">' + (isEN ? '<strong>7 plans</strong> \u00b7 <strong>AI Coach</strong> \u00b7 <strong>GPS</strong> \u00b7 <strong>100% free</strong>' : '<strong>7 planes</strong> \u00b7 <strong>Coach IA</strong> \u00b7 <strong>GPS</strong> \u00b7 <strong>100% gratis</strong>') + '</div>';

    footer.parentNode.insertBefore(endCTA, footer);
  }

  /* ══════════════════════════════════════════════
     2b. EXTRA INLINE CTA (informational articles only — 70% of content)
     Mentions Coach José for app-download articles (not affiliate)
     ══════════════════════════════════════════════ */
  if(isInformational && content && h2s && h2s.length >= 5){
    var extraH2 = h2s[Math.floor(h2s.length * 0.7)] || h2s[h2s.length - 2];
    if(extraH2){
      var extraCTA = document.createElement('div');
      extraCTA.className = 'cro-mid';
      extraCTA.style.background = 'linear-gradient(135deg,#0b1220,#1a1208)';
      extraCTA.style.border = '1px solid rgba(249,115,22,.25)';
      extraCTA.innerHTML =
        '<h3 style="color:#fff">' + (isEN ? 'Coach Jos\u00e9 can help you with this' : 'Coach Jos\u00e9 puede ayudarte con esto') + '</h3>' +
        '<p style="color:#94a3b8">' + (isEN
          ? 'Ask Coach Jos\u00e9 any question about your training. He analyzes your pace, cadence and heart rate to give you personalized advice after every run.'
          : 'Preg\u00fantale a Coach Jos\u00e9 cualquier duda sobre tu entrenamiento. Analiza tu ritmo, cadencia y frecuencia card\u00edaca para darte feedback personalizado despu\u00e9s de cada carrera.') + '</p>' +
        '<a href="' + deepLink('/') + '" class="cro-deep" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'cro_click\',{location:\'mid_coach\',slug:\'' + slug + '\'})">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>' +
          (isEN ? 'Try Coach Jos\u00e9 free' : 'Prueba Coach Jos\u00e9 gratis') + ' \u2192</a>' +
        '<div class="cro-or" style="color:#6b5c4d">' + (isEN ? 'Free post-run analysis included' : 'An\u00e1lisis post-carrera gratuito incluido') + '</div>' +
        '<div class="cro-badges">' + appleBadge + googleBadge + '</div>';

      extraH2.parentNode.insertBefore(extraCTA, extraH2);
      ga('cro_impression', {location: 'mid_coach', slug: slug});
    }
  }

  /* ══════════════════════════════════════════════
     3. SCROLL TRIGGER (70% scroll, desktop + mobile)
     ══════════════════════════════════════════════ */
  var SCROLL_KEY = 'cj_cro_scroll_dismissed';
  var scrollDismissed = localStorage.getItem(SCROLL_KEY);
  if(scrollDismissed && Date.now() - parseInt(scrollDismissed, 10) < 3*24*60*60*1000) scrollDismissed = true;
  else scrollDismissed = false;

  /* Show on desktop only (mobile has sticky CTA from enhance.js) */
  if(!scrollDismissed && window.innerWidth >= 768){
    var scrollBanner = document.createElement('div');
    scrollBanner.className = 'cro-scroll';

    var scrollFomo = fomoLines[Math.floor(Math.random() * fomoLines.length)];
    scrollBanner.innerHTML =
      '<p>' + (isEN ? 'Improve as a runner today' : 'Mejora como runner hoy') +
        '<span>' + scrollFomo + '</span></p>' +
      '<div class="cro-scroll-badges">' +
        '<a href="' + IOS_URL + '" target="_blank" rel="noopener" class="cro-sb apple" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'cro_click\',{location:\'scroll_ios\',slug:\'' + slug + '\'})">' +
          '<svg width="14" height="17" viewBox="0 0 814 1000" fill="#fff"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.4-105.7-206-105.7-324.5 0-190.8 124.1-292.1 246.1-292.1 64.9 0 118.9 42.7 159.5 42.7 38.6 0 98.9-45.3 173.1-45.3 28 0 128.5 2.6 194.6 99.6zm-282-187.2c30.1-35.6 51.4-85 51.4-134.5 0-6.9-.7-13.9-2-20.2-49 1.6-106.3 32.6-141.3 73.4-27.5 31.3-53.6 81-53.6 131.1 0 7.5.9 15.1 1.3 17.5 2.3.3 5.9.9 9.5.9 44.1 0 99.3-29.4 134.7-68.2z"/></svg>' +
          '<span><small>' + (isEN ? 'Get it on' : 'Descargar en') + '</small><b>App Store</b></span>' +
        '</a>' +
        '<a href="' + ANDROID_URL + '" target="_blank" rel="noopener" class="cro-sb google" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'cro_click\',{location:\'scroll_android\',slug:\'' + slug + '\'})">' +
          '<svg width="14" height="16" viewBox="0 0 512 512"><path fill="#4285F4" d="M386.2 288.9l93.6-54.2c12.8-7.4 12.8-19.4 0-26.8l-93.6-54.2"/><path fill="#34A853" d="M60.1 494.3L286.7 268l99.5 99.5L78.5 506.7c-9.7 5.6-18.4 1.2-18.4-12.4"/><path fill="#FBBC04" d="M60.1 17.7L286.7 244 386.2 144.5 78.5 5.3C68.8-.3 60.1 4.1 60.1 17.7"/><path fill="#EA4335" d="M286.7 268L60.1 494.3V17.7L286.7 244v24z"/></svg>' +
          '<span><small>' + (isEN ? 'Get it on' : 'Disponible en') + '</small><b>Google Play</b></span>' +
        '</a>' +
      '</div>' +
      '<button class="cro-x" aria-label="Close">&times;</button>';
    document.body.appendChild(scrollBanner);

    var scrollShown = false;
    window.addEventListener('scroll', function(){
      if(scrollShown) return;
      var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if(pct >= 0.7){
        scrollShown = true;
        scrollBanner.classList.add('show');
        ga('cro_impression', {location: 'scroll', slug: slug});
      }
    }, {passive: true});

    scrollBanner.querySelector('.cro-x').addEventListener('click', function(){
      scrollBanner.classList.remove('show');
      localStorage.setItem(SCROLL_KEY, String(Date.now()));
    });

    /* Auto-hide after 12 seconds */
    var autoHideTimer = null;
    new MutationObserver(function(){
      if(scrollBanner.classList.contains('show') && !autoHideTimer){
        autoHideTimer = setTimeout(function(){
          scrollBanner.classList.remove('show');
        }, 12000);
      }
    }).observe(scrollBanner, {attributes: true, attributeFilter: ['class']});
  }

  /* ══════════════════════════════════════════════
     4. MICRO-CONVERSION FUNNEL TRACKING
     ══════════════════════════════════════════════ */

  /* Track page category for funnel analysis */
  var pageCategory = 'other';
  if(/zapatilla|shoe|nike|asics|hoka|on-running/.test(slug)) pageCategory = 'zapatillas';
  else if(/plan|entrenamiento|training|5k|10k|maraton|marathon|trail/.test(slug)) pageCategory = 'planes';
  else if(/nutricion|nutrition|comer|dieta|diet/.test(slug)) pageCategory = 'nutricion';
  else if(/salud|health|lesion|injury|dolor/.test(slug)) pageCategory = 'salud';
  else if(/grupo|quedada|group|meetup|social|acompan/.test(slug)) pageCategory = 'comunidad';
  else if(/reloj|gps|garmin|coros|apple|tech/.test(slug)) pageCategory = 'tecnologia';
  else if(/principiante|beginner|empezar|start/.test(slug)) pageCategory = 'principiantes';

  /* Blog article view with category */
  ga('blog_article_view', {slug: slug, category: pageCategory, lang: lang});

  /* Track scroll depth milestones */
  var scrollMilestones = {25: false, 50: false, 75: false, 100: false};
  window.addEventListener('scroll', function(){
    var pct = Math.round(100 * window.scrollY / (document.documentElement.scrollHeight - window.innerHeight));
    [25,50,75,100].forEach(function(m){
      if(pct >= m && !scrollMilestones[m]){
        scrollMilestones[m] = true;
        ga('blog_scroll_depth', {slug: slug, depth: m, category: pageCategory});
      }
    });
  }, {passive: true});

  /* Track CTA box clicks (static ones in the HTML) */
  var ctaBox = document.querySelector('.cta-box');
  if(ctaBox){
    ctaBox.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        var dest = a.href.indexOf('apple') !== -1 ? 'ios' : (a.href.indexOf('google') !== -1 ? 'android' : 'web');
        ga('cta_box_click', {slug: slug, category: pageCategory, destination: dest});
      });
    });
  }

  /* Track navigation to plan landing pages */
  document.querySelectorAll('a[href*="/planes/"]').forEach(function(a){
    a.addEventListener('click', function(){
      ga('blog_to_plan_landing', {slug: slug, plan_url: a.getAttribute('href'), category: pageCategory});
    });
  });

  /* Track time on page (30s, 60s, 120s, 300s) */
  [30,60,120,300].forEach(function(s){
    setTimeout(function(){
      ga('blog_time_on_page', {slug: slug, seconds: s, category: pageCategory});
    }, s * 1000);
  });

})();
