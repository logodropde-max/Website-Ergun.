/* ERGUN. – Preis-Bereich in 4 Schritten mit Rechner (Auftrag 9 Gesamtfassung, 28.09.2026; ersetzt Auftrag 7).
   Ausnahme auf ERGUNs Wunsch: Preise stehen offen auf der Seite. Nichts wird gespeichert (keine Cookies, kein localStorage) –
   die Auswahl lebt nur in dieser Seite, gesendet wird erst, wenn der Besucher das Kontaktformular selbst abschickt.

   ========================================================================================================
   PREISE + BEGRIFFE – DIE EINE STELLE FÜR ALLE ZAHLEN UND TEXTE. Hier ändern, sonst nirgends.
   Auch die Karten im Kontaktformular lesen von hier. Quelle: Obsidian „02 Preise/Webdesign-Pakete (Erstgespräch)“.
   preis = einmalig in €, ab = true → „ab“ davor, monat = monatlich in €.
   b = Begriff(e) aus BEGRIFFE, die das ⓘ neben einem Punkt öffnet.
   ======================================================================================================== */
window.PREISE = {
  /* ① Website – drei Stufen (eine wählbar). empfehlung = dezentes Schild „Empfehlung“ (Ausnahme auf ERGUNs Wunsch). */
  stufen: [
    { id: 'start', name: 'Start', preis: 500, ab: false, fuer: 'Für Selbstständige, Handwerker und kleine Betriebe',
      punkte: [{ t: 'Website für Handy & PC' }, { t: 'Bis zu 3 Seiten' }, { t: 'Kontaktformular (WhatsApp & E-Mail)' }, { t: 'SEO-Grundlagen', b: ['seo'] },
        { t: 'DSGVO-Grundlagen', b: ['dsgvo'] }, { t: 'Hosting-Einrichtung & SSL', b: ['hosting', 'ssl'] }, { t: '3 eigene Bilder' }, { t: '1 Korrekturrunde', b: ['korrektur'] }] },
    { id: 'business', name: 'Business', preis: 1000, ab: true, empfehlung: true,   /* Schild „Empfehlung“ – seit 9b keine Vorauswahl */
      fuer: 'Für Unternehmen, die professionell auftreten wollen',
      punkte: [{ t: 'Bis zu 8 Seiten' }, { t: 'Individuelles Design' }, { t: 'Animationen & Parallax', b: ['parallax'] }, { t: 'Leistungsseiten & Referenzen' },
        { t: 'Anfrage-Formular' }, { t: '10 eigene Bilder + Video-Loop', b: ['loop'] }, { t: 'SEO-Grundlagen', b: ['seo'] }, { t: 'Schnelle Ladezeit', b: ['ladezeit'] }, { t: '2 Korrekturrunden', b: ['korrektur'] }] },
    { id: 'pro', name: 'Pro', preis: 1900, ab: true, fuer: 'Für Unternehmen mit höheren Ansprüchen',
      punkte: [{ t: 'Premium-Website mit eigenem Konzept' }, { t: 'Aufwendige Animationen (Scroll-Story, 3D-Element)', b: ['3d'] }, { t: '20 eigene Bilder + Video im Kopfbereich' },
        { t: 'Individuelle Funktion (z. B. Terminbuchung, Rechner)', b: ['funktion'] }, { t: 'Erweiterte Formulare' }, { t: 'Mehrsprachig möglich' },
        { t: 'Besucherstatistik ohne Cookies', b: ['statistik'] }, { t: 'Schnelle Ladezeit', b: ['ladezeit'] }, { t: '3 Korrekturrunden', b: ['korrektur'] }] }
  ],
  /* ② Extras – in Gruppen. Im Rechner zählt der „ab“-Wert. */
  extras: [
    { gruppe: 'Seiten & Inhalte', eintraege: [
      { id: 'unterseite', name: 'Zusätzliche Unterseite', satz: 'Zum Beispiel für ein neues Angebot oder einen Standort.', preis: 100, ab: true },
      { id: 'sprache', name: 'Zusätzliche Sprache', satz: 'Komplett übersetzt, mit Sprachumschalter.', preis: 300, ab: true },
      { id: 'bilder', name: '10 weitere eigene Bilder', satz: 'Zehn zusätzliche Bilder, eigens für Sie gestaltet.', preis: 100 }] },
    { gruppe: 'Design & Bewegung', eintraege: [
      { id: 'animation', name: 'Premium-Animation', satz: 'Aufwendige Scroll- und Bewegungseffekte.', preis: 150, ab: true },
      { id: 'loop', name: 'Video-Loop', satz: 'Kurzes, lautloses Video in Schleife.', preis: 150, b: ['loop'] },
      { id: '3d', name: '3D-Element', satz: 'Ein Objekt, zum Beispiel Ihr Produkt, zum Drehen.', preis: 200, ab: true, b: ['3d'] }] },
    { gruppe: 'Funktionen', eintraege: [
      { id: 'formular', name: 'Erweitertes Anfrage-Formular', satz: 'Mit Wunschtermin und Datei-Upload.', preis: 150, ab: true },
      { id: 'termin', name: 'Terminbuchung', satz: 'Ihre Kunden buchen Termine direkt auf der Website.', preis: 250, ab: true },
      { id: 'regler', name: 'Vorher/Nachher-Regler', satz: 'Zwei Bilder zum Vergleichen, per Schieberegler.', preis: 100 },
      { id: 'funktion', name: 'Individuelle Funktion', satz: 'Zum Beispiel ein Rechner oder Konfigurator.', preis: 250, ab: true, b: ['funktion'] }] },
    { gruppe: 'Sichtbarkeit', eintraege: [
      { id: 'seo', name: 'SEO-Paket', satz: 'Ausrichtung auf Ihre Suchbegriffe, strukturierte Daten.', preis: 300, b: ['seoPaket'] },
      { id: 'google', name: 'Google-Unternehmensprofil', satz: 'Eintrag in Suche und Maps einrichten und pflegen.', preis: 150, b: ['google'] }] }
  ],
  /* Auf Anfrage: ohne Preis, nicht im Rechner – nur für die Anfrage vormerken */
  aufAnfrage: [
    { id: 'cms', name: 'Inhalte selbst pflegen (CMS)' },
    { id: 'login', name: 'Kundenbereich mit Login' },
    { id: 'dashboard', name: 'Übersicht/Dashboard' }],
  /* ③ Betreuung – drei Stufen (eine wählbar). selbst = so viel günstiger, wenn Hosting & Domain selbst gestellt werden. */
  betreuung: {
    satz: 'Ein fester Monatspreis – Hosting, Domain und SSL sind enthalten. Eine Rechnung statt drei.',
    selbst: 20, selbstText: 'Hosting & Domain stelle ich selbst',
    stufen: [
      { id: 'basis', name: 'Basis', monat: 50, fuer: 'Websites ohne Login und Datenbank',
        punkte: ['Hosting, Domain & SSL', 'Updates & Sicherheit', 'Sicherungen', 'Erreichbarkeit geprüft', 'Kleine Textänderungen'] },
      { id: 'aktiv', name: 'Aktiv', monat: 100, fuer: 'Websites mit Terminbuchung, Formularen, regelmäßigen Änderungen',
        punkte: ['Alles aus Basis', 'Betreuung der Funktionen', 'E-Mail-Versand der Formulare', 'Inhaltsänderungen nach Absprache', 'Kurzer Monatsbericht'] },
      { id: 'rundum', name: 'Rundum', monat: 200, fuer: 'Automatisierung, endo, Systeme mit Datenbank',
        punkte: ['Alles aus Aktiv', 'Betrieb & Sicherung der Datenbank', 'Betreuung von Automatisierung/endo', 'Bevorzugte Bearbeitung', 'Weiterentwicklung nach Absprache'] }
    ]
  },
  /* Automatisierung & KI → endo (Auftrag 10, ERGUN. 28.09.2026: „ERGUN. baut Ihre Website. endo automatisiert Ihren Betrieb.“ –
     Automatisierung gibt es nur noch über endo). Eine Option wählbar (oder keine); setzt die Betreuung auf Rundum (dort ist der
     laufende Betrieb enthalten; monat = Anzeige auf Karte und Formular). endo wird gemietet: Einrichtung einmalig + monatlich. */
  mehr: [
    { id: 'faehigkeit', name: 'Eine Fähigkeit', satz: 'Zum Beispiel Empfang: Anfragen per E-Mail und WhatsApp automatisch beantworten, sortieren und weiterleiten.', preis: 1000, monat: 200, ab: true },
    { id: 'komplett', name: 'endo komplett', satz: 'Alle Fähigkeiten: Empfang, Termine, Social, Studio und Übersicht.', preis: 4000, monat: 200, ab: true }
  ],
  mehrTitel: 'Automatisierung & KI → endo',
  mehrSatz: 'Automatisierung und KI für Ihren Betrieb laufen über endo – ebenfalls von ERGUN.',
  /* EINE Karte im Kontaktformular für alles aus „mehr“ (Preis = günstigste Option) */
  endoKarte: 'Automatisierung & KI mit endo',
  mehrStufe: 'rundum',
  /* Auftrag 9b: ruhige endo-Zeile in Schritt ② und ③ und die Auswahl „Wo soll endo helfen?“ im Kontaktformular */
  endoHinweis: 'Automatisierung & KI? endo übernimmt Anfragen, Termine, Social Media und mehr.',
  endoHilfe: ['Empfang (Anfragen per E-Mail & WhatsApp)', 'Termine', 'Social Media', 'Übersicht', 'Kontakte (CRM)', 'Bilder & Videos (Studio)'],
  /* „endo ansehen“: /unternehmen erst, wenn die Seite öffentlich ist (heute gesperrt) – sonst die endo-Startseite */
  endoSeiteOeffentlich: false,
  endoSeite: 'https://endo-ergun.vercel.app/unternehmen',
  endoStart: 'https://endo-ergun.vercel.app/',
  klein: 'Unverbindliche Einschätzung, kein Festpreis. Die genaue Kalkulation klären wir im kostenlosen Erstgespräch.',
  steuer: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'   /* Kleinunternehmer laut Impressum;   = kein Zeilenumbruch */
};

