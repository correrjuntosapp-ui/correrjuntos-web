(function () {
  const userAgent = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);
  document.body.classList.add(isIOS || isAndroid ? 'is-mobile' : 'is-desktop');
  if (!isIOS && !isAndroid) return;
  const store = isIOS ? 'https://apps.apple.com/app/id6758505910' : 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';
  let fallbackTimer;
  let hidden = false;
  document.addEventListener('visibilitychange', () => {
    hidden = document.visibilityState === 'hidden';
    if (hidden) clearTimeout(fallbackTimer);
  });
  const open = () => {
    clearTimeout(fallbackTimer);
    hidden = false;
    const started = Date.now();
    try { window.location.href = 'correrjuntos://'; } catch { hidden = false; }
    fallbackTimer = setTimeout(() => {
      if (hidden || document.visibilityState === 'hidden' || Date.now() - started > 2200) return;
      window.location.href = window.CJHomeFunnel ? window.CJHomeFunnel.attributedUrl(store) : store;
    }, 1700);
  };
  const autoOpen = setTimeout(open, 250);
  document.getElementById('openBtn')?.addEventListener('click', event => {
    event.preventDefault();
    clearTimeout(autoOpen);
    open();
  });
})();
