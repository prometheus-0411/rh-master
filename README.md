# RH Master — v0.2

App web de préparation de candidature : **lecture recruteur** du CV face à une offre, **valeur marché**, **négociation salariale**, fiche de synthèse et retours testeurs.

La v0.2 porte le MVP 0.1 (page interactive claude.ai) en **app autonome**. Les testeurs n'ont plus besoin de compte claude.ai : l'app appelle Claude avec la clé API du concepteur. C'est la réponse à l'échec du test R13 (option B de R14).

## Ce qui change par rapport au MVP 0.1

| | MVP 0.1 (artefact claude.ai) | v0.2 (cette app) |
|---|---|---|
| Accès testeur | Compte claude.ai + invitation nominative | Lien + **code d'invitation** |
| Coût d'une analyse | Usage du testeur | Clé API du concepteur, **plafond par code et par jour** |
| Fourchette de salaire | Estimation (RG-A02) | **Recherche web en option, sources citées** (retour à RG02) ; sinon estimation signalée |
| Offre d'emploi | Copier-coller | Copier-coller **ou lien** (APP-17) |
| Retours testeurs | Base de l'artefact | Petite base Upstash Redis, page `/admin` |
| CV et offre | Jamais stockés (RG-A01) | Inchangé : transmis à Claude le temps de l'analyse, jamais enregistrés |

Inchangés : le parcours en 5 étapes, l'exemple fictif consultable sans code (RG-A03), les consignes et formats de réponse, le rendu téléphone (APP-13). Hors périmètre (DEC-A03) : simulation d'entretien, pitch, coaching, SWOT, RH caché.

---

## Mettre l'app en ligne (environ 20 minutes, une seule fois)

### 1. Clé API Anthropic

