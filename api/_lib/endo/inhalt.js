/* endo Studio – kurzer Inhaltscheck eines hochgeladenen Fotos mit Claude, bevor es an Higgsfield geht:
   Ist ein Produkt erkennbar? Ist etwas Unerlaubtes zu sehen? Kosten ca. 1 Cent, zählt ins Tageslimit.
   Ohne ANTHROPIC_API_KEY oder bei Störung wird das Foto durchgelassen – Higgsfield prüft danach selbst. */
import Anthropic from '@anthropic-ai/sdk';

const SCHEMA = {
  type: 'object',
  properties: {
    produkt_erkennbar: { type: 'boolean' },
    erlaubt: { type: 'boolean' },
    grund: { type: 'string', enum: ['ok', 'kein_produkt', 'nacktheit', 'gewalt', 'waffe_drogen', 'ausweis_dokument', 'kind', 'hass', 'sonstiges'] }
  },
  required: ['produkt_erkennbar', 'erlaubt', 'grund'],
  additionalProperties: false
};

const ANWEISUNG = `Prüfe dieses Foto für einen Dienst, der aus Handyfotos Produktfotos und Werbevideos macht.
produkt_erkennbar: true, wenn ein verkaufbarer Gegenstand (Produkt, Verpackung, Kleidung, Speise, Möbel …) klar im Bild ist.
erlaubt: false bei Nacktheit oder sexuellen Inhalten, Gewalt, Waffen, Drogen, Ausweisen oder Dokumenten mit persönlichen Daten, Kindern im Mittelpunkt, Hasssymbolen.
grund: "ok", wenn beides passt, sonst der wichtigste Grund.`;

export async function pruefeInhalt(fotoUrl, env = process.env) {
  if (!env.ANTHROPIC_API_KEY) return { geprueft: false, ok: true };
  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'url', url: fotoUrl } },
        { type: 'text', text: ANWEISUNG }
      ] }]
    });
    if (res.stop_reason === 'refusal') return { geprueft: true, ok: false, grund: 'sonstiges' };
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const d = JSON.parse(text);
    const kosten = (res.usage.input_tokens * 5 + res.usage.output_tokens * 25) / 1e6;
    return { geprueft: true, ok: d.erlaubt && d.produkt_erkennbar, grund: d.erlaubt ? (d.produkt_erkennbar ? 'ok' : 'kein_produkt') : d.grund, kostenUsd: kosten };
  } catch (e) {
    console.error('endo Inhaltscheck:', e && e.message);
    return { geprueft: false, ok: true };
  }
}

export const INHALT_MELDUNG = {
  kein_produkt: 'Auf dem Foto ist kein Produkt gut zu erkennen. Bitte fotografieren Sie Ihr Produkt möglichst allein und formatfüllend.',
  sonstiges: 'Dieses Motiv können wir leider nicht erstellen.'
};
