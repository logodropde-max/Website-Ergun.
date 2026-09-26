/* endo Studio: Pakete übersichtlich – gleiches Modul auf der Startseite (#pakete) und auf /ki/.
   Einbinden: <div data-studio-pakete data-kontakt="#kontakt"></div>, vorher ki/js/endo-daten.js laden.
   Alle Zahlen kommen aus window.ENDO. Umschalter Monatlich | Jährlich | Einmalig (gilt für alle Karten zugleich).
   Hat ein Paket für die gewählte Abrechnung einen Kauf-Link (kaufen / kaufenJahr / kaufenEinmal), heißt der Knopf „kaufen“,
   sonst „vormerken“ und darunter öffnet sich das Vormerken (WhatsApp oder E-Mail). Die Seite speichert nichts. */
(function () {
  var E = window.ENDO;
  if (!E) return;
  var WA_NUMMER = '4915906344961', MAIL = 'ergun.eu@gmail.com';
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ALLE = E.funktionen.map(function (f) { return Object.assign({ premium: false }, f); }).concat(E.premium.map(function (f) { return Object.assign({ premium: true }, f); }));
  var nachId = {}; ALLE.forEach(function (f) { nachId[f.id] = f; });
  function zahl(n) { return n.toLocaleString('de-DE'); }
  function el(tag, klasse, text) { var e = document.createElement(tag); if (klasse) e.className = klasse; if (text != null) e.textContent = text; return e; }
  function euro(n) { return (n % 1 ? n.toFixed(2).replace('.', ',') : String(n)) + ' €'; }

  /* Monatlich | Jährlich | Einmalig (26.09., Emre): ein Zustand für alle Karten und Umschalter der Seite */
  var RABATT = (E.abrechnung && E.abrechnung.rabattJahr) || 20, GUELTIG = (E.abrechnung && E.abrechnung.einmalGueltigMonate) || 12;
  var MODI = ['monat', 'jahr', 'einmal'];
  var modus = (E.abrechnung && E.abrechnung.standard) || 'monat', beiWechsel = [];
  function jahr() { return modus === 'jahr'; }
  function einmal() { return modus === 'einmal'; }
  function monatspreis(p) { return jahr() && p.jahr ? p.jahr.monat : p.preis; }
  function anzeigePreis(p) { return einmal() && p.einmal ? p.einmal : monatspreis(p); }
  function kaufLink(p) { return einmal() ? p.kaufenEinmal : jahr() ? p.kaufenJahr : p.kaufen; }
  function setzeModus(m) { if (m === modus) return; modus = m; beiWechsel.forEach(function (fn) { fn(); }); }
  function umschalter() {
    var s = el('div', 'sp__schalter'); s.setAttribute('role', 'group'); s.setAttribute('aria-label', 'Abrechnung');
    s.appendChild(el('i', 'sp__schieber'));
    var bm = el('button', 'sp__wahl', 'Monatlich'), bj = el('button', 'sp__wahl', 'Jährlich '), be = el('button', 'sp__wahl', 'Einmalig');
    bj.appendChild(el('span', 'sp__rabatt', '−' + RABATT + ' %'));
    var alle = [['monat', bm], ['jahr', bj], ['einmal', be]];
    alle.forEach(function (w) {
      w[1].type = 'button'; w[1].setAttribute('data-wahl', w[0]);
      w[1].addEventListener('click', function () { setzeModus(w[0]); });
      s.appendChild(w[1]);
    });
    function zeigen() {
      s.setAttribute('data-stufe', String(MODI.indexOf(modus)));
      alle.forEach(function (w) { w[1].setAttribute('aria-pressed', String(w[0] === modus)); });
    }
    beiWechsel.push(zeigen); zeigen();
    return s;
  }
  /* Preis mit kleinem €-Zeichen (edler als eine lange Zahl) */
  function preisSetzen(ziel, n) {
    ziel.textContent = '';
    ziel.appendChild(document.createTextNode(n % 1 ? n.toFixed(2).replace('.', ',') : String(n)));
    ziel.appendChild(el('span', 'sp-karte__waehrung', '€'));
  }

  document.querySelectorAll('[data-studio-pakete]').forEach(function (box, nr) {
    var kontakt = box.getAttribute('data-kontakt') || '#kontakt';
    box.classList.add('sp');

    var kopf = el('div', 'sp__kopf');
    kopf.appendChild(el('p', 'sp__label', 'Pakete'));
    kopf.appendChild(el('h3', 'sp__titel', 'Credits für Ihre Bilder und Videos'));
    kopf.appendChild(el('p', 'sp__satz', 'Monatlich, im Jahresabo ' + RABATT + ' % günstiger oder einmalig ohne Abo. Sie setzen die Credits für das ein, was Sie gerade brauchen.'));
    box.appendChild(kopf);
    box.appendChild(umschalter());

    /* ---- drei Karten: Preise wechseln an derselben Stelle, die Kartenhöhe bleibt ---- */
    var karten = el('div', 'sp__karten'), knoepfe = [], preisZeilen = [];
    E.pakete.forEach(function (p) {
      var premium = p.name === 'Premium', pro = p.name === 'Pro', k = el('article', 'sp-karte' + (premium ? ' sp-karte--premium' : pro ? ' sp-karte--pro' : ''));
      /* Licht, das der Maus folgt, und (Premium) ein langsam umlaufender Glanzrand – rein dekorativ */
      k.appendChild(el('span', 'sp-karte__licht'));
      if (premium) { var rand = el('span', 'sp-karte__rand'); rand.appendChild(el('i')); k.appendChild(rand); }
      k.querySelectorAll('span').forEach(function (x) { x.setAttribute('aria-hidden', 'true'); });
      var oben = el('div', 'sp-karte__oben');
      var zeile = el('div', 'sp-karte__kopfzeile');
      zeile.appendChild(el('h4', 'sp-karte__name', p.name));
      zeile.appendChild(el('span', 'sp-karte__badge', '−' + RABATT + ' %'));
      oben.appendChild(zeile);
      var preis = el('p', 'sp-karte__preis'), betrag = el('span', 'sp-karte__betrag'), einheit = el('span', 'sp-karte__pro');
      preis.appendChild(betrag); preis.appendChild(einheit);
      oben.appendChild(preis);
      var abr = el('p', 'sp-karte__abr');
      oben.appendChild(abr);
      var cr = el('p', 'sp-karte__credits');
      oben.appendChild(cr);
      k.appendChild(oben);
      preisZeilen.push(function () {
        preisSetzen(betrag, anzeigePreis(p));
        einheit.textContent = einmal() ? 'einmalig' : '/ Monat';
        abr.textContent = einmal() ? 'einmal bezahlt · kein Abo' : jahr() && p.jahr ? 'jährlich abgerechnet: ' + euro(p.jahr.gesamt) : 'monatlich abgerechnet';
        cr.textContent = zahl(p.credits) + ' Credits' + (einmal() ? ' · ' + GUELTIG + ' Monate gültig' : ' pro Monat');
      });

      /* was man für den Preis bekommt – ausgerechnet, nicht erfunden */
      var bsp = el('div', 'sp-karte__bsp'), bspTitel = el('p', 'sp-karte__klein');
      bsp.appendChild(bspTitel);
      preisZeilen.push(function () { bspTitel.textContent = einmal() ? 'Zum Beispiel' : 'Jeden Monat zum Beispiel'; });
      var ul = el('ul', 'sp-karte__mengen');
      ['foto', 'video', 'web'].forEach(function (id, i) {
        var f = nachId[id]; if (!f || !f.credits) return;
        var li = el('li'), b = el('b', null, zahl(Math.floor(p.credits / f.credits)));
        if (i) li.appendChild(document.createTextNode('oder '));
        li.appendChild(b); li.appendChild(document.createTextNode(' ' + (f.mehrzahl || f.name)));
        ul.appendChild(li);
      });
      bsp.appendChild(ul); k.appendChild(bsp);

      var inkl = el('div', 'sp-karte__inkl');
      inkl.appendChild(el('p', 'sp-karte__klein', premium ? 'Alles aus Start und Pro, dazu' : 'Enthalten'));
      if (premium) {
        var liste = el('ul', 'sp-karte__liste');
        p.kann.forEach(function (id) { var f = nachId[id]; if (f && f.premium) liste.appendChild(el('li', 'ist-plus', f.name)); });
        inkl.appendChild(liste);
      } else {
        /* Start und Pro enthalten dasselbe: eine kurze Zeile statt einer langen Liste */
        inkl.appendChild(el('p', 'sp-karte__zeile', p.kann.map(function (id) { return nachId[id] ? nachId[id].name : ''; }).filter(Boolean).join(' · ')));
      }
      k.appendChild(inkl);

      /* Kauf-Link je Abrechnung (kaufen / kaufenJahr); solange leer: „… vormerken“ */
      var knopf = el('a', 'sp-knopf');
      knopf.addEventListener('click', function (e) { if (!kaufLink(p)) { e.preventDefault(); vormerken(p.name); } });
      preisZeilen.push(function () {
        var link = kaufLink(p);
        var art = einmal() ? ' einmalig' : '';
        if (link) { knopf.href = link; knopf.rel = 'noopener'; knopf.textContent = p.name + art + ' kaufen'; }
        else { knopf.href = '#sp-vormerken-' + nr; knopf.removeAttribute('rel'); knopf.textContent = p.name + art + ' vormerken'; }
      });
      knopf.setAttribute('data-paket', p.name);
      knoepfe.push(knopf);
      k.appendChild(knopf);
      /* Licht folgt der Maus (nur feine Maus, nur ohne „Bewegung reduzieren“) */
      if (!ruhig && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
        k.addEventListener('pointermove', function (e) {
          var r = k.getBoundingClientRect();
          k.style.setProperty('--mx', (e.clientX - r.left) + 'px'); k.style.setProperty('--my', (e.clientY - r.top) + 'px');
        }, { passive: true });
      }
      karten.appendChild(k);
    });
    box.appendChild(karten);
    /* Karten gleiten versetzt ein, sobald sie ins Bild kommen */
    if (ruhig || !('IntersectionObserver' in window)) karten.classList.add('ist-da');
    else {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { karten.classList.add('ist-da'); io.disconnect(); } }, { threshold: 0.05 });
      setTimeout(function () { var r = karten.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) karten.classList.add('ist-da'); }, 1500); /* Sicherheitsnetz */
      io.observe(karten);
    }
    /* Umschalten: Zahlen blenden kurz aus, wechseln und blenden wieder ein – Karten bleiben stehen */
    function preiseSetzen() { preisZeilen.forEach(function (fn) { fn(); }); box.classList.toggle('sp--jahr', jahr()); box.classList.toggle('sp--einmal', einmal()); }
    var wechselT;
    beiWechsel.push(function () {
      if (ruhig) { preiseSetzen(); return; }
      clearTimeout(wechselT); box.classList.add('sp--wechsel');
      /* ohne requestAnimationFrame: auch in gedrosselten Tabs blendet der Preis sicher wieder ein */
      wechselT = setTimeout(function () { preiseSetzen(); void box.offsetWidth; box.classList.remove('sp--wechsel'); }, 150);
    });
    preiseSetzen();
    /* ein Hauptknopf: Pro, bis ein Paket gewählt ist */
    function hauptknopf(name) { knoepfe.forEach(function (b) { b.classList.toggle('sp-knopf--haupt', b.getAttribute('data-paket') === name); }); }
    hauptknopf('Pro');

    /* ---- Hinweise und Kosten pro Ergebnis (einmal, aufklappbar) ---- */
    var fuss = el('div', 'sp__fuss');
    var notiz = el('p', 'sp__notiz');
    var alleLinks = E.pakete.every(function (p) { return p.kaufen && p.kaufenJahr && p.kaufenEinmal; });
    ['Monatlich, jährlich −' + RABATT + ' % oder einmalig ohne Abo', 'Fehlgeschlagene Aufträge kosten keine Credits', alleLinks ? 'Sicherer Kauf über Lemon Squeezy' : 'Kauf startet in Kürze, bis dahin vormerken'].forEach(function (t) { notiz.appendChild(el('span', null, t)); });
    fuss.appendChild(notiz);
    var det = el('details', 'sp__kosten'), sum = el('summary', null, 'So viele Credits braucht ein Ergebnis'), dl = el('dl');
    ALLE.filter(function (f) { return f.credits; }).forEach(function (f) {
      dl.appendChild(el('dt', null, f.name + (f.premium ? ' · Premium' : '')));
      dl.appendChild(el('dd', null, f.credits + ' Credits'));
    });
    det.appendChild(sum); det.appendChild(dl); fuss.appendChild(det);
    box.appendChild(fuss);

    /* ---- Vormerken (öffnet sich unter den Karten) ---- */
    var vm = el('form', 'sp__vormerken'); vm.id = 'sp-vormerken-' + nr; vm.hidden = true; vm.noValidate = true;
    var vmText = el('div', 'sp__vm-text');
    var vmTitel = el('h4', 'sp__vm-titel', 'Paket vormerken'); vmTitel.tabIndex = -1;
    vmText.appendChild(vmTitel);
    vmText.appendChild(el('p', null, 'Sie bekommen den Zugang als Erste, sobald der Kauf startet. Unverbindlich und kostenlos.'));
    vm.appendChild(vmText);
    var felder = el('div', 'sp__vm-felder');
    /* Paketwahl mit demselben Umschalter (Handy: hier wählt man das Paket) */
    felder.appendChild(umschalter());
    var wahl = el('div', 'sp__vm-wahl'); wahl.setAttribute('role', 'radiogroup'); wahl.setAttribute('aria-label', 'Paket');
    E.pakete.forEach(function (p) {
      var l = el('label', 'sp__vm-option'), r = el('input'), t = el('span'); r.type = 'radio'; r.name = 'sp-paket-' + nr; r.value = p.name;
      l.appendChild(r); l.appendChild(t);
      function beschriften() { t.textContent = p.name + ' · ' + euro(anzeigePreis(p)) + (einmal() ? ' einmalig' : '/Monat'); }
      beiWechsel.push(beschriften); beschriften();
      wahl.appendChild(l);
    });
    felder.appendChild(wahl);
    var feld = el('div', 'sp__vm-feld'), lab = el('label', null, 'E-Mail-Adresse'), inp = el('input'), fehler = el('span', 'sp__vm-fehler');
    lab.htmlFor = 'sp-mail-' + nr; inp.id = 'sp-mail-' + nr; inp.type = 'email'; inp.autocomplete = 'email'; inp.inputMode = 'email'; inp.placeholder = 'name@shop.de'; inp.required = true;
    fehler.id = 'sp-mail-fehler-' + nr; fehler.setAttribute('aria-live', 'polite'); inp.setAttribute('aria-describedby', fehler.id);
    feld.appendChild(lab); feld.appendChild(inp); feld.appendChild(fehler); felder.appendChild(feld);
    var kn = el('div', 'sp__vm-knoepfe'), wa = el('button', 'sp-knopf sp-knopf--haupt', 'Per WhatsApp vormerken'), ml = el('button', 'sp-knopf', 'Per E-Mail');
    wa.type = ml.type = 'submit'; wa.value = 'whatsapp'; ml.value = 'mail';
    kn.appendChild(wa); kn.appendChild(ml); felder.appendChild(kn);
    var status = el('p', 'sp__vm-status'); status.setAttribute('aria-live', 'polite'); felder.appendChild(status);
    felder.appendChild(el('p', 'sp__vm-hinweis', 'Öffnet WhatsApp oder Ihr Mailprogramm mit einer fertigen Nachricht. Diese Seite speichert nichts.'));
    vm.appendChild(felder);
    box.appendChild(vm);

    function gewaehlt() { var r = vm.querySelector('input[type="radio"]:checked'); return r ? r.value : 'Pro'; }
    function vormerken(name) {
      vm.hidden = false;
      vm.querySelector('input[value="' + name + '"]').checked = true;
      hauptknopf(name);
      vm.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () { inp.focus({ preventScroll: true }); }, ruhig ? 0 : 450);
    }
    wahl.addEventListener('change', function () { hauptknopf(gewaehlt()); });
    function pruefe() {
      var v = inp.value.trim(), f = !v ? 'Bitte eine E-Mail-Adresse eintragen.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Diese E-Mail-Adresse sieht unvollständig aus.');
      feld.classList.toggle('hat-fehler', !!f); inp.setAttribute('aria-invalid', f ? 'true' : 'false'); fehler.textContent = f;
      return !f;
    }
    inp.addEventListener('blur', function () { if (inp.value.trim()) pruefe(); });
    inp.addEventListener('input', function () { if (inp.getAttribute('aria-invalid') === 'true') pruefe(); });
    vm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!pruefe()) { inp.focus(); status.textContent = 'Bitte prüfen Sie Ihre E-Mail-Adresse.'; return; }
      var weg = (e.submitter && e.submitter.value) || 'whatsapp', paket = gewaehlt(), p = E.pakete.filter(function (x) { return x.name === paket; })[0];
      var abo = einmal() && p.einmal ? 'einmalig, ' + euro(p.einmal) + ', kein Abo, ' + zahl(p.credits) + ' Credits für ' + GUELTIG + ' Monate'
        : (jahr() && p.jahr ? 'Jahresabo, ' + euro(p.jahr.monat) + ' im Monat, jährlich ' + euro(p.jahr.gesamt) : 'monatlich, ' + euro(p.preis) + ' im Monat') + ', ' + zahl(p.credits) + ' Credits pro Monat';
      var text = 'Hallo Emre, ich möchte bei endo Studio ein Paket vormerken.\n\nPaket: ' + paket + ' (' + abo + ')\nE-Mail: ' + inp.value.trim() + '\n\nGesendet über endo Studio';
      if (weg === 'whatsapp') {
        var link = 'https://wa.me/' + WA_NUMMER + '?text=' + encodeURIComponent(text), win = window.open(link, '_blank');
        if (win) { try { win.opener = null; } catch (err) {} } else location.href = link;
        status.textContent = 'WhatsApp ist geöffnet. Bitte dort nur noch auf Senden tippen.';
      } else {
        location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('endo Studio: Paket ' + paket + ' vormerken') + '&body=' + encodeURIComponent(text);
        status.textContent = 'Ihr Mailprogramm öffnet sich mit der fertigen Nachricht.';
      }
    });

    /* ---- Weg zum Gespräch ---- */
    var weiter = el('div', 'sp__weiter');
    weiter.appendChild(el('p', null, 'Lieber erst sprechen oder eine komplette Website dazu?'));
    var zk = el('a', 'sp-knopf', 'Kostenloses Erstgespräch'); zk.href = kontakt;
    weiter.appendChild(zk);
    box.appendChild(weiter);
  });
})();
