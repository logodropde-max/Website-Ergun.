/* endo Studio – gemeinsame Hilfen für die Funktionen unter api/endo/. */
import { createHash } from 'node:crypto';
import { Abgelehnt, kontoAusAnfrage as testKonto } from './pruefen.js';
import { speicherAusUmgebung } from './speicher.js';
import { higgsfieldAusUmgebung } from './higgsfield.js';
import { authAusUmgebung, AnmeldeFehler } from './anmeldung.js';

/* Wer fragt? 1. Emre mit Test-Codewort → Test-Konto. 2. Angemeldeter Kunde (Kopf x-endo-sitzung) → sein Konto
   (beim ersten Mal mit 0 Credits angelegt). Sonst: null (Besucher). */
export async function kontoOderNull(request, { speicher, auth } = {}) {
  try { return testKonto(request); } catch (e) { /* kein Test-Codewort */ }
  const token = request.headers.get('x-endo-sitzung');
  if (!token || !auth || !speicher) return null;
  const nutzer = await auth.nutzer(token);
  if (!nutzer) return null;
  const id = 'u-' + nutzer.id;
  await speicher.kontoSicherstellen(id, nutzer.mail);
  return id;
}
export async function kontoPflicht(request, dienste) {
  const id = await kontoOderNull(request, dienste);
  if (!id) throw new Abgelehnt('anmelden', 'Bitte melden Sie sich an, um endo Studio zu nutzen.', 401);
  return id;
}

/* Besucher wiedererkennen ohne Cookies: Hash aus IP + Server-Schlüssel (nicht umkehrbar) */
export function besucherHash(request, env = process.env) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unbekannt';
  return createHash('sha256').update('endo-besucher:' + (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '') + ':' + ip).digest('hex').slice(0, 32);
}

export function antwort(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

/* Fehler → freundliche Antwort. Interne Details landen nur im Vercel-Log, nie beim Besucher. */
export function fehlerAntwort(e, wo) {
  if (e instanceof Abgelehnt || e instanceof AnmeldeFehler) return antwort(e.status, { fehler: e.code, meldung: e.message });
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
let authEinmal;
export function dienste() {
  const speicher = speicherAusUmgebung();
  const hf = higgsfieldAusUmgebung();
  if (!speicher || !hf) throw new Abgelehnt('einrichtung', 'endo ist noch nicht fertig eingerichtet.', 503);
  if (authEinmal === undefined) authEinmal = authAusUmgebung(); // einmal pro Funktion (Token-Zwischenspeicher bleibt erhalten)
  return { speicher, hf, auth: authEinmal };
}
