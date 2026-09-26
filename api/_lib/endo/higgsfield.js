/* endo Studio – Anbindung an die offizielle Higgsfield-API (api.higgsfield.ai, Pay-per-Use mit Cashback).
   Nie das Abo/den Connector. Schlüssel nur aus der Vercel-Variable HF_CREDENTIALS (Format ID:SECRET).
   Auftrag starten, Status holen, Preis vorab (/estimate), abbrechen, Presets von Marketing Studio. */
import { PRESET_GRUPPEN_GESPERRT } from './werkzeuge.js';

const API = 'https://api.higgsfield.ai';

export function higgsfieldAusUmgebung(env = process.env, fetchFn = fetch) {
  const schluessel = (env.HF_CREDENTIALS || env.HF_KEY || '').trim();
  if (!/^[^:\s]+:[^:\s]+$/.test(schluessel)) return null;
  return erstelleHiggsfield(schluessel, fetchFn);
}

export function erstelleHiggsfield(schluessel, fetchFn = fetch) {
  const kopf = { Authorization: 'Key ' + schluessel };

  async function anfrage(methode, pfad, body) {
    const res = await fetchFn(API + pfad, {
      method: methode,
      headers: body ? { ...kopf, 'Content-Type': 'application/json' } : kopf,
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    let daten = null;
    try { daten = text ? JSON.parse(text) : null; } catch (e) { daten = { roh: text.slice(0, 200) }; }
    if (!res.ok) {
      const err = new Error(`Higgsfield ${res.status} bei ${methode} ${pfad.split('?')[0]}`);
      err.status = res.status; err.daten = daten;
      throw err;
    }
    return daten;
  }

  let presetCache = null;

  return {
    /* Preis in $ vorab – kostenlos. Liefert null, wenn Higgsfield nur eine Beschreibung schickt. */
    async preis(modell, eingabe) {
      const d = await anfrage('POST', '/estimate/' + modell, eingabe);
      const usd = Number(d && d.usd);
      const rabatt = Number(d && d.discount && d.discount.usd) || 0;
      return Number.isFinite(usd) ? { usd, listenUsd: usd + rabatt } : null;
    },
    /* Auftrag starten; Higgsfield meldet das Ende an webhookUrl (wir prüfen danach selbst den Status). */
    async starten(modell, eingabe, webhookUrl) {
      const pfad = '/' + modell + (webhookUrl ? '?hf_webhook=' + encodeURIComponent(webhookUrl) : '');
      const d = await anfrage('POST', pfad, eingabe);
      if (!d || !d.request_id) throw new Error('Higgsfield: keine request_id');
      return d.request_id;
    },
    async status(requestId) {
      const d = await anfrage('GET', '/requests/' + encodeURIComponent(requestId) + '/status');
      const urls = [];
      for (const b of (d && d.images) || []) if (b && b.url) urls.push(b.url);
      if (d && d.video && d.video.url) urls.push(d.video.url);
      return { status: d && d.status, urls, fehler: d && d.error };
    },
    async abbrechen(requestId) {
      try { await anfrage('POST', '/requests/' + encodeURIComponent(requestId) + '/cancel'); return true; }
      catch (e) { return false; }
    },
    /* Presets (Werbeanzeigen) live holen, 1 Stunde zwischenspeichern, gesperrte Gruppen entfernen. */
    async presets(jetzt = Date.now()) {
      if (presetCache && jetzt - presetCache.zeit < 60 * 60 * 1000) return presetCache.liste;
      const liste = [];
      let cursor = null, seiten = 0;
      do {
        const d = await anfrage('GET', '/marketing-studio/image/presets?size=50' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''));
        for (const p of (d && d.items) || []) {
          const gruppe = (p.metadata && p.metadata.group_name) || '';
          if (PRESET_GRUPPEN_GESPERRT.includes(gruppe)) continue;
          if (!p.id || !p.cover_image || !p.cover_image.url) continue;
          liste.push({ id: p.id, name: p.name, gruppe, bild: p.cover_image.url, format: (p.metadata && p.metadata.aspect_ratio) || 'auto' });
        }
        cursor = d && d.cursor;
      } while (cursor && ++seiten < 10);
      presetCache = { zeit: jetzt, liste };
      return liste;
    }
  };
}
