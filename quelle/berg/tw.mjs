import { compile } from "/opt/npm-tools/node_modules/tailwindcss/dist/lib.mjs"
import fs from "fs"
const base = "/opt/npm-tools/node_modules/tailwindcss/"
const input = `@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@theme { --color-foreground: var(--foreground); --color-muted-foreground: var(--muted-foreground); --color-border: var(--border); --color-background: var(--background); }`
const c = await compile(input, { base, loadStylesheet: async (id, b) => { const p = base + id.replace("tailwindcss/", ""); return { content: fs.readFileSync(p, "utf8"), base: b, path: p } } })
const cand = new Set()
for (const f of process.argv.slice(2)) { const s = fs.readFileSync(f, "utf8"); for (const m of s.matchAll(/className="([^"]+)"/g)) m[1].split(/\s+/).forEach((x) => x && cand.add(x)) }
fs.writeFileSync("dist/tw.css", c.build([...cand]))
console.log(cand.size, fs.statSync("dist/tw.css").size)
