/* Fire Sphere (21st, Rahil Vahora) als sichtbarer Punkt, der die drei Wörter begleitet (beginnt erst nach den Wolken):
   Persönlich geplant = glühende Kugel über dem Wort · Klar gestaltet = groß und klar hinter dem Wort
   Schnell online = klein und schnell, fliegt ans Satzende und wird der Punkt · danach wächst sie als Feuerkugel zur Galerie. */
(function(){
  var VS='attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}';
  var FS=[
  /* Fire Sphere (21st, Rahil Vahora): gleiches Rauschen und gleiche Flammenkante, Kugel hier ohne three.js berechnet */
  'precision highp float;varying vec2 v;uniform float t;',
  'float rand(vec2 n){return fract(sin(dot(n,vec2(12.9898,4.1414)))*43758.5453);}',
  'float noise(vec2 p){vec2 ip=floor(p);vec2 u=fract(p);u=u*u*(3.-2.*u);',
  ' float r=mix(mix(rand(ip),rand(ip+vec2(1.,0.)),u.x),mix(rand(ip+vec2(0.,1.)),rand(ip+vec2(1.,1.)),u.x),u.y);return r*r;}',
  'float fbm(vec2 x){float s=0.,a=.5;vec2 sh=vec2(100.);mat2 ro=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));',
  ' for(int i=0;i<5;++i){s+=a*noise(x);x=ro*x*2.+sh;a*=.5;}return s;}',
  'void main(){float r2=dot(v,v);if(r2>1.){gl_FragColor=vec4(0.);return;}',
  ' vec3 N=normalize(vec3(v,sqrt(1.-r2)));vec2 uv=N.xy*.5+.5;',
  ' vec2 nu=uv+vec2(0.,-t*.0004);vec2 p=nu*12.;float n=fbm(p+fbm(p));',
  ' vec3 c0=vec3(74.,30.,0.)/255.,c1=vec3(201.,158.,72.)/255.;',
  ' float back=(1.-uv.y)+n*(1.-uv.y);float front=(1.08-uv.y)+n*(1.-uv.y);',
  ' float ba=smoothstep(.97,1.01,back);float fa=smoothstep(.97,1.01,front)-ba;',
  ' vec3 innen=mix(vec3(.93,.45,.12),vec3(.80,.30,.07),uv.y);',
  ' vec3 c=mix(innen,min(c1*1.3,vec3(1.)),ba);c=mix(c,mix(c0,innen,.35),clamp(fa,0.,1.));',
  ' c+=c1*.25*pow(1.-N.z,2.5);',
  ' float edge=smoothstep(1.,.985,sqrt(r2));gl_FragColor=vec4(c*edge,edge);}'].join('\n');
  var box,cv,gl,uT,glow,gx,dk,hero,worte,stufe=-1,stufeZeit=0,P={x:0,y:0,d:0,a:0},letzt=0,t0=performance.now(),
      mobil=matchMedia('(pointer: coarse), (max-width: 820px)').matches,ruhig=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bauen(){
    dk=document.querySelector('.dk');hero=document.querySelector('.ac-hero');
    if(!dk||!hero)return false;worte=[].slice.call(document.querySelectorAll('.ac-hero .ac-words .ac-word'));if(!worte.length)return false;
    box=document.createElement('div');box.className='fp-box';box.setAttribute('aria-hidden','true');
    glow=document.createElement('canvas');glow.className='fp-glow';cv=document.createElement('canvas');cv.className='fp-cv';
    box.appendChild(glow);box.appendChild(cv);document.body.appendChild(box);gx=glow.getContext('2d');
    gl=cv.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,preserveDrawingBuffer:true});
    if(!gl){box.classList.add('fp-ohne');return true}
    function sh(ty,src){var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);return s}
    var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){gl=null;box.classList.add('fp-ohne');return true}
    gl.useProgram(pr);var bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    var lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
    uT=gl.getUniformLocation(pr,'t');return true;
  }
  function welche(){
    if(hero.getAttribute('data-nb-p')==='1')return 4;
    var best=-1,bo=.3;for(var i=0;i<worte.length;i++){var o=parseFloat(worte[i].style.opacity);if(isNaN(o))o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    return best<0?(stufe<0?0:stufe):best+1;
  }
  function lauf(z){
    requestAnimationFrame(lauf);var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;var t=(z-t0)/1000;
    var W=innerWidth,H=innerHeight,m=Math.min(W,H);
    var an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    var gf=document.body.getAttribute('data-gf'),ball=document.querySelector('.gf-ball'),br=ball&&ball.getBoundingClientRect(),bo=ball?+getComputedStyle(ball).opacity:0;
    var ziel={a:0},s=welche();if(s!==stufe){stufe=s;stufeZeit=t}
    var w=worte[Math.min(2,Math.max(0,Math.min(stufe,3)-1))],wr=w&&w.getBoundingClientRect(),cx0=W/2,cy0=H/2,wh=40;
    if(wr&&wr.width>0){cx0=wr.left+wr.width/2;cy0=wr.top+wr.height/2;wh=wr.height}
    var st=document.querySelector('.mg-stage'),kr=null;
    if(st&&(gf==='1'||gf==='2')){var mm=/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/.exec(getComputedStyle(st).clipPath);if(mm){var sr=st.getBoundingClientRect();kr={r:+mm[1],x:sr.left+ +mm[2],y:sr.top+ +mm[3]}}}
    if(kr&&kr.r>.5){var diag=Math.hypot(W,H),aus=Math.min(1,Math.max(0,(kr.r-diag*.18)/(diag*.32)));ziel={x:kr.x,y:kr.y,d:Math.max(kr.r*2,P.d*.98),a:1-aus*aus*(3-2*aus)};}
    else if(gf==='1'||gf==='2'){ziel={a:0}}
    else if(an>.985){
      if(stufe<=1){var dd=m*.3;ziel={x:cx0,y:cy0-wh*.5-dd*.62,d:dd,a:1}}
      else if(stufe===2){ziel={x:cx0,y:cy0,d:m*.46,a:1}}
      else{var p=document.querySelector('.ac-hero .ac-word .ac-rdot-w'),pr=p&&p.getBoundingClientRect();
        if(pr&&pr.width>0)ziel={x:pr.left+pr.width/2,y:pr.top+pr.height/2,d:pr.width*1.9,a:1};else ziel={x:(wr?wr.right:cx0)+8,y:cy0+wh*.25,d:12,a:1}}
    }
    var folgt=!!(kr&&kr.r>.5);
    var k=folgt?1:1-Math.exp(-dt*(stufe>=3?6:3.2));
    if(ziel.x!==undefined){if(P.a<.01){P.x=ziel.x;P.y=ziel.y;P.d=ziel.d*.3}P.x+=(ziel.x-P.x)*k;P.y+=(ziel.y-P.y)*k;P.d+=(ziel.d-P.d)*k}
    P.a+=((ziel.a||0)-P.a)*(folgt?1:1-Math.exp(-dt*4));
    if(P.a<.01){box.style.opacity=0;return}
    var D=Math.max(2,P.d);box.style.opacity=P.a.toFixed(3);box.style.width=box.style.height=D.toFixed(1)+'px';
    box.style.transform='translate3d('+(P.x-D/2).toFixed(1)+'px,'+(P.y-D/2).toFixed(1)+'px,0)';
    document.body.classList.toggle('fp-gross',!!folgt);
    if(!gl||z-(box._z||0)<(mobil?33:16))return;box._z=z;
    var dp=Math.min(devicePixelRatio||1,mobil?1.5:2),px=Math.min(900,Math.round(D*dp));
    if(cv.width!==px){cv.width=cv.height=px;gl.viewport(0,0,px,px)}
    gl.uniform1f(uT,ruhig?0:t*1000);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    var g=Math.max(8,Math.round(px/4));if(glow.width!==g){glow.width=glow.height=g}gx.clearRect(0,0,g,g);gx.drawImage(cv,0,0,g,g);
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
