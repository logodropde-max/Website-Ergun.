/* Light Speed in Zeitlupe als ruhiger Hintergrund in den anderen Abschnitten (Galerie, Kontakt nach dem Aufgehen der Erde, Fußzeile).
   Gleiche Geometrie wie lichtspeed.js, nur sehr langsam, weniger Streifen und auf transparentem Grund. */
(function(){
  var mobil=matchMedia('(pointer: coarse), (max-width: 820px)').matches,ruhig=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ZIELE=[
    {sel:'.mg-himmel',farbe:[110,70,235],alpha:.7,hell:false,n:mobil?220:340},   /* Galerie: Violett auf hellem Grund */
    {sel:'.ic-welle3',farbe:[255,196,110],alpha:.75,hell:true,n:mobil?240:380},  /* Kontakt im Sternenhimmel: Gold */
    {sel:'.whf-root',farbe:[190,205,255],alpha:.6,hell:true,n:mobil?200:320}           /* Fußzeile: kühles Sternenlicht */
  ];
  var R=25,LEN=150,schichten=[];
  function neu(z){var c=document.querySelector(z.sel);if(!c)return null;
    var cv=document.createElement('canvas');cv.className='zl-cv';cv.setAttribute('aria-hidden','true');
    if(z.sel==='.ic-welle3')c.appendChild(cv);else c.insertBefore(cv,c.firstChild);
    var P=[];for(var i=0;i<z.n;i++){var a=Math.random()*Math.PI*2,r=2+Math.random()*(R-2);P.push({x:Math.cos(a)*r,y:Math.sin(a)*r,z:(Math.random()-.5)*LEN,m:.5+Math.random()*.5,len:1+Math.random()*2})}
    return {z:z,c:c,cv:cv,cx:cv.getContext('2d'),P:P};}
  function zeichne(s,dt){
    var r=s.c.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight||r.width<2)return;
    var st=getComputedStyle(s.c);if(st.visibility==='hidden'||st.display==='none')return;
    var W=r.width,H=r.height,d=Math.min(devicePixelRatio||1,mobil?1.5:2);
    if(s.cv.width!==Math.round(W*d)||s.cv.height!==Math.round(H*d)){s.cv.width=Math.round(W*d);s.cv.height=Math.round(H*d)}
    var cx=s.cx,f=Math.min(W,H)/2,ox=W/2,oy=H/2,sp=ruhig?0:.22,col='rgb('+s.z.farbe.join(',')+')';
    cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,W,H);cx.globalCompositeOperation=s.z.hell?'lighter':'source-over';cx.lineCap='round';
    var bins=[[],[],[],[]];
    for(var i=0;i<s.P.length;i++){var p=s.P[i];p.z+=sp*p.m*dt*50;if(p.z>5){p.z=-LEN/2;p.m=.5+Math.random()*.5}
      var l=p.len+sp*p.m*.5,z1=p.z+l,z0=p.z-l,d1=5-Math.min(z1,4.6),d0=5-z0;if(d0<=.4)continue;
      var fog=Math.exp(-Math.pow(.025*(5-p.z),2));bins[Math.min(3,Math.floor(fog*4))].push(ox+p.x/d0*f,oy+p.y/d0*f,ox+p.x/d1*f,oy+p.y/d1*f)}
    cx.strokeStyle=col;
    for(var b=0;b<4;b++){var L=bins[b];if(!L.length)continue;cx.globalAlpha=s.z.alpha*(b+.5)/4;cx.beginPath();
      for(var q=0;q<L.length;q+=4){cx.moveTo(L[q],L[q+1]);cx.lineTo(L[q+2],L[q+3])}cx.lineWidth=1;cx.stroke()}
    cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  }
  var letzt=0;
  function lauf(t){requestAnimationFrame(lauf);var dt=Math.min(.05,letzt?(t-letzt)/1000:.016);letzt=t;for(var i=0;i<schichten.length;i++)zeichne(schichten[i],dt)}
  (function warte(n){var fehlt=[];ZIELE.forEach(function(z){if(!z.da){var s=neu(z);if(s){z.da=1;schichten.push(s)}else fehlt.push(z)}});
    if(n===0)requestAnimationFrame(lauf);if(fehlt.length&&n<60)setTimeout(function(){warte(n+1)},250)})(0);
})();
