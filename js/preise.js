/* ERGUN. – Preis-Bereich mit Stufen, Extras, Betreuung und Rechner (Auftrag 7, ERGUN. 28.09.2026).
   Ausnahme auf ERGUNs Wunsch: Preise stehen offen auf der Seite („Was es kostet, steht hier – nicht erst im Angebot“).
   Nichts wird gespeichert (keine Cookies, kein localStorage) – die Auswahl lebt nur in dieser Seite.

   ========================================================================================================
   PREISE – DIE EINE STELLE FÜR ALLE ZAHLEN. Hier ändern, sonst nirgends.
   Auch die Karten im Kontaktformular (Website · Automatisierung · endo für Ihr Unternehmen) lesen von hier.
   preis = einmalig in €, monat = monatlich in €, ab = true → „ab“ davor. Quelle: Obsidian „02 Preise/Webdesign-Pakete (Erstgespräch)“.
   ======================================================================================================== */
window.PREISE = {
  stufen: [
    { id: 'start', name: 'Start', preis: 500, ab: false,
      punkte: ['Onepager', 'Eigenes Design', 'Für Handy & PC', 'Kontakt per WhatsApp & E-Mail', '3 eigene Bilder', '1 Korrekturrunde'] },
    { id: 'business', name: 'Business', preis: 1000, ab: true,
      punkte: ['Bis 5 Seiten', 'Animation & Parallax', '10 eigene Bilder + 1 Video-Loop', 'Anfrage-Formular', '2 Korrekturrunden'] },
    { id: 'pro', name: 'Pro', preis: 1900, ab: true,
      punkte: ['Bis 10 Seiten', 'Premium-Design', 'Scroll-Story oder 3D-Element', '20 eigene Bilder + Video im Kopfbereich', '1 Sonderfunktion (z. B. Terminbuchung, Rechner)', '3 Korrekturrunden'] }
  ],
  ueberall: 'In jeder Stufe: Impressum- und Datenschutz-Vorlage, ohne Cookies.',
  module: [
    { id: 'unterseite', name: 'Zusätzliche Unterseite', satz: 'Eine weitere Seite, zum Beispiel für Leistungen oder Team.', preis: 100 },
    { id: 'termin', name: 'Terminbuchung', satz: 'Ihre Kunden buchen Termine direkt auf der Website.', preis: 250 },
    { id: 'regler', name: 'Vorher/Nachher-Regler', satz: 'Zwei Bilder zum Vergleichen, per Schieberegler.', preis: 100 },
    { id: 'formular', name: 'Erweitertes Anfrage-Formular', satz: 'Mit Datei-Upload und Wunschtermin.', preis: 150 },
    { id: 'sprache', name: 'Zusätzliche Sprache', satz: 'Die ganze Website in einer weiteren Sprache.', preis: 300 },
    { id: 'bilder', name: '10 weitere eigene Bilder', satz: 'Zehn zusätzliche Bilder, eigens für Sie gestaltet.', preis: 100 },
    { id: 'loop', name: 'Video-Loop', satz: 'Ein kurzes, ruhiges Video, das sich endlos wiederholt.', preis: 150 },
    { id: '3d', name: '3D-Element', satz: 'Ein Objekt, das sich beim Scrollen dreht oder bewegt.', preis: 200 }
  ],
  betreuung: { id: 'betreuung', name: 'Website-Betreuung', monat: 50, punkte: ['Hosting, Domain & SSL', 'Sicherungen', 'Updates & Sicherheit', 'Kleine Textänderungen'],
    ohne: 'Ich kümmere mich selbst um Hosting.' },
  mehr: [
    { id: 'automatisierung', name: 'Automatisierung – E-Mail & WhatsApp', satz: 'Anfragen per E-Mail und WhatsApp automatisch beantworten, sortieren und weiterleiten.', preis: 1000, monat: 200, ab: true, karte: 'Automatisierung' },
    { id: 'endo', name: 'endo für Ihr Unternehmen', satz: 'Ihr eigener KI-Agent für Ihre Kunden, mit Ihrem Namen und Design.', preis: 4000, monat: 200, ab: true, karte: 'endo für Ihr Unternehmen' }
  ],
  /* endo-Seite „Für Unternehmen“ erst verlinken, wenn sie öffentlich ist (heute gesperrt) – sonst führt „Mehr erfahren“ zum Kontakt */
  endoSeiteOeffentlich: false,
  endoSeite: 'https://endo-ergun.vercel.app/unternehmen',
  klein: 'Unverbindliche Einschätzung, kein Festpreis. Genaue Kalkulation im kostenlosen Erstgespräch.',
  steuer: 'Gemäß §\u00a019\u00a0UStG wird keine Umsatzsteuer berechnet.'   /* Kleinunternehmer laut Impressum; \u00a0 = kein Zeilenumbruch */
};

