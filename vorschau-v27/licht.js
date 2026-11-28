/* Das Licht erzählt die drei Wörter (beginnt erst, wenn die Wolken-Animation fertig ist und die neue Seite ganz da ist):
   0  ein kleines warmes Licht glimmt auf
   1  „Persönlich geplant.“  das Licht skizziert eine lockere Linie um das Wort (am PC folgt es der Maus)
   2  „Klar gestaltet.“      das Licht fährt einen sauberen, klaren Rahmen um das Wort, die Linie bleibt stehen
   3  „Schnell online.“      die Formen werden eingesogen, das Licht schießt mit Schweif zum Satzende und wird der Punkt */
(function(){
  var mobil=matchMedia('(pointer: coarse), (max-width: 820px)').matches,ruhig=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv,cx,dk,hero,worte,maus=null,spur=[],t0=performance.now(),letzt=0;
  var rahmen=null,rahmenT=0,L={x:0,y:0,r:0,a:0},stufe=-1,stufeZeit=0,gitter=0,formen=0,sog=0;
  var FORMEN=[{art:'kreis',w:0},{art:'quadrat',w:1.5708},{art:'linie',w:3.1416},{art:'dreieck',w:4.7124},{art:'kreis2',w:.785},{art:'quadrat2',w:3.93}];
  addEventListener('pointermove',function(e){if(e.pointerType==='mouse')maus={x:e.clientX,y:e.clientY}},{passive:true});
  function bauen(){
    dk=document.querySelector('.dk');var bg=document.querySelector('.dk .dk-bg');hero=document.querySelector('.ac-hero');
    if(!dk||!bg||!hero)return false;
    worte=[].slice.call(document.querySelectorAll('.ac-words .ac-word'));
    cv=document.createElement('canvas');cv.className='li-cv';cv.setAttribute('aria-hidden','true');bg.appendChild(cv);cx=cv.getContext('2d');return true;
  }
  function welche(){
    if(hero.getAttribute('data-nb-p')==='1')return 3;
    var best=-1,bo=.35;for(var i=0;i<worte.length;i++){var o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    if(best<0)return stufe<0?0:stufe;return best+1;
  }
  function nah(a,b,k){return a+(b-a)*k}
  function glow(x,y,r,a){
    if(a<=.002||r<=.2)return;var h=r*3.2,g=cx.createRadialGradient(x,y,0,x,y,h);
    g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(.12,'rgba(255,236,190,'+a+')');
    g.addColorStop(.3,'rgba(255,190,90,'+(a*.75)+')');g.addColorStop(.55,'rgba(255,150,50,'+(a*.28)+')');g.addColorStop(1,'rgba(255,140,40,0)');
    cx.fillStyle=g;cx.beginPath();cx.arc(x,y,h,0,6.2832);cx.fill();
  }
  function form(f,x,y,s,rot,a){
    cx.save();cx.translate(x,y);cx.rotate(rot);cx.globalAlpha=a;cx.strokeStyle='#e8791f';cx.lineWidth=1.6;cx.beginPath();
    if(f.art.indexOf('kreis')===0)cx.arc(0,0,s*.5,0,6.2832);
    else if(f.art.indexOf('quadrat')===0)cx.rect(-s*.45,-s*.45,s*.9,s*.9);
    else if(f.art==='linie'){cx.moveTo(-s*.6,0);cx.lineTo(s*.6,0)}
    else{cx.moveTo(0,-s*.52);cx.lineTo(s*.48,s*.38);cx.lineTo(-s*.48,s*.38);cx.closePath()}
    cx.stroke();cx.restore();cx.globalAlpha=1;
  }
  function lauf(z){
    requestAnimationFrame(lauf);
    var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;var t=(z-t0)/1000;
    var an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    var W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2);
    if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}
    cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,W,H);
    var gf=document.body.getAttribute('data-gf');
    /* erst wenn die neue Seite nach den Wolken ganz da ist */
    if(an<.985||gf==='1'||gf==='2'){if(an<.5){stufe=-1;L.a=0;spur=[];gitter=formen=sog=0}return}
    var s=welche();if(s!==stufe){stufe=s;stufeZeit=t}
    var seit=t-stufeZeit,k=1-Math.exp(-dt*(stufe===3?5:2.6)),mx=W/2,my=H/2;
    var tx=mx,ty=my,tr=10,ta=1;
    if(stufe<=1){
      /* ruhige Acht um das Wort, am PC zieht die Maus das Licht zu sich */
      var u=t*.55;tx=mx+Math.sin(u)*W*.3;ty=my+Math.sin(u*2)*H*.16-H*.02;
      if(maus&&!mobil){tx=nah(tx,maus.x,.65);ty=nah(ty,maus.y,.65)}
      tr=stufe===0?8:11;
    }else if(stufe===2){
      var wr=worte[1]&&worte[1].getBoundingClientRect();
      if(wr&&wr.width>0){var pad=18,x0=wr.left-pad,y0=wr.top-pad*.6,bw=wr.width+pad*2,bh=wr.height+pad*1.2,um=2*(bw+bh);
        rahmen={x:x0,y:y0,w:bw,h:bh};var q=Math.min(1,seit/1.8),e=1-Math.pow(1-q,3),l=e*um;rahmenT=e;
        if(l<bw){tx=x0+l;ty=y0}else if(l<bw+bh){tx=x0+bw;ty=y0+(l-bw)}else if(l<2*bw+bh){tx=x0+bw-(l-bw-bh);ty=y0+bh}else{tx=x0;ty=y0+bh-(l-2*bw-bh)}}
      tr=12}
    else{
      var p=document.querySelector('.ac-hero .ac-word .ac-rdot-w'),pr=p&&p.getBoundingClientRect();
      if(pr&&pr.width>0){tx=pr.left+pr.width/2;ty=pr.top+pr.height/2;tr=pr.width*.6}else{tr=6}
    }
    if(stufe<0)return;
    if(L.a===0){L.x=tx;L.y=ty;L.r=0}
    L.x=nah(L.x,tx,stufe===3?k*1.3:k*.9);L.y=nah(L.y,ty,stufe===3?k*1.3:k*.9);L.r=nah(L.r,tr,k);L.a=nah(L.a,ta,k);
    gitter=nah(gitter,stufe===1?1:0,k*.8);formen=nah(formen,stufe===2?1:0,k*.9);sog=nah(sog,stufe===3?1:0,k*1.2);
    /* klarer Rahmen, den das Licht in Stufe 2 zieht (bleibt stehen, geht mit dem Wortwechsel) */
    if(stufe===2&&rahmen&&rahmenT>0){cx.save();cx.strokeStyle='rgba(232,121,31,.9)';cx.lineWidth=1.3;cx.lineJoin='round';
      var r=rahmen,um=2*(r.w+r.h),l=rahmenT*um;cx.beginPath();cx.moveTo(r.x,r.y);
      if(l<=r.w)cx.lineTo(r.x+l,r.y);else{cx.lineTo(r.x+r.w,r.y);if(l<=r.w+r.h)cx.lineTo(r.x+r.w,r.y+l-r.w);else{cx.lineTo(r.x+r.w,r.y+r.h);
      if(l<=2*r.w+r.h)cx.lineTo(r.x+r.w-(l-r.w-r.h),r.y+r.h);else{cx.lineTo(r.x,r.y+r.h);cx.lineTo(r.x,r.y+r.h-(l-2*r.w-r.h))}}}
      cx.stroke();cx.restore()}
    /* Spur: in Stufe 1 die Planlinie, in Stufe 3 der Schweif zum Punkt */
    spur.push([L.x,L.y]);var max=stufe===3?26:(stufe===1?110:10);while(spur.length>max)spur.shift();
    if(spur.length>2&&(stufe===1||stufe===3)){
      for(var i=1;i<spur.length;i++){var f=i/spur.length;cx.strokeStyle=stufe===3?'rgba(255,170,60,'+(f*.9)+')':'rgba(232,121,31,'+(f*.5)+')';
        cx.lineWidth=stufe===3?L.r*1.4*f+1:1.4;cx.lineCap='round';cx.beginPath();cx.moveTo(spur[i-1][0],spur[i-1][1]);cx.lineTo(spur[i][0],spur[i][1]);cx.stroke()}}
    /* das Licht */
    var puls=1+.06*Math.sin(t*2.2);
    glow(L.x,L.y,L.r*puls,L.a*(stufe===3&&seit>.9?Math.max(0,1-(seit-.9)*1.5):1));
    /* Blitz, wenn es am Punkt ankommt */
    if(stufe===3&&seit>.45&&seit<1.2){var fl=Math.sin((seit-.45)/.75*Math.PI);cx.fillStyle='rgba(255,236,190,'+(fl*.35)+')';cx.fillRect(0,0,W,H)}
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