/* Begriffe erklärt (eingeklappt unter ④). Die ⓘ-Punkte öffnen den passenden Begriff. Keine Platzierungs-Versprechen. */
window.BEGRIFFE = {
  seo: { name: 'SEO-Grundlagen', text: 'Saubere Titel, Beschreibungen und Struktur, damit Suchmaschinen Ihre Seite richtig lesen – ohne Werbekampagne und ohne Platzierungs-Versprechen.' },
  seoPaket: { name: 'SEO-Paket', text: 'Zusätzlich Ausrichtung auf Ihre wichtigsten Suchbegriffe und strukturierte Daten für ausführlichere Suchergebnisse.' },
  google: { name: 'Google-Unternehmensprofil', text: 'Ihr Eintrag in Suche und Maps mit Öffnungszeiten, Fotos und Kontakt.' },
  dsgvo: { name: 'DSGVO-Grundlagen', text: 'Impressum, Datenschutzerklärung und datenschutzgerechte Formulare – ohne Cookie-Banner, weil keine Cookies gesetzt werden.' },
  ssl: { name: 'SSL', text: 'Verschlüsselte Verbindung (das Schloss im Browser), immer enthalten.' },
  hosting: { name: 'Hosting', text: 'Der Ort, an dem Ihre Website im Internet liegt.' },
  ladezeit: { name: 'Schnelle Ladezeit', text: 'Optimierte Bilder und schlanker Code – auch auf dem Handy sofort da.' },
  parallax: { name: 'Parallax', text: 'Ebenen, die sich beim Scrollen unterschiedlich schnell bewegen.' },
  loop: { name: 'Video-Loop', text: 'Kurzes, lautloses Video in Schleife.' },
  '3d': { name: '3D-Element', text: 'Ein Objekt, zum Beispiel Ihr Produkt, zum Drehen.' },
  statistik: { name: 'Besucherstatistik ohne Cookies', text: 'Wie viele Besucher kommen und was sie ansehen – ohne persönliche Daten.' },
  korrektur: { name: 'Korrekturrunde', text: 'Sie sammeln Änderungswünsche, wir setzen sie gemeinsam um.' },
  funktion: { name: 'Individuelle Funktion', text: 'Etwas, das genau Ihr Betrieb braucht, zum Beispiel ein Preisrechner.' }
};