/* ---------- Rechnen (auch für die Tests) ---------- */
window.PREISE.euro = function (n) { return Math.round(n).toLocaleString('de-DE') + ' €'; };
window.PREISE.betrag = function (x) { return (x.ab ? 'ab ' : '') + window.PREISE.euro(x.preis); };
/* auswahl = { stufe: 'business', module: ['termin'], betreuung: true, mehr: ['endo'] } */
window.PREISE.rechnen = function (auswahl) {
  var P = window.PREISE, a = auswahl || {};
  var stufe = P.stufen.filter(function (s) { return s.id === a.stufe; })[0] || null;
  var module = P.module.filter(function (m) { return (a.module || []).indexOf(m.id) >= 0; });
  var mehr = P.mehr.filter(function (m) { return (a.mehr || []).indexOf(m.id) >= 0; });
  var einmalig = (stufe ? stufe.preis : 0) + module.reduce(function (s, m) { return s + m.preis; }, 0) + mehr.reduce(function (s, m) { return s + m.preis; }, 0);
  var monatlich = (a.betreuung ? P.betreuung.monat : 0) + mehr.reduce(function (s, m) { return s + m.monat; }, 0);
  return { stufe: stufe, module: module, mehr: mehr, betreuung: !!a.betreuung, einmalig: einmalig, monatlich: monatlich, jahr: einmalig + 12 * monatlich };
};
/* Text fürs Kontaktformular (landet in der Nachricht – gesendet wird erst, wenn der Besucher selbst abschickt) */
window.PREISE.anfrageText = function (e) {
  var P = window.PREISE, z = ['Meine Auswahl aus dem Preis-Rechner:'];
  if (e.stufe) z.push('• Website: ' + e.stufe.name + ' (' + P.betrag(e.stufe) + ')');
  if (e.module.length) z.push('• Extras: ' + e.module.map(function (m) { return m.name + ' (' + P.euro(m.preis) + ')'; }).join(', '));
  z.push('• Betreuung: ' + (e.betreuung ? P.euro(P.betreuung.monat) + '/Monat' : 'ohne (Hosting selbst)'));
  if (e.mehr.length) z.push('• Dazu: ' + e.mehr.map(function (m) { return m.name + ' (' + P.betrag(m) + ' + ' + P.euro(m.monat) + '/Monat)'; }).join(', '));
  z.push('Einmalig ' + P.euro(e.einmalig) + ' · monatlich ' + P.euro(e.monatlich) + ' · erstes Jahr ' + P.euro(e.jahr) + ' (unverbindliche Einschätzung)');
  return z.join('\n');
};

