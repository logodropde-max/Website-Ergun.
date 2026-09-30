/* ERGUN. – Titelbild „Maschine“, Vorschau v2 (30.09.2026). Ein Laptop auf einer ruhigen Studio-Bühne: beim Scrollen fahren seine
   Schichten auseinander, die Website entsteht (Raster → Farbe → Bilder), eine Anfrage fliegt herein – und die Kamera fährt durch
   vier klare Karten: ① Anfrage kommt an · ② Automatisch sortiert · ③ Termin eingetragen · ④ Antwort geht raus. Dann rastet alles
   ein, die Website meldet „Beantwortet“, der Laptop dreht sich gerade in die Mitte, im Bildschirm erscheint Schritt 1 des
   Kontaktformulars – und das Formular öffnet sich weich vom Bildschirm aus auf die ganze Fläche (ERGUN., 30.09.: „smoother“).
   Nach außen kein „endo“ in dieser Szene (ERGUN.: „nicht unbedingt endo erwähnen, mehr Grafiken als Text“).
   · EINE Scroll-Quelle mit Glättung (Fortschritt p 0…1 über [data-strecke]), nur transform/opacity (+ clip-path für das Raster).
   · Die Karten sind HTML; ihre Handlungen laufen über CSS-Variablen je Karte (--neu, --e1, --weg, --slot, --haken, --flug …).
   · Variante B (?figuren=ja): flache Figuren, je Stufe genau EINE Handlung (Brief bringen, Etikett kleben, Haken setzen, abschicken).
   · „Bewegung reduzieren“: kein Ablauf, fertiger Laptop mit Website und Meldung „Beantwortet“.
   · Prüfgriff: window.__maschine.p(x) stellt den Fortschritt fest ein, .zustand() liefert Phase und Stufe. */
