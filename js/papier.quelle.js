/* ERGUN. Papier-Start (ERGUN., 03.10.2026 – Ausnahme auf ERGUNs Wunsch; Vorschau ?start=papier, PAPIER_STANDARD = false in index.html; Rückweg Tag vor-papier).
   Die Seite beginnt als Blatt mit „ERGUN.“ – Scrollen lässt es von der Mitte aus reißen (Vorlage), im Spalt erscheint der ECHTE Glas-Hintergrund
   der Seite (der Spalt ist durchsichtig), kurzes Verweilen, dann reißt das Blatt ganz auf und verlässt den Bildschirm (eigener Schritt, ~1,4 s).
   Danach: Ebene + alle Zuhörer weg, die Seite ist genau wie ohne Blatt. Nur einmal je Seitenaufruf, nichts wird im Browser gespeichert.
   Blatt (Papier, Schrift, Hinweis) steht fertig im HTML/CSS von index.html – dieses Skript macht nur die Bewegung.
   Nachgebaut statt aus der Vorlage: die React-Teile (Zustand, Effekte, JSX) als DOM-Aufbau; Tailwind-Klassen als CSS (.papier… in index.html). */
var TEASER = 0.62;          /* open = 1: die Hälften sind so weit auseinander wie in der Vorlage */
var VERWEILEN = 700;        /* ms: das Auge soll den Hintergrund im Spalt erkennen */
var DAUER = 1400;           /* ms: komplettes Aufreißen */
var ZUSATZ = { top: { dx: -40, rot: -9 }, bottom: { dx: 40, rot: 8 } };   /* beim Aufreißen: oben fliegt nach oben, unten nach unten, beide kippen */
var weich = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

/* Weg aus der Fensterhöhe – genau gerechnet: der kleinste Weg, bei dem jede Hälfte (Risskante, Papierkern, aufgerollte Kanten, Schatten) ganz
   außerhalb des Fensters liegt, plus 8 % Rand. So bewegt sich das Papier über die ganze Dauer sichtbar und ist am Ende sicher weg (quer und hochkant). */
var KANTE = null;
function kantenPunkte(side) {
  if (!KANTE) {
    KANTE = {};
    var line = tearLine();
    ["top", "bottom"].forEach(function (sd) {
      var g = halfGeometry("p", sd, line, 1);
      KANTE[sd] = line.concat(g.core).concat([].concat.apply([], g.curls.map(function (c) { return c.slice(1, -1).split("L").map(function (q) { return q.split(" ").map(Number); }); })));
    });
  }
  return KANTE[side];
}
function fenster(W, H) {
  var fr = FRAME.split(" ").map(Number), s = Math.min(W / fr[2], H / fr[3]), mx = fr[0] + fr[2] / 2, my = fr[1] + fr[3] / 2;
  return { x0: mx - W / (2 * s), x1: mx + W / (2 * s), y0: my - H / (2 * s), y1: my + H / (2 * s) };
}
/* liegt eine Hälfte in Lage l ganz außerhalb? (Schatten reicht ~40 Einheiten über die Kante) */
function ausserhalb(side, l, W, H) {
  var f = fenster(W, H), r = l.rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), pts = kantenPunkte(side);
  for (var i = 0; i < pts.length; i++) {
    var x = pts[i][0], y = pts[i][1] + (side === "top" ? 40 : -40);
    var X = CX + (x - CX) * c - (y - CY) * s + l.dx, Y = CY + (x - CX) * s + (y - CY) * c + l.dy;
    if (X < f.x0 || X > f.x1) continue;
    if (side === "top" ? Y > f.y0 : Y < f.y1) return false;
  }
  return true;
}
var WEGE = {};
function endLage(W, H) {
  var key = W + "x" + H;
  if (!WEGE[key]) {
    var f = fenster(W, H), ende = {};
    ["top", "bottom"].forEach(function (side) {
      var m = pieceMotion(1)[side], z = ZUSATZ[side], vz = side === "top" ? -1 : 1;
      var lageBei = function (D) { return { dx: m.dx + z.dx, dy: m.dy + vz * D, rot: m.rot + z.rot }; };
      var lo = 0, hi = (f.y1 - f.y0) * 3 + 3000;
      for (var i = 0; i < 24; i++) { var mid = (lo + hi) / 2; if (ausserhalb(side, lageBei(mid), W, H)) hi = mid; else lo = mid; }
      ende[side] = { dx: z.dx, dy: vz * (hi * 1.08 + 20), rot: z.rot };
    });
    WEGE[key] = ende;
  }
  return WEGE[key];
}
/* Lage einer Hälfte: Vorlage (pieceMotion) + Zusatz beim Aufreißen (q 0..1) */
function lage(side, open, q, W, H) {
  var m = pieceMotion(open)[side], e = endLage(W, H)[side];
  return { dx: m.dx + e.dx * q, dy: m.dy + e.dy * q, rot: m.rot + e.rot * q };
}
var transformVon = function (l) { return "translate(" + l.dx.toFixed(2) + " " + l.dy.toFixed(2) + ") rotate(" + l.rot.toFixed(3) + " " + CX + " " + CY + ")"; };
/* Prüfgriff (Test): liegen die Hälften beim Anteil q (Standard: Ende) ganz außerhalb des Fensters? */
function draussen(W, H, q) {
  q = q == null ? 1 : q;
  return { top: ausserhalb("top", lage("top", 1, q, W, H), W, H), bottom: ausserhalb("bottom", lage("bottom", 1, q, W, H), W, H) };
}
root.ERGUN_PAPIER = { endLage: endLage, lage: lage, draussen: draussen, tearLine: tearLine, stages: stages, TEASER: TEASER, DAUER: DAUER };

