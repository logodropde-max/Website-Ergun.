(()=>{var rt=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,Be=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,ot=Be+`uniform float u_time;
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
}`,ye=Be+`uniform sampler2D u_src;
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
}`,ze=Be+`uniform sampler2D u_field;
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
}`;var Ut=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function st(u){let h=/^#?([0-9a-f]{6})$/i.exec(u.trim());if(!h)return null;let F=parseInt(h[1],16);return[(F>>16&255)/255,(F>>8&255)/255,(F&255)/255]}function Dt(u){return Ut.map((h,F)=>st((u&&u[F])!=null?u[F]:"")||st(h))}function Ne(u,h){return Math.max(2,u*.075*h)}function Pt(u,h){let F=Math.min(Math.max(u/h,0),1);return 1-Math.pow(1-F,3)}function lt(u){let h=(F,ge)=>"rgba("+F.map(ie=>Math.round(ie*255)).join(",")+","+ge+")";return"radial-gradient(60% 50% at 25% 30%,"+h(u[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+h(u[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+h(u[2],.27)+",transparent 70%),"+h(u[0],1)}function ct(u,h,F,ge){return h+(u-h)*Math.exp(-ge*F)}function Ct(u){return[.5+.32*Math.sin(u*.37),.56+.16*Math.sin(u*.53+1.1)]}(function(){let u=document.querySelector("[data-glas-root]");if(!u)return;let h=document.documentElement,F=new URLSearchParams(location.search),ie=Dt(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),E=u.querySelector("[data-glas-canvas]"),z=u.querySelector("[data-glas-titel]"),j=h.classList.contains("glas-fein"),se=j&&h.classList.contains("glas-nahtlos"),le=j&&h.classList.contains("blatt-glas"),ce=le?h.getAttribute("data-hinten")==="b"?"b":"a":"",X=j&&h.classList.contains("ruhe"),N=X&&h.classList.contains("schrift-weg"),ft=.14,ut=.08,dt=600,me=X&&!N?u.querySelector(".ghr-content"):null,ne=0,Xe=window.innerWidth,Ge=Math.min(window.devicePixelRatio||1,2),Oe=window.matchMedia("(max-width: 899px)").matches;function pe(){if(!me)return ne;let e=Math.round((window.scrollY||0)*Ge)/Ge;return(e!==ne||!me.style.transform)&&(ne=e,me.style.transform="translate3d(0,"+-e+"px,0)",me.style.visibility=e>u.offsetHeight+40?"hidden":""),ne}X&&(h.classList.add("glas-ruhe"),pe());let W=(e,t)=>(t||document).querySelector(e),ve=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function Q(e,t,r){let o=document.createElement(e);return t&&(o.className=t),r!=null&&(o.textContent=r),o}u.style.height="100svh",u.style.background=lt(ie);let fe=null;if(j&&(fe=Q("div","glas-buehne"),fe.setAttribute("aria-hidden","true"),fe.style.background=lt(ie),fe.appendChild(E),document.body.insertBefore(fe,document.body.firstChild),u.style.background="transparent",le?z.innerHTML='<span class="glas-versteckt">ERGUN. \u2013 </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>':F.get("punkt")!=="orange"&&(z.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),F.get("punkt")==="orange"&&(z.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',h.setAttribute("data-glas-punkt","orange")),se&&F.get("text")!=="b"){let e=u.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(F.get("text")==="b"){let e=u.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=W(e);t&&t.remove()});let ue=W("main#inhalt"),xe=window.PREISE,Fe=Q("footer","glas-fuss");Fe.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(le?'<span class="glas-fuss__satz">Webdesign und Automatisierung \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',ue&&ue.parentNode.insertBefore(Fe,ue.nextSibling),xe&&xe.klein&&(W("[data-glas-klein]",Fe).textContent=xe.klein+" "+(xe.steuer||""));function ht(){let e=W("[data-glas-kopf]");return e?e.offsetHeight:0}function gt(e){let t=0;for(let r=e;r;r=r.offsetParent)t+=r.offsetTop;return t}let We=window.matchMedia("(prefers-reduced-motion: reduce)");function qe(e){e&&window.scrollTo({top:Math.max(0,gt(e)-ht()-20),behavior:We.matches?"auto":"smooth"})}function Ae(){qe(W("#angebote"))}function Le(){let e=W("#preise .mf__oben");qe(e&&!e.hidden?e:W("#preise .mf__raster"))}window.__kristall={zumKontakt:Le,zuAngeboten:Ae},document.addEventListener("click",e=>{if(j&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:We.matches?"auto":"smooth"});return}let r=e.target.closest&&e.target.closest("[data-glas-ziel]");r&&(e.preventDefault(),r.getAttribute("data-glas-ziel")==="kontakt"?Le():Ae())});let He=!1;function mt(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),ve(".k-angebot",e).forEach(r=>{let o=W(".k-angebot__wort",r),p=W(".k-angebot__info",r),i=p&&p.querySelector("b")?p.querySelector("b").textContent.trim():"",c=p?p.textContent.replace(i,"").replace(/^\s*·\s*/,"").trim():"",d=i.split(" + ");r.classList.add("glas-karte"),r.innerHTML="",r.appendChild(Q("span","k-angebot__wort glas-karte__titel",o?o.textContent:"")),r.appendChild(Q("span","glas-karte__satz",c));let v=Q("span","glas-karte__preis");v.appendChild(Q("b","",d[0])),d[1]&&v.appendChild(Q("small","","+ "+d.slice(1).join(" + "))),r.appendChild(v)}),He=!0,!0}if((function e(t){!mt()&&t<60&&setTimeout(()=>e(t+1),50)})(0),ue){ue.classList.add("glas-haupt");let e=W("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=W("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(r=>{r.isIntersecting&&(r.target.classList.add("ist-da"),e.unobserve(r.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>ve(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else h.classList.add("glas-alles-da");let pt={palette:ie,title:z.textContent},q={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},k={glas:!1,lite:!1,fps:0,bilder:0},be=null,Ye=ye.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),D=ze.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);se&&(D=D.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let ae={schwarz:0,weiss:.8}[F.get("glasfeld")];ae!==void 0&&(D=D.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let Me=F.get("glasdbg");if(j&&Me&&(D=D.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(Me==="g"?"dh.g":Me==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),j&&N){let e=se?`  float yDoc = (1.0 - uv.y) + u_shift;
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
`)}if(le){let e=`uniform float u_detail;
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
`)}let vt=Ye===ye||D.indexOf("u_shift")<0||j&&N&&D.indexOf("u_ohne > 0.5")<0,U=j&&!vt,xt=.06;function bt(){let e=ve(".glas-z",z);if(e.length<2)return;e.forEach(i=>{i.style.marginLeft=""});let t=getComputedStyle(z),r=parseFloat(t.fontSize)||64,o=document.createElement("canvas").getContext("2d");if(!o)return;o.font=t.fontStyle+" "+t.fontWeight+" "+r+"px "+t.fontFamily,"letterSpacing"in o&&(o.letterSpacing="0px");let p=e.map(i=>{let c=i.getBoundingClientRect(),d=o.measureText(i.textContent);return[c.left-d.actualBoundingBoxLeft,c.left+d.actualBoundingBoxRight]});for(let i=1;i<e.length;i++)e[i].style.marginLeft=((xt*r-(p[i][0]-p[i-1][1]))/r).toFixed(4)+"em"}function _e(){if(!U)return;z.style.fontSize="",bt();let e=z.querySelector(".ghr-word");if(!e)return;let t=e.getBoundingClientRect().width;if(le){let i={};ve(".ghr-word",z).forEach(c=>{let d=c.getBoundingClientRect(),v=Math.round(d.top/4);i[v]=i[v]?[Math.min(i[v][0],d.left),Math.max(i[v][1],d.right)]:[d.left,d.right]}),t=Math.max(...Object.values(i).map(c=>c[1]-c[0]))}let r=parseFloat(getComputedStyle(z).fontSize)||64,o=r*.16,p=u.clientWidth*(1-2*.06);t+o>p&&(z.style.fontSize=(r*p/(t+o)).toFixed(2)+"px")}U&&(_e(),window.addEventListener("resize",()=>{X&&window.innerWidth===Xe||(Xe=window.innerWidth,_e())}));function je(e,t,r,o,p){let i=0;o[0]=0,p[0]=-1e20,p[1]=1e20;for(let c=1;c<t;c++){let d=(e[c]+c*c-(e[o[i]]+o[i]*o[i]))/(2*c-2*o[i]);for(;d<=p[i];)i--,d=(e[c]+c*c-(e[o[i]]+o[i]*o[i]))/(2*c-2*o[i]);i++,o[i]=c,p[i]=d,p[i+1]=1e20}i=0;for(let c=0;c<t;c++){for(;p[i+1]<c;)i++;r[c]=(c-o[i])*(c-o[i])+e[o[i]]}}function Ke(e,t,r){let o=Math.max(t,r),p=new Float64Array(o),i=new Float64Array(o),c=new Int32Array(o),d=new Float64Array(o+1);for(let v=0;v<t;v++){for(let b=0;b<r;b++)p[b]=e[b*t+v];je(p,r,i,c,d);for(let b=0;b<r;b++)e[b*t+v]=i[b]}for(let v=0;v<r;v++){for(let b=0;b<t;b++)p[b]=e[v*t+b];je(p,t,i,c,d);for(let b=0;b<t;b++)e[v*t+b]=i[b]}return e}function _t(e){let t=Math.abs(e)/Math.SQRT2,r=1/(1+.3275911*t),o=1-((((1.061405429*r-1.453152027)*r+1.421413741)*r-.284496736)*r+.254829592)*r*Math.exp(-t*t);return e>=0?.5*(1+o):.5*(1-o)}function Et(e,t,r,o){let p=e.getImageData(0,0,t,r),i=p.data,c=t,d=r,v=-1,b=-1;for(let A=0;A<r;A++)for(let g=0;g<t;g++)i[(A*t+g)*4]>0&&(g<c&&(c=g),g>v&&(v=g),A<d&&(d=A),A>b&&(b=A));if(v<0)return;let P=Math.ceil(o*2.5)+2;c=Math.max(0,c-P),d=Math.max(0,d-P),v=Math.min(t-1,v+P),b=Math.min(r-1,b+P);let C=v-c+1,I=b-d+1,re=new Float64Array(C*I),J=new Float64Array(C*I),G=new Float32Array(C*I);for(let A=0;A<I;A++)for(let g=0;g<C;g++){let w=A*C+g,_=i[((A+d)*t+g+c)*4]/255;G[w]=_,re[w]=_<.5?0:1e20,J[w]=_>=.5?0:1e20}Ke(re,C,I),Ke(J,C,I);let Z=Math.max(o*.5,.5);for(let A=0;A<I;A++)for(let g=0;g<C;g++){let w=A*C+g,_=((A+d)*t+g+c)*4,L=G[w]>=.5?Math.sqrt(re[w])-.5:.5-Math.sqrt(J[w]),O=Math.abs(L)<1?G[w]-.5:L;i[_]=Math.round(_t(O/Z)*255),i[_+1]=Math.round(G[w]*255),i[_+2]=0}e.putImageData(p,0,0)}function Se(){be&&(be(),be=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:E.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||U&&!!e.getExtension("EXT_color_buffer_half_float"),r=!1,o=0,p=0,i=0,c=!0,d=!1,v=0,b=0,P={x:.5,y:.56},C=-1,I=window.matchMedia("(prefers-reduced-motion: reduce)"),re=(n,a)=>{let s=e.createShader(n);if(!s)throw new Error("could not create shader");if(e.shaderSource(s,a),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(s));return s},J=n=>{let a=e.createProgram();if(!a)throw new Error("could not create program");let s=re(e.VERTEX_SHADER,rt),l=re(e.FRAGMENT_SHADER,n);if(e.attachShader(a,s),e.attachShader(a,l),e.bindAttribLocation(a,0,"a_position"),e.linkProgram(a),e.deleteShader(s),e.deleteShader(l),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(a));let f={},x=e.getProgramParameter(a,e.ACTIVE_UNIFORMS);for(let m=0;m<x;m++){let M=e.getActiveUniform(a,m);M&&(f[M.name.replace(/^u_/,"")]=e.getUniformLocation(a,M.name))}return{prog:a,u:f}},G={tex:[],fbo:[]},Z=(n,a,s)=>{let l=e.createTexture(),f=e.createFramebuffer();if(!l||!f)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),s&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,n,a,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,n,a,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,f),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),G.tex.push(l),G.fbo.push(f),{tex:l,fbo:f,w:n,h:a}},A=()=>{for(let n of G.tex)e.deleteTexture(n);for(let n of G.fbo)e.deleteFramebuffer(n);G.tex=[],G.fbo=[]},g=null,w=null,_=null,L=null,O=null,K=4,oe=null,ke=!1,wt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D u_bild;
uniform vec2 u_skala;
void main() { vec2 uv = (vUv - 0.5) * u_skala + 0.5; o = vec4(texture(u_bild, uv).rgb, 1.0); }
`;if(ce==="b"){let n=new Image;n.decoding="async",n.onload=()=>{if(r)return;let a=e.createTexture();e.bindTexture(e.TEXTURE_2D,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),oe={tex:a,w:n.naturalWidth,h:n.naturalHeight},G.tex.push(a),de(),Y()},n.src="bilder/glas/hinten-"+(window.innerWidth>=window.innerHeight?"quer":"hoch")+".webp?v=1"}let H=(n,a,s)=>{e.useProgram(n.prog);let l=0;for(let f in s){let x=n.u[f];if(!x)continue;let m=s[f];typeof m=="number"?e.uniform1f(x,m):Array.isArray(m)?m.length===2?e.uniform2f(x,m[0],m[1]):e.uniform3f(x,m[0],m[1],m[2]):(e.activeTexture(e.TEXTURE0+l),e.bindTexture(e.TEXTURE_2D,m),e.uniform1i(x,l++))}e.bindFramebuffer(e.FRAMEBUFFER,a?a.fbo:null),e.viewport(0,0,a?a.w:E.width,a?a.h:E.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Ee="",Tt=()=>{_e();let n=z,a=E.getBoundingClientRect(),s=d?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),l=Math.max(1,Math.round(a.width*s)),f=Math.max(1,Math.round(a.height*s)),x=getComputedStyle(n),m=parseFloat(x.fontSize)||64,M=X&&!N?ne:window.scrollY||0,ee=[],$=document.createTreeWalker(n,NodeFilter.SHOW_TEXT),B=y=>!!(y.parentElement&&y.parentElement.closest&&y.parentElement.closest(".glas-versteckt"));for(let y=$.nextNode();y;y=$.nextNode())for(let V=0;V<(B(y)?0:y.data.length);V++){if(/\s/.test(y.data[V]))continue;let Ie=document.createRange();Ie.setStart(y,V),Ie.setEnd(y,V+1);let at=Ie.getBoundingClientRect();ee.push([y.data[V],at.left-a.left,at.top+M])}let te=[l,f,s,x.font].concat(ee.map(y=>y[0]+"@"+y[1].toFixed(1)+","+y[2].toFixed(1))).join("|");if(te===Ee)return;Ee=te;let T=document.createElement("canvas");T.width=l,T.height=f;let S=T.getContext("2d");if(S)return S.fillStyle="#000",S.fillRect(0,0,l,f),S.font=x.fontStyle+" "+x.fontWeight+" "+(m*s).toFixed(2)+"px "+x.fontFamily,"letterSpacing"in S&&(S.letterSpacing="0px"),S.fillStyle="#fff",S.textBaseline="alphabetic",ee.forEach(y=>{let V=S.measureText(y[0]).fontBoundingBoxAscent||m*s*.8;S.fillText(y[0],y[1]*s,y[2]*s+V)}),Et(S,l,f,Ne(m,s)),{cnv:T,w:l,h:f,fontPx:m,scale:s}},yt=(n,a,s,l,f)=>{if(k.masken=(k.masken||0)+1,O||(O=e.createTexture()),e.bindTexture(e.TEXTURE_2D,O),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!_||_.w!==a||_.h!==s){for(let m of[_,L])m&&(e.deleteTexture(m.tex),e.deleteFramebuffer(m.fbo));_=Z(a,s,!0),L=Z(a,s,!0)}K=Ne(l,f);let x=Math.max(1.5*f,K*.25);H(g.blur,_,{src:O,step:[1/a,0],radius:x,read:1,write:0}),H(g.blur,L,{src:_.tex,step:[0,1/s],radius:x,read:1,write:0}),H(g.blur,_,{src:L.tex,step:[1/a,0],radius:K*3,read:1,write:1}),H(g.blur,L,{src:_.tex,step:[0,1/s],radius:K*3,read:2,write:1})},Ue=()=>{let n=z;if(!n||!w)return;if(N&&R.ziel===0){R.offen=!0;return}if(U){let T=Tt();T&&yt(T.cnv,T.w,T.h,T.fontPx,T.scale);return}let a=u.getBoundingClientRect(),s=d?1:Math.min(window.devicePixelRatio||1,1.5),l=Math.max(1,Math.round(a.width*s)),f=Math.max(1,Math.round(a.height*s)),x=Array.from(n.querySelectorAll(".ghr-word")),m=x.map(T=>T.getBoundingClientRect()),M=getComputedStyle(n),ee=[l,f,s,M.font,M.letterSpacing].concat(x.map((T,S)=>(T.textContent||"")+"@"+Math.round(m[S].left-a.left)+","+Math.round(m[S].top-a.top))).join("|");if(ee===Ee)return;Ee=ee;let $=document.createElement("canvas");$.width=l,$.height=f;let B=$.getContext("2d");if(!B)return;B.fillStyle="#000",B.fillRect(0,0,l,f);let te=parseFloat(M.fontSize)||64;if(B.setTransform(s,0,0,s,0,0),B.font=M.fontStyle+" "+M.fontWeight+" "+M.fontSize+" "+M.fontFamily,"letterSpacing"in B&&(B.letterSpacing=M.letterSpacing==="normal"?"0px":M.letterSpacing),B.fillStyle="#fff",B.textBaseline="alphabetic",x.forEach((T,S)=>{let y=T.textContent||"",V=B.measureText(y).fontBoundingBoxAscent||te*.8;B.fillText(y,m[S].left-a.left,m[S].top-a.top+V)}),O||(O=e.createTexture()),e.bindTexture(e.TEXTURE_2D,O),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,$),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!_||_.w!==l||_.h!==f){for(let T of[_,L])T&&(e.deleteTexture(T.tex),e.deleteFramebuffer(T.fbo));_=Z(l,f,!0),L=Z(l,f,!0)}K=Ne(te,s),!(!_||!L)&&(H(g.blur,_,{src:O,step:[1/l,0],radius:K,read:0,write:0}),H(g.blur,L,{src:_.tex,step:[0,1/f],radius:K,read:1,write:0}),H(g.blur,_,{src:L.tex,step:[1/l,0],radius:K*3,read:1,write:1}),H(g.blur,L,{src:_.tex,step:[0,1/f],radius:K*3,read:2,write:1}))},de=()=>{let n=U&&Te?.35:X&&Oe&&!d?Math.min(window.devicePixelRatio||1,1.5):d?U?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),a=Math.max(1,Math.round(E.clientWidth*n)),s=Math.max(1,Math.round(E.clientHeight*n));(E.width!==a||E.height!==s)&&(E.width=a,E.height=s);let l=ce==="b"&&oe?1:d?.25:.4;ke=!1;let f=Math.max(1,Math.round(a*l)),x=Math.max(1,Math.round(s*l));(!w||w.w!==f||w.h!==x)&&(w&&(e.deleteTexture(w.tex),e.deleteFramebuffer(w.fbo)),w=Z(f,x,!1)),Ue()},Rt=()=>{if(!w||!L)return;let n=pt.palette,a=E.width/E.height;if(ae!==void 0)e.bindFramebuffer(e.FRAMEBUFFER,w.fbo),e.viewport(0,0,w.w,w.h),e.clearColor(ae,ae,ae,1),e.clear(e.COLOR_BUFFER_BIT);else if(ce==="b"&&oe&&g.bild){if(!ke){let f=oe.w/oe.h;H(g.bild,w,{bild:oe.tex,skala:a>f?[1,f/a]:[a/f,1]}),ke=!0}}else H(g.field,w,{time:i,aspect:a,octaves:d?3:X&&Oe?4:5,c0:n[0],c1:n[1],c2:n[2],c3:n[3],c4:n[4]});let s=Math.max(1,E.clientHeight),l=N?At(performance.now()):1;H(g.glass,null,{field:w.tex,height:L.tex,htexel:[1/L.w,1/L.h],bevel:K,aspect:a,light:[P.x,P.y],glass:N?l:1,form:N?I.matches?1:l:X||I.matches||C<0?1:Pt(performance.now()-C,1100),res:[E.width,E.height],shift:U?(X&&!N?pe():window.scrollY||0)/s:0,nahtlos:se?1:0,maske:N?R.lage/s:0,ohne:N&&l<=0?1:0,detail:ce==="a"?1:0}),k.bilder++},he=()=>(U||c)&&!document.hidden&&!I.matches,we=0,Te=!1,R=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},Ft=n=>n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2;function At(n){let a=window.scrollY||0,s=u.offsetHeight||E.clientHeight||1,l=R.ziel===1?a>ft*s?0:1:a<ut*s?1:0;l!==R.ziel&&(R.von=R.wert,R.t0=n,R.ziel=l,l===1&&R.offen&&(R.offen=!1,R.neu++,Ue()));let f=Math.min(1,(n-R.t0)/(I.matches?250:dt)),x=I.matches?f:Ft(f);return R.wert=R.von+(R.ziel-R.von)*x,R.wert>0&&(R.lage=a),R.wert}let Je=n=>{if(o=0,De=performance.now(),r)return;let a=(n-p)/1e3;p=n;let s=Math.min(a,.1);!d&&v<40&&he()&&(v+=1,k.geprueft=v,v>3&&a>.05&&(b+=a>.15?3:1),b>=8&&(d=!0,k.lite=!0,h.setAttribute("data-glas-lite","true"),de()));let l=U?Math.min(Math.max((window.scrollY||0)/Math.max(1,E.clientHeight),0),1):0;he()&&!h.classList.contains("glas-laden")&&(i+=s*(1-.7*l));let f=q,x=(n-f.at)/1e3>2.5,[m,M]=x&&he()?Ct(i):[f.x,f.y];if(P.x=ct(P.x,m,s,x?1.2:7),P.y=ct(P.y,M,s,x?1.2:7),ae!==void 0&&(P.x=.5,P.y=.7),U&&!se){let T=l>=1?!0:l<.97?!1:Te;T!==Te&&(Te=T,de())}U&&!X&&l>=1&&he()&&n-we<40||N&&l>=1&&n-we<30||h.classList.contains("papier-zu")&&n-we<250||(Rt(),we=n);let $=Math.abs(P.x-m)+Math.abs(P.y-M)>.0015,B=(U||c)&&!document.hidden,te=C>=0&&performance.now()-C<1100||N&&R.wert!==R.ziel;B&&(he()||$||te)&&(o=requestAnimationFrame(Je))},De=0,Y=()=>{r||(o&&performance.now()-De>500&&(cancelAnimationFrame(o),o=0),!o&&(p=De=performance.now(),o=requestAnimationFrame(Je)))};q.neustart=()=>{r||(cancelAnimationFrame(o),o=0,Y())},q.kick=Y,q.rebuild=()=>{r||(Ue(),Y())};let Qe=n=>{n.preventDefault(),cancelAnimationFrame(o),o=0},Ze=()=>Se();E.addEventListener("webglcontextlost",Qe),E.addEventListener("webglcontextrestored",Ze);try{g={field:J(ot),blur:J(U?Ye:ye),glass:J(U?D:ze),bild:ce==="b"?J(wt):null};let n=e.createVertexArray();e.bindVertexArray(n);let a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),de()}catch{return}u.setAttribute("data-glass","true"),k.glas=!0,C=performance.now(),Y();let Pe=0,Ce=new ResizeObserver(()=>{cancelAnimationFrame(Pe),Pe=requestAnimationFrame(()=>{r||(de(),Y())})});Ce.observe(u),U&&Ce.observe(E);let et=()=>Y();U&&window.addEventListener("scroll",et,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>q.rebuild());let tt=new IntersectionObserver(([n])=>{c=n.isIntersecting,c&&Y()});tt.observe(u);let nt=()=>!document.hidden&&Y();document.addEventListener("visibilitychange",nt),I.addEventListener("change",Y),be=()=>{r=!0,cancelAnimationFrame(o),cancelAnimationFrame(Pe),Ce.disconnect(),tt.disconnect(),window.removeEventListener("scroll",et),document.removeEventListener("visibilitychange",nt),I.removeEventListener("change",Y),E.removeEventListener("webglcontextlost",Qe),E.removeEventListener("webglcontextrestored",Ze),A(),O&&e.deleteTexture(O);for(let n of Object.values(g||{}))e.deleteProgram(n.prog);u.setAttribute("data-glass","false"),k.glas=!1}}if(u.addEventListener("pointermove",e=>{let t=(j&&E.isConnected?E:u).getBoundingClientRect();q.x=(e.clientX-t.left)/t.width,q.y=1-(e.clientY-t.top)/t.height,q.at=performance.now(),q.kick()}),u.setAttribute("data-glass","false"),X){let e=!1,t=()=>{e||(e=!0,h.classList.add("glas-schrift-da"),_e(),Se(),k.glas||h.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500);let r=0;window.addEventListener("scroll",()=>{r||(r=requestAnimationFrame(()=>{r=0,pe()}))},{passive:!0});let o=()=>{pe(),q.neustart&&q.neustart()};window.addEventListener("pageshow",o),document.addEventListener("visibilitychange",()=>{document.hidden||o()}),window.addEventListener("focus",o)}else Se();let Ve=performance.now(),$e=0;setInterval(()=>{let e=k.bilder;k.fps=Math.round((e-$e)*1e3/Math.max(1,performance.now()-Ve)),$e=e,Ve=performance.now()},1e3),window.__glas={zustand:()=>({glas:k.glas,lite:k.lite,fps:k.fps,bilder:k.bilder,geprueft:k.geprueft||0,angebote:He,masken:k.masken||0,versatz:ne,ruhe:X,titel:z.textContent,punkt:h.getAttribute("data-glas-punkt")||"glas",weg:N,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1}),zumKontakt:Le,zuAngeboten:Ae}})();})();
