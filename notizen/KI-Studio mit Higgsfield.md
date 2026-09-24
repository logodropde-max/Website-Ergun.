---
tags: [endo-ai]
---
# KI-Studio mit Higgsfield (zweites Einkommen)

Gehört zu [[endo-ai|endo.ai]] und [[ERGUN Website (Übersicht)]]. Verwandt: [[Higgsfield API]] · [[Credit-Pakete]] · [[Lemon Squeezy]] · [[Supabase]] · [[Vercel]] · [[To-dos]]

Stand: 24.09.2026 abends · gepflegt von Claude Code · liegt im Repo unter `notizen/`, kommt per `git pull` in Obsidian

## Entscheidungen (Emre, 24.09.)
- **Wo:** Unterseite der Website, z. B. `/ki`, mit Link von der Startseite.
- **Haupt-KI:** Higgsfield (alles, was Higgsfield kann).
- **Bezahlung:** Lemon Squeezy (übernimmt EU-Umsatzsteuer, Rechnungen, Widerruf).
- **Login:** E-Mail-Link ohne Passwort.
- **Preise:** Vorschlag von Claude (siehe unten), später änderbar.
- **Obsidian:** Claude pflegt Notizen in diesem Ordner. Änderungen an der Website gehen immer direkt live (main → Vercel).
- **Name:** endo.ai (Emre, 24.09. abends).
- **Richtung:** starkes Marketing, E-Commerce, futuristisch und innovativ.
- **Premium-Paket** zusätzlich zu Start, Pro und Studio.
- **Offen:** Konten anlegen (Lemon Squeezy, Supabase), Backend bauen.

## Die Higgsfield-API, einfach erklärt
- **Was sie ist:** Eine Schnittstelle, über die ein Programm (unsere Website) Higgsfield Aufträge geben kann, ohne dass jemand die Higgsfield-App öffnet. Zugriff auf über 50 Bild- und Video-Modelle (u. a. Higgsfield Soul, Seedream, Nano Banana, Ideogram, Recraft, Kling, Seedance, Wan, MiniMax).
- **Wo:** cloud.higgsfield.ai. Dort gibt es einen API-Schlüssel (Key + Secret) und ein Guthaben in US-Dollar.
- **Kosten:** Bezahlt wird pro Ergebnis, ohne Abo. Bilder kosten wenige Cent. Ein 10-Sekunden-Video mit Kling 3.0 kostet etwa 1,12 $, mit Kling 2.6 etwa 0,70 $. Fehlgeschlagene Aufträge sind kostenlos.
- **Websites:** Die API liefert Bilder und Videos, keine fertigen Websites. Websites bleiben Emres Agentur-Leistung. Die KI kann aber die Bilder dafür liefern.
- **Rechte:** Laut Nutzungsbedingungen darf man mit der API Anwendungen für eigene Endkunden bauen. Die Ergebnisse dürfen kommerziell genutzt werden. API-Daten werden standardmäßig nicht zum Training verwendet. Vor dem Start Abschnitt 11 der Nutzungsbedingungen selbst lesen.

### So läuft ein Auftrag
1. Kunde meldet sich per E-Mail-Link an und kauft Credits bei Lemon Squeezy.
2. Lemon Squeezy meldet den Kauf an unsere Vercel-Funktion, die schreibt die Credits gut.
3. Kunde gibt auf `/ki` einen Auftrag ein, z. B. „Produktfoto auf Marmor, warmes Licht".
4. Unsere Vercel-Funktion prüft die Credits, zieht sie ab und schickt den Auftrag mit **Emres geheimem API-Schlüssel** an Higgsfield. Der Kunde sieht den Schlüssel nie.
5. Higgsfield rechnet vom Dollar-Guthaben ab und liefert das Ergebnis, die Website zeigt es an.
6. Gewinn = Credit-Preis in Euro minus Higgsfield-Kosten minus Lemon-Squeezy-Gebühr (ca. 5 % + 0,50 $).

## Ideen: In welche Richtung kann die KI gehen?
Zielgruppe wie bei der Agentur: kleine Unternehmen (Café, Friseur, Handwerk, Shops).

1. **Produktfoto-Studio:** Handyfoto hochladen, KI macht ein Profi-Studiofoto daraus (neuer Hintergrund, Licht, Schatten). Für Shops, Gastronomie, Handwerk. Günstig, schnell, hoher Nutzen.
2. **Werbe-Anzeigen-Generator:** Produktfoto + ein Satz Angebot ergibt fertige Anzeigen für Instagram, Facebook und TikTok in allen Formaten (1:1, 4:5, 9:16), auf Wunsch mit Text im Bild.
3. **Social-Media-Kurzvideos:** Aus einem Foto wird ein 5–10-Sekunden-Clip (z. B. Kaffee dampft, Produkt dreht sich). Kling/Seedance. Teurer, deshalb mehr Credits.
4. **Parallax-Szene wie auf ergun:** Kunde wählt Branche, KI erzeugt Himmel, Landschaft und Person bzw. Produkt als Ebenen. Genau Emres Markenzeichen, perfekter Übergang zum Website-Auftrag.
5. **Business-Porträts:** Aus ein paar Selfies werden Team- und Porträtfotos für „Über uns" und LinkedIn (Higgsfield Soul ID für gleichbleibendes Gesicht).
6. **Branchen-Bildpaket:** 10 passende Bilder für die eigene Website in einheitlichem Stil. Die Website selbst baut Emre, Upsell in die Pakete.
7. **Verbessern:** Alte Logos und Fotos hochrechnen und schärfen.

