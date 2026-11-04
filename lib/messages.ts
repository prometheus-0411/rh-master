import type { CodeErreur } from "./types";

export function message(code: CodeErreur | string | undefined): string {
  switch (code) {
    case "code_requis":
      return "Saisissez votre code d'accès testeur pour analyser votre dossier.";
    case "code_invalide":
      return "Ce code d'accès n'est pas reconnu. Vérifiez-le ou demandez-en un au concepteur.";
    case "quota_atteint":
      return "Vous avez utilisé toutes les analyses prévues pour votre code. Contactez le concepteur si vous avez besoin de plus.";
    case "limite_jour":
      return "La limite d'analyses du jour est atteinte pour l'ensemble des testeurs. Réessayez demain.";
    case "dossier_incomplet":
      return "Collez un CV et une offre plus complets (au moins quelques lignes chacun).";
    case "trop_long":
      return "Le CV ou l'offre est trop long. Gardez l'essentiel (moins de 15 000 caractères chacun).";
    case "rate_limited":
      return "Trop de demandes en même temps. Réessayez dans une minute.";
    case "refused":
      return "Claude n'a pas pu traiter ce contenu. Vérifiez le texte du CV et de l'offre.";
    case "invalid_json":
      return "La réponse est arrivée dans un format inattendu. Relancez l'étape.";
    case "offre_inaccessible":
      return "Ce site ne laisse pas lire l'offre automatiquement (c'est souvent le cas de LinkedIn et Indeed). Copiez-collez son texte à la place.";
    case "url_invalide":
      return "Ce lien n'est pas valide. Collez l'adresse complète de l'offre, commençant par https://";
    case "base_absente":
      return "L'app n'est pas encore prête à recevoir des analyses. Prévenez le concepteur.";
    case "config":
      return "L'app n'est pas encore configurée côté serveur. Prévenez le concepteur.";
    case "reseau":
      return "La connexion a échoué. Vérifiez votre réseau et relancez l'étape.";
    case "annule":
      return "Étape arrêtée.";
    default:
      return "Une erreur est survenue. Relancez l'étape.";
  }
}
