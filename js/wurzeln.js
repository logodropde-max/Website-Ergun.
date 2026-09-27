/* Wurzeln vom Rasen bis zur Fußzeile (Emre, 27.09.2026)
   Aus der Erde unter dem Titelbild wachsen beim Runterscrollen Wurzeln nach unten – links und rechts NEBEN dem
   Kontaktformular – und laufen am Punkt von „ERGUN.“ zusammen, der dann weich aufleuchtet.
   · gleiche Scroll-Quelle + 150-ms-Glättung wie Sonne/Mond: js/szene.js ruft window.ergunTakt(weichY) auf
   · runter = wachsen (stroke-dashoffset), hoch = exakt zurück; Glimmer an den Spitzen wandert mit (nachts stärker)
   · SVG im Code gezeichnet, deterministisch (gleiche Form bei jedem Besuch), neu berechnet bei Größenwechsel
   · Handy: schmal am Rand, hinter dem Kasten nur ganz leise · „Bewegung reduzieren“: fertig gezeichnet, ruhig
   · Test: ?wurzeln=test → Regler unten links spielt das Wachstum durch */
(function () {
  var sektion = document.getElementById('kontakt');
  var form = document.getElementById('anfrage');
  var punkt = document.querySelector('.agentur__marke .dot');
  var held = document.querySelector('[data-szene]');
  if (!sektion || !form || !punkt) return;
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TEST = /[?&]wurzeln=test\b/.test(location.search);

  /* ===== Einstellwerte ===== */
  var WURZELN = {
    front: 0.62,            // die Wachstumsfront liegt bei 62 % der Bildschirmhöhe
    farbe: '176, 140, 104', // warmes, helles Erdbraun (auf dunklem Grund sichtbar, aber ruhig)
    haupt: 2.1,             // Strichstärke der Hauptwurzeln (px)
    neben: 1.0,             // Seitenwurzeln
    deckHaupt: 0.55, deckNeben: 0.32,
    deckHandy: 0.35,        // Handy: alles leiser
    glimmer: '255, 90, 31', // Akzent #FF5A1F an den Spitzen
    glimmerTag: 0.35, glimmerNacht: 0.7
  };

  var NS = 'http://www.w3.org/2000/svg';
  var huelle = document.createElement('div');
  huelle.className = 'wurzeln'; huelle.setAttribute('aria-hidden', 'true');
  var svg = document.createElementNS(NS, 'svg');
  huelle.appendChild(svg);
  sektion.insertBefore(huelle, sektion.firstChild);

  var pfade = [], spitzen = [], W = 0, H = 0, handy = false, zielY = 1, fertigGezeigt = false, sichtbar = true, testWert = null;

  /* kleiner deterministischer Zufall (gleiche Wurzeln bei jedem Besuch) */
  function zufall(saat) { return function () { saat = (saat * 16807) % 2147483647; return (saat - 1) / 2147483646; }; }

  function relativ(el) {
    var s = sektion.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  }

  /* Weicher Pfad durch Stützpunkte (Catmull-Rom → Bézier) */
  function pfadDurch(p) {
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  function neuerPfad(d, breite, deckung, mitSpitze) {
    var el = document.createElementNS(NS, 'path');
    el.setAttribute('d', d);
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', 'rgba(' + WURZELN.farbe + ',' + (deckung * (handy ? WURZELN.deckHandy / 0.55 : 1)).toFixed(3) + ')');
    el.setAttribute('stroke-width', breite);
    el.setAttribute('stroke-linecap', 'round');
    svg.appendChild(el);
    var len = el.getTotalLength();
    el.style.strokeDasharray = len.toFixed(1) + ' ' + (len + 2).toFixed(1);
    el.style.strokeDashoffset = len.toFixed(1);
    /* Abtastung: wie weit ist der Pfad bei welcher Tiefe? (Wurzeln laufen fast nur nach unten) */
    var n = Math.max(24, Math.round(len / 18)), proben = [];
    for (var i = 0; i <= n; i++) { var q = el.getPointAtLength(len * i / n); proben.push([q.y, len * i / n]); }
    var pf = { el: el, len: len, proben: proben, zeigt: -1 };
    pfade.push(pf);
    if (mitSpitze) {
      var g = document.createElementNS(NS, 'circle');
      g.setAttribute('r', handy ? 7 : 9); g.setAttribute('fill', 'url(#wurzel-glimmer)'); g.style.opacity = '0';
      svg.appendChild(g);
      spitzen.push({ pf: pf, el: g });
    }
    return pf;
  }

  function bauen() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    pfade = []; spitzen = [];
    W = sektion.clientWidth; H = sektion.scrollHeight;
    handy = W < 700;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<radialGradient id="wurzel-glimmer"><stop offset="0" stop-color="rgb(' + WURZELN.glimmer + ')" stop-opacity="0.95"/><stop offset="0.35" stop-color="rgb(' + WURZELN.glimmer + ')" stop-opacity="0.35"/><stop offset="1" stop-color="rgb(' + WURZELN.glimmer + ')" stop-opacity="0"/></radialGradient>';
    svg.appendChild(defs);

    var f = relativ(form), p = relativ(punkt);
    var zx = p.x + p.w / 2, zy = p.y + p.h * 0.62;   /* Mitte des Punkts von „ERGUN.“ */
    zielY = zy;
    var rand = handy ? 7 : Math.max(24, W * 0.04);
    var linksInnen = handy ? rand + 6 : Math.max(rand + 30, f.x - 36), rechtsInnen = handy ? W - rand - 6 : Math.min(W - rand - 30, f.x + f.w + 36);
    var unten = f.y + f.h;                          /* Ende des Formulars */
    var R = zufall(20260927);

    /* je Seite 2 (Handy) bzw. 3 Hauptwurzeln */
    var proSeite = handy ? 1 : 3;
    [-1, 1].forEach(function (seite) {
      for (var k = 0; k < proSeite; k++) {
        var aussen = seite < 0 ? rand : W - rand, innen = seite < 0 ? linksInnen : rechtsInnen;
        var spur = aussen + (innen - aussen) * (handy ? 0.5 : (0.2 + 0.3 * k)) ;                 /* Bahn im freien Rand */
        var startX = W / 2 + seite * (W * (handy ? 0.3 : 0.12 + 0.1 * k)) + (R() - 0.5) * 30;   /* aus der Erde oben */
        var pkt = [[startX, -4]];
        var schritte = 7 + Math.round(R() * 3), yEnde = unten + (zy - unten) * 0.35;
        for (var i = 1; i <= schritte; i++) {
          var t = i / schritte, y = 40 + (yEnde - 40) * t;
          var x = startX + (spur - startX) * Math.min(1, t * 2.2) + (R() - 0.5) * (handy ? 6 : 38) * (0.4 + t);
          if (!handy) x = seite < 0 ? Math.min(x, linksInnen) : Math.max(x, rechtsInnen);   /* nie über das Formular */
          pkt.push([x, y]);
        }
        /* zum Punkt von ERGUN. zusammenlaufen: erst weich zur Mitte, dann von oben in den Punkt */
        pkt.push([zx + seite * (handy ? 60 : 140 + 40 * k), zy - (handy ? 70 : 110 - 12 * k)]);
        pkt.push([zx + seite * 10, zy - 14]);
        pkt.push([zx, zy]);
        var haupt = neuerPfad(pfadDurch(pkt), WURZELN.haupt - k * 0.4, WURZELN.deckHaupt, true);
        /* feine Seitenwurzeln */
        var neben = handy ? 3 : 6;
        for (var j = 0; j < neben; j++) {
          var a = Math.floor(1 + R() * (pkt.length - 5)), b = pkt[a], lang = (handy ? 26 : 50) + R() * (handy ? 30 : 80);
          var nach = (seite < 0 ? -1 : 1) * (R() < 0.7 ? 1 : -1);
          if (!handy && nach !== (seite < 0 ? -1 : 1)) nach = seite < 0 ? -1 : 1;                /* nach außen, weg vom Formular */
          var q = [[b[0], b[1]], [b[0] + nach * lang * 0.45, b[1] + lang * 0.35], [b[0] + nach * lang, b[1] + lang * 0.9 + R() * 20]];
          neuerPfad(pfadDurch(q), WURZELN.neben * (0.6 + R() * 0.5), WURZELN.deckNeben, false);
        }
        void haupt;
      }
    });
    fertigGezeigt = false;
    setzen(null, true);
  }

  /* Länge, bis zu der ein Pfad bei der Front sichtbar ist */
  function laengeBis(pf, fy) {
    var pr = pf.proben, l = 0;
    for (var i = 0; i < pr.length; i++) { if (pr[i][0] <= fy) l = pr[i][1]; else if (pr[i][0] > fy + 40) break; }
    return fy >= zielY + 2 ? pf.len : l;
  }

  var letzteFront = null;
  function setzen(weichY, erzwingen) {
    if (!pfade.length) return;
    var fy;
    if (testWert !== null) fy = -10 + (zielY + 20) * testWert;
    else if (ruhig) fy = zielY + 20;
    else {
      var y = weichY == null ? (window.pageYOffset || 0) : weichY;
      var s = sektion.getBoundingClientRect(), obenDok = s.top + (window.pageYOffset || 0);
      var maxScroll = document.documentElement.scrollHeight - innerHeight;
      var k = Math.max(WURZELN.front, (obenDok + zielY + 24 - maxScroll) / innerHeight);   /* ganz unten erreicht die Front sicher den Punkt */
      fy = y + innerHeight * k - obenDok;
    }
    fy = Math.round(fy * 2) / 2;
    if (!erzwingen && fy === letzteFront) return;
    letzteFront = fy;
    var nacht = held ? parseFloat(held.style.getPropertyValue('--nacht')) || 0 : 1;
    var glimmer = WURZELN.glimmerTag + (WURZELN.glimmerNacht - WURZELN.glimmerTag) * nacht;
    for (var i = 0; i < pfade.length; i++) {
      var pf = pfade[i], l = laengeBis(pf, fy);
      if (Math.abs(l - pf.zeigt) < 0.5) continue;
      pf.zeigt = l;
      pf.el.style.strokeDashoffset = (pf.len - l).toFixed(1);
    }
    for (var j = 0; j < spitzen.length; j++) {
      var sp = spitzen[j], l2 = sp.pf.zeigt;
      if (l2 <= 1 || l2 >= sp.pf.len - 1) { sp.el.style.opacity = l2 >= sp.pf.len - 1 ? '0' : '0'; continue; }
      var q = sp.pf.el.getPointAtLength(l2);
      sp.el.setAttribute('cx', q.x.toFixed(1)); sp.el.setAttribute('cy', q.y.toFixed(1));
      sp.el.style.opacity = (glimmer * (handy ? 0.7 : 1)).toFixed(2);
    }
    var fertig = fy >= zielY + 2;
    if (fertig !== fertigGezeigt) { fertigGezeigt = fertig; punkt.classList.toggle('dot--glueht', fertig); }
  }

  /* gemeinsamer Takt aus js/szene.js (läuft nur beim Scrollen) */
  var vorher = window.ergunTakt;
  window.ergunTakt = function (weichY, lp) { if (vorher) vorher(weichY, lp); if (sichtbar) setzen(weichY, false); };
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) setzen(null, true); }, { rootMargin: '200px 0px' }).observe(sektion);

  var rt;
  function neu() { clearTimeout(rt); rt = setTimeout(bauen, 180); }
  window.addEventListener('resize', neu);
  if ('ResizeObserver' in window) new ResizeObserver(neu).observe(form);   /* Formular wird länger (Feld eingeblendet, Danke-Karte) */
  if (document.readyState === 'complete') bauen(); else window.addEventListener('load', bauen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(neu);

  if (TEST) {
    var r = document.createElement('input');
    r.type = 'range'; r.min = 0; r.max = 1000; r.value = 0; r.setAttribute('aria-label', 'Wurzeln durchspielen');
    r.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99;width:min(60vw,320px)';
    r.addEventListener('input', function () { testWert = r.value / 1000; setzen(null, true); });
    document.body.appendChild(r);
    window.__wurzeln = { setzen: function (v) { testWert = v; setzen(null, true); }, pfade: function () { return pfade.length; } };
  }
})();
