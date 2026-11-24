import re, json
n = 0
def rep(s, a, b, cnt=1):
    global n
    if a not in s:
        raise SystemExit("FEHLT: " + a[:90])
    n += 1
    return s.replace(a, b, cnt)

# ---------------------------------------------------------------- ALTO (nur das Intro)
a = open("src/alto.orig.tsx", encoding="utf-8").read()
a = rep(a, 'import { gsap } from "gsap"\nimport { ScrollTrigger } from "gsap/ScrollTrigger"\nimport { MorphSVGPlugin } from "gsap/MorphSVGPlugin"',
        'const gsap = (window as any).gsap\nconst ScrollTrigger = (window as any).ScrollTrigger\nconst MorphSVGPlugin = (window as any).MorphSVGPlugin')
a = rep(a, '<p className="ac-alt-label">Altitude</p>', '<p className="ac-alt-label">Ihre Website</p>')
a = rep(a, '<span data-alt>{groupThousands(H.farm)}</span>\n                <small>m</small>', '<span data-alt>{groupThousands(H.farm)}</span>\n                <small>%</small>')
a = rep(a, '<p className="ac-eyebrow">{H.title.join(" ")} · {groupThousands(H.farm)} m</p>', '<p className="ac-eyebrow">ERGUN. · Ihre Website · 100 %</p>')
a = rep(a, '<b data-alt>{groupThousands(H.peak.altitude)}</b> m', '<b data-alt>{groupThousands(H.peak.altitude)}</b> %')
a = rep(a, '<span>Scroll to descend</span>', '<span>Scrollen und eintauchen</span>')
a = rep(a, 'if (!svg || !stage) return', 'if (!svg || !stage || !stage.clientWidth || ![cam.x, cam.y, cam.w, cam.h].every((v) => typeof v === "number" && isFinite(v))) return')
open("src/alto.tsx", "w", encoding="utf-8").write(a)

# ---------------------------------------------------------------- HIMALAYA (die Seite)
h = open("src/himal.orig.tsx", encoding="utf-8").read()

tours = [
  dict(id="elektro-rehder", img="bilder/arbeiten/elektro-rehder.jpg", name="Elektro Rehder", price="Handwerk", days="Notdienst", start="Elektriker",
       blurb="Klar, schnell und mit einem Tipp zum Anruf. Für Kunden, bei denen gerade der Strom weg ist.", season="Notdienst und Anfrage", peak="Anruf mit einem Tipp", group="Beispielseite",
       plan=["Notdienst-Nummer ganz oben", "Leistungen auf einen Blick", "Einsatzgebiet und Anfahrt", "Anfrage per WhatsApp"]),
  dict(id="praxis-lindhorst", img="bilder/arbeiten/praxis-lindhorst.jpg", name="Praxis Lindhorst", price="Gesundheit", days="Online-Termine", start="Praxis",
       blurb="Ruhig und vertrauensvoll. Patienten sehen freie Termine und fragen direkt an.", season="Termine online", peak="Weniger Anrufe", group="Beispielseite",
       plan=["Freie Termine direkt sichtbar", "Behandlungen einfach erklärt", "Team und Räume zeigen", "Anfahrt und Öffnungszeiten"]),
  dict(id="yilmaz-realty", img="bilder/arbeiten/yilmaz-realty.jpg", name="Yilmaz Realty", price="Immobilien", days="Beratung", start="Makler",
       blurb="Häuser zeigen, bevor jemand anreist. Mit Beratung, Bildern und direktem Kontakt.", season="Objekte und Beratung", peak="Vertrauen aufbauen", group="Beispielseite",
       plan=["Objekte mit großen Bildern", "Ablauf der Beratung", "Fragen und Antworten", "Kontakt per WhatsApp"]),
  dict(id="voltiq", img="bilder/arbeiten/voltiq.jpg", name="Voltiq Shop", price="Online-Shop", days="Shop", start="Händler",
       blurb="Ein Shop, der am Handy Spaß macht. Produkte groß zeigen und schnell in den Warenkorb.", season="Produkte und Warenkorb", peak="Mehr Verkäufe", group="Beispielseite",
       plan=["Produkte groß in Szene", "Farben und Varianten wählen", "Schneller Warenkorb", "Versand und Vertrauen"]),
  dict(id="himalaya", name="Ihre Website", price="Als Nächstes", days="Erstgespräch", start="Ihr Betrieb",
       blurb="Erzählen Sie uns, was Sie vorhaben. Wir planen Ihre Seite persönlich und nennen Ihnen danach einen festen Preis.", season="Kostenlos", peak="Fester Preis", group="Wo Sie wollen",
       plan=["Kostenloses Erstgespräch", "Entwurf zum Anschauen", "Online gehen", "Betreuung auf Wunsch"]),
]
a0 = h.index("const TOURS: Tour[] = ["); a1 = h.index("\n]\n", a0) + 3
h = h[:a0] + "const TOURS: Tour[] = " + json.dumps(tours, ensure_ascii=False, indent=1) + " as any\n" + h[a1:]

