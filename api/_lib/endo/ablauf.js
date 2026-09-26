/* endo Studio – der Ablauf eines Auftrags (Bauplan Phase C, Schritt 3).
   1. vorbereiten: prüfen + Preis holen → signierte Bestätigungskarte „Werkzeug · Look · Format · X Credits“
   2. starten:     Karte prüfen → Credits reservieren (Auftrags-ID = kein Doppelbuchen) → Higgsfield mit Webhook
   3. pruefen:     Status holen → fertig: Ergebnis in eigenen Speicher + abbuchen · failed: 1 kostenloser
                   Neuversuch, danach zurück · nsfw/canceled/Zeitüberschreitung: zurück
   Alle Abhängigkeiten (Speicher, Higgsfield, Blob) werden übergeben – so lässt sich alles testen. */
import { WERKZEUGE } from './werkzeuge.js';
import { Abgelehnt, pruefeAuftrag, signiereKarte, pruefeKarte, istAuftragsId, webhookSchluessel } from './pruefen.js';

export const MAX_VERSUCHE = 2; // erster Versuch + 1 kostenloser Neuversuch
const START_FRIST_MS = 3 * 60 * 1000;

export const MELDUNGEN = {
  nsfw: 'Dieses Motiv können wir leider nicht erstellen. Ihre Credits sind zurückgebucht.',
  failed: 'Das hat leider nicht geklappt – auch der zweite Versuch nicht. Ihre Credits sind zurückgebucht.',
  canceled: 'Der Auftrag wurde abgebrochen. Ihre Credits sind zurückgebucht.',
  zeit: 'Das hat zu lange gedauert. Ihre Credits sind zurückgebucht – versuchen Sie es gern noch einmal.',
  start: 'Der Auftrag konnte nicht gestartet werden. Ihre Credits sind zurückgebucht.',
  ergebnis: 'Das Ergebnis war fehlerhaft. Ihre Credits sind zurückgebucht.'
};

const RESERVIER_GRUENDE = {
  zu_wenig_credits: (r) => new Abgelehnt('credits', `Dafür reichen Ihre Credits nicht (verfügbar: ${r.verfuegbar ?? 0}).`, 402),
  limit_stunde: () => new Abgelehnt('limit', 'Sie haben in dieser Stunde schon viele Aufträge gestartet – bitte etwas später weitermachen.', 429),
  limit_tag: () => new Abgelehnt('limit', 'Für heute ist Ihr Tageslimit erreicht – morgen geht es weiter.', 429),
  tageslimit: () => new Abgelehnt('tageslimit', 'endo ist für heute ausgelastet – morgen geht es weiter.', 429),
  kein_konto: () => new Abgelehnt('konto', 'Konto nicht gefunden.', 403),
  fremde_id: () => new Abgelehnt('ungueltig', 'Ungültiger Auftrag.'),
  ungueltig: () => new Abgelehnt('ungueltig', 'Ungültiger Auftrag.')
};

function lookName(w, auftrag, presets) {
  if (w.preset) return (presets.find((p) => p.id === auftrag.presetId) || {}).name || 'Look';
  return w.looks ? w.looks[auftrag.look].name : '';
}

/* 1. Vorbereiten: Auftrag prüfen, echten Preis holen, Guthaben prüfen, Karte signieren. */
export async function vorbereiten({ kontoId, roh, hf, speicher, env = process.env, jetzt = Date.now() }) {
  const w = WERKZEUGE[roh && roh.werkzeug];
  const presets = w && w.preset ? await hf.presets() : [];
  const auftrag = pruefeAuftrag(roh, { presetIds: presets.map((p) => p.id) });
  const eingabe = w.eingabe(auftrag);

  let preis = null;
  try { preis = await hf.preis(w.modell, eingabe); } catch (e) { preis = null; }
  if (preis && preis.usd > w.maxUsd) throw new Abgelehnt('preis', 'Dieses Werkzeug ist gerade nicht verfügbar.', 503);
  const kostenUsd = Math.max(w.listenUsd, preis ? preis.listenUsd : 0);

  const konto = await speicher.konto(kontoId);
  if (!konto.ok) throw new Abgelehnt('konto', 'Konto nicht gefunden.', 403);
  if (konto.verfuegbar < w.credits) {
    throw new Abgelehnt('credits', `Dafür reichen Ihre Credits nicht (verfügbar: ${konto.verfuegbar}).`, 402);
  }

  const look = lookName(w, auftrag, presets);
  const formatText = auftrag.format === 'auto' || auftrag.format === 'bild' ? '' : auftrag.format;
  const teile = [w.name, look, formatText, auftrag.ueberschrift ? `„${auftrag.ueberschrift}“` : '', `${w.credits} Credits`].filter(Boolean);
  return {
    karte: { werkzeug: auftrag.werkzeug, name: w.name, look, format: auftrag.format, ueberschrift: auftrag.ueberschrift || '', credits: w.credits, text: teile.join(' · '), foto: auftrag.fotoUrl },
    token: signiereKarte({ kontoId, auftrag, credits: w.credits, kostenUsd }, env, jetzt)
  };
}

