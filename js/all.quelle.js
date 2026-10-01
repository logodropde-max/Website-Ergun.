/* ERGUN. – Startseite „All“ (?titel=all, 01.10.2026 – Ausnahme auf ERGUNs Wunsch: „Die Erde allein im endlosen Weltall, beim Wechseln
   zum Saturn und dann Wechsel zu endo. Das Layout soll passend geändert werden.“). Ersetzt in dieser Fassung Blume und Hintergrund.
   Ablauf (geführt, ein Impuls = ein Flug, rückwärts genauso; Kamera-Flüge und Schrift-Übergänge nach der Vorlage „Lycoris Specimen“):
     01 Start – die Erde allein im All (Tagseite, Wolken ziehen, Atmosphären-Rand) · „ERGUN.“, „Website & Automatisierung“, „Digitalstudio“
     02 Angebote – Saturn von schräg oben, die Ringe sind das Muster; daneben die drei Angebote (= Schritt ① des Formulars, preise.js);
        bei Automatisierung/Beides kreist die endo-Form als kleiner Mond
     03 Kontakt – die Erde bei Nacht mit Stadtlichtern, das Formular daneben; der Mond kreist mit, wenn endo gewählt ist.
   Echt statt KI-Look: Planeten im Code (three.js), Texturen aus gemeinfreien NASA-Bildern bzw. CC BY 4.0 (Liste in LIESMICH.md):
     Erde Tag  – NASA Visible Earth „Blue Marble: Next Generation“ (world.topo.bathy.200412), gemeinfrei
     Erde Nacht – NASA Earth Observatory „Black Marble 2016“, gemeinfrei · Wolken – NASA „Blue Marble Clouds“ (cloud_combined_2048), gemeinfrei
     Wasser-Maske – aus dem Blue-Marble-Bild berechnet · Saturn + Ringe – Solar System Scope (solarsystemscope.com/textures), CC BY 4.0
   endo-Mond: die Hero-Form der endo-Seite (Shader 1:1 aus endo-studio/js/ethereal-shader.quelle.js → js/endo-form-shader.quelle.js).
   Ein WebGL-Kontext. Bündeln wie die endo-Seite:
     NODE_PATH=C:\Users\emrer\endo-bau\node_modules npx esbuild js/all.quelle.js --bundle --minify --format=iife --target=es2019 --outfile=js/all.js
   Prüfgriff: window.__all (zustand, gehe, flugBild). */
import * as THREE from 'three';
import { vertexShader as endoVS, fragmentShader as endoFS } from './endo-form-shader.quelle.js';

