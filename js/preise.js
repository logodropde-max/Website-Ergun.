/* ERGUN. · Webdesign – ein Ablauf: Paket wählen → Extras und Betreuung → Ihre Anfrage (seit 22.11.2026 „ERGUN.-Seite startklar“: nur Website,
   vorher zusätzlich Automatisierung; Zahlen unverändert seit Auftrag 9/10, Extras seit Auftrag 28).
   Ausnahme auf ERGUNs Wunsch: Preise stehen offen auf der Seite. Nichts wird gespeichert (keine Cookies, kein localStorage) –
   die Auswahl lebt nur in dieser Seite, gesendet wird erst, wenn der Besucher das Kontaktformular selbst abschickt.

   ========================================================================================================
   PREISE + BEGRIFFE – DIE EINE STELLE FÜR ALLE ZAHLEN UND TEXTE. Hier ändern, sonst nirgends.
   Auch die Karten im Kontaktformular lesen von hier. Quelle: Obsidian „02 Preise/Webdesign-Pakete (Erstgespräch)“.
   preis = einmalig in €, ab = true → „ab“ davor, monat = monatlich in €.
   b = Begriff(e) aus BEGRIFFE, die das ⓘ neben einem Punkt öffnet. enthaelt = Extras, die in der Stufe schon drin sind (Leitfaden zählt sie nicht doppelt).
   ======================================================================================================== */
window.PREISE = {
  /* ① Website – drei Stufen (eine wählbar), alle zum Festpreis (seit 22.11.2026 „ruhiger und günstiger“, vorher 500/1.000/1.900 €).
     empfehlung = dezentes Schild „Empfehlung“. beispiele = zwei Beispielseiten als schlichte Links unten in der Preiskarte (neuer Tab). */
  /* Seit 23.11.2026 („individuell statt Pakete von der Stange“): drei Richtungen nach dem Ziel des Kunden, Preise mit „ab“, fester Preis
     erst nach dem Erstgespräch. Keine Seitenzahlen auf der Seite (nur intern als Richtwert: bis 3 / bis 6 / bis 10). Interne ids bleiben. */
  stufen: [
    { id: 'start', name: 'Präsenz', preis: 290, ab: true, enthaelt: [], fuer: 'Sie wollen gefunden werden und erreichbar sein.',
      punkte: [{ t: 'Ihre Infos, Leistungen und Öffnungszeiten' }, { t: 'Kontakt per Anruf, WhatsApp und E-Mail' }, { t: 'Anzeige „Jetzt geöffnet“ nach Ihren Zeiten' }, { t: 'Mit Ihren eigenen Fotos' }],
      beispiele: [{ name: 'Elektro Rehder', pfad: 'beispiele/elektro-rehder/' }, { name: 'Praxis Lindhorst', pfad: 'beispiele/praxis-lindhorst/' }] },
    { id: 'business', name: 'Auftritt', preis: 590, ab: true, empfehlung: true, enthaelt: [], fuer: 'Sie wollen zeigen, was Sie können.',
      punkte: [{ t: 'Alles aus Präsenz' }, { t: 'Bilder von uns, auch Ihre Produkte in neuer Umgebung' }, { t: 'Bewegung beim Scrollen und Kontaktformular' }, { t: 'Google-Profil eingerichtet' }],
      beispiele: [{ name: 'Yilmaz & Co. Realty', pfad: 'beispiele/yilmaz-realty/' }, { name: 'Voltiq', pfad: 'beispiele/voltiq/' }] },
    { id: 'pro', name: 'Erlebnis', preis: 990, ab: true, enthaelt: [], fuer: 'Sie wollen herausstechen.',
      punkte: [{ t: 'Alles aus Auftritt' }, { t: 'Video von uns, auch als Reel zum Posten' }, { t: '3D-Element und Online-Terminbuchung' }, { t: '3 Monate Betreuung inklusive' }],
      beispiele: [{ name: 'Orbis', pfad: 'beispiele/orbis/' }, { name: 'Lumora', pfad: 'beispiele/lumora/' }] }
  ],
  /* bei jeder Website dabei – steht einmal über den Karten */
  immer: ['Gestaltung nach Ihren Wünschen', 'Texte von uns', 'Für Handy und PC', 'Bei Google auffindbar', 'Impressum und Datenschutz', 'Sie sehen alles vorab', 'Die Website gehört Ihnen'],
  /* ② Extras – nur noch vier (seit 22.11.2026; „10 weitere Bilder“ entfällt, Bilder sind in jedem Paket unbegrenzt). Google-Profil: Ausnahme auf ERGUNs Wunsch. */
  extras: [
    { gruppe: 'Inhalte', eintraege: [
      { id: 'unterseite', name: 'Zusätzliche Unterseite', satz: 'Zum Beispiel für ein neues Angebot.', preis: 40 },
      { id: 'loop', name: 'Video in Schleife', satz: 'Kurz und lautlos.', preis: 60 }] },
    { gruppe: 'Funktionen', eintraege: [
      { id: 'termin', name: 'Terminbuchung einbinden', satz: 'Über ein fertiges Tool, für Start und Business.', preis: 60 },
      { id: 'google', name: 'Google-Unternehmensprofil einrichten', satz: 'Ihr Eintrag in Suche und Maps.', preis: 50 }] }
  ],
  /* ③ Betreuung – eine Stufe (seit 22.11.2026). */
  betreuung: {
    satz: 'Hosting, Updates, Sicherheit und kleine Textänderungen.',
    stufen: [
      { id: 'basis', name: 'Betreuung', monat: 25, fuer: 'Hosting, Updates, Sicherheit und kleine Textänderungen',
        punkte: ['Hosting', 'Updates', 'Sicherheit', 'Kleine Textänderungen'] }
    ]
  },
  klein: 'Im kostenlosen Erstgespräch planen wir gemeinsam, was Sie brauchen. Danach bekommen Sie einen festen Preis.',
  steuer: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'   /* Kleinunternehmer laut Impressum; geschütztes Leerzeichen = kein Zeilenumbruch */
};

