/* Wolken im Titelbild (ERGUN., 27.09.2026; Nachtlauf 27./28.09.: Sonne + Mond hinter den Wolken, Endlosschleife, 8 % schneller)
   ERGUNs Higgsfield-Wolken (bilder/wolken/, erzeugt mit bilder/wolken/wolken.py), je Wolke drei Fassungen: Tag, Gold, Nacht,
   dazu eine Körpermaske (dichter Kern) und ein Deckungsraster (wolken.json).
   · Zwei Tiefen: „hoch“ = Federwolken in der Himmels-Ebene, „tief“ = flache Wolken in der Ebene der fernsten Bergkette.
     Nie vor ERGUN. + Hund, dem Titel oder der Navigation.
   · Bewegung: JavaScript setzt die Lage jedes Bildes (nur transform), sehr langsam von links nach rechts, je Ebene anders
     schnell, endlos: rechts raus = links wieder rein (Position modulo Bildbreite + Wolkenbreite), bei jeder Wiederkehr minimal
     andere Höhe und Größe. Atmen per CSS. Pause, wenn das Titelbild nicht zu sehen ist. „Bewegung reduzieren“: Wolken stehen,
     die Verdeckung wird trotzdem beim Scrollen berechnet.
   · Sonne und Mond hinter den Wolken (Vorbild: ERGUNs Bild „Wolkenmeer“ – Wolken leuchten von innen): Die Wolke liegt in der
     Zeichenreihenfolge vor dem Gestirn. Ihr dichter Kern (Körpermaske) wird undurchsichtig, sobald das Gestirn dahinter steht
     (Deckungsgrad aus dem Raster) – kein Durchblitzen. Dafür leuchtet sie: weiches Licht von innen (radial um die Gestirnslage,
     in die Wolkenform maskiert) und ein heller Saum an den Kanten zum Gestirn hin (Wolkenform minus versetzte Wolkenform).
     Sonne: warm-weiß (Tag) bis Gold/Orange (Abend), Mond: kühles Silber. Alles weich, synchron zum Licht der Szene.
     Ist ein Gestirn verdeckt, dämpft js/szene.js den Lichtsaum auf ERGUN. + Hund ganz leicht (ergunSzene.verdeckt).
   · Test: ?wolken=test → Tempo, Ebenen, Licht, Gestirn per Knopf hinter eine Wolke setzen. */
