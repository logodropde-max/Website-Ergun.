/* endo Studio – Kundenkonto an einer Stelle (Vercel Hobby erlaubt nur 12 Funktionen, darum alles in einer Datei).
   GET  ?aktion=ich            → Konto + Guthaben (Test-Codewort oder Sitzung im Kopf x-endo-sitzung)
   GET  ?aktion=dateien        → „Meine Ergebnisse“ + „Meine Fotos“ der letzten 90 Tage
   POST ?aktion=registrieren   { mail, passwort }  → Sitzung oder „bitte E-Mail bestätigen“
   POST ?aktion=anmelden       { mail, passwort }  → Sitzung
   POST ?aktion=erneuern       { refresh }         → neue Sitzung
   POST ?aktion=abmelden                           → Sitzung beenden
   POST ?aktion=passwort-vergessen { mail }        → E-Mail mit Link (Antwort verrät nicht, ob es das Konto gibt)
   POST ?aktion=passwort-neu   { passwort }        → neues Passwort (Sitzung aus dem E-Mail-Link)
   POST ?aktion=datei-loeschen { art: ergebnis|foto, id } → aus dem Konto und aus dem Speicher löschen
   Passwörter gehen nur an Supabase Auth, nie in unsere Datenbank oder ins Log. */
import { del } from '@vercel/blob';
import { antwort, fehlerAntwort, vonEigenerSeite, dienste, kontoPflicht, besucherHash, basisUrl } from './_lib/endo/http.js';
import { Abgelehnt } from './_lib/endo/pruefen.js';

export const AUFBEWAHRUNG_TAGE = 90;

function authPflicht(auth) {
  if (!auth) throw new Abgelehnt('einrichtung', 'Anmelden ist noch nicht eingerichtet.', 503);
  return auth;
}

async function kontoDaten(speicher, kontoId, mail) {
  const k = await speicher.konto(kontoId);
  if (!k.ok) throw new Abgelehnt('konto', 'Konto nicht gefunden.', 404);
  return { name: k.name, mail: mail || null, credits: k.credits, verfuegbar: k.verfuegbar, test: k.test };
}

export async function GET(request) {
  try {
    const d = dienste();
    const aktion = new URL(request.url).searchParams.get('aktion') || 'ich';
    const kontoId = await kontoPflicht(request, d);
    if (aktion === 'ich') return antwort(200, await kontoDaten(d.speicher, kontoId));
    if (aktion === 'dateien') return antwort(200, { tage: AUFBEWAHRUNG_TAGE, ...(await d.speicher.meineDateien(kontoId, AUFBEWAHRUNG_TAGE)) });
    throw new Abgelehnt('aktion', 'Unbekannte Aktion.', 404);
  } catch (e) {
    return fehlerAntwort(e, 'konto');
  }
}

export async function POST(request) {
  try {
    if (!vonEigenerSeite(request)) throw new Abgelehnt('nicht-erlaubt', 'Nicht erlaubt.', 403);
    const d = dienste();
    const aktion = new URL(request.url).searchParams.get('aktion') || '';
    let body = {};
    try { body = (await request.json()) || {}; } catch (e) { body = {}; }
    const weiter = basisUrl(request) + '/ki/';
    const sitzungKopf = request.headers.get('x-endo-sitzung') || '';

    // Schutz gegen Durchprobieren: Anmelde-Versuche pro Besucher und Tag begrenzen
    if (['registrieren', 'anmelden', 'passwort-vergessen'].includes(aktion)) {
      const z = await d.speicher.chatZaehlen('anmelden:' + besucherHash(request));
      if (z && z.ok === false) throw new Abgelehnt('zu-viele', 'Zu viele Versuche für heute. Bitte morgen noch einmal.', 429);
    }

    switch (aktion) {
      case 'registrieren': {
        const erg = await authPflicht(d.auth).registrieren(body.mail, body.passwort, weiter);
        return antwort(200, erg);
      }
      case 'anmelden': {
        const erg = await authPflicht(d.auth).anmelden(body.mail, body.passwort);
        return antwort(200, erg);
      }
      case 'erneuern':
        return antwort(200, await authPflicht(d.auth).erneuern(body.refresh));
      case 'abmelden':
        return antwort(200, await authPflicht(d.auth).abmelden(sitzungKopf));
      case 'passwort-vergessen':
        await authPflicht(d.auth).passwortVergessen(body.mail, weiter);
        return antwort(200, { ok: true });
      case 'passwort-neu':
        if (!sitzungKopf) throw new Abgelehnt('sitzung', 'Der Link ist abgelaufen. Bitte fordern Sie einen neuen an.', 401);
        return antwort(200, await authPflicht(d.auth).passwortSetzen(sitzungKopf, body.passwort));
      case 'datei-loeschen': {
        const kontoId = await kontoPflicht(request, d);
        const art = body.art === 'foto' ? 'foto' : body.art === 'ergebnis' ? 'ergebnis' : null;
        if (!art || !body.id || String(body.id).length > 64) throw new Abgelehnt('ungueltig', 'Ungültige Datei.');
        const r = await d.speicher.dateiLoeschen(kontoId, art, body.id);
        if (!r.ok) throw new Abgelehnt('nicht-gefunden', 'Diese Datei gibt es nicht mehr.', 404);
        if (r.url) { try { await del(r.url); } catch (e) { console.error('endo datei-loeschen:', e && e.message); } }
        return antwort(200, { ok: true });
      }
      default:
        throw new Abgelehnt('aktion', 'Unbekannte Aktion.', 404);
    }
  } catch (e) {
    return fehlerAntwort(e, 'konto');
  }
}
