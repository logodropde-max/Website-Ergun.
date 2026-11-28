/* Nur am Ende: die Wörter wechseln normal, erst bei „Schnell online“ erscheint der gelbe Punkt mit Abstand dahinter.
   (Früher Variante A: der gelbe Punkt ist das Satzzeichen (beginnt erst, wenn „100 %“ ganz weg ist).
   „Persönlich geplant.“ und „Klar gestaltet.“: der Satzpunkt ist der gelbe Punkt. Wechselt das Wort, springt er in einem
   kleinen Bogen ans Ende des neuen Worts und federt beim Landen minimal. Bei „Schnell online“ landet er mit Abstand dahinter.
   Danach zoomt er von dort in die Kamera; im wachsenden Kreis erscheint die Galerie (Kreis von .mg-stage). */
(function(){
  var cv,cx,dk,hero,worte,zaehler,letzt=0,frei=false,leerSeit=-1;
  var ziel=-1,von={x:0,y:0},sprung=-9,P={x:0,y:0,a:0,s:1},land=-9,zoomStart=null;
  var DAUER=.62,GELB='#f5b414';
  function bauen(){
    dk=document.querySelector('.dk');hero=document.querySelector('.ac-hero');zaehler=document.querySelector('.ac-alt-cap');
    if(!dk||!hero)return false;worte=[].slice.call(document.querySelectorAll('.ac-hero .ac-words .ac-word'));if(worte.length<3)return false;
    cv=document.createElement('canvas');cv.className='lp-cv';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);cx=cv.getContext('2d');return true;
  }
  /* den Text-Punkt der ersten beiden Wörter in ein eigenes Element legen, damit der gelbe Punkt genau dort sitzt */
  function satzpunkt(w){
    var s=w.querySelector('.lp-satz');if(s)return s;
    var n=w.lastChild;if(!n||n.nodeType!==3||n.nodeValue.slice(-1)!=='.')return null;
    n.nodeValue=n.nodeValue.slice(0,-1);s=document.createElement('span');s.className='lp-satz';s.textContent='.';w.appendChild(s);return s;
  }
  function weich(q){q=Math.min(1,Math.max(0,q));return q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2}
  function stufe(){
    if(hero.getAttribute('data-nb-p')==='1')return 2;
    var best=-1,bo=.45;for(var i=0;i<3;i++){var o=parseFloat(worte[i].style.opacity);if(isNaN(o))o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    return best;
  }
  function stelle(i){
    var w=worte[i],fs=parseFloat(getComputedStyle(w).fontSize)||40,el=i<2?satzpunkt(w):w.querySelector('.ac-rdot-w');
    var sc=(new DOMMatrix(getComputedStyle(w).transform)).a||1;
    if(!el)return null;var r=el.getBoundingClientRect();if(!r.width)return null;
    if(i<2)return {x:r.left+r.width/2,y:r.top+r.height*.79,r:fs*sc*.095};
    return {x:r.left+r.width/2,y:r.top+r.height/2,r:Math.max(fs*sc*.095,r.width*.5)};
  }
  function kreis(x,y,r,a,sx,sy){
    if(a<=.003||r<=.1)return;cx.save();cx.translate(x,y);cx.scale(sx||1,sy||1);
    var g=cx.createRadialGradient(0,0,0,0,0,r*2.6);g.addColorStop(0,'rgba(245,180,20,'+(a*.28)+')');g.addColorStop(1,'rgba(245,180,20,0)');
    cx.fillStyle=g;cx.beginPath();cx.arc(0,0,r*2.6,0,6.2832);cx.fill();
    cx.globalAlpha=a;cx.fillStyle=GELB;cx.beginPath();cx.arc(0,0,r,0,6.2832);cx.fill();cx.restore();cx.globalAlpha=1;
  }
  function lauf(z){
    requestAnimationFrame(lauf);var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;var t=z/1000;
    var W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2);
    if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}
    cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,W,H);
    var zo=zaehler?+getComputedStyle(zaehler).opacity:0,an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    if(zo>.03||an<.985){frei=false;leerSeit=-1}else{if(leerSeit<0)leerSeit=t;if(t-leerSeit>.3)frei=true}
    document.body.classList.toggle('lp-w',frei);
    var gf=document.body.getAttribute('data-gf');
    /* 8: Zoom in die Kamera */
    var st=document.querySelector('.mg-stage'),kr=null;
    if(st&&(gf==='1'||gf==='2')){var mm=/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/.exec(getComputedStyle(st).clipPath);if(mm){var sr=st.getBoundingClientRect();kr={r:+mm[1],x:sr.left+ +mm[2],y:sr.top+ +mm[3]}}}
    if(kr&&kr.r>.5){
      if(!zoomStart)zoomStart={x:P.x||kr.x,y:P.y||kr.y};var diag=Math.hypot(W,H),mz=weich(kr.r/(diag*.2)),x=zoomStart.x+(kr.x-zoomStart.x)*mz,y=zoomStart.y+(kr.y-zoomStart.y)*mz;
      var aus=Math.min(1,Math.max(0,(kr.r-diag*.25)/(diag*.3))),a=1-aus*aus*(3-2*aus);
      /* wie ein Fenster: der gelbe Punkt öffnet sich, innen erscheint die Galerie, außen bleibt ein feiner gelber Rand */
      var R=Math.max(kr.r,P.r||4),voll=1-weich((R-14)/70);
      if(voll>0){cx.globalAlpha=a*voll;cx.fillStyle=GELB;cx.beginPath();cx.arc(x,y,R,0,6.2832);cx.fill()}
      cx.globalAlpha=a;cx.strokeStyle=GELB;cx.lineWidth=Math.max(2,Math.min(6,R*.03));cx.beginPath();cx.arc(x,y,R,0,6.2832);cx.stroke();cx.globalAlpha=1;return}
    zoomStart=null;
    if(gf==='1'||gf==='2'||!frei){P.a=0;ziel=-1;return}
    var s=stufe();
    if(s<2){P.a=0;ziel=-1;return}
    var zs=stelle(s);if(!zs)return;
    if(s!==ziel){if(ziel<0||P.a<.05){P.x=zs.x;P.y=zs.y;P.r=zs.r;sprung=-9;land=t}else{von={x:P.x,y:P.y,r:P.r};sprung=t}ziel=s}
    var f=(t-sprung)/DAUER;
    if(f>=0&&f<1){
      /* Sprung im Bogen, Höhe passend zur Entfernung */
      var q=weich(f),dist=Math.hypot(zs.x-von.x,zs.y-von.y),h=Math.min(90,40+dist*.35);
      P.x=von.x+(zs.x-von.x)*q;P.y=von.y+(zs.y-von.y)*q-Math.sin(Math.PI*q)*h;P.r=von.r+(zs.r-von.r)*q;
      if(f>.97&&land<sprung)land=t;
    }else{P.x=zs.x;P.y=zs.y;P.r=zs.r;if(f>=1&&land<sprung)land=t}
    /* sanftes Erscheinen beim ersten Wort, kleines Federn beim Landen */
    P.a+=(1-P.a)*Math.min(1,dt*7);
    var lf=(t-land)/.32,sx=1,sy=1;if(lf>=0&&lf<1){var e=Math.sin(lf*Math.PI)*(1-lf);sx=1+.22*e;sy=1-.22*e}
    var auf=Math.min(1,Math.max(0,(t-land)/.45)),pop=auf<1?.2+.8*weich(auf):1;
    kreis(P.x,P.y+(1-sy)*P.r,P.r*pop,P.a,sx,sy);
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
