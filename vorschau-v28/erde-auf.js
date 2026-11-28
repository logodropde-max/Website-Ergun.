/* Erde geht auf (wie der Punkt am Anfang): Aus der Erde wächst ein Kreis, darin der Sternenhimmel und die helle Schrift.
   Die Erde selbst blendet dabei weich aus. Fortschritt kommt aus der Lage des Kontakt-Abschnitts. */
(function(){
  var q=function(s){return document.querySelector(s)};
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function lauf(){
    var tr=q('.ic-track'),hero=q('section.ic-hero'),ball=q('.ic-ball'),globe=q('.ic-globe');
    if(tr&&hero&&ball){
      var vh=window.innerHeight,vw=window.innerWidth,top=tr.getBoundingClientRect().top;
      // Start, wenn die Erde in der Mitte angekommen ist; ganz offen etwa einen halben Bildschirm später
      var p=Math.min(1,Math.max(0,(-top-vh*.95)/(vh*.5)));
      var e=ease(p),b=ball.getBoundingClientRect(),h=hero.getBoundingClientRect();
      var cx=b.left+b.width/2-h.left,cy=b.top+b.height/2-h.top,r0=b.width/2;
      var weit=Math.hypot(Math.max(cx,vw-cx),Math.max(cy,vh-cy))+40;
      var r=p<=0?0:r0*.98+(weit-r0*.98)*e;
      hero.style.setProperty('--auf-r',r.toFixed(1)+'px');
      hero.style.setProperty('--auf-x',cx.toFixed(1)+'px');
      hero.style.setProperty('--auf-y',cy.toFixed(1)+'px');
      if(globe){globe.style.opacity=(1-Math.min(1,e*1.6)).toFixed(3)}
    }
    requestAnimationFrame(lauf);
  }
  requestAnimationFrame(lauf);
})();
