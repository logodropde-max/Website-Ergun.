/* ERGUN. · Webdesign – Seiten-Logik (24.11.2026): Menü, Kopfleiste, Einblenden, Ablauf-Linie, Formular.
   Tinte und Karten-Trommel kommen aus js/buehne.js (gebaut aus den Vorlagen Dye Whorl und Works Wheel). */
(function () {
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;

  /* Jahr in der Fußzeile */
  var j = document.querySelector('[data-jahr]'); if (j) j.textContent = new Date().getFullYear();

  /* Kopfleiste: ab dem ersten Scrollen mit Glas-Hintergrund; Menü am Handy */
  var kopf = document.querySelector('[data-kopf]'), mk = document.querySelector('[data-menue]');
  function kopfStand() { kopf.classList.toggle('ist-unten', window.scrollY > 24); }
  kopfStand(); window.addEventListener('scroll', kopfStand, { passive: true });
  function menue(auf) {
    kopf.classList.toggle('menue-offen', auf); mk.setAttribute('aria-expanded', String(auf));
    mk.setAttribute('aria-label', auf ? 'Menü schließen' : 'Menü öffnen');
  }
  mk.addEventListener('click', function () { menue(!kopf.classList.contains('menue-offen')); });
  kopf.querySelectorAll('.kopf__links a').forEach(function (a) { a.addEventListener('click', function () { menue(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menue(false); });

  /* Überschriften: in Wörter teilen, die beim Einblenden einzeln hochgleiten (die kursive Serifen-Stelle bleibt ein Stück) */
  if (!ruhig) document.querySelectorAll('.abschnitt h2:not(.sr), .abschluss__satz').forEach(function (h) {
    var i = 0, neu = document.createDocumentFragment();
    function wort(inhalt) { var w = document.createElement('span'), x = document.createElement('span'); w.className = 'wort'; x.style.setProperty('--i', i++); x.appendChild(inhalt); w.appendChild(x); return w; }
    [].slice.call(h.childNodes).forEach(function (n) {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(function (t) { if (!t) return; neu.appendChild(/^\s+$/.test(t) ? document.createTextNode(t) : wort(document.createTextNode(t))); });
      else neu.appendChild(wort(n));
    });
    h.textContent = ''; h.appendChild(neu); h.classList.add('ist-geteilt');
  });

  /* Einblenden beim Scrollen */
  var rein = [].slice.call(document.querySelectorAll('.rein'));
  if ('IntersectionObserver' in window && !ruhig) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('ist-da'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    rein.forEach(function (e) { io.observe(e); });
  } else rein.forEach(function (e) { e.classList.add('ist-da'); });

  /* Ablauf: die Linie zwischen den Schritten wächst mit dem Scrollen */
  var sch = document.querySelector('[data-schritte]');
  if (sch && !ruhig) {
    var linie = function () {
      var r = sch.getBoundingClientRect(), p = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.3);
      sch.style.setProperty('--fortschritt', Math.max(0, Math.min(1, p)).toFixed(3));
    };
    linie(); window.addEventListener('scroll', linie, { passive: true });
  }

  /* Leistungs-Kacheln: weiches Licht folgt der Maus */
  document.querySelectorAll('.kachel').forEach(function (k) {
    k.addEventListener('pointermove', function (e) {
      var r = k.getBoundingClientRect();
      k.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      k.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });


  /* Lichtschein folgt der Maus */
  var licht = document.querySelector('.licht');
  if (licht && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !ruhig) {
    var lx = innerWidth / 2, ly = innerHeight / 2, zx = lx, zy = ly;
    window.addEventListener('pointermove', function (e) { zx = e.clientX; zy = e.clientY; html.classList.add('hat-maus'); }, { passive: true });
    (function folge() { lx += (zx - lx) * 0.12; ly += (zy - ly) * 0.12; licht.style.transform = 'translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px)'; requestAnimationFrame(folge); })();
  }

  /* Kacheln und Karten neigen sich leicht zur Maus */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !ruhig) document.querySelectorAll('.kachel, .karte').forEach(function (k) {
    k.addEventListener('pointermove', function (e) {
      var r = k.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      k.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg) translateY(-4px)';
    });
    k.addEventListener('pointerleave', function () { k.style.transform = ''; });
  });

  /* Zahlen zählen hoch, sobald sie ins Bild kommen */
  var zahlen = [].slice.call(document.querySelectorAll('.fakten b'));
  if ('IntersectionObserver' in window && !ruhig) {
    var zio = new IntersectionObserver(function (es) { es.forEach(function (x) {
      if (!x.isIntersecting) return; zio.unobserve(x.target);
      var el = x.target, text = el.textContent, m = text.match(/\d+/); if (!m) return;
      var ziel = +m[0], t0 = performance.now();
      (function lauf(t) { var f = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - f, 3); el.textContent = text.replace(m[0], Math.round(ziel * e)); if (f < 1) requestAnimationFrame(lauf); })(t0);
    }); }, { threshold: 0.6 });
    zahlen.forEach(function (z) { zio.observe(z); });
  }

  /* Hero: Text gleitet beim Scrollen langsamer, Tinte blendet aus · Abschluss-Wort steigt auf · erreichte Schritte leuchten */
  var heroIn = document.querySelector('.hero__inhalt'), tank = document.querySelector('.hero__tank'), riesig = document.querySelector('[data-riesig]'), schritte = [].slice.call(document.querySelectorAll('.schritt'));
  function beimScrollen() {
    var y = window.scrollY, h = innerHeight;
    if (!ruhig && heroIn && y < h * 1.2) { heroIn.style.transform = 'translateY(' + (y * 0.25).toFixed(1) + 'px)'; heroIn.style.opacity = String(Math.max(0, 1 - y / (h * 0.8))); tank.style.opacity = String(0.85 * Math.max(0.15, 1 - y / h)); }
    if (!ruhig && riesig) { var r = riesig.getBoundingClientRect(), p = Math.max(0, Math.min(1, (h - r.top) / (h * 0.7))); riesig.style.setProperty('--hoch', ((1 - p) * 40).toFixed(1) + '%'); }
    schritte.forEach(function (s) { s.classList.toggle('ist-an', s.getBoundingClientRect().top < h * 0.7); });
  }
  beimScrollen(); window.addEventListener('scroll', beimScrollen, { passive: true });


  /* ===== Scroll-Storys ===== */
  function fortschritt(el) { var r = el.getBoundingClientRect(), weg = r.height - innerHeight; return weg > 0 ? Math.max(0, Math.min(1, -r.top / weg)) : 0; }
  /* Leistungen: Abschnitt steht, Punkt und Szene wechseln */
  var story = document.querySelector('[data-story="leistungen"]');
  if (story) {
    var szenen = [].slice.call(story.querySelectorAll('.szene')), punkte = [].slice.call(story.querySelectorAll('[data-punkt]')), balken = story.querySelector('.story__balken'), aktiv = -1;
    var zeigeSzene = function (n) {
      if (n === aktiv) return; aktiv = n;
      szenen.forEach(function (z, i) { z.classList.toggle('ist-an', i === n); z.classList.toggle('war-an', i < n); });
      punkte.forEach(function (pk, i) { pk.classList.toggle('ist-an', i === n); });
    };
    if (ruhig) szenen.forEach(function (z) { z.classList.add('ist-an'); });
    else {
      var storyScroll = function () { var p = fortschritt(story); balken.style.setProperty('--p', p.toFixed(3)); zeigeSzene(Math.min(szenen.length - 1, Math.floor(p * szenen.length * 0.999))); };
      storyScroll(); window.addEventListener('scroll', storyScroll, { passive: true }); window.addEventListener('resize', storyScroll);
    }
  }
  /* Ablauf: Tafeln fahren seitlich durch */
  var quer = document.querySelector('[data-story="ablauf"]');
  if (quer && !ruhig) {
    var spur = quer.querySelector('.quer__spur'), tafeln = [].slice.call(quer.querySelectorAll('.tafel')), qlinie = quer.querySelector('.quer__linie');
    var querScroll = function () {
      var p = fortschritt(quer), weite = Math.max(0, spur.scrollWidth - innerWidth);
      var e = p < 0.08 ? 0 : p > 0.92 ? 1 : (p - 0.08) / 0.84;
      spur.style.transform = 'translate3d(' + (-weite * e).toFixed(1) + 'px,0,0)';
      qlinie.style.setProperty('--p', e.toFixed(3));
      var n = Math.min(tafeln.length - 1, Math.round(e * (tafeln.length - 1)));
      tafeln.forEach(function (t, i) { t.classList.toggle('ist-an', i === n); });
    };
    querScroll(); window.addEventListener('scroll', querScroll, { passive: true }); window.addEventListener('resize', querScroll);
  } else if (quer) [].forEach.call(quer.querySelectorAll('.tafel'), function (t) { t.classList.add('ist-an'); });
  /* Über uns: Satz füllt sich Wort für Wort */
  var fuell = document.querySelector('[data-fuellen]');
  if (fuell) {
    var ws = [];
    [].slice.call(fuell.childNodes).forEach(function (n) {
      if (n.nodeType === 3) { var f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(function (t) { if (!t) return; if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t)); else { var w = document.createElement('span'); w.className = 'w'; w.textContent = t; f.appendChild(w); ws.push(w); } }); fuell.replaceChild(f, n); }
      else { n.classList.add('w'); ws.push(n); }
    });
    var fuellen = function () { var r = fuell.getBoundingClientRect(), p = ruhig ? 1 : Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (innerHeight * 0.55))); var k = Math.round(p * ws.length); ws.forEach(function (w, i) { w.classList.toggle('voll', i < k); }); };
    fuellen(); window.addEventListener('scroll', fuellen, { passive: true });
  }

  /* ===== Formular: öffnet WhatsApp oder das Mailprogramm mit fertigem Text ===== */
  var WA_NUMMER = '4915906344961';   /* Nummer aus dem Impressum */
  var MAIL = 'ergun.eu@gmail.com';
  var form = document.getElementById('anfrage'); if (!form) return;
  var danke = document.querySelector('[data-danke]'), status = form.querySelector('[data-status]');
  function wert(k) { var el = form.elements[k]; return el && el.value ? el.value.trim() : ''; }
  function weg() { var el = form.querySelector('input[name="weg"]:checked'); return el ? el.value : ''; }
  var feldTel = form.querySelector('[data-feld-tel]'), feldMail = form.querySelector('[data-feld-mail]');
  function wegFelder() { var w = weg(); feldTel.hidden = w !== 'whatsapp'; feldMail.hidden = w !== 'mail'; }
  wegFelder();
  form.addEventListener('change', function (e) {
    if (e.target.name === 'weg') { wegFelder(); pruefeFeld('weg'); }
    if (e.target.name === 'datenschutz') pruefeFeld('datenschutz');
  });
  var regeln = {
    name: function (v) { return v.length >= 2 ? '' : 'Bitte geben Sie Ihren Namen ein.'; },
    weg: function () { return weg() ? '' : 'Bitte wählen Sie, wie wir Ihnen antworten sollen.'; },
    tel: function (v) { return !v ? 'Bitte geben Sie Ihre Telefonnummer ein.' : (/^\+?[\d\s()\/.-]{6,20}$/.test(v) && v.replace(/\D/g, '').length >= 6 ? '' : 'Bitte geben Sie eine gültige Telefonnummer ein, z. B. +49 170 1234567.'); },
    email: function (v) { return !v ? 'Bitte geben Sie Ihre E-Mail-Adresse ein.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Bitte geben Sie eine gültige E-Mail ein.'); },
    datenschutz: function () { return form.elements.datenschutz.checked ? '' : 'Bitte stimmen Sie der Datenschutzerklärung zu.'; }
  };
  var ORT = { name: 'f-name-err', weg: 'f-weg-err', tel: 'f-tel-err', email: 'f-mail-err', datenschutz: 'f-ds-err' };
  function pruefeFeld(k) {
    var el = k === 'weg' ? null : form.elements[k], t = regeln[k](el ? el.value.trim() : '');
    var out = document.getElementById(ORT[k]), wrap = out && out.closest('.feld');
    if (wrap) wrap.classList.toggle('hat-fehler', !!t);
    if (out) out.textContent = t;
    if (el) el.setAttribute('aria-invalid', t ? 'true' : 'false');
    return !t;
  }
  function pruefen() {
    var w = weg(), felder = ['name', 'weg'].concat(w === 'whatsapp' ? ['tel'] : w === 'mail' ? ['email'] : [], ['datenschutz']), erster = null;
    felder.forEach(function (k) { if (!pruefeFeld(k) && !erster) erster = k; });
    if (erster) {
      var z = erster === 'weg' ? form.querySelector('input[name="weg"]') : form.elements[erster];
      z.focus({ preventScroll: true }); z.closest('.feld').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' });
    }
    return !erster;
  }
  ['name', 'email', 'tel'].forEach(function (k) {
    var el = form.elements[k];
    el.addEventListener('blur', function () { if (el.value.trim() || el.getAttribute('aria-invalid') === 'true') pruefeFeld(k); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') pruefeFeld(k); });
  });
  function nachricht() {
    var wa = weg() === 'whatsapp', z = ['Hallo, ich möchte ein kostenloses Erstgespräch.', '', 'Name: ' + wert('name'),
      'Antwort per: ' + (wa ? 'WhatsApp' : 'E-Mail'), wa ? 'Telefon: ' + wert('tel') : 'E-Mail: ' + wert('email')];
    if (wert('ort') || wert('art') || wert('budget')) z.push('');
    if (wert('ort')) z.push('Gespräch gern per: ' + wert('ort'));
    if (wert('art')) z.push('Vorstellung: ' + wert('art'));
    if (wert('budget')) z.push('Budget: ' + wert('budget'));
    if (wert('text')) z.push('', 'Nachricht:', wert('text'));
    z.push('', 'Datenschutz: zugestimmt', 'Anfrage als Unternehmer bestätigt', 'Gesendet über die Website.');
    return z.join('\n');
  }
  function waLink() { return 'https://wa.me/' + WA_NUMMER + '?text=' + encodeURIComponent(nachricht()); }
  function mailLink() { return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Erstgespräch über ERGUN.') + '&body=' + encodeURIComponent(nachricht()); }
  function oeffnen() {
    if (weg() === 'whatsapp') { var link = waLink(), win = window.open(link, '_blank'); if (win) { try { win.opener = null; } catch (e) {} } else location.href = link; }
    else location.href = mailLink();
  }
  var nochmal = danke.querySelector('[data-nochmal]');
  function dankeZeigen(echt) {
    var vorname = wert('name').split(/\s+/)[0] || '', wa = weg() === 'whatsapp';
    danke.querySelector('[data-danke-titel]').textContent = 'Danke' + (vorname ? ', ' + vorname : '') + '!';
    danke.querySelector('[data-danke-text]').textContent = (wa ? 'WhatsApp ist geöffnet. Tippen Sie dort nur noch auf Senden.' : 'Ihr Mailprogramm ist geöffnet. Tippen Sie dort nur noch auf Senden.') + ' Wir melden uns persönlich bei Ihnen.';
    nochmal.textContent = wa ? 'WhatsApp erneut öffnen' : 'E-Mail erneut öffnen';
    nochmal.href = echt ? (wa ? waLink() : mailLink()) : '#';
    if (wa) { nochmal.target = '_blank'; nochmal.rel = 'noopener'; } else { nochmal.removeAttribute('target'); nochmal.removeAttribute('rel'); }
    form.hidden = true; danke.hidden = false; danke.focus({ preventScroll: true });
  }
  danke.querySelector('[data-bearbeiten]').addEventListener('click', function () { danke.hidden = true; form.hidden = false; form.elements.name.focus(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); status.textContent = '';
    if (wert('webseite')) { dankeZeigen(false); return; }   /* Honigtopf gegen Spam */
    if (!pruefen()) { status.textContent = 'Bitte prüfen Sie die markierten Felder.'; return; }
    try { oeffnen(); dankeZeigen(true); } catch (err) { status.textContent = 'Das hat leider nicht geklappt. Schreiben Sie uns gern direkt: ' + MAIL; }
  });
})();
