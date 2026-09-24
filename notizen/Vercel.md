---
tags: [technik, dienst]
---
# Vercel

Hosting der [[ERGUN Website (Übersicht)|Website]] und von [[endo-ai|endo.ai]].

- Veröffentlicht automatisch jede Änderung auf `main` bei [[GitHub]].
- Funktionen: `api/upload.js` und `api/aufraeumen.js` für den [[Datei-Upload (Vercel Blob)]], `api/agent.js` für den [[endo Chat-Agent]], später Login und Kauf für [[endo-ai|endo.ai]].
- Geheimnisse nur hier unter Settings → Environment Variables: `HF_KEY` ([[Higgsfield API]]), Schlüssel für [[Lemon Squeezy]] und [[Supabase]], `BLOB_READ_WRITE_TOKEN`, `ANTHROPIC_API_KEY` (für endo).
- `.vercelignore` hält `notizen/` und `LIESMICH.md` von der Live-Seite fern.
- Ursprünglicher Plan: [[Deployment]]
