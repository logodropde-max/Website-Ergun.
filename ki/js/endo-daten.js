/* ERGUN. Studio (früher endo.ai): Preise, Funktionen und Kauf-Links an EINER Stelle.
   Lesen von hier: die Studio-Seite (/ki/), der Chat mit endo (Startseite und /ki/) und das Credit-Fenster.
   Preise von Emre (25.09.2026), Rechnung mit mindestens 35 % Gewinn: siehe Vault „Credit-Pakete.md“.
   kaufen: Checkout-Link von Lemon Squeezy je Paket. Leer = Knopf heißt „Vormerken“ (Kauf startet in Kürze). */
window.ENDO = {
  marke: 'ERGUN. Studio',
  pakete: [
    { name: 'Start', preis: 5, credits: 40, kann: ['foto', 'shop', 'video', 'web'], kaufen: '' },
    { name: 'Pro', preis: 20, credits: 200, kann: ['foto', 'shop', 'video', 'web'], kaufen: '' },
    { name: 'Premium', preis: 100, credits: 1000, kann: ['foto', 'shop', 'video', 'web', 'video10', '3d', 'parallax', 'emre'], kaufen: '' }
  ],
  funktionen: [
    { id: 'foto', name: 'Produktfoto', kurz: 'Ihr Produkt im Studiolicht, auf neuer Bühne', text: 'Aus Ihrem Handyfoto wird ein Profi-Produktfoto: Studiolicht, neue Bühne, echte Schatten.', credits: 5 },
    { id: 'shop', name: 'Shop-Bild', kurz: 'Freigestellt und in 4K, für jeden Shop', text: 'Ihr Produkt sauber freigestellt und auf 4K vergrößert, bereit für Shop und Marktplatz.', credits: 5 },
    { id: 'video', name: 'Werbevideo 5 s', kurz: 'Kurzer Clip aus Ihrem Produktfoto', text: 'Aus Ihrem Produktfoto wird ein Clip mit fünf Sekunden Bewegung, für Reels, Stories und Anzeigen.', credits: 20 },
    { id: 'web', name: 'Website-Titelbild', kurz: 'Großes Bild für Ihre eigene Website', text: 'Ein großes Titelbild für Ihre Website, passend zu Ihrer Marke und Ihrem Produkt.', credits: 10 }
  ],
  premium: [
    { id: 'video10', name: 'Werbevideo 10 s', kurz: 'Längere Clips mit mehr Bewegung', text: 'Längere Clips mit mehr Bewegung.', credits: 40 },
    { id: '3d', name: '3D-Produkt', kurz: 'Drehbar auf Ihrer Website', text: 'Aus einem Foto entsteht ein 3D-Modell mit Textur, das man auf Ihrer Website drehen kann.', credits: 50 },
    { id: 'parallax', name: 'Parallax-Szene', kurz: 'Szene in Ebenen, bewegt beim Scrollen', text: 'Eine komplette Szene in Ebenen, die sich beim Scrollen bewegt.', credits: 30 },
    { id: 'emre', name: 'Abstimmung mit Emre', kurz: 'Look und Wünsche persönlich besprechen', text: 'Look und Wünsche stimmen Sie direkt mit Emre ab.' }
  ]
};
