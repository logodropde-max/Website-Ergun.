/* ERGUN. – Titelbild „Maschine“ (30.09.2026, ERGUNs Wahl: Bild 4 weiterentwickelt). Ein Laptop an der Stelle von Figur + Hund:
   beim Scrollen fahren seine Schichten auseinander, Männchen bauen die Website, eine Anfrage läuft als oranger Lichtpunkt durch
   Platine, Zahnräder und Werkstatt (endo), dann rastet alles ein – und die Kamera fährt in den Bildschirm: er wird zu Schritt 1 des
   Kontaktformulars („Was brauchen Sie?“).
   · EINE Scroll-Quelle mit Glättung (Fortschritt p 0…1 über die Strecke [data-strecke]), nur transform/opacity (+ clip-path für die Skizze).
   · Alle Teile sind frontal gezeichnet (bilder/hero/maschine/*.webp); die 3D-Lage macht dieses Skript (CSS 3D, preserve-3d).
   · „Bewegung reduzieren“: kein Ablauf, fertiger Laptop mit Website und endo-Fenster.
   · Prüfgriff: window.__maschine.p(x) stellt den Fortschritt fest ein, .zustand() liefert die Phase. */
(function () {
  var strecke = document.querySelector('[data-strecke]');
  if (!strecke) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var welt = $('[data-welt]'), kamera = $('[data-kamera]'), formular = $('[data-formular]');
  var lagen = { 0: $('[data-lage="0"]'), 1: $('[data-lage="1"]'), 2: $('[data-lage="2"]'), 3: $('[data-lage="3"]'), u: $('[data-lage="u"]') };
  var himmel = { gold: $('.h-gold'), blau: $('.h-blau'), nacht: $('.h-nacht') };
  var web = { skizze: $('[data-w="skizze"]'), farbe: $('[data-w="farbe"]'), bilder: $('[data-w="bilder"]') }, endo = $('[data-endo]');
  var mann = {}; $$('[data-mann]').forEach(function (e) { mann[e.getAttribute('data-mann')] = e; });
  var brief = {}; $$('[data-brief]').forEach(function (e) { brief[e.getAttribute('data-brief')] = e; });
  var leuchten = {}; $$('[data-leuchten]').forEach(function (e) { leuchten[e.getAttribute('data-leuchten')] = e; });
  var raeder = $$('[data-rad]'), schritte = $$('[data-schritt]'), kette = {}; $$('[data-k]').forEach(function (e) { kette[e.getAttribute('data-k')] = e; });

  /* Spuren: Polylinien in Prozent der Platte (aus dem d-Attribut), orange Linie zeichnet sich, ein Lichtpunkt läuft mit */
  var spur = {};
  $$('[data-spur]').forEach(function (pfad) {
    var k = pfad.getAttribute('data-spur'), z = (pfad.getAttribute('d').match(/-?[\d.]+/g) || []).map(Number), pkt = [];
    for (var i = 0; i + 1 < z.length; i += 2) pkt.push([z[i], z[i + 1]]);
    var laenge = [0]; for (i = 1; i < pkt.length; i++) laenge.push(laenge[i - 1] + Math.hypot(pkt[i][0] - pkt[i - 1][0], pkt[i][1] - pkt[i - 1][1]));
    pfad.setAttribute('pathLength', '1'); pfad.style.strokeDasharray = '1'; pfad.style.strokeDashoffset = '1';
    var auf = pfad.closest('.m-lage').querySelector('.m-auf');
    if (!auf) { auf = document.createElement('div'); auf.className = 'm-auf'; auf.style.inset = '0'; pfad.closest('.m-lage').appendChild(auf); }
    var punkt = document.createElement('div'); punkt.className = 'm-punkt'; auf.appendChild(punkt);
    spur[k] = { pfad: pfad, pkt: pkt, laenge: laenge, punkt: punkt };
  });
  function aufSpur(k, t) {   /* Punkt (x %, y %) bei Anteil t der Spur k */
    var s = spur[k], L = s.laenge[s.laenge.length - 1] * Math.max(0, Math.min(1, t));
    for (var i = 1; i < s.pkt.length; i++) if (s.laenge[i] >= L) { var f = (L - s.laenge[i - 1]) / ((s.laenge[i] - s.laenge[i - 1]) || 1); return [s.pkt[i - 1][0] + (s.pkt[i][0] - s.pkt[i - 1][0]) * f, s.pkt[i - 1][1] + (s.pkt[i][1] - s.pkt[i - 1][1]) * f]; }
    return s.pkt[s.pkt.length - 1];
  }

  /* ---------- kleine Helfer ---------- */
  function klemm(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function glatt(x) { x = klemm(x); return x * x * (3 - 2 * x); }
  function seg(p, a, b) { return glatt((p - a) / (b - a)); }
  function ein(p, a, b, c, d) { return Math.min(seg(p, a, b), 1 - seg(p, c, d)); }   /* sichtbar von a→b bis c→d */
  function setze(el, t, o) { if (!el) return; if (t != null) el.style.transform = t; if (o != null) el.style.opacity = String(Math.round(o * 1000) / 1000); }
  function pos(el, xy) { el.style.left = xy[0] + '%'; el.style.top = xy[1] + '%'; }

  /* ---------- Maße (Laptop-Breite L, Handy) ---------- */
  var m = { L: 600, handy: false, vw: 0, vh: 0, cx: 0, cy: 0 };
  function messen() {
    m.vw = window.innerWidth; m.vh = window.innerHeight; m.handy = m.vw < 761;
    m.L = m.handy ? Math.min(m.vw * 0.8, 440) : Math.min(m.vw * 0.34, m.vh * 0.72, 600);
    welt.style.setProperty('--L', m.L + 'px');
    var r = welt.parentNode.getBoundingClientRect(), wx = m.handy ? 0.5 : 0.58, wy = m.handy ? 0.64 : 0.55;
    welt.style.left = wx * 100 + '%'; welt.style.top = wy * 100 + '%';
    m.cx = r.width * wx; m.cy = r.height * wy; m.bw = r.width; m.bh = r.height;
    lagen.u.style.top = '100%'; lagen.u.style.bottom = 'auto';
  }

  /* ---------- ein Bild der Szene für den Fortschritt p ---------- */
  var p = 0, ziel = 0, laeuft = false, phase = '';
  function zeichnen(p) {
    var L = m.L, auf = seg(p, 0.04, 0.16), zu = seg(p, 0.80, 0.88), E = auf * (1 - zu), Z = seg(p, 0.90, 0.985);
    /* Kamerafahrt durch die Schichten: f = welche Schicht gerade vorn in der Mitte steht (0 Bildschirm … 3 Werkstatt).
       Schichten vor der gezeigten werden durchsichtig – man taucht in die Maschine ein und wieder heraus. */
    var f = seg(p, 0.45, 0.50) + seg(p, 0.545, 0.575) + seg(p, 0.64, 0.67) - 3 * seg(p, 0.77, 0.84);
    var ox = m.handy ? 0 : 0.24 * L, oy = m.handy ? -0.34 * L : -0.035 * L, oz = m.handy ? -0.14 * L : -0.5 * L;
    /* Kamera: leicht schräg, beim Auseinanderfahren etwas mehr, beim Blick auf eine Schicht fast frontal; am Ende frontal und ganz nah */
    var nah = Math.min(f, 1);
    var ry = ((m.handy ? -12 : -22) - (m.handy ? 4 : 8) * E) * (1 - 0.6 * nah), rx = ((m.handy ? -14 : -15) - 3 * E) * (1 - 0.5 * nah);
    kamera.style.transform = 'rotateX(' + (rx * (1 - Z)) + 'deg) rotateY(' + (ry * (1 - Z)) + 'deg) translate3d(' + (-E * f * ox) + 'px, ' + (-E * f * oy) + 'px, ' + (-E * f * oz) + 'px)';
    var k = Math.max(m.bw / (0.86 * L), m.bh / (0.83 * 0.69 * L)) * 1.08, s = (1 + (k - 1) * Z * Z * Z) * (1 + 0.18 * nah + (m.handy ? 0 : 0.12) * klemm(f - 2));   /* die flache Werkstatt am Desktop etwas näher heran (am Handy füllt sie schon die Breite) */
    var dx = (m.bw / 2 - m.cx) * Z, dy = (m.bh / 2 - m.cy) * Z;
    welt.style.transform = 'translate(-50%, -50%) translate(' + dx + 'px, ' + dy + 'px) scale(' + s + ')';
    /* Schichten: hinten nach hinten-rechts (Desktop) bzw. nach oben (Handy) */
    function vorn(i) { return 1 - klemm((f - i) * 1.8); }   /* Schicht liegt vor der gezeigten → wird durchsichtig */
    [1, 2, 3].forEach(function (i) {
      setze(lagen[i], 'translate3d(' + (E * i * ox) + 'px, ' + (E * i * oy) + 'px, ' + (E * i * oz - i * 2) + 'px)', klemm(E * 6) * (1 - Z) * vorn(i));
    });
    setze(lagen[0], 'translate3d(0, 0, ' + (E * 0.12 * L) + 'px)', vorn(0));
    setze(lagen.u, 'rotateX(90deg)', (1 - seg(p, 0.9, 0.95)) * vorn(0));

    /* 1 · Website entsteht: Skizze (Strich für Strich), Farbe, Bilder */
    var sk = seg(p, 0.15, 0.25), fa = seg(p, 0.25, 0.32), bi = seg(p, 0.32, 0.39);
    web.skizze.style.clipPath = 'inset(0 ' + (100 - sk * 100) + '% 0 0)'; setze(web.skizze, null, 1 - fa * 0.85);
    setze(web.farbe, null, fa); setze(web.bilder, null, bi);
    setze(mann[1], 'translate(-50%, -100%) translateX(' + (sk * 260) + '%)', ein(p, 0.13, 0.16, 0.24, 0.27));
    setze(mann[2], 'translate(-50%, -100%) translateX(' + (-fa * 180) + '%)', ein(p, 0.23, 0.26, 0.33, 0.36));

    /* 2 · Anfrage fliegt herein (Bogen von links) und wird zum Lichtpunkt */
    var br = seg(p, 0.39, 0.45), b0 = brief[0];
    pos(b0, [-40 + 68 * br, 20 + 35 * br - Math.sin(br * Math.PI) * 26]);
    setze(b0, 'rotate(' + (-14 + 14 * br) + 'deg) scale(' + (1.3 - 0.9 * seg(p, 0.44, 0.46)) + ')', ein(p, 0.39, 0.41, 0.45, 0.465));

    /* 3 · endo arbeitet: Platine → Mechanik (Zahnräder, Hebel) → Werkstatt (tragen, Termin, Haken) */
    lauf('1', seg(p, 0.49, 0.545), ein(p, 0.485, 0.50, 0.545, 0.565));
    lauf('2', seg(p, 0.575, 0.64), ein(p, 0.57, 0.585, 0.64, 0.66));
    var w3 = seg(p, 0.67, 0.745); lauf('3', w3, ein(p, 0.665, 0.68, 0.745, 0.765));
    var dreh = p * 720 + seg(p, 0.56, 0.66) * 900;
    raeder.forEach(function (r) { r.style.transform = 'translate(-50%, -50%) rotate(' + (dreh * Number(r.getAttribute('data-dreh'))) + 'deg)'; });
    setze(mann[4], 'translate(-50%, -100%) rotate(' + (-6 * Math.sin(seg(p, 0.585, 0.63) * Math.PI)) + 'deg)', ein(p, 0.555, 0.575, 0.65, 0.67));
    var bp = aufSpur('3', w3); pos(brief[3], [bp[0], bp[1] - 8]); setze(brief[3], 'scale(1.3)', ein(p, 0.665, 0.68, 0.735, 0.75));
    pos(mann[3], [bp[0] - 5, bp[1] + 14]); setze(mann[3], 'translate(-50%, -100%)', ein(p, 0.66, 0.68, 0.735, 0.75));
    setze(mann[5], 'translate(-50%, -100%)', ein(p, 0.70, 0.715, 0.775, 0.79));
    setze(leuchten.kalender, null, ein(p, 0.715, 0.73, 0.77, 0.79));
    setze(mann[6], 'translate(-50%, -100%) translateY(' + (-6 * Math.abs(Math.sin(seg(p, 0.745, 0.79) * Math.PI * 3))) + '%)', ein(p, 0.742, 0.755, 0.785, 0.80));
    setze(leuchten.haken, null, ein(p, 0.742, 0.752, 0.785, 0.80));

    /* 4 · alles rastet ein, endo meldet sich auf der Website */
    var en = seg(p, 0.84, 0.885);
    setze(endo, 'translateY(' + (12 * (1 - en)) + '%) scale(' + (0.96 + 0.04 * en) + ')', en);

    /* 5 · Kamera im Bildschirm → Schritt 1 des Kontaktformulars */
    setze(formular, null, seg(p, 0.955, 0.995)); formular.style.pointerEvents = p > 0.99 ? 'auto' : 'none';

    /* Himmel Tag → Gold → blaue Stunde → Nacht */
    setze(himmel.gold, null, seg(p, 0.12, 0.34)); setze(himmel.blau, null, seg(p, 0.36, 0.56)); setze(himmel.nacht, null, seg(p, 0.58, 0.8));

    /* Texte links */
    var n = p < 0.13 ? 0 : p < 0.39 ? 1 : p < 0.47 ? 2 : p < 0.80 ? 3 : 4;
    schritte.forEach(function (s, i) { s.classList.toggle('ist-an', i === n && Z < 0.5); });
    var an = { 1: sk > 0.6, 2: fa > 0.6, 3: bi > 0.6, 4: p > 0.54, 5: p > 0.63, 6: p > 0.725, 7: p > 0.75 };
    Object.keys(kette).forEach(function (k) { kette[k].classList.toggle('ist-an', !!an[k]); });
    phase = ['start', 'website', 'anfrage', 'endo', 'fertig'][n] + (Z > 0.5 ? '+formular' : '');
  }
  function lauf(k, t, sichtbar) {
    var s = spur[k]; if (!s) return;
    s.pfad.style.strokeDashoffset = String(1 - t);
    pos(s.punkt, aufSpur(k, t)); setze(s.punkt, null, sichtbar);
  }

  /* ---------- EINE Scroll-Quelle mit Glättung ---------- */
  function lesen() {
    var r = strecke.getBoundingClientRect(), weg = r.height - window.innerHeight;
    return weg > 0 ? klemm(-r.top / weg) : 0;
  }
  function schritt() {
    p += (ziel - p) * 0.14;
    if (Math.abs(ziel - p) < 0.0004) p = ziel;
    zeichnen(p);
    if (p !== ziel) requestAnimationFrame(schritt); else laeuft = false;
  }
  function beimScrollen() { ziel = lesen(); if (!laeuft) { laeuft = true; requestAnimationFrame(schritt); } }

  messen();
  if (ruhig) { zeichnen(0.9); setze(formular, null, 0); schritte.forEach(function (s, i) { s.classList.toggle('ist-an', i === 4); }); }
  else {
    p = ziel = lesen(); zeichnen(p);
    window.addEventListener('scroll', beimScrollen, { passive: true });
    window.addEventListener('resize', function () { messen(); zeichnen(p); });
  }
  window.__maschine = { p: function (x) { p = ziel = klemm(x); zeichnen(p); return phase; }, zustand: function () { return { p: p, phase: phase, L: m.L, handy: m.handy }; } };
})();
