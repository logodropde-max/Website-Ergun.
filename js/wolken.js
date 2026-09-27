/* Wolken im Titelbild (Emre, 27.09.2026 – früher bewusst weggelassen, jetzt auf Emres Wunsch wieder drin)
   Emres Higgsfield-Wolken (bilder/wolken/, erzeugt mit bilder/wolken/wolken.py), je Wolke drei Fassungen: Tag, Gold, Nacht.
   · Zwei Tiefen: „hoch“ = feine Federwolken in der Himmels-Ebene (über dem Titel), „tief“ = flache Wolken in der Ebene der
     fernsten Bergkette – vor den blassen Gipfeln, hinter allen näheren Bergen. Beide ziehen mit der Parallaxe ihrer Ebene mit.
     Nie vor Emre + Hund, dem Titel oder dem endo-Schriftzug (die liegen in Ebenen weiter vorn).
   · Bewegung: sehr langsames Ziehen von links nach rechts (CSS-Animation, nur transform – läuft auf der Grafikkarte, keine Arbeit
     im Scroll-Takt), je Ebene anders schnell, dazu kaum sichtbares Atmen (Form/Deckkraft). Pause, wenn das Titelbild nicht zu sehen ist.
   · Licht: die drei Fassungen hängen an denselben Werten wie Berge und Sonne (--tag, --gold, --nacht aus js/szene.js).
   · Laden: nach der Seite; erst die Tagfassung, Gold und Nacht danach. „Bewegung reduzieren“: Wolken stehen still.
   · Test: ?wolken=test → Tempo, Ebenen, Licht (nur Wolken oder ganze Szene). */
