// Formes de données partagées entre l'interface et le serveur.

export type Situation = "candidature" | "offre" | "interne";

export const SITUATIONS: Record<Situation, string> = {
  candidature: "Candidature en cours (pas encore d'offre)",
  offre: "Offre reçue, à négocier",
  interne: "Augmentation ou évolution en interne",
};

export interface Dossier {
  cv: string;
  offre: string;
  type: Situation;
  actuel: number | null;
  pretention: number | null;
  zone: string;
}

export interface Analyse {
  verdict: string;
  verdictNiveau: "fort" | "moyen" | "faible";
  adequation: number;
  lecture30s: string;
  forces: { point: string; preuve: string }[];
  signauxFaibles: { point: string; lecture: string }[];
  ecarts: { ecart: string; type: "presentation" | "competence"; action: string }[];
  questionsProbables: { question: string; verifie: string }[];
  reformulation: string;
}

export interface Source {
  titre: string;
  url: string;
}

export type NiveauPretention = "sous_evaluee" | "realiste" | "ambitieuse" | "hors_marche";

export interface AvisPretention {
  niveau: NiveauPretention;
  /** Écart en % : négatif sous le bas de la fourchette, positif au-dessus du haut, 0 dans la fourchette */
  ecartPct: number;
  message: string;
  cible: number | null;
}

export interface Marche {
  poste: string;
  zone: string;
  fourchette: { bas: number; median: number; haut: number } | null;
  baseEstimation: string;
  /** true si la fourchette s'appuie sur une recherche web faite pour ce dossier */
  sourcee: boolean;
  sources: Source[];
  niveauPercu: string;
  niveauVisable: string;
  avantages: string[];
  /** Avis sur la prétention envisagée ; le niveau est recalculé à partir de la fourchette (normalize.ts). Absent sans prétention. */
  avisPretention: AvisPretention | null;
  ancrage: { montant: number | null; justification: string };
  arguments: string[];
  aDire: string[];
  aEviter: string[];
  objections: { objection: string; reponse: string }[];
  prochaineAction: string;
}

export type Etape = "lecture" | "marche" | "nego" | "synthese" | "";

export interface Retour {
  note: number;
  juste: number | null;
  reco: "oui" | "non" | "";
  etape: Etape;
  manque: string;
  mode: "exemple" | "direct";
}

/** Codes d'erreur renvoyés par l'API, traduits en messages dans lib/messages.ts */
export type CodeErreur =
  | "code_requis"
  | "code_invalide"
  | "quota_atteint"
  | "limite_jour"
  | "dossier_incomplet"
  | "trop_long"
  | "rate_limited"
  | "refused"
  | "invalid_json"
  | "offre_inaccessible"
  | "url_invalide"
  | "config"
  | "base_absente"
  | "serveur";
