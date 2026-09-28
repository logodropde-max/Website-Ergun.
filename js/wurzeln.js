/* Unter die Erde (ERGUN., 27.09.2026, komplett neu): Erdschnitt am Übergang Titelbild → Kontakt und Wurzeln bis zur Fußzeile,
   gemalt mit derselben Technik wie die Landschaft: Canvas 2D, gefüllte Formen, Paletten, Zufall, Körnung und Lichtkante aus
   js/szene.js (window.ergunSzene, nur lesen).
   · Erdschnitt: beginnt oben exakt in dem Dunkel, in dem das Titelbild endet (#070B16, .szene__fade) – so gibt es keine Naht –,
     darunter Mutterboden mit drei leichten Schichten, Körnung, kleinen Steinen (stein-Palette) und Graswurzel-Härchen direkt
     unter den Halmen; nach unten läuft er über ~40 % Bildschirmhöhe weich in den Seitenhintergrund aus. Drei Fassungen
     (Tag, Gold, Nacht) wie im Titelbild, beim Scrollen wird nur überblendet.
   · Wurzeln: je Seite eine Hauptwurzel aus der Erde am Rand (wo im Titelbild Wiese/Bäume stehen) → 3–5 Seitenwurzeln →
     Haarwurzeln an den Spitzen. Gefüllte, sich verjüngende Formen (oben 10–16 px, Spitze < 1 px), leicht knorrig, mit
     Schattenseite, Lichtkante zum Mond und feiner Rinde auf den dicken Teilen. Sperrzonen (Formular, Texte, Foto + Abstand)
     werden umfahren; ist der Randkorridor zu schmal (Handy), enden sie und tauchen erst unter dem Formular wieder auf.
     Eine feine Wurzel endet am Punkt von „ERGUN.“, der dann sanft heller wird. Farben folgen live der Lichtstimmung.
   · Wachstum synchron zum Scrollen (window.ergunTakt aus szene.js, gleiche 150-ms-Glättung): die Spitze führt, dahinter
     wird die Wurzel zur vollen Dicke; hoch = exakt zurück. Deterministisch (fester Samen), Pixeldichte max. 2,
     nur neu gemalt, wenn sich die Front oder das Licht ändert, Pause außerhalb des Bildes. „Bewegung reduzieren“: fertig, ruhig.
   · Test: ?wurzeln=test → Regler Wachstum, Umschalter Tag/Gold/Nacht, Sperrzonen als rote Rahmen. */
