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
- **Cashback:** Higgsfield hat 100 % Cashback auf API-Ausgaben angekündigt (nur API, nicht Abo). ~~Stand 26.09. früh: erst mit verifiziertem Business~~ – **überholt:** seit 26.09. nachmittags bis 1.000 $ ohne Verifizierung aktiv, Frist 30.09. 23:59 UTC (siehe unten). Business-Verifizierung liegt im Konto logodropde, Ticket #286620.
- Abo-Verbrauch 24.–26.09.: 571,5 Credits (GPT Image 128,25 · Kling 141,25 · Seedance 300 · Freistellen 2), keine Cashback-Buchung. Stand danach 1.135,63 Credits.

## Open-Higgsfield – eigenes Studio auf dem PC (eingerichtet 26.09.2026)
Oberfläche für die **API** (nicht das Abo): Bilder und Videos mit ~38 Modellen aus einem Eingabefeld, Verlauf bleibt im Browser.
- **Ordner:** `C:\Users\emrer\open-higgsfield` (von GitHub `wide-trace/open-higgsfield` – Drittanbieter, **nicht** von Higgsfield; Code geprüft: der Schlüssel geht nur an die API-Adresse aus der `.env`).
- **Starten:** Doppelklick auf **„Higgsfield Studio.cmd“ auf dem Desktop** (startet den Server, falls nötig, und öffnet http://localhost:3000; das kleine Server-Fenster offen lassen). Von Hand: PowerShell → `cd C:\Users\emrer\open-higgsfield; pnpm dev`.
- **Cashback-Stand 26.09. 16:30 (API-Konto ergun.emre2003@gmail.com, „Personal“):** Higgsfield hat die Regeln geändert – **bis 1.000 $ Cashback ohne Verifizierung**, mit verifiziertem Business bis 200.000 $. **Funktioniert:** Test-Bild 0,06 $ → 0,06 $ Cashback zurück (eigenes „Cashback wallet“, oben wird nur das Hauptguthaben angezeigt). Die 12,50 $ vom 25./26.09. (vor der Änderung) wurden nicht erstattet. Hauptguthaben danach 7,44 $. Frist **30.09. 23:59 UTC** (= 01.10. 01:59 Uhr).
- Cashback zahlt zuerst, wenn es eine Generierung komplett abdeckt – dann zum Standardpreis ohne Modell-Rabatt.
- Organisation „Ergun.“ ist angelegt, aber nicht aktiv – im **Personal-Konto** bleiben (dort liegen Guthaben + Karte).
- **Emre (26.09.): nur noch dort generieren, wo es Cashback gibt** = dieses Studio (localhost:3000, API-Schlüssel aus dem Konto ergun.emre) oder der Playground auf open.higgsfield.ai. Nicht über den Higgsfield-Connector in Claude (Ultra-Abo, kein Cashback).
- Claude (Chat) kann über den Browser der Claude-App auf Emres PC Billing/Cashback ansehen und im Studio Prompts vorbereiten; Hochladen + „Generate“ macht Emre.
- **API-Schlüssel:** in der App oben **„Add key“** → Feld „API key“ → `ID:SECRET` → „Save key“ (bleibt 30 Tage als Cookie in diesem Browser). Nicht in die `.env`.
- **`.env`** (im Ordner, nie online): `HF_API_BASE_URL=https://api.higgsfield.ai` (fertig eingetragen) · `OPEN_HIGGSFIELD_READ_WRITE_TOKEN=` optional, nur für Datei-Uploads (Startbild, Referenzen): Vercel-Blob-Token aus [vercel.com/dashboard/stores](https://vercel.com/dashboard/stores); hochgeladene Dateien werden öffentlich.
- Technik: Next.js 16, React 19, pnpm 10 (für Emres Benutzer installiert), Node 24. Preise zeigt die App nicht – vorher in der Konsole nachsehen.

## Claude Code: Bilder/Videos per Befehl (eingerichtet 26.09.2026, Projekt 2)
> **Nur über die API mit Cashback** (Konto ergun.emre2003@gmail.com). Nicht über den Higgsfield-Connector in Claude und nicht über die `higgsfield`-CLI – beide buchen vom Abo.

- **Ordner:** `_code/werkzeuge/higgsfield-api/` – eigenes `package.json`, darin das **offizielle SDK** `@higgsfield/client` (Version 0.2.6, MIT, spricht nur mit `api.higgsfield.ai`; liegt in `node_modules/`, wird nicht mit Git gesichert). Neu installieren: im Ordner `npm install`.
- **Skript:** `hf.mjs` – fragt zuerst den Preis ab (`/estimate`), erzeugt nur mit `--ok`, bricht über `--max` (Standard 1,00 $) ab, lädt das Ergebnis nach `05 Higgsfield-Assets/Bilder/` und trägt es oben in [[Higgsfield-Galerie]] ein. Fehlgeschlagene/abgelehnte Aufträge kosten nichts.
- **Regel für Claude:** vor jeder Generierung Modell, Prompt und Preis in $ nennen und auf Emres OK warten. Prompt-Wissen und Modellwahl: Skill `higgsfield-api-prompts` ([[Skills-Übersicht]]).

### Schlüssel eintragen (macht nur Emre)
1. Im Explorer öffnen: `C:\Users\emrer\Documents\WebDesign\_code\werkzeuge\higgsfield-api\.env.local` (Rechtsklick → „Öffnen mit“ → Editor). Die Datei ist schon da.
2. In der Zeile `HF_CREDENTIALS=` direkt hinter das `=` den Schlüssel einfügen, z. B. `HF_CREDENTIALS=abc123:xyz789` – ohne Leerzeichen, ohne Anführungszeichen. Speichern (Strg+S).
3. Die Datei steht in der `.gitignore` von Vault und Website-Repo (mit `git check-ignore` geprüft) – sie landet nie auf GitHub. Claude liest und zeigt sie nicht.
4. Prüfen (kostet nichts): `node hf.mjs test` im Ordner → „Schlüssel ist eingetragen …“.
- **Später für die Website (Phase C):** derselbe Schlüssel in [[Vercel]] → Projekt `website-ergun` → Settings → Environment Variables → Name `HF_KEY`, Wert `ID:SECRET` → Save → neu veröffentlichen. Nie in Dateien, Git oder Obsidian.

- **Stand 26.09., 17:37:** Schlüssel eingetragen, erster Test erfolgreich – Z-Image Turbo 1k, Preis laut API 0,015 $ (0,24 API-Credits), Bild `api_f13c7922_api-test-tasse` in der [[Higgsfield-Galerie]]. Cashback-Prüfung durch Emre steht aus.

### Befehle (PowerShell im Ordner `_code\werkzeuge\higgsfield-api`)
```
node hf.mjs test
node hf.mjs preis z-image/turbo --prompt "ceramic mug on oak table, soft window light" --set resolution=1k
node hf.mjs erzeugen z-image/turbo --prompt "…" --set resolution=1k --name tasse --zweck "Produktfoto Test" --max 0.05 --ok
node hf.mjs erzeugen kling-video/v3.0/std/text-to-video --prompt "…" --set duration=5 --set sound=off --name test-video --zweck "API-Test Video" --max 0.30 --ok
node hf.mjs erzeugen kling-video/v3.0/std/image-to-video --bild C:\pfad\foto.jpg --prompt "slow push-in" --set duration=5 --name … --ok
node hf.mjs status <request_id> --name … --zweck …
```
- **Marketing Studio Image** (`marketing-studio/image`, für endo: Produktfoto → Werbebild): `node hf.mjs presets` listet die aktuellen Vorlagen (kostenlos). Mit Vorlage: `--bild produkt.jpg --bild-feld image_urls --set preset_id=<ID> --set enhance_prompt=true` (optional zweites `--bild` als Model-Referenz; 10 % teurer). Ohne Vorlage: nur Prompt oder Bilder zum Bearbeiten. Kein öffentlicher Preis → vorher `preis`. Doku: https://dash.higgsfield.ai/models/marketing-studio/image/llms.txt
- Ohne `--ok` zeigt `erzeugen` nur Modell, Eingabe und Preis. `--bild` lädt eine lokale Datei zu Higgsfield hoch (öffentlich erreichbar, mind. 7 Tage).
- **Preise laut Modellseite (open.higgsfield.ai, 26.09.):** Z-Image Turbo 0,015 $/Bild · Kling 3.0 Standard 0,0462 $/s (45 % Rabatt bis 01.10., danach 0,084 $/s) → 5 s ≈ 0,23 $ · Kling 3.0 Turbo 720p 0,0616 $/s (danach 0,112 $/s). Endpunkte und Felder je Modell: https://docs.higgsfield.ai.
