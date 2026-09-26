/* endo Studio – die Werkzeug-Tabelle (Server-Wahrheit, Bauplan Phase C, Emre 26.09.2026: „alles wie empfohlen“).
   Pro Werkzeug: Higgsfield-Modell, feste Parameter, erlaubte Auswahl (Look, Format), Credits, Preisgrenze
   und FESTE englische Prompt-Vorlagen. Kunden- oder KI-Freitext geht nie an Higgsfield.
   Preise: API-Listenpreis nach Aktionsende (26.09. per /estimate geprüft). maxUsd = Abbruchgrenze, falls
   Higgsfield teurer wird – dann wird nichts erzeugt, statt mit Verlust zu arbeiten.
   Die Credits müssen zu ki/js/endo-daten.js passen (ein Test prüft das). */

const PRODUKT_TREU =
  'Keep the product exactly as in the reference image: same shape, proportions, colors, materials, label and printed text. ' +
  'Do not add any other text, logos, watermarks, people or hands. Photorealistic, tack sharp, true-to-life colors.';

const VIDEO_TREU =
  'Keep the product identical to the start image at all times: no morphing, no melting, no changing labels, no added text. ' +
  'Smooth, stable, premium commercial look.';

/* Produktfoto: endos eigene Looks (Direktmodus von Marketing Studio Image) */
const FOTO_LOOKS = {
  studio: { name: 'Studio weiß', text: 'Klar und hell auf weißem Grund', szene: 'on a seamless pure white studio background, soft diffused key light from above left, subtle natural contact shadow, clean e-commerce catalog quality' },
  fenster: { name: 'Naturlicht', text: 'Holztisch, weiches Morgenlicht', szene: 'on a light oak table beside a window, soft morning daylight from the left, gentle natural shadows, calm minimal interior softly blurred in the background' },
  stein: { name: 'Stein & Wärme', text: 'Travertin-Sockel, warme Töne', szene: 'on a sculptural travertine stone pedestal, warm neutral beige backdrop, soft directional light, premium editorial product photography' },
  nacht: { name: 'Dunkel & edel', text: 'Schiefer, Streiflicht, Luxus', szene: 'on a dark slate surface against a deep charcoal background, low-key lighting with a controlled rim light, subtle reflections, luxury look' },
  natur: { name: 'Natur', text: 'Moos, Waldlicht, Tiefe', szene: 'on a moss-covered rock in a sunlit forest clearing, dappled natural light, shallow depth of field, fresh organic mood' },
  schwebend: { name: 'Schwebend', text: 'Frei im Raum, pastellig', szene: 'floating mid-air against a soft pastel gradient backdrop, gentle soft shadow on the floor below, clean conceptual studio look' }
};

/* Website-Titelbild: breite Szene mit Platz für die Überschrift */
const TITEL_LOOKS = {
  hell: { name: 'Hell & minimal', text: 'Viel Weißraum, ruhig', szene: 'bright minimal set with soft white and light grey tones, gentle daylight, lots of calm negative space' },
  warm: { name: 'Warm & wohnlich', text: 'Goldenes Licht, Lifestyle', szene: 'warm lifestyle interior at golden hour, soft sunbeams, natural materials like linen and wood, cozy premium mood' },
  edel: { name: 'Dunkel & edel', text: 'Tiefe Farben, Glanzlichter', szene: 'dark elegant set in deep charcoal and bronze tones, dramatic soft spotlight, refined luxury mood' },
  natur: { name: 'Natur', text: 'Draußen, frisch, weit', szene: 'wide natural outdoor scene with soft morning light, blurred greenery and sky, fresh and airy mood' }
};

/* Werbevideos: nur die Bewegung wird beschrieben (Bild → Video) */
const VIDEO_LOOKS = {
  heran: { name: 'Langsam heran', text: 'Ruhige Kamerafahrt zum Produkt', bewegung: 'Slow cinematic push-in towards the product with subtle parallax in the background and a gentle shift of light.' },
  orbit: { name: 'Umkreisen', text: 'Kamera gleitet um das Produkt', bewegung: 'Smooth slow camera orbit around the product of about 30 degrees, steady and elegant.' },
  licht: { name: 'Lichtspiel', text: 'Licht wandert über die Oberfläche', bewegung: 'Static camera. A soft light sweep glides slowly across the product surface, creating gentle moving reflections.' },
  schweben: { name: 'Schweben', text: 'Produkt hebt leicht ab und dreht sich', bewegung: 'The product lifts off gently and hovers, rotating slightly, with fine dust particles drifting in soft light.' }
};

function looksAuswahl(looks) {
  return Object.entries(looks).map(([id, l]) => ({ id, name: l.name, text: l.text }));
}

