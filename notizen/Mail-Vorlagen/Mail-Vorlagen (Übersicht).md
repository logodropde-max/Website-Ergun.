---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlagen für Supabase (endo-Konto) – Übersicht

Stand 02.10.2026. Emre kopiert Betreff + HTML selbst ins Dashboard: Supabase → Authentication → Emails → Templates. Platzhalter wie `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` bleiben **unverändert**. Nach außen nur „ERGUN.“ bzw. „endo von ERGUN.“ (nie Emres Namen).

| Vorlage in Supabase | Notiz | Wann |
|---|---|---|
| Confirm sign up | schon in Supabase (Emres Fassung, bleibt) · Ersatz: [[Konto bestätigen]] | Konto erstellen auf der endo-Startseite, auch „Mail erneut senden“ |
| Reset Password | [[Passwort zurücksetzen]] | „Passwort vergessen?“ |
| Magic Link | [[Magic Link]] | Anmelde-Link ohne Passwort, wenn er im Dashboard verschickt wird (die Seite nutzt ihn nicht) |
| Change Email Address | [[E-Mail ändern]] | Adresse ändern (gibt es auf der Seite noch nicht, Vorlage für später) |
| Invite user | [[Einladung]] | „Invite user“ im Dashboard. Cockpit-Einladungen schickt endo selbst über Resend (`api/_lib/endo/cockpit.js`), nicht über diese Vorlage |

**Stil:** wie Emres „Confirm sign up“ – heller Rahmen, weiße Karte, oben „endo von ERGUN.“, oranger Knopf, Link zum Kopieren, Sie-Form, Hinweis „Sie haben das nicht angefordert? Dann ignorieren …“, Gruß „endo von ERGUN.“.

**Absender (SMTP-Einstellungen):** Name „endo von ERGUN.“, Adresse von Emres Mail-Dienst.
