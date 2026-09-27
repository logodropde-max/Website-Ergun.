/* Löscht alte Anfrage-Dateien aus dem Kontaktformular (anfragen/) nach 30 Tagen.
   Läuft täglich als Vercel-Cron (siehe vercel.json). Ist CRON_SECRET gesetzt,
   schickt Vercel es als Bearer-Token mit; andere Aufrufe werden dann abgewiesen.
   Seit 27.09.2026 nur noch die Webdesign-Seite – endo Studio räumt in seinem eigenen Projekt auf. */
import { list, del } from '@vercel/blob';

const ORDNER = { 'anfragen/': 30 };

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
  return new Response(JSON.stringify({ geloescht }), { headers: { 'content-type': 'application/json' } });
}
