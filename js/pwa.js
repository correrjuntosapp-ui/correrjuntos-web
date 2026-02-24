// ========================= PWA INSTALL =========================
    // PWA: Service Worker + Custom Install Banner
    (function(){
      const DISMISS_KEY = 'cj_pwa_dismissed_v1';
      const banner = document.getElementById('pwa-banner');
      const btnInstall = document.getElementById('pwa-install');
      const btnDismiss = document.getElementById('pwa-dismiss');
      const iosHint = document.getElementById('pwa-ios');
      if(!banner || !btnInstall || !btnDismiss) return;

      // Register Service Worker (HTTPS or localhost)
      try{
        const isLocalhost = location.hostname==='localhost' || location.hostname==='127.0.0.1';
        const okProto = location.protocol==='https:' || (location.protocol==='http:' && isLocalhost);
        if(okProto && 'serviceWorker' in navigator){
          window.addEventListener('load', ()=>{
            navigator.serviceWorker.register('./sw.js').catch(()=>{});
          });
        }
      }catch(_){}

      // Install banner logic
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const dismissed = localStorage.getItem(DISMISS_KEY)==='1';
      let deferredPrompt = null;

      function showBanner(mode){
        if(!isMobile || isStandalone || dismissed) return;
        banner.classList.remove('hidden');
        iosHint.classList.toggle('hidden', mode!=='ios');
        btnInstall.classList.toggle('hidden', mode==='ios');
      }

      function hideBanner(){
        banner.classList.add('hidden');
      }

      btnDismiss.addEventListener('click', ()=>{
        localStorage.setItem(DISMISS_KEY,'1');
        hideBanner();
      });

      // Capture install prompt
      window.addEventListener('beforeinstallprompt', (e)=>{
        e.preventDefault();
        deferredPrompt = e;
        showBanner('prompt');
      });

      btnInstall.addEventListener('click', async ()=>{
        if(!deferredPrompt) return;
        deferredPrompt.prompt();
        try{ await deferredPrompt.userChoice; }catch(_){}
        deferredPrompt = null;
        hideBanner();
      });

      // iOS fallback (no beforeinstallprompt)
      if(isIOS && !isStandalone){
        // wait a moment to avoid flashing on load
        setTimeout(()=>showBanner('ios'), 900);
      }

      // Hide when installed
      window.addEventListener('appinstalled', ()=>{
        hideBanner();
      });

      // Expose hook for i18n updates
      window.__CJ_PWA_SET_TEXT__ = function(t){
        const title = document.getElementById('pwa-title');
        const desc = document.getElementById('pwa-desc');
        const install = document.getElementById('pwa-install');
        const ios = document.getElementById('pwa-ios');
        if(title && t.pwaTitle) title.textContent = t.pwaTitle;
        if(desc && t.pwaDesc) desc.textContent = t.pwaDesc;
        if(install && t.pwaBtn) install.textContent = t.pwaBtn;
        if(ios && t.pwaIOS) ios.textContent = t.pwaIOS;
      };

    })();
