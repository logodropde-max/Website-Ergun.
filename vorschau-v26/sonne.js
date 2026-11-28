/* Sonne über dem Gipfel: eine ruhig glühende Sonne (WebGL-Shader mit fließendem Rauschen, Randverdunkelung, heller Kern).
   Sie liegt in der Kugel aus den Teilchen und erscheint genau dann, wenn die Kugel fest wird (übernimmt die Deckkraft von .dk-kern). */
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
  var cv,gl,uT,glow,gx,start=performance.now(),kern,kugel,mobil=matchMedia('(pointer: coarse), (max-width: 820px)').matches,ruhig=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bauen(){
    kugel=document.querySelector('.dk-atem');kern=document.querySelector('.dk-kern');
    if(!kugel||!kern)return false;
    cv=document.createElement('canvas');cv.className='so-cv';cv.setAttribute('aria-hidden','true');kugel.appendChild(cv);
    gl=cv.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,preserveDrawingBuffer:true});
    glow=document.createElement('canvas');glow.className='so-glow';glow.setAttribute('aria-hidden','true');kugel.insertBefore(glow,cv);gx=glow.getContext('2d');
    if(!gl){cv.remove();cv=null;return true}
    function sh(ty,src){var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);return s}
    var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){cv.remove();cv=null;return true}
    gl.useProgram(pr);var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    var lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
    uT=gl.getUniformLocation(pr,'t');return true;
  }
  var letzt=0;
  function lauf(z){
    requestAnimationFrame(lauf);
    if(!cv)return;
    var o=+getComputedStyle(kern).opacity||0,r=cv.getBoundingClientRect();
    var sicht=o>.005&&r.bottom>0&&r.top<innerHeight&&r.width>2;
    cv.style.opacity=o.toFixed(3);if(glow)glow.style.opacity=o.toFixed(3);
    if(!sicht)return;
    if(z-letzt<(mobil?33:16))return;letzt=z;
    var d=Math.min(devicePixelRatio||1,mobil?1:1.5),W=Math.max(2,Math.round(cv.clientWidth*d)),H=Math.max(2,Math.round(cv.clientHeight*d));
    if(W>900){H=Math.round(H*900/W);W=900}
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;gl.viewport(0,0,W,H)}
    gl.uniform1f(uT,ruhig?0:(z-start)/1000);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(gx){var gw=Math.round(W/4),gh=Math.round(H/4);if(glow.width!==gw){glow.width=gw;glow.height=gh}gx.clearRect(0,0,gw,gh);gx.drawImage(cv,0,0,gw,gh)}
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
