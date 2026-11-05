// Cas de recette fictifs (dossier recette/), chargeables en un clic à l'étape 1. Aucun résultat précalculé : l'analyse est réelle.
import type { Dossier } from "./types";

export const CAS_TEST: { id: string; titre: string; dossier: Dossier }[] = [
  {
    "id": "c1",
    "titre": "Responsable comptable : offre reçue à 42 k€",
    "dossier": {
      "cv": "Sophie M. — Comptable générale confirmée\nCabinet d'expertise comptable, Villeurbanne — depuis 2019 (7 ans)\n- Tenue et révision d'un portefeuille de 45 dossiers clients (TPE et PME, CA de 0,5 à 12 M€)\n- Établissement des bilans, liasses fiscales et déclarations de TVA\n- Encadrement de 2 assistants comptables depuis 2023\n- Mise en place de la dématérialisation des factures pour 20 clients (gain estimé : 3 jours par clôture)\n- Interlocutrice directe des dirigeants pour la présentation des comptes annuels\n\nAvant : assistante comptable en PME industrielle (2 ans)\nFormation : DCG (Diplôme de comptabilité et de gestion)\nOutils : Cegid, Sage, Excel avancé (TCD, RECHERCHEX)",
      "offre": "Responsable comptable (H/F) — PME de distribution, Lyon 7e\nCDI, 85 salariés, CA 28 M€.\nMissions : piloter la comptabilité générale et fournisseurs, préparer les clôtures mensuelles et annuelles en lien avec l'expert-comptable, encadrer une équipe de 3 personnes, produire le reporting mensuel pour la direction, participer au projet de facturation électronique.\nProfil : DCG minimum, DSCG apprécié. 6 ans d'expérience dont une première expérience d'encadrement. Maîtrise de Sage.\nRémunération proposée : 42 k€ brut annuel. Télétravail 1 jour par semaine.",
      "type": "offre",
      "actuel": 36,
      "pretention": 47,
      "zone": "Lyon"
    }
  },
  {
    "id": "c2",
    "titre": "Enseignant vers chargé de formation : reconversion",
    "dossier": {
      "cv": "Julien T. — Professeur des écoles\nÉducation nationale, académie de Lyon — depuis 2017 (9 ans)\n- Enseignement en cycles 2 et 3, classes de 24 à 28 élèves\n- Conception de séquences pédagogiques et d'outils d'évaluation\n- Maître d'accueil temporaire : accompagnement de 4 enseignants stagiaires\n- Référent numérique de l'école depuis 2022 : formation des collègues à l'ENT et aux tablettes\n- Animation de réunions avec les familles et les partenaires (mairie, périscolaire)\n\nFormation : Master MEEF (métiers de l'enseignement)\nOutils : Genially, Canva, suite Google, notions de Moodle",
      "offre": "Chargé de formation / Ingénieur pédagogique (H/F) — Organisme de formation professionnelle, Lyon Part-Dieu\nCDI.\nMissions : analyser les besoins de formation des entreprises clientes, concevoir des parcours en présentiel et en e-learning, animer des sessions auprès d'adultes salariés, évaluer les acquis et l'efficacité des formations, contribuer à la démarche qualité Qualiopi.\nProfil : 3 ans minimum en ingénierie de formation pour adultes. Maîtrise d'un outil auteur (Articulate Storyline ou Rise). Connaissance du référentiel Qualiopi. Sens commercial pour échanger avec les clients.\nSalaire : selon profil.",
      "type": "candidature",
      "actuel": 33,
      "pretention": 38,
      "zone": "Lyon"
    }
  },
  {
    "id": "c3",
    "titre": "Technicien vers chef d'équipe : évolution interne",
    "dossier": {
      "cv": "Karim B. — Technicien de maintenance industrielle\nSite de production agroalimentaire, Vénissieux — depuis 2020 (6 ans)\n- Maintenance préventive et curative sur 3 lignes de conditionnement\n- Diagnostic de pannes électriques, pneumatiques et mécaniques\n- Participation au projet de GMAO : saisie de l'historique de 120 équipements\n- Remplaçant du chef d'équipe pendant ses congés depuis 2024 (5 semaines par an)\n- Formation au poste de 3 nouveaux techniciens\n- Taux de panne de la ligne 2 réduit de 18 % après refonte du plan préventif (2025)\n\nFormation : BTS Maintenance des systèmes, habilitation électrique BR/B2V\nOutils : GMAO Carl Source, automates Siemens S7 (lecture et diagnostic)",
      "offre": "Chef d'équipe maintenance (H/F) — poste interne, même site, Vénissieux\nPrise de poste : janvier 2027.\nMissions : encadrer une équipe de 6 techniciens en 3x8, planifier la maintenance préventive, suivre les indicateurs (TRS, MTBF, MTTR), gérer le budget pièces détachées, faire le lien avec la production et le service qualité.\nProfil : expérience de terrain en maintenance industrielle, capacité à animer une équipe, rigueur dans le suivi des indicateurs. Une première expérience de management est un plus.\nRémunération : selon la grille interne, avec prime d'équipe.",
      "type": "interne",
      "actuel": 31,
      "pretention": 37,
      "zone": "Lyon (Vénissieux)"
    }
  },
  {
    "id": "c4",
    "titre": "Commercial au CV lacunaire",
    "dossier": {
      "cv": "Thomas L. — Commercial BtoB\nDistributeur de fournitures de bureau, Lyon — 2018 à 2023\n- Prospection et suivi d'un portefeuille de clients professionnels\n- Rendez-vous terrain et négociation des contrats annuels\n- Bons résultats commerciaux\n\nAgence immobilière, Villeurbanne — depuis septembre 2024\n- Négociateur immobilier : estimation, visites, suivi des ventes\n\nFormation : BTS NDRC (négociation et digitalisation de la relation client)\nPermis B",
      "offre": "Business Developer (H/F) — Éditeur de logiciel SaaS RH, Lyon 2e\nCDI, start-up de 40 personnes.\nMissions : prospecter des PME et ETI de la région, qualifier les besoins, mener les démos produit, construire et suivre son pipeline dans le CRM, atteindre des objectifs trimestriels de signature.\nProfil : 3 ans d'expérience en vente BtoB, idéalement de solutions logicielles. Maîtrise d'un CRM (HubSpot ou Salesforce). Aisance avec les cycles de vente de 2 à 4 mois.\nPackage : 35 à 40 k€ fixe + variable de 10 à 15 k€.",
      "type": "candidature",
      "actuel": null,
      "pretention": 40,
      "zone": "Lyon"
    }
  }
];
