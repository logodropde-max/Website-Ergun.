# Wolken fürs Titelbild (Emre, 27.09.2026) aus Emres Higgsfield-Bildern (Originale bleiben unverändert in 05 Higgsfield-Assets/Bilder/):
#   wolken-a = hf_b94ca19a…  (Federwolken + Haufenwolken, weiß)   wolken-b = hf_efac7d8b…  (flache Haufenwolken, Abendlicht)
# Ablauf: Freistellen über die Helligkeit (Wolken vor reinem Schwarz: Deckkraft = Helligkeit, Farbe = entmischt) → einzelne Wolken
# ausschneiden → leicht vereinfachen/weichzeichnen → je Lichtstimmung (Tag, Gold, Nacht) über eine Farbkarte in die Paletten der Szene
# (js/szene.js / Himmel in index.html) umfärben → WebP mit Alpha in zwei Größen (Desktop, Handy).
# Aufruf: python wolken.py   (schreibt in diesen Ordner; zum Prüfen zusätzlich _vorschau.jpg)
import os, json
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
QUELLE = os.path.join(HIER, '..', '..', '..', '..', '05 Higgsfield-Assets', 'Bilder')
BILDER = {
    'a': 'hf_b94ca19a-0f77-48e3-b037-cbfc0982e349_wolken-a.png',
    'b': 'hf_efac7d8b-72a3-43ba-bf55-4c5941965781_wolken-b.png',
}
# welche Wolken (nach Lage im Quellbild, Mittelpunkt in Anteilen) → Name, Art
AUSWAHL = [   # „nicht zu viele Wolken“: 2 Federwolken hoch, 3 flache Wolken am Horizont
    ('a', (0.27, 0.22), 'feder-1', 'feder'),
    ('a', (0.79, 0.20), 'feder-2', 'feder'),
    ('b', (0.33, 0.33), 'flach-1', 'flach'),
    ('b', (0.70, 0.73), 'flach-3', 'flach'),
    ('b', (0.20, 0.77), 'flach-4', 'flach'),
]
GROESSEN = {'d': 960, 'h': 520}   # längste Kante in px (Wolken sind weich – mehr bringt nichts, kostet nur Ladezeit)

def hx(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float) / 255
# Farbkarten: Helligkeit der Wolke (0 dunkelster Schatten … 1 hellstes Licht) → Farbe; an den Himmel der Szene angelehnt
KARTEN = {
    'tag':   [(0.0, '#7F95B4'), (0.45, '#C3D1E2'), (0.8, '#EEF3F8'), (1.0, '#FFFFFF')],   # weiß, Schatten leicht blau (Himmel #3B79BD)
    'gold':  [(0.0, '#7A6788'), (0.4, '#B98A98'), (0.75, '#EBAE8E'), (1.0, '#FFE2BC')],   # Schatten violett, Licht pfirsich/rosa
    'nacht': [(0.0, '#161E33'), (0.5, '#243350'), (0.85, '#36476B'), (1.0, '#4A5C86')],   # dunkles Blaugrau, leise
}
def karte(L, stufen):
    out = np.zeros(L.shape + (3,))
    xs = [s[0] for s in stufen]; cs = [hx(s[1]) for s in stufen]
    for k in range(3): out[..., k] = np.interp(L, xs, [c[k] for c in cs])
    return out

def freistellen(rgb):
    m = rgb.max(2)
    a = np.clip((m - 0.018) / (0.40 - 0.018), 0, 1) ** 0.85
    farbe = np.where(a[..., None] > 0.01, np.clip(rgb / np.maximum(a[..., None], 0.01), 0, 1), 0)
    return a, farbe

def wolken_finden(a, name):
    maske = ndimage.binary_dilation(a > 0.06, iterations=5)
    lab, n = ndimage.label(maske)
    return lab, ndimage.find_objects(lab)

