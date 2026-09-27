---
tags: [aufgaben]
---
# To-dos

Offene Punkte aus [[ERGUN Website (Übersicht)]].

## Emre
- [x] Higgsfield-Schlüssel in [[Vercel]] eingetragen (26.09., Variable `HF_CREDENTIALS`) → [[Higgsfield API]]
- [x] ~~26.09.: Der vorhandene `ANTHROPIC_API_KEY` in Vercel ist ungültig~~ – erledigt 26.09. (Guthaben gekauft, Schlüssel erneuert, endo antwortet mit Claude Sonnet 5). (Anthropic lehnt ihn ab – endo hat bisher nie mit Claude geantwortet, nur eingebaute Antworten). Neuen Schlüssel bei console.anthropic.com erzeugen (Guthaben aufladen, Auto-Aufladen aus) und in [[Vercel]] den Wert von `ANTHROPIC_API_KEY` ersetzen, damit [[endo Chat-Agent|endo]] frei antwortet (ohne Schlüssel: eingebaute Antworten)
- [x] Blob-Speicher in Vercel angelegt (26.09., Claude): **ergun-dateien**, Public, Frankfurt, mit website-ergun verbunden → [[Datei-Upload (Vercel Blob)]]
- [ ] Konto bei [[Lemon Squeezy]] und Store anlegen: je Paket (Start, Pro, Premium) **monatlich und jährlich** (kein Einmalkauf mehr, 28.09.) → die **6** Checkout-Links an Claude geben (Felder `kaufen`, `kaufenJahr` in `_code/endo-studio/test/js/endo-daten.js`)
- [ ] In Supabase einmal `schema.sql` (Funktion `endo_warteliste_anzahl`) ausführen → Wartelisten-Zähler auf der endo-Startseite ab 51 Einträgen (28.09.)
- [x] Konto bei [[Supabase]] anlegen (26.09., Projekt ENDO, Frankfurt)
- [ ] **Eigenen E-Mail-Versand (SMTP) für [[Supabase]] einrichten** – sonst gehen Bestätigungs-Mails nur an Team-Mitglieder, max. wenige pro Stunde und auf Englisch; danach deutsche Vorlagen „Confirm signup“ + „Reset password“
- [ ] AGB und Widerruf für endo.ai → [[Datenschutz und Recht]]
- [ ] Vercel Pro vor dem ersten zahlenden Kunden (Hobby ist nicht-kommerziell) → [[Livegang-Checkliste]]
- [ ] Echter iPhone-Test beider Seiten (Winken, Wolken, Kugel im Wirbel-Ring) und `/review-animations` selbst starten

## Claude
- [x] endo an die echte Erzeugung angeschlossen (26.09., Phase C) – erzeugt nur mit Credits → [[endo Chat-Agent]]
- [x] Login + echte Erzeugung für [[endo-ai|endo.ai]] (26.09.: Kundenkonten, Mein Konto 90 Tage)
- [ ] Credit-Kauf für [[endo-ai|endo.ai]] (Lemon Squeezy → Gutschrift ins Konto)
- [x] Credit-Verbrauch an echte Kosten anpassen → [[Credit-Pakete]] (25.09.: Preise von Emre, mind. 47 % Gewinn)
- [x] ~~Neues abstraktes Titelbild~~ – verworfen; stattdessen gezeichnete Landschaft (Projekt 1, live) → [[Projekt 1 – Abschluss ERGUN. Website]]
- [ ] Phase B/C aus [[Projekt 2 – Feinschliff + endo Agents]]
