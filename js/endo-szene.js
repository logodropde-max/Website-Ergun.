/* endo-Szene – EIN eigenständiger Baustein (endo klar Teil 2, 07.10.2026): Chat → Linie mit Lichtpunkt → Karte „Neue Anfrage“.
   Gleiche Quelle für die endo-Seite (Vorschau ?seite=klar, js/endo-klar.js) und später die ERGUN.-Seite (1:1 per Kopier-Skript).
   Darum: KEINE Abhängigkeit von anderen endo-Skripten, Pfaden oder Schriften. Texte als Daten hier im Baustein (TEXTE, FAELLE),
   Aussehen in endo-szene.css (Präfix esz-, Farben über CSS-Variablen mit Standardwerten).
   Benutzung:  var s = ENDO_SZENE.bauen(zielElement, { faelle: [...], start: 'sichtbar' | 'sofort' | 'aus' });
               s.spielen() · s.endzustand() · s.stand()  ·  ENDO_SZENE.karte(fall) (dieselbe Karte allein) · ENDO_SZENE.schein(karte)
   Ablauf einmal: Kunde fragt → „tippt“ → Antwort → Kunde nennt Namen → Lichtpunkt läuft zur Karte → Karte erscheint → EIN Schein am Neu-Schild.
   Nur transform/opacity. „Bewegung reduzieren“ = sofort der Endzustand, ohne Schein. Kein Netzaufruf, nichts gespeichert. */
