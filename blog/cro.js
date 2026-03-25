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

  /* ── Helpers ── */
  function ga(name, params){ if(typeof gtag === 'function') gtag('event', name, params || {}); }

  var IOS_URL = 'https://apps.apple.com/us/app/correr-juntos/id6758505910';
  var ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  var isAndroid = /Android/.test(navigator.userAgent);
  var storeUrl = isAndroid ? ANDROID_URL : IOS_URL;

  /* ── Store badges SVG (compact) ── */
  var appleBadge = '<a href="' + IOS_URL + '" target="_blank" rel="noopener" class="cro-badge" onclick="ga(\'cro_click\',{location:\'badge_ios\',slug:\'' + slug + '\'})">' +
    '<svg viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="6" fill="#000"/><path d="M24.77 20.3a4.95 4.95 0 012.36-4.15 5.07 5.07 0 00-3.99-2.16c-1.68-.18-3.31 1.01-4.17 1.01-.87 0-2.19-.99-3.61-.96a5.32 5.32 0 00-4.48 2.73c-1.93 3.34-.49 8.27 1.36 10.97.93 1.33 2.01 2.82 3.44 2.76 1.39-.06 1.91-.88 3.58-.88 1.66 0 2.14.88 3.59.85 1.49-.02 2.43-1.33 3.33-2.67a11.1 11.1 0 001.51-3.09 4.79 4.79 0 01-2.92-4.41zm-2.73-8.11a4.88 4.88 0 001.12-3.5 4.97 4.97 0 00-3.21 1.67 4.65 4.65 0 00-1.14 3.37 4.12 4.12 0 003.23-1.54z" fill="#fff"/><text x="42" y="15" fill="#fff" font-family="system-ui,sans-serif" font-size="8">' + (isEN ? 'Download on the' : 'Descargar en') + '</text><text x="42" y="27" fill="#fff" font-family="system-ui,sans-serif" font-size="14" font-weight="600">App Store</text></svg></a>';
  var googleBadge = '<a href="' + ANDROID_URL + '" target="_blank" rel="noopener" class="cro-badge" onclick="ga(\'cro_click\',{location:\'badge_android\',slug:\'' + slug + '\'})">' +
    '<svg viewBox="0 0 135 40" width="135" height="40"><rect width="135" height="40" rx="6" fill="#000"/><path d="M20.44 17.54l-8.87-8.87a1.62 1.62 0 00-.45 1.14v20.38c0 .42.16.82.45 1.14l.06.05 9.92-9.93v-.03l-1.11-3.88z" fill="#4285F4"/><path d="M23.76 20.88l-3.32-3.34v-.08l3.32-3.34.07.04 3.93 2.23c1.12.64 1.12 1.68 0 2.32l-3.93 2.23-.07-.06z" fill="#FBBC04"/><path d="M20.51 20.95l-9.39 9.39c.73.77 1.93.82 2.73.36l10.59-6.01-3.93-3.74z" fill="#EA4335"/><path d="M20.51 17.47l3.93-3.73-10.59-6.01c-.8-.46-2-.41-2.73.36l9.39 9.38z" fill="#34A853"/><text x="35" y="15" fill="#fff" font-family="system-ui,sans-serif" font-size="7">' + (isEN ? 'GET IT ON' : 'DISPONIBLE EN') + '</text><text x="35" y="27" fill="#fff" font-family="system-ui,sans-serif" font-size="13" font-weight="600">Google Play</text></svg></a>';

  /* ── FOMO / urgency helper ── */
  var fomoLines = isEN
    ? ['12 runners joined this week', '3 meetups near you tomorrow', 'New group created 2h ago', '87 runners active today']
    : ['12 runners se unieron esta semana', '3 quedadas cerca de ti ma\u00f1ana', 'Nuevo grupo creado hace 2h', '87 runners activos hoy'];
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
    '.cro-scroll{position:fixed;bottom:-80px;left:50%;transform:translateX(-50%);z-index:880;background:linear-gradient(135deg,#1a1208,#2a1f0e);border:1px solid rgba(249,115,22,.3);border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 32px rgba(0,0,0,.4);transition:bottom .5s cubic-bezier(.22,.68,0,1);max-width:520px;width:calc(100% - 32px);backdrop-filter:blur(12px)}',
    '.cro-scroll.show{bottom:20px}',
    '.cro-scroll p{flex:1;color:#fef3c7;font-size:.88rem;font-weight:600;margin:0;line-height:1.3}',
    '.cro-scroll p span{display:block;font-size:.75rem;color:#a89480;font-weight:400;margin-top:2px}',
    '.cro-scroll a{flex-shrink:0;padding:10px 18px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:.82rem;font-weight:700;border-radius:50px;text-decoration:none;white-space:nowrap}',
    '.cro-scroll .cro-x{background:none;border:none;color:#6b5c4d;font-size:1.1rem;cursor:pointer;padding:4px;flex-shrink:0}',

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
    /* Insert after the 2nd h2 (roughly 30% of content) */
    var targetH2 = h2s.length >= 3 ? h2s[1] : (h2s.length >= 2 ? h2s[1] : null);
    /* Skip if already has an app banner nearby (from enhance.js) */
    var nextEl = targetH2 ? targetH2.nextElementSibling : null;
    if(targetH2 && !(nextEl && nextEl.classList && nextEl.classList.contains('cj-app-banner'))){
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
          midTitle = isEN ? 'Starting is easier with company' : 'Empezar es m\u00e1s f\u00e1cil acompa\u00f1ado';
          midText = isEN ? 'Find beginner-friendly groups near you and take the first step together.' : 'Encuentra grupos para principiantes cerca de ti y da el primer paso juntos.';
        } else if(/fuerza|strength|gym|ejercicio|core|cross/.test(slug)){
          midTitle = isEN ? 'Train smarter, run together' : 'Entrena mejor, corre acompa\u00f1ado';
          midText = isEN ? 'Find runners who share your training goals and push each other.' : 'Encuentra runners con tus mismos objetivos y motiv\u00e1os mutuamente.';
        } else if(/zapatilla|shoe|nike|adidas|asics|hoka|gear|equip/.test(slug)){
          midTitle = isEN ? 'The best gear means nothing without the right crew' : 'El mejor equipamiento no sirve sin la compa\u00f1\u00eda adecuada';
          midText = isEN ? 'Join runners near you and test your new gear together.' : '\u00danete a runners cerca de ti y estrena tu equipamiento juntos.';
        } else if(/nutricion|nutrition|comer|eat|dieta|diet/.test(slug)){
          midTitle = isEN ? 'Fuel your runs, find your crew' : 'Alimenta tus carreras, encuentra tu grupo';
          midText = isEN ? 'Connect with runners who share your pace and nutrition goals.' : 'Conecta con runners de tu ritmo que comparten tus objetivos.';
        } else if(/plan|10k|5k|maraton|marathon|media|half/.test(slug)){
          midTitle = isEN ? 'Train for your race with a group' : 'Prepara tu carrera con un grupo';
          midText = isEN ? 'Find runners training for the same distance and pace as you.' : 'Encuentra runners que preparan la misma distancia y ritmo que t\u00fa.';
        } else if(/lesion|injury|dolor|pain|fascitis|periostitis|tendinitis|rodilla|agujeta/.test(slug)){
          midTitle = isEN ? 'Recover smarter, run with support' : 'Recupera mejor, corre con apoyo';
          midText = isEN ? 'Track your recovery and find runners at your pace.' : 'Controla tu recuperaci\u00f3n y encuentra runners a tu ritmo.';
        } else if(/trail|monta/.test(slug)){
          midTitle = isEN ? 'Find your trail crew' : 'Encuentra tu grupo de trail';
          midText = isEN ? 'Connect with trail runners near you and explore routes together.' : 'Conecta con trail runners cerca de ti y explora rutas juntos.';
        } else {
          midTitle = isEN ? 'Tired of running alone?' : '\u00bfCansado de correr solo?';
          midText = isEN ? 'Find runners near you, join real meetups and start running with company today.' : 'Encuentra runners cerca de ti, \u00fanete a quedadas reales y empieza a correr acompa\u00f1ado.';
        }
      }

      var midCTA = document.createElement('div');
      midCTA.className = 'cro-mid';
      midCTA.innerHTML =
        '<h3>' + midTitle + '</h3>' +
        '<p>' + midText + '</p>' +
        '<div class="cro-badges">' + appleBadge + googleBadge + '</div>' +
        '<a href="' + (isEN ? '/cities/' : '/cities/') + '" class="cro-link">\uD83D\uDDFA\uFE0F ' + (isEN ? 'See meetups near me' : 'Ver quedadas cerca de m\u00ed') + ' \u2192</a>' +
        '<div class="cro-fomo">' + fomoText + '</div>' +
        '<div class="cro-proof">' + (isEN ? '<strong>5,000+</strong> runners \u00b7 <strong>58+ cities</strong> \u00b7 100% free' : '<strong>5.000+</strong> runners \u00b7 <strong>58+ ciudades</strong> \u00b7 100% gratis') + '</div>';

      targetH2.parentNode.insertBefore(midCTA, targetH2);
      ga('cro_impression', {location: 'mid', slug: slug});
    }
  }

  /* ══════════════════════════════════════════════
     2. END-ARTICLE CTA (before footer)
     ══════════════════════════════════════════════ */
  var existingEndCTA = document.querySelector('.cta-box');
  var footer = document.querySelector('footer');
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
      endTitle = isEN ? 'The next step isn\'t running more\u2026 it\'s running together' : 'El siguiente paso no es correr m\u00e1s\u2026 es correr acompa\u00f1ado';
      endText = isEN ? 'Join the community of runners who train together. Free, real, verified.' : '\u00danete a la comunidad de runners que entrenan juntos. Gratis, real, verificado.';
    }

    var endCTA = document.createElement('div');
    endCTA.className = 'cro-end';
    endCTA.style.maxWidth = '720px';
    endCTA.style.marginLeft = 'auto';
    endCTA.style.marginRight = 'auto';
    endCTA.innerHTML =
      '<h3>' + endTitle + '</h3>' +
      '<p>' + endText + '</p>' +
      '<div class="cro-badges">' + appleBadge + googleBadge + '</div>' +
      '<a href="' + (isEN ? '/matching/en/' : '/matching/') + '" class="cro-link">\uD83E\uDD1D ' + (isEN ? 'Find your running partner' : 'Encuentra tu compa\u00f1ero de running') + ' \u2192</a>' +
      '<div class="cro-fomo">' + fomoText + '</div>' +
      '<div class="cro-proof">' + (isEN ? 'Active in <strong>58+ cities</strong> worldwide \u00b7 <strong>100% free</strong>' : 'Activo en <strong>58+ ciudades</strong> del mundo \u00b7 <strong>100% gratis</strong>') + '</div>';

    footer.parentNode.insertBefore(endCTA, footer);
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
      '<p>' + (isEN ? 'Don\'t run alone today' : 'No corras solo hoy') +
        '<span>' + scrollFomo + '</span></p>' +
      '<a href="' + storeUrl + '" target="_blank" rel="noopener" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'cro_click\',{location:\'scroll\',slug:\'' + slug + '\'})">' + (isEN ? 'Join free' : '\u00danete gratis') + '</a>' +
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
