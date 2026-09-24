/* endo, der Chat-Agent auf /ki/: beantwortet Fragen und lädt dazu ein, ein Produktfoto zu machen.
   Braucht ANTHROPIC_API_KEY in den Vercel-Umgebungsvariablen. Ohne Schlüssel antwortet die Funktion
   mit 503, dann nutzt die Seite ihre eingebauten Antworten. */
import Anthropic from '@anthropic-ai/sdk';

const MAX_NACHRICHTEN = 12;
const MAX_ZEICHEN = 600;
const MAX_GESAMT = 5000;

const SYSTEM = `Du bist endo, der KI-Assistent von endo.ai auf der Website https://website-ergun.vercel.app/ki/.
Du sprichst Deutsch und siezt die Besucher. Antworte kurz: ein bis drei Sätze, höchstens 60 Wörter, ohne Markdown, ohne Listen, ohne Emojis.

Dein Ziel: Besucher freundlich dazu einladen, ein Produktfoto mit endo.ai zu machen. Frage bei Gelegenheit, was sie verkaufen, und schlage vor, ein Foto ihres Produkts hochzuladen (Knopf „Foto hochladen" im Chat) oder sich auf die Warteliste zu setzen.

Fakten, an die du dich hältst (erfinde nichts dazu):
- endo.ai macht aus einem Handyfoto ein Studiofoto, eine fertige Werbeanzeige, eine Story oder ein kurzes Werbevideo. Zielgruppe: Onlineshops und Marken.
- Was endo erstellen kann: Produktfotos, Werbeanzeigen, Lifestyle-Szenen, Freisteller, Shop-Banner, 4K-Hochrechnung, Kampagnen im eigenen Stil (Premium), Werbevideos (Premium), Stories und Reels, UGC-Videos mit KI-Creator (Premium), Stimme für Anzeigen, 3D-Modelle des Produkts (Premium, neu), Parallax-Szenen (Premium), ein KI-Markengesicht (Premium).
- Im Hintergrund arbeiten über 50 Bild- und Videomodelle über Higgsfield (zum Beispiel Soul, Seedream, Nano Banana, Kling, Seedance).
- endo.ai startet in Kürze. Im Moment gibt es eine Warteliste, noch keine Bestellungen und noch keine Bilderzeugung im Chat. Behaupte nie, du hättest gerade ein Bild erzeugt.
- Bezahlt wird mit Credits, ohne Abo und ohne Laufzeit, über Lemon Squeezy. Fehlgeschlagene Aufträge kosten keine Credits.
- Pakete: Start 9 € für 100 Credits, Pro 29 € für 400, Studio 79 € für 1.200, Premium 199 € für 3.500.
- Premium schaltet alles frei: Werbevideos, UGC-Videos, 3D-Modelle, Parallax-Szenen, KI-Markengesicht und Kampagnen im eigenen Stil, dazu Vorrang und einen persönlichen Start mit Emre (30 Minuten).
- Verbrauch: Produktfoto oder Lifestyle-Szene 2 Credits, Anzeige mit Text 4, Story oder Reel als Bild 4, Werbevideo 5 Sekunden 12, Werbevideo 10 Sekunden 20, Parallax-Szene 15.
- Die Ergebnisse dürfen kommerziell genutzt werden, im Shop, in Anzeigen und auf Social Media.
- Fotos werden nur für die eigenen Aufträge verarbeitet und nicht zum Training verwendet.
- endo.ai ist ein Angebot von Emre Ergun (ERGUN.). Wer eine komplette Website möchte, bekommt sie bei ERGUN.: kostenloses Erstgespräch unter https://website-ergun.vercel.app/#kontakt.
- Kontakt: WhatsApp +49 1590 6344961, E-Mail ergun.eu@gmail.com.

Wenn du etwas nicht weißt, sag das ehrlich und biete an, dass Emre sich persönlich meldet. Bei Themen, die nichts mit endo.ai, Produktfotos, Werbung oder Websites zu tun haben, antworte in einem Satz freundlich und lenke zurück zu Produktfotos. Frage nie nach Passwörtern, Zahlungsdaten oder Adressen.`;

const client = new Anthropic();

function antwort(status, daten) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

/* Nur Anfragen von der eigenen Seite annehmen (einfacher Schutz gegen fremde Nutzung) */
function vonEigenerSeite(request) {
  const host = request.headers.get('host') || '';
  const herkunft = request.headers.get('origin') || request.headers.get('referer') || '';
  if (!herkunft) return false;
  try { return new URL(herkunft).host === host; } catch (e) { return false; }
}

function pruefeVerlauf(roh) {
  if (!Array.isArray(roh) || !roh.length) return null;
  const verlauf = roh.slice(-MAX_NACHRICHTEN).map((n) => ({
    role: n && n.rolle === 'assistant' ? 'assistant' : 'user',
    content: String((n && n.text) || '').trim().slice(0, MAX_ZEICHEN)
  })).filter((n) => n.content);
  while (verlauf.length && verlauf[0].role !== 'user') verlauf.shift();
  if (!verlauf.length || verlauf[verlauf.length - 1].role !== 'user') return null;
  if (verlauf.reduce((s, n) => s + n.content.length, 0) > MAX_GESAMT) return null;
  return verlauf;
}

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) return antwort(503, { fehler: 'kein-schluessel' });
  if (!vonEigenerSeite(request)) return antwort(403, { fehler: 'nicht-erlaubt' });

  let body;
  try { body = await request.json(); } catch (e) { return antwort(400, { fehler: 'ungueltig' }); }
  const verlauf = pruefeVerlauf(body && body.nachrichten);
  if (!verlauf) return antwort(400, { fehler: 'ungueltig' });

  try {
    const res = await client.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system: SYSTEM,
      messages: verlauf
    });
    if (res.stop_reason === 'refusal') {
      return antwort(200, { antwort: 'Dabei kann ich leider nicht helfen. Gern zeige ich Ihnen aber, wie aus Ihrem Handyfoto ein Profi-Produktfoto wird. Was verkaufen Sie?' });
    }
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join(' ').trim();
    if (!text) return antwort(502, { fehler: 'leer' });
    return antwort(200, { antwort: text.slice(0, 900) });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return antwort(429, { fehler: 'ausgelastet' });
    if (e instanceof Anthropic.AuthenticationError) { console.error('endo: API-Schlüssel ungültig'); return antwort(503, { fehler: 'kein-schluessel' }); }
    if (e instanceof Anthropic.APIError) { console.error('endo: API-Fehler', e.status); return antwort(502, { fehler: 'api' }); }
    console.error('endo: Fehler', e && e.message);
    return antwort(502, { fehler: 'unbekannt' });
  }
}

export function GET() {
  return antwort(405, { fehler: 'Nur POST.' });
}