(function () {
  var held = document.querySelector('[data-szene]');
  if (!held) return;
  var buehne = held.querySelector('.szene__buehne');
  var ebenen = { hoch: held.querySelector('[data-ebene="himmel"]'), tief: held.querySelector('[data-ebene="weit"]') };
  if (!buehne || !ebenen.hoch || !ebenen.tief) return;
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TEST = /[?&]wolken=test\b/.test(location.search);

  /* ===== Einstellwerte =====
     h = Höhe der Wolke (Anteil der Bildhöhe) · y = Mitte (Anteil der Bildhöhe) · x = Startlage der Mitte (Anteil der Breite)
     dauer = Sekunden für einmal quer über das Bild (größer = langsamer) · atem = Sekunden für einmal ein- und ausatmen */
  var SEITE = { 'feder-1': 2.3947, 'feder-2': 2.354, 'flach-1': 1.9278, 'flach-3': 2.3359, 'flach-4': 2.0398 };
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

  var huellen = {}, wolken = [], groesse = '', W = 0, H = 0;
  Object.keys(ebenen).forEach(function (k) {
    var d = document.createElement('div');
    d.className = 'wolken wolken--' + k; d.setAttribute('aria-hidden', 'true');
    ebenen[k].appendChild(d); huellen[k] = d;
  });

  function bauen() {
    W = buehne.clientWidth; H = buehne.clientHeight;
    var art = W < 700 ? 'schmal' : 'breit', g = W < 700 ? 'h' : 'd';
    if (art + g !== groesse) {
      groesse = art + g;
      Object.keys(huellen).forEach(function (k) { huellen[k].textContent = ''; });
      wolken = WOLKEN[art].map(function (c) {
        var w = document.createElement('div'); w.className = 'wolke';
        var atem = document.createElement('div'); atem.className = 'wolke__atem';
        var bilder = {};
        ['tag', 'gold', 'nacht'].forEach(function (licht) {
          var b = new Image(); b.alt = ''; b.decoding = 'async'; b.className = 'wolke__bild'; b.setAttribute('data-licht', licht);
          b.setAttribute('data-src', 'bilder/wolken/' + c.name + '-' + licht + '-' + g + '.webp?v=2');
          atem.appendChild(b); bilder[licht] = b;
        });
        w.appendChild(atem); huellen[c.ebene].appendChild(w);
        return { c: c, el: w, atem: atem, bilder: bilder };
      });
      laden();
    }
    wolken.forEach(function (o) {
      var c = o.c, hh = c.h * H, ww = hh * SEITE[c.name];
      var s = o.el.style;
      s.width = ww.toFixed(1) + 'px'; s.height = hh.toFixed(1) + 'px'; s.top = (c.y * H - hh / 2).toFixed(1) + 'px';
      /* Strecke: ganz links draußen → ganz rechts draußen; die Verzögerung legt die Startlage fest */
      var von = -ww, bis = W, start = c.x * W - ww / 2;
      s.setProperty('--von', von.toFixed(1) + 'px'); s.setProperty('--bis', bis.toFixed(1) + 'px'); s.setProperty('--x', start.toFixed(1) + 'px');
      s.setProperty('--dauer', c.dauer + 's');
      s.setProperty('--versatz', (-(start - von) / (bis - von) * c.dauer).toFixed(2) + 's');
      o.atem.style.setProperty('--atem', c.atem + 's');
      o.atem.style.setProperty('--atem-versatz', (-(c.x * c.atem)).toFixed(2) + 's');
    });
  }

  /* Tagfassung zuerst, Gold und Nacht, wenn der Browser Luft hat */
  function laden() {
    var offen = wolken.length;
    wolken.forEach(function (o) {
      var b = o.bilder.tag;
      b.onload = function () { o.el.classList.add('ist-da'); if (--offen === 0) spaeter(rest); };
      b.onerror = function () { if (--offen === 0) spaeter(rest); };
      b.src = b.getAttribute('data-src');
    });
    function rest() { wolken.forEach(function (o) { ['gold', 'nacht'].forEach(function (l) { var b = o.bilder[l]; b.src = b.getAttribute('data-src'); }); }); }
  }
  function spaeter(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 1200 }); else setTimeout(fn, 200); }

  function start() {
    bauen();
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(bauen, 180); });
    if (TEST) testFeld();
  }
  /* erst nach dem Laden der Seite – das Titelbild selbst hat Vorrang */
  if (document.readyState === 'complete') setTimeout(start, 150); else window.addEventListener('load', function () { setTimeout(start, 150); });

  /* ---------- Test ---------- */
  function testFeld() {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99;display:grid;gap:6px;padding:10px 12px;background:rgba(0,0,0,.72);color:#fff;font:12px/1.3 system-ui;border-radius:8px';
    box.innerHTML = '<label>Tempo <select data-t><option value="1">normal</option><option value="10">10×</option><option value="40">40×</option></select></label>' +
      '<label><input type="checkbox" data-e="hoch" checked> Ebene hoch (Federwolken)</label>' +
      '<label><input type="checkbox" data-e="tief" checked> Ebene tief (Horizont)</label>' +
      '<label>Licht Wolken <select data-l><option value="">wie die Szene</option><option value="tag">Tag</option><option value="gold">Gold</option><option value="nacht">Nacht</option></select></label>' +
      '<span>Szene: <a style="color:#9cf" href="?wolken=test&nacht=0">Tag</a> · <a style="color:#9cf" href="?wolken=test&nacht=0.3">Gold</a> · <a style="color:#9cf" href="?wolken=test&nacht=0.55">blaue Stunde</a> · <a style="color:#9cf" href="?wolken=test&nacht=1">Nacht</a></span>';
    document.body.appendChild(box);
    box.querySelector('[data-t]').addEventListener('change', function () { held.style.setProperty('--wolken-tempo', this.value); });
    box.querySelectorAll('[data-e]').forEach(function (c) { c.addEventListener('change', function () { huellen[c.getAttribute('data-e')].style.display = c.checked ? '' : 'none'; }); });
    box.querySelector('[data-l]').addEventListener('change', function () {
      var l = this.value;
      Object.keys(huellen).forEach(function (k) {
        var s = huellen[k].style;
        if (!l) { s.removeProperty('--tag'); s.removeProperty('--gold'); s.removeProperty('--nacht'); return; }
        s.setProperty('--tag', l === 'tag' ? 1 : 0); s.setProperty('--gold', l === 'gold' ? 1 : 0); s.setProperty('--nacht', l === 'nacht' ? 1 : 0);
      });
    });
    window.__wolken = { wolken: function () { return wolken.map(function (o) { var r = o.el.getBoundingClientRect(); return { name: o.c.name, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), da: o.el.classList.contains('ist-da') }; }); } };
  }
})();