/* Begriffe erklärt. Keine Platzierungs-Versprechen. */
window.BEGRIFFE = {
  google: { name: 'Google-Unternehmensprofil', text: 'Ihr Eintrag in Suche und Maps mit Öffnungszeiten, Fotos und Kontakt.' },
  loop: { name: 'Video in Schleife', text: 'Kurzes, lautloses Video, das immer wieder abläuft.' },
  korrektur: { name: 'Korrekturrunde', text: 'Sie sammeln Änderungswünsche, wir setzen sie gemeinsam um.' }
};

/* Texte des Ablaufs (Stimme „wir“). Keine Zahlen hier – Preise kommen immer aus PREISE. */
window.LEITFADEN = {
  art: { titel: 'Jede Website wird individuell für Sie geplant', immer: 'Bei jeder Website dabei', direkt: 'Lieber gleich schreiben', beispiele: 'Beispiele:',
    betreuung: 'Betreuung auf Wunsch: 25\u00a0€ im Monat für Hosting, Updates, Sicherheit und kleine Textänderungen.' },
  unternehmen: 'Alle Angebote richten sich ausschließlich an Unternehmen und Selbstständige.',
  website: { titel: 'Extras und Betreuung', satz: 'Beides ist optional.', alles: 'Alles, was drin ist', extras: 'Extras hinzufügen (optional)' },
  /* höchstens 3 Stichpunkte je Stufe (Auszug aus PREISE.stufen[].punkte) */
  /* Stichpunkte auf den Karten = PREISE.stufen[].punkte (eine Stelle) */
  extrasSchon: 'enthalten', extrasJeSeite: 'je Seite', extrasAnzahl: 'Wie viele zusätzliche Seiten?',
  betreuung: { titel: 'Betreuung', grund: { basis: 'Hosting, Updates, Sicherheit und kleine Textänderungen.' },
    ohne: 'Ohne Betreuung', ohneSatz: 'Hosting und Updates übernehmen Sie dann selbst.' },
  anfrage: { titel: 'Ihre Anfrage', satz: 'Antwort innerhalb von 24 Stunden.', leer: 'Nichts ausgewählt. Schreiben Sie einfach, worum es geht.', auswahl: 'Auswahl treffen' },
  summeLeer: 'Noch nichts gewählt'
};