/* ---------- Bereich auf der Seite ---------- */
(function () {
  if (typeof document === 'undefined') return;
  var P = window.PREISE, box = document.querySelector('[data-preise]');
  if (!box) return;
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';

  /* Karte = echtes Radio/Checkbox-Feld, die ganze Fläche ist das Label */
  function karte(typ, name, wert, an, innen, extraKlasse) {
    var l = el('label', 'pk' + (extraKlasse ? ' ' + extraKlasse : ''));
    var i = el('input'); i.type = typ; i.name = name; i.value = wert; i.checked = !!an; i.className = 'pk__feld';
    l.appendChild(i);
    var k = el('span', 'pk__innen'); k.appendChild(el('span', 'pk__marke')); k.appendChild(innen); l.appendChild(k);
    return l;
  }
  // 1 Stufen
  var stufenBox = box.querySelector('[data-stufen]');
  P.stufen.forEach(function (s, i) {
    var innen = el('span', 'pk__inhalt');
    innen.appendChild(el('span', 'pk__name', s.name));
    innen.appendChild(el('span', 'pk__preis', P.betrag(s)));
    innen.appendChild(el('span', 'pk__art', 'einmalig'));
    var ul = el('ul', 'pk__liste');
    s.punkte.forEach(function (p) { var li = el('li'); li.innerHTML = HAKEN; li.appendChild(document.createTextNode(p)); ul.appendChild(li); });
    innen.appendChild(ul);
    stufenBox.appendChild(karte('radio', 'stufe', s.id, i === 0, innen, 'pk--stufe'));
  });
  box.querySelector('[data-ueberall]').textContent = P.ueberall;
  // 2 Extras
  var modulBox = box.querySelector('[data-module]');
  P.module.forEach(function (m) {
    var innen = el('span', 'pk__inhalt pk__inhalt--zeile');
    var t = el('span', 'pk__text'); t.appendChild(el('span', 'pk__name pk__name--klein', m.name)); t.appendChild(el('span', 'pk__satz', m.satz));
    innen.appendChild(t); innen.appendChild(el('span', 'pk__preis pk__preis--klein', '+ ' + P.euro(m.preis)));
    modulBox.appendChild(karte('checkbox', 'modul', m.id, false, innen, 'pk--modul'));
  });
  // 3 Betreuung
  var b = P.betreuung, bInnen = el('span', 'pk__inhalt pk__inhalt--zeile');
  var bt = el('span', 'pk__text'); bt.appendChild(el('span', 'pk__name pk__name--klein', b.name)); bt.appendChild(el('span', 'pk__satz', b.punkte.join(' · ')));
  bInnen.appendChild(bt); bInnen.appendChild(el('span', 'pk__preis pk__preis--klein', P.euro(b.monat) + '/Monat'));
  box.querySelector('[data-betreuung]').appendChild(karte('checkbox', 'betreuung', 'ja', true, bInnen, 'pk--modul'));
  var ohneHinweis = box.querySelector('[data-betreuung-ohne]'); ohneHinweis.textContent = b.ohne + ' Monatlich 0 €.';
  // 4 Für mehr
  var mehrBox = box.querySelector('[data-mehr]');
  P.mehr.forEach(function (m) {
    var innen = el('span', 'pk__inhalt');
    innen.appendChild(el('span', 'pk__name pk__name--klein', m.name));
    innen.appendChild(el('span', 'pk__satz', m.satz));
    var pr = el('span', 'pk__preis pk__preis--klein', P.betrag(m)); pr.appendChild(el('span', 'pk__monat', ' + ' + P.euro(m.monat) + '/Monat')); innen.appendChild(pr);
    var l = karte('checkbox', 'mehr', m.id, false, innen, 'pk--mehr');
    if (m.id === 'endo') {
      var a = el('a', 'pk__link', 'Mehr erfahren');
      a.href = P.endoSeiteOeffentlich ? P.endoSeite : '#kontakt';
      if (P.endoSeiteOeffentlich) { a.target = '_blank'; a.rel = 'noopener'; }
      l.querySelector('.pk__inhalt').appendChild(a);
    }
    mehrBox.appendChild(l);
  });

  // Rechner
  var zahlen = [].slice.call(document.querySelectorAll('[data-summe]')), live = document.querySelector('[data-preise-live]'), liveT;
  var alt = { einmalig: 0, monatlich: 0, jahr: 0 };
  function auswahl() {
    var werte = function (n) { return [].slice.call(box.querySelectorAll('input[name="' + n + '"]:checked')).map(function (i) { return i.value; }); };
    return { stufe: werte('stufe')[0], module: werte('modul'), betreuung: werte('betreuung').length > 0, mehr: werte('mehr') };
  }
  function zeigen(neu) {
    zahlen.forEach(function (z) {
      var k = z.getAttribute('data-summe'), von = alt[k], bis = neu[k];
      if (ruhig || von === bis) { z.textContent = P.euro(bis) + (k === 'monatlich' ? '/Monat' : ''); return; }
      var t0 = null;
      function schritt(t) {                      /* kurzes Hochzählen (280 ms), Zahlen in Tabellenziffern → nichts springt */
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 280), w = von + (bis - von) * (1 - Math.pow(1 - p, 3));
        z.textContent = P.euro(w) + (k === 'monatlich' ? '/Monat' : '');
        if (p < 1) requestAnimationFrame(schritt);
      }
      requestAnimationFrame(schritt);
    });
    alt = { einmalig: neu.einmalig, monatlich: neu.monatlich, jahr: neu.jahr };
    clearTimeout(liveT);
    liveT = setTimeout(function () { live.textContent = 'Einmalig ' + P.euro(neu.einmalig) + ', monatlich ' + P.euro(neu.monatlich) + ', erstes Jahr ' + P.euro(neu.jahr) + '.'; }, 400);
  }
  function rechnen() {
    var e = P.rechnen(auswahl());
    ohneHinweis.hidden = e.betreuung;
    zeigen(e);
    return e;
  }
  box.addEventListener('change', rechnen);
  [].forEach.call(document.querySelectorAll('[data-klein-preis]'), function (x) { x.textContent = P.klein + ' ' + P.steuer; });
  rechnen();

  // Anfrage mit dieser Auswahl → Kontakt vorbereiten (nichts wird gesendet)
  function anfragen() {
    var e = P.rechnen(auswahl()), form = document.getElementById('anfrage');
    if (!form) return;
    var karteWert = e.stufe ? 'Website' : (e.mehr[0] ? e.mehr[0].karte : 'Website');
    var r = form.querySelector('input[name="hilfe"][value="' + karteWert + '"]');
    if (r && !r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    var feld = form.elements.text;
    if (feld) {
      var text = P.anfrageText(e), vorher = feld.value.replace(/Meine Auswahl aus dem Preis-Rechner:[\s\S]*?\(unverbindliche Einschätzung\)\n*/g, '').trim();
      feld.value = text + (vorher ? '\n\n' + vorher : '');
      feld.rows = Math.max(feld.rows, Math.min(9, feld.value.split('\n').length + 1));   /* Auswahl ganz sichtbar */
      feld.dispatchEvent(new Event('input', { bubbles: true }));
    }
    var ziel = document.getElementById('kontakt');
    ziel.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { var n = form.elements.name; if (n) n.focus({ preventScroll: true }); }, ruhig ? 0 : 700);
  }
  [].forEach.call(document.querySelectorAll('[data-preise-anfrage]'), function (k) { k.addEventListener('click', anfragen); });

  // Handy: kompakte Leiste unten, solange der Preis-Bereich zu sehen ist und die große Summe nicht
  var leiste = document.querySelector('[data-preise-leiste]'), summe = document.querySelector('[data-preise-summe]');
  if (leiste && summe && 'IntersectionObserver' in window) {
    var imBereich = false, summeSichtbar = false;
    function leisteSetzen() {
      var an = imBereich && !summeSichtbar;
      leiste.classList.toggle('ist-an', an); leiste.setAttribute('aria-hidden', String(!an));
      if (an) leiste.removeAttribute('inert'); else leiste.setAttribute('inert', '');   /* unsichtbar = nicht per Tab erreichbar */
    }
    new IntersectionObserver(function (x) { imBereich = x[0].isIntersecting; leisteSetzen(); }, { rootMargin: '-30% 0px -10% 0px' }).observe(box);
    new IntersectionObserver(function (x) { summeSichtbar = x[0].isIntersecting; leisteSetzen(); }).observe(summe);
  }
})();
