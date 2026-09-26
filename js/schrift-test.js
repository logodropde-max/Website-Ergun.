/* Schrift-Vergleich: ?schrift=a|b|c lädt schriften/schrift-test.css und zeigt unten links einen Umschalter.
   Ohne Parameter passiert nichts. Kein Speichern im Browser – der Parameter wird nur an interne Links gehängt. */
(function () {
  var s = new URLSearchParams(location.search).get('schrift');
  if (!/^[0abc]$/.test(s || '')) return;
  var basis = document.currentScript.src.replace(/js\/schrift-test\.js.*$/, '');
  if (s !== '0') document.documentElement.setAttribute('data-schrift', s);
  document.write('<link rel="stylesheet" href="' + basis + 'schriften/schrift-test.css?v=1">');

  function mitSchrift(href, wert) {
    var u = new URL(href, location.href);
    if (wert) u.searchParams.set('schrift', wert); else u.searchParams.delete('schrift');
    return u.pathname + u.search + u.hash;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.closest('.schrift-wahl')) return;
    var u = new URL(a.getAttribute('href'), location.href);
    if (u.origin !== location.origin || /^#/.test(a.getAttribute('href'))) return;
    a.href = mitSchrift(a.href, s);
  }, true);
  document.addEventListener('DOMContentLoaded', function () {
    var box = document.createElement('nav');
    box.className = 'schrift-wahl';
    box.setAttribute('aria-label', 'Schrift-Variante');
    [['0', 'Jetzt'], ['a', 'A'], ['b', 'B'], ['c', 'C']].forEach(function (v) {
      var a = document.createElement('a');
      a.href = mitSchrift(location.href, v[0]);
      a.textContent = v[1];
      if (v[0] === s) a.setAttribute('aria-current', 'true');
      box.appendChild(a);
    });
    document.body.appendChild(box);
  });
})();
