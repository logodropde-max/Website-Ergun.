/* ERGUN. – Startseite „Lebensbaum“ (01.10.2026, Vorschau ?titel=baum). Ausnahme auf ERGUNs Wunsch: Lebensbaum im Kreis (Formvorlage:
   Higgsfield-Übersicht 3c734420, Feld 5) im Stil der Vorlage „Lycoris Specimen“. Diese Datei baut das Emblem EINMAL (Geometrie) und liefert
   die Shader; gewachsen wird nur über Uniforms (u_grow 0…5 = Bild-Koordinate, u_ring 0…1). Gezeichnet wird in js/kristall.js.
   Mittel der Vorlage: Stamm, Äste, Wurzeln und Ring als Röhren (paralleler Rahmen), Blätter als Bänder mit Dicke, Blüten als Mini-Lilien
   aus dem Floret-Code (6 Blütenblätter + Staubfäden mit Kölbchen). Krone oben und Wurzeln unten spiegeln sich (symmetrisch), Ring Radius 1.
   Eckenformat: Lage 3 · Normale 3 · aux 4 (s entlang, Phase, Art, Start) · Basis 3 (Röhren: Mittelpunkt des Rings; sonst Ansatzpunkt) · Ende 1.
   Arten: 0 Röhre (wächst entlang s, Spitze läuft spitz zu) · 1 Blatt · 2 Blüte (wachsen aus dem Ansatz) · 3 Ring (zeichnet sich von unten
   nach beiden Seiten und schließt sich oben) · 4 Ring-Andeutung (hauchfein, immer da) · 5 Leuchtpunkt · 6 Samen. */
