/* ERGUN. Papier-Start (ERGUN., 03.10.2026 – Ausnahme auf ERGUNs Wunsch; Vorschau ?start=papier, PAPIER_STANDARD = false in index.html; Rückweg Tag vor-papier).
   Die Seite beginnt als Blatt mit „ERGUN.“ – Scrollen lässt es von der Mitte aus reißen (Vorlage), im Spalt erscheint der ECHTE Glas-Hintergrund
   der Seite (der Spalt ist durchsichtig), kurzes Verweilen, dann reißt das Blatt ganz auf und verlässt den Bildschirm (eigener Schritt, ~1,4 s).
   Danach: Ebene + alle Zuhörer weg, die Seite ist genau wie ohne Blatt. Nur einmal je Seitenaufruf, nichts wird im Browser gespeichert.
   Blatt (Papier, Schrift, Hinweis) steht fertig im HTML/CSS von index.html – dieses Skript macht nur die Bewegung.
   Nachgebaut statt aus der Vorlage: die React-Teile (Zustand, Effekte, JSX) als DOM-Aufbau; Tailwind-Klassen als CSS (.papier… in index.html). */
var TEASER = 0.62;          /* open = 1: die Hälften sind so weit auseinander wie in der Vorlage */
var VERWEILEN = 700;        /* ms: das Auge soll den Hintergrund im Spalt erkennen */
var DAUER = 1400;           /* ms: komplettes Aufreißen */
var STUFEN = [0.22, 0.42, TEASER];   /* Wischen: Riss → halb offen → offen (Teaser) – nach 2–3 Wischern reißt es von selbst auf */
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
root.ERGUN_PAPIER = { endLage: endLage, lage: lage, draussen: draussen, tearLine: tearLine, stages: stages, TEASER: TEASER, DAUER: DAUER, STUFEN: STUFEN };

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

  /* Hälften (wie Half in der Vorlage), aber flüssig auf dem Handy (03.10. abends, ERGUN.: „auf dem Handy soll es flüssig laufen“):
     · jede Hälfte ist eine eigene Ebene (div + svg) und wird nur per CSS-Transform bewegt – beim Aufreißen malt der Browser nichts neu,
       die Grafikkarte schiebt die fertigen Bilder (die Vorlage drehte SVG-Gruppen = jedes Bild neu malen)
     · Schatten aus drei weichen Linien statt Weichzeichner-Filter (der wurde bei jeder Bewegung neu gerechnet)
     · die Ebenen sind etwas größer als das Fenster, damit beim Kippen an den Rändern nichts fehlt */
  var haelften = null, riss = el("path", { fill: "none", stroke: "#1d0f07", "stroke-width": "2.4", "stroke-linejoin": "bevel" });
  ruck.appendChild(riss);
  var buehne = document.createElement("div"); buehne.className = "papier__haelften"; ebene.insertBefore(buehne, hinweis);
  var masse = null;   /* Abbildung SVG-Einheiten → Pixel für das aktuelle Fenster */
  function messen() {
    var W = innerWidth, H = innerHeight, fr = FRAME.split(" ").map(Number), s = Math.min(W / fr[2], H / fr[3]);
    masse = { W: W, H: H, s: s, vx: fr[0] - (W - fr[2] * s) / (2 * s), vy: fr[1] - (H - fr[3] * s) / (2 * s), ex: Math.round(0.14 * H + 0.06 * W) };
    if (haelften) haelften.forEach(boxSetzen);
  }
  function boxSetzen(h) {
    var m = masse, oben = h.side === "top" ? -Math.round(0.3 * m.H) : 0, hoehe = Math.round(1.3 * m.H), breite = m.W + 2 * m.ex;
    var vbx = m.vx - m.ex / m.s, vby = m.vy + oben / m.s;
    h.div.style.cssText = "left:" + (-m.ex) + "px;top:" + oben + "px;width:" + breite + "px;height:" + hoehe + "px;transform-origin:" + ((CX - vbx) * m.s).toFixed(1) + "px " + ((CY - vby) * m.s).toFixed(1) + "px";
    h.svg.setAttribute("viewBox", vbx.toFixed(2) + " " + vby.toFixed(2) + " " + (breite / m.s).toFixed(2) + " " + (hoehe / m.s).toFixed(2));
    h.letzte = "";
  }
  function haelftenBauen() {
    haelften = ["top", "bottom"].map(function (side) {
      var g0 = halfGeometry("papier", side, line, 0);
      var div = document.createElement("div"); div.className = "papier__haelfte";
      var s = el("svg", { preserveAspectRatio: "none", focusable: "false" });
      var schatten = el("g", { fill: "none", stroke: "#000", transform: "translate(0 " + (side === "top" ? 10 : -10) + ")" });
      [[54, 0.12], [36, 0.22], [20, 0.36]].forEach(function (w) { schatten.appendChild(el("path", { d: d(line, false), "stroke-width": String(w[0]), "stroke-opacity": String(w[1]), "stroke-linejoin": "round" })); });
      var cp = el("clipPath", { id: "papier-" + side }); cp.appendChild(el("path", { d: d(g0.shape) }));
      var inhalt = el("g", { "clip-path": "url(#papier-" + side + ")" }), kopie = blatt.cloneNode(true); kopie.removeAttribute("id"); inhalt.appendChild(kopie);
      var kern = el("path", { fill: "#ffffff" });
      var rollen = CURLS[side].map(function () { return el("path", { fill: "url(#papier-curl-" + side + ")", stroke: "#fff", "stroke-width": "1" }); });
      var defs = el("defs"); defs.appendChild(cp);   /* Verläufe der Kanten liegen einmal im Blatt-SVG (ids sind seitenweit) */
      [defs, schatten, inhalt, kern].concat(rollen).forEach(function (x) { s.appendChild(x); });
      div.appendChild(s); buehne.appendChild(div);
      var h = { side: side, div: div, svg: s, schatten: schatten, kern: kern, rollen: rollen, offen: -1, letzte: "" };
      boxSetzen(h);
      return h;
    });
  }
  /* SVG-Bewegung (translate + rotate um CX/CY) als CSS-Transform in Pixeln – gleiche Abbildung, weil der Maßstab überall gleich ist */
  function cssVon(l) { var s = masse.s; return "translate3d(" + (l.dx * s).toFixed(2) + "px," + (l.dy * s).toFixed(2) + "px,0) rotate(" + l.rot.toFixed(3) + "deg)"; }

  function zeichne(p, q) {
    if (!masse || masse.W !== innerWidth || masse.H !== innerHeight) messen();
    var f = frameGeometry(p, line, ruhig), s = f.s, open = q > 0 ? 1 : s.open;
    var ruckCss = "translate3d(" + (f.shake * masse.s).toFixed(2) + "px," + (f.shake * 0.4 * masse.s).toFixed(2) + "px,0)";
    svg.style.transform = ruckCss; buehne.style.transform = ruckCss;
    html.classList.toggle("papier-zu", open <= 0);   /* Blatt ganz zu: das Glas dahinter malt sparsam (js/glas.quelle.js) */
    if (open > 0) {
      if (!haelften) haelftenBauen();
      svg.style.visibility = "hidden"; buehne.style.visibility = "";
      haelften.forEach(function (h) {
        var l = q > 0 ? lage(h.side, 1, q, masse.W, masse.H) : pieceMotion(open)[h.side], t = cssVon(l);
        if (t !== h.letzte) { h.div.style.transform = t; h.letzte = t; }
        if (h.offen !== open) {   /* Kante + Schatten ändern sich nur beim Öffnen – beim Aufreißen (open = 1) bleibt das Bild fertig */
          var g = halfGeometry("papier", h.side, line, open);
          h.schatten.setAttribute("opacity", Math.min(1, open * 3).toFixed(3));
          h.kern.setAttribute("d", d(g.core));
          g.curls.forEach(function (c, i) { h.rollen[i].setAttribute("d", c); });
          h.offen = open;
        }
      });
    } else {
      svg.style.visibility = ""; buehne.style.visibility = "hidden";
    }
    var zeigeRiss = s.crack > 0 && s.open < 0.15 && f.crack.length > 1 && !q;
    riss.style.display = zeigeRiss ? "" : "none";
    if (zeigeRiss) { riss.setAttribute("d", d(f.crack, false)); riss.setAttribute("opacity", (1 - s.open / 0.15).toFixed(3)); }
    if (hinweis) hinweis.style.opacity = q ? "0" : String(f.hint);
  }
  root.addEventListener("resize", messen); abbau.push(function () { root.removeEventListener("resize", messen); });

  /* Bereit zum Öffnen erst, wenn der Ladezustand weg ist und das erste echte Glas-Bild steht – sonst sähe man im Spalt den Ladezustand */
  var anfang = performance.now();
  function bereit() {
    if (document.getElementById("lader")) return false;
    if (html.classList.contains("glas-ohne")) return true;
    var z = root.__glas && root.__glas.zustand && root.__glas.zustand();
    return (!!z && z.bilder > 0) || performance.now() - anfang > 6000;   /* Sicherung: nie hinter dem Blatt festsitzen */
  }

  /* Eingaben (ERGUN., 03.10. abends: „nach zwei, drei Mal Wischen soll es gehen“): Stufen Riss → halb offen → offen (Teaser), danach reißt es
     von selbst auf. Wischen: der Finger zieht mit, beim Loslassen rastet es auf der nächsten Stufe ein (ein langer Wisch = zwei Stufen).
     Mausrad zieht stufenlos wie in der Vorlage; Pfeil runter / Bild runter / Leertaste = nächste Stufe. Die Seite darunter scrollt nicht. */
  var naechste = function (x, n) { var i = 0; while (i < STUFEN.length && STUFEN[i] <= x + 0.01) i++; return STUFEN[Math.min(STUFEN.length - 1, i + (n || 1) - 1)]; };
  var vorige = function (x) { var v = 0; STUFEN.forEach(function (st) { if (st < x - 0.01) v = st; }); return v; };
  var ziel = 0, p = 0, raf = 0, phase = "blatt", teaserSeit = 0, t0 = 0, letzt = 0, wisch = null;
  function setzen(z) {
    if (phase !== "blatt") return;
    if (ruhig) { phase = "geht"; return weiter(); }
    ziel = clamp01(z);
    if (!raf) { letzt = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function rad(e) { e.preventDefault(); setzen(ziel + (e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1)) / (1.6 * innerHeight)); }
  function anfassen(e) { var t = e.touches && e.touches[0]; wisch = t ? { y0: t.clientY, dy: 0, basis: ziel } : null; }
  function wischen(e) {
    e.preventDefault();
    var t = e.touches && e.touches[0]; if (!wisch || !t) return;
    wisch.dy = wisch.y0 - t.clientY;
    var grenze = naechste(wisch.basis, wisch.dy > 0.4 * innerHeight ? 2 : 1);
    setzen(Math.max(vorige(wisch.basis), Math.min(grenze, wisch.basis + wisch.dy / (0.8 * innerHeight))));   /* zieht mit, höchstens bis zur Stufe */
  }
  function loslassen() {
    if (!wisch) return;
    var w = wisch; wisch = null;
    if (w.dy > 24) setzen(naechste(w.basis, w.dy > 0.4 * innerHeight ? 2 : 1)); else if (w.dy < -24) setzen(vorige(w.basis)); else setzen(w.basis);
  }
  var TASTEN = { ArrowDown: 1, PageDown: 1, " ": 1, Spacebar: 1, End: 3, ArrowUp: -1, PageUp: -1, Home: -3 };
  function taste(e) { if (!(e.key in TASTEN)) return; e.preventDefault(); var n = TASTEN[e.key]; setzen(n > 0 ? naechste(ziel, n) : n === -1 ? vorige(ziel) : 0); }
  function tippen() { if (ruhig) setzen(0); }
  function oben() { if ((root.scrollY || 0) !== 0) root.scrollTo(0, 0); }
  var Z = [["wheel", rad], ["touchstart", anfassen], ["touchmove", wischen], ["touchend", loslassen], ["touchcancel", loslassen], ["keydown", taste], ["pointerdown", tippen], ["scroll", oben]];
  Z.forEach(function (z) { root.addEventListener(z[0], z[1], { passive: false }); });
  abbau.push(function () { Z.forEach(function (z) { root.removeEventListener(z[0], z[1], { passive: false }); }); });

  function tick() {
    raf = 0; var now = performance.now(), dt = Math.min(0.1, (now - (letzt || now)) / 1000); letzt = now;   /* eigene Uhr (Zeitlupe für Prüf-Aufnahmen über performance.now) */
    if (phase === "reissen") {
      var q = clamp01((now - t0) / DAUER);
      info.bilder = (info.bilder || 0) + 1; info.luecke = Math.max(info.luecke || 0, info.letztes ? now - info.letztes : 0); info.letztes = now;   /* Messung: Bilder und größte Lücke beim Aufreißen */
      zeichne(1, weich(q));
      if (q >= 1) return fertig();
      raf = requestAnimationFrame(tick); return;
    }
    var ok = bereit(), z = ok ? ziel : Math.min(ziel, 0.15);   /* vor dem fertigen Hintergrund höchstens der Riss */
    if (ok && ziel >= TEASER - 0.02 && !wisch) z = Math.max(z, TEASER);
    p += (z - p) * (1 - Math.pow(0.86, dt * 60)); if (Math.abs(z - p) < 0.0005) p = z;   /* wie die Vorlage (0,14 je Bild bei 60 Bildern/s), aber zeitbasiert */
    if (p >= TEASER - 0.004 && !wisch) p = TEASER;
    info.p = p; zeichne(p, 0);
    if (p >= TEASER) {   /* Teaser erreicht: nicht mehr zurück, kurz verweilen, dann reißt das Blatt von selbst ganz auf */
      if (!teaserSeit) { teaserSeit = now; info.teaser = Math.round(now); info.phase = "teaser"; phase = "teaser"; }
      if (now - teaserSeit >= VERWEILEN) { phase = info.phase = "reissen"; t0 = now; info.reissen = Math.round(now); }
      raf = requestAnimationFrame(tick); return;
    }
    if (p !== z || !ok || wisch) raf = requestAnimationFrame(tick);
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
  info.stufen = STUFEN;
  zeichne(0, 0);
} catch (fehler) {
  /* Fehler: kein Blatt, die Seite ist normal erreichbar */
  try { abbau.forEach(function (f) { f(); }); } catch (e) {}
  (stumm || []).forEach(function (e) { e.removeAttribute("inert"); });
  if (ebene.parentNode) ebene.parentNode.removeChild(ebene);
  html.classList.remove("papier-an", "papier-geht");
  info.phase = "fehler"; info.fehler = String(fehler && fehler.message || fehler);
}
