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
  /* welche Lichtstimmungen gerade gezeichnet werden: erst nur Tag (schneller Start), Gold und Nacht danach */
  var AKTIV = LICHTER;

  /* ---------- Werkzeuge ---------- */
  function zufall(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sanft(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  /* noch weicher an beiden Enden (Sonne: ruhiger Anfang, gleichmäßige Mitte, weiches Eintauchen) */
  function sanfter(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * t * (t * (6 * t - 15) + 10); }
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
    weit: {
      tag: { grund: '#A8BDD5', dunst: '#D3E2EF', hell: '#C4D4E6', schatten: '#94A9C5', kante: '#FFFFFF', kanteA: 0.3, schneeH: '#F6F8FB', schneeS: '#D2DCE9', schicht: '#93A8C2' },
      gold: { grund: '#AF8F9F', dunst: '#EFB894', hell: '#F1C1A1', schatten: '#977A93', kante: '#FFE0B0', kanteA: 0.8, schneeH: '#FFE9D4', schneeS: '#C5A8BC', schicht: '#9A7E95' },
      nacht: { grund: '#303C57', dunst: '#394866', hell: '#44557A', schatten: '#28334C', kante: '#AFC0E0', kanteA: 0.45, schneeH: '#C3CFE8', schneeS: '#62739A', schicht: '#28334C' }
    },
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
    stein: { tag: ['#6E6A60', '#B9B3A2'], gold: ['#4A3F3A', '#E6A77A'], nacht: ['#171D26', '#5F6F93'] },
    /* Erde unter dem Gras (Erdschnitt + Wurzeln im Kontakt, js/wurzeln.js): warmes Erdbraun am Tag, kühl-dunkel mit Mondkante nachts */
    erde: {
      tag: { humus: '#3E3126', unter: '#2A211A', schicht: '#4C3C2E', hell: '#6A5641', kante: '#E8DCC2', kanteA: 0.3, wurzel: '#6A5240', schatten: '#3E2E21', wurzelKante: '#D9C7A6', haar: '#7C6249' },
      gold: { humus: '#33261E', unter: '#211915', schicht: '#42322A', hell: '#5C4636', kante: '#FFBE74', kanteA: 0.8, wurzel: '#5A4033', schatten: '#32241D', wurzelKante: '#F2B87E', haar: '#6B4F3E' },
      nacht: { humus: '#0E141C', unter: '#090D13', schicht: '#131B27', hell: '#1D2837', kante: '#5E78A8', kanteA: 0.5, wurzel: '#242D3D', schatten: '#101620', wurzelKante: '#7F95C0', haar: '#2A3444' }
    },
    bluete: { tag: ['#F4F1E6', '#E7C75A', '#B9A3D6'], gold: ['#F6D9B8', '#F2B45C', '#C79AB8'], nacht: ['#8A93A8', '#7F8496', '#737B94'] },
    hund: { tag: '#231E1A', gold: '#17120F', nacht: '#07090E', kanteTag: '#9C7B55', kanteGold: '#FFB870', kanteNacht: '#8FA4D0' }
  };

  /* ---------- Landschaft (Weltkoordinaten u 0–1, Höhen in Anteilen der Bildhöhe) ---------- */
  var KAEMME = {
    /* sehr ferne Kette: blass, zeigt sich nur in den Lücken der fernen Kette */
    weit: kamm({ saat: 5, basis: 0.575, fein: 0.016, rau: 0.64, wellen: 0.008, neben: 1, gipfel: [[0.02, 0.07, 0.1], [0.12, 0.1, 0.08, 1.4], [0.35, 0.095, 0.07, 1.4], [0.44, 0.065, 0.06], [0.63, 0.085, 0.07, 1.3], [0.87, 0.105, 0.08, 1.5]] }),
    /* ferne Kette: zwei Gipfelgruppen links und rechts, mittig ein Sattel, in den die Sonne sinkt */
    fern: kamm({ saat: 11, basis: 0.60, fein: 0.028, rau: 0.68, wellen: 0.016, neben: 3, gipfel: [[0.06, 0.13, 0.16, 1.2], [0.19, 0.2, 0.15, 1.5], [0.29, 0.16, 0.12, 1.4], [0.395, 0.1, 0.1], [0.5, 0.045, 0.12], [0.6, 0.11, 0.1], [0.7, 0.21, 0.14, 1.6], [0.8, 0.17, 0.12, 1.4], [0.93, 0.14, 0.14, 1.3]] }),
    mitte: kamm({ saat: 23, basis: 0.66, fein: 0.022, rau: 0.66, wellen: 0.012, neben: 3, gipfel: [[0.0, 0.09, 0.2], [0.14, 0.12, 0.16, 1.3], [0.33, 0.085, 0.14], [0.47, 0.05, 0.14], [0.58, 0.1, 0.14, 1.3], [0.76, 0.13, 0.15, 1.4], [0.97, 0.1, 0.16]] }),
    huegel: kamm({ saat: 37, basis: 0.72, fein: 0.008, rau: 0.5, wellen: 0.012, gipfel: [[0.1, 0.06, 0.25, 1.1], [0.42, 0.045, 0.22, 1.1], [0.74, 0.065, 0.24, 1.1]] }),
    wald: kamm({ saat: 41, basis: 0.8, fein: 0.006, rau: 0.45, wellen: 0.01, gipfel: [[0.2, 0.035, 0.3, 1.1], [0.85, 0.04, 0.3, 1.1]] }),
    wiese: kamm({ saat: 53, basis: 0.9, fein: 0.004, rau: 0.45, wellen: 0.006, gipfel: [[0.64, 0.05, 0.3, 1.8], [0.1, 0.02, 0.3, 1.2]] })
  };
  /* Tiefe: hinten viel Weg (fast stehend), vorne wenig – so entsteht beim Scrollen die Parallaxe */
  /* bis hierhin (Anteil des Startbilds) ist die Sonne hinter dem Sattel – ca. 10 % mehr Strecke als vorher */
  var SONNE_BIS = 0.31;
  /* ganzer Tag → Nacht auf 60 % der Strecke (ERGUN., 25.09. abends): volle Nacht und jaulender Hund,
     solange das Titelbild noch gut zu sehen ist. Alle Werte unten gelten für die ungestauchte Strecke. */
  /* 26.09. (ERGUN.): Sonnenuntergang → Mond etwas langsamer, auf 75 % der Strecke (vorher 60 %) */
  var ZEIT = 0.75;
  var TIEFE = { himmel: 0.84, weit: 0.8, fern: 0.74, mitte: 0.62, titel: 0.52, huegel: 0.48, wald: 0.33, wiese: 0.17, gras: 0, vorn: 0.17 };   /* vorn = ERGUN.s 3D-Figur über der Erde, wie die Wiese (Auftrag 34) */

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
    AKTIV.forEach(function (licht) {
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
      /* Felsrippen und Rinnen: laufen schräg vom Grat talwärts, mit Lichtseite daneben – gibt Relief */
      if (extra.rippen) {
        var rz = zufall(extra.saat + 77), anzahl = Math.round(m.W / 1440 * 150 * extra.rippen), hm = KAEMME[name].hmax * m.H;
        var schneelinie = extra.schnee ? KAEMME[name].basis * m.H - hm * extra.schnee : -1;
        for (var ri2 = 0; ri2 < anzahl; ri2++) {
          var x0 = rz() * m.W, y0 = ky(name, x0), h0 = KAEMME[name].basis * m.H - y0;
          if (h0 < hm * 0.22) { rz(); rz(); rz(); continue; }
          var richt = ky(name, x0 + 6) > ky(name, x0 - 6) ? 1 : -1, len = (0.25 + rz() * 0.55) * Math.min(tief, h0 * 1.3), sp = 0.3 + rz() * 0.45;
          var lxr = lichtX(licht, x0) >= 0 ? 1 : -1, pts = [[x0, y0 + 1]], xx = x0, yy2 = y0 + 1;
          for (var st3 = 0; st3 < 9; st3++) { xx += richt * len / 9 * sp * (0.3 + rz() * 1.2) + (rz() - 0.5) * len * 0.03; yy2 += len / 9 * (0.8 + rz() * 0.4); pts.push([xx, yy2]); }
          var schneeRinne = extra.schnee && y0 < schneelinie + hm * 0.05 && rz() < 0.35;
          g.lineCap = 'round';
          [[p.schatten, licht === 'tag' ? 0.2 : 0.3, 1.1, 0], [p.hell, licht === 'tag' ? 0.2 : 0.3 * (0.4 + naehe(licht, x0)), 0.9, lxr * 1.2]].forEach(function (z) {
            g.strokeStyle = rgba(z[0], z[1]); g.lineWidth = z[2];
            g.beginPath(); pts.forEach(function (pt, k) { if (k) g.lineTo(pt[0] + z[3], pt[1]); else g.moveTo(pt[0] + z[3], pt[1]); }); g.stroke();
          });
          if (schneeRinne) {
            g.strokeStyle = rgba(p.schneeH, 0.45); g.lineWidth = 1.5;
            g.beginPath(); pts.slice(0, 4 + Math.floor(rz() * 4)).forEach(function (pt, k) { if (k) g.lineTo(pt[0], pt[1]); else g.moveTo(pt[0], pt[1]); }); g.stroke();
          }
        }
      }
      /* Felsbänder: kurze, leicht schräge Stufen mit heller Oberkante */
      if (extra.baender) {
        var bz = zufall(extra.saat + 91);
        for (var bi = 0; bi < extra.baender * m.W / 1440; bi++) {
          var bx = bz() * m.W, by = ky(name, bx) + (0.12 + bz() * 0.5) * tief, bl = 8 + bz() * 26, bw = (bz() - 0.5) * 0.25;
          g.fillStyle = rgba(p.schatten, 0.32); g.fillRect(bx, by, bl, 1.4);
          g.strokeStyle = rgba(p.hell, 0.25); g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by - 0.6); g.lineTo(bx + bl, by - 0.6 + bl * bw); g.stroke();
        }
      }
      /* Geröll am Fuß: feine helle und dunkle Punkte im unteren Drittel */
      if (extra.geroell) {
        var gz = zufall(extra.saat + 5);
        for (var gi = 0; gi < extra.geroell * m.W / 1440; gi++) {
          var gx = gz() * m.W, gy = unten - gz() * tief * 0.35, gyk = ky(name, gx);
          if (gy < gyk + 4) continue;
          g.fillStyle = rgba(gz() < 0.5 ? p.hell : p.schatten, 0.3); g.fillRect(gx, gy, 0.8 + gz() * 1.4, 0.8 + gz());
        }
      }
      /* Dunst im Tal: zum unteren Rand hin in die Himmelsfarbe am Horizont */
      var dh = Math.min(tief, m.H * 0.09);
      var dg = g.createLinearGradient(0, unten - dh, 0, unten);
      dg.addColorStop(0, rgba(p.dunst, 0)); dg.addColorStop(1, rgba(p.dunst, licht === 'nacht' ? 0.55 : 0.75));
      g.fillStyle = dg; g.fillRect(0, unten - dh, m.W, dh);
      nebel(g, unten, p.dunst, licht, extra.saat);
      kornAuf(g, oben, unten, licht === 'nacht' ? 0.05 : 0.07);
      g.restore();
      /* Lichtkante auf dem Grat (im Gegenlicht kräftig, zum Licht hin stärker) */
      kante(g, name, p, licht, 1.2);
    });
  }
  /* Nebelschwaden: lange, flache, weiche Bänder über dem Talboden */
  function nebel(g, unten, farbe, licht, saat) {
    var nz = zufall(saat + 300), n = Math.round(10 * m.W / 1440) + 4;
    for (var i = 0; i < n; i++) {
      var x = nz() * m.W, y = unten - m.H * (0.005 + nz() * 0.035), rx = m.W * (0.08 + nz() * 0.16);
      g.save(); g.translate(x, y); g.scale(1, 0.12 + nz() * 0.08);
      var gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      gr.addColorStop(0, rgba(farbe, (licht === 'nacht' ? 0.22 : 0.34) * (0.6 + nz() * 0.4))); gr.addColorStop(1, rgba(farbe, 0));
      g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
    }
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
      g.translate(-dx, -dy);
    }
    /* Volumen: die vom Licht abgewandte Hälfte etwas dunkler, weich zur Mitte hin */
    var sg = g.createLinearGradient(x - h * 0.2 * (lx >= 0 ? 1 : -1), 0, x + h * 0.05 * (lx >= 0 ? 1 : -1), 0);
    sg.addColorStop(0, 'rgba(0,0,0,' + (licht === 'nacht' ? 0.18 : 0.26) + ')'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sg; g.fillRect(x - h * 0.4, y - h * 1.1, h * 0.8, h * 1.2);
    g.restore();
  }
  /* kahler oder abgestorbener Baum: Stamm mit wenigen dünnen Ästen */
  function kahl(g, x, y, h, r) {
    var neig = (r() - 0.5) * 0.1, b = h * 0.018;
    g.moveTo(x - b, y); g.lineTo(x + neig * h - b * 0.3, y - h); g.lineTo(x + neig * h + b * 0.3, y - h); g.lineTo(x + b, y); g.closePath();
    for (var i = 0; i < 7; i++) {
      var t = 0.3 + r() * 0.62, ax = x + neig * h * t, ay = y - h * t, s = r() < 0.5 ? -1 : 1, l = h * (0.08 + r() * 0.14) * (1.1 - t);
      g.moveTo(ax, ay); g.lineTo(ax + s * l, ay - l * (0.4 + r() * 0.5)); g.lineTo(ax + s * l, ay - l * (0.4 + r() * 0.5) - b * 0.5); g.lineTo(ax, ay - b * 1.2); g.closePath();
    }
  }
  /* Busch: Haufen kleiner Blattkreise am Waldrand */
  function busch(g, x, y, h, r) {
    for (var i = 0, n = 7 + Math.floor(r() * 6); i < n; i++) {
      var cx = x + (r() - 0.5) * h * 1.6, cy = y - r() * h * 0.6, rr = h * (0.18 + r() * 0.25);
      g.moveTo(cx + rr, cy); g.arc(cx, cy, rr, 0, Math.PI * 2);
    }
  }

  function huegel(ebene, unten) {
    var oben = Math.max(0, hoechster('huegel') - m.H * 0.04);
    AKTIV.forEach(function (licht) {
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
      if (r() > luecke) { var z = r(); baeume.push({ x: x + (r() - 0.5) * 6, h: groesse, art: z < 0.07 ? 'laub' : (z < 0.1 ? 'kahl' : 'tanne'), saat: Math.floor(r() * 1e9), farbe: Math.floor(r() * 4), tief: r() }); }
      x += groesse * (0.12 + r() * 0.26);
    }
    /* Büsche am Waldrand, vor den Bäumen */
    var bz = zufall(515), buesche = [];
    for (var bx = -10; bx < m.W + 10; bx += m.H * (0.02 + bz() * 0.05)) if (bz() < 0.55) buesche.push({ x: bx, h: m.H * (0.012 + bz() * 0.018), saat: Math.floor(bz() * 1e9), farbe: Math.floor(bz() * 2) });
    baeume.sort(function (a, b) { return a.tief - b.tief; });
    var oben = Math.max(0, hoechster('wald') - m.H * 0.2);
    AKTIV.forEach(function (licht) {
      var p = F.wald[licht], g = leinwand(ebene, oben, unten, licht);
      baeume.forEach(function (b) {
        var y = ky('wald', b.x) + m.H * 0.012 + b.tief * m.H * 0.03, farbe = b.art === 'laub' ? p.laub[b.farbe % 2] : p.baeume[b.farbe];
        /* hintere Reihe etwas im Dunst: Luftperspektive auch innerhalb des Waldes */
        farbe = mixHex(farbe, F.huegel[licht].dunst, (1 - b.tief) * (licht === 'nacht' ? 0.18 : 0.32));
        baumMitKante(g, b.art === 'laub' ? laubbaum : (b.art === 'kahl' ? kahl : tanne), b.x, y, b.art === 'laub' ? b.h * 0.7 : (b.art === 'kahl' ? b.h * 0.8 : b.h), b.saat, farbe, p, licht);
      });
      buesche.forEach(function (b) {
        baumMitKante(g, busch, b.x, ky('wald', b.x) + m.H * 0.036, b.h, b.saat, mixHex(p.laub[b.farbe], p.boden, 0.35), p, licht);
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
    var huelle = figurenStellen(hundEbene);
    var r0 = zufall(71), halme = [];
    for (var i = 0, n = Math.round(m.W * 1.5); i < n; i++) halme.push({ x: r0() * m.W, t: r0(), h: m.H * (0.008 + r0() * 0.02), neig: (r0() - 0.5) * 0.9, f: Math.floor(r0() * 4) });
    var steine = [], bluemchen = [], hx0 = (FIGUREN.hund.fussX + FIGUREN.emre.fussX) / 2;
    for (i = 0; i < Math.round(9 * m.W / 1440) + 3; i++) { var sx = r0() * m.W; if (Math.abs(sx - hx0) < m.H * 0.09) continue; steine.push({ x: sx, t: r0(), w: m.H * (0.012 + r0() * 0.03), hv: 0.45 + r0() * 0.3, saat: Math.floor(r0() * 1e9) }); }
    steine.sort(function (a, b) { return a.t - b.t; });
    for (i = 0; i < Math.round(m.W * 0.2); i++) bluemchen.push({ x: r0() * m.W, t: r0(), h: m.H * (0.006 + r0() * 0.012), f: Math.floor(r0() * 3) });
    AKTIV.forEach(function (licht) {
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
      /* Steine: unregelmäßig, oben heller (Licht), unten Kontaktschatten */
      steine.forEach(function (st) {
        var y = ky('wiese', st.x) + st.t * m.H * 0.06 + 3, w = st.w, h = w * st.hv, sr = zufall(st.saat);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(st.x, y + 1, w * 0.62, h * 0.18, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(st.x - w * 0.5, y);
        for (var k = 0; k <= 6; k++) { var a = Math.PI + k / 6 * Math.PI; g.lineTo(st.x + Math.cos(a) * w * (0.42 + sr() * 0.14), y + Math.sin(a) * h * (0.7 + sr() * 0.35)); }
        g.closePath(); g.fillStyle = F.stein[licht][0]; g.fill();
        g.save(); g.clip(); g.fillStyle = rgba(F.stein[licht][1], licht === 'tag' ? 0.55 : 0.4 + naehe(licht, st.x) * 0.3); g.fillRect(st.x - w, y - h * 1.2, w * 2, h * 0.55); g.restore();
      });
      /* Blüten und Samenstände, vereinzelt, nachts fast unsichtbar */
      bluemchen.forEach(function (b) {
        var y = ky('wiese', b.x) + b.t * m.H * 0.07 + 2;
        g.fillStyle = rgba(F.bluete[licht][b.f], licht === 'nacht' ? 0.35 : 0.85); g.beginPath(); g.arc(b.x, y - b.h, 0.9 + b.t * 1.1, 0, Math.PI * 2); g.fill();
      });
      kornAuf(g, oben, unten, 0.06);
      fussgras(huelle, licht);
    });
    if (AKTIV.indexOf('tag') < 0) return;
    figurenZeichnen();
  }

  var GRAS_GRUPPEN = 2, windHuellen = [];
  function gras(ebene) {
    /* etwas über den unteren Rand hinaus, falls das Bild nach dem Zeichnen noch höher wird */
    var oben = m.H * 0.8, unten = m.H * 1.15;
    for (var gr = 0; gr < GRAS_GRUPPEN; gr++) {
      var wind = windHuellen[gr];
      if (!wind) {
        wind = document.createElement('div');
        wind.className = 'szene__wind szene__wind--' + gr; wind.style.top = oben + 'px'; wind.style.height = (unten - oben) + 'px';
        ebene.appendChild(wind); windHuellen[gr] = wind;
      }
      var r = zufall(900 + gr), halme = [], n = Math.round(m.W * (gr ? 0.55 : 0.85));
      for (var i = 0; i < n; i++) {
        var x = r() * (m.W + 40) - 20, t = r();
        halme.push({ x: x, y: m.H - t * m.H * (gr ? 0.03 : 0.07) + 4, h: m.H * (gr ? 0.06 + r() * 0.1 : 0.035 + r() * 0.07) * (1 - t * 0.3), neig: (r() - 0.45) * (gr ? 0.5 : 0.7), b: gr ? 1.6 + r() * 2.2 : 1 + r() * 1.4, f: Math.floor(r() * 5), aehre: r() < (gr ? 0.08 : 0.045) });
      }
      halme.sort(function (a, b) { return a.y - b.y; });
      AKTIV.forEach(function (licht) {
        var p = F.gras[licht], c = document.createElement('canvas'), q = m.q;
        var o2 = oben - m.H * 0.14;
        c.width = Math.ceil(m.W * q); c.height = Math.ceil((unten - o2) * q);
        c.style.top = (o2 - oben) + 'px'; c.style.height = (unten - o2) + 'px'; c.className = 'szene__bild'; c.setAttribute('data-licht', licht);
        var g = c.getContext('2d'); g.setTransform(q, 0, 0, q, 0, -o2 * q);
        halme.forEach(function (h) {
          halm(g, h.x, h.y, h.h, h.neig, h.b, p.halm[h.f], p.kante, p.kanteA * (licht === 'tag' ? 0.45 : naehe(licht, h.x) * 0.8 + 0.2));
          /* einzelne Halme tragen einen Samenstand (schmale Ähre an der Spitze) */
          if (h.aehre) {
            var ax = h.x + h.neig * h.h, ay = h.y - h.h;
            g.save(); g.translate(ax, ay); g.rotate(Math.atan2(h.neig, 1) * 0.8);
            g.fillStyle = mixHex(p.halm[h.f], '#000000', 0.15); g.beginPath(); g.ellipse(0, -h.b * 1.6, h.b * 0.55, h.b * 2.2, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = rgba(p.kante, p.kanteA * (licht === 'tag' ? 0.35 : naehe(licht, h.x) * 0.7)); g.beginPath(); g.ellipse(h.b * 0.2, -h.b * 1.7, h.b * 0.25, h.b * 1.8, 0, 0, Math.PI * 2); g.fill();
            g.restore();
          }
        });
        wind.appendChild(c);
      });
    }
  }

  /* ---------- ERGUN. und sein Hund (26.09.2026, ERGUN.: „erkennbar, im Stil der Seite, richtig stehen“) ----------
     Echte Freistellungen im Licht der Szene (bilder/hero/figuren/, erstellt mit bilder/hero/4k/szene2/figuren.py):
     je Figur ein Tag- und ein Abendbild und für die Nacht die Bildfolge – der Hund hebt den Kopf und jault, ERGUN. winkt
     („Tschüss“). Beides startet gemeinsam, sobald es Nacht ist und man weiterscrollt, und läuft dann in eigener Zeit ab
     (so sieht man es sicher, bevor endo Studio kommt); beim Hochscrollen läuft es rückwärts. */
  /* 28.09. später (ERGUN.: „flüssig und sauber“): winken_fluss.py – winken2-v1 0,75–4,45 s, BiRefNet, feste Figur + Armzone, echte Zwischenbilder (48/s), ohne Überblendung; Werte aus figuren/emre.json */
  var EMRE_ALT = { b: 215, h: 600, anzahl: 163, spalten: 12, fuss: 0.9964, oben: 0.0054, mitte: 0.5588, breite: 0.842, einzeln: true, ausschnitt: [0, 8, 151, 374] };   /* 28.09. nachts: Higgsfield-Bild V1 + Kling-Winken (winken_neu.py + winken_fest.py, 48 Bilder/s, figuren/emre.json) – seit Auftrag 31 nur noch ?figur=alt */
  /* Auftrag 31 (29./30.09., ERGUN.: stilisierte 3D-Figur): geht beim Runterscrollen ein paar Schritte nach vorn und zeigt auf die mittlere
     Karte „Was brauchen Sie?“. Bild = Scroll-Fortschritt (geglättet), rückwärts beim Hochscrollen. Kling-Video api_a24d0f0d,
     gehen_masken.py + gehen_zeigen.py → figuren/emre3d*.webp + emre3d.json (Werte unten daraus, `fuesse` = je Bild Fußmitte x, Fußlinie y, Größe). */
  var EMRE_3D = /*EMRE3D*/{"b":226,"h":600,"anzahl":80,"spalten":8,"proBlatt":40,"blaetter":2,"fuss":0.9117,"oben":0.0567,"mitte":0.5,"breite":0.6903,"fuesse":[[0.5442,0.9117,1.0008],[0.5442,0.9117,1.0012],[0.5442,0.9117,1.0021],[0.5442,0.9117,1.0036],[0.5442,0.915,1.0053],[0.5442,0.915,1.0069],[0.5442,0.915,1.0084],[0.542,0.915,1.0099],[0.542,0.9167,1.0113],[0.542,0.9167,1.0129],[0.542,0.9183,1.0148],[0.542,0.92,1.0172],[0.5398,0.92,1.02],[0.5354,0.9217,1.0234],[0.5265,0.9233,1.0271],[0.5265,0.9283,1.0309],[0.5265,0.93,1.0346],[0.5243,0.9283,1.0385],[0.5243,0.93,1.0432],[0.5022,0.9383,1.0489],[0.4912,0.9433,1.0557],[0.4912,0.9483,1.0633],[0.4889,0.9533,1.0713],[0.4956,0.9583,1.0795],[0.5111,0.965,1.0874],[0.6416,0.9667,1.0945],[0.6416,0.97,1.1004],[0.6416,0.9717,1.1051],[0.6416,0.9717,1.1089],[0.6416,0.9733,1.1121],[0.6416,0.9733,1.1148],[0.6416,0.975,1.1173],[0.6416,0.975,1.1196],[0.6416,0.975,1.122],[0.6416,0.975,1.1246],[0.6416,0.9783,1.1274],[0.6438,0.98,1.1301],[0.6438,0.9817,1.1325],[0.6438,0.9817,1.1346],[0.6438,0.9817,1.1364],[0.6438,0.9833,1.1379],[0.6438,0.9833,1.1393],[0.6416,0.9833,1.1405],[0.6416,0.9833,1.1417],[0.6416,0.985,1.1428],[0.6416,0.985,1.1438],[0.6416,0.985,1.1448],[0.6416,0.9867,1.1457],[0.5022,0.9867,1.1465],[0.5,0.9883,1.1472],[0.4956,0.9883,1.1477],[0.5,0.99,1.1481],[0.4978,0.99,1.1483],[0.5,0.9917,1.1483],[0.4978,0.9917,1.1483],[0.5,0.9933,1.1483],[0.4912,0.99,1.1483],[0.4934,0.985,1.1483],[0.5088,0.9783,1.1483],[0.5243,0.9733,1.1483],[0.5354,0.9717,1.1483],[0.5442,0.9667,1.1483],[0.5487,0.965,1.1483],[0.5531,0.965,1.1483],[0.5553,0.965,1.1483],[0.5553,0.9667,1.1483],[0.5531,0.9667,1.1483],[0.5531,0.9667,1.1483],[0.5531,0.9683,1.1483],[0.5531,0.9683,1.1483],[0.5531,0.97,1.1483],[0.5553,0.97,1.1483],[0.5531,0.9717,1.1483],[0.5531,0.9717,1.1483],[0.5531,0.9733,1.1483],[0.5531,0.9733,1.1483],[0.5531,0.975,1.1483],[0.5531,0.975,1.1483],[0.5531,0.9767,1.1483],[0.5531,0.9767,1.1483]],"datei":"emre3d","einzeln":true}/*EMRE3D*/;
  /* bis ERGUN. die Aufnahme freigibt: neue Figur nur mit ?figur=neu (falls vorher jemand veröffentlicht, bleibt live die alte);
     nach dem OK: FIGUR_NEU_STANDARD = true + Vorladen in index.html auf emre3d-folge-1/-2 */
  var FIGUR_NEU_STANDARD = true;
  var FIGUR_ALT = !EMRE_3D || (FIGUR_NEU_STANDARD ? /[?&]figur=alt\b/.test(location.search) : !/[?&]figur=neu\b/.test(location.search));
  var FIGUREN = { hund: { b: 318, h: 360, anzahl: 36, spalten: 6, fuss: 0.9921, oben: 0.0896, mitte: 0.4201, breite: 0.7716 }, emre: FIGUR_ALT ? EMRE_ALT : EMRE_3D };
  var E3D = !FIGUR_ALT, GEHEN_TEST = parseFloat((location.search.match(/[?&]gehen=([0-9.]+)/) || [])[1]);
  if (isNaN(GEHEN_TEST)) GEHEN_TEST = -1; else GEHEN_TEST = Math.min(1, GEHEN_TEST);
  /* Tempo (27.09. spät, ERGUN.): ERGUN. und Hund laufen NUR nach Zeit, jeder in seinem festen Tempo, unabhängig vom Scrollen.
     ERGUN. winkt einmal (FIG_DAUER), der Hund hebt den Kopf in HUND_HOCH und senkt ihn in HUND_RUNTER. */
  var FIG_DAUER = 3.4, HUND_HOCH = 2.5, HUND_RUNTER = 2.0, lichtGold = 0, lichtBlau = 0, lichtNacht = 0, FIG_VERSION = 19;   /* 28.09. später (ERGUN.: „flüssig und sauber“): winken_fluss.py – 0,75–4,45 s aus winken2-v1, 48 Bilder/s mit echten Zwischenbildern, echte Geschwindigkeit (3,7 s) */
  /* Lage von Sonne und Mond (für Wolken, js/wolken.js) und wie stark das Gestirn gerade verdeckt ist (0–1, in Zehnteln) */
  var gest = { sy: 0, my: 0, sonneAn: 1, mondAn: 0 }, verdecktQ = 0, gestTest = null;
  var fig = { phase: 0, ziel: 0, laeuft: false }, hund = { phase: 0, ziel: 0, laeuft: false }, animT = 0, animLaeuft = false;
  var FIG_TEST = /[?&]figuren=test\b/.test(location.search);
  /* Winken (26.09., ERGUN.): sofort beim ersten Runterwischen von ganz oben, einmal – erst nach erneutem
     Seitenanfang wieder. Sind die Einzelbilder noch nicht geladen, wartet das Winken kurz auf sie. Läuft immer im selben
     Tempo zu Ende (auch wenn man wegscrollt) und endet in der Ruhepose. */
  var gewunken = false, winkenWartet = false;
  function folgenDa() { return Object.keys(FIGUREN).every(function (k) { return !!FIGUREN[k].folge; }); }
  function winken() {
    if (fig.laeuft) return;                         /* läuft noch – nicht neu ansetzen (kein Sprung) */
    if (!FIGUREN.emre.folge) { winkenWartet = true; return; }
    winkenWartet = false; fig.phase = 0; fig.ziel = 1; fig.laeuft = true; animStart();
  }
  /* Hund: die Scrollposition entscheidet nur OB (Nacht erreicht → Kopf hoch und jaulen, zurück Richtung Tag → Kopf senken),
     das Tempo ist fest. Richtungswechsel mitten drin: aus der aktuellen Pose weich umkehren. */
  function hundZiel(z) {
    if (ruhig || !FIGUREN.hund.folge || hund.ziel === z) return;
    hund.ziel = z; hund.laeuft = true; animStart();
  }
  function hundPruefen() { if (lichtNacht >= 0.9) hundZiel(1); else if (lichtNacht <= 0.5) hundZiel(0); }
  function figurLaden(name, folge) {
    var f = FIGUREN[name];
    /* 3D-Figur (Auftrag 31): Bildfolge in mehreren kleineren Rastern (iPhone dekodiert sicher); erst wenn ALLE fertig dekodiert
       sind, wird die Folge freigegeben – vorher steht das Standbild. „Bewegung reduzieren“: nur die Endpose als Standbild. */
    if (f.datei) {
      if (!folge) { var sb = new Image(); sb.decoding = 'async'; sb.onload = function () { f.bild = sb; f.zuletzt = ''; figurenZeichnen(); }; sb.src = 'bilder/hero/figuren/' + f.datei + (ruhig ? '-ende' : '') + '.webp?v=' + FIG_VERSION; return; }
      var teile = [], offen = f.blaetter;
      for (var k = 0; k < f.blaetter; k++) (function (k) {
        var bl = new Image(); bl.decoding = 'async';
        bl.onload = function () {
          var fertig = function (bild) { teile[k] = bild; if (--offen === 0) { f.folgen = teile; f.folge = teile[0]; f.zuletzt = ''; figurenZeichnen(); if (fig.ziel !== fig.phase) gehenZiel(fig.ziel); } };   /* schon gescrollt, bevor alles dekodiert war: jetzt loslaufen */
          (window.createImageBitmap ? createImageBitmap(bl) : (bl.decode ? bl.decode().then(function () { return bl; }) : Promise.resolve(bl))).then(fertig, function () { fertig(bl); });
        };
        bl.src = 'bilder/hero/figuren/' + f.datei + '-folge-' + (k + 1) + '.webp?v=' + FIG_VERSION;
      })(k);
      return;
    }
    var b = new Image(); b.decoding = 'async';
    b.onload = function () {
      var fertig = function (bild) { f[folge ? 'folge' : 'bild'] = bild; f.zuletzt = ''; figurenZeichnen(); if (folge && name === 'emre' && winkenWartet) winken(); if (folge && name === 'hund') hundPruefen(); };
      /* 28.09. (ERGUN.): Die Bildfolge wird erst VOLLSTÄNDIG dekodiert (createImageBitmap bzw. decode) und dann freigegeben –
         das Winken startet nie mit halben oder leeren Bildern und ruckelt nicht beim ersten Zeichnen. */
      var p = folge && window.createImageBitmap ? createImageBitmap(b) : (b.decode ? b.decode().then(function () { return b; }) : Promise.resolve(b));
      p.then(fertig, function () { fertig(b); });
    };
    b.src = 'bilder/hero/figuren/' + name + (folge ? '-folge' : '') + '.webp?v=' + FIG_VERSION;
  }
  Object.keys(FIGUREN).forEach(function (k) { FIGUREN[k].zuletzt = ''; figurLaden(k, false); });
  /* Grundbild für ERGUN. (Figur ohne Armzone, klein) gleich mit dem Standbild laden */
  if (FIGUREN.emre.ausschnitt && !ruhig) { var gb = new Image(); gb.decoding = 'async'; gb.onload = function () { FIGUREN.emre.grundBild = gb; FIGUREN.emre.zuletzt = ''; figurenZeichnen(); }; gb.src = 'bilder/hero/figuren/emre-grund.webp?v=' + FIG_VERSION; }
  /* die Bildfolgen (groß) erst nach dem Laden der Seite */
  function folgenLaden() { if (!ruhig) Object.keys(FIGUREN).forEach(function (k) { figurLaden(k, true); }); }
  if (document.readyState === 'complete') setTimeout(folgenLaden, 200); else window.addEventListener('load', function () { setTimeout(folgenLaden, 200); });
  /* Licht auf den Figuren, live aus denselben Werten wie die Landschaft (26.09., ERGUN.: „der Realität entsprechen, Stück für Stück“):
     Tag → Abend (gold) → blaue Stunde (blau) → Nacht, in beide Richtungen. mul = Belichtung und Farbe (multiplikativ),
     lift = Aufhellung der Schatten durch Himmels- bzw. Mondlicht, rim = Lichtsaum links oben (Sonne bzw. Mond stehen links). */
  var FIGLICHT = {
    tag:   { mul: [0.9, 0.91, 0.93], lift: [0, 0, 0], rim: [255, 246, 216], ra: 0.32 },
    gold:  { mul: [0.6, 0.46, 0.4], lift: [0.04, 0.02, 0.03], rim: [255, 182, 100], ra: 0.9 },
    blau:  { mul: [0.3, 0.34, 0.44], lift: [0.02, 0.03, 0.06], rim: [176, 196, 240], ra: 0.5 },
    nacht: { mul: [0.27, 0.32, 0.45], lift: [0.035, 0.05, 0.085], rim: [176, 202, 255], ra: 0.68 }   /* 27.09.: kräftigere Mondkante – Umriss, Arm, Hand und Hundekopf heben sich ab */
  };
  function figurLicht() {
    var l = { mul: [0, 0, 0], lift: [0, 0, 0], rim: [0, 0, 0], ra: 0 };
    ['mul', 'lift', 'rim'].forEach(function (k) {
      for (var i = 0; i < 3; i++) {
        var v = FIGLICHT.tag[k][i];
        v = mix(v, FIGLICHT.gold[k][i], lichtGold); v = mix(v, FIGLICHT.blau[k][i], lichtBlau); v = mix(v, FIGLICHT.nacht[k][i], lichtNacht);
        l[k][i] = v;
      }
    });
    l.ra = mix(mix(mix(FIGLICHT.tag.ra, FIGLICHT.gold.ra, lichtGold), FIGLICHT.blau.ra, lichtBlau), FIGLICHT.nacht.ra, lichtNacht);
    l.ra *= 1 - 0.35 * verdecktQ;   /* Gestirn hinter einer Wolke (js/wolken.js): Lichtsaum ganz leicht schwächer */
    return l;
  }
  function rgbStr(a, s) { return 'rgb(' + Math.round(a[0] * s) + ',' + Math.round(a[1] * s) + ',' + Math.round(a[2] * s) + ')'; }
  function hilfsLeinwand(f, name, w, h) { var c = f[name] || (f[name] = document.createElement('canvas')); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return c; }
  /* nr darf gebrochen sein: zwischen zwei Einzelbildern wird weich überblendet (additiv, dadurch ohne Geisterbild) */
  function figurZeichnen(f, nr, l) {
    var c = f.leinwand; if (!c || !f.bild) return;
    if (!f.folge) nr = 0;
    /* Winken von vorher (ERGUN., 27.09.: „die davor passt besser“): zwischen zwei Einzelbildern weich überblenden, in Achtelschritten. */
    nr = Math.max(0, Math.min(f.anzahl - 1, nr));
    if (f.einzeln) nr = Math.round(nr);   /* ERGUN. (28.09.): jedes Videobild einzeln, keine Überblendung */
    var n0 = Math.floor(nr), t = Math.round((nr - n0) * 8) / 8, n1 = Math.min(f.anzahl - 1, n0 + 1);
    if (t >= 1) { n0 = n1; t = 0; }
    var schluessel = n0 + '|' + t + '|' + lichtGold.toFixed(2) + '|' + lichtBlau.toFixed(2) + '|' + lichtNacht.toFixed(2) + '|' + verdecktQ + '|' + (f.fade || '') + '|' + (f.hell || 0).toFixed(3);
    if (schluessel === f.zuletzt) return;
    f.zuletzt = schluessel;
    var W = c.width, H = c.height;
    var A = hilfsLeinwand(f, 'lwA', W, H), B = hilfsLeinwand(f, 'lwB', W, H), C = hilfsLeinwand(f, 'lwC', W, H);
    var ga = A.getContext('2d'), gb = B.getContext('2d'), gc = C.getContext('2d');
    /* 1. Bild */
    ga.globalCompositeOperation = 'source-over'; ga.globalAlpha = 1; ga.clearRect(0, 0, W, H);
    if (f.folge && f.ausschnitt) {
      /* 28.09. später (winken_fluss.py): festes Grundbild (Kopf/Oberkörper still) + je Bild nur der Armzonen-Ausschnitt, additiv
         ('lighter' addiert vormultipliert: Grund · (1 − w) + Bild · w = genau das Einzelbild, ohne Naht). Fehlt das Grundbild noch: Standbild. */
      if (f.grundBild) {
        var z = f.ausschnitt, sx = W / f.b, sy = H / f.h;
        ga.drawImage(f.grundBild, 0, 0, W, H);
        ga.globalCompositeOperation = f.modus === 'arm' ? 'source-over' : 'lighter';   /* 'arm': feste Körperplatte, nur der Arm darüber */
        ga.drawImage(f.folge, (n0 % f.spalten) * z[2], Math.floor(n0 / f.spalten) * z[3], z[2], z[3], z[0] * sx, z[1] * sy, z[2] * sx, z[3] * sy);
      } else ga.drawImage(f.bild, 0, 0, W, H);
    }
    else if (f.folgen) {
      /* 3D-Figur: jedes Bild ein echtes Videobild aus seinem Raster, keine Überblendung */
      var k0 = n0 % f.proBlatt;
      ga.drawImage(f.folgen[Math.floor(n0 / f.proBlatt)], (k0 % f.spalten) * f.b, Math.floor(k0 / f.spalten) * f.h, f.b, f.h, 0, 0, W, H);
    }
    else if (f.folge) {
      ga.globalAlpha = 1 - t; ga.drawImage(f.folge, (n0 % f.spalten) * f.b, Math.floor(n0 / f.spalten) * f.h, f.b, f.h, 0, 0, W, H);
      if (t > 0) { ga.globalCompositeOperation = 'lighter'; ga.globalAlpha = t; ga.drawImage(f.folge, (n1 % f.spalten) * f.b, Math.floor(n1 / f.spalten) * f.h, f.b, f.h, 0, 0, W, H); }
    }
    else ga.drawImage(f.bild, 0, 0, W, H);
    ga.globalCompositeOperation = 'source-over'; ga.globalAlpha = 1;
    /* 2. Umriss merken */
    gb.globalCompositeOperation = 'source-over'; gb.globalAlpha = 1; gb.clearRect(0, 0, W, H); gb.drawImage(A, 0, 0);
    /* 3. Belichtung und Farbe, Schatten aufhellen, Umriss wiederherstellen */
    ga.globalCompositeOperation = 'multiply'; ga.fillStyle = rgbStr(l.mul, 255); ga.fillRect(0, 0, W, H);
    ga.globalCompositeOperation = 'lighter'; ga.fillStyle = rgbStr(l.lift, 255); ga.fillRect(0, 0, W, H);
    ga.globalCompositeOperation = 'destination-in'; ga.drawImage(B, 0, 0);
    /* 4. Lichtsaum: Umriss minus nach rechts unten versetzter Umriss = schmaler Streifen links oben, in Saumfarbe */
    if (l.ra > 0.02) {
      var d = Math.max(1, H * 0.003);   /* 27.09.: schmaler – schmale Teile (Hand) bleiben erkennbar */
      gc.globalCompositeOperation = 'source-over'; gc.globalAlpha = 1; gc.clearRect(0, 0, W, H); gc.drawImage(B, d, d * 0.45);
      gb.globalCompositeOperation = 'destination-out'; gb.drawImage(C, 0, 0);
      gb.globalCompositeOperation = 'source-in'; gb.fillStyle = rgbStr(l.rim, 1); gb.fillRect(0, 0, W, H);
      ga.globalCompositeOperation = 'source-over'; ga.globalAlpha = l.ra; ga.drawImage(B, 0, 0); ga.globalAlpha = 1;
    }
    /* 4b. Auftrag 36 (Variante B): die ganze Figur hellt zum Licht der Szene hin auf (Farbe des Lichtsaums: Tag warm, Nacht kühles Mondlicht) –
       eine Farbe über dem ganzen Umriss (source-atop), die Figur wird dabei nicht durchsichtig */
    if (f.hell > 0.004) { ga.globalCompositeOperation = 'source-atop'; ga.globalAlpha = Math.min(1, f.hell) * AUS_B_HELL; ga.fillStyle = rgbStr(l.rim, 1); ga.fillRect(0, 0, W, H); ga.globalAlpha = 1; ga.globalCompositeOperation = 'source-over'; }
    /* 5. 3D-Figur über der Erde (Auftrag 34): unten derselbe dunkle Verlauf wie .szene__fade, nur auf der Figur (source-atop) */
    if (f.fade && f.fade[0] - f.fade[1] < H) {
      var fg = ga.createLinearGradient(0, f.fade[0] - f.fade[1], 0, f.fade[0]);
      FADE.forEach(function (s) { fg.addColorStop(1 - s[0], 'rgba(7,11,22,' + s[1] + ')'); });
      ga.globalCompositeOperation = 'source-atop'; ga.globalAlpha = 1; ga.fillStyle = fg; ga.fillRect(0, 0, W, H); ga.globalCompositeOperation = 'source-over';
    }
    var g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(A, 0, 0);
  }
  /* 28.09. (ERGUN.: „smoother, nicht wie editiert“): ERGUN. winkt jetzt mit JEDEM Videobild (24 pro Sekunde, winken_voll.py) und in
     echter Geschwindigkeit – gleichmäßig durch die Zeit, ohne eigene Tempokurve (das Video bringt sein natürliches Anheben und
     Senken selbst mit; eine zusätzliche Kurve hat die Mitte beschleunigt) und ohne Überblendung zweier Bilder (Geisterbild). */
  function figurenZeichnen() {
    var l = figurLicht(), E = FIGUREN.emre, H = FIGUREN.hund, h = hund.phase * hund.phase * (3 - 2 * hund.phase);
    E.hell = aus.hell * aus.hell * (3 - 2 * aus.hell);   /* weich an beiden Enden */
    figurZeichnen(H, h * (H.anzahl - 1), l);
    figurZeichnen(E, fig.phase * (E.anzahl - 1), l);
    /* 3D-Figur: Fußgras steht dort, wo das gerade gezeigte Bild die Füße hat (Standbild vor dem Laden = Bild 0, „Bewegung reduzieren“ = Endpose) */
    if (E.fuesse) fussMitgehen(E, E.folgen ? Math.round(Math.max(0, Math.min(1, fig.phase)) * (E.anzahl - 1)) : (ruhig ? E.anzahl - 1 : 0));
  }
  /* 3D-Figur (Auftrag 34, ERGUN.: „zu schnell, man sieht das Zeigen nicht“): NICHT mehr am Scrollwert. Beim ersten Runterscrollen von ganz
     oben startet die Bewegung EINMAL und läuft in Videotempo ab (Bilder 10–104 bei 24/s = 3,9 s, alle 80 Bilder gleichmäßig durch die Zeit –
     das Video bringt weiches Losgehen und Ankommen selbst mit). Erst ganz oben geht die Figur im selben Tempo zurück. */
  var FIG3D_DAUER = 3.9, gegangen = false;
  /* Auftrag 36 (30.09.2026, Ausnahme auf ERGUNs Wunsch): Hat der Besucher gewählt (Schritt ① verlassen, Ereignis „preise:schritt“ aus js/preise.js),
     ist der Job der Figur erledigt – sie verschwindet ruhig, sobald sie das Titelbild nach oben verlässt (dort stand sie bisher über der Auswahl).
     Ausgeblendet wird sie als EINE Ebene (Hülle .szene__figur: opacity/transform/filter per CSS), nie Bild für Bild gemischt.
     ?ausblenden=a „tritt zurück“: Video-Bilder rückwärts (ein, zwei Schritte), etwas kleiner, Tiefenunschärfe.
     ?ausblenden=b „löst sich im Licht“: die ganze Figur hellt zum Licht der Szene auf (Tag warm, Nacht Mondlicht) und zerfließt.
     Ganz oben oder zurück in Schritt ① kommt sie weich wieder. „Bewegung reduzieren“: nur kurzes Ausblenden (CSS, 250 ms). Der Hund bleibt. */
  var AUS_STANDARD = 'a', AUS_ART = (location.search.match(/[?&]ausblenden=([ab])(?![a-z])/) || [])[1] || AUS_STANDARD;
  var AUS_AN = !!window.ERGUN_A36 || /[?&]ausblenden=[ab](?![a-z])/.test(location.search);   /* Schalter in index.html: bis zu ERGUNs OK nur mit ?ausblenden=a|b */
  var AUS_B_DAUER = 1.2, AUS_B_HELL = 0.46, AUS_A_TEMPO = 1.5, AUS_A_ZURUECK = 0.55;
  var aus = { erledigt: false, weg: false, hell: 0, hellZiel: 0, T: 0 };
  document.addEventListener('preise:schritt', function (e) { aus.erledigt = !!(e.detail && e.detail.schritt !== 'art'); if (bereit) { zeichne(true); ausPruefen(); } });   /* erst den Stand auffrischen (Hintergrund-Tab: der Bildtakt steht), dann entscheiden */
  function ausPruefen() {
    if (!AUS_AN || !E3D || !FIGUREN.emre.leinwand || !isNaN(festP) || FIG_TEST || GEHEN_TEST >= 0) return;
    var unten = ruhig ? letztesP > 0.003 : gegangen;
    var soll = aus.erledigt && unten && (aus.weg || !!halten.drueber);
    if (soll === aus.weg) return;
    if (!soll && !unten && !ruhig) { fig.phase = fig.ziel = 0; fig.laeuft = false; }   /* ganz oben und noch unsichtbar: gleich die Startpose, dann weich einblenden */
    ausSetzen(soll);
  }
  function ausSetzen(weg) {
    aus.weg = weg;
    var E = FIGUREN.emre, h = E.huelle3d;
    if (h) {
      if (weg && E.fuesse) { var fu = E.fuesse[Math.max(0, E.fussN)] || E.fuesse[0]; h.style.transformOrigin = (fu[0] * E.zw).toFixed(1) + 'px ' + (fu[1] * E.zh + halten.dy).toFixed(1) + 'px'; }   /* kleiner werden um die Füße */
      h.classList.toggle('ist-weg', weg);
    }
    held.classList.toggle('szene--figur-weg', weg);   /* Fußgras, Schatten und Mondschein der Figur blenden mit */
    fig.tempo = 1;
    if (!weg) figurHalten(rohY);
    if (ruhig) return;
    if (AUS_ART === 'a') { if (weg) { fig.tempo = AUS_A_TEMPO; gehenZiel(Math.max(0, fig.phase - AUS_A_ZURUECK)); } else if (gegangen) gehenZiel(1); else figurenZeichnen(); }
    else { aus.hellZiel = weg ? 1 : 0; animStart(); }
    clearTimeout(aus.T);   /* Endstand auch ohne Bildtakt (Hintergrund-Tab: requestAnimationFrame steht) */
    aus.T = setTimeout(function () { if (AUS_ART !== 'a' && aus.hell !== aus.hellZiel) { aus.hell = aus.hellZiel; figurenZeichnen(); } }, 1800);
  }
  function gehenZiel(z) {
    fig.ziel = z;
    if (!FIGUREN.emre.folgen) return;                 /* Bildfolge noch nicht dekodiert: startet, sobald sie da ist (figurLaden) */
    if (fig.phase !== z) { fig.laeuft = true; animStart(); }
  }
  /* Figur im Bild halten (Auftrag 34, Weg B): Scrollt man zu den Karten, würde der Kopf oben aus dem Fenster laufen, bevor die Karten ganz
     zu sehen sind. Die Figur bleibt deshalb weich oben im Fenster „stehen“ (nur transform auf ihrer Leinwand + ihrem Fußgras), bis die Karten
     vollständig sichtbar sind, und scrollt danach mit der Seite weg. Die Beine laufen dabei in die dunkle Unterkante des Titelbilds. */
  var halten = { dy: 0, bis: 0, oben: 8 };
  /* Loslassen (Emre, 30.09.): Desktop und große Handys, sobald die drei Karten ganz im Bild sind. Kleine Handys (375 × 667 u. ä.: dort bliebe
     vom Titelbild bei ganz sichtbaren Karten weniger Platz als Kopf bis Hand der Figur): sobald Überschrift „Was brauchen Sie?“ und der Anfang
     der ersten Karte (48 px) im Bild sind – danach scrollt die Figur ganz normal mit weg. */
  function gehenMessen() {
    var k = document.querySelector('#preise .mf-karten'), y0 = leseY(), H = window.innerHeight;
    halten.oben = Math.max(8, H * 0.03);
    if (!k) { halten.bis = heldOben + m.H; return; }
    var kr = k.getBoundingClientRect(), voll = kr.bottom + y0 - H, frueh = kr.top + y0 + 48 - H;
    var streifen = (heldOben + m.H) - voll, figur = FIGUREN.emre.zh || m.H * 0.3;   /* sichtbares Titelbild bei ganz sichtbaren Karten */
    halten.klein = streifen < figur * 0.55;
    halten.bis = halten.klein ? frueh : voll;
  }
  /* Lage der Figur im Fenster OHNE die Ausblend-Verwandlung ihrer Hülle (Auftrag 36: die Hülle wird beim Ausblenden kleiner/unscharf) */
  function figurLage(c) {
    var h = FIGUREN.emre.huelle3d, p = h && h.parentNode;
    if (!p) { var r = c.getBoundingClientRect(); return { top: r.top, sk: r.height / (parseFloat(c.style.height) || r.height || 1) }; }
    var pr = p.getBoundingClientRect(), sk = pr.height / (p.offsetHeight || pr.height || 1);
    return { top: pr.top + (parseFloat(h.style.top) + halten.dy) * sk, sk: sk };
  }
  function figurHalten(y) {
    var E = FIGUREN.emre, c = E.leinwand;
    if (!E3D || !c) return;
    var r = figurLage(c), sk = r.sk, dy = 0, kn = 30;
    var x = halten.oben - (r.top - halten.dy * sk);                      /* wie weit der Kopf ohne Halten über die Haltelinie liefe */
    halten.drueber = x > -kn;                                            /* die Figur verlässt das Titelbild nach oben (Auftrag 36: nach der Wahl blendet sie hier aus) */
    if (aus.weg) { figurMaske(c, r.top, sk); return; }                   /* ausgeblendet: nichts nachführen (scrollt mit der Szene) */
    if (!ruhig && isNaN(festP) && !FIG_TEST) {
      var noetig = x <= -kn ? 0 : (x >= kn ? x : (x + kn) * (x + kn) / (4 * kn));   /* weicher Einsatz statt Knick */
      if (y > halten.bis) noetig = Math.max(0, noetig - (y - halten.bis));    /* Karten ganz im Bild: ab hier scrollt die Figur mit weg */
      dy = Math.round(noetig / sk * 10) / 10;
    }
    if (dy !== halten.dy) {
      var oben = r.top + (dy - halten.dy) * sk;
      halten.dy = dy;
      c.style.transform = dy ? 'translate3d(0,' + dy + 'px,0)' : '';
      fussMitgehen(E, E.fussN, true);
      figurMaske(c, oben, sk);
    } else figurMaske(c, r.top, sk);
  }
  /* Die Figur liegt über .szene__fade und .szene__erde – damit sie unten trotzdem genauso ins Dunkel läuft wie die Wiese, wird derselbe
     Verlauf wie .szene__fade (untere 36 % des Titelbilds, #070B16) beim Zeichnen auf die Figur gelegt (abdunkeln, NICHT durchsichtig –
     eine Maske ließ bei Tag die Wiese durch die Hose scheinen). figurMaske rechnet nur die Lage in Leinwand-Pixel um. */
  var FADE = [[1, 0], [0.75, 0.16], [0.45, 0.5], [0.16, 0.88], [0, 1]];
  function figurMaske(c, oben, sk) {
    var E = FIGUREN.emre, b = buehne.getBoundingClientRect(), q = c.height / (parseFloat(c.style.height) || c.height);
    /* gehalten (oben im Fenster über den Karten): Verlauf auf ein Drittel zusammenziehen – Kopf, Arm und Hand bleiben hell, die Beine laufen an der Kante ins Dunkel */
    var kurz = 1 - 0.68 * Math.min(1, halten.dy / 60);
    var u = Math.round((b.bottom - oben) / sk * q / 2) * 2, h = Math.round(b.height * 0.36 * kurz / sk * q / 2) * 2;   /* Unterkante + Höhe des Verlaufs, Leinwand-Pixel (2-px-Raster) */
    if (E.fade && E.fade[0] === u && E.fade[1] === h) return;
    E.fade = [u, h]; E.zuletzt = ''; figurZeichnen(E, fig.phase * (E.anzahl - 1), figurLicht());
  }
  /* eine Bildschleife für beide, nur solange sich etwas bewegt; Delta-Zeit → gleich schnell auf 60 und 120 Hz */
  function animStart() { if (!animLaeuft) { animLaeuft = true; animT = performance.now(); requestAnimationFrame(animLauf); } }
  function animLauf(t) {
    var dt = Math.min(0.1, Math.max(0, (t - animT) / 1000)); animT = t;
    if (fig.laeuft && E3D) {   /* 3D-Figur: zum Ziel (1 = Zeigepose, 0 = Start) im Videotempo, Richtungswechsel aus der aktuellen Pose */
      var rg = fig.ziel > fig.phase ? 1 : -1;
      fig.phase = Math.max(0, Math.min(1, fig.phase + rg * dt / FIG3D_DAUER * (fig.tempo || 1)));
      if ((rg > 0 && fig.phase >= fig.ziel) || (rg < 0 && fig.phase <= fig.ziel)) { fig.phase = fig.ziel; fig.laeuft = false; }
    }
    else if (fig.laeuft) { fig.phase = Math.min(1, fig.phase + dt / FIG_DAUER); if (fig.phase >= 1) fig.laeuft = false; }
    if (hund.laeuft) {
      var r = hund.ziel > hund.phase ? 1 : -1;
      hund.phase = Math.max(0, Math.min(1, hund.phase + r * dt / (r > 0 ? HUND_HOCH : HUND_RUNTER)));
      if ((r > 0 && hund.phase >= hund.ziel) || (r < 0 && hund.phase <= hund.ziel)) { hund.phase = hund.ziel; hund.laeuft = false; }
    }
    if (aus.hell !== aus.hellZiel) {   /* Auftrag 36 (Variante B): aufhellen in 90 % der Zeit, zurück in 0,6 s */
      var hr = aus.hellZiel > aus.hell ? 1 : -1;
      aus.hell = Math.max(0, Math.min(1, aus.hell + hr * dt / (hr > 0 ? AUS_B_DAUER * 0.9 : 0.6)));
    }
    figurenZeichnen();
    if (FIG_TEST && testAnzeige) testAnzeige();
    if (fig.laeuft || hund.laeuft || aus.hell !== aus.hellZiel) requestAnimationFrame(animLauf); else animLaeuft = false;
  }
  var testAnzeige = null;
  /* ERGUN. und der Hund stehen nebeneinander auf der Kuppe – gleiche Entfernung, beide Füße auf dem Boden.
     Hund bis zu den Ohren ca. 0,9 m, ERGUN. ca. 1,8 m → ERGUN. knapp doppelt so hoch wie der stehende Hund. */
  function figurenStellen(ebene) {
    var huelle = ebene.querySelector('.szene__figuren');
    if (!huelle) { huelle = document.createElement('div'); huelle.className = 'szene__figuren'; ebene.appendChild(huelle); }
    var H = FIGUREN.hund, E = FIGUREN.emre, stand = m.H * (m.hoch ? 0.138 : 0.148), vorn = null;
    if (E3D && ebenen.vorn) { vorn = ebenen.vorn.querySelector('.szene__figuren'); if (!vorn) { vorn = document.createElement('div'); vorn.className = 'szene__figuren'; ebenen.vorn.appendChild(vorn); } }   /* Handy etwas größer (Nachtlauf): Winken und Hundekopf klar zu sehen */
    var hh = stand / (H.fuss - H.oben), hw = hh * H.b / H.h;
    var eh = stand * 1.95 / (E.fuss - E.oben), ew = eh * E.b / E.h;
    var hx = xVon(m.hundU), abstand = stand * 0.1;
    var ex = hx + hw * H.breite * 0.5 + abstand + ew * E.breite * 0.5;
    if (ex + ew * E.breite * 0.5 > m.W - 8) ex = hx - hw * H.breite * 0.5 - abstand - ew * E.breite * 0.5;
    /* nicht auf der Kammlinie (dort wirkt man schwebend), sondern ein Stück davor auf der Wiesenfläche –
       beide auf derselben Höhe = gleiche Entfernung; die Füße stehen ein wenig im Gras */
    var boden = Math.max(ky('wiese', hx - hw * 0.3), ky('wiese', hx + hw * 0.3), ky('wiese', ex - ew * 0.2), ky('wiese', ex + ew * 0.2)) + m.H * 0.022;
    var sinken = stand * 0.025;
    [[H, hx, hw, hh], [E, ex, ew, eh]].forEach(function (z) {
      var f = z[0], x = z[1] - z[2] * f.mitte, y = boden + sinken - z[3] * f.fuss;
      var c = f.leinwand || document.createElement('canvas');
      /* volle Schärfe (27.09.): so viele Pixel wie der Bildschirm hat (bis 3×), aber nie mehr als die Bildfolge selbst hergibt */
      var qf = Math.max(1, Math.min(window.devicePixelRatio || 1, 3, f.h / z[3]));
      c.className = 'szene__hund'; c.width = Math.ceil(z[2] * qf); c.height = Math.ceil(z[3] * qf);
      c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.width = z[2] + 'px'; c.style.height = z[3] + 'px';
      if (f === E && E3D && vorn) {   /* 3D-Figur: eigene Ebene über der Erde (Auftrag 34), in einer Hülle, die als Ganzes ausblendet (Auftrag 36) */
        var hu = E.huelle3d || document.createElement('div');
        hu.className = 'szene__figur' + (aus.weg ? ' ist-weg' : ''); hu.setAttribute('data-aus', AUS_ART);
        hu.style.left = x + 'px'; hu.style.top = y + 'px'; hu.style.width = z[2] + 'px'; hu.style.height = z[3] + 'px';
        c.style.left = '0px'; c.style.top = '0px';
        hu.appendChild(c); vorn.appendChild(hu); E.huelle3d = hu;
      }
      else if (f === E && !E3D) huelle.insertBefore(c, huelle.firstChild); else huelle.appendChild(c);   /* 3D-Figur geht nach vorn → vor dem Hund */
      f.leinwand = c; f.zuletzt = '';
      f.fussX = z[1]; f.fussB = z[2] * f.breite; f.fussY = boden + sinken * 0.4; f.stand = z[3] * (f.fuss - f.oben);
      if (f.fuesse) { f.fussX = x + z[2] * f.fuesse[0][0]; f.zw = z[2]; f.zh = z[3]; f.fussN = -1; }   /* 3D-Figur: Fußmitte aus Bild 0 (Arm macht die Zelle breiter) */
    });
    /* Mondlicht hinter den Figuren (Nachtlauf 27.09., ERGUN.: „Hand immer gut zu sehen“): schwacher, kühler Schein auf der Wiese
       hinter ERGUN. und dem Hund – nachts hebt sich der dunkle Umriss (Arm, Hand, Hundekopf) vom Hintergrund ab. Nur opacity (--nacht). */
    held.querySelectorAll('.szene__mondlicht').forEach(function (d) { d.remove(); });
    [[H, 1.0], [E, 0.8]].forEach(function (z) {
      var f = z[0], r = f.stand * z[1], d = document.createElement('div'); d.className = 'szene__mondlicht' + (f === E ? ' szene__mondlicht--figur' : '');
      d.style.left = (f.fussX - r).toFixed(1) + 'px'; d.style.top = (f.fussY - f.stand * 0.5 - r).toFixed(1) + 'px'; d.style.width = d.style.height = (r * 2).toFixed(1) + 'px';
      huelle.insertBefore(d, huelle.firstChild);   /* Mondschein bleibt unter der Erde (über ihr wäre er ein heller Kasten mit harter Unterkante) */
    });
    return huelle;
  }
  /* vor den Füßen: weicher Kontaktschatten und ein paar Halme in den Farben der Wiese */
  /* 3D-Figur (Auftrag 31): ERGUN. geht nach vorn – sein Fußgras liegt auf einer eigenen Leinwand, die mit den Füßen wandert und
     mitwächst (fussMitgehen, nur transform). Der Hund behält seins. */
  function fussgras(huelle, licht) {
    var mit = Object.keys(FIGUREN).filter(function (k) { return FIGUREN[k].fuesse; });
    fussgrasLw(huelle, licht, Object.keys(FIGUREN).filter(function (k) { return !FIGUREN[k].fuesse; }));
    mit.forEach(function (k) {
      var f = FIGUREN[k], fh = huelle.querySelector('.szene__fuss');
      if (!fh) { fh = document.createElement('div'); fh.className = 'szene__fuss'; huelle.appendChild(fh); }   /* eigene Hülle: blendet mit der Figur aus (Auftrag 36) */
      var c = fussgrasLw(fh, licht, [k]);
      c.style.transformOrigin = f.fussX.toFixed(1) + 'px ' + (f.fussY - parseFloat(c.style.top)).toFixed(1) + 'px';
      (f.fussLw || (f.fussLw = [])).push(c); f.fussN = -1;
    });
  }
  function fussMitgehen(f, n, immer) {
    if (!f.fussLw || n < 0 || (n === f.fussN && !immer)) return;
    f.fussN = n;
    var a = f.fuesse[0], b = f.fuesse[n], tr = 'translate3d(' + ((b[0] - a[0]) * f.zw).toFixed(1) + 'px,' + ((b[1] - a[1]) * f.zh + halten.dy).toFixed(1) + 'px,0) scale(' + b[2].toFixed(3) + ')';
    f.fussLw = f.fussLw.filter(function (c) { return c.isConnected; });
    f.fussLw.forEach(function (c) { c.style.transform = tr; });
  }
  function fussgrasLw(huelle, licht, namen) {
    var p = F.wiese[licht], r = zufall(4242), oben = m.H, unten = 0;
    namen.forEach(function (k) { var f = FIGUREN[k]; oben = Math.min(oben, f.fussY - m.H * 0.05); unten = Math.max(unten, f.fussY + m.H * 0.07); });
    var c = document.createElement('canvas'), q = m.q;
    c.width = Math.ceil(m.W * q); c.height = Math.ceil((unten - oben) * q);
    c.style.top = oben + 'px'; c.style.height = (unten - oben) + 'px'; c.className = 'szene__bild'; c.setAttribute('data-licht', licht);
    var g = c.getContext('2d'); g.setTransform(q, 0, 0, q, 0, -oben * q);
    namen.forEach(function (k) {
      var f = FIGUREN[k], w = f.fussB;
      /* Kontaktschatten direkt unter den Füßen … */
      var sg = g.createRadialGradient(f.fussX, f.fussY, 0, f.fussX, f.fussY, w * 0.6);
      sg.addColorStop(0, 'rgba(0,0,0,' + (licht === 'nacht' ? 0.5 : 0.4) + ')'); sg.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.translate(f.fussX, f.fussY); g.scale(1, 0.2); g.translate(-f.fussX, -f.fussY);
      g.fillStyle = sg; g.fillRect(f.fussX - w, f.fussY - w, w * 2, w * 2); g.restore();
      /* … und der Schlagschatten in Lichtrichtung: Abendsonne hinten → Schatten fällt nach vorn (zum Betrachter),
         Mond links oben → nach rechts, Mittagssonne → kurz */
      var sl = f.stand * (licht === 'gold' ? 0.5 : (licht === 'nacht' ? 0.55 : 0.2)), sw = w * 0.42;
      var dx = licht === 'nacht' ? sl : sl * 0.1, dy = licht === 'nacht' ? sl * 0.12 : (licht === 'gold' ? sl * 0.3 : sl * 0.15);
      g.save(); g.translate(f.fussX, f.fussY); g.rotate(Math.atan2(dy, dx)); 
      var lg = g.createLinearGradient(0, 0, Math.hypot(dx, dy), 0);
      lg.addColorStop(0, 'rgba(0,0,0,' + (licht === 'nacht' ? 0.3 : 0.26) + ')'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = lg; g.beginPath(); g.ellipse(Math.hypot(dx, dy) * 0.45, 0, Math.hypot(dx, dy) * 0.55, sw * 0.5, 0, 0, Math.PI * 2); g.fill(); g.restore();
      for (var i = 0; i < 26; i++) {
        var x = f.fussX + (r() - 0.5) * w * 1.25, h = m.H * (0.008 + r() * 0.016);
        halm(g, x, f.fussY + r() * m.H * 0.006, h, (r() - 0.5) * 0.8, 1.1, p.halm[Math.floor(r() * 4)], p.kante, p.kanteA * naehe(licht, x) * (licht === 'tag' ? 0.5 : 1));
      }
    });
    huelle.appendChild(c);
    return c;
  }

  /* ---------- Sterne (Nachtlauf 27.09., ERGUN.: „scharfe leuchtende Sterne, wenn es dunkel wird“) ----------
     Zwei Leinwände in der Himmels-Ebene hinter Mond und Wolken: scharfe Punkte, die helleren mit feinem Hof und Lichtkreuz.
     Deckkraft hängt an --himmel-nacht (kommen mit der Dunkelheit, verschwinden bei Tag); die zweite Leinwand funkelt leise (CSS). */
  /* 28.09. (ERGUN.: „weniger, edler“): ca. 60–80 kleine, klare Punkte (Radius 0,55–1,35 px) mit zartem Schein, wenige heller,
     etwa ein Drittel funkelt sehr sanft auf zwei Leinwänden mit verschiedenem Takt (nicht synchron). Keine Kreuze, kein Rauschen.
     Die Hülle bekommt eine leichte Parallaxe (licht()), die Sternschnuppe zieht sehr selten (schnuppeStart). */
  var sternHuelle = null, schnuppe = null, schnuppeT = 0;
  function sterneZeichnen() {
    ebenen.himmel.querySelectorAll('.szene__sternhuelle, .szene__schnuppe').forEach(function (c) { c.remove(); });
    /* 28.09. (ERGUN.): weniger und realistischer – 46 Sterne Desktop / 32 Handy, viele ganz schwach, wenige hell mit weichem Hof,
       leichte Farbtemperaturen (weiß, kühl, warm) wie am echten Nachthimmel */
    var r = zufall(4711), q = m.q, n = m.hoch ? 32 : 46, hoehe = m.H * 0.62;
    var farben = ['255,255,255', '220,230,255', '255,240,222', '255,250,240'];
    sternHuelle = document.createElement('div'); sternHuelle.className = 'szene__sternhuelle'; sternHuelle.style.height = hoehe + 'px';
    var lw = [0, 1, 2].map(function (k) {
      var c = document.createElement('canvas'); c.className = 'szene__sterne szene__sterne--' + k;
      c.width = Math.ceil(m.W * q); c.height = Math.ceil(hoehe * q); c.style.height = hoehe + 'px';
      var g = c.getContext('2d'); g.setTransform(q, 0, 0, q, 0, 0); sternHuelle.appendChild(c); return g;
    });
    for (var i = 0; i < n; i++) {
      var x = r() * m.W, y = hoehe * Math.pow(r(), 1.2), t = r(), f = farben[Math.floor(r() * 4)];   /* oben etwas dichter */
      var hell = t > 0.88, mittel = t > 0.62, k = r() < 0.3 ? 1 + Math.floor(r() * 2) : 0;
      /* Helligkeit wie am Himmel: viele schwache, wenige helle; Größe folgt der Helligkeit */
      var a = hell ? 0.95 : mittel ? 0.55 + r() * 0.25 : 0.28 + r() * 0.22, rad = hell ? 1.1 + r() * 0.3 : mittel ? 0.7 + r() * 0.3 : 0.45 + r() * 0.25, g = lw[k];
      /* weicher Hof: bei hellen Sternen weit und zart (Streuung in der Luft), bei mittleren klein */
      if (hell || mittel) {
        var hr = rad * (hell ? 7 : 3.2), hof = g.createRadialGradient(x, y, 0, x, y, hr);
        hof.addColorStop(0, 'rgba(' + f + ',' + (hell ? 0.42 : 0.22).toFixed(2) + ')'); hof.addColorStop(0.35, 'rgba(' + f + ',' + (hell ? 0.12 : 0.05).toFixed(2) + ')'); hof.addColorStop(1, 'rgba(' + f + ',0)');
        g.fillStyle = hof; g.beginPath(); g.arc(x, y, hr, 0, Math.PI * 2); g.fill();
      }
      /* Kern mit weicher Kante (kein harter Kreis) */
      var kern = g.createRadialGradient(x, y, 0, x, y, rad * 1.6);
      kern.addColorStop(0, 'rgba(' + f + ',' + a.toFixed(2) + ')'); kern.addColorStop(0.55, 'rgba(' + f + ',' + (a * 0.6).toFixed(2) + ')'); kern.addColorStop(1, 'rgba(' + f + ',0)');
      g.fillStyle = kern; g.beginPath(); g.arc(x, y, rad * 1.6, 0, Math.PI * 2); g.fill();
    }
    ebenen.himmel.insertBefore(sternHuelle, sonne);
    schnuppe = document.createElement('div'); schnuppe.className = 'szene__schnuppe'; ebenen.himmel.insertBefore(schnuppe, sonne);
  }
  /* Sternschnuppe: alle 25–50 s eine, nur in voller Nacht, nur wenn das Titelbild zu sehen ist (nie bei „Bewegung reduzieren“) */
  function schnuppePlanen() { clearTimeout(schnuppeT); if (ruhig) return; schnuppeT = setTimeout(schnuppeStart, 25000 + Math.random() * 25000); }
  function schnuppeStart() {
    if (schnuppe && isNaN(festP) && lichtP / ZEIT > 0.46 && !held.classList.contains('szene--weg') && !document.hidden) {
      schnuppe.style.left = (m.W * (0.35 + Math.random() * 0.5)).toFixed(0) + 'px'; schnuppe.style.top = (m.H * (0.04 + Math.random() * 0.2)).toFixed(0) + 'px';
      schnuppe.classList.remove('ist-an'); void schnuppe.offsetWidth; schnuppe.classList.add('ist-an');
    }
    schnuppePlanen();
  }

  /* ---------- Aufbau ---------- */
  var ebenen = {}, sonne, mond, bereit = false, bauzeit = 0, bauNr = 0;
  /* Parallaxe: kann der Browser Scroll-Animationen (Chrome, Edge, Safari 26), verschiebt er die Ebenen selbst –
     synchron zum Scrollen, ohne dass JavaScript ein Bild hinterherläuft (das zitterte auf dem iPhone). Sonst JavaScript. */
  var cssParallaxe = !ruhig && !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
  function spaeter(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 500 }); else setTimeout(fn, 60); }
  /* zeichnet alle Ebenen in den Lichtstimmungen aus AKTIV */
  function landschaft() {
    berg('weit', ebenen.weit, tiefster('fern') + 2, { saat: 3, schnee: 0.62, tiefe: 0.8, rippen: 0.9, baender: 20 });
    berg('fern', ebenen.fern, tiefster('mitte') + 2, { saat: 5, schnee: 0.64, schichten: 4, tiefe: 1, rippen: 1.7, baender: 75, geroell: 1000 });
    berg('mitte', ebenen.mitte, tiefster('huegel') + 2, { saat: 9, schichten: 7, tiefe: 1.1, rippen: 1.9, baender: 120, geroell: 1500 });
    huegel(ebenen.huegel, tiefster('wald') + m.H * 0.03 + 2);
    wald(ebenen.wald, tiefster('wiese') + 2);
    wiese(ebenen.wiese, m.H * 1.15, ebenen.wiese);
    gras(ebenen.gras);
  }
  function aufbauen() {
    var t0 = performance.now();
    messen();
    heldOben = held.getBoundingClientRect().top + leseY();   /* Lage des Titelbilds, einmal – nicht pro Bild */
    held.style.setProperty('--szene-h', m.H + 'px');
    if (cssParallaxe && isNaN(festP)) {
      Object.keys(ebenen).forEach(function (k) { ebenen[k].style.removeProperty('transform'); ebenen[k].style.setProperty('--weg', (m.H * TIEFE[k] * (k === 'himmel' ? 1 : m.f)).toFixed(1) + 'px'); });
      held.classList.add('szene--css');
    }
    ['weit', 'fern', 'mitte', 'huegel', 'wald', 'wiese', 'gras'].forEach(function (k) { var e = ebenen[k]; e.querySelectorAll('canvas:not(.szene__hund), .szene__wind').forEach(function (c) { c.remove(); }); });
    ebenen.himmel.querySelectorAll('.szene__wolken').forEach(function (c) { c.remove(); });
    sterneZeichnen();
    windHuellen = [];
    var nr = ++bauNr;
    /* Stufe 1: nur das Tagbild – so steht der Startbildschirm sofort und ohne Ruckeln */
    AKTIV = ['tag']; landschaft(); AKTIV = LICHTER;
    /* Stufe 2 und 3: Abend und Nacht, danach Sterne – jeweils, wenn der Browser gerade Luft hat */
    spaeter(function () { if (nr !== bauNr) return; AKTIV = ['gold']; landschaft(); AKTIV = LICHTER;
      spaeter(function () { if (nr !== bauNr) return; AKTIV = ['nacht']; landschaft(); AKTIV = LICHTER;
        spaeter(function () { if (nr !== bauNr) return; zeichne(true); }); }); });
    /* Sonne startet direkt unter dem Titel (26.09., ERGUN.), sinkt senkrecht und verschwindet hinter dem Sattel in der Mitte */
    m.sonneR = Math.max(26, Math.min(44, m.W * 0.026));
    m.sonneEnde = ky('fern', m.W / 2) + (TIEFE.himmel - TIEFE.fern * m.f) * SONNE_BIS * ZEIT * 0.9 * m.H + m.sonneR * 1.4;
    m.mondX = m.W * (m.hoch ? 0.22 : 0.24);
    m.mondStart = ky('fern', m.mondX) + (TIEFE.himmel - TIEFE.fern * m.f) * 0.3 * ZEIT * m.H + m.sonneR;
    m.mondEnde = m.H * (m.hoch ? 0.12 : 0.11);
    held.style.setProperty('--sonne-r', m.sonneR + 'px');
    held.style.setProperty('--titel-oben', (m.H * (m.hoch ? 0.24 : 0.2)) + 'px');
    sonneStartSetzen();
    held.classList.add('szene--bereit');
    bereit = true;
    bauzeit = Math.round(performance.now() - t0);
    zeichne(true);
  }

  /* Startpunkt der Sonne: knapp unter der Titelzeile „Webdesigner“ (Layout-Lage, ohne Parallaxe gemessen), der Kern
     berührt die Schrift nicht; nie tiefer als kurz über ihrem Endpunkt hinter dem Sattel. Nach dem Laden der Schrift erneut. */
  function sonneStartSetzen() {
    var t = held.querySelector('.titel'), unten = m.H * (m.hoch ? 0.34 : 0.3), el = t, y = 0;
    while (el && el !== held) { y += el.offsetTop; el = el.offsetParent; }
    if (t && el === held) unten = y + t.offsetHeight;
    m.sonneStart = Math.min(unten + m.sonneR * 2.4, m.sonneEnde - m.sonneR * 3);
  }

  /* ---------- Scrollen ----------
     Eine gemeinsame Scroll-Quelle (26.09., ERGUN.: alles live am Finger, in beide Richtungen): ein Takt liest pro
     Bild (requestAnimationFrame) scrollY – auch während des Schwungscrollens auf dem iPhone. Parallaxe und Winken
     nehmen den echten Wert; Sonne, Mond, Himmel, Licht auf Landschaft/Figuren und der endo-Faden einen ganz leicht
     geglätteten (~60 ms), damit Mausrad-Schritte nicht ruckeln. Kein Nachlaufen, keine Tempogrenze, hoch = runter. */
  var letztesP = -1, heldOben = 0, rohY = 0, weichY = 0, weichV = 0, FEDER_W = 18;   /* Feder (28.09.) statt 150-ms-Nachziehen */
  /* ?gestirn=test (28.09.): Bahn der Sonne/des Monds und Geschwindigkeits-Kurve der letzten 4 s (muss glatt sein, ohne Zacken) */
  var GESTIRN_TEST = /[?&]gestirn=test\b/.test(location.search), kurve = [], kurveLw = null;
  function gestirnKurve(t) {
    kurve.push([t, gest.sy, gest.my]); while (kurve.length && t - kurve[0][0] > 4000) kurve.shift();
    if (!kurveLw) {
      kurveLw = document.createElement('canvas'); kurveLw.width = 640; kurveLw.height = 240;
      kurveLw.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99;width:320px;height:120px;background:rgba(0,0,0,.75);border-radius:8px';
      document.body.appendChild(kurveLw);
    }
    var g = kurveLw.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 320, 120);
    var v = [[], []], max = 1;
    for (var i = 1; i < kurve.length; i++) {
      var dtk = (kurve[i][0] - kurve[i - 1][0]) / 1000 || 0.016;
      for (var k = 0; k < 2; k++) { var w = (kurve[i][k + 1] - kurve[i - 1][k + 1]) / dtk; v[k].push([kurve[i][0], w]); max = Math.max(max, Math.abs(w)); }
    }
    g.fillStyle = '#fff'; g.font = '11px system-ui'; g.fillText('Geschwindigkeit Sonne (orange) / Mond (blau) – max ' + Math.round(max) + ' px/s', 8, 14);
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(0, 68); g.lineTo(320, 68); g.stroke();
    ['#FFB870', '#9FB8FF'].forEach(function (farbe, k) {
      g.strokeStyle = farbe; g.lineWidth = 1.5; g.beginPath();
      v[k].forEach(function (pt, n) { var x = 320 - (t - pt[0]) / 4000 * 320, yy = 68 - pt[1] / max * 44; if (n) g.lineTo(x, yy); else g.moveTo(x, yy); });
      g.stroke();
    });
  }
  /* Zum Prüfen: ?p=0.3 stellt die Tageszeit fest ein; ?nacht=0…1 = Anteil des Himmelswegs (0 Tag, 1 volle Nacht) */
  var suche = new URLSearchParams(location.search), festP = parseFloat(suche.get('p'));
  if (isNaN(festP) && suche.has('nacht')) festP = Math.max(0, Math.min(1, parseFloat(suche.get('nacht')) || 0)) * 0.46 * ZEIT;
  function leseY() { return Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0); }
  function fortschritt(y) {
    if (!isNaN(festP)) return festP;
    return Math.max(0, Math.min(1.2, (y - heldOben) / m.H));
  }
  function setze(el, y) { el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; }
  function zeichne(immer) {
    if (!bereit) return;
    if (immer) rohY = leseY();
    var p = fortschritt(rohY);
    var vorherP = letztesP;
    if (immer || Math.abs(p - letztesP) >= 0.0005) {
      letztesP = p;
      var s = (isNaN(festP) && !ruhig) ? p * m.H : 0;
      /* Parallaxe: direkt am echten Scrollwert, sonst schwimmt die Landschaft gegen die Seite (Bewegung reduziert: keine) */
      if (!(cssParallaxe && isNaN(festP))) Object.keys(ebenen).forEach(function (k) { setze(ebenen[k], s * TIEFE[k] * (k === 'himmel' ? 1 : m.f)); });
      /* Winken: sofort beim ersten Runterwischen von ganz oben; erst ganz oben wird es wieder freigegeben */
      if (E3D) {   /* 3D-Figur (Auftrag 34): einmal beim ersten Runterscrollen los, ganz oben zurück; ?gehen=0…1 stellt sie fest ein */
        if (GEHEN_TEST >= 0 || FIG_TEST) { /* fest bzw. Test-Knöpfe */ }
        else if (!isNaN(festP)) { fig.phase = 0; figurenZeichnen(); }   /* ?p / ?nacht: Startpose (mit ?gehen=1 die Zeigepose) */
        else if (ruhig) { /* Bewegung reduziert: Endpose als Standbild (zeichne(true)) */ }
        else if (vorherP < 0) { if (p > 0.003) { gegangen = true; fig.ziel = fig.phase = 1; figurenZeichnen(); } }   /* mitten auf der Seite geladen: gleich die Zeigepose */
        else if (p <= 0.003) { if (gegangen) { gegangen = false; gehenZiel(0); } }                                   /* ganz oben: ruhig zurück */
        else if (!gegangen && p > vorherP) { gegangen = true; gehenZiel(1); }                                          /* erstes Runterscrollen: einmal los */
        figurHalten(rohY);
        ausPruefen();
      }
      else if (!isNaN(festP) && !FIG_TEST) { fig.phase = sanft(0.4, 0.58, p / ZEIT); figurenZeichnen(); }   /* Standbild zum Prüfen (?p / ?nacht) */
      else if (!isNaN(festP)) { /* ?figuren=test: Knöpfe steuern die Figuren */ }
      else if (ruhig) { /* Bewegung reduziert: kein Winken */ }
      else if (vorherP < 0) gewunken = p > 0.003;            /* erster Aufbau: nur ganz oben ist das Winken frei */
      else if (p <= 0.003) { gewunken = false; winkenWartet = false; }
      else if (!gewunken && p > vorherP) { gewunken = true; winken(); }
    }
    /* Neuaufbau: Licht und Faden sofort auf den aktuellen Stand */
    if (immer) {
      weichY = rohY; weichV = 0; lichtP = fortschritt(rohY);
      if (E3D) {
        gehenMessen();
        if (ruhig) fig.ziel = fig.phase = 1; else if (GEHEN_TEST >= 0) fig.ziel = fig.phase = GEHEN_TEST;
        figurHalten(rohY);
      }
      licht(lichtP); if (window.ergunTakt) window.ergunTakt(weichY, lichtP);
    }
  }
  /* Der Takt läuft, solange gescrollt wird, und noch kurz danach (iPhone-Schwungscrollen) – dann schläft er */
  var laeuft = false, zuletztT = 0, stillSeit = 0, lichtP = -1;
  function takt(t) {
    var dt = Math.min(0.05, Math.max(0, (t - zuletztT) / 1000)); zuletztT = t;
    var y = leseY(), richtung = 0;
    if (y !== rohY) { richtung = y > rohY ? 1 : -1; rohY = y; stillSeit = t; }
    zeichne(false);
    var vorherW = weichY;
    if (ruhig || !isNaN(festP)) weichY = rohY;
    else {
      /* 28.09. (ERGUN.: „smooth wie eine Kamerafahrt“): kritisch gedämpfte Feder statt Nachziehen – exakte Lösung je Bild,
         daher auf 60 und 120 Hz gleich, schwingt nie über. FEDER_W = 18/s → nach ~250 ms praktisch am Ziel. */
      var ab = weichY - rohY, ex = Math.exp(-FEDER_W * dt), tmp = (weichV + FEDER_W * ab) * dt;
      weichY = rohY + (ab + tmp) * ex; weichV = (weichV - FEDER_W * tmp) * ex;
      if (Math.abs(rohY - weichY) < 0.02 && Math.abs(weichV) < 0.5) { weichY = rohY; weichV = 0; }
    }
    if (GESTIRN_TEST) gestirnKurve(t);
    var lp = fortschritt(weichY);
    if (Math.abs(lp - lichtP) > 0.00005) { lichtP = lp; licht(lp); }
    /* gemeinsamer Takt für andere Bewegungen (Wurzeln, 27.09.): gleiche Scroll-Quelle, gleiche 150-ms-Glättung */
    if (window.ergunTakt) window.ergunTakt(weichY, lp);
    if (weichY !== rohY) stillSeit = t;
    if (t - stillSeit < 300) requestAnimationFrame(takt); else laeuft = false;
  }
  var gesetzt = {};
  function wert(name, v) { if (gesetzt[name] !== v) { gesetzt[name] = v; held.style.setProperty(name, v); } }
  function licht(p) {
    if (sternHuelle) sternHuelle.style.transform = 'translate3d(0,' + (p * m.H * 0.05).toFixed(1) + 'px,0)';   /* Sterne: leichte Parallaxe gegen den Himmel */
    p = p / ZEIT;
    var gold = sanft(0.05, 0.19, p), nacht = sanft(0.22, 0.42, p);
    wert('--gold', (nacht > 0.995 ? 0 : gold).toFixed(3));
    wert('--nacht', nacht.toFixed(3));
    /* ist eine Stimmung ganz erreicht, verschwinden die Fassungen darunter (sonst schimmern ihre Kanten an dünnen Halmen durch) */
    wert('--tag', (gold > 0.995 || nacht > 0.995) ? '0' : '1');
    wert('--blau', sanft(0.18, 0.3, p).toFixed(3));
    var himmelNacht = sanft(0.28, 0.46, p);
    wert('--himmel-nacht', himmelNacht.toFixed(3));
    gest.sonneAn = 1 - himmelNacht;
    /* Sterne: zuerst die hellsten, dann mehr; Milchstraße erst in tiefer Nacht */
    /* Sonne: senkrecht, gleichmäßig mit sanftem Anfang und Ende */
    var ps = sanfter(0, SONNE_BIS, p), ys = mix(m.sonneStart, m.sonneEnde, ps);
    if (gestTest && gestTest.was === 'sonne') ys = gestTest.y;
    gest.sy = ys;
    sonne.style.transform = 'translate3d(' + (gestTest && gestTest.was === 'sonne' ? gestTest.x : m.W / 2).toFixed(2) + 'px,' + ys.toFixed(2) + 'px,0)';
    wert('--tief', sanft(0.04, 0.24, p).toFixed(3));
    /* Mond steigt links auf */
    var pm = sanft(0.27, 0.62, p), ym = mix(m.mondStart, m.mondEnde, pm);
    if (gestTest && gestTest.was === 'mond') ym = gestTest.y;
    gest.my = ym;
    mond.style.transform = 'translate3d(' + (gestTest && gestTest.was === 'mond' ? gestTest.x : m.mondX).toFixed(2) + 'px,' + ym.toFixed(2) + 'px,0)';
    gest.mondAn = sanft(0.27, 0.4, p);
    wert('--mond', gest.mondAn.toFixed(3));
    /* ERGUN. und der Hund: Tag-, Abend- und Nachtbild überblenden mit dem Licht */
    lichtGold = gold; lichtBlau = sanft(0.18, 0.3, p); lichtNacht = nacht;
    if (!FIG_TEST) hundPruefen();
    figurenZeichnen();
  }
  function anfordern() { if (!laeuft) { laeuft = true; zuletztT = stillSeit = performance.now(); requestAnimationFrame(takt); } }

  function start() {
    ['himmel', 'weit', 'fern', 'mitte', 'titel', 'huegel', 'wald', 'wiese', 'gras', 'vorn'].forEach(function (k) { ebenen[k] = held.querySelector('[data-ebene="' + k + '"]'); });
    if (!ebenen.vorn) delete ebenen.vorn;
    sonne = held.querySelector('.sonne'); mond = held.querySelector('.mond');
    aufbauen();
    window.addEventListener('scroll', anfordern, { passive: true });
    if (document.readyState !== 'complete') window.addEventListener('load', function () { zeichne(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (bereit) { sonneStartSetzen(); zeichne(true); } });
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
    schnuppePlanen();
    window.__szene = { figurLw: function () { return FIGUREN.emre.leinwand; }, schnuppe: schnuppeStart, p: function (x) { window.scrollTo(0, x * m.H); }, bauzeit: function () { return bauzeit; },
      zustand: function () { return { phase: fig.phase, gehen: E3D ? { ziel: fig.ziel, laeuft: fig.laeuft, gegangen: gegangen, halten: halten.dy, bis: Math.round(halten.bis), klein: !!halten.klein } : null, aus: { art: AUS_ART, erledigt: aus.erledigt, weg: aus.weg, hell: aus.hell, drueber: !!halten.drueber }, fussN: FIGUREN.emre.fussN, laeuft: fig.laeuft, hund: hund.phase, hundZiel: hund.ziel, hundLaeuft: hund.laeuft, gewunken: gewunken, wartet: winkenWartet, rohY: rohY, weichY: weichY, licht: lichtP }; },
      aus: function (w) { ausSetzen(!!w); },   /* Prüfen (Auftrag 36): Ausblenden von Hand, auch mit ?nacht= / ?gehen= */
      winken: function () { fig.laeuft = false; winken(); }, hund: function (z) { hund.ziel = -1; hundZiel(z); },
      /* Prüfen (28.09.): Winken auf festen Stand 0–1 setzen und zeichnen (bildgenaue Aufnahmen) */
      emre: function (x) { fig.laeuft = false; fig.phase = Math.max(0, Math.min(1, x)); FIGUREN.emre.zuletzt = ''; figurenZeichnen(); return Math.round(fig.phase * (FIGUREN.emre.anzahl - 1)); } };
    if (FIG_TEST) figurenTest();
  }
  /* ?figuren=test (27.09.): Knöpfe „Winken“, „Hund hoch“, „Hund runter“ + Anzeige der gestoppten Zeit; ?p= / ?nacht= gehen weiter */
  function figurenTest() {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99;display:grid;gap:8px;padding:10px 12px;background:rgba(0,0,0,.75);color:#fff;font:12px/1.35 system-ui;border-radius:8px';
    box.innerHTML = '<div style="display:flex;gap:6px"><button data-f="w">Winken</button><button data-f="h1">Hund hoch</button><button data-f="h0">Hund runter</button></div><span data-anz>–</span>';
    document.body.appendChild(box);
    var anz = box.querySelector('[data-anz]'), t0w = 0, t0h = 0, dw = '', dh = '';
    box.querySelector('[data-f="w"]').addEventListener('click', function () { t0w = performance.now(); dw = ''; window.__szene.winken(); });
    box.querySelector('[data-f="h1"]').addEventListener('click', function () { t0h = performance.now(); dh = ''; window.__szene.hund(1); });
    box.querySelector('[data-f="h0"]').addEventListener('click', function () { t0h = performance.now(); dh = ''; window.__szene.hund(0); });
    testAnzeige = function () {
      var j = performance.now();
      if (t0w && !fig.laeuft && !dw) dw = ((j - t0w) / 1000).toFixed(2) + ' s';
      if (t0h && !hund.laeuft && !dh) dh = ((j - t0h) / 1000).toFixed(2) + ' s';
      anz.textContent = 'Figur ' + (fig.laeuft ? Math.round(fig.phase * 100) + ' %' : (dw || 'Ruhe')) + ' (Soll ' + FIG_DAUER + ' s) · Hund ' + (hund.laeuft ? Math.round(hund.phase * 100) + ' %' : (dh || (hund.phase ? 'oben' : 'unten'))) + ' (Soll ' + HUND_HOCH + ' / ' + HUND_RUNTER + ' s)';
    };
    testAnzeige();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  /* ---------- Schnittstelle für andere Ebenen (Erdschnitt + Wurzeln, js/wurzeln.js, 27.09.): nur lesen, nichts steuern ----------
     Dieselben Paletten, derselbe Zufall, dieselbe Körnung und Halm-Form wie hier – so sieht der Boden unter dem Gras aus wie das Titelbild. */
  window.ergunSzene = Object.freeze({
    palette: F, zufall: zufall, rauschen: rauschen, hex: hex, rgba: rgba, mixHex: mixHex, farbMix: farbMix, korn: korn, halm: halm,
    mondU: 0.24,   /* Mond steht nachts links bei 24 % der Breite (Lichtrichtung) */
    lichtMix: function () { return { tag: gesetzt['--tag'] == null ? 1 : parseFloat(gesetzt['--tag']), gold: parseFloat(gesetzt['--gold']) || 0, nacht: parseFloat(gesetzt['--nacht']) || 0 }; },
    /* Sonne und Mond in Koordinaten der Himmels-Ebene (+ Parallaxe-Wege der Ebenen, damit js/wolken.js die Lage in der Ebene „weit“ umrechnen kann) */
    gestirne: function () {
      var sx = gestTest && gestTest.was === 'sonne' ? gestTest.x : m.W / 2, mx = gestTest && gestTest.was === 'mond' ? gestTest.x : m.mondX;
      return { sonne: { x: sx, y: gest.sy, r: m.sonneR || 30, an: gestTest && gestTest.was === 'sonne' ? 1 : gest.sonneAn },
        mond: { x: mx, y: gest.my, r: (m.sonneR || 30) * 0.75, an: gestTest && gestTest.was === 'mond' ? 1 : gest.mondAn },
        p: isNaN(festP) ? Math.max(0, Math.min(1, (rohY - heldOben) / (m.H || 1))) : 0,
        weg: { himmel: m.H * TIEFE.himmel, weit: m.H * TIEFE.weit * m.f } };
    },
    /* wie stark das dominante Gestirn gerade hinter einer Wolke steckt (0–1) → Lichtsaum der Figuren leicht dämpfen, in Zehnteln (kein Flackern) */
    verdeckt: function (vS, vM) {
      wert('--verdeckt-sonne', Math.max(0, Math.min(1, vS)).toFixed(2)); wert('--verdeckt-mond', Math.max(0, Math.min(1, vM)).toFixed(2));
      var q = Math.round(Math.max(0, Math.min(1, Math.max(vS, vM))) * 10) / 10; if (q !== verdecktQ) { verdecktQ = q; figurenZeichnen(); }
    },
    gestirnTest: function (t) { gestTest = t; if (bereit) { licht(lichtP < 0 ? 0 : lichtP); } }
  });
})();
