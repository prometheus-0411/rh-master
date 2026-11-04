// APP-10 : fiche de synthèse en Markdown.
import type { Analyse, Dossier, Marche } from "./types";
import { SITUATIONS } from "./types";

export const k = (v: number) => `${Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k€`;

export function fiche(mode: "exemple" | "direct", i: Dossier, a: Analyse | null, m: Marche | null): string {
  const L: string[] = [];
  L.push(`# Fiche RH Master${mode === "exemple" ? " (exemple)" : ""}`, "");
  L.push(`Situation : ${SITUATIONS[i.type] || ""} · Zone : ${i.zone || "Lyon"}`, "");
  if (a) {
    L.push("## Lecture recruteur", "", `**Verdict :** ${a.verdict} (adéquation ${a.adequation}/100)`, "", a.lecture30s, "");
    L.push("**Forces**", ...a.forces.map((f) => `- ${f.point} (${f.preuve})`), "");
    L.push("**Signaux faibles**", ...a.signauxFaibles.map((s) => `- ${s.point} : ${s.lecture}`), "");
    L.push("**Écarts à traiter**", ...a.ecarts.map((e) => `- [${e.type === "competence" ? "compétence" : "présentation"}] ${e.ecart} → ${e.action}`), "");
    L.push("**Questions probables**", ...a.questionsProbables.map((q, n) => `${n + 1}. ${q.question} (vérifie : ${q.verifie})`), "");
    if (a.reformulation) L.push("**Accroche proposée**", "", `> ${a.reformulation}`, "");
  }
  if (m) {
    L.push("## Valeur marché", "");
    if (m.fourchette)
      L.push(
        `Fourchette ${m.sourcee ? "sourcée" : "estimée"} (${m.poste}, ${m.zone}) : ${k(m.fourchette.bas)} – ${k(m.fourchette.haut)}, médian ${k(m.fourchette.median)} brut annuel`,
      );
    L.push(`_${m.baseEstimation}_`, "");
    if (m.sources.length) L.push("**Sources**", ...m.sources.map((s) => `- [${s.titre}](${s.url})`), "");
    L.push(`Niveau perçu : ${m.niveauPercu}`, `Niveau visable : ${m.niveauVisable}`, "");
    L.push("## Négociation", "");
    if (m.ancrage.montant) L.push(`**Ancrage :** ${k(m.ancrage.montant)} brut annuel. ${m.ancrage.justification}`, "");
    L.push("**Ordre des arguments**", ...m.arguments.map((x, n) => `${n + 1}. ${x}`), "");
    L.push("**À dire**", ...m.aDire.map((x) => `- ${x}`), "", "**À éviter**", ...m.aEviter.map((x) => `- ${x}`), "");
    L.push("**Objections**", ...m.objections.flatMap((o) => [`- ${o.objection}`, `  → ${o.reponse}`]), "");
    if (m.avantages.length) L.push("**Leviers hors salaire**", ...m.avantages.map((x) => `- ${x}`), "");
    if (m.prochaineAction) L.push(`**Prochaine action :** ${m.prochaineAction}`, "");
  }
  L.push("---", "Généré avec RH Master (version test). Estimations à vérifier ; la décision reste la vôtre.");
  return L.join("\n");
}