a0 = h.index("const LINKS = ["); a1 = h.index("]\n", a0) + 2
h = h[:a0] + '''const LINKS = [
  { id: "tours", label: "Arbeiten" },
  { id: "about", label: "Über uns" },
  { id: "experiences", label: "Leistungen" },
  { id: "steps", label: "Ablauf" },
  { id: "contact", label: "Kontakt" },
]
''' + h[a1:]
h = rep(h, 'const PHRASES = ["Without Limits.", "Above the Clouds.", "On Your Terms.", "Beyond the Map."]',
        'const PHRASES = ["Handwerker.", "Praxen.", "Cafés.", "Friseure.", "Restaurants.", "Läden.", "Vereine.", "Makler.", "Selbstständige.", "jeden."]')
h = rep(h, "    }, 3400)", "    }, 1500)")
a0 = h.index("const STATS = ["); a1 = h.index("]\n", a0) + 2
h = h[:a0] + '''const STATS = [
  { value: "24 h", label: "Antwort auf jede Anfrage" },
  { value: "1", label: "fester Ansprechpartner" },
  { value: "100 %", label: "Ihre Website gehört Ihnen" },
  { value: "0 €", label: "kostet das Erstgespräch" },
]

const STEPS = [
  { t: "Erstgespräch", w: "Kostenlos", p: "Sie erzählen uns, was Sie vorhaben. Am Telefon, per WhatsApp, per Video oder bei Ihnen vor Ort." },
  { t: "Entwurf", w: "Mit festem Preis", p: "Sie sehen Ihre Seite, bevor sie online geht, und kennen den Preis vorab." },
  { t: "Online", w: "Wenn alles passt", p: "Wir stellen alles live, verbinden Ihre Adresse und sorgen dafür, dass Google Sie findet." },
  { t: "Betreuung", w: "Auf Wunsch", p: "Änderungen, Updates und neue Ideen übernehmen wir auch nach dem Start." },
]
''' + h[a1:]
h = rep(h, 'const ABOUT = "Nepal is more than a destination — it\'s a journey. From Himalayan peaks to ancient cities, every experience brings you closer to its nature, culture and people."',
        'const ABOUT = "Ein kleines Studio, persönlich und direkt. Vom ersten Gespräch bis zum Start sprechen Sie mit derselben Person. Wir planen jede Website für genau einen Betrieb, damit sie gefunden wird und zu Ihnen passt."')

# Bilder: eigene Bilder je Karte, sonst Bild vom Template
h = h.replace('src={base + t.id + ".webp"}', 'src={(t as any).img || base + t.id + ".webp"}')
h = h.replace('src={base + tour.id + ".webp"}', 'src={(tour as any).img || base + tour.id + ".webp"}')

# Navigation
h = rep(h, 'aria-label="Main"', 'aria-label="Hauptmenü"')
h = rep(h, 'aria-label="Menu"', 'aria-label="Menü"')
h = rep(h, '''          Log in
        </a>''', '''          Erstgespräch
        </a>''')

# Hero
h = rep(h, '<span className="hj-rise" style={{ animationDelay: "250ms" }}>Nepal</span>', '<span className="hj-rise" style={{ animationDelay: "250ms" }}>Websites für</span>')
h = rep(h, '{"Discover beyond the ordinary.".split(" ")', '{"Wir machen das.".split(" ")')
h = rep(h, 'alt="Snow peaks at dawn above dark forested ridges"', 'alt=""')
h = rep(h, "Journeys through Nepal I design and lead myself — your pace, your path, your sense of wonder. Every trip feels personal, effortless, and truly yours.",
        "Persönlich geplant und betreut. Mit kostenlosem Erstgespräch, wo Sie wollen: am Telefon, per WhatsApp, per Video oder bei Ihnen vor Ort.")
h = rep(h, "<span>Build my trip now</span>\n              <span aria-hidden=\"true\">Write to Kedhareswer</span>",
        "<span>Erstgespräch anfragen</span>\n              <span aria-hidden=\"true\">Kostenlos und unverbindlich</span>")

# Arbeiten
h = rep(h, '<span className="hj-pill" data-rv="">Your journey</span>', '<span className="hj-pill" data-rv="">Arbeiten</span>')
h = rep(h, '''          Discover <span className="hj-serif">Our Most</span>
          <br />
          <span className="hj-serif">Popular</span> Tours''', '''          Seiten, <span className="hj-serif">die man</span>
          <br />
          <span className="hj-serif">gern</span> anschaut''')
