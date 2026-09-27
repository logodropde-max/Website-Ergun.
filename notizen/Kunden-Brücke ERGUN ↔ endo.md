---
tags: [endo, ergun, regeln]
---
# Kunden-Brücke ERGUN. ↔ endo (Emre, 27.09.2026)

> Teil von [[Projekt 2 – Feinschliff + endo Agents]]. Grundsatz: **endo macht INHALTE** (Produktfotos, Werbevideos, Social-/Werbe-/Website-Bilder). **endo baut NIEMALS Websites.** Websites, Assistenten, Automatisierung und Betreuung macht nur Emre (ERGUN.).

## Regeln (umgesetzt)
- **endo-Landingpage** (`endo-studio.vercel.app`): Hero-Satz „endo macht die Inhalte; Ihre Website baut Emre persönlich.“ Abschnitt neben der Warteliste: „Ihre Bilder verdienen eine eigene Website – Emre baut sie persönlich.“ mit Knopf zum ERGUN.-Kontakt (`https://website-ergun.vercel.app/#kontakt`).
- **endo-Agent** (feste Regel in `api/agent.js`, nicht trainierbar + Wissen in [[endo – Wissen]]): Fragt jemand nach Website, Shop, Landingpage, App oder Automatisierung → nichts bauen, freundlich „Das macht Emre persönlich“ + Werkzeug `kontakt_emre` mit `anliegen: website`. Der Chat zeigt dann den Knopf **„Erstgespräch bei ERGUN. ↗“** und hängt die in der Sitzung erstellten Bilder als Links an die WhatsApp-/E-Mail-Anfrage (Platzhalter; später aus „Mein Konto“ mit Anmeldung). Test: `gehirn.test.mjs` → „Kunden-Brücke“.
- **Werkzeug „Website-Titelbild“ heißt jetzt „Bilder für Ihre Website“** (`werkzeuge.js`, `endo-daten.js`, Wissen) mit Hinweis „Fertig einbauen lassen? Das macht Emre persönlich.“
- **Rabatt-Platzhalter:** `endoKundenRabattProzent: null` in `test/js/endo-daten.js` – „endo-Kunden erhalten X % auf ihre Website“. **X bestätigt Emre**; solange null, wird nichts angezeigt, und endo nennt keine Zahl.
- **ERGUN.-Kontakt:** Zeile unter „So arbeiten wir zusammen“: „Inklusive in der Betreuung: endo Studio ↗ für Ihre eigenen Produktfotos & Videos.“ (Betreuung 200 €/Monat → [[Webdesign-Pakete (Erstgespräch)]]).

## Offen
- [ ] Rabatt X % für endo-Kunden (Emre).
- [ ] Bild-Links aus „Mein Konto“ automatisch in die ERGUN.-Anfrage übernehmen (braucht Anmeldung + Freigabe der Links).
- [ ] Umgekehrt: Betreuungs-Kunden bekommen endo-Premium-Vorlagen – technisch später über Credits/Konto verknüpfen.
