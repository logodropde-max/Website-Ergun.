---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: Anmelde-Link („Magic Link“)

Supabase → Authentication → Emails → Templates → **Magic Link**. Wird nur verschickt, wenn Sie im Dashboard einen Magic Link senden – die Seite selbst nutzt ihn nicht. Platzhalter in `{{ … }}` nicht ändern. Übersicht: [[Mail-Vorlagen (Übersicht)]].

**Betreff:**
```
Ihr Anmelde-Link für endo
```

**Inhalt (HTML):**
```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14121A;line-height:1.5">
  <p style="font-size:20px;font-weight:bold;margin:0 0 16px">Jetzt anmelden</p>
  <p style="margin:0 0 16px">Guten Tag,</p>
  <p style="margin:0 0 16px">mit dem Knopf melden Sie sich bei endo an ({{ .Email }}) – ganz ohne Passwort. Der Link gilt 1 Stunde und nur einmal.</p>
  <p style="margin:0 0 24px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14121A;color:#FFFFFF;text-decoration:none;font-weight:bold">Anmelden</a></p>
  <p style="margin:0 0 16px;font-size:14px;color:#55505F">Sie wollten sich nicht anmelden? Dann ignorieren Sie diese E-Mail einfach.</p>
  <p style="margin:24px 0 0;font-size:14px;color:#55505F">Viele Grüße<br>endo von ERGUN.</p>
</div>
```
