/* Löscht hochgeladene Anfrage-Dateien, die älter als 30 Tage sind.
   Läuft täglich als Vercel-Cron (siehe vercel.json). Ist CRON_SECRET gesetzt,
   schickt Vercel es als Bearer-Token mit; andere Aufrufe werden dann abgewiesen. */
import { list, del } from '@vercel/blob';

const TAGE = 30;

export async function GET(request) {
  const geheim = process.env.CRON_SECRET;
  if (geheim && request.headers.get('authorization') !== 'Bearer ' + geheim) {
    return new Response('Nicht erlaubt', { status: 401 });
  }
  const grenze = Date.now() - TAGE * 24 * 60 * 60 * 1000;
  let cursor, geloescht = 0;
  do {
    const seite = await list({ prefix: 'anfragen/', cursor, limit: 1000 });
    const alt = seite.blobs.filter(b => new Date(b.uploadedAt).getTime() < grenze).map(b => b.url);
    if (alt.length) { await del(alt); geloescht += alt.length; }
    cursor = seite.hasMore ? seite.cursor : undefined;
  } while (cursor);
  return Response.json({ geloescht });
}
