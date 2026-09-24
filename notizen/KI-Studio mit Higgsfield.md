# KI-Studio mit Higgsfield (zweites Einkommen)

Stand: 24.09.2026 · gepflegt von Claude Code · liegt im Repo unter `notizen/`, kommt per `git pull` in Obsidian

## Entscheidungen (Emre, 24.09.)
- **Wo:** Unterseite der Website, z. B. `/ki`, mit Link von der Startseite.
- **Haupt-KI:** Higgsfield (alles, was Higgsfield kann).
- **Bezahlung:** Lemon Squeezy (übernimmt EU-Umsatzsteuer, Rechnungen, Widerruf).
- **Login:** E-Mail-Link ohne Passwort.
- **Preise:** Vorschlag von Claude (siehe unten), später änderbar.
- **Obsidian:** Claude pflegt Notizen in diesem Ordner. Änderungen an der Website gehen immer direkt live (main → Vercel).
- **Offen:** Richtung der KI (siehe Ideen), Name, Konten anlegen.

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

## Credit-Pakete (Vorschlag)
| Paket | Preis | Credits |
|---|---|---|
| Start | 9 € | 100 |
| Pro | 29 € | 400 |
| Studio | 79 € | 1.200 |

Verbrauch (Vorschlag, an echte Higgsfield-Preise anpassen): Bild 2 Credits · Anzeige mit Text 4 · Video 5 s 12 · Video 10 s 20 · Parallax-Szene 15. Ein Credit bringt 6,6 bis 9 Cent. Ziel: mindestens das Dreifache der Higgsfield-Kosten.

## Technik (Plan)
- **Seite:** `ki.html` bzw. `/ki` im gleichen Design wie die Website.
- **Login + Credits:** Supabase (kostenlos zum Start). E-Mail-Link-Login und eine kleine Datenbank: Nutzer, Credits, Aufträge.
- **Vercel-Funktionen:** `api/ki/erzeugen` (Credits prüfen, Higgsfield aufrufen), `api/ki/status` (Ergebnis abholen), `api/lemon/webhook` (Kauf gutschreiben).
- **Geheimnisse** nur als Vercel-Umgebungsvariablen, nie im Code oder Chat: `HF_API_KEY`, `HF_API_SECRET`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## To-do für Emre (vor dem Bau)
- [ ] Richtung wählen (Ideen oben) und Namen festlegen (Vorschlag: „ERGUN. Studio")
- [ ] cloud.higgsfield.ai: Konto, API-Key + Secret erzeugen, 10–20 $ Guthaben zum Testen
- [ ] Lemon Squeezy: Konto und Store anlegen (Freischaltung dauert ein paar Tage, früh starten)
- [ ] Supabase: kostenloses Konto anlegen
- [ ] Schlüssel in Vercel eintragen: Projekt → Settings → Environment Variables (nicht in den Chat schreiben)
- [ ] Rechtliches: AGB und Widerrufsbelehrung für digitale Inhalte, Datenschutz um KI und Zahlung ergänzen (Lemon Squeezy liefert Teile davon)
