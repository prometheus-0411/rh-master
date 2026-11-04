// Vérifie un code d'invitation et indique le nombre d'appels restants.
import { exigerBasePersistante, lireCode, restant } from "@/lib/server/acces";
import { reponseErreur } from "@/lib/server/erreurs";

export async function POST(req: Request) {
  try {
    const code = lireCode(req);
    const n = await restant(code);
    exigerBasePersistante();
    return Response.json({ ok: true, restant: n });
  } catch (e) {
    return reponseErreur(e);
  }
}
