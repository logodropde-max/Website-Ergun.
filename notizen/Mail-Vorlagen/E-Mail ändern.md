---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: E-Mail-Adresse ändern („Change Email Address“)

Supabase → Authentication → Emails → Templates → **Change Email Address**. Platzhalter in `{{ … }}` nicht ändern. Übersicht: [[Mail-Vorlagen (Übersicht)]].

**Betreff:**
```
Bitte bestätigen Sie Ihre neue E-Mail-Adresse
```

**Inhalt (HTML):**
```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14121A;line-height:1.5">
  <p style="font-size:20px;font-weight:bold;margin:0 0 16px">Neue E-Mail-Adresse bestätigen</p>
  <p style="margin:0 0 16px">Guten Tag,</p>
  <p style="margin:0 0 16px">Ihr endo-Konto soll künftig <strong>{{ .NewEmail }}</strong> statt {{ .Email }} verwenden. Bitte bestätigen Sie die Änderung mit dem Knopf.</p>
  <p style="margin:0 0 24px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14121A;color:#FFFFFF;text-decoration:none;font-weight:bold">Änderung bestätigen</a></p>
  <p style="margin:0 0 16px;font-size:14px;color:#55505F">Sie haben das nicht veranlasst? Dann ignorieren Sie diese E-Mail – es bleibt bei Ihrer bisherigen Adresse.</p>
  <p style="margin:24px 0 0;font-size:14px;color:#55505F">Viele Grüße<br>endo von ERGUN.</p>
</div>
```
