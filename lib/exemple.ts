// Exemple fictif (profil et offre inventés), pré-calculé : consultable sans code ni appel à Claude (RG-A03).
import type { Analyse, Dossier, Marche } from "./types";

export const EX_DOSSIER: Dossier = {
  cv: `Camille R. — Analyste support applicatif
ESN lyonnaise, depuis 2023 (3 ans)
- Support N2 sur un périmètre de 12 applications métier (secteur assurance)
- Rédaction de plus de 40 procédures d'exploitation et fiches d'incident
- Participation aux comités de mise en production avec les équipes métier
- Animation d'un point hebdomadaire avec deux chefs de projet

Avant : conseillère clientèle en agence bancaire (2 ans)
Formation : Licence pro Métiers de l'informatique
Outils : ServiceNow, Jira, SQL (requêtes simples), Excel avancé`,
  offre: `Business Analyst junior (H/F) — ESN, Lyon Part-Dieu (offre fictive)
Missions : recueillir et formaliser les besoins métier, rédiger les spécifications fonctionnelles et les user stories, préparer et exécuter les recettes, animer des ateliers.
Profil : 1 à 3 ans d'expérience en BA, MOA ou support fonctionnel. Aisance rédactionnelle. Connaissance Agile/Scrum appréciée. SQL apprécié.
Hybride : 2 jours de télétravail par semaine.`,
  type: "candidature",
  actuel: 34,
  pretention: 40,
  zone: "Lyon",
};
export const EX_ANALYSE: Analyse = {
  verdict: "Entretien probable, avec une réserve sur l'expérience BA formelle",
  verdictNiveau: "moyen", adequation: 64,
  lecture30s: "Profil support applicatif solide, proche du métier, habitué aux mises en production. Le recruteur cherche des livrables BA (spécifications, user stories, recettes) et n'en voit aucun nommé. La reconversion bancaire peut devenir un atout relationnel si elle est cadrée.",
  forces: [
    { point: "Connaissance des applications en production", preuve: "Support N2 sur 12 applications métier" },
    { point: "Rigueur rédactionnelle démontrée", preuve: "Plus de 40 procédures d'exploitation rédigées" },
    { point: "Interface régulière avec le métier", preuve: "Comités de mise en production avec les équipes métier" }
  ],
  signauxFaibles: [
    { point: "Aucun livrable BA nommé", lecture: "Le recruteur peut classer le profil en « support » plutôt qu'en « analyse »." },
    { point: "Pas de méthode Agile citée", lecture: "Doute sur la capacité à travailler en sprint et en user stories." },
    { point: "Réalisations peu chiffrées", lecture: "L'impact reste difficile à mesurer." }
  ],
  ecarts: [
    { ecart: "Les procédures rédigées ne sont pas présentées comme de la formalisation de besoin", type: "presentation", action: "Reformuler en « formalisation de processus et de règles de gestion »." },
    { ecart: "Participation aux recettes non mentionnée", type: "presentation", action: "[à compléter : avez-vous testé des évolutions avant mise en production ?] Si oui, le placer en tête." },
    { ecart: "Pas de pratique de rédaction de user stories", type: "competence", action: "Rédiger 5 user stories sur une évolution réelle du périmètre et les joindre en annexe." },
    { ecart: "SQL limité aux requêtes simples", type: "competence", action: "Travailler jointures et agrégats pendant 3 à 4 semaines." }
  ],
  questionsProbables: [
    { question: "Racontez une situation où vous avez traduit un besoin métier en solution.", verifie: "Capacité d'analyse et de reformulation" },
    { question: "Pourquoi quitter le support pour l'analyse ?", verifie: "Solidité de la motivation" },
    { question: "Comment préparez-vous une recette ?", verifie: "Connaissance des livrables BA" },
    { question: "Décrivez un désaccord avec un interlocuteur métier.", verifie: "Posture et gestion des tensions" },
    { question: "Comment priorisez-vous des demandes contradictoires ?", verifie: "Maturité sur l'arbitrage" }
  ],
  reformulation: "Analyste applicatif au contact du métier depuis 3 ans, je formalise des processus, sécurise les mises en production et fais le lien entre utilisateurs et équipes projet. Je veux maintenant porter ce travail en amont, sur le recueil et la formalisation du besoin."
};
export const EX_MARCHE: Marche = {
  poste: "Business Analyst junior", zone: "Lyon",
  fourchette: { bas: 35, median: 38, haut: 42 },
  sourcee: false,
  sources: [],
  baseEstimation: "Estimation fondée sur les niveaux habituels d'un BA junior en ESN à Lyon. Aucune offre n'a été consultée : à vérifier sur 3 ou 4 annonces récentes.",
  niveauPercu: "BA junior en reconversion depuis le support : pas d'expérience BA formelle, 3 ans très proches du métier.",
  niveauVisable: "BA junior confirmé sous 18 mois, avec des livrables à montrer.",
  avantages: ["Jours de télétravail supplémentaires", "Certification BA financée", "Statut cadre", "Revue de salaire à 12 mois écrite dans l'offre"],
  ancrage: { montant: 41, justification: "Un peu au-dessus du médian : 3 ans de connaissance applicative réduisent le temps d'intégration." },
  arguments: [
    "Connaissance de la production : intégration rapide sur les sujets applicatifs",
    "Habitude des comités de mise en production et des interlocuteurs métier",
    "Rédaction déjà éprouvée (plus de 40 procédures)",
    "Projet de certification BA engagé"
  ],
  aDire: [
    "« Au vu du poste et de mon expérience applicative, je me situe autour de 41 k€ brut annuel. »",
    "« Qu'est-ce qui rendrait ce montant possible de votre côté ? »",
    "« Si le fixe est contraint, pouvons-nous regarder la formation ou une revue à 12 mois ? »"
  ],
  aEviter: [
    "Annoncer son salaire actuel avant sa prétention",
    "« Je prends ce que vous me proposez. »",
    "Justifier le montant par ses besoins personnels"
  ],
  objections: [
    { objection: "« Vous n'avez pas d'expérience BA formelle. »", reponse: "« Pas sous ce titre, c'est vrai. Sur le fond, je formalise déjà des processus et je travaille avec le métier à chaque mise en production. Je peux vous montrer un exemple. »" },
    { objection: "« Notre grille junior s'arrête à 38 k€. »", reponse: "« Je comprends. Pouvons-nous alors écrire une revue à 12 mois sur objectifs et financer une certification ? »" },
    { objection: "« On verra à 6 mois. »", reponse: "« Volontiers. Pouvons-nous inscrire dans l'offre la date et les critères de cette revue ? »" }
  ],
  prochaineAction: "Relever le salaire affiché sur 4 offres de BA junior à Lyon avant l'entretien, pour confirmer la fourchette."
};

