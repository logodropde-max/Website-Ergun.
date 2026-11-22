/* Beispielseiten von ERGUN.: Balken oben, alles Kaufen/Senden/Weiterleiten wird zu „Nur Beispiel“. Nichts wird gespeichert oder gesendet.
   Eingebunden von _code/werkzeuge/beispiel-aufbereiten.mjs (dort steht auch, was schon beim Aufbereiten entfernt wird). */
(function () {
  'use strict';
  var KAUF = /kauf|warenkorb|korb|cart|checkout|kasse|bestell|order|buy|bezahl|pay|abonn|subscribe|anmelden|registrier|sign ?up|login|einloggen|send|absend|anfrag|termin|buchen|book/i;
  var html = document.documentElement;
  var RECHT = /impressum|datenschutz|privacy|agb|terms|widerruf|imprint|legal|cookie|nutzungsbedingungen/i;
  /* Rechtsseiten der Vorlage gehören nicht zum Beispiel: Links dorthin ausblenden (auch nach einem Neuaufbau der Seite) */
  function rechtWeg() {
    [].forEach.call(document.querySelectorAll('a'), function (a) {
      if (!a.closest('.ebz-balken') && RECHT.test((a.getAttribute('href') || '') + ' ' + a.textContent)) a.style.setProperty('display', 'none', 'important');
    });
  }
  function hinweis() {
    var h = document.querySelector('.ebz-hinweis');
    if (!h) { h = document.createElement('div'); h.className = 'ebz-hinweis'; h.setAttribute('role', 'status'); h.setAttribute('aria-live', 'polite'); document.body.appendChild(h); }
    h.textContent = 'Nur Beispiel: Diese Seite zeigt, wie eine Website von ERGUN. aussehen kann.';
    h.classList.add('ist-da'); clearTimeout(hinweis.t); hinweis.t = setTimeout(function () { h.classList.remove('ist-da'); }, 2600);
  }
  function balken() {
    if (document.querySelector('.ebz-balken') || !document.body) return;
    var b = document.createElement('div'); b.className = 'ebz-balken'; b.setAttribute('role', 'note');
    b.innerHTML = '<span><b>Beispielseite von ERGUN<i>.</i></b></span><a href="../../#beispiele">Zurück zu ERGUN.</a>';
    document.documentElement.appendChild(b);   /* außerhalb von <body>: Seiten mit eigenem Aufbau (Next.js) zeichnen den Körper neu, der Balken bleibt */
    html.classList.add('ebz-an');
    function messen() {
      var hoehe = b.offsetHeight || 40; html.style.setProperty('--ebz-hoehe', hoehe + 'px');
      /* feste Kopfleisten der Vorlage rutschen unter den Balken */
      [].forEach.call(document.body.querySelectorAll('*'), function (e) {
        if (e === b || b.contains(e) || e.closest('.ebz-balken')) return;
        var s = getComputedStyle(e);
        if ((s.position === 'fixed' || s.position === 'sticky') && parseFloat(s.top) < hoehe && e.getBoundingClientRect().height < window.innerHeight * 0.6) {
          if (!e.hasAttribute('data-ebz-top')) e.setAttribute('data-ebz-top', s.top);
          e.style.setProperty('top', 'calc(' + (e.getAttribute('data-ebz-top') === 'auto' ? '0px' : e.getAttribute('data-ebz-top')) + ' + ' + hoehe + 'px)', 'important');
        }
      });
    }
    rechtWeg(); messen(); window.addEventListener('load', messen); window.addEventListener('resize', messen); setTimeout(messen, 1200);
  }
  /* Formulare: nie senden */
  document.addEventListener('submit', function (e) { e.preventDefault(); e.stopPropagation(); hinweis(); }, true);
  /* Links nach draußen, Kauf- und Sende-Knöpfe: nur Hinweis */
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]');
    if (!z || z.closest('.ebz-balken')) return;
    var gesperrt = z.hasAttribute('data-nur-beispiel');
    /* Links: nur Sprünge auf derselben Seite (#…) sind erlaubt – Unterseiten, andere Seiten, Mail, Telefon gibt es im Beispiel nicht */
    if (!gesperrt && z.tagName === 'A') { var h = z.getAttribute('href') || ''; gesperrt = !!h && h.charAt(0) !== '#'; }
    if (!gesperrt && z.tagName !== 'A') {
      var text = (z.textContent || z.value || z.getAttribute('aria-label') || '').trim();
      gesperrt = z.type === 'submit' || (z.form && z.type !== 'button' && z.tagName === 'BUTTON') || KAUF.test(text);
    }
    if (gesperrt) { e.preventDefault(); e.stopImmediatePropagation(); hinweis(); }
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', balken); else balken();
  /* Seiten mit eigenem Aufbau (Next.js) zeichnen den Körper beim Start neu – dann kommt der Balken sofort wieder */
  if ('MutationObserver' in window) new MutationObserver(function () { if (!document.querySelector('.ebz-balken') && document.body) balken(); rechtWeg(); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
