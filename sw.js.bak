// PDM Service Worker — v1.0
const CACHE_NAME = 'pdm-v1';

const BASE = '/Prueba2';

const PRECACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/menu.html',
  BASE + '/css/global.css',
  BASE + '/modules/hmi/index.html',
  BASE + '/modules/dashboard/index.html',
  BASE + '/modules/mp/index.html',
  BASE + '/modules/qr/index.html',
  BASE + '/modules/inventario/index.html'
];

// ── Instalación: pre-cachear recursos clave ──
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── Activación: limpiar caches viejos ──
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch: cache-first, red como fallback ──
self.addEventListener('fetch', function(event) {
  // Solo interceptar GET
  if (event.request.method !== 'GET') return;

  // Ignorar peticiones de extensiones del browser
  var url = event.request.url;
  if (!url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      return fetch(event.request).then(function(response) {
        // Solo cachear respuestas válidas de nuestro origen
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function() {
        // Fallback offline: devolver index.html para navegación
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
