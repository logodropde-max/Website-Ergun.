/* endo Studio (früher endo.ai, kurz endo Studio): Preise, Funktionen und Kauf-Links an EINER Stelle.
   Lesen von hier: die Studio-Seite (/ki/), der Chat mit endo (Startseite und /ki/) und das Credit-Fenster.
   Preise von Emre (25.09.2026), Rechnung mit mindestens 35 % Gewinn: siehe Vault „Credit-Pakete.md“.
   26.09.2026 (Emre): Monatlich oder Jahresabo (−20 %), gleiche Credits pro Monat.
   26.09.2026 spät (Emre): zusätzlich EINMALIG kaufbar – gleiche Credits, einmal bezahlt, kein Abo, Credits 12 Monate gültig
   (einmal.preis ≈ Monatspreis + 20 %, Gewinn im schlechtesten Fall 59–65 %, Rechnung in „Credit-Pakete.md“).
   preis = Monatspreis im Monatsabo · jahr.monat = Monatspreis im Jahresabo · jahr.gesamt = jährlich abgerechnet.
   kaufen = Lemon-Squeezy-Link Monatsabo, kaufenJahr = Link Jahresabo, kaufenEinmal = Link Einmalkauf. Leer = Knopf heißt „… vormerken“.
   26.09.2026 (Emre, Phase C „alles wie empfohlen“): Credits = echte API-Kosten mit mind. 35 % Gewinn. Die Server-Wahrheit
   steht in api/_lib/endo/werkzeuge.js – ein Test prüft, dass die Zahlen hier gleich sind.
   27.09.2026 (Emre „ok“ zum Angebots-Plan): 12 Werkzeuge in 6 Kategorien, Pro bekommt eigene Werkzeuge.
   paket = ab welchem Paket, kategorie = Gruppe im Chat (kategorien unten, Zeichen als eigene Linien-Icons). */
