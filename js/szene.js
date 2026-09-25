/* ERGUN. Startbild (25.09.2026): gezeichnete Landschaft statt Foto-Ebenen.
   Jede Ebene wird beim Laden einmal in drei Lichtstimmungen gezeichnet (Tag, Goldene Stunde, Mondnacht).
   Beim Scrollen wird nur überblendet und verschoben (opacity/transform), nichts neu gezeichnet –
   außer dem kleinen Hund, der nachts den Kopf hebt.

   Ablauf über p = gescrollte Strecke / Höhe des Startbilds:
   0      Tag, Sonne mittig oben
   0,06   Goldene Stunde beginnt, Sonne sinkt senkrecht (wie in der ersten Untergangs-Version vom 25.09. 00:22)
   0,26   Sonne verschwindet mittig hinter dem Bergkamm
   0,20–0,44  blaue Stunde → Nacht, Mond steigt links auf, zuerst die hellsten Sterne
   0,40–0,58  der Hund hebt den Kopf
   Seitenlicht: Hänge, die zur Sonne (bzw. nachts zum Mond) zeigen, werden heller, die abgewandten dunkler. */
(function () {
  var held = document.querySelector('[data-szene]');
  if (!held) return;
  var buehne = held.querySelector('.szene__buehne');
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LICHTER = ['tag', 'gold', 'nacht'];

  /* ---------- Werkzeuge ---------- */
  function zufall(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sanft(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgba(h, a) { var c = hex(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? 1 : a) + ')'; }
  function mixHex(h1, h2, t) { var a = hex(h1), b = hex(h2); return '#' + [0, 1, 2].map(function (i) { return ('0' + Math.round(mix(a[i], b[i], t)).toString(16)).slice(-2); }).join(''); }
  function farbMix(h1, h2, t) { var a = hex(h1), b = hex(h2); return 'rgb(' + Math.round(mix(a[0], b[0], t)) + ',' + Math.round(mix(a[1], b[1], t)) + ',' + Math.round(mix(a[2], b[2], t)) + ')'; }
  function variiere(h, r, s) { var c = hex(h), d = (r() - 0.5) * 2 * s; return 'rgb(' + Math.round(Math.min(255, Math.max(0, c[0] * (1 + d)))) + ',' + Math.round(Math.min(255, Math.max(0, c[1] * (1 + d * 1.1)))) + ',' + Math.round(Math.min(255, Math.max(0, c[2] * (1 + d * 0.8)))) + ')'; }

  /* Rauschen durch Mittelpunkt-Verschiebung: natürliche, unregelmäßige Kammlinien */
  function rauschen(n, rau, r) {
    var a = new Float32Array(n + 1), schritt = n, amp = 1;
    a[0] = r() * 2 - 1; a[n] = r() * 2 - 1;
    while (schritt > 1) {
      var h = schritt >> 1;
      for (var i = h; i < n; i += schritt) a[i] = (a[i - h] + a[i + h]) / 2 + (r() * 2 - 1) * amp;
      amp *= rau; schritt = h;
    }
    return a;
  }
  /* Kamm als Funktion der Weltkoordinate u (0–1) → Höhe in Anteilen der Bildhöhe (0 = oben) */
  function kamm(opt) {
    var r = zufall(opt.saat), N = 1024, a = new Float32Array(N + 1);
    var fein = rauschen(N, opt.rau || 0.52, r), grob = rauschen(N, 0.62, zufall(opt.saat * 7 + 1));
    var hmax = 0.0001, alle = opt.gipfel.slice();
    opt.gipfel.forEach(function (g) {
      if (Math.abs(g[0] - 0.5) < 0.12) return;
      for (var k = 0; k < (opt.neben || 0); k++) alle.push([g[0] + (r() - 0.5) * g[2] * 1.6, g[1] * (0.35 + r() * 0.45), g[2] * (0.2 + r() * 0.3), 1 + r() * 0.8]);
    });
    for (var i = 0; i <= N; i++) {
      var u = i / N, y = 0;
      alle.forEach(function (g) { var v = g[1] * Math.pow(Math.max(0, 1 - Math.abs(u - g[0]) / g[2]), g[3] || 1.4); if (v > y) y = v; });
      y += (opt.wellen || 0) * grob[i];
      a[i] = y; if (y > hmax) hmax = y;
    }
    for (var k = 0; k <= N; k++) a[k] = opt.basis - a[k] - opt.fein * fein[k] * (0.45 + 0.55 * Math.max(0, a[k]) / hmax);
    return { y: function (u) { var f = Math.min(N, Math.max(0, u * N)), i0 = Math.floor(f), t = f - i0; return i0 >= N ? a[N] : a[i0] * (1 - t) + a[i0 + 1] * t; }, hmax: hmax, basis: opt.basis };
  }

  /* ---------- Farben je Lichtstimmung (von hinten nach vorne dunkler und satter: Luftperspektive) ---------- */
  var F = {
    fern: {
      tag: { grund: '#90A9C4', dunst: '#C9DAEA', hell: '#B9CCE0', schatten: '#7A91AE', kante: '#FFFFFF', kanteA: 0.35, schneeH: '#F4F7FB', schneeS: '#C6D3E4', schicht: '#6E86A3' },
      gold: { grund: '#9B7D95', dunst: '#E8AE8C', hell: '#EDB896', schatten: '#7C6583', kante: '#FFD9A2', kanteA: 0.9, schneeH: '#FFE3C6', schneeS: '#B598B3', schicht: '#7C627F' },
      nacht: { grund: '#28344F', dunst: '#33425F', hell: '#3E4E70', schatten: '#1D2740', kante: '#A9BBDD', kanteA: 0.55, schneeH: '#B8C6E2', schneeS: '#55678E', schicht: '#1E2942' }
    },
    mitte: {
      tag: { grund: '#6C8BA6', dunst: '#A2BCD1', hell: '#89A6BE', schatten: '#57738F', kante: '#FFFFFF', kanteA: 0.22, schicht: '#4E6882' },
      gold: { grund: '#6D5570', dunst: '#C08A7A', hell: '#C48B73', schatten: '#564362', kante: '#FFC98C', kanteA: 0.8, schicht: '#4F3D58' },
      nacht: { grund: '#1B2539', dunst: '#26334B', hell: '#2C3B59', schatten: '#141C2E', kante: '#8398C4', kanteA: 0.45, schicht: '#131A2A' }
    },
    huegel: {
      tag: { grund: '#4E6F64', dunst: '#86A39A', hell: '#628376', schatten: '#3F5B54', kante: '#E8F2DA', kanteA: 0.2, baum: '#3D5E52' },
      gold: { grund: '#4A3D4E', dunst: '#8E6468', hell: '#7E5B58', schatten: '#3A3042', kante: '#F5B47C', kanteA: 0.75, baum: '#3D3244' },
      nacht: { grund: '#131C2B', dunst: '#1C283A', hell: '#1F2C42', schatten: '#0E1522', kante: '#7189B8', kanteA: 0.4, baum: '#101826' }
    },
    wald: {
      tag: { boden: '#3B5936', baeume: ['#26402F', '#2C4634', '#213A2C', '#30503A'], laub: ['#3C5A2E', '#44622F'], kante: '#D9EFC0', kanteA: 0.4 },
      gold: { boden: '#3A2F2A', baeume: ['#2A2430', '#2E2733', '#262029', '#322A34'], laub: ['#3A2E2C', '#43332D'], kante: '#FFB46E', kanteA: 0.95 },
      nacht: { boden: '#0F1620', baeume: ['#0B111B', '#0D141F', '#0A0F18', '#101722'], laub: ['#0E1519', '#11191D'], kante: '#6E86B8', kanteA: 0.34 }
    },
    wiese: {
      tag: { oben: '#78994A', unten: '#5B7B36', halm: ['#88A955', '#6A8C3E', '#5A7A33', '#94B35E'], kante: '#E9F5C6', kanteA: 0.3 },
      gold: { oben: '#57492D', unten: '#3E3424', halm: ['#6B5632', '#5A4A2C', '#4B3F28', '#7A6238'], kante: '#FFBE74', kanteA: 0.85 },
      nacht: { oben: '#141D22', unten: '#0D1418', halm: ['#1A262C', '#151F25', '#1D2A30', '#121B20'], kante: '#5A72A0', kanteA: 0.5 }
    },
    gras: {
      tag: { halm: ['#4E7A2D', '#5F8A36', '#6F9A40', '#83AA4E', '#3F6726'], kante: '#F2FAD0', kanteA: 0.35 },
      gold: { halm: ['#2F2A1C', '#3A3322', '#453B26', '#2A2519', '#4F4229'], kante: '#FFC47E', kanteA: 0.95 },
      nacht: { halm: ['#0A1216', '#0E181C', '#121E23', '#0B1418', '#15232A'], kante: '#5E78A8', kanteA: 0.55 }
    },
    hund: { tag: '#231E1A', gold: '#17120F', nacht: '#07090E', kanteTag: '#9C7B55', kanteGold: '#FFB870', kanteNacht: '#8FA4D0' }
  };

  /* ---------- Landschaft (Weltkoordinaten u 0–1, Höhen in Anteilen der Bildhöhe) ---------- */
  var KAEMME = {
    /* ferne Kette: zwei Gipfelgruppen links und rechts, mittig ein Sattel, in den die Sonne sinkt */
    fern: kamm({ saat: 11, basis: 0.60, fein: 0.028, rau: 0.68, wellen: 0.016, neben: 3, gipfel: [[0.06, 0.13, 0.16, 1.2], [0.19, 0.2, 0.15, 1.5], [0.29, 0.16, 0.12, 1.4], [0.395, 0.1, 0.1], [0.5, 0.045, 0.12], [0.6, 0.11, 0.1], [0.7, 0.21, 0.14, 1.6], [0.8, 0.17, 0.12, 1.4], [0.93, 0.14, 0.14, 1.3]] }),
    mitte: kamm({ saat: 23, basis: 0.66, fein: 0.022, rau: 0.66, wellen: 0.012, neben: 3, gipfel: [[0.0, 0.09, 0.2], [0.14, 0.12, 0.16, 1.3], [0.33, 0.085, 0.14], [0.47, 0.05, 0.14], [0.58, 0.1, 0.14, 1.3], [0.76, 0.13, 0.15, 1.4], [0.97, 0.1, 0.16]] }),
    huegel: kamm({ saat: 37, basis: 0.72, fein: 0.008, rau: 0.5, wellen: 0.012, gipfel: [[0.1, 0.06, 0.25, 1.1], [0.42, 0.045, 0.22, 1.1], [0.74, 0.065, 0.24, 1.1]] }),
    wald: kamm({ saat: 41, basis: 0.8, fein: 0.006, rau: 0.45, wellen: 0.01, gipfel: [[0.2, 0.035, 0.3, 1.1], [0.85, 0.04, 0.3, 1.1]] }),
    wiese: kamm({ saat: 53, basis: 0.9, fein: 0.004, rau: 0.45, wellen: 0.006, gipfel: [[0.64, 0.05, 0.3, 1.8], [0.1, 0.02, 0.3, 1.2]] })
  };
  /* Tiefe: hinten viel Weg (fast stehend), vorne wenig – so entsteht beim Scrollen die Parallaxe */
  var TIEFE = { himmel: 0.84, fern: 0.74, mitte: 0.62, titel: 0.52, huegel: 0.48, wald: 0.33, wiese: 0.17, gras: 0 };

  var m = {};           /* Maße */
  function messen() {
    var W = buehne.clientWidth, H = buehne.clientHeight;
    var hoch = H > W;
    m = { W: W, H: H, hoch: hoch, ref: Math.max(W, H * (hoch ? 1.05 : 1.5)), q: Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 1.6), f: W < 700 ? 0.82 : 1 };
    m.hundU = hoch ? 0.555 : 0.64;
  }
  function uVon(x) { return 0.5 + (x - m.W / 2) / m.ref; }
  function xVon(u) { return m.W / 2 + (u - 0.5) * m.ref; }
  function ky(k, x) { return KAEMME[k].y(uVon(x)) * m.H; }
  /* tiefster Punkt eines Kamms im Bild = bis dorthin muss die Ebene dahinter reichen */
  function tiefster(k) { var t = 0; for (var x = 0; x <= m.W; x += 4) t = Math.max(t, ky(k, x)); return t; }
  function hoechster(k) { var t = m.H; for (var x = 0; x <= m.W; x += 4) t = Math.min(t, ky(k, x)); return t; }

  /* Leinwand für einen Streifen der Ebene (nur so hoch wie nötig – spart Grafikspeicher) */
  function leinwand(ebene, oben, unten, licht, klasse) {
    var c = document.createElement('canvas'), q = m.q;
    c.width = Math.ceil(m.W * q); c.height = Math.ceil((unten - oben) * q);
    c.style.top = oben + 'px'; c.style.height = (unten - oben) + 'px';
    c.className = 'szene__bild' + (klasse ? ' ' + klasse : '');
    c.setAttribute('data-licht', licht);
    var g = c.getContext('2d');
    g.setTransform(q, 0, 0, q, 0, -oben * q);
    ebene.appendChild(c);
    return g;
  }

  /* feines Korn, damit die Flächen nicht nach Vektor-Standard aussehen */
  var korn = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 160;
    var g = c.getContext('2d'), d = g.createImageData(160, 160), r = zufall(99);
    for (var i = 0; i < d.data.length; i += 4) { var v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
    return c;
  })();
  function kornAuf(g, oben, unten, staerke) {
    g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = staerke;
    g.fillStyle = g.createPattern(korn, 'repeat'); g.fillRect(0, oben, m.W, unten - oben); g.restore();
  }

  /* Richtung des Lichts: Sonne mittig (Tag, Gold), Mond links (Nacht). +1 = Licht kommt von rechts */
  function lichtX(licht, x) {
    if (licht === 'nacht') { var mx = m.W * 0.24; return Math.max(-1, Math.min(1, (mx - x) / (m.W * 0.25))); }
    return Math.max(-1, Math.min(1, (m.W * 0.5 - x) / (m.W * 0.22)));
  }
  /* Nähe zur Lichtquelle (für Streiflicht und Kanten im Gegenlicht) */
  function naehe(licht, x) { var lx = licht === 'nacht' ? m.W * 0.24 : m.W * 0.5; return Math.exp(-Math.pow((x - lx) / (m.W * (licht === 'tag' ? 0.6 : 0.32)), 2)); }

  /* ---------- Berge ---------- */
  function berg(name, ebene, unten, extra) {
    var oben = Math.max(0, hoechster(name) - 4);
    LICHTER.forEach(function (licht) {
      var p = F[name][licht], g = leinwand(ebene, oben, unten, licht), r = zufall(KAEMME[name].basis * 1000 | 0);
      var schritt = 2, tief = unten - oben;
      /* Körper */
      g.beginPath(); g.moveTo(-2, unten + 2);
      for (var x = -2; x <= m.W + 2; x += schritt) g.lineTo(x, ky(name, x));
      g.lineTo(m.W + 2, unten + 2); g.closePath();
      var gr = g.createLinearGradient(0, oben, 0, unten);
      gr.addColorStop(0, p.grund); gr.addColorStop(1, farbMix(p.grund, p.dunst, 0.35));
      g.fillStyle = gr; g.fill();
      g.save(); g.clip();
      /* Hänge im Licht / im Schatten: senkrechte Streifen, unterschiedlich tief (Rinnen, Grate) */
      var rinnen = rauschen(2048, 0.78, zufall(extra.saat)), laenge = rauschen(1024, 0.62, zufall(extra.saat + 3));
      for (x = 0; x <= m.W; x += schritt) {
        var y = ky(name, x), steig = (ky(name, x + 9) - ky(name, x - 9)) / 18;
        var ri = rinnen[Math.min(2047, Math.max(0, Math.round(uVon(x) * 2047)))];
        var an = Math.max(-1, Math.min(1, steig * lichtX(licht, x) * 2.4 + ri * 0.55));
        var n = laenge[Math.min(1023, Math.max(0, Math.round(uVon(x) * 1023)))] * 0.5 + 0.5;
        var lang = tief * (0.12 + 0.7 * n * n + 0.12 * Math.abs(ri)) * (extra.tiefe || 1);
        var farbe = an > 0 ? p.hell : p.schatten, st = Math.abs(an) * (an > 0 ? 0.85 : 0.7) * (licht === 'tag' ? 0.6 : 1);
        if (licht !== 'tag') st *= 0.55 + 0.45 * naehe(licht, x) * (an > 0 ? 1.4 : 1);
        for (var s = 0; s < 3; s++) { g.fillStyle = rgba(farbe, st * (1 - s * 0.3)); g.fillRect(x, y + lang * s / 3, schritt, lang / 3 + 1); }
      }
      /* Gesteinsschichten: leicht geneigte, unruhige Linien parallel zum Kamm */
      if (extra.schichten) {
        g.lineWidth = 1; g.strokeStyle = rgba(p.schicht, licht === 'nacht' ? 0.35 : 0.28);
        for (var k = 1; k <= extra.schichten; k++) {
          var ab = k * tief * 0.075, neig = (r() - 0.5) * 0.06, wel = rauschen(256, 0.6, zufall(extra.saat + k));
          g.beginPath();
          for (x = 0; x <= m.W; x += 4) {
            var yy = ky(name, x) + ab + neig * (x - m.W / 2) + wel[Math.round(x / m.W * 255)] * tief * 0.02;
            if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
          }
          g.stroke();
        }
      }
      /* Schneereste auf den höchsten Gipfeln, auf der Lichtseite heller */
      if (extra.schnee) {
        var linie = KAEMME[name].basis * m.H - KAEMME[name].hmax * m.H * extra.schnee, sn = rauschen(512, 0.55, zufall(extra.saat + 50));
        var snAt = function (u) { var f = Math.min(511, Math.max(0, u * 511)), i0 = Math.floor(f), t = f - i0; return (i0 >= 511 ? sn[511] : sn[i0] * (1 - t) + sn[i0 + 1] * t) * 0.5 + 0.5; };
        for (x = 0; x <= m.W; x += schritt) {
          var yk = ky(name, x), ueber = linie - yk;
          if (ueber <= 0) continue;
          var st2 = (ky(name, x + 6) - ky(name, x - 6)) / 12, an2 = st2 * lichtX(licht, x) * 3;
          var sw = snAt(uVon(x));
          var d = ueber * (0.35 + 2.2 * sw * sw * sw) * (an2 > 0 ? 1.1 : 0.8);
          g.fillStyle = an2 > -0.1 ? p.schneeH : p.schneeS;
          g.globalAlpha = 0.92; g.fillRect(x, yk - 1, schritt, d);
          g.globalAlpha = 0.4; g.fillRect(x, yk + d - 1, schritt, d * 0.35 * snAt(uVon(x) + 0.03));
          g.globalAlpha = 1;
        }
      }
      /* Dunst im Tal: zum unteren Rand hin in die Himmelsfarbe am Horizont */
      var dh = Math.min(tief, m.H * 0.09);
      var dg = g.createLinearGradient(0, unten - dh, 0, unten);
      dg.addColorStop(0, rgba(p.dunst, 0)); dg.addColorStop(1, rgba(p.dunst, licht === 'nacht' ? 0.55 : 0.75));
      g.fillStyle = dg; g.fillRect(0, unten - dh, m.W, dh);
      kornAuf(g, oben, unten, licht === 'nacht' ? 0.05 : 0.07);
      g.restore();
      /* Lichtkante auf dem Grat (im Gegenlicht kräftig, zum Licht hin stärker) */
      kante(g, name, p, licht, 1.2);
    });
  }
  function kante(g, name, p, licht, breite) {
    g.lineWidth = breite; g.lineCap = 'round';
    for (var x = 0; x <= m.W; x += 6) {
      var st = (ky(name, x + 5) - ky(name, x - 5)) / 10, an = Math.max(0, st * lichtX(licht, x) * 3 + (licht === 'tag' ? 0.15 : 0.25));
      var a = p.kanteA * Math.min(1, an) * (licht === 'tag' ? 0.8 : naehe(licht, x) * 0.9 + 0.1);
      if (a < 0.03) continue;
      g.strokeStyle = rgba(p.kante, a);
      g.beginPath(); g.moveTo(x, ky(name, x) + breite * 0.75); g.lineTo(x + 6, ky(name, x + 6) + breite * 0.75); g.stroke();
    }
  }

  /* ---------- Bäume: Nadelbäume mit gestuften Ästen, einzelne Laubbäume, keine zwei gleich ---------- */
  function tanne(g, x, y, h, r) {
    var b = h * (0.19 + r() * 0.09), stufen = 10 + Math.floor(r() * 6), neig = (r() - 0.5) * 0.05;
    g.rect(x - h * 0.012, y - h * 0.12, h * 0.024, h * 0.14);
    g.moveTo(x + neig * h, y - h);
    for (var i = 1; i <= stufen; i++) {
      var t = i / stufen, yy = y - h + t * h * 0.92, w = b * (0.12 + 0.88 * Math.pow(t, 0.9)) * (0.85 + r() * 0.3);
      g.lineTo(x + neig * h * (1 - t) + w * (0.35 + r() * 0.25), yy - h * 0.03); g.lineTo(x + neig * h * (1 - t) + w, yy + h * (0.004 + 0.02 * r()));
    }
    for (i = stufen; i >= 1; i--) {
      t = i / stufen; yy = y - h + t * h * 0.92; w = b * (0.12 + 0.88 * Math.pow(t, 0.9)) * (0.85 + r() * 0.3);
      g.lineTo(x + neig * h * (1 - t) - w, yy + h * (0.004 + 0.02 * r())); g.lineTo(x + neig * h * (1 - t) - w * (0.35 + r() * 0.25), yy - h * 0.03);
    }
    g.closePath();
  }
  function laubbaum(g, x, y, h, r) {
    g.moveTo(x - h * 0.03, y); g.lineTo(x - h * 0.015, y - h * 0.45); g.lineTo(x + h * 0.015, y - h * 0.45); g.lineTo(x + h * 0.03, y); g.closePath();
    var n = 14 + Math.floor(r() * 8), rk = h * 0.3;
    for (var i = 0; i < n; i++) {
      var a = r() * Math.PI * 2, d = Math.sqrt(r()) * rk * 0.8;
      var cx = x + Math.cos(a) * d * 1.15, cy = y - h * 0.64 + Math.sin(a) * d * 0.75, rr = rk * (0.22 + r() * 0.22);
      g.moveTo(cx + rr, cy); g.arc(cx, cy, rr, 0, Math.PI * 2);
    }
  }
  /* Baum mit Lichtsaum. Alles bleibt innerhalb desselben Umrisses (clip) – so deckt die Nachtfassung
     die Abendfassung beim Überblenden vollständig ab. Saum = Umriss in Lichtfarbe, darüber der
     Körper etwas vom Licht weg versetzt. */
  function baumMitKante(g, art, x, y, h, saat, farbe, p, licht) {
    var lx = lichtX(licht, x), a = p.kanteA * (licht === 'tag' ? 0.7 : naehe(licht, x) * 0.85 + 0.15);
    var dx = -lx * Math.max(0.8, h * 0.012), dy = licht === 'tag' ? h * 0.012 : Math.max(0.8, h * 0.01);
    g.save();
    g.beginPath(); art(g, x, y, h, zufall(saat)); g.fillStyle = farbe; g.fill(); g.clip();
    if (a > 0.04) {
      g.fillStyle = rgba(p.kante, a); g.fill();
      g.translate(dx, dy); g.beginPath(); art(g, x, y, h, zufall(saat)); g.fillStyle = farbe; g.fill();
    }
    g.restore();
  }

  function huegel(ebene, unten) {
    var oben = Math.max(0, hoechster('huegel') - m.H * 0.04);
    LICHTER.forEach(function (licht) {
      var p = F.huegel[licht], g = leinwand(ebene, oben, unten, licht);
      g.beginPath(); g.moveTo(-2, unten + 2);
      for (var x = -2; x <= m.W + 2; x += 2) g.lineTo(x, ky('huegel', x));
      g.lineTo(m.W + 2, unten + 2); g.closePath();
      var gr = g.createLinearGradient(0, oben, 0, unten); gr.addColorStop(0, p.grund); gr.addColorStop(1, farbMix(p.grund, p.dunst, 0.45));
      g.fillStyle = gr; g.fill();
      /* ferner Waldsaum: viele kleine Spitzen auf dem Hügelkamm */
      var r = zufall(7);
      g.fillStyle = p.baum;
      for (x = -4; x <= m.W + 4;) {
        var h = m.H * (0.012 + r() * 0.018), w = h * (0.3 + r() * 0.15), y = ky('huegel', x) + 2;
        g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h); g.lineTo(x + w, y); g.fill();
        x += w * (0.7 + r() * 0.9);
      }
      g.save(); g.beginPath(); g.rect(0, oben, m.W, unten - oben); g.clip();
      var dh = m.H * 0.07, dg = g.createLinearGradient(0, unten - dh, 0, unten);
      dg.addColorStop(0, rgba(p.dunst, 0)); dg.addColorStop(1, rgba(p.dunst, licht === 'nacht' ? 0.5 : 0.7));
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = dg; g.fillRect(0, unten - dh, m.W, dh);
      kornAuf(g, oben, unten, 0.06); g.restore();
      kante(g, 'huegel', p, licht, 1);
    });
  }

  function wald(ebene, unten) {
    /* Bäume einmal auswürfeln (gleich für alle Lichter) */
    var r = zufall(313), baeume = [], x = -20;
    while (x < m.W + 20) {
      var u = uVon(x), groesse = m.H * (0.07 + Math.pow(r(), 1.6) * 0.12) * (m.hoch ? 0.9 : 1);
      /* mittig und um den Hund lichter, damit die Sonne zwischen den Wipfeln Raum hat */
      var luecke = Math.exp(-Math.pow((u - 0.5) / 0.05, 2)) * 0.55;
      if (r() > luecke) baeume.push({ x: x + (r() - 0.5) * 6, h: groesse, laub: r() < 0.07, saat: Math.floor(r() * 1e9), farbe: Math.floor(r() * 4), tief: r() });
      x += groesse * (0.12 + r() * 0.26);
    }
    baeume.sort(function (a, b) { return a.tief - b.tief; });
    var oben = Math.max(0, hoechster('wald') - m.H * 0.2);
    LICHTER.forEach(function (licht) {
      var p = F.wald[licht], g = leinwand(ebene, oben, unten, licht);
      baeume.forEach(function (b) {
        var y = ky('wald', b.x) + m.H * 0.012 + b.tief * m.H * 0.03, farbe = b.laub ? p.laub[b.farbe % 2] : p.baeume[b.farbe];
        /* hintere Reihe etwas im Dunst: Luftperspektive auch innerhalb des Waldes */
        farbe = mixHex(farbe.charAt(0) === '#' ? farbe : '#000000', F.huegel[licht].dunst, (1 - b.tief) * (licht === 'nacht' ? 0.18 : 0.32));
        baumMitKante(g, b.laub ? laubbaum : tanne, b.x, y, b.laub ? b.h * 0.7 : b.h, b.saat, farbe, p, licht);
      });
      /* Boden unter den Bäumen */
      g.beginPath(); g.moveTo(-2, unten + 2);
      for (x = -2; x <= m.W + 2; x += 3) g.lineTo(x, ky('wald', x) + m.H * 0.03);
      g.lineTo(m.W + 2, unten + 2); g.closePath(); g.fillStyle = p.boden; g.fill();
      kornAuf(g, oben, unten, 0.05);
    });
  }

  /* Halm: gebogene, spitz zulaufende Form mit Lichtsaum an der Spitze (Gegenlicht lässt Grasspitzen leuchten) */
  function halm(g, x, y, h, neig, breite, farbe, kf, ka) {
    var sx = x + neig * h, sy = y - h, cx = x + neig * h * 0.35, cy = y - h * 0.55;
    g.fillStyle = farbe;
    g.beginPath(); g.moveTo(x - breite, y); g.quadraticCurveTo(cx - breite * 0.4, cy, sx, sy); g.quadraticCurveTo(cx + breite * 0.4, cy, x + breite, y); g.closePath(); g.fill();
    if (ka > 0.04) {
      var b2 = breite * 0.38;
      g.fillStyle = rgba(kf, ka);
      g.beginPath(); g.moveTo(x - b2 * 0.2, y - h * 0.35); g.quadraticCurveTo(cx - b2 * 0.1, cy, x + (sx - x) * 0.97, y + (sy - y) * 0.97); g.quadraticCurveTo(cx + b2 * 0.5, cy, x + b2, y - h * 0.35); g.closePath(); g.fill();
    }
  }

  function wiese(ebene, unten, hundEbene) {
    var oben = Math.max(0, hoechster('wiese') - m.H * 0.02);
    var r0 = zufall(71), halme = [];
    for (var i = 0, n = Math.round(m.W * 0.9); i < n; i++) halme.push({ x: r0() * m.W, t: r0(), h: m.H * (0.008 + r0() * 0.02), neig: (r0() - 0.5) * 0.9, f: Math.floor(r0() * 4) });
    LICHTER.forEach(function (licht) {
      var p = F.wiese[licht], g = leinwand(ebene, oben, unten, licht);
      g.beginPath(); g.moveTo(-2, unten + 2);
      for (var x = -2; x <= m.W + 2; x += 3) g.lineTo(x, ky('wiese', x));
      g.lineTo(m.W + 2, unten + 2); g.closePath();
      var gr = g.createLinearGradient(0, oben, 0, unten); gr.addColorStop(0, p.oben); gr.addColorStop(1, p.unten);
      g.fillStyle = gr; g.fill();
      halme.forEach(function (h) {
        var y = ky('wiese', h.x) + h.t * (unten - ky('wiese', h.x)) * 0.9 + 2;
        halm(g, h.x, y, h.h * (1 - h.t * 0.4), h.neig, 1.1, p.halm[h.f], p.kante, p.kanteA * naehe(licht, h.x) * (1 - h.t) * (licht === 'tag' ? 0.5 : 1));
      });
      kornAuf(g, oben, unten, 0.06);
    });
    /* Hund: steht auf der Kuppe, Füße im Gras */
    var hx = xVon(m.hundU), hh = m.H * (m.hoch ? 0.13 : 0.155), hw = hh * 315 / 360;
    hund.x = hx - hw * 0.5; hund.y = ky('wiese', hx) - hh * 0.97; hund.w = hw; hund.h = hh;
    var c = hund.leinwand || document.createElement('canvas');
    c.className = 'szene__hund'; c.width = Math.ceil(hw * m.q); c.height = Math.ceil(hh * m.q);
    c.style.left = hund.x + 'px'; c.style.top = hund.y + 'px'; c.style.width = hw + 'px'; c.style.height = hh + 'px';
    hundEbene.appendChild(c); hund.leinwand = c; hund.zuletzt = '';
  }

  var GRAS_GRUPPEN = 2;
  function gras(ebene) {
    /* etwas über den unteren Rand hinaus, falls das Bild nach dem Zeichnen noch höher wird */
    var oben = m.H * 0.8, unten = m.H * 1.15;
    for (var gr = 0; gr < GRAS_GRUPPEN; gr++) {
      var wind = document.createElement('div');
      wind.className = 'szene__wind szene__wind--' + gr; wind.style.top = oben + 'px'; wind.style.height = (unten - oben) + 'px';
      ebene.appendChild(wind);
      var r = zufall(900 + gr), halme = [], n = Math.round(m.W * (gr ? 0.42 : 0.6));
      for (var i = 0; i < n; i++) {
        var x = r() * (m.W + 40) - 20, t = r();
        halme.push({ x: x, y: m.H - t * m.H * (gr ? 0.03 : 0.07) + 4, h: m.H * (gr ? 0.06 + r() * 0.1 : 0.035 + r() * 0.07) * (1 - t * 0.3), neig: (r() - 0.45) * (gr ? 0.5 : 0.7), b: gr ? 1.6 + r() * 2.2 : 1 + r() * 1.4, f: Math.floor(r() * 5) });
      }
      halme.sort(function (a, b) { return a.y - b.y; });
      LICHTER.forEach(function (licht) {
        var p = F.gras[licht], c = document.createElement('canvas'), q = m.q;
        var o2 = oben - m.H * 0.14;
        c.width = Math.ceil(m.W * q); c.height = Math.ceil((unten - o2) * q);
        c.style.top = (o2 - oben) + 'px'; c.style.height = (unten - o2) + 'px'; c.className = 'szene__bild'; c.setAttribute('data-licht', licht);
        var g = c.getContext('2d'); g.setTransform(q, 0, 0, q, 0, -o2 * q);
        halme.forEach(function (h) { halm(g, h.x, h.y, h.h, h.neig, h.b, p.halm[h.f], p.kante, p.kanteA * (licht === 'tag' ? 0.45 : naehe(licht, h.x) * 0.8 + 0.2)); });
        wind.appendChild(c);
      });
    }
  }

  /* ---------- Hund (Bildfolge aus dem Kling-Video als Silhouette, 36 Bilder) ---------- */
  var hund = { bild: null, blatt: null, x: 0, y: 0, w: 0, h: 0, leinwand: null, zuletzt: '' };
  /* erst nur der stehende Hund (klein), die ganze Bildfolge (190 KB) nach dem Laden der Seite */
  function hundLaden(src, feld) {
    var b = new Image(); b.decoding = 'async';
    b.onload = function () { hund[feld] = b; hund.zuletzt = ''; zeichne(true); };
    b.src = src;
  }
  hundLaden('bilder/hero/hund-steht.webp', 'bild');
  function blattLaden() { if (!ruhig) hundLaden('bilder/hero/hund-silhouette.webp', 'blatt'); }
  if (document.readyState === 'complete') setTimeout(blattLaden, 300); else window.addEventListener('load', function () { setTimeout(blattLaden, 300); });
  var HB = 315, HH = 360;
  function hundZeichnen(bildNr, farbe, kantenFarbe, kantenA, lx) {
    var c = hund.leinwand; if (!c || !hund.bild) return;
    var schluessel = (hund.blatt ? bildNr : 0) + farbe + kantenA.toFixed(2) + lx.toFixed(1);
    if (schluessel === hund.zuletzt) return;
    hund.zuletzt = schluessel;
    var quelle = hund.blatt || hund.bild;
    if (!hund.blatt) bildNr = 0;
    var g = c.getContext('2d'), sx = (bildNr % 6) * HB, sy = Math.floor(bildNr / 6) * HH;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
    var d = Math.max(1, c.width * 0.012);
    if (kantenA > 0.03) {
      g.globalAlpha = kantenA; g.drawImage(quelle, sx, sy, HB, HH, lx * d, -d * 0.8, c.width, c.height);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-in'; g.fillStyle = kantenFarbe; g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'source-over';
    }
    /* Körper in eigener Farbe darüber (über Zwischenleinwand, damit der Saum erhalten bleibt) */
    var t = hund.tmp || (hund.tmp = document.createElement('canvas'));
    t.width = c.width; t.height = c.height;
    var tg = t.getContext('2d'); tg.drawImage(quelle, sx, sy, HB, HH, 0, 0, t.width, t.height);
    tg.globalCompositeOperation = 'source-in'; tg.fillStyle = farbe; tg.fillRect(0, 0, t.width, t.height);
    g.drawImage(t, 0, 0);
  }

  /* ---------- Sterne ----------
     drei Helligkeitsstufen, die nacheinander erscheinen (zuerst die hellsten), die hellsten als eigene
     Elemente mit unregelmäßigem Funkeln (CSS, jeder Stern mit eigenem Takt), dazu eine zurückhaltende
     Milchstraße und sehr selten eine Sternschnuppe. */
  var STERNFARBEN = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFF1DC', '#FFE6C8', '#DCE6FF', '#CFDDFF'];
  function sterne() {
    var box = held.querySelector('.sterne'); if (!box) return;
    box.innerHTML = '';
    var hoehe = m.H * 0.66, r = zufall(4242), q = Math.min(m.q, 1.5);
    box.style.height = hoehe + 'px';
    /* Milchstraße: schräges Band, grob gerechnet und weich hochskaliert */
    var mw = 640, mh = Math.round(mw * hoehe / m.W), mc = document.createElement('canvas');
    mc.width = mw; mc.height = mh; mc.className = 'milchstrasse';
    var mg = mc.getContext('2d'), wink = -0.42, cx = mw * 0.62, cy = mh * 0.42, ca = Math.cos(wink), sa = Math.sin(wink);
    /* weicher Schimmer, darin sehr viele winzige Punkte: körnig statt wolkig */
    for (var i = 0; i < 260; i++) {
      var t = (r() - 0.5) * mw * 1.6, d = (r() + r() + r() - 1.5) * mh * 0.07;
      var x = cx + t * ca - d * sa, y = cy + t * sa + d * ca, rr = 6 + r() * 14;
      var gr = mg.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, 'rgba(210,218,255,' + (0.025 + r() * 0.025) + ')'); gr.addColorStop(1, 'rgba(210,218,255,0)');
      mg.fillStyle = gr; mg.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (i = 0; i < 5200; i++) {
      t = (r() - 0.5) * mw * 1.6; d = (r() + r() + r() + r() - 2) * mh * 0.06;
      x = cx + t * ca - d * sa; y = cy + t * sa + d * ca;
      mg.fillStyle = 'rgba(235,238,255,' + (0.08 + r() * 0.3) + ')'; mg.fillRect(x, y, r() < 0.85 ? 0.7 : 1.2, r() < 0.85 ? 0.7 : 1.2);
    }
    /* dunkle Staubbahnen */
    mg.globalCompositeOperation = 'destination-out';
    for (i = 0; i < 140; i++) {
      t = (r() - 0.5) * mw * 1.5; d = (r() - 0.5) * mh * 0.03;
      x = cx + t * ca - d * sa; y = cy + t * sa + d * ca; rr = 3 + r() * 8;
      gr = mg.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      mg.fillStyle = gr; mg.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    box.appendChild(mc);
    /* zwei Leinwände: schwache und mittlere Sterne */
    [['3', 1 / 1400, 0.28, 0.55], ['2', 1 / 9000, 0.55, 0.9]].forEach(function (st) {
      var c = document.createElement('canvas'); c.width = Math.ceil(m.W * q); c.height = Math.ceil(hoehe * q);
      c.className = 'sterne__feld'; c.setAttribute('data-stufe', st[0]);
      var g = c.getContext('2d'); g.setTransform(q, 0, 0, q, 0, 0);
      var n = Math.round(m.W * hoehe * st[1]);
      for (var k = 0; k < n; k++) {
        var x2 = r() * m.W, y2 = Math.pow(r(), 1.25) * hoehe;
        /* in der Milchstraße dichter */
        if (st[0] === '3' && r() < 0.35) {
          var tt = (r() - 0.5) * m.W * 1.4, dd = (r() + r() - 1) * hoehe * 0.1;
          x2 = m.W * 0.62 + tt * ca - dd * sa; y2 = hoehe * 0.42 + tt * sa + dd * ca;
          if (y2 < 0 || y2 > hoehe) continue;
        }
        var ra = st[2] + r() * (st[3] - st[2]), f = STERNFARBEN[Math.floor(r() * STERNFARBEN.length)];
        g.globalAlpha = (0.35 + r() * 0.65) * (1 - Math.pow(y2 / hoehe, 3) * 0.6);
        if (st[0] === '2') {
          var gg = g.createRadialGradient(x2, y2, 0, x2, y2, ra * 4);
          gg.addColorStop(0, rgba(f, 0.35)); gg.addColorStop(1, rgba(f, 0));
          g.fillStyle = gg; g.fillRect(x2 - ra * 4, y2 - ra * 4, ra * 8, ra * 8);
        }
        g.fillStyle = f; g.beginPath(); g.arc(x2, y2, ra, 0, Math.PI * 2); g.fill();
      }
      box.appendChild(c);
    });
    /* die hellsten: eigene Elemente, jeder mit eigenem, unregelmäßigem Takt */
    var hell = document.createElement('div'); hell.className = 'sterne__hell';
    var anzahl = Math.round(Math.min(46, Math.max(18, m.W / 34)));
    for (var j = 0; j < anzahl; j++) {
      var sp = document.createElement('i'), gr2 = 1.4 + Math.pow(r(), 2.2) * 2.6;
      sp.style.left = (r() * 100).toFixed(2) + '%';
      sp.style.top = (Math.pow(r(), 1.4) * 88).toFixed(2) + '%';
      sp.style.setProperty('--g', gr2.toFixed(2) + 'px');
      sp.style.setProperty('--f', STERNFARBEN[Math.floor(r() * STERNFARBEN.length)]);
      sp.style.animationDuration = (2.4 + r() * 4.6).toFixed(2) + 's';
      sp.style.animationDelay = (-r() * 7).toFixed(2) + 's';
      if (r() < 0.5) sp.className = 'anders';
      hell.appendChild(sp);
    }
    box.appendChild(hell);
    var sch = document.createElement('div'); sch.className = 'schnuppen'; box.appendChild(sch);
  }
  /* Sternschnuppe: selten (alle 18–40 s), nur nachts und wenn das Startbild zu sehen ist */
  var schnuppeTimer = 0;
  function schnuppePlanen() {
    clearTimeout(schnuppeTimer);
    if (ruhig) return;
    schnuppeTimer = setTimeout(function () {
      var box = held.querySelector('.schnuppen'), jetzt = parseFloat(held.style.getPropertyValue('--sterne')) || 0;
      if (box && jetzt > 0.85 && !held.classList.contains('szene--weg') && !document.hidden) {
        var r = Math.random, e = document.createElement('i');
        e.className = 'schnuppe';
        e.style.left = (10 + r() * 70) + '%'; e.style.top = (4 + r() * 38) + '%';
        e.style.setProperty('--winkel', (18 + r() * 22) + 'deg');
        e.style.setProperty('--weg', (120 + r() * 160) + 'px');
        box.appendChild(e);
        e.addEventListener('animationend', function () { e.remove(); });
      }
      schnuppePlanen();
    }, 18000 + Math.random() * 22000);
  }

  /* ---------- Aufbau ---------- */
  var ebenen = {}, sonne, mond, bereit = false, bauzeit = 0;
  function aufbauen() {
    var t0 = performance.now();
    messen();
    held.style.setProperty('--szene-h', m.H + 'px');
    ['fern', 'mitte', 'huegel', 'wald', 'wiese', 'gras'].forEach(function (k) { var e = ebenen[k]; e.querySelectorAll('canvas:not(.szene__hund), .szene__wind').forEach(function (c) { c.remove(); }); });
    berg('fern', ebenen.fern, tiefster('mitte') + 2, { saat: 5, schnee: 0.64, schichten: 3, tiefe: 1 });
    berg('mitte', ebenen.mitte, tiefster('huegel') + 2, { saat: 9, schichten: 6, tiefe: 1.1 });
    huegel(ebenen.huegel, tiefster('wald') + m.H * 0.03 + 2);
    wald(ebenen.wald, tiefster('wiese') + 2);
    wiese(ebenen.wiese, m.H * 1.15, ebenen.wiese);
    gras(ebenen.gras);
    sterne();
    /* Sonne startet mittig oben, sinkt senkrecht und verschwindet hinter dem Sattel in der Mitte */
    m.sonneR = Math.max(26, Math.min(44, m.W * 0.026));
    m.sonneStart = m.H * (m.hoch ? 0.13 : 0.1);
    m.sonneEnde = ky('fern', m.W / 2) + (TIEFE.himmel - TIEFE.fern * m.f) * 0.26 * m.H + m.sonneR * 1.4;
    m.mondX = m.W * (m.hoch ? 0.22 : 0.24);
    m.mondStart = ky('fern', m.mondX) + (TIEFE.himmel - TIEFE.fern * m.f) * 0.3 * m.H + m.sonneR;
    m.mondEnde = m.H * (m.hoch ? 0.12 : 0.11);
    held.style.setProperty('--sonne-r', m.sonneR + 'px');
    held.style.setProperty('--titel-oben', (m.H * (m.hoch ? 0.24 : 0.2)) + 'px');
    held.classList.add('szene--bereit');
    bereit = true;
    bauzeit = Math.round(performance.now() - t0);
    zeichne(true);
  }

  /* ---------- Scrollen ---------- */
  var letztesP = -1, geplant = false;
  /* Zum Prüfen: ?p=0.3 stellt die Tageszeit fest ein */
  var festP = parseFloat(new URLSearchParams(location.search).get('p'));
  function fortschritt() {
    if (!isNaN(festP)) return festP;
    if (ruhig) return 0;
    var s = -held.getBoundingClientRect().top;
    return Math.max(0, Math.min(1.2, s / m.H));
  }
  function setze(el, y) { el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; }
  function zeichne(immer) {
    geplant = false;
    if (!bereit) return;
    var p = fortschritt();
    if (!immer && Math.abs(p - letztesP) < 0.0005) return;
    letztesP = p;
    var s = isNaN(festP) ? p * m.H : 0;
    /* Parallaxe */
    Object.keys(ebenen).forEach(function (k) { setze(ebenen[k], s * TIEFE[k] * (k === 'himmel' ? 1 : m.f)); });
    /* Licht */
    var gold = sanft(0.05, 0.19, p), nacht = sanft(0.22, 0.42, p);
    held.style.setProperty('--gold', (nacht > 0.995 ? 0 : gold).toFixed(3));
    held.style.setProperty('--nacht', nacht.toFixed(3));
    /* ist eine Stimmung ganz erreicht, verschwinden die Fassungen darunter (sonst schimmern ihre Kanten an dünnen Halmen durch) */
    held.style.setProperty('--tag', (gold > 0.995 || nacht > 0.995) ? '0' : '1');
    held.style.setProperty('--blau', sanft(0.18, 0.3, p).toFixed(3));
    held.style.setProperty('--himmel-nacht', sanft(0.28, 0.46, p).toFixed(3));
    /* Sterne: zuerst die hellsten, dann mehr; Milchstraße erst in tiefer Nacht */
    var s1 = sanft(0.26, 0.36, p);
    held.style.setProperty('--sterne', s1.toFixed(3));
    held.style.setProperty('--sterne2', sanft(0.32, 0.44, p).toFixed(3));
    held.style.setProperty('--sterne3', sanft(0.38, 0.52, p).toFixed(3));
    held.style.setProperty('--milch', sanft(0.42, 0.6, p).toFixed(3));
    held.classList.toggle('szene--sterne', s1 > 0.01);
    /* Sonne: senkrecht, zuerst langsam, dann schneller zum Horizont */
    var ps = sanft(0, 0.28, p), ys = mix(m.sonneStart, m.sonneEnde, ps * ps * (1.6 - 0.6 * ps));
    sonne.style.transform = 'translate3d(' + (m.W / 2) + 'px,' + ys.toFixed(1) + 'px,0)';
    held.style.setProperty('--tief', sanft(0.04, 0.24, p).toFixed(3));
    /* Mond steigt links auf */
    var pm = sanft(0.27, 0.6, p), ym = mix(m.mondStart, m.mondEnde, 1 - Math.pow(1 - pm, 2));
    mond.style.transform = 'translate3d(' + m.mondX.toFixed(1) + 'px,' + ym.toFixed(1) + 'px,0)';
    held.style.setProperty('--mond', sanft(0.27, 0.4, p).toFixed(3));
    /* Hund: Farbe folgt dem Licht, nachts hebt er den Kopf */
    var bildNr = Math.round(sanft(0.4, 0.58, p) * 35);
    var farbe = mixHex(mixHex(F.hund.tag, F.hund.gold, gold), F.hund.nacht, nacht);
    var kf = mixHex(mixHex(F.hund.kanteTag, F.hund.kanteGold, gold), F.hund.kanteNacht, nacht);
    var ka = mix(mix(0.45, 0.85, gold), 0.6, nacht);
    /* Sonne und Mond stehen beide links vom Hund: der Saum liegt links */
    hundZeichnen(bildNr, farbe, kf, ka, -1);
  }
  function anfordern() { if (!geplant) { geplant = true; requestAnimationFrame(function () { zeichne(false); }); } }

  function start() {
    ['himmel', 'fern', 'mitte', 'titel', 'huegel', 'wald', 'wiese', 'gras'].forEach(function (k) { ebenen[k] = held.querySelector('[data-ebene="' + k + '"]'); });
    sonne = held.querySelector('.sonne'); mond = held.querySelector('.mond');
    aufbauen();
    window.addEventListener('scroll', anfordern, { passive: true });
    schnuppePlanen();
    var breite = window.innerWidth, hoehe = buehne.clientHeight, t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        /* Handy: die Adressleiste ändert nur die Höhe ein wenig – dann nicht neu zeichnen */
        if (window.innerWidth === breite && Math.abs(buehne.clientHeight - hoehe) < 60) { zeichne(true); return; }
        breite = window.innerWidth; hoehe = buehne.clientHeight; aufbauen();
      }, 150);
    });
    /* Wind nur, solange das Startbild zu sehen ist */
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { held.classList.toggle('szene--weg', !e[0].isIntersecting); }).observe(held);
    window.__szene = { p: function (x) { window.scrollTo(0, x * m.H); }, bauzeit: function () { return bauzeit; } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
