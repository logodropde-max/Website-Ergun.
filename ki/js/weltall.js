/* endo im Weltall – Hero von /ki/ (Emre, 27.09.2026, Ausnahme auf seinen Wunsch)
   Eine Bühne hinter der Kugel, immer genau auf die Kugelmitte zentriert:
   · Hintergrund: Emres Bild/Video aus Higgsfield (data-desktop / data-handy / data-video-*), bis dahin Lavalampen-Nebel (CSS)
   · darüber im Canvas: feine Datenpunkte auf langsamen Orbit-Ringen, Sternstaub und Lichtfäden, die schwerelos in die Kugel fließen
   · leichte Parallaxe (Scrollen + Maus), nur transform
   Pausiert, wenn der Hero nicht sichtbar oder der Tab versteckt ist. „Bewegung reduzieren“: ein ruhiges Standbild. */
(function () {
  var hero = document.querySelector('[data-weltall-hero]');
  if (!hero) return;
  var buehne = hero.querySelector('[data-weltall-buehne]'), cv = hero.querySelector('[data-weltall-daten]'), orb = hero.querySelector('[data-orb]');
  var medien = hero.querySelector('[data-weltall-medien]');
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var handy = window.matchMedia('(max-width: 700px)').matches;
  var feineMaus = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ===== Einstellwerte (alles langsam, weich, schwerelos) ===== */
  var WELTALL = {
    ringe: handy ? 2 : 3,              // Orbit-Ringe um die Kugel
    punkteProRing: handy ? 16 : 26,
    ringUmlauf: [140, 220],            // Sekunden für einen Umlauf (sehr langsam)
    staub: handy ? 60 : 130,           // Sternstaub
    faeden: handy ? 5 : 9,             // gleichzeitig fließende Lichtfäden
    fadenDauer: [9, 15],               // Sekunden vom Rand bis in die Kugel
    farbe: '222, 234, 252',            // Akzentlicht = Leuchtpunkt der Lichtlinie
    parallaxeMaus: 10,                 // px (Bühne), Canvas die Hälfte
    parallaxeScroll: 0.12              // Bühne wandert beim Scrollen leicht mit
  };

  /* ---- Emres Bild/Video (wenn eingetragen). Video nur ohne „Bewegung reduzieren“, stumm, playsinline, mit Poster. ---- */
  var video = null;
  (function medienLaden() {
    if (!medien) return;
    var art = handy ? 'handy' : 'desktop';
    var bild = medien.getAttribute('data-' + art), film = medien.getAttribute('data-video-' + art);
    if (!bild) return;                                   /* noch kein Bild: Platzhalter-Nebel bleiben */
    if (film && !ruhig) {
      video = document.createElement('video');
      video.muted = true; video.loop = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
      video.preload = 'metadata'; video.poster = bild; video.src = film; video.className = 'weltall__medium';
      medien.appendChild(video);
    } else {
      var img = new Image(); img.decoding = 'async'; img.alt = ''; img.className = 'weltall__medium'; img.src = bild;
      medien.appendChild(img);
    }
    hero.classList.add('hat-bild');
  })();

  var ctx = cv.getContext('2d'), dpr = Math.min(handy ? 1.25 : 1.5, window.devicePixelRatio || 1);
  var W = 0, H = 0, mx = 0, my = 0, kr = 100;          /* Canvas-Größe, Kugelmitte (im Canvas), Kugelradius */
  var ringe = [], staub = [], faeden = [];
  function zufall(a, b) { return a + Math.random() * (b - a); }

  function messen() {
    var h = hero.getBoundingClientRect(), o = orb.getBoundingClientRect();
    W = h.width; H = h.height;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    /* Kugel ohne ihre Chat-Skalierung messen: die Mitte zählt */
    mx = o.left - h.left + o.width / 2; my = o.top - h.top + o.height / 2; kr = o.width * 0.3;
  }
  function bauen() {
    ringe = []; staub = []; faeden = [];
    var basis = Math.max(W, H);
    for (var r = 0; r < WELTALL.ringe; r++) {
      var ring = { rx: kr * (2.1 + r * 1.05) + basis * 0.04 * r, ry: 0, neig: zufall(-0.28, 0.28), umlauf: zufall(WELTALL.ringUmlauf[0], WELTALL.ringUmlauf[1]) * (r % 2 ? -1 : 1), punkte: [] };
      ring.ry = ring.rx * zufall(0.26, 0.4);
      for (var i = 0; i < WELTALL.punkteProRing; i++) ring.punkte.push({ w: (i / WELTALL.punkteProRing) * Math.PI * 2 + zufall(-0.12, 0.12), gr: zufall(0.6, 1.6), hell: zufall(0.25, 0.8), puls: zufall(0, 6.28) });
      ringe.push(ring);
    }
    for (var s = 0; s < WELTALL.staub; s++) staub.push({ x: Math.random(), y: Math.random(), gr: zufall(0.3, 1.1), hell: zufall(0.08, 0.45), puls: zufall(0, 6.28), tempo: zufall(0.15, 0.5) });
    for (var f = 0; f < WELTALL.faeden; f++) faeden.push(neuerFaden(Math.random()));
  }
  /* Lichtfaden: startet weit draußen und schwebt auf einer sanften Spirale in die Kugel */
  function neuerFaden(schonT) {
    var w = Math.random() * Math.PI * 2, weit = Math.max(W, H) * zufall(0.45, 0.7);
    return { w0: w, r0: weit, drall: zufall(0.5, 1.1) * (Math.random() < 0.5 ? -1 : 1), dauer: zufall(WELTALL.fadenDauer[0], WELTALL.fadenDauer[1]), t: schonT || 0, hell: zufall(0.35, 0.8) };
  }
  function fadenPunkt(f, t) {
    var e = t * t * (3 - 2 * t);                                   /* weich an- und auslaufend */
    var r = f.r0 * (1 - e) + kr * 0.85 * e, w = f.w0 + f.drall * e;
    return { x: mx + Math.cos(w) * r, y: my + Math.sin(w) * r * 0.62 };
  }

  var ox = 0, oy = 0, zx = 0, zy = 0, wy = null;                    /* Maus-Parallaxe (geglättet); wy = Bühne folgt der Kugelmitte */
  function buehneSetzen(extraY) { buehne.style.transform = 'translate3d(' + ox.toFixed(2) + 'px,' + (wy + extraY).toFixed(2) + 'px,0)'; }
  function zeichnen(zeit) {
    var s = zeit / 1000, c = WELTALL.farbe;
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(ox * 0.5, oy * 0.5);
    /* Sternstaub */
    for (var i = 0; i < staub.length; i++) {
      var d = staub[i], a = d.hell * (0.6 + 0.4 * Math.sin(s * d.tempo + d.puls));
      ctx.fillStyle = 'rgba(' + c + ',' + a.toFixed(3) + ')';
      ctx.fillRect(d.x * W, d.y * H, d.gr, d.gr);
    }
    /* Orbit-Ringe: Punkte + hauchdünne Verbindungen zum Nachbarn (Sternbild) */
    ctx.lineWidth = 0.6;
    for (var r = 0; r < ringe.length; r++) {
      var ring = ringe[r], dreh = (s / ring.umlauf) * Math.PI * 2, cs = Math.cos(ring.neig), sn = Math.sin(ring.neig), vorher = null, erster = null;
      for (var p = 0; p < ring.punkte.length; p++) {
        var pk = ring.punkte[p], w = pk.w + dreh, ex = Math.cos(w) * ring.rx, ey = Math.sin(w) * ring.ry;
        var x = mx + ex * cs - ey * sn, y = my + ex * sn + ey * cs;
        var vorne = Math.sin(w) > 0 ? 1 : 0.45;                       /* hintere Hälfte leiser – Tiefe */
        var hell = pk.hell * vorne * (0.75 + 0.25 * Math.sin(s * 0.6 + pk.puls));
        if (vorher) { ctx.strokeStyle = 'rgba(' + c + ',' + (0.09 * vorne).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(vorher.x, vorher.y); ctx.lineTo(x, y); ctx.stroke(); }
        ctx.fillStyle = 'rgba(' + c + ',' + hell.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, pk.gr, 0, Math.PI * 2); ctx.fill();
        vorher = { x: x, y: y }; if (!erster) erster = vorher;
      }
      if (vorher && erster) { ctx.strokeStyle = 'rgba(' + c + ',0.05)'; ctx.beginPath(); ctx.moveTo(vorher.x, vorher.y); ctx.lineTo(erster.x, erster.y); ctx.stroke(); }
    }
    /* Lichtfäden: Kopf leuchtet, Schweif verblasst; kurz vor der Kugel sanft ausblenden */
    for (var k = 0; k < faeden.length; k++) {
      var f = faeden[k], kopf = fadenPunkt(f, f.t), schweif = fadenPunkt(f, Math.max(0, f.t - 0.16));
      var aus = f.t > 0.85 ? (1 - f.t) / 0.15 : Math.min(1, f.t / 0.1);
      var g = ctx.createLinearGradient(schweif.x, schweif.y, kopf.x, kopf.y);
      g.addColorStop(0, 'rgba(' + c + ',0)'); g.addColorStop(1, 'rgba(' + c + ',' + (0.55 * f.hell * aus).toFixed(3) + ')');
      ctx.strokeStyle = g; ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (var q = 0; q <= 8; q++) { var pt = fadenPunkt(f, Math.max(0, f.t - 0.16 + q * 0.02)); if (q) ctx.lineTo(pt.x, pt.y); else ctx.moveTo(pt.x, pt.y); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(' + c + ',' + (0.9 * f.hell * aus).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(kopf.x, kopf.y, 1.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  var laeuft = false, sichtbar = true, letzte = 0, gemessen = 0;
  function bild(zeit) {
    if (!laeuft) return;
    var dt = Math.min(0.05, (zeit - letzte) / 1000) || 0.016; letzte = zeit;
    if (zeit - gemessen > 300) { gemessen = zeit; messen(); }
    for (var k = 0; k < faeden.length; k++) { faeden[k].t += dt / faeden[k].dauer; if (faeden[k].t >= 1) faeden[k] = neuerFaden(0); }
    ox += (zx - ox) * Math.min(1, dt * 2.2); oy += (zy - oy) * Math.min(1, dt * 2.2);   /* Maus: weich nachgezogen */
    var ziel = my - H / 2; wy = wy === null ? ziel : wy + (ziel - wy) * Math.min(1, dt * 3);   /* öffnet der Chat, gleitet die Bühne mit der Kugel */
    var sy = Math.max(0, Math.min(H, -hero.getBoundingClientRect().top)) * WELTALL.parallaxeScroll;
    buehneSetzen(oy + sy);
    zeichnen(zeit);
    requestAnimationFrame(bild);
  }
  function start() {
    if (laeuft || !sichtbar || document.hidden) return;
    laeuft = true; letzte = performance.now();
    if (video) video.play().catch(function () {});
    requestAnimationFrame(bild);
  }
  function stopp() { laeuft = false; if (video) video.pause(); }

  messen(); bauen();
  if (ruhig) { wy = my - H / 2; buehneSetzen(0); zeichnen(20000); return; }                              /* Standbild */
  if (feineMaus) hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    zx = ((e.clientX - r.left) / r.width - 0.5) * 2 * WELTALL.parallaxeMaus;
    zy = ((e.clientY - r.top) / r.height - 0.5) * 2 * WELTALL.parallaxeMaus;
  }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) start(); else stopp(); }).observe(hero);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopp(); else start(); });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { messen(); bauen(); if (!laeuft) { wy = my - H / 2; buehneSetzen(0); zeichnen(performance.now()); } }, 200); });
  start();
})();
