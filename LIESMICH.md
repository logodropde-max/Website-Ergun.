# Agentur-Website ERGUN. – Stand 25.09.2026, 02:30

> **Aktuell live:** die Seite von 138c7c9 (Hero mit Parallax → Kontaktformular → Footer), plus **endo.ai als Pille oben rechts** (`.nav__pille`, CSS-Block am Ende des `<style>`).
> Die Scroll-Szene „Sonnenuntergang → endo.ai“ (Abschnitt unten) war am 25.09. von 00:22 bis 00:28 live und wurde auf Emres Wunsch zurückgenommen.
> Ihr Code liegt in `_code/archiv/index-sonnenuntergang-endo-2026-09-25.html` (Vault-Commits beebffe, 007bc5b); die Bilder `sonne*`, `layer-1-sky-ohne-sonne*`, `layer-1-sky-blaue-stunde*` und `4k/sonnenuntergang.py` bleiben im Projekt (unbenutzt).

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
