// Formats JSON imposés à Claude (structured outputs). Les noms de champs doivent rester
// identiques à ceux décrits dans prompts/lecture.md et prompts/marche.md.

const texte = { type: "string" };
const objet = (props: Record<string, unknown>) => ({
  type: "object",
  properties: props,
  required: Object.keys(props),
  additionalProperties: false,
});
const liste = (items: unknown) => ({ type: "array", items });

export const SCHEMA_ANALYSE = objet({
  verdict: texte,
  verdictNiveau: { type: "string", enum: ["fort", "moyen", "faible"] },
  adequation: { type: "integer" },
  lecture30s: texte,
  forces: liste(objet({ point: texte, preuve: texte })),
  signauxFaibles: liste(objet({ point: texte, lecture: texte })),
  ecarts: liste(objet({ ecart: texte, type: { type: "string", enum: ["presentation", "competence"] }, action: texte })),
  questionsProbables: liste(objet({ question: texte, verifie: texte })),
  reformulation: texte,
});

export const SCHEMA_MARCHE = objet({
  poste: texte,
  zone: texte,
  fourchette: objet({ bas: { type: "integer" }, median: { type: "integer" }, haut: { type: "integer" } }),
  baseEstimation: texte,
  niveauPercu: texte,
  niveauVisable: texte,
  avantages: liste(texte),
  avisPretention: objet({
    niveau: { type: "string", enum: ["sous_evaluee", "realiste", "ambitieuse", "hors_marche", "non_communiquee"] },
    message: texte,
    cible: { type: "integer" },
  }),
  ancrage: objet({ montant: { type: "integer" }, justification: texte }),
  arguments: liste(texte),
  aDire: liste(texte),
  aEviter: liste(texte),
  objections: liste(objet({ objection: texte, reponse: texte })),
  prochaineAction: texte,
});
