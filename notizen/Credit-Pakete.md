---
tags: [endo-ai, preise]
---
# Credit-Pakete

Preise von [[endo-ai|endo.ai]], festgelegt von Emre am 25.09.2026. Für die Webdesign-Pakete siehe [[Pakete & Preise]].
Die Zahlen stehen im Code an einer Stelle: `window.ENDO` in `ki/js/endo-daten.js` (Karten, Umschalter, Chat und Credit-Fenster lesen von dort).
Login und Bezahlung sind noch nicht fertig: alle Knöpfe heißen „… vormerken“. **Kauf-Links von Lemon Squeezy** kommen in `ki/js/endo-daten.js` je Paket ins Feld `kaufen` (Monatsabo) bzw. `kaufenJahr` (Jahresabo) – dann heißt der Knopf in der gewählten Abrechnung automatisch „… kaufen“.

## Pakete (seit 28.09.2026: nur Monatlich oder Jährlich −20 %, runde Zahlen – Ausnahme auf Emres Wunsch)
Umschalter „Monatlich | Jährlich −20 %“ über den Karten (**Standard: Jährlich**), gilt für alle Karten zugleich; gleiche Credits pro Monat. **Einmalkauf entfernt** (28.09.). Zahlen im Code: `_code/endo-studio/test/js/endo-daten.js`.

| Paket | Credits/Monat | Monatlich | Jährlich (pro Monat) | Jährlich abgerechnet | Ersparnis/Jahr | Enthalten |
|---|---|---|---|---|---|---|
| Start | 40 | 10 € | 8 € | 96 € | 24 € | 7 Werkzeuge (Produktfoto, Shop-Bild, Anzeige, Formate-Set, Aufwerten, Video 5 s, Titelbild) |
| Pro | 200 | 30 € | 25 € | 300 € | 60 € | Start + Lifestyle, Aktions-Plakat, Logo-Entwurf |
| Premium | 1.000 | 100 € | 80 € | 960 € | 240 € | Pro + Video 10 s, Website-Video 4K, 3D/Parallax/Abstimmung, Website von Emre |

**Margen-Prüfung 28.09.** (Netto = Preis ÷ 1,19 − 5 % − 0,50 € Lemon Squeezy; schlechtester Fall 0,0377 €/Credit = Produktfoto):
| Paket | Monatlich: Netto / Kosten / Gewinn | Jährlich: Netto / Kosten / Gewinn |
|---|---|---|
| Start | 7,48 € / 1,51 € / **~80 %** | 76,14 € / 18,10 € / **~76 %** |
| Pro | 23,45 € / 7,54 € / **~68 %** | 239,03 € / 90,48 € / **~62 %** |
| Premium | 78,53 € / 37,70 € / **~52 %** | 766,32 € / 452,40 € / **~41 %** (vor Emres Arbeitszeit für die Website) |
→ Alle Stufen deutlich über 35 %, die Credits bleiben wie sie sind. Spielraum: Start und Pro könnten später mehr Credits bekommen (z. B. 60 / 300), Marge bliebe über 50 %.

### Alte Preise (25.–27.09., nur zur Geschichte)
| Paket | Credits/Monat | Monatlich | Jährlich (pro Monat) | Jährlich abgerechnet |
|---|---|---|---|---|
| Start | 40 | 5 € | 3,99 € | 47,88 € |
| Pro | 200 | 20 € | 16 € | 192 € |
| Premium | 1.000 | 100 € | 80 € | 960 € |

**Gewinn im schlechtesten Fall** (gleiche Rechnung wie unten; Jahresabo = eine Abbuchung pro Jahr, also nur einmal 0,50 € Gebühr):
| Paket | Monatlich | Jährlich: Netto/Jahr | Kosten/Jahr | Gewinn | Anteil |
|---|---|---|---|---|---|
| Start | 53 % | 37,34 € | 19,46 € | 17,88 € | **~48 %** |
| Pro | 47 % | 151,24 € | 97,32 € | 53,92 € | **~36 %** |
| Premium | 48 % | 758,22 € | 486,72 € | 271,50 € | **~36 %** |

→ Auch mit 20 % Jahresrabatt überall über 35 % (Ziel erfüllt). Texte „kein Abo“ auf Karten, im Chat und in der FAQ von /ki/ entsprechend angepasst.

