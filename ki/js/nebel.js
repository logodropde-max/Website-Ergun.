/* Nachtnebel für Startseite (Übergang zu endo Studio) und /ki/ (ganze Seite).
   Elemente mit data-nebel bekommen drei weiche, nahtlos wiederholbare Nebelstreifen als CSS-Variablen
   --nebel-1..3 (einmal gerechnet, klein, weich hochskaliert). Gerechnet wird erst, wenn die Seite geladen
   ist und der Browser Luft hat – der Start bleibt flüssig. */
(function () {
  function bild(saat, dichte) {
    var c = document.createElement('canvas'), w = 640, h = 160, g = c.getContext('2d'), a = saat;
    function r() { a = (a * 16807) % 2147483647; return a / 2147483647; }
    c.width = w; c.height = h;
    for (var i = 0; i < dichte; i++) {
      var x = r() * w, y = h * (0.35 + r() * 0.4), rx = w * (0.06 + r() * 0.12), ry = h * (0.12 + r() * 0.2), al = 0.05 + r() * 0.08;
      [x - w, x, x + w].forEach(function (xx) {
        g.save(); g.translate(xx, y); g.scale(1, ry / rx);
        var gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        gr.addColorStop(0, 'rgba(172,188,226,' + al + ')'); gr.addColorStop(1, 'rgba(172,188,226,0)');
        g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
      });
    }
    return 'url(' + c.toDataURL('image/png') + ')';
  }
  function fuellen() {
    var el = document.querySelectorAll('[data-nebel]');
    if (!el.length) return;
    var bilder = [[11, 70], [23, 55], [37, 45]].map(function (n) { return bild(n[0], n[1]); });
    el.forEach(function (e) { bilder.forEach(function (b, i) { e.style.setProperty('--nebel-' + (i + 1), b); }); e.classList.add('ist-bereit'); });
  }
  function spaeter() { if (window.requestIdleCallback) requestIdleCallback(fuellen, { timeout: 1500 }); else setTimeout(fuellen, 300); }
  if (document.readyState === 'complete') spaeter(); else window.addEventListener('load', spaeter);
})();
