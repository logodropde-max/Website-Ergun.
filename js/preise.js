/* ERGUN. – ein Ablauf „Website · Automatisierung · Beides“ → Ihre Anfrage (Auftrag 25 ERGUN. minimal, 29.09.2026; vorher Auftrag 27/9b; Zahlen unverändert seit Auftrag 9/10).
   Ausnahme auf ERGUNs Wunsch: Preise stehen offen auf der Seite. Nichts wird gespeichert (keine Cookies, kein localStorage) –
   die Auswahl lebt nur in dieser Seite, gesendet wird erst, wenn der Besucher das Kontaktformular selbst abschickt.

   ========================================================================================================
   PREISE + BEGRIFFE – DIE EINE STELLE FÜR ALLE ZAHLEN UND TEXTE. Hier ändern, sonst nirgends.
   Auch die Karten im Kontaktformular lesen von hier. Quelle: Obsidian „02 Preise/Webdesign-Pakete (Erstgespräch)“.
   preis = einmalig in €, ab = true → „ab“ davor, monat = monatlich in €.
   b = Begriff(e) aus BEGRIFFE, die das ⓘ neben einem Punkt öffnet. enthaelt = Extras, die in der Stufe schon drin sind (Leitfaden zählt sie nicht doppelt).
   ======================================================================================================== */
