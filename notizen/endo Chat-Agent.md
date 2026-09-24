---
tags: [endo-ai, technik]
---
# endo Chat-Agent

Der Assistent „endo" steht auf [[endo-ai|endo.ai]] ganz oben im Vordergrund. Er begrüßt Besucher, beantwortet Fragen und lädt dazu ein, ein Produktfoto zu machen.

## Ablauf im Chat
1. endo fragt, was verkauft wird (Mode, Kosmetik, Elektronik, Essen und Getränke, Möbel und Deko, Anderes) und zeigt das Tassen-Beispiel.
2. Look wählen oder selbst beschreiben.
3. Format wählen: Shopfoto 2 Credits, Instagram-Anzeige 4, Story oder Reel 4, Werbevideo und 3D-Modell (Premium).
4. Foto hochladen (landet über den [[Datei-Upload (Vercel Blob)]] als Link).
5. E-Mail angeben, dann per WhatsApp oder E-Mail an Emre schicken. Die Nachricht enthält Kategorie, Look, Format, Foto-Link und E-Mail.
6. Freie Fragen beantwortet endo jederzeit.

## Technik
- Seite: `ki/js/agent.js` (Chat-Ablauf), Funktion: `api/agent.js` auf [[Vercel]].
- Freie Fragen gehen an die Claude-API von Anthropic (Modell Claude Opus 5, kurze Antworten, 1 bis 3 Sätze auf Deutsch, per Sie).
- Braucht `ANTHROPIC_API_KEY` in Vercel. **Ohne Schlüssel** antwortet endo mit eingebauten Antworten zu Preisen, Credits, Videos, Datenschutz usw., der Chat funktioniert also trotzdem.
- Schutz: nur Anfragen von der eigenen Seite, höchstens 12 Nachrichten mit je 600 Zeichen.
- endo kennt die Fakten aus [[Credit-Pakete]] und erfindet nichts dazu. Er behauptet nie, selbst ein Bild erzeugt zu haben, solange die echte Erzeugung über die [[Higgsfield API]] noch fehlt.

Offen: [[To-dos]]
