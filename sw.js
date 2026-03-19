// Service Worker - CorrerJuntos PWA
const CACHE_NAME = 'correrjuntos-v38';
const OFFLINE_URL = '/offline.html';

// Archivos a cachear (NO incluir index.html para que siempre cargue la versión más reciente)
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Blog assets
  '/blog/enhance.js',
  '/blog/related.js',
  '/blog/author.js',
  '/blog/toc.js',
  '/blog/city-links.js',
  // Core modules (Phase 2-3)
  '/js/modules/state.min.js',
  '/js/modules/validation.min.js',
  '/js/modules/error-handler.min.js',
  '/js/modules/toast.min.js',
  '/js/modules/skeletons.min.js',
  '/js/modules/confetti.min.js',
  '/js/modules/darkmode.min.js',
  '/js/modules/badges.min.js',
  '/js/modules/i18n-ui.min.js',
  // Feature modules (Phase 4)
  '/js/modules/ui.min.js',
  '/js/modules/auth.min.js',
  '/js/modules/profile.min.js',
  '/js/modules/map-core.min.js',
  '/js/modules/quedadas.min.js',
  '/js/modules/filters.min.js',
  // i18n + geo data
  '/data/i18n-core.min.js',
  '/data/i18n-es.min.js',
  '/data/i18n-en.min.js',
  '/data/geo-data.min.js',
  // External CDN
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache abierto');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Estrategia de fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Solo manejar GET requests
  if (event.request.method !== 'GET') return;
  
  // Ignorar requests de Supabase y APIs externas
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('nominatim') ||
      url.hostname.includes('openstreetmap')) {
    return;
  }

  // Siempre traer index.html de la red (no cachear)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, guardarla en cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Si es una navegación, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push recibido:', event);
  
  let data = {
    title: 'CorrerJuntos',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    url: '/'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-96.png',
    vibrate: [100, 50, 100, 50, 100],
    data: {
      url: data.url || '/',
      quedada_id: data.data?.quedada_id
    },
    actions: [
      { action: 'open', title: 'Ver quedada' },
      { action: 'close', title: 'Cerrar' }
    ],
    requireInteraction: true,
    tag: data.data?.quedada_id || 'general'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Si no, abrir nueva ventana
      return clients.openWindow(url);
    })
  );
});