h = rep(h, 'aria-label="Popular tours"', 'aria-label="Beispielseiten"')
h = rep(h, 'aria-label={"Explore " + t.name}>\n                Explore', 'aria-label={"Ansehen: " + t.name}>\n                Ansehen')
h = rep(h, 'aria-label="Previous tour"', 'aria-label="Vorherige Seite"')
h = rep(h, 'aria-label="Next tour"', 'aria-label="Nächste Seite"')
h = rep(h, '?subject=The%20full%20list%20of%20tours"}>View More Tours</a>', '?subject=Erstgespr%C3%A4ch"}>Erstgespräch anfragen</a>')

# Detailansicht
h = rep(h, 'aria-label="Close"', 'aria-label="Schließen"')
h = rep(h, '{"Tour " + String(index + 1)', '{"Beispiel " + String(index + 1)')
h = rep(h, '{tour.blurb + " Designed and led by Kedhareswer, paced around you."}', '{tour.blurb}')
h = rep(h, '<div><span>From</span><b>{tour.price}</b></div>', '<div><span>Bereich</span><b>{tour.price}</b></div>')
h = rep(h, '<div><span>Length</span><b>{tour.days}</b></div>', '<div><span>Schwerpunkt</span><b>{tour.days}</b></div>')
h = rep(h, '<div><span>Season</span><b>{tour.season}</b></div>', '<div><span>Inhalt</span><b>{tour.season}</b></div>')
h = rep(h, '<div><span>Highest</span><b>{tour.peak}</b></div>', '<div><span>Ziel</span><b>{tour.peak}</b></div>')
h = rep(h, '{"Day " + (k + 1)}', '{"0" + (k + 1)}')
h = rep(h, 'encodeURIComponent("Trip: " + tour.name)}>Plan this trip with me</a>', 'encodeURIComponent("Anfrage: " + tour.name)}>So eine Seite anfragen</a>')

# Über uns
h = rep(h, '<span className="hj-pill" data-rv="">About Nepal</span>', '<span className="hj-pill" data-rv="">Über ERGUN.</span>')

# Leistungen (Bento)
h = rep(h, '<span style={{ transform: allIn ? "none" : "translateY(-100%)" }}>all-inclusive</span>\n                <span style={{ transform: allIn ? "none" : "translateY(-100%)" }}>route only</span>',
        '<span style={{ transform: allIn ? "none" : "translateY(-100%)" }}>mit Betreuung</span>\n                <span style={{ transform: allIn ? "none" : "translateY(-100%)" }}>nur Website</span>')
h = rep(h, 'aria-label="All-inclusive"', 'aria-label="Mit Betreuung"')
h = rep(h, "Journeys made personal travel at your own pace, discover hidden places and experience Nepal beyond the usual routes — <b>authentic, personal and unforgettable.</b>",
        "Ihre Website, dazu WhatsApp und Termine, Ihre Bilder und Videos schön eingebunden, Google-Profil und Updates nach dem Start. <b>Alles aus einer Hand, ohne dass Sie sich um Technik kümmern.</b>")
h = rep(h, "Just the route, the permits and me as your guide. Stay where you like, eat where you like — <b>light, flexible and still yours.</b>",
        "Nur die Website: schön, schnell am Handy und bei Google zu finden. Inhalte pflegen Sie selbst oder sagen uns später Bescheid. <b>Schlank und trotzdem persönlich.</b>")
h = rep(h, '<span style={{ transform: allIn ? "none" : "translateY(-100%)" }}>Tailor-Made</span>\n              <span style={{ transform: allIn ? "none" : "translateY(-100%)" }} aria-hidden="true">Route Only</span>',
        '<span style={{ transform: allIn ? "none" : "translateY(-100%)" }}>Rundum-Paket</span>\n              <span style={{ transform: allIn ? "none" : "translateY(-100%)" }} aria-hidden="true">Nur Website</span>')
