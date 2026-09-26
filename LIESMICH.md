# Agentur-Website ERGUN. – Stand 25.09.2026, 04:50

> Überblick für eine neue Sitzung: Vault-Notiz `08 Projekte/Neustart – hier weitermachen.md`. Hier stehen die technischen Details, neuester Abschnitt oben.

> **Aktuell live:** die Seite von 138c7c9 (Hero mit Parallax → Kontaktformular → Footer), plus **endo.ai als Pille oben rechts** (`.nav__pille`, CSS-Block am Ende des `<style>`).
> Die Scroll-Szene „Sonnenuntergang → endo.ai“ (Abschnitt unten) war am 25.09. von 00:22 bis 00:28 live und wurde auf Emres Wunsch zurückgenommen.
> Ihr Code liegt in `_code/archiv/index-sonnenuntergang-endo-2026-09-25.html` (Vault-Commits beebffe, 007bc5b); die Bilder `sonne*`, `layer-1-sky-ohne-sonne*`, `layer-1-sky-blaue-stunde*` und `4k/sonnenuntergang.py` bleiben im Projekt (unbenutzt).











## endo Phase C – Schritt 2: Speicher + Credit-Logik (26.09.2026, Claude Code)
- Neu: `api/_lib/endo/speicher.js` (Konten, Credits, Aufträge über Supabase-RPC) und `api/_lib/endo/limits.js` (10 Aufträge/h, 30/Tag, Chat 40/Tag, Tageslimit 10 $ bzw. `ENDO_TAGESLIMIT_USD`). `api/_lib` = keine Vercel-Funktion, nicht öffentlich.
- Die Logik (Sperren, Reservieren, Abbuchen, Zurückgeben, Doppelbuchen, Limits) steckt in Postgres-Funktionen: `_code/werkzeuge/endo-datenbank/schema.sql` (einmal im Supabase-SQL-Editor ausführen; Funktionen nur für den Server-Schlüssel freigegeben).
- Tests: `_code/werkzeuge/endo-datenbank/` → `npm test` (16 Tests gegen echtes Postgres im Speicher, PGlite).
- Noch nicht eingebunden – wird ab Schritt 3 von den neuen Funktionen `api/endo/*` genutzt. Bauplan: Vault `08 Projekte/endo Phase C – Bauplan.md`.

## Kugel-Einsammeln als Impuls (26.09.2026, Claude Code) – ersetzt die Arm-Logik im Abschnitt darunter
`ki/js/orb.js?v=9`, `js/endo-zufluss.js?v=4`. Einstellwerte: `KUGEL` oben in `orb.quelle.js` (breite, umfeld, maxLaenge, hinMs, daempfung, frequenz, welle…, blitzMs, ring…, glanz), `PAKET` in `endo-zufluss.js` (anzug, greifen, halten, radius, takt, abstandTest).
- Shader: `uniform vec4 arm[3]` (Objekt-Richtung, Länge L als Radius-Anteil), `armInfo[3]` (x Welle, y Blitz), `puls[3]` (Ring-Phase), `sek` (Sekunden für die Welle); Form `kern = exp(−θ²/BREITE²)`, `form = kern + umfeld(1−kern)`, Verschiebung `dir · L · 1,2 · form + normal · Welle`; Helligkeit über `varying vHell` (≤ 1 · GLANZ). Konstanten als `defines`.
- Arm-Zustände `frei → hin → zurück`: hin `L = Lstart + (ziel − Lstart)(1 − (1 − p)⁴)`, `p ≥ 0` geklemmt, `ziel = clamp(d − 1, 0, maxLaenge)` folgt dem Paket; zurück `L0 e^(−ζωt)(cos ω_d t + ζω/ω_d sin ω_d t)`. Schnittstelle `window.endoKugel = { arme, reichweite, greifen(x,y,d) → Kennung, folgen(k,…), gefangen(k), fortschritt(k), puls(x,y), zustand() }`.
- `.endo__orb`-Maske `#000 78%` (vorher 62 %). `?kugel=test` = Testansicht. Aufnahme-Werkzeug `_code/werkzeuge/cdp-shot.mjs` kann jetzt auch Screencasts (`aufnahme: {ms, dir}`).

## Kugel saugt Pakete ein + Tipp-Pakete (26.09.2026, Claude Code)
`ki/js/orb.js?v=8` (beide Seiten), `js/endo-zufluss.js?v=3`. **Neu bauen** (three 0.186.1 + esbuild in einem Ordner außerhalb des Vaults, dann `NODE_PATH=<ordner>/node_modules esbuild ki/js/orb.quelle.js --bundle --minify --format=iife --target=es2018 --outfile=ki/js/orb.js`).
- Shader: `defines ARME` (3/Handy 2), `uniform vec4 zug[3]` (Objekt-Richtung xyz, Stärke w): `newPosition += mix(normal, dir, 0.55) · s · w²(0.45+0.55w) · 0.42` mit `w = smoothstep(0.52, 1, dot(n, dir))`. `uniform vec4 puls[3]` (Richtung, Phase 0…1): Ring `ang − ph·2.6`, Summe ≤ 0.26.
- `window.endoKugel = { arme, zuege[{x,y,s}], staerke[], puls(x,y) }`: Pakete geben Bildschirmrichtung (x rechts, y unten) + Zielstärke; Kugel dämpft (hinaus τ 0,12 s, zurück 0,26 s), rechnet jedes Bild über die inverse Mesh-Drehung in Objektkoordinaten um.
- Pakete: `.endo__daten` jetzt `position: fixed` (Viewport), Simulation in Seitenkoordinaten, Kugel per `getBoundingClientRect` alle 250 ms. Zug ab `2,4 R` (R = 0,56 · halbe Kugelbreite), dann `spd += 300 px/s²` (Handy 240), Richtung biegt radial ein; Aufnahme an der tatsächlichen Armspitze `R(1 + 0.32 · staerke)`. Arme bleiben einem Paket bis zur Aufnahme zugeordnet. Tipps: `click` (passiv, `detail > 0`) innerhalb `.endo` unterhalb von 30 % Viewporthöhe über seiner Oberkante; max. 12/8 gleichzeitig. Ohne WebGL-Kugel: altes Aufglimmen am Rand.

## Sonnenbahn + Winken-Timing (26.09.2026, Claude Code)
`szene.js?v=32`. `sonneStartSetzen()`: Titelunterkante über `offsetTop`-Kette bis `held` (ohne Parallaxe) + `2,4 · sonneR`, höchstens `sonneEnde − 3 · sonneR`; in `aufbauen()` nach `--titel-oben` und nach `document.fonts.ready`. Sonne mit `sanfter()` (smootherstep). `GLATT = 0.15`. Winken: `winkStartP` beim Start, in `figLauf` `phase = max(Zeit, (p − winkStartP)/WINK_WEG)`, `WINK_WEG = 0.55`.

## Lichtlinie nur beim Scrollen + Leuchtpunkt (26.09.2026, Claude Code)
`szene.js?v=31`, `endo-zufluss.js?v=2`. `.endo { --faden-bis-rand; --faden-h = bis-rand + 0,2 · Kugelbreite }` (Wortmarke nutzt `--faden-bis-rand`). Markup `.endo__faden.ist-still` + `.endo__funke.ist-still` (`i.endo__schein`, `b.endo__schweif`, `i.endo__kern`). `faden(y, tempo)` setzt `scaleY`, Punkt per `translate3d(0, f·fadenH)`, Schweif `scaleY(0.18 + |v|/2600)`, `.ist-null` bei f ≤ 0,002. `fadenBewegt(richtung)` aus dem Takt bei jeder Scrollbewegung: zeigen (außer runter und f ≥ 1), Timer 650 ms → `ist-still`. CSS-Übergänge: ein 150 ms, aus 400 ms. Reduced motion: Klassen beim Start entfernt. Pakete: `SCHEIN`/`KERN`-Sprites via `drawImage`.

## endo-Logo in Chrom (26.09.2026, Claude Code)
`.endo .endo__marke b` (Markup `data-text="endo"`): zwei Hintergrundebenen per `background-clip: text` – Glanzband (`background-size: 320%`) über Chrom-Verlauf, `background-origin: content-box`; Polsterung `0.5em 0.3em` (Platz für Schatten) mit waagerechtem Gegen-Margin (vertikal nicht, sonst verschiebt `translateY(-50%)`). Schatten über `b::before` (Textkopie, `color: transparent`, `text-shadow`, z-index −1) statt `filter`. Glanz wandert per `animation-timeline: view()` (`background-position` 92 % → 8 %), sonst steht er bei 46 %. `.endo__marke` ohne z-index.

## Sammelauftrag Himmel + endo (26.09.2026, Claude Code)
`szene.js?v=30`, `pakete.css?v=4`, `endo-daten.js?v=5`, `pakete.js?v=4`, `agent.js?v=11`.
1. Himmel: `.himmel--tag/--gold/--blau/--nacht` neue Verläufe; `.himmel--korn` (SVG-feTurbulence, Alpha 0,03) gegen Banding; `.sonne .sonne__glut` skaliert mit `--tief`; `.mond__hof` leiser. `?nacht=x` → `festP = x · 0.46 · ZEIT`.
2. Wortmarke: `<p class="endo__marke endo-marke">` direkt in `.endo` (vor dem Canvas), absolut bei `top: 30svh + --faden-h · 0.46`, `left: 50%`, `b` rechtsbündig / `span` linksbündig mit `--marke-luft` (20/15 px). `--faden-h` jetzt auf `.endo` definiert.
3. Pakete: `ENDO.abrechnung {standard, rabattJahr}`, je Paket `jahr {monat, gesamt}`, `kaufenJahr`. `pakete.js`: gemeinsamer `modus`, `umschalter()` (auch im Vormerken-Formular), `beiWechsel`-Liste, Preiswechsel über `.sp--wechsel` (opacity/transform 150 ms, ohne rAF), `.sp--jahr` zeigt Badges. CSS: `.sp__schalter/.sp__schieber/.sp__wahl`, Karten `--karte-rand` (Pro/Premium eigene), subgrid (`grid-row: span 4`), unter 860 px ohne subgrid. Vormerk-Nachricht nennt Abrechnung.
4. Leistungen: CSS-Zähler `decimal-leading-zero` in `li::before` (Geist Mono), `b` in `--serif`, Liste `width: min(960px, 100vw − 2·pad)` mittig über `margin-left`.
- Prüfwerkzeug (Scratchpad): `cdp-shot.mjs` steuert Edge headless über DevTools (Viewport, echtes Scrollen, Screenshots) – das Browser-Pane liefert nach Scrollen verschobene Standbilder, wenn es versteckt ist.

