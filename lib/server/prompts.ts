// Assemble les consignes à partir des fichiers prompts/*.md.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Analyse, Dossier } from "../types";
import { SITUATIONS } from "../types";

export const MAX_CHAMP = 15000;

const cache = new Map<string, string>();
function fichier(nom: string): string {
  if (process.env.NODE_ENV === "production" && cache.has(nom)) return cache.get(nom)!;
  const t = readFileSync(path.join(process.cwd(), "prompts", `${nom}.md`), "utf8").trim();
  cache.set(nom, t);
  return t;
}

function remplir(modele: string, valeurs: Record<string, string>): string {
  return modele.replace(/\{\{([A-Z_]+)\}\}/g, (m, cle: string) => (cle in valeurs ? valeurs[cle] : m));
}

function blocDossier(d: Dossier): string {
  return `Situation : ${SITUATIONS[d.type] ?? SITUATIONS.candidature}. Zone : ${d.zone || "Lyon"}.
${d.actuel ? `Salaire actuel : ${d.actuel} k€ brut annuel.` : "Salaire actuel : non communiqué."}
${d.pretention ? `Prétention envisagée : ${d.pretention} k€ brut annuel.` : "Prétention : non communiquée."}

<cv>
${d.cv.slice(0, MAX_CHAMP)}
</cv>

<offre>
${d.offre.slice(0, MAX_CHAMP)}
</offre>`;
}

export function promptLecture(d: Dossier): string {
  return remplir(fichier("lecture"), { REGLES: fichier("regles"), DOSSIER: blocDossier(d) });
}

export function promptRecherche(d: Dossier, a: Analyse): string {
  return remplir(fichier("recherche-salaires"), {
    ZONE: d.zone || "Lyon",
    NIVEAU: a.verdict,
    OFFRE: d.offre.slice(0, MAX_CHAMP),
  });
}

export function promptMarche(d: Dossier, a: Analyse, notesWeb: string | null): string {
  const lecture = `Verdict : ${a.verdict}. Écarts : ${a.ecarts.map((e) => `${e.ecart} (${e.type})`).join(" ; ")}.`;
  const consigne = notesWeb
    ? `- Appuie la fourchette sur les repères de marché ci-dessous, trouvés par recherche web pour ce dossier. Cite dans "baseEstimation" les sources principales et leurs limites. N'ajoute aucun chiffre qui n'en découle pas.\n\n<reperes_marche>\n${notesWeb}\n</reperes_marche>`
    : `- Tu n'as accès à aucune donnée de marché en direct : donne une estimation réaliste pour la zone et dis-le dans "baseEstimation", avec une invitation à vérifier sur 3 ou 4 offres récentes.`;
  return remplir(fichier("marche"), {
    REGLES: fichier("regles"),
    CONSIGNE_DONNEES: consigne,
    DOSSIER: blocDossier(d),
    LECTURE: lecture,
  });
}

export const promptOffreLien = (url: string) => remplir(fichier("offre-lien"), { URL: url });
export const promptTranscription = () => fichier("transcription");