h = rep(h, 'alt="Kedhareswer on a high trail below a snow peak"', 'alt=""')
h = rep(h, 'assetBase + "trekker.webp"', 'assetBase + "annapurna.webp"')
h = rep(h, '''              Made for You''', '''              Persönlich''')
h = rep(h, '<div><span>Your guide</span>Kedhareswer</div>', '<div><span>Ansprechpartner</span>immer derselbe</div>')
h = rep(h, '<div><span>Group size</span>2 – 8 people</div>', '<div><span>Gespräch</span>Telefon, WhatsApp, Video, vor Ort</div>')
h = rep(h, '<div><span>Languages</span>English · Hindi · Telugu</div>', '<div><span>Antwort</span>innerhalb von 24 Stunden</div>')
h = rep(h, '<div><span>Starts with</span>a 20-minute call</div>', '<div><span>Start</span>kostenloses Erstgespräch</div>')
h = rep(h, '<Roll value="50+" on={bentoOn} delay={300} /></div>\n          <h4>Unique Experiences</h4>\n          <p>Carefully selected journeys designed to reveal the real beauty, culture and spirit of Nepal.</p>',
        '<Roll value="5" on={bentoOn} delay={300} /></div>\n          <h4>Leistungen aus einer Hand</h4>\n          <p>Website, WhatsApp und Termine, Bilder und Videos einbinden, 3D und Bewegung, Google-Profil und Betreuung.</p>')
b0 = h.index('<div className="hj-bars">'); b1 = h.index("</div>\n        </div>\n      </section>", b0)
h = h[:b0] + '''<div className="hj-bars">
            {[["Standard", "Infos und Kontakt"], ["Erweitert", "mehr Bilder und Seiten"], ["Premium", "Video, 3D, Termine"]].map(([a, b]) => (
              <div className="hj-bar" key={a}>
                <span>{a}</span>
                <span style={{ opacity: .7 }}>{b}</span>
              </div>
            ))}
          ''' + h[b1:]

# Ablauf (gestapelte Karten) vor den Zahlen
h = rep(h, '<section className="hj-stats" ref={statsRef} aria-label="In numbers">', '''<section className="hj-steps" data-spy="steps" id="hj-steps">
        <span className="hj-pill" data-rv="">Ablauf</span>
        <h2 className="hj-h2" data-rv="">In vier Schritten <span className="hj-serif">online</span></h2>
        <div className="hj-stack">
          {STEPS.map((s, i) => (
            <article className="hj-step" key={s.t} style={{ "--i": i } as CSSProperties} data-k={i}>
              <span className="hj-step-n">{"0" + (i + 1)}</span>
              <div>
                <em>{s.w}</em>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="hj-stats" ref={statsRef} aria-label="In Zahlen">''')

# Footer
h = rep(h, '''            Your Nepal, <span className="hj-serif">planned with me.</span>''', '''            Sie brauchen eine Website? <span className="hj-serif">Wir machen das.</span>''')
h = rep(h, '''          {brand} — tours designed and led by Kedhareswer
          <br />
          Kathmandu · Pokhara · the high trails''', '''          {brand} · Websites für jeden, der eine braucht
          <br />
          <a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a>''')

# Stapel-CSS anhängen
h = rep(h, 'const CSS =\n', '''const CSS_STEPS = ".hj-steps{padding:clamp(80px,12vh,140px) clamp(18px,5vw,64px);max-width:1180px;margin:0 auto}" +
  ".hj-stack{margin-top:clamp(28px,5vh,56px)}" +
  ".hj-step{position:sticky;top:calc(96px + var(--i) * 26px);display:grid;grid-template-columns:auto 1fr;gap:clamp(18px,4vw,60px);align-items:start;min-height:min(52vh,460px);margin-bottom:14vh;padding:clamp(26px,4vw,56px);border-radius:32px;background:var(--card);color:var(--ink);box-shadow:0 -1px 0 rgba(255,255,255,.6) inset,0 30px 60px -34px rgba(15,20,40,.45);transform-origin:50% 0}" +
  ".hj-step[data-k='0']{background:#0e1422;color:#fff}.hj-step[data-k='1']{background:#2f6bff;color:#fff}.hj-step[data-k='2']{background:#f3f4f6}.hj-step[data-k='3']{background:#1b2236;color:#fff}" +
  ".hj-step-n{font-size:clamp(64px,11vw,150px);font-weight:600;line-height:.85;letter-spacing:-.05em;opacity:.9}" +
  ".hj-step em{display:inline-block;font-style:normal;font-size:13px;padding:6px 12px;border-radius:999px;background:rgba(127,140,170,.18);margin-bottom:18px}" +
  ".hj-step h3{margin:0 0 12px;font-size:clamp(30px,4.4vw,60px);font-weight:600;letter-spacing:-.035em;line-height:1}" +
  ".hj-step p{margin:0;max-width:34em;font-size:clamp(16px,1.5vw,20px);line-height:1.45;opacity:.82}" +
  "@media(max-width:640px){.hj-step{grid-template-columns:1fr;gap:6px;min-height:0;margin-bottom:8vh;top:calc(84px + var(--i) * 16px)}}" +
  ".hj-foot small a{all:unset;color:inherit;text-decoration:underline;cursor:pointer}"
const CSS = CSS_STEPS +
''')
open("src/himal.tsx", "w", encoding="utf-8").write(h)
print("ersetzt:", n)
