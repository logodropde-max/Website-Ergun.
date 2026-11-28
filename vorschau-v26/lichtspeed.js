/* Light Speed (21st, chamaac) als Hintergrund hinter den drei Wörtern, ohne three.js nachgebaut:
   Lichtstreifen fliegen in einem Zylinder auf die Kamera zu (gleiche Geometrie, Nebel und Leuchten wie im Original).
   Mit jedem Wort ändert sich spürbar etwas: Farbe, Tempo, Dichte, dazu ein kurzer Schub beim Wechsel. */
(function(){
  var mobil=matchMedia('(pointer: coarse), (max-width: 820px)').matches,ruhig=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var war=false,MAX=mobil?650:1000,R=25,LEN=150,cv,cx,dk,hero,worte,stufe=-1,boost=0,letzt=0;
  /* vor den Wörtern, Persönlich geplant, Klar gestaltet, Schnell online */
  /* je Wort: s = Zeitlupe am Ende, b = Tempo am Anfang (Schub), danach bremst es ab; Schnell online hat den stärksten Schub */
  var ST=[{s:.12,b:2.5,n:.25,c:[120,170,255],l:.8},{s:.12,b:4,n:.5,c:[95,184,255],l:1},{s:.12,b:6.5,n:.75,c:[176,38,255],l:1.15},{s:.12,b:11,n:1,c:[255,170,60],l:1.3}];
  var cur={s:.12,n:.22,c:[120,170,255],l:.8};
  var P=[];for(var i=0;i<MAX;i++){var a=Math.random()*Math.PI*2,r=2+Math.random()*(R-2);
    P.push({x:Math.cos(a)*r,y:Math.sin(a)*r,z:(Math.random()-.5)*LEN,m:.5+Math.random()*.5,len:1+Math.random()*2})}
  function bauen(){
    dk=document.querySelector('.dk');var bg=document.querySelector('.dk .dk-bg');hero=document.querySelector('.ac-hero');
    if(!dk||!bg||!hero)return false;
    worte=[].slice.call(document.querySelectorAll('.ac-words .ac-word'));
    cv=document.createElement('canvas');cv.className='ls-cv';cv.setAttribute('aria-hidden','true');bg.insertBefore(cv,bg.firstChild);
    cx=cv.getContext('2d');return true;
  }
  function welcheStufe(){
    if(hero.getAttribute('data-nb-p')==='1')return 3;
    var best=-1,bo=.35;for(var i=0;i<worte.length;i++){var o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    return best<0?(stufe<0?0:stufe):best+1;
  }
  function lauf(z){
    requestAnimationFrame(lauf);
    var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;
    /* Übergang aus den Wolken: statt Überblenden öffnet sich aus der Mitte ein Kreis in den Lichtraum,
       mit einem kräftigen Schub, als würde man durch die Wolkendecke stoßen. Fortschritt = Deckkraft, die das Skript setzt */
    var an=parseFloat(dk.style.opacity);if(isNaN(an))an=0;
    var W=innerWidth,H=innerHeight,e=an<.5?4*an*an*an:1-Math.pow(-2*an+2,3)/2;
    dk.style.setProperty('--ls-r',(e>=.999?'150%':(e*Math.hypot(W,H)*.55).toFixed(1)+'px'));
    if(an>.01&&!war)boost=ST[0].b;war=an>.01;
    document.body.classList.toggle('ls-an',an>.6);
    if(an<.01)return;
    var d=Math.min(devicePixelRatio||1,2);
    if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}
    var s=welcheStufe();if(s!==stufe){if(s>stufe)boost=Math.max(boost,ST[s].b);stufe=s}
    var t=ST[s],k=1-Math.exp(-dt*2.2);
    cur.s+=(t.s-cur.s)*k;cur.n+=(t.n-cur.n)*k;cur.l+=(t.l-cur.l)*k;for(var j=0;j<3;j++)cur.c[j]+=(t.c[j]-cur.c[j])*k;
    boost*=Math.exp(-dt*1.15);
    var hell=cur.c.map(function(v){return Math.round(v+(255-v)*.42)});
    document.body.style.setProperty('--ls-farbe','rgb('+hell.join(',')+')');
    document.body.style.setProperty('--ls-glut','rgba('+cur.c.map(Math.round).join(',')+',.55)');
    var sp=(ruhig?.15:1)*(cur.s+boost),f=H/2,ox=W/2,oy=H/2,n=Math.round(MAX*cur.n);
    cx.setTransform(d,0,0,d,0,0);cx.globalCompositeOperation='source-over';cx.fillStyle='#05070b';cx.fillRect(0,0,W,H);
    cx.globalCompositeOperation='lighter';cx.lineCap='round';
    var col='rgb('+cur.c.map(Math.round).join(',')+')';
    var bins=[[],[],[],[]];
    for(var i=0;i<MAX;i++){var p=P[i];
      p.z+=sp*p.m*dt*50;if(p.z>5){p.z=-LEN/2;p.m=.5+Math.random()*.5}
      if(i>=n)continue;
      var st=(p.len+(cur.s+boost)*p.m*.5)*cur.l,z1=p.z+st,z0=p.z-st;
      var d1=5-Math.min(z1,4.6),d0=5-z0;if(d0<=.4)continue;
      var x0=ox+p.x/d0*f,y0=oy+p.y/d0*f,x1=ox+p.x/d1*f,y1=oy+p.y/d1*f;
      var fog=Math.exp(-Math.pow(.025*(5-p.z),2));var b=Math.min(3,Math.floor(fog*4));bins[b].push(x0,y0,x1,y1,.04/((d0+d1)/2)*f)}
    for(var b=0;b<4;b++){var L=bins[b];if(!L.length)continue;var al=(b+.5)/4;
      cx.strokeStyle=col;
      cx.globalAlpha=al*.1;cx.beginPath();for(var q=0;q<L.length;q+=5){cx.moveTo(L[q],L[q+1]);cx.lineTo(L[q+2],L[q+3])}cx.lineWidth=2.6;cx.stroke();
      cx.globalAlpha=Math.min(1,al*1.15);cx.beginPath();for(var q=0;q<L.length;q+=5){cx.moveTo(L[q],L[q+1]);cx.lineTo(L[q+2],L[q+3])}cx.lineWidth=1.1;cx.stroke();
      cx.globalAlpha=al;cx.strokeStyle='rgba(255,255,255,.7)';cx.beginPath();for(var q=0;q<L.length;q+=5){cx.moveTo(L[q],L[q+1]);cx.lineTo(L[q+2],L[q+3])}cx.lineWidth=.45;cx.stroke()}
    cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
    if(boost>.2){cx.fillStyle='rgba('+cur.c.map(Math.round).join(',')+','+(Math.min(1,boost/11)*.1).toFixed(3)+')';cx.fillRect(0,0,W,H)}
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
