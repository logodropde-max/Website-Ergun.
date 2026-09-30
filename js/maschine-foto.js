/* ERGUN. – Titelbild „Maschine“, Vorschau v3 (Auftrag 44, 30.09.2026): hyperrealistisches tropisches Büro statt gezeichneter Bühne.
   Ein Foto (Morgen → Goldene Stunde → Abend, gleiche Kamera, nur opacity), darauf liegt der echte HTML-Bildschirm per matrix3d
   genau auf den eingemessenen Ecken (window.TROPEN_SCHIRM, aus bilder/hero/4k/tropen/ecken.py). Beim Scrollen:
   0–0.12 ruhiger Einstieg (Video-Loop, Blätter-Parallaxe) · 0.12–0.35 Kamera fährt an den Laptop, die Website entsteht ·
   0.35–0.41 eine Anfrage fliegt herein · 0.45–0.82 vier Karten kommen aus dem Bildschirm (Foto weich + dunkler) ·
   0.85–0.90 „Beantwortet. Termin eingetragen ✓“ · 0.905–0.95 Kamera in den Bildschirm, dort erscheint „Was brauchen Sie?“ ·
   0.955–0.995 das Formular öffnet sich vom Bildschirm aus auf die ganze Fläche.
   · EINE Scroll-Quelle mit Glättung, nur transform/opacity (+ clip-path für Raster und Formular).
   · „Bewegung reduzieren“: Standbild Morgen, fertige Website auf dem Laptop, kein Video.
   · Prüfgriff: window.__maschine.p(x) / .zustand(). */
