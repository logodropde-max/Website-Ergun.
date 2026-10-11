(()=>{var xt=`#version 300 es
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
`,bt=$e+`uniform float u_time;
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
}`,Be=$e+`uniform sampler2D u_src;
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
}`,Je=$e+`uniform sampler2D u_field;
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
}`;var $t=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function wt(d){let v=/^#?([0-9a-f]{6})$/i.exec(d.trim());if(!v)return null;let I=parseInt(v[1],16);return[(I>>16&255)/255,(I>>8&255)/255,(I&255)/255]}function Jt(d){return $t.map((v,I)=>wt((d&&d[I])!=null?d[I]:"")||wt(v))}function we(d,v){return Math.max(2,d*.075*v)}function Qt(d,v){let I=Math.min(Math.max(d/v,0),1);return 1-Math.pow(1-I,3)}function Et(d){let v=(I,Ee)=>"rgba("+I.map(he=>Math.round(he*255)).join(",")+","+Ee+")";return"radial-gradient(60% 50% at 25% 30%,"+v(d[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+v(d[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+v(d[2],.27)+",transparent 70%),"+v(d[0],1)}function yt(d,v,I,Ee){return v+(d-v)*Math.exp(-Ee*I)}function Zt(d){return[.5+.32*Math.sin(d*.37),.56+.16*Math.sin(d*.53+1.1)]}(function(){let d=document.querySelector("[data-glas-root]");if(!d)return;let v=document.documentElement,I=new URLSearchParams(location.search),he=Jt(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),m=d.querySelector("[data-glas-canvas]"),G=d.querySelector("[data-glas-titel]"),H=v.classList.contains("glas-fein"),re=H&&v.classList.contains("glas-nahtlos"),de=H&&v.classList.contains("blatt-glas"),q=H&&v.classList.contains("ruhe"),z=q&&v.classList.contains("schrift-weg"),Tt=.14,Ft=.08,Rt=600,Mt=z&&v.classList.contains("titel-takt"),At=.5,Qe=.6,N=Mt&&v.classList.contains("kopf-nativ"),Y=q&&(!z||N)?d.querySelector(".ghr-content"):null,se=0,Ze=window.innerWidth,ye=Math.min(window.devicePixelRatio||1,2),Pe=window.matchMedia("(max-width: 899px)").matches,Te=H&&q&&Pe&&v.classList.contains("titel-scharf"),et=3;function Fe(){if(N)return Math.round((window.scrollY||0)*ye)/ye;if(!Y)return se;let e=Math.round((window.scrollY||0)*ye)/ye;return(e!==se||!Y.style.transform)&&(se=e,Y.style.transform="translate3d(0,"+-e+"px,0)",Y.style.visibility=e>d.offsetHeight+40?"hidden":""),se}q&&(v.classList.add("glas-ruhe"),Fe());let j=(e,t)=>(t||document).querySelector(e),me=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function te(e,t,i){let r=document.createElement(e);return t&&(r.className=t),i!=null&&(r.textContent=i),r}d.style.height="100svh",d.style.background=Et(he);let ge=null,U=null,pe=null;if(H&&(ge=te("div","glas-buehne"),ge.setAttribute("aria-hidden","true"),ge.style.background=Et(he),ge.appendChild(m),document.body.insertBefore(ge,document.body.firstChild),N&&(U=te("canvas","glas-titel-ebene"),U.setAttribute("aria-hidden","true"),U.style.visibility="hidden",d.insertBefore(U,d.firstChild)),d.style.background="transparent",de?G.innerHTML='<span class="glas-versteckt">ERGUN. \u2013 </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>':G.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>"),re){let e=d.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=j(e);t&&t.remove()});let ve=j("main#inhalt"),Re=window.PREISE,Ie=te("footer","glas-fuss");Ie.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(de?'<span class="glas-fuss__satz">Webdesign und Automatisierung \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',ve&&ve.parentNode.insertBefore(Ie,ve.nextSibling),Re&&Re.klein&&(j("[data-glas-klein]",Ie).textContent=Re.klein+" "+(Re.steuer||""));function St(){let e=j("[data-glas-kopf]");return e?e.offsetHeight:0}function Lt(e){let t=0;for(let i=e;i;i=i.offsetParent)t+=i.offsetTop;return t}let tt=window.matchMedia("(prefers-reduced-motion: reduce)");function nt(e){e&&window.scrollTo({top:Math.max(0,Lt(e)-St()-20),behavior:tt.matches?"auto":"smooth"})}function ze(){nt(j("#angebote"))}function Oe(){let e=j("#preise .mf__oben");nt(e&&!e.hidden?e:j("#preise .mf__raster"))}window.__kristall={zumKontakt:Oe,zuAngeboten:ze},document.addEventListener("click",e=>{if(H&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:tt.matches?"auto":"smooth"});return}let i=e.target.closest&&e.target.closest("[data-glas-ziel]");i&&(e.preventDefault(),i.getAttribute("data-glas-ziel")==="kontakt"?Oe():ze())});let at=!1;function kt(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),me(".k-angebot",e).forEach(i=>{let r=j(".k-angebot__wort",i),w=j(".k-angebot__info",i),c=w&&w.querySelector("b")?w.querySelector("b").textContent.trim():"",h=w?w.textContent.replace(c,"").replace(/^\s*·\s*/,"").trim():"",g=c.split(" + "),T=me("[data-glas-behalten]",i);i.classList.add("glas-karte"),i.innerHTML="",i.appendChild(te("span","k-angebot__wort glas-karte__titel",r?r.textContent:"")),i.appendChild(te("span","glas-karte__satz",h));let x=te("span","glas-karte__preis");x.appendChild(te("b","",g[0])),g[1]&&x.appendChild(te("small","","+ "+g.slice(1).join(" + "))),i.appendChild(x),T.forEach(D=>i.appendChild(D))}),at=!0,!0}if((function e(t){!kt()&&t<60&&setTimeout(()=>e(t+1),50)})(0),ve){ve.classList.add("glas-haupt");let e=j("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=j("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(i=>{i.isIntersecting&&(i.target.classList.add("ist-da"),e.unobserve(i.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>me(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else v.classList.add("glas-alles-da");let Ut={palette:he,title:G.textContent},K={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},M={glas:!1,lite:!1,fps:0,bilder:0},Me=null,it=Be.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),S=Je.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);re&&(S=S.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let le={schwarz:0,weiss:.8}[I.get("glasfeld")];le!==void 0&&(S=S.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let Ne=I.get("glasdbg");if(H&&Ne&&(S=S.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(Ne==="g"?"dh.g":Ne==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),H&&z){let e=re?`  float yDoc = (1.0 - uv.y) + u_shift;
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
`)}if(de){let e=`uniform float u_detail;
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
`)}Te&&(S=S.split("texture(u_height, ").join("hoehe(").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform vec2 u_band;
vec4 hoehe(vec2 p) { return texture(u_height, vec2(p.x, p.y * u_band.x + u_band.y)); }`));let Xe="";if(N){let e=S.indexOf("  vec3 col = mix(bg, glass, inside);"),t=/bg \*= 1\.0 - ([0-9.]+) \* smoothstep\(0\.1, 0\.7, shade\) \* u_glass;/.exec(S);e>0&&t&&S.indexOf("uniform float u_shift;")>0&&(Xe=S.slice(0,e).split("texture(u_field, uv + bend").join("texture(u_field, uv + vec2(0.0, u_feld) + bend").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_feld;`)+"  float schatten = "+t[1]+` * smoothstep(0.1, 0.7, shade) * u_glass;
  float a = 1.0 - (1.0 - schatten) * (1.0 - inside);
  vec3 g = glass * inside;
`+(re?`  float tief = smoothstep(0.55, 1.5, 1.0 - uv.y) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  g *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"")+`  g += (hash(floor(uv * u_res)) - 0.5) * 0.018 * a;
  o = vec4(g, a);
}
`)}let Ct=it===Be||S.indexOf("u_shift")<0||H&&z&&S.indexOf("u_ohne > 0.5")<0||Te&&S.split("texture(u_height, ").length!==2,B=H&&!Ct,Bt=.06;function Dt(){let e=me(".glas-z",G);if(e.length<2)return;e.forEach(c=>{c.style.marginLeft=""});let t=getComputedStyle(G),i=parseFloat(t.fontSize)||64,r=document.createElement("canvas").getContext("2d");if(!r)return;r.font=t.fontStyle+" "+t.fontWeight+" "+i+"px "+t.fontFamily,"letterSpacing"in r&&(r.letterSpacing="0px");let w=e.map(c=>{let h=c.getBoundingClientRect(),g=r.measureText(c.textContent);return[h.left-g.actualBoundingBoxLeft,h.left+g.actualBoundingBoxRight]});for(let c=1;c<e.length;c++)e[c].style.marginLeft=((Bt*i-(w[c][0]-w[c-1][1]))/i).toFixed(4)+"em"}function Ae(){if(!B)return;G.style.fontSize="",Dt();let e=G.querySelector(".ghr-word");if(!e)return;let t=e.getBoundingClientRect().width;if(de){let c={};me(".ghr-word",G).forEach(h=>{let g=h.getBoundingClientRect(),T=Math.round(g.top/4);c[T]=c[T]?[Math.min(c[T][0],g.left),Math.max(c[T][1],g.right)]:[g.left,g.right]}),t=Math.max(...Object.values(c).map(h=>h[1]-h[0]))}let i=parseFloat(getComputedStyle(G).fontSize)||64,r=i*.16,w=d.clientWidth*(1-2*.06);t+r>w&&(G.style.fontSize=(i*w/(t+r)).toFixed(2)+"px")}B&&(Ae(),window.addEventListener("resize",()=>{q&&window.innerWidth===Ze||(Ze=window.innerWidth,Ae())}));function ot(e,t,i,r,w){let c=0;r[0]=0,w[0]=-1e20,w[1]=1e20;for(let h=1;h<t;h++){let g=(e[h]+h*h-(e[r[c]]+r[c]*r[c]))/(2*h-2*r[c]);for(;g<=w[c];)c--,g=(e[h]+h*h-(e[r[c]]+r[c]*r[c]))/(2*h-2*r[c]);c++,r[c]=h,w[c]=g,w[c+1]=1e20}c=0;for(let h=0;h<t;h++){for(;w[c+1]<h;)c++;i[h]=(h-r[c])*(h-r[c])+e[r[c]]}}function rt(e,t,i){let r=Math.max(t,i),w=new Float64Array(r),c=new Float64Array(r),h=new Int32Array(r),g=new Float64Array(r+1);for(let T=0;T<t;T++){for(let x=0;x<i;x++)w[x]=e[x*t+T];ot(w,i,c,h,g);for(let x=0;x<i;x++)e[x*t+T]=c[x]}for(let T=0;T<i;T++){for(let x=0;x<t;x++)w[x]=e[T*t+x];ot(w,t,c,h,g);for(let x=0;x<t;x++)e[T*t+x]=c[x]}return e}function Pt(e){let t=Math.abs(e)/Math.SQRT2,i=1/(1+.3275911*t),r=1-((((1.061405429*i-1.453152027)*i+1.421413741)*i-.284496736)*i+.254829592)*i*Math.exp(-t*t);return e>=0?.5*(1+r):.5*(1-r)}function It(e,t,i,r){let w=e.getImageData(0,0,t,i),c=w.data,h=t,g=i,T=-1,x=-1;for(let C=0;C<i;C++)for(let b=0;b<t;b++)c[(C*t+b)*4]>0&&(b<h&&(h=b),b>T&&(T=b),C<g&&(g=C),C>x&&(x=C));if(T<0)return;let D=Math.ceil(r*2.5)+2;h=Math.max(0,h-D),g=Math.max(0,g-D),T=Math.min(t-1,T+D),x=Math.min(i-1,x+D);let P=T-h+1,O=x-g+1,ce=new Float64Array(P*O),ne=new Float64Array(P*O),V=new Float32Array(P*O);for(let C=0;C<O;C++)for(let b=0;b<P;b++){let E=C*P+b,R=c[((C+g)*t+b+h)*4]/255;V[E]=R,ce[E]=R<.5?0:1e20,ne[E]=R>=.5?0:1e20}rt(ce,P,O),rt(ne,P,O);let oe=Math.max(r*.5,.5);for(let C=0;C<O;C++)for(let b=0;b<P;b++){let E=C*P+b,R=((C+g)*t+b+h)*4,A=V[E]>=.5?Math.sqrt(ce[E])-.5:.5-Math.sqrt(ne[E]),W=Math.abs(A)<1?V[E]-.5:A;c[R]=Math.round(Pt(W/oe)*255),c[R+1]=Math.round(V[E]*255),c[R+2]=0}e.putImageData(w,0,0)}function Ge(){Me&&(Me(),Me=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:m.getContext("webgl2",{alpha:N,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||B&&!!e.getExtension("EXT_color_buffer_half_float"),i=!1,r=0,w=0,c=0,h=!0,g=!1,T=0,x=0,D={x:.5,y:.56},P=-1,O=window.matchMedia("(prefers-reduced-motion: reduce)"),ce=(a,n)=>{let s=e.createShader(a);if(!s)throw new Error("could not create shader");if(e.shaderSource(s,n),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(s));return s},ne=a=>{let n=e.createProgram();if(!n)throw new Error("could not create program");let s=ce(e.VERTEX_SHADER,xt),o=ce(e.FRAGMENT_SHADER,a);if(e.attachShader(n,s),e.attachShader(n,o),e.bindAttribLocation(n,0,"a_position"),e.linkProgram(n),e.deleteShader(s),e.deleteShader(o),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(n));let l={},u=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let f=0;f<u;f++){let p=e.getActiveUniform(n,f);p&&(l[p.name.replace(/^u_/,"")]=e.getUniformLocation(n,p.name))}return{prog:n,u:l}},V={tex:[],fbo:[]},oe=(a,n,s)=>{let o=e.createTexture(),l=e.createFramebuffer();if(!o||!l)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),s&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,a,n,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,a,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,l),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),V.tex.push(o),V.fbo.push(l),{tex:o,fbo:l,w:a,h:n}},C=()=>{for(let a of V.tex)e.deleteTexture(a);for(let a of V.fbo)e.deleteFramebuffer(a);V.tex=[],V.fbo=[]},b=null,E=null,R=null,A=null,W=null,Q=4,xe=Te&&B,qe=null,ct=null,Se=!1,$=(a,n,s)=>{e.useProgram(a.prog);let o=0;for(let l in s){let u=a.u[l];if(!u)continue;let f=s[l];typeof f=="number"?e.uniform1f(u,f):Array.isArray(f)?f.length===2?e.uniform2f(u,f[0],f[1]):e.uniform3f(u,f[0],f[1],f[2]):(e.activeTexture(e.TEXTURE0+o),e.bindTexture(e.TEXTURE_2D,f),e.uniform1i(u,o++))}e.bindFramebuffer(e.FRAMEBUFFER,n?n.fbo:null),e.viewport(0,0,n?n.w:m.width,n?n.h:m.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Le="",zt=()=>{Ae();let a=G,n=m.getBoundingClientRect(),s=g?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),o=xe?Math.min(window.devicePixelRatio||1,g?2:et):s,l=getComputedStyle(a),u=parseFloat(l.fontSize)||64,f=q&&!z?se:window.scrollY||0,p=[],fe=document.createTreeWalker(a,NodeFilter.SHOW_TEXT),ae=_=>!!(_.parentElement&&_.parentElement.closest&&_.parentElement.closest(".glas-versteckt"));for(let _=fe.nextNode();_;_=fe.nextNode())for(let k=0;k<(ae(_)?0:_.data.length);k++){if(/\s/.test(_.data[k]))continue;let Ke=document.createRange();Ke.setStart(_,k),Ke.setEnd(_,k+1);let Ve=Ke.getBoundingClientRect();p.push([_.data[k],Ve.left-n.left,Ve.top+f,Ve.height])}if(N){let _=Math.ceil(we(u,1)*8+n.height*.015+16);pe=p.length?{von:Math.max(0,Math.min(...p.map(k=>k[2]))-_),bis:Math.min(n.height,Math.max(...p.map(k=>k[2]+(k[3]||u)))+_),root:d.getBoundingClientRect().top+(window.scrollY||0)}:null}let L=0,ee=n.height;if(xe&&p.length){let _=Math.ceil(we(u,1)*8+n.height*.015+16);L=Math.max(0,Math.floor(Math.min(...p.map(k=>k[2]))-_)),ee=Math.min(n.height,Math.ceil(Math.max(...p.map(k=>k[2]+(k[3]||u)))+_)),ee-L<8&&(L=0,ee=n.height)}let F=Math.max(1,Math.round(n.width*o)),X=Math.max(1,Math.round((ee-L)*o)),ie=[F,X,o,L,l.font].concat(p.map(_=>_[0]+"@"+_[1].toFixed(1)+","+_[2].toFixed(1))).join("|");if(ie===Le)return;Le=ie;let ue=document.createElement("canvas");ue.width=F,ue.height=X;let J=ue.getContext("2d");if(J){if(J.fillStyle="#000",J.fillRect(0,0,F,X),J.font=l.fontStyle+" "+l.fontWeight+" "+(u*o).toFixed(2)+"px "+l.fontFamily,"letterSpacing"in J&&(J.letterSpacing="0px"),J.fillStyle="#fff",J.textBaseline="alphabetic",p.forEach(_=>{let k=J.measureText(_[0]).fontBoundingBoxAscent||u*o*.8;J.fillText(_[0],_[1]*o,(_[2]-L)*o+k)}),It(J,F,X,we(u,o)),xe){let _=n.height,k=ee-L;qe=[_/k,1-(_-L)/k],ct=[1/F,1/Math.max(1,Math.round(_*o))]}return{cnv:ue,w:F,h:X,fontPx:u,scale:o}}},Ot=(a,n,s,o,l)=>{if(M.masken=(M.masken||0)+1,W||(W=e.createTexture()),e.bindTexture(e.TEXTURE_2D,W),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!R||R.w!==n||R.h!==s){for(let f of[R,A])f&&(e.deleteTexture(f.tex),e.deleteFramebuffer(f.fbo));R=oe(n,s,!0),A=oe(n,s,!0)}Q=we(o,l);let u=Math.max(1.5*l,Q*.25);$(b.blur,R,{src:W,step:[1/n,0],radius:u,read:1,write:0}),$(b.blur,A,{src:R.tex,step:[0,1/s],radius:u,read:1,write:0}),$(b.blur,R,{src:A.tex,step:[1/n,0],radius:Q*3,read:1,write:1}),$(b.blur,A,{src:R.tex,step:[0,1/s],radius:Q*3,read:2,write:1})},ke=()=>{let a=G;if(!a||!E)return;if(z&&y.ziel===0){y.offen=!0;return}if(B){let F=zt();F&&Ot(F.cnv,F.w,F.h,F.fontPx,F.scale);return}let n=d.getBoundingClientRect(),s=g?1:Math.min(window.devicePixelRatio||1,1.5),o=Math.max(1,Math.round(n.width*s)),l=Math.max(1,Math.round(n.height*s)),u=Array.from(a.querySelectorAll(".ghr-word")),f=u.map(F=>F.getBoundingClientRect()),p=getComputedStyle(a),fe=[o,l,s,p.font,p.letterSpacing].concat(u.map((F,X)=>(F.textContent||"")+"@"+Math.round(f[X].left-n.left)+","+Math.round(f[X].top-n.top))).join("|");if(fe===Le)return;Le=fe;let ae=document.createElement("canvas");ae.width=o,ae.height=l;let L=ae.getContext("2d");if(!L)return;L.fillStyle="#000",L.fillRect(0,0,o,l);let ee=parseFloat(p.fontSize)||64;if(L.setTransform(s,0,0,s,0,0),L.font=p.fontStyle+" "+p.fontWeight+" "+p.fontSize+" "+p.fontFamily,"letterSpacing"in L&&(L.letterSpacing=p.letterSpacing==="normal"?"0px":p.letterSpacing),L.fillStyle="#fff",L.textBaseline="alphabetic",u.forEach((F,X)=>{let ie=F.textContent||"",ue=L.measureText(ie).fontBoundingBoxAscent||ee*.8;L.fillText(ie,f[X].left-n.left,f[X].top-n.top+ue)}),W||(W=e.createTexture()),e.bindTexture(e.TEXTURE_2D,W),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,ae),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!R||R.w!==o||R.h!==l){for(let F of[R,A])F&&(e.deleteTexture(F.tex),e.deleteFramebuffer(F.fbo));R=oe(o,l,!0),A=oe(o,l,!0)}Q=we(ee,s),!(!R||!A)&&($(b.blur,R,{src:W,step:[1/o,0],radius:Q,read:0,write:0}),$(b.blur,A,{src:R.tex,step:[0,1/l],radius:Q,read:1,write:0}),$(b.blur,R,{src:A.tex,step:[1/o,0],radius:Q*3,read:1,write:1}),$(b.blur,A,{src:R.tex,step:[0,1/l],radius:Q*3,read:2,write:1}))},be=()=>{let a=B&&Ce?.35:q&&Pe&&!g?Math.min(window.devicePixelRatio||1,1.5):g?B?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),n=!xe||Se?a:Math.max(a,Math.min(window.devicePixelRatio||1,g?1.5:et)),s=Math.max(1,Math.round(m.clientWidth*n)),o=Math.max(1,Math.round(m.clientHeight*n));(m.width!==s||m.height!==o)&&(m.width=s,m.height=o);let l=g?.25:.4,u=n===a?l:l*a/n,f=Math.max(1,Math.round(s*u)),p=Math.max(1,Math.round(o*u));(!E||E.w!==f||E.h!==p)&&(E&&(e.deleteTexture(E.tex),e.deleteFramebuffer(E.fbo)),E=oe(f,p,!1)),ke()},We=U?U.getContext("2d"):null,Nt=(a,n)=>{if(!We)return;if(!(a>0)||!pe){U.style.visibility!=="hidden"&&(U.style.visibility="hidden");return}let s=m.height/Math.max(1,m.clientHeight),o=Math.max(0,Math.floor(pe.von*s)),l=Math.min(m.height,Math.ceil(pe.bis*s)),u=Math.max(1,l-o);(U.width!==m.width||U.height!==u)&&(U.width=m.width,U.height=u);let f=(o/s-pe.root).toFixed(3)+"px",p=(u/s).toFixed(3)+"px";U.style.top!==f&&(U.style.top=f),U.style.height!==p&&(U.style.height=p),e.enable(e.SCISSOR_TEST),e.scissor(0,m.height-l,m.width,u),$(b.titel,null,Object.assign({},n,{feld:n.shift,maske:0,ohne:0})),e.disable(e.SCISSOR_TEST),We.clearRect(0,0,U.width,u),We.drawImage(m,0,o,m.width,u,0,0,m.width,u),U.style.visibility&&(U.style.visibility=""),M.titelBand=[o,l]},Xt=()=>{if(!E||!A)return;let a=Ut.palette,n=m.width/m.height;le!==void 0?(e.bindFramebuffer(e.FRAMEBUFFER,E.fbo),e.viewport(0,0,E.w,E.h),e.clearColor(le,le,le,1),e.clear(e.COLOR_BUFFER_BIT)):$(b.field,E,{time:c,aspect:n,octaves:g?3:q&&Pe?4:5,c0:a[0],c1:a[1],c2:a[2],c3:a[3],c4:a[4]});let s=Math.max(1,m.clientHeight),o=z?Ht(performance.now()):1,l={field:E.tex,height:A.tex,htexel:ct||[1/A.w,1/A.h],bevel:Q,aspect:n,light:[D.x,D.y],...qe?{band:qe}:{},glass:z?o:1,form:z?O.matches?1:o:q||O.matches||P<0?1:Qt(performance.now()-P,1100),res:[m.width,m.height],shift:B?(q&&(!z||N)?Fe():window.scrollY||0)/s:0,nahtlos:re?1:0,maske:z?y.lage/s:0,ohne:z&&o<=0?1:0,detail:de?1:0};N&&(b.titel?(Nt(o,l),l.ohne=1):l.maske=l.shift),$(b.glass,null,l),M.bilder++},_e=()=>(B||h)&&!document.hidden&&!O.matches,Ue=0,Ce=!1,y=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},Gt=a=>a<.5?4*a*a*a:1-Math.pow(-2*a+2,3)/2,qt=56,ft=N?[".ghr-title",".ghr-eyebrow",".ghr-desc",".ghr-actions"].map(a=>d.querySelector(a)):[],ut=N?document.querySelector(".glas-kopf"):null;function Wt(a){let n=ut?ut.getBoundingClientRect().bottom:0,s=ft.map(l=>l?Math.max(0,Math.min(1,(l.getBoundingClientRect().top-n)/qt)):1);ft.forEach((l,u)=>{if(!l||u===0)return;let f=s[u]>=1?"":s[u].toFixed(3);l.style.opacity!==f&&(l.style.opacity=f,l.style.pointerEvents=s[u]<.05?"none":"")});let o=Math.min(a,s[0]);return y.wert=o,y.ziel=o>0?1:0,o}function Ht(a){let n=window.scrollY||0,s=d.offsetHeight||m.clientHeight||1;if(N){let f=Math.max(0,Math.min(1,(Qe*s-n)/Math.max(1,(Qe-At)*s)));if(f>0&&y.offen&&(y.offen=!1,y.neu++,ke()),y.ziel=f>0?1:0,y.wert=f,y.lage=0,Y){let p=f>=1?"":f.toFixed(3);Y.style.opacity!==p&&(Y.style.opacity=p,Y.style.pointerEvents=f<.05?"none":""),Y.style.visibility!==(f<=0?"hidden":"")&&(Y.style.visibility=f<=0?"hidden":"")}return Wt(f)}let o=y.ziel===1?n>Tt*s?0:1:n<Ft*s?1:0;o!==y.ziel&&(y.von=y.wert,y.t0=a,y.ziel=o,o===1&&y.offen&&(y.offen=!1,y.neu++,ke()));let l=Math.min(1,(a-y.t0)/(O.matches?250:Rt)),u=O.matches?l:Gt(l);return y.wert=y.von+(y.ziel-y.von)*u,y.wert>0&&(y.lage=n),y.wert}let ht=a=>{if(r=0,He=performance.now(),i)return;let n=(a-w)/1e3;w=a;let s=Math.min(n,.1);!g&&T<40&&_e()&&(T+=1,M.geprueft=T,T>3&&n>.05&&(x+=n>.15?3:1),x>=8&&(g=!0,M.lite=!0,M.liteBei={bild:T,ms:Math.round(performance.now()-P),blatt:v.classList.contains("papier-an")},v.setAttribute("data-glas-lite","true"),be()));let o=B?Math.min(Math.max((window.scrollY||0)/Math.max(1,m.clientHeight),0),1):0;if(xe){let F=window.scrollY||0,X=Math.max(1,m.clientHeight),ie=Se?F>.66*X:F>.74*X;ie!==Se&&(Se=ie,M.wechsel=(M.wechsel||0)+1,be())}_e()&&(c+=s*(1-.7*o));let l=K,u=(a-l.at)/1e3>2.5,[f,p]=u&&_e()?Zt(c):[l.x,l.y];if(D.x=yt(D.x,f,s,u?1.2:7),D.y=yt(D.y,p,s,u?1.2:7),le!==void 0&&(D.x=.5,D.y=.7),B&&!re){let F=o>=1?!0:o<.97?!1:Ce;F!==Ce&&(Ce=F,be())}B&&!q&&o>=1&&_e()&&a-Ue<40||z&&o>=1&&a-Ue<30||v.classList.contains("papier-zu")&&a-Ue<250||(Xt(),Ue=a);let ae=Math.abs(D.x-f)+Math.abs(D.y-p)>.0015,L=(B||h)&&!document.hidden,ee=P>=0&&performance.now()-P<1100||z&&y.wert!==y.ziel;L&&(_e()||ae||ee)&&(r=requestAnimationFrame(ht))},He=0,Z=()=>{i||(r&&performance.now()-He>500&&(cancelAnimationFrame(r),r=0),!r&&(w=He=performance.now(),r=requestAnimationFrame(ht)))};K.neustart=()=>{i||(cancelAnimationFrame(r),r=0,Z())},K.kick=Z,K.rebuild=()=>{i||(ke(),Z())};let dt=a=>{a.preventDefault(),cancelAnimationFrame(r),r=0},mt=()=>Ge();m.addEventListener("webglcontextlost",dt),m.addEventListener("webglcontextrestored",mt);try{b={field:ne(bt),blur:ne(B?it:Be),glass:ne(B?S:Je),titel:N&&Xe&&B?ne(Xe):null};let a=e.createVertexArray();e.bindVertexArray(a);let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),be()}catch{return}d.setAttribute("data-glass","true"),M.glas=!0,M.grafik=()=>{let a=s=>Math.round(s/104857.6)/10,n=t?8:4;return{leinwand:m.width+"x"+m.height,feld:E?E.w+"x"+E.h:"",maske:A?A.w+"x"+A.h:"",mb:a(m.width*m.height*8+(E?E.w*E.h*4:0)+(A?A.w*A.h*(4+2*n):0))}},P=performance.now(),Z();let Ye=0,je=new ResizeObserver(()=>{cancelAnimationFrame(Ye),Ye=requestAnimationFrame(()=>{i||(be(),Z())})});je.observe(d),B&&je.observe(m);let gt=()=>Z();B&&window.addEventListener("scroll",gt,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>K.rebuild());let pt=new IntersectionObserver(([a])=>{h=a.isIntersecting,h&&Z()});pt.observe(d);let vt=()=>!document.hidden&&Z();document.addEventListener("visibilitychange",vt),O.addEventListener("change",Z),Me=()=>{i=!0,cancelAnimationFrame(r),cancelAnimationFrame(Ye),je.disconnect(),pt.disconnect(),window.removeEventListener("scroll",gt),document.removeEventListener("visibilitychange",vt),O.removeEventListener("change",Z),m.removeEventListener("webglcontextlost",dt),m.removeEventListener("webglcontextrestored",mt),C(),W&&e.deleteTexture(W);for(let a of Object.values(b||{}))e.deleteProgram(a.prog);d.setAttribute("data-glass","false"),M.glas=!1}}if(d.addEventListener("pointermove",e=>{let t=(H&&m.isConnected?m:d).getBoundingClientRect();K.x=(e.clientX-t.left)/t.width,K.y=1-(e.clientY-t.top)/t.height,K.at=performance.now(),K.kick()}),d.setAttribute("data-glass","false"),q){let e=!1,t=()=>{e||(e=!0,v.classList.add("glas-schrift-da"),Ae(),Ge(),M.glas||v.classList.add("glas-ohne"))};if(document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500),Y&&!N){let r=0;window.addEventListener("scroll",()=>{r||(r=requestAnimationFrame(()=>{r=0,Fe()}))},{passive:!0})}let i=()=>{Fe(),K.neustart&&K.neustart()};window.addEventListener("pageshow",i),document.addEventListener("visibilitychange",()=>{document.hidden||i()}),window.addEventListener("focus",i)}else Ge();let st=performance.now(),lt=0;setInterval(()=>{let e=M.bilder;M.fps=Math.round((e-lt)*1e3/Math.max(1,performance.now()-st)),lt=e,st=performance.now()},1e3),window.__glas={zustand:()=>({glas:M.glas,lite:M.lite,fps:M.fps,bilder:M.bilder,geprueft:M.geprueft||0,angebote:at,masken:M.masken||0,versatz:se,ruhe:q,titel:G.textContent,weg:z,kopfNativ:N,titelBand:M.titelBand||null,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1,scharf:Te,grafik:M.grafik?M.grafik():null,liteBei:M.liteBei||null,wechsel:M.wechsel||0}),zumKontakt:Oe,zuAngeboten:ze}})();})();
