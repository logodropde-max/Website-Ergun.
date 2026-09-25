/* Daten-Hintergrund (ki/studio.css): Bilder erst holen, wenn die Seite geladen ist und der Browser Luft hat –
   der Start bleibt flüssig. Außerhalb des Bildes halten die Ebenen still (.daten-pause). Ersetzt ki/js/nebel.js. */
(function () {
  function bereit() {
    document.querySelectorAll('[data-daten]').forEach(function (el) {
      el.classList.add('ist-bereit');
      if (!('IntersectionObserver' in window)) return;
      new IntersectionObserver(function (e) { el.classList.toggle('daten-pause', !e[0].isIntersecting); }).observe(el);
    });
  }
  function spaeter() { if (window.requestIdleCallback) requestIdleCallback(bereit, { timeout: 1500 }); else setTimeout(bereit, 300); }
  if (document.readyState === 'complete') spaeter(); else window.addEventListener('load', spaeter);
})();
