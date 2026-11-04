# Consignes de RH Master

Ces fichiers sont les consignes envoyées à Claude. Vous pouvez les modifier directement
sur GitHub (icône crayon) : Vercel redéploie l'app automatiquement après chaque modification
sur la branche principale.

| Fichier | Rôle | Étape de l'app |
|---|---|---|
| `regles.md` | Règles communes à toutes les consignes (honnêteté, jamais d'invention…) | toutes |
| `lecture.md` | Lecture recruteur du CV face à l'offre (module 2 de la skill) | 2 |
| `recherche-salaires.md` | Recherche web de données de salaire récentes (option) | 3 |
| `marche.md` | Valeur marché et négociation (modules 6 et 8) | 3 et 4 |
| `offre-lien.md` | Récupération du texte d'une offre à partir de son lien | 1 |
| `transcription.md` | Retranscription d'un CV PDF scanné | 1 |

## Règles de modification

- Les mots entre doubles accolades, comme `{{DOSSIER}}`, sont remplacés par l'app au moment
  de l'appel. Ne les supprimez pas et ne les renommez pas.
- Dans `lecture.md` et `marche.md`, le bloc « Réponds uniquement avec un objet JSON » décrit
  les champs que l'écran sait afficher. Vous pouvez changer les explications entre guillemets,
  mais pas les noms des champs (`verdict`, `forces`…), sinon l'écran ne les trouvera plus.
- Après une modification, refaites au moins le parcours d'un cas de recette (dossier `recette/`).
