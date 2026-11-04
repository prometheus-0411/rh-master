// APP-02 : retranscription d'un PDF scanné (pages envoyées en images, 3 au maximum). Rien n'est conservé.
import { lireCode, reserverAppel } from "@/lib/server/acces";
import { appeler, texte } from "@/lib/server/claude";
import { corps } from "@/lib/server/entrees";
import { ErreurApi, reponseErreur } from "@/lib/server/erreurs";
import { MAX_CHAMP, promptTranscription } from "@/lib/server/prompts";

export const maxDuration = 120;

export async function POST(req: Request) {
  let annuler: (() => Promise<void>) | null = null;
  try {
    const b = await corps(req);
    const images = (Array.isArray(b.images) ? b.images : [])
      .filter((x): x is string => typeof x === "string" && /^[A-Za-z0-9+/=]+$/.test(x) && x.length < 2_000_000)
      .slice(0, 3);
    if (!images.length) throw new ErreurApi("dossier_incomplet");
    const r = await reserverAppel(lireCode(req));
    annuler = r.annuler;
    const msg = await appeler({
      contenu: [
        ...images.map((data) => ({ type: "image" as const, source: { type: "base64" as const, media_type: "image/jpeg" as const, data } })),
        { type: "text" as const, text: promptTranscription() },
      ],
      effort: "low",
    });
    return Response.json({ texte: texte(msg).slice(0, MAX_CHAMP), restant: r.restant });
  } catch (e) {
    await annuler?.().catch(() => {});
    return reponseErreur(e);
  }
}
