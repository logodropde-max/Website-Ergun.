(()=>{var Mt=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,lt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,Lt=lt+`uniform float u_time;
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
}`,He=lt+`uniform sampler2D u_src;
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
}`,ct=lt+`uniform sampler2D u_field;
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
}`;var on=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function Dt(h){let g=/^#?([0-9a-f]{6})$/i.exec(h.trim());if(!g)return null;let U=parseInt(g[1],16);return[(U>>16&255)/255,(U>>8&255)/255,(U&255)/255]}function sn(h){return on.map((g,U)=>Dt((h&&h[U])!=null?h[U]:"")||Dt(g))}function Se(h,g){return Math.max(2,h*.075*g)}function ln(h,g){let U=Math.min(Math.max(h/g,0),1);return 1-Math.pow(1-U,3)}function Pt(h){let g=(U,ke)=>"rgba("+U.map(we=>Math.round(we*255)).join(",")+","+ke+")";return"radial-gradient(60% 50% at 25% 30%,"+g(h[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+g(h[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+g(h[2],.27)+",transparent 70%),"+g(h[0],1)}function It(h,g,U,ke){return g+(h-g)*Math.exp(-ke*U)}function cn(h){return[.5+.32*Math.sin(h*.37),.56+.16*Math.sin(h*.53+1.1)]}(function(){let h=document.querySelector("[data-glas-root]");if(!h)return;let g=document.documentElement,U=new URLSearchParams(location.search),we=sn(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),m=h.querySelector("[data-glas-canvas]"),N=h.querySelector("[data-glas-titel]"),J=g.classList.contains("glas-fein"),me=J&&g.classList.contains("glas-nahtlos"),Ee=J&&g.classList.contains("blatt-glas"),Te=Ee?g.getAttribute("data-hinten")==="b"?"b":"a":"",W=J&&g.classList.contains("ruhe"),B=W&&g.classList.contains("schrift-weg"),Bt=.14,zt=.08,Nt=600,Ue=B&&g.classList.contains("titel-takt"),Xt=.5,ft=.6,Q=W&&(!B||Ue)?h.querySelector(".ghr-content"):null,pe=0,ut=window.innerWidth,Ce=Math.min(window.devicePixelRatio||1,2),Ye=window.matchMedia("(max-width: 899px)").matches,Y=g.classList.contains("handy-leicht"),De=J&&W&&Ye&&g.classList.contains("titel-scharf"),dt=Math.min(3,Math.max(1.5,parseFloat(g.getAttribute("data-scharf"))||3)),ee=Ue&&g.classList.contains("kopf-nativ");function ye(){if(ee)return Math.round((window.scrollY||0)*Ce)/Ce;if(!Q)return pe;let e=Math.round((window.scrollY||0)*Ce)/Ce;return(e!==pe||!Q.style.transform)&&(pe=e,Q.style.transform="translate3d(0,"+-e+"px,0)",Q.style.visibility=e>h.offsetHeight+40?"hidden":""),pe}W&&(g.classList.add("glas-ruhe"),ye());let $=(e,n)=>(n||document).querySelector(e),Pe=(e,n)=>[].slice.call((n||document).querySelectorAll(e));function ce(e,n,i){let o=document.createElement(e);return n&&(o.className=n),i!=null&&(o.textContent=i),o}h.style.height="100svh",h.style.background=Pt(we);let Re=null,C=null,Ae=null;if(J&&(Re=ce("div","glas-buehne"),Re.setAttribute("aria-hidden","true"),Re.style.background=Pt(we),Re.appendChild(m),document.body.insertBefore(Re,document.body.firstChild),ee&&(C=ce("canvas","glas-titel-ebene"),C.setAttribute("aria-hidden","true"),C.style.visibility="hidden",h.insertBefore(C,h.firstChild)),h.style.background="transparent",Ee?N.innerHTML='<span class="glas-versteckt">ERGUN. \u2013 </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>':U.get("punkt")!=="orange"&&(N.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),U.get("punkt")==="orange"&&(N.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',g.setAttribute("data-glas-punkt","orange")),me&&U.get("text")!=="b"){let e=h.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(U.get("text")==="b"){let e=h.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let n=$(e);n&&n.remove()});let Fe=$("main#inhalt"),Ie=window.PREISE,je=ce("footer","glas-fuss");je.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(Ee?'<span class="glas-fuss__satz">Webdesign und Automatisierung \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',Fe&&Fe.parentNode.insertBefore(je,Fe.nextSibling),Ie&&Ie.klein&&($("[data-glas-klein]",je).textContent=Ie.klein+" "+(Ie.steuer||""));function Gt(){let e=$("[data-glas-kopf]");return e?e.offsetHeight:0}function Ot(e){let n=0;for(let i=e;i;i=i.offsetParent)n+=i.offsetTop;return n}let ht=window.matchMedia("(prefers-reduced-motion: reduce)");function gt(e){e&&window.scrollTo({top:Math.max(0,Ot(e)-Gt()-20),behavior:ht.matches?"auto":"smooth"})}function Ke(){gt($("#angebote"))}function Ve(){let e=$("#preise .mf__oben");gt(e&&!e.hidden?e:$("#preise .mf__raster"))}window.__kristall={zumKontakt:Ve,zuAngeboten:Ke},document.addEventListener("click",e=>{if(J&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:ht.matches?"auto":"smooth"});return}let i=e.target.closest&&e.target.closest("[data-glas-ziel]");i&&(e.preventDefault(),i.getAttribute("data-glas-ziel")==="kontakt"?Ve():Ke())});let mt=!1;function Wt(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let n=e.querySelector("h2");return n&&(n.className="glas-h2",n.textContent="Was brauchen Sie?"),Pe(".k-angebot",e).forEach(i=>{let o=$(".k-angebot__wort",i),w=$(".k-angebot__info",i),r=w&&w.querySelector("b")?w.querySelector("b").textContent.trim():"",f=w?w.textContent.replace(r,"").replace(/^\s*·\s*/,"").trim():"",p=r.split(" + ");i.classList.add("glas-karte"),i.innerHTML="",i.appendChild(ce("span","k-angebot__wort glas-karte__titel",o?o.textContent:"")),i.appendChild(ce("span","glas-karte__satz",f));let x=ce("span","glas-karte__preis");x.appendChild(ce("b","",p[0])),p[1]&&x.appendChild(ce("small","","+ "+p.slice(1).join(" + "))),i.appendChild(x)}),mt=!0,!0}if((function e(n){!Wt()&&n<60&&setTimeout(()=>e(n+1),50)})(0),Fe){Fe.classList.add("glas-haupt");let e=$("#preise .mf__oben");e&&e.classList.add("glas-rein");let n=$("#preise .mf__raster");n&&n.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(n=>n.forEach(i=>{i.isIntersecting&&(i.target.classList.add("ist-da"),e.unobserve(i.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>Pe(".glas-rein, .glas-fuss").forEach(n=>e.observe(n)),60)}else g.classList.add("glas-alles-da");let Ht={palette:we,title:N.textContent},Z={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},_={glas:!1,lite:!1,fps:0,bilder:0},Be=null,pt=He.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),M=ct.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);me&&(M=M.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let ve={schwarz:0,weiss:.8}[U.get("glasfeld")];ve!==void 0&&(M=M.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let Je=U.get("glasdbg");if(J&&Je&&(M=M.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(Je==="g"?"dh.g":Je==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),J&&B){let e=me?`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"";M=M.split("texture(u_height, vec2(0.0, -u_shift) + ").join("texture(u_height, vec2(0.0, -u_maske) + ").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_maske;
uniform float u_ohne;`).replace(`  vec2 uv = vUv;
`,`  vec2 uv = vUv;
  if (u_ohne > 0.5) {
  vec3 col = texture(u_field, uv).rgb;
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`+e+`  o = vec4(col, 1.0);
  return;
  }
`)}if(Ee){let e=`uniform float u_detail;
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
`;M=M.replace("uv + away * 0.012","uv + away * 0.0045").replace("bg *= 1.0 - 0.32 * smoothstep","bg *= 1.0 - 0.2 * smoothstep"),M=M.replace("void main() {",e+"void main() {").replace(`  vec3 bg = texture(u_field, uv).rgb;
`,`  vec3 bg = zeichnung(texture(u_field, uv).rgb, uv);
`).replace(`  vec3 col = texture(u_field, uv).rgb;
`,`  vec3 col = zeichnung(texture(u_field, uv).rgb, uv);
`)}De&&(M=M.split("texture(u_height, ").join("hoehe(").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform vec2 u_band;
vec4 hoehe(vec2 p) { return texture(u_height, vec2(p.x, p.y * u_band.x + u_band.y)); }`));let $e="";if(ee){let e=M.indexOf("  vec3 col = mix(bg, glass, inside);"),n=/bg \*= 1\.0 - ([0-9.]+) \* smoothstep\(0\.1, 0\.7, shade\) \* u_glass;/.exec(M);e>0&&n&&M.indexOf("uniform float u_shift;")>0&&($e=M.slice(0,e).split("texture(u_field, uv + bend").join("texture(u_field, uv + vec2(0.0, u_feld) + bend").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_feld;`)+"  float schatten = "+n[1]+` * smoothstep(0.1, 0.7, shade) * u_glass;
  float a = 1.0 - (1.0 - schatten) * (1.0 - inside);
  vec3 g = glass * inside;
`+(me?`  float tief = smoothstep(0.55, 1.5, 1.0 - uv.y) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  g *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"")+`  g += (hash(floor(uv * u_res)) - 0.5) * 0.018 * a;
  o = vec4(g, a);
}
`)}let qt=pt===He||M.indexOf("u_shift")<0||J&&B&&M.indexOf("u_ohne > 0.5")<0||De&&M.split("texture(u_height, ").length!==2,P=J&&!qt,Yt=.06;function jt(){let e=Pe(".glas-z",N);if(e.length<2)return;e.forEach(r=>{r.style.marginLeft=""});let n=getComputedStyle(N),i=parseFloat(n.fontSize)||64,o=document.createElement("canvas").getContext("2d");if(!o)return;o.font=n.fontStyle+" "+n.fontWeight+" "+i+"px "+n.fontFamily,"letterSpacing"in o&&(o.letterSpacing="0px");let w=e.map(r=>{let f=r.getBoundingClientRect(),p=o.measureText(r.textContent);return[f.left-p.actualBoundingBoxLeft,f.left+p.actualBoundingBoxRight]});for(let r=1;r<e.length;r++)e[r].style.marginLeft=((Yt*i-(w[r][0]-w[r-1][1]))/i).toFixed(4)+"em"}function ze(){if(!P)return;N.style.fontSize="",jt();let e=N.querySelector(".ghr-word");if(!e)return;let n=e.getBoundingClientRect().width;if(Ee){let r={};Pe(".ghr-word",N).forEach(f=>{let p=f.getBoundingClientRect(),x=Math.round(p.top/4);r[x]=r[x]?[Math.min(r[x][0],p.left),Math.max(r[x][1],p.right)]:[p.left,p.right]}),n=Math.max(...Object.values(r).map(f=>f[1]-f[0]))}let i=parseFloat(getComputedStyle(N).fontSize)||64,o=i*.16,w=h.clientWidth*(1-2*.06);n+o>w&&(N.style.fontSize=(i*w/(n+o)).toFixed(2)+"px")}P&&(ze(),window.addEventListener("resize",()=>{W&&window.innerWidth===ut||(ut=window.innerWidth,ze())}));function vt(e,n,i,o,w){let r=0;o[0]=0,w[0]=-1e20,w[1]=1e20;for(let f=1;f<n;f++){let p=(e[f]+f*f-(e[o[r]]+o[r]*o[r]))/(2*f-2*o[r]);for(;p<=w[r];)r--,p=(e[f]+f*f-(e[o[r]]+o[r]*o[r]))/(2*f-2*o[r]);r++,o[r]=f,w[r]=p,w[r+1]=1e20}r=0;for(let f=0;f<n;f++){for(;w[r+1]<f;)r++;i[f]=(f-o[r])*(f-o[r])+e[o[r]]}}function xt(e,n,i){let o=Math.max(n,i),w=new Float64Array(o),r=new Float64Array(o),f=new Int32Array(o),p=new Float64Array(o+1);for(let x=0;x<n;x++){for(let T=0;T<i;T++)w[T]=e[T*n+x];vt(w,i,r,f,p);for(let T=0;T<i;T++)e[T*n+x]=r[T]}for(let x=0;x<i;x++){for(let T=0;T<n;T++)w[T]=e[x*n+T];vt(w,n,r,f,p);for(let T=0;T<n;T++)e[x*n+T]=r[T]}return e}function Kt(e){let n=Math.abs(e)/Math.SQRT2,i=1/(1+.3275911*n),o=1-((((1.061405429*i-1.453152027)*i+1.421413741)*i-.284496736)*i+.254829592)*i*Math.exp(-n*n);return e>=0?.5*(1+o):.5*(1-o)}function Vt(e,n,i,o){let w=e.getImageData(0,0,n,i),r=w.data,f=n,p=i,x=-1,T=-1;for(let F=0;F<i;F++)for(let y=0;y<n;y++)r[(F*n+y)*4]>0&&(y<f&&(f=y),y>x&&(x=y),F<p&&(p=F),F>T&&(T=F));if(x<0)return;let fe=Math.ceil(o*2.5)+2;f=Math.max(0,f-fe),p=Math.max(0,p-fe),x=Math.min(n-1,x+fe),T=Math.min(i-1,T+fe);let X=x-f+1,te=T-p+1,ne=new Float64Array(X*te),de=new Float64Array(X*te),ue=new Float32Array(X*te);for(let F=0;F<te;F++)for(let y=0;y<X;y++){let j=F*X+y,H=r[((F+p)*n+y+f)*4]/255;ue[j]=H,ne[j]=H<.5?0:1e20,de[j]=H>=.5?0:1e20}xt(ne,X,te),xt(de,X,te);let G=Math.max(o*.5,.5);for(let F=0;F<te;F++)for(let y=0;y<X;y++){let j=F*X+y,H=((F+p)*n+y+f)*4,ae=ue[j]>=.5?Math.sqrt(ne[j])-.5:.5-Math.sqrt(de[j]),he=Math.abs(ae)<1?ue[j]-.5:ae;r[H]=Math.round(Kt(he/G)*255),r[H+1]=Math.round(ue[j]*255),r[H+2]=0}e.putImageData(w,0,0)}function Ze(){Be&&(Be(),Be=null);let e=/[?&]webgl=aus\b/.test(location.search)||g.classList.contains("grund-farbwechsel")?null:m.getContext("webgl2",{alpha:ee,antialias:!1,depth:!1,stencil:!1});if(!e)return;let n=!!e.getExtension("EXT_color_buffer_float")||P&&!!e.getExtension("EXT_color_buffer_half_float"),i=!1,o=0,w=0,r=0,f=!0,p=!1,x=0,T=0,fe=!1,X=0,te=0,ne=-1,de="",ue=-1;Y&&(p=!0,_.lite=!0,g.setAttribute("data-glas-lite","true"));let G={x:.5,y:.56},F=-1,y=window.matchMedia("(prefers-reduced-motion: reduce)"),j=(a,t)=>{let l=e.createShader(a);if(!l)throw new Error("could not create shader");if(e.shaderSource(l,t),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(l));return l},H=a=>{let t=e.createProgram();if(!t)throw new Error("could not create program");let l=j(e.VERTEX_SHADER,Mt),s=j(e.FRAGMENT_SHADER,a);if(e.attachShader(t,l),e.attachShader(t,s),e.bindAttribLocation(t,0,"a_position"),e.linkProgram(t),e.deleteShader(l),e.deleteShader(s),!e.getProgramParameter(t,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(t));let c={},u=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let d=0;d<u;d++){let v=e.getActiveUniform(t,d);v&&(c[v.name.replace(/^u_/,"")]=e.getUniformLocation(t,v.name))}return{prog:t,u:c}},ae={tex:[],fbo:[]},he=(a,t,l)=>{let s=e.createTexture(),c=e.createFramebuffer();if(!s||!c)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),l&&n?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,a,t,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,a,t,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,c),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,s,0),ae.tex.push(s),ae.fbo.push(c),{tex:s,fbo:c,w:a,h:t}},Jt=()=>{for(let a of ae.tex)e.deleteTexture(a);for(let a of ae.fbo)e.deleteFramebuffer(a);ae.tex=[],ae.fbo=[]},I=null,L=null,D=null,S=null,ie=null,re=4,Me=De&&P,Qe=null,wt=null,Ne=!1,xe=null,et=!1,$t=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D u_bild;
uniform vec2 u_skala;
void main() { vec2 uv = (vUv - 0.5) * u_skala + 0.5; o = vec4(texture(u_bild, uv).rgb, 1.0); }
`;if(Te==="b"){let a=new Image;a.decoding="async",a.onload=()=>{if(i)return;let t=e.createTexture();e.bindTexture(e.TEXTURE_2D,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),xe={tex:t,w:a.naturalWidth,h:a.naturalHeight},ae.tex.push(t),be(),V()},a.src="bilder/glas/hinten-"+(window.innerWidth>=window.innerHeight?"quer":"hoch")+".webp?v=1"}let K=(a,t,l)=>{e.useProgram(a.prog);let s=0;for(let c in l){let u=a.u[c];if(!u)continue;let d=l[c];typeof d=="number"?e.uniform1f(u,d):Array.isArray(d)?d.length===2?e.uniform2f(u,d[0],d[1]):e.uniform3f(u,d[0],d[1],d[2]):(e.activeTexture(e.TEXTURE0+s),e.bindTexture(e.TEXTURE_2D,d),e.uniform1i(u,s++))}e.bindFramebuffer(e.FRAMEBUFFER,t?t.fbo:null),e.viewport(0,0,t?t.w:m.width,t?t.h:m.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Xe="",Zt=()=>{ze();let a=N,t=m.getBoundingClientRect(),l=p?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),s=Me?Math.min(window.devicePixelRatio||1,p?2:dt):l,c=getComputedStyle(a),u=parseFloat(c.fontSize)||64,d=W&&!B?pe:window.scrollY||0,v=[],ge=document.createTreeWalker(a,NodeFilter.SHOW_TEXT),se=b=>!!(b.parentElement&&b.parentElement.closest&&b.parentElement.closest(".glas-versteckt"));for(let b=ge.nextNode();b;b=ge.nextNode())for(let k=0;k<(se(b)?0:b.data.length);k++){if(/\s/.test(b.data[k]))continue;let ot=document.createRange();ot.setStart(b,k),ot.setEnd(b,k+1);let st=ot.getBoundingClientRect();v.push([b.data[k],st.left-t.left,st.top+d,st.height])}if(ee){let b=Math.ceil(Se(u,1)*8+t.height*.015+16);Ae=v.length?{von:Math.max(0,Math.min(...v.map(k=>k[2]))-b),bis:Math.min(t.height,Math.max(...v.map(k=>k[2]+(k[3]||u)))+b),root:h.getBoundingClientRect().top+(window.scrollY||0)}:null}let R=0,oe=t.height;if(Me&&v.length){let b=Math.ceil(Se(u,1)*8+t.height*.015+16);R=Math.max(0,Math.floor(Math.min(...v.map(k=>k[2]))-b)),oe=Math.min(t.height,Math.ceil(Math.max(...v.map(k=>k[2]+(k[3]||u)))+b)),oe-R<8&&(R=0,oe=t.height)}let A=Math.max(1,Math.round(t.width*s)),q=Math.max(1,Math.round((oe-R)*s)),z=[A,q,s,R,c.font].concat(v.map(b=>b[0]+"@"+b[1].toFixed(1)+","+b[2].toFixed(1))).join("|");if(z===Xe)return;Xe=z;let le=document.createElement("canvas");le.width=A,le.height=q;let O=le.getContext("2d");if(O){if(O.fillStyle="#000",O.fillRect(0,0,A,q),O.font=c.fontStyle+" "+c.fontWeight+" "+(u*s).toFixed(2)+"px "+c.fontFamily,"letterSpacing"in O&&(O.letterSpacing="0px"),O.fillStyle="#fff",O.textBaseline="alphabetic",v.forEach(b=>{let k=O.measureText(b[0]).fontBoundingBoxAscent||u*s*.8;O.fillText(b[0],b[1]*s,(b[2]-R)*s+k)}),Vt(O,A,q,Se(u,s)),Me){let b=t.height,k=oe-R;Qe=[b/k,1-(b-R)/k],wt=[1/A,1/Math.max(1,Math.round(b*s))]}return{cnv:le,w:A,h:q,fontPx:u,scale:s}}},Qt=(a,t,l,s,c)=>{if(_.masken=(_.masken||0)+1,ie||(ie=e.createTexture()),e.bindTexture(e.TEXTURE_2D,ie),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!D||D.w!==t||D.h!==l){for(let d of[D,S])d&&(e.deleteTexture(d.tex),e.deleteFramebuffer(d.fbo));D=he(t,l,!0),S=he(t,l,!0)}re=Se(s,c);let u=Math.max(1.5*c,re*.25);K(I.blur,D,{src:ie,step:[1/t,0],radius:u,read:1,write:0}),K(I.blur,S,{src:D.tex,step:[0,1/l],radius:u,read:1,write:0}),K(I.blur,D,{src:S.tex,step:[1/t,0],radius:re*3,read:1,write:1}),K(I.blur,S,{src:D.tex,step:[0,1/l],radius:re*3,read:2,write:1})},Ge=()=>{let a=N;if(!a||!L)return;if(B&&E.ziel===0){E.offen=!0;return}if(P){let A=Zt();A&&Qt(A.cnv,A.w,A.h,A.fontPx,A.scale);return}let t=h.getBoundingClientRect(),l=p?1:Math.min(window.devicePixelRatio||1,1.5),s=Math.max(1,Math.round(t.width*l)),c=Math.max(1,Math.round(t.height*l)),u=Array.from(a.querySelectorAll(".ghr-word")),d=u.map(A=>A.getBoundingClientRect()),v=getComputedStyle(a),ge=[s,c,l,v.font,v.letterSpacing].concat(u.map((A,q)=>(A.textContent||"")+"@"+Math.round(d[q].left-t.left)+","+Math.round(d[q].top-t.top))).join("|");if(ge===Xe)return;Xe=ge;let se=document.createElement("canvas");se.width=s,se.height=c;let R=se.getContext("2d");if(!R)return;R.fillStyle="#000",R.fillRect(0,0,s,c);let oe=parseFloat(v.fontSize)||64;if(R.setTransform(l,0,0,l,0,0),R.font=v.fontStyle+" "+v.fontWeight+" "+v.fontSize+" "+v.fontFamily,"letterSpacing"in R&&(R.letterSpacing=v.letterSpacing==="normal"?"0px":v.letterSpacing),R.fillStyle="#fff",R.textBaseline="alphabetic",u.forEach((A,q)=>{let z=A.textContent||"",le=R.measureText(z).fontBoundingBoxAscent||oe*.8;R.fillText(z,d[q].left-t.left,d[q].top-t.top+le)}),ie||(ie=e.createTexture()),e.bindTexture(e.TEXTURE_2D,ie),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,se),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!D||D.w!==s||D.h!==c){for(let A of[D,S])A&&(e.deleteTexture(A.tex),e.deleteFramebuffer(A.fbo));D=he(s,c,!0),S=he(s,c,!0)}re=Se(oe,l),!(!D||!S)&&(K(I.blur,D,{src:ie,step:[1/s,0],radius:re,read:0,write:0}),K(I.blur,S,{src:D.tex,step:[0,1/c],radius:re,read:1,write:0}),K(I.blur,D,{src:S.tex,step:[1/s,0],radius:re*3,read:1,write:1}),K(I.blur,S,{src:D.tex,step:[0,1/c],radius:re*3,read:2,write:1}))},be=()=>{let a=P&&Oe?.35:W&&Ye&&!p?Math.min(window.devicePixelRatio||1,1.5):p?P?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),t=!Me||Ne?a:Math.max(a,Math.min(window.devicePixelRatio||1,p?1.5:dt)),l=Math.max(1,Math.round(m.clientWidth*t)),s=Math.max(1,Math.round(m.clientHeight*t));(m.width!==l||m.height!==s)&&(m.width=l,m.height=s);let c=Te==="b"&&xe?1:Y?.4*Math.min(window.devicePixelRatio||1,1.5)/a:p?.25:.4,u=t===a?c:c*a/t;et=!1,de="",ne=-1,ue=-1;let d=Math.max(1,Math.round(l*u)),v=Math.max(1,Math.round(s*u));(!L||L.w!==d||L.h!==v)&&(L&&(e.deleteTexture(L.tex),e.deleteFramebuffer(L.fbo)),L=he(d,v,!1)),Ge()},tt=C?C.getContext("2d"):null,en=(a,t)=>{if(!tt)return;if(!(a>0)||!Ae){C.style.visibility!=="hidden"&&(C.style.visibility="hidden");return}let l=m.height/Math.max(1,m.clientHeight),s=Math.max(0,Math.floor(Ae.von*l)),c=Math.min(m.height,Math.ceil(Ae.bis*l)),u=Math.max(1,c-s);(C.width!==m.width||C.height!==u)&&(C.width=m.width,C.height=u);let d=(s/l-Ae.root).toFixed(3)+"px",v=(u/l).toFixed(3)+"px";C.style.top!==d&&(C.style.top=d),C.style.height!==v&&(C.style.height=v),e.enable(e.SCISSOR_TEST),e.scissor(0,m.height-c,m.width,u),K(I.titel,null,Object.assign({},t,{feld:t.shift,maske:0,ohne:0})),e.disable(e.SCISSOR_TEST),tt.clearRect(0,0,C.width,u),tt.drawImage(m,0,s,m.width,u,0,0,m.width,u),C.style.visibility&&(C.style.visibility=""),_.titelBand=[s,c]},tn=()=>{if(!L||!S)return;let a=Ht.palette,t=m.width/m.height;if(ve!==void 0)e.bindFramebuffer(e.FRAMEBUFFER,L.fbo),e.viewport(0,0,L.w,L.h),e.clearColor(ve,ve,ve,1),e.clear(e.COLOR_BUFFER_BIT);else if(Te==="b"&&xe&&I.bild){if(!et){let u=xe.w/xe.h;K(I.bild,L,{bild:xe.tex,skala:t>u?[1,u/t]:[t/u,1]}),et=!0}}else Y&&ue===r||(ue=Y?r:-1,K(I.field,L,{time:r,aspect:t,octaves:Y?4:p?3:W&&Ye?4:5,c0:a[0],c1:a[1],c2:a[2],c3:a[3],c4:a[4]}));let l=Math.max(1,m.clientHeight),s=B?an(performance.now()):1,c={field:L.tex,height:S.tex,htexel:wt||[1/S.w,1/S.h],bevel:re,aspect:t,light:[G.x,G.y],...Qe?{band:Qe}:{},glass:B?s:1,form:B?y.matches?1:s:W||y.matches||F<0?1:ln(performance.now()-F,1100),res:[m.width,m.height],shift:P?(W&&(!B||Ue)?ye():window.scrollY||0)/l:0,nahtlos:me?1:0,maske:B?E.lage/l:0,ohne:B&&s<=0?1:0,detail:Te==="a"?1:0};ee&&(I.titel?(en(s,c),c.ohne=1):c.maske=c.shift),K(I.glass,null,c),_.bilder++},nt=()=>!Y||!fe&&(window.scrollY||0)<m.clientHeight&&!g.classList.contains("papier-an"),_e=()=>(P||f)&&!document.hidden&&!y.matches&&nt(),Le=0,Oe=!1,E=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},nn=a=>a<.5?4*a*a*a:1-Math.pow(-2*a+2,3)/2;function an(a){let t=window.scrollY||0,l=h.offsetHeight||m.clientHeight||1;if(Ue){let d=Math.max(0,Math.min(1,(ft*l-t)/Math.max(1,(ft-Xt)*l)));if(d>0&&E.offen&&(E.offen=!1,E.neu++,Ge()),E.ziel=d>0?1:0,E.wert=d,E.lage=ee?0:ye(),Q){let v=d>=1?"":d.toFixed(3);Q.style.opacity!==v&&(Q.style.opacity=v,Q.style.pointerEvents=d<.05?"none":""),ee&&Q.style.visibility!==(d<=0?"hidden":"")&&(Q.style.visibility=d<=0?"hidden":"")}return d}let s=E.ziel===1?t>Bt*l?0:1:t<zt*l?1:0;s!==E.ziel&&(E.von=E.wert,E.t0=a,E.ziel=s,s===1&&E.offen&&(E.offen=!1,E.neu++,Ge()));let c=Math.min(1,(a-E.t0)/(y.matches?250:Nt)),u=y.matches?c:nn(c);return E.wert=E.von+(E.ziel-E.von)*u,E.wert>0&&(E.lage=t),E.wert}let Et=a=>{if(o=0,at=performance.now(),i)return;let t=(a-w)/1e3;w=a;let l=Math.min(t,.1);!p&&x<40&&_e()&&(x+=1,_.geprueft=x,x>3&&t>.05&&(T+=t>.15?3:1),T>=8&&(p=!0,_.lite=!0,_.liteBei={bild:x,ms:Math.round(performance.now()-F),blatt:g.classList.contains("papier-an")},g.setAttribute("data-glas-lite","true"),be())),Y&&!fe&&X<120&&_e()&&(X+=1,_.geprueft=X,X>3&&t>.05&&(te+=t>.15?3:1),te>=8&&(fe=!0,_.standbild=!0,g.setAttribute("data-glas-standbild","true")));let s=P?Math.min(Math.max((window.scrollY||0)/Math.max(1,m.clientHeight),0),1):0;if(Me){let z=window.scrollY||0,le=Math.max(1,m.clientHeight),O=Ne?z>.66*le:z>.74*le;O!==Ne&&(Ne=O,_.wechsel=(_.wechsel||0)+1,be())}_e()&&!g.classList.contains("glas-laden")&&(r+=l*(1-.7*s));let c=Z,u=(a-c.at)/1e3>2.5,[d,v]=nt()?u&&_e()?cn(r):[c.x,c.y]:[G.x,G.y];if(G.x=It(G.x,d,l,u?1.2:7),G.y=It(G.y,v,l,u?1.2:7),ve!==void 0&&(G.x=.5,G.y=.7),P&&!me){let z=s>=1?!0:s<.97?!1:Oe;z!==Oe&&(Oe=z,be())}let ge=P&&!W&&s>=1&&_e()&&a-Le<40||B&&s>=1&&a-Le<30||g.classList.contains("papier-zu")&&a-Le<250,se=!1,R="";if(Y){let z=window.scrollY||0;R=z/Math.max(1,m.clientHeight)>=1.55&&E.wert<=0?"tief@"+r:"",se=nt()?a-Le<14&&z===ne:z===ne||!!R&&R===de}(Y?!se:!ge)&&(tn(),Le=a,Y&&(ne=window.scrollY||0,de=R));let oe=Math.abs(G.x-d)+Math.abs(G.y-v)>.0015,A=(P||f)&&!document.hidden,q=F>=0&&performance.now()-F<1100||B&&E.wert!==E.ziel;A&&(_e()||oe||q)&&(o=requestAnimationFrame(Et))},at=0,V=()=>{i||(o&&performance.now()-at>500&&(cancelAnimationFrame(o),o=0),!o&&(w=at=performance.now(),o=requestAnimationFrame(Et)))};Z.neustart=()=>{i||(cancelAnimationFrame(o),o=0,V())},Z.kick=V,Z.rebuild=()=>{i||(Ge(),ne=-1,V())};let We=Y?new MutationObserver(()=>{ne=-1,V()}):null;We&&We.observe(g,{attributes:!0,attributeFilter:["class"]});let Tt=a=>{a.preventDefault(),cancelAnimationFrame(o),o=0},yt=()=>Ze();m.addEventListener("webglcontextlost",Tt),m.addEventListener("webglcontextrestored",yt);try{I={field:H(Lt),blur:H(P?pt:He),glass:H(P?M:ct),bild:Te==="b"?H($t):null,titel:ee&&$e&&P?H($e):null};let a=e.createVertexArray();e.bindVertexArray(a);let t=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),be()}catch{return}h.setAttribute("data-glass","true"),_.glas=!0,_.grafik=()=>{let a=l=>Math.round(l/104857.6)/10,t=n?8:4;return{leinwand:m.width+"x"+m.height,feld:L?L.w+"x"+L.h:"",maske:S?S.w+"x"+S.h:"",mb:a(m.width*m.height*8+(L?L.w*L.h*4:0)+(S?S.w*S.h*(4+2*t):0))}},F=performance.now(),V();let it=0,rt=new ResizeObserver(()=>{cancelAnimationFrame(it),it=requestAnimationFrame(()=>{i||(be(),V())})});rt.observe(h),P&&rt.observe(m);let Rt=()=>V();P&&window.addEventListener("scroll",Rt,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>Z.rebuild());let At=new IntersectionObserver(([a])=>{f=a.isIntersecting,f&&V()});At.observe(h);let Ft=()=>!document.hidden&&V();document.addEventListener("visibilitychange",Ft),y.addEventListener("change",V),Be=()=>{i=!0,cancelAnimationFrame(o),cancelAnimationFrame(it),rt.disconnect(),At.disconnect(),We&&We.disconnect(),window.removeEventListener("scroll",Rt),document.removeEventListener("visibilitychange",Ft),y.removeEventListener("change",V),m.removeEventListener("webglcontextlost",Tt),m.removeEventListener("webglcontextrestored",yt),Jt(),ie&&e.deleteTexture(ie);for(let a of Object.values(I||{}))e.deleteProgram(a.prog);h.setAttribute("data-glass","false"),_.glas=!1}}if(h.addEventListener("pointermove",e=>{let n=(J&&m.isConnected?m:h).getBoundingClientRect();Z.x=(e.clientX-n.left)/n.width,Z.y=1-(e.clientY-n.top)/n.height,Z.at=performance.now(),Z.kick()}),h.setAttribute("data-glass","false"),W){let e=!1,n=()=>{e||(e=!0,g.classList.add("glas-schrift-da"),ze(),Ze(),_.glas||g.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(n):n(),setTimeout(n,2500);let i=0;window.addEventListener("scroll",()=>{i||(i=requestAnimationFrame(()=>{i=0,ye()}))},{passive:!0});let o=()=>{ye(),Z.neustart&&Z.neustart()};window.addEventListener("pageshow",o),document.addEventListener("visibilitychange",()=>{document.hidden||o()}),window.addEventListener("focus",o)}else Ze();let bt=performance.now(),_t=0;setInterval(()=>{let e=_.bilder;_.fps=Math.round((e-_t)*1e3/Math.max(1,performance.now()-bt)),_t=e,bt=performance.now()},1e3),window.__glas={zustand:()=>({glas:_.glas,lite:_.lite,fps:_.fps,bilder:_.bilder,geprueft:_.geprueft||0,leicht:Y,standbild:!!_.standbild,angebote:mt,masken:_.masken||0,versatz:pe,ruhe:W,titel:N.textContent,punkt:g.getAttribute("data-glas-punkt")||"glas",weg:B,kopfNativ:ee,titelBand:_.titelBand||null,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1,scharf:De,grafik:_.grafik?_.grafik():null,liteBei:_.liteBei||null,wechsel:_.wechsel||0}),zumKontakt:Ve,zuAngeboten:Ke}})();})();
