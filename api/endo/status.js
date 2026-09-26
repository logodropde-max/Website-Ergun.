/* endo Studio – Stand eines Auftrags (der Browser fragt alle paar Sekunden; übersteht Neuladen,
   weil die Auftrags-ID in der Adresse steht). Prüft dabei selbst bei Higgsfield nach, falls der Webhook fehlt.
   GET ?id=<auftragId>, Antwort: { status: laeuft|fertig|zurueck, ergebnisUrl?, meldung?, verfuegbar } */
import { antwort, fehlerAntwort, dienste, basisUrl } from '../_lib/endo/http.js';
import { kontoAusAnfrage, istAuftragsId, Abgelehnt } from '../_lib/endo/pruefen.js';
import { pruefen } from '../_lib/endo/ablauf.js';
import { blob } from '../_lib/endo/blob.js';

export async function GET(request) {
  try {
    const kontoId = kontoAusAnfrage(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!istAuftragsId(id)) throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.');
    const { speicher, hf } = dienste();
    const r = await speicher.auftrag(id, kontoId);
    if (!r.ok) throw new Abgelehnt('unbekannt', 'Diesen Auftrag gibt es nicht.', 404);
    const erg = await pruefen({ auftrag: r.auftrag, hf, speicher, blob, basisUrl: basisUrl(request) });
    const konto = await speicher.konto(kontoId);
    return antwort(200, { ...erg, verfuegbar: konto.ok ? konto.verfuegbar : null });
  } catch (e) {
    return fehlerAntwort(e, 'status');
  }
}
