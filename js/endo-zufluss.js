/* endo Studio – zufliegende Datenpakete (26.09.2026, Claude Code)
   Kleine, kühle Lichtkörper mit kurzem Schweif fliegen aus der Umgebung auf die endo-Kugel zu
   und lösen sich kurz vor ihr weich auf ("die Kugel nimmt sie auf"). Leichtes Canvas, nur wenn
   #endo im Bild ist. Handy: weniger Pakete. "Bewegung reduzieren" -> gar nichts. */
(function () {
  var sektion = document.querySelector('.endo');
  if (!sektion) return;
  var orb = sektion.querySelector('.endo__orb');
  var cv = sektion.querySelector('.endo__daten');
  if (!orb || !cv) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = cv.getContext('2d');
  var dpr = Math.min(1.5, window.devicePixelRatio || 1);   // weiche Lichtpunkte brauchen kein 2x/3x
  var handy = window.matchMedia('(max-width: 640px)').matches;
  var MAX = handy ? 5 : 8;                 // hoechstens gleichzeitig sichtbar
  var W = 0, H = 0, cx = 0, cy = 0, R = 0; // Streifengroesse + Kugelmitte/-radius (im Canvas)
  var teilchen = [], glanz = [];
  var laeuft = false, sichtbar = false, wach = true, letzteZeit = 0, naechster = 0;

  /* Nur ein Streifen um die Kugel wird gezeichnet (nicht die ganze hohe Sektion) – gemessen an der
     Layout-Position der Kugel (ohne ihre Scroll-Transform), nur bei Start und Groessenaenderung. */
  function messen() {
    var ow = orb.offsetWidth || 1;
    var mitteX = orb.offsetLeft + ow / 2, mitteY = orb.offsetTop + orb.offsetHeight / 2;
    var oben = Math.max(0, mitteY - ow * 1.5);
    W = Math.max(1, sektion.clientWidth); H = Math.min(sektion.clientHeight - oben, ow * 3);
    cv.style.top = oben + 'px'; cv.style.height = H + 'px';
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = mitteX; cy = mitteY - oben;
    R = ow * 0.5 * 0.62;                    // sichtbarer Radius (die Kugel ist auf 62% maskiert)
  }

  /* Leucht-Stil wie der Punkt am Lichtfaden: großer, weicher kühler Schein + kleiner, fast weißer Kern – einmal vorgezeichnet */
  function sprite(groesse, stopps) {
    var c = document.createElement('canvas'); c.width = c.height = groesse;
    var g = c.getContext('2d'), r = groesse / 2, v = g.createRadialGradient(r, r, 0, r, r, r);
    stopps.forEach(function (s) { v.addColorStop(s[0], s[1]); });
    g.fillStyle = v; g.fillRect(0, 0, groesse, groesse); return c;
  }
  var SCHEIN = sprite(128, [[0, 'rgba(222,234,252,0.5)'], [0.32, 'rgba(206,222,248,0.22)'], [0.62, 'rgba(196,212,244,0.06)'], [1, 'rgba(190,206,240,0)']]);
  var KERN = sprite(32, [[0, 'rgba(255,255,255,1)'], [0.34, 'rgba(255,255,255,1)'], [0.5, 'rgba(240,246,255,0.9)'], [1, 'rgba(226,236,252,0)']]);

  function neu() {
    var reich = R / 0.62;                   // ~ Kugeldurchmesser-Halb, als Feldmass
    var winkel = Math.random() * Math.PI * 2;
    var dist = reich * (1.5 + Math.random() * 1.1);   // Start rund um die Kugel, aus jeder Richtung
    var sx = cx + Math.cos(winkel) * dist;
    var sy = cy + Math.sin(winkel) * dist * 0.9;
    var seite = Math.random() < 0.5 ? -1 : 1;
    return {
      sx: sx, sy: sy, x: sx, y: sy, px: sx, py: sy,
      t: 0, v: 0.025 + Math.random() * 0.02,          // Fortschritt 0..1 + Startgeschwindigkeit (Flug ~4 s)
      dx: 0, dy: 0, tempo: 0,                          // Flugrichtung + px/s fuer den Schweif
      biege: (0.10 + Math.random() * 0.16) * seite,   // leichte Kurve statt schnurgerade
      gr: (handy ? 1.0 : 1.3) + Math.random() * 1.2,  // Kopfradius in px
      hell: 0.5 + Math.random() * 0.4
    };
  }

  function schritt(p, dt) {
    p.px = p.x; p.py = p.y;
    p.v += dt * (0.10 + p.t * 0.35);                  // sanft beschleunigen
    p.t = Math.min(1, p.t + p.v * dt);
    var e = p.t;
    var lx = p.sx + (cx - p.sx) * e, ly = p.sy + (cy - p.sy) * e;
    var dx = cx - p.sx, dy = cy - p.sy, nl = Math.hypot(dx, dy) || 1;
    var nx = -dy / nl, ny = dx / nl;                  // Normale zur Flugrichtung
    var bogen = Math.sin(e * Math.PI) * p.biege * nl; // Bogen, in der Mitte am groessten
    p.x = lx + nx * bogen; p.y = ly + ny * bogen;
    var mx = p.x - p.px, my = p.y - p.py, ml = Math.hypot(mx, my);
    if (ml > 0.001) { p.dx = mx / ml; p.dy = my / ml; p.tempo = ml / Math.max(dt, 0.001); }
  }

  function zeichnen() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    var nah = 1.3 * R, kern = R * 1.02;
    for (var i = 0; i < teilchen.length; i++) {
      var p = teilchen[i];
      var d = Math.hypot(p.x - cx, p.y - cy);
      var a = p.hell, gr = p.gr;
      if (d < nah) { var k = Math.max(0, (d - kern) / (nah - kern)); a *= k; gr *= (0.3 + 0.7 * k); }
      if (a <= 0.012) continue;
      var L = Math.min(38, 10 + p.tempo * 0.09) * (0.4 + 0.6 * (a / p.hell));   // feiner, kurzer Schweif
      var tx = p.x - p.dx * L, ty = p.y - p.dy * L;
      var sg = ctx.createLinearGradient(p.x, p.y, tx, ty);
      sg.addColorStop(0, 'rgba(226,234,248,' + (a * 0.55) + ')');
      sg.addColorStop(1, 'rgba(226,234,248,0)');
      ctx.strokeStyle = sg; ctx.lineWidth = Math.max(0.6, gr * 0.7); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(tx, ty); ctx.stroke();
      var sg2 = gr * 11, kg = gr * 3.2;                 /* Schein und Kern */
      ctx.globalAlpha = a; ctx.drawImage(SCHEIN, p.x - sg2 / 2, p.y - sg2 / 2, sg2, sg2);
      ctx.globalAlpha = Math.min(1, a * 1.15); ctx.drawImage(KERN, p.x - kg / 2, p.y - kg / 2, kg, kg);
      ctx.globalAlpha = 1;
    }
    for (var j = 0; j < glanz.length; j++) {          // dezentes Aufglimmen am Kugelrand
      var fx = glanz[j], gg = fx.a * (1 - fx.t);
      if (gg <= 0.01) continue;
      var px = cx + Math.cos(fx.w) * R, py = cy + Math.sin(fx.w) * R;
      var rg = ctx.createRadialGradient(px, py, 0, px, py, 22);
      rg.addColorStop(0, 'rgba(236,244,255,' + (gg * 0.5) + ')');
      rg.addColorStop(1, 'rgba(200,216,245,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(px, py, 22, 0, 6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function schleife(zeit) {
    if (!laeuft) return;
    var dt = Math.min(0.05, (zeit - letzteZeit) / 1000) || 0.016; letzteZeit = zeit;
    if (zeit > naechster && teilchen.length < MAX) {
      teilchen.push(neu());
      naechster = zeit + 800 + Math.random() * 1200;  // alle 0,8–2 s
    }
    for (var i = teilchen.length - 1; i >= 0; i--) {
      var p = teilchen[i]; schritt(p, dt);
      var d = Math.hypot(p.x - cx, p.y - cy);
      if (d < R * 1.04 || p.t >= 1) {                 // an der Kugel angekommen -> feines Aufglimmen
        if (glanz.length < 10) glanz.push({ w: Math.atan2(p.y - cy, p.x - cx), a: p.hell, t: 0 });
        teilchen.splice(i, 1);
      }
    }
    for (var j = glanz.length - 1; j >= 0; j--) { glanz[j].t += dt / 0.55; if (glanz[j].t >= 1) glanz.splice(j, 1); }
    zeichnen();
    requestAnimationFrame(schleife);
  }

  function start() {
    if (laeuft || !sichtbar || !wach) return;
    messen(); laeuft = true; letzteZeit = performance.now(); naechster = letzteZeit + 300;
    requestAnimationFrame(schleife);
  }
  function stopp() { laeuft = false; }

  var io = new IntersectionObserver(function (e) {
    sichtbar = e[0].isIntersecting;
    if (sichtbar) start(); else { stopp(); teilchen.length = 0; glanz.length = 0; ctx.clearRect(0, 0, W, H); }
  }, { threshold: 0.05 });
  io.observe(sektion);
  document.addEventListener('visibilitychange', function () {
    wach = !document.hidden; if (wach) start(); else stopp();
  });
  var neuMessen; addEventListener('resize', function () {
    clearTimeout(neuMessen); neuMessen = setTimeout(function () { handy = matchMedia('(max-width: 640px)').matches; MAX = handy ? 5 : 8; messen(); }, 160);
  }, { passive: true });
})();
