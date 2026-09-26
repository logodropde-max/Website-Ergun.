/* endo Studio – Auftrag nach „Ja“ starten: Credits reservieren, dann Higgsfield (API) mit Webhook.
   Body: { token, auftragId } – auftragId erzeugt der Browser (UUID) und schickt sie bei jedem Klick gleich mit,
   dadurch wird ein Doppelklick nie zweimal gebucht. */
import { antwort, fehlerAntwort, vonEigenerSeite, dienste, basisUrl } from '../_lib/endo/http.js';
import { kontoAusAnfrage, Abgelehnt } from '../_lib/endo/pruefen.js';
import { starten } from '../_lib/endo/ablauf.js';

export async function POST(request) {
  try {
    if (!vonEigenerSeite(request)) throw new Abgelehnt('nicht-erlaubt', 'Nicht erlaubt.', 403);
    const kontoId = kontoAusAnfrage(request);
    const { speicher, hf } = dienste();
    let body;
    try { body = await request.json(); } catch (e) { throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.'); }
    const erg = await starten({ kontoId, token: body && body.token, auftragId: body && body.auftragId, hf, speicher, basisUrl: basisUrl(request) });
    return antwort(200, erg);
  } catch (e) {
    return fehlerAntwort(e, 'auftrag');
  }
}
