/* endo.ai Hero: lebendige Drahtgitter-Kugel (nach Emres Vorlage „Anomalous Matter").
   26.09. spät: lebendiger – Fliehkraft nach Fängen, Schlucken wie Gelee, Atmen, feinere Oberfläche, Schimmer (Werte in KUGEL).
   Quelle für ki/js/orb.js. Neu bauen (three 0.186.1 + esbuild in einem Ordner AUSSERHALB des Vaults installieren):
   NODE_PATH=<ordner>/node_modules <ordner>/node_modules/.bin/esbuild ki/js/orb.quelle.js --bundle --minify --format=iife --target=es2018 --outfile=ki/js/orb.js */
import { Scene, PerspectiveCamera, WebGLRenderer, IcosahedronGeometry, ShaderMaterial, Color, Vector3, Vector4, Quaternion, Mesh } from 'three';

/* ===== Einstellwerte für das Einsammeln der Datenpakete (26.09., Emre: „Frequenz/Impuls – schnell hin, seidig zurück“) =====
   Winkel in Radiant, Längen als Anteil vom Kugelradius, Zeiten in Millisekunden. */
const KUGEL = {
  breite: 0.11,          // Zunge: Gauß-Breite σ (≈ 6°) → sichtbare Öffnung ca. 15–20°
  breiteHandy: 0.14,     // am Handy etwas breiter (gröberes Gitter, bleibt weich)
  umfeld: 0.45,          // feiner Übergang: Umgebung wird in diesem Bereich (σ ≈ 26°) leicht mitgezogen …
  umfeldAnteil: 0.12,    // … mit 12 % der Zungenlänge
  maxLaenge: 0.55,       // weiteste Ausstülpung: 55 % des Radius
  hinMs: 190,            // Ausstrecken zum Paket (Ease-out, Quart)
  daempfung: 0.58,       // Rückweg: gedämpfte Feder – 26.09. spät weicher (0,58 → sichtbares, elastisches Nachfedern)
  frequenz: 7.5,         // Eigenfrequenz der Feder (rad/s) → trotzdem nach gut 1 s in Ruhe
  zurueckEndeMs: 1250,   // danach ist der Arm sicher wieder ganz eingezogen
  welleK: 38,            // feine Welle entlang der Zunge: Wellenzahl …
  welleW: 44,            // … Tempo (rad/s) …
  welleAmp: 0.018,       // … und Höhe (Welteinheiten, klein)
  welleNachMs: 260,      // die Welle klingt nach dem Einsammeln so schnell aus
  blitzMs: 150,          // Aufglimmen an der Spitze beim Einsammeln
  ringMs: 1150,          // Wellenring über die Oberfläche (2 Ringe)
  ringWeg: 2.5,          // so weit (rad) läuft der Ring
  ringBreite: 0.16,
  ringAmp: 0.028,        // Ring-Höhe (Welteinheiten, dezent)
  glanz: 0.55,           // wie stark Zunge, Blitz und Ring das Drahtgitter aufhellen
  /* Lebewesen (Emre, 26.09. spät: „kosmischer, elastischer, wie ein Lebewesen – Zentrifugalkraft“) */
  drehen: 0.12,          // ruhige Eigendrehung (rad/s)
  drehStoss: 0.85,       // jedes eingesammelte Paket gibt der Drehung einen Schub (rad/s) …
  drehMax: 2.2,          // … höchstens so viel zusätzlich
  drehAbklingen: 1.7,    // … und klingt in ca. 1,7 s wieder ab
  flieh: 0.03,           // Fliehkraft: Äquator wölbt sich mit (Zusatzdrehung)² nach außen …
  fliehMax: 0.075,       // … höchstens 7,5 % des Radius
  fliehFeder: [55, 4.8], // … und folgt elastisch (Federhärte, Dämpfung → leichtes Nachwabbeln)
  schluck: 0.42,         // Schlucken: nach dem Fang dehnt sie sich kurz in Fangrichtung (Volumen bleibt) …
  schluckStoss: 1.3,     // … Anstoß pro Paket (Nachricht ohne Arm: 0,6)
  schluckFeder: [95, 6.5], // … und federt wie Gelee zurück
  atmen: [0.012, 0.006], // langsames Atmen (zwei überlagerte Wellen, Anteil vom Radius)
  feinNoise: 0.016,      // zweite, feinere und schnellere Oberflächenbewegung (organisch, bewusst leise)
  schimmer: 0.1          // leise wandernde Lichtflecken im Gitter (kosmisch)
};

