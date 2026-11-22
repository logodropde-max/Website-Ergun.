(()=>{var Et=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,$e=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,Qe=$e+`uniform float u_time;
uniform float u_aspect;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
uniform float u_octaves;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    if (float(i) >= u_octaves) break;
    v += a * noise(p);
    p = turn * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vec2(vUv.x * u_aspect, vUv.y) * 1.2;
  float t = u_time * 0.06;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p + 3.5 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm(p + 3.0 * r);

  // fbm rarely leaves 0.25..0.8, so the thresholds sit inside that range:
  // set wider, the field is mostly ground and the glass has nothing to bend.
  vec3 col = u_c0;
  col = mix(col, u_c3, smoothstep(0.25, 0.72, q.x) * 0.9);
  col = mix(col, u_c1, smoothstep(0.34, 0.74, f));
  col = mix(col, u_c2, smoothstep(0.42, 0.8, r.y) * 0.8);
  col = mix(col, u_c4, smoothstep(0.55, 0.9, f * r.x * 1.8) * 0.7);

  float bands = 0.5 + 0.5 * sin((f * 7.0 + r.x * 3.0) * 3.14159);
  col *= mix(0.86, 1.1, smoothstep(0.2, 0.8, bands));

  // A faint glow behind the headline: one focal point, and more light for
  // the glass to bend.
  vec2 g = (vUv - vec2(0.5, 0.56)) / vec2(0.5, 0.2);
  col += u_c4 * 0.07 * exp(-dot(g, g));

  // Quieter toward the foot, and a soft scrim where the description and
  // buttons sit, so body copy never lands on a busy patch.
  col *= mix(0.42, 1.0, smoothstep(0.02, 0.62, vUv.y));
  vec2 s = (vUv - vec2(0.5, 0.33)) / vec2(0.32, 0.13);
  col *= 1.0 - 0.4 * exp(-dot(s, s));
  o = vec4(col, 1.0);
}`,De=$e+`uniform sampler2D u_src;
uniform vec2 u_step;
uniform float u_radius;
uniform float u_read;
uniform float u_write;
float pick(vec4 t) {
  // 0: the raw mask, ignoring faint anti-alias debris; 1: the bevel; 2: the dome.
  return u_read < 0.5 ? smoothstep(0.06, 1.0, t.r) : u_read < 1.5 ? t.r : t.b;
}
void main() {
  float sigma = max(u_radius * 0.5, 0.5);
  float sum = 0.0;
  float weights = 0.0;
  for (int i = -24; i <= 24; i++) {
    float x = float(i) * u_radius / 24.0;
    float w = exp(-0.5 * x * x / (sigma * sigma));
    sum += pick(texture(u_src, vUv + u_step * x)) * w;
    weights += w;
  }
  vec4 here = texture(u_src, vUv);
  float blurred = sum / weights;
  o = vec4(u_write < 0.5 ? blurred : here.r, here.g, u_write < 0.5 ? here.b : blurred, 1.0);
}`,Ze=$e+`uniform sampler2D u_field;
uniform sampler2D u_height;
uniform vec2 u_htexel;
uniform float u_bevel;
uniform float u_aspect;
uniform vec2 u_light;
uniform float u_glass;
uniform float u_form;
uniform vec2 u_res;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// A rounded bevel, steep at the letter's edge, plus a gentle dome across the
// face. Flat faces read as panes of one tint, and a stem is a rectangle, so
// every stem looked like a box; the dome makes each one a volume.
float bevel(vec2 p) {
  vec4 t = texture(u_height, p);
  float x = clamp((t.r - 0.5) * 2.0, 0.0, 1.0);
  float edge = sqrt(1.0 - (1.0 - x) * (1.0 - x));
  float dome = clamp((t.b - 0.5) * 2.0, 0.0, 1.0);
  return edge * 0.8 + dome * 0.45;
}

void main() {
  vec2 uv = vUv;
  vec2 hv = texture(u_height, uv).rg;
  // Tight tracking overlaps glyphs, and the canvas leaves faint seams (a few
  // /255) along their edges. Counted as glass, they tint every glyph's box.
  float inside = smoothstep(0.08, 0.92, hv.g) * u_glass * u_form;

  // Slope from a Sobel stencil two texels wide. A bilinear height map has a
  // constant slope inside each texel that jumps at the texel edge; a narrow
  // difference hands those steps to the highlight, which turns them into a
  // fine dot grid across every face that faces the light.
  vec2 dx = vec2(u_htexel.x * 2.0, 0.0);
  vec2 dy = vec2(0.0, u_htexel.y * 2.0);
  float tl = bevel(uv - dx + dy);
  float tc = bevel(uv + dy);
  float tr = bevel(uv + dx + dy);
  float ml = bevel(uv - dx);
  float mr = bevel(uv + dx);
  float bl = bevel(uv - dx - dy);
  float bc = bevel(uv - dy);
  float br = bevel(uv + dx - dy);
  vec2 grad = vec2((tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl), (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br)) / 16.0 * u_bevel;
  vec3 n = normalize(vec3(-grad * 0.9, 1.0));

  // Light sits above the stage at the pointer.
  vec2 toLight = (u_light - uv) * vec2(u_aspect, 1.0);
  vec3 L = normalize(vec3(toLight, 0.45));
  vec3 halfway = normalize(L + vec3(0.0, 0.0, 1.0));
  float facing = max(dot(n, halfway), 0.0);
  // Two highlights: a pin of light and a soft sheen around it. One broad lobe
  // reads as plastic.
  float pin = pow(facing, 160.0);
  float sheen = pow(facing, 24.0);
  float rim = pow(1.0 - n.z, 2.0);
  // A studio light from above: upper bevels catch it, lower ones fall away.
  float studio = smoothstep(-0.7, 0.7, n.y);

  // Refraction, each channel bent a different amount: the prism fringe.
  vec2 bend = -n.xy * 0.05 * u_form * vec2(1.0 / u_aspect, 1.0);
  vec3 through = vec3(
    texture(u_field, uv + bend * 0.84).r,
    texture(u_field, uv + bend).g,
    texture(u_field, uv + bend * 1.18).b);
  // Light enters on the lit side and gathers along the far inner edge.
  vec2 ld = normalize(toLight + 1e-5);
  float gather = rim * max(dot(normalize(n.xy + 1e-5), -ld), 0.0);
  // The rim does not depend on where the pointer is: glass keeps a bright
  // edge from every angle, which keeps letters far from it legible.
  vec3 glass = through * 0.86 + 0.06
    + rim * mix(0.28, 0.72, studio)
    + sheen * 0.16 + pin * 1.3
    + gather * vec3(1.0, 0.93, 0.82) * 0.55;
  // A thin dark line where the glass meets the air defines the edge.
  float lip = smoothstep(0.42, 0.5, hv.r) * (1.0 - smoothstep(0.5, 0.6, hv.r));
  glass *= 1.0 - 0.28 * lip;

  // Behind the glass: a short contact shadow, cast away from the light. Cast
  // any further (or with a caustic ring) it reads as a second headline.
  vec2 away = normalize(toLight + 1e-5) * vec2(1.0 / u_aspect, 1.0);
  float shade = texture(u_height, uv + away * 0.012).r;
  vec3 bg = texture(u_field, uv).rgb;
  bg *= 1.0 - 0.32 * smoothstep(0.1, 0.7, shade) * u_glass;

  vec3 col = mix(bg, glass, inside);
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
  o = vec4(col, 1.0);
}`;var on=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function Ft(d){let b=/^#?([0-9a-f]{6})$/i.exec(d.trim());if(!b)return null;let z=parseInt(b[1],16);return[(z>>16&255)/255,(z>>8&255)/255,(z&255)/255]}function Tt(d){return on.map((b,z)=>Ft((d&&d[z])!=null?d[z]:"")||Ft(b))}function ye(d,b){return Math.max(2,d*.075*b)}function rn(d,b){let z=Math.min(Math.max(d/b,0),1);return 1-Math.pow(1-z,3)}function Rt(d){let b=(z,se)=>"rgba("+z.map(me=>Math.round(me*255)).join(",")+","+se+")";return"radial-gradient(70% 60% at 25% 30%,"+b(d[1],.3)+",transparent 72%),radial-gradient(60% 55% at 78% 35%,"+b(d[3],.32)+",transparent 72%),radial-gradient(55% 50% at 60% 80%,"+b(d[2],.12)+",transparent 72%),"+b(d[0],1)}function Mt(d,b,z,se){return b+(d-b)*Math.exp(-se*z)}function sn(d){return[.5+.32*Math.sin(d*.37),.56+.16*Math.sin(d*.53+1.1)]}(function(){let d=document.querySelector("[data-glas-root]");if(!d)return;let b=document.documentElement,z=new URLSearchParams(location.search),se=["#0B0C17","#D4642F","#B98CA6","#2B44B8","#EAD7B6"],me=Tt(se),Fe=[se,["#06111C","#1FA6A0","#6E8BFF","#1B3F9E","#CFF4EE"],["#0D0918","#9B4DFF","#FF6FB5","#3A2C9E","#F3D9FF"],["#07120F","#2FBF71","#7FD8FF","#14506B","#E2FFD6"],["#140A10","#FF7A45","#FFB84D","#8A2C6E","#FFE9C7"]].map(Tt),At=9e3;function St(e){let t=e/At,o=Math.floor(t)%Fe.length,r=(o+1)%Fe.length,v=t-Math.floor(t),s=v*v*(3-2*v);return Fe[o].map((u,g)=>u.map((_,x)=>_+(Fe[r][g][x]-_)*s))}let m=d.querySelector("[data-glas-canvas]"),X=d.querySelector("[data-glas-titel]"),H=b.classList.contains("glas-fein"),le=H&&b.classList.contains("glas-nahtlos"),ge=H&&b.classList.contains("blatt-glas"),et=!!document.querySelector("[data-glas-titel] .glas-klartext"),q=H&&b.classList.contains("ruhe"),O=q&&b.classList.contains("schrift-weg"),Lt=.14,kt=.08,Ut=600,Bt=O&&b.classList.contains("titel-takt"),Ct=.5,tt=.6,N=Bt&&b.classList.contains("kopf-nativ"),Y=q&&(!O||N)?d.querySelector(".ghr-content"):null,ce=0,nt=window.innerWidth,Dt=.4,Pt=.3,Te=Math.min(window.devicePixelRatio||1,2),Re=window.matchMedia("(max-width: 899px)").matches,Me=H&&q&&Re&&b.classList.contains("titel-scharf"),at=3;function Ae(){if(N)return Math.round((window.scrollY||0)*Te)/Te;if(!Y)return ce;let e=Math.round((window.scrollY||0)*Te)/Te;return(e!==ce||!Y.style.transform)&&(ce=e,Y.style.transform="translate3d(0,"+-e+"px,0)",Y.style.visibility=e>d.offsetHeight+40?"hidden":""),ce}q&&(b.classList.add("glas-ruhe"),Ae());let j=(e,t)=>(t||document).querySelector(e),pe=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function te(e,t,o){let r=document.createElement(e);return t&&(r.className=t),o!=null&&(r.textContent=o),r}d.style.height="100svh",d.style.background=Rt(me);let ve=null,U=null,xe=null;if(H&&(ve=te("div","glas-buehne"),ve.setAttribute("aria-hidden","true"),ve.style.background=Rt(me),ve.appendChild(m),document.body.insertBefore(ve,document.body.firstChild),N&&(U=te("canvas","glas-titel-ebene"),U.setAttribute("aria-hidden","true"),U.style.visibility="hidden",d.insertBefore(U,d.firstChild)),d.style.background="transparent",et||(ge?X.innerHTML='<span class="glas-versteckt">ERGUN. \xB7 </span><span class="ghr-word">Webdesign</span>':X.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),le){let e=d.querySelector("[data-glas-text]");e&&e.classList.add("glas-unterzeile")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=j(e);t&&t.remove()});let be=j("main#inhalt"),ie=window.PREISE,Ie=te("footer","glas-fuss");Ie.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(ge?'<span class="glas-fuss__satz">Webdesign \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a><a href="agb.html">AGB</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',be&&be.parentNode.insertBefore(Ie,be.nextSibling),ie&&ie.klein&&(j("[data-glas-klein]",Ie).textContent=ie.klein+" "+(ie.steuer||""));function It(){let e=j("[data-glas-kopf]");return e?e.offsetHeight:0}function zt(e){let t=0;for(let o=e;o;o=o.offsetParent)t+=o.offsetTop;return t}let ot=window.matchMedia("(prefers-reduced-motion: reduce)");function it(e){e&&window.scrollTo({top:Math.max(0,zt(e)-It()-20),behavior:ot.matches?"auto":"smooth"})}function ze(){it(j("#angebote"))}function Oe(){let e=j("#preise .mf__oben");it(e&&!e.hidden?e:j("#preise .mf__raster"))}window.__kristall={zumKontakt:Oe,zuAngeboten:ze},document.addEventListener("click",e=>{if(H&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:ot.matches?"auto":"smooth"});return}let o=e.target.closest&&e.target.closest("[data-glas-ziel]");o&&(e.preventDefault(),o.getAttribute("data-glas-ziel")==="kontakt"?ie&&ie.zumFormular?ie.zumFormular():Oe():ze())});let rt=!1;function Ot(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Preise"),pe(".k-angebot",e).forEach(o=>{let r=j(".k-angebot__wort",o),v=j(".k-angebot__info",o),s=v&&v.querySelector("b")?v.querySelector("b").textContent.trim():"",u=v?v.textContent.replace(s,"").replace(/^\s*·\s*/,"").trim():"",g=s.split(" + "),_=pe("[data-glas-behalten]",o);o.classList.add("glas-karte"),o.innerHTML="",o.appendChild(te("span","k-angebot__wort glas-karte__titel",r?r.textContent:"")),o.appendChild(te("span","glas-karte__satz",u));let x=te("span","glas-karte__preis");x.appendChild(te("b","",g[0])),g[1]&&x.appendChild(te("small","","+ "+g.slice(1).join(" + "))),o.appendChild(x),_.forEach(D=>o.appendChild(D))}),rt=!0,!0}if((function e(t){!Ot()&&t<60&&setTimeout(()=>e(t+1),50)})(0),be){be.classList.add("glas-haupt");let e=j("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=j("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(o=>{o.isIntersecting&&(o.target.classList.add("ist-da"),e.unobserve(o.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>pe(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else b.classList.add("glas-alles-da");let Nt={palette:me,title:X.textContent},K={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},M={glas:!1,lite:!1,fps:0,bilder:0},Se=null,st=Qe.split("p + 3.5 * q").join("p + 2.3 * q").replace("fbm(p + 3.0 * r)","fbm(p + 2.0 * r)").replace("smoothstep(0.34, 0.74, f))","smoothstep(0.3, 0.86, f) * 0.9)").replace("smoothstep(0.42, 0.8, r.y) * 0.8)","smoothstep(0.42, 0.9, r.y) * 0.55)").replace("smoothstep(0.55, 0.9, f * r.x * 1.8) * 0.7)","smoothstep(0.58, 0.96, f * r.x * 1.8) * 0.4)"),lt=De.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),S=Ze.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);le&&(S=S.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let fe={schwarz:0,weiss:.8}[z.get("glasfeld")];fe!==void 0&&(S=S.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let Ne=z.get("glasdbg");if(H&&Ne&&(S=S.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(Ne==="g"?"dh.g":Ne==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),H&&O){let e=le?`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"";S=S.split("texture(u_height, vec2(0.0, -u_shift) + ").join("texture(u_height, vec2(0.0, -u_maske) + ").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_maske;
uniform float u_ohne;`).replace(`  vec2 uv = vUv;
`,`  vec2 uv = vUv;
  if (u_ohne > 0.5) {
  vec3 col = texture(u_field, uv).rgb;
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`+e+`  o = vec4(col, 1.0);
  return;
  }
`)}if(ge){let e=`uniform float u_detail;
vec3 zeichnung(vec3 c, vec2 uv) {
  if (u_detail <= 0.0) return c;
  vec2 px = 1.0 / u_res; vec3 lw = vec3(0.299, 0.587, 0.114);
  float l0 = dot(texture(u_field, uv).rgb, lw);
  float lx = dot(texture(u_field, uv + vec2(px.x * 4.0, 0.0)).rgb, lw), ly = dot(texture(u_field, uv + vec2(0.0, px.y * 4.0)).rgb, lw);
  float kante = clamp(length(vec2(lx - l0, ly - l0)) * 70.0, 0.0, 1.0);
  float stufe = l0 * 16.0, d = min(fract(stufe), 1.0 - fract(stufe));
  float linie = 1.0 - smoothstep(0.0, max(fwidth(stufe), 1e-4) * 1.15, d);
  c = mix(c, smoothstep(vec3(0.0), vec3(1.0), c), 0.3 * u_detail);
  c = mix(c, c * 1.18 + 0.025, linie * 0.3 * u_detail);
  c += vec3(1.0, 0.93, 0.86) * kante * kante * 0.09 * u_detail;
  c += (hash(floor(uv * u_res)) - 0.5) * 0.045 * u_detail;
  return c;
}
`;S=S.replace("uv + away * 0.012","uv + away * 0.0045").replace("bg *= 1.0 - 0.32 * smoothstep","bg *= 1.0 - 0.2 * smoothstep"),S=S.replace("void main() {",e+"void main() {").replace(`  vec3 bg = texture(u_field, uv).rgb;
`,`  vec3 bg = zeichnung(texture(u_field, uv).rgb, uv);
`).replace(`  vec3 col = texture(u_field, uv).rgb;
`,`  vec3 col = zeichnung(texture(u_field, uv).rgb, uv);
`)}Me&&(S=S.split("texture(u_height, ").join("hoehe(").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform vec2 u_band;
vec4 hoehe(vec2 p) { return texture(u_height, vec2(p.x, p.y * u_band.x + u_band.y)); }`));let Ge="";if(N){let e=S.indexOf("  vec3 col = mix(bg, glass, inside);"),t=/bg \*= 1\.0 - ([0-9.]+) \* smoothstep\(0\.1, 0\.7, shade\) \* u_glass;/.exec(S);e>0&&t&&S.indexOf("uniform float u_shift;")>0&&(Ge=S.slice(0,e).split("texture(u_field, uv + bend").join("texture(u_field, uv + vec2(0.0, u_feld) + bend").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_feld;`)+"  float schatten = "+t[1]+` * smoothstep(0.1, 0.7, shade) * u_glass;
  float a = 1.0 - (1.0 - schatten) * (1.0 - inside);
  vec3 g = glass * inside;
`+(le?`  float tief = smoothstep(0.55, 1.5, 1.0 - uv.y) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  g *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"")+`  g += (hash(floor(uv * u_res)) - 0.5) * 0.018 * a;
  o = vec4(g, a);
}
`)}let Gt=lt===De||S.indexOf("u_shift")<0||H&&O&&S.indexOf("u_ohne > 0.5")<0||Me&&S.split("texture(u_height, ").length!==2,C=H&&!Gt,Xt=.06;function qt(){let e=pe(".glas-z",X);if(e.length<2)return;e.forEach(s=>{s.style.marginLeft=""});let t=getComputedStyle(X),o=parseFloat(t.fontSize)||64,r=document.createElement("canvas").getContext("2d");if(!r)return;r.font=t.fontStyle+" "+t.fontWeight+" "+o+"px "+t.fontFamily,"letterSpacing"in r&&(r.letterSpacing="0px");let v=e.map(s=>{let u=s.getBoundingClientRect(),g=r.measureText(s.textContent);return[u.left-g.actualBoundingBoxLeft,u.left+g.actualBoundingBoxRight]});for(let s=1;s<e.length;s++)e[s].style.marginLeft=((Xt*o-(v[s][0]-v[s-1][1]))/o).toFixed(4)+"em"}function Le(){if(!C)return;X.style.fontSize="",qt();let e=X.querySelector(".ghr-word");if(!e)return;let t=e.getBoundingClientRect().width;if(ge){let s={};pe(".ghr-word",X).forEach(u=>{let g=u.getBoundingClientRect(),_=Math.round(g.top/4);s[_]=s[_]?[Math.min(s[_][0],g.left),Math.max(s[_][1],g.right)]:[g.left,g.right]}),t=Math.max(...Object.values(s).map(u=>u[1]-u[0]))}let o=parseFloat(getComputedStyle(X).fontSize)||64,r=o*.16,v=d.clientWidth*(1-2*.06);t+r>v&&(X.style.fontSize=(o*v/(t+r)).toFixed(2)+"px")}C&&(Le(),window.addEventListener("resize",()=>{q&&window.innerWidth===nt||(nt=window.innerWidth,Le())}));function ct(e,t,o,r,v){let s=0;r[0]=0,v[0]=-1e20,v[1]=1e20;for(let u=1;u<t;u++){let g=(e[u]+u*u-(e[r[s]]+r[s]*r[s]))/(2*u-2*r[s]);for(;g<=v[s];)s--,g=(e[u]+u*u-(e[r[s]]+r[s]*r[s]))/(2*u-2*r[s]);s++,r[s]=u,v[s]=g,v[s+1]=1e20}s=0;for(let u=0;u<t;u++){for(;v[s+1]<u;)s++;o[u]=(u-r[s])*(u-r[s])+e[r[s]]}}function ft(e,t,o){let r=Math.max(t,o),v=new Float64Array(r),s=new Float64Array(r),u=new Int32Array(r),g=new Float64Array(r+1);for(let _=0;_<t;_++){for(let x=0;x<o;x++)v[x]=e[x*t+_];ct(v,o,s,u,g);for(let x=0;x<o;x++)e[x*t+_]=s[x]}for(let _=0;_<o;_++){for(let x=0;x<t;x++)v[x]=e[_*t+x];ct(v,t,s,u,g);for(let x=0;x<t;x++)e[_*t+x]=s[x]}return e}function Wt(e){let t=Math.abs(e)/Math.SQRT2,o=1/(1+.3275911*t),r=1-((((1.061405429*o-1.453152027)*o+1.421413741)*o-.284496736)*o+.254829592)*o*Math.exp(-t*t);return e>=0?.5*(1+r):.5*(1-r)}function Ht(e,t,o,r){let v=e.getImageData(0,0,t,o),s=v.data,u=t,g=o,_=-1,x=-1;for(let B=0;B<o;B++)for(let w=0;w<t;w++)s[(B*t+w)*4]>0&&(w<u&&(u=w),w>_&&(_=w),B<g&&(g=B),B>x&&(x=B));if(_<0)return;let D=Math.ceil(r*2.5)+2;u=Math.max(0,u-D),g=Math.max(0,g-D),_=Math.min(t-1,_+D),x=Math.min(o-1,x+D);let P=_-u+1,I=x-g+1,ue=new Float64Array(P*I),ne=new Float64Array(P*I),V=new Float32Array(P*I);for(let B=0;B<I;B++)for(let w=0;w<P;w++){let y=B*P+w,R=s[((B+g)*t+w+u)*4]/255;V[y]=R,ue[y]=R<.5?0:1e20,ne[y]=R>=.5?0:1e20}ft(ue,P,I),ft(ne,P,I);let re=Math.max(r*.5,.5);for(let B=0;B<I;B++)for(let w=0;w<P;w++){let y=B*P+w,R=((B+g)*t+w+u)*4,A=V[y]>=.5?Math.sqrt(ue[y])-.5:.5-Math.sqrt(ne[y]),W=Math.abs(A)<1?V[y]-.5:A;s[R]=Math.round(Wt(W/re)*255),s[R+1]=Math.round(V[y]*255),s[R+2]=0}e.putImageData(v,0,0)}function Xe(){Se&&(Se(),Se=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:m.getContext("webgl2",{alpha:N,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||C&&!!e.getExtension("EXT_color_buffer_half_float"),o=!1,r=0,v=0,s=0,u=!0,g=!1,_=0,x=0,D={x:.5,y:.56},P=-1,I=window.matchMedia("(prefers-reduced-motion: reduce)"),ue=(a,n)=>{let l=e.createShader(a);if(!l)throw new Error("could not create shader");if(e.shaderSource(l,n),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(l));return l},ne=a=>{let n=e.createProgram();if(!n)throw new Error("could not create program");let l=ue(e.VERTEX_SHADER,Et),i=ue(e.FRAGMENT_SHADER,a);if(e.attachShader(n,l),e.attachShader(n,i),e.bindAttribLocation(n,0,"a_position"),e.linkProgram(n),e.deleteShader(l),e.deleteShader(i),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(n));let c={},h=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let f=0;f<h;f++){let p=e.getActiveUniform(n,f);p&&(c[p.name.replace(/^u_/,"")]=e.getUniformLocation(n,p.name))}return{prog:n,u:c}},V={tex:[],fbo:[]},re=(a,n,l)=>{let i=e.createTexture(),c=e.createFramebuffer();if(!i||!c)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),l&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,a,n,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,a,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,c),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),V.tex.push(i),V.fbo.push(c),{tex:i,fbo:c,w:a,h:n}},B=()=>{for(let a of V.tex)e.deleteTexture(a);for(let a of V.fbo)e.deleteFramebuffer(a);V.tex=[],V.fbo=[]},w=null,y=null,R=null,A=null,W=null,Q=4,_e=Me&&C,qe=null,dt=null,ke=!1,J=(a,n,l)=>{e.useProgram(a.prog);let i=0;for(let c in l){let h=a.u[c];if(!h)continue;let f=l[c];typeof f=="number"?e.uniform1f(h,f):Array.isArray(f)?f.length===2?e.uniform2f(h,f[0],f[1]):e.uniform3f(h,f[0],f[1],f[2]):(e.activeTexture(e.TEXTURE0+i),e.bindTexture(e.TEXTURE_2D,f),e.uniform1i(h,i++))}e.bindFramebuffer(e.FRAMEBUFFER,n?n.fbo:null),e.viewport(0,0,n?n.w:m.width,n?n.h:m.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Ue="",Yt=()=>{Le();let a=X,n=m.getBoundingClientRect(),l=g?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),i=_e?Math.min(window.devicePixelRatio||1,g?2:at):l,c=getComputedStyle(a),h=parseFloat(c.fontSize)||64,f=q&&!O?ce:window.scrollY||0,p=[],he=document.createTreeWalker(a,NodeFilter.SHOW_TEXT),ae=E=>!!(E.parentElement&&E.parentElement.closest&&E.parentElement.closest(".glas-versteckt, .glas-klartext"));for(let E=he.nextNode();E;E=he.nextNode())for(let k=0;k<(ae(E)?0:E.data.length);k++){if(/\s/.test(E.data[k]))continue;let Ve=document.createRange();Ve.setStart(E,k),Ve.setEnd(E,k+1);let Je=Ve.getBoundingClientRect();p.push([E.data[k],Je.left-n.left,Je.top+f,Je.height])}if(N){let E=Math.ceil(ye(h,1)*8+n.height*.015+16);xe=p.length?{von:Math.max(0,Math.min(...p.map(k=>k[2]))-E),bis:Math.min(n.height,Math.max(...p.map(k=>k[2]+(k[3]||h)))+E),root:d.getBoundingClientRect().top+(window.scrollY||0)}:null}let L=0,ee=n.height;if(_e&&p.length){let E=Math.ceil(ye(h,1)*8+n.height*.015+16);L=Math.max(0,Math.floor(Math.min(...p.map(k=>k[2]))-E)),ee=Math.min(n.height,Math.ceil(Math.max(...p.map(k=>k[2]+(k[3]||h)))+E)),ee-L<8&&(L=0,ee=n.height)}let T=Math.max(1,Math.round(n.width*i)),G=Math.max(1,Math.round((ee-L)*i)),oe=[T,G,i,L,c.font].concat(p.map(E=>E[0]+"@"+E[1].toFixed(1)+","+E[2].toFixed(1))).join("|");if(oe===Ue)return;Ue=oe;let de=document.createElement("canvas");de.width=T,de.height=G;let $=de.getContext("2d");if($){if($.fillStyle="#000",$.fillRect(0,0,T,G),$.font=c.fontStyle+" "+c.fontWeight+" "+(h*i).toFixed(2)+"px "+c.fontFamily,"letterSpacing"in $&&($.letterSpacing="0px"),$.fillStyle="#fff",$.textBaseline="alphabetic",p.forEach(E=>{let k=$.measureText(E[0]).fontBoundingBoxAscent||h*i*.8;$.fillText(E[0],E[1]*i,(E[2]-L)*i+k)}),Ht($,T,G,ye(h,i)),_e){let E=n.height,k=ee-L;qe=[E/k,1-(E-L)/k],dt=[1/T,1/Math.max(1,Math.round(E*i))]}return{cnv:de,w:T,h:G,fontPx:h,scale:i}}},jt=(a,n,l,i,c)=>{if(M.masken=(M.masken||0)+1,W||(W=e.createTexture()),e.bindTexture(e.TEXTURE_2D,W),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!R||R.w!==n||R.h!==l){for(let f of[R,A])f&&(e.deleteTexture(f.tex),e.deleteFramebuffer(f.fbo));R=re(n,l,!0),A=re(n,l,!0)}Q=ye(i,c);let h=Math.max(1.5*c,Q*.25);J(w.blur,R,{src:W,step:[1/n,0],radius:h,read:1,write:0}),J(w.blur,A,{src:R.tex,step:[0,1/l],radius:h,read:1,write:0}),J(w.blur,R,{src:A.tex,step:[1/n,0],radius:Q*3,read:1,write:1}),J(w.blur,A,{src:R.tex,step:[0,1/l],radius:Q*3,read:2,write:1})},Be=()=>{let a=X;if(!a||!y)return;if(O&&F.ziel===0){F.offen=!0;return}if(C){let T=Yt();T&&jt(T.cnv,T.w,T.h,T.fontPx,T.scale);return}let n=d.getBoundingClientRect(),l=g?1:Math.min(window.devicePixelRatio||1,1.5),i=Math.max(1,Math.round(n.width*l)),c=Math.max(1,Math.round(n.height*l)),h=Array.from(a.querySelectorAll(".ghr-word")),f=h.map(T=>T.getBoundingClientRect()),p=getComputedStyle(a),he=[i,c,l,p.font,p.letterSpacing].concat(h.map((T,G)=>(T.textContent||"")+"@"+Math.round(f[G].left-n.left)+","+Math.round(f[G].top-n.top))).join("|");if(he===Ue)return;Ue=he;let ae=document.createElement("canvas");ae.width=i,ae.height=c;let L=ae.getContext("2d");if(!L)return;L.fillStyle="#000",L.fillRect(0,0,i,c);let ee=parseFloat(p.fontSize)||64;if(L.setTransform(l,0,0,l,0,0),L.font=p.fontStyle+" "+p.fontWeight+" "+p.fontSize+" "+p.fontFamily,"letterSpacing"in L&&(L.letterSpacing=p.letterSpacing==="normal"?"0px":p.letterSpacing),L.fillStyle="#fff",L.textBaseline="alphabetic",h.forEach((T,G)=>{let oe=T.textContent||"",de=L.measureText(oe).fontBoundingBoxAscent||ee*.8;L.fillText(oe,f[G].left-n.left,f[G].top-n.top+de)}),W||(W=e.createTexture()),e.bindTexture(e.TEXTURE_2D,W),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,ae),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!R||R.w!==i||R.h!==c){for(let T of[R,A])T&&(e.deleteTexture(T.tex),e.deleteFramebuffer(T.fbo));R=re(i,c,!0),A=re(i,c,!0)}Q=ye(ee,l),!(!R||!A)&&(J(w.blur,R,{src:W,step:[1/i,0],radius:Q,read:0,write:0}),J(w.blur,A,{src:R.tex,step:[0,1/c],radius:Q,read:1,write:0}),J(w.blur,R,{src:A.tex,step:[1/i,0],radius:Q*3,read:1,write:1}),J(w.blur,A,{src:R.tex,step:[0,1/c],radius:Q*3,read:2,write:1}))},we=()=>{let a=C&&Ce?.35:q&&Re&&!g?Math.min(window.devicePixelRatio||1,1.5):g?C?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),n=!_e||ke?a:Math.max(a,Math.min(window.devicePixelRatio||1,g?1.5:at)),l=Math.max(1,Math.round(m.clientWidth*n)),i=Math.max(1,Math.round(m.clientHeight*n));(m.width!==l||m.height!==i)&&(m.width=l,m.height=i);let c=g?.25:.4,h=n===a?c:c*a/n,f=Math.max(1,Math.round(l*h)),p=Math.max(1,Math.round(i*h));(!y||y.w!==f||y.h!==p)&&(y&&(e.deleteTexture(y.tex),e.deleteFramebuffer(y.fbo)),y=re(f,p,!1)),Be()},We=U?U.getContext("2d"):null,Kt=(a,n)=>{if(!We)return;if(!(a>0)||!xe){U.style.visibility!=="hidden"&&(U.style.visibility="hidden");return}let l=m.height/Math.max(1,m.clientHeight),i=Math.max(0,Math.floor(xe.von*l)),c=Math.min(m.height,Math.ceil(xe.bis*l)),h=Math.max(1,c-i);(U.width!==m.width||U.height!==h)&&(U.width=m.width,U.height=h);let f=(i/l-xe.root).toFixed(3)+"px",p=(h/l).toFixed(3)+"px";U.style.top!==f&&(U.style.top=f),U.style.height!==p&&(U.style.height=p),e.enable(e.SCISSOR_TEST),e.scissor(0,m.height-c,m.width,h),J(w.titel,null,Object.assign({},n,{feld:n.shift,maske:0,ohne:0})),e.disable(e.SCISSOR_TEST),We.clearRect(0,0,U.width,h),We.drawImage(m,0,i,m.width,h,0,0,m.width,h),U.style.visibility&&(U.style.visibility=""),M.titelBand=[i,c]},Vt=()=>{if(!y||!A)return;let a=I.matches?Nt.palette:St(performance.now()),n=m.width/m.height;fe!==void 0?(e.bindFramebuffer(e.FRAMEBUFFER,y.fbo),e.viewport(0,0,y.w,y.h),e.clearColor(fe,fe,fe,1),e.clear(e.COLOR_BUFFER_BIT)):J(w.field,y,{time:s,aspect:n,octaves:g||Re?3:4,c0:a[0],c1:a[1],c2:a[2],c3:a[3],c4:a[4]});let l=Math.max(1,m.clientHeight),i=O?Zt(performance.now()):1,c={field:y.tex,height:A.tex,htexel:dt||[1/A.w,1/A.h],bevel:Q,aspect:n,light:[D.x,D.y],...qe?{band:qe}:{},glass:O?i:1,form:O?I.matches?1:i:q||I.matches||P<0?1:rn(performance.now()-P,1100),res:[m.width,m.height],shift:C?(q&&(!O||N)?Ae():window.scrollY||0)/l:0,nahtlos:le?1:0,maske:O?F.lage/l:0,ohne:O&&i<=0?1:0,detail:ge?1:0};N&&(w.titel?(Kt(i,c),c.ohne=1):c.maske=c.shift),J(w.glass,null,c),M.bilder++},Ee=()=>(C||u)&&!document.hidden&&!I.matches,He=0,Ce=!1,F=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},Jt=a=>a<.5?4*a*a*a:1-Math.pow(-2*a+2,3)/2,$t=56,mt=N?[".ghr-title",".ghr-eyebrow",".ghr-desc",".ghr-actions"].map(a=>d.querySelector(a)):[],gt=N?document.querySelector(".glas-kopf"):null;function Qt(a){let n=gt?gt.getBoundingClientRect().bottom:0,l=mt.map(c=>c?Math.max(0,Math.min(1,(c.getBoundingClientRect().top-n)/$t)):1);mt.forEach((c,h)=>{if(!c||h===0&&!et)return;let f=l[h]>=1?"":l[h].toFixed(3);c.style.opacity!==f&&(c.style.opacity=f,c.style.pointerEvents=l[h]<.05?"none":"")});let i=Math.min(a,l[0]);return F.wert=i,F.ziel=i>0?1:0,i}function Zt(a){let n=window.scrollY||0,l=d.offsetHeight||m.clientHeight||1;if(N){let f=Math.max(0,Math.min(1,(tt*l-n)/Math.max(1,(tt-Ct)*l)));if(f>0&&F.offen&&(F.offen=!1,F.neu++,Be()),F.ziel=f>0?1:0,F.wert=f,F.lage=0,Y){let p=f>=1?"":f.toFixed(3);Y.style.opacity!==p&&(Y.style.opacity=p,Y.style.pointerEvents=f<.05?"none":""),Y.style.visibility!==(f<=0?"hidden":"")&&(Y.style.visibility=f<=0?"hidden":"")}return Qt(f)}let i=F.ziel===1?n>Lt*l?0:1:n<kt*l?1:0;i!==F.ziel&&(F.von=F.wert,F.t0=a,F.ziel=i,i===1&&F.offen&&(F.offen=!1,F.neu++,Be()));let c=Math.min(1,(a-F.t0)/(I.matches?250:Ut)),h=I.matches?c:Jt(c);return F.wert=F.von+(F.ziel-F.von)*h,F.wert>0&&(F.lage=n),F.wert}let pt=a=>{if(r=0,Ye=performance.now(),o)return;let n=(a-v)/1e3;v=a;let l=Math.min(n,.1);!g&&_<40&&Ee()&&(_+=1,M.geprueft=_,_>3&&n>.05&&(x+=n>.15?3:1),x>=8&&(g=!0,M.lite=!0,M.liteBei={bild:_,ms:Math.round(performance.now()-P),blatt:b.classList.contains("papier-an")},b.setAttribute("data-glas-lite","true"),we()));let i=C?Math.min(Math.max((window.scrollY||0)/Math.max(1,m.clientHeight),0),1):0;if(_e){let T=window.scrollY||0,G=Math.max(1,m.clientHeight),oe=ke?T>.66*G:T>.74*G;oe!==ke&&(ke=oe,M.wechsel=(M.wechsel||0)+1,we())}Ee()&&(s+=l*(Re?Pt:Dt)*(1-.5*i));let c=K,h=(a-c.at)/1e3>2.5,[f,p]=h&&Ee()?sn(s):[c.x,c.y];if(D.x=Mt(D.x,f,l,h?1.2:7),D.y=Mt(D.y,p,l,h?1.2:7),fe!==void 0&&(D.x=.5,D.y=.7),C&&!le){let T=i>=1?!0:i<.97?!1:Ce;T!==Ce&&(Ce=T,we())}C&&!q&&i>=1&&Ee()&&a-He<40||b.classList.contains("papier-zu")&&a-He<250||(Vt(),He=a);let ae=Math.abs(D.x-f)+Math.abs(D.y-p)>.0015,L=(C||u)&&!document.hidden,ee=P>=0&&performance.now()-P<1100||O&&F.wert!==F.ziel;L&&(Ee()||ae||ee)&&(r=requestAnimationFrame(pt))},Ye=0,Z=()=>{o||(r&&performance.now()-Ye>500&&(cancelAnimationFrame(r),r=0),!r&&(v=Ye=performance.now(),r=requestAnimationFrame(pt)))};K.neustart=()=>{o||(cancelAnimationFrame(r),r=0,Z())},K.kick=Z,K.rebuild=()=>{o||(Be(),Z())};let vt=a=>{a.preventDefault(),cancelAnimationFrame(r),r=0},xt=()=>Xe();m.addEventListener("webglcontextlost",vt),m.addEventListener("webglcontextrestored",xt);try{w={field:ne(st.indexOf("2.3 * q")>0?st:Qe),blur:ne(C?lt:De),glass:ne(C?S:Ze),titel:N&&Ge&&C?ne(Ge):null};let a=e.createVertexArray();e.bindVertexArray(a);let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),we()}catch{return}d.setAttribute("data-glass","true"),M.glas=!0,M.grafik=()=>{let a=l=>Math.round(l/104857.6)/10,n=t?8:4;return{leinwand:m.width+"x"+m.height,feld:y?y.w+"x"+y.h:"",maske:A?A.w+"x"+A.h:"",mb:a(m.width*m.height*8+(y?y.w*y.h*4:0)+(A?A.w*A.h*(4+2*n):0))}},P=performance.now(),Z();let je=0,Ke=new ResizeObserver(()=>{cancelAnimationFrame(je),je=requestAnimationFrame(()=>{o||(we(),Z())})});Ke.observe(d),C&&Ke.observe(m);let bt=()=>Z();C&&window.addEventListener("scroll",bt,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>K.rebuild());let _t=new IntersectionObserver(([a])=>{u=a.isIntersecting,u&&Z()});_t.observe(d);let wt=()=>!document.hidden&&Z();document.addEventListener("visibilitychange",wt),I.addEventListener("change",Z),Se=()=>{o=!0,cancelAnimationFrame(r),cancelAnimationFrame(je),Ke.disconnect(),_t.disconnect(),window.removeEventListener("scroll",bt),document.removeEventListener("visibilitychange",wt),I.removeEventListener("change",Z),m.removeEventListener("webglcontextlost",vt),m.removeEventListener("webglcontextrestored",xt),B(),W&&e.deleteTexture(W);for(let a of Object.values(w||{}))e.deleteProgram(a.prog);d.setAttribute("data-glass","false"),M.glas=!1}}if(d.addEventListener("pointermove",e=>{let t=(H&&m.isConnected?m:d).getBoundingClientRect();K.x=(e.clientX-t.left)/t.width,K.y=1-(e.clientY-t.top)/t.height,K.at=performance.now(),K.kick()}),d.setAttribute("data-glass","false"),q){let e=!1,t=()=>{e||(e=!0,b.classList.add("glas-schrift-da"),Le(),Xe(),M.glas||b.classList.add("glas-ohne"))};if(document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500),Y&&!N){let r=0;window.addEventListener("scroll",()=>{r||(r=requestAnimationFrame(()=>{r=0,Ae()}))},{passive:!0})}let o=()=>{Ae(),K.neustart&&K.neustart()};window.addEventListener("pageshow",o),document.addEventListener("visibilitychange",()=>{document.hidden||o()}),window.addEventListener("focus",o)}else Xe();let ut=performance.now(),ht=0;setInterval(()=>{let e=M.bilder;M.fps=Math.round((e-ht)*1e3/Math.max(1,performance.now()-ut)),ht=e,ut=performance.now()},1e3),window.__glas={zustand:()=>({glas:M.glas,lite:M.lite,fps:M.fps,bilder:M.bilder,geprueft:M.geprueft||0,angebote:rt,masken:M.masken||0,versatz:ce,ruhe:q,titel:X.textContent,weg:O,kopfNativ:N,titelBand:M.titelBand||null,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1,scharf:Me,grafik:M.grafik?M.grafik():null,liteBei:M.liteBei||null,wechsel:M.wechsel||0}),zumKontakt:Oe,zuAngeboten:ze}})();})();
