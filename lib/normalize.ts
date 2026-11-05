// Vérification champ par champ des réponses de Claude (RG-A05).
// Toute valeur manquante ou mal formée est remplacée par une valeur sûre, jamais inventée.
import type { Analyse, Marche, NiveauPretention, Source } from "./types";

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v)).trim();
const arr = (v: unknown, n: number): unknown[] => (Array.isArray(v) ? v : []).slice(0, n);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
export const num = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const x = Number(String(v).replace(",", "."));
  return Number.isFinite(x) ? x : null;
};

export function normAnalyse(raw: unknown): Analyse {
  const r = obj(raw);
  const niv = r.verdictNiveau === "fort" || r.verdictNiveau === "faible" ? r.verdictNiveau : "moyen";
  const ad = Math.max(0, Math.min(100, Math.round(num(r.adequation) ?? 0)));
  return {
    verdict: str(r.verdict) || "[à compléter : verdict non fourni]",
    verdictNiveau: niv,
    adequation: ad,
    lecture30s: str(r.lecture30s),
    forces: arr(r.forces, 4).map(obj).map((o) => ({ point: str(o.point), preuve: str(o.preuve) })).filter((o) => o.point),
    signauxFaibles: arr(r.signauxFaibles, 4).map(obj).map((o) => ({ point: str(o.point), lecture: str(o.lecture) })).filter((o) => o.point),
    ecarts: arr(r.ecarts, 6)
      .map(obj)
      .map((o) => ({ ecart: str(o.ecart), type: o.type === "competence" ? ("competence" as const) : ("presentation" as const), action: str(o.action) }))
      .filter((o) => o.ecart),
    questionsProbables: arr(r.questionsProbables, 6).map(obj).map((o) => ({ question: str(o.question), verifie: str(o.verifie) })).filter((o) => o.question),
    reformulation: str(r.reformulation),
  };
}

/** Seuil au-delà duquel une prétention est jugée hors marché (en % au-dessus du haut de la fourchette). */
export const SEUIL_HORS_MARCHE = 15;

/** Classe une prétention par rapport à la fourchette : calcul fixe, pour ne pas dépendre de l'appréciation de l'IA. */
export function classerPretention(p: number, f: { bas: number; haut: number }): { niveau: NiveauPretention; ecartPct: number } {
  if (p < f.bas) return { niveau: "sous_evaluee", ecartPct: Math.round(((p - f.bas) / f.bas) * 100) };
  if (p <= f.haut) return { niveau: "realiste", ecartPct: 0 };
  const ecartPct = Math.round(((p - f.haut) / f.haut) * 100);
  return { niveau: ecartPct > SEUIL_HORS_MARCHE ? "hors_marche" : "ambitieuse", ecartPct };
}

const MESSAGE_DEFAUT: Record<NiveauPretention, string> = {
  sous_evaluee: "Votre prétention est sous le bas de la fourchette : vous vous sous-vendez.",
  realiste: "Votre prétention est dans la fourchette du marché.",
  ambitieuse: "Votre prétention dépasse le haut de la fourchette : elle se défend seulement avec des arguments précis.",
  hors_marche: "Votre prétention est hors marché : à ce niveau, un recruteur risque de clore l'échange.",
};

export function normMarche(raw: unknown, sources: Source[] = [], sourcee = false, pretention: number | null = null): Marche {
  const r = obj(raw);
  const f = obj(r.fourchette);
  const vals = [num(f.bas), num(f.median), num(f.haut)].filter((v): v is number => v != null).sort((x, y) => x - y);
  const strs = (v: unknown, n: number) => arr(v, n).map(str).filter(Boolean);
  const anc = obj(r.ancrage);
  const fourchette = vals.length === 3 ? { bas: vals[0], median: vals[1], haut: vals[2] } : null;
  const av = obj(r.avisPretention);
  const classe = pretention && fourchette ? classerPretention(pretention, fourchette) : null;
  return {
    poste: str(r.poste),
    zone: str(r.zone) || "Lyon",
    fourchette,
    baseEstimation: str(r.baseEstimation) || "Estimation sans données de marché consultées.",
    sourcee: sourcee && sources.length > 0,
    sources,
    niveauPercu: str(r.niveauPercu),
    niveauVisable: str(r.niveauVisable),
    avantages: strs(r.avantages, 5),
    avisPretention: classe
      ? {
          ...classe,
          // Si l'IA a classé autrement que le calcul, son message pourrait contredire le badge : message par défaut.
          message: (str(av.niveau) === classe.niveau && str(av.message)) || MESSAGE_DEFAUT[classe.niveau],
          cible: num(av.cible) || null,
        }
      : null,
    ancrage: { montant: num(anc.montant), justification: str(anc.justification) },
    arguments: strs(r.arguments, 5),
    aDire: strs(r.aDire, 4),
    aEviter: strs(r.aEviter, 4),
    objections: arr(r.objections, 4).map(obj).map((o) => ({ objection: str(o.objection), reponse: str(o.reponse) })).filter((o) => o.objection),
    prochaineAction: str(r.prochaineAction),
  };
}
