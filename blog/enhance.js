/* Blog enhancements — lang toggle + FAQ accordion + scroll-to-top + newsletter slide-in */
(function(){
  'use strict';

  /* ══════════════════════════════════════════════
     THEME: Light / Dark Mode
     ══════════════════════════════════════════════ */
  // Sync body class on load (FOUC script sets it on <html>)
  if(document.documentElement.classList.contains('dark-mode')){
    document.body.classList.add('dark-mode');
  }
  window.toggleBlogTheme = function(){
    document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('blog_theme', isDark ? 'dark' : 'light');
    document.querySelectorAll('.theme-toggle').forEach(function(b){ b.textContent = isDark ? '🌙' : '☀️'; });
  };
  document.querySelectorAll('.theme-toggle').forEach(function(b){
    b.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
  });

  /* Inject light/dark overrides for all enhance.js injected components */
  var themeCSS = document.createElement('style');
  themeCSS.textContent = [
    '/* Light-mode overrides for enhance.js elements */',
    '.lang-toggle{border-color:rgba(0,0,0,.1)}',
    '.lang-toggle .lt-sep{background:rgba(0,0,0,.1)}',
    '.lang-toggle a:hover:not(.active-lang){color:#475569;background:rgba(0,0,0,.05)}',
    '.faq-q{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.08);color:#334155}',
    '.faq-q:hover{background:rgba(0,0,0,.06)}',
    '.faq-q.open{background:rgba(249,115,22,.06)}',
    '.faq-a{background:rgba(0,0,0,.015);border-color:rgba(0,0,0,.08)}',
    '.faq-a p{color:#475569}',
    '.faq-chevron{color:#94a3b8}',
    '#nl-slidein{background:rgba(255,255,255,.97);box-shadow:0 8px 32px rgba(0,0,0,.12)}',
    '#nl-slidein h4{color:#1a1a2e}',
    '#nl-slidein p{color:#475569}',
    '#nl-slidein input{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.1);color:#1a1a2e}',
    '#sticky-cta{background:linear-gradient(135deg,rgba(255,255,255,.97),rgba(248,249,250,.95));border-top-color:rgba(249,115,22,.2)}',
    '.theme-toggle{background:none;border:1px solid rgba(0,0,0,.1);width:36px;height:36px;border-radius:999px;font-size:1.1rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1}',
    '.theme-toggle:hover{border-color:rgba(249,115,22,.4);background:rgba(249,115,22,.06)}',
    '/* Dark-mode restore */',
    '.dark-mode .lang-toggle{border-color:rgba(255,255,255,.1)}',
    '.dark-mode .lang-toggle .lt-sep{background:rgba(255,255,255,.1)}',
    '.dark-mode .lang-toggle a:hover:not(.active-lang){color:#cbd5e1;background:rgba(255,255,255,.05)}',
    '.dark-mode .faq-q{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:#e2e8f0}',
    '.dark-mode .faq-q:hover{background:rgba(255,255,255,.07)}',
    '.dark-mode .faq-q.open{background:rgba(249,115,22,.08)}',
    '.dark-mode .faq-a{background:rgba(255,255,255,.02);border-color:rgba(255,255,255,.08)}',
    '.dark-mode .faq-a p{color:#94a3b8}',
    '.dark-mode .faq-chevron{color:#64748b}',
    '.dark-mode #nl-slidein{background:rgba(11,18,32,.97);box-shadow:0 8px 32px rgba(0,0,0,.5)}',
    '.dark-mode #nl-slidein h4{color:#fff}',
    '.dark-mode #nl-slidein p{color:#94a3b8}',
    '.dark-mode #nl-slidein input{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#fff}',
    '.dark-mode #sticky-cta{background:linear-gradient(135deg,rgba(11,18,32,.97),rgba(11,18,32,.95));border-top-color:rgba(249,115,22,.25)}',
    '.dark-mode .theme-toggle{border-color:rgba(255,255,255,.1)}',
    '.dark-mode .theme-toggle:hover{border-color:rgba(249,115,22,.4);background:rgba(249,115,22,.08)}',
  ].join('\n');
  document.head.appendChild(themeCSS);

  /* ══════════════════════════════════════════════
     0. LANGUAGE DETECTION & TOGGLE
     ══════════════════════════════════════════════ */
  var lang = (document.documentElement.lang || 'es').substring(0,2).toLowerCase();
  var isEN = (lang === 'en');

  /* Find the alternate-language URL from hreflang tags */
  var altLang = isEN ? 'es' : 'en';
  var altLink = document.querySelector('link[hreflang="'+altLang+'"]');
  var altURL  = altLink ? altLink.getAttribute('href') : null;

  /* Build toggle only if we have an alternate URL */
  if(altURL){
    var cssLang = document.createElement('style');
    cssLang.textContent = [
      '.lang-toggle{display:flex;align-items:center;gap:0;border-radius:999px;border:1px solid rgba(255,255,255,.1);overflow:hidden;margin:0 8px;flex-shrink:0}',
      '.lang-toggle a{display:flex;align-items:center;gap:4px;padding:5px 10px;font-size:.78rem;font-weight:700;text-decoration:none;color:#64748b;transition:all .2s;white-space:nowrap;line-height:1}',
      '.lang-toggle a.active-lang{background:rgba(249,115,22,.15);color:#f97316}',
      '.lang-toggle a:hover:not(.active-lang){color:#cbd5e1;background:rgba(255,255,255,.05)}',
      '.lang-toggle .lt-sep{width:1px;height:16px;background:rgba(255,255,255,.1);flex-shrink:0}',
      '@media(max-width:768px){.lang-toggle{margin:0 4px;order:2}.lang-toggle a{padding:4px 8px;font-size:.72rem}}'
    ].join('\n');
    document.head.appendChild(cssLang);

    /* Convert full URL to relative path for local navigation */
    var altPath = altURL;
    try{ altPath = new URL(altURL).pathname; }catch(e){}

    var toggle = document.createElement('div');
    toggle.className = 'lang-toggle';
    toggle.innerHTML =
      '<a href="'+(isEN ? altPath : window.location.pathname)+'" class="'+(isEN ? '' : 'active-lang')+'">ES</a>' +
      '<span class="lt-sep"></span>' +
      '<a href="'+(isEN ? window.location.pathname : altPath)+'" class="'+(isEN ? 'active-lang' : '')+'">EN</a>';

    /* Insert into nav — between nav-links and nav-auth */
    var navAuth = document.querySelector('.nav-auth');
    if(navAuth && navAuth.parentNode){
      navAuth.parentNode.insertBefore(toggle, navAuth);
    } else {
      /* Fallback: append to .nav */
      var navEl = document.querySelector('.nav');
      if(navEl) navEl.appendChild(toggle);
    }
  }

  /* ══════════════════════════════════════════════
     0b. BACK TO BLOG BUTTON
     ══════════════════════════════════════════════ */
  var navWrapper = document.querySelector('.nav-wrapper');
  var cleanPath = location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  var isBlogIndex = (cleanPath === '/blog' || cleanPath === '/blog/en');
  if(navWrapper && !isBlogIndex){
    var cssBack = document.createElement('style');
    cssBack.textContent = [
      '.blog-back{max-width:1000px;margin:0 auto;padding:10px 20px 0}',
      '.blog-back a{color:#f97316;text-decoration:none;font-size:.85rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.15);transition:all .2s}',
      '.blog-back a:hover{background:rgba(249,115,22,.15);border-color:rgba(249,115,22,.3);transform:translateX(-2px)}',
      '.dark-mode .blog-back a{background:rgba(249,115,22,.1);border-color:rgba(249,115,22,.2)}',
      '.dark-mode .blog-back a:hover{background:rgba(249,115,22,.18)}'
    ].join('\n');
    document.head.appendChild(cssBack);

    var backDiv = document.createElement('div');
    backDiv.className = 'blog-back';
    backDiv.innerHTML = '<a href="'+(isEN ? '/blog/en/' : '/blog/')+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>'+(isEN ? 'Back to Blog' : 'Volver al Blog')+'</a>';
    navWrapper.parentNode.insertBefore(backDiv, navWrapper.nextSibling);
  }

  /* ══════════════════════════════════════════════
     1. FAQ ACCORDION
     ══════════════════════════════════════════════ */
  var faqH2 = document.getElementById('faq');
  if(faqH2){
    /* Collect Q&A pairs: h3 = question, next p = answer */
    var node = faqH2.nextElementSibling;
    var pairs = [];
    var currentQ = null;
    while(node){
      var tag = node.tagName;
      /* Stop when we hit another h2 or a known section */
      if(tag === 'H2') break;
      if(tag === 'DIV' && (node.classList.contains('share-article') ||
         node.classList.contains('author-card') ||
         node.classList.contains('related-section') ||
         node.classList.contains('cta-box'))) break;

      /* faq-item wrapper */
      if(tag === 'DIV' && (node.classList.contains('faq-item') || node.querySelector('h3'))){
        var q = node.querySelector('h3');
        var a = node.querySelector('p');
        if(q && a) pairs.push({q: q.textContent, a: a.innerHTML, el: node});
        node = node.nextElementSibling;
        continue;
      }
      /* bare h3 + p */
      if(tag === 'H3'){
        currentQ = node.textContent;
        var nextEl = node.nextElementSibling;
        if(nextEl && nextEl.tagName === 'P'){
          pairs.push({q: currentQ, a: nextEl.innerHTML, el: node, elA: nextEl});
          node = nextEl.nextElementSibling;
          continue;
        }
      }
      node = node.nextElementSibling;
    }

    if(pairs.length >= 2){
      /* Inject CSS */
      var style = document.createElement('style');
      style.textContent = [
        '.faq-accordion{margin:20px 0}',
        '.faq-q{display:flex;justify-content:space-between;align-items:center;width:100%;padding:16px 18px;margin:0 0 2px;background:rgba(0,0,0,.03);border:1px solid rgba(0,0,0,.08);border-radius:12px;color:#334155;font-size:.92rem;font-weight:700;text-align:left;cursor:pointer;transition:all .2s;line-height:1.4}',
        '.faq-q:hover{background:rgba(0,0,0,.06);border-color:rgba(249,115,22,.25)}',
        '.faq-q.open{background:rgba(249,115,22,.06);border-color:rgba(249,115,22,.3);border-radius:12px 12px 0 0;margin-bottom:0}',
        '.faq-chevron{font-size:.75rem;color:#94a3b8;transition:transform .25s;flex-shrink:0;margin-left:12px}',
        '.faq-q.open .faq-chevron{transform:rotate(180deg);color:#f97316}',
        '.faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s ease;padding:0 18px;background:rgba(0,0,0,.015);border:1px solid rgba(0,0,0,.08);border-top:none;border-radius:0 0 12px 12px;margin:0 0 8px}',
        '.faq-a.open{max-height:600px;padding:14px 18px}',
        '.faq-a p{margin:0;color:#475569;font-size:.88rem;line-height:1.65}',
      ].join('\n');
      document.head.appendChild(style);

      /* Build accordion */
      var container = document.createElement('div');
      container.className = 'faq-accordion';
      for(var i=0;i<pairs.length;i++){
        var btn = document.createElement('button');
        btn.className = 'faq-q';
        btn.innerHTML = '<span>'+pairs[i].q+'</span><span class="faq-chevron">▼</span>';
        btn.setAttribute('aria-expanded','false');
        var ans = document.createElement('div');
        ans.className = 'faq-a';
        ans.innerHTML = '<p>'+pairs[i].a+'</p>';
        btn.addEventListener('click',(function(b,a){
          return function(){
            var isOpen = b.classList.contains('open');
            b.classList.toggle('open');
            a.classList.toggle('open');
            b.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
          };
        })(btn,ans));
        container.appendChild(btn);
        container.appendChild(ans);
      }

      /* Replace old FAQ items */
      var firstEl = pairs[0].el;
      firstEl.parentNode.insertBefore(container, firstEl);
      for(var j=0;j<pairs.length;j++){
        if(pairs[j].el && pairs[j].el.parentNode) pairs[j].el.parentNode.removeChild(pairs[j].el);
        if(pairs[j].elA && pairs[j].elA.parentNode) pairs[j].elA.parentNode.removeChild(pairs[j].elA);
      }
    }
  }

  /* ══════════════════════════════════════════════
     2. SCROLL-TO-TOP BUTTON
     ══════════════════════════════════════════════ */
  var cssTop = document.createElement('style');
  cssTop.textContent = [
    '#scroll-top{position:fixed;bottom:28px;right:28px;width:44px;height:44px;border-radius:50%;background:rgba(249,115,22,.9);border:none;color:#fff;font-size:1.1rem;cursor:pointer;opacity:0;visibility:hidden;transition:all .3s;z-index:900;box-shadow:0 4px 16px rgba(249,115,22,.35);display:flex;align-items:center;justify-content:center}',
    '#scroll-top.show{opacity:1;visibility:visible}',
    '#scroll-top:hover{background:#f97316;transform:scale(1.1);box-shadow:0 6px 20px rgba(249,115,22,.45)}',
    '@media(max-width:640px){#scroll-top{bottom:20px;right:16px;width:40px;height:40px;font-size:1rem}}'
  ].join('\n');
  document.head.appendChild(cssTop);

  var btnTop = document.createElement('button');
  btnTop.id = 'scroll-top';
  btnTop.innerHTML = '↑';
  btnTop.setAttribute('aria-label', isEN ? 'Back to top' : 'Volver arriba');
  btnTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  document.body.appendChild(btnTop);

  var ticking = false;
  window.addEventListener('scroll', function(){
    if(!ticking){
      ticking = true;
      requestAnimationFrame(function(){
        btnTop.classList.toggle('show', window.scrollY > 600);
        ticking = false;
      });
    }
  }, {passive:true});

  /* ══════════════════════════════════════════════
     3. NEWSLETTER SLIDE-IN CTA (at 60% scroll)
     ══════════════════════════════════════════════ */
  var STORAGE_KEY = 'cj_newsletter_dismissed';
  if(!localStorage.getItem(STORAGE_KEY)){
    var cssCta = document.createElement('style');
    cssCta.textContent = [
      '#nl-slidein{position:fixed;bottom:-300px;right:28px;width:340px;background:rgba(11,18,32,.97);border:1px solid rgba(249,115,22,.25);border-radius:16px;padding:24px;z-index:950;transition:bottom .5s cubic-bezier(.22,.68,0,1);box-shadow:0 8px 32px rgba(0,0,0,.5);backdrop-filter:blur(12px)}',
      '#nl-slidein.show{bottom:28px}',
      '#nl-slidein .nl-close{position:absolute;top:10px;right:14px;background:none;border:none;color:#64748b;font-size:1.2rem;cursor:pointer;padding:4px}',
      '#nl-slidein .nl-close:hover{color:#f97316}',
      '#nl-slidein h4{margin:0 0 6px;color:#fff;font-size:1rem;font-weight:800}',
      '#nl-slidein p{margin:0 0 14px;color:#94a3b8;font-size:.82rem;line-height:1.5}',
      '#nl-slidein .nl-form{display:flex;gap:8px}',
      '#nl-slidein input{flex:1;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font-size:.85rem;outline:none;transition:border-color .2s}',
      '#nl-slidein input:focus{border-color:rgba(249,115,22,.5)}',
      '#nl-slidein button.nl-btn{padding:10px 18px;border-radius:10px;border:none;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:.82rem;font-weight:700;cursor:pointer;transition:transform .2s;white-space:nowrap}',
      '#nl-slidein button.nl-btn:hover{transform:scale(1.04)}',
      '#nl-slidein .nl-ok{text-align:center;color:#22c55e;font-weight:700;font-size:.9rem;padding:8px 0}',
      '@media(max-width:640px){#nl-slidein{right:12px;left:12px;width:auto}}'
    ].join('\n');
    document.head.appendChild(cssCta);

    var slidein = document.createElement('div');
    slidein.id = 'nl-slidein';
    slidein.innerHTML = '<button class="nl-close" aria-label="'+(isEN ? 'Close' : 'Cerrar')+'">&times;</button>' +
      '<h4>'+(isEN ? 'Train smarter every week' : 'Entrena mejor cada semana')+'</h4>' +
      '<p>'+(isEN ? 'Free running, nutrition & gear tips in your inbox. No spam.' : 'Consejos de running, nutrici\u00f3n y equipamiento gratis en tu email. Sin spam.')+'</p>' +
      '<div class="nl-form">' +
        '<input type="email" placeholder="'+(isEN ? 'Your email' : 'Tu email')+'" aria-label="Email">' +
        '<button class="nl-btn">'+(isEN ? 'Subscribe' : 'Suscribir')+'</button>' +
      '</div>';
    document.body.appendChild(slidein);

    var shown = false;
    var dismissed = false;
    // 60-second fallback timer
    var nlTimer = setTimeout(function(){
      if(!dismissed && !shown){
        shown = true;
        slidein.classList.add('show');
      }
    }, 60000);
    window.addEventListener('scroll', function(){
      if(dismissed) return;
      var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if(pct > 0.85 && !shown){
        shown = true;
        slidein.classList.add('show');
        clearTimeout(nlTimer);
      }
    }, {passive:true});

    slidein.querySelector('.nl-close').addEventListener('click', function(){
      slidein.classList.remove('show');
      dismissed = true;
      clearTimeout(nlTimer);
      localStorage.setItem(STORAGE_KEY, '1');
    });

    slidein.querySelector('.nl-btn').addEventListener('click', function(){
      var input = slidein.querySelector('input');
      var btn = slidein.querySelector('.nl-btn');
      var email = input.value.trim();
      if(!email || email.indexOf('@') < 1) { input.style.borderColor='#ef4444'; return; }
      btn.disabled = true; btn.textContent = '...';
      fetch('/api/brevo-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, lang: isEN ? 'en' : 'es', source: 'blog-slidein-' + slug })
      }).then(function(r){ return r.ok || r.status === 201 || r.status === 409; })
        .catch(function(){ return true; })
        .then(function(){
          var welcomeLinks = isEN
            ? '<a href="/blog/en/couch-to-5k-plan">Couch to 5K Plan</a><a href="/blog/en/running-motivation-tips">Motivation Tips</a><a href="/blog/en/find-people-to-run-with">Find Running Partners</a>'
            : '<a href="/blog/de-cero-a-5k">De 0 a 5K</a><a href="/blog/motivacion-para-correr">Motivaci\u00f3n para Correr</a><a href="/blog/encontrar-gente-para-correr">Encontrar Gente</a>';
          slidein.querySelector('.nl-form').innerHTML =
            '<div class="nl-ok" style="text-align:center">' +
              '<div style="font-size:1.3rem;margin-bottom:4px">🎉</div>' +
              (isEN ? 'Welcome! Check your inbox.' : '\u00a1Bienvenido/a! Revisa tu email.') +
              '<div style="margin-top:12px;font-size:.78rem;color:#94a3b8;font-weight:400">' +
                (isEN ? 'While you wait, try these:' : 'Mientras tanto, lee estos:') +
              '</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px">' + welcomeLinks + '</div>' +
            '</div>';
          slidein.querySelectorAll('.nl-ok a').forEach(function(a){
            a.style.cssText = 'color:#f97316;font-size:.78rem;padding:4px 10px;border:1px solid rgba(249,115,22,.2);border-radius:999px;text-decoration:none;white-space:nowrap';
          });
          localStorage.setItem(STORAGE_KEY, '1');
          setTimeout(function(){ slidein.classList.remove('show'); dismissed = true; }, 8000);
        });
    });
  }

  /* ══════════════════════════════════════════════
     4. READING PROGRESS BAR (handled by toc.js)
     ══════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════
     5. HIDE STATIC "SIGUE LEYENDO" (replaced by dynamic related.js)
     ══════════════════════════════════════════════ */
  var staticRelated = document.querySelector('.related');
  if(staticRelated) staticRelated.style.display = 'none';

  /* ══════════════════════════════════════════════
     6. GA4 EVENT TRACKING
     ══════════════════════════════════════════════ */
  var slug = location.pathname.replace(/\/$/,'').split('/').pop() || 'index';

  function trackEvent(name, params){
    if(typeof gtag === 'function') gtag('event', name, params || {});
  }

  /* 6a. Scroll depth tracking (50% + 100%) */
  var fired50 = false, fired100 = false;
  window.addEventListener('scroll', function(){
    var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if(!fired50 && pct >= 0.5){ fired50 = true; trackEvent('scroll_50', {article_slug: slug}); }
    if(!fired100 && pct >= 0.95){ fired100 = true; trackEvent('scroll_100', {article_slug: slug}); }
  }, {passive:true});

  /* 6b. CTA click tracking (delegated) */
  document.addEventListener('click', function(e){
    var link = e.target.closest('a');
    if(!link) return;

    /* Affiliate clicks */
    if(link.href && link.href.indexOf('amazon') !== -1){
      var card = link.closest('.shoe-card');
      var prodName = card ? (card.querySelector('h3') || {}).textContent || '' : '';
      trackEvent('affiliate_click', {product_name: prodName.substring(0,60), article_slug: slug});
      return;
    }

    /* CTA clicks */
    var loc = null;
    if(link.closest('.cta-mid')) loc = 'mid';
    else if(link.closest('.cta-box')) loc = 'final';
    else if(link.closest('#sticky-cta')) loc = 'sticky';
    if(loc) trackEvent('cta_click', {cta_location: loc, article_slug: slug});

    /* Related article clicks */
    if(link.closest('.related-section')) trackEvent('related_click', {target_slug: link.href.split('/').pop(), article_slug: slug});
  });

  /* 6c. Newsletter submit tracking */
  document.addEventListener('submit', function(e){
    var form = e.target;
    if(form.id === 'newsletter-form' || form.id === 'nl-form'){
      trackEvent('newsletter_submit', {form_location: 'inline', article_slug: slug});
    }
  });
  /* Slide-in newsletter (button click, no form submit) */
  var nlSlideBtn = document.querySelector('#nl-slidein .nl-btn');
  if(nlSlideBtn){
    nlSlideBtn.addEventListener('click', function(){
      trackEvent('newsletter_submit', {form_location: 'slidein', article_slug: slug});
    });
  }

  /* 6c-bis. Enhance inline newsletter success with recommendations */
  var nlSuccessEl = document.getElementById('newsletter-success');
  if(nlSuccessEl){
    var observer = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        if(m.attributeName === 'style' && nlSuccessEl.style.display !== 'none'){
          var recLinks = isEN
            ? '<a href="/blog/en/couch-to-5k-plan">Couch to 5K</a><a href="/blog/en/running-motivation-tips">Motivation Tips</a><a href="/blog/en/find-people-to-run-with">Find Partners</a>'
            : '<a href="/blog/de-cero-a-5k">De 0 a 5K</a><a href="/blog/motivacion-para-correr">Motivaci\u00f3n</a><a href="/blog/encontrar-gente-para-correr">Encontrar Gente</a>';
          if(!nlSuccessEl.querySelector('.nl-recs')){
            var recsDiv = document.createElement('div');
            recsDiv.className = 'nl-recs';
            recsDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px';
            recsDiv.innerHTML = recLinks;
            recsDiv.querySelectorAll('a').forEach(function(a){
              a.style.cssText = 'color:#f97316;font-size:.78rem;padding:4px 10px;border:1px solid rgba(249,115,22,.2);border-radius:999px;text-decoration:none;white-space:nowrap';
            });
            nlSuccessEl.appendChild(recsDiv);
          }
          observer.disconnect();
        }
      });
    });
    observer.observe(nlSuccessEl, { attributes: true, attributeFilter: ['style'] });
  }

  /* 6d. FAQ toggle tracking */
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.faq-q');
    if(btn && !btn.classList.contains('open')){
      var qText = (btn.querySelector('span') || btn).textContent.substring(0,50);
      trackEvent('faq_toggle', {question: qText, article_slug: slug});
    }
  });

  /* ══════════════════════════════════════════════
     7. AUTO-INJECT AFFILIATE DISCLOSURE
     ══════════════════════════════════════════════ */
  (function(){
    /* Only inject if page has Amazon affiliate links */
    var amazonLinks = document.querySelectorAll('a[href*="amzn.to"], a[href*="amazon.es"], a[href*="amazon.com"]');
    if(amazonLinks.length === 0) return;

    /* Check if disclosure already exists (manual HTML block) */
    var existing = document.querySelector('.affiliate-disclaimer');
    if(existing) return;
    var bodyText = document.body.textContent || '';
    if(bodyText.indexOf('Nota de afiliados') !== -1 || bodyText.indexOf('enlaces de afiliado') !== -1) return;

    /* Build disclosure block */
    var disclosure = document.createElement('div');
    disclosure.className = 'affiliate-disclaimer';
    disclosure.style.cssText = 'max-width:720px;margin:0 auto;padding:20px 32px';
    disclosure.innerHTML = '<p style="font-size:.75rem;color:#475569;line-height:1.6;border-top:1px solid rgba(0,0,0,.08);padding-top:16px">' +
      '<strong>' + (isEN ? 'Affiliate disclosure:' : 'Nota de afiliados:') + '</strong> ' +
      (isEN
        ? 'Some links in this article are affiliate links. If you buy through them, we receive a small commission at no extra cost to you. This helps us keep CorrerJuntos free. We only recommend products we use or have personally tested.'
        : 'Algunos enlaces de este artículo son enlaces de afiliado. Si compras a través de ellos, recibimos una pequeña comisión sin coste adicional para ti. Esto nos ayuda a mantener CorrerJuntos y seguir creando contenido útil. Solo recomendamos productos que usamos o hemos probado personalmente.'
      ) + '</p>';

    /* Insert before footer */
    var footer = document.querySelector('footer');
    if(footer){
      footer.parentNode.insertBefore(disclosure, footer);
    } else {
      document.body.appendChild(disclosure);
    }
  })();

  /* ══════════════════════════════════════════════
     8. ENHANCED AFFILIATE + APP STORE TRACKING
     ══════════════════════════════════════════════ */
  (function(){
    document.addEventListener('click', function(e){
      var link = e.target.closest('a');
      if(!link || !link.href) return;

      /* App Store install tracking */
      if(link.href.indexOf('apps.apple.com') !== -1 || link.href.indexOf('play.google.com') !== -1){
        var ctaParent = link.closest('.cta-box') ? 'final' :
                        link.closest('.cta-mid') ? 'mid' :
                        link.closest('#sticky-cta') ? 'sticky' :
                        link.closest('.app-card') ? 'inline' : 'other';
        trackEvent('app_install_click', {
          store: link.href.indexOf('apple') !== -1 ? 'ios' : 'android',
          cta_location: ctaParent,
          article_slug: slug
        });
      }

      /* Enhanced affiliate: track position in article */
      if(link.href.indexOf('amzn.to') !== -1 || link.href.indexOf('amazon') !== -1){
        var allAffLinks = document.querySelectorAll('a[href*="amzn.to"], a[href*="amazon"]');
        var pos = -1;
        for(var i=0;i<allAffLinks.length;i++){ if(allAffLinks[i]===link){ pos=i+1; break; } }
        var card = link.closest('.app-card, .shoe-card, .product-card, [class*="card"]');
        var prodTitle = card ? (card.querySelector('h3') || {}).textContent || '' : '';
        var btnText = link.textContent.trim().substring(0,40);
        trackEvent('affiliate_click_enhanced', {
          product_name: prodTitle.substring(0,60),
          button_text: btnText,
          position: pos,
          total_links: allAffLinks.length,
          article_slug: slug
        });
      }
    });
  })();

  /* ══════════════════════════════════════════════
     9. STICKY MOBILE CTA
     ══════════════════════════════════════════════ */
  var STICKY_KEY = 'cj_sticky_dismissed';
  var stickyDismissed = localStorage.getItem(STICKY_KEY);
  /* Check if dismiss has expired (7 days) */
  if(stickyDismissed && Date.now() - parseInt(stickyDismissed,10) > 7*24*60*60*1000){
    localStorage.removeItem(STICKY_KEY);
    stickyDismissed = null;
  }

  if(!stickyDismissed && window.innerWidth < 768){
    var cssSticky = document.createElement('style');
    cssSticky.textContent = [
      '#sticky-cta{position:fixed;bottom:0;left:0;right:0;z-index:890;background:linear-gradient(135deg,rgba(11,18,32,.97),rgba(11,18,32,.95));border-top:1px solid rgba(249,115,22,.25);padding:10px 16px;display:flex;align-items:center;gap:10px;transform:translateY(100%);transition:transform .4s cubic-bezier(.22,.68,0,1);backdrop-filter:blur(12px)}',
      '#sticky-cta.show{transform:translateY(0)}',
      '#sticky-cta.hidden{transform:translateY(100%)}',
      '#sticky-cta a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:.88rem;font-weight:700;border-radius:12px;text-decoration:none;white-space:nowrap}',
      '#sticky-cta a:active{transform:scale(.97)}',
      '#sticky-cta .sticky-close{background:none;border:none;color:#64748b;font-size:1.1rem;cursor:pointer;padding:6px;flex-shrink:0}',
      '#sticky-cta .sticky-close:hover{color:#f97316}'
    ].join('\n');
    document.head.appendChild(cssSticky);

    var sticky = document.createElement('div');
    sticky.id = 'sticky-cta';
    // Detect platform for correct store link
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var isAndroid = /Android/.test(navigator.userAgent);
    var storeUrl = isAndroid
      ? 'https://play.google.com/store/apps/details?id=com.correrjuntos.app'
      : 'https://apps.apple.com/us/app/correr-juntos/id6758505910';
    var storeLabel = isAndroid
      ? (isEN ? 'Download the app' : 'Descargar la app')
      : (isEN ? 'Download the app' : 'Descargar la app');
    sticky.innerHTML =
      '<a href="' + storeUrl + '" target="_blank" rel="noopener">' +
        '\uD83D\uDCF2 ' + storeLabel +
      '</a>' +
      '<button class="sticky-close" aria-label="'+(isEN ? 'Close' : 'Cerrar')+'">&times;</button>';
    document.body.appendChild(sticky);

    /* Show after 3s of any scroll */
    var stickyShown = false;
    var stickyScrollTimer = null;
    window.addEventListener('scroll', function(){
      if(stickyShown) return;
      if(!stickyScrollTimer){
        stickyScrollTimer = setTimeout(function(){
          if(window.scrollY > 200){
            stickyShown = true;
            sticky.classList.add('show');
          } else { stickyScrollTimer = null; }
        }, 3000);
      }
    }, {passive:true});

    /* Hide when newsletter slide-in is visible */
    var nlSlidein = document.getElementById('nl-slidein');
    if(nlSlidein){
      var observer = new MutationObserver(function(){
        sticky.classList.toggle('hidden', nlSlidein.classList.contains('show'));
      });
      observer.observe(nlSlidein, {attributes:true, attributeFilter:['class']});
    }

    /* Dismiss */
    sticky.querySelector('.sticky-close').addEventListener('click', function(){
      sticky.classList.remove('show');
      sticky.classList.add('hidden');
      localStorage.setItem(STICKY_KEY, String(Date.now()));
      trackEvent('sticky_cta_dismiss', {article_slug: slug});
    });

    /* Track sticky CTA click */
    sticky.querySelector('a').addEventListener('click', function(){
      trackEvent('cta_click', {cta_location: 'sticky', article_slug: slug});
    });
  }

})();
