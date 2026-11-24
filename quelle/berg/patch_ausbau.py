# Ausbau Berg: Wolken hinter "Über uns", Lichtstrahl um den Hero-Knopf, eigener Schluss, ruhiges Wechselwort
p = "src/himal.tsx"
h = open(p, encoding="utf-8").read()
def rep(a, b):
    global h
    if a not in h:
        raise SystemExit("FEHLT: " + a[:90])
    h = h.replace(a, b, 1)

rep('import { useCallback,', 'import CloudShader from "./ext/cloud-shader"\nimport BeamBorder from "./ext/border-beam"\nimport { useCallback,')
rep('tours = TOURS, className, style }: HimalJourneysTemplateProps) {', 'tours = TOURS, className, style, extra }: HimalJourneysTemplateProps & { extra?: any }) {')

# Wechselwort: eigene Zeile, feste Breite (breitestes Wort), weich ein- und ausblenden
rep('style={widths[i] ? { width: widths[i] } : undefined}', 'style={widths.length ? { width: Math.max(...widths) } : undefined}')
rep('<span className="hj-rise" style={{ animationDelay: "250ms" }}>Websites für</span>{" "}\n            <span className="hj-rise" style={{ animationDelay: "380ms" }}>',
    '<span className="hj-rise" style={{ animationDelay: "250ms" }}>Websites für</span>\n          </span>\n          <span>\n            <span className="hj-rise" style={{ animationDelay: "380ms" }}>')
rep('".hj-morph{position:relative;margin-left:.08em;display:inline-block;vertical-align:top;white-space:nowrap;text-align:left;transition:width .75s " + EASE + "}"',
    '".hj-morph{position:relative;display:inline-block;vertical-align:top;white-space:nowrap;text-align:center}"')
rep('".hj-morph>span[data-out]{position:absolute;left:0;top:0}"', '".hj-morph>span[data-out]{position:absolute;left:0;right:0;top:0}"')
rep('"@keyframes hj-chin{from{opacity:0;transform:translateY(.45em) rotate(6deg);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}"',
    '"@keyframes hj-chin{from{opacity:0;transform:translateY(.22em);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}"')
rep('"@keyframes hj-chout{from{opacity:1;transform:none;filter:none}to{opacity:0;transform:translateY(-.4em) rotate(-5deg);filter:blur(8px)}}"',
    '"@keyframes hj-chout{from{opacity:1;transform:none;filter:none}to{opacity:0;transform:translateY(-.22em);filter:blur(6px)}}"')
rep("(out ? k * 14 : 120 + k * 32)", "(out ? k * 10 : 80 + k * 18)")

# Lichtstrahl um den Hero-Knopf
a0 = h.index('<a className="hj-cta hj-rise"'); a1 = h.index("</a>", a0) + 4
knopf = h[a0:a1].replace(' hj-rise" style={{ animationDelay: "1050ms" }}', '"')
h = h[:a0] + '<span className="hj-rise hj-beamwrap" style={{ animationDelay: "1050ms" }}><BeamBorder size="md" colorVariant="sunset" theme="dark" borderRadius={999} duration={3.2}>' + knopf + '</BeamBorder></span>' + h[a1:]

# Wolken hinter "Über uns"
rep('<section className="hj-about" data-spy="about" id="hj-about">',
    '<section className="hj-about" data-spy="about" id="hj-about">\n        <div className="hj-cloudbg" aria-hidden="true"><CloudShader speed={0.6} count={5} skyTopColor="#9fb8e8" skyBottomColor="#f4f6fb" cloudColor="#ffffff" /></div>')

# Footer ersetzen durch eigenen Schluss (Lets Work + Halftone-Footer kommen von außen)
f0 = h.index('<footer className="hj-foot"'); f1 = h.index("</footer>", f0) + 9
h = h[:f0] + '<div data-spy="contact" id="hj-contact">{extra}</div>' + h[f1:]

rep("const CSS = CSS_STEPS +", 'const CSS_AUSBAU = ".hj-about{position:relative;isolation:isolate;padding-bottom:150px;overflow:hidden}.hj-cloudbg{position:absolute;inset:0;z-index:-1}.hj-cloudbg>div{position:absolute!important;inset:0;height:100%!important;min-height:0!important}.hj-beamwrap{display:inline-block;border-radius:999px}"\nconst CSS = CSS_STEPS + CSS_AUSBAU +')
open(p, "w", encoding="utf-8").write(h)
print("Ausbau ok")
