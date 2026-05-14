/* ===================================================================
 * CorrerJuntos — Newsletter capture system v1
 *
 * Inyecta 4 puntos de contacto para captura de email en el blog:
 *   1. Sticky bar superior (40px, dismissible)
 *   2. Exit-intent popup (desktop on mouseleave, mobile on 75% scroll)
 *   3. Mid-article inline form (tras párrafo #3)
 *   4. End-of-article CTA (antes de related links)
 *
 * Anti-spam:
 *   - Skip si el user ya está suscrito (cookie cj_nl_subscribed)
 *   - Sticky: dismiss 7 días
 *   - Exit-intent: dismiss 30 días + 1 vez por sesión
 *   - Detecta si existe form de newsletter en footer → no duplica
 *
 * Backend: POST /api/brevo-subscribe { email, lang, source }
 *   Brevo DOI flow + welcome email
 *
 * Carga en: blog articles, blog index
 * No carga en: homepage (tiene su propio sistema)
 * =================================================================== */

(function(){
  'use strict';

  if(window.__cjNewsletterLoaded) return;
  window.__cjNewsletterLoaded = true;

  /* ── State ── */
  var STORAGE = {
    SUBSCRIBED: 'cj_nl_subscribed',
    STICKY_HIDE_UNTIL: 'cj_nl_sticky_until',
    EXIT_HIDE_UNTIL: 'cj_nl_exit_until',
    EXIT_SESSION: 'cj_nl_exit_session'
  };
  var DAY = 24 * 60 * 60 * 1000;

  function isSubscribed(){
    try { return localStorage.getItem(STORAGE.SUBSCRIBED) === '1'; } catch(e){ return false; }
  }
  function markSubscribed(){
    try { localStorage.setItem(STORAGE.SUBSCRIBED, '1'); } catch(e){}
  }
  function isDismissed(key){
    try {
      var until = parseInt(localStorage.getItem(key) || '0', 10);
      return until > Date.now();
    } catch(e){ return false; }
  }
  function dismissFor(key, days){
    try { localStorage.setItem(key, String(Date.now() + days * DAY)); } catch(e){}
  }
  function shownThisSession(key){
    try { return sessionStorage.getItem(key) === '1'; } catch(e){ return false; }
  }
  function markShownThisSession(key){
    try { sessionStorage.setItem(key, '1'); } catch(e){}
  }

  /* ── GA4 tracking ── */
  function track(event, params){
    if(typeof gtag === 'function'){
      gtag('event', event, params || {});
    }
  }

  /* ── Brevo subscribe ── */
  function subscribe(email, source){
    return fetch('/api/brevo-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, lang: 'es', source: source || 'blog-newsletter' })
    });
  }

  /* ── Inject CSS once ── */
  var STYLE_INJECTED = false;
  function injectStyles(){
    if(STYLE_INJECTED) return;
    STYLE_INJECTED = true;
    var css = document.createElement('style');
    css.id = 'cj-nl-styles';
    css.textContent = [
      /* Sticky bar */
      '.cj-nl-sticky{position:fixed;top:0;left:0;right:0;z-index:150;background:linear-gradient(90deg,#1f1b16 0%,#2d251c 100%);color:#fef7ed;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:14px;font-family:Inter,sans-serif;font-size:.88rem;font-weight:500;box-shadow:0 2px 12px rgba(0,0,0,.18);transform:translateY(-100%);transition:transform .4s cubic-bezier(.4,0,.2,1);flex-wrap:wrap}',
      '.cj-nl-sticky.show{transform:translateY(0)}',
      '.cj-nl-sticky strong{color:#fb923c;font-weight:700}',
      '.cj-nl-sticky form{display:flex;gap:6px;align-items:center}',
      '.cj-nl-sticky input{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;padding:7px 12px;border-radius:8px;font-size:.85rem;outline:none;width:200px;font-family:inherit}',
      '.cj-nl-sticky input::placeholder{color:rgba(255,255,255,.5)}',
      '.cj-nl-sticky input:focus{background:rgba(255,255,255,.15);border-color:#fb923c}',
      '.cj-nl-sticky button{background:#f97316;color:#fff;border:none;padding:7px 16px;border-radius:8px;font-weight:700;font-size:.85rem;cursor:pointer;transition:background .2s;font-family:inherit}',
      '.cj-nl-sticky button:hover{background:#ea580c}',
      '.cj-nl-sticky .cj-close{background:transparent;border:none;color:rgba(255,255,255,.6);cursor:pointer;font-size:1.1rem;padding:4px 8px;line-height:1;margin-left:auto}',
      '.cj-nl-sticky .cj-close:hover{color:#fff}',
      '.cj-nl-sticky .cj-msg-ok{color:#4ade80;font-weight:600;font-size:.85rem}',
      '@media(max-width:640px){.cj-nl-sticky{font-size:.78rem;padding:8px 12px}.cj-nl-sticky input{width:140px;font-size:.78rem;padding:6px 10px}.cj-nl-sticky button{font-size:.78rem;padding:6px 12px}}',

      /* Exit-intent popup */
      '.cj-nl-overlay{position:fixed;inset:0;background:rgba(11,18,32,.65);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .25s;pointer-events:none}',
      '.cj-nl-overlay.show{opacity:1;pointer-events:auto}',
      '.cj-nl-modal{background:#fff;border-radius:20px;max-width:480px;width:100%;padding:36px 32px;box-shadow:0 24px 64px rgba(0,0,0,.3);transform:scale(.92);transition:transform .3s cubic-bezier(.4,0,.2,1);position:relative;font-family:Inter,sans-serif}',
      '.cj-nl-overlay.show .cj-nl-modal{transform:scale(1)}',
      '.cj-nl-modal .cj-modal-eyebrow{font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;color:#f97316;font-weight:800;margin-bottom:12px}',
      '.cj-nl-modal h3{font-size:1.6rem;color:#1f1b16;margin:0 0 12px;line-height:1.2;font-weight:900;letter-spacing:-.02em}',
      '.cj-nl-modal h3 em{font-style:normal;color:#f97316}',
      '.cj-nl-modal p{color:#5c4d3d;line-height:1.55;font-size:.95rem;margin:0 0 20px}',
      '.cj-nl-modal .cj-benefits{list-style:none;padding:0;margin:0 0 22px}',
      '.cj-nl-modal .cj-benefits li{padding:6px 0 6px 26px;position:relative;color:#3d3229;font-size:.9rem;line-height:1.5}',
      '.cj-nl-modal .cj-benefits li::before{content:"";position:absolute;left:0;top:10px;width:14px;height:14px;background:#10b981;border-radius:50%;background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'><path d=\'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\'/></svg>");background-size:80%;background-position:center;background-repeat:no-repeat}',
      '.cj-nl-modal form{display:flex;flex-direction:column;gap:10px}',
      '.cj-nl-modal input{padding:13px 16px;border:1.5px solid #e5e5e5;border-radius:12px;font-size:1rem;outline:none;font-family:inherit;transition:border-color .2s}',
      '.cj-nl-modal input:focus{border-color:#f97316}',
      '.cj-nl-modal button[type=submit]{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;padding:14px;border-radius:12px;font-weight:800;font-size:.95rem;cursor:pointer;transition:transform .2s,box-shadow .2s;font-family:inherit;box-shadow:0 4px 16px rgba(249,115,22,.25)}',
      '.cj-nl-modal button[type=submit]:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(249,115,22,.35)}',
      '.cj-nl-modal .cj-modal-skip{background:none;border:none;color:#94886e;font-size:.82rem;margin-top:6px;cursor:pointer;text-decoration:underline;font-family:inherit;padding:6px}',
      '.cj-nl-modal .cj-modal-skip:hover{color:#1f1b16}',
      '.cj-nl-modal .cj-modal-x{position:absolute;top:14px;right:14px;background:none;border:none;color:#94886e;font-size:1.4rem;cursor:pointer;line-height:1;padding:4px 8px}',
      '.cj-nl-modal .cj-modal-x:hover{color:#1f1b16}',
      '.cj-nl-modal .cj-modal-foot{font-size:.74rem;color:#94886e;margin-top:14px;text-align:center;line-height:1.4}',
      '.cj-nl-modal .cj-msg-ok{padding:14px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.25);border-radius:12px;color:#059669;font-weight:600;text-align:center}',
      '.cj-nl-modal .cj-msg-err{padding:10px;background:rgba(239,68,68,.08);color:#dc2626;border-radius:10px;font-size:.85rem;text-align:center}',

      /* Inline mid-article form */
      '.cj-nl-inline{background:linear-gradient(135deg,#fff7ed 0%,#fffcf9 100%);border:1.5px solid #fed7aa;border-radius:16px;padding:24px;margin:32px 0;font-family:Inter,sans-serif}',
      '.cj-nl-inline h4{margin:0 0 6px;font-size:1rem;color:#1f1b16;font-weight:800;letter-spacing:-.005em}',
      '.cj-nl-inline p{margin:0 0 14px;font-size:.85rem;color:#5c4d3d;line-height:1.5}',
      '.cj-nl-inline form{display:flex;gap:8px;flex-wrap:wrap}',
      '.cj-nl-inline input{flex:1;min-width:200px;background:#fff;border:1px solid #efe6db;padding:10px 14px;border-radius:10px;font-size:.9rem;outline:none;font-family:inherit;transition:border-color .2s}',
      '.cj-nl-inline input:focus{border-color:#f97316}',
      '.cj-nl-inline button{background:#1f1b16;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:700;font-size:.88rem;cursor:pointer;transition:background .2s;font-family:inherit;white-space:nowrap}',
      '.cj-nl-inline button:hover{background:#3d3229}',
      '.cj-nl-inline .cj-note{font-size:.74rem;color:#94886e;margin-top:10px}',
      '.cj-nl-inline .cj-msg-ok{color:#059669;font-weight:600;font-size:.88rem;padding:8px 0}',

      /* End-of-article CTA */
      '.cj-nl-end{background:#1f1b16;color:#fef7ed;border-radius:20px;padding:36px 32px;margin:48px 0;text-align:center;font-family:Inter,sans-serif;position:relative;overflow:hidden}',
      '.cj-nl-end::before{content:"";position:absolute;top:-30%;right:-15%;width:400px;height:400px;background:radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 60%);pointer-events:none}',
      '.cj-nl-end .cj-eyebrow{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#fb923c;font-weight:800;margin-bottom:10px}',
      '.cj-nl-end h3{font-size:1.6rem;margin:0 0 10px;color:#fef7ed;line-height:1.2;font-weight:900;letter-spacing:-.02em;position:relative}',
      '.cj-nl-end h3 em{font-style:normal;color:#fb923c}',
      '.cj-nl-end p{font-size:.95rem;color:rgba(254,247,232,.75);margin:0 0 22px;max-width:440px;margin-left:auto;margin-right:auto;line-height:1.55;position:relative}',
      '.cj-nl-end form{display:flex;gap:8px;max-width:420px;margin:0 auto;flex-wrap:wrap;justify-content:center;position:relative}',
      '.cj-nl-end input{flex:1;min-width:200px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:#fff;padding:13px 16px;border-radius:12px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s}',
      '.cj-nl-end input::placeholder{color:rgba(254,247,232,.5)}',
      '.cj-nl-end input:focus{border-color:#fb923c}',
      '.cj-nl-end button{background:#f97316;color:#fff;border:none;padding:13px 24px;border-radius:12px;font-weight:800;font-size:.95rem;cursor:pointer;transition:background .2s,transform .2s;font-family:inherit;white-space:nowrap}',
      '.cj-nl-end button:hover{background:#ea580c;transform:translateY(-1px)}',
      '.cj-nl-end .cj-foot{font-size:.72rem;color:rgba(254,247,232,.45);margin-top:12px;position:relative}',
      '.cj-nl-end .cj-msg-ok{color:#4ade80;font-weight:600;padding:14px;position:relative}',
      '.cj-nl-end .cj-msg-err{color:#fca5a5;padding:10px;font-size:.85rem;position:relative}'
    ].join('\n');
    document.head.appendChild(css);
  }

  /* ── Email validation ── */
  function isValidEmail(s){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  /* ── Handle subscribe (shared) ── */
  function handleSubmit(form, source, onOk, onErr){
    var input = form.querySelector('input[type=email]');
    var btn = form.querySelector('button[type=submit]') || form.querySelector('button');
    var email = (input.value || '').trim();
    if(!isValidEmail(email)){
      input.focus();
      input.style.borderColor = '#ef4444';
      setTimeout(function(){ input.style.borderColor = ''; }, 1500);
      return;
    }
    var origBtn = btn.textContent;
    btn.disabled = true;
    btn.textContent = '...';
    track('newsletter_submit', { source: source });
    subscribe(email, source)
      .then(function(r){
        btn.disabled = false;
        btn.textContent = origBtn;
        if(r.ok || r.status === 201){
          markSubscribed();
          track('newsletter_success', { source: source });
          if(onOk) onOk('¡Bienvenido/a! Revisa tu email para confirmar.');
        } else if(r.status === 409){
          markSubscribed();
          if(onOk) onOk('Ya estabas suscrito/a. ¡Gracias!');
        } else {
          if(onErr) onErr('Error. Inténtalo de nuevo.');
        }
      })
      .catch(function(){
        btn.disabled = false;
        btn.textContent = origBtn;
        if(onErr) onErr('Error de conexión.');
      });
  }

  /* ===================================================================
   * 1. STICKY BAR
   * =================================================================== */
  function buildSticky(){
    if(isSubscribed()) return;
    if(isDismissed(STORAGE.STICKY_HIDE_UNTIL)) return;

    var bar = document.createElement('div');
    bar.className = 'cj-nl-sticky';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Suscribirse a la newsletter');
    bar.innerHTML =
      '<span>📩 <strong>Plan 0→5K gratis</strong> + 1 artículo cada lunes en tu email</span>' +
      '<form>' +
        '<input type="email" required placeholder="tu@email.com" aria-label="Email">' +
        '<button type="submit">Suscribir</button>' +
      '</form>' +
      '<button class="cj-close" aria-label="Cerrar">×</button>';

    document.body.appendChild(bar);
    setTimeout(function(){ bar.classList.add('show'); }, 800);
    track('newsletter_view', { source: 'sticky' });

    var form = bar.querySelector('form');
    var span = bar.querySelector('span');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      handleSubmit(form, 'blog-newsletter-sticky',
        function(msg){ span.innerHTML = '<span class="cj-msg-ok">✓ ' + msg + '</span>'; form.remove(); setTimeout(function(){ bar.classList.remove('show'); setTimeout(function(){ bar.remove(); }, 400); }, 3000); },
        function(msg){ span.innerHTML = '<span style="color:#fca5a5">' + msg + '</span>'; }
      );
    });

    bar.querySelector('.cj-close').addEventListener('click', function(){
      dismissFor(STORAGE.STICKY_HIDE_UNTIL, 7);
      track('newsletter_dismiss', { source: 'sticky' });
      bar.classList.remove('show');
      setTimeout(function(){ bar.remove(); }, 400);
    });
  }

  /* ===================================================================
   * 2. EXIT-INTENT POPUP
   * =================================================================== */
  function buildExitIntent(){
    if(isSubscribed()) return;
    if(isDismissed(STORAGE.EXIT_HIDE_UNTIL)) return;
    if(shownThisSession(STORAGE.EXIT_SESSION)) return;

    var overlay = document.createElement('div');
    overlay.className = 'cj-nl-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="cj-nl-modal">' +
        '<button class="cj-modal-x" aria-label="Cerrar">×</button>' +
        '<div class="cj-modal-eyebrow">Antes de irte</div>' +
        '<h3>¿Tu plan <em>0→5K</em> en 8 semanas?</h3>' +
        '<p>Te mando el plan completo en PDF + 1 artículo de coach cada lunes. Sin spam.</p>' +
        '<ul class="cj-benefits">' +
          '<li>Plan completo de 8 semanas en PDF</li>' +
          '<li>1 artículo de entrenamiento cada lunes</li>' +
          '<li>Cancela en 1 click cuando quieras</li>' +
        '</ul>' +
        '<form>' +
          '<input type="email" required placeholder="tu@email.com" aria-label="Email">' +
          '<button type="submit">Quiero el plan gratis</button>' +
          '<button type="button" class="cj-modal-skip">No me interesa</button>' +
        '</form>' +
        '<div class="cj-modal-foot">+1.000 runners ya lo reciben</div>' +
      '</div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.classList.add('show'); });
    markShownThisSession(STORAGE.EXIT_SESSION);
    track('newsletter_view', { source: 'exit_intent' });

    function close(){
      overlay.classList.remove('show');
      setTimeout(function(){ overlay.remove(); }, 250);
    }
    overlay.querySelector('.cj-modal-x').addEventListener('click', function(){
      dismissFor(STORAGE.EXIT_HIDE_UNTIL, 30);
      track('newsletter_dismiss', { source: 'exit_intent' });
      close();
    });
    overlay.querySelector('.cj-modal-skip').addEventListener('click', function(){
      dismissFor(STORAGE.EXIT_HIDE_UNTIL, 30);
      track('newsletter_dismiss', { source: 'exit_intent' });
      close();
    });
    overlay.addEventListener('click', function(e){
      if(e.target === overlay){
        dismissFor(STORAGE.EXIT_HIDE_UNTIL, 30);
        track('newsletter_dismiss', { source: 'exit_intent' });
        close();
      }
    });

    var form = overlay.querySelector('form');
    var modal = overlay.querySelector('.cj-nl-modal');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      handleSubmit(form, 'blog-newsletter-exit',
        function(msg){
          modal.innerHTML = '<div class="cj-modal-eyebrow">¡Hecho!</div><h3>Bienvenido/a 🎉</h3><div class="cj-msg-ok">' + msg + '</div>';
          setTimeout(close, 3500);
        },
        function(msg){
          var err = document.createElement('div');
          err.className = 'cj-msg-err';
          err.textContent = msg;
          form.appendChild(err);
          setTimeout(function(){ err.remove(); }, 3000);
        }
      );
    });
  }

  /* Exit-intent triggers */
  function armExitIntent(){
    if(isSubscribed() || isDismissed(STORAGE.EXIT_HIDE_UNTIL)) return;
    var fired = false;
    function fire(){ if(fired) return; fired = true; buildExitIntent(); }

    // Desktop: mouse leaves viewport via top
    document.addEventListener('mouseleave', function(e){
      if(e.clientY < 10) fire();
    }, { once: false });

    // Mobile: 75% scroll depth
    var lastScroll = 0;
    window.addEventListener('scroll', function(){
      if(fired) return;
      var st = window.pageYOffset || document.documentElement.scrollTop;
      var dh = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      if(dh > 0 && (st / dh) > 0.75 && st > lastScroll) fire();
      lastScroll = st;
    }, { passive: true });
  }

  /* ===================================================================
   * 3. MID-ARTICLE INLINE FORM
   * =================================================================== */
  function buildInline(){
    if(isSubscribed()) return;

    // Inject after 3rd <p> inside .content (or article body)
    var container = document.querySelector('.content') || document.querySelector('article');
    if(!container) return;
    var paras = container.querySelectorAll(':scope > p');
    if(paras.length < 4) return;

    var box = document.createElement('div');
    box.className = 'cj-nl-inline';
    box.innerHTML =
      '<h4>📩 1 nuevo artículo cada lunes en tu email</h4>' +
      '<p>Plan 0→5K gratis al suscribirte. Sin spam, baja en 1 click.</p>' +
      '<form>' +
        '<input type="email" required placeholder="tu@email.com" aria-label="Email">' +
        '<button type="submit">Suscribirme</button>' +
      '</form>' +
      '<div class="cj-note">+1.000 runners ya lo reciben.</div>';

    paras[2].parentNode.insertBefore(box, paras[2].nextSibling);
    track('newsletter_view', { source: 'inline_mid' });

    var form = box.querySelector('form');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      handleSubmit(form, 'blog-newsletter-inline',
        function(msg){ box.innerHTML = '<div class="cj-msg-ok">✓ ' + msg + '</div>'; },
        function(msg){ var n = box.querySelector('.cj-note'); n.textContent = msg; n.style.color = '#dc2626'; }
      );
    });
  }

  /* ===================================================================
   * 4. END-OF-ARTICLE CTA
   * =================================================================== */
  function buildEnd(){
    if(isSubscribed()) return;

    var related = document.querySelector('.related');
    if(!related) return;

    // Skip if already a similar block exists nearby
    if(related.previousElementSibling && related.previousElementSibling.classList && related.previousElementSibling.classList.contains('cj-nl-end')) return;

    var box = document.createElement('div');
    box.className = 'cj-nl-end';
    box.innerHTML =
      '<div class="cj-eyebrow">Newsletter</div>' +
      '<h3>¿Te sirvió este artículo?<br>Recibe <em>1 nuevo cada lunes</em></h3>' +
      '<p>Plan 0→5K gratis al suscribirte + 1 artículo de coach cada semana. Sin spam, sin compromiso.</p>' +
      '<form>' +
        '<input type="email" required placeholder="tu@email.com" aria-label="Email">' +
        '<button type="submit">Quiero el plan gratis</button>' +
      '</form>' +
      '<div class="cj-foot">+1.000 runners ya lo reciben. Baja en 1 click.</div>';

    related.parentNode.insertBefore(box, related);
    track('newsletter_view', { source: 'end_article' });

    var form = box.querySelector('form');
    var foot = box.querySelector('.cj-foot');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      handleSubmit(form, 'blog-newsletter-end',
        function(msg){ box.innerHTML = '<div class="cj-eyebrow">¡Hecho!</div><div class="cj-msg-ok">✓ ' + msg + '</div>'; },
        function(msg){ var e = document.createElement('div'); e.className = 'cj-msg-err'; e.textContent = msg; box.appendChild(e); setTimeout(function(){ e.remove(); }, 3000); }
      );
    });
  }

  /* ===================================================================
   * INIT
   * =================================================================== */
  function init(){
    // Skip on homepage (it has its own newsletter system) and non-blog pages
    var path = location.pathname;
    var isBlog = path.indexOf('/blog') === 0;
    if(!isBlog) return;

    injectStyles();
    buildSticky();
    buildInline();
    buildEnd();
    armExitIntent();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
