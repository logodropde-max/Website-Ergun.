/* Gooey Text Morphing (21st, Victor Welander) für die drei Wörter, wie im Original zeitgesteuert:
   wechselt das Wort, läuft eine Sekunde lang ein Morph: altes Wort verschwimmt (Unschärfe min(8/f-8,100) px, Deckkraft f^0.4),
   das neue entsteht, ein SVG-Schwellwert-Filter (Alpha*255-140) lässt beide zähflüssig ineinanderlaufen.
   Die Original-Wörter bleiben für den Ablauf zuständig, sind aber durchsichtig; der Punkt bleibt das echte Element. */
(function(){
  document.body.insertAdjacentHTML('afterbegin','<svg aria-hidden="true" width="0" height="0" style="position:absolute"><defs><filter id="gooey-schwelle"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"/></filter></defs></svg>');
  /* Safari/iPhone: SVG-Filter auf HTML ist dort unzuverlässig (Text kann ganz verschwinden) -> dort ohne Schwelle, nur weiches Ineinanderblenden */
  var ua=navigator.userAgent,safari=/iP(hone|ad|od)/.test(ua)||(/Safari/.test(ua)&&!/Chrome|Chromium|CriOS|Android|Edg/.test(ua))||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var DAUER=1,box,worte,lage,a,b,dk,hero,stufe=-1,vorher='',jetzt='',start=-9;
  function text(w){var c=w.cloneNode(true),d=c.querySelector('.ac-rdot-w');if(d)d.remove();return c.textContent.replace(/\s+/g,' ').trim()}
  function bauen(){
    box=document.querySelector('.ac-hero .ac-words');dk=document.querySelector('.dk');hero=document.querySelector('.ac-hero');
    if(!box||!dk||!hero)return false;worte=[].slice.call(box.querySelectorAll('.ac-word'));if(!worte.length)return false;
    lage=document.createElement('div');lage.className='goo-lage';lage.setAttribute('aria-hidden','true');
    lage.innerHTML='<span class="goo-a"></span><span class="goo-b"></span>';document.body.appendChild(lage);
    a=lage.children[0];b=lage.children[1];return true;
  }
  function setze(el,f){
    if(f<=.001){el.style.opacity=0;el.style.filter='none';return}
    el.style.opacity=(safari?f:Math.pow(f,.4)).toFixed(3);el.style.filter=f>=.999?'none':'blur('+Math.min(8/f-8,safari?14:100).toFixed(2)+'px)';
  }
  function lauf(z){
    requestAnimationFrame(lauf);var t=z/1000;
    var an=parseFloat(dk.style.opacity);if(isNaN(an))an=+getComputedStyle(dk).opacity||0;
    var gf=document.body.getAttribute('data-gf');
    var best=-1,bo=.3;for(var i=0;i<worte.length;i++){var o=parseFloat(worte[i].style.opacity);if(isNaN(o))o=+getComputedStyle(worte[i]).opacity;if(o>bo){bo=o;best=i}}
    if(hero.getAttribute('data-nb-p')==='1')best=worte.length-1;
    var sicht=an>.5&&gf!=='1'&&gf!=='2';
    lage.style.visibility=sicht?'visible':'hidden';
    document.body.classList.toggle('goo-an',sicht&&stufe>=0&&!!jetzt);
    if(best!==stufe&&best>=0){vorher=jetzt;jetzt=text(worte[best]);stufe=best;start=t;a.textContent=vorher;b.textContent=jetzt}
    if(stufe<0)return;
    /* Lage und Schrift vom sichtbaren Wort übernehmen */
    var w=worte[stufe],r=w.getBoundingClientRect(),cs=getComputedStyle(w);
    lage.style.left=(r.left+r.width/2)+'px';lage.style.top=(r.top+r.height/2)+'px';
    lage.style.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+'/'+cs.lineHeight+' '+cs.fontFamily;lage.style.letterSpacing=cs.letterSpacing;
    lage.style.color=cs.getPropertyValue('--goo-farbe')||'#0f1830';
    var f=Math.min(1,(t-start)/DAUER);
    setze(a,1-f);setze(b,f);
    lage.style.filter=(f<1&&!safari)?'url(#gooey-schwelle)':'none';
  }
  (function warte(){if(bauen())requestAnimationFrame(lauf);else setTimeout(warte,200)})();
})();
