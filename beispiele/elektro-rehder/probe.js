/* Bewegung beim Lesen: Abschnitte blenden ein, nach drei Sekunden ist alles sichtbar. Nichts wird von außen geladen. */
(function () {
  'use strict';

  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var teile = [].slice.call(document.querySelectorAll('.auf'));
  if (!teile.length) return;

  if (ruhig || !('IntersectionObserver' in window)) {
    teile.forEach(function (el) { el.classList.add('da'); });
    return;
  }

  // Versatz nach Position unter Geschwistern, nicht nach Reihenfolge im
  // Dokument: sonst haette das letzte Element einer langen Liste eine
  // Sekunde Verzoegerung.
  teile.forEach(function (el) {
    var eltern = el.parentElement;
    if (!eltern) return;
    var nachbarn = [].filter.call(eltern.children, function (k) {
      return k.classList.contains('auf');
    });
    var platz = nachbarn.indexOf(el);
    if (platz > 0) el.style.setProperty('--auf-warten', Math.min(platz * 60, 120) + 'ms');
  });

  var beo = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('da');
      beo.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  teile.forEach(function (el) { beo.observe(el); });

  // Bleibt der Beobachter stumm, stuende sonst eine leere Seite.
  setTimeout(function () {
    teile.forEach(function (el) { el.classList.add('da'); });
  }, 3000);
})();
