/* Blog enhancements — FAQ accordion + scroll-to-top + newsletter slide-in */
(function(){
  'use strict';

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
        '.faq-q{display:flex;justify-content:space-between;align-items:center;width:100%;padding:16px 18px;margin:0 0 2px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;color:#e2e8f0;font-size:.92rem;font-weight:700;text-align:left;cursor:pointer;transition:all .2s;line-height:1.4}',
        '.faq-q:hover{background:rgba(255,255,255,.07);border-color:rgba(249,115,22,.25)}',
        '.faq-q.open{background:rgba(249,115,22,.08);border-color:rgba(249,115,22,.3);border-radius:12px 12px 0 0;margin-bottom:0}',
        '.faq-chevron{font-size:.75rem;color:#64748b;transition:transform .25s;flex-shrink:0;margin-left:12px}',
        '.faq-q.open .faq-chevron{transform:rotate(180deg);color:#f97316}',
        '.faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s ease;padding:0 18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-top:none;border-radius:0 0 12px 12px;margin:0 0 8px}',
        '.faq-a.open{max-height:600px;padding:14px 18px}',
        '.faq-a p{margin:0;color:#94a3b8;font-size:.88rem;line-height:1.65}',
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
  btnTop.setAttribute('aria-label','Volver arriba');
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
  });

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
    slidein.innerHTML = '<button class="nl-close" aria-label="Cerrar">&times;</button>' +
      '<h4>Entrena mejor cada semana</h4>' +
      '<p>Consejos de running, nutrici\u00f3n y equipamiento gratis en tu email. Sin spam.</p>' +
      '<div class="nl-form">' +
        '<input type="email" placeholder="Tu email" aria-label="Email">' +
        '<button class="nl-btn">Suscribir</button>' +
      '</div>';
    document.body.appendChild(slidein);

    var shown = false;
    var dismissed = false;
    window.addEventListener('scroll', function(){
      if(dismissed) return;
      var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if(pct > 0.55 && !shown){
        shown = true;
        slidein.classList.add('show');
      }
    });

    slidein.querySelector('.nl-close').addEventListener('click', function(){
      slidein.classList.remove('show');
      dismissed = true;
      localStorage.setItem(STORAGE_KEY, '1');
    });

    slidein.querySelector('.nl-btn').addEventListener('click', function(){
      var input = slidein.querySelector('input');
      var email = input.value.trim();
      if(!email || email.indexOf('@') < 1) { input.style.borderColor='#ef4444'; return; }
      slidein.querySelector('.nl-form').innerHTML = '<div class="nl-ok">Suscrito — gracias!</div>';
      localStorage.setItem(STORAGE_KEY, '1');
      setTimeout(function(){ slidein.classList.remove('show'); dismissed = true; }, 2500);
    });
  }

})();
