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
      { id: 'rundum', name: 'Rundum', monat: 200, fuer: 'Websites mit Datenbank, Login oder vielen eigenen Funktionen',
        punkte: ['Alles aus Aktiv', 'Betrieb & Sicherung der Datenbank', 'Betreuung von Login und Schnittstellen', 'Bevorzugte Bearbeitung', 'Weiterentwicklung nach Absprache'] }
    ]
  },
  /* Automatisierung & KI → endo (ERGUN., 11.10.2026): drei Pakete Endo Start · Endo Business · Endo AI – wir richten ein fertiges System ein und
     betreuen es jeden Monat. Endo AI besprechen wir im Erstgespräch (nicht wählbar). Gleiche Werte wie ENDO_PREISE.werkbank
     (_code/endo-studio/js/endo-preise.js) und in Obsidian „02 Preise“ – ein Test vergleicht. Den Namen des Systemanbieters nennen wir nie. */
  endo: {
    werkbank: [
      { id: 'start', name: 'Endo Start', kurz: 'Kundenverwaltung', satz: 'Anfragen und Kunden an einem Ort.',
        apps: ['kontakte', 'pipeline', 'aufgaben', 'auswertungen', 'newsletter'],
        haken: ['Kontakte – Firmen und Personen', 'Pipeline mit Stufen, Wert und Quote', 'Aufgaben und Wiedervorlagen', 'Einfache Auswertungen', 'E-Mail-Marketing (Newsletter)', 'Einrichtung, Kurzanleitung, Betreuung per E-Mail'],
        einmalig: 800, monat: 60, ab: false, anleitung: 'Kurzanleitung + Lernvideos', betreuung: 'E-Mail, 2 Werktage' },
      { id: 'business', name: 'Endo Business', kurz: 'Büroautomatisierung', satz: 'Vom Angebot bis zur Unterschrift.',
        apps: ['kontakte', 'pipeline', 'aufgaben', 'auswertungen', 'newsletter', 'angebote', 'signatur', 'projekte', 'uebergabe'],
        haken: ['Alles aus Endo Start', 'Angebote direkt aus der Chance, als PDF', 'E-Signatur – online unterschreiben lassen', 'Projekte – vom Auftrag bis zur Abnahme', 'Automatische Übergabe von Anfragen ans Team', 'Einrichtung, Kurzanleitung, Betreuung mit Vorrang'],
        einmalig: 1200, monat: 120, ab: false, anleitung: 'Kurzanleitung + Lernvideos', betreuung: 'E-Mail, 1 Werktag' },
      { id: 'ai', name: 'Endo AI', kurz: 'KI-Unternehmenssystem', satz: 'Mit KI, die Ihnen Arbeit abnimmt.',
        apps: ['kontakte', 'pipeline', 'aufgaben', 'auswertungen', 'newsletter', 'angebote', 'signatur', 'projekte', 'uebergabe', 'chat', 'erfassen', 'ablaeufe'],
        haken: ['Alles aus Endo Business', 'Chat auf Ihrer Website', 'Anfragen automatisch erfassen und zuordnen', 'Abläufe, die von selbst laufen', 'Monatliches KI-Kontingent, transparent angezeigt'],
        einmalig: 3000, monat: 250, ab: true, anfrage: false, spaeter: true, anleitung: 'nach Bedarf', betreuung: 'E-Mail, 1 Werktag' }],
    lizenzSatz: 'zzgl. Lizenz des Systems dahinter, je Benutzer und Monat, direkt an den Hersteller'   /* Ausnahme auf ERGUN.s Wunsch, Wortlaut vom Anwalt prüfen */
  },
  endoSeite: 'https://endo-ergun.vercel.app/',   /* „endo ansehen“ – die endo-Startseite */
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

