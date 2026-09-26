/* Kontakt-Globus (Emre, 27.09.2026, nach der Vorlage „ContactWithGlobe“, Variante wireframesolid).
   Ohne d3/topojson: eigene orthografische Projektion auf Canvas, Weltkarte als lokale Datei js/welt.js
   (Natural Earth 1:110m, gemeinfrei), wird erst geladen, wenn der Bereich in Sicht kommt.
   Dreht langsam heran und bleibt auf Deutschland stehen; dort pulsiert ein Lichtpunkt (Elmshorn) als HTML-Element
   (nur transform/opacity). Nicht sichtbar = keine Arbeit. „Bewegung reduzieren“: sofort das Standbild. */
(function () {
  var box = document.querySelector('[data-globus]');
  if (!box) return;
  var cv = box.querySelector('canvas'), punkt = box.querySelector('[data-globus-punkt]');
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Einstellwerte ===== */
  var GLOBUS = {
    ziel: [10.4, 51.2],        // bleibt auf Deutschland stehen (Länge, Breite)
    neigung: 22,               // Blick leicht von Süden: Deutschland sitzt etwas über der Mitte
    ort: [9.65, 53.75],        // Lichtpunkt: Elmshorn
    start: 150,                // Grad Drehung vor dem Ziel
    dauer: 5200,               // ms bis zum Stillstand (weich auslaufend)
    netz: 15,                  // Gradnetz alle … Grad
    linie: 'rgba(242, 239, 232, 0.13)',
    kueste: 'rgba(242, 239, 232, 0.55)',
    land: 'rgba(242, 239, 232, 0.07)',
    rand: 'rgba(242, 239, 232, 0.22)',
    akzent: 'rgba(222, 234, 252, 0.95)'   // = Leuchtpunkt der Lichtlinie (endo-zufluss.js)
  };

  var ctx = cv.getContext('2d'), W = 0, H = 0, R = 1, cx = 0, cy = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  var lam0 = GLOBUS.ziel[0] + GLOBUS.start, phi0 = GLOBUS.neigung, t0 = 0, weit = 0, laeuft = false, fertig = false, sichtbar = false;
  var RAD = Math.PI / 180;

  function masse() {
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var flach = W / H > 1.5; R = Math.min(W, H * (flach ? 2.2 : 1)) * 0.46;
    cx = W / 2; cy = flach ? H * 0.62 + R * 0.28 : H / 2;
  }
  /* Punkt (Länge, Breite) → Bildschirm; z < 0 = Rückseite */
  function proj(l, p) {
    var la = (l - lam0) * RAD, ph = p * RAD, p0 = phi0 * RAD;
    var cp = Math.cos(ph);
    return { x: cx + R * cp * Math.sin(la), y: cy - R * (Math.cos(p0) * Math.sin(ph) - Math.sin(p0) * cp * Math.cos(la)), z: Math.sin(p0) * Math.sin(ph) + Math.cos(p0) * cp * Math.cos(la) };
  }
  /* Linienzug: nur sichtbare Stücke */
  function zug(punkte, schliessen) {
    var an = false;
    for (var i = 0; i < punkte.length; i += 2) {
      var q = proj(punkte[i], punkte[i + 1]);
      if (q.z > 0) { if (an) ctx.lineTo(q.x, q.y); else { ctx.moveTo(q.x, q.y); an = true; } } else an = false;
    }
    if (schliessen && an) { var s = proj(punkte[0], punkte[1]); if (s.z > 0) ctx.lineTo(s.x, s.y); }
  }
  /* Fläche: Punkte hinter dem Horizont an den Rand gedrückt – sieht beim Füllen sauber aus */
  function flaeche(punkte) {
    for (var i = 0; i < punkte.length; i += 2) {
      var q = proj(punkte[i], punkte[i + 1]);
      if (q.z <= 0) { var dx = q.x - cx, dy = q.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1; q.x = cx + dx / d * R; q.y = cy + dy / d * R; }
      if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
    }
    ctx.closePath();
  }
  function zeichnen() {
    var welt = window.ERGUN_WELT;
    ctx.clearRect(0, 0, W, H);
    /* Kugel: leicht gewölbt, Rand fein */
    var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, 'rgba(242, 239, 232, 0.06)'); g.addColorStop(1, 'rgba(242, 239, 232, 0.01)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = GLOBUS.rand; ctx.stroke();
    /* Gradnetz */
    ctx.beginPath();
    for (var l = -180; l < 180; l += GLOBUS.netz) { var m = []; for (var p = -90; p <= 90; p += 3) m.push(l, p); zug(m, false); }
    for (var b = -90 + GLOBUS.netz; b < 90; b += GLOBUS.netz) { var k = []; for (var l2 = -180; l2 <= 180; l2 += 3) k.push(l2, b); zug(k, false); }
    ctx.strokeStyle = GLOBUS.linie; ctx.lineWidth = 0.8; ctx.stroke();
    if (!welt) return;
    /* Land: Fläche + Küste */
    ctx.beginPath(); welt.land.forEach(function (r) { flaeche(r); });
    ctx.fillStyle = GLOBUS.land; ctx.fill('evenodd');
    ctx.beginPath(); welt.land.forEach(function (r) { zug(r, true); });
    ctx.strokeStyle = GLOBUS.kueste; ctx.lineWidth = 0.7; ctx.stroke();
    /* Deutschland im Akzent */
    ctx.beginPath(); welt.de.forEach(function (r) { zug(r, true); });
    ctx.strokeStyle = GLOBUS.akzent; ctx.lineWidth = 1.2; ctx.stroke();
    /* Lichtpunkt als HTML-Element platzieren */
    var o = proj(GLOBUS.ort[0], GLOBUS.ort[1]);
    if (punkt) { punkt.style.transform = 'translate(' + o.x.toFixed(1) + 'px,' + o.y.toFixed(1) + 'px)'; punkt.style.opacity = o.z > 0.05 && fertig ? '1' : '0'; }
  }
  function sanft(x) { return 1 - Math.pow(1 - x, 3); }
  function bild(t) {
    if (!sichtbar) { laeuft = false; return; }
    if (!t0) t0 = t - weit * GLOBUS.dauer;   /* nach einer Pause dort weiter, wo er stand */
    var x = weit = Math.min(1, (t - t0) / GLOBUS.dauer);
    lam0 = GLOBUS.ziel[0] + GLOBUS.start * (1 - sanft(x));
    phi0 = GLOBUS.neigung;
    if (x >= 1) { fertig = true; box.classList.add('ist-fertig'); }
    zeichnen();
    if (x < 1) requestAnimationFrame(bild); else laeuft = false;
  }
  function starten() {
    if (fertig) { zeichnen(); return; }
    if (ruhig) { lam0 = GLOBUS.ziel[0]; fertig = true; box.classList.add('ist-fertig'); zeichnen(); return; }
    if (!laeuft) { laeuft = true; t0 = 0; requestAnimationFrame(bild); }
  }
  function welt(fn) {
    if (window.ERGUN_WELT) { fn(); return; }
    var s = document.createElement('script');
    s.src = box.getAttribute('data-welt'); s.async = true; s.onload = fn; s.onerror = fn;
    document.head.appendChild(s);
  }
  var geladen = false;
  function sicht(an) {
    sichtbar = an;
    if (!an) return;
    if (!geladen) { geladen = true; masse(); welt(starten); return; }
    starten();
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { sicht(e[0].isIntersecting); }, { rootMargin: '200px 0px' }).observe(box);
  else sicht(true);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (geladen) { masse(); zeichnen(); } }, 150); });
})();
