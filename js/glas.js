(()=>{var Ee=`#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,re=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`,we=re+`uniform float u_time;
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
}`,Te=re+`uniform sampler2D u_src;
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
}`,ye=re+`uniform sampler2D u_field;
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
}`;var Ne=["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"];function Re(n){let f=/^#?([0-9a-f]{6})$/i.exec(n.trim());if(!f)return null;let h=parseInt(f[1],16);return[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255]}function qe(n){return Ne.map((f,h)=>Re((n&&n[h])!=null?n[h]:"")||Re(f))}function Ge(n,f){return Math.max(2,n*.075*f)}function We(n,f){let h=Math.min(Math.max(n/f,0),1);return 1-Math.pow(1-h,3)}function He(n){let f=(h,N)=>"rgba("+h.map(q=>Math.round(q*255)).join(",")+","+N+")";return"radial-gradient(60% 50% at 25% 30%,"+f(n[1],.4)+",transparent 70%),radial-gradient(50% 45% at 78% 35%,"+f(n[3],.4)+",transparent 70%),radial-gradient(45% 40% at 60% 80%,"+f(n[2],.27)+",transparent 70%),"+f(n[0],1)}function Se(n,f,h,N){return f+(n-f)*Math.exp(-N*h)}function je(n){return[.5+.32*Math.sin(n*.37),.56+.16*Math.sin(n*.53+1.1)]}(function(){let n=document.querySelector("[data-glas-root]");if(!n)return;let f=document.documentElement,h=new URLSearchParams(location.search),q=qe(["#0D0A14","#FF5A1F","#FF9EC1","#2F4CFF","#FFE6B8"]),u=n.querySelector("[data-glas-canvas]"),G=n.querySelector("[data-glas-titel]"),p=(e,a)=>(a||document).querySelector(e),ae=(e,a)=>[].slice.call((a||document).querySelectorAll(e));function L(e,a,l){let m=document.createElement(e);return a&&(m.className=a),l!=null&&(m.textContent=l),m}if(n.style.height="100svh",n.style.background=He(q),h.get("punkt")==="orange"&&(G.innerHTML='<span class="ghr-word">ERGUN</span><span class="glas-punkt">.</span>',f.setAttribute("data-glas-punkt","orange")),h.get("text")==="b"){let e=n.querySelector("[data-glas-text]");e&&(e.textContent="Website & Automatisierung f\xFCr Unternehmen.")}["header.nav","footer.footer",".szene","#dschungel-vorlage","#kristall-vorlage","#glas-vorlage",".mf-agentur"].forEach(e=>{let a=p(e);a&&a.remove()});let z=p("main#inhalt"),W=window.PREISE,K=L("footer","glas-fuss");K.innerHTML='<div class="glas-fuss__zeile"><span class="glas-fuss__marke">ERGUN<span>.</span></span><nav aria-label="Rechtliches"><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav></div><p class="glas-fuss__klein" data-glas-klein></p><p class="glas-fuss__klein glas-fuss__quellen">Bilder der Planeten der Fassung \u201EAll\u201C: Erde \u2013 NASA (gemeinfrei) \xB7 Saturn \u2013 <a href="https://www.solarsystemscope.com/textures/" rel="noopener" target="_blank">Solar System Scope</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a></p>',z&&z.parentNode.insertBefore(K,z.nextSibling),W&&W.klein&&(p("[data-glas-klein]",K).textContent=W.klein+" "+(W.steuer||""));function ke(){let e=p("[data-glas-kopf]");return e?e.offsetHeight:0}function Le(e){let a=0;for(let l=e;l;l=l.offsetParent)a+=l.offsetTop;return a}let Me=window.matchMedia("(prefers-reduced-motion: reduce)");function ne(e){e&&window.scrollTo({top:Math.max(0,Le(e)-ke()-20),behavior:Me.matches?"auto":"smooth"})}function $(){ne(p("#angebote"))}function Q(){let e=p("#preise .mf__oben");ne(e&&!e.hidden?e:p("#preise .mf__raster"))}window.__kristall={zumKontakt:Q,zuAngeboten:$},document.addEventListener("click",e=>{let a=e.target.closest&&e.target.closest("[data-glas-ziel]");a&&(e.preventDefault(),a.getAttribute("data-glas-ziel")==="kontakt"?Q():$())});let oe=!1;function Ue(){let e=document.getElementById("angebote");if(!e)return!1;e.classList.add("glas-angebote","glas-rein");let a=e.querySelector("h2");return a&&(a.className="glas-h2",a.textContent="Was brauchen Sie?"),ae(".k-angebot",e).forEach(l=>{let m=p(".k-angebot__wort",l),T=p(".k-angebot__info",l),M=T&&T.querySelector("b")?T.querySelector("b").textContent.trim():"",U=T?T.textContent.replace(M,"").replace(/^\s*·\s*/,"").trim():"",x=M.split(" + ");l.classList.add("glas-karte"),l.innerHTML="",l.appendChild(L("span","k-angebot__wort glas-karte__titel",m?m.textContent:"")),l.appendChild(L("span","glas-karte__satz",U));let k=L("span","glas-karte__preis");k.appendChild(L("b","",x[0])),x[1]&&k.appendChild(L("small","","+ "+x.slice(1).join(" + "))),l.appendChild(k)}),oe=!0,!0}if((function e(a){!Ue()&&a<60&&setTimeout(()=>e(a+1),50)})(0),z){z.classList.add("glas-haupt");let e=p("#preise .mf__oben");e&&e.classList.add("glas-rein");let a=p("#preise .mf__raster");a&&a.classList.add("glas-rein")}if("IntersectionObserver"in window){let e=new IntersectionObserver(a=>a.forEach(l=>{l.isIntersecting&&(l.target.classList.add("ist-da"),e.unobserve(l.target))}),{rootMargin:"0px 0px -8% 0px"});setTimeout(()=>ae(".glas-rein, .glas-fuss").forEach(a=>e.observe(a)),60)}else f.classList.add("glas-alles-da");let Ce={palette:q,title:G.textContent},F={x:.5,y:.56,at:-1e9,rebuild:()=>{},kick:()=>{}},w={glas:!1,lite:!1,fps:0,bilder:0},H=null;function ie(){H&&(H(),H=null);let e=/[?&]webgl=aus\b/.test(location.search)?null:u.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!e)return;let a=!!e.getExtension("EXT_color_buffer_float"),l=!1,m=0,T=0,M=0,U=!0,x=!1,k=0,ce=0,A={x:.5,y:.56},O=-1,j=window.matchMedia("(prefers-reduced-motion: reduce)"),fe=(r,t)=>{let o=e.createShader(r);if(!o)throw new Error("could not create shader");if(e.shaderSource(o,t),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error("shader: "+e.getShaderInfoLog(o));return o},J=r=>{let t=e.createProgram();if(!t)throw new Error("could not create program");let o=fe(e.VERTEX_SHADER,Ee),i=fe(e.FRAGMENT_SHADER,r);if(e.attachShader(t,o),e.attachShader(t,i),e.bindAttribLocation(t,0,"a_position"),e.linkProgram(t),e.deleteShader(o),e.deleteShader(i),!e.getProgramParameter(t,e.LINK_STATUS))throw new Error("link: "+e.getProgramInfoLog(t));let s={},d=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let c=0;c<d;c++){let g=e.getActiveUniform(t,c);g&&(s[g.name.replace(/^u_/,"")]=e.getUniformLocation(t,g.name))}return{prog:t,u:s}},C={tex:[],fbo:[]},Z=(r,t,o)=>{let i=e.createTexture(),s=e.createFramebuffer();if(!i||!s)throw new Error("could not allocate a render target");return e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),o&&a?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,r,t,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,r,t,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,s),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),C.tex.push(i),C.fbo.push(s),{tex:i,fbo:s,w:r,h:t}},De=()=>{for(let r of C.tex)e.deleteTexture(r);for(let r of C.fbo)e.deleteFramebuffer(r);C.tex=[],C.fbo=[]},R=null,b=null,_=null,E=null,D=null,P=4,I=(r,t,o)=>{e.useProgram(r.prog);let i=0;for(let s in o){let d=r.u[s];if(!d)continue;let c=o[s];typeof c=="number"?e.uniform1f(d,c):Array.isArray(c)?c.length===2?e.uniform2f(d,c[0],c[1]):e.uniform3f(d,c[0],c[1],c[2]):(e.activeTexture(e.TEXTURE0+i),e.bindTexture(e.TEXTURE_2D,c),e.uniform1i(d,i++))}e.bindFramebuffer(e.FRAMEBUFFER,t?t.fbo:null),e.viewport(0,0,t?t.w:u.width,t?t.h:u.height),e.drawArrays(e.TRIANGLE_STRIP,0,4)},ue="",de=()=>{let r=G;if(!r||!b)return;let t=n.getBoundingClientRect(),o=x?1:Math.min(window.devicePixelRatio||1,1.5),i=Math.max(1,Math.round(t.width*o)),s=Math.max(1,Math.round(t.height*o)),d=Array.from(r.querySelectorAll(".ghr-word")),c=d.map(y=>y.getBoundingClientRect()),g=getComputedStyle(r),Y=[i,s,o,g.font,g.letterSpacing].concat(d.map((y,X)=>(y.textContent||"")+"@"+Math.round(c[X].left-t.left)+","+Math.round(c[X].top-t.top))).join("|");if(Y===ue)return;ue=Y;let B=document.createElement("canvas");B.width=i,B.height=s;let v=B.getContext("2d");if(!v)return;v.fillStyle="#000",v.fillRect(0,0,i,s);let xe=parseFloat(g.fontSize)||64;if(v.setTransform(o,0,0,o,0,0),v.font=g.fontStyle+" "+g.fontWeight+" "+g.fontSize+" "+g.fontFamily,"letterSpacing"in v&&(v.letterSpacing=g.letterSpacing==="normal"?"0px":g.letterSpacing),v.fillStyle="#fff",v.textBaseline="alphabetic",d.forEach((y,X)=>{let _e=y.textContent||"",Ie=v.measureText(_e).fontBoundingBoxAscent||xe*.8;v.fillText(_e,c[X].left-t.left,c[X].top-t.top+Ie)}),D||(D=e.createTexture()),e.bindTexture(e.TEXTURE_2D,D),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,B),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!_||_.w!==i||_.h!==s){for(let y of[_,E])y&&(e.deleteTexture(y.tex),e.deleteFramebuffer(y.fbo));_=Z(i,s,!0),E=Z(i,s,!0)}P=Ge(xe,o),!(!_||!E)&&(I(R.blur,_,{src:D,step:[1/i,0],radius:P,read:0,write:0}),I(R.blur,E,{src:_.tex,step:[0,1/s],radius:P,read:1,write:0}),I(R.blur,_,{src:E.tex,step:[1/i,0],radius:P*3,read:1,write:1}),I(R.blur,E,{src:_.tex,step:[0,1/s],radius:P*3,read:2,write:1}))},ee=()=>{let r=x?.65:Math.min(window.devicePixelRatio||1,2),t=Math.max(1,Math.round(u.clientWidth*r)),o=Math.max(1,Math.round(u.clientHeight*r));(u.width!==t||u.height!==o)&&(u.width=t,u.height=o);let i=x?.25:.4,s=Math.max(1,Math.round(t*i)),d=Math.max(1,Math.round(o*i));(!b||b.w!==s||b.h!==d)&&(b&&(e.deleteTexture(b.tex),e.deleteFramebuffer(b.fbo)),b=Z(s,d,!1)),de()},Pe=()=>{if(!b||!E)return;let r=Ce.palette,t=u.width/u.height;I(R.field,b,{time:M,aspect:t,octaves:x?3:5,c0:r[0],c1:r[1],c2:r[2],c3:r[3],c4:r[4]}),I(R.glass,null,{field:b.tex,height:E.tex,htexel:[1/E.w,1/E.h],bevel:P,aspect:t,light:[A.x,A.y],glass:1,form:j.matches||O<0?1:We(performance.now()-O,1100),res:[u.width,u.height]}),w.bilder++},V=()=>U&&!document.hidden&&!j.matches,he=r=>{if(m=0,l)return;let t=(r-T)/1e3;T=r;let o=Math.min(t,.1);!x&&k<40&&V()&&(k+=1,k>3&&t>.05&&(ce+=t>.15?3:1),ce>=8&&(x=!0,w.lite=!0,f.setAttribute("data-glas-lite","true"),ee())),V()&&(M+=o);let i=F,s=(r-i.at)/1e3>2.5,[d,c]=s&&V()?je(M):[i.x,i.y];A.x=Se(A.x,d,o,s?1.2:7),A.y=Se(A.y,c,o,s?1.2:7),Pe();let g=Math.abs(A.x-d)+Math.abs(A.y-c)>.0015,Y=U&&!document.hidden,B=O>=0&&performance.now()-O<1100;Y&&(V()||g||B)&&(m=requestAnimationFrame(he))},S=()=>{m||l||(T=performance.now(),m=requestAnimationFrame(he))};F.kick=S,F.rebuild=()=>{l||(de(),S())};let ge=r=>{r.preventDefault(),cancelAnimationFrame(m),m=0},me=()=>ie();u.addEventListener("webglcontextlost",ge),u.addEventListener("webglcontextrestored",me);try{R={field:J(we),blur:J(Te),glass:J(ye)};let r=e.createVertexArray();e.bindVertexArray(r);let t=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),ee()}catch{return}n.setAttribute("data-glass","true"),w.glas=!0,O=performance.now(),S();let te=0,pe=new ResizeObserver(()=>{cancelAnimationFrame(te),te=requestAnimationFrame(()=>{l||(ee(),S())})});pe.observe(n),document.fonts&&document.fonts.ready.then(()=>F.rebuild());let be=new IntersectionObserver(([r])=>{U=r.isIntersecting,U&&S()});be.observe(n);let ve=()=>!document.hidden&&S();document.addEventListener("visibilitychange",ve),j.addEventListener("change",S),H=()=>{l=!0,cancelAnimationFrame(m),cancelAnimationFrame(te),pe.disconnect(),be.disconnect(),document.removeEventListener("visibilitychange",ve),j.removeEventListener("change",S),u.removeEventListener("webglcontextlost",ge),u.removeEventListener("webglcontextrestored",me),De(),D&&e.deleteTexture(D);for(let r of Object.values(R||{}))e.deleteProgram(r.prog);n.setAttribute("data-glass","false"),w.glas=!1}}n.addEventListener("pointermove",e=>{let a=n.getBoundingClientRect();F.x=(e.clientX-a.left)/a.width,F.y=1-(e.clientY-a.top)/a.height,F.at=performance.now(),F.kick()}),n.setAttribute("data-glass","false"),ie();let se=performance.now(),le=0;setInterval(()=>{let e=w.bilder;w.fps=Math.round((e-le)*1e3/Math.max(1,performance.now()-se)),le=e,se=performance.now()},1e3),window.__glas={zustand:()=>({glas:w.glas,lite:w.lite,fps:w.fps,angebote:oe,titel:G.textContent,punkt:f.getAttribute("data-glas-punkt")||"glas"}),zumKontakt:Q,zuAngeboten:$}})();})();