## Titelbild live am Scrollen (26.09.2026, Claude Code) – ersetzt Punkt 3/4 unten
`szene.js?v=29`, Commit `91b1062`.
- **Gemeinsamer Takt** `takt(t)`: per rAF, liest `leseY()` (scrollY); läuft solange sich `rohY`/`weichY` ändern + 300 ms, dann schläft er (`anfordern()` bei `scroll` weckt ihn). `fortschritt(y) = (y - heldOben)/m.H` – `heldOben` einmal in `aufbauen()` gemessen (keine `getBoundingClientRect` pro Bild mehr).
- `zeichne(immer)`: Parallaxe + Winken am echten `rohY`; bei `immer` Licht/Faden sofort (+ `fadenMessen()`). Glättung nur noch `weichY += (rohY-weichY)*(1-exp(-dt/GLATT))`, `GLATT = 0.06` s → `licht(fortschritt(weichY))` + `faden(weichY)`. Alte `nachfuehren()` (0,9 s + 0,2 H/s-Grenze), `ziel/weich/geplant` entfernt.
- **Winken:** `winken()` (startet nur, wenn nichts läuft; wartet via `winkenWartet` auf die Bildfolgen, `folgenDa()`), Auslöser `!gewunken && p > vorherP` sobald `p > 0.003`; Freigabe bei `p <= 0.003`; erster Aufbau: `gewunken = p > 0.003`. Hund in `figurenZeichnen()` mit `min(1, sin(π·e)·1.25)` (hin und zurück), Emre unverändert `e`.
- **Faden:** CSS-`view()`-Animation entfernt, `.js .endo__faden { transform: scaleY(0) }`; `faden(y)`: `scaleY = clamp((y + 0.62·innerHeight - fadenOben)/fadenH)`.
- Bewegung reduziert: `fortschritt` liefert jetzt auch dort die Position (Licht/Faden folgen), Parallaxe `s = 0`, kein Winken.
- Test-Helfer: `window.__szene.zustand()` (Phase, gewunken, rohY/weichY, Licht, Faden).

## endo Studio: Datenpakete zur Kugel (26.09.2026, Claude Code)
`js/endo-zufluss.js?v=1` + `<canvas class="endo__daten">` vor `.endo__orb` (z-index −1), Commit `55a665e`. Canvas nur als Streifen ±1,5 Kugelbreiten um die Kugelmitte (Layoutposition `offsetTop/Left`, gemessen bei Start/Resize), dpr ≤ 1,5. Teilchen: Start 1,5–2,6 × Kugelradius (ungemaskiert) in zufälliger Richtung, Bogen `sin(πt)·biege`, Beschleunigung `v += dt(0.10+0.35t)`, Ausblenden+Schrumpfen ab 1,3 R (sichtbarer R = 0,62 · halbe Breite), Entfernen bei 1,04 R mit Rand-Aufglimmen (0,55 s). Max 8/Handy 5, alle 0,8–2 s. IntersectionObserver + `visibilitychange`; reduced-motion: kein Start, Canvas `display:none`.

## Titelbild – 4 Punkte einzeln (26.09.2026, Claude Code)
Vier nummerierte Änderungen, je ein Commit. Basis: freigegebener Stand (CSS-Sonne, gezeichnete Landschaft, eine Lichtlinie).
1. **Wolken weg** (`3c67fce`, `szene.js?v=26`): `wolken()`, `F.wolke`, `F.wolkeSaum` und der Aufruf in `landschaft()` entfernt.
2. **Sterne/Milchstraße/Schnuppe weg** (`c84330f`, `?v=27`): kompletter Sterne-Block (`STERNFARBEN`, `sterne()`, `schnuppePlanen()`, `schnuppeTimer`) raus; in `aufbauen` `sterne(); zeichne(true)` → `zeichne(true)`; `schnuppePlanen()` aus `start()`; `--sterne*`/`--milch`-Zuweisungen und `szene--sterne`-Toggle aus `licht()`; CSS `.sterne/.milchstrasse/.schnuppe*`, Keyframes `funkeln*`/`schnuppe`, Markup `<div class="sterne">` und `--sterne:0` entfernt.
3. **Winken früher, nur runter, einmal** (`ac4699d`, `?v=28`): neues Flag `var gewunken=false`. In `zeichne()` Richtungserkennung `var vorherP = letztesP;` (vor dem Early-Return). Trigger ersetzt: bei `p<=0.02` `gewunken=false` + Figur auf Ruhe (`fig.phase=0`); sonst `!gewunken && pz>0.22 && p>vorherP` → `gewunken=true; figStart(1)`. Kein `figStart(0)` mehr (kein Rückwärts). `else if (ruhig)` leer = Figur ruht. `figLauf` läuft nur vorwärts auf `ziel=1`.
4. **endo-Faden an Scroll gekoppelt** (`69eaede`, nur `index.html`): Timer-Punkt entfernt (`faden-punkt`-Animation, Pause-Regel, Keyframes). `.endo__faden::after` von `top:0; opacity:0` → `bottom:-5px; opacity:0.9`, sodass der Punkt am unteren Ende (= Spitze) sitzt. Die Spitze folgt über die vorhandene scaleY-Kopplung (`faden-waechst` + `animation-timeline: view()`, Range `entry 0% cover 40%`) der Scrollposition. Reduced-motion: kein scaleY → statischer Faden, Punkt an der Kugel.

## Teil 7 Schritt 1: Kopf ruhig/größer, Winken-Halt (26.09.2026, Claude Code)
- `figuren.py winken`: Kopf um KF=1,09 um die Kopfmitte vergrößert (echt/ea aus `setz` + Skf). Nachführung in 2 Durchgängen: alle Tracks sammeln, in (tx,ty,winkel,skala) zerlegt, Gauß-geglättet (sigma 4) und auf 35 % um den Mittelwert gedämpft → kein Wackeln. `emre.h` 600, 64 Bilder.
- `js/szene.js` (`?v=27`, Figuren `?v=7`): `winkKurve()` (heben→oben halten→senken), in `figurenZeichnen` nur für Emre; Hund weiter smoothstep. Sterne-Guard bei 0-Breite.

## Winken mit 64 Bildern, ohne Überblenden (26.09.2026, 06:20, Claude Code)
- `python figuren.py winken video/winken2-v1-4c32d096.mp4 0.4 4.9 64` (5. Argument = Bildanzahl): `emre-folge.webp` = 8 Spalten × 8 Zeilen à 248×600 (Qualität 80). Masken-Cache `video/winken-masken-winken2-v1-4-64.npz`.
- `js/szene.js` (`?v=25`, Figuren `?v=6`): `figurZeichnen` nimmt `Math.round(nr)` (kein additives Zwischenbild mehr), `FIG_DAUER` 4,4 s, `FIGLICHT.nacht.mul` 0,27/0,32/0,45.

## Figuren: Licht zur Laufzeit (26.09.2026, 05:30, Claude Code)
- `figuren.py` schreibt jetzt `bilder/hero/figuren/<name>.webp` (Bild 0, neutral) und `<name>-folge.webp` (Raster, neutral, `figuren_stil.neutral`: nur Glätten + Korn); die alten `-tag/-gold/-nacht` sind gelöscht. `mitte`/`breite` stehen direkt im json. Weiße Bewegungsränder (außerhalb 9-px-Innenrand, mn > 175, Sättigung < 0,12) und das 3-px-Kantenband werden per `cv2.inpaint` mit der Haut gefüllt statt aus der Maske entfernt. `szene.js?v=24`, Figuren `?v=5`.
- `js/szene.js` (`?v=23`, Figuren `?v=4`): `FIGLICHT` (tag/gold/blau/nacht: `mul` multiplikativ, `lift` additiv, `rim` + `ra`), `figurLicht()` mischt sequentiell mit `lichtGold`, `lichtBlau` (= sanft 0,18–0,3), `lichtNacht` aus `licht()`. `figurZeichnen()`: Hilfsleinwände `lwA/lwB/lwC` – Bild (Zwischenbilder additiv) → Umriss merken → multiply + lighter + destination-in → Saum = Umriss minus versetzter Umriss (source-in Saumfarbe) mit Alpha `ra`. Cache-Schlüssel enthält die drei Lichtwerte (2 Stellen). `stand` 0,148 H (hoch 0,124).

## Teil 6: echtes Gesicht, Winken 2, Himmel (26.09.2026, 04:40, Claude Code)
- Video-Startbild `bilder/hero/4k/szene2/video/start-emre-echt.png` (1080×1920, `emre-ausschnitt.png` auf Weiß, 86 % Höhe). `figuren.py winken video/winken2-v1-4c32d096.mp4 0.4 4.9`: Kopfausrichtung sucht den Maßstab jetzt um Personenhöhe ± 6 %; Video-Kopfumriss wird mit 7 % Kopfhöhe dilatiert ausgeschlossen (kein Haar-Bogen); Emre-Zellen 720 px (`emre-nacht.webp` 692 KB). `figuren_stil.py`: Nacht belicht 0,3/saett 0,45, Stufung 10 %, Saum nachts 0,62 und dünner.
- `js/szene.js` (`?v=21`, Figuren `?v=3`): `FIGUREN.emre` = 298×720, 30 Bilder. Sterne: Dichte 1/950 und 1/5200, Alpha 0,45–1, Hof ×5, bis 70 helle; Milchstraße heller (`.milchstrasse` opacity = `--milch`). Wolken: `sonnig` (4 Schleier bei u 0,36–0,64) auf eigener Leinwand `.szene__wolken--vorn` zwischen Sonne und Mond, Lichtsaum aus `F.wolkeSaum` (tag oben, gold unten, nacht oben links). `index.html`: `.mond__hof` 18 × r, neu `.mond__schein` 4,6 × r.

## Figuren: echter Kopf, Licht, Stand, Überblendung (26.09.2026, 03:30, Claude Code)
- `figuren.py winken`: Kopf aus `bilder/hero/4k/emre-ausschnitt.png` (Studiokopf), per Körperumriss auf Bild 0 gesetzt (Maßstab mit bester Deckung), dann Kopfbewegung des Videos Bild 0 → i per SIFT (Ähnlichkeit). In der Kopfzone gilt nur der echte Umriss; Hand = Videobild außerhalb des Video-Kopfumrisses links vom Kopf. Masken-Zwischenspeicher `video/winken-masken-*.npz`.
- `figuren_stil.py`: neue Lichtwerte (Tag 0,86 · Abend 0,5 Gegenlicht · Nacht 0,24). Bilder `?v=2`.
- `js/szene.js` (`?v=19`): gemeinsamer Boden = tiefster Kammpunkt unter beiden + 2,2 % Bildhöhe; Schlagschatten je Licht; `figurZeichnen()` blendet gebrochene Bildnummern additiv über (Zwischenleinwand), Phase mit smoothstep, `FIG_DAUER` 3,6 s, Start p/ZEIT > 0,35 (zurück < 0,28).

## Emre + Hund als echte Figuren, Winken (26.09.2026, 02:30, Claude Code)
- `bilder/hero/4k/szene2/figuren.py` (+ `figuren_stil.py`): erzeugt `bilder/hero/figuren/{hund,emre}-{tag,gold}.webp` (Bild 0) und `-nacht.webp` (Raster 6 Spalten: Hund 36 Bilder 318×360, Emre 30 Bilder 268×560) + `.json` (Zelle, Fußlinie `fuss`, Kopflinie `oben`, `mitte`, `breite`). Hund: Farbbilder aus `video/v1-9493b609.mp4` + Masken aus `hund-film/`. Emre: `python figuren.py winken video/winken-v2-ca4f3250.mp4 0.4 3.9` – isnet-Freistellung, echter Kopf aus b305a018 per SIFT (nur Ähnlichkeitstransformation), Hand bleibt davor, weiße Bewegungsränder raus.
- `js/szene.js` (`?v=18`): `FIGUREN` (Werte aus den json), `figurenStellen()` (nebeneinander auf `ky('wiese')`, Emre = 1,95 × Hundehöhe), `fussgras()` (Schatten + Halme je Licht), `figurZeichnen()` (Tag/Abend/Nacht überblenden, Nachtbild = Bildnummer), `figStart()/figLauf()` (Phase 0–1 in 3,2 s, Start bei p/ZEIT > 0,38, zurück < 0,3; mit `?p=` gescrubbt). Hülle `.szene__figuren` (z-index 1) über den Wiesen-Fassungen. Alte Silhouetten (`hund-steht/-silhouette.webp`, `emre-silhouette.webp`) nicht mehr benutzt.

