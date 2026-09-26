/* endo Studio – Produktfoto annehmen (angemeldete Kunden oder Testmodus).
   Prüft echten Bildtyp, Größe, Auflösung und Inhalt, legt es in Vercel Blob unter endo/fotos/ ab (90 Tage)
   und merkt es im Konto („Meine Fotos“). Höchstens 40 Fotos pro Konto und Tag.
   Body = rohe Bilddatei (der Browser verkleinert große Fotos vorher). Antwort: { fotoUrl, breite, hoehe } */
import { antwort, fehlerAntwort, vonEigenerSeite, dienste, kontoPflicht } from '../_lib/endo/http.js';
import { pruefeFoto, FOTO, Abgelehnt } from '../_lib/endo/pruefen.js';
import { pruefeInhalt, INHALT_MELDUNG } from '../_lib/endo/inhalt.js';
import { blob } from '../_lib/endo/blob.js';
import { WERKZEUGE } from '../_lib/endo/werkzeuge.js';

export async function POST(request) {
  try {
    if (!vonEigenerSeite(request)) throw new Abgelehnt('nicht-erlaubt', 'Nicht erlaubt.', 403);
    const d = dienste();
    const { speicher } = d;
    const kontoId = await kontoPflicht(request, d);
    /* Ohne Guthaben kein Upload (Emre, 26.09.): erst aufladen, dann erstellen – so entstehen keine Kosten ohne Credits */
    const k = await speicher.konto(kontoId);
    const mindestens = Math.min(...Object.values(WERKZEUGE).map((w) => w.credits));
    if (!k.ok || k.verfuegbar < mindestens) throw new Abgelehnt('credits', 'Zum Erstellen brauchen Sie Credits. Sobald Sie ein Paket aufgeladen haben, laden Sie hier Ihr Foto hoch.', 402);
    const z = await speicher.chatZaehlen('foto:' + kontoId);
    if (z && z.ok === false) throw new Abgelehnt('foto-limit', 'Heute wurden schon sehr viele Fotos hochgeladen. Bitte morgen weitermachen.', 429);
    if (Number(request.headers.get('content-length') || 0) > FOTO.maxBytes) throw new Abgelehnt('foto-gross', 'Das Foto ist zu groß (höchstens 4 MB).', 413);
    const bytes = await request.arrayBuffer();
    const info = pruefeFoto(bytes);
    const fotoUrl = await blob.fotoSpeichern(bytes, info.typ, info.endung);
    const inhalt = await pruefeInhalt(fotoUrl);
    if (inhalt.kostenUsd) await speicher.chatkosten(inhalt.kostenUsd);
    if (!inhalt.ok) throw new Abgelehnt('foto-inhalt', INHALT_MELDUNG[inhalt.grund] || INHALT_MELDUNG.sonstiges, 422);
    await speicher.fotoMerken(kontoId, fotoUrl);
    return antwort(200, { fotoUrl, breite: info.breite, hoehe: info.hoehe });
  } catch (e) {
    return fehlerAntwort(e, 'foto');
  }
}

export function GET() {
  return antwort(405, { fehler: 'Nur POST.' });
}
