---
tags: [endo-ai, technik]
---
# endo Chat-Agent

Der Assistent „endo" steht auf [[endo-ai|endo.ai]] ganz oben im Vordergrund. Er begrüßt Besucher, beantwortet Fragen und lädt dazu ein, ein Produktfoto zu machen.

## Ablauf im Chat
1. endo fragt, was verkauft wird (Mode, Kosmetik, Elektronik, Essen und Getränke, Möbel und Deko, Anderes) und zeigt das Tassen-Beispiel.
2. Look wählen oder selbst beschreiben.
3. Werkzeug wählen: Produkt in Szene 3 Credits, Freistellen + 4K 3, Werbevideo 5 s 8, Werbevideo 10 s 15 (Premium).
4. Foto hochladen (landet über den [[Datei-Upload (Vercel Blob)]] als Link).
5. E-Mail angeben, dann per WhatsApp oder E-Mail an Emre schicken. Die Nachricht enthält Kategorie, Look, Format, Foto-Link und E-Mail.
6. Freie Fragen beantwortet endo jederzeit.

## Aussehen (Stand 25.09. nachts)
- Kein Kasten mehr: ruhend nur eine feine Zeile mit Linie, mittig unter der Überschrift. Das Gespräch beginnt beim Antippen.
- Nachrichten schweben direkt über dem Hintergrund (weicher Schatten statt Blasen), höchstens drei sind zu sehen, ältere verblassen nach oben. Die Überschrift weicht aus, die Kugel wird dunkler.
- Handy: die Zeile steht unten über der Tastatur, sonst gleich. „Bewegung reduzieren“: nur Einblenden.
- Werkzeuge im Chat kommen aus `window.ENDO` (3 Werkzeuge + Video 10 s Premium), mit Credits.

## Technik
- Seite: `ki/js/agent.js` (Chat-Ablauf), Funktion: `api/agent.js` auf [[Vercel]].
- Freie Fragen gehen an die Claude-API von Anthropic (Modell Claude Opus 5, kurze Antworten, 1 bis 3 Sätze auf Deutsch, per Sie).
- Braucht `ANTHROPIC_API_KEY` in Vercel. **Ohne Schlüssel** antwortet endo mit eingebauten Antworten zu Preisen, Credits, Videos, Datenschutz usw., der Chat funktioniert also trotzdem.
- Schutz: nur Anfragen von der eigenen Seite, höchstens 12 Nachrichten mit je 600 Zeichen.
- endo kennt die Fakten aus [[Credit-Pakete]] und erfindet nichts dazu. Er behauptet nie, selbst ein Bild erzeugt zu haben, solange die echte Erzeugung über die [[Higgsfield API]] noch fehlt.

Offen: [[To-dos]]