(function (root) {
  'use strict';
  var doc = root.document;
  if (!doc) return;

  var TEXTE = {
    schild: 'Beispiel', betrieb: 'Ihr Betrieb', kuerzel: 'IB', status: 'antwortet sofort', eingabe: 'Ihre Nachricht …',
    handyTitel: 'Anfragen', karteTitel: 'Neue Anfrage', neu: 'Neu', name: 'Name', anliegen: 'Anliegen', rueckruf: 'Rückruf',
    wunsch: 'Wunsch: ', aus: 'Aus dem Chat · ', uhr: ' Uhr',
    beschreibung: 'Beispiel: Ein Kunde schreibt im Chat auf Ihrer Website, bei Ihnen kommt eine fertige Anfrage an.'
  };
  /* Beispiel-Fälle (erfundene, erkennbare Beispiel-Namen und -Nummern) – gleiche Werte wie der neutrale Beispiel-Betrieb der endo-Seite */
  var FAELLE = [
    { zeit: '21:47', kunde: 'Haben Sie diese Woche noch einen Termin frei?', endo: 'Donnerstag um 10 Uhr ist noch frei. Auf welchen Namen darf ich anfragen?', kunde2: 'Lea Beispiel, 0151 000 000 01',
      name: 'Lea Beispiel', kontakt: '0151 000 000 01', anliegen: 'Beratungsgespräch', termin: { wann: 'Do, 10:00' } },
    { zeit: '18:05', kunde: 'Hallo, ich hätte da mal eine Frage.', endo: 'Gern. Geht es um einen Termin, einen Preis oder etwas anderes?', kunde2: 'Bitte rufen Sie mich zurück. Jonas Muster, 0151 000 000 02',
      name: 'Jonas Muster', kontakt: '0151 000 000 02', anliegen: 'Bitte um Rückruf', termin: { wann: 'Di, 15:30' } }
  ];
  var SENDEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  var ANFRAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 6.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-4.2L8 19.2v-3.7h-.5a3 3 0 0 1-3-3z"/></svg>';

  function el(tag, k, t) { var e = doc.createElement(tag); if (k) e.className = k; if (t != null) e.textContent = t; return e; }
  function ruhig() { try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  function uhr(f, ms) { return setTimeout(f, ms); }

  /* ---------- die Karte „Neue Anfrage“ (allein nutzbar, z. B. neben einer E-Mail) ---------- */
  function karte(f, opt) {
    f = f || FAELLE[0]; opt = opt || {};
    var k = el('div', 'esz-karte');
    var kk = el('div', 'esz-karte__kopf'), z = el('span', 'esz-karte__zeichen'); z.innerHTML = ANFRAGE;
    kk.appendChild(z); kk.appendChild(el('b', null, TEXTE.karteTitel)); var neu = el('span', 'esz-neu', TEXTE.neu); kk.appendChild(neu); k.appendChild(kk);
    var dl = el('dl', 'esz-felder');
    [['name', TEXTE.name, f.name], ['rueckruf', TEXTE.rueckruf, f.kontakt], ['anliegen', TEXTE.anliegen, f.anliegen, f.termin && f.termin.wann ? TEXTE.wunsch + f.termin.wann : '']].forEach(function (x) {
      var d = el('div', 'esz-feld esz-feld--' + x[0]), dd = el('dd', null, x[2]); d.appendChild(el('dt', null, x[1]));
      if (x[3]) dd.appendChild(el('small', null, x[3]));
      d.appendChild(dd); dl.appendChild(d);
    });
    k.appendChild(dl);
    k.appendChild(el('p', 'esz-karte__fuss', TEXTE.aus + (f.zeit || '') + TEXTE.uhr));
    k.neu = neu;
    return k;
  }
  /* EIN Schein am Neu-Schild – einmal, kein Dauer-Pulsieren. Bei „Bewegung reduzieren“ nichts. */
  function schein(k) {
    var n = k && (k.neu || k.querySelector('.esz-neu'));
    if (!n || ruhig()) return;
    n.classList.remove('ist-schein'); void n.offsetWidth; n.classList.add('ist-schein');
  }

  function chat(f) {
    var c = el('div', 'esz-chat');
    var kopf = el('div', 'esz-chat__kopf');
    var logo = el('span', 'esz-logo', TEXTE.kuerzel); logo.setAttribute('aria-hidden', 'true');
    var wer = el('span', 'esz-chat__wer'); wer.appendChild(el('b', null, TEXTE.betrieb)); wer.appendChild(el('small', null, TEXTE.status));
    kopf.appendChild(logo); kopf.appendChild(wer); kopf.appendChild(el('span', 'esz-schild', TEXTE.schild));
    c.appendChild(kopf);
    var v = el('div', 'esz-chat__verlauf');
    var k1 = el('p', 'esz-blase esz-blase--k', f.kunde);
    var t = el('p', 'esz-blase esz-blase--e esz-tippt'); t.setAttribute('aria-hidden', 'true'); t.appendChild(el('i')); t.appendChild(el('i')); t.appendChild(el('i'));
    var e1 = el('p', 'esz-blase esz-blase--e', f.endo);
    var k2 = el('p', 'esz-blase esz-blase--k esz-blase--drei', f.kunde2);
    [k1, t, e1, k2].forEach(function (x) { v.appendChild(x); });
    c.appendChild(v);
    var feld = el('div', 'esz-chat__feld'); feld.setAttribute('aria-hidden', 'true');
    feld.appendChild(el('span', null, TEXTE.eingabe)); var s = el('span', 'esz-chat__senden'); s.innerHTML = SENDEN; feld.appendChild(s);
    c.appendChild(feld);
    c.teile = { k1: k1, tippt: t, e1: e1, k2: k2 };
    return c;
  }

  /* Lage eines Elements relativ zur Szene – aus offsetLeft/offsetTop (unberührt von transform, darum kein Zittern während des Ablaufs) */
  function lage(e, bis) {
    var x = 0, y = 0, n = e;
    while (n && n !== bis) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    if (n !== bis) return null;
    return { x: x, y: y, w: e.offsetWidth, h: e.offsetHeight };
  }

  function bauen(ziel, opt) {
    opt = opt || {};
    var F = opt.faelle && opt.faelle.length ? opt.faelle : FAELLE, f = F[0], frueher = F.length > 1 ? F[F.length - 1] : null;
    var s = el('div', 'esz');
    s.setAttribute('role', 'group'); s.setAttribute('aria-label', TEXTE.beschreibung);
    var c = chat(f); c.classList.add('esz__chat');
    var weg = el('i', 'esz-weg'); weg.setAttribute('aria-hidden', 'true');
    var punkt = el('i', 'esz-punkt'); punkt.setAttribute('aria-hidden', 'true');
    var h = el('div', 'esz-handy esz__handy'), schirm = el('div', 'esz-handy__schirm');
    var leiste = el('div', 'esz-handy__leiste'); leiste.setAttribute('aria-hidden', 'true');
    leiste.appendChild(el('span', null, f.zeit || '')); leiste.appendChild(el('i', 'esz-handy__insel')); leiste.appendChild(el('span', 'esz-handy__akku'));
    schirm.appendChild(leiste); schirm.appendChild(el('p', 'esz-handy__titel', TEXTE.handyTitel));
    var k = karte(f); schirm.appendChild(k);
    if (frueher) { var alt = el('div', 'esz-alt'); alt.appendChild(el('b', null, frueher.name)); alt.appendChild(el('span', null, frueher.anliegen + ' · ' + (frueher.zeit || '') + TEXTE.uhr)); schirm.appendChild(alt); }
    h.appendChild(schirm);
    s.appendChild(c); s.appendChild(h); s.appendChild(weg); s.appendChild(punkt);
    if (ziel) ziel.appendChild(s);

    var T = c.teile, gespielt = false, uhren = [], stand = 'wartet';
    function setze(x) { stand = x; s.setAttribute('data-esz-stand', x); }
    /* Weg messen: Start = letzte sichtbare Kundenblase (Handy: unten rechts, senkrecht) bzw. rechter Rand des Chats (PC: waagrecht);
       Ziel = Mitte des Neu-Schilds. Linie und Punkt bekommen ihre Lage EINMAL je Breite; bewegt wird nur per transform. */
    var gemessen = null;
    function messen() {
      var neu = k.neu, ln = lage(neu, s), lc = lage(c, s);
      if (!ln || !lc || !s.offsetWidth) return null;
      var ziel = { x: ln.x + ln.w / 2, y: ln.y + ln.h / 2 }, senkrecht = (lage(h, s) || { x: 0 }).x < lc.x + lc.w - 1;
      var m;
      if (senkrecht) {
        /* unter der untersten sichtbaren Blase starten (kleine Handys: ohne dritte Blase), damit die Linie nie über eine Blase läuft */
        var unten = 0;
        [T.k1, T.e1, T.k2].forEach(function (b) { if (!b.offsetParent) return; var lb = lage(b, s); if (lb && lb.y + lb.h > unten) unten = lb.y + lb.h; });
        var von = { x: ziel.x, y: (unten || lc.y + lc.h) + 4 };
        m = { senkrecht: true, von: von, ziel: ziel, lang: Math.max(0, ziel.y - von.y) };
        weg.style.left = (von.x - 1) + 'px'; weg.style.top = von.y + 'px'; weg.style.width = '2px'; weg.style.height = Math.max(0, ziel.y - ln.h / 2 - von.y) + 'px';
      } else {
        var lh = lage(h, s), von2 = { x: lc.x + lc.w, y: ziel.y };
        m = { senkrecht: false, von: von2, ziel: ziel, lang: Math.max(0, ziel.x - von2.x) };
        weg.style.left = von2.x + 'px'; weg.style.top = (ziel.y - 1) + 'px'; weg.style.height = '2px'; weg.style.width = Math.max(0, lh.x - von2.x) + 'px';
      }
      punkt.style.left = (m.von.x - 4) + 'px'; punkt.style.top = (m.von.y - 4) + 'px';
      s.classList.toggle('esz--senkrecht', m.senkrecht);
      gemessen = m;
      return m;
    }
    function punktZiel() { var m = gemessen || messen(); return m ? (m.senkrecht ? 'translateY(' + m.lang + 'px)' : 'translateX(' + m.lang + 'px)') : 'none'; }
    function endzustand() {
      uhren.forEach(clearTimeout); uhren = [];
      [T.k1, T.e1, T.k2, k].forEach(function (x) { x.classList.add('ist-da'); });
      T.tippt.classList.remove('ist-da'); T.tippt.classList.add('ist-weg');
      messen(); weg.classList.add('ist-da'); punkt.classList.remove('ist-unterwegs');
      gespielt = true; setze('fertig');
    }
    function spielen() {
      if (gespielt) return; gespielt = true;
      if (ruhig()) { endzustand(); return; }
      setze('laeuft');
      [[350, function () { T.k1.classList.add('ist-da'); }],
        [1050, function () { T.tippt.classList.add('ist-da'); }],
        [2050, function () { T.tippt.classList.remove('ist-da'); T.tippt.classList.add('ist-weg'); T.e1.classList.add('ist-da'); }],
        [2950, function () { T.k2.classList.add('ist-da'); }],
        [3450, function () { messen(); weg.classList.add('ist-da'); punkt.classList.add('ist-unterwegs'); punkt.style.transform = punktZiel(); }],
        [4150, function () { punkt.classList.add('ist-angekommen'); k.classList.add('ist-da'); }],
        [4450, function () { schein(k); }],
        [5200, function () { setze('fertig'); }]
      ].forEach(function (x) { uhren.push(uhr(x[1], x[0])); });
    }
    /* andere Breite (Handy gedreht, Fenster größer): Weg neu messen – nur Lage, keine Bewegung */
    var breite = s.offsetWidth;
    function neuMessen() { if (s.offsetWidth === breite) return; breite = s.offsetWidth; messen(); if (stand !== 'laeuft' && punkt.classList.contains('ist-unterwegs')) punkt.style.transform = punktZiel(); }
    if (root.ResizeObserver) { try { new root.ResizeObserver(neuMessen).observe(s); } catch (e) {} } else if (root.addEventListener) root.addEventListener('resize', neuMessen);

    var start = opt.start || 'sichtbar';
    if (start === 'sofort' || ruhig()) { if (s.isConnected !== false) endzustand(); else uhren.push(uhr(endzustand, 0)); }
    else if (start !== 'aus') {
      s.classList.add('esz--spielt'); setze('wartet');
      var los = function () { if (!gespielt) spielen(); };
      if (root.IntersectionObserver) {
        var io = new root.IntersectionObserver(function (e) { if (e.some(function (x) { return x.isIntersecting; })) { io.disconnect(); los(); } }, { threshold: 0.25 });
        io.observe(s);
      } else uhr(los, 0);
      uhr(function () { var r = s.getBoundingClientRect && s.getBoundingClientRect(); if (!gespielt && r && r.top < (root.innerHeight || 800)) los(); }, 2500);   /* Hintergrund-Tab: der Beobachter meldet sich evtl. nie */
    } else { s.classList.add('esz--spielt'); setze('wartet'); }

    return { element: s, karte: k, spielen: function () { s.classList.add('esz--spielt'); spielen(); }, endzustand: endzustand, messen: messen,
      stand: function () { return { stand: stand, gespielt: gespielt, weg: gemessen }; } };
  }

  root.ENDO_SZENE = { bauen: bauen, karte: karte, schein: schein, TEXTE: TEXTE, FAELLE: FAELLE };
})(typeof window !== 'undefined' ? window : globalThis);
