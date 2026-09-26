/* endo Studio – Datenpakete zur Kugel (26.09.2026, Claude Code)
   Kleine, leuchtende Pakete (Kern + weicher Schein + kurzer Schweif) fliegen im Bogen auf die endo-Kugel zu. Kommen sie in
   Reichweite, schießt die Kugel eine schmale Zunge genau zu ihnen hinaus (ki/js/orb.js, window.endoKugel), sammelt sie an der
   Spitze ein und gleitet seidig zurück – dabei läuft ein leiser Wellenring über die Kugel.
   Pakete entstehen zufällig am Rand des Bereichs und dort, wo man in #endo tippt/klickt (2–3 pro Tipp, nie blockierend).
   Ein Canvas fest über dem Bildschirm, gerechnet in Seitenkoordinaten; läuft nur, wenn #endo im Bild und der Tab sichtbar ist.
   Testansicht: ?kugel=test (Kugel mittig, alle 1–2 s ein Paket). „Bewegung reduzieren“ → keine Pakete. */
(function () {
  var sektion = document.querySelector('.endo');
  if (!sektion) return;
  var orb = sektion.querySelector('.endo__orb');
  var cv = sektion.querySelector('.endo__daten');
  if (!orb || !cv) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ===== Einstellwerte (Pakete) – die Werte der Zunge selbst stehen oben in ki/js/orb.quelle.js (KUGEL) ===== */
  var TEST = /[?&]kugel=test\b/.test(location.search);
  var PAKET = {
    anzug: 2.4,           // ab 2,4 × Kugelradius wird das Paket leicht angezogen
    anzugBeschl: 300,     // … und beschleunigt (px/s², Handy 240)
    greifen: 0.97,        // greift, sobald es in 97 % der größten Zungen-Reichweite ist
    halten: 0.035,        // gegriffen: Paket bremst in ~35 ms fast bis zum Stillstand, die Zunge schießt hinaus und holt es
    radius: 0.55,         // sichtbarer Kugelradius als Anteil der halben Kugel-Fläche (Radius 1,2 in der 3D-Szene)
    abstandTest: [1.5, 2.1], // Testansicht: Start näher an der Kugel
    takt: TEST ? [1000, 2000] : [800, 2000]   // neues Paket alle … ms
  };

  var ctx = cv.getContext('2d');
  var dpr = Math.min(1.5, window.devicePixelRatio || 1);
  var handy = window.matchMedia('(max-width: 640px)').matches;
  function grenzen() { MAX_ZUFALL = TEST ? 2 : (handy ? 5 : 8); MAX_ALLE = handy ? 8 : 12; }
  var MAX_ZUFALL, MAX_ALLE; grenzen();                               /* zufällige / insgesamt (mit Tipps) */
  var W = 0, H = 0, kx = 0, ky = 0, R = 1, halb = 1;                 /* Bildschirm; Kugelmitte (Seite), sichtbarer Radius */
  var teilchen = [], tipps = [], glanz = [];
  var laeuft = false, sichtbar = false, wach = true, letzteZeit = 0, naechster = 0, gemessen = 0;
  var erzeugt = false; /* Schritt 5: solange endo ein Ergebnis erzeugt, fliegen mehr Pakete zur Kugel */

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
    halb = Math.max(1, r.width / 2); kx = r.left + halb; ky = r.top + r.height / 2 + scrollY(); R = halb * PAKET.radius;
  }
  function reichweite() { var K = window.endoKugel; return K ? K.reichweite : 1.55; }

  function neu(x, y, tipp) {
    var seite = Math.random() < 0.5 ? -1 : 1;
    return {
      sx: x, sy: y, x: x, y: y, px: x, py: y,
      t: 0, v: (tipp ? 0.05 : 0.025) + Math.random() * 0.02,       /* Fortschritt 0..1 + Startgeschwindigkeit */
      biege: (0.10 + Math.random() * 0.16) * seite,                  /* leichte Kurve statt schnurgerade */
      gr: (handy ? 1.0 : 1.3) + Math.random() * 1.2, hell: 0.55 + Math.random() * 0.4,
      dx: 0, dy: 1, tempo: 0, gezogen: false, spd: 0, kennung: -1, tipp: !!tipp
    };
  }
  function zufall() {
    var ab = TEST ? PAKET.abstandTest : [1.5, 2.6];
    var w = Math.random() * Math.PI * 2, d = halb * (ab[0] + Math.random() * (ab[1] - ab[0]));
    return neu(kx + Math.cos(w) * d, ky + Math.sin(w) * d * 0.9, false);
  }

  /* Flug: weicher Bogen Richtung Kugelmitte → in Kugelnähe leicht angezogen → gegriffen: bremst, die Zunge holt es */
  function schritt(p, dt) {
    p.px = p.x; p.py = p.y;
    var d = Math.hypot(p.x - kx, p.y - ky) || 1;
    if (!p.gezogen && d < PAKET.anzug * R) { p.gezogen = true; p.spd = Math.max(p.tempo, 60); }
    if (!p.gezogen) {
      p.v += dt * (0.10 + p.t * 0.35);
      p.t = Math.min(1, p.t + p.v * dt);
      var e = p.t, lx = p.sx + (kx - p.sx) * e, ly = p.sy + (ky - p.sy) * e;
      var ax = kx - p.sx, ay = ky - p.sy, nl = Math.hypot(ax, ay) || 1;
      var bogen = Math.sin(e * Math.PI) * p.biege * nl;
      p.x = lx - ay / nl * bogen; p.y = ly + ax / nl * bogen;
    } else {
      if (p.kennung >= 0) p.spd *= Math.exp(-dt / PAKET.halten);   /* gegriffen: bremst weich ab */
      else p.spd += dt * (handy ? PAKET.anzugBeschl * 0.8 : PAKET.anzugBeschl);
      var ux = (kx - p.x) / d, uy = (ky - p.y) / d, k = 1 - Math.exp(-dt / 0.12);
      var mx = p.dx + (ux - p.dx) * k, my = p.dy + (uy - p.dy) * k, ml = Math.hypot(mx, my) || 1;
      p.x += mx / ml * p.spd * dt; p.y += my / ml * p.spd * dt;
    }
    var vx = p.x - p.px, vy = p.y - p.py, vl = Math.hypot(vx, vy);
    if (vl > 0.001) { p.dx = vx / vl; p.dy = vy / vl; p.tempo = vl / Math.max(dt, 0.001); }
  }

  /* Greifen und Nachführen: in Reichweite fordert das Paket einen Arm an; die Spitze folgt ihm, bis die Kugel „gefangen“ meldet */
  function kugelKontakt(p, i) {
    var K = window.endoKugel, d = Math.hypot(p.x - kx, p.y - ky) || 1, ux = (p.x - kx) / d, uy = (p.y - ky) / d;
    if (K && p.kennung < 0 && d <= reichweite() * PAKET.greifen * R) { p.kennung = K.greifen(ux, uy, d / R); if (p.kennung >= 0) p.spd = Math.min(p.spd, 40); }
    if (K && p.kennung >= 0) {
      if (K.gefangen(p.kennung)) { teilchen.splice(i, 1); return; }   /* an der Spitze eingesammelt – Aufglimmen + Ring macht die Kugel */
      K.folgen(p.kennung, ux, uy, d / R);
      return;
    }
    /* kein Arm frei (oder keine WebGL-Kugel): Paket erreicht die Oberfläche und wird dort aufgenommen */
    if (d <= R * 1.02 || (!p.gezogen && p.t >= 1)) {
      if (K) K.puls(ux, uy); else if (glanz.length < 10) glanz.push({ w: Math.atan2(uy, ux), a: p.hell, t: 0 });
      teilchen.splice(i, 1);
    }
  }

  function zeichnen(sy) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var j = 0; j < tipps.length; j++) {                        /* Rückmeldung am Finger: kleiner Lichtpunkt, verblasst sofort */
      var q = tipps[j], a0 = 0.55 * (1 - q.t), s0 = 26 + q.t * 22;
      ctx.globalAlpha = a0; ctx.drawImage(SCHEIN, q.x - s0 / 2, q.y - sy - s0 / 2, s0, s0);
    }
    var K = window.endoKugel;
    for (var i = 0; i < teilchen.length; i++) {
      var p = teilchen[i], x = p.x, y = p.y - sy;
      if (y < -60 || y > H + 60) continue;
      var a = p.hell, gr = p.gr;
      if (p.kennung >= 0 && K) {                                      /* gegriffen: wird kleiner, während die Zunge kommt */
        gr *= 1 - 0.5 * K.fortschritt(p.kennung);
      } else if (p.gezogen) {                                         /* ohne Arm: kleiner und blasser zur Oberfläche hin */
        var d = Math.hypot(p.x - kx, p.y - ky), k = Math.max(0, Math.min(1, (d - R) / ((PAKET.anzug - 1) * R)));
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
    var takt = erzeugt ? [220, 460] : PAKET.takt, maxZ = erzeugt ? MAX_ALLE : MAX_ZUFALL;
    if (zeit > naechster && zufaellige < maxZ && teilchen.length < MAX_ALLE) {
      teilchen.push(zufall()); naechster = zeit + takt[0] + Math.random() * (takt[1] - takt[0]);
    }
    for (var i = teilchen.length - 1; i >= 0; i--) { schritt(teilchen[i], dt); kugelKontakt(teilchen[i], i); }
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
  function stopp() { laeuft = false; teilchen.length = 0; tipps.length = 0; glanz.length = 0; ctx.clearRect(0, 0, W, H); }

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

  /* Schnittstelle für den Chat (ki/js/agent.js): endoZufluss.erzeugen(true) während ein Auftrag läuft */
  window.endoZufluss = { erzeugen: function (an) { erzeugt = !!an; if (an) { naechster = 0; start(); } } };

  var io = new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) start(); else stopp(); }, { threshold: 0.02 });
  io.observe(sektion);
  document.addEventListener('visibilitychange', function () { wach = !document.hidden; if (wach) start(); else stopp(); });
  var neuMessen; addEventListener('resize', function () {
    clearTimeout(neuMessen); neuMessen = setTimeout(function () {
      handy = matchMedia('(max-width: 640px)').matches; grenzen();
      if (laeuft) { groesse(); kugelMessen(); }
    }, 160);
  }, { passive: true });

  /* Testansicht: Kugel mittig ins Bild holen (einmal nach dem Laden) */
  if (TEST) {
    var zeigen = function () { var r = orb.getBoundingClientRect(); window.scrollTo(0, Math.max(0, r.top + scrollY() - (window.innerHeight - r.height) / 2)); };
    if (document.readyState === 'complete') setTimeout(zeigen, 300); else window.addEventListener('load', function () { setTimeout(zeigen, 300); });
  }
})();