## Emre + Hund, Tageswechsel, Details (26.09.2026, 01:20, Claude Code)
- `bilder/hero/emre-silhouette.webp` (226×640, nur Alpha aus `bilder/hero/4k/emre-cut.png`, 11 KB). `js/szene.js`: `emre`-Objekt + `emreZeichnen()` (wie `hundZeichnen`, Farbe/Saum aus `F.hund`), Leinwand `.szene__hund.szene__emre` in der Wiesen-Ebene vor dem Hund eingefügt (Hund liegt davor). Größe `hh × 1,8`, x = Hund + 0,88 × Hundebreite (sonst links, falls kein Platz), Füße auf `ky('wiese')`.
- `ZEIT = 0.75` (vorher 0.6); `nachfuehren()`: Zeitkonstante 0,9 s + Höchsttempo 0,2/s.
- Details: `berg()`-Parameter (weit rippen 0,9/baender 20; fern schichten 4, rippen 1,7, baender 75, geroell 1000; mitte schichten 7, rippen 1,9, baender 120, geroell 1500), Wiese 1,5 × W Halme / 0,2 × W Blüten, Gras 0,85/0,55 × W, mehr Ähren. `szene.js?v=17`.

## Wurzeln zurückgenommen → Lichtfaden (26.09.2026, 00:30, Claude Code)
- `js/szene.js` wieder auf dem Stand von 8912bd2 (ohne `wurzeln()`), `?v=16`. In `index.html`: `.szene__grund`/`.szene__wurzeln` entfernt, `erde-steigt` läuft wieder, `.szene__fade` wieder 36 %, `.endo` hat wieder seinen Verlauf.
- Neu `.endo__faden`: 1 px Linie in der Mitte ab 30svh, endet weich bei Kugelmitte − 0,42 × Kugelbreite, also über dem sichtbaren Rand (seit 00:45; `--faden-h`, gleiche Maße wie `.endo__orb`), wächst per `animation-timeline: view()` (scaleY), Lichtpunkt `::after` alle 7 s; im Chat/außerhalb still, „Bewegung reduzieren“ = statisch.
- Wurzel-Version zum Nachschlagen: Commit 0327880.

## Wurzeln aus dem Gras (26.09.2026, 00:10, Claude Code)
- `js/szene.js`: neue Funktion `wurzeln()` (nach den Sternen, per `spaeter`). `gras()` merkt sich die Halme (`grasFuesse`); aus deren Füßen wachsen ca. W/5,5 Wurzeln, davon W/60 (mind. 8) lange, die zur Mitte der `.endo__orb` steuern (Ziel zurückgerechnet durch die End-Stellung von `gras-nah`: 10svh hoch, ×1,6). Farbe: Erd-Blau oben → Silber → hell, tiefer mit leichtem Schein und Lichtpunkten.
- Wachsen: jedes Stück kommt in einen von 8 Streifen nach „gewachsenem Weg ÷ Tempo der Wurzel“ → unregelmäßige Wachstumsfront. Je Streifen eine Leinwand mit eigener `animation-range` (exit 6 %…100 %), Keyframes `wurzel-waechst` (opacity).
- `index.html`: `.szene__grund` (dunkler Verlauf unter der Bühne) + `.szene__wurzeln` im `.szene`-Block (dort gilt die Zeitleiste `--szene`); `.szene__wurzeln` hat Animation `gras-nah` mit `transform-origin: 50% var(--wurzel-fuss)` = Unterkante der Bühne → Wurzeln bleiben an den Halmen. `.szene__fade` nur noch 22 %. `erde-steigt` läuft nicht mehr. `.endo` hat keinen Hintergrund mehr (durchsichtig), `.endo__daten` und `ki/js/daten.js` sind von der Startseite entfernt (bleiben auf /ki/).

## Teil 5: Daten statt Nebel + endo-Schrift (25.09.2026, 23:30, Claude Code)
- Neu `ki/studio.css` (auf Startseite und /ki/ eingebunden): Schrift **Geist Light** (`schriften/Geist-Light.woff2`) und **Geist Mono** (`schriften/GeistMono-Regular.woff2`, beide OFL aus dem `geist`-Paket), Variablen `--endo-schrift`, `--endo-mono`, `--endo-chrom`; Wortmarke `.endo-marke` (`<b>endo</b> <span>Studio</span>`, `--klein` für die Navigation); Daten-Ebenen `.daten` / `.daten__ebene` (`--wurzeln`, `--strom` mit Lichtimpuls `::after`, `--welle`, `--netz`, Deckkraft über `--deck`).
- Neu `ki/js/daten.js` (ersetzt `ki/js/nebel.js`, das nicht mehr eingebunden ist): setzt `.ist-bereit` auf `[data-daten]` erst nach dem Laden (dann werden die Bilder geholt) und `.daten-pause`, solange die Ebene nicht im Bild ist.
- Bilder `bilder/studio/`: `wurzeln-daten.webp`, `datenstrom.webp`, `datenstrom-welle.webp`, `netz.webp` (Higgsfield auf Schwarz, Helligkeit = Deckkraft, zusammen ca. 720 KB).
- Startseite: `.endo__daten` statt `.endo__nebel`; Wurzeln ab 30svh wachsen per `animation-timeline: view()` nach unten, Strom sitzt rechnerisch auf der Kugelmitte (gleiche Maße wie `.endo__orb`). /ki/: `.daten-feld` (fest, Netz) + `.hero__daten` (Welle durch die Kugel). Im Chat (`.endo-chat`) und bei „Bewegung reduzieren“ still.
- Schrift: `.endo__titel.endo-display`, `.endo__bereiche b`, Chat-Name, /ki/ `h1`, `.kopf h2`, `.kopf__label`/`.hero__marke` (Mono), Credit-Fenster, `pakete.css` (`.sp__titel`, `.sp-karte__preis`, `.sp__vm-titel`) → Geist Light. /ki/ lädt Instrument Serif nicht mehr.

## Nebel über der Unterkante des Titelbilds (25.09.2026, 22:40, Claude Code)
- Emre (iPhone-Screenshot): flache dunkle Fläche mit Kante zwischen Titelbild und Nebel. Lösung: `.endo` liegt jetzt mit `z-index: 2` über dem Titelbild, oben durchsichtig (Hintergrund erst ab 34svh), `pointer-events: none` außer `.endo__innen`/`.endo__pakete`. Der Nebel beginnt 12svh unter der Oberkante der Sektion und zieht damit schon über die versinkende Wiese (Lagen 1–3 höher gesetzt).

