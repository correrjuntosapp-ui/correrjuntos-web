(function () {
  if (window.CJHomeFunnel) return;
  const fields = ['source', 'medium', 'campaign', 'content', 'term'];
  const originalLinks = new WeakMap();
  const production = ['www.correrjuntos.com', 'correrjuntos.com'].includes(window.location.hostname);
  const consent = () => {
    try { return localStorage.getItem('cj_cookie_consent') === 'accepted'; } catch { return false; }
  };
  const safeValue = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : '';
  // La campaña de la URL de llegada se aplica a los enlaces sin almacenar nada (no requiere consentimiento).
  // El almacén de 30 días solo se lee y se escribe con consentimiento.
  const campaign = () => {
    const query = new URLSearchParams(window.location.search);
    if (query.has('utm_source')) {
      const result = Object.fromEntries(fields.map(field => [field, safeValue(query.get('utm_' + field))]));
      if (!result.source) return null;
      return { ...result, t: Date.now() };
    }
    if (!consent()) return null;
    try {
      const stored = JSON.parse(localStorage.getItem('cj_utm') || 'null');
      if (!stored || !Number.isFinite(stored.t) || Date.now() - stored.t > 2592000000 || stored.t > Date.now()) return null;
      const result = Object.fromEntries(fields.map(field => [field, safeValue(stored[field])]));
      return result.source ? { ...result, t: stored.t } : null;
    } catch { return null; }
  };
  const destination = href => {
    try {
      const url = new URL(href, window.location.href);
      if (url.protocol === 'https:' && url.hostname === 'apps.apple.com' && /\/id6758505910$/.test(url.pathname)) return 'app_store';
      if (url.protocol === 'https:' && url.hostname === 'play.google.com' && url.pathname === '/store/apps/details' && url.searchParams.get('id') === 'com.correrjuntos.app') return 'google_play';
      if (url.origin === window.location.origin && ['/abrir-app', '/abrir-app.html'].includes(url.pathname)) return 'smart_link';
    } catch { return null; }
    return null;
  };
  const attributedUrl = href => {
    const target = destination(href);
    const attribution = campaign();
    if (!target || !attribution) return href;
    const url = new URL(href, window.location.href);
    if (target === 'app_store') url.searchParams.set('ct', attribution.campaign || attribution.source);
    else {
      const params = new URLSearchParams();
      for (const field of fields) if (attribution[field]) params.set('utm_' + field, attribution[field]);
      if (target === 'google_play') url.searchParams.set('referrer', params.toString());
      else for (const [key, value] of params) url.searchParams.set(key, value);
    }
    return url.href;
  };
  const storeCampaign = attribution => {
    try {
      if (!consent()) localStorage.removeItem('cj_utm');
      else if (attribution) localStorage.setItem('cj_utm', JSON.stringify(attribution));
    } catch { return; }
  };
  const refresh = () => {
    storeCampaign(campaign());
    for (const anchor of document.querySelectorAll('a[href]')) {
      if (!destination(anchor.href)) continue;
      if (!originalLinks.has(anchor)) originalLinks.set(anchor, anchor.getAttribute('href'));
      anchor.href = attributedUrl(originalLinks.get(anchor));
    }
  };
  const track = (name, params) => {
    if (!production || !consent() || typeof window.gtag !== 'function') return;
    try { window.gtag('event', name, { home_version: 'v13', ...params }); } catch { return; }
  };
  const placement = anchor => {
    if (anchor.closest('.header')) return 'header';
    if (anchor.closest('.hero')) return 'hero';
    if (anchor.closest('#planes')) return 'pricing';
    if (anchor.closest('#descargar')) return 'download';
    return 'other';
  };
  document.addEventListener('click', event => {
    if (!consent()) return;
    const anchor = event.target.closest?.('a[href]');
    if (anchor && destination(anchor.href)) {
      refresh();
      track('home_download_click', { destination: destination(anchor.href), placement: placement(anchor) });
    }
    const gallery = event.target.closest?.('[data-screen]');
    if (gallery && ['01-inicio', '02-plan', '03-sesion', '04-fuerza', '05-carreras'].includes(gallery.dataset.screen)) {
      track('home_gallery_select', { screen_id: gallery.dataset.screen });
    }
    if (anchor?.closest('#blog') && !anchor.closest('.editorial-note')) {
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin || !/^\/blog(?:\/|$)/.test(target.pathname)) return;
      const sport = anchor.closest('#reading-cycling') || anchor.classList.contains('cycling-hub') ? 'cycling' : 'running';
      const index = ['/blog', '/blog/en', '/blog/ciclismo'].includes(target.pathname.replace(/\/$/, ''));
      track('home_blog_click', { sport, link_type: index ? 'index' : 'article' });
    }
  });
  window.addEventListener('storage', event => { if (event.key === 'cj_cookie_consent') refresh(); });
  window.CJHomeFunnel = { refresh, attributedUrl, destination };
  refresh();
})();
