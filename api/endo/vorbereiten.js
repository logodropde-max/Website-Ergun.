/* endo Studio – Auftrag vorbereiten: prüft alles, holt den echten Preis, gibt die Bestätigungskarte
   „Werkzeug · Look · Format · X Credits“ + signiertes Token zurück. Es wird noch nichts gebucht oder erzeugt.
   Body: { werkzeug, look?, format?, fotoUrl, presetId? } – andere Felder werden abgelehnt. */
import { antwort, fehlerAntwort, vonEigenerSeite, dienste, kontoPflicht } from '../_lib/endo/http.js';
import { Abgelehnt } from '../_lib/endo/pruefen.js';
import { vorbereiten } from '../_lib/endo/ablauf.js';

export async function POST(request) {
  try {
    if (!vonEigenerSeite(request)) throw new Abgelehnt('nicht-erlaubt', 'Nicht erlaubt.', 403);
    const d = dienste();
    const { speicher, hf } = d;
    const kontoId = await kontoPflicht(request, d);
    let roh;
    try { roh = await request.json(); } catch (e) { throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.'); }
    return antwort(200, await vorbereiten({ kontoId, roh, hf, speicher }));
  } catch (e) {
    return fehlerAntwort(e, 'vorbereiten');
  }
}
