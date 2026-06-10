/*!
 * CorrerJuntos · share.js
 * Auto-enhances blog share bars: native Web Share API on mobile (IG/Stories/etc),
 * explicit buttons on desktop, "Copiado" feedback on copy. Auto-injects bar
 * in articles without one. Replaces any existing .share-article markup.
 */
(function () {
  'use strict';

  if (location.pathname.indexOf('/blog') !== 0) return;
  if (window.__cjShareV1) return;
  window.__cjShareV1 = true;

  // FIX: prevent horizontal scroll wobble on mobile.
  // overflow-x:clip works with position:sticky (unlike :hidden) and stops
  // any wide element (table, code, image) from making the page sway.
  // Applied here because only blog/index.html had it; 537 articles didn't.
  (function injectScrollFix() {
    var s = document.createElement('style');
    s.textContent =
      'html,body{overflow-x:clip;max-width:100vw}' +
      '@supports not (overflow:clip){html,body{overflow-x:hidden}}';
    document.head.appendChild(s);
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var bar = document.querySelector('.share-article');
    if (!bar) bar = createBar();
    if (!bar) return;
    render(bar);
  }

  function createBar() {
    var anchor =
      document.querySelector('.related') ||
      document.querySelector('article .content > :last-child') ||
      document.querySelector('main') ||
      document.body;
    if (!anchor || !anchor.parentNode) return null;
    var div = document.createElement('div');
    div.className = 'share-article';
    div.setAttribute(
      'style',
      'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:32px 0;padding:20px;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.15);border-radius:16px'
    );
    anchor.parentNode.insertBefore(div, anchor);
    return div;
  }

  function render(bar) {
    bar.innerHTML = '';

    var label = document.createElement('span');
    label.style.cssText = 'color:#5c4d3d;font-size:.85rem;font-weight:600';
    label.textContent = 'Compartir:';
    bar.appendChild(label);

    var url = location.href;
    var title = document.title;
    var text = title;

    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    var hasNativeShare = typeof navigator.share === 'function';

    if (isMobile && hasNativeShare) {
      // PRIMARY: native share sheet (includes IG, Stories, WhatsApp, Mail, etc)
      bar.appendChild(
        button(
          'Compartir',
          '#f97316',
          '#fff',
          function () {
            navigator
              .share({ title: title, text: text, url: url })
              .then(function () {
                track('native');
              })
              .catch(function () {
                /* user cancelled */
              });
          },
          true
        )
      );

      // SECONDARY: copy link with feedback
      var copyM = button(
        '📋 Copiar link',
        'rgba(0,0,0,.05)',
        '#5c4d3d',
        function () {
          copyLink(copyM);
        }
      );
      copyM.style.border = '1px solid rgba(0,0,0,.1)';
      bar.appendChild(copyM);
    } else {
      // DESKTOP / no native share: explicit platforms
      bar.appendChild(
        button('WhatsApp', '#25D366', '#fff', function () {
          window.open(
            'https://api.whatsapp.com/send?text=' +
              encodeURIComponent(text + ' ' + url),
            '_blank',
            'width=600,height=400'
          );
          track('whatsapp');
        })
      );
      bar.appendChild(
        button('X', '#1e293b', '#fff', function () {
          window.open(
            'https://x.com/intent/tweet?text=' +
              encodeURIComponent(title) +
              '&url=' +
              encodeURIComponent(url) +
              '&via=CorrerJuntos',
            '_blank',
            'width=600,height=400'
          );
          track('x');
        })
      );
      bar.appendChild(
        button('Facebook', '#1877F2', '#fff', function () {
          window.open(
            'https://www.facebook.com/sharer/sharer.php?u=' +
              encodeURIComponent(url),
            '_blank',
            'width=600,height=400'
          );
          track('facebook');
        })
      );
      var copyD = button(
        '📋 Copiar link',
        'rgba(0,0,0,.05)',
        '#5c4d3d',
        function () {
          copyLink(copyD);
        }
      );
      copyD.style.border = '1px solid rgba(0,0,0,.1)';
      bar.appendChild(copyD);
    }
  }

  function button(text, bg, color, onClick, primary) {
    var b = document.createElement('button');
    b.type = 'button';
    b.style.cssText =
      'display:inline-flex;align-items:center;gap:6px;padding:' +
      (primary ? '10px 22px' : '8px 16px') +
      ';background:' +
      bg +
      ';color:' +
      color +
      ';border:none;border-radius:999px;font-size:' +
      (primary ? '.9rem' : '.8rem') +
      ';font-weight:700;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:transform .12s ease, opacity .12s ease';
    b.textContent = text;
    b.addEventListener('click', onClick);
    b.addEventListener('mousedown', function () {
      b.style.transform = 'scale(.97)';
    });
    b.addEventListener('mouseup', function () {
      b.style.transform = '';
    });
    b.addEventListener('mouseleave', function () {
      b.style.transform = '';
    });
    return b;
  }

  function copyLink(btn) {
    var done = function () {
      var origText = btn.textContent;
      var origBg = btn.style.background;
      var origColor = btn.style.color;
      var origBorder = btn.style.border;
      btn.textContent = '✓ Copiado';
      btn.style.background = '#10b981';
      btn.style.color = '#fff';
      btn.style.border = '1px solid #10b981';
      setTimeout(function () {
        btn.textContent = origText;
        btn.style.background = origBg;
        btn.style.color = origColor;
        btn.style.border = origBorder;
      }, 1800);
      track('copy');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(location.href)
        .then(done)
        .catch(function () {
          fallbackCopy();
          done();
        });
    } else {
      fallbackCopy();
      done();
    }
  }

  function fallbackCopy() {
    var ta = document.createElement('textarea');
    ta.value = location.href;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function track(method) {
    if (typeof gtag === 'function') {
      gtag('event', 'article_share', {
        method: method,
        source: location.pathname,
      });
    }
  }
})();
