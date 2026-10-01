(()=>{var ze=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,_e=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,Ge=_e+`uniform float u_time;
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
}`,fe=_e+`uniform sampler2D u_src;
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
}`,Ee=_e+`uniform sampler2D u_field;
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
}`;var ct=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function We(c){let w=/^#?([0-9a-f]{6})$/i.exec(c.trim());if(!w)return null;let S=parseInt(w[1],16);return[(S>>16&255)/255,(S>>8&255)/255,(S&255)/255]}function ft(c){return ct.map((w,S)=>We((c&&c[S])!=null?c[S]:"")||We(w))}function we(c,w){return Math.max(2,c*.075*w)}function ut(c,w){let S=Math.min(Math.max(c/w,0),1);return 1-Math.pow(1-S,3)}function Ye(c){let w=(S,ne)=>"rgba("+S.map(Q=>Math.round(Q*255)).join(",")+","+ne+")";return"radial-gradient(60% 50% at 25% 30%,"+w(c[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+w(c[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+w(c[2],.27)+",transparent 70%),"+w(c[0],1)}function He(c,w,S,ne){return w+(c-w)*Math.exp(-ne*S)}function dt(c){return[.5+.32*Math.sin(c*.37),.56+.16*Math.sin(c*.53+1.1)]}(function(){let c=document.querySelector("[data-glas-root]");if(!c)return;let w=document.documentElement,S=new URLSearchParams(location.search),Q=ft(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),_=c.querySelector("[data-glas-canvas]"),C=c.querySelector("[data-glas-titel]"),J=w.classList.contains("glas-fein"),I=(e,t)=>(t||document).querySelector(e),de=(e,t)=>[].slice.call((t||document).querySelectorAll(e));function H(e,t,r){let o=document.createElement(e);return t&&(o.className=t),r!=null&&(o.textContent=r),o}c.style.height="100svh",c.style.background=Ye(Q);let Z=null;if(J&&(Z=H("div","glas-buehne"),Z.setAttribute("aria-hidden","true"),Z.style.background=Ye(Q),Z.appendChild(_),document.body.insertBefore(Z,document.body.firstChild),c.style.background="transparent",S.get("punkt")!=="orange"&&(C.innerHTML='<span class="ghr-word">'+"ERGUN.".split("").map(e=>'<span class="glas-z">'+e+"</span>").join("")+"</span>")),S.get("punkt")==="orange"&&(C.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',w.setAttribute("data-glas-punkt","orange")),S.get("text")==="b"){let e=c.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let t=I(e);t&&t.remove()});let ee=I("main#inhalt"),ae=window.PREISE,he=H("footer","glas-fuss");he.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span><nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p><p class="glas-fuss__klein glas-fuss__quellen">Bilder der Planeten der Fassung \u201EAll\u201C: Erde \u2013 NASA (gemeinfrei) \xB7 Saturn \u2013 <a href="https://www.solarsystemscope.com/textures/" rel="noopener" target="_blank">Solar System Scope</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a></p>',ee&&ee.parentNode.insertBefore(he,ee.nextSibling),ae&&ae.klein&&(I("[data-glas-klein]",he).textContent=ae.klein+" "+(ae.steuer||""));function je(){let e=I("[data-glas-kopf]");return e?e.offsetHeight:0}function Ve(e){let t=0;for(let r=e;r;r=r.offsetParent)t+=r.offsetTop;return t}let Te=window.matchMedia("(prefers-reduced-motion: reduce)");function ye(e){e&&window.scrollTo({top:Math.max(0,Ve(e)-je()-20),behavior:Te.matches?"auto":"smooth"})}function ge(){ye(I("#angebote"))}function me(){let e=I("#preise .mf__oben");ye(e&&!e.hidden?e:I("#preise .mf__raster"))}window.__kristall={zumKontakt:me,zuAngeboten:ge},document.addEventListener("click",e=>{if(J&&e.target.closest&&e.target.closest(".glas-kopf__marke")){e.preventDefault(),window.scrollTo({top:0,behavior:Te.matches?"auto":"smooth"});return}let r=e.target.closest&&e.target.closest("[data-glas-ziel]");r&&(e.preventDefault(),r.getAttribute("data-glas-ziel")==="kontakt"?me():ge())});let Fe=!1;function Ke(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let t=e.querySelector("h2");return t&&(t.className="glas-h2",t.textContent="Was brauchen Sie?"),de(".k-angebot",e).forEach(r=>{let o=I(".k-angebot__wort",r),g=I(".k-angebot__info",r),a=g&&g.querySelector("b")?g.querySelector("b").textContent.trim():"",l=g?g.textContent.replace(a,"").replace(/^\s*·\s*/,"").trim():"",p=a.split(" + ");r.classList.add("glas-karte"),r.innerHTML="",r.appendChild(H("span","k-angebot__wort glas-karte__titel",o?o.textContent:"")),r.appendChild(H("span","glas-karte__satz",l));let E=H("span","glas-karte__preis");E.appendChild(H("b","",p[0])),p[1]&&E.appendChild(H("small","","+ "+p.slice(1).join(" + "))),r.appendChild(E)}),Fe=!0,!0}if((function e(t){!Ke()&&t<60&&setTimeout(()=>e(t+1),50)})(0),ee){ee.classList.add("glas-haupt");let e=I("#preise .mf__oben");e&&e.classList.add("glas-rein");let t=I("#preise .mf__raster");t&&t.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(t=>t.forEach(r=>{r.isIntersecting&&(r.target.classList.add("ist-da"),e.unobserve(r.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>de(".glas-rein, .glas-fuss").forEach(t=>e.observe(t)),60)}else w.classList.add("glas-alles-da");let $e={palette:Q,title:C.textContent},Y={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},z={glas:!1,lite:!1,fps:0,bilder:0},oe=null,Re=fe.replace("float x = float(i) * u_radius / 24.0;","float x = float(i) * u_radius * 1.5 / 24.0;"),ie=Ee.split("texture(u_height, ").join("texture(u_height, vec2(0.0, -u_shift) + ").replace("uniform vec2 u_res;",`uniform vec2 u_res;
uniform float u_shift;`),pe=S.get("glasdbg");J&&pe&&(ie=ie.replace(`o = vec4(col, 1.0);
}`,"vec4 dh = texture(u_height, vec2(0.0, -u_shift) + uv); o = vec4(pow(vec3("+(pe==="g"?"dh.g":pe==="b"?"dh.b":"dh.r")+`), vec3(0.25)), 1.0);
}`));let Qe=Re===fe||ie.indexOf("u_shift")<0,M=J&&!Qe,Je=.06;function Ze(){let e=de(".glas-z",C);if(e.length<2)return;e.forEach(a=>{a.style.marginLeft=""});let t=getComputedStyle(C),r=parseFloat(t.fontSize)||64,o=document.createElement("canvas").getContext("2d");if(!o)return;o.font=t.fontStyle+" "+t.fontWeight+" "+r+"px "+t.fontFamily,"letterSpacing"in o&&(o.letterSpacing="0px");let g=e.map(a=>{let l=a.getBoundingClientRect(),p=o.measureText(a.textContent);return[l.left-p.actualBoundingBoxLeft,l.left+p.actualBoundingBoxRight]});for(let a=1;a<e.length;a++)e[a].style.marginLeft=((Je*r-(g[a][0]-g[a-1][1]))/r).toFixed(4)+"em"}function xe(){if(!M)return;C.style.fontSize="",Ze();let e=C.querySelector(".ghr-word");if(!e)return;let t=parseFloat(getComputedStyle(C).fontSize)||64,r=e.getBoundingClientRect().width,o=t*.16,g=c.clientWidth*(1-2*.06);r+o>g&&(C.style.fontSize=(t*g/(r+o)).toFixed(2)+"px")}M&&(xe(),window.addEventListener("resize",xe));function Ae(e,t,r,o,g){let a=0;o[0]=0,g[0]=-1e20,g[1]=1e20;for(let l=1;l<t;l++){let p=(e[l]+l*l-(e[o[a]]+o[a]*o[a]))/(2*l-2*o[a]);for(;p<=g[a];)a--,p=(e[l]+l*l-(e[o[a]]+o[a]*o[a]))/(2*l-2*o[a]);a++,o[a]=l,g[a]=p,g[a+1]=1e20}a=0;for(let l=0;l<t;l++){for(;g[a+1]<l;)a++;r[l]=(l-o[a])*(l-o[a])+e[o[a]]}}function Se(e,t,r){let o=Math.max(t,r),g=new Float64Array(o),a=new Float64Array(o),l=new Int32Array(o),p=new Float64Array(o+1);for(let E=0;E<t;E++){for(let x=0;x<r;x++)g[x]=e[x*t+E];Ae(g,r,a,l,p);for(let x=0;x<r;x++)e[x*t+E]=a[x]}for(let E=0;E<r;E++){for(let x=0;x<t;x++)g[x]=e[E*t+x];Ae(g,t,a,l,p);for(let x=0;x<t;x++)e[E*t+x]=a[x]}return e}function et(e){let t=Math.abs(e)/Math.SQRT2,r=1/(1+.3275911*t),o=1-((((1.061405429*r-1.453152027)*r+1.421413741)*r-.284496736)*r+.254829592)*r*Math.exp(-t*t);return e>=0?.5*(1+o):.5*(1-o)}function tt(e,t,r,o){let g=e.getImageData(0,0,t,r),a=g.data,l=t,p=r,E=-1,x=-1;for(let F=0;F<r;F++)for(let m=0;m<t;m++)a[(F*t+m)*4]>0&&(m<l&&(l=m),m>E&&(E=m),F<p&&(p=F),F>x&&(x=F));if(E<0)return;let U=Math.ceil(o*2.5)+2;l=Math.max(0,l-U),p=Math.max(0,p-U),E=Math.min(t-1,E+U),x=Math.min(r-1,x+U);let k=E-l+1,P=x-p+1,$=new Float64Array(k*P),j=new Float64Array(k*P),B=new Float32Array(k*P);for(let F=0;F<P;F++)for(let m=0;m<k;m++){let y=F*k+m,b=a[((F+p)*t+m+l)*4]/255;B[y]=b,$[y]=b<.5?0:1e20,j[y]=b>=.5?0:1e20}Se($,k,P),Se(j,k,P);let V=Math.max(o*.5,.5);for(let F=0;F<P;F++)for(let m=0;m<k;m++){let y=F*k+m,b=((F+p)*t+m+l)*4,R=B[y]>=.5?Math.sqrt($[y])-.5:.5-Math.sqrt(j[y]),D=Math.abs(R)<1?B[y]-.5:R;a[b]=Math.round(et(D/V)*255),a[b+1]=Math.round(B[y]*255),a[b+2]=0}e.putImageData(g,0,0)}function Me(){oe&&(oe(),oe=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:_.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let t=!!e.getExtension("EXT_color_buffer_float")||M&&!!e.getExtension("EXT_color_buffer_half_float"),r=!1,o=0,g=0,a=0,l=!0,p=!1,E=0,x=0,U={x:.5,y:.56},k=-1,P=window.matchMedia("(prefers-reduced-motion: reduce)"),$=(i,n)=>{let s=e.createShader(i);if(!s)throw new Error("could not create shader");if(e.shaderSource(s,n),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(s));return s},j=i=>{let n=e.createProgram();if(!n)throw new Error("could not create program");let s=$(e.VERTEX_SHADER,ze),f=$(e.FRAGMENT_SHADER,i);if(e.attachShader(n,s),e.attachShader(n,f),e.bindAttribLocation(n,0,"a_position"),e.linkProgram(n),e.deleteShader(s),e.deleteShader(f),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(n));let u={},v=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let d=0;d<v;d++){let A=e.getActiveUniform(n,d);A&&(u[A.name.replace(/^u_/,"")]=e.getUniformLocation(n,A.name))}return{prog:n,u}},B={tex:[],fbo:[]},V=(i,n,s)=>{let f=e.createTexture(),u=e.createFramebuffer();if(!f||!u)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),s&&t?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,i,n,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,i,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,f,0),B.tex.push(f),B.fbo.push(u),{tex:f,fbo:u,w:i,h:n}},F=()=>{for(let i of B.tex)e.deleteTexture(i);for(let i of B.fbo)e.deleteFramebuffer(i);B.tex=[],B.fbo=[]},m=null,y=null,b=null,R=null,D=null,N=4,O=(i,n,s)=>{e.useProgram(i.prog);let f=0;for(let u in s){let v=i.u[u];if(!v)continue;let d=s[u];typeof d=="number"?e.uniform1f(v,d):Array.isArray(d)?d.length===2?e.uniform2f(v,d[0],d[1]):e.uniform3f(v,d[0],d[1],d[2]):(e.activeTexture(e.TEXTURE0+f),e.bindTexture(e.TEXTURE_2D,d),e.uniform1i(v,f++))}e.bindFramebuffer(e.FRAMEBUFFER,n?n.fbo:null),e.viewport(0,0,n?n.w:_.width,n?n.h:_.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},se="",rt=()=>{xe();let i=C,n=_.getBoundingClientRect(),s=p?Math.min(window.devicePixelRatio||1,1.25):Math.min(window.devicePixelRatio||1,2),f=Math.max(1,Math.round(n.width*s)),u=Math.max(1,Math.round(n.height*s)),v=getComputedStyle(i),d=parseFloat(v.fontSize)||64,A=window.scrollY||0,K=[],q=document.createTreeWalker(i,NodeFilter.SHOW_TEXT);for(let T=q.nextNode();T;T=q.nextNode())for(let X=0;X<T.data.length;X++){if(/\s/.test(T.data[X]))continue;let re=document.createRange();re.setStart(T,X),re.setEnd(T,X+1);let Oe=re.getBoundingClientRect();K.push([T.data[X],Oe.left-n.left,Oe.top+A])}let L=[f,u,s,v.font].concat(K.map(T=>T[0]+"@"+T[1].toFixed(1)+","+T[2].toFixed(1))).join("|");if(L===se)return;se=L;let W=document.createElement("canvas");W.width=f,W.height=u;let h=W.getContext("2d");if(h)return h.fillStyle="#000",h.fillRect(0,0,f,u),h.font=v.fontStyle+" "+v.fontWeight+" "+(d*s).toFixed(2)+"px "+v.fontFamily,"letterSpacing"in h&&(h.letterSpacing="0px"),h.fillStyle="#fff",h.textBaseline="alphabetic",K.forEach(T=>{let X=h.measureText(T[0]).fontBoundingBoxAscent||d*s*.8;h.fillText(T[0],T[1]*s,T[2]*s+X)}),tt(h,f,u,we(d,s)),{cnv:W,w:f,h:u,fontPx:d,scale:s}},nt=(i,n,s,f,u)=>{if(D||(D=e.createTexture()),e.bindTexture(e.TEXTURE_2D,D),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!b||b.w!==n||b.h!==s){for(let d of[b,R])d&&(e.deleteTexture(d.tex),e.deleteFramebuffer(d.fbo));b=V(n,s,!0),R=V(n,s,!0)}N=we(f,u);let v=Math.max(1.5*u,N*.25);O(m.blur,b,{src:D,step:[1/n,0],radius:v,read:1,write:0}),O(m.blur,R,{src:b.tex,step:[0,1/s],radius:v,read:1,write:0}),O(m.blur,b,{src:R.tex,step:[1/n,0],radius:N*3,read:1,write:1}),O(m.blur,R,{src:b.tex,step:[0,1/s],radius:N*3,read:2,write:1})},Ue=()=>{let i=C;if(!i||!y)return;if(M){let h=rt();h&&nt(h.cnv,h.w,h.h,h.fontPx,h.scale);return}let n=c.getBoundingClientRect(),s=p?1:Math.min(window.devicePixelRatio||1,1.5),f=Math.max(1,Math.round(n.width*s)),u=Math.max(1,Math.round(n.height*s)),v=Array.from(i.querySelectorAll(".ghr-word")),d=v.map(h=>h.getBoundingClientRect()),A=getComputedStyle(i),K=[f,u,s,A.font,A.letterSpacing].concat(v.map((h,T)=>(h.textContent||"")+"@"+Math.round(d[T].left-n.left)+","+Math.round(d[T].top-n.top))).join("|");if(K===se)return;se=K;let q=document.createElement("canvas");q.width=f,q.height=u;let L=q.getContext("2d");if(!L)return;L.fillStyle="#000",L.fillRect(0,0,f,u);let W=parseFloat(A.fontSize)||64;if(L.setTransform(s,0,0,s,0,0),L.font=A.fontStyle+" "+A.fontWeight+" "+A.fontSize+" "+A.fontFamily,"letterSpacing"in L&&(L.letterSpacing=A.letterSpacing==="normal"?"0px":A.letterSpacing),L.fillStyle="#fff",L.textBaseline="alphabetic",v.forEach((h,T)=>{let X=h.textContent||"",re=L.measureText(X).fontBoundingBoxAscent||W*.8;L.fillText(X,d[T].left-n.left,d[T].top-n.top+re)}),D||(D=e.createTexture()),e.bindTexture(e.TEXTURE_2D,D),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,q),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!b||b.w!==f||b.h!==u){for(let h of[b,R])h&&(e.deleteTexture(h.tex),e.deleteFramebuffer(h.fbo));b=V(f,u,!0),R=V(f,u,!0)}N=we(W,s),!(!b||!R)&&(O(m.blur,b,{src:D,step:[1/f,0],radius:N,read:0,write:0}),O(m.blur,R,{src:b.tex,step:[0,1/u],radius:N,read:1,write:0}),O(m.blur,b,{src:R.tex,step:[1/f,0],radius:N*3,read:1,write:1}),O(m.blur,R,{src:b.tex,step:[0,1/u],radius:N*3,read:2,write:1}))},le=()=>{let i=M&&ce?.35:p?M?Math.min(window.devicePixelRatio||1,1):.65:Math.min(window.devicePixelRatio||1,2),n=Math.max(1,Math.round(_.clientWidth*i)),s=Math.max(1,Math.round(_.clientHeight*i));(_.width!==n||_.height!==s)&&(_.width=n,_.height=s);let f=p?.25:.4,u=Math.max(1,Math.round(n*f)),v=Math.max(1,Math.round(s*f));(!y||y.w!==u||y.h!==v)&&(y&&(e.deleteTexture(y.tex),e.deleteFramebuffer(y.fbo)),y=V(u,v,!1)),Ue()},at=()=>{if(!y||!R)return;let i=$e.palette,n=_.width/_.height;O(m.field,y,{time:a,aspect:n,octaves:p?3:5,c0:i[0],c1:i[1],c2:i[2],c3:i[3],c4:i[4]}),O(m.glass,null,{field:y.tex,height:R.tex,htexel:[1/R.w,1/R.h],bevel:N,aspect:n,light:[U.x,U.y],glass:1,form:P.matches||k<0?1:ut(performance.now()-k,1100),res:[_.width,_.height],shift:M?(window.scrollY||0)/Math.max(1,_.clientHeight):0}),z.bilder++},te=()=>(M||l)&&!document.hidden&&!P.matches,Ce=0,ce=!1,Pe=i=>{if(o=0,r)return;let n=(i-g)/1e3;g=i;let s=Math.min(n,.1);!p&&E<40&&te()&&(E+=1,E>3&&n>.05&&(x+=n>.15?3:1),x>=8&&(p=!0,z.lite=!0,w.setAttribute("data-glas-lite","true"),le()));let f=M?Math.min(Math.max((window.scrollY||0)/Math.max(1,_.clientHeight),0),1):0;te()&&(a+=s*(1-.7*f));let u=Y,v=(i-u.at)/1e3>2.5,[d,A]=v&&te()?dt(a):[u.x,u.y];if(U.x=He(U.x,d,s,v?1.2:7),U.y=He(U.y,A,s,v?1.2:7),M){let h=f>=1?!0:f<.97?!1:ce;h!==ce&&(ce=h,le())}M&&f>=1&&te()&&i-Ce<40||(at(),Ce=i);let q=Math.abs(U.x-d)+Math.abs(U.y-A)>.0015,L=(M||l)&&!document.hidden,W=k>=0&&performance.now()-k<1100;L&&(te()||q||W)&&(o=requestAnimationFrame(Pe))},G=()=>{o||r||(g=performance.now(),o=requestAnimationFrame(Pe))};Y.kick=G,Y.rebuild=()=>{r||(Ue(),G())};let De=i=>{i.preventDefault(),cancelAnimationFrame(o),o=0},Ie=()=>Me();_.addEventListener("webglcontextlost",De),_.addEventListener("webglcontextrestored",Ie);try{m={field:j(Ge),blur:j(M?Re:fe),glass:j(M?ie:Ee)};let i=e.createVertexArray();e.bindVertexArray(i);let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),le()}catch{return}c.setAttribute("data-glass","true"),z.glas=!0,k=performance.now(),G();let be=0,ve=new ResizeObserver(()=>{cancelAnimationFrame(be),be=requestAnimationFrame(()=>{r||(le(),G())})});ve.observe(c),M&&ve.observe(_);let Be=()=>G();M&&window.addEventListener("scroll",Be,{passive:!0}),document.fonts&&document.fonts.ready.then(()=>Y.rebuild());let Xe=new IntersectionObserver(([i])=>{l=i.isIntersecting,l&&G()});Xe.observe(c);let Ne=()=>!document.hidden&&G();document.addEventListener("visibilitychange",Ne),P.addEventListener("change",G),oe=()=>{r=!0,cancelAnimationFrame(o),cancelAnimationFrame(be),ve.disconnect(),Xe.disconnect(),window.removeEventListener("scroll",Be),document.removeEventListener("visibilitychange",Ne),P.removeEventListener("change",G),_.removeEventListener("webglcontextlost",De),_.removeEventListener("webglcontextrestored",Ie),F(),D&&e.deleteTexture(D);for(let i of Object.values(m||{}))e.deleteProgram(i.prog);c.setAttribute("data-glass","false"),z.glas=!1}}c.addEventListener("pointermove",e=>{let t=(J&&_.isConnected?_:c).getBoundingClientRect();Y.x=(e.clientX-t.left)/t.width,Y.y=1-(e.clientY-t.top)/t.height,Y.at=performance.now(),Y.kick()}),c.setAttribute("data-glass","false"),Me();let Le=performance.now(),ke=0;setInterval(()=>{let e=z.bilder;z.fps=Math.round((e-ke)*1e3/Math.max(1,performance.now()-Le)),ke=e,Le=performance.now()},1e3),window.__glas={zustand:()=>({glas:z.glas,lite:z.lite,fps:z.fps,angebote:Fe,titel:C.textContent,punkt:w.getAttribute("data-glas-punkt")||"glas"}),zumKontakt:me,zuAngeboten:ge}})();})();
