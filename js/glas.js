(()=>{var Ve=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,Re=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,Ke=Re+`uniform float u_time;
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
}`,me=Re+`uniform sampler2D u_src;
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
}`,Ae=Re+`uniform sampler2D u_field;
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
}`;var pt=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function Qe(l){let b=/^#?([0-9a-f]{6})$/i.exec(l.trim());if(!b)return null;let R=parseInt(b[1],16);return[(R>>16&255)/255,(R>>8&255)/255,(R&255)/255]}function xt(l){return pt.map((b,R)=>Qe((l&&l[R])!=null?l[R]:"")||Qe(b))}function Se(l,b){return Math.max(2,l*.075*b)}function bt(l,b){let R=Math.min(Math.max(l/b,0),1);return 1-Math.pow(1-R,3)}function Je(l){let b=(R,ie)=>"rgba("+R.map(te=>Math.round(te*255)).join(",")+","+ie+")";return"radial-gradient(60% 50% at 25% 30%,"+b(l[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+b(l[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+b(l[2],.27)+",transparent 70%),"+b(l[0],1)}function Ze(l,b,R,ie){return b+(l-b)*Math.exp(-ie*R)}function vt(l){return[.5+.32*Math.sin(l*.37),.56+.16*Math.sin(l*.53+1.1)]}(function(){let l=document.querySelector("[data-glas-root]");if(!l)return;let b=document.documentElement,R=new URLSearchParams(location.search),te=xt(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),E=l.querySelector("[data-glas-canvas]"),P=l.querySelector("[data-glas-titel]"),j=b.classList.contains("glas-fein"),se=j&&b.classList.contains("glas-nahtlos"),H=j&&b.classList.contains("ruhe"),le=H?l.querySelector(".ghr-content"):null,J=0,Le=window.innerWidth,Me=Math.min(window.devicePixelRatio||1,2);function xe(){if(!le)return J;let e=Math.round((window.scrollY||0)*Me)/Me;return(e!==J||!le.style.transform)&&(J=e,le.style.transform="translate3d(0,"+-e+"px,0)",le.style.visibility=e>l.offsetHeight+40?"hidden":""),J}H&&(b.classList.add("glas-ruhe"),xe());let B=(e,t)=>(t||document).querySelector(e),be=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function V(e,t,n){let o=document.createElement(e);return t&&(o.className=t),n!=null&&(o.textContent=n),o}l.style.height="100svh",l.style.background=Je(te);let ne=null;if(j&&(ne=V("div","glas-buehne"),ne.setAttribute("aria-hidden","true"),ne.style.background=Je(te),ne.appendChild(E),document.body.insertBefore(ne,document.body.firstChild),l.style.background="transparent",R.get("punkt")!=="orange"&&(P.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),R.get("punkt")==="orange"&&(P.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',b.setAttribute("data-glas-punkt","orange")),se&&R.get("text")!=="b"){let e=l.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(R.get("text")==="b"){let e=l.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=B(e);t&&t.remove()});let re=B("main#inhalt"),ce=window.PREISE,ve=V("footer","glas-fuss");ve.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span><nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p><p class="glas-fuss__klein glas-fuss__quellen">Bilder der Planeten der Fassung \u201EAll\u201C: Erde \u2013 NASA (gemeinfrei) \xB7 Saturn \u2013 <a href="https://www.solarsystemscope.com/textures/" rel="noopener" target="_blank">Solar System Scope</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a></p>',re&&re.parentNode.insertBefore(ve,re.nextSibling),ce&&ce.klein&&(B("[data-glas-klein]",ve).textContent=ce.klein+" "+(ce.steuer||""));function et(){let e=B("[data-glas-kopf]");return e?e.offsetHeight:0}function tt(e){let t=0;for(let n=e;n;n=n.offsetParent)t+=n.offsetTop;return t}let ke=window.matchMedia("(prefers-reduced-motion: reduce)");function Ue(e){e&&window.scrollTo({top:Math.max(0,tt(e)-et()-20),behavior:ke.matches?"auto":"smooth"})}function _e(){Ue(B("#angebote"))}function Ee(){let e=B("#preise .mf__oben");Ue(e&&!e.hidden?e:B("#preise .mf__raster"))}window.__kristall={zumKontakt:Ee,zuAngeboten:_e},document.addEventListener("click",e=>{if(j&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:ke.matches?"auto":"smooth"});return}let n=e.target.closest&&e.target.closest("[data-glas-ziel]");n&&(e.preventDefault(),n.getAttribute("data-glas-ziel")==="kontakt"?Ee():_e())});let Ce=!1;function nt(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),be(".k-angebot",e).forEach(n=>{let o=B(".k-angebot__wort",n),g=B(".k-angebot__info",n),a=g&&g.querySelector("b")?g.querySelector("b").textContent.trim():"",c=g?g.textContent.replace(a,"").replace(/^\s*·\s*/,"").trim():"",p=a.split(" + ");n.classList.add("glas-karte"),n.innerHTML="",n.appendChild(V("span","k-angebot__wort glas-karte__titel",o?o.textContent:"")),n.appendChild(V("span","glas-karte__satz",c));let w=V("span","glas-karte__preis");w.appendChild(V("b","",p[0])),p[1]&&w.appendChild(V("small","","+ "+p.slice(1).join(" + "))),n.appendChild(w)}),Ce=!0,!0}if((function e(t){!nt()&&t<60&&setTimeout(()=>e(t+1),50)})(0),re){re.classList.add("glas-haupt");let e=B("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=B("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(n=>{n.isIntersecting&&(n.target.classList.add("ist-da"),e.unobserve(n.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>be(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else b.classList.add("glas-alles-da");let rt={palette:te,title:P.textContent},Y={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},U={glas:!1,lite:!1,fps:0,bilder:0},fe=null,Pe=me.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),Z=Ae.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);se&&(Z=Z.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let we=R.get("glasdbg");j&&we&&(Z=Z.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(we==="g"?"dh.g":we==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`));let at=Pe===me||Z.indexOf("u_shift")<0,L=j&&!at,ot=.06;function it(){let e=be(".glas-z",P);if(e.length<2)return;e.forEach(a=>{a.style.marginLeft=""});let t=getComputedStyle(P),n=parseFloat(t.fontSize)||64,o=document.createElement("canvas").getContext("2d");if(!o)return;o.font=t.fontStyle+" "+t.fontWeight+" "+n+"px "+t.fontFamily,"letterSpacing"in o&&(o.letterSpacing="0px");let g=e.map(a=>{let c=a.getBoundingClientRect(),p=o.measureText(a.textContent);return[c.left-p.actualBoundingBoxLeft,c.left+p.actualBoundingBoxRight]});for(let a=1;a<e.length;a++)e[a].style.marginLeft=((ot*n-(g[a][0]-g[a-1][1]))/n).toFixed(4)+"em"}function ue(){if(!L)return;P.style.fontSize="",it();let e=P.querySelector(".ghr-word");if(!e)return;let t=parseFloat(getComputedStyle(P).fontSize)||64,n=e.getBoundingClientRect().width,o=t*.16,g=l.clientWidth*(1-2*.06);n+o>g&&(P.style.fontSize=(t*g/(n+o)).toFixed(2)+"px")}L&&(ue(),window.addEventListener("resize",()=>{H&&window.innerWidth===Le||(Le=window.innerWidth,ue())}));function De(e,t,n,o,g){let a=0;o[0]=0,g[0]=-1e20,g[1]=1e20;for(let c=1;c<t;c++){let p=(e[c]+c*c-(e[o[a]]+o[a]*o[a]))/(2*c-2*o[a]);for(;p<=g[a];)a--,p=(e[c]+c*c-(e[o[a]]+o[a]*o[a]))/(2*c-2*o[a]);a++,o[a]=c,g[a]=p,g[a+1]=1e20}a=0;for(let c=0;c<t;c++){for(;g[a+1]<c;)a++;n[c]=(c-o[a])*(c-o[a])+e[o[a]]}}function Ie(e,t,n){let o=Math.max(t,n),g=new Float64Array(o),a=new Float64Array(o),c=new Int32Array(o),p=new Float64Array(o+1);for(let w=0;w<t;w++){for(let x=0;x<n;x++)g[x]=e[x*t+w];De(g,n,a,c,p);for(let x=0;x<n;x++)e[x*t+w]=a[x]}for(let w=0;w<n;w++){for(let x=0;x<t;x++)g[x]=e[w*t+x];De(g,t,a,c,p);for(let x=0;x<t;x++)e[w*t+x]=a[x]}return e}function st(e){let t=Math.abs(e)/Math.SQRT2,n=1/(1+.3275911*t),o=1-((((1.061405429*n-1.453152027)*n+1.421413741)*n-.284496736)*n+.254829592)*n*Math.exp(-t*t);return e>=0?.5*(1+o):.5*(1-o)}function lt(e,t,n,o){let g=e.getImageData(0,0,t,n),a=g.data,c=t,p=n,w=-1,x=-1;for(let F=0;F<n;F++)for(let m=0;m<t;m++)a[(F*t+m)*4]>0&&(m<c&&(c=m),m>w&&(w=m),F<p&&(p=F),F>x&&(x=F));if(w<0)return;let C=Math.ceil(o*2.5)+2;c=Math.max(0,c-C),p=Math.max(0,p-C),w=Math.min(t-1,w+C),x=Math.min(n-1,x+C);let k=w-c+1,D=x-p+1,ee=new Float64Array(k*D),K=new Float64Array(k*D),X=new Float32Array(k*D);for(let F=0;F<D;F++)for(let m=0;m<k;m++){let T=F*k+m,v=a[((F+p)*t+m+c)*4]/255;X[T]=v,ee[T]=v<.5?0:1e20,K[T]=v>=.5?0:1e20}Ie(ee,k,D),Ie(K,k,D);let $=Math.max(o*.5,.5);for(let F=0;F<D;F++)for(let m=0;m<k;m++){let T=F*k+m,v=((F+p)*t+m+c)*4,A=X[T]>=.5?Math.sqrt(ee[T])-.5:.5-Math.sqrt(K[T]),I=Math.abs(A)<1?X[T]-.5:A;a[v]=Math.round(st(I/$)*255),a[v+1]=Math.round(X[T]*255),a[v+2]=0}e.putImageData(g,0,0)}function ye(){fe&&(fe(),fe=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:E.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||L&&!!e.getExtension("EXT_color_buffer_half_float"),n=!1,o=0,g=0,a=0,c=!0,p=!1,w=0,x=0,C={x:.5,y:.56},k=-1,D=window.matchMedia("(prefers-reduced-motion: reduce)"),ee=(i,r)=>{let s=e.createShader(i);if(!s)throw new Error("could not create shader");if(e.shaderSource(s,r),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(s));return s},K=i=>{let r=e.createProgram();if(!r)throw new Error("could not create program");let s=ee(e.VERTEX_SHADER,Ve),f=ee(e.FRAGMENT_SHADER,i);if(e.attachShader(r,s),e.attachShader(r,f),e.bindAttribLocation(r,0,"a_position"),e.linkProgram(r),e.deleteShader(s),e.deleteShader(f),!e.getProgramParameter(r,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(r));let u={},_=e.getProgramParameter(r,e.ACTIVE_UNIFORMS);for(let d=0;d<_;d++){let S=e.getActiveUniform(r,d);S&&(u[S.name.replace(/^u_/,"")]=e.getUniformLocation(r,S.name))}return{prog:r,u}},X={tex:[],fbo:[]},$=(i,r,s)=>{let f=e.createTexture(),u=e.createFramebuffer();if(!f||!u)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),s&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,i,r,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,i,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,f,0),X.tex.push(f),X.fbo.push(u),{tex:f,fbo:u,w:i,h:r}},F=()=>{for(let i of X.tex)e.deleteTexture(i);for(let i of X.fbo)e.deleteFramebuffer(i);X.tex=[],X.fbo=[]},m=null,T=null,v=null,A=null,I=null,N=4,O=(i,r,s)=>{e.useProgram(i.prog);let f=0;for(let u in s){let _=i.u[u];if(!_)continue;let d=s[u];typeof d=="number"?e.uniform1f(_,d):Array.isArray(d)?d.length===2?e.uniform2f(_,d[0],d[1]):e.uniform3f(_,d[0],d[1],d[2]):(e.activeTexture(e.TEXTURE0+f),e.bindTexture(e.TEXTURE_2D,d),e.uniform1i(_,f++))}e.bindFramebuffer(e.FRAMEBUFFER,r?r.fbo:null),e.viewport(0,0,r?r.w:E.width,r?r.h:E.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},de="",ct=()=>{ue();let i=P,r=E.getBoundingClientRect(),s=p?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),f=Math.max(1,Math.round(r.width*s)),u=Math.max(1,Math.round(r.height*s)),_=getComputedStyle(i),d=parseFloat(_.fontSize)||64,S=H?J:window.scrollY||0,Q=[],q=document.createTreeWalker(i,NodeFilter.SHOW_TEXT);for(let y=q.nextNode();y;y=q.nextNode())for(let z=0;z<y.data.length;z++){if(/\s/.test(y.data[z]))continue;let oe=document.createRange();oe.setStart(y,z),oe.setEnd(y,z+1);let je=oe.getBoundingClientRect();Q.push([y.data[z],je.left-r.left,je.top+S])}let M=[f,u,s,_.font].concat(Q.map(y=>y[0]+"@"+y[1].toFixed(1)+","+y[2].toFixed(1))).join("|");if(M===de)return;de=M;let W=document.createElement("canvas");W.width=f,W.height=u;let h=W.getContext("2d");if(h)return h.fillStyle="#000",h.fillRect(0,0,f,u),h.font=_.fontStyle+" "+_.fontWeight+" "+(d*s).toFixed(2)+"px "+_.fontFamily,"letterSpacing"in h&&(h.letterSpacing="0px"),h.fillStyle="#fff",h.textBaseline="alphabetic",Q.forEach(y=>{let z=h.measureText(y[0]).fontBoundingBoxAscent||d*s*.8;h.fillText(y[0],y[1]*s,y[2]*s+z)}),lt(h,f,u,Se(d,s)),{cnv:W,w:f,h:u,fontPx:d,scale:s}},ft=(i,r,s,f,u)=>{if(U.masken=(U.masken||0)+1,I||(I=e.createTexture()),e.bindTexture(e.TEXTURE_2D,I),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!v||v.w!==r||v.h!==s){for(let d of[v,A])d&&(e.deleteTexture(d.tex),e.deleteFramebuffer(d.fbo));v=$(r,s,!0),A=$(r,s,!0)}N=Se(f,u);let _=Math.max(1.5*u,N*.25);O(m.blur,v,{src:I,step:[1/r,0],radius:_,read:1,write:0}),O(m.blur,A,{src:v.tex,step:[0,1/s],radius:_,read:1,write:0}),O(m.blur,v,{src:A.tex,step:[1/r,0],radius:N*3,read:1,write:1}),O(m.blur,A,{src:v.tex,step:[0,1/s],radius:N*3,read:2,write:1})},ze=()=>{let i=P;if(!i||!T)return;if(L){let h=ct();h&&ft(h.cnv,h.w,h.h,h.fontPx,h.scale);return}let r=l.getBoundingClientRect(),s=p?1:Math.min(window.devicePixelRatio||1,1.5),f=Math.max(1,Math.round(r.width*s)),u=Math.max(1,Math.round(r.height*s)),_=Array.from(i.querySelectorAll(".ghr-word")),d=_.map(h=>h.getBoundingClientRect()),S=getComputedStyle(i),Q=[f,u,s,S.font,S.letterSpacing].concat(_.map((h,y)=>(h.textContent||"")+"@"+Math.round(d[y].left-r.left)+","+Math.round(d[y].top-r.top))).join("|");if(Q===de)return;de=Q;let q=document.createElement("canvas");q.width=f,q.height=u;let M=q.getContext("2d");if(!M)return;M.fillStyle="#000",M.fillRect(0,0,f,u);let W=parseFloat(S.fontSize)||64;if(M.setTransform(s,0,0,s,0,0),M.font=S.fontStyle+" "+S.fontWeight+" "+S.fontSize+" "+S.fontFamily,"letterSpacing"in M&&(M.letterSpacing=S.letterSpacing==="normal"?"0px":S.letterSpacing),M.fillStyle="#fff",M.textBaseline="alphabetic",_.forEach((h,y)=>{let z=h.textContent||"",oe=M.measureText(z).fontBoundingBoxAscent||W*.8;M.fillText(z,d[y].left-r.left,d[y].top-r.top+oe)}),I||(I=e.createTexture()),e.bindTexture(e.TEXTURE_2D,I),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,q),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!v||v.w!==f||v.h!==u){for(let h of[v,A])h&&(e.deleteTexture(h.tex),e.deleteFramebuffer(h.fbo));v=$(f,u,!0),A=$(f,u,!0)}N=Se(W,s),!(!v||!A)&&(O(m.blur,v,{src:I,step:[1/f,0],radius:N,read:0,write:0}),O(m.blur,A,{src:v.tex,step:[0,1/u],radius:N,read:1,write:0}),O(m.blur,v,{src:A.tex,step:[1/f,0],radius:N*3,read:1,write:1}),O(m.blur,A,{src:v.tex,step:[0,1/u],radius:N*3,read:2,write:1}))},he=()=>{let i=L&&ge?.35:p?L?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),r=Math.max(1,Math.round(E.clientWidth*i)),s=Math.max(1,Math.round(E.clientHeight*i));(E.width!==r||E.height!==s)&&(E.width=r,E.height=s);let f=p?.25:.4,u=Math.max(1,Math.round(r*f)),_=Math.max(1,Math.round(s*f));(!T||T.w!==u||T.h!==_)&&(T&&(e.deleteTexture(T.tex),e.deleteFramebuffer(T.fbo)),T=$(u,_,!1)),ze()},ut=()=>{if(!T||!A)return;let i=rt.palette,r=E.width/E.height;O(m.field,T,{time:a,aspect:r,octaves:p?3:5,c0:i[0],c1:i[1],c2:i[2],c3:i[3],c4:i[4]}),O(m.glass,null,{field:T.tex,height:A.tex,htexel:[1/A.w,1/A.h],bevel:N,aspect:r,light:[C.x,C.y],glass:1,form:H||D.matches||k<0?1:bt(performance.now()-k,1100),res:[E.width,E.height],shift:L?(H?xe():window.scrollY||0)/Math.max(1,E.clientHeight):0,nahtlos:se?1:0}),U.bilder++},ae=()=>(L||c)&&!document.hidden&&!D.matches,Ne=0,ge=!1,Oe=i=>{if(o=0,n)return;let r=(i-g)/1e3;g=i;let s=Math.min(r,.1);!p&&w<40&&ae()&&(w+=1,w>3&&r>.05&&(x+=r>.15?3:1),x>=8&&(p=!0,U.lite=!0,b.setAttribute("data-glas-lite","true"),he()));let f=L?Math.min(Math.max((window.scrollY||0)/Math.max(1,E.clientHeight),0),1):0;ae()&&(a+=s*(1-.7*f));let u=Y,_=(i-u.at)/1e3>2.5,[d,S]=_&&ae()?vt(a):[u.x,u.y];if(C.x=Ze(C.x,d,s,_?1.2:7),C.y=Ze(C.y,S,s,_?1.2:7),L&&!se){let h=f>=1?!0:f<.97?!1:ge;h!==ge&&(ge=h,he())}L&&f>=1&&ae()&&i-Ne<40||(ut(),Ne=i);let q=Math.abs(C.x-d)+Math.abs(C.y-S)>.0015,M=(L||c)&&!document.hidden,W=k>=0&&performance.now()-k<1100;M&&(ae()||q||W)&&(o=requestAnimationFrame(Oe))},G=()=>{o||n||(g=performance.now(),o=requestAnimationFrame(Oe))};Y.kick=G,Y.rebuild=()=>{n||(ze(),G())};let Ge=i=>{i.preventDefault(),cancelAnimationFrame(o),o=0},qe=()=>ye();E.addEventListener("webglcontextlost",Ge),E.addEventListener("webglcontextrestored",qe);try{m={field:K(Ke),blur:K(L?Pe:me),glass:K(L?Z:Ae)};let i=e.createVertexArray();e.bindVertexArray(i);let r=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),he()}catch{return}l.setAttribute("data-glass","true"),U.glas=!0,k=performance.now(),G();let Te=0,Fe=new ResizeObserver(()=>{cancelAnimationFrame(Te),Te=requestAnimationFrame(()=>{n||(he(),G())})});Fe.observe(l),L&&Fe.observe(E);let We=()=>G();L&&window.addEventListener("scroll",We,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>Y.rebuild());let He=new IntersectionObserver(([i])=>{c=i.isIntersecting,c&&G()});He.observe(l);let Ye=()=>!document.hidden&&G();document.addEventListener("visibilitychange",Ye),D.addEventListener("change",G),fe=()=>{n=!0,cancelAnimationFrame(o),cancelAnimationFrame(Te),Fe.disconnect(),He.disconnect(),window.removeEventListener("scroll",We),document.removeEventListener("visibilitychange",Ye),D.removeEventListener("change",G),E.removeEventListener("webglcontextlost",Ge),E.removeEventListener("webglcontextrestored",qe),F(),I&&e.deleteTexture(I);for(let i of Object.values(m||{}))e.deleteProgram(i.prog);l.setAttribute("data-glass","false"),U.glas=!1}}if(l.addEventListener("pointermove",e=>{let t=(j&&E.isConnected?E:l).getBoundingClientRect();Y.x=(e.clientX-t.left)/t.width,Y.y=1-(e.clientY-t.top)/t.height,Y.at=performance.now(),Y.kick()}),l.setAttribute("data-glass","false"),H){let e=!1,t=()=>{e||(e=!0,b.classList.add("glas-schrift-da"),ue(),ye(),U.glas||b.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500);let n=0;window.addEventListener("scroll",()=>{U.glas||n||(n=requestAnimationFrame(()=>{n=0,xe()}))},{passive:!0})}else ye();let Be=performance.now(),Xe=0;setInterval(()=>{let e=U.bilder;U.fps=Math.round((e-Xe)*1e3/Math.max(1,performance.now()-Be)),Xe=e,Be=performance.now()},1e3),window.__glas={zustand:()=>({glas:U.glas,lite:U.lite,fps:U.fps,angebote:Ce,masken:U.masken||0,versatz:J,ruhe:H,titel:P.textContent,punkt:b.getAttribute("data-glas-punkt")||"glas"}),zumKontakt:Ee,zuAngeboten:_e}})();})();
