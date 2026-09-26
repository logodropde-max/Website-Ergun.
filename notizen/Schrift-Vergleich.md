# Schrift-Vergleich (27.09.2026)

Emres Auftrag: Typografie erneuern, erst drei Vorschläge, Test über `?schrift=a|b|c`. **Logo „ERGUN.“ bleibt Instrument Serif** (in allen Varianten).

| | Überschriften | Fließtext | endo Studio | Lizenz |
|---|---|---|---|---|
| **Jetzt** | Instrument Serif | Geist | Geist Light (Chrom) | beide SIL OFL 1.1 |
| **A edel-modern** | Fraunces (variabel: Strichstärke, Größe, „Weichheit“) | Geist | Fraunces (Chrom) | SIL OFL 1.1 – frei, auch kommerziell |
| **B innovativ-technisch** | Clash Display | Satoshi | Clash Display Light (Chrom) | ITF Free Font License (Fontshare) – kommerziell frei, Selbst-Hosten ausdrücklich erlaubt, Dateien nicht weiterverkaufen |
| **C gezeichnet + technisch** | Bricolage Grotesque (groß schmal und kräftig, klein ruhig) | Geist | Bricolage (Chrom) | SIL OFL 1.1 |

**Empfehlung von Claude: B** – der deutlichste Sprung („anderes Level“), „Webdesigner“ wird ein kräftiges Statement, die geometrische Schrift passt zum Chrom von endo, eine Familie für alles (aus einem Guss). A ist die elegante, ruhige Weiterentwicklung des jetzigen Stils; C ist plakativ.

**Technik:** Dateien liegen selbst gehostet in `_code/ee-design-website/schriften/` (woff2 + Lizenztexte), der Test lädt sie nur mit Parameter (`js/schrift-test.js`, `schriften/schrift-test.css`). Nach Emres Wahl: nur die gewählte Schrift behalten, wichtigsten Schnitt vorladen, Ersatzschrift per `size-adjust` angleichen, Testdateien entfernen.

**Quellen der Dateien:** Fraunces + Bricolage über das npm-Paket `@fontsource-variable` (Original: Google-Fonts-Projekte auf GitHub), Clash Display + Satoshi direkt von fontshare.com. Auf der Seite wird nichts von fremden Servern geladen.
