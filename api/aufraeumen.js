/* Löscht hochgeladene Dateien, die älter als 30 Tage sind: Anfrage-Dateien aus dem Kontaktformular (anfragen/)
   sowie Kundenfotos und Ergebnisse von endo Studio (endo/fotos/, endo/ergebnisse/).
   Schließt außerdem hängengebliebene endo-Aufträge ab (Credits zurück, falls nichts mehr kommt).
   Läuft täglich als Vercel-Cron (siehe vercel.json). Ist CRON_SECRET gesetzt,
   schickt Vercel es als Bearer-Token mit; andere Aufrufe werden dann abgewiesen. */
import { list, del } from '@vercel/blob';
import { speicherAusUmgebung } from './_lib/endo/speicher.js';
import { higgsfieldAusUmgebung } from './_lib/endo/higgsfield.js';
import { pruefen } from './_lib/endo/ablauf.js';
import { blob } from './_lib/endo/blob.js';

const TAGE = 30;
const ORDNER = ['anfragen/', 'endo/fotos/', 'endo/ergebnisse/'];

export async function GET(request) {
  const geheim = process.env.CRON_SECRET;
  if (geheim && request.headers.get('authorization') !== 'Bearer ' + geheim) {
    return new Response('Nicht erlaubt', { status: 401 });
  }
  const grenze = Date.now() - TAGE * 24 * 60 * 60 * 1000;
  let geloescht = 0;
  for (const prefix of ORDNER) {
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
