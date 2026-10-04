(()=>{var it=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,ze=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,st=ze+`uniform float u_time;
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
}`,Re=ze+`uniform sampler2D u_src;
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
}`,Ne=ze+`uniform sampler2D u_field;
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
}`;var Ct=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function ct(u){let g=/^#?([0-9a-f]{6})$/i.exec(u.trim());if(!g)return null;let A=parseInt(g[1],16);return[(A>>16&255)/255,(A>>8&255)/255,(A&255)/255]}function It(u){return Ct.map((g,A)=>ct((u&&u[A])!=null?u[A]:"")||ct(g))}function Xe(u,g){return Math.max(2,u*.075*g)}function Bt(u,g){let A=Math.min(Math.max(u/g,0),1);return 1-Math.pow(1-A,3)}function ft(u){let g=(A,pe)=>"rgba("+A.map(se=>Math.round(se*255)).join(",")+","+pe+")";return"radial-gradient(60% 50% at 25% 30%,"+g(u[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+g(u[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+g(u[2],.27)+",transparent 70%),"+g(u[0],1)}function ut(u,g,A,pe){return g+(u-g)*Math.exp(-pe*A)}function zt(u){return[.5+.32*Math.sin(u*.37),.56+.16*Math.sin(u*.53+1.1)]}(function(){let u=document.querySelector("[data-glas-root]");if(!u)return;let g=document.documentElement,A=new URLSearchParams(location.search),se=It(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),w=u.querySelector("[data-glas-canvas]"),N=u.querySelector("[data-glas-titel]"),j=g.classList.contains("glas-fein"),le=j&&g.classList.contains("glas-nahtlos"),ce=j&&g.classList.contains("blatt-glas"),fe=ce?g.getAttribute("data-hinten")==="b"?"b":"a":"",X=j&&g.classList.contains("ruhe"),D=X&&g.classList.contains("schrift-weg"),dt=.14,ht=.08,gt=600,Ae=D&&g.classList.contains("titel-takt"),mt=.5,Ge=.6,J=X&&(!D||Ae)?u.querySelector(".ghr-content"):null,ae=0,Oe=window.innerWidth,We=Math.min(window.devicePixelRatio||1,2),qe=window.matchMedia("(max-width: 899px)").matches;function ue(){if(!J)return ae;let e=Math.round((window.scrollY||0)*We)/We;return(e!==ae||!J.style.transform)&&(ae=e,J.style.transform="translate3d(0,"+-e+"px,0)",J.style.visibility=e>u.offsetHeight+40?"hidden":""),ae}X&&(g.classList.add("glas-ruhe"),ue());let W=(e,t)=>(t||document).querySelector(e),ve=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function Z(e,t,r){let o=document.createElement(e);return t&&(o.className=t),r!=null&&(o.textContent=r),o}u.style.height="100svh",u.style.background=ft(se);let de=null;if(j&&(de=Z("div","glas-buehne"),de.setAttribute("aria-hidden","true"),de.style.background=ft(se),de.appendChild(w),document.body.insertBefore(de,document.body.firstChild),u.style.background="transparent",ce?N.innerHTML='<span class="glas-versteckt">ERGUN. \u2013 </span><span class="ghr-word">Webdesign</span> <span class="ghr-word">und</span> <span class="ghr-word">Automatisierung</span>':A.get("punkt")!=="orange"&&(N.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),A.get("punkt")==="orange"&&(N.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',g.setAttribute("data-glas-punkt","orange")),le&&A.get("text")!=="b"){let e=u.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(A.get("text")==="b"){let e=u.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=W(e);t&&t.remove()});let he=W("main#inhalt"),xe=window.PREISE,Le=Z("footer","glas-fuss");Le.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span>'+(ce?'<span class="glas-fuss__satz">Webdesign und Automatisierung \xB7 \xA9 '+new Date().getFullYear()+"</span>":"")+'<nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',he&&he.parentNode.insertBefore(Le,he.nextSibling),xe&&xe.klein&&(W("[data-glas-klein]",Le).textContent=xe.klein+" "+(xe.steuer||""));function pt(){let e=W("[data-glas-kopf]");return e?e.offsetHeight:0}function vt(e){let t=0;for(let r=e;r;r=r.offsetParent)t+=r.offsetTop;return t}let He=window.matchMedia("(prefers-reduced-motion: reduce)");function Ye(e){e&&window.scrollTo({top:Math.max(0,vt(e)-pt()-20),behavior:He.matches?"auto":"smooth"})}function Me(){Ye(W("#angebote"))}function Se(){let e=W("#preise .mf__oben");Ye(e&&!e.hidden?e:W("#preise .mf__raster"))}window.__kristall={zumKontakt:Se,zuAngeboten:Me},document.addEventListener("click",e=>{if(j&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:He.matches?"auto":"smooth"});return}let r=e.target.closest&&e.target.closest("[data-glas-ziel]");r&&(e.preventDefault(),r.getAttribute("data-glas-ziel")==="kontakt"?Se():Me())});let je=!1;function xt(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),ve(".k-angebot",e).forEach(r=>{let o=W(".k-angebot__wort",r),p=W(".k-angebot__info",r),i=p&&p.querySelector("b")?p.querySelector("b").textContent.trim():"",c=p?p.textContent.replace(i,"").replace(/^\s*·\s*/,"").trim():"",h=i.split(" + ");r.classList.add("glas-karte"),r.innerHTML="",r.appendChild(Z("span","k-angebot__wort glas-karte__titel",o?o.textContent:"")),r.appendChild(Z("span","glas-karte__satz",c));let v=Z("span","glas-karte__preis");v.appendChild(Z("b","",h[0])),h[1]&&v.appendChild(Z("small","","+ "+h.slice(1).join(" + "))),r.appendChild(v)}),je=!0,!0}if((function e(t){!xt()&&t<60&&setTimeout(()=>e(t+1),50)})(0),he){he.classList.add("glas-haupt");let e=W("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=W("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(r=>{r.isIntersecting&&(r.target.classList.add("ist-da"),e.unobserve(r.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>ve(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else g.classList.add("glas-alles-da");let bt={palette:se,title:N.textContent},q={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},k={glas:!1,lite:!1,fps:0,bilder:0},be=null,Ke=Re.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),P=Ne.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);le&&(P=P.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let re={schwarz:0,weiss:.8}[A.get("glasfeld")];re!==void 0&&(P=P.replace(`  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`,""));let ke=A.get("glasdbg");if(j&&ke&&(P=P.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(ke==="g"?"dh.g":ke==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),j&&D){let e=le?`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"";P=P.split("texture(u_height, vec2(0.0, -u_shift) + ").join("texture(u_height, vec2(0.0, -u_maske) + ").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_maske;
uniform float u_ohne;`).replace(`  vec2 uv = vUv;
`,`  vec2 uv = vUv;
  if (u_ohne > 0.5) {
  vec3 col = texture(u_field, uv).rgb;
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`+e+`  o = vec4(col, 1.0);
  return;
  }
`)}if(ce){let e=`uniform float u_detail;
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
`;P=P.replace("uv + away * 0.012","uv + away * 0.0045").replace("bg *= 1.0 - 0.32 * smoothstep","bg *= 1.0 - 0.2 * smoothstep"),P=P.replace("void main() {",e+"void main() {").replace(`  vec3 bg = texture(u_field, uv).rgb;
`,`  vec3 bg = zeichnung(texture(u_field, uv).rgb, uv);
`).replace(`  vec3 col = texture(u_field, uv).rgb;
`,`  vec3 col = zeichnung(texture(u_field, uv).rgb, uv);
`)}let _t=Ke===Re||P.indexOf("u_shift")<0||j&&D&&P.indexOf("u_ohne > 0.5")<0,U=j&&!_t,Et=.06;function wt(){let e=ve(".glas-z",N);if(e.length<2)return;e.forEach(i=>{i.style.marginLeft=""});let t=getComputedStyle(N),r=parseFloat(t.fontSize)||64,o=document.createElement("canvas").getContext("2d");if(!o)return;o.font=t.fontStyle+" "+t.fontWeight+" "+r+"px "+t.fontFamily,"letterSpacing"in o&&(o.letterSpacing="0px");let p=e.map(i=>{let c=i.getBoundingClientRect(),h=o.measureText(i.textContent);return[c.left-h.actualBoundingBoxLeft,c.left+h.actualBoundingBoxRight]});for(let i=1;i<e.length;i++)e[i].style.marginLeft=((Et*r-(p[i][0]-p[i-1][1]))/r).toFixed(4)+"em"}function _e(){if(!U)return;N.style.fontSize="",wt();let e=N.querySelector(".ghr-word");if(!e)return;let t=e.getBoundingClientRect().width;if(ce){let i={};ve(".ghr-word",N).forEach(c=>{let h=c.getBoundingClientRect(),v=Math.round(h.top/4);i[v]=i[v]?[Math.min(i[v][0],h.left),Math.max(i[v][1],h.right)]:[h.left,h.right]}),t=Math.max(...Object.values(i).map(c=>c[1]-c[0]))}let r=parseFloat(getComputedStyle(N).fontSize)||64,o=r*.16,p=u.clientWidth*(1-2*.06);t+o>p&&(N.style.fontSize=(r*p/(t+o)).toFixed(2)+"px")}U&&(_e(),window.addEventListener("resize",()=>{X&&window.innerWidth===Oe||(Oe=window.innerWidth,_e())}));function Ve(e,t,r,o,p){let i=0;o[0]=0,p[0]=-1e20,p[1]=1e20;for(let c=1;c<t;c++){let h=(e[c]+c*c-(e[o[i]]+o[i]*o[i]))/(2*c-2*o[i]);for(;h<=p[i];)i--,h=(e[c]+c*c-(e[o[i]]+o[i]*o[i]))/(2*c-2*o[i]);i++,o[i]=c,p[i]=h,p[i+1]=1e20}i=0;for(let c=0;c<t;c++){for(;p[i+1]<c;)i++;r[c]=(c-o[i])*(c-o[i])+e[o[i]]}}function $e(e,t,r){let o=Math.max(t,r),p=new Float64Array(o),i=new Float64Array(o),c=new Int32Array(o),h=new Float64Array(o+1);for(let v=0;v<t;v++){for(let b=0;b<r;b++)p[b]=e[b*t+v];Ve(p,r,i,c,h);for(let b=0;b<r;b++)e[b*t+v]=i[b]}for(let v=0;v<r;v++){for(let b=0;b<t;b++)p[b]=e[v*t+b];Ve(p,t,i,c,h);for(let b=0;b<t;b++)e[v*t+b]=i[b]}return e}function Tt(e){let t=Math.abs(e)/Math.SQRT2,r=1/(1+.3275911*t),o=1-((((1.061405429*r-1.453152027)*r+1.421413741)*r-.284496736)*r+.254829592)*r*Math.exp(-t*t);return e>=0?.5*(1+o):.5*(1-o)}function yt(e,t,r,o){let p=e.getImageData(0,0,t,r),i=p.data,c=t,h=r,v=-1,b=-1;for(let L=0;L<r;L++)for(let m=0;m<t;m++)i[(L*t+m)*4]>0&&(m<c&&(c=m),m>v&&(v=m),L<h&&(h=L),L>b&&(b=L));if(v<0)return;let C=Math.ceil(o*2.5)+2;c=Math.max(0,c-C),h=Math.max(0,h-C),v=Math.min(t-1,v+C),b=Math.min(r-1,b+C);let I=v-c+1,B=b-h+1,oe=new Float64Array(I*B),Q=new Float64Array(I*B),G=new Float32Array(I*B);for(let L=0;L<B;L++)for(let m=0;m<I;m++){let T=L*I+m,E=i[((L+h)*t+m+c)*4]/255;G[T]=E,oe[T]=E<.5?0:1e20,Q[T]=E>=.5?0:1e20}$e(oe,I,B),$e(Q,I,B);let ee=Math.max(o*.5,.5);for(let L=0;L<B;L++)for(let m=0;m<I;m++){let T=L*I+m,E=((L+h)*t+m+c)*4,M=G[T]>=.5?Math.sqrt(oe[T])-.5:.5-Math.sqrt(Q[T]),O=Math.abs(M)<1?G[T]-.5:M;i[E]=Math.round(Tt(O/ee)*255),i[E+1]=Math.round(G[T]*255),i[E+2]=0}e.putImageData(p,0,0)}function Ue(){be&&(be(),be=null);let e=/[?&]webgl=aus\b/.test(location.search)||g.classList.contains("grund-farbwechsel")?null:w.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||U&&!!e.getExtension("EXT_color_buffer_half_float"),r=!1,o=0,p=0,i=0,c=!0,h=!1,v=0,b=0,C={x:.5,y:.56},I=-1,B=window.matchMedia("(prefers-reduced-motion: reduce)"),oe=(a,n)=>{let s=e.createShader(a);if(!s)throw new Error("could not create shader");if(e.shaderSource(s,n),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(s));return s},Q=a=>{let n=e.createProgram();if(!n)throw new Error("could not create program");let s=oe(e.VERTEX_SHADER,it),l=oe(e.FRAGMENT_SHADER,a);if(e.attachShader(n,s),e.attachShader(n,l),e.bindAttribLocation(n,0,"a_position"),e.linkProgram(n),e.deleteShader(s),e.deleteShader(l),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(n));let f={},x=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let d=0;d<x;d++){let F=e.getActiveUniform(n,d);F&&(f[F.name.replace(/^u_/,"")]=e.getUniformLocation(n,F.name))}return{prog:n,u:f}},G={tex:[],fbo:[]},ee=(a,n,s)=>{let l=e.createTexture(),f=e.createFramebuffer();if(!l||!f)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),s&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,a,n,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,a,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,f),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),G.tex.push(l),G.fbo.push(f),{tex:l,fbo:f,w:a,h:n}},L=()=>{for(let a of G.tex)e.deleteTexture(a);for(let a of G.fbo)e.deleteFramebuffer(a);G.tex=[],G.fbo=[]},m=null,T=null,E=null,M=null,O=null,K=4,ie=null,De=!1,Rt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D u_bild;
uniform vec2 u_skala;
void main() { vec2 uv = (vUv - 0.5) * u_skala + 0.5; o = vec4(texture(u_bild, uv).rgb, 1.0); }
`;if(fe==="b"){let a=new Image;a.decoding="async",a.onload=()=>{if(r)return;let n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),ie={tex:n,w:a.naturalWidth,h:a.naturalHeight},G.tex.push(n),ge(),Y()},a.src="bilder/glas/hinten-"+(window.innerWidth>=window.innerHeight?"quer":"hoch")+".webp?v=1"}let H=(a,n,s)=>{e.useProgram(a.prog);let l=0;for(let f in s){let x=a.u[f];if(!x)continue;let d=s[f];typeof d=="number"?e.uniform1f(x,d):Array.isArray(d)?d.length===2?e.uniform2f(x,d[0],d[1]):e.uniform3f(x,d[0],d[1],d[2]):(e.activeTexture(e.TEXTURE0+l),e.bindTexture(e.TEXTURE_2D,d),e.uniform1i(x,l++))}e.bindFramebuffer(e.FRAMEBUFFER,n?n.fbo:null),e.viewport(0,0,n?n.w:w.width,n?n.h:w.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Ee="",Ft=()=>{_e();let a=N,n=w.getBoundingClientRect(),s=h?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),l=Math.max(1,Math.round(n.width*s)),f=Math.max(1,Math.round(n.height*s)),x=getComputedStyle(a),d=parseFloat(x.fontSize)||64,F=X&&!D?ae:window.scrollY||0,te=[],$=document.createTreeWalker(a,NodeFilter.SHOW_TEXT),z=R=>!!(R.parentElement&&R.parentElement.closest&&R.parentElement.closest(".glas-versteckt"));for(let R=$.nextNode();R;R=$.nextNode())for(let V=0;V<(z(R)?0:R.data.length);V++){if(/\s/.test(R.data[V]))continue;let Be=document.createRange();Be.setStart(R,V),Be.setEnd(R,V+1);let ot=Be.getBoundingClientRect();te.push([R.data[V],ot.left-n.left,ot.top+F])}let ne=[l,f,s,x.font].concat(te.map(R=>R[0]+"@"+R[1].toFixed(1)+","+R[2].toFixed(1))).join("|");if(ne===Ee)return;Ee=ne;let y=document.createElement("canvas");y.width=l,y.height=f;let S=y.getContext("2d");if(S)return S.fillStyle="#000",S.fillRect(0,0,l,f),S.font=x.fontStyle+" "+x.fontWeight+" "+(d*s).toFixed(2)+"px "+x.fontFamily,"letterSpacing"in S&&(S.letterSpacing="0px"),S.fillStyle="#fff",S.textBaseline="alphabetic",te.forEach(R=>{let V=S.measureText(R[0]).fontBoundingBoxAscent||d*s*.8;S.fillText(R[0],R[1]*s,R[2]*s+V)}),yt(S,l,f,Xe(d,s)),{cnv:y,w:l,h:f,fontPx:d,scale:s}},At=(a,n,s,l,f)=>{if(k.masken=(k.masken||0)+1,O||(O=e.createTexture()),e.bindTexture(e.TEXTURE_2D,O),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!E||E.w!==n||E.h!==s){for(let d of[E,M])d&&(e.deleteTexture(d.tex),e.deleteFramebuffer(d.fbo));E=ee(n,s,!0),M=ee(n,s,!0)}K=Xe(l,f);let x=Math.max(1.5*f,K*.25);H(m.blur,E,{src:O,step:[1/n,0],radius:x,read:1,write:0}),H(m.blur,M,{src:E.tex,step:[0,1/s],radius:x,read:1,write:0}),H(m.blur,E,{src:M.tex,step:[1/n,0],radius:K*3,read:1,write:1}),H(m.blur,M,{src:E.tex,step:[0,1/s],radius:K*3,read:2,write:1})},we=()=>{let a=N;if(!a||!T)return;if(D&&_.ziel===0){_.offen=!0;return}if(U){let y=Ft();y&&At(y.cnv,y.w,y.h,y.fontPx,y.scale);return}let n=u.getBoundingClientRect(),s=h?1:Math.min(window.devicePixelRatio||1,1.5),l=Math.max(1,Math.round(n.width*s)),f=Math.max(1,Math.round(n.height*s)),x=Array.from(a.querySelectorAll(".ghr-word")),d=x.map(y=>y.getBoundingClientRect()),F=getComputedStyle(a),te=[l,f,s,F.font,F.letterSpacing].concat(x.map((y,S)=>(y.textContent||"")+"@"+Math.round(d[S].left-n.left)+","+Math.round(d[S].top-n.top))).join("|");if(te===Ee)return;Ee=te;let $=document.createElement("canvas");$.width=l,$.height=f;let z=$.getContext("2d");if(!z)return;z.fillStyle="#000",z.fillRect(0,0,l,f);let ne=parseFloat(F.fontSize)||64;if(z.setTransform(s,0,0,s,0,0),z.font=F.fontStyle+" "+F.fontWeight+" "+F.fontSize+" "+F.fontFamily,"letterSpacing"in z&&(z.letterSpacing=F.letterSpacing==="normal"?"0px":F.letterSpacing),z.fillStyle="#fff",z.textBaseline="alphabetic",x.forEach((y,S)=>{let R=y.textContent||"",V=z.measureText(R).fontBoundingBoxAscent||ne*.8;z.fillText(R,d[S].left-n.left,d[S].top-n.top+V)}),O||(O=e.createTexture()),e.bindTexture(e.TEXTURE_2D,O),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,$),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!E||E.w!==l||E.h!==f){for(let y of[E,M])y&&(e.deleteTexture(y.tex),e.deleteFramebuffer(y.fbo));E=ee(l,f,!0),M=ee(l,f,!0)}K=Xe(ne,s),!(!E||!M)&&(H(m.blur,E,{src:O,step:[1/l,0],radius:K,read:0,write:0}),H(m.blur,M,{src:E.tex,step:[0,1/f],radius:K,read:1,write:0}),H(m.blur,E,{src:M.tex,step:[1/l,0],radius:K*3,read:1,write:1}),H(m.blur,M,{src:E.tex,step:[0,1/f],radius:K*3,read:2,write:1}))},ge=()=>{let a=U&&ye?.35:X&&qe&&!h?Math.min(window.devicePixelRatio||1,1.5):h?U?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),n=Math.max(1,Math.round(w.clientWidth*a)),s=Math.max(1,Math.round(w.clientHeight*a));(w.width!==n||w.height!==s)&&(w.width=n,w.height=s);let l=fe==="b"&&ie?1:h?.25:.4;De=!1;let f=Math.max(1,Math.round(n*l)),x=Math.max(1,Math.round(s*l));(!T||T.w!==f||T.h!==x)&&(T&&(e.deleteTexture(T.tex),e.deleteFramebuffer(T.fbo)),T=ee(f,x,!1)),we()},Lt=()=>{if(!T||!M)return;let a=bt.palette,n=w.width/w.height;if(re!==void 0)e.bindFramebuffer(e.FRAMEBUFFER,T.fbo),e.viewport(0,0,T.w,T.h),e.clearColor(re,re,re,1),e.clear(e.COLOR_BUFFER_BIT);else if(fe==="b"&&ie&&m.bild){if(!De){let f=ie.w/ie.h;H(m.bild,T,{bild:ie.tex,skala:n>f?[1,f/n]:[n/f,1]}),De=!0}}else H(m.field,T,{time:i,aspect:n,octaves:h?3:X&&qe?4:5,c0:a[0],c1:a[1],c2:a[2],c3:a[3],c4:a[4]});let s=Math.max(1,w.clientHeight),l=D?St(performance.now()):1;H(m.glass,null,{field:T.tex,height:M.tex,htexel:[1/M.w,1/M.h],bevel:K,aspect:n,light:[C.x,C.y],glass:D?l:1,form:D?B.matches?1:l:X||B.matches||I<0?1:Bt(performance.now()-I,1100),res:[w.width,w.height],shift:U?(X&&(!D||Ae)?ue():window.scrollY||0)/s:0,nahtlos:le?1:0,maske:D?_.lage/s:0,ohne:D&&l<=0?1:0,detail:fe==="a"?1:0}),k.bilder++},me=()=>(U||c)&&!document.hidden&&!B.matches,Te=0,ye=!1,_=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},Mt=a=>a<.5?4*a*a*a:1-Math.pow(-2*a+2,3)/2;function St(a){let n=window.scrollY||0,s=u.offsetHeight||w.clientHeight||1;if(Ae){let d=Math.max(0,Math.min(1,(Ge*s-n)/Math.max(1,(Ge-mt)*s)));if(d>0&&_.offen&&(_.offen=!1,_.neu++,we()),_.ziel=d>0?1:0,_.wert=d,_.lage=ue(),J){let F=d>=1?"":d.toFixed(3);J.style.opacity!==F&&(J.style.opacity=F,J.style.pointerEvents=d<.05?"none":"")}return d}let l=_.ziel===1?n>dt*s?0:1:n<ht*s?1:0;l!==_.ziel&&(_.von=_.wert,_.t0=a,_.ziel=l,l===1&&_.offen&&(_.offen=!1,_.neu++,we()));let f=Math.min(1,(a-_.t0)/(B.matches?250:gt)),x=B.matches?f:Mt(f);return _.wert=_.von+(_.ziel-_.von)*x,_.wert>0&&(_.lage=n),_.wert}let Ze=a=>{if(o=0,Pe=performance.now(),r)return;let n=(a-p)/1e3;p=a;let s=Math.min(n,.1);!h&&v<40&&me()&&(v+=1,k.geprueft=v,v>3&&n>.05&&(b+=n>.15?3:1),b>=8&&(h=!0,k.lite=!0,g.setAttribute("data-glas-lite","true"),ge()));let l=U?Math.min(Math.max((window.scrollY||0)/Math.max(1,w.clientHeight),0),1):0;me()&&!g.classList.contains("glas-laden")&&(i+=s*(1-.7*l));let f=q,x=(a-f.at)/1e3>2.5,[d,F]=x&&me()?zt(i):[f.x,f.y];if(C.x=ut(C.x,d,s,x?1.2:7),C.y=ut(C.y,F,s,x?1.2:7),re!==void 0&&(C.x=.5,C.y=.7),U&&!le){let y=l>=1?!0:l<.97?!1:ye;y!==ye&&(ye=y,ge())}U&&!X&&l>=1&&me()&&a-Te<40||D&&l>=1&&a-Te<30||g.classList.contains("papier-zu")&&a-Te<250||(Lt(),Te=a);let $=Math.abs(C.x-d)+Math.abs(C.y-F)>.0015,z=(U||c)&&!document.hidden,ne=I>=0&&performance.now()-I<1100||D&&_.wert!==_.ziel;z&&(me()||$||ne)&&(o=requestAnimationFrame(Ze))},Pe=0,Y=()=>{r||(o&&performance.now()-Pe>500&&(cancelAnimationFrame(o),o=0),!o&&(p=Pe=performance.now(),o=requestAnimationFrame(Ze)))};q.neustart=()=>{r||(cancelAnimationFrame(o),o=0,Y())},q.kick=Y,q.rebuild=()=>{r||(we(),Y())};let et=a=>{a.preventDefault(),cancelAnimationFrame(o),o=0},tt=()=>Ue();w.addEventListener("webglcontextlost",et),w.addEventListener("webglcontextrestored",tt);try{m={field:Q(st),blur:Q(U?Ke:Re),glass:Q(U?P:Ne),bild:fe==="b"?Q(Rt):null};let a=e.createVertexArray();e.bindVertexArray(a);let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),ge()}catch{return}u.setAttribute("data-glass","true"),k.glas=!0,I=performance.now(),Y();let Ce=0,Ie=new ResizeObserver(()=>{cancelAnimationFrame(Ce),Ce=requestAnimationFrame(()=>{r||(ge(),Y())})});Ie.observe(u),U&&Ie.observe(w);let nt=()=>Y();U&&window.addEventListener("scroll",nt,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>q.rebuild());let at=new IntersectionObserver(([a])=>{c=a.isIntersecting,c&&Y()});at.observe(u);let rt=()=>!document.hidden&&Y();document.addEventListener("visibilitychange",rt),B.addEventListener("change",Y),be=()=>{r=!0,cancelAnimationFrame(o),cancelAnimationFrame(Ce),Ie.disconnect(),at.disconnect(),window.removeEventListener("scroll",nt),document.removeEventListener("visibilitychange",rt),B.removeEventListener("change",Y),w.removeEventListener("webglcontextlost",et),w.removeEventListener("webglcontextrestored",tt),L(),O&&e.deleteTexture(O);for(let a of Object.values(m||{}))e.deleteProgram(a.prog);u.setAttribute("data-glass","false"),k.glas=!1}}if(u.addEventListener("pointermove",e=>{let t=(j&&w.isConnected?w:u).getBoundingClientRect();q.x=(e.clientX-t.left)/t.width,q.y=1-(e.clientY-t.top)/t.height,q.at=performance.now(),q.kick()}),u.setAttribute("data-glass","false"),X){let e=!1,t=()=>{e||(e=!0,g.classList.add("glas-schrift-da"),_e(),Ue(),k.glas||g.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500);let r=0;window.addEventListener("scroll",()=>{r||(r=requestAnimationFrame(()=>{r=0,ue()}))},{passive:!0});let o=()=>{ue(),q.neustart&&q.neustart()};window.addEventListener("pageshow",o),document.addEventListener("visibilitychange",()=>{document.hidden||o()}),window.addEventListener("focus",o)}else Ue();let Je=performance.now(),Qe=0;setInterval(()=>{let e=k.bilder;k.fps=Math.round((e-Qe)*1e3/Math.max(1,performance.now()-Je)),Qe=e,Je=performance.now()},1e3),window.__glas={zustand:()=>({glas:k.glas,lite:k.lite,fps:k.fps,bilder:k.bilder,geprueft:k.geprueft||0,angebote:je,masken:k.masken||0,versatz:ae,ruhe:X,titel:N.textContent,punkt:g.getAttribute("data-glas-punkt")||"glas",weg:D,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1}),zumKontakt:Se,zuAngeboten:Me}})();})();
