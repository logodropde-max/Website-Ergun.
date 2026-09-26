/* endo Studio – Datenpakete zur Kugel (26.09.2026, Claude Code)
   Kleine, leuchtende Pakete (Kern + weicher Schein + kurzer Schweif) fliegen im Bogen auf die endo-Kugel zu. Kommen sie nah,
   streckt die Kugel ihnen einen weichen Arm entgegen (ki/js/orb.js, window.endoKugel), zieht sie schneller an, sie werden
   kleiner und verschwinden in der Spitze – dort läuft ein leiser Lichtimpuls über die Kugel.
   Pakete entstehen zufällig am Rand des Bereichs und dort, wo man in #endo tippt/klickt (2–3 pro Tipp, nie blockierend).
   Ein Canvas fest über dem Bildschirm, gerechnet in Seitenkoordinaten; läuft nur, wenn #endo im Bild und der Tab sichtbar ist.
   „Bewegung reduzieren“ → keine Pakete. */
(function () {
  var sektion = document.querySelector('.endo');
  if (!sektion) return;
  var orb = sektion.querySelector('.endo__orb');
  var cv = sektion.querySelector('.endo__daten');
  if (!orb || !cv) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = cv.getContext('2d');
  var dpr = Math.min(1.5, window.devicePixelRatio || 1);
  var handy = window.matchMedia('(max-width: 640px)').matches;
  var MAX_ZUFALL = handy ? 5 : 8, MAX_ALLE = handy ? 8 : 12;     /* zufällige / insgesamt (mit Tipps) */
  var ZUG = 2.4;                                                  /* ab 2,4 × Kugelradius zieht die Kugel */
  var W = 0, H = 0, kx = 0, ky = 0, R = 1, halb = 1;              /* Bildschirm; Kugelmitte (Seite), sichtbarer Radius */
  var teilchen = [], tipps = [], glanz = [];
  var laeuft = false, sichtbar = false, wach = true, letzteZeit = 0, naechster = 0, gemessen = 0;

  /* Leucht-Stil wie der Punkt am Lichtfaden, einmal vorgezeichnet */
  function sprite(groesse, stopps) {
    var c = document.createElement('canvas'); c.width = c.height = groesse;
    var g = c.getContext('2d'), r = groesse / 2, v = g.createRadialGradient(r, r, 0, r, r, r);
    stopps.forEach(function (s) { v.addColorStop(s[0], s[1]); });
    g.fillStyle = v; g.fillRect(0, 0, groesse, groesse); return c;
  }
  var SCHEIN = sprite(128, [[0, 'rgba(222,234,252,0.5)'], [0.32, 'rgba(206,222,248,0.22)'], [0.62, 'rgba(196,212,244,0.06)'], [1, 'rgba(190,206,240,0)']]);
  var KERN = sprite(32, [[0, 'rgba(255,255,255,1)'], [0.34, 'rgba(255,255,255,1)'], [0.5, 'rgba(240,246,255,0.9)'], [1, 'rgba(226,236,252,0)']]);

  function scrollY() { return window.pageYOffset || document.documentElement.scrollTop || 0; }
  function groesse() {
    W = Math.max(1, window.innerWidth); H = Math.max(1, window.innerHeight);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  /* sichtbare Lage der Kugel (inkl. ihrer Einblend-Bewegung) – nur alle 250 ms, nicht jedes Bild */
  function kugelMessen() {
    var r = orb.getBoundingClientRect();
    halb = Math.max(1, r.width / 2); kx = r.left + halb; ky = r.top + r.height / 2 + scrollY(); R = halb * 0.56;
  }

  function neu(x, y, tipp) {
    var seite = Math.random() < 0.5 ? -1 : 1;
    return {
      sx: x, sy: y, x: x, y: y, px: x, py: y,
      t: 0, v: (tipp ? 0.05 : 0.025) + Math.random() * 0.02,       /* Fortschritt 0..1 + Startgeschwindigkeit */
      biege: (0.10 + Math.random() * 0.16) * seite,                  /* leichte Kurve statt schnurgerade */
      gr: (handy ? 1.0 : 1.3) + Math.random() * 1.2, hell: 0.55 + Math.random() * 0.4,
      dx: 0, dy: 1, tempo: 0, gezogen: false, spd: 0, arm: -1, tipp: !!tipp
    };
  }
  function zufall() {
    var w = Math.random() * Math.PI * 2, d = halb * (1.5 + Math.random() * 1.1);
    return neu(kx + Math.cos(w) * d, ky + Math.sin(w) * d * 0.9, false);
  }

  /* Flug: erst weicher Bogen Richtung Kugelmitte, in Kugelnähe gezogen – schneller, Bahn biegt zur Ausstülpung */
  function schritt(p, dt) {
    p.px = p.x; p.py = p.y;
    var d = Math.hypot(p.x - kx, p.y - ky) || 1;
    if (!p.gezogen && d < ZUG * R) { p.gezogen = true; p.spd = Math.max(p.tempo, 60); }
    if (!p.gezogen) {
      p.v += dt * (0.10 + p.t * 0.35);
      p.t = Math.min(1, p.t + p.v * dt);
      var e = p.t, lx = p.sx + (kx - p.sx) * e, ly = p.sy + (ky - p.sy) * e;
      var ax = kx - p.sx, ay = ky - p.sy, nl = Math.hypot(ax, ay) || 1;
      var bogen = Math.sin(e * Math.PI) * p.biege * nl;
      p.x = lx - ay / nl * bogen; p.y = ly + ax / nl * bogen;
    } else {
      p.spd += dt * (handy ? 240 : 300);                              /* angezogen: leicht beschleunigen */
      var ux = (kx - p.x) / d, uy = (ky - p.y) / d, k = 1 - Math.exp(-dt / 0.12);
      var mx = p.dx + (ux - p.dx) * k, my = p.dy + (uy - p.dy) * k, ml = Math.hypot(mx, my) || 1;
      p.x += mx / ml * p.spd * dt; p.y += my / ml * p.spd * dt;
    }
    var vx = p.x - p.px, vy = p.y - p.py, vl = Math.hypot(vx, vy);
    if (vl > 0.001) { p.dx = vx / vl; p.dy = vy / vl; p.tempo = vl / Math.max(dt, 0.001); }
  }
  /* Spitze des Arms: nach der tatsächlichen (gedämpften) Armlänge der Kugel, nicht nach dem Zielwert */
  function spitze(p) { var K = window.endoKugel, z = p.arm >= 0 && K && K.staerke ? K.staerke[p.arm] : 0; return R * (1 + 0.32 * z); }

  /* Arme verteilen: die nächsten angezogenen Pakete bekommen je einen Arm (max. 3, Handy 2), der bis zur Aufnahme bleibt */
  function armeVerteilen() {
    var K = window.endoKugel; if (!K) return;
    var frei = [], i;
    for (i = 0; i < K.arme; i++) frei[i] = true;
    teilchen.forEach(function (p) { if (p.arm >= 0) frei[p.arm] = false; });
    teilchen.filter(function (p) { return p.gezogen && p.arm < 0; })
      .sort(function (a, b) { return Math.hypot(a.x - kx, a.y - ky) - Math.hypot(b.x - kx, b.y - ky); })
      .forEach(function (p) { for (var j = 0; j < K.arme; j++) if (frei[j]) { frei[j] = false; p.arm = j; return; } });
    for (i = 0; i < 3; i++) { var z = K.zuege[i]; if (i >= K.arme || frei[i]) z.s = 0; }
    teilchen.forEach(function (p) {
      if (p.arm < 0) return;
      var d = Math.hypot(p.x - kx, p.y - ky) || 1, z = K.zuege[p.arm];
      z.x = (p.x - kx) / d; z.y = (p.y - ky) / d;
      var s = Math.max(0, Math.min(1, (ZUG * R - d) / (ZUG * R - R * 1.1)));
      z.s = s * s * (3 - 2 * s);
    });
  }
  function aufnehmen(p) {
    var d = Math.hypot(p.x - kx, p.y - ky) || 1, K = window.endoKugel;
    if (K) { K.puls((p.x - kx) / d, (p.y - ky) / d); if (p.arm >= 0) K.zuege[p.arm].s = 0; }
    else if (glanz.length < 10) glanz.push({ w: Math.atan2(p.y - ky, p.x - kx), a: p.hell, t: 0 });
  }

  function zeichnen(sy) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var j = 0; j < tipps.length; j++) {                        /* Rückmeldung am Finger: kleiner Lichtpunkt, verblasst sofort */
      var q = tipps[j], a0 = 0.55 * (1 - q.t), s0 = 26 + q.t * 22;
      ctx.globalAlpha = a0; ctx.drawImage(SCHEIN, q.x - s0 / 2, q.y - sy - s0 / 2, s0, s0);
    }
    for (var i = 0; i < teilchen.length; i++) {
      var p = teilchen[i], x = p.x, y = p.y - sy;
      if (y < -60 || y > H + 60) continue;
      var a = p.hell, gr = p.gr;
      if (p.gezogen) {                                                /* wird kleiner und blasser, je näher an der Spitze */
        var d = Math.hypot(p.x - kx, p.y - ky), tip = spitze(p);
        var k = Math.max(0, Math.min(1, (d - tip) / (ZUG * R - tip)));
        gr *= 0.3 + 0.7 * k; a *= 0.45 + 0.55 * k;
      }
      if (a <= 0.012) continue;
      var L = Math.min(38, 10 + p.tempo * 0.06);                     /* feiner, kurzer Schweif */
      var tx = x - p.dx * L, ty = y - p.dy * L, sg = ctx.createLinearGradient(x, y, tx, ty);
      sg.addColorStop(0, 'rgba(226,234,248,' + (a * 0.55) + ')'); sg.addColorStop(1, 'rgba(226,234,248,0)');
      ctx.globalAlpha = 1; ctx.strokeStyle = sg; ctx.lineWidth = Math.max(0.6, gr * 0.7); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
      var s1 = gr * 11, s2 = gr * 3.2;
      ctx.globalAlpha = a; ctx.drawImage(SCHEIN, x - s1 / 2, y - s1 / 2, s1, s1);
      ctx.globalAlpha = Math.min(1, a * 1.15); ctx.drawImage(KERN, x - s2 / 2, y - s2 / 2, s2, s2);
    }
    for (var g = 0; g < glanz.length; g++) {                         /* nur ohne WebGL-Kugel: feines Aufglimmen am Rand */
      var f = glanz[g], gg = f.a * (1 - f.t), gx = kx + Math.cos(f.w) * R, gy = ky + Math.sin(f.w) * R - sy;
      ctx.globalAlpha = gg * 0.6; ctx.drawImage(SCHEIN, gx - 22, gy - 22, 44, 44);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  function schleife(zeit) {
    if (!laeuft) return;
    var dt = Math.min(0.05, (zeit - letzteZeit) / 1000) || 0.016; letzteZeit = zeit;
    if (zeit - gemessen > 250) { gemessen = zeit; kugelMessen(); }
    var zufaellige = teilchen.filter(function (p) { return !p.tipp; }).length;
    if (zeit > naechster && zufaellige < MAX_ZUFALL && teilchen.length < MAX_ALLE) {
      teilchen.push(zufall()); naechster = zeit + 800 + Math.random() * 1200;   /* alle 0,8–2 s */
    }
    for (var i = teilchen.length - 1; i >= 0; i--) {
      var p = teilchen[i]; schritt(p, dt);
      var d = Math.hypot(p.x - kx, p.y - ky);
      if (d <= spitze(p) * 1.02 || (!p.gezogen && p.t >= 1)) { aufnehmen(p); teilchen.splice(i, 1); }
    }
    armeVerteilen();
    for (var j = tipps.length - 1; j >= 0; j--) { tipps[j].t += dt / 0.32; if (tipps[j].t >= 1) tipps.splice(j, 1); }
    for (var g = glanz.length - 1; g >= 0; g--) { glanz[g].t += dt / 0.55; if (glanz[g].t >= 1) glanz.splice(g, 1); }
    zeichnen(scrollY());
    requestAnimationFrame(schleife);
  }

  function start() {
    if (laeuft || !sichtbar || !wach) return;
    groesse(); kugelMessen(); laeuft = true; letzteZeit = gemessen = performance.now(); naechster = letzteZeit + 300;
    requestAnimationFrame(schleife);
  }
  function stopp() {
    laeuft = false; teilchen.length = 0; tipps.length = 0; glanz.length = 0; ctx.clearRect(0, 0, W, H);
    if (window.endoKugel) window.endoKugel.zuege.forEach(function (z) { z.s = 0; });
  }

  /* Tippen/Klicken im endo-Bereich: 2–3 Pakete ab dem Tipp-Punkt. Passiver Listener, blockiert nie einen Klick;
     Wischen/Scrollen erzeugt keinen click. Tastatur-Klicks (detail 0) zählen nicht. */
  document.addEventListener('click', function (e) {
    if (!laeuft || !e.detail) return;
    var r = sektion.getBoundingClientRect();
    if (e.clientY < r.top + H * 0.3 || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) return;
    var n = 2 + (Math.random() < 0.5 ? 1 : 0), sy = scrollY();
    tipps.push({ x: e.clientX, y: e.clientY + sy, t: 0 });
    for (var i = 0; i < n && teilchen.length < MAX_ALLE; i++) {
      var w = Math.random() * Math.PI * 2, o = 6 + Math.random() * 10;
      teilchen.push(neu(e.clientX + Math.cos(w) * o, e.clientY + sy + Math.sin(w) * o, true));
    }
  }, { passive: true });

  var io = new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) start(); else stopp(); }, { threshold: 0.02 });
  io.observe(sektion);
  document.addEventListener('visibilitychange', function () { wach = !document.hidden; if (wach) start(); else stopp(); });
  var neuMessen; addEventListener('resize', function () {
    clearTimeout(neuMessen); neuMessen = setTimeout(function () {
      handy = matchMedia('(max-width: 640px)').matches; MAX_ZUFALL = handy ? 5 : 8; MAX_ALLE = handy ? 8 : 12;
      if (laeuft) { groesse(); kugelMessen(); }
    }, 160);
  }, { passive: true });
})();
