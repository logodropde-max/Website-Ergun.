/* ERGUN. „Website mit eingebautem Empfang“ (endo klar Teil 2, Teil D, 07.10.2026) – VORSCHAU ?empfang=an, Schalter EMPFANG_STANDARD im Kopf von index.html.
   Wird NUR mit dem Schalter geladen (dazu endo-szene.css, empfang.css, js/endo-szene.js). Baut EINEN Abschnitt vor dem Anfrage-Ablauf (#preise):
   Überschrift, zwei Sätze (wörtlich vom texter), Knopf „endo ansehen ↗“ (sekundär, gleicher Link wie „endo ansehen ↗“ bei den Angeboten)
   und darin die Kopf-Szene der endo-Seite als Baustein aus GLEICHER Quelle (js/endo-szene.js = 1:1-Kopie aus endo-studio,
   gezogen mit _code/werkzeuge/endo-szene-ziehen.mjs – nie von Hand ändern). Kein Netzaufruf, nichts gespeichert.
   Bewegung: Text blendet einmal ein (nur transform/opacity), die Szene spielt einmal, wenn sie ins Bild kommt; „Bewegung reduzieren“ = Endzustand. */
(function () {
  'use strict';
  var TEXTE = {
    titel: 'Website mit eingebautem Empfang',
    satz1: 'Auf Wunsch bauen wir den Chat endo gleich in Ihre Website ein.',
    satz2: 'Er antwortet Ihren Kunden sofort, und jede Anfrage kommt bei Ihnen als fertiger Kontakt an.',
    knopf: 'endo ansehen', pfeil: '↗', knopfHilfe: 'endo ansehen (endo-Seite)'
  };
  var ENDO_STANDARD = 'https://endo-ergun.vercel.app/';

  function el(tag, k, t) { var e = document.createElement(tag); if (k) e.className = k; if (t != null) e.textContent = t; return e; }
  function ruhig() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  /* gleicher Link-Wert wie „endo ansehen ↗“ an der Wahl (js/preise.js endoLinkHuelle) */
  function endoZiel() { var P = window.PREISE; return (P && (P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart)) || ENDO_STANDARD; }

  function bauen() {
    if (document.getElementById('empfang')) return null;
    var haupt = document.getElementById('inhalt'), preise = document.getElementById('preise');
    if (!haupt || !preise || preise.parentNode !== haupt) return null;

    var s = el('section', 'emp'); s.id = 'empfang'; s.setAttribute('aria-labelledby', 'empfang-titel');
    var innen = el('div', 'emp__innen');
    var text = el('div', 'emp__text');
    var h = el('h2', 'emp__titel', TEXTE.titel); h.id = 'empfang-titel';
    var p = el('p', 'emp__satz', TEXTE.satz1 + ' ' + TEXTE.satz2);
    var a = el('a', 'emp__knopf', TEXTE.knopf + ' ');
    var pf = el('span', null, TEXTE.pfeil); pf.setAttribute('aria-hidden', 'true'); a.appendChild(pf);
    a.href = endoZiel(); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-endo-link', ''); a.setAttribute('aria-label', TEXTE.knopfHilfe);
    text.appendChild(h); text.appendChild(p); text.appendChild(a);
    var szene = el('div', 'emp__szene');
    innen.appendChild(text); innen.appendChild(szene); s.appendChild(innen);
    haupt.insertBefore(s, preise);

    var sz = window.ENDO_SZENE ? window.ENDO_SZENE.bauen(szene, { start: 'sichtbar' }) : null;

    /* Text einmal einblenden, sobald er ins Bild kommt – ohne Beobachter oder mit „Bewegung reduzieren“ sofort da */
    if (ruhig() || !('IntersectionObserver' in window)) text.classList.add('ist-da');
    else {
      s.classList.add('emp--rein');
      var io = new IntersectionObserver(function (e) { if (e.some(function (x) { return x.isIntersecting; })) { io.disconnect(); text.classList.add('ist-da'); } }, { rootMargin: '0px 0px -10% 0px' });
      io.observe(text);
      setTimeout(function () { var r = text.getBoundingClientRect(); if (r.top < window.innerHeight) text.classList.add('ist-da'); }, 2500);   /* Hintergrund-Tab */
    }
    return { element: s, szene: sz };
  }

  window.ERGUN_EMPFANG = { bauen: bauen, TEXTE: TEXTE, endoZiel: endoZiel };
  window.ERGUN_EMPFANG.jetzt = bauen();
})();
