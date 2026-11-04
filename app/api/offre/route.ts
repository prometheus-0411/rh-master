// APP-17 : récupère le texte d'une offre à partir de son lien (lecture de page par Claude, côté Anthropic).
import { lireCode, reserverAppel } from "@/lib/server/acces";
import { OUTIL_LECTURE_PAGE, appeler, fetchEnEchec, texte } from "@/lib/server/claude";
import { corps } from "@/lib/server/entrees";
import { ErreurApi, reponseErreur } from "@/lib/server/erreurs";
import { MAX_CHAMP, promptOffreLien } from "@/lib/server/prompts";

export const maxDuration = 120;

// Sites qui exigent une connexion : inutile de dépenser un appel, on propose directement le copier-coller.
const BLOQUES = ["linkedin.com", "indeed.com", "indeed.fr", "welcometothejungle.com"];

function lireUrl(v: unknown): string {
  let u: URL;
  try {
    u = new URL(String(v ?? "").trim());
  } catch {
    throw new ErreurApi("url_invalide");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new ErreurApi("url_invalide");
  if (BLOQUES.some((d) => u.hostname === d || u.hostname.endsWith("." + d))) throw new ErreurApi("offre_inaccessible", 422);
  return u.toString();
}

export async function POST(req: Request) {
  let annuler: (() => Promise<void>) | null = null;
  try {
    const url = lireUrl((await corps(req)).url);
    const r = await reserverAppel(lireCode(req));
    annuler = r.annuler;
    const msg = await appeler({ contenu: promptOffreLien(url), outils: [OUTIL_LECTURE_PAGE], effort: "low" });
    const t = texte(msg);
    if (fetchEnEchec(msg) || t.length < 80 || /^INACCESSIBLE\b/.test(t)) throw new ErreurApi("offre_inaccessible", 422);
    return Response.json({ texte: t.slice(0, MAX_CHAMP), restant: r.restant });
  } catch (e) {
    await annuler?.().catch(() => {});
    return reponseErreur(e);
  }
}
