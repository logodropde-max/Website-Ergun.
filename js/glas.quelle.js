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
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- Inhalte (Vorschau-Varianten) ---------- */
  root.style.height = '100svh';
  root.style.background = fallbackBackground(palette);
  let buehne = null;
  if (FEIN) {   /* die Leinwand wandert in eine feste Bühne am Anfang von <body> (.ghr-root hat container-type = eigener Bezugsrahmen für fixed) */
    buehne = el('div', 'glas-buehne'); buehne.setAttribute('aria-hidden', 'true');
    buehne.style.background = fallbackBackground(palette);
    buehne.appendChild(canvas); document.body.insertBefore(buehne, document.body.firstChild);
    root.style.background = 'transparent';
    /* je Zeichen ein <span>: die Abstände werden optisch ausgeglichen (abstaende()); der Text bleibt „ERGUN.“ für Suche und Screenreader */
    if (frage.get('punkt') !== 'orange') titleEl.innerHTML = '<span class="ghr-word">' + 'ERGUN.'.split('').map((z) => '<span class="glas-z">' + z + '</span>').join('') + '</span>';
  }
  if (frage.get('punkt') === 'orange') {   /* Vergleich: der Punkt als solides Marken-Orange über dem Glas (nicht Teil des Glases) */
    titleEl.innerHTML = '<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>';
    html.setAttribute('data-glas-punkt', 'orange');
  }
  if (frage.get('text') === 'b') { const d = root.querySelector('[data-glas-text]'); if (d) d.textContent = 'Website & Automatisierung für Unternehmen.'; }

  /* ---------- Seite um den Hero: Altlasten raus, Angebote + Formular + Fußzeile im Glas-Stil ---------- */
  ['header.nav', 'footer.footer', '.szene', '#dschungel-vorlage', '#kristall-vorlage', '#glas-vorlage', '.mf-agentur'].forEach((s) => { const e = $(s); if (e) e.remove(); });
  const haupt = $('main#inhalt'), P = window.PREISE;
  const fuss = el('footer', 'glas-fuss');
  fuss.innerHTML = '<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>' +
    '<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div>' +
    '<p class="glas-fuss__klein" data-glas-klein></p>' +
    '<p class="glas-fuss__klein glas-fuss__quellen">Bilder der Planeten der Fassung „All“: Erde – NASA (gemeinfrei) · Saturn – <a href="https://www.solarsystemscope.com/textures/" rel="noopener" target="_blank">Solar System Scope</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a></p>';
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
  const dbg = frage.get('glasdbg');   /* Prüfschalter: Kanäle der Höhenkarte zeigen (r = Kante, g = Maske, b = Wölbung) */
  if (FEIN && dbg) GLASS_FEIN = GLASS_FEIN.replace('o = vec4(col, 1.0);\n}', 'vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3(' + (dbg === 'g' ? 'dh.g' : dbg === 'b' ? 'dh.b' : 'dh.r') + '), vec3(0.25)), 1.0);\n}');
  const fehlt = BLUR_FEIN === BLUR || GLASS_FEIN.indexOf('u_shift') < 0;   /* Vorlage geändert? dann sicher die alte Fassung */
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
    const fs = parseFloat(getComputedStyle(titleEl).fontSize) || 64, breite = wort.getBoundingClientRect().width;
    const zugabe = fs * 0.16, frei = root.clientWidth * (1 - 2 * 0.06);
    if (breite + zugabe > frei) titleEl.style.fontSize = (fs * frei / (breite + zugabe)).toFixed(2) + 'px';
  }
  if (fein) { einpassen(); window.addEventListener('resize', einpassen); }

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
    const gl = /[?&]webgl=aus\b/.test(location.search) ? null : canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return;
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float') || (fein && !!gl.getExtension('EXT_color_buffer_half_float'));   /* fein: auch Halb-Fließkomma (iPhone) */

    let disposed = false, raf = 0, last = 0, time = 0, inView = true, lite = false, judged = 0, slow = 0;
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
      const w = Math.max(1, Math.round(cr.width * scale)), h = Math.max(1, Math.round(cr.height * scale));
      const cs = getComputedStyle(heading), fontPx = parseFloat(cs.fontSize) || 64, sy = window.scrollY || 0;
      const zeichen = [], tw = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) for (let i = 0; i < n.data.length; i++) {
        if (/\s/.test(n.data[i])) continue;
        const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
        const b = rg.getBoundingClientRect(); zeichen.push([n.data[i], b.left - cr.left, b.top + sy]);
      }
      const layout = [w, h, scale, cs.font].concat(zeichen.map((z) => z[0] + '@' + z[1].toFixed(1) + ',' + z[2].toFixed(1))).join('|');
      if (layout === built) return;
      built = layout;
      const cnv = document.createElement('canvas');
      cnv.width = w; cnv.height = h;
      const c = cnv.getContext('2d');
      if (!c) return;
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + (fontPx * scale).toFixed(2) + 'px ' + cs.fontFamily;
      if ('letterSpacing' in c) c.letterSpacing = '0px';
      c.fillStyle = '#fff'; c.textBaseline = 'alphabetic';
      zeichen.forEach((z) => {
        const ascent = c.measureText(z[0]).fontBoundingBoxAscent || fontPx * scale * 0.8;
        c.fillText(z[0], z[1] * scale, z[2] * scale + ascent);
      });
      kanteAusAbstand(c, w, h, bevelPx(fontPx, scale));
      return { cnv, w, h, fontPx, scale };
    };
    const hochladen = (cnv, w, h, fontPx, scale) => {   /* dieselben Schritte wie im Pfad der Vorlage darunter */
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
      const dpr = fein && tiefStand ? 0.35 : lite ? (fein ? Math.min(window.devicePixelRatio || 1, 1) : 0.65) : Math.min(window.devicePixelRatio || 1, 2);   /* fein: unter dem Hero grob (weich, unscharf, kaum Rechenzeit); Lite nie unter 1 – sonst zackige Buchstaben */
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      const fs = lite ? 0.25 : 0.4;
      const fw = Math.max(1, Math.round(w * fs)), fh = Math.max(1, Math.round(h * fs));
      if (!field || field.w !== fw || field.h !== fh) {
        if (field) { gl.deleteTexture(field.tex); gl.deleteFramebuffer(field.fbo); }
        field = makeTarget(fw, fh, false);
      }
      buildMask();
    };

    const draw = () => {
      if (!field || !blurB) return;
      const pal = live.palette, aspect = canvas.width / canvas.height;
      run(P.field, field, { time, aspect, octaves: lite ? 3 : 5, c0: pal[0], c1: pal[1], c2: pal[2], c3: pal[3], c4: pal[4] });
      run(P.glass, null, {
        field: field.tex, height: blurB.tex, htexel: [1 / blurB.w, 1 / blurB.h], bevel, aspect, light: [light.x, light.y], glass: 1,
        form: reduceMq.matches || readyAt < 0 ? 1 : formed(performance.now() - readyAt, FORM_MS), res: [canvas.width, canvas.height],
        shift: fein ? (window.scrollY || 0) / Math.max(1, canvas.clientHeight) : 0
      });
      zustand.bilder++;
    };

    const animating = () => (fein || inView) && !document.hidden && !reduceMq.matches;   /* fein: die Bühne liegt hinter der ganzen Seite */
    let gemalt = 0, tiefStand = false;
    const frame = (now) => {
      raf = 0;
      if (disposed) return;
      const raw = (now - last) / 1000;
      last = now;
      const dt = Math.min(raw, 0.1);
      if (!lite && judged < 40 && animating()) {
        judged += 1;
        if (judged > 3 && raw > SLOW_FRAME_S) slow += raw > CRAWL_FRAME_S ? 3 : 1;
        if (slow >= SLOW_FRAMES) { lite = true; zustand.lite = true; html.setAttribute('data-glas-lite', 'true'); size(); }
      }
      /* fein: unter dem Hero fließt der Verlauf langsamer (bis 0,3×) und wird höchstens ~24-mal je Sekunde neu gemalt */
      const unten = fein ? Math.min(Math.max((window.scrollY || 0) / Math.max(1, canvas.clientHeight), 0), 1) : 0;
      if (animating()) time += dt * (1 - 0.7 * unten);
      const pt = pointer, idle = (now - pt.at) / 1000 > IDLE_S;
      const [tx, ty] = idle && animating() ? orbit(time) : [pt.x, pt.y];
      light.x = follow(light.x, tx, dt, idle ? 1.2 : 7);
      light.y = follow(light.y, ty, dt, idle ? 1.2 : 7);
      if (fein) { const tief = unten >= 1 ? true : unten < 0.97 ? false : tiefStand; if (tief !== tiefStand) { tiefStand = tief; size(); } }
      const sparen = fein && unten >= 1 && animating() && now - gemalt < 40;
      if (!sparen) { draw(); gemalt = now; }
      const catching = Math.abs(light.x - tx) + Math.abs(light.y - ty) > 0.0015;
      const visible = (fein || inView) && !document.hidden;
      const forming = readyAt >= 0 && performance.now() - readyAt < FORM_MS;
      if (visible && (animating() || catching || forming)) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (raf || disposed) return; last = performance.now(); raf = requestAnimationFrame(frame); };
    pointer.kick = kick;
    pointer.rebuild = () => { if (disposed) return; buildMask(); kick(); };

    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; };
    const onRestored = () => start();   /* Vorlage: setGeneration(g + 1) → der Effekt läuft neu */
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    try {
      P = { field: program(FIELD), blur: program(fein ? BLUR_FEIN : BLUR), glass: program(fein ? GLASS_FEIN : GLASS) };
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
      observer.disconnect(); io.disconnect(); window.removeEventListener('scroll', onScroll);
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
  start();

  /* Bildrate messen (Prüfung): Bilder je Sekunde der letzten Sekunde */
  let fpsT = performance.now(), fpsN = 0;
  setInterval(() => { const n = zustand.bilder; zustand.fps = Math.round((n - fpsN) * 1000 / Math.max(1, performance.now() - fpsT)); fpsN = n; fpsT = performance.now(); }, 1000);
  window.__glas = { zustand: () => ({ glas: zustand.glas, lite: zustand.lite, fps: zustand.fps, angebote: angeboteFertig, titel: titleEl.textContent, punkt: html.getAttribute('data-glas-punkt') || 'glas' }), zumKontakt, zuAngeboten };
})();
