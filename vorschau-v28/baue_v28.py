import re, shutil, os
SRC='/tmp/vorlagen/inertia/index.html'
REPO='/home/claude/website-ergun._'
V27=REPO+'/vorschau-v27'; V28=REPO+'/vorschau-v28'
if os.path.exists(V28): shutil.rmtree(V28)
shutil.copytree(V27,V28)
for f in ['licht-punkt.js','gooey.js','feuerpunkt.js','licht.js']:
    p=V28+'/'+f
    if os.path.exists(p): os.remove(p)
s=open(SRC,encoding='utf-8').read()

# ---------- CSS scopen ----------
PFX='.inz'
def scope_sel(sel):
    sel=sel.strip()
    if not sel: return sel
    m=re.match(r'^(html(?:\[[^\]]*\])*)(.*)$',sel)
    if m and (m.group(2)=='' or m.group(2)[0] in ' >:.['):
        rest=m.group(2).strip()
        if m.group(1)=='html' and rest=='': return PFX
        return (m.group(1)+' '+PFX+(' '+rest if rest else '')).strip()
    if sel.startswith(':root'): return PFX+sel[5:]
    m=re.match(r'^body\b(.*)$',sel)
    if m: return PFX+m.group(1)
    return PFX+' '+sel
def split_top(s):
    out=[];depth=0;cur=''
    for ch in s:
        if ch=='(':depth+=1
        if ch==')':depth-=1
        if ch==',' and depth==0: out.append(cur);cur=''
        else: cur+=ch
    out.append(cur);return out
def scope_css(css):
    res=[];i=0;n=len(css)
    while i<n:
        if css.startswith('/*',i):
            j=css.find('*/',i+2);i=j+2;continue
        if css[i].isspace(): res.append(css[i]);i+=1;continue
        # Prelude bis { oder ;
        j=i;depth=0
        while j<n and not (css[j] in '{;' and depth==0):
            if css[j]=='(':depth+=1
            if css[j]==')':depth-=1
            j+=1
        pre=css[i:j].strip()
        if j>=n: break
        if css[j]==';': 
            if pre.startswith('@layer'): i=j+1;continue   # Layer-Reihenfolge weglassen (alles unlayered)
            res.append(pre+';');i=j+1;continue
        # Block finden
        k=j+1;d=1
        while k<n and d>0:
            if css[k]=='{':d+=1
            elif css[k]=='}':d-=1
            k+=1
        body=css[j+1:k-1]
        if pre.startswith('@layer'):
            res.append(scope_css(body))                    # @layer auspacken
        elif pre.startswith('@media') or pre.startswith('@supports') or pre.startswith('@container'):
            res.append(pre+'{'+scope_css(body)+'}')
        elif pre.startswith('@'):
            res.append(pre+'{'+body+'}')                    # @keyframes, @font-face, @property
        else:
            sels=', '.join(scope_sel(x) for x in split_top(pre))
            # verschachtelte Regeln (CSS nesting) im Block unverändert lassen
            res.append(sels+'{'+body+'}')
        i=k
    return ''.join(res)
styles=re.findall(r'<style([^>]*)>(.*?)</style>',s,re.S)
weg_teile=['section:site-nav','section:practice','section:tempo','section:voices','section:studio','section:lab','section:engage','section:faq',
           'scene:practice-deal','scene:studio-register','scene:engage-pace']
css_roh=[]
for attrs,body in styles:
    if any('"%s"'%t in attrs for t in weg_teile): continue
    css_roh.append(body)
fonts=css_roh[0]; rest='\n'.join(css_roh[1:])
css=fonts+'\n'+scope_css(rest)

# ---------- HTML-Teile ----------
def sect(name):
    return re.search(r'<(section|footer)[^>]*data-8b-section="%s".*?</\1>'%name,s,re.S).group(0)
pill='<span class="m-pill"><img src="bilder/berg/abendhimmel.webp" alt="" width="1600" height="900"></span>'
pill2='<span class="m-pill"><img src="bilder/berg/everest.webp" alt="" width="1600" height="1067"></span>'
streak='<span class="m-btn__streak"><img src="bilder/berg/abendhimmel.webp" alt="" width="1600" height="900"></span>'
op=sect('opening')
op=re.sub(r'<h1 class="m-text-4 op-statement" id="opening-title">.*?</h1>',
  '<h1 class="m-text-4 op-statement" id="opening-title">Wir machen Websites für jeden, der eine '+pill+' braucht. <span class="op-quiet">Persönlich geplant, klar gestaltet und schnell '+pill2+' online.</span></h1>',op,flags=re.S)
