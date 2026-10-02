---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: Passwort zurücksetzen („Reset Password“)

Supabase → Authentication → Emails → Templates → **Reset Password**. Betreff und HTML unten 1:1 hineinkopieren. Platzhalter in `{{ … }}` nicht ändern. Übersicht: [[Mail-Vorlagen (Übersicht)]].

**Betreff:**
```
Ihr neues Passwort für endo
```

**Inhalt (HTML):**
```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14121A;line-height:1.5">
  <p style="font-size:20px;font-weight:bold;margin:0 0 16px">Neues Passwort festlegen</p>
  <p style="margin:0 0 16px">Guten Tag,</p>
  <p style="margin:0 0 16px">Sie möchten ein neues Passwort für Ihr endo-Konto ({{ .Email }}). Über den Knopf legen Sie es fest – der Link gilt 1 Stunde und nur einmal.</p>
  <p style="margin:0 0 24px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14121A;color:#FFFFFF;text-decoration:none;font-weight:bold">Neues Passwort festlegen</a></p>
  <p style="margin:0 0 16px;font-size:14px;color:#55505F">Sie haben das nicht angefordert? Dann ignorieren Sie diese E-Mail einfach – Ihr Passwort bleibt, wie es ist.</p>
  <p style="margin:24px 0 0;font-size:14px;color:#55505F">Viele Grüße<br>endo von ERGUN.</p>
</div>
```
