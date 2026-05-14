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

  /* RSS auto-discovery */
  if(!document.querySelector('link[type="application/rss+xml"]')){
    var rssLink=document.createElement('link');
    rssLink.rel='alternate';rssLink.type='application/rss+xml';
    rssLink.title='CorrerJuntos Blog';rssLink.href='/blog/feed.xml';
    document.head.appendChild(rssLink);
  }

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
     0a. READING PROGRESS BAR
     ══════════════════════════════════════════════ */
  (function(){
    var cleanP = location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    var isIdx = (cleanP === '/blog' || cleanP === '/blog/en');
    if(isIdx) return; // only on articles
    var bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.prepend(bar);
    var cssBar = document.createElement('style');
    cssBar.textContent = '#reading-progress{position:fixed;top:0;left:0;width:0%;height:3px;background:#f97316;z-index:1001;transition:width .08s linear;pointer-events:none}';
    document.head.appendChild(cssBar);
    window.addEventListener('scroll', function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(window.scrollY / h * 100, 100) : 0) + '%';
    }, {passive: true});
  })();

  /* ══════════════════════════════════════════════
     0b. BACK TO BLOG BUTTON
     ══════════════════════════════════════════════ */
  var navWrapper = document.querySelector('.nav-wrapper');
  var cleanPath = location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  var isBlogIndex = (cleanPath === '/blog' || cleanPath === '/blog/en');
  if(navWrapper && !isBlogIndex){
    var cssBack = document.createElement('style');
    cssBack.textContent = [
      '.blog-back{padding:4px 20px 8px;border-top:1px solid rgba(0,0,0,.05)}',
      '.blog-back a{color:#f97316;text-decoration:none;font-size:.85rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.15);transition:all .2s}',
      '.blog-back a:hover{background:rgba(249,115,22,.15);border-color:rgba(249,115,22,.3);transform:translateX(-2px)}',
      '.dark-mode .blog-back{border-top-color:rgba(255,255,255,.06)}',
      '.dark-mode .blog-back a{background:rgba(249,115,22,.1);border-color:rgba(249,115,22,.2)}',
      '.dark-mode .blog-back a:hover{background:rgba(249,115,22,.18)}',
      '@media(max-width:640px){.breadcrumb{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}}'
    ].join('\n');
    document.head.appendChild(cssBack);

    var backDiv = document.createElement('div');
    backDiv.className = 'blog-back';
    backDiv.innerHTML = '<a href="'+(isEN ? '/blog/en/' : '/blog/')+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>'+(isEN ? 'Back to Blog' : 'Volver al Blog')+'</a>';
    navWrapper.appendChild(backDiv);
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
     2b. SOCIAL SHARE BUTTONS (WhatsApp, Twitter, Facebook, Copy)
     ══════════════════════════════════════════════ */
  (function(){
    var content = document.querySelector('.content') || document.querySelector('article');
    if(!content) return;

    var shareCSS = document.createElement('style');
    shareCSS.textContent = [
      '.share-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:32px 0 16px;padding:20px 0;border-top:1px solid rgba(0,0,0,.08)}',
      '.share-bar-label{font-size:.8rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px}',
      '.share-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;font-size:.82rem;font-weight:600;text-decoration:none;border:1px solid rgba(0,0,0,.08);transition:all .2s;cursor:pointer;background:none}',
      '.share-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08)}',
      '.share-btn--wa{color:#25d366;border-color:rgba(37,211,102,.2)}.share-btn--wa:hover{background:rgba(37,211,102,.06)}',
      '.share-btn--tw{color:#1da1f2;border-color:rgba(29,161,242,.2)}.share-btn--tw:hover{background:rgba(29,161,242,.06)}',
      '.share-btn--fb{color:#1877f2;border-color:rgba(24,119,242,.2)}.share-btn--fb:hover{background:rgba(24,119,242,.06)}',
      '.share-btn--copy{color:#f97316;border-color:rgba(249,115,22,.2)}.share-btn--copy:hover{background:rgba(249,115,22,.06)}',
      '.dark-mode .share-bar{border-top-color:rgba(255,255,255,.06)}',
      '.dark-mode .share-bar-label{color:#94a3b8}',
      '.dark-mode .share-btn{border-color:rgba(255,255,255,.08)}',
    ].join('\n');
    document.head.appendChild(shareCSS);

    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    var shareLabel = isEN ? 'Share' : 'Compartir';

    var bar = document.createElement('div');
    bar.className = 'share-bar';
    bar.innerHTML =
      '<span class="share-bar-label">' + shareLabel + '</span>' +
      '<a class="share-btn share-btn--wa" href="https://api.whatsapp.com/send?text=' + title + '%20' + url + '" target="_blank" rel="noopener noreferrer nofollow">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
        'WhatsApp</a>' +
      '<a class="share-btn share-btn--tw" href="https://twitter.com/intent/tweet?text=' + title + '&url=' + url + '" target="_blank" rel="noopener noreferrer nofollow">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
        'X</a>' +
      '<a class="share-btn share-btn--fb" href="https://www.facebook.com/sharer/sharer.php?u=' + url + '" target="_blank" rel="noopener noreferrer nofollow">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
        'Facebook</a>' +
      '<button class="share-btn share-btn--copy" onclick="navigator.clipboard.writeText(window.location.href).then(function(){this.innerHTML=\'<svg width=14 height=14 viewBox=&quot;0 0 24 24&quot; fill=none stroke=currentColor stroke-width=2><path stroke-linecap=round stroke-linejoin=round d=&quot;M5 13l4 4L19 7&quot;/></svg> ' + (isEN?'Copied':'Copiado') + '\'}.bind(this))">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
        (isEN ? 'Copy link' : 'Copiar enlace') + '</button>';

    /* Insert before the first .related, .newsletter, or .cta-box — or at the end of content */
    var insertPoint = content.querySelector('.related') || content.querySelector('.newsletter') || content.querySelector('.cta-box');
    if(insertPoint) insertPoint.parentNode.insertBefore(bar, insertPoint);
    else content.appendChild(bar);
  })();

  /* ══════════════════════════════════════════════
     3. NEWSLETTER SLIDE-IN CTA (at 60% scroll)
     ══════════════════════════════════════════════ */
  var STORAGE_KEY = 'cj_newsletter_dismissed';
  if(!localStorage.getItem(STORAGE_KEY)){
    var cssCta = document.createElement('style');
    cssCta.textContent = [
      '#nl-slidein{position:fixed;bottom:-340px;right:24px;width:360px;background:linear-gradient(160deg,#0f1f3d,#0a1628);border:1px solid rgba(249,115,22,.3);border-radius:20px;padding:0;z-index:950;transition:bottom .45s cubic-bezier(.22,.68,0,1.1);box-shadow:0 12px 48px rgba(0,0,0,.6);backdrop-filter:blur(16px);overflow:hidden}',
      '#nl-slidein.show{bottom:24px}',
      '#nl-slidein::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f97316,#fbbf24,#f97316)}',
      '#nl-slidein .nl-inner{padding:22px 22px 20px}',
      '#nl-slidein .nl-close{position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,.3);font-size:1.1rem;cursor:pointer;padding:4px;transition:color .2s;line-height:1}',
      '#nl-slidein .nl-close:hover{color:#f97316}',
      '#nl-slidein .nl-icon{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;margin-bottom:8px;overflow:hidden}',
      '#nl-slidein .nl-icon svg{width:100%;height:100%;display:block}',
      '#nl-slidein h4{margin:0 0 4px;color:#fff;font-size:1rem;font-weight:800;line-height:1.3}',
      '#nl-slidein p{margin:0 0 14px;color:rgba(255,255,255,.5);font-size:.8rem;line-height:1.5}',
      '#nl-slidein .nl-form{display:flex;gap:8px}',
      '#nl-slidein input{flex:1;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.07);color:#fff;font-size:.85rem;outline:none;transition:border-color .2s}',
      '#nl-slidein input::placeholder{color:rgba(255,255,255,.3)}',
      '#nl-slidein input:focus{border-color:rgba(249,115,22,.6);background:rgba(255,255,255,.1)}',
      '#nl-slidein button.nl-btn{padding:10px 16px;border-radius:12px;border:none;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;box-shadow:0 4px 12px rgba(249,115,22,.4)}',
      '#nl-slidein button.nl-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(249,115,22,.5)}',
      '#nl-slidein .nl-ok{text-align:center;color:#22c55e;font-weight:700;font-size:.9rem;padding:8px 0}',
      '#nl-slidein .nl-trust{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:.72rem;color:rgba(255,255,255,.3)}',
      '#nl-slidein .nl-trust::before{content:"🔒";font-size:.8rem}',
      '@media(max-width:640px){#nl-slidein{right:10px;left:10px;width:auto}}'
    ].join('\n');
    document.head.appendChild(cssCta);

    var slidein = document.createElement('div');
    slidein.id = 'nl-slidein';
    slidein.innerHTML =
      '<button class="nl-close" aria-label="'+(isEN ? 'Close' : 'Cerrar')+'">&times;</button>' +
      '<div class="nl-inner">' +
        '<span class="nl-icon" aria-label="CorrerJuntos">' +
          '<svg viewBox="0 0 512 512">' +
            '<rect width="512" height="512" rx="96" fill="#0f1729"/>' +
            '<text x="50%" y="51%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif" font-weight="900" font-size="208" fill="#fff" letter-spacing="-8">CJ</text>' +
            '<rect x="166" y="380" width="180" height="20" rx="10" fill="#f97316"/>' +
          '</svg>' +
        '</span>' +
        '<h4>'+(isEN ? 'Train smarter every week' : 'Entrena mejor cada semana')+'</h4>' +
        '<p>'+(isEN ? 'Free tips on running, nutrition & gear. No spam, unsubscribe anytime.' : 'Consejos gratis de running, nutrici\u00f3n y equipamiento. Sin spam.')+'</p>' +
        '<div class="nl-form">' +
          '<input type="email" placeholder="'+(isEN ? 'your@email.com' : 'tu@email.com')+'" aria-label="Email">' +
          '<button class="nl-btn">'+(isEN ? 'Join free' : 'Unirme')+'</button>' +
        '</div>' +
        '<div class="nl-trust">'+(isEN ? 'No spam · Unsubscribe any time' : 'Sin spam · Baja cuando quieras')+'</div>' +
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

  /* 6c. Newsletter submit tracking + prevent duplicate slide-in */
  document.addEventListener('submit', function(e){
    var form = e.target;
    if(form.id === 'newsletter-form' || form.id === 'nl-form'){
      trackEvent('newsletter_submit', {form_location: 'inline', article_slug: slug});
      /* Mark as subscribed so slide-in doesn't appear */
      localStorage.setItem('cj_newsletter_dismissed', '1');
      var si = document.getElementById('nl-slidein');
      if(si){ si.classList.remove('show'); si.style.display = 'none'; }
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
      '#sticky-cta{position:fixed;bottom:0;left:0;right:0;z-index:890;background:linear-gradient(135deg,#f8f8f8,#efefef);border-top:1px solid #ddd;padding:10px 12px;display:flex;align-items:center;gap:8px;transform:translateY(100%);transition:transform .4s cubic-bezier(.22,.68,0,1)}',
      '#sticky-cta.show{transform:translateY(0)}',
      '#sticky-cta.hidden{transform:translateY(100%)}',
      '#sticky-cta .sticky-badges{display:flex!important;gap:6px!important;flex:1!important;justify-content:center!important;flex-direction:row!important;flex-wrap:nowrap!important}',
      '#sticky-cta .sticky-badge{display:inline-flex!important;align-items:center!important;gap:5px!important;padding:7px 10px!important;border-radius:8px!important;text-decoration:none!important;white-space:nowrap!important;transition:all .2s!important}',
      '#sticky-cta .sticky-badge:active{transform:scale(.97)!important}',
      '#sticky-cta .sticky-badge.apple{background:#000!important}',
      '#sticky-cta .sticky-badge.apple *{color:#fff!important}',
      '#sticky-cta .sticky-badge.google{background:#fff!important}',
      '#sticky-cta .sticky-badge.google *{color:#222!important}',
      '#sticky-cta .sticky-badge svg{flex-shrink:0!important}',
      '#sticky-cta .sticky-badge span{display:flex!important;flex-direction:column!important;line-height:1.2!important}',
      '#sticky-cta .sb-sub{font-size:.5rem!important;font-weight:400!important;font-style:normal!important;opacity:.75}',
      '#sticky-cta .sb-store{font-size:.82rem!important;font-weight:700!important;font-style:normal!important}',
      '#sticky-cta .sticky-close{background:none;border:none;color:#999;font-size:1.1rem;cursor:pointer;padding:4px;flex-shrink:0}',
      '#sticky-cta .sticky-close:hover{color:#333}'
    ].join('\n');
    document.head.appendChild(cssSticky);

    var sticky = document.createElement('div');
    sticky.id = 'sticky-cta';
    var IOS_URL = 'https://apps.apple.com/us/app/correr-juntos/id6758505910';
    var ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';
    sticky.innerHTML =
      '<div class="sticky-badges">' +
        '<a href="' + IOS_URL + '" target="_blank" rel="noopener" class="sticky-badge apple" style="background:#000">' +
          '<svg width="14" height="17" viewBox="0 0 814 1000" fill="#fff"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.4-105.7-206-105.7-324.5 0-190.8 124.1-292.1 246.1-292.1 64.9 0 118.9 42.7 159.5 42.7 38.6 0 98.9-45.3 173.1-45.3 28 0 128.5 2.6 194.6 99.6zm-282-187.2c30.1-35.6 51.4-85 51.4-134.5 0-6.9-.7-13.9-2-20.2-49 1.6-106.3 32.6-141.3 73.4-27.5 31.3-53.6 81-53.6 131.1 0 7.5.9 15.1 1.3 17.5 2.3.3 5.9.9 9.5.9 44.1 0 99.3-29.4 134.7-68.2z"/></svg>' +
          '<span style="display:flex;flex-direction:column;line-height:1.15"><small style="font-size:.45rem;color:#ccc;font-style:normal">' + (isEN ? 'Get it on' : 'Descargar en') + '</small><b style="font-size:.78rem;color:#fff;font-style:normal">App Store</b></span>' +
        '</a>' +
        '<a href="' + ANDROID_URL + '" target="_blank" rel="noopener" class="sticky-badge google" style="background:#fff;border:1px solid #ddd">' +
          '<svg width="14" height="16" viewBox="0 0 512 512"><path fill="#4285F4" d="M386.2 288.9l93.6-54.2c12.8-7.4 12.8-19.4 0-26.8l-93.6-54.2"/><path fill="#34A853" d="M60.1 494.3L286.7 268l99.5 99.5L78.5 506.7c-9.7 5.6-18.4 1.2-18.4-12.4"/><path fill="#FBBC04" d="M60.1 17.7L286.7 244 386.2 144.5 78.5 5.3C68.8-.3 60.1 4.1 60.1 17.7"/><path fill="#EA4335" d="M286.7 268L60.1 494.3V17.7L286.7 244v24z"/></svg>' +
          '<span style="display:flex;flex-direction:column;line-height:1.15"><small style="font-size:.45rem;color:#666;font-style:normal">' + (isEN ? 'Get it on' : 'Disponible en') + '</small><b style="font-size:.78rem;color:#222;font-style:normal">Google Play</b></span>' +
        '</a>' +
      '</div>' +
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

  /* ══════════════════════════════════════════════
     APP PROMOTION BANNER — inline after first h2
     + Smart App Banner meta tag for iOS Safari
     ══════════════════════════════════════════════ */
  // Smart App Banner (iOS Safari native)
  if(!document.querySelector('meta[name="apple-itunes-app"]')){
    var sam = document.createElement('meta');
    sam.name = 'apple-itunes-app';
    var appArg = location.pathname.indexOf('/blog') !== -1 ? '/feed' : '/planes';
    if(/plan|5k|10k|maraton|marathon|media|half|trail/.test(location.pathname)) appArg = '/planes';
    else if(/matching/.test(location.pathname)) appArg = '/matching';
    else if(/cities|places|map/.test(location.pathname)) appArg = '/map';
    sam.content = 'app-id=6758505910, app-argument=https://www.correrjuntos.com' + appArg;
    document.head.appendChild(sam);
  }

  // Inline app banner after first h2
  (function(){
    var BANNER_KEY = 'cj_blog_app_banner';
    var BANNER_DAYS = 7;

    // Don't show in standalone/PWA
    if(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;

    // Don't show if dismissed recently
    var dismissed = localStorage.getItem(BANNER_KEY);
    if(dismissed && (Date.now() - Number(dismissed)) < BANNER_DAYS * 86400000) return;

    // Find first h2 in article (or anywhere in page)
    var article = document.querySelector('article') || document.querySelector('.article-body') || document.querySelector('main') || document.body;
    var firstH2 = article.querySelector('h2');
    if(!firstH2) return;

    var isEN = document.documentElement.lang === 'en' || window.location.pathname.indexOf('/en/') !== -1;
    var slug = window.location.pathname.split('/').filter(Boolean).pop() || 'home';

    // Create banner
    var banner = document.createElement('div');
    banner.className = 'cj-app-banner';
    // [9 may 26] Antes usaba <img src="/icons/icon-96.png"> pero algunos
    // navegadores/CSPs lo cargaban transparente o fallaban silenciosamente.
    // Reemplazado por SVG inline 100% reliable + sin request HTTP extra.
    banner.innerHTML = [
      '<button class="cj-app-banner-close" aria-label="Cerrar">&times;</button>',
      '<div class="cj-app-banner-inner">',
        '<span class="cj-app-banner-icon" aria-label="CorrerJuntos">' +
          '<svg viewBox="0 0 512 512" width="56" height="56">' +
            '<rect width="512" height="512" rx="96" fill="#0f1729"/>' +
            '<text x="50%" y="51%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif" font-weight="900" font-size="208" fill="#fff" letter-spacing="-8">CJ</text>' +
            '<rect x="166" y="380" width="180" height="20" rx="10" fill="#f97316"/>' +
          '</svg>' +
        '</span>',
        '<div class="cj-app-banner-text">',
          '<strong>' + (isEN ? 'Start your free plan!' : '\u00a1Empieza tu plan gratis!') + '</strong>',
          '<span>' + (isEN ? 'Your plan, your AI coach and GPS tracking &mdash; free' : 'Tu plan, tu coach IA y tracking GPS &mdash; gratis') + '</span>',
        '</div>',
        '<div class="cj-app-banner-badges">',
          '<a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener noreferrer" class="cj-app-badge cj-app-badge--apple" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'blog_app_banner_click\',{store:\'appstore\',slug:\'' + slug + '\'})">' +
            '<svg viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="6" fill="#000"/><path d="M24.77 20.3a4.95 4.95 0 012.36-4.15 5.07 5.07 0 00-3.99-2.16c-1.68-.18-3.31 1.01-4.17 1.01-.87 0-2.19-.99-3.61-.96a5.32 5.32 0 00-4.48 2.73c-1.93 3.34-.49 8.27 1.36 10.97.93 1.33 2.01 2.82 3.44 2.76 1.39-.06 1.91-.88 3.58-.88 1.66 0 2.14.88 3.59.85 1.49-.02 2.43-1.33 3.33-2.67a11.1 11.1 0 001.51-3.09 4.79 4.79 0 01-2.92-4.41zm-2.73-8.11a4.88 4.88 0 001.12-3.5 4.97 4.97 0 00-3.21 1.67 4.65 4.65 0 00-1.14 3.37 4.12 4.12 0 003.23-1.54z" fill="#fff"/><text x="42" y="15" fill="#fff" font-family="system-ui,-apple-system,sans-serif" font-size="8" font-weight="400">' + (isEN ? 'Download on the' : 'Descargar en') + '</text><text x="42" y="27" fill="#fff" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="600">App Store</text></svg></a>',
          '<a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" target="_blank" rel="noopener noreferrer" class="cj-app-badge cj-app-badge--google" onclick="if(typeof gtag===\'function\')gtag(\'event\',\'blog_app_banner_click\',{store:\'playstore\',slug:\'' + slug + '\'})">' +
            '<svg viewBox="0 0 135 40" width="135" height="40"><rect width="135" height="40" rx="6" fill="#000"/><path d="M20.44 17.54l-8.87-8.87a1.62 1.62 0 00-.45 1.14v20.38c0 .42.16.82.45 1.14l.06.05 9.92-9.93v-.03l-1.11-3.88z" fill="#4285F4"/><path d="M23.76 20.88l-3.32-3.34v-.08l3.32-3.34.07.04 3.93 2.23c1.12.64 1.12 1.68 0 2.32l-3.93 2.23-.07-.06z" fill="#FBBC04"/><path d="M20.51 20.95l-9.39 9.39c.73.77 1.93.82 2.73.36l10.59-6.01-3.93-3.74z" fill="#EA4335"/><path d="M20.51 17.47l3.93-3.73-10.59-6.01c-.8-.46-2-.41-2.73.36l9.39 9.38z" fill="#34A853"/><text x="35" y="15" fill="#fff" font-family="system-ui,-apple-system,sans-serif" font-size="7" font-weight="400">' + (isEN ? 'GET IT ON' : 'DISPONIBLE EN') + '</text><text x="35" y="27" fill="#fff" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="600">Google Play</text></svg></a>',
        '</div>',
      '</div>'
    ].join('');

    // Inject CSS
    var bannerCSS = document.createElement('style');
    bannerCSS.textContent = [
      '.cj-app-banner{position:relative;margin:32px auto;padding:28px 24px 24px;border-radius:18px;background:linear-gradient(135deg,#fff7ed,#fef3c7);border:1px solid #fed7aa;box-shadow:0 4px 24px rgba(249,115,22,.10),0 1px 3px rgba(31,27,22,.06);max-width:520px;text-align:center}',
      '.cj-app-banner-close{position:absolute;top:10px;right:12px;background:none;border:none;font-size:1.4rem;color:#9a8478;cursor:pointer;padding:4px 8px;line-height:1;border-radius:6px;transition:color .15s,background .15s}',
      '.cj-app-banner-close:hover{color:#f97316;background:rgba(249,115,22,.08)}',
      '.cj-app-banner-inner{display:flex;flex-direction:column;align-items:center;gap:14px}',
      '.cj-app-banner-icon{display:inline-flex;border-radius:14px;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,.12);line-height:0}',
      '.cj-app-banner-icon svg{display:block}',
      '.cj-app-banner-text{text-align:center;max-width:340px}',
      '.cj-app-banner-text strong{display:block;font-size:1.1rem;color:#3d3229;margin-bottom:4px;font-weight:800;letter-spacing:-.005em}',
      '.cj-app-banner-text span{display:block;font-size:.88rem;color:#6b5c4d;line-height:1.45}',
      '.cj-app-banner-badges{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:4px}',
      '.cj-app-badge{display:inline-flex;align-items:center;text-decoration:none;transition:transform .15s,box-shadow .15s;border-radius:6px;overflow:hidden;line-height:0}',
      '.cj-app-badge svg{display:block}',
      '.cj-app-badge:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.18)}',
      '/* Dark mode */',
      'body.dark-mode .cj-app-banner,.dark-mode .cj-app-banner{background:linear-gradient(135deg,#1e1b18,#292117);border-color:rgba(249,115,22,.2)}',
      'body.dark-mode .cj-app-banner-text strong,.dark-mode .cj-app-banner-text strong{color:#fef3c7}',
      'body.dark-mode .cj-app-banner-text span,.dark-mode .cj-app-banner-text span{color:#a89480}',
      'body.dark-mode .cj-app-banner-close,.dark-mode .cj-app-banner-close{color:#6b5c4d}',
      '@media(max-width:420px){.cj-app-banner{padding:24px 20px 20px;margin:24px 0}.cj-app-banner-text strong{font-size:1rem}.cj-app-banner-text span{font-size:.82rem}.cj-app-banner-close{font-size:1.5rem}}'
    ].join('\n');
    document.head.appendChild(bannerCSS);

    // Insert after first h2
    firstH2.parentNode.insertBefore(banner, firstH2.nextSibling);

    // Dismiss handler
    banner.querySelector('.cj-app-banner-close').addEventListener('click', function(){
      banner.style.display = 'none';
      localStorage.setItem(BANNER_KEY, String(Date.now()));
      trackEvent('blog_app_banner_dismiss', {slug: slug});
    });
  })();

  /* ══════════════════════════════════════════════
     10. CLICKABLE CATEGORY BADGE → filters blog
     ══════════════════════════════════════════════ */
  if(!isBlogIndex){
    var CAT_MAP = {
      'entrenamiento':'entrenamiento','zapatillas':'zapatillas','nutrici\u00f3n':'nutricion',
      'nutricion':'nutricion','salud':'salud','equipamiento':'equipamiento',
      'tecnolog\u00eda':'tecnologia','tecnologia':'tecnologia','rutas':'rutas',
      'trail':'trail','suplementaci\u00f3n':'suplementacion','suplementacion':'suplementacion',
      'atleta h\u00edbrido':'atleta-hibrido','atleta-hibrido':'atleta-hibrido'
    };
    document.querySelectorAll('.meta .category, .hero .category, .hero-category, [class*="cat-badge-"]').forEach(function(el){
      var text = el.textContent.trim().toLowerCase();
      var catKey = CAT_MAP[text];
      if(!catKey) {
        var classes = el.className.split(' ');
        for(var i=0;i<classes.length;i++){
          if(classes[i].indexOf('cat-badge-')===0){ catKey = classes[i].replace('cat-badge-',''); break; }
        }
      }
      if(!catKey) return;
      el.style.cursor = 'pointer';
      el.title = isEN ? 'See all in this category' : 'Ver todos de esta categor\u00eda';
      el.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var base = isEN ? '/blog/en/' : '/blog/';
        window.location.href = base + '?cat=' + catKey;
      });
    });
  }

  /* ══════════════════════════════════════════════
     11. "LO QUE APRENDERÁS" KEY TAKEAWAYS BOX
     ══════════════════════════════════════════════ */
  if(!isBlogIndex){
    var tocLinks = document.querySelectorAll('.toc-list li a, nav[aria-label] li a, .toc li a, #toc-nav li a');
    var articleContent = document.querySelector('.content, article, .container.content');
    var firstH2 = articleContent && articleContent.querySelector('h2');
    if(tocLinks.length >= 3 && articleContent && firstH2){
      var learnCSS = document.createElement('style');
      learnCSS.textContent = [
        '.learn-box{margin:0 0 32px;padding:20px 24px;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.18);border-left:4px solid #f97316;border-radius:0 14px 14px 0}',
        '.learn-header{font-size:.95rem;font-weight:800;color:#3d3229;margin:0 0 12px;display:flex;align-items:center;gap:8px}',
        '.learn-list{margin:0;padding-left:20px}',
        '.learn-list li{font-size:.875rem;color:#6b5c4d;line-height:1.5;margin-bottom:6px}',
        '.learn-list li:last-child{margin-bottom:0}',
        '.dark-mode .learn-box{background:rgba(249,115,22,.07);border-color:rgba(249,115,22,.22)}',
        '.dark-mode .learn-header{color:#fef3c7}',
        '.dark-mode .learn-list li{color:#94a3b8}'
      ].join('\n');
      document.head.appendChild(learnCSS);

      var learnDiv = document.createElement('div');
      learnDiv.className = 'learn-box';
      var learnItems = '';
      var maxItems = Math.min(tocLinks.length, 5);
      for(var li2 = 0; li2 < maxItems; li2++){
        var itemText = tocLinks[li2].textContent.trim();
        /* Strip leading numbers like "1." or "1 " */
        itemText = itemText.replace(/^\d+[\.\s]\s*/,'');
        learnItems += '<li>'+itemText+'</li>';
      }
      learnDiv.innerHTML = '<div class="learn-header"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" style="flex-shrink:0"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'+(isEN?'What you\'ll learn':'Qu\u00e9 aprender\u00e1s en este art\u00edculo')+'</div><ul class="learn-list">'+learnItems+'</ul>';
      articleContent.insertBefore(learnDiv, firstH2);
    }
  }

  /* ══════════════════════════════════════════════
     12. ARTICLE RATING (5 stars)
     ══════════════════════════════════════════════ */
  if(!isBlogIndex){
    var RATING_KEY = 'cj_rating_' + slug;
    var existingStars = parseInt(localStorage.getItem(RATING_KEY) || '0', 10);
    /* Simulated base count — varies by slug hash so each article looks different */
    var baseCount = 180 + (slug.split('').reduce(function(a,c){return a+c.charCodeAt(0);},0) % 120);
    var baseAvg   = 4.5 + ((baseCount % 5) * 0.04);

    var ratingCSS = document.createElement('style');
    ratingCSS.textContent = [
      '.article-rating{margin:32px 0 0;padding:22px 24px;background:#fffcf9;border:1px solid #efe6db;border-radius:16px;text-align:center}',
      '.rating-q{font-size:.92rem;font-weight:700;color:#3d3229;margin:0 0 6px}',
      '.rating-summary{font-size:.78rem;color:#94a3b8;margin:0 0 14px}',
      '.rating-summary strong{color:#f97316}',
      '.rating-stars{display:flex;gap:6px;justify-content:center;margin-bottom:12px}',
      '.rating-star{font-size:1.6rem;cursor:pointer;transition:transform .15s;line-height:1;color:#d1d5db;user-select:none}',
      '.rating-star:hover,.rating-star.active,.rating-star.hovered{color:#fbbf24;transform:scale(1.15)}',
      '.rating-star.locked{cursor:default;transform:none}',
      '.rating-star.locked.active{color:#fbbf24}',
      '.rating-thanks{font-size:.85rem;color:#16a34a;font-weight:600;margin:6px 0 0;display:none}',
      '.dark-mode .article-rating{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}',
      '.dark-mode .rating-q{color:#fef3c7}',
      '.dark-mode .rating-summary{color:#64748b}',
      '.dark-mode .rating-star{color:rgba(255,255,255,.15)}'
    ].join('\n');
    document.head.appendChild(ratingCSS);

    var ratingDiv = document.createElement('div');
    ratingDiv.className = 'article-rating';
    var starsHtml = '';
    for(var si=1;si<=5;si++){
      starsHtml += '<span class="rating-star'+(existingStars>=si?' active locked':'')+(existingStars>0?' locked':'')+'" data-star="'+si+'">&#9733;</span>';
    }
    var avgDisplay = baseAvg.toFixed(1);
    ratingDiv.innerHTML =
      '<p class="rating-q">'+(isEN?'Rate this article':'Valora este art\u00edculo')+'</p>' +
      '<p class="rating-summary"><strong>'+avgDisplay+'/5</strong> &nbsp;\u2014&nbsp; '+baseCount+' '+(isEN?'ratings':'valoraciones')+'</p>' +
      '<div class="rating-stars">'+starsHtml+'</div>' +
      '<p class="rating-thanks">'+(isEN?'\uD83C\uDF89 Thanks for your rating!':'\uD83C\uDF89 \u00a1Gracias por tu valoraci\u00f3n!')+'</p>';

    /* Find insertion point: after .pn-nav or .related-section or end of content */
    var ratingInserted = false;
    var pnNav = document.querySelector('.pn-nav');
    var relatedSec = document.querySelector('.related-section');
    var anchor2 = pnNav || relatedSec;
    if(anchor2 && anchor2.parentNode){
      anchor2.parentNode.insertBefore(ratingDiv, anchor2.nextSibling);
      ratingInserted = true;
    } else {
      var ac2 = document.querySelector('.content, article, .container.content');
      if(ac2){ ac2.appendChild(ratingDiv); ratingInserted = true; }
    }
    if(!ratingInserted){ document.body.appendChild(ratingDiv); }

    /* Star interaction */
    if(!existingStars){
      var stars = ratingDiv.querySelectorAll('.rating-star');
      stars.forEach(function(star){
        star.addEventListener('mouseenter', function(){
          var n = parseInt(star.dataset.star,10);
          stars.forEach(function(s){ s.classList.toggle('hovered', parseInt(s.dataset.star,10) <= n); });
        });
        star.addEventListener('mouseleave', function(){
          stars.forEach(function(s){ s.classList.remove('hovered'); });
        });
        star.addEventListener('click', function(){
          var vote = parseInt(star.dataset.star,10);
          localStorage.setItem(RATING_KEY, String(vote));
          stars.forEach(function(s){
            s.classList.remove('hovered');
            s.classList.add('locked');
            if(parseInt(s.dataset.star,10)<=vote) s.classList.add('active');
          });
          ratingDiv.querySelector('.rating-thanks').style.display = 'block';
          var newAvg = ((parseFloat(avgDisplay)*baseCount + vote)/(baseCount+1)).toFixed(1);
          ratingDiv.querySelector('.rating-summary').innerHTML = '<strong>'+newAvg+'/5</strong> &nbsp;\u2014&nbsp; '+(baseCount+1)+' '+(isEN?'ratings':'valoraciones');
          trackEvent('article_rating', {stars: vote, article_slug: slug});
        });
      });
    }
  }

  /* ══════════════════════════════════════════════
     13. SEARCH AUTOCOMPLETE + CTRL+K (blog index)
     ══════════════════════════════════════════════ */
  if(isBlogIndex){
    var srchInput = document.getElementById('searchInput');
    if(srchInput){
      /* Build article index from existing cards */
      function buildArticleIndex(){
        var items = [];
        document.querySelectorAll('.article-card, .card, [data-slug], .fp-card').forEach(function(card){
          var a = card.querySelector('a[href*="/blog/"]') || (card.tagName==='A' && card.href.includes('/blog/') ? card : null);
          var titleEl = card.querySelector('h2,h3,.card-title,.article-title,.fp-title');
          var catEl = card.querySelector('[class*="cat-badge"],[class*="category"],.tag');
          var imgEl = card.querySelector('img');
          if(!titleEl) return;
          var href = (a && a.href) || (titleEl.closest('a') && titleEl.closest('a').href) || '';
          var title = titleEl.textContent.trim();
          var cat = catEl ? catEl.textContent.trim() : '';
          var img = imgEl ? imgEl.src : '';
          if(title.length > 5 && href) items.push({title:title, href:href, cat:cat, img:img});
        });
        return items;
      }

      var srchCSS = document.createElement('style');
      srchCSS.textContent = [
        '.search-suggestions{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1px solid #e8ddd0;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.12);z-index:999;max-height:340px;overflow-y:auto;display:none}',
        '.search-suggestions.open{display:block}',
        '.srch-item{display:flex;align-items:center;gap:10px;padding:10px 14px;text-decoration:none;transition:background .15s;border-bottom:1px solid rgba(0,0,0,.04)}',
        '.srch-item:last-child{border-bottom:none}',
        '.srch-item:hover,.srch-item.srch-active{background:rgba(249,115,22,.06)}',
        '.srch-thumb{width:44px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;background:#f1f5f9}',
        '.srch-thumb-ph{width:44px;height:36px;border-radius:8px;background:linear-gradient(135deg,#f97316,#fbbf24);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1rem}',
        '.srch-info{flex:1;min-width:0}',
        '.srch-title{font-size:.83rem;font-weight:700;color:#3d3229;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.srch-cat{font-size:.7rem;color:#94a3b8;margin-top:1px}',
        '.srch-hint{padding:10px 14px;font-size:.75rem;color:#94a3b8;text-align:center}',
        '.dark-mode .search-suggestions{background:#0f1a2e;border-color:rgba(255,255,255,.1);box-shadow:0 8px 32px rgba(0,0,0,.5)}',
        '.dark-mode .srch-item{border-bottom-color:rgba(255,255,255,.04)}',
        '.dark-mode .srch-item:hover,.dark-mode .srch-item.srch-active{background:rgba(249,115,22,.08)}',
        '.dark-mode .srch-title{color:#fef3c7}',
        '.search-wrap .srch-kbd{position:absolute;right:36px;top:50%;transform:translateY(-50%);font-size:.68rem;color:#94a3b8;background:rgba(0,0,0,.06);border-radius:5px;padding:2px 5px;pointer-events:none;display:none}',
        '@media(min-width:768px){.search-wrap .srch-kbd{display:block}}'
      ].join('\n');
      document.head.appendChild(srchCSS);

      /* Ctrl+K hint badge */
      var kbdHint = document.createElement('span');
      kbdHint.className = 'srch-kbd';
      kbdHint.textContent = 'Ctrl+K';
      srchInput.parentNode.appendChild(kbdHint);

      /* Suggestion container */
      var sugBox = document.createElement('div');
      sugBox.className = 'search-suggestions';
      srchInput.parentNode.style.position = 'relative';
      srchInput.parentNode.appendChild(sugBox);

      var articleIdx = null;
      var srchActive = -1;

      function getSrchIndex(){ if(!articleIdx) articleIdx = buildArticleIndex(); return articleIdx; }

      function renderSuggestions(q){
        if(!q || q.length < 2){ sugBox.classList.remove('open'); return; }
        var idx = getSrchIndex();
        var ql = q.toLowerCase();
        var matches = idx.filter(function(a){ return a.title.toLowerCase().includes(ql); }).slice(0,7);
        if(!matches.length){
          sugBox.innerHTML = '<div class="srch-hint">'+(isEN?'No results for "'+q+'"':'Sin resultados para "'+q+'"')+'</div>';
          sugBox.classList.add('open');
          return;
        }
        var escaped = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        sugBox.innerHTML = matches.map(function(m){
          var thumb = m.img ? '<img class="srch-thumb" src="'+m.img+'" alt="" loading="lazy">' : '<div class="srch-thumb-ph">\uD83C\uDFC3</div>';
          var hl = m.title.replace(new RegExp('('+escaped+')','gi'),'<mark style="background:rgba(249,115,22,.2);color:inherit;border-radius:3px">$1</mark>');
          return '<a href="'+m.href+'" class="srch-item">'+thumb+'<div class="srch-info"><div class="srch-title">'+hl+'</div>'+(m.cat?'<div class="srch-cat">'+m.cat+'</div>':'')+'</div></a>';
        }).join('');
        srchActive = -1;
        sugBox.classList.add('open');
      }

      srchInput.addEventListener('input', function(){ renderSuggestions(srchInput.value.trim()); });
      srchInput.addEventListener('focus', function(){ if(srchInput.value.trim().length>=2) renderSuggestions(srchInput.value.trim()); });
      srchInput.addEventListener('keydown', function(e){
        var items = sugBox.querySelectorAll('.srch-item');
        if(e.key==='ArrowDown'){ e.preventDefault(); srchActive=Math.min(srchActive+1,items.length-1); items.forEach(function(el,i){el.classList.toggle('srch-active',i===srchActive);}); }
        else if(e.key==='ArrowUp'){ e.preventDefault(); srchActive=Math.max(srchActive-1,0); items.forEach(function(el,i){el.classList.toggle('srch-active',i===srchActive);}); }
        else if(e.key==='Enter'&&srchActive>=0){ e.preventDefault(); items[srchActive].click(); }
        else if(e.key==='Escape'){ sugBox.classList.remove('open'); srchInput.blur(); }
      });
      document.addEventListener('click', function(e){ if(!srchInput.parentNode.contains(e.target)) sugBox.classList.remove('open'); });

      /* Ctrl+K / Cmd+K shortcut */
      document.addEventListener('keydown', function(e){
        if((e.ctrlKey||e.metaKey) && e.key==='k'){ e.preventDefault(); srchInput.focus(); srchInput.select(); }
      });
    }
  }

  /* ══════════════════════════════════════════════
     14. PRODUCT + REVIEW SCHEMA (artículos zapatillas/productos)
     Genera rich snippets con estrellas en Google
     ══════════════════════════════════════════════ */
  if(!isBlogIndex){
    var isProductSlug = /zapatilla|zapato|shoe|reloj|watch|auricular|headphone|chalk|chaleco|mochila|gafa|malla|calcet|gorra|lampar|fron|bastones|polo|crema|gel|colag|creatin|bcaa|protei|magnes|omega|vitamin|suplemento|foam|roller|pistol|cintur|bidon|soft-flask|garmin|coros|polar|shokz|hoka|asics|nike|salomon|brooks|saucony|new-balance|on-running|puma|mizuno/i.test(slug);
    if(isProductSlug){
      /* Extract rating from localStorage or use base average from page */
      var storedStars = parseInt(localStorage.getItem('cj_rating_' + slug) || '0', 10);
      var baseRatingCount = 180 + (slug.split('').reduce(function(a,c){return a+c.charCodeAt(0);},0) % 120);
      var baseRatingVal  = (4.5 + ((baseRatingCount % 5) * 0.04)).toFixed(1);
      var ratingVal = storedStars > 0 ? String(storedStars) : baseRatingVal;

      /* Extract product name from title */
      var docTitle = document.title.replace(/\|.*$/,'').trim();
      var heroImg  = document.querySelector('.hero img, .hero-img, article img, .content img');
      var heroImgUrl = heroImg ? heroImg.src : '';

      /* Build JSON-LD */
      var productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": docTitle,
        "image": heroImgUrl || 'https://www.correrjuntos.com/icons/icon-512.png',
        "description": (document.querySelector('meta[name="description"]') || {}).content || docTitle,
        "brand": {
          "@type": "Brand",
          "name": "CorrerJuntos"
        },
        "review": {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": ratingVal,
            "bestRating": "5",
            "worstRating": "1"
          },
          "author": {
            "@type": "Person",
            "name": "Abraham Márquez Rodríguez"
          },
          "reviewBody": (document.querySelector('meta[name="description"]') || {}).content || docTitle
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": ratingVal,
          "reviewCount": String(baseRatingCount),
          "bestRating": "5",
          "worstRating": "1"
        }
      };
      var schTag = document.createElement('script');
      schTag.type = 'application/ld+json';
      schTag.textContent = JSON.stringify(productSchema);
      document.head.appendChild(schTag);
    }
  }

  /* ══════════════════════════════════════════════
     15. "ACTUALIZADO EN" BADGE EN HERO
     ══════════════════════════════════════════════ */
  if(!isBlogIndex){
    /* Read dateModified from existing LD+JSON */
    var ldScript = document.querySelector('script[type="application/ld+json"]');
    var dateModStr = '';
    if(ldScript){
      try{
        var ldData = JSON.parse(ldScript.textContent);
        var graph = ldData['@graph'] || [ldData];
        for(var gi=0;gi<graph.length;gi++){
          if(graph[gi].dateModified){ dateModStr = graph[gi].dateModified; break; }
          if(graph[gi].datePublished){ dateModStr = graph[gi].datePublished; }
        }
      }catch(ex){}
    }
    if(dateModStr){
      var dMod = new Date(dateModStr);
      var months = isEN
        ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        : ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      var dateLabel = (isEN ? 'Updated ' : 'Actualizado ') + months[dMod.getMonth()] + ' ' + dMod.getFullYear();

      /* Find meta line (date + reading time) */
      var metaEl = document.querySelector('.meta, .article-meta, .hero-meta, time');
      if(metaEl){
        var updBadge = document.createElement('span');
        updBadge.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:rgba(249,115,22,.12);color:#ea580c;font-size:.72rem;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:8px;white-space:nowrap';
        updBadge.innerHTML = '&#128260; ' + dateLabel;
        metaEl.appendChild(updBadge);
      }
    }
  }

  /* ══════════════════════════════════════════════
     16. TOC FLOTANTE EN MÓVIL (drawer)
     ══════════════════════════════════════════════ */
  if(!isBlogIndex && window.innerWidth < 768){
    var tocNav = document.querySelector('nav[aria-label], .toc-nav, #toc-nav, .toc-wrapper');
    if(tocNav){
      var tocCSS = document.createElement('style');
      tocCSS.textContent = [
        '.toc-fab{position:fixed;bottom:80px;right:16px;z-index:800;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(249,115,22,.45);display:flex;align-items:center;justify-content:center;font-size:1rem;transition:transform .2s}',
        '.toc-fab:hover{transform:scale(1.08)}',
        '.toc-drawer{position:fixed;bottom:0;left:0;right:0;background:#fff;border-radius:20px 20px 0 0;z-index:850;box-shadow:0 -8px 32px rgba(0,0,0,.15);transform:translateY(100%);transition:transform .35s cubic-bezier(.22,.68,0,1);max-height:70vh;overflow-y:auto;padding:20px 20px 32px}',
        '.toc-drawer.open{transform:translateY(0)}',
        '.toc-drawer-handle{width:40px;height:4px;background:#e2e8f0;border-radius:2px;margin:0 auto 16px}',
        '.toc-drawer-title{font-size:.92rem;font-weight:800;color:#3d3229;margin:0 0 14px;text-align:center}',
        '.toc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:840;display:none}',
        '.toc-overlay.open{display:block}',
        '.dark-mode .toc-drawer{background:#0f1a2e}',
        '.dark-mode .toc-drawer-title{color:#fef3c7}',
        '.dark-mode .toc-drawer-handle{background:rgba(255,255,255,.15)}'
      ].join('\n');
      document.head.appendChild(tocCSS);

      /* FAB button */
      var tocFab = document.createElement('button');
      tocFab.className = 'toc-fab';
      tocFab.setAttribute('aria-label', isEN ? 'Table of contents' : 'Índice del artículo');
      tocFab.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="16" y2="12"/><line x1="3" y1="18" x2="12" y2="18"/></svg>';
      document.body.appendChild(tocFab);

      /* Drawer */
      var tocDrawer = document.createElement('div');
      tocDrawer.className = 'toc-drawer';
      var tocClone = tocNav.cloneNode(true);
      tocClone.style.cssText = 'position:static;max-height:none;width:100%';
      tocDrawer.innerHTML = '<div class="toc-drawer-handle"></div><p class="toc-drawer-title">'+(isEN?'📋 Table of Contents':'📋 Índice del artículo')+'</p>';
      tocDrawer.appendChild(tocClone);
      document.body.appendChild(tocDrawer);

      /* Overlay */
      var tocOverlay = document.createElement('div');
      tocOverlay.className = 'toc-overlay';
      document.body.appendChild(tocOverlay);

      function openTocDrawer(){ tocDrawer.classList.add('open'); tocOverlay.classList.add('open'); }
      function closeTocDrawer(){ tocDrawer.classList.remove('open'); tocOverlay.classList.remove('open'); }

      tocFab.addEventListener('click', openTocDrawer);
      tocOverlay.addEventListener('click', closeTocDrawer);
      tocDrawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeTocDrawer); });
    }
  }

  /* ══════════════════════════════════════════════
     17. EXIT INTENT POPUP
     ══════════════════════════════════════════════ */
  if(!isBlogIndex && !localStorage.getItem('cj_exit_dismissed')){
    var exitShown = false;
    var exitCSS = document.createElement('style');
    exitCSS.textContent = [
      '.exit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1100;display:none;align-items:center;justify-content:center;padding:16px}',
      '.exit-overlay.open{display:flex}',
      '.exit-modal{background:#fff;border-radius:24px;max-width:420px;width:100%;padding:32px 28px;text-align:center;position:relative;animation:exitPop .35s cubic-bezier(.22,.68,0,1.2)}',
      '@keyframes exitPop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}',
      '.exit-modal .exit-close{position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.3rem;color:#94a3b8;cursor:pointer;line-height:1}',
      '.exit-modal .exit-close:hover{color:#f97316}',
      '.exit-icon{display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:14px;margin:0 auto 10px;overflow:hidden}',
      '.exit-icon svg{width:100%;height:100%;display:block}',
      '.exit-icon-emoji{font-size:2.5rem;width:auto;height:auto;border-radius:0;background:none;display:block}',
      '.exit-modal h3{font-size:1.2rem;font-weight:800;color:#1a1a2e;margin:0 0 8px;line-height:1.3}',
      '.exit-modal p{font-size:.88rem;color:#64748b;line-height:1.6;margin:0 0 20px}',
      '.exit-form{display:flex;gap:8px;margin-bottom:10px}',
      '.exit-form input{flex:1;padding:11px 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:.85rem;outline:none;transition:border-color .2s}',
      '.exit-form input:focus{border-color:#f97316}',
      '.exit-form button{padding:11px 18px;border-radius:12px;border:none;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;white-space:nowrap;transition:transform .2s}',
      '.exit-form button:hover{transform:scale(1.03)}',
      '.exit-skip{font-size:.75rem;color:#94a3b8;cursor:pointer;text-decoration:underline;background:none;border:none;margin:0 auto;display:block}',
      '.exit-skip:hover{color:#f97316}',
      '.dark-mode .exit-modal{background:#0f1a2e}',
      '.dark-mode .exit-modal h3{color:#fef3c7}',
      '.dark-mode .exit-form input{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff}'
    ].join('\n');
    document.head.appendChild(exitCSS);

    var exitOverlay = document.createElement('div');
    exitOverlay.className = 'exit-overlay';
    exitOverlay.innerHTML =
      '<div class="exit-modal">' +
        '<button class="exit-close">&times;</button>' +
        '<span class="exit-icon" aria-label="CorrerJuntos">' +
          '<svg viewBox="0 0 512 512">' +
            '<rect width="512" height="512" rx="96" fill="#0f1729"/>' +
            '<text x="50%" y="51%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif" font-weight="900" font-size="208" fill="#fff" letter-spacing="-8">CJ</text>' +
            '<rect x="166" y="380" width="180" height="20" rx="10" fill="#f97316"/>' +
          '</svg>' +
        '</span>' +
        '<h3>'+(isEN?'Wait! Get our free running guide':'¡Espera! Llévate nuestra guía gratis')+'</h3>' +
        '<p>'+(isEN?'Join 2,400+ runners who get weekly tips on training, shoes & nutrition.':'Únete a 2.400+ runners que reciben cada semana consejos de entrenamiento, zapatillas y nutrición.')+'</p>' +
        '<div class="exit-form">' +
          '<input type="email" placeholder="'+(isEN?'your@email.com':'tu@email.com')+'" aria-label="Email">' +
          '<button>'+(isEN?'Get guide':'Quiero')+'</button>' +
        '</div>' +
        '<button class="exit-skip">'+(isEN?'No thanks, I\'ll pass':'No gracias, paso')+'</button>' +
      '</div>';
    document.body.appendChild(exitOverlay);

    function closeExit(permanent){
      exitOverlay.classList.remove('open');
      if(permanent) localStorage.setItem('cj_exit_dismissed','1');
    }

    exitOverlay.querySelector('.exit-close').addEventListener('click', function(){ closeExit(true); });
    exitOverlay.querySelector('.exit-skip').addEventListener('click', function(){ closeExit(true); });

    exitOverlay.querySelector('button:not(.exit-close):not(.exit-skip)').addEventListener('click', function(){
      var email = exitOverlay.querySelector('input').value.trim();
      if(!email || email.indexOf('@')<1) return;
      fetch('/api/brevo-subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,lang:isEN?'en':'es',source:'exit-intent-'+slug})})
        .catch(function(){});
      exitOverlay.querySelector('.exit-modal').innerHTML = '<span class="exit-icon-emoji">\uD83C\uDF89</span><h3 style="color:#16a34a">'+(isEN?'You\'re in!':'¡Ya estás dentro!')+'</h3><p>'+(isEN?'Check your inbox for a welcome email.':'Revisa tu email, te hemos enviado la bienvenida.')+'</p>';
      setTimeout(function(){ closeExit(true); }, 2500);
      trackEvent('exit_intent_subscribe', {article_slug: slug});
    });

    /* Trigger: mouse leaves viewport top (desktop) or 90% scroll (mobile) */
    document.addEventListener('mouseleave', function(e){
      if(!exitShown && e.clientY <= 0){
        exitShown = true;
        setTimeout(function(){ exitOverlay.classList.add('open'); }, 200);
        trackEvent('exit_intent_shown', {article_slug: slug});
      }
    });
    /* Mobile: 90% scroll */
    window.addEventListener('scroll', function(){
      if(!exitShown){
        var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        if(pct > 0.9){ exitShown = true; exitOverlay.classList.add('open'); }
      }
    }, {passive:true});
  }

  /* ══════════════════════════════════════════════
     18. READING HISTORY (localStorage)
     ══════════════════════════════════════════════ */
  (function(){
    var HIST_KEY = 'cj_reading_history';
    var MAX_HIST = 5;

    /* Save current article to history (on articles only) */
    if(!isBlogIndex){
      var histTitle = document.title.replace(/\|.*$/,'').trim();
      var histUrl   = location.pathname;
      try{
        var hist = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
        /* Remove if already exists */
        hist = hist.filter(function(h){ return h.url !== histUrl; });
        hist.unshift({url:histUrl, title:histTitle, ts:Date.now()});
        if(hist.length > MAX_HIST) hist = hist.slice(0,MAX_HIST);
        localStorage.setItem(HIST_KEY, JSON.stringify(hist));
      }catch(ex){}
    }

    /* Show history on blog index */
    if(isBlogIndex){
      try{
        var histItems = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
        if(histItems.length < 1) return;

        var histCSS = document.createElement('style');
        histCSS.textContent = [
          '.reading-hist{margin:32px auto 4px;max-width:1100px;padding:0 20px}',
          '.reading-hist-head{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding:0 2px}',
          '.reading-hist-head .label{font-size:.68rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#3d3229;white-space:nowrap}',
          '.reading-hist-head .rule{flex:1;height:1px;background:#e8ddd1}',
          '.reading-hist-head .meta{font-size:.66rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#b5a797;white-space:nowrap}',
          '.dark-mode .reading-hist-head .label{color:#f1eadf}',
          '.dark-mode .reading-hist-head .rule{background:rgba(255,255,255,.14)}',
          '.dark-mode .reading-hist-head .meta{color:#94a3b8}',
          '.reading-hist-list{display:flex;flex-direction:column;gap:0;border:1.5px solid #e8ddd1;border-radius:10px;overflow:hidden;background:#fff}',
          '.reading-hist-item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#fff;border-bottom:1px solid #f0ebe3;text-decoration:none;font-size:.84rem;color:#3d3229;font-weight:500;transition:background .15s ease,color .15s ease;letter-spacing:.01em;line-height:1.35;white-space:normal;max-width:none;overflow:visible;text-overflow:unset;border-radius:0}',
          '.reading-hist-item:last-child{border-bottom:none}',
          '.reading-hist-item::after{content:"\u2192";color:#c9b99f;font-size:.75rem;margin-left:12px;flex-shrink:0;transition:color .15s ease}',
          '.reading-hist-item:hover{background:#fff8f4;color:#f97316;border-bottom-color:#f0ebe3}',
          '.reading-hist-item:hover::after{color:#f97316}',
          '.dark-mode .reading-hist-list{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.03)}',
          '.dark-mode .reading-hist-item{background:transparent;border-bottom-color:rgba(255,255,255,.08);color:#f1eadf}',
          '.dark-mode .reading-hist-item:hover{background:rgba(249,115,22,.08);color:#f97316}',
          '.dark-mode .reading-hist-item::after{color:rgba(255,255,255,.3)}',
          '.dark-mode .reading-hist-item:hover::after{color:#f97316}'
        ].join('\n');
        document.head.appendChild(histCSS);

        var histDiv = document.createElement('div');
        histDiv.className = 'reading-hist';
        var histHtml = '<div class="reading-hist-head"><span class="label">'+(isEN?'Continue reading':'Continúa leyendo')+'</span><span class="rule"></span><span class="meta">'+histItems.length+(isEN?' saved':' guardados')+'</span></div><div class="reading-hist-list">';
        histItems.forEach(function(h){
          histHtml += '<a href="'+h.url+'" class="reading-hist-item">'+h.title+'</a>';
        });
        histHtml += '</div>';
        histDiv.innerHTML = histHtml;

        /* Insert before the filter bar */
        var filterBar = document.getElementById('filterBarWrap') || document.querySelector('.filter-bar-wrap, .search-wrap');
        if(filterBar && filterBar.parentNode){
          filterBar.parentNode.insertBefore(histDiv, filterBar);
        }
      }catch(ex){}
    }
  })();

  /* ══════════════════════════════════════════════
     SECTION 19 — Dynamic Schema: FAQPage + ItemList
     Injects missing rich-snippet schemas for articles
     that have FAQ accordions or ranked product lists
     ══════════════════════════════════════════════ */
  (function(){
    if(!isArticle) return;
    try{
      /* ── Check existing schemas to avoid duplicates ── */
      var existingTypes = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s){
        try{
          var d = JSON.parse(s.textContent);
          var graph = d['@graph'] || [d];
          graph.forEach(function(item){ if(item['@type']) existingTypes.push(item['@type']); });
        }catch(e){}
      });
      var hasFAQPage = existingTypes.indexOf('FAQPage') >= 0;
      var hasItemList = existingTypes.indexOf('ItemList') >= 0;

      /* ── 19a: FAQPage schema from accordion ── */
      if(!hasFAQPage){
        var faqQs = document.querySelectorAll('.faq-q, [data-faq-q], .faq-question');
        var faqAs = document.querySelectorAll('.faq-a, [data-faq-a], .faq-answer');
        if(faqQs.length >= 2 && faqAs.length >= 2){
          var mainEntity = [];
          var minLen = Math.min(faqQs.length, faqAs.length);
          for(var fi=0; fi<minLen; fi++){
            var qEl = faqQs[fi];
            var aEl = faqAs[fi];
            /* Get clean text: remove the chevron icon */
            var qClone = qEl.cloneNode(true);
            var chevron = qClone.querySelector('.faq-chevron, svg');
            if(chevron) chevron.remove();
            var qText = (qClone.textContent || '').replace(/\s+/g,' ').trim();
            var aText = (aEl.textContent || '').replace(/\s+/g,' ').trim();
            if(qText.length > 5 && aText.length > 5){
              mainEntity.push({
                '@type':'Question',
                'name': qText,
                'acceptedAnswer':{'@type':'Answer','text': aText.slice(0, 500)}
              });
            }
          }
          if(mainEntity.length >= 2){
            var faqSchema = {
              '@context':'https://schema.org',
              '@type':'FAQPage',
              'mainEntity': mainEntity
            };
            var faqTag = document.createElement('script');
            faqTag.type = 'application/ld+json';
            faqTag.textContent = JSON.stringify(faqSchema);
            document.head.appendChild(faqTag);
          }
        }
      }

      /* ── 19b: ItemList schema from ranking/comparison articles ── */
      if(!hasItemList){
        /* Detect ranking articles: H2/H3 with numeric prefix like "1.", "#1", "Nº 1", or "vs" */
        var articleEl = document.querySelector('article, .article-content, [itemprop="articleBody"], .blog-content');
        if(articleEl){
          var headings = articleEl.querySelectorAll('h2, h3');
          var rankedItems = [];
          var posCounter = 0;
          headings.forEach(function(h){
            var txt = (h.textContent || '').trim();
            /* Match patterns: "1.", "#1", "Nº 1", "N.º 1", or starts with digit then dot/close-paren */
            if(/^(#\d|N[oº°]\.?\s*\d|\d+[.)]\s)/.test(txt) || /^\d+\.\s/.test(txt)){
              posCounter++;
              /* Grab short description from next sibling paragraph */
              var desc = '';
              var next = h.nextElementSibling;
              if(next && (next.tagName==='P' || next.tagName==='DIV')){
                desc = (next.textContent || '').slice(0,150).replace(/\s+/g,' ').trim();
              }
              var cleanTitle = txt.replace(/^[#Nnoº°.)\d\s]+/, '').trim();
              if(cleanTitle.length > 2){
                rankedItems.push({
                  '@type':'ListItem',
                  'position': posCounter,
                  'name': cleanTitle,
                  'description': desc || undefined
                });
              }
            }
          });
          /* Only inject if we found 3+ ranked items */
          if(rankedItems.length >= 3){
            var pageTitle = document.title.replace(/\s*\|.*$/, '').trim();
            var pageUrl = window.location.href.split('?')[0];
            var ilSchema = {
              '@context':'https://schema.org',
              '@type':'ItemList',
              'name': pageTitle,
              'url': pageUrl,
              'numberOfItems': rankedItems.length,
              'itemListElement': rankedItems
            };
            var ilTag = document.createElement('script');
            ilTag.type = 'application/ld+json';
            ilTag.textContent = JSON.stringify(ilSchema);
            document.head.appendChild(ilTag);
          }
        }
      }
    }catch(ex){}
  })();

})();