op=re.sub(r'<p class="m-text-2 op-note">.*?</p>','<p class="m-text-2 op-note">Sie brauchen eine Website? Wir machen das. Das erste Gespräch ist kostenlos und findet statt, wo Sie wollen.</p>',op,flags=re.S)
op=re.sub(r'<div class="op-actions">.*?</div>','<div class="op-actions"><a class="m-btn" href="#contact" data-anfrage>'+streak+'<span class="m-btn__label">Erstgespräch anfragen</span></a><a class="m-link" href="#work">Arbeiten ansehen</a></div>',op,flags=re.S)

arbeiten=[('Rehder','Elektro Rehder','Handwerk','elektro-rehder'),('Lindhorst','Praxis Lindhorst','Physiotherapie','praxis-lindhorst'),
          ('Yilmaz','Yilmaz &amp; Co. Realty','Immobilien','yilmaz-realty'),('Lumora','Lumora','Onlineshop','lumora'),('Orbis','Orbis','Onlineshop','orbis')]
rows=''.join('<article class="wk-row"><h3 class="m-text-6 wk-title"><a href="../beispiele/%s/" style="text-decoration:none">%s</a></h3><p class="m-text-2 wk-meta"><span>%s</span><span>%s</span><span>Ansehen ↗</span></p><figure class="wk-shot"><img src="../beispiele/%s/vorschau.webp" alt="Vorschau der Beispielseite %s" width="800" height="500" loading="lazy"></figure></article>'%(d,t,n,k,d,n) for t,n,k,d in arbeiten)
wk=sect('work')
wk=re.sub(r'<h2 id="work-title"[^>]*>.*?</h2>','<h2 id="work-title" class="m-text-3" data-8b-motion="brake">Unsere Arbeiten</h2>',wk,flags=re.S)
wk=re.sub(r'(<div class="wk-head">.*?)<p class="m-text">.*?</p>',r'\1<p class="m-text">Beispielseiten, gebaut von ERGUN. Antippen und ansehen.</p>',wk,flags=re.S)
wk=re.sub(r'(<div class="wk-list"[^>]*>).*(</div>\s*</div>\s*</section>)',lambda m:m.group(1)+rows+m.group(2),wk,flags=re.S)

schritte=[('Erstgespräch','Kostenlos und unverbindlich, persönlich oder per Video, wo Sie wollen. Sie erzählen, was Sie brauchen.','bilder/berg/hero.webp'),
          ('Plan und Preis','Wir planen Ihre Website individuell. Danach bekommen Sie einen festen Preis.','bilder/berg/kette-dunst.webp'),
          ('Gestaltung','Wir gestalten und bauen Ihre Seite. Sie sehen den Entwurf und sagen, was passt.','bilder/berg/abendhimmel.webp'),
          ('Online','Ihre Website geht online. Wir bleiben für Sie ansprechbar.','bilder/berg/kosmos.webp')]
li=''.join('<li class="mt-step"><figure class="mt-shot"><img src="%s" alt="" width="1600" height="1000" loading="lazy"></figure><div class="mt-text"><span class="m-badge mt-num">0%d</span><h3 class="m-text-5">%s</h3><p class="m-text-2">%s</p></div></li>'%(b,i+1,h,t) for i,(h,t,b) in enumerate(schritte))
mt=sect('method')
mt=re.sub(r'<h2 id="method-title"[^>]*>.*?</h2>','<h2 id="method-title" class="m-text-3">So läuft es ab</h2>',mt,flags=re.S)
mt=re.sub(r'(<div class="wrap mt-head">.*?)<p class="m-text">.*?</p>',r'\1<p class="m-text">Vier Schritte vom ersten Gespräch bis zur fertigen Seite, persönlich begleitet.</p>',mt,flags=re.S)
mt=re.sub(r'(<ol class="mt-track"[^>]*>).*?(</ol>)',lambda m:m.group(1)+li+m.group(2),mt,flags=re.S)

