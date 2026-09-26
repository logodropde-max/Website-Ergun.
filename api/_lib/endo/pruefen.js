/* endo Studio – Prüfungen vor jedem Schritt: Testcode, Foto, Auftrag (nur erlaubte Felder und Werte),
   signierte Bestätigungskarten. Alles, was hier nicht ausdrücklich erlaubt ist, wird abgelehnt. */
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { imageSize } from 'image-size';
import { WERKZEUGE } from './werkzeuge.js';

export const FOTO = { maxBytes: 4 * 1024 * 1024, minKante: 800, maxKante: 8000 };
const FOTO_TYPEN = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class Abgelehnt extends Error {
  constructor(code, meldung, status = 400) { super(meldung); this.code = code; this.status = status; }
}

function gleich(a, b) {
  const x = createHash('sha256').update(String(a)).digest();
  const y = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(x, y);
}

/* Testmodus: nur mit ENDO_TEST_CODE (Header x-endo-code). Liefert die Konto-ID oder wirft. */
export function kontoAusAnfrage(request, env = process.env) {
  const soll = env.ENDO_TEST_CODE;
  const ist = request.headers.get('x-endo-code') || '';
  if (!soll || soll.length < 8) throw new Abgelehnt('nur-testmodus', 'Erzeugen ist gerade nur im Testmodus möglich.', 403);
  if (!ist || !gleich(ist, soll)) throw new Abgelehnt('nur-testmodus', 'Erzeugen ist gerade nur im Testmodus möglich.', 403);
  return 'test-emre';
}

/* Foto prüfen: echter Bildtyp (nicht nur Dateiendung), Größe, Auflösung. */
export function pruefeFoto(bytes) {
  const buf = Buffer.from(bytes);
  if (!buf.length) throw new Abgelehnt('foto-leer', 'Die Datei ist leer.');
  if (buf.length > FOTO.maxBytes) throw new Abgelehnt('foto-gross', 'Das Foto ist zu groß (höchstens 4 MB).', 413);
  let info;
  try { info = imageSize(buf); } catch (e) { throw new Abgelehnt('foto-typ', 'Bitte ein Foto als JPG, PNG oder WebP hochladen.', 415); }
  const typ = FOTO_TYPEN[info.type];
  if (!typ) throw new Abgelehnt('foto-typ', 'Bitte ein Foto als JPG, PNG oder WebP hochladen.', 415);
  let { width: b, height: h } = info;
  if (info.orientation && info.orientation >= 5) [b, h] = [h, b];
  if (Math.min(b, h) < FOTO.minKante) throw new Abgelehnt('foto-klein', `Das Foto ist zu klein – bitte mindestens ${FOTO.minKante} Pixel an der kurzen Seite.`);
  if (Math.max(b, h) > FOTO.maxKante) throw new Abgelehnt('foto-riesig', 'Das Foto ist zu groß in den Abmessungen.');
  return { typ, endung: info.type, breite: b, hoehe: h };
}

/* Nur Fotos aus unserem eigenen Speicher (Vercel Blob) sind als Vorlage erlaubt. */
export function erlaubteFotoUrl(url) {
  let u;
  try { u = new URL(String(url)); } catch (e) { return false; }
  return u.protocol === 'https:' && /\.public\.blob\.vercel-storage\.com$/.test(u.hostname) &&
    /^\/endo\/(fotos|ergebnisse)\/[a-z0-9._-]+$/i.test(u.pathname) && !u.search && !u.hash;
}

