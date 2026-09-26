/* endo Studio – Speicher für Konten, Credits und Aufträge.
   Liegt unter api/_lib: Vercel macht daraus keine Funktion und liefert die Datei nicht öffentlich aus.
   Die eigentliche Logik (Sperren, Prüfen, Buchen) steckt in den Postgres-Funktionen aus
   _code/werkzeuge/endo-datenbank/schema.sql; hier wird nur aufgerufen und ausgewertet.
   Umgebung (nur in Vercel, von der Supabase-Integration angelegt): SUPABASE_URL oder NEXT_PUBLIC_SUPABASE_URL
   + SUPABASE_SECRET_KEY (oder SUPABASE_SERVICE_ROLE_KEY). */
import { LIMITS } from './limits.js';

/* Speicher auf Basis einer rpc(name, argumente)-Funktion.
   In Vercel: Supabase-REST. In den Tests: PGlite (Postgres im Speicher). */
export function erstelleSpeicher(rpc) {
  return {
    /* Credits für einen Auftrag reservieren. Gleiche auftragId → keine zweite Buchung. */
    reservieren({ auftragId, kontoId, werkzeug, credits, kostenUsd, eingabe = {} }) {
      return rpc('endo_reservieren', {
        p_auftrag: auftragId, p_konto: kontoId, p_werkzeug: werkzeug, p_credits: credits,
        p_kosten_usd: kostenUsd, p_eingabe: eingabe,
        p_max_stunde: LIMITS.auftraegeProStunde, p_max_tag: LIMITS.auftraegeProTag,
        p_tageslimit_usd: LIMITS.tageslimitUsd()
      });
    },
    gestartet(auftragId, hfRequestId, versuch) {
      return rpc('endo_gestartet', { p_auftrag: auftragId, p_hf_request_id: hfRequestId, p_versuch: versuch });
    },
    /* Kostenlosen Neuversuch beanspruchen – gelingt nur einem Aufrufer je alter Request-ID. */
    neuversuch(auftragId, alterRequest, maxVersuche = 2) {
      return rpc('endo_neuversuch', { p_auftrag: auftragId, p_alter_request: alterRequest, p_max_versuche: maxVersuche });
    },
    /* Erfolg: Credits endgültig abbuchen (mehrfacher Aufruf bucht nur einmal). */
    abschliessen(auftragId, ergebnisUrl) {
      return rpc('endo_abschliessen', { p_auftrag: auftragId, p_ergebnis_url: ergebnisUrl });
    },
    /* Kein Erfolg: Credits und Tageskosten zurück (mehrfacher Aufruf bucht nur einmal). */
    zurueck(auftragId, grund) {
      return rpc('endo_zurueck', { p_auftrag: auftragId, p_grund: grund });
    },
    chatkosten(usd) {
      return rpc('endo_chatkosten', { p_usd: usd, p_tageslimit_usd: LIMITS.tageslimitUsd() });
    },
    /* Nachricht eines Besuchers zählen; ok=false heißt: Tageslimit für diesen Besucher erreicht. */
    chatZaehlen(besucherHash) {
      return rpc('endo_chat_zaehlen', { p_besucher: besucherHash, p_max: LIMITS.chatNachrichtenProTag });
    },
    auftrag(auftragId, kontoId) {
      return rpc('endo_auftrag', { p_auftrag: auftragId, p_konto: kontoId });
    },
    /* Nur für Webhook und Cron (kennen kein Konto) – nie mit Browser-Eingaben ohne Prüfung aufrufen. */
    auftragIntern(auftragId) {
      return rpc('endo_auftrag_intern', { p_auftrag: auftragId });
    },
    konto(kontoId) {
      return rpc('endo_konto', { p_konto: kontoId });
    },
    offene(minuten) {
      return rpc('endo_offene', { p_minuten: minuten });
    }
  };
}

/* rpc über die Supabase-REST-Schnittstelle (PostgREST). Der geheime Schlüssel bleibt auf dem Server. */
export function supabaseRpc(url, schluessel, fetchFn = fetch) {
  const basis = String(url).replace(/\/+$/, '') + '/rest/v1/rpc/';
  const kopf = { apikey: schluessel, 'Content-Type': 'application/json' };
  if (schluessel.startsWith('eyJ')) kopf.Authorization = 'Bearer ' + schluessel; // alter service_role-Schlüssel (JWT)
  return async (name, argumente) => {
    const res = await fetchFn(basis + name, { method: 'POST', headers: kopf, body: JSON.stringify(argumente) });
    const text = await res.text();
    if (!res.ok) throw new Error(`Datenbank ${res.status} bei ${name}: ${text.slice(0, 200)}`);
    return JSON.parse(text);
  };
}

/* Speicher aus den Vercel-Umgebungsvariablen; null, wenn die Datenbank (noch) fehlt. */
export function speicherAusUmgebung(env = process.env) {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL; // die Vercel-Integration legt teils nur NEXT_PUBLIC_… an
  const schluessel = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !schluessel) return null;
  return erstelleSpeicher(supabaseRpc(url, schluessel));
}
