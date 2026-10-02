---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: Konto bestätigen – helle Fassung (Emres Original, bis 03.10.2026)

Stand in Supabase bis zur Weltraum-Fassung ([[Konto bestätigen (Weltraum)]]). Vom Bildschirm abgeschrieben (Zeilen 1–21); der Schluss nach dem Kopier-Link war nicht lesbar und ist hier sinngemäß ergänzt. Betreff: `Bitte bestätigen Sie Ihre E-Mail-Adresse`.

```html
<div style="margin:0;padding:32px 16px;background:#f4f2ee;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:36px 32px;">
    <p style="margin:0 0 24px;font-size:18px;font-weight:bold;letter-spacing:0.5px;">endo <span style="color:#888;font-weight:normal;">von ERGUN.</span></p>

    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Fast geschafft – bitte bestätigen Sie Ihre E-Mail-Adresse</h1>

    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
      Guten Tag,<br><br>
      vielen Dank für Ihre Anmeldung. Bitte bestätigen Sie mit einem Klick, dass diese E-Mail-Adresse Ihnen gehört.
    </p>

    <p style="margin:0 0 28px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#FF5A1F;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:14px 28px;border-radius:999px;">E-Mail-Adresse bestätigen</a>
    </p>

    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#555;">
      Falls der Knopf nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:
    </p>
    <p style="margin:0 0 28px;font-size:13px;line-height:1.5;word-break:break-all;">
      <a href="{{ .ConfirmationURL }}" style="color:#FF5A1F;">{{ .ConfirmationURL }}</a>
    </p>

    <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">Sie haben sich nicht angemeldet? Dann ignorieren Sie diese E-Mail einfach.</p>
  </div>
</div>
```
