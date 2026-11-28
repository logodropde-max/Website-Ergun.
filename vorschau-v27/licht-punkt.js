/* Der gelbe Punkt erzählt die drei Wörter, ohne die Schrift zu berühren (beginnt erst, wenn „100 %“ ganz weg ist):
   Persönlich geplant = der Punkt setzt unter dem Wort drei Planpunkte, fein verbunden (ein Plan entsteht)
   Klar gestaltet     = der Punkt zieht eine saubere Linie unter dem Wort und holt sie wieder ein (klare Form)
   Schnell online     = der Punkt landet mit Abstand neben „online“ und sendet zwei Signalwellen (live)
   danach zoomt er von dort in die Kamera und wird groß zur Galerie (Kreis von .mg-stage). */
(function(){
  var cv,cx,dk,hero,worte,zaehler,stufe=-1,start=0,letzt=0,frei=false,leerSeit=-1;
  var P={x:0,y:0,a:0},spuren=[];
  var GELB='255,196,40';
  function bauen(){
    dk=document.querySelector('.dk');hero=document.querySelector('.ac-hero');zaehler=document.querySelector('.ac-alt-cap');
    if(!dk||!hero)return false;worte=[].slice.call(document.querySelectorAll('.ac-hero .ac-words .ac-word'));if(!worte.length)return false;
    cv=document.createElement('canvas');cv.className='lp-cv';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);cx=cv.getContext('2d');return true;
  }
  function weich(q){q=Math.min(1,Math.max(0,q));return q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2}
  function welche(){
    if(hero.getAttribute('data-nb-p')==='1')return 3;
    var best=-1,bo=.3;for(var i=0;i<worte.length;i++){var o=parseFloat(worte[i].style.opacity);if(isNaN(o))o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    return best<0?stufe:best+1;
  }
  function punkt(x,y,r,a){
    if(a<=.003||r<=.1)return;var g=cx.createRadialGradient(x,y,0,x,y,r*3.2);
    g.addColorStop(0,'rgba(255,253,240,'+a+')');g.addColorStop(.22,'rgba(255,222,90,'+a+')');g.addColorStop(.32,'rgba('+GELB+','+(a*.95)+')');
    g.addColorStop(.42,'rgba('+GELB+','+(a*.35)+')');g.addColorStop(1,'rgba('+GELB+',0)');
    cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r*3.2,0,6.2832);cx.fill();
  }
  function lauf(z){
    requestAnimationFrame(lauf);var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;var t=z/1000;
    var W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2);
    if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}
    cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,W,H);
    /* erst wenn „100 %“ ganz verschwunden ist, dürfen die Wörter kommen */
    var zo=zaehler?+getComputedStyle(zaehler).opacity:0,an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    if(zo>.03||an<.985){frei=false;leerSeit=-1}else{if(leerSeit<0)leerSeit=t;if(t-leerSeit>.3)frei=true}
    document.body.classList.toggle('lp-w',frei);
    var gf=document.body.getAttribute('data-gf');
    /* Zoom in die Kamera: folgt dem wachsenden Kreis */
    var st=document.querySelector('.mg-stage'),kr=null;
    if(st&&(gf==='1'||gf==='2')){var mm=/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/.exec(getComputedStyle(st).clipPath);if(mm){var sr=st.getBoundingClientRect();kr={r:+mm[1],x:sr.left+ +mm[2],y:sr.top+ +mm[3]}}}
    if(kr&&kr.r>.5){var diag=Math.hypot(W,H),aus=Math.min(1,Math.max(0,(kr.r-diag*.22)/(diag*.3)));
      if(!P.z){P.z={x:P.x||kr.x,y:P.y||kr.y}}var mz=weich(kr.r/(diag*.2));kr={r:kr.r,x:P.z.x+(kr.x-P.z.x)*mz,y:P.z.y+(kr.y-P.z.y)*mz};
      var a=1-aus*aus*(3-2*aus),R=Math.max(kr.r,4);
      var g=cx.createRadialGradient(kr.x,kr.y,0,kr.x,kr.y,R*1.25);g.addColorStop(0,'rgba(255,253,240,'+a+')');g.addColorStop(.55,'rgba(255,222,90,'+a+')');
      g.addColorStop(.8,'rgba('+GELB+','+(a*.9)+')');g.addColorStop(1,'rgba('+GELB+',0)');cx.fillStyle=g;cx.beginPath();cx.arc(kr.x,kr.y,R*1.25,0,6.2832);cx.fill();
      P.x=kr.x;P.y=kr.y;return}
    if(!(gf==='1'||gf==='2'))P.z=null;
    if(gf==='1'||gf==='2'||!frei){P.a=0;spuren=[];stufe=-1;return}
    var s=welche();if(s!==stufe&&s>0){stufe=s;start=t;if(s!==2)spuren=[]}
    if(stufe<1)return;
    var w=worte[stufe-1],r=w.getBoundingClientRect(),cs=getComputedStyle(w),fs=parseFloat(cs.fontSize)||40;
    var rad=Math.max(3,fs*.11),unten=r.bottom+fs*.42,f=t-start,mx=r.left+r.width/2,tx=P.x,ty=P.y,a=1;
    if(stufe===1){
      /* drei Planpunkte: links, Mitte, rechts unter dem Wort, fein verbunden */
      var pts=[[r.left+r.width*.18,unten+fs*.06],[mx,unten-fs*.08],[r.right-r.width*.18,unten+fs*.06]];
      var seg=.55,i=Math.min(2,Math.floor(Math.max(0,f-.35)/seg)),q=weich((Math.max(0,f-.35)-i*seg)/seg*1.4);
      if(f<.35){tx=pts[0][0];ty=pts[0][1];a=f/.35}
      else if(i<2&&f<.35+2*seg){tx=pts[i][0]+(pts[i+1][0]-pts[i][0])*q;ty=pts[i][1]+(pts[i+1][1]-pts[i][1])*q}
      else{tx=pts[2][0];ty=pts[2][1]}
      var gesetzt=Math.min(3,1+Math.floor(Math.max(0,f-.35)/seg));
      cx.strokeStyle='rgba(200,150,20,.32)';cx.lineWidth=1;cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);
      for(var k=1;k<gesetzt;k++)cx.lineTo(pts[k][0],pts[k][1]);if(gesetzt<3)cx.lineTo(tx,ty);cx.stroke();
      for(var k2=0;k2<gesetzt;k2++){cx.fillStyle='rgba(214,160,20,.55)';cx.beginPath();cx.arc(pts[k2][0],pts[k2][1],Math.max(1.6,rad*.38),0,6.2832);cx.fill()}
    }else if(stufe===2){
      /* saubere Linie: zum Anfang, Linie ziehen, Linie einholen */
      var L0=r.left,L1=r.right,y2=unten;
      if(f<.5){var q0=weich(f/.5);tx=P.x+(L0-P.x)*q0;ty=P.y+(y2-P.y)*q0}
      else if(f<1.4){var q1=weich((f-.5)/.9);tx=L0+(L1-L0)*q1;ty=y2;cx.strokeStyle='rgba('+GELB+',.9)';cx.lineWidth=1.6;cx.lineCap='round';cx.beginPath();cx.moveTo(L0,y2);cx.lineTo(tx,y2);cx.stroke()}
      else if(f<2){var q2=weich((f-1.4)/.6);tx=L1;ty=y2;cx.strokeStyle='rgba('+GELB+',.9)';cx.lineWidth=1.6;cx.lineCap='round';cx.beginPath();cx.moveTo(L0+(L1-L0)*q2,y2);cx.lineTo(L1,y2);cx.stroke()}
      else{tx=L1;ty=y2}
    }else{
      /* landet mit Abstand neben „online“ (dort sitzt der echte Punkt) und sendet zwei Signalwellen */
      var p=document.querySelector('.ac-hero .ac-word .ac-rdot-w'),pr=p&&p.getBoundingClientRect();
      var zx=pr&&pr.width>0?pr.left+pr.width/2:r.right+fs*.36,zy=pr&&pr.width>0?pr.top+pr.height/2:r.top+r.height*.74;
      var q3=weich(f/.7);tx=P.x+(zx-P.x)*Math.min(1,q3*1.0);ty=P.y+(zy-P.y)*Math.min(1,q3);
      if(f>.7){tx=zx;ty=zy;for(var j=0;j<2;j++){var wq=(f-.7-j*.35)/1;if(wq>0&&wq<1){cx.strokeStyle='rgba('+GELB+','+((1-wq)*.55)+')';cx.lineWidth=1.2;cx.beginPath();cx.arc(zx,zy,rad*(1.4+wq*5),0,6.2832);cx.stroke()}}}
      rad=pr&&pr.width>0?Math.max(rad,pr.width*.55):rad;
    }
    P.x=tx;P.y=ty;P.a+=(a-P.a)*Math.min(1,dt*8);
    punkt(P.x,P.y,rad*(1+.04*Math.sin(t*2.6)),P.a);
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