(function (root) {
  'use strict';
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6d2b79f5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function drehe(v, a, w) { var c = Math.cos(w), s = Math.sin(w), d = dot(a, v); return add(add(mul(v, c), mul(cross(a, v), s)), mul(a, d * (1 - c))); }
  var STRIDE = 14, Z = [0, 0, 1], RING = 1, INNEN = 0.82;

  function netz() {
    var v = [], idx = [], n = 0;
    function push(p, nr, s, phase, art, t0, basis, t1) { v.push(p[0], p[1], p[2], nr[0], nr[1], nr[2], s, phase, art, t0, basis[0], basis[1], basis[2], t1); return n++; }
    function tangente(pts, i) { return norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)])); }
    return {
      /* Röhre auf mitgeführtem Rahmen (Vorlage) – Radius von r0 nach r1, Basis = Mittelpunkt (für das Wachsen entlang s) */
      roehre: function (c) {
        var seg = c.seg || 6, k = c.pts.length, N = norm(cross(tangente(c.pts, 0), Math.abs(tangente(c.pts, 0)[2]) > 0.9 ? [1, 0, 0] : Z)), ringe = [];
        for (var i = 0; i < k; i++) {
          var s = i / (k - 1), T = tangente(c.pts, i); N = norm(sub(N, mul(T, dot(N, T)))); var B = cross(T, N);
          var rad = c.r0 + (c.r1 - c.r0) * s; if (c.knolle && s > 0.88) rad = c.r1 * (0.7 + 2.2 * Math.sin(((s - 0.88) / 0.12) * Math.PI * 0.92));
          ringe.push(n);
          for (var j = 0; j <= seg; j++) { var w = (j / seg) * Math.PI * 2, nr = add(mul(N, Math.cos(w)), mul(B, Math.sin(w))); push(add(c.pts[i], mul(nr, rad)), nr, c.sFn ? c.sFn(i, k) : s, c.phase || 0, c.art, c.t0, c.pts[i], c.t1); }
        }
        for (i = 0; i < k - 1; i++) for (j = 0; j < seg; j++) { var a = ringe[i] + j, b = ringe[i + 1] + j; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      },
      /* Band mit Dicke (Blütenblatt der Vorlage) – für Blätter und Lilienblätter */
      band: function (c) {
        var ringe = [], k = c.pts.length;
        for (var i = 0; i < k; i++) {
          var s = i / (k - 1), T = tangente(c.pts, i), N = norm(cross(T, c.lat)), Wd = cross(N, T);
          var a = c.twist * Math.sin(Math.PI * s), ca = Math.cos(a), sa = Math.sin(a), W2 = add(mul(Wd, ca), mul(N, sa)); N = sub(mul(N, ca), mul(Wd, sa)); Wd = W2;
          var hw = c.w * (0.42 + 0.58 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + s * 0.9)), 0.6)), p = c.pts[i];
          var k0 = add(add(p, mul(Wd, hw)), mul(N, c.t)), k1 = add(sub(p, mul(Wd, hw)), mul(N, c.t)), k2 = sub(sub(p, mul(Wd, hw)), mul(N, c.t)), k3 = sub(add(p, mul(Wd, hw)), mul(N, c.t));
          var mW = mul(Wd, -1), mN = mul(N, -1), x = function (q, nr) { return push(q, nr, s, c.phase, c.art, c.t0, c.base, c.t1); };
          ringe.push([x(k0, N), x(k1, N), x(k1, mW), x(k2, mW), x(k2, mN), x(k3, mN), x(k3, Wd), x(k0, Wd)]);
        }
        for (i = 0; i < k - 1; i++) for (var f = 0; f < 4; f++) { var A = ringe[i], Bb = ringe[i + 1], q = f * 2; idx.push(A[q], A[q + 1], Bb[q], A[q + 1], Bb[q + 1], Bb[q]); }
      },
      kugel: function (mitte, rx, ry, art, t0, t1, phase) {
        var start = n, U = 14, V = 10;
        for (var i = 0; i <= V; i++) for (var j = 0; j <= U; j++) {
          var th = (i / V) * Math.PI, ph = (j / U) * Math.PI * 2, nr = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
          push(add(mitte, [nr[0] * rx, nr[1] * ry, nr[2] * rx]), norm([nr[0] / rx, nr[1] / ry, nr[2] / rx]), 1, phase || 0, art, t0, mitte, t1);
        }
        for (i = 0; i < V; i++) for (j = 0; j < U; j++) { var a = start + i * (U + 1) + j, b = a + U + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      },
      fertig: function () { return { data: new Float32Array(v), index: n > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), ecken: n }; }
    };
  }

  /* Bogen in der Bildebene: Start, Winkel (Bogenmaß, 0 = rechts, π/2 = oben), Länge, Krümmung, Punkte; leichte Tiefe für echtes 3D */
  function bogen(p0, w, L, krumm, k, tiefe) {
    var pts = [p0], p = p0;
    for (var i = 1; i <= k; i++) { var s = i / k, a = w + krumm * s; p = add(p, [Math.cos(a) * L / k, Math.sin(a) * L / k, 0]); pts.push([p[0], p[1], tiefe * Math.sin(Math.PI * s)]); }
    return pts;
  }
  function imKreis(pts) { for (var i = 0; i < pts.length; i++) if (Math.hypot(pts[i][0], pts[i][1]) > INNEN) return false; return true; }

  /* ---------- das Emblem ---------- */
  function bauen(opt) {
    opt = opt || {}; var fein = opt.fein === undefined ? 1 : opt.fein, r = rng(opt.seed || 7), m = netz(), PK = Math.max(10, Math.round(20 * fein)), SEG = fein < 0.8 ? 5 : 6;
    var spitzen = [], blattStellen = [], linien = [];
    function roehre(pts, r0, r1, t0, t1, phase) { m.roehre({ pts: pts, r0: r0, r1: r1, t0: t0, t1: t1, art: 0, seg: SEG, phase: phase }); linien.push({ pts: pts, w: r0 }); }
    function spiegel(pts) { return pts.map(function (p) { return [-p[0], p[1], p[2]]; }); }

    /* Ast/Wurzel rekursiv (rechte Seite; links gespiegelt): bleibt im Ring, Kinder zweigen bei 45 % und 75 % ab */
    function zweig(p0, w, L, krumm, tiefe, t0, dauer, r0, wurzel, ebene) {
      var pts, l = L;
      for (var v = 0; v < 12; v++) { pts = bogen(p0, w, l, krumm, PK, (r() - 0.5) * 0.08); if (imKreis(pts)) break; l *= 0.88; }
      var r1 = r0 * 0.55, t1 = t0 + dauer;
      [pts, spiegel(pts)].forEach(function (q, i) { roehre(q, r0, r1, t0, t1, i * 1.7 + ebene); });
      var ende = pts[pts.length - 1], richt = norm(sub(ende, pts[pts.length - 2]));
      if (!wurzel) blattStellen.push({ pts: pts, t0: t0, t1: t1 });
      if (tiefe === 0) { if (!wurzel) spitzen.push({ p: ende, d: richt, t: t1 }); return; }
      [0.45, 0.75].forEach(function (f, j) {
        var i = Math.round(f * PK), q = pts[i], tw = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
        var seite = j === 0 ? 1 : -1, aus = tw + seite * (0.42 + r() * 0.2) + (wurzel ? 0 : (Math.cos(tw) >= 0 ? -0.12 : 0.12));   /* Krone: Zweige eher nach außen als nach oben – füllt den Halbkreis wie Feld 5 */
        zweig(q, aus, l * (0.52 + r() * 0.1), krumm * 0.8 * (r() < 0.5 ? 1 : -1) + (wurzel ? (r() - 0.5) * 0.5 : 0), tiefe - 1, t0 + dauer * f, dauer * 0.85, r1 * 0.95, wurzel, ebene + 1);
      });
    }

    /* Stamm (wie Feld 5): zwei verschlungene Stränge, die vom Samen in der Mitte nach oben (Keimling) und nach unten (erste Wurzel) wachsen */
    var OBEN = 0.2, UNTEN = -0.2;
    for (var s = 0; s < 2; s++) {
      var oben = [], unten = [];
      for (var i = 0; i <= PK; i++) {
        var u = i / PK, a = s * Math.PI + u * 3.6, amp = 0.034 * (0.55 + 0.45 * u);
        oben.push([Math.cos(a) * amp, u * OBEN, Math.sin(a) * amp * 0.6]);
        unten.push([Math.cos(-a) * amp, u * UNTEN, Math.sin(-a) * amp * 0.6]);
      }
      roehre(oben, 0.03, 0.026, 0.12, 1.35, s);
      roehre(unten, 0.03, 0.024, 0.12, 1.25, s + 3);   /* Bild 02: Keimling und erste Wurzel schon deutlich aus dem Samen heraus */
    }
    /* Krone: Hauptäste gehen erst seitlich hinaus und schwingen dann nach oben (S-Bögen wie Feld 5) – füllen den oberen Halbkreis */
    zweig([0, OBEN, 0], Math.PI / 2, 0.46, 0.0, 2, 1.65, 1.1, 0.022, false, 0);
    [[0.95, 0.62, 0.3], [0.45, 0.72, 0.5], [-0.05, 0.8, 0.55]].forEach(function (a, j) {
      zweig([0, OBEN - j * 0.05, 0], a[0], a[1], a[2], 2, 1.7 + j * 0.06, 1.1, 0.022 - j * 0.002, false, 0);
    });
    /* Wurzelkrone: Spiegelbild – erst seitlich, dann nach unten gebogen, feiner und weiter verzweigt */
    zweig([0, UNTEN, 0], -Math.PI / 2, 0.6, 0.0, 2, 1.6, 1.1, 0.02, true, 0);
    [[-1.05, 0.68, -0.35], [-0.6, 0.76, -0.7], [-0.2, 0.8, -0.95]].forEach(function (a, j) {
      zweig([0, UNTEN + j * 0.03, 0], a[0], a[1], a[2], 2, 1.65 + j * 0.06, 1.1, 0.02 - j * 0.002, true, 0);
    });

    /* Blätter: Bänder entlang aller Äste (ab den Hauptästen), abwechselnd links/rechts, leicht gekippt – entfalten sich von innen nach außen */
    blattStellen.forEach(function (b, bi) {
      [0.35, 0.62, 0.88].forEach(function (f, j) {
        var i = Math.round(f * PK), p = b.pts[i], T = norm(sub(b.pts[Math.min(i + 1, PK)], b.pts[i - 1])), seite = j % 2 ? 1 : -1;
        [1, -1].forEach(function (sp) {
          var pp = [p[0] * sp, p[1], p[2]], Tt = [T[0] * sp, T[1], T[2]], d = drehe(Tt, Z, seite * sp * 0.75), L = 0.13 + r() * 0.04, pts = [pp], q = pp;
          for (var k = 1; k <= 10; k++) { var u = k / 10; q = add(q, mul(drehe(d, Z, seite * sp * -0.45 * u), L / 10)); pts.push([q[0], q[1], q[2] + 0.025 * Math.sin(Math.PI * u)]); }
          var lat = drehe(cross(Z, d), d, (r() - 0.5) * 0.5 + 0.35 * seite);
          var t0 = Math.min(4.3, b.t0 + (b.t1 - b.t0) * f + 0.4), t1 = Math.min(4.85, t0 + 0.55);
          m.band({ pts: pts, w: 0.027, t: 0.006, lat: lat, twist: 0.18, phase: bi + j, art: 1, t0: t0, t1: t1, base: pp });
          linien.push({ pts: pts, w: 0.022 });
        });
      });
    });

    /* Blüten: Mini-Lilien (Floret der Vorlage) an den Spitzen der oberen Krone, Leuchtpunkte an den übrigen Spitzen */
    spitzen.sort(function (a, b) { return b.p[1] - a.p[1]; });
    spitzen.forEach(function (sp, si) {
      [1, -1].forEach(function (seite) {
        if (seite < 0 && Math.abs(sp.p[0]) < 0.02) return;
        var p = [sp.p[0] * seite, sp.p[1], sp.p[2]], dir = [sp.d[0] * seite, sp.d[1], sp.d[2]];
        var bluete = si < 8 && p[1] > 0.1, t0 = Math.max(3.7, Math.min(4.25, sp.t)), t1 = t0 + 0.6;
        var platz = (0.95 - Math.hypot(p[0], p[1])) / 0.27;   /* Blüte bleibt im Ring: am Rand kleiner */
        if (bluete && platz > 0.45) lilie(m, p, norm(add(add(mul(dir, 0.45), [0, 0, 0.85]), [0, 0.2, 0])), Math.min(1.05, platz) * (0.95 + r() * 0.1), t0, t1, r);
        m.kugel(add(p, mul(dir, bluete ? 0.0 : 0.012)), 0.013, 0.013, 5, 4.45, 4.95, si);
      });
    });

    /* Ring: Röhre um die Mitte, s = Abstand vom unteren Punkt (0) bis oben (1) – zeichnet sich von unten nach beiden Seiten */
    var RS = Math.round(180 * Math.max(0.6, fein)), ring = [];
    for (i = 0; i <= RS; i++) { var w = -Math.PI / 2 + (i / RS) * Math.PI * 2; ring.push([Math.cos(w) * RING, Math.sin(w) * RING, 0]); }
    function ringS(i, k) { var u = i / (k - 1); return u <= 0.5 ? u * 2 : (1 - u) * 2; }
    m.roehre({ pts: ring, r0: 0.02, r1: 0.02, t0: 0, t1: 1, art: 3, seg: 8, sFn: ringS });
    m.roehre({ pts: ring, r0: 0.0035, r1: 0.0035, t0: 0, t1: 1, art: 4, seg: 5, sFn: ringS });
    linien.push({ pts: ring, w: 0.02, ring: true });

    /* Samen: glänzender Tropfen in der Mitte, wird zum Knoten am Stammfuß */
    m.kugel([0, 0.0, 0], 0.07, 0.09, 6, 0, 1, 0);
    var g = m.fertig(); g.linien = linien; g.spitzen = spitzen.length;
    return g;
  }

  /* Mini-Lilie: 6 Blütenblätter (Band) + 5 Staubfäden mit Kölbchen, um die Achse u – Maße der Vorlage, verkleinert */
  function lilie(m, basis, u, gr, t0, t1, r) {
    var e1 = norm(cross(u, Math.abs(u[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])), e2 = cross(u, e1), S = 0.17 * gr;
    for (var j = 0; j < 6; j++) {
      var th = (j / 6) * Math.PI * 2 + r() * 0.3, d = add(mul(e1, Math.cos(th)), mul(e2, Math.sin(th))), lat = norm(cross(d, u)), phase = r() * 6.28;
      var L = (1.35 + r() * 0.3) * S, b0 = 0.5, b1 = 2.3 + r() * 0.3, pts = [basis], p = basis;
      for (var k = 1; k <= 12; k++) { var s = k / 12, b = b0 + (b1 - b0) * Math.pow(s, 1.2); p = add(p, mul(add(mul(d, Math.sin(b)), mul(u, Math.cos(b))), L / 12)); pts.push(p); }
      m.band({ pts: pts, w: 0.075 * S, t: 0.02 * S, lat: lat, twist: 0.3, phase: phase, art: 2, t0: t0, t1: t1, base: basis });
    }
    for (j = 0; j < 5; j++) {
      var th2 = (j / 5) * Math.PI * 2 + 0.4, d2 = add(mul(e1, Math.cos(th2)), mul(e2, Math.sin(th2))), sp = [basis]; p = basis;
      for (k = 1; k <= 10; k++) { s = k / 10; p = add(p, mul(norm(add(mul(u, 1 - s * 0.7), mul(d2, 0.25 + s * 0.6))), 1.5 * S / 10)); sp.push(p); }
      m.roehre({ pts: sp, r0: 0.012 * S, r1: 0.008 * S, t0: t0 + 0.1, t1: t1 + 0.05, art: 2, seg: 4, knolle: true, phase: j });
    }
  }

  /* Shader: Chrom der Vorlage (Studio-Licht, Spiegelung), Farbe von außen (Pink oder Karmin), Leuchtpunkte leuchten */
  var VERT = 'attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec4 a_aux; attribute vec3 a_base; attribute float a_t1;\n' +
    'uniform mat4 u_vp; uniform mat4 u_model; uniform vec2 u_offset; uniform float u_time; uniform float u_sway; uniform float u_grow; uniform float u_ring; uniform float u_seed;\n' +
    'varying vec3 v_n; varying vec3 v_w; varying float v_s; varying float v_k;\n' +
    'void main() {\n' +
    '  vec3 p = a_pos; float k = a_aux.z; float s = a_aux.x;\n' +
    '  float g = clamp((u_grow - a_aux.w) / max(a_t1 - a_aux.w, 0.001), 0.0, 1.0);\n' +
    '  if (k < 0.5) { float f = g <= 0.0 ? 0.0 : 1.0 - smoothstep(g - 0.12, g, s); p = a_base + (p - a_base) * f; }\n' +
    '  else if (k < 2.5 || (k > 4.5 && k < 5.5)) { float e = 1.0 - pow(1.0 - g, 3.0); p = a_base + (p - a_base) * e;\n' +
    '    p += 0.004 * u_sway * s * vec3(sin(u_time * 0.9 + a_aux.y), 0.5 * sin(u_time * 1.3 + a_aux.y * 1.7), cos(u_time * 0.7 + a_aux.y * 1.3)); }\n' +
    '  else if (k < 3.5) { float f = u_ring <= 0.0 ? 0.0 : u_ring >= 0.999 ? 1.0 : 1.0 - smoothstep(u_ring - 0.02, u_ring, s); p = a_base + (p - a_base) * f; }\n' +
    '  else if (k > 5.5) { p = a_base + (p - a_base) * u_seed; }\n' +
    '  vec4 w = u_model * vec4(p, 1.0);\n' +
    '  v_w = w.xyz; v_n = (u_model * vec4(a_nrm, 0.0)).xyz; v_s = s; v_k = k;\n' +
    '  gl_Position = u_vp * w; gl_Position.xy += u_offset * gl_Position.w; }';
  var FRAG = 'precision highp float;\n' +
    'uniform vec3 u_eye; uniform vec3 u_red; uniform vec3 u_tief; uniform vec3 u_hot; uniform float u_alpha; uniform float u_glow;\n' +
    'varying vec3 v_n; varying vec3 v_w; varying float v_s; varying float v_k;\n' +
    'float studio(vec3 r) {\n' +
    '  float key = pow(max(dot(r, normalize(vec3(-0.45, 0.85, 0.35))), 0.0), 14.0) * 2.6;\n' +
    '  float strip = smoothstep(0.55, 0.8, r.x) * smoothstep(-0.7, 0.3, r.y) * 1.4;\n' +
    '  float rim = smoothstep(0.55, 0.95, -r.z) * smoothstep(-0.2, 0.5, r.y) * 0.9;\n' +
    '  float hz = exp(-abs(r.y - 0.05) * 7.0) * 0.4;\n' +
    '  float front = pow(max(r.z, 0.0), 6.0) * smoothstep(-0.2, 0.6, r.y) * 0.55;\n' +
    '  return key + strip + rim + hz + front; }\n' +
    'void main() {\n' +
    '  vec3 n = normalize(v_n); vec3 v = normalize(u_eye - v_w); if (dot(n, v) < 0.0) n = -n;\n' +
    '  vec3 r = reflect(-v, n); float e = studio(r);\n' +
    '  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);\n' +
    '  float dif = max(dot(n, normalize(vec3(-0.3, 0.8, 0.6))), 0.0);\n' +
    '  vec3 col = u_tief * (0.06 + 0.32 * dif);\n' +
    '  col += u_red * e * 0.95;\n' +
    '  col += u_hot * pow(e, 3.0) * 0.3;\n' +
    '  col += u_red * fr * 0.85;\n' +
    '  if (v_k > 3.5 && v_k < 4.5) col *= 0.55;\n' +
    '  if (v_k > 4.5 && v_k < 5.5) col += (u_hot * 1.6 + u_red * 0.8) * u_glow;\n' +
    '  col = col / (1.0 + col); col = pow(col, vec3(1.0 / 2.2));\n' +
    '  gl_FragColor = vec4(col * u_alpha, u_alpha); }';
  var ATTRIBUTE = [['a_pos', 3, 0], ['a_nrm', 3, 3], ['a_aux', 4, 6], ['a_base', 3, 10], ['a_t1', 1, 13]];
  var UNIFORMS = ['u_vp', 'u_model', 'u_offset', 'u_time', 'u_sway', 'u_grow', 'u_ring', 'u_seed', 'u_eye', 'u_red', 'u_tief', 'u_hot', 'u_alpha', 'u_glow'];

  root.ERGUN_BAUM = { STRIDE: STRIDE, RADIUS: RING * 1.04, bauen: bauen, VERT: VERT, FRAG: FRAG, ATTRIBUTE: ATTRIBUTE, UNIFORMS: UNIFORMS };
})(typeof window !== 'undefined' ? window : globalThis);
