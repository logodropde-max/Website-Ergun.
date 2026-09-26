/* Löscht alte hochgeladene Dateien: Anfrage-Dateien aus dem Kontaktformular (anfragen/) nach 30 Tagen,
   Kundenfotos und Ergebnisse von endo Studio (endo/fotos/, endo/ergebnisse/) nach 90 Tagen (Emre, 26.09.2026)
   und trägt sie dann auch aus „Meine Dateien“ aus.
   Schließt außerdem hängengebliebene endo-Aufträge ab (Credits zurück, falls nichts mehr kommt).
   Läuft täglich als Vercel-Cron (siehe vercel.json). Ist CRON_SECRET gesetzt,
   schickt Vercel es als Bearer-Token mit; andere Aufrufe werden dann abgewiesen. */
import { list, del } from '@vercel/blob';
import { speicherAusUmgebung } from './_lib/endo/speicher.js';
import { higgsfieldAusUmgebung } from './_lib/endo/higgsfield.js';
import { pruefen } from './_lib/endo/ablauf.js';
import { blob } from './_lib/endo/blob.js';

const ORDNER = { 'anfragen/': 30, 'endo/fotos/': 90, 'endo/ergebnisse/': 90 };

export async function GET(request) {
  const geheim = process.env.CRON_SECRET;
  if (geheim && request.headers.get('authorization') !== 'Bearer ' + geheim) {
    return new Response('Nicht erlaubt', { status: 401 });
  }
  let geloescht = 0;
  for (const [prefix, tage] of Object.entries(ORDNER)) {
    const grenze = Date.now() - tage * 24 * 60 * 60 * 1000;
    let cursor;
    do {
      const seite = await list({ prefix, cursor, limit: 1000 });
      const alt = seite.blobs.filter(b => new Date(b.uploadedAt).getTime() < grenze).map(b => b.url);
      if (alt.length) { await del(alt); geloescht += alt.length; }
      cursor = seite.hasMore ? seite.cursor : undefined;
    } while (cursor);
  }

  let auftraege = 0;
  const speicher = speicherAusUmgebung();
  const hf = higgsfieldAusUmgebung();
  if (speicher) {
    try { await speicher.alteDateienAustragen(90); } catch (e) { console.error('Aufräumen Dateien:', e && e.message); }
  }
  if (speicher && hf) {
    try {
      for (const a of await speicher.offene(15)) {
        await pruefen({ auftrag: a, hf, speicher, blob });
        auftraege++;
      }
    } catch (e) {
      console.error('Aufräumen endo:', e && e.message);
    }
  }
  return Response.json({ geloescht, auftraege });
}
