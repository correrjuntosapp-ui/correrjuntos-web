// ========================= DEEP LINKING =========================
      // ========== DEEP LINKING - Aumentar descargas de app ==========
      const APP_STORE_URL = 'https://apps.apple.com/us/app/correr-juntos/id6758505910';
      const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';

      function isMobileDevice() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      }

      function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
      }

      // Mostrar modal para sugerir app (solo en móvil, solo si no lo ha descartado)
      function suggestAppForAction(quedadaId, actionType = 'join') {
        // No mostrar en desktop
        if (!isMobileDevice()) return false;

        // No mostrar si el usuario lo descartó
        if (localStorage.getItem('dismiss-app-modal') === 'true') return false;

        // No mostrar si ya mostró recientemente (últimas 24h)
        const lastShown = localStorage.getItem('app-modal-last-shown');
        if (lastShown && Date.now() - parseInt(lastShown) < 24 * 60 * 60 * 1000) return false;

        // Guardar ID para después
        document.getElementById('deep-link-quedada-id').value = quedadaId;

        // Mostrar modal
        openModal('modal-open-in-app');
        localStorage.setItem('app-modal-last-shown', Date.now().toString());

        return true; // Indica que se mostró el modal
      }

      function downloadAppFromModal() {
        // Guardar preferencia si marcó checkbox
        if (document.getElementById('dont-show-app-modal').checked) {
          localStorage.setItem('dismiss-app-modal', 'true');
        }

        // Ir a la tienda correspondiente
        const storeUrl = isIOS() ? APP_STORE_URL : PLAY_STORE_URL;
        window.open(storeUrl, '_blank');

        closeModal('modal-open-in-app');
      }

      function continueInWeb() {
        // Guardar preferencia si marcó checkbox
        if (document.getElementById('dont-show-app-modal').checked) {
          localStorage.setItem('dismiss-app-modal', 'true');
        }

        closeModal('modal-open-in-app');

        // Continuar con la acción original (unirse)
        const quedadaId = document.getElementById('deep-link-quedada-id').value;
        if (quedadaId) {
          // Llamar directamente al modal de attendance sin volver a sugerir app
          openAttendanceModalDirect(quedadaId);
        }
      }

      // Versión directa que no sugiere app (para usar después de descartar)
      function openAttendanceModalDirect(quedadaId) {
        if (!currentUser) {
          showToast(I18N[currentLang]?.needRegister || 'Debes registrarte', 'error');
          openModal('modal-register');
          return;
        }
        // Continuar con el flujo normal de attendance
        document.getElementById('attendance-quedada-id').value = quedadaId;
        const q = quedadas.find(x => x.id === quedadaId);
        const asistentesInfo = q ? (Array.isArray(q.asistentes_info) ? q.asistentes_info : []) : [];
        const myParticipation = asistentesInfo.find(a => a.user_id === currentUser.id);
        const isJoined = !!myParticipation;
        document.getElementById('attendance-is-joined').value = isJoined ? 'true' : 'false';

        // El resto del código de openAttendanceModal se ejecuta aquí...
        openModal('modal-attendance');

        // Simular el setup del modal
        const currentStatus = myParticipation?.status || 'confirmed';
        document.getElementById('check-confirmed').classList.add('hidden');
        document.getElementById('check-maybe').classList.add('hidden');
        document.getElementById('check-interested').classList.add('hidden');

        if (isJoined) {
          document.getElementById('attendance-title').textContent = 'Cambiar mi estado';
          document.getElementById('attendance-subtitle').textContent = 'Actualiza tu nivel de compromiso';
          document.getElementById('btn-leave-quedada').classList.remove('hidden');
          document.getElementById(`check-${currentStatus}`).classList.remove('hidden');
        } else {
          document.getElementById('attendance-title').textContent = '¿Cómo de seguro estás?';
          document.getElementById('attendance-subtitle').textContent = 'Ayuda al organizador a planificar';
          document.getElementById('btn-leave-quedada').classList.add('hidden');
        }
      }

      // Sobrescribir openAttendanceModal para sugerir app primero
      const originalOpenAttendanceModal = typeof openAttendanceModal === 'function' ? openAttendanceModal : null;

      // Se sobrescribe después de que se cargue el script principal
      document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.openAttendanceModal === 'function') {
          const original = window.openAttendanceModal;
          window.openAttendanceModal = function(quedadaId) {
            // En móvil, sugerir app primero
            if (suggestAppForAction(quedadaId, 'join')) {
              return; // El modal de app se mostró, no continuar
            }
            // Si no se mostró modal de app, continuar normal
            original(quedadaId);
          };
        }

        // Iniciar Top App Banner
        initTopAppBanner();

        // Comprobar deep link interstitial
        checkDeepLinkInterstitial();
      });

      // ========== TOP APP BANNER - Aparece inmediatamente en móvil ==========
      function initTopAppBanner() {
        // Solo en móvil
        if (!isMobileDevice()) return;

        // No mostrar si está en modo standalone (ya tiene la app/PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        if (window.navigator.standalone) return;

        // Check dismiss (7-day expiry)
        const dismissedTime = localStorage.getItem('top-banner-dismissed-time');
        if (dismissedTime) {
          const daysSince = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
          if (daysSince < 7) return;
          localStorage.removeItem('top-banner-dismissed-time');
        }

        // Mostrar inmediatamente
        showTopBanner();
      }

      function showTopBanner() {
        const banner = document.getElementById('top-app-banner');
        if (banner) {
          banner.classList.remove('hidden');
          document.body.classList.add('has-top-banner');
          // Ajustar nav sticky
          const navWrapper = document.querySelector('.nav-wrapper');
          if (navWrapper) {
            navWrapper.style.top = banner.offsetHeight + 'px';
          }
        }
      }

      function dismissTopBanner() {
        const banner = document.getElementById('top-app-banner');
        if (banner) {
          banner.classList.add('hidden');
          document.body.classList.remove('has-top-banner');
          localStorage.setItem('top-banner-dismissed-time', Date.now().toString());
          // Restaurar nav sticky
          const navWrapper = document.querySelector('.nav-wrapper');
          if (navWrapper) {
            navWrapper.style.top = '0';
          }
        }
        if (typeof gtag === 'function') gtag('event', 'top_banner_dismissed');
      }

      function openAppStore() {
        const storeUrl = isIOS() ? APP_STORE_URL : PLAY_STORE_URL;
        window.open(storeUrl, '_blank');
      }

      // ========== DEEP LINK INTERSTITIAL ==========
      function checkDeepLinkInterstitial() {
        // Solo en móvil
        if (!isMobileDevice()) return;

        // No en standalone
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        if (window.navigator.standalone) return;

        // Detectar hash con quedada/ID
        const hash = window.location.hash;
        const quedadaMatch = hash.match(/^#quedada\/(.+)$/);
        if (!quedadaMatch) return;

        const quedadaId = quedadaMatch[1];

        // No mostrar si ya descartó recientemente (1 hora)
        const lastDismissed = localStorage.getItem('deeplink-interstitial-dismissed');
        if (lastDismissed && Date.now() - parseInt(lastDismissed) < 60 * 60 * 1000) return;

        showDeepLinkInterstitial(quedadaId);
      }

      function showDeepLinkInterstitial(quedadaId) {
        const overlay = document.getElementById('deeplink-interstitial');
        if (overlay) {
          overlay.dataset.quedadaId = quedadaId;
          overlay.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }
      }

      function deeplinkOpenApp() {
        const overlay = document.getElementById('deeplink-interstitial');
        const quedadaId = overlay?.dataset.quedadaId || '';
        if (typeof gtag === 'function') gtag('event', 'deeplink_open_app', { quedada_id: quedadaId });

        // Intentar abrir con custom scheme
        const deepLink = 'correrjuntos://quedada/' + quedadaId;
        window.location.href = deepLink;

        // Si no se abre en 2s, ir a la tienda
        setTimeout(() => {
          openAppStore();
        }, 2000);

        closeDeepLinkInterstitial();
      }

      function deeplinkDownload() {
        const overlay = document.getElementById('deeplink-interstitial');
        const quedadaId = overlay?.dataset.quedadaId || '';
        if (typeof gtag === 'function') gtag('event', 'deeplink_download', { quedada_id: quedadaId });
        openAppStore();
        closeDeepLinkInterstitial();
      }

      function deeplinkContinueWeb() {
        const overlay = document.getElementById('deeplink-interstitial');
        const quedadaId = overlay?.dataset.quedadaId || '';
        if (typeof gtag === 'function') gtag('event', 'deeplink_continue_web', { quedada_id: quedadaId });
        localStorage.setItem('deeplink-interstitial-dismissed', Date.now().toString());
        closeDeepLinkInterstitial();
      }

      function closeDeepLinkInterstitial() {
        const overlay = document.getElementById('deeplink-interstitial');
        if (overlay) {
          overlay.classList.add('hidden');
          document.body.style.overflow = '';
        }
      }

      // ========== PUSH NOTIFICATIONS ==========
      const VAPID_PUBLIC_KEY = 'BJ_bOVOJcGPEdqUOX9EjYg-5gomGPShP_Kku4ewQHnAgeH1Pw8msO9OtYRxyRqUwt9es8F7WDcc7mqI7gIwVu_0';

      // Comprobar si el navegador soporta notificaciones
      function isPushSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      }

      // Mostrar modal para pedir permiso (solo si no ha respondido antes)
      function showNotificationPrompt() {
        // No mostrar si no soporta push
        if (!isPushSupported()) return;

        // No mostrar si ya tiene permiso o lo denegó
        if (Notification.permission !== 'default') return;

        // No mostrar si ya descartó el modal
        if (localStorage.getItem('notification-modal-dismissed') === 'true') return;

        // No mostrar si no está logueado
        if (!currentUser) return;

        // Mostrar después de que el usuario haya interactuado un poco
        openModal('modal-enable-notifications');
      }

      // Pedir permiso de notificaciones
      async function requestNotificationPermission() {
        try {
          const permission = await Notification.requestPermission();

          if (permission === 'granted') {
            // Registrar para push
            await subscribeToPush();
            closeModal('modal-enable-notifications');
            showToast('¡Notificaciones activadas!', 'success');
          } else if (permission === 'denied') {
            closeModal('modal-enable-notifications');
            showToast('Notificaciones bloqueadas. Puedes activarlas en la configuración del navegador.', 'info');
          }
        } catch (error) {
          console.error('Error pidiendo permiso:', error);
          closeModal('modal-enable-notifications');
          showToast('No se pudieron activar las notificaciones', 'error');
        }
      }

      // Suscribirse a push notifications
      async function subscribeToPush() {
        try {
          const registration = await navigator.serviceWorker.ready;

          // Verificar si ya está suscrito
          let subscription = await registration.pushManager.getSubscription();

          if (!subscription) {
            // Crear nueva suscripción
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
          }

          // Guardar suscripción en Supabase
          if (currentUser && subscription) {
            await savePushSubscription(subscription);
          }

          console.log('Suscrito a push:', subscription);
          return subscription;
        } catch (error) {
          console.error('Error suscribiendo a push:', error);
          throw error;
        }
      }

      // Guardar suscripción en Supabase
      async function savePushSubscription(subscription) {
        if (!currentUser) return;

        try {
          // Extraer los datos de la suscripción
          const subscriptionData = subscription.toJSON();

          const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
              user_id: currentUser.id,
              endpoint: subscriptionData.endpoint,
              p256dh: subscriptionData.keys?.p256dh || null,
              auth: subscriptionData.keys?.auth || null,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (error) {
            console.error('Error guardando suscripción:', error);
          } else {
            console.log('Suscripción guardada en Supabase');
          }
        } catch (e) {
          console.error('Error en savePushSubscription:', e);
        }
      }

      // Descartar modal de notificaciones
      function dismissNotificationModal() {
        closeModal('modal-enable-notifications');
        localStorage.setItem('notification-modal-dismissed', 'true');
        localStorage.setItem('notification-modal-dismissed-time', Date.now().toString());
      }

      // Convertir VAPID key a Uint8Array
      function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      // Mostrar prompt de notificaciones después de primera acción significativa
      function checkShowNotificationPrompt() {
        // Solo mostrar después de que el usuario se una a su primera quedada
        const joinCount = parseInt(localStorage.getItem('user-join-count') || '0');

        // Mostrar después de la primera vez que se une a algo
        if (joinCount === 1 && Notification.permission === 'default') {
          setTimeout(() => {
            showNotificationPrompt();
          }, 2000); // Esperar 2 segundos después de unirse
        }
      }

      // Incrementar contador de joins
      function incrementJoinCount() {
        const count = parseInt(localStorage.getItem('user-join-count') || '0') + 1;
        localStorage.setItem('user-join-count', count.toString());
        return count;
      }

      // Verificar y limpiar dismiss después de 30 días
      (function checkNotificationDismissExpiry() {
        const dismissedTime = localStorage.getItem('notification-modal-dismissed-time');
        if (dismissedTime) {
          const daysSince = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
          if (daysSince > 30) {
            localStorage.removeItem('notification-modal-dismissed');
            localStorage.removeItem('notification-modal-dismissed-time');
          }
        }
      })();
