/* Das gelbe Licht, das der Maus (am Handy dem Finger) folgt, erzählt die drei Wörter (beginnt erst nach den Wolken):
   Persönlich geplant = das Licht folgt dir, wo es ist, leuchtet die Schrift golden auf
   Klar gestaltet     = das Licht sammelt sich groß und warm hinter dem Wort, folgt dir nur noch leicht
   Schnell online     = das Licht ist sofort der leuchtende Punkt am Satzende
   danach wächst der Punkt als Licht zur Galerie und blendet aus. */
(function(){
  var box,dk,hero,worte,stufe=-1,P={x:0,y:0,d:0,a:0},letzt=0,zeig=null,zeigZeit=-9,t0=performance.now();
  function merk(x,y){zeig={x:x,y:y};zeigZeit=performance.now()/1000}
  addEventListener('pointermove',function(e){merk(e.clientX,e.clientY)},{passive:true});
  addEventListener('touchmove',function(e){var t=e.touches[0];if(t)merk(t.clientX,t.clientY)},{passive:true});
  addEventListener('touchstart',function(e){var t=e.touches[0];if(t)merk(t.clientX,t.clientY)},{passive:true});
  function bauen(){
    dk=document.querySelector('.dk');hero=document.querySelector('.ac-hero');
    if(!dk||!hero)return false;worte=[].slice.call(document.querySelectorAll('.ac-hero .ac-words .ac-word'));if(!worte.length)return false;
    box=document.createElement('div');box.className='lp-box';box.setAttribute('aria-hidden','true');document.body.appendChild(box);return true;
  }
  function welche(){
    if(hero.getAttribute('data-nb-p')==='1')return 4;
    var best=-1,bo=.3;for(var i=0;i<worte.length;i++){var o=parseFloat(worte[i].style.opacity);if(isNaN(o))o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    return best<0?(stufe<0?0:stufe):best+1;
  }
  function lauf(z){
    requestAnimationFrame(lauf);var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;var t=z/1000;
    var W=innerWidth,H=innerHeight,m=Math.min(W,H);
    var an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    var gf=document.body.getAttribute('data-gf'),s=welche();stufe=s;
    var w=worte[Math.min(2,Math.max(0,Math.min(stufe,3)-1))],wr=w&&w.getBoundingClientRect(),cx0=W/2,cy0=H/2,wh=40;
    if(wr&&wr.width>0){cx0=wr.left+wr.width/2;cy0=wr.top+wr.height/2;wh=wr.height}
    var aktiv=zeig&&(t-zeigZeit)<2.5,ziel={a:0},kern=.14;
    var st=document.querySelector('.mg-stage'),kr=null;
    if(st&&(gf==='1'||gf==='2')){var mm=/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/.exec(getComputedStyle(st).clipPath);if(mm){var sr=st.getBoundingClientRect();kr={r:+mm[1],x:sr.left+ +mm[2],y:sr.top+ +mm[3]}}}
    if(kr&&kr.r>.5){var diag=Math.hypot(W,H),aus=Math.min(1,Math.max(0,(kr.r-diag*.2)/(diag*.3)));ziel={x:kr.x,y:kr.y,d:kr.r*2/.5,a:1-aus*aus*(3-2*aus)};kern=.5}
    else if(gf==='1'||gf==='2'){ziel={a:0}}
    else if(an>.985){
      if(stufe<=1){var fx=cx0+Math.sin(t*.7)*W*.28,fy=cy0+Math.sin(t*1.3)*wh*1.6;
        ziel={x:aktiv?zeig.x:fx,y:aktiv?zeig.y:fy,d:m*.42,a:1}}
      else if(stufe===2){var ox=aktiv?(zeig.x-cx0)*.15:0,oy=aktiv?(zeig.y-cy0)*.15:0;ziel={x:cx0+ox,y:cy0+oy,d:m*.95,a:1};kern=.09}
      else{var p=document.querySelector('.ac-hero .ac-word .ac-rdot-w'),pr=p&&p.getBoundingClientRect(),pw=pr&&pr.width>0?pr.width:9;
        ziel={x:pr&&pr.width>0?pr.left+pr.width/2:(wr?wr.right:cx0)+8,y:pr&&pr.width>0?pr.top+pr.height/2:cy0+wh*.25,d:pw*5,a:1};kern=.2}
    }
    var folgt=!!(kr&&kr.r>.5),k=folgt?1:1-Math.exp(-dt*(stufe>=3?7:(stufe<=1?5:3)));
    if(ziel.x!==undefined){if(P.a<.01){P.x=ziel.x;P.y=ziel.y;P.d=ziel.d*.4}P.x+=(ziel.x-P.x)*k;P.y+=(ziel.y-P.y)*k;P.d+=(ziel.d-P.d)*k}
    P.a+=((ziel.a||0)-P.a)*(folgt?1:1-Math.exp(-dt*4));
    P.k=(P.k||kern)+(kern-(P.k||kern))*Math.min(1,dt*5);
    /* Schrift leuchtet dort golden, wo das Licht ist */
    var sp=document.querySelectorAll('.goo-lage span');for(var j=0;j<sp.length;j++){var rr=sp[j].getBoundingClientRect();sp[j].style.setProperty('--lp-x',(P.x-rr.left).toFixed(1)+'px');sp[j].style.setProperty('--lp-y',(P.y-rr.top).toFixed(1)+'px')}
    document.body.style.setProperty('--lp-r',(Math.max(40,P.d*.32)).toFixed(1)+'px');document.body.style.setProperty('--lp-a',(P.a*(stufe<=2?1:.4)).toFixed(3));
    if(P.a<.01){box.style.opacity=0;return}
    var D=Math.max(4,P.d),puls=1+.035*Math.sin(t*2.3);
    box.style.opacity=P.a.toFixed(3);box.style.width=box.style.height=D.toFixed(1)+'px';
    box.style.setProperty('--lp-kern',(P.k*100).toFixed(1)+'%');
    box.style.transform='translate3d('+(P.x-D/2).toFixed(1)+'px,'+(P.y-D/2).toFixed(1)+'px,0) scale('+puls.toFixed(3)+')';
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