/* ---------- Rechnen (auch für die Tests): Paket + Extras einmalig, Betreuung monatlich, Summe im ersten Jahr ---------- */
(function (P) {
  P.euro = function (n) { return Math.round(n).toLocaleString('de-DE') + ' €'; };
  P.betrag = function (x) { return (x.ab ? 'ab ' : '') + P.euro(x.preis); };
  P.alleExtras = function () { return P.extras.reduce(function (l, g) { return l.concat(g.eintraege); }, []); };
  P.betreuungStandard = function () { return 'basis'; };   /* nur noch eine Stufe */
  /* auswahl = { stufe: 'business', extras: ['termin'], anzahl: { unterseite: 2 }, betreuung: 'basis' | null } */
  P.rechnen = function (auswahl) {
    var a = auswahl || {}, anzahl = a.anzahl || {};
    var stufe = P.stufen.filter(function (s) { return s.id === a.stufe; })[0] || null;
    var drin = stufe ? stufe.enthaelt || [] : [];   /* im Paket Enthaltenes zählt nicht doppelt */
    var extras = P.alleExtras().filter(function (m) { return (a.extras || []).indexOf(m.id) >= 0 && drin.indexOf(m.id) < 0; }).map(function (m) {
      var n = Math.max(1, Math.min(20, anzahl[m.id] || 1));
      if (n === 1) return m;
      var x = {}; for (var k in m) x[k] = m[k]; x.preis = m.preis * n; x.anzahl = n; return x;
    });
    var bId = a.betreuung === undefined ? P.betreuungStandard() : a.betreuung;
    var betreuung = P.betreuung.stufen.filter(function (b) { return b.id === bId; })[0] || null;
    var betreuungMonat = betreuung ? betreuung.monat : 0;
    var teile = [stufe].concat(extras).filter(Boolean);
    var einmalig = teile.reduce(function (s, x) { return s + x.preis; }, 0);
    return { stufe: stufe, extras: extras, betreuung: betreuung, anfrage: [],
      einmalig: einmalig, ab: teile.some(function (x) { return x.ab; }), monatlich: betreuungMonat, betreuungMonat: betreuungMonat, jahr: einmalig + 12 * betreuungMonat };
  };
  /* Text fürs Kontaktformular (landet in der Nachricht – gesendet wird erst, wenn der Besucher selbst abschickt) */
  P.anfrageText = function (e) {
    var z = ['Meine Auswahl:'];
    if (e.stufe) z.push('• Website: ' + e.stufe.name + ' (' + P.betrag(e.stufe) + ')');
    z.push('Den festen Preis besprechen wir im Erstgespräch.');
    return z.join('\n').replace(/\u00a0/g, ' ');   /* feste Leerzeichen → normale (WhatsApp/Mail) */
  };
})(window.PREISE);

/* ---------- Ein Ablauf: Auswahl und Anfrage in einem (seit 22.11.2026 nur Website) ----------
   ① „Preise“: die drei Pakete als Karten über dem Formular (Tippen = wählen und weiter, dazu „Lieber gleich schreiben“)
   ② „Extras und Betreuung“: alles, was im Paket steckt (eingeklappt), Extras (eingeklappt), Betreuung als eine Zeile
   ③ „Ihre Anfrage“: Zusammenfassung + Formular (statisches HTML in index.html, das Formular-Skript dort liest PREISE.auswahlJetzt()).
   Eine Summenanzeige in Schritt ②: Desktop klebend rechts, Handy schmale Leiste unten (mit „Weiter“). Alte Anker #preise/#kontakt
   führen in den Ablauf (#kontakt = Schritt ③). Übergang 200 ms, „Bewegung reduzieren“ = sofort. Nichts wird gespeichert. */
