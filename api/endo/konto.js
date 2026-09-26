/* endo Studio – Guthaben für das Credit-Fenster (Testmodus: nur mit ENDO_TEST_CODE). */
import { antwort, fehlerAntwort, dienste } from '../_lib/endo/http.js';
import { kontoAusAnfrage } from '../_lib/endo/pruefen.js';

export async function GET(request) {
  try {
    const kontoId = kontoAusAnfrage(request);
    const { speicher } = dienste();
    const k = await speicher.konto(kontoId);
    return antwort(k.ok ? 200 : 404, k.ok ? { name: k.name, credits: k.credits, verfuegbar: k.verfuegbar, test: k.test } : { fehler: 'konto' });
  } catch (e) {
    return fehlerAntwort(e, 'konto');
  }
}
