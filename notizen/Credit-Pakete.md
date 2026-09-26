---
tags: [endo-ai, preise]
---
# Credit-Pakete

Preise von [[endo-ai|endo.ai]], festgelegt von Emre am 25.09.2026. Für die Webdesign-Pakete siehe [[Pakete & Preise]].
Die Zahlen stehen im Code an einer Stelle: `window.ENDO` in `ki/js/endo-daten.js` (Karten, Umschalter, Chat und Credit-Fenster lesen von dort).
Login und Bezahlung sind noch nicht fertig: alle Knöpfe heißen „… vormerken“. **Kauf-Links von Lemon Squeezy** kommen in `ki/js/endo-daten.js` je Paket ins Feld `kaufen` (Monatsabo) bzw. `kaufenJahr` (Jahresabo) – dann heißt der Knopf in der gewählten Abrechnung automatisch „… kaufen“.

## Pakete (seit 26.09.2026: Monatlich oder Jahresabo −20 %)
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

## Verbrauch (endo-Credits pro Ergebnis)
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
