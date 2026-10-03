(()=>{var Qe=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,ke=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,Ze=ke+`uniform float u_time;
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
}`,be=ke+`uniform sampler2D u_src;
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
}`,Ue=ke+`uniform sampler2D u_field;
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
}`;var Ft=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function tt(c){let m=/^#?([0-9a-f]{6})$/i.exec(c.trim());if(!m)return null;let A=parseInt(m[1],16);return[(A>>16&255)/255,(A>>8&255)/255,(A&255)/255]}function Rt(c){return Ft.map((m,A)=>tt((c&&c[A])!=null?c[A]:"")||tt(m))}function Ce(c,m){return Math.max(2,c*.075*m)}function At(c,m){let A=Math.min(Math.max(c/m,0),1);return 1-Math.pow(1-A,3)}function nt(c){let m=(A,ce)=>"rgba("+A.map(re=>Math.round(re*255)).join(",")+","+ce+")";return"radial-gradient(60% 50% at 25% 30%,"+m(c[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+m(c[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+m(c[2],.27)+",transparent 70%),"+m(c[0],1)}function rt(c,m,A,ce){return m+(c-m)*Math.exp(-ce*A)}function Lt(c){return[.5+.32*Math.sin(c*.37),.56+.16*Math.sin(c*.53+1.1)]}(function(){let c=document.querySelector("[data-glas-root]");if(!c)return;let m=document.documentElement,A=new URLSearchParams(location.search),re=Rt(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),w=c.querySelector("[data-glas-canvas]"),B=c.querySelector("[data-glas-titel]"),j=m.classList.contains("glas-fein"),ae=j&&m.classList.contains("glas-nahtlos"),z=j&&m.classList.contains("ruhe"),P=z&&m.classList.contains("schrift-weg"),at=.08,ot=.035,it=600,fe=z&&!P?c.querySelector(".ghr-content"):null,te=0,De=window.innerWidth,Pe=Math.min(window.devicePixelRatio||1,2),Ie=window.matchMedia("(max-width: 899px)").matches;function ue(){if(!fe)return te;let e=Math.round((window.scrollY||0)*Pe)/Pe;return(e!==te||!fe.style.transform)&&(te=e,fe.style.transform="translate3d(0,"+-e+"px,0)",fe.style.visibility=e>c.offsetHeight+40?"hidden":""),te}z&&(m.classList.add("glas-ruhe"),ue());let N=(e,t)=>(t||document).querySelector(e),we=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function J(e,t,n){let o=document.createElement(e);return t&&(o.className=t),n!=null&&(o.textContent=n),o}c.style.height="100svh",c.style.background=nt(re);let oe=null;if(j&&(oe=J("div","glas-buehne"),oe.setAttribute("aria-hidden","true"),oe.style.background=nt(re),oe.appendChild(w),document.body.insertBefore(oe,document.body.firstChild),c.style.background="transparent",A.get("punkt")!=="orange"&&(B.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),A.get("punkt")==="orange"&&(B.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',m.setAttribute("data-glas-punkt","orange")),ae&&A.get("text")!=="b"){let e=c.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(A.get("text")==="b"){let e=c.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=N(e);t&&t.remove()});let ie=N("main#inhalt"),de=window.PREISE,Ee=J("footer","glas-fuss");Ee.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span><nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',ie&&ie.parentNode.insertBefore(Ee,ie.nextSibling),de&&de.klein&&(N("[data-glas-klein]",Ee).textContent=de.klein+" "+(de.steuer||""));function st(){let e=N("[data-glas-kopf]");return e?e.offsetHeight:0}function lt(e){let t=0;for(let n=e;n;n=n.offsetParent)t+=n.offsetTop;return t}let Be=window.matchMedia("(prefers-reduced-motion: reduce)");function ze(e){e&&window.scrollTo({top:Math.max(0,lt(e)-st()-20),behavior:Be.matches?"auto":"smooth"})}function ye(){ze(N("#angebote"))}function Te(){let e=N("#preise .mf__oben");ze(e&&!e.hidden?e:N("#preise .mf__raster"))}window.__kristall={zumKontakt:Te,zuAngeboten:ye},document.addEventListener("click",e=>{if(j&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:Be.matches?"auto":"smooth"});return}let n=e.target.closest&&e.target.closest("[data-glas-ziel]");n&&(e.preventDefault(),n.getAttribute("data-glas-ziel")==="kontakt"?Te():ye())});let Xe=!1;function ct(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),we(".k-angebot",e).forEach(n=>{let o=N(".k-angebot__wort",n),g=N(".k-angebot__info",n),s=g&&g.querySelector("b")?g.querySelector("b").textContent.trim():"",f=g?g.textContent.replace(s,"").replace(/^\s*·\s*/,"").trim():"",p=s.split(" + ");n.classList.add("glas-karte"),n.innerHTML="",n.appendChild(J("span","k-angebot__wort glas-karte__titel",o?o.textContent:"")),n.appendChild(J("span","glas-karte__satz",f));let E=J("span","glas-karte__preis");E.appendChild(J("b","",p[0])),p[1]&&E.appendChild(J("small","","+ "+p.slice(1).join(" + "))),n.appendChild(E)}),Xe=!0,!0}if((function e(t){!ct()&&t<60&&setTimeout(()=>e(t+1),50)})(0),ie){ie.classList.add("glas-haupt");let e=N("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=N("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(n=>{n.isIntersecting&&(n.target.classList.add("ist-da"),e.unobserve(n.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>we(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else m.classList.add("glas-alles-da");let ft={palette:re,title:B.textContent},O={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},M={glas:!1,lite:!1,fps:0,bilder:0},he=null,Ne=be.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),V=Ue.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);ae&&(V=V.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let Fe=A.get("glasdbg");if(j&&Fe&&(V=V.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(Fe==="g"?"dh.g":Fe==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`)),j&&P){let e=ae?`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
`:"";V=V.split("texture(u_height, vec2(0.0, -u_shift) + ").join("texture(u_height, vec2(0.0, -u_maske) + ").replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_maske;
uniform float u_ohne;`).replace(`  vec2 uv = vUv;
`,`  vec2 uv = vUv;
  if (u_ohne > 0.5) {
  vec3 col = texture(u_field, uv).rgb;
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
`+e+`  o = vec4(col, 1.0);
  return;
  }
`)}let ut=Ne===be||V.indexOf("u_shift")<0||j&&P&&V.indexOf("u_ohne > 0.5")<0,k=j&&!ut,dt=.06;function ht(){let e=we(".glas-z",B);if(e.length<2)return;e.forEach(s=>{s.style.marginLeft=""});let t=getComputedStyle(B),n=parseFloat(t.fontSize)||64,o=document.createElement("canvas").getContext("2d");if(!o)return;o.font=t.fontStyle+" "+t.fontWeight+" "+n+"px "+t.fontFamily,"letterSpacing"in o&&(o.letterSpacing="0px");let g=e.map(s=>{let f=s.getBoundingClientRect(),p=o.measureText(s.textContent);return[f.left-p.actualBoundingBoxLeft,f.left+p.actualBoundingBoxRight]});for(let s=1;s<e.length;s++)e[s].style.marginLeft=((dt*n-(g[s][0]-g[s-1][1]))/n).toFixed(4)+"em"}function me(){if(!k)return;B.style.fontSize="",ht();let e=B.querySelector(".ghr-word");if(!e)return;let t=parseFloat(getComputedStyle(B).fontSize)||64,n=e.getBoundingClientRect().width,o=t*.16,g=c.clientWidth*(1-2*.06);n+o>g&&(B.style.fontSize=(t*g/(n+o)).toFixed(2)+"px")}k&&(me(),window.addEventListener("resize",()=>{z&&window.innerWidth===De||(De=window.innerWidth,me())}));function Oe(e,t,n,o,g){let s=0;o[0]=0,g[0]=-1e20,g[1]=1e20;for(let f=1;f<t;f++){let p=(e[f]+f*f-(e[o[s]]+o[s]*o[s]))/(2*f-2*o[s]);for(;p<=g[s];)s--,p=(e[f]+f*f-(e[o[s]]+o[s]*o[s]))/(2*f-2*o[s]);s++,o[s]=f,g[s]=p,g[s+1]=1e20}s=0;for(let f=0;f<t;f++){for(;g[s+1]<f;)s++;n[f]=(f-o[s])*(f-o[s])+e[o[s]]}}function Ge(e,t,n){let o=Math.max(t,n),g=new Float64Array(o),s=new Float64Array(o),f=new Int32Array(o),p=new Float64Array(o+1);for(let E=0;E<t;E++){for(let b=0;b<n;b++)g[b]=e[b*t+E];Oe(g,n,s,f,p);for(let b=0;b<n;b++)e[b*t+E]=s[b]}for(let E=0;E<n;E++){for(let b=0;b<t;b++)g[b]=e[E*t+b];Oe(g,t,s,f,p);for(let b=0;b<t;b++)e[E*t+b]=s[b]}return e}function mt(e){let t=Math.abs(e)/Math.SQRT2,n=1/(1+.3275911*t),o=1-((((1.061405429*n-1.453152027)*n+1.421413741)*n-.284496736)*n+.254829592)*n*Math.exp(-t*t);return e>=0?.5*(1+o):.5*(1-o)}function gt(e,t,n,o){let g=e.getImageData(0,0,t,n),s=g.data,f=t,p=n,E=-1,b=-1;for(let R=0;R<n;R++)for(let x=0;x<t;x++)s[(R*t+x)*4]>0&&(x<f&&(f=x),x>E&&(E=x),R<p&&(p=R),R>b&&(b=R));if(E<0)return;let I=Math.ceil(o*2.5)+2;f=Math.max(0,f-I),p=Math.max(0,p-I),E=Math.min(t-1,E+I),b=Math.min(n-1,b+I);let C=E-f+1,D=b-p+1,ne=new Float64Array(C*D),Q=new Float64Array(C*D),G=new Float32Array(C*D);for(let R=0;R<D;R++)for(let x=0;x<C;x++){let F=R*C+x,_=s[((R+p)*t+x+f)*4]/255;G[F]=_,ne[F]=_<.5?0:1e20,Q[F]=_>=.5?0:1e20}Ge(ne,C,D),Ge(Q,C,D);let Z=Math.max(o*.5,.5);for(let R=0;R<D;R++)for(let x=0;x<C;x++){let F=R*C+x,_=((R+p)*t+x+f)*4,L=G[F]>=.5?Math.sqrt(ne[F])-.5:.5-Math.sqrt(Q[F]),X=Math.abs(L)<1?G[F]-.5:L;s[_]=Math.round(mt(X/Z)*255),s[_+1]=Math.round(G[F]*255),s[_+2]=0}e.putImageData(g,0,0)}function Re(){he&&(he(),he=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:w.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||k&&!!e.getExtension("EXT_color_buffer_half_float"),n=!1,o=0,g=0,s=0,f=!0,p=!1,E=0,b=0,I={x:.5,y:.56},C=-1,D=window.matchMedia("(prefers-reduced-motion: reduce)"),ne=(r,a)=>{let i=e.createShader(r);if(!i)throw new Error("could not create shader");if(e.shaderSource(i,a),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(i));return i},Q=r=>{let a=e.createProgram();if(!a)throw new Error("could not create program");let i=ne(e.VERTEX_SHADER,Qe),l=ne(e.FRAGMENT_SHADER,r);if(e.attachShader(a,i),e.attachShader(a,l),e.bindAttribLocation(a,0,"a_position"),e.linkProgram(a),e.deleteShader(i),e.deleteShader(l),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(a));let u={},v=e.getProgramParameter(a,e.ACTIVE_UNIFORMS);for(let d=0;d<v;d++){let S=e.getActiveUniform(a,d);S&&(u[S.name.replace(/^u_/,"")]=e.getUniformLocation(a,S.name))}return{prog:a,u}},G={tex:[],fbo:[]},Z=(r,a,i)=>{let l=e.createTexture(),u=e.createFramebuffer();if(!l||!u)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),i&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,r,a,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,r,a,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),G.tex.push(l),G.fbo.push(u),{tex:l,fbo:u,w:r,h:a}},R=()=>{for(let r of G.tex)e.deleteTexture(r);for(let r of G.fbo)e.deleteFramebuffer(r);G.tex=[],G.fbo=[]},x=null,F=null,_=null,L=null,X=null,W=4,H=(r,a,i)=>{e.useProgram(r.prog);let l=0;for(let u in i){let v=r.u[u];if(!v)continue;let d=i[u];typeof d=="number"?e.uniform1f(v,d):Array.isArray(d)?d.length===2?e.uniform2f(v,d[0],d[1]):e.uniform3f(v,d[0],d[1],d[2]):(e.activeTexture(e.TEXTURE0+l),e.bindTexture(e.TEXTURE_2D,d),e.uniform1i(v,l++))}e.bindFramebuffer(e.FRAMEBUFFER,a?a.fbo:null),e.viewport(0,0,a?a.w:w.width,a?a.h:w.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},ge="",pt=()=>{me();let r=B,a=w.getBoundingClientRect(),i=p?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),l=Math.max(1,Math.round(a.width*i)),u=Math.max(1,Math.round(a.height*i)),v=getComputedStyle(r),d=parseFloat(v.fontSize)||64,S=z&&!P?te:window.scrollY||0,ee=[],K=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);for(let T=K.nextNode();T;T=K.nextNode())for(let q=0;q<T.data.length;q++){if(/\s/.test(T.data[q]))continue;let le=document.createRange();le.setStart(T,q),le.setEnd(T,q+1);let Je=le.getBoundingClientRect();ee.push([T.data[q],Je.left-a.left,Je.top+S])}let U=[l,u,i,v.font].concat(ee.map(T=>T[0]+"@"+T[1].toFixed(1)+","+T[2].toFixed(1))).join("|");if(U===ge)return;ge=U;let $=document.createElement("canvas");$.width=l,$.height=u;let h=$.getContext("2d");if(h)return h.fillStyle="#000",h.fillRect(0,0,l,u),h.font=v.fontStyle+" "+v.fontWeight+" "+(d*i).toFixed(2)+"px "+v.fontFamily,"letterSpacing"in h&&(h.letterSpacing="0px"),h.fillStyle="#fff",h.textBaseline="alphabetic",ee.forEach(T=>{let q=h.measureText(T[0]).fontBoundingBoxAscent||d*i*.8;h.fillText(T[0],T[1]*i,T[2]*i+q)}),gt(h,l,u,Ce(d,i)),{cnv:$,w:l,h:u,fontPx:d,scale:i}},xt=(r,a,i,l,u)=>{if(M.masken=(M.masken||0)+1,X||(X=e.createTexture()),e.bindTexture(e.TEXTURE_2D,X),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!_||_.w!==a||_.h!==i){for(let d of[_,L])d&&(e.deleteTexture(d.tex),e.deleteFramebuffer(d.fbo));_=Z(a,i,!0),L=Z(a,i,!0)}W=Ce(l,u);let v=Math.max(1.5*u,W*.25);H(x.blur,_,{src:X,step:[1/a,0],radius:v,read:1,write:0}),H(x.blur,L,{src:_.tex,step:[0,1/i],radius:v,read:1,write:0}),H(x.blur,_,{src:L.tex,step:[1/a,0],radius:W*3,read:1,write:1}),H(x.blur,L,{src:_.tex,step:[0,1/i],radius:W*3,read:2,write:1})},Ae=()=>{let r=B;if(!r||!F)return;if(P&&y.ziel===0){y.offen=!0;return}if(k){let h=pt();h&&xt(h.cnv,h.w,h.h,h.fontPx,h.scale);return}let a=c.getBoundingClientRect(),i=p?1:Math.min(window.devicePixelRatio||1,1.5),l=Math.max(1,Math.round(a.width*i)),u=Math.max(1,Math.round(a.height*i)),v=Array.from(r.querySelectorAll(".ghr-word")),d=v.map(h=>h.getBoundingClientRect()),S=getComputedStyle(r),ee=[l,u,i,S.font,S.letterSpacing].concat(v.map((h,T)=>(h.textContent||"")+"@"+Math.round(d[T].left-a.left)+","+Math.round(d[T].top-a.top))).join("|");if(ee===ge)return;ge=ee;let K=document.createElement("canvas");K.width=l,K.height=u;let U=K.getContext("2d");if(!U)return;U.fillStyle="#000",U.fillRect(0,0,l,u);let $=parseFloat(S.fontSize)||64;if(U.setTransform(i,0,0,i,0,0),U.font=S.fontStyle+" "+S.fontWeight+" "+S.fontSize+" "+S.fontFamily,"letterSpacing"in U&&(U.letterSpacing=S.letterSpacing==="normal"?"0px":S.letterSpacing),U.fillStyle="#fff",U.textBaseline="alphabetic",v.forEach((h,T)=>{let q=h.textContent||"",le=U.measureText(q).fontBoundingBoxAscent||$*.8;U.fillText(q,d[T].left-a.left,d[T].top-a.top+le)}),X||(X=e.createTexture()),e.bindTexture(e.TEXTURE_2D,X),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,K),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!_||_.w!==l||_.h!==u){for(let h of[_,L])h&&(e.deleteTexture(h.tex),e.deleteFramebuffer(h.fbo));_=Z(l,u,!0),L=Z(l,u,!0)}W=Ce($,i),!(!_||!L)&&(H(x.blur,_,{src:X,step:[1/l,0],radius:W,read:0,write:0}),H(x.blur,L,{src:_.tex,step:[0,1/u],radius:W,read:1,write:0}),H(x.blur,_,{src:L.tex,step:[1/l,0],radius:W*3,read:1,write:1}),H(x.blur,L,{src:_.tex,step:[0,1/u],radius:W*3,read:2,write:1}))},pe=()=>{let r=k&&ve?.35:z&&Ie&&!p?Math.min(window.devicePixelRatio||1,1.5):p?k?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),a=Math.max(1,Math.round(w.clientWidth*r)),i=Math.max(1,Math.round(w.clientHeight*r));(w.width!==a||w.height!==i)&&(w.width=a,w.height=i);let l=p?.25:.4,u=Math.max(1,Math.round(a*l)),v=Math.max(1,Math.round(i*l));(!F||F.w!==u||F.h!==v)&&(F&&(e.deleteTexture(F.tex),e.deleteFramebuffer(F.fbo)),F=Z(u,v,!1)),Ae()},vt=()=>{if(!F||!L)return;let r=ft.palette,a=w.width/w.height;H(x.field,F,{time:s,aspect:a,octaves:p?3:z&&Ie?4:5,c0:r[0],c1:r[1],c2:r[2],c3:r[3],c4:r[4]});let i=Math.max(1,w.clientHeight),l=P?_t(performance.now()):1;H(x.glass,null,{field:F.tex,height:L.tex,htexel:[1/L.w,1/L.h],bevel:W,aspect:a,light:[I.x,I.y],glass:P?l:1,form:P?D.matches?1:l:z||D.matches||C<0?1:At(performance.now()-C,1100),res:[w.width,w.height],shift:k?(z&&!P?ue():window.scrollY||0)/i:0,nahtlos:ae?1:0,maske:P?y.lage/i:0,ohne:P&&l<=0?1:0}),M.bilder++},se=()=>(k||f)&&!document.hidden&&!D.matches,xe=0,ve=!1,y=window.__glasSchrift={ziel:1,von:1,wert:1,t0:0,lage:0,offen:!1,neu:0},bt=r=>r<.5?4*r*r*r:1-Math.pow(-2*r+2,3)/2;function _t(r){let a=window.scrollY||0,i=c.offsetHeight||w.clientHeight||1,l=y.ziel===1?a>at*i?0:1:a<ot*i?1:0;l!==y.ziel&&(y.von=y.wert,y.t0=r,y.ziel=l,l===1&&y.offen&&(y.offen=!1,y.neu++,Ae()));let u=Math.min(1,(r-y.t0)/(D.matches?250:it)),v=D.matches?u:bt(u);return y.wert=y.von+(y.ziel-y.von)*v,y.wert>0&&(y.lage=a),y.wert}let He=r=>{if(o=0,Le=performance.now(),n)return;let a=(r-g)/1e3;g=r;let i=Math.min(a,.1);!p&&E<40&&se()&&(E+=1,M.geprueft=E,E>3&&a>.05&&(b+=a>.15?3:1),b>=8&&(p=!0,M.lite=!0,m.setAttribute("data-glas-lite","true"),pe()));let l=k?Math.min(Math.max((window.scrollY||0)/Math.max(1,w.clientHeight),0),1):0;se()&&!m.classList.contains("glas-laden")&&(s+=i*(1-.7*l));let u=O,v=(r-u.at)/1e3>2.5,[d,S]=v&&se()?Lt(s):[u.x,u.y];if(I.x=rt(I.x,d,i,v?1.2:7),I.y=rt(I.y,S,i,v?1.2:7),k&&!ae){let h=l>=1?!0:l<.97?!1:ve;h!==ve&&(ve=h,pe())}k&&!z&&l>=1&&se()&&r-xe<40||P&&l>=1&&r-xe<30||m.classList.contains("papier-zu")&&r-xe<250||(vt(),xe=r);let K=Math.abs(I.x-d)+Math.abs(I.y-S)>.0015,U=(k||f)&&!document.hidden,$=C>=0&&performance.now()-C<1100||P&&y.wert!==y.ziel;U&&(se()||K||$)&&(o=requestAnimationFrame(He))},Le=0,Y=()=>{n||(o&&performance.now()-Le>500&&(cancelAnimationFrame(o),o=0),!o&&(g=Le=performance.now(),o=requestAnimationFrame(He)))};O.neustart=()=>{n||(cancelAnimationFrame(o),o=0,Y())},O.kick=Y,O.rebuild=()=>{n||(Ae(),Y())};let Ye=r=>{r.preventDefault(),cancelAnimationFrame(o),o=0},je=()=>Re();w.addEventListener("webglcontextlost",Ye),w.addEventListener("webglcontextrestored",je);try{x={field:Q(Ze),blur:Q(k?Ne:be),glass:Q(k?V:Ue)};let r=e.createVertexArray();e.bindVertexArray(r);let a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),pe()}catch{return}c.setAttribute("data-glass","true"),M.glas=!0,C=performance.now(),Y();let Se=0,Me=new ResizeObserver(()=>{cancelAnimationFrame(Se),Se=requestAnimationFrame(()=>{n||(pe(),Y())})});Me.observe(c),k&&Me.observe(w);let Ve=()=>Y();k&&window.addEventListener("scroll",Ve,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>O.rebuild());let Ke=new IntersectionObserver(([r])=>{f=r.isIntersecting,f&&Y()});Ke.observe(c);let $e=()=>!document.hidden&&Y();document.addEventListener("visibilitychange",$e),D.addEventListener("change",Y),he=()=>{n=!0,cancelAnimationFrame(o),cancelAnimationFrame(Se),Me.disconnect(),Ke.disconnect(),window.removeEventListener("scroll",Ve),document.removeEventListener("visibilitychange",$e),D.removeEventListener("change",Y),w.removeEventListener("webglcontextlost",Ye),w.removeEventListener("webglcontextrestored",je),R(),X&&e.deleteTexture(X);for(let r of Object.values(x||{}))e.deleteProgram(r.prog);c.setAttribute("data-glass","false"),M.glas=!1}}if(c.addEventListener("pointermove",e=>{let t=(j&&w.isConnected?w:c).getBoundingClientRect();O.x=(e.clientX-t.left)/t.width,O.y=1-(e.clientY-t.top)/t.height,O.at=performance.now(),O.kick()}),c.setAttribute("data-glass","false"),z){let e=!1,t=()=>{e||(e=!0,m.classList.add("glas-schrift-da"),me(),Re(),M.glas||m.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500);let n=0;window.addEventListener("scroll",()=>{n||(n=requestAnimationFrame(()=>{n=0,ue()}))},{passive:!0});let o=()=>{ue(),O.neustart&&O.neustart()};window.addEventListener("pageshow",o),document.addEventListener("visibilitychange",()=>{document.hidden||o()}),window.addEventListener("focus",o)}else Re();let qe=performance.now(),We=0;setInterval(()=>{let e=M.bilder;M.fps=Math.round((e-We)*1e3/Math.max(1,performance.now()-qe)),We=e,qe=performance.now()},1e3),window.__glas={zustand:()=>({glas:M.glas,lite:M.lite,fps:M.fps,bilder:M.bilder,geprueft:M.geprueft||0,angebote:Xe,masken:M.masken||0,versatz:te,ruhe:z,titel:B.textContent,punkt:m.getAttribute("data-glas-punkt")||"glas",weg:P,schrift:window.__glasSchrift?Math.round(window.__glasSchrift.wert*1e3)/1e3:1}),zumKontakt:Te,zuAngeboten:ye}})();})();
