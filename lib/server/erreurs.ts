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

/** Transforme toute erreur en réponse JSON { erreur: code }, sans jamais renvoyer ni journaliser le contenu du dossier. */
export function reponseErreur(e: unknown): Response {
  if (e instanceof ErreurApi) return Response.json({ erreur: e.code }, { status: e.status });
  if (e instanceof Anthropic.RateLimitError) return Response.json({ erreur: "rate_limited" }, { status: 429 });
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
    console.error("Clé API Anthropic refusée : vérifiez ANTHROPIC_API_KEY.");
    return Response.json({ erreur: "config" }, { status: 500 });
  }
  if (e instanceof Anthropic.BadRequestError) {
    console.error("Requête refusée par l'API Claude :", e.status);
    return Response.json({ erreur: "trop_long" }, { status: 400 });
  }
  if (e instanceof Anthropic.APIError) {
    console.error("Erreur de l'API Claude :", e.status);
    return Response.json({ erreur: "serveur" }, { status: 502 });
  }
  console.error("Erreur serveur :", e instanceof Error ? e.name : "inconnue");
  return Response.json({ erreur: "serveur" }, { status: 500 });
}
