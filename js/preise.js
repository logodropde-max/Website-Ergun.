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
  /* Automatisierung & KI → endo – NEUES PREISMODELL (Emre, 01.10.2026, Ausnahme auf Emres Wunsch; ersetzt „eine Fähigkeit ab 1.000 € +
     200 €/Monat · endo komplett ab 4.000 € + 200 €/Monat“): Der Betrieb kauft sein Programm einmalig – es gehört ihm (Cockpit, Chat-Fenster,
     Kalender, Kartei …). Die KI darin betreibt und verbessert ERGUN. – dafür die Monatsgebühr je Fähigkeit. Die Website-Betreuung bleibt
     davon getrennt. Gleiche Werte auf der endo-Seite (_code/endo-studio/js/endo-preise.js) und in Obsidian „02 Preise“ – ein Test vergleicht alle drei. */
  endo: {
    erklaer: 'Ihr Programm gehört Ihnen. Die KI darin betreiben und verbessern wir.',
    faehigkeiten: [
      { id: 'empfang', einmalig: 1200, monat: 120, hinweis: '3.000 Nachrichten/Monat im Kundenkontakt' },
      { id: 'termine', einmalig: 800, monat: 60 },
      { id: 'kontakte', einmalig: 500, monat: 40 },
      { id: 'uebersicht', einmalig: 400, monat: 30 },
      { id: 'studio', einmalig: 400, monat: 70, hinweis: 'inkl. 20 Bilder/Monat' }],
    komplett: { id: 'komplett', name: 'endo komplett', einmalig: 2800, monat: 250 },
    whatsapp: { id: 'whatsapp', name: 'WhatsApp-Kanal', satz: 'endo antwortet auch per WhatsApp.', einmalig: 500, monat: 40, hinweis: 'zzgl. WhatsApp-Gebühren (Meta)' },
    grenze: 'faire Nutzungsgrenze',
    laufzeit: 6,   /* Mindestlaufzeit je Fähigkeit in Monaten (Emre, 02.10.2026) */
    /* Drei Angebote (ERGUN., 04.10.2026, Auftrag 45 – ersetzt die Stufen-Vorschau vom 03.10.; Vorschau ?preise=angebote): jede Fähigkeit steckt in
       GENAU einem Angebot, Angebotspreis = Summe seiner Fähigkeiten; die Einzelpreise oben sind dann nur noch Rechen-Grundlage. Gleiche Werte wie
       ENDO_PREISE.angebote (_code/endo-studio/js/endo-preise.js) und in Obsidian „02 Preise“ – ein Test vergleicht alle drei. */
    angebote: [
      { id: 'kundenkontakt', name: 'Kundenkontakt', satz: 'Anfragen bleiben liegen.', faehigkeiten: ['empfang', 'kontakte'], einmalig: 1700, monat: 160, nachrichten: 3000, hinweise: ['3.000 Nachrichten/Monat'] },
      { id: 'organisation', name: 'Organisation', satz: 'Termine im Hin und Her.', faehigkeiten: ['termine', 'uebersicht'], einmalig: 1200, monat: 90, nachrichten: 2000, hinweise: ['2.000 Nachrichten/Monat'] },
      { id: 'studio', name: 'Studio-Paket', satz: 'Werbebilder kosten Zeit.', faehigkeiten: ['studio'], einmalig: 400, monat: 70, nachrichten: 500, hinweise: ['inkl. 20 Bilder/Monat', '500 Nachrichten/Monat'] }
    ]
  },
  mehrTitel: 'Automatisierung & KI → endo',
  mehrSatz: 'Automatisierung und KI für Ihren Betrieb laufen über endo – ebenfalls von ERGUN.',
  /* EINE Karte im Kontaktformular für alles aus „mehr“ (Preis = günstigste Option) */
  endoKarte: 'Automatisierung & KI mit endo',
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
   Keine Zahlen hier – Preise kommen immer aus PREISE. Pro Schritt eine Überschrift und höchstens ein kurzer Satz, ohne Fachbegriffe.
   Texte „wir“ (07.10.2026, Text-Vorschläge 9/12/13): LEITFADEN_NEU = Vorschau ?texte=neu (Schalter TEXTE_STANDARD im Kopf von index.html) –
   „bereitet Termine vor“ statt „bucht Termine und mehr“, ohne „alles aus einer Hand“, Termine „zum Bestätigen“, ohne „alle fünf“. */
var LEITFADEN_NEU = !!window.ERGUN_TEXTE_NEU;
/* Karte neu (08.10.2026, Feinschliff – Auftrag der Hauptsitzung „mach 1–4“): „Automatisierung“ und „Beides“ erzählen dieselbe Geschichte wie die
   endo-Seite (Chat antwortet sofort, jede Anfrage kommt als fertiger Kontakt an – Sätze aus „Texte (texter)“ endo klar Teil 2), Preis = Angebot
   „endo“ aus PREISE.endo (gelesen, nie getippt). Schalter KARTE_STANDARD im Kopf von index.html (window.ERGUN_KARTE_NEU), ?karte=alt = vorher.
   Ohne Kopf-Skript (Tests mit eigenem window) bleibt alles wie vorher. */
