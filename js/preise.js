/* ERGUN. – „Ihr Preis in 4 Fragen“ (Auftrag 27, 29.09.2026: Fragen-Leitfaden statt 4-Schritte-Assistent; Zahlen unverändert seit Auftrag 9/10).
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

/* Texte des Leitfadens (Auftrag 27). Keine Zahlen hier – Preise kommen immer aus PREISE. Kurz, freundlich, ohne Fachbegriffe. */
window.LEITFADEN = {
  art: { titel: 'Was brauchen Sie?', satz: 'Wählen Sie, was am besten passt. Sie können alles später ändern.',
    optionen: [
      { id: 'website', icon: 'website', titel: 'Neue Website', satz: 'Eine Website, die zu Ihrem Betrieb passt.', preis: function (P) { return 'ab ' + P.euro(P.stufen[0].preis); } },
      { id: 'beides', icon: 'beides', titel: 'Website + Automatisierung', satz: 'Website und endo, der Anfragen und Termine übernimmt.', preis: function (P) { return 'ab ' + P.euro(P.stufen[0].preis + P.mehr[0].preis); } },
      { id: 'endo', icon: 'endo', titel: 'Nur Automatisierung', satz: 'endo für Ihren Betrieb, ohne neue Website.', preis: function (P) { return P.betrag(P.mehr[0]) + ' + ' + P.euro(P.mehr[0].monat) + '\u00a0/ Monat'; } }] },
  stufe: { titel: 'Wie groß soll Ihre Website sein?', satz: 'Der Preis ist ein Startwert. Den genauen Umfang klären wir im Gespräch.',
    optionen: [
      { id: 'start', icon: 'klein', titel: 'Eine Seite reicht', satz: 'Kurz und klar: wer Sie sind, was Sie anbieten, wie man Sie erreicht.' },
      { id: 'business', icon: 'mittel', titel: 'Mehrere Seiten', satz: 'Zum Beispiel Leistungen, Team und Referenzen.' },
      { id: 'pro', icon: 'gross', titel: 'Groß und besonders', satz: 'Eigenes Konzept, viel Bewegung, besondere Funktionen.' }] },
  koennen: { titel: 'Was soll Ihre Website können?', satz: 'Tippen Sie auf „Ja“, wenn Sie es brauchen. Alles andere bleibt aus.' },
  /* Ja/Nein-Fragen → Extra aus PREISE (bewegung: Video-Loop oder 3D-Element) */
  fragen: [
    { id: 'termin', extra: 'termin', icon: 'termin', frage: 'Sollen Kunden online Termine buchen?', kurz: 'Terminbuchung' },
    { id: 'seo', extra: 'seo', icon: 'seo', frage: 'Sollen Sie bei Google besser gefunden werden?', kurz: 'bessere Auffindbarkeit', begriff: 'seoPaket' },
    { id: 'sprache', extra: 'sprache', icon: 'sprache', frage: 'Brauchen Sie die Seite in einer weiteren Sprache?', kurz: 'weitere Sprache' },
    { id: 'bewegung', extra: null, icon: 'bewegung', frage: 'Soll sich etwas bewegen – Video oder 3D?', kurz: 'Video bzw. 3D', begriff: 'loop' },
    { id: 'formular', extra: 'formular', icon: 'formular', frage: 'Sollen Kunden Fotos oder Dateien mitschicken können?', kurz: 'Formular mit Dateien' },
    { id: 'unterseite', extra: 'unterseite', icon: 'unterseite', frage: 'Brauchen Sie mehr Seiten als in Ihrer Größe?', kurz: 'zusätzliche Seiten' }],
  googleFrage: 'Auch in Google Maps?',
  bewegungPreis: function (P) { var l = P.alleExtras().filter(function (x) { return x.id === 'loop'; })[0]; return 'ab ' + P.euro(l.preis); },
  endo: { titel: 'Wo soll endo helfen?', satz: 'Wählen Sie eine oder mehrere Aufgaben. endo erledigt sie für Sie.',
    faehigkeiten: [
      { id: 'empfang', name: 'Empfang', satz: 'beantwortet Anfragen rund um die Uhr' },
      { id: 'termine', name: 'Termine', satz: 'Kunden buchen selbst, mit Erinnerung' },
      { id: 'kontakte', name: 'Kontakte', satz: 'Ihre Kundenkartei mit Erinnerungen' },
      { id: 'social', name: 'Social', satz: 'Posts für den ganzen Monat' },
      { id: 'studio', name: 'Studio', satz: 'Bilder und Videos aus Handyfotos' },
      { id: 'uebersicht', name: 'Übersicht', satz: 'Ihr Wochenbericht' }],
    leer: 'Bitte wählen Sie mindestens eine Aufgabe für endo.',
    komplettSatz: 'Ab 4 Aufgaben ist endo komplett günstiger: alle Fähigkeiten zum Paketpreis.' },
  betreuung: { titel: 'Wer kümmert sich danach?', satz: 'Wir halten alles sicher und aktuell, zum festen Monatspreis. Hosting, Domain und SSL sind dabei.',
    grund: { basis: 'Für eine Website ohne eigene Funktionen reicht Basis.', aktiv: 'Aktiv passt, weil Ihre Website Termine oder Formulare verarbeitet.', rundum: 'Rundum passt, weil Ihre Website viel Eigenes kann.' },
    endo: 'Mit endo ist Rundum nötig: endo wird laufend betreut.',
    selbst: 'Ich habe eigenes Hosting und eine eigene Domain' },
  ergebnis: { titel: 'Ihr Preis', satz: 'So setzt sich Ihr Preis zusammen.' }
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
    z.push('• Betreuung: ' + (e.betreuung ? e.betreuung.name + ' (' + P.euro(e.monatlich) + ' / Monat' + (e.selbst ? ', Hosting & Domain stelle ich selbst' : '') + ')' : 'keine'));
    z.push('Einmalig ' + ab + P.euro(e.einmalig) + ' · monatlich ' + P.euro(e.monatlich) + ' · erstes Jahr ' + ab + P.euro(e.jahr) + ' (unverbindliche Einschätzung)');
    return z.join('\n').replace(/ /g, ' ');   /* feste Leerzeichen → normale (WhatsApp/Mail) */
  };
})(window.PREISE);

