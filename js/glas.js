(()=>{var St=`#version 300 es
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
`,kt=lt+`uniform float u_time;
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
}`,qe=lt+`uniform sampler2D u_src;
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
}`;var fn=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function It(d){let g=/^#?([0-9a-f]{6})$/i.exec(d.trim());if(!g)return null;let U=parseInt(g[1],16);return[(U>>16&255)/255,(U>>8&255)/255,(U&255)/255]}function un(d){return fn.map((g,U)=>It((d&&d[U])!=null?d[U]:"")||It(g))}function Se(d,g){return Math.max(2,d*.075*g)}function dn(d,g){let U=Math.min(Math.max(d/g,0),1);return 1-Math.pow(1-U,3)}function Bt(d){let g=(U,ke)=>"rgba("+U.map(we=>Math.round(we*255)).join(",")+","+ke+")";return"radial-gradient(60% 50% at 25% 30%,"+g(d[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+g(d[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+g(d[2],.27)+",transparent 70%),"+g(d[0],1)}function zt(d,g,U,ke){return g+(d-g)*Math.exp(-ke*U)}function hn(d){return[.5+.32*Math.sin(d*.37),.56+.16*Math.sin(d*.53+1.1)]}(function(){let d=document.querySelector("[data-glas-root]");if(!d)return;let g=document.documentElement,U=new URLSearchParams(location.search),we=un(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),m=d.querySelector("[data-glas-canvas]"),N=d.querySelector("[data-glas-titel]"),$=g.classList.contains("glas-fein"),me=$&&g.classList.contains("glas-nahtlos"),Ee=$&&g.classList.contains("blatt-glas"),ye=Ee?g.getAttribute("data-hinten")==="b"?"b":"a":"",W=$&&g.classList.contains("ruhe"),B=W&&g.classList.contains("schrift-weg"),Nt=.14,Ot=.08,Xt=600,Ue=B&&g.classList.contains("titel-takt"),Gt=.5,ft=.6,ee=W&&(!B||Ue)?d.querySelector(".ghr-content"):null,pe=0,ut=window.innerWidth,Ce=Math.min(window.devicePixelRatio||1,2),Ye=window.matchMedia("(max-width: 899px)").matches,j=g.classList.contains("handy-leicht"),De=$&&W&&Ye&&g.classList.contains("titel-scharf"),dt=Math.min(3,Math.max(1.5,parseFloat(g.getAttribute("data-scharf"))||3)),q=Ue&&g.classList.contains("kopf-nativ");function Te(){if(q)return Math.round((window.scrollY||0)*Ce)/Ce;if(!ee)return pe;let e=Math.round((window.scrollY||0)*Ce)/Ce;return(e!==pe||!ee.style.transform)&&(pe=e,ee.style.transform="translate3d(0,"+-e+"px,0)",ee.style.visibility=e>d.offsetHeight+40?"hidden":""),pe}W&&(g.classList.add("glas-ruhe"),Te());let Z=(e,a)=>(a||document).querySelector(e),Pe=(e,a)=>[].slice.call((a||document).querySelectorAll(e));function ce(e,a,o){let s=document.createElement(e);return a&&(s.className=a),o!=null&&(s.textContent=o),s}d.style.height="100svh",d.style.background=Bt(we);let Re=null,C=null,Ae=null;if($&&(Re=ce("div","glas-buehne"),Re.setAttribute("aria-hidden","true"),Re.style.background=Bt(we),Re.appendChild(m),document.body.insertBefore(Re,document.body.firstChild),q&&(C=ce("canvas","glas-titel-ebene"),C.setAttribute("aria-hidden","true"),C.style.visibility="hidden",d.insertBefore(C,d.firstChild)),d.style.background="transparent",Ee?N.innerHTML='<span class="glas-versteckt">ERGUN. \u2013 </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>':U.get("punkt")!=="orange"&&(N.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),U.get("punkt")==="orange"&&(N.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',g.setAttribute("data-glas-punkt","orange")),me&&U.get("text")!=="b"){let e=d.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(U.get("text")==="b"){let e=d.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let a=Z(e);a&&a.remove()});let Fe=Z("main#inhalt"),Ie=window.PREISE,je=ce("footer","glas-fuss");je.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(Ee?'<span class="glas-fuss__satz">Webdesign und Automatisierung \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',Fe&&Fe.parentNode.insertBefore(je,Fe.nextSibling),Ie&&Ie.klein&&(Z("[data-glas-klein]",je).textContent=Ie.klein+" "+(Ie.steuer||""));function Wt(){let e=Z("[data-glas-kopf]");return e?e.offsetHeight:0}function qt(e){let a=0;for(let o=e;o;o=o.offsetParent)a+=o.offsetTop;return a}let ht=window.matchMedia("(prefers-reduced-motion: reduce)");function gt(e){e&&window.scrollTo({top:Math.max(0,qt(e)-Wt()-20),behavior:ht.matches?"auto":"smooth"})}function Ke(){gt(Z("#angebote"))}function Ve(){let e=Z("#preise .mf__oben");gt(e&&!e.hidden?e:Z("#preise .mf__raster"))}window.__kristall={zumKontakt:Ve,zuAngeboten:Ke},document.addEventListener("click",e=>{if($&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:ht.matches?"auto":"smooth"});return}let o=e.target.closest&&e.target.closest("[data-glas-ziel]");o&&(e.preventDefault(),o.getAttribute("data-glas-ziel")==="kontakt"?Ve():Ke())});let mt=!1;function Ht(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let a=e.querySelector("h2");return a&&(a.className="glas-h2",a.textContent="Was brauchen Sie?"),Pe(".k-angebot",e).forEach(o=>{let s=Z(".k-angebot__wort",o),E=Z(".k-angebot__info",o),r=E&&E.querySelector("b")?E.querySelector("b").textContent.trim():"",h=E?E.textContent.replace(r,"").replace(/^\s*·\s*/,"").trim():"",p=r.split(" + ");o.classList.add("glas-karte"),o.innerHTML="",o.appendChild(ce("span","k-angebot__wort glas-karte__titel",s?s.textContent:"")),o.appendChild(ce("span","glas-karte__satz",h));let x=ce("span","glas-karte__preis");x.appendChild(ce("b","",p[0])),p[1]&&x.appendChild(ce("small","","+ "+p.slice(1).join(" + "))),o.appendChild(x)}),mt=!0,!0}if((function e(a){!Ht()&&a<60&&setTimeout(()=>e(a+1),50)})(0),Fe){Fe.classList.add("glas-haupt");let e=Z("#preise .mf__oben");e&&e.classList.add("glas-rein");let a=Z("#preise .mf__raster");a&&a.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(a=>a.forEach(o=>{o.isIntersecting&&(o.target.classList.add("ist-da"),e.unobserve(o.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>Pe(".glas-rein, .glas-fuss").forEach(a=>e.observe(a)),60)}else g.classList.add("glas-alles-da");let Yt={palette:we,title:N.textContent},Q={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},w={glas:!1,lite:!1,fps:0,bilder:0},Be=null,pt=qe.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),M=ct.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);me&&(M=M.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let ve={schwarz:0,weiss:.8}[U.get("glasfeld")];ve!==void 0&&(M=M.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let Je=U.get("glasdbg");if($&&Je&&(M=M.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(Je==="g"?"dh.g":Je==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),$&&B){let e=me?`  float yDoc = (1.0 - uv.y) + u_shift;
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
vec4 hoehe(vec2 p) { return texture(u_height, vec2(p.x, p.y * u_band.x + u_band.y)); }`));let $e="";if(q){let e=M.indexOf("  vec3 col = mix(bg, glass, inside);"),a=/bg \*= 1\.0 - ([0-9.]+) \* smoothstep\(0\.1, 0\.7, shade\) \* u_glass;/.exec(M);e>0&&a&&M.indexOf("uniform float u_shift;")>0&&($e=M.slice(0,e).split("texture(u_field, uv + bend").join("texture(u_field, uv + vec2(0.0, u_feld) + bend").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_feld;`)+"  float schatten = "+a[1]+` * smoothstep(0.1, 0.7, shade) * u_glass;
  float a = 1.0 - (1.0 - schatten) * (1.0 - inside);
  vec3 g = glass * inside;
`+(me?`  float tief = smoothstep(0.55, 1.5, 1.0 - uv.y) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  g *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"")+`  g += (hash(floor(uv * u_res)) - 0.5) * 0.018 * a;
  o = vec4(g, a);
}
`)}let jt=pt===qe||M.indexOf("u_shift")<0||$&&B&&M.indexOf("u_ohne > 0.5")<0||De&&M.split("texture(u_height, ").length!==2,P=$&&!jt,Kt=.06;function Vt(){let e=Pe(".glas-z",N);if(e.length<2)return;e.forEach(r=>{r.style.marginLeft=""});let a=getComputedStyle(N),o=parseFloat(a.fontSize)||64,s=document.createElement("canvas").getContext("2d");if(!s)return;s.font=a.fontStyle+" "+a.fontWeight+" "+o+"px "+a.fontFamily,"letterSpacing"in s&&(s.letterSpacing="0px");let E=e.map(r=>{let h=r.getBoundingClientRect(),p=s.measureText(r.textContent);return[h.left-p.actualBoundingBoxLeft,h.left+p.actualBoundingBoxRight]});for(let r=1;r<e.length;r++)e[r].style.marginLeft=((Kt*o-(E[r][0]-E[r-1][1]))/o).toFixed(4)+"em"}function ze(){if(!P)return;N.style.fontSize="",Vt();let e=N.querySelector(".ghr-word");if(!e)return;let a=e.getBoundingClientRect().width;if(Ee){let r={};Pe(".ghr-word",N).forEach(h=>{let p=h.getBoundingClientRect(),x=Math.round(p.top/4);r[x]=r[x]?[Math.min(r[x][0],p.left),Math.max(r[x][1],p.right)]:[p.left,p.right]}),a=Math.max(...Object.values(r).map(h=>h[1]-h[0]))}let o=parseFloat(getComputedStyle(N).fontSize)||64,s=o*.16,E=d.clientWidth*(1-2*.06);a+s>E&&(N.style.fontSize=(o*E/(a+s)).toFixed(2)+"px")}P&&(ze(),window.addEventListener("resize",()=>{W&&window.innerWidth===ut||(ut=window.innerWidth,ze())}));function vt(e,a,o,s,E){let r=0;s[0]=0,E[0]=-1e20,E[1]=1e20;for(let h=1;h<a;h++){let p=(e[h]+h*h-(e[s[r]]+s[r]*s[r]))/(2*h-2*s[r]);for(;p<=E[r];)r--,p=(e[h]+h*h-(e[s[r]]+s[r]*s[r]))/(2*h-2*s[r]);r++,s[r]=h,E[r]=p,E[r+1]=1e20}r=0;for(let h=0;h<a;h++){for(;E[r+1]<h;)r++;o[h]=(h-s[r])*(h-s[r])+e[s[r]]}}function xt(e,a,o){let s=Math.max(a,o),E=new Float64Array(s),r=new Float64Array(s),h=new Int32Array(s),p=new Float64Array(s+1);for(let x=0;x<a;x++){for(let y=0;y<o;y++)E[y]=e[y*a+x];vt(E,o,r,h,p);for(let y=0;y<o;y++)e[y*a+x]=r[y]}for(let x=0;x<o;x++){for(let y=0;y<a;y++)E[y]=e[x*a+y];vt(E,a,r,h,p);for(let y=0;y<a;y++)e[x*a+y]=r[y]}return e}function Jt(e){let a=Math.abs(e)/Math.SQRT2,o=1/(1+.3275911*a),s=1-((((1.061405429*o-1.453152027)*o+1.421413741)*o-.284496736)*o+.254829592)*o*Math.exp(-a*a);return e>=0?.5*(1+s):.5*(1-s)}function $t(e,a,o,s){let E=e.getImageData(0,0,a,o),r=E.data,h=a,p=o,x=-1,y=-1;for(let F=0;F<o;F++)for(let T=0;T<a;T++)r[(F*a+T)*4]>0&&(T<h&&(h=T),T>x&&(x=T),F<p&&(p=F),F>y&&(y=F));if(x<0)return;let fe=Math.ceil(s*2.5)+2;h=Math.max(0,h-fe),p=Math.max(0,p-fe),x=Math.min(a-1,x+fe),y=Math.min(o-1,y+fe);let O=x-h+1,te=y-p+1,ne=new Float64Array(O*te),de=new Float64Array(O*te),ue=new Float32Array(O*te);for(let F=0;F<te;F++)for(let T=0;T<O;T++){let K=F*O+T,H=r[((F+p)*a+T+h)*4]/255;ue[K]=H,ne[K]=H<.5?0:1e20,de[K]=H>=.5?0:1e20}xt(ne,O,te),xt(de,O,te);let X=Math.max(s*.5,.5);for(let F=0;F<te;F++)for(let T=0;T<O;T++){let K=F*O+T,H=((F+p)*a+T+h)*4,ae=ue[K]>=.5?Math.sqrt(ne[K])-.5:.5-Math.sqrt(de[K]),he=Math.abs(ae)<1?ue[K]-.5:ae;r[H]=Math.round(Jt(he/X)*255),r[H+1]=Math.round(ue[K]*255),r[H+2]=0}e.putImageData(E,0,0)}function Ze(){Be&&(Be(),Be=null);let e=/[?&]webgl=aus\b/.test(location.search)||g.classList.contains("grund-farbwechsel")?null:m.getContext("webgl2",{alpha:q,antialias:!1,depth:!1,stencil:!1});if(!e)return;let a=!!e.getExtension("EXT_color_buffer_float")||P&&!!e.getExtension("EXT_color_buffer_half_float"),o=!1,s=0,E=0,r=0,h=!0,p=!1,x=0,y=0,fe=!1,O=0,te=0,ne=-1,de="",ue=-1;j&&(p=!0,w.lite=!0,g.setAttribute("data-glas-lite","true"));let X={x:.5,y:.56},F=-1,T=window.matchMedia("(prefers-reduced-motion: reduce)"),K=(n,t)=>{let l=e.createShader(n);if(!l)throw new Error("could not create shader");if(e.shaderSource(l,t),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(l));return l},H=n=>{let t=e.createProgram();if(!t)throw new Error("could not create program");let l=K(e.VERTEX_SHADER,St),i=K(e.FRAGMENT_SHADER,n);if(e.attachShader(t,l),e.attachShader(t,i),e.bindAttribLocation(t,0,"a_position"),e.linkProgram(t),e.deleteShader(l),e.deleteShader(i),!e.getProgramParameter(t,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(t));let c={},f=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let u=0;u<f;u++){let v=e.getActiveUniform(t,u);v&&(c[v.name.replace(/^u_/,"")]=e.getUniformLocation(t,v.name))}return{prog:t,u:c}},ae={tex:[],fbo:[]},he=(n,t,l)=>{let i=e.createTexture(),c=e.createFramebuffer();if(!i||!c)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),l&&a?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,n,t,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,n,t,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,c),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),ae.tex.push(i),ae.fbo.push(c),{tex:i,fbo:c,w:n,h:t}},Zt=()=>{for(let n of ae.tex)e.deleteTexture(n);for(let n of ae.fbo)e.deleteFramebuffer(n);ae.tex=[],ae.fbo=[]},I=null,L=null,D=null,S=null,ie=null,oe=4,Me=De&&P,Qe=null,wt=null,Ne=!1,xe=null,et=!1,Qt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D u_bild;
uniform vec2 u_skala;
void main() { vec2 uv = (vUv - 0.5) * u_skala + 0.5; o = vec4(texture(u_bild, uv).rgb, 1.0); }
`;if(ye==="b"){let n=new Image;n.decoding="async",n.onload=()=>{if(o)return;let t=e.createTexture();e.bindTexture(e.TEXTURE_2D,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),xe={tex:t,w:n.naturalWidth,h:n.naturalHeight},ae.tex.push(t),be(),J()},n.src="bilder/glas/hinten-"+(window.innerWidth>=window.innerHeight?"quer":"hoch")+".webp?v=1"}let V=(n,t,l)=>{e.useProgram(n.prog);let i=0;for(let c in l){let f=n.u[c];if(!f)continue;let u=l[c];typeof u=="number"?e.uniform1f(f,u):Array.isArray(u)?u.length===2?e.uniform2f(f,u[0],u[1]):e.uniform3f(f,u[0],u[1],u[2]):(e.activeTexture(e.TEXTURE0+i),e.bindTexture(e.TEXTURE_2D,u),e.uniform1i(f,i++))}e.bindFramebuffer(e.FRAMEBUFFER,t?t.fbo:null),e.viewport(0,0,t?t.w:m.width,t?t.h:m.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Oe="",en=()=>{ze();let n=N,t=m.getBoundingClientRect(),l=p?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),i=Me?Math.min(window.devicePixelRatio||1,p?2:dt):l,c=getComputedStyle(n),f=parseFloat(c.fontSize)||64,u=W&&!B?pe:window.scrollY||0,v=[],ge=document.createTreeWalker(n,NodeFilter.SHOW_TEXT),se=_=>!!(_.parentElement&&_.parentElement.closest&&_.parentElement.closest(".glas-versteckt"));for(let _=ge.nextNode();_;_=ge.nextNode())for(let k=0;k<(se(_)?0:_.data.length);k++){if(/\s/.test(_.data[k]))continue;let rt=document.createRange();rt.setStart(_,k),rt.setEnd(_,k+1);let st=rt.getBoundingClientRect();v.push([_.data[k],st.left-t.left,st.top+u,st.height])}if(q){let _=Math.ceil(Se(f,1)*8+t.height*.015+16);Ae=v.length?{von:Math.max(0,Math.min(...v.map(k=>k[2]))-_),bis:Math.min(t.height,Math.max(...v.map(k=>k[2]+(k[3]||f)))+_),root:d.getBoundingClientRect().top+(window.scrollY||0)}:null}let R=0,re=t.height;if(Me&&v.length){let _=Math.ceil(Se(f,1)*8+t.height*.015+16);R=Math.max(0,Math.floor(Math.min(...v.map(k=>k[2]))-_)),re=Math.min(t.height,Math.ceil(Math.max(...v.map(k=>k[2]+(k[3]||f)))+_)),re-R<8&&(R=0,re=t.height)}let A=Math.max(1,Math.round(t.width*i)),Y=Math.max(1,Math.round((re-R)*i)),z=[A,Y,i,R,c.font].concat(v.map(_=>_[0]+"@"+_[1].toFixed(1)+","+_[2].toFixed(1))).join("|");if(z===Oe)return;Oe=z;let le=document.createElement("canvas");le.width=A,le.height=Y;let G=le.getContext("2d");if(G){if(G.fillStyle="#000",G.fillRect(0,0,A,Y),G.font=c.fontStyle+" "+c.fontWeight+" "+(f*i).toFixed(2)+"px "+c.fontFamily,"letterSpacing"in G&&(G.letterSpacing="0px"),G.fillStyle="#fff",G.textBaseline="alphabetic",v.forEach(_=>{let k=G.measureText(_[0]).fontBoundingBoxAscent||f*i*.8;G.fillText(_[0],_[1]*i,(_[2]-R)*i+k)}),$t(G,A,Y,Se(f,i)),Me){let _=t.height,k=re-R;Qe=[_/k,1-(_-R)/k],wt=[1/A,1/Math.max(1,Math.round(_*i))]}return{cnv:le,w:A,h:Y,fontPx:f,scale:i}}},tn=(n,t,l,i,c)=>{if(w.masken=(w.masken||0)+1,ie||(ie=e.createTexture()),e.bindTexture(e.TEXTURE_2D,ie),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!D||D.w!==t||D.h!==l){for(let u of[D,S])u&&(e.deleteTexture(u.tex),e.deleteFramebuffer(u.fbo));D=he(t,l,!0),S=he(t,l,!0)}oe=Se(i,c);let f=Math.max(1.5*c,oe*.25);V(I.blur,D,{src:ie,step:[1/t,0],radius:f,read:1,write:0}),V(I.blur,S,{src:D.tex,step:[0,1/l],radius:f,read:1,write:0}),V(I.blur,D,{src:S.tex,step:[1/t,0],radius:oe*3,read:1,write:1}),V(I.blur,S,{src:D.tex,step:[0,1/l],radius:oe*3,read:2,write:1})},Xe=()=>{let n=N;if(!n||!L)return;if(B&&b.ziel===0){b.offen=!0;return}if(P){let A=en();A&&tn(A.cnv,A.w,A.h,A.fontPx,A.scale);return}let t=d.getBoundingClientRect(),l=p?1:Math.min(window.devicePixelRatio||1,1.5),i=Math.max(1,Math.round(t.width*l)),c=Math.max(1,Math.round(t.height*l)),f=Array.from(n.querySelectorAll(".ghr-word")),u=f.map(A=>A.getBoundingClientRect()),v=getComputedStyle(n),ge=[i,c,l,v.font,v.letterSpacing].concat(f.map((A,Y)=>(A.textContent||"")+"@"+Math.round(u[Y].left-t.left)+","+Math.round(u[Y].top-t.top))).join("|");if(ge===Oe)return;Oe=ge;let se=document.createElement("canvas");se.width=i,se.height=c;let R=se.getContext("2d");if(!R)return;R.fillStyle="#000",R.fillRect(0,0,i,c);let re=parseFloat(v.fontSize)||64;if(R.setTransform(l,0,0,l,0,0),R.font=v.fontStyle+" "+v.fontWeight+" "+v.fontSize+" "+v.fontFamily,"letterSpacing"in R&&(R.letterSpacing=v.letterSpacing==="normal"?"0px":v.letterSpacing),R.fillStyle="#fff",R.textBaseline="alphabetic",f.forEach((A,Y)=>{let z=A.textContent||"",le=R.measureText(z).fontBoundingBoxAscent||re*.8;R.fillText(z,u[Y].left-t.left,u[Y].top-t.top+le)}),ie||(ie=e.createTexture()),e.bindTexture(e.TEXTURE_2D,ie),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,se),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!D||D.w!==i||D.h!==c){for(let A of[D,S])A&&(e.deleteTexture(A.tex),e.deleteFramebuffer(A.fbo));D=he(i,c,!0),S=he(i,c,!0)}oe=Se(re,l),!(!D||!S)&&(V(I.blur,D,{src:ie,step:[1/i,0],radius:oe,read:0,write:0}),V(I.blur,S,{src:D.tex,step:[0,1/c],radius:oe,read:1,write:0}),V(I.blur,D,{src:S.tex,step:[1/i,0],radius:oe*3,read:1,write:1}),V(I.blur,S,{src:D.tex,step:[0,1/c],radius:oe*3,read:2,write:1}))},be=()=>{let n=P&&Ge?.35:W&&Ye&&!p?Math.min(window.devicePixelRatio||1,1.5):p?P?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),t=!Me||Ne?n:Math.max(n,Math.min(window.devicePixelRatio||1,p?1.5:dt)),l=Math.max(1,Math.round(m.clientWidth*t)),i=Math.max(1,Math.round(m.clientHeight*t));(m.width!==l||m.height!==i)&&(m.width=l,m.height=i);let c=ye==="b"&&xe?1:j?.4*Math.min(window.devicePixelRatio||1,1.5)/n:p?.25:.4,f=t===n?c:c*n/t;et=!1,de="",ne=-1,ue=-1;let u=Math.max(1,Math.round(l*f)),v=Math.max(1,Math.round(i*f));(!L||L.w!==u||L.h!==v)&&(L&&(e.deleteTexture(L.tex),e.deleteFramebuffer(L.fbo)),L=he(u,v,!1)),Xe()},tt=C?C.getContext("2d"):null,nn=(n,t)=>{if(!tt)return;if(!(n>0)||!Ae){C.style.visibility!=="hidden"&&(C.style.visibility="hidden");return}let l=m.height/Math.max(1,m.clientHeight),i=Math.max(0,Math.floor(Ae.von*l)),c=Math.min(m.height,Math.ceil(Ae.bis*l)),f=Math.max(1,c-i);(C.width!==m.width||C.height!==f)&&(C.width=m.width,C.height=f);let u=(i/l-Ae.root).toFixed(3)+"px",v=(f/l).toFixed(3)+"px";C.style.top!==u&&(C.style.top=u),C.style.height!==v&&(C.style.height=v),e.enable(e.SCISSOR_TEST),e.scissor(0,m.height-c,m.width,f),V(I.titel,null,Object.assign({},t,{feld:t.shift,maske:0,ohne:0})),e.disable(e.SCISSOR_TEST),tt.clearRect(0,0,C.width,f),tt.drawImage(m,0,i,m.width,f,0,0,m.width,f),C.style.visibility&&(C.style.visibility=""),w.titelBand=[i,c]},an=()=>{if(!L||!S)return;let n=Yt.palette,t=m.width/m.height;if(ve!==void 0)e.bindFramebuffer(e.FRAMEBUFFER,L.fbo),e.viewport(0,0,L.w,L.h),e.clearColor(ve,ve,ve,1),e.clear(e.COLOR_BUFFER_BIT);else if(ye==="b"&&xe&&I.bild){if(!et){let f=xe.w/xe.h;V(I.bild,L,{bild:xe.tex,skala:t>f?[1,f/t]:[t/f,1]}),et=!0}}else j&&ue===r||(ue=j?r:-1,V(I.field,L,{time:r,aspect:t,octaves:j?4:p?3:W&&Ye?4:5,c0:n[0],c1:n[1],c2:n[2],c3:n[3],c4:n[4]}));let l=Math.max(1,m.clientHeight),i=B?ln(performance.now()):1,c={field:L.tex,height:S.tex,htexel:wt||[1/S.w,1/S.h],bevel:oe,aspect:t,light:[X.x,X.y],...Qe?{band:Qe}:{},glass:B?i:1,form:B?T.matches?1:i:W||T.matches||F<0?1:dn(performance.now()-F,1100),res:[m.width,m.height],shift:P?(W&&(!B||Ue)?Te():window.scrollY||0)/l:0,nahtlos:me?1:0,maske:B?b.lage/l:0,ohne:B&&i<=0?1:0,detail:ye==="a"?1:0};q&&(I.titel?(nn(i,c),c.ohne=1):c.maske=c.shift),V(I.glass,null,c),w.bilder++},nt=()=>!j||!fe&&(window.scrollY||0)<m.clientHeight&&!g.classList.contains("papier-an"),_e=()=>(P||h)&&!document.hidden&&!T.matches&&nt(),Le=0,Ge=!1,b=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},on=n=>n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2,rn=56,Et=q?[".ghr-title",".ghr-eyebrow",".ghr-desc",".ghr-actions"].map(n=>d.querySelector(n)):[],yt=q?document.querySelector(".glas-kopf"):null;function sn(n){let t=yt?yt.getBoundingClientRect().bottom:0,l=Et.map(c=>c?Math.max(0,Math.min(1,(c.getBoundingClientRect().top-t)/rn)):1);Et.forEach((c,f)=>{if(!c||f===0)return;let u=l[f]>=1?"":l[f].toFixed(3);c.style.opacity!==u&&(c.style.opacity=u,c.style.pointerEvents=l[f]<.05?"none":"")});let i=Math.min(n,l[0]);return b.wert=i,b.ziel=i>0?1:0,i}function ln(n){let t=window.scrollY||0,l=d.offsetHeight||m.clientHeight||1;if(Ue){let u=Math.max(0,Math.min(1,(ft*l-t)/Math.max(1,(ft-Gt)*l)));if(u>0&&b.offen&&(b.offen=!1,b.neu++,Xe()),b.ziel=u>0?1:0,b.wert=u,b.lage=q?0:Te(),ee){let v=u>=1?"":u.toFixed(3);ee.style.opacity!==v&&(ee.style.opacity=v,ee.style.pointerEvents=u<.05?"none":""),q&&ee.style.visibility!==(u<=0?"hidden":"")&&(ee.style.visibility=u<=0?"hidden":"")}return q?sn(u):u}let i=b.ziel===1?t>Nt*l?0:1:t<Ot*l?1:0;i!==b.ziel&&(b.von=b.wert,b.t0=n,b.ziel=i,i===1&&b.offen&&(b.offen=!1,b.neu++,Xe()));let c=Math.min(1,(n-b.t0)/(T.matches?250:Xt)),f=T.matches?c:on(c);return b.wert=b.von+(b.ziel-b.von)*f,b.wert>0&&(b.lage=t),b.wert}let Tt=n=>{if(s=0,at=performance.now(),o)return;let t=(n-E)/1e3;E=n;let l=Math.min(t,.1);!p&&x<40&&_e()&&(x+=1,w.geprueft=x,x>3&&t>.05&&(y+=t>.15?3:1),y>=8&&(p=!0,w.lite=!0,w.liteBei={bild:x,ms:Math.round(performance.now()-F),blatt:g.classList.contains("papier-an")},g.setAttribute("data-glas-lite","true"),be())),j&&!fe&&O<120&&_e()&&(O+=1,w.geprueft=O,O>3&&t>.05&&(te+=t>.15?3:1),te>=8&&(fe=!0,w.standbild=!0,g.setAttribute("data-glas-standbild","true")));let i=P?Math.min(Math.max((window.scrollY||0)/Math.max(1,m.clientHeight),0),1):0;if(Me){let z=window.scrollY||0,le=Math.max(1,m.clientHeight),G=Ne?z>.66*le:z>.74*le;G!==Ne&&(Ne=G,w.wechsel=(w.wechsel||0)+1,be())}_e()&&!g.classList.contains("glas-laden")&&(r+=l*(1-.7*i));let c=Q,f=(n-c.at)/1e3>2.5,[u,v]=nt()?f&&_e()?hn(r):[c.x,c.y]:[X.x,X.y];if(X.x=zt(X.x,u,l,f?1.2:7),X.y=zt(X.y,v,l,f?1.2:7),ve!==void 0&&(X.x=.5,X.y=.7),P&&!me){let z=i>=1?!0:i<.97?!1:Ge;z!==Ge&&(Ge=z,be())}let ge=P&&!W&&i>=1&&_e()&&n-Le<40||B&&i>=1&&n-Le<30||g.classList.contains("papier-zu")&&n-Le<250,se=!1,R="";if(j){let z=window.scrollY||0;R=z/Math.max(1,m.clientHeight)>=1.55&&b.wert<=0?"tief@"+r:"",se=nt()?n-Le<14&&z===ne:z===ne||!!R&&R===de}(j?!se:!ge)&&(an(),Le=n,j&&(ne=window.scrollY||0,de=R));let re=Math.abs(X.x-u)+Math.abs(X.y-v)>.0015,A=(P||h)&&!document.hidden,Y=F>=0&&performance.now()-F<1100||B&&b.wert!==b.ziel;A&&(_e()||re||Y)&&(s=requestAnimationFrame(Tt))},at=0,J=()=>{o||(s&&performance.now()-at>500&&(cancelAnimationFrame(s),s=0),!s&&(E=at=performance.now(),s=requestAnimationFrame(Tt)))};Q.neustart=()=>{o||(cancelAnimationFrame(s),s=0,J())},Q.kick=J,Q.rebuild=()=>{o||(Xe(),ne=-1,J())};let We=j?new MutationObserver(()=>{ne=-1,J()}):null;We&&We.observe(g,{attributes:!0,attributeFilter:["class"]});let Rt=n=>{n.preventDefault(),cancelAnimationFrame(s),s=0},At=()=>Ze();m.addEventListener("webglcontextlost",Rt),m.addEventListener("webglcontextrestored",At);try{I={field:H(kt),blur:H(P?pt:qe),glass:H(P?M:ct),bild:ye==="b"?H(Qt):null,titel:q&&$e&&P?H($e):null};let n=e.createVertexArray();e.bindVertexArray(n);let t=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),be()}catch{return}d.setAttribute("data-glass","true"),w.glas=!0,w.grafik=()=>{let n=l=>Math.round(l/104857.6)/10,t=a?8:4;return{leinwand:m.width+"x"+m.height,feld:L?L.w+"x"+L.h:"",maske:S?S.w+"x"+S.h:"",mb:n(m.width*m.height*8+(L?L.w*L.h*4:0)+(S?S.w*S.h*(4+2*t):0))}},F=performance.now(),J();let it=0,ot=new ResizeObserver(()=>{cancelAnimationFrame(it),it=requestAnimationFrame(()=>{o||(be(),J())})});ot.observe(d),P&&ot.observe(m);let Ft=()=>J();P&&window.addEventListener("scroll",Ft,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>Q.rebuild());let Mt=new IntersectionObserver(([n])=>{h=n.isIntersecting,h&&J()});Mt.observe(d);let Lt=()=>!document.hidden&&J();document.addEventListener("visibilitychange",Lt),T.addEventListener("change",J),Be=()=>{o=!0,cancelAnimationFrame(s),cancelAnimationFrame(it),ot.disconnect(),Mt.disconnect(),We&&We.disconnect(),window.removeEventListener("scroll",Ft),document.removeEventListener("visibilitychange",Lt),T.removeEventListener("change",J),m.removeEventListener("webglcontextlost",Rt),m.removeEventListener("webglcontextrestored",At),Zt(),ie&&e.deleteTexture(ie);for(let n of Object.values(I||{}))e.deleteProgram(n.prog);d.setAttribute("data-glass","false"),w.glas=!1}}if(d.addEventListener("pointermove",e=>{let a=($&&m.isConnected?m:d).getBoundingClientRect();Q.x=(e.clientX-a.left)/a.width,Q.y=1-(e.clientY-a.top)/a.height,Q.at=performance.now(),Q.kick()}),d.setAttribute("data-glass","false"),W){let e=!1,a=()=>{e||(e=!0,g.classList.add("glas-schrift-da"),ze(),Ze(),w.glas||g.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(a):a(),setTimeout(a,2500);let o=0;window.addEventListener("scroll",()=>{o||(o=requestAnimationFrame(()=>{o=0,Te()}))},{passive:!0});let s=()=>{Te(),Q.neustart&&Q.neustart()};window.addEventListener("pageshow",s),document.addEventListener("visibilitychange",()=>{document.hidden||s()}),window.addEventListener("focus",s)}else Ze();let bt=performance.now(),_t=0;setInterval(()=>{let e=w.bilder;w.fps=Math.round((e-_t)*1e3/Math.max(1,performance.now()-bt)),_t=e,bt=performance.now()},1e3),window.__glas={zustand:()=>({glas:w.glas,lite:w.lite,fps:w.fps,bilder:w.bilder,geprueft:w.geprueft||0,leicht:j,standbild:!!w.standbild,angebote:mt,masken:w.masken||0,versatz:pe,ruhe:W,titel:N.textContent,punkt:g.getAttribute("data-glas-punkt")||"glas",weg:B,kopfNativ:q,titelBand:w.titelBand||null,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1,scharf:De,grafik:w.grafik?w.grafik():null,liteBei:w.liteBei||null,wechsel:w.wechsel||0}),zumKontakt:Ve,zuAngeboten:Ke}})();})();
