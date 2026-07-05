// PDM Service Worker
// ──────────────────────────────────────────────────────────────
// ⚠️ Cada vez que publiques cambios, incrementa CACHE_VERSION.
// Esto fuerza al navegador a tratar el SW como "nuevo", reinstalarlo
// y limpiar los cachés anteriores.
// ──────────────────────────────────────────────────────────────
const CACHE_VERSION = 'v2.0';
const CACHE_NAME = 'pdm-' + CACHE_VERSION;

// BASE ya NO se hardcodea (antes decía '/Prueba1' mientras la app
// vivía en '/Prueba2', por eso el precache fallaba silenciosamente
// y el Service Worker nuevo nunca llegaba a activarse).
// Se calcula solo, a partir de dónde está registrado este archivo,
// así funciona sin tocar nada aunque cambies el nombre del repo.
const BASE = new URL('.', self.location).pathname.replace(/\/$/, '');

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
  BASE + '/modules/checklist/index.html',
  BASE + '/modules/sci/index.html'
];

// ── Instalación: pre-cachear recursos clave ──
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // addAll() aborta TODO si una sola URL falla (404, etc).
      // Se cachea una por una para que un recurso roto no tumbe
      // la instalación completa del Service Worker.
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(url).catch(function (err) {
            console.warn('[SW] No se pudo precachear:', url, err);
          });
        })
      );
    }).then(function () {
      return self.skipWaiting(); // Activa el nuevo SW inmediatamente
    })
  );
});

// ── Activación: limpiar TODOS los caches viejos ──
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) {
            console.log('[SW] Eliminando caché viejo:', k);
            return caches.delete(k);
          })
      );
    }).then(function () {
      return self.clients.claim(); // Toma control de todas las pestañas abiertas
    }).then(function () {
      // Avisa a las páginas abiertas que hay una versión nueva activa,
      // para que puedan recargarse solas si quieren.
      return self.clients.matchAll({ type: 'window' }).then(function (clients) {
        clients.forEach(function (client) {
          client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// ── Fetch: Network-first con fallback a caché ──
// Intenta siempre red primero. 'cache: no-store' evita que el propio
// navegador (a nivel HTTP) devuelva una respuesta guardada en su caché
// interno en lugar de ir realmente a GitHub Pages.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = event.request.url;
  if (!url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).then(function (response) {
      if (response && response.status === 200 && response.type !== 'opaque') {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function () {
      // Sin red → usar caché (modo offline)
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match(BASE + '/index.html');
        }
      });
    })
  );
});

// Permite forzar la activación inmediata desde la página (ver registro-sw.js)
self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
