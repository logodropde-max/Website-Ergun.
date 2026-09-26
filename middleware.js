/* Privat-Schalter für die ganze Seite (Emre, 26.09.2026: „so dass keiner öffnen kann außer ich“).
   Ist in Vercel die Variable SEITE_PASSWORT gesetzt, fragt der Browser vor jeder Seite nach Name + Passwort
   (HTTP-Anmeldung, ohne Cookies; der Name ist egal, nur das Passwort zählt). Variable löschen + neu
   deployen = Seite wieder öffentlich. Ausgenommen: der Higgsfield-Webhook und der tägliche Aufräum-Job,
   die sonst nicht mehr durchkämen (beide sind eigens gesichert). */
import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!api/endo/webhook|api/aufraeumen).*)']
};

function gleich(a, b) {
  const x = String(a), y = String(b);
  let unterschied = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) unterschied |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return unterschied === 0;
}

export default function middleware(request) {
  const passwort = process.env.SEITE_PASSWORT;
  if (!passwort) return next(); // Schalter aus: Seite öffentlich

  const kopf = request.headers.get('authorization') || '';
  if (kopf.startsWith('Basic ')) {
    let pw = '';
    try {
      const klar = Buffer.from(kopf.slice(6), 'base64').toString('utf8');
      pw = klar.slice(klar.indexOf(':') + 1);
    } catch (e) { pw = ''; }
    if (gleich(pw, passwort)) return next({ headers: { 'x-robots-tag': 'noindex, nofollow' } });
  }
  return new Response('Diese Seite ist gerade privat.', {
    status: 401,
    headers: {
      'www-authenticate': 'Basic realm="ERGUN privat", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}
