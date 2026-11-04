// Vérifie un code d'invitation et indique le nombre d'appels restants.
import { lireCode, restant } from "@/lib/server/acces";
import { reponseErreur } from "@/lib/server/erreurs";

export async function POST(req: Request) {
  try {
    return Response.json({ ok: true, restant: await restant(lireCode(req)) });
  } catch (e) {
    return reponseErreur(e);
  }
}
