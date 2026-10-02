---
tags: [endo, supabase, mail-vorlage]
---
# Mail-Vorlage: Einladung („Invite user“)

Supabase → Authentication → Emails → Templates → **Invite user**. Wird verschickt, wenn Sie im Dashboard „Invite user“ nutzen. (Cockpit-Einladungen schickt endo selbst über Resend, nicht über diese Vorlage.) Platzhalter in `{{ … }}` nicht ändern. Übersicht: [[Mail-Vorlagen (Übersicht)]].

**Betreff:**
```
Sie sind zu endo eingeladen
```

**Inhalt (HTML):**
```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14121A;line-height:1.5">
  <p style="font-size:20px;font-weight:bold;margin:0 0 16px">Willkommen bei endo</p>
  <p style="margin:0 0 16px">Guten Tag,</p>
  <p style="margin:0 0 16px">Sie wurden zu endo eingeladen – Ihrem digitalen Mitarbeiter von ERGUN. Mit dem Knopf nehmen Sie die Einladung an und legen Ihr Passwort fest.</p>
  <p style="margin:0 0 24px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14121A;color:#FFFFFF;text-decoration:none;font-weight:bold">Einladung annehmen</a></p>
  <p style="margin:0 0 16px;font-size:14px;color:#55505F">Sie erwarten keine Einladung? Dann ignorieren Sie diese E-Mail einfach.</p>
  <p style="margin:24px 0 0;font-size:14px;color:#55505F">Viele Grüße<br>endo von ERGUN.</p>
</div>
```