/* Texte des Ablaufs „Website · Automatisierung · Beides“ (Auftrag 25 ERGUN. minimal, 29.09.2026; Grundlage Auftrag 27; Stimme „wir“ seit 07.10.2026).
   Keine Zahlen hier – Preise kommen immer aus PREISE. Pro Schritt eine Überschrift und höchstens ein kurzer Satz, ohne Fachbegriffe. */
window.LEITFADEN = {
  art: { titel: 'Was brauchen Sie?', satz: 'Tippen Sie auf das, was passt. Den Rest klären wir im Gespräch.', direkt: 'Lieber gleich schreiben',
    optionen: [
      { id: 'website', titel: 'Website', satz: 'Eine Website, die zu Ihrem Betrieb passt.' },
      { id: 'endo', titel: 'Automatisierung', satz: 'Wir richten Ihnen ein fertiges System ein und betreuen es jeden Monat – auf Wunsch mit KI.' },
      { id: 'beides', titel: 'Beides', satz: 'Ihre Website und endo zusammen.' }] },
  website: { titel: 'Welche Website passt?', satz: 'Der Preis ist ein Startwert.', alles: 'Alles, was drin ist', extras: 'Extras hinzufügen (optional)' },
  /* höchstens 3 Stichpunkte je Stufe (Auszug aus PREISE.stufen[].punkte, in Alltagssprache) */
  stufenKurz: {
    start: ['Bis zu 3 Seiten', 'Für Handy und PC', 'Kontaktformular'],
    business: ['Bis zu 8 Seiten', 'Eigenes Design mit Bewegung', '10 eigene Bilder und Video'],
    pro: ['Eigenes Konzept', 'Aufwendige Animationen und 3D', 'Terminbuchung oder eigene Funktion'] },
  /* Extras (Auftrag 28): ruhige Liste mit Haken in den 4 Gruppen aus PREISE.extras (Name, Satz, Preis rechtsbündig) – nichts als „beliebt“ markiert */
  extrasSchon: 'enthalten', extrasJeSeite: 'je Seite', extrasAnzahl: 'Wie viele zusätzliche Seiten?',
  /* Betreuung (Auftrag 28): Haken = mit Betreuung (Stufe vorgewählt, „ändern“ öffnet die Stufen), Haken weg = ohne Betreuung, 0 € im Monat.
     Seit dem neuen endo-Preismodell (01.10.2026) gilt sie nur für die Website – den Betrieb der KI deckt die endo-Monatsgebühr. */
  betreuung: { titel: 'Betreuung', grund: { basis: 'Passt für eine Website ohne eigene Funktionen.', aktiv: 'Passt, weil Ihre Website Termine oder Formulare verarbeitet.', rundum: 'Passt, weil Ihre Website viel Eigenes kann.' },
    selbst: 'Ich habe eigenes Hosting und eine eigene Domain', aendern: 'ändern',
    ohne: 'Ohne Betreuung', ohneSatz: 'Hosting, Domain und Updates übernehmen Sie dann selbst.' },
  endo: { ansehen: 'So sieht das aus: endo ansehen' },
  anfrage: { titel: 'Ihre Anfrage', satz: 'Antwort innerhalb von 24 Stunden.', leer: 'Nichts ausgewählt – schreiben Sie einfach, worum es geht.', auswahl: 'Auswahl treffen' },
  /* endo-Pakete (11.10.2026): Texte vom texter („Texte Werkbank (texter).md“) und aus dem endo Umbau. Keine Zahlen hier – Preise und Lizenzsatz
     kommen aus PREISE.endo. */
  werkbank: {
    titel: 'Welches endo-Paket passt?', satz: 'Schreiben Sie viele Angebote? Dann Endo Business, sonst reicht Endo Start. Endo AI besprechen wir im Erstgespräch.',
    leer: 'Bitte wählen Sie ein Paket.', summeLeer: 'Noch nichts gewählt',
    karten: {
      start: { satz: 'Anfragen und Kunden an einem Ort.', punkte: ['Kontakte und Anfragen an einem Ort', 'Aufgaben und Wiedervorlagen', 'Newsletter an Ihre Kunden'] },
      business: { satz: 'Vom Angebot bis zur Unterschrift.', punkte: ['Alles aus Start', 'Angebote als PDF, direkt aus der Anfrage', 'Online unterschreiben lassen'] },
      ai: { satz: 'Mit KI, die Ihnen Arbeit abnimmt.', status: 'Im Erstgespräch' } },
    dazu: 'Einrichtung und Betreuung durch uns', einmalig: 'einmalig', monat: 'im Monat Betreuung' }
};

