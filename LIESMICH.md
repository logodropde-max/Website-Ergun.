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
| `js/gsap.min.js`, `ScrollTrigger.min.js`, `ScrollSmoother.min.js` | Bewegung + weiches Scrollen, lokal |
| `schriften/*.woff2` + Lizenzen | Instrument Serif + Geist, lokal (OFL) |
| `bilder/hero/layer-1-sky.webp` | Himmel mit Sonne, 4K (Higgsfield 81ed3e59, Szene 24f533ae) |
| `bilder/hero/layer-2-ridge.webp` | Bergkamm, 4K freigestellt (Higgsfield d80d7fb2) |
| `bilder/hero/layer-4-foreground.webp` | Vordergrund-Felsen mit Tannen, 4K freigestellt (Higgsfield 158ed469) |
| `bilder/hero/layer-5-person.webp` | **Emre**, aus Higgsfield-Job b305a018 („Emre V4", 2688×1520) lokal freigestellt; eigene Leinwand **5459×3096**, damit seine 1455 Quellpixel Höhe 1:1 bleiben; 47 % Bildhöhe, Füße bei 80 % |
| `bilder/hero/*-1920.webp` | Querformat-Variante für kleinere Bildschirme (`srcset`) |
| `bilder/hero/*-hoch.webp` | **Hochkant-Variante** (mittlere 50 % Breite, volle 4K-Höhe, 2048×2323) – wird per Skript geladen, sobald das Gerät im Hochformat ist; ohne sie wäre das Bild am Handy bis 3-fach hochgerechnet |
| `bilder/hero/4k/` | Originale (PNG/WebP-Quellen), per .gitignore ausgeschlossen |
| `bilder/og.jpg` | Vorschaubild fürs Teilen (1200×630, aus dem Hero gerendert) |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | eigener Vierstern als Icon |

## Ebenen und Bewegung
| Ebene | Tempo beim Scrollen | Besonderheit |
|---|---|---|
| 1 Himmel + Sonne | 70 | am Desktop um 26 % nach oben versetzt (`.parallax__layer-img--sky`), damit die Sonne hinter dem Namen steht; am Handy −14 % |
| 2 Bergkamm | 55 | |
| 3 Name „ERGUN." | 52 | sitzt oben (`padding-bottom: 54svh`), wandert beim Scrollen hinter Person und Felsen |
| 4 Vordergrund | 12 | |
| 5 Emre | 12 | gleiches Tempo wie der Fels, damit die Füße stehen bleiben; Position steckt im Bild selbst (kein CSS-Versatz mehr) |

**Auftritt beim Laden:** Vorhang nur mit „ERGUN." – Buchstaben steigen einzeln auf, Punkt ploppt, Ladebalken zeigt echtes Laden.
Sobald Bilder + Schriften da sind, geht die Szene als weicher Lichtkreis hinter dem Namen auf (Klasse `aufgang`, Maske mit `--r`), der Name gleitet exakt auf den Hero-Titel (FLIP) und die Ebenen setzen sich dezent
(Himmel zoomt heraus, Kamm/Felsen fahren hoch, Emre blendet ein). Scrollen erst danach frei. Notbremse 9 s.
Emres Licht: `bilder/hero/4k/licht.py` (Gegenlicht, Lichtsaum oben, Kontaktschatten) – bei neuem Foto einfach neu laufen lassen.
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
| Preise (80 / 250 / 400 €) endgültig? | `index.html`, Abschnitt Pakete · `02 Preise` |

## Prüfung
- Desktop 1440 und 1024: Hero gerendert (Name lesbar über dem Kopf, Sonne hinter dem Namen, Füße auf dem Fels)
- Handy 390 (Hochformat): lädt die `-hoch`-Ebenen, Skalierung 0,94× bei 2-fach-Display – kein Weichzeichnen mehr; Screenshot geprüft
- Anti-Slop-Scan: sauber (Textverlauf im Titel entfernt) · Motion-Audit: nur die wachsende Hover-Unterstreichung (Fehlalarm)
- Scroll-Ruhe am Handy: keine `mix-blend-mode`/`filter`-Effekte mehr auf bewegten Elementen, `normalizeScroll` + leichte Touch-Glättung in ScrollSmoother
- Sonne: lokal nachbearbeitet (`bilder/hero/4k/sky-sonne-v2.png` ist die Quelle) – weicher Rand, heller Kern, dreistufige Glut
- Lighthouse: noch nicht gelaufen (braucht `npx lighthouse`, Download)

## Online stellen (GitHub + Vercel)
Nur dieser Ordner gehört ins öffentliche Repo – **nicht der ganze Vault** (Notizen, Preise, Impressum-Daten, Fotos).
Hochladen: `index.html`, `impressum.html`, `datenschutz.html`, `favicon*`, `apple-touch-icon.png`, `js/`, `schriften/`,
`bilder/hero/*.webp`, `bilder/og.jpg`. Ordner `bilder/hero/4k/` und alle PNG weglassen. Plan: `08 Projekte/Deployment.md`.
