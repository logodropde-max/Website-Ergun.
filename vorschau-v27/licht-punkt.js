/* Das gelbe Licht, Wort für Wort, ruhig und gleichbleibend (beginnt erst nach den Wolken, folgt nicht der Maus):
   Jedes Wort entsteht (Gooey), dann gleitet das Licht einmal sauber von links nach rechts an der Schrift entlang
   und lässt die Buchstaben, an denen es vorbeikommt, kurz golden aufleuchten. Bei „Persönlich geplant.“ und „Klar gestaltet.“
   verlischt es am Wortende, bei „Schnell online“ bleibt es am Ende stehen und ist der Punkt. Danach wächst es zur Galerie. */
(function(){
  var box,dk,hero,worte,stufe=-1,start=0,P={x:0,y:0,d:0,a:0,k:.2},letzt=0;
  var WARTE=.85,GLEIT=1.1,AUS=.45;
  function bauen(){
    dk=document.querySelector('.dk');hero=document.querySelector('.ac-hero');
    if(!dk||!hero)return false;worte=[].slice.call(document.querySelectorAll('.ac-hero .ac-words .ac-word'));if(!worte.length)return false;
    box=document.createElement('div');box.className='lp-box';box.setAttribute('aria-hidden','true');document.body.appendChild(box);return true;
  }
  function welche(){
    if(hero.getAttribute('data-nb-p')==='1')return 3;
    var best=-1,bo=.3;for(var i=0;i<worte.length;i++){var o=parseFloat(worte[i].style.opacity);if(isNaN(o))o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    return best<0?stufe:best+1;
  }
  function weich(q){q=Math.min(1,Math.max(0,q));return q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2}
  function lauf(z){
    requestAnimationFrame(lauf);var dt=Math.min(.05,letzt?(z-letzt)/1000:.016);letzt=z;var t=z/1000;
    var W=innerWidth,H=innerHeight;
    var an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    var gf=document.body.getAttribute('data-gf'),s=welche();
    if(s!==stufe&&s>0){stufe=s;start=t}
    var ziel={a:0},kern=.2,glanz=0;
    var st=document.querySelector('.mg-stage'),kr=null;
    if(st&&(gf==='1'||gf==='2')){var mm=/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/.exec(getComputedStyle(st).clipPath);if(mm){var sr=st.getBoundingClientRect();kr={r:+mm[1],x:sr.left+ +mm[2],y:sr.top+ +mm[3]}}}
    if(kr&&kr.r>.5){var diag=Math.hypot(W,H),aus=Math.min(1,Math.max(0,(kr.r-diag*.2)/(diag*.3)));ziel={x:kr.x,y:kr.y,d:kr.r*2/.5,a:1-aus*aus*(3-2*aus)};kern=.5}
    else if(gf==='1'||gf==='2'||an<.985||stufe<1){ziel={a:0}}
    else{
      /* sichtbares Wort: bei Stufe 3 das letzte, auch wenn das Original-Wort gerade ausgeblendet ist */
      var w=worte[stufe-1],l=document.querySelector('.goo-lage .goo-b'),r=(l&&l.textContent?l:w).getBoundingClientRect();
      var hh=r.height||40,y=r.top+hh*.72,x0=r.left-hh*.15,x1=r.right+hh*.12,f=t-start;
      var letztes=stufe===3,p=document.querySelector('.ac-hero .ac-word .ac-rdot-w'),pr=p&&p.getBoundingClientRect();
      if(letztes&&pr&&pr.width>0){x1=pr.left+pr.width/2;}
      var y1=letztes&&pr&&pr.width>0?pr.top+pr.height/2:y;
      var q=weich((f-WARTE)/GLEIT),x=x0+(x1-x0)*q,yy=y+(y1-y)*q;
      var ein=Math.min(1,Math.max(0,(f-WARTE*.45)/(WARTE*.5)));
      var aus2=letztes?0:Math.min(1,Math.max(0,(f-WARTE-GLEIT)/AUS));
      var dpunkt=letztes&&pr&&pr.width>0?pr.width*4.2:hh*.9;
      ziel={x:x,y:yy,d:hh*.9+(dpunkt-hh*.9)*q,a:ein*(1-aus2)};
      glanz=(q>0&&q<1)?1:0;
      if(P.a<.01){P.x=x;P.y=yy;P.d=ziel.d}
      P.x=x;P.y=yy;P.d=ziel.d;
    }
    var folgt=!!(kr&&kr.r>.5);
    if(folgt){P.x=ziel.x;P.y=ziel.y;P.d=ziel.d}
    P.a+=((ziel.a||0)-P.a)*(folgt?1:Math.min(1,dt*10));
    P.k+=(kern-P.k)*Math.min(1,dt*5);
    /* die Buchstaben am Licht leuchten kurz golden auf */
    var sp=document.querySelectorAll('.goo-lage span');for(var j=0;j<sp.length;j++){var rr=sp[j].getBoundingClientRect();sp[j].style.setProperty('--lp-x',(P.x-rr.left).toFixed(1)+'px');sp[j].style.setProperty('--lp-y',(P.y-rr.top).toFixed(1)+'px')}
    document.body.style.setProperty('--lp-r',(Math.max(30,P.d*.9)).toFixed(1)+'px');document.body.style.setProperty('--lp-a',(P.a*glanz*.95).toFixed(3));
    if(P.a<.01){box.style.opacity=0;return}
    var D=Math.max(4,P.d);
    box.style.opacity=P.a.toFixed(3);box.style.width=box.style.height=D.toFixed(1)+'px';
    box.style.setProperty('--lp-kern',(P.k*100).toFixed(1)+'%');
    box.style.transform='translate3d('+(P.x-D/2).toFixed(1)+'px,'+(P.y-D/2).toFixed(1)+'px,0)';
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