/* ---------- Rechnen (auch für die Tests) ---------- */
(function (P) {
  P.euro = function (n) { return Math.round(n).toLocaleString('de-DE') + ' €'; };
  P.betrag = function (x) { return (x.ab ? 'ab ' : '') + P.euro(x.preis); };
  P.alleExtras = function () { return P.extras.reduce(function (l, g) { return l.concat(g.eintraege); }, []); };
  /* Standard-Betreuung zur Auswahl: Automatisierung/endo → Rundum · Pro mit Terminbuchung oder Funktion → Aktiv · sonst Basis */
  P.betreuungStandard = function (a) {
    a = a || {};
    if ((a.mehr || []).length) return P.mehrStufe;
    if (a.stufe === 'pro' && (a.extras || []).some(function (x) { return x === 'termin' || x === 'funktion'; })) return 'aktiv';
    return 'basis';
  };
  /* auswahl = { stufe: 'business', extras: ['termin'], betreuung: 'basis', selbst: false, mehr: [], anfrage: ['cms'] } */
  P.rechnen = function (auswahl) {
    var a = auswahl || {};
    var stufe = P.stufen.filter(function (s) { return s.id === a.stufe; })[0] || null;
    var extras = P.alleExtras().filter(function (m) { return (a.extras || []).indexOf(m.id) >= 0; });
    var mehr = P.mehr.filter(function (m) { return (a.mehr || []).indexOf(m.id) >= 0; });
    var bId = a.betreuung === undefined ? P.betreuungStandard(a) : a.betreuung;
    var betreuung = P.betreuung.stufen.filter(function (b) { return b.id === bId; })[0] || null;
    var monatlich = betreuung ? betreuung.monat - (a.selbst ? P.betreuung.selbst : 0) : 0;
    var teile = [stufe].concat(extras, mehr).filter(Boolean);
    var einmalig = teile.reduce(function (s, x) { return s + x.preis; }, 0);
    return { stufe: stufe, extras: extras, mehr: mehr, betreuung: betreuung, selbst: !!a.selbst, anfrage: P.aufAnfrage.filter(function (x) { return (a.anfrage || []).indexOf(x.id) >= 0; }),
      einmalig: einmalig, ab: teile.some(function (x) { return x.ab; }), monatlich: monatlich, jahr: einmalig + 12 * monatlich };
  };
  /* Text fürs Kontaktformular (landet in der Nachricht – gesendet wird erst, wenn der Besucher selbst abschickt) */
  P.anfrageText = function (e) {
    var z = ['Meine Auswahl aus dem Preis-Rechner:'], ab = e.ab ? 'ab ' : '';
    if (e.stufe) z.push('• Website: ' + e.stufe.name + ' (' + P.betrag(e.stufe) + ')');
    if (e.extras.length) z.push('• Extras: ' + e.extras.map(function (m) { return m.name + ' (' + P.betrag(m) + ')'; }).join(', '));
    if (e.anfrage.length) z.push('• Im Erstgespräch besprechen: ' + e.anfrage.map(function (x) { return x.name; }).join(', '));
    if (e.mehr.length) z.push('• Automatisierung & KI mit endo: ' + e.mehr.map(function (m) { return m.name + ' (' + P.betrag(m) + ' + ' + P.euro(m.monat) + ' / Monat)'; }).join(', '));
    z.push('• Betreuung: ' + (e.betreuung ? e.betreuung.name + ' (' + P.euro(e.monatlich) + ' / Monat' + (e.selbst ? ', Hosting & Domain stelle ich selbst' : '') + ')' : 'keine'));
    z.push('Einmalig ' + ab + P.euro(e.einmalig) + ' · monatlich ' + P.euro(e.monatlich) + ' · erstes Jahr ' + ab + P.euro(e.jahr) + ' (unverbindliche Einschätzung)');
    return z.join('\n').replace(/ /g, ' ');
  };
})(window.PREISE);

