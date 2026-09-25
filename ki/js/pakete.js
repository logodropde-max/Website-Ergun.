/* ERGUN. Studio: Pakete übersichtlich – gleiches Modul auf der Startseite (#pakete) und auf /ki/.
   Einbinden: <div data-studio-pakete data-kontakt="#kontakt"></div>, vorher ki/js/endo-daten.js laden.
   Alle Zahlen kommen aus window.ENDO. Hat ein Paket einen Kauf-Link (kaufen), heißt der Knopf „kaufen“,
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

  document.querySelectorAll('[data-studio-pakete]').forEach(function (box, nr) {
    var kontakt = box.getAttribute('data-kontakt') || '#kontakt';
    box.classList.add('sp');

    var kopf = el('div', 'sp__kopf');
    kopf.appendChild(el('p', 'sp__label', 'Pakete'));
    kopf.appendChild(el('h3', 'sp__titel', 'Credits für Ihre Bilder und Videos'));
    kopf.appendChild(el('p', 'sp__satz', 'Kein Abo, keine Laufzeit. Sie kaufen ein Paket und setzen die Credits für das ein, was Sie gerade brauchen.'));
    box.appendChild(kopf);

    /* ---- drei Karten ---- */
    var karten = el('div', 'sp__karten'), knoepfe = [];
    E.pakete.forEach(function (p) {
      var premium = p.name === 'Premium', k = el('article', 'sp-karte' + (premium ? ' sp-karte--premium' : ''));
      var oben = el('div', 'sp-karte__oben');
      oben.appendChild(el('h4', 'sp-karte__name', p.name));
      oben.appendChild(el('p', 'sp-karte__preis', p.preis + ' €'));
      oben.appendChild(el('p', 'sp-karte__credits', zahl(p.credits) + ' Credits'));
      k.appendChild(oben);

      /* was man für den Preis bekommt – ausgerechnet, nicht erfunden */
      var bsp = el('div', 'sp-karte__bsp');
      bsp.appendChild(el('p', 'sp-karte__klein', 'Damit bekommen Sie zum Beispiel'));
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

      var knopf = el('a', 'sp-knopf');
      if (p.kaufen) { knopf.href = p.kaufen; knopf.rel = 'noopener'; knopf.textContent = p.name + ' kaufen'; }
      else {
        knopf.href = '#sp-vormerken-' + nr; knopf.textContent = p.name + ' vormerken';
        knopf.addEventListener('click', function (e) { e.preventDefault(); vormerken(p.name); });
      }
      knopf.setAttribute('data-paket', p.name);
      knoepfe.push(knopf);
      k.appendChild(knopf);
      karten.appendChild(k);
    });
    box.appendChild(karten);
    /* ein Hauptknopf: Pro, bis ein Paket gewählt ist */
    function hauptknopf(name) { knoepfe.forEach(function (b) { b.classList.toggle('sp-knopf--haupt', b.getAttribute('data-paket') === name); }); }
    hauptknopf('Pro');

    /* ---- Hinweise und Kosten pro Ergebnis (einmal, aufklappbar) ---- */
    var fuss = el('div', 'sp__fuss');
    var notiz = el('p', 'sp__notiz');
    var alleLinks = E.pakete.every(function (p) { return p.kaufen; });
    ['Kein Abo, keine Laufzeit', 'Fehlgeschlagene Aufträge kosten keine Credits', alleLinks ? 'Sicherer Kauf über Lemon Squeezy' : 'Kauf startet in Kürze, bis dahin vormerken'].forEach(function (t) { notiz.appendChild(el('span', null, t)); });
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
    var wahl = el('div', 'sp__vm-wahl'); wahl.setAttribute('role', 'radiogroup'); wahl.setAttribute('aria-label', 'Paket');
    E.pakete.forEach(function (p) {
      var l = el('label', 'sp__vm-option'), r = el('input'); r.type = 'radio'; r.name = 'sp-paket-' + nr; r.value = p.name;
      l.appendChild(r); l.appendChild(el('span', null, p.name + ' · ' + p.preis + ' €'));
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
      var text = 'Hallo Emre, ich möchte bei ERGUN. Studio ein Paket vormerken.\n\nPaket: ' + paket + ' (' + p.preis + ' €, ' + zahl(p.credits) + ' Credits)\nE-Mail: ' + inp.value.trim() + '\n\nGesendet über ERGUN. Studio';
      if (weg === 'whatsapp') {
        var link = 'https://wa.me/' + WA_NUMMER + '?text=' + encodeURIComponent(text), win = window.open(link, '_blank');
        if (win) { try { win.opener = null; } catch (err) {} } else location.href = link;
        status.textContent = 'WhatsApp ist geöffnet. Bitte dort nur noch auf Senden tippen.';
      } else {
        location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('ERGUN. Studio: Paket ' + paket + ' vormerken') + '&body=' + encodeURIComponent(text);
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
