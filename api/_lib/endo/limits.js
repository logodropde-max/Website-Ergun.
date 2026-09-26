/* endo Studio – Grenzen, damit nichts ausufert (Bauplan Phase C, Emre 26.09.2026).
   Tageslimit in $ gilt für das ganze System (Higgsfield + Claude), Tag in UTC.
   Änderbar ohne Code über die Vercel-Variable ENDO_TAGESLIMIT_USD. */
export const LIMITS = {
  auftraegeProStunde: 10,
  auftraegeProTag: 30,
  chatNachrichtenProTag: 40,
  tageslimitUsd(env = process.env) {
    const wert = Number(env.ENDO_TAGESLIMIT_USD);
    return Number.isFinite(wert) && wert > 0 ? wert : 10;
  }
};