(function () {
  var held = document.querySelector('[data-szene]'), S = window.ergunSzene;
  if (!held || !S) return;
  var buehne = held.querySelector('.szene__buehne');
  var ebenen = { hoch: held.querySelector('[data-ebene="himmel"]'), tief: held.querySelector('[data-ebene="weit"]') };
  if (!buehne || !ebenen.hoch || !ebenen.tief) return;
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TEST = /[?&]wolken=test\b/.test(location.search);

  /* ===== Einstellwerte =====
     h = Höhe der Wolke (Anteil der Bildhöhe) · y = Mitte (Anteil der Bildhöhe) · x = Startlage der Mitte (Anteil der Breite)
     dauer = Sekunden für einmal quer über das Bild (vor dem Tempo-Faktor) · atem = Sekunden für einmal ein- und ausatmen */
  var EINST = {
    tempo: 1.08,          // alle Wolken 8 % schneller (ERGUN.; Bereich 5–10 %)
    wiederkehr: 0.015,    // bei der Wiederkehr: Höhe ± 1,5 % der Bildhöhe, Größe ± 3 %
    leuchten: 5,          // Reichweite des Leuchtens in Sonnenradien (Mond etwas kürzer)
    saum: 0.035,          // Breite des Lichtsaums als Anteil der Wolkenhöhe
    deckenAb: 0.01, deckenBis: 0.08,  // Deckungsgrad (0–1), ab dem der Kern undurchsichtig wird / voll ist (28.09., ERGUN.: die Wolke deckt den Teil des Gestirns hinter ihr wirklich ab – der Kern wird sofort dicht, sobald die Scheibe die Wolke berührt)
    glaetten: 0.18        // pro Bild aufgeholter Anteil (weiche Übergänge beim Vorbeiziehen)
  };
  var LICHT = {
    sonneTag: '255,248,228', sonneGold: '255,178,96', mond: '214,226,255',
    sonneTagA: 0.85, sonneGoldA: 1, mondA: 1   /* 28.09.: kräftiger – das Gestirn selbst ist hinter der Wolke unsichtbar, nur die Wolke leuchtet */
  };
  var WOLKEN = {
    breit: [
      { name: 'feder-1', ebene: 'hoch', h: 0.13, y: 0.105, x: 0.2, dauer: 520, atem: 46 },
      { name: 'feder-2', ebene: 'hoch', h: 0.105, y: 0.08, x: 0.8, dauer: 600, atem: 58 },
      { name: 'flach-1', ebene: 'tief', h: 0.12, y: 0.455, x: 0.13, dauer: 700, atem: 40 },
      { name: 'flach-3', ebene: 'tief', h: 0.095, y: 0.475, x: 0.6, dauer: 820, atem: 52 },
      { name: 'flach-4', ebene: 'tief', h: 0.08, y: 0.44, x: 0.9, dauer: 760, atem: 36 }
    ],
    schmal: [
      { name: 'feder-1', ebene: 'hoch', h: 0.07, y: 0.145, x: 0.3, dauer: 300, atem: 46 },
      { name: 'flach-1', ebene: 'tief', h: 0.07, y: 0.455, x: 0.2, dauer: 420, atem: 40 },
      { name: 'flach-3', ebene: 'tief', h: 0.055, y: 0.47, x: 0.82, dauer: 480, atem: 52 }
    ]
  };

  var huellen = {}, wolken = [], groesse = '', W = 0, H = 0, g = 'd', daten = null, tempoTest = 1;
  Object.keys(ebenen).forEach(function (k) {
    var d = document.createElement('div');
    d.className = 'wolken wolken--' + k; d.setAttribute('aria-hidden', 'true');
    ebenen[k].appendChild(d); huellen[k] = d;
  });
  function klemme(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function sanft(a, b, x) { var t = klemme((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function pfad(name, was) { return 'bilder/wolken/' + name + '-' + was + '-' + g + '.webp?v=5'; }

  function bauen() {
    W = buehne.clientWidth; H = buehne.clientHeight;
    var art = W < 700 ? 'schmal' : 'breit'; g = W < 700 ? 'h' : 'd';
    if (art + g !== groesse) {
      groesse = art + g;
      Object.keys(huellen).forEach(function (k) { huellen[k].textContent = ''; });
      wolken = WOLKEN[art].map(function (c, i) {
        var w = document.createElement('div'); w.className = 'wolke';
        var atem = document.createElement('div'); atem.className = 'wolke__atem';
        var bilder = {}, koerper = document.createElement('div'); koerper.className = 'wolke__koerper';
        /* 28.09.: vier deckende Farb-Fassungen (Tag, Gold, blaue Stunde, Nacht) in der Form-Maske der Wolke (<name>-form-*.webp):
           die Fassungen mischen linear mit denselben Variablen wie der Himmel – keine dichteren Ränder, kein Sprung */
        ['tag', 'gold', 'blau', 'nacht'].forEach(function (licht) {
          [atem, koerper].forEach(function (ziel, k) {
            var b = new Image(); b.alt = ''; b.decoding = 'async'; b.className = 'wolke__bild'; b.setAttribute('data-licht', licht);
            b.setAttribute('data-src', pfad(c.name, licht));
            ziel.appendChild(b); if (!k) bilder[licht] = b;
          });
        });
        var maske = 'url("' + pfad(c.name, 'form') + '")';
        atem.style.setProperty('--form', maske);
        koerper.style.setProperty('--maske', 'url("' + pfad(c.name, 'koerper') + '")');
        var licht = document.createElement('div'); licht.className = 'wolke__licht';
        var rand = document.createElement('div'); rand.className = 'wolke__rand'; rand.style.setProperty('--maske', maske);
        atem.appendChild(koerper); atem.appendChild(licht); atem.appendChild(rand);
        w.appendChild(atem); huellen[c.ebene].appendChild(w);
        var r = S.zufall(1234 + i);
        return { c: c, el: w, atem: atem, bilder: bilder, koerper: koerper, licht: licht, rand: rand, r: r, runde: -1, dy: 0, sk: 1, deck: 0, ist: { deck: -1 } };
      });
      laden();
    }
    wolken.forEach(function (o) {
      var c = o.c; o.hh = c.h * H; o.ww = o.hh * (daten && daten[c.name] ? daten[c.name].seite : 2.2);
      var s = o.el.style;
      s.width = o.ww.toFixed(1) + 'px'; s.height = o.hh.toFixed(1) + 'px';
      o.top = c.y * H - o.hh / 2; s.top = o.top.toFixed(1) + 'px';
      o.von = -o.ww; o.strecke = W + o.ww; o.start = c.x * W - o.ww / 2;
      o.tempo = o.strecke / c.dauer * EINST.tempo;   /* px je Sekunde */
      o.atem.style.setProperty('--atem', c.atem + 's');
      o.atem.style.setProperty('--atem-versatz', (-(c.x * c.atem)).toFixed(2) + 's');
      o.rand.style.setProperty('--d', Math.max(2, o.hh * EINST.saum).toFixed(1) + 'px');
    });
    zuletzt = -1; lauf(performance.now(), true);
  }

  /* Bilder: Tag zuerst, Gold und Nacht wenn der Browser Luft hat; Raster/Seitenverhältnis aus wolken.json */
  function laden() {
    var offen = wolken.length;
    wolken.forEach(function (o) {
      var b = o.bilder.tag;
      b.onload = function () { o.el.classList.add('ist-da'); if (--offen === 0) spaeter(rest); };
      b.onerror = function () { if (--offen === 0) spaeter(rest); };
      b.src = b.getAttribute('data-src');
      o.koerper.querySelector('[data-licht="tag"]').src = b.getAttribute('data-src');
    });
    function rest() { wolken.forEach(function (o) { ['gold', 'blau', 'nacht'].forEach(function (l) { o.el.querySelectorAll('[data-licht="' + l + '"]').forEach(function (b) { b.src = b.getAttribute('data-src'); }); }); }); }
  }
  function spaeter(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 1200 }); else setTimeout(fn, 200); }

  /* ---- Deckungsgrad: mittlere Wolkendichte auf der Scheibe des Gestirns (5 Proben) aus dem Raster ---- */
  function dichte(o, lx, ly) {
    var d = daten && daten[o.c.name]; if (!d) return 0;
    var r = d.raster, ze = r.length, sp = r[0].length, j = Math.floor(ly / o.hh * ze), i = Math.floor(lx / o.ww * sp);
    if (j < 0 || j >= ze || i < 0 || i >= sp) return 0;
    return (r[j].charCodeAt(i) - 48) / 9;
  }
  function deckung(o, lx, ly, rad) {
    var s = dichte(o, lx, ly) * 2, k = rad * 0.7;
    s += dichte(o, lx + k, ly) + dichte(o, lx - k, ly) + dichte(o, lx, ly + k) + dichte(o, lx, ly - k);
    return s / 6;
  }

  /* ---- je Bild: Lage, Wiederkehr, Licht ---- */
  var t0 = performance.now(), zuletzt = -1, laeuft = false, sichtbar = true, verdecktGesamt = 0;
  function lauf(t, erzwingen) {
    var s = ruhig ? 0 : (t - t0) / 1000 * tempoTest;
    var gest = S.gestirne(), mx = S.lichtMix(), p = klemme(gest.p, 0, 1);
    var sonneA = gest.sonne.an, mondA = gest.mond.an, gold = klemme(mx.gold, 0, 1);
    var sonneF = mischen(LICHT.sonneTag, LICHT.sonneGold, gold), sonneAlpha = LICHT.sonneTagA + (LICHT.sonneGoldA - LICHT.sonneTagA) * gold;
    var maxDeck = [0, 0];   /* Sonne, Mond */
    wolken.forEach(function (o) {
      /* Lage: endlos, bei jeder Runde minimal anders */
      var weg = o.start - o.von + o.tempo * s, runde = Math.floor(weg / o.strecke), x = o.von + (weg - runde * o.strecke);
      if (runde !== o.runde) { o.runde = runde; if (runde > 0) { o.dy = (o.r() - 0.5) * 2 * EINST.wiederkehr * H; o.sk = 1 + (o.r() - 0.5) * 0.06; } }
      o.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + o.dy.toFixed(1) + 'px,0) scale(' + o.sk.toFixed(3) + ')';
      /* Gestirne in Wolken-Koordinaten (die Ebene „tief“ läuft mit anderer Parallaxe als der Himmel) */
      var versatz = o.c.ebene === 'tief' ? (gest.weg.himmel - gest.weg.weit) * p : 0;
      var lichter = [
        { x: gest.sonne.x - x, y: gest.sonne.y + versatz - o.top - o.dy, r: gest.sonne.r, an: sonneA, f: sonneF, a: sonneAlpha, reich: EINST.leuchten },
        { x: gest.mond.x - x, y: gest.mond.y + versatz - o.top - o.dy, r: gest.mond.r, an: mondA, f: LICHT.mond, a: LICHT.mondA, reich: EINST.leuchten * 0.8 }
      ];
      var deck = 0, haupt = null, hauptWert = -1;
      lichter.forEach(function (l, li) {
        if (l.an < 0.02) { l.a = 0; l.deck = 0; return; }
        var dk = deckung(o, l.x, l.y, l.r) * l.an;
        l.deck = sanft(EINST.deckenAb, EINST.deckenBis, dk);
        deck = Math.max(deck, l.deck);
        /* wie nah am Wolkenkasten? weit weg = kein Licht in dieser Wolke */
        var ax = klemme(l.x, 0, o.ww) - l.x, ay = klemme(l.y, 0, o.hh) - l.y, abstand = Math.hypot(ax, ay), reich = l.r * l.reich;
        var naehe = klemme(1 - abstand / reich, 0, 1);
        l.a *= l.an * naehe;
        if (l.a > hauptWert) { hauptWert = l.a; haupt = l; }
      });
      /* weich nachführen */
      o.deck += (deck - o.deck) * (erzwingen ? 1 : EINST.glaetten);
      if (Math.abs(o.deck - o.ist.deck) > 0.004) { o.ist.deck = o.deck; o.koerper.style.opacity = o.deck.toFixed(3); }
      o.deckS = (o.deckS || 0) + (lichter[0].deck - (o.deckS || 0)) * (erzwingen ? 1 : EINST.glaetten);
      o.deckM = (o.deckM || 0) + (lichter[1].deck - (o.deckM || 0)) * (erzwingen ? 1 : EINST.glaetten);
      maxDeck[0] = Math.max(maxDeck[0], o.deckS); maxDeck[1] = Math.max(maxDeck[1], o.deckM);
      var st = o.licht.style;
      lichter.forEach(function (l, i) {
        var k = i ? 'm' : 's';
        st.setProperty('--' + k + 'x', l.x.toFixed(1) + 'px'); st.setProperty('--' + k + 'y', l.y.toFixed(1) + 'px');
        st.setProperty('--' + k + 'r', (l.r * l.reich).toFixed(1) + 'px'); st.setProperty('--' + k + 'f', l.f); st.setProperty('--' + k + 'a', l.a.toFixed(3));
      });
      /* Saum zur Lichtseite: Wolkenform minus die vom Licht weg versetzte Form */
      var rs = o.rand.style;
      if (haupt && hauptWert > 0.01) {
        var ux = haupt.x - o.ww / 2, uy = haupt.y - o.hh / 2, ul = Math.hypot(ux, uy) || 1;
        rs.setProperty('--ux', (-ux / ul).toFixed(3)); rs.setProperty('--uy', (-uy / ul).toFixed(3));
        rs.setProperty('--lx', haupt.x.toFixed(1) + 'px'); rs.setProperty('--ly', haupt.y.toFixed(1) + 'px');
        rs.setProperty('--lr', (haupt.r * haupt.reich * 1.15).toFixed(1) + 'px'); rs.setProperty('--lf', haupt.f); rs.setProperty('--la', Math.min(1, hauptWert * 1.8).toFixed(3));
      } else rs.setProperty('--la', '0');
    });
    verdecktGesamt = Math.max(maxDeck[0], maxDeck[1]);
    if (S.verdeckt) S.verdeckt(maxDeck[0], maxDeck[1]);   /* Scheibe von Sonne/Mond ausblenden + Lichtsaum der Figuren dämpfen */
  }
  function mischen(a, b, t) {
    var A = a.split(','), B = b.split(',');
    return [0, 1, 2].map(function (i) { return Math.round(+A[i] + (+B[i] - +A[i]) * t); }).join(',');
  }
  function schleife(t) {
    if (!laeuft) return;
    lauf(t, false);
    requestAnimationFrame(schleife);
  }
  function start() { if (!laeuft && sichtbar && !ruhig) { laeuft = true; requestAnimationFrame(schleife); } }
  function stopp() { laeuft = false; }

  /* Bewegung reduziert: keine Schleife – aber wenn sich das Licht/Scrollen ändert, Verdeckung neu rechnen */
  var vorher = window.ergunTakt;
  window.ergunTakt = function (weichY, lp) { if (vorher) vorher(weichY, lp); if (ruhig && wolken.length) lauf(performance.now(), false); };

  function anfang() {
    fetch('bilder/wolken/wolken.json?v=3').then(function (r) { return r.json(); }).catch(function () { return null; }).then(function (j) {
      daten = j || {};
      bauen();
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) start(); else stopp(); }).observe(held);
      document.addEventListener('visibilitychange', function () { if (document.hidden) stopp(); else start(); });
      start();
      var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(bauen, 180); });
      if (TEST) testFeld();
    });
  }
  /* erst nach dem Laden der Seite – das Titelbild selbst hat Vorrang */
  if (document.readyState === 'complete') setTimeout(anfang, 150); else window.addEventListener('load', function () { setTimeout(anfang, 150); });

  /* ---------- Test ---------- */
  function testFeld() {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99;display:grid;gap:6px;padding:10px 12px;background:rgba(0,0,0,.72);color:#fff;font:12px/1.3 system-ui;border-radius:8px';
    box.innerHTML = '<label>Tempo <select data-t><option value="1">normal</option><option value="10">10×</option><option value="40">40×</option></select></label>' +
      '<label><input type="checkbox" data-e="hoch" checked> Ebene hoch (Federwolken)</label>' +
      '<label><input type="checkbox" data-e="tief" checked> Ebene tief (Horizont)</label>' +
      '<label>Licht Wolken <select data-l><option value="">wie die Szene</option><option value="tag">Tag</option><option value="gold">Gold</option><option value="blau">blaue Stunde</option><option value="nacht">Nacht</option></select></label>' +
      '<div>Gestirn hinter Wolke: <button data-g="sonne">Sonne</button> <button data-g="mond">Mond</button> <button data-g="">frei</button></div>' +
      '<span>Szene: <a style="color:#9cf" href="?wolken=test&nacht=0">Tag</a> · <a style="color:#9cf" href="?wolken=test&nacht=0.3">Gold</a> · <a style="color:#9cf" href="?wolken=test&nacht=0.55">blaue Stunde</a> · <a style="color:#9cf" href="?wolken=test&nacht=1">Nacht</a></span>';
    document.body.appendChild(box);
    box.querySelector('[data-t]').addEventListener('change', function () { tempoTest = +this.value; });
    box.querySelectorAll('[data-e]').forEach(function (c) { c.addEventListener('change', function () { huellen[c.getAttribute('data-e')].style.display = c.checked ? '' : 'none'; }); });
    box.querySelector('[data-l]').addEventListener('change', function () {
      var l = this.value;
      Object.keys(huellen).forEach(function (k) {
        var s = huellen[k].style;
        if (!l) { s.removeProperty('--gold'); s.removeProperty('--blau'); s.removeProperty('--himmel-nacht'); return; }
        s.setProperty('--gold', l === 'gold' ? 1 : 0); s.setProperty('--blau', l === 'nacht' || l === 'blau' ? 1 : 0); s.setProperty('--himmel-nacht', l === 'nacht' ? 1 : 0);
      });
    });
    /* Gestirn per Knopf in die Mitte der ersten Wolke der Ebene „tief“ (Sonne) bzw. „hoch“ (Mond) setzen */
    box.querySelectorAll('[data-g]').forEach(function (b) { b.addEventListener('click', function () {
      var was = b.getAttribute('data-g');
      if (!was) { S.gestirnTest(null); return; }
      var o = wolken.filter(function (w) { return w.c.ebene === (was === 'sonne' ? 'tief' : 'hoch'); })[0] || wolken[0];
      var tr = o.el.style.transform, x = parseFloat((/translate3d\(([-\d.]+)px/.exec(tr) || [0, 0])[1]);
      S.gestirnTest({ was: was, x: x + o.ww * 0.5, y: o.top + o.dy + o.hh * 0.55 });
    }); });
    window.__wolken = { wolken: function () { return wolken.map(function (o) { var r = o.el.getBoundingClientRect(); return { name: o.c.name, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), deck: +o.deck.toFixed(2), runde: o.runde, da: o.el.classList.contains('ist-da') }; }); }, verdeckt: function () { return verdecktGesamt; }, tempo: function (v) { tempoTest = v; } };
  }
})();
