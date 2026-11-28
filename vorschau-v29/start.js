/* v28: Die Startseite (Berg, Wolken, Zähler bis 100 %) läuft wie bisher, endet aber nach den Wolken.
   Dafür wird die Zeitleiste der Startseite nur noch bis zum Ende der Wolken gespielt (T_ENDE), im gleichen Tempo wie vorher.
   Danach kommt die neue Seite (#neu). Die Knöpfe „Erstgespräch anfragen“ öffnen das vorhandene Anfrage-Formular. */
(function(){
  var T_ENDE=2.75,EINHEIT=3/8.4;   /* Bildschirmhöhen pro Zeiteinheit, wie in v27 */
  var hero,tl,ziel=0,jetzt=0;
  function finden(){
    hero=document.querySelector('.intro-berg .ac-hero');var ST=window.ScrollTrigger;
    if(!hero||!ST)return false;
    var st=ST.getAll().filter(function(t){return t.trigger===hero&&t.animation})[0];
    if(!st)return false;tl=st.animation;st.kill(false);tl.pause();return true;
  }
  function lauf(){
    requestAnimationFrame(lauf);
    var h=innerHeight,top=hero.getBoundingClientRect().top+scrollY;
    ziel=Math.min(T_ENDE,Math.max(0,(scrollY-top)/(h*EINHEIT)));
    jetzt+=(ziel-jetzt)*.22;if(Math.abs(ziel-jetzt)<.0005)jetzt=ziel;
    if(Math.abs(tl.time()-jetzt)>.0001)tl.time(jetzt);
  }
  (function warte(n){if(finden())requestAnimationFrame(lauf);else if(n<100)setTimeout(function(){warte(n+1)},150)})(0);
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-anfrage]');if(!a)return;
    var b=document.querySelector('.ic-cta .ic-btn')||document.querySelector('.ic-btn');
    if(b){e.preventDefault();b.click()}
  });
})();
