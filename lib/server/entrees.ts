// Lecture et contrôle des données envoyées par le navigateur.
import type { Analyse, Dossier, Situation } from "../types";
import { normAnalyse, num } from "../normalize";
import { ErreurApi } from "./erreurs";
import { MAX_CHAMP } from "./prompts";

export async function corps(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? b : {};
  } catch {
    throw new ErreurApi("dossier_incomplet");
  }
}

export function lireDossier(v: unknown): Dossier {
  const d = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const s = (x: unknown) => (typeof x === "string" ? x.trim() : "");
  const type: Situation = d.type === "offre" || d.type === "interne" ? d.type : "candidature";
  const dossier: Dossier = {
    cv: s(d.cv),
    offre: s(d.offre),
    type,
    actuel: num(d.actuel),
    pretention: num(d.pretention),
    zone: s(d.zone).slice(0, 80) || "Lyon",
  };
  // APP-01 : seuils minimaux et maximaux
  if (dossier.cv.length < 150 || dossier.offre.length < 80) throw new ErreurApi("dossier_incomplet");
  if (dossier.cv.length > MAX_CHAMP || dossier.offre.length > MAX_CHAMP) throw new ErreurApi("trop_long");
  return dossier;
}

export function lireAnalyse(v: unknown): Analyse {
  const a = normAnalyse(v);
  if (!a.verdict || a.ecarts.length === 0) throw new ErreurApi("dossier_incomplet");
  return a;
}
