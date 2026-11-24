import re,os
B="/mnt/user-data/uploads/WebDesign/_code/vorlagen-21st/saves/"
def body(p):
    s=open(B+p,encoding="utf-8").read(); return s.split("\n---\n",1)[1] if s.startswith("---") else s
def from_prompt(p, name):
    s=body(p); a=s.index("```tsx")+6; b=s.index("\n```",a); blk=s[a:b]
    parts=re.split(r"\n([a-z0-9-]+\.tsx)\n", "\n"+blk)
    d=dict(zip(parts[1::2],parts[2::2]))
    return d[name]
def from_code(p):
    s=body(p); s=s.split("// --- Demo ---")[0]; return s.replace("// --- Component ---","",1)
out={
 "liquid-glass-logo-reveal.tsx": from_prompt("1 Intros & Preloader/Liquid Glass Logo Reveal ★/prompt.md","liquid-glass-logo-reveal.tsx"),
 "lets-work-section.tsx": from_prompt("5 UI-Bausteine/Lets Work Section ★/prompt.md","lets-work-section.tsx"),
 "border-beam.tsx": from_prompt("5 UI-Bausteine/Border Beam/prompt.md","border-beam.tsx"),
 "cloud-shader.tsx": from_code("4 Hintergründe, Shader & 3D/Cloud Shader/code.md"),
 "halftone-wordmark-footer.tsx": from_code("5 UI-Bausteine/Halftone Wordmark Footer ★/code.md"),
}
for k,v in out.items():
    v=v.replace('from "@/lib/utils"','from "./utils"')
    open("src/ext/"+k,"w",encoding="utf-8").write(v); print(k,len(v))
open("src/ext/utils.ts","w").write('import { clsx, type ClassValue } from "clsx"\nimport { twMerge } from "tailwind-merge"\nexport function cn(...i: ClassValue[]) { return twMerge(clsx(i)) }\n')

# ---------- Anpassungen
def edit(f, pairs):
    p="src/ext/"+f; s=open(p,encoding="utf-8").read()
    for a,b in pairs:
        if a not in s: raise SystemExit("FEHLT in "+f+": "+a[:70])
        s=s.replace(a,b)
    open(p,"w",encoding="utf-8").write(s)

edit("liquid-glass-logo-reveal.tsx",[("\nfunction GlassIconReveal(","\nexport function GlassIconReveal(")])

ICONS='''const ArrowUpRight = ({ className, style, strokeWidth = 1.5 }: any) => (<svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>)
const Calendar = ({ className, style, strokeWidth = 1.5 }: any) => (<svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>)'''
edit("lets-work-section.tsx",[
 ('import { ArrowUpRight, Calendar } from "lucide-react"', ICONS),
 ('window.open("https://cal.com/jatin-yadav05/15min", "_blank")', '(window as any).__ergunBook?.()'),
 ('>\n              Perfect\n', '>\n              Super\n'),
 ("Let's talk", "Dann sprechen wir"),
 ("Book a call", "Erstgespräch anfragen"),
 ("15 min intro call", "kostenlos und unverbindlich"),
 ("Available for projects", "Freie Termine für neue Websites"),
 ("Let's work", "Lassen Sie uns"),
 ('<span className="text-muted-foreground/60">together</span>', '<span className="text-muted-foreground/60">reden.</span>'),
 ("Have a project in mind? I'd love to hear about it. Let's create something exceptional together.", "Sie brauchen eine Website oder haben eine Idee? Erzählen Sie uns davon. Das Erstgespräch ist kostenlos, wo Sie wollen."),
 ("hello@example.com", "ergun.eu@gmail.com"),
 ('<section className="flex min-h-screen items-center justify-center px-6">', '<section className="flex min-h-[80vh] items-center justify-center px-6 py-24">'),
])
edit("halftone-wordmark-footer.tsx",[("Back to top ↑","Nach oben ↑")])
import re as _re
p="src/ext/border-beam.tsx"; s=open(p,encoding="utf-8").read()
s=_re.sub(r"\.join\('([^'\n]*)\n([ \t]*)'\)", lambda m: ".join('"+m.group(1)+"\\n"+m.group(2)+"')", s)
open(p,"w",encoding="utf-8").write(s)
s=open(p,encoding="utf-8").read()
s=_re.sub(r"'(\n+)'", lambda m: "'"+"\\n"*len(m.group(1))+"'", s)
s=_re.sub(r"\.join\('([^'\n]*)\n([ \t]*)'\)", lambda m: ".join('"+m.group(1)+"\\n"+m.group(2)+"')", s)
open(p,"w",encoding="utf-8").write(s)