export const WERKZEUGE = {
  foto: {
    name: 'Produktfoto', credits: 12, art: 'bild', listenUsd: 0.452, maxUsd: 0.7, minuten: 10,
    modell: 'marketing-studio/image', looks: FOTO_LOOKS, formate: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    eingabe({ look, format, fotoUrl }) {
      return {
        prompt: `Professional product photograph of the product from the reference image, ${FOTO_LOOKS[look].szene}. The product is the clear hero: centered, filling about 60 percent of the frame height, shot at eye level. ${PRODUKT_TREU}`,
        image_urls: [fotoUrl], quality: 'high', resolution: '2k', aspect_ratio: format, moderation: 'auto', enhance_prompt: false
      };
    }
  },
  anzeige: {
    name: 'Werbeanzeige', credits: 10, art: 'bild', listenUsd: 0.372, maxUsd: 0.6, minuten: 10,
    modell: 'marketing-studio/image', preset: true, formate: ['auto'],
    eingabe({ presetId, fotoUrl, ueberschrift }) {
      // Überschrift: vom Kunden bestätigt, streng geprüft (pruefen.js → pruefeUeberschrift). Ohne Überschrift: kein Zusatztext.
      const text = ueberschrift
        ? `The only headline is exactly this German text, spelled exactly as given: "${ueberschrift}". Do not add any other headline, slogan, call to action or text.`
        : 'Do not add any headline, slogan, call to action or other text.';
      return {
        prompt: `Clean, premium advertisement for the product in the reference image. ${text} Besides that headline, only the brand and product name that are already printed on the product may appear. No prices, discounts, codes, ratings, stars, reviews, testimonials, statistics or health claims.`,
        image_urls: [fotoUrl], preset_id: presetId, quality: 'high', resolution: '2k', aspect_ratio: 'auto', moderation: 'auto', enhance_prompt: true
      };
    }
  },
  shop: {
    name: 'Shop-Bild', credits: 5, art: 'bild', listenUsd: 0.075, maxUsd: 0.15, minuten: 10,
    modell: 'alibaba/qwen-image-3/edit', formate: ['1:1', '3:4', '4:3'],
    eingabe({ format, fotoUrl }) {
      return {
        prompt: 'Place the product from the image, centered, on a seamless pure white background (#FFFFFF) with even soft studio lighting and a subtle natural contact shadow. Keep the product itself completely unchanged, including its shape, colors, label and printed text. Clean e-commerce packshot.',
        negative_prompt: 'text, watermark, logo overlay, props, hands, people, reflections of other objects, distortion',
        image_urls: [fotoUrl], resolution: '2k', aspect_ratio: format
      };
    }
  },
  video: {
    name: 'Werbevideo 5 s', credits: 20, art: 'video', listenUsd: 0.56, maxUsd: 0.8, minuten: 30,
    modell: 'kling-video/v3.0/pro/image-to-video', looks: VIDEO_LOOKS, formate: ['bild'],
    eingabe({ look, fotoUrl }) {
      return { prompt: `${VIDEO_LOOKS[look].bewegung} ${VIDEO_TREU}`, image_url: fotoUrl, duration: 5, sound: 'off' };
    }
  },
  web: {
    name: 'Website-Titelbild', credits: 12, art: 'bild', listenUsd: 0.424, maxUsd: 0.7, minuten: 10,
    modell: 'marketing-studio/image', looks: TITEL_LOOKS, formate: ['16:9', '21:9'],
    eingabe({ look, format, fotoUrl }) {
      return {
        prompt: `Wide website hero image. The product from the reference image stands on the right third of the frame, the left half stays calm and empty for a headline. ${TITEL_LOOKS[look].szene}. ${PRODUKT_TREU}`,
        image_urls: [fotoUrl], quality: 'high', resolution: '4k', aspect_ratio: format, moderation: 'auto', enhance_prompt: false
      };
    }
  },
  video10: {
    name: 'Werbevideo 10 s', credits: 40, art: 'video', listenUsd: 1.12, maxUsd: 1.6, minuten: 30, premium: true,
    modell: 'kling-video/v3.0/pro/image-to-video', looks: VIDEO_LOOKS, formate: ['bild'],
    eingabe({ look, fotoUrl }) {
      return { prompt: `${VIDEO_LOOKS[look].bewegung} ${VIDEO_TREU}`, image_url: fotoUrl, duration: 10, sound: 'off' };
    }
  }
};

/* Premium-Leistungen ohne API – nur Anfrage an Emre */
export const AUF_ANFRAGE = { '3d': '3D-Produkt', parallax: 'Parallax-Szene', emre: 'Abstimmung mit Emre' };

/* Presets von Marketing Studio, die NICHT angeboten werden: erfundene Bewertungen/Kundenstimmen */
export const PRESET_GRUPPEN_GESPERRT = ['Social Proof'];

export function looksFuer(werkzeugId) {
  const w = WERKZEUGE[werkzeugId];
  return w && w.looks ? looksAuswahl(w.looks) : [];
}
