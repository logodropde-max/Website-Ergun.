# Agentur-Website ERGUN. – Stand 23.09.2026 (Claude Code, nach der 4K-Runde)

Eine HTML-Datei, kein Build, nichts von fremden Servern. Aufbau nach der Osmo-Parallax-Vorlage:
riesiger Name „ERGUN." oben, Sonne dahinter, Emre selbst auf dem Felsgrat davor, Berge schieben sich
beim Scrollen über den Namen. Danach direkt die Pakete, dann Kontakt mit Formular.
**Live: https://website-ergun.vercel.app** (Vercel, automatisch aus GitHub `logodropde-max/Website-Ergun.`). Doppelklick auf `index.html` zeigt den lokalen Stand.

## Dateien
| Datei | Wofür |
|---|---|
| `index.html` | die Startseite: Hero · Pakete · Kontaktformular · Footer (Version 3) |
| `impressum.html` | vorausgefüllt mit ERGUN. – **prüfen** (Gewerbebezeichnung, E-Mail) |
| `datenschutz.html` | **Entwurf** ohne Cookies/Google Fonts, mit WhatsApp-Hinweis – rechtlich prüfen lassen |
| `js/gsap.min.js`, `ScrollTrigger.min.js` | Intro, Einblenden, Paket-Vorschauen, lokal. `ScrollSmoother.min.js` liegt noch im Ordner, wird aber **nicht mehr geladen** (natives Scrollen) |
| `schriften/*.woff2` + Lizenzen | Instrument Serif + Geist, lokal (OFL) |
| `bilder/hero/layer-1-sky.webp` | Himmel mit Sonne, 4K (Higgsfield 81ed3e59, Szene 24f533ae) |
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

## Datei-Upload im Formular (Stand 24.09., Claude Code)
WhatsApp-Links (`wa.me`) können nur Text tragen. Deshalb lädt das Formular gewählte Dateien sofort hoch und schreibt die Links in die Nachricht.
- `api/upload.js`: Vercel-Funktion, nimmt eine Datei pro Aufruf an (höchstens 4 MB; Endungen jpg, png, webp, gif, heic, svg, pdf, doc, docx, ai, zip) und legt sie öffentlich unter `anfragen/` in Vercel Blob ab.
- Fotos über 3,5 MB verkleinert der Browser vorher auf höchstens 2560 px als JPEG.
- Scheitert ein Upload (z. B. lokal per Doppelklick ohne Server), steht die Datei als „bitte selbst anhängen" in der Liste und nur ihr Name in der Nachricht.
- `api/aufraeumen.js`: täglicher Vercel-Cron (`vercel.json`, 3 Uhr UTC) löscht Dateien, die älter als 30 Tage sind.
- **Einrichtung einmalig in Vercel:** Projekt → Storage → Create → Blob, Zugriff **Public**, mit dem Projekt verbinden. Dadurch entsteht `BLOB_READ_WRITE_TOKEN`. Danach einmal neu deployen. Optional `CRON_SECRET` als Umgebungsvariable setzen.
- Datenschutz: Abschnitt 6 in `datenschutz.html` beschreibt den Upload.