window.ENDO = {
  marke: 'endo Studio',
  abrechnung: { standard: 'monat', rabattJahr: 20, einmalGueltigMonate: 12 },
  /* Premium inklusive Website von Emre (Emre, 27.09.). Bedingungen freigegeben: Emre „ok“, Rabatt und Korrekturrunden
     auf seinen Wunsch („mach du es passend und schlau“) von Claude gewählt – 20 % wie beim Jahresabo, 2 Korrekturrunden.
     Leere Zahlen (null) erscheinen auf der Seite nicht. */
  premiumWebsite: {
    bestaetigt: true,
    titel: 'Inklusive Ihrer Website von Emre',
    jahr: 'im Jahresabo inklusive',                              // Premium jährlich
    monat: 'inklusive bei 12 Monaten Mindestlaufzeit',          // Premium monatlich
    einmalTitel: 'Rabatt auf Ihre Website von Emre',            // Premium einmalig …
    einmal: 'keine Website inklusive',                          // … statt Website ein Rabatt
    abschnitte: null,        // Emre, 27.09.: Seitenzahl bleibt wie jetzt – ein Onepager, keine feste Abschnitts-Zahl
    korrekturrunden: 2,
    rabattEinmalProzent: 20,   // Premium einmalig: 20 % Rabatt auf eine Website (gleich wie der Jahresrabatt)
    umfang: ['Onepager aus einer ERGUN.-Vorlage', 'Ihre eigenen Bilder und Videos, erstellt mit endo Studio'],
    groesser: 'Größere Seiten oder ein Onlineshop: im kostenlosen Erstgespräch'
  },
  pakete: [
    { name: 'Start', preis: 5, jahr: { monat: 3.99, gesamt: 47.88 }, einmal: 6, credits: 40, kann: ['foto', 'shop', 'anzeige', 'formate', 'aufwerten', 'video', 'web'], kaufen: '', kaufenJahr: '', kaufenEinmal: '' },
    { name: 'Pro', preis: 20, jahr: { monat: 16, gesamt: 192 }, einmal: 24, credits: 200, kann: ['foto', 'shop', 'anzeige', 'formate', 'aufwerten', 'video', 'web', 'lifestyle', 'plakat', 'logo'], kaufen: '', kaufenJahr: '', kaufenEinmal: '' },
    { name: 'Premium', preis: 100, jahr: { monat: 80, gesamt: 960 }, einmal: 120, credits: 1000, kann: ['foto', 'shop', 'anzeige', 'formate', 'aufwerten', 'video', 'web', 'lifestyle', 'plakat', 'logo', 'video10', 'video4k', '3d', 'parallax', 'emre'], kaufen: '', kaufenJahr: '', kaufenEinmal: '' }
  ],
  /* Sechs Kategorien für die Angebotswahl im Chat: Kategorie → Werkzeug → Look → Bestätigung */
  kategorien: [
    { id: 'fotos', name: 'Produktfotos', text: 'Ihr Produkt neu in Szene gesetzt' },
    { id: 'werbung', name: 'Werbung & Social', text: 'Anzeigen, Plakate, alle Formate' },
    { id: 'videos', name: 'Videos', text: 'Bewegung aus einem Foto' },
    { id: 'verbessern', name: 'Foto verbessern', text: 'Ihr Foto, nur sauberer' },
    { id: 'marke', name: 'Website & Marke', text: 'Titelbild und Logo-Idee' },
    { id: 'premium', name: 'Premium', text: 'Persönlich von Emre umgesetzt' }
  ],
  funktionen: [
    { id: 'foto', beispiel: '/bilder/endo/foto.webp', kategorie: 'fotos', paket: 'start', name: 'Produktfoto', mehrzahl: 'Produktfotos', kurz: 'Ihr Produkt im Studiolicht, auf neuer Bühne', text: 'Aus Ihrem Handyfoto wird ein Profi-Produktfoto: Studiolicht, neue Bühne, echte Schatten.', bekommen: 'Ein Bild in 2K, Format nach Wahl', credits: 12 },
    { id: 'shop', beispiel: '/bilder/endo/shop.webp', kategorie: 'fotos', paket: 'start', name: 'Shop- & Marktplatz-Bild', mehrzahl: 'Shop-Bilder', kurz: 'Auf reinem Weiß, für jeden Shop', text: 'Ihr Produkt auf reinem Weiß mit weichem Schatten – passend für Ihren Shop und Marktplätze.', bekommen: 'Ein Bild in 2K auf reinem Weiß', credits: 5 },
    { id: 'lifestyle', kategorie: 'fotos', paket: 'pro', name: 'Lifestyle mit Person', mehrzahl: 'Lifestyle-Bilder', kurz: 'Ihr Produkt in Benutzung', text: 'Ihr Produkt im Alltag, in der Hand oder in Benutzung – mit einer Person, die es so nicht gibt.', bekommen: 'Ein Bild in 2K, Format nach Wahl', credits: 14 },
    { id: 'anzeige', beispiel: '/bilder/endo/anzeige.webp', kategorie: 'werbung', paket: 'start', name: 'Werbeanzeige', mehrzahl: 'Werbeanzeigen', kurz: 'Fertig gestaltet, mit Ihrer Überschrift', text: 'Ihr Produkt als fertig gestaltete Anzeige nach einer Vorlage Ihrer Wahl, mit deutscher Überschrift.', bekommen: 'Eine fertige Anzeige in 2K', credits: 10 },
    { id: 'plakat', kategorie: 'werbung', paket: 'pro', name: 'Aktions-Plakat', mehrzahl: 'Aktions-Plakate', kurz: 'Plakat mit Ihrer Überschrift', text: 'Ein Plakat oder Aushang mit Ihrem Produkt und einer kurzen Überschrift, auch mit Ihrer Aktion.', bekommen: 'Ein Plakat, Überschrift bis 40 Zeichen', credits: 6 },
    { id: 'formate', kategorie: 'werbung', paket: 'start', name: 'Formate-Set', mehrzahl: 'Formate', kurz: 'Ein Bild für Feed, Story und Reel', text: 'Eines Ihrer fertigen Bilder zusätzlich im Quadrat, hoch und als Story – ohne dass sich das Produkt verändert.', bekommen: 'Bis zu drei Formate, 3 Credits je Format', credits: 3 },
    { id: 'video', beispiel: '/bilder/endo/video.webp', kategorie: 'videos', paket: 'start', name: 'Werbevideo 5 s', mehrzahl: 'Werbevideos mit 5 s', kurz: 'Kurzer Clip aus Ihrem Produktfoto', text: 'Aus Ihrem Produktfoto wird ein Clip mit fünf Sekunden Bewegung, für Reels, Stories und Anzeigen.', bekommen: 'Ein Video mit 5 Sekunden, ohne Ton', credits: 20 },
    { id: 'aufwerten', kategorie: 'verbessern', paket: 'start', name: 'Foto aufwerten', mehrzahl: 'aufgewertete Fotos', kurz: 'Heller, sauberer, farbtreu', text: 'Ihr Foto bleibt, wie es ist – nur heller, sauberer und farbtreuer, kleine Störungen verschwinden.', bekommen: 'Ihr Foto in 2K, gleiches Format', credits: 4 },
    { id: 'web', beispiel: '/bilder/endo/web.webp', kategorie: 'marke', paket: 'start', name: 'Website-Titelbild', mehrzahl: 'Website-Titelbilder', kurz: 'Großes Bild für Ihre eigene Website', text: 'Ein großes Titelbild in 4K für Ihre Website, mit Platz für Ihre Überschrift.', bekommen: 'Ein breites Bild in 4K', credits: 12 },
    { id: 'logo', kategorie: 'marke', paket: 'pro', name: 'Logo-Entwurf', mehrzahl: 'Logo-Entwürfe', kurz: 'Eine erste Idee für Ihr Logo', text: 'Eine erste Logo-Idee mit Ihrem Namen. Den Feinschliff und die fertigen Dateien macht Emre auf Wunsch.', bekommen: 'Ein Entwurf als Bild, kein fertiges Logo', credits: 8 }
  ],
  premium: [
    { id: 'video10', beispiel: '/bilder/endo/video10.webp', kategorie: 'videos', paket: 'premium', name: 'Werbevideo 10 s', mehrzahl: 'Werbevideos mit 10 s', kurz: 'Längere Clips mit mehr Bewegung', text: 'Längere Clips mit mehr Bewegung.', bekommen: 'Ein Video mit 10 Sekunden, ohne Ton', credits: 40 },
    { id: 'video4k', kategorie: 'videos', paket: 'premium', name: 'Website-Video 4K', mehrzahl: 'Website-Videos in 4K', kurz: 'Ruhiger Clip für Ihren Website-Kopf', text: 'Ein ruhiger Clip in 4K, gemacht als bewegter Hintergrund für den Kopf Ihrer Website.', bekommen: 'Ein Video mit 5 Sekunden in 4K', credits: 60 },
    { id: '3d', kategorie: 'premium', paket: 'premium', name: '3D-Produkt', mehrzahl: '3D-Produkte', kurz: 'Auf Anfrage, persönlich umgesetzt', text: 'Ein drehbares 3D-Modell Ihres Produkts – auf Anfrage, Emre setzt es persönlich um.' },
    { id: 'parallax', kategorie: 'premium', paket: 'premium', name: 'Parallax-Szene', mehrzahl: 'Parallax-Szenen', kurz: 'Auf Anfrage, persönlich umgesetzt', text: 'Eine Szene in Ebenen, die sich beim Scrollen bewegt – auf Anfrage, Emre setzt sie persönlich um.' },
    { id: 'emre', kategorie: 'premium', paket: 'premium', name: 'Abstimmung mit Emre', kurz: 'Look und Wünsche persönlich besprechen', text: 'Look und Wünsche stimmen Sie direkt mit Emre ab.' }
  ]
};
