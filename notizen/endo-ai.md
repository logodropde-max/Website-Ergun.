---
tags: [endo-ai]
---
# endo.ai

Emres KI-Studio als zweites Einkommen. Seite: https://website-ergun.vercel.app/ki/ (Datei `ki/index.html`). Teil von [[ERGUN Website (Übersicht)]].

- **Idee und Plan:** [[KI-Studio mit Higgsfield]]
- **Im Vordergrund:** der Assistent [[endo Chat-Agent|endo]], der antwortet und zum Produktfoto einlädt.
- **Technik dahinter:** [[Higgsfield API]] erzeugt Bilder und Videos, [[Supabase]] für Login und Credits, [[Lemon Squeezy]] für die Bezahlung, [[Vercel]] für Hosting und Funktionen.
- **Preise:** [[Credit-Pakete]] (Start 5 €, Pro 20 €, Premium 100 €)
- **Richtung (seit 25.09. nachts):** ruhig, Weiß/Grau, Orange nur für Premium. Nur was lieferbar ist: Fotos im Fokus, Video als Zusatz, drei Werkzeuge.

## Aufbau der Seite (Stand 25.09. nachts)
1. **Hero:** silberweiße Drahtgitter-Kugel, „Zeigen Sie mir Ihr Produkt.“, darunter nur die Zeile „Fragen Sie endo …“ (schwebender Chat, siehe [[endo Chat-Agent]]).
2. **Vorher/nachher:** die Tasse.
3. **Funktionen:** drei Werkzeuge zum Antippen (Produkt in Szene, Freistellen + 4K, Werbevideo 5 s); daneben sieht man sofort Credits pro Ergebnis und in welchem Paket es enthalten ist. Darunter der orange **Premium-Ordner** zum Aufklappen.
4. Leitsatz „Ein Handyfoto genügt. Den Rest macht endo.“, So geht's, Fakten, Pakete (Start ruhig, Pro weiß, Premium orange), Verbrauch, Fragen, Warteliste.
5. Oben: Knopf **Credits** (Credit-Fenster, noch ohne Guthaben) und Umschalter **ERGUN. | endo.ai**.

## Handy
Auf dem Handy ersetzt eine **Paketwahl-Karte** die vier Preiskarten (nach Emres Vorlage „SubscriptionScreen", ohne React nachgebaut): Tassenbild oben, Blatt fährt hoch, Kugel-Grafik, Vorteile je Paket, Auswahl Start bis Premium, Knopf „… vormerken" füllt die Warteliste vor.

**Stand:** Landingpage mit Agent und Warteliste ist online. Login, Kauf und echte Erzeugung fehlen noch, siehe [[To-dos]].