(function () {
  var strecke = document.querySelector('[data-strecke]');
  if (!strecke || !window.TROPEN_SCHIRM) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hochMq = window.matchMedia('(max-aspect-ratio: 4/5)');
  var buehne = strecke.firstElementChild, foto = $('[data-foto]'), schirm = $('[data-schirm]'), anzeige = $('.m-anzeige', schirm);
  var licht = {}; $$('[data-licht]').forEach(function (e) { licht[e.getAttribute('data-licht')] = e; });
  var aus = $('[data-aus]'), video = $('[data-video]'), weich = $('[data-weich]'), dunkel = $('[data-dunkel]'), blaetter = $('[data-blaetter]'), brief = $('[data-brief]');
  var kartenBox = $('[data-m-karten]'), karte = {}; [1, 2, 3, 4].forEach(function (i) { karte[i] = $('[data-karte="' + i + '"]'); });
  var formular = $('[data-formular]'), formularTeile = formular ? [].slice.call(formular.children) : [], text = $('.m-text');
  var web = { skizze: $('[data-w="skizze"]'), farbe: $('[data-w="farbe"]'), bilder: $('[data-w="bilder"]'), formular: $('[data-w="formular"]') }, meldung = $('[data-endo]');
  var abschnitt = document.querySelector('[data-maschine-ziel]');   /* Startseite: echter Abschnitt „Was brauchen Sie?“ statt Einblendung */
  if (abschnitt && formular) { formular.remove(); formular = null; formularTeile = []; }
  var nachOben = document.querySelector('[data-nach-oben]'); if (nachOben && strecke.id) nachOben.setAttribute('href', '#' + strecke.id);
  var schritte = $$('[data-schritt]'), fort ={ web: $('[data-fort="web"]'), ablauf: $('[data-fort="ablauf"]') };
  /* Neu (01.10., ?titel=neu, erst nach ERGUNs OK Standard): geführt statt an scrollY, ohne Karten ①–④, direkt in die Angebote, 4K */
  var NEU = document.documentElement.classList.contains('titel-neu'), EIN_ZUG = /[?&]fuehrung=1\b/.test(location.search);
  var hinweis = $('[data-weiter]');
  var TITEL = { web: ['Entwurf', 'Farbe & Schrift', 'Bilder & Inhalte'], ablauf: ['Anfrage kommt an', 'Automatisch sortiert', 'Termin eingetragen', 'Antwort geht raus'] };

  /* ---------- Helfer ---------- */
  function klemm(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function glatt(x) { x = klemm(x); return x * x * (3 - 2 * x); }
  function sanft(x) { x = klemm(x); return x * x * x * (x * (x * 6 - 15) + 10); }
  function seg(p, a, b) { return glatt((p - a) / (b - a)); }
  function ein(p, a, b, c, d) { return Math.min(seg(p, a, b), 1 - seg(p, c, d)); }
  function r3(x) { return Math.round(x * 1000) / 1000; }
  function setze(el, t, o) { if (!el) return; if (t != null) el.style.transform = t; if (o != null) el.style.opacity = String(r3(o)); }
  function vars(el, o) { if (!el) return; for (var k in o) el.style.setProperty('--' + k, String(r3(o[k]))); }
  function mix(a, b, t) { return a + (b - a) * t; }

  /* ---------- Bildschirm: Homographie Rechteck (w × h) → Viereck q (oben-links, oben-rechts, unten-rechts, unten-links) ---------- */
  function matrix3d(w, h, q) {
    var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1], x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    var den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
    var a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
    var m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
    return 'matrix3d(' + m.map(function (v) { return Math.round(v * 1e6) / 1e6; }).join(',') + ')';
  }

  /* ---------- Maße: Foto im cover-Zuschnitt, Bildschirm, Karten ---------- */
  var m = {};
  function messen() {
    var bw = buehne.clientWidth, bh = buehne.clientHeight, hoch = hochMq.matches, s = window.TROPEN_SCHIRM[hoch ? 'hoch' : 'quer'];
    var k = Math.max(bw / s.w, bh / s.h), fw = s.w * k, fh = s.h * k;
    var ax = hoch ? 0.5 : 0.58, ay = hoch ? 0.55 : 0.5;   /* Ausschnitt: Laptop bleibt immer im Bild */
    m = { bw: bw, bh: bh, hoch: hoch, fw: fw, fh: fh, fx: (bw - fw) * ax, fy: (bh - fh) * ay };
    foto.style.width = fw + 'px'; foto.style.height = fh + 'px';
    var q = s.ecken.map(function (e) { return [e[0] * fw, e[1] * fh]; });
    var breite = (Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) + Math.hypot(q[2][0] - q[3][0], q[2][1] - q[3][1])) / 2;
    var hoehe = (Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]) + Math.hypot(q[2][0] - q[1][0], q[2][1] - q[1][1])) / 2;
    var basis = Math.max(320, Math.round(breite * 2)), bh2 = Math.round(basis * hoehe / breite);   /* doppelt so groß bauen, herunterrechnen = scharf */
    schirm.style.width = basis + 'px'; schirm.style.height = bh2 + 'px';
    schirm.style.setProperty('--L', (basis * 0.972 / 0.948) + 'px');
    schirm.style.transform = matrix3d(basis, bh2, q);
    m.sx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4; m.sy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4; m.sb = breite; m.sh = hoehe;
    /* Karten-Bühne */
    /* nie über den Textblock: Desktop rechts daneben, hochkant darunter */
    var tr = text.getBoundingClientRect(), br = buehne.getBoundingClientRect(), textRechts = tr.right - br.left, textUnten = tr.bottom - br.top;
    var kh = hoch ? 0.9 : 0.66;
    var L = hoch ? Math.min(bw * 0.88, 440, (bh - textUnten - 36) / kh) : Math.min(bw * 0.4, bh * 0.9, 600, bw - textRechts - 64);
    kartenBox.style.setProperty('--L', L + 'px');
    m.kx = hoch ? (bw - L) / 2 : Math.max(textRechts + 32, Math.min(bw - L - 40, bw * 0.62 - L / 2));
    m.ky = hoch ? Math.max(textUnten + 20, Math.min(bh * 0.56 - L * kh / 2, bh - L * kh - 24)) : (bh - L * kh) / 2;
    m.kL = L; m.kh = kh;
    kartenBox.style.left = m.kx + 'px'; kartenBox.style.top = m.ky + 'px';
    /* weiche Fassung passend zum Format */
    var wq = weich.getAttribute(hoch ? 'data-hoch' : 'data-quer'); if (weich.getAttribute('src') !== wq) weich.setAttribute('src', wq);
  }

  /* ---------- Kamera: Foto verschieben/skalieren, so dass der Bildschirm an (zx, zy) mit Breite zb steht ---------- */
  function kamera(s, zx, zy) {   /* s = Maßstab, (zx, zy) = wo die Bildschirm-Mitte auf der Bühne stehen soll */
    var tx = zx - m.sx * s, ty = zy - m.sy * s;
    /* nie Rand zeigen: Foto muss die Bühne decken */
    tx = Math.min(0, Math.max(m.bw - m.fw * s, tx)); ty = Math.min(0, Math.max(m.bh - m.fh * s, ty));
    foto.style.transform = 'translate3d(' + r3(tx) + 'px, ' + r3(ty) + 'px, 0) scale(' + r3(s) + ')';
    return { tx: tx, ty: ty, s: s };
  }

  /* ---------- ein Bild der Szene für den Fortschritt p ---------- */
  var ST = [0.45, 0.55, 0.65, 0.75], SL = 0.07;
  var p = 0, ziel = 0, laeuft = false, phase = '', stufe = 0, kam = { tx: 0, ty: 0, s: 1 };
  function zeichnen(p) {
    if (NEU) return zeichnenNeu(p);
    /* Kamera: Start = Foto im Zuschnitt (Bildschirm-Mitte dort, wo sie liegt) → an den Laptop heran → zurück etwas → in den Bildschirm */
    var s0 = 1.0, x0 = m.fx + m.sx, y0 = m.fy + m.sy;
    var sWeb = Math.max(1.12, (m.hoch ? 0.62 : 0.36) * m.bw / m.sb), xWeb = m.hoch ? m.bw * 0.5 : m.bw * 0.64, yWeb = m.hoch ? m.bh * 0.66 : m.bh * 0.56;
    var sKar = mix(1, sWeb, 0.55), sFill = Math.min(0.8 * m.bw / m.sb, 0.62 * m.bh / m.sh);
    var hin = sanft(klemm((p - 0.1) / 0.14)), zurueck = sanft(klemm((p - 0.4) / 0.06)), rein = sanft(klemm((p - 0.84) / 0.11)), push = seg(p, 0.0, 0.1) * 0.03;
    var s = mix(mix(mix(s0 + push, sWeb, hin), sKar, zurueck), sFill, rein);
    var zx = mix(mix(mix(x0, xWeb, hin), mix(x0, xWeb, 0.6), zurueck), m.bw / 2, rein);
    var zy = mix(mix(mix(y0, yWeb, hin), mix(y0, yWeb, 0.6), zurueck), m.bh / 2, rein);
    var O = sanft(klemm((p - 0.955) / 0.04)), roh = klemm((p - 0.955) / 0.04);
    kam = kamera(s * (1 + 0.05 * O), zx, zy);

    /* Licht: Morgen → Goldene Stunde → Abend (nur opacity; Morgen liegt immer unten) */
    setze(licht.gold, null, seg(p, 0.3, 0.46)); setze(licht.abend, null, seg(p, 0.62, 0.8));
    setze(video, null, ruhig ? 0 : 1 - seg(p, 0.04, 0.12));
    var karten = ein(p, 0.43, 0.47, 0.82, 0.86);
    setze(weich, null, 0.75 * karten + O * 0.9); setze(dunkel, null, 0.42 * karten);
    /* Blätter (Vordergrund) bewegen sich schneller als das Foto und gehen beim Heranfahren nach unten links raus */
    setze(blaetter, 'translate3d(' + r3(-hin * 8) + 'vw, ' + r3(hin * 14 + p * 4) + 'vh, 0) scale(' + r3(1 + hin * 0.25) + ')', (1 - seg(p, 0.22, 0.36)) * (1 - O));

    /* 1 · Website entsteht auf dem Bildschirm: Raster, Farbe, Bilder */
    var sk = seg(p, 0.14, 0.22), fa = seg(p, 0.22, 0.29), bi = seg(p, 0.29, 0.35);
    web.skizze.style.clipPath = 'inset(0 ' + r3(100 - sk * 100) + '% 0 0)'; setze(web.skizze, null, 1 - fa * 0.85);
    setze(web.farbe, null, fa); setze(web.bilder, null, bi);
    setze(aus, null, ruhig ? 0 : 1 - seg(p, 0.1, 0.14));   /* Bildschirm schaltet sich ein */

    /* 2 · Anfrage fliegt von links oben in den Bildschirm */
    var br = seg(p, 0.35, 0.41), bs = { x: kam.tx + m.sx * kam.s, y: kam.ty + m.sy * kam.s };
    var bx = mix(-40, bs.x, br), by = mix(m.bh * 0.25, bs.y, br) - Math.sin(br * Math.PI) * m.bh * 0.12;
    brief.style.left = r3(bx) + 'px'; brief.style.top = r3(by) + 'px';
    setze(brief, 'rotate(' + r3(-14 + 14 * br) + 'deg) scale(' + r3(1.5 - 1.1 * seg(p, 0.395, 0.415)) + ')', ein(p, 0.35, 0.37, 0.405, 0.42));

    /* 3 · Karten kommen aus dem Bildschirm (je eine Stufe), Handlungen über CSS-Variablen */
    var T = ST.map(function (a, i) { return p >= a + SL ? 1 : seg(p, a, a + SL); });
    var mitteK = { x: m.kx + m.kL / 2, y: m.ky + m.kL * m.kh / 2 };
    [1, 2, 3, 4].forEach(function (i) {
      var a = ST[i - 1], auf = seg(p, a - 0.035, a + 0.005), weg = i < 4 ? seg(p, ST[i] - 0.03, ST[i] + 0.005) : seg(p, 0.82, 0.85);
      var dx = (bs.x - mitteK.x) * (1 - auf), dy = (bs.y - mitteK.y) * (1 - auf), sc = 0.28 + 0.72 * sanft(auf);
      setze(karte[i], 'translate3d(' + r3(dx) + 'px, ' + r3(dy - weg * 28) + 'px, 0) scale(' + r3(sc * (1 - 0.04 * weg)) + ')', Math.min(auf * 1.4, 1) * (1 - weg));
    });
    function faden(t) { return { faden: t, punkt: ein(t, 0, 0.06, 0.94, 1.0001) }; }
    vars(karte[1], Object.assign({ neu: seg(T[0], 0.25, 0.7) }, faden(T[0])));
    vars(karte[2], Object.assign({ e1: seg(T[1], 0.1, 0.35), e2: seg(T[1], 0.3, 0.55), weg: seg(T[1], 0.62, 0.92) }, faden(T[1])));
    vars(karte[3], Object.assign({ slot: seg(T[2], 0.25, 0.55), haken: seg(T[2], 0.5, 0.8) }, faden(T[2])));
    vars(karte[4], Object.assign({ blase: seg(T[3], 0.05, 0.3), druck: ein(T[3], 0.3, 0.4, 0.55, 0.7), flug: seg(T[3], 0.38, 0.72), status: seg(T[3], 0.72, 0.9) }, faden(T[3])));

    /* 4 · die Website meldet „Beantwortet. Termin eingetragen ✓“, dann erscheint im Bildschirm „Was brauchen Sie?“ */
    var en = seg(p, 0.855, 0.88), M = seg(p, 0.925, 0.95);
    setze(meldung, 'translateY(' + r3(12 * (1 - en)) + '%) scale(' + r3(0.96 + 0.04 * en) + ')', en * (1 - M));
    setze(web.formular, null, M);
    oeffnen(O, roh);

    /* Texte links + Fortschritt */
    var n = p < 0.12 ? 0 : p < 0.35 ? 1 : p < 0.45 ? 2 : p < 0.85 ? 3 : 4;
    schritte.forEach(function (el, i) { el.classList.toggle('ist-an', i === n); });
    setze(text, null, 1 - seg(p, 0.88, 0.92));
    stufe = p < ST[0] ? 0 : p < ST[1] ? 1 : p < ST[2] ? 2 : p < ST[3] ? 3 : 4;
    fortschritt(fort.web, n === 1, sk < 1 ? 1 : fa < 1 ? 2 : 3, bi >= 1, TITEL.web);
    fortschritt(fort.ablauf, n >= 2, n === 2 ? 1 : stufe, n === 4 || T[3] >= 1, TITEL.ablauf);
    phase = ['start', 'website', 'anfrage', 'ablauf', 'fertig'][n] + (O > 0.5 ? '+formular' : '');
  }
  /* ---------- Neu: Büro → Kamera an den Laptop (Morgen → Gold), Website entsteht → Bildschirm öffnet sich in die Angebote ----------
     Haltepunkte p = 0 · 0.6 · 1 (mit ?fuehrung=1 nur 0 · 1). */
  function zeichnenNeu(p) {
    var x0 = m.fx + m.sx, y0 = m.fy + m.sy;
    var sWeb = Math.max(1.12, (m.hoch ? 0.62 : 0.36) * m.bw / m.sb), xWeb = m.hoch ? m.bw * 0.5 : m.bw * 0.62, yWeb = m.hoch ? m.bh * 0.62 : m.bh * 0.55;
    var sFill = Math.min(0.8 * m.bw / m.sb, 0.62 * m.bh / m.sh);
    var hin = sanft(p / 0.6), rein = sanft((p - 0.6) / 0.22), roh = klemm((p - 0.8) / 0.2), O = sanft(roh);
    var s = mix(mix(1, sWeb, hin), sFill, rein), zx = mix(mix(x0, xWeb, hin), m.bw / 2, rein), zy = mix(mix(y0, yWeb, hin), m.bh / 2, rein);
    kam = kamera(s * (1 + 0.05 * O), zx, zy);
    setze(licht.gold, null, seg(p, 0.05, 0.55)); setze(licht.abend, null, 0); setze(video, null, 0);
    setze(weich, null, 0.9 * O); setze(dunkel, null, 0);
    setze(blaetter, 'translate3d(' + r3(-hin * 8) + 'vw, ' + r3(hin * 14) + 'vh, 0) scale(' + r3(1 + hin * 0.25) + ')', 1 - seg(p, 0.3, 0.55));
    setze(aus, null, 1 - seg(p, 0.06, 0.16));
    var sk = seg(p, 0.14, 0.3), fa = seg(p, 0.3, 0.43), bi = seg(p, 0.43, 0.56);
    web.skizze.style.clipPath = 'inset(0 ' + r3(100 - sk * 100) + '% 0 0)'; setze(web.skizze, null, 1 - fa * 0.85);
    setze(web.farbe, null, fa); setze(web.bilder, null, bi);
    setze(meldung, null, 0); setze(web.formular, null, seg(p, 0.66, 0.8));
    setze(text, null, 1 - seg(p, 0.58, 0.72));
    oeffnen(O, roh);
    phase = p <= 0.001 ? 'start' : p < 0.6 ? 'hin' : p < 0.9995 ? 'rein' : 'angebote';
  }

  /* Formular öffnet sich: Ausschnitt wächst vom Bildschirm-Rechteck auf die ganze Bühne.
     Startseite: statt der Vorschau-Einblendung öffnet sich der echte Abschnitt „Was brauchen Sie?“ ([data-maschine-ziel]). Er liegt per
     margin-top: -100svh über dem letzten Bild der Maschine; solange er noch unter dem Fensterrand steht, wird er oben festgehalten. */
  var verschoben = 0;
  function oeffnen(o, roh) {
    if (abschnitt && NEU) {   /* Neu: Abschnitt liegt schon oben (Bühne 100svh, margin-top -100svh) – nur der Ausschnitt wächst */
      if (ruhig) return;
      if (o <= 0) { abschnitt.style.visibility = 'hidden'; abschnitt.style.clipPath = ''; return; }
      abschnitt.style.visibility = '';
      if (o >= 1) { abschnitt.style.clipPath = ''; return; }
      var a2 = anzeige.getBoundingClientRect(), z2 = abschnitt.getBoundingClientRect(), q3 = 1 - o;
      abschnitt.style.clipPath = 'inset(' + r3((a2.top - z2.top) * q3) + 'px ' + r3((window.innerWidth - a2.right) * q3) + 'px ' + r3((z2.height - (a2.bottom - z2.top)) * q3) + 'px ' + r3(a2.left * q3) + 'px round ' + r3(6 * q3 + 0.5) + 'px)';
      return;
    }
    if (abschnitt) {
      if (ruhig) return;   /* „Bewegung reduzieren“: Abschnitt steht ganz normal unter dem Standbild */
      var zr = abschnitt.getBoundingClientRect(), obenEcht = zr.top - verschoben, vorbei = obenEcht <= 0.5;   /* Lage OHNE die eigene Verschiebung (sonst schaltet es hin und her) */
      if (o <= 0 && !vorbei) { abschnitt.style.visibility = 'hidden'; abschnitt.style.clipPath = ''; abschnitt.style.transform = ''; verschoben = 0; return; }
      abschnitt.style.visibility = '';
      if (vorbei) { abschnitt.style.clipPath = ''; abschnitt.style.transform = ''; verschoben = 0; return; }
      var aa = anzeige.getBoundingClientRect(), q2 = 1 - o;
      verschoben = -obenEcht; abschnitt.style.transform = 'translate3d(0, ' + r3(verschoben) + 'px, 0)';   /* oben festhalten, bis er von selbst oben ist – kein Sprung */
      if (o >= 1) { abschnitt.style.clipPath = ''; return; }
      abschnitt.style.clipPath = 'inset(' + r3(aa.top * q2) + 'px ' + r3((window.innerWidth - aa.right) * q2) + 'px ' + r3((zr.height - aa.bottom) * q2) + 'px ' + r3(aa.left * q2) + 'px round ' + r3(6 * q2 + 0.5) + 'px)';
      return;
    }
    if (!formular) return;
    if (o <= 0) { formular.style.opacity = '0'; formular.style.pointerEvents = 'none'; return; }
    var b = buehne.getBoundingClientRect(), a = anzeige.getBoundingClientRect(), q = 1 - o;
    formular.style.clipPath = 'inset(' + r3((a.top - b.top) * q) + 'px ' + r3((b.right - a.right) * q) + 'px ' + r3((b.bottom - a.bottom) * q) + 'px ' + r3((a.left - b.left) * q) + 'px round ' + r3(6 * q + 0.5) + 'px)';
    formular.style.opacity = String(r3(klemm(roh / 0.2)));
    var klein = Math.max(0.2, Math.min(a.width / b.width, a.height / b.height));
    formularTeile.forEach(function (t, i) { setze(t, 'scale(' + r3(klein + (1 - klein) * o) + ')', i < 2 ? 1 : seg(o, 0.6, 1)); });
    formular.style.pointerEvents = o > 0.95 ? 'auto' : 'none';
  }
  function fortschritt(el, sichtbar, aktiv, alles, titel) {
    if (!el) return;
    el.classList.toggle('ist-an', sichtbar);
    $$('li', el).forEach(function (li, i) { li.classList.toggle('ist-fertig', alles || i + 1 < aktiv); li.classList.toggle('ist-aktiv', !alles && i + 1 === aktiv); });
    var t = $('[data-fort-titel]', el), neu = alles ? 'Erledigt ✓' : titel[aktiv - 1] || '';
    if (t.textContent !== neu) t.textContent = neu;
  }

  /* ---------- Nachladen: Lichtbilder nach dem ersten Bild, Video nur bei guter Verbindung, breitem Bildschirm, ohne Datensparen ---------- */
  function nachladen() {
    if (NEU) return nachladen4k();
    ['gold', 'abend'].forEach(function (k) {
      $$('source[data-srcset]', licht[k]).forEach(function (s) { s.srcset = s.getAttribute('data-srcset'); });
      var img = $('img', licht[k]); img.src = img.getAttribute('data-src');
    });
    var c = navigator.connection || {};
    if (!ruhig && !m.hoch && !c.saveData && !/(^|-)2g|3g/.test(c.effectiveType || '') && window.innerWidth >= 900) {
      video.src = video.getAttribute('data-src'); video.play().catch(function () {});
    }
  }

  /* ---------- Neu: 4K. Erst der kleine Platzhalter (srcset bis 2560), dann je Licht die 4K-Fassung (WebP Q88, quer 3840 × 2160 /
     hoch 2160 × 3840): fertig dekodieren, dann im selben Bild tauschen – gleicher Inhalt, nur schärfer, kein Sprung. Morgen zuerst. ---------- */
  function vierK(k) {
    return new Promise(function (fertig) {
      var ort = licht[k], img = ort && $('img', ort); if (!img) return fertig();
      if (img.hasAttribute('data-src')) img.removeAttribute('data-src');
      var url = 'bilder/hero/tropen/' + (m.hoch ? 'hoch' : 'quer') + '-' + k + '-' + (m.hoch ? 2160 : 3840) + '.webp';
      var bild = new Image(); bild.src = url;
      (bild.decode ? bild.decode() : Promise.resolve()).then(function () {
        $$('source', ort).forEach(function (s) { s.remove(); });
        img.removeAttribute('srcset'); img.removeAttribute('sizes'); img.src = url; img.setAttribute('data-4k', ''); fertig();
      }, fertig);
    });
  }
  function nachladen4k() {
    vierK('morgen').then(function () { return vierK('gold'); });
  }

  /* ---------- Neu: geführte Bewegung. Eine Geste (Rad, Trackpad, Wischen, Pfeil/Bild ab/Leertaste) spielt bis zum nächsten Haltepunkt.
     Während der Bewegung und bis der Trackpad-Nachschwung vorbei ist, werden Eingaben geschluckt – nie zwei Haltepunkte auf einmal.
     Ganz oben in den Angeboten führt eine Geste nach oben rückwärts. Anker (#preise, Anfrage, Zum Inhalt) springen ohne Ablauf ans Ende. ---------- */
  var HALT = EIN_ZUG ? [0, 1] : [0, 0.6, 1], halt = 0, bewegung = null, letzteEingabe = 0, sperreBis = 0;
  var DAUER = EIN_ZUG ? [4000] : [2500, 1500];
  function gesperrt(an) { document.documentElement.classList.toggle('m-halt', an); }
  function hinweisZeigen() { if (hinweis) hinweis.classList.toggle('ist-an', !bewegung && halt === 0); }
  function spiele(nach) {
    if (nach < 0 || nach >= HALT.length || nach === halt || bewegung) return;
    var von = p, bis = HALT[nach], d = DAUER[Math.min(halt, nach)], t0 = performance.now();
    var meine = { nach: nach }; gesperrt(true); bewegung = meine; hinweisZeigen();
    function takt(jetzt) {
      if (bewegung !== meine) return;   /* abgebrochen (z. B. Anker) */
      var x = klemm((jetzt - t0) / d), e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;   /* ease-in-out */
      p = ziel = von + (bis - von) * e; zeichnen(p);
      if (x < 1) { requestAnimationFrame(takt); return; }
      halt = nach; bewegung = null; sperreBis = performance.now() + 600;
      if (halt === HALT.length - 1) gesperrt(false);
      hinweisZeigen();
    }
    requestAnimationFrame(takt);
  }
  function springeEnde() {
    bewegung = null; halt = HALT.length - 1; p = ziel = 1; zeichnen(1); gesperrt(false); hinweisZeigen();
  }
  function betrifft(richtung) {   /* soll diese Eingabe die Szene bewegen (statt die Seite zu scrollen)? */
    if (bewegung) return true;
    if (halt < HALT.length - 1) return true;
    return richtung < 0 && window.scrollY <= 0;
  }
  function geste(richtung) {
    if (bewegung || performance.now() < sperreBis) return;
    spiele(halt + (richtung > 0 ? 1 : -1));
  }
  function fuehrungStarten() {
    window.addEventListener('wheel', function (e) {
      var jetzt = performance.now(), ruhe = jetzt - letzteEingabe; letzteEingabe = jetzt;   /* jede Radbewegung zählt – auch der Nachschwung */
      var r = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0; if (!r || !betrifft(r)) return;
      e.preventDefault();
      if (ruhe > 220 && Math.abs(e.deltaY) >= 3) geste(r);   /* neue Geste erst nach einer kurzen Pause */
    }, { passive: false });
    var y0 = null, obenStart = false, bewegt = 0;
    window.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; obenStart = window.scrollY <= 0; bewegt = 0; }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (y0 == null) return; bewegt = y0 - e.touches[0].clientY; var r = bewegt > 0 ? 1 : -1;
      if ((bewegung || halt < HALT.length - 1 || (r < 0 && obenStart && window.scrollY <= 0)) && e.cancelable) e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', function () {
      if (y0 == null) return; var r = bewegt > 0 ? 1 : -1, weit = Math.abs(bewegt) > 36; y0 = null;
      if (weit && (bewegung || halt < HALT.length - 1 || (r < 0 && obenStart))) geste(r);
    }, { passive: true });
    window.addEventListener('keydown', function (e) {
      var ort = e.target, feld = ort && (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(ort.tagName) || ort.isContentEditable);
      if (feld || e.altKey || e.ctrlKey || e.metaKey) return;
      var r = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key]; if (e.key === ' ') r = e.shiftKey ? -1 : 1;
      if (e.key === 'End' && halt < HALT.length - 1) { e.preventDefault(); springeEnde(); return; }
      if (!r || !betrifft(r)) return;
      e.preventDefault(); if (!e.repeat) geste(r);
    });
    /* Anker und Tastatur-Fokus in den Angeboten: direkt ans Ende, ohne Ablauf */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      if (/^#(preise|kontakt|inhalt)$/.test(a.getAttribute('href')) && halt < HALT.length - 1) springeEnde();
    }, true);
    window.addEventListener('hashchange', function () { if (/^#(preise|kontakt|inhalt)$/.test(location.hash)) springeEnde(); });
    if (abschnitt) abschnitt.addEventListener('focusin', function () { if (halt < HALT.length - 1) springeEnde(); });
    if (/^#(preise|kontakt|inhalt)$/.test(location.hash) || window.scrollY > 0) springeEnde();
    else { gesperrt(true); p = ziel = 0; zeichnen(0); hinweisZeigen(); }
  }

  /* ---------- EINE Scroll-Quelle mit Glättung ---------- */
  function lesen() { var r = strecke.getBoundingClientRect(), weg = r.height - window.innerHeight; return weg > 0 ? klemm(-r.top / weg) : 0; }
  function schritt() {
    p += (ziel - p) * 0.14;
    if (Math.abs(ziel - p) < 0.0004) p = ziel;
    zeichnen(p);
    if (p !== ziel) requestAnimationFrame(schritt); else laeuft = false;
  }
  function beimScrollen() { ziel = lesen(); if (!laeuft) { laeuft = true; requestAnimationFrame(schritt); } }

  messen();
  if (ruhig && document.readyState !== 'complete') window.addEventListener('load', function () { messen(); kamera(1, m.fx + m.sx, m.fy + m.sy); });
  if (ruhig) {   /* Standbild Morgen, fertige Website, Meldung sichtbar */
    zeichnen(0.36); setze(licht.gold, null, 0); setze(licht.abend, null, 0); setze(meldung, 'none', 1);
    schritte.forEach(function (el, i) { el.classList.toggle('ist-an', i === 4); });
    fortschritt(fort.web, false, 3, true, TITEL.web); fortschritt(fort.ablauf, true, 4, true, TITEL.ablauf);
    [1, 2, 3, 4].forEach(function (i) { setze(karte[i], null, 0); });
    kamera(1, m.fx + m.sx, m.fy + m.sy); setze(blaetter, null, 1); setze(brief, null, 0);
  } else if (NEU) {
    fuehrungStarten();
    window.addEventListener('resize', function () { messen(); zeichnen(p); });
    var neuMessen2 = function () { messen(); zeichnen(p); };
    window.addEventListener('load', neuMessen2);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(neuMessen2);
  } else {
    p = ziel = lesen(); zeichnen(p);
    window.addEventListener('scroll', beimScrollen, { passive: true });
    window.addEventListener('resize', function () { messen(); zeichnen(p); });
    /* Startseite: das Skript kann vor maschine.css/Schriften laufen → nach dem Laden noch einmal messen */
    var neuMessen = function () { messen(); zeichnen(p); };
    window.addEventListener('load', neuMessen);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(neuMessen);
  }
  if (document.readyState === 'complete') setTimeout(nachladen, 200); else window.addEventListener('load', function () { setTimeout(nachladen, 200); });
  window.__maschine = { p: function (x) { p = ziel = klemm(x); zeichnen(p); return phase; }, geste: function (r) { if (NEU) { sperreBis = 0; geste(r); } }, springeEnde: function () { if (NEU) springeEnde(); }, zustand: function () { return { neu: NEU, halt: halt, laeuft: !!bewegung, gesperrt: document.documentElement.classList.contains('m-halt'), p: p, phase: phase, stufe: stufe, hoch: m.hoch, schirm: [r3(m.sb), r3(m.sh)], kamera: kam }; } };
})();