var KARTE_NEU = !!window.ERGUN_KARTE_NEU;
window.LEITFADEN = {
  art: { titel: 'Was brauchen Sie?', satz: 'Tippen Sie auf das, was passt. Den Rest klären wir im Gespräch.', direkt: 'Lieber gleich schreiben',
    optionen: [
      { id: 'website', titel: 'Website', satz: 'Eine Website, die zu Ihrem Betrieb passt.' },
      { id: 'endo', titel: 'Automatisierung', satz: KARTE_NEU ? 'Ein Chat auf Ihrer Website antwortet sofort. Jede Anfrage kommt als fertiger Kontakt an.'
        : LEITFADEN_NEU ? 'endo beantwortet Anfragen und bereitet Termine vor.' : 'endo beantwortet Anfragen, bucht Termine und mehr.', link: 'endo ansehen' },
      KARTE_NEU ? { id: 'beides', titel: 'Beides', satz: 'Ihre Website mit dem Chat endo gleich eingebaut.' }
        : LEITFADEN_NEU ? { id: 'beides', titel: 'Beides', satz: 'Ihre Website und endo zusammen.' }
        : { id: 'beides', titel: 'Beides', satz: 'Ihre Website und endo zusammen.', dezent: 'alles aus einer Hand' }] },
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
  /* endo-Fähigkeiten (5 seit Auftrag 30, 29.09.2026: Social entfernt) mit ehrlichem Status – Stand aus endo (_code/endo-studio/js/assistenten.js), dort ändern und hier nachziehen */
  endo: { titel: 'Wo soll endo helfen?', satz: 'Wählen Sie eine oder mehrere Fähigkeiten – oder alles zusammen.', ansehen: 'So sieht das aus: endo ansehen',
    einmalig: 'einmalig', monatlich: 'monatlich', zusatz: 'Zusatz', statt: 'statt', einzeln: 'einzeln', guenstiger: LEITFADEN_NEU ? 'endo komplett ist hier günstiger.' : 'endo komplett ist hier günstiger – Sie bekommen alle fünf.',
    faehigkeiten: [
      { id: 'empfang', name: 'Empfang', satz: 'beantwortet Anfragen rund um die Uhr', status: 'Demo' },
      { id: 'termine', name: 'Termine', satz: LEITFADEN_NEU ? 'Terminwünsche zum Bestätigen, mit Erinnerung' : 'Kunden buchen selbst, mit Erinnerung', status: 'In Arbeit' },
      { id: 'kontakte', name: 'Kontakte', satz: 'Ihre Kundenkartei mit Erinnerungen', status: 'In Arbeit' },
      { id: 'uebersicht', name: 'Übersicht', satz: 'Ihr Wochenbericht', status: 'In Arbeit' },
      { id: 'studio', name: 'Studio', satz: 'Bilder und Videos aus Handyfotos', status: 'Demo' }],   /* 04.10.2026: Demo, bis Studio an der Firma hängt */
    komplett: 'Alle fünf Fähigkeiten zum Paketpreis.', leer: 'Bitte wählen Sie mindestens eine Fähigkeit.',
    /* Angebote (Auftrag 45, 04.10.2026, ?preise=angebote) */
    titelAngebote: 'Welches Angebot passt?', satzAngebote: 'Wählen Sie ein Angebot oder mehrere. Alle drei zusammen sind endo komplett.', satzEin: 'endo und Studio gibt es einzeln – oder beide zusammen.', satzZwei: 'Vergeben Sie Termine? Dann Empfang + Termine, sonst reicht Empfang. Studio gibt es einzeln dazu.', leerAngebote: 'Bitte wählen Sie ein Angebot.',
    whatsappAngebot: 'Kommt zu einem gewählten Angebot dazu.', komplettAngebote: 'Alle drei Angebote zum Paketpreis.', guenstigerAngebote: 'endo komplett ist hier günstiger – Sie bekommen alle drei.', alleDrei: 'alle drei',
    whatsappNur: 'Kommt zu einer gewählten Fähigkeit dazu.',
    satzEndoKarte: 'Ein Chat antwortet Ihren Kunden sofort. Jede Anfrage kommt als fertiger Kontakt an.' },   /* Karte neu: Satz am Angebot endo in Schritt ② */
  anfrage: { titel: 'Ihre Anfrage', satz: 'Antwort innerhalb von 24 Stunden.', leer: 'Nichts ausgewählt – schreiben Sie einfach, worum es geht.', auswahl: 'Auswahl treffen' }
};

