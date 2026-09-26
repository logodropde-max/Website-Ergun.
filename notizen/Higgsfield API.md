---
tags: [endo-ai, dienst]
---
# Higgsfield API

Haupt-KI von [[endo-ai|endo.ai]]. Plattform: cloud.higgsfield.ai.

- Über 50 Modelle für Bilder und Videos (Soul, Seedream, Nano Banana, Ideogram, Kling, Seedance …). Keine fertigen Websites.
- Zugang über Key + Secret, zusammen als `HF_KEY` = `key:secret`. Nur in [[Vercel]] eintragen, nie in Chat oder Code.
- Bezahlt wird pro Ergebnis aus einem Dollar-Guthaben. Beispiel: 10 Sekunden Kling 3.0 etwa 1,12 $.
- Die Nutzungsbedingungen erlauben Anwendungen für eigene Endkunden (Abschnitt 11 lesen).
- Auch die Bilder der [[Startseite]] stammen aus Higgsfield.
- Ausführlich: [[KI-Studio mit Higgsfield]]

## Abo oder API – zwei getrennte Dinge (Stand 26.09.2026)
- **higgsfield.ai-Abo** (Ultra, Credits): das nutzt der **Higgsfield-Connector in Claude**. Alles, was Claude bisher erzeugt hat, lief darüber – nicht über die API.
- **API** (Pay-per-Use, Dollar-Guthaben): eigenes Konto, eigene Abrechnung. Laut Higgsfield-Hilfe „zwei getrennte Produkte mit getrennter Abrechnung“.
- **Schlüssel:** in der Konsole [console.higgsfield.ai](https://console.higgsfield.ai) erstellen, Format `ID:SECRET` (Secret wird nur einmal angezeigt). Adresse der API: `https://api.higgsfield.ai`, Anmeldung per `Authorization: Key ID:SECRET`.
- **Cashback:** Higgsfield hat 100 % Cashback auf API-Ausgaben angekündigt (nur API, nicht Abo). **Stand 26.09. gibt es ihn noch nicht, weil das Business nicht verifiziert ist** → erst in der Konsole das Business verifizieren, dann über die API erzeugen. Ablaufdatum der Aktion laut einer Zusammenfassung 30.09. (nicht offiziell bestätigt).
- Abo-Verbrauch 24.–26.09.: 571,5 Credits (GPT Image 128,25 · Kling 141,25 · Seedance 300 · Freistellen 2), keine Cashback-Buchung. Stand danach 1.135,63 Credits.

## Open-Higgsfield – eigenes Studio auf dem PC (eingerichtet 26.09.2026)
Oberfläche für die **API** (nicht das Abo): Bilder und Videos mit ~38 Modellen aus einem Eingabefeld, Verlauf bleibt im Browser.
- **Ordner:** `C:\Users\emrer\open-higgsfield` (von GitHub `wide-trace/open-higgsfield` – Drittanbieter, **nicht** von Higgsfield; Code geprüft: der Schlüssel geht nur an die API-Adresse aus der `.env`).
- **Starten:** PowerShell → `cd C:\Users\emrer\open-higgsfield; pnpm dev` → im Browser **http://localhost:3000**
- **API-Schlüssel:** in der App oben **„Add key“** → Feld „API key“ → `ID:SECRET` → „Save key“ (bleibt 30 Tage als Cookie in diesem Browser). Nicht in die `.env`.
- **`.env`** (im Ordner, nie online): `HF_API_BASE_URL=https://api.higgsfield.ai` (fertig eingetragen) · `OPEN_HIGGSFIELD_READ_WRITE_TOKEN=` optional, nur für Datei-Uploads (Startbild, Referenzen): Vercel-Blob-Token aus [vercel.com/dashboard/stores](https://vercel.com/dashboard/stores); hochgeladene Dateien werden öffentlich.
- Technik: Next.js 16, React 19, pnpm 10 (für Emres Benutzer installiert), Node 24. Preise zeigt die App nicht – vorher in der Konsole nachsehen.
