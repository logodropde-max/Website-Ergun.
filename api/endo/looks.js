/* endo Studio – Looks für ein Werkzeug (für die Look-Karten im Chat).
   Eigene Looks aus der Werkzeug-Tabelle; bei „anzeige“ die Presets live von Higgsfield (1 h zwischengespeichert,
   ohne erfundene Bewertungen). Öffentlich lesbar – es wird nichts erzeugt und nichts gebucht. */
import { antwort, fehlerAntwort } from '../_lib/endo/http.js';
import { WERKZEUGE, looksFuer } from '../_lib/endo/werkzeuge.js';
import { higgsfieldAusUmgebung } from '../_lib/endo/higgsfield.js';
import { Abgelehnt } from '../_lib/endo/pruefen.js';

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get('werkzeug');
    const w = WERKZEUGE[id];
    if (!w) throw new Abgelehnt('werkzeug', 'Dieses Werkzeug gibt es nicht.', 404);
    let looks = looksFuer(id);
    if (w.preset) {
      const hf = higgsfieldAusUmgebung();
      if (!hf) throw new Abgelehnt('einrichtung', 'endo ist noch nicht fertig eingerichtet.', 503);
      looks = (await hf.presets()).map((p) => ({ id: p.id, name: p.name, text: p.gruppe, bild: p.bild, format: p.format }));
    }
    return antwort(200, { werkzeug: id, name: w.name, credits: w.credits, formate: w.formate, looks });
  } catch (e) {
    return fehlerAntwort(e, 'looks');
  }
}
