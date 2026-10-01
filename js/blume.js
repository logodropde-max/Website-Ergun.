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
  var HERZ = { lilie: [0, 0.25, 0], rose: [0, 0.42, 0], tulpe: [0, 0.55, 0], dahlie: [0, 0.16, 0], pfingstrose: [0, 0.2, 0], lotus: [0, 0.28, 0] };

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
      /* dicke, gewölbte Schale (Blütenblatt der vollen Blume): Vorder- und Rückseite + Ränder wie das Band der Vorlage */
      schale: function (c) {
        var U = c.U, V = c.V, g = [], N = [], i, j;
        for (i = 0; i <= U; i++) { g.push([]); for (j = 0; j <= V; j++) g[i].push(c.punkt(i / U, (j / V) * 2 - 1)); }
        for (i = 0; i <= U; i++) { N.push([]); for (j = 0; j <= V; j++) N[i].push(norm(cross(sub(g[Math.min(i + 1, U)][j], g[Math.max(i - 1, 0)][j]), sub(g[i][Math.min(j + 1, V)], g[i][Math.max(j - 1, 0)])))); }
        function x(q, nr, s) { return push(q, nr, s, c.phase, c.art, c.staffel, c.grund); }
        var vorn = n; for (i = 0; i <= U; i++) for (j = 0; j <= V; j++) x(g[i][j], N[i][j], i / U);
        var hinten = n; for (i = 0; i <= U; i++) for (j = 0; j <= V; j++) x(sub(g[i][j], mul(N[i][j], c.dicke)), mul(N[i][j], -1), i / U);
        for (i = 0; i < U; i++) for (j = 0; j < V; j++) {
          var a = i * (V + 1) + j, b = a + V + 1;
          idx.push(vorn + a, vorn + a + 1, vorn + b, vorn + a + 1, vorn + b + 1, vorn + b);
          idx.push(hinten + a, hinten + b, hinten + a + 1, hinten + a + 1, hinten + b, hinten + b + 1);
        }
        function rand(liste, aus) {   /* Streifen zwischen Vorder- und Rückkante – der helle Rand im Chrom */
          var st = n;
          liste.forEach(function (q) { var o = aus(q[0], q[1]); x(g[q[0]][q[1]], o, q[0] / U); x(sub(g[q[0]][q[1]], mul(N[q[0]][q[1]], c.dicke)), o, q[0] / U); });
          for (var k = 0; k < liste.length - 1; k++) { var a2 = st + k * 2; idx.push(a2, a2 + 1, a2 + 2, a2 + 1, a2 + 3, a2 + 2); }
        }
        var l = [], r = [], sp = [];
        for (i = 0; i <= U; i++) { l.push([i, 0]); r.push([i, V]); }
        for (j = 0; j <= V; j++) sp.push([U, j]);
        rand(l, function (a, b) { return norm(sub(g[a][0], g[a][1])); });
        rand(r, function (a, b) { return norm(sub(g[a][V], g[a][V - 1])); });
        rand(sp, function (a, b) { return norm(sub(g[U][b], g[U - 1][b])); });
      },
      kugel: function (mitte, rx, ry, kind, staffel, basis) {
        var st = n, U = 14, V = 9;
        for (var i = 0; i <= V; i++) for (var j = 0; j <= U; j++) {
          var th = (i / V) * Math.PI, ph = (j / U) * Math.PI * 2, nr = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
          push(add(mitte, [nr[0] * rx, nr[1] * ry, nr[2] * rx]), norm([nr[0] / rx, nr[1] / ry, nr[2] / rx]), 1, 0, kind, staffel, basis);
        }
        for (i = 0; i < V; i++) for (j = 0; j < U; j++) { var a = st + i * (U + 1) + j, b = a + U + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
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

  /* =====================================================================================================================
     Volle Blume (Lycoris-Fassung, ?blume=voll, 01.10.2026 – Ausnahme auf ERGUNs Wunsch): eine echte, volle Blüte statt der Spinnenlilie –
     von oben eine Rosette, von der Seite eine volle Kuppel, von unten der grüne Kelch. Blütenblätter wie die Bänder der Vorlage (Dicke,
     Randwelle), nur breit und löffelförmig gewölbt; Stiel als Röhre in grünem Chrom mit Kelch und zwei Blättern (Mittelrippe).
     Arten 2 = Stiel (grün, wird mit u_stem gekürzt) · 3 = Kelch/Stielblatt (grün, wächst und wiegt wie ein Blütenblatt).
     ===================================================================================================================== */
  function schale(m, q) {
    /* q: phi, basis, L, theta(u), breite(u), wolb(u), roll(u), welle, dicke, U, V, phase, staffel, art, grund, falte */
    var up = [0, 1, 0], d = [Math.cos(q.phi), 0, Math.sin(q.phi)], e = [-d[2], 0, d[0]], U = q.U, V = q.V, n = 18, mitte = [], richt = [], p = q.basis;
    for (var k = 0; k <= n; k++) { var u = k / n, th = q.theta(u), t = add(mul(d, Math.sin(th)), mul(up, Math.cos(th))); mitte.push(p); richt.push(t); p = add(p, mul(t, q.L / n)); }
    function auf(u) { var x = u * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; return [add(mul(mitte[i], 1 - f), mul(mitte[i + 1], f)), norm(add(mul(richt[i], 1 - f), mul(richt[i + 1], f)))]; }
    function punkt(u, v) {
      var a = auf(u), w = Math.max(0.0005, q.breite(u)), nOut = norm(cross(a[1], e)), y;
      if (q.falte) y = q.falte * Math.abs(v) * w;   /* V-Falz = Mittelrippe (Stielblatt) */
      else { var wolb = Math.max(0.02, q.wolb(u)), R = w / wolb; var x0 = R * Math.sin(v * wolb); y = R * (1 - Math.cos(v * wolb)); return finish(a, w, nOut, x0, y, u, v); }
      return finish(a, w, nOut, v * w, y, u, v);
    }
    function finish(a, w, nOut, x, y, u, v) {
      var pt = add(add(a[0], mul(e, x)), mul(nOut, -y));
      if (q.roll) pt = add(pt, mul(nOut, q.roll(u) * w * Math.pow(Math.abs(v), 3)));
      if (q.welle) pt = add(pt, mul(nOut, q.welle * w * Math.pow(Math.abs(v), 2) * Math.sin(u * 13 + v * 3 + q.phase)));
      return pt;
    }
    m.schale({ punkt: punkt, U: U, V: V, dicke: q.dicke, phase: q.phase, staffel: q.staffel, art: q.art, grund: q.grund || q.basis });
  }

  /* Blüte in Kränzen: i = 0 außen … N−1 innen, goldener Winkel; je Art Länge, Breite, Neigung, Wölbung */
  function vollBluete(m, art, seed, fein) {
    var r = rng(seed + 41), gold = Math.PI * (3 - Math.sqrt(5));
    var P = art === 'lotus' ? 0 : Math.round((art === 'dahlie' ? 96 : 74) * fein);
    var UU = fein < 0.8 ? 7 : 9, VV = fein < 0.8 ? 5 : 7;
    for (var i = 0; i < P; i++) {
      var t = i / (P - 1), phi = i * gold + (r() - 0.5) * 0.05, phase = r() * 6.28, q;
      if (art === 'dahlie') {   /* sehr geometrisch: schmale, stark gewölbte (gerollte) Blätter, außen flach, innen aufrecht und eingerollt */
        var L = 0.2 + 0.72 * Math.pow(1 - t, 0.85), th0 = 0.18 + 1.32 * Math.pow(1 - t, 1.1), rb = 0.03 + 0.11 * (1 - t);
        q = { phi: phi, basis: [Math.cos(phi) * rb, 0.04 + 0.22 * t, Math.sin(phi) * rb], L: L, U: UU, V: VV, phase: phase, staffel: 0.15 + t * 0.8, art: 0, dicke: 0.008,
          theta: function (u) { return th0 + (0.12 * (1 - t) - 0.55 * t) * u; },
          breite: function (u) { return L * 0.16 * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, 0.06 + u / 0.55)), 0.8) * (u > 0.75 ? 1 - (u - 0.75) / 0.25 * 0.75 : 1); },
          wolb: function () { return 1.35 + 0.3 * t; }, roll: null, welle: 0.04 };
      } else {   /* Pfingstrose: breite, weiche, gewellte Blätter, innen eine dichte Schale */
        var L2 = 0.28 + 0.62 * Math.pow(1 - t, 0.7), th2 = 0.28 + 1.05 * Math.pow(1 - t, 1.3), rb2 = 0.03 + 0.12 * (1 - t);
        q = { phi: phi, basis: [Math.cos(phi) * rb2, 0.04 + 0.12 * t, Math.sin(phi) * rb2], L: L2, U: UU + 2, V: VV + 2, phase: phase, staffel: 0.15 + t * 0.8, art: 0, dicke: 0.007,
          theta: function (u) { return th2 + (0.3 * (1 - t) - 0.5 * t) * Math.pow(u, 1.4); },
          breite: function (u) { return L2 * 0.6 * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, 0.05 + u / 0.6)), 0.7) * Math.sqrt(Math.max(0.05, 1 - Math.pow(Math.max(0, u - 0.7) / 0.3, 2) * 0.8)); },
          wolb: function (u) { return (0.9 + 0.5 * t) * (0.75 + 0.25 * Math.sin(Math.PI * u)); },
          roll: function (u) { return (1 - t) * 0.35 * smooth(0.5, 1, u); }, welle: 0.14 };
      }
      schale(m, q);
    }
    if (art === 'lotus') {   /* Lotus: drei Kränze großer, spitzer Blätter + Fruchtknoten mit Staubfäden */
      [[9, 0.95, 1.1, 0.0], [8, 0.85, 0.72, 0.4], [6, 0.7, 0.38, 0.8]].forEach(function (kr, ki) {
        for (var j = 0; j < kr[0]; j++) {
          var phi = (j / kr[0]) * Math.PI * 2 + ki * 0.35, L3 = kr[1] * (0.95 + r() * 0.1), th3 = kr[2];
          schale(m, { phi: phi, basis: [Math.cos(phi) * 0.12, 0.05 + ki * 0.03, Math.sin(phi) * 0.12], L: L3, U: UU + 3, V: VV + 2, phase: r() * 6.28, staffel: 0.1 + kr[3] * 0.7, art: 0, dicke: 0.009,
            theta: function (u) { return th3 + 0.25 * u * u; },
            breite: function (u) { return L3 * 0.34 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.04 + u * 0.98)), 0.75); },
            wolb: function () { return 1.0; }, roll: null, welle: 0.02 });
        }
      });
      m.kugel([0, 0.16, 0], 0.13, 0.06, 1, 0.8, [0, 0.1, 0]);   /* Fruchtknoten */
      for (var s = 0; s < 22; s++) {
        var w = (s / 22) * Math.PI * 2, dd = [Math.cos(w), 0, Math.sin(w)], pts = [], p = [dd[0] * 0.15, 0.12, dd[2] * 0.15];
        for (var k = 0; k <= 10; k++) { pts.push(p); p = add(p, mul(norm(add([0, 1, 0], mul(dd, 0.6))), 0.016)); }
        m.roehre({ pts: pts, kind: 1, w: 0.006, lat: [dd[2], 0, -dd[0]], bulb: true, phase: w, stagger: 0.85, base: [0, 0.1, 0] });
      }
    }
  }

  /* grüner Kelch, Stiel (Röhre der Vorlage, leicht geschwungen) und zwei Stielblätter mit Mittelrippe */
  function gruenTeile(m, seed, fein, stiel) {
    /* stiel = Länge des Stiels (Standard 4,3). Kürzer (Aufräumen, ?ordnung=neu): die ganze Blume passt groß ins Bild – Blätter wachsen mit */
    var r = rng(seed + 77), K = fein < 0.8 ? 5 : 6, SL = stiel || 4.3, BL = Math.min(1, 0.45 + 0.55 * SL / 4.3);
    m.kugel([0, 0.03, 0], 0.11, 0.08, 3, 0.05, [0, 0, 0]);   /* Blütenboden */
    for (var i = 0; i < K; i++) {
      var phi = (i / K) * Math.PI * 2 + 0.3;
      schale(m, { phi: phi, basis: [Math.cos(phi) * 0.07, 0.0, Math.sin(phi) * 0.07], L: 0.36, U: 7, V: 5, phase: r() * 6.28, staffel: 0.05, art: 3, dicke: 0.008,
        theta: function (u) { return 1.75 + 0.5 * u; },
        breite: function (u) { return 0.075 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.05 + u * 0.97)), 0.8); },
        wolb: function () { return 0.9; }, roll: null, welle: 0.03 });
    }
    var pts = [];
    for (var k = 0; k <= 40; k++) { var s = k / 40; pts.push([0.11 * Math.sin(s * 2.6), 0.0 - s * SL, 0.05 * Math.sin(s * 1.6)]); }
    m.roehre({ pts: pts, kind: 2, w: 0.045, lat: [1, 0, 0], bulb: false, phase: 0, stagger: 0, base: [0, 0, 0] });
    [[0.36, 0.2, 1.0], [0.6, Math.PI + 0.35, 0.85]].forEach(function (b) {   /* zwei Blätter: lanzettlich, mit Falz (Mittelrippe), hängen leicht über */
      var s = b[0], ap = [0.11 * Math.sin(s * 2.6), -s * SL, 0.05 * Math.sin(s * 1.6)], Lb = b[2] * BL;
      schale(m, { phi: b[1], basis: ap, L: Lb, U: 12, V: 4, phase: r() * 6.28, staffel: 0.1, art: 3, dicke: 0.008, falte: 0.32,
        theta: function (u) { return 0.75 + 1.0 * u * u; },
        breite: function (u) { return Lb * 0.13 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.03 + u * 0.98)), 0.7); },
        wolb: function () { return 0.5; }, roll: null, welle: 0.03, grund: ap });
    });
  }
  function vollArt(name) { return function (m, offen, seed, fein, stiel) { vollBluete(m, name, seed, fein); gruenTeile(m, seed, fein, stiel); }; }

  var ARTEN = { lilie: lilie, rose: rose, tulpe: tulpe, dahlie: vollArt('dahlie'), pfingstrose: vollArt('pfingstrose'), lotus: vollArt('lotus') };
  var VOLL = ['dahlie', 'pfingstrose', 'lotus'];
  function bauen(art, offen, seed, fein, stiel) {
    var m = netz(); (ARTEN[art] || rose)(m, klemm(offen), seed || 7, fein === undefined ? 1 : fein, stiel);
    return m.fertig();
  }
  /* Radius der voll offenen Blüte um ihr Herz, ohne Stiel – für die Kamera (wie „radius“ der Vorlage) */
  function radius(art, seed) {
    var g = bauen(art, 1, seed), h = HERZ[art] || HERZ.rose, r = 0;
    for (var i = 0; i < g.data.length; i += STRIDE) { if (g.data[i + 8] > 1.5 && g.data[i + 8] < 2.5) continue; if (g.data[i + 8] > 2.5 && g.data[i + 11] < -0.05) continue;   /* ohne Stiel und Stielblätter */ r = Math.max(r, Math.hypot(g.data[i] - h[0], g.data[i + 1] - h[1], g.data[i + 2] - h[2])); }
    return r;
  }

  /* ---------- Shader: rotes Chrom der Vorlage, hier in Pink (Schatten #9E4F74, Glanzlichter fast weiß) ---------- */
  var VERT = 'attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec4 a_aux; attribute vec3 a_base;\n' +
    'uniform mat4 u_vp; uniform mat4 u_model; uniform vec2 u_offset; uniform float u_time; uniform float u_bloom; uniform float u_sway; uniform float u_stem; uniform vec3 u_herz;\n' +
    'varying vec3 v_n; varying vec3 v_w; varying float v_s; varying float v_g;\n' +
    'void main() {\n' +
    '  vec3 p = a_pos; float k = a_aux.z; v_g = k > 1.5 ? 1.0 : 0.0;\n' +
    '  if (k < 1.5 || k > 2.5) {\n' +
    '    float g = clamp(u_bloom * 1.6 - a_aux.w * 0.6, 0.0, 1.0); g = 1.0 - pow(1.0 - g, 3.0);\n' +
    '    vec3 b0 = a_base; float sc = g;\n' +
    '    if (k > 2.5 && a_base.y < -0.05) { b0.y = a_base.y * u_stem; sc *= smoothstep(0.15, 0.7, u_stem); }\n' +
    '    p = b0 + (p - a_base) * sc;\n' +
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

  /* der Fragment-Shader der Vorlage wörtlich (Fassung „Lycoris“: rotes Chrom, fast kein Streulicht, alles Spiegelung des dunklen Studios) */
  var FRAG_VORLAGE = 'precision highp float;\n' +
    'uniform vec3 u_eye; uniform vec3 u_red; uniform vec3 u_hot; uniform float u_alpha;\n' +
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
    '  vec3 col = u_red * (0.04 + 0.22 * dif);\n' +
    '  col += u_red * e * 1.15;\n' +
    '  col += u_hot * pow(e, 3.0) * 0.3;\n' +
    '  col += u_red * fr * 1.1;\n' +
    '  col *= 0.8 + 0.2 * smoothstep(0.0, 0.25, v_s);\n' +
    '  col = col / (1.0 + col); col = pow(col, vec3(1.0 / 2.2));\n' +
    '  gl_FragColor = vec4(col * u_alpha, u_alpha); }';

  /* volle Blume: der Shader der Vorlage, Grundfarbe und Glanz zwischen Blüte und Grün gemischt */
  var FRAG_VOLL = FRAG_VORLAGE
    .replace('uniform vec3 u_eye; uniform vec3 u_red; uniform vec3 u_hot; uniform float u_alpha;', 'uniform vec3 u_eye; uniform vec3 u_red; uniform vec3 u_hot; uniform float u_alpha; uniform vec3 u_gruen; uniform vec3 u_gruenHot;')
    .replace('varying vec3 v_n; varying vec3 v_w; varying float v_s;', 'varying vec3 v_n; varying vec3 v_w; varying float v_s; varying float v_g;')
    .replace('  vec3 col = u_red * (0.04 + 0.22 * dif);', '  vec3 rot = mix(u_red, u_gruen, v_g); vec3 heiss = mix(u_hot, u_gruenHot, v_g);\n  vec3 col = rot * (0.04 + 0.22 * dif);')
    .replace('  col += u_red * e * 1.15;', '  col += rot * e * 1.15;').replace('  col += u_hot * pow(e, 3.0) * 0.3;', '  col += heiss * pow(e, 3.0) * 0.3;').replace('  col += u_red * fr * 1.1;', '  col += rot * fr * 1.1;');

  root.ERGUN_BLUME = { STRIDE: STRIDE, HERZ: HERZ, ARTEN: Object.keys(ARTEN), VOLL: VOLL, bauen: bauen, radius: radius, VERT: VERT, FRAG: FRAG, FRAG_VORLAGE: FRAG_VORLAGE, FRAG_VOLL: FRAG_VOLL };
})(typeof window !== 'undefined' ? window : globalThis);