(function () {
  if (typeof document === 'undefined') return;
  var P = window.PREISE, B = window.BEGRIFFE, L = window.LEITFADEN, box = document.querySelector('[data-preise]');
  if (!box) return;
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function q(s) { return box.querySelector(s); }
  /* Preis mit Hierarchie (Auftrag 36): große Zahl + kleine Beschriftung („ab“, „+ 200 € / Monat“) – der Text bleibt Zeichen für Zeichen derselbe */
  function preisEl(tag, cls, text) {
    var e = el(tag, cls), m = /^(ab\s)?(\d[\d.]*\s€)(.*)$/.exec(text);
    if (!m) { e.textContent = text; return e; }
    if (m[1]) e.appendChild(el('span', 'k-preis__vor', m[1]));
    e.appendChild(el('span', 'k-preis__zahl', m[2]));
    if (m[3]) e.appendChild(el('span', 'k-preis__nach', m[3]));
    return e;
  }
  var MONAT = ' / Monat';
  var HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';

  /* ---------- Antworten (nur Arbeitsspeicher) ---------- */
  var A = { stufe: null, extras: [], seiten: 1, betreuungAn: false, extrasOffen: false };
  function stufeDaten() { return P.stufen.filter(function (x) { return x.id === A.stufe; })[0] || null; }
  function enthalten(id) { var s = stufeDaten(); return !!(s && (s.enthaelt || []).indexOf(id) >= 0); }
  function extrasIds() { return A.stufe ? A.extras.filter(function (x) { return !enthalten(x); }) : []; }   /* Enthaltenes zählt nicht doppelt */
  function betreuungJetzt() { return P.betreuungStandard(); }   /* eine Stufe, vorausgewählt */
  function betreuungAn() { return !!A.stufe && A.betreuungAn; }
  function auswahl() {
    return { stufe: A.stufe, extras: extrasIds(), anzahl: { unterseite: A.seiten },
      betreuung: betreuungAn() ? betreuungJetzt() : null };
  }
  /* Anfrage-Box: Auswahl ist fertig, sobald ein Paket gewählt ist */
  P.auswahlJetzt = function () { return A.stufe ? P.rechnen(auswahl()) : null; };

  /* ---------- Schritte ---------- */
  function schritte() { return ['art', 'anfrage']; }   /* seit 23.11.2026: Richtung wählen → direkt zur Anfrage (Extras klären wir im Gespräch) */
  var aktiv = 'art', dyn = q('[data-mf-dyn]'), anfrageBox = q('[data-mf-anfrage]'), stand = q('[data-mf-stand]'), linie = q('[data-mf-linie]');
  var zurueck = q('[data-mf-zurueck]'), weiter = q('[data-mf-weiter]'), hinweis = q('[data-mf-hinweis]'), summe = q('[data-mf-summe]'), live = q('[data-preise-live]'), liveT;

  /* ---------- Schritt ①: die drei Pakete stehen groß über dem Formular und SIND Schritt ①. Klick wählt und führt weich zu Schritt ②.
     Ohne Wahl zeigt das Formular gleich „Ihre Anfrage“ (allgemeine Anfrage). Die Stichpunkte tragen data-glas-behalten: glas.js baut die
     Karte im Glas-Stil neu und hängt sie wieder an. ---------- */
  var angebote = null, oben = q('.mf__oben');
  function zuAngeboten() {
    if (window.__kristall && window.__kristall.zuAngeboten) window.__kristall.zuAngeboten();
    else if (angebote) angebote.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
  }
  function angeboteMarkieren() {
    if (!angebote) return;
    [].forEach.call(angebote.querySelectorAll('[data-angebot]'), function (b) { b.setAttribute('aria-pressed', String(A.stufe === b.getAttribute('data-angebot'))); });
    angebote.classList.toggle('hat-wahl', !!A.stufe);
  }
  (function () {
    angebote = el('div', 'mf-angebote'); angebote.id = 'angebote'; angebote.setAttribute('data-mf-angebote', '');
    angebote.appendChild(el('h2', 'hinweis-versteckt', L.art.titel));
    var immer = el('div', 'mf-immer'); immer.appendChild(el('p', 'mf-immer__titel', L.art.immer));
    var iu = el('ul', 'mf-immer__liste'); P.immer.forEach(function (t) { var li = el('li'); li.innerHTML = HAKEN; li.appendChild(document.createTextNode(t)); iu.appendChild(li); });
    immer.appendChild(iu); angebote.appendChild(immer);
    var aliste = el('div', 'mf-angebote__liste'); aliste.setAttribute('role', 'group'); aliste.setAttribute('aria-label', L.art.titel);
    P.stufen.forEach(function (s) {
      var b = el('button', 'k-angebot'); b.type = 'button'; b.setAttribute('data-angebot', s.id); b.setAttribute('aria-pressed', 'false');
      b.appendChild(el('span', 'k-angebot__wort', s.name));
      var info = el('span', 'k-angebot__info k-sans'); info.appendChild(el('b', '', P.betrag(s))); info.appendChild(document.createTextNode(' · ' + s.fuer)); b.appendChild(info);
      var pu = el('span', 'k-angebot__punkte'); pu.setAttribute('data-glas-behalten', '');
      s.punkte.map(function (p) { return p.t; }).forEach(function (t) { var z = el('span', 'k-angebot__punkt'); z.innerHTML = HAKEN; z.appendChild(document.createTextNode(t)); pu.appendChild(z); });
      b.appendChild(pu);
      b.addEventListener('click', function () { A.stufe = s.id; neu(); gehe('anfrage', 1); });
      /* Beispiele (seit 22.11.2026): zwei schlichte Text-Links unten in der Karte, neuer Tab. Ein Link darf nicht im Knopf liegen –
         darum stehen Knopf und Zeile gemeinsam in einer Zelle, die Zeile liegt optisch im unteren Rand der Karte. */
      var zelle = el('div', 'k-zelle' + (s.empfehlung ? ' ist-empfehlung' : '')); zelle.appendChild(b);
      /* Schild „Empfehlung“ (Ausnahme auf ERGUNs Wunsch) – liegt in der Zelle über der Kartenkante, für Vorleser im Knopf-Namen */
      if (s.empfehlung) { var sch = el('span', 'k-schild', 'Empfehlung'); sch.setAttribute('aria-hidden', 'true'); zelle.appendChild(sch); b.setAttribute('aria-label', s.name + ', ' + P.betrag(s) + ', Empfehlung'); }
      if (s.beispiele && s.beispiele.length) {
        var bz = el('p', 'k-beispiele'); bz.appendChild(el('span', 'k-beispiele__wort', L.art.beispiele));
        s.beispiele.forEach(function (x) {
          var a = el('a', 'k-beispiele__link', x.name); a.href = x.pfad; a.target = '_blank'; a.rel = 'noopener';
          a.setAttribute('aria-label', x.name + ' ansehen (Beispielseite, neuer Tab)');
          var pf = el('span', 'k-beispiele__pfeil', '↗'); pf.setAttribute('aria-hidden', 'true'); a.appendChild(pf);
          bz.appendChild(a);
        });
        zelle.appendChild(bz); zelle.classList.add('mit-beispielen');
        /* Platzhalter im Knopf mit demselben Text: reserviert genau die Höhe der Zeile (auch wenn sie umbricht) – nichts überlappt */
        var platz = el('span', 'k-beispiele k-beispiele--platz'); platz.setAttribute('aria-hidden', 'true'); platz.setAttribute('data-glas-behalten', '');
        [].forEach.call(bz.children, function (c) { platz.appendChild(el('span', c.className, c.textContent)); });
        b.appendChild(platz);
      }
      aliste.appendChild(zelle);
    });
    angebote.appendChild(aliste);
    /* darunter: fester Preis nach dem Gespräch, Betreuung als Zeile, nur für Unternehmen */
    angebote.appendChild(el('p', 'mf-gespraech', P.klein));
    angebote.appendChild(el('p', 'mf-betreuung-hinweis', L.art.betreuung));
    angebote.appendChild(el('p', 'mf-unternehmen', L.unternehmen));
    /* darunter: „Lieber gleich schreiben“ */
    var azeile = el('div', 'mf-linkzeile mf-angebote__zeile');
    var adirekt = el('button', 'mf-link mf-angebote__direkt', L.art.direkt + ' →'); adirekt.type = 'button';
    adirekt.addEventListener('click', function () { A.stufe = null; neu(); gehe('anfrage', 1); });
    azeile.appendChild(adirekt);
    angebote.appendChild(azeile);
    var ainnen = q('.preise__innen'); ainnen.insertBefore(angebote, ainnen.firstChild);
  })();

  function schalter(an, label, fn, key) {
    var s = el('button', 'lf-schalter'); s.type = 'button'; s.setAttribute('role', 'switch'); s.setAttribute('aria-checked', String(!!an)); s.setAttribute('aria-label', label);
    if (key) s.setAttribute('data-fokus', key);
    s.appendChild(el('span', 'lf-schalter__ja', 'Ja')); s.appendChild(el('span', 'lf-schalter__nein', 'Nein'));
    s.addEventListener('click', fn); return s;
  }
  function neuZeichnen(key) { neu(); zeigen(aktiv, 0, true, key); }
  function aufklapper(klasse, titel, offen, inhalt, beiToggle) {
    var d = el('details', 'mf-auf ' + klasse); d.open = !!offen;
    var s = el('summary', '', titel); d.appendChild(s); d.appendChild(inhalt);
    d.addEventListener('toggle', function () { beiToggle(d.open); });
    return d;
  }

  var BAU = {
    website: function (w) {
      var st = stufeDaten();
      w.titel = L.website.titel; w.satz = L.website.satz;
      /* Alles, was im gewählten Paket steckt (die anderen Pakete: oben in den Karten) */
      var r = el('div', 'mf-alles'), sp = el('div'); sp.appendChild(el('b', '', st.name + ' · ' + P.betrag(st)));
      var ul = el('ul'); st.punkte.forEach(function (p) { ul.appendChild(el('li', '', p.t)); }); sp.appendChild(ul); r.appendChild(sp);
      w.inhalt.appendChild(aufklapper('mf-auf--klein', L.website.alles + ': ' + st.name, false, r, function () {}));
      /* Extras hinzufügen (optional) – Enthaltenes als „enthalten“ */
      var n = extrasIds().length;
      w.inhalt.appendChild(aufklapper('mf-auf--extras', L.website.extras + (n ? ' · ' + n + ' gewählt' : ''), A.extrasOffen, extrasListe(), function (o) { A.extrasOffen = o; }));
      /* Betreuung als eine Zeile */
      w.inhalt.appendChild(betreuungZeile());
    }
  };
  /* Extras (Auftrag 28): ruhige Liste mit Haken in den 4 Gruppen, Preis rechtsbündig, je ein kurzer Satz. Enthaltenes = „enthalten“. */
  function hakenKnopf(an, label, key, gesperrt) {
    var k = el('button', 'mf-haken'); k.type = 'button'; k.setAttribute('role', 'checkbox'); k.setAttribute('aria-checked', String(!!an)); k.setAttribute('aria-label', label);
    if (key) k.setAttribute('data-fokus', key);
    if (gesperrt) { k.disabled = true; k.setAttribute('aria-disabled', 'true'); }
    k.innerHTML = '<span class="mf-haken__box" aria-hidden="true">' + HAKEN + '</span>';
    return k;
  }
  function extrasListe() {
    var w = el('div', 'mf-extras');
    P.extras.forEach(function (g) {
      var grp = el('div', 'mf-extras__gruppe'); grp.setAttribute('role', 'group'); grp.setAttribute('aria-label', g.gruppe);
      grp.appendChild(el('p', 'mf-extras__titel', g.gruppe));
      var ul = el('ul', 'mf-extras__liste'); ul.setAttribute('role', 'list');
      g.eintraege.forEach(function (m) {
        var schon = enthalten(m.id), an = schon || A.extras.indexOf(m.id) >= 0, li = el('li', 'mf-extra' + (an ? ' ist-an' : '') + (schon ? ' ist-schon' : ''));
        var k = hakenKnopf(an, m.name + (schon ? ' – ' + L.extrasSchon : ''), 'ex-' + m.id, schon);
        var t = el('span', 'mf-extra__text'); t.appendChild(el('span', 'mf-extra__name', m.name)); t.appendChild(el('span', 'mf-extra__satz', m.satz));
        k.appendChild(t);
        k.appendChild(el('span', 'mf-extra__preis', schon ? L.extrasSchon : '+ ' + P.betrag(m) + (m.id === 'unterseite' ? ' ' + L.extrasJeSeite : '')));
        if (!schon) k.addEventListener('click', function () { var i = A.extras.indexOf(m.id); if (i >= 0) A.extras.splice(i, 1); else A.extras.push(m.id); neuZeichnen('ex-' + m.id); });
        li.appendChild(k);
        if (!schon && an && m.id === 'unterseite') {
          var z = el('div', 'lf-unter lf-zahl mf-extra__zahl'); z.appendChild(el('span', 'lf-frage__was', L.extrasAnzahl));
          var minus = el('button', 'lf-zahl__knopf', '−'), wert = el('output', 'lf-zahl__wert', String(A.seiten)), plus = el('button', 'lf-zahl__knopf', '+');
          minus.type = plus.type = 'button'; minus.setAttribute('aria-label', 'Eine Seite weniger'); plus.setAttribute('aria-label', 'Eine Seite mehr');
          minus.disabled = A.seiten <= 1; plus.disabled = A.seiten >= 10; minus.setAttribute('data-fokus', 'minus'); plus.setAttribute('data-fokus', 'plus');
          minus.addEventListener('click', function () { A.seiten = Math.max(1, A.seiten - 1); neuZeichnen('minus'); });
          plus.addEventListener('click', function () { A.seiten = Math.min(10, A.seiten + 1); neuZeichnen('plus'); });
          z.appendChild(minus); z.appendChild(wert); z.appendChild(plus); li.appendChild(z);
        }
        ul.appendChild(li);
      });
      grp.appendChild(ul); w.appendChild(grp);
    });
    return w;
  }
  /* Betreuung (seit 22.11.2026 eine Stufe): eine Zeile mit Haken „☑ Betreuung · 25 € / Monat“. Haken weg = ohne Betreuung (0 € im Monat). */
  function betreuungZeile() {
    var an = betreuungAn(), b = P.betreuung.stufen.filter(function (x) { return x.id === betreuungJetzt(); })[0];
    var wrap = el('div', 'mf-betreuung' + (an ? '' : ' ist-aus'));
    var zeile = el('div', 'mf-betreuung__zeile');
    var k = hakenKnopf(an, L.betreuung.titel, 'betreuung-an', false);
    k.appendChild(el('span', 'mf-betreuung__text', an ? b.name + ' · ' + P.euro(b.monat) + MONAT : L.betreuung.ohne + ' · ' + P.euro(0) + MONAT));
    k.addEventListener('click', function () { A.betreuungAn = !A.betreuungAn; neuZeichnen('betreuung-an'); });
    zeile.appendChild(k); wrap.appendChild(zeile);
    wrap.appendChild(el('p', 'mf-betreuung__grund', an ? L.betreuung.grund.basis : L.betreuung.ohneSatz));
    return wrap;
  }

  /* ---------- Anzeige ---------- */
  function zeigen(id, richtung, still, fokusKey) {
    aktiv = id;
    var liste = schritte(), nr = liste.indexOf(id) + 1, n = liste.length, istAnfrage = id === 'anfrage';
    stand.textContent = 'Schritt ' + nr + ' von ' + n;
    linie.style.transform = 'scaleX(' + (nr / n) + ')';
    oben.hidden = !A.stufe; angeboteMarkieren();   /* allgemeine Anfrage: kein „Schritt x von y“ */
    var ani = still || ruhig || !richtung ? '' : richtung > 0 ? ' ist-rein' : ' ist-rein--zurueck';
    if (istAnfrage) {
      dyn.hidden = true; dyn.textContent = ''; anfrageBox.hidden = false;
      anfrageBox.className = 'mf-anfrage' + ani;
    } else {
      anfrageBox.hidden = true; dyn.hidden = false;
      var w = { inhalt: el('div', 'mf-inhalt') };
      BAU[id](w);
      var s = el('div', 'mf-schritt' + ani); s.setAttribute('role', 'group');
      var h = el('h3', 'mf-titel', w.titel); h.id = 'mf-titel'; h.tabIndex = -1; s.setAttribute('aria-labelledby', 'mf-titel');
      s.appendChild(h); if (w.satz) s.appendChild(el('p', 'mf-satz', w.satz)); s.appendChild(w.inhalt);
      dyn.textContent = ''; dyn.appendChild(s);
    }
    zurueck.hidden = liste[nr - 2] === 'art';
    weiter.hidden = istAnfrage;
    weiter.textContent = liste[nr] === 'anfrage' ? 'Zur Anfrage' : 'Weiter';
    weiter.disabled = false;
    hinweis.textContent = '';
    box.setAttribute('data-schritt-jetzt', id);
    summeZeigen();
    /* Auftrag 36: die Szene erfährt den Schritt (die Figur hat nach der ersten Wahl ihren Job erledigt und blendet aus; zurück in Schritt ① kommt sie wieder) */
    document.dispatchEvent(new CustomEvent('preise:schritt', { detail: { schritt: id } }));
    if (fokusKey) {
      var f = box.querySelector('[data-fokus="' + fokusKey + '"]');
      if (f) {
        f.focus({ preventScroll: true });
        /* gerade gewählt: nur dieses eine Element zeigt den Wechsel (Anheben, Goldkante, Häkchen zeichnet sich) – der Rest steht still */
        if (f.getAttribute('aria-pressed') === 'true' || f.getAttribute('aria-checked') === 'true') { f.className += ' ist-frisch'; lichtAn(f); }
      }
    }
    else if (!still) {
      var titel = istAnfrage ? anfrageBox.querySelector('.mf-titel') : dyn.querySelector('.mf-titel');
      if (titel) titel.focus({ preventScroll: true });
      /* weich zum Formular unter den Angeboten (Leiste oben bleibt frei) */
      var fz = (A.stufe ? oben : (istAnfrage ? anfrageBox : dyn)).getBoundingClientRect().top;
      if (fz < 60 || fz > window.innerHeight * 0.4) {
        if (window.__kristall && window.__kristall.zumKontakt) window.__kristall.zumKontakt();   /* misst ohne Einblend-Verschiebung */
        else window.scrollBy({ top: fz - 72, behavior: ruhig ? 'auto' : 'smooth' });
      }
    }
  }
  function gehe(id, richtung) { zeigen(id, richtung); }
  weiter.addEventListener('click', function () { var l = schritte(); gehe(l[l.indexOf(aktiv) + 1], 1); });
  zurueck.addEventListener('click', function () { var l = schritte(); gehe(l[Math.max(0, l.indexOf(aktiv) - 1)], -1); });

  /* Eine Summenanzeige ab Schritt ② (in ③ steht die Zusammenfassung selbst) */
  function summeZeigen() {
    var e = P.auswahlJetzt(), an = aktiv !== 'art' && aktiv !== 'anfrage';
    summe.hidden = !an;
    box.classList.toggle('mit-summe', an);
    q('[data-mf-summe-einmalig]').textContent = e ? (e.ab ? 'ab ' : '') + P.euro(e.einmalig) : '–';
    q('[data-mf-summe-monatlich]').textContent = e ? P.euro(e.monatlich) + MONAT : '–';
    /* ohne Wahl „Noch nichts gewählt“ statt leerer Striche */
    var sl = summe.querySelector('.wb-summe-leer');
    if (!sl) { sl = el('p', 'wb-summe-leer', L.summeLeer); summe.appendChild(sl); }
    summe.classList.toggle('ist-leer', !e);
    if (an && summe.offsetHeight) box.style.setProperty('--wb-leiste', summe.offsetHeight + 'px');   /* Höhe der Handy-Leiste für das Polster unten */
  }
  function neu() {
    var e = P.auswahlJetzt();
    summeZeigen();
    clearTimeout(liveT);
    liveT = setTimeout(function () { if (e && live) live.textContent = 'Einmalig ' + (e.ab ? 'ab ' : '') + P.euro(e.einmalig) + ', monatlich ' + P.euro(e.monatlich) + '.'; }, 500);
    document.dispatchEvent(new CustomEvent('preise:auswahl', { detail: e }));
  }
  /* „ändern“ in der Anfrage → zurück zu Schritt ② (ohne Auswahl → Schritt ①); alte Anker #preise/#kontakt */
  P.zeigeSchritt = function (id) { var l = schritte(), z = id || (l.length > 2 ? l[1] : 'art'); if (z === 'art') { zuAngeboten(); return; } gehe(z, -1); };
  function ausAnker() { if (location.hash === '#kontakt') gehe('anfrage', 0); }
  window.addEventListener('hashchange', ausAnker);
  /* „Kontakt“, „Anfrage starten“ und der feste Handy-Knopf: weich direkt zum Formular (Auswahl bleibt erhalten) */
  P.zumFormular = function () { gehe('anfrage', 1); };
  P.antworten = A;   /* für Tests und Aufnahmen */

  /* ---------- Licht auf den Karten (Auftrag 36) ----------
     Maus: ein weicher Schein folgt dem Zeiger (nur zwei CSS-Variablen auf der Karte selbst, einmal pro Bild). Handy: kurzer Lichtimpuls dort,
     wo getippt wurde. „Bewegung reduzieren“: nichts davon. Das Aussehen steht in index.html (Abschnitt „Auftrag 36“, Werte --k-…). */
  var KARTEN = '.mf-stufe, .lf-chip--gross', zeiger = null, lichtGeplant = false;
  function lichtSetzen(k, x, y) {
    var r = k.getBoundingClientRect(), drin = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;   /* Tastatur: Zeiger liegt woanders → Licht mittig oben */
    k.style.setProperty('--mx', Math.round(drin ? x - r.left : r.width / 2) + 'px'); k.style.setProperty('--my', Math.round(drin ? y - r.top : 0) + 'px');
  }
  function lichtAn(k) { if (!ruhig && zeiger && k.matches && k.matches(KARTEN) && k.getBoundingClientRect) lichtSetzen(k, zeiger[0], zeiger[1]); }
  if (!ruhig && window.requestAnimationFrame) {
    box.addEventListener('pointermove', function (e) {
      zeiger = [e.clientX, e.clientY, e.target];
      if (e.pointerType !== 'mouse' || lichtGeplant) return;
      lichtGeplant = true;
      requestAnimationFrame(function () { lichtGeplant = false; var k = zeiger[2].closest && zeiger[2].closest(KARTEN); if (k) lichtSetzen(k, zeiger[0], zeiger[1]); });
    }, { passive: true });
    box.addEventListener('pointerdown', function (e) {
      zeiger = [e.clientX, e.clientY, e.target];
      var k = e.target.closest && e.target.closest(KARTEN); if (!k) return;
      lichtSetzen(k, e.clientX, e.clientY);
      if (e.pointerType !== 'mouse') { k.classList.remove('ist-impuls'); void k.offsetWidth; k.classList.add('ist-impuls'); }
    }, { passive: true });
  }

  zeigen('anfrage', 0, true);
})();