/* ---------- Bereich auf der Seite: „Ihr Preis in 4 Fragen“ (Auftrag 27, ERGUN. 29.09.2026; ersetzt den 4-Schritte-Assistenten 9/9b) ----------
   Immer nur EINE Frage: ① Was brauchen Sie? ② Wie groß? (übersprungen bei „Nur endo“) ③ Was soll sie können? (+ „Wo soll endo helfen?“)
   ④ Wer kümmert sich danach? → „Ihr Preis“. Große antippbare Karten, Fortschritt „Frage 2 von 4“, Zurück, oben dezent der laufende Betrag.
   Fachbegriffe nur hinter ⓘ. Übergang 200 ms, „Bewegung reduzieren“ = sofort. Das Kontaktformular liest die Auswahl über
   PREISE.auswahlJetzt() und das Ereignis „preise:auswahl“. Nichts wird gespeichert oder gesendet. */
(function () {
  if (typeof document === 'undefined') return;
  var P = window.PREISE, B = window.BEGRIFFE, L = window.LEITFADEN, box = document.querySelector('[data-preise]');
  if (!box) return;
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function q(s) { return box.querySelector(s); }
  var MONAT = ' / Monat';

  /* Schlichte Linien-Zeichnungen (48er Raster, currentColor) */
  var ICON = {
    website: '<rect x="6" y="9" width="36" height="28" rx="4"/><path d="M6 16h36"/><circle cx="11" cy="12.5" r=".8"/><circle cx="14.5" cy="12.5" r=".8"/><path d="M12 23h14M12 28h9"/><rect x="30" y="22" width="7" height="9" rx="1.5"/>',
    beides: '<rect x="4" y="11" width="30" height="24" rx="4"/><path d="M4 17h30M10 24h12M10 28h8"/><path d="M40 6v8M36 10h8"/><circle cx="38" cy="30" r="6"/><path d="M38 27v3l2 1.5"/>',
    endo: '<circle cx="24" cy="24" r="8"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(-20 24 24)"/><circle cx="40" cy="17" r="2"/>',
    klein: '<rect x="14" y="7" width="20" height="34" rx="3"/><path d="M18 14h12M18 19h9M18 24h12M18 29h7"/>',
    mittel: '<rect x="8" y="12" width="18" height="28" rx="3"/><rect x="15" y="9" width="18" height="28" rx="3"/><rect x="22" y="6" width="18" height="28" rx="3"/><path d="M26 13h10M26 18h7"/>',
    gross: '<rect x="8" y="8" width="32" height="32" rx="4"/><path d="M8 16h32"/><path d="M24 22l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/>',
    termin: '<rect x="8" y="10" width="32" height="30" rx="4"/><path d="M8 18h32M16 6v8M32 6v8"/><path d="m18 29 4 4 8-8"/>',
    seo: '<circle cx="21" cy="21" r="11"/><path d="m29 29 11 11"/><path d="M16 21h10M21 16v10"/>',
    google: '<path d="M24 42s13-12.5 13-22a13 13 0 0 0-26 0c0 9.5 13 22 13 22z"/><circle cx="24" cy="20" r="4.5"/>',
    sprache: '<circle cx="24" cy="24" r="16"/><path d="M8 24h32M24 8c5 5 5 27 0 32M24 8c-5 5-5 27 0 32"/>',
    bewegung: '<rect x="6" y="10" width="36" height="28" rx="4"/><path d="m21 18 9 6-9 6z"/>',
    formular: '<path d="M30 14 16.5 27.5a4 4 0 0 0 5.7 5.7L36 19.4a7 7 0 0 0-9.9-9.9L12 23.6a10 10 0 0 0 14.1 14.1L38 25.8"/>',
    unterseite: '<rect x="10" y="6" width="22" height="30" rx="3"/><path d="M15 13h12M15 18h9"/><circle cx="34" cy="34" r="8"/><path d="M34 30v8M30 34h8"/>',
    basis: '<path d="M24 6 10 12v10c0 9 6 16 14 20 8-4 14-11 14-20V12z"/><path d="m18 24 4 4 8-8"/>',
    aktiv: '<path d="M38 24a14 14 0 1 1-4.1-9.9"/><path d="M38 8v7h-7"/><path d="M24 17v7l5 3"/>',
    rundum: '<circle cx="24" cy="24" r="6"/><circle cx="24" cy="24" r="16"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6"/>',
    hosting: '<rect x="8" y="9" width="32" height="12" rx="3"/><rect x="8" y="27" width="32" height="12" rx="3"/><circle cx="14" cy="15" r="1.2"/><circle cx="14" cy="33" r="1.2"/><path d="M22 15h12M22 33h12"/>'
  };
  function icon(n) { return '<svg class="lf-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || '') + '</svg>'; }
  var HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';

  /* ---------- Antworten (nur Arbeitsspeicher) ---------- */
  var A = { art: null, stufe: null, ja: {}, bewegung: 'loop', seiten: 1, endo: [], betreuung: null, betreuungSelbst: false, selbst: false };
  function mitWebsite() { return A.art === 'website' || A.art === 'beides'; }
  function mitEndo() { return A.art === 'endo' || A.art === 'beides'; }
  function enthalten(id) { var s = P.stufen.filter(function (x) { return x.id === A.stufe; })[0]; return !!(s && (s.enthaelt || []).indexOf(id) >= 0); }
  function extrasIds() {
    if (!mitWebsite()) return [];
    var l = [];
    L.fragen.forEach(function (f) {
      if (!A.ja[f.id]) return;
      var ids = f.id === 'bewegung' ? [A.bewegung] : [f.extra];
      if (f.id === 'seo' && A.ja.google) ids.push('google');
      ids.forEach(function (x) { if (x && !enthalten(x)) l.push(x); });
    });
    return l;
  }
  function auswahl() {
    return { stufe: mitWebsite() ? A.stufe : null, extras: extrasIds(), anzahl: { unterseite: A.seiten }, endo: mitEndo() ? A.endo.slice() : [],
      betreuung: A.betreuung || P.betreuungEmpfehlung(auswahlOhneBetreuung()), selbst: mitWebsite() && A.selbst };
  }
  function auswahlOhneBetreuung() { return { stufe: mitWebsite() ? A.stufe : null, extras: extrasIds(), endo: mitEndo() ? A.endo : [] }; }
  function leer() { return !A.art || (mitWebsite() && !A.stufe) || (!mitWebsite() && !A.endo.length); }   /* erst mit einem echten Preis */
  P.auswahlJetzt = function () { return leer() ? null : P.rechnen(auswahl()); };

  /* ---------- Fragen ---------- */
  function fragenListe() { return ['art'].concat(A.art === 'endo' ? [] : ['stufe'], ['koennen', 'betreuung']); }
  var aktiv = 'art', buehne = q('[data-lf-buehne]'), stand = q('[data-lf-stand]'), balken = q('[data-lf-balken]'), betrag = q('[data-lf-betrag]');
  var zurueck = q('[data-lf-zurueck]'), weiter = q('[data-lf-weiter]'), live = q('[data-preise-live]'), liveT;
  function karte(opt) {   /* große antippbare Karte = echter Knopf mit aria-pressed */
    var b = el('button', 'lf-karte' + (opt.klein ? ' lf-karte--klein' : '')); b.type = 'button'; b.setAttribute('aria-pressed', String(!!opt.an));
    if (opt.schild) b.appendChild(el('span', 'lf-karte__schild', opt.schild));
    var i = el('span', 'lf-karte__bild'); i.innerHTML = icon(opt.icon); b.appendChild(i);
    var t = el('span', 'lf-karte__text'); t.appendChild(el('span', 'lf-karte__titel', opt.titel)); if (opt.satz) t.appendChild(el('span', 'lf-karte__satz', opt.satz)); b.appendChild(t);
    if (opt.preis) b.appendChild(el('span', 'lf-karte__preis', opt.preis));
    var h = el('span', 'lf-karte__haken'); h.innerHTML = HAKEN; b.appendChild(h);
    b.addEventListener('click', opt.wahl);
    return b;
  }
  function info(schluessel) {   /* ⓘ klappt die Erklärung direkt darunter auf */
    var w = el('span', 'lf-info'), k = el('button', 'lf-info__knopf', 'i'); k.type = 'button';
    var t = el('span', 'lf-info__text', B[schluessel].text); t.hidden = true; t.id = 'lf-info-' + schluessel;
    k.setAttribute('aria-expanded', 'false'); k.setAttribute('aria-controls', t.id); k.setAttribute('aria-label', 'Was heißt „' + B[schluessel].name + '“?');
    k.addEventListener('click', function (e) { e.stopPropagation(); t.hidden = !t.hidden; k.setAttribute('aria-expanded', String(!t.hidden)); });
    w.appendChild(k); return { knopf: w, text: t };
  }
  function schalter(an, label, fn, key) {
    var s = el('button', 'lf-schalter'); s.type = 'button'; s.setAttribute('role', 'switch'); s.setAttribute('aria-checked', String(!!an)); s.setAttribute('aria-label', label);
    if (key) s.setAttribute('data-fokus', key);
    s.appendChild(el('span', 'lf-schalter__ja', 'Ja')); s.appendChild(el('span', 'lf-schalter__nein', 'Nein'));
    s.addEventListener('click', fn); return s;
  }

  var BAU = {
    art: function (w) {
      w.titel = L.art.titel; w.satz = L.art.satz;
      var g = el('div', 'lf-karten lf-karten--drei');
      L.art.optionen.forEach(function (o) {
        g.appendChild(karte({ icon: o.icon, titel: o.titel, satz: o.satz, preis: o.preis(P), an: A.art === o.id, wahl: function () {
          var wechsel = A.art !== o.id; A.art = o.id; if (wechsel) A.betreuung = null;
          weiterNach(true);
        } }));
      });
      w.inhalt.appendChild(g);
    },
    stufe: function (w) {
      w.titel = L.stufe.titel; w.satz = L.stufe.satz;
      var g = el('div', 'lf-karten lf-karten--drei');
      L.stufe.optionen.forEach(function (o) {
        var s = P.stufen.filter(function (x) { return x.id === o.id; })[0];
        g.appendChild(karte({ icon: o.icon, titel: o.titel, satz: o.satz, preis: P.betrag(s), schild: s.empfehlung ? 'Empfehlung' : '', an: A.stufe === o.id, wahl: function () { A.stufe = o.id; if (!A.betreuungSelbst) A.betreuung = null; weiterNach(true); } }));
      });
      w.inhalt.appendChild(g);
      var d = el('details', 'lf-mehr'); d.appendChild(el('summary', '', 'Was ist in jeder Größe enthalten?'));
      var r = el('div', 'lf-mehr__raster');
      P.stufen.forEach(function (s) {
        var sp = el('div'); sp.appendChild(el('b', '', s.name + ' · ' + P.betrag(s)));
        var ul = el('ul'); s.punkte.forEach(function (p) { ul.appendChild(el('li', '', p.t)); }); sp.appendChild(ul); r.appendChild(sp);
      });
      d.appendChild(r); w.inhalt.appendChild(d);
    },
    koennen: function (w) {
      w.titel = mitWebsite() ? L.koennen.titel : L.endo.titel; w.satz = mitWebsite() ? L.koennen.satz : L.endo.satz;
      if (mitWebsite()) {
        var ul = el('ul', 'lf-fragen'); ul.setAttribute('role', 'list');
        L.fragen.forEach(function (f) {
          var li = el('li', 'lf-frage'), kopf = el('div', 'lf-frage__kopf');
          var bild = el('span', 'lf-frage__bild'); bild.innerHTML = icon(f.icon); kopf.appendChild(bild);
          var t = el('span', 'lf-frage__text'); t.appendChild(el('span', 'lf-frage__was', f.frage));
          var extra = f.extra && P.alleExtras().filter(function (x) { return x.id === f.extra; })[0];
          var schon = f.extra && enthalten(f.extra) || (f.id === 'bewegung' && enthalten('loop') && enthalten('3d'));
          t.appendChild(el('span', 'lf-frage__preis', schon ? 'Schon in ' + stufeName() + ' enthalten' : extra ? '+ ' + P.betrag(extra) + (f.id === 'unterseite' ? ' je Seite' : '') : '+ ' + L.bewegungPreis(P)));
          kopf.appendChild(t);
          var inf = f.begriff ? info(f.begriff) : null; if (inf) kopf.appendChild(inf.knopf);
          if (schon) kopf.appendChild(el('span', 'lf-frage__schon', 'enthalten'));
          else kopf.appendChild(schalter(A.ja[f.id], f.frage, function () { A.ja[f.id] = !A.ja[f.id]; neu(); zeigen(aktiv, 0, true, 'ja-' + f.id); }, 'ja-' + f.id));
          li.appendChild(kopf); if (inf) li.appendChild(inf.text);
          if (!schon && A.ja[f.id] && f.id === 'seo') {   /* Nachfrage: auch in Google Maps? */
            var g = el('div', 'lf-unter'), gi = el('span', 'lf-frage__was', L.googleFrage), gp = P.alleExtras().filter(function (x) { return x.id === 'google'; })[0];
            g.appendChild(gi); g.appendChild(el('span', 'lf-frage__preis', '+ ' + P.betrag(gp)));
            g.appendChild(schalter(A.ja.google, L.googleFrage, function () { A.ja.google = !A.ja.google; neu(); zeigen(aktiv, 0, true, 'ja-google'); }, 'ja-google'));
            li.appendChild(g);
          }
          if (!schon && A.ja[f.id] && f.id === 'bewegung') {   /* Video oder 3D */
            var c = el('div', 'lf-unter lf-chips'); c.setAttribute('role', 'group'); c.setAttribute('aria-label', 'Was soll sich bewegen?');
            [['loop', 'Video'], ['3d', '3D-Element']].forEach(function (x) {
              var m = P.alleExtras().filter(function (y) { return y.id === x[0]; })[0], dabei = enthalten(x[0]);
              var b = el('button', 'lf-chip', x[1] + (dabei ? ' · enthalten' : ' · ' + P.betrag(m))); b.type = 'button'; b.setAttribute('aria-pressed', String(A.bewegung === x[0]));
              b.setAttribute('data-fokus', 'bw-' + x[0]);
              b.addEventListener('click', function () { A.bewegung = x[0]; neu(); zeigen(aktiv, 0, true, 'bw-' + x[0]); });
              c.appendChild(b);
            });
            li.appendChild(c);
          }
          if (!schon && A.ja[f.id] && f.id === 'unterseite') {   /* Anzahl */
            var z = el('div', 'lf-unter lf-zahl'); z.appendChild(el('span', 'lf-frage__was', 'Wie viele zusätzliche Seiten?'));
            var minus = el('button', 'lf-zahl__knopf', '−'), wert = el('output', 'lf-zahl__wert', String(A.seiten)), plus = el('button', 'lf-zahl__knopf', '+');
            minus.type = plus.type = 'button'; minus.setAttribute('aria-label', 'Eine Seite weniger'); plus.setAttribute('aria-label', 'Eine Seite mehr');
            minus.disabled = A.seiten <= 1; plus.disabled = A.seiten >= 10;
            minus.addEventListener('click', function () { A.seiten = Math.max(1, A.seiten - 1); neu(); zeigen(aktiv, 0, true, 'minus'); });
            plus.addEventListener('click', function () { A.seiten = Math.min(10, A.seiten + 1); neu(); zeigen(aktiv, 0, true, 'plus'); });
            minus.setAttribute('data-fokus', 'minus'); plus.setAttribute('data-fokus', 'plus');
            z.appendChild(minus); z.appendChild(wert); z.appendChild(plus); li.appendChild(z);
          }
          ul.appendChild(li);
        });
        w.inhalt.appendChild(ul);
      }
      if (mitEndo()) {
        var e = el('div', 'lf-endo');
        if (mitWebsite()) { e.appendChild(el('h4', 'lf-endo__titel', L.endo.titel)); e.appendChild(el('p', 'lf-endo__satz', L.endo.satz)); }
        var c = el('div', 'lf-chips lf-chips--endo'); c.setAttribute('role', 'group'); c.setAttribute('aria-label', L.endo.titel);
        L.endo.faehigkeiten.forEach(function (f) {
          var b = el('button', 'lf-chip lf-chip--gross'); b.type = 'button'; b.setAttribute('aria-pressed', String(A.endo.indexOf(f.id) >= 0));
          b.appendChild(el('b', '', f.name)); b.appendChild(el('span', '', f.satz));
          b.addEventListener('click', function () { var i = A.endo.indexOf(f.id); if (i >= 0) A.endo.splice(i, 1); else A.endo.push(f.id); neu(); zeigen(aktiv, 0, true, 'endo-' + f.id); });
          b.setAttribute('data-fokus', 'endo-' + f.id);
          c.appendChild(b);
        });
        e.appendChild(c);
        var n = A.endo.length, m = P.endoPaket(A.endo);
        e.appendChild(el('p', 'lf-endo__stand', n ? (n >= 4 ? L.endo.komplettSatz : n + (n === 1 ? ' Fähigkeit' : ' Fähigkeiten') + ': ' + P.betrag(m) + ' + ' + P.euro(m.monat) + MONAT + (n === 3 ? ' – ab 4 Fähigkeiten ist endo komplett günstiger.' : '.')) : L.endo.leer));
        w.inhalt.appendChild(e);
      }
    },
    betreuung: function (w) {
      w.titel = L.betreuung.titel; w.satz = L.betreuung.satz;
      var empf = P.betreuungEmpfehlung(auswahlOhneBetreuung()), gew = A.betreuung || empf, endoPflicht = mitEndo();
      var g = el('div', 'lf-karten lf-karten--drei');
      P.betreuung.stufen.forEach(function (b) {
        var gesperrt = endoPflicht && b.id !== P.mehrStufe;
        var k = karte({ icon: b.id, titel: b.name, satz: b.fuer, preis: P.euro(b.monat - (A.selbst && mitWebsite() ? P.betreuung.selbst : 0)) + MONAT, klein: true,
          schild: b.id === empf ? 'Passt zu Ihrer Auswahl' : '', an: gew === b.id, wahl: function () { if (gesperrt) return; A.betreuung = b.id; A.betreuungSelbst = true; neu(); zeigen(aktiv, 0, true, 'b-' + b.id); } });
        k.setAttribute('data-fokus', 'b-' + b.id);
        if (gesperrt) { k.disabled = true; k.setAttribute('aria-disabled', 'true'); }
        g.appendChild(k);
      });
      w.inhalt.appendChild(g);
      w.inhalt.appendChild(el('p', 'lf-grund', (endoPflicht ? L.betreuung.endo : L.betreuung.grund[empf])));
      if (mitWebsite()) {
        var s = el('div', 'lf-frage lf-frage--hosting'), kopf = el('div', 'lf-frage__kopf');
        var bild = el('span', 'lf-frage__bild'); bild.innerHTML = icon('hosting'); kopf.appendChild(bild);
        var t = el('span', 'lf-frage__text'); t.appendChild(el('span', 'lf-frage__was', L.betreuung.selbst)); t.appendChild(el('span', 'lf-frage__preis', '− ' + P.euro(P.betreuung.selbst) + MONAT)); kopf.appendChild(t);
        kopf.appendChild(schalter(A.selbst, L.betreuung.selbst, function () { A.selbst = !A.selbst; neu(); zeigen(aktiv, 0, true, 'selbst'); }, 'selbst'));
        s.appendChild(kopf); w.inhalt.appendChild(s);
      }
    },
    ergebnis: function (w) {
      var e = P.rechnen(auswahl()), ab = e.ab ? 'ab ' : '';
      w.titel = L.ergebnis.titel; w.satz = L.ergebnis.satz;
      var z = el('div', 'lf-summen');
      [['Einmalig', ab + P.euro(e.einmalig), 'lf-summe--haupt', ''], ['Monatlich', P.euro(e.monatlich), '', MONAT], ['Erstes Jahr', ab + P.euro(e.jahr), '', '']].forEach(function (x) {
        var d = el('div', 'lf-summe ' + x[2]), zahl = el('span', 'lf-summe__zahl', x[1]);
        if (x[3]) zahl.appendChild(el('small', '', x[3]));
        d.appendChild(el('span', 'lf-summe__was', x[0])); d.appendChild(zahl); z.appendChild(d);
      });
      w.inhalt.appendChild(z);
      var dl = el('dl', 'lf-teile');
      function zeile(was, wert, klein) { var d = el('div'); var dt = el('dt', '', was); if (klein) dt.appendChild(el('small', '', klein)); d.appendChild(dt); d.appendChild(el('dd', '', wert)); dl.appendChild(d); }
      if (e.stufe) {
        var schon = L.fragen.filter(function (f) { return A.ja[f.id] && (enthalten(f.extra) || (f.id === 'bewegung' && enthalten(A.bewegung))); }).map(function (f) { return f.id === 'bewegung' ? (A.bewegung === '3d' ? '3D-Element' : 'Video') : f.kurz; });
        zeile('Website ' + e.stufe.name, P.betrag(e.stufe), schon.length ? 'Schon enthalten: ' + schon.join(', ') : e.stufe.fuer);
      }
      e.extras.forEach(function (m) { zeile(m.name + (m.anzahl > 1 ? ' × ' + m.anzahl : ''), P.betrag(m)); });
      e.mehr.forEach(function (m) { zeile('endo: ' + m.name, P.betrag(m), m.faehigkeiten ? m.faehigkeiten.join(', ') : ''); });
      if (e.betreuung) zeile('Betreuung ' + e.betreuung.name, P.euro(e.monatlich) + MONAT, e.selbst ? 'Hosting & Domain stellen Sie selbst' : 'Hosting, Domain und SSL inklusive');
      w.inhalt.appendChild(dl);
      w.inhalt.appendChild(el('p', 'lf-klein', P.klein + ' ' + P.steuer));
      var k = el('div', 'lf-ende');
      var an = el('button', 'btn btn--wa lf-anfragen', 'Angebot anfragen'); an.type = 'button'; an.setAttribute('data-preise-anfrage', '');
      an.appendChild(el('span', '', ' →')).setAttribute('aria-hidden', 'true');
      an.addEventListener('click', anfragen);
      var ae = el('button', 'btn lf-aendern', 'Antworten ändern'); ae.type = 'button'; ae.addEventListener('click', function () { zeigen('art', -1); });
      k.appendChild(an); k.appendChild(ae); w.inhalt.appendChild(k);
    }
  };
  function stufeName() { var s = P.stufen.filter(function (x) { return x.id === A.stufe; })[0]; return s ? s.name : ''; }

  /* ---------- Anzeige: eine Frage, weicher Wechsel (200 ms), Fokus auf die Frage ---------- */
  var laufend = null;
  function zeigen(id, richtung, still, fokusKey) {
    aktiv = id;
    var liste = fragenListe(), nr = liste.indexOf(id) + 1, n = liste.length, ende = id === 'ergebnis';
    stand.textContent = ende ? 'Alle Fragen beantwortet' : 'Frage ' + nr + ' von ' + n;
    balken.style.transform = 'scaleX(' + (ende ? 1 : (nr - 1) / n) + ')';
    var w = { inhalt: el('div', 'lf-frage-inhalt') };
    BAU[id](w);
    var s = el('div', 'lf-schritt' + (still || ruhig || !richtung ? '' : richtung > 0 ? ' ist-rein' : ' ist-rein--zurueck')); s.setAttribute('role', 'group');
    var h = el('h3', 'lf-titel', w.titel); h.id = 'lf-titel'; h.tabIndex = -1; s.setAttribute('aria-labelledby', 'lf-titel');
    s.appendChild(h); if (w.satz) s.appendChild(el('p', 'lf-satz', w.satz)); s.appendChild(w.inhalt);
    buehne.textContent = ''; buehne.appendChild(s);
    zurueck.hidden = id === 'art';
    weiter.hidden = id === 'art' || id === 'stufe' || ende;
    weiter.textContent = id === 'betreuung' ? 'Preis anzeigen' : 'Weiter';
    weiter.disabled = id === 'koennen' && mitEndo() && !A.endo.length;
    q('[data-lf-hinweis]').textContent = weiter.disabled ? L.endo.leer : '';
    box.classList.toggle('ist-ergebnis', ende);
    betragZeigen();
    if (fokusKey) { var f = buehne.querySelector('[data-fokus="' + fokusKey + '"]'); if (f) f.focus({ preventScroll: true }); }
    else if (!still) {
      h.focus({ preventScroll: true });
      var oben = q('.lf').getBoundingClientRect().top;
      if (oben < 0 || oben > window.innerHeight * 0.5) q('.lf').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function weiterNach(vomKlick) {
    neu();
    var liste = fragenListe().concat('ergebnis'), i = liste.indexOf(aktiv);
    clearTimeout(laufend);
    laufend = setTimeout(function () { zeigen(liste[i + 1], 1); }, vomKlick && !ruhig ? 180 : 0);   /* kurz die Wahl zeigen, dann weiter */
  }
  weiter.addEventListener('click', function () { var liste = fragenListe().concat('ergebnis'); zeigen(liste[liste.indexOf(aktiv) + 1], 1); });
  zurueck.addEventListener('click', function () { var liste = fragenListe().concat('ergebnis'); zeigen(liste[Math.max(0, liste.indexOf(aktiv) - 1)], -1); });

  /* laufender Betrag oben (dezent) + Ansage + Formular */
  function betragZeigen() {
    var e = P.auswahlJetzt();
    betrag.hidden = !e || aktiv === 'ergebnis';
    if (e) betrag.textContent = 'Bisher ' + (e.ab ? 'ab ' : '') + P.euro(e.einmalig) + (e.monatlich ? ' + ' + P.euro(e.monatlich) + MONAT : '');
  }
  function neu() {
    var e = P.auswahlJetzt();
    betragZeigen();
    clearTimeout(liveT);
    liveT = setTimeout(function () { if (e) live.textContent = 'Bisher einmalig ' + (e.ab ? 'ab ' : '') + P.euro(e.einmalig) + ', monatlich ' + P.euro(e.monatlich) + '.'; }, 500);
    document.dispatchEvent(new CustomEvent('preise:auswahl', { detail: e }));
  }
  /* „Angebot anfragen“ → Kontakt; die Box „Ihre Auswahl“ dort zeigt alles, gesendet wird erst beim Abschicken */
  function anfragen() {
    document.getElementById('kontakt').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    var form = document.getElementById('anfrage');
    setTimeout(function () { var n = form && form.elements.name; if (n) n.focus({ preventScroll: true }); }, ruhig ? 0 : 700);
  }
  /* von außen (Kontakt-Box „ändern“): zurück in den Leitfaden */
  P.zeigeSchritt = function (id) { zeigen(id || 'art', -1); };
  P.antworten = A;   /* für Tests und Aufnahmen */
  zeigen('art', 0, true);
})();