1. Allez sur [console.anthropic.com](https://console.anthropic.com) et créez un compte si besoin.
2. **Billing** : ajoutez un moyen de paiement et un petit crédit (10 € suffisent pour les tests). Réglez une **limite de dépense mensuelle** dans *Limits*.
3. **API Keys → Create Key**, nommez-la `rh-master`, copiez-la. Elle commence par `sk-ant-`.
   Ne la collez nulle part ailleurs que dans Vercel (étape 3).

### 2. Projet Vercel

1. Allez sur [vercel.com](https://vercel.com), connectez-vous **avec GitHub**.
2. **Add New → Project**, choisissez le dépôt `rh-master`, puis **Import**.
3. Ne changez rien aux réglages de build (Next.js est détecté), mais **ne cliquez pas encore sur Deploy** : ouvrez d'abord *Environment Variables* (étape 3).

### 3. Variables d'environnement

Dans *Environment Variables* (ou plus tard : *Settings → Environment Variables*), ajoutez :

| Nom | Valeur | Rôle |
|---|---|---|
| `ANTHROPIC_API_KEY` | votre clé `sk-ant-…` | Obligatoire |
| `ACCES_CODES` | `CODE1:20,CODE2:20` (voir « Choisir les codes » ci-dessous) | Codes testeurs et leur nombre d'appels autorisés |
| `ADMIN_CODE` | un mot de passe long, à vous | Ouvre la page `/admin` |
| `LIMITE_JOUR` | ex. `150` | Plafond global d'appels par jour (protège votre budget) |

Facultatifs : `LIMITE_PAR_CODE` (limite par défaut d'un code écrit sans `:20`), `ANTHROPIC_MODEL` (par défaut `claude-opus-5-5`), `ANTHROPIC_EFFORT` (par défaut `high` ; `medium` est plus rapide et moins cher).

**Choisir les codes.** Ce dépôt est public : n'utilisez jamais un code cité dans un exemple, l'app refuse d'ailleurs ceux de la documentation. Prenez un code par testeur, d'au moins 8 caractères aléatoires après le prénom (par exemple `PRENOM-` suivi de 8 lettres et chiffres tirés au hasard), et ne le publiez nulle part.

Puis cliquez sur **Deploy**. Au bout d'une à deux minutes, Vercel affiche l'adresse de l'app (`https://rh-master-xxx.vercel.app`).

### 4. Base de données (retours et compteurs)

**Étape obligatoire.** Sans base, les compteurs repartent de zéro à chaque redémarrage du serveur et les plafonds ne protègent plus votre budget : en ligne, l'app refuse donc toute analyse et tout retour tant que la base n'est pas connectée (message « L'app n'est pas encore prête »). En local, `npm run dev` fonctionne sans base pour les essais (ou `AUTORISER_SANS_BASE=1` avec `npm start`).

1. Dans le projet Vercel : **Storage → Create Database → Upstash for Redis** (offre gratuite), région Europe (Frankfurt ou Paris).
2. **Connect Project** : choisissez `rh-master`. Vercel ajoute seul `KV_REST_API_URL` et `KV_REST_API_TOKEN`.
3. **Deployments → ⋯ → Redeploy** pour que l'app les prenne en compte.

La page `/admin` affiche un bandeau orange tant que la base n'est pas connectée.

### 5. Vérifier

1. Ouvrez l'app : l'exemple doit se parcourir sans code.
2. Cliquez sur **Analyser mon dossier**, saisissez un de vos codes, lancez un cas de recette.
3. Ouvrez `https://…/admin`, saisissez `ADMIN_CODE` : la consommation du code doit avoir augmenté.

---

### Région du serveur

Le fichier `vercel.json` place le serveur de l'app à Paris (`cdg1`) au lieu des États-Unis, région par défaut de Vercel : le CV transite par un serveur en Europe avant d'être envoyé à l'API Claude. Choisissez aussi une région européenne pour la base Upstash (étape 4).

### En cas d'erreur au premier essai

Si l'app affiche « L'app n'est pas encore configurée côté serveur », ouvrez dans Vercel **Deployments → (le dernier) → Logs** : la raison donnée par l'API Claude y est écrite (clé refusée, nom de modèle inconnu, réglage non accepté…). Le contenu du CV n'y figure jamais.

## Au quotidien

**Ajouter un testeur** : ajoutez `NOUVEAU-CODE:20` à `ACCES_CODES` dans Vercel, puis *Redeploy*. Donnez un code par personne : son retour est rattaché à son code et un nouvel envoi remplace le précédent (RG-A06).

**Lire les retours** : `https://…/admin`. Chaque retour contient l'utilité et la justesse du diagnostic (notes de 1 à 5), la recommandation à un proche, l'étape la plus utile et un commentaire ; jamais le CV. La page calcule les moyennes et le taux de recommandation, à comparer aux seuils du protocole de test.

**Modifier ce que dit Claude** : les consignes sont dans le dossier [`prompts/`](prompts/), en français. Modifiez-les sur GitHub (icône crayon) ; Vercel redéploie automatiquement. Lisez d'abord [`prompts/README.md`](prompts/README.md).

**Coût indicatif** (tarifs de novembre 2026, à vérifier dans la console Anthropic) :
- lecture recruteur : environ 0,05 à 0,15 € ;
- valeur marché + négociation : environ 0,05 à 0,15 € sans recherche web, 0,15 à 0,40 € avec ;
- donc **0,10 à 0,55 € par dossier complet**. Un plafond de 20 appels par code correspond à 4 à 6 dossiers.

Un « appel » décompté = une lecture recruteur, une estimation marché (recherche web comprise), une lecture de lien d'offre ou une retranscription de PDF scanné. Un appel qui échoue n'est pas décompté.

---

## Points d'attention

- **Données personnelles** : le CV et l'offre transitent par le serveur Vercel vers l'API Claude, sans être enregistrés ni journalisés par l'app. Avant une ouverture au grand public, il faudra une page de confidentialité (RGPD) mentionnant Anthropic et Vercel comme sous-traitants, et vérifier les conditions de conservation de l'API Anthropic.
- **Plan Vercel** : l'offre gratuite (Hobby) est réservée à un usage non commercial. Elle convient aux tests ; une version payante grand public demandera l'offre Pro.
- **Lien d'offre** : LinkedIn, Indeed et Welcome to the Jungle exigent une connexion. L'app le détecte et propose directement le copier-coller, sans consommer d'appel.
- **Recherche web** : quand aucune source fiable n'est trouvée, l'app revient à une estimation signalée comme telle (badge « Estimation »).
- **Risque hérité** : vérifier les clauses du contrat de travail avant toute offre payante.

---

## Pour les développeurs

```bash
npm install
cp .env.example .env.local   # puis remplissez au moins ANTHROPIC_API_KEY et ACCES_CODES
npm run dev                  # http://localhost:3000
npm run build                # vérifie types et build avant de pousser
```

| Dossier | Contenu |
|---|---|
| `app/page.tsx`, `components/` | Interface : parcours en 5 étapes (`App.tsx`), écrans de résultats (`Resultats.tsx`) |
| `app/admin/` | Page concepteur |
| `app/api/` | `analyse` (module 2), `marche` (modules 6 et 8), `offre` (APP-17), `transcrire` (PDF scanné), `retour` (APP-11), `acces`, `admin/retours` (APP-12) |
| `lib/server/claude.ts` | Seul fichier qui appelle l'API Claude (repli automatique en cas de refus, reprise des outils web) |
| `lib/server/acces.ts` | Codes d'invitation et plafonds |
| `lib/server/schemas.ts` | Formats JSON imposés à Claude (doivent correspondre à `prompts/*.md`) |
| `lib/normalize.ts` | Vérification champ par champ des réponses (RG-A05) |
| `lib/exemple.ts` | Exemple fictif pré-calculé (RG-A03) |
| `prompts/` | Consignes envoyées à Claude |