(function () {
  const html = document.documentElement, frage = new URLSearchParams(location.search);
  const ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const HANDY = Math.min(window.innerWidth, window.innerHeight) < 760;
  const AUFL = HANDY ? '2k' : '4k';
  const DAUER = 2.3 * (parseFloat(frage.get('zeitlupe')) || 1), NACH_SPERRE = 420;   /* ?zeitlupe=3 nur für Film-Aufnahmen */
  const RAD_SCHWELLE = 24, GESTE_PAUSE = 180, WISCH = 40;
  const FOV = 34;
  const ENDO = 'https://endo-ergun.vercel.app/';
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  function el(tag, cls, inhalt) { const e = document.createElement(tag); if (cls) e.className = cls; if (inhalt != null) e.innerHTML = inhalt; return e; }

  /* ================= Seite bauen (gleiches Formular, neue Anordnung) ================= */
  ['header.nav', 'footer.footer', '.szene', '#dschungel-vorlage', '#kristall-vorlage', '.mf-agentur'].forEach((s) => { const e = $(s); if (e) e.remove(); });
  const kopf = el('header', 'a-kopf', '<a class="a-kopf__marke" href="#start" data-ziel="0" aria-label="ERGUN. – Start">ERGUN<span>.</span></a>' +
    '<nav class="a-kopf__links" aria-label="Hauptnavigation"><a class="a-kopf__start" href="#start" data-ziel="0">Start</a><a href="#angebote-bereich" data-ziel="1">Angebote</a>' +
    '<a href="#kontakt-bereich" data-ziel="2">Kontakt</a><a href="' + ENDO + '" data-endo-link>endo <span aria-hidden="true">↗</span></a></nav>');
  const buehne = el('div', 'a-buehne'); buehne.setAttribute('aria-hidden', 'true');
  const leinwand = el('canvas', 'a-leinwand'); buehne.appendChild(leinwand);
  const stand = el('div', 'a-stand'); buehne.appendChild(stand);
  const raster = el('div', 'a-raster', '<i></i><i></i><i></i><i></i>'); buehne.appendChild(raster);   /* feine Haarlinien wie ein Sucher */

  const START = el('section', 'a-folie a-folie--start', '<div class="a-start">' +
    '<p class="a-kicker" data-a-rein style="--i:0">Digitalstudio</p>' +
    '<h1 class="a-titel" data-a-rein style="--i:1">ERGUN<span>.</span></h1>' +
    '<p class="a-unter" data-a-rein style="--i:2">Website &amp; Automatisierung</p></div>' +
    '<p class="a-marke a-marke--start" data-a-rein style="--i:3" aria-hidden="true"><span>01 / 03</span><span>Erde · Tagseite</span></p>');
  START.id = 'start'; START.setAttribute('aria-label', 'Start');
  const ANG = el('section', 'a-folie a-folie--angebote', '<div class="a-angebote"><p class="a-abschnitt" data-a-rein style="--i:0"><span>02</span>Angebote</p></div>' +
    '<p class="a-marke a-marke--saturn" data-a-rein style="--i:5" aria-hidden="true"><span>02 / 03</span><span>Saturn</span></p>');
  ANG.id = 'angebote-bereich'; ANG.setAttribute('aria-label', 'Angebote');
  const KON = el('section', 'a-folie a-folie--kontakt', '<div class="a-kontakt"><p class="a-abschnitt" data-a-rein style="--i:0"><span>03</span>Kontakt</p></div>' +
    '<p class="a-marke a-marke--nacht" aria-hidden="true"><span>03 / 03</span><span>Erde · Nachtseite</span></p>');
  KON.id = 'kontakt-bereich'; KON.setAttribute('aria-label', 'Kontakt');
  const folien = [START, ANG, KON];
  const band = el('div', 'a-folien'); folien.forEach((f) => band.appendChild(f));
  const haupt = $('main#inhalt');
  document.body.insertBefore(kopf, document.body.firstChild);
  document.body.insertBefore(buehne, kopf.nextSibling);
  document.body.insertBefore(band, buehne.nextSibling);
  if (haupt) { haupt.setAttribute('data-a-rein', ''); haupt.style.setProperty('--i', '1'); $('.a-kontakt', KON).appendChild(haupt); }
  const fuss = el('footer', 'a-fuss', '<nav aria-label="Kontakt"><a href="#kontakt-bereich" data-ziel="2" data-a-weg="whatsapp">WhatsApp</a><a href="mailto:ergun.eu@gmail.com">E-Mail</a></nav>' +
    '<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav>' +
    '<p class="a-quellen">Bilder der Planeten: Erde – NASA (Blue Marble, Black Marble, gemeinfrei) · Saturn – <a href="https://www.solarsystemscope.com/textures/" rel="noopener" target="_blank">Solar System Scope</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a></p>');
  $('.a-kontakt', KON).appendChild(fuss);
  fuss.querySelector('[data-a-weg]').addEventListener('click', () => { const r = $('#anfrage input[name="weg"][value="whatsapp"]'); if (r && !r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); } });

  /* Angebote: die drei Knöpfe von preise.js (#angebote, Schritt ①) wandern nach 02 – als edle Liste mit Linien-Symbol und großem Preis */
  const SYMBOL = {
    website: '<rect x="4" y="7" width="32" height="26" rx="1.5"/><path d="M4 12.5h32"/><path d="M7.5 9.8h.01M10.5 9.8h.01M13.5 9.8h.01"/><path d="M14.5 12.5v20.5M25.5 12.5v20.5M4 22.8h32"/>',
    endo: '<circle cx="20" cy="20" r="5.5"/><ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(-24 20 20)"/><circle cx="33.6" cy="13.3" r="1.6" fill="currentColor" stroke="none"/>',
    beides: '<rect x="3.5" y="9" width="21" height="17" rx="1.5"/><path d="M3.5 13.5h21"/><path d="M11 13.5v12.5M3.5 19.8h21"/><ellipse cx="26" cy="23" rx="11" ry="5" transform="rotate(-24 26 23)"/><circle cx="26" cy="23" r="3.5"/>'
  };
  let angeboteFertig = false;
  function angeboteHolen() {
    const a = document.getElementById('angebote'); if (!a) return false;
    a.classList.add('a-liste'); a.setAttribute('data-a-rein', ''); a.style.setProperty('--i', '1');
    $$('.k-angebot', a).forEach((b, i) => {
      const art = b.getAttribute('data-angebot'), wort = $('.k-angebot__wort', b), info = $('.k-angebot__info', b);
      const preis = info && info.querySelector('b') ? info.querySelector('b').textContent.trim() : '';
      const satz = info ? info.textContent.replace(preis, '').replace(/^\s*·\s*/, '').trim() : '';
      const teile = preis.split(' + ');
      b.innerHTML = '';
      b.appendChild(el('span', 'a-ang__symbol', '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (SYMBOL[art] || '') + '</svg>'));
      const t = el('span', 'a-ang__text'); const w = el('span', 'k-angebot__wort'); w.textContent = wort ? wort.textContent : art; t.appendChild(w);
      const s = el('span', 'a-ang__satz'); s.textContent = satz; t.appendChild(s); b.appendChild(t);
      const p = el('span', 'a-ang__preis'); const p1 = el('span', 'a-ang__betrag'); p1.textContent = teile[0]; p.appendChild(p1);
      if (teile[1]) { const p2 = el('span', 'a-ang__monat'); p2.textContent = '+ ' + teile.slice(1).join(' + '); p.appendChild(p2); }
      b.appendChild(p);
      b.addEventListener('pointerenter', () => { zeiger.art = art; }); b.addEventListener('pointerleave', () => { if (zeiger.art === art) zeiger.art = null; });
      b.addEventListener('focus', () => { zeiger.art = art; }); b.addEventListener('blur', () => { if (zeiger.art === art) zeiger.art = null; });
    });
    const d = $('.mf-angebote__direkt', a); if (d) d.classList.add('a-direkt');
    /* Schritt ① gewählt (oder „Lieber gleich schreiben“) → Flug zu 03, das Formular ist vorbelegt (preise.js) */
    a.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.k-angebot, .mf-angebote__direkt')) setTimeout(zumFormular, 30); });
    $('.a-angebote', ANG).appendChild(a);
    angeboteFertig = true; return true;
  }
  const zeiger = { art: null };
  function gewaehlt() { const P = window.PREISE; return P && P.antworten ? P.antworten.art : null; }
  function mondGewuenscht() { const a = zeiger.art || gewaehlt(); return a === 'endo' || a === 'beides'; }

  /* ================= three.js: Weltall, Erde, Saturn, endo-Mond ================= */
  let renderer = null, scene, camera, erde, erdMat, atmo, saturn, satMat, ringMat, mond, mondMat, mondSchein, bahn, ringRand, sterne, sonne;
  const L = new THREE.Vector3(1, 0.18, 0.55).normalize();   /* eine Sonne von der Seite */
  const MOND_BAHN = 2.5, ERDE = new THREE.Vector3(0, 0, 0), SAT = new THREE.Vector3(-20, 12, 100), SAT_R = 3.2, RING_IN = 1.24, RING_AUS = 2.27;
  let geladen = false, W = 1, H = 1;

  const ERD_VS = 'varying vec2 vUv; varying vec3 vN; varying vec3 vW;\nvoid main() { vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
  const ERD_FS = [
    'uniform sampler2D uTag; uniform sampler2D uNacht; uniform sampler2D uMaske; uniform vec3 uSonne; uniform float uZeit;',
    'varying vec2 vUv; varying vec3 vN; varying vec3 vW;',
    'void main() {',
    '  vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vW); float ndl = dot(n, uSonne);',
    '  float tag = smoothstep(-0.06, 0.1, ndl);',
    '  vec3 boden = texture2D(uTag, vUv).rgb;',
    '  float wasser = texture2D(uMaske, vUv).g;',
    '  float wolke = texture2D(uMaske, vUv + vec2(uZeit * 0.0035, 0.0)).r; wolke = smoothstep(0.12, 0.85, wolke);',
    '  vec3 licht = boden * (max(ndl, 0.0) * 1.15 + 0.012);',
    '  vec3 h = normalize(uSonne + v); float glanz = pow(max(dot(n, h), 0.0), 520.0) * wasser * smoothstep(0.05, 0.4, ndl) * (1.0 - wolke) * 0.2;',
    '  licht += vec3(1.0, 0.96, 0.88) * glanz;',
    '  vec3 wolken = vec3(0.96) * (max(ndl, 0.0) * 1.05 + 0.01);',
    '  vec3 farbe = mix(licht, wolken, wolke * 0.92);',
    '  vec3 stadt = texture2D(uNacht, vUv).rgb; stadt = pow(stadt, vec3(1.6)) * vec3(1.25, 1.0, 0.72) * 2.4;',
    '  farbe += stadt * (1.0 - tag) * (1.0 - wolke * 0.75);',
    '  float rand = pow(1.0 - max(dot(n, v), 0.0), 3.0); farbe += vec3(0.32, 0.55, 1.0) * rand * 0.35 * smoothstep(-0.2, 0.45, ndl);',
    '  gl_FragColor = vec4(farbe, 1.0);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  const ATMO_FS = [
    'uniform vec3 uSonne; varying vec2 vUv; varying vec3 vN; varying vec3 vW;',
    'void main() { vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vW);',
    '  float r = pow(clamp(1.0 - dot(n, v), 0.0, 1.0), 3.6); float hell = smoothstep(-0.25, 0.55, dot(n, uSonne));',
    '  gl_FragColor = vec4(vec3(0.34, 0.58, 1.0) * r * hell * 1.6, 1.0);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  const SAT_FS = [
    'uniform sampler2D uKarte; uniform sampler2D uRing; uniform vec3 uSonne; uniform vec3 uMitte; uniform vec3 uRingN; uniform float uR; uniform float uIn; uniform float uAus;',
    'varying vec2 vUv; varying vec3 vN; varying vec3 vW;',
    'void main() { vec3 n = normalize(vN); float ndl = dot(n, uSonne);',
    '  vec3 farbe = texture2D(uKarte, vUv).rgb * (max(ndl, 0.0) * 1.1 + 0.01);',
    '  float t = dot(uMitte - vW, uRingN) / dot(uSonne, uRingN); vec3 p = vW + uSonne * t; float r = length(p - uMitte) / uR;',
    '  if (t > 0.0 && r > uIn && r < uAus) { float a = texture2D(uRing, vec2((r - uIn) / (uAus - uIn), 0.5)).a; farbe *= 1.0 - a * 0.82; }',
    '  gl_FragColor = vec4(farbe, 1.0);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  const RING_VS = 'varying vec3 vL; varying vec3 vW;\nvoid main() { vL = position; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
  const RING_FS = [
    'uniform sampler2D uRing; uniform vec3 uSonne; uniform vec3 uMitte; uniform float uR; uniform float uIn; uniform float uAus; uniform vec3 uRingN; uniform float uHell;',
    'varying vec3 vL; varying vec3 vW;',
    'void main() { float r = length(vL.xz) / uR; if (r < uIn || r > uAus) discard;',
    '  vec4 c = texture2D(uRing, vec2((r - uIn) / (uAus - uIn), 0.5));',
    '  vec3 d = vW - uMitte; float b = dot(d, uSonne); float s = 1.0;',
    '  if (b < 0.0) { float q = dot(d, d) - b * b; s = smoothstep(uR * uR * 0.985, uR * uR * 1.015, q); }',
    '  float licht = (0.35 + 0.65 * abs(dot(uRingN, uSonne))) * (0.08 + 0.92 * s) * uHell;',
    '  gl_FragColor = vec4(c.rgb * licht * 1.15, c.a * 0.96);',
    '  #include <colorspace_fragment>',
    '}'].join('\n');
  const STERN_VS = 'attribute float aHell; attribute float aGroesse; attribute vec3 aFarbe; varying float vHell; varying vec3 vFarbe; uniform float uPx;\nvoid main() { vHell = aHell; vFarbe = aFarbe; vec4 m = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * m; gl_PointSize = aGroesse * uPx; }';
  const STERN_FS = 'varying float vHell; varying vec3 vFarbe;\nvoid main() { vec2 q = gl_PointCoord - 0.5; float d = length(q); float a = smoothstep(0.5, 0.0, d); a *= a; gl_FragColor = vec4(vFarbe * vHell * a, 1.0); }';

  function texturen(fertig) {
    const lader = new THREE.TextureLoader(), t = {};
    const liste = { tag: 'bilder/all/erde-tag-' + AUFL + '.webp', nacht: 'bilder/all/erde-nacht-' + AUFL + '.webp', maske: 'bilder/all/erde-maske-2k.webp', saturn: 'bilder/all/saturn-' + AUFL + '.webp', ring: 'bilder/all/saturn-ring-' + AUFL + '.webp' };
    let offen = Object.keys(liste).length;
    Object.keys(liste).forEach((k) => {
      t[k] = lader.load(liste[k], (tx) => { if (k !== 'maske') tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); tx.needsUpdate = true; if (--offen === 0) fertig(); }, undefined, () => { if (--offen === 0) fertig(); });
      if (k === 'ring') { t[k].wrapS = THREE.ClampToEdgeWrapping; }
    });
    return t;
  }

  function sterneBauen() {
    const N = HANDY ? 1400 : 3000, M = HANDY ? 700 : 1600, pos = [], hell = [], gr = [], farbe = [];
    let s = 12345; const zufall = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const band = new THREE.Vector3(0.3, 0.85, 0.42).normalize();   /* Milchstraße: dezentes Band dichterer, schwacher Sterne */
    for (let i = 0; i < N + M; i++) {
      let v = new THREE.Vector3(zufall() * 2 - 1, zufall() * 2 - 1, zufall() * 2 - 1);
      if (i >= N) { v.addScaledVector(band, -v.dot(band) * (0.85 + 0.15 * zufall())); }
      v.normalize().multiplyScalar(900);
      const m = Math.pow(zufall(), i >= N ? 9 : 5.5), t = zufall();
      pos.push(v.x, v.y, v.z); hell.push(i >= N ? 0.18 + m * 0.3 : 0.22 + m * 1.6); gr.push(i >= N ? 1.1 : 1.0 + m * 2.4);
      const f = t < 0.15 ? [0.82, 0.88, 1.0] : t > 0.88 ? [1.0, 0.9, 0.78] : [1.0, 0.98, 0.95]; farbe.push(f[0], f[1], f[2]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aHell', new THREE.Float32BufferAttribute(hell, 1));
    g.setAttribute('aGroesse', new THREE.Float32BufferAttribute(gr, 1)); g.setAttribute('aFarbe', new THREE.Float32BufferAttribute(farbe, 3));
    const m = new THREE.ShaderMaterial({ uniforms: { uPx: { value: renderer.getPixelRatio() } }, vertexShader: STERN_VS, fragmentShader: STERN_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    return new THREE.Points(g, m);
  }

  function scheinTextur() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(190,170,255,0.55)'); r.addColorStop(0.35, 'rgba(139,92,246,0.18)'); r.addColorStop(1, 'rgba(99,102,241,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  function initGL() {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return false;
    renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, HANDY ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 1);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 2000);
    const seg = HANDY ? 72 : 128;
    const tx = texturen(() => { geladen = true; html.classList.add('all-geladen'); });
    /* Erde: Achse 23,4° geneigt */
    erdMat = new THREE.ShaderMaterial({ uniforms: { uTag: { value: tx.tag }, uNacht: { value: tx.nacht }, uMaske: { value: tx.maske }, uSonne: { value: L }, uZeit: { value: 0 } }, vertexShader: ERD_VS, fragmentShader: ERD_FS });
    erde = new THREE.Mesh(new THREE.SphereGeometry(1, seg, seg / 2), erdMat);
    const erdAchse = new THREE.Group(); erdAchse.rotation.z = 0.41; erdAchse.add(erde); erde.rotation.y = -1.9; scene.add(erdAchse);
    atmo = new THREE.Mesh(new THREE.SphereGeometry(1.022, seg, seg / 2), new THREE.ShaderMaterial({ uniforms: { uSonne: { value: L } }, vertexShader: ERD_VS, fragmentShader: ATMO_FS, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(atmo);
    /* Saturn + Ringe (Ringebene um 26,7° geneigt) */
    saturn = new THREE.Group(); saturn.position.copy(SAT); saturn.rotation.set(0.47, 0.6, 0.12); scene.add(saturn); saturn.updateMatrixWorld();
    const ringN = new THREE.Vector3(0, 1, 0).applyQuaternion(saturn.quaternion).normalize();
    satMat = new THREE.ShaderMaterial({ uniforms: { uKarte: { value: tx.saturn }, uRing: { value: tx.ring }, uSonne: { value: L }, uMitte: { value: SAT }, uRingN: { value: ringN }, uR: { value: SAT_R }, uIn: { value: RING_IN }, uAus: { value: RING_AUS } }, vertexShader: ERD_VS, fragmentShader: SAT_FS });
    const kugel = new THREE.Mesh(new THREE.SphereGeometry(SAT_R, seg, seg / 2), satMat); kugel.scale.y = 0.902; saturn.add(kugel);   /* Saturn ist abgeplattet */
    const rg = new THREE.RingGeometry(SAT_R * RING_IN, SAT_R * RING_AUS, HANDY ? 160 : 256, 1); rg.rotateX(-Math.PI / 2);
    ringMat = new THREE.ShaderMaterial({ uniforms: { uRing: { value: tx.ring }, uSonne: { value: L }, uMitte: { value: SAT }, uR: { value: SAT_R }, uIn: { value: RING_IN }, uAus: { value: RING_AUS }, uRingN: { value: ringN }, uHell: { value: 1 } }, vertexShader: RING_VS, fragmentShader: RING_FS, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    saturn.add(new THREE.Mesh(rg, ringMat));
    /* feine Bahnen (Hover): Mond-Bahn und Ringkante */
    const bahnPunkte = []; for (let i = 0; i <= 160; i++) { const w = (i / 160) * Math.PI * 2; bahnPunkte.push(new THREE.Vector3(Math.cos(w) * SAT_R * MOND_BAHN, 0, Math.sin(w) * SAT_R * MOND_BAHN)); }
    bahn = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(bahnPunkte), new THREE.LineBasicMaterial({ color: 0xc9b8f0, transparent: true, opacity: 0, depthWrite: false }));
    bahn.rotation.x = 0.08; saturn.add(bahn);
    const randPunkte = []; for (let i = 0; i <= 200; i++) { const w = (i / 200) * Math.PI * 2; randPunkte.push(new THREE.Vector3(Math.cos(w) * SAT_R * RING_AUS * 1.012, 0, Math.sin(w) * SAT_R * RING_AUS * 1.012)); }
    ringRand = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(randPunkte), new THREE.LineBasicMaterial({ color: 0xe8dfc4, transparent: true, opacity: 0, depthWrite: false }));
    saturn.add(ringRand);
    /* endo-Mond: die Hero-Form der endo-Seite (gleiche Shader und Farben wie dort) */
    mondMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uScrollProgress: { value: 0 }, uScrollVelocity: { value: 0 }, uSectionT: { value: 0 }, uSectionIndex: { value: 0 },
      uColor1: { value: new THREE.Color('#6366f1') }, uColor2: { value: new THREE.Color('#8b5cf6') }, uColor3: { value: new THREE.Color('#ec4899') }, uAccent: { value: new THREE.Color('#06ffa5') } },
      vertexShader: endoVS, fragmentShader: endoFS, transparent: true, side: THREE.DoubleSide });
    mond = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, HANDY ? 4 : 5), mondMat); mond.scale.setScalar(0.0001); scene.add(mond);
    mondSchein = new THREE.Sprite(new THREE.SpriteMaterial({ map: scheinTextur(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })); scene.add(mondSchein);
    sterne = sterneBauen(); scene.add(sterne);
    return true;
  }

  /* ================= Kamera: Haltepunkte aus dem Platz, Flüge auf Bézier-Bahnen ================= */
  const RICHT = [new THREE.Vector3(0.22, 0.16, 1).normalize(), new THREE.Vector3(0.62, 0.46, 0.64).normalize(), new THREE.Vector3(-0.97, 0.2, -0.12).normalize()];
  function lage(i) {   /* je Haltepunkt: Körper, sichtbarer Radius (Welt), Bildschirm-Radius und -Mitte (px) */
    const breit = W >= 900 && W / H > 1.05;
    if (i === 0) return breit ? { k: ERDE, R: 1.03, rpx: Math.min(H * 0.4, W * 0.27), cx: W * 0.66, cy: H * 0.54 } : { k: ERDE, R: 1.03, rpx: Math.min(W * 0.42, H * 0.25), cx: W * 0.5, cy: H * 0.34 };
    if (i === 1) return breit ? { k: SAT, R: SAT_R * RING_AUS, rpx: Math.min(W * 0.235, H * 0.38), cx: W * 0.7, cy: H * 0.53 } : { k: SAT, R: SAT_R * RING_AUS, rpx: Math.min(W * 0.4, H * 0.19), cx: W * 0.5, cy: H * 0.27 };
    return breit ? { k: ERDE, R: 1.03, rpx: Math.min(H * 0.36, W * 0.22), cx: W * 0.75, cy: H * 0.55 } : { k: ERDE, R: 1.03, rpx: Math.min(W * 0.3, H * 0.15), cx: W * 0.72, cy: H * 0.2 };
  }
  /* Saturn: Lage aus den echten Umrissen (Ringkante + Planet) in die freie Fläche einpassen – Desktop rechts neben der Liste, schmal darüber */
  const passCache = {}, probeKam = new THREE.PerspectiveCamera(FOV, 1, 0.05, 2000);
  function saturnPunkte() {
    const pkt = [];
    for (let i = 0; i < 72; i++) { const w = (i / 72) * Math.PI * 2; pkt.push(new THREE.Vector3(Math.cos(w) * SAT_R * RING_AUS, 0, Math.sin(w) * SAT_R * RING_AUS).applyMatrix4(saturn.matrixWorld)); }
    for (let i = 0; i < 48; i++) { const w = (i / 48) * Math.PI * 2, rr = SAT_R * (MOND_BAHN + 0.32); pkt.push(new THREE.Vector3(Math.cos(w) * rr, 0, Math.sin(w) * rr).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.08).applyMatrix4(saturn.matrixWorld)); }   /* Mondbahn + Mond */
    [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]].forEach((v) => pkt.push(new THREE.Vector3(v[0], v[1] * 0.902, v[2]).multiplyScalar(SAT_R).applyMatrix4(saturn.matrixWorld)));
    return pkt;
  }
  function saturnEinpassen(basis) {
    const key = W + 'x' + H; if (passCache[key]) return passCache[key];
    const breit = W >= 900 && W / H > 1.05, ziel = breit ? { x0: 0.07 * W + Math.min(780, 0.42 * W) + Math.max(36, W * 0.03), x1: W * 0.955, y0: 92, y1: H - 70 } : { x0: 16, x1: W - 16, y0: 66, y1: H * 0.465 };
    const tw = ziel.x1 - ziel.x0, th = ziel.y1 - ziel.y0, pkt = saturn ? saturnPunkte() : null;
    let s = Object.assign({}, basis, { cx: (ziel.x0 + ziel.x1) / 2, cy: (ziel.y0 + ziel.y1) / 2, rpx: Math.min(tw, th) / 2 });
    if (!pkt) return s;
    for (let n = 0; n < 4; n++) {
      const k = haltRoh(1, s); probeKam.aspect = W / H; probeKam.updateProjectionMatrix(); probeKam.position.copy(k.P); probeKam.lookAt(k.T); probeKam.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      pkt.forEach((q) => { const v = q.clone().project(probeKam), x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
      const f = Math.max((x1 - x0) / tw, (y1 - y0) / th);
      s.rpx = s.rpx / f; s.cx += (ziel.x0 + ziel.x1) / 2 - (x0 + x1) / 2; s.cy += (ziel.y0 + ziel.y1) / 2 - (y0 + y1) / 2;
    }
    passCache[key] = s; return s;
  }
  function halt(i) { const s = lage(i); return haltRoh(i, i === 1 ? saturnEinpassen(s) : s); }
  function haltRoh(i, s) {
    const th = Math.atan((s.rpx / (H / 2)) * Math.tan((FOV * Math.PI / 180) / 2)), d = s.R / Math.sin(th);
    const P = s.k.clone().addScaledVector(RICHT[i], d);
    const vor = s.k.clone().sub(P).normalize(), rechts = new THREE.Vector3().crossVectors(vor, new THREE.Vector3(0, 1, 0)).normalize(), oben = new THREE.Vector3().crossVectors(rechts, vor);
    const h = d * Math.tan((FOV * Math.PI / 180) / 2), nx = (s.cx / W) * 2 - 1, ny = 1 - (s.cy / H) * 2;
    const T = s.k.clone().addScaledVector(rechts, -nx * h * (W / H)).addScaledVector(oben, -ny * h);
    return { P, T, k: s.k };
  }
  function bezier(a, b, c, d, t) { const u = 1 - t; return new THREE.Vector3().addScaledVector(a, u * u * u).addScaledVector(b, 3 * u * u * t).addScaledVector(c, 3 * u * t * t).addScaledVector(d, t * t * t); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  const kam = { von: 0, nach: 0, t0: 0, dauer: 0 };
  let festeKamera = null;
  function kameraBei(von, nach, t) {
    const A = halt(von), B = halt(nach);
    if (von === nach || t >= 1) return t >= 1 ? B : A;
    const e = easeInOut(t), wegA = A.P.clone().sub(A.k).normalize(), wegB = B.P.clone().sub(B.k).normalize();
    const abstand = A.P.distanceTo(B.P), hebel = Math.max(3, abstand * 0.35);
    const P = bezier(A.P, A.P.clone().addScaledVector(wegA, hebel), B.P.clone().addScaledVector(wegB, hebel), B.P, e);
    /* Blickrichtung kugelig überblenden (auch bei Umdrehen um fast 180° sauber) */
    const a = A.T.clone().sub(A.P).normalize(), b = B.T.clone().sub(B.P).normalize(), s = smooth(0.12, 0.78, e);
    let th = Math.acos(Math.max(-1, Math.min(1, a.dot(b)))), blick;
    if (th < 1e-4) blick = a.clone();
    else {
      if (th > Math.PI - 0.05) { b.addScaledVector(new THREE.Vector3(0, 1, 0), 0.08).normalize(); th = Math.acos(Math.max(-1, Math.min(1, a.dot(b)))); }
      blick = a.clone().multiplyScalar(Math.sin((1 - s) * th) / Math.sin(th)).addScaledVector(b, Math.sin(s * th) / Math.sin(th)).normalize();
    }
    const fern = A.T.distanceTo(A.P) * (1 - s) + B.T.distanceTo(B.P) * s;
    return { P, T: P.clone().addScaledVector(blick, fern) };
  }

  /* ================= Folien: ein Impuls = ein Flug ================= */
  let aktiv = 0, faehrt = false, sperreBis = 0;
  function zeigeFolie(i, sofort) {
    folien.forEach((f, n) => {
      const an = n === i; f.setAttribute('aria-hidden', an ? 'false' : 'true'); f.inert = !an;
      if (!an) { f.classList.remove('ist-da'); if (sofort) f.classList.remove('ist-aktiv'); else setTimeout(() => { if (aktiv !== n) f.classList.remove('ist-aktiv'); }, 700); }
    });
    const f = folien[i]; f.classList.add('ist-aktiv');
    if (sofort) f.classList.add('ist-da'); else setTimeout(() => { if (aktiv === i) f.classList.add('ist-da'); }, DAUER * 1000 * 0.55);
    $$('[data-ziel]', kopf).forEach((a) => { if (Number(a.getAttribute('data-ziel')) === i && !a.classList.contains('a-kopf__marke')) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    html.setAttribute('data-all', String(i));
  }
  function gehe(ziel, opt) {
    opt = opt || {};
    ziel = Math.max(0, Math.min(2, ziel));
    if (ziel === aktiv && !opt.sofort) return false;
    const von = aktiv < 0 ? ziel : aktiv; aktiv = ziel;
    festeKamera = null;
    if (opt.verlauf !== 'keins') history.replaceState(null, '', '#' + folien[ziel].id);
    const d = opt.sofort || ruhig ? 0 : DAUER;
    kam.von = von; kam.nach = ziel; kam.t0 = performance.now(); kam.dauer = d * 1000;
    faehrt = d > 0; sperreBis = Infinity;
    if (d === 0) { faehrt = false; sperreBis = performance.now() + NACH_SPERRE; }
    else setTimeout(() => { faehrt = false; sperreBis = performance.now() + NACH_SPERRE; }, d * 1000);
    if (ziel === 2 && !opt.amEnde) KON.scrollTop = 0;
    zeigeFolie(ziel, d === 0);
    starten();
    return true;
  }
  function gesperrt() { return faehrt || performance.now() < sperreBis; }
  function inEingabe(e) { return !!(e && e.closest && e.closest('input, textarea, select, [contenteditable="true"]')); }
  function kannInnen(f, dir) { if (f.scrollHeight <= f.clientHeight + 2) return false; return dir > 0 ? f.scrollTop + f.clientHeight < f.scrollHeight - 2 : f.scrollTop > 2; }
  let letzteRad = 0, gesteRand = null, gesteSumme = 0, gesteVerbraucht = false;
  function rad(e) {
    if (e.ctrlKey) return;
    const jetzt = performance.now(), dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * H : e.deltaY, neu = jetzt - letzteRad > GESTE_PAUSE;
    letzteRad = jetzt;
    if (Math.abs(dy) < Math.abs(e.deltaX)) return;
    const f = folien[aktiv], dir = dy > 0 ? 1 : -1;
    if (neu) { gesteVerbraucht = false; gesteSumme = 0; gesteRand = !kannInnen(f, dir) ? dir : null; }
    if (gesperrt() || gesteVerbraucht) { e.preventDefault(); return; }
    if (kannInnen(f, dir)) { gesteRand = null; return; }
    e.preventDefault();
    if (gesteRand !== dir) return;
    gesteSumme += dy;
    if (Math.abs(gesteSumme) >= RAD_SCHWELLE) { gesteVerbraucht = true; gehe(aktiv + dir, { amEnde: dir < 0 }); }
  }
  let tStart = null;
  function tAn(e) { if (e.touches.length !== 1) { tStart = null; return; } const f = folien[aktiv]; tStart = { y: e.touches[0].clientY, x: e.touches[0].clientX, oben: !kannInnen(f, -1), unten: !kannInnen(f, 1), eingabe: inEingabe(e.target), zu: false }; }
  function tZug(e) {
    if (!tStart || tStart.eingabe) return;
    const dy = tStart.y - e.touches[0].clientY, dx = tStart.x - e.touches[0].clientX;
    if (Math.abs(dx) > Math.abs(dy)) return;
    if (gesperrt()) { e.preventDefault(); return; }
    if ((dy > 0 && tStart.unten) || (dy < 0 && tStart.oben)) { e.preventDefault(); tStart.zu = true; }
  }
  function tAus(e) { if (!tStart || !tStart.zu) { tStart = null; return; } const dy = tStart.y - (e.changedTouches[0] ? e.changedTouches[0].clientY : tStart.y); tStart = null; if (!gesperrt() && Math.abs(dy) >= WISCH) gehe(aktiv + (dy > 0 ? 1 : -1), { amEnde: dy < 0 }); }
  function taste(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || inEingabe(e.target)) return;
    if (e.target && e.target.closest && e.target.closest('button, a, summary, label') && (e.key === ' ' || e.key === 'Enter')) return;
    let dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1; else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
    else if (e.key === 'Home') { e.preventDefault(); if (!gesperrt()) gehe(0); return; } else if (e.key === 'End') { e.preventDefault(); if (!gesperrt()) gehe(2); return; }
    if (!dir) return;
    const f = folien[aktiv]; e.preventDefault();
    if (gesperrt() || e.repeat) return;
    if (kannInnen(f, dir)) { f.scrollBy({ top: dir * f.clientHeight * 0.8, behavior: ruhig ? 'auto' : 'smooth' }); return; }
    gehe(aktiv + dir, { amEnde: dir < 0 });
  }
  function zumFormular() { gehe(2); const z = $('#preise .mf__oben:not([hidden])') || $('#preise .mf__raster'); if (z) setTimeout(() => { KON.scrollTo({ top: Math.max(0, z.offsetTop - 24), behavior: ruhig ? 'auto' : 'smooth' }); }, aktiv === 2 ? 0 : 60); }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-ziel]');
    if (a) { e.preventDefault(); const z = Number(a.getAttribute('data-ziel')); if (z === aktiv && z === 2) { KON.scrollTo({ top: 0, behavior: ruhig ? 'auto' : 'smooth' }); return; } gehe(z); return; }
    /* Klick auf den endo-Mond öffnet die endo-Seite */
    if (!e.target.closest || e.target.closest('a, button, input, textarea, select, label, summary, form, .a-kopf')) return;
    if (mondTreffer(e.clientX, e.clientY)) { e.preventDefault(); location.href = ENDO; }
  });
  window.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' || !renderer) return; const t = e.target.closest && e.target.closest('a, button, input, textarea, select, label, form'); html.classList.toggle('all-mond-zeiger', !t && mondTreffer(e.clientX, e.clientY)); }, { passive: true });
  const strahl = new THREE.Raycaster(), maus = new THREE.Vector2();
  function mondTreffer(x, y) {
    if (!mond || mond.scale.x < 0.05) return false;
    maus.set((x / W) * 2 - 1, -(y / H) * 2 + 1); strahl.setFromCamera(maus, camera);
    return strahl.ray.distanceToPoint(mond.position) < mond.scale.x * 1.6;
  }

  /* ================= Bildschleife ================= */
  let zeit = 0, letzt = performance.now(), laeuft = false, sichtbarMond = 0, mondAuf = 0, bahnHell = 0, randHell = 0;
  const kamP = new THREE.Vector3(), kamT = new THREE.Vector3();
  function groesse() {
    W = window.innerWidth; H = window.innerHeight;
    if (!renderer) return;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    if (sterne) sterne.material.uniforms.uPx.value = renderer.getPixelRatio();
  }
  function bild(jetzt) {
    if (laeuft) requestAnimationFrame(bild);
    const dt = Math.min(0.05, (jetzt - letzt) / 1000); letzt = jetzt; if (!ruhig) zeit += dt;
    const t = kam.dauer > 0 ? Math.min(1, (jetzt - kam.t0) / kam.dauer) : 1;
    const k = festeKamera || kameraBei(kam.von, kam.nach, t);
    kamP.copy(k.P); kamT.copy(k.T); camera.position.copy(kamP); camera.lookAt(kamT);
    erde.rotation.y = -1.9 + zeit * 0.012; erdMat.uniforms.uZeit.value = zeit;
    saturn.children[0].rotation.y = zeit * 0.02;
    atmo.position.copy(ERDE);
    /* endo-Mond: bei Angebote um den Saturn, bei Kontakt klein um die Erde – nur wenn Automatisierung/Beides gezeigt oder gewählt */
    const amSaturn = (kam.nach === 1 && t > 0.6) || (kam.von === 1 && t < 0.35) || (aktiv === 1 && t >= 1);
    const anErde = aktiv === 2 && t > 0.7;
    const soll = mondGewuenscht() && (amSaturn || anErde) ? 1 : 0;
    mondAuf += (soll - mondAuf) * (ruhig ? 1 : 1 - Math.exp(-dt * 4));
    const zentrum = anErde ? ERDE : SAT, bahnR = anErde ? 1.3 : SAT_R * MOND_BAHN, groesseM = anErde ? 0.13 : SAT_R * 0.3, w = zeit * (anErde ? 0.35 : 0.22) + 0.8;
    let ort;
    if (anErde) {   /* an der Erde: Bahn von vorn nach hinten NEBEN der Erde (Desktop rechts, schmal links) – nie über dem Formular */
      const vor = ERDE.clone().sub(camera.position).normalize(), rechts = new THREE.Vector3().crossVectors(vor, new THREE.Vector3(0, 1, 0)).normalize(), hoch = new THREE.Vector3().crossVectors(rechts, vor);
      const seite = W >= 900 && W / H > 1.05 ? 1 : -1;
      ort = hoch.multiplyScalar(Math.cos(w) * bahnR).addScaledVector(vor, Math.sin(w) * bahnR).addScaledVector(rechts, seite * 1.12);
    } else ort = new THREE.Vector3(Math.cos(w) * bahnR, 0, Math.sin(w) * bahnR).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.08).applyQuaternion(saturn.quaternion);
    mond.position.copy(zentrum).add(ort); mond.scale.setScalar(Math.max(0.0001, (groesseM / 1.5) * mondAuf));
    mond.rotation.y = zeit * 0.15; mond.rotation.x = 0.4;
    mondMat.uniforms.uTime.value = ruhig ? 2.0 : zeit;
    mondSchein.position.copy(mond.position); mondSchein.scale.setScalar(groesseM * 7 * mondAuf); mondSchein.material.opacity = 0.95 * mondAuf;
    const hoverArt = zeiger.art;
    bahnHell += (((hoverArt === 'endo' || hoverArt === 'beides') && aktiv === 1 ? 0.32 : 0) - bahnHell) * (1 - Math.exp(-dt * 6));
    randHell += ((hoverArt === 'website' && aktiv === 1 ? 0.4 : 0) - randHell) * (1 - Math.exp(-dt * 6));
    bahn.material.opacity = bahnHell; ringRand.material.opacity = randHell;
    sterne.position.copy(kamP).multiplyScalar(0.985);   /* Sterne fast unendlich weit – nur ein Hauch Parallaxe */
    renderer.render(scene, camera);
    if (ruhig && !festeKamera) laeuft = false;
  }
  function starten() { if (laeuft || !renderer || document.hidden) return; laeuft = true; letzt = performance.now(); requestAnimationFrame(bild); }
  function stoppen() { laeuft = false; }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stoppen(); else starten(); });

  /* ================= Start ================= */
  function ausAdresse() { const h = (location.hash || '').slice(1); return h === 'angebote-bereich' || h === 'angebote' ? 1 : h === 'kontakt-bereich' || h === 'kontakt' || h === 'preise' ? 2 : 0; }
  function los() {
    html.classList.add('titel-all-an');
    let ok = false; try { ok = !/[?&]webgl=aus\b/.test(location.search) && initGL(); } catch (e) { ok = false; renderer = null; }
    if (!ok) html.classList.add('all-ohne');
    groesse();
    const i = frage.get('all') !== null ? Math.max(0, Math.min(2, parseInt(frage.get('all'), 10) || 0)) : ausAdresse();
    aktiv = -1; gehe(i, { sofort: true, verlauf: 'keins' });
    window.addEventListener('wheel', rad, { passive: false });
    window.addEventListener('touchstart', tAn, { passive: true }); window.addEventListener('touchmove', tZug, { passive: false }); window.addEventListener('touchend', tAus, { passive: true });
    window.addEventListener('keydown', taste);
    window.addEventListener('hashchange', () => gehe(ausAdresse(), { verlauf: 'keins' }));
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(groesse, 100); });
    document.addEventListener('focusin', (e) => { const f = e.target.closest && e.target.closest('.a-folie'); if (f) { const n = folien.indexOf(f); if (n >= 0 && n !== aktiv) gehe(n); } });
    (function warten(n) { if (!angeboteHolen() && n < 60) setTimeout(() => warten(n + 1), 50); })(0);
    document.addEventListener('preise:auswahl', () => { if (ruhig) starten(); });
    /* preise.js führt nach der Wahl eines Angebots zum Formular – hier = Bereich 03 */
    window.__kristall = { zumKontakt: zumFormular, zuAngeboten: () => gehe(1) };
    if (renderer) starten();
  }
  window.__all = {
    zustand: () => ({ aktiv, faehrt, gesperrt: gesperrt(), geladen, gl: !!renderer, mond: +(mondAuf || 0).toFixed(2), angebote: angeboteFertig, handy: HANDY, aufl: AUFL, folieOben: folien[aktiv] ? folien[aktiv].scrollTop : 0 }),
    gehe: (n) => gehe(n),
    flugBild: (von, nach, t) => { festeKamera = kameraBei(von, nach, t); starten(); return true; },   /* hält das Bild, bis gehe() oder weiter() */
    weiter: () => { festeKamera = null; starten(); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
