# ERGUN. Startseite „Berg“ – Quelle

Live seit 24.11.2026 (ersetzt die Seite „Dunkel & edel“, die im Branch `vorher-live-2026-11-24` liegt).

Aufbau: Intro (Liquid Glass Logo Reveal) → Gipfel-Abstieg durch die Wolken (Alto Coffee, MIT) → Seite (Himal Journeys, MIT) mit Karussell, Über uns + Wolken (Cloud Shader), Leistungen, Ablauf (Stapelkarten), Zahlen → „Lassen Sie uns reden.“ (Lets Work) → Halftone-Footer „ergun.“. Anfrage-Formular öffnet WhatsApp oder Mail.

Ändern und neu bauen (React 19 + esbuild, gsap 3.13 kommt per CDN):
1. Texte/Inhalte: `src/main.tsx` (Intro, Formular, Footer) und `patch.py` / `patch_ausbau.py` (Texte der Vorlagen)
2. `python3 patch.py && python3 patch_ausbau.py && python3 ext.py` (ext.py braucht die 21st-Prompts aus dem Vault, die fertigen Bausteine liegen schon in `src/ext/`)
3. `esbuild src/main.tsx --bundle --minify --format=iife --jsx=automatic --outfile=../../ergun-berg.js`
4. `node tw.mjs src/ext/*.tsx` → `tw.css` (Tailwind-Klassen für Lets Work und Wolken)
5. In `index.html` die `?v=` hochzählen

Offen vor dem offiziellen Start: eigene Bergbilder statt der Template-Bilder, Lizenz Cloud Shader (Aceternity) prüfen, `noindex` entfernen.
