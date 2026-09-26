/* endo: der Chat-Assistent von endo Studio (Startseite und /ki/).
   Führt durch vier Schritte (Produkt, Look, Werkzeug, Foto) und lädt zur Warteliste ein.
   Seit 25.09. nachts ohne Kasten: die Nachrichten schweben über dem Hintergrund, höchstens drei sind zu sehen,
   ältere lösen sich nach oben auf. Das Gespräch startet beim ersten Antippen der Zeile.
   Freie Fragen gehen an /api/agent (Claude). Ist dort kein Schlüssel hinterlegt oder schlägt der
   Aufruf fehl, antwortet endo mit den eingebauten Antworten unten.
   Seit 26.09.: Kundenkonto (E-Mail + Passwort über /api/konto), „Mein Konto“ mit Ergebnissen und Fotos (90 Tage). */
(function () {
  var box = document.querySelector('[data-agent]');
  if (!box) return;
  var verlauf = box.querySelector('[data-verlauf]'), vorschlaege = box.querySelector('[data-vorschlaege]');
  var eingabe = box.querySelector('[data-eingabe]'), feld = box.querySelector('[data-text]');
  var fotoKnopf = box.querySelector('[data-foto]'), datei = box.querySelector('[data-datei]'), senden = box.querySelector('[data-senden]');
  var oben = box.querySelector('[data-oben]'), zuKnopf = box.querySelector('[data-zu]'), oeffnenKnopf = box.querySelector('[data-oeffnen]');
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Auf der Startseite steuert die Szene selbst, wann endo sichtbar ist (data-eigene-sichtbarkeit).
     Bei „Bewegung reduzieren" steht das Panel dort auch am Handy offen im Fluss, also wie am Desktop. */
  var extern = box.hasAttribute('data-eigene-sichtbarkeit');
  /* Kein aufklappendes Panel mehr – auch am Handy nicht. Die Breite steuert nur noch das CSS. */
  var handyMq = { matches: false };

  var WA_NUMMER = '4915906344961', MAIL = 'ergun.eu@gmail.com';
  var BILD_NACHHER = 'https://d8j0ntlcm91z4.cloudfront.net/user_3JGnRZcljS9ZEfmpThKsT6DATn2/hf_20260924_200307_ee98c144-5d85-4b91-8e6b-c82d664263d9.png';
  var PLATZHALTER = 'Fragen Sie endo …';

  var schritt = 'start', kiAus = false, beschaeftigt = false;
  var daten = { kategorie: '', look: '', format: '', credits: 0, premium: false, fotoName: '', fotoUrl: '', email: '' };
  var historie = []; /* für /api/agent: { rolle: 'user' | 'assistant', text } */
  /* Phase C, Schritt 5: endo führt mit Claude und zeigt Look-Karten, Bestätigung, Fortschritt und Ergebnis.
     Testmodus: Codewort nur im Arbeitsspeicher dieser Seite (kein Cookie, kein Browser-Speicher).
     Das alte Drehbuch (Kategorie → Look → Werkzeug → Foto → Vormerken) bleibt als Rückfall ohne Claude. */
  var testCode = '', laufend = null, vorSchritt = 'ki';
  var auswahl = null; /* Antwort-Knöpfe, die endo gerade anbietet (Werkzeug auswahl_zeigen) */
  /* Kundenkonto (26.09.): Sitzung von Supabase, nur für Angemeldete im Browser-Speicher (Schlüssel endo-sitzung).
     Passwörter gehen direkt an /api/konto und landen nie im Verlauf für Claude. */
  var SPEICHER = 'endo-sitzung';
  box.classList.add('agent--frei'); /* Chat ohne Kasten: Nachrichten schweben frei, nur die Eingabe-Pille bleibt (Emre, 26.09.) */
  var sitzung = sitzungLesen(), formMail = '', wartendesFoto = null, linkNachricht = null;
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  var KATEGORIEN = ['Mode', 'Kosmetik', 'Elektronik', 'Essen und Getränke', 'Möbel und Deko', 'Etwas anderes'];
  var LOOKS = ['Studio hell', 'Luxus dunkel', 'Natur und Licht', 'Neon Future'];
  /* Werkzeuge und Preise kommen aus window.ENDO (ki/index.html) */
  var E = window.ENDO || { funktionen: [], premium: [], pakete: [] };
  var FORMATE = E.funktionen.map(function (f) { return { name: f.name, credits: f.credits, ab: paketAb(f.id) }; })
    .concat(E.premium.filter(function (f) { return f.credits; }).map(function (f) { return { name: f.name, credits: f.credits, premium: true }; }));
  function paketAb(id) { for (var i = 0; i < E.pakete.length; i++) if (E.pakete[i].kann.indexOf(id) >= 0) return E.pakete[i].name; return 'Premium'; }
  function euro(n) { return (n % 1 ? n.toFixed(2).replace('.', ',') : String(n)) + ' €'; }
  function paketListe() { return E.pakete.map(function (p) { return p.name + ' ' + euro(p.preis) + ' im Monat' + (p.jahr ? ' (im Jahresabo ' + euro(p.jahr.monat) + ')' : '') + (p.credits ? ' für ' + p.credits.toLocaleString('de-DE') + ' Credits pro Monat' : '') + (p.einmal ? ', einmalig ohne Abo ' + euro(p.einmal) : ''); }).join(', '); }

  /* ---------- Darstellung ---------- */
  /* Verlauf bleibt vollständig (Emre, 25.09.: „übersichtlich, man soll seine Nachrichten sehen“) – nur nach unten scrollen */
  var aufStartseite = !!box.closest('.endo');
  function nachUnten() {
    verlauf.scrollTop = verlauf.scrollHeight;
    requestAnimationFrame(function () { verlauf.scrollTop = verlauf.scrollHeight; });
  }
  /* Antworten von endo lesbar setzen: Absätze, Listen, Code, **fett**, Links. Alles über DOM-Knoten,
     nie innerHTML mit fremdem Text. */
  function zeile(ziel, text) {
    var muster = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s)]+)/g, rest = 0, t;
    while ((t = muster.exec(text))) {
      if (t.index > rest) ziel.appendChild(document.createTextNode(text.slice(rest, t.index)));
      var w = t[0], el;
      if (w.charAt(0) === '`') { el = document.createElement('code'); el.textContent = w.slice(1, -1); }
      else if (w.slice(0, 2) === '**') { el = document.createElement('strong'); el.textContent = w.slice(2, -2); }
      else {
        el = document.createElement('a'); el.rel = 'noopener'; el.target = '_blank';
        var l = /^\[([^\]]+)\]\((.+)\)$/.exec(w);
        el.href = l ? l[2] : w; el.textContent = l ? l[1] : w;
      }
      ziel.appendChild(el); rest = t.index + w.length;
    }
    if (rest < text.length) ziel.appendChild(document.createTextNode(text.slice(rest)));
  }
  function formatiert(text) {
    var f = document.createDocumentFragment(), teile = String(text).replace(/\r/g, '').split(/```/);
    teile.forEach(function (teil, i) {
      if (i % 2) { var pre = document.createElement('pre'), code = document.createElement('code'); code.textContent = teil.replace(/^[a-z]*\n/i, '').replace(/\n$/, ''); pre.appendChild(code); f.appendChild(pre); return; }
      teil.split(/\n{2,}/).forEach(function (block) {
        block = block.replace(/^\n+|\n+$/g, '');
        if (!block) return;
        var zeilen = block.split('\n'), liste = /^\s*([-*•]|\d+[.)])\s+/;
        if (zeilen.every(function (z) { return liste.test(z); })) {
          var ol = /^\s*\d/.test(zeilen[0]), l = document.createElement(ol ? 'ol' : 'ul');
          zeilen.forEach(function (z) { var li = document.createElement('li'); zeile(li, z.replace(liste, '')); l.appendChild(li); });
          f.appendChild(l);
        } else {
          var p = document.createElement('p');
          zeilen.forEach(function (z, k) { if (k) p.appendChild(document.createElement('br')); zeile(p, z); });
          f.appendChild(p);
        }
      });
    });
    return f;
  }
  function blase(wer, text) {
    var b = document.createElement('div');
    b.className = 'blase blase--' + wer;
    if (wer === 'endo') b.appendChild(formatiert(text)); else b.textContent = text;
    verlauf.appendChild(b); nachUnten();
    if (wer === 'endo') ausKugel(b);
    return b;
  }
  function tippt() {
    var b = document.createElement('div');
    b.className = 'blase blase--endo';
    b.setAttribute('aria-label', 'endo schreibt');
    b.innerHTML = '<span class="tippt"><i></i><i></i><i></i></span>';
    verlauf.appendChild(b); nachUnten();
    return b;
  }
  function warte(ms) { return new Promise(function (ok) { setTimeout(ok, ruhig ? 0 : ms); }); }
  /* endo schreibt: kurz „tippt", dann die Nachricht */
  function endo(text, extra) {
    var t = tippt();
    return warte(Math.min(400 + text.length * 12, 1400)).then(function () {
      t.remove();
      var b = blase('endo', text);
      if (extra) extra(b);
      historie.push({ rolle: 'assistant', text: text });
      return b;
    });
  }
  function du(text) { blase('du', text); historie.push({ rolle: 'user', text: text }); inKugel(text, null); }
  function bild(wer, src, unterschrift) {
    if (wer === 'du') inKugel(null, src);
    var f = document.createElement('figure');
    f.className = 'blase blase--bild blase--' + wer;
    var img = document.createElement('img'); img.src = src; img.alt = unterschrift; img.loading = 'lazy';
    var c = document.createElement('figcaption'); c.textContent = unterschrift;
    f.appendChild(img); f.appendChild(c);
    img.addEventListener('load', nachUnten);
    img.addEventListener('error', function () { f.remove(); });
    verlauf.appendChild(f); nachUnten();
  }
  function knoepfe(liste) {
    vorschlaege.innerHTML = '';
    liste.forEach(function (k, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (k.haupt ? ' chip--haupt' : '');
      b.textContent = k.text;
      b.style.animationDelay = (ruhig ? 0 : i * 60) + 'ms';
      b.addEventListener('click', function () { if (beschaeftigt) return; flugStart = { r: b.getBoundingClientRect(), t: Date.now() }; k.aktion(); });
      vorschlaege.appendChild(b);
    });
    vorschlaege.scrollLeft = 0;
    nachUnten();
  }
  /* Vorschläge liegen in einer Zeile: das Mausrad scrollt sie seitwärts */
  vorschlaege.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || vorschlaege.scrollWidth <= vorschlaege.clientWidth) return;
    e.preventDefault();
    vorschlaege.scrollLeft += e.deltaY;
  }, { passive: false });
  function eingabeArt(art) {
    var pw = art === 'code' || art === 'pw-alt' || art === 'pw-neu';
    feld.type = art === 'mail' ? 'email' : pw ? 'password' : 'text';
    feld.setAttribute('inputmode', art === 'mail' ? 'email' : 'text');
    feld.setAttribute('autocomplete', art === 'mail' ? (schritt === 'a-mail' ? 'username' : 'email') : art === 'code' ? 'one-time-code' : art === 'pw-alt' ? 'current-password' : art === 'pw-neu' ? 'new-password' : 'off');
    feld.placeholder = art === 'mail' ? 'name@shop.de' : art === 'code' ? 'Codewort …' : art === 'pw-alt' ? 'Passwort …' : art === 'pw-neu' ? 'Passwort: 8+ Zeichen, Buchstaben und Zahlen' : PLATZHALTER;
  }
  function sperren(an) { beschaeftigt = an; senden.disabled = an; }

  /* ---------- Gesprächsschritte ---------- */
  function start() {
    schritt = 'ki';
    sperren(true);
    if (linkNachricht) { var l = linkNachricht; linkNachricht = null; linkAusMail(l); return; }
    endo('Hallo, ich bin endo. Aus Ihrem Handyfoto mache ich Produktfotos, Werbeanzeigen, kurze Werbevideos und Titelbilder für Ihre Website.')
      .then(function () { return endo(sitzung ? 'Schön, dass Sie wieder da sind. Was möchten Sie heute erstellen?' : 'Was verkaufen Sie?'); })
      .then(function () { sperren(false); zeigeSchritt(); if (sitzung) { kontoStand(); galerieLaden(); } if (auftragAusAdresse()) fortsetzenAnbieten(); });
  }
  function zeigeSchritt() {
    var MAIL_SCHRITTE = { mail: 1, 'a-mail': 1, 'r-mail': 1 };
    eingabeArt(MAIL_SCHRITTE[schritt] ? 'mail' : schritt === 'code' ? 'code' : schritt === 'a-pw' ? 'pw-alt' : schritt === 'r-pw' || schritt === 'pw-neu' ? 'pw-neu' : 'text');
    if (schritt === 'ki' && auswahl) { auswahlKnoepfe(auswahl); return; }
    if (schritt === 'ki') {
      knoepfe([
        { text: 'Produktfoto', aktion: function () { freieFrage('Ich möchte ein Produktfoto.'); } },
        { text: 'Werbeanzeige', aktion: function () { freieFrage('Ich möchte eine Werbeanzeige.'); } },
        { text: 'Werbevideo', aktion: function () { freieFrage('Ich möchte ein Werbevideo.'); } },
        { text: 'Foto hochladen', haupt: angemeldet(), aktion: function () { datei.click(); } },
        angemeldet() && !testCode ? { text: 'Mein Konto', aktion: kontoZeigen } : null,
        !angemeldet() ? { text: 'Anmelden', aktion: function () { anmeldenMenue(); } } : null,
        { text: 'Was kostet das?', aktion: function () { freieFrage('Was kostet das?'); } }
      ].filter(Boolean));
      return;
    }
    if (schritt === 'code') { knoepfe([{ text: 'Abbrechen', aktion: codeAbbrechen }]); return; }
    if (schritt === 'a-mail' || schritt === 'r-mail' || schritt === 'r-pw' || schritt === 'pw-neu') { knoepfe([{ text: 'Abbrechen', aktion: kontoAbbrechen }]); return; }
    if (schritt === 'a-pw') { knoepfe([{ text: 'Passwort vergessen', aktion: passwortVergessen }, { text: 'Abbrechen', aktion: kontoAbbrechen }]); return; }
    if (schritt === 'kategorie') knoepfe(KATEGORIEN.map(function (k) { return { text: k, aktion: function () { kategorie(k); } }; }));
    else if (schritt === 'look') knoepfe(LOOKS.map(function (l) { return { text: l, aktion: function () { look(l); } }; }).concat([{ text: 'Ich beschreibe es selbst', aktion: selbstBeschreiben }]));
    else if (schritt === 'format') knoepfe(FORMATE.map(function (f) { return { text: f.name + ' · ' + f.credits + ' Credits' + (f.premium ? ' · Premium' : ''), aktion: function () { format(f); } }; }));
    else if (schritt === 'foto') knoepfe([
      { text: 'Foto hochladen', haupt: true, aktion: function () { datei.click(); } },
      { text: 'Ohne Foto weiter', aktion: function () { du('Ohne Foto weiter'); frageMail(); } },
      { text: 'Ich habe eine Frage', aktion: frage }
    ]);
    else if (schritt === 'mail') knoepfe([]);
    else if (schritt === 'senden') knoepfe([
      { text: 'Per WhatsApp vormerken', haupt: true, aktion: function () { vormerken('whatsapp'); } },
      { text: 'Per E-Mail', aktion: function () { vormerken('mail'); } }
    ]);
    else knoepfe([
      { text: 'Was kostet das?', aktion: function () { freieFrage('Was kostet das?'); } },
      { text: 'Was ist Premium?', aktion: function () { freieFrage('Was ist im Premium-Paket?'); } },
      { text: 'Neues Produkt', aktion: neuesProdukt }
    ]);
  }
  function kategorie(k) {
    knoepfe([]); du(k); daten.kategorie = k; schritt = 'look'; sperren(true);
    var satz = k === 'Etwas anderes' ? 'Sehr gut, ich kann fast alles in Szene setzen.' : k + ', sehr gut. Da kann ich viel herausholen.';
    endo(satz + ' So verwandle ich ein einfaches Handyfoto:')
      .then(function () { bild('endo', BILD_NACHHER, 'Handyfoto einer Tasse, von endo ins Studio gesetzt'); return warte(700); })
      .then(function () { return endo('Welcher Look passt zu Ihrer Marke?'); })
      .then(function () { sperren(false); zeigeSchritt(); });
  }
  function selbstBeschreiben() {
    knoepfe([]); du('Ich beschreibe es selbst'); sperren(true);
    endo('Gern. Beschreiben Sie den Look in einem Satz, zum Beispiel „Marmor, Morgenlicht, viel Weißraum".')
      .then(function () { sperren(false); feld.placeholder = 'Ihr Look in einem Satz …'; feld.focus(); });
  }
  function look(l) {
    knoepfe([]); du(l); daten.look = l; schritt = 'format'; sperren(true);
    endo('Schöne Wahl. Welches Werkzeug brauchen Sie?').then(function () { sperren(false); zeigeSchritt(); });
  }
  function format(f) {
    knoepfe([]); du(f.name); daten.format = f.name; daten.credits = f.credits; daten.premium = !!f.premium; schritt = 'foto'; sperren(true);
    var kosten = 'Das kostet ' + f.credits + ' Credits pro Ergebnis' + (f.premium ? ' und gehört zum Premium-Paket.' : (f.ab && f.ab !== 'Start' ? ', enthalten ab dem Paket ' + f.ab + '.' : ', schon im Start-Paket enthalten.'));
    endo('Perfekt: ' + (daten.kategorie || 'Ihr Produkt') + ', Look „' + daten.look + '", als ' + f.name + '. ' + kosten)
      .then(function () { return endo('Zeigen Sie mir jetzt Ihr Produkt. Ein Handyfoto genügt.'); })
      .then(function () { sperren(false); zeigeSchritt(); });
  }
  function frage() {
    knoepfe([]); du('Ich habe eine Frage'); sperren(true);
    endo('Gern, fragen Sie mich alles zu endo Studio, zu Preisen oder zu den Möglichkeiten.').then(function () { sperren(false); feld.focus(); });
  }
  function frageMail() {
    knoepfe([]); schritt = 'mail'; sperren(true);
    endo('endo Studio startet in Kürze. Wohin darf ich Ihnen den Startzugang schicken? Ihre E-Mail-Adresse genügt.')
      .then(function () { sperren(false); zeigeSchritt(); feld.focus(); });
  }
  function neuesProdukt() {
    knoepfe([]); du('Neues Produkt'); daten.kategorie = daten.look = daten.format = ''; schritt = 'kategorie'; sperren(true);
    endo('Sehr gern. Was verkaufen Sie diesmal?').then(function () { sperren(false); zeigeSchritt(); });
  }

  /* ---------- Foto ---------- */
  fotoKnopf.addEventListener('click', function () { if (!beschaeftigt) datei.click(); });
  datei.addEventListener('change', function () {
    var f = datei.files && datei.files[0];
    datei.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { endo('Das ist leider kein Bild. Laden Sie bitte ein Foto hoch, zum Beispiel ein JPG vom Handy.'); return; }
    if (angemeldet()) { endoFoto(f); return; }
    if (!kiAus && schritt === 'ki') { wartendesFoto = f; anmeldenMenue('foto'); return; }
    knoepfe([]);
    bild('du', URL.createObjectURL(f), f.name);
    historie.push({ rolle: 'user', text: '[Foto hochgeladen: ' + f.name + ']' });
    daten.fotoName = f.name;
    hochladen(f);
    sperren(true);
    endo('Starkes Motiv. Genau so etwas setze ich ins Studio, mache ein kurzes Video daraus oder ein Titelbild für Ihre Website.')
      .then(function () { sperren(false); if (!daten.email) frageMail(); else { schritt = 'senden'; zeigeSchritt(); } });
  });
  /* Angemeldet oder Testmodus: Foto über /api/endo/foto (prüft Typ, Größe, Auflösung, Inhalt), dann führt endo weiter */
  function endoFoto(f) {
    knoepfe([]); sperren(true);
    bild('du', URL.createObjectURL(f), f.name);
    daten.fotoName = f.name;
    var t0 = tippt();
    verkleinern(f).then(function (v) {
      return api('/api/endo/foto', { method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: v.daten })
        .then(function (r) { return r.json().catch(function () { return {}; }); });
    }).catch(function () { return {}; }).then(function (j) {
      t0.remove(); sperren(false);
      if (j && j.fotoUrl) { daten.fotoUrl = j.fotoUrl; galerieLaden(); freieFrage('Ich habe ein Foto meines Produkts hochgeladen.'); }
      else { endo((j && j.meldung) || 'Das Foto konnte ich leider nicht annehmen. Versuchen Sie es bitte mit einem anderen Bild.').then(zeigeSchritt); }
    });
  }
  /* Upload über dieselbe Funktion wie das Kontaktformular (Vercel Blob). Klappt es nicht, bleibt der Dateiname. */
  function hochladen(f) {
    verkleinern(f).then(function (v) {
      if (v.daten.size > 4 * 1024 * 1024) return;
      return fetch('/api/upload', { method: 'POST', headers: { 'content-type': 'application/octet-stream', 'x-dateiname': encodeURIComponent(v.name) }, body: v.daten })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && j.url) daten.fotoUrl = j.url; });
    }).catch(function () {});
  }
  function verkleinern(f) {
    if (f.size <= 3.5 * 1024 * 1024 || !window.createImageBitmap) return Promise.resolve({ daten: f, name: f.name });
    return createImageBitmap(f).then(function (b) {
      var faktor = Math.min(1, 2560 / Math.max(b.width, b.height)), c = document.createElement('canvas');
      c.width = Math.round(b.width * faktor); c.height = Math.round(b.height * faktor);
      c.getContext('2d').drawImage(b, 0, 0, c.width, c.height);
      return new Promise(function (ok) { c.toBlob(ok, 'image/jpeg', 0.85); });
    }).then(function (b) { return b ? { daten: b, name: f.name.replace(/\.[^.]+$/, '') + '.jpg' } : { daten: f, name: f.name }; })
      .catch(function () { return { daten: f, name: f.name }; });
  }

  /* ---------- Warteliste ---------- */
  function vormerken(weg) {
    var text = 'Hallo Emre, ich möchte beim Start von endo Studio dabei sein.\n\n' +
      (daten.kategorie ? 'Ich verkaufe: ' + daten.kategorie + '\n' : '') +
      (daten.look ? 'Look: ' + daten.look + '\n' : '') +
      (daten.format ? 'Wofür: ' + daten.format + '\n' : '') +
      (daten.fotoUrl ? 'Mein Produktfoto: ' + daten.fotoUrl + '\n' : (daten.fotoName ? 'Mein Produktfoto hänge ich hier an: ' + daten.fotoName + '\n' : '')) +
      'E-Mail: ' + daten.email + '\n\nGesendet über den Chat mit endo';
    du(weg === 'whatsapp' ? 'Per WhatsApp vormerken' : 'Per E-Mail');
    if (weg === 'whatsapp') {
      var link = 'https://wa.me/' + WA_NUMMER + '?text=' + encodeURIComponent(text);
      var win = window.open(link, '_blank');
      if (win) { try { win.opener = null; } catch (e) {} } else { location.href = link; }
    } else {
      location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('endo Studio: Früher Zugang') + '&body=' + encodeURIComponent(text);
    }
    schritt = 'frei'; knoepfe([]); sperren(true);
    var extra = daten.fotoName && !daten.fotoUrl ? ' Hängen Sie dort bitte noch Ihr Foto an.' : '';
    endo((weg === 'whatsapp' ? 'WhatsApp ist offen.' : 'Ihr Mailprogramm öffnet sich.') + ' Bitte dort nur noch auf Senden tippen.' + extra + ' Emre meldet sich persönlich bei Ihnen.')
      .then(function () { return endo('Möchten Sie noch etwas wissen?'); })
      .then(function () { sperren(false); zeigeSchritt(); });
  }

  /* ---------- Freie Eingabe ---------- */
  var FRAGE = /\?|^(was|wie|wann|wo|warum|wieso|welche|welcher|kann|gibt|ist|sind|darf|muss|brauche|hast|habt|haben|kostet)\b/i;
  eingabe.addEventListener('submit', function (e) {
    e.preventDefault();
    var roh = feld.value, t = roh.trim();
    if (!t || beschaeftigt) return;
    feld.value = '';
    if (schritt === 'code') { codePruefen(t); return; }
    if (schritt === 'a-mail' || schritt === 'r-mail') { mailEingabe(t); return; }
    if (schritt === 'a-pw' || schritt === 'r-pw' || schritt === 'pw-neu') { passwortEingabe(roh); return; }
    if (/^\/?test(modus)?$/i.test(t)) { codeAbfragen(); return; }
    if (schritt === 'mail') {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) {
        du(t); daten.email = t; schritt = 'senden'; knoepfe([]); sperren(true);
        endo('Danke. Tippen Sie auf „Per WhatsApp vormerken", dann ist Ihr Platz gesichert.').then(function () { sperren(false); zeigeSchritt(); });
      } else if (FRAGE.test(t)) { freieFrage(t); }
      else { du(t); sperren(true); endo('Die Adresse sieht noch unvollständig aus. Versuchen Sie es bitte noch einmal, zum Beispiel name@shop.de.').then(function () { sperren(false); feld.focus(); }); }
      return;
    }
    var kurz = t.length <= 48 && !FRAGE.test(t);
    if (schritt === 'kategorie' && kurz) { kategorie(t); return; }
    if (schritt === 'look' && kurz) { look(t); return; }
    freieFrage(t);
  });

  function freieFrage(t) {
    auswahl = null; /* jede Antwort des Kunden schließt die angebotenen Knöpfe */
    knoepfe([]); du(t); sperren(true);
    var t0 = tippt();
    frageKI().then(function (erg) {
      t0.remove();
      /* Claude nicht erreichbar: eingebaute Antwort und zurück zum alten Drehbuch */
      if (!erg && kiAus && schritt === 'ki') schritt = 'kategorie';
      var text = erg ? erg.antwort : lokaleAntwort(t);
      if (text) {
        var b = blase('endo', text);
        historie.push({ rolle: 'assistant', text: text });
        if (/komplette Website|Erstgespräch/.test(text) && !erg) {
          b.appendChild(document.createTextNode(' '));
          var a = document.createElement('a'); a.href = '../#kontakt'; a.textContent = 'Zum Erstgespräch'; b.appendChild(a);
        }
      }
      if (erg) erg.elemente.forEach(zeigeElement);
      sperren(false); zeigeSchritt();
    });
  }
  function kopf(h) {
    h = h || {};
    if (testCode) h['x-endo-code'] = testCode;
    else if (sitzung && sitzung.access) h['x-endo-sitzung'] = sitzung.access;
    return h;
  }
  /* fetch mit Konto: frischt die Sitzung vorher auf, falls sie gleich abläuft */
  function api(url, opt) {
    opt = opt || {};
    return sitzungFrisch().then(function () { opt.headers = kopf(opt.headers || {}); return fetch(url, opt); });
  }
  function frageKI() {
    if (kiAus || !window.fetch) return Promise.resolve(null);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 45000);
    var body = { nachrichten: historie.slice(-12) };
    if (angemeldet() && daten.fotoUrl) body.fotoUrl = daten.fotoUrl;
    return api('/api/agent', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (r.status === 503 || r.status === 404 || r.status === 403 || r.status === 405) kiAus = true;
      return r.ok ? r.json() : null;
    }).then(function (j) {
      var elemente = j && Array.isArray(j.elemente) ? j.elemente : [];
      return j && (j.antwort || elemente.length) ? { antwort: String(j.antwort || ''), elemente: elemente } : null;
    }).catch(function () { clearTimeout(timer); return null; });
  }

  /* ---------- Testmodus (Codewort) ---------- */
  function codeAbfragen() {
    if (schritt !== 'code') vorSchritt = schritt;
    schritt = 'code'; knoepfe([]); sperren(true);
    endo('Testmodus: Bitte geben Sie Ihr Codewort ein. Es bleibt nur in diesem Fenster und wird nirgends gespeichert.')
      .then(function () { sperren(false); zeigeSchritt(); feld.focus(); });
  }
  function codeAbbrechen() { schritt = vorSchritt || 'ki'; knoepfe([]); zeigeSchritt(); }
  function codePruefen(c) {
    sperren(true); blase('du', '••••••••'); /* nie in den Verlauf für Claude */
    fetch('/api/konto?aktion=ich', { headers: { 'x-endo-code': c } })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (k) {
        if (!k || k.verfuegbar == null) {
          schritt = vorSchritt || 'ki';
          return endo('Das Codewort stimmt leider nicht.').then(function () { sperren(false); zeigeSchritt(); });
        }
        testCode = c; kiAus = false; schritt = 'ki';
        statusZeigen(k.verfuegbar); galerieLaden();
        var id = auftragAusAdresse();
        return endo(id ? 'Testmodus aktiv. Ich zeige Ihnen den Stand Ihres Auftrags.' : 'Testmodus aktiv. Laden Sie ein Foto Ihres Produkts hoch, dann bereite ich Ihren Auftrag vor.')
          .then(function () { sperren(false); zeigeSchritt(); if (id && !laufend) fortschritt(id, null, null); });
      });
  }
  function statusZeigen(n) {
    var s = verlauf.querySelector('.endo-status');
    if (n == null) { if (s) s.remove(); return; }
    if (!s) { s = el('div', 'endo-el endo-status'); s.appendChild(el('i')); s.appendChild(el('span')); verlauf.appendChild(s); nachUnten(); }
    s.lastChild.textContent = (testCode ? 'Testmodus · ' : (sitzung && sitzung.mail ? sitzung.mail + ' · ' : '')) + Number(n).toLocaleString('de-DE') + ' Credits';
  }
  function auftragAusAdresse() {
    var m = /#auftrag=([0-9a-f-]{36})/i.exec(location.hash || '');
    return m && UUID_RE.test(m[1]) ? m[1] : null;
  }
  function fortsetzenAnbieten() {
    if (angemeldet()) { if (!laufend) fortschritt(auftragAusAdresse(), null, null); return; }
    sperren(true);
    endo('Ihr Auftrag von vorhin ist noch da. Melden Sie sich an, dann zeige ich Ihnen den Stand.').then(function () { sperren(false); anmeldenMenue('auftrag'); });
  }

  /* ---------- Kundenkonto: Anmelden, Registrieren, Passwort, Mein Konto ---------- */
  function angemeldet() { return !!testCode || !!(sitzung && sitzung.access); }
  function sitzungLesen() {
    try { var x = JSON.parse(localStorage.getItem(SPEICHER) || 'null'); return x && x.access && x.refresh ? x : null; } catch (e) { return null; }
  }
  function sitzungSetzen(x) {
    sitzung = x && x.access ? { access: x.access, refresh: x.refresh, bis: Number(x.bis) || Date.now() + 3600000, mail: x.mail || (sitzung && sitzung.mail) || '' } : null;
    try { if (sitzung) localStorage.setItem(SPEICHER, JSON.stringify(sitzung)); else localStorage.removeItem(SPEICHER); } catch (e) {}
  }
  var erneuert = null;
  function sitzungFrisch() {
    if (testCode || !sitzung || sitzung.bis - Date.now() > 60000) return Promise.resolve();
    if (erneuert) return erneuert;
    erneuert = fetch('/api/konto?aktion=erneuern', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refresh: sitzung.refresh }) })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (j) { sitzungSetzen(j && j.sitzung ? j.sitzung : null); erneuert = null; });
    return erneuert;
  }
  function kontoPost(aktion, body, mitSitzung) {
    var h = { 'content-type': 'application/json' };
    if (mitSitzung) h['x-endo-sitzung'] = mitSitzung;
    return fetch('/api/konto?aktion=' + aktion, { method: 'POST', headers: h, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.ok_ = r.ok; return j; }); })
      .catch(function () { return { ok_: false, meldung: 'Keine Verbindung. Bitte versuchen Sie es gleich noch einmal.' }; });
  }
  /* Guthaben holen und anzeigen; liefert die Kontodaten (oder null) */
  function kontoStand() {
    return api('/api/konto?aktion=ich').then(function (r) {
      if (r.status === 401 && !testCode) { sitzungSetzen(null); statusZeigen(null); return null; }
      return r.ok ? r.json() : null;
    }).catch(function () { return null; }).then(function (k) {
      if (k && k.verfuegbar != null) {
        if (sitzung && !sitzung.mail && k.name) sitzungSetzen({ access: sitzung.access, refresh: sitzung.refresh, bis: sitzung.bis, mail: k.name });
        statusZeigen(k.verfuegbar);
      }
      return k;
    });
  }
  function anmeldenMenue(grund) {
    auswahl = null; knoepfe([]); if (!grund) blase('du', 'Anmelden'); sperren(true);
    var satz = grund === 'foto'
      ? 'Starkes Motiv. Damit ich daraus etwas erstellen kann, melden Sie sich bitte kurz an – oder legen Sie in einer Minute ein kostenloses Konto an.'
      : 'Mit einem kostenlosen Konto erstellen Sie Bilder und Videos. Ihre Fotos und Ergebnisse bleiben 90 Tage unter „Mein Konto“ gespeichert.';
    endo(satz).then(function () {
      sperren(false);
      knoepfe([
        { text: 'Anmelden', haupt: true, aktion: function () { kontoSchritt('a-mail'); } },
        { text: 'Kostenlos registrieren', aktion: function () { kontoSchritt('r-mail'); } },
        { text: 'Später', aktion: kontoAbbrechen }
      ]);
    });
  }
  function kontoSchritt(s) {
    knoepfe([]); sperren(true);
    blase('du', s === 'a-mail' ? 'Anmelden' : 'Kostenlos registrieren');
    schritt = s;
    endo('Ihre E-Mail-Adresse, bitte.').then(function () { sperren(false); zeigeSchritt(); feld.focus(); });
  }
  function kontoAbbrechen() {
    knoepfe([]); blase('du', 'Abbrechen');
    schritt = 'ki'; wartendesFoto = null; formMail = '';
    zeigeSchritt();
  }
  function mailEingabe(t) {
    blase('du', t); /* E-Mail nicht in den Verlauf für Claude */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) {
      sperren(true); endo('Die Adresse sieht noch unvollständig aus, zum Beispiel name@shop.de.').then(function () { sperren(false); zeigeSchritt(); feld.focus(); });
      return;
    }
    formMail = t.toLowerCase();
    var reg = schritt === 'r-mail';
    schritt = reg ? 'r-pw' : 'a-pw'; knoepfe([]); sperren(true);
    endo(reg ? 'Jetzt ein Passwort mit mindestens 8 Zeichen, Buchstaben und Zahlen.' : 'Und Ihr Passwort.').then(function () {
      if (reg) {
        var h = el('p', 'endo-el endo-hinweis');
        h.appendChild(document.createTextNode('Mit der Registrierung legen Sie ein Konto bei endo Studio an. Wie wir Ihre Daten verarbeiten, steht in der '));
        var a = el('a', null, 'Datenschutzerklärung'); a.href = (aufStartseite ? '' : '../') + 'datenschutz.html'; a.target = '_blank'; a.rel = 'noopener';
        h.appendChild(a); h.appendChild(document.createTextNode('.'));
        verlauf.appendChild(h); nachUnten();
      }
      sperren(false); zeigeSchritt(); feld.focus();
    });
  }
  function passwortEingabe(pw) {
    blase('du', '••••••••'); /* Passwort nie anzeigen und nie in den Verlauf */
    knoepfe([]); sperren(true);
    var s = schritt, t0 = tippt();
    var anfrage = s === 'pw-neu' ? kontoPost('passwort-neu', { passwort: pw }, sitzung && sitzung.access)
      : kontoPost(s === 'r-pw' ? 'registrieren' : 'anmelden', { mail: formMail, passwort: pw });
    pw = '';
    anfrage.then(function (j) {
      t0.remove();
      if (!j.ok_) {
        return endo(j.meldung || 'Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.').then(function () { sperren(false); zeigeSchritt(); feld.focus(); });
      }
      if (s === 'r-pw' && j.bestaetigen) {
        schritt = 'ki';
        return endo('Fast geschafft: Ich habe Ihnen eine E-Mail an ' + formMail + ' geschickt. Tippen Sie auf den Link darin – danach sind Sie hier angemeldet.')
          .then(function () { formMail = ''; sperren(false); zeigeSchritt(); });
      }
      if (j.sitzung) sitzungSetzen(j.sitzung);
      schritt = 'ki';
      return angemeldetWeiter(s === 'pw-neu' ? 'Ihr neues Passwort ist gespeichert. Sie sind angemeldet.' : s === 'r-pw' ? 'Ihr Konto ist angelegt.' : 'Willkommen zurück.');
    });
  }
  function angemeldetWeiter(satz) {
    formMail = '';
    return kontoStand().then(function (k) {
      var n = k && k.verfuegbar != null ? k.verfuegbar : null;
      var zusatz = n === 0 && !testCode ? ' Ihr Guthaben: 0 Credits. Credit-Pakete gibt es in Kürze – bis dahin berate ich Sie gern.' : (n != null ? ' Sie haben ' + n.toLocaleString('de-DE') + ' Credits.' : '');
      return endo(satz + zusatz);
    }).then(function () {
      sperren(false); zeigeSchritt(); galerieLaden();
      if (wartendesFoto) { var f = wartendesFoto; wartendesFoto = null; endoFoto(f); }
      else if (auftragAusAdresse() && !laufend) fortschritt(auftragAusAdresse(), null, null);
    });
  }
  function passwortVergessen() {
    knoepfe([]); blase('du', 'Passwort vergessen'); sperren(true);
    kontoPost('passwort-vergessen', { mail: formMail }).then(function (j) {
      schritt = 'ki';
      return endo(j.ok_ ? 'Wenn es für ' + formMail + ' ein Konto gibt, ist jetzt eine E-Mail mit einem Link unterwegs. Darüber setzen Sie ein neues Passwort.' : (j.meldung || 'Das hat gerade nicht geklappt.'));
    }).then(function () { formMail = ''; sperren(false); zeigeSchritt(); });
  }
  function abmelden() {
    knoepfe([]); blase('du', 'Abmelden'); sperren(true);
    var alt = sitzung && sitzung.access;
    sitzungSetzen(null); statusZeigen(null); daten.fotoUrl = ''; galerieWeg();
    (alt ? kontoPost('abmelden', {}, alt) : Promise.resolve()).then(function () {
      return endo('Sie sind abgemeldet. Bis bald!');
    }).then(function () { schritt = 'ki'; sperren(false); zeigeSchritt(); });
  }
  /* Link aus der E-Mail von Supabase: #access_token=…&type=signup|recovery (oder #error=…) */
  function linkLesen() {
    var h = location.hash || '';
    if (!/access_token=|error_code=|error=/.test(h)) return null;
    var p = {};
    h.replace(/^#/, '').split('&').forEach(function (t) {
      var i = t.indexOf('=');
      if (i > 0) { try { p[t.slice(0, i)] = decodeURIComponent(t.slice(i + 1).replace(/\+/g, ' ')); } catch (e) {} }
    });
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} /* Token nicht in der Adresse lassen */
    return p;
  }
  function linkAusMail(p) {
    if (p.error || p.error_code || !p.access_token) {
      return endo('Der Link aus der E-Mail ist abgelaufen oder wurde schon benutzt. Melden Sie sich einfach an – oder fordern Sie über „Passwort vergessen“ einen neuen an.')
        .then(function () { sperren(false); anmeldenMenue('link'); });
    }
    sitzungSetzen({ access: p.access_token, refresh: p.refresh_token, bis: Date.now() + (Number(p.expires_in) || 3600) * 1000 });
    if (p.type === 'recovery') {
      schritt = 'pw-neu';
      return endo('Setzen Sie jetzt Ihr neues Passwort: mindestens 8 Zeichen, Buchstaben und Zahlen.').then(function () { sperren(false); zeigeSchritt(); feld.focus(); });
    }
    return angemeldetWeiter('Ihre E-Mail-Adresse ist bestätigt – willkommen bei endo Studio.');
  }
  /* „Mein Konto“: kurze Übersicht im Chat – Bilder, Videos und Fotos liegen in der Galerie (rechts bzw. über der Eingabe) */
  function kontoZeigen() {
    auswahl = null; knoepfe([]); blase('du', 'Mein Konto'); sperren(true);
    var t0 = tippt();
    kontoStand().then(function (k) {
      t0.remove();
      if (!k) {
        if (!sitzung) { sperren(false); anmeldenMenue('abgelaufen'); return; }
        endo('Ihr Konto lädt gerade nicht. Bitte versuchen Sie es gleich noch einmal.').then(function () { sperren(false); zeigeSchritt(); });
        return;
      }
      var box2 = el('section', 'endo-el endo-konto');
      box2.setAttribute('aria-label', 'Mein Konto');
      var kz = el('div', 'endo-konto__kopf');
      kz.appendChild(el('span', 'endo-konto__mail', (sitzung && sitzung.mail) || k.name || 'Ihr Konto'));
      kz.appendChild(el('b', 'endo-konto__credits', Number(k.verfuegbar).toLocaleString('de-DE') + ' Credits'));
      box2.appendChild(kz);
      var breit = window.matchMedia && matchMedia('(min-width: 1180px)').matches;
      box2.appendChild(el('p', 'endo-konto__leer', 'Ihre Bilder, Videos und Fotos finden Sie in Ihrer Galerie ' + (breit ? 'rechts neben dem Chat' : 'über dem Eingabefeld') + '. Alles bleibt 90 Tage gespeichert.'));
      verlauf.appendChild(box2); nachUnten();
      galerieLaden(true);
      sperren(false);
      knoepfe([
        { text: 'Weiter im Chat', haupt: true, aktion: function () { knoepfe([]); zeigeSchritt(); feld.focus(); } },
        { text: 'Abmelden', aktion: abmelden }
      ]);
    });
  }

  /* ---------- Galerie (Emre, 26.09.): rechts neben dem Chat, am Handy als Leiste über der Eingabe ---------- */
  var galerie = null, galerieIds = null;
  function galerieBauen() {
    if (galerie) return galerie;
    galerie = el('aside', 'endo-galerie');
    galerie.setAttribute('aria-label', 'Ihre Galerie');
    var k = el('div', 'endo-galerie__kopf');
    k.appendChild(el('span', null, 'Ihre Galerie'));
    k.appendChild(el('small', null, '90 Tage gespeichert'));
    galerie.appendChild(k);
    galerie.appendChild(el('div', 'endo-galerie__raster'));
    galerie.appendChild(el('p', 'endo-galerie__leer', 'Hier erscheinen Ihre Bilder, Videos und Fotos.'));
    box.insertBefore(galerie, eingabe);
    return galerie;
  }
  function galerieWeg() { box.classList.remove('agent--galerie'); if (galerie) galerie.querySelector('.endo-galerie__raster').innerHTML = ''; galerieIds = null; }
  function galerieLaden(hervorheben) {
    if (!angemeldet()) { galerieWeg(); return; }
    api('/api/konto?aktion=dateien').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (d) {
        if (!d || !angemeldet()) return;
        var liste = (d.ergebnisse || []).map(function (x) { return { art: 'ergebnis', id: x.id, url: x.url, t: x.erstellt || '' }; })
          .concat((d.fotos || []).map(function (x) { return { art: 'foto', id: x.id, url: x.url, t: x.erstellt || '' }; }))
          .filter(function (x) { return x.url && /^https:\/\//.test(x.url); })
          .sort(function (a, b) { return a.t < b.t ? 1 : a.t > b.t ? -1 : 0; });
        galerieZeigen(liste, hervorheben);
      });
  }
  function galerieZeigen(liste, hervorheben) {
    galerieBauen();
    var raster = galerie.querySelector('.endo-galerie__raster'), alt = galerieIds;
    galerieIds = {};
    raster.innerHTML = '';
    liste.forEach(function (x, i) {
      var key = x.art + ':' + x.id;
      galerieIds[key] = true;
      var video = /\.(mp4|mov)$/i.test(x.url);
      var b = el('button', 'endo-galerie__bild'); b.type = 'button';
      b.setAttribute('aria-label', (x.art === 'foto' ? 'Ihr Foto' : video ? 'Ihr Video' : 'Ihr Bild') + ' ansehen');
      var m = el(video ? 'video' : 'img');
      m.src = x.url;
      if (video) { m.muted = true; m.setAttribute('playsinline', ''); m.preload = 'metadata'; } else { m.alt = ''; m.loading = 'lazy'; m.decoding = 'async'; }
      m.addEventListener('error', function () { b.remove(); });
      b.appendChild(m);
      if (x.art === 'foto' || video) b.appendChild(el('span', 'endo-galerie__art', x.art === 'foto' ? 'Foto' : 'Video'));
      if (alt && !alt[key]) { b.classList.add('endo-galerie__bild--neu'); b.style.animationDelay = (ruhig ? 0 : i * 40) + 'ms'; }
      b.addEventListener('click', function () { ansicht(x, video, b); });
      raster.appendChild(b);
    });
    galerie.classList.toggle('endo-galerie--leer', !liste.length);
    box.classList.add('agent--galerie');
    if (hervorheben && !ruhig && galerie.animate) galerie.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }
  /* Großansicht: Laden · Weiterverwenden · Löschen */
  function ansicht(x, video, kachel) {
    var d = el('dialog', 'endo-el endo-ansicht');
    d.setAttribute('aria-label', x.art === 'foto' ? 'Ihr Foto' : 'Ihr Ergebnis');
    var m = el(video ? 'video' : 'img', 'endo-ansicht__medium');
    m.src = x.url;
    if (video) { m.controls = true; m.muted = true; m.loop = true; m.setAttribute('playsinline', ''); if (!ruhig) m.autoplay = true; } else m.alt = '';
    d.appendChild(m);
    var leiste = el('div', 'endo-ansicht__knoepfe');
    var laden = el('a', 'endo-knopf endo-knopf--ja', 'Herunterladen'); laden.href = x.url + '?download=1'; laden.rel = 'noopener'; laden.setAttribute('download', '');
    leiste.appendChild(laden);
    if (!video) {
      var nutzen = el('button', 'endo-knopf', 'Weiterverwenden'); nutzen.type = 'button';
      nutzen.addEventListener('click', function () {
        d.close(); if (beschaeftigt) return;
        daten.fotoUrl = x.url;
        freieFrage(x.art === 'foto' ? 'Ich möchte dieses Foto noch einmal verwenden.' : 'Ich möchte mit diesem Ergebnis weiterarbeiten.');
      });
      leiste.appendChild(nutzen);
    }
    var weg = el('button', 'endo-knopf endo-knopf--leise', 'Löschen'); weg.type = 'button';
    weg.addEventListener('click', function () {
      if (weg.disabled) return;
      if (weg.getAttribute('data-sicher') !== '1') { weg.setAttribute('data-sicher', '1'); weg.textContent = 'Wirklich löschen?'; return; }
      weg.disabled = true;
      api('/api/konto?aktion=datei-loeschen', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ art: x.art, id: x.id }) })
        .then(function (r) { if (r.ok) { d.close(); kachel.remove(); if (galerieIds) delete galerieIds[x.art + ':' + x.id]; } else { weg.disabled = false; weg.textContent = 'Löschen'; weg.removeAttribute('data-sicher'); } })
        .catch(function () { weg.disabled = false; });
    });
    leiste.appendChild(weg);
    var zu = el('button', 'endo-knopf endo-ansicht__zu', 'Schließen'); zu.type = 'button';
    zu.addEventListener('click', function () { d.close(); });
    leiste.appendChild(zu);
    d.appendChild(leiste);
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { d.remove(); });
    document.body.appendChild(d);
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }

  /* ---------- Flüge zur Kugel (Emre, 26.09.): Nachricht und Foto fliegen hinein, endos Antwort kommt heraus ----------
     Gut dosiert: nur wenn die Kugel im Bild ist, höchstens ein Flug gleichzeitig pro Richtung, bei „Bewegung reduzieren“ nie.
     Die Kugel ruht im Chat (Emre, 25.09.) und wird nur für den Flug kurz geweckt. */
  var kugelEl = document.querySelector('.endo__orb') || document.querySelector('[data-orb]');
  var flugAn = !ruhig && !!(document.body && document.body.animate);
  var flugStart = null, fliegtRein = false, zuletztRaus = 0, wachTimer = null;
  function kugelPunkt() {
    if (!kugelEl) return null;
    var r = kugelEl.getBoundingClientRect();
    if (!r.width) return null;
    var x = r.left + r.width / 2, y = r.top + r.height / 2, rad = r.width * 0.28;
    if (y + rad < 24 || y - rad > window.innerHeight) return null;
    return { x: x, y: y, r: rad, sichtbarY: Math.max(y, 24) };
  }
  function kugelWecken(ms) {
    if (!kugelEl) return;
    kugelEl.classList.add('orb--wach');
    kugelEl.dispatchEvent(new Event('orb:weiter'));
    clearTimeout(wachTimer);
    wachTimer = setTimeout(kugelRuhe, ms || 2400);
  }
  function kugelRuhe() {
    if (laufend) { wachTimer = setTimeout(kugelRuhe, 1500); return; } /* während erzeugt wird, bleibt sie wach */
    kugelEl.classList.remove('orb--wach');
    if (document.documentElement.classList.contains('endo-chat')) kugelEl.dispatchEvent(new Event('orb:halt'));
  }
  function pulsVon(x, y, z) {
    var K = window.endoKugel, dx = x - z.x, dy = y - z.y, l = Math.hypot(dx, dy) || 1;
    if (K && K.puls) K.puls(dx / l, dy / l);
  }
  /* Nachricht (Text) oder Foto (Bild-Adresse) fliegt als kleiner Schein in die Kugel und löst sich dort in Datenpakete auf */
  function inKugel(text, bildSrc) {
    var z = kugelPunkt();
    if (!flugAn || !z || fliegtRein) return;
    var q = flugStart && Date.now() - flugStart.t < 600 ? flugStart.r : (bildSrc ? fotoKnopf : feld).getBoundingClientRect();
    flugStart = null;
    if (!q || !q.width) return;
    var g;
    if (bildSrc) { g = el('div', 'endo-flug endo-flug--bild'); var i = el('img'); i.src = bildSrc; i.alt = ''; g.appendChild(i); }
    else g = el('div', 'endo-flug', text.length > 38 ? text.slice(0, 36) + '…' : text);
    g.setAttribute('aria-hidden', 'true');
    document.body.appendChild(g);
    var w = g.offsetWidth, h = g.offsetHeight;
    var x0 = Math.min(Math.max(8, q.left + q.width / 2 - w / 2), window.innerWidth - w - 8), y0 = q.top + q.height / 2 - h / 2;
    g.style.left = x0 + 'px'; g.style.top = y0 + 'px';
    var cx = x0 + w / 2, cy = y0 + h / 2, dx = z.x - cx, dy = z.sichtbarY - cy;
    /* bis gut zur Hälfte fliegen und dabei zu einem Lichtpunkt schrumpfen – den Rest übernehmen die Datenpakete */
    var anteil = 0.55, ex = dx * anteil, ey = dy * anteil, bogen = (dx >= 0 ? -1 : 1) * Math.min(60, Math.abs(dy) * 0.12);
    fliegtRein = true;
    kugelWecken(2600);
    var a = g.animate([
      { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
      { transform: 'translate3d(' + (ex * 0.45 + bogen) + 'px,' + (ey * 0.4) + 'px,0) scale(0.82)', opacity: 0.95, offset: 0.4 },
      { transform: 'translate3d(' + ex + 'px,' + ey + 'px,0) scale(0.08)', opacity: 0 }
    ], { duration: 620, easing: 'cubic-bezier(0.55, 0.05, 0.35, 1)', fill: 'forwards' });
    a.onfinish = function () {
      g.remove(); fliegtRein = false;
      var px = cx + ex, py = cy + ey;
      if (!(window.endoZufluss && window.endoZufluss.schicken && window.endoZufluss.schicken(px, py, bildSrc ? 5 : 3))) funke(px, py, z.x, z.sichtbarY, 520, function () { pulsVon(px, py, z); });
    };
  }
  /* kleiner Lichtpunkt von A nach B */
  function funke(x0, y0, x1, y1, ms, fertig) {
    var f = el('div', 'endo-funke'); f.setAttribute('aria-hidden', 'true');
    f.style.left = (x0 - 4) + 'px'; f.style.top = (y0 - 4) + 'px';
    document.body.appendChild(f);
    var mx = (x1 - x0) * 0.5 + (x1 > x0 ? -1 : 1) * 30, my = (y1 - y0) * 0.5;
    var a = f.animate([
      { transform: 'translate3d(0,0,0) scale(0.4)', opacity: 0 },
      { transform: 'translate3d(' + mx + 'px,' + my + 'px,0) scale(1)', opacity: 1, offset: 0.45 },
      { transform: 'translate3d(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px,0) scale(0.6)', opacity: 0.9, offset: 0.92 },
      { transform: 'translate3d(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px,0) scale(2.2)', opacity: 0 }
    ], { duration: ms, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'forwards' });
    a.onfinish = function () { f.remove(); if (fertig) fertig(); };
  }
  /* endos Antwort: ein Lichtpunkt verlässt die Kugel, landet am Anfang der Nachricht – dann entfaltet sie sich */
  function ausKugel(b) {
    var z = kugelPunkt();
    if (!flugAn || !z || Date.now() - zuletztRaus < 900 || !gestartet) return;
    var r = b.getBoundingClientRect();
    if (!r.width || r.top > window.innerHeight || r.bottom < 0) return;
    zuletztRaus = Date.now();
    b.classList.add('blase--wartet');
    kugelWecken(1800);
    pulsVon(r.left, r.top, z);
    funke(z.x, z.sichtbarY + z.r * 0.4, r.left + 6, r.top + 12, 460, function () {
      b.classList.remove('blase--wartet'); b.classList.add('blase--aus-kugel');
    });
    setTimeout(function () { b.classList.remove('blase--wartet'); }, 1200); /* Sicherheitsnetz */
  }

  /* ---------- Elemente von endo: Looks, Bestätigung, Fortschritt, Ergebnis, Kontakt ---------- */
  function el(tag, klasse, text) {
    var x = document.createElement(tag);
    if (klasse) x.className = klasse;
    if (text != null) x.textContent = text;
    return x;
  }
  function zeigeElement(e) {
    if (!e || !e.typ) return;
    if (e.typ === 'auswahl') { if (Array.isArray(e.optionen) && e.optionen.length >= 2) auswahl = e; }
    else if (e.typ === 'looks') lookKarten(e);
    else if (e.typ === 'karte') bestaetigung(e);
    else if (e.typ === 'kontakt') kontakt(e);
  }
  /* Antwort-Knöpfe von endo: antippen = antworten. Mehrfachwahl: an-/abwählen, dann „Weiter“.
     „Etwas anderes“ öffnet das Textfeld – frei schreiben geht immer. */
  function auswahlKnoepfe(a) {
    var gewaehlt = [];
    var liste = a.optionen.map(function (o) {
      return {
        text: o,
        aktion: function () {
          if (!a.mehrfach) { freieFrage(o); return; }
          var i = gewaehlt.indexOf(o);
          if (i >= 0) gewaehlt.splice(i, 1); else gewaehlt.push(o);
          [].forEach.call(vorschlaege.querySelectorAll('.chip'), function (c) {
            if (a.optionen.indexOf(c.textContent) < 0) return;
            var an = gewaehlt.indexOf(c.textContent) >= 0;
            c.classList.toggle('chip--an', an); c.setAttribute('aria-pressed', String(an));
          });
        }
      };
    });
    if (a.mehrfach) liste.push({ text: 'Weiter', haupt: true, aktion: function () { if (gewaehlt.length) freieFrage(gewaehlt.join(', ')); } });
    liste.push({ text: 'Etwas anderes', aktion: function () { feld.focus(); } });
    knoepfe(liste);
    if (a.mehrfach) [].forEach.call(vorschlaege.querySelectorAll('.chip'), function (c) { if (a.optionen.indexOf(c.textContent) >= 0) c.setAttribute('aria-pressed', 'false'); });
  }
  function lookKarten(e) {
    var reihe = el('div', 'endo-el endo-looks');
    reihe.setAttribute('role', 'list');
    reihe.setAttribute('aria-label', 'Looks für ' + (e.name || 'Ihr Ergebnis'));
    (e.looks || []).slice(0, 30).forEach(function (l) {
      var b = el('button', 'endo-look'); b.type = 'button'; b.setAttribute('role', 'listitem');
      if (l.bild && /^https:\/\//.test(l.bild)) { var img = el('img', 'endo-look__bild'); img.src = l.bild; img.alt = ''; img.loading = 'lazy'; b.appendChild(img); }
      else { var m = el('span', 'endo-look__muster'); m.setAttribute('data-look', l.id || ''); m.setAttribute('aria-hidden', 'true'); b.appendChild(m); }
      b.appendChild(el('span', 'endo-look__name', l.name));
      if (l.text) b.appendChild(el('span', 'endo-look__text', l.text));
      b.addEventListener('click', function () {
        if (beschaeftigt) return;
        reihe.querySelectorAll('.endo-look').forEach(function (x) { x.classList.remove('endo-look--gewaehlt'); });
        b.classList.add('endo-look--gewaehlt');
        freieFrage('Ich nehme den Look „' + l.name + '“' + (e.name ? ' für ' + e.name : '') + '.');
      });
      reihe.appendChild(b);
    });
    reihe.addEventListener('wheel', function (ev) {
      if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX) || reihe.scrollWidth <= reihe.clientWidth) return;
      ev.preventDefault(); reihe.scrollLeft += ev.deltaY;
    }, { passive: false });
    verlauf.appendChild(reihe); nachUnten();
  }
  function neueId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function bestaetigung(e) {
    var k = e.karte || {};
    var aussen = el('div', 'endo-el endo-karte'), innen = el('div', 'endo-karte__innen');
    aussen.appendChild(innen);
    if (k.foto) { var img = el('img', 'endo-karte__foto'); img.src = k.foto; img.alt = 'Ihr Foto'; innen.appendChild(img); }
    var info = el('div');
    info.appendChild(el('div', 'endo-karte__titel', k.name || 'Ihr Auftrag'));
    var zeilen = el('ul', 'endo-karte__zeilen');
    if (k.look) zeilen.appendChild(el('li', null, 'Look: ' + k.look));
    if (k.format && k.format !== 'auto' && k.format !== 'bild') zeilen.appendChild(el('li', null, 'Format: ' + k.format));
    if (k.ueberschrift) zeilen.appendChild(el('li', null, 'Überschrift: „' + k.ueberschrift + '“'));
    info.appendChild(zeilen);
    var kosten = el('div', 'endo-karte__credits'); kosten.appendChild(document.createTextNode('Kosten: ')); kosten.appendChild(el('b', null, k.credits + ' Credits'));
    info.appendChild(kosten);
    innen.appendChild(info);
    var leiste = el('div', 'endo-karte__knoepfe');
    var ja = el('button', 'endo-knopf endo-knopf--ja', 'Ja, erzeugen'); ja.type = 'button';
    var aendern = el('button', 'endo-knopf', 'Ändern'); aendern.type = 'button';
    leiste.appendChild(ja); leiste.appendChild(aendern); innen.appendChild(leiste);
    innen.appendChild(el('p', 'endo-karte__hinweis', 'Erst mit „Ja“ wird erzeugt. Klappt es nicht, bekommen Sie die Credits automatisch zurück.'));
    var auftragId = neueId(); /* bleibt gleich – auch ein zweiter Klick bucht nie doppelt */
    ja.addEventListener('click', function () {
      if (ja.disabled) return;
      ja.disabled = aendern.disabled = true; ja.textContent = 'Wird gestartet …';
      starteAuftrag(e.token, auftragId, k).then(function (ok) {
        ja.textContent = ok ? 'Gestartet' : 'Ja, erzeugen';
        if (!ok) ja.disabled = aendern.disabled = false;
      });
    });
    aendern.addEventListener('click', function () {
      if (beschaeftigt) return;
      ja.disabled = aendern.disabled = true;
      freieFrage('Ich möchte noch etwas ändern.');
    });
    verlauf.appendChild(aussen); nachUnten();
  }
  function starteAuftrag(token, id, karte) {
    return api('/api/endo/auftrag', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: token, auftragId: id }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.j.fehler === 'anmelden') { sitzungSetzen(null); statusZeigen(null); anmeldenMenue('abgelaufen'); return false; }
        if (!x.ok) { endo(x.j.meldung || 'Der Auftrag konnte nicht gestartet werden.'); return false; }
        historie.push({ rolle: 'user', text: '[Auftrag bestätigt: ' + (karte.text || karte.name || '') + ']' });
        if (x.j.status === 'zurueck') { endo(x.j.meldung || 'Der Auftrag konnte nicht gestartet werden. Ihre Credits sind zurückgebucht.'); return true; }
        fortschritt(id, karte, x.j);
        return true;
      }).catch(function () {
        endo('Keine Verbindung. Tippen Sie gleich noch einmal auf „Ja“ – es wird nichts doppelt gebucht.');
        return false;
      });
  }
  function fortschritt(id, karte, erster) {
    if (!id || (laufend && laufend.id === id)) return;
    try { history.replaceState(null, '', location.pathname + location.search + '#auftrag=' + id); } catch (err) {}
    var box = el('div', 'endo-el endo-arbeit');
    var zeile1 = el('div', 'endo-arbeit__kopf');
    zeile1.appendChild(el('span', null, 'endo arbeitet – ' + (karte && karte.name ? karte.name + (karte.look ? ' · ' + karte.look : '') : 'Ihr Auftrag')));
    var uhrText = el('span', 'endo-arbeit__zeit', '0:00'); zeile1.appendChild(uhrText);
    box.appendChild(zeile1);
    box.appendChild(el('div', 'endo-arbeit__balken'));
    var hinweis = el('p', 'endo-arbeit__text', 'Bilder brauchen etwa 1–2 Minuten, Videos 2–4. Sie können die Seite neu laden – der Auftrag läuft weiter.');
    box.appendChild(hinweis);
    verlauf.appendChild(box); nachUnten();
    kugelWecken(4000);
    if (window.endoZufluss) window.endoZufluss.erzeugen(true, box);
    var start0 = Date.now(), pause = 3000;
    var uhr = setInterval(function () {
      var s = Math.round((Date.now() - start0) / 1000);
      uhrText.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
    laufend = { id: id };
    function ende() { clearInterval(uhr); laufend = null; if (window.endoZufluss) window.endoZufluss.erzeugen(false); box.remove(); }
    function frage() {
      api('/api/endo/status?id=' + encodeURIComponent(id))
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.http = r.status; return j; }); })
        .then(function (s) {
          if (s.status === 'fertig') { ende(); ergebnis(s, karte); if (s.verfuegbar != null) statusZeigen(s.verfuegbar); return; }
          if (s.status === 'zurueck') {
            ende(); endo(s.meldung || 'Das hat leider nicht geklappt. Ihre Credits sind zurückgebucht.');
            if (s.verfuegbar != null) statusZeigen(s.verfuegbar);
            try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {}
            return;
          }
          if (s.http === 403 || s.http === 404) { ende(); endo(s.meldung || 'Diesen Auftrag finde ich leider nicht.'); return; }
          if (s.versuch > 1) hinweis.textContent = 'Der erste Versuch hat nicht geklappt – endo versucht es kostenlos ein zweites Mal.';
          pause = Math.min(pause * 1.3, 8000); setTimeout(frage, pause);
        }).catch(function () { pause = Math.min(pause * 1.5, 10000); setTimeout(frage, pause); });
    }
    setTimeout(frage, erster && erster.status === 'fertig' ? 0 : 2500);
  }
  function ergebnis(s, karte) {
    var aussen = el('figure', 'endo-el endo-ergebnis'), innen = el('div', 'endo-ergebnis__innen');
    aussen.appendChild(innen);
    var titel = karte && karte.text ? karte.text : 'Ihr Ergebnis';
    var medium;
    if (s.art === 'video') {
      medium = el('video', 'endo-ergebnis__medium');
      medium.src = s.ergebnisUrl; medium.muted = true; medium.loop = true; medium.controls = true;
      medium.setAttribute('playsinline', ''); if (!ruhig) medium.autoplay = true;
      medium.addEventListener('loadeddata', nachUnten);
    } else {
      medium = el('img', 'endo-ergebnis__medium'); medium.src = s.ergebnisUrl; medium.alt = titel;
      medium.addEventListener('load', nachUnten);
    }
    /* Lädt die Vorschau nicht, bleibt der Download – statt eines kaputten Bildes ein ruhiger Hinweis */
    medium.addEventListener('error', function () {
      medium.replaceWith(el('p', 'endo-arbeit__text', 'Die Vorschau lädt gerade nicht – über „Herunterladen“ öffnen Sie Ihr Ergebnis.'));
    });
    innen.appendChild(medium);
    var fuss = el('figcaption', 'endo-ergebnis__fuss');
    fuss.appendChild(el('span', 'endo-ergebnis__titel', titel));
    var laden = el('a', 'endo-knopf endo-knopf--ja', 'Herunterladen');
    laden.href = s.ergebnisUrl + (s.ergebnisUrl.indexOf('?') < 0 ? '?download=1' : '&download=1');
    laden.rel = 'noopener'; laden.setAttribute('download', '');
    fuss.appendChild(laden); innen.appendChild(fuss);
    verlauf.appendChild(aussen); nachUnten();
    historie.push({ rolle: 'assistant', text: '[Ergebnis fertig: ' + titel + ']' });
    galerieLaden();
    endo('Fertig. Passt es so? Aus dem Ergebnis mache ich Ihnen gern auch ein Werbevideo oder eine Anzeige.');
  }
  function kontakt(e) {
    var reihe = el('div', 'endo-el endo-kontakt');
    var themen = { '3d': 'ein 3D-Produkt', parallax: 'eine Parallax-Szene', abstimmung: 'eine persönliche Abstimmung', website: 'eine komplette Website', sonstiges: 'endo Studio' };
    var text = 'Hallo Emre, ich interessiere mich für ' + (themen[e.anliegen] || themen.sonstiges) + '.\n\nGesendet über den Chat mit endo';
    var wa = el('a', 'endo-knopf endo-knopf--ja', 'WhatsApp an Emre'); wa.href = 'https://wa.me/' + WA_NUMMER + '?text=' + encodeURIComponent(text); wa.target = '_blank'; wa.rel = 'noopener';
    var mail = el('a', 'endo-knopf', 'E-Mail'); mail.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Anfrage über endo') + '&body=' + encodeURIComponent(text);
    reihe.appendChild(wa); reihe.appendChild(mail);
    verlauf.appendChild(reihe); nachUnten();
  }

  /* Eingebaute Antworten, wenn die KI nicht erreichbar ist */
  function lokaleAntwort(t) {
    var s = t.toLowerCase();
    if (/premium/.test(s)) return 'Premium kostet 100 € für 1.000 Credits und schaltet zusätzlich Videos mit zehn Sekunden frei. 3D-Produkte und Parallax-Szenen setzt Emre auf Anfrage persönlich um, dazu kommt die persönliche Abstimmung mit ihm.';
    if (/preis|kost|teuer|günstig|euro|€|paket/.test(s)) return 'Es gibt drei Pakete: ' + paketListe() + '. Ein Produktfoto kostet 12 Credits, ein Video mit fünf Sekunden 20.';
    if (/credit/.test(s)) return 'Credits sind Ihr Guthaben. Jedes Ergebnis kostet eine feste Zahl: Produktfoto 12, Werbeanzeige 10, Shop-Bild 5, Werbevideo 5 s 20, Website-Titelbild 12. Unter „Funktionen und Pakete“ rechnet die Seite aus, welches Paket zu Ihnen passt.';
    if (/abo|kündig|laufzeit|monat|jahr/.test(s)) return 'Sie wählen monatlich, jährlich oder einmalig. Im Jahresabo sparen Sie ' + ((E.abrechnung && E.abrechnung.rabattJahr) || 20) + ' %, einmalig gibt es kein Abo und die Credits gelten ' + ((E.abrechnung && E.abrechnung.einmalGueltigMonate) || 12) + ' Monate.';
    if (/video|reel|tiktok|clip/.test(s)) return 'Ja, aus Ihrem Produktfoto mache ich einen Clip mit fünf Sekunden für 20 Credits. Zehn Sekunden gibt es im Premium-Paket.';
    if (/3d|ar\b|drehbar/.test(s)) return 'Ein drehbares 3D-Modell Ihres Produkts setzt Emre im Premium-Paket auf Anfrage persönlich um. Schreiben Sie ihm gern per WhatsApp oder E-Mail.';
    if (/recht|kommerz|werbung|lizenz|nutzen|verwenden/.test(s)) return 'Ja, Sie dürfen alle Ergebnisse kommerziell nutzen, im Shop, in Anzeigen und auf Social Media.';
    if (/wann|start|verfügbar|live|bald|los/.test(s)) return 'endo Studio startet in Kürze. Wenn Sie Ihr Paket jetzt vormerken, bekommen Sie den Zugang als Erstes.';
    if (/daten|datenschutz|training|speicher|sicher/.test(s)) return 'Ihre Fotos werden nur für Ihre Aufträge verarbeitet und nicht zum Training verwendet. Dieser Chat speichert nichts.';
    if (/website|homepage|webseite|seite bauen/.test(s)) return 'Eine komplette Website baut Emre über ERGUN., mit Bewegung und eigenen Bildern. Das Erstgespräch ist kostenlos.';
    if (/higgsfield|modell|kling|seedance|welche ki|wie funktioniert/.test(s)) return 'Im Hintergrund arbeiten Modelle von Higgsfield. Ich mache Produktfotos, Shop-Bilder, Werbeanzeigen, Werbevideos und Titelbilder für Ihre Website.';
    if (/hallo|hi\b|hey|guten|servus|moin/.test(s)) return 'Hallo! Schön, dass Sie da sind. Erzählen Sie mir, was Sie verkaufen, dann zeige ich Ihnen, was möglich ist.';
    if (/emre|kontakt|mensch|anruf|telefon/.test(s)) return 'Emre erreichen Sie per WhatsApp unter +49 1590 6344961 oder per E-Mail an ergun.eu@gmail.com.';
    return 'Gute Frage. Die beantwortet Emre gern persönlich. Am schnellsten geht es, wenn Sie mir zeigen, was Sie verkaufen: Dann bereite ich alles für Sie vor.';
  }

  /* ---------- Handy: Pille unten, Verlauf fährt beim Antippen auf ---------- */
  var gestartet = false, offen = false;
  /* Im Chat bewegt sich nichts außer den Nachrichten: keine Sprünge der Seite, Kugel und Nebel halten still (Emre, 25.09.) */
  function los() {
    if (gestartet) return;
    gestartet = true;
    document.documentElement.classList.add('endo-chat');
    document.querySelectorAll('[data-orb]').forEach(function (o) { o.dispatchEvent(new Event('orb:halt')); });
    start();
  }
  function setzeOffen(an, fokus) {
    offen = an && handyMq.matches;
    box.classList.toggle('agent--offen', offen);
    oeffnenKnopf.setAttribute('aria-expanded', String(offen));
    var zu = handyMq.matches && !offen;
    oben.inert = zu;
    if (zu) oben.setAttribute('aria-hidden', 'true'); else oben.removeAttribute('aria-hidden');
    if (offen) { los(); nachUnten(); if (fokus) zuKnopf.focus({ preventScroll: true }); }
    else if (fokus && handyMq.matches) { feld.blur(); oeffnenKnopf.focus({ preventScroll: true }); }
    passeAn();
  }
  oeffnenKnopf.addEventListener('click', function () { setzeOffen(true, true); });
  feld.addEventListener('focus', los);
  feld.addEventListener('pointerdown', los);
  zuKnopf.addEventListener('click', function () { setzeOffen(false, true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) setzeOffen(false, true); });
  document.addEventListener('pointerdown', function (e) { if (offen && !box.contains(e.target)) setzeOffen(false, false); });

  /* Tastatur am Handy: Panel über der Tastatur halten und Höhe begrenzen (visualViewport) */
  var vv = window.visualViewport;
  function passeAn() {
    if (vv) box.style.setProperty('--sicht', Math.round(vv.height) + 'px');
    if (!handyMq.matches) { box.style.removeProperty('--tastatur'); box.style.removeProperty('--blatt'); return; }
    var hoehe = window.innerHeight, sicht = vv ? vv.height : hoehe, oben0 = vv ? vv.offsetTop : 0;
    var tastatur = Math.max(0, Math.round(hoehe - sicht - oben0));
    box.style.setProperty('--tastatur', tastatur + 'px');
    box.style.setProperty('--blatt', Math.round(Math.max(200, Math.min(hoehe * 0.55, sicht - 108))) + 'px');
    if (offen) nachUnten();
  }
  if (vv) { vv.addEventListener('resize', passeAn); vv.addEventListener('scroll', passeAn); }
  window.addEventListener('resize', passeAn);
  function wechsel() { setzeOffen(false, false); if (!handyMq.matches && (!extern || ruhig)) beobachteSichtbar(); }
  if (handyMq.addEventListener) handyMq.addEventListener('change', wechsel); else if (handyMq.addListener) handyMq.addListener(wechsel);

  /* Pille nur zeigen, solange der Hero im Bild ist */
  var hero = box.closest('[data-endo-hero]') || document.getElementById('start');
  if (hero && !extern && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { box.classList.toggle('agent--weg', !e[0].isIntersecting); }, { rootMargin: '0px 0px -35% 0px' }).observe(hero);
  }

  /* Nav „Mit endo sprechen" */
  document.querySelectorAll('[data-zu-endo]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      setTimeout(function () { los(); feld.focus({ preventScroll: true }); }, 700);
    });
  });

  /* Desktop: Gespräch startet, sobald das Panel zu sehen ist. Handy: beim ersten Öffnen. */
  function beobachteSichtbar() {
    if (gestartet) return;
    if (!('IntersectionObserver' in window)) { los(); return; }
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting && !handyMq.matches) { io.disconnect(); setTimeout(los, ruhig ? 0 : 900); }
    }, { threshold: 0.3 });
    io.observe(box);
  }
  setzeOffen(false, false);
  /* Kommt der Kunde über den Link aus der Bestätigungs- oder Passwort-E-Mail, startet das Gespräch gleich */
  linkNachricht = linkLesen();
  if (linkNachricht) setTimeout(function () { if (!gestartet) los(); else if (linkNachricht) { var l = linkNachricht; linkNachricht = null; linkAusMail(l); } }, ruhig ? 0 : 600);
  /* Ruhend steht nur die Zeile da; das Gespräch beginnt beim Antippen (siehe feld focus). */
  box.addEventListener('endo:zeigen', function () { if (!handyMq.matches) los(); });
  requestAnimationFrame(function () { box.classList.add('agent--da'); });
})();
