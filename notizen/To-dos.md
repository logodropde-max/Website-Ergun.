---
tags: [aufgaben]
---
# To-dos

Offene Punkte aus [[ERGUN Website (Übersicht)]].

## Emre
- [ ] Neuen Higgsfield-Schlüssel erzeugen, alten löschen (wurde im Chat geteilt), nur in [[Vercel]] als `HF_KEY` eintragen → [[Higgsfield API]]
- [ ] **26.09.: Der vorhandene `ANTHROPIC_API_KEY` in Vercel ist ungültig** (Anthropic lehnt ihn ab – endo hat bisher nie mit Claude geantwortet, nur eingebaute Antworten). Neuen Schlüssel bei console.anthropic.com erzeugen (Guthaben aufladen, Auto-Aufladen aus) und in [[Vercel]] den Wert von `ANTHROPIC_API_KEY` ersetzen, damit [[endo Chat-Agent|endo]] frei antwortet (ohne Schlüssel: eingebaute Antworten)
- [x] Blob-Speicher in Vercel angelegt (26.09., Claude): **ergun-dateien**, Public, Frankfurt, mit website-ergun verbunden → [[Datei-Upload (Vercel Blob)]]
- [ ] Konto bei [[Lemon Squeezy]] und Store anlegen, je Paket (Start 5 €, Pro 20 €, Premium 100 €) ein Produkt → die 3 Checkout-Links an Claude geben (kommen in `ki/js/endo-daten.js`, Feld `kaufen`)
- [x] Konto bei [[Supabase]] anlegen (26.09., Projekt ENDO, Frankfurt)
- [ ] **Eigenen E-Mail-Versand (SMTP) für [[Supabase]] einrichten** – sonst gehen Bestätigungs-Mails nur an Team-Mitglieder, max. wenige pro Stunde und auf Englisch; danach deutsche Vorlagen „Confirm signup“ + „Reset password“
- [ ] In der Claude-Umgebung die Domain `d8j0ntlcm91z4.cloudfront.net` freigeben (Bilder für [[endo-ai|endo.ai]])
- [ ] AGB und Widerruf für endo.ai → [[Datenschutz und Recht]]
- [ ] Im Vault `git pull` ausführen, bevor lokal weitergearbeitet wird → [[GitHub]]

## Claude
- [ ] Tassenbild von endo.ai als WebP ins Projekt holen (nach Freigabe der Domain)
- [ ] endo an die echte Erzeugung anschließen, sobald Login und Credits stehen → [[endo Chat-Agent]]
- [x] Login + echte Erzeugung für [[endo-ai|endo.ai]] (26.09.: Kundenkonten, Mein Konto 90 Tage)
- [ ] Credit-Kauf für [[endo-ai|endo.ai]] (Lemon Squeezy → Gutschrift ins Konto)
- [x] Credit-Verbrauch an echte Kosten anpassen → [[Credit-Pakete]] (25.09.: Preise von Emre, mind. 47 % Gewinn)
- [x] ~~Neues abstraktes Titelbild~~ – verworfen; stattdessen gezeichnete Landschaft (Projekt 1, live) → [[Projekt 1 – Abschluss ERGUN. Website]]
- [ ] Phase B/C aus [[Projekt 2 – Feinschliff + endo Agents]]
