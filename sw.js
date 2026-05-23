// PDM Service Worker — v1.1
// ⚠️ IMPORTANTE: Cada vez que publiques cambios, incrementa este número de versión
const CACHE_VERSION = 'v1.1';
const CACHE_NAME = 'pdm-' + CACHE_VERSION;

const BASE = '/Prueba1';

const PRECACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/menu.html',
  BASE + '/css/global.css',
  BASE + '/modules/hmi/index.html',
  BASE + '/modules/dashboard/index.html',
  BASE + '/modules/mp/index.html',
  BASE + '/modules/qr/index.html',
  BASE + '/modules/inventario/index.html',
  BASE + '/modules/checklist/index.html'
];

// ── Instalación: pre-cachear recursos clave ──
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting(); // Activa el nuevo SW inmediatamente
    })
  );
});

// ── Activación: limpiar TODOS los caches viejos ──
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) {
              console.log('[SW] Eliminando caché viejo:', k);
              return caches.delete(k);
            })
      );
    }).then(function() {
      return self.clients.claim(); // Toma control de todas las pestañas abiertas
    })
  );
});

// ── Fetch: Network-first con fallback a caché ──
// Así siempre intenta obtener la versión más reciente del servidor.
// Si no hay red (offline), usa la caché.
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  var url = event.request.url;
  if (!url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Respuesta válida del servidor → actualizar caché y devolver
      if (response && response.status === 200 && response.type !== 'opaque') {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      // Sin red → usar caché (modo offline)
      return caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        // Fallback para navegación sin conexión
        if (event.request.mode === 'navigate') {
          return caches.match(BASE + '/index.html');
        }
      });
    })
  );
});
