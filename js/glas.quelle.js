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
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- Inhalte (Vorschau-Varianten) ---------- */
  root.style.height = '100svh';
  root.style.background = fallbackBackground(palette);
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

  function start() {
    if (aufraeumen) { aufraeumen(); aufraeumen = null; }
    const gl = /[?&]webgl=aus\b/.test(location.search) ? null : canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return;
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');

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
    const buildMask = () => {
      const heading = titleEl;
      if (!heading || !field) return;
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
      const dpr = lite ? 0.65 : Math.min(window.devicePixelRatio || 1, 2);
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
        form: reduceMq.matches || readyAt < 0 ? 1 : formed(performance.now() - readyAt, FORM_MS), res: [canvas.width, canvas.height]
      });
      zustand.bilder++;
    };

    const animating = () => inView && !document.hidden && !reduceMq.matches;
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
      if (animating()) time += dt;
      const pt = pointer, idle = (now - pt.at) / 1000 > IDLE_S;
      const [tx, ty] = idle && animating() ? orbit(time) : [pt.x, pt.y];
      light.x = follow(light.x, tx, dt, idle ? 1.2 : 7);
      light.y = follow(light.y, ty, dt, idle ? 1.2 : 7);
      draw();
      const catching = Math.abs(light.x - tx) + Math.abs(light.y - ty) > 0.0015;
      const visible = inView && !document.hidden;
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
      P = { field: program(FIELD), blur: program(BLUR), glass: program(GLASS) };
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
    if (document.fonts) document.fonts.ready.then(() => pointer.rebuild());
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) kick(); });
    io.observe(root);
    const onVisibility = () => !document.hidden && kick();
    document.addEventListener('visibilitychange', onVisibility);
    reduceMq.addEventListener('change', kick);

    aufraeumen = () => {
      disposed = true;
      cancelAnimationFrame(raf); cancelAnimationFrame(pending);
      observer.disconnect(); io.disconnect();
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
    const r = root.getBoundingClientRect();
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
