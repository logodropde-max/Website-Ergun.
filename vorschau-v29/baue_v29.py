import re, shutil, os
REPO='/home/claude/website-ergun._'
V28=REPO+'/vorschau-v28'; V29=REPO+'/vorschau-v29'
if os.path.exists(V29): shutil.rmtree(V29)
shutil.copytree(V28,V29)
for f in ['baue_v28.py','LIZENZ-Vorlage-Inertia-MIT.txt']: os.remove(V29+'/'+f)
os.rename(V29+'/v28.js',V29+'/start.js')
shutil.copy('/home/claude/drache-bau/drache.js',V29+'/drache.js')
shutil.copy('/home/claude/drache-bau/baue_v29.py',V29+'/baue_v29.py')
open(V29+'/LIZENZ-Vorlage-Dragon-Type-Specimen.txt','w').write('Vorlage: Dragon Type Specimen v1.0.0 (21st.dev), angepasst für ERGUN.: Texte, Umlaute in der Schrift, leichtere Darstellung auf dem Handy.\n')

p=V29+'/index.html'; x=open(p,encoding='utf-8').read()
x=re.sub(r'<script data-8b-part="motion-gate">.*?</script>\n','',x,flags=re.S)
x=re.sub(r'<style id="inertia">.*?</style>\n','',x,flags=re.S)
x=re.sub(r'<div class="inz" id="neu">.*?</footer></div>\n<script>.*?</script>\n','',x,flags=re.S)
assert 'class="inz"' not in x and 'id="inertia"' not in x
x=x.replace('v28.js?v=1','start.js?v=1')
x=x.replace('.inz{position:relative;z-index:5;background:var(--color-1);font-family:var(--font-1)}\n','')

arbeiten=[('Elektro Rehder','Handwerk','elektro-rehder'),('Praxis Lindhorst','Physiotherapie','praxis-lindhorst'),
          ('Yilmaz &amp; Co. Realty','Immobilien','yilmaz-realty'),('Lumora','Onlineshop','lumora'),('Orbis','Onlineshop','orbis')]
karten=''.join('<a class="ea-karte zeig" href="../beispiele/%s/"><figure><img src="../beispiele/%s/vorschau.webp" alt="Vorschau der Beispielseite %s" width="800" height="500" loading="lazy"></figure><div class="ea-zeile"><span class="ea-name">%s</span><span class="ea-art">%s</span><span class="ea-pfeil">Ansehen ↗</span></div></a>'%(d,d,n,n,k) for n,k,d in arbeiten)
schritte=[('Erstgespräch','Kostenlos und unverbindlich, persönlich oder per Video, wo Sie wollen. Sie erzählen, was Sie brauchen.'),
          ('Plan und Preis','Wir planen Ihre Website individuell. Danach bekommen Sie einen festen Preis.'),
          ('Gestaltung','Wir gestalten und bauen Ihre Seite. Sie sehen den Entwurf und sagen, was passt.'),
          ('Online','Ihre Website geht online. Wir bleiben für Sie ansprechbar.')]
