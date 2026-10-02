---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: E-Mail ändern („Change Email Address“)

Supabase → Authentication → Emails → Templates → **Change email address**. Wenn ein Konto eine neue E-Mail-Adresse bekommt (gibt es auf der Seite noch nicht – Vorlage für später). Weltraum-Look wie [[Konto bestätigen (Weltraum)]] (Kopfbild endo-Form + Sternenhimmel, dunkel, oranger Knopf), seit 03.10.2026 in Supabase. Platzhalter in `{{ … }}` nicht ändern. Übersicht: [[Mail-Vorlagen (Übersicht)]].

**Betreff:**
```
Bitte bestätigen Sie Ihre neue E-Mail-Adresse
```

**Inhalt (HTML) – im Feld „Body“ unter „Source“ alles ersetzen:**
```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#05070F" style="background:#05070F;margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B1020" style="width:100%;max-width:600px;background:#0B1020;border:1px solid #1C2540;border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:0;line-height:0;font-size:0;">
            <img src="https://endo-ergun.vercel.app/bilder/mail/endo-kopf.jpg?v=1" width="600" alt="endo – Ihr digitaler Mitarbeiter von ERGUN." style="display:block;width:100%;max-width:600px;height:auto;border:0;">
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px;font-family:Arial,Helvetica,sans-serif;color:#FFFFFF;">
            <p style="margin:0 0 20px;font-size:18px;font-weight:bold;letter-spacing:0.5px;color:#FFFFFF;">endo <span style="color:#8B95B2;font-weight:normal;">von ERGUN.</span></p>
            <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#FFFFFF;">Neue E&#8209;Mail-Adresse bestätigen</h1>
            <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#C9D1E4;">
              Guten Tag,<br><br>
              Ihr endo-Konto soll künftig <strong style="color:#FFFFFF;">{{ .NewEmail }}</strong> statt {{ .Email }} verwenden. Bitte bestätigen Sie die Änderung mit einem Klick.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
              <tr>
                <td bgcolor="#FF5A1F" style="background:#FF5A1F;border-radius:999px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:999px;">Änderung bestätigen</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#8B95B2;">Falls der Knopf nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="margin:0 0 28px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#FF8A5C;">{{ .ConfirmationURL }}</a></p>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#8B95B2;">Sie haben das nicht veranlasst? Dann ignorieren Sie diese E-Mail – es bleibt bei Ihrer bisherigen Adresse.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 24px;border-top:1px solid #1C2540;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6B7590;">
            endo – Ihr digitaler Mitarbeiter von ERGUN.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```
