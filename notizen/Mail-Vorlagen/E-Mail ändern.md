---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: E-Mail ändern („Change Email Address“)

Supabase → Authentication → Emails → Templates → **Change email address**. Wenn ein Konto eine neue E-Mail-Adresse bekommt (gibt es auf der Seite noch nicht – Vorlage für später). Gleicher Stil wie Emres „Confirm sign up“ (heller Rahmen, weiße Karte, „endo von ERGUN.“, oranger Knopf, Link zum Kopieren). Platzhalter in `{{ … }}` nicht ändern. Übersicht: [[Mail-Vorlagen (Übersicht)]].

**Betreff:**
```
Bitte bestätigen Sie Ihre neue E-Mail-Adresse
```

**Inhalt (HTML) – im Feld „Body“ unter „Source“ alles ersetzen:**
```html
<div style="margin:0;padding:32px 16px;background:#f4f2ee;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:36px 32px;">
    <p style="margin:0 0 24px;font-size:18px;font-weight:bold;letter-spacing:0.5px;">endo <span style="color:#888;font-weight:normal;">von ERGUN.</span></p>

    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Neue E-Mail-Adresse bestätigen</h1>

    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
      Guten Tag,<br><br>
      Ihr endo-Konto soll künftig <strong>{{ .NewEmail }}</strong> statt {{ .Email }} verwenden. Bitte bestätigen Sie die Änderung mit einem Klick.
    </p>

    <p style="margin:0 0 28px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#FF5A1F;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:14px 28px;border-radius:999px;">Änderung bestätigen</a>
    </p>

    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#555;">
      Falls der Knopf nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:
    </p>
    <p style="margin:0 0 28px;font-size:13px;line-height:1.5;word-break:break-all;">
      <a href="{{ .ConfirmationURL }}" style="color:#FF5A1F;">{{ .ConfirmationURL }}</a>
    </p>

    <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">Sie haben das nicht veranlasst? Dann ignorieren Sie diese E-Mail – es bleibt bei Ihrer bisherigen Adresse.</p>
  </div>
</div>
```