(function () {
  var strecke = document.querySelector('[data-strecke]');
  if (!strecke) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var figuren = document.documentElement.classList.contains('mit-figuren');
  var buehne = strecke.firstElementChild, welt = $('[data-welt]'), kamera = $('[data-kamera]'), formular = $('[data-formular]'), text = $('.m-text'), anzeige = $('.m-anzeige');
  var formularTeile = formular ? [].slice.call(formular.children) : [];
  var lagen = { 0: $('[data-lage="0"]'), u: $('[data-lage="u"]') }, karte = {};
  [1, 2, 3, 4].forEach(function (i) { lagen[i] = $('[data-lage="' + i + '"]'); karte[i] = $('[data-karte="' + i + '"]'); });
  var stimmung = {}; $$('[data-stimmung]').forEach(function (e) { stimmung[e.getAttribute('data-stimmung')] = e; });
  var web = { skizze: $('[data-w="skizze"]'), farbe: $('[data-w="farbe"]'), bilder: $('[data-w="bilder"]'), formular: $('[data-w="formular"]') }, meldung = $('[data-endo]'), brief = $('[data-brief]');
  var schatten = $('[data-schatten]'), spiegel = $('[data-spiegel]'), schritte = $$('[data-schritt]');
  var fort = { web: $('[data-fort="web"]'), ablauf: $('[data-fort="ablauf"]') };
  var TITEL = { web: ['Entwurf', 'Farbe & Schrift', 'Bilder & Inhalte'], ablauf: ['Anfrage kommt an', 'Automatisch sortiert', 'Termin eingetragen', 'Antwort geht raus'] };

  /* Umschalter im Hinweis: A ⇄ B */
  var umschalter = $('[data-umschalter]');
  if (umschalter && figuren) { umschalter.textContent = 'ohne Figuren'; umschalter.setAttribute('href', location.pathname); }

  /* ---------- Variante B: eine flache Figur (Kopf, Körper, Beine, ein beweglicher Arm mit Gegenstand) ---------- */
  var DING = {
    bringen: '<rect x="-9" y="26" width="18" height="12" rx="2" fill="#F4F1E6"/><path d="M-8 27.5 0 33 8 27.5" fill="none" stroke="#0C162C" stroke-width="1.2"/><circle cx="0" cy="33" r="1.6" fill="#FF7A1A"/>',
    kleben: '<rect x="-7" y="28" width="16" height="8" rx="4" fill="#FF7A1A"/>',
    haken: '<circle cx="0" cy="33" r="7" fill="#FF7A1A"/><path d="m-3.2 33 2.2 2.2 4.4-4.6" fill="none" stroke="#10131B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    senden: '<path d="M-8 30 9 25 3 40 0 33z" fill="#F4F1E6"/>',
    zeichnen: '<rect x="-1.4" y="24" width="2.8" height="14" rx="1" fill="#F4F1E6"/><path d="M-1.4 38h2.8L0 41z" fill="#0C162C"/>',
    malen: '<rect x="-1.4" y="22" width="2.8" height="12" rx="1" fill="#C9A27A"/><rect x="-2.6" y="34" width="5.2" height="6" rx="1.5" fill="#FF7A1A"/>'
  };
  function figurSvg(art) {
    var farbe = '#D5DBE6';
    return '<svg viewBox="0 0 60 120" aria-hidden="true">' +
      '<circle cx="30" cy="13" r="9" fill="' + farbe + '"/>' +
      '<rect x="19" y="25" width="22" height="42" rx="10" fill="' + farbe + '"/>' +
      '<rect x="21" y="62" width="8" height="46" rx="4" fill="' + farbe + '"/><rect x="31" y="62" width="8" height="46" rx="4" fill="' + farbe + '"/>' +
      '<rect x="36" y="30" width="7" height="30" rx="3.5" fill="' + farbe + '" opacity="0.75"/>' +
      '<g class="fig-arm"><rect x="28.5" y="30" width="7" height="32" rx="3.5" fill="' + farbe + '"/><g class="fig-ding" transform="translate(32 30)">' + (DING[art] || '') + '</g></g>' +
      '</svg>';
  }
  /* Tastatur des HTML-Laptops: 5 Reihen + untere Reihe mit Leertaste */
  var tastatur = $('[data-tastatur]');
  if (tastatur) [[14, 1], [14, 1], [14, 1], [13, 1], [12, 1], [0, 0]].forEach(function (r, i) {
    var reihe = document.createElement('div');
    var breiten = i === 5 ? [1, 1, 1, 1.2, 6, 1.2, 1, 1, 1] : Array.apply(null, Array(r[0])).map(function (_, j) { return (i > 0 && j === 0) || j === r[0] - 1 ? 1.5 : 1; });
    breiten.forEach(function (b) { var t = document.createElement('i'); t.style.flex = String(b); reihe.appendChild(t); });
    tastatur.appendChild(reihe);
  });
  var fig = {};
  if (figuren) $$('[data-figur]').forEach(function (e) { var a = e.getAttribute('data-figur'); e.innerHTML = figurSvg(a); fig[a] = e; });

  /* ---------- kleine Helfer ---------- */
  function klemm(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sanft(x) { return x * x * x * (x * (x * 6 - 15) + 10); }   /* weicher als glatt(): Anfang und Ende ohne Ruck */
  function glatt(x) { x = klemm(x); return x * x * (3 - 2 * x); }
  function seg(p, a, b) { return glatt((p - a) / (b - a)); }
  function ein(p, a, b, c, d) { return Math.min(seg(p, a, b), 1 - seg(p, c, d)); }
  function r3(x) { return Math.round(x * 1000) / 1000; }
  function setze(el, t, o) { if (!el) return; if (t != null) el.style.transform = t; if (o != null) el.style.opacity = String(r3(o)); }
  function vars(el, o) { if (!el) return; for (var k in o) el.style.setProperty('--' + k, String(r3(o[k]))); }

  /* ---------- Maße (Laptop-Breite L, Handy) ---------- */
  var m = { L: 600, handy: false };
  function messen() {
    var vw = window.innerWidth, vh = window.innerHeight; m.handy = vw < 761;
    m.L = m.handy ? Math.min(vw * 0.74, 400) : Math.min(vw * 0.34, vh * 0.72, 600);
    welt.style.setProperty('--L', m.L + 'px');
    var r = buehne.getBoundingClientRect(), wx = m.handy ? 0.5 : 0.61, wy = m.handy ? 0.68 : 0.52;
    welt.style.left = wx * 100 + '%'; welt.style.top = wy * 100 + '%';
    m.cx = r.width * wx; m.cy = r.height * wy; m.bw = r.width; m.bh = r.height;
    /* Spotlight über dem Laptop, Bodenkante auf Höhe der Laptop-Unterkante */
    buehne.style.setProperty('--sx', wx * 100 + '%'); buehne.style.setProperty('--sy', (wy * 100 - (m.handy ? 10 : 12)) + '%');
    buehne.style.setProperty('--by', ((m.cy + 0.345 * 0.69 * m.L + 0.12 * m.L) / r.height * 100) + '%');
    lagen.u.style.top = '100%'; lagen.u.style.bottom = 'auto';
  }

  /* ---------- Zeitplan (Anteil der Scroll-Strecke) ---------- */
  var ST = [0.45, 0.55, 0.65, 0.75], SL = 0.07;   /* Beginn und Länge der vier Stufen */

  /* ---------- ein Bild der Szene für den Fortschritt p ---------- */
  var p = 0, ziel = 0, laeuft = false, phase = '', stufe = 0;
  function zeichnen(p) {
    var L = m.L, auf = seg(p, 0.03, 0.12), zu = seg(p, 0.85, 0.90), E = auf * (1 - zu);
    /* Schluss: Z = Laptop dreht sich gerade und rückt in die Mitte · M = Mini-Formular im Bildschirm · O = Formular öffnet sich */
    var Z = seg(p, 0.905, 0.945), M = seg(p, 0.928, 0.95), roh = klemm((p - 0.955) / 0.04), O = sanft(roh);
    /* Kamerafahrt: f = welche Karte vorn in der Mitte steht (0 Bildschirm, 1…4 Karten); davor liegende Schichten werden durchsichtig */
    var f = seg(p, 0.40, 0.45) + seg(p, 0.52, 0.55) + seg(p, 0.62, 0.65) + seg(p, 0.72, 0.75) - 4 * seg(p, 0.82, 0.87);
    var ox = m.handy ? 0 : 0.2 * L, oy = m.handy ? -0.1 * L : -0.03 * L, oz = m.handy ? -0.3 * L : -0.42 * L;
    var nah = Math.min(f, 1);
    var ry = ((m.handy ? -10 : -20) - (m.handy ? 4 : 8) * E) * (1 - 0.7 * nah), rx = ((m.handy ? -12 : -13) - 3 * E) * (1 - 0.6 * nah);
    kamera.style.transform = 'rotateX(' + r3(rx * (1 - Z)) + 'deg) rotateY(' + r3(ry * (1 - Z)) + 'deg) translate3d(' + r3(-E * f * ox) + 'px, ' + r3(-E * f * oy) + 'px, ' + r3(-E * f * oz) + 'px)';
    var k = Math.min(0.8 * m.bw / (0.948 * L), 0.66 * m.bh / (0.924 * 0.69 * L)), s = (1 + (k - 1) * Z) * (1 + (m.handy ? 0.1 : 0.36) * nah) * (1 + 0.06 * O);
    welt.style.transform = 'translate(-50%, -50%) translate(' + r3((m.bw / 2 - m.cx) * Z) + 'px, ' + r3((m.bh / 2 - m.cy) * Z) + 'px) scale(' + r3(s) + ')';
    welt.style.opacity = String(r3(1 - seg(O, 0.55, 1)));
    function vorn(i) { return 1 - klemm((f - i) * 1.8); }
    /* Handy: im Fokus die Karten dahinter ausblenden (sie ragen sonst oben in den Text) */
    function hinten(i) { return m.handy ? 1 - 0.92 * klemm(i - f) * klemm(f * 2) : 1; }
    [1, 2, 3, 4].forEach(function (i) {
      setze(lagen[i], 'translate3d(' + r3(E * i * ox) + 'px, ' + r3(E * i * oy) + 'px, ' + r3(E * i * oz - i * 2) + 'px)', klemm(E * 6) * (1 - Z) * vorn(i) * hinten(i) * (1 - seg(p, 0.825, 0.855)));   /* beim Zurückfahren zuerst weg */
    });
    setze(lagen[0], 'translate3d(0, 0, ' + r3(E * 0.12 * L) + 'px)', vorn(0));
    setze(lagen.u, 'rotateX(90deg)', (1 - 0.7 * Z) * vorn(0));
    var boden = (1 - Z) * (1 - 0.55 * nah);
    setze(schatten, null, boden); setze(spiegel, null, boden);

    /* 1 · Website entsteht: Raster, Farbe, Bilder */
    var sk = seg(p, 0.12, 0.21), fa = seg(p, 0.21, 0.28), bi = seg(p, 0.28, 0.35);
    web.skizze.style.clipPath = 'inset(0 ' + r3(100 - sk * 100) + '% 0 0)'; setze(web.skizze, null, 1 - fa * 0.85);
    setze(web.farbe, null, fa); setze(web.bilder, null, bi);

    /* 2 · Anfrage fliegt herein (Bogen von links) und verschwindet im Bildschirm */
    var br = seg(p, 0.35, 0.41);
    brief.style.left = r3(-40 + 68 * br) + '%'; brief.style.top = r3(20 + 35 * br - Math.sin(br * Math.PI) * 26) + '%';
    setze(brief, 'rotate(' + r3(-14 + 14 * br) + 'deg) scale(' + r3(1.3 - 0.9 * seg(p, 0.40, 0.42)) + ')', ein(p, 0.35, 0.37, 0.41, 0.425));

    /* 3 · die vier Karten: je Karte ein Fortschritt T (0…1) und daraus die Handlung */
    var T = ST.map(function (a) { return seg(p, a, a + SL); }).map(function (t, i) { return p >= ST[i] + SL ? 1 : t; });
    function faden(t) { return { faden: t, punkt: ein(t, 0, 0.06, 0.94, 1.0001) }; }
    vars(karte[1], Object.assign({ neu: seg(T[0], 0.25, 0.7) }, faden(T[0])));
    vars(karte[2], Object.assign({ e1: seg(T[1], 0.1, 0.35), e2: seg(T[1], 0.3, 0.55), weg: seg(T[1], 0.62, 0.92) }, faden(T[1])));
    vars(karte[3], Object.assign({ slot: seg(T[2], 0.25, 0.55), haken: seg(T[2], 0.5, 0.8) }, faden(T[2])));
    vars(karte[4], Object.assign({ blase: seg(T[3], 0.05, 0.3), druck: ein(T[3], 0.3, 0.4, 0.55, 0.7), flug: seg(T[3], 0.38, 0.72), status: seg(T[3], 0.72, 0.9) }, faden(T[3])));
    if (figuren) {   /* je Stufe EINE Handlung: der Arm bewegt sich zum Ziel, der Gegenstand wird abgegeben */
      var a1 = seg(T[0], 0.05, 0.4), a2 = seg(T[1], 0.0, 0.3), a3 = seg(T[2], 0.2, 0.5), a4 = seg(T[3], 0.25, 0.45);
      vars(fig.bringen, { arm: 14 + 80 * a1 - 40 * seg(T[0], 0.7, 1), ding: 1 - seg(T[0], 0.4, 0.55) });
      vars(fig.kleben, { arm: 14 + 120 * a2 - 70 * seg(T[1], 0.55, 0.8), ding: 1 - seg(T[1], 0.3, 0.4) });
      vars(fig.haken, { arm: 14 + 140 * a3 - 50 * seg(T[2], 0.5, 0.65) - 50 * seg(T[2], 0.8, 1), ding: 1 - seg(T[2], 0.55, 0.65) });
      vars(fig.senden, { arm: 14 + 76 * a4 - 60 * seg(T[3], 0.75, 1), ding: 1 - seg(T[3], 0.42, 0.5) });
      /* Website: eine Figur zeichnet das Raster, eine malt die Farbe */
      vars(fig.zeichnen, { arm: 30 + 25 * Math.sin(sk * Math.PI * 4) });
      setze(fig.zeichnen, 'translate(-50%, -100%)', ein(p, 0.10, 0.13, 0.22, 0.25));
      vars(fig.malen, { arm: 150 + 20 * Math.sin(fa * Math.PI * 4) });
      setze(fig.malen, 'translate(-50%, -100%) scaleX(-1)', ein(p, 0.20, 0.23, 0.30, 0.33));
    }

    /* 4 · alles rastet ein, die Website meldet „Beantwortet. Termin eingetragen ✓“ */
    var en = seg(p, 0.875, 0.9);
    setze(meldung, 'translateY(' + r3(12 * (1 - en)) + '%) scale(' + r3(0.96 + 0.04 * en) + ')', en * (1 - M));

    /* 5 · im Bildschirm erscheint Schritt 1 des Formulars, dann öffnet es sich vom Bildschirm aus auf die ganze Fläche */
    setze(web.formular, null, M);
    oeffnen(O, roh);

    /* Stimmung: warm bei „Ihre Website“, kühl bei endo, am Ende ein kleiner oranger Schimmer bei „Termin eingetragen ✓“ */
    setze(stimmung.warm, null, ein(p, 0.08, 0.15, 0.34, 0.41));
    setze(stimmung.kuehl, null, ein(p, 0.38, 0.45, 0.82, 0.88));
    setze(stimmung.orange, null, ein(p, 0.88, 0.91, 0.95, 0.98) + 0.6 * ein(T[2], 0.5, 0.7, 0.95, 1.0001) * (p < ST[2] + SL + 0.02 ? 1 : 0));

    /* Texte links + Fortschritt */
    var n = p < 0.12 ? 0 : p < 0.35 ? 1 : p < 0.45 ? 2 : p < 0.85 ? 3 : 4;
    schritte.forEach(function (el, i) { el.classList.toggle('ist-an', i === n); });
    setze(text, null, 1 - seg(p, 0.9, 0.935));
    stufe = p < ST[0] ? 0 : p < ST[1] ? 1 : p < ST[2] ? 2 : p < ST[3] ? 3 : 4;
    var webStufe = sk < 1 ? 1 : fa < 1 ? 2 : 3;
    fortschritt(fort.web, n === 1, webStufe, bi >= 1, TITEL.web);
    fortschritt(fort.ablauf, n >= 2, n === 2 ? 1 : stufe, n === 4 || T[3] >= 1, TITEL.ablauf);
    phase = ['start', 'website', 'anfrage', 'ablauf', 'fertig'][n] + (O > 0.5 ? '+formular' : '');
  }
  /* Formular öffnet sich: Ausschnitt (clip-path) wächst vom Bildschirm-Rechteck auf die ganze Bühne, der Inhalt wächst mit */
  function oeffnen(o, roh) {
    if (!formular) return;
    if (o <= 0) { formular.style.opacity = '0'; formular.style.pointerEvents = 'none'; return; }
    var b = buehne.getBoundingClientRect(), a = anzeige.getBoundingClientRect(), q = 1 - o;
    var oben = (a.top - b.top) * q, links = (a.left - b.left) * q, rechts = (b.right - a.right) * q, unten = (b.bottom - a.bottom) * q;
    formular.style.clipPath = 'inset(' + r3(oben) + 'px ' + r3(rechts) + 'px ' + r3(unten) + 'px ' + r3(links) + 'px round ' + r3(8 * q + 0.5) + 'px)';
    formular.style.opacity = String(r3(klemm(roh / 0.2)));   /* schnell über das fertige Mini-Formular blenden */
    var klein = Math.max(0.2, Math.min(a.width / b.width, a.height / b.height));   /* Inhalt passt anfangs in den Bildschirm (Handy: hochkant) */
    formularTeile.forEach(function (t, i) { setze(t, 'scale(' + r3(klein + (1 - klein) * o) + ')', i < 2 ? 1 : seg(o, 0.6, 1)); });   /* Überschrift + Karten von Anfang an (wie im Mini-Formular), Hinweis zuletzt */
    formular.style.pointerEvents = o > 0.95 ? 'auto' : 'none';
  }
  function fortschritt(el, sichtbar, aktiv, alles, titel) {
    if (!el) return;
    el.classList.toggle('ist-an', sichtbar);
    $$('li', el).forEach(function (li, i) { li.classList.toggle('ist-fertig', alles || i + 1 < aktiv); li.classList.toggle('ist-aktiv', !alles && i + 1 === aktiv); });
    var t = $('[data-fort-titel]', el), neu = alles ? 'Erledigt ✓' : titel[aktiv - 1] || '';
    if (t.textContent !== neu) t.textContent = neu;
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
  if (ruhig) { zeichnen(0.903); schritte.forEach(function (el, i) { el.classList.toggle('ist-an', i === 4); }); }
  else {
    p = ziel = lesen(); zeichnen(p);
    window.addEventListener('scroll', beimScrollen, { passive: true });
    window.addEventListener('resize', function () { messen(); zeichnen(p); });
  }
  window.__maschine = { p: function (x) { p = ziel = klemm(x); zeichnen(p); return phase; }, zustand: function () { return { p: p, phase: phase, stufe: stufe, L: m.L, handy: m.handy, figuren: figuren }; } };
})();
