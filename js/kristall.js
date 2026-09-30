/* ERGUN. – Startseite „Kristall“ (01.10.2026, Vorschau ?titel=kristall). Ausnahme auf ERGUNs Wunsch: Aufbau, Scroll-Ablauf und Look der
   Vorlage „Lycoris Specimen“ (07 Vorlagen/Lycoris-Specimen-Vorlage.tsx.txt) 1:1 in Vanilla JS + rohem WebGL nachgebaut – nur Inhalt und
   Objekt getauscht: statt der Spinnenlilie ein pinker, edel geschliffener Kristall, der über die sechs Bilder wächst:
     01 roher Keim (wenige Facetten) · 02 erste klare Facetten: der Stein wächst heraus · 03 er streckt sich zum Schliff, Begleitsteine wachsen an ·
     04 der Cluster ordnet sich zu einer präzisen Struktur · 05 vollständig, scharfe Kanten, perfekte Politur · 06 Endstadium beim
     Kontaktformular: ruhig, dezentes Leuchten im Kern, seitlich neben dem Formular (am Handy klein oben).
   Wie die Vorlage: Scroll = Zeitachse (Bühne klebt, 5 × 1,2 Bühnenhöhen Scroll), 6 Bilder mit 34 % Haltezeit, Kamera kreist zwischen den
   Bildern (Schlüsselbilder, eigene fürs Hochformat), Schrift erscheint über rise/clip/line/fade gestaffelt, das Cover-Wort teilt sich zur
   Krone, Lichthof hinter dem Objekt, Pointer-Tilt + langsames Drehen + Ziehen, „Bewegung reduzieren“ = still. Ohne WebGL: sauberes
   Standbild des Kristalls im Endstadium (2D). Zahlen nur aus window.PREISE. Seed: ?seed=… (Form), ?krone=rand (Vorlage: nur erster und
   letzter Buchstabe flankieren). Prüfgriff: window.__kristall. */
