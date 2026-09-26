---
tags: [endo-ai, preise]
---
# Credit-Pakete

Preise von [[endo-ai|endo.ai]], festgelegt von Emre am 25.09.2026. Für die Webdesign-Pakete siehe [[Pakete & Preise]].
Die Zahlen stehen im Code an einer Stelle: `window.ENDO` in `ki/js/endo-daten.js` (Karten, Umschalter, Chat und Credit-Fenster lesen von dort).
Login und Bezahlung sind noch nicht fertig: alle Knöpfe heißen „… vormerken“. **Kauf-Links von Lemon Squeezy** kommen in `ki/js/endo-daten.js` je Paket ins Feld `kaufen` (Monatsabo) bzw. `kaufenJahr` (Jahresabo) – dann heißt der Knopf in der gewählten Abrechnung automatisch „… kaufen“.

## Pakete (seit 26.09.2026: Monatlich, Jahresabo −20 % oder Einmalig)
Umschalter „Monatlich | Jährlich −20 %“ über den Karten (Standard: Monatlich), gilt für alle Karten zugleich; gleiche Credits pro Monat.

| Paket | Credits/Monat | Monatlich | Jährlich (pro Monat) | Jährlich abgerechnet | Enthalten |
|---|---|---|---|---|---|
| Start | 40 | 5 € | 3,99 € | 47,88 € | alle drei Bereiche |
| Pro | 200 | 20 € | 16 € | 192 € | alle drei Bereiche |
| Premium | 1.000 | 100 € | 80 € | 960 € | alle drei Bereiche + Premium-Ordner |

**Gewinn im schlechtesten Fall** (gleiche Rechnung wie unten; Jahresabo = eine Abbuchung pro Jahr, also nur einmal 0,50 € Gebühr):
| Paket | Monatlich | Jährlich: Netto/Jahr | Kosten/Jahr | Gewinn | Anteil |
|---|---|---|---|---|---|
| Start | 53 % | 37,34 € | 19,46 € | 17,88 € | **~48 %** |
| Pro | 47 % | 151,24 € | 97,32 € | 53,92 € | **~36 %** |
| Premium | 48 % | 758,22 € | 486,72 € | 271,50 € | **~36 %** |

→ Auch mit 20 % Jahresrabatt überall über 35 % (Ziel erfüllt). Texte „kein Abo“ auf Karten, im Chat und in der FAQ von /ki/ entsprechend angepasst.

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
| **Premium:** 3D-Produkt, Parallax-Szene | auf Anfrage | – | nicht über die API – Emre von Hand | – |
| **Premium:** Abstimmung mit Emre | – | – | Anfrage | – |

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