### Empfehlung von Claude
Start als **„Content-Studio für kleine Unternehmen"** mit Idee 1 und 2 (nur Bilder: günstig, sofort Nutzen, geringes Risiko). Danach Idee 3 (Videos) und Idee 4 (Parallax-Szene) als Premium. Jede Seite endet mit „Komplette Website von ERGUN. anfragen", so bringt die KI auch Agentur-Kunden.

## Credit-Pakete (so auf der Seite)
| Paket | Preis | Credits | Extra |
|---|---|---|---|
| Start | 9 € | 100 | Produktfotos, Anzeigen, Stories |
| Pro | 29 € | 400 | wie Start |
| Studio | 79 € | 1.200 | wie Start |
| Premium | 199 € | 3.500 | alles frei: Werbevideos, UGC-Videos, 3D-Modelle, Parallax-Szenen, KI-Markengesicht, Kampagnen im eigenen Stil, Vorrang, 30 Min. Start mit Emre |

Verbrauch (auf der Seite, an echte Higgsfield-Preise anpassen): Produktfoto 2 Credits · Anzeige mit Text 4 · Story/Reel als Bild 4 · Video 5 s 12 · Video 10 s 20 · Parallax-Szene 15.
Zum Vergleich Higgsfield-App: GPT Image 2.5 in hoher Qualität, 2K, kostet 2,75 Higgsfield-Credits pro Bild. Ein Credit bringt 6,6 bis 9 Cent. Ziel: mindestens das Dreifache der Higgsfield-Kosten.

## Landingpage endo.ai (online seit 24.09. abends)
- Datei `ki/index.html`, Adresse `/ki/`, Link in Kopf und Fuß der Startseite.
- Eigene Marke: nur Schrift Geist, Schwarz mit Flächen #181818/#1F1F1F, Akzent Orange #FF5A1F, Überschrift mit Verlauf Weiß → Grau.
- Aufbau: Insel-Navigation (am Handy Burger mit Vollbild-Menü) · Hero nach Emres Vorlage „Anomalous Matter": lebendige orange Drahtgitter-Kugel (three.js, Licht folgt der Maus) mit Text mittig unten · Vorher/Nachher-Regler (Handyfoto → Studiofoto) · Modelle-Leiste · Tagline Wort für Wort · Werkzeuge als Bento (Produktfotos, Anzeigen, Werbevideos, Models, Stories, Parallax, Kampagnenstil) · 3 Schritte · Fakten + Zitat Emre · Preise mit Premium · FAQ · Warteliste (öffnet WhatsApp oder E-Mail) · Fuß mit Impressum/Datenschutz.
- **Beispielbilder:** 9 Bilder aus Emres Higgsfield-Konto (GPT Image 2.5, ca. 20 Credits). Sie liegen vorerst auf dem Higgsfield-Server (CloudFront) und werden von dort geladen. **To-do:** In der Claude-Cloud-Umgebung die Domain `d8j0ntlcm91z4.cloudfront.net` freigeben, dann legt Claude die Bilder als WebP in `ki/bilder/` ab (schneller, datenschutzfreundlicher).
- **Zitat** von Emre auf der Seite ist ein Vorschlag von Claude, bitte prüfen.
- Zahlung und Login gibt es noch nicht. Alle Knöpfe führen zur Warteliste.

- **3D-Kugel:** Quelle `ki/js/orb.quelle.js`, gebaut zu `ki/js/orb.js` (three.js 0.186.1, mit esbuild gebündelt, rund 130 KB übertragen). Rechnet nur, solange der Hero sichtbar ist. Bei „Bewegung reduzieren" ein Standbild, ohne WebGL einfach schwarz.
  Neu bauen: `npm i --no-save three@0.186.1 esbuild` und dann `npx esbuild ki/js/orb.quelle.js --bundle --minify --format=iife --target=es2018 --outfile=ki/js/orb.js`

## Technik (Plan)
- **Seite:** `ki.html` bzw. `/ki` im gleichen Design wie die Website.
- **Login + Credits:** Supabase (kostenlos zum Start). E-Mail-Link-Login und eine kleine Datenbank: Nutzer, Credits, Aufträge.
- **Vercel-Funktionen:** `api/ki/erzeugen` (Credits prüfen, Higgsfield aufrufen), `api/ki/status` (Ergebnis abholen), `api/lemon/webhook` (Kauf gutschreiben).
- **Geheimnisse** nur als Vercel-Umgebungsvariablen, nie im Code oder Chat: `HF_API_KEY`, `HF_API_SECRET`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## To-do für Emre (vor dem Bau)
- [x] Richtung und Name: endo.ai, Marketing/E-Commerce/futuristisch
- [ ] **Higgsfield-API-Schlüssel neu erzeugen:** Der erste Schlüssel wurde am 24.09. im Chat geteilt. In cloud.higgsfield.ai löschen, neuen erzeugen und nur in Vercel eintragen (`HF_KEY` = key:secret)
- [ ] cloud.higgsfield.ai: 10–20 $ Guthaben zum Testen
- [ ] Lemon Squeezy: Konto und Store anlegen (Freischaltung dauert ein paar Tage, früh starten)
- [ ] Supabase: kostenloses Konto anlegen
- [ ] Schlüssel in Vercel eintragen: Projekt → Settings → Environment Variables (nicht in den Chat schreiben)
- [ ] Rechtliches: AGB und Widerrufsbelehrung für digitale Inhalte, Datenschutz um KI und Zahlung ergänzen (Lemon Squeezy liefert Teile davon)
