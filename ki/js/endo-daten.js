/* endo.ai: Preise und Werkzeuge an EINER Stelle (endo.ai-Seite, Chat auf /ki/ und auf der Startseite, Credit-Fenster lesen von hier).
   Preise von Emre (25.09.2026), Rechnung mit mindestens 35 % Gewinn: siehe Vault „Credit-Pakete.md“. */
window.ENDO = {
  pakete: [
    { name: 'Start', preis: 5, credits: 40, kann: ['foto', 'video', 'web'] },
    { name: 'Pro', preis: 20, credits: 200, kann: ['foto', 'video', 'web'] },
    { name: 'Premium', preis: 100, credits: 1000, kann: ['foto', 'video', 'web', 'video10', '3d', 'parallax'] }
  ],
  funktionen: [
    { id: 'foto', name: 'Produktfotos', kurz: 'Ihr Produkt in Szene, auf Wunsch als Shop-Bild', text: 'Aus Ihrem Handyfoto wird ein Profi-Produktfoto: Studiolicht, neue Bühne, echte Schatten. Auf Wunsch zusätzlich freigestellt und in 4K als Shop-Bild.', credits: 5, extra: 'Shop-Bild (freigestellt + 4K): 5 Credits' },
    { id: 'video', name: 'Werbevideo 5 s', kurz: 'Kurzer Clip aus Ihrem Produktfoto', text: 'Aus Ihrem Produktfoto wird ein Clip mit fünf Sekunden Bewegung, für Reels, Stories und Anzeigen.', credits: 20 },
    { id: 'web', name: 'Website-Bilder', kurz: 'Titelbild für Ihre eigene Website', text: 'Ein großes Titelbild für Ihre Website, passend zu Ihrer Marke und Ihrem Produkt.', credits: 10 }
  ],
  premium: [
    { id: 'video10', name: 'Werbevideo 10 s', text: 'Längere Clips mit mehr Bewegung.', credits: 40 },
    { id: '3d', name: '3D-Produkt', text: 'Aus einem Foto entsteht ein 3D-Modell mit Textur, das man auf Ihrer Website drehen kann.', credits: 50 },
    { id: 'parallax', name: 'Parallax-Szene', text: 'Eine komplette Szene in Ebenen, die sich beim Scrollen bewegt.', credits: 30 },
    { id: 'emre', name: 'Persönliche Abstimmung', text: 'Look und Wünsche stimmen Sie direkt mit Emre ab.' }
  ]
};