ct=sect('contact')
ct=re.sub(r'<span class="ct-title__text" data-8b-split="words">.*?</span>','<span class="ct-title__text" data-8b-split="words">Lassen Sie uns reden</span>',ct,flags=re.S)
ct=re.sub(r'<div class="ct-band"[^>]*>.*?</div>','<div class="ct-band" aria-hidden="true"><img src="bilder/berg/abendhimmel.webp" alt="" width="1600" height="900"></div>',ct,flags=re.S)
ct=re.sub(r'<div class="ct-grid">.*?</form>\s*</div>',
  '<div class="ct-grid"><div class="ct-info"><p class="m-text">Kostenloses Erstgespräch, persönlich oder per Video, wo Sie wollen.</p><p class="m-text">Antwort per WhatsApp oder E-Mail, ganz wie Sie möchten.</p></div>'
  '<div class="ct-form"><p class="m-text-2" style="margin-bottom:22px">Erzählen Sie uns kurz, was Sie brauchen. Wir melden uns bei Ihnen.</p><div class="ct-send"><a class="m-btn" href="#contact" data-anfrage>'+streak+'<span class="m-btn__label">Erstgespräch anfragen</span></a></div></div></div>',ct,flags=re.S)

ft=sect('footer')
ft=re.sub(r'<div><p class="m-text-5">Inertia</p><p class="m-text-7">.*?</p></div>','<div><p class="m-text-5">ERGUN.</p><p class="m-text-7">Websites für jeden, der eine braucht.</p></div>',ft,flags=re.S)
ft=re.sub(r'(<ul class="ft-list"[^>]*>).*?(</ul>)',lambda m:m.group(1)+'<li><a class="m-link" href="#work">Arbeiten</a></li><li><a class="m-link" href="#method">Ablauf</a></li><li><a class="m-link" href="#contact">Kontakt</a></li>'+m.group(2),ft,count=1,flags=re.S)
ft=re.sub(r'(</ul>\s*)<ul class="ft-list"[^>]*>.*?</ul>',r'\1<ul class="ft-list" data-8b-items=":scope > li"><li><a class="m-link" href="../impressum.html">Impressum</a></li><li><a class="m-link" href="../datenschutz.html">Datenschutz</a></li><li><a class="m-link" href="../agb.html">AGB</a></li></ul>',ft,count=1,flags=re.S)
ft=ft.replace('style="--len:7">inertia</span>','style="--len:6">ERGUN.</span>')
ft=re.sub(r'<div class="ft-legal">.*?</div>','<div class="ft-legal"><p class="m-text-7">© 2026 ERGUN. · Design: <a href="https://8b.com/" style="color:inherit" data-8b-credit>8B</a></p></div>',ft,flags=re.S)

html='<div class="inz" id="neu"><main>'+op+wk+mt+ct+'</main>'+ft+'</div>'

# ---------- Skripte ----------
scripts=re.findall(r'<script([^>]*)>(.*?)</script>',s,re.S)
keep=['motion-gate','motion-kit','scene-script:work-index','scene-script:method-timeline']
js=[b for a,b in scripts if any('"%s"'%k in a for k in keep)]
gate=js[0]; rest_js='\n'.join(js[1:])

# ---------- in v28 einsetzen ----------
p=V28+'/index.html';x=open(p,encoding='utf-8').read()
x=re.sub(r'<script src="(licht-punkt|gooey|feuerpunkt|licht)\.js[^"]*"></script>\n?','',x)
i=x.rindex('</style>')
x=x[:i]+'''/* v28: nach Berg und Wolken die neue Seite im Design der 21st-Vorlage „Motion Design Studio“ (Inertia, 8B, MIT) */
.ergun-schluss,.gf-ball,.gf-intro,.sc-hint,.ac-hero .ac-words,.ac-hero .dk-mitte{display:none!important}
.intro-berg.alto-voll .ac-hero,.intro-berg.alto-voll .ac-hero.ac-hero{height:calc(var(--h) * 1.98)!important}
.inz{position:relative;z-index:5;background:var(--color-1);font-family:var(--font-1)}
'''+x[i:]
x=x.replace('</head>','<script data-8b-part="motion-gate">'+gate+'</script>\n<style id="inertia">'+css+'</style>\n</head>',1)
x=x.replace('<script src="erde-auf.js?v=1"></script>','<script src="erde-auf.js?v=1"></script>\n<script src="v28.js?v=1"></script>')
x=x.replace('</body>',html+'\n<script>'+rest_js+'</script>\n</body>',1)
open(p,'w',encoding='utf-8').write(x)
print('ok',len(css),len(html))