/* ---------- Rechnen (auch für die Tests) ---------- */
(function (P) {
  P.euro = function (n) { return Math.round(n).toLocaleString('de-DE') + ' €'; };
  P.betrag = function (x) { return (x.ab ? 'ab ' : '') + P.euro(x.preis); };
  P.monatText = function (x) { return (x.monatAb ? 'ab ' : '') + P.euro(x.monat); };
  /* endo je Fähigkeit (aus PREISE.endo) + abgeleitete Pakete für Karten und ältere Fassungen: mehr[0] = „Einzelne Fähigkeit“ (günstigste,
     einmalig und monatlich je für sich), mehr[1] = endo komplett. Nichts davon von Hand – alles aus PREISE.endo berechnet. */
  /* Schalter Angebote (Auftrag 45, 04.10.2026): ANGEBOTE_STANDARD = true seit ERGUNs „OK“ (Rückweg Tag vor-angebote-live) – ?preise=einzeln = vorher.
     Gleicher Schalter auf der endo-Seite (js/endo-preise.js, Test). Vorgabe von außen (Tests): window.ENDO_ANGEBOTE_AN = true|false. */
  var ANGEBOTE_STANDARD = true, aq = typeof location !== 'undefined' ? (/[?&]preise=(angebote|einzeln)\b/.exec(location.search || '') || [])[1] : '';
  var W0 = typeof window !== 'undefined' ? window : {};
  P.angeboteAn = typeof W0.ENDO_ANGEBOTE_AN === 'boolean' ? W0.ENDO_ANGEBOTE_AN : aq === 'angebote' || (ANGEBOTE_STANDARD && aq !== 'einzeln');
  /* Paket 1e (ERGUN., 04.10.2026, 19:06): ZWEI Angebote – endo und Studio, jedes einzeln, beides = Summe. Gleich wie ENDO_PREISE (endo-Seite) und „02 Preise“.
     EIN_STANDARD = true (Rückweg Tag vor-ein-endo), ?angebot=drei = vorher. Tests: ENDO_EIN_AN. */
  var EIN_STANDARD = true, eq = typeof location !== 'undefined' ? (/[?&]angebot=(ein|drei)\b/.exec(location.search || '') || [])[1] : '';
  P.ein = P.angeboteAn && (typeof W0.ENDO_EIN_AN === 'boolean' ? W0.ENDO_EIN_AN : eq === 'ein' || (EIN_STANDARD && eq !== 'drei'));
  P.endo.angeboteDrei = P.endo.angebote; P.endo.komplettDrei = P.endo.komplett;
  if (P.ein) {
    P.endo.angebote = [
      { id: 'endo', name: 'endo', satz: 'Anfragen, Kontakte, Termine – aus einem Chat.', faehigkeiten: ['empfang', 'kontakte', 'termine', 'uebersicht'], einmalig: 2400, monat: 180, nachrichten: 5000, hinweise: ['5.000 Nachrichten/Monat'] },
      { id: 'studio', name: 'Studio', satz: 'Werbebilder aus Ihren Fotos.', faehigkeiten: ['studio'], einmalig: 400, monat: 70, nachrichten: 500, bilder: 20, hinweise: ['20 Bilder/Monat', '500 Nachrichten/Monat'] }
    ];
    P.endo.komplett = { id: 'komplett', name: 'endo + Studio', einmalig: 2800, monat: 250, nachrichten: 5500, bilder: 20 };
  }
  /* endo zwei Pakete (ERGUN., 09.10.2026, Auftrag „endo zwei Pakete“ Teil A): endo Empfang 490 € + 79 €/Monat (1.000 Nachrichten) · endo Empfang + Termine
     790 € + 119 €/Monat (2.000 Nachrichten, alle vier Fähigkeiten = das bisherige endo) · Studio unverändert. Gleich wie ENDO_PREISE.pakete (endo-Seite) und
     „02 Preise“ (Test ein.test.mjs). Die Karte „Automatisierung“ zeigt „ab 490 € + 79 €/Monat“, „Beides“ rechnet daraus. Schalter ZWEI_STANDARD
     (gleich in js/endo-preise.js), ?pakete=alt = vorher. Tests: window.ENDO_PAKETE_ZWEI. */
  P.endo.pakete = [
    { id: 'empfang', name: 'endo Empfang', satz: 'Jede Anfrage von Ihrer Website landet bei Ihnen.', faehigkeiten: ['empfang', 'kontakte', 'uebersicht'], einmalig: 490, monat: 79, nachrichten: 1000 },
    { id: 'empfang-termine', name: 'endo Empfang + Termine', satz: 'Dazu vergibt endo Ihre Termine selbst.', faehigkeiten: ['empfang', 'kontakte', 'termine', 'uebersicht'], einmalig: 790, monat: 119, nachrichten: 2000 }];
  var ZWEI_STANDARD = true, zwq = typeof location !== 'undefined' ? (/[?&]pakete=(an|alt)\b/.exec(location.search || '') || [])[1] : '';
  P.zwei = P.ein && (typeof W0.ENDO_PAKETE_ZWEI === 'boolean' ? W0.ENDO_PAKETE_ZWEI : zwq === 'an' || (ZWEI_STANDARD && zwq !== 'alt'));
  if (P.zwei) {
    var pt2 = P.endo.pakete[1], st2 = P.endo.angebote[1];
    /* Schritt ②: beide Pakete gleichrangig ankreuzbar (pruefer 09.10.) – sie schließen sich aus (Empfang + Termine enthält Empfang), Studio kommt dazu */
    P.endo.angebote = P.endo.pakete.map(function (p) { return { id: p.id, name: p.name, satz: p.satz, faehigkeiten: p.faehigkeiten.slice(), einmalig: p.einmalig, monat: p.monat, nachrichten: p.nachrichten,
      hinweise: [p.nachrichten.toLocaleString('de-DE') + ' Nachrichten/Monat'], paket: true }; }).concat([st2]);
    P.endo.komplett = { id: 'komplett', name: 'endo + Studio', einmalig: pt2.einmalig + st2.einmalig, monat: pt2.monat + st2.monat, nachrichten: pt2.nachrichten + st2.nachrichten, bilder: st2.bilder };
  }
  /* günstigstes endo-Paket (Karte „Automatisierung“: „ab …“) */
  P.endoAb = function () { var l = P.zwei ? P.endo.pakete : P.endo.angebote.filter(function (a) { return a.id === 'endo'; }); return { einmalig: Math.min.apply(null, l.map(function (a) { return a.einmalig; })), monat: Math.min.apply(null, l.map(function (a) { return a.monat; })) }; };
  P.endoAngebot = function (id) { return P.endo.angebote.filter(function (x) { return x.id === id; })[0] || null; };
  P.endoAngebotVon = function (k) {
    if (P.zwei) return P.endoAngebot(k === 'studio' ? 'studio' : k === 'termine' ? 'empfang-termine' : 'empfang');
    return P.endo.angebote.filter(function (x) { return x.faehigkeiten.indexOf(k) >= 0; })[0] || null; };
  /* Angebote, die eine Auswahl von Fähigkeiten berührt (jede Fähigkeit steckt in genau einem) – in der Reihenfolge der Angebote */
  P.endoAngeboteFuer = function (ids) { ids = ids || [];
    if (P.zwei) {   /* zwei Pakete: „termine“ gewählt = Empfang + Termine, sonst Empfang; Studio für sich */
      var z = [], end = ids.some(function (k) { return k !== 'studio'; });
      if (end) z.push(P.endoAngebot(ids.indexOf('termine') >= 0 ? 'empfang-termine' : 'empfang'));
      if (ids.indexOf('studio') >= 0) z.push(P.endoAngebot('studio'));
      return z;
    } return P.endo.angebote.filter(function (x) { return x.faehigkeiten.some(function (k) { return ids.indexOf(k) >= 0; }); }); };
  P.endoFaehigkeit = function (id) { return P.endo.faehigkeiten.filter(function (f) { return f.id === id; })[0] || null; };
  P.endoEinzeln = function () { return P.endo.faehigkeiten.reduce(function (s, f) { return { einmalig: s.einmalig + f.einmalig, monat: s.monat + f.monat }; }, { einmalig: 0, monat: 0 }); };
  var minE = Math.min.apply(null, P.endo.faehigkeiten.map(function (f) { return f.einmalig; })), minM = Math.min.apply(null, P.endo.faehigkeiten.map(function (f) { return f.monat; }));
  var minAE = Math.min.apply(null, P.endo.angebote.map(function (a) { return a.einmalig; })), minAM = Math.min.apply(null, P.endo.angebote.map(function (a) { return a.monat; }));
  P.mehr = P.angeboteAn ? [   /* Angebote: günstigstes Angebot statt „Einzelne Fähigkeit“ – nie ein Einzelpreis */
    { id: 'angebot', name: 'Ein Angebot', satz: 'Zum Beispiel Kundenkontakt: Anfragen beantworten und nachfassen.', preis: minAE, monat: minAM, ab: true, monatAb: true }
  ] : [
    { id: 'faehigkeit', name: 'Einzelne Fähigkeit', satz: 'Zum Beispiel Empfang: Anfragen automatisch beantworten, sortieren und weiterleiten.', preis: minE, monat: minM, ab: true, monatAb: true }];
  P.mehr.push(
    { id: 'komplett', name: P.endo.komplett.name, satz: 'Alle Fähigkeiten: Empfang, Termine, Kontakte, Übersicht und Studio.', preis: P.endo.komplett.einmalig, monat: P.endo.komplett.monat, ab: false });
  P.alleExtras = function () { return P.extras.reduce(function (l, g) { return l.concat(g.eintraege); }, []); };
  /* Standard-Betreuung (Rechner ohne ausdrückliche Wahl): Pro mit Terminbuchung oder Funktion → Aktiv · sonst Basis.
     endo setzt seit dem neuen Preismodell (01.10.2026) keine Betreuung mehr: den Betrieb der KI deckt die endo-Monatsgebühr. */
  P.betreuungStandard = function (a) {
    a = a || {};
    if (a.stufe === 'pro' && (a.extras || []).some(function (x) { return x === 'termin' || x === 'funktion'; })) return 'aktiv';
    return 'basis';
  };
  /* Empfehlung im Leitfaden (Frage 4, Auftrag 27): Terminbuchung, Formular mit Dateien oder eigene Funktion
     (auch wenn schon in der Stufe enthalten) → Aktiv · sonst Basis */
  P.betreuungEmpfehlung = function (a) {
    a = a || {};
    var s = P.stufen.filter(function (x) { return x.id === a.stufe; })[0], hat = (a.extras || []).concat(s && s.id === 'pro' ? ['termin', 'formular'] : []);
    return hat.some(function (x) { return x === 'termin' || x === 'formular' || x === 'funktion'; }) ? 'aktiv' : 'basis';
  };
  /* endo nach Fähigkeiten (neues Preismodell, 01.10.2026): einmalig und monatlich je Fähigkeit addiert. endo komplett, wenn alle fünf gewählt
     sind – oder automatisch, sobald es einmalig UND monatlich nicht teurer ist als die Auswahl (dann gibt es alle fünf zum selben Preis oder
     günstiger). WhatsApp-Kanal kommt als Zusatz obendrauf. */
  P.endoPaket = function (ids, whatsapp) {
    ids = ids || []; var n = ids.length, k = P.endo.komplett, w = P.endo.whatsapp;
    if (!n) return null;
    if (P.angeboteAn) {   /* Angebote: immer ganze Angebote (jede Fähigkeit zieht ihr Angebot mit) – alle drei oder nicht teurer = endo komplett */
      var ang = P.endoAngeboteFuer(ids), sa = ang.reduce(function (x, a) { return { einmalig: x.einmalig + a.einmalig, monat: x.monat + a.monat }; }, { einmalig: 0, monat: 0 });
      var alleA = !P.zwei && ang.length === P.endo.angebote.length, billiger = !P.zwei && !alleA && ang.length > 1 && k.einmalig <= sa.einmalig && k.monat <= sa.monat;   /* zwei Pakete: nie „komplett“, immer die Summe */
      var q = alleA || billiger
        ? { id: k.id, name: k.name, preis: k.einmalig, monat: k.monat, angebote: P.endo.angebote.map(function (a) { return a.id; }), faehigkeiten: [], guenstiger: billiger, statt: sa }
        : { id: 'angebote', name: ang.map(function (a) { return a.name; }).join(' + '), preis: sa.einmalig, monat: sa.monat, angebote: ang.map(function (a) { return a.id; }), faehigkeiten: [] };
      q.ab = false; q.anzahl = q.angebote.length; q.whatsapp = !!whatsapp;
      if (whatsapp) { q.preis += w.einmalig; q.monat += w.monat; }
      return q;
    }
    var gew = P.endo.faehigkeiten.filter(function (f) { return ids.indexOf(f.id) >= 0; });
    var s = gew.reduce(function (x, f) { return { einmalig: x.einmalig + f.einmalig, monat: x.monat + f.monat }; }, { einmalig: 0, monat: 0 });
    var alle = gew.length === P.endo.faehigkeiten.length, guenstiger = !alle && k.einmalig <= s.einmalig && k.monat <= s.monat;
    var namen = (window.LEITFADEN ? window.LEITFADEN.endo.faehigkeiten : []).filter(function (x) { return ids.indexOf(x.id) >= 0; }).map(function (x) { return x.name; });
    var p = alle || guenstiger
      ? { id: k.id, name: k.name, preis: k.einmalig, monat: k.monat, faehigkeiten: ['alle Fähigkeiten'], guenstiger: guenstiger, statt: s }
      : { id: 'faehigkeiten', name: n === 1 ? namen[0] || 'Eine Fähigkeit' : n + ' Fähigkeiten', preis: s.einmalig, monat: s.monat, faehigkeiten: namen };
    p.ab = false; p.anzahl = n; p.whatsapp = !!whatsapp;
    if (whatsapp) { p.preis += w.einmalig; p.monat += w.monat; }
    return p;
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
    if ((a.endo || []).length) mehr = [P.endoPaket(a.endo, a.whatsapp)];
    var bId = a.betreuung === undefined ? P.betreuungStandard(a) : a.betreuung;
    var betreuung = P.betreuung.stufen.filter(function (b) { return b.id === bId; })[0] || null;
    var betreuungMonat = betreuung ? betreuung.monat - (a.selbst ? P.betreuung.selbst : 0) : 0;
    var endoMonat = mehr.reduce(function (s, m) { return s + m.monat; }, 0);
    var monatlich = betreuungMonat + endoMonat;   /* einmalig und monatlich getrennt: Website-Betreuung + endo-Gebühr */
    var teile = [stufe].concat(extras, mehr).filter(Boolean);
    var einmalig = teile.reduce(function (s, x) { return s + x.preis; }, 0);
    return { stufe: stufe, extras: extras, mehr: mehr, betreuung: betreuung, selbst: !!a.selbst, anfrage: P.aufAnfrage.filter(function (x) { return (a.anfrage || []).indexOf(x.id) >= 0; }),
      einmalig: einmalig, ab: teile.some(function (x) { return x.ab; }), monatlich: monatlich, betreuungMonat: betreuungMonat, endoMonat: endoMonat, jahr: einmalig + 12 * monatlich };
  };
  /* Text fürs Kontaktformular (landet in der Nachricht – gesendet wird erst, wenn der Besucher selbst abschickt) */
  P.anfrageText = function (e) {
    var z = ['Meine Auswahl aus dem Preis-Leitfaden:'], ab = e.ab ? 'ab ' : '';
    if (e.stufe) z.push('• Website: ' + e.stufe.name + ' (' + P.betrag(e.stufe) + ')');
    if (e.extras.length) z.push('• Extras: ' + e.extras.map(function (m) { return m.name + (m.anzahl > 1 ? ' × ' + m.anzahl : '') + ' (' + P.betrag(m) + ')'; }).join(', '));
    if (e.anfrage.length) z.push('• Im Erstgespräch besprechen: ' + e.anfrage.map(function (x) { return x.name; }).join(', '));
    if (e.mehr.length) z.push('• Automatisierung & KI mit endo: ' + e.mehr.map(function (m) { return m.name + (m.faehigkeiten && m.id === 'faehigkeiten' && m.anzahl > 1 ? ' – ' + m.faehigkeiten.join(', ') : '') + (m.whatsapp ? ' + ' + P.endo.whatsapp.name : '') + ' (' + P.betrag(m) + ' einmalig + ' + P.monatText(m) + ' / Monat, Mindestlaufzeit ' + P.endo.laufzeit + ' Monate)'; }).join(', '));
    if (e.stufe) z.push('• Betreuung: ' + (e.betreuung ? e.betreuung.name + ' (' + P.euro(e.betreuungMonat) + ' / Monat' + (e.selbst ? ', Hosting & Domain stelle ich selbst' : '') + ')' : 'ohne Betreuung (Hosting, Domain und Updates übernehme ich selbst)'));
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
  var ESYM = {
    empfang: '<path d="M4 13l2.5-7h11L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h4.5l1 2h5l1-2H20"/>',
    termine: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="m9.5 14.5 2 2 3.5-3.5"/>',
    kontakte: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16.2a3.5 3.5 0 0 1 6.4 0"/><path d="M14 10h4M14 13.5h3"/>',
    uebersicht: '<path d="M5 19V9M10 19V5M15 19v-7M20 19v-4"/>',
    studio: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m20.5 16-4.5-4.5L7 19"/>',
    whatsapp: '<path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6z"/><path d="M9.5 9.5c.3 2.2 2.3 4.4 5 5l1-1.4-1.8-.9-.8.8c-.9-.4-1.6-1.1-2-2l.8-.8-.9-1.8z"/>',
    endo: '<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-20 12 12)"/>'
  };
  /* Ruhe (01.10.2026): dieselben Symbole wie auf der endo-Seite (_code/endo-studio/js/bausteine.js ENDO_SYMBOL) – Test vergleicht */
  if (document.documentElement.classList.contains('ruhe')) {
    ESYM.empfang = '<path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h8.5A2.5 2.5 0 0 1 17 8.5v5a2.5 2.5 0 0 1-2.5 2.5H9.5L6 19v-3a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M7 10.2h6.5M7 12.8h4"/><circle cx="19" cy="5.5" r="2.4" fill="currentColor" stroke="none"/>';
    ESYM.termine = '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="m9.5 14.5 1.8 1.8 3.4-3.4"/>';
    ESYM.kontakte = '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M5.8 16c.6-1.4 1.8-2.1 3.2-2.1s2.6.7 3.2 2.1M14.5 10h3.5M14.5 13h3.5"/>';
    ESYM.uebersicht = '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 16v-3M12 16v-6M15 16v-4"/>';
    ESYM.studio = '<rect x="3.5" y="6.5" width="14" height="13" rx="2"/><circle cx="8" cy="11" r="1.4"/><path d="m4.5 18 4-4 3 3 2-2 3.5 3.5"/><path d="M19.5 2.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>';
  }
  var HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';

  /* ---------- Antworten (nur Arbeitsspeicher) ---------- */
  var A = { art: null, stufe: null, extras: [], seiten: 1, endo: [], whatsapp: false, betreuung: null, betreuungAn: true, selbst: false, extrasOffen: false, betreuungOffen: false };
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
      whatsapp: mitEndo() && A.whatsapp && A.endo.length > 0, betreuung: betreuungAn() ? betreuungJetzt() : null, selbst: mitWebsite() && A.selbst && betreuungAn() };
  }
  function leer() { return !A.art || (mitWebsite() && !A.stufe) || (!mitWebsite() && !A.endo.length); }
  /* Anfrage-Box: Auswahl ist fertig, sobald die nötigen Teile gewählt sind (bei „Beides“ reicht die Website, endo kommt dazu) */
  P.auswahlJetzt = function () { return leer() ? null : P.rechnen(auswahl()); };

  /* ---------- Schritte ---------- */
  function schritte() { return ['art'].concat(A.art === 'website' ? ['website'] : A.art === 'endo' ? ['endo'] : A.art === 'beides' ? ['website', 'endo'] : [], ['anfrage']); }
  var aktiv = 'art', dyn = q('[data-mf-dyn]'), anfrageBox = q('[data-mf-anfrage]'), stand = q('[data-mf-stand]'), linie = q('[data-mf-linie]');
  var zurueck = q('[data-mf-zurueck]'), weiter = q('[data-mf-weiter]'), hinweis = q('[data-mf-hinweis]'), summe = q('[data-mf-summe]'), live = q('[data-preise-live]'), liveT;
  function artPreise() {   /* aus PREISE berechnet: günstigste Fähigkeit (einmalig und monatlich je für sich); Beides = Website-Start + endo ab */
    if (P.zwei) { var ab = P.endoAb();   /* endo zwei Pakete: günstigstes Paket mit „ab“, Beides = Website-Start + endo ab */
      return { website: 'ab ' + P.euro(P.stufen[0].preis), endo: 'ab ' + P.euro(ab.einmalig) + ' + ' + P.euro(ab.monat) + MONAT, beides: 'ab ' + P.euro(P.stufen[0].preis + ab.einmalig) + ' + ab ' + P.euro(ab.monat) + MONAT }; }
    var en = KARTE_NEU && P.ein ? P.endoAngebot('endo') : null;
    if (en) return { website: 'ab ' + P.euro(P.stufen[0].preis), endo: P.euro(en.einmalig) + ' + ' + P.euro(en.monat) + MONAT,   /* Karte neu: Angebot endo, fester Preis */
      beides: 'ab ' + P.euro(P.stufen[0].preis + en.einmalig) + ' + ab ' + P.euro(en.monat) + MONAT };   /* „ab“ zweimal: größere Website-Stufe kostet mehr, Betreuung (vorausgewählt) kommt monatlich dazu */
    var f = P.mehr[0];
    return { website: 'ab ' + P.euro(P.stufen[0].preis), endo: P.betrag(f) + ' + ' + P.monatText(f) + MONAT, beides: 'ab ' + P.euro(P.stufen[0].preis + f.preis) + ' + ' + P.monatText(f) + MONAT };
  }

  /* ---------- Aufräumen (?ordnung=neu, 01.10.2026 – Ausnahme auf ERGUNs Wunsch): die drei Angebote stehen groß über dem Formular und SIND
     Schritt ① (keine zweite Kartenreihe). Klick wählt und führt weich zum Formular darunter (② bzw. ③). Ohne Wahl zeigt das Formular gleich
     „Ihre Anfrage“ (allgemeine Anfrage); „Zurück“ in ② entfällt – die Angebote stehen ja darüber. ---------- */
  var ORD = !!window.ERGUN_ORDNUNG, angebote = null, oben = q('.mf__oben');
  /* Paket 1f Teil E (ERGUN., 04.10.2026 21:46): „endo ansehen ↗“ steht direkt an der Wahl „Automatisierung“ und „Beides“ (mit endo-Zeichen),
     nicht mehr unten neben „Lieber gleich schreiben“. Die Karte bleibt als Ganzes wählbar; der Link ist eine eigene Tippfläche (≥ 44 px) in einer Hülle
     neben dem Knopf (ein <a> in einem <button> wäre ungültig). Schalter ENDO_LINK_STANDARD, ?endolink=an|aus. */
  var ENDO_LINK_STANDARD = true, elq = typeof location !== 'undefined' ? (/[?&]endolink=(an|aus)\b/.exec(location.search || '') || [])[1] : '';
  var ENDO_LINK = elq === 'an' || (ENDO_LINK_STANDARD && elq !== 'aus');
  function endoLinkHuelle(knopf, o) {
    if (!ENDO_LINK || (o.id !== 'endo' && o.id !== 'beides')) return knopf;
    var hu = el('div', 'mf-wahl-huelle mf-wahl-huelle--' + o.id); hu.appendChild(knopf);   /* ERGUN., 05.10.: das endo-Logo nur bei „Automatisierung“ (--endo) */ knopf.classList.add('hat-endo-link');
    var a = el('a', 'mf-endo-link', 'endo ansehen ↗'); a.href = P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('data-endo-link', ''); a.setAttribute('aria-label', 'endo ansehen – ' + o.titel + ' (neues Fenster)');
    a.addEventListener('click', function (e) { e.stopPropagation(); });
    hu.appendChild(a); return hu;
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
  if (ORD) {
    angebote = el('div', 'mf-angebote'); angebote.id = 'angebote'; angebote.setAttribute('data-mf-angebote', '');
    angebote.appendChild(el('h2', 'hinweis-versteckt', 'Angebote'));
    var aliste = el('div', 'mf-angebote__liste'), apreis = artPreise(); aliste.setAttribute('role', 'group'); aliste.setAttribute('aria-label', L.art.titel);
    L.art.optionen.forEach(function (o) {
      var b = el('button', 'k-angebot'); b.type = 'button'; b.setAttribute('data-angebot', o.id); b.setAttribute('aria-pressed', 'false');
      b.appendChild(el('span', 'k-angebot__wort', o.titel));
      var info = el('span', 'k-angebot__info k-sans'); info.appendChild(el('b', '', apreis[o.id])); info.appendChild(document.createTextNode(' · ' + (o.dezent ? o.dezent + ' – ' : '') + o.satz)); b.appendChild(info);
      b.addEventListener('click', function () { if (A.art !== o.id) { A.art = o.id; A.betreuung = null; A.betreuungAn = true; } neu(); gehe(schritte()[1], 1); });
      aliste.appendChild(endoLinkHuelle(b, o));
    });
    angebote.appendChild(aliste);
    /* Unter den Angeboten: „Lieber gleich schreiben“ und – seit 04.10.2026 (ERGUN) – der direkte Weg zu endo. Wer „Automatisierung“
       sucht, soll endo gleich hier ansehen können. Die Angebote selbst sind Knöpfe, darum steht der Link daneben. */
    var azeile = el('div', 'mf-linkzeile mf-angebote__zeile');
    var adirekt = el('button', 'mf-link mf-angebote__direkt', L.art.direkt + ' →'); adirekt.type = 'button';
    adirekt.addEventListener('click', function () { A.art = null; neu(); gehe('anfrage', 1); });
    azeile.appendChild(adirekt);
    var aendo = L.art.optionen.filter(function (o) { return o.link; })[0];
    if (aendo && !ENDO_LINK) {   /* mit ENDO_LINK steht er an der Wahl, nicht doppelt hier */
      var al = el('a', 'mf-link mf-angebote__endo', aendo.link + ' ↗');
      al.href = P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart; al.target = '_blank'; al.rel = 'noopener';
      al.setAttribute('aria-label', aendo.link + ' – ' + aendo.titel + ' (neues Fenster)');
      azeile.appendChild(al);
    }
    angebote.appendChild(azeile);
    var ainnen = q('.preise__innen'); ainnen.insertBefore(angebote, ainnen.firstChild);
  }

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
      var preis = artPreise();
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
          var alle = [].slice.call(g.querySelectorAll('.mf-karte')), i = alle.indexOf(b); e.preventDefault();   /* auch in Hüllen (Paket 1f E) */
          alle[(i + k + alle.length) % alle.length].focus();
        });
        g.appendChild(endoLinkHuelle(b, o));
      });
      w.inhalt.appendChild(g);
      /* Links unter den Karten: wie bisher „Lieber gleich schreiben“, dazu seit 04.10.2026 (ERGUN) der direkte Weg zu endo –
         wer „Automatisierung“ sucht, soll endo gleich hier ansehen können, nicht erst im nächsten Schritt. Die Karten selbst sind
         Knöpfe, darum steht der Link daneben (ein <a> in einem <button> wäre ungültig und würde das Tippen stören). */
      var zeile = el('div', 'mf-linkzeile');
      var d = el('button', 'mf-link', L.art.direkt + ' →'); d.type = 'button';
      d.addEventListener('click', function () { A.art = null; neu(); gehe('anfrage', 1); });
      zeile.appendChild(d);
      var endoOpt = L.art.optionen.filter(function (o) { return o.link; })[0];
      if (endoOpt && !ENDO_LINK) {
        var ea = el('a', 'mf-link', endoOpt.link + ' ↗');
        ea.href = P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart; ea.target = '_blank'; ea.rel = 'noopener';
        ea.setAttribute('aria-label', endoOpt.link + ' – ' + endoOpt.titel + ' (neues Fenster)');
        zeile.appendChild(ea);
      }
      w.inhalt.appendChild(zeile);
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
    /* endo (neues Preismodell, 01.10.2026): oben „endo komplett“ als eigene Zeile mit Ersparnis, darunter die fünf Fähigkeiten als Liste –
       Symbol, Name, Stand, Kurzbeschreibung, rechts „einmalig“ und „monatlich“ getrennt; Auswahl per Haken. WhatsApp als Zusatz-Haken.
       Komplett ersetzt die Einzelauswahl (alle fünf gewählt). Darunter der Erklärsatz. Zahlen nur aus PREISE.endo. */
    endo: function (w) {
      if (P.angeboteAn) return endoAngebote(w);
      w.titel = L.endo.titel; w.satz = L.endo.satz;
      var alle = L.endo.faehigkeiten.map(function (f) { return f.id; }), K = P.endo.komplett, komplett = A.endo.length === alle.length, einz = P.endoEinzeln();
      function preise(einmalig, monat, hinweis) {
        var s = el('span', 'mf-epreis');
        var a = el('span', 'mf-epreis__teil'); a.appendChild(el('b', '', P.euro(einmalig))); a.appendChild(el('small', '', L.endo.einmalig)); s.appendChild(a);
        var m = el('span', 'mf-epreis__teil'); m.appendChild(el('b', '', P.euro(monat))); m.appendChild(el('small', '', L.endo.monatlich)); s.appendChild(m);
        if (hinweis) s.appendChild(el('small', 'mf-epreis__hinweis', hinweis));
        return s;
      }
      function zeile(cls, an, key, symbol, name, status, satz, pr, klick, gesperrt) {
        var b = el('button', 'mf-ezeile ' + cls); b.type = 'button'; b.setAttribute('role', 'checkbox'); b.setAttribute('aria-checked', String(!!an)); b.setAttribute('data-fokus', key);
        if (gesperrt) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
        var box = el('span', 'mf-haken__box'); box.setAttribute('aria-hidden', 'true'); box.innerHTML = HAKEN; b.appendChild(box);
        var sy = el('span', 'mf-ezeile__symbol' + (symbol === 'endo' ? ' mf-ezeile__symbol--endo' : '')); sy.setAttribute('aria-hidden', 'true'); sy.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ESYM[symbol] || ESYM.endo) + '</svg>'; b.appendChild(sy);
        var tx = el('span', 'mf-ezeile__text'), kopf = el('span', 'mf-ezeile__kopf'); kopf.appendChild(el('b', 'mf-ezeile__name', name));
        if (status) kopf.appendChild(el('span', 'mf-chip__status mf-chip__status--' + status.replace(' ', '-').toLowerCase(), status));
        tx.appendChild(kopf); tx.appendChild(el('span', 'mf-ezeile__satz', satz)); b.appendChild(tx);
        b.appendChild(pr);
        if (!gesperrt) b.addEventListener('click', klick);
        return b;
      }
      var c = el('div', 'mf-eliste'); c.setAttribute('role', 'group'); c.setAttribute('aria-label', L.endo.titel);
      /* endo komplett */
      var kp = preise(K.einmalig, K.monat, L.endo.statt + ' ' + P.euro(einz.einmalig) + ' + ' + P.euro(einz.monat) + MONAT + ' ' + L.endo.einzeln);
      c.appendChild(reihe(zeile('mf-ezeile--komplett', komplett, 'komplett', 'endo', K.name, '', L.endo.komplett, kp, function () { A.endo = komplett ? [] : alle.slice(); neuZeichnen('komplett'); }), 0));
      /* fünf Fähigkeiten */
      L.endo.faehigkeiten.forEach(function (f, nr) {
        var d = P.endoFaehigkeit(f.id) || { einmalig: 0, monat: 0 };
        c.appendChild(reihe(zeile('', A.endo.indexOf(f.id) >= 0, 'endo-' + f.id, f.id, f.name, f.status, f.satz, preise(d.einmalig, d.monat, d.hinweis), function () {
          var i = A.endo.indexOf(f.id); if (i >= 0) A.endo.splice(i, 1); else A.endo.push(f.id); neuZeichnen('endo-' + f.id);
        }), nr + 1));
      });
      w.inhalt.appendChild(c);
      /* Zusatz: WhatsApp-Kanal */
      var W = P.endo.whatsapp, wl = el('div', 'mf-eliste mf-eliste--zusatz'); wl.setAttribute('role', 'group'); wl.setAttribute('aria-label', L.endo.zusatz);
      wl.appendChild(el('p', 'mf-extras__titel', L.endo.zusatz));
      wl.appendChild(reihe(zeile('mf-ezeile--zusatz', A.whatsapp && A.endo.length > 0, 'whatsapp', 'whatsapp', W.name, '', A.endo.length ? W.satz : L.endo.whatsappNur, preise(W.einmalig, W.monat, W.hinweis), function () { A.whatsapp = !A.whatsapp; neuZeichnen('whatsapp'); }, !A.endo.length), alle.length + 1));
      w.inhalt.appendChild(wl);
      /* Stand + Erklärsatz */
      var m = P.endoPaket(A.endo, A.whatsapp);
      w.inhalt.appendChild(el('p', 'mf-stand', !m ? L.endo.leer : (m.guenstiger ? L.endo.guenstiger + ' ' : '') + m.name + ': ' + P.euro(m.preis) + ' ' + L.endo.einmalig + ' + ' + P.euro(m.monat) + MONAT));
      w.inhalt.appendChild(el('p', 'mf-erklaer', P.endo.erklaer + ' Mindestlaufzeit ' + P.endo.laufzeit + ' Monate je Fähigkeit, ' + P.endo.grenze + '.'));
      var a = el('a', 'mf-link', L.endo.ansehen + ' ↗'); a.href = P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart; a.target = '_blank'; a.rel = 'noopener';
      w.inhalt.appendChild(a);
    }
  };
  /* Angebote (Auftrag 45, 04.10.2026 – Vorschau ?preise=angebote): oben „endo komplett“, darunter die drei Angebote als Liste zum Ankreuzen –
     je Angebot Name, das Problem des Kunden in einem Satz, die enthaltenen Fähigkeiten mit ehrlichem Stand (Live · Demo · In Arbeit) und
     einmalig/monatlich getrennt; WhatsApp als Zusatz; nie ein Preis je Fähigkeit. Zahlen nur aus PREISE.endo.angebote. */
  function endoAngebote(w) {
    w.titel = L.endo.titelAngebote; w.satz = P.zwei ? L.endo.satzZwei : P.ein ? L.endo.satzEin : L.endo.satzAngebote;   /* Paket 1e: endo und Studio, einzeln oder beide */
    var gew = P.endoAngeboteFuer(A.endo).map(function (a) { return a.id; }), K = P.endo.komplett, ids = P.endo.angebote.map(function (a) { return a.id; });
    var komplett = gew.length === ids.length, alleF = [], NAME = {}, STAND = {};
    L.endo.faehigkeiten.forEach(function (f) { NAME[f.id] = f.name; STAND[f.id] = f.status; alleF.push(f.id); });
    var summe = P.endo.angebote.reduce(function (x, a) { return { einmalig: x.einmalig + a.einmalig, monat: x.monat + a.monat }; }, { einmalig: 0, monat: 0 });
    function preise(einmalig, monat, hinweis) {
      var s = el('span', 'mf-epreis');
      var a = el('span', 'mf-epreis__teil'); a.appendChild(el('b', '', P.euro(einmalig))); a.appendChild(el('small', '', L.endo.einmalig)); s.appendChild(a);
      var m = el('span', 'mf-epreis__teil'); m.appendChild(el('b', '', P.euro(monat))); m.appendChild(el('small', '', L.endo.monatlich)); s.appendChild(m);
      if (hinweis) s.appendChild(el('small', 'mf-epreis__hinweis', hinweis));
      return s;
    }
    function zeile(cls, an, key, symbol, name, satz, faehig, pr, klick) {
      var b = el('button', 'mf-ezeile ' + cls); b.type = 'button'; b.setAttribute('role', 'checkbox'); b.setAttribute('aria-checked', String(!!an)); b.setAttribute('data-fokus', key);
      var box = el('span', 'mf-haken__box'); box.setAttribute('aria-hidden', 'true'); box.innerHTML = HAKEN; b.appendChild(box);
      var sy = el('span', 'mf-ezeile__symbol' + (symbol === 'endo' ? ' mf-ezeile__symbol--endo' : '')); sy.setAttribute('aria-hidden', 'true'); sy.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ESYM[symbol] || ESYM.endo) + '</svg>'; b.appendChild(sy);
      var tx = el('span', 'mf-ezeile__text'), kopf = el('span', 'mf-ezeile__kopf'); kopf.appendChild(el('b', 'mf-ezeile__name', name)); tx.appendChild(kopf);
      tx.appendChild(el('span', 'mf-ezeile__satz', satz));
      if (faehig) {
        var fl = el('span', 'mf-angebot-faehig');
        faehig.forEach(function (k) {
          var f = el('span', 'mf-sfaehig');   /* EIN Symbol je Paket (ERGUN., 04.10.2026) – die Teile nur als Name + Stand */
          f.appendChild(document.createTextNode(NAME[k] || k));
          if (STAND[k]) f.appendChild(el('span', 'mf-chip__status mf-chip__status--' + STAND[k].replace(' ', '-').toLowerCase(), STAND[k]));   /* ehrlicher Stand als Wort */
          fl.appendChild(f);
        });
        tx.appendChild(fl);
      }
      b.appendChild(tx); b.appendChild(pr);
      b.addEventListener('click', klick);
      return b;
    }
    var c = el('div', 'mf-eliste'); c.setAttribute('role', 'group'); c.setAttribute('aria-label', L.endo.titelAngebote);
    /* endo komplett = alle drei (Paket 1e: entfällt – beides = einfach beide ankreuzen, die Summe) */
    if (!P.ein) c.appendChild(reihe(zeile('mf-ezeile--komplett', komplett, 'komplett', 'endo', K.name, L.endo.komplettAngebote, null,
      preise(K.einmalig, K.monat, L.endo.statt + ' ' + P.euro(summe.einmalig) + ' + ' + P.euro(summe.monat) + MONAT + ' ' + L.endo.alleDrei),
      function () { A.endo = komplett ? [] : alleF.slice(); if (!A.endo.length) A.whatsapp = false; neuZeichnen('komplett'); }), 0));
    /* drei Angebote: Ankreuzen nimmt alle Fähigkeiten des Angebots dazu bzw. weg */
    P.endo.angebote.forEach(function (an, nr) {
      var drin = gew.indexOf(an.id) >= 0;
      c.appendChild(reihe(zeile('mf-ezeile--angebot', drin, 'angebot-' + an.id, an.id === 'endo' || an.paket ? 'endo' : an.faehigkeiten[0], an.name, KARTE_NEU && an.id === 'endo' ? L.endo.satzEndoKarte : an.satz, an.faehigkeiten, preise(an.einmalig, an.monat, an.hinweise.join(' · ')), function () {
        if (an.paket) A.endo = A.endo.filter(function (k) { return k === 'studio'; }).concat(drin ? [] : an.faehigkeiten);   /* ein Paket ersetzt das andere */
        else if (drin) A.endo = A.endo.filter(function (k) { return an.faehigkeiten.indexOf(k) < 0; });
        else an.faehigkeiten.forEach(function (k) { if (A.endo.indexOf(k) < 0) A.endo.push(k); });
        if (!A.endo.length) A.whatsapp = false;
        neuZeichnen('angebot-' + an.id);
      }), nr + 1));
    });
    w.inhalt.appendChild(c);
    /* Zusatz: WhatsApp-Kanal zu einem gewählten Angebot */
    var Wa = P.endo.whatsapp, wl = el('div', 'mf-eliste mf-eliste--zusatz'); wl.setAttribute('role', 'group'); wl.setAttribute('aria-label', L.endo.zusatz);
    wl.appendChild(el('p', 'mf-extras__titel', L.endo.zusatz));
    var wb = zeile('mf-ezeile--zusatz', A.whatsapp && A.endo.length > 0, 'whatsapp', 'whatsapp', Wa.name, A.endo.length ? Wa.satz : L.endo.whatsappAngebot, null, preise(Wa.einmalig, Wa.monat, Wa.hinweis), function () { if (A.endo.length) { A.whatsapp = !A.whatsapp; neuZeichnen('whatsapp'); } });
    if (!A.endo.length) { wb.disabled = true; wb.setAttribute('aria-disabled', 'true'); }
    wl.appendChild(reihe(wb, ids.length + 1)); w.inhalt.appendChild(wl);
    var m = P.endoPaket(A.endo, A.whatsapp);
    w.inhalt.appendChild(el('p', 'mf-stand', !m ? L.endo.leerAngebote : (m.guenstiger ? L.endo.guenstigerAngebote + ' ' : '') + m.name + (m.whatsapp ? ' + ' + Wa.name : '') + ': ' + P.euro(m.preis) + ' ' + L.endo.einmalig + ' + ' + P.euro(m.monat) + MONAT));
    w.inhalt.appendChild(el('p', 'mf-erklaer', P.endo.erklaer + ' Mindestlaufzeit ' + P.endo.laufzeit + ' Monate, ' + P.endo.grenze + '.'));
    var a = el('a', 'mf-link', L.endo.ansehen + ' ↗'); a.href = P.endoSeiteOeffentlich ? P.endoSeite : P.endoStart; a.target = '_blank'; a.rel = 'noopener';
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
    var liste = schritte(), nr = liste.indexOf(id) + 1, n = id === 'art' && !A.art ? 3 : liste.length, istAnfrage = id === 'anfrage';
    stand.textContent = 'Schritt ' + nr + ' von ' + n;
    linie.style.transform = 'scaleX(' + (nr / n) + ')';
    if (ORD) { oben.hidden = !A.art; angeboteMarkieren(); }   /* allgemeine Anfrage: kein „Schritt x von y“ */
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
    zurueck.hidden = id === 'art' || (ORD && liste[nr - 2] === 'art');
    weiter.hidden = id === 'art' || istAnfrage;
    weiter.textContent = liste[nr] === 'anfrage' ? 'Zur Anfrage' : 'Weiter';
    weiter.disabled = (id === 'website' && !A.stufe) || (id === 'endo' && !A.endo.length);
    hinweis.textContent = id === 'website' && !A.stufe ? 'Bitte wählen Sie eine Website.' : id === 'endo' && !A.endo.length ? (P.angeboteAn ? L.endo.leerAngebote : L.endo.leer) : '';
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
      if (ORD) {   /* weich zum Formular unter den Angeboten (Leiste oben bleibt frei) */
        var fz = (A.art ? oben : (istAnfrage ? anfrageBox : dyn)).getBoundingClientRect().top;
        if (fz < 60 || fz > window.innerHeight * 0.4) {
          if (window.__kristall && window.__kristall.zumKontakt) window.__kristall.zumKontakt();   /* misst ohne Einblend-Verschiebung */
          else window.scrollBy({ top: fz - 72, behavior: ruhig ? 'auto' : 'smooth' });
        }
      } else {
        var obenY = box.getBoundingClientRect().top;
        if (obenY < -40 || obenY > window.innerHeight * 0.5) box.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
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
  P.zeigeSchritt = function (id) { var l = schritte(), z = id || (l.length > 2 ? l[1] : 'art'); if (ORD && z === 'art') { zuAngeboten(); return; } gehe(z, -1); };
  function ausAnker() {
    if (location.hash === '#kontakt') { gehe('anfrage', 0); }
    else if (location.hash === '#preise' && aktiv === 'anfrage' && !A.art && !ORD) gehe('art', 0);
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

  zeigen(ORD ? 'anfrage' : 'art', 0, true);
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