(function () {
  var root = document.querySelector('[data-k-root]');
  if (!root) return;
  var html = document.documentElement, frage = new URLSearchParams(location.search);
  if (frage.get('farbe') === 'orange') html.setAttribute('data-farbe', 'orange');
  if (frage.get('schrift') === 'b') html.setAttribute('data-schrift', 'b');
  if (frage.get('knopf') === 'pink') html.setAttribute('data-knopf', 'pink');
  var SEED = parseInt(frage.get('seed'), 10) || 7, KRONE_RAND = frage.get('krone') === 'rand';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var buehne = $('[data-k-buehne]', root), strecke = $('[data-k-strecke]', root), leinwand = $('[data-k-leinwand]', root), schein = $('[data-k-schein]', root), wort = $('[data-k-wort]', root);

  /* Das echte Formular (#preise in <main>) gehört als Bild 06 in die Bühne: <main> wandert hinter die Strecke, die Bühne klebt weiter daneben */
  var haupt = document.querySelector('main#inhalt'); if (haupt) root.appendChild(haupt);
  /* Fußleiste wie die Vorlage (links · Zeichen · rechts): WhatsApp (öffnet das Formular mit „WhatsApp“ gewählt – keine Nummer auf der Seite) ·
     E-Mail (die öffentliche Adresse der Seite) · Impressum · Datenschutz */
  var fuss = document.createElement('footer'); fuss.className = 'k-fussleiste';
  fuss.innerHTML = '<nav aria-label="Kontakt"><a href="#kontakt" data-k-weg="whatsapp">WhatsApp</a><a href="mailto:ergun.eu@gmail.com">E-Mail</a></nav>' +
    '<svg class="k-marke" data-k-marke width="30" height="30" viewBox="0 0 40 40" aria-hidden="true"></svg>' +
    '<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav>';
  root.parentNode.insertBefore(fuss, root.nextSibling);
  fuss.querySelector('[data-k-weg]').addEventListener('click', function () {
    var r = document.querySelector('#anfrage input[name="weg"][value="whatsapp"]'); if (r && !r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
  });

  /* ---------- Mathe ---------- */
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6d2b79f5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function klemm(x) { return x <= 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = klemm((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function mixV(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }

  /* ---------- der Kristall als Bauplan (ERGUN., 01.10.: „kristallförmiger, nicht so Quarz-Style – hochwertig, edel“) ----------
     Ein länglich geschliffener Hauptstein wie ein Schmuckstein: Tafel · Krone · doppelte Rundiste · langes Unterteil · Spitze, je Ring
     12 Facetten, Ringe gegeneinander versetzt → dreieckige Facetten wie ein echter Schliff. Dazu sechs kleinere Begleitsteine, die sich in
     Bild 04 zu einem präzisen Ring ordnen, und acht winzige Steine im Endstadium. Am Anfang ein roher Keim, aus dem der Stein wächst. */
  var N = 16;
  function bauplan(seed) {
    var r = rng(seed);
    function kugel() { var u = r() * 2 - 1, w = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); return [s * Math.cos(w), u, s * Math.sin(w)]; }
    function steine(anzahl, ring, hoehen, neigung, groesse, geburt, voll, wildAbstand) {
      var liste = [];
      for (var i = 0; i < anzahl; i++) {
        var phi = (i / anzahl) * Math.PI * 2 + Math.PI / anzahl, w = kugel();
        liste.push({
          ordLage: [Math.cos(phi) * ring, hoehen[i % hoehen.length], Math.sin(phi) * ring],
          ordAchse: norm([Math.cos(phi) * neigung, 1, Math.sin(phi) * neigung]),
          wildLage: mul(norm([w[0], w[1] * 0.7, w[2]]), wildAbstand + r() * 0.5), wildAchse: kugel(),
          groesse: groesse * (0.92 + r() * 0.16), geburt: geburt + i * 0.08, voll: voll + r() * 0.3, dreh: r() * 6.28
        });
      }
      return liste;
    }
    var gt = (1 + Math.sqrt(5)) / 2, ik = [[-1, gt, 0], [1, gt, 0], [-1, -gt, 0], [1, -gt, 0], [0, -1, gt], [0, 1, gt], [0, -1, -gt], [0, 1, -gt], [gt, 0, -1], [gt, 0, 1], [-gt, 0, -1], [-gt, 0, 1]].map(norm);
    var flaechen = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    return {
      begleiter: steine(6, 1.45, [0.16, -0.16], 0.5, 0.42, 1.45, 3.0, 1.0),
      funken: steine(8, 2.0, [0.5, -0.62], 0.2, 0.2, 3.0, 4.3, 1.7),
      kern: { ecken: ik, flaechen: flaechen, roh: ik.map(function () { return 0.72 + r() * 0.6; }) },
      dreh: r() * 6.28
    };
  }
  var PLAN = bauplan(SEED);
  var MITTE = [0, 0, 0];   /* Mitte des Steins – dorthin schaut die Kamera */

  /* Profil (Höhe, Radius) von oben nach unten – Maße eines Brillanten (Rundiste = Durchmesser 1):
     Tafel-Mitte · Tafel (56 %) · Stern-/Haupt-Facetten der Krone · Rundiste oben/unten · untere Rundisten-Facetten · Spitze.
     Krone 15 %, Unterteil 43 %, gerade Flanken (kein Bauch – sonst wirkt der Stein wie ein Tropfen).
     f = 0: schlichte Doppelpyramide (erste klare Facetten) · f = 1: voller Brillantschliff */
  var PROFIL_0 = [[0.5, 0], [0.49, 0.01], [0.26, 0.25], [0.01, 0.49], [-0.01, 0.49], [-0.26, 0.25], [-0.5, 0]];
  var PROFIL_1 = [[0.16, 0], [0.16, 0.28], [0.085, 0.405], [0.012, 0.5], [-0.012, 0.5], [-0.19, 0.285], [-0.43, 0]];

  /* Zustand bei Bild-Koordinate c (0…5): Dreiecke mit Flächen-Normalen, Baryzentrik, echten Kanten und „runder“ Normale */
  var STRIDE = 15;   /* Lage 3 · Flächen-Normale 3 · Baryzentrik 3 · echte Kanten 3 · runde Normale 3 */
  function geometrie(c) {
    var v = [], ordnung = smooth(2.4, 3.5, c), rauh = 1 - smooth(0.2, 1.4, c);
    function drei(a, b, d, kanten, innen, ra, rb, rd) {
      var n = norm(cross(sub(b, a), sub(d, a)));
      var schwer = mul(add(add(a, b), d), 1 / 3);
      if (innen && dot(n, sub(schwer, innen)) < 0) { var tmp = b; b = d; d = tmp; tmp = rb; rb = rd; rd = tmp; n = mul(n, -1); kanten = [kanten[0], kanten[2], kanten[1]]; }
      [[a, [1, 0, 0], ra], [b, [0, 1, 0], rb], [d, [0, 0, 1], rd]].forEach(function (x) {
        var p = sub(x[0], MITTE), rn = x[2] || n;
        v.push(p[0], p[1], p[2], n[0], n[1], n[2], x[1][0], x[1][1], x[1][2], kanten[0], kanten[1], kanten[2], rn[0], rn[1], rn[2]);
      });
    }
    /* ein geschliffener Stein: Lage, Achse, Größe, Drehung, Form f */
    function stein(lage, achse, groesse, dreh, f) {
      if (groesse < 0.004) return;
      var y = norm(achse), x = norm(cross(y, Math.abs(y[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0])), z = cross(x, y);
      var cd = Math.cos(dreh), sd = Math.sin(dreh), x2 = add(mul(x, cd), mul(z, sd)), z2 = sub(mul(z, cd), mul(x, sd)); x = x2; z = z2;
      function welt(l) { return add(lage, add(add(mul(x, l[0] * groesse), mul(y, l[1] * groesse)), mul(z, l[2] * groesse))); }
      function richt(l) { return norm(add(add(mul(x, l[0]), mul(y, l[1])), mul(z, l[2]))); }
      var ringe = PROFIL_1.map(function (q, k) {
        var h = mix(PROFIL_0[k][0], q[0], f), rad = mix(PROFIL_0[k][1], q[1], f), versatz = (k % 2) * Math.PI / N, pk = [];
        for (var m = 0; m < N; m++) { var w = versatz + (m / N) * Math.PI * 2; pk.push([Math.cos(w) * rad, h, Math.sin(w) * rad]); }
        return { h: h, rad: rad, p: pk };
      });
      for (var k = 0; k < ringe.length - 1; k++) {
        var A = ringe[k], B = ringe[k + 1], innen = welt([0, (ringe[0].h + ringe[ringe.length - 1].h) / 2, 0]);   /* Mitte des ganzen Steins – bei der flachen Tafel lag die Ring-Mitte in der Fläche */
        for (var m = 0; m < N; m++) {
          var m2 = (m + 1) % N;
          var a1 = A.p[m], a2 = A.p[m2], b1 = B.p[m], b2 = B.p[m2];
          var ra = function (l) { return richt([l[0], l[1] * 0.55, l[2]]); };
          if (A.rad > 1e-4) drei(welt(a1), welt(a2), welt(b1), [1, 1, 1], innen, ra(a1), ra(a2), ra(b1));
          if (B.rad > 1e-4) drei(welt(a2), welt(b2), welt(b1), [1, 1, 1], innen, ra(a2), ra(b2), ra(b1));
        }
      }
    }
    /* roher Keim: am Anfang da, der Stein wächst aus ihm heraus */
    var kr = 0.36 * (1 - smooth(0.7, 1.7, c));
    if (kr > 0.005) {
      var ke = PLAN.kern.ecken.map(function (e, i) { return mul(e, kr * mix(1, PLAN.kern.roh[i], 0.35 + 0.65 * rauh)); });
      PLAN.kern.flaechen.forEach(function (fl) { drei(ke[fl[0]], ke[fl[1]], ke[fl[2]], [1, 1, 1], [0, 0, 0], norm(ke[fl[0]]), norm(ke[fl[1]]), norm(ke[fl[2]])); });
    }
    /* Hauptstein: wächst aus dem Keim (Bild 02 erste klare Facetten), streckt sich zum vollen Schliff (Bild 03–05) */
    var s = 1 - Math.pow(1 - klemm((c - 0.25) / 2.2), 3), f = smooth(0.7, 3.4, c);
    stein([0, 0.17 * f, 0], [0, 1, 0], 1.45 * s, PLAN.dreh, f);
    /* Begleitsteine und Funken: erst frei im Raum, dann präzise im Ring */
    PLAN.begleiter.concat(PLAN.funken).forEach(function (b) {
      var t = klemm((c - b.geburt) / (b.voll - b.geburt)); if (t <= 0) return;
      var e = 1 - Math.pow(1 - t, 3);
      stein(mixV(b.wildLage, b.ordLage, ordnung), mixV(b.wildAchse, b.ordAchse, ordnung), b.groesse * e, b.dreh, smooth(0.2, 1, t));
    });
    return new Float32Array(v);
  }
  /* Radius des ausgewachsenen Clusters um die Mitte (für die Kamera – wie „radius“ der Vorlage) */
  var RADIUS = (function () { var g = geometrie(5), r = 0; for (var i = 0; i < g.length; i += STRIDE) r = Math.max(r, Math.hypot(g[i], g[i + 1], g[i + 2])); return r; })();

  /* ---------- Scroll → Bild-Koordinate (wie die Vorlage) ---------- */
  function sceneCoord(p, n, hold) { if (n <= 1) return 0; var t = klemm(p) * (n - 1), i = Math.min(Math.floor(t), n - 2), h = hold / 2; return i + easeInOut(klemm((t - i - h) / (1 - 2 * h))); }
  function reveal(coord, scene, delay) { var d = coord - scene, lag = d < 0 ? delay : 1 - delay; return klemm((0.6 - Math.abs(d) - lag * 0.2) / 0.25); }

  /* ---------- Kamera-Schlüsselbilder (Vorlage; Bild 06 neu: Kristall seitlich neben dem Formular, am Handy klein oben) ---------- */
  var KEYS = [
    { spin: 0.2, el: 9, size: 0.86, ox: 0, oy: 0.3 },
    { spin: 1.4, el: 88, size: 0.58, ox: 0, oy: 0 },
    { spin: 2.3, el: 12, size: 0.27, ox: 0, oy: 0.4 },
    { spin: 3.1, el: -30, size: 0.74, ox: 0, oy: -0.46 },
    { spin: 4.1, el: 16, size: 1.02, ox: 0.66, oy: 0.2 },
    { spin: 5.0, el: 14, size: 0.66, ox: 0.5, oy: 0.04 }
  ];
  var KEYS_TALL = [{ size: 0.9, oy: 0.36 }, { size: 0.56 }, { size: 0.34, oy: 0.44 }, { size: 0.66, oy: -0.5 }, { size: 0.86, ox: 0.5, oy: 0.46 }, { size: 0.34, ox: 0, oy: 0.74 }];
  var SCENES = KEYS.length, HOLD = 0.34, NAV = ['ERGUN.', 'Kristall', 'Websites', 'Preise', 'Anspruch', 'Anfrage'];
  var KEYS_KURZ = { 5: { size: 0.28, oy: 0.8 } };   /* kleine Handys (Höhe < 720): Kristall über dem Formular kleiner und höher, damit alle drei Karten ohne Scrollen passen */
  function keyAt(coord, tall) {
    var i = Math.max(0, Math.min(SCENES - 1, Math.floor(coord))), j = Math.min(SCENES - 1, i + 1), f = coord - i, kurz = tall && H < 720;
    var a = Object.assign({}, KEYS[i], tall ? KEYS_TALL[i] : {}, kurz ? KEYS_KURZ[i] : {}), b = Object.assign({}, KEYS[j], tall ? KEYS_TALL[j] : {}, kurz ? KEYS_KURZ[j] : {});
    return { spin: mix(a.spin, b.spin, f), el: mix(a.el, b.el, f), size: mix(a.size, b.size, f), ox: mix(a.ox, b.ox, f), oy: mix(a.oy, b.oy, f) };
  }

  /* ---------- Matrizen (spaltenweise) ---------- */
  function perspective(fovy, aspect, near, far) { var f = 1 / Math.tan(fovy / 2), m = new Float32Array(16); m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far); m[11] = -1; m[14] = (2 * far * near) / (near - far); return m; }
  function lookAt(eye, at) { var z = norm(sub(eye, at)), x = norm(cross([0, 1, 0], z)), y = cross(z, x), m = new Float32Array(16); m[0] = x[0]; m[4] = x[1]; m[8] = x[2]; m[1] = y[0]; m[5] = y[1]; m[9] = y[2]; m[2] = z[0]; m[6] = z[1]; m[10] = z[2]; m[12] = -dot(x, eye); m[13] = -dot(y, eye); m[14] = -dot(z, eye); m[15] = 1; return m; }
  function multiply(a, b) { var o = new Float32Array(16); for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; }
  function rotY(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  function rotX(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function hexToLinear(hex) { var h = hex.replace('#', ''); var n = parseInt(h, 16); var ch = function (v) { return Math.pow(v / 255, 2.2); }; return [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255)]; }

  /* ---------- Farben: pinker Edelstein-Chrom (Rosenquarz/Pink-Saphir) · Vergleich ?farbe=orange = Chrom ---------- */
  var ORANGE = html.getAttribute('data-farbe') === 'orange';
  var FARBE = ORANGE ? mul(hexToLinear('#C9CCD3'), 1.5) : mul(hexToLinear('#E8A0BF'), 1.55);
  var TIEF = ORANGE ? hexToLinear('#3B3E46') : hexToLinear('#9E4F74');
  var HEISS = ORANGE ? [1, 0.97, 0.94] : [1, 0.9, 0.95];
  var AKZENT = ORANGE ? '#FF5A1F' : '#E8A0BF';

  /* ---------- Shader ---------- */
  var VERT = 'attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec3 a_bary; attribute vec3 a_kante; attribute vec3 a_rund;\n' +
    'uniform mat4 u_vp; uniform mat4 u_model; uniform vec2 u_offset;\n' +
    'varying vec3 v_n; varying vec3 v_w; varying vec3 v_b; varying vec3 v_e; varying vec3 v_r; varying vec3 v_o;\n' +
    'void main() { vec4 w = u_model * vec4(a_pos, 1.0); v_w = w.xyz; v_o = a_nrm; v_n = (u_model * vec4(a_nrm, 0.0)).xyz; v_r = (u_model * vec4(a_rund, 0.0)).xyz; v_b = a_bary; v_e = a_kante;\n' +
    '  gl_Position = u_vp * w; gl_Position.xy += u_offset * gl_Position.w; }';
  function frag(ableitung) {
    return (ableitung ? '#extension GL_OES_standard_derivatives : enable\n' : '') +
      'precision highp float;\n' +
      'uniform vec3 u_eye; uniform vec3 u_farbe; uniform vec3 u_tief; uniform vec3 u_hot; uniform float u_politur; uniform float u_glut; uniform float u_alpha;\n' +
      'varying vec3 v_n; varying vec3 v_w; varying vec3 v_b; varying vec3 v_e; varying vec3 v_r; varying vec3 v_o;\n' +
      /* dunkles Studio mit einer Lichtwanne oben, einem hohen Seitenstreifen und einem Kantenlicht hinten – wie die Vorlage */
      'float studio(vec3 r, float ex) {\n' +
      '  float key = pow(max(dot(r, normalize(vec3(-0.45, 0.85, 0.35))), 0.0), ex) * 2.8;\n' +
      '  float box = smoothstep(0.6, 0.7, r.y) * smoothstep(-0.65, -0.2, r.x) * smoothstep(0.85, 0.45, r.x) * 1.1;\n' +
      '  float strip = smoothstep(0.6, 0.82, r.x) * smoothstep(-0.5, 0.35, r.y) * 1.25;\n' +
      '  float strip2 = smoothstep(0.86, 0.97, -r.x) * smoothstep(-0.2, 0.6, r.y) * 0.55;\n' +
      '  float rim = smoothstep(0.55, 0.95, -r.z) * smoothstep(-0.2, 0.5, r.y) * 0.9;\n' +
      '  float hz = exp(-abs(r.y - 0.05) * 9.0) * 0.16;\n' +
      '  float leiste = (1.0 - smoothstep(0.0, 0.035, abs(r.y - 0.3))) * 0.9 + (1.0 - smoothstep(0.0, 0.02, abs(r.y + 0.18))) * 0.55;\n' +
      '  leiste *= smoothstep(-0.9, -0.3, r.z) * 0.5 + 0.5;\n' +
      '  return key + box + strip + strip2 + rim + hz + leiste; }\n' +
      'void main() {\n' +
      '  vec3 v = normalize(u_eye - v_w); vec3 nf = normalize(v_n); if (dot(nf, v) < 0.0) nf = -nf;\n' +
      '  vec3 nr = normalize(v_r); if (dot(nr, nf) < 0.0) nr = -nr;\n' +
      '  vec3 n = normalize(mix(nf, nr, 0.1));\n' +
      '  vec3 r = reflect(-v, n);\n' +
      '  float e = studio(r, mix(6.0, 18.0, u_politur));\n' +
      '  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);\n' +
      '  float dif = max(dot(n, normalize(vec3(-0.3, 0.8, 0.6))), 0.0);\n' +
      /* Körper: dunkles Rosé wie in einem Edelstein, heller auf Flächen, die zum Betrachter zeigen */
      '  float blick = max(dot(n, v), 0.0);\n' +
      '  vec3 col = u_tief * (0.035 + 0.12 * dif + 0.1 * blick * blick);\n' +
      /* Chrom: die Spiegelung des dunklen Studios in Rosé, Glanzlichter fast weiß mit Rosé-Stich */
      '  col += u_farbe * e * 0.62;\n' +
      '  col += u_hot * pow(e, 2.8) * 0.55;\n' +
      '  col += u_farbe * fr * 0.5;\n' +
      /* scharfes Funkeln eines kleinen zweiten Lichts – springt beim Drehen von Facette zu Facette */
      '  vec3 innen = refract(-v, n, 0.66);\n' +
      '  col += mix(u_tief, u_farbe, 0.6) * studio(innen, 7.0) * 0.26 * (1.0 - fr);\n' +
      /* Brillanz: jede Facette wirft ihr eigenes Licht aus dem Inneren zurück – hell, dunkel, hell im Wechsel, beim Drehen wandernd */
      '  float h = fract(sin(dot(floor(v_o * 40.0 + 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453);\n' +
      '  float welle = 0.5 + 0.5 * cos(h * 6.2832 + dot(v, nf) * 7.0 + dot(nf, vec3(0.0, 2.5, 0.0)));\n' +
      '  col += mix(u_farbe, u_hot, 0.25) * pow(welle, 3.0) * (0.12 + 0.5 * u_politur) * (1.0 - fr) * mix(0.35, 1.0, h);\n' +
      '  col += u_hot * pow(welle, 40.0) * 1.4 * u_politur * step(0.55, h);\n' +
      '  float funkel = pow(max(dot(r, normalize(vec3(0.62, 0.55, 0.56))), 0.0), mix(24.0, 90.0, u_politur));\n' +
      '  col += u_hot * funkel * (0.6 + 1.2 * u_politur);\n' +
      /* feine helle Kantenlichter – nur echte Kanten (die Diagonale der Seitenflächen nicht) */
      '  float k = min(min(v_e.x > 0.5 ? v_b.x : 1.0, v_e.y > 0.5 ? v_b.y : 1.0), v_e.z > 0.5 ? v_b.z : 1.0);\n' +
      (ableitung ? '  float breite = fwidth(k) * 1.4;\n' : '  float breite = 0.03;\n') +
      '  float linie = 1.0 - smoothstep(0.0, breite, k);\n' +
      '  col += u_hot * linie * (0.05 + 0.6 * clamp(e * 0.8 + fr, 0.0, 1.0)) * (0.3 + 0.7 * u_politur) * 0.4;\n' +
      /* Endstadium: dezentes Leuchten im Kern */
      '  col += u_farbe * exp(-length(v_w) * 2.4) * u_glut * 1.3;\n' +
      '  col = col / (1.0 + col); col = pow(col, vec3(1.0 / 2.2));\n' +
      '  float lum = dot(col, vec3(0.299, 0.587, 0.114)); col = clamp(mix(vec3(lum), col, 1.18), 0.0, 1.0);\n' +
      '  gl_FragColor = vec4(col * u_alpha, u_alpha); }';
  }

  /* ---------- GL (mit 2D-Rückfall) ---------- */
  var gl = null, ctx2d = null, prog = null, vbo = null, loc = {}, ableitung = false, geoStand = -1, geoDaten = null;
  function initGL() {
    gl = leinwand.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return false;
    ableitung = !!gl.getExtension('OES_standard_derivatives');
    function compile(typ, src) { var sh = gl.createShader(typ); gl.shaderSource(sh, src); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null; }
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, frag(ableitung));
    if (!fs && ableitung) { ableitung = false; fs = compile(gl.FRAGMENT_SHADER, frag(false)); }
    if (!vs || !fs) return false;
    prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    [['a_pos', 3, 0], ['a_nrm', 3, 3], ['a_bary', 3, 6], ['a_kante', 3, 9], ['a_rund', 3, 12]].forEach(function (a) {
      var l = gl.getAttribLocation(prog, a[0]); if (l < 0) return; gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, a[1], gl.FLOAT, false, STRIDE * 4, a[2] * 4);
    });
    ['u_vp', 'u_model', 'u_offset', 'u_eye', 'u_farbe', 'u_tief', 'u_hot', 'u_politur', 'u_glut', 'u_alpha'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    geoStand = -1;
    return true;
  }
  var mitGL = !/[?&]webgl=aus\b/.test(location.search) && initGL();   /* ?webgl=aus = Rückfall prüfen */
  if (!mitGL) { gl = null; ctx2d = leinwand.getContext('2d'); }
  leinwand.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gl = null; });
  leinwand.addEventListener('webglcontextrestored', function () { if (!initGL()) gl = null; });

  /* ---------- Messen ---------- */
  var W = 1, H = 1, dpr = 1, zeichen = $$('[data-ch]', wort), nat = [];
  function messen() {
    var sr = buehne.getBoundingClientRect();
    W = Math.max(1, sr.width); H = Math.max(1, sr.height);
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);   /* Pixelrate gedeckelt – flüssig am Handy */
    var cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (leinwand.width !== cw || leinwand.height !== ch) { leinwand.width = cw; leinwand.height = ch; }
    var alt = zeichen.map(function (c) { return c.style.transform; });
    zeichen.forEach(function (c) { c.style.transform = 'none'; });
    nat = zeichen.map(function (c) { var r = c.getBoundingClientRect(); return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top, w: r.width }; });
    zeichen.forEach(function (c, i) { c.style.transform = alt[i]; });
  }

  /* ---------- Inhalte aus PREISE (nichts von Hand) + Studio-Zeichen + Navigation ---------- */
  var MARKE = '<path d="M20 3.5 L23.6 8.2 L23.6 31.8 L20 36.5 L16.4 31.8 L16.4 8.2 Z" transform="rotate(0 20 20)"/><path d="M20 3.5 L23.6 8.2 L23.6 31.8 L20 36.5 L16.4 31.8 L16.4 8.2 Z" transform="rotate(60 20 20)"/><path d="M20 3.5 L23.6 8.2 L23.6 31.8 L20 36.5 L16.4 31.8 L16.4 8.2 Z" transform="rotate(120 20 20)"/>';
  function marke(el, farbe, akzent) { el.innerHTML = '<g fill="none" stroke="' + farbe + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">' + MARKE + '</g><circle cx="20" cy="20" r="2.6" fill="' + akzent + '"/>'; }
  $$('[data-k-marke]').forEach(function (m) { marke(m, getComputedStyle(buehne).color || '#b6b095', AKZENT); });
  function inhalte() {
    var P = window.PREISE; if (!P || !P.euro) return false;
    var MON = ' / Monat', f = P.mehr[0];
    $$('[data-k-preis]', root).forEach(function (el) {
      var art = el.getAttribute('data-k-preis');
      el.textContent = art === 'ab-start' ? 'ab ' + P.euro(P.stufen[0].preis) : art === 'endo' ? P.betrag(f) + ' + ' + P.euro(f.monat) + MON : '';
    });
    /* 03 Websites: Begriffe aus den Stufen-Stichpunkten; das Wort zeigt beim Zeigen den vollen Stichpunkt */
    function punkt(stufe, muster) { var s = P.stufen.filter(function (x) { return x.id === stufe; })[0]; var p = s && s.punkte.filter(function (x) { return muster.test(x.t); })[0]; return p ? p.t : ''; }
    function zahlen(muster) { return P.stufen.map(function (s) { var p = s.punkte.filter(function (x) { return muster.test(x.t); })[0]; var m = p && p.t.match(muster); return m ? m[1] : null; }).filter(Boolean); }
    function namen(muster) { return P.stufen.filter(function (s) { return s.punkte.some(function (x) { return muster.test(x.t); }); }).map(function (s) { return s.name; }).join(' · '); }
    function volle(muster) { return P.stufen.map(function (s) { var p = s.punkte.filter(function (x) { return muster.test(x.t); })[0]; return p ? s.name + ': ' + p.t : null; }).filter(Boolean).join(' · '); }
    var links = [
      { label: 'Start', groesse: 'max(24px, min(6.2cqw, 6.4cqh))', worte: [['Handy & PC', punkt('start', /Handy/)]] },
      { label: 'Business', groesse: 'max(19px, min(4.6cqw, 4.8cqh))', worte: [['Design', punkt('business', /Design/)], ['Parallax', punkt('business', /Parallax/)]] },
      { label: 'Pro', groesse: 'max(16px, min(3cqw, 3.1cqh))', worte: [['Scroll-Story', punkt('pro', /Scroll-Story/)], ['3D-Element', punkt('pro', /3D/)]] }
    ];
    var rechts = [
      { label: 'Seiten · ' + namen(/Bis zu (\d+) Seiten/), groesse: 'max(24px, min(6.2cqw, 6.4cqh))', worte: [[zahlen(/Bis zu (\d+) Seiten/).join(' · '), volle(/Bis zu (\d+) Seiten/)]] },
      { label: 'Eigene Bilder · ' + namen(/(\d+) eigene Bilder/), groesse: 'max(19px, min(4.6cqw, 4.8cqh))', worte: [[zahlen(/(\d+) eigene Bilder/).join(' · '), volle(/(\d+) eigene Bilder/)]] },
      { label: 'Korrekturrunden · ' + namen(/(\d+) Korrekturrunde/), groesse: 'max(16px, min(3cqw, 3.1cqh))', worte: [[zahlen(/(\d+) Korrekturrunde/).join(' · '), volle(/(\d+) Korrekturrunde/)]] }
    ];
    [['l', links], ['r', rechts]].forEach(function (seite) {
      var ort = $('[data-k-spec-seite="' + seite[0] + '"]', root); if (!ort || ort.childElementCount) return;
      seite[1].forEach(function (b, i) {
        var blk = document.createElement('div'); blk.className = 'k-spec-block';
        blk.setAttribute('data-sc', '2'); blk.setAttribute('data-fx', 'clip'); blk.setAttribute('data-d', String((seite[0] === 'l' ? 0 : 0.1) + i * 0.15));
        var s = document.createElement('span'); s.className = 'k-seitlich k-seitlich--' + seite[0]; s.textContent = b.label; blk.appendChild(s);
        b.worte.forEach(function (w) {
          var z = document.createElement('div'); z.className = 'k-spec-zeile'; z.style.fontSize = b.groesse; z.style.lineHeight = '1.04';
          var g = document.createElement('span'); g.className = 'k-g'; g.textContent = w[0]; g.setAttribute('data-voll', w[1] || w[0]); z.appendChild(g); blk.appendChild(z);
        });
        ort.appendChild(blk);
      });
    });
    var lp = $('[data-k-lupe-preise]', root); if (lp) lp.textContent = P.stufen.map(function (s) { return P.betrag(s); }).join(' · ');
    var ex = $('[data-k-extras]', root);
    if (ex && !ex.childElementCount) {
      P.extras.forEach(function (g) { g.eintraege.forEach(function (x) { var s = document.createElement('span'); s.className = 'k-g'; s.textContent = x.name; s.setAttribute('data-voll', x.name + ' – ' + x.satz + ' ' + P.betrag(x)); ex.appendChild(s); }); });
      var alle = P.alleExtras(), kurz = document.createElement('span'); kurz.className = 'k-spec-extras-kurz';
      kurz.textContent = alle.length + ' Extras ab ' + P.euro(Math.min.apply(null, alle.map(function (x) { return x.preis; }))) + ' · im Formular wählbar';
      ex.appendChild(kurz);
    }
    /* 04 Preise: drei Stufen mit Preis und „für wen“, dazu endo */
    var fa = $('[data-k-faecher]', root);
    if (fa && !$('.k-stufe', fa)) P.stufen.forEach(function (s, i) {
      var d = document.createElement('div'); d.className = 'k-stufe'; d.setAttribute('data-sc', '3'); d.setAttribute('data-fx', 'clip'); d.setAttribute('data-d', String(i * 0.15));
      d.appendChild(document.createTextNode(s.name));
      var p = document.createElement('span'); p.className = 'k-stufe__preis k-sans'; p.textContent = P.betrag(s);
      var fuer = document.createElement('i'); fuer.textContent = s.fuer; p.appendChild(fuer); d.appendChild(p);
      fa.appendChild(d);
    });
    return true;
  }
  var nav = $('[data-k-nav]', root);
  NAV.forEach(function (n, i) {
    var b = document.createElement('button'); b.type = 'button';
    b.innerHTML = '<span class="k-lab">' + String(i + 1).padStart(2, '0') + ' ' + n + '</span><span class="k-strich"></span>';
    b.addEventListener('click', function () { springe(i); }); nav.appendChild(b);
  });
  var navKnoepfe = $$('button', nav);

  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function springe(i) {
    var r = root.getBoundingClientRect(), weg = strecke.offsetHeight, ziel = (i / (SCENES - 1)) * weg + r.top;
    window.scrollBy({ top: ziel, behavior: ruhig ? 'auto' : 'smooth' });
  }
  /* Anker zur Anfrage (#preise, #kontakt) führen ans Ende der Bühne – dort liegt das Formular */

  /* ---------- Lupe (03): zeigt das Wort groß + den vollen Stichpunkt ---------- */
  var lupe = $('[data-k-lupe]', root), lupeWort = $('[data-k-lupe-wort]', root), lupeSatz = $('[data-k-lupe-satz]', root);
  buehne.addEventListener('pointerover', function (e) {
    var g = e.target.closest && e.target.closest('.k-g[data-voll]'); if (!g) return;
    lupe.classList.add('ist-an'); lupeWort.textContent = g.textContent; lupeSatz.textContent = g.getAttribute('data-voll');
  });
  buehne.addEventListener('pointerout', function (e) {
    if (e.target.closest && e.target.closest('.k-g') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.k-g'))) {
      lupe.classList.remove('ist-an'); lupeWort.textContent = '& mehr'; lupeSatz.textContent = 'Zeigen Sie auf ein Wort';
    }
  });

  /* ---------- Eingaben: Pointer-Tilt + Ziehen zum Drehen (nur Maus, wie die Vorlage) ---------- */
  var zeiger = { x: 0, y: 0, tx: 0, ty: 0 }, dreh = 0, drehV = 0, ziehen = null;
  buehne.addEventListener('pointermove', function (e) {
    var r = buehne.getBoundingClientRect(); zeiger.tx = ((e.clientX - r.left) / r.width) * 2 - 1; zeiger.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (ziehen && ziehen.id === e.pointerId) { drehV += (e.clientX - ziehen.x) * 0.0022; ziehen.x = e.clientX; }
  });
  buehne.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest && e.target.closest('a,button,input,textarea,select,label,.k-g')) return;
    ziehen = { id: e.pointerId, x: e.clientX }; buehne.style.cursor = 'grabbing';
  });
  window.addEventListener('pointerup', function () { ziehen = null; buehne.style.cursor = ''; });

  /* ---------- Schrift-Elemente je Bild ---------- */
  var stuecke = [];
  function sammeln() { stuecke = $$('[data-sc]', buehne).map(function (el) { return { el: el, scene: Number(el.getAttribute('data-sc')), fx: el.getAttribute('data-fx'), delay: Number(el.getAttribute('data-d')) || 0, last: -1 }; }); }

  /* ---------- 2D-Rückfall: der Kristall als sauberes Bild (projiziert, von hinten nach vorn gemalt) – im Stand des Bildes, damit er
     im Cover nicht ausgewachsen über dem Wort liegt; „Bewegung reduzieren“ = je Bild ein Standbild ---------- */
  var ENDE = null, endeStand = -1;
  function zeichne2d(vp, model, k, coord, eye) {
    var c = ctx2d; if (!c) return; var st = Math.round(coord * 20) / 20; if (st !== endeStand) { endeStand = st; ENDE = geometrie(st); }
    var mvp = multiply(vp, model), tris = [], licht = norm([-0.3, 0.8, 0.6]);
    for (var i = 0; i < ENDE.length; i += STRIDE * 3) {
      var pts = [], z = 0;
      for (var j = 0; j < 3; j++) {
        var o = i + j * STRIDE, x = ENDE[o], y = ENDE[o + 1], zz = ENDE[o + 2];
        var cx = mvp[0] * x + mvp[4] * y + mvp[8] * zz + mvp[12], cy = mvp[1] * x + mvp[5] * y + mvp[9] * zz + mvp[13], cw = mvp[3] * x + mvp[7] * y + mvp[11] * zz + mvp[15];
        pts.push([((cx / cw + k.ox) * 0.5 + 0.5) * W, (0.5 - (cy / cw + k.oy) * 0.5) * H]); z += cw;
      }
      var n = [ENDE[i + 3], ENDE[i + 4], ENDE[i + 5]], nr = [model[0] * n[0] + model[4] * n[1] + model[8] * n[2], model[1] * n[0] + model[5] * n[1] + model[9] * n[2], model[2] * n[0] + model[6] * n[1] + model[10] * n[2]];
      /* Rückseiten weglassen (sonst schimmern Facetten von hinten durch) */
      var px0 = ENDE[i], py0 = ENDE[i + 1], pz0 = ENDE[i + 2], wx = model[0] * px0 + model[4] * py0 + model[8] * pz0, wy = model[1] * px0 + model[5] * py0 + model[9] * pz0, wz = model[2] * px0 + model[6] * py0 + model[10] * pz0;
      if (dot(nr, [eye[0] - wx, eye[1] - wy, eye[2] - wz]) <= 0) continue;
      tris.push({ p: pts, z: z, hell: 0.25 + 0.75 * Math.max(0, dot(nr, licht)), kanten: [ENDE[i + 9], ENDE[i + 10], ENDE[i + 11]] });
    }
    tris.sort(function (a, b) { return b.z - a.z; });
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); c.lineJoin = 'round';
    var t = ORANGE ? [201, 204, 211] : [214, 150, 180], s = ORANGE ? [40, 42, 48] : [74, 30, 52], w = ORANGE ? [246, 247, 250] : [250, 228, 238];
    tris.forEach(function (d) {
      var h = d.hell, col = 'rgb(' + [0, 1, 2].map(function (q) { return Math.round(h < 0.7 ? s[q] + (t[q] - s[q]) * (h / 0.7) : t[q] + (w[q] - t[q]) * ((h - 0.7) / 0.3)); }).join(',') + ')';
      c.beginPath(); c.moveTo(d.p[0][0], d.p[0][1]); c.lineTo(d.p[1][0], d.p[1][1]); c.lineTo(d.p[2][0], d.p[2][1]); c.closePath();
      c.fillStyle = col; c.fill(); c.strokeStyle = col; c.lineWidth = 0.6; c.stroke();
      c.strokeStyle = 'rgba(255, 238, 246, ' + (0.25 + 0.5 * h).toFixed(2) + ')'; c.lineWidth = 0.9; c.beginPath();
      [[1, 2, 0], [2, 0, 1], [0, 1, 2]].forEach(function (e) { if (d.kanten[e[2]] > 0.5) { c.moveTo(d.p[e[0]][0], d.p[e[0]][1]); c.lineTo(d.p[e[1]][0], d.p[e[1]][1]); } });
      c.stroke();
    });
  }

  /* ---------- Schleife ---------- */
  var laeuft = false, sichtbar = true, zuletzt = performance.now(), zeit = 0, p01 = -1, gezeigt = -1, koord = 0, raf = 0;
  function bild(jetzt) {
    raf = requestAnimationFrame(bild);
    var dt = Math.min(0.05, (jetzt - zuletzt) / 1000); zuletzt = jetzt;
    var bewegt = !ruhig; if (bewegt) zeit += dt;
    var r = root.getBoundingClientRect(), weg = strecke.offsetHeight, p = weg > 0 ? klemm(-r.top / weg) : 0;
    p01 = p01 < 0 || ruhig ? p : p01 + (p - p01) * (1 - Math.exp(-dt * 9));
    var coord = koord = sceneCoord(p01, SCENES, HOLD), szene = Math.round(coord);
    if (szene !== gezeigt) { gezeigt = szene; navKnoepfe.forEach(function (b, i) { if (i === szene) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }); }

    /* Kamera */
    var tall = H > W * 1.05, k = keyAt(coord, tall);
    zeiger.x += (zeiger.tx - zeiger.x) * (1 - Math.exp(-dt * 4)); zeiger.y += (zeiger.ty - zeiger.y) * (1 - Math.exp(-dt * 4));
    if (bewegt) { dreh += drehV + dt * 0.1; drehV *= Math.exp(-dt * 3); } else { dreh += drehV; drehV = 0; }
    var px = bewegt ? zeiger.x : 0, py = bewegt ? zeiger.y : 0, fov = (30 * Math.PI) / 180, minDim = Math.min(W, H);
    var dist = (RADIUS * H) / (k.size * minDim * Math.tan(fov / 2)), el = Math.max(-88, Math.min(88, k.el + py * 9)) * (Math.PI / 180);
    var eye = [0, Math.sin(el) * dist, Math.cos(el) * dist];
    var vp = multiply(perspective(fov, W / H, Math.max(0.05, dist - 6), dist + 8), lookAt(eye, [0, 0, 0]));
    var model = multiply(rotY(k.spin + dreh + px * 0.35), rotX(py * 0.05));

    /* Lichthof hinter dem Kristall folgt seinem Herz */
    var gx = (0.5 + k.ox / 2) * W, gy = (0.5 - k.oy / 2) * H, gr = k.size * minDim * 1.25;
    schein.style.transform = 'translate(' + (gx - gr).toFixed(1) + 'px,' + (gy - gr).toFixed(1) + 'px)';
    schein.style.width = schein.style.height = (gr * 2).toFixed(1) + 'px';
    schein.style.opacity = String(0.55 + 0.45 * smooth(4.2, 5, coord));

    if (gl && prog) {
      var c = gl, stand = Math.round(coord * 400) / 400;
      if (stand !== geoStand) { geoStand = stand; geoDaten = geometrie(stand); c.bindBuffer(c.ARRAY_BUFFER, vbo); c.bufferData(c.ARRAY_BUFFER, geoDaten, c.DYNAMIC_DRAW); }
      c.viewport(0, 0, leinwand.width, leinwand.height); c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT);
      c.uniformMatrix4fv(loc.u_vp, false, vp); c.uniformMatrix4fv(loc.u_model, false, model); c.uniform2f(loc.u_offset, k.ox, k.oy);
      c.uniform3f(loc.u_eye, eye[0], eye[1], eye[2]);
      c.uniform3f(loc.u_farbe, FARBE[0], FARBE[1], FARBE[2]); c.uniform3f(loc.u_tief, TIEF[0], TIEF[1], TIEF[2]); c.uniform3f(loc.u_hot, HEISS[0], HEISS[1], HEISS[2]);
      c.uniform1f(loc.u_politur, smooth(0.4, 4.3, coord)); c.uniform1f(loc.u_glut, smooth(4.3, 5, coord) * (0.8 + 0.2 * Math.sin(zeit * 1.1))); c.uniform1f(loc.u_alpha, 1);
      c.drawArrays(c.TRIANGLES, 0, geoDaten.length / STRIDE);
    } else if (ctx2d) zeichne2d(vp, model, k, coord, eye);

    /* Schrift je Bild – wie die Vorlage */
    stuecke.forEach(function (it) {
      var v = reveal(coord, it.scene, it.delay), q = Math.round(v * 500) / 500; if (q === it.last) return; it.last = q;
      var s = it.el.style, dir = coord < it.scene ? 1 : -1;
      s.visibility = q <= 0 ? 'hidden' : '';
      if (it.fx === 'line') { s.transform = 'scaleX(' + q + ')'; s.opacity = String(Math.min(1, q * 2)); return; }
      s.opacity = String(q);
      if (ruhig || it.fx === 'fade') return;
      if (it.fx === 'clip') { var hid = ((1 - q) * 100).toFixed(1); s.clipPath = q > 0.998 ? '' : dir > 0 ? 'inset(-0.3em -100vw ' + hid + '% -100vw)' : 'inset(' + hid + '% -100vw -0.3em -100vw)'; s.transform = 'translateY(' + ((1 - q) * 0.4 * dir).toFixed(3) + 'em)'; }
      else { s.transform = 'translateY(' + ((1 - q) * 34 * dir).toFixed(1) + 'px)'; s.filter = q > 0.995 ? '' : 'blur(' + ((1 - q) * 8).toFixed(1) + 'px)'; }
    });

    /* Das Cover-Wort teilt sich zur Krone: „ERG“ und „UN.“ flankieren den Kristall (?krone=rand: nur E und . wie die Vorlage) */
    var m = easeInOut(klemm(coord)), aus = klemm(coord - 1), k1 = keyAt(1, tall), r1 = k1.size * minDim * 0.5, cy1 = (0.5 - k1.oy / 2) * H;
    var gruppen = KRONE_RAND ? { 0: -1, 5: 1 } : { 0: -1, 1: -1, 2: -1, 3: 1, 4: 1, 5: 1 };
    var breite = { '-1': 0, '1': 0 }, rand = { '-1': [1e9, -1e9], '1': [1e9, -1e9] };
    zeichen.forEach(function (c, i) { var g = gruppen[i], n0 = nat[i]; if (!g || !n0) return; rand[g][0] = Math.min(rand[g][0], n0.x - n0.w / 2); rand[g][1] = Math.max(rand[g][1], n0.x + n0.w / 2); });
    ['-1', '1'].forEach(function (g) { breite[g] = Math.max(1, rand[g][1] - rand[g][0]); });
    var platz = W / 2 - r1 - minDim * 0.02 - W * 0.05, sk = Math.min(1, platz / Math.max(breite['-1'], breite['1']));
    zeichen.forEach(function (c, i) {
      var n0 = nat[i]; if (!n0) return; var g = gruppen[i];
      if (g) {
        var mitteG = (rand[g][0] + rand[g][1]) / 2, zielMitte = W / 2 + g * (r1 + minDim * 0.02 + (breite[g] * sk) / 2);
        var tx = zielMitte + (n0.x - mitteG) * mix(1, sk, m), dx = (tx - n0.x) * m, dy = (cy1 - n0.y) * m - aus * 60;
        c.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + mix(1, sk, m).toFixed(3) + ')';
        c.style.opacity = String(coord < 1 ? 1 : 1 - smooth(0.1, 0.45, aus));
        c.style.filter = ruhig || aus < 0.05 ? '' : 'blur(' + (aus * 14).toFixed(1) + 'px)';
      } else {
        var dx2 = (W / 2 - n0.x) * m * 0.75, dy2 = (cy1 - n0.y) * m;
        c.style.transform = ruhig ? '' : 'translate(' + dx2.toFixed(1) + 'px,' + dy2.toFixed(1) + 'px) scale(' + (1 - m * 0.7).toFixed(3) + ')';
        c.style.opacity = String(1 - smooth(0, 0.4, m));
        c.style.filter = ruhig || m < 0.02 ? '' : 'blur(' + (m * 12).toFixed(1) + 'px)';
      }
      c.style.visibility = coord > 1.6 ? 'hidden' : '';
    });
  }
  function start() { if (laeuft || !sichtbar || document.hidden) return; laeuft = true; zuletzt = performance.now(); raf = requestAnimationFrame(bild); }
  function stop() { laeuft = false; cancelAnimationFrame(raf); }

  function los() {
    inhalte(); sammeln(); messen();
    new ResizeObserver(messen).observe(buehne);
    if (document.fonts) { document.fonts.ready.then(messen); if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', messen); }
    new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) start(); else stop(); }).observe(root);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
  }
  if (window.PREISE || document.readyState !== 'loading') los(); else document.addEventListener('DOMContentLoaded', los);
  window.__kristall = {
    zustand: function () { return { koord: koord, gl: !!gl, ableitung: ableitung, radius: RADIUS, seed: SEED, dreiecke: geoDaten ? geoDaten.length / STRIDE / 3 : 0 }; },
    geometrie: geometrie, springe: springe
  };
})();
