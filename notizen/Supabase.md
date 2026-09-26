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