/* ---------- Rechnen (auch für die Tests) ---------- */
(function (P) {
  P.euro = function (n) { return Math.round(n).toLocaleString('de-DE') + ' €'; };
  P.betrag = function (x) { return (x.ab ? 'ab ' : '') + P.euro(x.preis); };
  P.monatText = function (x) { return (x.monatAb ? 'ab ' : '') + P.euro(x.monat); };
  P.endoWerkbank = function (id) { return P.endo.werkbank.filter(function (x) { return x.id === id; })[0] || null; };
  /* ein wählbares endo-Paket als Rechen-Posten (Endo AI ist „im Erstgespräch“ und nie wählbar → null) */
  P.endoPaket = function (ids) {
    var p = P.endoWerkbank((ids || [])[0]); if (!p || p.spaeter || p.anfrage) return null;
    return { id: 'werkbank-' + p.id, paketId: p.id, name: p.name, preis: p.einmalig, monat: p.monat, ab: !!p.ab, monatAb: !!p.ab, werkbank: true, anzahl: 1 };
  };
  P.alleExtras = function () { return P.extras.reduce(function (l, g) { return l.concat(g.eintraege); }, []); };
  /* Standard-Betreuung (Rechner ohne ausdrückliche Wahl): Pro mit Terminbuchung oder Funktion → Aktiv · sonst Basis.
     endo setzt seit dem neuen Preismodell (01.10.2026) keine Betreuung mehr: den Betrieb der KI deckt die endo-Monatsgebühr. */
  P.betreuungStandard = function (a) {
    a = a || {};
    if (a.stufe === 'pro' && (a.extras || []).some(function (x) { return x === 'termin' || x === 'funktion'; })) return 'aktiv';
    return 'basis';
  };
  /* auswahl = { stufe: 'business', extras: ['termin'], anzahl: { unterseite: 2 }, endo: ['start'], betreuung: 'basis', selbst: false, anfrage: [] } */
  P.rechnen = function (auswahl) {
    var a = auswahl || {}, anzahl = a.anzahl || {};
    var stufe = P.stufen.filter(function (s) { return s.id === a.stufe; })[0] || null;
    var extras = P.alleExtras().filter(function (m) { return (a.extras || []).indexOf(m.id) >= 0; }).map(function (m) {
      var n = Math.max(1, Math.min(20, anzahl[m.id] || 1));
      if (n === 1) return m;
      var x = {}; for (var k in m) x[k] = m[k]; x.preis = m.preis * n; x.anzahl = n; return x;
    });
    var mehr = [P.endoPaket(a.endo)].filter(Boolean);   /* endo-Paket (Endo AI ist nie ein Posten) */
    var bId = a.betreuung === undefined ? P.betreuungStandard(a) : a.betreuung;
    var betreuung = P.betreuung.stufen.filter(function (b) { return b.id === bId; })[0] || null;
    var betreuungMonat = betreuung ? betreuung.monat - (a.selbst ? P.betreuung.selbst : 0) : 0;
    var endoMonat = mehr.reduce(function (s, m) { return s + m.monat; }, 0);
    var monatlich = betreuungMonat + endoMonat;   /* einmalig und monatlich getrennt: Website-Betreuung + endo-Gebühr */
    var teile = [stufe].concat(extras, mehr).filter(Boolean);
    var einmalig = teile.reduce(function (s, x) { return s + x.preis; }, 0);
    return { stufe: stufe, extras: extras, mehr: mehr, betreuung: betreuung, selbst: !!a.selbst, anfrage: P.aufAnfrage.filter(function (x) { return (a.anfrage || []).indexOf(x.id) >= 0; }),
      einmalig: einmalig, ab: teile.some(function (x) { return x.ab; }), monatAb: mehr.some(function (m) { return m.monatAb; }), werkbank: mehr.some(function (m) { return m.werkbank; }), monatlich: monatlich, betreuungMonat: betreuungMonat, endoMonat: endoMonat, jahr: einmalig + 12 * monatlich };
  };
  /* Text fürs Kontaktformular (landet in der Nachricht – gesendet wird erst, wenn der Besucher selbst abschickt) */
  P.anfrageText = function (e) {
    var z = ['Meine Auswahl aus dem Preis-Leitfaden:'], ab = e.ab ? 'ab ' : '';
    if (e.stufe) z.push('• Website: ' + e.stufe.name + ' (' + P.betrag(e.stufe) + ')');
    if (e.extras.length) z.push('• Extras: ' + e.extras.map(function (m) { return m.name + (m.anzahl > 1 ? ' × ' + m.anzahl : '') + ' (' + P.betrag(m) + ')'; }).join(', '));
    if (e.anfrage.length) z.push('• Im Erstgespräch besprechen: ' + e.anfrage.map(function (x) { return x.name; }).join(', '));
    if (e.mehr.length) { var wm = e.mehr[0];   /* endo-Paket mit Lizenzsatz aus PREISE – keine Laufzeit (nicht entschieden) */
      z.push('• endo-Paket: ' + wm.name + ' (' + P.betrag(wm) + ' einmalig + ' + P.monatText(wm) + ' / Monat, ' + P.endo.lizenzSatz + ')'); }
    if (e.stufe) z.push('• Betreuung: ' + (e.betreuung ? e.betreuung.name + ' (' + P.euro(e.betreuungMonat) + ' / Monat' + (e.selbst ? ', Hosting & Domain stelle ich selbst' : '') + ')' : 'ohne Betreuung (Hosting, Domain und Updates übernehme ich selbst)'));
    var mab = e.monatAb ? 'ab ' : '', jab = e.ab || e.monatAb ? 'ab ' : '';   /* Lizenz direkt bei der Summe */
    z.push('Einmalig ' + ab + P.euro(e.einmalig) + ' · monatlich ' + mab + P.euro(e.monatlich) + ' · erstes Jahr ' + jab + P.euro(e.jahr) + (e.werkbank ? ' ' + P.endo.lizenzSatz : '') + ' (unverbindliche Einschätzung)');
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
  var LW = L.werkbank;   /* Aussehen der endo-Pakete: ergun-werkbank.css (fest im Kopf von index.html) */
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
  var HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';

  /* ---------- Antworten (nur Arbeitsspeicher) ---------- */
  var A = { art: null, stufe: null, extras: [], seiten: 1, endo: [], betreuung: null, betreuungAn: true, selbst: false, extrasOffen: false, betreuungOffen: false };
  function mitWebsite() { return A.art === 'website' || A.art === 'beides'; }
  function mitEndo() { return A.art === 'endo' || A.art === 'beides'; }
  function stufeDaten() { return P.stufen.filter(function (x) { return x.id === A.stufe; })[0] || null; }
  function enthalten(id) { var s = stufeDaten(); return !!(s && (s.enthaelt || []).indexOf(id) >= 0); }
  function extrasIds() { return mitWebsite() ? A.extras.filter(function (x) { return !enthalten(x); }) : []; }   /* Enthaltenes zählt nicht doppelt */
  function ohneBetreuung() { return { stufe: mitWebsite() ? A.stufe : null, extras: extrasIds(), endo: mitEndo() ? A.endo : [] }; }
  function betreuungJetzt() { return A.betreuung || P.betreuungStandard(ohneBetreuung()); }   /* vorausgewählt wie im Rechner: meist Basis */
  function betreuungAn() { return mitWebsite() && A.betreuungAn; }   /* Betreuung gehört zur Website; endo hat seine eigene Monatsgebühr */
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
  function artPreise() {   /* aus PREISE berechnet: Website ab Start, endo ab Endo Start, Beides = Website-Start + Endo Start */
    var s0 = P.endoWerkbank('start');
    return { website: 'ab ' + P.euro(P.stufen[0].preis), endo: 'ab ' + P.euro(s0.einmalig) + ' + ab ' + P.euro(s0.monat) + MONAT, beides: 'ab ' + P.euro(P.stufen[0].preis + s0.einmalig) + ' + ab ' + P.euro(s0.monat) + MONAT };
  }

  /* ---------- Schritt ① (seit 01.10.2026, Ausnahme auf ERGUNs Wunsch): die drei Angebote stehen groß über dem Formular und SIND Schritt ①.
     Klick wählt und führt weich zum Formular darunter (② bzw. ③). Ohne Wahl zeigt das Formular gleich „Ihre Anfrage“ (allgemeine Anfrage).
     „endo ansehen ↗“ steht direkt an der Wahl „Automatisierung“ und „Beides“ – eigene Tippfläche (≥ 44 px) in einer Hülle neben dem Knopf
     (ein <a> in einem <button> wäre ungültig). ---------- */
  var angebote = null, oben = q('.mf__oben');
  function endoLinkHuelle(knopf, o) {
    if (o.id !== 'endo' && o.id !== 'beides') return knopf;
    var hu = el('div', 'mf-wahl-huelle mf-wahl-huelle--' + o.id); hu.appendChild(knopf);   /* ERGUN., 05.10.: das endo-Logo nur bei „Automatisierung“ (--endo) */ knopf.classList.add('hat-endo-link');
    var a = el('a', 'mf-endo-link', 'endo ansehen ↗'); a.href = P.endoSeite; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('data-endo-link', ''); a.setAttribute('aria-label', 'endo ansehen – ' + o.titel + ' (neues Fenster)');
    a.addEventListener('click', function (e) { e.stopPropagation(); });
    hu.appendChild(a); return hu;
  }

  /* unter dem Preis von „Automatisierung“ und „Beides“ der Lizenz-Hinweis kurz (erster Teil von PREISE.endo.lizenzSatz – den ganzen Satz zeigt
     Schritt ②). data-glas-behalten: glas.js baut die Karte neu und hängt dieses Teil wieder an. */
  function wbHinweis(o) {
    if (o.id !== 'endo' && o.id !== 'beides') return null;
    var h = el('span', 'wb-hinweis'); h.setAttribute('data-glas-behalten', '');
    h.appendChild(el('span', 'wb-lizenz', P.endo.lizenzSatz.split(',')[0]));
    return h;
  }
  function zuAngeboten() {
    if (window.__kristall && window.__kristall.zuAngeboten) window.__kristall.zuAngeboten();
    else if (angebote) angebote.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
  }
  function angeboteMarkieren() {
    if (!angebote) return;
    [].forEach.call(angebote.querySelectorAll('[data-angebot]'), function (b) { b.setAttribute('aria-pressed', String(A.art === b.getAttribute('data-angebot'))); });
    angebote.classList.toggle('hat-wahl', !!A.art);
  }
  (function () {
    angebote = el('div', 'mf-angebote'); angebote.id = 'angebote'; angebote.setAttribute('data-mf-angebote', '');
    angebote.appendChild(el('h2', 'hinweis-versteckt', 'Angebote'));
    var aliste = el('div', 'mf-angebote__liste'), apreis = artPreise(); aliste.setAttribute('role', 'group'); aliste.setAttribute('aria-label', L.art.titel);
    L.art.optionen.forEach(function (o) {
      var b = el('button', 'k-angebot'); b.type = 'button'; b.setAttribute('data-angebot', o.id); b.setAttribute('aria-pressed', 'false');
      b.appendChild(el('span', 'k-angebot__wort', o.titel));
      var info = el('span', 'k-angebot__info k-sans'); info.appendChild(el('b', '', apreis[o.id])); info.appendChild(document.createTextNode(' · ' + (o.dezent ? o.dezent + ' – ' : '') + o.satz)); b.appendChild(info);
      var wh = wbHinweis(o); if (wh) b.appendChild(wh);
      b.addEventListener('click', function () { if (A.art !== o.id) { A.art = o.id; A.betreuung = null; A.betreuungAn = true; } neu(); gehe(schritte()[1], 1); });
      aliste.appendChild(endoLinkHuelle(b, o));
    });
    angebote.appendChild(aliste);
    /* Unter den Angeboten: „Lieber gleich schreiben“ */
    var azeile = el('div', 'mf-linkzeile mf-angebote__zeile');
    var adirekt = el('button', 'mf-link mf-angebote__direkt', L.art.direkt + ' →'); adirekt.type = 'button';
    adirekt.addEventListener('click', function () { A.art = null; neu(); gehe('anfrage', 1); });
    azeile.appendChild(adirekt);
    angebote.appendChild(azeile);
    var ainnen = q('.preise__innen'); ainnen.insertBefore(angebote, ainnen.firstChild);
  })();

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
    endo: function (w) { endoWerkbank(w); }
  };
  /* endo-Pakete (seit 11.10.2026): drei Karten in EINER Reihe wie die Website-Stufen (.mf-stufen: Handy untereinander, ab 720 px drei gleich breite
     Spalten – nie 2 + 1). Endo Start und Endo Business: eins wählbar (aria-pressed, wie die Website-Stufen). Endo AI: ausgegraut, nicht wählbar
     (disabled + aria-disabled), Schild „Im Erstgespräch“. Zahlen nur aus PREISE.endo.werkbank, Texte aus LEITFADEN.werkbank. */
  function endoWerkbank(w) {
    w.titel = LW.titel; w.satz = LW.satz;
    var g = el('div', 'mf-stufen mf-stufen--wb'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', LW.titel);
    if (A.endo.length) g.className += ' hat-wahl';
    P.endo.werkbank.forEach(function (p, nr) {
      var t = LW.karten[p.id] || {}, spaeter = !!(p.spaeter || p.anfrage), an = !spaeter && A.endo[0] === p.id;
      var b = reihe(el('button', 'mf-stufe mf-stufe--wb' + (spaeter ? ' mf-stufe--spaeter' : '')), nr); b.type = 'button'; b.setAttribute('data-fokus', 'wb-' + p.id); b.setAttribute('data-wb-paket', p.id);
      if (spaeter) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); b.appendChild(el('span', 'mf-stufe__schild mf-stufe__schild--spaeter', t.status)); }
      else b.setAttribute('aria-pressed', String(an));
      var kopf = el('span', 'mf-stufe__kopf'); kopf.appendChild(el('span', 'mf-stufe__name', p.name));
      if (!spaeter) {
        kopf.appendChild(preisEl('span', 'mf-stufe__preis', P.betrag({ preis: p.einmalig, ab: p.ab }) + ' ' + LW.einmalig));
        kopf.appendChild(el('span', 'mf-stufe__monat', '+ ' + P.monatText({ monat: p.monat, monatAb: p.ab }) + ' ' + LW.monat));
      }
      b.appendChild(kopf);
      b.appendChild(el('span', 'mf-stufe__wbsatz', t.satz));
      if (t.punkte) { var ul = el('span', 'mf-stufe__punkte'); t.punkte.forEach(function (x) { var z = el('span', 'mf-stufe__punkt'); z.innerHTML = HAKEN; z.appendChild(document.createTextNode(x)); ul.appendChild(z); }); b.appendChild(ul); }
      if (!spaeter) {
        var h = el('span', 'mf-stufe__haken'); h.innerHTML = HAKEN; b.appendChild(h);
        b.addEventListener('click', function () { A.endo = [p.id]; neuZeichnen('wb-' + p.id); });
      }
      g.appendChild(b);
    });
    w.inhalt.appendChild(g);
    /* Stand, dann Kleingedrucktes: Etikett · was wir tun · Lizenz (ganzer Satz) */
    var m = P.endoPaket(A.endo);
    if (m) w.inhalt.appendChild(el('p', 'mf-stand', m.name + ': ' + P.betrag(m) + ' ' + LW.einmalig + ' + ' + P.monatText(m) + MONAT));   /* ohne Wahl kein Satz – der Hinweis neben „Zur Anfrage“ sagt es schon (Gestalter-Urteil 11.10., Befund 11) */
    var k = el('p', 'mf-erklaer wb-klein'); k.appendChild(document.createTextNode(LW.dazu + ' · ' + P.endo.lizenzSatz + '.'));
    w.inhalt.appendChild(k);
    var a = el('a', 'mf-link', L.endo.ansehen + ' ↗'); a.href = P.endoSeite; a.target = '_blank'; a.rel = 'noopener';
    w.inhalt.appendChild(a);
  }
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
    var an = betreuungAn(), gesperrt = false, id = betreuungJetzt(), b = P.betreuung.stufen.filter(function (x) { return x.id === id; })[0], selbst = A.selbst && mitWebsite();
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
    wrap.appendChild(el('p', 'mf-betreuung__grund', !an ? L.betreuung.ohneSatz : L.betreuung.grund[id]));
    if (an && A.betreuungOffen) {
      var g = el('div', 'mf-betreuung__wahl hat-wahl'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', L.betreuung.titel);
      P.betreuung.stufen.forEach(function (x) {
        var o = el('button', 'lf-chip lf-chip--gross'); o.type = 'button'; o.setAttribute('aria-pressed', String(id === x.id)); o.setAttribute('data-fokus', 'b-' + x.id);
        o.appendChild(el('b', '', x.name + ' · ' + P.euro(x.monat - (selbst ? P.betreuung.selbst : 0)) + MONAT)); o.appendChild(el('span', '', x.fuer));
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
    var liste = schritte(), nr = liste.indexOf(id) + 1, n = liste.length, istAnfrage = id === 'anfrage';
    stand.textContent = 'Schritt ' + nr + ' von ' + n;
    linie.style.transform = 'scaleX(' + (nr / n) + ')';
    oben.hidden = !A.art; angeboteMarkieren();   /* allgemeine Anfrage: kein „Schritt x von y“ */
    var ani = still || ruhig || !richtung ? '' : richtung > 0 ? ' ist-rein' : ' ist-rein--zurueck';
    if (istAnfrage) {
      dyn.hidden = true; dyn.textContent = ''; anfrageBox.hidden = false;
      anfrageBox.className = 'mf-anfrage' + ani;
    } else {
      anfrageBox.hidden = true; dyn.hidden = false;
      var w = { inhalt: el('div', 'mf-inhalt') };
      BAU[id](w);
      var s = el('div', 'mf-schritt' + ani); s.setAttribute('role', 'group');
      var h = el('h3', 'mf-titel', w.titel); h.id = 'mf-titel'; h.tabIndex = -1; s.setAttribute('aria-labelledby', 'mf-titel');
      s.appendChild(h); if (w.satz) s.appendChild(el('p', 'mf-satz', w.satz)); s.appendChild(w.inhalt);
      dyn.textContent = ''; dyn.appendChild(s);
    }
    zurueck.hidden = liste[nr - 2] === 'art';
    weiter.hidden = istAnfrage;
    weiter.textContent = liste[nr] === 'anfrage' ? 'Zur Anfrage' : 'Weiter';
    weiter.disabled = (id === 'website' && !A.stufe) || (id === 'endo' && !A.endo.length);
    hinweis.textContent = id === 'website' && !A.stufe ? 'Bitte wählen Sie eine Website.' : id === 'endo' && !A.endo.length ? LW.leer : '';
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
      /* weich zum Formular unter den Angeboten (Leiste oben bleibt frei) */
      var fz = (A.art ? oben : (istAnfrage ? anfrageBox : dyn)).getBoundingClientRect().top;
      if (fz < 60 || fz > window.innerHeight * 0.4) {
        if (window.__kristall && window.__kristall.zumKontakt) window.__kristall.zumKontakt();   /* misst ohne Einblend-Verschiebung */
        else window.scrollBy({ top: fz - 72, behavior: ruhig ? 'auto' : 'smooth' });
      }
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
    q('[data-mf-summe-monatlich]').textContent = e ? (e.monatlich ? 'ab ' : '') + P.euro(e.monatlich) + MONAT : '–';   /* Betreuung „ab“ wie Karte, Schritt ② und Anfrage */
    /* Lizenz-Hinweis kurz direkt unter den Summen, sobald ein endo-Paket gewählt ist; ohne Wahl „Noch nichts gewählt“ statt leerer Striche */
    var sz = summe.querySelector('.wb-summe-lizenz');
    if (!sz) { sz = el('p', 'wb-summe-lizenz', P.endo.lizenzSatz.split(',')[0]); summe.appendChild(sz); }
    sz.hidden = !(e && e.werkbank);
    var sl = summe.querySelector('.wb-summe-leer');
    if (!sl) { sl = el('p', 'wb-summe-leer', LW.summeLeer); summe.appendChild(sl); }
    summe.classList.toggle('ist-leer', !e);
    if (an && summe.offsetHeight) box.style.setProperty('--wb-leiste', summe.offsetHeight + 'px');   /* Höhe der Handy-Leiste für das Polster unten */
  }
  function neu() {
    var e = P.auswahlJetzt();
    summeZeigen();
    clearTimeout(liveT);
    liveT = setTimeout(function () { if (e && live) live.textContent = 'Einmalig ' + (e.ab ? 'ab ' : '') + P.euro(e.einmalig) + ', monatlich ' + (e.monatlich ? 'ab ' : '') + P.euro(e.monatlich) + (e.werkbank ? ', ' + P.endo.lizenzSatz : '') + '.'; }, 500);
    document.dispatchEvent(new CustomEvent('preise:auswahl', { detail: e }));
  }
  /* „ändern“ in der Anfrage → zurück zu Schritt ② (ohne Auswahl → Schritt ①); alte Anker #preise/#kontakt */
  P.zeigeSchritt = function (id) { var l = schritte(), z = id || (l.length > 2 ? l[1] : 'art'); if (z === 'art') { zuAngeboten(); return; } gehe(z, -1); };
  function ausAnker() { if (location.hash === '#kontakt') gehe('anfrage', 0); }
  window.addEventListener('hashchange', ausAnker);
  P.antworten = A;   /* für Tests und Aufnahmen */

  /* ---------- Licht auf den Karten (Auftrag 36) ----------
     Maus: ein weicher Schein folgt dem Zeiger (nur zwei CSS-Variablen auf der Karte selbst, einmal pro Bild). Handy: kurzer Lichtimpuls dort,
     wo getippt wurde. „Bewegung reduzieren“: nichts davon. Das Aussehen steht in index.html (Abschnitt „Auftrag 36“, Werte --k-…). */
  var KARTEN = '.mf-stufe, .lf-chip--gross', zeiger = null, lichtGeplant = false;
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

  zeigen('anfrage', 0, true);
})();
