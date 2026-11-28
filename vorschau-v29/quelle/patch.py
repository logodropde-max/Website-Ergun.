import re,sys
p='/home/claude/drache-bau/'
s=open(p+'drache.orig.tsx',encoding='utf-8').read()
def R(a,b,cnt=1):
    global s
    n=s.count(a)
    if n<1: sys.exit('FEHLT: '+a[:80])
    s=s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)

# 1) Umlaute, Komma, Pfeil im Schriftsatz
R('  " ": [30, () => {}],\n}',
'''  " ": [30, () => {}],
  ",": [22, (p) => { p.dia(11, 92); p.spike(9, 96, 112, 18) }],
  "&": [70, (p) => { p.S(62, 100, 18, 46, 18, 20, 28, T, 44, T, 52, 18, 50, 34, 10, 66, 10, 84, 22, B, 44, B, 62, 70) }],
}
// Umlaute fuer deutsche Texte: Grundbuchstabe plus zwei Rauten ueber der Versalhoehe
for (const [u, b, a, c] of [["Ä", "A", 26, 50], ["Ö", "O", 22, 46], ["Ü", "U", 23, 47]] as [string, string, number, number][]) {
  const g = GLYPHS[b]
  GLYPHS[u] = [g[0], (p) => { g[1](p); p.dia(a, -17); p.dia(c, -17) }]
}''')

# 2) Handy erkennen
R('export const CHAPTERS =','''/** Handy/Tablet: weniger Geometrie, kein MSAA, kleinere Aufloesung, 30 Bilder pro Sekunde. */
export const MOBIL = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900)

export const CHAPTERS =''')
R('const soft = !probe || SOFTWARE.test','const soft = MOBIL || !probe || SOFTWARE.test')
R('const k = soft ? Math.min(dpr, Math.sqrt(8.5e5 / (w * h)))','const k = soft ? Math.min(MOBIL ? 1 : dpr, Math.sqrt((MOBIL ? 4.2e5 : 8.5e5) / (w * h)))')
# Bildrate begrenzen + React-Updates seltener
R('''    function tick(now: number) {
      raf = 0
      if (!visible) return''','''    let lastDraw = 0
    function tick(now: number) {
      raf = 0
      if (!visible) return
      if (MOBIL && now - lastDraw < 32) {
        raf = requestAnimationFrame(tick)
        return
      }
      lastDraw = now''')
R('if (!last || Math.abs(p - last.p) > 1e-5 ||','if (!last || Math.abs(p - last.p) > (MOBIL ? 6e-4 : 1e-5) ||')
# Koernung (teurer SVG-Filter) auf dem Handy weg
R('<rect x={-2000} y={-2000} width={5600} height={5000} filter={"url(#" + id + "-grain)"}','{MOBIL ? null : <rect x={-2000} y={-2000} width={5600} height={5000} filter={"url(#" + id + "-grain)"}')
R('opacity={0.1 * (1 - vis[4])} />','opacity={0.1 * (1 - vis[4])} />}')

