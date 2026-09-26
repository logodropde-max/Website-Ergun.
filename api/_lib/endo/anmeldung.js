/* endo Studio – Kundenkonten: Registrieren, Anmelden, Abmelden, Passwort vergessen (Emre, 26.09.2026).
   Läuft über Supabase Auth (E-Mail + Passwort). Passwörter sieht und speichert nur Supabase, nie unser Code.
   Der Browser schickt die Sitzung im eigenen Kopf „x-endo-sitzung“ – nicht in „Authorization“, weil dort der
   Privat-Schalter (Seitenpasswort) seine Anmeldung trägt. Konto-ID bei uns: 'u-' + Supabase-Nutzer-ID. */
const MAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export function authAusUmgebung(env = process.env) {
  const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const schluessel = env.SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && schluessel ? erstelleAuth(url, schluessel) : null;
}

export class AnmeldeFehler extends Error {
  constructor(code, meldung, status = 400) { super(meldung); this.code = code; this.status = status; }
}

const MELDUNGEN = {
  invalid_credentials: 'E-Mail oder Passwort stimmt nicht.',
  email_not_confirmed: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse – der Link liegt in Ihrem Postfach.',
  user_already_exists: 'Für diese E-Mail gibt es schon ein Konto. Bitte melden Sie sich an.',
  email_exists: 'Für diese E-Mail gibt es schon ein Konto. Bitte melden Sie sich an.',
  weak_password: 'Das Passwort ist zu schwach – bitte mindestens 8 Zeichen mit Buchstaben und Zahlen.',
  over_email_send_rate_limit: 'Gerade wurden zu viele E-Mails verschickt. Bitte versuchen Sie es in einer Stunde noch einmal.',
  over_request_rate_limit: 'Zu viele Versuche – bitte kurz warten.',
  signup_disabled: 'Registrieren ist gerade nicht möglich.'
};

export function pruefeMail(roh) {
  const m = String(roh || '').trim().toLowerCase();
  if (!MAIL.test(m)) throw new AnmeldeFehler('mail', 'Bitte eine gültige E-Mail-Adresse eingeben.');
  return m;
}
export function pruefePasswort(roh) {
  const p = String(roh || '');
  if (p.length < 8 || p.length > 72 || !/[A-Za-zÄÖÜäöüß]/.test(p) || !/\d/.test(p)) {
    throw new AnmeldeFehler('passwort', 'Das Passwort braucht mindestens 8 Zeichen mit Buchstaben und Zahlen.');
  }
  return p;
}

export function erstelleAuth(url, schluessel, fetchFn = fetch) {
  const cache = new Map(); // Token → { nutzer, bis } – spart Aufrufe bei der Statusabfrage

  async function aufruf(pfad, { methode = 'POST', body, token } = {}) {
    const kopf = { apikey: schluessel, 'content-type': 'application/json' };
    if (token) kopf.authorization = 'Bearer ' + token;
    const res = await fetchFn(url + '/auth/v1' + pfad, { method: methode, headers: kopf, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    let d = {};
    try { d = text ? JSON.parse(text) : {}; } catch (e) { d = {}; }
    if (!res.ok) {
      const code = d.error_code || d.code || d.error || '';
      throw new AnmeldeFehler(String(code), MELDUNGEN[code] || (res.status === 429 ? MELDUNGEN.over_request_rate_limit : 'Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.'), res.status >= 500 ? 502 : 400);
    }
    return d;
  }

  function sitzung(d) {
    if (!d || !d.access_token) return null;
    return { access: d.access_token, refresh: d.refresh_token, bis: Date.now() + (Number(d.expires_in) || 3600) * 1000, mail: d.user && d.user.email };
  }

  return {
    async registrieren(mail, passwort, weiterleitung) {
      const d = await aufruf('/signup' + (weiterleitung ? '?redirect_to=' + encodeURIComponent(weiterleitung) : ''), { body: { email: pruefeMail(mail), password: pruefePasswort(passwort) } });
      return { sitzung: sitzung(d), bestaetigen: !d.access_token };
    },
    async anmelden(mail, passwort) {
      const d = await aufruf('/token?grant_type=password', { body: { email: pruefeMail(mail), password: String(passwort || '') } });
      return { sitzung: sitzung(d) };
    },
    async erneuern(refresh) {
      if (!refresh) throw new AnmeldeFehler('sitzung', 'Bitte melden Sie sich neu an.', 401);
      const d = await aufruf('/token?grant_type=refresh_token', { body: { refresh_token: String(refresh) } });
      return { sitzung: sitzung(d) };
    },
    async abmelden(token) {
      if (token) { try { await aufruf('/logout', { token }); } catch (e) { /* schon abgemeldet */ } }
      cache.delete(token);
      return { ok: true };
    },
    async passwortVergessen(mail, weiterleitung) {
      await aufruf('/recover' + (weiterleitung ? '?redirect_to=' + encodeURIComponent(weiterleitung) : ''), { body: { email: pruefeMail(mail) } });
      return { ok: true }; // immer gleiche Antwort – verrät nicht, ob es das Konto gibt
    },
    async passwortSetzen(token, passwort) {
      await aufruf('/user', { methode: 'PUT', token, body: { password: pruefePasswort(passwort) } });
      cache.delete(token);
      return { ok: true };
    },
    /* Wer ist angemeldet? null, wenn das Token ungültig/abgelaufen ist. */
    async nutzer(token, jetzt = Date.now()) {
      if (!token || typeof token !== 'string' || token.length > 4096) return null;
      const c = cache.get(token);
      if (c && c.bis > jetzt) return c.nutzer;
      try {
        const d = await aufruf('/user', { methode: 'GET', token });
        if (!d || !d.id) return null;
        const nutzer = { id: d.id, mail: d.email || '' };
        cache.set(token, { nutzer, bis: jetzt + 60 * 1000 });
        if (cache.size > 500) cache.delete(cache.keys().next().value);
        return nutzer;
      } catch (e) {
        return null;
      }
    }
  };
}