## Abstieg zur Erde + Abstand zu endo Studio (25.09.2026, 22:20, Claude Code)
- Emre: sauberer Übergang, endo Studio nicht direkt am Titelbild, passende Animation „zur Erde runter“.
- Neu `.szene__erde` (Verlauf in #070B16, steigt per Scroll-Animation `erde-steigt` von unten auf, exit 30–92 %). Gras (`gras-nah`, bis scale 1.6), Wiese mit Hund (`wiese-nah`, 1.28) und Wald (`wald-nah`, 1.1) kommen näher, der Titel blendet aus (`titel-aus`, exit 32–62 %). Nur bei CSS-Scroll-Animationen und ohne „Bewegung reduzieren“.
- `.endo` Abstand oben: `34svh + clamp(240px, 44svh, 440px)` – nach dem Titelbild erst eine ruhige Nebelzone, dann Kugel und Überschrift.
- Titelzeile: nur noch „Digitalstudio für Design“ (Emre).

## Blauer Streifen oben hinter der Navigation (25.09.2026, 21:55, Claude Code)
- Emre (iPhone): „oben über dem Namen, wo ERGUN/Pakete steht, wird es blau“. Ursache: der Himmel reichte beim Scrollen in Safari nicht ganz bis oben, dahinter schien die hellblaue Grundfarbe von `.szene__buehne` (#BFD6EA).
- Lösung: `.himmel { inset: -60% 0 0 0 }` – alle vier Himmelsverläufe reichen 60 % über den Rand, oben jeweils in ihrer eigenen obersten Farbe (Farbstopps umgerechnet, sichtbarer Verlauf unverändert). Grundfarbe der Bühne jetzt `#070B16`.

## Chat ruhig und im Stil der Seite, mehr Nebel (25.09.2026, 21:40, Claude Code)
- Emre (iPhone-Video, iOS 26.6): im Chat soll sich der Hintergrund nicht bewegen; Chatfenster „mehr im Einklang, nicht so generiert“; mehr Nebel im Hintergrund der Studio-Sektion.
- `ki/js/agent.js`: kein Mitscrollen der Seite mehr (`mittig()`/`eingabeImBild()` entfernt); beim Start des Chats `orb:halt` an alle `[data-orb]` → Kugel steht (neuer Haken in `orb.js`/`orb.quelle.js`: `data-halt`, Ereignisse `orb:halt`/`orb:weiter`). Nebel pausiert per `.endo-chat .nebel`.
- Chat-Aussehen (Startseite + /ki/): kein Avatar, „endo“ in Instrument Serif, endo-Nachrichten ohne Blase mit feiner Linie links, eigene Nachrichten in Haarlinie, Vorschläge als feine Pillen (Hauptvorschlag Chrom). Feste Verlaufshöhe `min(46svh, 420px)` sobald der Chat läuft – nur der Verlauf scrollt.
- Startseite: `.endo__nebel` über die ganze Studio-Sektion, 5 Lagen (neu `nebel--4/5`), kräftiger.

## Parallaxe wieder im Browser (25.09.2026, 21:05, Claude Code)
- Emre: auf dem iPhone ruckelt es oben weiterhin. Wahrscheinliche Ursache: Safari scrollt auf eigenem Weg, die per JavaScript verschobenen Ebenen kamen ein Bild zu spät (Zittern).
- Neu: `.szene { view-timeline: --szene }`, jede `.szene__ebene` läuft per `animation: ebene-weg` mit `animation-range: exit 0% exit 100%` bis `--weg` (vom Skript je Ebene gesetzt = Bildhöhe × Tiefe). Das Skript verschiebt nur noch, wenn der Browser keine Scroll-Animationen kann (`cssParallaxe`). Licht-Variablen werden nur geschrieben, wenn sie sich ändern (`wert()`).
- Braucht Safari 26 (iOS 26) für die flüssige Variante; ältere iPhones nutzen weiter den Skript-Weg.

## Start ohne Ruckeln + Nebel auf der ganzen Studio-Seite (25.09.2026, 20:40, Claude Code)
- `js/szene.js` zeichnet in Stufen: `landschaft()` mit `AKTIV = ['tag']` sofort (Aufbau 18 ms statt ca. 108 ms), danach per `requestIdleCallback` Gold, Nacht und zuletzt die Sterne. Gras-Windhüllen werden wiederverwendet (gleicher Takt), der Hund nur im ersten Durchgang angelegt. Die Landschaft blendet beim Start einmal weich ein (500 ms), Himmel und Titel stehen sofort.
- Nebel liegt jetzt in `ki/js/nebel.js` (für alle `[data-nebel]`, gerechnet erst nach dem Laden). Startseite: `.endo__nebel[data-nebel]`. /ki/: `.nebel-feld` fest hinter der ganzen Seite (drei Lagen, 120/170/230 s).
- Kugel (three.js): Startseite beobachtet erst 0,8 s nach dem Laden (Vorlauf 240 px), /ki/ lädt sie erst nach dem Laden der Seite.

## Scrollen oben auf dem iPhone (25.09.2026, 20:05, Claude Code)
- Emre: „ganz oben buggt es beim Scrollen“. Behoben (auf dem echten iPhone noch zu bestätigen):
  1. Zoom-Sperre: `touchmove`- und `touchend`-Sperren (nicht-passiv) entfernt – sie bremsten jedes Scrollen und brachen schnelles Nachwischen ab (Doppeltipp-Sperre). Jetzt nur Safari-Gesten + CSS `touch-action: pan-x pan-y` auf html und body.
  2. Maske über `.szene__buehne` entfernt (Safari flackert bei Masken über bewegten Ebenen); `.szene__fade` ist jetzt ein 36 % hoher Verlauf in `#070B16`, der Farbe, mit der die Studio-Sektion beginnt.
  3. Nebel der Studio-Sektion beginnt erst unter dem Titelbild (Maske ab 34svh), damit keine Linie entsteht.
- **Regel:** keine nicht-passiven `touchmove`/`touchend`-Listener auf `document` und keine `mask-image` über den Szene-Ebenen.

## Teil 4: Tageswechsel kürzer, „endo Studio“, Kontakt ohne Schritte (25.09.2026, 19:45, Claude Code)
- `js/szene.js`: `ZEIT = 0.6` – `licht(p)` rechnet mit `p / ZEIT`, der ganze Ablauf (Gold, Untergang, Nacht, Mond, Sterne, Hund) passiert auf 60 % der Strecke; volle Nacht und jaulender Hund, solange das Titelbild noch gut zu sehen ist. Sonnenende/Mondstart berücksichtigen `ZEIT`.
- **Name: „endo Studio“** (vorher kurz „ERGUN. Studio“, davor „endo.ai“) – Startseite, /ki/, `pakete.js`, `agent.js`, `api/agent.js`, `endo-daten.js` (`marke`), Datenschutz. Wortmarke: „endo“ (Serif) + „Studio“ (Chrom).
- Kontakt: Stepper entfernt. Neu `.wege` (Neue Website · Bestehende Website · Selbst mitarbeiten mit endo Studio → `#endo`) und darunter **eine** Karte `.anfrage`: Worum geht es? · Name · E-Mail · Land · Telefon · Nachricht · Dateien · Antwort per WhatsApp/E-Mail · Senden. Versand/Upload unverändert, Pflicht: Name + E-Mail.

## Linie am Übergang + Pakete auf Knopfdruck (25.09.2026, 19:10, Claude Code)
- Emre (iPhone-Screenshot): sichtbare Linie zwischen Titelbild und Studio. Ursache: In der ausblendenden Zone des Titelbilds (Maske ab 70 %) lag über der Studio-Sektion noch Seiten-Schwarz, darunter schon deren Blau – plus Mondschein-Hof mit voller Helligkeit an der Oberkante. Lösung: `.endo` schiebt sich jetzt 34svh unter das Titelbild (deckt die ganze Ausblend-Zone), Nebel und Mondschein blenden oben weich ein (Maske ab 10svh).
- Pakete auf der Startseite sind zu (`#pakete[hidden]`), bis man „Pakete ansehen“ (Knopf unter den drei Bereichen) oder oben „Pakete“ antippt; dann klappen sie auf und die Seite springt hin. Zweiter Druck: „Pakete schließen“. Adresse `#pakete` öffnet sie direkt.

## Teil 3 · Schritte 3+4: Pakete übersichtlich, auf der Startseite (25.09.2026, 18:45, Claude Code)
- Gemeinsames Modul `ki/js/pakete.js` + `ki/pakete.css` (Startseite `#pakete` in der Studio-Sektion, /ki/ `#pakete`). Einbinden: `<div data-studio-pakete data-kontakt="#kontakt">` nach `endo-daten.js`.
- Karten: Name, Preis, Credits, „Damit bekommen Sie zum Beispiel“ (ausgerechnet: Credits ÷ Kosten für Produktfoto, Werbevideo 5 s, Website-Titelbild; Mehrzahl-Namen in `endo-daten.js` → `mehrzahl`), Start/Pro „Enthalten“ als eine Zeile, Premium mit Extras (Premium-Punkt). Ein Hauptknopf (Pro, bzw. das gewählte Paket).
- Kosten pro Ergebnis einmal aufklappbar („So viele Credits braucht ein Ergebnis“). Vormerken öffnet sich unter den Karten (Paketwahl, E-Mail, WhatsApp/E-Mail). Unten „Kostenloses Erstgespräch“ → Kontakt.
- Die Funktionswahl mit +/− auf /ki/ ist entfernt (Emre: nicht für jedes Foto Credits sehen). /ki/-Hero: „Pakete ansehen“ + „Kostenloses Erstgespräch“ (`../#kontakt`); Navigation ohne „Funktionen“. Startseite: Navigation „Studio · Pakete · Erstgespräch“.

## Teil 3 · Schritt 2: Nebel statt Sterne im Studio-Bereich (25.09.2026, 18:15, Claude Code)
- `.endo__sterne` + Skript entfernt (Sterne unten ergaben keinen Sinn). Neu `.endo__nebel` mit drei Lagen `.nebel--1/2/3`: Streifen werden einmal per Canvas gerechnet (`nebelBild()`, nahtlos wiederholbar, als `--nebel-1..3` gesetzt) und ziehen per CSS (`nebel-zieht`, 110/160/220 s, eine Lage gegenläufig). Mondschein-Hof links oben (`::before`). Pausiert außerhalb des Bildes (`.endo--sichtbar`), bei „Bewegung reduzieren" still.

## Teil 3 · Schritt 1: Sonne und Mond flüssig (25.09.2026, 18:00, Claude Code)
- `zeichne()` setzt nur noch die Parallaxe direkt; Licht, Sonne, Mond, Sterne und Hund laufen in `licht(p)` über einen weich nachgeführten Wert (`nachfuehren()`, eigene rAF-Schleife, Zeitkonstante 0,2 s) – keine Sprünge mehr bei Mausrad-Schritten.
- Sonne: `SONNE_BIS = 0.31` (vorher 0,28), gleichmäßige Bahn mit sanftem Anfang/Ende; Mond 0,27–0,62, gleichmäßig. Transforms mit 2 Nachkommastellen.

## Teil 2 · Schritte 3–6: ERGUN. Studio in Chrom-Silber, Funktionswahl, Pakete (25.09.2026, 17:15, Claude Code)
- **Umbenannt (Emre): endo.ai → „ERGUN. Studio“.** Der Chat-Assistent heißt weiter **endo**. Adresse bleibt `/ki/`, dazu Weiterleitung `/studio` → `/ki/` (`vercel.json`, `redirects`).
- `ki/index.html` neu (alte Fassung: `_code/archiv/ki-index-vor-chrom-2026-09-25.html`): dunkel, Chrom-Verläufe (`--chrom`, `--chrom-kante`), Serifen-Überschriften, Orange nur als Premium-Punkt. Aufbau: Hero mit Kugel, 1 Satz + Chat → Vorher/nachher → **Funktionen wählen** (`#auswahl`) → **Pakete** (`#pakete`) → Vormerken → Fragen → Fuß. Credit-Fenster bleibt.
- Funktionswahl: Kacheln aus `window.ENDO` (antippen = an/aus, − / + = Menge), Bilanzleiste (sticky) rechnet Credits und das kleinste passende Paket (Premium-Funktion → Premium), die Paketkarte wird markiert und die Auswahl geht in die Vormerk-Nachricht.
- `ki/js/endo-daten.js`: Shop-Bild ist jetzt eine eigene Funktion (`shop`, 5 Credits), Abstimmung mit Emre gehört zu Premium (`kann`), **neues Feld `kaufen` je Paket** = Lemon-Squeezy-Checkout-Link. Leer → Knopf „… vormerken“; gesetzt → „… kaufen“ und Hinweis „Sicherer Kauf über Lemon Squeezy“.
- Startseite: Navigation „Studio“, Titelzeile „Digitalstudio für Webdesign, Produktfotos & Videos“, Studio-Sektion mit Chrom-Schrift, Link „Funktionen und Pakete“ → `ki/#auswahl`. Chat-Texte (`ki/js/agent.js`), Wissen des Assistenten (`api/agent.js`) und Datenschutz Abschnitt 7 auf „ERGUN. Studio“ umgestellt.

## Teil 2 · Schritt 2: weicher Übergang Titelbild → endo (25.09.2026, 16:30, Claude Code)
- `.szene__buehne` hat eine Maske (ab 70 % Höhe weich auslaufend) – keine harte Unterkante mehr, egal wie weit gescrollt ist. `.szene` liegt über der endo-Sektion (z-index 1).
- `.endo` schiebt sich 22svh unter die Szene (`margin-top: -22svh`, Hintergrund `#070B16` → Schwarz), `scroll-margin-top: -16svh` für den Link „endo.ai“.
- `.endo__sterne`: einmal gezeichneter Sternenhimmel, der nach unten verblasst. Kugel steigt beim Hereinscrollen auf (`animation-timeline: view()`, Rückfall: Klasse `.endo--da`).

## Teil 2 · Schritt 1: Titelbild detailreicher (25.09.2026, 16:10, Claude Code)
- Neue Ebene `weit` (sehr ferne, blasse Kette, Tiefe 0,8), zeigt sich in den Lücken der fernen Kette.
- `berg()` hat neue Optionen: `rippen` (Felsrippen/Rinnen schräg vom Grat, Schatten- + Lichtlinie, teils Schnee), `baender` (Felsbänder), `geroell` (Punkte am Fuß); `nebel()` legt flache Nebelschwaden über den Talboden jeder Kette.
- Wald: Bäume mit Volumen (abgewandte Seite dunkler), 3 % kahle Bäume (`kahl`), Büsche am Waldrand (`busch`). Wiese: Steine mit Licht und Kontaktschatten, vereinzelt Blüten; Gras vorne mit einzelnen Samenständen.
- Wolkenschleier (`wolken()`, 3 Lichtstimmungen, halbe Auflösung), halten Abstand zu Sonnenbahn und Mond.
- Messung: Aufbau 65 ms, ca. 21 MB (1024 px).

## Feinschliff Handy + Performance (25.09.2026, 15:40, Claude Code) – Schritt 7 von 7
- Messung (Vorschau-Browser): Szene zeichnen 70 ms (1024 px), 35 ms (Handy 375 px); Grafikspeicher der Leinwände ca. 20 MB; keine Konsolenfehler, kein seitliches Überlaufen. `__szene.bauzeit()` zeigt den Wert.
- Hund: zuerst nur `bilder/hero/hund-steht.webp` (6 KB), die Bildfolge (190 KB) nach dem Laden der Seite; bei „Bewegung reduzieren" gar nicht.
- Alles, was beim Scrollen überblendet wird, hat `will-change: opacity` (eigene Grafikebene, kein Neumalen des Himmels). Wiese und Gras reichen 15 % unter den Rand; neu gezeichnet wird ab 60 px Höhenänderung.
- `bilder/og.jpg` = neue Szene (Goldene Stunde, 1200×630).

## endo-Chat übersichtlicher (25.09.2026, 15:20, Claude Code) – Schritt 6 von 7
- `ki/js/agent.js` (gilt für Startseite und /ki/): Antworten von endo werden formatiert – Absätze, Listen (`-`, `1.`), `Code`, Codeblöcke, **fett**, Links –, nur über DOM-Knoten (`formatiert()`/`zeile()`), nie innerHTML mit fremdem Text. Logik und `/api/agent` unverändert.
- Startseite: beim ersten Antippen rückt der Chat in die Bildschirmmitte (`mittig()`); wächst der Verlauf, scrollt die Seite so weit mit, dass die Eingabe sichtbar bleibt (`eingabeImBild()`); Handy: sichtbare Höhe über `visualViewport` → `--sicht` begrenzt den Verlauf, die Eingabe bleibt über der Tastatur.
- Blasen: endo links (hell auf dunkel), eigene rechts (dunkel auf hell), weiches Einblenden, Tipp-Punkte.

## Titel im Himmel (25.09.2026, 15:05, Claude Code) – Schritt 5 von 7
- `.titel` in der Titel-Ebene: Zeile „Digitalstudio für Webdesign & endo.ai“ (Einordnung, beide Bereiche) und groß „Webdesigner“ (h1, Instrument Serif, bis 10rem). **Kein Slogan** (Emre, 25.09. nachmittags – gilt, auch wenn der Auftrag „Slogan bleibt“ sagte).
- Lage aus dem Skript: `--titel-oben` = 20 % der Bildhöhe (Handy 24 %). Die Sonne startet jetzt darüber (10 %, Handy 13 %) und sinkt durch den Schriftzug; Mond links oben (x 24 %, y 11 %).

## Sterne (25.09.2026, 14:50, Claude Code) – Schritt 4 von 7
- `sterne()` in `js/szene.js`: schwache Sterne (`data-stufe="3"`) und mittlere mit Hof (`"2"`) je auf einer Leinwand, die hellsten 18–46 als `<i>` in `.sterne__hell` mit eigenem Takt (`funkeln`/`funkeln-b`, Dauer 2,4–7 s, zufällige Verzögerung). Farben weiß, warmweiß, bläulich.
- Einblenden: `--sterne` (hellste, p 0,26–0,36) → `--sterne2` (0,32–0,44) → `--sterne3` (0,38–0,52), Milchstraße `--milch` ab 0,42 (körnig, dunkle Staubbahnen, max. 70 % Deckkraft).
- Sternschnuppe alle 18–40 s, nur in voller Nacht und solange das Startbild sichtbar ist. Funkeln pausiert außerhalb des Bildes, bei „Bewegung reduzieren" kein Funkeln und keine Schnuppen.

## Gezeichnete Szene statt Foto-Ebenen (25.09.2026, 14:30, Claude Code) – Schritt 2 + 3 von 7
- `js/szene.js` zeichnet die Landschaft beim Laden auf Canvas: ferne Kette mit Schneeresten und Gesteinsschichten (`fern`), mittlere Kette (`mitte`), Hügel mit fernem Waldsaum (`huegel`), Waldkante mit Nadelbäumen (gestufte Äste, jeder anders) und wenigen Laubbäumen (`wald`), Wiese mit Halmen und dem Schäferhund (`wiese`), Gras vorne in zwei Wind-Gruppen (`gras`, CSS `skewX`).
- Jede Ebene in **3 Lichtstimmungen** (Tag, Gold, Nacht), beim Scrollen nur `opacity`-Überblendung über `--gold`/`--nacht`/`--tag` + `translate3d` (Parallaxe `TIEFE`). Hänge zur Lichtquelle heller (Sonne mittig, nachts Mond links), Lichtkanten auf Graten, Bäumen, Grasspitzen; ferne Ketten heller/blauer (Luftperspektive), Dunst in den Tälern. Kanten bleiben im Umriss (clip), damit die Nacht die Abendfassung ganz deckt.
- Himmel: 4 CSS-Verläufe (Tag, Gold, blaue Stunde, Nacht). Sonne = Kern + Hof + Glut (ohne harten Rand), startet **mittig oben** und sinkt **senkrecht** (Bahn wie 00637db) hinter den Sattel, fertig bei p ≈ 0,26. Mond steigt links auf (p 0,27–0,6).
- Hund: `bilder/hero/hund-silhouette.webp` (Sprite 6×6 aus den 36 Kling-Bildern, 315×360 je Bild), Farbe/Saum folgen dem Licht, Kopf hebt sich bei p 0,40–0,58.
- Prüfen: `?p=0.3` stellt die Tageszeit fest ein (ohne Parallaxe). GSAP wird nicht mehr geladen. Die alten Foto-Ebenen (`bilder/hero/szene-*`, `hund-film/`) sind unbenutzt, liegen aber noch im Projekt.

## Onepager: Hero → endo.ai → Erstgespräch (25.09.2026, 13:45, Claude Code) – Schritt 1 von 7
- Emres Auftrag (Teil 1): ERGUN. = Digitalstudio mit zwei Bereichen, alles untereinander. Pfeil „endo entdecken“, iframe-Ebene (`.endo-ebene`) und Wisch-Skript sind raus.
- Neu `<section class="endo" id="endo">` direkt unter dem Hero: Kugel (`ki/js/orb.js`, wird erst 600 px vor dem Bereich nachgeladen), „Zeigen Sie mir Ihr Produkt.“, derselbe Chat wie auf /ki/ (`ki/js/agent.js`, Markup identisch), drei Bereiche **ohne Preise**, Link „Mehr zu endo.ai“ → `ki/` (bleibt die ausführliche Seite mit Paketen).
- `window.ENDO` liegt jetzt in `ki/js/endo-daten.js` (von /ki/ und der Startseite geladen) – weiterhin die EINE Stelle für Preise und Werkzeuge.
- Kontakt = Fragebogen „Kostenloses Erstgespräch“ in 4 Schritten (`#anfrage.bogen`, `[data-schritt]`): Worum geht es? (geht allein weiter) · Vorhaben + „Was gibt es schon?“ + Dateien · Kontakt + Weg · Übersicht + Senden. Ohne JS stehen alle Schritte untereinander. Versand/Upload wie vorher.
- Datenschutz Abschnitt 7 (`#endo`) nennt jetzt auch die Startseite. `jetzt-veroeffentlichen.ps1` nimmt optional `-Nachricht "…"`.
- Nächste Schritte: Sonne/Mond-Bahn + Licht, Szene als SVG/Canvas-Illustration, Sterne, „Webdesigner“ + Slogan, Chat-Feinschliff, Handy/Performance.

## Hund-Bildfolge statt Bildwechsel (25.09.2026, 07:10, Claude Code)
- Dateien: `bilder/hero/hund-film/NN.webp` (36 Bilder, 676×768, Leinwand-Position in `info.json`: x 1831, y 1894 im 3840×3024-Raster). Neu bauen: `python bilder/hero/4k/szene2/hund_video.py video/v1-9493b609.mp4 0.9 3.4 36` (braucht ffmpeg + rembg, ca. 45 min auf der CPU).
- `<canvas data-hund-film>` in `.hund-film[data-parallax-layer="wiese"]`. `filmLaden()` nach dem Seitenaufbau, `filmLage()` in `messen()` (gleiche Umrechnung wie Sonne/Mond), `zeigeBild(i)` in `render()`: Bild = (p − 0,46) / 0,18. Klasse `.film-an` blendet Tages-, Nacht- und Jaul-Standbild aus (Selektor mit `.parallax__visuals`, sonst gewinnt `.jault`).
- Hund am Handy jetzt an derselben Stelle wie am Desktop (2150 im 3840er Raster), damit eine Bildfolge für beide reicht.
- Tag/Nacht: Nachtbilder `opacity = min(1, n·1,25)`, Tagbilder blenden bei n 0,8–1 aus (sonst Lichtlinie an den Kanten), Tagbilder erst ausblenden, wenn alle Nachtbilder geladen sind.

## Pfeil statt Umschalter, endo mit 3 Bereichen (25.09.2026, 04:40, Claude Code)
- Startseite: `a.seitenpfeil[data-endo-pille]` (fixed, rechts mittig, „endo entdecken“, Linie `.seitenpfeil__linie` mit `linie-ziehen`), Handy: Lasche am Rand ohne Text. Klick → `oeffnen({ klick: true })` (wartet auf das iframe). Umschalter-HTML entfernt (CSS/JS dafür ohne Wirkung).
- endo: `a.seitenpfeil--links` → `../` (im iframe schließt der Klick die Ebene). `.orb` nur noch obere 58 % (Handy 52 %), Kugel füllt bis 66 % davon (`orb.js?v=6`). Hero-Text darunter, `clamp(44px, 6vw, 80px)`. Chat-Feld = Pille (Rand, Glas, weißer Senden-Knopf). `.abo` (Handy-Paketwahl) ausgeblendet und aus dem HTML entfernt, `.preise` auf jeder Breite.
- `window.ENDO`: Pakete 5/40, 20/200, 100/1000; Bereiche foto 5 (extra: Shop-Bild 5), video 20, web 10; Premium video10 40, 3d 50, parallax 30, emre. `api/agent.js` kennt dieselben Zahlen.
- Titelbild-Vorschau: `_test-titel.html?v=v1-d39df812|v2-a6ef78e8|v3-9c9456ed&f=emre|hund` (Dateien in `bilder/hero/4k/titel3/`).

## endo.ai ruhig + Umschalter (25.09.2026, 04:00, Claude Code)
- `ki/index.html`: `window.ENDO` im Kopf = einzige Stelle für Pakete (`credits: null` bis Emre die Higgsfield-Kosten nennt), Werkzeuge, Premium-Liste. Skript vor dem Fuß rendert Funktionen (`[data-funktionen-wahl]`, `[data-funktionen-detail]`), Premium-Ordner, Pakete (`[data-preise]`), Verbrauch und Credit-Fenster (`dialog[data-credit-fenster]`, Knopf `[data-credits-auf]`, Anker `#credits`).
- CSS-Block „Ruhig: Orange nur für Premium“ ersetzt den Neon-Block: `--akzent` ist jetzt Weiß, `--premium` #FF6A1A.
- Chat (`ki/js/agent.js?v=3`): kein Panel mehr (`handyMq` immer aus), höchstens 3 Nachrichten (`SICHTBAR`), ältere `.blase--alt`; Start bei Fokus/Antippen, setzt `html.endo-chat`.
- Kugel `ki/js/orb.js?v=5`: silberweiß.
- Startseite: Umschalter `[data-umschalter]` statt Pille; Klick wartet auf das geladene iframe (höchstens 1,2 s), Übergang 440 ms ohne Schatten. Wisch-Hinweis ohne localStorage.

## Tag → Nacht im Startbild (25.09.2026, 03:10, Claude Code)
- `html.nacht-an` (setzt das Skript „Tag → Nacht“ vor dem Kontaktformular-Skript): `.parallax__header` 250svh (Handy 230svh), `.parallax__visuals` sticky. Ein Wert p (0–1, GSAP ScrollTrigger scrub 0,6 über die angeheftete Strecke) steuert: Sonne `[data-sonne]` Bogen 40° → −14° (p 0,02–0,5), `--abend` (roter Schein), Nachtbilder `.parallax__nacht` Deckkraft (p 0,2–0,55), Mond `[data-mond]` Bogen 196° → 138° (p 0,42–0,8), Sterne (p 0,42–0,7), Sternschnuppen ab p 0,55, `.jault` ab p 0,74.
- Bogen: Mitte = Bildmitte, unten = Horizont (Lage der alten Sonne auf der Leinwand, über `messen()` aus object-fit/object-position gerechnet), Radius 34 % (Handy 36 %) der Breite.
- Parallax beim Wegscrollen: CSS `view-timeline` jetzt auf `.parallax__header`, Bereich `exit 0% exit 100%`.
- Bilder: `szene-<ebene>-nacht-*`, `szene-hund-*`, `szene-hund-jault-nacht-*`. Neu bauen: `ebenen.py` und danach `sonne_weg.py` (Reihenfolge wichtig: `ebenen.py` schreibt den Himmel mit Sonne).
- Intro aus (Kopfskript kehrt sofort zurück, `.loader` entfernt). `h1` ist jetzt `.parallax__claim`.

## Hero-Szene 2: Bergwiese mit Schäferhund, randlos (25.09.2026, 02:30, Claude Code)
- **Ebenen** (von hinten): `szene-himmel` · `szene-fern` · `szene-mitte` · Name (`data-parallax-layer="titel"`) · `szene-wald` · `szene-wiese` (mit Hund) · `szene-gras`. Je `-1920`, `-2560`, `-hoch` (Hochformat: mittlere Hälfte, Hund dort mittig).
- **Leinwand** aller Ebenen: 3840 × 3024 (Szene 3840 × 2160 unten, darüber 864 px Himmel-Überstand). Unten bündig (`object-position: 50% var(--bild-y)`), Breite 104 % (links −2 %). Jede Ebene ist unter ihrer Kante komplett gefüllt (Inpainting der eigenen Farben).
- **Name vor der Sonne:** `--sonne-y` in `.parallax__visuals` rechnet aus, wo die Sonne im Fenster steht (Sonne bei 43,4 % der Leinwand). Breite Fenster (≥ 17:10, ≥ 2:1) schneiden unten mehr ab (`--bild-y` 73 % / 61 %).
- **Parallax** (CSS `animation-timeline`, GSAP-Rückfall): Himmel 78 %, fern 66 %, mitte 52 %, Name 58svh, Wald 34 %, Wiese 14 %, Gras 0 (Handy etwas weniger). Einstieg: `scale` von vorne 1,18 bis hinten 1,03 → 1 (Ursprung unten Mitte).
- **Neu bauen:** `python bilder/hero/4k/szene2/ebenen.py` (braucht `~/.depth/da2s.onnx`, Depth Anything V2 small, und `a-depth.npy`). Grundlage Higgsfield b9cde240 (Szene ohne Hund), Hund aus 7b1ea6d7 (`hund-frei-crop.png`, rembg birefnet). Grenzen: fern 0,02 · mitte 0,3 · wald 0,55 · wiese 1,45 · gras 4,9.
- CSS-Block „Szene 2: Bergwiese mit Schäferhund, randlos“ am Ende des `<style>`. Die alten Ebenen `layer-*` und `--verschub`/`--rahmen` sind ohne Wirkung (Dateien bleiben liegen).
- **Wischen** nur im Einstieg (`imHero()`: Unterkante des Heros unter 45 % Fensterhöhe). endo-Pille oben rechts `[data-endo-pille]` mit Hinweis-Animation `endo-zupfen` (aus bei `html.endo-bekannt`, gemerkt in `localStorage`, und bei `.nav--unten`).
- **endo.ai (`ki/`):** CSS-Block „Neon-Orange“ am Ende; Kugel in `ki/js/orb.js` (und `orb.quelle.js`): Farbe im Shader fest neon, Kameraabstand nach Fenstergröße (`abstand()`), Aufruf `js/orb.js?v=3`.

## Wischen, endo-Pakete, Schäferhund (25.09.2026, 01:37, Claude Code)
- **Wischen:** `.endo-ebene` (fixed, z-index 95) mit `<iframe data-src="ki/">`, dazu `.endo-schatten`. Skript am Ende von `index.html` („Wischen zwischen ERGUN. und endo.ai“): lädt das iframe 2,5 s nach `load` (oder beim Berühren der Pille), hängt nach dem Laden dieselben Wisch-/Pfeil-Handler ins iframe-Dokument, fängt Links `../` und `../#…` in endo ab (schließt die Ebene), `ki/`-Links auf der Startseite öffnen die Ebene. Adresse `#endo` per `pushState`, `popstate` synchronisiert. Ausgenommen vom Wischen: Regler, Textfelder, seitlich scrollende Leisten, `[data-kein-wischen]`.
- **endo (`ki/index.html`):** 3 Pakete (Start, Pro, Premium), Raster 3 Spalten (≤ 860 px eine), Handy-Paketwahl 3 Optionen; Nav + Menü mit Link `../` („ERGUN.“); direkt geöffnet: Wischen nach rechts / Pfeil links → `../`.
- **Ebene 5 = Schäferhund:** `layer-5-person*.webp` (Dateinamen und Maße unverändert) aus `4k/hund/hund_ebene.py` (Quelle `4k/hund/frei-013c9d1f.png`, Higgsfield 013c9d1f, rembg birefnet-general). Höhe 0,5 × Emre, Pfoten bei y 1905 / Mitte x 2090 (4096er Raster). Emres Ebene: `4k/emre-ebene/`.
- **`--verschub`** (Block „Schäferhund auf dem Fels“): Ebenen 2, 4, 5 bekommen `top: calc(-1 * var(--verschub))` (Desktop 25svh + Rand + Pillen-Zone, Handy 10svh + …), damit Fels und Hund in der Fläche stehen.

## Hero als Fläche im endo-Stil (25.09.2026, 01:20, Claude Code)
CSS-Block „Hero als ruhige Fläche im endo-Stil (25.09.)“ am Ende des `<style>`: `--bg: #000`, `--rahmen` (clamp 24–40 px, Handy 12 px), `--pille-zone` (Platz für die Pille im ersten Bildschirm).
`.parallax__header` hat den Rand als Innenabstand, `.parallax__visuals` ist `calc(100svh - Rand - Pillen-Zone)` hoch, `border-radius: 24px` (Handy 20 px), `isolation: isolate`.
`.parallax__layers` bleibt 125svh (Handy 110svh) hoch – die Fläche schneidet nur ab, die Abstimmung Sonne/Name/Emre bleibt gleich.
`.parallax__fade` und `.parallax__hint` ausgeblendet. Nav sitzt innerhalb der Fläche. `.nav__pille` ist aus dem HTML entfernt (CSS noch da, ohne Wirkung);
neu `a.hero-endo` „Mit endo.ai sprechen“ unter der Fläche, blendet im Einstieg mit der Nav ein. `_test-hero.html` = Testkopie ohne Intro (wird nicht veröffentlicht).

Eine HTML-Datei, kein Build, nichts von fremden Servern. Aufbau nach der Osmo-Parallax-Vorlage:
riesiger Name „ERGUN." oben, Sonne dahinter, Emre selbst auf dem Felsgrat davor, Berge schieben sich
beim Scrollen über den Namen. Danach direkt die Pakete, dann Kontakt mit Formular.
**Live: https://website-ergun.vercel.app** (Vercel, automatisch aus GitHub `logodropde-max/Website-Ergun.`). Doppelklick auf `index.html` zeigt den lokalen Stand.

## Sonnenuntergang → endo.ai (25.09.2026, Claude Code) – ZURÜCKGENOMMEN, Beschreibung der archivierten Fassung
Plan: `08 Projekte/Plan Sonnenuntergang endo.md`. Die Startseite ist jetzt **eine angeheftete Szene** (`.szene` → `.buehne`, `position: sticky`, 100svh),
in der beim Scrollen die Geschichte abläuft. Danach kommt nur noch der Footer. Der eigene Kontaktbereich unten ist weg.

**Ebenen in der Bühne (von hinten nach vorn):** Himmel ohne Sonne (`layer-1-sky-ohne-sonne`) · Himmel blaue Stunde (`layer-1-sky-blaue-stunde`, `[data-blaue-stunde]`, Deckkraft 0 → 1)
· **Sonne als eigene Ebene** (`sonne`, `[data-sonne]`, `mix-blend-mode: screen`, gleiche Geometrie wie der Himmel) · Bergkamm · Name · Vordergrund · Emre · `.parallax__fade`
· `.nacht` (blauer Abendton, Deckkraft 0 → 1) · **Karte** `.karte#kontakt` (Glas, enthält das bekannte Formular `form#anfrage`) · `.gluehen` (Restglühen) · **`.endo#endo`** (endo.ai-Hero, `clip-path: circle()`).

**Bilder:** `bilder/hero/4k/sonnenuntergang.py` erzeugt alle drei Ebenen in 4096 / 2560 / 1920 / 960 / -hoch.
- `layer-1-sky-ohne-sonne` = bisheriger 4K-Himmel, Sonne + Halo lokal entfernt; die Füllung kommt aus Higgsfield **e513859b** (Himmel ohne Sonne, 2K, je Zeile farblich an den alten Himmel angeglichen).
- `sonne` = so berechnet, dass **screen(ohne Sonne, Sonne) = alter Himmel** (Abweichung 0) → das Startbild ist pixelgleich wie vorher. Higgsfield **b885ddf3** (Sonne auf Schwarz) war deutlich orangener und härter als die bisherige Sonne und blieb deshalb Reserve.
- `layer-1-sky-blaue-stunde` = Higgsfield **513be3a4** (2K) auf 4096×2323 hochgerechnet (weicher Himmel, fällt nicht auf). Die fernen Berge fehlen darin, sind aber ohnehin komplett hinter dem Bergkamm.
- Die im Auftrag genannten „4K-Himmel d0fdbca7 + 84f2d88f“ gibt es weder im Vault noch in der Higgsfield-Historie – es gab nur die 2K-Fassungen.

**Ablauf (GSAP ScrollTrigger, `scrub: true`, Zeiten in Scroll-Pixeln, h = Bühnenhöhe):**
- Desktop (Karte rechts neben Emre, `right: var(--pad)`, unter 1400 px Rand 24 px; 901–1100 px unter dem Namen): passt die Karte nicht ganz auf den Bildschirm, kommt der Rest 1:1 mit dem Scrollen hoch (T px) · 0,3 h Ruhe · 1,2 h Sonne sinkt (`yPercent 27`), Name wandert 18 % nach unten, Kamm 4 % hoch, blaue Stunde ab 0,3 h, Nacht ab 0,5 h, Karte blendet bei 0,95 h aus · 0,35 h Sonne aus, Glühen sammelt sich (Skalierung 0,15 → 0,67) · 0,7 h Kreis wächst (`circle(0 → R)`, Glühen wächst mit = leuchtender Rand) · 0,25 h Nachlauf. Gesamt ≈ 2,8 h.
- Handy (≤ 900 px): **kein Kasten** – die Seite geht unter Emre weiter: der Kopf (`--karte-kopf` = 104 px: Etikett + „Projekt anfragen“) steht schon am Start auf einem dunklen Verlauf (`.karte` mit `top: calc(100% - 104px)`, Verlauf transparent → 0,95), der Rest kommt 1:1 mit dem Scrollen hoch, bis das ganze Formular unter der Leiste steht (T = Formularhöhe − 104 px; Ebenen rücken leicht hoch, Name blendet auf 12 %) · 0,6 h Ruhe zum Ausfüllen · 0,3 h Formular geht, Name wieder da · 1 h Sonne sinkt (20 %) + blaue Stunde · 0,3 h Glühen · 0,6 h Kreis · 0,2 h Nachlauf. Gesamt ≈ 3,8 h. Kompakt: Land + Telefon nebeneinander, Antworten 2×2, Intro/Hinweis ausgeblendet – auf 390×844 passt alles auf einen Bildschirm (758 px).
- Kreis-Mitte: Desktop 50 % / 52 %, Handy 50 % / 42 % (dort verschwindet die Sonne hinter dem Kamm).
- Nur `transform`, `opacity`, `clip-path`. Die frühere CSS-Parallax (`animation-timeline: view()`) ist raus – eine Bewegung, ein System.
- **Ein** ScrollTrigger (`trigger: .szene`, `start: top top`, `end: bottom bottom`), die Timeline `szeneTl` wird bei `refreshInit` nur geleert und neu befüllt (`baueSzene`). Nie killen und neu anlegen – dabei ging der Scroll-Listener verloren.
- Während die Karte unter der Leiste liegt: `.nav--karte` (Desktop: „Projekt anfragen“ blendet aus, Handy: Leiste bekommt einen dunklen Verlauf).
- `karte.inert` sobald sie weg ist, `endo.inert` bis der Kreis offen ist (Tastatur landet nicht in Unsichtbarem).

**endo.ai auf der Startseite:** `ki/js/orb.js` wird 2,5 s nach dem Laden (oder ab 50 % Szene) nachgeladen; die Kugel liegt bis 55 % außerhalb (`translateY(-300vh)`), damit sie nicht unsichtbar rechnet.
`ki/js/agent.js` läuft auf der Startseite mit `data-eigene-sichtbarkeit`: die Szene sagt ihm per Ereignis `endo:zeigen`, wann der Chat startet (Desktop) bzw. die Pille erscheint (Handy, Klasse `agent--weg`). `/ki/` bleibt unverändert erreichbar.
**Umschalter** `ERGUN · endo.ai` in der Leiste (`[data-wechsel]`, `aria-current`): springt sanft an den Anfang bzw. ans Ende der Szene. „Projekt anfragen“ springt zur Karte und setzt den Fokus ins Namensfeld.
**Bewegung reduziert / kein JS:** alles untereinander als Standbilder (Hero → Karte → endo), Umschalter springt per Anker; `html.hat-js` steuert den No-JS-Fall.
**Offen:** iPhone-Test (Tastatur im angehefteten Formular – Ruhe-Bereich ist 60 svh breit). `_test.html` = Testkopie ohne Intro (`?p=0…1` setzt die Szene), wird nicht veröffentlicht (`_*.html`).

**Prüfen (Headless-Edge, seit 25.09.):** Edge schreibt die Datei erst nach dem Rückkehren des Befehls (warten, bis sie da ist), Python braucht `C:/…`-Pfade, Handy 390 px funktioniert mit
`--window-size=390,844 --force-device-scale-factor=2`. Zum Scrollen NICHT `scrollTo` (Aufnahme geht schief), sondern die Testkopie mit `?p=` benutzen. WebGL-Kugel und Chat erscheinen headless nicht rechtzeitig – im echten Browser geprüft. In der Claude-Browser-Vorschau steht `requestAnimationFrame` oft still (Fenster verdeckt): dann bewegt sich beim Scrollen nichts, `ScrollTrigger.update()` zeigt trotzdem den richtigen Stand – kein Fehler der Seite.

## Dateien
| Datei | Wofür |
|---|---|
| `index.html` | die Startseite: Hero (Parallax) · Kontaktformular · Footer; endo.ai-Pille oben rechts (seit 25.09. 00:28) |
| `impressum.html` | vorausgefüllt mit ERGUN. – **prüfen** (Gewerbebezeichnung, E-Mail) |
| `datenschutz.html` | **Entwurf** ohne Cookies/Google Fonts, mit WhatsApp-Hinweis – rechtlich prüfen lassen |
| `js/gsap.min.js`, `ScrollTrigger.min.js` | Intro, Einblenden, Paket-Vorschauen, lokal. `ScrollSmoother.min.js` liegt noch im Ordner, wird aber **nicht mehr geladen** (natives Scrollen) |
| `schriften/*.woff2` + Lizenzen | Instrument Serif + Geist, lokal (OFL) |
| `bilder/hero/layer-1-sky.webp` | Himmel mit Sonne, 4K (Higgsfield 81ed3e59, Szene 24f533ae) – wieder Ebene 1 |
| `bilder/hero/layer-1-sky-ohne-sonne*.webp` | Himmel ohne Sonne (aus layer-1-sky + Higgsfield e513859b) – nur für die archivierte Szene |
| `bilder/hero/sonne*.webp` | Sonne + Halo auf Schwarz, `mix-blend-mode: screen`, sinkt beim Scrollen |
| `bilder/hero/layer-1-sky-blaue-stunde*.webp` | Himmel blaue Stunde (Higgsfield 513be3a4), blendet beim Scrollen ein |
| `bilder/hero/layer-2-ridge.webp` | Bergkamm, 4K freigestellt (Higgsfield d80d7fb2) |
| `bilder/hero/layer-4-foreground.webp` | Vordergrund-Felsen mit Tannen, 4K freigestellt (Higgsfield 158ed469) |
| `bilder/hero/layer-5-person.webp` | **Emre**, aus Higgsfield-Job b305a018 („Emre V4", 2688×1520) lokal freigestellt; eigene Leinwand **5459×3096**, damit seine 1455 Quellpixel Höhe 1:1 bleiben; 47 % Bildhöhe, Füße bei 80 % |
| `bilder/hero/*-1920.webp`, `*-2560.webp` | Querformat: `srcset` 1920/2560. Die 4K-Dateien ohne Endung werden **nicht mehr geladen** (zu viel Grafikspeicher, ruckelte) |
| `bilder/hero/*-960.webp` | kleine Ebenen für die Mini-Szene in der Paketkarte |
| `bilder/hero/*-hoch.webp` | **Hochkant-Variante** (mittlere 50 % Breite, volle 4K-Höhe, 2048×2323) – kommt per `<picture><source media="(orientation: portrait)">`, also ohne Doppel-Download; Person seit 23.09. ebenfalls 2048×2323 (Original `4k/layer-5-person-hoch-3096.webp`); ohne sie wäre das Bild am Handy bis 3-fach hochgerechnet |
| `bilder/hero/4k/` | Originale (PNG/WebP-Quellen), per .gitignore ausgeschlossen |
| `bilder/og.jpg` | Vorschaubild fürs Teilen (1200×630, aus dem Hero gerendert) |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | eigener Vierstern als Icon |

## Ebenen und Bewegung
| Ebene | Tempo beim Scrollen | Besonderheit |
|---|---|---|
| 1 Himmel + Sonne | 70 | am Desktop um 15 % nach oben versetzt (`.parallax__layer-img--sky`), damit die Sonne frei zwischen Name und Emre steht; am Handy −14 % |
| 2 Bergkamm | 55 | |
| 3 Name „ERGUN." | 52 | sitzt oben (`padding-bottom: 54svh`), wandert beim Scrollen hinter Person und Felsen |
| 4 Vordergrund | 12 | |
| 5 Emre | 12 | gleiches Tempo wie der Fels, damit die Füße stehen bleiben; Position steckt im Bild selbst (kein CSS-Versatz mehr) |

**Auftritt beim Laden (ruhig, ca. 2,5 s):** Vorhang mit nur „E." (Punkt orange, kein Leuchten), sobald die Hero-Bilder da sind (höchstens 2,5 s warten)
entfaltet es sich zu „ERGUN.", der dunkle Grund blendet aus und der Name gleitet exakt auf den Hero-Titel (FLIP). Ebenen setzen sich nur 16–24 px. Notbremse 5 s.
Keine Schein-Sonne im Intro mehr: Emre fand, dass die Sonne beim Öffnen rechts (am Punkt) und danach mittig stand.

**Parallax läuft im Browser selbst** (CSS `animation-timeline: view()`, Bereich `exit-crossing`, Eigenschaft `translate`): kein JavaScript pro Bild, kein Zittern.
Browser ohne diese Technik (z. B. Firefox) bekommen dieselbe Bewegung per GSAP ScrollTrigger. Kein ScrollSmoother mehr – Scrollen ist nativ (Emre: „laggt zu sehr").
**Emre (Ebene 5) seit 23.09.:** in die Szene gerechnet von Higgsfield (`4k/szene-94d2b705.png`, Körperbau nach Emres Fotos, auf 93 % verkleinert = 1,77 m), **Endstand:** `4k/hals_v1.py` = Ebene aus Commit 64c4e37 (`4k/ref-v1-layer.webp`: echter Kopf + echter Hals) + nur der Hals aus Higgsfield-Job 8c679bd9 (`4k/halsv1-8c679bd9.png`). `einsetzen.py` NICHT mehr ausführen (würde die Ebene überschreiben). Verworfen: `gesicht_nur.py`, `szene-hals.png`, `echtes_gesicht.py`, eingesetzt mit `bilder/hero/4k/einsetzen.py` (Freistellen, Boden unter den Schuhen, alle Größen). `licht.py` gilt nur noch für die alte Figur. Montagespuren an Kamm und Vordergrund: `4k/reparatur.py`.
Handy: Bewegung × 0,6. `prefers-reduced-motion`: Standbild.

## Was am 23.09. zuletzt gemacht wurde (Claude Code)
- Foto von Emre = Higgsfield-Job b305a018 (2688 px, nicht die 2000er-Kopie): Weiß per Flutfüllung von allen Rändern entfernt, reines Weiß zwischen den
  Beinen zusätzlich gekeyt, Haarkante nur 1 px erodiert, Schuhe mit weichem Felsstück darunter behalten
- Person auf natürliche Größe gebracht (Kopf bei 34 %, Füße bei 80 % der Bildhöhe); alte Person-Ebene ersetzt
- alle Hero-Ebenen 4K (4096×2323) + 1920er-Varianten, `srcset` und korrekte `width`/`height` in `index.html`
- Himmel-Versatz −26 % am Desktop eingestellt, OG-Bild neu gerendert
- Impressum und Datenschutz auf ERGUN. umgestellt
- `hole-bilder.ps1` gelaufen (29 PNGs in `05 Higgsfield-Assets/Bilder/`), WebP-Kopien der vier Ebenen dort

## Das musst du noch entscheiden / prüfen
| Was | Wo |
|---|---|
| Eigene Domain (aktuell https://website-ergun.vercel.app) | Vercel → Domains; danach `og:image`/Canonical in `index.html` anpassen |
| Datenschutz rechtlich prüfen lassen | `datenschutz.html` |
| Gewerbebezeichnung im Impressum | `impressum.html` |
| Preise (80 / 250 / 400 € + 10 / 20 / 35 € im Monat) endgültig? | `index.html`, Abschnitt Pakete · `02 Preise` |

## Prüfung
- Desktop 1440 und 1024: Hero gerendert (Name lesbar über dem Kopf, Sonne hinter dem Namen, Füße auf dem Fels)
- Handy 390 (Hochformat): lädt die `-hoch`-Ebenen, Skalierung 0,94× bei 2-fach-Display – kein Weichzeichnen mehr; Screenshot geprüft
- Anti-Slop-Scan: sauber (Textverlauf im Titel entfernt) · Motion-Audit: nur die wachsende Hover-Unterstreichung (Fehlalarm)
- Scroll-Ruhe am Handy: keine `mix-blend-mode`/`filter`-Effekte mehr auf bewegten Elementen, damals `normalizeScroll` in ScrollSmoother – seit 23.09. abends ersetzt durch natives Scrollen + CSS-Parallax
- Sonne: lokal nachbearbeitet (`bilder/hero/4k/sky-sonne-v2.png` ist die Quelle) – weicher Rand, heller Kern, dreistufige Glut
- Lighthouse: noch nicht gelaufen (braucht `npx lighthouse`, Download)

## Online stellen (GitHub + Vercel)
Nur dieser Ordner gehört ins öffentliche Repo – **nicht der ganze Vault** (Notizen, Preise, Impressum-Daten, Fotos).
Hochladen: `index.html`, `impressum.html`, `datenschutz.html`, `favicon*`, `apple-touch-icon.png`, `js/`, `schriften/`,
`bilder/hero/*.webp`, `bilder/og.jpg`. Ordner `bilder/hero/4k/` und alle PNG weglassen. Plan: `08 Projekte/Deployment.md`.

## Pakete & Kontakt (Stand 23.09., Claude Code)
- Paketvorschauen zeigen **erfundene Beispiel-Kunden** (Etikett „Beispiel · …"): Onepager = Produkt-Verkaufsseite „Ambra No. 7" (Handy scrollt, `bilder/demo/onepager.webp`), Business = Café „Morgenrot" mit 5 Unterseiten (`bilder/demo/cafe-*.webp`), Individuell = Sternwarte „Nachtblau": Milchstraße dreht und zieht langsam hinter der freigestellten Person mit Teleskop (`bilder/beispiele/kosmos-*.webp`, GSAP, nur wenn sichtbar). Neu bauen: `bilder/hero/4k/beispiele/bauen.py` (Server Port 8789). Fotos: Higgsfield GPT Image 2.5, siehe Galerie. `demos_rendern.py` ist veraltet. Dazu Scroll-Parallax pro Vorschau über `tiefe()` im Skript (Werte in px, hinten mehr als vorn).
- Hero-Zeile heißt nur **„Webdesigner"** und steht **über** dem Namen (`.parallax__rolle { order: -1 }`); auf der Sonne war sie unlesbar. „Elmshorn" steht nur noch in der Google-Beschreibung (Meta) und im Impressum.
- Kontakt: Porträt mit „Emre Ergun · ● online", Paket-Chips, Wünsche zum Ankreuzen, Prüfung beim Verlassen eines Feldes. Die WhatsApp-Live-Vorschau ist seit 23.09. entfernt (das Skript fragt `[data-vorschau]` noch ab, ist aber ohne sie sicher).
- Intro: Start mit „E.", der Punkt zieht nach rechts und jeder Buchstabe steigt auf, wenn der Punkt an ihm vorbei ist (`aufdecken()` im Intro-Skript), dann blendet die Szene auf.
- Pakete: jede Karte hat unten `.pkg__abo` (Monatspreis für Hosting, Domain & Pflege: 10/20/35 €). Pakete (24.09.): nichts mehr mit Google; Effekte als eine Zeile (Parallax-Tiefe, Scroll- & Einblend-Animationen); Pflege-Kästen gleich aufgebaut, jede Liste vollständig (kein „Alles aus …"); Karten per CSS-Subgrid auf gleiche Zeilenhöhen; Vertrauenszeile unter den Paketen entfernt. Person-Ebene: Loch am Hals (Kinnlinie links) in `layer-5-person-1920/-2560/-hoch.webp` gefüllt. Kein Startup-/Extras-Bereich mehr (Emre, 23.09.: nur Pakete und Kontaktformular). Das Formular ist ein Fragebogen mit 4 nummerierten Schritten (`.schritt`): 01 Paket · 02 Name/Firma/E-Mail · 03 Worum geht es? · 04 Dateien. Pakete: feste Inhalte, keine Fristen. Formular: Dateifeld `dateien` (Vorschau `[data-datei-liste]`); seit 24.09. Upload beim Auswählen, Links in der Nachricht (siehe „Datei-Upload"). Hero-Claim `.parallax__claim` über dem Namen. Formular: Checkboxen `extras` = „Wünsche". Keine eigenen Hosting-/Extras-Abschnitte (Emre wollte es in den bestehenden Sachen). Preise: `02 Preise/Pakete & Preise.md`.
- Porträt im Kontakt: `bilder/kontakt/emre-264.webp` / `-144.webp`, erzeugt mit `bilder/hero/4k/portrait.py` aus `03 Marke/emre-portrait-original.jpg`. Glut, Goldschein und Lichtkreis-Maske wurden am 23.09. entfernt (zu viele Effekte, ruckelte).
- Berge: `bilder/hero/4k/berge.py` füllt den Fuß des Kamms und gleicht Kamm und Vordergrund an. Originale liegen als `*-vor-angleich.webp` in `4k/`.
- Schritt 04 „Dateien": Hochladefläche `.upload` mit Symbol, echtes `input[type=file]` unsichtbar darüber, Drag-Hervorhebung `.ist-drueber`.

## Änderungen 24.09. (Chat, direkt auf GitHub `main`, jetzt auch hier im Vault)
- Hero-Claim nur noch „Faire Preise für gute Arbeit." (PR #1).
- Sonne hinter dem Namen: `.parallax__layer-img--sky { top: -27% }` (Handy −20 %). Gegenlicht per Filter: Ebene 2 `brightness(.8) saturate(.9) contrast(1.04)`, Ebene 4 `brightness(.85) saturate(.95)`, Ebene 5 (Emre) `brightness(.94) contrast(1.04) saturate(.94) sepia(.06)`. Block „Feinschliff Hero (24.09.)" am Ende des `<style>`.
- Pakete nach Oberthemen: `li.pkg__punkt` mit `span.pkg__kat` (Design · Bilder & Videos · Animation · Funktionen · Teilen · Service) + `span.pkg__text`. Hinweis über den Karten mit `.packages__immer` („In jedem Paket: für Handy, Tablet & PC · ohne Cookies · Impressum & Datenschutz-Vorlage"). Inhalte = `02 Preise/Pakete & Preise.md`, Abschnitt „Stand 24.09.".
- WhatsApp-Knopf: `window.open(waLink,'_blank')` **ohne** `'noopener'` (sonst immer `null` → falsche Fehlermeldung), danach `win.opener = null`; blockiert → `location.href = waLink`.
- PR #2 (Datei-Upload mit Vercel Blob): siehe „Datei-Upload im Formular".
- **Abends:** Kontakt = Stepper-Fragebogen (`.bogen`, `[data-schritt]`, `data-auto` = Einfachauswahl springt weiter, `[data-zeige-bei="bisher:Ja"]`, JS setzt `.ist-stepper`; ohne JS alles untereinander). 7 Schritte (keine Paket-Frage) inkl. „Erstgespräch – wie am liebsten?" und Telefon optional. Pflicht nur Name + E-Mail. CSS-Block „Fragebogen Schritt für Schritt (24.09.)".
- **24.09. 20:54 (Commit 4db4027): Fragebogen wie ein Beratungsgespräch.** Neue Namen: `ziel` (Radio), `kunde`, `wirkung` (Radio), `staerke` + Textfeld `besonders`, `vorhanden` (mit „Eine Website" → `[data-zeige-bei="vorhanden:Eine Website"]` Feld `alt`), `vorbild`, `dateien`, `gespraech`. Schritt 07: `.mitnahme` / `[data-mitnahme-liste]` (Zusammenfassung). Nach dem Senden: `.abschluss` (`[data-abschluss]`, Form bekommt `.ist-fertig`), `.ablauf` mit drei Schritten. Gestrichen: `wann`, `text`, `bisher`, `stil`. CSS-Block „Fragebogen wie ein Beratungsgespräch (24.09. abends)" am Ende des `<style>`. Alte Klassen `.bogen__antworten` ohne Wirkung.
- **24.09. 21:10: Fragebogen als Tabelle** – auf Emres Wunsch um 21:30 wieder zurückgenommen (Stand 4db4027 als Basis).
- **24.09. 21:30: Fragen verbessert, übersichtlicher.** Wieder Stepper, jetzt **8 Schritte**. Neue Namen: `anliegen` (Radio, „Meine jetzige Seite erneuern“ → `[data-zeige-bei="anliegen:Meine jetzige Seite"]` Feld `alt`), `ziel`, `kunde`, `wirkung` + `vorbild` (kein Auto-Weiter), `staerke` + `besonders`, `vorhanden` (ohne „Eine Website“) + `dateien`, `gespraech`, Kontakt. Auto-Weiter nur, wenn im Schritt kein Zusatzfeld sichtbar wird. CSS-Block „Fragebogen übersichtlicher (24.09. nachts)“: `.schritt .chips` als 2-Spalten-Raster, ≤ 520 px eine Spalte.

## Kontakt einfach (Stand 24.09. nachts, Claude Code)
Der Fragebogen mit Schritten ist ersetzt durch **ein übersichtliches Formular** in einer Karte (`form#anfrage.anfrage`):
1. Weg wählen: WhatsApp oder E-Mail (`input[name=weg]`, `.weg__option`). Der Senden-Knopf folgt der Wahl (Text, Symbol, Farbe).
2. Name + E-Mail-Adresse (Pflicht), Land (`select#f-land`, alle 27 EU-Länder + „Anderes Land", Standard Deutschland) + Telefon (optional, Platzhalter zeigt die Vorwahl des Landes).
3. „Wobei brauchen Sie Hilfe?": Neue Website · Website-Redesign · Onlineshop (E-Commerce) · Anderes (`input[name=hilfe]`).
4. „Ihre Anfrage" (Textfeld), Dateien (optional, Upload wie unten), Senden.
Darunter E-Mail/Telefon (`.contact__meta`) und der Agentur-Text (`.agentur`): „ERGUN. ist eine Premium-Digitalagentur für Websites auf Weltklasse-Niveau …".
CSS-Block „Kontakt einfach (24.09. nachts)" am Ende des `<style>`. Die alten Fragebogen-Styles (`.schritt`, `.bogen`, `.abschluss` …) stehen noch im CSS, werden aber nicht mehr benutzt.

## Datei-Upload im Formular (Stand 24.09., Claude Code)
WhatsApp-Links (`wa.me`) können nur Text tragen. Deshalb lädt das Kontaktformular (Dateifeld `dateien`) gewählte Dateien sofort hoch und schreibt die Links in die Nachricht.
- `api/upload.js`: Vercel-Funktion, nimmt eine Datei pro Aufruf an (höchstens 4 MB; Endungen jpg, png, webp, gif, heic, svg, pdf, doc, docx, ai, zip) und legt sie öffentlich unter `anfragen/` in Vercel Blob ab.
- Fotos über 3,5 MB verkleinert der Browser vorher auf höchstens 2560 px als JPEG.
- Scheitert ein Upload (z. B. lokal per Doppelklick ohne Server), steht die Datei als „bitte selbst anhängen" in der Liste und nur ihr Name in der Nachricht.
- `api/aufraeumen.js`: täglicher Vercel-Cron (`vercel.json`, 3 Uhr UTC) löscht Dateien, die älter als 30 Tage sind.
- **Einrichtung einmalig in Vercel:** Projekt → Storage → Create → Blob, Zugriff **Public**, mit dem Projekt verbinden. Dadurch entsteht `BLOB_READ_WRITE_TOKEN`. Danach einmal neu deployen. Optional `CRON_SECRET` als Umgebungsvariable setzen.
- Datenschutz: Abschnitt 6 in `datenschutz.html` beschreibt den Upload.

## Notizen für Obsidian (ab 24.09.)
- Übersicht mit allen Verbindungen für die Graph-Ansicht: [[ERGUN Website (Übersicht)]]
- Claude Code pflegt Projekt-Notizen im Ordner `notizen/` (z. B. „KI-Studio mit Higgsfield"). Per `git pull` landen sie im Vault.
- `.vercelignore` hält `notizen/` und diese LIESMICH von der Live-Website fern. Achtung: Das GitHub-Repo selbst ist öffentlich.
- Absprache: Änderungen von Claude gehen immer direkt auf `main`, Vercel veröffentlicht sie automatisch.