window.PREISE = {
  /* ① Website – drei Stufen (eine wählbar). empfehlung = dezentes Schild „Empfehlung“ (Ausnahme auf ERGUNs Wunsch). */
  stufen: [
    { id: 'start', name: 'Start', preis: 500, ab: false, enthaelt: [], fuer: 'Für Selbstständige, Handwerker und kleine Betriebe',
      punkte: [{ t: 'Website für Handy & PC' }, { t: 'Bis zu 3 Seiten' }, { t: 'Kontaktformular (WhatsApp & E-Mail)' }, { t: 'SEO-Grundlagen', b: ['seo'] },
        { t: 'DSGVO-Grundlagen', b: ['dsgvo'] }, { t: 'Hosting-Einrichtung & SSL', b: ['hosting', 'ssl'] }, { t: '3 eigene Bilder' }, { t: '1 Korrekturrunde', b: ['korrektur'] }] },
    { id: 'business', name: 'Business', preis: 1000, ab: true, empfehlung: true, enthaelt: ['loop'],   /* Schild „Empfehlung“ – seit 9b keine Vorauswahl */
      fuer: 'Für Unternehmen, die professionell auftreten wollen',
      punkte: [{ t: 'Bis zu 8 Seiten' }, { t: 'Individuelles Design' }, { t: 'Animationen & Parallax', b: ['parallax'] }, { t: 'Leistungsseiten & Referenzen' },
        { t: 'Anfrage-Formular' }, { t: '10 eigene Bilder + Video-Loop', b: ['loop'] }, { t: 'SEO-Grundlagen', b: ['seo'] }, { t: 'Schnelle Ladezeit', b: ['ladezeit'] }, { t: '2 Korrekturrunden', b: ['korrektur'] }] },
    { id: 'pro', name: 'Pro', preis: 1900, ab: true, enthaelt: ['loop', '3d', 'termin', 'formular', 'funktion'], fuer: 'Für Unternehmen mit höheren Ansprüchen',
      punkte: [{ t: 'Premium-Website mit eigenem Konzept' }, { t: 'Aufwendige Animationen (Scroll-Story, 3D-Element)', b: ['3d'] }, { t: '20 eigene Bilder + Video im Kopfbereich' },
        { t: 'Individuelle Funktion (z. B. Terminbuchung, Rechner)', b: ['funktion'] }, { t: 'Erweiterte Formulare' }, { t: 'Mehrsprachig möglich' },
        { t: 'Besucherstatistik ohne Cookies', b: ['statistik'] }, { t: 'Schnelle Ladezeit', b: ['ladezeit'] }, { t: '3 Korrekturrunden', b: ['korrektur'] }] }
  ],
  /* ② Extras – in Gruppen. Im Rechner zählt der „ab“-Wert. Seit Auftrag 28 (29.09.2026) deutlich günstiger, passend zum Aufwand (alte Preise: Preis-Notiz). */
  extras: [
    { gruppe: 'Seiten & Inhalte', eintraege: [
      { id: 'unterseite', name: 'Zusätzliche Unterseite', satz: 'Zum Beispiel für ein neues Angebot oder einen Standort.', preis: 50, ab: true },
      { id: 'sprache', name: 'Zusätzliche Sprache', satz: 'Komplett übersetzt, mit Sprachumschalter.', preis: 150, ab: true },
      { id: 'bilder', name: '10 weitere eigene Bilder', satz: 'Zehn zusätzliche Bilder, eigens für Sie gestaltet.', preis: 40 }] },
    { gruppe: 'Design & Bewegung', eintraege: [
      { id: 'animation', name: 'Premium-Animation', satz: 'Aufwendige Scroll- und Bewegungseffekte.', preis: 80, ab: true },
      { id: 'loop', name: 'Video-Loop', satz: 'Kurzes, lautloses Video in Schleife.', preis: 60, b: ['loop'] },
      { id: '3d', name: '3D-Element', satz: 'Ein Objekt, zum Beispiel Ihr Produkt, zum Drehen.', preis: 120, ab: true, b: ['3d'] }] },
    { gruppe: 'Funktionen', eintraege: [
      { id: 'formular', name: 'Erweitertes Anfrage-Formular', satz: 'Mit Wunschtermin und Datei-Upload.', preis: 60, ab: true },
      { id: 'termin', name: 'Terminbuchung', satz: 'Ihre Kunden buchen Termine direkt auf der Website.', preis: 120, ab: true },
      { id: 'regler', name: 'Vorher/Nachher-Regler', satz: 'Zwei Bilder zum Vergleichen, per Schieberegler.', preis: 40 },
      { id: 'funktion', name: 'Individuelle Funktion', satz: 'Zum Beispiel ein Rechner oder Konfigurator.', preis: 150, ab: true, b: ['funktion'] }] },
    { gruppe: 'Sichtbarkeit', eintraege: [
      { id: 'seo', name: 'SEO-Paket', satz: 'Ausrichtung auf Ihre Suchbegriffe, strukturierte Daten.', preis: 150, b: ['seoPaket'] },
      { id: 'google', name: 'Google-Unternehmensprofil', satz: 'Eintrag in Suche und Maps einrichten und pflegen.', preis: 60, b: ['google'] }] }
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
    { id: 'komplett', name: 'endo komplett', satz: 'Alle Fähigkeiten: Empfang, Termine, Kontakte, Übersicht und Studio.', preis: 4000, monat: 200, ab: true }
  ],
  mehrTitel: 'Automatisierung & KI → endo',
  mehrSatz: 'Automatisierung und KI für Ihren Betrieb laufen über endo – ebenfalls von ERGUN.',
  /* EINE Karte im Kontaktformular für alles aus „mehr“ (Preis = günstigste Option) */
  endoKarte: 'Automatisierung & KI mit endo',
  mehrStufe: 'rundum',
  /* „endo ansehen“: /unternehmen erst, wenn die Seite öffentlich ist (heute gesperrt) – sonst die endo-Startseite */
  endoSeiteOeffentlich: true,   /* Auftrag 32 (29.09.2026): /unternehmen ist öffentlich */
  endoSeite: 'https://endo-ergun.vercel.app/',   /* Auftrag 33: die Unternehmer-Seite ist jetzt die endo-Startseite */
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

/* Texte des Ablaufs „Website · Automatisierung · Beides“ (Auftrag 25 ERGUN. minimal, 29.09.2026; Grundlage Auftrag 27).
   Keine Zahlen hier – Preise kommen immer aus PREISE. Pro Schritt eine Überschrift und höchstens ein kurzer Satz, ohne Fachbegriffe. */
window.LEITFADEN = {
  art: { titel: 'Was brauchen Sie?', satz: 'Tippen Sie auf das, was passt. Den Rest klären wir im Gespräch.', direkt: 'Lieber gleich schreiben',
    optionen: [
      { id: 'website', titel: 'Website', satz: 'Eine Website, die zu Ihrem Betrieb passt.' },
      { id: 'endo', titel: 'Automatisierung', satz: 'endo beantwortet Anfragen, bucht Termine und mehr.' },
      { id: 'beides', titel: 'Beides', satz: 'Ihre Website und endo zusammen.', dezent: 'alles aus einer Hand' }] },
  website: { titel: 'Welche Website passt?', satz: 'Der Preis ist ein Startwert.', alles: 'Alles, was drin ist', extras: 'Extras hinzufügen (optional)' },
  /* höchstens 3 Stichpunkte je Stufe (Auszug aus PREISE.stufen[].punkte, in Alltagssprache) */
  stufenKurz: {
    start: ['Bis zu 3 Seiten', 'Für Handy und PC', 'Kontaktformular'],
    business: ['Bis zu 8 Seiten', 'Eigenes Design mit Bewegung', '10 eigene Bilder und Video'],
    pro: ['Eigenes Konzept', 'Aufwendige Animationen und 3D', 'Terminbuchung oder eigene Funktion'] },
  /* Extras (Auftrag 28): ruhige Liste mit Haken in den 4 Gruppen aus PREISE.extras (Name, Satz, Preis rechtsbündig) – nichts als „beliebt“ markiert */
  extrasSchon: 'enthalten', extrasJeSeite: 'je Seite', extrasAnzahl: 'Wie viele zusätzliche Seiten?',
  /* Betreuung (Auftrag 28): Haken = mit Betreuung (Stufe vorgewählt, „ändern“ öffnet die Stufen), Haken weg = ohne Betreuung, 0 € im Monat.
     Mit endo bleibt sie gesetzt (Rundum), weil der Betrieb von endo darin steckt. */
  betreuung: { titel: 'Betreuung', grund: { basis: 'Passt für eine Website ohne eigene Funktionen.', aktiv: 'Passt, weil Ihre Website Termine oder Formulare verarbeitet.', rundum: 'Passt, weil Ihre Website viel Eigenes kann.' },
    endo: 'Bleibt gesetzt: Der laufende Betrieb von endo ist darin enthalten.', selbst: 'Ich habe eigenes Hosting und eine eigene Domain', aendern: 'ändern',
    ohne: 'Ohne Betreuung', ohneSatz: 'Hosting, Domain und Updates übernehmen Sie dann selbst.' },
  /* endo-Fähigkeiten (5 seit Auftrag 30, 29.09.2026: Social entfernt) mit ehrlichem Status – Stand aus endo (_code/endo-studio/js/assistenten.js), dort ändern und hier nachziehen */
  endo: { titel: 'Wo soll endo helfen?', satz: 'Wählen Sie eine oder mehrere Aufgaben.', ansehen: 'So sieht das aus: endo ansehen',
    faehigkeiten: [
      { id: 'empfang', name: 'Empfang', satz: 'beantwortet Anfragen rund um die Uhr', status: 'Demo' },
      { id: 'termine', name: 'Termine', satz: 'Kunden buchen selbst, mit Erinnerung', status: 'In Arbeit' },
      { id: 'kontakte', name: 'Kontakte', satz: 'Ihre Kundenkartei mit Erinnerungen', status: 'In Arbeit' },
      { id: 'uebersicht', name: 'Übersicht', satz: 'Ihr Wochenbericht', status: 'In Arbeit' },
      { id: 'studio', name: 'Studio', satz: 'Bilder und Videos aus Handyfotos', status: 'Live' }],
    komplett: 'Alle Aufgaben zum Paketpreis.', leer: 'Bitte wählen Sie mindestens eine Aufgabe.',
    komplettSatz: 'Ab 4 Aufgaben ist endo komplett günstiger.' },
  anfrage: { titel: 'Ihre Anfrage', satz: 'Antwort innerhalb von 24 Stunden.', leer: 'Nichts ausgewählt – schreiben Sie einfach, worum es geht.', auswahl: 'Auswahl treffen' }
};

/* ---------- Rechnen (auch für die Tests) ---------- */
(function (P) {
  P.euro = function (n) { return Math.round(n).toLocaleString('de-DE') + ' €'; };
  P.betrag = function (x) { return (x.ab ? 'ab ' : '') + P.euro(x.preis); };
  P.alleExtras = function () { return P.extras.reduce(function (l, g) { return l.concat(g.eintraege); }, []); };
  /* Standard-Betreuung (Rechner ohne ausdrückliche Wahl): Automatisierung/endo → Rundum · Pro mit Terminbuchung oder Funktion → Aktiv · sonst Basis */
  P.betreuungStandard = function (a) {
    a = a || {};
    if ((a.mehr || []).length || (a.endo || []).length) return P.mehrStufe;
    if (a.stufe === 'pro' && (a.extras || []).some(function (x) { return x === 'termin' || x === 'funktion'; })) return 'aktiv';
    return 'basis';
  };
  /* Empfehlung im Leitfaden (Frage 4, Auftrag 27): endo → Rundum · Terminbuchung, Formular mit Dateien oder eigene Funktion
     (auch wenn schon in der Stufe enthalten) → Aktiv · sonst Basis */
  P.betreuungEmpfehlung = function (a) {
    a = a || {};
    if ((a.mehr || []).length || (a.endo || []).length) return P.mehrStufe;
    var s = P.stufen.filter(function (x) { return x.id === a.stufe; })[0], hat = (a.extras || []).concat(s && s.id === 'pro' ? ['termin', 'formular'] : []);
    return hat.some(function (x) { return x === 'termin' || x === 'formular' || x === 'funktion'; }) ? 'aktiv' : 'basis';
  };
  /* endo nach Aufgaben (Auftrag 27): je Fähigkeit der Preis von „Eine Fähigkeit“, ab 4 Fähigkeiten „endo komplett“ (günstiger).
     Monatlich zählt wie bisher die Betreuung Rundum (dort ist der laufende Betrieb von endo enthalten). */
  P.endoPaket = function (ids) {
    var n = (ids || []).length, f = P.mehr[0], k = P.mehr[1];
    if (!n) return null;
    if (n * f.preis >= k.preis) return { id: k.id, name: k.name, satz: k.satz, preis: k.preis, monat: k.monat, ab: k.ab, anzahl: n, faehigkeiten: ['alle Fähigkeiten'] };
    var namen = (window.LEITFADEN ? window.LEITFADEN.endo.faehigkeiten : []).filter(function (x) { return ids.indexOf(x.id) >= 0; }).map(function (x) { return x.name; });
    return { id: f.id, name: n === 1 ? f.name : n + ' Fähigkeiten', satz: f.satz, preis: f.preis * n, monat: f.monat, ab: f.ab, anzahl: n, faehigkeiten: namen };
  };
  /* auswahl = { stufe: 'business', extras: ['termin'], anzahl: { unterseite: 2 }, endo: ['empfang'], betreuung: 'basis', selbst: false, mehr: [], anfrage: [] } */
  P.rechnen = function (auswahl) {
    var a = auswahl || {}, anzahl = a.anzahl || {};
    var stufe = P.stufen.filter(function (s) { return s.id === a.stufe; })[0] || null;
    var extras = P.alleExtras().filter(function (m) { return (a.extras || []).indexOf(m.id) >= 0; }).map(function (m) {
      var n = Math.max(1, Math.min(20, anzahl[m.id] || 1));
      if (n === 1) return m;
      var x = {}; for (var k in m) x[k] = m[k]; x.preis = m.preis * n; x.anzahl = n; return x;
    });
    var mehr = P.mehr.filter(function (m) { return (a.mehr || []).indexOf(m.id) >= 0; });
    if ((a.endo || []).length) mehr = [P.endoPaket(a.endo)];
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
    var z = ['Meine Auswahl aus dem Preis-Leitfaden:'], ab = e.ab ? 'ab ' : '';
    if (e.stufe) z.push('• Website: ' + e.stufe.name + ' (' + P.betrag(e.stufe) + ')');
    if (e.extras.length) z.push('• Extras: ' + e.extras.map(function (m) { return m.name + (m.anzahl > 1 ? ' × ' + m.anzahl : '') + ' (' + P.betrag(m) + ')'; }).join(', '));
    if (e.anfrage.length) z.push('• Im Erstgespräch besprechen: ' + e.anfrage.map(function (x) { return x.name; }).join(', '));
    if (e.mehr.length) z.push('• Automatisierung & KI mit endo: ' + e.mehr.map(function (m) { return m.name + (m.faehigkeiten && m.anzahl > 1 && m.id !== 'komplett' ? ' – ' + m.faehigkeiten.join(', ') : m.faehigkeiten && m.anzahl === 1 ? ' – ' + m.faehigkeiten.join(', ') : '') + ' (' + P.betrag(m) + ' + ' + P.euro(m.monat) + ' / Monat)'; }).join(', '));
    z.push('• Betreuung: ' + (e.betreuung ? e.betreuung.name + ' (' + P.euro(e.monatlich) + ' / Monat' + (e.selbst ? ', Hosting & Domain stelle ich selbst' : '') + ')' : 'ohne Betreuung (Hosting, Domain und Updates übernehme ich selbst)'));
    z.push('Einmalig ' + ab + P.euro(e.einmalig) + ' · monatlich ' + P.euro(e.monatlich) + ' · erstes Jahr ' + ab + P.euro(e.jahr) + ' (unverbindliche Einschätzung)');
    return z.join('\n').replace(/ /g, ' ');   /* feste Leerzeichen → normale (WhatsApp/Mail) */
  };
})(window.PREISE);

/* ---------- Ein Ablauf: Auswahl und Anfrage in einem (Auftrag 25 ERGUN. minimal, 29.09.2026; ersetzt „Ihr Preis in 4 Fragen“) ----------
   ① „Was brauchen Sie?“ Website · Automatisierung · Beides (Tippen = weiter, dazu „Lieber gleich schreiben“)
   ② nur das Passende: Website (3 Stufen, Extras eingeklappt, Betreuung als eine Zeile) und/oder Automatisierung (endo-Aufgaben)
   ③ „Ihre Anfrage“: Zusammenfassung + Formular (statisches HTML in index.html, das Formular-Skript dort liest PREISE.auswahlJetzt()).
   Eine Summenanzeige ab Schritt ②: Desktop klebend rechts, Handy schmale Leiste unten (mit „Weiter“). Alte Anker #preise/#kontakt
   führen in den Ablauf (#kontakt = Schritt ③). Übergang 200 ms, „Bewegung reduzieren“ = sofort. Nichts wird gespeichert. */
(function () {
  if (typeof document === 'undefined') return;
  var P = window.PREISE, B = window.BEGRIFFE, L = window.LEITFADEN, box = document.querySelector('[data-preise]');
  if (!box) return;
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function q(s) { return box.querySelector(s); }
  /* Preis mit Hierarchie (Auftrag 36): große Zahl + kleine Beschriftung („ab“, „+ 200 € / Monat“) – der Text bleibt Zeichen für Zeichen derselbe */
  function preisEl(tag, cls, text) {
    var e = el(tag, cls), m = /^(ab\s)?(\d[\d.]*\s€)(.*)$/.exec(text);
    if (!m) { e.textContent = text; return e; }
    if (m[1]) e.appendChild(el('span', 'k-preis__vor', m[1]));
    e.appendChild(el('span', 'k-preis__zahl', m[2]));
    if (m[3]) e.appendChild(el('span', 'k-preis__nach', m[3]));
    return e;
  }
  function reihe(b, i) { b.setAttribute('style', '--i:' + i); return b; }   /* Platz in der Reihe → gestaffeltes Erscheinen (CSS, 50 ms Versatz) */
  var MONAT = ' / Monat';
  var ICON = {
    termin: '<rect x="8" y="10" width="32" height="30" rx="4"/><path d="M8 18h32M16 6v8M32 6v8"/><path d="m18 29 4 4 8-8"/>',
    seo: '<circle cx="21" cy="21" r="11"/><path d="m29 29 11 11"/><path d="M16 21h10M21 16v10"/>',
    sprache: '<circle cx="24" cy="24" r="16"/><path d="M8 24h32M24 8c5 5 5 27 0 32M24 8c-5 5-5 27 0 32"/>',
    bewegung: '<rect x="6" y="10" width="36" height="28" rx="4"/><path d="m21 18 9 6-9 6z"/>',
    formular: '<path d="M30 14 16.5 27.5a4 4 0 0 0 5.7 5.7L36 19.4a7 7 0 0 0-9.9-9.9L12 23.6a10 10 0 0 0 14.1 14.1L38 25.8"/>',
    unterseite: '<rect x="10" y="6" width="22" height="30" rx="3"/><path d="M15 13h12M15 18h9"/><circle cx="34" cy="34" r="8"/><path d="M34 30v8M30 34h8"/>',
    website: '<rect x="6" y="9" width="36" height="28" rx="4"/><path d="M6 16h36"/><path d="M12 23h14M12 28h9"/>',
    endo: '<circle cx="24" cy="24" r="8"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(-20 24 24)"/>',
    beides: '<rect x="4" y="11" width="28" height="22" rx="4"/><path d="M4 17h28"/><circle cx="37" cy="30" r="7"/><ellipse cx="37" cy="30" rx="11" ry="4" transform="rotate(-20 37 30)"/>'
  };
  function icon(n) { return '<svg class="lf-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || '') + '</svg>'; }
  /* Premium (01.10., ?titel=neu – ERGUN.: „Blau-Gelb wirkt billig“): feine Linienzeichnungen statt Symbolen, nur Aussehen */
  var PREMIUM = document.documentElement.classList.contains('titel-neu');
  var GRAFIK = {
    website: '<rect x="8" y="8" width="104" height="58" rx="5"/><path d="M8 18h104"/><path d="M14.5 13h.01M19.5 13h.01M24.5 13h.01"/><path d="M18 30h32M18 37h24M18 44h28"/><rect x="18" y="51" width="16" height="5" rx="2.5"/><rect x="62" y="26" width="40" height="30" rx="2.5"/><path d="M62 50l11-9 8 6 7-5 14 10"/>',
    endo: '<circle cx="18" cy="37" r="8"/><path d="M26 37h19"/><path d="M41 33l4 4-4 4"/><rect x="47" y="26" width="26" height="22" rx="5"/><path d="M53 33h14M53 38h10M53 43h12"/><path d="M73 37h19"/><path d="M88 33l4 4-4 4"/><circle cx="102" cy="37" r="8"/><path d="M98.5 37.5l2.5 2.5 4.5-5"/>',
    beides: '<rect x="8" y="12" width="58" height="42" rx="4"/><path d="M8 20h58"/><path d="M15 29h22M15 35h16M15 41h19"/><rect x="42" y="27" width="17" height="15" rx="2"/><path d="M66 33h14"/><path d="M76 29l4 4-4 4"/><rect x="82" y="24" width="20" height="18" rx="4"/><path d="M87 30h10M87 35h7"/><circle cx="92" cy="54" r="6"/><path d="M92 42v6"/><path d="M89.5 54.5l2 2 3.5-4"/>'
  };
  function grafik(n) { return '<svg class="mf-grafik" viewBox="0 0 120 72" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (GRAFIK[n] || '') + '</svg>'; }
  var HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';

  /* ---------- Antworten (nur Arbeitsspeicher) ---------- */
  var A = { art: null, stufe: null, extras: [], seiten: 1, endo: [], betreuung: null, betreuungAn: true, selbst: false, extrasOffen: false, betreuungOffen: false };
  function mitWebsite() { return A.art === 'website' || A.art === 'beides'; }
  function mitEndo() { return A.art === 'endo' || A.art === 'beides'; }
  function stufeDaten() { return P.stufen.filter(function (x) { return x.id === A.stufe; })[0] || null; }
  function enthalten(id) { var s = stufeDaten(); return !!(s && (s.enthaelt || []).indexOf(id) >= 0); }
  function extrasIds() { return mitWebsite() ? A.extras.filter(function (x) { return !enthalten(x); }) : []; }   /* Enthaltenes zählt nicht doppelt */
  function ohneBetreuung() { return { stufe: mitWebsite() ? A.stufe : null, extras: extrasIds(), endo: mitEndo() ? A.endo : [] }; }
  function betreuungJetzt() { var e = P.betreuungStandard(ohneBetreuung());   /* vorausgewählt wie im Rechner: meist Basis */ return mitEndo() ? P.mehrStufe : (A.betreuung || e); }
  function betreuungAn() { return mitEndo() || A.betreuungAn; }   /* mit endo immer gesetzt */
  function auswahl() {
    return { stufe: mitWebsite() ? A.stufe : null, extras: extrasIds(), anzahl: { unterseite: A.seiten }, endo: mitEndo() ? A.endo.slice() : [],
      betreuung: betreuungAn() ? betreuungJetzt() : null, selbst: mitWebsite() && A.selbst && betreuungAn() };
  }
  function leer() { return !A.art || (mitWebsite() && !A.stufe) || (!mitWebsite() && !A.endo.length); }
  /* Anfrage-Box: Auswahl ist fertig, sobald die nötigen Teile gewählt sind (bei „Beides“ reicht die Website, endo kommt dazu) */
  P.auswahlJetzt = function () { return leer() ? null : P.rechnen(auswahl()); };

  /* ---------- Schritte ---------- */
  function schritte() { return ['art'].concat(A.art === 'website' ? ['website'] : A.art === 'endo' ? ['endo'] : A.art === 'beides' ? ['website', 'endo'] : [], ['anfrage']); }
  var aktiv = 'art', dyn = q('[data-mf-dyn]'), anfrageBox = q('[data-mf-anfrage]'), stand = q('[data-mf-stand]'), linie = q('[data-mf-linie]');
  var zurueck = q('[data-mf-zurueck]'), weiter = q('[data-mf-weiter]'), hinweis = q('[data-mf-hinweis]'), summe = q('[data-mf-summe]'), live = q('[data-preise-live]'), liveT;

  function schalter(an, label, fn, key) {
    var s = el('button', 'lf-schalter'); s.type = 'button'; s.setAttribute('role', 'switch'); s.setAttribute('aria-checked', String(!!an)); s.setAttribute('aria-label', label);
    if (key) s.setAttribute('data-fokus', key);
    s.appendChild(el('span', 'lf-schalter__ja', 'Ja')); s.appendChild(el('span', 'lf-schalter__nein', 'Nein'));
    s.addEventListener('click', fn); return s;
  }
  function neuZeichnen(key) { neu(); zeigen(aktiv, 0, true, key); }
  function aufklapper(klasse, titel, offen, inhalt, beiToggle) {
    var d = el('details', 'mf-auf ' + klasse); d.open = !!offen;
    var s = el('summary', '', titel); d.appendChild(s); d.appendChild(inhalt);
    d.addEventListener('toggle', function () { beiToggle(d.open); });
    return d;
  }

  var BAU = {
    art: function (w) {
      w.titel = L.art.titel; w.satz = L.art.satz;
      var g = el('div', 'mf-karten'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', L.art.titel);
      var f = P.mehr[0], preis = {
        website: 'ab ' + P.euro(P.stufen[0].preis),
        endo: P.betrag(f) + ' + ' + P.euro(f.monat) + MONAT,
        beides: 'ab ' + P.euro(P.stufen[0].preis + f.preis) + ' + ' + P.euro(f.monat) + MONAT
      };
      if (A.art) g.className += ' hat-wahl';
      L.art.optionen.forEach(function (o, nr) {
        var b = reihe(el('button', 'mf-karte'), nr); b.type = 'button'; b.setAttribute('aria-pressed', String(A.art === o.id)); b.setAttribute('data-fokus', 'art-' + o.id);
        var bild = el('span', 'mf-karte__bild'); bild.innerHTML = PREMIUM ? grafik(o.id) : icon(o.id); b.appendChild(bild);
        var txt = el('span', 'mf-karte__text'), kopf = el('span', 'mf-karte__kopf');
        kopf.appendChild(el('span', 'mf-karte__titel', o.titel)); if (o.dezent) kopf.appendChild(el('span', 'mf-karte__dezent', o.dezent));
        txt.appendChild(kopf); txt.appendChild(el('span', 'mf-karte__satz', o.satz)); txt.appendChild(preisEl('span', 'mf-karte__preis', preis[o.id])); b.appendChild(txt);
        b.addEventListener('click', function () { if (A.art !== o.id) { A.art = o.id; A.betreuung = null; A.betreuungAn = true; } neu(); gehe(schritte()[1], 1); });
        b.addEventListener('keydown', function (e) {   /* Pfeiltasten wandern zwischen den drei Karten, Enter/Leertaste wählt (Knopf) */
          var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return;
          var alle = [].slice.call(g.querySelectorAll('.mf-karte')), i = alle.indexOf(b); e.preventDefault();
          alle[(i + k + alle.length) % alle.length].focus();
        });
        g.appendChild(b);
      });
      w.inhalt.appendChild(g);
      var d = el('button', 'mf-link', L.art.direkt + ' →'); d.type = 'button';
      d.addEventListener('click', function () { A.art = null; neu(); gehe('anfrage', 1); });
      w.inhalt.appendChild(d);
    },
    website: function (w) {
      w.titel = L.website.titel; w.satz = L.website.satz;
      var g = el('div', 'mf-stufen'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', L.website.titel);
      if (A.stufe) g.className += ' hat-wahl';
      P.stufen.forEach(function (s, nr) {
        var b = reihe(el('button', 'mf-stufe'), nr); b.type = 'button'; b.setAttribute('aria-pressed', String(A.stufe === s.id)); b.setAttribute('data-fokus', 'stufe-' + s.id);
        if (s.empfehlung) b.appendChild(el('span', 'mf-stufe__schild', 'Empfehlung'));
        var kopf = el('span', 'mf-stufe__kopf'); kopf.appendChild(el('span', 'mf-stufe__name', s.name)); kopf.appendChild(preisEl('span', 'mf-stufe__preis', P.betrag(s))); b.appendChild(kopf);
        var ul = el('span', 'mf-stufe__punkte'); (L.stufenKurz[s.id] || []).forEach(function (t) { var z = el('span', 'mf-stufe__punkt'); z.innerHTML = HAKEN; z.appendChild(document.createTextNode(t)); ul.appendChild(z); }); b.appendChild(ul);
        var h = el('span', 'mf-stufe__haken'); h.innerHTML = HAKEN; b.appendChild(h);
        if (PREMIUM) {   /* monatlich klein unter dem Preis (günstigste Betreuung aus PREISE) + „Auswählen“ als Rand-Knopf */
          kopf.appendChild(el('span', 'mf-stufe__monat', 'zzgl. Betreuung ab ' + P.euro(P.betreuung.stufen[0].monat) + MONAT));
          b.appendChild(el('span', 'mf-stufe__waehlen', A.stufe === s.id ? 'Ausgewählt' : 'Auswählen'));
        }
        b.addEventListener('click', function () { A.stufe = s.id; neuZeichnen('stufe-' + s.id); });
        g.appendChild(b);
      });
      w.inhalt.appendChild(g);
      /* Alles, was drin ist */
      var r = el('div', 'mf-alles');
      P.stufen.forEach(function (s) { var sp = el('div'); sp.appendChild(el('b', '', s.name)); var ul = el('ul'); s.punkte.forEach(function (p) { ul.appendChild(el('li', '', p.t)); }); sp.appendChild(ul); r.appendChild(sp); });
      w.inhalt.appendChild(aufklapper('mf-auf--klein', L.website.alles, false, r, function () {}));
      /* Extras hinzufügen (optional) – Ja/Nein-Fragen, Enthaltenes als „schon enthalten“ */
      var n = extrasIds().length;
      w.inhalt.appendChild(aufklapper('mf-auf--extras', L.website.extras + (n ? ' · ' + n + ' gewählt' : ''), A.extrasOffen, extrasListe(), function (o) { A.extrasOffen = o; }));
      /* Betreuung als eine Zeile */
      w.inhalt.appendChild(betreuungZeile());
    },
    endo: function (w) {
      w.titel = L.endo.titel; w.satz = L.endo.satz;
      var c = el('div', 'mf-endo'); c.setAttribute('role', 'group'); c.setAttribute('aria-label', L.endo.titel);
      L.endo.faehigkeiten.forEach(function (f, nr) {
        var b = reihe(el('button', 'mf-chip'), nr); b.type = 'button'; b.setAttribute('aria-pressed', String(A.endo.indexOf(f.id) >= 0)); b.setAttribute('data-fokus', 'endo-' + f.id);
        var kopf = el('span', 'mf-chip__kopf'), name = el('span', 'mf-chip__name'), hk = el('span', 'mf-chip__haken'); hk.setAttribute('aria-hidden', 'true'); hk.innerHTML = HAKEN;
        name.appendChild(hk); name.appendChild(el('b', '', f.name)); kopf.appendChild(name); kopf.appendChild(el('span', 'mf-chip__status mf-chip__status--' + f.status.replace(' ', '-').toLowerCase(), f.status)); b.appendChild(kopf);
        b.appendChild(el('span', 'mf-chip__satz', f.satz));
        b.addEventListener('click', function () { var i = A.endo.indexOf(f.id); if (i >= 0) A.endo.splice(i, 1); else A.endo.push(f.id); neuZeichnen('endo-' + f.id); });
        c.appendChild(b);
      });
      w.inhalt.appendChild(c);
      var alle = L.endo.faehigkeiten.map(function (f) { return f.id; }), k = P.mehr[1], komplett = A.endo.length === alle.length;
      var kb = reihe(el('button', 'mf-komplett'), alle.length); kb.type = 'button'; kb.setAttribute('aria-pressed', String(komplett)); kb.setAttribute('data-fokus', 'komplett');
      var kk = el('span', 'mf-stufe__kopf'); kk.appendChild(el('span', 'mf-stufe__name', k.name)); kk.appendChild(preisEl('span', 'mf-stufe__preis', P.betrag(k) + ' + ' + P.euro(k.monat) + MONAT)); kb.appendChild(kk);
      var kh = el('span', 'mf-stufe__haken'); kh.innerHTML = HAKEN; kb.appendChild(kh);
      kb.appendChild(el('span', 'mf-karte__satz', L.endo.komplett));
      kb.addEventListener('click', function () { A.endo = komplett ? [] : alle.slice(); neuZeichnen('komplett'); });
      w.inhalt.appendChild(kb);
      var n = A.endo.length, m = P.endoPaket(A.endo);
      w.inhalt.appendChild(el('p', 'mf-stand', !n ? L.endo.leer : m.id === 'komplett' ? (komplett ? k.name + ': ' + P.betrag(k) : L.endo.komplettSatz + ' ' + k.name + ': ' + P.betrag(k)) : n + (n === 1 ? ' Aufgabe' : ' Aufgaben') + ': ' + P.betrag(m) + ' + ' + P.euro(m.monat) + MONAT));
      var a = el('a', 'mf-link', L.endo.ansehen + ' ↗'); a.href = P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart; a.target = '_blank'; a.rel = 'noopener';
      w.inhalt.appendChild(a);
      if (!mitWebsite()) w.inhalt.appendChild(betreuungZeile());
    }
  };
  /* Extras (Auftrag 28): ruhige Liste mit Haken in den 4 Gruppen, Preis rechtsbündig, je ein kurzer Satz. Enthaltenes = „enthalten“. */
  function hakenKnopf(an, label, key, gesperrt) {
    var k = el('button', 'mf-haken'); k.type = 'button'; k.setAttribute('role', 'checkbox'); k.setAttribute('aria-checked', String(!!an)); k.setAttribute('aria-label', label);
    if (key) k.setAttribute('data-fokus', key);
    if (gesperrt) { k.disabled = true; k.setAttribute('aria-disabled', 'true'); }
    k.innerHTML = '<span class="mf-haken__box" aria-hidden="true">' + HAKEN + '</span>';
    return k;
  }
  function extrasListe() {
    var w = el('div', 'mf-extras');
    P.extras.forEach(function (g) {
      var grp = el('div', 'mf-extras__gruppe'); grp.setAttribute('role', 'group'); grp.setAttribute('aria-label', g.gruppe);
      grp.appendChild(el('p', 'mf-extras__titel', g.gruppe));
      var ul = el('ul', 'mf-extras__liste'); ul.setAttribute('role', 'list');
      g.eintraege.forEach(function (m) {
        var schon = enthalten(m.id), an = schon || A.extras.indexOf(m.id) >= 0, li = el('li', 'mf-extra' + (an ? ' ist-an' : '') + (schon ? ' ist-schon' : ''));
        var k = hakenKnopf(an, m.name + (schon ? ' – ' + L.extrasSchon : ''), 'ex-' + m.id, schon);
        var t = el('span', 'mf-extra__text'); t.appendChild(el('span', 'mf-extra__name', m.name)); t.appendChild(el('span', 'mf-extra__satz', m.satz));
        k.appendChild(t);
        k.appendChild(el('span', 'mf-extra__preis', schon ? L.extrasSchon : '+ ' + P.betrag(m) + (m.id === 'unterseite' ? ' ' + L.extrasJeSeite : '')));
        if (!schon) k.addEventListener('click', function () { var i = A.extras.indexOf(m.id); if (i >= 0) A.extras.splice(i, 1); else A.extras.push(m.id); neuZeichnen('ex-' + m.id); });
        li.appendChild(k);
        if (!schon && an && m.id === 'unterseite') {
          var z = el('div', 'lf-unter lf-zahl mf-extra__zahl'); z.appendChild(el('span', 'lf-frage__was', L.extrasAnzahl));
          var minus = el('button', 'lf-zahl__knopf', '−'), wert = el('output', 'lf-zahl__wert', String(A.seiten)), plus = el('button', 'lf-zahl__knopf', '+');
          minus.type = plus.type = 'button'; minus.setAttribute('aria-label', 'Eine Seite weniger'); plus.setAttribute('aria-label', 'Eine Seite mehr');
          minus.disabled = A.seiten <= 1; plus.disabled = A.seiten >= 10; minus.setAttribute('data-fokus', 'minus'); plus.setAttribute('data-fokus', 'plus');
          minus.addEventListener('click', function () { A.seiten = Math.max(1, A.seiten - 1); neuZeichnen('minus'); });
          plus.addEventListener('click', function () { A.seiten = Math.min(10, A.seiten + 1); neuZeichnen('plus'); });
          z.appendChild(minus); z.appendChild(wert); z.appendChild(plus); li.appendChild(z);
        }
        ul.appendChild(li);
      });
      grp.appendChild(ul); w.appendChild(grp);
    });
    return w;
  }
  /* Betreuung (Auftrag 28): eine Zeile mit Haken „☑ Betreuung Basis · 50 € / Monat · ändern“. Haken weg = ohne Betreuung (0 € im Monat).
     Mit endo gesetzt und gesperrt (Rundum), mit kurzem Grund. „ändern“ öffnet die drei Stufen + Hosting selbst. */
  function betreuungZeile() {
    var an = betreuungAn(), gesperrt = mitEndo(), id = betreuungJetzt(), b = P.betreuung.stufen.filter(function (x) { return x.id === id; })[0], selbst = A.selbst && mitWebsite();
    var wrap = el('div', 'mf-betreuung' + (an ? '' : ' ist-aus'));
    var zeile = el('div', 'mf-betreuung__zeile');
    var k = hakenKnopf(an, L.betreuung.titel, 'betreuung-an', gesperrt);
    k.appendChild(el('span', 'mf-betreuung__text', an ? L.betreuung.titel + ' ' + b.name + ' · ' + P.euro(b.monat - (selbst ? P.betreuung.selbst : 0)) + MONAT : L.betreuung.ohne + ' · ' + P.euro(0) + MONAT));
    if (!gesperrt) k.addEventListener('click', function () { A.betreuungAn = !A.betreuungAn; if (!A.betreuungAn) A.betreuungOffen = false; neuZeichnen('betreuung-an'); });
    zeile.appendChild(k);
    if (an) {
      var ae = el('button', 'mf-link mf-link--klein', A.betreuungOffen ? 'fertig' : L.betreuung.aendern); ae.type = 'button'; ae.setAttribute('aria-expanded', String(A.betreuungOffen)); ae.setAttribute('data-fokus', 'betreuung');
      ae.addEventListener('click', function () { A.betreuungOffen = !A.betreuungOffen; zeigen(aktiv, 0, true, 'betreuung'); });
      zeile.appendChild(ae);
    }
    wrap.appendChild(zeile);
    wrap.appendChild(el('p', 'mf-betreuung__grund', !an ? L.betreuung.ohneSatz : gesperrt ? L.betreuung.endo : L.betreuung.grund[id]));
    if (an && A.betreuungOffen) {
      var g = el('div', 'mf-betreuung__wahl hat-wahl'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', L.betreuung.titel);
      P.betreuung.stufen.forEach(function (x) {
        var o = el('button', 'lf-chip lf-chip--gross'); o.type = 'button'; o.setAttribute('aria-pressed', String(id === x.id)); o.setAttribute('data-fokus', 'b-' + x.id);
        o.appendChild(el('b', '', x.name + ' · ' + P.euro(x.monat - (selbst ? P.betreuung.selbst : 0)) + MONAT)); o.appendChild(el('span', '', x.fuer));
        if (gesperrt && x.id !== P.mehrStufe) { o.disabled = true; }
        o.addEventListener('click', function () { A.betreuung = x.id; neuZeichnen('b-' + x.id); });
        g.appendChild(o);
      });
      wrap.appendChild(g);
      if (mitWebsite()) {
        var s = el('div', 'lf-unter mf-selbst'); s.appendChild(el('span', 'lf-frage__was', L.betreuung.selbst)); s.appendChild(el('span', 'lf-frage__preis', '− ' + P.euro(P.betreuung.selbst) + MONAT));
        s.appendChild(schalter(A.selbst, L.betreuung.selbst, function () { A.selbst = !A.selbst; neuZeichnen('selbst'); }, 'selbst'));
        wrap.appendChild(s);
      }
    }
    return wrap;
  }

  /* ---------- Anzeige ---------- */
  function zeigen(id, richtung, still, fokusKey) {
    aktiv = id;
    var liste = schritte(), nr = liste.indexOf(id) + 1, n = id === 'art' && !A.art ? 3 : liste.length, istAnfrage = id === 'anfrage';
    stand.textContent = 'Schritt ' + nr + ' von ' + n;
    linie.style.transform = 'scaleX(' + (nr / n) + ')';
    var ani = still || ruhig || !richtung ? '' : richtung > 0 ? ' ist-rein' : ' ist-rein--zurueck';
    if (istAnfrage) {
      dyn.hidden = true; dyn.textContent = ''; anfrageBox.hidden = false;
      anfrageBox.className = 'mf-anfrage' + ani;
    } else {
      anfrageBox.hidden = true; dyn.hidden = false;
      var w = { inhalt: el('div', 'mf-inhalt') };
      BAU[id](w);
      var s = el('div', 'mf-schritt' + ani); s.setAttribute('role', 'group');
      var h = el(id === 'art' ? 'h2' : 'h3', 'mf-titel', w.titel); h.id = 'mf-titel'; h.tabIndex = -1; s.setAttribute('aria-labelledby', 'mf-titel');
      s.appendChild(h); if (w.satz) s.appendChild(el('p', 'mf-satz', w.satz)); s.appendChild(w.inhalt);
      dyn.textContent = ''; dyn.appendChild(s);
    }
    zurueck.hidden = id === 'art';
    weiter.hidden = id === 'art' || istAnfrage;
    weiter.textContent = liste[nr] === 'anfrage' ? 'Zur Anfrage' : 'Weiter';
    weiter.disabled = (id === 'website' && !A.stufe) || (id === 'endo' && !A.endo.length);
    hinweis.textContent = id === 'website' && !A.stufe ? 'Bitte wählen Sie eine Website.' : id === 'endo' && !A.endo.length ? L.endo.leer : '';
    box.setAttribute('data-schritt-jetzt', id);
    summeZeigen();
    /* Auftrag 36: die Szene erfährt den Schritt (die Figur hat nach der ersten Wahl ihren Job erledigt und blendet aus; zurück in Schritt ① kommt sie wieder) */
    document.dispatchEvent(new CustomEvent('preise:schritt', { detail: { schritt: id } }));
    if (fokusKey) {
      var f = box.querySelector('[data-fokus="' + fokusKey + '"]');
      if (f) {
        f.focus({ preventScroll: true });
        /* gerade gewählt: nur dieses eine Element zeigt den Wechsel (Anheben, Goldkante, Häkchen zeichnet sich) – der Rest steht still */
        if (f.getAttribute('aria-pressed') === 'true' || f.getAttribute('aria-checked') === 'true') { f.className += ' ist-frisch'; lichtAn(f); }
      }
    }
    else if (!still) {
      var titel = istAnfrage ? anfrageBox.querySelector('.mf-titel') : dyn.querySelector('.mf-titel');
      if (titel) titel.focus({ preventScroll: true });
      var oben = box.getBoundingClientRect().top;
      if (oben < -40 || oben > window.innerHeight * 0.5) box.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function gehe(id, richtung) { A.betreuungOffen = false; zeigen(id, richtung); }   /* neuer Schritt: Betreuung wieder eine Zeile */
  weiter.addEventListener('click', function () { var l = schritte(); gehe(l[l.indexOf(aktiv) + 1], 1); });
  zurueck.addEventListener('click', function () { var l = schritte(); gehe(l[Math.max(0, l.indexOf(aktiv) - 1)], -1); });

  /* Eine Summenanzeige ab Schritt ② (in ③ steht die Zusammenfassung selbst) */
  function summeZeigen() {
    var e = P.auswahlJetzt(), an = aktiv !== 'art' && aktiv !== 'anfrage';
    summe.hidden = !an;
    box.classList.toggle('mit-summe', an);
    q('[data-mf-summe-einmalig]').textContent = e ? (e.ab ? 'ab ' : '') + P.euro(e.einmalig) : '–';
    q('[data-mf-summe-monatlich]').textContent = e ? P.euro(e.monatlich) + MONAT : '–';
  }
  function neu() {
    var e = P.auswahlJetzt();
    summeZeigen();
    clearTimeout(liveT);
    liveT = setTimeout(function () { if (e && live) live.textContent = 'Einmalig ' + (e.ab ? 'ab ' : '') + P.euro(e.einmalig) + ', monatlich ' + P.euro(e.monatlich) + '.'; }, 500);
    document.dispatchEvent(new CustomEvent('preise:auswahl', { detail: e }));
  }
  /* „ändern“ in der Anfrage → zurück zu Schritt ② (ohne Auswahl → Schritt ①); alte Anker #preise/#kontakt */
  P.zeigeSchritt = function (id) { var l = schritte(); gehe(id || (l.length > 2 ? l[1] : 'art'), -1); };
  function ausAnker() {
    if (location.hash === '#kontakt') { gehe('anfrage', 0); }
    else if (location.hash === '#preise' && aktiv === 'anfrage' && !A.art) gehe('art', 0);
  }
  window.addEventListener('hashchange', ausAnker);
  P.antworten = A;   /* für Tests und Aufnahmen */

  /* ---------- Licht auf den Karten (Auftrag 36) ----------
     Maus: ein weicher Schein folgt dem Zeiger (nur zwei CSS-Variablen auf der Karte selbst, einmal pro Bild). Handy: kurzer Lichtimpuls dort,
     wo getippt wurde. „Bewegung reduzieren“: nichts davon. Das Aussehen steht in index.html (Abschnitt „Auftrag 36“, Werte --k-…). */
  var KARTEN = '.mf-karte, .mf-stufe, .mf-chip, .mf-komplett, .lf-chip--gross', zeiger = null, lichtGeplant = false;
  function lichtSetzen(k, x, y) {
    var r = k.getBoundingClientRect(), drin = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;   /* Tastatur: Zeiger liegt woanders → Licht mittig oben */
    k.style.setProperty('--mx', Math.round(drin ? x - r.left : r.width / 2) + 'px'); k.style.setProperty('--my', Math.round(drin ? y - r.top : 0) + 'px');
  }
  function lichtAn(k) { if (!ruhig && zeiger && k.matches && k.matches(KARTEN) && k.getBoundingClientRect) lichtSetzen(k, zeiger[0], zeiger[1]); }
  if (!ruhig && window.requestAnimationFrame) {
    box.addEventListener('pointermove', function (e) {
      zeiger = [e.clientX, e.clientY, e.target];
      if (e.pointerType !== 'mouse' || lichtGeplant) return;
      lichtGeplant = true;
      requestAnimationFrame(function () { lichtGeplant = false; var k = zeiger[2].closest && zeiger[2].closest(KARTEN); if (k) lichtSetzen(k, zeiger[0], zeiger[1]); });
    }, { passive: true });
    box.addEventListener('pointerdown', function (e) {
      zeiger = [e.clientX, e.clientY, e.target];
      var k = e.target.closest && e.target.closest(KARTEN); if (!k) return;
      lichtSetzen(k, e.clientX, e.clientY);
      if (e.pointerType !== 'mouse') { k.classList.remove('ist-impuls'); void k.offsetWidth; k.classList.add('ist-impuls'); }
    }, { passive: true });
  }

  zeigen('art', 0, true);
  if (location.hash === '#kontakt') zeigen('anfrage', 0, true);
  /* Schritt ① erscheint gestaffelt, sobald die Karten ins Bild kommen (einmal). Ohne IntersectionObserver oder mit „Bewegung reduzieren“: sofort da. */
  if (!ruhig && aktiv === 'art' && 'IntersectionObserver' in window) {
    var erste = dyn.querySelector('.mf-schritt');
    if (erste) {
      erste.className += ' k-wartet';
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        io.disconnect(); erste.className = erste.className.replace(' k-wartet', '') + ' k-auftritt';
      }, { threshold: 0.12 });
      io.observe(erste.querySelector('.mf-karten') || erste);
    }
  }
})();
