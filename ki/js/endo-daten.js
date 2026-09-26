/* endo Studio (früher endo.ai, kurz endo Studio): Preise, Funktionen und Kauf-Links an EINER Stelle.
   Lesen von hier: die Studio-Seite (/ki/), der Chat mit endo (Startseite und /ki/) und das Credit-Fenster.
   Preise von Emre (25.09.2026), Rechnung mit mindestens 35 % Gewinn: siehe Vault „Credit-Pakete.md“.
   26.09.2026 (Emre): Monatlich oder Jahresabo (−20 %), gleiche Credits pro Monat.
   preis = Monatspreis im Monatsabo · jahr.monat = Monatspreis im Jahresabo · jahr.gesamt = jährlich abgerechnet.
   kaufen = Lemon-Squeezy-Link Monatsabo, kaufenJahr = Link Jahresabo. Leer = Knopf heißt „… vormerken“.
   26.09.2026 (Emre, Phase C „alles wie empfohlen“): Credits = echte API-Kosten mit mind. 35 % Gewinn. Die Server-Wahrheit
   steht in api/_lib/endo/werkzeuge.js – ein Test prüft, dass die Zahlen hier gleich sind. */
window.ENDO = {
  marke: 'endo Studio',
  abrechnung: { standard: 'monat', rabattJahr: 20 },
  pakete: [
    { name: 'Start', preis: 5, jahr: { monat: 3.99, gesamt: 47.88 }, credits: 40, kann: ['foto', 'anzeige', 'shop', 'video', 'web'], kaufen: '', kaufenJahr: '' },
    { name: 'Pro', preis: 20, jahr: { monat: 16, gesamt: 192 }, credits: 200, kann: ['foto', 'anzeige', 'shop', 'video', 'web'], kaufen: '', kaufenJahr: '' },
    { name: 'Premium', preis: 100, jahr: { monat: 80, gesamt: 960 }, credits: 1000, kann: ['foto', 'anzeige', 'shop', 'video', 'web', 'video10', '3d', 'parallax', 'emre'], kaufen: '', kaufenJahr: '' }
  ],
  funktionen: [
    { id: 'foto', name: 'Produktfoto', mehrzahl: 'Produktfotos', kurz: 'Ihr Produkt im Studiolicht, auf neuer Bühne', text: 'Aus Ihrem Handyfoto wird ein Profi-Produktfoto: Studiolicht, neue Bühne, echte Schatten.', credits: 12 },
    { id: 'anzeige', name: 'Werbeanzeige', mehrzahl: 'Werbeanzeigen', kurz: 'Fertig gestaltet, mit Ihrer Überschrift', text: 'Ihr Produkt als fertig gestaltete Anzeige nach einer Vorlage Ihrer Wahl, mit deutscher Überschrift.', credits: 10 },
    { id: 'shop', name: 'Shop-Bild', mehrzahl: 'Shop-Bilder', kurz: 'Auf reinem Weiß, für jeden Shop', text: 'Ihr Produkt auf reinem Weiß mit weichem Schatten, hochauflösend und bereit für Shop und Marktplatz.', credits: 5 },
    { id: 'video', name: 'Werbevideo 5 s', mehrzahl: 'Werbevideos mit 5 s', kurz: 'Kurzer Clip aus Ihrem Produktfoto', text: 'Aus Ihrem Produktfoto wird ein Clip mit fünf Sekunden Bewegung, für Reels, Stories und Anzeigen.', credits: 20 },
    { id: 'web', name: 'Website-Titelbild', mehrzahl: 'Website-Titelbilder', kurz: 'Großes Bild für Ihre eigene Website', text: 'Ein großes Titelbild in 4K für Ihre Website, mit Platz für Ihre Überschrift.', credits: 12 }
  ],
  premium: [
    { id: 'video10', name: 'Werbevideo 10 s', mehrzahl: 'Werbevideos mit 10 s', kurz: 'Längere Clips mit mehr Bewegung', text: 'Längere Clips mit mehr Bewegung.', credits: 40 },
    { id: '3d', name: '3D-Produkt', mehrzahl: '3D-Produkte', kurz: 'Auf Anfrage, persönlich umgesetzt', text: 'Ein drehbares 3D-Modell Ihres Produkts – auf Anfrage, Emre setzt es persönlich um.' },
    { id: 'parallax', name: 'Parallax-Szene', mehrzahl: 'Parallax-Szenen', kurz: 'Auf Anfrage, persönlich umgesetzt', text: 'Eine Szene in Ebenen, die sich beim Scrollen bewegt – auf Anfrage, Emre setzt sie persönlich um.' },
    { id: 'emre', name: 'Abstimmung mit Emre', kurz: 'Look und Wünsche persönlich besprechen', text: 'Look und Wünsche stimmen Sie direkt mit Emre ab.' }
  ]
};
