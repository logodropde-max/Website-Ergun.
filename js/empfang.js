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
  /* endo Werkbank (11.10.2026, Paket „endo Werkbank“ Teil E – nur mit PREISE.werkbankAn, Vorschau ?endo=werkbank): Texte wörtlich aus
     „Texte Werkbank (texter).md“ Abschnitt 11. Die Chat-Szene passt dann nicht mehr (endo ist kein Chat mehr, sondern das System für Kunden,
     Anfragen und Angebote) – statt der Szene ein ruhiges Glas-Feld mit drei Stufen Anfrage · Angebot · Auftrag, als „Beispiel“ gekennzeichnet,
     ohne Zahlen, ohne Bewegung außer dem einmaligen Einblenden. Aussehen in ergun-werkbank.css (Präfix wbb-). */
  var TEXTE_WB = {
    titel: 'Website und Büro, die zusammenpassen',
    satz1: 'Ihre Website bringt Anfragen. Mit endo behalten Sie jede davon im Blick, zusammen mit Kontakten und Aufgaben.',
    satz2: 'Wir richten das System ein und betreuen Sie danach per E-Mail.',
    knopf: 'endo ansehen', pfeil: '↗', knopfHilfe: 'endo ansehen (endo-Seite)',
    bildHilfe: 'Beispiel: Anfragen, Angebote und Aufträge an einem Ort', beispiel: 'Beispiel',
    stufen: [
      { name: 'Anfragen', karten: [['Badsanierung', 'über die Website'], ['Rückruf', 'per Telefon']] },
      { name: 'Angebote', karten: [['Dachrinne', 'als PDF verschickt']] },
      { name: 'Aufträge', karten: [['Fassade', 'unterschrieben']] }]
  };
  var ENDO_STANDARD = 'https://endo-ergun.vercel.app/';
  /* Ohne Vorschau (ERGUN. 11.10.2026 abends: „die endo-Vorschau mit dem Diagramm soll weg“): bei der Werkbank nur Titel, Satz und Knopf,
     kein Glas-Feld Anfragen · Angebote · Aufträge. OHNE_BILD_STANDARD = false bis „live“; Vorschau ?empfang=ohne, Rückweg ?empfang=bild. */
  var OHNE_BILD_STANDARD = true;   /* LIVE seit 11.10.2026 nachts (ERGUN.: „Live“), Tag vor-endo-umbau */
  function ohneBild() { var such = (typeof location !== 'undefined' && location.search) || '', q = (/[?&]empfang=(ohne|bild)\b/.exec(such) || [])[1]; return q === 'ohne' || (OHNE_BILD_STANDARD && q !== 'bild'); }
  function werkbank() { var P = window.PREISE; return !!(P && P.werkbankAn); }
  /* das Glas-Feld (role="img": für Vorleseprogramme ein Satz statt vieler Kärtchen) */
  function wbBild() {
    var b = el('div', 'wbb'); b.setAttribute('role', 'img'); b.setAttribute('aria-label', TEXTE_WB.bildHilfe);
    var kopf = el('div', 'wbb__kopf'); kopf.appendChild(el('span', 'wbb__marke', 'endo')); kopf.appendChild(el('span', 'wbb__beispiel', TEXTE_WB.beispiel)); b.appendChild(kopf);
    var sp = el('div', 'wbb__stufen');
    TEXTE_WB.stufen.forEach(function (s, i) {
      var st = el('div', 'wbb__stufe' + (i === TEXTE_WB.stufen.length - 1 ? ' wbb__stufe--fertig' : ''));
      var n = el('p', 'wbb__name', s.name + ' '); n.appendChild(el('b', null, String(s.karten.length))); st.appendChild(n);
      var l = el('div', 'wbb__karten');
      s.karten.forEach(function (k) { var c = el('div', 'wbb__karte'); c.appendChild(el('b', null, k[0])); c.appendChild(el('small', null, k[1])); l.appendChild(c); });
      st.appendChild(l); sp.appendChild(st);
    });
    b.appendChild(sp);
    return b;
  }

  function el(tag, k, t) { var e = document.createElement(tag); if (k) e.className = k; if (t != null) e.textContent = t; return e; }
  function ruhig() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  /* gleicher Link-Wert wie „endo ansehen ↗“ an der Wahl (js/preise.js endoLinkHuelle) */
  function endoZiel() { var P = window.PREISE; return (P && (P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart)) || ENDO_STANDARD; }

  function bauen() {
    if (document.getElementById('empfang')) return null;
    var haupt = document.getElementById('inhalt'), preise = document.getElementById('preise');
    if (!haupt || !preise || preise.parentNode !== haupt) return null;

    var WB = werkbank(), T = WB ? TEXTE_WB : TEXTE, OHNE = WB && ohneBild();
    var s = el('section', 'emp' + (WB ? ' emp--wb' : '') + (OHNE ? ' emp--ohne-bild' : '')); s.id = 'empfang'; s.setAttribute('aria-labelledby', 'empfang-titel');
    var innen = el('div', 'emp__innen');
    var text = el('div', 'emp__text');
    var h = el('h2', 'emp__titel', T.titel); h.id = 'empfang-titel';
    var p = el('p', 'emp__satz', T.satz1 + ' ' + T.satz2);
    var a = el('a', 'emp__knopf', T.knopf + ' ');
    var pf = el('span', null, T.pfeil); pf.setAttribute('aria-hidden', 'true'); a.appendChild(pf);
    a.href = endoZiel(); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-endo-link', ''); a.setAttribute('aria-label', T.knopfHilfe);
    text.appendChild(h); text.appendChild(p); text.appendChild(a);
    var szene = el('div', 'emp__szene'), bild = WB && !OHNE ? wbBild() : null;
    if (bild) szene.appendChild(bild);
    innen.appendChild(text); if (!OHNE) innen.appendChild(szene); s.appendChild(innen);
    haupt.insertBefore(s, preise);

    var sz = !WB && window.ENDO_SZENE ? window.ENDO_SZENE.bauen(szene, { start: 'sichtbar' }) : null;

    /* Text (bei der Werkbank auch das Glas-Feld) einmal einblenden, sobald er ins Bild kommt – ohne Beobachter oder mit „Bewegung reduzieren“ sofort da */
    function da() { text.classList.add('ist-da'); if (bild) bild.classList.add('ist-da'); }
    if (ruhig() || !('IntersectionObserver' in window)) da();
    else {
      s.classList.add('emp--rein');
      var io = new IntersectionObserver(function (e) { if (e.some(function (x) { return x.isIntersecting; })) { io.disconnect(); da(); } }, { rootMargin: '0px 0px -10% 0px' });
      io.observe(text);
      setTimeout(function () { var r = text.getBoundingClientRect(); if (r.top < window.innerHeight) da(); }, 2500);   /* Hintergrund-Tab */
    }
    return { element: s, szene: sz };
  }

  window.ERGUN_EMPFANG = { bauen: bauen, TEXTE: TEXTE, TEXTE_WB: TEXTE_WB, endoZiel: endoZiel, ohneBild: ohneBild, OHNE_BILD_STANDARD: OHNE_BILD_STANDARD };
  window.ERGUN_EMPFANG.jetzt = bauen();
})();
