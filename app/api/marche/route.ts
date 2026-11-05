// Étapes 3 et 4 : valeur marché et négociation (modules 6 et 8),
// avec recherche web de repères de salaire en option (RG02).
import { lireCode, reserverAppel } from "@/lib/server/acces";
import { OUTIL_RECHERCHE, appeler, json, sources, texte } from "@/lib/server/claude";
import { corps, lireAnalyse, lireDossier } from "@/lib/server/entrees";
import { raison, reponseErreur } from "@/lib/server/erreurs";
import { promptMarche, promptRecherche } from "@/lib/server/prompts";
import { SCHEMA_MARCHE } from "@/lib/server/schemas";
import { normMarche } from "@/lib/normalize";
import type { Source } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  let annuler: (() => Promise<void>) | null = null;
  try {
    const b = await corps(req);
    const dossier = lireDossier(b.dossier);
    const analyse = lireAnalyse(b.analyse);
    const r = await reserverAppel(lireCode(req));
    annuler = r.annuler;

    let notes: string | null = null;
    let src: Source[] = [];
    if (b.web === true) {
      // Recherche web : si elle échoue ou ne trouve rien, on continue avec une estimation signalée comme telle.
      try {
        const m = await appeler({ contenu: promptRecherche(dossier, analyse), outils: [OUTIL_RECHERCHE], effort: "medium" });
        src = sources(m);
        notes = src.length ? texte(m) : null;
      } catch (e) {
        console.error("Recherche de salaires indisponible :", raison(e));
      }
    }

    const msg = await appeler({ contenu: promptMarche(dossier, analyse, notes), schema: SCHEMA_MARCHE });
    return Response.json({ marche: normMarche(json(msg), notes ? src : [], Boolean(notes), dossier.pretention), restant: r.restant });
  } catch (e) {
    await annuler?.().catch(() => {});
    return reponseErreur(e);
  }
}