## Premium inklusive Website von Emre (Emre, 27.09.2026 – freigegeben)
Auf Seite, Paket-Fenster, Paket-Karten und in endos Wissen: **„Premium: inklusive Ihrer Website von Emre“**. Die Bedingungen stehen in `ki/js/endo-daten.js` → `premiumWebsite` (`bestaetigt: true`). Emre: „ok“; Rabatt und Korrekturrunden auf seinen Wunsch von Claude gewählt („mach du es passend und schlau“, „nach sinnvollem Marketing-Plan“).
- **Premium jährlich:** Website inklusive. Onepager aus einer ERGUN.-Vorlage (**Emre, 27.09.: Seitenzahl bleibt wie jetzt – ein Onepager, keine feste Abschnitts-Zahl**), **2 Korrekturrunden** (branchenüblich, nimmt Kunden die Sorge; ca. 1–2 h mehr Aufwand), eigene Bilder und Videos mit endo.
- **Premium monatlich:** Website inklusive bei **12 Monaten Mindestlaufzeit**.
- **Premium einmalig:** keine Website, dafür **20 % Rabatt** auf eine Website (gleich wie der Jahresrabatt – einheitlich; beim Onepager-Richtwert 80 € = 16 €, Gewinn Premium einmalig bleibt ca. 57 €).
- Größere Seiten oder ein Onlineshop: im Erstgespräch.

**Lohnt es sich? Gewinn vor Emres Arbeitszeit (schlechtester Fall, aus den Tabellen oben):**

| Premium | Netto | Kosten (schlechtester Fall) | Gewinn vor Arbeitszeit |
|---|---|---|---|
| jährlich (1 Jahr) | 758,22 € | 486,72 € | **271,50 €** |
| monatlich × 12 (Mindestlaufzeit) | 12 × 78,53 € = 942,36 € | 12 × 40,56 € = 486,72 € | **455,64 €** |

**Emres Arbeitszeit für die Website = [Stunden] × [Stundensatz]** (beides Platzhalter, Emre trägt ein):

| Stunden für den Onepager | bei 25 €/h | bei 40 €/h | bei 60 €/h |
|---|---|---|---|
| 4 h | 100 € | 160 € | 240 € |
| 6 h | 150 € | 240 € | 360 € |
| 8 h | 200 € | 320 € | 480 € |
| 12 h | 300 € | 480 € | 720 € |

→ **Grenze (Gewinn = 0):** jährlich 271,50 € ÷ Stundensatz; bei 40 €/h also **ca. 6,8 h**, monatlich (12 Monate) 455,64 € ÷ 40 €/h = **ca. 11,4 h**. Die Beispiel-Stundensätze sind nur zur Rechnung, keine Festlegung. Der schlechteste Fall setzt voraus, dass der Kunde alle Credits für das teuerste Werkzeug verbraucht; in der Praxis bleibt mehr übrig. Hosting/Domain der Kunden-Website sind hier nicht eingerechnet (Webdesign-Pakete: [[Pakete & Preise]]).

## Einmalig kaufen (Emre, 26.09.2026 spät)
Dritter Schalter „Einmalig“: gleiche Credits, **einmal bezahlt, kein Abo, Credits 12 Monate gültig**. Preis ≈ Monatspreis + 20 %, damit das Abo attraktiver bleibt. Kauf-Link je Paket: Feld `kaufenEinmal` in `ki/js/endo-daten.js`.

| Paket | Credits | Einmalig | Netto (−19 % MwSt, −5 % −0,50 € Lemon Squeezy) | Kosten schlechtester Fall (0,0377 €/Credit, Produktfoto) | Gewinn |
|---|---|---|---|---|---|
| Start | 40 | 6 € | 4,24 € | 1,51 € | **~64 %** |
| Pro | 200 | 24 € | 18,47 € | 7,54 € | **~59 %** |
| Premium | 1.000 | 120 € | 94,34 € | 37,70 € | **~60 %** |

- **Offen für den Kauf-Start:** Die 12-Monats-Gültigkeit muss beim Gutschreiben der Credits (Lemon-Squeezy-Webhook) mit gespeichert und nach Ablauf verrechnet werden – die Datenbank kennt noch kein Ablaufdatum.

