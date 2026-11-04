// APP-12 : retours testeurs et consommation, réservés au concepteur (mot de passe ADMIN_CODE).
import { codesConfigures, jourCourant, verifierAdmin } from "@/lib/server/acces";
import { reponseErreur } from "@/lib/server/erreurs";
import { getStore, storePersistant } from "@/lib/server/store";

export async function GET(req: Request) {
  try {
    verifierAdmin(req);
    const s = getStore();
    const bruts = await s.hgetall("retours");
    const retours = Object.entries(bruts)
      .map(([code, v]) => {
        try {
          return { code, ...JSON.parse(v) };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b!.envoyeLe ?? 0) - (a!.envoyeLe ?? 0));
    const codes = await Promise.all(
      [...codesConfigures()].map(async ([code, limite]) => ({ code, limite, utilise: await s.get(`usage:${code}`) })),
    );
    return Response.json({
      retours,
      codes,
      aujourdhui: await s.get(`jour:${jourCourant()}`),
      limiteJour: Number(process.env.LIMITE_JOUR) || 150,
      persistant: storePersistant(),
    });
  } catch (e) {
    return reponseErreur(e);
  }
}