# 3) Texte
T=[
('<Label text="SLAB SERIF" x={1136} y={895}','<Label text="PERSÖNLICH" x={1136} y={895}'),
('<Label text="FONT FAMILY" x={1136} y={925}','<Label text="GEPLANT" x={1136} y={925}'),
('''<Word key={w} text="A" x={1200 + k * 58} y={925}''','''<Word key={w} text="E" x={1200 + k * 58} y={925}'''),
('<Label text={"VOL. 01 / " + year} x={61} y={110}','<Label text={"WEBDESIGN / " + year} x={61} y={110}'),
('<Label text="AN EXPERIMENTAL SLAB SERIF FORGED FROM SCALE - SPINE AND HORN - WITH SHARP SLABS AND THORNED ENDS"','<Label text="WIR MACHEN WEBSITES FÜR JEDEN, DER EINE BRAUCHT."'),
('<Label text="ONE ANGULAR SKELETON CUT IN FOUR WEIGHTS - MADE FOR COVERS - POSTERS AND BIG TITLES"','<Label text="PERSÖNLICH GEPLANT, KLAR GESTALTET UND SCHNELL ONLINE."'),
('<Label text="AND FOR ANYTHING THAT SHOULD LOOK BACK AT YOU."','<Label text="DAS ERSTGESPRÄCH IST KOSTENLOS, WO SIE MÖCHTEN."'),
('<Label text={"VOL. 01 / " + year} x={1547} y={68}','<Label text={"WEBDESIGN / " + year} x={1547} y={68}'),
('<Label text="SPECIMEN BOOK" x={1547}','<Label text="WEBSITES" x={1547}'),
('[title + " " + subtitle, "SLAB SERIF FONT FAMILY", "4 STYLES / " + (Object.keys(GLYPHS).length - 1) + " GLYPHS", "TYPE DESIGN - " + studio, "DRAGON - LAYOUT AND MOTION - " + studio]',
 '[title + " " + subtitle, "WEBSITES FÜR JEDEN", "KOSTENLOSES ERSTGESPRÄCH", "INDIVIDUELL GEPLANT", "FESTER PREIS NACH DEM GESPRÄCH"]'),
('<Label text="SPECIMEN - VOL. 01" x={800} y={908}','<Label text="PERSÖNLICH - VOR ORT ODER PER VIDEO" x={800} y={908}'),
('<Label text="UPPERCASE" x={365} y={222}','<Label text="JEDE WEBSITE" x={365} y={222}'),
('<Label text="A TO Z" x={1238} y={222}','<Label text="VON A BIS Z" x={1238} y={222}'),
('<Label text="ALTERNATES" x={1238} y={522}','<Label text="INDIVIDUELL" x={1238} y={522}'),
('<Label text={side ? "INK" : "WEIGHT"}','<Label text={side ? "DESIGN" : "PLAN"}'),
('<Label text="4 WEIGHTS" x={408} y={186}','<Label text="SO LÄUFT ES AB" x={408} y={186}'),
('<Label text="ONE SKELETON" x={408} y={207}','<Label text="IN VIER SCHRITTEN" x={408} y={207}'),
('<Label text="REGULAR" x={336} y={408} cap={9} anchor="end" fill={ink} />','<Label text="SCHRITT" x={336} y={408} cap={9} anchor="end" fill={ink} />'),
('<Label text="OUTLINE" x={333} y={639} cap={9} anchor="end" fill={ink} />','<Label text="ERGUN." x={333} y={639} cap={9} anchor="end" fill={ink} />'),
('<Label text="SLAB SERIF FONT FAMILY" x={800} y={210}','<Label text="IHR STIL - IHRE WEBSITE" x={800} y={210}'),
('<Label text={side ? "UPPERCASE" : "ALTERNATE"}','<Label text={side ? "KLASSISCH" : "MIT KANTE"}'),
('const names = s === "bold-outline" ? ["BOLD", "OUTLINE"] : [s]','const names = [({ regular: "KLAR", bold: "STARK", outline: "LEICHT", "bold-outline": "MUTIG" } as Record<string, string>)[s]]'),
('aria-label={"Show the titles in " + s.replace("-", " ")}','aria-label={"Titel im Stil " + names[0] + " zeigen"}'),
('<Word text="ABC:123" x={cx}','<Word text="ERGUN." x={cx}'),
('<Label text="ALT" x={768} y={244}','<Label text="MUTIG" x={768} y={244}'),
('<Label text="REG" x={768} y={376}','<Label text="KLAR" x={768} y={376}'),
('<Label text="STYLISTIC ALTERNATES"','<Label text="SCHNELL ONLINE"'),
('<Label text="REGULAR CHARACTER"','<Label text="PERSÖNLICH BETREUT"'),
('<Label text="STYLISTIC SET"','<Label text="WEBDESIGN"'),
('<Word text="AGKNRSVZ" x={1112} y={623}','<Word text="WEBSITES" x={1112} y={623}'),
('<Word text="AGKNRSVZ" x={1112} y={831}','<Word text="WEBSITES" x={1112} y={831}'),
('<Word text="EXPERIMENTAL" x={221} y={201} cap={26} tracking={14}','<Word text="LASSEN SIE UNS" x={221} y={201} cap={26} tracking={10}'),
('<Word text="LIQUID-LIKE" x={221} y={251} cap={35} weight={WEIGHTS.bold} tracking={22}','<Word text="REDEN." x={221} y={251} cap={35} weight={WEIGHTS.bold} tracking={22}'),
('<Word text="EFFECT" x={221} y={300} cap={35} weight={WEIGHTS.bold} tracking={26}','<Word text="ANFRAGEN" x={221} y={300} cap={35} weight={WEIGHTS.bold} tracking={18}'),
]
for a,b in T: R(a,b)

# Seite 4: Ziffern 1-4 statt G, mittig in den Griff-Boxen, darunter die Schritte
R('''<Word text="G" x={x} y={G_ROW.base - lift} cap={G_ROW.cap} weight={w} fill={hoverG === k ? "#ffffff" : ink} reveal={kk} />
                      <Word text="G" x={x} y={717 - lift} cap={G_ROW.cap} weight={w} outline={outlineId} fill={ink} reveal={kk} />''',
'''<Word text={String(k + 1)} x={x + (GLYPHS.G[0] * G_ROW.cap) / 200} y={G_ROW.base - lift} cap={G_ROW.cap} weight={w} anchor="middle" fill={hoverG === k ? "#ffffff" : ink} reveal={kk} />
                      <Word text={String(k + 1)} x={x + (GLYPHS.G[0] * G_ROW.cap) / 200} y={717 - lift} cap={G_ROW.cap} weight={w} outline={outlineId} anchor="middle" fill={ink} reveal={kk} />
                      <Label text={["ERSTGESPRÄCH", "PLAN UND PREIS", "GESTALTUNG", "ONLINE"][k]} x={x + (GLYPHS.G[0] * G_ROW.cap) / 200} y={772} cap={11} anchor="middle" fill={ink} opacity={kk} />''')

# Seite 7: Anfrage-Text klickbar
R('''<Word text="LASSEN SIE UNS" x={221}''','''<g data-ui="" style={{ pointerEvents: "auto", cursor: "pointer" }} onClick={() => window.dispatchEvent(new CustomEvent("ergun-anfrage"))}>
              <rect x={210} y={160} width={420} height={160} fill="transparent" />
              <Word text="LASSEN SIE UNS" x={221}''')
R('''<Word text="ANFRAGEN" x={221} y={300} cap={35} weight={WEIGHTS.bold} tracking={18} fill={ink} reveal={rev[6]} />''',
  '''<Word text="ANFRAGEN" x={221} y={300} cap={35} weight={WEIGHTS.bold} tracking={18} fill={ink} reveal={rev[6]} />
              </g>''')
R('aria-label={title + " " + subtitle + ": a type specimen with a dragon moving through it"}','aria-label={"ERGUN. Webdesign: Websites für jeden"}')
R('''            scroll
''','''            scrollen
''')
open(p+'drache.tsx','w',encoding='utf-8').write(s)
print('ok')
