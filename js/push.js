// ========================= PUSH NOTIFICATIONS =========================
(function(){
    const VAPID_PUBLIC_KEY = "BJ_bOVOJcGPEdqUOX9EjYg-5gomGPShP_Kku4ewQHnAgeH1Pw8msO9OtYRxyRqUwt9es8F7WDcc7mqI7gIwVu_0";

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

    // Verificar si push está soportado
    window.isPushSupported = function() {
        return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    };

    // Obtener estado actual de permisos
    window.getPushPermissionState = function() {
        if (!isPushSupported()) return 'unsupported';
        return Notification.permission; // 'default', 'granted', 'denied'
    };

    // Solicitar permiso y suscribirse
    window.requestPushPermission = async function() {
        if (!isPushSupported()) {
            showToast('Tu navegador no soporta notificaciones push', 'error');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                showToast('Permiso de notificaciones denegado', 'error');
                updateNotificationUI();
                return false;
            }

            // Registrar service worker si no está registrado
            if (!navigator.serviceWorker.controller) {
                await navigator.serviceWorker.register('/sw.js');
            }

            // Obtener service worker registration con timeout
            const registration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker timeout')), 10000))
            ]);

            // Suscribirse a push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Guardar suscripción en Supabase
            const saved = await savePushSubscription(subscription);
            if (saved) {
                showToast('Notificaciones activadas', 'success');
                updateNotificationUI();
                return true;
            } else {
                showToast('Error guardando suscripción', 'error');
            }
            return false;
        } catch (error) {
            console.error('Error al activar notificaciones:', error);
            showToast('Error: ' + (error.message || 'No se pudo activar'), 'error');
            updateNotificationUI();
            return false;
        }
    };

    // Guardar suscripción en Supabase
    async function savePushSubscription(subscription) {
        if (!window.supabaseClient || !window.currentUser) return false;

        const subJson = subscription.toJSON();
        const { error } = await window.supabaseClient
            .from('push_subscriptions')
            .upsert({
                user_id: window.currentUser.id,
                endpoint: subJson.endpoint,
                p256dh: subJson.keys.p256dh,
                auth: subJson.keys.auth,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Error guardando suscripción push:', error);
            return false;
        }
        return true;
    }

    // Desactivar notificaciones
    window.disablePushNotifications = async function() {
        try {
            // Eliminar de Supabase primero
            if (window.supabaseClient && window.currentUser) {
                await window.supabaseClient
                    .from('push_subscriptions')
                    .delete()
                    .eq('user_id', window.currentUser.id);
            }

            // Intentar desuscribirse del push manager
            try {
                const registration = await Promise.race([
                    navigator.serviceWorker.ready,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                ]);
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                }
            } catch (e) {
                console.warn('No se pudo desuscribir del push manager:', e);
            }

            showToast('Notificaciones desactivadas', 'info');
            updateNotificationUI();
            return true;
        } catch (error) {
            console.error('Error al desactivar notificaciones:', error);
            showToast('Error al desactivar', 'error');
            updateNotificationUI();
            return false;
        }
    };

    // Verificar si el usuario está suscrito
    window.isUserSubscribedToPush = async function() {
        if (!isPushSupported()) return false;
        try {
            const registration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
            ]);
            const subscription = await registration.pushManager.getSubscription();
            return !!subscription;
        } catch {
            return false;
        }
    };

    // Actualizar UI de notificaciones
    window.updateNotificationUI = async function() {
        const toggleBtn = document.getElementById('notif-toggle-btn');
        const statusText = document.getElementById('notif-status-text');
        if (!toggleBtn || !statusText) return;

        const isSubscribed = await isUserSubscribedToPush();
        const permission = getPushPermissionState();

        if (permission === 'denied') {
            toggleBtn.disabled = true;
            toggleBtn.classList.remove('bg-orange-500', 'bg-slate-600');
            toggleBtn.classList.add('bg-gray-500');
            statusText.textContent = 'Bloqueadas en el navegador';
        } else if (isSubscribed) {
            toggleBtn.disabled = false;
            toggleBtn.classList.remove('bg-slate-600', 'bg-gray-500');
            toggleBtn.classList.add('bg-orange-500');
            toggleBtn.querySelector('span').style.transform = 'translateX(20px)';
            statusText.textContent = 'Activadas';
        } else {
            toggleBtn.disabled = false;
            toggleBtn.classList.remove('bg-orange-500', 'bg-gray-500');
            toggleBtn.classList.add('bg-slate-600');
            toggleBtn.querySelector('span').style.transform = 'translateX(0)';
            statusText.textContent = 'Desactivadas';
        }
    };

    // Toggle notificaciones
    window.togglePushNotifications = async function() {
        const isSubscribed = await isUserSubscribedToPush();
        if (isSubscribed) {
            await disablePushNotifications();
        } else {
            await requestPushPermission();
        }
    };

    // Cargar preferencias de notificación del usuario
    window.loadNotificationPreferences = async function() {
        if (!window.supabaseClient || !window.currentUser) return null;

        const { data, error } = await window.supabaseClient
            .from('notificacion_preferencias')
            .select('*')
            .eq('user_id', window.currentUser.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error cargando preferencias:', error);
        }
        return data;
    };

    // Guardar preferencia individual
    window.saveNotificationPreference = async function(key, value) {
        if (!window.supabaseClient || !window.currentUser) return false;

        const { error } = await window.supabaseClient
            .from('notificacion_preferencias')
            .upsert({
                user_id: window.currentUser.id,
                [key]: value,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Error guardando preferencia:', error);
            showToast('Error al guardar preferencia', 'error');
            return false;
        }
        return true;
    };
})();