/* Auftrag prüfen: nur bekannte Felder, nur erlaubte Werte. presetIds = aktuell erlaubte Presets (live geholt). */
export function pruefeAuftrag(roh, { presetIds = [] } = {}) {
  if (!roh || typeof roh !== 'object' || Array.isArray(roh)) throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.');
  const erlaubt = new Set(['werkzeug', 'look', 'format', 'fotoUrl', 'presetId']);
  for (const k of Object.keys(roh)) if (!erlaubt.has(k)) throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.');
  const w = WERKZEUGE[roh.werkzeug];
  if (!w) throw new Abgelehnt('werkzeug', 'Dieses Werkzeug gibt es nicht.');
  if (!erlaubteFotoUrl(roh.fotoUrl)) throw new Abgelehnt('foto', 'Bitte zuerst ein Foto hochladen.');
  const auftrag = { werkzeug: roh.werkzeug, fotoUrl: roh.fotoUrl };
  if (w.looks) {
    if (!Object.hasOwn(w.looks, roh.look)) throw new Abgelehnt('look', 'Diesen Look gibt es nicht.');
    auftrag.look = roh.look;
  } else if (roh.look !== undefined) throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.');
  if (w.preset) {
    if (typeof roh.presetId !== 'string' || !UUID.test(roh.presetId) || !presetIds.includes(roh.presetId)) {
      throw new Abgelehnt('look', 'Diesen Look gibt es nicht (mehr).');
    }
    auftrag.presetId = roh.presetId;
  } else if (roh.presetId !== undefined) throw new Abgelehnt('ungueltig', 'Ungültiger Auftrag.');
  const format = roh.format === undefined ? w.formate[0] : roh.format;
  if (!w.formate.includes(format)) throw new Abgelehnt('format', 'Dieses Format gibt es für dieses Werkzeug nicht.');
  auftrag.format = format;
  return auftrag;
}

export function istAuftragsId(id) { return typeof id === 'string' && UUID.test(id); }

/* Schlüssel für Signaturen – vom geheimen Datenbank-Schlüssel abgeleitet (liegt nur auf dem Server). */
function signaturSchluessel(env = process.env) {
  const basis = env.ENDO_SIGNATUR || env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!basis) throw new Abgelehnt('einrichtung', 'endo ist noch nicht fertig eingerichtet.', 503);
  return createHash('sha256').update('endo-karte:' + basis).digest();
}

function b64(s) { return Buffer.from(s).toString('base64url'); }

/* Bestätigungskarte signieren: nur was hier drinsteht, darf später erzeugt werden. 10 Minuten gültig. */
export function signiereKarte(daten, env = process.env, jetzt = Date.now()) {
  const inhalt = b64(JSON.stringify({ ...daten, bis: jetzt + 10 * 60 * 1000 }));
  const sig = createHmac('sha256', signaturSchluessel(env)).update(inhalt).digest('base64url');
  return inhalt + '.' + sig;
}

export function pruefeKarte(token, kontoId, env = process.env, jetzt = Date.now()) {
  const [inhalt, sig] = String(token || '').split('.');
  if (!inhalt || !sig) throw new Abgelehnt('karte', 'Bitte den Auftrag neu bestätigen.');
  const soll = createHmac('sha256', signaturSchluessel(env)).update(inhalt).digest('base64url');
  if (!gleich(sig, soll)) throw new Abgelehnt('karte', 'Bitte den Auftrag neu bestätigen.');
  let d;
  try { d = JSON.parse(Buffer.from(inhalt, 'base64url').toString()); } catch (e) { throw new Abgelehnt('karte', 'Bitte den Auftrag neu bestätigen.'); }
  if (!d.bis || jetzt > d.bis) throw new Abgelehnt('karte-alt', 'Die Bestätigung ist abgelaufen – bitte noch einmal bestätigen.');
  if (d.kontoId !== kontoId) throw new Abgelehnt('karte', 'Bitte den Auftrag neu bestätigen.');
  return d;
}

/* Geheimer Teil der Webhook-Adresse (Higgsfield ruft ihn auf; wir prüfen danach trotzdem selbst den Status). */
export function webhookSchluessel(auftragId, env = process.env) {
  return createHmac('sha256', signaturSchluessel(env)).update('webhook:' + auftragId).digest('base64url').slice(0, 32);
}
export function pruefeWebhook(auftragId, k, env = process.env) {
  return istAuftragsId(auftragId) && typeof k === 'string' && gleich(k, webhookSchluessel(auftragId, env));
}
