/**
 * Registro centralizado del Service Worker — Mantenimiento PDM
 * ──────────────────────────────────────────────────────────────
 * Antes, cada página registraba el SW con su propio bloque <script>
 * duplicado, sin opciones extra. Este archivo único:
 *
 *  1. Registra el SW con { updateViaCache: 'none' }, lo que le dice
 *     al navegador que NUNCA use su caché HTTP interna para pedir
 *     sw.js — siempre lo descarga fresco. Sin esto, aunque subas
 *     cambios a GitHub, el navegador puede seguir usando una copia
 *     de sw.js guardada en su caché HTTP normal durante varios
 *     minutos (o más), y por lo tanto nunca detecta la versión nueva.
 *
 *  2. Revisa activamente si hay una versión nueva del SW cada vez
 *     que vuelves a la pestaña (visibilitychange), en vez de esperar
 *     pasivamente a que el navegador decida revisar por su cuenta.
 *
 *  3. Cuando el SW nuevo toma el control, recarga la página sola
 *     una vez, para que el usuario vea los cambios sin tener que
 *     borrar caché ni el historial manualmente.
 */
(function () {
  if (!('serviceWorker' in navigator)) return;

  // Calcula la ruta a sw.js relativa a la raíz del sitio, sin
  // importar desde qué módulo/subcarpeta se cargue este script.
  var scriptEl = document.currentScript;
  var swUrl = new URL('../sw.js', scriptEl.src).href;

  var reloading = false;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register(swUrl, { updateViaCache: 'none' })
      .then(function (reg) {
        console.log('[PDM SW] Registrado:', reg.scope);

        // Revisa por actualizaciones cada vez que el usuario vuelve a la pestaña
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') {
            reg.update().catch(function () {});
          }
        });
      })
      .catch(function (err) {
        console.warn('[PDM SW] Error:', err);
      });
  });

  // Cuando el SW nuevo toma el control de la página, recarga una sola vez
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
})();
