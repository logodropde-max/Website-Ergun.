---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: Konto bestätigen – Weltraum („Confirm sign up“)

Emres Wunsch (03.10.2026): Bestätigungs-Mail mit endo-Hero und galaktischem Hintergrund. **Diese Fassung steht in Supabase** → Authentication → Emails → Templates → **Confirm sign up**. Die vorherige helle Fassung: [[Konto bestätigen (hell, vorher)]].

- Kopfbild: echte endo-Form von der Startseite vor Sternenhimmel – `https://endo-ergun.vercel.app/bilder/mail/endo-kopf.jpg` (1200 × 560, in der Mail 600 breit). Neu bauen: `_code/werkzeuge/mail-kopf-bauen.py <Aufnahme>` (Aufnahme der Startseite ohne Text mit `cdp-shot.mjs`, `"gpu": true`, 1200 × 700, dpr 2), danach `?v=` in der Vorlage hochzählen.
- Aufbau als Tabellen (läuft auch in Outlook/Gmail), dunkler Grund mit `bgcolor` UND `style` (bleibt im Dunkelmodus dunkel), Text hell, Knopf Orange #FF5A1F wie bisher.
- Platzhalter `{{ .ConfirmationURL }}` nicht ändern.

**Betreff:**
```
Bitte bestätigen Sie Ihre E-Mail-Adresse
```

**Inhalt (HTML):**
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
            <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#FFFFFF;">Fast geschafft – bitte bestätigen Sie Ihre E&#8209;Mail-Adresse</h1>
            <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#C9D1E4;">
              Guten Tag,<br><br>
              vielen Dank für Ihre Anmeldung. Bitte bestätigen Sie mit einem Klick, dass diese E-Mail-Adresse Ihnen gehört – danach sind Sie direkt angemeldet.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
              <tr>
                <td bgcolor="#FF5A1F" style="background:#FF5A1F;border-radius:999px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:999px;">E-Mail-Adresse bestätigen</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#8B95B2;">Falls der Knopf nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="margin:0 0 28px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#FF8A5C;">{{ .ConfirmationURL }}</a></p>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#8B95B2;">Sie haben sich nicht angemeldet? Dann ignorieren Sie diese E-Mail einfach.</p>
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
