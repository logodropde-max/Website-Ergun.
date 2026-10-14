/* ERGUN. Abschnitt „Der nächste Schritt für Ihren Betrieb“ mit endo-Logo (Text seit 14.10.2026, vorher „Website und Büro, die zusammenpassen“; seit 07.10.2026, ohne Bild seit 11.10.2026 nachts – ERGUN.: „die endo-Vorschau mit
   dem Diagramm soll weg“). Baut EINEN Abschnitt vor dem Anfrage-Ablauf (#preise): Überschrift, zwei Sätze (wörtlich vom texter, „Texte Werkbank
   (texter).md“ Abschnitt 11) und den Knopf „endo ansehen ↗“ (sekundär, gleicher Link wie „endo ansehen ↗“ bei den Angeboten).
   Kein Netzaufruf, nichts gespeichert. Bewegung: Text blendet einmal ein (nur transform/opacity); „Bewegung reduzieren“ = Endzustand.
   Aussehen: empfang.css (Präfix emp-) + ergun-werkbank.css. */
(function () {
  'use strict';
  var TEXTE = {
    titel: 'Der nächste Schritt für Ihren Betrieb',
    satz1: 'Eine starke Website ist der Anfang. Mit endo bekommt Ihr Betrieb ein intelligentes Betriebssystem, in dem jede Anfrage ankommt, nichts verloren geht und alles an einem Ort bleibt.',
    satz2: 'Eingerichtet von uns, abgestimmt auf Ihre Branche.',
    knopf: 'endo ansehen', pfeil: '↗', knopfHilfe: 'endo ansehen (endo-Seite)'
  };
  var ENDO_ADRESSE = 'https://endo-ergun.vercel.app/';
  /* 14.10.2026: das aktuelle endo-Logo direkt von der endo-Seite (dieselbe Datei wie im Kopf dort) – ändert sich das Logo, ist es hier automatisch gleich */
  var ENDO_LOGO = 'https://endo-ergun.vercel.app/marke/endo-logo.svg';

  function el(tag, k, t) { var e = document.createElement(tag); if (k) e.className = k; if (t != null) e.textContent = t; return e; }
  function ruhig() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  /* gleicher Link-Wert wie „endo ansehen ↗“ an der Wahl (js/preise.js endoLinkHuelle) */
  function endoZiel() { var P = window.PREISE; return (P && P.endoSeite) || ENDO_ADRESSE; }

  function bauen() {
    if (document.getElementById('empfang')) return null;
    var haupt = document.getElementById('inhalt'), preise = document.getElementById('preise');
    if (!haupt || !preise || preise.parentNode !== haupt) return null;

    var T = TEXTE;
    var s = el('section', 'emp emp--wb emp--ohne-bild'); s.id = 'empfang'; s.setAttribute('aria-labelledby', 'empfang-titel');
    var innen = el('div', 'emp__innen');
    var text = el('div', 'emp__text');
    var kopf = el('div', 'emp__kopf');
    var logo = el('img', 'emp__logo'); logo.src = ENDO_LOGO; logo.alt = 'endo'; logo.width = 44; logo.height = 44; logo.decoding = 'async'; logo.loading = 'lazy';
    var h = el('h2', 'emp__titel', T.titel); h.id = 'empfang-titel';
    kopf.appendChild(logo); kopf.appendChild(h);
    var p = el('p', 'emp__satz', T.satz1 + ' ' + T.satz2);
    var a = el('a', 'emp__knopf', T.knopf + ' ');
    var pf = el('span', null, T.pfeil); pf.setAttribute('aria-hidden', 'true'); a.appendChild(pf);
    a.href = endoZiel(); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-endo-link', ''); a.setAttribute('aria-label', T.knopfHilfe);
    text.appendChild(kopf); text.appendChild(p); text.appendChild(a);
    innen.appendChild(text); s.appendChild(innen);
    haupt.insertBefore(s, preise);

    /* Text einmal einblenden, sobald er ins Bild kommt – ohne Beobachter oder mit „Bewegung reduzieren“ sofort da */
    function da() { text.classList.add('ist-da'); }
    if (ruhig() || !('IntersectionObserver' in window)) da();
    else {
      s.classList.add('emp--rein');
      var io = new IntersectionObserver(function (e) { if (e.some(function (x) { return x.isIntersecting; })) { io.disconnect(); da(); } }, { rootMargin: '0px 0px -10% 0px' });
      io.observe(text);
      setTimeout(function () { var r = text.getBoundingClientRect(); if (r.top < window.innerHeight) da(); }, 2500);   /* Hintergrund-Tab */
    }
    return { element: s };
  }

  window.ERGUN_EMPFANG = { bauen: bauen, TEXTE: TEXTE, endoZiel: endoZiel };
  window.ERGUN_EMPFANG.jetzt = bauen();
})();