(function () {
  var S = window.ergunSzene;
  var sektion = document.getElementById('kontakt'), form = document.getElementById('anfrage');
  var marke = document.querySelector('.agentur__marke'), punkt = marke && marke.querySelector('.dot');
  if (!S || !sektion || !form || !punkt) return;
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TEST = /[?&]wurzeln=test\b/.test(location.search);
  var F = S.palette, E = F.erde, LICHTER = ['tag', 'gold', 'nacht'];
  var OBEN = '#070B16', BG = '#000000';   /* Dunkel am Ende des Titelbilds · Seitenhintergrund (--bg) */

  /* ===== Einstellwerte ===== */
  var EINST = {
    front: 0.62,                 // Wachstumsfront bei 62 % der Bildschirmhöhe
    schnitt: 0.44,               // Höhe des Erdschnitts in Bildschirmhöhen (Boden + langer Verlauf), 240–520 px
    dicke: 14, dickeHandy: 8,    // Hauptwurzel oben (px)
    abstand: 32, abstandHandy: 16,   // Sperrzonen-Abstand zu Text, Formular, Foto
    korridor: 36,                // schmaler als das: dort wächst nichts
    spitze: [64, 34, 14, 26],    // Länge der wandernden Spitze: Haupt, Seite, Haar, Zielwurzel
    versatz: [0, 36, 70, 24]     // Seiten-/Haarwurzeln starten versetzt hinter der Front
  };

  /* ===== Aufbau ===== */
  var huelle = document.createElement('div');
  huelle.className = 'erdreich'; huelle.setAttribute('aria-hidden', 'true');
  var schnitte = {};
  LICHTER.forEach(function (l) { var c = document.createElement('canvas'); c.className = 'erdreich__schnitt'; c.setAttribute('data-licht', l); huelle.appendChild(c); schnitte[l] = c; });
  var leinwand = document.createElement('canvas'); leinwand.className = 'erdreich__wurzeln'; huelle.appendChild(leinwand);
  sektion.insertBefore(huelle, sektion.firstChild);
  var g = leinwand.getContext('2d');

  var W = 0, H = 0, VH = 0, q = 1, handy = false, pad = 20, ab = 32, zonen = [], ziel = { x: 0, y: 0 }, zielY = 0;
  var wurzeln = [], zielwurzel = null, testWert = null, testLicht = null, sichtbar = true, letzteFront = null, letztePal = '', pal = null;

  function klemme(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function sanft(t) { t = klemme(t, 0, 1); return t * t * (3 - 2 * t); }
  function relativ(el) { var s = sektion.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; }
  /* Licht: nachts vom Mond (links, 24 %), sonst von der Sonne (Mitte) – beide links der rechten und rechts der linken Wurzel */
  function lichtX() { return W * S.mondU; }
  function naehe(x) { return Math.exp(-Math.pow((x - lichtX()) / (W * 0.32), 2)); }

  /* ---------- Sperrzonen: alles, was frei bleiben muss, plus Abstand ---------- */
  function zonenMessen() {
    zonen = [];
    var liste = [form, sektion.querySelector('.contact__person'), sektion.querySelector('#kontakt-titel'), sektion.querySelector('.contact__intro'), sektion.querySelector('.contact__meta'), sektion.querySelector('.agentur__text')];
    liste.forEach(function (el) { if (!el) return; var r = relativ(el); if (r.w < 1 || r.h < 1) return; zonen.push({ x: r.x - ab, y: r.y - ab, w: r.w + 2 * ab, h: r.h + 2 * ab, name: el.id || el.className }); });
    /* die Buchstaben „ERGUN“ ohne den Punkt – der Punkt ist das Ziel der feinen Wurzel */
    var m = relativ(marke), p = relativ(punkt);
    zonen.push({ x: m.x - ab, y: m.y - ab, w: Math.max(1, p.x - m.x) + 2 * ab, h: m.h + 2 * ab, marke: true, name: 'marke' });
    ziel = { x: p.x + p.w / 2, y: p.y + p.h * 0.66 };
    zielY = ziel.y;
  }
  /* erlaubte x-Lage auf Höhe y für eine Wurzel der Seite (−1 links, +1 rechts): aus Zonen nach außen schieben; null = kein Platz */
  function frei(x, y, seite, ohneMarke) {
    for (var i = 0; i < zonen.length; i++) {
      var z = zonen[i];
      if (ohneMarke && z.marke) continue;
      if (y < z.y || y > z.y + z.h) continue;
      if (x > z.x && x < z.x + z.w) x = seite < 0 ? z.x : z.x + z.w;
    }
    if (x < pad + 4 || x > W - pad - 4) return null;
    return x;
  }

  /* ---------- Wurzel-Bahnen (deterministisch) ---------- */
  /* Bahn ab (x0,y0): leichtes Rauschen, kleine Knicke, immer abwärts; weicht Sperrzonen nach außen aus, endet ohne Platz */
  function bahn(x0, y0, laenge, seite, r, winkel, neigung) {
    var schritt = handy ? 6 : 8, n = Math.max(2, Math.round(laenge / schritt)), px = [x0], py = [y0], w = winkel, blockiert = false;
    /* Winkel = Grundrichtung + begrenztes, weiches Rauschen (Wellen, kein Davonlaufen) + abklingender Knick + Ausweichen */
    var ra = S.rauschen(256, 0.55, r), richtung = Math.PI / 2 + neigung, knick = 0, weich = 0, start = winkel - richtung;
    for (var i = 1; i <= n; i++) {
      knick *= 0.96; weich *= 0.9;
      if (r() < 0.012) knick += (r() - 0.5) * 0.9;                             /* seltener kleiner Knick, wächst sich aus */
      w = richtung + start * Math.exp(-i / 12) + ra[i % 256] * 0.3 + knick + weich;
      w = klemme(w, Math.PI / 2 - 0.85, Math.PI / 2 + 0.85);
      var x = px[i - 1] + Math.cos(w) * schritt, y = py[i - 1] + Math.sin(w) * schritt;
      /* Vorausschau: droht ein paar Schritte weiter eine Sperrzone, schon jetzt weich nach außen biegen */
      var vx = x + Math.cos(w) * schritt * 6, vy = y + Math.sin(w) * schritt * 6, fv = frei(vx, vy, seite);
      if (fv !== null && fv !== vx) weich = klemme(weich - seite * 0.12, -0.7, 0.7);
      var fx = frei(x, y, seite);
      if (fx === null) { blockiert = true; break; }
      if (fx !== x) { x = fx; weich = -seite * 0.5; }                          /* Notfall: an der Zone entlang nach außen */
      px.push(x); py.push(y);
    }
    glaetten(px, py, 2);
    return { px: px, py: py, blockiert: blockiert };
  }
  /* zweimal [1 2 1]/4 über die Stützpunkte: nimmt den Ecken die Härte, Enden bleiben */
  function glaetten(px, py, mal) {
    for (var m = 0; m < mal; m++) {
      var ax = px.slice(), ay = py.slice();
      for (var i = 1; i < px.length - 1; i++) { px[i] = (ax[i - 1] + 2 * ax[i] + ax[i + 1]) / 4; py[i] = (ay[i - 1] + 2 * ay[i] + ay[i + 1]) / 4; }
    }
  }
  function wurzelAnlegen(b, art, d0, r, eltern, s0) {
    var n = b.px.length, s = [0], nx = [], ny = [];
    for (var i = 1; i < n; i++) s[i] = s[i - 1] + Math.hypot(b.px[i] - b.px[i - 1], b.py[i] - b.py[i - 1]);
    for (i = 0; i < n; i++) {
      var a = Math.max(0, i - 1), c = Math.min(n - 1, i + 1), dx = b.px[c] - b.px[a], dy = b.py[c] - b.py[a], l = Math.hypot(dx, dy) || 1;
      nx[i] = -dy / l; ny[i] = dx / l;                                         /* Normale: zeigt nach links (Westen) */
    }
    var len = s[n - 1] || 1, rausch = S.rauschen(64, 0.6, r), d = [];
    for (i = 0; i < n; i++) d[i] = d0 * Math.pow(1 - s[i] / len, 0.85) * (0.9 + 0.2 * (rausch[Math.round(i / (n - 1) * 63)] * 0.5 + 0.5)) + 0.35;
    var wu = { px: b.px, py: b.py, nx: nx, ny: ny, s: s, d: d, len: len, art: art, d0: d0, eltern: eltern || null, s0: s0 || 0, L: 0, lit: 0, blockiert: b.blockiert };
    wu.lit = lichtX() < b.px[0] ? 1 : -1;                                       /* Licht auf der Normalen-Seite (+) oder gegenüber */
    wurzeln.push(wu);
    return wu;
  }
  function punktBei(wu, sWert) {
    var i = 1; while (i < wu.s.length - 1 && wu.s[i] < sWert) i++;
    var t = (sWert - wu.s[i - 1]) / ((wu.s[i] - wu.s[i - 1]) || 1);
    return { x: wu.px[i - 1] + (wu.px[i] - wu.px[i - 1]) * t, y: wu.py[i - 1] + (wu.py[i] - wu.py[i - 1]) * t, i: i };
  }
  function tangente(wu, i) { var a = Math.max(0, i - 1), c = Math.min(wu.px.length - 1, i + 1); return Math.atan2(wu.py[c] - wu.py[a], wu.px[c] - wu.px[a]); }

  function seitenwurzeln(haupt, seite, r, anzahl, lang) {
    for (var k = 0; k < anzahl; k++) {
      var sAb = haupt.len * (0.1 + 0.72 * (k + r() * 0.8) / anzahl), p = punktBei(haupt, sAb), t = tangente(haupt, p.i);
      var richtung = (k % 2 === 0 ? -seite : seite) * (0.55 + r() * 0.5);        /* abwechselnd nach außen und innen */
      var b = bahn(p.x, p.y, lang[0] + r() * lang[1], seite, r, t + richtung, richtung * 0.5);
      if (b.px.length < 4) continue;
      var sw = wurzelAnlegen(b, 1, Math.max(1.6, haupt.d0 * (0.3 + r() * 0.2)), r, haupt, sAb);
      haare(sw, r, 2 + Math.floor(r() * 2));
    }
  }
  function haare(eltern, r, anzahl) {
    var n = eltern.px.length - 1;
    for (var k = 0; k < anzahl; k++) {
      var i = Math.max(1, n - Math.floor(r() * Math.min(6, n))), t = tangente(eltern, i);
      var b = bahn(eltern.px[i], eltern.py[i], (handy ? 7 : 9) + r() * (handy ? 12 : 18), eltern.px[i] < W / 2 ? -1 : 1, r, t + (r() - 0.5) * 1.4, 0);
      if (b.px.length < 3) continue;
      wurzelAnlegen(b, 2, 1.1, r, eltern, eltern.s[i]);
    }
  }
  /* feine Wurzel zum Punkt von „ERGUN.“ – von der nächsten rechten Wurzel, leicht gebogen, Zonen (außer Marke) ausweichend */
  function zielwurzelAnlegen(r) {
    var beste = null, bd = 1e9, wunsch = ziel.y - (handy ? 200 : 320);
    wurzeln.forEach(function (wu) {
      if (wu.art > 1 || wu.px[0] < W / 2) return;
      for (var i = 0; i < wu.px.length - 2; i++) {                            /* nie der letzte Punkt (dort wächst nichts mehr nach) */
        var dd = Math.abs(wu.py[i] - wunsch) + Math.max(0, wu.px[i] - ziel.x - W * 0.3) * 0.5;
        if (wu.py[i] < ziel.y - 60 && dd < bd) { bd = dd; beste = { wu: wu, i: i }; }
      }
    });
    if (!beste) return null;
    var wu = beste.wu, i = beste.i, x0 = wu.px[i], y0 = wu.py[i], n = 14, px = [x0], py = [y0];
    var dx = ziel.x - x0, dy = ziel.y - y0, l = Math.hypot(dx, dy) || 1, nxn = -dy / l, nyn = dx / l, bogen = Math.min(70, l * 0.22) * (dx < 0 ? 1 : -1);
    for (var k = 1; k <= n; k++) {
      var t = k / n, e = sanft(t), x = x0 + dx * e, y = y0 + dy * e;
      var seitlich = Math.sin(t * Math.PI) * bogen + (r() - 0.5) * 10 * (1 - t);   /* Bogen über der Geraden: kommt von schräg oben in den Punkt */
      x += nxn * seitlich; y += nyn * seitlich;
      if (k < n) { var fx = frei(x, y, 1, true); if (fx !== null && fx !== x) x = fx; }
      if (y < py[k - 1] + 0.5) y = py[k - 1] + 0.5;
      px.push(k === n ? ziel.x : x); py.push(k === n ? ziel.y : y);
    }
    return wurzelAnlegen({ px: px, py: py, blockiert: false }, 3, handy ? 1.8 : 2.4, r, wu, wu.s[i]);
  }

  function bauen() {
    W = sektion.clientWidth; H = sektion.offsetHeight; VH = window.innerHeight || 800;
    handy = W < 700; q = Math.min(window.devicePixelRatio || 1, 2);
    pad = parseFloat(getComputedStyle(sektion).paddingLeft) || 20; ab = handy ? EINST.abstandHandy : EINST.abstand;
    zonenMessen();
    wurzeln = []; zielwurzel = null;
    var r = S.zufall(20260927), d0 = handy ? EINST.dickeHandy : EINST.dicke, f = relativ(form);
    [-1, 1].forEach(function (seite) {
      var x0 = W * (seite < 0 ? (handy ? 0.17 : 0.13) : (handy ? 0.83 : 0.87)) + (r() - 0.5) * W * 0.03, y0 = 10 + r() * 10;
      var b = bahn(x0, y0, zielY - y0, seite, r, Math.PI / 2 + (r() - 0.5) * 0.3, seite * 0.1);
      var haupt = wurzelAnlegen(b, 0, d0, r);
      seitenwurzeln(haupt, seite, r, 3 + Math.floor(r() * 3), handy ? [40, 60] : [80, 130]);
      haare(haupt, r, 3);
      /* kein Platz neben dem Formular: die Wurzel endet oben und taucht erst unter dem Formular wieder auf (zur Fußzeile hin) */
      if (haupt.blockiert && haupt.py[haupt.py.length - 1] < f.y + f.h) {
        var yu = f.y + f.h + ab + 6, xu = seite < 0 ? pad + 8 + r() * 24 : W - pad - 8 - r() * 24;
        var bu = bahn(xu, yu, zielY + 40 - yu, seite, r, Math.PI / 2 + seite * 0.4, seite * 0.18);   /* vom Rand leicht nach innen */
        if (bu.px.length > 4) {
          var unten = wurzelAnlegen(bu, 0, d0 * 0.55, r);
          for (var i = 0; i < unten.d.length; i++) unten.d[i] *= sanft(unten.s[i] / 28);   /* läuft weich an, als käme sie unter dem Formular hervor */
          seitenwurzeln(unten, seite, r, 2, handy ? [26, 40] : [50, 90]); haare(unten, r, 2);
        }
      }
    });
    zielwurzel = zielwurzelAnlegen(r);
    /* Reihenfolge: erst Eltern, dann Kinder (Wachstum hängt an den Eltern) */
    wurzeln.sort(function (a, b) { return a.art - b.art; });

    leinwand.width = Math.ceil(W * q); leinwand.height = Math.ceil(H * q); leinwand.style.height = H + 'px';
    LICHTER.forEach(schnittMalen);
    letzteFront = null; letztePal = '';
    setzen(null, true);
  }

  /* ---------- Erdschnitt (einmal je Lichtstimmung) ---------- */
  function schnittMalen(licht) {
    var c = schnitte[licht], p = E[licht], SH = Math.round(klemme(VH * EINST.schnitt, 240, 520)), r = S.zufall(777);
    c.width = Math.ceil(W * q); c.height = Math.ceil(SH * q); c.style.height = SH + 'px';
    var k = c.getContext('2d'); k.setTransform(q, 0, 0, q, 0, 0);
    /* Grund: aus dem Dunkel des Titelbilds in den Mutterboden, tief unten in den Seitenhintergrund */
    var gr = k.createLinearGradient(0, 0, 0, SH);
    gr.addColorStop(0, OBEN); gr.addColorStop(0.06, S.mixHex(OBEN, p.humus, 0.5)); gr.addColorStop(0.13, p.humus); gr.addColorStop(0.3, p.humus); gr.addColorStop(0.5, p.unter); gr.addColorStop(1, BG);
    k.fillStyle = gr; k.fillRect(0, 0, W, SH);
    /* Schichten: drei unruhige Grenzen, Bänder halbdurchsichtig, an der Grenze ein feiner heller Saum (wie die Gesteinsschichten der Berge) */
    var grenzen = [0.17, 0.29, 0.41].map(function (t, i) { var ra = S.rauschen(256, 0.62, S.zufall(300 + i)); return { t: t, ra: ra, neig: (r() - 0.5) * 0.03 }; });
    function gy(gz, x) { return SH * gz.t + gz.neig * (x - W / 2) + gz.ra[Math.round(x / W * 255)] * SH * 0.018; }
    var farben = [[p.schicht, 0.4], [p.unter, 0.55], [p.schicht, 0.28]];
    grenzen.forEach(function (gz, i) {
      k.beginPath(); k.moveTo(-2, gy(gz, 0));
      for (var x = 0; x <= W + 2; x += 4) k.lineTo(x, gy(gz, Math.min(W, x)));
      k.lineTo(W + 2, SH + 2); k.lineTo(-2, SH + 2); k.closePath();
      k.fillStyle = S.rgba(farben[i][0], farben[i][1]); k.fill();
      k.beginPath(); for (x = 0; x <= W; x += 4) { var yy = gy(gz, x) - 0.5; if (x === 0) k.moveTo(x, yy); else k.lineTo(x, yy); }
      k.strokeStyle = S.rgba(p.hell, licht === 'nacht' ? 0.14 : 0.18); k.lineWidth = 1; k.stroke();
    });
    /* Steine im Mutterboden: unregelmäßig, Lichtseite oben, Schatten darunter (wie auf der Wiese) */
    var st = F.stein[licht], nSt = Math.round(10 * W / 1440) + 3;
    for (var i = 0; i < nSt; i++) {
      var sx = r() * W, sy = SH * (0.07 + r() * 0.34), w = 3 + r() * 7, h = w * (0.5 + r() * 0.35), sr = S.zufall(Math.floor(r() * 1e9));
      k.fillStyle = 'rgba(0,0,0,0.3)'; k.beginPath(); k.ellipse(sx, sy + h * 0.7, w * 0.7, h * 0.3, 0, 0, Math.PI * 2); k.fill();
      k.beginPath();
      for (var j = 0; j <= 7; j++) { var a = j / 7 * Math.PI * 2; var rx = w * (0.42 + sr() * 0.16), ry = h * (0.55 + sr() * 0.3); if (j === 0) k.moveTo(sx + Math.cos(a) * rx, sy + Math.sin(a) * ry); else k.lineTo(sx + Math.cos(a) * rx, sy + Math.sin(a) * ry); }
      k.closePath(); k.fillStyle = st[0]; k.fill();
      k.save(); k.clip(); k.fillStyle = S.rgba(st[1], licht === 'tag' ? 0.5 : 0.3 + naehe(sx) * 0.3); k.fillRect(sx - w, sy - h * 1.5, w * 2, h * 0.75); k.restore();
    }
    /* Graswurzel-Härchen direkt unter den Halmen: feine, spitz zulaufende Fäden ins Dunkel hinein */
    var nH = Math.round(W * 0.2);
    for (i = 0; i < nH; i++) {
      var hx = r() * W, hy = r() * 5, hl = 4 + r() * (r() < 0.2 ? 30 : 16), lean = (r() - 0.5) * 0.5, hb = 0.5 + r() * 0.5;
      k.fillStyle = S.rgba(p.hell, (licht === 'nacht' ? 0.12 : 0.2) + r() * (licht === 'nacht' ? 0.16 : 0.26));
      k.beginPath(); k.moveTo(hx - hb, hy); k.quadraticCurveTo(hx + lean * hl * 0.4, hy + hl * 0.5, hx + lean * hl, hy + hl); k.quadraticCurveTo(hx + lean * hl * 0.4 + hb * 0.3, hy + hl * 0.5, hx + hb, hy); k.closePath(); k.fill();
    }
    /* Körnung wie im Titelbild */
    k.save(); k.globalAlpha = licht === 'nacht' ? 0.05 : 0.07; k.fillStyle = k.createPattern(S.korn, 'repeat'); k.fillRect(0, 0, W, SH); k.restore();
    /* langer Verlauf in den Seitenhintergrund (30–40 % Bildschirmhöhe) */
    var vg = k.createLinearGradient(0, SH * 0.36, 0, SH); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, BG);
    k.fillStyle = vg; k.fillRect(0, SH * 0.36, W, SH * 0.64);
  }

  /* ---------- Licht: Palette live mischen, Erdschnitt überblenden ---------- */
  function lichtMix() {
    if (testLicht) return { tag: testLicht === 'tag' ? 1 : 0, gold: testLicht === 'gold' ? 1 : 0, nacht: testLicht === 'nacht' ? 1 : 0 };
    return S.lichtMix();
  }
  function paletteMischen(mx) {
    var out = {}, gold = klemme(mx.gold, 0, 1), nacht = klemme(mx.nacht, 0, 1);
    Object.keys(E.tag).forEach(function (kk) {
      if (typeof E.tag[kk] === 'number') { out[kk] = E.tag[kk] + (E.gold[kk] - E.tag[kk]) * gold; out[kk] += (E.nacht[kk] - out[kk]) * nacht; }
      else out[kk] = S.mixHex(S.mixHex(E.tag[kk], E.gold[kk], gold), E.nacht[kk], nacht);
    });
    return out;
  }
  function lichtSetzen() {
    var mx = lichtMix();
    schnitte.tag.style.opacity = mx.tag; schnitte.gold.style.opacity = mx.gold.toFixed(3); schnitte.nacht.style.opacity = mx.nacht.toFixed(3);
    var schluessel = mx.gold.toFixed(2) + '/' + mx.nacht.toFixed(2);
    if (schluessel === letztePal) return false;
    letztePal = schluessel; pal = paletteMischen(mx);
    return true;
  }

  /* ---------- Wurzeln malen ---------- */
  /* Länge, bis zu der eine Wurzel bei Front fy gewachsen ist (Wurzeln laufen abwärts, y steigt entlang der Bahn) */
  function laengeBis(wu, fy) {
    if (fy <= wu.py[0]) return 0;
    var n = wu.py.length;
    if (fy >= wu.py[n - 1]) return wu.len;
    for (var i = 1; i < n; i++) if (wu.py[i] > fy) { var t = (fy - wu.py[i - 1]) / ((wu.py[i] - wu.py[i - 1]) || 1); return wu.s[i - 1] + (wu.s[i] - wu.s[i - 1]) * t; }
    return wu.len;
  }
  /* gefülltes Band entlang der Bahn zwischen den Breiten-Anteilen a und b (−0,5 … 0,5 der Dicke) */
  function band(P, N, D, bis, a, b) {
    g.beginPath();
    for (var i = 0; i <= bis; i++) { var x = P[0][i] + N[0][i] * D[i] * a, y = P[1][i] + N[1][i] * D[i] * a; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    for (i = bis; i >= 0; i--) g.lineTo(P[0][i] + N[0][i] * D[i] * b, P[1][i] + N[1][i] * D[i] * b);
    g.closePath(); g.fill();
  }
  function wurzelMalen(wu, L) {
    var n = wu.px.length, k = 0; while (k < n - 1 && wu.s[k + 1] <= L) k++;
    var t = k < n - 1 ? (L - wu.s[k]) / ((wu.s[k + 1] - wu.s[k]) || 1) : 0;
    var PX = wu.px.slice(0, k + 1), PY = wu.py.slice(0, k + 1), NX = wu.nx.slice(0, k + 1), NY = wu.ny.slice(0, k + 1), D = [];
    if (k < n - 1 && t > 0.02) { PX.push(wu.px[k] + (wu.px[k + 1] - wu.px[k]) * t); PY.push(wu.py[k] + (wu.py[k + 1] - wu.py[k]) * t); NX.push(wu.nx[k + 1]); NY.push(wu.ny[k + 1]); }
    var bis = PX.length - 1, spitze = EINST.spitze[wu.art];
    for (var i = 0; i <= bis; i++) { var s = i < n ? wu.s[Math.min(i, k)] : L; if (i === bis && i > k) s = L; D[i] = (i < wu.d.length ? wu.d[Math.min(i, n - 1)] : wu.d[n - 1]) * sanft((L - s) / spitze); }
    if (bis < 1) return;
    var P = [PX, PY], N = [NX, NY];
    if (wu.art === 2) { g.fillStyle = S.rgba(pal.haar, 0.8); band(P, N, D, bis, -0.5, 0.5); return; }
    g.fillStyle = pal.wurzel; band(P, N, D, bis, -0.5, 0.5);
    /* Schattenseite (vom Licht abgewandt) und Lichtkante (zum Mond hin), beides innerhalb des Umrisses */
    var lit = wu.lit;
    g.fillStyle = S.rgba(pal.schatten, 0.6); band(P, N, D, bis, -lit * 0.5, -lit * 0.5 + lit * 0.34);
    var a = pal.kanteA * (0.25 + 0.55 * naehe(wu.px[0])) * (wu.art === 3 ? 0.6 : 0.85);
    g.fillStyle = S.rgba(pal.wurzelKante, a); band(P, N, D, bis, lit * 0.5 - lit * 0.17, lit * 0.5);
    /* Rinde: zwei zarte Längslinien, nur auf den dicken Teilen */
    if (wu.d0 >= 5) {
      var dick = 0; while (dick < bis && D[dick + 1] > 4.2) dick++;
      if (dick > 2) { g.fillStyle = S.rgba(pal.schatten, 0.38); band(P, N, D, dick, -0.2, -0.15); band(P, N, D, dick, 0.12, 0.16); }
    }
  }
  function verdickung(wu) {
    /* kleine Verdickung an der Abzweigung, sobald das Kind wächst */
    var e = wu.eltern, p = punktBei(e, wu.s0), de = e.d[Math.min(p.i, e.d.length - 1)];
    if (de < 3) return;
    g.fillStyle = pal.wurzel; g.beginPath(); g.ellipse(wu.px[0], wu.py[0], de * 0.5, de * 0.36, tangente(wu, 0), 0, Math.PI * 2); g.fill();
  }
  var fertigGezeigt = false;
  function malen(fy) {
    g.setTransform(q, 0, 0, q, 0, 0); g.clearRect(0, 0, W, H);
    var fertig = false;
    for (var i = 0; i < wurzeln.length; i++) {
      var wu = wurzeln[i], L = laengeBis(wu, fy - EINST.versatz[wu.art]);
      if (wu.eltern && wu.eltern.L < Math.min(wu.s0 + 2, wu.eltern.len - 0.5)) L = 0;   /* erst, wenn die Elternwurzel die Abzweigung erreicht hat */
      wu.L = L;
      if (L < 1) continue;
      if (wu.eltern && wu.art !== 2) verdickung(wu);
      wurzelMalen(wu, L);
      if (wu === zielwurzel && L >= wu.len - 0.5) fertig = true;
    }
    if (fertig !== fertigGezeigt) { fertigGezeigt = fertig; punkt.classList.toggle('dot--glueht', fertig); }
    if (TEST && zeigeZonen) { g.strokeStyle = 'rgba(255,60,60,0.85)'; g.lineWidth = 1; zonen.forEach(function (z) { g.strokeRect(z.x, z.y, z.w, z.h); }); g.fillStyle = 'rgba(255,60,60,0.9)'; g.beginPath(); g.arc(ziel.x, ziel.y, 3, 0, Math.PI * 2); g.fill(); }
  }

  /* Front aus dem Scrollwert (gleiche Quelle und Glättung wie Sonne/Mond); ganz unten erreicht sie sicher den Punkt */
  function setzen(weichY, erzwingen) {
    if (!wurzeln.length) return;
    var fy;
    if (testWert !== null) fy = -20 + (zielY + 90) * testWert;
    else if (ruhig) fy = zielY + 200;
    else {
      var y = weichY == null ? (window.pageYOffset || 0) : weichY;
      var s = sektion.getBoundingClientRect(), obenDok = s.top + (window.pageYOffset || 0);
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - VH);
      var kf = Math.max(EINST.front, (obenDok + zielY + 100 - maxScroll) / VH);
      fy = y + VH * kf - obenDok;
    }
    fy = Math.round(fy * 2) / 2;
    var lichtNeu = lichtSetzen();
    if (!erzwingen && fy === letzteFront && !lichtNeu) return;
    letzteFront = fy;
    malen(fy);
  }

  /* gemeinsamer Takt aus js/szene.js (läuft nur beim Scrollen) */
  var vorher = window.ergunTakt;
  window.ergunTakt = function (weichY, lp) { if (vorher) vorher(weichY, lp); if (sichtbar) setzen(weichY, false); };
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) setzen(null, true); }, { rootMargin: '240px 0px' }).observe(sektion);

  var rt, breite = 0;
  function neu() { clearTimeout(rt); rt = setTimeout(bauen, 180); }
  window.addEventListener('resize', function () { if (window.innerWidth !== breite || Math.abs(sektion.offsetHeight - H) > 40) { breite = window.innerWidth; neu(); } });
  if ('ResizeObserver' in window) new ResizeObserver(function () { if (Math.abs(sektion.offsetHeight - H) > 4) neu(); }).observe(form);
  breite = window.innerWidth;
  if (document.readyState === 'complete') bauen(); else window.addEventListener('load', bauen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(neu);

  /* ---------- Test ---------- */
  var zeigeZonen = false;
  if (TEST) {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99;display:grid;gap:6px;padding:10px;background:rgba(0,0,0,.7);color:#fff;font:12px system-ui;border-radius:8px';
    box.innerHTML = '<label>Wachstum <input type="range" min="0" max="1000" value="0" data-w style="width:min(60vw,300px);vertical-align:middle"></label>' +
      '<label>Licht <select data-l><option value="">Auto (Seite)</option><option value="tag">Tag</option><option value="gold">Gold</option><option value="nacht">Nacht</option></select></label>' +
      '<label><input type="checkbox" data-z> Sperrzonen zeigen</label>';
    document.body.appendChild(box);
    box.querySelector('[data-w]').addEventListener('input', function () { testWert = this.value / 1000; setzen(null, true); });
    box.querySelector('[data-l]').addEventListener('change', function () { testLicht = this.value || null; letztePal = ''; setzen(null, true); });
    box.querySelector('[data-z]').addEventListener('change', function () { zeigeZonen = this.checked; setzen(null, true); });
    window.__wurzeln = { setzen: function (v) { testWert = v; setzen(null, true); }, licht: function (l) { testLicht = l || null; letztePal = ''; setzen(null, true); }, zonen: function (an) { zeigeZonen = !!an; setzen(null, true); },
      liste: function () { return wurzeln.map(function (w) { return { art: w.art, n: w.px.length, x0: Math.round(w.px[0]), y0: Math.round(w.py[0]), ende: Math.round(w.py[w.py.length - 1]), len: Math.round(w.len), L: Math.round(w.L), s0: Math.round(w.s0), blockiert: w.blockiert }; }); },
      stand: function () { return { wurzeln: wurzeln.length, blockiert: wurzeln.filter(function (w) { return w.blockiert; }).length, ziel: zielwurzel ? zielwurzel.L / zielwurzel.len : null, glueht: fertigGezeigt, zonen: zonen.length, front: letzteFront, zielY: zielY }; } };
  }
})();
