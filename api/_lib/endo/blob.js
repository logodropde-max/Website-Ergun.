/* endo Studio – Dateien in Vercel Blob: Kundenfotos (endo/fotos/) und Ergebnisse (endo/ergebnisse/).
   Beides wird nach 90 Tagen vom täglichen Cron gelöscht (api/aufraeumen.js). Braucht BLOB_READ_WRITE_TOKEN. */
import { put } from '@vercel/blob';

const ENDUNGEN = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'video/mp4': '.mp4', 'video/quicktime': '.mov' };
const MAX_ERGEBNIS = 200 * 1024 * 1024;

export const blob = {
  async fotoSpeichern(bytes, typ, endung) {
    const b = await put(`endo/fotos/foto.${endung}`, Buffer.from(bytes), { access: 'public', addRandomSuffix: true, contentType: typ });
    return b.url;
  },
  /* Ergebnis von Higgsfield (nur ~7 Tage dort) sofort in den eigenen Speicher kopieren. */
  async kopieren(quelle, pfad) {
    const res = await fetch(quelle);
    if (!res.ok || !res.body) throw new Error('Ergebnis nicht abrufbar: ' + res.status);
    const typ = (res.headers.get('content-type') || '').split(';')[0].trim();
    const endung = ENDUNGEN[typ] || (new URL(quelle).pathname.match(/\.(png|jpe?g|webp|mp4|mov)$/i) || ['.png'])[0].toLowerCase();
    const laenge = Number(res.headers.get('content-length') || 0);
    if (laenge > MAX_ERGEBNIS) throw new Error('Ergebnis zu groß');
    const b = await put(pfad + endung, res.body, {
      access: 'public', addRandomSuffix: true, contentType: typ || undefined, multipart: endung === '.mp4' || endung === '.mov'
    });
    return b.url;
  }
};
