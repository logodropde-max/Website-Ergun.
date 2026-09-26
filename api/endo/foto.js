/* endo Studio – Produktfoto annehmen (Testmodus: nur mit ENDO_TEST_CODE).
   Prüft echten Bildtyp, Größe, Auflösung und Inhalt, legt es in Vercel Blob unter endo/fotos/ ab (30 Tage).
   Body = rohe Bilddatei (der Browser verkleinert große Fotos vorher). Antwort: { fotoUrl, breite, hoehe } */
import { antwort, fehlerAntwort, vonEigenerSeite, dienste } from '../_lib/endo/http.js';
import { kontoAusAnfrage, pruefeFoto, FOTO, Abgelehnt } from '../_lib/endo/pruefen.js';
import { pruefeInhalt, INHALT_MELDUNG } from '../_lib/endo/inhalt.js';
import { blob } from '../_lib/endo/blob.js';

export async function POST(request) {
  try {
    if (!vonEigenerSeite(request)) throw new Abgelehnt('nicht-erlaubt', 'Nicht erlaubt.', 403);
    kontoAusAnfrage(request);
    const { speicher } = dienste();
    if (Number(request.headers.get('content-length') || 0) > FOTO.maxBytes) throw new Abgelehnt('foto-gross', 'Das Foto ist zu groß (höchstens 4 MB).', 413);
    const bytes = await request.arrayBuffer();
    const info = pruefeFoto(bytes);
    const fotoUrl = await blob.fotoSpeichern(bytes, info.typ, info.endung);
    const inhalt = await pruefeInhalt(fotoUrl);
    if (inhalt.kostenUsd) await speicher.chatkosten(inhalt.kostenUsd);
    if (!inhalt.ok) throw new Abgelehnt('foto-inhalt', INHALT_MELDUNG[inhalt.grund] || INHALT_MELDUNG.sonstiges, 422);
    return antwort(200, { fotoUrl, breite: info.breite, hoehe: info.hoehe });
  } catch (e) {
    return fehlerAntwort(e, 'foto');
  }
}

export function GET() {
  return antwort(405, { fehler: 'Nur POST.' });
}
