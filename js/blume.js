/* ERGUN. – Startseite „Blume“ (01.10.2026, Vorschau ?titel=blume). Ausnahme auf ERGUNs Wunsch: näher an die Vorlage „Lycoris Specimen“
   (07 Vorlagen/Lycoris-Specimen-Vorlage.tsx.txt) – aus dem pinken Diamanten wird eine Chrom-Blume, die beim Scrollen aufblüht.
   Diese Datei baut nur die Blüte (Geometrie + Shader), gezeichnet wird sie in js/kristall.js. Drei Arten (?blume=):
     lilie – die Spinnenlilie der Vorlage (buildCurves/buildMesh übernommen), nur mit „offen“ 0…1: geschlossen = schmale Knospe
     rose  – spiralig geschichtete, gewölbte Blätter (goldener Winkel), außen weiter geöffnet und am Rand zurückgerollt
     tulpe – 6 große gewölbte Blätter in zwei Kreisen, innen Staubfäden + Griffel
   offen 0 = geschlossene Knospe · 1 = voll geöffnet. Eckenformat wie die Vorlage: Lage 3 · Normale 3 · aux 4 (s, Phase, Art, Staffel) · Basis 3. */
(function (root) {
  'use strict';
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function klemm(x) { return x <= 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = klemm((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6d2b79f5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  var STRIDE = 13;
  /* Herz = wohin die Kamera schaut (wie HEART der Vorlage) – je Art die Mitte der Blüte */
  var HERZ = { lilie: [0, 0.25, 0], rose: [0, 0.42, 0], tulpe: [0, 0.55, 0] };

  /* ---------- Netz-Baukasten (wie buildMesh der Vorlage) ---------- */
  function netz() {
    var v = [], idx = [], n = 0;
    function push(p, nr, s, phase, art, staffel, basis) { v.push(p[0], p[1], p[2], nr[0], nr[1], nr[2], s, phase, art, staffel, basis[0], basis[1], basis[2]); return n++; }
    function tangente(pts, i) { return norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)])); }
    return {
      /* Band mit echter Dicke: vier Flächen, harte Kanten (Blütenblatt der Lilie) – 1:1 aus der Vorlage */
      band: function (c) {
        var ringe = [], erst = null, letzt = null, T0 = [0, 1, 0], T1 = [0, 1, 0], k = c.pts.length;
        for (var i = 0; i < k; i++) {
          var s = i / (k - 1), T = tangente(c.pts, i), N = norm(cross(T, c.lat)), Wd = cross(N, T);
          var a = c.twist * Math.sin(Math.PI * s), ca = Math.cos(a), sa = Math.sin(a), W2 = add(mul(Wd, ca), mul(N, sa));
          N = sub(mul(N, ca), mul(Wd, sa)); Wd = W2;
          var hw = c.w * (0.42 + 0.58 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + s * 0.9)), 0.6)) * (1 + 0.1 * Math.sin(s * 34 + c.phase)), p = c.pts[i];
          var k0 = add(add(p, mul(Wd, hw)), mul(N, c.t)), k1 = add(sub(p, mul(Wd, hw)), mul(N, c.t)), k2 = sub(sub(p, mul(Wd, hw)), mul(N, c.t)), k3 = sub(add(p, mul(Wd, hw)), mul(N, c.t));
          var mW = mul(Wd, -1), mN = mul(N, -1), x = function (q, nr) { return push(q, nr, s, c.phase, 0, c.stagger, c.base); };
          ringe.push([x(k0, N), x(k1, N), x(k1, mW), x(k2, mW), x(k2, mN), x(k3, mN), x(k3, Wd), x(k0, Wd)]);
          if (i === 0) { erst = [k0, k1, k2, k3]; T0 = T; }
          if (i === k - 1) { letzt = [k0, k1, k2, k3]; T1 = T; }
        }
        for (i = 0; i < k - 1; i++) for (var f = 0; f < 4; f++) { var A = ringe[i], B = ringe[i + 1], q = f * 2; idx.push(A[q], A[q + 1], B[q], A[q + 1], B[q + 1], B[q]); }
        [[erst, mul(T0, -1), 0], [letzt, T1, 1]].forEach(function (d) { var o = d[0].map(function (p) { return push(p, d[1], d[2], c.phase, 0, c.stagger, c.base); }); idx.push(o[0], o[1], o[2], o[0], o[2], o[3]); });
      },
      /* Röhre auf einem mitgeführten Rahmen (Staubfaden, Griffel, Stiel) – 1:1 aus der Vorlage */
      roehre: function (c) {
        var seg = c.kind === 2 ? 10 : 6, k = c.pts.length, N = norm(cross(tangente(c.pts, 0), c.kind === 2 ? [0, 0, 1] : c.lat)), ringe = [];
        for (var i = 0; i < k; i++) {
          var s = i / (k - 1), T = tangente(c.pts, i); N = norm(sub(N, mul(T, dot(N, T)))); var B = cross(T, N);
          var rad = c.w * (c.kind === 1 ? 1 - 0.35 * s : 1);
          if (c.bulb && s > 0.9) rad = c.w * (0.65 + 2.1 * Math.sin(((s - 0.9) / 0.1) * Math.PI * 0.92));
          if (c.kind === 1 && i === k - 1) rad *= 0.3;
          ringe.push(n);
          for (var j = 0; j <= seg; j++) { var w = (j / seg) * Math.PI * 2, nr = add(mul(N, Math.cos(w)), mul(B, Math.sin(w))); push(add(c.pts[i], mul(nr, rad)), nr, s, c.phase, c.kind, c.stagger, c.base); }
        }
        for (i = 0; i < k - 1; i++) for (j = 0; j < seg; j++) { var a = ringe[i] + j, b = ringe[i + 1] + j; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      },
      /* gewölbte Fläche (Rosen- und Tulpenblatt): Gitter u (Grund → Spitze) × v (Rand → Rand), Normale aus dem Gitter, nach außen gedreht */
      flaeche: function (P, U, V, aussen, phase, staffel, basis) {
        var start = n, g = [];
        for (var i = 0; i <= U; i++) { g.push([]); for (var j = 0; j <= V; j++) g[i].push(P(i / U, (j / V) * 2 - 1)); }
        for (i = 0; i <= U; i++) for (j = 0; j <= V; j++) {
          var du = sub(g[Math.min(i + 1, U)][j], g[Math.max(i - 1, 0)][j]), dv = sub(g[i][Math.min(j + 1, V)], g[i][Math.max(j - 1, 0)]), nr = norm(cross(du, dv));
          if (dot(nr, aussen(i / U)) < 0) nr = mul(nr, -1);
          push(g[i][j], nr, i / U, phase, 0, staffel, basis);
        }
        for (i = 0; i < U; i++) for (j = 0; j < V; j++) { var a = start + i * (V + 1) + j, b = a + V + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      },
      fertig: function () { return { data: new Float32Array(v), index: n > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), ecken: n }; }
    };
  }

  /* ---------- Stiel (Schaft der Vorlage: hoch, blattlos, leicht gebogen) ---------- */
  function stiel(m, hoehe) {
    var pts = [];
    for (var k = 0; k <= 40; k++) { var s = k / 40; pts.push([Math.sin(s * 2.2) * 0.07, 0.04 - s * hoehe, Math.sin(s * 1.3) * 0.03]); }
    m.roehre({ pts: pts, kind: 2, w: 0.05, lat: [1, 0, 0], bulb: false, phase: 0, stagger: 0, base: [0, 0, 0] });
  }

  /* ---------- Lilie: buildCurves der Vorlage, mit „offen“ (geschlossen: Blütenblätter eng um die Achse, Staubfäden kurz innen) ---------- */
  function lilie(m, offen, seed) {
    var F = 6, r = rng(seed), up = [0, 1, 0], o = smooth(0, 1, offen);
    for (var i = 0; i < F; i++) {
      var phi = (i / F) * Math.PI * 2 + (r() - 0.5) * 0.3, tilt = mix(0.28, 1.05 + (r() - 0.5) * 0.25, o);
      var radial = [Math.cos(phi), 0, Math.sin(phi)], u = norm([Math.sin(tilt) * radial[0], Math.cos(tilt), Math.sin(tilt) * radial[2]]);
      var base = [radial[0] * 0.13, 0.07, radial[2] * 0.13], e1 = norm(cross(u, Math.abs(u[1]) > 0.9 ? [1, 0, 0] : up)), e2 = cross(u, e1), stagger = i / F;
      var ped = []; for (var k = 0; k <= 10; k++) { var s0 = k / 10; ped.push([radial[0] * 0.13 * s0, 0.07 * Math.sin((s0 * Math.PI) / 2), radial[2] * 0.13 * s0]); }
      m.roehre({ pts: ped, kind: 2, w: 0.022, lat: e1, bulb: false, phase: 0, stagger: stagger, base: base });
      for (var j = 0; j < 6; j++) {
        var th = (j / 6) * Math.PI * 2 + i * 0.7 + (r() - 0.5) * 0.35, d = add(mul(e1, Math.cos(th)), mul(e2, Math.sin(th))), lat = norm(cross(d, u)), phase = r() * Math.PI * 2;
        var L = (1.35 + r() * 0.3) * mix(0.62, 1, o), b0 = mix(0.1, 0.45 + r() * 0.2, o), b1 = mix(-0.32, 2.75 + r() * 0.45, o), pts = [base], p = base, steps = 48;
        for (k = 1; k <= steps; k++) { var s = k / steps, b = b0 + (b1 - b0) * Math.pow(s, 1.2); p = add(p, mul(add(mul(d, Math.sin(b)), mul(u, Math.cos(b))), L / steps)); pts.push(p); }
        for (k = 1; k <= steps; k++) { s = k / steps; pts[k] = add(pts[k], mul(lat, Math.sin(s * Math.PI * 2.4 + phase) * 0.05 * s * o)); }
        m.band({ pts: pts, w: 0.075 + r() * 0.02, t: 0.02, lat: lat, twist: (0.2 + r() * 0.35) * o, phase: phase, stagger: stagger, base: base });
        var d2 = add(mul(e1, Math.cos(th + 0.52)), mul(e2, Math.sin(th + 0.52))), dh = norm([d2[0], 0, d2[2]]), start = norm(add(u, mul(d2, 0.25)));
        var ende = norm(add(add(mul(radial, 0.85), mul(dh, 0.5)), [0, -0.95, 0])), Ls = (1.75 + r() * 0.45) * mix(0.42, 1, o), sp = [base]; p = base;
        ende = norm(add(mul(u, 1 - o), mul(ende, o)));
        for (k = 1; k <= 44; k++) { s = k / 44; var mm = Math.pow(s, 1.15); p = add(p, mul(norm(add(mul(start, 1 - mm), mul(ende, mm))), Ls / 44)); sp.push(p); }
        m.roehre({ pts: sp, kind: 1, w: 0.012, lat: lat, bulb: true, phase: phase + 1.3, stagger: stagger, base: base });
      }
      var end2 = norm(add(mul(u, 1 - o), mul(norm(add(mul(radial, 0.9), [0, -0.35, 0])), o))), sp2 = [base], p2 = base, Ls2 = (2.2 + r() * 0.3) * mix(0.4, 1, o);
      for (k = 1; k <= 44; k++) { s = k / 44; p2 = add(p2, mul(norm(add(mul(u, 1 - s), mul(end2, s))), Ls2 / 44)); sp2.push(p2); }
      m.roehre({ pts: sp2, kind: 1, w: 0.009, lat: e1, bulb: false, phase: r() * 6, stagger: stagger, base: base });
    }
    stiel(m, 4.6);
  }

  /* ---------- ein gewölbtes Blatt (Rose, Tulpe) ----------
     Mittellinie: startet am Grund b, steigt in Richtung (radial · sin θ + oben · cos θ) mit θ(u) = Neigung + Krümmung(u);
     Querschnitt: Kreisbogen mit Halbwinkel „wolb“ (gleiche Bogenlänge wie die Breite) – die Ränder biegen sich zur Mitte der Blüte;
     „roll“ biegt den Rand nach außen zurück (offene Rose). */
  function blatt(m, q) {
    var up = [0, 1, 0], d = [Math.cos(q.phi), 0, Math.sin(q.phi)], e = [-d[2], 0, d[0]], U = q.U || 14, V = q.V || 10, mitte = [], richt = [];
    var p = q.basis, n = 24;
    for (var k = 0; k <= n; k++) {
      var u = k / n, th = q.theta(u), t = add(mul(d, Math.sin(th)), mul(up, Math.cos(th)));
      mitte.push(p); richt.push(t); p = add(p, mul(t, q.L / n));
    }
    function auf(u) { var x = u * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; return [add(mul(mitte[i], 1 - f), mul(mitte[i + 1], f)), norm(add(mul(richt[i], 1 - f), mul(richt[i + 1], f)))]; }
    function aussen(u) { var a = auf(u)[1]; return norm(cross(a, e)); }   /* zeigt von der Blütenmitte weg */
    m.flaeche(function (u, v) {
      var a = auf(u), w = q.breite(u), wolb = Math.max(0.02, q.wolb(u)), R = w / wolb, nOut = norm(cross(a[1], e));
      var x = R * Math.sin(v * wolb), y = R * (1 - Math.cos(v * wolb));
      var pt = add(add(a[0], mul(e, x)), mul(nOut, -y));
      if (q.roll) pt = add(pt, mul(nOut, q.roll(u) * w * Math.pow(Math.abs(v), 3)));
      return pt;
    }, U, V, aussen, q.phase, q.staffel, q.grund || [0, 0, 0]);
  }

  /* ---------- Rose: 22 Blätter im goldenen Winkel, innen eng gewickelt, außen offen und zurückgerollt ---------- */
  function rose(m, offen, seed) {
    var r = rng(seed + 11), P = 22, gold = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < P; i++) {
      var t = i / (P - 1), f = klemm(offen * 1.12 - (1 - t) * 0.55), fs = smooth(0, 1, f);
      /* geschlossen: alle Blätter fast gleich hoch und eng gewickelt (Knospe) · offen: innen kurz, außen lang */
      var L = mix(0.7 + 0.22 * t, 0.42 + 0.78 * Math.pow(t, 0.8), fs) * (0.96 + r() * 0.08), W = L * mix(0.78, 0.92, t), rb = mix(0.03 + 0.06 * t, 0.04 + 0.16 * t, fs);
      var zu = 0.02 + 0.06 * t, auf = 0.3 + 1.2 * Math.pow(t, 1.3), neigung = mix(zu, auf, fs), rueck = fs * (0.15 + 0.85 * t);
      var phi = i * gold + (r() - 0.5) * 0.15, phase = r() * 6.28;
      blatt(m, {
        phi: phi, basis: [Math.cos(phi) * rb, 0.02 + t * 0.03, Math.sin(phi) * rb], L: L, phase: phase, staffel: t, U: 14, V: 10,
        theta: function (u) { return neigung + rueck * smooth(0.45, 1, u) - (1 - fs) * 0.22 * smooth(0.55, 1, u) * (1 - t * 0.5); },
        breite: function (u) { return W * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, 0.04 + u / 0.55)), 0.7) * Math.sqrt(Math.max(0.02, 1 - Math.pow(Math.max(0, u - 0.7) / 0.3, 2) * 0.85)); },   /* breit und oben rund wie ein Rosenblatt */
        wolb: function (u) { return mix(mix(1.3, 0.95, t), mix(0.95, 0.42, t), fs) * (0.7 + 0.3 * Math.sin(Math.PI * u)); },
        roll: function (u) { return fs * t * 0.55 * smooth(0.35, 1, u); }
      });
    }
    stiel(m, 4.2);
  }

  /* ---------- Tulpe: 6 Blätter (außen 3, innen 3), Kelch → weit offen; innen 6 Staubfäden + Griffel ---------- */
  function tulpe(m, offen, seed) {
    var r = rng(seed + 23), o = smooth(0, 1, offen);
    for (var i = 0; i < 6; i++) {
      var innen = i % 2 === 1, phi = (i / 6) * Math.PI * 2 + (r() - 0.5) * 0.08, f = klemm(o * (innen ? 0.94 : 1.06));
      var L = innen ? 1.12 : 1.2, W = innen ? 0.4 : 0.44, neigung = mix(innen ? 0.1 : 0.14, innen ? 1.0 : 1.2, f), phase = r() * 6.28;
      blatt(m, {
        phi: phi, basis: [Math.cos(phi) * (innen ? 0.05 : 0.08), 0.04, Math.sin(phi) * (innen ? 0.05 : 0.08)], L: L, phase: phase, staffel: i / 6, U: 16, V: 12,
        theta: function (u) { return neigung + (1 - f) * 0.42 * (0.35 - u) + f * 0.35 * smooth(0.55, 1, u); },
        breite: function (u) { return W * Math.pow(Math.sin(Math.PI * (0.05 + 0.93 * u)), 0.55) * (0.75 + 0.25 * Math.sin(Math.PI * u)); },
        wolb: function (u) { return mix(1.2, 0.5, f) * (0.75 + 0.25 * Math.sin(Math.PI * u)); },
        roll: function (u) { return f * 0.18 * smooth(0.5, 1, u); }
      });
    }
    for (i = 0; i < 6; i++) {   /* Staubfäden: kurz, leicht nach außen, mit Kölbchen */
      var w = (i / 6) * Math.PI * 2 + 0.5, dd = [Math.cos(w), 0, Math.sin(w)], pts = [], p = [dd[0] * 0.05, 0.05, dd[2] * 0.05];
      for (var k = 0; k <= 20; k++) { var s = k / 20; pts.push(p); p = add(p, mul(norm(add([0, 1, 0], mul(dd, 0.15 + 0.35 * s * o))), 0.5 / 20)); }
      m.roehre({ pts: pts, kind: 1, w: 0.014, lat: [dd[2], 0, -dd[0]], bulb: true, phase: w, stagger: 0.5, base: [0, 0, 0] });
    }
    var g = []; for (k = 0; k <= 20; k++) g.push([0, 0.05 + (k / 20) * 0.42, 0]);
    m.roehre({ pts: g, kind: 1, w: 0.034, lat: [1, 0, 0], bulb: true, phase: 1, stagger: 0.5, base: [0, 0, 0] });
    stiel(m, 4.4);
  }

  var ARTEN = { lilie: lilie, rose: rose, tulpe: tulpe };
  function bauen(art, offen, seed) {
    var m = netz(); (ARTEN[art] || rose)(m, klemm(offen), seed || 7);
    return m.fertig();
  }
  /* Radius der voll offenen Blüte um ihr Herz, ohne Stiel – für die Kamera (wie „radius“ der Vorlage) */
  function radius(art, seed) {
    var g = bauen(art, 1, seed), h = HERZ[art] || HERZ.rose, r = 0;
    for (var i = 0; i < g.data.length; i += STRIDE) { if (g.data[i + 8] > 1.5) continue; r = Math.max(r, Math.hypot(g.data[i] - h[0], g.data[i + 1] - h[1], g.data[i + 2] - h[2])); }
    return r;
  }

  /* ---------- Shader: rotes Chrom der Vorlage, hier in Pink (Schatten #9E4F74, Glanzlichter fast weiß) ---------- */
  var VERT = 'attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec4 a_aux; attribute vec3 a_base;\n' +
    'uniform mat4 u_vp; uniform mat4 u_model; uniform vec2 u_offset; uniform float u_time; uniform float u_bloom; uniform float u_sway; uniform float u_stem; uniform vec3 u_herz;\n' +
    'varying vec3 v_n; varying vec3 v_w; varying float v_s;\n' +
    'void main() {\n' +
    '  vec3 p = a_pos; float k = a_aux.z;\n' +
    '  if (k < 1.5) {\n' +
    '    float g = clamp(u_bloom * 1.6 - a_aux.w * 0.6, 0.0, 1.0); g = 1.0 - pow(1.0 - g, 3.0);\n' +
    '    p = a_base + (p - a_base) * g;\n' +
    '    float amp = (k < 0.5 ? 0.03 : 0.06) * u_sway * a_aux.x * a_aux.x;\n' +
    '    p += amp * vec3(sin(u_time * 0.9 + a_aux.y), 0.5 * sin(u_time * 1.3 + a_aux.y * 1.7), cos(u_time * 0.7 + a_aux.y * 1.3));\n' +
    '  } else if (p.y < 0.0) { p.y *= u_stem; }\n' +
    '  vec4 w = u_model * vec4(p - u_herz, 1.0);\n' +
    '  v_w = w.xyz; v_n = (u_model * vec4(a_nrm, 0.0)).xyz; v_s = a_aux.x;\n' +
    '  gl_Position = u_vp * w; gl_Position.xy += u_offset * gl_Position.w; }';
  var FRAG = 'precision highp float;\n' +
    'uniform vec3 u_eye; uniform vec3 u_red; uniform vec3 u_tief; uniform vec3 u_hot; uniform float u_alpha;\n' +
    'varying vec3 v_n; varying vec3 v_w; varying float v_s;\n' +
    'float studio(vec3 r) {\n' +
    '  float key = pow(max(dot(r, normalize(vec3(-0.45, 0.85, 0.35))), 0.0), 14.0) * 2.6;\n' +
    '  float strip = smoothstep(0.55, 0.8, r.x) * smoothstep(-0.7, 0.3, r.y) * 1.4;\n' +
    '  float rim = smoothstep(0.55, 0.95, -r.z) * smoothstep(-0.2, 0.5, r.y) * 0.9;\n' +
    '  float hz = exp(-abs(r.y - 0.05) * 7.0) * 0.4;\n' +
    '  return key + strip + rim + hz; }\n' +
    'void main() {\n' +
    '  vec3 n = normalize(v_n); vec3 v = normalize(u_eye - v_w); if (dot(n, v) < 0.0) n = -n;\n' +
    '  vec3 r = reflect(-v, n); float e = studio(r);\n' +
    '  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);\n' +
    '  float dif = max(dot(n, normalize(vec3(-0.3, 0.8, 0.6))), 0.0);\n' +
    '  vec3 col = u_tief * (0.05 + 0.3 * dif);\n' +
    '  col += u_red * e * 0.95;\n' +
    '  col += u_hot * pow(e, 3.0) * 0.3;\n' +
    '  col += u_red * fr * 0.85;\n' +
    '  col *= 0.8 + 0.2 * smoothstep(0.0, 0.25, v_s);\n' +
    '  col = col / (1.0 + col); col = pow(col, vec3(1.0 / 2.2));\n' +
    '  gl_FragColor = vec4(col * u_alpha, u_alpha); }';

  root.ERGUN_BLUME = { STRIDE: STRIDE, HERZ: HERZ, ARTEN: Object.keys(ARTEN), bauen: bauen, radius: radius, VERT: VERT, FRAG: FRAG };
})(typeof window !== 'undefined' ? window : globalThis);
