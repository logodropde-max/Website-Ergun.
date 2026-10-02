(()=>{var $e=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,Ae=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,Qe=Ae+`uniform float u_time;
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
}`,pe=Ae+`uniform sampler2D u_src;
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
}`,Le=Ae+`uniform sampler2D u_field;
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
}`;var bt=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function Ze(l){let x=/^#?([0-9a-f]{6})$/i.exec(l.trim());if(!x)return null;let R=parseInt(x[1],16);return[(R>>16&255)/255,(R>>8&255)/255,(R&255)/255]}function vt(l){return bt.map((x,R)=>Ze((l&&l[R])!=null?l[R]:"")||Ze(x))}function Se(l,x){return Math.max(2,l*.075*x)}function _t(l,x){let R=Math.min(Math.max(l/x,0),1);return 1-Math.pow(1-R,3)}function et(l){let x=(R,ie)=>"rgba("+R.map(te=>Math.round(te*255)).join(",")+","+ie+")";return"radial-gradient(60% 50% at 25% 30%,"+x(l[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+x(l[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+x(l[2],.27)+",transparent 70%),"+x(l[0],1)}function tt(l,x,R,ie){return x+(l-x)*Math.exp(-ie*R)}function Et(l){return[.5+.32*Math.sin(l*.37),.56+.16*Math.sin(l*.53+1.1)]}(function(){let l=document.querySelector("[data-glas-root]");if(!l)return;let x=document.documentElement,R=new URLSearchParams(location.search),te=vt(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),w=l.querySelector("[data-glas-canvas]"),D=l.querySelector("[data-glas-titel]"),j=x.classList.contains("glas-fein"),se=j&&x.classList.contains("glas-nahtlos"),B=j&&x.classList.contains("ruhe"),le=B?l.querySelector(".ghr-content"):null,J=0,Me=window.innerWidth,ke=Math.min(window.devicePixelRatio||1,2),Ue=window.matchMedia("(max-width: 899px)").matches;function ce(){if(!le)return J;let e=Math.round((window.scrollY||0)*ke)/ke;return(e!==J||!le.style.transform)&&(J=e,le.style.transform="translate3d(0,"+-e+"px,0)",le.style.visibility=e>l.offsetHeight+40?"hidden":""),J}B&&(x.classList.add("glas-ruhe"),ce());let z=(e,t)=>(t||document).querySelector(e),be=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function V(e,t,n){let r=document.createElement(e);return t&&(r.className=t),n!=null&&(r.textContent=n),r}l.style.height="100svh",l.style.background=et(te);let ne=null;if(j&&(ne=V("div","glas-buehne"),ne.setAttribute("aria-hidden","true"),ne.style.background=et(te),ne.appendChild(w),document.body.insertBefore(ne,document.body.firstChild),l.style.background="transparent",R.get("punkt")!=="orange"&&(D.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),R.get("punkt")==="orange"&&(D.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',x.setAttribute("data-glas-punkt","orange")),se&&R.get("text")!=="b"){let e=l.querySelector("[data-glas-text]");e&&(e.textContent="Websites und Automatisierung",e.classList.add("glas-unterzeile"))}if(R.get("text")==="b"){let e=l.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=z(e);t&&t.remove()});let re=z("main#inhalt"),fe=window.PREISE,ve=V("footer","glas-fuss");ve.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span><nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p>',re&&re.parentNode.insertBefore(ve,re.nextSibling),fe&&fe.klein&&(z("[data-glas-klein]",ve).textContent=fe.klein+" "+(fe.steuer||""));function nt(){let e=z("[data-glas-kopf]");return e?e.offsetHeight:0}function rt(e){let t=0;for(let n=e;n;n=n.offsetParent)t+=n.offsetTop;return t}let Ce=window.matchMedia("(prefers-reduced-motion: reduce)");function De(e){e&&window.scrollTo({top:Math.max(0,rt(e)-nt()-20),behavior:Ce.matches?"auto":"smooth"})}function _e(){De(z("#angebote"))}function Ee(){let e=z("#preise .mf__oben");De(e&&!e.hidden?e:z("#preise .mf__raster"))}window.__kristall={zumKontakt:Ee,zuAngeboten:_e},document.addEventListener("click",e=>{if(j&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:Ce.matches?"auto":"smooth"});return}let n=e.target.closest&&e.target.closest("[data-glas-ziel]");n&&(e.preventDefault(),n.getAttribute("data-glas-ziel")==="kontakt"?Ee():_e())});let Pe=!1;function at(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),be(".k-angebot",e).forEach(n=>{let r=z(".k-angebot__wort",n),m=z(".k-angebot__info",n),o=m&&m.querySelector("b")?m.querySelector("b").textContent.trim():"",c=m?m.textContent.replace(o,"").replace(/^\s*·\s*/,"").trim():"",g=o.split(" + ");n.classList.add("glas-karte"),n.innerHTML="",n.appendChild(V("span","k-angebot__wort glas-karte__titel",r?r.textContent:"")),n.appendChild(V("span","glas-karte__satz",c));let E=V("span","glas-karte__preis");E.appendChild(V("b","",g[0])),g[1]&&E.appendChild(V("small","","+ "+g.slice(1).join(" + "))),n.appendChild(E)}),Pe=!0,!0}if((function e(t){!at()&&t<60&&setTimeout(()=>e(t+1),50)})(0),re){re.classList.add("glas-haupt");let e=z("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=z("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(n=>{n.isIntersecting&&(n.target.classList.add("ist-da"),e.unobserve(n.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>be(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else x.classList.add("glas-alles-da");let ot={palette:te,title:D.textContent},X={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},S={glas:!1,lite:!1,fps:0,bilder:0},ue=null,Ie=pe.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),Z=Le.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`);se&&(Z=Z.replace("uniform float u_shift;",`uniform float u_shift;
uniform float u_nahtlos;`).replace(`  o = vec4(col, 1.0);
}`,`  float yDoc = (1.0 - uv.y) + u_shift;
  float tief = smoothstep(0.55, 1.5, yDoc) * u_nahtlos;
  float mitte = exp(-pow((uv.x - 0.5) / 0.42, 2.0));
  col *= mix(1.0, 0.36 - 0.1 * mitte, tief);
  o = vec4(col, 1.0);
}`));let we=R.get("glasdbg");j&&we&&(Z=Z.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(we==="g"?"dh.g":we==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`));let it=Ie===pe||Z.indexOf("u_shift")<0,M=j&&!it,st=.06;function lt(){let e=be(".glas-z",D);if(e.length<2)return;e.forEach(o=>{o.style.marginLeft=""});let t=getComputedStyle(D),n=parseFloat(t.fontSize)||64,r=document.createElement("canvas").getContext("2d");if(!r)return;r.font=t.fontStyle+" "+t.fontWeight+" "+n+"px "+t.fontFamily,"letterSpacing"in r&&(r.letterSpacing="0px");let m=e.map(o=>{let c=o.getBoundingClientRect(),g=r.measureText(o.textContent);return[c.left-g.actualBoundingBoxLeft,c.left+g.actualBoundingBoxRight]});for(let o=1;o<e.length;o++)e[o].style.marginLeft=((st*n-(m[o][0]-m[o-1][1]))/n).toFixed(4)+"em"}function de(){if(!M)return;D.style.fontSize="",lt();let e=D.querySelector(".ghr-word");if(!e)return;let t=parseFloat(getComputedStyle(D).fontSize)||64,n=e.getBoundingClientRect().width,r=t*.16,m=l.clientWidth*(1-2*.06);n+r>m&&(D.style.fontSize=(t*m/(n+r)).toFixed(2)+"px")}M&&(de(),window.addEventListener("resize",()=>{B&&window.innerWidth===Me||(Me=window.innerWidth,de())}));function Be(e,t,n,r,m){let o=0;r[0]=0,m[0]=-1e20,m[1]=1e20;for(let c=1;c<t;c++){let g=(e[c]+c*c-(e[r[o]]+r[o]*r[o]))/(2*c-2*r[o]);for(;g<=m[o];)o--,g=(e[c]+c*c-(e[r[o]]+r[o]*r[o]))/(2*c-2*r[o]);o++,r[o]=c,m[o]=g,m[o+1]=1e20}o=0;for(let c=0;c<t;c++){for(;m[o+1]<c;)o++;n[c]=(c-r[o])*(c-r[o])+e[r[o]]}}function ze(e,t,n){let r=Math.max(t,n),m=new Float64Array(r),o=new Float64Array(r),c=new Int32Array(r),g=new Float64Array(r+1);for(let E=0;E<t;E++){for(let b=0;b<n;b++)m[b]=e[b*t+E];Be(m,n,o,c,g);for(let b=0;b<n;b++)e[b*t+E]=o[b]}for(let E=0;E<n;E++){for(let b=0;b<t;b++)m[b]=e[E*t+b];Be(m,t,o,c,g);for(let b=0;b<t;b++)e[E*t+b]=o[b]}return e}function ct(e){let t=Math.abs(e)/Math.SQRT2,n=1/(1+.3275911*t),r=1-((((1.061405429*n-1.453152027)*n+1.421413741)*n-.284496736)*n+.254829592)*n*Math.exp(-t*t);return e>=0?.5*(1+r):.5*(1-r)}function ft(e,t,n,r){let m=e.getImageData(0,0,t,n),o=m.data,c=t,g=n,E=-1,b=-1;for(let F=0;F<n;F++)for(let p=0;p<t;p++)o[(F*t+p)*4]>0&&(p<c&&(c=p),p>E&&(E=p),F<g&&(g=F),F>b&&(b=F));if(E<0)return;let C=Math.ceil(r*2.5)+2;c=Math.max(0,c-C),g=Math.max(0,g-C),E=Math.min(t-1,E+C),b=Math.min(n-1,b+C);let U=E-c+1,P=b-g+1,ee=new Float64Array(U*P),K=new Float64Array(U*P),N=new Float32Array(U*P);for(let F=0;F<P;F++)for(let p=0;p<U;p++){let T=F*U+p,v=o[((F+g)*t+p+c)*4]/255;N[T]=v,ee[T]=v<.5?0:1e20,K[T]=v>=.5?0:1e20}ze(ee,U,P),ze(K,U,P);let $=Math.max(r*.5,.5);for(let F=0;F<P;F++)for(let p=0;p<U;p++){let T=F*U+p,v=((F+g)*t+p+c)*4,A=N[T]>=.5?Math.sqrt(ee[T])-.5:.5-Math.sqrt(K[T]),I=Math.abs(A)<1?N[T]-.5:A;o[v]=Math.round(ct(I/$)*255),o[v+1]=Math.round(N[T]*255),o[v+2]=0}e.putImageData(m,0,0)}function ye(){ue&&(ue(),ue=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:w.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||M&&!!e.getExtension("EXT_color_buffer_half_float"),n=!1,r=0,m=0,o=0,c=!0,g=!1,E=0,b=0,C={x:.5,y:.56},U=-1,P=window.matchMedia("(prefers-reduced-motion: reduce)"),ee=(i,a)=>{let s=e.createShader(i);if(!s)throw new Error("could not create shader");if(e.shaderSource(s,a),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(s));return s},K=i=>{let a=e.createProgram();if(!a)throw new Error("could not create program");let s=ee(e.VERTEX_SHADER,$e),f=ee(e.FRAGMENT_SHADER,i);if(e.attachShader(a,s),e.attachShader(a,f),e.bindAttribLocation(a,0,"a_position"),e.linkProgram(a),e.deleteShader(s),e.deleteShader(f),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(a));let u={},_=e.getProgramParameter(a,e.ACTIVE_UNIFORMS);for(let d=0;d<_;d++){let L=e.getActiveUniform(a,d);L&&(u[L.name.replace(/^u_/,"")]=e.getUniformLocation(a,L.name))}return{prog:a,u}},N={tex:[],fbo:[]},$=(i,a,s)=>{let f=e.createTexture(),u=e.createFramebuffer();if(!f||!u)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),s&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,i,a,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,i,a,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,f,0),N.tex.push(f),N.fbo.push(u),{tex:f,fbo:u,w:i,h:a}},F=()=>{for(let i of N.tex)e.deleteTexture(i);for(let i of N.fbo)e.deleteFramebuffer(i);N.tex=[],N.fbo=[]},p=null,T=null,v=null,A=null,I=null,G=4,q=(i,a,s)=>{e.useProgram(i.prog);let f=0;for(let u in s){let _=i.u[u];if(!_)continue;let d=s[u];typeof d=="number"?e.uniform1f(_,d):Array.isArray(d)?d.length===2?e.uniform2f(_,d[0],d[1]):e.uniform3f(_,d[0],d[1],d[2]):(e.activeTexture(e.TEXTURE0+f),e.bindTexture(e.TEXTURE_2D,d),e.uniform1i(_,f++))}e.bindFramebuffer(e.FRAMEBUFFER,a?a.fbo:null),e.viewport(0,0,a?a.w:w.width,a?a.h:w.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},he="",ut=()=>{de();let i=D,a=w.getBoundingClientRect(),s=g?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),f=Math.max(1,Math.round(a.width*s)),u=Math.max(1,Math.round(a.height*s)),_=getComputedStyle(i),d=parseFloat(_.fontSize)||64,L=B?J:window.scrollY||0,Q=[],H=document.createTreeWalker(i,NodeFilter.SHOW_TEXT);for(let y=H.nextNode();y;y=H.nextNode())for(let O=0;O<y.data.length;O++){if(/\s/.test(y.data[O]))continue;let oe=document.createRange();oe.setStart(y,O),oe.setEnd(y,O+1);let Ke=oe.getBoundingClientRect();Q.push([y.data[O],Ke.left-a.left,Ke.top+L])}let k=[f,u,s,_.font].concat(Q.map(y=>y[0]+"@"+y[1].toFixed(1)+","+y[2].toFixed(1))).join("|");if(k===he)return;he=k;let Y=document.createElement("canvas");Y.width=f,Y.height=u;let h=Y.getContext("2d");if(h)return h.fillStyle="#000",h.fillRect(0,0,f,u),h.font=_.fontStyle+" "+_.fontWeight+" "+(d*s).toFixed(2)+"px "+_.fontFamily,"letterSpacing"in h&&(h.letterSpacing="0px"),h.fillStyle="#fff",h.textBaseline="alphabetic",Q.forEach(y=>{let O=h.measureText(y[0]).fontBoundingBoxAscent||d*s*.8;h.fillText(y[0],y[1]*s,y[2]*s+O)}),ft(h,f,u,Se(d,s)),{cnv:Y,w:f,h:u,fontPx:d,scale:s}},dt=(i,a,s,f,u)=>{if(S.masken=(S.masken||0)+1,I||(I=e.createTexture()),e.bindTexture(e.TEXTURE_2D,I),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!v||v.w!==a||v.h!==s){for(let d of[v,A])d&&(e.deleteTexture(d.tex),e.deleteFramebuffer(d.fbo));v=$(a,s,!0),A=$(a,s,!0)}G=Se(f,u);let _=Math.max(1.5*u,G*.25);q(p.blur,v,{src:I,step:[1/a,0],radius:_,read:1,write:0}),q(p.blur,A,{src:v.tex,step:[0,1/s],radius:_,read:1,write:0}),q(p.blur,v,{src:A.tex,step:[1/a,0],radius:G*3,read:1,write:1}),q(p.blur,A,{src:v.tex,step:[0,1/s],radius:G*3,read:2,write:1})},Oe=()=>{let i=D;if(!i||!T)return;if(M){let h=ut();h&&dt(h.cnv,h.w,h.h,h.fontPx,h.scale);return}let a=l.getBoundingClientRect(),s=g?1:Math.min(window.devicePixelRatio||1,1.5),f=Math.max(1,Math.round(a.width*s)),u=Math.max(1,Math.round(a.height*s)),_=Array.from(i.querySelectorAll(".ghr-word")),d=_.map(h=>h.getBoundingClientRect()),L=getComputedStyle(i),Q=[f,u,s,L.font,L.letterSpacing].concat(_.map((h,y)=>(h.textContent||"")+"@"+Math.round(d[y].left-a.left)+","+Math.round(d[y].top-a.top))).join("|");if(Q===he)return;he=Q;let H=document.createElement("canvas");H.width=f,H.height=u;let k=H.getContext("2d");if(!k)return;k.fillStyle="#000",k.fillRect(0,0,f,u);let Y=parseFloat(L.fontSize)||64;if(k.setTransform(s,0,0,s,0,0),k.font=L.fontStyle+" "+L.fontWeight+" "+L.fontSize+" "+L.fontFamily,"letterSpacing"in k&&(k.letterSpacing=L.letterSpacing==="normal"?"0px":L.letterSpacing),k.fillStyle="#fff",k.textBaseline="alphabetic",_.forEach((h,y)=>{let O=h.textContent||"",oe=k.measureText(O).fontBoundingBoxAscent||Y*.8;k.fillText(O,d[y].left-a.left,d[y].top-a.top+oe)}),I||(I=e.createTexture()),e.bindTexture(e.TEXTURE_2D,I),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,H),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!v||v.w!==f||v.h!==u){for(let h of[v,A])h&&(e.deleteTexture(h.tex),e.deleteFramebuffer(h.fbo));v=$(f,u,!0),A=$(f,u,!0)}G=Se(Y,s),!(!v||!A)&&(q(p.blur,v,{src:I,step:[1/f,0],radius:G,read:0,write:0}),q(p.blur,A,{src:v.tex,step:[0,1/u],radius:G,read:1,write:0}),q(p.blur,v,{src:A.tex,step:[1/f,0],radius:G*3,read:1,write:1}),q(p.blur,A,{src:v.tex,step:[0,1/u],radius:G*3,read:2,write:1}))},me=()=>{let i=M&&ge?.35:B&&Ue&&!g?Math.min(window.devicePixelRatio||1,1.5):g?M?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),a=Math.max(1,Math.round(w.clientWidth*i)),s=Math.max(1,Math.round(w.clientHeight*i));(w.width!==a||w.height!==s)&&(w.width=a,w.height=s);let f=g?.25:.4,u=Math.max(1,Math.round(a*f)),_=Math.max(1,Math.round(s*f));(!T||T.w!==u||T.h!==_)&&(T&&(e.deleteTexture(T.tex),e.deleteFramebuffer(T.fbo)),T=$(u,_,!1)),Oe()},ht=()=>{if(!T||!A)return;let i=ot.palette,a=w.width/w.height;q(p.field,T,{time:o,aspect:a,octaves:g?3:B&&Ue?4:5,c0:i[0],c1:i[1],c2:i[2],c3:i[3],c4:i[4]}),q(p.glass,null,{field:T.tex,height:A.tex,htexel:[1/A.w,1/A.h],bevel:G,aspect:a,light:[C.x,C.y],glass:1,form:B||P.matches||U<0?1:_t(performance.now()-U,1100),res:[w.width,w.height],shift:M?(B?ce():window.scrollY||0)/Math.max(1,w.clientHeight):0,nahtlos:se?1:0}),S.bilder++},ae=()=>(M||c)&&!document.hidden&&!P.matches,Ge=0,ge=!1,qe=i=>{if(r=0,Te=performance.now(),n)return;let a=(i-m)/1e3;m=i;let s=Math.min(a,.1);!g&&E<40&&ae()&&(E+=1,S.geprueft=E,E>3&&a>.05&&(b+=a>.15?3:1),b>=8&&(g=!0,S.lite=!0,x.setAttribute("data-glas-lite","true"),me()));let f=M?Math.min(Math.max((window.scrollY||0)/Math.max(1,w.clientHeight),0),1):0;ae()&&!x.classList.contains("glas-laden")&&(o+=s*(1-.7*f));let u=X,_=(i-u.at)/1e3>2.5,[d,L]=_&&ae()?Et(o):[u.x,u.y];if(C.x=tt(C.x,d,s,_?1.2:7),C.y=tt(C.y,L,s,_?1.2:7),M&&!se){let h=f>=1?!0:f<.97?!1:ge;h!==ge&&(ge=h,me())}M&&!B&&f>=1&&ae()&&i-Ge<40||(ht(),Ge=i);let H=Math.abs(C.x-d)+Math.abs(C.y-L)>.0015,k=(M||c)&&!document.hidden,Y=U>=0&&performance.now()-U<1100;k&&(ae()||H||Y)&&(r=requestAnimationFrame(qe))},Te=0,W=()=>{n||(r&&performance.now()-Te>500&&(cancelAnimationFrame(r),r=0),!r&&(m=Te=performance.now(),r=requestAnimationFrame(qe)))};X.neustart=()=>{n||(cancelAnimationFrame(r),r=0,W())},X.kick=W,X.rebuild=()=>{n||(Oe(),W())};let We=i=>{i.preventDefault(),cancelAnimationFrame(r),r=0},He=()=>ye();w.addEventListener("webglcontextlost",We),w.addEventListener("webglcontextrestored",He);try{p={field:K(Qe),blur:K(M?Ie:pe),glass:K(M?Z:Le)};let i=e.createVertexArray();e.bindVertexArray(i);let a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),me()}catch{return}l.setAttribute("data-glass","true"),S.glas=!0,U=performance.now(),W();let Fe=0,Re=new ResizeObserver(()=>{cancelAnimationFrame(Fe),Fe=requestAnimationFrame(()=>{n||(me(),W())})});Re.observe(l),M&&Re.observe(w);let Ye=()=>W();M&&window.addEventListener("scroll",Ye,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>X.rebuild());let je=new IntersectionObserver(([i])=>{c=i.isIntersecting,c&&W()});je.observe(l);let Ve=()=>!document.hidden&&W();document.addEventListener("visibilitychange",Ve),P.addEventListener("change",W),ue=()=>{n=!0,cancelAnimationFrame(r),cancelAnimationFrame(Fe),Re.disconnect(),je.disconnect(),window.removeEventListener("scroll",Ye),document.removeEventListener("visibilitychange",Ve),P.removeEventListener("change",W),w.removeEventListener("webglcontextlost",We),w.removeEventListener("webglcontextrestored",He),F(),I&&e.deleteTexture(I);for(let i of Object.values(p||{}))e.deleteProgram(i.prog);l.setAttribute("data-glass","false"),S.glas=!1}}if(l.addEventListener("pointermove",e=>{let t=(j&&w.isConnected?w:l).getBoundingClientRect();X.x=(e.clientX-t.left)/t.width,X.y=1-(e.clientY-t.top)/t.height,X.at=performance.now(),X.kick()}),l.setAttribute("data-glass","false"),B){let e=!1,t=()=>{e||(e=!0,x.classList.add("glas-schrift-da"),de(),ye(),S.glas||x.classList.add("glas-ohne"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t(),setTimeout(t,2500);let n=0;window.addEventListener("scroll",()=>{n||(n=requestAnimationFrame(()=>{n=0,ce()}))},{passive:!0});let r=()=>{ce(),X.neustart&&X.neustart()};window.addEventListener("pageshow",r),document.addEventListener("visibilitychange",()=>{document.hidden||r()}),window.addEventListener("focus",r)}else ye();let Xe=performance.now(),Ne=0;setInterval(()=>{let e=S.bilder;S.fps=Math.round((e-Ne)*1e3/Math.max(1,performance.now()-Xe)),Ne=e,Xe=performance.now()},1e3),window.__glas={zustand:()=>({glas:S.glas,lite:S.lite,fps:S.fps,bilder:S.bilder,geprueft:S.geprueft||0,angebote:Pe,masken:S.masken||0,versatz:J,ruhe:B,titel:D.textContent,punkt:x.getAttribute("data-glas-punkt")||"glas"}),zumKontakt:Ee,zuAngeboten:_e}})();})();
