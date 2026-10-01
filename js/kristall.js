/* ERGUN. – Startseite „Kristall“ (01.10.2026, Vorschau ?titel=kristall). Ausnahme auf ERGUNs Wunsch: Aufbau, Scroll-Ablauf und Look der
   Vorlage „Lycoris Specimen“ (07 Vorlagen/Lycoris-Specimen-Vorlage.tsx.txt) 1:1 in Vanilla JS + rohem WebGL nachgebaut – nur Inhalt und
   Objekt getauscht: statt der Spinnenlilie ein pinker, edel geschliffener Kristall, der über die sechs Bilder wächst:
     01 roher Keim (wenige Facetten) · 02 erste klare Facetten: der Stein wächst heraus · 03 er streckt sich zum Schliff, Begleitsteine wachsen an ·
     04 der Cluster ordnet sich zu einer präzisen Struktur · 05 vollständig, scharfe Kanten, perfekte Politur · 06 Endstadium beim
     Kontaktformular: ruhig, dezentes Leuchten im Kern, seitlich neben dem Formular (am Handy klein oben).
   Wie die Vorlage: Scroll = Zeitachse (Bühne klebt, 5 × 1,2 Bühnenhöhen Scroll), 6 Bilder mit 34 % Haltezeit, Kamera kreist zwischen den
   Bildern (Schlüsselbilder, eigene fürs Hochformat), Schrift erscheint über rise/clip/line/fade gestaffelt, das Cover-Wort teilt sich zur
   Krone, Lichthof hinter dem Objekt, Pointer-Tilt + langsames Drehen + Ziehen, „Bewegung reduzieren“ = still. Ohne WebGL: sauberes
   Standbild des Kristalls im Endstadium (2D). Zahlen nur aus window.PREISE. Seed: ?seed=… (Form), ?krone=rand (Vorlage: nur erster und
   letzter Buchstabe flankieren). Prüfgriff: window.__kristall. */