if (typeof document === "undefined") return;
var html = document.documentElement, ebene = document.getElementById("papier");
if (!ebene) return;
if (!html.classList.contains("papier-an")) { ebene.parentNode.removeChild(ebene); return; }

var NS = "http://www.w3.org/2000/svg";
function el(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a || {}) e.setAttribute(k, a[k]); return e; }
var info = root.__papier = { phase: "blatt", p: 0, start: Math.round(performance.now()), teaser: -1, reissen: -1, fertig: -1 };
var abbau = [];
try {
  var ruhig = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var svg = ebene.querySelector("svg"), ruck = svg.querySelector(".papier__ruck"), blatt = svg.querySelector(".papier__blatt"), hinweis = ebene.querySelector(".papier__hinweis");
  var line = tearLine();

  /* Seite darunter: nicht erreichbar, solange das Blatt liegt */
  var stumm = [].filter.call(document.body.children, function (e) { return e !== ebene && e.tagName !== "SCRIPT" && !e.hasAttribute("inert"); });
  stumm.forEach(function (e) { e.setAttribute("inert", ""); });

  /* Hälften (wie Half in der Vorlage): Schatten auf den Hintergrund, geklipptes Blatt, weißer Papierkern, aufgerollte Kanten */
  var haelften = null, riss = el("path", { fill: "none", stroke: "#1d0f07", "stroke-width": "2.4", "stroke-linejoin": "bevel" });
  ruck.appendChild(riss);
  function haelftenBauen() {
    haelften = ["top", "bottom"].map(function (side) {
      var g0 = halfGeometry("papier", side, line, 0);
      var g = el("g"), schatten = el("path", { d: d(line, false), fill: "none", stroke: "#000", "stroke-width": "22", transform: "translate(0 " + (side === "top" ? 10 : -10) + ")", filter: "url(#papier-soft)" });
      var cp = el("clipPath", { id: "papier-" + side }); cp.appendChild(el("path", { d: d(g0.shape) }));
      var inhalt = el("g", { "clip-path": "url(#papier-" + side + ")" }), kopie = blatt.cloneNode(true); kopie.removeAttribute("id"); inhalt.appendChild(kopie);
      var kern = el("path", { fill: "#ffffff" });
      var rollen = CURLS[side].map(function () { return el("path", { fill: "url(#papier-curl-" + side + ")", stroke: "#fff", "stroke-width": "1" }); });
      [schatten, cp, inhalt, kern].concat(rollen).forEach(function (x) { g.appendChild(x); });
      ruck.insertBefore(g, riss);
      return { side: side, g: g, schatten: schatten, kern: kern, rollen: rollen };
    });
  }

  function zeichne(p, q) {
    var W = innerWidth, H = innerHeight, f = frameGeometry(p, line, ruhig), s = f.s, open = q > 0 ? 1 : s.open;
    ruck.setAttribute("transform", "translate(" + f.shake.toFixed(2) + " " + (f.shake * 0.4).toFixed(2) + ")");
    if (open > 0) {
      if (!haelften) haelftenBauen();
      blatt.style.display = "none";
      haelften.forEach(function (h) {
        var g = halfGeometry("papier", h.side, line, open);
        h.g.setAttribute("transform", q > 0 ? transformVon(lage(h.side, 1, q, W, H)) : g.transform);
        h.g.style.display = "";
        h.schatten.setAttribute("stroke-opacity", (0.55 * Math.min(1, open * 3)).toFixed(3));
        h.kern.setAttribute("d", d(g.core));
        g.curls.forEach(function (c, i) { h.rollen[i].setAttribute("d", c); });
      });
    } else {
      blatt.style.display = "";
      if (haelften) haelften.forEach(function (h) { h.g.style.display = "none"; });
    }
    var zeigeRiss = s.crack > 0 && s.open < 0.15 && f.crack.length > 1 && !q;
    riss.style.display = zeigeRiss ? "" : "none";
    if (zeigeRiss) { riss.setAttribute("d", d(f.crack, false)); riss.setAttribute("opacity", (1 - s.open / 0.15).toFixed(3)); }
    if (hinweis) hinweis.style.opacity = q ? "0" : String(f.hint);
  }

  /* Bereit zum Öffnen erst, wenn der Ladezustand weg ist und das erste echte Glas-Bild steht – sonst sähe man im Spalt den Ladezustand */
  var anfang = performance.now();
  function bereit() {
    if (document.getElementById("lader")) return false;
    if (html.classList.contains("glas-ohne")) return true;
    var z = root.__glas && root.__glas.zustand && root.__glas.zustand();
    return (!!z && z.bilder > 0) || performance.now() - anfang > 6000;   /* Sicherung: nie hinter dem Blatt festsitzen */
  }

  /* Eingaben: Mausrad, Wischen, Pfeil runter, Bild runter, Leertaste – die Seite darunter scrollt nicht */
  var ziel = 0, p = 0, raf = 0, phase = "blatt", teaserSeit = 0, t0 = 0, ty = null;
  var schritt = function (v) {
    if (phase !== "blatt") return;
    if (ruhig) { phase = "geht"; return weiter(); }
    ziel = clamp01(ziel + v);
    if (!raf) raf = requestAnimationFrame(tick);
  };
  var TASTEN = { ArrowDown: 0.08, PageDown: 0.22, " ": 0.22, Spacebar: 0.22, End: 1, ArrowUp: -0.08, PageUp: -0.22, Home: -1 };
  function rad(e) { e.preventDefault(); schritt((e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1)) / (1.6 * innerHeight)); }
  function anfassen(e) { ty = e.touches && e.touches[0] ? e.touches[0].clientY : null; }
  function wischen(e) { e.preventDefault(); var y = e.touches && e.touches[0] ? e.touches[0].clientY : null; if (ty != null && y != null) schritt((ty - y) / (1.1 * innerHeight)); ty = y; }
  function taste(e) { if (!(e.key in TASTEN)) return; e.preventDefault(); schritt(TASTEN[e.key]); }
  function tippen() { if (ruhig) schritt(0); }
  function oben() { if ((root.scrollY || 0) !== 0) root.scrollTo(0, 0); }
  var Z = [["wheel", rad], ["touchstart", anfassen], ["touchmove", wischen], ["keydown", taste], ["pointerdown", tippen], ["scroll", oben]];
  Z.forEach(function (z) { root.addEventListener(z[0], z[1], { passive: false }); });
  abbau.push(function () { Z.forEach(function (z) { root.removeEventListener(z[0], z[1], { passive: false }); }); });

  function tick() {
    raf = 0; var now = performance.now();   /* eigene Uhr (Zeitlupe für Prüf-Aufnahmen über performance.now) */
    if (phase === "reissen") {
      var q = clamp01((now - t0) / DAUER);
      info.bilder = (info.bilder || 0) + 1; info.luecke = Math.max(info.luecke || 0, info.letztes ? now - info.letztes : 0); info.letztes = now;   /* Messung: Bilder und größte Lücke beim Aufreißen */
      zeichne(1, weich(q));
      if (q >= 1) return fertig();
      raf = requestAnimationFrame(tick); return;
    }
    var ok = bereit(), z = ok ? ziel : Math.min(ziel, 0.15);   /* vor dem fertigen Hintergrund höchstens der Riss */
    if (ok && ziel >= TEASER - 0.02) z = Math.max(z, TEASER);
    p += (z - p) * 0.14; if (Math.abs(z - p) < 0.0005) p = z;
    if (p >= TEASER - 0.004) p = TEASER;
    info.p = p; zeichne(p, 0);
    if (p >= TEASER) {   /* Teaser erreicht: nicht mehr zurück, kurz verweilen, dann reißt das Blatt von selbst ganz auf */
      if (!teaserSeit) { teaserSeit = now; info.teaser = Math.round(now); info.phase = "teaser"; }
      if (now - teaserSeit >= VERWEILEN) { phase = info.phase = "reissen"; t0 = now; info.reissen = Math.round(now); }
      raf = requestAnimationFrame(tick); return;
    }
    if (p !== z || !ok) raf = requestAnimationFrame(tick);
  }
  /* Bewegung reduzieren: kein Reißen – beim ersten Scrollen/Tippen blendet das Blatt kurz aus */
  function weiter() {
    if (!bereit()) { setTimeout(weiter, 60); return; }
    html.classList.add("papier-geht"); info.phase = "geht";
    setTimeout(fertig, 340);
  }
  var istFertig = false;
  function fertig() {
    if (istFertig) return; istFertig = true;
    if (raf) cancelAnimationFrame(raf);
    abbau.forEach(function (f) { f(); });
    stumm.forEach(function (e) { e.removeAttribute("inert"); });
    if (ebene.parentNode) ebene.parentNode.removeChild(ebene);
    html.classList.remove("papier-an", "papier-geht");
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc && root.ERGUN_PAPIER_THEMA) tc.setAttribute("content", root.ERGUN_PAPIER_THEMA);
    if ((root.scrollY || 0) !== 0) root.scrollTo(0, 0);
    info.phase = "weg"; info.fertig = Math.round(performance.now());
  }
  info.fertigMachen = fertig;   /* Prüfgriffe für Aufnahmen: fertig machen · einen Zeitpunkt des Aufreißens anhalten */
  info.anhalten = function (q) { if (raf) cancelAnimationFrame(raf); raf = 0; phase = "halt"; zeichne(1, weich(clamp01(q))); };
  zeichne(0, 0);
} catch (fehler) {
  /* Fehler: kein Blatt, die Seite ist normal erreichbar */
  try { abbau.forEach(function (f) { f(); }); } catch (e) {}
  (stumm || []).forEach(function (e) { e.removeAttribute("inert"); });
  if (ebene.parentNode) ebene.parentNode.removeChild(ebene);
  html.classList.remove("papier-an", "papier-geht");
  info.phase = "fehler"; info.fehler = String(fehler && fehler.message || fehler);
}