/* ---------- Bereich auf der Seite: geführter Assistent (Auftrag 9b, ERGUN. 29.09.2026) ----------
   Immer nur EIN Schritt sichtbar: ① Website → ② Extras → ③ Betreuung → ④ Ihre Einschätzung. Oben die Fortschrittsleiste
   (erledigte Schritte mit Haken, anklickbar zum Zurückgehen), unten Zurück/Weiter; „Weiter“ erst nach der Wahl einer Stufe.
   Die Höhe gleitet weich (Seite springt nicht), „Bewegung reduzieren“ = nur Einblenden. Die kompakte Zusammenfassung steht
   am Desktop rechts, am Handy unten (antippen → aufklappen). Das Kontaktformular liest die Auswahl über PREISE.auswahlJetzt()
   und das Ereignis „preise:auswahl“ (Box „Ihre Auswahl“). Nichts wird gespeichert. */
(function () {
  if (typeof document === 'undefined') return;
  var P = window.PREISE, B = window.BEGRIFFE, box = document.querySelector('[data-preise]');
  if (!box) return;
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function q(s) { return box.querySelector(s); }
  function qa(s) { return [].slice.call(box.querySelectorAll(s)); }
  var HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';
  var MONAT = ' / Monat';

  /* ⓘ-Knopf: öffnet „Begriffe erklärt“ und hebt den Begriff hervor */
  function info(schluessel) {
    var k = el('button', 'pinfo'); k.type = 'button'; k.setAttribute('data-begriff', schluessel[0]);
    k.setAttribute('aria-label', 'Erklärung: ' + schluessel.map(function (s) { return B[s].name; }).join(' und '));
    k.textContent = 'i'; return k;
  }
  /* Mini-Vorschau je Stufe: stilisierte Browser-/Handy-Skizze (wenige / mehrere / viele Seiten, Pro mit angedeuteter Bewegung) */
  function vorschau(id) {
    var seiten = { start: 1, business: 3, pro: 5 }[id], s = '';
    for (var i = 0; i < seiten; i++) s += '<rect x="' + (14 + i * 9) + '" y="13" width="7" height="3" rx="1.5" class="pv-tab' + (i ? '' : ' pv-tab--an') + '"/>';
    var inhalt = id === 'start'
      ? '<rect x="14" y="24" width="52" height="16" rx="3" class="pv-flaeche"/><rect x="14" y="44" width="34" height="3" rx="1.5" class="pv-linie"/><rect x="14" y="50" width="26" height="3" rx="1.5" class="pv-linie"/>'
      : id === 'business'
        ? '<rect x="14" y="24" width="52" height="14" rx="3" class="pv-flaeche"/><rect x="14" y="42" width="16" height="12" rx="2" class="pv-karte"/><rect x="32" y="42" width="16" height="12" rx="2" class="pv-karte"/><rect x="50" y="42" width="16" height="12" rx="2" class="pv-karte"/>'
        : '<rect x="14" y="24" width="52" height="30" rx="3" class="pv-flaeche"/><g class="pv-bewegt"><circle cx="52" cy="37" r="7" class="pv-kugel"/></g><rect x="18" y="30" width="22" height="3" rx="1.5" class="pv-linie pv-linie--hell"/><rect x="18" y="36" width="15" height="3" rx="1.5" class="pv-linie pv-linie--hell"/>';
    return '<svg class="pv pv--' + id + '" viewBox="0 0 100 64" aria-hidden="true">' +
      '<rect x="8" y="6" width="64" height="54" rx="6" class="pv-rahmen"/><circle cx="14" cy="10" r="1.3" class="pv-punkt"/><circle cx="18" cy="10" r="1.3" class="pv-punkt"/>' + s + inhalt +
      '<rect x="78" y="22" width="16" height="30" rx="4" class="pv-rahmen"/><rect x="81" y="27" width="10" height="7" rx="1.5" class="pv-flaeche"/><rect x="81" y="37" width="10" height="2" rx="1" class="pv-linie"/><rect x="81" y="41" width="7" height="2" rx="1" class="pv-linie"/></svg>';
  }

  /* ① Stufen: Karte = echtes Radio-Feld; die ganze Fläche wählt aus (Label über die Karte gespannt), ⓘ-Knöpfe liegen darüber.
     Keine Vorauswahl – „Weiter“ gibt es erst nach der Wahl. */
  var stufenBox = q('[data-stufen]');
  P.stufen.forEach(function (s) {
    var id = 'pst-' + s.id, k = el('div', 'pst' + (s.empfehlung ? ' pst--empf' : ''));
    var i = el('input', 'pst__feld'); i.type = 'radio'; i.name = 'stufe'; i.value = s.id; i.id = id;
    k.appendChild(i);
    if (s.empfehlung) k.appendChild(el('span', 'pst__schild', 'Empfehlung'));
    var v = el('div', 'pst__vorschau'); v.innerHTML = vorschau(s.id); k.appendChild(v);
    var l = el('label', 'pst__name', s.name); l.htmlFor = id; k.appendChild(l);
    k.appendChild(el('p', 'pst__preis', P.betrag(s)));
    k.appendChild(el('p', 'pst__fuer', s.fuer));
    var ul = el('ul', 'pst__liste');
    s.punkte.forEach(function (p) { var li = el('li'); li.innerHTML = HAKEN; li.appendChild(el('span', '', p.t)); if (p.b) li.appendChild(info(p.b)); ul.appendChild(li); });
    k.appendChild(ul);
    k.appendChild(el('span', 'pst__marke', 'Auswählen'));
    stufenBox.appendChild(k);
  });

  /* ② Extras: Zeile = Titel + Preis · Satz · Schalter (Checkbox mit role="switch"), in Gruppen; dazu „Auf Anfrage“ */
  var gruppenBox = q('[data-extras-gruppen]');
  P.extras.forEach(function (g) {
    var d = el('div', 'pex-gruppe'); d.appendChild(el('h4', 'pex-gruppe__titel', g.gruppe));
    var ul = el('ul', 'pex-liste'); ul.setAttribute('role', 'list');
    g.eintraege.forEach(function (m) {
      var li = el('li', 'pex'), l = el('label', 'pex__zeile');
      var i = el('input', 'pex__feld'); i.type = 'checkbox'; i.name = 'extra'; i.value = m.id; i.setAttribute('role', 'switch');
      var t = el('span', 'pex__text'); var kopf = el('span', 'pex__kopf'); kopf.appendChild(el('span', 'pex__name', m.name)); kopf.appendChild(el('span', 'pex__preis', '+ ' + P.betrag(m)));
      t.appendChild(kopf); t.appendChild(el('span', 'pex__satz', m.satz));
      l.appendChild(t); l.appendChild(i); l.appendChild(el('span', 'pschalter')); li.appendChild(l);
      if (m.b) li.appendChild(info(m.b));
      ul.appendChild(li);
    });
    d.appendChild(ul); gruppenBox.appendChild(d);
  });
  var anf = el('div', 'pex-anfrage'); anf.appendChild(el('h4', 'pex-gruppe__titel', 'Auf Anfrage'));
  var anfL = el('ul', 'pex-anfrage__liste'); anfL.setAttribute('role', 'list');
  P.aufAnfrage.forEach(function (x) { var li = el('li'), l = el('label', 'pex-anfrage__punkt'); var i = el('input'); i.type = 'checkbox'; i.name = 'anfrage'; i.value = x.id; l.appendChild(i); l.appendChild(el('span', '', x.name)); li.appendChild(l); anfL.appendChild(li); });
  anf.appendChild(anfL);
  anf.appendChild(el('p', 'pex-anfrage__klein', 'Ohne Preis, nicht im Rechner – wir klären es im Erstgespräch.'));
  gruppenBox.appendChild(anf);
  qa('[data-endo-hinweis]').forEach(function (x) { x.firstChild.textContent = P.endoHinweis + ' '; });
  qa('[data-endo-ansehen]').forEach(function (a) { a.href = P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart; });

  /* ③ Betreuung: drei Stufen (Radio), Schalter „Hosting & Domain selbst“, darunter Automatisierung & KI → endo */
  q('[data-betreuung-satz]').textContent = P.betreuung.satz;
  var bBox = q('[data-betreuung]');
  P.betreuung.stufen.forEach(function (b) {
    var l = el('label', 'pbe'); var i = el('input', 'pbe__feld'); i.type = 'radio'; i.name = 'betreuung'; i.value = b.id; l.appendChild(i);
    var innen = el('span', 'pbe__innen');
    var kopf = el('span', 'pbe__kopf'); kopf.appendChild(el('span', 'pbe__name', b.name)); var pr = el('span', 'pbe__preis'); pr.setAttribute('data-bmonat', b.id); kopf.appendChild(pr); innen.appendChild(kopf);
    innen.appendChild(el('span', 'pbe__fuer', b.fuer));
    var ul = el('span', 'pbe__liste'); b.punkte.forEach(function (p) { var z = el('span', 'pbe__punkt'); z.innerHTML = HAKEN; z.appendChild(document.createTextNode(p)); ul.appendChild(z); }); innen.appendChild(ul);
    l.appendChild(innen); bBox.appendChild(l);
  });
  q('[data-selbst-text]').textContent = P.betreuung.selbstText + ' (je Stufe ' + P.euro(P.betreuung.selbst) + ' günstiger)';
  q('[data-mehr-titel]').textContent = P.mehrTitel;
  var mehrBox = q('[data-mehr]');
  P.mehr.forEach(function (m) {
    var li = el('li', 'pmehr'), l = el('label', 'pmehr__zeile'); var i = el('input'); i.type = 'checkbox'; i.name = 'mehr'; i.value = m.id; l.appendChild(i);
    var t = el('span', 'pmehr__text'); t.appendChild(el('b', '', m.name)); t.appendChild(el('span', 'pmehr__preis', P.betrag(m) + ' + ' + P.euro(m.monat) + MONAT));
    t.appendChild(el('span', 'pmehr__satz', m.satz)); l.appendChild(t); li.appendChild(l);
    i.addEventListener('change', function () { if (i.checked) qa('input[name="mehr"]').forEach(function (x) { if (x !== i) x.checked = false; }); });
    mehrBox.appendChild(li);
  });
  q('[data-mehr-hinweis]').textContent = P.mehrSatz + ' Setzt die Betreuung auf ' + P.betreuung.stufen.filter(function (b) { return b.id === P.mehrStufe; })[0].name + '.';

  /* Begriffe erklärt (unter dem Assistenten, immer erreichbar) */
  var bl = q('[data-begriffe]');
  Object.keys(B).forEach(function (k) { var d = el('div', 'pbeg'); d.id = 'begriff-' + k; d.appendChild(el('dt', '', B[k].name)); d.appendChild(el('dd', '', B[k].text)); bl.appendChild(d); });
  var begriffe = q('[data-begriffe-box]');
  box.addEventListener('click', function (ev) {
    var k = ev.target.closest && ev.target.closest('[data-begriff]'); if (!k) return;
    ev.preventDefault(); begriffe.open = true;
    var z = document.getElementById('begriff-' + k.getAttribute('data-begriff'));
    qa('.pbeg.ist-markiert').forEach(function (x) { x.classList.remove('ist-markiert'); });
    z.classList.add('ist-markiert'); z.setAttribute('tabindex', '-1');
    z.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' }); z.focus({ preventScroll: true });
  });

  /* ---------- Rechner ---------- */
  var manuell = false;   /* Betreuung selbst gewählt? Dann nicht mehr automatisch umstellen (außer bei endo) */
  function werte(n) { return qa('input[name="' + n + '"]:checked').map(function (i) { return i.value; }); }
  function auswahl() {
    return { stufe: werte('stufe')[0], extras: werte('extra'), betreuung: werte('betreuung')[0] || null, selbst: !!q('[data-selbst]').checked, mehr: werte('mehr'), anfrage: werte('anfrage') };
  }
  function betreuungSetzen(id) { var r = q('input[name="betreuung"][value="' + id + '"]'); if (r) r.checked = true; }
  function leer(e) { return !e.stufe && !e.extras.length && !e.mehr.length && !e.anfrage.length; }
  /* für das Kontaktformular: aktuelle Auswahl (null, wenn noch nichts gewählt ist) */
  P.auswahlJetzt = function () { var e = P.rechnen(auswahl()); return leer(e) ? null : e; };
  var zahlen = [].slice.call(document.querySelectorAll('[data-summe]')), live = q('[data-preise-live]'), liveT, alt = {};
  function text(k, e, w) {
    if (!e.stufe && !e.mehr.length && !e.extras.length) return '–';   /* noch nichts gewählt */
    if (k === 'monatlich') return P.euro(w) + MONAT;
    return (e.ab && (k === 'einmalig' || k === 'jahr') ? 'ab ' : '') + P.euro(w);
  }
  function kurzSetzen(e) {
    var n = e.extras.length;
    var werteK = {
      stufe: e.stufe ? e.stufe.name : '–',
      extras: n ? n + (n === 1 ? ' Extra' : ' Extras') : 'keine',
      betreuung: e.betreuung ? e.betreuung.name + (e.selbst ? ' (Hosting selbst)' : '') : '–',
      endo: e.mehr.length ? e.mehr[0].name : ''
    };
    Object.keys(werteK).forEach(function (k) {
      [].forEach.call(document.querySelectorAll('[data-kurz="' + k + '"]'), function (x) {
        x.textContent = werteK[k];
        var zeile = x.closest('[data-kurz-zeile]'); if (zeile && k === 'endo') zeile.hidden = !werteK.endo;
      });
    });
    [].forEach.call(document.querySelectorAll('[data-kurz-zeile-text]'), function (x) {
      x.textContent = e.stufe ? [werteK.stufe, werteK.extras, werteK.betreuung].concat(werteK.endo ? ['endo'] : []).join(' · ') : 'Noch keine Stufe gewählt';
    });
  }
  function zeigen(e) {
    zahlen.forEach(function (z) {
      var k = z.getAttribute('data-summe'), von = alt[k] == null ? e[k] : alt[k], bis = e[k];
      if (ruhig || von === bis) { z.textContent = text(k, e, bis); return; }
      var t0 = null;
      (function schritt(t) {                       /* dezent hochzählen (240 ms); Tabellenziffern + feste Breite → nichts springt */
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 240), w = von + (bis - von) * (1 - Math.pow(1 - p, 3));
        z.textContent = text(k, e, w); if (p < 1) requestAnimationFrame(schritt);
      })(performance.now());
      setTimeout(function () { if (alt[k] === bis) z.textContent = text(k, e, bis); }, 320);   /* Endwert auch ohne Bildwechsel */
    });
    alt = { einmalig: e.einmalig, monatlich: e.monatlich, jahr: e.jahr };
    qa('[data-extern]').forEach(function (x) { x.textContent = e.selbst ? 'nach Ihrem Anbieter' : P.euro(0); });
    qa('[data-extern-klein]').forEach(function (x) { x.textContent = e.selbst ? 'Hosting und Domain zahlen Sie direkt an Ihren Anbieter.' : 'Hosting, Domain und SSL sind im Monatspreis enthalten.'; });
    P.betreuung.stufen.forEach(function (b) { q('[data-bmonat="' + b.id + '"]').textContent = P.euro(b.monat - (e.selbst ? P.betreuung.selbst : 0)) + MONAT; });
    kurzSetzen(e);
    clearTimeout(liveT);
    liveT = setTimeout(function () { live.textContent = 'Einmalig ' + text('einmalig', e, e.einmalig) + ', laufend ' + text('monatlich', e, e.monatlich) + ', erstes Jahr ' + text('jahr', e, e.jahr) + '.'; }, 450);
    document.dispatchEvent(new CustomEvent('preise:auswahl', { detail: leer(e) ? null : e }));
  }
  function rechnen(ev) {
    var a = auswahl(), t = ev && ev.target;
    if (t && t.name === 'betreuung') manuell = true;
    if (t && t.name === 'mehr' && t.checked) { betreuungSetzen(P.mehrStufe); manuell = false; }
    else if (!manuell && !(t && t.name === 'betreuung')) {
      /* vor der Wahl einer Stufe (oder endo) keine Betreuung vorwählen – sonst stünde „600 €“ da, obwohl noch nichts gewählt ist */
      if (!a.stufe && !a.mehr.length) qa('input[name="betreuung"]').forEach(function (i) { i.checked = false; });
      else betreuungSetzen(P.betreuungStandard(a));
    }
    var e = P.rechnen(auswahl()); zeigen(e); knoepfeSetzen(); return e;
  }
  qa('[data-klein-preis]').forEach(function (x) { x.textContent = P.klein + ' ' + P.steuer; });

  /* ---------- Schritte ---------- */
  var buehne = q('[data-buehne]'), panels = qa('[data-panel]'), leiste = qa('[data-schritt]');
  var zurueck = q('[data-zurueck]'), weiter = q('[data-weiter]');
  var aktiv = 1, erreicht = 1, hoeheT;
  var WEITER_TEXT = { 1: 'Weiter zu den Extras', 2: 'Weiter zur Betreuung', 3: 'Zur Einschätzung' };
  function knoepfeSetzen() {
    var a = auswahl();
    weiter.hidden = aktiv === 4;
    weiter.disabled = aktiv === 1 && !a.stufe;
    weiter.textContent = aktiv === 2 && !a.extras.length ? 'Ohne Extras weiter' : WEITER_TEXT[aktiv] || '';
    zurueck.hidden = aktiv === 1;
    leisteSetzen();
    leiste.forEach(function (k) {
      var n = +k.getAttribute('data-schritt'), fertig = n < aktiv || (n <= erreicht && n !== aktiv && (n > 1 || !!a.stufe));
      k.classList.toggle('ist-fertig', n !== aktiv && fertig && n <= erreicht);
      k.classList.toggle('ist-aktiv', n === aktiv);
      k.disabled = n > erreicht || (n > 1 && !a.stufe);
      if (n === aktiv) k.setAttribute('aria-current', 'step'); else k.removeAttribute('aria-current');
    });
  }
  function gehe(n, vonNutzer) {
    n = Math.max(1, Math.min(4, n));
    if (n === aktiv) return;
    if (n > 1 && !auswahl().stufe) return;
    var vor = n > aktiv, altPanel = panels[aktiv - 1], neuPanel = panels[n - 1];
    var hAlt = buehne.offsetHeight;
    clearTimeout(hoeheT);
    buehne.style.height = hAlt + 'px';
    altPanel.hidden = true; altPanel.classList.remove('ist-rein', 'ist-rein--zurueck');
    neuPanel.hidden = false;
    aktiv = n; erreicht = Math.max(erreicht, n);
    if (!ruhig) { neuPanel.classList.remove('ist-rein', 'ist-rein--zurueck'); void neuPanel.offsetWidth; neuPanel.classList.add(vor ? 'ist-rein' : 'ist-rein--zurueck'); }
    var hNeu = neuPanel.offsetHeight;
    if (ruhig) buehne.style.height = '';
    else { requestAnimationFrame(function () { buehne.style.height = hNeu + 'px'; }); hoeheT = setTimeout(function () { buehne.style.height = ''; }, 280); }
    knoepfeSetzen();
    /* Anfang des Schritts sichtbar halten – aber nie springen, wenn er schon im Bild ist */
    var oben = box.querySelector('.passi').getBoundingClientRect().top;
    if (oben < 0 || oben > window.innerHeight * 0.6) box.querySelector('.passi').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    if (vonNutzer) { var h = neuPanel.querySelector('[data-panel-titel]'); if (h) h.focus({ preventScroll: true }); }
  }
  weiter.addEventListener('click', function () { gehe(aktiv + 1, true); });
  zurueck.addEventListener('click', function () { gehe(aktiv - 1, true); });
  leiste.forEach(function (k) { k.addEventListener('click', function () { gehe(+k.getAttribute('data-schritt'), true); }); });
  /* Nach der Wahl einer Stufe (Klick/Tippen) gleitet ② herein; mit der Tastatur (Pfeiltasten) bleibt man und nimmt „Weiter“ */
  var perZeiger = false, weiterT;
  stufenBox.addEventListener('pointerdown', function () { perZeiger = true; });
  box.addEventListener('change', function (ev) {
    rechnen(ev);
    if (ev.target.name === 'stufe' && aktiv === 1 && perZeiger) { clearTimeout(weiterT); weiterT = setTimeout(function () { gehe(2, false); }, ruhig ? 0 : 420); }
    perZeiger = false;
  });

  /* „Anfrage mit dieser Auswahl“ → zum Kontakt (die Box „Ihre Auswahl“ dort zeigt alles; gesendet wird erst beim Abschicken) */
  function anfragen() {
    klappen(false);
    document.getElementById('kontakt').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    var form = document.getElementById('anfrage');
    setTimeout(function () { var n = form && form.elements.name; if (n) n.focus({ preventScroll: true }); }, ruhig ? 0 : 700);
  }
  [].forEach.call(document.querySelectorAll('[data-preise-anfrage]'), function (k) { k.addEventListener('click', anfragen); });
  /* von außen (Kontakt-Box „ändern“): zum Assistenten, auf Wunsch zu einem bestimmten Schritt */
  P.zeigeSchritt = function (n) { if (n) gehe(n, false); };

  /* Handy: kompakte Leiste unten (antippen → aufklappen), solange der Preis-Bereich zu sehen ist */
  var leisteUnten = q('[data-preise-leiste]'), klapp = q('[data-leiste-klappen]'), imBild = false;
  /* sichtbar, solange der Assistent im Bild ist – außer in Schritt ④ (dort steht die volle Einschätzung mit Anfrage-Knopf) */
  function leisteSetzen() {
    if (!leisteUnten) return;
    var an = imBild && aktiv !== 4;
    leisteUnten.classList.toggle('ist-an', an); leisteUnten.setAttribute('aria-hidden', String(!an));
    if (an) leisteUnten.removeAttribute('inert'); else { leisteUnten.setAttribute('inert', ''); klappen(false); }   /* unsichtbar = nicht per Tab erreichbar */
  }
  function klappen(auf) { if (!leisteUnten) return; leisteUnten.classList.toggle('ist-offen', auf); klapp.setAttribute('aria-expanded', String(auf)); }
  if (klapp) klapp.addEventListener('click', function () { klappen(!leisteUnten.classList.contains('ist-offen')); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && leisteUnten && leisteUnten.classList.contains('ist-offen')) { klappen(false); klapp.focus(); } });
  if (leisteUnten && 'IntersectionObserver' in window) {
    var assi = q('.passi');
    new IntersectionObserver(function (x) { imBild = x[0].isIntersecting; leisteSetzen(); }, { rootMargin: '-20% 0px -20% 0px' }).observe(assi);
  }
  panels.forEach(function (p, i) { p.hidden = i !== 0; });
  rechnen();
})();
