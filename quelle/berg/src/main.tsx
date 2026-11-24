import * as React from "react"
import { createRoot } from "react-dom/client"
import AltoCoffeeTemplate from "./alto"
import HimalJourneysTemplate from "./himal"
import { GlassIconReveal } from "./ext/liquid-glass-logo-reveal"
import { LetsWorkTogether } from "./ext/lets-work-section"
import HalftoneWordmarkFooter from "./ext/halftone-wordmark-footer"

const MARKE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M18 14h62v18H38v18h36v18H38v20h44v18H18z"/><circle cx="98" cy="97" r="11"/></svg>`

function Intro() {
  const [an, setAn] = React.useState(() => { try { return sessionStorage.getItem("ergun-intro") !== "1" && !/[?&]ohne-intro/.test(location.search) } catch { return true } })
  const [weg, setWeg] = React.useState(false)
  const ende = React.useCallback(() => {
    setWeg(true)
    try { sessionStorage.setItem("ergun-intro", "1") } catch {}
    window.setTimeout(() => setAn(false), 700)
  }, [])
  React.useEffect(() => {
    if (!an) return
    document.documentElement.style.overflow = "hidden"
    const t = window.setTimeout(ende, 3600)
    const k = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter" || e.key === " ") && ende()
    window.addEventListener("keydown", k)
    return () => { window.clearTimeout(t); window.removeEventListener("keydown", k); document.documentElement.style.overflow = "" }
  }, [an])
  if (!an) return null
  return (
    <div className={"intro-glas" + (weg ? " weg" : "")}>
      <GlassIconReveal logo={MARKE} label="ERGUN." look="light" background="#eef2f8" logoColor="#0f141c" logoScale={0.55} finalScale={0.85} style={{ width: "100%", height: "100%" }} />
      <p className="intro-wort">ERGUN.</p>
      <button type="button" className="intro-skip" onClick={ende}>Überspringen</button>
    </div>
  )
}


const WA = "4915906344961"
const MAIL = "ergun.eu@gmail.com"
const BILD = "bilder/berg/"

