import * as React from "react"
import { createRoot } from "react-dom/client"
import DragonTypeSpecimen, { layoutWord, WEIGHTS } from "./drache"

const FARBE = { rot: "#de0902", nacht: "#0b0a0b", gelb: "#fdc80f" }

function start() {
  const ziel = document.getElementById("drache")
  if (ziel) {
    createRoot(ziel).render(
      <DragonTypeSpecimen
        title="ERGUN."
        subtitle="WEBDESIGN"
        studio="WEBSITES FÜR JEDEN"
        year="2026"
        specimenWord="ONLINE"
        background={FARBE.rot}
        night={FARBE.nacht}
        ink={FARBE.gelb}
        scrollDistance="620svh"
      />,
    )
  }
  // Überschriften im Abschnitt darunter in derselben Drachen-Schrift (SVG)
  document.querySelectorAll<HTMLElement>("[data-drachenwort]").forEach((el) => {
    const text = el.dataset.drachenwort || el.textContent || ""
    const fett = el.hasAttribute("data-fett")
    const lay = layoutWord(text, fett ? WEIGHTS.bold : WEIGHTS.regular, fett ? 8 : 4)
    const pfad = lay.glyphs.map((g) => '<path transform="translate(' + g.x.toFixed(1) + ' 0)" d="' + g.d + '"/>').join("")
    el.setAttribute("aria-label", text)
    el.innerHTML =
      '<svg viewBox="-4 -26 ' + (lay.width + 8).toFixed(1) + ' 134" fill="currentColor" aria-hidden="true" preserveAspectRatio="xMinYMid meet" style="display:block;height:100%;width:auto;max-width:100%;overflow:visible">' + pfad + "</svg>"
  })
  window.addEventListener("ergun-anfrage", () => {
    const b = document.querySelector<HTMLElement>(".ic-cta .ic-btn")
    if (b) b.click()
  })
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start)
else start()