/* 2. Starten: nur mit gültiger Karte; gleiche Auftrags-ID startet nie zweimal. */
export async function starten({ kontoId, token, auftragId, hf, speicher, basisUrl, env = process.env, jetzt = Date.now() }) {
  if (!istAuftragsId(auftragId)) throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.');
  const karte = pruefeKarte(token, kontoId, env, jetzt);
  const w = WERKZEUGE[karte.auftrag && karte.auftrag.werkzeug];
  if (!w || karte.credits !== w.credits) throw new Abgelehnt('karte', 'Bitte den Auftrag neu bestätigen.');
  const presets = w.preset ? await hf.presets() : [];
  const auftrag = pruefeAuftrag(karte.auftrag, { presetIds: presets.map((p) => p.id) });

  const r = await speicher.reservieren({ auftragId, kontoId, werkzeug: auftrag.werkzeug, credits: w.credits, kostenUsd: karte.kostenUsd, eingabe: auftrag });
  if (!r.ok) throw (RESERVIER_GRUENDE[r.grund] || RESERVIER_GRUENDE.ungueltig)(r);
  if (r.doppelt) return antwortAus(r.auftrag); // zweiter Klick: nichts neu starten

  const webhookUrl = `${basisUrl}/api/endo/webhook?a=${auftragId}&k=${webhookSchluessel(auftragId, env)}`;
  let requestId = null;
  for (let versuch = 0; versuch < 2 && !requestId; versuch++) {
    try { requestId = await hf.starten(w.modell, w.eingabe(auftrag), webhookUrl); }
    catch (e) { if (e.status && e.status < 500 && e.status !== 429) break; } // Eingabefehler: kein zweiter Versuch
  }
  if (!requestId) {
    const z = await speicher.zurueck(auftragId, 'start');
    return antwortAus(z.auftrag);
  }
  const g = await speicher.gestartet(auftragId, requestId, 1);
  return antwortAus(g.ok ? g.auftrag : r.auftrag);
}

/* 3. Prüfen/abschließen – von Statusabfrage, Webhook und Cron aufgerufen; mehrfach gleichzeitig ist sicher. */
export async function pruefen({ auftrag: a, hf, speicher, blob, basisUrl = null, env = process.env, jetzt = Date.now() }) {
  if (!a || a.status === 'fertig' || a.status === 'zurueck') return antwortAus(a);
  const w = WERKZEUGE[a.werkzeug];
  const alter = jetzt - new Date(a.erstellt).getTime();
  const seitAenderung = jetzt - new Date(a.aktualisiert || a.erstellt).getTime();

  if (!w) return antwortAus((await speicher.zurueck(a.id, 'start')).auftrag);
  if (!a.hf_request_id || a.hf_request_id.startsWith('neuversuch:')) {
    // Start bzw. Neuversuch läuft gerade bei einem anderen Aufruf – oder ist abgestürzt
    if (seitAenderung > START_FRIST_MS) return antwortAus((await speicher.zurueck(a.id, 'start')).auftrag);
    return antwortAus(a);
  }

  let st;
  try { st = await hf.status(a.hf_request_id); }
  catch (e) {
    // Higgsfield antwortet nicht: später erneut – aber nicht ewig
    if (alter > 2 * w.minuten * 60 * 1000) return antwortAus((await speicher.zurueck(a.id, 'zeit')).auftrag);
    return antwortAus(a);
  }

  if (st.status === 'completed') {
    const quelle = st.urls[0];
    if (!quelle || !/^https:\/\//.test(quelle)) return antwortAus((await speicher.zurueck(a.id, 'ergebnis')).auftrag);
    let kopie;
    try { kopie = await blob.kopieren(quelle, `endo/ergebnisse/${a.id}`); }
    catch (e) { return antwortAus(a); } // Speichern klappte nicht – nächster Aufruf versucht es wieder
    return antwortAus((await speicher.abschliessen(a.id, kopie)).auftrag);
  }

  if (st.status === 'failed') {
    const n = await speicher.neuversuch(a.id, a.hf_request_id, MAX_VERSUCHE);
    if (n.ok) {
      try {
        const webhookUrl = basisUrl ? `${basisUrl}/api/endo/webhook?a=${a.id}&k=${webhookSchluessel(a.id, env)}` : null;
        const neu = await hf.starten(w.modell, w.eingabe(a.eingabe), webhookUrl);
        return antwortAus((await speicher.gestartet(a.id, neu, n.auftrag.versuch)).auftrag);
      } catch (e) {
        return antwortAus((await speicher.zurueck(a.id, 'failed')).auftrag);
      }
    }
    if (a.versuch >= MAX_VERSUCHE) return antwortAus((await speicher.zurueck(a.id, 'failed')).auftrag);
    return antwortAus(a); // ein anderer Aufruf hat den Neuversuch schon übernommen
  }

  if (st.status === 'nsfw') return antwortAus((await speicher.zurueck(a.id, 'nsfw')).auftrag);
  if (st.status === 'canceled') return antwortAus((await speicher.zurueck(a.id, 'canceled')).auftrag);

  if (alter > w.minuten * 60 * 1000) {
    await hf.abbrechen(a.hf_request_id);
    return antwortAus((await speicher.zurueck(a.id, 'zeit')).auftrag);
  }
  return antwortAus(a);
}

/* Was der Browser zu sehen bekommt – nie Request-IDs, Kosten oder Eingaben. */
export function antwortAus(a) {
  if (!a) return { status: 'unbekannt' };
  const w = WERKZEUGE[a.werkzeug] || {};
  const status = a.status === 'fertig' ? 'fertig' : a.status === 'zurueck' ? 'zurueck' : 'laeuft';
  const aus = { auftragId: a.id, status, werkzeug: a.werkzeug, art: w.art || 'bild', credits: a.credits };
  if (status === 'fertig') aus.ergebnisUrl = a.ergebnis_url;
  if (status === 'zurueck') aus.meldung = MELDUNGEN[a.fehler] || MELDUNGEN.failed;
  if (status === 'laeuft') aus.versuch = a.versuch;
  return aus;
}
