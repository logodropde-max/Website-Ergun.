/* v89 · kleine Bausteine für das neue Design (Höhenangabe, Korn, roter Ring, „Hallo.“) */
(function(){
  var fertig=false;
  function $(s){return document.querySelector(s)}
  function bauen(){
    var stage=$('.ac-hero-stage'), kontakt=$('section.ic-hero'), logo=$('.ac-logo');
    if(!stage||!kontakt||!logo) return false;
    if(!$('.neu-alt')){var a=document.createElement('div');a.className='neu-alt';a.setAttribute('aria-hidden','true');
      a.innerHTML='<b>8.849<small>m</small></b><span>Mount Everest</span><span>27,99° N · 86,93° O</span>';stage.appendChild(a)}
    if(!$('.neu-korn')){var k=document.createElement('div');k.className='neu-korn';k.setAttribute('aria-hidden','true');document.body.appendChild(k)}
    if(!logo.querySelector('.neu-pkt')){var t=logo.textContent;if(t&&t.trim().slice(-1)==='.'){
      // nur den Punkt einfärben, Rest unverändert lassen
      var w=document.createTreeWalker(logo,NodeFilter.SHOW_TEXT),n,last=null;while(n=w.nextNode()){if(n.nodeValue.indexOf('.')>-1)last=n}
      if(last){var i=last.nodeValue.lastIndexOf('.');var r=last.splitText(i);r.splitText(1);var s=document.createElement('span');s.className='neu-pkt';s.textContent='.';r.parentNode.replaceChild(s,r)}}}
    if(!$('.neu-ring')){var b=document.createElement('button');b.type='button';b.className='neu-ring';b.innerHTML='<span>Kostenloses Erstgespräch anfragen</span>';
      b.addEventListener('click',function(){var c=$('.ic-cta .ic-btn')||$('.ic-btn');if(c)c.click()});document.body.appendChild(b)}
    if(!$('.neu-hallo')){var h=document.createElement('p');h.className='neu-hallo';h.setAttribute('aria-hidden','true');h.innerHTML='Hallo<i></i><b></b>';kontakt.insertBefore(h,kontakt.firstChild)}
    return true;
  }
  function lauf(){
    var a=$('.neu-alt'),h=$('.neu-hallo'),tr=$('.ic-track'),vh=window.innerHeight;
    if(a){a.style.opacity=Math.max(0,1-scrollY/(vh*.55)).toFixed(3)}
    var g=$('.ic-globe');
    if(h&&g){var r=g.getBoundingClientRect(),op=+getComputedStyle(g).opacity||0;
      // „Hallo.“ kommt mit der aufsteigenden Erde und geht, wenn sie aufgeht
      var t=tr?tr.getBoundingClientRect().top:vh;var rein=Math.min(1,Math.max(0,(vh-t)/(vh*.8)));
      h.style.setProperty('--neu-h',(rein*op).toFixed(3))}
    var k=$('.neu-korn'),st=$('.ac-hero-stage');
    if(k&&st){k.style.display=(scrollY<vh*1.6)?'':'none'}
    requestAnimationFrame(lauf);
  }
  (function warte(){if(bauen()){fertig=true;requestAnimationFrame(lauf)}else setTimeout(warte,150)})();
})();
