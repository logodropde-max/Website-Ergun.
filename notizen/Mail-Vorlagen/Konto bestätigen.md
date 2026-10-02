---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: Konto bestätigen („Confirm sign up“)

> [!note] **Nicht eintragen:** In Supabase steht schon Emres eigene deutsche Fassung (heller Rahmen, oranger Knopf) – sie bleibt. Der Text hier ist nur ein Ersatz, falls sie einmal verloren geht.

Supabase → Authentication → Emails → Templates → **Confirm sign up**. Wird beim Registrieren auf der endo-Startseite verschickt (auch bei „Erneut senden“). Platzhalter in `{{ … }}` nicht ändern. Übersicht: [[Mail-Vorlagen (Übersicht)]].

**Betreff:**
```
Bitte bestätigen Sie Ihre E-Mail-Adresse
```

**Inhalt (HTML):**
```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14121A;line-height:1.5">
  <p style="font-size:20px;font-weight:bold;margin:0 0 16px">Fast geschafft</p>
  <p style="margin:0 0 16px">Guten Tag,</p>
  <p style="margin:0 0 16px">danke für Ihre Anmeldung bei endo. Bitte bestätigen Sie Ihre E-Mail-Adresse ({{ .Email }}) mit dem Knopf – danach sind Sie direkt angemeldet. Der Link gilt 1 Stunde und nur einmal.</p>
  <p style="margin:0 0 24px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14121A;color:#FFFFFF;text-decoration:none;font-weight:bold">E-Mail bestätigen</a></p>
  <p style="margin:0 0 16px;font-size:14px;color:#55505F">Sie haben sich nicht angemeldet? Dann ignorieren Sie diese E-Mail einfach.</p>
  <p style="margin:24px 0 0;font-size:14px;color:#55505F">Viele Grüße<br>endo von ERGUN.</p>
</div>
```
