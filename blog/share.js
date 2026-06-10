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
    var div = document.createElement('div');
    div.className = 'share-article';
    div.setAttribute(
      'style',
      'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:32px auto 24px;padding:20px;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.15);border-radius:16px;max-width:1000px;width:calc(100% - 48px);box-sizing:border-box'
    );
    // Insertion order — always at BOTTOM of the article, never at the top:
    //  1. before .related (if article has related section)
    //  2. before the last .cj-app-banner injected by cro.js
    //  3. before <footer>
    //  4. as last child of body (NEVER insertBefore body)
    var related = document.querySelector('.related');
    if (related && related.parentNode) {
      related.parentNode.insertBefore(div, related);
      return div;
    }
    var banners = document.querySelectorAll('.cj-app-banner');
    var lastBanner = banners.length ? banners[banners.length - 1] : null;
    if (lastBanner && lastBanner.parentNode) {
      lastBanner.parentNode.insertBefore(div, lastBanner.nextSibling);
      return div;
    }
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(div, footer);
      return div;
    }
    document.body.appendChild(div);
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
      // PRIMARY: native share sheet (includes IG DM, WhatsApp, Mail, etc)
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

      // STORY: generate branded 1080x1920 image + redirect IG (mobile only)
      var storyBtn = button(
        '📸 Story',
        'linear-gradient(45deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888)',
        '#fff',
        function () { generateAndShareStory(storyBtn); }
      );
      storyBtn.style.background = 'linear-gradient(45deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888)';
      bar.appendChild(storyBtn);

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

  // === STORY IMAGE GENERATION ===
  // Creates a 1080x1920 branded image (CJ orange gradient + title + URL)
  // downloads it to user's photos, then opens IG so they can pick the
  // freshly-saved image and add a Link Sticker.
  function generateAndShareStory(btn) {
    if (!btn) return;
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Generando…';

    generateStoryImage()
      .then(function (blob) {
        // Pre-copy URL to clipboard so user can paste it on the Link Sticker inside IG
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(location.href).catch(function () {});
        }

        var slug = location.pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'correrjuntos';
        var fileName = slug.replace(/^blog-/, '') + '-story.jpg';
        var file = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });

        var canShareFile = false;
        try {
          canShareFile = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
        } catch (e) { canShareFile = false; }

        if (canShareFile) {
          // PRO PATH: native share sheet with the image as attachment.
          // User picks Instagram → IG opens with image preloaded → tap Story
          // → add Link Sticker (URL already in clipboard) → publish.
          navigator
            .share({
              files: [file],
              text: document.title.replace(/\s+\|\s+CorrerJuntos.*$/, '').trim(),
            })
            .then(function () { track('story-share'); })
            .catch(function () { /* user cancelled */ });
          btn.disabled = false;
          btn.textContent = orig;
        } else {
          // FALLBACK (older browsers / desktop): open image in new tab so user
          // can long-press → Save Image. Then they upload to IG manually.
          var url = URL.createObjectURL(blob);
          var win = window.open(url, '_blank');
          if (!win) {
            // Popup blocked → trigger download as last resort
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
          showStoryToast();
          track('story-download');
          btn.disabled = false;
          btn.textContent = orig;
        }
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = orig;
        alert('No se pudo generar la imagen. Prueba de nuevo o copia el link.');
        console.error('Story generation failed:', err);
      });
  }

  function generateStoryImage() {
    return new Promise(function (resolve, reject) {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        var ctx = canvas.getContext('2d');

        // === BACKGROUND: dark gradient with brand accents ===
        var bg = ctx.createLinearGradient(0, 0, 0, 1920);
        bg.addColorStop(0, '#11192a');
        bg.addColorStop(1, '#0b1220');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1080, 1920);

        // Radial orange accent top-right
        var radial = ctx.createRadialGradient(900, 300, 0, 900, 300, 900);
        radial.addColorStop(0, 'rgba(249,115,22,0.35)');
        radial.addColorStop(1, 'rgba(249,115,22,0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, 1080, 1920);

        // Radial accent bottom-left (subtle)
        var radial2 = ctx.createRadialGradient(180, 1700, 0, 180, 1700, 700);
        radial2.addColorStop(0, 'rgba(249,115,22,0.15)');
        radial2.addColorStop(1, 'rgba(249,115,22,0)');
        ctx.fillStyle = radial2;
        ctx.fillRect(0, 0, 1080, 1920);

        // === HEADER: eyebrow + brand ===
        var fontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
        var monoStack = '"SF Mono", "JetBrains Mono", Menlo, monospace';

        // Eyebrow pill
        ctx.fillStyle = 'rgba(251,146,60,0.18)';
        roundRect(ctx, 80, 140, 380, 60, 30);
        ctx.fill();
        ctx.fillStyle = '#fb923c';
        ctx.font = '700 22px ' + monoStack;
        ctx.textAlign = 'center';
        ctx.fillText('• ARTÍCULO · BLOG', 270, 180);

        // Brand
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f6f1e8';
        ctx.font = '800 56px ' + fontStack;
        ctx.fillText('CORRER', 80, 320);
        ctx.fillStyle = '#f97316';
        ctx.fillText('JUNTOS', 380, 320);

        // === TITLE ===
        var title = (document.querySelector('h1') ? document.querySelector('h1').textContent : document.title) || '';
        title = title.replace(/\s+\|\s+CorrerJuntos.*$/, '').trim();
        ctx.fillStyle = '#f6f1e8';
        ctx.font = '800 78px ' + fontStack;
        ctx.textAlign = 'left';
        var titleLines = wrapText(ctx, title, 920);
        var titleStartY = 720;
        var lineH = 96;
        // Truncate to 6 lines max
        if (titleLines.length > 6) {
          titleLines = titleLines.slice(0, 5);
          titleLines.push(titleLines.pop().replace(/.{0,30}$/, '…'));
        }
        for (var i = 0; i < titleLines.length; i++) {
          ctx.fillText(titleLines[i], 80, titleStartY + i * lineH);
        }

        // === DEK / DESCRIPTION ===
        var dek = getMetaDescription();
        if (dek) {
          var dekY = titleStartY + titleLines.length * lineH + 30;
          ctx.fillStyle = 'rgba(246,241,232,0.72)';
          ctx.font = '400 36px ' + fontStack;
          var dekLines = wrapText(ctx, dek, 920);
          if (dekLines.length > 3) {
            dekLines = dekLines.slice(0, 2);
            dekLines.push(dekLines.pop().replace(/.{0,30}$/, '…'));
          }
          for (var j = 0; j < dekLines.length; j++) {
            ctx.fillText(dekLines[j], 80, dekY + j * 50);
          }
        }

        // === BOTTOM: divider + CTA + URL ===
        ctx.strokeStyle = 'rgba(246,241,232,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, 1660);
        ctx.lineTo(1000, 1660);
        ctx.stroke();

        // CTA tagline
        ctx.fillStyle = '#f97316';
        ctx.font = '700 28px ' + monoStack;
        ctx.textAlign = 'left';
        ctx.fillText('── CORRE ACOMPAÑADO', 80, 1720);

        // URL
        ctx.fillStyle = '#f6f1e8';
        ctx.font = '700 44px ' + fontStack;
        ctx.fillText('correrjuntos.com', 80, 1810);

        // "Lee el artículo" hint
        ctx.fillStyle = 'rgba(246,241,232,0.42)';
        ctx.font = '500 24px ' + monoStack;
        ctx.fillText('Lee el artículo completo →', 80, 1860);

        canvas.toBlob(
          function (blob) {
            if (blob) resolve(blob);
            else reject(new Error('toBlob returned null'));
          },
          'image/jpeg',
          0.92
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  function wrapText(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function getMetaDescription() {
    var m = document.querySelector('meta[name="description"]') ||
            document.querySelector('meta[property="og:description"]');
    return m ? m.getAttribute('content') : '';
  }

  function showStoryToast() {
    var existing = document.getElementById('cj-story-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'cj-story-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:16px;right:16px;background:#0b1220;color:#fff;padding:18px 22px;border-radius:16px;font-size:.92rem;font-weight:600;z-index:99999;box-shadow:0 18px 60px rgba(0,0,0,.5);line-height:1.45;border:1px solid rgba(249,115,22,.3);transform:translateY(120%);transition:transform .35s cubic-bezier(.2,.9,.3,1.2)';
    toast.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:12px">' +
        '<div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;font-size:18px">✓</div>' +
        '<div style="flex:1">' +
          '<div style="color:#fff;font-weight:700;margin-bottom:4px">Imagen guardada · Link copiado</div>' +
          '<div style="color:rgba(246,241,232,.7);font-weight:500;font-size:.82rem">Instagram se abrirá. Toca Story → galería → elige la imagen → añade Link Sticker (pega el link).</div>' +
        '</div>' +
        '<button onclick="this.parentNode.parentNode.remove()" style="background:transparent;border:none;color:rgba(246,241,232,.4);font-size:24px;line-height:1;padding:0 4px;cursor:pointer">×</button>' +
      '</div>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.transform = 'translateY(0)';
    });
    setTimeout(function () {
      if (toast.parentNode) {
        toast.style.transform = 'translateY(120%)';
        setTimeout(function () { toast.remove(); }, 400);
      }
    }, 8000);
  }
})();
