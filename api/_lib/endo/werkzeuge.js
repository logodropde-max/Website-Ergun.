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
  naturlicht: { name: 'Naturlicht', text: 'Holztisch, weiches Morgenlicht', szene: 'on a light oak table beside a window, soft morning daylight from the left, gentle natural shadows, calm minimal interior softly blurred in the background' },
  stein: { name: 'Stein & Wärme', text: 'Travertin-Sockel, warme Töne', szene: 'on a sculptural travertine stone pedestal, warm neutral beige backdrop, soft directional light, premium editorial product photography' },
  nacht: { name: 'Dunkel & edel', text: 'Schiefer, Streiflicht, Luxus', szene: 'on a dark slate surface against a deep charcoal background, low-key lighting with a controlled rim light, subtle reflections, luxury look' },
  wald: { name: 'Wald & Moos', text: 'Moos, Waldlicht, Tiefe', szene: 'on a moss-covered rock in a sunlit forest clearing, dappled natural light, shallow depth of field, fresh organic mood' },
  schwebend: { name: 'Schwebend', text: 'Frei im Raum, pastellig', szene: 'floating mid-air against a soft pastel gradient backdrop, gentle soft shadow on the floor below, clean conceptual studio look' }
};

/* Website-Titelbild: breite Szene mit Platz für die Überschrift */
const TITEL_LOOKS = {
  hell: { name: 'Hell & minimal', text: 'Viel Weißraum, ruhig', szene: 'bright minimal set with soft white and light grey tones, gentle daylight, lots of calm negative space' },
  warm: { name: 'Warm & wohnlich', text: 'Goldenes Licht, Lifestyle', szene: 'warm lifestyle interior at golden hour, soft sunbeams, natural materials like linen and wood, cozy premium mood' },
  edel: { name: 'Dunkel & edel', text: 'Tiefe Farben, Glanzlichter', szene: 'dark elegant set in deep charcoal and bronze tones, dramatic soft spotlight, refined luxury mood' },
  draussen: { name: 'Draußen & frisch', text: 'Draußen, frisch, weit', szene: 'wide natural outdoor scene with soft morning light, blurred greenery and sky, fresh and airy mood' }
};

/* Werbevideos: nur die Bewegung wird beschrieben (Bild → Video) */
const VIDEO_LOOKS = {
  heran: { name: 'Langsam heran', text: 'Ruhige Kamerafahrt zum Produkt', bewegung: 'Slow cinematic push-in towards the product with subtle parallax in the background and a gentle shift of light.' },
  orbit: { name: 'Umkreisen', text: 'Kamera gleitet um das Produkt', bewegung: 'Smooth slow camera orbit around the product of about 30 degrees, steady and elegant.' },
  licht: { name: 'Lichtspiel', text: 'Licht wandert über die Oberfläche', bewegung: 'Static camera. A soft light sweep glides slowly across the product surface, creating gentle moving reflections.' },
  schweben: { name: 'Schweben', text: 'Produkt hebt leicht ab und dreht sich', bewegung: 'The product lifts off gently and hovers, rotating slightly, with fine dust particles drifting in soft light.' }
};

/* Lifestyle mit Person (Angebot 27.09.): erfundene Person, das Produkt bleibt Hauptsache */
const LIFESTYLE_LOOKS = {
  hand: { name: 'In der Hand', text: 'Nah, das Produkt in der Hand', szene: 'close-up of a person\'s hand holding the product naturally in front of a softly blurred bright home interior, soft daylight' },
  zuhause: { name: 'Zuhause', text: 'Im Alltag, helles Zuhause', szene: 'a person using the product at home in a bright, calm living space with natural window light and linen and wood textures' },
  draussen: { name: 'Unterwegs', text: 'Draußen, goldenes Licht', szene: 'a person with the product outdoors on a quiet city street or in a park at golden hour, warm natural light, shallow depth of field' },
  arbeit: { name: 'Bei der Arbeit', text: 'Am Tisch oder in der Werkstatt', szene: 'a person using the product at a tidy desk or small workshop, soft natural side light, focused calm mood' }
};
const PERSON_REGEL =
  'The person is a fictional adult model, not a real or famous person, with natural proportions and natural hands. ' +
  'The face may be cropped or softly out of focus; the product stays the clear hero and sharpest part of the image.';