def main():
    meta = {}
    vorschau = []
    cache = {}
    for quelle, (mx, my), name, art in AUSWAHL:
        if quelle not in cache:
            rgb = np.asarray(Image.open(os.path.join(QUELLE, BILDER[quelle])).convert('RGB'), float) / 255
            a, farbe = freistellen(rgb)
            lab, boxen = wolken_finden(a, quelle)
            cache[quelle] = (rgb, a, farbe, lab, boxen)
        rgb, a, farbe, lab, boxen = cache[quelle]
        H, W = a.shape
        nr = lab[int(my * H), int(mx * W)]
        if nr == 0:   # Punkt liegt in einer Lücke: nächstgelegene Wolke nehmen
            ys, xs = np.nonzero(lab)
            i = np.argmin((ys - my * H) ** 2 + (xs - mx * W) ** 2); nr = lab[ys[i], xs[i]]
        sl = boxen[nr - 1]
        y0, y1 = max(0, sl[0].start - 10), min(H, sl[0].stop + 10); x0, x1 = max(0, sl[1].start - 10), min(W, sl[1].stop + 10)
        nur = (lab[y0:y1, x0:x1] == nr)
        al = a[y0:y1, x0:x1] * nur
        fa = farbe[y0:y1, x0:x1]
        # leicht vereinfachen: feines Rauschen der Textur glätten, Kanten weich (Stil der gezeichneten Szene)
        L = (0.3 * fa[..., 0] + 0.59 * fa[..., 1] + 0.11 * fa[..., 2])
        L = ndimage.gaussian_filter(L, 1.6)
        L = np.clip((L - np.percentile(L[al > 0.5], 2)) / max(0.05, np.percentile(L[al > 0.5], 99.5) - np.percentile(L[al > 0.5], 2)), 0, 1) if (al > 0.5).any() else L
        al = ndimage.gaussian_filter(al, 1.2)
        # dünne, ausgefranste Ränder sind im Licht hell (Streulicht) – nie dunkler Saum
        L = L + (0.78 - L) * np.clip(1 - al, 0, 1)[...] ** 1.3 * (L < 0.78)
        hh, ww = al.shape
        # Licht von unten (Gold) und Mondkante oben links (Nacht)
        yy = np.linspace(0, 1, hh)[:, None] * np.ones((1, ww))
        grob = ndimage.gaussian_filter(al, 6)   # nur die große Form bekommt die Mondkante, nicht jede Flocke
        rand = np.clip(grob - ndimage.shift(grob, (10, 10), order=1, mode='nearest'), 0, 1) * al   # Kanten, die nach oben links zeigen
        rand = ndimage.gaussian_filter(rand, 3)
        for licht in ('tag', 'gold', 'nacht'):
            c = karte(L, KARTEN[licht])
            alpha = al.copy()
            if licht == 'gold':
                unten = np.clip((yy - 0.35) / 0.65, 0, 1) * L
                c = c * (1 - 0.35 * unten[..., None]) + hx('#FFB07A') * (0.35 * unten[..., None])
            if licht == 'nacht':
                c = c + hx('#9DB2DE') * (np.clip(rand * 2.4, 0, 1) * 0.5)[..., None]
                alpha = alpha * 0.62
            if licht == 'tag':
                alpha = alpha * 0.96
            bild = np.dstack([np.clip(c, 0, 1), np.clip(alpha, 0, 1)])
            voll = Image.fromarray((bild * 255 + 0.5).astype(np.uint8), 'RGBA')
            for g, lang in GROESSEN.items():
                f = lang / max(ww, hh)
                klein = voll.resize((max(1, round(ww * f)), max(1, round(hh * f))), Image.LANCZOS) if f < 1 else voll
                klein.save(os.path.join(HIER, '%s-%s-%s.webp' % (name, licht, g)), 'WEBP', quality=62 if licht == 'nacht' else 70, alpha_quality=70, method=6)
            vorschau.append((name, licht, voll))
        # Koerper-Maske (27.09., Sonne/Mond hinter Wolken): dichter Kern der Wolke, Loecher geschlossen, Rand eingezogen und weich -
        # damit deckt die Wolke das Gestirn im Inneren voellig ab, die duennen Raender bleiben weich (dort leuchtet die Kante)
        k = (al > 0.32).astype(np.uint8)
        k = ndimage.binary_closing(k, iterations=6); k = ndimage.binary_erosion(k, iterations=4)
        km = ndimage.gaussian_filter(k.astype(np.float32), 2.5)
        kbild = np.dstack([np.zeros((hh, ww, 3), np.float32), np.clip(km, 0, 1)])
        kvoll = Image.fromarray((kbild * 255 + 0.5).astype(np.uint8), 'RGBA')
        for g, lang in GROESSEN.items():
            f = lang / max(ww, hh)
            kk = kvoll.resize((max(1, round(ww * f)), max(1, round(hh * f))), Image.LANCZOS) if f < 1 else kvoll
            kk.save(os.path.join(HIER, '%s-koerper-%s.webp' % (name, g)), 'WEBP', quality=50, alpha_quality=60, method=6)
        # Deckungsraster (40 Spalten): mittlere Alpha je Zelle, 0-9 - js/wolken.js liest daraus, wie stark ein Gestirn verdeckt ist
        sp = 40; ze = max(4, round(sp * hh / ww))
        rast = []
        for j in range(ze):
            zeile = ''
            for i in range(sp):
                y0, y1 = int(j * hh / ze), max(int(j * hh / ze) + 1, int((j + 1) * hh / ze)); x0, x1 = int(i * ww / sp), max(int(i * ww / sp) + 1, int((i + 1) * ww / sp))
                zeile += str(min(9, int(al[y0:y1, x0:x1].mean() * 10)))
            rast.append(zeile)
        meta_raster = rast
        meta[name] = {'art': art, 'seite': round(ww / hh, 4), 'raster': meta_raster}
    json.dump(meta, open(os.path.join(HIER, 'wolken.json'), 'w'), indent=1)
    # Vorschau: jede Wolke in jeder Lichtstimmung vor ihrem Himmel
    himmel = {'tag': '#3B79BD', 'gold': '#86709A', 'nacht': '#0D1B38'}
    zellen = []
    for name, licht, im in vorschau:
        f = 300 / max(im.size); t = im.resize((round(im.width * f), round(im.height * f)))
        z = Image.new('RGBA', (320, 190), himmel[licht]); z.alpha_composite(t, ((320 - t.width) // 2, (190 - t.height) // 2)); zellen.append(z)
    spalten = 3; zeilen = (len(zellen) + 2) // 3
    blatt = Image.new('RGB', (spalten * 324, zeilen * 194), (20, 20, 20))
    for i, z in enumerate(zellen): blatt.paste(z.convert('RGB'), ((i % 3) * 324, (i // 3) * 194))
    blatt.save(os.path.join(HIER, '_vorschau.jpg'), quality=82)
    print(json.dumps(meta))

main()