(function () {
  var root = document.querySelector('[data-k-root]');
  if (!root) return;
  var html = document.documentElement, frage = new URLSearchParams(location.search);
  if (frage.get('farbe') === 'orange') html.setAttribute('data-farbe', 'orange');
  if (frage.get('schrift') === 'a') html.setAttribute('data-schrift', 'a');   /* Standard = Clash Display (Emre, 01.10.) */
  if (frage.get('knopf') === 'pink') html.setAttribute('data-knopf', 'pink');
  if (frage.get('schrift') === 'vorlage') html.setAttribute('data-schrift', 'vorlage');   /* Display-Schrift der Vorlage (Federant, lokal) zum Vergleich */
  /* Fassung „Blume“ (?titel=blume, 01.10. – näher an die Vorlage): der Diamant öffnet sich zur Knospe, die Blüte geht Bild für Bild auf.
     Art per ?blume=rose|tulpe|lilie (Standard rose); die Geometrie kommt aus js/blume.js. */
  /* Fassung „Lycoris“ (?titel=lycoris, 01.10. – ERGUN: „den Prompt eins zu eins nachmachen, nur meinen Text“): die Vorlage 1:1 –
     rote Chrom-Spinnenlilie von Anfang an (blüht beim Laden auf wie dort), Karmin, Kamera-Bilder der Vorlage, kein Diamant. */
  /* Fassung „Lycoris 3“ (?titel=lycoris3, 01.10.): die Vorlage 1:1, aber nur 3 Bilder – Start · Angebote · Kontakt (Leiste oben) */
  var DREI = window.ERGUN_WAHL === 'lycoris3' && !!window.ERGUN_BLUME;
  var B = window.ERGUN_BLUME, LYCORIS = (window.ERGUN_WAHL === 'lycoris' || DREI) && !!B, BLUME = (window.ERGUN_WAHL === 'blume' || LYCORIS) && !!B;
  /* Fassung „Lebensbaum“ (?titel=baum, 01.10.): Lebensbaum im Kreis (Formvorlage Feld 5) wächst mit jedem Bild, der Ring schließt sich beim Formular.
     Geometrie einmal aus js/baum.js, Wachstum nur über Uniforms. ?farbe=vorlage = Karmin der Vorlage. */
  var T = window.ERGUN_BAUM, BAUM = window.ERGUN_WAHL === 'baum' && !!T;
  /* volle Blume statt der Spinnenlilie (01.10., seit Emres Wahl Standard: Dahlie in Lila; ?blume=lilie = rote Spinnenlilie der Vorlage).
     Art ?art=dahlie|pfingstrose|lotus, Farbe ?farbe=lila|rosegold|karmin|elfenbein|pflaume */
  var VOLL = LYCORIS && frage.get('blume') !== 'lilie';
  var ART = VOLL ? (B.VOLL.indexOf(frage.get('art')) >= 0 ? frage.get('art') : 'dahlie') : LYCORIS ? 'lilie' : BLUME ? (B.ARTEN.indexOf(frage.get('blume')) >= 0 ? frage.get('blume') : 'rose') : null;
  if (BLUME) html.setAttribute('data-blume', ART);
  var BFEIN = Math.min(window.innerWidth || 1440, window.innerHeight || 900) < 700 ? 0.82 : 1;   /* Handy: etwas weniger Blütenblätter (noch ohne Lücken) */
  var FEST_K = frage.get('k') !== null && frage.get('k') !== '' ? parseFloat(frage.get('k')) : null, FEST_O = frage.get('offen') !== null && frage.get('offen') !== '' ? parseFloat(frage.get('offen')) : null;   /* nur zum Prüfen */
  /* Hintergrund-Muster (Brillant-Streuung, eigenes Bild, kachelbar): Standard seit ERGUNs OK (01.10.); ?muster=aus schaltet es ab; in der Blume nur mit ?muster=b */
  var MUSTER_STANDARD = true, MUSTER = frage.get('muster') === 'b' || (MUSTER_STANDARD && !BLUME && !BAUM && frage.get('muster') !== 'aus');
  if (MUSTER) html.setAttribute('data-muster', 'b');
  var SEED = parseInt(frage.get('seed'), 10) || 7, KRONE_RAND = BLUME || BAUM ? frage.get('krone') !== 'teile' : frage.get('krone') === 'rand';   /* Blume: wie die Vorlage rahmen nur „E“ und „.“ die Krone */
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var buehne = $('[data-k-buehne]', root), strecke = $('[data-k-strecke]', root), leinwand = $('[data-k-leinwand]', root), schein = $('[data-k-schein]', root), wort = $('[data-k-wort]', root), muster = $('[data-k-muster]', root);

  /* Das echte Formular (#preise in <main>) gehört als Bild 06 in die Bühne: <main> wandert hinter die Strecke, die Bühne klebt weiter daneben */
  var haupt = document.querySelector('main#inhalt'); if (haupt) root.appendChild(haupt);
  /* Fußleiste wie die Vorlage (links · Zeichen · rechts): WhatsApp (öffnet das Formular mit „WhatsApp“ gewählt – keine Nummer auf der Seite) ·
     E-Mail (die öffentliche Adresse der Seite) · Impressum · Datenschutz */
  var fuss = document.createElement('footer'); fuss.className = 'k-fussleiste';
  fuss.innerHTML = '<nav aria-label="Kontakt"><a href="#kontakt" data-k-weg="whatsapp">WhatsApp</a><a href="mailto:ergun.eu@gmail.com">E-Mail</a></nav>' +
    '<svg class="k-marke" data-k-marke width="30" height="30" viewBox="0 0 40 40" aria-hidden="true"></svg>' +
    '<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav>';
  root.parentNode.insertBefore(fuss, root.nextSibling);
  fuss.querySelector('[data-k-weg]').addEventListener('click', function () {
    var r = document.querySelector('#anfrage input[name="weg"][value="whatsapp"]'); if (r && !r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
  });

  /* ---------- Mathe ---------- */
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6d2b79f5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function klemm(x) { return x <= 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = klemm((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function mixV(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }

  /* ---------- der Kristall als Bauplan (ERGUN., 01.10.: „kristallförmiger, nicht so Quarz-Style – hochwertig, edel“) ----------
     Ein länglich geschliffener Hauptstein wie ein Schmuckstein: Tafel · Krone · doppelte Rundiste · langes Unterteil · Spitze, je Ring
     12 Facetten, Ringe gegeneinander versetzt → dreieckige Facetten wie ein echter Schliff. Dazu sechs kleinere Begleitsteine, die sich in
     Bild 04 zu einem präzisen Ring ordnen, und acht winzige Steine im Endstadium. Am Anfang ein roher Keim, aus dem der Stein wächst. */
  var N = 16;
  function bauplan(seed) {
    var r = rng(seed);
    function kugel() { var u = r() * 2 - 1, w = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); return [s * Math.cos(w), u, s * Math.sin(w)]; }
    function steine(anzahl, ring, hoehen, neigung, groesse, geburt, voll, wildAbstand) {
      var liste = [];
      for (var i = 0; i < anzahl; i++) {
        var phi = (i / anzahl) * Math.PI * 2 + Math.PI / anzahl, w = kugel();
        liste.push({
          ordLage: [Math.cos(phi) * ring, hoehen[i % hoehen.length], Math.sin(phi) * ring],
          ordAchse: norm([Math.cos(phi) * neigung, 1, Math.sin(phi) * neigung]),
          wildLage: mul(norm([w[0], w[1] * 0.7, w[2]]), wildAbstand + r() * 0.5), wildAchse: kugel(),
          groesse: groesse * (0.92 + r() * 0.16), geburt: geburt + i * 0.08, voll: voll + r() * 0.3, dreh: r() * 6.28
        });
      }
      return liste;
    }
    var gt = (1 + Math.sqrt(5)) / 2, ik = [[-1, gt, 0], [1, gt, 0], [-1, -gt, 0], [1, -gt, 0], [0, -1, gt], [0, 1, gt], [0, -1, -gt], [0, 1, -gt], [gt, 0, -1], [gt, 0, 1], [-gt, 0, -1], [-gt, 0, 1]].map(norm);
    var flaechen = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    return {
      begleiter: steine(6, 1.45, [0.16, -0.16], 0.5, 0.42, 1.45, 3.0, 1.0),
      funken: steine(8, 2.0, [0.5, -0.62], 0.2, 0.2, 3.0, 4.3, 1.7),
      kern: { ecken: ik, flaechen: flaechen, roh: ik.map(function () { return 0.72 + r() * 0.6; }) },
      dreh: r() * 6.28
    };
  }
  var PLAN = bauplan(SEED);
  var MITTE = [0, 0, 0];   /* Mitte des Steins – dorthin schaut die Kamera */

  /* Profil (Höhe, Radius) von oben nach unten – Maße eines Brillanten (Rundiste = Durchmesser 1):
     Tafel-Mitte · Tafel (56 %) · Stern-/Haupt-Facetten der Krone · Rundiste oben/unten · untere Rundisten-Facetten · Spitze.
     Krone 15 %, Unterteil 43 %, gerade Flanken (kein Bauch – sonst wirkt der Stein wie ein Tropfen).
     f = 0: schlichte Doppelpyramide (erste klare Facetten) · f = 1: voller Brillantschliff */
  var PROFIL_0 = [[0.5, 0], [0.49, 0.01], [0.26, 0.25], [0.01, 0.49], [-0.01, 0.49], [-0.26, 0.25], [-0.5, 0]];
  var PROFIL_1 = [[0.16, 0], [0.16, 0.28], [0.085, 0.405], [0.012, 0.5], [-0.012, 0.5], [-0.19, 0.285], [-0.43, 0]];

  /* Zustand bei Bild-Koordinate c (0…5): Dreiecke mit Flächen-Normalen, Baryzentrik, echten Kanten und „runder“ Normale */
  var STRIDE = 15;   /* Lage 3 · Flächen-Normale 3 · Baryzentrik 3 · echte Kanten 3 · runde Normale 3 */
  function geometrie(c, nurDiamant) {
    var v = [], ordnung = smooth(2.4, 3.5, c), rauh = 1 - smooth(0.2, 1.4, c);
    function drei(a, b, d, kanten, innen, ra, rb, rd) {
      var n = norm(cross(sub(b, a), sub(d, a)));
      var schwer = mul(add(add(a, b), d), 1 / 3);
      if (innen && dot(n, sub(schwer, innen)) < 0) { var tmp = b; b = d; d = tmp; tmp = rb; rb = rd; rd = tmp; n = mul(n, -1); kanten = [kanten[0], kanten[2], kanten[1]]; }
      [[a, [1, 0, 0], ra], [b, [0, 1, 0], rb], [d, [0, 0, 1], rd]].forEach(function (x) {
        var p = sub(x[0], MITTE), rn = x[2] || n;
        v.push(p[0], p[1], p[2], n[0], n[1], n[2], x[1][0], x[1][1], x[1][2], kanten[0], kanten[1], kanten[2], rn[0], rn[1], rn[2]);
      });
    }
    /* ein geschliffener Stein: Lage, Achse, Größe, Drehung, Form f */
    function stein(lage, achse, groesse, dreh, f) {
      if (groesse < 0.004) return;
      var y = norm(achse), x = norm(cross(y, Math.abs(y[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0])), z = cross(x, y);
      var cd = Math.cos(dreh), sd = Math.sin(dreh), x2 = add(mul(x, cd), mul(z, sd)), z2 = sub(mul(z, cd), mul(x, sd)); x = x2; z = z2;
      function welt(l) { return add(lage, add(add(mul(x, l[0] * groesse), mul(y, l[1] * groesse)), mul(z, l[2] * groesse))); }
      function richt(l) { return norm(add(add(mul(x, l[0]), mul(y, l[1])), mul(z, l[2]))); }
      var ringe = PROFIL_1.map(function (q, k) {
        var h = mix(PROFIL_0[k][0], q[0], f), rad = mix(PROFIL_0[k][1], q[1], f), versatz = (k % 2) * Math.PI / N, pk = [];
        for (var m = 0; m < N; m++) { var w = versatz + (m / N) * Math.PI * 2; pk.push([Math.cos(w) * rad, h, Math.sin(w) * rad]); }
        return { h: h, rad: rad, p: pk };
      });
      for (var k = 0; k < ringe.length - 1; k++) {
        var A = ringe[k], B = ringe[k + 1], innen = welt([0, (ringe[0].h + ringe[ringe.length - 1].h) / 2, 0]);   /* Mitte des ganzen Steins – bei der flachen Tafel lag die Ring-Mitte in der Fläche */
        for (var m = 0; m < N; m++) {
          var m2 = (m + 1) % N;
          var a1 = A.p[m], a2 = A.p[m2], b1 = B.p[m], b2 = B.p[m2];
          var ra = function (l) { return richt([l[0], l[1] * 0.55, l[2]]); };
          if (A.rad > 1e-4) drei(welt(a1), welt(a2), welt(b1), [1, 1, 1], innen, ra(a1), ra(a2), ra(b1));
          if (B.rad > 1e-4) drei(welt(a2), welt(b2), welt(b1), [1, 1, 1], innen, ra(a2), ra(b2), ra(b1));
        }
      }
    }
    if (nurDiamant) { stein([0, 0.135 * nurDiamant, 0], [0, 1, 0], nurDiamant, PLAN.dreh, 1); return new Float32Array(v); }   /* Blume, Bild 01: der polierte Brillant allein */
    /* roher Keim: am Anfang da, der Stein wächst aus ihm heraus */
    var kr = 0.36 * (1 - smooth(0.7, 1.7, c));
    if (kr > 0.005) {
      var ke = PLAN.kern.ecken.map(function (e, i) { return mul(e, kr * mix(1, PLAN.kern.roh[i], 0.35 + 0.65 * rauh)); });
      PLAN.kern.flaechen.forEach(function (fl) { drei(ke[fl[0]], ke[fl[1]], ke[fl[2]], [1, 1, 1], [0, 0, 0], norm(ke[fl[0]]), norm(ke[fl[1]]), norm(ke[fl[2]])); });
    }
    /* Hauptstein: wächst aus dem Keim (Bild 02 erste klare Facetten), streckt sich zum vollen Schliff (Bild 03–05) */
    var s = 1 - Math.pow(1 - klemm((c - 0.25) / 2.2), 3), f = smooth(0.7, 3.4, c);
    stein([0, 0.17 * f, 0], [0, 1, 0], 1.45 * s, PLAN.dreh, f);
    /* Begleitsteine und Funken: erst frei im Raum, dann präzise im Ring */
    PLAN.begleiter.concat(PLAN.funken).forEach(function (b) {
      var t = klemm((c - b.geburt) / (b.voll - b.geburt)); if (t <= 0) return;
      var e = 1 - Math.pow(1 - t, 3);
      stein(mixV(b.wildLage, b.ordLage, ordnung), mixV(b.wildAchse, b.ordAchse, ordnung), b.groesse * e, b.dreh, smooth(0.2, 1, t));
    });
    return new Float32Array(v);
  }
  /* Radius des ausgewachsenen Clusters um die Mitte (für die Kamera – wie „radius“ der Vorlage) */
  var RADIUS = BAUM ? T.RADIUS : BLUME ? B.radius(ART, SEED) : (function () { var g = geometrie(5), r = 0; for (var i = 0; i < g.length; i += STRIDE) r = Math.max(r, Math.hypot(g[i], g[i + 1], g[i + 2])); return r; })();

  /* ---------- Blume: der Diamant öffnet sich ----------
     Jede Facette löst sich weich: sie kippt um ihre Querachse nach außen (wie ein Blütenblatt, das aufgeht), gleitet nach außen/oben und
     wird dabei kleiner – oben zuerst, im Kreis leicht versetzt. Im selben Zug wächst die Knospe aus der Mitte (u_bloom wie die Vorlage). */
  var DIAMANT = BLUME && !LYCORIS ? RADIUS * 0.42 / 0.5 : 0, DIAMANT_DATEN = BLUME && !LYCORIS ? geometrie(0, DIAMANT) : null;
  function drehe(v, a, w) { var c = Math.cos(w), s = Math.sin(w), d = dot(a, v); return add(add(mul(v, c), mul(cross(a, v), s)), mul(a, d * (1 - c))); }
  function zerfall(daten, t) {
    if (t <= 0) return daten;
    var aus = [], hoehe = DIAMANT * 0.6;
    for (var i = 0; i < daten.length; i += STRIDE * 3) {
      var cen = [0, 0, 0];
      for (var j = 0; j < 3; j++) cen = add(cen, [daten[i + j * STRIDE], daten[i + j * STRIDE + 1], daten[i + j * STRIDE + 2]]);
      cen = mul(cen, 1 / 3);
      var verz = klemm((0.5 - cen[1] / hoehe) * 0.42) + 0.06 * (1 + Math.sin(Math.atan2(cen[2], cen[0]) * 3));
      var e = smooth(0, 1, klemm((t - verz) / 0.5)); if (e >= 0.999) continue;
      var nrm = [daten[i + 3], daten[i + 4], daten[i + 5]], achse = cross(nrm, [0, 1, 0]);
      achse = Math.hypot(achse[0], achse[1], achse[2]) < 1e-3 ? [1, 0, 0] : norm(achse);
      var aussen = norm([nrm[0] + cen[0] * 0.8, 0, nrm[2] + cen[2] * 0.8]), w = e * 1.6, weg = add(mul(aussen, e * DIAMANT * 0.42), [0, e * DIAMANT * 0.12, 0]), sk = Math.pow(1 - e, 1.6);   /* seitlich weg wie aufgehende Blätter, nicht nach unten */
      for (j = 0; j < 3; j++) {
        var o = i + j * STRIDE, q = add(add(cen, mul(drehe(sub([daten[o], daten[o + 1], daten[o + 2]], cen), achse, w), sk)), weg);
        var nf = drehe([daten[o + 3], daten[o + 4], daten[o + 5]], achse, w), nr = drehe([daten[o + 12], daten[o + 13], daten[o + 14]], achse, w);
        aus.push(q[0], q[1], q[2], nf[0], nf[1], nf[2], daten[o + 6], daten[o + 7], daten[o + 8], daten[o + 9], daten[o + 10], daten[o + 11], nr[0], nr[1], nr[2]);
      }
    }
    return new Float32Array(aus);
  }
  /* wie weit die Blüte je Bild offen ist (01 Knospe verborgen im Diamanten · 02 Knospe · 03–05 öffnet sich · 06 voll offen) */
  var OFFEN = [0.04, 0.16, 0.4, 0.64, 0.88, 1];
  function offenBei(c) { var i = Math.max(0, Math.min(4, Math.floor(c))), f = klemm(c - i); return mix(OFFEN[i], OFFEN[i + 1], f); }

  /* ---------- Scroll → Bild-Koordinate (wie die Vorlage) ---------- */
  function sceneCoord(p, n, hold) { if (n <= 1) return 0; var t = klemm(p) * (n - 1), i = Math.min(Math.floor(t), n - 2), h = hold / 2; return i + easeInOut(klemm((t - i - h) / (1 - 2 * h))); }
  function reveal(coord, scene, delay) { var d = coord - scene, lag = d < 0 ? delay : 1 - delay; return klemm((0.6 - Math.abs(d) - lag * 0.2) / 0.25); }

  /* ---------- Kamera-Schlüsselbilder (Vorlage; Bild 06 neu: Kristall seitlich neben dem Formular, am Handy klein oben) ---------- */
  var KEYS = [
    { spin: 0.2, el: 9, size: 0.86, ox: 0, oy: 0.3 },
    { spin: 1.4, el: 88, size: 0.58, ox: 0, oy: 0 },
    { spin: 2.3, el: 12, size: 0.27, ox: 0, oy: 0.4 },
    { spin: 3.1, el: -30, size: 0.74, ox: 0, oy: -0.46 },
    { spin: 4.1, el: 16, size: 1.02, ox: 0.66, oy: 0.2 },
    { spin: 5.0, el: 14, size: 0.66, ox: 0.5, oy: 0.04 }
  ];
  var KEYS_TALL = [{ size: 0.9, oy: 0.36 }, { size: 0.56 }, { size: 0.34, oy: 0.44 }, { size: 0.66, oy: -0.5 }, { size: 0.86, ox: 0.5, oy: 0.46 }, { size: 0.34, ox: 0, oy: 0.74 }];
  if (BLUME) {   /* Kamera-Bilder der Vorlage 1:1 (#region camera frames) – nur Bild 06 weicht aus: die Blüte hängt von oben rechts herein und verdeckt das Formular nie */
    KEYS = [
      { spin: 0.2, el: 9, size: 0.86, ox: 0, oy: 0.3, stem: 1 },
      { spin: 1.4, el: 88, size: 0.58, ox: 0, oy: 0, stem: 0 },
      { spin: 2.3, el: 12, size: 0.27, ox: 0, oy: 0.4, stem: 0.3 },
      { spin: 3.1, el: -30, size: 0.86, ox: 0, oy: -0.34, stem: 0.06 },
      { spin: 4.1, el: 16, size: 1.02, ox: 0.66, oy: 0.2, stem: 1 },
      { spin: 5.0, el: 30, size: 0.6, ox: 0.56, oy: 0.04, stem: 0.3 }
    ];
    KEYS_TALL = [{ size: 0.9, oy: 0.36 }, { size: 0.56 }, { size: 0.34, oy: 0.44 }, { size: 0.95, oy: -0.2 }, { size: 0.86, ox: 0.5, oy: 0.46 }, { size: 0.5, ox: 0, oy: 0.8 }];
    /* Rose und Tulpe sehen von unten wie eine Schale aus (die Lilie der Vorlage nicht) – im Fächer daher leicht von oben */
    if (ART !== 'lilie') { KEYS[3].el = 6; KEYS[3].oy = -0.4; KEYS_TALL[3] = { size: 0.8, oy: -0.36 }; }
    if (LYCORIS) {   /* Vorlage 1:1, auch Bild 06: die Lilie hängt von oben ins Bild (das Formular rückt dafür nach unten, siehe kristall.css) */
      KEYS[5] = { spin: 5.0, el: -74, size: 0.86, ox: 0, oy: 1.02, stem: 0.04 };
      KEYS_TALL[5] = { size: 0.96, oy: 1.0 };
      KEYS_TALL[3] = { size: 0.82, oy: -0.44 };   /* Handy: unter den Preisen bleibt Platz (die Vorlage hat dort keine Preiszeilen) */
    }
    if (DREI) {   /* 3 Bilder: Cover → Fächer (die große kreisende Fahrt der Vorlage, Lilie von unten) → Lilie hängt von oben über dem Formular */
      KEYS = [KEYS[0], { spin: 3.1, el: -30, size: 0.52, ox: 0, oy: -0.8, stem: 0.06 }, KEYS[5]];
      KEYS_TALL = [KEYS_TALL[0], { size: 0.8, oy: -0.52 }, KEYS_TALL[5]];
    }
  }
  if (BAUM) {   /* Bahnen wie die Vorlage, aber das Emblem bleibt immer frontal und groß im Blick (Emre: „man soll alles erkennen“) */
    KEYS = [
      { spin: -0.15, el: 6, size: 0.82, ox: 0, oy: 0.18 },
      { spin: 0.12, el: 2, size: 0.62, ox: 0, oy: 0 },
      { spin: -0.2, el: 8, size: 0.44, ox: 0, oy: 0.46 },
      { spin: 0.22, el: -6, size: 0.46, ox: 0, oy: -0.42 },
      { spin: -0.15, el: 4, size: 0.8, ox: 0.5, oy: 0.04 },
      { spin: 0.0, el: 2, size: 0.62, ox: 0.52, oy: 0.02 }
    ];
    KEYS_TALL = [{ size: 0.9, oy: 0.3 }, { size: 0.62 }, { size: 0.5, oy: 0.62 }, { size: 0.82, oy: -0.44 }, { size: 0.8, ox: 0, oy: 0.42 }, { size: 0.46, ox: 0, oy: 0.66 }];
  }
  var SCENES = KEYS.length, HOLD = 0.34, NAV = DREI ? ['Start', 'Angebote', 'Kontakt'] : ['ERGUN.', BAUM ? 'Baum' : BLUME ? 'Blüte' : 'Kristall', 'Websites', 'Preise', 'Anspruch', 'Anfrage'];
  var KEYS_ENG = BAUM ? { 5: { size: 0.26, ox: 0, oy: 0.6 } } : BLUME && !LYCORIS ? { 5: { size: 0.3, ox: 0, oy: 0.74 } } : {};   /* Blume, mittlere Breiten (< 1100 px quer): Blüte klein oben über dem Formular statt daneben – sie verdeckt es nie */
  var KEYS_TAB = BAUM ? { 3: { size: 0.5, oy: -0.5 }, 5: { size: 0.26, ox: 0, oy: 0.6 } } : {};
  var KEYS_KURZ = DREI ? { 1: { size: 0.56, oy: -0.62 }, 2: { size: 0.6, oy: 1.02 } } : BAUM ? { 3: { size: 0.66, oy: -0.4 }, 5: { size: 0.28, oy: 0.84 } } : LYCORIS ? { 5: { size: 0.6, oy: 1.02 } } : BLUME ? { 5: { size: 0.4, oy: 0.95 } } : { 5: { size: 0.28, oy: 0.8 } };   /* kleine Handys (Höhe < 720): Kristall über dem Formular kleiner und höher, damit alle drei Karten ohne Scrollen passen */
  function keyAt(coord, tall) {
    var i = Math.max(0, Math.min(SCENES - 1, Math.floor(coord))), j = Math.min(SCENES - 1, i + 1), f = coord - i, kurz = tall && H < 720, eng = !tall && W < 1100, tab = BAUM && tall && W >= 700;   /* Lebensbaum: Tablet hochkant eigene Lage */
    var a = Object.assign({}, KEYS[i], tall ? KEYS_TALL[i] : {}, eng ? KEYS_ENG[i] : {}, tab ? KEYS_TAB[i] : {}, kurz ? KEYS_KURZ[i] : {}), b = Object.assign({}, KEYS[j], tall ? KEYS_TALL[j] : {}, eng ? KEYS_ENG[j] : {}, tab ? KEYS_TAB[j] : {}, kurz ? KEYS_KURZ[j] : {});
    return { spin: mix(a.spin, b.spin, f), el: mix(a.el, b.el, f), size: mix(a.size, b.size, f), ox: mix(a.ox, b.ox, f), oy: mix(a.oy, b.oy, f), stem: mix(a.stem || 0, b.stem || 0, f) };
  }

  /* ---------- Matrizen (spaltenweise) ---------- */
  function perspective(fovy, aspect, near, far) { var f = 1 / Math.tan(fovy / 2), m = new Float32Array(16); m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far); m[11] = -1; m[14] = (2 * far * near) / (near - far); return m; }
  function lookAt(eye, at) { var z = norm(sub(eye, at)), x = norm(cross([0, 1, 0], z)), y = cross(z, x), m = new Float32Array(16); m[0] = x[0]; m[4] = x[1]; m[8] = x[2]; m[1] = y[0]; m[5] = y[1]; m[9] = y[2]; m[2] = z[0]; m[6] = z[1]; m[10] = z[2]; m[12] = -dot(x, eye); m[13] = -dot(y, eye); m[14] = -dot(z, eye); m[15] = 1; return m; }
  function multiply(a, b) { var o = new Float32Array(16); for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; }
  function rotY(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  function rotX(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function hexToLinear(hex) { var h = hex.replace('#', ''); var n = parseInt(h, 16); var ch = function (v) { return Math.pow(v / 255, 2.2); }; return [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255)]; }

  /* ---------- Farben: pinker Edelstein-Chrom (Rosenquarz/Pink-Saphir) · Vergleich ?farbe=orange = Chrom ---------- */
  var ORANGE = html.getAttribute('data-farbe') === 'orange';
  var FARBE = ORANGE ? mul(hexToLinear('#C9CCD3'), 1.5) : mul(hexToLinear('#E8A0BF'), 1.55);
  var TIEF = ORANGE ? hexToLinear('#3B3E46') : hexToLinear('#9E4F74');
  var HEISS = ORANGE ? [1, 0.97, 0.94] : [1, 0.9, 0.95];
  var AKZENT = ORANGE ? '#FF5A1F' : '#E8A0BF', GRUEN = mul(hexToLinear('#4F7A4A'), 2.2);   /* grünes Chrom: Stiel, Kelch, Blätter der vollen Blume */
  if (BAUM && !ORANGE) FARBE = mul(hexToLinear('#E8A0BF'), 1.9);   /* Lebensbaum: frontal gesehen spiegelt das Chrom weniger – etwas heller, wie Feld 5 */
  if (LYCORIS || (BAUM && frage.get('farbe') === 'vorlage')) {   /* Karmin der Vorlage (#e3131b): u_red = rot × 2,2, Glanz = (1, 0,55 + g, 0,5 + b) – wie dort */
    var rot = hexToLinear('#e3131b'); FARBE = mul(rot, 2.2); HEISS = [1, 0.55 + rot[1], 0.5 + rot[2]]; AKZENT = '#e3131b';
    if (VOLL) {   /* Blütenfarbe im selben Chrom-Stil; Lichthof und Akzente der Seite folgen ihr */
      var FARBEN = { rosegold: ['#C48A74', 1.7], karmin: ['#e3131b', 2.2], elfenbein: ['#E3D6BE', 1.05], pflaume: ['#6B2D5C', 2.6], lila: ['#9B6BCB', 1.9] }, wahlF = FARBEN[frage.get('farbe')] ? frage.get('farbe') : 'lila';
      rot = hexToLinear(FARBEN[wahlF][0]); FARBE = mul(rot, FARBEN[wahlF][1]); HEISS = [1, Math.min(1.2, 0.55 + rot[1]), Math.min(1.2, 0.5 + rot[2])]; AKZENT = FARBEN[wahlF][0];
      var hx = parseInt(AKZENT.slice(1), 16); html.style.setProperty('--k-akzent', AKZENT); html.style.setProperty('--k-glut', ((hx >> 16) & 255) + ', ' + ((hx >> 8) & 255) + ', ' + (hx & 255));
      html.setAttribute('data-bluetenfarbe', wahlF);
    } if (BAUM) { TIEF = mul(rot, 0.45); html.setAttribute('data-farbe', 'vorlage'); }
  }

  /* ---------- Shader ---------- */
  var VERT = 'attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec3 a_bary; attribute vec3 a_kante; attribute vec3 a_rund;\n' +
    'uniform mat4 u_vp; uniform mat4 u_model; uniform vec2 u_offset;\n' +
    'varying vec3 v_n; varying vec3 v_w; varying vec3 v_b; varying vec3 v_e; varying vec3 v_r; varying vec3 v_o;\n' +
    'void main() { vec4 w = u_model * vec4(a_pos, 1.0); v_w = w.xyz; v_o = a_nrm; v_n = (u_model * vec4(a_nrm, 0.0)).xyz; v_r = (u_model * vec4(a_rund, 0.0)).xyz; v_b = a_bary; v_e = a_kante;\n' +
    '  gl_Position = u_vp * w; gl_Position.xy += u_offset * gl_Position.w; }';
  function frag(ableitung) {
    return (ableitung ? '#extension GL_OES_standard_derivatives : enable\n' : '') +
      'precision highp float;\n' +
      'uniform vec3 u_eye; uniform vec3 u_farbe; uniform vec3 u_tief; uniform vec3 u_hot; uniform float u_politur; uniform float u_glut; uniform float u_alpha;\n' +
      'varying vec3 v_n; varying vec3 v_w; varying vec3 v_b; varying vec3 v_e; varying vec3 v_r; varying vec3 v_o;\n' +
      /* dunkles Studio mit einer Lichtwanne oben, einem hohen Seitenstreifen und einem Kantenlicht hinten – wie die Vorlage */
      'float studio(vec3 r, float ex) {\n' +
      '  float key = pow(max(dot(r, normalize(vec3(-0.45, 0.85, 0.35))), 0.0), ex) * 2.8;\n' +
      '  float box = smoothstep(0.6, 0.7, r.y) * smoothstep(-0.65, -0.2, r.x) * smoothstep(0.85, 0.45, r.x) * 1.1;\n' +
      '  float strip = smoothstep(0.6, 0.82, r.x) * smoothstep(-0.5, 0.35, r.y) * 1.25;\n' +
      '  float strip2 = smoothstep(0.86, 0.97, -r.x) * smoothstep(-0.2, 0.6, r.y) * 0.55;\n' +
      '  float rim = smoothstep(0.55, 0.95, -r.z) * smoothstep(-0.2, 0.5, r.y) * 0.9;\n' +
      '  float hz = exp(-abs(r.y - 0.05) * 9.0) * 0.16;\n' +
      '  float leiste = (1.0 - smoothstep(0.0, 0.035, abs(r.y - 0.3))) * 0.9 + (1.0 - smoothstep(0.0, 0.02, abs(r.y + 0.18))) * 0.55;\n' +
      '  leiste *= smoothstep(-0.9, -0.3, r.z) * 0.5 + 0.5;\n' +
      '  return key + box + strip + strip2 + rim + hz + leiste; }\n' +
      'void main() {\n' +
      '  vec3 v = normalize(u_eye - v_w); vec3 nf = normalize(v_n); if (dot(nf, v) < 0.0) nf = -nf;\n' +
      '  vec3 nr = normalize(v_r); if (dot(nr, nf) < 0.0) nr = -nr;\n' +
      '  vec3 n = normalize(mix(nf, nr, 0.1));\n' +
      '  vec3 r = reflect(-v, n);\n' +
      '  float e = studio(r, mix(6.0, 18.0, u_politur));\n' +
      '  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);\n' +
      '  float dif = max(dot(n, normalize(vec3(-0.3, 0.8, 0.6))), 0.0);\n' +
      /* Körper: dunkles Rosé wie in einem Edelstein, heller auf Flächen, die zum Betrachter zeigen */
      '  float blick = max(dot(n, v), 0.0);\n' +
      '  vec3 col = u_tief * (0.035 + 0.12 * dif + 0.1 * blick * blick);\n' +
      /* Chrom: die Spiegelung des dunklen Studios in Rosé, Glanzlichter fast weiß mit Rosé-Stich */
      '  col += u_farbe * e * 0.62;\n' +
      '  col += u_hot * pow(e, 2.8) * 0.55;\n' +
      '  col += u_farbe * fr * 0.5;\n' +
      /* scharfes Funkeln eines kleinen zweiten Lichts – springt beim Drehen von Facette zu Facette */
      '  vec3 innen = refract(-v, n, 0.66);\n' +
      '  col += mix(u_tief, u_farbe, 0.6) * studio(innen, 7.0) * 0.26 * (1.0 - fr);\n' +
      /* Brillanz: jede Facette wirft ihr eigenes Licht aus dem Inneren zurück – hell, dunkel, hell im Wechsel, beim Drehen wandernd */
      '  float h = fract(sin(dot(floor(v_o * 40.0 + 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453);\n' +
      '  float welle = 0.5 + 0.5 * cos(h * 6.2832 + dot(v, nf) * 7.0 + dot(nf, vec3(0.0, 2.5, 0.0)));\n' +
      '  col += mix(u_farbe, u_hot, 0.25) * pow(welle, 3.0) * (0.12 + 0.5 * u_politur) * (1.0 - fr) * mix(0.35, 1.0, h);\n' +
      '  col += u_hot * pow(welle, 40.0) * 1.4 * u_politur * step(0.55, h);\n' +
      '  float funkel = pow(max(dot(r, normalize(vec3(0.62, 0.55, 0.56))), 0.0), mix(24.0, 90.0, u_politur));\n' +
      '  col += u_hot * funkel * (0.6 + 1.2 * u_politur);\n' +
      /* feine helle Kantenlichter – nur echte Kanten (die Diagonale der Seitenflächen nicht) */
      '  float k = min(min(v_e.x > 0.5 ? v_b.x : 1.0, v_e.y > 0.5 ? v_b.y : 1.0), v_e.z > 0.5 ? v_b.z : 1.0);\n' +
      (ableitung ? '  float breite = fwidth(k) * 1.4;\n' : '  float breite = 0.03;\n') +
      '  float linie = 1.0 - smoothstep(0.0, breite, k);\n' +
      '  col += u_hot * linie * (0.05 + 0.6 * clamp(e * 0.8 + fr, 0.0, 1.0)) * (0.3 + 0.7 * u_politur) * 0.4;\n' +
      /* Endstadium: dezentes Leuchten im Kern */
      '  col += u_farbe * exp(-length(v_w) * 2.4) * u_glut * 1.3;\n' +
      '  col = col / (1.0 + col); col = pow(col, vec3(1.0 / 2.2));\n' +
      '  float lum = dot(col, vec3(0.299, 0.587, 0.114)); col = clamp(mix(vec3(lum), col, 1.18), 0.0, 1.0);\n' +
      '  gl_FragColor = vec4(col * u_alpha, u_alpha); }';
  }

  /* ---------- GL (mit 2D-Rückfall) ---------- */
  var gl = null, ctx2d = null, prog = null, vbo = null, loc = {}, ableitung = false, geoStand = -1, geoDaten = null;
  var progB = null, vboB = null, iboB = null, locB = {}, attrGem = [], attrB = [], blumeStand = -1, blumeAnzahl = 0, blumeTyp = 0;
  var progT = null, vboT = null, iboT = null, locT = {}, attrT = [], baumAnzahl = 0, baumTyp = 0, baumGeo = null;
  function binde(c, programm, puffer, liste, stride) {   /* Attribute je Programm: alle aus, dann die eigenen an */
    c.useProgram(programm); c.bindBuffer(c.ARRAY_BUFFER, puffer);
    for (var i = 0; i < 8; i++) c.disableVertexAttribArray(i);
    liste.forEach(function (a) { c.enableVertexAttribArray(a[0]); c.vertexAttribPointer(a[0], a[1], c.FLOAT, false, stride * 4, a[2] * 4); });
  }
  function initGL() {
    gl = leinwand.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return false;
    ableitung = !!gl.getExtension('OES_standard_derivatives');
    function compile(typ, src) { var sh = gl.createShader(typ); gl.shaderSource(sh, src); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null; }
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, frag(ableitung));
    if (!fs && ableitung) { ableitung = false; fs = compile(gl.FRAGMENT_SHADER, frag(false)); }
    if (!vs || !fs) return false;
    prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); attrGem = [];
    [['a_pos', 3, 0], ['a_nrm', 3, 3], ['a_bary', 3, 6], ['a_kante', 3, 9], ['a_rund', 3, 12]].forEach(function (a) {
      var l = gl.getAttribLocation(prog, a[0]); if (l < 0) return; attrGem.push([l, a[1], a[2]]); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, a[1], gl.FLOAT, false, STRIDE * 4, a[2] * 4);
    });
    ['u_vp', 'u_model', 'u_offset', 'u_eye', 'u_farbe', 'u_tief', 'u_hot', 'u_politur', 'u_glut', 'u_alpha'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
    if (BAUM) {   /* Lebensbaum: Netz einmal hochladen, am Handy weniger Details */
      var vs3 = compile(gl.VERTEX_SHADER, T.VERT), fs3 = compile(gl.FRAGMENT_SHADER, T.FRAG);
      if (!vs3 || !fs3) return false;
      progT = gl.createProgram(); gl.attachShader(progT, vs3); gl.attachShader(progT, fs3); gl.linkProgram(progT); gl.deleteShader(vs3); gl.deleteShader(fs3);
      if (!gl.getProgramParameter(progT, gl.LINK_STATUS)) return false;
      gl.getExtension('OES_element_index_uint');
      if (!baumGeo) baumGeo = T.bauen({ fein: Math.min(window.innerWidth || 1440, window.innerHeight || 900) < 700 ? 0.6 : 1, seed: SEED });
      vboT = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vboT); gl.bufferData(gl.ARRAY_BUFFER, baumGeo.data, gl.STATIC_DRAW);
      iboT = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboT); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, baumGeo.index, gl.STATIC_DRAW);
      baumAnzahl = baumGeo.index.length; baumTyp = baumGeo.index instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
      attrT = []; T.ATTRIBUTE.forEach(function (a) { var l = gl.getAttribLocation(progT, a[0]); if (l >= 0) attrT.push([l, a[1], a[2]]); });
      T.UNIFORMS.forEach(function (n) { locT[n] = gl.getUniformLocation(progT, n); });
      gl.useProgram(prog);
    }
    if (BLUME) {
      var vs2 = compile(gl.VERTEX_SHADER, B.VERT), fs2 = compile(gl.FRAGMENT_SHADER, VOLL ? B.FRAG_VOLL : LYCORIS ? B.FRAG_VORLAGE : B.FRAG);
      if (!vs2 || !fs2) return false;
      progB = gl.createProgram(); gl.attachShader(progB, vs2); gl.attachShader(progB, fs2); gl.linkProgram(progB); gl.deleteShader(vs2); gl.deleteShader(fs2);
      if (!gl.getProgramParameter(progB, gl.LINK_STATUS)) return false;
      gl.getExtension('OES_element_index_uint');
      vboB = gl.createBuffer(); iboB = gl.createBuffer(); attrB = [];
      [['a_pos', 3, 0], ['a_nrm', 3, 3], ['a_aux', 4, 6], ['a_base', 3, 10]].forEach(function (a) { var l = gl.getAttribLocation(progB, a[0]); if (l >= 0) attrB.push([l, a[1], a[2]]); });
      ['u_vp', 'u_model', 'u_offset', 'u_time', 'u_bloom', 'u_sway', 'u_stem', 'u_herz', 'u_eye', 'u_red', 'u_tief', 'u_hot', 'u_alpha', 'u_gruen', 'u_gruenHot'].forEach(function (n) { locB[n] = gl.getUniformLocation(progB, n); });
      gl.useProgram(prog); blumeStand = -1;
    }
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    geoStand = -1;
    return true;
  }
  var mitGL = !/[?&]webgl=aus\b/.test(location.search) && initGL();   /* ?webgl=aus = Rückfall prüfen */
  if (!mitGL) { gl = null; ctx2d = leinwand.getContext('2d'); }
  leinwand.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gl = null; });
  leinwand.addEventListener('webglcontextrestored', function () { if (!initGL()) gl = null; });

  /* ---------- Messen ---------- */
  var W = 1, H = 1, dpr = 1, zeichen = $$('[data-ch]', wort), nat = [];
  function messen() {
    var sr = buehne.getBoundingClientRect();
    W = Math.max(1, sr.width); H = Math.max(1, sr.height);
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);   /* Pixelrate gedeckelt – flüssig am Handy */
    var cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (leinwand.width !== cw || leinwand.height !== ch) { leinwand.width = cw; leinwand.height = ch; }
    var alt = zeichen.map(function (c) { return c.style.transform; });
    zeichen.forEach(function (c) { c.style.transform = 'none'; });
    nat = zeichen.map(function (c) { var r = c.getBoundingClientRect(); return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top, w: r.width }; });
    zeichen.forEach(function (c, i) { c.style.transform = alt[i]; });
  }

  /* ---------- Inhalte aus PREISE (nichts von Hand) + Studio-Zeichen + Navigation ---------- */
  var MARKE = '<path d="M20 3.5 L23.6 8.2 L23.6 31.8 L20 36.5 L16.4 31.8 L16.4 8.2 Z" transform="rotate(0 20 20)"/><path d="M20 3.5 L23.6 8.2 L23.6 31.8 L20 36.5 L16.4 31.8 L16.4 8.2 Z" transform="rotate(60 20 20)"/><path d="M20 3.5 L23.6 8.2 L23.6 31.8 L20 36.5 L16.4 31.8 L16.4 8.2 Z" transform="rotate(120 20 20)"/>';
  /* Blume: das Zeichen der Vorlage (sechs eingerollte Blütenblätter) statt des Kristalls */
  if (BAUM) MARKE = '<circle cx="20" cy="20" r="16.5"/><path d="M20 20 V9 M20 13 L14.5 9 M20 13 L25.5 9 M20 16 L12 14 M20 16 L28 14 M20 20 V31 M20 26 L14.5 30.5 M20 26 L25.5 30.5 M20 23 L12 26 M20 23 L28 26"/>';
  if (BLUME) MARKE = [0, 60, 120, 180, 240, 300].map(function (a) { return '<path d="M20 20 C 22 12, 30 8, 33 12 C 35 15, 31 17, 29 14" transform="rotate(' + a + ' 20 20)"/>'; }).join('');
  function marke(el, farbe, akzent) { el.innerHTML = '<g fill="none" stroke="' + farbe + '" stroke-width="' + (BLUME ? 2.6 : BAUM ? 1.9 : 2.2) + '" stroke-linejoin="round" stroke-linecap="round">' + MARKE + '</g><circle cx="20" cy="20" r="2.6" fill="' + akzent + '"/>'; }
  $$('[data-k-marke]').forEach(function (m) { marke(m, getComputedStyle(buehne).color || '#b6b095', AKZENT); });
  if (BAUM || DREI) {   /* Titel (Ausnahme auf ERGUNs Wunsch): oben links die Zeile „ERGUN. — Digitalstudio“, unter dem Wort „Website & Automatisierung“ */
    var bn = $('.k-bildnr', root); if (bn) bn.innerHTML = '<b>02</b> — ERGUN. — Digitalstudio';
    var ct = $('.k-cover-titel', root); if (ct) ct.innerHTML = 'ERGUN. —<br>Digitalstudio';
    var wt = $('[data-k-baum-titel]', root); if (wt) wt.hidden = false;
  }
  if (BLUME) { var bildnr = $('.k-bildnr', root); if (bildnr) bildnr.innerHTML = LYCORIS ? '<b>02</b> — Die Krone, von oben' : '<b>02</b> — Die Blüte, von oben'; }
  function inhalte() {
    var P = window.PREISE; if (!P || !P.euro) return false;
    var MON = ' / Monat', f = P.mehr[0];
    $$('[data-k-preis]', root).forEach(function (el) {
      var art = el.getAttribute('data-k-preis');
      el.textContent = art === 'ab-start' ? 'ab ' + P.euro(P.stufen[0].preis) : art === 'endo' ? P.betrag(f) + ' + ' + P.euro(f.monat) + MON : '';
    });
    /* 03 Websites: Begriffe aus den Stufen-Stichpunkten; das Wort zeigt beim Zeigen den vollen Stichpunkt */
    function punkt(stufe, muster) { var s = P.stufen.filter(function (x) { return x.id === stufe; })[0]; var p = s && s.punkte.filter(function (x) { return muster.test(x.t); })[0]; return p ? p.t : ''; }
    function zahlen(muster) { return P.stufen.map(function (s) { var p = s.punkte.filter(function (x) { return muster.test(x.t); })[0]; var m = p && p.t.match(muster); return m ? m[1] : null; }).filter(Boolean); }
    function namen(muster) { return P.stufen.filter(function (s) { return s.punkte.some(function (x) { return muster.test(x.t); }); }).map(function (s) { return s.name; }).join(' · '); }
    function volle(muster) { return P.stufen.map(function (s) { var p = s.punkte.filter(function (x) { return muster.test(x.t); })[0]; return p ? s.name + ': ' + p.t : null; }).filter(Boolean).join(' · '); }
    var links = [
      { label: 'Start', groesse: 'max(24px, min(6.2cqw, 6.4cqh))', worte: [['Handy & PC', punkt('start', /Handy/)]] },
      { label: 'Business', groesse: 'max(19px, min(4.6cqw, 4.8cqh))', worte: [['Design', punkt('business', /Design/)], ['Parallax', punkt('business', /Parallax/)]] },
      { label: 'Pro', groesse: 'max(16px, min(3cqw, 3.1cqh))', worte: [['Scroll-Story', punkt('pro', /Scroll-Story/)], ['3D-Element', punkt('pro', /3D/)]] }
    ];
    var rechts = [
      { label: 'Seiten · ' + namen(/Bis zu (\d+) Seiten/), groesse: 'max(24px, min(6.2cqw, 6.4cqh))', worte: [[zahlen(/Bis zu (\d+) Seiten/).join(' · '), volle(/Bis zu (\d+) Seiten/)]] },
      { label: 'Eigene Bilder · ' + namen(/(\d+) eigene Bilder/), groesse: 'max(19px, min(4.6cqw, 4.8cqh))', worte: [[zahlen(/(\d+) eigene Bilder/).join(' · '), volle(/(\d+) eigene Bilder/)]] },
      { label: 'Korrekturrunden · ' + namen(/(\d+) Korrekturrunde/), groesse: 'max(16px, min(3cqw, 3.1cqh))', worte: [[zahlen(/(\d+) Korrekturrunde/).join(' · '), volle(/(\d+) Korrekturrunde/)]] }
    ];
    [['l', links], ['r', rechts]].forEach(function (seite) {
      var ort = $('[data-k-spec-seite="' + seite[0] + '"]', root); if (!ort || ort.childElementCount) return;
      seite[1].forEach(function (b, i) {
        var blk = document.createElement('div'); blk.className = 'k-spec-block';
        blk.setAttribute('data-sc', '2'); blk.setAttribute('data-fx', 'clip'); blk.setAttribute('data-d', String((seite[0] === 'l' ? 0 : 0.1) + i * 0.15));
        var s = document.createElement('span'); s.className = 'k-seitlich k-seitlich--' + seite[0]; s.textContent = b.label; blk.appendChild(s);
        b.worte.forEach(function (w) {
          var z = document.createElement('div'); z.className = 'k-spec-zeile'; z.style.fontSize = b.groesse; z.style.lineHeight = '1.04';
          var g = document.createElement('span'); g.className = 'k-g'; g.textContent = w[0]; g.setAttribute('data-voll', w[1] || w[0]); z.appendChild(g); blk.appendChild(z);
        });
        ort.appendChild(blk);
      });
    });
    var lp = $('[data-k-lupe-preise]', root); if (lp) lp.textContent = P.stufen.map(function (s) { return P.betrag(s); }).join(' · ');
    var ex = $('[data-k-extras]', root);
    if (ex && !ex.childElementCount) {
      P.extras.forEach(function (g) { g.eintraege.forEach(function (x) { var s = document.createElement('span'); s.className = 'k-g'; s.textContent = x.name; s.setAttribute('data-voll', x.name + ' – ' + x.satz + ' ' + P.betrag(x)); ex.appendChild(s); }); });
      var alle = P.alleExtras(), kurz = document.createElement('span'); kurz.className = 'k-spec-extras-kurz';
      kurz.textContent = alle.length + ' Extras ab ' + P.euro(Math.min.apply(null, alle.map(function (x) { return x.preis; }))) + ' · im Formular wählbar';
      ex.appendChild(kurz);
    }
    /* 04 Preise: drei Stufen mit Preis und „für wen“, dazu endo */
    var fa = $('[data-k-faecher]', root);
    if (fa && !DREI && !$('.k-stufe', fa)) P.stufen.forEach(function (s, i) {
      var d = document.createElement('div'); d.className = 'k-stufe'; d.setAttribute('data-sc', '3'); d.setAttribute('data-fx', 'clip'); d.setAttribute('data-d', String(i * 0.15));
      d.appendChild(document.createTextNode(s.name));
      var p = document.createElement('span'); p.className = 'k-stufe__preis k-sans'; p.textContent = P.betrag(s);
      var fuer = document.createElement('i'); fuer.textContent = s.fuer; p.appendChild(fuer); d.appendChild(p);
      fa.appendChild(d);
    });
    return true;
  }
  var nav = $('[data-k-nav]', root);
  NAV.forEach(function (n, i) {
    var b = document.createElement('button'); b.type = 'button';
    b.innerHTML = '<span class="k-lab">' + String(i + 1).padStart(2, '0') + ' ' + n + '</span><span class="k-strich"></span>';
    b.addEventListener('click', function () { springe(i); }); nav.appendChild(b);
  });
  var navKnoepfe = $$('button', nav);
  /* Lebensbaum: feste Leiste oben (Stil der Vorlage) – ERGUN. · Leistungen · Preise · Kontakt · endo ↗; springt weich zum Bild (jump() der Vorlage) */
  var kopfLinks = [];
  if (BAUM || DREI) {
    var kopf = document.createElement('header'); kopf.className = 'k-kopf'; kopf.setAttribute('data-k-kopf', '');
    kopf.innerHTML = '<a class="k-kopf__marke" href="#top" data-sprung="0">ERGUN<span>.</span></a>' +
      '<button class="k-kopf__menue" type="button" aria-expanded="false" aria-controls="k-kopf-links">Menü</button>' +
      '<nav class="k-kopf__links" id="k-kopf-links" aria-label="Hauptnavigation">' +
      (DREI ? '<a href="#top" data-sprung="0">Start</a><a href="#preise" data-sprung="1">Angebote</a><a href="#kontakt" data-sprung="2">Kontakt</a>'
            : '<a href="#leistungen" data-sprung="2">Leistungen</a><a href="#preise" data-sprung="3">Preise</a><a href="#kontakt" data-sprung="5">Kontakt</a>') +
      '<a href="https://endo-ergun.vercel.app/" data-endo-link>endo <span aria-hidden="true">↗</span></a></nav>';
    root.parentNode.insertBefore(kopf, root);
    var menueKnopf = kopf.querySelector('.k-kopf__menue');
    function menue(auf) { kopf.classList.toggle('ist-offen', auf); menueKnopf.setAttribute('aria-expanded', auf ? 'true' : 'false'); }
    menueKnopf.addEventListener('click', function () { menue(!kopf.classList.contains('ist-offen')); });
    kopfLinks = [].slice.call(kopf.querySelectorAll('[data-sprung]'));
    kopfLinks.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); menue(false); springe(Number(a.getAttribute('data-sprung'))); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menue(false); });
  }

  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function springe(i) {
    var r = root.getBoundingClientRect(), weg = strecke.offsetHeight, ziel = (i / (SCENES - 1)) * weg + r.top;
    window.scrollBy({ top: ziel, behavior: ruhig ? 'auto' : 'smooth' });
  }
  /* Anker zur Anfrage (#preise, #kontakt) führen ans Ende der Bühne – dort liegt das Formular */

  /* ---------- Lycoris 3, Bild 02: die drei Angebote aus den echten Formular-Karten (Texte + Preise aus PREISE über preise.js),
     gesetzt wie der Fächer der Vorlage; Klick wählt die Karte im Formular und springt zu Bild 03 ---------- */
  var angeboteFertig = false;
  function angeboteBauen() {
    if (!DREI || angeboteFertig) return true;
    var fa = $('[data-k-faecher]', root), karten = $$('#preise .mf-karte');
    if (!fa || karten.length < 3) return false;
    fa.classList.add('k-angebote');
    karten.slice(0, 3).forEach(function (k, i) {
      var titel = $('.mf-karte__titel', k), satz = $('.mf-karte__satz', k), preis = $('.mf-karte__preis', k), dezent = $('.mf-karte__dezent', k);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'k-angebot';
      b.setAttribute('data-sc', '1'); b.setAttribute('data-fx', 'clip'); b.setAttribute('data-d', String(i * 0.15)); b.setAttribute('data-k-drei', ''); b.setAttribute('data-angebot', String(i));
      var w = document.createElement('span'); w.className = 'k-angebot__wort'; w.textContent = titel ? titel.textContent : ''; b.appendChild(w);
      var info = document.createElement('span'); info.className = 'k-angebot__info k-sans';
      var bp = document.createElement('b'); bp.textContent = preis ? preis.textContent.replace(/\s+/g, ' ').trim() : ''; info.appendChild(bp);
      info.appendChild(document.createTextNode(' · ' + (dezent ? dezent.textContent + ' – ' : '') + (satz ? satz.textContent : ''))); b.appendChild(info);
      b.addEventListener('click', function () { var kk = $$('#preise .mf-karte')[i]; if (kk) kk.click(); springe(SCENES - 1); });
      fa.appendChild(b);
    });
    angeboteFertig = true; sammeln(); return true;
  }

  /* ---------- Lupe (03): zeigt das Wort groß + den vollen Stichpunkt ---------- */
  var lupe = $('[data-k-lupe]', root), lupeWort = $('[data-k-lupe-wort]', root), lupeSatz = $('[data-k-lupe-satz]', root);
  buehne.addEventListener('pointerover', function (e) {
    var g = e.target.closest && e.target.closest('.k-g[data-voll]'); if (!g) return;
    lupe.classList.add('ist-an'); lupeWort.textContent = g.textContent; lupeSatz.textContent = g.getAttribute('data-voll');
  });
  buehne.addEventListener('pointerout', function (e) {
    if (e.target.closest && e.target.closest('.k-g') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.k-g'))) {
      lupe.classList.remove('ist-an'); lupeWort.textContent = '& mehr'; lupeSatz.textContent = 'Zeigen Sie auf ein Wort';
    }
  });

  /* ---------- Eingaben: Pointer-Tilt + Ziehen zum Drehen (nur Maus, wie die Vorlage) ---------- */
  var zeiger = { x: 0, y: 0, tx: 0, ty: 0 }, dreh = 0, drehV = 0, ziehen = null;
  buehne.addEventListener('pointermove', function (e) {
    var r = buehne.getBoundingClientRect(); zeiger.tx = ((e.clientX - r.left) / r.width) * 2 - 1; zeiger.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (ziehen && ziehen.id === e.pointerId) { drehV += (e.clientX - ziehen.x) * 0.0022; ziehen.x = e.clientX; }
  });
  buehne.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest && e.target.closest('a,button,input,textarea,select,label,.k-g')) return;
    ziehen = { id: e.pointerId, x: e.clientX }; buehne.style.cursor = 'grabbing';
  });
  window.addEventListener('pointerup', function () { ziehen = null; buehne.style.cursor = ''; });

  /* ---------- Schrift-Elemente je Bild ---------- */
  var stuecke = [];
  function sammeln() { stuecke = $$('[data-sc]', buehne).map(function (el) { var sc = Number(el.getAttribute('data-sc')); if (DREI && !el.hasAttribute('data-k-drei') && sc !== 0) { sc = 99; el.style.visibility = 'hidden'; } return { el: el, scene: sc, fx: el.getAttribute('data-fx'), delay: Number(el.getAttribute('data-d')) || 0, last: -1 }; }); }

  /* ---------- 2D-Rückfall: der Kristall als sauberes Bild (projiziert, von hinten nach vorn gemalt) – im Stand des Bildes, damit er
     im Cover nicht ausgewachsen über dem Wort liegt; „Bewegung reduzieren“ = je Bild ein Standbild ---------- */
  var ENDE = null, endeStand = -1;
  function zeichne2d(vp, model, k, coord, eye) {
    var c = ctx2d; if (!c) return; var st = Math.round(coord * 20) / 20; if (st !== endeStand) { endeStand = st; ENDE = geometrie(st); }
    var mvp = multiply(vp, model), tris = [], licht = norm([-0.3, 0.8, 0.6]);
    for (var i = 0; i < ENDE.length; i += STRIDE * 3) {
      var pts = [], z = 0;
      for (var j = 0; j < 3; j++) {
        var o = i + j * STRIDE, x = ENDE[o], y = ENDE[o + 1], zz = ENDE[o + 2];
        var cx = mvp[0] * x + mvp[4] * y + mvp[8] * zz + mvp[12], cy = mvp[1] * x + mvp[5] * y + mvp[9] * zz + mvp[13], cw = mvp[3] * x + mvp[7] * y + mvp[11] * zz + mvp[15];
        pts.push([((cx / cw + k.ox) * 0.5 + 0.5) * W, (0.5 - (cy / cw + k.oy) * 0.5) * H]); z += cw;
      }
      var n = [ENDE[i + 3], ENDE[i + 4], ENDE[i + 5]], nr = [model[0] * n[0] + model[4] * n[1] + model[8] * n[2], model[1] * n[0] + model[5] * n[1] + model[9] * n[2], model[2] * n[0] + model[6] * n[1] + model[10] * n[2]];
      /* Rückseiten weglassen (sonst schimmern Facetten von hinten durch) */
      var px0 = ENDE[i], py0 = ENDE[i + 1], pz0 = ENDE[i + 2], wx = model[0] * px0 + model[4] * py0 + model[8] * pz0, wy = model[1] * px0 + model[5] * py0 + model[9] * pz0, wz = model[2] * px0 + model[6] * py0 + model[10] * pz0;
      if (dot(nr, [eye[0] - wx, eye[1] - wy, eye[2] - wz]) <= 0) continue;
      tris.push({ p: pts, z: z, hell: 0.25 + 0.75 * Math.max(0, dot(nr, licht)), kanten: [ENDE[i + 9], ENDE[i + 10], ENDE[i + 11]] });
    }
    tris.sort(function (a, b) { return b.z - a.z; });
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); c.lineJoin = 'round';
    var t = ORANGE ? [201, 204, 211] : [214, 150, 180], s = ORANGE ? [40, 42, 48] : [74, 30, 52], w = ORANGE ? [246, 247, 250] : [250, 228, 238];
    tris.forEach(function (d) {
      var h = d.hell, col = 'rgb(' + [0, 1, 2].map(function (q) { return Math.round(h < 0.7 ? s[q] + (t[q] - s[q]) * (h / 0.7) : t[q] + (w[q] - t[q]) * ((h - 0.7) / 0.3)); }).join(',') + ')';
      c.beginPath(); c.moveTo(d.p[0][0], d.p[0][1]); c.lineTo(d.p[1][0], d.p[1][1]); c.lineTo(d.p[2][0], d.p[2][1]); c.closePath();
      c.fillStyle = col; c.fill(); c.strokeStyle = col; c.lineWidth = 0.6; c.stroke();
      c.strokeStyle = 'rgba(255, 238, 246, ' + (0.25 + 0.5 * h).toFixed(2) + ')'; c.lineWidth = 0.9; c.beginPath();
      [[1, 2, 0], [2, 0, 1], [0, 1, 2]].forEach(function (e) { if (d.kanten[e[2]] > 0.5) { c.moveTo(d.p[e[0]][0], d.p[e[0]][1]); c.lineTo(d.p[e[1]][0], d.p[e[1]][1]); } });
      c.stroke();
    });
  }

  /* ---------- 2D-Rückfall der Blume: die Blüte im Stand des Bildes, Dreiecke von hinten nach vorn gemalt ---------- */
  var B2 = null, b2Stand = -1;
  function zeichne2dBlume(vp, model, k, coord, eye) {
    var c = ctx2d; if (!c) return; var o = ruhig ? 1 : Math.round(offenBei(coord) * 20) / 20;
    if (o !== b2Stand) { b2Stand = o; B2 = B.bauen(ART, o, SEED, BFEIN); }
    var d = B2.data, ix = B2.index, S = B.STRIDE, hz = B.HERZ[ART], mvp = multiply(vp, model), licht = norm([-0.3, 0.8, 0.6]), proj = [], tris = [];
    for (var i = 0; i < d.length; i += S) {
      var x = d[i] - hz[0], y = (d[i + 8] > 1.5 && d[i + 1] < 0 ? d[i + 1] * k.stem : d[i + 1]) - hz[1], z = d[i + 2] - hz[2];
      var cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12], cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13], cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
      var n = [d[i + 3], d[i + 4], d[i + 5]], nr = [model[0] * n[0] + model[4] * n[1] + model[8] * n[2], model[1] * n[0] + model[5] * n[1] + model[9] * n[2], model[2] * n[0] + model[6] * n[1] + model[10] * n[2]];
      proj.push([((cx / cw + k.ox) * 0.5 + 0.5) * W, (0.5 - (cy / cw + k.oy) * 0.5) * H, cw, nr]);
    }
    var blick = norm(eye);
    for (i = 0; i < ix.length; i += 3) {
      var a = proj[ix[i]], b = proj[ix[i + 1]], e = proj[ix[i + 2]], nn = norm(add(add(a[3], b[3]), e[3]));
      if (dot(nn, blick) < 0) nn = mul(nn, -1);
      tris.push({ gruen: VOLL && d[ix[i] * S + 8] > 1.5, p: [a, b, e], z: a[2] + b[2] + e[2], hell: 0.18 + 0.62 * Math.max(0, dot(nn, licht)) + 0.3 * Math.pow(1 - Math.max(0, dot(nn, blick)), 2) });
    }
    tris.sort(function (p, q) { return q.z - p.z; });
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var akz = parseInt(AKZENT.slice(1), 16), t = VOLL ? [(akz >> 16) & 255, (akz >> 8) & 255, akz & 255] : LYCORIS ? [227, 19, 27] : [214, 150, 180], s = LYCORIS ? [70, 4, 8] : [74, 30, 52], w = LYCORIS ? [255, 150, 140] : [250, 228, 238];
    tris.forEach(function (q) {
      var h = Math.min(1, q.hell), ts = q.gruen ? [79, 122, 74] : t, ss = q.gruen ? [18, 34, 18] : s, ws = q.gruen ? [200, 235, 205] : w;
      var col = 'rgb(' + [0, 1, 2].map(function (j) { return Math.round(h < 0.7 ? ss[j] + (ts[j] - ss[j]) * (h / 0.7) : ts[j] + (ws[j] - ts[j]) * ((h - 0.7) / 0.3)); }).join(',') + ')';
      c.beginPath(); c.moveTo(q.p[0][0], q.p[0][1]); c.lineTo(q.p[1][0], q.p[1][1]); c.lineTo(q.p[2][0], q.p[2][1]); c.closePath();
      c.fillStyle = col; c.fill(); c.strokeStyle = col; c.lineWidth = 0.5; c.stroke();
    });
  }

  /* ---------- 2D-Rückfall Lebensbaum: das fertige Emblem als Linienbild (wie der Rückfall der Vorlage: Kurven projiziert und gezogen) ---------- */
  var BAUM2D = null;
  function zeichne2dBaum(vp, model, k) {
    var c = ctx2d; if (!c) return; if (!BAUM2D) BAUM2D = T.bauen({ fein: 0.6, seed: SEED }).linien;
    var mvp = multiply(vp, model), minDim = Math.min(W, H), skal = (k.size * minDim * 0.5) / RADIUS;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = AKZENT; c.shadowColor = AKZENT; c.shadowBlur = 10;
    BAUM2D.forEach(function (l) {
      c.beginPath();
      l.pts.forEach(function (q, i) {
        var cx = mvp[0] * q[0] + mvp[4] * q[1] + mvp[8] * q[2] + mvp[12], cy = mvp[1] * q[0] + mvp[5] * q[1] + mvp[9] * q[2] + mvp[13], cw = mvp[3] * q[0] + mvp[7] * q[1] + mvp[11] * q[2] + mvp[15];
        var sx = ((cx / cw + k.ox) * 0.5 + 0.5) * W, sy = (0.5 - (cy / cw + k.oy) * 0.5) * H; if (i) c.lineTo(sx, sy); else c.moveTo(sx, sy);
      });
      c.lineWidth = Math.max(0.8, l.w * skal * 1.6); c.stroke();
    });
  }
  /* Lebensbaum: das Formular gleitet beim Übergang 05 → 06 gestaffelt herein (wie die Schrift der Vorlage) */
  var formTeile = [], formStand = -1, formZeit = 0;
  function formularHerein(coord, jetzt) {
    if (!(BAUM || DREI) || ruhig) return;
    if (jetzt - formZeit > 600) { formZeit = jetzt; formTeile = $$('#preise .preise__innen > *'); formStand = -1; }
    var q = Math.round(coord * 200) / 200; if (q === formStand) return; formStand = q;
    formTeile.forEach(function (el, i) {
      var v = coord >= SCENES - 1 ? 1 : reveal(coord, SCENES - 1, Math.min(0.6, i * 0.12));
      el.style.opacity = v >= 0.999 ? '' : String(v); el.style.transform = v >= 0.999 ? '' : 'translateY(' + ((1 - v) * 26).toFixed(1) + 'px)';
    });
  }

  /* ---------- Schleife ---------- */
  var laeuft = false, sichtbar = true, zuletzt = performance.now(), zeit = 0, p01 = -1, gezeigt = -1, koord = 0, raf = 0, geboren = -1, zuletztVersuch = 0;
  function bild(jetzt) {
    raf = requestAnimationFrame(bild);
    var dt = Math.min(0.05, (jetzt - zuletzt) / 1000); zuletzt = jetzt;
    var bewegt = !ruhig; if (bewegt) zeit += dt;
    var r = root.getBoundingClientRect(), weg = strecke.offsetHeight, p = weg > 0 ? klemm(-r.top / weg) : 0;
    p01 = p01 < 0 || ruhig ? p : p01 + (p - p01) * (1 - Math.exp(-dt * 9));
    var coord = koord = FEST_K !== null ? FEST_K : sceneCoord(p01, SCENES, HOLD), szene = Math.round(coord);   /* ?k= hält ein Bild fest (Prüfen) */
    if (szene !== gezeigt) { gezeigt = szene; navKnoepfe.forEach(function (b, i) { if (i === szene) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      kopfLinks.forEach(function (a) { var z = Number(a.getAttribute('data-sprung')); if (z === szene && (z > 0 || (DREI && !a.classList.contains('k-kopf__marke')))) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }

    /* Kamera */
    var tall = H > W * 1.05, k = keyAt(coord, tall);
    zeiger.x += (zeiger.tx - zeiger.x) * (1 - Math.exp(-dt * 4)); zeiger.y += (zeiger.ty - zeiger.y) * (1 - Math.exp(-dt * 4));
    if (bewegt) { dreh += drehV + (BAUM ? 0 : dt * 0.1); drehV *= Math.exp(-dt * 3); } else { dreh += drehV; drehV = 0; }
    if (BAUM) dreh *= Math.exp(-dt * 0.8);   /* nach dem Ziehen wieder ruhig nach vorn */
    var px = bewegt ? zeiger.x : 0, py = bewegt ? zeiger.y : 0, fov = (30 * Math.PI) / 180, minDim = Math.min(W, H);
    var dist = (RADIUS * H) / (k.size * minDim * Math.tan(fov / 2)), el = Math.max(-88, Math.min(88, k.el + py * 9)) * (Math.PI / 180);
    var eye = [0, Math.sin(el) * dist, Math.cos(el) * dist];
    var vp = multiply(perspective(fov, W / H, Math.max(0.05, dist - 6), dist + 8), lookAt(eye, [0, 0, 0]));
    var model = BAUM ? multiply(rotY(k.spin + dreh + px * 0.28 + (bewegt ? Math.sin(zeit * 0.35) * 0.08 : 0)), rotX(py * 0.06)) : multiply(rotY(k.spin + dreh + px * 0.35), rotX(py * 0.05));

    /* Lichthof hinter dem Kristall folgt seinem Herz */
    var gx = (0.5 + k.ox / 2) * W, gy = (0.5 - k.oy / 2) * H, gr = k.size * minDim * 1.25;
    schein.style.transform = 'translate(' + (gx - gr).toFixed(1) + 'px,' + (gy - gr).toFixed(1) + 'px)';
    schein.style.width = schein.style.height = (gr * 2).toFixed(1) + 'px';
    schein.style.opacity = BLUME || BAUM ? '1' : String(0.55 + 0.45 * smooth(4.2, 5, coord));
    if (MUSTER && muster) { muster.style.opacity = String(0.55 * (1 - 0.65 * smooth(4.3, 5, coord)));   /* hinter dem Formular leiser */
      if (!ruhig) muster.style.transform = 'translate3d(0,' + (-coord * 18).toFixed(1) + 'px,0)'; }   /* Muster wandert langsam mit – Tiefe hinter dem Stein */

    if (BAUM && gl && progT) {
      var g1 = gl, grow = ruhig ? 5 : coord;
      g1.viewport(0, 0, leinwand.width, leinwand.height); g1.clear(g1.COLOR_BUFFER_BIT | g1.DEPTH_BUFFER_BIT);
      binde(g1, progT, vboT, attrT, T.STRIDE); g1.bindBuffer(g1.ELEMENT_ARRAY_BUFFER, iboT);
      g1.uniformMatrix4fv(locT.u_vp, false, vp); g1.uniformMatrix4fv(locT.u_model, false, model); g1.uniform2f(locT.u_offset, k.ox, k.oy);
      g1.uniform1f(locT.u_time, zeit); g1.uniform1f(locT.u_sway, bewegt ? 1 : 0); g1.uniform1f(locT.u_grow, grow);
      g1.uniform1f(locT.u_ring, ruhig ? 1 : klemm(coord / 5)); g1.uniform1f(locT.u_seed, 1 - 0.6 * smooth(0.3, 1.3, grow)); g1.uniform1f(locT.u_glow, smooth(4.45, 5, grow));
      g1.uniform3f(locT.u_eye, eye[0], eye[1], eye[2]); g1.uniform3f(locT.u_red, FARBE[0], FARBE[1], FARBE[2]); g1.uniform3f(locT.u_tief, TIEF[0], TIEF[1], TIEF[2]); g1.uniform3f(locT.u_hot, HEISS[0], HEISS[1], HEISS[2]); g1.uniform1f(locT.u_alpha, 1);
      g1.drawElements(g1.TRIANGLES, baumAnzahl, baumTyp, 0);
    } else if (BAUM && ctx2d) zeichne2dBaum(vp, model, k);
    else if (BLUME && gl && progB) {
      var g0 = gl; g0.viewport(0, 0, leinwand.width, leinwand.height); g0.clear(g0.COLOR_BUFFER_BIT | g0.DEPTH_BUFFER_BIT);
      /* 1) der Diamant (Bild 01) – öffnet sich beim ersten Scrollen */
      var zerfallT = ruhig || LYCORIS ? 1 : smooth(0.04, 0.8, coord);
      if (zerfallT < 1) {
        var st0 = Math.round(zerfallT * 300) / 300;
        if (st0 !== geoStand) { geoStand = st0; geoDaten = zerfall(DIAMANT_DATEN, st0); g0.bindBuffer(g0.ARRAY_BUFFER, vbo); g0.bufferData(g0.ARRAY_BUFFER, geoDaten, g0.DYNAMIC_DRAW); }
        if (geoDaten.length) {
          binde(g0, prog, vbo, attrGem, STRIDE);
          g0.uniformMatrix4fv(loc.u_vp, false, vp); g0.uniformMatrix4fv(loc.u_model, false, model); g0.uniform2f(loc.u_offset, k.ox, k.oy); g0.uniform3f(loc.u_eye, eye[0], eye[1], eye[2]);
          g0.uniform3f(loc.u_farbe, FARBE[0], FARBE[1], FARBE[2]); g0.uniform3f(loc.u_tief, TIEF[0], TIEF[1], TIEF[2]); g0.uniform3f(loc.u_hot, HEISS[0], HEISS[1], HEISS[2]);
          g0.uniform1f(loc.u_politur, 1); g0.uniform1f(loc.u_glut, 0); g0.uniform1f(loc.u_alpha, 1);
          g0.drawArrays(g0.TRIANGLES, 0, geoDaten.length / STRIDE);
        }
      }
      /* 2) die Blüte: wächst aus der Mitte (Knospe), öffnet sich Bild für Bild */
      if (geboren < 0) geboren = jetzt;
      var wachsen = ruhig ? 1 : LYCORIS ? klemm((jetzt - geboren) / 2600) : smooth(0.14, 0.85, coord);   /* Lycoris: blüht beim Laden auf (2,6 s) wie die Vorlage */
      if (wachsen > 0.002) {
        var stufe = ART === 'lilie' ? 40 : 160, ost = ruhig || LYCORIS ? 1 : FEST_O !== null ? FEST_O : Math.round(offenBei(coord) * stufe) / stufe;
        if (ost !== blumeStand) {
          blumeStand = ost; var bg = B.bauen(ART, ost, SEED, BFEIN);
          g0.bindBuffer(g0.ARRAY_BUFFER, vboB); g0.bufferData(g0.ARRAY_BUFFER, bg.data, g0.DYNAMIC_DRAW);
          g0.bindBuffer(g0.ELEMENT_ARRAY_BUFFER, iboB); g0.bufferData(g0.ELEMENT_ARRAY_BUFFER, bg.index, g0.DYNAMIC_DRAW);
          blumeAnzahl = bg.index.length; blumeTyp = bg.index instanceof Uint32Array ? g0.UNSIGNED_INT : g0.UNSIGNED_SHORT;
        }
        binde(g0, progB, vboB, attrB, B.STRIDE); g0.bindBuffer(g0.ELEMENT_ARRAY_BUFFER, iboB);
        var hz = B.HERZ[ART];
        g0.uniformMatrix4fv(locB.u_vp, false, vp); g0.uniformMatrix4fv(locB.u_model, false, model); g0.uniform2f(locB.u_offset, k.ox, k.oy);
        g0.uniform1f(locB.u_time, zeit); g0.uniform1f(locB.u_bloom, wachsen); g0.uniform1f(locB.u_sway, bewegt ? 1 : 0); g0.uniform1f(locB.u_stem, LYCORIS ? k.stem : k.stem * smooth(0.3, 1, wachsen));   /* der Stiel wächst mit der Knospe */
        g0.uniform3f(locB.u_herz, hz[0], hz[1], hz[2]); g0.uniform3f(locB.u_eye, eye[0], eye[1], eye[2]);
        g0.uniform3f(locB.u_red, FARBE[0], FARBE[1], FARBE[2]); g0.uniform3f(locB.u_tief, TIEF[0], TIEF[1], TIEF[2]); g0.uniform3f(locB.u_hot, HEISS[0], HEISS[1], HEISS[2]); g0.uniform1f(locB.u_alpha, 1);
        if (locB.u_gruen) { g0.uniform3f(locB.u_gruen, GRUEN[0], GRUEN[1], GRUEN[2]); g0.uniform3f(locB.u_gruenHot, 0.82, 1, 0.86); }
        g0.drawElements(g0.TRIANGLES, blumeAnzahl, blumeTyp, 0);
      }
    } else if (BLUME && ctx2d) zeichne2dBlume(vp, model, k, coord, eye);
    else if (gl && prog) {
      var c = gl, stand = Math.round(coord * 400) / 400;
      if (stand !== geoStand) { geoStand = stand; geoDaten = geometrie(stand); c.bindBuffer(c.ARRAY_BUFFER, vbo); c.bufferData(c.ARRAY_BUFFER, geoDaten, c.DYNAMIC_DRAW); }
      c.viewport(0, 0, leinwand.width, leinwand.height); c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT);
      c.uniformMatrix4fv(loc.u_vp, false, vp); c.uniformMatrix4fv(loc.u_model, false, model); c.uniform2f(loc.u_offset, k.ox, k.oy);
      c.uniform3f(loc.u_eye, eye[0], eye[1], eye[2]);
      c.uniform3f(loc.u_farbe, FARBE[0], FARBE[1], FARBE[2]); c.uniform3f(loc.u_tief, TIEF[0], TIEF[1], TIEF[2]); c.uniform3f(loc.u_hot, HEISS[0], HEISS[1], HEISS[2]);
      c.uniform1f(loc.u_politur, smooth(0.4, 4.3, coord)); c.uniform1f(loc.u_glut, smooth(4.3, 5, coord) * (0.8 + 0.2 * Math.sin(zeit * 1.1))); c.uniform1f(loc.u_alpha, 1);
      c.drawArrays(c.TRIANGLES, 0, geoDaten.length / STRIDE);
    } else if (ctx2d) zeichne2d(vp, model, k, coord, eye);

    formularHerein(coord, jetzt);
    if (DREI && !angeboteFertig && Math.floor(jetzt / 400) !== Math.floor(zuletztVersuch / 400)) { zuletztVersuch = jetzt; angeboteBauen(); }
    /* Schrift je Bild – wie die Vorlage */
    stuecke.forEach(function (it) {
      var v = reveal(coord, it.scene, it.delay), q = Math.round(v * 500) / 500; if (q === it.last) return; it.last = q;
      var s = it.el.style, dir = coord < it.scene ? 1 : -1;
      s.visibility = q <= 0 ? 'hidden' : '';
      if (it.fx === 'line') { s.transform = 'scaleX(' + q + ')'; s.opacity = String(Math.min(1, q * 2)); return; }
      s.opacity = String(q);
      if (ruhig || it.fx === 'fade') return;
      if (it.fx === 'clip') { var hid = ((1 - q) * 100).toFixed(1); s.clipPath = q > 0.998 ? '' : dir > 0 ? 'inset(-0.3em -100vw ' + hid + '% -100vw)' : 'inset(' + hid + '% -100vw -0.3em -100vw)'; s.transform = 'translateY(' + ((1 - q) * 0.4 * dir).toFixed(3) + 'em)'; }
      else { s.transform = 'translateY(' + ((1 - q) * 34 * dir).toFixed(1) + 'px)'; s.filter = q > 0.995 ? '' : 'blur(' + ((1 - q) * 8).toFixed(1) + 'px)'; }
    });

    /* Das Cover-Wort teilt sich zur Krone: „ERG“ und „UN.“ flankieren den Kristall (?krone=rand: nur E und . wie die Vorlage) */
    var m = easeInOut(klemm(coord)), aus = klemm(coord - 1), k1 = keyAt(1, tall), r1 = k1.size * minDim * 0.5, cy1 = (0.5 - k1.oy / 2) * H;
    var gruppen = DREI ? {} : KRONE_RAND ? { 0: -1, 5: 1 } : { 0: -1, 1: -1, 2: -1, 3: 1, 4: 1, 5: 1 };
    var breite = { '-1': 0, '1': 0 }, rand = { '-1': [1e9, -1e9], '1': [1e9, -1e9] };
    zeichen.forEach(function (c, i) { var g = gruppen[i], n0 = nat[i]; if (!g || !n0) return; rand[g][0] = Math.min(rand[g][0], n0.x - n0.w / 2); rand[g][1] = Math.max(rand[g][1], n0.x + n0.w / 2); });
    ['-1', '1'].forEach(function (g) { breite[g] = Math.max(1, rand[g][1] - rand[g][0]); });
    var platz = W / 2 - r1 - minDim * 0.02 - W * 0.05, sk = Math.min(1, platz / Math.max(breite['-1'], breite['1']));
    zeichen.forEach(function (c, i) {
      var n0 = nat[i]; if (!n0) return; var g = gruppen[i];
      if (g) {
        var mitteG = (rand[g][0] + rand[g][1]) / 2, zielMitte = W / 2 + g * (r1 + minDim * 0.02 + (breite[g] * sk) / 2);
        var tx = zielMitte + (n0.x - mitteG) * mix(1, sk, m), dx = (tx - n0.x) * m, dy = (cy1 - n0.y) * m - aus * 60;
        c.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + mix(1, sk, m).toFixed(3) + ')';
        c.style.opacity = String(coord < 1 ? 1 : 1 - smooth(0.1, 0.45, aus));
        c.style.filter = ruhig || aus < 0.05 ? '' : 'blur(' + (aus * 14).toFixed(1) + 'px)';
      } else {
        var dx2 = (W / 2 - n0.x) * m * 0.75, dy2 = (cy1 - n0.y) * m;
        c.style.transform = ruhig ? '' : 'translate(' + dx2.toFixed(1) + 'px,' + dy2.toFixed(1) + 'px) scale(' + (1 - m * 0.7).toFixed(3) + ')';
        c.style.opacity = String(1 - smooth(0, 0.4, m));
        c.style.filter = ruhig || m < 0.02 ? '' : 'blur(' + (m * 12).toFixed(1) + 'px)';
      }
      c.style.visibility = coord > 1.6 ? 'hidden' : '';
    });
  }
  function start() { if (laeuft || !sichtbar || document.hidden) return; laeuft = true; zuletzt = performance.now(); raf = requestAnimationFrame(bild); }
  function stop() { laeuft = false; cancelAnimationFrame(raf); }

  function los() {
    inhalte(); angeboteBauen(); sammeln(); messen();
    new ResizeObserver(messen).observe(buehne);
    if (document.fonts) { document.fonts.ready.then(messen); if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', messen); }
    new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) start(); else stop(); }).observe(root);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
  }
  if (window.PREISE || document.readyState !== 'loading') los(); else document.addEventListener('DOMContentLoaded', los);
  window.__kristall = {
    zustand: function () { return { koord: koord, gl: !!gl, ableitung: ableitung, radius: RADIUS, seed: SEED, dreiecke: geoDaten ? geoDaten.length / STRIDE / 3 : 0, blume: ART, voll: VOLL, farbe: VOLL ? html.getAttribute('data-bluetenfarbe') : null, lycoris: LYCORIS, drei: DREI, bilder: SCENES, baum: BAUM, baumDreiecke: baumAnzahl / 3, ring: BAUM ? (ruhig ? 1 : klemm(koord / 5)) : null, offen: BLUME ? (ruhig || LYCORIS ? 1 : offenBei(koord)) : null, blumeDreiecke: blumeAnzahl / 3 }; },
    geometrie: geometrie, springe: springe
  };
})();