/* Aktions-Plakat (Ideogram, kann Schrift): nur die vom Kunden bestätigte Überschrift */
const PLAKAT_LOOKS = {
  modern: { name: 'Klar & modern', text: 'Große Schrift, viel Weißraum', stil: 'clean modern Swiss-style poster layout, bold sans-serif headline, generous white space, calm colors' },
  warm: { name: 'Warm & handgemacht', text: 'Papier, runde Schrift, erdige Töne', stil: 'warm and friendly poster with soft paper texture, rounded hand-lettered headline, earthy natural colors' },
  kraeftig: { name: 'Kräftig & laut', text: 'Starker Kontrast, fette Schrift', stil: 'bold high-contrast promotional poster, very large heavy headline, one vivid accent color block' },
  edel: { name: 'Dunkel & edel', text: 'Dunkler Grund, feine Serifen', stil: 'elegant dark poster with a refined serif headline, subtle gold-toned accents, luxury mood' }
};

/* Logo-Entwurf (Recraft): kein Foto nötig. Branche nur aus fester Liste, Name streng geprüft. */
const LOGO_LOOKS = {
  schriftzug: { name: 'Schriftzug', text: 'Nur der Name, schön gesetzt', stil: 'a refined wordmark logo with custom lettering of the name and no separate symbol' },
  zeichen: { name: 'Zeichen + Name', text: 'Einfaches Symbol neben dem Namen', stil: 'a simple, memorable geometric symbol placed next to the name set in clean lettering' },
  emblem: { name: 'Emblem', text: 'Runde Plakette mit Name', stil: 'a round badge emblem with the name integrated along or inside the circle' },
  handgemacht: { name: 'Handgemacht', text: 'Gezeichnet, freundlich', stil: 'a friendly hand-drawn logo with the name in organic, slightly irregular lettering' }
};
export const LOGO_BRANCHEN = {
  cafe: { name: 'Café & Bäckerei', en: 'a café or bakery' },
  essen: { name: 'Restaurant & Essen', en: 'a restaurant or food brand' },
  mode: { name: 'Mode', en: 'a fashion or clothing brand' },
  beauty: { name: 'Beauty & Kosmetik', en: 'a beauty or cosmetics studio' },
  handwerk: { name: 'Handwerk', en: 'a craft or trades business' },
  tech: { name: 'Technik & Software', en: 'a technology or software company' },
  sport: { name: 'Sport & Fitness', en: 'a sports or fitness business' },
  gesundheit: { name: 'Gesundheit & Wellness', en: 'a health and wellness practice' },
  kreativ: { name: 'Kunst, Foto & Design', en: 'an art, photography or design studio' },
  immobilien: { name: 'Immobilien', en: 'a real estate business' },
  laden: { name: 'Laden & Handel', en: 'a shop or retail store' },
  sonstiges: { name: 'Anderes', en: 'a small local business' }
};

/* Seitenverhältnisse, die Qwen Image Edit kann (für „Original“ wird das nächstliegende gewählt) */
export const QWEN_FORMATE = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9'];

function looksAuswahl(looks) {
  return Object.entries(looks).map(([id, l]) => ({ id, name: l.name, text: l.text }));
}

