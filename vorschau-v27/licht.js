/* Der leuchtende Punkt kreist um die Mitte, in der die drei Wörter nacheinander erscheinen (Stil: Orbiting Circles, Magic UI).
   Beginnt erst, wenn die Wolken-Animation fertig ist. Eine einzige Bewegung, die sich mit jedem Wort zuzieht:
   Persönlich geplant = weite, ruhige Bahn · Klar gestaltet = enger, schneller · Schnell online = ganz eng und schnell,
   dann dreht er sich spiralförmig hinein und landet als Punkt hinter „online“. */
(function(){
  var mobil=matchMedia('(pointer: coarse), (max-width: 820px)').matches,ruhig=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv,cx,dk,hero,worte,spur=[],letzt=0,t0=performance.now();
  var stufe=-1,stufeZeit=0,winkel=-1.2,rad=0,tempo=.9,L={x:0,y:0,r:0,a:0},zx=0,zy=0;
  /* Bahn je Stufe: Anteil der Bildschirmbreite, Höhe der Ellipse, Tempo in rad/s */
  var B=[{w:.44,h:.42,v:.8},{w:.44,h:.42,v:.95},{w:.33,h:.38,v:1.7},{w:.2,h:.34,v:3.4}];
  function bauen(){
    dk=document.querySelector('.dk');var bg=document.querySelector('.dk .dk-bg');hero=document.querySelector('.ac-hero');
    if(!dk||!bg||!hero)return false;
    worte=[].slice.call(document.querySelectorAll('.ac-words .ac-word'));
    cv=document.createElement('canvas');cv.className='li-cv';cv.setAttribute('aria-hidden','true');bg.appendChild(cv);cx=cv.getContext('2d');return true;
  }
  function welche(){
    if(hero.getAttribute('data-nb-p')==='1')return 4;
    var best=-1,bo=.35;for(var i=0;i<worte.length;i++){var o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    return best<0?(stufe<0?0:stufe):best+1;
  }
  function glow(x,y,r,a){
    if(a<=.002||r<=.2)return;var h=r*3.4,g=cx.createRadialGradient(x,y,0,x,y,h);
    g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(.13,'rgba(255,236,190,'+a+')');
    g.addColorStop(.3,'rgba(255,190,90,'+(a*.8)+')');g.addColorStop(.55,'rgba(255,150,50,'+(a*.25)+')');g.addColorStop(1,'rgba(255,140,40,0)');
    cx.fillStyle=g;cx.beginPath();cx.arc(x,y,h,0,6.2832);cx.fill();
  }
  function lauf(z){
    requestAnimationFrame(lauf);
    var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;var t=(z-t0)/1000;
    var an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    var W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2);
    if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}
    cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,W,H);
    var gf=document.body.getAttribute('data-gf');
    if(an<.985||gf==='1'||gf==='2'){if(an<.5){stufe=-1;L.a=0;spur=[];rad=0}return}
    var s=welche();if(s!==stufe){stufe=s;stufeZeit=t}
    var seit=t-stufeZeit,k=1-Math.exp(-dt*2.2);
    /* Mitte = Mitte des sichtbaren Worts */
    var w=worte[Math.min(2,Math.max(0,stufe-1))],wr=w&&w.getBoundingClientRect(),mx=W/2,my=H/2;
    if(wr&&wr.width>0){mx=wr.left+wr.width/2;my=wr.top+wr.height/2}
    if(L.a===0){zx=mx;zy=my}
    zx+=(mx-zx)*k;zy+=(my-zy)*k;
    var b=B[Math.min(3,stufe)],zielR=stufe===4?0:Math.min(W*b.w,560),zielV=stufe===4?5:b.v;
    tempo+=(zielV-tempo)*k;winkel+=tempo*dt*(ruhig?.3:1);
    var x,y,r=mobil?7:8;
    if(stufe===4){
      /* Spirale hinein zum Punkt hinter „online“ */
      var p=document.querySelector('.ac-hero .ac-word .ac-rdot-w'),pr=p&&p.getBoundingClientRect(),q=Math.min(1,seit/1.1),e=1-Math.pow(1-q,3);
      rad+=(0-rad)*Math.min(1,dt*3.2);
      var px=pr&&pr.width?pr.left+pr.width/2:zx,py=pr&&pr.height?pr.top+pr.height/2:zy;
      var cxp=zx+(px-zx)*e,cyp=zy+(py-zy)*e;
      x=cxp+Math.cos(winkel)*rad;y=cyp+Math.sin(winkel)*rad*b.h;
      r=(pr&&pr.width?pr.width*.6:5)+(r-(pr&&pr.width?pr.width*.6:5))*(1-e);
    }else{
      rad+=(zielR-rad)*k;x=zx+Math.cos(winkel)*rad;y=zy+Math.sin(winkel)*rad*b.h;
    }
    /* Ellipse wie eine Bahn im Raum: hinten etwas kleiner und blasser */
    var tiefe=stufe===4?1:.78+.22*Math.sin(winkel);
    L.x=x;L.y=y;L.r+=(r*tiefe-L.r)*Math.min(1,dt*8);L.a+=(1-L.a)*k;
    /* feine Bahnspur hinter dem Punkt */
    spur.push([x,y]);var max=Math.round(14+tempo*6);while(spur.length>max)spur.shift();
    for(var i=1;i<spur.length;i++){var f=i/spur.length;cx.strokeStyle='rgba(255,165,60,'+(f*.55*L.a)+')';cx.lineWidth=Math.max(.6,L.r*.55*f);cx.lineCap='round';
      cx.beginPath();cx.moveTo(spur[i-1][0],spur[i-1][1]);cx.lineTo(spur[i][0],spur[i][1]);cx.stroke()}
    var aus=stufe===4&&seit>1.05?Math.max(0,1-(seit-1.05)*2.5):1;
    glow(L.x,L.y,L.r*(1+.05*Math.sin(t*2.4)),L.a*(.55+.45*tiefe)*aus);
    /* kleine Welle, wenn er als Punkt ankommt */
    if(stufe===4&&seit>.95&&seit<2){var wq=(seit-.95)/1.05,pp=document.querySelector('.ac-hero .ac-word .ac-rdot-w'),pb=pp&&pp.getBoundingClientRect();
      if(pb&&pb.width){cx.strokeStyle='rgba(255,160,60,'+((1-wq)*.6)+')';cx.lineWidth=1.4;cx.beginPath();cx.arc(pb.left+pb.width/2,pb.top+pb.height/2,6+wq*46,0,6.2832);cx.stroke()}}
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
