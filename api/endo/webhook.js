/* endo Studio – Higgsfield meldet: Auftrag fertig/fehlgeschlagen. Die Adresse enthält einen geheimen Schlüssel
   pro Auftrag. Dem Inhalt der Meldung wird nicht vertraut: wir fragen den Status selbst bei Higgsfield ab
   und schließen dann genau einmal ab (abbuchen bzw. zurückbuchen). */
import { antwort, dienste, basisUrl } from '../_lib/endo/http.js';
import { pruefeWebhook } from '../_lib/endo/pruefen.js';
import { pruefen } from '../_lib/endo/ablauf.js';
import { blob } from '../_lib/endo/blob.js';

export async function POST(request) {
  const p = new URL(request.url).searchParams;
  const id = p.get('a');
  if (!pruefeWebhook(id, p.get('k'))) return antwort(401, { ok: false });
  try {
    const { speicher, hf } = dienste();
    const r = await speicher.auftragIntern(id);
    if (r.ok) await pruefen({ auftrag: r.auftrag, hf, speicher, blob, basisUrl: basisUrl(request) });
  } catch (e) {
    console.error('endo webhook:', e && e.message); // Statusabfrage und Cron holen es nach
  }
  return antwort(200, { ok: true });
}