export const WERKZEUGE = {
  foto: {
    name: 'Produktfoto', credits: 12, art: 'bild', paket: 'start', listenUsd: 0.452, maxUsd: 0.7, minuten: 10,
    modell: 'marketing-studio/image', looks: FOTO_LOOKS, formate: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    eingabe({ look, format, fotoUrl }) {
      return {
        prompt: `Professional product photograph of the product from the reference image, ${FOTO_LOOKS[look].szene}. The product is the clear hero: centered, filling about 60 percent of the frame height, shot at eye level. ${PRODUKT_TREU}`,
        image_urls: [fotoUrl], quality: 'high', resolution: '2k', aspect_ratio: format, moderation: 'auto', enhance_prompt: false
      };
    }
  },
  anzeige: {
    name: 'Werbeanzeige', credits: 10, art: 'bild', paket: 'start', ueberschrift: 'optional', listenUsd: 0.372, maxUsd: 0.6, minuten: 10,
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
    name: 'Shop- & Marktplatz-Bild', credits: 5, art: 'bild', paket: 'start', listenUsd: 0.075, maxUsd: 0.15, minuten: 10,
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
    name: 'Werbevideo 5 s', credits: 20, art: 'video', paket: 'start', listenUsd: 0.56, maxUsd: 0.8, minuten: 30,
    modell: 'kling-video/v3.0/pro/image-to-video', looks: VIDEO_LOOKS, formate: ['bild'],
    eingabe({ look, fotoUrl }) {
      return { prompt: `${VIDEO_LOOKS[look].bewegung} ${VIDEO_TREU}`, image_url: fotoUrl, duration: 5, sound: 'off' };
    }
  },
  web: {
    name: 'Website-Titelbild', credits: 12, art: 'bild', paket: 'start', listenUsd: 0.424, maxUsd: 0.7, minuten: 10,
    modell: 'marketing-studio/image', looks: TITEL_LOOKS, formate: ['16:9', '21:9'],
    eingabe({ look, format, fotoUrl }) {
      return {
        prompt: `Wide website hero image. The product from the reference image stands on the right third of the frame, the left half stays calm and empty for a headline. ${TITEL_LOOKS[look].szene}. ${PRODUKT_TREU}`,
        image_urls: [fotoUrl], quality: 'high', resolution: '4k', aspect_ratio: format, moderation: 'auto', enhance_prompt: false
      };
    }
  },
  video10: {
    name: 'Werbevideo 10 s', credits: 40, art: 'video', listenUsd: 1.12, maxUsd: 1.6, minuten: 30, paket: 'premium', premium: true,
    modell: 'kling-video/v3.0/pro/image-to-video', looks: VIDEO_LOOKS, formate: ['bild'],
    eingabe({ look, fotoUrl }) {
      return { prompt: `${VIDEO_LOOKS[look].bewegung} ${VIDEO_TREU}`, image_url: fotoUrl, duration: 10, sound: 'off' };
    }
  },

  /* ---- Angebot 27.09. (Emre „ok“): sechs neue Werkzeuge ---- */
  lifestyle: {
    name: 'Lifestyle mit Person', credits: 14, art: 'bild', paket: 'pro', listenUsd: 0.452, maxUsd: 0.7, minuten: 10,
    modell: 'marketing-studio/image', looks: LIFESTYLE_LOOKS, formate: ['3:4', '1:1', '4:3', '9:16', '16:9'],
    eingabe({ look, format, fotoUrl }) {
      return {
        prompt: `Authentic lifestyle photograph: ${LIFESTYLE_LOOKS[look].szene}. The product from the reference image is shown in real use and is clearly visible. ${PERSON_REGEL} ${PRODUKT_TREU.replace(' people or hands.', ' extra people.')}`,
        image_urls: [fotoUrl], quality: 'high', resolution: '2k', aspect_ratio: format, moderation: 'auto', enhance_prompt: false
      };
    }
  },
  plakat: {
    name: 'Aktions-Plakat', credits: 6, art: 'bild', paket: 'pro', listenUsd: 0.10, maxUsd: 0.25, minuten: 10,
    modell: 'ideogram/v4.0', looks: PLAKAT_LOOKS, ueberschrift: 'pflicht', aktion: true, formate: ['3:4', '4:5', '9:16', '1:1'],
    eingabe({ look, format, fotoUrl, ueberschrift }) {
      return {
        prompt: `Promotional poster featuring the product shown in the reference image, ${PLAKAT_LOOKS[look].stil}. The only text on the poster is exactly this German headline, spelled exactly as given, letter by letter: "${ueberschrift}". No other words, letters, numbers, prices, logos, QR codes or small print. The product appears once, large and recognizable, with the same shape, colors and label as in the reference image.`,
        image_url: fotoUrl, image_weight: 55, aspect_ratio: format, rendering_speed: 'QUALITY'
      };
    }
  },
  formate: {
    name: 'Formate-Set', credits: 3, art: 'bild', paket: 'start', listenUsd: 0.075, maxUsd: 0.15, minuten: 10, set: 3,
    modell: 'alibaba/qwen-image-3/edit', formate: ['1:1', '3:4', '9:16', '16:9'],
    eingabe({ format, fotoUrl }) {
      return {
        prompt: `Re-frame this exact image as a ${format} composition. Keep the product, the lighting, the colors and every detail identical; only extend or trim the surrounding background naturally so the product sits well in the new format. Do not add text, logos, people or new objects.`,
        negative_prompt: 'text, watermark, logo overlay, extra objects, people, hands, distortion, changed product, duplicated product',
        image_urls: [fotoUrl], resolution: '2k', aspect_ratio: format
      };
    }
  },
  video4k: {
    name: 'Website-Video 4K', credits: 60, art: 'video', paket: 'premium', premium: true, listenUsd: 2.10, maxUsd: 2.6, minuten: 30,
    modell: 'kling-video/v3.0/4k/image-to-video', looks: VIDEO_LOOKS, formate: ['bild'],
    eingabe({ look, fotoUrl }) {
      return { prompt: `${VIDEO_LOOKS[look].bewegung} Calm, slow and seamless, suitable as a looping website header background. ${VIDEO_TREU}`, image_url: fotoUrl, duration: 5, sound: 'off' };
    }
  },
  aufwerten: {
    name: 'Foto aufwerten', credits: 4, art: 'bild', paket: 'start', listenUsd: 0.075, maxUsd: 0.15, minuten: 10,
    modell: 'alibaba/qwen-image-3/edit', formate: ['original'].concat(QWEN_FORMATE),
    eingabe({ format, fotoUrl }) {
      return {
        prompt: 'Retouch this product photo like a professional photo editor: correct exposure and white balance, true-to-life colors, even clean lighting, crisp detail, and remove dust, specks and small distractions. Keep the composition, camera angle, background and the product itself exactly the same, including its shape, colors, label and printed text. Do not add anything.',
        negative_prompt: 'new objects, text, watermark, changed product, changed label, different background, people, hands, cartoon, painting',
        image_urls: [fotoUrl], resolution: '2k', aspect_ratio: format
      };
    }
  },
  logo: {
    name: 'Logo-Entwurf', credits: 8, art: 'bild', paket: 'pro', listenUsd: 0.21, maxUsd: 0.35, minuten: 10, ohneFoto: true, marke: true,
    modell: 'recraft/v4.1/pro/text-to-image', looks: LOGO_LOOKS, formate: ['1:1'],
    eingabe({ look, format, markenname, branche }) {
      return {
        prompt: `Logo design for ${LOGO_BRANCHEN[branche].en} called "${markenname}". ${LOGO_LOOKS[look].stil}. Flat vector-style graphic with clean shapes and at most two colors, centered on a plain white background with generous empty space around it. The only text is exactly "${markenname}", spelled exactly as given. Original design: do not imitate existing brands, logos or mascots. No mockup, no 3D, no photo, no gradients, no tagline.`,
        resolution: '2k', aspect_ratio: format, output_format: 'png'
      };
    }
  }
};

/* Was jedes Paket kann – Start < Pro < Premium (Angebot 27.09.). Durchgesetzt wird es, sobald Pakete gekauft werden können. */
export const PAKET_STUFE = { start: 1, pro: 2, premium: 3 };

/* Premium-Leistungen ohne API – nur Anfrage an Emre */
export const AUF_ANFRAGE = { '3d': '3D-Produkt', parallax: 'Parallax-Szene', emre: 'Abstimmung mit Emre' };

/* Presets von Marketing Studio, die NICHT angeboten werden: erfundene Bewertungen/Kundenstimmen */
export const PRESET_GRUPPEN_GESPERRT = ['Social Proof'];

export function looksFuer(werkzeugId) {
  const w = WERKZEUGE[werkzeugId];
  return w && w.looks ? looksAuswahl(w.looks) : [];
}
