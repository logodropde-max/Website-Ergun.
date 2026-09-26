---
tags: [website, technik]
---
# Datei-Upload (Vercel Blob)

Gehört zum [[Kontaktformular]]. Grund: WhatsApp-Links können nur Text tragen, Fotos kamen nie an.

- Dateien gehen beim Auswählen an die Funktion `api/upload.js` und liegen bei [[Vercel]] Blob. Die Nachricht enthält einen Link pro Datei.
- Fotos über 3,5 MB verkleinert der Browser. Höchstens 4 MB pro Datei.
- Scheitert ein Upload, steht „bitte selbst anhängen" in der Liste.
- `api/aufraeumen.js` löscht Dateien nach 30 Tagen (täglicher Cron).
- **Noch offen:** Blob-Speicher in Vercel anlegen, Zugriff „Public", mit dem Projekt verbinden. Siehe [[To-dos]].
- Beschrieben in der Datenschutzerklärung Abschnitt 6, siehe [[Datenschutz und Recht]].

## Stand 26.09.2026
- Blob-Speicher **ergun-dateien** angelegt (Vercel → Storage, Region **Frankfurt fra1**, Zugriff **Public**, 1 GB frei), verbunden mit website-ergun (Production + Preview), Variable `BLOB_READ_WRITE_TOKEN`. Vorher gab es keinen Speicher – der Upload im Kontaktformular konnte deshalb nicht funktionieren.
- Ordner: `anfragen/` (Kontaktformular), `endo/fotos/` (Kundenfotos für endo), `endo/ergebnisse/` (Ergebnisse). Alles wird nach 30 Tagen vom täglichen Cron gelöscht (`api/aufraeumen.js`).
