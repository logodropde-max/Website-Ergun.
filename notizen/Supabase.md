---
tags: [endo-ai, dienst]
---
# Supabase

Login und Datenbank für [[endo-ai|endo.ai]].

- Login per E-Mail-Link ohne Passwort.
- Tabellen: Nutzer, Credits, Aufträge.
- Wird von den Funktionen bei [[Vercel]] angesprochen, Gutschrift nach Kauf über [[Lemon Squeezy]].
- **Offen:** kostenloses Konto anlegen. Siehe [[To-dos]].

## Stand 26.09.2026 – eingerichtet für endo Phase C
- Über den **Vercel-Marketplace** angelegt: Organisation „Ergun“ (Free, Abrechnung über Vercel), Projekt **ENDO**, Region **eu-central-1 (Frankfurt)**, verbunden mit website-ergun (Production).
- Vercel-Variablen (automatisch): u. a. `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `POSTGRES_*`. Der Server nutzt nur Adresse + geheimen Schlüssel.
- Datenbank-Aufbau: `_code/werkzeuge/endo-datenbank/schema.sql` (im SQL-Editor ausgeführt). Tabellen `endo_konten`, `endo_auftraege`, `endo_tageskosten`; Funktionen nur für den Server. Test-Konto `test-emre` mit 1000 Test-Credits.
- Login (Supabase Auth) kommt später → [[endo Phase C – Bauplan]].

## Stand 26.09.2026 abends – Kundenkonten (Supabase Auth)
- **E-Mail + Passwort**, „Confirm email“ an, Anmelden erlaubt. Server spricht Auth über den öffentlichen Schlüssel (`SUPABASE_PUBLISHABLE_KEY` bzw. `SUPABASE_ANON_KEY`, von der Integration angelegt), Datenbank weiter über den geheimen Schlüssel.
- **URL-Einstellungen:** Site URL `https://website-ergun.vercel.app/ki/`, Weiterleitungen `https://website-ergun.vercel.app/**` (nach eigener Domain hier ergänzen!).
- **Konten bei uns:** `endo_konten` mit ID `u-<Supabase-Nutzer-ID>`, Name = E-Mail, Start **0 Credits**. Neue Tabelle `endo_fotos` (Meine Fotos), Spalte `geloescht` bei Aufträgen, Funktionen `endo_konto_sicherstellen`, `endo_foto_merken`, `endo_meine_dateien`, `endo_datei_loeschen`, `endo_alte_dateien_austragen` – alle nur für den Server (geprüft: anon = false).
- **E-Mails:** vorerst Supabase-Standardversand – englische Vorlagen, nur wenige Mails pro Stunde, nur an Team-Mitglieder der Organisation. Vorlagen lassen sich erst mit **eigenem SMTP** ändern (Emails → SMTP Settings, z. B. über einen Mail-Dienst) → offen in [[To-dos]].
- **Credits gutschreiben** (bis der Kauf läuft): Claude Code macht es im SQL-Editor (`update endo_konten set credits = credits + N where id = 'u-…'`).
