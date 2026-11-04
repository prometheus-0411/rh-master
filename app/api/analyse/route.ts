// Étape 2 : lecture recruteur (module 2 de la skill).
import { lireCode, reserverAppel } from "@/lib/server/acces";
import { appeler, json } from "@/lib/server/claude";
import { corps, lireDossier } from "@/lib/server/entrees";
import { reponseErreur } from "@/lib/server/erreurs";
import { promptLecture } from "@/lib/server/prompts";
import { SCHEMA_ANALYSE } from "@/lib/server/schemas";
import { normAnalyse } from "@/lib/normalize";

export const maxDuration = 300;

export async function POST(req: Request) {
  let annuler: (() => Promise<void>) | null = null;
  try {
    const b = await corps(req);
    const dossier = lireDossier(b.dossier);
    const r = await reserverAppel(lireCode(req));
    annuler = r.annuler;
    const msg = await appeler({ contenu: promptLecture(dossier), schema: SCHEMA_ANALYSE });
    return Response.json({ analyse: normAnalyse(json(msg)), restant: r.restant });
  } catch (e) {
    await annuler?.().catch(() => {});
    return reponseErreur(e);
  }
}
