/* Nimmt eine Datei aus dem Kontaktformular an und legt sie in Vercel Blob ab.
   Antwort: { url } – der Link kommt in die WhatsApp- bzw. E-Mail-Nachricht.
   Ein Aufruf = eine Datei, roher Body. Vercel-Funktionen nehmen höchstens 4,5 MB an,
   große Fotos verkleinert deshalb schon der Browser. Braucht BLOB_READ_WRITE_TOKEN
   (entsteht automatisch, wenn der Blob-Store mit dem Projekt verbunden wird). */
import { put } from '@vercel/blob';

const MAX_BYTES = 4 * 1024 * 1024;
const ERLAUBT = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  heic: 'image/heic', heif: 'image/heif', svg: 'image/svg+xml',
  pdf: 'application/pdf', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ai: 'application/postscript', zip: 'application/zip'
};

function antwort(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

/* Dateiname für die Ablage: nur Kleinbuchstaben, Ziffern, Bindestrich. Umlaute werden umschrieben. */
function sauberName(roh) {
  const name = String(roh || '').split(/[\\/]/).pop();
  const punkt = name.lastIndexOf('.');
  const endung = punkt > 0 ? name.slice(punkt + 1).toLowerCase() : '';
  const basis = (punkt > 0 ? name.slice(0, punkt) : name)
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'datei';
  return { basis, endung };
}

export async function POST(request) {
  let roh = request.headers.get('x-dateiname') || '';
  try { roh = decodeURIComponent(roh); } catch (e) { /* Name bleibt, wie er kam */ }
  const { basis, endung } = sauberName(roh);
  const typ = ERLAUBT[endung];
  if (!typ) return antwort(415, { fehler: 'Dieser Dateityp wird nicht angenommen.' });

  const laenge = Number(request.headers.get('content-length') || 0);
  if (laenge > MAX_BYTES) return antwort(413, { fehler: 'Die Datei ist zu groß.' });

  const daten = await request.arrayBuffer();
  if (!daten.byteLength) return antwort(400, { fehler: 'Die Datei ist leer.' });
  if (daten.byteLength > MAX_BYTES) return antwort(413, { fehler: 'Die Datei ist zu groß.' });

  try {
    const blob = await put('anfragen/' + basis + '.' + endung, daten, {
      access: 'public',
      addRandomSuffix: true,
      contentType: typ
    });
    return antwort(200, { url: blob.url });
  } catch (e) {
    console.error('Upload fehlgeschlagen:', e && e.message);
    return antwort(500, { fehler: 'Die Datei konnte nicht gespeichert werden.' });
  }
}

export function GET() {
  return antwort(405, { fehler: 'Nur POST.' });
}
