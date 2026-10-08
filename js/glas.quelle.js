/* ERGUN. – Startseite „Glas“ (?titel=glas, 01.10.2026 – Ausnahme auf ERGUNs Wunsch: die 21st.dev-Vorlage „Glass Headline Hero“ als neues
   Design-Konzept der ganzen Seite). Vanilla-JS-Fassung der React-Komponente (Original unverändert: _code/vorlagen-21st/glass-headline-hero/
   glass-headline-hero.tsx). Konstanten, Shader und CSS kommen WÖRTLICH aus js/glas-vorlage.gen.js (_code/werkzeuge/glas-vorlage-ziehen.py);
   Logik, Hilfsfunktionen, Lite-Modus, Watchdog, IntersectionObserver, visibilitychange, Context-Lost/Restored, fonts.ready-Neuaufbau und
   „Bewegung reduzieren“ sind 1:1 übernommen – nur React-State/Refs wurden zu normalem DOM (data-glass am Abschnitt, Neuaufbau nach Context-Restored
   = start() erneut). Kein three.js. Bündeln:
     NODE_PATH=C:\Users\emrer\endo-bau\node_modules npx esbuild js/glas.quelle.js --bundle --minify --format=iife --target=es2019 --outfile=js/glas.js
   Dazu: Leiste, Angebote (Schritt ① aus preise.js #angebote) und Formular im selben Glas-Stil (glas.css), Fußzeile. Prüfgriff: window.__glas. */
import { FORM_MS, DOME, IDLE_S, SLOW_FRAME_S, SLOW_FRAMES, CRAWL_FRAME_S, VERT, FIELD, BLUR, GLASS } from './glas-vorlage.gen.js';

/* #region glass – Hilfsfunktionen der Vorlage (1:1, ohne TypeScript-Typen) */
const DEFAULT_COLORS = ['#0D0A14', '#FF5A1F', '#FF9EC1', '#2F4CFF', '#FFE6B8'];
function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const v = parseInt(m[1], 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}
function paletteOf(colors) {
  return DEFAULT_COLORS.map((fallback, i) => hexToRgb((colors && colors[i]) != null ? colors[i] : '') || hexToRgb(fallback));
}
function splitWords(title) { return title.trim().split(/\s+/).filter(Boolean); }
function bevelPx(fontPx, scale) { return Math.max(2, fontPx * 0.075 * scale); }
function formed(t, ms) { const x = Math.min(Math.max(t / ms, 0), 1); return 1 - Math.pow(1 - x, 3); }
function fallbackBackground(palette) {
  const rgba = (c, a) => 'rgba(' + c.map((v) => Math.round(v * 255)).join(',') + ',' + a + ')';
  return (
    'radial-gradient(60% 50% at 25% 30%,' + rgba(palette[1], 0.4) + ',transparent 70%),' +
    'radial-gradient(50% 45% at 78% 35%,' + rgba(palette[3], 0.4) + ',transparent 70%),' +
    'radial-gradient(45% 40% at 60% 80%,' + rgba(palette[2], 0.27) + ',transparent 70%),' +
    rgba(palette[0], 1)
  );
}
function follow(from, to, dt, rate) { return to + (from - to) * Math.exp(-rate * dt); }
function orbit(t) { return [0.5 + 0.32 * Math.sin(t * 0.37), 0.56 + 0.16 * Math.sin(t * 0.53 + 1.1)]; }
/* #endregion */