function Anfrage({ offen, zu }: { offen: boolean; zu: () => void }) {
  const [f, setF] = React.useState({ name: "", weg: "whatsapp", kontakt: "", ort: "Egal", art: "Noch unsicher", budget: "Keine Angabe", text: "", ok: false, unternehmer: false })
  const [fehler, setFehler] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!offen) return
    const esc = (e: KeyboardEvent) => e.key === "Escape" && zu()
    document.addEventListener("keydown", esc)
    document.documentElement.style.overflow = "hidden"
    setTimeout(() => ref.current?.querySelector("input")?.focus(), 50)
    return () => { document.removeEventListener("keydown", esc); document.documentElement.style.overflow = "" }
  }, [offen])
  if (!offen) return null
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value })
  const senden = (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name.trim() || !f.kontakt.trim()) return setFehler("Bitte Name und " + (f.weg === "whatsapp" ? "Telefonnummer" : "E-Mail-Adresse") + " angeben.")
    if (!f.ok || !f.unternehmer) return setFehler("Bitte die beiden Häkchen setzen.")
    setFehler("")
    const t = [`Hallo ERGUN., ich interessiere mich für eine Website.`, ``, `Name: ${f.name}`, `${f.weg === "whatsapp" ? "Telefon" : "E-Mail"}: ${f.kontakt}`, `Gespräch gern per: ${f.ort}`, `Vorstellung: ${f.art}`, `Budget: ${f.budget}`, f.text ? `\n${f.text}` : ""].join("\n")
    if (f.weg === "whatsapp") window.open(`https://wa.me/${WA}?text=${encodeURIComponent(t)}`, "_blank", "noopener")
    else location.href = `mailto:${MAIL}?subject=${encodeURIComponent("Anfrage Website")}&body=${encodeURIComponent(t)}`
  }
  return (
    <div className="anf" role="dialog" aria-modal="true" aria-labelledby="anf-h" onClick={(e) => e.target === e.currentTarget && zu()}>
      <div className="anf-box" ref={ref}>
        <button type="button" className="anf-zu" aria-label="Schließen" onClick={zu}>×</button>
        <p className="anf-k">Kostenloses Erstgespräch</p>
        <h2 id="anf-h">Erzählen Sie uns von Ihrem Vorhaben.</h2>
        <p className="anf-t">Wir melden uns innerhalb von 24 Stunden und sprechen, wo es Ihnen passt. Danach bekommen Sie einen festen Preis.</p>
        <form onSubmit={senden} noValidate>
          <label>Name *<input value={f.name} onChange={set("name")} autoComplete="name" /></label>
          <div className="anf-wahl" role="radiogroup" aria-label="Antwort per">
            {[["whatsapp", "WhatsApp"], ["mail", "E-Mail"]].map(([v, l]) => (
              <button key={v} type="button" aria-pressed={f.weg === v} onClick={() => setF({ ...f, weg: v })}>{l}</button>
            ))}
          </div>
          <label>{f.weg === "whatsapp" ? "Telefonnummer *" : "E-Mail-Adresse *"}<input value={f.kontakt} onChange={set("kontakt")} type={f.weg === "whatsapp" ? "tel" : "email"} autoComplete={f.weg === "whatsapp" ? "tel" : "email"} /></label>
          <div className="anf-2">
            <label>Wo möchten Sie sprechen?<select value={f.ort} onChange={set("ort")}>{["Egal", "Telefon", "WhatsApp", "Video", "Vor Ort"].map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Ihr Budget<select value={f.budget} onChange={set("budget")}>{["Keine Angabe", "bis 500 €", "500 bis 1.000 €", "mehr als 1.000 €"].map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
          <label>Was stellen Sie sich vor?<select value={f.art} onChange={set("art")}>{["Noch unsicher", "Standard (Infos und Kontakt)", "Erweitert (mehr Bilder und Seiten)", "Premium (Video, 3D, Termine)"].map((o) => <option key={o}>{o}</option>)}</select></label>
          <label>Nachricht<textarea rows={3} value={f.text} onChange={set("text")} /></label>
          <label className="anf-c"><input type="checkbox" checked={f.ok} onChange={set("ok")} /><span>Ich habe die <a href="datenschutz.html" target="_blank">Datenschutzerklärung</a> gelesen und bin einverstanden, dass ich zu meiner Anfrage kontaktiert werde.</span></label>
          <label className="anf-c"><input type="checkbox" checked={f.unternehmer} onChange={set("unternehmer")} /><span>Ich frage als Unternehmer an.</span></label>
          {fehler ? <p className="anf-f" role="alert">{fehler}</p> : null}
          <button type="submit" className="anf-los">Anfrage senden</button>
          <p className="anf-h">„Anfrage senden“ öffnet {f.weg === "whatsapp" ? "WhatsApp" : "Ihr Mailprogramm"} mit der fertigen Nachricht. Die Website speichert nichts.</p>
        </form>
      </div>
    </div>
  )
}

function Seite() {
  const [offen, setOffen] = React.useState(false)
  React.useEffect(() => {
    ;(window as any).__ergunBook = () => setOffen(true)
  }, [])
  React.useEffect(() => {
    const klick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="mailto:"]') as HTMLAnchorElement | null
      if (!a || a.closest(".hj-foot") || a.closest(".hwf-root")) return
      e.preventDefault()
      setOffen(true)
    }
    document.addEventListener("click", klick, true)
    return () => document.removeEventListener("click", klick, true)
  }, [])
  return (
    <>
      <Intro />
      <div className="intro-berg">
        <AltoCoffeeTemplate
          preset="huila"
          theme="light"
          brand={{ name: "ERGUN." }}
          hero={{
            title: ["Sie brauchen", "eine Website?"],
            peak: { name: "Erstgespräch", altitude: 0 },
            farmAltitude: 100,
            coords: "ERGUN.",
            soil: "fertig für Ihre Kunden",
            caption: "Wir machen das. Persönlich geplant, mit kostenlosem Erstgespräch.",
            image: { src: BILD + "everest.webp", alt: "", focus: [0.5, 0.4] },
            fieldImage: { src: BILD + "himalaya.webp", alt: "", focus: [0.5, 0.5] },
          } as any}
        />
      </div>
      <HimalJourneysTemplate
        brand="ERGUN."
        email={MAIL}
        assetBase={BILD}
        extra={
          <>
            <div className="lets-ergun"><LetsWorkTogether /></div>
            <HalftoneWordmarkFooter
              wordmark="ergun."
              label="ERGUN."
              meta="Websites für jeden, der eine braucht"
              preset="cobalt"
              palette={{ background: "#0e1422", ink: "#e9edf7", warm: "#f0a35e" }}
              height="min(78vh, 720px)"
              columns={[
                { title: "Seite", links: [{ label: "Arbeiten", href: "#hj-tours" }, { label: "Leistungen", href: "#hj-experiences" }, { label: "Ablauf", href: "#hj-steps" }] },
                { title: "Kontakt", links: [{ label: "WhatsApp", href: "https://wa.me/" + WA }, { label: "E-Mail", href: "mailto:" + MAIL }] },
                { title: "Rechtliches", links: [{ label: "Impressum", href: "impressum.html" }, { label: "Datenschutz", href: "datenschutz.html" }] },
              ]}
            />
          </>
        }
      />
      <Anfrage offen={offen} zu={() => setOffen(false)} />
    </>
  )
}

createRoot(document.getElementById("root")!).render(<Seite />)