## Verbrauch ab Phase C (beschlossen 26.09.2026, auf der Website ab Schritt 3)
Rechnung mit Listenpreisen der Higgsfield-API (nach Aktionsende), schlechtester Fall 0,063 € netto je Credit, 1 $ = 1 € → [[endo Phase C – Bauplan]].
| Werkzeug | Credits | API-Listenpreis | Modell | Gewinn schlechtester Fall |
|---|---|---|---|---|
| Produktfoto (2K) | **12** | 0,452 $ | marketing-studio/image, Direktmodus | 40 % |
| Werbeanzeige (neu, 2K) | **10** | 0,372 $ | marketing-studio/image, Preset | 41 % |
| Shop-Bild (weißer Hintergrund, 2K) | **5** | 0,075 $ | alibaba/qwen-image-3/edit | 76 % |
| Werbevideo 5 s (1080p, ohne Ton) | **20** | 0,56 $ | kling-video/v3.0/pro/image-to-video | 56 % |
| Website-Titelbild (4K, 16:9) | **12** | 0,424 $ | marketing-studio/image, Direktmodus | 44 % |
| **Premium:** Werbevideo 10 s | **40** | 1,12 $ | kling-video/v3.0/pro/image-to-video | 56 % |
| Shop- & Marktplatz-Bild (umbenannt 27.09.) | **5** | 0,075 $ | alibaba/qwen-image-3/edit | 76 % |
| **neu 27.09.** Lifestyle mit Person (Pro) | **14** | 0,343 $ (Liste; 26./27.09. rabattiert 0,257 $; gerechnet mit 0,452 $) | marketing-studio/image, Direktmodus 2K | 49 % |
| **neu 27.09.** Aktions-Plakat (Pro) | **6** | 0,10 $ | ideogram/v4.0, QUALITY | 74 % |
| **neu 27.09.** Formate-Set (Start) | **3 je Format** | 0,075 $ je Format | alibaba/qwen-image-3/edit, 2K | 60 % |
| **neu 27.09.** Foto aufwerten (Start) | **4** | 0,075 $ | alibaba/qwen-image-3/edit, 2K | 70 % |
| **neu 27.09.** Logo-Entwurf (Pro) | **8** | 0,21 $ | recraft/v4.1/pro/text-to-image, 2K | 58 % |
| **neu 27.09. Premium:** Website-Video 4K | **60** | **2,10 $** Liste (bis 01.10. rabattiert 1,05 $) | kling-video/v3.0/4k/image-to-video, 5 s | 44 % |
| **Premium:** 3D-Produkt, Parallax-Szene | auf Anfrage | – | nicht über die API – Emre von Hand | – |
| **Premium:** Abstimmung mit Emre | – | – | Anfrage | – |

**Hinweis 27.09.:** Das Formate-Set ist technisch ein Auftrag je Format (eigene Rückbuchung) → 3 Credits je Format statt 8 für drei (Plan). Der schlechteste Fall pro Credit bleibt das Produktfoto (0,0377 €/Credit), die Paket-Rechnung oben ändert sich nicht. Welches Paket ein Kunde hat, prüft der Server erst, wenn Pakete gekauft werden können (Lemon Squeezy).

## Verbrauch bis Phase C (alt, 25.09.)
| Bereich | Credits | Higgsfield-Kosten | Modell |
|---|---|---|---|
| Produktfoto (Produkt in Szene) | 5 | 2 | marketing_studio_image |
| Shop-Bild (freigestellt + 4K) | 5 | 1 + 2 | remove_background + upscale 4K |
| Werbevideo 5 s | 20 | 10 | kling3_0 |
| Website-Titelbild | 10 | ca. 4,25 | GPT Image 2.5, 4K (Annahme Claude) |
| **Premium:** Werbevideo 10 s | 40 | 20 | kling3_0 |
| **Premium:** 3D-Produkt drehbar | 50 | 30 | image_to_3d mit Textur |
| **Premium:** Parallax-Szene | 30 | ca. 17 | 4 Bilder à 4,25 (Annahme Claude) |
| **Premium:** persönliche Abstimmung mit Emre | – | – | – |

> **Hinweis (26.09.):** Produktfotos laufen bevorzugt im **Preset-Modus** von Marketing Studio Image – der kostet bei Higgsfield **10 % mehr** als der Direktmodus. Beim Nachrechnen berücksichtigen (Spalte „Higgsfield-Kosten“ war in Abo-Credits gerechnet; künftig gilt der API-Preis in $ laut `hf.mjs preis`). Fehlgeschlagene/abgelehnte Aufträge: Credits zurück. Vorgaben: [[endo Chat-Agent]].

## So gerechnet (Emre, 25.09.)
- Worst Case 0,052 € pro Higgsfield-Credit (Nachkauf 500 Credits für 26 €), dazu 30 % Fehlversuche.
- Vom Preis gehen 19 % MwSt und bei Lemon Squeezy ca. 5 % + 0,50 € ab. Netto: Start 3,45 € · Pro 15,31 € · Premium 78,53 €.
- Schlechtester Fall = das ganze Paket wird für das Werkzeug mit den höchsten Kosten je Credit verbraucht:

| Paket | teuerster Fall | Kosten | Gewinn | Anteil am Netto |
|---|---|---|---|---|
| Start | 8 Shop-Bilder | 1,62 € | 1,83 € | 53 % |
| Pro | 40 Shop-Bilder | 8,11 € | 7,19 € | 47 % |
| Premium | 200 Shop-Bilder oder 20 3D-Produkte | 40,56 € | 37,97 € | 48 % |

→ Überall mindestens 35 % Gewinn (Ziel erfüllt). Produktfotos allein bringen 65–69 %.
- Annahmen zum Prüfen: Kosten für Website-Titelbild und Parallax-Szene hat Emre nicht genannt, oben geschätzt.
- Achtung: 4K-Bilder mit GPT Image 2.5 kosten 4,25 Credits je Bild (Kostenvorschau gilt pro Bild).

Früher: 25.09. nachts kurz Start 5 € / Pro 20 € / Premium 100 € ohne Credit-Zahl; bis 25.09. Start 9 € / 100, Pro 29 € / 400, Studio 79 € / 1.200, Premium 199 € / 3.500.