(function () {
  const root = document.querySelector('[data-glas-root]');
  if (!root) return;
  const html = document.documentElement, frage = new URLSearchParams(location.search);
  const COLORS = ['#0D0A14', '#FF5A1F', '#FF9EC1', '#2F4CFF', '#FFE6B8'];   /* Farben 1:1 aus der Vorlage (das Orange = Marken-Orange) */
  const palette = paletteOf(COLORS);
  const canvas = root.querySelector('[data-glas-canvas]'), titleEl = root.querySelector('[data-glas-titel]');
  /* Glas fein (?glas=fein, Ausnahme auf Emres Wunsch): Schriftzug Zeichen für Zeichen aus der echten Lage gemalt, nie angeschnitten, Verlauf als
     feste Bühne hinter der GANZEN Seite (ein WebGL-Kontext), unter dem Hero gedämpft und langsamer. Ohne den Schalter bleibt alles wie vorher. */
  const FEIN = html.classList.contains('glas-fein');
  /* Glas nahtlos (?glas=nahtlos): keine Fläche über dem Verlauf – er wird selbst nach unten weich dunkler (siehe GLASS_FEIN) */
  const NAHTLOS = FEIN && html.classList.contains('glas-nahtlos');
  /* Blatt im Glas-Look (?start=glas, 03.10.2026 – Ausnahme auf ERGUNs Wunsch, Schalter BLATT_GLAS_STANDARD in index.html): Titelbild „Webdesign und
     Automatisierung“ als Glas-Schriftzug (versteckt bleibt „ERGUN.“ im h1), Fußzeile „ERGUN. · Webdesign und Automatisierung · © Jahr“, hinter dem
     Riss derselbe Verlauf klar und gezeichnet: hinten a = Glas-Bühne mit Zeichnung (Linien, Lichtkanten, Körnung, Tiefe) · hinten b = Illustration als Grund */
  const GB = FEIN && html.classList.contains('blatt-glas');
  const HINTEN = GB ? (html.getAttribute('data-hinten') === 'b' ? 'b' : 'a') : '';
  /* Ruhe (?ruhe=neu, 01.10.2026 – Emre: „Der Schriftzug zittert beim Laden und beim Scrollen“). Ursachen und Lösung:
     · Das Glas liegt in der festen Leinwand und wurde einen Bild-Takt NACH dem übrigen Titelbild-Text verschoben (der Browser scrollt Text
       sofort, die Leinwand malt im nächsten requestAnimationFrame) → der Schriftzug wackelte gegen „Digitalstudio“ und die Knöpfe.
       Jetzt steht der Titelbild-Inhalt ebenfalls fest und wird im SELBEN Bild-Takt per transform verschoben wie das Glas (auf ganze
       Gerätepixel gerundet) – beide bewegen sich immer gemeinsam.
     · Schrift lud nach (font-display: swap) → erst nach document.fonts.ready messen und malen; bis dahin ist der Schriftzug unsichtbar
       (Platz bleibt reserviert, keine Verschiebung); kein „Wachsen“ des Glases beim Laden (form = 1, nur weiches Einblenden).
     · Adressleiste am Handy → nur bei echter Breitenänderung neu rechnen; Leinwand fest 100lvh (glas-fein.css). */
  const RUHE = FEIN && html.classList.contains('ruhe');
  /* Schriftzug löst sich auf (?schrift=weg, 03.10.2026 – ERGUN.: „Das ERGUN. ist beim Runterscrollen etwas zu verschwommen, wie
     Bewegungsunschärfe“). Ursache: das Glas wird in der Leinwand mit dem Scrollen verschoben (u_shift) – jedes Bild an neuer Stelle, dazu der
     Titelbild-Inhalt per transform im selben Takt; bei schnellem Scrollen verwischt das am Handy. Jetzt: der Schriftzug wandert nur noch, solange er
     sichtbar ist, und verschmilzt ab ~8 % der Titelbild-Höhe in ~0,6 s (nach Zeit, nicht nach Scroll-Weg) mit dem Verlauf – der vorhandene Aufbau („form“
     der Vorlage) läuft rückwärts – und baut sich ganz oben wieder auf (Abstand der Schwellen gegen Flackern). Weg = keine Masken-Rechnung, kein
     Verschieben, der Verlauf malt ohne Glas-Rechnung (u_ohne). Unterzeile und Knöpfe scrollen ganz normal mit der Seite (kein transform). */
  const WEG = RUHE && html.classList.contains('schrift-weg');
  /* Schwellen in Fensterhöhen: runter löst sich „Webdesign und Automatisierung“ ab WEG_AB auf, hoch kommt es ab WEG_ZURUECK zurück.
     04.10.2026 (ERGUN: „soll früher zu sehen sein beim Hochscrollen“): 0.08/0.035 → 0.14/0.08 – der Abstand zwischen beiden bleibt,
     damit der Schriftzug an der Schwelle nicht flackert. */
  const WEG_AB = 0.14, WEG_ZURUECK = 0.08, WEG_MS = 600;
  /* Paket 1f Teil E (ERGUN., 04.10.2026 21:45: „Titel beim Wischen zeitgleich mit Unterzeile und Knöpfen nach oben, kein Nachziehen,
     und beim Hochscrollen viel früher wieder da“), Schalter html.titel-takt (?takt=an):
     · Auflösen hängt direkt am Scroll-Weg (keine eigene Zeit-Animation): ganz da bis TAKT_VOLL, ganz weg bei TAKT_WEG (Fensterhöhen),
       für die ganze Gruppe gleich – zurück kommt er, sobald der Kopf wieder ins Bild kommt. Kein Flackern: der Wert ist stetig, ohne Schwelle.
     · Die Lage der Gruppe macht seit „Kopf nativ“ (08.10.2026) allein der Browser – der frühere Versatz per transform je Bild ist entfernt (Tag vor-kopf-nativ). */
  const TAKT = WEG && html.classList.contains('titel-takt'), TAKT_VOLL = 0.5, TAKT_WEG = 0.6;
  const NATIV = TAKT && html.classList.contains('kopf-nativ');   /* Kopf nativ (Beschreibung unten); ohne die Klasse läuft der Schriftzug wie mit ?takt=aus */
  const inhalt = RUHE && (!WEG || NATIV) ? root.querySelector('.ghr-content') : null;   /* nativ: nur Deckkraft; ohne Schriftzug-weg (alte Ruhe): Versatz */
  let versatz = 0, breiteJetzt = window.innerWidth;
  const dprR = Math.min(window.devicePixelRatio || 1, 2);
  /* Ruhe + Handy (Emre, 02.10.: „alles auf höchste FPS“): Leinwand mit höchstens 1,5-facher Pixeldichte, Farbfeld mit 4 statt 5 Rausch-Stufen
     (der Schriftzug selbst bleibt scharf: seine Maske hat eine eigene Auflösung bis 2×), unter dem Titelbild kein Drosseln mehr */
  const HANDY_R = window.matchMedia('(max-width: 899px)').matches;
  /* Handy leicht (07.10.2026, Paket „ERGUN. Handy flüssig“, Vorschau ?handy=leicht – Schalter HANDY_LEICHT_STANDARD in index.html, nur Berührung +
     schmaler Bildschirm, html.handy-leicht): Sparmodus der Vorlage (lite) von Anfang an, der Wächter schaltet bei weiterem Ruckeln auf ein Standbild;
     der Verlauf bewegt sich nur im Kopf (darunter, hinter dem Blatt und bei verdeckter Seite steht er), höchstens ~60 Bilder/s, und ganz unten,
     wo das Bild nicht mehr vom Scrollen abhängt, wird gar nicht neu gemalt. Ohne die Klasse läuft alles wie vorher. */
  const LEICHT = html.classList.contains('handy-leicht');
  /* Titel scharf (07.10.2026, Vorschau ?titel=scharf – Schalter TITEL_SCHARF_STANDARD in index.html, html.titel-scharf; nur Ruhe + Handy-Breite, der PC
     bleibt Bit für Bit gleich). Am iPhone (3-fache Pixeldichte) rechnete die Leinwand mit höchstens 1,5-facher Dichte – der Browser zieht das Bild
     auf das Doppelte, der Glas-Schriftzug wirkt weich. Jetzt: solange der Kopf im Bild ist, Leinwand und Maske in voller Gerätedichte (höchstens
     SCHARF_MAX, Vergleich ?scharf=2.5); unter dem Kopf rechnet die Leinwand wieder mit der heutigen Dichte. Der Wächter senkt im Kopf nie unter die
     heutige Stufe (Leinwand 1,5 · Maske 2). Die Maske deckt nur noch das Band um den Schriftzug statt des ganzen Fensters – weniger Grafikspeicher
     und weniger Weichzeichner-Arbeit; der Shader liest sie über hoehe() an derselben Stelle wie vorher. Farbfeld behält seine heutige Pixelgröße. */
  const SCHARF = FEIN && RUHE && HANDY_R && html.classList.contains('titel-scharf');
  const SCHARF_MAX = Math.min(3, Math.max(1.5, parseFloat(html.getAttribute('data-scharf')) || 3));
  /* Kopf nativ (08.10.2026, ERGUN.: „Titel, Unterzeile und Knöpfe sollen ganz normal mitscrollen, nur ohne Zittern“), Schalter html.kopf-nativ
     (?kopf=nativ, KOPF_NATIV_STANDARD in index.html), nur zusammen mit dem Takt. Ursache des Zitterns: lageSetzen schob die feste Gruppe bei jedem
     Bild per transform hinter dem Scrollen her, und der Schriftzug wurde in der festen Leinwand um dieselbe Strecke versetzt gemalt – ein Skript
     läuft dem Schwung-Scrollen am iPhone immer etwas hinterher. Jetzt bewegt NUR der Browser die Lage:
     · Unterzeile und Knöpfe stehen im normalen Fluss des Titelbilds (kein fixed, kein transform);
     · der Glas-Schriftzug wird als durchsichtige Ebene gemalt (dieselben Shader, Ausgabe mit Deckkraft statt Verlauf) und in eine eigene Leinwand
       IM Titelbild kopiert (.glas-titel-ebene) – sie scrollt wie Text, also exakt im Takt mit den Knöpfen; der Verlauf dahinter bleibt die feste
       Bühne. Nur der Verlauf, den man DURCH die Buchstaben sieht (Lichtbrechung), wird aus dem Scroll-Stand nachgerechnet – weich und im Glas
       verzerrt, ein Bild Verzug sieht man dort nicht. Ein Grafik-Kontext bleibt (kein zweiter WebGL-Kontext, keine doppelte Masken-Rechnung).
     · Ausblenden wie im Takt (TAKT_VOLL → TAKT_WEG), ganz weg = unsichtbar und nicht antippbar.
     Fest an seit ERGUNs OK (08.10.2026); der alte Weg (feste Gruppe + Versatz je Bild) ist entfernt, Rückweg nur der Git-Tag vor-kopf-nativ. */
  function lageSetzen() {   /* Ruhe: Titelbild-Inhalt im selben Takt wie das Glas – auf ganze Gerätepixel gerundet */
    if (NATIV) return Math.round((window.scrollY || 0) * dprR) / dprR;   /* Kopf nativ: nichts verschieben; der Wert dient nur dem Verlauf */
    if (!inhalt) return versatz;
    const r = Math.round((window.scrollY || 0) * dprR) / dprR;
    if (r !== versatz || !inhalt.style.transform) {
      versatz = r; inhalt.style.transform = 'translate3d(0,' + (-r) + 'px,0)';
      inhalt.style.visibility = r > root.offsetHeight + 40 ? 'hidden' : '';
    }
    return versatz;
  }
  if (RUHE) { html.classList.add('glas-ruhe'); lageSetzen(); }
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- Inhalte (Vorschau-Varianten) ---------- */
  root.style.height = '100svh';
  root.style.background = fallbackBackground(palette);
  let buehne = null, titelEbene = null, titelBand = null;
  if (FEIN) {   /* die Leinwand wandert in eine feste Bühne am Anfang von <body> (.ghr-root hat container-type = eigener Bezugsrahmen für fixed) */
    buehne = el('div', 'glas-buehne'); buehne.setAttribute('aria-hidden', 'true');
    buehne.style.background = fallbackBackground(palette);
    buehne.appendChild(canvas); document.body.insertBefore(buehne, document.body.firstChild);
    if (NATIV) { titelEbene = el('canvas', 'glas-titel-ebene'); titelEbene.setAttribute('aria-hidden', 'true'); titelEbene.style.visibility = 'hidden'; root.insertBefore(titelEbene, root.firstChild); }
    root.style.background = 'transparent';
    /* je Zeichen ein <span>: die Abstände werden optisch ausgeglichen (abstaende()); der Text bleibt „ERGUN.“ für Suche und Screenreader */
    if (GB) titleEl.innerHTML = '<span class="glas-versteckt">ERGUN. – </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>';   /* am Handy drei Zeilen (glas-marke.css) */
    else if (frage.get('punkt') !== 'orange') titleEl.innerHTML = '<span class="ghr-word">' + 'ERGUN.'.split('').map((z) => '<span class="glas-z">' + z + '</span>').join('') + '</span>';
  }
  if (frage.get('punkt') === 'orange') {   /* Vergleich: der Punkt als solides Marken-Orange über dem Glas (nicht Teil des Glases) */
    titleEl.innerHTML = '<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>';
    html.setAttribute('data-glas-punkt', 'orange');
  }
  if (NAHTLOS && frage.get('text') !== 'b') {   /* Emre (01.10. spät): im Titelbild steht „Websites und Automatisierung“ */
    const d = root.querySelector('[data-glas-text]'); if (d) { d.textContent = 'Websites und Automatisierung'; d.classList.add('glas-unterzeile'); }
  }
  if (frage.get('text') === 'b') { const d = root.querySelector('[data-glas-text]'); if (d) d.textContent = 'Website & Automatisierung für Unternehmen.'; }

  /* ---------- Seite um den Hero: Altlasten raus, Angebote + Formular + Fußzeile im Glas-Stil ---------- */
  ['header.nav', 'footer.footer', '.szene', '#dschungel-vorlage', '#kristall-vorlage', '#glas-vorlage', '.mf-agentur'].forEach((s) => { const e = $(s); if (e) e.remove(); });
  const haupt = $('main#inhalt'), P = window.PREISE;
  const fuss = el('footer', 'glas-fuss');
  fuss.innerHTML = '<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>' +
    (GB ? '<span class="glas-fuss__satz">Webdesign und Automatisierung · © ' + new Date().getFullYear() + '</span>' : '') +
    '<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div>' +
    '<p class="glas-fuss__klein" data-glas-klein></p>' +
    ''   /* NASA-/Saturn-Hinweis entfernt (Emre, 02.10.2026): die Glas-Seite zeigt keine Planetenbilder; die Fassung ?titel=all hat ihren eigenen Hinweis */;
  if (haupt) haupt.parentNode.insertBefore(fuss, haupt.nextSibling);
  if (P && P.klein) $('[data-glas-klein]', fuss).textContent = P.klein + ' ' + (P.steuer || '');
  function kopfHoehe() { const k = $('[data-glas-kopf]'); return k ? k.offsetHeight : 0; }
  function ganzOben(e) { let y = 0; for (let x = e; x; x = x.offsetParent) y += x.offsetTop; return y; }
  const ruhigMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function hin(z) { if (z) window.scrollTo({ top: Math.max(0, ganzOben(z) - kopfHoehe() - 20), behavior: ruhigMq.matches ? 'auto' : 'smooth' }); }
  function zuAngeboten() { hin($('#angebote')); }
  function zumKontakt() { const o = $('#preise .mf__oben'); hin(o && !o.hidden ? o : $('#preise .mf__raster')); }
  window.__kristall = { zumKontakt, zuAngeboten };   /* preise.js führt nach der Wahl eines Angebots zum Formular darunter */
  document.addEventListener('click', (e) => {
    const marke = FEIN && e.target.closest && e.target.closest('.glas-kopf__marke');   /* Logo = nach oben (Start) */
    if (marke) { e.preventDefault(); window.scrollTo({ top: 0, behavior: ruhigMq.matches ? 'auto' : 'smooth' }); return; }
    const a = e.target.closest && e.target.closest('[data-glas-ziel]'); if (!a) return;
    e.preventDefault(); if (a.getAttribute('data-glas-ziel') === 'kontakt') zumKontakt(); else zuAngeboten();
  });

  /* Angebote (Schritt ①, gebaut von preise.js): Glas-Karten im Stil der Vorlagen-Pillen – Titel, kurzer Satz, Preis aus PREISE */
  let angeboteFertig = false;
  function angeboteHolen() {
    const a = document.getElementById('angebote'); if (!a) return false;
    a.classList.add('glas-angebote', 'glas-rein');
    const h = a.querySelector('h2'); if (h) { h.className = 'glas-h2'; h.textContent = 'Was brauchen Sie?'; }
    $$('.k-angebot', a).forEach((b) => {
      const wort = $('.k-angebot__wort', b), info = $('.k-angebot__info', b);
      const preis = info && info.querySelector('b') ? info.querySelector('b').textContent.trim() : '';
      const satz = info ? info.textContent.replace(preis, '').replace(/^\s*·\s*/, '').trim() : '';
      const teile = preis.split(' + ');
      b.classList.add('glas-karte'); b.innerHTML = '';
      b.appendChild(el('span', 'k-angebot__wort glas-karte__titel', wort ? wort.textContent : ''));
      b.appendChild(el('span', 'glas-karte__satz', satz));
      const p = el('span', 'glas-karte__preis'); p.appendChild(el('b', '', teile[0]));
      if (teile[1]) p.appendChild(el('small', '', '+ ' + teile.slice(1).join(' + '))); b.appendChild(p);
    });
    angeboteFertig = true; return true;
  }
  (function warten(n) { if (!angeboteHolen() && n < 60) setTimeout(() => warten(n + 1), 50); })(0);
  if (haupt) { haupt.classList.add('glas-haupt'); const mo = $('#preise .mf__oben'); if (mo) mo.classList.add('glas-rein'); const mr = $('#preise .mf__raster'); if (mr) mr.classList.add('glas-rein'); }
  /* Abschnitte darunter steigen beim Erscheinen dezent auf wie ghr-in (nur transform/opacity, „Bewegung reduzieren“ = nur Einblenden) */
  if ('IntersectionObserver' in window) {
    const beob = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('ist-da'); beob.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    setTimeout(() => $$('.glas-rein, .glas-fuss').forEach((x) => beob.observe(x)), 60);
  } else html.classList.add('glas-alles-da');

  /* =====================================================================================================================
     Der Hero – useEffect der Vorlage als start(), 1:1. „generation“ (Neuaufbau nach webglcontextrestored) = start() erneut.
     ===================================================================================================================== */
  const live = { palette, title: titleEl.textContent };
  const pointer = { x: 0.5, y: 0.56, at: -1e9, rebuild: () => {}, kick: () => {} };
  const zustand = { glas: false, lite: false, fps: 0, bilder: 0 };
  let aufraeumen = null;

  /* Glas fein – zwei kleine Änderungen an den Shadern der Vorlage (die gezogene Datei bleibt wörtlich):
     · Weichzeichner: die Vorlage schneidet den Gauß-Kern schon bei 2 σ ab (Gewicht dort noch 13 %); auf manchen Grafikwegen zeichnet die
       Schnittkante ein Kästchen um jeden Buchstaben. Fein: dieselbe Breite (σ), aber Abtastung bis 3 σ.
     · Glas: die Höhenkarte sitzt fest auf dem Dokument, die Leinwand auf dem Fenster → Lage um die Scroll-Strecke verschieben (u_shift). */
  const BLUR_FEIN = BLUR.replace('float x = float(i) * u_radius / 24.0;', 'float x = float(i) * u_radius * 1.5 / 24.0;');
  let GLASS_FEIN = GLASS.split('texture(u_height, ').join('texture(u_height, vec2(0.0, -u_shift) + ').replace('uniform vec2 u_res;', 'uniform vec2 u_res;\nuniform float u_shift;');
  /* nahtlos: Lage im Dokument in Fensterhöhen (yDoc) → ab etwa der Hälfte des Heros stufenlos dunkler (über ~0,95 Fensterhöhen, ohne Kante),
     in der Mitte (hinter den Inhalten) noch etwas mehr. Dieselben Farben, nur leiser. */
  if (NAHTLOS) GLASS_FEIN = GLASS_FEIN.replace('uniform float u_shift;', 'uniform float u_shift;\nuniform float u_nahtlos;').replace('  o = vec4(col, 1.0);\n}',
    '  float yDoc = (1.0 - uv.y) + u_shift;\n  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;\n' +
    '  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));\n  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);\n  o = vec4(col, 1.0);\n}');
  /* Prüfschalter fürs Werkzeug _code/werkzeuge/glas-wort.py (03.10.2026): ?glasfeld=schwarz|weiss = Verlauf als feste Farbe, Licht fest, ohne Körnung –
     aus zwei Aufnahmen wird der Glas-Schriftzug als Bild mit Durchsichtigkeit (Blatt im Glas-Look, Marken in Kopf und Fuß) */
  const FELD_PRUEF = { schwarz: 0, weiss: 0.8 }[frage.get('glasfeld')];
  if (FELD_PRUEF !== undefined) GLASS_FEIN = GLASS_FEIN.replace('  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;\n', '');
  const dbg = frage.get('glasdbg');   /* Prüfschalter: Kanäle der Höhenkarte zeigen (r = Kante, g = Maske, b = Wölbung) */
  if (FEIN && dbg) GLASS_FEIN = GLASS_FEIN.replace('o = vec4(col, 1.0);\n}', 'vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3(' + (dbg === 'g' ? 'dh.g' : dbg === 'b' ? 'dh.b' : 'dh.r') + '), vec3(0.25)), 1.0);\n}');
  if (FEIN && WEG) {   /* Maske mit eigener Lage (u_maske, steht still, während der Verlauf mit u_shift weiter nach unten dunkler wird) */
    const ohne = NAHTLOS ? '  float yDoc = (1.0 - uv.y) + u_shift;\n  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;\n' +
      '  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));\n  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);\n' : '';
    GLASS_FEIN = GLASS_FEIN.split('texture(u_height, vec2(0.0, -u_shift) + ').join('texture(u_height, vec2(0.0, -u_maske) + ')
      .replace('uniform float u_shift;', 'uniform float u_shift;\nuniform float u_maske;\nuniform float u_ohne;')
      .replace('  vec2 uv = vUv;\n', '  vec2 uv = vUv;\n  if (u_ohne > 0.5) {\n  vec3 col = texture(u_field, uv).rgb;\n  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;\n' + ohne + '  o = vec4(col, 1.0);\n  return;\n  }\n');
  }
  if (GB) {   /* hinten a: derselbe Verlauf, aber gezeichnet – feine Höhenlinien, Lichtkanten, Körnung, mehr Tiefe (u_detail = 0 bei hinten b) */
    const ZEICHNUNG = 'uniform float u_detail;\n' +
      'vec3 zeichnung(vec3 c, vec2 uv) {\n' +
      '  if (u_detail <= 0.0) return c;\n' +
      '  vec2 px = 1.0 / u_res; vec3 lw = vec3(0.299, 0.587, 0.114);\n' +
      '  float l0 = dot(texture(u_field, uv).rgb, lw);\n' +
      '  float lx = dot(texture(u_field, uv + vec2(px.x * 4.0, 0.0)).rgb, lw), ly = dot(texture(u_field, uv + vec2(0.0, px.y * 4.0)).rgb, lw);\n' +
      '  float kante = clamp(length(vec2(lx - l0, ly - l0)) * 70.0, 0.0, 1.0);\n' +
      '  float stufe = l0 * 16.0, d = min(fract(stufe), 1.0 - fract(stufe));\n' +
      '  float linie = 1.0 - smoothstep(0.0, max(fwidth(stufe), 1e-4) * 1.15, d);\n' +
      '  c = mix(c, smoothstep(vec3(0.0), vec3(1.0), c), 0.3 * u_detail);\n' +
      '  c = mix(c, c * 1.18 + 0.025, linie * 0.3 * u_detail);\n' +
      '  c += vec3(1.0, 0.93, 0.86) * kante * kante * 0.09 * u_detail;\n' +
      '  c += (hash(floor(uv * u_res)) - 0.5) * 0.045 * u_detail;\n' +
      '  return c;\n}\n';
    /* kleinere, mehrzeilige Schrift: Kontaktschatten näher und leiser – sonst wirkt er wie eine zweite, versetzte Zeile */
    GLASS_FEIN = GLASS_FEIN.replace('uv + away * 0.012', 'uv + away * 0.0045').replace('bg *= 1.0 - 0.32 * smoothstep', 'bg *= 1.0 - 0.2 * smoothstep');
    GLASS_FEIN = GLASS_FEIN.replace('void main() {', ZEICHNUNG + 'void main() {')
      .replace('  vec3 bg = texture(u_field, uv).rgb;\n', '  vec3 bg = zeichnung(texture(u_field, uv).rgb, uv);\n')
      .replace('  vec3 col = texture(u_field, uv).rgb;\n', '  vec3 col = zeichnung(texture(u_field, uv).rgb, uv);\n');
  }
  /* Titel scharf: die Maske ist nur noch ein Band um den Schriftzug – jeder Zugriff geht über hoehe(), das die Fenster-Lage (wie vorher) in die
     Lage im Band umrechnet (u_band = Maßstab, Versatz); außerhalb des Bands liefert der Rand der Maske 0 (genug Luft rundum) */
  if (SCHARF) GLASS_FEIN = GLASS_FEIN.split('texture(u_height, ').join('hoehe(').replace('uniform vec2 u_res;',
    'uniform vec2 u_res;\nuniform vec2 u_band;\nvec4 hoehe(vec2 p) { return texture(u_height, vec2(p.x, p.y * u_band.x + u_band.y)); }');
  /* Kopf nativ: derselbe Glas-Shader, aber als Ebene mit Deckkraft (vormultipliziert) – der Verlauf kommt von der festen Bühne darunter.
     Zerlegung des Originals mix(bg · (1 − s), glas, inside): Ebene = glas · inside, Deckkraft a = 1 − (1 − s)(1 − inside) → Ebene + Bühne · (1 − a)
     ergibt genau dasselbe Bild. Die Ebene liegt im Titelbild (Lage ohne Versatz); nur der Verlauf in den Buchstaben wird um u_feld verschoben. */
  let GLASS_NATIV = '';
  if (NATIV) {
    const ende = GLASS_FEIN.indexOf('  vec3 col = mix(bg, glass, inside);'), sm = /bg \*= 1\.0 - ([0-9.]+) \* smoothstep\(0\.1, 0\.7, shade\) \* u_glass;/.exec(GLASS_FEIN);
    if (ende > 0 && sm && GLASS_FEIN.indexOf('uniform float u_shift;') > 0) GLASS_NATIV = GLASS_FEIN.slice(0, ende)
      .split('texture(u_field, uv + bend').join('texture(u_field, uv + vec2(0.0, u_feld) + bend')
      .replace('uniform float u_shift;', 'uniform float u_shift;\nuniform float u_feld;') +
      '  float schatten = ' + sm[1] + ' * smoothstep(0.1, 0.7, shade) * u_glass;\n  float a = 1.0 - (1.0 - schatten) * (1.0 - inside);\n  vec3 g = glass * inside;\n' +
      (NAHTLOS ? '  float tief = smoothstep(0.55, 1.5, 1.0 - uv.y) * u_nahtlos;\n  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));\n  g *= mix(1.0, 0.36 - 0.1 * mitte, tief);\n' : '') +
      '  g += (hash(floor(uv * u_res)) - 0.5) * 0.018 * a;\n  o = vec4(g, a);\n}\n';
  }
  const fehlt = BLUR_FEIN === BLUR || GLASS_FEIN.indexOf('u_shift') < 0 || (FEIN && WEG && GLASS_FEIN.indexOf('u_ohne > 0.5') < 0)
    || (SCHARF && GLASS_FEIN.split('texture(u_height, ').length !== 2);   /* Vorlage geändert? dann sicher die alte Fassung (scharf: nur noch EIN Zugriff, in hoehe()) */
  const fein = FEIN && !fehlt;

  /* Schriftzug immer ganz: Größe aus der echten Breite (inkl. Kante, Glanz und Schatten), je Seite ≥ 6 % frei */
  /* Optischer Ausgleich: zwischen allen Zeichen (auch vor dem Punkt) derselbe sichtbare Abstand – gemessen an der Tinte, nicht am Kasten */
  const LUECKE = 0.06;   /* em */
  function abstaende() {
    const zs = $$('.glas-z', titleEl); if (zs.length < 2) return;
    zs.forEach((z) => { z.style.marginLeft = ''; });
    const cs = getComputedStyle(titleEl), fs = parseFloat(cs.fontSize) || 64;
    const c = document.createElement('canvas').getContext('2d'); if (!c) return;
    c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily; if ('letterSpacing' in c) c.letterSpacing = '0px';
    const tinte = zs.map((z) => { const b = z.getBoundingClientRect(), m = c.measureText(z.textContent); return [b.left - m.actualBoundingBoxLeft, b.left + m.actualBoundingBoxRight]; });
    for (let i = 1; i < zs.length; i++) zs[i].style.marginLeft = ((LUECKE * fs - (tinte[i][0] - tinte[i - 1][1])) / fs).toFixed(4) + 'em';
  }
  function einpassen() {
    if (!fein) return;
    titleEl.style.fontSize = '';
    abstaende();
    const wort = titleEl.querySelector('.ghr-word'); if (!wort) return;
    let breite = wort.getBoundingClientRect().width;
    if (GB) {   /* mehrere Wörter: die breiteste Zeile zählt (Zeilen nach ihrer Höhe gruppiert) */
      const z = {}; $$('.ghr-word', titleEl).forEach((w) => { const r = w.getBoundingClientRect(), k = Math.round(r.top / 4); z[k] = z[k] ? [Math.min(z[k][0], r.left), Math.max(z[k][1], r.right)] : [r.left, r.right]; });
      breite = Math.max(...Object.values(z).map((x) => x[1] - x[0]));
    }
    const fs = parseFloat(getComputedStyle(titleEl).fontSize) || 64;
    const zugabe = fs * 0.16, frei = root.clientWidth * (1 - 2 * 0.06);
    if (breite + zugabe > frei) titleEl.style.fontSize = (fs * frei / (breite + zugabe)).toFixed(2) + 'px';
  }
  if (fein) { einpassen(); window.addEventListener('resize', () => { if (RUHE && window.innerWidth === breiteJetzt) return; breiteJetzt = window.innerWidth; einpassen(); }); }

  /* Kante aus dem Abstand statt aus dem Weichzeichner (fein): Die Vorlage gewinnt die Glas-Kante (Kanal R) durch Weichzeichnen der Schrift.
     Bei fetter, eng gesetzter Schrift laufen dabei die schmalen Innenräume zu (E, G, N, Punkt verschmelzen → „Kästen“). Hier: echter
     Abstand jedes Pixels zum Buchstabenrand (euklidische Abstandstransformation nach Felzenszwalb/Huttenlocher), daraus dasselbe Profil
     wie die Vorlage an einer geraden Kante (Gauß-Summe, σ = Kante/2) – aber Innenräume bleiben offen. G = die scharfe Maske, B wird
     wie bei der Vorlage aus R weichgezeichnet (Wölbung). */
  function abstand1d(f, n, d, v, z) {
    let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  }
  function abstand2d(g, W, H) {   /* g: 0 = Ziel, 1e20 = sonst → quadrierte Abstände */
    const n = Math.max(W, H), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = g[y * W + x]; abstand1d(f, H, d, v, z); for (let y = 0; y < H; y++) g[y * W + x] = d[y]; }
    for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = g[y * W + x]; abstand1d(f, W, d, v, z); for (let x = 0; x < W; x++) g[y * W + x] = d[x]; }
    return g;
  }
  function phi(t) {   /* Normalverteilung Φ(t) (Abramowitz/Stegun 7.1.26) */
    const x = Math.abs(t) / Math.SQRT2, k = 1 / (1 + 0.3275911 * x);
    const e = 1 - (((((1.061405429 * k - 1.453152027) * k) + 1.421413741) * k - 0.284496736) * k + 0.254829592) * k * Math.exp(-x * x);
    return t >= 0 ? 0.5 * (1 + e) : 0.5 * (1 - e);
  }
  function kanteAusAbstand(c, w, h, bevelMask) {
    const bild = c.getImageData(0, 0, w, h), px = bild.data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return;
    const rand = Math.ceil(bevelMask * 2.5) + 2;
    x0 = Math.max(0, x0 - rand); y0 = Math.max(0, y0 - rand); x1 = Math.min(w - 1, x1 + rand); y1 = Math.min(h - 1, y1 + rand);
    const W = x1 - x0 + 1, H = y1 - y0 + 1, innen = new Float64Array(W * H), aussen = new Float64Array(W * H), a = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, v = px[((y + y0) * w + x + x0) * 4] / 255; a[i] = v;
      innen[i] = v < 0.5 ? 0 : 1e20; aussen[i] = v >= 0.5 ? 0 : 1e20;
    }
    abstand2d(innen, W, H); abstand2d(aussen, W, H);
    const sigma = Math.max(bevelMask * 0.5, 0.5);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = ((y + y0) * w + x + x0) * 4;
      /* vorzeichenbehafteter Abstand zur Kante, an der Kante über die Kantenglättung der Schrift verfeinert */
      const sd = a[i] >= 0.5 ? Math.sqrt(innen[i]) - 0.5 : 0.5 - Math.sqrt(aussen[i]);
      const fein = Math.abs(sd) < 1 ? a[i] - 0.5 : sd;
      px[o] = Math.round(phi(fein / sigma) * 255); px[o + 1] = Math.round(a[i] * 255); px[o + 2] = 0;
    }
    c.putImageData(bild, 0, 0);
  }

  function start() {
    if (aufraeumen) { aufraeumen(); aufraeumen = null; }
    /* „Farbwechsel“ (04.10.2026): der Verlauf kommt aus der CSS – dann gar kein WebGL starten (spart Akku), der Schriftzug steht als Schrift da */
    const gl = /[?&]webgl=aus\b/.test(location.search) || html.classList.contains('grund-farbwechsel') ? null : canvas.getContext('webgl2', { alpha: NATIV, antialias: false, depth: false, stencil: false });
    if (!gl) return;
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float') || (fein && !!gl.getExtension('EXT_color_buffer_half_float'));   /* fein: auch Halb-Fließkomma (iPhone) */

    let disposed = false, raf = 0, last = 0, time = 0, inView = true, lite = false, judged = 0, slow = 0;
    let standbild = false, judged2 = 0, slow2 = 0, gemaltY = -1, gemaltTief = '', feldZeit = -1;   /* Handy leicht: zweite Stufe des Wächters + „schon gemalt“ */
    if (LEICHT) { lite = true; zustand.lite = true; html.setAttribute('data-glas-lite', 'true'); }
    const light = { x: 0.5, y: 0.56 };
    let readyAt = -1;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const shader = (type, src) => {
      const s = gl.createShader(type);
      if (!s) throw new Error('could not create shader');
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
      return s;
    };
    const program = (frag) => {
      const prog = gl.createProgram();
      if (!prog) throw new Error('could not create program');
      const v = shader(gl.VERTEX_SHADER, VERT), f = shader(gl.FRAGMENT_SHADER, frag);
      gl.attachShader(prog, v); gl.attachShader(prog, f);
      gl.bindAttribLocation(prog, 0, 'a_position');
      gl.linkProgram(prog); gl.deleteShader(v); gl.deleteShader(f);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(prog));
      const u = {}, count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) { const info = gl.getActiveUniform(prog, i); if (info) u[info.name.replace(/^u_/, '')] = gl.getUniformLocation(prog, info.name); }
      return { prog, u };
    };

    const owned = { tex: [], fbo: [] };
    const makeTarget = (w, h, precise) => {
      const tex = gl.createTexture(), fbo = gl.createFramebuffer();
      if (!tex || !fbo) throw new Error('could not allocate a render target');
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (precise && floatTargets) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      owned.tex.push(tex); owned.fbo.push(fbo);
      return { tex, fbo, w, h };
    };
    const releaseTargets = () => { for (const t of owned.tex) gl.deleteTexture(t); for (const f of owned.fbo) gl.deleteFramebuffer(f); owned.tex = []; owned.fbo = []; };

    let P = null, field = null, blurA = null, blurB = null, maskTex = null, bevel = 4;
    /* Titel scharf: Band der Maske (u_band), Abstand der Nachbar-Abfragen, „unter dem Kopf“ (dann heutige Dichte) */
    const scharf = SCHARF && fein;
    let bandU = null, hTexel = null, scharfTief = false;
    /* hinten b: Illustration (bilder/glas/hinten-quer|hoch.webp) als Verlauf – cover, einmal in die Feld-Fläche gemalt */
    let bildTex = null, bildGemalt = false;
    const BILD = '#version 300 es\nprecision highp float;\nin vec2 vUv;\nout vec4 o;\nuniform sampler2D u_bild;\nuniform vec2 u_skala;\n' +
      'void main() { vec2 uv = (vUv - 0.5) * u_skala + 0.5; o = vec4(texture(u_bild, uv).rgb, 1.0); }\n';
    if (HINTEN === 'b') {
      const img = new Image(); img.decoding = 'async';
      img.onload = () => { if (disposed) return; const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        bildTex = { tex: t, w: img.naturalWidth, h: img.naturalHeight }; owned.tex.push(t); size(); kick(); };
      img.src = 'bilder/glas/hinten-' + (window.innerWidth >= window.innerHeight ? 'quer' : 'hoch') + '.webp?v=1';
    }

    const run = (p, dst, u) => {
      gl.useProgram(p.prog);
      let unit = 0;
      for (const k in u) {
        const loc = p.u[k];
        if (!loc) continue;
        const v = u[k];
        if (typeof v === 'number') gl.uniform1f(loc, v);
        else if (Array.isArray(v)) { if (v.length === 2) gl.uniform2f(loc, v[0], v[1]); else gl.uniform3f(loc, v[0], v[1], v[2]); }
        else { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v); gl.uniform1i(loc, unit++); }
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fbo : null);
      gl.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let built = '';
    /* fein: Maske in Fenstergröße, Lage auf dem Dokument (Scroll 0), jedes Zeichen genau dort, wo der Browser es setzt (Range je Zeichen),
       ohne Verwandlungs-Matrix gemalt (Schrift direkt in Pixelgröße) – so stimmen Abstände, Punkt und Kurven wie im echten <h1>. */
    const maskeFein = () => {
      einpassen();
      const heading = titleEl, cr = canvas.getBoundingClientRect();
      const scale = lite ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2);
      /* Titel scharf: Maske in voller Gerätedichte (höchstens SCHARF_MAX); Sparmodus nie unter der heutigen Stufe 2 */
      const sk = scharf ? Math.min(window.devicePixelRatio || 1, lite ? 2 : SCHARF_MAX) : scale;
      const cs = getComputedStyle(heading), fontPx = parseFloat(cs.fontSize) || 64, sy = RUHE && !WEG ? versatz : window.scrollY || 0;   /* Ruhe: der Inhalt ist um „versatz“ verschoben */
      const zeichen = [], tw = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const versteckt = (n) => !!(n.parentElement && n.parentElement.closest && n.parentElement.closest('.glas-versteckt'));   /* „ERGUN.“ nur für Suche und Screenreader */
      for (let n = tw.nextNode(); n; n = tw.nextNode()) for (let i = 0; i < (versteckt(n) ? 0 : n.data.length); i++) {
        if (/\s/.test(n.data[i])) continue;
        const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
        const b = rg.getBoundingClientRect(); zeichen.push([n.data[i], b.left - cr.left, b.top + sy, b.height]);
      }
      if (NATIV) {   /* Kopf nativ: Band der Glas-Ebene im Dokument (gleiche Luft wie das scharfe Band) + Lage des Titelbilds */
        const luft = Math.ceil(bevelPx(fontPx, 1) * 8 + cr.height * 0.015 + 16);
        titelBand = zeichen.length ? { von: Math.max(0, Math.min(...zeichen.map((z) => z[2])) - luft), bis: Math.min(cr.height, Math.max(...zeichen.map((z) => z[2] + (z[3] || fontPx))) + luft),
          root: root.getBoundingClientRect().top + (window.scrollY || 0) } : null;
      }
      /* Band (scharf): von der obersten bis zur untersten Zeile + Luft für Kante, Weichzeichner (≈ 5 × Kante) und Kontaktschatten (1,2 % der Höhe) */
      let y0 = 0, y1 = cr.height;
      if (scharf && zeichen.length) {
        const luft = Math.ceil(bevelPx(fontPx, 1) * 8 + cr.height * 0.015 + 16);
        y0 = Math.max(0, Math.floor(Math.min(...zeichen.map((z) => z[2])) - luft));
        y1 = Math.min(cr.height, Math.ceil(Math.max(...zeichen.map((z) => z[2] + (z[3] || fontPx))) + luft));
        if (y1 - y0 < 8) { y0 = 0; y1 = cr.height; }
      }
      const w = Math.max(1, Math.round(cr.width * sk)), h = Math.max(1, Math.round((y1 - y0) * sk));
      const layout = [w, h, sk, y0, cs.font].concat(zeichen.map((z) => z[0] + '@' + z[1].toFixed(1) + ',' + z[2].toFixed(1))).join('|');
      if (layout === built) return;
      built = layout;
      const cnv = document.createElement('canvas');
      cnv.width = w; cnv.height = h;
      const c = cnv.getContext('2d');
      if (!c) return;
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + (fontPx * sk).toFixed(2) + 'px ' + cs.fontFamily;
      if ('letterSpacing' in c) c.letterSpacing = '0px';
      c.fillStyle = '#fff'; c.textBaseline = 'alphabetic';
      zeichen.forEach((z) => {
        const ascent = c.measureText(z[0]).fontBoundingBoxAscent || fontPx * sk * 0.8;
        c.fillText(z[0], z[1] * sk, (z[2] - y0) * sk + ascent);
      });
      kanteAusAbstand(c, w, h, bevelPx(fontPx, sk));
      /* Fenster-Lage p.y (unten = 0) → Lage im Band: p.y · H/D + 1 − (H − y0)/D; Abstand der Nachbar-Abfragen wie bei einer Maske in Fenstergröße */
      if (scharf) { const H = cr.height, D = y1 - y0; bandU = [H / D, 1 - (H - y0) / D]; hTexel = [1 / w, 1 / Math.max(1, Math.round(H * sk))]; }
      return { cnv, w, h, fontPx, scale: sk };
    };
    const hochladen = (cnv, w, h, fontPx, scale) => {   /* dieselben Schritte wie im Pfad der Vorlage darunter */
      zustand.masken = (zustand.masken || 0) + 1;   /* Prüfung: wie oft der Schriftzug neu aufgebaut wurde */
      if (!maskTex) maskTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cnv);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (!blurA || blurA.w !== w || blurA.h !== h) {
        for (const t of [blurA, blurB]) { if (!t) continue; gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo); }
        blurA = makeTarget(w, h, true); blurB = makeTarget(w, h, true);
      }
      bevel = bevelPx(fontPx, scale);
      /* R ist schon die fertige Kante (kanteAusAbstand) – nur ein Hauch Glättung gegen die 8-Bit-Stufen, dann die Wölbung wie in der Vorlage */
      const glatt = Math.max(1.5 * scale, bevel * 0.25);   /* rundet auch die Grate an den Ecken leicht */
      run(P.blur, blurA, { src: maskTex, step: [1 / w, 0], radius: glatt, read: 1, write: 0 });
      run(P.blur, blurB, { src: blurA.tex, step: [0, 1 / h], radius: glatt, read: 1, write: 0 });
      run(P.blur, blurA, { src: blurB.tex, step: [1 / w, 0], radius: bevel * DOME, read: 1, write: 1 });
      run(P.blur, blurB, { src: blurA.tex, step: [0, 1 / h], radius: bevel * DOME, read: 2, write: 1 });
    };

    const buildMask = () => {
      const heading = titleEl;
      if (!heading || !field) return;
      if (WEG && schrift.ziel === 0) { schrift.offen = true; return; }   /* Schriftzug weg: nicht neu rechnen – erst beim Wiederkommen */
      if (fein) { const m = maskeFein(); if (m) hochladen(m.cnv, m.w, m.h, m.fontPx, m.scale); return; }
      const box = root.getBoundingClientRect();
      const scale = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(box.width * scale)), h = Math.max(1, Math.round(box.height * scale));
      const spans = Array.from(heading.querySelectorAll('.ghr-word'));
      const rects = spans.map((span) => span.getBoundingClientRect());
      const cs = getComputedStyle(heading);
      const layout = [w, h, scale, cs.font, cs.letterSpacing]
        .concat(spans.map((span, i) => (span.textContent || '') + '@' + Math.round(rects[i].left - box.left) + ',' + Math.round(rects[i].top - box.top)))
        .join('|');
      if (layout === built) return;
      built = layout;
      const cnv = document.createElement('canvas');
      cnv.width = w; cnv.height = h;
      const c = cnv.getContext('2d');
      if (!c) return;
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      const fontPx = parseFloat(cs.fontSize) || 64;
      c.setTransform(scale, 0, 0, scale, 0, 0);
      c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      if ('letterSpacing' in c) c.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      c.fillStyle = '#fff'; c.textBaseline = 'alphabetic';
      spans.forEach((span, i) => {
        const text = span.textContent || '';
        const ascent = c.measureText(text).fontBoundingBoxAscent || fontPx * 0.8;
        c.fillText(text, rects[i].left - box.left, rects[i].top - box.top + ascent);
      });
      if (!maskTex) maskTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cnv);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (!blurA || blurA.w !== w || blurA.h !== h) {
        for (const t of [blurA, blurB]) { if (!t) continue; gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo); }
        blurA = makeTarget(w, h, true); blurB = makeTarget(w, h, true);
      }
      bevel = bevelPx(fontPx, scale);
      if (!blurA || !blurB) return;
      run(P.blur, blurA, { src: maskTex, step: [1 / w, 0], radius: bevel, read: 0, write: 0 });
      run(P.blur, blurB, { src: blurA.tex, step: [0, 1 / h], radius: bevel, read: 1, write: 0 });
      run(P.blur, blurA, { src: blurB.tex, step: [1 / w, 0], radius: bevel * DOME, read: 1, write: 1 });
      run(P.blur, blurB, { src: blurA.tex, step: [0, 1 / h], radius: bevel * DOME, read: 2, write: 1 });
    };

    const size = () => {
      const dpr = fein && tiefStand ? 0.35 : RUHE && HANDY_R && !lite ? Math.min(window.devicePixelRatio || 1, 1.5) : lite ? (fein ? Math.min(window.devicePixelRatio || 1, 1) : 0.65) : Math.min(window.devicePixelRatio || 1, 2);   /* fein: unter dem Hero grob (weich, unscharf, kaum Rechenzeit); Lite nie unter 1 – sonst zackige Buchstaben */
      /* Titel scharf: im Kopf volle Gerätedichte (Sparmodus: die heutige 1,5), unter dem Kopf die heutige Dichte – nie weniger als heute */
      const dprJetzt = !scharf || scharfTief ? dpr : Math.max(dpr, Math.min(window.devicePixelRatio || 1, lite ? 1.5 : SCHARF_MAX));
      const w = Math.max(1, Math.round(canvas.clientWidth * dprJetzt)), h = Math.max(1, Math.round(canvas.clientHeight * dprJetzt));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      /* Handy leicht: Leinwand in 1-facher Pixeldichte (Sparmodus), das Farbfeld behält aber seine heutige Größe in Pixeln (0,4 × 1,5) –
         es kostet wenig und trägt das Muster; so bleibt der Verlauf so fein wie heute */
      const fs0 = HINTEN === 'b' && bildTex ? 1 : LEICHT ? 0.4 * Math.min(window.devicePixelRatio || 1, 1.5) / dpr : lite ? 0.25 : 0.4;   /* hinten b: Illustration scharf, nur einmal gemalt */
      const fs = dprJetzt === dpr ? fs0 : fs0 * dpr / dprJetzt;   /* Titel scharf: das Farbfeld behält seine heutige Pixelgröße */
      bildGemalt = false; gemaltTief = ''; gemaltY = -1; feldZeit = -1;
      const fw = Math.max(1, Math.round(w * fs)), fh = Math.max(1, Math.round(h * fs));
      if (!field || field.w !== fw || field.h !== fh) {
        if (field) { gl.deleteTexture(field.tex); gl.deleteFramebuffer(field.fbo); }
        field = makeTarget(fw, fh, false);
      }
      buildMask();
    };

    /* Kopf nativ: Glas-Ebene im Band um den Schriftzug (Lage im Titelbild, titelBand) in die Leinwand malen, ins Titelbild kopieren (2D, gleiche
       Pixel) – die Bühne wird gleich danach ohne Glas darübergemalt, sichtbar ist dort nur der Verlauf. Weg (w = 0): Ebene unsichtbar, nichts malen. */
    const titelStift = titelEbene ? titelEbene.getContext('2d') : null;
    const titelMalen = (w, u) => {
      if (!titelStift) return;
      if (!(w > 0) || !titelBand) { if (titelEbene.style.visibility !== 'hidden') titelEbene.style.visibility = 'hidden'; return; }
      const k = canvas.height / Math.max(1, canvas.clientHeight);   /* Leinwand-Pixel je CSS-Pixel */
      const y0 = Math.max(0, Math.floor(titelBand.von * k)), y1 = Math.min(canvas.height, Math.ceil(titelBand.bis * k)), hp = Math.max(1, y1 - y0);
      if (titelEbene.width !== canvas.width || titelEbene.height !== hp) { titelEbene.width = canvas.width; titelEbene.height = hp; }
      const oben = (y0 / k - titelBand.root).toFixed(3) + 'px', hoch = (hp / k).toFixed(3) + 'px';
      if (titelEbene.style.top !== oben) titelEbene.style.top = oben;
      if (titelEbene.style.height !== hoch) titelEbene.style.height = hoch;
      gl.enable(gl.SCISSOR_TEST); gl.scissor(0, canvas.height - y1, canvas.width, hp);
      run(P.titel, null, Object.assign({}, u, { feld: u.shift, maske: 0, ohne: 0 }));
      gl.disable(gl.SCISSOR_TEST);
      titelStift.clearRect(0, 0, titelEbene.width, hp);
      titelStift.drawImage(canvas, 0, y0, canvas.width, hp, 0, 0, canvas.width, hp);
      if (titelEbene.style.visibility) titelEbene.style.visibility = '';
      zustand.titelBand = [y0, y1];
    };

    const draw = () => {
      if (!field || !blurB) return;
      const pal = live.palette, aspect = canvas.width / canvas.height;
      if (FELD_PRUEF !== undefined) { gl.bindFramebuffer(gl.FRAMEBUFFER, field.fbo); gl.viewport(0, 0, field.w, field.h); gl.clearColor(FELD_PRUEF, FELD_PRUEF, FELD_PRUEF, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      else if (HINTEN === 'b' && bildTex && P.bild) { if (!bildGemalt) { const ia = bildTex.w / bildTex.h; run(P.bild, field, { bild: bildTex.tex, skala: aspect > ia ? [1, ia / aspect] : [aspect / ia, 1] }); bildGemalt = true; } }   /* steht still: einmal malen */
      else if (LEICHT && feldZeit === time) { /* Handy leicht: Verlauf steht – das Farbfeld ist schon gemalt */ }
      else { feldZeit = LEICHT ? time : -1; run(P.field, field, { time, aspect, octaves: LEICHT ? 4 : lite ? 3 : RUHE && HANDY_R ? 4 : 5, c0: pal[0], c1: pal[1], c2: pal[2], c3: pal[3], c4: pal[4] }); }
      const ch = Math.max(1, canvas.clientHeight), w = WEG ? schriftJetzt(performance.now()) : 1;
      const u = {
        field: field.tex, height: blurB.tex, htexel: hTexel || [1 / blurB.w, 1 / blurB.h], bevel, aspect, light: [light.x, light.y], ...(bandU ? { band: bandU } : {}),
        glass: WEG ? w : 1,
        form: WEG ? (reduceMq.matches ? 1 : w) : RUHE || reduceMq.matches || readyAt < 0 ? 1 : formed(performance.now() - readyAt, FORM_MS), res: [canvas.width, canvas.height],   /* weg: Aufbau rückwärts; „Bewegung reduzieren“ = nur ausblenden */
        shift: fein ? (RUHE && (!WEG || NATIV) ? lageSetzen() : window.scrollY || 0) / ch : 0, nahtlos: NAHTLOS ? 1 : 0,
        maske: WEG ? schrift.lage / ch : 0, ohne: WEG && w <= 0 ? 1 : 0, detail: HINTEN === 'a' ? 1 : 0
      };
      if (NATIV) {   /* Kopf nativ: erst die Glas-Ebene (nur das Band um den Schriftzug) malen und ins Titelbild kopieren, dann die Bühne ohne Glas */
        if (P.titel) { titelMalen(w, u); u.ohne = 1; }
        else u.maske = u.shift;   /* Shader fehlt: Schriftzug wie früher in der Bühne, mit dem Scrollen verschoben */
      }
      run(P.glass, null, u);
      zustand.bilder++;
    };

    /* Handy leicht: Bewegung nur, solange der Kopf im Bild ist, kein Blatt darüber liegt und der Wächter nicht auf Standbild steht */
    const bewegt = () => !LEICHT || (!standbild && (window.scrollY || 0) < canvas.clientHeight && !html.classList.contains('papier-an'));
    const animating = () => (fein || inView) && !document.hidden && !reduceMq.matches && bewegt();   /* fein: die Bühne liegt hinter der ganzen Seite */
    let gemalt = 0, tiefStand = false;
    /* Schriftzug weg/da (WEG): Ziel nach der Scroll-Lage, Wert nach der Zeit (weich), Lage der Maske steht still, sobald er ganz weg ist */
    const schrift = window.__glasSchrift = { ziel: 1, von: 1, wert: 1, t0: 0, lage: 0, offen: false, neu: 0 };
    const weich = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    /* Kopf nativ, gestalter 08.10.: jedes Teil (Schriftzug, Pille, Unterzeile, Knöpfe) blendet aus, BEVOR es unter die durchsichtige Kopfleiste
       rutscht – sonst stehen am Handy zwei Schriften übereinander bzw. „Anfrage starten“ halb durchsichtig auf dem Menü. Nur Deckkraft, die Lage
       macht weiter allein der Browser. Erst alles lesen, dann schreiben. */
    const KOPF_LUFT = 56;
    const teile = NATIV ? ['.ghr-title', '.ghr-eyebrow', '.ghr-desc', '.ghr-actions'].map((s) => root.querySelector(s)) : [];
    const leiste = NATIV ? document.querySelector('.glas-kopf') : null;
    function teileAusblenden(w) {
      const unten = leiste ? leiste.getBoundingClientRect().bottom : 0;
      const o = teile.map((t) => (t ? Math.max(0, Math.min(1, (t.getBoundingClientRect().top - unten) / KOPF_LUFT)) : 1));
      teile.forEach((t, i) => { if (!t || i === 0) return; const v = o[i] >= 1 ? '' : o[i].toFixed(3); if (t.style.opacity !== v) { t.style.opacity = v; t.style.pointerEvents = o[i] < 0.05 ? 'none' : ''; } });
      const ws = Math.min(w, o[0]); schrift.wert = ws; schrift.ziel = ws > 0 ? 1 : 0;   /* der gemalte Schriftzug folgt seinem (unsichtbaren) h1 */
      return ws;
    }
    function schriftJetzt(now) {
      const y = window.scrollY || 0, hh = root.offsetHeight || canvas.clientHeight || 1;
      if (NATIV) {   /* Takt: stetig aus dem Scroll-Stand, für die ganze Gruppe; die Maske liegt im Titelbild (Lage 0) */
        const w = Math.max(0, Math.min(1, (TAKT_WEG * hh - y) / Math.max(1, (TAKT_WEG - TAKT_VOLL) * hh)));
        if (w > 0 && schrift.offen) { schrift.offen = false; schrift.neu++; buildMask(); }
        schrift.ziel = w > 0 ? 1 : 0; schrift.wert = w; schrift.lage = 0;
        if (inhalt) { const o = w >= 1 ? '' : w.toFixed(3); if (inhalt.style.opacity !== o) { inhalt.style.opacity = o; inhalt.style.pointerEvents = w < 0.05 ? 'none' : ''; } if (inhalt.style.visibility !== (w <= 0 ? 'hidden' : '')) inhalt.style.visibility = w <= 0 ? 'hidden' : ''; }   /* unsichtbar = fängt keine Klicks */
        return teileAusblenden(w);
      }
      const ziel = schrift.ziel === 1 ? (y > WEG_AB * hh ? 0 : 1) : (y < WEG_ZURUECK * hh ? 1 : 0);
      if (ziel !== schrift.ziel) {
        schrift.von = schrift.wert; schrift.t0 = now; schrift.ziel = ziel;
        if (ziel === 1 && schrift.offen) { schrift.offen = false; schrift.neu++; buildMask(); }   /* während „weg“ geändert (Größe, Schrift): jetzt einmal neu */
      }
      const x = Math.min(1, (now - schrift.t0) / (reduceMq.matches ? 250 : WEG_MS)), e = reduceMq.matches ? x : weich(x);
      schrift.wert = schrift.von + (schrift.ziel - schrift.von) * e;
      /* sichtbar (auch beim Auflösen): die Maske liegt auf dem Dokument und bleibt über der Unterzeile – sonst schöbe sich der Text über den
         verschwindenden Schriftzug; ganz weg: sie bleibt stehen, nichts wird mehr verschoben */
      if (schrift.wert > 0) schrift.lage = y;
      return schrift.wert;
    }
    const frame = (now) => {
      raf = 0; gerufen = performance.now();
      if (disposed) return;
      const raw = (now - last) / 1000;
      last = now;
      const dt = Math.min(raw, 0.1);
      if (!lite && judged < 40 && animating()) {
        judged += 1; zustand.geprueft = judged;   /* Ladezustand wartet, bis über den Sparmodus entschieden ist (kein Wechsel nach dem Aufdecken) */
        if (judged > 3 && raw > SLOW_FRAME_S) slow += raw > CRAWL_FRAME_S ? 3 : 1;
        if (slow >= SLOW_FRAMES) { lite = true; zustand.lite = true; zustand.liteBei = { bild: judged, ms: Math.round(performance.now() - readyAt), blatt: html.classList.contains('papier-an') }; html.setAttribute('data-glas-lite', 'true'); size(); }
      }
      if (LEICHT && !standbild && judged2 < 120 && animating()) {   /* Handy leicht: ruckelt es trotz Sparmodus weiter, bleibt der Verlauf als Standbild stehen */
        judged2 += 1; zustand.geprueft = judged2;
        if (judged2 > 3 && raw > SLOW_FRAME_S) slow2 += raw > CRAWL_FRAME_S ? 3 : 1;
        if (slow2 >= SLOW_FRAMES) { standbild = true; zustand.standbild = true; html.setAttribute('data-glas-standbild', 'true'); }
      }
      /* fein: unter dem Hero fließt der Verlauf langsamer (bis 0,3×) und wird höchstens ~24-mal je Sekunde neu gemalt */
      const unten = fein ? Math.min(Math.max((window.scrollY || 0) / Math.max(1, canvas.clientHeight), 0), 1) : 0;
      /* Titel scharf: ab 0,74 Fensterhöhen (Schriftzug längst weg) wieder die heutige Dichte, zurück schon ab 0,66 – vor dem Wiederkommen (0,6) */
      if (scharf) { const y = window.scrollY || 0, hh = Math.max(1, canvas.clientHeight); const tief = scharfTief ? y > 0.66 * hh : y > 0.74 * hh;
        if (tief !== scharfTief) { scharfTief = tief; zustand.wechsel = (zustand.wechsel || 0) + 1; size(); } }
      /* Ladezustand (index.html #lader, 02.10.): solange er steht, bleibt der Verlauf beim ersten Bild stehen – genau das Bild, aus dem
         die Ladefarben gemacht sind; so gehen beide ohne Farbsprung ineinander über */
      if (animating() && !html.classList.contains('glas-laden')) time += dt * (1 - 0.7 * unten);
      const pt = pointer, idle = (now - pt.at) / 1000 > IDLE_S;
      const [tx, ty] = !bewegt() ? [light.x, light.y] : idle && animating() ? orbit(time) : [pt.x, pt.y];   /* Handy leicht: Standbild = Licht steht */
      light.x = follow(light.x, tx, dt, idle ? 1.2 : 7);
      light.y = follow(light.y, ty, dt, idle ? 1.2 : 7);
      if (FELD_PRUEF !== undefined) { light.x = 0.5; light.y = 0.7; }   /* Prüfschalter: Licht fest (Glanz wie im Ruhebild) */
      if (fein && !NAHTLOS) { const tief = unten >= 1 ? true : unten < 0.97 ? false : tiefStand; if (tief !== tiefStand) { tiefStand = tief; size(); } }
      const sparen = fein && !RUHE && unten >= 1 && animating() && now - gemalt < 40   /* Ruhe (Emre, 02.10.): immer volle Bildrate */
        || (WEG && unten >= 1 && now - gemalt < 30)   /* Schriftzug weg (03.10.): unter dem Titelbild gleichmäßig ~30 Bilder/s – der Verlauf ist dort dunkel und langsam */
        || (html.classList.contains('papier-zu') && now - gemalt < 250);   /* Papier-Start (03.10.): das geschlossene Blatt deckt alles – nur ~4 Bilder/s, damit das Handy fürs Reißen frei ist */
      let leichtSpart = false, tiefJetzt = '';
      if (LEICHT) {   /* bewegt: höchstens ~60 Bilder/s, solange nichts scrollt · Standbild: nur neu malen, wenn das Scrollen das Bild ändert */
        const y = window.scrollY || 0;
        tiefJetzt = y / Math.max(1, canvas.clientHeight) >= 1.55 && schrift.wert <= 0 ? 'tief@' + time : '';   /* ab 1,5 Fensterhöhen ist alles gleich dunkel (u_nahtlos) */
        leichtSpart = bewegt() ? now - gemalt < 14 && y === gemaltY : y === gemaltY || (!!tiefJetzt && tiefJetzt === gemaltTief);
      }
      if (LEICHT ? !leichtSpart : !sparen) { draw(); gemalt = now; if (LEICHT) { gemaltY = window.scrollY || 0; gemaltTief = tiefJetzt; } }
      const catching = Math.abs(light.x - tx) + Math.abs(light.y - ty) > 0.0015;
      const visible = (fein || inView) && !document.hidden;
      const forming = readyAt >= 0 && performance.now() - readyAt < FORM_MS || (WEG && schrift.wert !== schrift.ziel);   /* auch bei „Bewegung reduzieren“ bis zum Ende ausblenden */
      if (visible && (animating() || catching || forming)) raf = requestAnimationFrame(frame);
    };
    let gerufen = 0;
    const kick = () => {
      if (disposed) return;
      /* Ruhe (Emre, 02.10.): hing der Takt (Seite eingefroren beim Verlassen, Bild-Anforderung verfallen), neu starten statt zu warten */
      if (raf && performance.now() - gerufen > 500) { cancelAnimationFrame(raf); raf = 0; }
      if (raf) return; last = gerufen = performance.now(); raf = requestAnimationFrame(frame);
    };
    pointer.neustart = () => { if (disposed) return; cancelAnimationFrame(raf); raf = 0; kick(); };
    pointer.kick = kick;
    pointer.rebuild = () => { if (disposed) return; buildMask(); gemaltY = -1; kick(); };
    const klassen = LEICHT ? new MutationObserver(() => { gemaltY = -1; kick(); }) : null;
    if (klassen) klassen.observe(html, { attributes: true, attributeFilter: ['class'] });   /* Blatt weg → wieder bewegen */

    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; };
    const onRestored = () => start();   /* Vorlage: setGeneration(g + 1) → der Effekt läuft neu */
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    try {
      P = { field: program(FIELD), blur: program(fein ? BLUR_FEIN : BLUR), glass: program(fein ? GLASS_FEIN : GLASS), bild: HINTEN === 'b' ? program(BILD) : null, titel: NATIV && GLASS_NATIV && fein ? program(GLASS_NATIV) : null };
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      size();
    } catch (err) {
      return;
    }
    root.setAttribute('data-glass', 'true'); zustand.glas = true;   /* Vorlage: setGlass(true) */
    /* Prüfung: Größen und Grafikspeicher (gerechnet: Leinwand ×2 für Vorder-/Hintergrund, Farbfeld, Maske + zwei Weichzeichner-Flächen) */
    zustand.grafik = () => {
      const mb = (n) => Math.round(n / 104857.6) / 10, f = floatTargets ? 8 : 4;
      return { leinwand: canvas.width + 'x' + canvas.height, feld: field ? field.w + 'x' + field.h : '', maske: blurB ? blurB.w + 'x' + blurB.h : '',
        mb: mb(canvas.width * canvas.height * 8 + (field ? field.w * field.h * 4 : 0) + (blurB ? blurB.w * blurB.h * (4 + 2 * f) : 0)) };
    };
    readyAt = performance.now();
    kick();

    let pending = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => { if (disposed) return; size(); kick(); });
    });
    observer.observe(root);
    if (fein) observer.observe(canvas);
    const onScroll = () => kick();
    if (fein) window.addEventListener('scroll', onScroll, { passive: true });
    if (document.fonts) document.fonts.ready.then(() => pointer.rebuild());
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) kick(); });
    io.observe(root);
    const onVisibility = () => !document.hidden && kick();
    document.addEventListener('visibilitychange', onVisibility);
    reduceMq.addEventListener('change', kick);

    aufraeumen = () => {
      disposed = true;
      cancelAnimationFrame(raf); cancelAnimationFrame(pending);
      observer.disconnect(); io.disconnect(); if (klassen) klassen.disconnect(); window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMq.removeEventListener('change', kick);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      releaseTargets();
      if (maskTex) gl.deleteTexture(maskTex);
      for (const p of Object.values(P || {})) gl.deleteProgram(p.prog);
      root.setAttribute('data-glass', 'false'); zustand.glas = false;   /* Vorlage: setGlass(false) */
    };
  }

  root.addEventListener('pointermove', (e) => {   /* onPointerMove der Vorlage */
    const r = (FEIN && canvas.isConnected ? canvas : root).getBoundingClientRect();   /* fein: Licht im Fenster */
    pointer.x = (e.clientX - r.left) / r.width;
    pointer.y = 1 - (e.clientY - r.top) / r.height;
    pointer.at = performance.now();
    pointer.kick();
  });
  root.setAttribute('data-glass', 'false');
  if (RUHE) {   /* erst messen und malen, wenn die Schrift da ist (höchstens 2,5 s warten) */
    let los = false; const go = () => { if (los) return; los = true; html.classList.add('glas-schrift-da'); einpassen(); start(); if (!zustand.glas) html.classList.add('glas-ohne'); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
    setTimeout(go, 2500);
    /* ohne WebGL (oder bevor das Glas läuft) bewegt ein eigener Takt den festen Inhalt mit dem Scrollen */
    /* eigener Scroll-Takt: hält den Titelbild-Inhalt IMMER an seinem Platz – auch wenn der Glas-Takt einmal hängt (Emre, 02.10.:
       „Digitalstudio bleibt stehen, wenn man die Seite verlässt und wiederkommt“). Gleicher gerundeter Wert wie das Glas.
       Nur, wenn lageSetzen wirklich etwas verschiebt – mit „Kopf nativ“ scrollt der Browser den Inhalt selbst, beim Scrollen läuft dann nichts. */
    if (inhalt && !NATIV) { let gt = 0; window.addEventListener('scroll', () => { if (gt) return; gt = requestAnimationFrame(() => { gt = 0; lageSetzen(); }); }, { passive: true }); }
    const zurueck = () => { lageSetzen(); if (pointer.neustart) pointer.neustart(); };
    window.addEventListener('pageshow', zurueck);   /* zurück aus dem Verlauf (Seite war eingefroren) */
    document.addEventListener('visibilitychange', () => { if (!document.hidden) zurueck(); });
    window.addEventListener('focus', zurueck);
  } else start();

  /* Bildrate messen (Prüfung): Bilder je Sekunde der letzten Sekunde */
  let fpsT = performance.now(), fpsN = 0;
  setInterval(() => { const n = zustand.bilder; zustand.fps = Math.round((n - fpsN) * 1000 / Math.max(1, performance.now() - fpsT)); fpsN = n; fpsT = performance.now(); }, 1000);
  window.__glas = { zustand: () => ({ glas: zustand.glas, lite: zustand.lite, fps: zustand.fps, bilder: zustand.bilder, geprueft: zustand.geprueft || 0, leicht: LEICHT, standbild: !!zustand.standbild, angebote: angeboteFertig, masken: zustand.masken || 0, versatz, ruhe: RUHE, titel: titleEl.textContent, punkt: html.getAttribute('data-glas-punkt') || 'glas',
    weg: WEG, kopfNativ: NATIV, titelBand: zustand.titelBand || null, schrift: window.__glasSchrift ? Math.round(window.__glasSchrift.wert * 1000) / 1000 : 1,
    scharf: SCHARF, grafik: zustand.grafik ? zustand.grafik() : null, liteBei: zustand.liteBei || null, wechsel: zustand.wechsel || 0 }), zumKontakt, zuAngeboten };
})();
