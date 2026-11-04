// APP-11 : retour testeur. Notes, recommandation, étape et commentaire uniquement ; un nouvel envoi remplace le précédent (RG-A06).
import { exigerBasePersistante, lireCode, verifierCode } from "@/lib/server/acces";
import { corps } from "@/lib/server/entrees";
import { ErreurApi, reponseErreur } from "@/lib/server/erreurs";
import { getStore } from "@/lib/server/store";

const ETAPES = ["lecture", "marche", "nego", "synthese", ""];

export async function POST(req: Request) {
  try {
    const code = lireCode(req);
    verifierCode(code);
    exigerBasePersistante();
    const b = await corps(req);
    const note = Number(b.note);
    if (!Number.isInteger(note) || note < 1 || note > 5) throw new ErreurApi("dossier_incomplet");
    const juste = Number(b.juste);
    const retour = {
      note,
      juste: Number.isInteger(juste) && juste >= 1 && juste <= 5 ? juste : null,
      reco: b.reco === "oui" || b.reco === "non" ? b.reco : "",
      etape: ETAPES.includes(String(b.etape)) ? String(b.etape) : "",
      manque: String(b.manque ?? "").slice(0, 2000),
      mode: b.mode === "exemple" ? "exemple" : "direct",
      version: "0.2",
      envoyeLe: Date.now(),
    };
    await getStore().hset("retours", code, JSON.stringify(retour));
    return Response.json({ ok: true });
  } catch (e) {
    return reponseErreur(e);
  }
}