li=''.join('<li class="eb-schritt zeig"><span class="eb-nr" data-drachenwort="%d" data-fett></span><div><h3>%s</h3><p>%s</p></div></li>'%(i+1,h,t) for i,(h,t) in enumerate(schritte))
html='''<div id="drache-bereich">
<div id="drache"></div>
<section class="e-arbeiten" id="arbeiten-neu">
  <p class="e-klein zeig">Beispielseiten von ERGUN.</p>
  <h2 class="e-wort zeig" data-drachenwort="UNSERE ARBEITEN">Unsere Arbeiten</h2>
  <div class="ea-gitter">'''+karten+'''</div>
</section>
<section class="e-ablauf" id="ablauf">
  <p class="e-klein zeig">Vom ersten Gespräch bis online</p>
  <h2 class="e-wort zeig" data-drachenwort="SO LÄUFT ES AB">So läuft es ab</h2>
  <ol class="eb-liste">'''+li+'''</ol>
</section>
<section class="e-kontakt" id="kontakt">
  <p class="e-klein zeig">Kontakt</p>
  <h2 class="e-wort zeig" data-drachenwort="LASSEN SIE UNS REDEN." data-fett>Lassen Sie uns reden.</h2>
  <p class="ek-text zeig">Das Erstgespräch ist kostenlos und findet statt, wo Sie wollen: persönlich oder per Video. Erzählen Sie uns kurz, was Sie brauchen. Wir melden uns bei Ihnen.</p>
  <a class="ek-knopf zeig" href="#kontakt" data-anfrage>Erstgespräch anfragen <span aria-hidden="true">→</span></a>
</section>
<div id="fuss-platz"></div>
</div>
'''
css='''
/* v29: nach Berg und Wolken das Drachen-Buch (21st „Dragon Type Specimen“) mit ERGUN.-Inhalten, danach Arbeiten, Ablauf, Kontakt und der Fuß mit dem Gemälde */
#drache-bereich{position:relative;z-index:5;background:#de0902;color:#fdc80f;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
#drache-bereich *{box-sizing:border-box}
#drache .relative{position:relative}#drache .absolute{position:absolute}#drache .sticky{position:sticky}#drache .top-0{top:0}
#drache .w-full{width:100%}#drache .overflow-hidden{overflow:hidden}#drache .select-none{user-select:none;-webkit-user-select:none}
#drache .pointer-events-none{pointer-events:none}#drache .inset-x-0{left:0;right:0}#drache .bottom-12{bottom:3rem}
#drache .flex{display:flex}#drache .flex-col{flex-direction:column}#drache .items-center{align-items:center}#drache .gap-2{gap:.5rem}
#drache .font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}#drache .uppercase{text-transform:uppercase}
#drache .text-\\[10px\\]{font-size:10px}#drache .tracking-\\[0\\.35em\\]{letter-spacing:.35em}
#drache .transition-opacity{transition:opacity 1s}#drache .block{display:block}#drache .h-6{height:1.5rem}#drache .w-px{width:1px}
#drache .animate-pulse{animation:dr-puls 2s cubic-bezier(.4,0,.6,1) infinite}@keyframes dr-puls{50%{opacity:.5}}
#drache svg{overflow:visible}
.e-klein{font:500 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3em;text-transform:uppercase;margin:0 0 18px}
.e-wort{max-width:100%;height:clamp(34px,7vw,92px);margin:0 0 clamp(36px,6vw,72px);color:inherit;font-size:0}
#drache-bereich section{padding:clamp(80px,12vw,160px) clamp(20px,5vw,72px)}
.e-arbeiten{background:#0b0a0b;color:#fdc80f}
.ea-gitter{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr));gap:clamp(20px,3vw,40px)}
.ea-karte{display:block;color:inherit;text-decoration:none}
.ea-karte figure{margin:0;overflow:hidden;aspect-ratio:16/10;background:#1a1718;border:1px solid rgba(253,200,15,.25)}
.ea-karte img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.2,.7,.2,1)}
.ea-karte:hover img{transform:scale(1.05)}
.ea-zeile{display:flex;gap:16px;align-items:baseline;padding:14px 0 0;border-top:1px solid rgba(253,200,15,.25);margin-top:14px}
.ea-name{font-size:clamp(18px,2vw,24px);font-weight:600;flex:1}
.ea-art,.ea-pfeil{font:500 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;opacity:.8}
.e-ablauf{background:#de0902;color:#fdc80f}
.eb-liste{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:clamp(28px,4vw,56px)}
.eb-schritt{border-top:2px solid #fdc80f;padding-top:22px}
.eb-nr{display:block;height:clamp(56px,7vw,96px);margin-bottom:22px}
.eb-schritt h3{font-size:clamp(20px,2vw,26px);margin:0 0 10px;font-weight:700}
.eb-schritt p{margin:0;font-size:16px;line-height:1.55;max-width:34ch}
.e-kontakt{background:#fdc80f;color:#0b0a0b;text-align:left}
.e-kontakt .e-wort{height:clamp(40px,8.5vw,120px)}
.ek-text{font-size:clamp(17px,1.6vw,21px);line-height:1.55;max-width:46ch;margin:0 0 36px}
.ek-knopf{display:inline-flex;gap:14px;align-items:center;background:#0b0a0b;color:#fdc80f;text-decoration:none;font-weight:700;font-size:17px;padding:18px 28px;transition:transform .3s,background .3s}
.ek-knopf:hover{transform:translateY(-2px);background:#de0902}
.zeig{opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}
.zeig.da{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.zeig{opacity:1;transform:none;transition:none}}
/* der Fuß mit dem Gemälde (Wilde Jagd) wird ans Ende geholt; der Rest des alten Schlusses bleibt aus */
.ergun-schluss{display:block!important}
.ergun-schluss > :not(.whf-root){display:none!important}
#fuss-platz .whf-root{position:relative;z-index:1}
/* der Fuß wieder mit dem Gemälde der Wilden Jagd (Reiter), dunkel wie im Original */
#fuss-platz .whf-root.ergun-jagd{background:#0e1422!important;color:#eef1f8!important}
#fuss-platz .ergun-jagd .whf-picture,#fuss-platz .ergun-jagd .whf-grain{display:block!important}
#fuss-platz .ergun-jagd .whf-cutout{display:block!important}
#fuss-platz .ergun-jagd .whf-picture{-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 14%,#000 60%,rgba(0,0,0,.5) 80%,transparent 100%)!important;mask-image:linear-gradient(180deg,transparent 0,#000 14%,#000 60%,rgba(0,0,0,.5) 80%,transparent 100%)!important}
#fuss-platz .ergun-jagd,#fuss-platz .ergun-jagd a,#fuss-platz .ergun-jagd .whf-legal,#fuss-platz .ergun-jagd .whf-up{color:#eef1f8!important;-webkit-text-fill-color:#eef1f8}
'''
i=x.rindex('</style>'); x=x[:i]+css+x[i:]
js='''<script>
/* v29: Abschnitte einblenden, Fuß ans Ende holen */
(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('da');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('#drache-bereich .zeig').forEach(function(el){io.observe(el)});
  (function hol(n){var f=document.querySelector('.whf-root.ergun-jagd'),z=document.getElementById('fuss-platz');
    if(f&&z){z.appendChild(f);f.querySelectorAll('a').forEach(function(a){var t=a.textContent.trim().toLowerCase();if(t==='arbeiten')a.setAttribute('href','#arbeiten-neu');if(t==='kontakt')a.setAttribute('href','#kontakt')});window.dispatchEvent(new Event('resize'))}else if(n<80)setTimeout(function(){hol(n+1)},150)})(0);
})();
</script>
<script src="drache.js?v=1"></script>
'''
x=x.replace('</body>',html+js+'</body>',1)
open(p,'w',encoding='utf-8').write(x)
print('ok')
