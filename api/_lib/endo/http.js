/* endo Studio – gemeinsame Hilfen für die Funktionen unter api/endo/. */
import { Abgelehnt } from './pruefen.js';
import { speicherAusUmgebung } from './speicher.js';
import { higgsfieldAusUmgebung } from './higgsfield.js';

export function antwort(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

/* Fehler → freundliche Antwort. Interne Details landen nur im Vercel-Log, nie beim Besucher. */
export function fehlerAntwort(e, wo) {
  if (e instanceof Abgelehnt) return antwort(e.status, { fehler: e.code, meldung: e.message });
  console.error(`endo ${wo}:`, e && e.message);
  return antwort(500, { fehler: 'intern', meldung: 'Da ist etwas schiefgegangen. Bitte versuchen Sie es gleich noch einmal.' });
}

/* Nur Anfragen von der eigenen Seite (einfacher Schutz gegen fremde Nutzung). */
export function vonEigenerSeite(request) {
  const host = request.headers.get('host') || '';
  const herkunft = request.headers.get('origin') || request.headers.get('referer') || '';
  if (!herkunft) return false;
  try { return new URL(herkunft).host === host; } catch (e) { return false; }
}

export function basisUrl(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  return 'https://' + host;
}

/* Speicher + Higgsfield aus den Vercel-Variablen – fehlt etwas, sagen wir es ehrlich. */
export function dienste() {
  const speicher = speicherAusUmgebung();
  const hf = higgsfieldAusUmgebung();
  if (!speicher || !hf) throw new Abgelehnt('einrichtung', 'endo ist noch nicht fertig eingerichtet.', 503);
  return { speicher, hf };
}