const buehne = document.querySelector('[data-orb]');
if (buehne) start(buehne);

function webglMoeglich() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}
function f(v) { return Number(v).toFixed(5); }   // Zahl als GLSL-Fließkommazahl (Funktion: steht beim Start schon bereit)

function start(el) {
  if (!webglMoeglich()) { el.classList.add('orb--ohne'); return; }
  const ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const klein = window.matchMedia && matchMedia('(max-width: 860px)').matches;
  const feineMaus = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000);
  /* Kugel (Radius 1,2 + 0,2 Ausschlag) füllt höchstens 66 % der kleineren Seite, damit sie immer ganz zu sehen ist */
  const abstand = () => Math.max(2.6, 1.45 / (0.66 * Math.tan(37.5 * Math.PI / 180) * Math.min(1, el.clientWidth / el.clientHeight)));
  camera.position.z = abstand();

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(el.clientWidth, el.clientHeight);
  el.appendChild(renderer.domElement);

  /* Feinheit: am Handy weniger Dreiecke, damit es flüssig bleibt */
  const geometry = new IcosahedronGeometry(1.2, klein ? 24 : 40);
  /* Arme zu den Datenpaketen (max. 3, Handy 2): armU = Richtung (Objektraum) + Länge, infoU = Welle, Blitz; pulsU = Ringe */
  const ARME = klein ? 2 : 3;
  const armU = [0, 1, 2].map(() => new Vector4(0, 0, 1, 0)), infoU = [0, 1, 2].map(() => new Vector4(0, 0, 0, 0));
  const pulsU = [0, 1, 2].map(() => new Vector4(0, 0, 1, -1));
  const material = new ShaderMaterial({
    defines: {
      ARME, BREITE: f(klein ? KUGEL.breiteHandy : KUGEL.breite), UMFELD: f(KUGEL.umfeld), UMFELD_ANTEIL: f(KUGEL.umfeldAnteil),
      WELLE_K: f(KUGEL.welleK), WELLE_W: f(KUGEL.welleW), WELLE_AMP: f(KUGEL.welleAmp),
      RING_WEG: f(KUGEL.ringWeg), RING_B: f(KUGEL.ringBreite), RING_AMP: f(KUGEL.ringAmp), GLANZ: f(KUGEL.glanz),
      FEIN: f(KUGEL.feinNoise), SCHIMMER: f(KUGEL.schimmer)
    },
    uniforms: {
      arm: { value: armU },
      armInfo: { value: infoU },
      puls: { value: pulsU },
      sek: { value: 0 },
      time: { value: 0 },
      achse: { value: new Vector3(0, 1, 0) },
      flieh: { value: 0 },
      schluck: { value: new Vector4(0, 0, 1, 0) },
      pointLightPosition: { value: new Vector3(0, 0, 5) },
      color: { value: new Color('#FF5A1F') }
    },
    vertexShader: `
      uniform float time;
      uniform float sek;
      uniform vec4 arm[3];
      uniform vec4 armInfo[3];
      uniform vec4 puls[3];
      uniform vec3 achse;
      uniform float flieh;
      uniform vec4 schluck;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vHell;
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
      void main() {
        vNormal = normal;
        vPosition = position;
        float displacement = snoise(position * 2.0 + time * 0.5) * 0.2 + snoise(position * 3.2 - time * 0.9) * FEIN;
        vec3 newPosition = position + normal * displacement;
        vec3 n0 = normalize(position);
        float hell = 0.0;
        /* Fliehkraft: dreht sie nach einem Fang schneller, wölbt sich der Äquator elastisch nach außen */
        float quer = dot(n0, achse);
        newPosition += n0 * (flieh * (1.0 - quer * quer) * 1.2);
        /* Schlucken: kurz in Fangrichtung gedehnt, quer dazu gestaucht (Volumen bleibt) – federt wie Gelee zurück */
        float entlang = dot(newPosition, schluck.xyz);
        vec3 seitlich = newPosition - schluck.xyz * entlang;
        newPosition += schluck.xyz * entlang * schluck.w - seitlich * (schluck.w * 0.5);
        /* kosmischer Schimmer: leise wandernde Lichtflecken */
        hell += max(0.0, snoise(n0 * 1.6 + vec3(0.0, time * 2.2, time * 0.7))) * SCHIMMER;
        /* Zunge zum Paket: schmales Gauß-Profil entlang der Paketrichtung (weich zulaufende Spitze), Umgebung leicht mitgezogen;
           beim Ausstrecken läuft eine feine, schnelle Welle von der Basis zur Spitze. Mehrere Arme addieren sich weich. */
        for (int i = 0; i < ARME; i++) {
          float L = arm[i].w;
          if (L > 0.0005) {
            float th = acos(clamp(dot(n0, arm[i].xyz), -1.0, 1.0));
            float kern = exp(-(th * th) / (BREITE * BREITE));
            float umfeld = exp(-(th * th) / (UMFELD * UMFELD)) * UMFELD_ANTEIL;
            float form = kern + umfeld * (1.0 - kern);
            float welle = armInfo[i].x * WELLE_AMP * sin(th * WELLE_K + sek * WELLE_W) * kern;
            newPosition += arm[i].xyz * (L * 1.2 * form) + normal * welle;
            hell += kern * min(1.0, L * 2.2) * 0.45 + armInfo[i].y * exp(-(th * th) / (BREITE * BREITE * 0.5));
          }
        }
        /* Aufnahme: vom Einsaugpunkt laufen zwei leise Wellenringe über die Oberfläche und klingen aus */
        for (int i = 0; i < 3; i++) {
          float ph = puls[i].w;
          if (ph >= 0.0 && ph < 1.0) {
            float th = acos(clamp(dot(n0, puls[i].xyz), -1.0, 1.0));
            float r1 = (th - ph * RING_WEG) / RING_B;
            float r2 = (th - (ph - 0.18) * RING_WEG) / RING_B;
            float a = (1.0 - ph) * (1.0 - ph);
            float ring = exp(-r1 * r1) + 0.55 * exp(-r2 * r2) * step(0.18, ph);
            newPosition += normal * (RING_AMP * a * ring);
            hell += a * ring * 0.4;
          }
        }
        vHell = hell;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 color;
      uniform vec3 pointLightPosition;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vHell;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(pointLightPosition - vPosition);
        float diffuse = max(dot(normal, lightDir), 0.0);
        float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
        fresnel = pow(fresnel, 2.0);
        vec3 neon = vec3(0.80, 0.82, 0.88);   /* ruhiges Silberweiß (25.09. nachts: Orange nur noch für Premium) */
        vec3 finalColor = neon * (0.24 + diffuse * 0.82) + vec3(1.0, 1.0, 1.0) * fresnel * 0.6;
        /* Zunge, Blitz und Ringe hellen das Drahtgitter leicht auf – gedeckelt, auch wenn mehrere zusammenkommen */
        finalColor += vec3(0.9, 0.95, 1.0) * min(vHell, 1.0) * GLANZ;
        gl_FragColor = vec4(finalColor, 1.0);
      }`,
    wireframe: true
  });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  /* Licht folgt der Maus; am Handy wandert es langsam von selbst */
  const ziel = new Vector3(0, 0, 5), licht = material.uniforms.pointLightPosition.value;
  function lichtAuf(clientX, clientY) {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    const vec = new Vector3(x, y, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    ziel.copy(camera.position).add(dir.multiplyScalar(dist));
    ziel.z = 2.5;
  }
  if (feineMaus) window.addEventListener('pointermove', (e) => lichtAuf(e.clientX, e.clientY), { passive: true });

  /* ===== Arme: jede Ausstülpung hat eine eigene, zeitgesteuerte Abfolge (bildratenunabhängig) =====
     frei → hin (Ease-out zum Paket, Spitze folgt ihm genau) → zurück (gedämpfte Feder) → frei.
     Schnittstelle für js/endo-zufluss.js (Richtung in Bildschirmkoordinaten: x rechts, y unten; d = Abstand in Kugelradien):
       greifen(x, y, d) → Kennung oder -1 · folgen(k, x, y, d) · gefangen(k) · fortschritt(k) · puls(x, y) */
  const armZ = [0, 1, 2].map(() => ({ zustand: 0, kennung: 0, t0: 0, tLos: 0, L: 0, L0: 0, Lstart: 0, x: 1, y: 0, d: 1,
    blick: new Vector3(0, 0, 1), objekt: new Vector3(0, 0, 1) }));
  const pulse = [0, 1, 2].map(() => ({ dir: new Vector3(0, 0, 1), t0: -1 }));
  const umkehr = new Quaternion();
  let pulsNr = 0, kennungen = 0;
  const zd = KUGEL.daempfung, w0 = KUGEL.frequenz, wd = w0 * Math.sqrt(1 - zd * zd);
  function pulsStart(dirObjekt) { const p = pulse[pulsNr++ % 3]; p.dir.copy(dirObjekt); p.t0 = performance.now(); }
  /* Lebewesen: Drehschub (Fliehkraft) und Schlucken nach jedem Fang */
  let drehExtra = 0, fliehIst = 0, fliehV = 0, schluckS = 0, schluckV = 0, letzt = 0;
  const schluckDir = new Vector3(0, 0, 1), achseObjekt = new Vector3(0, 1, 0);
  function stoss(dirObjekt, seite, staerke) {
    drehExtra = Math.max(-KUGEL.drehMax, Math.min(KUGEL.drehMax, drehExtra + (seite >= 0 ? 1 : -1) * KUGEL.drehStoss * staerke));
    schluckDir.copy(dirObjekt); schluckV += KUGEL.schluckStoss * staerke;
  }
  function blickRichtung(a) { a.blick.set(a.x, -a.y, 0.15).normalize(); }
  window.endoKugel = {
    arme: ARME, reichweite: 1 + KUGEL.maxLaenge,
    greifen(x, y, d) {
      if (ruhig) return -1;
      for (let i = 0; i < ARME; i++) {
        const a = armZ[i];
        if (a.zustand === 0 || (a.zustand === 2 && a.L < 0.03)) {
          a.zustand = 1; a.kennung = ++kennungen * 4 + i; a.t0 = performance.now(); a.Lstart = a.L;   /* fast eingezogener Arm: ohne Sprung weiter */
          a.x = x; a.y = y; a.d = d; blickRichtung(a);
          return a.kennung;
        }
      }
      return -1;
    },
    folgen(k, x, y, d) { const a = armZ[k % 4]; if (a && a.kennung === k && a.zustand === 1) { a.x = x; a.y = y; a.d = d; blickRichtung(a); } },
    gefangen(k) { const a = armZ[k % 4]; return !a || a.kennung !== k || a.zustand !== 1; },
    zustand() { return armZ.slice(0, ARME).map((a) => [a.zustand, Math.round(a.L * 1000) / 1000]); },   /* nur zum Prüfen */
    fortschritt(k) { const a = armZ[k % 4]; return a && a.kennung === k && a.zustand === 1 ? Math.max(0, Math.min(1, (performance.now() - a.t0) / KUGEL.hinMs)) : 1; },
    puls(x, y) {
      if (ruhig) return;
      umkehr.copy(mesh.quaternion).invert();
      const d = new Vector3(x, -y, 0.15).normalize().applyQuaternion(umkehr);
      pulsStart(d);
      stoss(d, x, 0.45);   /* Nachricht/Foto ohne Arm: sanfter Stoß */
    }
  };

  function armeRechnen(t) {
    umkehr.copy(mesh.quaternion).invert();
    for (let i = 0; i < 3; i++) {
      const a = armZ[i], info = infoU[i];
      if (a.zustand === 1) {
        /* hin: stark ease-out (schießt los, bremst weich vor dem Paket ab); die Spitze folgt dem Paket und trifft es genau */
        /* max(0, …): der Bild-Zeitstempel kann minimal vor dem Greif-Zeitpunkt liegen – sonst kurze Delle nach innen */
        const p = Math.max(0, Math.min(1, (t - a.t0) / KUGEL.hinMs)), e = 1 - Math.pow(1 - p, 4);
        const ziel = Math.max(0, Math.min(KUGEL.maxLaenge, a.d - 1));
        a.L = a.Lstart + (ziel - a.Lstart) * e;
        a.objekt.copy(a.blick).applyQuaternion(umkehr);
        info.x = 1; info.y = 0;
        if (p >= 1) { a.zustand = 2; a.tLos = t; a.L0 = a.L; pulsStart(a.objekt); stoss(a.objekt, a.x, 1); }
      } else if (a.zustand === 2) {
        /* zurück: gedämpfte Feder (geschlossene Form, bildratenunabhängig); Richtung bleibt am Kugelpunkt, dreht also mit */
        const s = (t - a.tLos) / 1000;
        a.L = a.L0 * Math.exp(-zd * w0 * s) * (Math.cos(wd * s) + (zd * w0 / wd) * Math.sin(wd * s));
        info.x = Math.max(0, 1 - (t - a.tLos) / KUGEL.welleNachMs);
        info.y = Math.exp(-(t - a.tLos) / KUGEL.blitzMs);
        if (t - a.tLos > KUGEL.zurueckEndeMs) { a.zustand = 0; a.L = 0; info.x = info.y = 0; }
      }
      armU[i].set(a.objekt.x, a.objekt.y, a.objekt.z, i < ARME ? a.L : 0);
      const pl = pulse[i], ph = pl.t0 < 0 ? -1 : (t - pl.t0) / KUGEL.ringMs;
      if (ph >= 1) pl.t0 = -1;
      pulsU[i].set(pl.dir.x, pl.dir.y, pl.dir.z, ph >= 1 ? -1 : ph);
    }
  }

  let frameId = 0, laeuft = false, start0 = performance.now();
  function bild(t) {
    const zeit = t - start0;
    const dt = Math.min(0.05, Math.max(0, (t - letzt) / 1000)) || 0.016; letzt = t;
    armeRechnen(t);
    material.uniforms.sek.value = (zeit / 1000) % 1000;
    material.uniforms.time.value = zeit * 0.0003;
    /* Drehung bildratenunabhängig; Schub nach Fängen klingt weich ab */
    drehExtra *= Math.exp(-dt / KUGEL.drehAbklingen);
    mesh.rotation.y += (KUGEL.drehen + drehExtra) * dt;
    mesh.rotation.x += KUGEL.drehen * 0.4 * dt;
    /* Fliehkraft folgt der Drehung über eine weiche Feder (wabbelt leicht nach) */
    const fliehSoll = Math.min(KUGEL.fliehMax, KUGEL.flieh * drehExtra * drehExtra);
    fliehV += ((fliehSoll - fliehIst) * KUGEL.fliehFeder[0] - fliehV * KUGEL.fliehFeder[1]) * dt; fliehIst += fliehV * dt;
    schluckV += (-schluckS * KUGEL.schluckFeder[0] - schluckV * KUGEL.schluckFeder[1]) * dt; schluckS += schluckV * dt;
    material.uniforms.flieh.value = fliehIst;
    achseObjekt.set(0, 1, 0).applyQuaternion(umkehr.copy(mesh.quaternion).invert());
    material.uniforms.achse.value.copy(achseObjekt);
    material.uniforms.schluck.value.set(schluckDir.x, schluckDir.y, schluckDir.z, Math.max(-0.2, Math.min(0.2, schluckS * KUGEL.schluck)));
    /* Atmen */
    const atem = 1 + KUGEL.atmen[0] * Math.sin(zeit * 0.0013) + KUGEL.atmen[1] * Math.sin(zeit * 0.00071 + 1.3);
    mesh.scale.setScalar(atem);
    if (!feineMaus) { ziel.set(Math.sin(zeit * 0.0004) * 2.2, Math.cos(zeit * 0.0003) * 1.4, 2.5); }
    licht.lerp(ziel, 0.06);
    renderer.render(scene, camera);
    if (laeuft) frameId = requestAnimationFrame(bild);
  }
  function an() { if (laeuft || ruhig || el.hasAttribute('data-halt')) return; laeuft = true; frameId = requestAnimationFrame(bild); }
  function aus() { laeuft = false; cancelAnimationFrame(frameId); }

  if (ruhig) { material.uniforms.time.value = 1.3; renderer.render(scene, camera); }
  /* Nur rechnen, solange der Hero sichtbar und der Tab aktiv ist */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => { e[0].isIntersecting ? an() : aus(); }).observe(el);
  } else an();
  document.addEventListener('visibilitychange', () => { document.hidden ? aus() : (el.getBoundingClientRect().bottom > 0 && an()); });
  /* Chat aktiv: Kugel hält still (Emre, 25.09.: Hintergrund soll sich im Chat nicht bewegen) */
  el.addEventListener('orb:halt', () => { el.setAttribute('data-halt', ''); aus(); });
  el.addEventListener('orb:weiter', () => { el.removeAttribute('data-halt'); if (el.getBoundingClientRect().bottom > 0) an(); });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.position.z = abstand();
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      if (ruhig) renderer.render(scene, camera);
    }, 120);
  });
  el.classList.add('orb--bereit');
}
