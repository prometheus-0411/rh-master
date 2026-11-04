import Anthropic from "@anthropic-ai/sdk";
import type { CodeErreur } from "../types";

export class ErreurApi extends Error {
  constructor(
    public code: CodeErreur,
    public status = 400,
  ) {
    super(code);
  }
}

/** Raison donnée par l'API, pour le journal : décrit la requête refusée, jamais le contenu du dossier. Tronquée par prudence. */
export const raison = (e: unknown) => (e instanceof Error ? e.message : String(e)).replace(/\s+/g, " ").slice(0, 300);

/** Transforme toute erreur en réponse JSON { erreur: code }, sans jamais renvoyer ni journaliser le contenu du dossier. */
export function reponseErreur(e: unknown): Response {
  if (e instanceof ErreurApi) return Response.json({ erreur: e.code }, { status: e.status });
  if (e instanceof Anthropic.RateLimitError) return Response.json({ erreur: "rate_limited" }, { status: 429 });
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
    console.error("Clé API Anthropic refusée : vérifiez ANTHROPIC_API_KEY.", raison(e));
    return Response.json({ erreur: "config" }, { status: 500 });
  }
  if (e instanceof Anthropic.NotFoundError) {
    console.error("Ressource introuvable côté API Claude (nom de modèle ? ANTHROPIC_MODEL) :", raison(e));
    return Response.json({ erreur: "config" }, { status: 500 });
  }
  if (e instanceof Anthropic.BadRequestError) {
    const r = raison(e);
    console.error("Requête refusée par l'API Claude :", e.status, r);
    // Seul un dépassement de taille relève de l'utilisateur ; tout autre refus est un réglage de l'app.
    const tropLong = /prompt is too long|input is too long|too many input tokens/i.test(r);
    return Response.json({ erreur: tropLong ? "trop_long" : "config" }, { status: 400 });
  }
  if (e instanceof Anthropic.APIError) {
    console.error("Erreur de l'API Claude :", e.status, raison(e));
    return Response.json({ erreur: "serveur" }, { status: 502 });
  }
  console.error("Erreur serveur :", e instanceof Error ? e.name : "inconnue");
  return Response.json({ erreur: "serveur" }, { status: 500 });
}
