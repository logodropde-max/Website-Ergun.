(()=>{var gt=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,Ye=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,mt=Ye+`uniform float u_time;
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
}`,Ue=Ye+`uniform sampler2D u_src;
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
}`,je=Ye+`uniform sampler2D u_field;
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
}`;var qt=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function _t(u){let d=/^#?([0-9a-f]{6})$/i.exec(u.trim());if(!d)return null;let F=parseInt(d[1],16);return[(F>>16&255)/255,(F>>8&255)/255,(F&255)/255]}function Ht(u){return qt.map((d,F)=>_t((u&&u[F])!=null?u[F]:"")||_t(d))}function Ke(u,d){return Math.max(2,u*.075*d)}function Yt(u,d){let F=Math.min(Math.max(u/d,0),1);return 1-Math.pow(1-F,3)}function wt(u){let d=(F,Te)=>"rgba("+F.map(ge=>Math.round(ge*255)).join(",")+","+Te+")";return"radial-gradient(60% 50% at 25% 30%,"+d(u[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+d(u[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+d(u[2],.27)+",transparent 70%),"+d(u[0],1)}function Et(u,d,F,Te){return d+(u-d)*Math.exp(-Te*F)}function jt(u){return[.5+.32*Math.sin(u*.37),.56+.16*Math.sin(u*.53+1.1)]}(function(){let u=document.querySelector("[data-glas-root]");if(!u)return;let d=document.documentElement,F=new URLSearchParams(location.search),ge=Ht(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),w=u.querySelector("[data-glas-canvas]"),I=u.querySelector("[data-glas-titel]"),K=d.classList.contains("glas-fein"),me=K&&d.classList.contains("glas-nahtlos"),pe=K&&d.classList.contains("blatt-glas"),ve=pe?d.getAttribute("data-hinten")==="b"?"b":"a":"",X=K&&d.classList.contains("ruhe"),U=X&&d.classList.contains("schrift-weg"),Tt=.14,yt=.08,Rt=600,Pe=U&&d.classList.contains("titel-takt"),At=.5,Ve=.6,ne=X&&(!U||Pe)?u.querySelector(".ghr-content"):null,fe=0,$e=window.innerWidth,Je=Math.min(window.devicePixelRatio||1,2),Ze=window.matchMedia("(max-width: 899px)").matches,G=d.classList.contains("handy-leicht");function xe(){if(!ne)return fe;let e=Math.round((window.scrollY||0)*Je)/Je;return(e!==fe||!ne.style.transform)&&(fe=e,ne.style.transform="translate3d(0,"+-e+"px,0)",ne.style.visibility=e>u.offsetHeight+40?"hidden":""),fe}X&&(d.classList.add("glas-ruhe"),xe());let H=(e,t)=>(t||document).querySelector(e),ye=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function ie(e,t,r){let i=document.createElement(e);return t&&(i.className=t),r!=null&&(i.textContent=r),i}u.style.height="100svh",u.style.background=wt(ge);let be=null;if(K&&(be=ie("div","glas-buehne"),be.setAttribute("aria-hidden","true"),be.style.background=wt(ge),be.appendChild(w),document.body.insertBefore(be,document.body.firstChild),u.style.background="transparent",pe?I.innerHTML='<span class="glas-versteckt">ERGUN. \u2013 </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>':F.get("punkt")!=="orange"&&(I.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),F.get("punkt")==="orange"&&(I.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',d.setAttribute("data-glas-punkt","orange")),me&&F.get("text")!=="b"){let e=u.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(F.get("text")==="b"){let e=u.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=H(e);t&&t.remove()});let _e=H("main#inhalt"),Re=window.PREISE,Ce=ie("footer","glas-fuss");Ce.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(pe?'<span class="glas-fuss__satz">Webdesign und Automatisierung \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',_e&&_e.parentNode.insertBefore(Ce,_e.nextSibling),Re&&Re.klein&&(H("[data-glas-klein]",Ce).textContent=Re.klein+" "+(Re.steuer||""));function Ft(){let e=H("[data-glas-kopf]");return e?e.offsetHeight:0}function Lt(e){let t=0;for(let r=e;r;r=r.offsetParent)t+=r.offsetTop;return t}let Qe=window.matchMedia("(prefers-reduced-motion: reduce)");function et(e){e&&window.scrollTo({top:Math.max(0,Lt(e)-Ft()-20),behavior:Qe.matches?"auto":"smooth"})}function Ie(){et(H("#angebote"))}function Be(){let e=H("#preise .mf__oben");et(e&&!e.hidden?e:H("#preise .mf__raster"))}window.__kristall={zumKontakt:Be,zuAngeboten:Ie},document.addEventListener("click",e=>{if(K&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:Qe.matches?"auto":"smooth"});return}let r=e.target.closest&&e.target.closest("[data-glas-ziel]");r&&(e.preventDefault(),r.getAttribute("data-glas-ziel")==="kontakt"?Be():Ie())});let tt=!1;function Mt(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),ye(".k-angebot",e).forEach(r=>{let i=H(".k-angebot__wort",r),p=H(".k-angebot__info",r),o=p&&p.querySelector("b")?p.querySelector("b").textContent.trim():"",c=p?p.textContent.replace(o,"").replace(/^\s*·\s*/,"").trim():"",g=o.split(" + ");r.classList.add("glas-karte"),r.innerHTML="",r.appendChild(ie("span","k-angebot__wort glas-karte__titel",i?i.textContent:"")),r.appendChild(ie("span","glas-karte__satz",c));let v=ie("span","glas-karte__preis");v.appendChild(ie("b","",g[0])),g[1]&&v.appendChild(ie("small","","+ "+g.slice(1).join(" + "))),r.appendChild(v)}),tt=!0,!0}if((function e(t){!Mt()&&t<60&&setTimeout(()=>e(t+1),50)})(0),_e){_e.classList.add("glas-haupt");let e=H("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=H("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(r=>{r.isIntersecting&&(r.target.classList.add("ist-da"),e.unobserve(r.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>ye(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else d.classList.add("glas-alles-da");let St={palette:ge,title:I.textContent},Y={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},A={glas:!1,lite:!1,fps:0,bilder:0},Ae=null,nt=Ue.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),D=je.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);me&&(D=D.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let ue={schwarz:0,weiss:.8}[F.get("glasfeld")];ue!==void 0&&(D=D.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let ze=F.get("glasdbg");if(K&&ze&&(D=D.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(ze==="g"?"dh.g":ze==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),K&&U){let e=me?`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"";D=D.split("texture(u_height, vec2(0.0, -u_shift) + ").join("texture(u_height, vec2(0.0, -u_maske) + ").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_maske;
uniform float u_ohne;`).replace(`  vec2 uv = vUv;
`,`  vec2 uv = vUv;
  if (u_ohne > 0.5) {
  vec3 col = texture(u_field, uv).rgb;
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`+e+`  o = vec4(col, 1.0);
  return;
  }
`)}if(pe){let e=`uniform float u_detail;
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
`;D=D.replace("uv + away * 0.012","uv + away * 0.0045").replace("bg *= 1.0 - 0.32 * smoothstep","bg *= 1.0 - 0.2 * smoothstep"),D=D.replace("void main() {",e+"void main() {").replace(`  vec3 bg = texture(u_field, uv).rgb;
`,`  vec3 bg = zeichnung(texture(u_field, uv).rgb, uv);
`).replace(`  vec3 col = texture(u_field, uv).rgb;
`,`  vec3 col = zeichnung(texture(u_field, uv).rgb, uv);
`)}let kt=nt===Ue||D.indexOf("u_shift")<0||K&&U&&D.indexOf("u_ohne > 0.5")<0,k=K&&!kt,Ut=.06;function Dt(){let e=ye(".glas-z",I);if(e.length<2)return;e.forEach(o=>{o.style.marginLeft=""});let t=getComputedStyle(I),r=parseFloat(t.fontSize)||64,i=document.createElement("canvas").getContext("2d");if(!i)return;i.font=t.fontStyle+" "+t.fontWeight+" "+r+"px "+t.fontFamily,"letterSpacing"in i&&(i.letterSpacing="0px");let p=e.map(o=>{let c=o.getBoundingClientRect(),g=i.measureText(o.textContent);return[c.left-g.actualBoundingBoxLeft,c.left+g.actualBoundingBoxRight]});for(let o=1;o<e.length;o++)e[o].style.marginLeft=((Ut*r-(p[o][0]-p[o-1][1]))/r).toFixed(4)+"em"}function Fe(){if(!k)return;I.style.fontSize="",Dt();let e=I.querySelector(".ghr-word");if(!e)return;let t=e.getBoundingClientRect().width;if(pe){let o={};ye(".ghr-word",I).forEach(c=>{let g=c.getBoundingClientRect(),v=Math.round(g.top/4);o[v]=o[v]?[Math.min(o[v][0],g.left),Math.max(o[v][1],g.right)]:[g.left,g.right]}),t=Math.max(...Object.values(o).map(c=>c[1]-c[0]))}let r=parseFloat(getComputedStyle(I).fontSize)||64,i=r*.16,p=u.clientWidth*(1-2*.06);t+i>p&&(I.style.fontSize=(r*p/(t+i)).toFixed(2)+"px")}k&&(Fe(),window.addEventListener("resize",()=>{X&&window.innerWidth===$e||($e=window.innerWidth,Fe())}));function at(e,t,r,i,p){let o=0;i[0]=0,p[0]=-1e20,p[1]=1e20;for(let c=1;c<t;c++){let g=(e[c]+c*c-(e[i[o]]+i[o]*i[o]))/(2*c-2*i[o]);for(;g<=p[o];)o--,g=(e[c]+c*c-(e[i[o]]+i[o]*i[o]))/(2*c-2*i[o]);o++,i[o]=c,p[o]=g,p[o+1]=1e20}o=0;for(let c=0;c<t;c++){for(;p[o+1]<c;)o++;r[c]=(c-i[o])*(c-i[o])+e[i[o]]}}function rt(e,t,r){let i=Math.max(t,r),p=new Float64Array(i),o=new Float64Array(i),c=new Int32Array(i),g=new Float64Array(i+1);for(let v=0;v<t;v++){for(let _=0;_<r;_++)p[_]=e[_*t+v];at(p,r,o,c,g);for(let _=0;_<r;_++)e[_*t+v]=o[_]}for(let v=0;v<r;v++){for(let _=0;_<t;_++)p[_]=e[v*t+_];at(p,t,o,c,g);for(let _=0;_<t;_++)e[v*t+_]=o[_]}return e}function Pt(e){let t=Math.abs(e)/Math.SQRT2,r=1/(1+.3275911*t),i=1-((((1.061405429*r-1.453152027)*r+1.421413741)*r-.284496736)*r+.254829592)*r*Math.exp(-t*t);return e>=0?.5*(1+i):.5*(1-i)}function Ct(e,t,r,i){let p=e.getImageData(0,0,t,r),o=p.data,c=t,g=r,v=-1,_=-1;for(let T=0;T<r;T++)for(let E=0;E<t;E++)o[(T*t+E)*4]>0&&(E<c&&(c=E),E>v&&(v=E),T<g&&(g=T),T>_&&(_=T));if(v<0)return;let ae=Math.ceil(i*2.5)+2;c=Math.max(0,c-ae),g=Math.max(0,g-ae),v=Math.min(t-1,v+ae),_=Math.min(r-1,_+ae);let B=v-c+1,V=_-g+1,$=new Float64Array(B*V),se=new Float64Array(B*V),re=new Float32Array(B*V);for(let T=0;T<V;T++)for(let E=0;E<B;E++){let O=T*B+E,W=o[((T+g)*t+E+c)*4]/255;re[O]=W,$[O]=W<.5?0:1e20,se[O]=W>=.5?0:1e20}rt($,B,V),rt(se,B,V);let z=Math.max(i*.5,.5);for(let T=0;T<V;T++)for(let E=0;E<B;E++){let O=T*B+E,W=((T+g)*t+E+c)*4,J=re[O]>=.5?Math.sqrt($[O])-.5:.5-Math.sqrt(se[O]),le=Math.abs(J)<1?re[O]-.5:J;o[W]=Math.round(Pt(le/z)*255),o[W+1]=Math.round(re[O]*255),o[W+2]=0}e.putImageData(p,0,0)}function Ne(){Ae&&(Ae(),Ae=null);let e=/[?&]webgl=aus\b/.test(location.search)||d.classList.contains("grund-farbwechsel")?null:w.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||k&&!!e.getExtension("EXT_color_buffer_half_float"),r=!1,i=0,p=0,o=0,c=!0,g=!1,v=0,_=0,ae=!1,B=0,V=0,$=-1,se="",re=-1;G&&(g=!0,A.lite=!0,d.setAttribute("data-glas-lite","true"));let z={x:.5,y:.56},T=-1,E=window.matchMedia("(prefers-reduced-motion: reduce)"),O=(a,n)=>{let s=e.createShader(a);if(!s)throw new Error("could not create shader");if(e.shaderSource(s,n),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(s));return s},W=a=>{let n=e.createProgram();if(!n)throw new Error("could not create program");let s=O(e.VERTEX_SHADER,gt),l=O(e.FRAGMENT_SHADER,a);if(e.attachShader(n,s),e.attachShader(n,l),e.bindAttribLocation(n,0,"a_position"),e.linkProgram(n),e.deleteShader(s),e.deleteShader(l),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(n));let f={},b=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let h=0;h<b;h++){let R=e.getActiveUniform(n,h);R&&(f[R.name.replace(/^u_/,"")]=e.getUniformLocation(n,R.name))}return{prog:n,u:f}},J={tex:[],fbo:[]},le=(a,n,s)=>{let l=e.createTexture(),f=e.createFramebuffer();if(!l||!f)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),s&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,a,n,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,a,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,f),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),J.tex.push(l),J.fbo.push(f),{tex:l,fbo:f,w:a,h:n}},It=()=>{for(let a of J.tex)e.deleteTexture(a);for(let a of J.fbo)e.deleteFramebuffer(a);J.tex=[],J.fbo=[]},N=null,P=null,L=null,C=null,Z=null,Q=4,de=null,Xe=!1,Bt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D u_bild;
uniform vec2 u_skala;
void main() { vec2 uv = (vUv - 0.5) * u_skala + 0.5; o = vec4(texture(u_bild, uv).rgb, 1.0); }
`;if(ve==="b"){let a=new Image;a.decoding="async",a.onload=()=>{if(r)return;let n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),de={tex:n,w:a.naturalWidth,h:a.naturalHeight},J.tex.push(n),we(),q()},a.src="bilder/glas/hinten-"+(window.innerWidth>=window.innerHeight?"quer":"hoch")+".webp?v=1"}let j=(a,n,s)=>{e.useProgram(a.prog);let l=0;for(let f in s){let b=a.u[f];if(!b)continue;let h=s[f];typeof h=="number"?e.uniform1f(b,h):Array.isArray(h)?h.length===2?e.uniform2f(b,h[0],h[1]):e.uniform3f(b,h[0],h[1],h[2]):(e.activeTexture(e.TEXTURE0+l),e.bindTexture(e.TEXTURE_2D,h),e.uniform1i(b,l++))}e.bindFramebuffer(e.FRAMEBUFFER,n?n.fbo:null),e.viewport(0,0,n?n.w:w.width,n?n.h:w.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Le="",zt=()=>{Fe();let a=I,n=w.getBoundingClientRect(),s=g?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),l=Math.max(1,Math.round(n.width*s)),f=Math.max(1,Math.round(n.height*s)),b=getComputedStyle(a),h=parseFloat(b.fontSize)||64,R=X&&!U?fe:window.scrollY||0,oe=[],ee=document.createTreeWalker(a,NodeFilter.SHOW_TEXT),S=m=>!!(m.parentElement&&m.parentElement.closest&&m.parentElement.closest(".glas-versteckt"));for(let m=ee.nextNode();m;m=ee.nextNode())for(let te=0;te<(S(m)?0:m.data.length);te++){if(/\s/.test(m.data[te]))continue;let He=document.createRange();He.setStart(m,te),He.setEnd(m,te+1);let ht=He.getBoundingClientRect();oe.push([m.data[te],ht.left-n.left,ht.top+R])}let ce=[l,f,s,b.font].concat(oe.map(m=>m[0]+"@"+m[1].toFixed(1)+","+m[2].toFixed(1))).join("|");if(ce===Le)return;Le=ce;let y=document.createElement("canvas");y.width=l,y.height=f;let M=y.getContext("2d");if(M)return M.fillStyle="#000",M.fillRect(0,0,l,f),M.font=b.fontStyle+" "+b.fontWeight+" "+(h*s).toFixed(2)+"px "+b.fontFamily,"letterSpacing"in M&&(M.letterSpacing="0px"),M.fillStyle="#fff",M.textBaseline="alphabetic",oe.forEach(m=>{let te=M.measureText(m[0]).fontBoundingBoxAscent||h*s*.8;M.fillText(m[0],m[1]*s,m[2]*s+te)}),Ct(M,l,f,Ke(h,s)),{cnv:y,w:l,h:f,fontPx:h,scale:s}},Nt=(a,n,s,l,f)=>{if(A.masken=(A.masken||0)+1,Z||(Z=e.createTexture()),e.bindTexture(e.TEXTURE_2D,Z),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!L||L.w!==n||L.h!==s){for(let h of[L,C])h&&(e.deleteTexture(h.tex),e.deleteFramebuffer(h.fbo));L=le(n,s,!0),C=le(n,s,!0)}Q=Ke(l,f);let b=Math.max(1.5*f,Q*.25);j(N.blur,L,{src:Z,step:[1/n,0],radius:b,read:1,write:0}),j(N.blur,C,{src:L.tex,step:[0,1/s],radius:b,read:1,write:0}),j(N.blur,L,{src:C.tex,step:[1/n,0],radius:Q*3,read:1,write:1}),j(N.blur,C,{src:L.tex,step:[0,1/s],radius:Q*3,read:2,write:1})},Me=()=>{let a=I;if(!a||!P)return;if(U&&x.ziel===0){x.offen=!0;return}if(k){let y=zt();y&&Nt(y.cnv,y.w,y.h,y.fontPx,y.scale);return}let n=u.getBoundingClientRect(),s=g?1:Math.min(window.devicePixelRatio||1,1.5),l=Math.max(1,Math.round(n.width*s)),f=Math.max(1,Math.round(n.height*s)),b=Array.from(a.querySelectorAll(".ghr-word")),h=b.map(y=>y.getBoundingClientRect()),R=getComputedStyle(a),oe=[l,f,s,R.font,R.letterSpacing].concat(b.map((y,M)=>(y.textContent||"")+"@"+Math.round(h[M].left-n.left)+","+Math.round(h[M].top-n.top))).join("|");if(oe===Le)return;Le=oe;let ee=document.createElement("canvas");ee.width=l,ee.height=f;let S=ee.getContext("2d");if(!S)return;S.fillStyle="#000",S.fillRect(0,0,l,f);let ce=parseFloat(R.fontSize)||64;if(S.setTransform(s,0,0,s,0,0),S.font=R.fontStyle+" "+R.fontWeight+" "+R.fontSize+" "+R.fontFamily,"letterSpacing"in S&&(S.letterSpacing=R.letterSpacing==="normal"?"0px":R.letterSpacing),S.fillStyle="#fff",S.textBaseline="alphabetic",b.forEach((y,M)=>{let m=y.textContent||"",te=S.measureText(m).fontBoundingBoxAscent||ce*.8;S.fillText(m,h[M].left-n.left,h[M].top-n.top+te)}),Z||(Z=e.createTexture()),e.bindTexture(e.TEXTURE_2D,Z),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,ee),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!L||L.w!==l||L.h!==f){for(let y of[L,C])y&&(e.deleteTexture(y.tex),e.deleteFramebuffer(y.fbo));L=le(l,f,!0),C=le(l,f,!0)}Q=Ke(ce,s),!(!L||!C)&&(j(N.blur,L,{src:Z,step:[1/l,0],radius:Q,read:0,write:0}),j(N.blur,C,{src:L.tex,step:[0,1/f],radius:Q,read:1,write:0}),j(N.blur,L,{src:C.tex,step:[1/l,0],radius:Q*3,read:1,write:1}),j(N.blur,C,{src:L.tex,step:[0,1/f],radius:Q*3,read:2,write:1}))},we=()=>{let a=k&&Se?.35:X&&Ze&&!g?Math.min(window.devicePixelRatio||1,1.5):g?k?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),n=Math.max(1,Math.round(w.clientWidth*a)),s=Math.max(1,Math.round(w.clientHeight*a));(w.width!==n||w.height!==s)&&(w.width=n,w.height=s);let l=ve==="b"&&de?1:G?.4*Math.min(window.devicePixelRatio||1,1.5)/a:g?.25:.4;Xe=!1,se="",$=-1,re=-1;let f=Math.max(1,Math.round(n*l)),b=Math.max(1,Math.round(s*l));(!P||P.w!==f||P.h!==b)&&(P&&(e.deleteTexture(P.tex),e.deleteFramebuffer(P.fbo)),P=le(f,b,!1)),Me()},Xt=()=>{if(!P||!C)return;let a=St.palette,n=w.width/w.height;if(ue!==void 0)e.bindFramebuffer(e.FRAMEBUFFER,P.fbo),e.viewport(0,0,P.w,P.h),e.clearColor(ue,ue,ue,1),e.clear(e.COLOR_BUFFER_BIT);else if(ve==="b"&&de&&N.bild){if(!Xe){let f=de.w/de.h;j(N.bild,P,{bild:de.tex,skala:n>f?[1,f/n]:[n/f,1]}),Xe=!0}}else G&&re===o||(re=G?o:-1,j(N.field,P,{time:o,aspect:n,octaves:G?4:g?3:X&&Ze?4:5,c0:a[0],c1:a[1],c2:a[2],c3:a[3],c4:a[4]}));let s=Math.max(1,w.clientHeight),l=U?Ot(performance.now()):1;j(N.glass,null,{field:P.tex,height:C.tex,htexel:[1/C.w,1/C.h],bevel:Q,aspect:n,light:[z.x,z.y],glass:U?l:1,form:U?E.matches?1:l:X||E.matches||T<0?1:Yt(performance.now()-T,1100),res:[w.width,w.height],shift:k?(X&&(!U||Pe)?xe():window.scrollY||0)/s:0,nahtlos:me?1:0,maske:U?x.lage/s:0,ohne:U&&l<=0?1:0,detail:ve==="a"?1:0}),A.bilder++},Ge=()=>!G||!ae&&(window.scrollY||0)<w.clientHeight&&!d.classList.contains("papier-an"),he=()=>(k||c)&&!document.hidden&&!E.matches&&Ge(),Ee=0,Se=!1,x=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},Gt=a=>a<.5?4*a*a*a:1-Math.pow(-2*a+2,3)/2;function Ot(a){let n=window.scrollY||0,s=u.offsetHeight||w.clientHeight||1;if(Pe){let h=Math.max(0,Math.min(1,(Ve*s-n)/Math.max(1,(Ve-At)*s)));if(h>0&&x.offen&&(x.offen=!1,x.neu++,Me()),x.ziel=h>0?1:0,x.wert=h,x.lage=xe(),ne){let R=h>=1?"":h.toFixed(3);ne.style.opacity!==R&&(ne.style.opacity=R,ne.style.pointerEvents=h<.05?"none":"")}return h}let l=x.ziel===1?n>Tt*s?0:1:n<yt*s?1:0;l!==x.ziel&&(x.von=x.wert,x.t0=a,x.ziel=l,l===1&&x.offen&&(x.offen=!1,x.neu++,Me()));let f=Math.min(1,(a-x.t0)/(E.matches?250:Rt)),b=E.matches?f:Gt(f);return x.wert=x.von+(x.ziel-x.von)*b,x.wert>0&&(x.lage=n),x.wert}let st=a=>{if(i=0,Oe=performance.now(),r)return;let n=(a-p)/1e3;p=a;let s=Math.min(n,.1);!g&&v<40&&he()&&(v+=1,A.geprueft=v,v>3&&n>.05&&(_+=n>.15?3:1),_>=8&&(g=!0,A.lite=!0,d.setAttribute("data-glas-lite","true"),we())),G&&!ae&&B<120&&he()&&(B+=1,A.geprueft=B,B>3&&n>.05&&(V+=n>.15?3:1),V>=8&&(ae=!0,A.standbild=!0,d.setAttribute("data-glas-standbild","true")));let l=k?Math.min(Math.max((window.scrollY||0)/Math.max(1,w.clientHeight),0),1):0;he()&&!d.classList.contains("glas-laden")&&(o+=s*(1-.7*l));let f=Y,b=(a-f.at)/1e3>2.5,[h,R]=Ge()?b&&he()?jt(o):[f.x,f.y]:[z.x,z.y];if(z.x=Et(z.x,h,s,b?1.2:7),z.y=Et(z.y,R,s,b?1.2:7),ue!==void 0&&(z.x=.5,z.y=.7),k&&!me){let m=l>=1?!0:l<.97?!1:Se;m!==Se&&(Se=m,we())}let oe=k&&!X&&l>=1&&he()&&a-Ee<40||U&&l>=1&&a-Ee<30||d.classList.contains("papier-zu")&&a-Ee<250,ee=!1,S="";if(G){let m=window.scrollY||0;S=m/Math.max(1,w.clientHeight)>=1.55&&x.wert<=0?"tief@"+o:"",ee=Ge()?a-Ee<14&&m===$:m===$||!!S&&S===se}(G?!ee:!oe)&&(Xt(),Ee=a,G&&($=window.scrollY||0,se=S));let ce=Math.abs(z.x-h)+Math.abs(z.y-R)>.0015,y=(k||c)&&!document.hidden,M=T>=0&&performance.now()-T<1100||U&&x.wert!==x.ziel;y&&(he()||ce||M)&&(i=requestAnimationFrame(st))},Oe=0,q=()=>{r||(i&&performance.now()-Oe>500&&(cancelAnimationFrame(i),i=0),!i&&(p=Oe=performance.now(),i=requestAnimationFrame(st)))};Y.neustart=()=>{r||(cancelAnimationFrame(i),i=0,q())},Y.kick=q,Y.rebuild=()=>{r||(Me(),$=-1,q())};let ke=G?new MutationObserver(()=>{$=-1,q()}):null;ke&&ke.observe(d,{attributes:!0,attributeFilter:["class"]});let lt=a=>{a.preventDefault(),cancelAnimationFrame(i),i=0},ct=()=>Ne();w.addEventListener("webglcontextlost",lt),w.addEventListener("webglcontextrestored",ct);try{N={field:W(mt),blur:W(k?nt:Ue),glass:W(k?D:je),bild:ve==="b"?W(Bt):null};let a=e.createVertexArray();e.bindVertexArray(a);let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),we()}catch{return}u.setAttribute("data-glass","true"),A.glas=!0,T=performance.now(),q();let We=0,qe=new ResizeObserver(()=>{cancelAnimationFrame(We),We=requestAnimationFrame(()=>{r||(we(),q())})});qe.observe(u),k&&qe.observe(w);let ft=()=>q();k&&window.addEventListener("scroll",ft,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>Y.rebuild());let ut=new IntersectionObserver(([a])=>{c=a.isIntersecting,c&&q()});ut.observe(u);let dt=()=>!document.hidden&&q();document.addEventListener("visibilitychange",dt),E.addEventListener("change",q),Ae=()=>{r=!0,cancelAnimationFrame(i),cancelAnimationFrame(We),qe.disconnect(),ut.disconnect(),ke&&ke.disconnect(),window.removeEventListener("scroll",ft),document.removeEventListener("visibilitychange",dt),E.removeEventListener("change",q),w.removeEventListener("webglcontextlost",lt),w.removeEventListener("webglcontextrestored",ct),It(),Z&&e.deleteTexture(Z);for(let a of Object.values(N||{}))e.deleteProgram(a.prog);u.setAttribute("data-glass","false"),A.glas=!1}}if(u.addEventListener("pointermove",e=>{let t=(K&&w.isConnected?w:u).getBoundingClientRect();Y.x=(e.clientX-t.left)/t.width,Y.y=1-(e.clientY-t.top)/t.height,Y.at=performance.now(),Y.kick()}),u.setAttribute("data-glass","false"),X){let e=!1,t=()=>{e||(e=!0,d.classList.add("glas-schrift-da"),Fe(),Ne(),A.glas||d.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500);let r=0;window.addEventListener("scroll",()=>{r||(r=requestAnimationFrame(()=>{r=0,xe()}))},{passive:!0});let i=()=>{xe(),Y.neustart&&Y.neustart()};window.addEventListener("pageshow",i),document.addEventListener("visibilitychange",()=>{document.hidden||i()}),window.addEventListener("focus",i)}else Ne();let ot=performance.now(),it=0;setInterval(()=>{let e=A.bilder;A.fps=Math.round((e-it)*1e3/Math.max(1,performance.now()-ot)),it=e,ot=performance.now()},1e3),window.__glas={zustand:()=>({glas:A.glas,lite:A.lite,fps:A.fps,bilder:A.bilder,geprueft:A.geprueft||0,leicht:G,standbild:!!A.standbild,angebote:tt,masken:A.masken||0,versatz:fe,ruhe:X,titel:I.textContent,punkt:d.getAttribute("data-glas-punkt")||"glas",weg:U,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1}),zumKontakt:Be,zuAngeboten:Ie}})();})();
