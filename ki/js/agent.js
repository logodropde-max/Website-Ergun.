/* endo: der Chat-Agent auf /ki/.
   Führt durch vier Schritte (Produkt, Look, Format, Foto) und lädt zur Warteliste ein.
   Freie Fragen gehen an /api/agent (Claude). Ist dort kein Schlüssel hinterlegt oder schlägt der
   Aufruf fehl, antwortet endo mit den eingebauten Antworten unten. */
(function () {
  var box = document.querySelector('[data-agent]');
  if (!box) return;
  var verlauf = box.querySelector('[data-verlauf]'), vorschlaege = box.querySelector('[data-vorschlaege]');
  var eingabe = box.querySelector('[data-eingabe]'), feld = box.querySelector('[data-text]');
  var fotoKnopf = box.querySelector('[data-foto]'), datei = box.querySelector('[data-datei]'), senden = box.querySelector('[data-senden]');
  var oben = box.querySelector('[data-oben]'), zuKnopf = box.querySelector('[data-zu]'), oeffnenKnopf = box.querySelector('[data-oeffnen]');
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var handyMq = window.matchMedia ? matchMedia('(max-width: 860px)') : { matches: false };

  var WA_NUMMER = '4915906344961', MAIL = 'ergun.eu@gmail.com';
  var BILD_NACHHER = 'https://d8j0ntlcm91z4.cloudfront.net/user_3JGnRZcljS9ZEfmpThKsT6DATn2/hf_20260924_200307_ee98c144-5d85-4b91-8e6b-c82d664263d9.png';
  var PLATZHALTER = 'Fragen Sie endo …';

  var schritt = 'start', kiAus = false, beschaeftigt = false;
  var daten = { kategorie: '', look: '', format: '', credits: 0, premium: false, fotoName: '', fotoUrl: '', email: '' };
  var historie = []; /* für /api/agent: { rolle: 'user' | 'assistant', text } */

  var KATEGORIEN = ['Mode', 'Kosmetik', 'Elektronik', 'Essen und Getränke', 'Möbel und Deko', 'Etwas anderes'];
  var LOOKS = ['Studio hell', 'Luxus dunkel', 'Natur und Licht', 'Neon Future'];
  var FORMATE = [
    { name: 'Shopfoto', credits: 2 },
    { name: 'Instagram-Anzeige', credits: 4 },
    { name: 'Story oder Reel', credits: 4 },
    { name: 'Werbevideo', credits: 12, premium: true },
    { name: '3D-Modell', credits: 0, premium: true }
  ];

  /* ---------- Darstellung ---------- */
  function nachUnten() {
    verlauf.scrollTop = verlauf.scrollHeight;
    requestAnimationFrame(function () { verlauf.scrollTop = verlauf.scrollHeight; });
  }
  function blase(wer, text) {
    var b = document.createElement('div');
    b.className = 'blase blase--' + wer;
    b.textContent = text;
    verlauf.appendChild(b); nachUnten();
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
  function du(text) { blase('du', text); historie.push({ rolle: 'user', text: text }); }
  function bild(wer, src, unterschrift) {
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
      b.addEventListener('click', function () { if (!beschaeftigt) k.aktion(); });
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
    feld.type = art === 'mail' ? 'email' : 'text';
    feld.setAttribute('inputmode', art === 'mail' ? 'email' : 'text');
    feld.setAttribute('autocomplete', art === 'mail' ? 'email' : 'off');
    feld.placeholder = art === 'mail' ? 'name@shop.de' : PLATZHALTER;
  }
  function sperren(an) { beschaeftigt = an; senden.disabled = an; }

  /* ---------- Gesprächsschritte ---------- */
  function start() {
    schritt = 'kategorie';
    sperren(true);
    endo('Hallo, ich bin endo. Ich mache aus Ihrem Handyfoto ein Profi-Produktfoto, eine Anzeige oder sogar ein Video.')
      .then(function () { return endo('Was verkaufen Sie?'); })
      .then(function () { sperren(false); zeigeSchritt(); });
  }
  function zeigeSchritt() {
    eingabeArt(schritt === 'mail' ? 'mail' : 'text');
    if (schritt === 'kategorie') knoepfe(KATEGORIEN.map(function (k) { return { text: k, aktion: function () { kategorie(k); } }; }));
    else if (schritt === 'look') knoepfe(LOOKS.map(function (l) { return { text: l, aktion: function () { look(l); } }; }).concat([{ text: 'Ich beschreibe es selbst', aktion: selbstBeschreiben }]));
    else if (schritt === 'format') knoepfe(FORMATE.map(function (f) { return { text: f.name + (f.premium ? ' · Premium' : ' · ' + f.credits + ' Credits'), aktion: function () { format(f); } }; }));
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
    endo('Schöne Wahl. Und wofür brauchen Sie das Ergebnis?').then(function () { sperren(false); zeigeSchritt(); });
  }
  function format(f) {
    knoepfe([]); du(f.name); daten.format = f.name; daten.credits = f.credits; daten.premium = !!f.premium; schritt = 'foto'; sperren(true);
    var kosten = f.premium
      ? 'Das gehört zum Premium-Paket, dort ist alles freigeschaltet.'
      : 'Das kostet ' + f.credits + ' Credits, im Start-Paket also rund ' + String(Math.round(f.credits * 9)) + ' Cent.';
    endo('Perfekt: ' + (daten.kategorie || 'Ihr Produkt') + ', Look „' + daten.look + '", als ' + f.name + '. ' + kosten)
      .then(function () { return endo('Zeigen Sie mir jetzt Ihr Produkt. Ein Handyfoto genügt.'); })
      .then(function () { sperren(false); zeigeSchritt(); });
  }
  function frage() {
    knoepfe([]); du('Ich habe eine Frage'); sperren(true);
    endo('Gern, fragen Sie mich alles zu endo.ai, zu Preisen oder zu den Möglichkeiten.').then(function () { sperren(false); feld.focus(); });
  }
  function frageMail() {
    knoepfe([]); schritt = 'mail'; sperren(true);
    endo('endo.ai startet in Kürze. Wohin darf ich Ihnen den Startzugang schicken? Ihre E-Mail-Adresse genügt.')
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
    knoepfe([]);
    bild('du', URL.createObjectURL(f), f.name);
    historie.push({ rolle: 'user', text: '[Foto hochgeladen: ' + f.name + ']' });
    daten.fotoName = f.name;
    hochladen(f);
    sperren(true);
    endo('Starkes Motiv. Genau so etwas setze ich ins Studio, in eine Anzeige oder in ein Video.')
      .then(function () { sperren(false); if (!daten.email) frageMail(); else { schritt = 'senden'; zeigeSchritt(); } });
  });
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
    var text = 'Hallo Emre, ich möchte beim Start von endo.ai dabei sein.\n\n' +
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
      location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('endo.ai: Früher Zugang') + '&body=' + encodeURIComponent(text);
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
    var t = feld.value.trim();
    if (!t || beschaeftigt) return;
    feld.value = '';
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
    knoepfe([]); du(t); sperren(true);
    var t0 = tippt();
    frageKI().then(function (antwort) {
      t0.remove();
      var text = antwort || lokaleAntwort(t);
      var b = blase('endo', text);
      historie.push({ rolle: 'assistant', text: text });
      if (/komplette Website|Erstgespräch/.test(text) && !antwort) {
        b.appendChild(document.createTextNode(' '));
        var a = document.createElement('a'); a.href = '../#kontakt'; a.textContent = 'Zum Erstgespräch'; b.appendChild(a);
      }
      sperren(false); zeigeSchritt();
    });
  }
  function frageKI() {
    if (kiAus || !window.fetch) return Promise.resolve('');
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    return fetch('/api/agent', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nachrichten: historie.slice(-12) }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (r.status === 503 || r.status === 404 || r.status === 403 || r.status === 405) kiAus = true;
      return r.ok ? r.json() : null;
    }).then(function (j) { return j && j.antwort ? String(j.antwort) : ''; })
      .catch(function () { clearTimeout(timer); return ''; });
  }

  /* Eingebaute Antworten, wenn die KI nicht erreichbar ist */
  function lokaleAntwort(t) {
    var s = t.toLowerCase();
    if (/premium/.test(s)) return 'Premium kostet 199 € für 3.500 Credits und schaltet alles frei: Werbevideos, UGC-Videos, 3D-Modelle, Parallax-Szenen und das KI-Markengesicht. Dazu Vorrang und ein persönlicher Start mit Emre.';
    if (/preis|kost|teuer|günstig|euro|€|paket/.test(s)) return 'Es gibt vier Pakete: Start 9 € für 100 Credits, Pro 29 € für 400, Studio 79 € für 1.200 und Premium 199 € für 3.500. Ein Produktfoto kostet 2 Credits, also rund 18 Cent.';
    if (/credit/.test(s)) return 'Credits sind Ihr Guthaben. Jedes Ergebnis kostet eine feste Zahl: Produktfoto 2, Anzeige 4, Video ab 12. Sie sehen die Kosten immer vor dem Start.';
    if (/abo|kündig|laufzeit|monat/.test(s)) return 'Es gibt kein Abo und keine Laufzeit. Sie kaufen Credits nur, wenn Sie welche brauchen.';
    if (/video|reel|tiktok|clip/.test(s)) return 'Ja, aus einem Bild mache ich Clips mit fünf bis zehn Sekunden, auch UGC-Videos mit einem KI-Creator. Videos gehören zum Premium-Paket.';
    if (/3d|ar\b|drehbar/.test(s)) return 'Aus einem Foto erstelle ich ein drehbares 3D-Modell Ihres Produkts, zum Beispiel für Shop und AR. Das ist Teil von Premium.';
    if (/recht|kommerz|werbung|lizenz|nutzen|verwenden/.test(s)) return 'Ja, Sie dürfen alle Ergebnisse kommerziell nutzen, im Shop, in Anzeigen und auf Social Media.';
    if (/wann|start|verfügbar|live|bald|los/.test(s)) return 'endo.ai startet in Kürze. Wenn Sie sich jetzt vormerken, bekommen Sie den Zugang als Erstes.';
    if (/daten|datenschutz|training|speicher|sicher/.test(s)) return 'Ihre Fotos werden nur für Ihre Aufträge verarbeitet und nicht zum Training verwendet. Dieser Chat speichert nichts.';
    if (/website|homepage|webseite|seite bauen/.test(s)) return 'Eine komplette Website baut Emre über ERGUN., mit Bewegung und eigenen Bildern. Das Erstgespräch ist kostenlos.';
    if (/higgsfield|modell|kling|seedance|welche ki|wie funktioniert/.test(s)) return 'Im Hintergrund arbeiten über 50 KI-Modelle von Higgsfield für Bild, Video, Audio und 3D. Ich wähle für Ihren Wunsch das passende aus.';
    if (/hallo|hi\b|hey|guten|servus|moin/.test(s)) return 'Hallo! Schön, dass Sie da sind. Erzählen Sie mir, was Sie verkaufen, dann zeige ich Ihnen, was möglich ist.';
    if (/emre|kontakt|mensch|anruf|telefon/.test(s)) return 'Emre erreichen Sie per WhatsApp unter +49 1590 6344961 oder per E-Mail an ergun.eu@gmail.com.';
    return 'Gute Frage. Die beantwortet Emre gern persönlich. Am schnellsten geht es, wenn Sie mir zeigen, was Sie verkaufen: Dann bereite ich alles für Sie vor.';
  }

  /* ---------- Handy: Pille unten, Verlauf fährt beim Antippen auf ---------- */
  var gestartet = false, offen = false;
  function los() { if (!gestartet) { gestartet = true; start(); } }
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
  zuKnopf.addEventListener('click', function () { setzeOffen(false, true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) setzeOffen(false, true); });
  document.addEventListener('pointerdown', function (e) { if (offen && !box.contains(e.target)) setzeOffen(false, false); });

  /* Tastatur am Handy: Panel über der Tastatur halten und Höhe begrenzen (visualViewport) */
  var vv = window.visualViewport;
  function passeAn() {
    if (!handyMq.matches) { box.style.removeProperty('--tastatur'); box.style.removeProperty('--blatt'); return; }
    var hoehe = window.innerHeight, sicht = vv ? vv.height : hoehe, oben0 = vv ? vv.offsetTop : 0;
    var tastatur = Math.max(0, Math.round(hoehe - sicht - oben0));
    box.style.setProperty('--tastatur', tastatur + 'px');
    box.style.setProperty('--blatt', Math.round(Math.max(200, Math.min(hoehe * 0.55, sicht - 108))) + 'px');
    if (offen) nachUnten();
  }
  if (vv) { vv.addEventListener('resize', passeAn); vv.addEventListener('scroll', passeAn); }
  window.addEventListener('resize', passeAn);
  function wechsel() { setzeOffen(false, false); if (!handyMq.matches) beobachteSichtbar(); }
  if (handyMq.addEventListener) handyMq.addEventListener('change', wechsel); else if (handyMq.addListener) handyMq.addListener(wechsel);

  /* Pille nur zeigen, solange der Hero im Bild ist */
  var hero = document.getElementById('start');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { box.classList.toggle('agent--weg', !e[0].isIntersecting); }, { rootMargin: '0px 0px -35% 0px' }).observe(hero);
  }

  /* Nav „Mit endo sprechen" */
  document.querySelectorAll('[data-zu-endo]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (handyMq.matches) { e.preventDefault(); setTimeout(function () { setzeOffen(true, true); }, 50); }
      else setTimeout(function () { los(); feld.focus({ preventScroll: true }); }, 700);
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
  if (!handyMq.matches) beobachteSichtbar();
  requestAnimationFrame(function () { box.classList.add('agent--da'); });
})();
