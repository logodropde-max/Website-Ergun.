(()=>{var Tt=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,nt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,yt=nt+`uniform float u_time;
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
}`,ze=nt+`uniform sampler2D u_src;
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
}`,at=nt+`uniform sampler2D u_field;
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
}`;var Qt=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function Lt(d){let f=/^#?([0-9a-f]{6})$/i.exec(d.trim());if(!f)return null;let S=parseInt(f[1],16);return[(S>>16&255)/255,(S>>8&255)/255,(S&255)/255]}function en(d){return Qt.map((f,S)=>Lt((d&&d[S])!=null?d[S]:"")||Lt(f))}function Xe(d,f){return Math.max(2,d*.075*f)}function tn(d,f){let S=Math.min(Math.max(d/f,0),1);return 1-Math.pow(1-S,3)}function St(d){let f=(S,Fe)=>"rgba("+S.map(xe=>Math.round(xe*255)).join(",")+","+Fe+")";return"radial-gradient(60% 50% at 25% 30%,"+f(d[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+f(d[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+f(d[2],.27)+",transparent 70%),"+f(d[0],1)}function kt(d,f,S,Fe){return f+(d-f)*Math.exp(-Fe*S)}function nn(d){return[.5+.32*Math.sin(d*.37),.56+.16*Math.sin(d*.53+1.1)]}(function(){let d=document.querySelector("[data-glas-root]");if(!d)return;let f=document.documentElement,S=new URLSearchParams(location.search),xe=en(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),m=d.querySelector("[data-glas-canvas]"),B=d.querySelector("[data-glas-titel]"),K=f.classList.contains("glas-fein"),be=K&&f.classList.contains("glas-nahtlos"),_e=K&&f.classList.contains("blatt-glas"),we=_e?f.getAttribute("data-hinten")==="b"?"b":"a":"",O=K&&f.classList.contains("ruhe"),C=O&&f.classList.contains("schrift-weg"),Ut=.14,Dt=.08,Pt=600,Ge=C&&f.classList.contains("titel-takt"),Ct=.5,rt=.6,oe=O&&(!C||Ge)?d.querySelector(".ghr-content"):null,he=0,it=window.innerWidth,ot=Math.min(window.devicePixelRatio||1,2),Oe=window.matchMedia("(max-width: 899px)").matches,q=f.classList.contains("handy-leicht"),Me=K&&O&&Oe&&f.classList.contains("titel-scharf"),st=Math.min(3,Math.max(1.5,parseFloat(f.getAttribute("data-scharf"))||3));function Ee(){if(!oe)return he;let e=Math.round((window.scrollY||0)*ot)/ot;return(e!==he||!oe.style.transform)&&(he=e,oe.style.transform="translate3d(0,"+-e+"px,0)",oe.style.visibility=e>d.offsetHeight+40?"hidden":""),he}O&&(f.classList.add("glas-ruhe"),Ee());let V=(e,n)=>(n||document).querySelector(e),Le=(e,n)=>[].slice.call((n||document).querySelectorAll(e));function ce(e,n,r){let o=document.createElement(e);return n&&(o.className=n),r!=null&&(o.textContent=r),o}d.style.height="100svh",d.style.background=St(xe);let Te=null;if(K&&(Te=ce("div","glas-buehne"),Te.setAttribute("aria-hidden","true"),Te.style.background=St(xe),Te.appendChild(m),document.body.insertBefore(Te,document.body.firstChild),d.style.background="transparent",_e?B.innerHTML='<span class="glas-versteckt">ERGUN. \u2013 </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>':S.get("punkt")!=="orange"&&(B.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),S.get("punkt")==="orange"&&(B.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',f.setAttribute("data-glas-punkt","orange")),be&&S.get("text")!=="b"){let e=d.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(S.get("text")==="b"){let e=d.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let n=V(e);n&&n.remove()});let ye=V("main#inhalt"),Se=window.PREISE,We=ce("footer","glas-fuss");We.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(_e?'<span class="glas-fuss__satz">Webdesign und Automatisierung \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',ye&&ye.parentNode.insertBefore(We,ye.nextSibling),Se&&Se.klein&&(V("[data-glas-klein]",We).textContent=Se.klein+" "+(Se.steuer||""));function It(){let e=V("[data-glas-kopf]");return e?e.offsetHeight:0}function Bt(e){let n=0;for(let r=e;r;r=r.offsetParent)n+=r.offsetTop;return n}let lt=window.matchMedia("(prefers-reduced-motion: reduce)");function ct(e){e&&window.scrollTo({top:Math.max(0,Bt(e)-It()-20),behavior:lt.matches?"auto":"smooth"})}function qe(){ct(V("#angebote"))}function He(){let e=V("#preise .mf__oben");ct(e&&!e.hidden?e:V("#preise .mf__raster"))}window.__kristall={zumKontakt:He,zuAngeboten:qe},document.addEventListener("click",e=>{if(K&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:lt.matches?"auto":"smooth"});return}let r=e.target.closest&&e.target.closest("[data-glas-ziel]");r&&(e.preventDefault(),r.getAttribute("data-glas-ziel")==="kontakt"?He():qe())});let ft=!1;function zt(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let n=e.querySelector("h2");return n&&(n.className="glas-h2",n.textContent="Was brauchen Sie?"),Le(".k-angebot",e).forEach(r=>{let o=V(".k-angebot__wort",r),v=V(".k-angebot__info",r),i=v&&v.querySelector("b")?v.querySelector("b").textContent.trim():"",c=v?v.textContent.replace(i,"").replace(/^\s*·\s*/,"").trim():"",h=i.split(" + ");r.classList.add("glas-karte"),r.innerHTML="",r.appendChild(ce("span","k-angebot__wort glas-karte__titel",o?o.textContent:"")),r.appendChild(ce("span","glas-karte__satz",c));let p=ce("span","glas-karte__preis");p.appendChild(ce("b","",h[0])),h[1]&&p.appendChild(ce("small","","+ "+h.slice(1).join(" + "))),r.appendChild(p)}),ft=!0,!0}if((function e(n){!zt()&&n<60&&setTimeout(()=>e(n+1),50)})(0),ye){ye.classList.add("glas-haupt");let e=V("#preise .mf__oben");e&&e.classList.add("glas-rein");let n=V("#preise .mf__raster");n&&n.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(n=>n.forEach(r=>{r.isIntersecting&&(r.target.classList.add("ist-da"),e.unobserve(r.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>Le(".glas-rein, .glas-fuss").forEach(n=>e.observe(n)),60)}else f.classList.add("glas-alles-da");let Nt={palette:xe,title:B.textContent},J={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},w={glas:!1,lite:!1,fps:0,bilder:0},ke=null,ut=ze.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),U=at.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);be&&(U=U.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let ge={schwarz:0,weiss:.8}[S.get("glasfeld")];ge!==void 0&&(U=U.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let Ye=S.get("glasdbg");if(K&&Ye&&(U=U.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(Ye==="g"?"dh.g":Ye==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),K&&C){let e=be?`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"";U=U.split("texture(u_height, vec2(0.0, -u_shift) + ").join("texture(u_height, vec2(0.0, -u_maske) + ").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_maske;
uniform float u_ohne;`).replace(`  vec2 uv = vUv;
`,`  vec2 uv = vUv;
  if (u_ohne > 0.5) {
  vec3 col = texture(u_field, uv).rgb;
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`+e+`  o = vec4(col, 1.0);
  return;
  }
`)}if(_e){let e=`uniform float u_detail;
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
`;U=U.replace("uv + away * 0.012","uv + away * 0.0045").replace("bg *= 1.0 - 0.32 * smoothstep","bg *= 1.0 - 0.2 * smoothstep"),U=U.replace("void main() {",e+"void main() {").replace(`  vec3 bg = texture(u_field, uv).rgb;
`,`  vec3 bg = zeichnung(texture(u_field, uv).rgb, uv);
`).replace(`  vec3 col = texture(u_field, uv).rgb;
`,`  vec3 col = zeichnung(texture(u_field, uv).rgb, uv);
`)}Me&&(U=U.split("texture(u_height, ").join("hoehe(").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform vec2 u_band;
vec4 hoehe(vec2 p) { return texture(u_height, vec2(p.x, p.y * u_band.x + u_band.y)); }`));let Xt=ut===ze||U.indexOf("u_shift")<0||K&&C&&U.indexOf("u_ohne > 0.5")<0||Me&&U.split("texture(u_height, ").length!==2,D=K&&!Xt,Gt=.06;function Ot(){let e=Le(".glas-z",B);if(e.length<2)return;e.forEach(i=>{i.style.marginLeft=""});let n=getComputedStyle(B),r=parseFloat(n.fontSize)||64,o=document.createElement("canvas").getContext("2d");if(!o)return;o.font=n.fontStyle+" "+n.fontWeight+" "+r+"px "+n.fontFamily,"letterSpacing"in o&&(o.letterSpacing="0px");let v=e.map(i=>{let c=i.getBoundingClientRect(),h=o.measureText(i.textContent);return[c.left-h.actualBoundingBoxLeft,c.left+h.actualBoundingBoxRight]});for(let i=1;i<e.length;i++)e[i].style.marginLeft=((Gt*r-(v[i][0]-v[i-1][1]))/r).toFixed(4)+"em"}function Ue(){if(!D)return;B.style.fontSize="",Ot();let e=B.querySelector(".ghr-word");if(!e)return;let n=e.getBoundingClientRect().width;if(_e){let i={};Le(".ghr-word",B).forEach(c=>{let h=c.getBoundingClientRect(),p=Math.round(h.top/4);i[p]=i[p]?[Math.min(i[p][0],h.left),Math.max(i[p][1],h.right)]:[h.left,h.right]}),n=Math.max(...Object.values(i).map(c=>c[1]-c[0]))}let r=parseFloat(getComputedStyle(B).fontSize)||64,o=r*.16,v=d.clientWidth*(1-2*.06);n+o>v&&(B.style.fontSize=(r*v/(n+o)).toFixed(2)+"px")}D&&(Ue(),window.addEventListener("resize",()=>{O&&window.innerWidth===it||(it=window.innerWidth,Ue())}));function dt(e,n,r,o,v){let i=0;o[0]=0,v[0]=-1e20,v[1]=1e20;for(let c=1;c<n;c++){let h=(e[c]+c*c-(e[o[i]]+o[i]*o[i]))/(2*c-2*o[i]);for(;h<=v[i];)i--,h=(e[c]+c*c-(e[o[i]]+o[i]*o[i]))/(2*c-2*o[i]);i++,o[i]=c,v[i]=h,v[i+1]=1e20}i=0;for(let c=0;c<n;c++){for(;v[i+1]<c;)i++;r[c]=(c-o[i])*(c-o[i])+e[o[i]]}}function ht(e,n,r){let o=Math.max(n,r),v=new Float64Array(o),i=new Float64Array(o),c=new Int32Array(o),h=new Float64Array(o+1);for(let p=0;p<n;p++){for(let E=0;E<r;E++)v[E]=e[E*n+p];dt(v,r,i,c,h);for(let E=0;E<r;E++)e[E*n+p]=i[E]}for(let p=0;p<r;p++){for(let E=0;E<n;E++)v[E]=e[p*n+E];dt(v,n,i,c,h);for(let E=0;E<n;E++)e[p*n+E]=i[E]}return e}function Wt(e){let n=Math.abs(e)/Math.SQRT2,r=1/(1+.3275911*n),o=1-((((1.061405429*r-1.453152027)*r+1.421413741)*r-.284496736)*r+.254829592)*r*Math.exp(-n*n);return e>=0?.5*(1+o):.5*(1-o)}function qt(e,n,r,o){let v=e.getImageData(0,0,n,r),i=v.data,c=n,h=r,p=-1,E=-1;for(let F=0;F<r;F++)for(let y=0;y<n;y++)i[(F*n+y)*4]>0&&(y<c&&(c=y),y>p&&(p=y),F<h&&(h=F),F>E&&(E=F));if(p<0)return;let se=Math.ceil(o*2.5)+2;c=Math.max(0,c-se),h=Math.max(0,h-se),p=Math.min(n-1,p+se),E=Math.min(r-1,E+se);let z=p-c+1,Z=E-h+1,Q=new Float64Array(z*Z),fe=new Float64Array(z*Z),le=new Float32Array(z*Z);for(let F=0;F<Z;F++)for(let y=0;y<z;y++){let H=F*z+y,Y=i[((F+h)*n+y+c)*4]/255;le[H]=Y,Q[H]=Y<.5?0:1e20,fe[H]=Y>=.5?0:1e20}ht(Q,z,Z),ht(fe,z,Z);let N=Math.max(o*.5,.5);for(let F=0;F<Z;F++)for(let y=0;y<z;y++){let H=F*z+y,Y=((F+h)*n+y+c)*4,ee=le[H]>=.5?Math.sqrt(Q[H])-.5:.5-Math.sqrt(fe[H]),ue=Math.abs(ee)<1?le[H]-.5:ee;i[Y]=Math.round(Wt(ue/N)*255),i[Y+1]=Math.round(le[H]*255),i[Y+2]=0}e.putImageData(v,0,0)}function je(){ke&&(ke(),ke=null);let e=/[?&]webgl=aus\b/.test(location.search)||f.classList.contains("grund-farbwechsel")?null:m.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let n=!!e.getExtension("EXT_color_buffer_float")||D&&!!e.getExtension("EXT_color_buffer_half_float"),r=!1,o=0,v=0,i=0,c=!0,h=!1,p=0,E=0,se=!1,z=0,Z=0,Q=-1,fe="",le=-1;q&&(h=!0,w.lite=!0,f.setAttribute("data-glas-lite","true"));let N={x:.5,y:.56},F=-1,y=window.matchMedia("(prefers-reduced-motion: reduce)"),H=(a,t)=>{let l=e.createShader(a);if(!l)throw new Error("could not create shader");if(e.shaderSource(l,t),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(l));return l},Y=a=>{let t=e.createProgram();if(!t)throw new Error("could not create program");let l=H(e.VERTEX_SHADER,Tt),s=H(e.FRAGMENT_SHADER,a);if(e.attachShader(t,l),e.attachShader(t,s),e.bindAttribLocation(t,0,"a_position"),e.linkProgram(t),e.deleteShader(l),e.deleteShader(s),!e.getProgramParameter(t,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(t));let u={},x=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let g=0;g<x;g++){let _=e.getActiveUniform(t,g);_&&(u[_.name.replace(/^u_/,"")]=e.getUniformLocation(t,_.name))}return{prog:t,u}},ee={tex:[],fbo:[]},ue=(a,t,l)=>{let s=e.createTexture(),u=e.createFramebuffer();if(!s||!u)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),l&&n?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,a,t,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,a,t,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,s,0),ee.tex.push(s),ee.fbo.push(u),{tex:s,fbo:u,w:a,h:t}},Ht=()=>{for(let a of ee.tex)e.deleteTexture(a);for(let a of ee.fbo)e.deleteFramebuffer(a);ee.tex=[],ee.fbo=[]},X=null,M=null,k=null,L=null,te=null,ne=4,Re=Me&&D,Ke=null,pt=null,De=!1,me=null,Ve=!1,Yt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D u_bild;
uniform vec2 u_skala;
void main() { vec2 uv = (vUv - 0.5) * u_skala + 0.5; o = vec4(texture(u_bild, uv).rgb, 1.0); }
`;if(we==="b"){let a=new Image;a.decoding="async",a.onload=()=>{if(r)return;let t=e.createTexture();e.bindTexture(e.TEXTURE_2D,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),me={tex:t,w:a.naturalWidth,h:a.naturalHeight},ee.tex.push(t),pe(),j()},a.src="bilder/glas/hinten-"+(window.innerWidth>=window.innerHeight?"quer":"hoch")+".webp?v=1"}let $=(a,t,l)=>{e.useProgram(a.prog);let s=0;for(let u in l){let x=a.u[u];if(!x)continue;let g=l[u];typeof g=="number"?e.uniform1f(x,g):Array.isArray(g)?g.length===2?e.uniform2f(x,g[0],g[1]):e.uniform3f(x,g[0],g[1],g[2]):(e.activeTexture(e.TEXTURE0+s),e.bindTexture(e.TEXTURE_2D,g),e.uniform1i(x,s++))}e.bindFramebuffer(e.FRAMEBUFFER,t?t.fbo:null),e.viewport(0,0,t?t.w:m.width,t?t.h:m.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Pe="",jt=()=>{Ue();let a=B,t=m.getBoundingClientRect(),l=h?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),s=Re?Math.min(window.devicePixelRatio||1,h?2:st):l,u=getComputedStyle(a),x=parseFloat(u.fontSize)||64,g=O&&!C?he:window.scrollY||0,_=[],de=document.createTreeWalker(a,NodeFilter.SHOW_TEXT),re=T=>!!(T.parentElement&&T.parentElement.closest&&T.parentElement.closest(".glas-versteckt"));for(let T=de.nextNode();T;T=de.nextNode())for(let P=0;P<(re(T)?0:T.data.length);P++){if(/\s/.test(T.data[P]))continue;let et=document.createRange();et.setStart(T,P),et.setEnd(T,P+1);let tt=et.getBoundingClientRect();_.push([T.data[P],tt.left-t.left,tt.top+g,tt.height])}let R=0,ae=t.height;if(Re&&_.length){let T=Math.ceil(Xe(x,1)*8+t.height*.015+16);R=Math.max(0,Math.floor(Math.min(..._.map(P=>P[2]))-T)),ae=Math.min(t.height,Math.ceil(Math.max(..._.map(P=>P[2]+(P[3]||x)))+T)),ae-R<8&&(R=0,ae=t.height)}let A=Math.max(1,Math.round(t.width*s)),W=Math.max(1,Math.round((ae-R)*s)),I=[A,W,s,R,u.font].concat(_.map(T=>T[0]+"@"+T[1].toFixed(1)+","+T[2].toFixed(1))).join("|");if(I===Pe)return;Pe=I;let ie=document.createElement("canvas");ie.width=A,ie.height=W;let G=ie.getContext("2d");if(G){if(G.fillStyle="#000",G.fillRect(0,0,A,W),G.font=u.fontStyle+" "+u.fontWeight+" "+(x*s).toFixed(2)+"px "+u.fontFamily,"letterSpacing"in G&&(G.letterSpacing="0px"),G.fillStyle="#fff",G.textBaseline="alphabetic",_.forEach(T=>{let P=G.measureText(T[0]).fontBoundingBoxAscent||x*s*.8;G.fillText(T[0],T[1]*s,(T[2]-R)*s+P)}),qt(G,A,W,Xe(x,s)),Re){let T=t.height,P=ae-R;Ke=[T/P,1-(T-R)/P],pt=[1/A,1/Math.max(1,Math.round(T*s))]}return{cnv:ie,w:A,h:W,fontPx:x,scale:s}}},Kt=(a,t,l,s,u)=>{if(w.masken=(w.masken||0)+1,te||(te=e.createTexture()),e.bindTexture(e.TEXTURE_2D,te),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!k||k.w!==t||k.h!==l){for(let g of[k,L])g&&(e.deleteTexture(g.tex),e.deleteFramebuffer(g.fbo));k=ue(t,l,!0),L=ue(t,l,!0)}ne=Xe(s,u);let x=Math.max(1.5*u,ne*.25);$(X.blur,k,{src:te,step:[1/t,0],radius:x,read:1,write:0}),$(X.blur,L,{src:k.tex,step:[0,1/l],radius:x,read:1,write:0}),$(X.blur,k,{src:L.tex,step:[1/t,0],radius:ne*3,read:1,write:1}),$(X.blur,L,{src:k.tex,step:[0,1/l],radius:ne*3,read:2,write:1})},Ce=()=>{let a=B;if(!a||!M)return;if(C&&b.ziel===0){b.offen=!0;return}if(D){let A=jt();A&&Kt(A.cnv,A.w,A.h,A.fontPx,A.scale);return}let t=d.getBoundingClientRect(),l=h?1:Math.min(window.devicePixelRatio||1,1.5),s=Math.max(1,Math.round(t.width*l)),u=Math.max(1,Math.round(t.height*l)),x=Array.from(a.querySelectorAll(".ghr-word")),g=x.map(A=>A.getBoundingClientRect()),_=getComputedStyle(a),de=[s,u,l,_.font,_.letterSpacing].concat(x.map((A,W)=>(A.textContent||"")+"@"+Math.round(g[W].left-t.left)+","+Math.round(g[W].top-t.top))).join("|");if(de===Pe)return;Pe=de;let re=document.createElement("canvas");re.width=s,re.height=u;let R=re.getContext("2d");if(!R)return;R.fillStyle="#000",R.fillRect(0,0,s,u);let ae=parseFloat(_.fontSize)||64;if(R.setTransform(l,0,0,l,0,0),R.font=_.fontStyle+" "+_.fontWeight+" "+_.fontSize+" "+_.fontFamily,"letterSpacing"in R&&(R.letterSpacing=_.letterSpacing==="normal"?"0px":_.letterSpacing),R.fillStyle="#fff",R.textBaseline="alphabetic",x.forEach((A,W)=>{let I=A.textContent||"",ie=R.measureText(I).fontBoundingBoxAscent||ae*.8;R.fillText(I,g[W].left-t.left,g[W].top-t.top+ie)}),te||(te=e.createTexture()),e.bindTexture(e.TEXTURE_2D,te),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,re),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!k||k.w!==s||k.h!==u){for(let A of[k,L])A&&(e.deleteTexture(A.tex),e.deleteFramebuffer(A.fbo));k=ue(s,u,!0),L=ue(s,u,!0)}ne=Xe(ae,l),!(!k||!L)&&($(X.blur,k,{src:te,step:[1/s,0],radius:ne,read:0,write:0}),$(X.blur,L,{src:k.tex,step:[0,1/u],radius:ne,read:1,write:0}),$(X.blur,k,{src:L.tex,step:[1/s,0],radius:ne*3,read:1,write:1}),$(X.blur,L,{src:k.tex,step:[0,1/u],radius:ne*3,read:2,write:1}))},pe=()=>{let a=D&&Ie?.35:O&&Oe&&!h?Math.min(window.devicePixelRatio||1,1.5):h?D?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),t=!Re||De?a:Math.max(a,Math.min(window.devicePixelRatio||1,h?1.5:st)),l=Math.max(1,Math.round(m.clientWidth*t)),s=Math.max(1,Math.round(m.clientHeight*t));(m.width!==l||m.height!==s)&&(m.width=l,m.height=s);let u=we==="b"&&me?1:q?.4*Math.min(window.devicePixelRatio||1,1.5)/a:h?.25:.4,x=t===a?u:u*a/t;Ve=!1,fe="",Q=-1,le=-1;let g=Math.max(1,Math.round(l*x)),_=Math.max(1,Math.round(s*x));(!M||M.w!==g||M.h!==_)&&(M&&(e.deleteTexture(M.tex),e.deleteFramebuffer(M.fbo)),M=ue(g,_,!1)),Ce()},Vt=()=>{if(!M||!L)return;let a=Nt.palette,t=m.width/m.height;if(ge!==void 0)e.bindFramebuffer(e.FRAMEBUFFER,M.fbo),e.viewport(0,0,M.w,M.h),e.clearColor(ge,ge,ge,1),e.clear(e.COLOR_BUFFER_BIT);else if(we==="b"&&me&&X.bild){if(!Ve){let u=me.w/me.h;$(X.bild,M,{bild:me.tex,skala:t>u?[1,u/t]:[t/u,1]}),Ve=!0}}else q&&le===i||(le=q?i:-1,$(X.field,M,{time:i,aspect:t,octaves:q?4:h?3:O&&Oe?4:5,c0:a[0],c1:a[1],c2:a[2],c3:a[3],c4:a[4]}));let l=Math.max(1,m.clientHeight),s=C?$t(performance.now()):1;$(X.glass,null,{field:M.tex,height:L.tex,htexel:pt||[1/L.w,1/L.h],bevel:ne,aspect:t,light:[N.x,N.y],...Ke?{band:Ke}:{},glass:C?s:1,form:C?y.matches?1:s:O||y.matches||F<0?1:tn(performance.now()-F,1100),res:[m.width,m.height],shift:D?(O&&(!C||Ge)?Ee():window.scrollY||0)/l:0,nahtlos:be?1:0,maske:C?b.lage/l:0,ohne:C&&s<=0?1:0,detail:we==="a"?1:0}),w.bilder++},Je=()=>!q||!se&&(window.scrollY||0)<m.clientHeight&&!f.classList.contains("papier-an"),ve=()=>(D||c)&&!document.hidden&&!y.matches&&Je(),Ae=0,Ie=!1,b=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},Jt=a=>a<.5?4*a*a*a:1-Math.pow(-2*a+2,3)/2;function $t(a){let t=window.scrollY||0,l=d.offsetHeight||m.clientHeight||1;if(Ge){let g=Math.max(0,Math.min(1,(rt*l-t)/Math.max(1,(rt-Ct)*l)));if(g>0&&b.offen&&(b.offen=!1,b.neu++,Ce()),b.ziel=g>0?1:0,b.wert=g,b.lage=Ee(),oe){let _=g>=1?"":g.toFixed(3);oe.style.opacity!==_&&(oe.style.opacity=_,oe.style.pointerEvents=g<.05?"none":"")}return g}let s=b.ziel===1?t>Ut*l?0:1:t<Dt*l?1:0;s!==b.ziel&&(b.von=b.wert,b.t0=a,b.ziel=s,s===1&&b.offen&&(b.offen=!1,b.neu++,Ce()));let u=Math.min(1,(a-b.t0)/(y.matches?250:Pt)),x=y.matches?u:Jt(u);return b.wert=b.von+(b.ziel-b.von)*x,b.wert>0&&(b.lage=t),b.wert}let vt=a=>{if(o=0,$e=performance.now(),r)return;let t=(a-v)/1e3;v=a;let l=Math.min(t,.1);!h&&p<40&&ve()&&(p+=1,w.geprueft=p,p>3&&t>.05&&(E+=t>.15?3:1),E>=8&&(h=!0,w.lite=!0,w.liteBei={bild:p,ms:Math.round(performance.now()-F),blatt:f.classList.contains("papier-an")},f.setAttribute("data-glas-lite","true"),pe())),q&&!se&&z<120&&ve()&&(z+=1,w.geprueft=z,z>3&&t>.05&&(Z+=t>.15?3:1),Z>=8&&(se=!0,w.standbild=!0,f.setAttribute("data-glas-standbild","true")));let s=D?Math.min(Math.max((window.scrollY||0)/Math.max(1,m.clientHeight),0),1):0;if(Re){let I=window.scrollY||0,ie=Math.max(1,m.clientHeight),G=De?I>.66*ie:I>.74*ie;G!==De&&(De=G,w.wechsel=(w.wechsel||0)+1,pe())}ve()&&!f.classList.contains("glas-laden")&&(i+=l*(1-.7*s));let u=J,x=(a-u.at)/1e3>2.5,[g,_]=Je()?x&&ve()?nn(i):[u.x,u.y]:[N.x,N.y];if(N.x=kt(N.x,g,l,x?1.2:7),N.y=kt(N.y,_,l,x?1.2:7),ge!==void 0&&(N.x=.5,N.y=.7),D&&!be){let I=s>=1?!0:s<.97?!1:Ie;I!==Ie&&(Ie=I,pe())}let de=D&&!O&&s>=1&&ve()&&a-Ae<40||C&&s>=1&&a-Ae<30||f.classList.contains("papier-zu")&&a-Ae<250,re=!1,R="";if(q){let I=window.scrollY||0;R=I/Math.max(1,m.clientHeight)>=1.55&&b.wert<=0?"tief@"+i:"",re=Je()?a-Ae<14&&I===Q:I===Q||!!R&&R===fe}(q?!re:!de)&&(Vt(),Ae=a,q&&(Q=window.scrollY||0,fe=R));let ae=Math.abs(N.x-g)+Math.abs(N.y-_)>.0015,A=(D||c)&&!document.hidden,W=F>=0&&performance.now()-F<1100||C&&b.wert!==b.ziel;A&&(ve()||ae||W)&&(o=requestAnimationFrame(vt))},$e=0,j=()=>{r||(o&&performance.now()-$e>500&&(cancelAnimationFrame(o),o=0),!o&&(v=$e=performance.now(),o=requestAnimationFrame(vt)))};J.neustart=()=>{r||(cancelAnimationFrame(o),o=0,j())},J.kick=j,J.rebuild=()=>{r||(Ce(),Q=-1,j())};let Be=q?new MutationObserver(()=>{Q=-1,j()}):null;Be&&Be.observe(f,{attributes:!0,attributeFilter:["class"]});let xt=a=>{a.preventDefault(),cancelAnimationFrame(o),o=0},bt=()=>je();m.addEventListener("webglcontextlost",xt),m.addEventListener("webglcontextrestored",bt);try{X={field:Y(yt),blur:Y(D?ut:ze),glass:Y(D?U:at),bild:we==="b"?Y(Yt):null};let a=e.createVertexArray();e.bindVertexArray(a);let t=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),pe()}catch{return}d.setAttribute("data-glass","true"),w.glas=!0,w.grafik=()=>{let a=l=>Math.round(l/104857.6)/10,t=n?8:4;return{leinwand:m.width+"x"+m.height,feld:M?M.w+"x"+M.h:"",maske:L?L.w+"x"+L.h:"",mb:a(m.width*m.height*8+(M?M.w*M.h*4:0)+(L?L.w*L.h*(4+2*t):0))}},F=performance.now(),j();let Ze=0,Qe=new ResizeObserver(()=>{cancelAnimationFrame(Ze),Ze=requestAnimationFrame(()=>{r||(pe(),j())})});Qe.observe(d),D&&Qe.observe(m);let _t=()=>j();D&&window.addEventListener("scroll",_t,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>J.rebuild());let wt=new IntersectionObserver(([a])=>{c=a.isIntersecting,c&&j()});wt.observe(d);let Et=()=>!document.hidden&&j();document.addEventListener("visibilitychange",Et),y.addEventListener("change",j),ke=()=>{r=!0,cancelAnimationFrame(o),cancelAnimationFrame(Ze),Qe.disconnect(),wt.disconnect(),Be&&Be.disconnect(),window.removeEventListener("scroll",_t),document.removeEventListener("visibilitychange",Et),y.removeEventListener("change",j),m.removeEventListener("webglcontextlost",xt),m.removeEventListener("webglcontextrestored",bt),Ht(),te&&e.deleteTexture(te);for(let a of Object.values(X||{}))e.deleteProgram(a.prog);d.setAttribute("data-glass","false"),w.glas=!1}}if(d.addEventListener("pointermove",e=>{let n=(K&&m.isConnected?m:d).getBoundingClientRect();J.x=(e.clientX-n.left)/n.width,J.y=1-(e.clientY-n.top)/n.height,J.at=performance.now(),J.kick()}),d.setAttribute("data-glass","false"),O){let e=!1,n=()=>{e||(e=!0,f.classList.add("glas-schrift-da"),Ue(),je(),w.glas||f.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(n):n(),setTimeout(n,2500);let r=0;window.addEventListener("scroll",()=>{r||(r=requestAnimationFrame(()=>{r=0,Ee()}))},{passive:!0});let o=()=>{Ee(),J.neustart&&J.neustart()};window.addEventListener("pageshow",o),document.addEventListener("visibilitychange",()=>{document.hidden||o()}),window.addEventListener("focus",o)}else je();let gt=performance.now(),mt=0;setInterval(()=>{let e=w.bilder;w.fps=Math.round((e-mt)*1e3/Math.max(1,performance.now()-gt)),mt=e,gt=performance.now()},1e3),window.__glas={zustand:()=>({glas:w.glas,lite:w.lite,fps:w.fps,bilder:w.bilder,geprueft:w.geprueft||0,leicht:q,standbild:!!w.standbild,angebote:ft,masken:w.masken||0,versatz:he,ruhe:O,titel:B.textContent,punkt:f.getAttribute("data-glas-punkt")||"glas",weg:C,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1,scharf:Me,grafik:w.grafik?w.grafik():null,liteBei:w.liteBei||null,wechsel:w.wechsel||0}),zumKontakt:He,zuAngeboten:qe}})();})();
